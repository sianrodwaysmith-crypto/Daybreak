import { copy } from '../copy'
import { LessonsIcon } from './icons'
import type { TileState } from '../types'

/* ====================================================================
   LessonsTile — the home-screen surface.
   Renders one of four states (loading / no_course / ready / done /
   completed). Every visible string comes from copy.ts; the tile owns
   no business logic of its own.

   Multi-course additions:
   - When the user has 2+ in-progress enrolments, a small italic-serif
     "switch course →" link sits bottom-right (alongside the existing
     "all courses" link). Tapping it opens the library directly.
   - In the "done" state the tile shows a quiet "Today's lesson done.
     More if you'd like." line, where "More if you'd like" is itself
     tappable to open the library. Never framed as a target/quota.
==================================================================== */

interface Props {
  state:                TileState
  /** In-progress enrolment count (excludes completed). >=2 enables the
   *  switch-course link. */
  activeEnrolmentCount: number
  onOpenLesson:         () => void
  onOpenLibrary:        () => void
}

export function LessonsTile({ state, activeEnrolmentCount, onOpenLesson, onOpenLibrary }: Props) {
  const showSwitchLink = activeEnrolmentCount >= 2

  return (
    <section className="lessons-tile">
      <div className="lessons-tile-head">
        <span className="lessons-tile-eyebrow">
          <span className="lessons-tile-icon" aria-hidden><LessonsIcon size={18} /></span>
          {copy.tile.sectionLabel}
        </span>
        {state.kind === 'ready' && (
          <span className="lessons-tile-mins">{copy.tile.minutes(state.lesson.estimatedMinutes)}</span>
        )}
      </div>

      {state.kind === 'loading' && (
        <div className="lessons-tile-skeleton" aria-hidden />
      )}

      {state.kind === 'no_course' && (
        <div className="lessons-tile-body">
          <div className="lessons-tile-line">{copy.tile.noCourseLine}</div>
          <div className="lessons-tile-sub">{copy.tile.noCourseSub}</div>
          <button className="lessons-tile-cta" onClick={onOpenLibrary}>
            {copy.tile.chooseCourse}
          </button>
        </div>
      )}

      {state.kind === 'ready' && (
        <div className="lessons-tile-body">
          <div className="lessons-tile-line">
            {copy.tile.dayHeadingLine(state.dayNumber, state.lesson.title)}
          </div>
          <div className="lessons-tile-sub">{copy.tile.courseTapLine(state.course.title)}</div>
          <button className="lessons-tile-cta" onClick={onOpenLesson}>
            {copy.tile.cta}
          </button>
        </div>
      )}

      {state.kind === 'done' && (
        <div className="lessons-tile-body">
          <div className="lessons-tile-line">{copy.tile.dayDone(state.dayNumber)}</div>
          {state.nextHook && (
            <div className="lessons-tile-sub">{copy.tile.tomorrow(state.nextHook)}</div>
          )}
          <p className="lessons-tile-bonus">
            {copy.tile.doneTodayLeading}{' '}
            <button
              type="button"
              className="lessons-tile-bonus-link"
              onClick={onOpenLibrary}
            >
              {copy.tile.doneTodayLink}
            </button>
          </p>
        </div>
      )}

      {state.kind === 'completed' && (
        <div className="lessons-tile-body">
          <div className="lessons-tile-line">{copy.tile.courseCompleteLine(state.course.title)}</div>
          <div className="lessons-tile-sub">{copy.tile.courseCompleteSub}</div>
          <button className="lessons-tile-cta" onClick={onOpenLibrary}>
            {copy.tile.chooseCourse}
          </button>
        </div>
      )}

      <div className="lessons-tile-foot">
        <button type="button" className="lessons-tile-library-link" onClick={onOpenLibrary}>
          {copy.tile.libraryLink}
        </button>
        {showSwitchLink && (
          <button type="button" className="lessons-tile-switch-link" onClick={onOpenLibrary}>
            {copy.tile.switchCourseLink}
          </button>
        )}
      </div>
    </section>
  )
}
