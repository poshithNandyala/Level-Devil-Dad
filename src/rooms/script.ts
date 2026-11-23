import type { InputState } from '../game/world';
import type { Seg } from './types';

/** the input for each tick of a script (jump is pressed on a segment's first tick and held 8 ticks) */
export function ticksOf(segs: Seg[]): InputState[] {
  const out: InputState[] = [];
  for (const [move, n, jump] of segs) {
    for (let i = 0; i < n; i++) {
      const j = !!jump && i < 8;
      out.push({ left: move === 'L', right: move === 'R', jump: j, jumpPressed: !!jump && i === 0 });
    }
  }
  return out;
}
