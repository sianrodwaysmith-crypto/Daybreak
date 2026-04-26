import type { Account } from './types'

/* ====================================================================
   Account list persistence.
   localStorage is fine here: the data is tiny (text only, ~200 bytes
   per account) and easy to retype if iOS evicts a PWA install. Drive
   AppData migration is a one-line follow-up if survival ever matters.
==================================================================== */

const KEY = 'daybreak-accounts-v1'

export function readAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Account[]
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export function writeAccounts(accounts: Account[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(accounts)) }
  catch { /* quota / disabled storage — drop silently */ }
}

function makeId(): string {
  return `acct-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function buildAccount(input: {
  name:     string
  contact?: string
  notes?:   string
}): Account {
  const now = Date.now()
  return {
    id:        makeId(),
    name:      input.name.trim(),
    contact:   input.contact?.trim() || undefined,
    notes:     input.notes?.trim()   || undefined,
    isFocus:   false,
    createdAt: now,
    updatedAt: now,
  }
}

export function applyUpdate(
  accounts: Account[],
  id:       string,
  patch:    Partial<Pick<Account, 'name' | 'contact' | 'notes'>>,
): Account[] {
  return accounts.map(a => a.id === id ? {
    ...a,
    name:      patch.name     != null ? patch.name.trim()     : a.name,
    contact:   patch.contact  != null ? (patch.contact.trim() || undefined) : a.contact,
    notes:     patch.notes    != null ? (patch.notes.trim()   || undefined) : a.notes,
    updatedAt: Date.now(),
  } : a)
}

export function applyFocus(accounts: Account[], id: string | null): Account[] {
  return accounts.map(a => ({ ...a, isFocus: a.id === id }))
}

export function applyRemove(accounts: Account[], id: string): Account[] {
  return accounts.filter(a => a.id !== id)
}
