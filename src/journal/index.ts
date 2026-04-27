/**
 * Journal — sealed module.
 *
 * STRICT PRIVACY CONTRACT: nothing outside src/journal/ may import from
 * anywhere except this file. The exports below are the entire surface.
 *
 * There are intentionally NO data accessors here:
 *   - No journal.getRecentEntries()
 *   - No journal.getWorryCount()
 *   - No journal.search()
 *   - No journal.getLastWritten()
 *   - No exported storage instance, no exported types, no exported copy.
 *
 * Journal data is structurally invisible to every other part of Daybreak.
 * If a future task asks to surface "patterns" or "the worry count" in the
 * coach or the home grid, the answer is no. Don't add the seam.
 */

import './styles.css'
import { isUnlocked, lock } from './state'

export { JournalTile } from './components/JournalTile'
export { JournalApp }  from './components/JournalApp'

export const journal = {
  isUnlocked,
  lock,
}
