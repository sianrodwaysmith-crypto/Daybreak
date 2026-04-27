/**
 * Holidays drawer storage. Module-internal — not exported from the
 * Library public index.
 *
 * v1 backs onto localStorage with a `library_holidays_` key prefix.
 * The interface is the seam: the SupabaseHolidaysStorage stub below is
 * where a real backend wires in later without touching the components.
 */

import type { Trip, TripStatus } from './types'

export interface HolidaysStorage {
  saveTrip(trip: Trip): Promise<Trip>
  getTrip(id: string): Promise<Trip | null>
  listTrips(status?: TripStatus): Promise<Trip[]>
  deleteTrip(id: string): Promise<void>
  /** Wipe every trip whose isSeed flag is true. Called once the user
   *  saves a real entry so the seed disappears in favour of their own. */
  clearSeed(): Promise<void>
  /** Used by the dev panel; nukes everything. */
  clearAll(): Promise<void>
}

const PREFIX     = 'library_holidays_'
const KEY_TRIP   = (id: string) => `${PREFIX}trip_${id}`
const KEY_INDEX  = `${PREFIX}index`

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch { return null }
}
function writeJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* noop */ }
}
function removeKey(key: string): void {
  try { localStorage.removeItem(key) } catch { /* noop */ }
}

class MockHolidaysStorage implements HolidaysStorage {
  async saveTrip(trip: Trip) {
    writeJSON(KEY_TRIP(trip.id), trip)
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    if (!idx.includes(trip.id)) {
      idx.push(trip.id)
      writeJSON(KEY_INDEX, idx)
    }
    return trip
  }
  async getTrip(id: string) { return readJSON<Trip>(KEY_TRIP(id)) }
  async listTrips(status?: TripStatus) {
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    const out: Trip[] = []
    for (const id of idx) {
      const t = readJSON<Trip>(KEY_TRIP(id))
      if (!t) continue
      if (status && t.status !== status) continue
      out.push(t)
    }
    return out
  }
  async deleteTrip(id: string) {
    removeKey(KEY_TRIP(id))
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    writeJSON(KEY_INDEX, idx.filter(x => x !== id))
  }
  async clearSeed() {
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    const keep: string[] = []
    for (const id of idx) {
      const t = readJSON<Trip>(KEY_TRIP(id))
      if (t?.isSeed) removeKey(KEY_TRIP(id))
      else keep.push(id)
    }
    writeJSON(KEY_INDEX, keep)
  }
  async clearAll() {
    const idx = readJSON<string[]>(KEY_INDEX) ?? []
    for (const id of idx) removeKey(KEY_TRIP(id))
    removeKey(KEY_INDEX)
  }
}

// TODO: real backend. Same interface, swap in via getStorage() factory
// when the API is ready. Until then this throws so any accidental wiring
// fails loudly rather than silently dropping writes.
class SupabaseHolidaysStorage implements HolidaysStorage {
  async saveTrip(_t: Trip): Promise<Trip>          { throw new Error('SupabaseHolidaysStorage: not implemented') }
  async getTrip(_id: string): Promise<Trip | null> { throw new Error('SupabaseHolidaysStorage: not implemented') }
  async listTrips(_s?: TripStatus): Promise<Trip[]>{ throw new Error('SupabaseHolidaysStorage: not implemented') }
  async deleteTrip(_id: string): Promise<void>     { throw new Error('SupabaseHolidaysStorage: not implemented') }
  async clearSeed(): Promise<void>                 { throw new Error('SupabaseHolidaysStorage: not implemented') }
  async clearAll(): Promise<void>                  { throw new Error('SupabaseHolidaysStorage: not implemented') }
}
void SupabaseHolidaysStorage   // referenced so TS doesn't strip unused

let instance: HolidaysStorage | null = null
export function getHolidaysStorage(): HolidaysStorage {
  if (!instance) instance = new MockHolidaysStorage()
  return instance
}
