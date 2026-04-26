import { useEffect, useState } from 'react'
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

/**
 * Reverse-chronological grid of every moment. Tap a thumbnail to open a
 * day card; tap the close on the day card to return to the grid.
 */
export function MomentsCollection({ isOpen, onClose, userId }: Props) {
  const [moments,    setMoments]    = useState<Moment[]>([])
  const [loaded,     setLoaded]     = useState(false)
  const [active,     setActive]     = useState<Moment | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [clearing,   setClearing]   = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let alive = true
    setLoaded(false)
    getStorage().getAll(userId).then(list => {
      if (alive) { setMoments(list); setLoaded(true) }
    })
    return () => { alive = false }
  }, [isOpen, userId])

  async function handleClear() {
    setClearing(true)
    try {
      await getStorage().clearAll(userId)
      setMoments([])
      setConfirming(false)
    } finally {
      setClearing(false)
    }
  }

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
              onClick={() => setConfirming(false)}
              disabled={clearing}
            >
              {copy.collection.clearCancel()}
            </button>
            <button
              type="button"
              className="moments-btn-danger"
              onClick={handleClear}
              disabled={clearing}
            >
              {copy.collection.clearCta()}
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
