import { copy } from '../copy'
import type { DrawerManifest } from '../types'

interface Props {
  manifests: DrawerManifest[]
  onBack:    () => void
  onOpen:    (id: string) => void
  onAddSoon: () => void
}

export function LibraryHome({ manifests, onBack, onOpen, onAddSoon }: Props) {
  return (
    <div className="library-home">
      <header className="library-home-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.home.back}</button>
        <span className="library-screen-rightplaceholder" />
      </header>
      <h1 className="library-h1">{copy.home.title}</h1>
      <p className="library-tagline">{copy.home.tagline}</p>

      <div className="library-grid">
        {manifests.map(m => <DrawerCard key={m.id} manifest={m} onOpen={onOpen} />)}
        <button type="button" className="library-card library-card-add" onClick={onAddSoon}>
          <span className="library-add-text">{copy.home.addNew}</span>
        </button>
      </div>
    </div>
  )
}

function DrawerCard({ manifest, onOpen }: { manifest: DrawerManifest; onOpen: (id: string) => void }) {
  // Each drawer's own hook reads its data and produces a meta-line.
  // Hook order is stable because the manifest array is stable per render.
  const meta = manifest.useMetaLine()
  return (
    <button type="button" className="library-card" onClick={() => onOpen(manifest.id)}>
      <span className="library-card-icon" aria-hidden>{manifest.icon()}</span>
      <span className="library-card-name">{manifest.name}</span>
      {meta && <span className="library-card-meta">{meta}</span>}
    </button>
  )
}
