import { type ReactNode, useEffect, useState } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  accent: string
  children: ReactNode
}

export default function Modal({ isOpen, onClose, title, accent, children }: Props) {
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
      const t = setTimeout(() => setVisible(false), 420)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  if (!visible) return null

  return (
    <div
      className="modal-overlay"
      style={{ opacity: entered ? 1 : 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-sheet"
        style={{ transform: entered ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="modal-handle" />
        <div className="modal-header">
          <div className="modal-title" style={{ color: accent }}>{title}</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-divider" />
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
