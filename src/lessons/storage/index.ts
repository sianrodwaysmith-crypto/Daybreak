import { MockLessonsStorage, type LessonsStorage } from './MockLessonsStorage'
import { ANTHROPIC_COURSE } from '../data/anthropicCourse'
import { INSURANCE_COURSE } from '../data/insuranceCourse'
import { AZTEC_COURSE }     from '../data/aztecCourse'
import { ROTHESAY_COURSE }  from '../data/rothesayCourse'

/* ====================================================================
   Storage factory + one-shot seeding.
   On first access we seed the bundled course(s) into local storage so
   the rest of the module can read everything through the same
   interface a real backend would expose.

   Courses are seeded individually so adding a course doesn't require
   re-seeding the others. Each course is saved only if a course with
   that id isn't already in storage — preserving any user progress.
==================================================================== */

let cached: LessonsStorage | null = null
let seedPromise: Promise<void> | null = null

function getInstance(): LessonsStorage {
  if (!cached) cached = new MockLessonsStorage()
  return cached
}

async function seedIfNeeded(storage: LessonsStorage): Promise<void> {
  const existing = await storage.listCourses()
  const existingIds = new Set(existing.map(c => c.id))

  for (const course of [ANTHROPIC_COURSE, INSURANCE_COURSE, AZTEC_COURSE, ROTHESAY_COURSE]) {
    if (!existingIds.has(course.id)) {
      await storage.saveCourse(course)
    }
  }
}

export function getStorage(): LessonsStorage {
  const s = getInstance()
  if (!seedPromise) seedPromise = seedIfNeeded(s)
  return s
}

/**
 * Awaitable handle on the seed. Callers that need to read courses or
 * progress immediately after construction must await this first —
 * otherwise their read can race ahead of the seed's writes and miss
 * any newly-shipped courses (the original symptom: only the existing
 * Anthropic course showed up after a version that added more).
 */
export function getSeedReady(): Promise<void> {
  if (!seedPromise) {
    const s = getInstance()
    seedPromise = seedIfNeeded(s)
  }
  return seedPromise
}

export type { LessonsStorage }
