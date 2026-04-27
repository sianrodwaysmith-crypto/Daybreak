import { useState, useEffect, useCallback, useRef } from 'react'
import { useDayBreakContext } from '../contexts/DayBreakContext'

/* ====================================================================
   Google Calendar hook.
   Mirrors useWhoop end to end:
     - OAuth tokens in localStorage
     - Single-flight dedupe on the network call
     - 30-minute min-age gate so the auto-fetch on mount uses cached data
       when fresh
     - Persisted cool-down on 429s
     - Diagnostic capture for the Settings panel
==================================================================== */

// ISO 8601 in the user's local timezone with offset, e.g.
// "2026-04-27T19:00:00+01:00". Date.toISOString() always returns UTC,
// which silently shifts a 19:00 BST event to "18:00:00Z" — the chat LLM
// then reads it as 18:00. Sending wall-clock time with an explicit
// offset removes the ambiguity.
function toLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const offsetMin = -d.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const oh = pad(Math.floor(Math.abs(offsetMin) / 60))
  const om = pad(Math.abs(offsetMin) % 60)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${oh}:${om}`
}

export interface CalEvent {
  id:        string
  title:     string
  start:     Date
  end:       Date
  allDay:    boolean
  location?: string
  htmlLink?: string
}

export interface CalendarDebug {
  source:        'api' | 'persisted' | 'no-tokens' | 'fetch-error' | '401' | 'http-error' | 'rate-limited'
  ts:            string
  hasTokens:     boolean
  fetchOk?:      boolean
  fetchStatus?:  number
  fetchError?:   string
  retryAfter?:   number
  eventCount?:   number
  rawError?:     string
}

export interface CalendarHook {
  connected:        boolean
  loading:          boolean
  events:           CalEvent[]    // today only
  tomorrow:         CalEvent[]    // tomorrow only, for the preview strip
  debug:            CalendarDebug | null
  cooldownSeconds:  number
  refresh:          () => Promise<void>
  disconnect:       () => Promise<void>
}

interface StoredTokens { access_token: string; refresh_token: string; expires_at: number }

const TOKENS_KEY    = 'daybreak-google-tokens'
// v2 — added htmlLink + window now spans today and tomorrow.
const PERSIST_KEY   = 'daybreak-google-events-v2'
const DEBUG_KEY     = 'daybreak-google-debug'
const COOLDOWN_KEY  = 'daybreak-google-cooldown-until'

const DEFAULT_COOLDOWN_SECS = 60
const MIN_FRESH_AGE_MS      = 30 * 60 * 1000

interface RawEvent {
  id:        string
  title:     string
  start:     string
  end:       string
  allDay:    boolean
  location?: string
  htmlLink?: string
}
interface PersistedEntry { events: RawEvent[]; ts: number }

function readTokens(): StoredTokens | null {
  try { const r = localStorage.getItem(TOKENS_KEY); return r ? JSON.parse(r) as StoredTokens : null } catch { return null }
}
function writeTokens(t: StoredTokens) {
  try { localStorage.setItem(TOKENS_KEY, JSON.stringify(t)) } catch {}
}
function clearTokens() {
  try { localStorage.removeItem(TOKENS_KEY) } catch {}
}

function readPersistedEntry(): PersistedEntry | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedEntry
    if (Date.now() - parsed.ts > 24 * 60 * 60 * 1000) return null
    return parsed
  } catch { return null }
}
function writePersisted(events: RawEvent[]) {
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify({ events, ts: Date.now() })) } catch {}
}

function readDebug(): CalendarDebug | null {
  try { const r = localStorage.getItem(DEBUG_KEY); return r ? JSON.parse(r) as CalendarDebug : null } catch { return null }
}
function writeDebug(d: CalendarDebug) {
  try { localStorage.setItem(DEBUG_KEY, JSON.stringify(d)) } catch {}
}

function readCooldownUntil(): number {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY)
    if (!raw) return 0
    const n = Number(raw)
    return Number.isFinite(n) ? n : 0
  } catch { return 0 }
}
function writeCooldownUntil(t: number) {
  try { localStorage.setItem(COOLDOWN_KEY, String(t)) } catch {}
}
function clearCooldownStore() {
  try { localStorage.removeItem(COOLDOWN_KEY) } catch {}
}

function rehydrate(raw: RawEvent[]): CalEvent[] {
  return raw.map(e => ({ ...e, start: new Date(e.start), end: new Date(e.end) }))
}

function isoDateLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
// Split a flat list of events into "today" and "tomorrow" buckets,
// classifying by the start date in local time. Events that started
// yesterday and bleed into today still count as today.
function splitByDay(all: CalEvent[]): { today: CalEvent[]; tomorrow: CalEvent[] } {
  const now = new Date()
  const todayISO = isoDateLocal(now)
  const tmw = new Date(now); tmw.setDate(tmw.getDate() + 1)
  const tomorrowISO = isoDateLocal(tmw)

  const today:    CalEvent[] = []
  const tomorrow: CalEvent[] = []
  for (const e of all) {
    const sISO = isoDateLocal(e.start)
    if (sISO === tomorrowISO) tomorrow.push(e)
    else if (sISO === todayISO || (e.start.getTime() <= now.getTime() && e.end.getTime() > now.getTime())) today.push(e)
    else if (sISO < todayISO && isoDateLocal(e.end) >= todayISO) today.push(e)
  }
  return { today, tomorrow }
}

let inflight: Promise<void> | null = null
function singleFlight(run: () => Promise<void>): Promise<void> {
  if (inflight) return inflight
  inflight = run().finally(() => { inflight = null })
  return inflight
}

export function useCalendar(): CalendarHook {
  const { registerContent } = useDayBreakContext()

  const persistedRef = useRef<PersistedEntry | null>(null)
  if (persistedRef.current === null) persistedRef.current = readPersistedEntry()
  const persisted = persistedRef.current

  const initialAll = persisted ? rehydrate(persisted.events) : []
  const initialSplit = splitByDay(initialAll)
  const initialConnected = readTokens() !== null

  const [events,    setEvents]    = useState<CalEvent[]>(initialSplit.today)
  const [tomorrow,  setTomorrow]  = useState<CalEvent[]>(initialSplit.tomorrow)
  const [connected, setConnected] = useState<boolean>(initialConnected)
  const [loading,   setLoading]   = useState<boolean>(persisted == null && initialConnected)
  const [debug,     setDebug]     = useState<CalendarDebug | null>(readDebug)

  const cooldownUntilRef = useRef<number>(readCooldownUntil())
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(() => {
    const ms = readCooldownUntil() - Date.now()
    return ms > 0 ? Math.ceil(ms / 1000) : 0
  })

  function setCooldown(secs: number) {
    const until = Date.now() + secs * 1000
    cooldownUntilRef.current = until
    writeCooldownUntil(until)
    setCooldownSeconds(secs)
  }

  useEffect(() => {
    if (cooldownSeconds <= 0) return
    const id = window.setInterval(() => {
      const ms = cooldownUntilRef.current - Date.now()
      const secs = ms > 0 ? Math.ceil(ms / 1000) : 0
      setCooldownSeconds(secs)
      if (secs === 0) {
        clearCooldownStore()
        window.clearInterval(id)
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldownSeconds])

  function captureDebug(next: CalendarDebug) {
    writeDebug(next)
    setDebug(next)
  }

  // Register the calendar context for the chat coach.
  useEffect(() => {
    if (!connected) {
      registerContent('calendar_today', null)
      return
    }
    registerContent('calendar_today', events.map(e => ({
      title:    e.title,
      start:    toLocalISO(e.start),
      end:      toLocalISO(e.end),
      location: e.location ?? undefined,
      all_day:  e.allDay,
    })))
  }, [connected, events, registerContent])

  const fetchData = useCallback(async (opts?: { force?: boolean }) => {
    const force = opts?.force === true
    const now = () => new Date().toISOString()

    // Min-age gate.
    if (!force) {
      const entry = readPersistedEntry()
      if (entry && Date.now() - entry.ts < MIN_FRESH_AGE_MS) {
        const split = splitByDay(rehydrate(entry.events))
        setEvents(split.today)
        setTomorrow(split.tomorrow)
        setConnected(true)
        setLoading(false)
        return
      }
    }

    // Cool-down.
    if (Date.now() < cooldownUntilRef.current) {
      const secondsLeft = Math.ceil((cooldownUntilRef.current - Date.now()) / 1000)
      captureDebug({
        source: 'rate-limited', ts: now(), hasTokens: !!readTokens(),
        fetchOk: false, fetchStatus: 429, retryAfter: secondsLeft,
      })
      setLoading(false)
      return
    }

    const tokens = readTokens()
    if (!tokens) {
      setEvents([])
      setTomorrow([])
      setConnected(false)
      setLoading(false)
      captureDebug({ source: 'no-tokens', ts: now(), hasTokens: false })
      return
    }

    return singleFlight(async () => {
      try {
        const res = await fetch('/api/google/events', {
          headers: {
            'Authorization':         `Bearer ${tokens.access_token}`,
            'X-Google-Refresh-Token': tokens.refresh_token,
          },
          cache: 'no-store',
        })

        if (res.status === 401) {
          clearTokens()
          try { localStorage.removeItem(PERSIST_KEY) } catch {}
          setEvents([])
          setTomorrow([])
          setConnected(false)
          setLoading(false)
          captureDebug({ source: '401', ts: now(), hasTokens: true, fetchOk: false, fetchStatus: 401 })
          return
        }

        if (res.status === 429) {
          setCooldown(DEFAULT_COOLDOWN_SECS)
          captureDebug({
            source: 'rate-limited', ts: now(), hasTokens: true,
            fetchOk: false, fetchStatus: 429, retryAfter: DEFAULT_COOLDOWN_SECS,
          })
          setLoading(false)
          return
        }

        if (!res.ok) {
          const head = await res.text().catch(() => '').then(t => t.slice(0, 240))
          captureDebug({
            source: 'http-error', ts: now(), hasTokens: true,
            fetchOk: false, fetchStatus: res.status, rawError: head,
          })
          setLoading(false)
          return
        }

        const json = await res.json() as {
          connected: boolean
          events:    RawEvent[]
          tokens?:   { access_token: string; refresh_token: string; expires_in: number }
          _debug?:   { eventsStatus?: number; eventCount?: number; error?: string }
        }

        if (json.tokens) {
          writeTokens({
            access_token:  json.tokens.access_token,
            refresh_token: json.tokens.refresh_token || tokens.refresh_token,
            expires_at:    Date.now() + json.tokens.expires_in * 1000,
          })
        }

        const rehydrated = rehydrate(json.events ?? [])
        const split = splitByDay(rehydrated)
        setEvents(split.today)
        setTomorrow(split.tomorrow)
        setConnected(true)
        if (json.events) writePersisted(json.events)
        captureDebug({
          source: 'api', ts: now(), hasTokens: true,
          fetchOk: true, fetchStatus: 200,
          eventCount: rehydrated.length,
          rawError:   json._debug?.error,
        })
      } catch (err) {
        if (!persistedRef.current) setEvents([])
        captureDebug({
          source: 'fetch-error', ts: now(), hasTokens: true,
          fetchOk: false,
          fetchError: err instanceof Error ? err.message : String(err),
        })
      } finally {
        setLoading(false)
      }
    })
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchData({ force: true })
  }, [fetchData])

  const disconnect = useCallback(async () => {
    clearTokens()
    try { localStorage.removeItem(PERSIST_KEY) } catch {}
    try { localStorage.removeItem(DEBUG_KEY)   } catch {}
    clearCooldownStore()
    cooldownUntilRef.current = 0
    setCooldownSeconds(0)
    setEvents([])
    setTomorrow([])
    setConnected(false)
    setDebug(null)
  }, [])

  return { connected, loading, events, tomorrow, debug, cooldownSeconds, refresh, disconnect }
}
