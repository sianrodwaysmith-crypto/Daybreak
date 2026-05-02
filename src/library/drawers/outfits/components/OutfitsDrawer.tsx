import { useEffect, useRef, useState } from 'react'
import { getStorage, isDriveBacked } from '../storage'
import type { Outfit, OutfitPhotoRef } from '../types'

interface Props {
  onBack: () => void
}

const USER_ID = 'sian'
/** Hard cap, mostly to prevent the user picking a 25 MB raw camera shot
 *  and stalling the upload. Drive itself caps at much larger but the
 *  PWA UX gets sad above ~10 MB. */
const MAX_BYTES = 10 * 1024 * 1024

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload  = () => resolve(typeof r.result === 'string' ? r.result : '')
    r.onerror = () => reject(r.error ?? new Error('read failed'))
    r.readAsDataURL(file)
  })
}

/**
 * OutfitsDrawer — list of past outfits + an Add button. Photo picker is
 * a plain <input type="file"> with image accept; on mobile this opens
 * the photos / camera chooser. Selected file is read as a data URL,
 * sent to the storage layer (Drive when connected, IndexedDB otherwise),
 * and the grid refreshes.
 */
export function OutfitsDrawer({ onBack }: Props) {
  const [outfits,  setOutfits]  = useState<Outfit[]>([])
  const [loading,  setLoading]  = useState(true)
  const [adding,   setAdding]   = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [open,     setOpen]     = useState<Outfit | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const driveBacked = isDriveBacked()

  async function refresh() {
    try {
      const list = await getStorage().list(USER_ID)
      setOutfits(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  useEffect(() => {
    let alive = true
    setLoading(true)
    getStorage()
      .list(USER_ID)
      .then(list => { if (alive) setOutfits(list) })
      .catch(e => { if (alive) setError(e instanceof Error ? e.message : String(e)) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      setError('Photo is too large (10 MB max). Try resizing first.')
      return
    }
    setError(null)
    setAdding(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      const photo: OutfitPhotoRef = { source: 'upload', identifier: dataUrl }
      await getStorage().add({
        userId: USER_ID,
        date:   todayISO(),
        photo,
      })
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setAdding(false)
      // Reset the input so picking the same file again still triggers change.
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      await getStorage().delete(id)
      setOpen(null)
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>← back</button>
        <button
          type="button"
          className="library-pill"
          onClick={() => fileInput.current?.click()}
          disabled={adding}
        >
          {adding ? 'Saving…' : '+ outfit'}
        </button>
      </header>

      <h2 className="library-h1">Outfits</h2>
      <p className="library-tagline">
        {driveBacked
          ? 'Snap what you wore. Saved to your Google Drive.'
          : 'Snap what you wore. Saved on this device — connect Google for cross-device sync.'}
      </p>

      {/* Hidden file input. Image-only; on mobile the OS sheet offers
          photo library, take photo, or browse files. */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) void handleFile(f)
        }}
      />

      {error && (
        <div className="outfits-error">{error}</div>
      )}

      {loading && (
        <div className="outfits-loading">Loading…</div>
      )}

      {!loading && outfits.length === 0 && !adding && (
        <div className="outfits-empty">
          <p>No outfits yet.</p>
          <p className="outfits-empty-sub">Tap <strong>+ outfit</strong> to add the first one.</p>
        </div>
      )}

      {!loading && outfits.length > 0 && (
        <div className="outfits-grid">
          {outfits.map(o => (
            <button
              key={o.id}
              type="button"
              className="outfits-card"
              onClick={() => setOpen(o)}
            >
              <img src={o.photo.identifier} alt="" className="outfits-card-img" loading="lazy" />
              <span className="outfits-card-date">{formatDate(o.date)}</span>
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="outfits-modal" onClick={() => setOpen(null)}>
          <div className="outfits-modal-card" onClick={e => e.stopPropagation()}>
            <img src={open.photo.identifier} alt="" className="outfits-modal-img" />
            <div className="outfits-modal-meta">
              <span className="outfits-modal-date">{formatDate(open.date)}</span>
              {open.note && <span className="outfits-modal-note">{open.note}</span>}
            </div>
            <div className="outfits-modal-actions">
              <button
                type="button"
                className="library-link"
                onClick={() => setOpen(null)}
              >close</button>
              <button
                type="button"
                className="outfits-modal-delete"
                onClick={() => handleDelete(open.id)}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
