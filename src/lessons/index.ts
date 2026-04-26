/* ====================================================================
   Lessons — sealed module public API.
   Nothing outside /lessons should import from anywhere except this
   file. The module owns its own storage, types, components, and CSS.
==================================================================== */

import './styles.css'

import { getStorage } from './storage'
import type { Answer, UserProgress } from './types'

export { LessonsTile }            from './components/LessonsTile'
export { LessonsLibrary }         from './components/LessonsLibrary'
export { LessonScreen }           from './components/LessonScreen'
export { QuizScreen }             from './components/QuizScreen'
export { RecapScreen }            from './components/RecapScreen'
export { CourseSummaryScreen }    from './components/CourseSummaryScreen'
export { LessonsFlow }            from './components/LessonsFlow'
export { useLessons }             from './useLessons'

export type { Course, Lesson, Question, Enrollment, UserProgress, TileState, Answer, MasteryScore } from './types'

/* ------------------------------------------------------------------
   The async API surface listed in the spec. Thin wrappers around the
   storage interface so callers don't need to know whether the backend
   is local or remote.
------------------------------------------------------------------ */

export const lessons = {
  async getProgress(userId: string): Promise<UserProgress> {
    return getStorage().getProgress(userId)
  },

  async getTodaysLesson(userId: string) {
    const progress = await getStorage().getProgress(userId)
    if (!progress.activeCourseId) return null
    const course = await getStorage().getCourse(progress.activeCourseId)
    if (!course) return null
    const enrollment = progress.enrollments.find(e => e.courseId === progress.activeCourseId)
    if (!enrollment) return null
    if (enrollment.completedAt) return null
    return course.lessons[enrollment.completedLessons.length] ?? null
  },

  async recordAnswer(userId: string, courseId: string, answer: Answer, conceptTags: string[]) {
    return getStorage().recordAnswer(userId, courseId, answer, conceptTags)
  },

  async completeLesson(userId: string, courseId: string, lessonId: string) {
    return getStorage().completeLesson(userId, courseId, lessonId)
  },

  async switchActiveCourse(userId: string, courseId: string | null) {
    return getStorage().setActive(userId, courseId)
  },

  async enrollInCourse(userId: string, courseId: string) {
    return getStorage().enroll(userId, courseId)
  },
}

/* ------------------------------------------------------------------
   Author-side seam: a future flow that turns prose into a Course.
   Not implemented in v1; the seam exists so adding generation later
   is a no-touch change to the rest of the module.
------------------------------------------------------------------ */
export interface CourseAuthor {
  generateFromText(source: string, targetDays?: number): Promise<import('./types').Course>
  generateFromUrl(url: string,    targetDays?: number): Promise<import('./types').Course>
}
// TODO: implement in v2.
