import { useState } from 'react'
import { copy } from '../copy'
import { PLAYERS } from '../players'
import type { PlayerProfile } from '../types'

interface Props {
  onBack: () => void
}

type View =
  | { kind: 'list' }
  | { kind: 'player'; id: string }

export function TechMarketDrawer({ onBack }: Props) {
  const [view, setView] = useState<View>({ kind: 'list' })

  if (view.kind === 'player') {
    const profile = PLAYERS.find(p => p.id === view.id) ?? null
    if (!profile) { setView({ kind: 'list' }); return null }
    return <PlayerView profile={profile} onBack={() => setView({ kind: 'list' })} />
  }

  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.back}</button>
        <span className="library-screen-rightplaceholder" />
      </header>

      <h2 className="library-h1">{copy.title}</h2>
      <p className="library-tagline">{copy.tagline}</p>
      <p className="techmarket-intro">{copy.intro}</p>

      <section>
        <div className="library-section-label">{copy.sections.players}</div>
        <ul className="techmarket-list">
          {PLAYERS.map(p => (
            <li key={p.id}>
              <button
                type="button"
                className="techmarket-row"
                onClick={() => setView({ kind: 'player', id: p.id })}
              >
                <span className="techmarket-row-head">
                  <span className="techmarket-row-name">{p.shortName}</span>
                  <span className="techmarket-row-badge">{copy.categoryLabel[p.category]}</span>
                </span>
                <span className="techmarket-row-line">{p.oneLiner}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function PlayerView({ profile, onBack }: { profile: PlayerProfile; onBack: () => void }) {
  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.back}</button>
        <span className="library-screen-rightplaceholder" />
      </header>

      <h2 className="library-h1">{profile.name}</h2>
      <p className="library-tagline">{profile.oneLiner}</p>

      <Section label={copy.profile.snapshot}     body={profile.snapshot} />
      <Section label={copy.profile.position}     body={profile.position} />
      <Section label={copy.profile.keyProducts}  body={profile.keyProducts} />
      <Section label={copy.profile.competitors}  body={profile.competitors} />
      <Section label={copy.profile.recentMoves}  body={profile.recentMoves} />
    </div>
  )
}

function Section({ label, body }: { label: string; body: string }) {
  if (!body || !body.trim()) {
    return (
      <section className="techmarket-section">
        <div className="library-section-label">{label}</div>
        <p className="techmarket-empty">Coming soon.</p>
      </section>
    )
  }
  // Body is plain prose with paragraph breaks on blank lines.
  const paragraphs = body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  return (
    <section className="techmarket-section">
      <div className="library-section-label">{label}</div>
      {paragraphs.map((p, i) => <p key={i} className="techmarket-prose">{p}</p>)}
    </section>
  )
}
