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

export function fetchStoic(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are a Stoic philosophy expert. Write in a calm, precise, inspiring tone. Keep responses concise.',
    `Today is ${day}, ${date}. Give me a morning Stoic briefing with four sections. Format exactly as shown:

QUOTE
"[one powerful Stoic quote]" — [Author] · [Work]

TODAY'S PRINCIPLE
[2-3 sentences on a Stoic principle to carry into the day]

MORNING EXERCISE
[2-3 sentences describing a specific Stoic practice for this morning]

EVENING REFLECTION
[2-3 sentences with questions to ask at day's end]`,
  )
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

export function fetchBusinessPulse(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are a concise financial and business news briefer. Be accurate and succinct.',
    `Today is ${day}, ${date}. Using web search, find today's actual market data and top business stories.

Give me a briefing with two sections:

MARKETS
[S&P 500 · value · change]
[NASDAQ · value · change]
[BTC/USD · value · change]
[GBP/USD · value · change]

TOP STORIES
[Source] Headline of today's top story
[Source] Headline of second story
[Source] Headline of third story
[Source] Headline of fourth story`,
    true,
  )
}

export function fetchAIBriefing(): Promise<string> {
  const { day, date } = dayInfo()
  return callClaude(
    'You are an AI industry analyst. Cover the latest AI and technology news accurately and concisely.',
    `Today is ${day}, ${date}. Using web search, find today's actual AI and technology news.

Give me 4 AI news items. For each use this exact format:
[SOURCE TAG IN CAPS]
Headline in sentence case
Two-sentence summary.

Cover one Anthropic story, one OpenAI story, one Google DeepMind story, and one broader AI industry story.`,
    true,
  )
}

export function fetchTodaysFocus(score: number): Promise<string> {
  const { day, date } = dayInfo()
  const label = score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'moderate'
  return callClaude(
    'You are a productivity coach who helps professionals identify their single most important priority. Be direct and motivating.',
    `Today is ${day}, ${date}. My readiness is ${score} (${label}). My active project is Aztec Salesforce CRM integration, Phase 2, deadline 15 May 2026.

Give me a focus brief with three sections:

TODAY'S SINGLE PRIORITY
[one sentence — the single most important thing to accomplish today]

SUPPORTING TASKS
→ [first supporting task]
→ [second supporting task]
→ [third supporting task]
→ [fourth supporting task]

WHY THIS MATTERS
[2-3 sentences on the stakes and leverage of this priority]`,
  )
}
