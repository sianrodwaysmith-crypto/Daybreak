/**
 * Editorial line icons used on the home tile grid.
 * Drawn at hairline weight in a centered viewBox so paths can be copied
 * straight from the Daybreak section-mark design without recomputation.
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
    <svg width={size} height={size} viewBox="-25 -25 50 50" {...COMMON} aria-hidden>
      {children}
    </svg>
  )
}

export function MindsetIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="0" cy="0" r="22" />
      <circle cx="0" cy="0" r="11" />
      <circle cx="0" cy="0" r="2.4" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function ReadinessIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M 0 18 C -10 12, -22 2, -22 -8 C -22 -16, -14 -18, -7 -12 Q -2 -8, 0 -8 Q 2 -8, 7 -12 C 14 -18, 22 -16, 22 -8 C 22 2, 10 12, 0 18 Z" />
    </Svg>
  )
}

export function PulseIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M -22 0 L -12 0 L -8 -10 L -2 14 L 4 -8 L 10 4 L 22 4" />
    </Svg>
  )
}

export function LessonsIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M -20 -14 L -20 14 L 0 12 L 20 14 L 20 -14 L 0 -12 Z" />
      <line x1="0" y1="-12" x2="0" y2="12" />
    </Svg>
  )
}

export function ClientResearchIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M -16 -20 L -16 22 L 16 22 L 16 -20 L 6 -20 M -6 -20 L -16 -20" />
      <rect x="-7" y="-24" width="14" height="6" rx="1" />
      <line x1="-9" y1="-6" x2="9" y2="-6" strokeWidth={0.8} />
      <line x1="-9" y1="2" x2="9" y2="2" strokeWidth={0.8} />
      <line x1="-9" y1="10" x2="3" y2="10" strokeWidth={0.8} />
    </Svg>
  )
}

export function JournalIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M -18 22 L 18 -16 L 22 -20 L 18 -12 L -14 18 Z" />
      <line x1="-14" y1="18" x2="-10" y2="22" strokeWidth={0.8} />
      <line x1="-22" y1="22" x2="-12" y2="22" strokeWidth={0.8} />
    </Svg>
  )
}

export function MovementIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <line x1="-24" y1="10" x2="24" y2="10" />
      <path d="M -20 10 Q 0 -22 20 10" />
      <circle cx="-20" cy="10" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="20"  cy="10" r="2.4" fill="currentColor" stroke="none" />
    </Svg>
  )
}

export function ScheduleIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="0" cy="0" r="22" />
      <line x1="0" y1="0" x2="0" y2="-14" />
      <line x1="0" y1="0" x2="10" y2="6" />
      <circle cx="0" cy="0" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  )
}
