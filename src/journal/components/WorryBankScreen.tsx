import { useEffect, useState } from 'react'
import { copy } from '../copy'
import { getStorage } from '../storage'
import { todayISO, daysUntilNextWednesday, dayOfWeek } from '../dateHelpers'
import type { WorryEntry } from '../types'

interface Props {
  onBack:   () => void
  onSaved?: () => void
}

type Mode = { kind: 'list' } | { kind: 'new' } | { kind: 'detail'; id: string }

export function WorryBankScreen({ onBack, onSaved }: Props) {
  const [active, setActive] = useState<WorryEntry[]>([])
  const [mode,   setMode]   = useState<Mode>({ kind: 'list' })
  const [bump,   setBump]   = useState(0)

  useEffect(() => {
    let alive = true
    getStorage().listActiveWorries().then(ws => { if (alive) setActive(ws) })
    return () => { alive = false }
  }, [bump])

  function refresh() { setBump(b => b + 1); onSaved?.() }

  if (mode.kind === 'new') {
    return (
      <WorryEditor
        onBack={() => setMode({ kind: 'list' })}
        onSaved={() => { refresh(); setMode({ kind: 'list' }) }}
      />
    )
  }
  if (mode.kind === 'detail') {
    return (
      <WorryEditor
        worryId={mode.id}
        onBack={() => setMode({ kind: 'list' })}
        onSaved={() => { refresh(); setMode({ kind: 'list' }) }}
      />
    )
  }

  const days = daysUntilNextWednesday()
  const wedLine = days === 0 ? copy.worries.wedToday : copy.worries.wedFuture(days)

  return (
    <div className="journal-screen">
      <header className="journal-screen-head">
        <button type="button" className="journal-link" onClick={onBack}>{copy.worries.back}</button>
        <span className="journal-screen-title">{copy.worries.title}</span>
        <button type="button" className="journal-pill" onClick={() => setMode({ kind: 'new' })}>
          {copy.worries.new}
        </button>
      </header>

      <div className="journal-screen-hint">{wedLine}</div>

      {active.length === 0 && <div className="journal-empty">{copy.worries.empty}</div>}

      <ul className="journal-worry-list">
        {active.map(w => (
          <li key={w.id}>
            <button type="button" className="journal-worry-card" onClick={() => setMode({ kind: 'detail', id: w.id })}>
              <div className="journal-worry-moment">{w.theMoment}</div>
              {w.whyItStuck && <div className="journal-worry-why">{w.whyItStuck}</div>}
              <div className="journal-worry-bring">
                {w.toBringUp?.trim()
                  ? <><span className="journal-worry-bring-label">{copy.worries.bringUp}: </span>{w.toBringUp}</>
                  : copy.worries.bringUpEmpty}
              </div>
              <div className="journal-worry-date">{dayOfWeek(w.loggedDate).toUpperCase()}</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

interface EditorProps {
  worryId?: string
  onBack:   () => void
  onSaved:  () => void
}

function WorryEditor({ worryId, onBack, onSaved }: EditorProps) {
  const [moment,    setMoment]   = useState('')
  const [why,       setWhy]      = useState('')
  const [bring,     setBring]    = useState('')
  const [busy,      setBusy]     = useState(false)
  const [existing,  setExisting] = useState<WorryEntry | null>(null)

  useEffect(() => {
    if (!worryId) return
    let alive = true
    getStorage().getWorry(worryId).then(w => {
      if (!alive || !w) return
      setExisting(w)
      setMoment(w.theMoment)
      setWhy(w.whyItStuck)
      setBring(w.toBringUp ?? '')
    })
    return () => { alive = false }
  }, [worryId])

  async function save() {
    if (busy) return
    const m = moment.trim()
    if (!m) { onBack(); return }
    setBusy(true)
    try {
      const now = new Date().toISOString()
      const entry: WorryEntry = existing
        ? { ...existing, theMoment: m, whyItStuck: why.trim(), toBringUp: bring.trim() || undefined, updatedAt: now }
        : {
            id:         `worry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            loggedDate: todayISO(),
            theMoment:  m,
            whyItStuck: why.trim(),
            toBringUp:  bring.trim() || undefined,
            status:     'sitting',
            createdAt:  now,
            updatedAt:  now,
          }
      await getStorage().saveWorry(entry)
      onSaved()
    } finally { setBusy(false) }
  }

  async function setStatus(status: WorryEntry['status']) {
    if (!existing || busy) return
    setBusy(true)
    try {
      const now = new Date().toISOString()
      const next: WorryEntry = {
        ...existing,
        status,
        discussedDate: status === 'discussed' ? todayISO() : undefined,
        updatedAt:     now,
      }
      await getStorage().saveWorry(next)
      onSaved()
    } finally { setBusy(false) }
  }

  async function deleteIt() {
    if (!existing || busy) return
    setBusy(true)
    try {
      await getStorage().deleteWorry(existing.id)
      onSaved()
    } finally { setBusy(false) }
  }

  return (
    <div className="journal-screen">
      <header className="journal-screen-head">
        <button type="button" className="journal-link" onClick={onBack}>{copy.worries.back}</button>
        <span className="journal-screen-title">{existing ? copy.worries.title : copy.worries.new}</span>
        <button type="button" className="journal-pill" onClick={save} disabled={busy}>{copy.worries.saveNew}</button>
      </header>

      <div className="journal-question-block">
        <div className="journal-question-label">{copy.worries.moment}</div>
        <textarea
          className="journal-textarea"
          value={moment}
          onChange={(e) => setMoment(e.target.value)}
          rows={2}
          autoFocus
        />
      </div>

      <div className="journal-question-block">
        <div className="journal-question-label">{copy.worries.why}</div>
        <textarea
          className="journal-textarea"
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          rows={3}
        />
      </div>

      <div className="journal-question-block">
        <div className="journal-question-label">{copy.worries.bringUp}</div>
        <textarea
          className="journal-textarea"
          value={bring}
          onChange={(e) => setBring(e.target.value)}
          rows={2}
        />
      </div>

      {existing && (
        <div className="journal-actions">
          <button type="button" className="journal-action-primary" onClick={() => setStatus('discussed')}     disabled={busy}>
            {copy.worries.discussed}
          </button>
          <button type="button" className="journal-action-quiet"   onClick={() => setStatus('still_sitting')} disabled={busy}>
            {copy.worries.stillSitting}
          </button>
          <button type="button" className="journal-action-quiet"   onClick={deleteIt}                          disabled={busy}>
            {copy.worries.delete}
          </button>
        </div>
      )}
    </div>
  )
}
