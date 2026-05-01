import { useEffect, useState } from 'react'
import { copy } from '../copy'
import { getStorage, isEncrypted } from '../storage'
import { todayISO, daysUntilNextWednesday, dayOfWeek, fullDate } from '../dateHelpers'
import type { WorryEntry } from '../types'

interface Props {
  onLock:   () => void
  onSaved?: () => void
}

type Mode = { kind: 'list' } | { kind: 'new' } | { kind: 'detail'; id: string }

/* ====================================================================
   The journal's only surface, post-restructure: a single PIN-gated
   worry bank with three short prompts. Active worries up top, past
   (discussed) ones in a quiet section below — replaces the previous
   separate Archive screen.
==================================================================== */
export function WorryBankScreen({ onLock, onSaved }: Props) {
  const [active, setActive] = useState<WorryEntry[]>([])
  const [past,   setPast]   = useState<WorryEntry[]>([])
  const [mode,   setMode]   = useState<Mode>({ kind: 'list' })
  const [bump,   setBump]   = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([getStorage().listActiveWorries(), getStorage().listDiscussedWorries()])
      .then(([a, p]) => {
        if (!alive) return
        setActive(a)
        setPast(p)
      })
    return () => { alive = false }
  }, [bump])

  function refresh() { setBump(b => b + 1); onSaved?.() }

  if (mode.kind === 'new') {
    return (
      <WorryEditor
        onBack={()  => setMode({ kind: 'list' })}
        onSaved={() => { refresh(); setMode({ kind: 'list' }) }}
      />
    )
  }
  if (mode.kind === 'detail') {
    return (
      <WorryEditor
        worryId={mode.id}
        onBack={()  => setMode({ kind: 'list' })}
        onSaved={() => { refresh(); setMode({ kind: 'list' }) }}
      />
    )
  }

  const days = daysUntilNextWednesday()
  const wedLine = days === 0 ? copy.worries.wedToday : copy.worries.wedFuture(days)

  return (
    <div className="journal-screen">
      <header className="journal-screen-head">
        <span className="journal-screen-title">{copy.worries.title}</span>
        <button type="button" className="journal-link" onClick={onLock}>
          {copy.worries.lock}
        </button>
      </header>

      <p className="journal-home-privacy">
        {isEncrypted() ? copy.worries.privacy : copy.worries.privacy}
      </p>

      <div className="journal-screen-hint">{wedLine}</div>

      <button
        type="button"
        className="mindset-btn complete"
        onClick={() => setMode({ kind: 'new' })}
      >
        {copy.worries.new.toUpperCase()}
      </button>

      {active.length === 0 && past.length === 0 && (
        <div className="journal-empty">{copy.worries.empty}</div>
      )}

      {active.length > 0 && (
        <ul className="journal-worry-list">
          {active.map(w => (
            <li key={w.id}>
              <button type="button" className="journal-worry-card" onClick={() => setMode({ kind: 'detail', id: w.id })}>
                <div className="journal-worry-moment">{w.theMoment}</div>
                {w.whyItStuck && <div className="journal-worry-why">{w.whyItStuck}</div>}
                <div className="journal-worry-bring">
                  {w.toBringUp?.trim()
                    ? <><span className="journal-worry-bring-label">{copy.worries.bringUpLabel}: </span>{w.toBringUp}</>
                    : copy.worries.bringUpEmpty}
                </div>
                <div className="journal-worry-date">{dayOfWeek(w.loggedDate).toUpperCase()}</div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {past.length > 0 && (
        <>
          <div className="mindset-section-divider" />
          <div className="screen-section-label" style={{ marginBottom: 14 }}>{copy.worries.pastLabel}</div>
          <ul className="journal-worry-list">
            {past.map(w => (
              <li key={w.id}>
                <article className="journal-worry-card is-readonly">
                  <div className="journal-worry-moment">{w.theMoment}</div>
                  {w.whyItStuck && <div className="journal-worry-why">{w.whyItStuck}</div>}
                  {w.toBringUp && (
                    <div className="journal-worry-bring">
                      <span className="journal-worry-bring-label">{copy.worries.bringUpLabel}: </span>{w.toBringUp}
                    </div>
                  )}
                  <div className="journal-worry-date">
                    {w.discussedDate ? fullDate(w.discussedDate).toUpperCase() : ''}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

/* --------------------------------------------------------------------
   Editor — three prompts in the same shape as Daily Mindset's section
   blocks (uppercase label, big textarea), so the two surfaces feel
   like the same family. Save sits at the bottom as a primary CTA.
-------------------------------------------------------------------- */

interface EditorProps {
  worryId?: string
  onBack:   () => void
  onSaved:  () => void
}

function WorryEditor({ worryId, onBack, onSaved }: EditorProps) {
  const [moment,   setMoment]   = useState('')
  const [why,      setWhy]      = useState('')
  const [bring,    setBring]    = useState('')
  const [busy,     setBusy]     = useState(false)
  const [existing, setExisting] = useState<WorryEntry | null>(null)

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

  const canSave = moment.trim().length > 0

  return (
    <div className="journal-screen">
      <header className="journal-screen-head">
        <button type="button" className="journal-link" onClick={onBack}>{copy.worries.back}</button>
        <span className="journal-screen-title">{copy.worries.title}</span>
        <span className="journal-screen-rightplaceholder" />
      </header>

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">{copy.worries.moment}</div>
        <textarea
          className="mindset-textarea"
          value={moment}
          onChange={e => setMoment(e.target.value)}
          placeholder={copy.worries.momentPlaceholder}
          rows={3}
          autoFocus
        />
      </div>

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">{copy.worries.why}</div>
        <textarea
          className="mindset-textarea"
          value={why}
          onChange={e => setWhy(e.target.value)}
          placeholder={copy.worries.whyPlaceholder}
          rows={3}
        />
      </div>

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">{copy.worries.bringUp}</div>
        <textarea
          className="mindset-textarea"
          value={bring}
          onChange={e => setBring(e.target.value)}
          placeholder={copy.worries.bringUpPlaceholder}
          rows={2}
        />
      </div>

      <button
        type="button"
        className={canSave ? 'mindset-btn complete' : 'mindset-btn incomplete'}
        onClick={save}
        disabled={busy || !canSave}
      >
        {busy ? copy.worries.saveBusy : copy.worries.save}
      </button>

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
