import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.7, gy: 0.2, glow: 'rgba(255,240,190,0.26)', tint: 'rgba(120,170,60,0.07)', vig: 'rgba(20,35,10,0.2)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#9CCC65', capHi: '#C5E1A5', pebbles: '#8D5A3B' };

/** one sentence for the postcard */
export const cityLine = 'Stilts over the paddy mud, a clock that only ticks when you move, and a hill of rice to climb.';
