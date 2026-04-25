const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface Props {
  readinessScore: number | null
  readinessColor: string
  onSettings: () => void
}

export default function Header({ readinessScore, readinessColor, onSettings }: Props) {
  const now  = new Date()
  const day  = DAYS[now.getDay()]
  const date = `${day}, ${now.getDate()} ${MONTHS[now.getMonth()]}`

  const barWidth = readinessScore != null ? `${readinessScore}%` : '0%'
  const labelText = readinessScore != null ? `Readiness ${readinessScore}` : 'Readiness —'

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
      <div className="header-date">{date}</div>

      <div className="header-readiness">
        <div className="header-readiness-bar">
          <div className="header-readiness-fill" style={{ width: barWidth, background: readinessColor }} />
        </div>
        <div className="header-readiness-label">{labelText}</div>
      </div>
    </header>
  )
}
