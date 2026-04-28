/* ====================================================================
   Date helpers for the Lessons module.
   All "today / tomorrow / day-rolled-over?" logic anchors here so the
   rest of the module can stay timezone-agnostic.
==================================================================== */

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isoDate(d: Date): string {
  return todayISO(d)
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d)
  out.setDate(out.getDate() + days)
  return out
}

export function daysSince(iso: string, now: Date = new Date()): number {
  const [y, m, d] = iso.split('-').map(Number)
  const then = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((today.getTime() - then.getTime()) / (24 * 60 * 60 * 1000))
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Human-friendly relative time for "last touched" labels in the
 * library. Input is an ISO timestamp (or null/undefined). Output:
 * "today", "yesterday", "N days ago", "N weeks ago", or "—".
 */
export function relativeTouched(iso: string | null | undefined, now: Date = new Date()): string {
  if (!iso) return '—'
  const t = new Date(iso)
  if (Number.isNaN(t.getTime())) return '—'
  const dateOnly = todayISO(t)
  const days = daysSince(dateOnly, now)
  if (days <= 0)  return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7)   return `${days} days ago`
  const weeks = Math.floor(days / 7)
  return weeks === 1 ? 'a week ago' : `${weeks} weeks ago`
}
