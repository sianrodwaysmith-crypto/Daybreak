import type { Outfit, OutfitsStorage, OutfitPhotoRef } from '../types'

/**
 * Drive-backed Outfits storage. Same shape as Moments' Drive backend:
 * appDataFolder space, multipart upload, /api/google/refresh for
 * token rotation, in-memory caches for both metadata and photo URLs.
 *
 * Layout per outfit, two files in appDataFolder:
 *   - outfit-{id}.json        — metadata (id is generated client-side)
 *   - outfit-photo-{id}.bin   — binary photo file
 *
 * The metadata JSON's Drive file id is what we expose externally as
 * Outfit.id. The photo file id is held inside the metadata.
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

interface OutfitMetadata {
  version:      1
  userId:       string
  date:         string
  photoFileId:  string
  photoMime:    string
  note?:        string
  capturedAt:   string
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

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const r = await fetch(dataUrl)
  return r.blob()
}

export class GoogleDriveOutfitsStorage implements OutfitsStorage {
  /** Object URLs created from photo bytes, keyed by Drive file id. */
  private photoUrls = new Map<string, string>()

  /** In-memory cache so repeated list() calls don't hit Drive every time. */
  private outfitsCache: Outfit[] | null = null

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

  private async loadAll(userId: string): Promise<Outfit[]> {
    if (this.outfitsCache) return this.outfitsCache.filter(o => o.userId === userId)

    const params = new URLSearchParams({
      spaces:    APP_FOLDER,
      q:         "name contains 'outfit-' and not name contains 'outfit-photo-' and trashed = false",
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

    const outfits = await Promise.all(files.map(async (f): Promise<Outfit | null> => {
      try {
        const metaRes = await this.drive(`/files/${f.id}?alt=media`)
        if (!metaRes.ok) return null
        const meta = await metaRes.json() as OutfitMetadata
        if (meta.userId !== userId) return null

        const photoUrl = await this.getPhotoUrl(meta.photoFileId, meta.photoMime)
        const photo: OutfitPhotoRef = { source: 'upload', identifier: photoUrl }

        return {
          id:         f.id,
          userId:     meta.userId,
          date:       meta.date,
          photo,
          note:       meta.note,
          capturedAt: meta.capturedAt,
        }
      } catch {
        return null
      }
    }))

    const filtered = outfits.filter((o): o is Outfit => o !== null)
    filtered.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
    this.outfitsCache = filtered
    return filtered
  }

  private async getPhotoUrl(fileId: string, mime: string): Promise<string> {
    const cached = this.photoUrls.get(fileId)
    if (cached) return cached

    const res = await this.drive(`/files/${fileId}?alt=media`)
    if (!res.ok) throw new Error(`photo ${res.status}`)
    const bytes = await res.blob()
    const blob = bytes.type ? bytes : new Blob([bytes], { type: mime || 'image/jpeg' })
    const url = URL.createObjectURL(blob)
    this.photoUrls.set(fileId, url)
    return url
  }

  /* -------- public API: OutfitsStorage -------- */

  async list(userId: string): Promise<Outfit[]> {
    return this.loadAll(userId)
  }

  async add(input: Omit<Outfit, 'id' | 'capturedAt'>): Promise<Outfit> {
    const accessToken = await this.getAccessToken()

    // 1. Upload the photo binary.
    const blob = await dataUrlToBlob(input.photo.identifier)
    const mime = blob.type || 'image/jpeg'
    const stamp = Date.now()
    const photoFile = await multipartUpload(
      accessToken,
      {
        name:    `outfit-photo-${stamp}.bin`,
        parents: [APP_FOLDER],
      },
      mime,
      blob,
    )

    // 2. Write metadata JSON. If this fails, roll back the photo upload.
    const capturedAt = new Date().toISOString()
    const metadata: OutfitMetadata = {
      version:     1,
      userId:      input.userId,
      date:        input.date,
      photoFileId: photoFile.id,
      photoMime:   mime,
      note:        input.note?.trim() || undefined,
      capturedAt,
    }

    let metaFile: DriveFile
    try {
      metaFile = await multipartUpload(
        accessToken,
        {
          name:     `outfit-${stamp}.json`,
          parents:  [APP_FOLDER],
          mimeType: 'application/json',
        },
        'application/json',
        JSON.stringify(metadata),
      )
    } catch (err) {
      await this.deleteFile(photoFile.id).catch(() => {})
      throw err
    }

    this.outfitsCache = null

    return {
      id:         metaFile.id,
      userId:     input.userId,
      date:       input.date,
      photo:      input.photo,
      note:       metadata.note,
      capturedAt,
    }
  }

  async update(id: string, partial: Partial<Pick<Outfit, 'note' | 'date' | 'photo'>>): Promise<Outfit> {
    const metaRes = await this.drive(`/files/${id}?alt=media`)
    if (!metaRes.ok) throw new Error(`outfit ${id} not found`)
    const meta = await metaRes.json() as OutfitMetadata

    let photoFileId = meta.photoFileId
    let photoMime   = meta.photoMime

    if (partial.photo) {
      const accessToken = await this.getAccessToken()
      const blob = await dataUrlToBlob(partial.photo.identifier)
      const mime = blob.type || 'image/jpeg'
      const file = await multipartUpload(
        accessToken,
        { name: `outfit-photo-${Date.now()}.bin`, parents: [APP_FOLDER] },
        mime,
        blob,
      )
      // Delete the old photo only after the new one is in place.
      await this.deleteFile(meta.photoFileId).catch(() => {})
      this.photoUrls.delete(meta.photoFileId)
      photoFileId = file.id
      photoMime   = mime
    }

    const next: OutfitMetadata = {
      version:     1,
      userId:      meta.userId,
      date:        partial.date ?? meta.date,
      photoFileId,
      photoMime,
      note:        partial.note ?? meta.note,
      capturedAt:  meta.capturedAt,
    }

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

    this.outfitsCache = null

    const photoUrl = await this.getPhotoUrl(photoFileId, photoMime)
    return {
      id,
      userId:     next.userId,
      date:       next.date,
      photo:      { source: 'upload', identifier: photoUrl },
      note:       next.note,
      capturedAt: next.capturedAt,
    }
  }

  async delete(id: string): Promise<void> {
    let photoFileId: string | null = null
    try {
      const metaRes = await this.drive(`/files/${id}?alt=media`)
      if (metaRes.ok) {
        const meta = await metaRes.json() as OutfitMetadata
        photoFileId = meta.photoFileId
      }
    } catch { /* best-effort */ }

    await this.deleteFile(id)
    if (photoFileId) {
      await this.deleteFile(photoFileId).catch(() => {})
      const cached = this.photoUrls.get(photoFileId)
      if (cached) URL.revokeObjectURL(cached)
      this.photoUrls.delete(photoFileId)
    }
    this.outfitsCache = null
  }

  async clearAll(_userId: string): Promise<void> {
    // Delete only outfit-related files (don't nuke the whole appData
    // folder — moments and other apps may share it).
    const params = new URLSearchParams({
      spaces:   APP_FOLDER,
      q:        "(name contains 'outfit-' or name contains 'outfit-photo-') and trashed = false",
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

    for (const u of this.photoUrls.values()) URL.revokeObjectURL(u)
    this.photoUrls.clear()
    this.outfitsCache = null
  }

  private async deleteFile(id: string): Promise<void> {
    const res = await this.drive(`/files/${id}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 404) {
      const detail = await res.text().catch(() => '')
      throw new Error(`drive delete ${res.status}: ${detail.slice(0, 200)}`)
    }
  }
}
