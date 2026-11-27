import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: a soft winter-morning haze, warm in the middle */
export const grade: Grade = { gx: 0.55, gy: 0.18, glow: 'rgba(255,236,205,0.24)', tint: 'rgba(200,170,130,0.07)', vig: 'rgba(40,28,18,0.2)' };

/** the ground caps: a cream lime-plaster kerb with a carved green border */
export const tileCaps: GroundCaps = { cap: '#F3EEE6', capHi: '#FFFFFF', blades: '#5A8F7B', pebbles: '#C9B596' };

/** one sentence for the postcard */
export const cityLine = 'Pehle aap, Dad. No, really. Pehle aap.';
