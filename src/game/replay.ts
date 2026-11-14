import { InputState, LevelDef, World, AttemptInfo } from './world';

// Hidden checkpoints work by replay: the sim is deterministic, so feeding a fresh world the
// same inputs brings back exactly the moment Dad passed the checkpoint (bus, boats, rocks and all).

export const encodeInput = (i: InputState) => (i.left ? 1 : 0) | (i.right ? 2 : 0) | (i.jump ? 4 : 0) | (i.jumpPressed ? 8 : 0);
export const decodeInput = (b: number): InputState => ({ left: !!(b & 1), right: !!(b & 2), jump: !!(b & 4), jumpPressed: !!(b & 8) });

/** Build the stage as it was for `info` and play `inputs` through it, silently. */
export function replay(def: LevelDef, info: AttemptInfo, inputs: ArrayLike<number>): World {
  const w = new World(def, info);
  def.build?.(w);
  for (let i = 0; i < inputs.length && w.state === 'play'; i++) {
    w.step(decodeInput(inputs[i]));
    w.events.length = 0;
  }
  w.bubbles = [];
  w.talkQueue = [];
  return w;
}

/** A checkpoint saved during an attempt: the attempt's original info and its inputs up to that tick. */
export interface CheckpointSave {
  info: AttemptInfo;
  inputs: number[];
  cp: number;
  /** probed: can Dad stand still there for a moment without dying? (undefined = not checked yet) */
  safe?: boolean;
  /** deaths within a second of coming back here (two in a row and it's dropped) */
  quick?: number;
}

/** Would Dad, put back at this checkpoint and doing nothing, survive the next 1.5 s? */
export function probeSafe(def: LevelDef, s: CheckpointSave): boolean {
  if (s.safe !== undefined) return s.safe;
  const w = replay(def, s.info, s.inputs);
  w.player.vx = 0;
  const stay = { left: false, right: false, jump: false, jumpPressed: false };
  for (let i = 0; i < 180 && w.state === 'play'; i++) w.step(stay);
  s.safe = w.state === 'play';
  return s.safe;
}
