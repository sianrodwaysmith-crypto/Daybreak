import { useEffect, useMemo, useState } from 'react'
import { copy } from '../copy'
import { getStorage } from '../storage'
import { fullDate } from '../dateHelpers'
import type { RoundupEntry, WorryEntry } from '../types'
import { RoundupScreen } from './RoundupScreen'

interface Props {
  onBack: () => void
}

export function ArchiveScreen({ onBack }: Props) {
  const [roundups,  setRoundups]  = useState<RoundupEntry[]>([])
  const [discussed, setDiscussed] = useState<WorryEntry[]>([])
  const [openDate,  setOpenDate]  = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([getStorage().listRoundups(), getStorage().listDiscussedWorries()])
      .then(([rs, ws]) => {
        if (!alive) return
        setRoundups(rs)
        setDiscussed(ws)
      })
    return () => { alive = false }
  }, [])

  const discussedByDate = useMemo(() => {
    const m = new Map<string, WorryEntry[]>()
    for (const w of discussed) {
      const d = w.discussedDate
      if (!d) continue
      const arr = m.get(d) ?? []
      arr.push(w)
      m.set(d, arr)
    }
    return m
  }, [discussed])

  if (openDate) {
    const dayWorries = discussedByDate.get(openDate) ?? []
    return (
      <div>
        <RoundupScreen date={openDate} onBack={() => setOpenDate(null)} />
        {dayWorries.length > 0 && (
          <div className="journal-archive-worries">
            {dayWorries.map(w => (
              <article key={w.id} className="journal-worry-card is-readonly">
                <div className="journal-worry-moment">{w.theMoment}</div>
                {w.whyItStuck && <div className="journal-worry-why">{w.whyItStuck}</div>}
                {w.toBringUp && <div className="journal-worry-bring">{copy.worries.bringUp}: {w.toBringUp}</div>}
              </article>
            ))}
          </div>
        )}
      </div>
    )
  }

  function previewLine(r: RoundupEntry): string {
    const text = [r.whatHappened, r.whatNoticed, r.whatCarrying].filter(Boolean).join(' ').trim()
    const ws = text.split(/\s+/).filter(Boolean)
    if (ws.length === 0) return '—'
    return ws.slice(0, 12).join(' ') + (ws.length > 12 ? '…' : '')
  }

  return (
    <div className="journal-screen">
      <header className="journal-screen-head">
        <button type="button" className="journal-link" onClick={onBack}>{copy.archive.back}</button>
        <span className="journal-screen-title">{copy.archive.title}</span>
        <span className="journal-screen-rightplaceholder" />
      </header>

      <div className="journal-screen-hint">{copy.archive.intro}</div>

      {roundups.length === 0 && <div className="journal-empty">{copy.archive.empty}</div>}

      <ul className="journal-archive-list">
        {roundups.map(r => {
          const day = new Date(r.date + 'T00:00:00').getDay()
          const isWed = day === 3
          const dayWorries = discussedByDate.get(r.date) ?? []
          return (
            <li key={r.date}>
              <button type="button" className="journal-archive-row" onClick={() => setOpenDate(r.date)}>
                <div className="journal-archive-date">{fullDate(r.date)}</div>
                {isWed && dayWorries.length > 0 && (
                  <div className="journal-archive-marker">{copy.archive.therapyMarker(dayWorries.length)}</div>
                )}
                <div className="journal-archive-preview">{previewLine(r)}</div>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
