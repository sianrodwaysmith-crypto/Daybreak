/**
 * Module-private unlock state.
 *
 * Exposed publicly only via the `journal` object in index.ts as
 * `isUnlocked()` and `lock()`. There is intentionally no `unlock()` in
 * the public API — unlocking only happens via the in-module UnlockScreen
 * after PIN verification.
 */

let unlocked = false
const listeners = new Set<(v: boolean) => void>()

export function isUnlocked(): boolean { return unlocked }

export function setUnlocked(v: boolean): void {
  if (unlocked === v) return
  unlocked = v
  for (const l of listeners) l(v)
}

export function lock(): void { setUnlocked(false) }

export function subscribe(fn: (v: boolean) => void): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}
