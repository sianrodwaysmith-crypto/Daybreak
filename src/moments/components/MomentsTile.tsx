import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Moment, MemorySurface, PhotoRef } from '../types'
import { copy } from '../copy'
import { getStorage } from '../storage'
import { evaluateMemoryRules } from '../core/memoryRules'
import { isAfterHourLocal, todayISO } from '../core/dateHelpers'
import { MomentsSubmitFlow } from './MomentsSubmitFlow'
import { MomentsDayCard } from './MomentsDayCard'
import { MomentsModal } from './MomentsModal'
import { MomentsCollection } from './MomentsCollection'

const EVENING_HOUR = 18

type TileState =
  | { kind: 'morning_resurface'; memory: MemorySurface }
  | { kind: 'morning_empty';     dayOne: boolean }
  | { kind: 'evening_prompt'                       }
  | { kind: 'evening_submitted'; moment: Moment    }
  | { kind: 'loading'                              }

interface Props {
  /** Defaults to 'sian' to match the rest of the single-user PWA. */
  userId?:        string
  /** Test override: pretend the local clock is set to this. */
  nowOverride?:   Date
  /** Test override: bypass the 18:00 rule. */
  forceEvening?:  boolean
}

export function MomentsTile({ userId = 'sian', nowOverride, forceEvening }: Props) {
  const now = useMemo(() => nowOverride ?? new Date(), [nowOverride])

  const [state,           setState]           = useState<TileState>({ kind: 'loading' })
  const [submitOpen,      setSubmitOpen]      = useState(false)
  const [openedMoment,    setOpenedMoment]    = useState<Moment | null>(null)
  const [collectionOpen,  setCollectionOpen]  = useState(false)
  const [refreshKey,      setRefreshKey]      = useState(0)

  const refresh = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    let alive = true
    const storage = getStorage()
    const today = todayISO(now)

    Promise.all([
      storage.getByDate(userId, today),
      storage.getAll(userId),
    ]).then(([todays, all]) => {
      if (!alive) return
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
  }, [userId, now, forceEvening, refreshKey])

  function openTile() {
    switch (state.kind) {
      case 'morning_resurface':   setOpenedMoment(state.memory.moment); break
      case 'evening_submitted':   setOpenedMoment(state.moment);        break
      case 'evening_prompt':      setSubmitOpen(true);                  break
      case 'morning_empty':       setSubmitOpen(true);                  break
    }
  }

  async function handleSubmit(params: { date: string; photoRef: PhotoRef; note?: string }) {
    const created = await getStorage().submit({ userId, ...params })
    refresh()
    return created
  }

  return (
    <>
      <section className="moments-tile">
        <div className="moments-head">
          <span className="moments-eyebrow">{copy.sectionLabel}</span>
          <button
            type="button"
            className="moments-collection-link"
            onClick={() => setCollectionOpen(true)}
          >
            {copy.tile.collectionLink()}
          </button>
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
        onClose={() => setSubmitOpen(false)}
        date={todayISO(now)}
        existing={state.kind === 'evening_submitted' ? state.moment : null}
        onSubmit={handleSubmit}
      />

      <MomentsModal
        isOpen={openedMoment !== null}
        onClose={() => setOpenedMoment(null)}
        title=""
      >
        {openedMoment && <MomentsDayCard moment={openedMoment} />}
      </MomentsModal>

      <MomentsCollection
        isOpen={collectionOpen}
        onClose={() => setCollectionOpen(false)}
        userId={userId}
      />
    </>
  )
}
