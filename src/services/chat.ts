const MODEL    = 'claude-sonnet-4-6'
const ENDPOINT = 'https://api.anthropic.com/v1/messages'

export interface ChatMessage {
  role:    'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onDelta:    (text: string) => void
  onComplete: () => void
  onError:    (err: Error) => void
}

/**
 * Build the system prompt by iterating over whatever's currently in the
 * DayBreak context store. Adding new tiles in future just means writing
 * to the store via registerContent — no changes here needed.
 */
export function buildSystemPrompt(ctx: Record<string, unknown>): string {
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const now = new Date()
  const dayName = DAYS[now.getDay()]
  const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  const lines = [
    `You are DayBreak, a personal AI assistant. You have context about the user's day from their morning briefing app. Only reference data that is explicitly provided below — do not make up or assume anything that is not listed. Be direct, specific and concise — this is a mobile chat. Use bullet points for anything with more than two points. Today is ${dateStr}, ${dayName}.`,
    '',
  ]

  const keys = Object.keys(ctx).sort()
  for (const key of keys) {
    const value = ctx[key]
    if (value == null || value === '') continue
    const formatted =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    lines.push(`[${key.toUpperCase()}]: ${formatted}`)
    lines.push('')
  }

  return lines.join('\n').trim()
}

export async function streamChat(
  messages: ChatMessage[],
  system:   string,
  cb:       StreamCallbacks,
  signal?:  AbortSignal,
): Promise<void> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined
  if (!apiKey) {
    cb.onError(new Error('VITE_ANTHROPIC_API_KEY is missing'))
    return
  }

  let res: Response
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type':                              'application/json',
        'x-api-key':                                  apiKey,
        'anthropic-version':                          '2023-06-01',
        'anthropic-dangerous-direct-browser-access':  'true',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: 1024,
        stream:     true,
        system,
        messages,
      }),
      signal,
    })
  } catch (e) {
    cb.onError(e instanceof Error ? e : new Error(String(e)))
    return
  }

  if (!res.ok || !res.body) {
    const text = res.body ? await res.text().catch(() => '') : ''
    cb.onError(new Error(`API ${res.status}${text ? `: ${text.slice(0, 200)}` : ''}`))
    return
  }

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE events are separated by blank lines; each event has data: lines.
      const events = buffer.split('\n\n')
      buffer = events.pop() ?? ''

      for (const event of events) {
        const dataLine = event.split('\n').find(l => l.startsWith('data: '))
        if (!dataLine) continue
        const dataStr = dataLine.slice(6).trim()
        if (!dataStr || dataStr === '[DONE]') continue

        try {
          const parsed = JSON.parse(dataStr)
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            cb.onDelta(parsed.delta.text as string)
          }
        } catch {
          // ignore malformed events — the API is generally well-behaved
        }
      }
    }
    cb.onComplete()
  } catch (e) {
    if ((e as Error).name === 'AbortError') {
      cb.onComplete()
      return
    }
    cb.onError(e instanceof Error ? e : new Error(String(e)))
  }
}

export function suggestChips(ctx: Record<string, unknown>): string[] {
  const chips: string[] = []
  const whoop = ctx.whoop as { recovery?: number | null; sleepHours?: number | null } | undefined
  if (whoop?.recovery != null) {
    chips.push(`What does my recovery of ${whoop.recovery} mean for today?`)
  }
  const cal = ctx.calendar_today as Array<{ title?: string }> | undefined
  if (Array.isArray(cal) && cal.length > 0) {
    chips.push('Help me prep for my first meeting today')
  }
  if (ctx['tile_pulse-anthropic']) {
    chips.push("What's the most important Anthropic news today?")
  } else if (ctx['tile_pulse-aiworld']) {
    chips.push("What's the biggest AI story right now?")
  } else if (ctx['tile_pulse-tech']) {
    chips.push("What's moving the tech market today?")
  }
  if (ctx.mindset) {
    chips.push('Reflect back what I shared in my mindset check-in')
  }
  if (ctx['tile_client']) {
    chips.push("What's my top priority for Aztec today?")
  }

  if (chips.length === 0) {
    return [
      'How should I structure my morning?',
      'Help me focus today',
      'Give me a productivity tip',
    ]
  }
  return chips.slice(0, 3)
}
