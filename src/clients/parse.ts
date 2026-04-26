/* ====================================================================
   Account-news XML parser.
   Same <story> shape as Pulse plus an optional <talking_points> block
   that focus accounts get. Kept here rather than next to Pulse so the
   accounts module is self-contained.
==================================================================== */

export interface NewsStory {
  headline: string
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
    const what     = extract(inner, 'what')
    const impact   = extract(inner, 'impact')
    const sourceText = extract(inner, 'source')

    let url: string | null = null
    const urlMatch = sourceText.match(/https?:\/\/[^\s)>\]]+/)
    if (urlMatch) url = cleanUrl(urlMatch[0])
    if (!url && fallbackUrls[i]) url = fallbackUrls[i]

    if (!headline && !what && !impact) { i += 1; continue }
    stories.push({ headline, what, impact, url })
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
