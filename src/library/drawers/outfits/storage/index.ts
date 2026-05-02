import type { OutfitsStorage } from '../types'
import { MockOutfitsStorage }        from './MockOutfitsStorage'
import { GoogleDriveOutfitsStorage } from './GoogleDriveOutfitsStorage'

/**
 * Factory mirroring the Moments storage factory.
 *
 *   1. If the user is connected to Google (tokens in localStorage), use
 *      GoogleDriveOutfitsStorage so outfits live in the user's Drive
 *      AppData folder and survive PWA reinstalls.
 *   2. Otherwise, fall back to MockOutfitsStorage backed by IndexedDB
 *      so things still work offline / pre-connection. Local-only data
 *      won't sync; that's the trade-off for working without Google.
 *
 * Re-evaluated on every getStorage() call so a fresh Google connection
 * is picked up immediately. Each implementation is memoised so caches
 * (in-memory metadata + photo blob URLs) survive across calls.
 */

const TOKENS_KEY = 'daybreak-google-tokens'

let driveInstance: GoogleDriveOutfitsStorage | null = null
let mockInstance:  MockOutfitsStorage        | null = null

function hasGoogleTokens(): boolean {
  try { return !!localStorage.getItem(TOKENS_KEY) }
  catch { return false }
}

export function isDriveBacked(): boolean {
  return hasGoogleTokens()
}

export function getStorage(): OutfitsStorage {
  if (hasGoogleTokens()) {
    if (!driveInstance) driveInstance = new GoogleDriveOutfitsStorage()
    return driveInstance
  }
  if (!mockInstance) mockInstance = new MockOutfitsStorage()
  return mockInstance
}
