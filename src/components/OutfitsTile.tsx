import { useState } from 'react'
import Modal from './Modal'
import { OutfitsDrawer } from '../library/drawers/outfits/components/OutfitsDrawer'
import { OutfitsIcon } from '../library/drawers/icons'

/* ====================================================================
   OutfitsTile — quiet full-width bar above the Moments tile. Just an
   icon + label + chevron; no count, no photos, nothing on the home
   surface. Tap opens the existing OutfitsDrawer inside a modal.
==================================================================== */
export default function OutfitsTile() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="outfits-tile-bar"
        onClick={() => setOpen(true)}
        aria-label="Open outfits"
      >
        <span className="outfits-tile-icon" aria-hidden><OutfitsIcon size={22} /></span>
        <span className="outfits-tile-eyebrow">outfits</span>
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
