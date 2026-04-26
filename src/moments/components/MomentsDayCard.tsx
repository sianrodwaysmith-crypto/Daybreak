import type { Moment } from '../types'
import { MAX_PHOTOS_PER_DAY } from '../types'
import { copy } from '../copy'
import { fromISO } from '../core/dateHelpers'

interface Props {
  moment:    Moment
  /** When provided AND there's room under MAX_PHOTOS_PER_DAY, an empty
   *  hairline slot appears below the last photo. Tap to add another.
   *  Intentionally has no label, no icon, no copy — discovered by use,
   *  not signposted. Pass undefined to suppress (e.g. older days). */
  onAddMore?: () => void
}

/**
 * Read-only day card. The photo (or photos, when more than one was added)
 * stack vertically with the date and optional note below. When onAddMore is
 * provided and the day still has room, a quiet empty slot sits at the
 * bottom — no copy, no '+' icon, just an empty hairline-bordered rectangle.
 */
export function MomentsDayCard({ moment, onAddMore }: Props) {
  const date   = fromISO(moment.date)
  const photos = moment.photos && moment.photos.length > 0
    ? moment.photos
    : [moment.photoRef]
  const canAdd = !!onAddMore && photos.length < MAX_PHOTOS_PER_DAY

  return (
    <div className="moments-day-card">
      {photos.map((p, i) => (
        <div className="moments-day-photo" key={i}>
          <img src={p.identifier} alt="" />
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          className="moments-day-photo moments-day-photo-empty"
          onClick={onAddMore}
          aria-label="Add another photo"
        />
      )}

      <div className="moments-day-meta">
        <div className="moments-day-date">{copy.dayCard.dateLine(date)}</div>
        {moment.note && <div className="moments-day-note">{moment.note}</div>}
      </div>
    </div>
  )
}
