import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.18, gy: 0.56, glow: 'rgba(255,160,100,0.36)', tint: 'rgba(220,80,160,0.12)', vig: 'rgba(28,8,52,0.22)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#59A452', capHi: '#83C46F', blades: '#478A41' };

/** one sentence for the postcard */
export const cityLine = 'The auto carrying the exit reacts to how you move.';
