/**
 * Module-internal icons for Moments. Kept inside /moments so the boundary
 * stays sealed (no shared dependency on the app's components/icons.tsx).
 */

interface IconProps { size?: number }

const COMMON = {
  fill:           'none',
  stroke:         'currentColor',
  strokeWidth:    1.5,
  strokeLinecap:  'round' as const,
  strokeLinejoin: 'round' as const,
}

/**
 * Moments mark: rounded square outline with a small filled dot at the
 * centre. Same line weight as the rest of Daybreak's section marks.
 */
export function MomentsIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...COMMON} aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
