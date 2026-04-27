interface Props {
  score:    number | null
  loading:  boolean
  onClick:  () => void
}

/**
 * Quiet readiness bar designed to sit inside the header block, just
 * below the greeting. Ink-coloured fill (matches the writing) so it
 * reads as a graphic underline rather than a traffic-light. The
 * recovery percentage sits on the right at the same baseline.
 */
export default function ReadinessBar({ score, loading, onClick }: Props) {
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score))
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
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="readiness-bar-num">{numberText}</span>
    </button>
  )
}
