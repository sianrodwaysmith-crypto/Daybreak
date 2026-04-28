/* ====================================================================
   Lessons module — type definitions.
   Kept in one file so the whole shape of the module is visible at a
   glance. Everything inside /lessons references these types; nothing
   outside the module should ever need to.
==================================================================== */

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Question {
  id:           string
  prompt:       string
  options:      string[]      // exactly 4
  correctIndex: number
  explanation:  string        // shown after answer, 1-2 sentences
  difficulty:   Difficulty
  conceptTags:  string[]
}

export interface Lesson {
  id:               string
  dayNumber:        number
  title:            string
  hook:             string    // one-line preview, used as 'Tomorrow: {hook}'
  body:             string    // 150-250 words, plain prose with paragraph breaks
  takeaway:         string    // verbatim closing line, reused on recap card
  estimatedMinutes: number
  questions:        Question[]
  conceptTags:      string[]
}

export interface Course {
  id:          string
  title:       string
  description: string
  totalDays:   number
  lessons:     Lesson[]
  authoredAt:  string         // ISO
}

export interface Answer {
  questionId:     string
  lessonId:       string
  answeredAt:     string       // ISO
  selectedIndex:  number
  correct:        boolean
  responseTimeMs: number
}

export interface MasteryScore {
  concept:        string
  ease:           number       // SM-2 ease factor, 1.3-2.5
  interval:       number       // days until next review
  repetitions:    number
  lastReviewedAt: string
  nextReviewDue:  string       // ISO date
}

export interface Enrollment {
  courseId:         string
  startedAt:        string
  currentDay:       number     // derived from completedLessons.length + 1
  completedLessons: string[]   // lesson IDs in completion order
  questionHistory:  Answer[]
  conceptMastery:   Record<string, MasteryScore>
  completedAt:      string | null
  // Local-date string YYYY-MM-DD of the most recent completion. Used to
  // gate "next day" availability — re-opening the app the same day after
  // completing a lesson must not advance the user to tomorrow.
  lastCompletedDate: string | null
  // ISO timestamp of the user's most recent interaction with this
  // enrolment (lesson completed, question answered, or initial enrol).
  // Drives which course the tile surfaces when the user is in multiple
  // courses simultaneously. Optional for backwards-compat with stored
  // progress predating this field; the migration in storage backfills.
  lastEngagedAt?:    string
}

export interface UserProgress {
  userId:          string
  activeCourseId:  string | null
  enrollments:     Enrollment[]
  lastSessionAt:   string
}

/* ------------------------------------------------------------------
   Tile state machine. The home-screen tile flips through these as
   the day's lesson is opened, completed, and replaced by tomorrow's.
------------------------------------------------------------------ */

export type TileState =
  | { kind: 'no_course' }
  | { kind: 'ready';     lesson: Lesson; course: Course; dayNumber: number; totalDays: number }
  | { kind: 'done';      lesson: Lesson; course: Course; dayNumber: number; totalDays: number; nextHook: string | null }
  | { kind: 'completed'; course: Course }
  | { kind: 'loading' }
