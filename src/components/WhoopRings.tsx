import type { WhoopData } from '../hooks/useWhoop'

interface RingProps {
  value:    number | null
  pct:      number  // 0..1 fill
  label:    string
  color:    string
  unit?:    string
  empty?:   boolean
}

const SIZE   = 78
const STROKE = 6
const R      = (SIZE - STROKE) / 2
const C      = 2 * Math.PI * R

function Ring({ value, pct, label, color, unit, empty }: RingProps) {
  const dash = empty ? 0 : Math.max(0, Math.min(1, pct)) * C
  return (
    <div className="whoop-ring-cell">
      <svg className="whoop-ring-svg" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          className="whoop-ring-track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        <circle
          className="whoop-ring-arc"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="whoop-ring-value"
          fill="#fff"
        >
          {value == null ? '–' : value}
          {value != null && unit && <tspan className="whoop-ring-unit" fill="rgba(255,255,255,0.5)">{unit}</tspan>}
        </text>
      </svg>
      <div className="whoop-ring-label">{label}</div>
    </div>
  )
}

interface Props {
  whoop:      WhoopData
  onConnect:  () => void
}

export default function WhoopRings({ whoop, onConnect }: Props) {
  const connected = whoop.connected
  // Whoop strain is on a 0–21 scale.
  const strainPct = whoop.strain != null ? whoop.strain / 21 : 0

  return (
    <section className="whoop-card">
      <div className="whoop-head">
        <span className="whoop-eyebrow">Whoop</span>
        <span className="whoop-status">
          {whoop.loading ? 'syncing…' : connected ? 'today' : 'not connected'}
        </span>
      </div>

      <div className="whoop-rings">
        <Ring
          value={whoop.sleepEfficiency}
          pct={(whoop.sleepEfficiency ?? 0) / 100}
          label="Sleep"
          color="#e8e2d4"
          unit="%"
          empty={!connected || whoop.sleepEfficiency == null}
        />
        <Ring
          value={whoop.recovery}
          pct={(whoop.recovery ?? 0) / 100}
          label="Recovery"
          color="#19f06a"
          unit="%"
          empty={!connected || whoop.recovery == null}
        />
        <Ring
          value={whoop.strain != null ? Math.round(whoop.strain * 10) / 10 : null}
          pct={strainPct}
          label="Strain"
          color="#4aa8ff"
          empty={!connected || whoop.strain == null}
        />
      </div>

      {!connected && !whoop.loading && (
        <div className="whoop-empty">
          Connect Whoop to see today’s rings.
          <div>
            <button type="button" className="whoop-connect-btn" onClick={onConnect}>
              Connect
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
