import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Tile from './components/Tile'
import Modal from './components/Modal'
import WeatherBanner from './components/WeatherBanner'
import { useWeather } from './hooks/useWeather'
import StoicScreen from './screens/StoicScreen'
import ReadinessScreen from './screens/ReadinessScreen'
import DeepWorkScreen from './screens/DeepWorkScreen'
import ClientBriefScreen from './screens/ClientBriefScreen'
import BusinessPulseScreen from './screens/BusinessPulseScreen'
import AIBriefingScreen from './screens/AIBriefingScreen'
import TodaysFocusScreen from './screens/TodaysFocusScreen'
import MindsetScreen from './screens/MindsetScreen'
import PrivacyScreen from './screens/PrivacyScreen'
import TermsScreen from './screens/TermsScreen'

const READINESS_SCORE = 74

function readinessColor(score: number): string {
  if (score >= 80) return '#4ade80'
  if (score >= 60) return '#ffc800'
  return '#f87171'
}

const TILES = [
  { id: 'stoic',    icon: '⚡', title: 'Stoic',          subtitle: "Today's principle",         accent: '#ffc800' },
  { id: 'ready',   icon: '💚', title: 'Readiness',       subtitle: `${READINESS_SCORE} · Good`, accent: readinessColor(READINESS_SCORE) },
  { id: 'work',    icon: '🧠', title: 'Deep Work',       subtitle: 'Focus blocks and strategy',  accent: '#4ade80' },
  { id: 'client',  icon: '💼', title: 'Client Brief',    subtitle: 'Aztec · Salesforce',        accent: '#64b5f6' },
  { id: 'biz',     icon: '📈', title: 'Business Pulse',  subtitle: 'Markets and top stories',   accent: '#ffc800' },
  { id: 'ai',      icon: '🤖', title: 'AI Briefing',     subtitle: 'Anthropic and AI news',     accent: '#a78bfa' },
  { id: 'focus',   icon: '🎯', title: "Today's Focus",   subtitle: 'Your priority',             accent: '#f97316' },
  { id: 'mindset', icon: '🙏', title: 'Mindset',         subtitle: 'Gratitude and intention',   accent: '#f59e0b' },
]

function getContent(id: string | null) {
  switch (id) {
    case 'stoic':   return <StoicScreen />
    case 'ready':   return <ReadinessScreen score={READINESS_SCORE} />
    case 'work':    return <DeepWorkScreen />
    case 'client':  return <ClientBriefScreen />
    case 'biz':     return <BusinessPulseScreen />
    case 'ai':      return <AIBriefingScreen />
    case 'focus':   return <TodaysFocusScreen />
    case 'mindset': return <MindsetScreen />
    default:        return null
  }
}

function HomeView() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeTile = TILES.find(t => t.id === activeId)
  const weather = useWeather()

  return (
    <div className="app">
      <div className="glow glow-tl" />
      <div className="glow glow-tr" />
      <div className="glow glow-b" />

      <div className="app-content">
        <Header readinessScore={READINESS_SCORE} readinessColor={readinessColor(READINESS_SCORE)} />
        {weather && <WeatherBanner weather={weather} />}
        <div className="tile-grid">
          {TILES.map(t => (
            <Tile
              key={t.id}
              icon={t.icon}
              title={t.title}
              subtitle={t.subtitle}
              accent={t.accent}
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

      <Modal
        isOpen={activeId !== null}
        onClose={() => setActiveId(null)}
        title={activeTile?.title ?? ''}
        accent={activeTile?.accent ?? '#ffffff'}
      >
        {getContent(activeId)}
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
