import type { Moment, MomentsStorage } from '../types'
import { isoDate, addDays } from '../core/dateHelpers'
import { idbGetAll, idbPut, idbDelete } from './idb'

const LEGACY_LS_KEY = 'daybreak-moments-v1'

function newId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Local-first moments storage backed by IndexedDB.
 *
 * Originally backed localStorage, but a single full-resolution photo as a
 * base64 data URL exceeds iOS Safari's ~5 MB localStorage cap and the
 * write fails silently. IndexedDB has ~50 MB+ headroom on the same
 * platform and is the right home for blobs. The class is still called
 * "Mock" because it's the local-first stand-in for the eventual real
 * backend (see SupabaseMomentsStorage for the TODO swap target).
 *
 * On first construction the class migrates any legacy localStorage entry
 * into IDB and clears the old key, so users who saved a few moments
 * before the switch don't lose them.
 *
 * If VITE_MOMENTS_SAMPLE_DATA === 'on' AND the store ends up empty after
 * migration, seeds a few placeholder moments at dates relative to today
 * so the resurfacing rules engine has plausible candidates during dev.
 */
export class MockMomentsStorage implements MomentsStorage {
  private cache:       Moment[] | null     = null
  private loadPromise: Promise<void> | null = null

  private async ensureLoaded(): Promise<void> {
    if (this.cache !== null) return
    if (this.loadPromise) { await this.loadPromise; return }
    this.loadPromise = this.load()
    await this.loadPromise
  }

  private async load(): Promise<void> {
    // 1. Migrate legacy localStorage payload if present.
    try {
      const legacy = localStorage.getItem(LEGACY_LS_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy) as Moment[]
        for (const m of parsed) await idbPut(m)
        localStorage.removeItem(LEGACY_LS_KEY)
      }
    } catch { /* ignore — partial migration is better than failed boot */ }

    // 2. Read everything from IDB.
    let all: Moment[] = []
    try { all = await idbGetAll<Moment>() }
    catch { all = [] }

    // 3. Optional dev seed.
    if (all.length === 0 && import.meta.env.VITE_MOMENTS_SAMPLE_DATA === 'on') {
      const seeded = seedSamples()
      for (const m of seeded) {
        try { await idbPut(m) } catch { /* ignore individual seed failures */ }
      }
      all = seeded
    }

    this.cache = all
  }

  async submit(moment: Omit<Moment, 'id' | 'submittedAt'>): Promise<Moment> {
    await this.ensureLoaded()
    const created: Moment = {
      ...moment,
      id:           newId(),
      submittedAt:  new Date().toISOString(),
    }

    // Date is the natural primary key — re-submitting on the same day
    // overwrites in place. Delete the old IDB row and the in-memory copy
    // before writing the new one.
    const existingForDate = this.cache!.filter(
      m => m.userId === moment.userId && m.date === moment.date,
    )
    for (const old of existingForDate) {
      try { await idbDelete(old.id) } catch { /* ignore */ }
    }
    this.cache = this.cache!.filter(
      m => !(m.userId === moment.userId && m.date === moment.date),
    )
    await idbPut(created)
    this.cache.push(created)
    return created
  }

  async getByDate(userId: string, date: string): Promise<Moment | null> {
    await this.ensureLoaded()
    return this.cache!.find(m => m.userId === userId && m.date === date) ?? null
  }

  async getRange(userId: string, startDate: string, endDate: string): Promise<Moment[]> {
    await this.ensureLoaded()
    return this.cache!
      .filter(m => m.userId === userId && m.date >= startDate && m.date <= endDate)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async getAll(userId: string): Promise<Moment[]> {
    await this.ensureLoaded()
    return this.cache!
      .filter(m => m.userId === userId)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  async delete(id: string): Promise<void> {
    await this.ensureLoaded()
    await idbDelete(id)
    this.cache = this.cache!.filter(m => m.id !== id)
  }

  async update(id: string, partial: Partial<Pick<Moment, 'note' | 'photoRef'>>): Promise<Moment> {
    await this.ensureLoaded()
    const existing = this.cache!.find(m => m.id === id)
    if (!existing) throw new Error(`moment ${id} not found`)
    const updated: Moment = { ...existing, ...partial }
    await idbPut(updated)
    this.cache = this.cache!.map(m => m.id === id ? updated : m)
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
