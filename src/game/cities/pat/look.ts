import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: hot, hazy and gold */
export const grade: Grade = { gx: 0.7, gy: 0.14, glow: 'rgba(255,226,160,0.3)', tint: 'rgba(230,170,70,0.08)', vig: 'rgba(52,30,10,0.22)' };

/** sun-baked brick paving with dust at the edges */
export const tileCaps: GroundCaps = { cap: '#C9A56B', capHi: '#E3C58A', blades: '#A9824A', pebbles: '#7A5A3A' };

/** one sentence for the postcard */
export const cityLine = 'Two and a half thousand years old, and still stuck on the Setu.';
