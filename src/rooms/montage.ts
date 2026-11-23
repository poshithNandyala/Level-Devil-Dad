// The fail montage: when the room is beaten, every try replays at once. The ghosts of
// the failed tries run into their traps one by one while the winning run goes through.
// It's the moment people screenshot and share.
import { decodeInput } from '../game/replay';
import { NO_INPUT, World } from '../game/world';
import type { Ghost } from './render';
import { freshRoom } from './session';
import type { RoomDef } from './types';

interface Run {
  w: World;
  inputs: number[];
  ghost: Ghost;
}

export class Montage {
  readonly def: RoomDef;
  main: World;
  private mainIn: number[];
  runs: Run[] = [];
  /** ghosts that have died so far (the counter ticks up with them) */
  fallen = 0;
  tick = 0;
  /** ticks after the winner boarded */
  private after = 0;
  done = false;
  events: World['events'] = [];

  constructor(def: RoomDef, tries: number[][], winning: number[]) {
    this.def = def;
    this.main = freshRoom(def);
    this.mainIn = winning;
    // the most recent tries are the boldest; show at most 40
    for (const t of tries.slice(-40)) {
      const w = freshRoom(def);
      this.runs.push({ w, inputs: t, ghost: { world: w, alpha: 0.42, tint: '#FFF4E8' } });
    }
  }

  get ghosts(): Ghost[] {
    return this.runs.map((r) => r.ghost);
  }

  step() {
    if (this.done) return;
    this.tick++;
    const m = this.main;
    m.step(m.state === 'play' ? decodeInput(this.mainIn[m.tick] ?? 0) : NO_INPUT);
    this.events.push(...m.events.filter((e) => e.type !== 'die'));
    m.events.length = 0;
    for (const r of this.runs) {
      const w = r.w;
      if (w.state === 'play') {
        w.step(w.tick < r.inputs.length ? decodeInput(r.inputs[w.tick]) : NO_INPUT);
        if ((w.state as World['state']) === 'dead') {
          this.fallen++;
          // a fall is marked where he went in, not down out of sight
          const y = w.deathCause === 'fell' ? Math.min(w.player.cy, 240) : w.player.cy;
          r.ghost.diedAt = { x: w.player.cx, y };
          // the pop, in ghost colours
          this.events.push({ type: 'ghostPop', x: w.player.cx, y });
        }
      }
      w.events.length = 0;
    }
    if (m.state === 'won') {
      this.after++;
      if (this.after > 70) this.done = true;
    }
    if (this.tick > 120 * 40) this.done = true;
  }
}
