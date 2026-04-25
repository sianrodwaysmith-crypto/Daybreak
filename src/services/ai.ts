const MODEL    = 'claude-sonnet-4-20250514'
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

export function fetchDeepWork(score: number): Promise<string> {
  const { day, date } = dayInfo()
  const label = score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'moderate'
  return callClaude(
    'You are a deep work and productivity coach. Be direct, practical, and specific.',
    `Today is ${day}, ${date}. My readiness score is ${score} (${label}).

Give me a deep work strategy with two sections:

AI STRATEGY
[3-4 sentences of personalised advice — when to schedule deep work, what cognitive tasks suit this energy level, how to protect focus]

FOCUS PROTOCOL
[6-8 specific tactical items separated by · on a single line]`,
  )
}

export function fetchClientBrief(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are an executive assistant briefing a consultant. Be concise, professional, and action-oriented.',
    `Today is ${day}, ${date}. My active client is Aztec, working on Salesforce CRM digital transformation, Phase 2 (Integration), deadline 15 May 2026, status On Track. Key contact: James Henderson (CPO). Also active: Salesforce — Discovery Phase, contact Rachel Ng.

Using web search, find any relevant news about Salesforce or enterprise CRM today, then give me a brief with two sections:

TODAY'S PRIORITIES
→ [first specific actionable task]
→ [second specific actionable task]
→ [third specific actionable task]

CLIENT CONTEXT
[2-3 sentences of relevant background or news that affects today's work]`,
    true,
  )
}

const PULSE_FORMAT = `Surface the 2 most important stories. For each, use this exact format on two lines:

**Headline in sentence case**
Two sentences of context — what happened and why it matters.

Two stories total. Leave a blank line between stories. No other commentary, no preamble, no closing remarks.`

export function fetchPulseAnthropic(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are a sharp AI industry analyst tracking Anthropic. Be accurate, succinct, and prioritise importance.',
    `Today is ${day}, ${date}. Using web search, find the latest news specifically about Anthropic — new model releases, research papers, product announcements, company news, or safety updates. Prioritise stories from the last 48 hours; if nothing significant in 48 hours, expand up to the last 7 days.

${PULSE_FORMAT}`,
    true,
  )
}

export function fetchPulseAIWorld(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are a sharp AI industry analyst covering the broader AI ecosystem. Be accurate, succinct, and prioritise importance.',
    `Today is ${day}, ${date}. Using web search, find the most important AI industry news from the last 48 hours, excluding Anthropic — covering OpenAI, Google DeepMind, Meta AI, Mistral, new research, AI regulation, or enterprise AI adoption trends.

${PULSE_FORMAT}`,
    true,
  )
}

export function fetchPulseTechMarket(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are a concise tech-market and business analyst briefing a senior account executive who sells enterprise technology. Focus on what affects deals, budgets, and go-to-market strategy.',
    `Today is ${day}, ${date}. Using web search, find the most important technology market and business news from the last 48 hours — big tech earnings, enterprise software deals, VC funding in AI, UK and global tech market movements, anything relevant to a senior AE selling tech.

${PULSE_FORMAT}`,
    true,
  )
}
