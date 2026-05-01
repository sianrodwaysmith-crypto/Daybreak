import { useEffect, useRef, useState } from 'react'
import { getStorage } from '../storage'
import * as journalState from '../state'
import { UnlockScreen }    from './UnlockScreen'
import { WorryBankScreen } from './WorryBankScreen'

interface Props {
  /** Called when the user dismisses the journal — cancel from unlock,
   *  auto-lock from inactivity, or backgrounding the tab. */
  onClose: () => void
}

type Screen = 'unlock' | 'worries'

const INACTIVITY_MS = 5 * 60 * 1000

/* ====================================================================
   Post-restructure: the journal is just unlock → worry bank. The
   morning intention block and end-of-day reflection both live in the
   Daily Mindset module now. The PIN gate stays because therapy notes
   warrant the friction; nothing else inside the journal does.
==================================================================== */
export function JournalApp({ onClose }: Props) {
  const [screen,    setScreen]    = useState<Screen>('unlock')
  const [setupMode, setSetupMode] = useState<boolean | null>(null)  // null = checking

  const inactivityTimer = useRef<number | null>(null)

  // Decide setup vs verify on mount.
  useEffect(() => {
    let alive = true
    getStorage().getAuth().then(auth => {
      if (!alive) return
      setSetupMode(auth === null)
    })
    return () => { alive = false }
  }, [])

  // Auto-lock on inactivity, only while unlocked.
  useEffect(() => {
    if (screen === 'unlock') return

    function bump() {
      if (inactivityTimer.current != null) window.clearTimeout(inactivityTimer.current)
      inactivityTimer.current = window.setTimeout(() => {
        journalState.lock()
        onClose()
      }, INACTIVITY_MS)
    }
    bump()
    const events: (keyof DocumentEventMap)[] = ['mousedown', 'keydown', 'touchstart', 'pointerdown']
    for (const e of events) document.addEventListener(e, bump, { passive: true })

    return () => {
      if (inactivityTimer.current != null) window.clearTimeout(inactivityTimer.current)
      for (const e of events) document.removeEventListener(e, bump)
    }
  }, [screen, onClose])

  // Auto-lock the moment the tab/app is backgrounded. Per brief: re-entry
  // requires a deliberate PIN re-enter; we don't try to hold state.
  useEffect(() => {
    function onVis() {
      if (document.visibilityState === 'hidden') {
        journalState.lock()
        onClose()
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [onClose])

  function unlock() {
    journalState.setUnlocked(true)
    setScreen('worries')
  }
  function lockAndClose() {
    journalState.lock()
    onClose()
  }

  if (setupMode === null) {
    // Auth check still in flight — render nothing rather than flash a UI.
    return null
  }

  if (screen === 'unlock') {
    return <UnlockScreen setup={setupMode} onUnlock={unlock} onCancel={onClose} />
  }

  return <WorryBankScreen onLock={lockAndClose} />
}
