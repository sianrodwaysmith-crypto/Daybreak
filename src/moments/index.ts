/**
 * Public API for the Moments module. The rest of the Daybreak codebase
 * imports ONLY from this file.
 *
 * Internals (storage, pickers, rules engine, components beyond the
 * exported four, the internal modal, helpers) are not re-exported.
 */

import './styles.css'

import type { Moment, MemorySurface, PhotoRef } from './types'
import { getStorage, probeStorage } from './storage'
import type { MomentsStorageDebug } from './storage'
import { evaluateMemoryRules } from './core/memoryRules'

export type { Moment, MemorySurface, PhotoRef } from './types'
export type { MomentsStorageDebug } from './storage'

export { MomentsTile }       from './components/MomentsTile'
export { MomentsCollection } from './components/MomentsCollection'
export { MomentsSubmitFlow } from './components/MomentsSubmitFlow'
export { MomentsDayCard }    from './components/MomentsDayCard'

interface SubmitParams {
  userId:    string
  date:      string
  photoRef:  PhotoRef
  note?:     string
}

interface CollectionRange { start: string; end: string }

export const moments = {
  submit(params: SubmitParams): Promise<Moment> {
    return getStorage().submit(params)
  },
  getByDate(userId: string, date: string): Promise<Moment | null> {
    return getStorage().getByDate(userId, date)
  },
  async getMemoryForToday(userId: string, now: Date = new Date()): Promise<MemorySurface | null> {
    const all = await getStorage().getAll(userId)
    return evaluateMemoryRules(now, all)
  },
  getCollection(userId: string, range?: CollectionRange): Promise<Moment[]> {
    const storage = getStorage()
    return range ? storage.getRange(userId, range.start, range.end) : storage.getAll(userId)
  },
  delete(id: string): Promise<void> {
    return getStorage().delete(id)
  },
  clearAll(userId: string): Promise<void> {
    return getStorage().clearAll(userId)
  },
  /** Diagnostic probe — returns storage backend, Drive file count, etc. */
  probe(userId: string): Promise<MomentsStorageDebug> {
    return probeStorage(userId)
  },
}
