const MODEL       = 'claude-sonnet-4-6'
// Pulse uses the fast model — three parallel web_search calls on cellular
// were taking 30-45s each on Sonnet. Haiku 4.5 is plenty for two-story
// summaries and finishes in roughly a third the time.
const PULSE_MODEL = 'claude-haiku-4-5-20251001'
const ENDPOINT    = 'https://api.anthropic.com/v1/messages'

async function callClaude(system: string, prompt: string, webSearch = false): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
  if (webSearch) headers['anthropic-beta'] = 'web-search-2025-03-05'

  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: 1024,
    system,
    messages: [{ role: 'user', content: prompt }],
  }
  if (webSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search' }]

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json() as { content: Array<{ type: string; text?: string }> }
  return data.content
    .filter(b => b.type === 'text')
    .map(b => b.text ?? '')
    .join('\n')
    .trim()
}

function dayInfo() {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const now = new Date()
  return {
    day:  DAYS[now.getDay()],
    date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
  }
}

export function fetchClientBrief(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are a research analyst supporting a senior consultant. Be concise, professional, and insight-driven.',
    `Today is ${day}, ${date}. My active client is Aztec, working on Salesforce CRM digital transformation, Phase 2 (Integration), deadline 15 May 2026, status On Track. Key contact: James Henderson (CPO). Also active: Salesforce — Discovery Phase, contact Rachel Ng.

Using web search, research any relevant news about Aztec, Salesforce, or enterprise CRM today, then give me a research summary with two sections:

KEY FINDINGS
→ [first specific research insight or news item that affects this client]
→ [second specific research insight or news item]
→ [third specific research insight or news item]

CONTEXT & IMPLICATIONS
[2-3 sentences interpreting what these findings mean for today's work with the client]`,
    true,
  )
}

const PULSE_FORMAT_TAIL = `

Format each story exactly like this and never deviate:

**Headline in sentence case**
What: One sentence describing the concrete event that just happened — no background, no setup.
Impact: One sentence describing why this matters or what changes for someone working in enterprise tech.
Source: https://full-direct-url-to-the-original-article

Leave a blank line between stories. The What and Impact lines must each be a single sentence and must start with the literal label "What:" or "Impact:" followed by a space. The Source line MUST be a single direct URL to the original news article (not a search results page, not a homepage). Do not include any preamble, closing remarks, extra fields, citations, or commentary outside the labelled lines.`

async function callPulse(prompt: string, debugKey: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

  // Bail after 45s so the UI doesn't sit on "Updating…" forever when the
  // network is flaky or the model takes too long with web_search rounds.
  const ctrl = new AbortController()
  const timeoutId = setTimeout(() => ctrl.abort(), 45_000)

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type':                              'application/json',
        'x-api-key':                                 apiKey ?? '',
        'anthropic-version':                          '2023-06-01',
        // Required for direct browser calls — without it the API CORS-rejects
        'anthropic-dangerous-direct-browser-access':  'true',
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        // Haiku for speed; max_uses caps the model at 2 searches per call
        // so it can't go down a 5-search rabbit hole on cellular.
        model:      PULSE_MODEL,
        max_tokens: 2048,
        tools: [
          {
            type:     'web_search_20250305',
            name:     'web_search',
            max_uses: 2,
          },
        ],
        messages: [
          {
            role:    'user',
            content: prompt,
          },
        ],
      }),
    })
  } catch (e) {
    clearTimeout(timeoutId)
    try {
      sessionStorage.setItem(
        `daybreak-pulse-debug-${debugKey}`,
        JSON.stringify({ ok: false, network: true, msg: String(e), ts: Date.now() }),
      )
    } catch { /* noop */ }
    throw e
  }
  clearTimeout(timeoutId)

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    try {
      sessionStorage.setItem(
        `daybreak-pulse-debug-${debugKey}`,
        JSON.stringify({ ok: false, status: response.status, body: errText, ts: Date.now() }),
      )
    } catch { /* noop */ }
    // Try to pull a useful message out of the JSON-shaped error body so the
    // UI can display it without needing the console.
    let detail = ''
    try {
      const parsed = JSON.parse(errText)
      detail = parsed?.error?.message || parsed?.message || ''
    } catch { detail = errText.slice(0, 240) }
    throw new Error(`API ${response.status}${detail ? ` — ${detail}` : ''}`)
  }

  const data = await response.json()

  // Persist the raw response so we can verify web-search is actually returning content.
  // Inspect via:  JSON.parse(sessionStorage.getItem('daybreak-pulse-debug-anthropic'))
  try {
    sessionStorage.setItem(
      `daybreak-pulse-debug-${debugKey}`,
      JSON.stringify({ ok: true, data, ts: Date.now() }),
    )
  } catch { /* noop */ }
  // eslint-disable-next-line no-console
  console.log(`[pulse:${debugKey}] raw response`, data)

  type Citation     = { type?: string; url?: string; title?: string }
  type SearchResult = { type?: string; url?: string; title?: string }
  type Block        = {
    type:      string
    text?:     string
    citations?: Citation[]
    content?:  SearchResult[]   // present on web_search_tool_result blocks
  }

  const blocks = (data.content as Block[]) || []

  const textContent = blocks
    .filter(b => b.type === 'text')
    .map(b => b.text ?? '')
    .join('\n')
    .trim()

  // Collect URLs from two places, de-duplicated, in order:
  //   1. citations attached to text blocks (the model's own attributions)
  //   2. web_search_tool_result blocks' content (the raw search hits)
  // We use these as a fallback so each story has a clickable source even when
  // the model omits the explicit "Source:" line.
  const seen = new Set<string>()
  const sourceUrls: string[] = []
  function take(url: string | undefined) {
    if (!url || seen.has(url)) return
    seen.add(url)
    sourceUrls.push(url)
  }
  for (const b of blocks) {
    if (b.type === 'text') {
      for (const c of b.citations ?? []) take(c.url)
    }
    if (b.type === 'web_search_tool_result') {
      for (const r of b.content ?? []) take(r.url)
    }
  }

  if (!textContent) {
    throw new Error('empty-response')
  }

  // Append a sources block if the model didn't already include Source: lines
  // for every story. The PulseScreen parser will use these as fallbacks.
  if (sourceUrls.length > 0 && !/^source\s*:/im.test(textContent)) {
    return textContent + '\n\nSources:\n' + sourceUrls.map(u => '- ' + u).join('\n')
  }
  return textContent
}

export function fetchPulseAnthropic(): Promise<string> {
  const { day, date } = dayInfo()
  return callPulse(
    `Today is ${day}, ${date}.

Search reputable technology news sources including the official Anthropic blog at anthropic.com/news, TechCrunch, The Verge, Wired, Reuters Technology and the Financial Times for the latest news specifically about Anthropic from the last 7 days.

Return the 2 most important stories. For each, give a bold headline and 2 sentences of context explaining why it matters to someone working in enterprise technology.${PULSE_FORMAT_TAIL}`,
    'anthropic',
  )
}

export function fetchPulseAIWorld(): Promise<string> {
  const { day, date } = dayInfo()
  return callPulse(
    `Today is ${day}, ${date}.

Search reputable technology news sources including TechCrunch, The Verge, Wired, MIT Technology Review, VentureBeat and Reuters Technology for the most important AI industry news from the last 7 days. Cover OpenAI, Google DeepMind, Meta AI, Microsoft AI, enterprise AI adoption and significant AI research.

Return the 2 most important stories with a bold headline and 2 sentences of context each.${PULSE_FORMAT_TAIL}`,
    'aiworld',
  )
}

export function fetchPulseTechMarket(): Promise<string> {
  const { day, date } = dayInfo()
  return callPulse(
    `Today is ${day}, ${date}.

Search reputable business and technology sources including the Financial Times, Reuters, BBC Business, TechCrunch and VentureBeat for the most important technology market and business news from the last 7 days relevant to a senior account executive selling enterprise technology in the UK.

Return the 2 most important stories with a bold headline and 2 sentences of context each.${PULSE_FORMAT_TAIL}`,
    'techmarket',
  )
}
