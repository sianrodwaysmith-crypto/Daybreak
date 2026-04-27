/**
 * Mock seed data for the Holidays drawer. All visit dates and the
 * planned trip date are computed relative to today so the surface
 * looks plausibly inhabited whenever Library is opened for the first
 * time. The seed entries carry isSeed:true so they're wiped the first
 * time the user saves a real entry.
 */

import { getHolidaysStorage } from './storage'
import type { Trip } from './types'

function monthsAgoISO(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}
function daysFromNowISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function mk(partial: Omit<Trip, 'createdAt' | 'updatedAt' | 'isSeed' | 'id'> & { id: string }): Trip {
  const now = new Date().toISOString()
  return { ...partial, isSeed: true, createdAt: now, updatedAt: now }
}

/**
 * 17 visited countries, 1 planned trip, 8 wishlist entries (with notes
 * on three). Visit dates roughly span 3 years ago to 2 months ago.
 */
function seedData(): Trip[] {
  const visited: Trip[] = [
    mk({ id: 'seed-v-1',  destination: 'Reykjavík', countryCode: 'IS', startDate: monthsAgoISO(36), status: 'visited', travellingWith: 'with Mei' }),
    mk({ id: 'seed-v-2',  destination: 'Athens',    countryCode: 'GR', startDate: monthsAgoISO(32), status: 'visited' }),
    mk({ id: 'seed-v-3',  destination: 'Krakow',    countryCode: 'PL', startDate: monthsAgoISO(28), status: 'visited' }),
    mk({ id: 'seed-v-4',  destination: 'Marrakech', countryCode: 'MA', startDate: monthsAgoISO(24), status: 'visited' }),
    mk({ id: 'seed-v-5',  destination: 'Istanbul',  countryCode: 'TR', startDate: monthsAgoISO(20), status: 'visited' }),
    mk({ id: 'seed-v-6',  destination: 'New York',  countryCode: 'US', startDate: monthsAgoISO(18), status: 'visited' }),
    mk({ id: 'seed-v-7',  destination: 'Mexico City',countryCode:'MX', startDate: monthsAgoISO(16), status: 'visited' }),
    mk({ id: 'seed-v-8',  destination: 'Dublin',    countryCode: 'IE', startDate: monthsAgoISO(14), status: 'visited' }),
    mk({ id: 'seed-v-9',  destination: 'Berlin',    countryCode: 'DE', startDate: monthsAgoISO(12), status: 'visited' }),
    mk({ id: 'seed-v-10', destination: 'Amsterdam', countryCode: 'NL', startDate: monthsAgoISO(10), status: 'visited' }),
    mk({ id: 'seed-v-11', destination: 'Madrid',    countryCode: 'ES', startDate: monthsAgoISO(8),  status: 'visited' }),
    mk({ id: 'seed-v-12', destination: 'Tokyo',     countryCode: 'JP', startDate: monthsAgoISO(7),  status: 'visited', travellingWith: 'with Mei' }),
    mk({ id: 'seed-v-13', destination: 'Sydney',    countryCode: 'AU', startDate: monthsAgoISO(6),  status: 'visited' }),
    mk({ id: 'seed-v-14', destination: 'Mumbai',    countryCode: 'IN', startDate: monthsAgoISO(5),  status: 'visited' }),
    mk({ id: 'seed-v-15', destination: 'Paris',     countryCode: 'FR', startDate: monthsAgoISO(4),  status: 'visited' }),
    mk({ id: 'seed-v-16', destination: 'Rome',      countryCode: 'IT', startDate: monthsAgoISO(3),  status: 'visited' }),
    mk({ id: 'seed-v-17', destination: 'London',    countryCode: 'GB', startDate: monthsAgoISO(2),  status: 'visited' }),
  ]

  const planned: Trip[] = [
    mk({
      id:          'seed-p-1',
      destination: 'Lisbon',
      countryCode: 'PT',
      startDate:   daysFromNowISO(19),
      endDate:     daysFromNowISO(24),
      status:      'planned',
      travellingWith: 'with Mei',
      meta: { placesNoted: 3, flightBooked: true },
    }),
  ]

  const wishlist: Trip[] = [
    mk({ id: 'seed-w-1', destination: 'Patagonia',     countryCode: 'AR', status: 'wishlist', note: '"the wind, the silence" — Mei' }),
    mk({ id: 'seed-w-2', destination: 'Faroe Islands', countryCode: 'FO', status: 'wishlist', note: 'low light, raw rock' }),
    mk({ id: 'seed-w-3', destination: 'Hokkaido',      countryCode: 'JP', status: 'wishlist', note: 'summer light, ideally' }),
    mk({ id: 'seed-w-4', destination: 'Bhutan',        countryCode: 'BT', status: 'wishlist' }),
    mk({ id: 'seed-w-5', destination: 'Cape Town',     countryCode: 'ZA', status: 'wishlist' }),
    mk({ id: 'seed-w-6', destination: 'Havana',        countryCode: 'CU', status: 'wishlist' }),
    mk({ id: 'seed-w-7', destination: 'South Island',  countryCode: 'NZ', status: 'wishlist' }),
    mk({ id: 'seed-w-8', destination: 'Bergen',        countryCode: 'NO', status: 'wishlist' }),
  ]

  return [...visited, ...planned, ...wishlist]
}

let primed = false
/**
 * Seed only if storage is empty. Idempotent and one-shot per session.
 * Once the user saves a real trip the seed is wiped via clearSeed().
 */
export async function ensureSeeded(): Promise<void> {
  if (primed) return
  primed = true
  const s = getHolidaysStorage()
  const existing = await s.listTrips()
  if (existing.length > 0) return
  for (const t of seedData()) {
    await s.saveTrip(t)
  }
}
