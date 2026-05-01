import { useState, useEffect } from 'react'
import { generateMindsetReflection } from '../services/anthropic'
import { useDayBreakContext } from '../contexts/DayBreakContext'
import { quoteForDay } from '../data/quotes'

const TODAY = new Date().toISOString().split('T')[0]
const KEY = `daybreak-mindset-${TODAY}`

/* --------------------------------------------------------------------
   Saved shape — single localStorage entry per day with both halves
   of the 5-Min-Journal pattern. Evening fields are optional in older
   payloads written before the morning/evening split shipped, so the
   loader treats them all as Partial.
-------------------------------------------------------------------- */
interface Saved {
  // Morning
  g1: string; g2: string; g3: string
  greatDay: string
  affirmation: string
  reflection: string
  // Evening (added in the morning/evening split)
  amazing1?: string
  amazing2?: string
  amazing3?: string
  betterHow?: string
}

/**
 * Whether today's mindset entry has anything in it. Either half — the
 * morning intention block OR the evening reflection block — counts.
 * Per CLAUDE.md spirit on Lessons, evening is bonus and never required:
 * doing the morning alone keeps the dot green for the whole day.
 */
export function hasMindsetEntryToday(): boolean {
  try {
    const today = new Date().toISOString().split('T')[0]
    const raw = localStorage.getItem(`daybreak-mindset-${today}`)
    if (!raw) return false
    const e = JSON.parse(raw) as Partial<Saved>
    const morningDone = !!(e?.greatDay?.trim() || e?.affirmation?.trim())
    const eveningDone = !!(e?.amazing1?.trim() || e?.amazing2?.trim() ||
                           e?.amazing3?.trim() || e?.betterHow?.trim())
    return morningDone || eveningDone
  } catch { return false }
}

/* --------------------------------------------------------------------
   History helpers — scan localStorage for every daybreak-mindset-*
   key, return parsed entries newest-first. The scan is in-memory and
   cheap (<= a few hundred entries even for heavy users).
-------------------------------------------------------------------- */
interface PastEntry { date: string; e: Partial<Saved> }

function listPastEntries(): PastEntry[] {
  const out: PastEntry[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key || !key.startsWith('daybreak-mindset-')) continue
    const date = key.slice('daybreak-mindset-'.length)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      out.push({ date, e: JSON.parse(raw) as Partial<Saved> })
    } catch { /* skip malformed */ }
  }
  out.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  return out
}

const STOP_WORDS = new Set([
  'i', 'a', 'an', 'the', 'and', 'or', 'but', 'so', 'as', 'of', 'in', 'on',
  'at', 'to', 'for', 'with', 'by', 'is', 'am', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'my', 'me',
  'we', 'us', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them',
  'this', 'that', 'these', 'those', 'a', 'one', 'some', 'any', 'all',
  'just', 'will', 'can', 'would', 'could', 'should', 'about', 'from',
])

/**
 * Lower-case a string, strip punctuation, split into words, drop stop
 * words and anything < 3 chars. Used to build the "what comes up
 * most" frequency map for the morning gratitudes.
 */
function tokenise(s: string): string[] {
  return s.toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
}

function topWordsFromGratitudes(entries: PastEntry[], topN: number): Array<{ word: string; count: number }> {
  const counts = new Map<string, number>()
  for (const { e } of entries) {
    for (const t of [e.g1, e.g2, e.g3]) {
      if (!t) continue
      for (const w of tokenise(t)) {
        counts.set(w, (counts.get(w) ?? 0) + 1)
      }
    }
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 2)                    // hide hapax legomena
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }))
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export default function MindsetScreen() {
  const { registerContent } = useDayBreakContext()

  // Morning state
  const [g1, setG1]                         = useState('')
  const [g2, setG2]                         = useState('')
  const [g3, setG3]                         = useState('')
  const [greatDay, setGreatDay]             = useState('')
  const [affirmation, setAffirm]            = useState('')
  const [morningSubmitted, setMSubmitted]   = useState(false)
  const [reflection, setReflection]         = useState('')
  const [morningLoading, setMLoading]       = useState(false)

  // Evening state
  const [amazing1, setAmazing1]             = useState('')
  const [amazing2, setAmazing2]             = useState('')
  const [amazing3, setAmazing3]             = useState('')
  const [betterHow, setBetterHow]           = useState('')
  const [eveningSubmitted, setESubmitted]   = useState(false)

  // 'edit' = today's morning + evening form. 'history' = past entries
  // browser, opened via the link below the form.
  const [view, setView] = useState<'edit' | 'history'>('edit')

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (!saved) return
    let e: Partial<Saved>
    try { e = JSON.parse(saved) } catch { return }

    setG1(e.g1 ?? '')
    setG2(e.g2 ?? '')
    setG3(e.g3 ?? '')
    setGreatDay(e.greatDay ?? '')
    setAffirm(e.affirmation ?? '')
    setReflection(e.reflection ?? '')
    if ((e.greatDay && e.greatDay.trim()) || (e.affirmation && e.affirmation.trim())) {
      setMSubmitted(true)
    }

    setAmazing1(e.amazing1 ?? '')
    setAmazing2(e.amazing2 ?? '')
    setAmazing3(e.amazing3 ?? '')
    setBetterHow(e.betterHow ?? '')
    if ((e.amazing1 && e.amazing1.trim()) || (e.amazing2 && e.amazing2.trim()) ||
        (e.amazing3 && e.amazing3.trim()) || (e.betterHow && e.betterHow.trim())) {
      setESubmitted(true)
    }

    registerContent('mindset', {
      gratitude:   [e.g1, e.g2, e.g3].filter(Boolean),
      great_day:   e.greatDay,
      affirmation: e.affirmation,
      reflection:  e.reflection,
      evening: {
        amazing:    [e.amazing1, e.amazing2, e.amazing3].filter(Boolean),
        better_how: e.betterHow,
      },
    })
  }, [registerContent])

  function persistAll(overrides: Partial<Saved> = {}): Saved {
    const snap: Saved = {
      g1, g2, g3, greatDay, affirmation, reflection,
      amazing1, amazing2, amazing3, betterHow,
      ...overrides,
    }
    // If absolutely nothing is filled in, drop the row instead of
    // writing an empty stub.
    const anything = [snap.g1, snap.g2, snap.g3, snap.greatDay, snap.affirmation,
                      snap.amazing1, snap.amazing2, snap.amazing3, snap.betterHow]
                      .some(s => (s ?? '').trim())
    if (anything) localStorage.setItem(KEY, JSON.stringify(snap))
    else          localStorage.removeItem(KEY)
    return snap
  }

  function broadcast(snap: Saved) {
    registerContent('mindset', {
      gratitude:   [snap.g1, snap.g2, snap.g3].filter(Boolean),
      great_day:   snap.greatDay,
      affirmation: snap.affirmation,
      reflection:  snap.reflection,
      evening: {
        amazing:    [snap.amazing1, snap.amazing2, snap.amazing3].filter(Boolean),
        better_how: snap.betterHow,
      },
    })
  }

  /* ----- Morning ----- */
  const morningAllFilled =
    g1.trim() && g2.trim() && g3.trim() && greatDay.trim() && affirmation.trim()

  const handleMorningSubmit = async () => {
    if (!morningAllFilled || morningLoading) return
    setMLoading(true)
    try {
      const result = await generateMindsetReflection(g1, g2, g3, greatDay, affirmation)
      setReflection(result)
      setMSubmitted(true)
      const snap = persistAll({ reflection: result })
      broadcast(snap)
    } finally {
      setMLoading(false)
    }
  }

  const handleMorningReset = () => {
    setG1(''); setG2(''); setG3('')
    setGreatDay(''); setAffirm('')
    setReflection(''); setMSubmitted(false); setMLoading(false)
    const snap = persistAll({
      g1: '', g2: '', g3: '', greatDay: '', affirmation: '', reflection: '',
    })
    broadcast(snap)
  }

  const morningBtnClass =
    morningLoading        ? 'mindset-btn loading'    :
    morningAllFilled      ? 'mindset-btn complete'   :
                            'mindset-btn incomplete'
  const morningBtnText =
    morningAllFilled ? 'SET MY MINDSET →' : 'FILL IN ALL FIELDS TO CONTINUE'

  const GRATITUDE_FIELDS = [
    { num: 1, val: g1, set: setG1, placeholder: 'Something small that matters...' },
    { num: 2, val: g2, set: setG2, placeholder: 'A person in your corner...' },
    { num: 3, val: g3, set: setG3, placeholder: 'Something you often overlook...' },
  ]

  /* ----- Evening ----- */
  const eveningAllFilled =
    amazing1.trim() && amazing2.trim() && amazing3.trim() && betterHow.trim()

  const handleEveningSubmit = () => {
    if (!eveningAllFilled) return
    setESubmitted(true)
    const snap = persistAll()
    broadcast(snap)
  }

  const handleEveningReset = () => {
    setAmazing1(''); setAmazing2(''); setAmazing3('')
    setBetterHow(''); setESubmitted(false)
    const snap = persistAll({ amazing1: '', amazing2: '', amazing3: '', betterHow: '' })
    broadcast(snap)
  }

  const eveningBtnClass = eveningAllFilled ? 'mindset-btn complete' : 'mindset-btn incomplete'
  const eveningBtnText  = eveningAllFilled ? 'CLOSE THE DAY →'      : 'FILL IN ALL FIELDS TO CONTINUE'

  const AMAZING_FIELDS = [
    { num: 1, val: amazing1, set: setAmazing1, placeholder: 'Something that lifted you...' },
    { num: 2, val: amazing2, set: setAmazing2, placeholder: 'A small win you almost missed...' },
    { num: 3, val: amazing3, set: setAmazing3, placeholder: "Someone who showed up..." },
  ]

  const quote = quoteForDay()

  if (view === 'history') {
    return <MindsetHistoryView onBack={() => setView('edit')} />
  }

  return (
    <div>
      <div className="mindset-quote">
        <span className="mindset-quote-text">“{quote.text}”</span>
        <span className="mindset-quote-attr"> {quote.attribution}.</span>
      </div>

      {/* ---------------- MORNING ---------------- */}
      <div className="screen-section-label" style={{ marginBottom: 6 }}>MORNING</div>
      <p className="mindset-section-sub">Set the day in three minutes.</p>

      <div className="screen-section-label" style={{ marginBottom: 14 }}>THREE THINGS I'M GRATEFUL FOR</div>

      {GRATITUDE_FIELDS.map(({ num, val, set, placeholder }) => (
        <div key={num} className="mindset-field-row">
          <div className={`mindset-badge${val.trim() ? ' filled' : ''}`}>{num}</div>
          <input
            className="mindset-input"
            type="text"
            value={val}
            onChange={e => set(e.target.value)}
            placeholder={placeholder}
            disabled={morningSubmitted}
          />
        </div>
      ))}

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">WHAT WOULD MAKE TODAY GREAT</div>
        <textarea
          className="mindset-textarea"
          value={greatDay}
          onChange={e => setGreatDay(e.target.value)}
          placeholder="If I do this one thing, today will feel like a win..."
          disabled={morningSubmitted}
          rows={3}
        />
      </div>

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">DAILY AFFIRMATION</div>
        <textarea
          className="mindset-textarea"
          value={affirmation}
          onChange={e => setAffirm(e.target.value)}
          placeholder="I am..."
          disabled={morningSubmitted}
          rows={2}
        />
      </div>

      {!morningSubmitted && (
        <button
          className={morningBtnClass}
          onClick={handleMorningSubmit}
          disabled={!morningAllFilled || morningLoading}
        >
          {morningLoading ? (
            <div className="mindset-dots">
              <div className="mindset-dot" />
              <div className="mindset-dot" />
              <div className="mindset-dot" />
            </div>
          ) : morningBtnText}
        </button>
      )}

      {morningSubmitted && reflection && (
        <>
          <div className="mindset-divider">
            <div className="mindset-divider-line" />
            <div className="mindset-divider-label">YOUR REFLECTION</div>
            <div className="mindset-divider-line" />
          </div>
          <div className="mindset-reflection">{reflection}</div>
          <button className="mindset-reset-btn" onClick={handleMorningReset}>RESET</button>
        </>
      )}

      {/* ---------------- EVENING ---------------- */}
      <div className="mindset-section-divider" />
      <div className="screen-section-label" style={{ marginBottom: 6 }}>EVENING</div>
      <p className="mindset-section-sub">Close the day in three minutes.</p>

      <div className="screen-section-label" style={{ marginBottom: 14 }}>THREE AMAZING THINGS THAT HAPPENED TODAY</div>

      {AMAZING_FIELDS.map(({ num, val, set, placeholder }) => (
        <div key={num} className="mindset-field-row">
          <div className={`mindset-badge${val.trim() ? ' filled' : ''}`}>{num}</div>
          <input
            className="mindset-input"
            type="text"
            value={val}
            onChange={e => set(e.target.value)}
            placeholder={placeholder}
            disabled={eveningSubmitted}
          />
        </div>
      ))}

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">HOW COULD I HAVE MADE TODAY BETTER</div>
        <textarea
          className="mindset-textarea"
          value={betterHow}
          onChange={e => setBetterHow(e.target.value)}
          placeholder="A small change that would have helped..."
          disabled={eveningSubmitted}
          rows={3}
        />
      </div>

      {!eveningSubmitted && (
        <button
          className={eveningBtnClass}
          onClick={handleEveningSubmit}
          disabled={!eveningAllFilled}
        >
          {eveningBtnText}
        </button>
      )}

      {eveningSubmitted && (
        <button className="mindset-reset-btn" onClick={handleEveningReset}>RESET EVENING</button>
      )}

      <button
        type="button"
        className="mindset-history-link"
        onClick={() => setView('history')}
      >
        View past entries →
      </button>
    </div>
  )
}

/* ====================================================================
   MindsetHistoryView — read-only browser for every past mindset entry
   on this device. Shows a small "themes" line on top (most-mentioned
   gratitude words once N >= 5 entries) followed by a reverse-chrono
   stack of cards. Designed to feel like flipping through a notebook,
   not like a dashboard.
==================================================================== */

interface HistoryProps { onBack: () => void }

function MindsetHistoryView({ onBack }: HistoryProps) {
  const entries = listPastEntries()
  const themes  = entries.length >= 5 ? topWordsFromGratitudes(entries, 3) : []

  return (
    <div className="mindset-history">
      <header className="mindset-history-head">
        <button type="button" className="mindset-history-back" onClick={onBack}>← back</button>
        <span className="mindset-history-title">past entries</span>
        <span className="mindset-history-count">{entries.length}</span>
      </header>

      {entries.length === 0 && (
        <p className="mindset-history-empty">Your past entries will appear here as you fill them in.</p>
      )}

      {themes.length > 0 && (
        <p className="mindset-history-themes">
          What comes up most:{' '}
          {themes.map((t, i) => (
            <span key={t.word}>
              <span className="mindset-history-theme-word">{t.word}</span>
              <span className="mindset-history-theme-count"> ({t.count})</span>
              {i < themes.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
      )}

      <ul className="mindset-history-list">
        {entries.map(({ date, e }) => {
          const grats   = [e.g1, e.g2, e.g3].filter((s): s is string => !!s && !!s.trim())
          const amazing = [e.amazing1, e.amazing2, e.amazing3].filter((s): s is string => !!s && !!s.trim())
          const hasMorning = grats.length > 0 || (e.greatDay && e.greatDay.trim()) || (e.affirmation && e.affirmation.trim())
          const hasEvening = amazing.length > 0 || (e.betterHow && e.betterHow.trim())

          return (
            <li key={date} className="mindset-history-card">
              <div className="mindset-history-date">{formatDate(date)}</div>

              {hasMorning && (
                <>
                  <div className="mindset-history-eyebrow">MORNING</div>
                  {grats.length > 0 && (
                    <ul className="mindset-history-bullets">
                      {grats.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  )}
                  {e.greatDay && e.greatDay.trim() && (
                    <p className="mindset-history-line"><em>What would make today great:</em> {e.greatDay}</p>
                  )}
                  {e.affirmation && e.affirmation.trim() && (
                    <p className="mindset-history-line"><em>Affirmation:</em> {e.affirmation}</p>
                  )}
                </>
              )}

              {hasEvening && (
                <>
                  <div className="mindset-history-eyebrow">EVENING</div>
                  {amazing.length > 0 && (
                    <ul className="mindset-history-bullets">
                      {amazing.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  )}
                  {e.betterHow && e.betterHow.trim() && (
                    <p className="mindset-history-line"><em>How today could've been better:</em> {e.betterHow}</p>
                  )}
                </>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
