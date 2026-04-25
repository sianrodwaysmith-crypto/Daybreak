import { useState } from 'react'

interface Props {
  icon: string
  title: string
  subtitle: string
  accent: string
  onClick: () => void
}

export default function Tile({ icon, title, subtitle, accent, onClick }: Props) {
  const [pressing, setPressing] = useState(false)

  return (
    <div
      className="tile"
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
      <div className="tile-subtitle">{subtitle}</div>
    </div>
  )
}
