import { copy } from '../copy'
import type { Course, Lesson } from '../types'

/* ====================================================================
   RecapScreen — the closing beat of the daily loop.
   Shows the day's takeaway (verbatim, so users see the same phrase
   twice), the day's accuracy, course progress, and a peek at
   tomorrow's lesson. No celebration. No streak. Just a clear record.
==================================================================== */

interface Props {
  lesson:        Lesson
  course:        Course
  dayNumber:     number
  totalDays:     number
  correctCount:  number
  questionCount: number
  nextLesson:    Lesson | null
  onClose:       () => void
}

export function RecapScreen({
  lesson, course, dayNumber, totalDays, correctCount, questionCount, nextLesson, onClose,
}: Props) {
  const finished = nextLesson === null

  return (
    <div className="recap-screen">
      <div className="recap-screen-label">{copy.recap.label(dayNumber)}</div>
      <h2 className="recap-screen-course">{course.title}</h2>

      <div className="recap-takeaway">
        <div className="recap-takeaway-label">{copy.recap.takeawayLabel}</div>
        <p className="recap-takeaway-text">{lesson.takeaway}</p>
      </div>

      <div className="recap-stats">
        <div className="recap-stat">
          <span className="recap-stat-label">{copy.recap.accuracyHeading}</span>
          <span className="recap-stat-value">{copy.recap.accuracyValue(correctCount, questionCount)}</span>
        </div>
        <div className="recap-stat-divider" aria-hidden />
        <div className="recap-stat">
          <span className="recap-stat-label">{copy.recap.progressHeading}</span>
          <span className="recap-stat-value">{copy.recap.progressValue(dayNumber, totalDays)}</span>
        </div>
      </div>

      {nextLesson && !finished && (
        <p className="recap-transition">
          {copy.recap.transitionLine(nextLesson.title, nextLesson.hook)}
        </p>
      )}
      {finished && (
        <p className="recap-transition">{copy.recap.finishedLine}</p>
      )}

      <div className="recap-foot">
        <button className="recap-cta" onClick={onClose}>{copy.recap.backCta}</button>
      </div>
    </div>
  )
}
