import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame: humid, green-grey light */
export const grade: Grade = { gx: 0.62, gy: 0.16, glow: 'rgba(250,244,214,0.24)', tint: 'rgba(90,140,110,0.08)', vig: 'rgba(16,30,22,0.22)' };

/** riverbank sand with tufts of tea-green grass and a pale pebble */
export const tileCaps: GroundCaps = { cap: '#BBA68A', capHi: '#D8C8A8', blades: '#5E8C3A', pebbles: '#E7DAC0' };

export const cityLine = 'The river moves the islands. The dhol moves everyone else.';
