import { useEffect, useState } from 'react'
import {
  fetchClientBrief,
  fetchPulseAnthropic, fetchPulseAIWorld, fetchPulseTechMarket,
} from '../services/ai'
import { useDayBreakContext } from '../contexts/DayBreakContext'
import { useDay } from '../contexts/DayContext'

export type AITileId = 'client' | 'pulse-anthropic' | 'pulse-aiworld' | 'pulse-tech'
export type PulseSectionId = 'pulse-anthropic' | 'pulse-aiworld' | 'pulse-tech'

export const PULSE_SECTIONS: PulseSectionId[] = ['pulse-anthropic', 'pulse-aiworld', 'pulse-tech']

export interface TileAI {
  content:    string | null
  loading:    boolean
  error:      boolean
  errorMsg:   string | null
  fetchedAt:  number | null
}

type AIState = Record<AITileId, TileAI>

const TILE_IDS: AITileId[] = ['client', 'pulse-anthropic', 'pulse-aiworld', 'pulse-tech']

// Bump this when the prompt format or rendered shape changes so stale caches
// don't survive a deploy. v5 also moves storage from sessionStorage to
// localStorage so historic-day snapshots survive a tab close.
const CACHE_VERSION = 'v7'

function cacheKey(id: AITileId, iso: string): string {
  return `daybreak-ai-${CACHE_VERSION}-${id}-${iso}`
}

function tsKey(id: AITileId, iso: string): string {
  return `daybreak-ai-${CACHE_VERSION}-${id}-${iso}-ts`
}

function readCache(id: AITileId, iso: string): { content: string; fetchedAt: number } | null {
  try {
    const content = localStorage.getItem(cacheKey(id, iso))
    if (!content) return null
    const tsRaw = localStorage.getItem(tsKey(id, iso))
    const fetchedAt = tsRaw ? Number(tsRaw) : Date.now()
    return { content, fetchedAt }
  } catch {
    return null
  }
}

function writeCache(id: AITileId, iso: string, value: string, fetchedAt: number): void {
  try {
    localStorage.setItem(cacheKey(id, iso), value)
    localStorage.setItem(tsKey(id, iso), String(fetchedAt))
  } catch { /* noop */ }
}

function clearCache(id: AITileId, iso: string): void {
  try {
    localStorage.removeItem(cacheKey(id, iso))
    localStorage.removeItem(tsKey(id, iso))
  } catch { /* noop */ }
}

function getPromise(id: AITileId): Promise<string> {
  switch (id) {
    case 'client':          return fetchClientBrief()
    case 'pulse-anthropic': return fetchPulseAnthropic()
    case 'pulse-aiworld':   return fetchPulseAIWorld()
    case 'pulse-tech':      return fetchPulseTechMarket()
  }
}

function buildStateForDay(iso: string, isToday: boolean): AIState {
  const s = {} as AIState
  for (const id of TILE_IDS) {
    const cached = readCache(id, iso)
    if (cached) {
      s[id] = { content: cached.content, loading: false, error: false, errorMsg: null, fetchedAt: cached.fetchedAt }
    } else if (isToday) {
      // Today with no cache: kick a fetch (the effect below will run it).
      s[id] = { content: null, loading: true,  error: false, errorMsg: null, fetchedAt: null }
    } else {
      // Historic day with no archived snapshot: stay empty, no fetch.
      s[id] = { content: null, loading: false, error: false, errorMsg: null, fetchedAt: null }
    }
  }
  return s
}

export function useAIContent() {
  const { registerContent } = useDayBreakContext()
  const { viewedISO, isToday } = useDay()

  // Rebuild state whenever the viewed day changes so the UI snaps to that
  // day's snapshot (or kicks a fresh fetch if it's today and uncached).
  const [state, setState] = useState<AIState>(() => buildStateForDay(viewedISO, isToday))

  useEffect(() => {
    setState(buildStateForDay(viewedISO, isToday))
  }, [viewedISO, isToday])

  useEffect(() => {
    for (const id of TILE_IDS) {
      const content = state[id].content
      registerContent(`tile_${id}`, content && content.trim() ? content : null)
    }
  }, [state, registerContent])

  function fetchOne(id: AITileId) {
    // Only ever fetch for today. Historic views are read-only snapshots.
    if (!isToday) return
    const iso = viewedISO
    setState(s => ({ ...s, [id]: { content: null, loading: true, error: false, errorMsg: null, fetchedAt: null } }))
    getPromise(id)
      .then(text => {
        const fetchedAt = Date.now()
        writeCache(id, iso, text, fetchedAt)
        setState(s => ({ ...s, [id]: { content: text, loading: false, error: false, errorMsg: null, fetchedAt } }))
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setState(s => ({ ...s, [id]: { content: null, loading: false, error: true, errorMsg: msg, fetchedAt: null } }))
      })
  }

  // Kick fetches for today's missing tiles. Re-runs when day changes.
  useEffect(() => {
    if (!isToday) return
    TILE_IDS.filter(id => !readCache(id, viewedISO)).forEach(id => fetchOne(id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewedISO, isToday])

  function refreshPulse() {
    if (!isToday) return     // never refetch a historic snapshot
    PULSE_SECTIONS.forEach(id => {
      clearCache(id, viewedISO)
      fetchOne(id)
    })
  }

  return {
    ai: state,
    retry: (id: AITileId) => fetchOne(id),
    refreshPulse,
    isHistoricView: !isToday,
  }
}
