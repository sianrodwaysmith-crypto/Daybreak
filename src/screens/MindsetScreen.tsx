import { useState, useEffect } from 'react'
import { generateMindsetReflection } from '../services/anthropic'

const TODAY = new Date().toISOString().split('T')[0]
const KEY = `daybreak-mindset-${TODAY}`

interface Saved {
  g1: string; g2: string; g3: string
  intention: string; reflection: string
}

export default function MindsetScreen() {
  const [g1, setG1] = useState('')
  const [g2, setG2] = useState('')
  const [g3, setG3] = useState('')
  const [intention, setIntention] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (saved) {
      const e: Saved = JSON.parse(saved)
      setG1(e.g1); setG2(e.g2); setG3(e.g3)
      setIntention(e.intention); setReflection(e.reflection)
      setSubmitted(true)
    }
  }, [])

  const allFilled = g1.trim() && g2.trim() && g3.trim() && intention.trim()

  const handleSubmit = async () => {
    if (!allFilled || loading) return
    setLoading(true)
    try {
      const result = await generateMindsetReflection(g1, g2, g3, intention)
      setReflection(result)
      setSubmitted(true)
      localStorage.setItem(KEY, JSON.stringify({ g1, g2, g3, intention, reflection: result }))
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    localStorage.removeItem(KEY)
    setG1(''); setG2(''); setG3(''); setIntention('')
    setReflection(''); setSubmitted(false); setLoading(false)
  }

  const btnClass = loading ? 'mindset-btn loading' : allFilled ? 'mindset-btn complete' : 'mindset-btn incomplete'
  const btnText = allFilled ? 'SET MY MINDSET →' : 'FILL IN ALL FIELDS TO CONTINUE'

  const FIELDS = [
    { num: 1, val: g1, set: setG1, placeholder: 'Something small that matters...' },
    { num: 2, val: g2, set: setG2, placeholder: 'A person in your corner...' },
    { num: 3, val: g3, set: setG3, placeholder: 'Something you often overlook...' },
  ]

  return (
    <div>
      <div className="mindset-intro">60 seconds. Ground yourself before the day starts.</div>

      <div className="screen-section-label" style={{ marginBottom: 14 }}>TODAY'S GRATITUDE</div>

      {FIELDS.map(({ num, val, set, placeholder }) => (
        <div key={num} className="mindset-field-row">
          <div className={`mindset-badge${val.trim() ? ' filled' : ''}`}>{num}</div>
          <input
            className="mindset-input"
            type="text"
            value={val}
            onChange={e => set(e.target.value)}
            placeholder={placeholder}
            disabled={submitted}
          />
        </div>
      ))}

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">TODAY'S INTENTION</div>
        <textarea
          className="mindset-textarea"
          value={intention}
          onChange={e => setIntention(e.target.value)}
          placeholder="Today I will show up as..."
          disabled={submitted}
          rows={3}
        />
      </div>

      {!submitted && (
        <button className={btnClass} onClick={handleSubmit} disabled={!allFilled || loading}>
          {loading ? (
            <div className="mindset-dots">
              <div className="mindset-dot" />
              <div className="mindset-dot" />
              <div className="mindset-dot" />
            </div>
          ) : btnText}
        </button>
      )}

      {submitted && reflection && (
        <>
          <div className="mindset-divider">
            <div className="mindset-divider-line" />
            <div className="mindset-divider-label">YOUR REFLECTION</div>
            <div className="mindset-divider-line" />
          </div>
          <div className="mindset-reflection">{reflection}</div>
          <button className="mindset-reset-btn" onClick={handleReset}>RESET</button>
        </>
      )}
    </div>
  )
}
