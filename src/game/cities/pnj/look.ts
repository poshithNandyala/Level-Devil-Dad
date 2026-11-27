import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.22, gy: 0.5, glow: 'rgba(255,186,120,0.3)', tint: 'rgba(255,110,70,0.09)', vig: 'rgba(40,14,30,0.22)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#5E9E36', capHi: '#8CC152', blades: '#4C8A2C', flowers: ['#E91E63', '#FFEB3B'] };

/** one sentence for the postcard */
export const cityLine = 'Gossip you can stand on, a siesta you mustn’t break, and a ferry that waits for nobody.';
