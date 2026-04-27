import { useMemo, useState } from 'react'
import type { Account, NewsState } from '../clients/types'
import { useAccounts } from '../hooks/useAccounts'
import { loadAccountNews, readAccountNews } from '../clients/news'
import { parseAccountNews, hostname, formatRelativeDate } from '../clients/parse'

/* ====================================================================
   Client Research screen.
   - Top: today's focus account (3 stories + talking points, auto-loads).
   - Below: every other account, collapsed; tap to load 2 stories.
   - Inline editor on each card (pencil icon → form expands).
   - "+ Add account" button at the bottom.
==================================================================== */

interface NewsBlockProps {
  state:    NewsState
  accountName: string
  hasNotes: boolean
  onLoad:   () => void
  onRetry:  () => void
  onEdit:   () => void
  showTalkingPoints: boolean
}

function isRateLimited(msg: string | null): boolean {
  if (!msg) return false
  return /\b429\b|rate[- ]?limit|tokens per minute/i.test(msg)
}

function NewsBlock({ state, accountName, hasNotes, onLoad, onRetry, onEdit, showTalkingPoints }: NewsBlockProps) {
  if (state.loading) {
    return (
      <div className="account-news-loading">
        <span className="account-news-skel" />
        <span className="account-news-skel" />
      </div>
    )
  }

  if (state.error) {
    const limited = isRateLimited(state.errorMsg)
    return (
      <div className="account-news-error">
        <div className="account-news-error-stack">
          <span>{limited ? 'Daily token quota hit.' : "Couldn't fetch news for this account."}</span>
          <span className="account-news-error-detail">
            {limited
              ? 'Wait a minute or two before retrying. The Pulse and per-account searches share the same Anthropic budget.'
              : state.errorMsg}
          </span>
        </div>
        <button className="account-news-retry" onClick={onRetry}>↻ Retry</button>
      </div>
    )
  }

  if (!state.content) {
    return (
      <div className="account-news-empty">
        <span className="account-news-empty-text">No news loaded yet.</span>
        <button className="account-news-retry" onClick={onLoad}>Load today's news</button>
      </div>
    )
  }

  const { stories, talkingPoints } = parseAccountNews(state.content)
  if (stories.length === 0 && talkingPoints.length === 0) {
    return (
      <div className="account-news-empty-block">
        <div className="account-news-empty-stack">
          <span className="account-news-empty-headline">
            No recent news found for {accountName}.
          </span>
          <span className="account-news-empty-detail">
            {hasNotes
              ? 'The web search came back empty for the last 30 days. Try refreshing later, or refine the notes (e.g. specific division, parent company) so the search lands on the right entity.'
              : `If the name is ambiguous, add context in notes (industry, location, full company name) so the search knows which ${accountName} you mean.`}
          </span>
          <details className="account-news-empty-debug">
            <summary>Show what the model returned</summary>
            <pre className="account-news-empty-debug-pre">{state.content}</pre>
          </details>
        </div>
        <div className="account-news-empty-actions">
          {!hasNotes && (
            <button className="account-news-retry" onClick={onEdit}>✎ Add context</button>
          )}
          <button className="account-news-retry" onClick={onRetry}>↻ Try again</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="account-news-list">
        {stories.map((s, i) => {
          const relDate = formatRelativeDate(s.date)
          const inner = (
            <>
              {relDate && <div className="account-news-date">{relDate}</div>}
              <h4 className="account-news-headline">{s.headline}</h4>
              <dl className="account-news-facts">
                {s.what && (<>
                  <dt className="account-news-fact-label">What</dt>
                  <dd className="account-news-fact-text">{s.what}</dd>
                </>)}
                {s.impact && (<>
                  <dt className="account-news-fact-label">Hook</dt>
                  <dd className="account-news-fact-text">{s.impact}</dd>
                </>)}
              </dl>
              {s.url && (
                <span className="account-news-source">
                  {hostname(s.url)} ↗
                </span>
              )}
            </>
          )
          if (s.url) {
            return (
              <a key={i} className="account-news-card account-news-card-link" href={s.url} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            )
          }
          return <article key={i} className="account-news-card">{inner}</article>
        })}
      </div>

      {showTalkingPoints && talkingPoints.length > 0 && (
        <div className="account-talking">
          <div className="account-talking-label">TALKING POINTS</div>
          <ul className="account-talking-list">
            {talkingPoints.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}
    </>
  )
}

interface EditorProps {
  initial?:  { name: string; contact?: string; notes?: string }
  onSubmit:  (v: { name: string; contact?: string; notes?: string }) => void
  onCancel:  () => void
  onDelete?: () => void
  saveLabel: string
}

function AccountEditor({ initial, onSubmit, onCancel, onDelete, saveLabel }: EditorProps) {
  const [name,    setName]    = useState(initial?.name    ?? '')
  const [contact, setContact] = useState(initial?.contact ?? '')
  const [notes,   setNotes]   = useState(initial?.notes   ?? '')

  return (
    <div className="account-editor">
      <label className="account-field">
        <span className="account-field-label">Account name</span>
        <input
          className="account-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Acme Corp"
          autoFocus
        />
      </label>
      <label className="account-field">
        <span className="account-field-label">Primary contact (optional)</span>
        <input
          className="account-input"
          value={contact}
          onChange={e => setContact(e.target.value)}
          placeholder="Sarah Okonkwo, CTO"
        />
      </label>
      <label className="account-field">
        <span className="account-field-label">Notes for the AI (optional)</span>
        <textarea
          className="account-input account-textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Renewal Q4. Major migration from on-prem to cloud. Key competitor: HubSpot."
          rows={3}
        />
      </label>
      <div className="account-editor-actions">
        <button
          className="account-btn-primary"
          disabled={!name.trim()}
          onClick={() => onSubmit({ name, contact: contact || undefined, notes: notes || undefined })}
        >{saveLabel}</button>
        <button className="account-btn-quiet" onClick={onCancel}>Cancel</button>
        {onDelete && (
          <button className="account-btn-danger" onClick={onDelete}>Delete</button>
        )}
      </div>
    </div>
  )
}

interface CardProps {
  account:    Account
  isFocus:    boolean
  onFocus:    () => void
  onUpdate:   (patch: { name: string; contact?: string; notes?: string }) => void
  onDelete:   () => void
}

function AccountCard({ account, isFocus, onFocus, onUpdate, onDelete }: CardProps) {
  const [news,     setNews]     = useState<NewsState>(() => readAccountNews(account.id))
  // Cards expand by default if they already have cached news from
  // earlier today; otherwise they stay collapsed until the user taps in.
  // Nothing auto-fetches — every API call is the result of a tap.
  const [expanded, setExpanded] = useState<boolean>(news.content != null)
  const [editing,  setEditing]  = useState(false)

  function load(force: boolean) {
    setNews(s => ({ ...s, loading: true, error: false }))
    loadAccountNews(account, isFocus, { force }).then(setNews)
  }

  function handleExpand() {
    if (editing) return
    setExpanded(e => !e)
  }

  return (
    <section className={`account-card${isFocus ? ' is-focus' : ''}`}>
      <div className="account-head">
        <button
          type="button"
          className="account-head-main"
          onClick={handleExpand}
        >
          <span className="account-head-text">
            <span className="account-name">{account.name}</span>
            {account.contact && <span className="account-contact">{account.contact}</span>}
          </span>
        </button>
        <div className="account-head-actions">
          {!isFocus && (
            <button
              type="button"
              className="account-icon-btn"
              onClick={onFocus}
              aria-label="Set as today's focus"
              title="Set as today's focus"
            >★</button>
          )}
          <button
            type="button"
            className="account-icon-btn"
            onClick={() => { setEditing(e => !e); setExpanded(true) }}
            aria-label="Edit account"
            title="Edit"
          >✎</button>
          {expanded && !editing && news.content && (
            <button
              type="button"
              className="account-icon-btn"
              onClick={() => load(true)}
              disabled={news.loading}
              aria-label="Refresh news"
              title="Refresh news"
            >↻</button>
          )}
        </div>
      </div>

      {expanded && editing && (
        <AccountEditor
          initial={{ name: account.name, contact: account.contact, notes: account.notes }}
          saveLabel="Save changes"
          onSubmit={(v) => { onUpdate(v); setEditing(false) }}
          onCancel={() => setEditing(false)}
          onDelete={onDelete}
        />
      )}

      {expanded && !editing && (
        <div className="account-body">
          <NewsBlock
            state={news}
            accountName={account.name}
            hasNotes={!!account.notes}
            onLoad={() => load(false)}
            onRetry={() => load(true)}
            onEdit={() => { setEditing(true); setExpanded(true) }}
            showTalkingPoints={isFocus}
          />
        </div>
      )}
    </section>
  )
}

export default function ClientResearchScreen() {
  const { accounts, focus, add, update, remove, setFocus } = useAccounts()
  const [adding, setAdding] = useState(false)

  const ordered = useMemo(() => {
    const focused = accounts.filter(a => a.isFocus)
    const rest    = accounts.filter(a => !a.isFocus).sort((a, b) => b.updatedAt - a.updatedAt)
    return [...focused, ...rest]
  }, [accounts])

  const empty = accounts.length === 0

  return (
    <div className="account-screen">
      {focus && (
        <div className="account-focus-banner">TODAY'S FOCUS · {focus.name.toUpperCase()}</div>
      )}

      {empty && !adding && (
        <div className="account-empty">
          <p className="account-empty-text">
            Add your accounts here and Daybreak will surface fresh news on each one,
            with a conversation hook you could lead a call with.
          </p>
          <button className="account-btn-primary" onClick={() => setAdding(true)}>
            Add your first account →
          </button>
        </div>
      )}

      {ordered.map(a => (
        <AccountCard
          key={a.id}
          account={a}
          isFocus={!!a.isFocus}
          onFocus={() => setFocus(a.id)}
          onUpdate={(patch) => update(a.id, patch)}
          onDelete={() => remove(a.id)}
        />
      ))}

      {adding && (
        <section className="account-card">
          <div className="account-head">
            <span className="account-head-main account-head-add">
              <span className="account-head-text"><span className="account-name">New account</span></span>
            </span>
          </div>
          <AccountEditor
            saveLabel="Save"
            onSubmit={(v) => { add(v); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        </section>
      )}

      {!empty && !adding && (
        <button className="account-add-btn" onClick={() => setAdding(true)}>
          + Add account
        </button>
      )}
    </div>
  )
}
