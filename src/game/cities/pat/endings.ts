// Patna's door endings, one per stage 02-10, each its own idea. Kinds start with 'pat-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e04 } from './s04';

export type PatEndingKind = 'pat-musal' | 'pat-bhitar';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PatEndingKind, true> {}
}

export const endings: Record<PatEndingKind, Ending> = {
  'pat-musal': e02,
  'pat-bhitar': e04,
};
