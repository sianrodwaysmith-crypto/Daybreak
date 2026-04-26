import type { MomentsStorage } from '../types'
import { MockMomentsStorage } from './MockMomentsStorage'
import { SupabaseMomentsStorage } from './SupabaseMomentsStorage'

/**
 * Factory selecting the storage implementation. Mock is used unless the env
 * flag VITE_USE_MOCK_DATA is explicitly set to 'off' (default behaviour
 * during development is mock-on; production picks up the real backend by
 * setting the flag in the build env once the backend exists).
 *
 * Singleton — the storage holds in-memory state and we want one source of
 * truth per session.
 */

let instance: MomentsStorage | null = null

export function getStorage(): MomentsStorage {
  if (instance) return instance
  const useMock = (import.meta.env.VITE_USE_MOCK_DATA ?? 'on') !== 'off'
  instance = useMock ? new MockMomentsStorage() : new SupabaseMomentsStorage()
  return instance
}

// For tests: allow swapping the singleton.
export function __setStorageForTest(s: MomentsStorage | null): void {
  instance = s
}
