import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Moment, MemorySurface, PhotoRef } from '../types'
import { copy } from '../copy'
import { getStorage } from '../storage'
import { evaluateMemoryRules } from '../core/memoryRules'
import { addDays, isAfterHourLocal, isoDate, todayISO } from '../core/dateHelpers'
import { MomentsSubmitFlow } from './MomentsSubmitFlow'
import { MomentsDayCard } from './MomentsDayCard'
import { MomentsModal } from './MomentsModal'
import { MomentsCollection } from './MomentsCollection'
import { MomentsIcon } from './icons'

const EVENING_HOUR = 18

type TileState =
  | { kind: 'morning_resurface'; memory: MemorySurface }
  | { kind: 'morning_empty';     dayOne: boolean }
  | { kind: 'evening_prompt'                       }
  | { kind: 'evening_submitted'; moment: Moment    }
  | { kind: 'not_connected'                        }
  | { kind: 'loading'                              }

const GOOGLE_TOKENS_KEY = 'daybreak-google-tokens'
function isConnectedToGoogle(): boolean {
  try { return !!localStorage.getItem(GOOGLE_TOKENS_KEY) }
  catch { return false }
}

interface Props {
  /** Defaults to 'sian' to match the rest of the single-user PWA. */
  userId?:        string
  /** Test override: pretend the local clock is set to this. */
  nowOverride?:   Date
  /** Test override: bypass the 18:00 rule. */
  forceEvening?:  boolean
  /** Called when the user taps the connect prompt — opens Settings. */
  onConnect?:     () => void
}

export function MomentsTile({ userId = 'sian', nowOverride, forceEvening, onConnect }: Props) {
  const now = useMemo(() => nowOverride ?? new Date(), [nowOverride])

  const [state,           setState]           = useState<TileState>({ kind: 'loading' })
  const [submitOpen,      setSubmitOpen]      = useState(false)
  const [submitDate,      setSubmitDate]      = useState<string>(() => todayISO(now))
  const [openedMoment,    setOpenedMoment]    = useState<Moment | null>(null)
  const [collectionOpen,  setCollectionOpen]  = useState(false)
  const [refreshKey,      setRefreshKey]      = useState(0)
  const [yesterdayMoment, setYesterdayMoment] = useState<Moment | null>(null)

  const yesterdayISOValue = useMemo(() => isoDate(addDays(now, -1)), [now])

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    let alive = true
    const storage = getStorage()
    const today = todayISO(now)

    Promise.all([
      storage.getByDate(userId, today),
      storage.getByDate(userId, yesterdayISOValue),
      storage.getAll(userId),
    ]).then(([todays, yest, all]) => {
      if (!alive) return
      setYesterdayMoment(yest)

      // If we're not connected to Google AND there's no existing today
      // moment to view, surface a connect prompt instead of the normal
      // states. Anything saved without tokens would only live in local
      // IDB and vanish on the next PWA reinstall.
      if (!isConnectedToGoogle() && !todays) {
        setState({ kind: 'not_connected' })
        return
      }

      const isEvening = forceEvening ?? isAfterHourLocal(now, EVENING_HOUR)

      if (isEvening) {
        setState(todays
          ? { kind: 'evening_submitted', moment: todays }
          : { kind: 'evening_prompt' })
        return
      }

      const memory = evaluateMemoryRules(now, all)
      if (memory) { setState({ kind: 'morning_resurface', memory }); return }
      setState({ kind: 'morning_empty', dayOne: all.length === 0 })
    })

    return () => { alive = false }
  }, [userId, now, yesterdayISOValue, forceEvening, refreshKey])

  function openSubmitFor(date: string) {
    setSubmitDate(date)
    setSubmitOpen(true)
  }

  function openTile() {
    switch (state.kind) {
      case 'morning_resurface':   setOpenedMoment(state.memory.moment); break
      case 'evening_submitted':   setOpenedMoment(state.moment);        break
      case 'evening_prompt':      openSubmitFor(todayISO(now));         break
      case 'morning_empty':       openSubmitFor(todayISO(now));         break
      case 'not_connected':       onConnect?.();                        break
    }
  }

  async function handleSubmit(params: { date: string; photos: PhotoRef[]; note?: string }) {
    const photoRef = params.photos[0]
    const created = await getStorage().submit({
      userId,
      date:    params.date,
      photoRef,
      photos:  params.photos,
      note:    params.note,
    })
    refresh()
    return created
  }

  // Append-mode: the user discovered the empty slot in the day card and
  // tapped it to add another photo to an existing moment. We close the
  // day-card preview, pre-fill the submit flow with the existing moment's
  // date and pass appendMode so the new photo is added rather than
  // replacing the day's collection.
  const [appendingFor, setAppendingFor] = useState<Moment | null>(null)
  function openAddMore(moment: Moment) {
    setOpenedMoment(null)
    setAppendingFor(moment)
    setSubmitDate(moment.date)
    setSubmitOpen(true)
  }

  // Existing moment for the date we're about to submit against — drives
  // the overwrite warning shown by the submission flow.
  const existingForSubmit: Moment | null = appendingFor ?? (() => {
    if (submitDate === todayISO(now) && state.kind === 'evening_submitted') return state.moment
    if (submitDate === yesterdayISOValue) return yesterdayMoment
    return null
  })()

  return (
    <>
      <section className="moments-tile">
        <div className="moments-head">
          <span className="moments-eyebrow">
            <span className="moments-eyebrow-icon" aria-hidden><MomentsIcon size={22} /></span>
            {copy.sectionLabel}
          </span>
          <span className="moments-head-actions">
            {!yesterdayMoment && (
              <button
                type="button"
                className="moments-collection-link"
                onClick={() => openSubmitFor(yesterdayISOValue)}
              >
                {copy.tile.postYesterdayLink()}
              </button>
            )}
            <button
              type="button"
              className="moments-collection-link"
              onClick={() => setCollectionOpen(true)}
            >
              {copy.tile.collectionLink()}
            </button>
          </span>
        </div>

        <button type="button" className="moments-body" onClick={openTile}>
          {state.kind === 'loading' && (
            <div className="moments-skeleton" aria-hidden />
          )}

          {state.kind === 'morning_resurface' && (
            <div className="moments-resurface">
              <div className="moments-resurface-thumb">
                <img src={state.memory.moment.photoRef.identifier} alt="" />
              </div>
              <div className="moments-resurface-caption">
                {state.memory.caption}
              </div>
            </div>
          )}

          {state.kind === 'morning_empty' && (
            <div className="moments-quiet-line">
              {state.dayOne
                ? copy.tile.morningEmptyDayOne()
                : copy.tile.morningEmptyGrowing()}
            </div>
          )}

          {state.kind === 'evening_prompt' && (
            <div className="moments-prompt">
              <span className="moments-prompt-line">{copy.tile.eveningPrompt()}</span>
              <span className="moments-prompt-cta">{copy.tile.eveningPromptCta()}</span>
            </div>
          )}

          {state.kind === 'not_connected' && (
            <div className="moments-prompt">
              <span className="moments-prompt-line">{copy.tile.connectGooglePrompt()}</span>
              <span className="moments-prompt-cta">{copy.tile.connectGoogleCta()}</span>
            </div>
          )}

          {state.kind === 'evening_submitted' && (
            <div className="moments-resurface">
              <div className="moments-resurface-thumb">
                <img src={state.moment.photoRef.identifier} alt="" />
              </div>
              <div className="moments-resurface-caption">
                {copy.tile.submittedFor(new Date())}
              </div>
            </div>
          )}
        </button>
      </section>

      <MomentsSubmitFlow
        isOpen={submitOpen}
        onClose={() => { setSubmitOpen(false); setAppendingFor(null) }}
        date={submitDate}
        existing={existingForSubmit}
        appendMode={appendingFor != null}
        onSubmit={handleSubmit}
      />

      <MomentsModal
        isOpen={openedMoment !== null}
        onClose={() => setOpenedMoment(null)}
        title=""
      >
        {openedMoment && (
          <MomentsDayCard
            moment={openedMoment}
            onAddMore={() => openAddMore(openedMoment)}
          />
        )}
      </MomentsModal>

      <MomentsCollection
        isOpen={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        userId={userId}
      />
    </>
  )
}
