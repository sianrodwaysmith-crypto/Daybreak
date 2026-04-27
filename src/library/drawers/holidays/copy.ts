/**
 * All user-facing strings for the Holidays drawer live here.
 * Functions where the copy depends on data; constants otherwise.
 */

export const copy = {
  back:    '← library',
  add:     '+ add',
  title:   'Holidays',
  tagline: "Where you've been. Where you're going.",

  stats: {
    visited:  'visited',
    visitedSuffix: (n: number) => n === 1 ? 'country' : 'countries',
    planned:  'planned',
    wishlist: 'on the wishlist',
  },

  nextTripLabel:    'next trip',
  visitedLabel:     "where you've been",
  wishlistLabel:    'on the wishlist',

  inDays:  (n: number) => n === 0 ? 'today' : n === 1 ? 'in 1 day' : `in ${n} days`,
  moreLink: (n: number) => n === 1 ? '1 more →' : `${n} more →`,

  empty: {
    visited:  'No countries visited yet.',
    planned:  null,                    // section is omitted when empty
    wishlist: 'Nothing on the wishlist yet.',
  },

  meta: {
    placesNoted:  (n: number) => n === 1 ? '1 place noted' : `${n} places noted`,
    flightBooked: 'flight booked',
  },

  add_soon: {
    primary:   'Adding trips is coming next.',
    secondary: 'For now, this is a quiet record.',
    close:     'close',
  },

  countryDetailSoon: 'Country detail — coming soon',
}
