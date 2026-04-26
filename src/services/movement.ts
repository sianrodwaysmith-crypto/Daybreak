import mock from '../data/movementMock.json'

/* ====================================================================
   Types
==================================================================== */

export type Source = 'planned' | 'booked' | 'done' | 'rest'

export interface MovementEvent {
  id:                string
  date:              string                       // ISO YYYY-MM-DD
  source:            Source
  title:             string                       // 'Padel', 'Strength', '5k run'
  startTime?:        string                       // '17:30'
  durationMinutes?:  number
  location?:         string                       // 'Rocket', 'David Lloyd Battersea'
  intensity?:        'low' | 'moderate' | 'high'
  externalId?:       string                       // for booked/done events sourced externally
  externalUrl?:      string                       // deep link back to source app
  notes?:            string                       // user notes for planned events
}

export interface RecoveryScore {
  date:  string
  score: number                                   // 0–100
}

/* ====================================================================
   Source interface — clean enough that swapping the mock for real
   Apple/Whoop/David Lloyd implementations later doesn't touch the tile.
==================================================================== */

export interface MovementSource {
  loadEvents(startDate: string, endDate: string): Promise<MovementEvent[]>
  createEvent(event: Omit<MovementEvent, 'id'>):  Promise<MovementEvent>
  updateEvent(id: string, partial: Partial<MovementEvent>): Promise<MovementEvent>
  deleteEvent(id: string): Promise<void>
}

/* -------------------------------------------------------------------
   Mock — local-first source backed by IndexedDB.
   Reads/writes go to IDB so events survive iOS PWA eviction of
   localStorage and don't share its tiny quota with photos. The legacy
   localStorage entry is migrated once on first load and then cleared.
------------------------------------------------------------------- */

const LEGACY_LS_KEY = 'daybreak-movement-events-v2'
const IDB_NAME      = 'daybreak-movement'
const IDB_STORE     = 'events'
const IDB_VERSION   = 1

let dbPromise: Promise<IDBDatabase> | null = null
function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror   = () => reject(req.error)
  })
  return dbPromise
}
async function idbGetAllEvents(): Promise<MovementEvent[]> {
  const db = await openDb()
  return new Promise<MovementEvent[]>((resolve, reject) => {
    const tx  = db.transaction(IDB_STORE, 'readonly')
    const req = tx.objectStore(IDB_STORE).getAll()
    req.onsuccess = () => resolve(req.result as MovementEvent[])
    req.onerror   = () => reject(req.error)
  })
}
async function idbPutEvent(value: MovementEvent): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(value)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}
async function idbDeleteEvent(id: string): Promise<void> {
  const db = await openDb()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  })
}

export class MockMovementSource implements MovementSource {
  private cache:       MovementEvent[] | null = null
  private loadPromise: Promise<void> | null   = null

  private async ensureLoaded(): Promise<void> {
    if (this.cache !== null) return
    if (this.loadPromise) { await this.loadPromise; return }
    this.loadPromise = this.load()
    await this.loadPromise
  }

  private async load(): Promise<void> {
    // 1. One-shot migration: copy any legacy localStorage payload into IDB
    //    and then drop the localStorage key.
    try {
      const legacy = localStorage.getItem(LEGACY_LS_KEY)
      if (legacy) {
        const parsed = JSON.parse(legacy) as MovementEvent[]
        for (const e of parsed) await idbPutEvent(e)
        localStorage.removeItem(LEGACY_LS_KEY)
      }
    } catch { /* ignore — partial migration is better than failed boot */ }

    // 2. Read from IDB.
    let all: MovementEvent[] = []
    try { all = await idbGetAllEvents() }
    catch { all = [] }

    // 3. Seed the bundled JSON only if both stores were empty after
    //    migration. movementMock.json is currently empty.
    if (all.length === 0 && (mock.events as MovementEvent[]).length > 0) {
      all = mock.events as MovementEvent[]
      for (const e of all) {
        try { await idbPutEvent(e) } catch { /* ignore */ }
      }
    }

    this.cache = all
  }

  async loadEvents(startDate: string, endDate: string): Promise<MovementEvent[]> {
    await this.ensureLoaded()
    return this.cache!
      .filter(e => e.date >= startDate && e.date <= endDate)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  async createEvent(event: Omit<MovementEvent, 'id'>): Promise<MovementEvent> {
    await this.ensureLoaded()
    const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const created: MovementEvent = { ...event, id }
    await idbPutEvent(created)
    this.cache!.push(created)
    return created
  }

  async updateEvent(id: string, partial: Partial<MovementEvent>): Promise<MovementEvent> {
    await this.ensureLoaded()
    const existing = this.cache!.find(e => e.id === id)
    if (!existing) throw new Error(`event ${id} not found`)
    const updated: MovementEvent = { ...existing, ...partial, id: existing.id }
    await idbPutEvent(updated)
    this.cache = this.cache!.map(e => e.id === id ? updated : e)
    return updated
  }

  async deleteEvent(id: string): Promise<void> {
    await this.ensureLoaded()
    await idbDeleteEvent(id)
    this.cache = this.cache!.filter(e => e.id !== id)
  }
}

/* -------------------------------------------------------------------
   Stubs — same interface, real wiring is a later phase.
------------------------------------------------------------------- */

// TODO: wire EventKit / Apple Calendar via a serverless bridge. Will surface
// 'planned' events the user creates in Calendar (or anything tagged
// "movement") and write back via createEvent.
export class AppleCalendarSource implements MovementSource {
  async loadEvents(_s: string, _e: string): Promise<MovementEvent[]>      { return [] }
  async createEvent(_e: Omit<MovementEvent, 'id'>): Promise<MovementEvent> { throw new Error('not implemented') }
  async updateEvent(_id: string, _p: Partial<MovementEvent>): Promise<MovementEvent> { throw new Error('not implemented') }
  async deleteEvent(_id: string): Promise<void>                           { throw new Error('not implemented') }
}

// TODO: read from /api/whoop/data once we extend it to return workouts. For
// now this is read-only and never mutates.
export class WhoopSource implements MovementSource {
  async loadEvents(_s: string, _e: string): Promise<MovementEvent[]>      { return [] }
  async createEvent(_e: Omit<MovementEvent, 'id'>): Promise<MovementEvent> { throw new Error('whoop is read-only') }
  async updateEvent(_id: string, _p: Partial<MovementEvent>): Promise<MovementEvent> { throw new Error('whoop is read-only') }
  async deleteEvent(_id: string): Promise<void>                           { throw new Error('whoop is read-only') }
}

// TODO: scrape / poll David Lloyd's booking page. Read-only.
export class DavidLloydSource implements MovementSource {
  async loadEvents(_s: string, _e: string): Promise<MovementEvent[]>      { return [] }
  async createEvent(_e: Omit<MovementEvent, 'id'>): Promise<MovementEvent> { throw new Error('david-lloyd is read-only') }
  async updateEvent(_id: string, _p: Partial<MovementEvent>): Promise<MovementEvent> { throw new Error('david-lloyd is read-only') }
  async deleteEvent(_id: string): Promise<void>                           { throw new Error('david-lloyd is read-only') }
}

/* -------------------------------------------------------------------
   Composite source — the tile composes from a list of sources.
   Mutations route to whichever source owns the id (currently only
   the local MockMovementSource is writable).
------------------------------------------------------------------- */

export class CompositeMovementSource implements MovementSource {
  private readonly sources: MovementSource[]
  constructor(sources: MovementSource[]) { this.sources = sources }

  async loadEvents(startDate: string, endDate: string): Promise<MovementEvent[]> {
    const all = await Promise.all(this.sources.map(s => s.loadEvents(startDate, endDate)))
    return all.flat().sort((a, b) => a.date.localeCompare(b.date))
  }

  async createEvent(event: Omit<MovementEvent, 'id'>): Promise<MovementEvent> {
    // New events always go to the writable mock source (first one).
    return this.sources[0].createEvent(event)
  }

  async updateEvent(id: string, partial: Partial<MovementEvent>): Promise<MovementEvent> {
    return this.sources[0].updateEvent(id, partial)
  }

  async deleteEvent(id: string): Promise<void> {
    return this.sources[0].deleteEvent(id)
  }
}

/* ====================================================================
   Helpers
==================================================================== */

const ONE_DAY_MS = 24 * 60 * 60 * 1000

export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfWeek(d: Date): Date {
  // ISO week — Monday as start.
  const day = (d.getDay() + 6) % 7   // 0 = Mon
  const out = new Date(d)
  out.setHours(0, 0, 0, 0)
  out.setDate(out.getDate() - day)
  return out
}

export function weekDates(weekStart: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart.getTime() + i * ONE_DAY_MS)
    return isoDate(d)
  })
}

export function todayISO(): string { return isoDate(new Date()) }

/* -------------------------------------------------------------------
   Cadence — 'usual N' from the last 4 complete weeks (excluding
   the current one), plus this week's done count and hours done.
------------------------------------------------------------------- */

export interface Cadence {
  usual:        number   // average completed sessions per week, rounded
  thisWeek:     number   // sessions actually completed this week (done only)
  hoursDone:    number   // sum of durationMinutes for done events this week, in hours
  onTrack:      boolean
  shortfall:    number   // max(usual - thisWeek, 0)
}

export function computeCadence(events: MovementEvent[], today: Date): Cadence {
  const thisWeekStart = startOfWeek(today)
  const thisWeekEnd   = new Date(thisWeekStart.getTime() + 6 * ONE_DAY_MS)
  const fourWeeksAgo  = new Date(thisWeekStart.getTime() - 4 * 7 * ONE_DAY_MS)

  // Usual = average completed sessions per week over the last 4 weeks.
  const completedLast4 = events.filter(e =>
    e.date >= isoDate(fourWeeksAgo) &&
    e.date <  isoDate(thisWeekStart) &&
    e.source === 'done',
  )
  const usual = Math.round(completedLast4.length / 4)

  // This week — done only, with hours from durationMinutes.
  const completedThisWeek = events.filter(e =>
    e.date >= isoDate(thisWeekStart) &&
    e.date <= isoDate(thisWeekEnd) &&
    e.source === 'done',
  )
  const thisWeek  = completedThisWeek.length
  const minutes   = completedThisWeek.reduce((sum, e) => sum + (e.durationMinutes ?? 0), 0)
  const hoursDone = Math.round((minutes / 60) * 10) / 10

  return {
    usual,
    thisWeek,
    hoursDone,
    onTrack:   thisWeek >= usual,
    shortfall: Math.max(usual - thisWeek, 0),
  }
}

/* -------------------------------------------------------------------
   Today's session resolver — picks the most relevant event for today
   to display in the hero line.
------------------------------------------------------------------- */

export function todaysSession(events: MovementEvent[], today: Date): MovementEvent | null {
  const iso = isoDate(today)
  const same = events.filter(e => e.date === iso)
  if (same.length === 0) return null
  // Prefer booked > planned > done > rest.
  const order: Source[] = ['booked', 'planned', 'done', 'rest']
  for (const s of order) {
    const found = same.find(e => e.source === s)
    if (found) return found
  }
  return same[0]
}

/* -------------------------------------------------------------------
   Hidden cadence template — auto-generates planned events 7 days out.
   Toggled off by default; flip the localStorage key to enable.
------------------------------------------------------------------- */

const TEMPLATE_FLAG_KEY = 'daybreak-movement-template-on'

export interface CadenceTemplate {
  // Lowercase day name → activity title. Days not listed get nothing.
  monday?:    string
  tuesday?:   string
  wednesday?: string
  thursday?:  string
  friday?:    string
  saturday?:  string
  sunday?:    string
}

const DEFAULT_TEMPLATE: CadenceTemplate = {
  tuesday:  'Padel',
  thursday: 'Padel',
  saturday: 'Long run',
}

const DAY_KEYS: (keyof CadenceTemplate)[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
]

export function isTemplateOn(): boolean {
  try { return localStorage.getItem(TEMPLATE_FLAG_KEY) === 'on' }
  catch { return false }
}

export function setTemplateOn(on: boolean): void {
  try { localStorage.setItem(TEMPLATE_FLAG_KEY, on ? 'on' : 'off') }
  catch { /* noop */ }
}

/**
 * Generate planned events for the next 7 days based on a cadence template,
 * skipping any days that already have an event in the same week.
 */
export async function generateFromTemplate(
  source:   MovementSource,
  template: CadenceTemplate = DEFAULT_TEMPLATE,
  today:    Date = new Date(),
): Promise<MovementEvent[]> {
  if (!isTemplateOn()) return []

  const start = isoDate(today)
  const end   = isoDate(new Date(today.getTime() + 7 * ONE_DAY_MS))
  const existing = await source.loadEvents(start, end)
  const haveDate = new Set(existing.map(e => e.date))

  const created: MovementEvent[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(today.getTime() + i * ONE_DAY_MS)
    const key = DAY_KEYS[(d.getDay() + 6) % 7]
    const title = template[key]
    const iso = isoDate(d)
    if (!title || haveDate.has(iso)) continue
    created.push(await source.createEvent({ date: iso, source: 'planned', title }))
  }
  return created
}
