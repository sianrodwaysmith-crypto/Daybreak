import { useEffect, useRef, useState } from 'react'

function todayKey(): string {
  return `daybreak-one-thing-${new Date().toISOString().slice(0, 10)}`
}

interface Saved {
  text: string
  done: boolean
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(todayKey())
    if (!raw) return { text: '', done: false }
    return JSON.parse(raw) as Saved
  } catch {
    return { text: '', done: false }
  }
}

function save(value: Saved): void {
  try { localStorage.setItem(todayKey(), JSON.stringify(value)) }
  catch { /* noop */ }
}

export default function OneThing() {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)
  const [editing, setEditing] = useState(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    const initial = load()
    setText(initial.text)
    setDone(initial.done)
  }, [])

  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  function persist(next: Partial<Saved>) {
    const merged: Saved = { text, done, ...next }
    save(merged)
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setText(e.target.value)
  }

  function handleBlur() {
    persist({ text: text.trim() })
    setText(text.trim())
    setEditing(false)
  }

  function toggleDone() {
    const next = !done
    setDone(next)
    persist({ done: next })
  }

  function startEdit() {
    setEditing(true)
  }

  const hasText = text.trim().length > 0
  const showInput = editing || !hasText

  return (
    <section className="one-thing">
      <div className="one-thing-head">
        <span className="one-thing-eyebrow">the one thing</span>
        {hasText && !editing && (
          <button
            type="button"
            onClick={toggleDone}
            className="one-thing-done"
            aria-pressed={done}
          >
            {done ? '✓ Done' : 'Mark done'}
          </button>
        )}
      </div>

      {showInput ? (
        <textarea
          ref={taRef}
          className="one-thing-input"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="What's the one thing you'll do today?"
          rows={2}
        />
      ) : (
        <button
          type="button"
          onClick={startEdit}
          className={`one-thing-text-btn${done ? ' is-done' : ''}`}
        >
          {text}
        </button>
      )}
    </section>
  )
}
