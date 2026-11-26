import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** a warm, dusty afternoon over laterite */
export const grade: Grade = { gx: 0.7, gy: 0.1, glow: 'rgba(255,236,190,0.26)', tint: 'rgba(200,110,60,0.03)', vig: 'rgba(40,18,8,0.16)' };

/** laterite blocks with a carved band on top */
export const tileCaps: GroundCaps = { cap: '#C98A55', capHi: '#E7B582', blades: '#9C5A32', pebbles: '#6E3A1E' };

/** one sentence for the postcard */
export const cityLine = 'Stone wheels that don’t turn, and a city that never stops eating.';
