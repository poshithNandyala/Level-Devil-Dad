import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.22, gy: -0.16, glow: 'rgba(255,246,220,0.32)', tint: 'rgba(255,214,140,0.08)', vig: 'rgba(26,48,96,0.12)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#F4E6C2', capHi: '#FFF6DF', pebbles: '#D8C397' };

/** one sentence for the postcard */
export const cityLine = 'Yellow lanes, rock beach spouts and baguettes at speed.';
