// Patna's door endings, one per stage 02-10, each its own idea. Kinds start with 'pat-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';

export type PatEndingKind = 'pat-musal';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PatEndingKind, true> {}
}

export const endings: Record<PatEndingKind, Ending> = {
  'pat-musal': e02,
};
