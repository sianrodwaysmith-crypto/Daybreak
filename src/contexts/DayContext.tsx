import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react'

/**
 * DayContext — holds the day the user is currently viewing.
 *
 * Defaults to today, snaps back to today on midnight rollover or when the
 * app regains focus across a date boundary. Subtle swipe nav (in App.tsx)
 * mutates viewedISO via goPrevDay / goNextDay.
 *
 * Day-aware components (Pulse, Client AI content, Header, etc.) read
 * viewedISO instead of new Date() so historic views render cached
 * snapshots and don't re-fetch.
 */

export interface DayContextValue {
  viewedDate: Date
  viewedISO:  string
  isToday:    boolean
  goToToday:  () => void
  goPrevDay:  () => void
  goNextDay:  () => void
}

const Ctx = createContext<DayContextValue | null>(null)

const ONE_DAY_MS    = 24 * 60 * 60 * 1000
const MAX_DAYS_BACK = 14

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

function msUntilNextMidnight(): number {
  const now  = new Date()
  const next = startOfDay(new Date(now.getTime() + ONE_DAY_MS))
  return next.getTime() - now.getTime() + 250  // tiny buffer
}

export function DayProvider({ children }: { children: ReactNode }) {
  const [viewedDate, setViewedDate] = useState<Date>(() => startOfDay(new Date()))
  const [todayDate,  setTodayDate]  = useState<Date>(() => startOfDay(new Date()))
  const midnightRef = useRef<number | null>(null)

  // Roll today over at the next midnight, then reschedule.
  const scheduleMidnight = useCallback(() => {
    if (midnightRef.current != null) window.clearTimeout(midnightRef.current)
    midnightRef.current = window.setTimeout(() => {
      const fresh = startOfDay(new Date())
      setTodayDate(fresh)
      // If the user was on today, follow them to the new today. Otherwise
      // leave them on whatever historic day they were viewing.
      setViewedDate(prev => prev.getTime() === todayDate.getTime() ? fresh : prev)
      scheduleMidnight()
    }, msUntilNextMidnight())
  }, [todayDate])

  useEffect(() => {
    scheduleMidnight()
    return () => { if (midnightRef.current != null) window.clearTimeout(midnightRef.current) }
  }, [scheduleMidnight])

  // When the app comes back to focus, recheck whether the day has rolled
  // over since we last looked. Phones suspend timers in the background.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== 'visible') return
      const fresh = startOfDay(new Date())
      if (fresh.getTime() !== todayDate.getTime()) {
        setTodayDate(fresh)
        setViewedDate(prev => prev.getTime() === todayDate.getTime() ? fresh : prev)
        scheduleMidnight()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [todayDate, scheduleMidnight])

  const value = useMemo<DayContextValue>(() => {
    const isToday = viewedDate.getTime() === todayDate.getTime()
    return {
      viewedDate,
      viewedISO: isoDate(viewedDate),
      isToday,
      goToToday: () => setViewedDate(todayDate),
      goPrevDay: () => setViewedDate(prev => {
        const candidate = new Date(prev.getTime() - ONE_DAY_MS)
        const earliest  = new Date(todayDate.getTime() - MAX_DAYS_BACK * ONE_DAY_MS)
        return candidate < earliest ? earliest : candidate
      }),
      goNextDay: () => setViewedDate(prev => {
        const candidate = new Date(prev.getTime() + ONE_DAY_MS)
        return candidate > todayDate ? todayDate : candidate
      }),
    }
  }, [viewedDate, todayDate])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDay(): DayContextValue {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDay must be used inside <DayProvider>')
  return ctx
}
