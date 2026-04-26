import type { PhotoRef, PhotoPickerSource } from '../types'

/**
 * TODO: real Google Photos picker. Should use the Google Photos Library API
 * (OAuth 2 + photoslibrary.readonly scope) to surface today's items, return
 * the chosen mediaItem id, and resolve a baseUrl for photoRef.identifier.
 *
 * Implements the same PhotoPickerSource interface so swapping the factory
 * selection in pickers/index.ts is a one-line change.
 */
export class GooglePhotosPicker implements PhotoPickerSource {
  async pick(): Promise<PhotoRef | null> {
    throw new Error('GooglePhotosPicker.pick not implemented')
  }
}
