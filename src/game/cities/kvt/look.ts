import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.74, gy: -0.22, glow: 'rgba(255,255,236,0.34)', tint: 'rgba(60,220,235,0.10)', vig: 'rgba(0,48,86,0.12)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#F1E7CF', capHi: '#FFF9EA', pebbles: '#D9CBAA' };

/** one sentence for the postcard */
export const cityLine = 'The lagoon, the tide and the boat all keep their own schedule.';
