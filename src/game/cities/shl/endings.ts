// Shillong's door endings, one per built stage, each its own idea. Kinds start with 'shl-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';
import { ending as e04 } from './s04';
import { ending as e05 } from './s05';
import { ending as e06 } from './s06';
import { ending as e07 } from './s07';
import { ending as e08 } from './s08';

export type ShlEndingKind = 'shl-dish' | 'shl-tollbar' | 'shl-halfdoor' | 'shl-pool' | 'shl-rootdoor' | 'shl-column' | 'shl-tap';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ShlEndingKind, true> {}
}

export const endings: Record<ShlEndingKind, Ending> = {
  'shl-dish': e02,
  'shl-tollbar': e03,
  'shl-halfdoor': e04,
  'shl-pool': e05,
  'shl-rootdoor': e06,
  'shl-column': e07,
  'shl-tap': e08,
};
