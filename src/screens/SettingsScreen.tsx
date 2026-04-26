import { useEffect, useState } from 'react'
import type { WhoopData, WhoopDebug } from '../hooks/useWhoop'
import type { CalendarHook, CalendarDebug } from '../hooks/useCalendar'
import { moments, type MomentsStorageDebug } from '../moments'

/* -------------------------------------------------------------------
   Diagnostic helpers shared between Whoop + Calendar panels.
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
  if (debug.retryAfter != null)     lines.push(`retry-after ${debug.retryAfter}s`)

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

function MomentsDebugPanel() {
  const [debug, setDebug] = useState<MomentsStorageDebug | null>(null)
  const [loading, setLoading] = useState(false)

  async function probe() {
    setLoading(true)
    try { setDebug(await moments.probe('sian')) }
    finally { setLoading(false) }
  }

  // Auto-probe on first render so the panel always has fresh state.
  useEffect(() => { void probe() }, [])

  const lines: string[] = []
  if (debug) {
    lines.push(`backend ${debug.backend}`)
    lines.push(`google tokens ${debug.hasGoogleTokens ? '✓' : '✗'}`)
    if (debug.driveListedOk != null) {
      lines.push(`drive list ${debug.driveListedOk ? '✓' : '✗'}`)
    }
    if (debug.driveListCount != null) {
      lines.push(`drive files ${debug.driveListCount}`)
    }
    if (debug.driveListError) lines.push(`drive err ${debug.driveListError.slice(0, 80)}`)
    if (debug.fetchOk != null) lines.push(`load ${debug.fetchOk ? '✓' : '✗'}`)
    if (debug.count != null) lines.push(`moments ${debug.count}`)
    if (debug.fetchError) lines.push(`load err ${debug.fetchError.slice(0, 80)}`)
  }

  return (
    <div className="settings-debug">
      <div className="settings-debug-head">
        <span className="settings-debug-title">moments status</span>
        {debug && <span className="settings-debug-time">{timeAgo(debug.ts)}</span>}
      </div>
      {!debug && <div className="settings-debug-lines"><div>probing…</div></div>}
      {debug && (
        <div className="settings-debug-lines">
          {lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
      <button
        type="button"
        className="settings-debug-toggle"
        onClick={probe}
        disabled={loading}
      >
        {loading ? 'probing…' : 're-probe'}
      </button>
    </div>
  )
}

function CalendarDebugPanel({ debug }: { debug: CalendarDebug }) {
  const lines: string[] = []
  lines.push(`source ${debug.source}`)
  lines.push(`tokens ${debug.hasTokens ? '✓' : '✗'}`)
  if (debug.fetchStatus != null) lines.push(`fetch ${debug.fetchStatus}${debug.fetchOk ? ' ✓' : ' ✗'}`)
  if (debug.fetchError) lines.push(`error ${debug.fetchError}`)
  if (debug.eventCount != null) lines.push(`events ${debug.eventCount}`)
  if (debug.retryAfter != null) lines.push(`retry-after ${debug.retryAfter}s`)

  return (
    <div className="settings-debug">
      <div className="settings-debug-head">
        <span className="settings-debug-title">calendar status</span>
        <span className="settings-debug-time">{timeAgo(debug.ts)}</span>
      </div>
      <div className="settings-debug-lines">
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
      {debug.rawError && (
        <pre className="settings-debug-raw">{debug.rawError}</pre>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------
   Auth URL builders.
------------------------------------------------------------------- */

interface Props {
  calendar: CalendarHook
  whoop: WhoopData
}

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

function buildGoogleAuthUrl(): string | null {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  if (!clientId) return null
  const redirectUri = `${window.location.origin}/api/google/callback`
  // Two scopes in one consent:
  //  - calendar.readonly: read today's events from the primary calendar
  //  - drive.appdata: read/write a private app-only folder for Moments
  //    photos and metadata, so the collection survives PWA reinstalls.
  // access_type=offline + prompt=consent forces Google to issue a
  // refresh token even on subsequent re-grants.
  const scope = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.appdata',
  ].join(' ')
  const state = generateState()
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope,
    access_type:   'offline',
    prompt:        'consent',
    include_granted_scopes: 'true',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export default function SettingsScreen({ calendar, whoop }: Props) {
  const whoopAuthUrl  = buildWhoopAuthUrl()
  const googleAuthUrl = buildGoogleAuthUrl()

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
              className={`settings-btn settings-btn-save${whoop.cooldownSeconds > 0 ? '' : ' active'}`}
              onClick={() => whoop.refresh()}
              disabled={whoop.cooldownSeconds > 0 || whoop.loading}
              style={{ marginBottom: 8 }}
            >
              {whoop.cooldownSeconds > 0
                ? `WAIT ${whoop.cooldownSeconds}s`
                : whoop.loading
                  ? 'REFRESHING…'
                  : 'REFRESH NOW'}
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

        {whoop.debug && <WhoopDebugPanel debug={whoop.debug} />}
      </div>

      {/* ── Calendar ─────────────────────────────────────── */}
      <div className="settings-section">
        <div className="screen-section-label">CALENDAR</div>

        {calendar.connected ? (
          <>
            <div className="settings-msg settings-msg-success" style={{ marginBottom: 12 }}>
              Connected · {calendar.events.length} {calendar.events.length === 1 ? 'event' : 'events'} today
            </div>
            <button
              className={`settings-btn settings-btn-save${calendar.cooldownSeconds > 0 ? '' : ' active'}`}
              onClick={() => calendar.refresh()}
              disabled={calendar.cooldownSeconds > 0 || calendar.loading}
              style={{ marginBottom: 8 }}
            >
              {calendar.cooldownSeconds > 0
                ? `WAIT ${calendar.cooldownSeconds}s`
                : calendar.loading
                  ? 'REFRESHING…'
                  : 'REFRESH NOW'}
            </button>
            <button
              className="settings-btn settings-btn-disconnect"
              onClick={() => calendar.disconnect()}
            >
              DISCONNECT GOOGLE
            </button>
          </>
        ) : googleAuthUrl ? (
          <>
            <p className="settings-note" style={{ marginBottom: 14 }}>
              Connect your Google account for two things in one consent:
              read-only access to today's primary calendar events, and a
              private app folder for your Moments photos so the collection
              survives PWA reinstalls. Tap below. Google opens in Safari to
              authorise.
            </p>
            <a
              className="settings-btn settings-btn-save active"
              href={googleAuthUrl}
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              CONNECT GOOGLE →
            </a>
          </>
        ) : (
          <div className="settings-msg settings-msg-error">
            Google client ID is missing. Add <code>VITE_GOOGLE_CLIENT_ID</code> and{' '}
            <code>GOOGLE_CLIENT_SECRET</code> in Vercel environment variables
            (Production scope) and redeploy.
          </div>
        )}

        {calendar.debug && <CalendarDebugPanel debug={calendar.debug} />}
      </div>

      {/* ── Moments ──────────────────────────────────────── */}
      <div className="settings-section">
        <div className="screen-section-label">MOMENTS</div>
        <p className="settings-note">
          Photos save to a private Google Drive folder when you're connected,
          so they survive PWA reinstalls. The status below confirms which
          backend is in use and how many photos Drive sees right now.
        </p>
        <MomentsDebugPanel />
      </div>
    </div>
  )
}
