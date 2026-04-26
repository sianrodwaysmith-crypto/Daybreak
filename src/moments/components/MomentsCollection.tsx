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
  const [moments, setMoments] = useState<Moment[]>([])
  const [loaded,  setLoaded]  = useState(false)
  const [active,  setActive]  = useState<Moment | null>(null)

  useEffect(() => {
    if (!isOpen) return
    let alive = true
    getStorage().getAll(userId).then(list => {
      if (alive) { setMoments(list); setLoaded(true) }
    })
    return () => { alive = false }
  }, [isOpen, userId])

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
