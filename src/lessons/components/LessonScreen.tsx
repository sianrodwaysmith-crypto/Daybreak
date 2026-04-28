import { useEffect, useState } from 'react'
import { copy } from '../copy'
import type { Course, Lesson } from '../types'

/* ====================================================================
   LessonScreen — full-screen lesson body with the 30-second dwell
   timer. Renders inside the standard Modal; the modal title carries
   the course / day / minutes header line. The "Begin quiz" button is
   disabled until the dwell timer expires. Intentional friction.
==================================================================== */

const DWELL_SECS = 30

interface Props {
  lesson:      Lesson
  course:      Course
  dayNumber:   number
  onBeginQuiz: () => void
}

export function LessonScreen({ lesson, course, dayNumber, onBeginQuiz }: Props) {
  const [secsLeft, setSecsLeft] = useState(DWELL_SECS)

  useEffect(() => {
    if (secsLeft <= 0) return
    const id = window.setTimeout(() => setSecsLeft(s => Math.max(0, s - 1)), 1000)
    return () => window.clearTimeout(id)
  }, [secsLeft])

  const ready = secsLeft <= 0
  // Each block is either a paragraph or a single diagram marker
  // ({{diagram:id}}) on its own line. We split on blank-line boundaries
  // and let the renderer dispatch.
  const blocks = lesson.body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  const DIAGRAM_RE = /^\{\{diagram:([a-z0-9-]+)\}\}$/i

  return (
    <div className="lesson-screen">
      <div className="lesson-screen-eyebrow">
        {copy.lesson.headerLine(course.title.toLowerCase(), dayNumber, course.totalDays, lesson.estimatedMinutes)}
      </div>
      <h1 className="lesson-screen-title">{lesson.title}</h1>

      <div className="lesson-screen-body">
        {blocks.map((block, i) => {
          const m = block.match(DIAGRAM_RE)
          if (m) {
            const diagram = lesson.diagrams?.find(d => d.id === m[1])
            if (diagram) {
              return (
                <figure key={i} className="lesson-diagram">
                  <div
                    className="lesson-diagram-svg"
                    // Diagram SVG is authored in module-internal course
                    // data, never user input.
                    dangerouslySetInnerHTML={{ __html: diagram.svg }}
                  />
                  {diagram.caption && (
                    <figcaption className="lesson-diagram-caption">{diagram.caption}</figcaption>
                  )}
                </figure>
              )
            }
            // Marker without a matching diagram — render nothing rather
            // than a broken {{...}} string.
            return null
          }
          return <p key={i}>{block}</p>
        })}
      </div>

      <p className="lesson-screen-takeaway">{lesson.takeaway}</p>

      <div className="lesson-screen-foot">
        <span className="lesson-screen-dwell">
          {ready ? copy.lesson.dwellReady : copy.lesson.dwellWaiting(secsLeft)}
        </span>
        <button
          className={`lesson-screen-cta${ready ? ' is-ready' : ''}`}
          onClick={onBeginQuiz}
          disabled={!ready}
        >
          {copy.lesson.beginQuiz}
        </button>
      </div>
    </div>
  )
}

/**
 * Helper for computing the modal title that pairs with this screen.
 * Lives next to the component so the parent can pass the right header
 * without duplicating the format string.
 */
export function lessonModalTitle(course: Course, dayNumber: number, lesson: Lesson): string {
  return copy.lesson.headerLine(course.title.toLowerCase(), dayNumber, course.totalDays, lesson.estimatedMinutes)
}
