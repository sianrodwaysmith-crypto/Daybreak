import { fetchAccountNews } from '../services/ai'
import type { Account, NewsState } from './types'

/* ====================================================================
   Per-account news cache + loader.
   - Cache key: account-id + today's local date. Refreshed automatically
     once a day; manual ↻ on the card forces a refetch.
   - Cache value: raw XML string from the model (parsed by the screen).
   - On-demand: only the focus account auto-fetches on screen open;
     other accounts wait for a tap to keep API spend in check.
==================================================================== */

const CACHE_VERSION = 'v2'

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
function key(id: string): string {
  return `daybreak-account-news-${CACHE_VERSION}-${id}-${todayKey()}`
}
function tsKey(id: string): string {
  return `${key(id)}-ts`
}

interface Cached { content: string; fetchedAt: number }

function readCached(id: string): Cached | null {
  try {
    const content = localStorage.getItem(key(id))
    if (!content) return null
    const ts = Number(localStorage.getItem(tsKey(id)) ?? Date.now())
    return { content, fetchedAt: ts }
  } catch { return null }
}
function writeCached(id: string, content: string, fetchedAt: number) {
  try {
    localStorage.setItem(key(id), content)
    localStorage.setItem(tsKey(id), String(fetchedAt))
  } catch { /* noop */ }
}
function clearCached(id: string) {
  try {
    localStorage.removeItem(key(id))
    localStorage.removeItem(tsKey(id))
  } catch { /* noop */ }
}

export function readAccountNews(id: string): NewsState {
  const cached = readCached(id)
  if (!cached) return { content: null, loading: false, error: false, errorMsg: null, fetchedAt: null }
  return { content: cached.content, loading: false, error: false, errorMsg: null, fetchedAt: cached.fetchedAt }
}

export async function loadAccountNews(
  account: Account,
  isFocus: boolean,
  opts:    { force?: boolean } = {},
): Promise<NewsState> {
  if (!opts.force) {
    const cached = readCached(account.id)
    if (cached) {
      return { content: cached.content, loading: false, error: false, errorMsg: null, fetchedAt: cached.fetchedAt }
    }
  }
  // Force = bust today's cache so the next read returns fresh data.
  if (opts.force) clearCached(account.id)

  try {
    const content = await fetchAccountNews({
      name:               account.name,
      contact:            account.contact,
      notes:              account.notes,
      storyCount:         isFocus ? 3 : 2,
      withTalkingPoints:  isFocus,
    })
    const fetchedAt = Date.now()
    writeCached(account.id, content, fetchedAt)
    return { content, loading: false, error: false, errorMsg: null, fetchedAt }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { content: null, loading: false, error: true, errorMsg: msg, fetchedAt: null }
  }
}
