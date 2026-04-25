interface Props {
  score:            number | null
  hrv?:             number | null
  rhr?:             number | null
  sleep?:           number | null
  sleepEfficiency?: number | null
  sleepConsistency?:number | null
  sleepHours?:      number | null
  remHours?:        number | null
  deepHours?:       number | null
  strain?:          number | null
  avgHr?:           number | null
  maxHr?:           number | null
  connected:        boolean
}

function recoveryColor(s: number | null | undefined): string {
  if (s == null)   return '#64748b'
  if (s >= 67) return '#4ade80'
  if (s >= 34) return '#ffc800'
  return '#f87171'
}
function recoveryLabel(s: number | null | undefined): string {
  if (s == null)   return '—'
  if (s >= 67) return 'GREEN'
  if (s >= 34) return 'YELLOW'
  return 'RED'
}
function strainColor(s: number | null | undefined): string {
  if (s == null)   return '#64748b'
  if (s < 10) return '#64b5f6'
  if (s < 14) return '#4ade80'
  if (s < 18) return '#f59e0b'
  return '#f87171'
}
function strainLabel(s: number | null | undefined): string {
  if (s == null)   return '—'
  if (s < 10) return 'LIGHT'
  if (s < 14) return 'MODERATE'
  if (s < 18) return 'HIGH'
  return 'ALL OUT'
}

const R    = 70
const CIRC = 2 * Math.PI * R

function fmt(val: number | null | undefined, fallback = '—'): string {
  if (val == null) return fallback
  return Number.isInteger(val) ? String(val) : val.toFixed(1)
}
function pct(val: number | null | undefined): string {
  return val == null ? '—' : Math.round(val).toString()
}

export default function ReadinessScreen({
  score, hrv, rhr,
  sleep, sleepEfficiency, sleepConsistency,
  sleepHours, remHours, deepHours,
  strain, avgHr, maxHr,
  connected,
}: Props) {
  const color  = recoveryColor(score)
  const label  = recoveryLabel(score)
  const offset = score != null ? CIRC * (1 - score / 100) : CIRC

  const stats = [
    { label: 'RECOVERY',   value: fmt(score),      unit: '%',   color },
    { label: 'HRV',        value: fmt(hrv),        unit: 'ms',  color: '#64b5f6' },
    { label: 'RESTING HR', value: fmt(rhr),        unit: 'bpm', color: '#f87171' },
    { label: 'SLEEP',      value: fmt(sleepHours), unit: 'hrs', color: '#a78bfa' },
  ]

  const sleepStats = [
    { label: 'PERFORMANCE', value: pct(sleep),            unit: '%',   color: '#a78bfa' },
    { label: 'EFFICIENCY',  value: pct(sleepEfficiency),  unit: '%',   color: '#a78bfa' },
    { label: 'REM SLEEP',   value: fmt(remHours),         unit: 'hrs', color: '#64b5f6' },
    { label: 'DEEP SLEEP',  value: fmt(deepHours),        unit: 'hrs', color: '#4ade80' },
  ]

  if (!connected) {
    return (
      <div style={{ padding: '20px 4px' }}>
        <div style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)' }}>
          Connect your Whoop band to see live recovery, HRV, resting heart rate,
          sleep, and strain data here.
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          Open Settings (⚙️) → Connect Whoop.
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="readiness-arc-container">
        <div className="readiness-arc-wrap">
          <svg viewBox="0 0 160 160" width="168" height="168">
            <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="11" />
            <circle
              cx="80" cy="80" r={R}
              fill="none"
              stroke={color}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 10px ${color}88)` }}
            />
          </svg>
          <div className="readiness-arc-score">
            <div className="readiness-arc-number" style={{ color }}>{score ?? '—'}</div>
            <div className="readiness-arc-label">{label}</div>
          </div>
        </div>
      </div>

      <div className="readiness-stats-grid">
        {stats.map(s => (
          <div className="readiness-stat-card" key={s.label}>
            <div className="readiness-stat-label">{s.label}</div>
            <div>
              <span className="readiness-stat-value" style={{ color: s.color }}>{s.value}</span>
              <span className="readiness-stat-unit">{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="screen-section">
        <div className="screen-section-label">SLEEP</div>
        <div className="readiness-stats-grid">
          {sleepStats.map(s => (
            <div className="readiness-stat-card" key={s.label}>
              <div className="readiness-stat-label">{s.label}</div>
              <div>
                <span className="readiness-stat-value" style={{ color: s.color }}>{s.value}</span>
                <span className="readiness-stat-unit">{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
        {sleepConsistency != null && (
          <div className="readiness-stat-card" style={{ marginTop: 8, borderColor: 'rgba(167,139,250,0.18)' }}>
            <div className="readiness-stat-label">CONSISTENCY (LAST 4 NIGHTS)</div>
            <div>
              <span className="readiness-stat-value" style={{ color: '#a78bfa' }}>{pct(sleepConsistency)}</span>
              <span className="readiness-stat-unit">%</span>
            </div>
          </div>
        )}
      </div>

      <div className="screen-section">
        <div className="screen-section-label">TODAY'S STRAIN</div>
        <div className="readiness-stat-card" style={{ borderColor: `${strainColor(strain)}33` }}>
          <div className="readiness-stat-label">{strainLabel(strain)}</div>
          <div>
            <span className="readiness-stat-value" style={{ color: strainColor(strain) }}>{fmt(strain)}</span>
            <span className="readiness-stat-unit">/ 21</span>
          </div>
          {(avgHr != null || maxHr != null) && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              {avgHr != null && <>Avg HR <span style={{ color: '#fff' }}>{avgHr}</span></>}
              {avgHr != null && maxHr != null && <> · </>}
              {maxHr != null && <>Max HR <span style={{ color: '#fff' }}>{maxHr}</span></>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
