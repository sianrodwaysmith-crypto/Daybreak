import { useState, useEffect, useCallback } from 'react'

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
  const persisted = readPersisted()
  const [loading, setLoading] = useState(persisted == null)
  const [payload, setPayload] = useState<WhoopPayload>(persisted ?? EMPTY)

  const fetchData = useCallback(async () => {
    const tokens = readTokens()
    if (!tokens) {
      setPayload(EMPTY)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/whoop/data', {
        headers: {
          'Authorization':         `Bearer ${tokens.access_token}`,
          'X-Whoop-Refresh-Token': tokens.refresh_token,
        },
      })

      if (res.status === 401) {
        clearTokens()
        try { localStorage.removeItem(PERSIST_KEY) } catch {}
        setPayload(EMPTY)
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error(`${res.status}`)

      const json = await res.json() as WhoopPayload & {
        tokens?: { access_token: string; refresh_token: string; expires_in: number }
      }

      // Server refreshed tokens — persist the new pair so subsequent calls work.
      if (json.tokens) {
        writeTokens({
          access_token:  json.tokens.access_token,
          refresh_token: json.tokens.refresh_token,
          expires_at:    Date.now() + json.tokens.expires_in * 1000,
        })
      }

      const { tokens: _t, ...data } = json
      setPayload(data)
      if (data.connected) writePersisted(data)
    } catch {
      // Network blip — keep persisted data, don't flash 'not connected'
      if (!persisted) setPayload(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [persisted])

  useEffect(() => { void fetchData() }, [fetchData])

  const disconnect = useCallback(async () => {
    clearTokens()
    try { localStorage.removeItem(PERSIST_KEY) } catch {}
    setPayload(EMPTY)
  }, [])

  return { ...payload, loading, disconnect }
}
