import type { TileAI } from '../hooks/useAIContent'
import AIBlock from '../components/AIBlock'

interface Props {
  aiState: TileAI
  onRetry: () => void
}

export default function AIBriefingScreen({ aiState, onRetry }: Props) {
  return (
    <div>
      <div className="screen-section">
        <AIBlock state={aiState} accent="#a78bfa" onRetry={onRetry} />
      </div>
    </div>
  )
}
