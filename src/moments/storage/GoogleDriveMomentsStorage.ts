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

interface PhotoEntry { fileId: string; mime: string }

interface MomentMetadataV1 {
  version:      1
  userId:       string
  date:         string
  photoFileId:  string
  photoMime:    string
  note?:        string
  submittedAt:  string
}

interface MomentMetadataV2 {
  version:      2
  userId:       string
  date:         string
  /** Oldest first, max 3. */
  photos:       PhotoEntry[]
  note?:        string
  submittedAt:  string
}

type MomentMetadata = MomentMetadataV1 | MomentMetadataV2

function metadataPhotos(meta: MomentMetadata): PhotoEntry[] {
  if (meta.version === 2) return meta.photos
  return [{ fileId: meta.photoFileId, mime: meta.photoMime }]
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

        const entries = metadataPhotos(meta)
        const photos: PhotoRef[] = await Promise.all(entries.map(async (e) => ({
          source:     'upload' as const,
          identifier: await this.getPhotoUrl(e.fileId, e.mime),
        })))
        if (photos.length === 0) return null

        return {
          id:           f.id,
          userId:       meta.userId,
          date:         meta.date,
          photoRef:     photos[0],
          photos,
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

    // The new shape carries up to 3 photos. Older callers still pass photoRef
    // alone — fall back to that as a single-photo array.
    const photos: PhotoRef[] = (input.photos && input.photos.length > 0)
      ? input.photos
      : input.photoRef ? [input.photoRef] : []
    if (photos.length === 0) throw new Error('submit: no photo provided')

    // 1. Upload each photo binary in turn. If a later metadata write fails,
    //    we roll all of these back so we don't leak Drive quota.
    const uploadedEntries: PhotoEntry[] = []
    try {
      for (let i = 0; i < photos.length; i++) {
        const blob = await dataUrlToBlob(photos[i].identifier)
        const mime = blob.type || 'image/jpeg'
        const file = await multipartUpload(
          accessToken,
          {
            name:    `photo-${input.date}-${Date.now()}-${i}.bin`,
            parents: [APP_FOLDER],
          },
          mime,
          blob,
        )
        uploadedEntries.push({ fileId: file.id, mime })
      }
    } catch (err) {
      for (const e of uploadedEntries) await this.deleteFile(e.fileId).catch(() => {})
      throw err
    }

    // 2. Replace any existing moment for the same date so re-submitting
    //    overwrites cleanly. Also wipe its photo binaries to avoid orphans.
    const existing = await this.getByDate(input.userId, input.date)
    if (existing) {
      try {
        const oldRes = await this.drive(`/files/${existing.id}?alt=media`)
        if (oldRes.ok) {
          const oldMeta = await oldRes.json() as MomentMetadata
          for (const e of metadataPhotos(oldMeta)) {
            await this.deleteFile(e.fileId).catch(() => {})
          }
        }
      } catch { /* best-effort cleanup */ }
      await this.deleteFile(existing.id).catch(() => {})
    }

    // 3. Write v2 metadata JSON.
    const submittedAt = new Date().toISOString()
    const metadata: MomentMetadataV2 = {
      version:      2,
      userId:       input.userId,
      date:         input.date,
      photos:       uploadedEntries,
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
      for (const e of uploadedEntries) await this.deleteFile(e.fileId).catch(() => {})
      throw err
    }

    // Bust caches so next read picks up the new moment.
    this.momentsCache = null

    return {
      id:           metaFile.id,
      userId:       input.userId,
      date:         input.date,
      photoRef:     photos[0],
      photos,
      note:         metadata.note,
      submittedAt,
    }
  }

  async update(id: string, partial: Partial<Pick<Moment, 'note' | 'photoRef' | 'photos'>>): Promise<Moment> {
    // Fetch current metadata
    const metaRes = await this.drive(`/files/${id}?alt=media`)
    if (!metaRes.ok) throw new Error(`moment ${id} not found`)
    const meta = await metaRes.json() as MomentMetadata

    let entries: PhotoEntry[] = metadataPhotos(meta)

    // If the caller is swapping photos, upload all new ones and delete the
    // old binaries. Always migrates to v2 layout regardless of source meta.
    const newPhotos: PhotoRef[] | null =
      partial.photos ? partial.photos
      : partial.photoRef ? [partial.photoRef]
      : null
    if (newPhotos) {
      const accessToken = await this.getAccessToken()
      const uploaded: PhotoEntry[] = []
      try {
        for (let i = 0; i < newPhotos.length; i++) {
          const blob = await dataUrlToBlob(newPhotos[i].identifier)
          const mime = blob.type || 'image/jpeg'
          const file = await multipartUpload(
            accessToken,
            { name: `photo-${meta.date}-${Date.now()}-${i}.bin`, parents: [APP_FOLDER] },
            mime,
            blob,
          )
          uploaded.push({ fileId: file.id, mime })
        }
      } catch (err) {
        for (const e of uploaded) await this.deleteFile(e.fileId).catch(() => {})
        throw err
      }
      // Delete the old photos now that the new ones are in place.
      for (const e of entries) {
        await this.deleteFile(e.fileId).catch(() => {})
        this.photoUrls.delete(e.fileId)
      }
      entries = uploaded
    }

    const next: MomentMetadataV2 = {
      version:     2,
      userId:      meta.userId,
      date:        meta.date,
      photos:      entries,
      note:        partial.note ?? meta.note,
      submittedAt: meta.submittedAt,
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

    const photos: PhotoRef[] = await Promise.all(entries.map(async (e) => ({
      source:     'upload' as const,
      identifier: await this.getPhotoUrl(e.fileId, e.mime),
    })))
    return {
      id,
      userId:       next.userId,
      date:         next.date,
      photoRef:     photos[0],
      photos,
      note:         next.note,
      submittedAt:  next.submittedAt,
    }
  }

  async delete(id: string): Promise<void> {
    // Look up the metadata first so we know which photo files to delete too.
    let entries: PhotoEntry[] = []
    try {
      const metaRes = await this.drive(`/files/${id}?alt=media`)
      if (metaRes.ok) {
        const meta = await metaRes.json() as MomentMetadata
        entries = metadataPhotos(meta)
      }
    } catch { /* best-effort */ }

    await this.deleteFile(id)
    for (const e of entries) {
      await this.deleteFile(e.fileId).catch(() => {})
      const cached = this.photoUrls.get(e.fileId)
      if (cached) URL.revokeObjectURL(cached)
      this.photoUrls.delete(e.fileId)
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
