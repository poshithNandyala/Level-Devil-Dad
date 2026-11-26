// Patna's door endings, one per stage 02-10, each a new idea. Kinds start with 'pat-'. TODO.
import type { Ending } from '../../levels/endkit';

export type PatEndingKind = never; // TODO: 'pat-...' | 'pat-...' (nine of them)

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<PatEndingKind, true> {}
}

export const endings: Record<PatEndingKind, Ending> = {};
