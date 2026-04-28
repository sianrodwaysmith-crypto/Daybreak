import { useCallback, useEffect, useMemo, useState } from 'react'
import { getStorage } from './storage'
import { todayISO } from './core/dateHelpers'
import type { Answer, Course, Enrollment, Lesson, TileState, UserProgress } from './types'

/* ====================================================================
   useLessons — single source of truth for tile state, today's lesson,
   tomorrow's hook, and the mutation actions. The hook reloads from
   storage on every mutation so multiple components mounted at once
   stay in sync without a global state library.

   Idempotency: 'today's lesson done' is derived from
   `enrollment.lastCompletedDate === todayISO()`. Re-opening the app
   after completion does not advance the day until the local date
   actually rolls over.
==================================================================== */

export interface UseLessons {
  state:             TileState
  activeCourse:      Course | null
  enrollment:        Enrollment | null
  todaysLesson:      Lesson | null
  yesterdaysLesson:  Lesson | null
  tomorrowsLesson:   Lesson | null
  allCourses:        Course[]
  progress:          UserProgress | null
  /** True when the user has already completed at least one lesson on
   *  any enrolled course on the local calendar day. Drives "bonus"
   *  framing on subsequent same-day lessons. */
  hasCompletedToday: boolean
  /** Count of in-progress (non-completed) enrolments. The tile uses
   *  this to decide whether to show the 'switch course →' link. */
  activeEnrolmentCount: number
  refresh:           () => void
  enrollAndActivate: (courseId: string) => Promise<void>
  setActive:         (courseId: string | null) => Promise<void>
  completeLesson:    (lessonId: string) => Promise<void>
  recordAnswer:      (answer: Answer, conceptTags: string[]) => Promise<void>
}

export function useLessons(userId: string = 'sian'): UseLessons {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [courses,  setCourses]  = useState<Course[]>([])
  const [bump,     setBump]     = useState(0)

  const refresh = useCallback(() => setBump(b => b + 1), [])

  useEffect(() => {
    let alive = true
    const storage = getStorage()
    Promise.all([
      storage.getProgress(userId),
      storage.listCourses(),
    ]).then(([p, cs]) => {
      if (!alive) return
      setProgress(p)
      setCourses(cs)
    })
    return () => { alive = false }
  }, [userId, bump])

  // The "active" course for surfacing is the most recently engaged
  // enrolment that isn't completed. If everything is complete, we fall
  // back to whichever was finished last so the tile can render the
  // 'completed' state. The activeCourseId field is honoured as a tie-
  // breaker for backwards compatibility with progress that pre-dates
  // the lastEngagedAt migration.
  const enrollment = useMemo<Enrollment | null>(() => {
    if (!progress) return null
    if (progress.enrollments.length === 0) return null
    const ranked = [...progress.enrollments].sort((a, b) => {
      const aDone = !!a.completedAt
      const bDone = !!b.completedAt
      if (aDone !== bDone) return aDone ? 1 : -1
      const aT = a.lastEngagedAt ?? a.startedAt
      const bT = b.lastEngagedAt ?? b.startedAt
      if (aT !== bT) return aT < bT ? 1 : -1
      // Final tie-breaker: explicit activeCourseId wins.
      if (progress.activeCourseId === a.courseId) return -1
      if (progress.activeCourseId === b.courseId) return 1
      return 0
    })
    return ranked[0] ?? null
  }, [progress])

  const activeCourse = useMemo<Course | null>(() => {
    if (!enrollment) return null
    return courses.find(c => c.id === enrollment.courseId) ?? null
  }, [enrollment, courses])

  const completedCount = enrollment?.completedLessons.length ?? 0

  const todaysLesson = useMemo<Lesson | null>(() => {
    if (!activeCourse) return null
    if (completedCount >= activeCourse.totalDays) return null
    return activeCourse.lessons[completedCount] ?? null
  }, [activeCourse, completedCount])

  const yesterdaysLesson = useMemo<Lesson | null>(() => {
    if (!activeCourse || completedCount === 0) return null
    return activeCourse.lessons[completedCount - 1] ?? null
  }, [activeCourse, completedCount])

  const tomorrowsLesson = useMemo<Lesson | null>(() => {
    if (!activeCourse) return null
    if (completedCount + 1 >= activeCourse.totalDays) return null
    return activeCourse.lessons[completedCount + 1] ?? null
  }, [activeCourse, completedCount])

  const state: TileState = useMemo(() => {
    if (!progress) return { kind: 'loading' }
    if (!activeCourse || !enrollment) return { kind: 'no_course' }

    if (enrollment.completedAt) return { kind: 'completed', course: activeCourse }

    const doneToday = enrollment.lastCompletedDate === todayISO()
    if (doneToday && yesterdaysLesson) {
      return {
        kind:       'done',
        lesson:     yesterdaysLesson,
        course:     activeCourse,
        dayNumber:  completedCount,
        totalDays:  activeCourse.totalDays,
        nextHook:   tomorrowsLesson?.hook ?? null,
      }
    }

    if (todaysLesson) {
      return {
        kind:       'ready',
        lesson:     todaysLesson,
        course:     activeCourse,
        dayNumber:  completedCount + 1,
        totalDays:  activeCourse.totalDays,
      }
    }

    return { kind: 'completed', course: activeCourse }
  }, [progress, activeCourse, enrollment, completedCount, todaysLesson, yesterdaysLesson, tomorrowsLesson])

  const enrollAndActivate = useCallback(async (courseId: string) => {
    const storage = getStorage()
    await storage.enroll(userId, courseId)
    await storage.setActive(userId, courseId)
    refresh()
  }, [userId, refresh])

  const setActiveFn = useCallback(async (courseId: string | null) => {
    await getStorage().setActive(userId, courseId)
    refresh()
  }, [userId, refresh])

  const completeLessonFn = useCallback(async (lessonId: string) => {
    if (!activeCourse) return
    await getStorage().completeLesson(userId, activeCourse.id, lessonId)
    refresh()
  }, [userId, activeCourse, refresh])

  const recordAnswerFn = useCallback(async (answer: Answer, conceptTags: string[]) => {
    // Resolve the course from the answer's lessonId rather than the
    // currently-surfaced activeCourse. With multi-course enrolment a
    // user could be answering on a non-surfaced course (e.g. they
    // tapped 'switch course →' mid-flow) and we need to write the
    // mastery update to the right enrolment.
    const target = courses.find(c => c.lessons.some(l => l.id === answer.lessonId))
    if (!target) return
    await getStorage().recordAnswer(userId, target.id, answer, conceptTags)
    refresh()
  }, [userId, courses, refresh])

  const today = todayISO()
  const hasCompletedToday = !!progress?.enrollments.some(
    e => e.lastCompletedDate === today,
  )
  const activeEnrolmentCount = progress?.enrollments.filter(e => !e.completedAt).length ?? 0

  return {
    state,
    activeCourse,
    enrollment,
    todaysLesson,
    yesterdaysLesson,
    tomorrowsLesson,
    allCourses: courses,
    progress,
    hasCompletedToday,
    activeEnrolmentCount,
    refresh,
    enrollAndActivate,
    setActive:      setActiveFn,
    completeLesson: completeLessonFn,
    recordAnswer:   recordAnswerFn,
  }
}
