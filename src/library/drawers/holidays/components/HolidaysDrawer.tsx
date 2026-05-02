import { useEffect, useMemo, useState } from 'react'
import { copy } from '../copy'
import { getHolidaysStorage } from '../storage'
import { ensureSeeded } from '../seed'
import { COUNTRIES, flagEmoji } from '../countries'
import type { Trip, TripStatus } from '../types'
import { WorldMap } from './WorldMap'

interface Props {
  onBack: () => void
}

type Filter = 'all' | 'visited' | 'wishlist' | 'untagged'
/** Country-level state derived from any number of underlying Trip rows
 *  for the same code. 'visited' wins over 'wishlist' when both exist. */
type CountryState = 'visited' | 'wishlist' | null

const USER_OWNED_STATUSES: TripStatus[] = ['visited', 'wishlist']

/**
 * HolidaysDrawer — A-Z scrollable country list with two-icon toggles,
 * a search field, and filter chips. The map sits below as a satisfying
 * summary view. Wholesale redesign of the previous section-based layout.
 */
export function HolidaysDrawer({ onBack }: Props) {
  const [trips, setTrips]   = useState<Trip[]>([])
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  // Initial load. ensureSeeded() runs first so any existing seeded trips
  // are present, then we wipe them — the new drawer is opt-in marking
  // and a list of pre-marked sample countries doesn't fit that intent.
  // User-saved (non-seed) trips persist.
  useEffect(() => {
    let alive = true
    ;(async () => {
      await ensureSeeded()
      const store = getHolidaysStorage()
      const all = await store.listTrips()
      if (all.some(t => t.isSeed)) {
        await store.clearSeed()
      }
      const fresh = await store.listTrips()
      if (alive) setTrips(fresh)
    })()
    return () => { alive = false }
  }, [])

  // Map countryCode → derived country-level state.
  const stateByCode = useMemo(() => {
    const m = new Map<string, CountryState>()
    for (const t of trips) {
      if (t.status === 'visited') {
        m.set(t.countryCode, 'visited')
      } else if (t.status === 'wishlist' || t.status === 'planned') {
        // Don't downgrade an already-visited country.
        if (m.get(t.countryCode) !== 'visited') m.set(t.countryCode, 'wishlist')
      }
    }
    return m
  }, [trips])

  const visitedCount = useMemo(
    () => Array.from(stateByCode.values()).filter(s => s === 'visited').length,
    [stateByCode],
  )
  const wishlistCount = useMemo(
    () => Array.from(stateByCode.values()).filter(s => s === 'wishlist').length,
    [stateByCode],
  )

  // Filtered + searched country list.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return COUNTRIES.filter(c => {
      const state = stateByCode.get(c.code) ?? null
      if (filter === 'visited'  && state !== 'visited')  return false
      if (filter === 'wishlist' && state !== 'wishlist') return false
      if (filter === 'untagged' && state !== null)       return false
      if (q && !c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, filter, stateByCode])

  // Toggle helpers. Each toggle deletes any existing trips for the
  // country regardless of status, then writes a new trip in the chosen
  // state — so toggling visited on clears wishlist and vice versa.
  // A country has at most one user-owned state at a time.
  async function setCountryState(code: string, name: string, target: CountryState) {
    const store = getHolidaysStorage()
    const toRemove = trips.filter(
      t => t.countryCode === code && USER_OWNED_STATUSES.includes(t.status),
    )
    for (const t of toRemove) await store.deleteTrip(t.id)

    if (target !== null) {
      const now = new Date().toISOString()
      const trip: Trip = {
        id:           `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        destination:  name,
        countryCode:  code,
        status:       target,
        createdAt:    now,
        updatedAt:    now,
      }
      await store.saveTrip(trip)
    }

    // Re-read from storage so local state reflects the canonical truth.
    const fresh = await store.listTrips()
    setTrips(fresh)
  }

  function onToggleVisited(code: string, name: string) {
    const current = stateByCode.get(code) ?? null
    void setCountryState(code, name, current === 'visited' ? null : 'visited')
  }
  function onToggleWishlist(code: string, name: string) {
    const current = stateByCode.get(code) ?? null
    void setCountryState(code, name, current === 'wishlist' ? null : 'wishlist')
  }

  // Trip arrays used by the map.
  const visitedTrips  = useMemo(() => trips.filter(t => t.status === 'visited'),  [trips])
  const wishlistTrips = useMemo(
    () => trips.filter(t => t.status === 'wishlist' || t.status === 'planned'),
    [trips],
  )

  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.back}</button>
      </header>

      <h2 className="library-h1">{copy.title}</h2>
      <p className="library-tagline">{copy.tagline}</p>

      <div className="holidays-stats">
        <span><strong>{visitedCount}</strong> visited</span>
        <span className="holidays-stats-sep" aria-hidden>·</span>
        <span><strong>{wishlistCount}</strong> wishlist</span>
      </div>

      <input
        type="text"
        className="holidays-search"
        placeholder={copy.search.placeholder}
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <div className="holidays-filters">
        {(['all', 'visited', 'wishlist', 'untagged'] as const).map(f => (
          <button
            key={f}
            type="button"
            className={`holidays-filter${filter === f ? ' is-active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {copy.filters[f]}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="holidays-empty">{copy.empty.none}</div>
      ) : (
        <ul className="holidays-list">
          {visible.map(c => {
            const state = stateByCode.get(c.code) ?? null
            return (
              <li key={c.code} className="holidays-row">
                <span className="holidays-row-flag" aria-hidden>{flagEmoji(c.code)}</span>
                <span className="holidays-row-name">{c.name}</span>
                <button
                  type="button"
                  className={`holidays-toggle holidays-toggle-visited${state === 'visited' ? ' is-active' : ''}`}
                  onClick={() => onToggleVisited(c.code, c.name)}
                  aria-label={copy.toggles.visitedAria(c.name)}
                  aria-pressed={state === 'visited'}
                >✓</button>
                <button
                  type="button"
                  className={`holidays-toggle holidays-toggle-wishlist${state === 'wishlist' ? ' is-active' : ''}`}
                  onClick={() => onToggleWishlist(c.code, c.name)}
                  aria-label={copy.toggles.wishlistAria(c.name)}
                  aria-pressed={state === 'wishlist'}
                >★</button>
              </li>
            )
          })}
        </ul>
      )}

      {(visitedTrips.length > 0 || wishlistTrips.length > 0) && (
        <div className="holidays-map-card">
          <WorldMap visited={visitedTrips} wishlist={wishlistTrips} />
        </div>
      )}
    </div>
  )
}
