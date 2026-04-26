import { useMemo, useState } from 'react'
import { copy } from '../copy'
import { formatLongDate } from '../core/dateHelpers'
import { useLessons } from '../useLessons'
import { ActiveCourseView } from './ActiveCourseView'
import { CourseSummaryScreen } from './CourseSummaryScreen'
import type { Course, Enrollment } from '../types'

/* ====================================================================
   LessonsLibrary — the entry point reached via the tile's "all
   courses" link. Shows three groups: active course (drill-in to
   ActiveCourseView), enrolled courses (tap to switch active),
   completed courses (drill-in to CourseSummary), and a final
   "Available" section listing courses the user has not enrolled in
   yet. Self-contained navigation via a small view-state machine.
==================================================================== */

type View =
  | { kind: 'list' }
  | { kind: 'active';    courseId: string }
  | { kind: 'completed'; courseId: string }

interface Props {
  userId?: string
}

export function LessonsLibrary({ userId = 'sian' }: Props) {
  const lessons = useLessons(userId)
  const [view, setView] = useState<View>({ kind: 'list' })
  const [pendingSwitch, setPendingSwitch] = useState<string | null>(null)

  const enrolledIds = useMemo(
    () => new Set((lessons.progress?.enrollments ?? []).map(e => e.courseId)),
    [lessons.progress],
  )

  const enrollments  = lessons.progress?.enrollments ?? []
  const courses      = lessons.allCourses
  const activeId     = lessons.progress?.activeCourseId ?? null

  const activeEntry: { course: Course; enrollment: Enrollment } | null = (() => {
    if (!activeId) return null
    const c = courses.find(c => c.id === activeId)
    const e = enrollments.find(e => e.courseId === activeId)
    if (!c || !e) return null
    return { course: c, enrollment: e }
  })()

  const otherEnrolled = enrollments
    .filter(e => e.courseId !== activeId && !e.completedAt)
    .map(e => ({ course: courses.find(c => c.id === e.courseId)!, enrollment: e }))
    .filter(x => x.course)
    .sort((a, b) => b.enrollment.startedAt.localeCompare(a.enrollment.startedAt))

  const completed = enrollments
    .filter(e => !!e.completedAt)
    .map(e => ({ course: courses.find(c => c.id === e.courseId)!, enrollment: e }))
    .filter(x => x.course)
    .sort((a, b) => (b.enrollment.completedAt ?? '').localeCompare(a.enrollment.completedAt ?? ''))

  const available = courses.filter(c => !enrolledIds.has(c.id))

  /* ---------- Drill-ins ---------- */

  if (view.kind === 'active') {
    const c = courses.find(c => c.id === view.courseId)
    const e = enrollments.find(e => e.courseId === view.courseId) ?? null
    if (!c) { setView({ kind: 'list' }); return null }
    return (
      <div className="lessons-library">
        <button className="lessons-library-back" onClick={() => setView({ kind: 'list' })}>← back</button>
        <ActiveCourseView course={c} enrollment={e} onSwitch={() => setView({ kind: 'list' })} />
      </div>
    )
  }

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

  function askSwitch(courseId: string) {
    setPendingSwitch(courseId)
  }
  async function confirmSwitch() {
    if (!pendingSwitch) return
    await lessons.setActive(pendingSwitch)
    setPendingSwitch(null)
  }
  function cancelSwitch() { setPendingSwitch(null) }

  return (
    <div className="lessons-library">
      {pendingSwitch && (
        <div className="lessons-library-confirm">
          <span>{copy.library.switchActive}</span>
          <span className="lessons-library-confirm-actions">
            <button onClick={cancelSwitch}>{copy.library.switchCancel}</button>
            <button className="is-primary" onClick={confirmSwitch}>{copy.library.switchConfirm}</button>
          </span>
        </div>
      )}

      {activeEntry && (
        <section className="lessons-library-section">
          <h3 className="lessons-library-heading">{copy.library.activeHeader}</h3>
          <button
            type="button"
            className="lessons-library-card is-active"
            onClick={() => setView({ kind: 'active', courseId: activeEntry.course.id })}
          >
            <span className="lessons-library-card-badge">{copy.library.activeBadge}</span>
            <span className="lessons-library-card-title">{activeEntry.course.title}</span>
            <span className="lessons-library-card-meta">
              {copy.library.dayProgress(
                activeEntry.enrollment.completedLessons.length + 1,
                activeEntry.course.totalDays,
              )}
            </span>
          </button>
        </section>
      )}

      {otherEnrolled.length > 0 && (
        <section className="lessons-library-section">
          <h3 className="lessons-library-heading">{copy.library.enrolledHeader}</h3>
          {otherEnrolled.map(({ course, enrollment }) => (
            <button
              key={course.id}
              type="button"
              className="lessons-library-card"
              onClick={() => askSwitch(course.id)}
            >
              <span className="lessons-library-card-title">{course.title}</span>
              <span className="lessons-library-card-meta">
                {copy.library.dayProgress(enrollment.completedLessons.length + 1, course.totalDays)}
              </span>
            </button>
          ))}
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
