import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: cool hill morning, a little mist */
export const grade: Grade = { gx: 0.62, gy: 0.1, glow: 'rgba(230,240,250,0.26)', tint: 'rgba(90,120,140,0.07)', vig: 'rgba(14,30,26,0.22)' };

/** packed red earth with fern edges */
export const tileCaps: GroundCaps = { cap: '#8C5A3C', capHi: '#B07A52', blades: '#4F7F4A', pebbles: '#5A3A28' };

/** one sentence for the postcard (bible section 6) */
export const cityLine = 'Kohima: steep streets, warm porridge, and the strongest smell in the Northeast.';
