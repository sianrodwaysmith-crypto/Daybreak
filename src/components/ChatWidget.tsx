import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDayBreakContext } from '../contexts/DayBreakContext'
import { buildSystemPrompt, streamChat, suggestChips, type ChatMessage } from '../services/chat'
import Markdown from './Markdown'

const HISTORY_KEY = `daybreak-chat-${new Date().toISOString().slice(0, 10)}`
const SEEN_VERSION_KEY = 'daybreak-chat-seen-version'

function loadHistory(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    return raw ? JSON.parse(raw) as ChatMessage[] : []
  } catch { return [] }
}

function saveHistory(msgs: ChatMessage[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs)) } catch {}
}

function loadSeenVersion(): number {
  try { return Number(localStorage.getItem(SEEN_VERSION_KEY) ?? '0') } catch { return 0 }
}

function saveSeenVersion(v: number) {
  try { localStorage.setItem(SEEN_VERSION_KEY, String(v)) } catch {}
}

export default function ChatWidget() {
  const { getAllContext, version } = useDayBreakContext()

  const [open, setOpen]               = useState(false)
  const [messages, setMessages]       = useState<ChatMessage[]>(loadHistory)
  const [input, setInput]             = useState('')
  const [streaming, setStreaming]     = useState(false)
  const [pending, setPending]         = useState('')
  const [error, setError]             = useState<string | null>(null)
  const [seenVersion, setSeenVersion] = useState<number>(loadSeenVersion)
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  const abortRef    = useRef<AbortController | null>(null)
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const inputRef    = useRef<HTMLTextAreaElement | null>(null)

  const hasUnread = !open && version > seenVersion && Object.keys(getAllContext()).length > 0
  const chipsList = useMemo(() => suggestChips(getAllContext()), [version, open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist history whenever it changes
  useEffect(() => { saveHistory(messages) }, [messages])

  // Scroll to bottom on new content
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, pending, open])

  // iPhone keyboard tracking via visualViewport
  useEffect(() => {
    if (!open || typeof window === 'undefined' || !window.visualViewport) return
    const vv = window.visualViewport
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardOffset(offset)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [open])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setSeenVersion(version)
    saveSeenVersion(version)
    setError(null)
  }, [version])

  const handleClose = useCallback(() => {
    setOpen(false)
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setStreaming(false)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || streaming) return

    const next: ChatMessage[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setError(null)
    setPending('')
    setStreaming(true)

    const ctxSnapshot = getAllContext()
    const system = buildSystemPrompt(ctxSnapshot)

    const ctrl = new AbortController()
    abortRef.current = ctrl

    let acc = ''
    await streamChat(
      next,
      system,
      {
        onDelta: (delta) => {
          acc += delta
          setPending(acc)
        },
        onComplete: () => {
          if (acc) {
            setMessages(m => [...m, { role: 'assistant', content: acc }])
          }
          setPending('')
          setStreaming(false)
          abortRef.current = null
        },
        onError: (err) => {
          setError(err.message)
          setPending('')
          setStreaming(false)
          abortRef.current = null
        },
      },
      ctrl.signal,
    )
  }, [messages, streaming, getAllContext])

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          className="chat-fab"
          onClick={handleOpen}
          aria-label="Open chat"
        >
          <span className="chat-fab-icon">💬</span>
          {hasUnread && <span className="chat-fab-dot" />}
        </button>
      )}

      {/* Slide-up panel */}
      {open && (
        <div className="chat-overlay" onClick={handleClose}>
          <div
            className="chat-panel"
            onClick={(e) => e.stopPropagation()}
            style={{ transform: `translateY(${-keyboardOffset}px)` }}
          >
            <header className="chat-panel-header">
              <div className="chat-panel-title">ASK DAYBREAK</div>
              <button className="chat-panel-close" onClick={handleClose} aria-label="Close chat">✕</button>
            </header>

            <div className="chat-messages" ref={scrollerRef}>
              {messages.length === 0 && !pending && (
                <div className="chat-empty">
                  <div className="chat-empty-title">Good morning.</div>
                  <div className="chat-empty-sub">
                    Ask anything about your day — your readiness, schedule, news, or focus.
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`chat-msg chat-msg-${m.role}`}>
                  <div className="chat-bubble">
                    {m.role === 'assistant'
                      ? <Markdown content={m.content} />
                      : <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>}
                  </div>
                </div>
              ))}

              {streaming && (
                <div className="chat-msg chat-msg-assistant">
                  <div className="chat-bubble">
                    {pending
                      ? <Markdown content={pending} />
                      : (
                          <div className="chat-typing">
                            <span className="chat-typing-dot" />
                            <span className="chat-typing-dot" />
                            <span className="chat-typing-dot" />
                          </div>
                        )}
                  </div>
                </div>
              )}

              {error && (
                <div className="chat-error">
                  Couldn't reach Claude — {error}
                </div>
              )}
            </div>

            {messages.length === 0 && !streaming && (
              <div className="chat-chips">
                {chipsList.map((chip, i) => (
                  <button
                    key={i}
                    className="chat-chip"
                    onClick={() => sendMessage(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-input-row"
              onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
            >
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(input)
                  }
                }}
                placeholder="Ask DayBreak…"
                rows={1}
                disabled={streaming}
              />
              <button
                type="submit"
                className="chat-send"
                disabled={!input.trim() || streaming}
                aria-label="Send"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
