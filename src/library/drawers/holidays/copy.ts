/**
 * All user-facing strings for the Holidays drawer live here.
 * Functions where the copy depends on data; constants otherwise.
 */

export const copy = {
  back:    '← library',
  title:   'Holidays',
  tagline: "Tap a country to mark visited or wishlist.",

  stats: {
    visited:  (n: number) => `${n} visited`,
    wishlist: (n: number) => `${n} wishlist`,
  },

  search: {
    placeholder: 'Search countries…',
  },

  filters: {
    all:       'all',
    visited:   'visited',
    wishlist:  'wishlist',
    untagged:  'untagged',
  },

  empty: {
    none: 'No countries match.',
  },

  toggles: {
    visitedAria:  (name: string) => `Mark ${name} as visited`,
    wishlistAria: (name: string) => `Add ${name} to wishlist`,
  },
}
