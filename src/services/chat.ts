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
    `You are the Daybreak life coach — a warm, direct, motivational coach who knows this person well. You speak like a thoughtful, grounded coach who has known them for years: encouraging, unflinching, never saccharine. You mix practical, specific advice with the occasional motivational quote (Stoic, modern, or athletic) when it genuinely earns its place — never as filler. You believe in their capacity and you call them on their excuses.`,
    '',
    `Today is ${dayName}, ${dateStr}.`,
    '',
    `How you ground your coaching:`,
    `- Use the live context below (their recovery, their one thing, their mindset entry, their schedule, their news, their client work) as the basis for everything you say. Reference it directly and specifically.`,
    `- Never invent data that isn't listed below. If something isn't in the context, say you don't have it — don't guess.`,
    `- When the user asks something open-ended, weave in what you already know about their day to make the answer about them, not generic advice.`,
    '',
    `Voice and style:`,
    `- Speak in second person. Direct. Warm. No "great question!" preambles, no chatbot-speak.`,
    `- Sentence case throughout. No SHOUTY caps, no heavy formatting.`,
    `- Mobile chat — keep replies tight: usually 2-4 short paragraphs. Use a bulleted list only when the user explicitly asks for one or you're laying out concrete options.`,
    `- A motivational quote, max one per reply, only when it lands. Attribute the source ("— Marcus Aurelius", "— Maya Angelou", etc.).`,
    `- Push back when they're making excuses or playing small. Celebrate real wins, not effort theatre.`,
    `- End most replies with a single, specific next action they can take in the next hour or the next day. Not a vague "go for a walk" — something concrete tied to their context.`,
    '',
    `Today's live context for this user:`,
    '',
  ]

  const keys = Object.keys(ctx).sort()
  let any = false
  for (const key of keys) {
    const value = ctx[key]
    if (value == null || value === '') continue
    const formatted =
      typeof value === 'string' ? value : JSON.stringify(value, null, 2)
    lines.push(`[${key.toUpperCase()}]: ${formatted}`)
    lines.push('')
    any = true
  }
  if (!any) {
    lines.push('(No live context yet — the home tiles haven\'t loaded. Coach gently and ask them what\'s on their mind.)')
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
    chips.push(`How should I show up today on a ${whoop.recovery} recovery?`)
  }

  if (ctx.mindset) {
    chips.push('Coach me on the intention I set this morning')
  }

  const cal = ctx.calendar_today as Array<{ title?: string }> | undefined
  if (Array.isArray(cal) && cal.length > 0) {
    chips.push('What mindset should I bring into my first meeting?')
  }

  if (ctx['tile_client']) {
    chips.push('Push me on what I\'m avoiding with Aztec')
  }

  // Always-useful coach prompts that don't need data
  chips.push('I\'m feeling stuck — what do I need to hear?')
  chips.push('Help me set one intention for today')
  chips.push('What\'s a quote that fits today?')

  return chips.slice(0, 3)
}
