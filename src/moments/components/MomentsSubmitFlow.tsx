import { useEffect, useMemo, useRef, useState } from 'react'
import type { Moment, PhotoRef, PhotoPickerSource } from '../types'
import { copy } from '../copy'
import { fromISO, daysBetween } from '../core/dateHelpers'
import { getPicker } from '../pickers'
import { BrowserPhotoPicker } from '../pickers/BrowserPhotoPicker'
import { MomentsModal } from './MomentsModal'

interface Props {
  /** Open/close controlled by parent. */
  isOpen:        boolean
  onClose:       () => void
  /** ISO YYYY-MM-DD that the moment will be saved against. */
  date:          string
  /** Existing moment for this date, if any — drives the overwrite warning. */
  existing?:     Moment | null
  /** Called with the saved moment after the storage write completes. */
  onSubmit:      (params: { date: string; photoRef: PhotoRef; note?: string }) => Promise<Moment>
  /** DI: defaults to the module's BrowserPhotoPicker. */
  picker?:       PhotoPickerSource
}

type Step = 'pick' | 'confirm'

export function MomentsSubmitFlow({
  isOpen, onClose, date, existing, onSubmit,
  picker = getPicker(),
}: Props) {
  const [step,   setStep]   = useState<Step>('pick')
  const [photo,  setPhoto]  = useState<PhotoRef | null>(null)
  const [note,   setNote]   = useState('')
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  // How many whole days between today and the target date. Used by copy
  // to pick "today", "yesterday", or a longer-form label.
  const { daysAgo, dateObj } = useMemo(() => {
    const d = fromISO(date)
    return { daysAgo: daysBetween(new Date(), d), dateObj: d }
  }, [date])

  // Reset internal state every time the flow re-opens so it starts clean.
  useEffect(() => {
    if (!isOpen) return
    setStep('pick')
    setPhoto(null)
    setNote(existing?.note ?? '')
    setSaving(false)
    setError(null)
  }, [isOpen, existing?.id])

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    try {
      // BrowserPhotoPicker exposes resolveFromFile; future pickers wouldn't
      // be invoked through the file input, they'd be invoked via picker.pick()
      // and return a PhotoRef directly. We branch here.
      let ref: PhotoRef
      if (picker instanceof BrowserPhotoPicker) {
        ref = await picker.resolveFromFile(file)
      } else {
        const picked = await picker.pick()
        if (!picked) return
        ref = picked
      }
      setPhoto(ref)
      setStep('confirm')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  async function handleSave() {
    if (!photo) return
    setSaving(true)
    setError(null)
    try {
      await onSubmit({ date, photoRef: photo, note: note.trim() || undefined })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSaving(false)
    }
  }

  return (
    <MomentsModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 'pick'
          ? copy.submit.pickTitleFor(daysAgo, dateObj)
          : copy.submit.confirmTitleFor(daysAgo, dateObj)
      }
    >
      {step === 'pick' && (
        <div className="moments-submit-pick">
          <p className="moments-help">{copy.submit.pickHelpFor(daysAgo)}</p>
          {existing && (
            <p className="moments-warning">{copy.submit.overwriteWarningFor(daysAgo)}</p>
          )}
          <button
            type="button"
            className="moments-btn-primary"
            onClick={() => fileRef.current?.click()}
          >
            {copy.submit.pickCta()}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChosen}
          />
          {error && <p className="moments-error">{error}</p>}
        </div>
      )}

      {step === 'confirm' && photo && (
        <div className="moments-submit-confirm">
          <div className="moments-photo-frame">
            <img src={photo.identifier} alt="" />
          </div>
          <input
            type="text"
            className="moments-note-input"
            placeholder={copy.submit.notePlaceholder()}
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={140}
          />
          {error && <p className="moments-error">{error}</p>}
          <div className="moments-submit-actions">
            <button
              type="button"
              className="moments-btn-quiet"
              onClick={onClose}
              disabled={saving}
            >
              {copy.submit.cancel()}
            </button>
            <button
              type="button"
              className="moments-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? copy.submit.saving() : copy.submit.save()}
            </button>
          </div>
        </div>
      )}
    </MomentsModal>
  )
}
