// Gangtok's door endings, one per stage 02-10, each its own idea. Kinds start with 'gtk-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';
import { ending as e04 } from './s04';
import { ending as e05 } from './s05';
import { ending as e06 } from './s06';
import { ending as e07 } from './s07';
import { ending as e08 } from './s08';
import { ending as e09 } from './s09';
import { ending as e10 } from './s10';

export type GtkEndingKind = 'gtk-steam-vent' | 'gtk-jhola-entry' | 'gtk-lift-counts-down' | 'gtk-taxi-meter' | 'gtk-tank-overflow' | 'gtk-rope-climbs-to-door' | 'gtk-cabin-both-doors' | 'gtk-gate-yak-snowbank' | 'gtk-viewpoint-second-floor';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<GtkEndingKind, true> {}
}

export const endings: Record<GtkEndingKind, Ending> = {
  'gtk-steam-vent': e02,
  'gtk-jhola-entry': e03,
  'gtk-lift-counts-down': e04,
  'gtk-taxi-meter': e05,
  'gtk-tank-overflow': e06,
  'gtk-rope-climbs-to-door': e07,
  'gtk-cabin-both-doors': e08,
  'gtk-gate-yak-snowbank': e09,
  'gtk-viewpoint-second-floor': e10,
};
