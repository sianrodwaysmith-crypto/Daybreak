import { copy } from '../copy'

interface Props {
  name:   string
  onBack: () => void
}

/**
 * Shared "Coming soon" surface used by every drawer whose status is
 * 'placeholder'. Don't fork this for individual drawers — when one of
 * them goes live, that drawer ships its own component and flips its
 * registry entry's status to 'live'.
 */
export function PlaceholderDrawer({ name, onBack }: Props) {
  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.placeholder.backToLibrary}</button>
        <span className="library-screen-rightplaceholder" />
      </header>
      <h2 className="library-h1">{name}</h2>
      <div className="library-placeholder">
        <p className="library-placeholder-primary">{copy.placeholder.primary}</p>
        <p className="library-placeholder-secondary">{copy.placeholder.secondary}</p>
      </div>
    </div>
  )
}
