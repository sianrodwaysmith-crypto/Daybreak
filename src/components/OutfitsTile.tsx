import { useEffect, useState } from 'react'
import Modal from './Modal'
import { getStorage } from '../library/drawers/outfits/storage'
import { OutfitsDrawer } from '../library/drawers/outfits/components/OutfitsDrawer'

const USER_ID = 'sian'

/* ====================================================================
   OutfitsTile — full-width "bar" that sits on the home screen above
   the Moments tile. Deliberately doesn't render any photos on the
   home surface — the user wanted a tap-into entry point, not a public
   feed. Opens the full Outfits drawer in a modal on tap; refreshes
   the count when the modal closes.
==================================================================== */
export default function OutfitsTile() {
  const [count, setCount] = useState<number | null>(null)
  const [open,  setOpen]  = useState(false)

  async function refresh() {
    try {
      const list = await getStorage().list(USER_ID)
      setCount(list.length)
    } catch { setCount(null) }
  }

  // Refresh whenever the modal closes (added or deleted something) and
  // once on mount so the bar shows a count without waiting for a tap.
  useEffect(() => {
    if (!open) void refresh()
  }, [open])

  const meta =
    count == null ? 'Tap to open' :
    count === 0   ? 'Tap to add your first' :
    count === 1   ? '1 outfit logged' :
                    `${count} outfits logged`

  return (
    <>
      <button
        type="button"
        className="outfits-tile-bar"
        onClick={() => setOpen(true)}
        aria-label="Open outfits"
      >
        <span className="outfits-tile-eyebrow">outfits</span>
        <span className="outfits-tile-meta">{meta}</span>
        <span className="outfits-tile-chev" aria-hidden>→</span>
      </button>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Outfits"
        accent="var(--ink)"
      >
        <OutfitsDrawer onBack={() => setOpen(false)} />
      </Modal>
    </>
  )
}
