import type { Answer, Enrollment, Lesson, MasteryScore, Question } from '../types'
import { addDays, isoDate, todayISO } from './dateHelpers'

/* ====================================================================
   Simplified SM-2 spaced repetition.

   Each concept tag carries a MasteryScore: ease factor (1.3-2.5),
   interval in days, and next-review-due date. Right answer pushes the
   interval out and bumps ease; wrong answer resets to 1 day and drops
   ease. The next quiz pulls primarily from concepts whose next-review
   is due, with weakly-mastered concepts (ease < 1.8) prioritised.
==================================================================== */

const DEFAULT_EASE     = 2.5
const MIN_EASE         = 1.3
const WEAK_EASE_BOUND  = 1.8

function emptyMastery(concept: string): MasteryScore {
  const today = new Date()
  return {
    concept,
    ease:           DEFAULT_EASE,
    interval:       1,
    repetitions:    0,
    lastReviewedAt: today.toISOString(),
    nextReviewDue:  isoDate(addDays(today, 1)),
  }
}

/** Apply an answer to a concept's mastery and return the new score. */
export function applySm2(prev: MasteryScore | undefined, correct: boolean, concept: string): MasteryScore {
  const score = prev ?? emptyMastery(concept)
  const today = new Date()

  if (correct) {
    const reps = score.repetitions + 1
    // Standard SM-2 interval ramp: 1, 3, then ease-multiplied previous.
    const nextInterval = reps === 1 ? 1
                       : reps === 2 ? 3
                       : Math.round(score.interval * score.ease)
    const nextEase = Math.min(2.5, score.ease + 0.1)
    return {
      concept,
      ease:           nextEase,
      interval:       nextInterval,
      repetitions:    reps,
      lastReviewedAt: today.toISOString(),
      nextReviewDue:  isoDate(addDays(today, nextInterval)),
    }
  }

  return {
    concept,
    ease:           Math.max(MIN_EASE, score.ease - 0.2),
    interval:       1,
    repetitions:    0,
    lastReviewedAt: today.toISOString(),
    nextReviewDue:  isoDate(addDays(today, 1)),
  }
}

/** Apply an answer across every concept tag the question touches. */
export function recordAnswerToMastery(
  mastery: Record<string, MasteryScore>,
  question: Question,
  correct: boolean,
): Record<string, MasteryScore> {
  const next = { ...mastery }
  for (const concept of question.conceptTags) {
    next[concept] = applySm2(next[concept], correct, concept)
  }
  return next
}

/* ------------------------------------------------------------------
   Quiz composition.

   Day 1 of a new course has no review pool, so all 5 questions come
   from today's lesson. Later days mix today's lesson with review +
   weak-mastery picks. We shuffle within each bucket so the quiz feels
   varied rather than ordered by ease.
------------------------------------------------------------------ */

interface ComposeArgs {
  todaysLesson:    Lesson
  pastLessons:     Lesson[]      // lessons already completed in this course
  mastery:         Record<string, MasteryScore>
  desiredCount?:   number        // default 5
  rng?:            () => number  // injectable for tests
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function isDueToday(score: MasteryScore | undefined, todayIso: string): boolean {
  if (!score) return false
  return score.nextReviewDue <= todayIso
}

function isWeak(score: MasteryScore | undefined): boolean {
  if (!score) return false
  return score.ease < WEAK_EASE_BOUND
}

export function composeQuiz({
  todaysLesson, pastLessons, mastery, desiredCount = 5, rng = Math.random,
}: ComposeArgs): Question[] {
  const todayQs = todaysLesson.questions

  // Day 1: no review pool, pull entirely from today's lesson.
  if (pastLessons.length === 0) {
    return shuffle(todayQs, rng).slice(0, desiredCount)
  }

  // Build the review and weak-mastery pools from past lessons whose
  // concept tags are due or weakly mastered.
  const todayIso = todayISO()
  const pastQs   = pastLessons.flatMap(l => l.questions)

  const dueQs: Question[]  = []
  const weakQs: Question[] = []
  for (const q of pastQs) {
    const dueHit  = q.conceptTags.some(c => isDueToday(mastery[c], todayIso))
    const weakHit = q.conceptTags.some(c => isWeak(mastery[c]))
    if (weakHit)      weakQs.push(q)
    else if (dueHit)  dueQs.push(q)
  }

  // 1 question on today's content, 2-3 review, 1-2 weak picks.
  const out: Question[] = []
  const seen = new Set<string>()
  function take(pool: Question[], n: number) {
    for (const q of pool) {
      if (out.length >= desiredCount) return
      if (seen.has(q.id)) continue
      out.push(q); seen.add(q.id)
      if (out.length - n >= 0 && out.length >= desiredCount) return
    }
  }

  // 1 from today.
  take(shuffle(todayQs, rng), 1)
  // 2 weak.
  take(shuffle(weakQs, rng), 2)
  // 2 due.
  take(shuffle(dueQs, rng), 2)
  // Top up from anywhere if we're short (e.g. early in the course
  // when review/weak pools are thin).
  take(shuffle(pastQs, rng), desiredCount)
  // Last resort: more of today.
  take(shuffle(todayQs, rng), desiredCount)

  return out.slice(0, desiredCount)
}

/* ------------------------------------------------------------------
   Pure helpers used by the storage / hook layer.
------------------------------------------------------------------ */

export function deriveCurrentDay(enrollment: Enrollment): number {
  return enrollment.completedLessons.length + 1
}

export function correctAnswersToday(enrollment: Enrollment, lessonId: string): number {
  return enrollment.questionHistory.filter(a => a.lessonId === lessonId && a.correct).length
}

export function totalAnswersToday(enrollment: Enrollment, lessonId: string): number {
  return enrollment.questionHistory.filter(a => a.lessonId === lessonId).length
}

export function answersForLesson(enrollment: Enrollment, lessonId: string): Answer[] {
  return enrollment.questionHistory.filter(a => a.lessonId === lessonId)
}
