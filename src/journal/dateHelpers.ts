/**
 * Local-date helpers for the Journal module. All dates use the user's
 * local timezone — the journal is phenomenologically a "today" object,
 * so UTC drift is wrong. Mirrors how the lessons module handles dates.
 */

export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function dayOfWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { weekday: 'long' })
}

export function fullDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

export function monthName(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'long' })
}

/**
 * Days until the next Wednesday (computed dynamically, never hardcoded).
 * Returns 0 when today is Wednesday.
 */
export function daysUntilNextWednesday(now: Date = new Date()): number {
  const dow = now.getDay()                // Sunday=0 … Saturday=6
  if (dow === 3) return 0                 // already Wednesday
  // Days to add to land on the next Wednesday (3).
  return (3 - dow + 7) % 7
}
