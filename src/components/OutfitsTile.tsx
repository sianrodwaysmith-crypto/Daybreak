import { useEffect, useRef, useState } from 'react'
import { getStorage } from '../library/drawers/outfits/storage'
import type { Outfit, OutfitPhotoRef } from '../library/drawers/outfits/types'

const USER_ID = 'sian'
/** Hard cap matches the drawer — 10 MB so the upload doesn't stall on
 *  iOS PWA. Anything bigger gets rejected silently here (the drawer
 *  has the visible error path; the tile is a quick-add surface). */
const MAX_BYTES = 10 * 1024 * 1024
/** How many recent outfits to render in the horizontal strip on the
 *  home screen. Older ones are still browsable through the Library
 *  drawer. */
const MAX_TILE_THUMBS = 24

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload  = () => resolve(typeof r.result === 'string' ? r.result : '')
    r.onerror = () => reject(r.error ?? new Error('read failed'))
    r.readAsDataURL(file)
  })
}

/* ====================================================================
   OutfitsTile — full-width horizontal strip on the home screen, above
   the Moments tile. Quick-add via the leading "+" tile; tap any thumb
   to enlarge with a delete option. The full grid + drawer behaviour
   still lives under Library → Outfits.
==================================================================== */
export default function OutfitsTile() {
  const [outfits,  setOutfits]  = useState<Outfit[]>([])
  const [adding,   setAdding]   = useState(false)
  const [open,     setOpen]     = useState<Outfit | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function refresh() {
    try {
      const list = await getStorage().list(USER_ID)
      setOutfits(list.slice(0, MAX_TILE_THUMBS))
    } catch { /* swallow — tile is best-effort, full surface is the drawer */ }
  }

  useEffect(() => { void refresh() }, [])

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) return
    setAdding(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      const photo: OutfitPhotoRef = { source: 'upload', identifier: dataUrl }
      await getStorage().add({ userId: USER_ID, date: todayISO(), photo })
      await refresh()
    } catch { /* swallow */ }
    finally {
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
    } catch { /* swallow */ }
    finally { setDeleting(false) }
  }

  return (
    <section className="outfits-tile">
      <div className="outfits-tile-head">
        <span className="outfits-tile-eyebrow">outfits</span>
        {outfits.length > 0 && (
          <span className="outfits-tile-count">
            {outfits.length === 1 ? '1 outfit' : `${outfits.length} recent`}
          </span>
        )}
      </div>

      <div className="outfits-tile-strip">
        <button
          type="button"
          className="outfits-tile-add"
          onClick={() => fileInput.current?.click()}
          disabled={adding}
          aria-label="Add an outfit"
        >
          {adding ? '…' : '+'}
        </button>
        {outfits.map(o => (
          <button
            key={o.id}
            type="button"
            className="outfits-tile-thumb"
            onClick={() => setOpen(o)}
          >
            <img src={o.photo.identifier} alt="" loading="lazy" />
          </button>
        ))}
      </div>

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

      {open && (
        <div className="outfits-modal" onClick={() => setOpen(null)}>
          <div className="outfits-modal-card" onClick={e => e.stopPropagation()}>
            <img src={open.photo.identifier} alt="" className="outfits-modal-img" />
            <div className="outfits-modal-actions">
              <button type="button" className="library-link" onClick={() => setOpen(null)}>close</button>
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
    </section>
  )
}
