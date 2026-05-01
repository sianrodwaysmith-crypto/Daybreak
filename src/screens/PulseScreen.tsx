import type { TileAI } from '../hooks/useAIContent'
import { formatRelativeDate, dateFromUrl } from '../clients/parse'

interface Props {
  anthropic: TileAI
  techMkt:   TileAI
  onRetrySection: (id: 'pulse-anthropic' | 'pulse-tech') => void
  onRefreshAll:   () => void
}

interface Story {
  headline: string
  date:     string | null
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

/**
 * Extracts each <story> block from the model's XML output. Falls back to
 * the trailing 'Sources:' block (appended server-side from web_search
 * citations) for stories whose <source> tag is missing or unparseable.
 *
 * We switched from markdown-with-labels to XML because the markdown
 * variants the model produced (bold headlines + sometimes-bolded labels +
 * sometimes-blank-line separators + heading markers) created an arms race
 * of brittle regex fixes. XML tags give us one shape per field, no
 * ambiguity, and the parser becomes a few lines.
 */
function parseStories(raw: string): Story[] {
  let text = raw

  // Pull off the trailing Sources block (server-appended web_search URLs)
  // before extracting stories so it doesn't pollute matching.
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

  function extract(inner: string, tag: string): string {
    const m = inner.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    return m ? stripInline(m[1]).trim() : ''
  }

  const stories: Story[] = []
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

    const dateMatch = dateRaw.match(/(\d{4}-\d{2}-\d{2})/)
    const date = (dateMatch ? dateMatch[1] : null) ?? dateFromUrl(url)

    if (!headline && !what && !impact) { i += 1; continue }
    stories.push({ headline, date, what, impact, body: '', url })
    i += 1
  }

  return stories
}

interface SectionProps {
  label:   string
  state:   TileAI
  onRetry: () => void
}

/* --------------------------------------------------------------------
   Error classification. Anthropic's own error bodies tend to read like
   "Number of tokens has exceeded your per-minute rate limit", which the
   Pulse error card displays verbatim and reads to the user as if they
   are out of usage. Map the recognisable shapes to friendlier copy;
   fall back to the raw message when unfamiliar.
-------------------------------------------------------------------- */
function isRateLimited(msg: string | null): boolean {
  if (!msg) return false
  return /\b429\b|rate[-_ ]?limit|tokens per minute|tokens per day|requests per minute/i.test(msg)
}
function isOutOfCredit(msg: string | null): boolean {
  if (!msg) return false
  return /credit balance|insufficient quota|insufficient credit|payment required|\b402\b/i.test(msg)
}
function isAuthFailure(msg: string | null): boolean {
  if (!msg) return false
  return /\b401\b|invalid api key|authentication/i.test(msg)
}
function errorHeadline(msg: string | null): string {
  if (isOutOfCredit(msg)) return 'Out of API credit.'
  if (isAuthFailure(msg)) return "Pulse can't authenticate with Anthropic."
  if (isRateLimited(msg)) return 'Pulse is briefly rate-limited.'
  return "Couldn't fetch live content."
}
function errorDetail(msg: string | null): string {
  if (isOutOfCredit(msg)) return 'Top up your Anthropic balance and refresh.'
  if (isAuthFailure(msg)) return 'Check the API key in environment variables.'
  if (isRateLimited(msg)) return 'Try again in about a minute. This usually clears itself.'
  return msg ?? 'Try again, or check the network.'
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
            <span className="pulse-error-text">{errorHeadline(state.errorMsg)}</span>
            <span className="pulse-error-detail">{errorDetail(state.errorMsg)}</span>
          </div>
          <button className="pulse-retry-btn" onClick={onRetry}>↻ Retry</button>
        </div>
      )}

      {!state.loading && !state.error && state.content && (
        <div className="pulse-card-list">
          {parseStories(state.content).map((story, i) => {
            const hasStructured = story.what || story.impact
            const relDate = formatRelativeDate(story.date)
            const inner = (
              <>
                {relDate && <div className="pulse-date">{relDate}</div>}
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

function isToday(ms: number, now: Date = new Date()): boolean {
  const d = new Date(ms)
  return d.getFullYear() === now.getFullYear()
      && d.getMonth()    === now.getMonth()
      && d.getDate()     === now.getDate()
}

/**
 * Pulse calls are the most API-credit-expensive thing in the app
 * (web_search × 3 sections per refresh). When all three sections
 * already have today's content cached and didn't error, suppress the
 * Refresh button so an accidental tap can't spend more credit on
 * content that's already there. The auto-load on the next calendar
 * day will refresh things naturally; users who really need to force
 * a refetch can clear PWA storage as the power-user escape hatch.
 */
function allFreshToday(states: TileAI[]): boolean {
  return states.every(s => !!s.content && !s.error && s.fetchedAt != null && isToday(s.fetchedAt))
}

export default function PulseScreen({ anthropic, techMkt, onRetrySection, onRefreshAll }: Props) {
  const updated    = lastUpdated([anthropic, techMkt])
  const anyLoading = anthropic.loading || techMkt.loading
  const freshToday = allFreshToday([anthropic, techMkt])

  return (
    <div className="pulse-screen">
      <div className="pulse-toolbar">
        <span className="pulse-toolbar-meta">
          {updated ? `Updated ${formatTime(updated)}` : 'Updating…'}
        </span>
        {freshToday ? (
          <span className="pulse-fresh-pill" aria-label="Pulse is up to date for today">
            Up to date · refreshes tomorrow
          </span>
        ) : (
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
      <Section label="Tech market" state={techMkt}   onRetry={() => onRetrySection('pulse-tech')} />
    </div>
  )
}
