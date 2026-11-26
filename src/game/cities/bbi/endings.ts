// Bhubaneswar's door endings, one per stage 02-10, each a new idea. Kinds start with 'bbi-'. TODO.
import type { Ending } from '../../levels/endkit';

export type BbiEndingKind = never; // TODO: 'bbi-...' | 'bbi-...' (nine of them)

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<BbiEndingKind, true> {}
}

export const endings: Record<BbiEndingKind, Ending> = {};
