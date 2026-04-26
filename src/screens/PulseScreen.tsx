import type { TileAI } from '../hooks/useAIContent'
import { useDay } from '../contexts/DayContext'

interface Props {
  anthropic: TileAI
  aiWorld:   TileAI
  techMkt:   TileAI
  onRetrySection: (id: 'pulse-anthropic' | 'pulse-aiworld' | 'pulse-tech') => void
  onRefreshAll:   () => void
  isHistoric?:    boolean
}

interface Story {
  headline: string
  what:     string
  impact:   string
  body:     string   // fallback when What/Impact are missing
  url:      string | null
}

function hostname(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') }
  catch { return url }
}

function cleanUrl(raw: string): string {
  return raw.replace(/[).,;]+$/, '')
}

/**
 * Cleans up the model's prose:
 * - Removes inline web_search citation markers like [1], [2], [3], [1, 4],
 *   [Source 2], and footnote-style ¹ ² ³.
 * - Strips markdown emphasis tokens that the model occasionally leaks:
 *   double asterisks (**bold**), single asterisks (*italics*), and
 *   underscore italics (_italics_). The text inside is preserved.
 * - Collapses any whitespace those edits leave behind, including the
 *   awkward "  ," / "word ." / "word ?" patterns.
 */
function stripInline(s: string): string {
  return s
    .replace(/\[\s*(?:source\s*)?\d+(?:\s*,\s*\d+)*\s*\]/gi, '') // [1] [Source 2] [1, 4]
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]+/g, '')                              // unicode superscripts
    .replace(/\*\*([^*]+)\*\*/g, '$1')                          // **bold** -> bold
    .replace(/(?<!\w)\*([^*\n]+?)\*(?!\w)/g, '$1')              // *italic* -> italic
    .replace(/(?<!\w)_([^_\n]+?)_(?!\w)/g, '$1')                // _italic_ -> italic
    .replace(/\s+([.,;:!?])/g, '$1')                            // " ," / " ." cleanup
    .replace(/\s{2,}/g, ' ')                                    // collapse runs
    .trim()
}

// Kept as an alias so existing call sites still compile; new behaviour is
// the broader stripInline above.
function stripBold(s: string): string { return stripInline(s) }

/**
 * Sentence splitter that respects common abbreviations and decimals.
 * Returns trimmed sentences, including the trailing punctuation.
 */
function splitSentences(text: string): string[] {
  const out: string[] = []
  // Match runs ending in . ! or ? not preceded by a space-letter abbreviation
  // and not in the middle of a number (1.5).
  const re = /[^.!?]+[.!?]+(?=\s|$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const s = m[0].trim()
    if (s) out.push(s)
  }
  // Trailing fragment with no terminator
  const lastEnd = out.length > 0 ? text.lastIndexOf(out[out.length - 1]) + out[out.length - 1].length : 0
  const tail = text.slice(lastEnd).trim()
  if (tail) out.push(tail)
  return out
}

// Keywords that strongly suggest a sentence is the "so-what" / Impact.
const IMPACT_HINTS = [
  'mean', 'means', 'meaning',
  'matter', 'matters',
  'allow', 'allows', 'enable', 'enables',
  'change', 'changes', 'changing',
  'signal', 'signals', 'signalling',
  'suggest', 'suggests',
  'imply', 'implies',
  'expect', 'expected', 'likely',
  'will ', 'could ', 'may ', 'might ',
  'for users', 'for buyers', 'for consumers', 'for businesses',
  'for the industry', 'for the market', 'for investors',
  'in practice', 'practically', 'puts pressure',
  'raises the bar', 'sets up', 'opens the door',
  'risk', 'risks',
]

function impactScore(sentence: string): number {
  const lower = sentence.toLowerCase()
  let score = 0
  for (const k of IMPACT_HINTS) if (lower.includes(k)) score += 1
  return score
}

/**
 * Picks one sentence from the body to use as the "Impact" line and bundles
 * the rest into "What". Heuristic, in priority order:
 *   1. If body has 0 or 1 sentence, it all becomes What.
 *   2. If exactly 2 sentences, first is What, second is Impact.
 *   3. If 3+ sentences, score each by impact-ish keyword density. The
 *      highest-scoring sentence becomes Impact (preferring later sentences
 *      to break ties — the so-what usually lands at the end). The remainder,
 *      in original order, becomes What.
 */
function synthesiseWhatImpact(body: string): { what: string; impact: string } {
  const sentences = splitSentences(body)
  if (sentences.length === 0) return { what: body.trim(), impact: '' }
  if (sentences.length === 1) return { what: sentences[0], impact: '' }
  if (sentences.length === 2) return { what: sentences[0], impact: sentences[1] }

  let bestIdx = sentences.length - 1   // default to the last sentence
  let bestScore = -1
  sentences.forEach((s, i) => {
    const score = impactScore(s)
    // Prefer later sentences on ties so the so-what tends to be Impact, not setup.
    if (score > bestScore || (score === bestScore && i > bestIdx)) {
      bestScore = score
      bestIdx = i
    }
  })
  const impactSentence = sentences[bestIdx]
  const whatSentences  = sentences.filter((_, i) => i !== bestIdx)
  return { what: whatSentences.join(' '), impact: impactSentence }
}

/**
 * Splits the model output into stories. Each story has a headline, a What
 * sentence, an Impact sentence, and a source URL. URLs are resolved in
 * priority order: explicit "Source: <url>" line → inline URL in the body →
 * i-th URL from the trailing "Sources:" block the service appends from
 * web_search citations.
 */
function parseStories(raw: string): Story[] {
  let text = raw

  // Pull off the trailing Sources block if present
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

  // Strip markdown horizontal-rule separators ("---", "***", "___") that the
  // model sometimes wedges between stories.
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, '')

  // Drop any preamble before the first headline. A headline is the first
  // line that starts with either a bold marker (**) or a markdown heading
  // marker (# / ##). Catches the Anthropic-blog-style '## Title' format.
  const firstHeadline = text.search(/^(?:\*\*.+|#{1,3}\s+.+)/m)
  if (firstHeadline > 0) text = text.slice(firstHeadline)

  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)

  return blocks
    .map((block, i): Story | null => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length === 0) return null

      let headline = ''
      let what     = ''
      let impact   = ''
      const otherLines: string[] = []
      let url: string | null = null

      for (const line of lines) {
        const sourceLine = line.match(/^source\s*:?\s*(.+)$/i)
        if (sourceLine) {
          const u = sourceLine[1].match(/https?:\/\/[^\s)>\]]+/)
          if (u) url = cleanUrl(u[0])
          continue
        }
        const whatLine   = line.match(/^what\s*:\s*(.+)$/i)
        if (whatLine) { what = stripBold(whatLine[1]); continue }
        const impactLine = line.match(/^impact\s*:\s*(.+)$/i)
        if (impactLine) { impact = stripBold(impactLine[1]); continue }

        if (!headline) {
          // Try four headline shapes, in priority order:
          //   1. **Title**                       (the spec)
          //   2. **Title**: subtitle             (Anthropic blog often does this)
          //   3. **Title** subtitle              (no colon, just trailing text)
          //   4. ## Title  / # Title  / ### Title  (markdown heading)
          // Whatever follows the title gets pushed into otherLines so the
          // synthesiser can use it as What/Impact body, instead of being
          // collapsed into the headline.
          const boldOnly      = line.match(/^\*\*(.+?)\*\*\s*$/)
          const boldThenColon = line.match(/^\*\*(.+?)\*\*\s*:\s*(.+)$/)
          const boldThenText  = line.match(/^\*\*(.+?)\*\*\s+(.+)$/)
          const hashHeading   = line.match(/^#{1,3}\s+(.+?)\s*$/)

          if (boldOnly) {
            headline = stripInline(boldOnly[1])
          } else if (boldThenColon) {
            headline = stripInline(boldThenColon[1])
            otherLines.push(stripInline(boldThenColon[2]))
          } else if (boldThenText) {
            headline = stripInline(boldThenText[1])
            otherLines.push(stripInline(boldThenText[2]))
          } else if (hashHeading) {
            headline = stripInline(hashHeading[1])
          } else {
            headline = stripInline(line)
          }
          continue
        }
        otherLines.push(stripInline(line))
      }

      // Fallback body if model didn't follow the What/Impact format
      let body = otherLines.join(' ').trim()

      // If we still don't have a URL, look for any inline URL in the body or
      // What/Impact lines
      if (!url) {
        const haystack = `${body} ${what} ${impact}`
        const inline = haystack.match(/https?:\/\/[^\s)>\]]+/)
        if (inline) {
          const u = cleanUrl(inline[0])
          url = u
          const stripUrl = (s: string) => s.replace(inline[0], '').trim().replace(/\s+([.,;])/g, '$1')
          body   = stripUrl(body)
          what   = stripUrl(what)
          impact = stripUrl(impact)
        }
      }

      if (!url && fallbackUrls[i]) url = fallbackUrls[i]

      // If the model skipped the What:/Impact: labels, synthesise them from
      // the body. We try to pick the sentence that reads as the "so-what"
      // (the impact) and bundle the rest as the "what".
      if (!what && !impact && body) {
        const synth = synthesiseWhatImpact(body)
        what   = synth.what
        impact = synth.impact
        body   = ''
      }

      if (!headline && !what && !impact && !body) return null
      return { headline, what, impact, body, url }
    })
    .filter((s): s is Story => s !== null)
}

interface SectionProps {
  label:   string
  state:   TileAI
  onRetry: () => void
}

function Section({ label, state, onRetry }: SectionProps) {
  return (
    <section className="pulse-section">
      <div className="pulse-section-label">{label}</div>

      {state.loading && (
        <div className="pulse-card-list">
          {/* Two skeleton cards because each section returns two stories,
              so the layout doesn't pop when content lands. */}
          {[0, 1].map(k => (
            <div key={k} className="pulse-card pulse-card-loading">
              <span className="pulse-skel pulse-skel-headline" />
              <span className="pulse-skel pulse-skel-line" />
              <span className="pulse-skel pulse-skel-line pulse-skel-line-short" />
            </div>
          ))}
        </div>
      )}

      {!state.loading && state.error && (
        <div className="pulse-card pulse-card-error">
          <div className="pulse-error-stack">
            <span className="pulse-error-text">Couldn't fetch live content.</span>
            {state.errorMsg && <span className="pulse-error-detail">{state.errorMsg}</span>}
          </div>
          <button className="pulse-retry-btn" onClick={onRetry}>↻ Retry</button>
        </div>
      )}

      {!state.loading && !state.error && state.content && (
        <div className="pulse-card-list">
          {parseStories(state.content).map((story, i) => {
            const hasStructured = story.what || story.impact
            const inner = (
              <>
                <h3 className="pulse-headline">{story.headline}</h3>
                {hasStructured ? (
                  <dl className="pulse-facts">
                    {story.what && (
                      <>
                        <dt className="pulse-fact-label">What</dt>
                        <dd className="pulse-fact-text">{story.what}</dd>
                      </>
                    )}
                    {story.impact && (
                      <>
                        <dt className="pulse-fact-label">Impact</dt>
                        <dd className="pulse-fact-text">{story.impact}</dd>
                      </>
                    )}
                  </dl>
                ) : (
                  story.body && <p className="pulse-body">{story.body}</p>
                )}
                {story.url && (
                  <span className="pulse-source">{hostname(story.url)}</span>
                )}
                {story.url && (
                  <span className="pulse-card-chevron" aria-hidden>↗</span>
                )}
              </>
            )

            if (story.url) {
              return (
                <a
                  key={i}
                  className="pulse-card pulse-card-link"
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              )
            }
            return <article key={i} className="pulse-card">{inner}</article>
          })}
        </div>
      )}
    </section>
  )
}

function formatTime(ms: number): string {
  const d = new Date(ms)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

function lastUpdated(states: TileAI[]): number | null {
  const ts = states.map(s => s.fetchedAt).filter((t): t is number => t != null)
  return ts.length === 0 ? null : Math.min(...ts)
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]
function formatShortDate(d: Date): string {
  return `${SHORT_DAYS[d.getDay()]} ${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}

export default function PulseScreen({ anthropic, aiWorld, techMkt, onRetrySection, onRefreshAll, isHistoric }: Props) {
  const updated    = lastUpdated([anthropic, aiWorld, techMkt])
  const anyLoading = anthropic.loading || aiWorld.loading || techMkt.loading
  const { viewedDate } = useDay()

  return (
    <div className="pulse-screen">
      <div className="pulse-toolbar">
        <span className="pulse-toolbar-meta">
          {isHistoric
            ? `Snapshot · ${formatShortDate(viewedDate)}`
            : updated ? `Updated ${formatTime(updated)}` : 'Updating…'}
        </span>
        {!isHistoric && (
          <button
            onClick={onRefreshAll}
            disabled={anyLoading}
            aria-label="Refresh Pulse"
            className="pulse-refresh-btn"
          >
            <span className={`pulse-refresh-icon${anyLoading ? ' spinning' : ''}`}>↻</span>
            <span>{anyLoading ? 'Refreshing' : 'Refresh'}</span>
          </button>
        )}
      </div>

      <Section label="Anthropic"   state={anthropic} onRetry={() => onRetrySection('pulse-anthropic')} />
      <Section label="AI world"    state={aiWorld}   onRetry={() => onRetrySection('pulse-aiworld')} />
      <Section label="Tech market" state={techMkt}   onRetry={() => onRetrySection('pulse-tech')} />
    </div>
  )
}
