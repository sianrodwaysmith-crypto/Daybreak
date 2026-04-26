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

  const activeCourse = useMemo<Course | null>(() => {
    if (!progress?.activeCourseId) return null
    return courses.find(c => c.id === progress.activeCourseId) ?? null
  }, [progress, courses])

  const enrollment = useMemo<Enrollment | null>(() => {
    if (!progress?.activeCourseId) return null
    return progress.enrollments.find(e => e.courseId === progress.activeCourseId) ?? null
  }, [progress])

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
    if (!activeCourse) return
    await getStorage().recordAnswer(userId, activeCourse.id, answer, conceptTags)
    refresh()
  }, [userId, activeCourse, refresh])

  return {
    state,
    activeCourse,
    enrollment,
    todaysLesson,
    yesterdaysLesson,
    tomorrowsLesson,
    allCourses: courses,
    progress,
    refresh,
    enrollAndActivate,
    setActive:      setActiveFn,
    completeLesson: completeLessonFn,
    recordAnswer:   recordAnswerFn,
  }
}
