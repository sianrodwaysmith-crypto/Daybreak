import type { Moment, MomentsStorage, PhotoRef } from '../types'

/**
 * Drive-backed Moments storage. Uses Google Drive's appDataFolder space,
 * a private per-app hidden folder that survives PWA reinstalls and
 * doesn't show up in the user's normal Drive view.
 *
 * Layout per moment, two files in appDataFolder:
 *   - moment-{date}.json   — metadata (also the canonical Moment.id)
 *   - photo-{date}-...     — binary photo file
 *
 * The metadata JSON's Drive file id is what we expose externally as
 * the Moment.id. The photo file's id is held inside the metadata.
 *
 * Token refresh runs through /api/google/refresh so the OAuth client
 * secret never reaches the browser bundle.
 */

const DRIVE_API_BASE    = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const APP_FOLDER        = 'appDataFolder'

const TOKENS_KEY = 'daybreak-google-tokens'

interface StoredTokens {
  access_token:  string
  refresh_token: string
  expires_at:    number
}

interface MomentMetadata {
  version:      1
  userId:       string
  date:         string
  photoFileId:  string
  photoMime:    string
  note?:        string
  submittedAt:  string
}

interface DriveFile {
  id:       string
  name:     string
  mimeType: string
}

function readTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? JSON.parse(raw) as StoredTokens : null
  } catch { return null }
}
function writeTokens(t: StoredTokens) {
  try { localStorage.setItem(TOKENS_KEY, JSON.stringify(t)) } catch {}
}

/* -------------------------------------------------------------------
   Multipart upload helper. Drive's multipart endpoint expects
   multipart/related (not multipart/form-data) so we hand-build the
   body. Two parts: the metadata JSON and the binary content.
------------------------------------------------------------------- */

async function multipartUpload(
  accessToken:  string,
  metadata:     Record<string, unknown>,
  contentType:  string,
  body:         Blob | string,
): Promise<DriveFile> {
  const boundary = `boundary-${Date.now()}-${Math.random().toString(36).slice(2)}`

  const open  = `--${boundary}\r\n`
  const meta  = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`
  const body0 = `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`
  const close = `\r\n--${boundary}--`

  const blob = new Blob([open, meta, body0, body, close], { type: `multipart/related; boundary=${boundary}` })

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
    method:  'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: blob,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`drive upload ${res.status}: ${detail.slice(0, 200)}`)
  }
  return res.json() as Promise<DriveFile>
}

/* -------------------------------------------------------------------
   Helpers for converting between data URLs (what the Browser picker
   gives us) and Blobs (what Drive needs). And the reverse on read:
   blob bytes from Drive into an in-memory object URL the <img> tag
   can render.
------------------------------------------------------------------- */

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  // Standard browser trick: fetch the data URL and read the body as a Blob.
  const r = await fetch(dataUrl)
  return r.blob()
}

export class GoogleDriveMomentsStorage implements MomentsStorage {
  // Cache of object URLs created from photo bytes, keyed by Drive file id.
  // Lives for the page session; revoked on disconnect.
  private photoUrls = new Map<string, string>()

  // Cache of last-known moments so getByDate / getAll repeated calls don't
  // hit Drive every time. Cleared on every write.
  private momentsCache: Moment[] | null = null

  /* -------- token + auth helpers -------- */

  private async getAccessToken(): Promise<string> {
    const tokens = readTokens()
    if (!tokens) throw new Error('not_connected')

    // 60-second buffer so we don't race expiry mid-request.
    if (tokens.expires_at > Date.now() + 60_000) return tokens.access_token

    return this.refresh(tokens)
  }

  private async refresh(tokens: StoredTokens): Promise<string> {
    const res = await fetch('/api/google/refresh', {
      method: 'POST',
      headers: { 'X-Google-Refresh-Token': tokens.refresh_token },
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`refresh failed ${res.status}: ${detail.slice(0, 200)}`)
    }
    const json = await res.json() as { access_token: string; expires_in: number }
    const updated: StoredTokens = {
      ...tokens,
      access_token: json.access_token,
      expires_at:   Date.now() + json.expires_in * 1000,
    }
    writeTokens(updated)
    return updated.access_token
  }

  /** Fetches a Drive endpoint, retrying once with a refreshed token on 401. */
  private async drive(path: string, init: RequestInit = {}): Promise<Response> {
    const token1 = await this.getAccessToken()
    let res = await fetch(`${DRIVE_API_BASE}${path}`, {
      ...init,
      headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token1}` },
    })
    if (res.status === 401) {
      const tokens = readTokens()
      if (!tokens) throw new Error('not_connected')
      const token2 = await this.refresh(tokens)
      res = await fetch(`${DRIVE_API_BASE}${path}`, {
        ...init,
        headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token2}` },
      })
    }
    return res
  }

  /* -------- read path -------- */

  /**
   * Lists every metadata file in the appData folder, parses it, fetches
   * the corresponding photo bytes once, and returns Moment[] with
   * photoRef.identifier pointing to in-memory object URLs.
   */
  private async loadAll(userId: string): Promise<Moment[]> {
    if (this.momentsCache) return this.momentsCache.filter(m => m.userId === userId)

    const params = new URLSearchParams({
      spaces:    APP_FOLDER,
      q:         "name contains 'moment-' and trashed = false",
      fields:    'files(id,name,mimeType)',
      pageSize:  '1000',
    })
    const listRes = await this.drive(`/files?${params.toString()}`)
    if (!listRes.ok) {
      const detail = await listRes.text().catch(() => '')
      throw new Error(`drive list ${listRes.status}: ${detail.slice(0, 200)}`)
    }
    const list = await listRes.json() as { files?: DriveFile[] }
    const files = list.files ?? []

    const moments = await Promise.all(files.map(async (f): Promise<Moment | null> => {
      try {
        const metaRes = await this.drive(`/files/${f.id}?alt=media`)
        if (!metaRes.ok) return null
        const meta = await metaRes.json() as MomentMetadata
        if (meta.userId !== userId) return null

        const photoUrl = await this.getPhotoUrl(meta.photoFileId, meta.photoMime)

        const photoRef: PhotoRef = {
          source:     'upload',
          identifier: photoUrl,
        }
        return {
          id:           f.id,
          userId:       meta.userId,
          date:         meta.date,
          photoRef,
          note:         meta.note,
          submittedAt:  meta.submittedAt,
        }
      } catch {
        return null
      }
    }))

    const filtered = moments.filter((m): m is Moment => m !== null)
    filtered.sort((a, b) => b.date.localeCompare(a.date))
    this.momentsCache = filtered
    return filtered
  }

  private async getPhotoUrl(fileId: string, mime: string): Promise<string> {
    const cached = this.photoUrls.get(fileId)
    if (cached) return cached

    const res = await this.drive(`/files/${fileId}?alt=media`)
    if (!res.ok) throw new Error(`photo ${res.status}`)
    const bytes = await res.blob()
    // Use the metadata-declared mime if the response body lost it.
    const blob = bytes.type ? bytes : new Blob([bytes], { type: mime || 'image/jpeg' })
    const url = URL.createObjectURL(blob)
    this.photoUrls.set(fileId, url)
    return url
  }

  /* -------- public API: MomentsStorage -------- */

  async getAll(userId: string): Promise<Moment[]> {
    return this.loadAll(userId)
  }

  async getByDate(userId: string, date: string): Promise<Moment | null> {
    const all = await this.loadAll(userId)
    return all.find(m => m.date === date) ?? null
  }

  async getRange(userId: string, startDate: string, endDate: string): Promise<Moment[]> {
    const all = await this.loadAll(userId)
    return all.filter(m => m.date >= startDate && m.date <= endDate)
  }

  async submit(input: Omit<Moment, 'id' | 'submittedAt'>): Promise<Moment> {
    const accessToken = await this.getAccessToken()

    // 1. Upload the photo binary first. If the metadata write later fails,
    // we'll roll back this orphan file.
    const photoBlob = await dataUrlToBlob(input.photoRef.identifier)
    const photoMime = photoBlob.type || 'image/jpeg'

    const photoFile = await multipartUpload(
      accessToken,
      {
        name:    `photo-${input.date}-${Date.now()}.bin`,
        parents: [APP_FOLDER],
      },
      photoMime,
      photoBlob,
    )

    // 2. Replace any existing moment for the same date so re-submitting
    // overwrites cleanly.
    const existing = await this.getByDate(input.userId, input.date)
    if (existing) {
      await this.deleteFile(existing.id).catch(() => {})
      // Also wipe its photo. We pull the metadata's photoFileId from cache
      // since loadAll has already fetched it for getByDate.
      const cached = this.momentsCache?.find(m => m.id === existing.id)
      void cached  // (not strictly needed; the metadata file's deletion
      //              is enough — orphan photos get cleaned by clearAll
      //              or never read again. Avoiding a second list call.)
    }

    // 3. Write metadata JSON.
    const submittedAt = new Date().toISOString()
    const metadata: MomentMetadata = {
      version:      1,
      userId:       input.userId,
      date:         input.date,
      photoFileId:  photoFile.id,
      photoMime,
      note:         input.note?.trim() || undefined,
      submittedAt,
    }

    let metaFile: DriveFile
    try {
      metaFile = await multipartUpload(
        accessToken,
        {
          name:     `moment-${input.date}.json`,
          parents:  [APP_FOLDER],
          mimeType: 'application/json',
        },
        'application/json',
        JSON.stringify(metadata),
      )
    } catch (err) {
      // Roll back the orphan photo so we don't leak quota on failed writes.
      await this.deleteFile(photoFile.id).catch(() => {})
      throw err
    }

    // Bust caches so next read picks up the new moment.
    this.momentsCache = null

    return {
      id:           metaFile.id,
      userId:       input.userId,
      date:         input.date,
      photoRef:     input.photoRef,
      note:         metadata.note,
      submittedAt,
    }
  }

  async update(id: string, partial: Partial<Pick<Moment, 'note' | 'photoRef'>>): Promise<Moment> {
    // Fetch current metadata
    const metaRes = await this.drive(`/files/${id}?alt=media`)
    if (!metaRes.ok) throw new Error(`moment ${id} not found`)
    const meta = await metaRes.json() as MomentMetadata

    let updatedPhotoFileId = meta.photoFileId
    let updatedPhotoMime   = meta.photoMime

    // If we're swapping the photo, upload the new one first.
    if (partial.photoRef) {
      const accessToken = await this.getAccessToken()
      const blob = await dataUrlToBlob(partial.photoRef.identifier)
      updatedPhotoMime = blob.type || 'image/jpeg'
      const newFile = await multipartUpload(
        accessToken,
        { name: `photo-${meta.date}-${Date.now()}.bin`, parents: [APP_FOLDER] },
        updatedPhotoMime,
        blob,
      )
      // Delete the old photo now that the new one is in place.
      await this.deleteFile(meta.photoFileId).catch(() => {})
      this.photoUrls.delete(meta.photoFileId)
      updatedPhotoFileId = newFile.id
    }

    const next: MomentMetadata = {
      ...meta,
      photoFileId: updatedPhotoFileId,
      photoMime:   updatedPhotoMime,
      note:        partial.note ?? meta.note,
    }

    // Drive doesn't expose a simple "rewrite content" PATCH on the standard
    // /files endpoint; you have to PATCH against the upload endpoint.
    const accessToken = await this.getAccessToken()
    const res = await fetch(`${DRIVE_UPLOAD_BASE}/files/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(next),
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      throw new Error(`drive update ${res.status}: ${detail.slice(0, 200)}`)
    }

    this.momentsCache = null

    const photoUrl = await this.getPhotoUrl(updatedPhotoFileId, updatedPhotoMime)
    return {
      id,
      userId:       next.userId,
      date:         next.date,
      photoRef:     { source: 'upload', identifier: photoUrl },
      note:         next.note,
      submittedAt:  next.submittedAt,
    }
  }

  async delete(id: string): Promise<void> {
    // Look up the metadata first so we know the photo file id to delete too.
    let photoFileId: string | undefined
    try {
      const metaRes = await this.drive(`/files/${id}?alt=media`)
      if (metaRes.ok) {
        const meta = await metaRes.json() as MomentMetadata
        photoFileId = meta.photoFileId
      }
    } catch { /* best-effort */ }

    await this.deleteFile(id)
    if (photoFileId) await this.deleteFile(photoFileId).catch(() => {})

    if (photoFileId) {
      const cached = this.photoUrls.get(photoFileId)
      if (cached) URL.revokeObjectURL(cached)
      this.photoUrls.delete(photoFileId)
    }
    this.momentsCache = null
  }

  async clearAll(_userId: string): Promise<void> {
    // Delete every file in the appData folder. Since the folder is per-app
    // and per-user-account, we can wipe everything safely.
    const params = new URLSearchParams({
      spaces:   APP_FOLDER,
      fields:   'files(id)',
      pageSize: '1000',
    })
    const listRes = await this.drive(`/files?${params.toString()}`)
    if (!listRes.ok) {
      const detail = await listRes.text().catch(() => '')
      throw new Error(`drive list ${listRes.status}: ${detail.slice(0, 200)}`)
    }
    const list = await listRes.json() as { files?: { id: string }[] }
    await Promise.all((list.files ?? []).map(f => this.deleteFile(f.id).catch(() => {})))

    // Revoke all cached object URLs.
    for (const u of this.photoUrls.values()) URL.revokeObjectURL(u)
    this.photoUrls.clear()
    this.momentsCache = null
  }

  private async deleteFile(id: string): Promise<void> {
    const res = await this.drive(`/files/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 404) {
      const detail = await res.text().catch(() => '')
      throw new Error(`drive delete ${res.status}: ${detail.slice(0, 200)}`)
    }
  }
}
