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

export function LessonsIcon({ size }: IconProps = {}) {
  // Open book — two facing pages on a spine.
  return (
    <Svg size={size}>
      <path d="M3 5.5C3 5.5 6 4 9 4C10.5 4 11.5 4.5 12 5C12.5 4.5 13.5 4 15 4C18 4 21 5.5 21 5.5V19C21 19 18 17.5 15 17.5C13.5 17.5 12.5 18 12 18.5C11.5 18 10.5 17.5 9 17.5C6 17.5 3 19 3 19V5.5Z" />
      <path d="M12 5V18.5" />
    </Svg>
  )
}

export function JournalIcon({ size }: IconProps = {}) {
  // Notebook with a single rule — a quiet hint at the page.
  return (
    <Svg size={size}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <line x1="8" y1="9" x2="16" y2="9" />
      <line x1="8" y1="13" x2="13" y2="13" />
    </Svg>
  )
}
