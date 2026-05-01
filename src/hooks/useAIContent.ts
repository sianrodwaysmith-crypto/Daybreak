import { useEffect, useState } from 'react'
import {
  fetchPulseAnthropic, fetchPulseAIWorld, fetchPulseTechMarket,
} from '../services/ai'
import { useDayBreakContext } from '../contexts/DayBreakContext'

export type AITileId = 'pulse-anthropic' | 'pulse-aiworld' | 'pulse-tech'
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

const TILE_IDS: AITileId[] = ['pulse-anthropic', 'pulse-aiworld', 'pulse-tech']

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Bump this when the prompt format or rendered shape changes so stale caches
// don't survive a deploy.
const CACHE_VERSION = 'v10'

function cacheKey(id: AITileId): string {
  return `daybreak-ai-${CACHE_VERSION}-${id}-${todayStr()}`
}

function tsKey(id: AITileId): string {
  return `daybreak-ai-${CACHE_VERSION}-${id}-${todayStr()}-ts`
}

function readCache(id: AITileId): { content: string; fetchedAt: number } | null {
  try {
    const content = localStorage.getItem(cacheKey(id))
    if (!content) return null
    const tsRaw = localStorage.getItem(tsKey(id))
    const fetchedAt = tsRaw ? Number(tsRaw) : Date.now()
    return { content, fetchedAt }
  } catch {
    return null
  }
}

function writeCache(id: AITileId, value: string, fetchedAt: number): void {
  try {
    localStorage.setItem(cacheKey(id), value)
    localStorage.setItem(tsKey(id), String(fetchedAt))
  } catch { /* noop */ }
}

function clearCache(id: AITileId): void {
  try {
    localStorage.removeItem(cacheKey(id))
    localStorage.removeItem(tsKey(id))
  } catch { /* noop */ }
}

function getPromise(id: AITileId): Promise<string> {
  switch (id) {
    case 'pulse-anthropic': return fetchPulseAnthropic()
    case 'pulse-aiworld':   return fetchPulseAIWorld()
    case 'pulse-tech':      return fetchPulseTechMarket()
  }
}

function buildInitialState(): AIState {
  const s = {} as AIState
  for (const id of TILE_IDS) {
    const cached = readCache(id)
    s[id] = cached
      ? { content: cached.content, loading: false, error: false, errorMsg: null, fetchedAt: cached.fetchedAt }
      : { content: null, loading: true, error: false, errorMsg: null, fetchedAt: null }
  }
  return s
}

export function useAIContent() {
  const { registerContent } = useDayBreakContext()
  const [state, setState] = useState<AIState>(buildInitialState)

  useEffect(() => {
    for (const id of TILE_IDS) {
      const content = state[id].content
      registerContent(`tile_${id}`, content && content.trim() ? content : null)
    }
  }, [state, registerContent])

  function fetchOne(id: AITileId): Promise<void> {
    setState(s => ({ ...s, [id]: { content: null, loading: true, error: false, errorMsg: null, fetchedAt: null } }))
    return getPromise(id)
      .then(text => {
        const fetchedAt = Date.now()
        writeCache(id, text, fetchedAt)
        setState(s => ({ ...s, [id]: { content: text, loading: false, error: false, errorMsg: null, fetchedAt } }))
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err)
        setState(s => ({ ...s, [id]: { content: null, loading: false, error: true, errorMsg: msg, fetchedAt: null } }))
      })
  }

  // Fire Pulse sections one at a time rather than in parallel. Each
  // web_search round can carry 10-15k input tokens; three at once
  // peaked at ~45k of the 50k/min Haiku quota and was the main reason
  // 429s landed. Sequential keeps the morning's auto-fetch under the
  // limit with room to spare for the per-account searches.
  // We also pause briefly between calls so the per-minute token window
  // has room to drain — without this, three back-to-back search-heavy
  // calls can still graze the limit when the user opens the app right
  // after a recent burst of activity (e.g. a chat message).
  const INTER_CALL_PAUSE_MS = 1500
  async function fetchSequential(ids: AITileId[]): Promise<void> {
    for (let i = 0; i < ids.length; i++) {
      try { await fetchOne(ids[i]) }
      catch { /* fetchOne already captured the error into state */ }
      if (i < ids.length - 1) {
        await new Promise(resolve => setTimeout(resolve, INTER_CALL_PAUSE_MS))
      }
    }
  }

  useEffect(() => {
    const stale = TILE_IDS.filter(id => !readCache(id))
    if (stale.length > 0) void fetchSequential(stale)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function refreshPulse() {
    PULSE_SECTIONS.forEach(id => clearCache(id))
    void fetchSequential([...PULSE_SECTIONS])
  }

  return {
    ai: state,
    retry: (id: AITileId) => { void fetchOne(id) },
    refreshPulse,
  }
}
