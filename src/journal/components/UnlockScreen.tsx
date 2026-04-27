import { useEffect, useState } from 'react'
import { copy } from '../copy'
import { hashPin, verifyPin } from '../auth'
import { getStorage, recordFailedAttempt } from '../storage'
import type { JournalAuth } from '../types'

const PIN_LENGTH = 4

interface Props {
  /** True the very first time — flow asks the user to set + confirm a PIN. */
  setup:    boolean
  onUnlock: () => void
  onCancel: () => void
}

type SetupStep = 'set' | 'confirm'

export function UnlockScreen({ setup, onUnlock, onCancel }: Props) {
  const [digits, setDigits] = useState('')
  const [busy,   setBusy]   = useState(false)
  const [error,  setError]  = useState('')

  // Setup flow only: track what's been typed in step 1 so step 2 can compare.
  const [setupStep, setSetupStep] = useState<SetupStep>('set')
  const [firstPin,  setFirstPin]  = useState('')

  // Auto-clear the error line after 2s so it doesn't linger.
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 2000)
    return () => clearTimeout(t)
  }, [error])

  function press(d: string) {
    if (busy || digits.length >= PIN_LENGTH) return
    setDigits(prev => prev + d)
  }
  function back() {
    if (busy) return
    setDigits(prev => prev.slice(0, -1))
  }

  // Auto-submit on the 4th digit.
  useEffect(() => {
    if (digits.length !== PIN_LENGTH || busy) return
    void submit()
    // Intentionally exhaustive deps off — submit captures `digits`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits])

  async function submit() {
    setBusy(true)
    try {
      if (setup) {
        if (setupStep === 'set') {
          // Capture the first PIN, ask the user to re-enter.
          setFirstPin(digits)
          setDigits('')
          setSetupStep('confirm')
          return
        }
        if (digits !== firstPin) {
          setError(copy.unlock.mismatch)
          setDigits('')
          setFirstPin('')
          setSetupStep('set')
          return
        }
        const pinHash = await hashPin(digits)
        const auth: JournalAuth = {
          pinHash,
          failedAttempts: [],
          createdAt:      new Date().toISOString(),
        }
        await getStorage().setAuth(auth)
        onUnlock()
        return
      }

      // Verify flow.
      const auth = await getStorage().getAuth()
      if (!auth) {
        // Auth disappeared — bounce to setup. Shouldn't happen in practice.
        setError(copy.unlock.tryAgain)
        setDigits('')
        return
      }
      const ok = await verifyPin(digits, auth.pinHash)
      if (ok) {
        onUnlock()
      } else {
        await recordFailedAttempt()
        setError(copy.unlock.tryAgain)
        setDigits('')
      }
    } finally {
      setBusy(false)
    }
  }

  const title = setup
    ? (setupStep === 'set' ? copy.unlock.setupTitle : copy.unlock.confirmTitle)
    : copy.unlock.verifyTitle

  return (
    <div className="journal-unlock">
      <span className="journal-unlock-icon" aria-hidden>
        <QuillMark />
      </span>
      <div className="journal-unlock-label">{copy.unlock.label}</div>
      <div className="journal-unlock-prompt">{title}</div>

      <div className="journal-pin-dots" aria-label={`${digits.length} of ${PIN_LENGTH} digits entered`}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={`journal-pin-dot${i < digits.length ? ' is-filled' : ''}`}
          />
        ))}
      </div>

      <div className="journal-unlock-error" role="status" aria-live="polite">{error}</div>

      <div className="journal-keypad" role="group" aria-label="PIN keypad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button
            key={n}
            type="button"
            className="journal-keypad-key"
            onClick={() => press(String(n))}
            disabled={busy}
          >{n}</button>
        ))}
        <span className="journal-keypad-spacer" aria-hidden />
        <button
          type="button"
          className="journal-keypad-key"
          onClick={() => press('0')}
          disabled={busy}
        >0</button>
        <button
          type="button"
          className="journal-keypad-key journal-keypad-del"
          onClick={back}
          disabled={busy || digits.length === 0}
          aria-label="Delete"
        >⌫</button>
      </div>

      <button type="button" className="journal-unlock-cancel" onClick={onCancel}>
        {copy.unlock.cancel}
      </button>
    </div>
  )
}

/** Inline copy of the section-mark quill so the unlock screen has its
 *  iconography even though it can't reach the shared icons module. */
function QuillMark() {
  return (
    <svg width="36" height="36" viewBox="-25 -25 50 50" fill="none"
         stroke="currentColor" strokeWidth={1.5}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M -18 22 L 18 -16 L 22 -20 L 18 -12 L -14 18 Z" />
      <line x1="-14" y1="18" x2="-10" y2="22" strokeWidth={0.8} />
      <line x1="-22" y1="22" x2="-12" y2="22" strokeWidth={0.8} />
    </svg>
  )
}
