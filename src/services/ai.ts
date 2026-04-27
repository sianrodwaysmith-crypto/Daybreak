// Pulse + account news both use the fast model — three parallel web_search
// calls on cellular were taking 30-45s each on Sonnet. Haiku 4.5 is plenty
// for two-story summaries and finishes in roughly a third the time.
const PULSE_MODEL = 'claude-haiku-4-5-20251001'
const ENDPOINT    = 'https://api.anthropic.com/v1/messages'

function dayInfo() {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const now = new Date()
  return {
    day:  DAYS[now.getDay()],
    date: `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`,
  }
}

const PULSE_FORMAT_TAIL = `

Output ONLY two <story> blocks in this exact XML format, with no other text outside the tags:

<story>
<title>Article title in sentence case, max 12 words.</title>
<date>YYYY-MM-DD publication date of the article.</date>
<what>One sentence under 25 words summarising what the article actually reports. Factual, not editorial.</what>
<impact>One sentence under 25 words on what this means in practice for the reader. Concrete and applied; avoid clichés like "this is significant".</impact>
<source>https://full-direct-url-to-the-original-article</source>
</story>

<story>
<title>...</title>
<date>...</date>
<what>...</what>
<impact>...</impact>
<source>...</source>
</story>

Hard rules:
- Wrap each story in <story>...</story> with one each of <title>, <date>, <what>, <impact>, <source> as children.
- Output exactly two stories.
- <date> MUST be the article's publication date in ISO YYYY-MM-DD format (e.g. 2026-04-19). If the article shows only month and year, use the 1st of that month. Never invent a date.
- Title is plain text, sentence case, no markdown, no bold markers, capped at 12 words. If the publication's headline is longer, paraphrase it down.
- <what> and <impact> are plain text, single sentence each, under 25 words. No markdown, no bold, no inline citations.
- <source> must be a single direct URL to the original news article (not a search results page, not a homepage).
- Your very first character must be the < of the first <story>, and your last character must be the > of the last </story>. No preamble, no framing, no closing line, no separator text between stories, no commentary.
- Punctuation: never use the em-dash character "—" anywhere in your output. Use commas, periods, parentheses, or semicolons. En-dashes "–" only in number or date ranges. Hyphens in compound words like "day-to-day" are fine.`

/* ------------------------------------------------------------------
   Account news prompt — same XML shape as Pulse so the parser is
   shared, but tuned for a Salesforce account executive. The <impact>
   field becomes the conversation hook the AE could open a call with.
   Focus accounts get an extra <talking_points> block at the end with
   2-3 short lines tying the news together into a phone-call opener.
------------------------------------------------------------------ */
function accountFormatTail(storyCount: 2 | 3, withTalkingPoints: boolean): string {
  const tp = withTalkingPoints ? `

After the stories, output one <talking_points> block:

<talking_points>
<point>One short, concrete line the AE could open a call with, grounded in the news above.</point>
<point>A second angle, ideally tying news to a Salesforce / CRM / digital-transformation thread.</point>
</talking_points>

The talking_points block is REQUIRED. Output 2 to 3 <point> children, each under 25 words, no markdown.` : ''

  return `

Output up to ${storyCount} <story> blocks (and the talking_points block where required) in this exact XML format, with no other text outside the tags:

<story>
<title>Article title in sentence case, max 12 words.</title>
<date>YYYY-MM-DD publication date of the article.</date>
<what>One sentence under 25 words summarising what the article reports about this company. Factual, not editorial.</what>
<impact>One sentence under 25 words: a sales-relevant conversation hook. Concrete and applied; how the AE could use this as an opener with the customer.</impact>
<source>https://full-direct-url-to-the-original-article</source>
</story>${tp}

Hard rules:
- Wrap each story in <story>...</story> with one each of <title>, <date>, <what>, <impact>, <source> as children.
- Output up to ${storyCount} stories. Prefer fewer high-quality stories from the last 30 days over padding the count with weaker matches. If you can only justify 1 story, output 1. If nothing reputable from the last 30 days qualifies, output zero stories${withTalkingPoints ? ' and omit the talking_points block too' : ''} — that is a valid response.
- Every story MUST be from the last 30 days.
- <date> MUST be the article's publication date in ISO YYYY-MM-DD format (e.g. 2026-04-19). If the article shows only month and year, use the 1st of that month. Never invent a date.
- Title is plain text, sentence case, no markdown, no bold markers, capped at 12 words.
- <what> and <impact> are plain text, single sentence each, under 25 words. No markdown, no bold, no inline citations.
- <source> must be a single direct URL to the original news article (not a search results page, not a homepage).
- If you output any stories, your first character must be the < of the first <story>${withTalkingPoints ? ', and your last character must be the > of </talking_points>' : ', and your last character must be the > of the last </story>'}. No preamble, no framing, no closing line, no separator text between stories, no commentary.
- Punctuation: never use the em-dash character "—" anywhere in your output. Use commas, periods, parentheses, or semicolons. En-dashes "–" only in number or date ranges. Hyphens in compound words like "day-to-day" are fine.`
}

export interface AccountNewsArgs {
  name:               string
  contact?:           string
  notes?:             string
  storyCount:         2 | 3
  withTalkingPoints:  boolean
}

export function fetchAccountNews(args: AccountNewsArgs): Promise<string> {
  const { day, date } = dayInfo()
  const contactLine = args.contact ? `Primary contact: ${args.contact}.` : ''
  const notesLine   = args.notes   ? `Internal notes about this account: ${args.notes}` : ''

  const prompt = `Today is ${day}, ${date}.

You are a research assistant for a Salesforce account executive. The AE covers the company below and uses these briefings to prepare for customer conversations.

Account: ${args.name}.
${contactLine}
${notesLine}

Using web search, find ${args.storyCount} of the most recent and relevant news items about ${args.name} from the last 30 days. Prioritise reputable journalism over the company's own blog. Useful angles include:
- Earnings, financial results, guidance updates
- Leadership changes, key hires, executive moves
- Strategic initiatives, M&A activity, restructuring
- Product launches, partnerships, major deals
- IT and digital transformation signals (cloud spend, CRM choices, AI investments)
- Industry-specific events that affect this company

Frame the <impact> sentence as a sales-relevant conversation hook the AE could lead with on a call.${accountFormatTail(args.storyCount, args.withTalkingPoints)}`

  // Three searches (vs Pulse's two) gives the model headroom to spend one
  // on disambiguation for ambiguous account names (e.g. "Aztec Group")
  // without starving the actual content searches.
  return callPulse(prompt, `account-${args.name.slice(0, 24)}`, { maxSearches: 3 })
}

async function callPulse(
  prompt:   string,
  debugKey: string,
  opts:     { maxSearches?: number } = {},
): Promise<string> {
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
            max_uses: opts.maxSearches ?? 2,
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
    throw new Error(`API ${response.status}${detail ? `: ${detail}` : ''}`)
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
  type SearchResult = { type?: string; url?: string; title?: string; error_code?: string }
  type Block        = {
    type:      string
    text?:     string
    citations?: Citation[]
    // For web_search_tool_result this is normally an array of search hits,
    // but on a search error it's a single object with type
    // 'web_search_tool_result_error' and an error_code field.
    content?:  SearchResult[] | SearchResult
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

  let searchError: string | null = null
  for (const b of blocks) {
    if (b.type === 'text' && Array.isArray(b.citations)) {
      for (const c of b.citations) take(c.url)
    }
    if (b.type === 'web_search_tool_result') {
      if (Array.isArray(b.content)) {
        for (const r of b.content) take(r.url)
      } else if (b.content && typeof b.content === 'object') {
        // Single error object — capture the code so we can surface it.
        searchError = b.content.error_code || 'unknown'
      }
    }
  }

  if (!textContent) {
    throw new Error(
      searchError
        ? `web_search error: ${searchError}`
        : 'Empty response. Model returned no text.',
    )
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

Search reputable technology news sources including TechCrunch, The Verge, Wired, Reuters Technology, the Financial Times and MIT Technology Review for the most important news about Anthropic from the last 30 days. Prefer journalism over Anthropic's own blog so the framing is reportorial, not promotional.

Return the 2 most important stories with a bold headline and 2 sentences of context each.${PULSE_FORMAT_TAIL}`,
    'anthropic',
  )
}

export function fetchPulseAIWorld(): Promise<string> {
  const { day, date } = dayInfo()
  return callPulse(
    `Today is ${day}, ${date}.

Search reputable technology news sources including TechCrunch, The Verge, Wired, MIT Technology Review, VentureBeat and Reuters Technology for the most important AI industry news from the last 30 days. Cover OpenAI, Google DeepMind, Meta AI, Microsoft AI, enterprise AI adoption and significant AI research.

Return the 2 most important stories with a bold headline and 2 sentences of context each.${PULSE_FORMAT_TAIL}`,
    'aiworld',
  )
}

export function fetchPulseTechMarket(): Promise<string> {
  const { day, date } = dayInfo()
  return callPulse(
    `Today is ${day}, ${date}.

Search reputable business and technology sources including the Financial Times, Reuters, BBC Business, TechCrunch and VentureBeat for the most important technology market and business news from the last 30 days relevant to a senior account executive selling enterprise technology in the UK.

Return the 2 most important stories with a bold headline and 2 sentences of context each.${PULSE_FORMAT_TAIL}`,
    'techmarket',
  )
}
