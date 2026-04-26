import { MockLessonsStorage, type LessonsStorage } from './MockLessonsStorage'
import { ANTHROPIC_COURSE } from '../data/anthropicCourse'

/* ====================================================================
   Storage factory + one-shot seeding.
   On first access we seed the bundled course(s) into local storage so
   the rest of the module can read everything through the same
   interface a real backend would expose.
==================================================================== */

let cached: LessonsStorage | null = null
let seedPromise: Promise<void> | null = null

function getInstance(): LessonsStorage {
  if (!cached) cached = new MockLessonsStorage()
  return cached
}

async function seedIfNeeded(storage: LessonsStorage): Promise<void> {
  const existing = await storage.listCourses()
  if (!existing.find(c => c.id === ANTHROPIC_COURSE.id)) {
    await storage.saveCourse(ANTHROPIC_COURSE)
  }
}

export function getStorage(): LessonsStorage {
  const s = getInstance()
  if (!seedPromise) seedPromise = seedIfNeeded(s)
  return s
}

export type { LessonsStorage }
