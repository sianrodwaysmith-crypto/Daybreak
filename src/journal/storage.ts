/**
 * Journal storage. Module-internal: not exported from index.ts.
 *
 * v1 backs onto localStorage with a journal_ prefix. Data is NOT yet
 * encrypted at rest — the unlock UI is honest about that (it shows the
 * "Private to this device" copy, not "Encrypted on this device").
 *
 * v2 will wrap the same JournalStorage interface with an encrypted
 * implementation keyed off the user's PIN (derived via PBKDF2/Argon2).
 * The interface is the seam; nothing else needs to move.
 *
 * Hard rule: do not export the storage instance, the class, or the
 * interface from index.ts. Other parts of the app must NOT be able to
 * read journal content. The Journal screens construct/use the storage
 * via getStorage() within this folder only.
 */

import type { JournalAuth, RoundupEntry, WorryEntry } from './types'

export interface JournalStorage {
  // Auth
  getAuth(): Promise<JournalAuth | null>
  setAuth(auth: JournalAuth): Promise<void>
  // Roundups
  saveRoundup(entry: RoundupEntry): Promise<RoundupEntry>
  getRoundup(date: string): Promise<RoundupEntry | null>
  listRoundups(): Promise<RoundupEntry[]>
  // Worries
  saveWorry(entry: WorryEntry): Promise<WorryEntry>
  getWorry(id: string): Promise<WorryEntry | null>
  listActiveWorries(): Promise<WorryEntry[]>
  listDiscussedWorries(): Promise<WorryEntry[]>
  deleteWorry(id: string): Promise<void>
}

const PREFIX           = 'journal_'
const KEY_AUTH         = `${PREFIX}auth`
const KEY_ROUNDUP      = (date: string) => `${PREFIX}roundup_${date}`
const KEY_ROUNDUP_IDX  = `${PREFIX}roundup_index`
const KEY_WORRY        = (id: string) => `${PREFIX}worry_${id}`
const KEY_WORRY_IDX    = `${PREFIX}worry_index`

function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch { return null }
}
function writeJSON(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* quota / private mode — best effort */ }
}
function removeKey(key: string): void {
  try { localStorage.removeItem(key) } catch { /* noop */ }
}

class LocalStorageJournal implements JournalStorage {
  // ---------- Auth ----------
  async getAuth() { return readJSON<JournalAuth>(KEY_AUTH) }
  async setAuth(auth: JournalAuth) { writeJSON(KEY_AUTH, auth) }

  // ---------- Roundups ----------
  async saveRoundup(entry: RoundupEntry) {
    writeJSON(KEY_ROUNDUP(entry.date), entry)
    const idx = readJSON<string[]>(KEY_ROUNDUP_IDX) ?? []
    if (!idx.includes(entry.date)) {
      idx.push(entry.date)
      idx.sort()                          // ISO sorts chronologically
      writeJSON(KEY_ROUNDUP_IDX, idx)
    }
    return entry
  }
  async getRoundup(date: string) { return readJSON<RoundupEntry>(KEY_ROUNDUP(date)) }
  async listRoundups() {
    const idx = readJSON<string[]>(KEY_ROUNDUP_IDX) ?? []
    const out: RoundupEntry[] = []
    for (const date of idx) {
      const e = readJSON<RoundupEntry>(KEY_ROUNDUP(date))
      if (e) out.push(e)
    }
    // Reverse chronological for the archive view.
    return out.sort((a, b) => a.date < b.date ? 1 : a.date > b.date ? -1 : 0)
  }

  // ---------- Worries ----------
  async saveWorry(entry: WorryEntry) {
    writeJSON(KEY_WORRY(entry.id), entry)
    const idx = readJSON<string[]>(KEY_WORRY_IDX) ?? []
    if (!idx.includes(entry.id)) {
      idx.push(entry.id)
      writeJSON(KEY_WORRY_IDX, idx)
    }
    return entry
  }
  async getWorry(id: string) { return readJSON<WorryEntry>(KEY_WORRY(id)) }
  private async listAllWorries(): Promise<WorryEntry[]> {
    const idx = readJSON<string[]>(KEY_WORRY_IDX) ?? []
    const out: WorryEntry[] = []
    for (const id of idx) {
      const w = readJSON<WorryEntry>(KEY_WORRY(id))
      if (w) out.push(w)
    }
    return out
  }
  async listActiveWorries() {
    const all = await this.listAllWorries()
    return all
      .filter(w => w.status === 'sitting' || w.status === 'still_sitting')
      .sort((a, b) => a.loggedDate < b.loggedDate ? 1 : a.loggedDate > b.loggedDate ? -1 : 0)
  }
  async listDiscussedWorries() {
    const all = await this.listAllWorries()
    return all
      .filter(w => w.status === 'discussed')
      .sort((a, b) => (a.discussedDate ?? '') < (b.discussedDate ?? '') ? 1 : -1)
  }
  async deleteWorry(id: string) {
    removeKey(KEY_WORRY(id))
    const idx = readJSON<string[]>(KEY_WORRY_IDX) ?? []
    const next = idx.filter(x => x !== id)
    writeJSON(KEY_WORRY_IDX, next)
  }
}

// Module-private singleton. Constructed lazily, only reachable from
// inside src/journal/. Crucially: NOT re-exported from index.ts.
let instance: LocalStorageJournal | null = null
export function getStorage(): JournalStorage {
  if (!instance) instance = new LocalStorageJournal()
  return instance
}

/**
 * Append a failed-PIN attempt to the failed-attempts log on the auth
 * record. v1 doesn't act on this; v2 will use it for rate limiting.
 */
export async function recordFailedAttempt(): Promise<void> {
  const s = getStorage()
  const auth = await s.getAuth()
  if (!auth) return
  const next: JournalAuth = {
    ...auth,
    failedAttempts: [...auth.failedAttempts.slice(-49), { at: new Date().toISOString() }],
  }
  await s.setAuth(next)
}

/** Encryption status of the current storage backend. v1 = false. */
export function isEncrypted(): boolean { return false }
