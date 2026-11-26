import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.7, gy: 0.2, glow: 'rgba(255,240,200,0.24)', tint: 'rgba(60,140,200,0.08)', vig: 'rgba(10,30,50,0.2)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#D9C79E', capHi: '#EFE2C0', pebbles: '#A8946C' };

/** one sentence for the postcard */
export const cityLine = 'Boats you pedal by running, ice that melts under you, and a whole boatyard passing you along.';
