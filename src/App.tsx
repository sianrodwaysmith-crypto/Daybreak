import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Tile from './components/Tile'
import Modal from './components/Modal'
import ChatWidget from './components/ChatWidget'
import MovementTile from './components/MovementTile'
import { MomentsTile } from './moments'
import { LessonsFlow, LessonsLibrary, useLessons } from './lessons'
import {
  MindsetIcon, ReadinessIcon, ClientResearchIcon, PulseIcon, ScheduleIcon,
  LessonsIcon,
} from './components/icons'
import { useWeather } from './hooks/useWeather'
import { useCalendar } from './hooks/useCalendar'
import { useAIContent } from './hooks/useAIContent'
import { useWhoop } from './hooks/useWhoop'
import ReadinessScreen from './screens/ReadinessScreen'
import ClientResearchScreen from './screens/ClientResearchScreen'
import PulseScreen from './screens/PulseScreen'
import MindsetScreen, { hasMindsetEntryToday } from './screens/MindsetScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import { JournalTile } from './journal'
import { LibraryFooterLink } from './library'
import { looksLikeMovement } from './services/movement'
import { useDayBreakContext } from './contexts/DayBreakContext'
import SettingsScreen from './screens/SettingsScreen'
import PrivacyScreen from './screens/PrivacyScreen'
import TermsScreen from './screens/TermsScreen'

function readinessColor(score: number | null): string {
  if (score == null)   return 'rgba(10,10,10,0.18)'
  if (score >= 67) return '#19a35a'
  if (score >= 34) return '#c98a00'
  return '#c2453a'
}

/* -------------------------------------------------------------------
   Conversational schedule summary for the Schedule tile subtitle.
   Adapts to time of day and what's on the calendar so the user gets a
   short prompt about today rather than a generic count.
------------------------------------------------------------------- */

interface MinimalCalEvent {
  title:  string
  start:  Date
  end:    Date
  allDay: boolean
}

function formatTime12h(d: Date): string {
  const h = d.getHours()
  const m = d.getMinutes()
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, '0')}${suffix}`
}

// Surface the headline event (in-progress > next > first all-day) and
// pair it with a soft nudge so the tile is conversational without
// hiding what actually matters today. Full timings live in the modal.
function summariseSchedule(
  events:    readonly MinimalCalEvent[],
  loading:   boolean,
  connected: boolean,
  now:       Date,
): string | undefined {
  if (loading)    return 'Loading your day…'
  if (!connected) return 'Tap to connect Google.'
  if (events.length === 0) return 'Open day. What would make today feel good?'

  const timed  = events.filter(e => !e.allDay)
  const allDay = events.filter(e =>  e.allDay)

  const inProgress = timed.find(e => e.start <= now && e.end > now)
  const upcoming   = timed.filter(e => e.start > now).sort((a, b) => a.start.getTime() - b.start.getTime())
  const past       = timed.filter(e => e.end <= now)

  if (inProgress) {
    const remaining = upcoming.length
    const tail = remaining === 0 ? 'Last one of the day.'
               : remaining === 1 ? 'One more after.'
               : `${remaining} more after.`
    return `In ${inProgress.title} until ${formatTime12h(inProgress.end)}. ${tail}`
  }

  if (upcoming.length > 0) {
    const next = upcoming[0]
    const time = formatTime12h(next.start)
    if (upcoming.length === 1 && past.length === 0 && allDay.length === 0) {
      return `Just ${next.title} at ${time} today. Room for a walk first?`
    }
    if (upcoming.length === 1) return `Next: ${next.title} at ${time}. Last one today.`
    return `Next: ${next.title} at ${time}. ${upcoming.length - 1} more after.`
  }

  if (past.length > 0) return 'All wrapped up for today. Take the evening back.'

  if (allDay.length > 0) {
    return allDay.length === 1
      ? `${allDay[0].title} today.`
      : `${allDay[0].title} (and ${allDay.length - 1} more).`
  }

  return undefined
}

function useWhoopFlash(): { msg: string | null; clear: () => void } {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const w = params.get('whoop')
    if (!w) return
    if (w === 'connected')      setMsg('✅ Whoop connected.')
    else if (w === 'cancelled') setMsg('Whoop connection cancelled.')
    else if (w === 'error') {
      const reason = params.get('reason')
      setMsg(`Whoop connection failed${reason ? `: ${decodeURIComponent(reason)}` : '.'}`)
    }
    // Clean the URL so it doesn't keep showing on refresh
    const url = new URL(window.location.href)
    url.searchParams.delete('whoop')
    url.searchParams.delete('reason')
    window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''))
  }, [])
  return { msg, clear: () => setMsg(null) }
}

function HomeView() {
  const [activeId,        setActiveId]     = useState<string | null>(null)
  const [showSettings,    setSettings]     = useState(false)
  const weather  = useWeather()
  const calendar = useCalendar()
  const whoop    = useWhoop()
  const whoopFlash = useWhoopFlash()
  const lessonsState = useLessons('sian')

  // Subscribe to context version so the home grid re-renders when a tile
  // submits (e.g. mindset entry saved) and the status dot can flip.
  const { version: ctxVersion } = useDayBreakContext()
  const mindsetDoneToday = hasMindsetEntryToday()
  // ctxVersion intentionally referenced so this re-runs after submission.
  void ctxVersion
  const lessonKind = lessonsState.state.kind
  const lessonsDoneToday = lessonKind === 'done' || lessonKind === 'completed'

  const readinessScore = whoop.recovery
  const { ai, retry, refreshPulse } = useAIContent()

  const pulseLoading =
    ai['pulse-anthropic'].loading || ai['pulse-aiworld'].loading || ai['pulse-tech'].loading

  // Anything that reads as exercise lives in the Movement tile, not the
  // schedule. Filter those events out so they don't show in both places.
  const scheduleEvents   = calendar.events.filter(e => !looksLikeMovement(e.title))
  const tomorrowEvents   = calendar.tomorrow.filter(e => !looksLikeMovement(e.title))

  const scheduleSubtitle = summariseSchedule(
    scheduleEvents, calendar.loading, calendar.connected, new Date(),
  )

  // status: 'done' | 'pending' is set ONLY on tiles representing a daily
  // action (mindset, lessons). Movement and Moments are custom tiles
  // that render their own status dot. Journal is its own sealed module
  // (rendered inline below) and intentionally exposes NO status to
  // anything outside its unlocked surface — the brief is explicit. The
  // passive-data tiles (schedule, readiness, pulse, client) get no dot.
  interface TileCfg {
    id:         string
    icon:       React.ReactNode
    title:      string
    accent:     string
    subtitle?:  string
    status?:    'done' | 'pending'
    fullWidth?: boolean
    loading?:   boolean
  }
  const TOP_TILES_BEFORE_JOURNAL: TileCfg[] = [
    { id: 'schedule',icon: <ScheduleIcon />,       title: 'Schedule',        accent: '#38bdf8', fullWidth: true, loading: calendar.loading, subtitle: scheduleSubtitle },
    { id: 'mindset', icon: <MindsetIcon />,        title: 'Daily mindset',   accent: '#f59e0b', status: mindsetDoneToday ? 'done' : 'pending' },
    { id: 'ready',   icon: <ReadinessIcon />,      title: 'Readiness',       accent: readinessColor(readinessScore), loading: whoop.loading },
  ]
  const TOP_TILES_AFTER_JOURNAL: TileCfg[] = [
    { id: 'pulse',   icon: <PulseIcon />,          title: 'Pulse',           accent: '#ffc800', loading: pulseLoading },
    { id: 'lessons', icon: <LessonsIcon />,        title: 'Lessons',         accent: '#a78bfa', status: lessonsDoneToday ? 'done' : 'pending' },
    { id: 'client',  icon: <ClientResearchIcon />, title: 'Client research', accent: '#64b5f6' },
  ]
  const TOP_TILES: TileCfg[] = [...TOP_TILES_BEFORE_JOURNAL, ...TOP_TILES_AFTER_JOURNAL]

  const activeTile = TOP_TILES.find(t => t.id === activeId)

  function getContent(id: string | null) {
    switch (id) {
      case 'ready':    return <ReadinessScreen
        score={readinessScore}
        hrv={whoop.hrv}
        rhr={whoop.rhr}
        sleep={whoop.sleep}
        sleepEfficiency={whoop.sleepEfficiency}
        sleepConsistency={whoop.sleepConsistency}
        sleepHours={whoop.sleepHours}
        remHours={whoop.remHours}
        deepHours={whoop.deepHours}
        strain={whoop.strain}
        avgHr={whoop.avgHr}
        maxHr={whoop.maxHr}
        connected={whoop.connected}
      />
      case 'client':   return <ClientResearchScreen />
      case 'pulse':    return <PulseScreen
        anthropic={ai['pulse-anthropic']}
        aiWorld={ai['pulse-aiworld']}
        techMkt={ai['pulse-tech']}
        onRetrySection={(id) => retry(id)}
        onRefreshAll={refreshPulse}
      />
      case 'mindset':  return <MindsetScreen />
      case 'schedule': return <ScheduleScreen events={scheduleEvents} tomorrow={tomorrowEvents} loading={calendar.loading} connected={calendar.connected} />
      case 'lessons':
        // Daily flow when today's lesson is ready; library otherwise
        // (sealed-for-today / no course / course completed).
        return lessonsState.state.kind === 'ready'
          ? <LessonsFlow onClose={() => setActiveId(null)} />
          : <LessonsLibrary />
      default:         return null
    }
  }

  return (
    <div className="app">
      <div className="app-content">
        <Header onSettings={() => setSettings(true)} weather={weather} />
        {whoopFlash.msg && (
          <div className={`flash${whoopFlash.msg.startsWith('✅') ? ' flash-ok' : ' flash-err'}`}>
            <span>{whoopFlash.msg}</span>
            <button onClick={whoopFlash.clear} aria-label="Dismiss" className="flash-close">×</button>
          </div>
        )}
        <div className="tile-grid">
          {TOP_TILES_BEFORE_JOURNAL.map(t => (
            <Tile
              key={t.id}
              icon={t.icon}
              title={t.title}
              subtitle={'subtitle' in t ? t.subtitle : undefined}
              accent={t.accent}
              status={'status' in t ? t.status : undefined}
              fullWidth={'fullWidth' in t && t.fullWidth}
              loading={'loading' in t ? t.loading : false}
              onClick={() => setActiveId(t.id)}
            />
          ))}
          <JournalTile />
          {TOP_TILES_AFTER_JOURNAL.map(t => (
            <Tile
              key={t.id}
              icon={t.icon}
              title={t.title}
              subtitle={'subtitle' in t ? t.subtitle : undefined}
              accent={t.accent}
              status={'status' in t ? t.status : undefined}
              fullWidth={'fullWidth' in t && t.fullWidth}
              loading={'loading' in t ? t.loading : false}
              onClick={() => setActiveId(t.id)}
            />
          ))}
        </div>

        <MovementTile recovery={readinessScore} />

        <MomentsTile onConnect={() => setSettings(true)} />

        <LibraryFooterLink />

        <footer className="home-footer">
          <Link to="/privacy" className="home-footer-link">Privacy Policy</Link>
          <span className="home-footer-sep">·</span>
          <Link to="/terms" className="home-footer-link">Terms</Link>
          <span className="home-footer-sep">·</span>
          <span className="home-footer-build" title="Build stamp">{__BUILD_STAMP__}</span>
        </footer>
      </div>

      {/* Tile modal */}
      <Modal
        isOpen={activeId !== null}
        onClose={() => setActiveId(null)}
        title={activeTile?.title ?? ''}
        accent={activeTile?.accent ?? '#ffffff'}
      >
        {getContent(activeId)}
      </Modal>

      {/* Settings modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setSettings(false)}
        title="Settings"
        accent="rgba(255,255,255,0.7)"
      >
        <SettingsScreen calendar={calendar} whoop={whoop} />
      </Modal>

      <ChatWidget />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/privacy" element={<PrivacyScreen />} />
      <Route path="/terms" element={<TermsScreen />} />
    </Routes>
  )
}
