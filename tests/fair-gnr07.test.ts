import { it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
import { ENDING_POLICIES } from './endings';
import { play } from './runner';
import type { World } from '../src/game/world';
import type { GarbaRing } from '../src/game/entities/gujarat';

// A worked example of the human-timing check (docs/HANDOFF.md, section 6), for GNR-07's door (`pravesh`).
// A person who has read the hint, but stops at a sloppy spot, arrives at a random moment, reacts 0-6 / 0-12 /
// 0-18 ticks late and holds jump for 6-44 ticks. v0.14.3 passed 31% at average timing; v0.14.4 passes 93%.
//   LDD_FAIR=1 npx vitest run tests/fair-gnr07.test.ts --silent=false
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const TAU = Math.PI * 2;
function human(seed: number, D: number) {
  const r = rng(seed);
  const U = (a: number, b: number) => a + (b - a) * r();
  let st = 'approach',
    off = U(8, 36),
    pressAt = -1,
    holdLeft = 0,
    tries = 0,
    lastDth = 0,
    aim = 0,
    landWait = 0,
    idle = Math.floor(U(0, 180));
  let W: World | null = null;
  const f = (w: World) => {
    if (W !== w) {
      W = w;
    }
    const p = w.player;
    const g = w.flags.pravesh as GarbaRing;
    const R = g.rings[0].r;
    const endX = g.cx - R;
    if (holdLeft > 0) {
      holdLeft--;
      return { move: '' as const, jump: true };
    }
    if (g.joined) {
      if (st !== 'dance') {
        st = 'dance';
        aim = U(-0.35, 0.05);
        pressAt = -1;
      }
      const th = (((g.joined.th % TAU) + TAU) % TAU);
      if (pressAt < 0 && th >= 1.5 * Math.PI + aim && th < 1.5 * Math.PI + 0.6) pressAt = w.tick + Math.floor(U(0, D + 1));
      if (pressAt >= 0 && w.tick >= pressAt) {
        pressAt = -1;
        aim = U(-0.35, 0.05);
        holdLeft = Math.floor(U(6, 44));
        return { move: '' as const, jump: true };
      }
      return { move: '' as const, jump: false };
    }
    // the dancer nearest the left end: how far past it (radians, + = cleared and moving away)
    const a0 = g.angle(0, w.tick / 120);
    let best = 9;
    for (let k = 0; k < g.rings[0].n; k++) {
      let dth = ((((a0 + (TAU * k) / g.rings[0].n - Math.PI) % TAU) + TAU) % TAU);
      if (dth > Math.PI) dth -= TAU;
      if (Math.abs(dth) < Math.abs(best)) best = dth;
    }
    const target = endX - off;
    if (st === 'approach' && idle > 0) {
      idle--;
      return { move: '' as const, jump: false };
    }
    if (st === 'approach') {
      const c = p.cx;
      if (Math.abs(c - target) > 2) return { move: (c < target ? 'R' : 'L') as 'R' | 'L', jump: false };
      st = 'wait';
      lastDth = best;
      // arriving in an open gap (last dancer gone, the next one still well short of the end): go now
      let next = 9;
      for (let k = 0; k < g.rings[0].n; k++) {
        let dth = ((((a0 + (TAU * k) / g.rings[0].n - Math.PI) % TAU) + TAU) % TAU);
        if (dth > Math.PI) dth -= TAU;
        if (dth < 0) next = Math.min(next, -dth);
      }
      if (Math.abs(best) > 0.3 && next > 0.3 + (0.7 * (D + 12)) / 120) pressAt = w.tick + Math.floor(U(0, D + 1));
    }
    if (st === 'land') {
      if (!p.onGround || --landWait > 0) return { move: '' as const, jump: false };
      tries++;
      if (tries > 3) {
        st = 'gaveup';
        return { move: '' as const, jump: false };
      }
      off -= U(6, 14);
      st = 'approach';
      return { move: '' as const, jump: false };
    }
    if (st === 'wait') {
      // a dancer just cleared the end: go after a reaction delay
      if (pressAt < 0 && lastDth < 0.3 && best >= 0.3) pressAt = w.tick + Math.floor(U(0, D + 1));
      lastDth = best;
      if (pressAt >= 0 && w.tick >= pressAt) {
        pressAt = -1;
        holdLeft = Math.floor(U(6, 44)) - 1;
        st = 'pressed';
        return { move: '' as const, jump: true };
      }
      return { move: '' as const, jump: false };
    }
    if (st === 'pressed') {
      // didn't join (a plain jump): land, step closer, try again
      st = 'land';
      landWait = 10;
    }
    return { move: '' as const, jump: false };
  };
  return f;
}

it.skipIf(!process.env.LDD_FAIR)('GNR-07 door, human timing', () => {
  const def = LEVELS.find((l) => l.id === 'GNR-07')!;
  const orig = ENDING_POLICIES.pravesh;
  for (const [label, D] of [
    ['quick', 6],
    ['average', 12],
    ['relaxed', 18],
  ] as const) {
    let won = 0;
    const why: Record<string, number> = {};
    const N = 300;
    for (let i = 0; i < N; i++) {
      const h = human(i * 7919 + D, D);
      ENDING_POLICIES.pravesh = (w) => h(w);
      const { w } = play(def, SOLUTIONS['GNR-07']);
      if (w.state === 'won') won++;
      else why[w.deathCause || w.state] = (why[w.deathCause || w.state] ?? 0) + 1;
    }
    console.log(`GNR-07 door, ${label} timing: ${((100 * won) / N).toFixed(0)}% won`, JSON.stringify(why));
  }
  ENDING_POLICIES.pravesh = orig;
}, 600000);
