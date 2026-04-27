import { useState } from 'react'
import Modal from '../../components/Modal'
import { copy } from '../copy'
import { LibraryApp } from './LibraryApp'

/**
 * The single quiet entry point to Library. Sits below the morning
 * tiles with the same outer padding. The label is a frozen string —
 * no badge, no count, no growth over time. By design.
 */
export function LibraryFooterLink() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="library-footer-link-wrap">
        <button type="button" className="library-footer-link" onClick={() => setOpen(true)}>
          {copy.footerLink}
        </button>
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title=""
        accent="rgba(255,255,255,0.7)"
      >
        {open && <LibraryApp onClose={() => setOpen(false)} />}
      </Modal>
    </>
  )
}
