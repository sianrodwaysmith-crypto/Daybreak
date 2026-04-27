import { useEffect, useState } from 'react'
import { copy } from '../copy'
import { getHouseStorage, newTaskId } from '../storage'
import { bumpHouseMeta } from '../meta'
import type { HouseTask } from '../types'

interface Props {
  onBack: () => void
}

type Mode =
  | { kind: 'list' }
  | { kind: 'new' }
  | { kind: 'edit'; id: string }

export function HouseDrawer({ onBack }: Props) {
  const [tasks, setTasks] = useState<HouseTask[]>([])
  const [mode,  setMode]  = useState<Mode>({ kind: 'list' })
  const [showDone, setShowDone] = useState(false)

  function refresh() {
    getHouseStorage().listTasks().then(setTasks)
    bumpHouseMeta()
  }

  useEffect(() => { refresh() }, [])

  const open = tasks.filter(t => t.status === 'todo')
                    .sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
  const done = tasks.filter(t => t.status === 'done')
                    .sort((a, b) => (a.doneAt ?? '') < (b.doneAt ?? '') ? 1 : -1)

  if (mode.kind === 'new' || mode.kind === 'edit') {
    const existing = mode.kind === 'edit' ? tasks.find(t => t.id === mode.id) ?? null : null
    return (
      <TaskEditor
        existing={existing}
        onBack={() => setMode({ kind: 'list' })}
        onSaved={() => { refresh(); setMode({ kind: 'list' }) }}
        onDeleted={() => { refresh(); setMode({ kind: 'list' }) }}
      />
    )
  }

  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.back}</button>
        <button type="button" className="library-pill" onClick={() => setMode({ kind: 'new' })}>{copy.add}</button>
      </header>

      <h2 className="library-h1">{copy.title}</h2>
      <p className="library-tagline">{copy.tagline}</p>

      {open.length === 0 && (
        <div className="library-empty">{copy.empty.todo}</div>
      )}

      <ul className="house-list">
        {open.map(t => (
          <li key={t.id}>
            <button type="button" className="house-row" onClick={() => setMode({ kind: 'edit', id: t.id })}>
              <span className="house-row-title">{t.title}</span>
              {t.note && <span className="house-row-note">{t.note}</span>}
            </button>
          </li>
        ))}
      </ul>

      {done.length > 0 && (
        <section className="house-done-section">
          <button
            type="button"
            className="library-link"
            onClick={() => setShowDone(s => !s)}
          >
            {showDone ? copy.hideDone : copy.showDone(done.length)}
          </button>
          {showDone && (
            <>
              <div className="library-section-label">{copy.doneSectionLabel}</div>
              <ul className="house-list">
                {done.map(t => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="house-row house-row-done"
                      onClick={() => setMode({ kind: 'edit', id: t.id })}
                    >
                      <span className="house-row-title">{t.title}</span>
                      {t.note && <span className="house-row-note">{t.note}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}
    </div>
  )
}

interface EditorProps {
  existing:   HouseTask | null
  onBack:     () => void
  onSaved:    () => void
  onDeleted:  () => void
}

function TaskEditor({ existing, onBack, onSaved, onDeleted }: EditorProps) {
  const [title, setTitle] = useState(existing?.title ?? '')
  const [note,  setNote]  = useState(existing?.note  ?? '')
  const [busy,  setBusy]  = useState(false)

  async function save() {
    if (busy) return
    const t = title.trim()
    if (!t) { onBack(); return }
    setBusy(true)
    try {
      const now = new Date().toISOString()
      const next: HouseTask = existing
        ? { ...existing, title: t, note: note.trim() || undefined, updatedAt: now }
        : {
            id:        newTaskId(),
            title:     t,
            note:      note.trim() || undefined,
            status:    'todo',
            createdAt: now,
            updatedAt: now,
          }
      await getHouseStorage().saveTask(next)
      onSaved()
    } finally { setBusy(false) }
  }

  async function setStatus(status: HouseTask['status']) {
    if (!existing || busy) return
    setBusy(true)
    try {
      const now = new Date().toISOString()
      const next: HouseTask = {
        ...existing,
        status,
        doneAt: status === 'done' ? now : undefined,
        updatedAt: now,
      }
      await getHouseStorage().saveTask(next)
      onSaved()
    } finally { setBusy(false) }
  }

  async function deleteIt() {
    if (!existing || busy) return
    setBusy(true)
    try { await getHouseStorage().deleteTask(existing.id); onDeleted() }
    finally { setBusy(false) }
  }

  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.actions.cancel}</button>
        <button
          type="button"
          className="library-pill"
          onClick={save}
          disabled={busy || !title.trim()}
        >{copy.actions.save}</button>
      </header>

      <h2 className="library-h1">{existing ? copy.editTitle : copy.newTitle}</h2>

      <label className="house-field">
        <span className="house-field-label">{copy.fields.titleLabel}</span>
        <input
          className="house-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={copy.fields.titlePh}
          autoFocus
        />
      </label>

      <label className="house-field">
        <span className="house-field-label">{copy.fields.noteLabel}</span>
        <textarea
          className="house-textarea"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={copy.fields.notePh}
          rows={3}
        />
      </label>

      {existing && (
        <div className="house-actions">
          {existing.status === 'todo' ? (
            <button type="button" className="house-action-primary" onClick={() => setStatus('done')} disabled={busy}>
              {copy.actions.markDone}
            </button>
          ) : (
            <button type="button" className="house-action-quiet" onClick={() => setStatus('todo')} disabled={busy}>
              {copy.actions.reopen}
            </button>
          )}
          <button type="button" className="house-action-quiet" onClick={deleteIt} disabled={busy}>
            {copy.actions.delete}
          </button>
        </div>
      )}
    </div>
  )
}
