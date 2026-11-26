import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.7, gy: -0.22, glow: 'rgba(255,228,160,0.42)', tint: 'rgba(255,160,70,0.12)', vig: 'rgba(96,32,8,0.16)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#C47A4A', capHi: '#E09A66', pebbles: '#8D4E2C' };

/** one sentence for the postcard */
export const cityLine = 'A capital under construction: cranes, barrage gates and chilli dust.';
