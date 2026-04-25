import { useState } from 'react'
import { testConnection } from '../services/caldav'
import type { WhoopData } from '../hooks/useWhoop'

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

function connectWhoop() {
  const clientId = import.meta.env.VITE_WHOOP_CLIENT_ID as string | undefined
  if (!clientId) {
    alert(
      'Whoop client ID is missing.\n\n' +
      'Add VITE_WHOOP_CLIENT_ID in Vercel env vars and redeploy.'
    )
    return
  }
  const redirectUri = `${window.location.origin}/api/whoop/callback`
  const scope       = 'read:recovery read:sleep read:cycles read:profile offline'
  const url =
    `https://api.prod.whoop.com/oauth/oauth2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}`
  window.location.assign(url)
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

  return (
    <div>
      {/* ── Whoop ────────────────────────────────────────── */}
      <div className="settings-section">
        <div className="screen-section-label">WHOOP</div>

        {whoop.connected ? (
          <>
            <div className="settings-msg settings-msg-success" style={{ marginBottom: 12 }}>
              Connected · Recovery {whoop.recovery ?? '—'}%
            </div>
            <button
              className="settings-btn settings-btn-disconnect"
              onClick={() => whoop.disconnect()}
            >
              DISCONNECT WHOOP
            </button>
          </>
        ) : (
          <>
            <p className="settings-note" style={{ marginBottom: 14 }}>
              Connect your Whoop band to see live recovery, HRV, resting heart rate, and sleep data.
              You'll be taken to Whoop to authorise the connection.
            </p>
            <button
              className="settings-btn settings-btn-save active"
              onClick={connectWhoop}
            >
              CONNECT WHOOP →
            </button>
          </>
        )}
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
          You need an App-Specific Password — not your normal Apple ID password. Go to{' '}
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
            Connection failed — please check your App-Specific Password and try again.{' '}
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
