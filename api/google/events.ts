/**
 * Today's Google Calendar events for the connected account.
 * Mirrors the Whoop /data flow: client sends Bearer access_token plus an
 * X-Google-Refresh-Token header; if the access token has expired the
 * server refreshes (using the client secret) and returns the new pair so
 * the client can persist them.
 */

interface RefreshedTokens { access_token: string; refresh_token?: string; expires_in: number }

async function exchangeRefresh(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<RefreshedTokens | null> {
  const body = new URLSearchParams({
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
    client_id:     clientId,
    client_secret: clientSecret,
  })
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })
  if (!res.ok) return null
  return res.json() as any
}

interface GCalEventDate { date?: string; dateTime?: string; timeZone?: string }
interface GCalEvent {
  id?:         string
  summary?:    string
  location?:   string
  start?:      GCalEventDate
  end?:        GCalEventDate
  status?:     string
  htmlLink?:   string
}

function startOfTodayLocal(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}
// Default window covers today and tomorrow so the Schedule modal can
// show a "Tomorrow" preview without a second round-trip.
function endOfTomorrowLocal(): Date {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(23, 59, 59, 999)
  return d
}

function parseISOOrNull(s: string | undefined): Date | null {
  if (!s) return null
  const t = Date.parse(s)
  return Number.isFinite(t) ? new Date(t) : null
}

export default async function handler(req: any, res: any) {
  // Disconnect — client wipes localStorage; no server state to clean up.
  if (req.method === 'DELETE') {
    res.status(200).json({ ok: true })
    return
  }

  const authHeader   = (req.headers.authorization as string | undefined) ?? ''
  const accessToken  = authHeader.replace(/^Bearer\s+/i, '').trim() || undefined
  const refreshToken = (req.headers['x-google-refresh-token'] as string | undefined)?.trim() || undefined

  if (!accessToken && !refreshToken) {
    res.status(401).json({ error: 'not_connected' })
    return
  }

  const clientId     = (process.env.VITE_GOOGLE_CLIENT_ID    ?? '').trim()
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET ?? '').trim()

  let currentAccess: string | undefined = accessToken
  let returnedTokens: RefreshedTokens | null = null

  // Pre-emptive refresh if we don't have an access token at all.
  if (!currentAccess && refreshToken) {
    const next = await exchangeRefresh(refreshToken, clientId, clientSecret)
    if (!next) {
      res.status(401).json({ error: 'not_connected' })
      return
    }
    currentAccess  = next.access_token
    returnedTokens = next
  }

  // Optional time range overrides via query string. Clients use these to
  // pull a wider window (e.g. the Movement tile's visible week). Default
  // is today's local midnight to local end-of-day.
  const minOverride = parseISOOrNull(req.query?.timeMin as string | undefined)
  const maxOverride = parseISOOrNull(req.query?.timeMax as string | undefined)

  const params = new URLSearchParams({
    timeMin:       (minOverride ?? startOfTodayLocal()).toISOString(),
    timeMax:       (maxOverride ?? endOfTomorrowLocal()).toISOString(),
    singleEvents:  'true',
    orderBy:       'startTime',
    maxResults:    '250',
  })
  const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`
  const authHeaders = { Authorization: `Bearer ${currentAccess}` }

  let eventsRes = await fetch(eventsUrl, { headers: authHeaders })

  // 401 mid-flight: refresh and retry.
  if (eventsRes.status === 401 && refreshToken) {
    const next = await exchangeRefresh(refreshToken, clientId, clientSecret)
    if (!next) {
      res.status(401).json({ error: 'not_connected' })
      return
    }
    returnedTokens = next
    eventsRes = await fetch(eventsUrl, { headers: { Authorization: `Bearer ${next.access_token}` } })
  }

  let errorBody = ''
  if (!eventsRes.ok) {
    try { errorBody = (await eventsRes.text()).slice(0, 240) } catch { errorBody = '<unreadable>' }
  }

  let items: GCalEvent[] = []
  if (eventsRes.ok) {
    try {
      const json = await eventsRes.json() as { items?: GCalEvent[] }
      items = json.items ?? []
    } catch (e) {
      errorBody = `parse_failed: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  // Map to the app's CalEvent shape. All-day events use date (YYYY-MM-DD)
  // rather than dateTime; treat them as starting at local midnight.
  const events = items
    .filter(e => e.status !== 'cancelled' && (e.start?.dateTime || e.start?.date))
    .map(e => {
      const allDay = !!e.start?.date
      const startISO = e.start?.dateTime ?? `${e.start?.date}T00:00:00`
      const endISO   = e.end?.dateTime   ?? `${e.end?.date   ?? e.start?.date}T23:59:59`
      return {
        id:       e.id ?? `${startISO}-${e.summary ?? 'untitled'}`,
        title:    e.summary ?? '(untitled)',
        start:    startISO,
        end:      endISO,
        allDay,
        location: e.location,
        htmlLink: e.htmlLink,
      }
    })

  const payload: any = {
    connected: true,
    events,
    _debug: {
      eventsStatus: eventsRes.status,
      eventCount:   events.length,
      error:        errorBody || undefined,
      ts:           new Date().toISOString(),
    },
  }

  if (returnedTokens) {
    payload.tokens = {
      access_token:  returnedTokens.access_token,
      refresh_token: returnedTokens.refresh_token ?? refreshToken ?? '',
      expires_in:    returnedTokens.expires_in,
    }
  }

  res.status(200).json(payload)
}
