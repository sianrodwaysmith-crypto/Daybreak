import { useEffect, useState, type ReactNode } from 'react'

/**
 * Internal modal. Kept inside the module so /moments doesn't reach into
 * the rest of the app for layout primitives — the boundary is sealed.
 */

interface Props {
  isOpen:    boolean
  onClose:   () => void
  title:     string
  children:  ReactNode
}

export function MomentsModal({ isOpen, onClose, title, children }: Props) {
  const [visible, setVisible] = useState(false)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setVisible(true)
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setEntered(true))
      )
      return () => cancelAnimationFrame(raf)
    } else {
      setEntered(false)
      const t = setTimeout(() => setVisible(false), 380)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!visible) return null

  return (
    <div
      className="moments-modal-overlay"
      style={{ opacity: entered ? 1 : 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="moments-modal-sheet"
        style={{ transform: entered ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="moments-modal-handle" />
        <div className="moments-modal-header">
          <div className="moments-modal-title">{title}</div>
          <button className="moments-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="moments-modal-body">{children}</div>
      </div>
    </div>
  )
}
