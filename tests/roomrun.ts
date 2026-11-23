import { NO_INPUT, World, type InputState } from '../src/game/world';
import type { RoomDef, Seg } from '../src/rooms/types';
import { INFO } from './helpers';
import { ticksOf } from '../src/rooms/script';
export { ticksOf };

export interface Outcome {
  state: World['state'];
  cause: string;
  /** seconds when it ended (won or died), or the time limit */
  t: number;
  x: number;
  y: number;
  w: World;
}

export function build(def: RoomDef): World {
  const w = new World(def, INFO);
  def.build?.(w);
  return w;
}

/** play a room from the start with these inputs (then idle up to `limit` seconds) */
export function run(def: RoomDef, input: Seg[] | InputState[], limit = 20): Outcome {
  const w = build(def);
  const ins = (input.length && Array.isArray(input[0]) ? ticksOf(input as Seg[]) : (input as InputState[])) as InputState[];
  let i = 0;
  while (w.state === 'play' && w.tick < limit * 120) w.step(ins[i++] ?? NO_INPUT);
  const p = w.player;
  return { state: w.state, cause: w.deathCause, t: w.tick / 120, x: p.x, y: p.y, w };
}

/**
 * A human doing the same thing: every change of input comes `lag` ticks late (0..lagMax),
 * and every hold ends `lag` ticks late too. Seeded, so it's the same run every time.
 */
export function humanize(segs: Seg[], seed: number, lagMax = 18): Seg[] {
  let s = seed * 9301 + 49297;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  // each segment starts up to lagMax/2 early or late (the first starts on time)
  const d = segs.map((_, k) => (k === 0 ? 0 : Math.round(rnd() * lagMax) - Math.round(lagMax / 2)));
  d.push(0);
  return segs.map(([move, n, jump], k) => {
    const len = Math.max(1, n + d[k + 1] - d[k]);
    return jump ? [move, len, 1] : [move, len];
  });
}
