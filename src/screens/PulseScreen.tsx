import type { TileAI } from '../hooks/useAIContent'

interface Props {
  anthropic: TileAI
  aiWorld:   TileAI
  techMkt:   TileAI
  onRetrySection: (id: 'pulse-anthropic' | 'pulse-aiworld' | 'pulse-tech') => void
  onRefreshAll:   () => void
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

function stripBold(s: string): string {
  return s.replace(/\*\*/g, '').trim()
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
          const bolded = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/)
          headline = bolded ? bolded[1] : stripBold(line)
          continue
        }
        otherLines.push(stripBold(line))
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
        <div className="pulse-card pulse-card-loading">
          <span className="pulse-skel pulse-skel-headline" />
          <span className="pulse-skel pulse-skel-line" />
          <span className="pulse-skel pulse-skel-line pulse-skel-line-short" />
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
                  <span className="pulse-source">
                    {hostname(story.url)} <span aria-hidden>↗</span>
                  </span>
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

export default function PulseScreen({ anthropic, aiWorld, techMkt, onRetrySection, onRefreshAll }: Props) {
  const updated    = lastUpdated([anthropic, aiWorld, techMkt])
  const anyLoading = anthropic.loading || aiWorld.loading || techMkt.loading

  return (
    <div className="pulse-screen">
      <div className="pulse-toolbar">
        <span className="pulse-toolbar-meta">
          {updated ? `Updated ${formatTime(updated)}` : 'Updating…'}
        </span>
        <button
          onClick={onRefreshAll}
          disabled={anyLoading}
          aria-label="Refresh Pulse"
          className="pulse-refresh-btn"
        >
          <span className={`pulse-refresh-icon${anyLoading ? ' spinning' : ''}`}>↻</span>
          <span>{anyLoading ? 'Refreshing' : 'Refresh'}</span>
        </button>
      </div>

      <Section label="Anthropic"   state={anthropic} onRetry={() => onRetrySection('pulse-anthropic')} />
      <Section label="AI world"    state={aiWorld}   onRetry={() => onRetrySection('pulse-aiworld')} />
      <Section label="Tech market" state={techMkt}   onRetry={() => onRetrySection('pulse-tech')} />
    </div>
  )
}
