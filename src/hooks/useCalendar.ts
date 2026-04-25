import { useState, useEffect, useCallback } from 'react'
import { type CalEvent, type CalCreds, fetchTodayEvents } from '../services/caldav'

export type { CalEvent, CalCreds }

interface CalState {
  events: CalEvent[]
  loading: boolean
  connected: boolean
  error: string | null
}

const CREDS_KEY  = 'daybreak-cal-creds'
const CACHE_KEY  = 'daybreak-cal-cache'
const CACHE_TTL  = 15 * 60 * 1000

function loadCreds(): CalCreds | null {
  try { const r = localStorage.getItem(CREDS_KEY); return r ? JSON.parse(r) : null } catch { return null }
}

function rehydrateEvents(raw: { events: Array<CalEvent & { start: string; end: string }>; fetchedAt: number }): CalEvent[] {
  return raw.events.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))
}

function loadCache(): CalEvent[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null
    return rehydrateEvents(parsed)
  } catch { return null }
}

function saveCache(events: CalEvent[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ events, fetchedAt: Date.now() }))
}

export function useCalendar() {
  const [state, setState] = useState<CalState>({ events: [], loading: false, connected: false, error: null })

  const doFetch = useCallback(async (creds: CalCreds, bustCache = false) => {
    if (!bustCache) {
      const cached = loadCache()
      if (cached) {
        setState({ events: cached, loading: false, connected: true, error: null })
        return
      }
    }
    setState(prev => ({ ...prev, loading: true, connected: true, error: null }))
    try {
      const events = await fetchTodayEvents(creds)
      saveCache(events)
      setState({ events, loading: false, connected: true, error: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown'
      setState(prev => ({ ...prev, loading: false, error: msg }))
    }
  }, [])

  // Load from creds on mount
  useEffect(() => {
    const creds = loadCreds()
    if (creds) doFetch(creds)
  }, [doFetch])

  const saveCredentials = useCallback(async (email: string, password: string) => {
    const creds: CalCreds = { email, password }
    localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
    localStorage.removeItem(CACHE_KEY)
    await doFetch(creds, true)
  }, [doFetch])

  const clearCredentials = useCallback(() => {
    localStorage.removeItem(CREDS_KEY)
    localStorage.removeItem(CACHE_KEY)
    setState({ events: [], loading: false, connected: false, error: null })
  }, [])

  const refetch = useCallback(() => {
    const creds = loadCreds()
    if (creds) doFetch(creds, true)
  }, [doFetch])

  const getStoredEmail = () => loadCreds()?.email ?? ''

  return { ...state, saveCredentials, clearCredentials, refetch, getStoredEmail }
}
