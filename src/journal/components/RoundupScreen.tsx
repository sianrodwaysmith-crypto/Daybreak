import { useEffect, useRef, useState } from 'react'
import { copy } from '../copy'
import { getStorage } from '../storage'
import { todayISO, fullDate } from '../dateHelpers'
import type { RoundupEntry } from '../types'

interface Props {
  /** When set, the screen renders an existing past entry in read-only mode. */
  date?:    string
  onBack:   () => void
  onSaved?: () => void
}

function autosize(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function RoundupScreen({ date, onBack, onSaved }: Props) {
  const targetDate  = date ?? todayISO()
  const isHistorical = Boolean(date) && date !== todayISO()

  const [a1, setA1] = useState('')
  const [a2, setA2] = useState('')
  const [a3, setA3] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [busy,   setBusy]   = useState(false)
  const t1 = useRef<HTMLTextAreaElement | null>(null)
  const t2 = useRef<HTMLTextAreaElement | null>(null)
  const t3 = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    let alive = true
    getStorage().getRoundup(targetDate).then(r => {
      if (!alive) return
      if (r) {
        setA1(r.whatHappened ?? '')
        setA2(r.whatNoticed  ?? '')
        setA3(r.whatCarrying ?? '')
      }
      setLoaded(true)
    })
    return () => { alive = false }
  }, [targetDate])

  // Autosize once content is loaded and on each keystroke.
  useEffect(() => { if (loaded) { autosize(t1.current); autosize(t2.current); autosize(t3.current) } }, [loaded])

  async function save() {
    if (busy || isHistorical) return
    const w1 = a1.trim(), w2 = a2.trim(), w3 = a3.trim()
    if (!w1 && !w2 && !w3) {
      // Silent no-op per the brief.
      onBack()
      return
    }
    setBusy(true)
    try {
      const existing = await getStorage().getRoundup(targetDate)
      const now = new Date().toISOString()
      const entry: RoundupEntry = existing
        ? { ...existing, whatHappened: w1 || undefined, whatNoticed: w2 || undefined, whatCarrying: w3 || undefined, updatedAt: now }
        : {
            id: `roundup-${targetDate}`,
            date: targetDate,
            whatHappened: w1 || undefined,
            whatNoticed:  w2 || undefined,
            whatCarrying: w3 || undefined,
            createdAt: now,
            updatedAt: now,
          }
      await getStorage().saveRoundup(entry)
      onSaved?.()
      onBack()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="journal-screen">
      <header className="journal-screen-head">
        <button type="button" className="journal-link" onClick={onBack}>{copy.roundup.back}</button>
        <span className="journal-screen-title">{copy.roundup.title}</span>
        {isHistorical
          ? <span className="journal-screen-rightplaceholder" />
          : <button type="button" className="journal-pill" onClick={save} disabled={busy}>{copy.roundup.save}</button>}
      </header>

      <div className="journal-screen-meta">{fullDate(targetDate)}</div>
      {!isHistorical && <div className="journal-screen-hint">{copy.roundup.questionsHint}</div>}

      {[
        { q: copy.roundup.questions[0], v: a1, set: setA1, ref: t1 },
        { q: copy.roundup.questions[1], v: a2, set: setA2, ref: t2 },
        { q: copy.roundup.questions[2], v: a3, set: setA3, ref: t3 },
      ].map((row, i) => (
        <div key={i} className="journal-question-block">
          <div className="journal-question-label">{row.q}</div>
          <textarea
            ref={row.ref}
            className="journal-textarea"
            value={row.v}
            readOnly={isHistorical}
            onChange={(e) => { row.set(e.target.value); autosize(e.target) }}
            rows={3}
          />
        </div>
      ))}
    </div>
  )
}
