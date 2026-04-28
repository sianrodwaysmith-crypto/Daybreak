import { useMemo, useState } from 'react'
import { copy } from '../copy'
import { useLessons } from '../useLessons'
import { composeQuiz } from '../core/spacedRepetition'
import { LessonScreen } from './LessonScreen'
import { QuizScreen, type QuizAnswerOut } from './QuizScreen'
import { RecapScreen } from './RecapScreen'
import type { Course, Lesson, Question, Answer } from '../types'

/* ====================================================================
   LessonsFlow — the daily-loop state machine.
   Owns the transitions lesson → quiz → recap, composes the quiz
   questions when leaving the lesson screen, calls completeLesson on
   the way into the recap, and exposes a single onClose to the parent.
==================================================================== */

type Mode =
  | { kind: 'lesson' }
  | { kind: 'quiz'; questions: Question[]; lesson: Lesson; course: Course; dayNumber: number }
  | {
      kind:           'recap'
      lesson:         Lesson
      course:         Course
      dayNumber:      number
      correctCount:   number
      questionCount:  number
      bonusToday:     boolean
    }
  | { kind: 'unavailable' }

interface Props {
  userId?:   string
  onClose:   () => void
}

export function LessonsFlow({ userId = 'sian', onClose }: Props) {
  const lessons = useLessons(userId)
  const [mode, setMode] = useState<Mode | null>(null)

  // Resolve initial mode the first time state arrives. After completion
  // we keep showing the recap regardless of state changes.
  const initialMode: Mode = useMemo(() => {
    if (lessons.state.kind === 'ready') return { kind: 'lesson' }
    return { kind: 'unavailable' }
  }, [lessons.state.kind])

  const current = mode ?? initialMode

  function beginQuiz() {
    if (lessons.state.kind !== 'ready') return
    const { lesson, course, dayNumber } = lessons.state
    const completedIds = new Set(lessons.enrollment?.completedLessons ?? [])
    const pastLessons  = course.lessons.filter(l => completedIds.has(l.id))
    const questions = composeQuiz({
      todaysLesson: lesson,
      pastLessons,
      mastery:      lessons.enrollment?.conceptMastery ?? {},
      desiredCount: 5,
    })
    setMode({ kind: 'quiz', questions, lesson, course, dayNumber })
  }

  function handleAnswer(answer: Answer, conceptTags: string[]) {
    if (current.kind !== 'quiz') return
    void lessons.recordAnswer({ ...answer, lessonId: current.lesson.id }, conceptTags)
  }

  async function handleQuizComplete(outs: QuizAnswerOut[]) {
    if (current.kind !== 'quiz') return
    const correct = outs.filter(a => a.correct).length
    // Capture "did the user already finish another course's lesson
    // today" BEFORE we complete this one — completeLesson() will flip
    // hasCompletedToday true regardless of which is first.
    const bonusToday = lessons.hasCompletedToday
    await lessons.completeLesson(current.lesson.id)
    setMode({
      kind:          'recap',
      lesson:        current.lesson,
      course:        current.course,
      dayNumber:     current.dayNumber,
      correctCount:  correct,
      questionCount: outs.length,
      bonusToday,
    })
  }

  // The "tomorrow" peek on the recap reads from the freshly-incremented
  // enrollment after completion: index = completedLessons.length.
  const nextLesson = useMemo<Lesson | null>(() => {
    if (current.kind !== 'recap') return null
    const done = lessons.enrollment?.completedLessons.length ?? 0
    if (done >= current.course.totalDays) return null
    return current.course.lessons[done] ?? null
  }, [current, lessons.enrollment])

  /* ---------- Render ---------- */

  if (current.kind === 'unavailable') {
    return (
      <p className="lessons-flow-empty">
        {lessons.state.kind === 'done'      ? copy.tile.dayDone((lessons.enrollment?.completedLessons.length ?? 1)) :
         lessons.state.kind === 'completed' ? copy.tile.courseCompleteLine(lessons.activeCourse?.title ?? '') :
         lessons.state.kind === 'no_course' ? copy.tile.noCourseLine :
         copy.tile.sectionLabel}
      </p>
    )
  }

  if (current.kind === 'lesson' && lessons.state.kind === 'ready') {
    return (
      <LessonScreen
        lesson={lessons.state.lesson}
        course={lessons.state.course}
        dayNumber={lessons.state.dayNumber}
        onBeginQuiz={beginQuiz}
      />
    )
  }

  if (current.kind === 'quiz') {
    return (
      <QuizScreen
        questions={current.questions}
        onAnswer={handleAnswer}
        onComplete={handleQuizComplete}
      />
    )
  }

  if (current.kind === 'recap') {
    return (
      <RecapScreen
        lesson={current.lesson}
        course={current.course}
        dayNumber={current.dayNumber}
        totalDays={current.course.totalDays}
        correctCount={current.correctCount}
        questionCount={current.questionCount}
        nextLesson={nextLesson}
        bonusToday={current.bonusToday}
        onClose={onClose}
      />
    )
  }

  return null
}
