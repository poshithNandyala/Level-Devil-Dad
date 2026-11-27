// Small helpers every Gangtok stage shares.
import { lines as L } from './lines';

/** Tara's script for stage n (02..10): her intro is intro[n - 2] */
export const taraScript = (n: number, beaten = 0) => ({ intro: L.intro[(n - 2) % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
