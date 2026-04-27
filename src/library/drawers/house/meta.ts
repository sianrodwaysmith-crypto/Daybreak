import { useEffect, useState } from 'react'
import { copy } from './copy'
import { getHouseStorage } from './storage'

interface Counts { open: number; done: number }

/** Module-scoped counts so callers (the meta-line hook + the drawer
 *  itself) can trigger a recount via bumpHouseMeta() after a save. */
let bumpListeners = new Set<() => void>()
export function bumpHouseMeta(): void {
  for (const fn of bumpListeners) fn()
}

export function useHouseMetaLine(): string | null {
  const [counts, setCounts] = useState<Counts | null>(null)

  useEffect(() => {
    let alive = true
    function refresh() {
      getHouseStorage().listTasks().then(ts => {
        if (!alive) return
        setCounts({
          open: ts.filter(t => t.status === 'todo').length,
          done: ts.filter(t => t.status === 'done').length,
        })
      })
    }
    refresh()
    bumpListeners.add(refresh)
    return () => { alive = false; bumpListeners.delete(refresh) }
  }, [])

  if (!counts) return null

  const parts: string[] = []
  if (counts.open > 0) parts.push(copy.meta.open(counts.open))
  if (counts.done > 0) parts.push(copy.meta.done(counts.done))
  return parts.length === 0 ? null : parts.join(' · ')
}
