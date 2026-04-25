interface Props { score: number }

function scoreColor(s: number) {
  if (s >= 80) return '#4ade80'
  if (s >= 60) return '#ffc800'
  return '#f87171'
}
function scoreLabel(s: number) {
  if (s >= 80) return 'OPTIMAL'
  if (s >= 60) return 'GOOD'
  if (s >= 40) return 'MODERATE'
  return 'LOW'
}

const R = 70
const CIRC = 2 * Math.PI * R

const STATS = [
  { label: 'RECOVERY',   value: '74',  unit: '%',   color: '#4ade80' },
  { label: 'HRV',        value: '62',  unit: 'ms',  color: '#64b5f6' },
  { label: 'RESTING HR', value: '51',  unit: 'bpm', color: '#f87171' },
  { label: 'SLEEP',      value: '7.2', unit: 'hrs', color: '#a78bfa' },
]

export default function ReadinessScreen({ score }: Props) {
  const color = scoreColor(score)
  const label = scoreLabel(score)
  const offset = CIRC * (1 - score / 100)

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
            <div className="readiness-arc-number" style={{ color }}>{score}</div>
            <div className="readiness-arc-label">{label}</div>
          </div>
        </div>
      </div>

      <div className="readiness-stats-grid">
        {STATS.map(s => (
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
        <div className="screen-section-label">SLEEP SCORE</div>
        <div className="readiness-stat-card" style={{ borderColor: 'rgba(167,139,250,0.18)' }}>
          <div className="readiness-stat-label">OVERALL SLEEP QUALITY</div>
          <div>
            <span className="readiness-stat-value" style={{ color: '#a78bfa' }}>81</span>
            <span className="readiness-stat-unit">%</span>
          </div>
        </div>
      </div>

      <div className="screen-section">
        <div className="screen-section-label">TODAY'S TRAINING</div>
        <div className="training-card">
          <div className="training-type" style={{ color: '#4ade80' }}>STRENGTH — UPPER BODY</div>
          <div className="training-detail">Bench press · Pull-ups · Overhead press · Rows</div>
          <div className="training-detail" style={{ marginTop: 8 }}>
            60 min · Moderate intensity recommended
          </div>
        </div>
      </div>
    </div>
  )
}
