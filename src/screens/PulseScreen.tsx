import type { TileAI } from '../hooks/useAIContent'
import AIBlock from '../components/AIBlock'

interface Props {
  anthropic: TileAI
  aiWorld:   TileAI
  techMkt:   TileAI
  onRetrySection: (id: 'pulse-anthropic' | 'pulse-aiworld' | 'pulse-tech') => void
  onRefreshAll:   () => void
}

const SECTION_GAP_STYLE: React.CSSProperties = { marginTop: 22 }
const DIVIDER_STYLE: React.CSSProperties = {
  height: 1,
  background: 'rgba(255,255,255,0.08)',
  margin: '22px 0 0',
}

interface SectionProps {
  label:    string
  accent:   string
  state:    TileAI
  onRetry:  () => void
  first?:   boolean
}

function Section({ label, accent, state, onRetry, first }: SectionProps) {
  return (
    <div style={first ? undefined : SECTION_GAP_STYLE}>
      <div
        className="screen-section-label"
        style={{ color: accent, marginBottom: 12 }}
      >
        {label}
      </div>
      <AIBlock
        state={state}
        accent={accent}
        onRetry={onRetry}
        errorText="Could not fetch live content — tap to retry"
        retryAccent="#ffc800"
      />
    </div>
  )
}

function copyPulseDebug() {
  const keys = ['anthropic', 'aiworld', 'techmarket']
  const dump: Record<string, unknown> = {}
  for (const k of keys) {
    const raw = sessionStorage.getItem(`daybreak-pulse-debug-${k}`)
    dump[k] = raw ? JSON.parse(raw) : null
  }
  const text = JSON.stringify(dump, null, 2)
  navigator.clipboard?.writeText(text).catch(() => {})
  // Fallback: also alert a head of it so the user can confirm something landed
  const head = text.length > 600 ? text.slice(0, 600) + '\n…(truncated)' : text
  alert('Pulse debug copied to clipboard.\n\nFirst chunk:\n\n' + head)
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
  const updated = lastUpdated([anthropic, aiWorld, techMkt])
  const anyLoading = anthropic.loading || aiWorld.loading || techMkt.loading

  return (
    <div>
      <Section
        first
        label="ANTHROPIC"
        accent="#a78bfa"
        state={anthropic}
        onRetry={() => onRetrySection('pulse-anthropic')}
      />

      <div style={DIVIDER_STYLE} />

      <Section
        label="AI WORLD"
        accent="#64b5f6"
        state={aiWorld}
        onRetry={() => onRetrySection('pulse-aiworld')}
      />

      <div style={DIVIDER_STYLE} />

      <Section
        label="TECH MARKET"
        accent="#4ade80"
        state={techMkt}
        onRetry={() => onRetrySection('pulse-tech')}
      />

      <div
        style={{
          marginTop: 28,
          paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.04em',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span>{updated ? `Last updated ${formatTime(updated)}` : 'Updating…'}</span>
          <button
            onClick={copyPulseDebug}
            aria-label="Copy pulse debug response"
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              padding: '2px 6px',
              color: 'rgba(255,255,255,0.35)',
              fontSize: 10,
              cursor: 'pointer',
              letterSpacing: '0.04em',
            }}
          >
            COPY DEBUG
          </button>
        </span>
        <button
          onClick={onRefreshAll}
          disabled={anyLoading}
          aria-label="Refresh Pulse"
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: '4px 10px',
            color: anyLoading ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)',
            fontSize: 12,
            cursor: anyLoading ? 'default' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>↻</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>
  )
}
