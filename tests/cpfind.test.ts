import { it } from 'vitest';
import { LEVEL_BY_ID } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';
// Where to put hidden checkpoints: spots on the proven route where Dad is on his feet and nothing
// dangerous comes within 90 px for the next second. LDD_LEVEL=TVM-02 npx vitest run tests/cpfind.test.ts --silent=false
it.runIf(!!process.env.LDD_LEVEL)('calm spots', () => {
  const id = process.env.LDD_LEVEL!;
  const def = LEVEL_BY_ID.get(id)!;
  const trail: { x: number; t: number; g: boolean; danger: number }[] = [];
  (globalThis as any).__lddWatch = (w: any) => {
    const p = w.player;
    let d = 999;
    for (const e of w.entities) {
      const h = e.hazard;
      if (!h || !h.active || e.alive === false) continue;
      const ex = e.x ?? e.solid?.x,
        ey = e.y ?? e.solid?.y;
      if (ex === undefined) continue;
      d = Math.min(d, Math.hypot(ex - p.x, (ey ?? p.y) - p.y));
    }
    trail.push({ x: p.x, t: w.tick, g: p.onGround, danger: d });
    return '';
  };
  play(def, SOLUTIONS[id], undefined, true);
  (globalThis as any).__lddWatch = undefined;
  const out: string[] = [];
  let last = -99;
  for (let i = 0; i + 20 < trail.length; i++) {
    if (!trail[i].g || trail.slice(i, i + 20).some((s) => s.danger < 90)) continue;
    const col = Math.floor(trail[i].x / 16);
    if (col - last >= 4) {
      out.push(`${col}@${(trail[i].t / 120).toFixed(1)}s`);
      last = col;
    }
  }
  console.log(id, 'calm:', out.join(' '));
});
