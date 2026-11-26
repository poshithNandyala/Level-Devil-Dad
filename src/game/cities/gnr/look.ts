import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame */
export const grade: Grade = { gx: 0.6, gy: 0.25, glow: 'rgba(255,236,190,0.26)', tint: 'rgba(255,170,60,0.07)', vig: 'rgba(30,20,10,0.2)' };

/** the grass and pebbles on top of the ground tiles */
export const tileCaps: GroundCaps = { cap: '#8BBF5A', capHi: '#AED581', blades: '#689F38', flowers: ['#FFB300', '#E53935'] };

/** one sentence for the postcard */
export const cityLine = 'A bamboo to vault on, a dinosaur that stomps, and a garba ring to slip through.';
