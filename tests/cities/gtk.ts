// Proven routes for Gangtok: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, done, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';
import { STROKE, SWEEP_PERIOD, type Sweep } from '../../src/game/cities/gtk/s01';
import { VENT, type Steamer } from '../../src/game/cities/gtk/s02';
import type { Bag } from '../../src/game/cities/gtk/s03';
import { FLOORS } from '../../src/game/cities/gtk/s04';
import type { Rule } from '../../src/game/cities/gtk/s05';
import { TANK, STAND2 } from '../../src/game/cities/gtk/s06';
import type { Cloud } from '../../src/game/cities/gtk/s07';
import { DOCK } from '../../src/game/cities/gtk/s08';
import type { Yak } from '../../src/game/cities/gtk/s09';
import type { Rig } from '../../src/game/cities/gtk/entities';
import { XL } from '../runner';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
/** the first column of stage 03's act (room is 32 wide) */
const x3 = (t: number) => 32 + t;
const go = (move: Move): Out => ({ move, jump: false });
const secs = (w: World, t0: number) => (w.tick - t0) / 120;
const cyc = (w: World, t0: number, P: number) => ((secs(w, t0) % P) + P) % P;
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];
/** walk right, jumping (a tap) whenever a wall of tiles one or two high stands right in front */
function stepper(): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const p = w.player;
    if (p.onGround) {
      const tx = Math.floor((p.x + p.w + 4) / 16);
      const ty = Math.floor((p.y + p.h - 2) / 16);
      if (w.isSolidTile(w.tileAt(tx, ty))) {
        jt = 12;
        return { move: 'R', jump: true };
      }
    }
    return go('R');
  };
}

// ------------------------------------------------------------------ GTK-01
/** wait outside a sweeper's stroke, then walk through right behind it while the broom is in the air */
function behindStroke(i: number, key = 'gtk1'): (w: World) => Out {
  return (w) => {
    const st = (w.flags[key] as Sweep[])[i];
    const p = w.player;
    const left = st.sx - STROKE.reach - 8;
    if (p.x + p.w >= left - 2) return go('R');
    if (st.t0 < 0) return go(p.x + p.w < left - 24 ? 'R' : '');
    const u = cyc(w, st.t0, SWEEP_PERIOD);
    const ok = u >= STROKE.sweep + 0.02 && u <= STROKE.sweep + 0.4;
    if (p.x + p.w < left - 24) return go('R');
    return go(ok ? 'R' : '');
  };
}
const tourRoute = (): Step[] => [
  { policy: stepper(), until: X(26), max: 900, note: 'up and down the stairs' },
  { policy: behindStroke(0), until: X(39.5), max: 1500, note: 'the first sweeper: through behind his stroke' },
  { policy: stepper(), until: X(60), max: 900, note: 'the kerb posts' },
  { policy: behindStroke(1), until: X(71.5), max: 1500, note: 'the second sweeper' },
  { policy: stepper(), until: X(79.2), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked jeep' },
  { hold: 'R', until: ground, max: 300 },
  { policy: stepper(), until: done, max: 1500, note: 'over the deck to the door' },
];
/** A2 at the first sweeper: up on the bench while he strokes, off once the broom is in the air */
const benchRoute = (): Step[] => [
  { policy: stepper(), until: X(31.2), max: 900 },
  { hold: 'R', jump: 10, ticks: 10, note: 'up on the bench' },
  { hold: 'R', until: (w) => w.player.onGround, max: 200 },
  { hold: '', until: (w) => { const st = (w.flags.gtk1 as Sweep[])[0]; const u = cyc(w, st.t0, SWEEP_PERIOD); return st.t0 >= 0 && u >= STROKE.sweep + 0.05 && u < STROKE.sweep + 0.4; }, max: 900, note: 'wait out the stroke' },
  { hold: 'R', until: X(39.5), max: 300 },
];

// ------------------------------------------------------------------ GTK-02
/** wait on the stool till the stack is still, hop on the top tier, ride it up, step off on to the shelf at the top */
function rideTier(key: string, jumpOff: boolean, mode: 'route' | 'stay' | 'second' = 'route'): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let stage = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      stage = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const s = w.flags[key] as Steamer;
    const p = w.player;
    const stoolX = s.x - 16;
    if (stage === 0) {
      // to the stool
      if (p.x < stoolX - 20) return go('R');
      if (!p.onGround || p.y > 200) {
        if (p.onGround && p.x + p.w >= stoolX - 6) {
          jt = 10;
          return { move: 'R', jump: true };
        }
        return go('R');
      }
      // on the stool: go when the stack is still and the lift is a good way off
      if (p.x > stoolX + 7) return go('L');
      if (mode === 'second' ? s.phase === 'carry' : s.t0 >= 0 && s.phase === 'idle') {
        const u = cyc(w, s.t0, s.cfg.period);
        if (mode === 'second' || (u >= 0.05 && u <= 0.6)) {
          stage = 1;
          jt = 14;
          return { move: 'R', jump: true };
        }
      }
      return go('');
    }
    if (mode !== 'route') return go(p.onGround ? '' : 'R');
    if (stage === 1) {
      // on the stack: stand at its right edge
      const top = s.tiers.find((t) => t.s.rank === 2)!;
      if (!p.onGround) return go('R');
      if (p.x + p.w < top.x + top.w - 2) return go('R');
      stage = 2;
      return go('');
    }
    // riding: off at the top
    const top = s.tiers.find((t) => t.s.rank === 2)!;
    if (p.y + p.h <= 98 && p.onGround && p.x > top.x + top.w) return go('R');
    if (jumpOff) {
      if (s.phase === 'lift' && top.y < 128 && p.onGround) {
        jt = 14;
        return { move: 'R', jump: true };
      }
      return go(p.onGround ? '' : 'R');
    }
    return go(s.phase === 'hold' || s.phase === 'carry' ? 'R' : '');
  };
}
const room02 = (): Step[] => [
  { policy: rideTier('gtk2', false), until: and(ground, X(12), (w) => w.player.y < 100), max: 2400, note: 'ride the top tier to the shelf' },
  { hold: 'R', until: and(ground, X(29)), max: 600, note: 'along the shelf and down' },
];
const act02 = (x: number): Step[] => [
  { policy: rideTier('gtk2a', true), until: and(ground, X(x + 10), (w) => w.player.y < 100), max: 2400, note: 'jump off on the way up' },
  { hold: 'R', until: and(ground, X(x + 27)), max: 600 },
];
/** the steam vent: wait short of the grate till a puff ends, then walk over */
const ventPolicy: Policy = (w, _m, d) => {
  const st = w.flags.gtk2e as { t0: number };
  const p = w.player;
  const g0 = d.x - 80;
  if (p.x > g0 + 32) return go('R');
  if (p.x + p.w < g0 - 30) return go('R');
  if (st.t0 < 0) return go('');
  const u = cyc(w, st.t0, VENT.period);
  if (p.x + p.w >= g0 - 4) return go('R');
  return go(u >= VENT.on + 0.02 && u <= VENT.on + 0.7 ? 'R' : '');
};

// ------------------------------------------------------------------ GTK-03
/** across the bags: cloth to cloth (or every bag, for the naive play), jumping off each one's far edge */
function bagHop(key: string, o: { every?: boolean; dwell?: number; over?: boolean } = {}): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let wait = 0;
  let last: Bag | null = null;
  let aim: { x: number } | null = null;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      wait = 0;
      last = null;
      aim = null;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const p = w.player;
    const all = (w.flags[key + 'bags'] as Bag[]).filter((b) => !b.s.gone);
    const on = all.find((b) => b.carries(w)) ?? null;
    const ahead = all.filter((b) => b !== on && b.x > p.x + 4 && (o.every || !b.s.thin));
    const first = (w.flags[key + 'bags'] as Bag[])[0];
    const lastBag = (w.flags[key + 'bags'] as Bag[]).slice(-1)[0];
    const target = ahead[0];
    if (!p.onGround) {
      if (aim && p.x > aim.x + 6) return go('');
      return go('R');
    }
    aim = null;
    if (!on && p.x > lastBag.x + lastBag.w) return go('R');
    if (on && o.dwell && on !== last) {
      last = on;
      wait = Math.round(o.dwell * 120);
    }
    if (wait > 0) {
      wait--;
      return go('');
    }
    const far = target ? target.x - (on ? on.x + on.w : first.x - 16) > 20 : true;
    if (o.over && target) {
      // he's coming the other way: go for the next bag only when he's well short of it, or already past it
      const ix = (w.flags[key + 'i'] as { x: number; t0: number }).x;
      const ok = ix < target.x + 2 || ix - target.x > 110;
      if (!ok) return go('');
    }
    const slow = o.dwell || o.over;
    const edge = on ? on.x + on.w - (far && !slow ? 14 : 3) : first.x - 26;
    if (p.x + p.w < edge) return go('R');
    jt = far ? (slow ? 17 : 15) : 8;
    aim = target ?? null;
    return { move: 'R', jump: true };
  };
}
const room03 = (): Step[] => [{ policy: bagHop('gtk3'), until: and(ground, X(24)), max: 2400, note: 'cloth to cloth' }, { hold: 'R', until: X(29), max: 300 }];
const act03b = (x: number): Step[] => [{ policy: bagHop('gtk3b', { over: true }), until: and(ground, X(x + 26)), max: 3000, note: 'over his head, bag to bag' }, { hold: 'R', until: X(x + 30), max: 300 }];
const act03 = (x: number): Step[] => [{ policy: bagHop('gtk3a'), until: and(ground, X(x + 26)), max: 2400, note: 'cloth to cloth, ahead of the inspector' }, { hold: 'R', until: X(x + 30), max: 300 }];
/** the jhola stall: jump up for the bag on the hook, then in */
const jholaPolicy: Policy = (w, _m, d) => {
  const st = w.flags.gtk3e as { got: boolean };
  const p = w.player;
  if (st.got) return go('R');
  const hx = d.x - 40;
  if (p.cx < hx + 4) return go('R');
  if (p.cx > hx + 14) return go('L');
  return { move: '', jump: p.onGround && w.tick % 40 < 20 };
};

// ------------------------------------------------------------------ GTK-04
/** down the zigzag stairs of the house at column c, out of the door on floor `exit` (0 = G at the top road) */
function houseRoute(c: number, exit: number): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let dir: Move = 'R';
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      dir = 'R';
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const p = w.player;
    const inside = p.x + p.w > px(c) && p.x < px(c + 12);
    if (!p.onGround) return go(dir);
    if (!inside) {
      dir = 'R';
      const tx = Math.floor((p.x + p.w + 4) / 16);
      const ty = Math.floor((p.y + p.h - 2) / 16);
      if (w.isSolidTile(w.tileAt(tx, ty))) {
        jt = 12;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    const row = (p.y + p.h) / 16;
    let k = 0;
    for (let i = 0; i < FLOORS.length; i++) if (row >= FLOORS[i] - 1) k = i;
    dir = k === exit ? 'R' : k % 2 === 0 ? 'R' : 'L';
    return go(dir);
  };
}
const room04 = (): Step[] => [{ policy: houseRoute(10, 3), until: and(ground, X(27)), max: 2400, note: 'three flights down, out of the third floor down' }, { hold: 'R', until: X(30), max: 300 }];
const act04 = (x: number): Step[] => [{ policy: houseRoute(x + 8, 1), until: and(ground, X(x + 26)), max: 2400, note: 'up the steps, one flight down, out' }, { hold: 'R', until: X(x + 27.5), max: 300 }];
/** the goods lift: on to the cage, jump up and press 1, ride down, walk in */
const liftPolicy: Policy = (w, _m, d) => {
  const st = w.flags.gtk4e as { down: boolean; y: number };
  const p = w.player;
  const D = Math.round(d.x / 16);
  const b1 = px(D - 3) + 44 + 5;
  if (st.down) return go(st.y >= 270 ? 'R' : '');
  if (p.cx < b1 - 3) return go('R');
  if (p.cx > b1 + 5) return go('L');
  return { move: '', jump: p.onGround && w.tick % 40 < 20 };
};

// ------------------------------------------------------------------ GTK-05
const held = (w: World) => (w.flags.gtk5 as Rule).hold;
const room05 = (): Step[] => [
  { hold: 'L', until: XL(1.4), max: 300, note: 'back to the bin behind you: the wrapper goes in' },
  { policy: stepper(), until: X(15.2), max: 900, note: 'over the flower bed, pick up the litter, the bin is full' },
  { hold: 'L', until: XL(10.4), max: 300, note: 'back to the empty bin' },
  { policy: stepper(), until: X(30), max: 900, note: 'now over the second bed' },
];
const act05 = (x: number): Step[] => [
  { policy: stepper(), until: X(x + 2.5), max: 600 },
  { policy: behindStroke(0, 'gtk5s'), until: X(x + 12), max: 1500, note: 'wrapper in hand: no bench, behind the stroke on foot' },
  { policy: stepper(), until: X(x + 27), max: 900, note: 'bin it at the second bin, over the bed' },
  { policy: behindStroke(1, 'gtk5s'), until: X(x + 34.5), max: 1500, note: 'the second sweeper' },
  { policy: stepper(), until: X(x + 45), max: 900 },
];
const act05b = (x: number): Step[] => [
  { policy: stepper(), until: X(x + 7.3), max: 900, note: 'off the step, the wrapper, the first bin (full)' },
  { hold: '', until: (w) => !held(w), max: 2400, note: 'wait for the bin round to empty it' },
  { policy: stepper(), until: X(x + 33), max: 900, note: 'over both beds' },
];
const onBench = (w: World) => w.player.onGround && Math.abs(w.player.y + w.player.h - 226) <= 1;
const act05c = (x: number): Step[] => [
  { hold: 'R', until: X(x + 3.1), max: 600 },
  { hold: 'R', jump: 10, ticks: 10, note: 'up on the bench' },
  { hold: 'R', until: onBench, max: 200, note: 'and there’s the wrapper, in hand' },
  { hold: 'L', until: XL(x + 1.4), max: 600, note: 'walk off the bench, back to the bin' },
  { hold: 'R', until: X(x + 3.1), max: 300 },
  { hold: 'R', jump: 10, ticks: 10, note: 'up on the bench again' },
  { hold: 'R', until: onBench, max: 200 },
  { policy: stepper(), until: X(x + 29), max: 1200, note: 'up on the bed, down, the next wrapper into the next bin, over the low bed' },
];
/** the taxi: walk past the bin, jump up and pay at the meter, wait for it to go, walk in */
const taxiPolicy: Policy = (w, _m, d) => {
  const st = w.flags.gtk5e as { paid: boolean };
  const p = w.player;
  const D = Math.round(d.x / 16);
  const mx = px(D - 4) + 9;
  if (st.paid) {
    const taxiGone = !w.entities.some((e) => (e as any).solid && (e as any).x > px(D - 3) && (e as any).x < px(D + 6) && (e as any).h === 36 && (e as any).on);
    return go(taxiGone ? 'R' : '');
  }
  if (p.cx < mx - 3) return go('R');
  if (p.cx > mx + 4) return go('L');
  return { move: '', jump: p.onGround && !held(w) && w.tick % 40 < 20 };
};

// ------------------------------------------------------------------ GTK-06
/** walk right, jumping up on to any one-way step just ahead and above (a footpath stair) */
function stairUp(): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const p = w.player;
    if (p.onGround) {
      const fr = Math.round((p.y + p.h) / 16);
      for (const tx of [Math.floor((p.x + p.w + 3) / 16)])
        for (let ty = fr - 2; ty <= fr - 1; ty++)
          if (w.tileAt(tx, ty) === 3) {
            jt = 10;
            return { move: 'R', jump: true };
          }
    }
    return go('R');
  };
}
const room06 = (): Step[] => [
  { policy: stairUp(), until: (w) => w.player.onGround && w.player.y + w.player.h <= 64, max: 900, note: 'up the stair to the top loop' },
  { hold: 'R', until: and(ground, X(26)), max: 900, note: 'along the top loop and down on the far side of the bend' },
  { hold: 'R', until: X(30), max: 300 },
];
const act06 = (x: number): Step[] => [
  { hold: 'R', until: and(ground, X(x + 23.2), (w) => w.player.y < 170), max: 900, note: 'down the stair to the roof garden, along the roof' },
  { hold: 'R', jump: 12, ticks: 12, note: 'up to the road' },
  { hold: 'R', until: and(ground, X(x + 32)), max: 300 },
];
const act06b = (x: number): Step[] => [
  { hold: 'R', until: and(ground, X(x + 8.2), (w) => w.player.y + w.player.h <= 209), max: 600, note: 'down to the last step' },
  { hold: '', until: (w) => { const st = w.flags.gtk6m as { t0: number }; if (st.t0 < 0) return false; const u = cyc(w, st.t0, STAND2.period); return u >= STAND2.out * 2 + 0.02 && u < STAND2.out * 2 + 0.25; }, max: 900, note: 'wait while the taxi backs out and in' },
  { hold: 'R', until: and(ground, X(x + 29)), max: 600, note: 'down and past the stand' },
];
/** the tank: wait short of the gush till it stops, then walk in */
const tankPolicy: Policy = (w, _m, d) => {
  const st = w.flags.gtk6e as { t0: number };
  const p = w.player;
  const g0 = d.x - 32;
  if (p.x + p.w < g0 - 30 || p.x > g0) return go('R');
  if (st.t0 < 0) return go('');
  const u = cyc(w, st.t0, TANK.period);
  if (p.x + p.w >= g0 - 4) return go('R');
  return go(u >= TANK.on + 0.02 && u <= TANK.on + 0.8 ? 'R' : '');
};

// ------------------------------------------------------------------ GTK-07
/** walk right along the road, jumping every hole in it (read off the map: the route knows where they are) */
function gapJumper(o: { skipPainted?: boolean } = {}): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const p = w.player;
    if (p.onGround) {
      const fr = Math.round((p.y + p.h) / 16);
      const tx = Math.floor((p.x + p.w + 14) / 16);
      if (!w.isSolidTile(w.tileAt(tx, fr)) && !w.isSolidTile(w.tileAt(tx, fr + 1))) {
        jt = 15;
        return { move: 'R', jump: true };
      }
      // up a step in the road
      const ty = Math.floor((p.y + p.h - 2) / 16);
      if (w.isSolidTile(w.tileAt(Math.floor((p.x + p.w + 4) / 16), ty))) {
        jt = 12;
        return { move: 'R', jump: true };
      }
    }
    void o;
    return go('R');
  };
}
const room07 = (): Step[] => [{ policy: gapJumper(), until: X(30), max: 1500, note: 'by the rope, jumping where it stops' }];
/** wait under the awning till the cloud lifts, then go */
const waitClear = (key: string): Step => ({
  hold: '',
  until: (w) => {
    const c = w.flags[key] as Cloud;
    if (c.t0 < 0) return false;
    const u = cyc(w, c.t0, c.thick + c.clear);
    return u >= c.thick && u < c.thick + 0.4;
  },
  max: 1500,
  note: 'wait for the cloud to lift, and look',
});
const thauRoute = (key: string) => (x: number): Step[] => [{ hold: 'R', until: X(x + 2), max: 300 }, waitClear(key), { policy: gapJumper(), until: X(x + 39.5), max: 1500, note: 'go while it’s clear' }];
const act07a = thauRoute('gtk7a');
const chiyaRoute = (key: string) => (x: number): Step[] => [
  { hold: 'R', until: X(x + 1.5), max: 300 },
  waitClear(key),
  { policy: gapJumper(), until: X(x + 30.5), max: 1500, note: 'to the second stall' },
  waitClear(key),
  { policy: gapJumper(), until: X(x + 59.5), max: 1500, note: 'and on while it’s clear' },
];
/** behind the drifting cloud: walk in the clear air at its back, jumping the holes; never catch it up */
const drifterRoute = (key: string, w0: number) => (x: number): Step[] => {
  const j = gapJumper();
  return [
    {
      policy: (w) => {
        const c = w.flags[key] as Cloud;
        const p = w.player;
        if (!p.onGround) return j(w);
        if (c.t0 >= 0 && p.x + p.w + 40 > (c.front ?? 0) && (c.front ?? 0) < px(x + w0)) return go('');
        return j(w);
      },
      until: X(x + w0 - 0.5),
      max: 4000,
      note: 'in the clear air behind the cloud',
    },
  ];
};
const act07b = (x: number): Step[] => [{ policy: gapJumper(), until: X(x + 31.5), max: 1500, note: 'trust the rope' }];
const act07c = (x: number): Step[] => [{ policy: gapJumper(), until: X(x + 39.5), max: 1500, note: 'ahead of the cloud bank' }];
const ropeDoors = new WeakMap<World, (w: World) => Out>();
const ropeDoor: Policy = (w) => {
  if (!ropeDoors.has(w)) ropeDoors.set(w, stepper());
  return ropeDoors.get(w)!(w);
};

// ------------------------------------------------------------------ GTK-08
/** board the first cabin when it's docked, ride it to the middle, cross to the second while they're together,
 *  ride that to its far end and step off. `stay`: never cross (the naive play). `down`: the second is below. */
function ropeway(key: string, o: { stay?: boolean; down?: boolean } = {}): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let onB = false;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      onB = false;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const [a, b] = w.flags[key] as Rig[];
    const p = w.player;
    if (b.carries(w)) onB = true;
    if (!p.onGround) return go(onB || o.down || p.x >= b.x + 6 ? '' : 'R');
    if (a.carries(w)) {
      if (o.stay) return go(p.cx < a.x + a.w / 2 ? 'R' : '');
      if (a.s.ph !== 'mid') return go(p.x + p.w < a.x + a.w - 3 ? 'R' : '');
      if (o.down) return go('R');
      jt = 9;
      return { move: 'R', jump: true };
    }
    if (b.carries(w)) {
      if (b.s.ph === 'end') return go('R');
      return go(p.cx < b.x + b.w / 2 ? 'R' : p.cx > b.x + b.w / 2 + 6 ? 'L' : '');
    }
    // on a deck: before the line, wait at the edge for the first cabin to be in
    if (p.x < a.x) return go(a.s.ph === 'end' && a.s.k === 0 ? 'R' : p.x + p.w < a.x - 6 ? 'R' : '');
    return go('R');
  };
}
const room08 = (): Step[] => [{ policy: ropeway('gtk8c'), until: and(ground, X(28)), max: 3000, note: 'ride up, cross at the middle, ride up to the far deck' }, { hold: 'R', until: X(29.5), max: 300 }];
const act08 = (x: number): Step[] => [{ policy: ropeway('gtk8ac', { down: true }), until: and(ground, X(x + 30)), max: 3000, note: 'ride out, step down on to the lower cabin at the middle' }, { hold: 'R', until: X(x + 33.5), max: 300 }];
const act08b = (x: number): Step[] => [{ policy: ropeway('gtk8bc'), until: and(ground, X(x + 30)), max: 3000, note: 'ride out, jump up on to the higher cabin at the middle' }, { hold: 'R', until: X(x + 33.5), max: 300 }];
/** the docked cabin: wait till its doors open, then straight through */
const dockPolicy: Policy = (w, _m, d) => {
  const st = w.flags.gtk8e as { t0: number };
  const p = w.player;
  const x0 = d.x - 96;
  if (p.x + p.w < x0 - 24 || p.x > x0 + 4) return go('R');
  if (st.t0 < 0) return go('');
  const u = cyc(w, st.t0, DOCK.period);
  return go(u >= 0.02 && u <= 0.9 ? 'R' : '');
};

// ------------------------------------------------------------------ GTK-09
/** get on the yak, keep to the middle of its back, and get off: at the far bank (`at`, px), by a jump at the photo
 *  stop (`jumpAtPhoto`), or the moment it first stops (`offAtStop`, the obvious fix that dies) */
function yakRide(key: string, o: { at?: number; jumpAt?: boolean; jumpAtPhoto?: boolean; offAtStop?: boolean; mountLeft?: number }): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  let off = false;
  let rode = false;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      off = false;
      rode = false;
    }
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    const y = (w.flags[key] as Yak[])[0];
    const p = w.player;
    const on = y.carries(w);
    if (on) rode = true;
    if (off || (rode && !on && p.onGround)) {
      off = true;
      return go('R');
    }
    if (!p.onGround) {
      if (rode && !on && off) return go('R');
      const c = y.x + y.w / 2;
      return go(p.cx < c - 5 ? 'R' : p.cx > c + 5 ? 'L' : '');
    }
    if (!on) {
      // mount: from beside it, when it's at the near end
      if (o.mountLeft !== undefined && Math.abs(y.x - o.mountLeft) > 6) return go(p.x + p.w < o.mountLeft - 14 ? 'R' : '');
      if (p.x + p.w < y.x - 6) return go('R');
      jt = 14;
      return { move: 'R', jump: true };
    }
    const stopped = y.s.leg % 2 === 0 || 'wait' in ({} as any) ? !y.s.dir || y.s.t > 0 : false;
    if (o.offAtStop && y.s.t > 6) {
      off = true;
      return go('R');
    }
    if (o.jumpAtPhoto && y.s.photo && y.s.t > 10) {
      off = true;
      jt = 15;
      return { move: 'R', jump: true };
    }
    if (o.at !== undefined && y.x >= o.at - 1 && y.s.t > 4) {
      off = true;
      if (o.jumpAt) {
        jt = 15;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    void stopped;
    const c = y.x + y.w / 2;
    return go(p.cx < c - 4 ? 'R' : p.cx > c + 4 ? 'L' : '');
  };
}
const room09 = (): Step[] => [{ policy: yakRide('gtk9', { at: px(26) }), until: and(ground, X(28.5)), max: 4000, note: 'ride across, stay on for the photo, off on the far bank' }, { hold: 'R', until: X(30), max: 300 }];
const act09 = (x: number): Step[] => [{ policy: yakRide('gtk9a', { jumpAtPhoto: true }), until: and(ground, X(x + 25.5)), max: 4000, note: 'ride out, jump for the bank at the photo stop' }, { hold: 'R', until: X(x + 33), max: 300 }];
/** the last yak: on, and as it passes under the first step, jump up on to it; then the stair and the snow road */
function stepOff(x: number): (w: World) => Out {
  const ride = yakRide('gtk9b', {});
  let W: World | null = null;
  let jt = 0;
  let off = false;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
      off = false;
    }
    const y = (w.flags.gtk9b as Yak[])[0];
    const p = w.player;
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    if (off) return go(p.onGround ? '' : 'R');
    if (y.carries(w) && p.x >= px(x + 11.2) && p.x <= px(x + 13)) {
      off = true;
      jt = 10;
      return { move: 'R', jump: true };
    }
    return ride(w);
  };
}
const act09b = (x: number): Step[] => [
  { policy: stepOff(x), until: (w) => w.player.onGround && w.player.y + w.player.h <= 193 && w.player.x > px(x + 12), max: 3000, note: 'off the yak on the move, up on to the first step' },
  { policy: climbAll(), until: and(ground, X(x + 20), (w) => w.player.y + w.player.h <= 129), max: 1200, note: 'up the stair' },
  { hold: 'R', until: X(x + 35.5), max: 600, note: 'along the snow road and down' },
];
const gateRides = new WeakMap<World, (w: World) => Out>();
const gateYak: Policy = (w, _m, d) => {
  const D = Math.round(d.x / 16);
  if (!gateRides.has(w)) gateRides.set(w, yakRide('gtk9e', { mountLeft: px(D - 9), at: px(D - 4.5), jumpAt: true }));
  return gateRides.get(w)!(w);
};

// ------------------------------------------------------------------ GTK-10
/** walk right, hopping up any step ahead: a tile wall or a one-way ledge just above */
function climbAll(): (w: World) => Out {
  const a = stairUp();
  const b = stepper();
  return (w) => {
    const p = w.player;
    if (p.onGround) {
      const ty = Math.floor((p.y + p.h - 2) / 16);
      if (w.isSolidTile(w.tileAt(Math.floor((p.x + p.w + 4) / 16), ty))) return b(w);
    }
    return a(w);
  };
}
const room10 = (): Step[] => [{ policy: houseRoute(10, 3), until: and(ground, X(27)), max: 2400, note: 'in the cloud: count three flights, out of the third floor down' }, { hold: 'R', until: X(30), max: 300 }];
const act10a = (x: number): Step[] => [
  { policy: stepper(), until: X(x + 8.3), max: 900, note: 'down to the stall, pick up the wrapper, the bin is full' },
  { hold: 'L', until: XL(x + 3.4), max: 400, note: 'back to the empty bin by the steps' },
  { policy: rideTier('gtk10s', true), until: and(ground, X(x + 15), (w) => w.player.y < 100), max: 2400, note: 'on to the stool, ride the top tier, jump to the shelf' },
  { hold: 'R', until: and(ground, X(x + 31)), max: 600 },
];
const act10b = (x: number): Step[] => [{ policy: gapJumper(), until: X(x + 29.5), max: 1500, note: 'jump where the rope stops' }];
const act10c = (x: number): Step[] => [
  { policy: stepper(), until: X(x + 10.3), max: 900, note: 'the wrapper at the foot of the stair; this bin is full' },
  { hold: 'L', until: XL(x + 3.4), max: 600, note: 'back to the empty bin' },
  { policy: climbAll(), until: (w) => w.player.onGround && w.player.y + w.player.h <= 64 && w.player.x > px(x + 30), max: 1500, note: 'up the stair in the cloud, on to the next loop' },
];
const act10d = (x: number): Step[] => [{ policy: houseRoute(x + 8, 1), until: and(ground, X(x + 25)), max: 2400, note: 'one flight down, out' }, { hold: 'R', until: X(x + 27.5), max: 300 }];
const act10e = (x: number): Step[] => [
  { policy: stepper(), until: X(x + 7.3), max: 900, note: 'the wrapper; the bin ahead is full' },
  { hold: 'L', until: XL(x + 1.4), max: 600, note: 'back into the cloud to the empty bin' },
  { policy: gapJumper(), until: X(x + 33.5), max: 1500, note: 'run, jumping where the rope stops' },
];
const views = new WeakMap<World, (w: World) => Out>();
const viewBack = new WeakMap<World, boolean>();
const viewPolicy: Policy = (w, _m, d) => {
  if (!views.has(w)) views.set(w, climbAll());
  const p = w.player;
  const first = d.x - px(14);
  // fell off a step and ended up under the stair: back out and start the climb again
  const under = p.onGround && p.y + p.h >= 240 && p.x > first + 20;
  if (under) viewBack.set(w, true);
  if (viewBack.get(w)) {
    if (p.x > first - 24) return go('L');
    viewBack.set(w, false);
  }
  return views.get(w)!(w);
};

/** the route up to the start of an act: the room's route, then every act before it */
function upTo(id: string, room: Step[], actId: string): { steps: Step[]; x: number } {
  const def = LEVEL_BY_ID.get(id)!;
  const out = [...room];
  for (const p of def.parts ?? []) {
    if (p.kind === actId) return { steps: out, x: p.x0 };
    out.push(...actRoutes[p.kind](p.x0));
  }
  throw new Error(`${id}: no act ${actId}`);
}
/** scripted deaths in an act: reach it by the route, then play `tail` there */
function actDeath(id: string, room: Step[], actId: string, what: string, tail: (x: number) => Step[], cause: string) {
  const { steps, x } = upTo(id, room, actId);
  (mistakes[id] ??= []).push({ what, steps: [...steps, ...tail(x)], cause });
}
const blind = (): Step[] => [{ hold: 'R', until: done, max: 3000, note: 'just walk on' }];
/** the lengthened stages' added acts each get a first-timer death and, where there is one, the obvious fix's */
function actDeaths() {
  const r7 = room07();
  actDeath('GTK-07', r7, 'gtk07-peeche', 'catch the cloud up and walk on blind', (x) => [{ hold: 'R', until: X(x + 2), max: 300 }, ...blind()], 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-dheere', 'catch the cloud up and walk on blind', (x) => [{ hold: 'R', until: X(x + 2), max: 300 }, ...blind()], 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-chiya', 'no stop at the stall: straight on into the cloud', () => blind(), 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-chiya', 'wait once, then walk on blind past the second stall', (x) => [...chiyaRoute('gtk7j')(x).slice(0, 3), ...blind()], 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-thau2', 'no stop at the stall', () => blind(), 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-thau2', 'wait once, then walk on blind past the second stall', (x) => [...chiyaRoute('gtk7m')(x).slice(0, 3), ...blind()], 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-jaldi', 'walk, don’t jump: the holes are right there', () => blind(), 'gtk-badal');
  actDeath('GTK-07', r7, 'gtk07-saath', 'behind the cloud, the road looks whole: walk it', (x) => [{ hold: 'R', until: X(x + 2), max: 300 }, ...blind()], 'gtk-deewar');
}

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['GTK-01'] = tourRoute();
  S['GTK-02'] = room02();
  lengthen('GTK-02', 0, []);
  S['GTK-03'] = room03();
  lengthen('GTK-03', 0, []);
  S['GTK-04'] = room04();
  lengthen('GTK-04', 0, []);
  S['GTK-05'] = room05();
  lengthen('GTK-05', 0, []);
  S['GTK-06'] = room06();
  lengthen('GTK-06', 0, []);
  S['GTK-07'] = room07();
  lengthen('GTK-07', 0, []);
  S['GTK-08'] = room08();
  lengthen('GTK-08', 0, []);
  S['GTK-09'] = room09();
  lengthen('GTK-09', 0, []);
  S['GTK-10'] = room10();
  lengthen('GTK-10', 0, []);
  actDeaths();
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'GTK-10': { steps: [{ policy: stepper(), until: done, max: 2400, note: 'out of the first door, as Tara says' }], cause: 'gtk-galat-tala' },
  'GTK-09': { steps: [{ hold: 'R', until: done, max: 900, note: 'the ice holds, surely: walk across' }], cause: 'gtk-hiun' },
  'GTK-08': { steps: [{ policy: ropeway('gtk8c', { stay: true }), until: done, max: 3000, note: 'ride it all the way, as Tara says' }], cause: 'gtk-ropeway' },
  'GTK-07': { steps: [{ hold: 'R', until: done, max: 900, note: 'just run, as Tara says' }], cause: 'gtk-badal' },
  'GTK-06': { steps: [{ hold: 'R', until: done, max: 900, note: 'the shortcut stairs, down' }], cause: 'gtk-taxi' },
  'GTK-05': { steps: [{ policy: stepper(), until: done, max: 1200, note: 'hop the flowers, as Tara says' }], cause: 'gtk-jurmana' },
  'GTK-04': { steps: [{ policy: stepper(), until: done, max: 2400, note: 'straight on, out of the first door' }], cause: 'gtk-galat-tala' },
  'GTK-03': { steps: [{ policy: bagHop('gtk3', { every: true, dwell: 0.3 }), until: done, max: 2400, note: 'on to every bag' }], cause: 'gtk-polythene' },
  'GTK-01': { steps: [{ policy: stepper(), until: done, max: 2400 }], cause: 'gtk-jhadu' },
  'GTK-02': {
    steps: [{ policy: rideTier('gtk2', false, 'stay'), until: done, max: 2400, note: 'on top, and wait as Tara says' }],
    cause: 'gtk-bhaap',
  },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'GTK-10': { steps: [...room10(), { policy: stepper(), until: X(32 + 8.3), max: 900 }, { policy: rideTier('gtk10s', true), until: done, max: 2400, note: 'straight on to the steamer with the wrapper in hand' }], cause: 'gtk-jurmana' },
  'GTK-09': { steps: [{ policy: yakRide('gtk9', { offAtStop: true }), until: done, max: 3000, note: 'ride the yak, off when it stops, as Tara says' }], cause: 'gtk-hiun' },
  'GTK-07': { steps: [...room07(), ...act07a(32), { hold: 'R', until: X(74), max: 300 }, waitClear('gtk7b'), { hold: 'R', until: done, max: 900, note: 'the cloud has lifted and the road looks whole: walk it' }], cause: 'gtk-deewar' },
  'GTK-06': {
    steps: [...room06(), { policy: stairUp(), until: (w) => w.player.x > px(32) && w.player.onGround && w.player.y + w.player.h <= 64, max: 900, note: 'up again: the stair up worked last time' }, { hold: 'R', until: X(39.2), max: 300 }, { hold: 'R', jump: 14, ticks: 14, note: 'and off it, over the gully' }, { hold: 'R', until: done, max: 600 }],
    cause: 'gtk-chhat',
  },
  'GTK-05': { steps: [room05()[0], { policy: stepper(), until: done, max: 1500, note: 'bin it, then trust the next bin too' }], cause: 'gtk-jurmana' },
  'GTK-04': { steps: [{ policy: houseRoute(10, 4), until: done, max: 2400, note: 'count three doors down (the shop has none): the basement' }], cause: 'gtk-jhora' },
  'GTK-03': { steps: [{ policy: bagHop('gtk3', { dwell: 1.4 }), until: and(ground, X(24)), max: 2400 }, { hold: 'R', until: X(x3(0)), max: 300 }, { policy: bagHop('gtk3a', { dwell: 1.4 }), until: done, max: 3000, note: 'stop on each cloth bag to check the stitches' }], cause: 'gtk-jaanch' },
  'GTK-02': {
    steps: [{ policy: rideTier('gtk2', false, 'second'), until: done, max: 2400, note: 'let the top tier go, get on the second' }],
    cause: 'gtk-dhakkan',
  },
};
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'GTK-01': [{ what: 'the bench works, so walk on at the second sweeper', steps: [...benchRoute(), { policy: stepper(), until: done, max: 2400 }], cause: 'gtk-jhadu' }],
};
const actRoutes: Record<string, (x: number) => Step[]> = {
  'gtk02-bhatti': act02,
  'gtk03-jaanch': act03,
  'gtk03-ulto': act03b,
  'gtk04-ghar': act04,
  'gtk05-shaam': act05,
  'gtk05-kachra': act05b,
  'gtk05-chabutra': act05c,
  'gtk06-chhat': act06,
  'gtk06-modh': act06b,
  'gtk07-thau': act07a,
  'gtk07-chitra': act07b,
  'gtk07-ghumti': act07c,
  'gtk07-chhaya': thauRoute('gtk7d'),
  'gtk07-rang': act07b,
  'gtk07-bhaga': act07c,
  'gtk07-dagar': act07c,
  'gtk07-chiya': chiyaRoute('gtk7j'),
  'gtk07-saath': drifterRoute('gtk7k', 44),
  'gtk07-jaldi': act07c,
  'gtk07-thau2': chiyaRoute('gtk7m'),
  'gtk07-peeche': drifterRoute('gtk7h', 44),
  'gtk07-dheere': drifterRoute('gtk7i', 48),
  'gtk08-tar': act08,
  'gtk08-upar': act08b,
  'gtk09-chamri': act09,
  'gtk09-chattan': act09b,
  'gtk10-thela': act10a,
  'gtk10-rassi': act10b,
  'gtk10-chadhai': act10c,
  'gtk10-ghar': act10d,
  'gtk10-peechha': act10e,
};
const endingPolicies: Record<string, Policy> = {
  'gtk-steam-vent': ventPolicy,
  'gtk-jhola-entry': jholaPolicy,
  'gtk-lift-counts-down': liftPolicy,
  'gtk-taxi-meter': taxiPolicy,
  'gtk-tank-overflow': tankPolicy,
  'gtk-rope-climbs-to-door': ropeDoor,
  'gtk-cabin-both-doors': dockPolicy,
  'gtk-gate-yak-snowbank': gateYak,
  'gtk-viewpoint-second-floor': viewPolicy,
};
void hop;

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['GTK-01', 'GTK-02', 'GTK-03', 'GTK-04', 'GTK-05', 'GTK-06', 'GTK-07', 'GTK-08', 'GTK-09', 'GTK-10'],
};
