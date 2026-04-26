import { useEffect, useMemo, useRef, useState } from 'react'
import { type CalEvent } from '../hooks/useCalendar'

interface Props {
  events: CalEvent[]
  loading: boolean
  connected: boolean
}

function fmt12(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtHourLabel(hour: number): string {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const h = hour % 12 || 12
  return `${h} ${suffix}`
}

/* ====================================================================
   Daily calendar grid.
   Hour rule on the left; events laid out absolutely by start/duration;
   live "now" line; overlapping events split into columns so nothing
   gets hidden behind anything else.
==================================================================== */

const PX_PER_MIN = 0.9                   // 54px per hour
const DEFAULT_RANGE: [number, number] = [7, 21]   // 7am – 9pm if no events

interface Positioned {
  event:    CalEvent
  column:   number
  columns:  number   // total columns in this overlap cluster
}

function packColumns(events: CalEvent[]): Positioned[] {
  const sorted = [...events].sort((a, b) =>
    a.start.getTime() - b.start.getTime() || a.end.getTime() - b.end.getTime(),
  )
  const out: Positioned[] = []
  let cluster: CalEvent[] = []
  let clusterEnd = 0
  let clusterStartIdx = 0

  function flush() {
    if (cluster.length === 0) return
    const cols: CalEvent[][] = []
    for (const ev of cluster) {
      let placed = false
      for (let i = 0; i < cols.length; i++) {
        const last = cols[i][cols[i].length - 1]
        if (last.end.getTime() <= ev.start.getTime()) {
          cols[i].push(ev); out.push({ event: ev, column: i, columns: 0 })
          placed = true; break
        }
      }
      if (!placed) {
        cols.push([ev]); out.push({ event: ev, column: cols.length - 1, columns: 0 })
      }
    }
    const total = cols.length
    for (let i = clusterStartIdx; i < out.length; i++) out[i].columns = total
    cluster = []
  }

  for (const ev of sorted) {
    if (cluster.length === 0 || ev.start.getTime() < clusterEnd) {
      if (cluster.length === 0) clusterStartIdx = out.length
      cluster.push(ev)
      clusterEnd = Math.max(clusterEnd, ev.end.getTime())
    } else {
      flush()
      clusterStartIdx = out.length
      cluster.push(ev)
      clusterEnd = ev.end.getTime()
    }
  }
  flush()
  return out
}

function startOfToday(): Date {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d
}

function minutesFromMidnight(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

interface GridProps {
  timed: CalEvent[]
  now:   Date
}

function CalendarGrid({ timed, now }: GridProps) {
  const [startHour, endHour] = useMemo<[number, number]>(() => {
    if (timed.length === 0) return DEFAULT_RANGE
    const earliest = Math.min(...timed.map(e => e.start.getHours()))
    const latest   = Math.max(...timed.map(e => Math.ceil(minutesFromMidnight(e.end) / 60)))
    return [
      Math.min(DEFAULT_RANGE[0], earliest),
      Math.max(DEFAULT_RANGE[1], latest),
    ]
  }, [timed])

  const totalMinutes = (endHour - startHour) * 60
  const totalHeight  = totalMinutes * PX_PER_MIN
  const startMin     = startHour * 60

  const positioned = useMemo(() => packColumns(timed), [timed])

  // Auto-scroll to the now marker on first render so the user lands on
  // the current part of the day without manual scrolling.
  const scrollerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!scrollerRef.current) return
    const nowMins = minutesFromMidnight(now) - startMin
    if (nowMins < 0 || nowMins > totalMinutes) return
    const targetTop = Math.max(0, nowMins * PX_PER_MIN - 120)
    scrollerRef.current.scrollTop = targetTop
  }, [])

  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
  const nowMinsIntoRange = minutesFromMidnight(now) - startMin
  const showNow = nowMinsIntoRange >= 0 && nowMinsIntoRange <= totalMinutes

  return (
    <div className="schedule-grid-scroll" ref={scrollerRef}>
      <div className="schedule-grid" style={{ height: totalHeight }}>
        {/* Hour labels + horizontal rule lines */}
        {hours.map(h => {
          const top = (h - startHour) * 60 * PX_PER_MIN
          return (
            <div key={`h-${h}`}>
              <div className="schedule-grid-hour" style={{ top }}>{fmtHourLabel(h)}</div>
              <div className="schedule-grid-tick" style={{ top }} />
            </div>
          )
        })}

        {/* Half-hour soft ticks */}
        {hours.slice(0, -1).map(h => {
          const top = (h - startHour) * 60 * PX_PER_MIN + 30 * PX_PER_MIN
          return <div key={`hh-${h}`} className="schedule-grid-tick is-half" style={{ top }} />
        })}

        {/* Event blocks */}
        {positioned.map(p => {
          const startMins  = minutesFromMidnight(p.event.start) - startMin
          const durMins    = Math.max(15, (p.event.end.getTime() - p.event.start.getTime()) / 60000)
          const top        = startMins * PX_PER_MIN
          const height     = durMins * PX_PER_MIN
          const widthPct   = 100 / p.columns
          const leftPct    = p.column * widthPct
          const isPast     = p.event.end.getTime() <= now.getTime()
          const isLive     = p.event.start.getTime() <= now.getTime() && p.event.end.getTime() > now.getTime()
          const cls = `schedule-grid-event${isPast ? ' is-past' : ''}${isLive ? ' is-live' : ''}`
          return (
            <div
              key={p.event.id}
              className={cls}
              style={{
                top,
                height,
                left:  `calc(${leftPct}% + 2px)`,
                width: `calc(${widthPct}% - 4px)`,
              }}
            >
              <div className="schedule-grid-event-time">
                {fmt12(p.event.start)} – {fmt12(p.event.end)}
              </div>
              <div className="schedule-grid-event-title">{p.event.title}</div>
              {p.event.location && height > 56 && (
                <div className="schedule-grid-event-loc">{p.event.location}</div>
              )}
            </div>
          )
        })}

        {/* Now line */}
        {showNow && (
          <div className="schedule-grid-now" style={{ top: nowMinsIntoRange * PX_PER_MIN }}>
            <span className="schedule-grid-now-label">{fmt12(now)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ScheduleScreen({ events, loading, connected }: Props) {
  // Tick the clock every minute so the now-line and live highlights stay
  // accurate while the modal is open.
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="schedule-empty">
        <div className="schedule-empty-text">Fetching your calendar…</div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="schedule-empty">
        <div className="schedule-empty-text">
          Connect Google in Settings to see today's events.
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="schedule-empty">
        <div className="schedule-empty-text">Your calendar is clear today.</div>
      </div>
    )
  }

  const allDay = events.filter(e => e.allDay)
  const timed  = events
    .filter(e => !e.allDay)
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  // Lightweight top-line summary: count + next or current event.
  const nextOrLive = timed.find(e => e.end.getTime() > now.getTime())
  const summary =
    nextOrLive
      ? (nextOrLive.start.getTime() <= now.getTime()
          ? `In ${nextOrLive.title} until ${fmt12(nextOrLive.end)}`
          : `Next: ${nextOrLive.title} at ${fmt12(nextOrLive.start)}`)
      : timed.length > 0
        ? 'All wrapped up for today.'
        : ''

  // Free time after the last event (rough; ignores travel etc.)
  const endOfDay = new Date(startOfToday().getTime() + 22 * 60 * 60_000)
  const lastEnd  = timed.length > 0 ? timed[timed.length - 1].end : null
  const freeAfterMins = lastEnd ? Math.max(0, (endOfDay.getTime() - Math.max(lastEnd.getTime(), now.getTime())) / 60000) : 0
  const freeBlurb = freeAfterMins >= 60
    ? `${Math.round(freeAfterMins / 60)}h free this evening`
    : null

  return (
    <div>
      <div className="screen-section-label" style={{ marginBottom: 6 }}>
        TODAY · {events.length} {events.length === 1 ? 'EVENT' : 'EVENTS'}
      </div>
      {summary && (
        <div className="schedule-summary">{summary}</div>
      )}

      {allDay.length > 0 && (
        <div className="schedule-allday">
          <div className="schedule-allday-label">ALL DAY</div>
          {allDay.map(e => (
            <div key={e.id} className="schedule-allday-item">{e.title}</div>
          ))}
        </div>
      )}

      {timed.length > 0 && <CalendarGrid timed={timed} now={now} />}

      {freeBlurb && (
        <div className="schedule-foot">{freeBlurb}.</div>
      )}
    </div>
  )
}
