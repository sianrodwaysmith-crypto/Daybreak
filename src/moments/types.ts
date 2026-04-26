/**
 * Public types for the Moments module. These are the only shapes the rest
 * of the app sees; everything else is internal.
 */

export interface PhotoRef {
  source:      'upload' | 'apple_photos' | 'google_photos'
  identifier:  string                  // URL for upload (data: URL in mock); asset id for the others
  width?:      number
  height?:     number
}

export interface Moment {
  id:           string
  userId:       string
  date:         string                 // ISO YYYY-MM-DD; the day this moment represents
  photoRef:     PhotoRef
  note?:        string                 // one line, optional
  submittedAt:  string                 // ISO timestamp
}

export interface MemorySurface {
  moment:   Moment
  rule:     string                     // identifier of the rule that selected this moment
  caption:  string                     // resolved caption text, e.g. "A year ago today."
}

/* ---------- Storage interface ---------- */

export interface MomentsStorage {
  submit(moment: Omit<Moment, 'id' | 'submittedAt'>): Promise<Moment>
  getByDate(userId: string, date: string): Promise<Moment | null>
  getRange(userId: string, startDate: string, endDate: string): Promise<Moment[]>
  getAll(userId: string): Promise<Moment[]>
  delete(id: string): Promise<void>
  clearAll(userId: string): Promise<void>
  update(id: string, partial: Partial<Pick<Moment, 'note' | 'photoRef'>>): Promise<Moment>
}

/* ---------- Photo picker interface ---------- */

export interface PhotoPickerSource {
  pick(): Promise<PhotoRef | null>     // resolves to null when the user cancels
}
