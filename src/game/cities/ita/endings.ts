// Itanagar's door endings, one per stage 02-10, each its own idea. Kinds start with 'ita-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';

export type ItaEndingKind = 'ita-phatak';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ItaEndingKind, true> {}
}

export const endings: Record<ItaEndingKind, Ending> = {
  'ita-phatak': e02,
};
