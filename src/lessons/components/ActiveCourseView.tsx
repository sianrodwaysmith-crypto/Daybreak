import { useState } from 'react'
import { copy } from '../copy'
import type { Course, Enrollment, Lesson } from '../types'

/* ====================================================================
   ActiveCourseView — the "what have I learned so far" view, opened
   from the library when you tap your active course.
   Shows: course title + description, progress bar across all days,
   the list of takeaways from completed lessons, and an inline-
   expandable lesson body when you tap a takeaway.
==================================================================== */

interface Props {
  course:        Course
  enrollment:    Enrollment | null
  onSwitch:      () => void
}

export function ActiveCourseView({ course, enrollment, onSwitch }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)

  const completedIds = enrollment?.completedLessons ?? []
  const completedSet = new Set(completedIds)
  const total        = course.totalDays
  const done         = completedIds.length

  const completedLessons: Lesson[] = course.lessons.filter(l => completedSet.has(l.id))

  return (
    <div className="lessons-active-view">
      <header className="lessons-active-head">
        <h2 className="lessons-active-title">{course.title}</h2>
        <p className="lessons-active-desc">{course.description}</p>
      </header>

      <div className="lessons-progress" aria-label={copy.active.progressLabel(done, total)}>
        {course.lessons.map((l, i) => {
          const isDone = completedSet.has(l.id)
          const isCurrent = i === done && !enrollment?.completedAt
          return (
            <span
              key={l.id}
              className={`lessons-progress-seg${isDone ? ' is-done' : ''}${isCurrent ? ' is-current' : ''}`}
            />
          )
        })}
      </div>
      <div className="lessons-progress-label">{copy.active.progressLabel(done, total)}</div>

      <section className="lessons-takeaways">
        <div className="lessons-takeaways-label">{copy.active.takeawaysLabel}</div>
        {completedLessons.length === 0 ? (
          <p className="lessons-takeaways-empty">{copy.active.nothingYet}</p>
        ) : (
          <ul className="lessons-takeaway-list">
            {completedLessons.map(l => {
              const open = openId === l.id
              return (
                <li key={l.id} className={`lessons-takeaway-item${open ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="lessons-takeaway-button"
                    onClick={() => setOpenId(open ? null : l.id)}
                  >
                    <span className="lessons-takeaway-day">{copy.active.takeawayDate(l.dayNumber)}</span>
                    <span className="lessons-takeaway-text">{l.takeaway}</span>
                  </button>
                  {open && (
                    <div className="lessons-takeaway-body">
                      <h3 className="lessons-takeaway-body-title">{l.title}</h3>
                      {l.body.split(/\n\s*\n/).map((p, i) => (
                        <p key={i}>{p.trim()}</p>
                      ))}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="lessons-active-foot">
        <button type="button" className="lessons-active-switch" onClick={onSwitch}>
          {copy.active.switchCourse}
        </button>
      </div>
    </div>
  )
}
