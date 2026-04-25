import { useState, useEffect } from 'react'
import {
  fetchClientBrief,
  fetchPulseAnthropic, fetchPulseAIWorld, fetchPulseTechMarket,
} from '../services/ai'
import { useDayBreakContext } from '../contexts/DayBreakContext'

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

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// Bump this when the prompt format or rendered shape changes so stale caches
// don't survive a deploy.
const CACHE_VERSION = 'v2'

function cacheKey(id: AITileId): string {
  return `daybreak-ai-${CACHE_VERSION}-${id}-${todayStr()}`
}

function tsKey(id: AITileId): string {
  return `daybreak-ai-${CACHE_VERSION}-${id}-${todayStr()}-ts`
}

function readCache(id: AITileId): { content: string; fetchedAt: number } | null {
  try {
    const content = sessionStorage.getItem(cacheKey(id))
    if (!content) return null
    const tsRaw = sessionStorage.getItem(tsKey(id))
    const fetchedAt = tsRaw ? Number(tsRaw) : Date.now()
    return { content, fetchedAt }
  } catch {
    return null
  }
}

function writeCache(id: AITileId, value: string, fetchedAt: number): void {
  try {
    sessionStorage.setItem(cacheKey(id), value)
    sessionStorage.setItem(tsKey(id), String(fetchedAt))
  } catch { /* noop */ }
}

function clearCache(id: AITileId): void {
  try {
    sessionStorage.removeItem(cacheKey(id))
    sessionStorage.removeItem(tsKey(id))
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

  function fetchOne(id: AITileId) {
    setState(s => ({ ...s, [id]: { content: null, loading: true, error: false, errorMsg: null, fetchedAt: null } }))
    getPromise(id)
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

  useEffect(() => {
    TILE_IDS.filter(id => !readCache(id)).forEach(id => fetchOne(id))
  }, [])

  function refreshPulse() {
    PULSE_SECTIONS.forEach(id => {
      clearCache(id)
      fetchOne(id)
    })
  }

  return {
    ai: state,
    retry: (id: AITileId) => fetchOne(id),
    refreshPulse,
  }
}
