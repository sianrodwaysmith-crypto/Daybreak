import { useState, useEffect, useCallback } from 'react'

export interface WhoopData {
  connected:  boolean
  loading:    boolean
  recovery:   number | null
  hrv:        number | null
  rhr:        number | null
  sleep:      number | null
  sleepHours: number | null
  strain:     number | null
  disconnect: () => Promise<void>
}

interface WhoopPayload {
  connected:  boolean
  recovery:   number | null
  hrv:        number | null
  rhr:        number | null
  sleep:      number | null
  sleepHours: number | null
  strain:     number | null
}

const EMPTY: WhoopPayload = {
  connected: false,
  recovery: null, hrv: null, rhr: null,
  sleep: null, sleepHours: null, strain: null,
}

const CACHE_KEY = `daybreak-whoop-${new Date().toISOString().split('T')[0]}`

export function useWhoop(): WhoopData {
  const [loading, setLoading]   = useState(true)
  const [payload, setPayload]   = useState<WhoopPayload>(EMPTY)

  const fetchData = useCallback(async () => {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        setPayload(JSON.parse(cached))
        setLoading(false)
        return
      } catch {}
    }

    try {
      const res = await fetch('/api/whoop/data')
      if (res.status === 401) {
        setPayload(EMPTY)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(`${res.status}`)
      const json: WhoopPayload = await res.json()
      setPayload(json)
      if (json.connected) sessionStorage.setItem(CACHE_KEY, JSON.stringify(json))
    } catch {
      setPayload(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchData() }, [fetchData])

  const disconnect = useCallback(async () => {
    await fetch('/api/whoop/data', { method: 'DELETE' })
    sessionStorage.removeItem(CACHE_KEY)
    setPayload(EMPTY)
  }, [])

  return { ...payload, loading, disconnect }
}
