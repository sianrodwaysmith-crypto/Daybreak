interface Props {
  score:    number | null
  loading:  boolean
  onClick:  () => void
}

function color(score: number | null): string {
  if (score == null)   return 'rgba(10,10,10,0.18)'
  if (score >= 67) return '#19a35a'
  if (score >= 34) return '#c98a00'
  return '#c2453a'
}

function label(score: number | null): string {
  if (score == null) return 'recovery — connect Whoop'
  if (score >= 67) return `${score}% recovered. Push if you want.`
  if (score >= 34) return `${score}% recovered. Steady wins today.`
  return `${score}% recovered. Treat yourself gently.`
}

/**
 * Thin coloured bar shown above the morning tile grid. The fill width
 * tracks the recovery percentage; the colour matches the readiness
 * traffic-light scale used elsewhere. Tapping opens the existing
 * Readiness modal — no separate drilldown needed here.
 */
export default function ReadinessBar({ score, loading, onClick }: Props) {
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score))
  const c   = color(score)
  return (
    <button
      type="button"
      className="readiness-bar"
      onClick={onClick}
      aria-label={`Readiness ${score == null ? 'unknown' : `${score}%`} — open details`}
    >
      <div className="readiness-bar-track">
        <div
          className="readiness-bar-fill"
          style={{ width: `${pct}%`, background: c }}
        />
      </div>
      <div className="readiness-bar-label" style={{ color: c }}>
        {loading && score == null ? '…' : label(score)}
      </div>
    </button>
  )
}
