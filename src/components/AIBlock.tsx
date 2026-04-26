import type { TileAI } from '../hooks/useAIContent'
import Markdown from './Markdown'

interface Props {
  state:        TileAI
  accent:       string
  onRetry:      () => void
  errorText?:   string
  retryAccent?: string
}

const DEFAULT_ERROR = 'Content unavailable. Check your connection.'

export default function AIBlock({ state, accent, onRetry, errorText, retryAccent }: Props) {
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
    const btnColor = retryAccent ?? accent
    return (
      <div className="ai-block-error">
        <span className="ai-error-text">{errorText ?? DEFAULT_ERROR}</span>
        <button
          className="ai-retry-btn"
          style={{ color: btnColor, borderColor: `${btnColor}55` }}
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
