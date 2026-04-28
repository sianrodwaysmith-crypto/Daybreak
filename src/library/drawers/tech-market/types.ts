/**
 * Tech Market drawer types. Module-internal — not exported from the
 * Library public index.
 */

export type PlayerCategory = 'hyperscaler' | 'ai-lab' | 'application-platform'

export interface PlayerProfile {
  id:           string                 // 'aws', 'microsoft', etc.
  name:         string                 // 'Amazon Web Services'
  shortName:    string                 // 'AWS'
  category:     PlayerCategory
  oneLiner:     string                 // single-sentence positioning line
  /** Short factual snapshot — founded, scale, ownership, parent. */
  snapshot:     string
  /** 2-3 paragraphs on market position. */
  position:     string
  /** 2-3 paragraphs on flagship products / capabilities. */
  keyProducts:  string
  /** 1-2 paragraphs on rivalry and where the player overlaps with others. */
  competitors:  string
  /** 1-2 paragraphs on recent strategic moves of public note. */
  recentMoves:  string
}
