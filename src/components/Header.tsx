const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const MARCUS_QUOTES: string[] = [
  'You have power over your mind, not outside events. Realize this, and you will find strength.',
  'The happiness of your life depends upon the quality of your thoughts.',
  'Waste no more time arguing what a good man should be. Be one.',
  'When you arise in the morning, think of what a precious privilege it is to be alive: to breathe, to think, to enjoy, to love.',
  'What we do now echoes in eternity.',
  'The impediment to action advances action. What stands in the way becomes the way.',
  'Confine yourself to the present.',
  'Very little is needed to make a happy life; it is all within yourself, in your way of thinking.',
  'The soul becomes dyed with the color of its thoughts.',
  'Begin. To begin is half the work.',
  'It is not death that a man should fear, but he should fear never beginning to live.',
  'You have to assemble your life yourself, action by action.',
]

function quoteForDay(d: Date): string {
  // Stable across the day, rotates each day. Day-of-year-ish hash.
  const start = Date.UTC(d.getUTCFullYear(), 0, 0)
  const day   = Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - start) / 86400000)
  return MARCUS_QUOTES[day % MARCUS_QUOTES.length]
}

interface Props {
  readinessScore: number | null
  readinessColor: string
  onSettings: () => void
  viewedDate?:    Date
  isToday?:       boolean
  onReturnToToday?: () => void
}

export default function Header({
  readinessScore, readinessColor, onSettings,
  viewedDate, isToday = true, onReturnToToday,
}: Props) {
  const ref  = viewedDate ?? new Date()
  const day  = DAYS[ref.getDay()]
  const date = `${day}, ${ref.getDate()} ${MONTHS[ref.getMonth()]}`
  const quote = quoteForDay(ref)

  const barWidth = readinessScore != null ? `${readinessScore}%` : '0%'
  const labelText = readinessScore != null ? `Readiness ${readinessScore}` : 'Readiness'

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-mark">
          <span className="header-mark-dot" aria-hidden />
          <span className="header-mark-word">daybreak</span>
        </div>
        <button className="header-settings" onClick={onSettings} aria-label="Settings">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
      <div className="header-greeting">Good morning, Siân.</div>
      <div className="header-quote">
        <span className="header-quote-text">“{quote}”</span>
        <span className="header-quote-attr"> Marcus Aurelius.</span>
      </div>
      <div className="header-date">
        {date}
        {!isToday && onReturnToToday && (
          <button type="button" className="header-today-pill" onClick={onReturnToToday}>
            today
          </button>
        )}
      </div>

      <div className="header-readiness">
        <div className="header-readiness-bar">
          <div className="header-readiness-fill" style={{ width: barWidth, background: readinessColor }} />
        </div>
        <div className="header-readiness-label">{labelText}</div>
      </div>
    </header>
  )
}
