import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: cool, clear mountain light */
export const grade: Grade = { gx: 0.62, gy: 0.1, glow: 'rgba(255,244,218,0.22)', tint: 'rgba(120,160,190,0.07)', vig: 'rgba(20,30,40,0.18)' };

/** the clean paving of a walking street with a planter strip */
export const tileCaps: GroundCaps = { cap: '#D9D4C7', capHi: '#F1EEE6', blades: '#6E9F5E', pebbles: '#E07A5F' };

/** one sentence for the postcard */
export const cityLine = 'Every house is on the ground floor. Just not your ground.';
