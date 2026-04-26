import { useState } from 'react'
import { testConnection } from '../services/caldav'
import type { WhoopData, WhoopDebug } from '../hooks/useWhoop'

/* -------------------------------------------------------------------
   Whoop debug panel — surfaces what useWhoop's last fetch returned so
   we can diagnose 'connected but no data' on a phone without a console.
------------------------------------------------------------------- */

function statusGlyph(status: number | undefined): string {
  if (status == null)            return '?'
  if (status >= 200 && status < 300) return '✓'
  return String(status)
}

function timeAgo(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime()
    if (ms < 60_000)  return `${Math.round(ms / 1000)}s ago`
    if (ms < 3600_000) return `${Math.round(ms / 60_000)}m ago`
    return `${Math.round(ms / 3600_000)}h ago`
  } catch { return iso }
}

function WhoopDebugPanel({ debug }: { debug: WhoopDebug }) {
  const [showRaw, setShowRaw] = useState(false)
  const lines: string[] = []
  lines.push(`source ${debug.source}`)
  lines.push(`tokens ${debug.hasTokens ? '✓' : '✗'}`)
  if (debug.fetchStatus != null) lines.push(`fetch ${debug.fetchStatus}${debug.fetchOk ? ' ✓' : ' ✗'}`)
  if (debug.fetchError) lines.push(`error ${debug.fetchError}`)
  if (debug.recoveryStatus != null) lines.push(`recovery ${statusGlyph(debug.recoveryStatus)}${debug.recoveryHasRecord ? ' (record)' : ' (empty)'}`)
  if (debug.sleepStatus    != null) lines.push(`sleep    ${statusGlyph(debug.sleepStatus)}${debug.sleepHasRecord ? ' (record)' : ' (empty)'}`)
  if (debug.cycleStatus    != null) lines.push(`cycle    ${statusGlyph(debug.cycleStatus)}${debug.cycleHasRecord ? ' (record)' : ' (empty)'}`)

  const errors = debug.errors ?? {}
  const errorEntries = Object.entries(errors)

  return (
    <div className="settings-debug">
      <div className="settings-debug-head">
        <span className="settings-debug-title">whoop status</span>
        <span className="settings-debug-time">{timeAgo(debug.ts)}</span>
      </div>
      <div className="settings-debug-lines">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      {errorEntries.length > 0 && (
        <>
          <button
            type="button"
            className="settings-debug-toggle"
            onClick={() => setShowRaw(s => !s)}
          >
            {showRaw ? 'hide error bodies' : 'show error bodies'}
          </button>
          {showRaw && (
            <pre className="settings-debug-raw">
              {errorEntries.map(([k, v]) => `${k}\n${v}`).join('\n\n')}
            </pre>
          )}
        </>
      )}
      {debug.rawResponseHead && (
        <pre className="settings-debug-raw">{debug.rawResponseHead}</pre>
      )}
    </div>
  )
}

interface CalendarHook {
  connected: boolean
  getStoredEmail: () => string
  saveCredentials: (email: string, password: string) => Promise<void>
  clearCredentials: () => void
}

interface Props {
  calendar: CalendarHook
  whoop: WhoopData
}

type SaveState = 'idle' | 'connecting' | 'success' | 'error'

function generateState(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID().replace(/-/g, '')
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function buildWhoopAuthUrl(): string | null {
  const clientId = import.meta.env.VITE_WHOOP_CLIENT_ID as string | undefined
  if (!clientId) return null
  const redirectUri = `${window.location.origin}/api/whoop/callback`
  const scope       = 'read:recovery read:sleep read:cycles read:profile offline'
  const state       = generateState()
  return (
    `https://api.prod.whoop.com/oauth/oauth2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`
  )
}

export default function SettingsScreen({ calendar, whoop }: Props) {
  const [email, setEmail]         = useState(calendar.getStoredEmail)
  const [password, setPassword]   = useState('')
  const [saveState, setSaveState] = useState<SaveState>('idle')

  const handleSave = async () => {
    if (!email.trim() || !password.trim()) return
    setSaveState('connecting')
    try {
      await testConnection({ email: email.trim(), password: password.trim() })
      await calendar.saveCredentials(email.trim(), password.trim())
      setPassword('')
      setSaveState('success')
    } catch {
      setSaveState('error')
    }
  }

  const handleDisconnect = () => {
    calendar.clearCredentials()
    setEmail('')
    setPassword('')
    setSaveState('idle')
  }

  const canSave = email.trim().length > 0 && password.trim().length > 0 && saveState !== 'connecting'

  const whoopAuthUrl = buildWhoopAuthUrl()

  return (
    <div>
      {/* ── Whoop ────────────────────────────────────────── */}
      <div className="settings-section">
        <div className="screen-section-label">WHOOP</div>

        {whoop.connected ? (
          <>
            <div className="settings-msg settings-msg-success" style={{ marginBottom: 12 }}>
              Connected · Recovery {whoop.recovery ?? '–'}%
            </div>
            <button
              className="settings-btn settings-btn-save active"
              onClick={() => whoop.refresh()}
              style={{ marginBottom: 8 }}
            >
              {whoop.loading ? 'REFRESHING…' : 'REFRESH NOW'}
            </button>
            <button
              className="settings-btn settings-btn-disconnect"
              onClick={() => whoop.disconnect()}
            >
              DISCONNECT WHOOP
            </button>
          </>
        ) : whoopAuthUrl ? (
          <>
            <p className="settings-note" style={{ marginBottom: 14 }}>
              Connect your Whoop band to see live recovery, HRV, resting heart rate, and sleep data.
              Tap below. Whoop opens in Safari to authorise.
            </p>
            <a
              className="settings-btn settings-btn-save active"
              href={whoopAuthUrl}
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              CONNECT WHOOP →
            </a>
          </>
        ) : (
          <div className="settings-msg settings-msg-error">
            Whoop client ID is missing. Add <code>VITE_WHOOP_CLIENT_ID</code> in Vercel
            environment variables (Production scope) and redeploy.
          </div>
        )}

        {/* Diagnostic — visible whenever a debug snapshot exists, even if
            the connection state is empty. Lets us see exactly which API
            call is failing without needing a console on the phone PWA. */}
        {whoop.debug && <WhoopDebugPanel debug={whoop.debug} />}
      </div>

      {/* ── Calendar ─────────────────────────────────────── */}
      <div className="settings-section">
        <div className="screen-section-label">CALENDAR</div>

        <div className="settings-field">
          <label className="settings-field-label">Apple ID Email</label>
          <input
            className="settings-input"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setSaveState('idle') }}
            placeholder="you@icloud.com"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        <div className="settings-field">
          <label className="settings-field-label">App-Specific Password</label>
          <input
            className="settings-input"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setSaveState('idle') }}
            placeholder="xxxx-xxxx-xxxx-xxxx"
            autoCapitalize="none"
            autoCorrect="off"
          />
        </div>

        <p className="settings-note">
          You need an App-Specific Password, not your normal Apple ID password. Go to{' '}
          <a href="https://appleid.apple.com" target="_blank" rel="noreferrer" className="settings-note-link">
            appleid.apple.com
          </a>
          , sign in, tap Sign-In and Security, then App-Specific Passwords, then Generate.
          Paste the generated password here.
        </p>

        <button
          className={`settings-btn settings-btn-save${canSave ? ' active' : ''}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          {saveState === 'connecting' ? 'CONNECTING…' : 'SAVE CALENDAR'}
        </button>

        {saveState === 'success' && (
          <div className="settings-msg settings-msg-success">
            Calendar connected successfully
          </div>
        )}

        {saveState === 'error' && (
          <div className="settings-msg settings-msg-error">
            Connection failed. Please check your App-Specific Password and try again.{' '}
            <a href="https://appleid.apple.com" target="_blank" rel="noreferrer" className="settings-error-link">
              Open appleid.apple.com ↗
            </a>
          </div>
        )}

        {calendar.connected && (
          <button className="settings-btn settings-btn-disconnect" onClick={handleDisconnect}>
            DISCONNECT CALENDAR
          </button>
        )}
      </div>
    </div>
  )
}
