import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame. TODO */
export const grade: Grade = { gx: 0.68, gy: 0.12, glow: 'rgba(255,246,205,0.27)', tint: 'rgba(90,150,80,0.07)', vig: 'rgba(18,32,14,0.2)' };

/** the grass and pebbles on top of the ground tiles. TODO */
export const tileCaps: GroundCaps = { cap: '#7CB342', capHi: '#AED581', blades: '#5E8C33', pebbles: '#8D5A3B' };

/** one sentence for the postcard. TODO */
export const cityLine = 'TODO: one sentence for the postcard.';
