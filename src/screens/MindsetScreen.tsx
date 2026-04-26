import { useState, useEffect } from 'react'
import { generateMindsetReflection } from '../services/anthropic'
import { useDayBreakContext } from '../contexts/DayBreakContext'

const TODAY = new Date().toISOString().split('T')[0]
const KEY = `daybreak-mindset-${TODAY}`

interface Saved {
  g1: string; g2: string; g3: string
  greatDay: string
  affirmation: string
  reflection: string
}

export default function MindsetScreen() {
  const { registerContent } = useDayBreakContext()
  const [g1, setG1]                 = useState('')
  const [g2, setG2]                 = useState('')
  const [g3, setG3]                 = useState('')
  const [greatDay, setGreatDay]     = useState('')
  const [affirmation, setAffirm]    = useState('')
  const [submitted, setSubmitted]   = useState(false)
  const [reflection, setReflection] = useState('')
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(KEY)
    if (saved) {
      const e: Saved = JSON.parse(saved)
      setG1(e.g1); setG2(e.g2); setG3(e.g3)
      setGreatDay(e.greatDay)
      setAffirm(e.affirmation)
      setReflection(e.reflection)
      setSubmitted(true)
      registerContent('mindset', {
        gratitude:    [e.g1, e.g2, e.g3].filter(Boolean),
        great_day:    e.greatDay,
        affirmation:  e.affirmation,
        reflection:   e.reflection,
      })
    }
  }, [registerContent])

  const allFilled = g1.trim() && g2.trim() && g3.trim() && greatDay.trim() && affirmation.trim()

  const handleSubmit = async () => {
    if (!allFilled || loading) return
    setLoading(true)
    try {
      const result = await generateMindsetReflection(g1, g2, g3, greatDay, affirmation)
      setReflection(result)
      setSubmitted(true)
      localStorage.setItem(KEY, JSON.stringify({ g1, g2, g3, greatDay, affirmation, reflection: result }))
      registerContent('mindset', {
        gratitude:   [g1, g2, g3].filter(Boolean),
        great_day:   greatDay,
        affirmation: affirmation,
        reflection:  result,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    localStorage.removeItem(KEY)
    setG1(''); setG2(''); setG3('')
    setGreatDay(''); setAffirm('')
    setReflection(''); setSubmitted(false); setLoading(false)
    registerContent('mindset', null)
  }

  const btnClass = loading ? 'mindset-btn loading' : allFilled ? 'mindset-btn complete' : 'mindset-btn incomplete'
  const btnText  = allFilled ? 'SET MY MINDSET →' : 'FILL IN ALL FIELDS TO CONTINUE'

  const GRATITUDE_FIELDS = [
    { num: 1, val: g1, set: setG1, placeholder: 'Something small that matters...' },
    { num: 2, val: g2, set: setG2, placeholder: 'A person in your corner...' },
    { num: 3, val: g3, set: setG3, placeholder: 'Something you often overlook...' },
  ]

  return (
    <div>
      <div className="screen-section-label" style={{ marginBottom: 14 }}>THREE THINGS I'M GRATEFUL FOR</div>

      {GRATITUDE_FIELDS.map(({ num, val, set, placeholder }) => (
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
        <div className="mindset-intention-label">ONE THING THAT WOULD MAKE TODAY GREAT</div>
        <textarea
          className="mindset-textarea"
          value={greatDay}
          onChange={e => setGreatDay(e.target.value)}
          placeholder="If I do this one thing, today will feel like a win..."
          disabled={submitted}
          rows={3}
        />
      </div>

      <div className="mindset-intention-section">
        <div className="mindset-intention-label">DAILY AFFIRMATION</div>
        <textarea
          className="mindset-textarea"
          value={affirmation}
          onChange={e => setAffirm(e.target.value)}
          placeholder="I am..."
          disabled={submitted}
          rows={2}
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
