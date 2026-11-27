// Shillong's door endings, one per built stage, each its own idea. Kinds start with 'shl-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';
import { ending as e04 } from './s04';

export type ShlEndingKind = 'shl-dish' | 'shl-tollbar' | 'shl-halfdoor';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ShlEndingKind, true> {}
}

export const endings: Record<ShlEndingKind, Ending> = {
  'shl-dish': e02,
  'shl-tollbar': e03,
  'shl-halfdoor': e04,
};
