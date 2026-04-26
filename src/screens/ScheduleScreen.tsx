import { type CalEvent } from '../hooks/useCalendar'

interface Props {
  events: CalEvent[]
  loading: boolean
  connected: boolean
}

function fmt12(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function EventRow({ event }: { event: CalEvent }) {
  return (
    <div className="schedule-event">
      <div className="schedule-event-time">
        {event.allDay ? (
          <span className="schedule-event-allday">All Day</span>
        ) : (
          <>
            <span className="schedule-event-start">{fmt12(event.start)}</span>
            <span className="schedule-event-dash"> to </span>
            <span className="schedule-event-end">{fmt12(event.end)}</span>
          </>
        )}
      </div>
      <div className="schedule-event-body">
        <div className="schedule-event-title">{event.title}</div>
        {event.location && (
          <div className="schedule-event-location">{event.location}</div>
        )}
      </div>
    </div>
  )
}

export default function ScheduleScreen({ events, loading, connected }: Props) {
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
          Connect your Apple Calendar in Settings to see today's events.
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

  return (
    <div>
      <div className="screen-section-label" style={{ marginBottom: 14 }}>
        TODAY · {events.length} {events.length === 1 ? 'EVENT' : 'EVENTS'}
      </div>
      <div className="schedule-list">
        {events.map(e => <EventRow key={e.id} event={e} />)}
      </div>
    </div>
  )
}
