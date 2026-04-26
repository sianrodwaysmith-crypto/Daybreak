import type { Moment, MemorySurface } from '../types'
import { copy } from '../copy'
import {
  daysBetween, fromISO, isExactlyNMonthsAgo,
  sameMonthAndDay, yearsBetweenAnniversary,
} from './dateHelpers'

/**
 * Memory resurfacing rules. Each rule is a pure function that, given today
 * and the user's full collection, returns a candidate MemorySurface or null.
 * The engine evaluates rules in priority order and returns the first match.
 *
 * Adding a sixth rule is a one-function change: write a Rule, append it to
 * the RULES array. No other code should need to move.
 */

export interface Rule {
  id:       string
  evaluate: (now: Date, all: Moment[]) => MemorySurface | null
}

function buildSurface(moment: Moment, ruleId: string, caption: string): MemorySurface {
  return { moment, rule: ruleId, caption }
}

const aYearAgoToday: Rule = {
  id: 'a_year_ago_today',
  evaluate(now, all) {
    const match = all.find(m => {
      const d = fromISO(m.date)
      return sameMonthAndDay(d, now) && yearsBetweenAnniversary(now, d) === 1
    })
    return match ? buildSurface(match, 'a_year_ago_today', copy.memory.aYearAgoToday()) : null
  },
}

const nYearsAgoToday: Rule = {
  id: 'n_years_ago_today',
  evaluate(now, all) {
    // Newest matching anniversary first (e.g. 3-year over 5-year for the
    // same calendar day) — feels more relevant.
    const matches = all
      .map(m => ({ m, years: yearsBetweenAnniversary(now, fromISO(m.date)) }))
      .filter(({ m, years }) => years >= 2 && sameMonthAndDay(fromISO(m.date), now))
      .sort((a, b) => a.years - b.years)
    const top = matches[0]
    return top
      ? buildSurface(top.m, 'n_years_ago_today', copy.memory.nYearsAgoToday(top.years))
      : null
  },
}

const aYearAgoThisWeek: Rule = {
  id: 'a_year_ago_this_week',
  evaluate(now, all) {
    // Within ±3 days of one calendar year prior. Skip the same-day case
    // (covered by the higher-priority rule).
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const match = all.find(m => {
      const d = fromISO(m.date)
      const distance = Math.abs(daysBetween(d, yearAgo))
      return distance > 0 && distance <= 3
    })
    return match
      ? buildSurface(match, 'a_year_ago_this_week', copy.memory.aYearAgoThisWeek())
      : null
  },
}

const aMonthAgoToday: Rule = {
  id: 'a_month_ago_today',
  evaluate(now, all) {
    const match = all.find(m => isExactlyNMonthsAgo(now, fromISO(m.date), 1))
    return match
      ? buildSurface(match, 'a_month_ago_today', copy.memory.aMonthAgo())
      : null
  },
}

const randomOlder: Rule = {
  id: 'random_older',
  evaluate(now, all) {
    if (all.length < 14) return null
    const olderThan30 = all.filter(m => daysBetween(now, fromISO(m.date)) > 30)
    if (olderThan30.length === 0) return null
    // Stable-per-day pseudo-random pick so the same memory shows all morning.
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
    const pick = olderThan30[seed % olderThan30.length]
    return buildSurface(pick, 'random_older', copy.memory.randomOlder(fromISO(pick.date)))
  },
}

const RULES: Rule[] = [
  aYearAgoToday,
  nYearsAgoToday,
  aYearAgoThisWeek,
  aMonthAgoToday,
  randomOlder,
]

export function evaluateMemoryRules(now: Date, all: Moment[]): MemorySurface | null {
  for (const rule of RULES) {
    const result = rule.evaluate(now, all)
    if (result) return result
  }
  return null
}

// Exported for tests / debugging.
export const __RULES_FOR_TEST = RULES
