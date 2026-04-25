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

function parseStories(text: string): Story[] {
  const blocks = text.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean)
  return blocks
    .map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length === 0) return null

      let headline = ''
      const bodyParts: string[] = []
      let url: string | null = null

      for (const line of lines) {
        const sourceMatch = line.match(/^source\s*:?\s*(.+)$/i)
        if (sourceMatch) {
          const urlMatch = sourceMatch[1].match(/https?:\/\/[^\s)>\]]+/)
          if (urlMatch) url = urlMatch[0].replace(/[).,;]+$/, '')
          continue
        }
        if (!headline) {
          const bolded = line.match(/^\*\*(.+?)\*\*\s*:?\s*$/)
          headline = bolded ? bolded[1] : line.replace(/^\*\*|\*\*$/g, '')
          continue
        }
        bodyParts.push(line.replace(/\*\*/g, ''))
      }

      const body = bodyParts.join(' ').trim()
      if (!headline && !body) return null
      return { headline, body, url }
    })
    .filter((s): s is Story => s !== null)
}

interface SectionProps {
  label:     string
  accent:    string
  emoji:     string
  state:     TileAI
  onRetry:   () => void
}

function Section({ label, accent, emoji, state, onRetry }: SectionProps) {
  return (
    <section className="pulse-section">
      <div className="pulse-section-head">
        <span className="pulse-section-accent" style={{ background: accent }} aria-hidden />
        <span className="pulse-section-emoji" aria-hidden>{emoji}</span>
        <span className="pulse-section-label" style={{ color: accent }}>{label}</span>
      </div>

      {state.loading && (
        <div className="pulse-story-card pulse-story-loading">
          <span className="pulse-skel pulse-skel-headline" />
          <span className="pulse-skel pulse-skel-line" />
          <span className="pulse-skel pulse-skel-line pulse-skel-line-short" />
        </div>
      )}

      {!state.loading && state.error && (
        <div className="pulse-story-card pulse-story-error">
          <div className="pulse-error-text">Could not fetch live content</div>
          <button
            className="pulse-retry-btn"
            style={{ color: accent, borderColor: `${accent}55` }}
            onClick={onRetry}
          >
            ↻ Retry
          </button>
        </div>
      )}

      {!state.loading && !state.error && state.content && (
        <div className="pulse-story-list">
          {parseStories(state.content).map((story, i) => {
            const headlineNode = (
              <h3 className="pulse-story-headline">
                {story.headline}
                {story.url && <span className="pulse-story-arrow" aria-hidden> ↗</span>}
              </h3>
            )
            const bodyNode = story.body && <p className="pulse-story-body">{story.body}</p>
            const sourceNode = story.url && (
              <span className="pulse-story-source">{hostname(story.url)}</span>
            )

            if (story.url) {
              return (
                <a
                  key={i}
                  className="pulse-story-card pulse-story-link"
                  href={story.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ borderLeftColor: accent }}
                >
                  {headlineNode}
                  {bodyNode}
                  {sourceNode}
                </a>
              )
            }
            return (
              <article key={i} className="pulse-story-card" style={{ borderLeftColor: accent }}>
                {headlineNode}
                {bodyNode}
              </article>
            )
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
  const timestamps = states.map(s => s.fetchedAt).filter((t): t is number => t != null)
  if (timestamps.length === 0) return null
  return Math.min(...timestamps)
}

export default function PulseScreen({ anthropic, aiWorld, techMkt, onRetrySection, onRefreshAll }: Props) {
  const updated     = lastUpdated([anthropic, aiWorld, techMkt])
  const anyLoading  = anthropic.loading || aiWorld.loading || techMkt.loading

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

      <Section
        label="ANTHROPIC"
        emoji="◆"
        accent="#a78bfa"
        state={anthropic}
        onRetry={() => onRetrySection('pulse-anthropic')}
      />
      <Section
        label="AI WORLD"
        emoji="✦"
        accent="#64b5f6"
        state={aiWorld}
        onRetry={() => onRetrySection('pulse-aiworld')}
      />
      <Section
        label="TECH MARKET"
        emoji="▲"
        accent="#4ade80"
        state={techMkt}
        onRetry={() => onRetrySection('pulse-tech')}
      />
    </div>
  )
}
