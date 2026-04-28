import { useMemo, useState } from 'react'
import { copy } from '../copy'
import { formatLongDate, relativeTouched } from '../core/dateHelpers'
import { useLessons } from '../useLessons'
import { ActiveCourseView } from './ActiveCourseView'
import { CourseSummaryScreen } from './CourseSummaryScreen'
import { LessonsFlow } from './LessonsFlow'
import type { Course, Enrollment } from '../types'

/* ====================================================================
   LessonsLibrary — the entry point reached via the tile's "all
   courses" link, or when the user taps Lessons after today's first
   lesson is already done.

   With multi-course enrolment, the model here is simpler:
   - All in-progress enrolments are listed in one section, sorted by
     lastEngagedAt descending. Each card shows a "last touched X"
     label and a "continue" affordance that drops the user straight
     into that course's next lesson.
   - Completed courses live in their own section below.
   - Unenrolled courses appear last as "Available".
==================================================================== */

type View =
  | { kind: 'list' }
  | { kind: 'completed'; courseId: string }
  | { kind: 'lesson';    courseId: string }    // drives directly into LessonsFlow

interface Props {
  userId?: string
}

export function LessonsLibrary({ userId = 'sian' }: Props) {
  const lessons = useLessons(userId)
  const [view, setView] = useState<View>({ kind: 'list' })

  const enrollments = lessons.progress?.enrollments ?? []
  const courses     = lessons.allCourses

  const enrolledIds = useMemo(
    () => new Set(enrollments.map(e => e.courseId)),
    [enrollments],
  )

  const inProgress = useMemo(() => {
    return enrollments
      .filter(e => !e.completedAt)
      .map(e => ({ course: courses.find(c => c.id === e.courseId) ?? null, enrollment: e }))
      .filter((x): x is { course: Course; enrollment: Enrollment } => x.course !== null)
      .sort((a, b) => {
        const at = a.enrollment.lastEngagedAt ?? a.enrollment.startedAt
        const bt = b.enrollment.lastEngagedAt ?? b.enrollment.startedAt
        return at < bt ? 1 : at > bt ? -1 : 0
      })
  }, [enrollments, courses])

  const completed = useMemo(() => {
    return enrollments
      .filter(e => !!e.completedAt)
      .map(e => ({ course: courses.find(c => c.id === e.courseId) ?? null, enrollment: e }))
      .filter((x): x is { course: Course; enrollment: Enrollment } => x.course !== null)
      .sort((a, b) => (b.enrollment.completedAt ?? '').localeCompare(a.enrollment.completedAt ?? ''))
  }, [enrollments, courses])

  const available = useMemo(
    () => courses.filter(c => !enrolledIds.has(c.id)),
    [courses, enrolledIds],
  )

  /* ---------- Drill-ins ---------- */

  if (view.kind === 'completed') {
    const c = courses.find(c => c.id === view.courseId)
    const e = enrollments.find(e => e.courseId === view.courseId)
    if (!c || !e) { setView({ kind: 'list' }); return null }
    return (
      <div className="lessons-library">
        <button className="lessons-library-back" onClick={() => setView({ kind: 'list' })}>← back</button>
        <CourseSummaryScreen
          course={c}
          enrollment={e}
          onAddToLibrary={() => setView({ kind: 'list' })}
          onChooseNext={()   => setView({ kind: 'list' })}
        />
      </div>
    )
  }

  if (view.kind === 'lesson') {
    return (
      <div className="lessons-library">
        <button
          type="button"
          className="lessons-library-back"
          onClick={() => setView({ kind: 'list' })}
        >← back</button>
        <LessonsFlow userId={userId} onClose={() => setView({ kind: 'list' })} />
      </div>
    )
  }

  /* ---------- List view ---------- */

  if (enrollments.length === 0 && available.length === 0) {
    return (
      <div className="lessons-library">
        <p className="lessons-library-empty">{copy.library.emptyTitle}</p>
        <p className="lessons-library-empty-sub">{copy.library.emptySub}</p>
      </div>
    )
  }

  async function handleEnroll(courseId: string) {
    await lessons.enrollAndActivate(courseId)
  }

  /**
   * Continue button on an in-progress card. We make the chosen course
   * "active" before opening LessonsFlow, because LessonsFlow reads
   * today's lesson from useLessons (which surfaces by recency); setting
   * active stamps lastEngagedAt and pulls the chosen course to the top
   * of the recency stack so LessonsFlow renders THAT course's day.
   */
  async function handleContinue(courseId: string) {
    await lessons.setActive(courseId)
    setView({ kind: 'lesson', courseId })
  }

  return (
    <div className="lessons-library">
      {inProgress.length > 0 && (
        <section className="lessons-library-section">
          <h3 className="lessons-library-heading">{copy.library.activeHeader}</h3>
          {inProgress.map(({ course, enrollment }) => {
            const day = enrollment.completedLessons.length + 1
            return (
              <article key={course.id} className="lessons-library-card is-active">
                <div className="lessons-library-card-row">
                  <span className="lessons-library-card-title">{course.title}</span>
                  <button
                    type="button"
                    className="lessons-library-continue"
                    onClick={() => handleContinue(course.id)}
                  >continue →</button>
                </div>
                <div className="lessons-library-card-meta">
                  {copy.library.dayProgress(day, course.totalDays)}
                  <span className="lessons-library-card-sep" aria-hidden> · </span>
                  <span className="lessons-library-card-touched">
                    last touched {relativeTouched(enrollment.lastEngagedAt ?? enrollment.startedAt)}
                  </span>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {completed.length > 0 && (
        <section className="lessons-library-section">
          <h3 className="lessons-library-heading">{copy.library.completedHeader}</h3>
          {completed.map(({ course, enrollment }) => (
            <button
              key={course.id}
              type="button"
              className="lessons-library-card is-completed"
              onClick={() => setView({ kind: 'completed', courseId: course.id })}
            >
              <span className="lessons-library-card-title">{course.title}</span>
              <span className="lessons-library-card-meta">
                {enrollment.completedAt
                  ? copy.library.completedBadge(formatLongDate(enrollment.completedAt.slice(0, 10)))
                  : ''}
              </span>
            </button>
          ))}
        </section>
      )}

      {available.length > 0 && (
        <section className="lessons-library-section">
          <h3 className="lessons-library-heading">{copy.library.availableHeader}</h3>
          {available.map(course => (
            <button
              key={course.id}
              type="button"
              className="lessons-library-card is-available"
              onClick={() => handleEnroll(course.id)}
            >
              <span className="lessons-library-card-title">{course.title}</span>
              <span className="lessons-library-card-meta">{course.description}</span>
            </button>
          ))}
        </section>
      )}
    </div>
  )
}

// ActiveCourseView is still part of the public API exports but no longer
// reached from this list view. Kept as a re-export consumer can mount.
export { ActiveCourseView }
