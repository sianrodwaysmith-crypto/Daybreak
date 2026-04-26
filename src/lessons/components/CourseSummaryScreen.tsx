import { copy } from '../copy'
import { formatLongDate } from '../core/dateHelpers'
import type { Course, Enrollment } from '../types'

/* ====================================================================
   CourseSummaryScreen — the screen the user lands on when a course
   completes, and the screen reachable later from the library by
   tapping any completed course.
   No certificate, no celebration. Just title, dates, and the journey.
==================================================================== */

interface Props {
  course:         Course
  enrollment:     Enrollment
  onAddToLibrary: () => void
  onChooseNext:   () => void
}

export function CourseSummaryScreen({ course, enrollment, onAddToLibrary, onChooseNext }: Props) {
  const completedDate = enrollment.completedAt
    ? formatLongDate(enrollment.completedAt.slice(0, 10))
    : ''

  return (
    <div className="lessons-summary">
      <div className="lessons-summary-label">{copy.summary.label}</div>
      <h2 className="lessons-summary-title">{course.title}</h2>
      <div className="lessons-summary-meta">
        {completedDate && (<span>{copy.summary.completedOn(completedDate)}</span>)}
        <span className="lessons-summary-meta-sep" aria-hidden>·</span>
        <span>{copy.summary.daysTotal(course.totalDays)}</span>
      </div>

      <section className="lessons-summary-journey">
        <div className="lessons-summary-journey-label">{copy.summary.journeyLabel}</div>
        <ul className="lessons-summary-list">
          {course.lessons.map(l => (
            <li key={l.id} className="lessons-summary-item">
              <span className="lessons-summary-day">{copy.active.takeawayDate(l.dayNumber)}</span>
              <span className="lessons-summary-text">{l.takeaway}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="lessons-summary-foot">
        <button type="button" className="lessons-summary-quiet"   onClick={onAddToLibrary}>{copy.summary.addToLibrary}</button>
        <button type="button" className="lessons-summary-primary" onClick={onChooseNext}>{copy.summary.chooseNext}</button>
      </div>
    </div>
  )
}
