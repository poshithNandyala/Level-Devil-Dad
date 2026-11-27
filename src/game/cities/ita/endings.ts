// Itanagar's door endings. One door keeps an idea of its own (04, the packing shed); every other ITA door is plain
// (no twist): see levels.ts and reports/cities/ita/BUILD.md for the check each door went through. Kinds start with 'ita-'.
import type { Ending } from '../../levels/endkit';
import { ending as e04 } from './s04';

export type ItaEndingKind = 'ita-peti';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ItaEndingKind, true> {}
}

export const endings: Record<ItaEndingKind, Ending> = {
  'ita-peti': e04,
};
