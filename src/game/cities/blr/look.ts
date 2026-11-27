import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.12, gy: 0.34, glow: 'rgba(255,206,190,0.32)', tint: 'rgba(196,140,230,0.12)', vig: 'rgba(42,20,74,0.16)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#5E9E45', capHi: '#8CC765', blades: '#4E8A38', flowers: ['#B983D9', '#F7F7F7'] };

/** one sentence for the postcard */
export const cityLine = 'Signals stop and rearrange the vehicles you stand on.';
