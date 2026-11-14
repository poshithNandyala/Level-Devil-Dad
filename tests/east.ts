// Proven routes for Ranchi (the eastern chapter): each stage's room, its acts, and its door.
// Merged into SOLUTIONS, ACT_ROUTES and ENDING_POLICIES by solutions.ts, acts.ts and endings.ts.
import type { World } from '../src/game/world';
import type { Door } from '../src/game/entities/basics';
import { Step, X, XL, and, ground } from './runner';
import { Cast, Dancer, MaskPole, Plunge, Spout, pot } from '../src/game/entities/jharkhand';
import { DT } from '../src/game/constants';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
/** the pool / basin named on `w.flags` */
const poolOf = (w: World, k: string) => w.flags[k] as Plunge;
/** how far through its cycle a pool is right now (0 = just filled) */
const poolPhase = (w: World, p: Plunge) => ((((w.tick * DT) / p.period + p.phase) % 1) + 1) % 1;
const spoutAt = (w: World, x: number) => (w.entities.find((e) => e instanceof Spout && Math.abs((e as Spout).x - x) < 3) as Spout | undefined) ?? null;
const casts = (w: World) => w.entities.filter((e) => e instanceof Cast) as Cast[];
/** the next channel ahead is set: safe to walk on */
const nextSet = (w: World) => {
  const ahead = casts(w).filter((c) => c.x1 > w.player.x + 2).sort((a, b) => a.x0 - b.x0)[0];
  return !ahead || ahead.state === 'set';
};
const poles = (w: World) => w.entities.filter((e) => e instanceof MaskPole) as MaskPole[];
/** the i-th mask is up on its pole (or already spent) */
const hung = (w: World, i: number) => {
  const p = poles(w)[i];
  return !!p && (p.masked || p.broken);
};
/** the i-th dancer has taken his blow */
const struck = (w: World, i: number) => !!poles(w)[i]?.broken;

// ------------------------------------------------------------------ rooms
export function eastSolutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  // the haat: walk the lane and trade what is in your hands
  S['RNC-02'] = [{ hold: 'R', until: X(29), max: 900 }];
  lengthen('RNC-02', 0, []);

  // Hundru: off the ledge into a full pool, then up the far bank
  S['RNC-03'] = [
    { hold: 'R', until: X(8.05), max: 500, note: 'to the lip of the ledge' },
    { hold: '', until: (w) => poolPhase(w, poolOf(w, 'pool')) < 0.4, max: 900, note: 'wait for the fall to swell' },
    { hold: 'R', until: ground, max: 400, note: 'step off into the water' },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(22) - 1, max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up the far bank' },
    { hold: 'R', until: and(ground, X(29)), max: 400 },
  ];
  lengthen('RNC-03', 0, []);

  // Baans: hop the backward mouth, walk into the long one
  S['RNC-04'] = [
    { hold: 'R', until: X(4.5), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the short mouth' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(11.6), max: 400, note: 'into the long mouth' },
    { hold: 'R', until: and(ground, X(29)), max: 600 },
  ];
  lengthen('RNC-04', 0, []);

  // Sarhul: the pot spills as you go, and the Pahan reads it at the door (the trickle there tops it up)
  S['RNC-05'] = [
    { hold: 'R', until: X(11.2), max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'the first gap' },
    { hold: 'R', until: and(ground, X(16.4)), max: 300 },
    { hold: 'R', until: X(20.4), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'the second gap' },
    { hold: 'R', until: and(ground, X(29)), max: 400 },
  ];
  lengthen('RNC-05', 0, []);

  // Dokra: tip the crucible, wait for the brass to dull, walk over it
  S['RNC-06'] = [
    { hold: 'R', until: X(8.6), max: 400, note: 'on to the beam end' },
    { hold: '', until: (w) => nextSet(w), max: 900, note: 'let the brass cool' },
    { hold: 'R', until: and(ground, X(29)), max: 500 },
  ];
  lengthen('RNC-06', 0, []);

  // Chhau: hang the mask, stand back, walk through what is left of the wall
  S['RNC-07'] = [
    { hold: 'R', until: (w) => hung(w, 0), max: 600, note: 'take the mask to the pole' },
    { hold: 'L', until: XL(9.6), max: 400, note: 'out of his sweep' },
    { hold: '', until: (w) => struck(w, 0), max: 400 },
    { hold: '', ticks: 40 },
    { hold: 'R', until: and(ground, X(29)), max: 500 },
  ];
  lengthen('RNC-07', 0, []);

  // Sarhul Mela: mask, wall, crucible, door
  S['RNC-08'] = [
    { hold: 'R', until: (w) => hung(w, 0), max: 600 },
    { hold: 'L', until: XL(5.4), max: 400, note: 'out of the dancer’s sweep' },
    { hold: '', until: (w) => struck(w, 0), max: 400 },
    { hold: '', ticks: 40 },
    { hold: 'R', until: X(16.6), max: 400, note: 'on to the beam end' },
    { hold: '', until: (w) => nextSet(w), max: 900 },
    { hold: 'R', until: and(ground, X(29)), max: 500 },
  ];
  lengthen('RNC-08', 0, []);
}

/** the obvious play: keep right and never read the room */
export const EAST_NAIVE: Record<string, { steps: Step[]; cause?: string }> = {
  // straight on into the first gap: the pot was never topped up and the gap never noticed
  'RNC-05': { steps: [{ hold: 'R', max: 900 }], cause: 'fell' },
  // straight on across the empty channel: the brass has not set yet
  'RNC-06': { steps: [{ hold: 'R', max: 900 }], cause: 'fell' },
  // skip the mask on the rack, walk up to the dancer empty-handed: he turns on you
  'RNC-07': {
    steps: [{ hold: 'R', until: X(3.4), max: 300 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', max: 900 }],
    cause: 'talwar',
  },
  // straight at the dancer: the mask is barely up before Dad is in the sweep
  'RNC-08': { steps: [{ hold: 'R', max: 1200 }], cause: 'talwar' },
};

// ------------------------------------------------------------------ acts
export const EAST_ACT_ROUTES: Record<string, (x: number) => Step[]> = {
  // the lane: four gaps, four stalls, and one trip back for a dona
  'rnc02-haat': (x) => [
    { hold: 'R', until: X(x + 3), max: 300, note: 'take the dhuska' },
    { hold: 'R', until: X(x + 6.2), max: 300, note: 'the first stall lays its plank' },
    { hold: 'R', until: X(x + 13), max: 400, note: 'cross, and take the dona' },
    { hold: 'R', until: X(x + 15.2), max: 300, note: 'the second stall' },
    { hold: 'R', until: X(x + 22), max: 400, note: 'cross, take a dhuska' },
    { hold: 'R', until: X(x + 25.2), max: 300, note: 'the third stall' },
    { hold: 'R', until: X(x + 32.6), max: 600, note: 'cross, and walk past the last stall: it wants a dona' },
    { hold: 'L', until: XL(x + 22.9), max: 600, note: 'back over the planks for the dona' },
    { hold: 'R', until: X(x + 31.8), max: 900, note: 'all the way back with it' },
    { hold: 'R', until: X(x + 47), max: 500 },
  ],

  // three bays: wait on the edge, step in, climb out
  'rnc03-jharana': (x) => [
    { hold: 'R', until: X(x + 7.4), max: 400 },
    { hold: '', until: (w) => poolPhase(w, poolOf(w, 'poolA')) < 0.42, max: 900, note: 'the first fall swells' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.y > 250, max: 400, note: 'in, and down' },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 13) - 1, max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up on to the bank' },
    { hold: 'R', until: and(ground, X(x + 20.4)), max: 400 },
    { hold: '', until: (w) => poolPhase(w, poolOf(w, 'poolB')) < 0.4, max: 900, note: 'the second fall swells' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.y > 250, max: 400 },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 26) - 1, max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'out of the second bay' },
    { hold: 'R', until: and(ground, X(x + 33.4)), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the shards, on to the shelf' },
    { hold: 'R', until: (w) => w.player.onGround && w.player.y < 230, max: 300 },
    { hold: 'R', until: X(x + 38.4), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'off the shelf to the far side' },
    { hold: 'R', until: and(ground, X(x + 49)), max: 500 },
  ],

  // the traps: in, out, hop the backward mouth, in again
  'rnc04-baans': (x) => [
    { hold: 'R', until: X(x + 1.6), max: 300, note: 'into the first mouth' },
    { hold: 'R', until: (w) => w.player.x >= px(x + 12) - 2, max: 400, note: 'out at the far end' },
    { hold: 'R', until: X(x + 13.6), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the backward mouth' },
    { hold: 'R', until: (w) => w.player.x >= px(x + 26) - 2, max: 600, note: 'the long mouth carries you over' },
    { hold: 'R', until: X(x + 28.6), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the second backward mouth' },
    { hold: 'R', until: (w) => w.player.x >= px(x + 42) - 2, max: 600 },
    { hold: 'R', until: (w) => w.player.x >= px(x + 47) - 12, max: 500 },
  ],

  // the fields: gaps, spouts, and two jumps between the last two spouts
  'rnc05-phool': (x) => [
    { hold: 'R', until: X(x + 7.4), max: 400 },
    { hold: 'R', jump: 13, ticks: 13, note: 'the first gap' },
    { hold: 'R', until: and(ground, X(x + 10.4)), max: 300 },
    { hold: 'R', until: X(x + 16.4), max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'the wide gap' },
    { hold: 'R', until: and(ground, X(x + 20.4)), max: 300 },
    { hold: 'R', until: X(x + 28.4), max: 500 },
    { hold: 'R', jump: 13, ticks: 13 },
    { hold: 'R', until: and(ground, X(x + 31.4)), max: 300 },
    { hold: 'R', until: X(x + 37.4), max: 400 },
    { hold: 'R', jump: 13, ticks: 13 },
    { hold: 'R', until: and(ground, X(x + 40.4)), max: 300 },
    { hold: 'R', until: X(x + 48), max: 500 },
  ],

  // the yard: three pours, each with its wait
  'rnc06-dhalai': (x) => [
    { hold: 'R', until: X(x + 3.6), max: 300, note: 'the beam end' },
    { hold: '', until: (w) => nextSet(w), max: 900 },
    { hold: 'R', until: X(x + 17.6), max: 600 },
    { hold: '', until: (w) => nextSet(w), max: 900 },
    { hold: 'R', until: X(x + 27.0), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'the step in the yard' },
    { hold: 'R', until: and(ground, X(x + 31.6)), max: 300 },
    { hold: '', until: (w) => nextSet(w), max: 900 },
    { hold: 'R', until: X(x + 49), max: 600 },
  ],

  // three courtyards: mask, back off, wait for the blow, walk through
  'rnc07-mukhauta': (x) => {
    const one = (i: number, next: number, back: number): Step[] => [
      { hold: 'R', until: (w) => hung(w, i), max: 600, note: 'the mask goes on the pole' },
      { hold: 'L', until: XL(x + back), max: 400, note: 'out of the sweep' },
      { hold: '', until: (w) => struck(w, i), max: 500 },
      { hold: '', ticks: 40 },
      { hold: 'R', until: X(x + next), max: 500 },
    ];
    return [...one(1, 16, 3.4), ...one(2, 30, 17.4), ...one(3, 53, 31.4)];
  },

  // the last walk: pool, trap, wall, pour
  'rnc08-mela': (x) => [
    { hold: 'R', until: X(x + 5.4), max: 400 },
    { hold: '', until: (w) => poolPhase(w, poolOf(w, 'poolMela')) < 0.42, max: 900 },
    { hold: 'R', until: (w) => w.player.onGround && w.player.y > 250, max: 400 },
    { hold: 'R', until: (w) => w.player.x + w.player.w >= px(x + 12) - 1, max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'out of the pool' },
    { hold: 'R', until: and(ground, X(x + 15.6)), max: 400 },
    { hold: 'R', until: (w) => w.player.x >= px(x + 28) - 2, max: 700, note: 'the trap mouth' },
    { hold: 'R', until: (w) => hung(w, 1), max: 700, note: 'the mask on the pole' },
    { hold: 'L', until: XL(x + 29.0), max: 400, note: 'out of his sweep' },
    { hold: '', until: (w) => struck(w, 1), max: 500 },
    { hold: '', ticks: 40 },
    { hold: 'R', until: X(x + 46.6), max: 600 },
    { hold: '', until: (w) => nextSet(w), max: 900 },
    { hold: 'R', until: X(x + 61), max: 600 },
  ],
};

// ------------------------------------------------------------------ door twists
export const EAST_ENDING_POLICIES: Record<string, Policy> = {
  /** he quotes a price, and another: walk away and he calls you back */
  bhaav(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 6, 3));
    if (m.asked) return go('L');
    if (d.x + 8 - p.cx < 44) {
      m.asked = 1;
      return go('L');
    }
    return go('R');
  },

  /** start the falls first, then jump in */
  jharana(w, m, d) {
    const p = w.player;
    const pool = poolOf(w, 'basin');
    if (p.y + p.h > 250) return go(toward(w, d.x + 8, 3));
    if (w.flags.twist !== 'wet') return go(toward(w, d.x - px(8) + 6, 3));
    if (p.cx < d.x - px(5) - 8) return go('R');
    if (pool.level < 0.9) return go('');
    return go('R');
  },

  /** the mouth lifts you to the ledge; the door is two steps along it */
  khokha(w, m, d) {
    const p = w.player;
    if (p.y + p.h < 200) return go(toward(w, d.x + 6, 3));
    return go(toward(w, d.x - px(6), 2));
  },

  /** jump the last gap, then fill the pot at the trickle and walk in */
  pahan(w, m, d) {
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (w.flags.twist === 'open') return go(toward(w, d.x + 6, 3));
    if (p.y + p.h > 250 && p.cx < d.x - px(3) - 6) return go('R');
    if (p.onGround && p.cx < d.x - px(3) + 2) {
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    const s = spoutAt(w, d.x - px(2));
    if (s && p.cx > s.x && p.cx < s.x + 16) return go('');
    return go(toward(w, d.x - px(2) + 8, 2));
  },

  /** tip it and wait: hot brass burns, dull brass carries you */
  dhalai(w, m, d) {
    const p = w.player;
    const ch = casts(w).pop();
    if (ch && ch.state === 'set') return go(toward(w, d.x + 6, 3));
    if (p.cx < d.x - px(5) + 10) return go('R');
    return go('');
  },

  /** the spare mask behind you, the pole by the door, and the dancer's last blow */
  mukhauta(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 3));
    const pole = poles(w)[poles(w).length - 1];
    // the last dancer never turns on Dad: once the mask is up, walk to the stone
    if (pole && (pole.masked || pole.broken)) return go(toward(w, d.x + 4, 3));
    return go('R');
  },

  /** the road above: walk on past the door, up the hairpin, back along the top */
  ghumav(w, m, d) {
    // the door stands on the top road; the ground road runs on under it to the trap at the far end
    const p = w.player;
    if (p.y + p.h > 200) return go('R');
    return go(toward(w, d.x + 6, 3));
  },
};
