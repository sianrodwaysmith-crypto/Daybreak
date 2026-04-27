import { useEffect, useState } from 'react'
import { copy } from '../copy'
import { getStorage, isEncrypted } from '../storage'
import { todayISO, dayOfWeek, monthName } from '../dateHelpers'
import type { RoundupEntry, WorryEntry } from '../types'

interface Props {
  onLock:        () => void
  onOpenRoundup: () => void
  onOpenWorries: () => void
  onOpenArchive: () => void
  /** Bump to force a refresh after a child screen saves. */
  refreshKey:    number
}

function previewLine(text: string, words = 10): string {
  const ws = text.trim().split(/\s+/).filter(Boolean)
  if (ws.length === 0) return ''
  return ws.slice(0, words).join(' ') + (ws.length > words ? '…' : '')
}

export function HomeScreen({ onLock, onOpenRoundup, onOpenWorries, onOpenArchive, refreshKey }: Props) {
  const [todaysRoundup, setTodaysRoundup] = useState<RoundupEntry | null>(null)
  const [activeWorries, setActiveWorries] = useState<WorryEntry[]>([])
  const [allRoundups,   setAllRoundups]   = useState<RoundupEntry[]>([])

  useEffect(() => {
    const s = getStorage()
    let alive = true
    Promise.all([s.getRoundup(todayISO()), s.listActiveWorries(), s.listRoundups()])
      .then(([r, w, all]) => {
        if (!alive) return
        setTodaysRoundup(r)
        setActiveWorries(w)
        setAllRoundups(all)
      })
    return () => { alive = false }
  }, [refreshKey])

  const today = todayISO()
  const todayDow = dayOfWeek(today)

  const roundupBody = todaysRoundup && hasContent(todaysRoundup)
    ? previewLine(joinAnswers(todaysRoundup), 10)
    : copy.home.roundup.empty

  const earliestDate = allRoundups.length > 0
    ? allRoundups[allRoundups.length - 1].date
    : null

  return (
    <div className="journal-home">
      <header className="journal-home-head">
        <span className="journal-home-label">{copy.home.label}</span>
        <button type="button" className="journal-home-lock" onClick={onLock}>
          {copy.home.lock}
        </button>
      </header>

      <p className="journal-home-privacy">
        {isEncrypted() ? copy.home.privacyEncrypted : copy.home.privacyUnencrypted}
      </p>

      <button type="button" className="journal-card" onClick={onOpenRoundup}>
        <div className="journal-card-head">
          <span className="journal-card-title">{copy.home.roundup.title}</span>
          <span className="journal-card-meta">{todayDow}</span>
        </div>
        <p className="journal-card-body">{roundupBody}</p>
      </button>

      <button type="button" className="journal-card" onClick={onOpenWorries}>
        <div className="journal-card-head">
          <span className="journal-card-title">{copy.home.worry.title}</span>
          {activeWorries.length > 0 && (
            <span className="journal-card-meta">{copy.home.worry.sitting(activeWorries.length)}</span>
          )}
        </div>
        <p className="journal-card-body">{copy.home.worry.empty}</p>
      </button>

      <button type="button" className="journal-card" onClick={onOpenArchive}>
        <div className="journal-card-head">
          <span className="journal-card-title">{copy.home.archive.title}</span>
          {earliestDate && (
            <span className="journal-card-meta">{copy.home.archive.since(monthName(earliestDate))}</span>
          )}
        </div>
        <p className="journal-card-body">{copy.home.archive.empty}</p>
      </button>
    </div>
  )
}

function joinAnswers(r: RoundupEntry): string {
  return [r.whatHappened, r.whatNoticed, r.whatCarrying].filter(Boolean).join(' ').trim()
}
function hasContent(r: RoundupEntry): boolean {
  return Boolean((r.whatHappened || '').trim() || (r.whatNoticed || '').trim() || (r.whatCarrying || '').trim())
}
