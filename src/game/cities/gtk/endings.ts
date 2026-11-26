// Gangtok's door endings, one per stage 02-10, each its own idea. Kinds start with 'gtk-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';

export type GtkEndingKind = 'gtk-steam-vent' | 'gtk-jhola-entry';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<GtkEndingKind, true> {}
}

export const endings: Record<GtkEndingKind, Ending> = {
  'gtk-steam-vent': e02,
  'gtk-jhola-entry': e03,
};
