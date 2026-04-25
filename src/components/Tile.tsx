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
      className={`tile${fullWidth ? ' tile-full' : ''}`}
      style={{
        transform: pressing ? 'scale(0.96)' : 'scale(1)',
        borderColor: `${accent}28`,
      }}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => { setPressing(false); onClick() }}
      onPointerLeave={() => setPressing(false)}
      onPointerCancel={() => setPressing(false)}
    >
      <div className="tile-icon" style={{ background: `${accent}16`, color: accent }}>
        {icon}
      </div>
      <div className="tile-title" style={{ color: accent }}>{title}</div>
      {loading && (
        <div className="tile-dots">
          <span className="tile-dot" style={{ background: accent, animationDelay: '0ms' }} />
          <span className="tile-dot" style={{ background: accent, animationDelay: '180ms' }} />
          <span className="tile-dot" style={{ background: accent, animationDelay: '360ms' }} />
        </div>
      )}
    </div>
  )
}
