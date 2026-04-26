import { useEffect, useRef, useState } from 'react'
import type { Moment } from '../types'
import { copy } from '../copy'
import { getStorage } from '../storage'
import { MomentsModal } from './MomentsModal'
import { MomentsDayCard } from './MomentsDayCard'

interface Props {
  isOpen:  boolean
  onClose: () => void
  userId:  string
}

const HOLD_MS = 1500

/**
 * Reverse-chronological grid of every moment. Tap a thumbnail to open a
 * day card; tap the close on the day card to return to the grid.
 *
 * The destructive Clear-collection action is two-gated:
 *   1. Tap a small underlined link to expand the warning card.
 *   2. Press AND HOLD the destructive button for 1500 ms; releasing
 *      early cancels and resets the progress bar. This makes the action
 *      foolproof against accidental taps.
 */
export function MomentsCollection({ isOpen, onClose, userId }: Props) {
  const [moments,    setMoments]    = useState<Moment[]>([])
  const [loaded,     setLoaded]     = useState(false)
  const [active,     setActive]     = useState<Moment | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [holding,    setHolding]    = useState(false)
  const [clearing,   setClearing]   = useState(false)
  const holdTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let alive = true
    setLoaded(false)
    getStorage().getAll(userId).then(list => {
      if (alive) { setMoments(list); setLoaded(true) }
    })
    return () => { alive = false }
  }, [isOpen, userId])

  // Reset any in-flight hold whenever the modal closes or the confirm
  // card collapses, so a half-pressed button can't fire later.
  useEffect(() => {
    if (!isOpen || !confirming) cancelHold()
  }, [isOpen, confirming])

  function startHold() {
    if (clearing) return
    setHolding(true)
    if (holdTimer.current != null) window.clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null
      setHolding(false)
      void runClear()
    }, HOLD_MS)
  }

  function cancelHold() {
    if (holdTimer.current != null) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    setHolding(false)
  }

  async function runClear() {
    setClearing(true)
    try {
      await getStorage().clearAll(userId)
      setMoments([])
      setConfirming(false)
    } finally {
      setClearing(false)
    }
  }

  const dangerLabel = clearing
    ? copy.collection.clearCtaDeleting()
    : holding
      ? copy.collection.clearCtaHolding()
      : copy.collection.clearCta()

  return (
    <MomentsModal isOpen={isOpen} onClose={onClose} title={copy.collection.title()}>
      {!loaded && <div className="moments-collection-loading" />}
      {loaded && moments.length === 0 && (
        <p className="moments-empty">{copy.collection.empty()}</p>
      )}
      {loaded && moments.length > 0 && (
        <div className="moments-collection-grid">
          {moments.map(m => (
            <button
              key={m.id}
              type="button"
              className="moments-thumb"
              onClick={() => setActive(m)}
              aria-label={m.date}
            >
              <img src={m.photoRef.identifier} alt="" />
            </button>
          ))}
        </div>
      )}

      {loaded && moments.length > 0 && !confirming && (
        <button
          type="button"
          className="moments-clear-link"
          onClick={() => setConfirming(true)}
        >
          {copy.collection.clearLink()}
        </button>
      )}

      {confirming && (
        <div className="moments-clear-confirm">
          <p className="moments-clear-warning">
            {copy.collection.clearConfirm(moments.length)}
          </p>
          <div className="moments-clear-actions">
            <button
              type="button"
              className="moments-btn-quiet"
              onClick={() => { cancelHold(); setConfirming(false) }}
              disabled={clearing}
            >
              {copy.collection.clearCancel()}
            </button>
            <button
              type="button"
              className={`moments-btn-danger moments-btn-hold${holding ? ' is-holding' : ''}`}
              disabled={clearing}
              onPointerDown={startHold}
              onPointerUp={cancelHold}
              onPointerLeave={cancelHold}
              onPointerCancel={cancelHold}
              // Prevent the default click handler from firing — we only fire
              // the destructive action when the hold timer completes.
              onClick={e => e.preventDefault()}
            >
              <span className="moments-btn-hold-fill" aria-hidden />
              <span className="moments-btn-hold-label">{dangerLabel}</span>
            </button>
          </div>
        </div>
      )}

      {active && (
        <MomentsModal
          isOpen={true}
          onClose={() => setActive(null)}
          title=""
        >
          <MomentsDayCard moment={active} />
        </MomentsModal>
      )}
    </MomentsModal>
  )
}
