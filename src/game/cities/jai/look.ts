import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.65, gy: 0.22, glow: 'rgba(255,222,196,0.26)', tint: 'rgba(230,100,120,0.07)', vig: 'rgba(40,15,20,0.2)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#E8B989', capHi: '#F6D4AE', pebbles: '#C2885E' };

/** one sentence for the postcard */
export const cityLine = 'Puppet strings, a marble bowl to swing out of, a horse that won’t stop, and an elephant with a trunk.';
