// Itanagar's door endings, one per stage 02-10, each its own idea. Kinds start with 'ita-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';
import { ending as e04 } from './s04';
import { ending as e05 } from './s05';
import { ending as e06 } from './s06';
import { ending as e07 } from './s07';
import { ending as e08 } from './s08';
import { ending as e09 } from './s09';

export type ItaEndingKind = 'ita-phatak' | 'ita-baada' | 'ita-peti' | 'ita-khokhla' | 'ita-mori' | 'ita-tailgate' | 'ita-ghat' | 'ita-darwaza';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ItaEndingKind, true> {}
}

export const endings: Record<ItaEndingKind, Ending> = {
  'ita-phatak': e02,
  'ita-baada': e03,
  'ita-peti': e04,
  'ita-khokhla': e05,
  'ita-mori': e06,
  'ita-tailgate': e07,
  'ita-ghat': e08,
  'ita-darwaza': e09,
};
