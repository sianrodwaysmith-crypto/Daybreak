import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Tile from './components/Tile'
import Modal from './components/Modal'
import WeatherBanner from './components/WeatherBanner'
import { useWeather } from './hooks/useWeather'
import { useCalendar } from './hooks/useCalendar'
import { useAIContent } from './hooks/useAIContent'
import ReadinessScreen from './screens/ReadinessScreen'
import DeepWorkScreen from './screens/DeepWorkScreen'
import ClientBriefScreen from './screens/ClientBriefScreen'
import BusinessPulseScreen from './screens/BusinessPulseScreen'
import AIBriefingScreen from './screens/AIBriefingScreen'
import TodaysFocusScreen from './screens/TodaysFocusScreen'
import MindsetScreen from './screens/MindsetScreen'
import ScheduleScreen from './screens/ScheduleScreen'
import SettingsScreen from './screens/SettingsScreen'
import PrivacyScreen from './screens/PrivacyScreen'
import TermsScreen from './screens/TermsScreen'

const READINESS_SCORE = 74

function readinessColor(score: number): string {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#ffc800'
  return '#f87171'
}

function scheduleSubtitle(events: readonly { id: string }[], loading: boolean, connected: boolean): string {
  if (!connected) return 'Tap to connect calendar'
  if (loading)    return 'Loading…'
  if (events.length === 0) return 'No events'
  return `${events.length} event${events.length === 1 ? '' : 's'} today`
}

function HomeView() {
  const [activeId, setActiveId]     = useState<string | null>(null)
  const [showSettings, setSettings] = useState(false)
  const weather  = useWeather()
  const calendar = useCalendar()
  const { ai, retry } = useAIContent(READINESS_SCORE)

  const TILES = [
    { id: 'mindset', icon: '🙏', title: 'Daily Mindset',  subtitle: 'Ground yourself',                                     accent: '#f59e0b' },
    { id: 'ready',   icon: '💚', title: 'Readiness',      subtitle: `${READINESS_SCORE} · Good`,                           accent: readinessColor(READINESS_SCORE) },
    { id: 'work',    icon: '🧠', title: 'Deep Work',      subtitle: 'Focus blocks and strategy',                           accent: '#4ade80', loading: ai.work.loading   },
    { id: 'client',  icon: '💼', title: 'Client Brief',   subtitle: 'Aztec · Salesforce',                                  accent: '#64b5f6', loading: ai.client.loading },
    { id: 'biz',     icon: '📈', title: 'Business Pulse', subtitle: 'Markets and top stories',                             accent: '#ffc800', loading: ai.biz.loading    },
    { id: 'ai',      icon: '🤖', title: 'AI Briefing',    subtitle: 'Anthropic and AI news',                               accent: '#a78bfa', loading: ai.ai.loading     },
    { id: 'focus',   icon: '🎯', title: "Today's Focus",  subtitle: 'Your priority',                                       accent: '#f97316', loading: ai.focus.loading  },
    { id: 'schedule',icon: '📅', title: 'Schedule',       subtitle: scheduleSubtitle(calendar.events, calendar.loading, calendar.connected), accent: '#38bdf8', fullWidth: true },
  ]

  const activeTile = TILES.find(t => t.id === activeId)

  function getContent(id: string | null) {
    switch (id) {
      case 'ready':    return <ReadinessScreen score={READINESS_SCORE} />
      case 'work':     return <DeepWorkScreen  aiState={ai.work}   onRetry={() => retry('work')}   />
      case 'client':   return <ClientBriefScreen aiState={ai.client} onRetry={() => retry('client')} />
      case 'biz':      return <BusinessPulseScreen aiState={ai.biz}  onRetry={() => retry('biz')}   />
      case 'ai':       return <AIBriefingScreen aiState={ai.ai}    onRetry={() => retry('ai')}    />
      case 'focus':    return <TodaysFocusScreen aiState={ai.focus} onRetry={() => retry('focus')} />
      case 'mindset':  return <MindsetScreen />
      case 'schedule': return <ScheduleScreen events={calendar.events} loading={calendar.loading} connected={calendar.connected} />
      default:         return null
    }
  }

  return (
    <div className="app">
      <div className="glow glow-tl" />
      <div className="glow glow-tr" />
      <div className="glow glow-b" />

      <div className="app-content">
        <Header
          readinessScore={READINESS_SCORE}
          readinessColor={readinessColor(READINESS_SCORE)}
          onSettings={() => setSettings(true)}
        />
        {weather && <WeatherBanner weather={weather} />}
        <div className="tile-grid">
          {TILES.map(t => (
            <Tile
              key={t.id}
              icon={t.icon}
              title={t.title}
              subtitle={t.subtitle}
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
        <SettingsScreen calendar={calendar} />
      </Modal>
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
