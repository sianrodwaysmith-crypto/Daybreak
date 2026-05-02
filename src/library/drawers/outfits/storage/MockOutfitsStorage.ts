import type { Outfit, OutfitsStorage } from '../types'
import { idbGetAll, idbPut, idbDelete, idbClear } from './idb'

/**
 * Local-first outfits storage backed by IndexedDB. Used when the user
 * isn't connected to Google. Photos sit on-device as data URLs and
 * survive reloads but not PWA reinstalls — that's what Drive is for.
 */
export class MockOutfitsStorage implements OutfitsStorage {
  private cache:       Outfit[] | null     = null
  private loadPromise: Promise<void> | null = null

  private async ensureLoaded(): Promise<void> {
    if (this.cache !== null) return
    if (this.loadPromise) { await this.loadPromise; return }
    this.loadPromise = this.load()
    await this.loadPromise
  }

  private async load(): Promise<void> {
    let all: Outfit[] = []
    try { all = await idbGetAll<Outfit>() }
    catch { all = [] }
    this.cache = all
  }

  async list(userId: string): Promise<Outfit[]> {
    await this.ensureLoaded()
    return this.cache!
      .filter(o => o.userId === userId)
      .slice()
      // Newest first, by capturedAt timestamp.
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
  }

  async add(input: Omit<Outfit, 'id' | 'capturedAt'>): Promise<Outfit> {
    await this.ensureLoaded()
    const created: Outfit = {
      ...input,
      id:         `outfit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      capturedAt: new Date().toISOString(),
    }
    await idbPut(created)
    this.cache!.push(created)
    return created
  }

  async update(id: string, partial: Partial<Pick<Outfit, 'note' | 'date' | 'photo'>>): Promise<Outfit> {
    await this.ensureLoaded()
    const existing = this.cache!.find(o => o.id === id)
    if (!existing) throw new Error(`outfit ${id} not found`)
    const updated: Outfit = { ...existing, ...partial }
    await idbPut(updated)
    this.cache = this.cache!.map(o => o.id === id ? updated : o)
    return updated
  }

  async delete(id: string): Promise<void> {
    await this.ensureLoaded()
    await idbDelete(id)
    this.cache = this.cache!.filter(o => o.id !== id)
  }

  async clearAll(userId: string): Promise<void> {
    await this.ensureLoaded()
    try { await idbClear() } catch { /* ignore */ }
    this.cache = this.cache!.filter(o => o.userId !== userId)
  }
}
