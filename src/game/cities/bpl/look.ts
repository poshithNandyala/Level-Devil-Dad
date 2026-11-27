import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.3, gy: 0.24, glow: 'rgba(255,236,200,0.24)', tint: 'rgba(60,150,160,0.07)', vig: 'rgba(10,30,40,0.2)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#B9C7A6', capHi: '#D9E3C8', pebbles: '#7E8F6E' };

/** one sentence for the postcard */
export const cityLine = 'Skip like a stone across the big lake, step in to a cave painting, and never believe Surma Bhopali.';
