import { useEffect, useState } from 'react'

export default function Splash() {
  const [fading, setFading]   = useState(false)
  const [removed, setRemoved] = useState(false)

  useEffect(() => {
    const fadeTimer   = setTimeout(() => setFading(true),   1500)
    const removeTimer = setTimeout(() => setRemoved(true), 2100)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])

  if (removed) return null

  return (
    <div className={`splash${fading ? ' splash-fade' : ''}`}>
      <div className="brand-stack">
        <div className="brand-icon">
          <span className="brand-dot" />
          <span className="brand-line" />
        </div>
        <div className="brand-word">daybreak</div>
        <div className="brand-tag">balance</div>
      </div>
    </div>
  )
}
