/**
 * PIN hashing + verification using PBKDF2-SHA256 via the Web Crypto API.
 *
 * Why PBKDF2 and not bcrypt/Argon2:
 *  - Browser-native, zero dependencies, zero bundle cost.
 *  - 200k iterations of SHA-256 is appropriate for a 4-digit PIN: the
 *    keyspace is small (10000), so the work factor matters less than
 *    forcing per-attempt computation. An attacker with the device can
 *    still brute-force in seconds either way; the threat model is the
 *    casual shoulder-surfer / device-handler, not nation-state forensics.
 *  - v2's encrypted-storage upgrade can swap to PBKDF2 or Argon2 for
 *    proper key derivation; the on-disk auth shape stays identical.
 *
 * Pin is stored hashed only. Plaintext is never persisted.
 */

import type { JournalAuth } from './types'

const ALGORITHM:  'PBKDF2-SHA256' = 'PBKDF2-SHA256'
const ITERATIONS: number          = 200_000
const HASH_BITS:  number          = 256
const SALT_BYTES: number          = 16

function bytesToBase64(bytes: Uint8Array<ArrayBuffer>): string {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}
function base64ToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const s = atob(b64)
  const out = new Uint8Array(new ArrayBuffer(s.length))
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

async function deriveBits(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<ArrayBuffer> {
  const enc = new TextEncoder().encode(pin)
  const key = await crypto.subtle.importKey('raw', enc, 'PBKDF2', false, ['deriveBits'])
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    HASH_BITS,
  )
}

function newSaltBuffer(): Uint8Array<ArrayBuffer> {
  // Allocate a concrete ArrayBuffer (not ArrayBufferLike) so the typed
  // array is usable as a BufferSource under TS 6's stricter lib.dom types.
  const buf = new ArrayBuffer(SALT_BYTES)
  const view = new Uint8Array(buf)
  crypto.getRandomValues(view)
  return view
}

export async function hashPin(pin: string): Promise<JournalAuth['pinHash']> {
  const salt = newSaltBuffer()
  const bits = await deriveBits(pin, salt, ITERATIONS)
  return {
    algorithm:  ALGORITHM,
    iterations: ITERATIONS,
    salt:       bytesToBase64(salt),
    hash:       bytesToBase64(new Uint8Array(bits)),
  }
}

export async function verifyPin(pin: string, stored: JournalAuth['pinHash']): Promise<boolean> {
  // Copy stored salt bytes into an ArrayBuffer-backed view so deriveBits
  // accepts it under TS 6's stricter BufferSource typing.
  const raw = base64ToBytes(stored.salt)
  const salt = new Uint8Array(new ArrayBuffer(raw.byteLength))
  salt.set(raw)
  const bits = await deriveBits(pin, salt, stored.iterations)
  const candidate = bytesToBase64(new Uint8Array(bits))
  return candidate.length === stored.hash.length && candidate === stored.hash
}
