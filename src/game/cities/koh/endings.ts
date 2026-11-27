// Kohima's door endings, one per built stage 02-05, each its own idea. Kinds start with 'koh-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';
import { ending as e04 } from './s04';
import { ending as e05 } from './s05';
import { ending as e06 } from './s06';
import { ending as e07 } from './s07';
import { ending as e08 } from './s08';
import { ending as e09 } from './s09';

export type KohEndingKind = 'koh-manch' | 'koh-dhila-patta' | 'koh-rim-lily' | 'koh-rocking-drum' | 'koh-skylight' | 'koh-garage-nose' | 'koh-kitchen-door' | 'koh-back-door';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<KohEndingKind, true> {}
}

export const endings: Record<KohEndingKind, Ending> = {
  'koh-manch': e02,
  'koh-dhila-patta': e03,
  'koh-rim-lily': e04,
  'koh-rocking-drum': e05,
  'koh-skylight': e06,
  'koh-garage-nose': e07,
  'koh-kitchen-door': e08,
  'koh-back-door': e09,
};
