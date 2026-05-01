import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { MovementIcon } from './icons'
import {
  MockMovementSource, CompositeMovementSource, GoogleCalendarMovementSource,
  computeCadence, todaysSession, weekDates, startOfWeek, todayISO, isoDate,
  type MovementEvent, type MovementSource, type Source,
} from '../services/movement'

/* ====================================================================
   Single composite source instance for the whole app.
   First source is the writable mock (user-edited planned/rest events);
   second is the Google Calendar reader which surfaces any titled-as-
   exercise events as 'booked' sessions on the chart. Future sources
   (Whoop workouts, David Lloyd bookings) plug in here.
==================================================================== */
const source: MovementSource = new CompositeMovementSource([
  new MockMovementSource(),
  new GoogleCalendarMovementSource(),
])

/* ====================================================================
   Helpers
==================================================================== */

const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's']
const ONE_DAY    = 24 * 60 * 60 * 1000
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function todayLine(today: MovementEvent | null): string {
  if (!today) return 'Nothing planned today.'
  if (today.source === 'rest') return 'Rest day.'
  const time = today.startTime ? ` · ${today.startTime} today` : ' today'
  return `${today.title}${time}`
}

function hoursLine(hours: number): string {
  if (hours <= 0) return 'No hours logged yet.'
  if (hours === 1) return '1 hr exercised this week.'
  // Show "1.5 hrs" but drop a trailing .0 so whole numbers read cleanly.
  const display = Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)
  return `${display} hrs exercised this week.`
}

function kcalLine(kcal: number | null): string {
  if (kcal == null) return ''
  return `${kcal.toLocaleString()} kcal today.`
}

function weekRangeLabel(weekStart: Date): string {
  const end = new Date(weekStart.getTime() + 6 * ONE_DAY)
  const sameMonth = weekStart.getMonth() === end.getMonth()
  const sm = SHORT_MONTHS[weekStart.getMonth()]
  const em = SHORT_MONTHS[end.getMonth()]
  if (sameMonth) return `${sm} ${weekStart.getDate()} – ${end.getDate()}`
  return `${sm} ${weekStart.getDate()} – ${em} ${end.getDate()}`
}

function relativeWeekLabel(weekStart: Date, todayWeekStart: Date): string {
  const diff = Math.round((weekStart.getTime() - todayWeekStart.getTime()) / (7 * ONE_DAY))
  if (diff === 0) return 'This week'
  if (diff === -1) return 'Last week'
  if (diff === 1)  return 'Next week'
  return weekRangeLabel(weekStart)
}

/* ====================================================================
   Week chart — CSS grid, fluid width, no SVG stretch
==================================================================== */

interface ChartProps {
  weekISO:       string[]                 // 7 ISO dates Monday-first
  byDate:        Map<string, MovementEvent>
  todayISO:      string
  onTapDay:      (iso: string) => void
}

function WeekChart({ weekISO, byDate, todayISO: today, onTapDay }: ChartProps) {
  return (
    <div className="movement-week" role="group" aria-label="Movement this week">
      <div className="movement-horizon" aria-hidden />
      {weekISO.map((iso, i) => {
        const ev = byDate.get(iso)
        const isToday = iso === today
        return (
          <button
            key={iso}
            type="button"
            className={`movement-day${isToday ? ' is-today' : ''}`}
            onClick={() => onTapDay(iso)}
            aria-label={`${DAY_LABELS[i]} ${iso}`}
          >
            {ev?.source === 'done'    && <span className="movement-mark mark-done"    />}
            {ev?.source === 'booked'  && <span className="movement-mark mark-booked"  />}
            {ev?.source === 'planned' && <span className="movement-mark mark-planned" />}
            {ev?.source === 'rest'    && <span className="movement-mark mark-rest"           />}
            <span className="movement-day-label">{DAY_LABELS[i]}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ====================================================================
   Sheet — day view (list of sessions) + detail (add / edit / read-only)
==================================================================== */

interface SheetState {
  iso:        string
  dayEvents:  MovementEvent[]               // every event on this day
  active:     'list' | 'new' | string       // 'list' = day list; 'new' = blank form; string = event id
}

interface SheetProps {
  state:    SheetState | null
  onClose:  () => void
  onChange: (next: SheetState) => void      // navigate within the sheet (list <-> detail)
  onSaved:  () => void
}

function dayLabel(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function sourceBadge(s: Source): string {
  if (s === 'done')    return 'done'
  if (s === 'booked')  return 'booked'
  if (s === 'planned') return 'planned'
  return 'rest'
}

function MovementSheet({ state, onClose, onChange, onSaved }: SheetProps) {
  const [title,    setTitle]    = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)

  const activeEvent: MovementEvent | null =
    state && typeof state.active === 'string' && state.active !== 'list' && state.active !== 'new'
      ? state.dayEvents.find(e => e.id === state.active) ?? null
      : null

  useEffect(() => {
    if (!state) return
    if (activeEvent) {
      setTitle(activeEvent.title ?? '')
      setDuration(activeEvent.durationMinutes ? String(activeEvent.durationMinutes) : '')
    } else {
      setTitle(''); setDuration('')
    }
  }, [state, activeEvent])

  if (!state) return null

  const iso  = state.iso
  const date = dayLabel(iso)

  /* ---------------- LIST VIEW ---------------- */
  if (state.active === 'list') {
    const hasRest = state.dayEvents.some(e => e.source === 'rest')
    const isEmpty = state.dayEvents.length === 0
    return (
      <Modal isOpen={true} onClose={onClose} title="Day" accent="var(--ink)">
        <div className="movement-sheet">
          <div className="movement-sheet-date">{date}</div>

          {isEmpty && (
            <p className="movement-sheet-empty">Nothing planned for this day yet.</p>
          )}

          {!isEmpty && (
            <ul className="movement-day-list">
              {state.dayEvents.map(e => (
                <li key={e.id}>
                  <button
                    type="button"
                    className="movement-day-row"
                    onClick={() => onChange({ ...state, active: e.id })}
                  >
                    <span className="movement-day-row-title">{e.title}</span>
                    <span className="movement-day-row-meta">
                      {e.startTime ? e.startTime : null}
                      {e.startTime && (e.durationMinutes || e.location) ? ' · ' : ''}
                      {e.durationMinutes ? `${e.durationMinutes} min` : ''}
                      {e.durationMinutes && e.location ? ' · ' : ''}
                      {e.location ?? ''}
                    </span>
                    <span className={`movement-day-row-badge badge-${e.source}`}>{sourceBadge(e.source)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="movement-sheet-actions">
            <button
              className="movement-btn-primary"
              onClick={() => onChange({ ...state, active: 'new' })}
            >
              {isEmpty ? '+ Plan a session' : '+ Add another session'}
            </button>
            {!hasRest && (
              <button
                className="movement-btn-quiet"
                onClick={async () => {
                  setSaving(true)
                  try {
                    await source.createEvent({ date: iso, source: 'rest', title: 'Rest day' })
                    onSaved(); onClose()
                  } finally { setSaving(false) }
                }}
                disabled={saving}
              >
                Mark rest day
              </button>
            )}
          </div>
        </div>
      </Modal>
    )
  }

  /* ---------------- DETAIL / FORM VIEW ---------------- */
  const ev = activeEvent
  const editable = !ev || ev.source === 'planned' || ev.source === 'rest'
  const readonly = ev && (ev.source === 'booked' || ev.source === 'done')
  const canBack = state.dayEvents.length > 0

  function back() {
    if (state) onChange({ ...state, active: 'list' })
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const payload = {
        date:             iso,
        source:           'planned' as const,
        title:            title.trim(),
        durationMinutes:  duration.trim() ? Number(duration) : undefined,
      }
      if (ev && ev.source === 'planned') {
        await source.updateEvent(ev.id, payload)
      } else {
        if (ev && ev.source === 'rest') await source.deleteEvent(ev.id)
        await source.createEvent(payload)
      }
      onSaved(); onClose()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!ev) return
    setSaving(true)
    try { await source.deleteEvent(ev.id); onSaved(); onClose() }
    finally { setSaving(false) }
  }

  async function handleMarkDone() {
    if (!ev) return
    setSaving(true)
    try {
      // Form state is always pre-filled from `ev` on open, so for the
      // read-only booked view it matches `ev.*` exactly. For the editable
      // planned view, this preserves any tweaks the user made before
      // tapping done (e.g. logging that they actually ran 45 min not 60).
      const editedTitle    = title.trim()    || ev.title
      const editedDuration = duration.trim() ? Number(duration) : ev.durationMinutes

      const payload: Omit<MovementEvent, 'id'> = {
        date:             ev.date,
        source:           'done',
        title:            editedTitle,
        startTime:        ev.startTime,
        durationMinutes:  editedDuration,
        location:         ev.location,
        // Carry the upstream id so the composite source can hide the
        // read-only 'booked' record once we've shadowed it locally —
        // otherwise the same session shows up twice on the day list.
        externalId:       ev.externalId,
      }
      if (ev.source === 'planned') {
        await source.updateEvent(ev.id, payload)
      } else {
        await source.createEvent(payload)
      }
      onSaved(); onClose()
    } finally { setSaving(false) }
  }

  const title0 = readonly
    ? (ev?.source === 'booked' ? 'Booked' : 'Logged')
    : (ev ? 'Edit session' : 'Plan a session')

  return (
    <Modal isOpen={true} onClose={onClose} title={title0} accent="var(--ink)">
      <div className="movement-sheet">
        {canBack && (
          <button type="button" className="movement-sheet-back" onClick={back}>
            ← Back to {date}
          </button>
        )}
        <div className="movement-sheet-date">{date}</div>

        {readonly && ev && (
          <>
            <div className="movement-sheet-readtitle">{ev.title}</div>
            {(ev.startTime || ev.location) && (
              <div className="movement-sheet-readmeta">
                {ev.startTime ? ev.startTime : ''}
                {ev.startTime && ev.location ? ' · ' : ''}
                {ev.location ?? ''}
              </div>
            )}
            {ev.externalUrl && (
              <a
                href={ev.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="movement-sheet-link"
              >
                {ev.source === 'booked' ? 'Open in David Lloyd ↗' : 'Open in Whoop ↗'}
              </a>
            )}
            {ev.source === 'booked' && (
              <div className="movement-sheet-actions">
                <button className="movement-btn-primary" onClick={handleMarkDone} disabled={saving}>
                  {saving ? 'Saving…' : '✓ Mark as done'}
                </button>
              </div>
            )}
            {ev.source === 'done' && (
              <div className="movement-sheet-actions">
                <button className="movement-btn-quiet" onClick={handleDelete} disabled={saving}>
                  {saving ? 'Removing…' : 'Remove this entry'}
                </button>
              </div>
            )}
          </>
        )}

        {ev?.source === 'rest' && (
          <>
            <div className="movement-sheet-readtitle">Rest day.</div>
            <button className="movement-btn-quiet" onClick={handleDelete} disabled={saving}>
              Remove rest day
            </button>
          </>
        )}

        {editable && ev?.source !== 'rest' && (
          <>
            <label className="movement-field">
              <span className="movement-field-label">Title</span>
              <input
                className="movement-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Padel, run, strength…"
                autoFocus
              />
            </label>

            <label className="movement-field">
              <span className="movement-field-label">Duration (min)</span>
              <input
                className="movement-input"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="60"
                inputMode="numeric"
              />
            </label>

            <div className="movement-sheet-actions">
              {ev && ev.source === 'planned' && (
                <button
                  className="movement-btn-primary"
                  onClick={handleMarkDone}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : '✓ Mark as done'}
                </button>
              )}
              <button
                className={ev && ev.source === 'planned' ? 'movement-btn-quiet' : 'movement-btn-primary'}
                onClick={handleSave}
                disabled={saving || !title.trim()}
              >
                {saving ? 'Saving…' : ev ? 'Save changes' : 'Save'}
              </button>
              {ev && ev.source === 'planned' && (
                <button className="movement-btn-quiet" onClick={handleDelete} disabled={saving}>
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

/* ====================================================================
   Schedule modal — column view of every upcoming session
==================================================================== */

interface ScheduleModalProps {
  isOpen:   boolean
  onClose:  () => void
  events:   MovementEvent[]
  onTapEvent: (ev: MovementEvent) => void
  onTapDay:   (iso: string) => void
}

function MovementScheduleModal({ isOpen, onClose, events, onTapEvent, onTapDay }: ScheduleModalProps) {
  const today = todayISO()

  // Upcoming = today onwards, planned/booked/rest only (done is past).
  // Sorted by date then start time so the column reads chronologically.
  const upcoming = useMemo(() => {
    return events
      .filter(e => e.date >= today && e.source !== 'done')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        const at = a.startTime ?? '99:99'
        const bt = b.startTime ?? '99:99'
        return at < bt ? -1 : at > bt ? 1 : 0
      })
  }, [events, today])

  const grouped = useMemo(() => {
    const out: Array<{ iso: string; events: MovementEvent[] }> = []
    for (const e of upcoming) {
      const last = out[out.length - 1]
      if (last && last.iso === e.date) last.events.push(e)
      else out.push({ iso: e.date, events: [e] })
    }
    return out
  }, [upcoming])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Movement schedule" accent="var(--ink)">
      <div className="movement-schedule">
        {grouped.length === 0 && (
          <div className="movement-schedule-empty">
            <span>Nothing planned yet.</span>
            <button
              className="movement-btn-primary"
              onClick={() => { onClose(); onTapDay(today) }}
            >
              + Plan a session
            </button>
          </div>
        )}
        {grouped.map(group => (
          <section key={group.iso} className="movement-schedule-group">
            <h4 className="movement-schedule-day">{dayLabel(group.iso)}</h4>
            <ul className="movement-schedule-list">
              {group.events.map(e => (
                <li key={e.id}>
                  <button
                    type="button"
                    className="movement-day-row"
                    onClick={() => { onClose(); onTapEvent(e) }}
                  >
                    <span className="movement-day-row-title">{e.title}</span>
                    <span className="movement-day-row-meta">
                      {e.startTime ? e.startTime : null}
                      {e.startTime && e.durationMinutes ? ' · ' : ''}
                      {e.durationMinutes ? `${e.durationMinutes} min` : ''}
                      {(e.startTime || e.durationMinutes) && e.location ? ' · ' : ''}
                      {e.location ?? ''}
                    </span>
                    <span className={`movement-day-row-badge badge-${e.source}`}>{sourceBadge(e.source)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Modal>
  )
}

/* ====================================================================
   Tile
==================================================================== */

interface Props {
  strain:          number | null
  activeCalories:  number | null
}

const MAX_WEEKS_AHEAD = 8
const MAX_WEEKS_BACK  = 8

export default function MovementTile({ strain, activeCalories }: Props) {
  const [events, setEvents]   = useState<MovementEvent[]>([])
  const [sheet,  setSheet]    = useState<SheetState | null>(null)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [bump,   setBump]     = useState(0)

  const today = useMemo(() => new Date(), [])
  const todayWeekStart = useMemo(() => startOfWeek(today), [today])

  const [viewedWeekStart, setViewedWeekStart] = useState<Date>(() => startOfWeek(new Date()))

  const weekOffset = useMemo(
    () => Math.round((viewedWeekStart.getTime() - todayWeekStart.getTime()) / (7 * ONE_DAY)),
    [viewedWeekStart, todayWeekStart],
  )
  const canGoBack    = weekOffset > -MAX_WEEKS_BACK
  const canGoForward = weekOffset <  MAX_WEEKS_AHEAD

  // Pull events spanning 4 prior weeks + the viewed week (so cadence still
  // works regardless of where the user has scrolled to). Refresh on bump.
  useEffect(() => {
    let alive = true
    const start = isoDate(new Date(todayWeekStart.getTime() - 4 * 7 * ONE_DAY))
    const end   = isoDate(new Date(viewedWeekStart.getTime() + 7 * ONE_DAY))
    source.loadEvents(start, end).then(es => { if (alive) setEvents(es) })
    return () => { alive = false }
  }, [bump, todayWeekStart, viewedWeekStart])

  const week    = useMemo(() => weekDates(viewedWeekStart), [viewedWeekStart])
  const byDate  = useMemo(() => {
    // Prefer done > booked > planned > rest when multiple events share a day,
    // so once you tick a planned/booked event off it shows as done in the chart.
    const rank: Record<string, number> = { done: 4, booked: 3, planned: 2, rest: 1 }
    const m = new Map<string, MovementEvent>()
    for (const e of events) {
      if (!week.includes(e.date)) continue
      const cur = m.get(e.date)
      if (!cur || (rank[e.source] ?? 0) > (rank[cur.source] ?? 0)) {
        m.set(e.date, e)
      }
    }
    return m
  }, [events, week])

  const cadence  = useMemo(() => computeCadence(events, today), [events, today])
  const session  = useMemo(() => todaysSession(events, today), [events, today])

  // Daily completion status (drives the head dot). Done = today has at
  // least one logged session (source 'done') OR a rest day.
  const doneToday = useMemo(() => {
    const t = todayISO()
    return events.some(e => e.date === t && (e.source === 'done' || e.source === 'rest'))
  }, [events])

  function openDay(iso: string) {
    const dayEvents = events.filter(e => e.date === iso)
    // Always land on the day's list view first — even when it's empty —
    // so the "Plan a session" / "Mark rest day" buttons are reachable.
    // Previously empty days jumped straight into a blank form, which
    // hid the rest-day option entirely.
    setSheet({ iso, dayEvents, active: 'list' })
  }

  function openEvent(ev: MovementEvent) {
    const dayEvents = events.filter(e => e.date === ev.date)
    setSheet({ iso: ev.date, dayEvents, active: ev.id })
  }

  function openToday() {
    openDay(todayISO())
  }

  function openNextEmpty() {
    // Look in the viewed week first, then this week, for the next empty slot
    // from today onwards. Falls back to today if everything is full.
    const candidates = [
      ...week.filter(d => d >= todayISO()),
      ...weekDates(todayWeekStart).filter(d => d >= todayISO()),
    ]
    const next = candidates.find(d => !byDate.get(d))
    const iso  = next ?? todayISO()
    const dayEvents = events.filter(e => e.date === iso)
    setSheet({ iso, dayEvents, active: 'new' })
  }

  function stepWeek(deltaWeeks: number) {
    setViewedWeekStart(s => new Date(s.getTime() + deltaWeeks * 7 * ONE_DAY))
  }

  return (
    <section className="movement-tile">
      <div className="movement-head">
        <span className="movement-eyebrow">
          <span className="movement-eyebrow-icon" aria-hidden><MovementIcon size={22} /></span>
          movement
        </span>
        {strain != null && (
          <span className="movement-meta">
            <span className="movement-meta-num">{strain.toFixed(1)}<span className="movement-meta-unit"> strain</span></span>
          </span>
        )}
        <span
          className={`tile-dot tile-dot-${doneToday ? 'done' : 'pending'}`}
          aria-label={doneToday ? 'Done today' : 'Not yet today'}
        />
      </div>

      <button className="movement-today" onClick={openToday}>
        <span className="movement-today-line">{todayLine(session)}</span>
      </button>

      <div className="movement-week-nav">
        <button
          type="button"
          className="movement-nav-btn"
          onClick={() => stepWeek(-1)}
          disabled={!canGoBack}
          aria-label="Previous week"
        >
          ←
        </button>
        <span className="movement-nav-label">
          {relativeWeekLabel(viewedWeekStart, todayWeekStart)}
          <span className="movement-nav-range"> · {weekRangeLabel(viewedWeekStart)}</span>
        </span>
        <button
          type="button"
          className="movement-nav-btn"
          onClick={() => stepWeek(1)}
          disabled={!canGoForward}
          aria-label="Next week"
        >
          →
        </button>
      </div>

      <WeekChart
        weekISO={week}
        byDate={byDate}
        todayISO={todayISO()}
        onTapDay={openDay}
      />

      <div className="movement-legend">
        <span><span className="movement-legend-mark legend-done"   /> done</span>
        <span><span className="movement-legend-mark legend-booked" /> booked</span>
        <span><span className="movement-legend-mark legend-planned"/> planned</span>
        <span><span className="movement-legend-mark legend-rest"   /> rest</span>
      </div>

      <div className="movement-foot">
        <div className="movement-foot-stack">
          <span className="movement-foot-line">{hoursLine(cadence.hoursDone)}</span>
          {activeCalories != null && (
            <span className="movement-foot-sub">{kcalLine(activeCalories)}</span>
          )}
        </div>
        <div className="movement-foot-actions">
          {cadence.plannedThisWeek === 0 && (
            <button className="movement-foot-cta" onClick={openNextEmpty}>
              Plan one →
            </button>
          )}
          <button className="movement-foot-link" onClick={() => setScheduleOpen(true)}>
            View schedule →
          </button>
        </div>
      </div>

      <MovementSheet
        state={sheet}
        onClose={() => setSheet(null)}
        onChange={(next) => setSheet(next)}
        onSaved={() => setBump(b => b + 1)}
      />

      <MovementScheduleModal
        isOpen={scheduleOpen}
        onClose={() => setScheduleOpen(false)}
        events={events}
        onTapEvent={(ev) => openEvent(ev)}
        onTapDay={(iso) => openDay(iso)}
      />
    </section>
  )
}
