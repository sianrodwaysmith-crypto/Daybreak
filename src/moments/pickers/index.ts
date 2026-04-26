import { BrowserPhotoPicker } from './BrowserPhotoPicker'

/**
 * Factory selecting the photo picker. For now we always return the browser
 * picker because the Apple and Google ones are stubs. When their real
 * implementations land, switch on the env or platform here.
 */

// Singleton — keeps any picker-internal state stable across renders.
let instance: BrowserPhotoPicker | null = null

export function getPicker(): BrowserPhotoPicker {
  if (instance) return instance
  instance = new BrowserPhotoPicker()
  return instance
}
