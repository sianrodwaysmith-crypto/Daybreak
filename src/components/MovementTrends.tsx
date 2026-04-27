import type { WhoopCyclePoint } from '../hooks/useWhoop'

interface Props {
  history: WhoopCyclePoint[]
}

const DAY_INITIAL = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * 14-day active-calories trend. Renders inside the existing Modal
 * shell so it inherits the close affordance. SVG bar chart, no
 * external chart library — keeps bundle size flat. Today's bar is
 * highlighted; days with no data show a hairline trace at the baseline.
 */
export default function MovementTrends({ history }: Props) {
  // Defensive: API returns most-recent-first; reverse so the chart
  // reads left-to-right oldest → newest. Cap at the most recent 14
  // points in case the API ever returns more.
  const points = [...history].reverse().slice(-14)
  const todayISO = new Date().toISOString().slice(0, 10)
  const max = Math.max(1, ...points.map(p => p.kcal ?? 0))
  const total = points.reduce((acc, p) => acc + (p.kcal ?? 0), 0)
  const days  = points.filter(p => p.kcal != null).length
  const avg   = days > 0 ? Math.round(total / days) : null

  const VB_W = 320
  const VB_H = 140
  const PAD_X = 8
  const PAD_T = 4
  const PAD_B = 22
  const barW = (VB_W - PAD_X * 2) / 14
  const innerH = VB_H - PAD_T - PAD_B

  return (
    <div className="trends">
      <div className="trends-summary">
        <div className="trends-stat">
          <div className="trends-stat-label">today</div>
          <div className="trends-stat-num">
            {points.find(p => p.date === todayISO)?.kcal ?? '—'}
            <span className="trends-stat-unit"> kcal</span>
          </div>
        </div>
        <div className="trends-stat">
          <div className="trends-stat-label">14-day average</div>
          <div className="trends-stat-num">
            {avg ?? '—'}
            <span className="trends-stat-unit"> kcal</span>
          </div>
        </div>
      </div>

      <svg className="trends-chart" viewBox={`0 0 ${VB_W} ${VB_H}`} role="img" aria-label="Active calories, last 14 days">
        {/* Hairline baseline */}
        <line
          x1={PAD_X} x2={VB_W - PAD_X}
          y1={VB_H - PAD_B} y2={VB_H - PAD_B}
          stroke="currentColor" strokeWidth={0.5} opacity={0.3}
        />
        {points.map((p, i) => {
          const v = p.kcal ?? 0
          const h = (v / max) * innerH
          const x = PAD_X + i * barW + barW * 0.18
          const w = barW * 0.64
          const y = VB_H - PAD_B - h
          const isToday = p.date === todayISO
          return (
            <g key={p.date || i}>
              {h > 0 && (
                <rect
                  x={x} y={y} width={w} height={h}
                  fill={isToday ? 'currentColor' : 'currentColor'}
                  opacity={isToday ? 1 : 0.35}
                  rx={1}
                />
              )}
              {h === 0 && (
                <line
                  x1={x} x2={x + w}
                  y1={VB_H - PAD_B - 0.5} y2={VB_H - PAD_B - 0.5}
                  stroke="currentColor" opacity={0.18} strokeWidth={1}
                />
              )}
              <text
                x={x + w / 2}
                y={VB_H - 6}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                opacity={isToday ? 0.9 : 0.45}
              >
                {dayInitial(p.date)}
              </text>
            </g>
          )
        })}
      </svg>

      {points.length === 0 && (
        <div className="trends-empty">No cycle history yet. Sync Whoop and check back.</div>
      )}
    </div>
  )
}

function dayInitial(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return DAY_INITIAL[d.getDay()] ?? ''
}
