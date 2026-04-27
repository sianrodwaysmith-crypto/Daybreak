/**
 * Holidays drawer types. Module-internal.
 */

export type TripStatus = 'visited' | 'planned' | 'wishlist'

export interface Trip {
  id:             string
  destination:    string             // 'Lisbon', 'Kyoto'
  countryCode:    string             // ISO 3166-1 alpha-2
  startDate?:     string             // ISO YYYY-MM-DD
  endDate?:       string
  status:         TripStatus
  travellingWith?: string            // free text, e.g. 'with Mei'
  note?:          string             // for wishlist entries: the one-line why
  meta?: {
    placesNoted?:  number
    flightBooked?: boolean
  }
  /** Marker so the seed loader knows what to wipe on first real entry. */
  isSeed?:        boolean
  createdAt:      string
  updatedAt:      string
}
