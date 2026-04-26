import type { PhotoRef, PhotoPickerSource } from '../types'

/**
 * Default photo picker: a hidden <input type="file"> that the submission
 * flow renders directly. The "picker" here is conceptual — the actual
 * file dialog is the browser's, triggered by a click on the input. We
 * still expose a pick() method so the submission flow can call it via
 * the same interface as future Apple/Google pickers.
 *
 * The pick() promise resolves once the user has chosen a file (or cancelled).
 * The flow wires the input change event into resolveFromFile().
 */
export class BrowserPhotoPicker implements PhotoPickerSource {
  // Programmatic pick is not supported by a plain file input — the user has
  // to click it themselves. Components that use this picker render the
  // <input> directly and call resolveFromFile when it changes. pick() is
  // therefore not used in the browser flow today; it exists to satisfy the
  // interface and to keep the call site uniform with future pickers.
  async pick(): Promise<PhotoRef | null> {
    return null
  }

  /**
   * Called by the submission flow when a File is selected. Reads the file
   * into a data URL so the photo can persist in localStorage; for the real
   * backend this would upload to object storage and return the CDN URL.
   */
  async resolveFromFile(file: File): Promise<PhotoRef> {
    const identifier = await readAsDataURL(file)
    const dimensions = await readDimensions(identifier).catch(() => undefined)
    return {
      source: 'upload',
      identifier,
      width:  dimensions?.width,
      height: dimensions?.height,
    }
  }
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

function readDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
    img.onerror = () => reject(new Error('decode failed'))
    img.src = dataUrl
  })
}
