import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Tile from './components/Tile'
import Modal from './components/Modal'
import WeatherBanner from './components/WeatherBanner'
import ChatWidget from './components/ChatWidget'
import { useWeather } from './hooks/useWeather'
import { useCalendar } from './hooks/useCalendar'
import { useAIContent } from './hooks/useAIContent'
import { useWhoop } from './hooks/useWhoop'
import ReadinessScreen from './screens/ReadinessScreen'
import ClientResearchScreen from './screens/ClientResearchScreen'
import PulseScreen from './screens/PulseScreen'
import MindsetScreen from './screens/MindsetScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import SettingsScreen from './screens/SettingsScreen'
import PrivacyScreen from './screens/PrivacyScreen'
import TermsScreen from './screens/TermsScreen'

function readinessColor(score: number | null): string {
  if (score == null)   return 'rgba(10,10,10,0.18)'
  if (score >= 67) return '#19a35a'
  if (score >= 34) return '#c98a00'
  return '#c2453a'
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
  const [activeId, setActiveId]     = useState<string | null>(null)
  const [showSettings, setSettings] = useState(false)
  const weather  = useWeather()
  const calendar = useCalendar()
  const whoop    = useWhoop()
  const whoopFlash = useWhoopFlash()

  const readinessScore = whoop.recovery
  const { ai, retry, refreshPulse } = useAIContent()

  const pulseLoading =
    ai['pulse-anthropic'].loading || ai['pulse-aiworld'].loading || ai['pulse-tech'].loading

  const TILES = [
    { id: 'mindset', icon: '🙏', title: 'Daily Mindset',   accent: '#f59e0b' },
    { id: 'ready',   icon: '💚', title: 'Readiness',       accent: readinessColor(readinessScore), loading: whoop.loading },
    { id: 'client',  icon: '💼', title: 'Client Research', accent: '#64b5f6', loading: ai.client.loading },
    { id: 'pulse',   icon: '🌍', title: 'Pulse',           accent: '#ffc800', loading: pulseLoading },
    { id: 'schedule',icon: '📅', title: 'Schedule',        accent: '#38bdf8', fullWidth: true, loading: calendar.loading },
  ]

  const activeTile = TILES.find(t => t.id === activeId)

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
      case 'client':   return <ClientResearchScreen aiState={ai.client} onRetry={() => retry('client')} />
      case 'pulse':    return <PulseScreen
        anthropic={ai['pulse-anthropic']}
        aiWorld={ai['pulse-aiworld']}
        techMkt={ai['pulse-tech']}
        onRetrySection={(id) => retry(id)}
        onRefreshAll={refreshPulse}
      />
      case 'mindset':  return <MindsetScreen />
      case 'schedule': return <ScheduleScreen events={calendar.events} loading={calendar.loading} connected={calendar.connected} />
      default:         return null
    }
  }

  return (
    <div className="app">
      <div className="app-content">
        <Header
          readinessScore={readinessScore}
          readinessColor={readinessColor(readinessScore)}
          onSettings={() => setSettings(true)}
        />
        {whoopFlash.msg && (
          <div className={`flash${whoopFlash.msg.startsWith('✅') ? ' flash-ok' : ' flash-err'}`}>
            <span>{whoopFlash.msg}</span>
            <button onClick={whoopFlash.clear} aria-label="Dismiss" className="flash-close">×</button>
          </div>
        )}
        {weather && <WeatherBanner weather={weather} />}
        <div className="tile-grid">
          {TILES.map(t => (
            <Tile
              key={t.id}
              icon={t.icon}
              title={t.title}
              accent={t.accent}
              fullWidth={'fullWidth' in t && t.fullWidth}
              loading={'loading' in t ? t.loading : false}
              onClick={() => setActiveId(t.id)}
            />
          ))}
        </div>
        <footer className="home-footer">
          <Link to="/privacy" className="home-footer-link">Privacy Policy</Link>
          <span className="home-footer-sep">·</span>
          <Link to="/terms" className="home-footer-link">Terms</Link>
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
