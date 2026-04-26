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

/* -------------------------------------------------------------------
   Diagnostic — for the Settings panel. Returns what backend is being
   used right now and a quick fetch result so we can see whether Drive
   is reachable, has the right scope, and contains anything.
------------------------------------------------------------------- */

export interface MomentsStorageDebug {
  backend:        'drive' | 'mock' | 'supabase'
  hasGoogleTokens: boolean
  ts:             string
  fetchOk?:       boolean
  fetchError?:    string
  count?:         number
  driveListedOk?: boolean
  driveListCount?: number
  driveListError?: string
}

const TOKENS_KEY_FOR_DEBUG = 'daybreak-google-tokens'

export async function probeStorage(userId: string): Promise<MomentsStorageDebug> {
  const backend = pickKind()
  const hasGoogleTokens = (() => {
    try { return !!localStorage.getItem(TOKENS_KEY_FOR_DEBUG) }
    catch { return false }
  })()

  const ts = new Date().toISOString()
  const debug: MomentsStorageDebug = { backend, hasGoogleTokens, ts }

  // Independent direct check: list raw files in the Drive AppData folder.
  // This bypasses any storage-class caching and tells us whether the
  // user's Drive actually has files for this app + this Google account.
  if (hasGoogleTokens) {
    try {
      const tokens = JSON.parse(localStorage.getItem(TOKENS_KEY_FOR_DEBUG) ?? '{}') as { access_token?: string }
      if (tokens.access_token) {
        const params = new URLSearchParams({
          spaces:   'appDataFolder',
          fields:   'files(id,name)',
          pageSize: '1000',
        })
        const r = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
          cache:   'no-store',
        })
        if (r.ok) {
          const j = await r.json() as { files?: { id: string; name: string }[] }
          debug.driveListedOk = true
          debug.driveListCount = (j.files ?? []).length
        } else {
          debug.driveListedOk = false
          debug.driveListError = `${r.status}: ${(await r.text().catch(() => '')).slice(0, 240)}`
        }
      }
    } catch (e) {
      debug.driveListedOk = false
      debug.driveListError = e instanceof Error ? e.message : String(e)
    }
  }

  // What does the storage class itself report?
  try {
    const all = await getStorage().getAll(userId)
    debug.fetchOk = true
    debug.count   = all.length
  } catch (e) {
    debug.fetchOk = false
    debug.fetchError = e instanceof Error ? e.message : String(e)
  }

  return debug
}
