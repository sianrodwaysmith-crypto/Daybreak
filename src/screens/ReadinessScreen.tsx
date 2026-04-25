import WhoopRings from '../components/WhoopRings'
import type { WhoopData } from '../hooks/useWhoop'

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

function strainBand(s: number | null | undefined): string {
  if (s == null)   return '—'
  if (s < 10) return 'Light'
  if (s < 14) return 'Moderate'
  if (s < 18) return 'High'
  return 'All out'
}

function fmt(val: number | null | undefined): string {
  if (val == null) return '—'
  return Number.isInteger(val) ? String(val) : val.toFixed(1)
}

function pct(val: number | null | undefined): string {
  return val == null ? '—' : Math.round(val).toString()
}

interface StatProps {
  label: string
  value: string
  unit?: string
}

function Stat({ label, value, unit }: StatProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-row">
        <span className="stat-value">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  )
}

export default function ReadinessScreen(props: Props) {
  const {
    score, hrv, rhr,
    sleep, sleepEfficiency, sleepConsistency,
    sleepHours, remHours, deepHours,
    strain, avgHr, maxHr,
    connected,
  } = props

  // Build a synthetic WhoopData-shape object for the rings component
  const whoopShape: WhoopData = {
    connected,
    loading: false,
    recovery: score,
    hrv: hrv ?? null,
    rhr: rhr ?? null,
    sleep: sleep ?? null,
    sleepEfficiency: sleepEfficiency ?? null,
    sleepConsistency: sleepConsistency ?? null,
    sleepHours: sleepHours ?? null,
    remHours: remHours ?? null,
    deepHours: deepHours ?? null,
    strain: strain ?? null,
    avgHr: avgHr ?? null,
    maxHr: maxHr ?? null,
    disconnect: async () => {},
  }

  return (
    <div>
      <WhoopRings whoop={whoopShape} onConnect={() => {}} />

      {connected && (
        <>
          <div className="screen-section">
            <div className="screen-label">Vitals</div>
            <div className="stat-grid">
              <Stat label="HRV"         value={fmt(hrv)}        unit="ms" />
              <Stat label="Resting HR"  value={fmt(rhr)}        unit="bpm" />
              <Stat label="Sleep"       value={fmt(sleepHours)} unit="hrs" />
              <Stat label="Recovery"    value={fmt(score)}      unit="%" />
            </div>
          </div>

          <div className="screen-section">
            <div className="screen-label">Sleep</div>
            <div className="stat-grid">
              <Stat label="Performance" value={pct(sleep)}            unit="%" />
              <Stat label="Efficiency"  value={pct(sleepEfficiency)}  unit="%" />
              <Stat label="REM"         value={fmt(remHours)}         unit="hrs" />
              <Stat label="Deep"        value={fmt(deepHours)}        unit="hrs" />
            </div>
            {sleepConsistency != null && (
              <div className="stat-card stat-card-wide">
                <div className="stat-label">Consistency · last 4 nights</div>
                <div className="stat-row">
                  <span className="stat-value">{pct(sleepConsistency)}</span>
                  <span className="stat-unit">%</span>
                </div>
              </div>
            )}
          </div>

          <div className="screen-section">
            <div className="screen-label">Today's strain</div>
            <div className="stat-card stat-card-wide">
              <div className="stat-label">{strainBand(strain)}</div>
              <div className="stat-row">
                <span className="stat-value">{fmt(strain)}</span>
                <span className="stat-unit">/ 21</span>
              </div>
              {(avgHr != null || maxHr != null) && (
                <div className="stat-foot">
                  {avgHr != null && <>Avg HR <strong>{avgHr}</strong></>}
                  {avgHr != null && maxHr != null && <> · </>}
                  {maxHr != null && <>Max HR <strong>{maxHr}</strong></>}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!connected && (
        <p className="screen-note">
          Connect your Whoop band to see live recovery, HRV, resting heart rate, sleep, and strain.
          Open settings (top-right) → Connect Whoop.
        </p>
      )}
    </div>
  )
}
