const MODEL    = 'claude-sonnet-4-6'
const ENDPOINT = 'https://api.anthropic.com/v1/messages'

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

Format each story exactly like this:

**Headline in sentence case**
Two sentences of context explaining what happened and why it matters.
Source: https://full-direct-url-to-the-original-article

Leave a blank line between stories. The Source line MUST be a single direct URL to the original news article (not a search results page, not a homepage). Do not include any preamble, closing remarks, citations, or commentary outside the two stories.`

async function callPulse(prompt: string, debugKey: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type':                              'application/json',
      'x-api-key':                                 apiKey ?? '',
      'anthropic-version':                          '2023-06-01',
      'anthropic-beta':                             'interleaved-thinking-2025-05-14',
      // Required for direct browser calls — without it the API CORS-rejects
      'anthropic-dangerous-direct-browser-access':  'true',
    },
    body: JSON.stringify({
      model:      MODEL,
      max_tokens: 1024,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
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

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    try {
      sessionStorage.setItem(
        `daybreak-pulse-debug-${debugKey}`,
        JSON.stringify({ ok: false, status: response.status, body: errText, ts: Date.now() }),
      )
    } catch { /* noop */ }
    throw new Error(`API ${response.status}`)
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

  const textContent = (data.content as Array<{ type: string; text?: string }>)
    .filter((block) => block.type === 'text')
    .map((block) => block.text ?? '')
    .join('\n')
    .trim()

  if (!textContent) {
    throw new Error('empty-response')
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
