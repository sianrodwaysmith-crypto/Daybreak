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
 * centre. Centered viewBox so the path matches the shared section-mark
 * design exactly.
 */
export function MomentsIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="-25 -25 50 50" {...COMMON} aria-hidden>
      <rect x="-22" y="-22" width="44" height="44" rx="3" />
      <circle cx="0" cy="0" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  )
}
