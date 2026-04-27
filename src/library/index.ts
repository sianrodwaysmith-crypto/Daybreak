/**
 * Library — sealed module.
 *
 * Curated reference content (Holidays, Outfits, Recipes, Restaurants,
 * Gifts, Reading) reachable from a single quiet footer link below the
 * morning tiles. Library is for things kept and considered — stores of
 * choice, not daily ritual.
 *
 * Hard rule: nothing outside src/library/ may import from anywhere
 * except this file. The module owns its own storage (localStorage keys
 * prefixed `library_`), its own UI, and its own state.
 */

import './styles.css'

export { LibraryFooterLink } from './components/LibraryFooterLink'
export { LibraryApp }        from './components/LibraryApp'

export const library = {
  // Library is largely self-contained. Intentionally minimal.
}
