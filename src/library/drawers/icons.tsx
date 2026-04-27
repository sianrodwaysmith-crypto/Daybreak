/**
 * Drawer icons for the Library home grid. All hairline strokes via
 * currentColor so they tint with the card text. 22px is the target
 * render size; the viewBox is 0 0 100 100 to make the brief's path
 * data drop in directly.
 */

interface IconProps { size?: number }

const COMMON = {
  fill:           'none',
  stroke:         'currentColor',
  strokeWidth:    3,
  strokeLinecap:  'round' as const,
  strokeLinejoin: 'round' as const,
}

function Svg({ size = 22, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" {...COMMON} aria-hidden>
      {children}
    </svg>
  )
}

export function HolidaysIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="50" cy="50" r="32" />
      <ellipse cx="50" cy="50" rx="32" ry="12" />
      <line x1="18" y1="50" x2="82" y2="50" />
    </Svg>
  )
}

export function OutfitsIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M 30 22 L 38 22 L 50 32 L 62 22 L 70 22 L 78 36 L 70 42 L 70 78 L 30 78 L 30 42 L 22 36 Z" />
    </Svg>
  )
}

export function RecipesIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <circle cx="50" cy="55" r="22" />
      <path d="M 38 38 Q 50 28 62 38" />
      <line x1="50" y1="32" x2="50" y2="42" />
    </Svg>
  )
}

export function RestaurantsIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M 30 30 L 70 30 L 70 75 L 50 68 L 30 75 Z" />
      <circle cx="50" cy="48" r="6" />
    </Svg>
  )
}

export function GiftsIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <rect x="26" y="42" width="48" height="36" rx="2" />
      <path d="M 38 42 L 38 30 Q 38 22 50 22 Q 62 22 62 30 L 62 42" />
      <line x1="50" y1="42" x2="50" y2="78" />
    </Svg>
  )
}

export function ReadingIcon({ size }: IconProps = {}) {
  return (
    <Svg size={size}>
      <path d="M 22 32 L 22 76 L 50 70 L 78 76 L 78 32 L 50 26 Z" />
      <line x1="50" y1="26" x2="50" y2="70" />
    </Svg>
  )
}
