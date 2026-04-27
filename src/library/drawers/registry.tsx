/**
 * Add a new drawer here. Each drawer must declare its id, name, icon,
 * metaLine function, component, and status. Drawers with status:
 * 'placeholder' render the shared coming-soon surface; live drawers
 * render their own component. Adding a seventh drawer should be a
 * single entry in this list — no scaffolding changes needed elsewhere.
 */

import type { DrawerManifest } from '../types'
import {
  HolidaysIcon, OutfitsIcon, RecipesIcon, RestaurantsIcon, GiftsIcon, ReadingIcon,
} from './icons'
import { PlaceholderDrawer } from '../components/PlaceholderDrawer'
import { HolidaysDrawer }       from './holidays/components/HolidaysDrawer'
import { useHolidaysMetaLine }  from './holidays/meta'

const useNullMetaLine = () => null

/**
 * The Library home renders its grid in this order. Use a function
 * factory pattern for component rendering so each entry can pass the
 * onBack callback uniformly without the registry knowing about it.
 */
export function buildRegistry(onBack: () => void): DrawerManifest[] {
  return [
    {
      id:           'holidays',
      name:         'Holidays',
      icon:         () => <HolidaysIcon />,
      useMetaLine:  useHolidaysMetaLine,
      component:    () => <HolidaysDrawer    onBack={onBack} />,
      status:       'live',
    },
    {
      id:           'outfits',
      name:         'Outfits',
      icon:         () => <OutfitsIcon />,
      useMetaLine:  useNullMetaLine,
      component:    () => <PlaceholderDrawer name="Outfits" onBack={onBack} />,
      status:       'placeholder',
    },
    {
      id:           'recipes',
      name:         'Recipes',
      icon:         () => <RecipesIcon />,
      useMetaLine:  useNullMetaLine,
      component:    () => <PlaceholderDrawer name="Recipes" onBack={onBack} />,
      status:       'placeholder',
    },
    {
      id:           'restaurants',
      name:         'Restaurants',
      icon:         () => <RestaurantsIcon />,
      useMetaLine:  useNullMetaLine,
      component:    () => <PlaceholderDrawer name="Restaurants" onBack={onBack} />,
      status:       'placeholder',
    },
    {
      id:           'gifts',
      name:         'Gifts',
      icon:         () => <GiftsIcon />,
      useMetaLine:  useNullMetaLine,
      component:    () => <PlaceholderDrawer name="Gifts" onBack={onBack} />,
      status:       'placeholder',
    },
    {
      id:           'reading',
      name:         'Reading',
      icon:         () => <ReadingIcon />,
      useMetaLine:  useNullMetaLine,
      component:    () => <PlaceholderDrawer name="Reading" onBack={onBack} />,
      status:       'placeholder',
    },
  ]
}
