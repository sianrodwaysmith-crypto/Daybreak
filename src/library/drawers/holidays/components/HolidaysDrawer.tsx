import { useEffect, useMemo, useState } from 'react'
import { copy } from '../copy'
import { getHolidaysStorage } from '../storage'
import { ensureSeeded } from '../seed'
import type { Trip } from '../types'
import { WorldMap } from './WorldMap'

interface Props {
  onBack: () => void
}

const SHORT_MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec',
]

function shortMonthYear(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
function daysFromToday(iso: string): number {
  const target = new Date(iso + 'T00:00:00').getTime()
  const today  = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((target - today.getTime()) / (24 * 60 * 60 * 1000))
}
function dateRangeLine(t: Trip): string {
  if (!t.startDate) return ''
  const start = new Date(t.startDate + 'T00:00:00')
  const end   = t.endDate ? new Date(t.endDate + 'T00:00:00') : null
  const startStr = start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  if (!end) return startStr
  const endStr = end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
  return `${startStr} – ${endStr}`
}

export function HolidaysDrawer({ onBack }: Props) {
  const [trips, setTrips] = useState<Trip[]>([])
  const [showAddSoon, setShowAddSoon] = useState(false)
  const [expandVisited, setExpandVisited] = useState(false)
  const [expandWishlist, setExpandWishlist] = useState(false)

  useEffect(() => {
    let alive = true
    ensureSeeded().then(() => getHolidaysStorage().listTrips()).then(ts => {
      if (alive) setTrips(ts)
    })
    return () => { alive = false }
  }, [])

  const visited  = useMemo(() => trips.filter(t => t.status === 'visited'),  [trips])
  const planned  = useMemo(() => trips.filter(t => t.status === 'planned'),  [trips])
  const wishlist = useMemo(() => trips.filter(t => t.status === 'wishlist'), [trips])

  const visitedCountries = useMemo(() => new Set(visited.map(t => t.countryCode)).size, [visited])

  const visitedSorted  = useMemo(() => [...visited].sort(byMostRecentVisit), [visited])
  const wishlistSorted = useMemo(() => [...wishlist].sort(byMostRecentlyAdded), [wishlist])

  const nextTrip = useMemo(() => {
    return [...planned]
      .filter(t => !!t.startDate)
      .sort((a, b) => (a.startDate ?? '') < (b.startDate ?? '') ? -1 : 1)[0] ?? null
  }, [planned])

  const visitedShown  = expandVisited  ? visitedSorted  : visitedSorted.slice(0, 3)
  const wishlistShown = expandWishlist ? wishlistSorted : wishlistSorted.slice(0, 3)
  const visitedHidden  = visitedSorted.length  - visitedShown.length
  const wishlistHidden = wishlistSorted.length - wishlistShown.length

  return (
    <div className="library-drawer">
      <header className="library-drawer-head">
        <button type="button" className="library-link" onClick={onBack}>{copy.back}</button>
        <button type="button" className="library-pill" onClick={() => setShowAddSoon(s => !s)}>{copy.add}</button>
      </header>

      <h2 className="library-h1">{copy.title}</h2>
      <p className="library-tagline">{copy.tagline}</p>

      {showAddSoon && (
        <div className="library-add-soon">
          <p className="library-add-soon-primary">{copy.add_soon.primary}</p>
          <p className="library-add-soon-secondary">{copy.add_soon.secondary}</p>
          <button type="button" className="library-link" onClick={() => setShowAddSoon(false)}>{copy.add_soon.close}</button>
        </div>
      )}

      {/* Map card + stats */}
      <section className="library-card holidays-mapcard">
        <WorldMap visited={visited} planned={planned} />
        <div className="holidays-mapdivider" />
        <div className="holidays-stats">
          <div className="holidays-stat">
            <div className="holidays-stat-label">{copy.stats.visited}</div>
            <div className="holidays-stat-row">
              <span className="holidays-stat-num">{visitedCountries}</span>
              <span className="holidays-stat-suffix">{copy.stats.visitedSuffix(visitedCountries)}</span>
            </div>
          </div>
          <div className="holidays-stat">
            <div className="holidays-stat-label">{copy.stats.planned}</div>
            <div className="holidays-stat-row">
              <span className="holidays-stat-num">{planned.length}</span>
            </div>
          </div>
          <div className="holidays-stat">
            <div className="holidays-stat-label">{copy.stats.wishlist}</div>
            <div className="holidays-stat-row">
              <span className="holidays-stat-num">{wishlist.length}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Next trip — only if we have one */}
      {nextTrip && nextTrip.startDate && (
        <section>
          <div className="library-section-label">{copy.nextTripLabel}</div>
          <article className="holidays-nexttrip">
            <div className="holidays-nexttrip-row">
              <span className="holidays-nexttrip-dest">{nextTrip.destination}</span>
              <span className="holidays-nexttrip-when">{copy.inDays(daysFromToday(nextTrip.startDate))}</span>
            </div>
            <div className="holidays-nexttrip-sub">
              {dateRangeLine(nextTrip)}
              {nextTrip.travellingWith ? ` · ${nextTrip.travellingWith}` : ''}
            </div>
            <div className="holidays-nexttrip-divider" />
            <div className="holidays-nexttrip-meta">
              {nextTripMetaParts(nextTrip).join(' · ')}
            </div>
          </article>
        </section>
      )}

      {/* Where you've been */}
      <section>
        <div className="library-section-label">{copy.visitedLabel}</div>
        {visitedSorted.length === 0 && (
          <div className="library-empty">{copy.empty.visited}</div>
        )}
        <ul className="holidays-list">
          {visitedShown.map(t => (
            <li key={t.id}>
              <button type="button" className="holidays-row" onClick={() => alert(copy.countryDetailSoon)}>
                <span className="holidays-row-name">{t.destination}</span>
                <span className="holidays-row-meta">{shortMonthYear(t.startDate)}</span>
              </button>
            </li>
          ))}
        </ul>
        {visitedHidden > 0 && (
          <button type="button" className="library-more-link" onClick={() => setExpandVisited(true)}>
            {copy.moreLink(visitedHidden)}
          </button>
        )}
      </section>

      {/* Wishlist */}
      <section>
        <div className="library-section-label">{copy.wishlistLabel}</div>
        {wishlistSorted.length === 0 && (
          <div className="library-empty">{copy.empty.wishlist}</div>
        )}
        <ul className="holidays-list">
          {wishlistShown.map(t => (
            <li key={t.id}>
              <article className="holidays-row holidays-row-wish">
                <div className="holidays-row-name">{t.destination}</div>
                {t.note && <div className="holidays-row-note">{t.note}</div>}
              </article>
            </li>
          ))}
        </ul>
        {wishlistHidden > 0 && (
          <button type="button" className="library-more-link" onClick={() => setExpandWishlist(true)}>
            {copy.moreLink(wishlistHidden)}
          </button>
        )}
      </section>
    </div>
  )
}

function byMostRecentVisit(a: Trip, b: Trip): number {
  const av = a.startDate ?? ''
  const bv = b.startDate ?? ''
  return av < bv ? 1 : av > bv ? -1 : 0
}
function byMostRecentlyAdded(a: Trip, b: Trip): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0
}

function nextTripMetaParts(t: Trip): string[] {
  const out: string[] = []
  if (t.meta?.placesNoted)  out.push(copy.meta.placesNoted(t.meta.placesNoted))
  if (t.meta?.flightBooked) out.push(copy.meta.flightBooked)
  return out
}
