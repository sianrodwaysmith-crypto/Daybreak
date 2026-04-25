import type { TileAI } from '../hooks/useAIContent'
import Markdown from './Markdown'

interface Props {
  state: TileAI
  accent: string
  onRetry: () => void
}

export default function AIBlock({ state, accent, onRetry }: Props) {
  if (state.loading) {
    return (
      <div className="ai-block-loading">
        <span className="ai-dot" style={{ background: accent, animationDelay: '0ms' }} />
        <span className="ai-dot" style={{ background: accent, animationDelay: '180ms' }} />
        <span className="ai-dot" style={{ background: accent, animationDelay: '360ms' }} />
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="ai-block-error">
        <span className="ai-error-text">Content unavailable — check your connection</span>
        <button
          className="ai-retry-btn"
          style={{ color: accent, borderColor: `${accent}44` }}
          onClick={onRetry}
        >
          ↻ Retry
        </button>
      </div>
    )
  }

  if (!state.content) return null

  return <Markdown content={state.content} />
}
