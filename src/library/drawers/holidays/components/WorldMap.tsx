import { COUNTRY_CENTROIDS, project } from '../centroids'
import type { Trip } from '../types'

const VB_W = 800
const VB_H = 400

interface Props {
  visited:  Trip[]
  planned:  Trip[]
}

/**
 * Hairline-style world map. Continent gestures only — not geographic
 * precision. Filled discs mark visited countries; dashed circles mark
 * planned trips. Wishlist trips don't appear on the map by design.
 *
 * The continent paths are simplified rounded blobs roughly sited where
 * the continents are in equirectangular projection. The point is
 * recognition, not cartography.
 */
export function WorldMap({ visited, planned }: Props) {
  // Dedupe by countryCode so two visits to one country = one dot.
  const visitedDots = uniqueCentroidPositions(visited)
  const plannedDots = uniqueCentroidPositions(planned)

  return (
    <svg
      className="library-map"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label="World map"
      role="img"
    >
      {/* Continents — drawn as light hairlines. Each path is a single
          closed shape stroked, no fill, low opacity. */}
      <g stroke="currentColor" fill="none" strokeWidth={0.5} opacity={0.25} strokeLinejoin="round" strokeLinecap="round">
        {/* Africa */}
        <path d="M 420 195 C 405 195 395 215 395 240 C 395 265 410 295 425 305 C 440 315 455 305 460 295 C 470 280 470 255 460 230 C 450 210 440 195 420 195 Z" />
        {/* Europe — sits above Africa */}
        <path d="M 380 145 C 380 130 410 125 435 130 C 460 135 470 145 460 165 C 450 180 420 185 400 180 C 385 175 380 160 380 145 Z" />
        {/* Asia — large blob to the east of Europe */}
        <path d="M 470 130 C 530 110 600 115 650 135 C 690 150 705 175 695 200 C 680 225 630 235 580 225 C 540 215 495 195 478 170 C 470 155 465 140 470 130 Z" />
        {/* North America — left side, mid-upper */}
        <path d="M 130 130 C 110 135 95 160 100 195 C 110 230 140 240 175 235 C 210 225 230 195 220 165 C 210 140 175 120 150 122 C 140 123 135 127 130 130 Z" />
        {/* South America */}
        <path d="M 215 245 C 210 260 215 285 230 310 C 240 330 250 335 260 325 C 270 310 270 285 260 260 C 250 240 235 235 215 245 Z" />
        {/* Australia */}
        <path d="M 615 290 C 610 300 615 315 630 320 C 660 325 685 315 690 300 C 690 285 670 280 645 282 C 630 283 620 285 615 290 Z" />
        {/* Antarctica — thin band along bottom */}
        <path d="M 60 365 L 740 365 L 720 380 L 80 380 Z" />
      </g>

      {/* Visited dots */}
      <g>
        {visitedDots.map((p, i) => (
          <circle key={`v-${i}`} cx={p.x} cy={p.y} r={3} fill="currentColor" />
        ))}
      </g>

      {/* Planned: dashed-outline circles */}
      <g fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="2 2">
        {plannedDots.map((p, i) => (
          <circle key={`p-${i}`} cx={p.x} cy={p.y} r={4} />
        ))}
      </g>
    </svg>
  )
}

function uniqueCentroidPositions(trips: Trip[]): { x: number; y: number }[] {
  const seen = new Set<string>()
  const out: { x: number; y: number }[] = []
  for (const t of trips) {
    if (seen.has(t.countryCode)) continue
    seen.add(t.countryCode)
    const c = COUNTRY_CENTROIDS[t.countryCode]
    if (!c) continue                     // missing centroid — skip dot, list still shows it
    out.push(project(c, VB_W, VB_H))
  }
  return out
}
