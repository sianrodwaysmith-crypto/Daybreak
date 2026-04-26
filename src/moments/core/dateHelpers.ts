/**
 * Date utilities for the Moments module. All date reasoning runs through
 * this file so the components and rules engine never touch raw Date math.
 */

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(iso: string): Date {
  // Treat as local-midnight to avoid timezone drift inside the day.
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function startOfLocalDay(d: Date): Date {
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  return out
}

export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * ONE_DAY_MS)
}

export function daysBetween(a: Date, b: Date): number {
  const aDay = startOfLocalDay(a).getTime()
  const bDay = startOfLocalDay(b).getTime()
  return Math.round((aDay - bDay) / ONE_DAY_MS)
}

/** Calendar-month diff, ignoring day-of-month. */
export function monthsBetween(a: Date, b: Date): number {
  return (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth())
}

/** Whole-year diff, only true on or after the anniversary day. */
export function yearsBetweenAnniversary(now: Date, then: Date): number {
  const years = now.getFullYear() - then.getFullYear()
  const beforeAnniversary =
    now.getMonth() < then.getMonth() ||
    (now.getMonth() === then.getMonth() && now.getDate() < then.getDate())
  return beforeAnniversary ? years - 1 : years
}

export function sameMonthAndDay(a: Date, b: Date): boolean {
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** Returns true when today is exactly N months ago, ignoring day-of-month
 *  shifts at month boundaries (Feb 28 vs Mar 28 etc. — keep simple). */
export function isExactlyNMonthsAgo(now: Date, then: Date, n: number): boolean {
  return monthsBetween(now, then) === n && now.getDate() === then.getDate()
}

export function isAfterHourLocal(d: Date, hour: number): boolean {
  return d.getHours() >= hour
}

export function todayISO(now: Date = new Date()): string {
  return isoDate(now)
}
