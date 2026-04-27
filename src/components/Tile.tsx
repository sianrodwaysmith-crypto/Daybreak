import { type ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  subtitle?: string
  accent: string
  /**
   * Daily-action completion status. When set, renders a small dot:
   * green = done today, grey = not yet. When undefined, no dot is shown
   * (used for passive-data tiles like Schedule / Readiness / Pulse).
   */
  status?: 'done' | 'pending'
  fullWidth?: boolean | false
  loading?: boolean
  onClick: () => void
}

// Real <button> + onClick (rather than custom pointer-event handling) so
// iOS Safari treats taps reliably: it knows the difference between a tap
// and a scroll, debounces double-fires, and gives us focus/keyboard for
// free. Press feedback is pure CSS via :active.
export default function Tile({ icon, title, subtitle, status, fullWidth, loading, onClick }: Props) {
  return (
    <button
      type="button"
      className={`tile${fullWidth ? ' tile-full' : ''}`}
      onClick={onClick}
    >
      <div className="tile-icon">{icon}</div>
      <div className="tile-text">
        <div className="tile-title">{title}</div>
        {subtitle && <div className="tile-subtitle">{subtitle}</div>}
      </div>
      {status && (
        <span
          className={`tile-dot tile-dot-${status}`}
          aria-label={status === 'done' ? 'Done today' : 'Not yet today'}
        />
      )}
      {loading && (
        <div className="tile-loading">
          <span className="tile-loading-dot" style={{ animationDelay: '0ms' }} />
          <span className="tile-loading-dot" style={{ animationDelay: '180ms' }} />
          <span className="tile-loading-dot" style={{ animationDelay: '360ms' }} />
        </div>
      )}
    </button>
  )
}
