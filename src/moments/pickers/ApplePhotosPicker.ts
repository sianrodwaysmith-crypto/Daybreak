import type { PhotoRef, PhotoPickerSource } from '../types'

/**
 * TODO: real Apple Photos picker. Should bridge to PhotosUI / EventKit via
 * a native shell or a serverless intermediary, return an asset id, and
 * resolve a CDN-hosted URL to populate photoRef.identifier.
 *
 * Implements the same PhotoPickerSource interface so swapping the factory
 * selection in pickers/index.ts is a one-line change.
 */
export class ApplePhotosPicker implements PhotoPickerSource {
  async pick(): Promise<PhotoRef | null> {
    throw new Error('ApplePhotosPicker.pick not implemented')
  }
}
