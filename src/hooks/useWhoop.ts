import { useState, useEffect, useCallback, useRef } from 'react'
import { useDayBreakContext } from '../contexts/DayBreakContext'

export interface WhoopDebug {
  source:            'api' | 'persisted' | 'no-tokens' | 'fetch-error' | '401' | 'http-error' | 'rate-limited'
  ts:                string                       // ISO timestamp of when this was captured
  hasTokens:         boolean
  fetchOk?:          boolean
  fetchStatus?:      number
  fetchError?:       string                       // network error message
  retryAfter?:       number                       // seconds, when known (Retry-After header)
  recoveryStatus?:   number
  sleepStatus?:      number
  cycleStatus?:      number
  recoveryHasRecord?: boolean
  sleepHasRecord?:    boolean
  cycleHasRecord?:    boolean
  errors?:           Record<string, string>
  rawResponseHead?:  string                       // first 240 chars of body if non-JSON
}

export interface WhoopData {
  connected:        boolean
  loading:          boolean
  recovery:         number | null
  hrv:              number | null
  rhr:              number | null
  sleep:            number | null
  sleepEfficiency:  number | null
  sleepConsistency: number | null
  sleepHours:       number | null
  remHours:         number | null
  deepHours:        number | null
  strain:           number | null
  avgHr:            number | null
  maxHr:            number | null
  debug:            WhoopDebug | null
  refresh:          () => Promise<void>
  disconnect:       () => Promise<void>
}

interface WhoopPayload {
  connected:        boolean
  recovery:         number | null
  hrv:              number | null
  rhr:              number | null
  sleep:            number | null
  sleepEfficiency:  number | null
  sleepConsistency: number | null
  sleepHours:       number | null
  remHours:         number | null
  deepHours:        number | null
  strain:           number | null
  avgHr:            number | null
  maxHr:            number | null
}

interface StoredTokens {
  access_token:  string
  refresh_token: string
  expires_at:    number
}

const TOKENS_KEY  = 'daybreak-whoop-tokens'
const PERSIST_KEY = 'daybreak-whoop-last-v2'
const DEBUG_KEY   = 'daybreak-whoop-debug'

function writeDebug(d: WhoopDebug) {
  try { localStorage.setItem(DEBUG_KEY, JSON.stringify(d)) } catch {}
}
function readDebug(): WhoopDebug | null {
  try {
    const raw = localStorage.getItem(DEBUG_KEY)
    return raw ? JSON.parse(raw) as WhoopDebug : null
  } catch { return null }
}

const EMPTY: WhoopPayload = {
  connected: false,
  recovery: null, hrv: null, rhr: null,
  sleep: null, sleepEfficiency: null, sleepConsistency: null,
  sleepHours: null, remHours: null, deepHours: null,
  strain: null, avgHr: null, maxHr: null,
}

function readTokens(): StoredTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    return raw ? JSON.parse(raw) as StoredTokens : null
  } catch { return null }
}

function writeTokens(t: StoredTokens) {
  try { localStorage.setItem(TOKENS_KEY, JSON.stringify(t)) } catch {}
}

function clearTokens() {
  try { localStorage.removeItem(TOKENS_KEY) } catch {}
}

function readPersisted(): WhoopPayload | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; data: WhoopPayload }
    if (Date.now() - parsed.ts > 24 * 60 * 60 * 1000) return null
    return parsed.data
  } catch {
    return null
  }
}

function writePersisted(data: WhoopPayload) {
  try { localStorage.setItem(PERSIST_KEY, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

export function useWhoop(): WhoopData {
  const { registerContent } = useDayBreakContext()
  // Read persisted state ONCE at mount via a ref. Reading on every render
  // produced a new object reference, which churned the fetchData useCallback
  // dep array, which re-fired the auto-fetch effect on every render. Whoop's
  // per-user rate limit kicks in at ~100 req/min so a few fast renders was
  // enough to trip a 429 cool-down.
  const persistedRef = useRef<WhoopPayload | null>(null)
  if (persistedRef.current === null) persistedRef.current = readPersisted()
  const persisted = persistedRef.current

  const [loading, setLoading] = useState(persisted == null)
  const [payload, setPayload] = useState<WhoopPayload>(persisted ?? EMPTY)
  const [debug,   setDebug]   = useState<WhoopDebug | null>(readDebug)

  // Cool-down gate: if Whoop has rate-limited us, refuse to refetch until
  // their Retry-After window has passed. Stops a render or button-mash from
  // re-tripping the limit.
  const cooldownUntilRef = useRef<number>(0)

  function captureDebug(next: WhoopDebug) {
    writeDebug(next)
    setDebug(next)
  }

  useEffect(() => {
    if (payload.connected) {
      registerContent('whoop', {
        recovery:         payload.recovery,
        hrv:              payload.hrv,
        rhr:              payload.rhr,
        sleep_pct:        payload.sleep,
        sleep_efficiency: payload.sleepEfficiency,
        sleep_consistency:payload.sleepConsistency,
        sleep_hours:      payload.sleepHours,
        rem_hours:        payload.remHours,
        deep_hours:       payload.deepHours,
        strain:           payload.strain,
        avg_hr_today:     payload.avgHr,
        max_hr_today:     payload.maxHr,
      })
    } else {
      registerContent('whoop', null)
    }
  }, [payload, registerContent])

  const fetchData = useCallback(async () => {
    const now = () => new Date().toISOString()

    // Honour Whoop's cool-down. If we're inside the window, leave the
    // existing state untouched and update the debug timestamp so the user
    // can see the gate is active.
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
      setPayload(EMPTY)
      setLoading(false)
      captureDebug({ source: 'no-tokens', ts: now(), hasTokens: false })
      return
    }

    try {
      const res = await fetch('/api/whoop/data', {
        headers: {
          'Authorization':         `Bearer ${tokens.access_token}`,
          'X-Whoop-Refresh-Token': tokens.refresh_token,
        },
        cache: 'no-store',
      })

      if (res.status === 401) {
        clearTokens()
        try { localStorage.removeItem(PERSIST_KEY) } catch {}
        setPayload(EMPTY)
        setLoading(false)
        captureDebug({ source: '401', ts: now(), hasTokens: true, fetchOk: false, fetchStatus: 401 })
        return
      }

      if (!res.ok) {
        const head = await res.text().catch(() => '').then(t => t.slice(0, 240))
        captureDebug({
          source: 'http-error', ts: now(), hasTokens: true,
          fetchOk: false, fetchStatus: res.status, rawResponseHead: head,
        })
        throw new Error(`${res.status}`)
      }

      const json = await res.json() as WhoopPayload & {
        tokens?: { access_token: string; refresh_token: string; expires_in: number }
        _debug?: Omit<WhoopDebug, 'source' | 'ts' | 'hasTokens' | 'fetchOk' | 'fetchStatus'>
      }

      // If any of the per-endpoint statuses came back 429, Whoop has rate-
      // limited us. Set a cool-down based on Retry-After (or default to 60s)
      // so we don't keep hammering them.
      const statuses = [
        json._debug?.recoveryStatus,
        json._debug?.sleepStatus,
        json._debug?.cycleStatus,
      ]
      if (statuses.some(s => s === 429)) {
        const retryAfter = json._debug?.retryAfter ?? 60
        cooldownUntilRef.current = Date.now() + retryAfter * 1000
      }

      // Server refreshed tokens — persist the new pair so subsequent calls work.
      if (json.tokens) {
        writeTokens({
          access_token:  json.tokens.access_token,
          refresh_token: json.tokens.refresh_token,
          expires_at:    Date.now() + json.tokens.expires_in * 1000,
        })
      }

      const { tokens: _t, _debug, ...data } = json
      setPayload(data)
      if (data.connected) writePersisted(data)
      captureDebug({
        source: 'api', ts: now(), hasTokens: true,
        fetchOk: true, fetchStatus: res.status,
        ..._debug,
      })
    } catch (err) {
      // Network blip — keep persisted data, don't flash 'not connected'
      if (!persistedRef.current) setPayload(EMPTY)
      captureDebug({
        source: 'fetch-error', ts: now(), hasTokens: true,
        fetchOk: false,
        fetchError: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setLoading(false)
    }
  }, [])  // empty deps: this function is stable across renders, the auto-
          // fetch effect below fires exactly once on mount.

  useEffect(() => { void fetchData() }, [fetchData])

  const refresh = useCallback(async () => {
    setLoading(true)
    await fetchData()
  }, [fetchData])

  const disconnect = useCallback(async () => {
    clearTokens()
    try { localStorage.removeItem(PERSIST_KEY) } catch {}
    try { localStorage.removeItem(DEBUG_KEY)   } catch {}
    setPayload(EMPTY)
    setDebug(null)
  }, [])

  return { ...payload, loading, debug, refresh, disconnect }
}
