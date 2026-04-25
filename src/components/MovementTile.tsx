import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal'
import {
  MockMovementSource, CompositeMovementSource,
  computeCadence, todaysSession, weekDates, startOfWeek, todayISO, isoDate,
  type MovementEvent, type MovementSource,
} from '../services/movement'

/* ====================================================================
   Single composite source instance for the whole app.
==================================================================== */
const source: MovementSource = new CompositeMovementSource([
  new MockMovementSource(),
  // TODO: add AppleCalendarSource, WhoopSource, DavidLloydSource here
  // when their real implementations land. Read-only sources will show up
  // in the chart but won't be edited by the tile.
])

/* ====================================================================
   Helpers
==================================================================== */

const DAY_LABELS = ['m', 't', 'w', 't', 'f', 's', 's']

function recoveryLabel(score: number | null): string {
  if (score == null)   return ''
  if (score >= 70) return `${score}% recovered`
  return `${score}% — take it easy`
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
    const where = today.location ? `Booked at ${today.location}.` : 'Booked.'
    const tone  = recovery == null
      ? ''
      : recovery >= 67
        ? ' Whoop says you can push it.'
        : ' Recovery low — listen to it.'
    const verb = today.source === 'planned' ? 'Planned' : 'Booked'
    return `${where.replace('Booked', verb)}${tone}`.trim()
  }
  return ''
}

function cadenceFooter(usual: number, thisWeek: number, onTrack: boolean): string {
  if (onTrack) return 'On track this week.'
  return `${thisWeek} of your usual ${usual} this week.`
}

/* ====================================================================
   Week chart — 7 day columns over a horizon line
==================================================================== */

interface ChartProps {
  weekISO:    string[]                 // 7 ISO dates Monday-first
  byDate:     Map<string, MovementEvent>
  todayISO:   string
  onTapDay:   (iso: string) => void
}

function WeekChart({ weekISO, byDate, todayISO: today, onTapDay }: ChartProps) {
  const W = 320
  const H = 64
  const padX = 14
  const colWidth = (W - padX * 2) / 7
  const horizonY = 38

  return (
    <svg
      className="movement-chart"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Movement this week"
    >
      {/* Horizon */}
      <line
        x1={padX} y1={horizonY} x2={W - padX} y2={horizonY}
        stroke="var(--line-strong)"
        strokeWidth="0.75"
      />

      {weekISO.map((iso, i) => {
        const cx = padX + colWidth * i + colWidth / 2
        const ev = byDate.get(iso)
        const isToday = iso === today

        return (
          <g
            key={iso}
            className="movement-day"
            onPointerUp={(e) => { e.stopPropagation(); onTapDay(iso) }}
            style={{ cursor: 'pointer' }}
          >
            {/* Tap target */}
            <rect x={cx - colWidth / 2} y={0} width={colWidth} height={H} fill="transparent" />

            {/* Today indicator (dotted vertical) */}
            {isToday && (
              <line
                x1={cx} y1={6} x2={cx} y2={H - 12}
                stroke="var(--line-strong)"
                strokeWidth="0.75"
                strokeDasharray="2 3"
              />
            )}

            {/* Mark */}
            {ev?.source === 'done' && (
              <circle cx={cx} cy={horizonY - 12} r="4" fill="var(--ink)" />
            )}
            {ev?.source === 'booked' && (
              <>
                <circle cx={cx} cy={horizonY - 12} r="4" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
                <circle cx={cx} cy={horizonY - 12} r="1.4" fill="var(--ink)" />
              </>
            )}
            {ev?.source === 'planned' && (
              <circle cx={cx} cy={horizonY - 12} r="3.2" fill="none" stroke="var(--muted)" strokeWidth="1" />
            )}
            {ev?.source === 'rest' && (
              <line x1={cx - 4} y1={horizonY} x2={cx + 4} y2={horizonY} stroke="var(--ink)" strokeWidth="1.2" strokeLinecap="round" />
            )}

            {/* Day label */}
            <text
              x={cx}
              y={H - 4}
              textAnchor="middle"
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
              fill={isToday ? 'var(--ink)' : 'var(--faint)'}
              fontWeight={isToday ? 500 : 400}
            >
              {DAY_LABELS[i]}
            </text>
          </g>
        )
      })}
    </svg>
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
  const [time,     setTime]     = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high' | ''>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!state) return
    if (state.ev) {
      setTitle(state.ev.title ?? '')
      setTime(state.ev.startTime ?? '')
      setDuration(state.ev.durationMinutes ? String(state.ev.durationMinutes) : '')
      setIntensity(state.ev.intensity ?? '')
    } else {
      setTitle(''); setTime(''); setDuration(''); setIntensity('')
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
        startTime:        time.trim() || undefined,
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

            <div className="movement-field-row">
              <label className="movement-field">
                <span className="movement-field-label">Time</span>
                <input
                  className="movement-input"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  placeholder="17:30"
                  inputMode="numeric"
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
            </div>

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
              <button
                className="movement-btn-primary"
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

export default function MovementTile({ recovery }: Props) {
  const [events, setEvents]   = useState<MovementEvent[]>([])
  const [sheet,  setSheet]    = useState<SheetState | null>(null)
  const [bump,   setBump]     = useState(0)

  // Pull events spanning 4 prior weeks + this week so cadence is meaningful.
  useEffect(() => {
    let alive = true
    const now   = new Date()
    const start = isoDate(new Date(startOfWeek(now).getTime() - 4 * 7 * 24 * 60 * 60 * 1000))
    const end   = isoDate(new Date(startOfWeek(now).getTime() + 7 * 24 * 60 * 60 * 1000))
    source.loadEvents(start, end).then(es => { if (alive) setEvents(es) })
    return () => { alive = false }
  }, [bump])

  const today = useMemo(() => new Date(), [])

  const week    = useMemo(() => weekDates(startOfWeek(today)), [today])
  const byDate  = useMemo(() => {
    const m = new Map<string, MovementEvent>()
    for (const e of events) if (week.includes(e.date)) m.set(e.date, e)
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
    const next = week.find(d => !byDate.get(d) && d >= todayISO())
    setSheet({ iso: next ?? todayISO(), ev: null })
  }

  return (
    <section className="movement-tile">
      <div className="movement-head">
        <span className="movement-eyebrow">movement</span>
        {recovery != null && <span className="movement-recovery">{recoveryLabel(recovery)}</span>}
      </div>

      <button className="movement-today" onClick={openToday}>
        <span className="movement-today-line">{todayLine(session)}</span>
        <span className="movement-today-sub">{todaySubLine(session, recovery)}</span>
      </button>

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
        <span className="movement-foot-line">{cadenceFooter(cadence.usual, cadence.thisWeek, cadence.onTrack)}</span>
        {!cadence.onTrack && (
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
