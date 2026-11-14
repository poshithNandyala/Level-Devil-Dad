// Jump audit: how long must each jump of a stage's proven route be held?
// Phone players tap, so every required jump must work with a short tap (TAP ticks)
// unless the step is marked `long` (a deliberate "hold to jump higher" moment).
// Report: npx vitest run tests/jumpaudit.test.ts --silent=false
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
import { play } from './runner';
import { emptyMap, inp, makeWorld } from './helpers';

/** a quick phone tap, about 125 ms */
const TAP = 15;
/** stages still waiting for their rework (to be emptied) */
const LEGACY = new Set<string>(['BOM-02', 'BOM-04', 'BOM-05']);

describe('jump audit', () => {
  it('report', () => {
    const out: string[] = ['hold (ms) -> jump height (tiles)'];
    for (const hold of [1, 7, 10, 14, 18, 24, 30, 40]) {
      const w = makeWorld(emptyMap((r) => (r[14][4] = '@')));
      for (let i = 0; i < 30; i++) w.step(inp({}));
      const y0 = w.player.y;
      let top = y0;
      for (let t = 0; t < 120; t++) {
        w.step(inp({ jump: t < hold, jumpPressed: t === 0 }));
        top = Math.min(top, w.player.y);
      }
      out.push(`  ${String(Math.round((hold / 120) * 1000)).padStart(4)} ms -> ${((y0 - top) / 16).toFixed(2)}`);
    }
    out.push('', 'per stage: shortest hold that still clears each jump of the proven route');
    const problems: string[] = [];
    for (const def of LEVELS) {
      const steps = SOLUTIONS[def.id];
      const wins = (i: number, h: number) => {
        try {
          return play(def, steps.map((x, j) => (j === i ? { ...x, jump: h } : x))).w.state === 'won';
        } catch {
          return false;
        }
      };
      const need: string[] = [];
      const tooLong: string[] = [];
      steps.forEach((s, i) => {
        if (!s.jump) return;
        let lo = 1,
          hi = s.jump;
        if (!wins(i, hi)) return;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (wins(i, mid)) hi = mid;
          else lo = mid + 1;
        }
        need.push(`${Math.round((lo / 120) * 1000)}ms${s.note ? ' ' + s.note : ''}`);
        if (lo > TAP && !(s as any).long && !LEGACY.has(def.id)) tooLong.push(`${def.id} step ${i} (${s.note ?? ''}) needs ${lo} ticks`);
      });
      out.push(`  ${def.id} ${def.name}: ${need.join(' | ')}`);
      problems.push(...tooLong);
    }
    console.log(out.join('\n'));
    expect(problems).toEqual([]);
  }, 120_000);
});
