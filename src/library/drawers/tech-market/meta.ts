import { copy } from './copy'
import { PLAYERS } from './players'

/**
 * Tech Market drawer meta-line. Player count is a static known
 * quantity (this is reference data, not user-edited), so the hook
 * doesn't need to do an async storage read.
 */
export function useTechMarketMetaLine(): string | null {
  return PLAYERS.length === 0 ? null : copy.meta(PLAYERS.length)
}
