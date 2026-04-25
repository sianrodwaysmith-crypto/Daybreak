const DAYS   = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

interface Props {
  readinessScore: number
  readinessColor: string
  onSettings: () => void
}

export default function Header({ readinessScore, readinessColor, onSettings }: Props) {
  const now  = new Date()
  const day  = DAYS[now.getDay()]
  const date = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  return (
    <header className="header">
      <div className="header-top-row">
        <div className="header-app-name">DAYBREAK</div>
        <button className="header-gear-btn" onClick={onSettings} aria-label="Settings">⚙️</button>
      </div>
      <div className="header-day">{day}</div>
      <div className="header-date">{date}</div>
      <div className="readiness-bar-wrap">
        <div className="readiness-bar-fill" style={{ width: `${readinessScore}%`, background: readinessColor }} />
      </div>
      <div className="readiness-label" style={{ color: readinessColor }}>
        READINESS {readinessScore}
      </div>
    </header>
  )
}
