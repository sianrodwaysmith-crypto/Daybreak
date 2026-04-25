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
  body:     string
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
 * Splits the model output into stories. Sources can come from three places,
 * in priority order: an explicit "Source: <url>" line within the story; an
 * inline URL anywhere in the body; or a trailing "Sources: \n- <url>" block
 * the service appended from web_search citations.
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
    .map((block, i) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length === 0) return null

      let headline = ''
      const bodyParts: string[] = []
      let url: string | null = null

      for (const line of lines) {
        const sourceLine = line.match(/^source\s*:?\s*(.+)$/i)
        if (sourceLine) {
          const u = sourceLine[1].match(/https?:\/\/[^\s)>\]]+/)
          if (u) url = cleanUrl(u[0])
          continue
        }
        if (!headline) {
          const bolded = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/)
          headline = bolded ? bolded[1] : line.replace(/^\*\*|\*\*$/g, '')
          continue
        }
        bodyParts.push(line.replace(/\*\*/g, ''))
      }

      let body = bodyParts.join(' ').trim()

      // If we still don't have a URL, look for any inline URL in the body
      if (!url) {
        const inline = body.match(/https?:\/\/[^\s)>\]]+/)
        if (inline) {
          url = cleanUrl(inline[0])
          body = body.replace(inline[0], '').trim().replace(/\s+([.,;])/g, '$1')
        }
      }

      // Or fall back to the i-th URL from the citations block
      if (!url && fallbackUrls[i]) url = fallbackUrls[i]

      if (!headline && !body) return null
      return { headline, body, url }
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
          <span className="pulse-error-text">Couldn't fetch live content.</span>
          <button className="pulse-retry-btn" onClick={onRetry}>↻ Retry</button>
        </div>
      )}

      {!state.loading && !state.error && state.content && (
        <div className="pulse-card-list">
          {parseStories(state.content).map((story, i) => {
            const inner = (
              <>
                <h3 className="pulse-headline">{story.headline}</h3>
                {story.body && <p className="pulse-body">{story.body}</p>}
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
