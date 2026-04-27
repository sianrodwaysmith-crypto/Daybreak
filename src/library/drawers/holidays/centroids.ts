/**
 * Approximate (lat, lon) centroids for ~50 common countries, used to
 * place dots on the world map. Not geographically precise — these are
 * gestural locations chosen to read well at the simplified map's
 * resolution. Add new entries as needed; missing codes simply don't
 * get a dot but still appear in the lists.
 *
 * Lat: -90..90 (south-negative). Lon: -180..180 (west-negative).
 */

export interface LatLon { lat: number; lon: number }

export const COUNTRY_CENTROIDS: Record<string, LatLon> = {
  // Europe
  GB: { lat:  54, lon:  -2 },
  IE: { lat:  53, lon:  -8 },
  FR: { lat:  46, lon:   2 },
  ES: { lat:  40, lon:  -4 },
  PT: { lat:  39, lon:  -8 },
  IT: { lat:  42, lon:  13 },
  DE: { lat:  51, lon:   9 },
  NL: { lat:  52, lon:   5 },
  BE: { lat:  50, lon:   4 },
  CH: { lat:  47, lon:   8 },
  AT: { lat:  47, lon:  14 },
  CZ: { lat:  50, lon:  15 },
  PL: { lat:  52, lon:  19 },
  HU: { lat:  47, lon:  19 },
  HR: { lat:  45, lon:  16 },
  GR: { lat:  39, lon:  22 },
  SE: { lat:  62, lon:  17 },
  NO: { lat:  62, lon:   9 },
  DK: { lat:  56, lon:   9 },
  FI: { lat:  64, lon:  26 },
  IS: { lat:  65, lon: -18 },
  FO: { lat:  62, lon:  -7 },
  TR: { lat:  39, lon:  35 },

  // Africa
  MA: { lat:  32, lon:  -6 },
  EG: { lat:  26, lon:  30 },
  KE: { lat:   0, lon:  38 },
  TZ: { lat:  -6, lon:  35 },
  ZA: { lat: -30, lon:  25 },

  // Asia
  IN: { lat:  22, lon:  79 },
  TH: { lat:  15, lon: 100 },
  VN: { lat:  16, lon: 108 },
  JP: { lat:  36, lon: 138 },
  KR: { lat:  36, lon: 128 },
  CN: { lat:  36, lon: 104 },
  ID: { lat:  -2, lon: 118 },
  MY: { lat:   4, lon: 102 },
  SG: { lat:   1, lon: 104 },
  AE: { lat:  24, lon:  54 },
  BT: { lat:  27, lon:  90 },

  // Oceania
  AU: { lat: -25, lon: 134 },
  NZ: { lat: -41, lon: 174 },

  // Americas
  CA: { lat:  56, lon: -106 },
  US: { lat:  38, lon:  -97 },
  MX: { lat:  23, lon: -102 },
  CU: { lat:  22, lon:  -78 },
  BR: { lat: -14, lon:  -52 },
  AR: { lat: -34, lon:  -64 },
  CL: { lat: -30, lon:  -71 },
  PE: { lat:  -9, lon:  -75 },
  CO: { lat:   4, lon:  -72 },
}

/**
 * Map (lat, lon) to (x, y) inside an equirectangular SVG viewBox.
 * width / height are the viewBox dimensions; lon span is 360, lat 180.
 */
export function project(latlon: LatLon, width: number, height: number): { x: number; y: number } {
  const x = ((latlon.lon + 180) / 360) * width
  const y = ((90 - latlon.lat) / 180) * height
  return { x, y }
}
