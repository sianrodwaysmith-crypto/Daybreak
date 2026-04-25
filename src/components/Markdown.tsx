import type { ReactNode } from 'react'

interface Props { content: string }

function parseInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*')  && part.endsWith('*'))  return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

export default function Markdown({ content }: Props) {
  const lines = content.split('\n')
  const nodes: ReactNode[] = []

  for (let i = 0; i < lines.length; i++) {
    const raw     = lines[i]
    const trimmed = raw.trim()

    if (!trimmed) {
      nodes.push(<div key={i} className="md-spacer" />)
      continue
    }

    // Attribution: lines starting with em dash
    if (trimmed.startsWith('—') || trimmed.startsWith('–')) {
      nodes.push(<div key={i} className="md-attribution">{trimmed}</div>)
      continue
    }

    // Bullet: → or - or •
    if (trimmed.startsWith('→') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const text = trimmed.startsWith('- ') || trimmed.startsWith('• ')
        ? trimmed.slice(2)
        : trimmed.slice(1).trim()
      nodes.push(<div key={i} className="md-bullet"><span className="md-bullet-arrow">→</span><span>{parseInline(text)}</span></div>)
      continue
    }

    // Headings: mostly uppercase with allowed punctuation
    const isHeading = trimmed.length > 2
      && trimmed === trimmed.toUpperCase()
      && /^[A-Z0-9\s&''\/\-\.]+$/.test(trimmed)
    if (isHeading) {
      nodes.push(<div key={i} className="md-heading">{trimmed}</div>)
      continue
    }

    // Quote: wrapped in "…"
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      nodes.push(<div key={i} className="md-quote">{parseInline(trimmed)}</div>)
      continue
    }

    nodes.push(<div key={i} className="md-para">{parseInline(trimmed)}</div>)
  }

  return <div className="md-content">{nodes}</div>
}
