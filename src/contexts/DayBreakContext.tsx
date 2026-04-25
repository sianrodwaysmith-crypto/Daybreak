import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

export type ContextValue = unknown

interface DayBreakContextType {
  /** Components call this to register their data into the central store. */
  registerContent: (key: string, value: ContextValue) => void
  /** Returns a snapshot of all currently registered context. */
  getAllContext:   () => Record<string, ContextValue>
  /** Bumps every time the store changes — useful for unread indicators. */
  version:         number
}

const Ctx = createContext<DayBreakContextType | null>(null)

export function DayBreakProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<Record<string, ContextValue>>({})
  const [version, setVersion] = useState(0)

  const registerContent = useCallback((key: string, value: ContextValue) => {
    if (value == null) {
      // null/undefined means "unregister" — drop the key so it doesn't pollute the prompt
      if (!(key in storeRef.current)) return
      delete storeRef.current[key]
      setVersion(v => v + 1)
      return
    }
    if (Object.is(storeRef.current[key], value)) return
    storeRef.current[key] = value
    setVersion(v => v + 1)
  }, [])

  const getAllContext = useCallback(() => ({ ...storeRef.current }), [])

  const value = useMemo<DayBreakContextType>(
    () => ({ registerContent, getAllContext, version }),
    [registerContent, getAllContext, version],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDayBreakContext(): DayBreakContextType {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useDayBreakContext must be used inside <DayBreakProvider>')
  return ctx
}
