import type { TileAI } from '../hooks/useAIContent'
import AIBlock from '../components/AIBlock'

interface Props {
  aiState: TileAI
  onRetry: () => void
}

export default function StoicScreen({ aiState, onRetry }: Props) {
  return (
    <div>
      <AIBlock state={aiState} accent="#ffc800" onRetry={onRetry} />
    </div>
  )
}
