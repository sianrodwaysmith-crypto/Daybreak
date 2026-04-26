import type { Moment } from '../types'
import { copy } from '../copy'
import { fromISO } from '../core/dateHelpers'

interface Props {
  moment: Moment
}

/**
 * Read-only day card. One photo big, italic-serif date below, optional
 * italic-serif note. No metadata, no edit affordances on the surface
 * (long-press handling is left to a future iteration).
 */
export function MomentsDayCard({ moment }: Props) {
  const date = fromISO(moment.date)
  return (
    <div className="moments-day-card">
      <div className="moments-day-photo">
        <img src={moment.photoRef.identifier} alt="" />
      </div>
      <div className="moments-day-meta">
        <div className="moments-day-date">{copy.dayCard.dateLine(date)}</div>
        {moment.note && <div className="moments-day-note">{moment.note}</div>}
      </div>
    </div>
  )
}
