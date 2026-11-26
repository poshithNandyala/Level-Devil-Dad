// Bhubaneswar's door endings, one per stage 02-10, each its own idea. Kinds start with 'bbi-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';

export type BbiEndingKind = 'bbi-goal-net';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<BbiEndingKind, true> {}
}

export const endings: Record<BbiEndingKind, Ending> = {
  'bbi-goal-net': e02,
};
