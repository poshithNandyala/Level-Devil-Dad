// Bhubaneswar's door endings, one per stage 02-10, each its own idea. Kinds start with 'bbi-'.
import type { Ending } from '../../levels/endkit';
import { ending as e02 } from './s02';
import { ending as e03 } from './s03';
import { ending as e04 } from './s04';
import { ending as e05 } from './s05';
import { ending as e06 } from './s06';

export type BbiEndingKind = 'bbi-goal-net' | 'bbi-lantern-drop' | 'bbi-curl-stair' | 'bbi-behind-step' | 'bbi-motif-door';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<BbiEndingKind, true> {}
}

export const endings: Record<BbiEndingKind, Ending> = {
  'bbi-goal-net': e02,
  'bbi-lantern-drop': e03,
  'bbi-curl-stair': e04,
  'bbi-behind-step': e05,
  'bbi-motif-door': e06,
};
