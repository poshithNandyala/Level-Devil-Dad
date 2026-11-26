// Proven routes for Gangtok: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, done, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { STROKE, SWEEP_PERIOD, type Sweep } from '../../src/game/cities/gtk/s01';
import { VENT, type Steamer } from '../../src/game/cities/gtk/s02';
import type { Bag } from '../../src/game/cities/gtk/s03';
import { FLOORS } from '../../src/game/cities/gtk/s04';

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
function behindStroke(i: number): (w: World) => Out {
  return (w) => {
    const st = (w.flags.gtk1 as Sweep[])[i];
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
function bagHop(key: string, o: { every?: boolean; dwell?: number } = {}): (w: World) => Out {
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
    const ahead = all.filter((b) => b.x > p.x + 4 && (o.every || !b.s.thin));
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
    const edge = on ? on.x + on.w - (far && !o.dwell ? 14 : 3) : first.x - 26;
    if (p.x + p.w < edge) return go('R');
    jt = far ? (o.dwell ? 17 : 15) : 8;
    aim = target ?? null;
    return { move: 'R', jump: true };
  };
}
const room03 = (): Step[] => [{ policy: bagHop('gtk3'), until: and(ground, X(24)), max: 2400, note: 'cloth to cloth' }, { hold: 'R', until: X(29), max: 300 }];
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

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['GTK-01'] = tourRoute();
  S['GTK-02'] = room02();
  lengthen('GTK-02', 0, []);
  S['GTK-03'] = room03();
  lengthen('GTK-03', 0, []);
  S['GTK-04'] = room04();
  lengthen('GTK-04', 0, []);
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'GTK-04': { steps: [{ policy: stepper(), until: done, max: 2400, note: 'straight on, out of the first door' }], cause: 'gtk-galat-tala' },
  'GTK-03': { steps: [{ policy: bagHop('gtk3', { every: true, dwell: 0.3 }), until: done, max: 2400, note: 'on to every bag' }], cause: 'gtk-polythene' },
  'GTK-01': { steps: [{ policy: stepper(), until: done, max: 2400 }], cause: 'gtk-jhadu' },
  'GTK-02': {
    steps: [{ policy: rideTier('gtk2', false, 'stay'), until: done, max: 2400, note: 'on top, and wait as Tara says' }],
    cause: 'gtk-bhaap',
  },
};
const fix: Record<string, { steps: Step[]; cause?: string }> = {
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
  'gtk04-ghar': act04,
};
const endingPolicies: Record<string, Policy> = {
  'gtk-steam-vent': ventPolicy,
  'gtk-jhola-entry': jholaPolicy,
  'gtk-lift-counts-down': liftPolicy,
};
void hop;

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['GTK-01', 'GTK-02', 'GTK-03', 'GTK-04'],
};
