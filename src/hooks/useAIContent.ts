import { useState, useEffect } from 'react'
import {
  fetchDeepWork, fetchClientBrief,
  fetchBusinessPulse, fetchAIBriefing, fetchTodaysFocus,
} from '../services/ai'

export type AITileId = 'work' | 'client' | 'biz' | 'ai' | 'focus'

export interface TileAI {
  content: string | null
  loading: boolean
  error: boolean
}

type AIState = Record<AITileId, TileAI>

const TILE_IDS: AITileId[] = ['work', 'client', 'biz', 'ai', 'focus']

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function cacheKey(id: AITileId): string {
  return `daybreak-ai-${id}-${todayStr()}`
}

function readCache(id: AITileId): string | null {
  try { return sessionStorage.getItem(cacheKey(id)) } catch { return null }
}

function writeCache(id: AITileId, value: string): void {
  try { sessionStorage.setItem(cacheKey(id), value) } catch { /* noop */ }
}

function getPromise(id: AITileId, score: number): Promise<string> {
  switch (id) {
    case 'work':   return fetchDeepWork(score)
    case 'client': return fetchClientBrief()
    case 'biz':    return fetchBusinessPulse()
    case 'ai':     return fetchAIBriefing()
    case 'focus':  return fetchTodaysFocus(score)
  }
}

function buildInitialState(): AIState {
  const s = {} as AIState
  for (const id of TILE_IDS) {
    const cached = readCache(id)
    s[id] = { content: cached, loading: !cached, error: false }
  }
  return s
}

export function useAIContent(score: number) {
  const [state, setState] = useState<AIState>(buildInitialState)

  function fetchOne(id: AITileId) {
    setState(s => ({ ...s, [id]: { content: null, loading: true, error: false } }))
    getPromise(id, score)
      .then(text => {
        writeCache(id, text)
        setState(s => ({ ...s, [id]: { content: text, loading: false, error: false } }))
      })
      .catch(() => {
        setState(s => ({ ...s, [id]: { content: null, loading: false, error: true } }))
      })
  }

  useEffect(() => {
    TILE_IDS.filter(id => !readCache(id)).forEach(id => fetchOne(id))
  }, [])

  return { ai: state, retry: (id: AITileId) => fetchOne(id) }
}
