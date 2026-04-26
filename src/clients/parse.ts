/* ====================================================================
   Account-news XML parser.
   Same <story> shape as Pulse plus an optional <talking_points> block
   that focus accounts get. Kept here rather than next to Pulse so the
   accounts module is self-contained.
==================================================================== */

export interface NewsStory {
  headline: string
  date:     string | null   // YYYY-MM-DD
  what:     string
  impact:   string
  url:      string | null
}

export interface ParsedNews {
  stories:       NewsStory[]
  talkingPoints: string[]
}

function stripInline(s: string): string {
  return s
    .replace(/\[\s*(?:source\s*)?\d+(?:\s*,\s*\d+)*\s*\]/gi, '')
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, '$1')
    .replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, '$1')
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function cleanUrl(raw: string): string {
  return raw.replace(/[).,;]+$/, '')
}

function extract(inner: string, tag: string): string {
  const m = inner.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? stripInline(m[1]).trim() : ''
}

export function parseAccountNews(raw: string): ParsedNews {
  let text = raw

  // Strip any trailing 'Sources:' block the server may have appended
  // from web_search citations so it doesn't pollute story matching.
  const fallbackUrls: string[] = []
  const sourcesMatch = text.match(/\n\s*sources?\s*:?\s*\n([\s\S]+)$/i)
  if (sourcesMatch) {
    const list = sourcesMatch[1]
      .split('\n')
      .map(l => l.replace(/^[-*•]\s*/, '').trim())
      .map(l => l.match(/https?:\/\/\S+/)?.[0] ?? '')
      .filter(Boolean)
      .map(cleanUrl)
    fallbackUrls.push(...list)
    text = text.slice(0, sourcesMatch.index).trim()
  }

  const stories: NewsStory[] = []
  const storyRe = /<story[^>]*>([\s\S]*?)<\/story>/gi
  let m: RegExpExecArray | null
  let i = 0
  while ((m = storyRe.exec(text)) !== null) {
    const inner    = m[1]
    const headline = extract(inner, 'title')
    const dateRaw  = extract(inner, 'date')
    const what     = extract(inner, 'what')
    const impact   = extract(inner, 'impact')
    const sourceText = extract(inner, 'source')

    let url: string | null = null
    const urlMatch = sourceText.match(/https?:\/\/[^\s)>\]]+/)
    if (urlMatch) url = cleanUrl(urlMatch[0])
    if (!url && fallbackUrls[i]) url = fallbackUrls[i]

    const date = parseISODate(dateRaw)

    if (!headline && !what && !impact) { i += 1; continue }
    stories.push({ headline, date, what, impact, url })
    i += 1
  }

  const tpBlock = text.match(/<talking_points[^>]*>([\s\S]*?)<\/talking_points>/i)
  const talkingPoints: string[] = []
  if (tpBlock) {
    const pointRe = /<point[^>]*>([\s\S]*?)<\/point>/gi
    let p: RegExpExecArray | null
    while ((p = pointRe.exec(tpBlock[1])) !== null) {
      const t = stripInline(p[1]).trim()
      if (t) talkingPoints.push(t)
    }
  }

  return { stories, talkingPoints }
}

export function hostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

/* ------------------------------------------------------------------
   Date helpers — accept ISO YYYY-MM-DD from the model, fall back to
   any trailing junk by extracting the first matching pattern. Bad
   dates collapse to null so the UI can simply hide them.
------------------------------------------------------------------ */
function parseISODate(raw: string): string | null {
  if (!raw) return null
  const m = raw.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return null
  const [_, y, mo, d] = m
  const date = new Date(`${y}-${mo}-${d}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return null
  return `${y}-${mo}-${d}`
}

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/**
 * "today" / "yesterday" / "5 days ago" / "Apr 12" depending on age,
 * so the AE can judge freshness at a glance without parsing dates
 * themselves.
 */
export function formatRelativeDate(iso: string | null, now: Date = new Date()): string | null {
  if (!iso) return null
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const [_, y, mo, d] = m
  const then = new Date(Number(y), Number(mo) - 1, Number(d))
  if (Number.isNaN(then.getTime())) return null
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.round((today.getTime() - then.getTime()) / (24 * 60 * 60 * 1000))
  if (days === 0)  return 'today'
  if (days === 1)  return 'yesterday'
  if (days > 0 && days < 14) return `${days} days ago`
  if (days >= 14) {
    const monthSame = then.getFullYear() === today.getFullYear()
    return monthSame
      ? `${SHORT_MONTHS[then.getMonth()]} ${then.getDate()}`
      : `${SHORT_MONTHS[then.getMonth()]} ${then.getDate()}, ${then.getFullYear()}`
  }
  // Future-dated (model error): fall back to absolute.
  return `${SHORT_MONTHS[then.getMonth()]} ${then.getDate()}`
}
