// All requests go through the Vite dev/preview proxy at /caldav-proxy → caldav.icloud.com
// This avoids CORS. The app must be served via `npm run dev` or `npm run preview`.
const PROXY = '/caldav-proxy'

export interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  location?: string
  allDay: boolean
}

export interface CalCreds { email: string; password: string }

function basicAuth(c: CalCreds) {
  return 'Basic ' + btoa(`${c.email}:${c.password}`)
}

// Strip the host from any URL Apple returns and normalise to a path we can proxy
function toPath(href: string): string {
  try { return new URL(href).pathname } catch { return href.startsWith('/') ? href : `/${href}` }
}

function parseXML(text: string): Document {
  return new DOMParser().parseFromString(text, 'text/xml')
}

function getHref(el: Element, ns: string, tag: string): string {
  const container = el.getElementsByTagNameNS(ns, tag)[0]
  if (!container) return ''
  const href = container.getElementsByTagNameNS('DAV:', 'href')[0]
  return href?.textContent?.trim() ?? ''
}

async function propfind(path: string, auth: string, depth: string, body: string): Promise<Document> {
  const res = await fetch(`${PROXY}${path}`, {
    method: 'PROPFIND',
    headers: {
      Authorization: auth,
      Depth: depth,
      'Content-Type': 'application/xml; charset=utf-8',
    },
    body,
  })
  if (res.status === 401) throw new Error('auth')
  if (!res.ok && res.status !== 207) throw new Error(`propfind_${res.status}`)
  return parseXML(await res.text())
}

async function calReport(path: string, auth: string, body: string): Promise<Document> {
  const res = await fetch(`${PROXY}${path}`, {
    method: 'REPORT',
    headers: {
      Authorization: auth,
      Depth: '1',
      'Content-Type': 'application/xml; charset=utf-8',
    },
    body,
  })
  if (!res.ok && res.status !== 207) throw new Error(`report_${res.status}`)
  return parseXML(await res.text())
}

async function getPrincipalPath(auth: string): Promise<string> {
  const doc = await propfind('/', auth, '0', `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`)
  const href = getHref(doc.documentElement, 'DAV:', 'current-user-principal')
  if (!href) throw new Error('no_principal')
  return toPath(href)
}

async function getCalendarHomePath(principalPath: string, auth: string): Promise<string> {
  const doc = await propfind(principalPath, auth, '0', `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop><c:calendar-home-set/></d:prop>
</d:propfind>`)
  const href = getHref(doc.documentElement, 'urn:ietf:params:xml:ns:caldav', 'calendar-home-set')
  if (!href) throw new Error('no_home_set')
  return toPath(href)
}

async function listCalendarPaths(homePath: string, auth: string): Promise<string[]> {
  const doc = await propfind(homePath, auth, '1', `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop><d:resourcetype/></d:prop>
</d:propfind>`)

  const paths: string[] = []
  for (const resp of Array.from(doc.getElementsByTagNameNS('DAV:', 'response'))) {
    const rtype = resp.getElementsByTagNameNS('DAV:', 'resourcetype')[0]
    if (!rtype) continue
    const isCalendar = rtype.getElementsByTagNameNS('urn:ietf:params:xml:ns:caldav', 'calendar').length > 0
    if (!isCalendar) continue
    const href = resp.getElementsByTagNameNS('DAV:', 'href')[0]?.textContent?.trim()
    if (href) paths.push(toPath(href))
  }
  return paths
}

function localDayRange() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  return { start: fmt(start), end: fmt(end) }
}

function parseICalDate(raw: string): { date: Date; allDay: boolean } {
  // raw is the value part after the colon, e.g. "20240425T090000Z" or "20240425"
  const isUTC = raw.endsWith('Z')
  const s = raw.replace('Z', '')
  if (s.length === 8) {
    return { date: new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8)), allDay: true }
  }
  const d = isUTC
    ? new Date(Date.UTC(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8), +s.slice(9,11), +s.slice(11,13)))
    : new Date(+s.slice(0,4), +s.slice(4,6)-1, +s.slice(6,8), +s.slice(9,11), +s.slice(11,13))
  return { date: d, allDay: false }
}

function isToday(d: Date): boolean {
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

function parseICalText(ical: string): CalEvent[] {
  const events: CalEvent[] = []
  const vevents = ical.split('BEGIN:VEVENT')
  for (let i = 1; i < vevents.length; i++) {
    // Unfold continuation lines (RFC 5545 §3.1)
    const block = vevents[i].replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
    let uid = '', summary = '', dtstart = '', dtend = '', location = ''

    for (const line of block.split('\n')) {
      if (line.startsWith('END:VEVENT')) break
      const colon = line.indexOf(':')
      if (colon < 0) continue
      const key = line.slice(0, colon)
      const val = line.slice(colon + 1)
      if (key === 'UID')                uid      = val
      else if (key === 'SUMMARY')       summary  = val
      else if (key.startsWith('DTSTART')) dtstart = val
      else if (key.startsWith('DTEND'))   dtend   = val
      else if (key === 'LOCATION')      location = val
    }

    if (!dtstart) continue
    const { date: start, allDay } = parseICalDate(dtstart)
    const { date: end } = dtend ? parseICalDate(dtend) : { date: start }
    if (!isToday(start)) continue

    events.push({ id: uid || String(start.getTime()), title: summary || 'Untitled Event', start, end, location: location || undefined, allDay })
  }
  return events.sort((a, b) => a.start.getTime() - b.start.getTime())
}

async function fetchCalendarEvents(calPath: string, auth: string): Promise<CalEvent[]> {
  const { start, end } = localDayRange()
  const doc = await calReport(calPath, auth, `<?xml version="1.0" encoding="utf-8"?>
<c:calendar-query xmlns:d="DAV:" xmlns:c="urn:ietf:params:xml:ns:caldav">
  <d:prop><d:getetag/><c:calendar-data/></d:prop>
  <c:filter>
    <c:comp-filter name="VCALENDAR">
      <c:comp-filter name="VEVENT">
        <c:time-range start="${start}" end="${end}"/>
      </c:comp-filter>
    </c:comp-filter>
  </c:filter>
</c:calendar-query>`)

  const events: CalEvent[] = []
  for (const resp of Array.from(doc.getElementsByTagNameNS('DAV:', 'response'))) {
    const calData = resp.getElementsByTagNameNS('urn:ietf:params:xml:ns:caldav', 'calendar-data')[0]
    if (!calData?.textContent) continue
    events.push(...parseICalText(calData.textContent))
  }
  return events
}

export async function testConnection(creds: CalCreds): Promise<void> {
  const auth = basicAuth(creds)
  const res = await fetch(`${PROXY}/`, {
    method: 'PROPFIND',
    headers: { Authorization: auth, Depth: '0', 'Content-Type': 'application/xml; charset=utf-8' },
    body: `<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:"><d:prop><d:current-user-principal/></d:prop></d:propfind>`,
  })
  if (res.status === 401) throw new Error('auth')
  if (!res.ok && res.status !== 207) throw new Error(`http_${res.status}`)
}

export async function fetchTodayEvents(creds: CalCreds): Promise<CalEvent[]> {
  const auth = basicAuth(creds)
  const principalPath = await getPrincipalPath(auth)
  const homePath      = await getCalendarHomePath(principalPath, auth)
  const calPaths      = await listCalendarPaths(homePath, auth)

  const all: CalEvent[] = []
  for (const path of calPaths) {
    try { all.push(...await fetchCalendarEvents(path, auth)) } catch { /* skip failed calendars */ }
  }
  return all.sort((a, b) => a.start.getTime() - b.start.getTime())
}
