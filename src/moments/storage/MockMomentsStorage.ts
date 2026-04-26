import type { Moment, MomentsStorage } from '../types'
import { isoDate, addDays } from '../core/dateHelpers'

const STORE_KEY = 'daybreak-moments-v1'

function readStore(): Moment[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) as Moment[] : []
  } catch { return [] }
}

function writeStore(moments: Moment[]): void {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(moments)) }
  catch { /* noop — quota exceeded etc. */ }
}

function newId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * In-browser mock storage backed by localStorage. Persists a single user's
 * moments by ISO date. The real implementation is a TODO stub against the
 * same MomentsStorage interface — see SupabaseMomentsStorage.ts.
 *
 * If the env flag VITE_MOMENTS_SAMPLE_DATA === 'on' AND no data is yet in
 * localStorage, the constructor seeds a few placeholder moments at dates
 * computed relative to today (one year ago today, two years ago today,
 * a month ago, etc.) so the resurfacing rules engine has something real to
 * evaluate during development. Sample data uses Picsum URLs seeded by the
 * date so the same date always returns the same image.
 */
export class MockMomentsStorage implements MomentsStorage {
  private moments: Moment[]

  constructor() {
    const existing = readStore()
    if (existing.length === 0 && import.meta.env.VITE_MOMENTS_SAMPLE_DATA === 'on') {
      this.moments = seedSamples()
      writeStore(this.moments)
    } else {
      this.moments = existing
    }
  }

  async submit(moment: Omit<Moment, 'id' | 'submittedAt'>): Promise<Moment> {
    // Date is the natural primary key — re-submitting on the same day
    // overwrites in place. Caller is responsible for confirming with the user.
    const created: Moment = {
      ...moment,
      id:           newId(),
      submittedAt:  new Date().toISOString(),
    }
    this.moments = [...this.moments.filter(m => !(m.userId === moment.userId && m.date === moment.date)), created]
    writeStore(this.moments)
    return created
  }

  async getByDate(userId: string, date: string): Promise<Moment | null> {
    return this.moments.find(m => m.userId === userId && m.date === date) ?? null
  }

  async getRange(userId: string, startDate: string, endDate: string): Promise<Moment[]> {
    return this.moments
      .filter(m => m.userId === userId && m.date >= startDate && m.date <= endDate)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async getAll(userId: string): Promise<Moment[]> {
    return this.moments
      .filter(m => m.userId === userId)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async delete(id: string): Promise<void> {
    this.moments = this.moments.filter(m => m.id !== id)
    writeStore(this.moments)
  }

  async update(id: string, partial: Partial<Pick<Moment, 'note' | 'photoRef'>>): Promise<Moment> {
    let updated: Moment | null = null
    this.moments = this.moments.map(m => {
      if (m.id !== id) return m
      updated = { ...m, ...partial }
      return updated
    })
    if (!updated) throw new Error(`moment ${id} not found`)
    writeStore(this.moments)
    return updated
  }
}

/* -------------------------------------------------------------------------
   Sample data, gated by VITE_MOMENTS_SAMPLE_DATA. Computed relative to
   the current date so the rules engine has plausible candidates.
------------------------------------------------------------------------- */

function picsum(seed: string, w = 600, h = 600): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`
}

function seedSamples(): Moment[] {
  const now = new Date()
  const sampleUserId = 'sian'

  const offsets: Array<{ deltaDays: number; note?: string }> = [
    { deltaDays: -1,    note: 'a quiet walk' },
    { deltaDays: -7 },
    { deltaDays: -30,   note: 'late breakfast' },
    { deltaDays: -90 },
    { deltaDays: -180,  note: 'sea, finally' },
    { deltaDays: -365,  note: 'anniversary' },
    { deltaDays: -730 },
  ]

  return offsets.map(({ deltaDays, note }) => {
    const date = addDays(now, deltaDays)
    const iso  = isoDate(date)
    return {
      id:          `seed-${iso}`,
      userId:      sampleUserId,
      date:        iso,
      photoRef:    { source: 'upload', identifier: picsum(iso) },
      note,
      submittedAt: date.toISOString(),
    }
  })
}
