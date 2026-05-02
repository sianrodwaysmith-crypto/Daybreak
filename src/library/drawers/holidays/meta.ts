import { useEffect, useState } from 'react'
import { getHolidaysStorage } from './storage'
import { ensureSeeded } from './seed'

/**
 * Hook that returns the Holidays drawer's meta-line for the Library
 * grid card. Counts unique visited + wishlist countries, emits one of:
 *   - "17 visited · 8 wishlist"
 *   - "17 visited"
 *   - "8 wishlist"
 *   - null (card omits the meta-line entirely)
 */
export function useHolidaysMetaLine(): string | null {
  const [line, setLine] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ensureSeeded()
      .then(() => getHolidaysStorage().listTrips())
      .then(trips => {
        if (!alive) return
        const visited = new Set(
          trips.filter(t => t.status === 'visited').map(t => t.countryCode),
        ).size
        // Treat both 'planned' and 'wishlist' as wishlist for this readout —
        // the drawer redesign collapses planned into wishlist as one bucket.
        const wishlist = new Set(
          trips.filter(t => t.status === 'wishlist' || t.status === 'planned').map(t => t.countryCode),
        ).size
        setLine(formatMetaLine(visited, wishlist))
      })
    return () => { alive = false }
  }, [])

  return line
}

function formatMetaLine(visited: number, wishlist: number): string | null {
  const parts: string[] = []
  if (visited  > 0) parts.push(`${visited} visited`)
  if (wishlist > 0) parts.push(`${wishlist} wishlist`)
  return parts.length === 0 ? null : parts.join(' · ')
}
