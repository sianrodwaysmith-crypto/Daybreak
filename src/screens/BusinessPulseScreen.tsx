import type { TileAI } from '../hooks/useAIContent'
import AIBlock from '../components/AIBlock'

interface Props {
  aiState: TileAI
  onRetry: () => void
}

export default function BusinessPulseScreen({ aiState, onRetry }: Props) {
  return (
    <div>
      <div className="screen-section">
        <AIBlock state={aiState} accent="#ffc800" onRetry={onRetry} />
      </div>
    </div>
  )
}
