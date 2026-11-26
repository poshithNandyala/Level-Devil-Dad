// Proven routes for Ranchi (the eastern chapter): each stage's room, its acts, and its door.
// Found by tests/city-tests.ts and merged into SOLUTIONS, NAIVE, FIX, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { ChhauDancer, Cook, Range, falls, type Boss, type CastMould, type CookStep, type Crucible, type Dhuska, type ElephantRow, type Mould, type Rugra, type Storm, type Tadit } from '../../src/game/cities/rnc/entities';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
interface Mem {
  hold: number;
  [k: string]: any;
}
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const FLOOR_PX = 15 * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};

// ------------------------------------------------------------------ dhuska
/** ticks until the cook next does `a` to dhuska i */
export const untilAct = (w: World, c: Cook, i: number, a: CookStep['a']) => {
  const t = c.at(w);
  let best = Infinity;
  for (const s of c.plan) if (s.i === i && s.a === a) best = Math.min(best, (((s.at - t) % c.period) + c.period) % c.period);
  return best;
};
/** ticks a dhuska stays fit to stand on (-1: not up) */
export const life = (w: World, c: Cook, i: number) => {
  const d = c.dhuskas[i];
  if (d.state === 'pale' || d.state === 'rise') return Math.min(untilAct(w, c, i, 'flip'), untilAct(w, c, i, 'scoop'));
  if (d.state === 'gold') return untilAct(w, c, i, 'scoop');
  return -1;
};
const cooks = (w: World) => ((w.flags.cooks ?? []) as Cook[]).slice().sort((a, b) => a.bank0 - b.bank0);
const riding = (w: World, d: Dhuska) => d.solid.collidable && w.player.isRiding(d.solid);

/** across the next kadhai ahead, dhuska by dhuska: on to each one with time to spare, off before the spoon */
function crossKadhai(): (w: World) => Out {
  let W: World | null = null;
  let tgt: number | null = null,
    air = false,
    jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      tgt = null;
      air = false;
      jt = 0;
    }
    const p = w.player;
    const c = cooks(w).find((k) => k.bank1 > p.cx - 2);
    if (!c) return go('R');
    if (jt > 0) {
      jt--;
      return { move: tgt === null ? 'R' : toward(w, tgt, 1) || 'R', jump: true };
    }
    if (tgt !== null) {
      if (!p.onGround) {
        air = true;
        return go(toward(w, tgt, 2));
      }
      if (air) {
        tgt = null;
        air = false;
      } else return go(toward(w, tgt, 1));
    }
    if (!p.onGround) return go('');
    if (p.cx > c.bank1 + 4) return go('R');
    const ahead = c.dhuskas
      .map((d, i) => ({ d, i }))
      .filter((o) => o.d.x > p.cx + 8)
      .sort((a, b) => a.d.x - b.d.x);
    const cur = c.dhuskas.findIndex((d) => riding(w, d));
    if (!ahead.length) {
      tgt = c.bank1 + 14;
      jt = 26;
      return { move: 'R', jump: true };
    }
    if (cur < 0 && p.cx < c.bank0 - 9) return go('R');
    const nx = ahead[0];
    const reach = nx.d.x - p.cx;
    // the spoon's coming for the one I'm on: go now if the next one will do at all
    const hurry = cur >= 0 && life(w, c, cur) < 45 && life(w, c, nx.i) > 20 + reach * 0.6;
    if (hurry || (life(w, c, nx.i) > 50 + reach * 0.6 && (cur >= 0 || life(w, c, nx.i) > 110))) {
      tgt = nx.d.x;
      jt = reach > 52 ? 22 : 11;
      return { move: 'R', jump: true };
    }
    if (cur >= 0) return go(toward(w, c.dhuskas[cur].x, 2));
    return go(p.cx < c.bank0 - 7 ? 'R' : '');
  };
}
const kadhaiRun = (toX: number, note: string): Step => ({ policy: crossKadhai(), until: and(ground, X(toX)), max: 2400, note });

// ------------------------------------------------------------------ teer
const ranges = (w: World) => ((w.flags.ranges ?? []) as { r: Range; boss: Boss; edge?: number }[]).slice().sort((a, b) => a.r.face - b.r.face);
/** up the arrows stuck in the next boss ahead, one height at a time, between shots and before the pull */
function climbArrows(): (w: World) => Out {
  let W: World | null = null;
  let jt = 0,
    jm: Move = '';
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    const p = w.player;
    const g = ranges(w).find((o) => o.boss.x + o.boss.wd > p.cx);
    if (!g) return go('R');
    const { r, boss, edge } = g;
    if (jt > 0) {
      jt--;
      return { move: jm, jump: true };
    }
    const feet = p.y + p.h;
    if (p.onGround && feet <= boss.top + 1) return go('R');
    if (!p.onGround) return go(jm === 'R' && p.y + p.h < boss.top + 4 ? 'R' : toward(w, r.face - 8, 1));
    const stand = edge !== undefined ? edge - 6 : r.face - 8;
    if (feet >= px(15) - 1 && p.cx < stand - 2) return go('R');
    // the step above me: the lowest lane higher than my feet
    const lanes = r.men.map((m, i) => ({ y: m.lane, i })).filter((l) => l.y - 2 < feet - 4);
    lanes.sort((a, b) => b.y - a.y);
    const next = lanes[0];
    const t = r.at(w);
    const pullSoon = t >= r.pullAt - 70 && t <= r.pullAt + 2;
    if (!next) {
      // up on to the top of the boss
      jt = 12;
      jm = 'R';
      return { move: 'R', jump: true };
    }
    const there = r.quivers[next.i].some((a) => a.state === 'stuck');
    // anything coming at a height my jump will pass through
    const danger = r.quivers.some((q, i) => r.men[i].lane > feet - 58 && r.men[i].lane < feet - 3 && q.some((a) => a.state === 'fly' && Math.abs(r.face - a.x) / 380 < 0.55));
    // ...or about to be: an archer at that height drawing his bow (a person sees that coming)
    const t0 = r.at(w);
    const drawing = r.men.some((m) => m.lane > feet - 58 && m.lane < feet - 3 && m.shots.some((sh) => sh * 120 - t0 >= 0 && sh * 120 - t0 < 30));
    const onGround = feet >= px(15) - 1;
    if (there && !danger && !drawing && !pullSoon && !(onGround && !r.shooting(w))) {
      jt = 11;
      jm = onGround && edge !== undefined ? 'R' : '';
      return { move: jm, jump: true };
    }
    return go(onGround ? toward(w, stand, 1) : toward(w, r.face - 8, 1));
  };
}
const arrowRun = (toX: number, note: string): Step => ({ policy: climbArrows(), until: and(ground, X(toX)), max: 4000, note });


// ------------------------------------------------------------------ rugra
const storms = (w: World) => (w.flags.storms ?? []) as Storm[];
/** the bump nearest x */
export const spotAt = (w: World, x: number) => {
  let best: Rugra | null = null;
  for (const s of storms(w)) for (const r of s.spots) if (!best || Math.abs(r.x - x) < Math.abs(best.x - x)) best = r;
  return best!;
};
/** wait on the bump at bx till the thunder lifts you, then jump for (toX, feet at y) */
function rideRugra(bx: number, toX: number, y: number, jt: number): (w: World) => Out {
  let W: World | null = null;
  let jl = 0,
    flew = false;
  return (w) => {
    if (W !== w) {
      W = w;
      jl = 0;
      flew = false;
    }
    const p = w.player;
    const r = spotAt(w, bx);
    if (jl > 0) {
      jl--;
      return { move: toward(w, toX, 1) || 'R', jump: true };
    }
    if (!p.onGround) return go(flew ? toward(w, toX, 2) : '');
    flew = false;
    if (r.state === 'up' && p.isRiding(r.solid) && r.firm() > 0.25) {
      jl = jt;
      flew = true;
      return { move: toward(w, toX, 1) || 'R', jump: true };
    }
    if (p.y + p.h <= y + 1) return go(toward(w, toX, 2));
    return go(r.up && !p.isRiding(r.solid) ? '' : toward(w, bx, 1));
  };
}
const ride = (bx: number, toX: number, y: number, jt: number, note: string): Step => ({
  policy: rideRugra(bx, toX, y, jt),
  until: and(ground, (w) => w.player.y + w.player.h <= y + 1 && Math.abs(w.player.cx - toX) < 10),
  max: 3000,
  note,
});

/** up the rugra stairs ahead, one step behind the lightning: on to each one only once it's been struck */
function climbStairs(): (w: World) => Out {
  let W: World | null = null;
  let jl = 0,
    tgt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jl = 0;
    }
    const p = w.player;
    const st = storms(w).find((s) => s.spots.length >= 4 && s.spots[s.spots.length - 1].x > p.cx - 20);
    if (!st) return go('R');
    const steps = st.spots.slice().sort((a, b) => a.x - b.x);
    const top = steps[steps.length - 1];
    if (jl > 0) {
      jl--;
      return { move: toward(w, tgt, 1) || 'R', jump: true };
    }
    if (!p.onGround) return go(toward(w, tgt, 2));
    const feet = p.y + p.h;
    if (p.cx > top.x + 14 && feet < top.floor - 60) return go('R');
    const on = steps.findIndex((r) => r.up && p.isRiding(r.solid));
    const k = on + 1;
    if (k >= steps.length) {
      // off the last step and on to the cliff
      tgt = top.x + 44;
      jl = 10;
      return { move: 'R', jump: true };
    }
    const nx = steps[k];
    const struck = st.last !== null && (st.last.x === nx.x || (k === steps.length - 1 && st.last.x > nx.x)) && st.next(w) > 60;
    if (on < 0) {
      // on the ground: wait just short of the first step (hopping anything in the way between strikes)
      const wait = steps[0].x - 24;
      if (p.cx < wait - 4 && w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
        const rodNext = st.rods.some((r) => Math.abs(r.x - st.nextX(w)) < 4 && Math.abs(r.x - p.cx) < 50);
        if (rodNext && st.next(w) < 100) return go('L');
        tgt = wait;
        jl = 9;
        return { move: 'R', jump: true };
      }
      if (k === 0 && nx.up && struck && nx.firm() > 0.5 && Math.abs(p.cx - wait) < 4) {
        tgt = nx.x;
        jl = 10;
        return { move: 'R', jump: true };
      }
      return go(toward(w, wait, 1));
    }
    if (nx.up && struck && nx.firm() > 0.5) {
      tgt = nx.x;
      jl = 10;
      return { move: 'R', jump: true };
    }
    return go(toward(w, steps[on].x, 1));
  };
}

// ------------------------------------------------------------------ chhau
const dancers = (w: World) => w.entities.filter((e) => e instanceof ChhauDancer) as ChhauDancer[];
/** stop under the stand at x and jump up into its mask */
const wear = (x: number, kind: string, note: string): Step[] => [
  { policy: (w) => go(toward(w, x, 1)), until: (w) => Math.abs(w.player.cx - x) <= 1 && w.player.onGround, max: 900, note },
  { jump: 6, until: (w) => w.flags.mask === kind, max: 120, note: 'jump up at the mask' },
  { until: ground, max: 120 },
];
/** with the peacock mask on: under the peacock's spread wing, up on to it, and off at the top of its leap */
function peacockLift(toX: number, y: number): (w: World) => Out {
  let W: World | null = null;
  let jl = 0,
    off = false;
  return (w) => {
    if (W !== w) {
      W = w;
      jl = 0;
      off = false;
    }
    const p = w.player;
    const d = dancers(w).filter((k) => k.kind === 'mayur' && k.state !== 'gone').sort((a, b) => Math.abs(a.x - p.cx) - Math.abs(b.x - p.cx))[0];
    if (jl > 0) {
      jl--;
      return { move: off ? 'R' : '', jump: true };
    }
    if (!p.onGround) return go(off ? 'R' : toward(w, d ? d.mark + 14 : toX, 2));
    if (p.y + p.h <= y + 1) return go('R');
    if (!d) return go(toward(w, toX, 2));
    const on = d.solid.collidable && p.isRiding(d.solid);
    if (on) {
      if (d.state === 'rise' && d.t > 0.45 && d.t < 1.4) {
        off = true;
        jl = 10;
        return { move: 'R', jump: true };
      }
      return go(toward(w, d.mark + 14, 1));
    }
    if (d.solid.collidable && Math.abs(p.cx - (d.mark + 14)) < 3) {
      off = false;
      jl = 8;
      return { move: '', jump: true };
    }
    return go(toward(w, d.mark + 14, 1));
  };
}

/** on the peacock's wing, up into the tiger mask over it, and hold on while it flies */
function peacockFlight(standX: number): (w: World) => Out {
  let W: World | null = null;
  let jl = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jl = 0;
    }
    const p = w.player;
    const d = dancers(w).filter((k) => k.kind === 'mayur' && k.perch !== null).sort((a, b) => Math.abs(a.x - p.cx) - Math.abs(b.x - p.cx))[0];
    if (jl > 0) {
      jl--;
      return { move: toward(w, standX, 1), jump: true };
    }
    if (!d) return go('R');
    const on = d.solid.collidable && p.isRiding(d.solid);
    if (d.state === 'fly') return go('');
    if (d.state === 'perched') return go('R');
    if (!p.onGround) return go(toward(w, standX, 1));
    if (on) {
      if (w.flags.mask === 'mayur' && Math.abs(p.cx - standX) <= 1) {
        jl = 7;
        return { move: '', jump: true };
      }
      return go(toward(w, standX, 1));
    }
    if (d.solid.collidable && Math.abs(p.cx - standX) < 3) {
      jl = 8;
      return { move: '', jump: true };
    }
    return go(toward(w, standX, 1));
  };
}

// ------------------------------------------------------------------ dokra
const moulds = (w: World) => (w.flags.moulds ?? []) as Mould[];
/** wait at the mouth of the kiln at x0 for the mould to go hollow, then straight through */
function throughMould(x0: number): (w: World) => Out {
  return (w) => {
    const p = w.player;
    const m = moulds(w).find((k) => k.x0 === x0)!;
    if (p.x >= m.x0 - 2) return go('R');
    if (m.phase === 'hollow' && m.t < m.dur('hollow') - 0.75) return go('R');
    return go(toward(w, m.x0 - 9, 1));
  };
}
const kilnRun = (c: number, note: string): Step => ({ policy: throughMould(px(c)), until: (w) => w.player.x > moulds(w).find((k) => k.x0 === px(c))!.x1 + 2, max: 2400, note });

/** tip the crucible from under its handle, wait for the brass elephant, and climb it to the ledge beyond */
function pourClimb(i: number, ledgeY: number): (w: World) => Out {
  let W: World | null = null;
  let jl = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jl = 0;
    }
    const p = w.player;
    const k = (w.flags.crucibles as Crucible[])[i];
    const m = k.into;
    if (jl > 0) {
      jl--;
      return { move: k.state === 'full' ? '' : 'R', jump: true };
    }
    if (!p.onGround) return go(k.state === 'full' || m.state !== 'brass' ? '' : 'R');
    if (p.y + p.h <= ledgeY + 1) return go('R');
    const hx = k.handle.x + k.handle.w / 2;
    if (k.state === 'full') {
      if (Math.abs(p.cx - hx) <= 1 && Math.abs(p.vx) < 5) {
        jl = 8;
        return { move: '', jump: true };
      }
      return go(toward(w, hx, 1));
    }
    if (m.state !== 'brass') return go(toward(w, hx, 1));
    // up the elephant and on to the ledge
    if (w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
      jl = 10;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}


// ------------------------------------------------------------------ hundru
/** walk right, hop up anything in the way, and walk (never jump) off every edge */
function walkHop(): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    const p = w.player;
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    if (p.onGround && w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
      jt = 16;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}

/** to the railing, a hop up on to it (or over it), a step off into the water, then let the water work */
function railHop(): (w: World) => Out {
  let W: World | null = null;
  let jt = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      jt = 0;
    }
    const p = w.player;
    if (falls(w).inWater) return go('');
    // over the railing's top: let go, and come down on it
    if (!p.onGround && p.y + p.h <= px(3) && p.x + p.w > px(8)) return { move: '', jump: jt-- > 0 };
    if (jt > 0) {
      jt--;
      return { move: 'R', jump: true };
    }
    if (p.onGround && p.y + p.h === FLOOR_PX - px(11) && w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
      jt = 8;
      return { move: 'R', jump: true };
    }
    return go('R');
  };
}

// ------------------------------------------------------------------ rooms
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['RNC-02'] = [kadhaiRun(23.6, 'on to each dhuska as it comes up, off before the spoon'), { hold: 'R', until: and(ground, X(28)), max: 600 }];
  lengthen('RNC-02', 0, []);
  S['RNC-03'] = [arrowRun(25.5, 'between shots, up the arrows, on top before the whistle')];
  lengthen('RNC-03', 0, []);
  S['RNC-04'] = [
    ride(px(6) + 8, px(10) + 4, px(10), 10, 'on the bump below the rock: the thunder lifts you on to it'),
    { hold: 'R', until: and(ground, X(16.6)), max: 600, note: 'off the rock before the cloud gets there' },
    ride(px(23) + 8, px(25) + 6, px(9), 10, 'on the bump below the cliff: up, and on'),
    { hold: 'R', jump: 9, until: and(ground, X(27.6)), max: 300, note: 'hop the termite mound' },
  ];
  lengthen('RNC-04', 0, []);
  S['RNC-05'] = [
    ...wear(px(5) + 8, 'shikari', 'the hunter’s mask: the tiger runs'),
    ...wear(px(17) + 8, 'mayur', 'past where the tiger was, the peacock’s mask'),
    { policy: peacockLift(px(25), px(9)), until: and(ground, (w) => w.player.y + w.player.h <= px(9) + 1), max: 1500, note: 'on to his wing, up with his leap, off on to the palace' },
  ];
  lengthen('RNC-05', 0, []);
  S['RNC-06'] = [kilnRun(8, 'through the first elephant while it’s hollow'), kilnRun(19, 'and the second')];
  lengthen('RNC-06', 0, []);
  S['RNC-07'] = [
    { policy: railHop(), until: and(ground, (w) => w.player.y + w.player.h === FLOOR_PX), max: 900, note: 'up on the railing, a step off into the water, and hands off' },
    { policy: walkHop(), until: and(ground, X(29)), max: 900 },
  ];
  lengthen('RNC-07', 0, []);
  S['RNC-08'] = [
    { hold: 'R', until: X(6.5), max: 300 },
    { hold: '', until: (w) => (w.flags.strikes ?? 0) >= 1, max: 900, note: 'wait for the strike over the falls' },
    { hold: 'R', until: and(ground, X(18)), max: 900, note: 'then off into the water at once, and out from under the cloud' },
    { hold: 'R', until: and(ground, X(29)), max: 600 },
  ];
  lengthen('RNC-08', 0, []);
}

/** the obvious play, and what it dies of */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'RNC-02': { steps: [{ hold: 'R', until: X(29), max: 600 }], cause: 'tel' },
  'RNC-03': { steps: [{ hold: 'R', until: X(22.5), max: 600 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'teer' },
  'RNC-04': { steps: [{ hold: 'R', until: X(5), max: 600 }, ...Array.from({ length: 60 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'bijli' },
  'RNC-05': { steps: [{ hold: 'R', until: X(29), max: 900 }], cause: 'baagh' },
  'RNC-06': { steps: [{ hold: 'R', until: X(29), max: 900 }], cause: 'mom' },
  'RNC-07': { steps: [{ hold: 'R', until: X(5), max: 600 }, ...Array.from({ length: 20 }, (): Step => ({ hold: 'R', jump: 20, ticks: 26 }))], cause: 'pathar' },
  'RNC-08': { steps: [{ hold: 'R', until: X(29), max: 900 }], cause: 'bijli' },
};

// ------------------------------------------------------------------ acts
const actRoutes: Record<string, (x: number) => Step[]> = {
  'rnc08-ghagh': (x) => [
    ...wear(px(x + 2) + 8, 'mayur', 'the peacock mask'),
    { policy: peacockFlight(px(x + 8) + 20), until: and(ground, (w) => w.player.x >= px(x + 22) && w.player.y + w.player.h === px(6)), max: 2400, note: 'on the wing, the tiger mask, and a flight over the river on to the high rock' },
    { hold: 'R', until: and(ground, (w) => w.player.x >= px(x + 28) && w.player.y + w.player.h === FLOOR_PX), max: 900, note: 'off the end, into the falls' },
    { hold: 'R', until: and(ground, X(x + 35)), max: 600 },
  ],
  'rnc07-chattan': (x) => [
    { policy: walkHop(), until: and(ground, (w) => w.player.cx > px(x + 25.2) && w.player.y + w.player.h === px(12)), max: 1800, note: 'up the rocks, walk (don’t jump) off the high one, run off the tallest on to the little rock' },
    { hold: 'R', jump: 20, until: and(ground, (w) => w.player.y + w.player.h === px(9)), max: 300, long: true, note: 'over the crack on to the next rock' },
    { policy: walkHop(), until: and(ground, (w) => w.player.y + w.player.h === FLOOR_PX && w.player.x > px(x + 35)), max: 1200, note: 'up, and off the last one into the water' },
    { hold: 'R', until: and(ground, X(x + 37)), max: 600 },
  ],
  'rnc06-ghariya': (x) => [
    { policy: pourClimb(0, px(11)), until: and(ground, (w) => w.player.y + w.player.h <= px(11) + 1), max: 1800, note: 'tip the first crucible, climb the elephant it makes' },
    { policy: pourClimb(1, px(8)), until: and(ground, (w) => w.player.y + w.player.h <= px(8) + 1), max: 1800, note: 'and the second' },
    { hold: 'R', until: and(ground, X(x + 34.5)), max: 600 },
  ],
  'rnc05-kharkai': (x) => [
    ...wear(px(x + 1) + 8, 'shikari', 'the hunter: the tiger runs (for now)'),
    ...wear(px(x + 16) + 8, 'mayur', 'the peacock mask'),
    { policy: peacockFlight(px(x + 21) + 20), until: and(ground, (w) => w.player.x >= px(x + 34) && w.player.y + w.player.h >= px(15) - 1), max: 2400, note: 'on the wing, the tiger mask, and a flight over the Kharkai' },
    { hold: 'R', until: X(x + 39), max: 600 },
  ],
  'rnc04-seedhi': (x) => [
    { policy: climbStairs(), until: and(ground, (w) => w.player.y + w.player.h <= px(8) + 1), max: 3000, note: 'up the rugra, one step behind the lightning' },
    { hold: 'R', until: and(ground, X(x + 31)), max: 600 },
  ],
  'rnc03-maidan': (x) => [arrowRun(x + 14.5, 'a step, a second step, and over the post'), arrowRun(x + 43.5, 'four archers, one height at a time'), { hold: 'R', until: and(ground, X(x + 49)), max: 600 }],
  'rnc02-galli': (x) => [kadhaiRun(x + 18.6, 'the cook who works out of order'), kadhaiRun(x + 43.6, 'the long, quick one'), { hold: 'R', until: and(ground, X(x + 47)), max: 600 }],
};

// ------------------------------------------------------------------ doors
const endingPolicies: Record<string, Policy> = {
  dwar(w, m, d) {
    const k = w.flags.dwar as { m: CastMould; k: Crucible };
    const p = w.player;
    if (m.hold > 0) return { move: '', jump: true };
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1) || 'R');
    const hx = k.k.handle.x + k.k.handle.w / 2;
    if (k.k.state === 'full') {
      if (p.onGround && Math.abs(p.cx - hx) <= 1 && Math.abs(p.vx) < 5) {
        m.hold = 8;
        return { move: '', jump: true };
      }
      return go(toward(w, hx, 1));
    }
    return go(toward(w, hx - 20, 2));
  },
  khoh(w, m, d) {
    const k = w.flags.khoh as { stepX: number; lip: number; floor: number };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    const t = w.flags.twist;
    if (t === 'khoh') return go(toward(w, d.x + 8, 1) || 'L');
    if (t === 'water') return go(p.y > px(6) ? 'L' : '');
    if (t === 'top' || (p.onGround && p.y + p.h <= px(4))) return go('R');
    // up the steps, a hop at a time
    if (p.onGround && p.cx > k.stepX - 16) {
      m.hold = 8;
      return { move: 'R', jump: true };
    }
    return go('R');
  },
  kataar(w, _m, d) {
    const k = w.flags.kataar as { row: ElephantRow; gap: number };
    const p = w.player;
    if (w.flags.twist === 'open') return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : '');
    if (!p.onGround) return go('');
    return go(toward(w, k.gap, 1));
  },
  chehra(w, m, d) {
    const k = w.flags.chehra as { tiger: ChhauDancer; edge: number; stand: number };
    const p = w.player;
    if (m.hold > 0) return { move: '', jump: true };
    if (w.flags.twist === 'open') return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : '');
    if (!p.onGround) return go(w.flags.mask === 'mayur' && p.cx > k.edge - 30 ? toward(w, k.tiger.x, 1) : 'R');
    if (w.flags.mask !== 'mayur') {
      const up = p.y + p.h <= FLOOR_PX - 79;
      if (up && Math.abs(p.cx - k.stand) <= 1) {
        m.hold = 6;
        return { move: '', jump: true };
      }
      if (up) return go(toward(w, k.stand, 1));
      // up the steps
      if (w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
        m.hold = 8;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    return go('R');
  },
  tadit(w, m) {
    const k = w.flags.tadit as { st: Storm; pole: Tadit; be: Rugra };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (w.flags.twist === 'up') return go('R');
    if (!p.onGround) return go('R');
    if (k.be.up && p.isRiding(k.be.solid)) {
      if (k.be.state === 'up') {
        m.hold = 10;
        return { move: 'R', jump: true };
      }
      return go('');
    }
    // never beside the pole when it strikes
    if (p.cx < k.pole.x + 24 && k.st.next(w) < 80 && p.cx > k.pole.x - 40) return go(p.cx < k.pole.x ? 'L' : 'R');
    if (p.cx < k.pole.x - 40 && k.st.next(w) < 80) return go('');
    return go(toward(w, k.be.x, 1));
  },
  nishana(w) {
    const k = w.flags.nishana as { r: Range; wait: number };
    if (w.flags.twist === 'open') return go('R');
    return go(toward(w, k.wait, 2));
  },
  ulta(w, m) {
    const k = w.flags.ulta as { cook: Cook; d: Dhuska; edge: number };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (w.flags.twist === 'up') return go('R');
    if (riding(w, k.d)) return go(toward(w, k.d.x, 1));
    if (!p.onGround) return go(w.flags.flipped ? '' : toward(w, k.d.x, 2));
    if (p.cx < k.edge - 10) return go('R');
    if (k.d.state === 'pale' && untilAct(w, k.cook, 0, 'flip') > 60) {
      m.hold = 10;
      return { move: 'R', jump: true };
    }
    return go(toward(w, k.edge - 8, 2));
  },
};

export const test: CityTests = {
  solutions,
  naive,
  actRoutes,
  endingPolicies,
  fair: ['RNC-02', 'RNC-03', 'RNC-04', 'RNC-05', 'RNC-06', 'RNC-07', 'RNC-08'],
};
