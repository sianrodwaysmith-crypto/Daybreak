import type { TileAI } from '../hooks/useAIContent'
import AIBlock from '../components/AIBlock'

interface Props {
  aiState: TileAI
  onRetry: () => void
}

export default function TodaysFocusScreen({ aiState, onRetry }: Props) {
  return (
    <div>
      <div className="focus-main-card">
        <div className="focus-eyebrow">AI BRIEFING</div>
        <AIBlock state={aiState} accent="#f97316" onRetry={onRetry} />
      </div>
    </div>
  )
}
