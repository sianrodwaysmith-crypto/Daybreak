import { useEffect, useState } from 'react'
import { copy } from './copy'
import { getHolidaysStorage } from './storage'
import { ensureSeeded } from './seed'

/**
 * Hook that returns the Holidays drawer's meta-line for the Library
 * grid card. Reads the seeded/saved trips, derives counts, and emits:
 *   - "17 visited · 1 planned"
 *   - "17 visited"        (no planned)
 *   - "1 planned"         (no visited)
 *   - null                (drawer is empty, card omits the meta-line)
 *
 * Re-runs on mount; the grid card re-renders once the async load
 * resolves so the counts appear without a flash of stale state.
 */
export function useHolidaysMetaLine(): string | null {
  const [line, setLine] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ensureSeeded()
      .then(() => getHolidaysStorage().listTrips())
      .then(trips => {
        if (!alive) return
        const visitedCountries = new Set(
          trips.filter(t => t.status === 'visited').map(t => t.countryCode),
        ).size
        const plannedCount = trips.filter(t => t.status === 'planned').length
        setLine(formatMetaLine(visitedCountries, plannedCount))
      })
    return () => { alive = false }
  }, [])

  return line
}

function formatMetaLine(visited: number, planned: number): string | null {
  const parts: string[] = []
  if (visited > 0) parts.push(`${visited} ${copy.stats.visited}`)
  if (planned > 0) parts.push(`${planned} ${copy.stats.planned}`)
  return parts.length === 0 ? null : parts.join(' · ')
}
