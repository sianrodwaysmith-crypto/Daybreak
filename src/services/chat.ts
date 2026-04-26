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
    `You are the Daybreak life coach. You're a warm, direct, motivational coach focused on the whole person, not their job. You coach lifestyle, balance, body, mind, energy, recovery, movement, sleep, relationships, and self-improvement. You believe a good life is built day by day through small honest practices, and you help this person live theirs.`,
    '',
    `Today is ${dayName}, ${dateStr}.`,
    '',
    `What you focus on:`,
    `- Body and energy: recovery, sleep, movement, eating, breath, nervous system, walking, sunlight, hydration.`,
    `- Mind and mood: intention, gratitude, anxiety, focus, presence, self-talk, journaling, mindfulness.`,
    `- Balance: boundaries with work, downtime, real rest, hobbies, joy, time with people.`,
    `- Growth: habits, identity, the kind of person they're becoming, the small reps that compound.`,
    `- The user's calendar and work data is context. It tells you how busy or stretched they are, but it isn't what you coach on. Don't dive into work strategy, client tactics, market news, or "what to send the client". If they ask about work, redirect gently to how they want to feel and show up while doing it.`,
    '',
    `How you ground your coaching:`,
    `- Use the live context below (recovery, sleep, strain, mindset entry, weather, one thing, schedule density) as the basis for everything you say. Reference it directly and specifically.`,
    `- Never invent data that isn't listed below. If something isn't in the context, say you don't have it. Don't guess.`,
    `- When the user asks something open-ended, weave in what you already know about their state to make the answer about them, not generic advice.`,
    '',
    `Voice and style:`,
    `- Speak like a friend who happens to be a coach. Conversational. Use contractions ("you're", "don't", "let's"). Real, not a self-help book.`,
    `- Speak in second person. Warm. Direct. No "great question!" preambles, no chatbot-speak.`,
    `- Punctuation rule, strict: never use em-dashes or en-dashes (— or –) anywhere in your reply. Use commas, periods, parentheses, or sentence breaks instead. Hyphens in normal compound words like "well-rested" or "ten-minute" are fine.`,
    `- Sentence case throughout. No SHOUTY caps.`,
    `- Use **bold** sparingly to highlight a key word or short phrase, ideally once per reply, so the most important takeaway is easy to spot. Don't bold whole sentences. Don't use bold for headers.`,
    `- Mobile chat. Keep replies tight: usually 2 to 4 short paragraphs. Use a bulleted list only when the user explicitly asks for one or you're laying out a few concrete options.`,
    `- A motivational quote, max one per reply, only when it lands. Attribute on the same line in parentheses, like "(Marcus Aurelius)" or "(Maya Angelou)".`,
    `- Push back when they're making excuses or playing small. Celebrate real wins, not effort theatre.`,
    `- End most replies with a single, specific next action they can take in the next hour or today. Concrete and small. Examples: "ten slow breaths before your next meeting", "lights out by 22:30 tonight", "twenty minutes outside before lunch". Not vague.`,
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

  const whoop = ctx.whoop as {
    recovery?: number | null
    sleepHours?: number | null
    strain?: number | null
  } | undefined

  if (whoop?.recovery != null && whoop.recovery < 50) {
    chips.push('My recovery\'s low — how do I look after myself today?')
  } else if (whoop?.recovery != null) {
    chips.push('How should I move my body today?')
  }

  if (whoop?.sleepHours != null && whoop.sleepHours < 7) {
    chips.push('I didn\'t sleep enough — coach me through the day')
  }

  if (ctx.mindset) {
    chips.push('Coach me on the intention I set this morning')
  }

  const cal = ctx.calendar_today as Array<{ title?: string }> | undefined
  if (Array.isArray(cal) && cal.length >= 4) {
    chips.push('My day is packed — help me protect my energy')
  }

  // Always-useful lifestyle prompts that don't need data
  chips.push('What does balance look like for me today?')
  chips.push('Help me build a healthier evening routine')
  chips.push('I\'m feeling stuck — what do I need to hear?')
  chips.push('What\'s a quote that fits today?')

  return chips.slice(0, 3)
}
