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

const EMPTY: WhoopPayload = {
  connected: false,
  recovery: null, hrv: null, rhr: null,
  sleep: null, sleepEfficiency: null, sleepConsistency: null,
  sleepHours: null, remHours: null, deepHours: null,
  strain: null, avgHr: null, maxHr: null,
}

const PERSIST_KEY = 'daybreak-whoop-last-v2'

function readPersisted(): WhoopPayload | null {
  try {
    const raw = localStorage.getItem(PERSIST_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; data: WhoopPayload }
    // Stale-while-revalidate: trust cache for up to 24 hours
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
    try {
      const res = await fetch('/api/whoop/data')
      if (res.status === 401) {
        // Auth lost — clear persisted state so UI reflects truth
        try { localStorage.removeItem(PERSIST_KEY) } catch {}
        setPayload(EMPTY)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`${res.status}`)
      const json: WhoopPayload = await res.json()
      setPayload(json)
      if (json.connected) writePersisted(json)
    } catch {
      // Network blip — keep showing persisted data, don't flash 'not connected'
      if (!persisted) setPayload(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [persisted])

  useEffect(() => { void fetchData() }, [fetchData])

  const disconnect = useCallback(async () => {
    await fetch('/api/whoop/data', { method: 'DELETE' })
    try { localStorage.removeItem(PERSIST_KEY) } catch {}
    setPayload(EMPTY)
  }, [])

  return { ...payload, loading, disconnect }
}
