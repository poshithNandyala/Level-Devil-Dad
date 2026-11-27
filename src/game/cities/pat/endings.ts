// Patna's door endings, one per stage 02-10, each its own idea. Kinds start with 'pat-'.
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

export type PatEndingKind = 'pat-musal' | 'pat-ghanti' | 'pat-bhitar' | 'pat-nawka' | 'pat-toll' | 'pat-hauled-basket' | 'pat-mound' | 'pat-charkhi' | 'pat-ginti-pad';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PatEndingKind, true> {}
}

export const endings: Record<PatEndingKind, Ending> = {
  'pat-musal': e02,
  'pat-ghanti': e03,
  'pat-bhitar': e04,
  'pat-nawka': e05,
  'pat-toll': e06,
  'pat-hauled-basket': e07,
  'pat-mound': e08,
  'pat-charkhi': e09,
  'pat-ginti-pad': e10,
};
