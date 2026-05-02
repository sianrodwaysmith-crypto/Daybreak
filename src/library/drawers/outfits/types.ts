/**
 * Public types for the Outfits drawer. The shape mirrors Moments
 * deliberately — same idea (a photo + a date + an optional note,
 * persisted via Drive when connected), but Outfits aren't capped at
 * one-per-day. The user can log multiple outfits across time.
 */

export interface OutfitPhotoRef {
  source:     'upload'
  /** data: URL on submit (from the picker) or blob: URL on read (from
   *  the Drive backend, after streaming the photo bytes back). */
  identifier: string
  width?:     number
  height?:    number
}

export interface Outfit {
  id:           string
  userId:       string
  /** ISO YYYY-MM-DD; the day the outfit was worn. Defaults to today. */
  date:         string
  photo:        OutfitPhotoRef
  note?:        string
  /** ISO timestamp when the outfit was added. Used for newest-first sort. */
  capturedAt:   string
}

export interface OutfitsStorage {
  list(userId: string): Promise<Outfit[]>                               // newest first
  add(input: Omit<Outfit, 'id' | 'capturedAt'>): Promise<Outfit>
  update(id: string, partial: Partial<Pick<Outfit, 'note' | 'date' | 'photo'>>): Promise<Outfit>
  delete(id: string): Promise<void>
  clearAll(userId: string): Promise<void>
}
