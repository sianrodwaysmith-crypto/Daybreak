/**
 * Journal data types. Module-internal — not exported from index.ts.
 * Other parts of the app must not import these. Treat the journal as
 * structurally invisible from outside this folder.
 */

export interface RoundupEntry {
  id:             string
  date:           string                 // ISO YYYY-MM-DD (local)
  whatHappened?:  string
  whatNoticed?:   string
  whatCarrying?:  string
  createdAt:      string
  updatedAt:      string
}

export type WorryStatus = 'sitting' | 'discussed' | 'still_sitting'

export interface WorryEntry {
  id:             string
  loggedDate:     string                 // ISO YYYY-MM-DD
  theMoment:      string
  whyItStuck:     string
  toBringUp?:     string
  status:         WorryStatus
  discussedDate?: string
  createdAt:      string
  updatedAt:      string
}

export interface JournalAuth {
  /**
   * PIN derivation parameters + the derived hash. Stored as a single
   * structured object so v2 can rotate iterations / algorithm without a
   * schema migration.
   */
  pinHash: {
    algorithm:  'PBKDF2-SHA256'
    iterations: number
    salt:       string                   // base64
    hash:       string                   // base64
  }
  failedAttempts: { at: string }[]       // for v2 rate limiting
  createdAt: string
}
