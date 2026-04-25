import { useState, useEffect, useMemo } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { useWeather } from './hooks/useWeather'
import { useWhoop } from './hooks/useWhoop'
import WhoopRings from './components/WhoopRings'
import PrivacyScreen from './screens/PrivacyScreen'
import TermsScreen from './screens/TermsScreen'

const USER_NAME = 'Sian'

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
]
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(d: Date): string {
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function greetingForHour(hour: number): string {
  if (hour < 5)  return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function buildWhoopAuthUrl(): string | null {
  const clientId = import.meta.env.VITE_WHOOP_CLIENT_ID as string | undefined
  if (!clientId) return null
  const redirectUri = `${window.location.origin}/api/whoop/callback`
  const scope = 'read:recovery read:sleep read:cycles read:profile offline'
  const state = Math.random().toString(36).slice(2)
  return (
    `https://api.prod.whoop.com/oauth/oauth2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`
  )
}

/* ---------- Header ---------- */
function EditorialHeader() {
  const initial = USER_NAME[0].toLowerCase()
  return (
    <header className="eh">
      <span className="eh-mark">Daybreak</span>
      <span className="eh-avatar" aria-label="profile">{initial}</span>
    </header>
  )
}

/* ---------- Greeting ---------- */
function Greeting({ now }: { now: Date }) {
  const weather = useWeather()
  const greeting = greetingForHour(now.getHours())

  return (
    <section className="greeting">
      <div className="greeting-date">{formatDate(now)}</div>
      <h1 className="greeting-text">{greeting}, {USER_NAME}.</h1>
      {weather && (
        <div className="greeting-weather">
          <span className="greeting-weather-icon">{weather.emoji}</span>
          <div className="greeting-weather-text">
            <div>{weather.condition}, {weather.temp}°.</div>
            <div className="greeting-weather-sub">High {weather.high}° · low {weather.low}°.</div>
          </div>
        </div>
      )}
    </section>
  )
}

/* ---------- Today's word ---------- */
const WORDS = [
  'unhurried', 'precise', 'patient', 'open', 'grounded',
  'curious', 'deliberate', 'measured', 'honest', 'still',
]
function TodaysWord({ now }: { now: Date }) {
  const word = WORDS[(now.getMonth() * 31 + now.getDate()) % WORDS.length]
  return (
    <section className="todays-word">
      <div className="label-caption">today's word</div>
      <div className="todays-word-value">{word}.</div>
    </section>
  )
}

/* ---------- One thing ---------- */
function OneThing() {
  return (
    <section className="one-thing">
      <div className="one-thing-eyebrow">the one thing</div>
      <div className="one-thing-text">Send the Salesforce POV deck to Aztec.</div>
      <div className="one-thing-meta">
        <span><span className="one-thing-meta-key">Best window</span><span className="one-thing-meta-val">9:30–11:30</span></span>
        <span className="one-thing-meta-sep">·</span>
        <span><span className="one-thing-meta-key">Due</span>14:00</span>
      </div>
    </section>
  )
}

/* ---------- From yesterday ---------- */
function FromYesterday() {
  return (
    <section className="module">
      <div className="module-label">From yesterday</div>
      <div className="yesterday-grid">
        <div className="yesterday-card">
          <div className="yesterday-eyebrow">Carry forward</div>
          <div className="yesterday-text">Camunda diagram for slide 7.</div>
        </div>
        <div className="yesterday-card">
          <div className="yesterday-eyebrow">Let it go</div>
          <div className="yesterday-text struck">Adam's tone in the 4pm.</div>
        </div>
      </div>
    </section>
  )
}

/* ---------- Body pills ---------- */
type BodyState = 'sluggish' | 'steady' | 'charged'
function BodyPicker() {
  const [v, setV] = useState<BodyState>('steady')
  const opts: BodyState[] = ['sluggish', 'steady', 'charged']
  return (
    <section className="module">
      <div className="module-label">How's the body?</div>
      <div className="body-pills">
        {opts.map(o => (
          <button
            key={o}
            className={`body-pill${v === o ? ' is-on' : ''}`}
            onClick={() => setV(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </section>
  )
}

/* ---------- Movement window ---------- */
function MovementWindow() {
  return (
    <section className="module">
      <div className="module-label">A window for movement</div>
      <div className="movement-card">
        <div className="movement-head">
          <div className="movement-time">17:30 — 60 mins free</div>
          <div className="movement-tag">auto-found</div>
        </div>
        <div className="movement-body">
          Padel court at Rocket open 17:30. Three players nearby looking to play.
        </div>
        <div className="movement-actions">
          <button className="btn-quiet">Book the court</button>
          <button className="btn-quiet">Skip today</button>
        </div>
      </div>
    </section>
  )
}

/* ---------- Worry parking lot ---------- */
function WorryParkingLot() {
  const [v, setV] = useState('The Aztec security review feedback…')
  return (
    <section className="module">
      <div className="module-label">Worry parking lot</div>
      <div className="module-help">Park what's spinning. We'll bring it back at 18:00.</div>
      <textarea
        className="worry-input"
        rows={3}
        value={v}
        onChange={e => setV(e.target.value)}
        placeholder="Drop it here…"
      />
    </section>
  )
}

/* ---------- Someone in your orbit ---------- */
function Orbit() {
  return (
    <section className="module">
      <div className="module-label">Someone in your orbit</div>
      <div className="orbit-card">
        <div className="orbit-avatar">JM</div>
        <div className="orbit-info">
          <div className="orbit-name">Jamie Marshall</div>
          <div className="orbit-meta">47 days quiet · birthday Tuesday</div>
        </div>
        <button className="btn-quiet">Draft</button>
      </div>
    </section>
  )
}

/* ---------- Today's small things ---------- */
function SmallThings() {
  return (
    <section className="module">
      <div className="module-label">Today's small things</div>
      <div className="small-grid">
        <div className="small-card">
          <div className="small-eyebrow">60-second curiosity</div>
          <div className="small-text">Why do octopuses have three hearts?</div>
          <a className="small-link" href="#" onClick={e => e.preventDefault()}>Read →</a>
        </div>
        <div className="small-card">
          <div className="small-eyebrow">Look forward to</div>
          <div className="small-text">The fig tart at Margot on the way home.</div>
          <a className="small-link" href="#" onClick={e => e.preventDefault()}>Saved by you ↗</a>
        </div>
      </div>
    </section>
  )
}

/* ---------- Tonight's you ---------- */
function TonightYou() {
  return (
    <section className="tonight-block">
      <div className="hairline" />
      <div className="tonight-eyebrow">tonight's you</div>
      <p className="tonight-quote">
        "wants to feel unhurried. the lever today: laptop closed by 18:30."
      </p>
    </section>
  )
}

/* ---------- Whoop flash banner ---------- */
function useWhoopFlash() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const w = params.get('whoop')
    if (!w) return
    if (w === 'connected')      setMsg('Whoop connected.')
    else if (w === 'cancelled') setMsg('Whoop connection cancelled.')
    else if (w === 'error')     setMsg('Whoop connection failed.')
    const url = new URL(window.location.href)
    url.searchParams.delete('whoop')
    url.searchParams.delete('reason')
    window.history.replaceState({}, '', url.pathname + (url.search || ''))
  }, [])
  return { msg, clear: () => setMsg(null) }
}

/* ---------- Home ---------- */
function HomeView() {
  const now    = useMemo(() => new Date(), [])
  const whoop  = useWhoop()
  const flash  = useWhoopFlash()

  function connectWhoop() {
    const url = buildWhoopAuthUrl()
    if (url) window.location.href = url
  }

  return (
    <main className="editorial">
      <EditorialHeader />
      <Greeting now={now} />
      {flash.msg && (
        <div
          style={{
            margin: '0 0 18px',
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'transparent',
            color: 'var(--ink-2)',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span>{flash.msg}</span>
          <button
            onClick={flash.clear}
            style={{ fontSize: 12, color: 'var(--muted)' }}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
      <div className="hairline" />
      <TodaysWord now={now} />
      <WhoopRings whoop={whoop} onConnect={connectWhoop} />
      <OneThing />
      <FromYesterday />
      <BodyPicker />
      <MovementWindow />
      <WorryParkingLot />
      <Orbit />
      <SmallThings />
      <TonightYou />

      <footer className="editorial-footer">
        <Link to="/privacy">Privacy</Link>
        <span className="editorial-footer-sep">·</span>
        <Link to="/terms">Terms</Link>
      </footer>
    </main>
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
