import { useEffect, useState } from 'react'
import { getStorage } from './storage'

const USER_ID = 'sian'

/**
 * Meta line shown beneath the Outfits card in the Library home grid.
 * Returns null until the count is known so we don't flash "0".
 */
export function useOutfitsMetaLine(): string | null {
  const [line, setLine] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    getStorage()
      .list(USER_ID)
      .then(outfits => {
        if (!alive) return
        if (outfits.length === 0)        setLine(null)
        else if (outfits.length === 1)   setLine('1 outfit')
        else                             setLine(`${outfits.length} outfits`)
      })
      .catch(() => {
        if (alive) setLine(null)
      })
  }, [])

  return line
}
