import { type ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  subtitle?: string
  accent: string
  fullWidth?: boolean | false
  loading?: boolean
  onClick: () => void
}

// Real <button> + onClick (rather than custom pointer-event handling) so
// iOS Safari treats taps reliably: it knows the difference between a tap
// and a scroll, debounces double-fires, and gives us focus/keyboard for
// free. Press feedback is pure CSS via :active.
export default function Tile({ icon, title, subtitle, accent, fullWidth, loading, onClick }: Props) {
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
      <span className="tile-dot" style={{ background: accent }} aria-hidden />
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
