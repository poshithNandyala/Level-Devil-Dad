// Tool: which spikes never come near the route, the obvious play or the obvious fix? (decoration, not a trap)
// LDD_AUDIT=1 npx vitest run tests/hazard-audit.test.ts --silent=false   (LDD_IDS=TVM-02,TVM-08 to limit)
import { test } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World, TT, spikeHitbox } from '../src/game/world';
import { SpikeGroup } from '../src/game/entities/basics';
import { decodeInput } from '../src/game/replay';
import { INFO } from './helpers';
import { play } from './runner';
import { SOLUTIONS, NAIVE, FIX } from './solutions';

function inputsOf(def: any, steps: any): number[] {
  (globalThis as any).__lddRec = [];
  try {
    play(def, steps);
  } catch {
    /* timed out: keep what was recorded */
  }
  const rec = (globalThis as any).__lddRec as number[];
  (globalThis as any).__lddRec = undefined;
  return rec;
}

function gap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  const dx = Math.max(0, b.x - (a.x + a.w), a.x - (b.x + b.w));
  const dy = Math.max(0, b.y - (a.y + a.h), a.y - (b.y + b.h));
  return Math.hypot(dx, dy);
}

test('hazard audit', () => {
  if (!process.env.LDD_AUDIT) return;
  const only = process.env.LDD_IDS?.split(',');
  const out: string[] = [];
  for (const def of LEVELS) {
    if (only && !only.includes(def.id)) continue;
    const runs = [SOLUTIONS[def.id], NAIVE[def.id]?.steps, FIX[def.id]?.steps].filter(Boolean);
    // every hazard rect, with a label, and the closest Dad ever came
    const best = new Map<string, number>();
    const label = (k: string) => k;
    for (const steps of runs) {
      const ins = inputsOf(def, steps);
      const w = new World(def, INFO);
      def.build?.(w);
      const statics: { k: string; r: any }[] = [];
      for (let ty = 0; ty < 18; ty++)
        for (let tx = 0; tx < w.cols; tx++) {
          const t = w.tileAt(tx, ty);
          if (t >= TT.SPIKE_UP) statics.push({ k: `tile ${tx},${ty}`, r: spikeHitbox(t, tx * 16, ty * 16) });
        }
      const groups = w.entities.filter((e) => e instanceof SpikeGroup) as SpikeGroup[];
      for (let i = 0; i < ins.length && w.state === 'play'; i++) {
        w.step(decodeInput(ins[i]));
        w.events.length = 0;
        const p = w.player;
        const me = { x: p.x, y: p.y, w: p.w, h: p.h };
        for (const s of statics) best.set(s.k, Math.min(best.get(s.k) ?? 1e9, gap(me, s.r)));
        groups.forEach((g, gi) => {
          for (const c of g.cells) {
            const k = `popup#${gi} ${c.x / 16},${c.y / 16}`;
            best.set(k, Math.min(best.get(k) ?? 1e9, gap(me, spikeHitbox(c.t, c.x, c.y))));
          }
        });
      }
    }
    // a row of spikes is one hazard (a field of rebar kills a walker at its first tile): a tile counts as
    // reached if any tile in its unbroken row was. Report only rows nobody came near.
    const FAR = +(process.env.LDD_FAR ?? 28);
    const near = (k: string) => (best.get(k) ?? 1e9) <= FAR;
    const rowReached = (k: string) => {
      const m = k.match(/^(tile|popup#\d+) (\d+(?:\.\d+)?),(\d+)/);
      if (!m) return near(k);
      const [, kind, xs, ys] = m;
      const at = (x: number) => `${kind} ${x},${ys}`;
      for (const dir of [-1, 1]) for (let x = +xs; best.has(at(x)); x += dir) if (near(at(x))) return true;
      return false;
    };
    const far = [...best.entries()].filter(([k]) => !rowReached(k)).map(([k, d]) => `${label(k)} (${Math.round(d)}px)`);
    if (far.length) out.push(`${def.id}: ${far.length} far: ${far.slice(0, 6).join('; ')}${far.length > 6 ? ' ...' : ''}`);
  }
  console.log(out.join('\n'));
});
