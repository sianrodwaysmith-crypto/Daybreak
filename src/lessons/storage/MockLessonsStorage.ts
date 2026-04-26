import type { Answer, Course, Enrollment, MasteryScore, UserProgress } from '../types'
import { recordAnswerToMastery } from '../core/spacedRepetition'
import { todayISO } from '../core/dateHelpers'

/* ====================================================================
   localStorage-backed storage. The data here is small and structured
   text; localStorage is fine. A SupabaseLessonsStorage stub lives at
   the bottom of this file as the seam for a real backend later.
==================================================================== */

const COURSES_KEY  = 'daybreak-lessons-courses-v1'
const PROGRESS_KEY = (userId: string) => `daybreak-lessons-progress-v1-${userId}`

export interface LessonsStorage {
  getCourse(courseId: string):                  Promise<Course | null>
  listCourses():                                Promise<Course[]>
  saveCourse(course: Course):                   Promise<Course>
  getProgress(userId: string):                  Promise<UserProgress>
  saveProgress(progress: UserProgress):         Promise<UserProgress>
  recordAnswer(userId: string, courseId: string, answer: Answer, conceptTags: string[]): Promise<void>
  completeLesson(userId: string, courseId: string, lessonId: string): Promise<void>
  enroll(userId: string, courseId: string):     Promise<void>
  setActive(userId: string, courseId: string | null): Promise<void>
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch { return fallback }
}
function writeJson(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* quota/disabled — drop silently */ }
}

function emptyProgress(userId: string): UserProgress {
  return {
    userId,
    activeCourseId: null,
    enrollments:    [],
    lastSessionAt:  new Date().toISOString(),
  }
}

export class MockLessonsStorage implements LessonsStorage {

  async listCourses(): Promise<Course[]> {
    return readJson<Course[]>(COURSES_KEY, [])
  }

  async getCourse(courseId: string): Promise<Course | null> {
    const all = await this.listCourses()
    return all.find(c => c.id === courseId) ?? null
  }

  async saveCourse(course: Course): Promise<Course> {
    const all = await this.listCourses()
    const idx = all.findIndex(c => c.id === course.id)
    if (idx >= 0) all[idx] = course
    else          all.push(course)
    writeJson(COURSES_KEY, all)
    return course
  }

  async getProgress(userId: string): Promise<UserProgress> {
    return readJson<UserProgress>(PROGRESS_KEY(userId), emptyProgress(userId))
  }

  async saveProgress(progress: UserProgress): Promise<UserProgress> {
    const next = { ...progress, lastSessionAt: new Date().toISOString() }
    writeJson(PROGRESS_KEY(progress.userId), next)
    return next
  }

  async enroll(userId: string, courseId: string): Promise<void> {
    const progress = await this.getProgress(userId)
    if (progress.enrollments.some(e => e.courseId === courseId)) {
      // Already enrolled — just make active if nothing is.
      if (!progress.activeCourseId) progress.activeCourseId = courseId
      await this.saveProgress(progress)
      return
    }
    const enrollment: Enrollment = {
      courseId,
      startedAt:         new Date().toISOString(),
      currentDay:        1,
      completedLessons:  [],
      questionHistory:   [],
      conceptMastery:    {},
      completedAt:       null,
      lastCompletedDate: null,
    }
    progress.enrollments.push(enrollment)
    if (!progress.activeCourseId) progress.activeCourseId = courseId
    await this.saveProgress(progress)
  }

  async setActive(userId: string, courseId: string | null): Promise<void> {
    const progress = await this.getProgress(userId)
    progress.activeCourseId = courseId
    await this.saveProgress(progress)
  }

  async recordAnswer(userId: string, courseId: string, answer: Answer, conceptTags: string[]): Promise<void> {
    const progress   = await this.getProgress(userId)
    const enrollment = progress.enrollments.find(e => e.courseId === courseId)
    if (!enrollment) return

    enrollment.questionHistory.push(answer)
    enrollment.conceptMastery = recordAnswerToMastery(
      enrollment.conceptMastery,
      // We pass a synthetic question so SM-2 sees the concept tags.
      // Only conceptTags + the correctness flag matter for mastery.
      { id: answer.questionId, prompt: '', options: [], correctIndex: 0, explanation: '', difficulty: 'medium', conceptTags },
      answer.correct,
    ) as Record<string, MasteryScore>

    await this.saveProgress(progress)
  }

  async completeLesson(userId: string, courseId: string, lessonId: string): Promise<void> {
    const progress   = await this.getProgress(userId)
    const enrollment = progress.enrollments.find(e => e.courseId === courseId)
    if (!enrollment) return
    if (enrollment.completedLessons.includes(lessonId)) return

    enrollment.completedLessons.push(lessonId)
    enrollment.currentDay        = enrollment.completedLessons.length + 1
    enrollment.lastCompletedDate = todayISO()

    const course = await this.getCourse(courseId)
    if (course && enrollment.completedLessons.length >= course.totalDays) {
      enrollment.completedAt = new Date().toISOString()
    }

    await this.saveProgress(progress)
  }
}

/* ------------------------------------------------------------------
   TODO: implement in v2 — talks to whatever real backend lands.
------------------------------------------------------------------ */
export class SupabaseLessonsStorage implements LessonsStorage {
  async getCourse(_id: string)               { throw new Error('not implemented'); return null as unknown as Course }
  async listCourses()                        { throw new Error('not implemented'); return [] as Course[] }
  async saveCourse(_c: Course)               { throw new Error('not implemented'); return _c }
  async getProgress(_u: string)              { throw new Error('not implemented'); return null as unknown as UserProgress }
  async saveProgress(_p: UserProgress)       { throw new Error('not implemented'); return _p }
  async recordAnswer(_u: string, _c: string, _a: Answer, _t: string[]) { throw new Error('not implemented') }
  async completeLesson(_u: string, _c: string, _l: string)              { throw new Error('not implemented') }
  async enroll(_u: string, _c: string)                                  { throw new Error('not implemented') }
  async setActive(_u: string, _c: string | null)                        { throw new Error('not implemented') }
}
