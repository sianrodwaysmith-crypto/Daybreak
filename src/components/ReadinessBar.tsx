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

/**
 * Understated row: thin coloured bar on the left, recovery percentage
 * on the right. No conversational label. Tapping opens the existing
 * Readiness modal.
 */
export default function ReadinessBar({ score, loading, onClick }: Props) {
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score))
  const c   = color(score)
  const numberText = score == null ? (loading ? '…' : '—') : `${score}%`
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
          style={{ width: `${pct}%`, background: c, opacity: 0.7 }}
        />
      </div>
      <span className="readiness-bar-num" style={{ color: c }}>{numberText}</span>
    </button>
  )
}
