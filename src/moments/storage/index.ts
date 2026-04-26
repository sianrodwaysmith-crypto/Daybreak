import type { MomentsStorage } from '../types'
import { MockMomentsStorage } from './MockMomentsStorage'
import { SupabaseMomentsStorage } from './SupabaseMomentsStorage'
import { GoogleDriveMomentsStorage } from './GoogleDriveMomentsStorage'

/**
 * Factory selecting the storage implementation.
 *
 * Picking order:
 *   1. If the user is connected to Google (tokens in localStorage), use
 *      GoogleDriveMomentsStorage so Moments live in their Drive AppData
 *      folder and survive PWA reinstalls.
 *   2. Otherwise, when VITE_USE_MOCK_DATA is on (the default during dev
 *      and for offline use), MockMomentsStorage holds them in IndexedDB.
 *   3. SupabaseMomentsStorage stub is reserved for a future real backend
 *      and only wired in when VITE_USE_MOCK_DATA is explicitly off.
 *
 * The factory re-evaluates the choice on every getStorage() call so a
 * fresh Google connection is picked up immediately without a reload.
 * Each unique implementation is memoised so caches inside the storage
 * (in-memory metadata + photo blob URLs) survive across calls.
 */

const TOKENS_KEY = 'daybreak-google-tokens'

type Kind = 'drive' | 'mock' | 'supabase'

let driveInstance:    GoogleDriveMomentsStorage | null = null
let mockInstance:     MockMomentsStorage        | null = null
let supabaseInstance: SupabaseMomentsStorage    | null = null

function hasGoogleTokens(): boolean {
  try { return !!localStorage.getItem(TOKENS_KEY) }
  catch { return false }
}

function pickKind(): Kind {
  if (hasGoogleTokens()) return 'drive'
  const useMock = (import.meta.env.VITE_USE_MOCK_DATA ?? 'on') !== 'off'
  return useMock ? 'mock' : 'supabase'
}

export function getStorage(): MomentsStorage {
  switch (pickKind()) {
    case 'drive':
      if (!driveInstance) driveInstance = new GoogleDriveMomentsStorage()
      return driveInstance
    case 'supabase':
      if (!supabaseInstance) supabaseInstance = new SupabaseMomentsStorage()
      return supabaseInstance
    case 'mock':
    default:
      if (!mockInstance) mockInstance = new MockMomentsStorage()
      return mockInstance
  }
}

// For tests: allow swapping the active instance.
export function __setStorageForTest(s: MomentsStorage | null): void {
  if (s == null) {
    driveInstance = mockInstance = supabaseInstance = null
    return
  }
  // We can't reliably know which slot to fill, so pin to the mock slot —
  // tests that need this will set it explicitly via a direct field
  // assignment in module patches.
  mockInstance = s as MockMomentsStorage
}
