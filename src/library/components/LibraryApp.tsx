import { useMemo, useState } from 'react'
import { copy } from '../copy'
import { buildRegistry } from '../drawers/registry'
import { LibraryHome }   from './LibraryHome'

interface Props {
  /** Closes the Library entirely (returns to the morning surface). */
  onClose: () => void
}

type Screen = 'home' | { kind: 'drawer'; id: string }

export function LibraryApp({ onClose }: Props) {
  const [screen, setScreen] = useState<Screen>('home')
  const [showAddSoon, setShowAddSoon] = useState(false)

  // The registry is built once per render with a stable onBack so the
  // drawer hook list (used in LibraryHome) stays stable too.
  const back = () => setScreen('home')
  const manifests = useMemo(() => buildRegistry(back), [])

  if (typeof screen === 'object' && screen.kind === 'drawer') {
    const m = manifests.find(x => x.id === screen.id)
    if (!m) { setScreen('home'); return null }
    return m.component()
  }

  return (
    <>
      <LibraryHome
        manifests={manifests}
        onBack={onClose}
        onOpen={(id) => setScreen({ kind: 'drawer', id })}
        onAddSoon={() => setShowAddSoon(true)}
      />
      {showAddSoon && (
        <div className="library-add-soon">
          <p className="library-add-soon-primary">{copy.home.addNewSoon}</p>
          <button type="button" className="library-link" onClick={() => setShowAddSoon(false)}>close</button>
        </div>
      )}
    </>
  )
}
