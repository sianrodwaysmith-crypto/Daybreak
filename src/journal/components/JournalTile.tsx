import { useState } from 'react'
import Tile from '../../components/Tile'
import Modal from '../../components/Modal'
import { JournalIcon } from '../../components/icons'
import { copy } from '../copy'
import * as journalState from '../state'
import { JournalApp } from './JournalApp'

/**
 * Public tile component for the home grid.
 *
 * The brief is explicit: the tile reveals nothing about the journal's
 * contents. No subtitle, no entry counts, no last-written timestamp,
 * no badge. Only the icon and the word "Journal".
 */
export function JournalTile() {
  const [open, setOpen] = useState(false)

  // Every close path locks the module — closing the modal is the same
  // as an auto-lock event for the privacy contract. Re-entry always
  // requires PIN re-verification.
  function close() {
    journalState.lock()
    setOpen(false)
  }

  return (
    <>
      <Tile
        icon={<JournalIcon />}
        title={copy.tile.label}
        accent="#94a3b8"
        onClick={() => setOpen(true)}
      />
      <Modal
        isOpen={open}
        onClose={close}
        title=""
        accent="rgba(255,255,255,0.7)"
      >
        {open && <JournalApp onClose={close} />}
      </Modal>
    </>
  )
}
