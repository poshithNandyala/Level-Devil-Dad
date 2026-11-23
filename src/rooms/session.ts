// One visit to one room: instant retries, every try's inputs kept for the montage,
// the hint ghost after 5 deaths, a skip after 8.
import { secs } from '../game/constants';
import { decodeInput, encodeInput } from '../game/replay';
import { AttemptInfo, InputState, NO_INPUT, World, WorldEvent } from '../game/world';
import { ticksOf } from './script';
import type { RoomDef } from './types';

const INFO: AttemptInfo = { attempt: 1, deaths: 0, justDied: false, rival: 'none', character: 'papa' };
/** dead to playing again: under 350 ms, the pop included */
export const RESPAWN = secs(0.3);
/** after boarding, before the montage starts */
const BOARD = secs(0.85);
export const HINT_AFTER = 5;
export const SKIP_AFTER = 8;

export function freshRoom(def: RoomDef): World {
  const w = new World(def, INFO);
  def.build?.(w);
  return w;
}

/** a world played through `inputs` (encoded), silently */
export function replayRoom(def: RoomDef, inputs: ArrayLike<number>, upTo = Infinity): World {
  const w = freshRoom(def);
  for (let i = 0; i < inputs.length && i < upTo && w.state === 'play'; i++) {
    w.step(decodeInput(inputs[i]));
    w.events.length = 0;
  }
  return w;
}

export class RoomSession {
  readonly def: RoomDef;
  world: World;
  deaths = 0;
  /** inputs of every try that ended in a death, oldest first */
  tries: number[][] = [];
  /** where each of those died */
  deathsAt: { x: number; y: number; cause: string }[] = [];
  /** inputs of the try in progress */
  rec: number[] = [];
  /** the winning try (once won) */
  winning: number[] | null = null;
  winTime = 0;
  paused = false;
  done = false;
  private deadT = 0;
  private wonT = 0;
  /** the white ghost that shows the way (after the hint) */
  guide: World | null = null;
  guideOn = false;
  private guideIn: InputState[] = [];
  /** events of the last ticks, for the renderer and sounds (cleared by the reader) */
  events: WorldEvent[] = [];
  /** called the tick he dies, and when the room is finished (boarded) */
  onDeath: (() => void) | null = null;
  onSpawn: (() => void) | null = null;
  onDone: (() => void) | null = null;

  constructor(def: RoomDef) {
    this.def = def;
    this.world = freshRoom(def);
  }

  private spawn() {
    this.world = freshRoom(this.def);
    this.rec = [];
    this.deadT = 0;
    if (this.guideOn) this.startGuide();
    this.onSpawn?.();
  }

  startGuide() {
    this.guideOn = true;
    this.guide = freshRoom(this.def);
    this.guideIn = ticksOf(this.def.solution);
  }

  /** start over at once (the restart button): not a death */
  restart() {
    if (this.done || this.world.state !== 'play') return;
    this.spawn();
  }

  tick(input: InputState) {
    if (this.paused || this.done) return;
    const w = this.world;
    if (w.state === 'play') {
      this.rec.push(encodeInput(input));
      w.step(input);
      if (this.guide && this.guide.state === 'play') this.guide.step(this.guideIn[this.guide.tick] ?? NO_INPUT);
      if (this.guide) this.guide.events.length = 0;
    } else {
      w.step(NO_INPUT);
    }
    if (w.events.length) {
      this.events.push(...w.events);
      w.events.length = 0;
    }
    if (w.state === 'dead') {
      if (this.deadT === 0) {
        this.deaths++;
        this.tries.push(this.rec.slice());
        this.deathsAt.push({ x: w.player.cx, y: w.player.cy, cause: w.deathCause });
        this.onDeath?.();
      }
      this.deadT++;
      if (this.deadT >= RESPAWN) this.spawn();
    } else if (w.state === 'won') {
      if (this.wonT === 0) {
        this.winning = this.rec.slice();
        this.winTime = w.winTick / 120;
      }
      this.wonT++;
      if (this.wonT >= BOARD) {
        this.done = true;
        this.onDone?.();
      }
    }
  }
}
