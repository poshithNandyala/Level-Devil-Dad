import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: warm sun, a little sea-green in the shade */
export const grade: Grade = { gx: 0.62, gy: 0.1, glow: 'rgba(255,240,190,0.28)', tint: 'rgba(40,150,150,0.07)', vig: 'rgba(10,36,40,0.2)' };

/** the red laterite road with its pale kerb stones on top */
export const tileCaps: GroundCaps = { cap: '#D9CFB4', capHi: '#F4ECD6', pebbles: '#A8442E', blades: '#2E6F40' };

/** one sentence for the postcard */
export const cityLine = 'Ship is late. Deer are early. Dad is in the mud.';
