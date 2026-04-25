import { useState } from 'react'

interface Props {
  icon: string
  title: string
  accent: string
  fullWidth?: boolean | false
  loading?: boolean
  onClick: () => void
}

export default function Tile({ icon, title, accent, fullWidth, loading, onClick }: Props) {
  const [pressing, setPressing] = useState(false)

  return (
    <div
      className={`tile${fullWidth ? ' tile-full' : ''}${pressing ? ' is-pressing' : ''}`}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => { setPressing(false); onClick() }}
      onPointerLeave={() => setPressing(false)}
      onPointerCancel={() => setPressing(false)}
    >
      <div className="tile-icon">{icon}</div>
      <div className="tile-title">{title}</div>
      <span className="tile-dot" style={{ background: accent }} aria-hidden />
      {loading && (
        <div className="tile-loading">
          <span className="tile-loading-dot" style={{ animationDelay: '0ms' }} />
          <span className="tile-loading-dot" style={{ animationDelay: '180ms' }} />
          <span className="tile-loading-dot" style={{ animationDelay: '360ms' }} />
        </div>
      )}
    </div>
  )
}
