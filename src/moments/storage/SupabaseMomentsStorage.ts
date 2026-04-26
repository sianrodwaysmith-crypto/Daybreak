import type { Moment, MomentsStorage } from '../types'

/**
 * TODO: real backend implementation. Should persist to a moments_* table
 * keyed by (userId, date) with a uniqueness constraint, and store the
 * photo as a blob in object storage with a CDN-served URL stored in
 * photoRef.identifier.
 *
 * Implements the same MomentsStorage interface as MockMomentsStorage so
 * swapping the factory selection in storage/index.ts is a one-line change.
 */
export class SupabaseMomentsStorage implements MomentsStorage {
  async submit(_moment: Omit<Moment, 'id' | 'submittedAt'>): Promise<Moment> {
    throw new Error('SupabaseMomentsStorage.submit not implemented')
  }
  async getByDate(_userId: string, _date: string): Promise<Moment | null> {
    throw new Error('SupabaseMomentsStorage.getByDate not implemented')
  }
  async getRange(_userId: string, _startDate: string, _endDate: string): Promise<Moment[]> {
    throw new Error('SupabaseMomentsStorage.getRange not implemented')
  }
  async getAll(_userId: string): Promise<Moment[]> {
    throw new Error('SupabaseMomentsStorage.getAll not implemented')
  }
  async delete(_id: string): Promise<void> {
    throw new Error('SupabaseMomentsStorage.delete not implemented')
  }
  async clearAll(_userId: string): Promise<void> {
    throw new Error('SupabaseMomentsStorage.clearAll not implemented')
  }
  async update(_id: string, _partial: Partial<Pick<Moment, 'note' | 'photoRef'>>): Promise<Moment> {
    throw new Error('SupabaseMomentsStorage.update not implemented')
  }
}
