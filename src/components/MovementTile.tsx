import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import { MovementIcon } from './icons'
import {
  MockMovementSource, CompositeMovementSource, GoogleCalendarMovementSource,
  computeCadence, todaysSession, weekDates, startOfWeek, todayISO, isoDate,
  type MovementEvent, type MovementSource,
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

function recoveryLabel(score: number | null): string {
  if (score == null)   return ''
  if (score >= 70) return `${score}% recovered`
  return `${score}%, take it easy`
}

function todayLine(today: MovementEvent | null): string {
  if (!today) return 'Nothing planned today.'
  if (today.source === 'rest') return 'Rest day.'
  const time = today.startTime ? ` · ${today.startTime} today` : ' today'
  return `${today.title}${time}`
}

function todaySubLine(today: MovementEvent | null, recovery: number | null): string {
  if (!today) return 'Tap a day to plan one.'
  if (today.source === 'rest') return 'Honour it.'
  if (today.source === 'done') return 'Logged on Whoop.'
  if (today.source === 'booked' || today.source === 'planned') {
    const verb = today.source === 'planned' ? 'Planned' : 'Booked'
    const where = today.location ? `${verb} at ${today.location}.` : `${verb}.`
    const tone  = recovery == null
      ? ''
      : recovery >= 67
        ? ' Whoop says you can push it.'
        : ' Recovery is low. Listen to it.'
    return `${where}${tone}`.trim()
  }
  return ''
}

function plannedLine(plannedThisWeek: number, doneThisWeek: number): string {
  if (plannedThisWeek === 0) return 'Nothing on the calendar this week.'
  const noun = plannedThisWeek === 1 ? 'session' : 'sessions'
  if (doneThisWeek === 0) return `${plannedThisWeek} ${noun} planned this week.`
  return `${plannedThisWeek} ${noun} planned, ${doneThisWeek} done.`
}

function hoursLine(hours: number): string {
  if (hours <= 0) return 'No hours logged yet.'
  if (hours === 1) return '1 hr exercised this week.'
  // Show "1.5 hrs" but drop a trailing .0 so whole numbers read cleanly.
  const display = Number.isInteger(hours) ? hours.toFixed(0) : hours.toFixed(1)
  return `${display} hrs exercised this week.`
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
  weekISO:    string[]                 // 7 ISO dates Monday-first
  byDate:     Map<string, MovementEvent>
  todayISO:   string
  onTapDay:   (iso: string) => void
}

function intensityClass(ev: MovementEvent | undefined): string {
  if (!ev || ev.source === 'rest') return ''
  switch (ev.intensity) {
    case 'low':      return ' intensity-low'
    case 'high':     return ' intensity-high'
    case 'moderate': return ' intensity-moderate'
    default:         return ' intensity-moderate'
  }
}

function WeekChart({ weekISO, byDate, todayISO: today, onTapDay }: ChartProps) {
  return (
    <div className="movement-week" role="group" aria-label="Movement this week">
      <div className="movement-horizon" aria-hidden />
      {weekISO.map((iso, i) => {
        const ev = byDate.get(iso)
        const isToday = iso === today
        const ic = intensityClass(ev)
        return (
          <button
            key={iso}
            type="button"
            className={`movement-day${isToday ? ' is-today' : ''}`}
            onClick={() => onTapDay(iso)}
            aria-label={`${DAY_LABELS[i]} ${iso}`}
          >
            {ev?.source === 'done'    && <span className={`movement-mark mark-done${ic}`}    />}
            {ev?.source === 'booked'  && <span className={`movement-mark mark-booked${ic}`}  />}
            {ev?.source === 'planned' && <span className={`movement-mark mark-planned${ic}`} />}
            {ev?.source === 'rest'    && <span className="movement-mark mark-rest"           />}
            <span className="movement-day-label">{DAY_LABELS[i]}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ====================================================================
   Sheet — quick-add / edit / read-only detail
==================================================================== */

interface SheetState {
  iso:  string
  ev:   MovementEvent | null
}

interface SheetProps {
  state:    SheetState | null
  onClose:  () => void
  onSaved:  () => void
}

function MovementSheet({ state, onClose, onSaved }: SheetProps) {
  const [title,    setTitle]    = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!state) return
    if (state.ev) {
      setTitle(state.ev.title ?? '')
      setDuration(state.ev.durationMinutes ? String(state.ev.durationMinutes) : '')
      setIntensity(state.ev.intensity ?? '')
    } else {
      setTitle(''); setDuration(''); setIntensity('')
    }
  }, [state])

  if (!state) return null

  const ev   = state.ev
  const iso  = state.iso
  const dateLabel = new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })

  const editable = !ev || ev.source === 'planned' || ev.source === 'rest'
  const readonly = ev && (ev.source === 'booked' || ev.source === 'done')

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    try {
      const payload = {
        date:             iso,
        source:           'planned' as const,
        title:            title.trim(),
        durationMinutes:  duration.trim() ? Number(duration) : undefined,
        intensity:        intensity || undefined,
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

  async function handleMarkRest() {
    setSaving(true)
    try {
      await source.createEvent({ date: iso, source: 'rest', title: 'Rest day' })
      onSaved(); onClose()
    } finally { setSaving(false) }
  }

  async function handleMarkDone() {
    if (!ev) return
    setSaving(true)
    try {
      const payload: Omit<MovementEvent, 'id'> = {
        date:             ev.date,
        source:           'done',
        title:            ev.title,
        startTime:        ev.startTime,
        durationMinutes:  ev.durationMinutes,
        location:         ev.location,
        intensity:        ev.intensity,
      }
      if (ev.source === 'planned') {
        // Writable mock event — flip in place.
        await source.updateEvent(ev.id, payload)
      } else {
        // Booked or external — create a local done sibling so we don't try to
        // mutate a read-only source. The done takes precedence in the chart.
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
        <div className="movement-sheet-date">{dateLabel}</div>

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
            {ev.intensity && (
              <div className="movement-sheet-readmeta">Intensity: {ev.intensity}</div>
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
          </>
        )}

        {ev?.source === 'rest' && (
          <>
            <div className="movement-sheet-readtitle">Rest day declared.</div>
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

            <div className="movement-field">
              <span className="movement-field-label">Intensity</span>
              <div className="movement-intensity">
                {(['low', 'moderate', 'high'] as const).map(opt => (
                  <button
                    key={opt}
                    className={`movement-intensity-pill${intensity === opt ? ' is-on' : ''}`}
                    onClick={() => setIntensity(intensity === opt ? '' : opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

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
              {!ev && (
                <button className="movement-btn-quiet" onClick={handleMarkRest} disabled={saving}>
                  Mark rest day
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
   Tile
==================================================================== */

interface Props {
  recovery: number | null
}

const MAX_WEEKS_AHEAD = 8
const MAX_WEEKS_BACK  = 8

export default function MovementTile({ recovery }: Props) {
  const [events, setEvents]   = useState<MovementEvent[]>([])
  const [sheet,  setSheet]    = useState<SheetState | null>(null)
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

  function openDay(iso: string) {
    setSheet({ iso, ev: byDate.get(iso) ?? null })
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
    setSheet({ iso: next ?? todayISO(), ev: null })
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
        {recovery != null && <span className="movement-recovery">{recoveryLabel(recovery)}</span>}
      </div>

      <button className="movement-today" onClick={openToday}>
        <span className="movement-today-line">{todayLine(session)}</span>
        <span className="movement-today-sub">{todaySubLine(session, recovery)}</span>
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
          <span className="movement-foot-line">{plannedLine(cadence.plannedThisWeek, cadence.thisWeek)}</span>
          <span className="movement-foot-sub">{hoursLine(cadence.hoursDone)}</span>
        </div>
        {cadence.plannedThisWeek === 0 && (
          <button className="movement-foot-cta" onClick={openNextEmpty}>
            Plan one →
          </button>
        )}
      </div>

      <MovementSheet
        state={sheet}
        onClose={() => setSheet(null)}
        onSaved={() => setBump(b => b + 1)}
      />
    </section>
  )
}
