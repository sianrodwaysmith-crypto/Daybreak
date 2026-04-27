/**
 * Library types. Module-internal — not exported from index.ts.
 */

import type { JSX } from 'react'

export interface DrawerManifest {
  id:          string                 // 'holidays', 'outfits', etc.
  name:        string                 // 'Holidays'
  icon:        () => JSX.Element      // hairline SVG, 22px target render
  /**
   * React hook (called inside LibraryHome's grid map) that returns the
   * drawer's meta-line, e.g. '17 visited · 1 planned'. Returns null
   * when the drawer is empty (the line is then omitted entirely).
   * Implemented as a hook so drawers can read async storage and re-
   * render the grid card when counts arrive.
   */
  useMetaLine: () => string | null
  component:   () => JSX.Element      // the full drawer surface
  status:      'live' | 'placeholder'
}
