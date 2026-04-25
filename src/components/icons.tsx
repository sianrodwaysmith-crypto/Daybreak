/**
 * Editorial line icons used on the home tile grid.
 * All drawn at 24x24, 1.5px ink stroke, no fill (except the small dot
 * inside the Mindset target). Tile CSS controls colour via currentColor.
 */

interface IconProps {
  size?: number
}

const COMMON = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Svg({ size = 24, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...COMMON} aria-hidden>
      {children}
    </svg>
  )
}

export function MindsetIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function ReadinessIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M12 20.5s-7-4.4-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10.5c0 5.6-7 10-7 10z" />
    </Svg>
  )
}

export function ClientResearchIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <line x1="9"  y1="8"  x2="15" y2="8" />
      <line x1="9"  y1="12" x2="15" y2="12" />
      <line x1="9"  y1="16" x2="13" y2="16" />
    </Svg>
  )
}

export function PulseIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
    </Svg>
  )
}

export function ScheduleIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12,7 12,12 15.5,14" />
    </Svg>
  )
}

export function MovementIcon({ size }: IconProps = {}) {
  // Horizon line with two end-dots and an arc between them — a small jump
  // / sunrise mark for the Movement tile.
  return (
    <Svg size={size}>
      <line x1="3" y1="15" x2="21" y2="15" />
      <path d="M7.5 15 Q12 6.5 16.5 15" />
      <circle cx="7.5"  cy="15" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="15" r="1.5" fill="currentColor" stroke="none" />
    </Svg>
  )
}
