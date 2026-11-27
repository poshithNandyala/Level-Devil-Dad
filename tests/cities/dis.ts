// Proven routes for Dispur: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
// tests/modules.test.ts fails until every table is filled. Scaffolded by scripts/dev/new-city.mjs.
import type { World } from '../../src/game/world';
import { Door as DoorE, type Door } from '../../src/game/entities/basics';
import { Step, X, XL, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVELS } from '../../src/game/levels';
import { Carrier, SandField } from '../../src/game/cities/dis/entities';
import { Plucker, Sprinkler } from '../../src/game/cities/dis/pluck';
import type { Pan } from '../../src/game/cities/dis/pitha';
import type { Bank } from '../../src/game/cities/dis/bank';
import type { Gate, Husori } from '../../src/game/cities/dis/husori';
import type { Charge } from '../../src/game/cities/dis/gorh';
import type { DholPlanks } from '../../src/game/cities/dis/dhol';
import type { Bordoisila } from '../../src/game/cities/dis/storm';
import type { TugRope } from '../../src/game/cities/dis/tug';
import type { TimeCard } from '../../src/game/cities/dis/card';
import type { Stair } from '../../src/game/cities/dis/stair';
import type { Trap, Wake } from '../../src/game/cities/dis/majuli';
import type { Bull } from '../../src/game/cities/dis/goru';
import type { Sluice } from '../../src/game/cities/dis/sluice';
import type { Tekeli } from '../../src/game/cities/dis/tekeli';
import type { RopeWalk } from '../../src/game/cities/dis/rope';

type Out = { move: 'L' | 'R' | ''; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
const done = (w: World) => w.state !== 'play';
const px = (t: number) => t * 16;
const FLOOR_PX = 240;
const go = (move: Out['move']): Out => ({ move, jump: false });
void go;
const toward = (w: World, x: number, slack = 2): Out['move'] => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
void toward; void px; void FLOOR_PX;

// ------------------------------------------------------------------ DIS-01: the tea boy
const hop = (at: number, note: string, ticks = 12): Step[] => [{ hold: 'R', until: X(at), max: 900 }, { hold: 'R', jump: ticks, ticks, note }, { hold: 'R', until: ground, max: 300 }];
/** the tour's pieces up to the promenade (bollards, ditch, ghat steps, a parked cart) */
const tourStart = (): Step[] => [
  ...hop(10 - 1.4, 'a post'),
  ...hop(13 - 1.4, 'a post'),
  ...hop(16 - 1.4, 'a post'),
  ...hop(24 - 1.6, 'a shallow ditch'),
  ...hop(34 - 1.3, 'a step up'),
  ...hop(36 - 1.3, 'a step up'),
  { hold: 'R', until: X(54 - 2.2), max: 900 },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked ride' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
];
const boy = (w: World) => w.entities.find((e) => e instanceof Carrier) as Carrier;
/** to the promenade well back from the bench, wait till he sets his tray down there to pour, and walk past him */
const benchWait = (): Step[] => [
  { hold: 'R', until: X(76), max: 700, note: 'well back from the bench' },
  { hold: '', until: (w) => boy(w).pouring, max: 1500, note: 'wait till he sets his tray down at the bench' },
  { hold: 'R', until: X(84), max: 300, note: 'past him while he pours' },
];
// ------------------------------------------------------------------ DIS-02: the sandbars
const fields = (w: World) => (w.flags.sand ?? []) as SandField[];
/** bar i of field f is grown to at least `tiles` wide */
const barUp = (f: number, i: number, tiles = 3) => (w: World) => fields(w)[f].bars[i].slab.solid.w >= px(tiles);
const barGone = (f: number, i: number) => (w: World) => fields(w)[f].bars[i].slab.solid.w === 0;
const standing = (w: World, f: number, i: number) => w.standing(fields(w)[f].bars[i].slab.solid);
void barGone; void standing;
// ------------------------------------------------------------------ DIS-03: the pluckers
const pluckers = (w: World) => (w.flags.pluckers ?? []) as Plucker[];
const sprinklers = (w: World) => (w.flags.sprinklers ?? []) as Sprinkler[];
/** follow plucker k at a distance (px), hopping each hedge once it is a step; hold still while the wet path is ahead */
function follow(k: number, gap = 58, wetK = -1): (w: World) => { move: 'L' | 'R' | ''; jump: boolean } {
  let W: World | null = null;
  let hold = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      hold = 0;
    }
    const p = w.player;
    const pl = k >= 0 ? pluckers(w)[k] : pluckers(w).filter((q) => q.endX > p.cx).sort((a, b) => a.endX - b.endX)[0];
    if (hold > 0) {
      hold--;
      return { move: 'R', jump: true };
    }
    if (!pl || pl.phase === 'end') return { move: 'R', jump: false };
    if (wetK >= 0) {
      const s = sprinklers(w)[wetK];
      if (s && p.cx > s.x0 - 26 && p.cx < s.x1 && s.slippery && p.cx < s.x0 + 2) return { move: '', jump: false };
    }
    if (pl.x - p.cx < gap) return { move: '', jump: false };
    if (p.onGround && w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
      const hd = pl.hedges.find((h) => p.cx < h.x0 && h.x0 - p.cx < 16);
      if (hd && hd.h <= 16) {
        hold = 7;
        return { move: 'R', jump: true };
      }
      return { move: '', jump: false };
    }
    return { move: 'R', jump: false };
  };
}
// ------------------------------------------------------------------ DIS-04: the pan
const pans = (w: World) => (w.flags.pans ?? []) as Pan[];
/** across pan k, crepe by crepe: hop to the next one once it is poured and shiny, with time to spare */
function crossPan(k: number, margin = 90, first = 0): (w: World) => { move: 'L' | 'R' | ''; jump: boolean } {
  let W: World | null = null;
  let hold = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      hold = 0;
    }
    const p = w.player;
    const pan = k >= 0 ? pans(w)[k] : pans(w).filter((q) => q.x1 > p.cx - 2).sort((a, b) => a.x0 - b.x0)[0];
    if (!pan) return { move: 'R', jump: false };
    if (hold > 0) {
      hold--;
      return { move: 'R', jump: true };
    }
    if (!p.onGround) return { move: 'R', jump: false };
    const i = pan.slabs.findIndex((s) => s.solid.x > p.cx);
    const curS = pan.slabs.find((s) => s.solid.collidable && p.cx >= s.solid.x && p.cx <= s.solid.x + s.solid.w);
    const edge = curS ? curS.solid.x + curS.solid.w : pan.x0;
    if (i < 0) {
      if (curS && edge - p.cx > 8) return { move: 'R', jump: false };
      if (curS) {
        hold = 13;
        return { move: 'R', jump: true };
      }
      return { move: 'R', jump: false };
    }
    if (pan.started < 0) return { move: 'R', jump: false };
    const st = pan.stateOf(w, i);
    const ready = st.s === 'liquid' && st.left > (curS ? margin : Math.max(margin, first));
    if (!ready) return { move: '', jump: false };
    if (edge - p.cx > 9) return { move: 'R', jump: false };
    hold = 13;
    return { move: 'R', jump: true };
  };
}
// ------------------------------------------------------------------ DIS-05: the gamosas
const gamN = (w: World) => ((w.flags.gam ?? { n: 0 }) as { n: number }).n;
/** G G G, up on the platform to the taker, over the pit: from column x */
const gamosaSet = (x: number, pit = 18): Step[] => [
  { hold: 'R', until: X(x + 10.2), max: 900, note: 'let the three hosts put their gamosas on' },
  { hold: 'R', jump: 10, ticks: 10, note: 'up on the platform' },
  { hold: 'R', until: and(ground, (w) => w.player.y < 215), max: 200 },
  { hold: 'R', until: (w) => gamN(w) === 2, max: 200, note: 'walk into the host in the red sash' },
  { hold: 'R', until: and(ground, (w) => w.player.y > 220 && w.player.x > px(x + 15.2)), max: 400, note: 'down again' },
  ...hopR(x + pit - 1.8, 'over the pit', 14),
];
// ------------------------------------------------------------------ DIS-06: the bank
const banks = (w: World) => (w.flags.banks ?? []) as Bank[];
// ------------------------------------------------------------------ DIS-07: the carollers
const groups = (w: World) => (w.flags.husori ?? []) as Husori[];
const gatesOf = (w: World) => (w.flags.gates ?? []) as Gate[];
/** wait in front of each gate (never touching its stakes) until the group has come and the gate is open, then through */
function atTheGate(k: number): (w: World) => { move: 'L' | 'R' | ''; jump: boolean } {
  return (w) => {
    const h = groups(w)[k];
    const p = w.player;
    const g = gatesOf(w)
      .filter((gt) => (k < 0 || gt.group === h) && gt.gx + 14 > p.cx)
      .sort((a, b) => a.gx - b.gx)[0];
    if (!g) return { move: 'R', jump: false };
    if (g.open) return { move: 'R', jump: false };
    if (p.cx < g.gx - 26) return { move: 'R', jump: false };
    return { move: '', jump: false };
  };
}
// ------------------------------------------------------------------ DIS-08: the rhino
const charges = (w: World) => (w.flags.charges ?? []) as Charge[];
const chargeGone = (i: number) => (w: World) => charges(w)[i]?.phase === 'gone';
// ------------------------------------------------------------------ DIS-09: the roof
/** the first-timer: run, and hop each rib with a little hop the moment you bump into it */
function ribHop(ticks: number): (w: World) => { move: 'L' | 'R' | ''; jump: boolean } {
  let W: World | null = null;
  let hold = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      hold = 0;
    }
    const p = w.player;
    if (hold > 0) {
      hold--;
      return { move: 'R', jump: true };
    }
    if (p.onGround && w.solidAt(p.x + p.w + 1, p.y + 2, 1, p.h - 4)) {
      hold = ticks;
      return { move: 'R', jump: true };
    }
    return { move: 'R', jump: false };
  };
}
/** stop on the pad (its left end), a run along it, and one long leap over the rib and the oil */
const roofLeap = (padX: number, note: string): Step[] => [
  { hold: '', until: ground, max: 200 },
  { hold: 'L', until: (w) => w.player.x <= px(padX) + 1, max: 60 },
  { hold: '', ticks: 10 },
  { hold: 'R', until: X(padX + 1.3), max: 200, note: 'a run along the pad' },
  { hold: 'R', jump: 40, ticks: 40, long: true, note },
  { hold: 'R', until: ground, max: 300 },
];
const carriers = (w: World) => (w.flags.carriers ?? []) as Carrier[];
const tourEnd = (): Step[] => [
  ...hop(94 - 1.6, 'up on the deck'),
  { hold: 'R', until: X(98.4), max: 300, note: 'along the deck: the second boy sets off' },
  { hold: '', until: (w) => carriers(w)[0].stopped, max: 1500, note: 'stay up on the deck till he has set his tray down' },
  { hold: 'R', until: done, max: 900 },
];

// ------------------------------------------------------------------ the length pass: generic plays
type Pol = (w: World) => Out;
/** a play that keeps its own jump count down, reset per world */
function withHold(f: (w: World, setHold: (n: number) => void) => Out): Pol {
  let W: World | null = null;
  let hold = 0;
  return (w) => {
    if (W !== w) {
      W = w;
      hold = 0;
    }
    if (hold > 0) {
      hold--;
      return { move: 'R', jump: true };
    }
    return f(w, (n) => (hold = n));
  };
}
const floorAhead = (w: World, dx: number) => !!w.solidAt(w.player.x + w.player.w + dx, w.player.y + w.player.h + 1, 1, 2);
/** run, and hop every gap as you reach its edge */
const edgeRun = (ticks = 12): Pol =>
  withHold((w, h) => {
    const p = w.player;
    if (p.onGround && !floorAhead(w, 3)) {
      h(ticks);
      return { move: 'R', jump: true };
    }
    return { move: 'R', jump: false };
  });
/** across a field of sandbars: on each bar wait for the next one to be up, then to the edge and over */
const crossSand = (): Pol =>
  withHold((w, h) => {
    const p = w.player;
    if (!p.onGround) return { move: 'R', jump: false };
    const bars = fields(w).flatMap((f) => f.bars.map((b) => ({ b, x0: px((b.spans.find((s) => s) as [number, number])[0]), f })));
    const next = bars.filter((o) => o.x0 > p.cx + 6).sort((a, b) => a.x0 - b.x0)[0];
    if (!next) return { move: 'R', jump: false };
    const up = next.b.slab.solid.w >= px(2.5) && next.b.slab.solid.x <= next.x0 + 8;
    const gapAt = (() => {
      for (let d = 0; d < 200; d += 2) if (!w.solidAt(p.x + p.w + d, p.y + p.h + 1, 1, 2)) return d;
      return 999;
    })();
    if (!up) return { move: '', jump: false };
    if (gapAt > 6) return { move: 'R', jump: false };
    h(next.x0 - (p.x + p.w) > 40 ? 15 : 12);
    return { move: 'R', jump: true };
  });
/** wait well back from a rhino field while anything charges, then walk its strip */
const rhinoWalk = (): Pol =>
  withHold((w, h) => {
    const p = w.player;
    const busy = charges(w).some((c) => c.phase === 'noise' || c.phase === 'charge' || c.phase === 'rest' || (c.phase === 'wait' && c.d.trig === Infinity && charges(w).some((o) => o !== c && o.phase !== 'gone' && o.phase !== 'wait')));
    if (busy && p.onGround) return { move: '', jump: false };
    if (p.onGround && !floorAhead(w, 3)) {
      const c = charges(w).find((q) => px(q.d.c0) > p.cx && px(q.d.c0) - p.cx < 40 && q.phase === 'wait');
      if (c) return { move: 'R', jump: false };
      h(12);
      return { move: 'R', jump: true };
    }
    return { move: 'R', jump: false };
  });
/** wait on the bank before a stilt house till its ladder is down, then on to the rung, up on the house and over */
const changClimb = (bankEdge: number, walkOff = false): Pol =>
  withHold((w, h) => {
    const p = w.player;
    if (!p.onGround) return { move: 'R', jump: false };
    // up on a house roof: off the far end with a long jump, over the water
    if (p.y + p.h <= 177 && p.cx > px(bankEdge)) {
      if (!floorAhead(w, 3) && !walkOff) {
        h(24);
        return { move: 'R', jump: true };
      }
      return { move: 'R', jump: false };
    }
    const k = ((w.flags.changs ?? []) as { boy: { down: boolean }; rung: { solid: any } }[]).find((o) => o.rung.solid.x + o.rung.solid.w > p.cx - 4 && o.rung.solid.x < px(bankEdge) + 80);
    if (!k) return { move: 'R', jump: false };
    const r = k.rung.solid;
    if (w.standing(r)) {
      if (p.cx < r.x + r.w / 2) return { move: 'R', jump: false };
      if (Math.abs(p.vx) > 20 && p.cx > r.x + r.w - 12) return { move: '', jump: false };
      h(18);
      return { move: 'R', jump: true };
    }
    if (p.cx < px(bankEdge) - 10) return { move: 'R', jump: false };
    if (!k.boy.down) return { move: '', jump: false };
    h(12);
    return { move: 'R', jump: true };
  });


/** S['DIS-0n'] = room route; lengthen(id, drop, extra) appends each act's route and the door's policy */
/** the length pass's acts: each one's obvious play and obvious fix, both dying inside the act */
/** across the dhol planks: on each beat hop to the plank that has just come up (never sooner than `minWait` ticks after the last hop: a player counting a tempo) */
const dholHop = (minWait = 0): NonNullable<Step['policy']> => {
  let last = -9999;
  let air = 0;
  let tgt = -1;
  let seen: World | null = null;
  return (w) => {
    if (seen !== w) {
      seen = w;
      last = -9999;
      air = 0;
      tgt = -1;
    }
    const p = w.player;
    const d = (w.flags.dhol as DholPlanks[]).find((q) => p.cx < q.planks[q.planks.length - 1].x + 80)!;
    const i = d.planks.findIndex((s) => p.cx >= s.x - 2 && p.cx <= s.x + s.w + 2 && p.onGround);
    const n = d.planks[i + 1];
    if (!p.onGround) {
      air++;
      const t = d.planks[tgt];
      const c = t ? t.x + t.w / 2 : p.cx + 40;
      return { move: p.cx < c - 3 ? 'R' : p.cx > c + 3 ? 'L' : '', jump: air < 8 };
    }
    air = 0;
    if (i < 0) {
      tgt = 0;
      return { move: 'R', jump: p.cx > d.planks[0].x - 14 && p.cx < d.planks[0].x && d.planks[0].collidable };
    }
    if (!n) return { move: 'R', jump: false };
    const up = (i + 1 + d.beat) % 2 === 0 && d.beat >= 0;
    const c = d.planks[i].x + d.planks[i].w / 2;
    if (up && n.collidable && w.tick - last >= minWait && d.started >= 0) {
      last = w.tick;
      tgt = i + 1;
      return { move: 'R', jump: true };
    }
    return { move: p.cx < c - 3 ? 'R' : p.cx > c + 3 ? 'L' : '', jump: false };
  };
};
/** a player hopping plank to plank on a counted tempo, whatever the planks do */
const dholTempo = (x: number, every: number): NonNullable<Step['policy']> => {
  let last = -1;
  return (w) => {
    const p = w.player;
    if (p.cx < px(x + 4.2)) return { move: 'R', jump: p.cx > px(x + 3.6) && p.onGround };
    if (!p.onGround) return { move: (p.cx - px(x + 4.5)) % 48 < 16 ? 'R' : '', jump: true };
    if (last < 0) last = w.tick;
    if (w.tick - last >= every) {
      last = w.tick;
      return { move: 'R', jump: true };
    }
    return { move: '', jump: false };
  };
};
const stairs = (w: World) => (w.flags.stair as Stair[]);
/** up a run of one-tile brick steps: walk right and hop only when a riser is in front, until column `top` on the ground */
const wallAhead = (w: World) => !!w.solidAt(w.player.x + w.player.w + 2, w.player.y + w.player.h - 10, 2, 6);
const hopsUp = (c0: number, n: number): Step[] => [
  { policy: withHold((w, h) => (w.player.onGround && wallAhead(w) ? (h(8), { move: 'R', jump: true }) : { move: 'R', jump: false })), until: and(ground, X(c0 + n - 0.6)), max: 900, note: 'up the brick steps' },
  { hold: '', ticks: 6 },
];
const bull = (w: World) => (w.flags.bull as Bull[])[0];
/** in the bull's lane: up on verandah A, then B, each time dropping down only once it is walking away to the left */
const bullLane = (x: number): Pol =>
  withHold((w, h) => {
    const p = w.player;
    const b = bull(w);
    const up = p.onGround && p.y + p.h <= px(14);
    // clear: it has charged past and is walking, well to the left (from A it walks back toward you, slower than you run)
    const onA0 = p.cx < px(x + 12);
    const clear = b.phase === 'walk' && b.x < p.cx - 56 && (b.dir < 0 || b.t < 30);
    void onA0;
    if (!p.onGround) return { move: 'R', jump: false };
    if (!up) {
      // on the ground: run for the next verandah (or the lane's end) and hop up on to it
      if (p.cx > px(x + 26.5)) return { move: 'R', jump: false };
      const nextV = p.cx < px(x + 8) ? x + 8 : p.cx < px(x + 17) ? x + 17 : -1;
      if (nextV > 0 && p.cx >= px(nextV) - 14) {
        h(14);
        return { move: 'R', jump: true };
      }
      return { move: 'R', jump: false };
    }
    // up on a verandah: stay at its middle until the bull has charged past and walks away
    const onA = p.cx < px(x + 12);
    if (!clear) return { move: p.cx < px(onA ? x + 9.5 : x + 18.5) ? 'R' : '', jump: false };
    // clear: go, and keep going (a late start must not leave you on the verandah)
    h(40);
    return { move: 'R', jump: false };
  });
const rope = (w: World) => (w.flags.ropewalk as RopeWalk[])[0];
const afterWhip = (w: World) => { const t = rope(w).t(w); return t >= 170 && t < 182; };
const tekeli = (w: World) => (w.flags.tekeli as Tekeli[])[0];
const shoutAt = (i: number) => (w: World) => tekeli(w).at(w)[0] >= i;
const sluice = (w: World) => (w.flags.sluice as Sluice[])[0];
const drained = (w: World) => { const t = sluice(w).t(w); return t >= 200 && t < 220; };
const wakes = (w: World) => w.flags.wakes as Wake[];
const traps = (w: World) => w.flags.traps as Trap[];
/** on to trap i (from the bank or trap i-1) */
const onTrap = (x: number, i: number): Step[] => hopR(x + (i ? 9.0 + (i - 1) * 4.5 : 5.2), 'on to the next trap', 11);
const tug = (w: World) => (w.flags.tug as TugRope[]).find((r) => w.player.cx < r.d1 + 40)!;
type Play = (x: number) => Step[];
const ACT_DEATHS: { act: string; stage: string; naive: [Play, string, string]; fix?: [Play, string, string] }[] = [];
const die = (x: number): Step[] => [{ hold: 'R', until: done, max: 6000 }];
void die;
const runHop: Play = () => [...Array.from({ length: 40 }, (): Step => ({ hold: 'R', jump: 14, ticks: 22 }))];
const sandFix = (b1: number): Play => (x) => [
  { policy: crossSand(), until: and(ground, (w) => w.player.x >= px(x + b1) && w.player.y + w.player.h === FLOOR_PX), max: 4000 },
  { hold: 'R', until: X(x + b1 + 5.2), max: 300 },
  { hold: '', until: done, max: 2000 },
];
const ghatNaive = (g0: number, g1: number): Play => (x) => [
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 250 && w.player.x > px(x + g0) && w.player.x < px(x + g1 + 1), max: 700 },
  { hold: 'R', until: (w) => w.player.x >= px(x + g1 + 1) - 12, max: 200 },
  { hold: 'R', jump: 14, ticks: 14 },
  { hold: 'R', until: done, max: 900 },
];
const ghatFix = (g0: number, g1: number): Play => (x) => [
  { hold: 'R', until: X(x + g0 - 1.6), max: 600 },
  { hold: 'R', jump: 14, ticks: 14, note: 'clear over the ghat' },
  { hold: 'R', until: ground, max: 300 },
  { hold: 'R', until: (w) => { const c = carriers(w).find((q) => q.ghat[0] === px(x + g0))!; return c.x - w.player.x < 40; }, max: 900 },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over him' },
  { hold: 'R', until: done, max: 900 },
];
const panFix: Play = (x) => [{ hold: 'R', until: X(x + 2.3), max: 600 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: done, max: 2000 }];
const bankNaive: Play = (x) => [{ hold: 'R', until: X(x + 2.7), max: 600 }, { hold: '', ticks: 260 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: done, max: 900 }];
const bankFix: Play = (x) => [{ hold: 'R', until: X(x + 2.7), max: 600 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: done, max: 2000 }];
const gateNaive: Play = () => [{ hold: 'R', until: done, max: 3000 }];
const gateFix: Play = () => [{ policy: tooEarly(), until: done, max: 12000 }];
const rhinoNaive: Play = () => [{ hold: 'R', until: done, max: 900 }];
const rhinoFix: Play = (x) => [{ hold: 'R', until: X(x + 4.2), max: 600 }, { hold: '', until: done, max: 2000 }];
const changNaive: Play = (x) => [{ hold: 'R', until: X(x + 10.4), max: 600 }, { hold: 'R', jump: 20, ticks: 20 }, { hold: 'R', until: done, max: 900 }];
const changFix = (edge: number): Play => (x) => [{ policy: changClimb(x + edge, true), until: done, max: 4000 }];
const roofNaive: Play = () => [{ policy: ribHop(7), until: done, max: 4000 }];
const roofFix: Play = () => [{ policy: ribHop(16), until: done, max: 4000 }];
const act = (a: string, stage: string, naive: [Play, string, string], fix?: [Play, string, string]) => ACT_DEATHS.push({ act: a, stage, naive, fix });
// acts with one play (see ONE_PLAY): one scripted death, walking straight on into the act's trap
const runOn: Play = () => [{ hold: 'R', until: done, max: 3000 }];
for (const [a, stage, cause] of [['dis05-atithi', 'DIS-05', 'dis-gamosa'], ['dis07-chowk', 'DIS-07', 'dis-gate']]) act(a, stage, [runOn, cause, 'walks straight on into it']);
for (const a of ['dis09-chaal']) act(a, 'DIS-09', [() => [{ policy: ribHop(7), until: done, max: 4000 }], 'dis-roof', 'stops on the oil before the rib']);
act('dis07-dhol', 'DIS-07', [() => [{ policy: () => ({ move: 'R', jump: true }), until: done, max: 3000 }], 'dis-pukhuri', 'runs and jumps across the planks'], [(x) => [{ policy: dholHop(110), until: (w) => done(w) || w.player.cx > px(x + 33), max: 6000 }, { hold: '', until: done, max: 900 }], 'dis-dhol-sink', 'keeps the first tempo after the dhol quickens']);
act('dis10-dhol', 'DIS-10', [() => [{ policy: () => ({ move: 'R', jump: true }), until: done, max: 3000 }], 'dis-pukhuri', 'runs and jumps across the planks'], [(x) => [{ policy: dholTempo(x, 84), until: done, max: 6000 }], 'dis-dhol-sink', 'hops on the quick tempo from 07 after the drummer has slowed: the next plank is not up, he comes down on his own as it sinks']);
act('dis09-tug', 'DIS-09', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-khaal', 'runs straight on over the ditch'], [(x) => [{ hold: 'R', until: X(x + 10.9), max: 600 }, { hold: '', until: (w) => tug(w).phase(w.tick).taut, max: 900, note: 'wait till it is taut' }, { hold: 'R', until: done, max: 900 }], 'dis-rope', 'goes the moment the rope is taut, whoever is winning']);
/** more scripted deaths inside an act: [act, stage, play from the act's start, cause, what] */
const ACT_MORE: [string, string, Play, string, string][] = [];
act('dis10-talatal', 'DIS-10', [(x) => [...hopsUp(x + 2, 6), { hold: 'R', until: and(ground, X(x + 14.2)), max: 400 }, { hold: '', until: done, max: 900 }], 'dis-doba', 'stops on the step before the last to wait for it, as in 04']);
act('dis07-card', 'DIS-07', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-gate', 'runs to the exit gate: it is shut before the card’s time'], [(x) => [{ hold: 'R', until: X(x + 25), max: 600 }, { hold: '', until: done, max: 1500 }], 'dis-horin', 'dawdles on the road short of the gate: a corridor']);
ACT_MORE.push(['dis07-card', 'DIS-07', (x) => [{ hold: 'R', until: X(x + 32), max: 600 }, { hold: '', until: done, max: 1500 }], 'dis-horin', 'waits at the gate for the card: the deer cross there']);
act('dis07-rope', 'DIS-07', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-pat', 'walks straight across: the middle is whipped under him'], [(x) => [{ hold: 'R', until: X(x + 7), max: 600 }, { hold: '', until: afterWhip, max: 600 }, { hold: 'R', until: X(x + 19.5), max: 300 }, { hold: '', until: done, max: 600 }], 'dis-paakoni', 'crosses the middle between strokes, then waits at the twisters’ end as at an anchor: they step back with it']);
act('dis07-pepa', 'DIS-07', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-gate', 'runs after the group that is leaving: the gate has shut behind it'], [(x) => [{ hold: 'R', until: X(x + 7.6), max: 600 }, { hold: '', until: done, max: 1500 }], 'dis-stakes', 'waits right under the gate for the coming group: the stakes come down as it arrives']);
act('dis07-tekeli', 'DIS-07', [(x) => [{ hold: 'R', until: X(x + 9), max: 600 }, { hold: '', until: done, max: 900 }], 'dis-lathi', 'stands still in the open by him: they shout his side'], [(x) => [{ hold: 'R', until: X(x + 6.2), max: 600 }, { hold: '', until: (w) => { const [i, k] = tekeli(w).at(w); return i === 0 && k >= 20; }, max: 300 }, { hold: 'R', until: done, max: 600 }], 'dis-lathi-ghur', 'runs through past him on the shout: across into the shouted side as he swings']);
act('dis09-sluice', 'DIS-09', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-sluice', 'runs straight down the channel: the bell, and the flood'], [(x) => [{ hold: 'R', until: X(x + 4.6), max: 600 }, { hold: '', until: drained, max: 900 }, { hold: 'R', until: X(x + 10.1), max: 300 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: and(ground, X(x + 12)), max: 200 }, { hold: '', until: done, max: 1500 }], 'dis-roof', 'gets up on the embankment and stays there, safe from every flood: the oil slides him back in']);
act('dis07-goru', 'DIS-07', [(x) => [{ hold: 'R', until: X(x + 6), max: 600 }, { hold: '', until: done, max: 1500 }], 'dis-goru', 'stands his ground in the lane: the bull stops, lowers its head and charges'], [(x) => [{ policy: withHold((w, h) => (w.player.onGround && wallAhead(w) ? (h(8), { move: 'R', jump: true }) : { move: 'R', jump: false })), until: and(ground, X(x + 9)), max: 900 }, { hold: '', until: (w) => bull(w).phase === 'walk' && bull(w).dir > 0 && bull(w).x < w.player.cx - 40, max: 1500 }, { hold: 'L', until: (w) => w.player.onGround && w.player.y + w.player.h >= 239, max: 200 }, { hold: 'R', until: done, max: 900 }], 'dis-goru-lane', 'drops back into the lane to get past the bull while it walks: it is in its lane, and he is trampled']);
act('dis05-sanko', 'DIS-05', [(x) => [...hopR(x + 4.2, 'over the ditch', 12), { hold: 'R', until: X(x + 11.0), max: 600 }, { hold: 'R', jump: 14, ticks: 14, note: 'jumps the remembered nala' }, { hold: 'R', until: done, max: 600 }], 'dis-beam', 'jumps the nala he remembers: the low beam'], [(x) => [...hopR(x + 4.2, 'over the ditch', 12), { hold: 'R', until: X(x + 11.0), max: 600 }, { hold: 'L', until: done, max: 600 }], 'dis-pit', 'backs off to find a host to take a gamosa: the ditch behind']);
act('dis05-feast', 'DIS-05', [(x) => [{ hold: 'R', until: X(x + 6.6), max: 600 }, { hold: '', jump: 8, ticks: 8, note: 'up for the pitha on its stand' }, { hold: '', until: done, max: 600 }], 'dis-kol-paat', 'jumps up for a pitha: the leaf tips under the landing'], [(x) => [{ hold: 'R', until: X(x + 5.2), max: 600 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 600 }], 'dis-pit', 'jumps the whole feast at a run and lands at the ditch’s lip, running on into it']);
act('dis05-machan', 'DIS-05', [(x) => [{ policy: (w) => ({ move: floorAhead(w, 3) ? 'R' : '', jump: false }), until: and(ground, X(x + 16)), max: 1500 }, { hold: '', until: done, max: 900 }], 'dis-machan', 'waits on the last plank for one more: the drum rolls'], [() => [{ hold: 'R', until: done, max: 900 }], 'dis-luit', 'runs on ahead of the carpenter: the far end is not built']);
act('dis06-wake', 'DIS-06', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-dhal', 'runs to outrun the wake'], [(x) => [{ hold: 'R', until: X(x + 6.3), max: 600 }, { hold: '', until: (w) => wakes(w)[0].running && w.player.cx - wakes(w)[0].x < 50, max: 600 }, { hold: '', jump: 14, ticks: 14, note: 'hops the wave' }, { hold: '', until: done, max: 600 }], 'dis-bank', 'waits for the wake on the undercut bank and hops it: the landing breaks the slab off']);
act('dis06-traps', 'DIS-06', [(x) => [...onTrap(x, 0), { hold: '', until: done, max: 900 }], 'dis-dirru', 'stands on the first trap as on a floor: it rings and is hoisted'], [(x) => [...onTrap(x, 0), { hold: '', until: (w) => traps(w)[0].state(w) === 'ring', max: 900 }, ...onTrap(x, 1), { hold: '', until: done, max: 600 }], 'dis-tip', 'hops on at the ring to the next trap: it is still slack and tips']);
act('dis07-bordoisila', 'DIS-07', [(x) => [{ hold: 'R', until: X(x + 8.6), max: 600 }, { hold: '', until: done, max: 1500 }], 'dis-hail', 'shelters under the granary’s roof: the hail drives in on the wind'], [(x) => [{ hold: 'R', until: X(x + 14), max: 600 }, { hold: '', until: done, max: 900 }], 'dis-bordoisila', 'runs on past the granary to get away from it: the wind takes him into the pond']);
act('dis10-tug', 'DIS-10', [() => [{ hold: 'R', until: done, max: 1500 }], 'dis-khaal', 'runs straight on over the ditch'], [(x) => [{ hold: 'R', until: X(x + 10.9), max: 600 }, { hold: '', until: (w) => { const p = tug(w).phase(w.tick); return p.taut && p.dir < 0 && p.t < 6; }, max: 2400 }, { hold: 'R', until: done, max: 900 }], 'dis-rope', 'goes on the red flag, as in 09: red is the near team now']);
act('dis10-bordoisila', 'DIS-10', [(x) => [...hopR(x + 11.3, 'jumps the channel before the wind', 14), { hold: 'R', until: done, max: 600 }], 'dis-bordoisila', 'jumps the channel before the wind comes'], [(x) => [{ hold: 'R', until: X(x + 6.2), max: 600 }, { hold: '', until: done, max: 900 }], 'dis-bhoral', 'shelters under the bhoral, as in 07']);
act('dis08-jeep', 'DIS-08', [rhinoNaive, 'dis-beel', 'walks into the tall grass'], [rhinoFix, 'dis-gorh', 'waits at the edge of the grass, where the second jeep is']);
act('dis08-duijeep', 'DIS-08', [(x) => [{ hold: 'R', until: X(x + 5.1), max: 600 }, { hold: '', until: done, max: 1500 }], 'dis-gorh', 'waits at the grass edge for the loud jeep’s charge: the rhino comes for the near one, at him'], [(x) => [{ hold: 'R', until: X(x + 5.8), max: 600 }, { hold: 'R', until: done, max: 900 }], 'dis-beel', 'walks into the grass toward the loud jeep’s line before any charge']);
act('dis08-bagori', 'DIS-08', [(x) => [{ hold: 'R', until: X(x + 2.4), max: 600 }, { hold: '', until: done, max: 2000 }], 'dis-gorh', 'stays on the bank: the rhino comes from behind'], [(x) => [{ hold: 'R', until: X(x + 1.4), max: 600 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: '', until: (w) => charges(w).some((c) => c.d.c0 === x + 11 && c.phase === 'rest'), max: 2000 }, { hold: 'R', until: done, max: 2000 }], 'dis-beel', 'off the hay as soon as the rhino stops halfway']);
act('dis10-gamosa', 'DIS-10', [() => [{ hold: 'R', until: done, max: 900 }], 'dis-gamosa', 'walks into every giver'], [(x) => [{ hold: 'R', until: X(x + 12.4), max: 600 }, { hold: 'R', jump: 10, ticks: 10 }, { hold: 'R', until: ground, max: 200 }, { hold: '', ticks: 40, note: 'the fourth host puts his gamosa on him' }, { hold: 'R', until: done, max: 900 }], 'dis-gamosa', 'a little hop over the third giver lands in the fourth one’s arms: three gamosas, blind at the pit']);
/** after the routes exist: each act's deaths start from the stage route up to the act's own start */
/** an ending's own policy as a step policy (for plays that follow it part of the way) */
const viaEnding = (kind: string) => {
  let W: World | null = null;
  let m: { hold: number; [k: string]: any } = { hold: 0 };
  return (w: World) => {
    if (W !== w) {
      W = w;
      m = { hold: 0 };
    }
    const d = w.entities.find((e) => e instanceof DoorE && !(e as Door).fake) as Door;
    const o = endingPolicies[kind](w, m, d);
    if (m.hold > 0) m.hold--;
    return o;
  };
};
/** the two door endings of their own: a play that dies at each, from the stage route up to the door */
function doorDeaths(S: Record<string, Step[]>) {
  const pre = (id: string) => S[id].slice(0, S[id].findIndex((s) => (s.note ?? '').startsWith('the door')));
  (mistakes['DIS-07'] ??= []).push({
    what: 'door: runs straight across the net without stopping (Kavaratti’s answer): a pull catches him on it',
    steps: [...pre('DIS-07'), { hold: 'R', until: done, max: 900 }],
    cause: 'dis-net',
  });
  (mistakes['DIS-10'] ??= []).push(
    {
      what: 'door: waits on the bank to follow the plucker, as in 03: she walks into him',
      steps: [...pre('DIS-10'), { hold: 'R', until: (w) => pluckers(w)[pluckers(w).length - 1].phase !== 'wait', max: 900 }, { hold: '', until: done, max: 900 }],
      cause: 'dis-basket',
    },
    {
      what: 'door: runs on ahead of her: the bars that far ahead are not up yet',
      steps: [...pre('DIS-10'), { hold: 'R', until: done, max: 900 }],
      cause: 'dis-luit',
    },
  );
  (mistakes['DIS-03'] ??= []).push({
    what: 'door: rides the muga cocoon and stays on it at the top: reeled in',
    steps: [...pre('DIS-03'), { policy: viaEnding('dis-muga-reel'), until: (w) => w.player.onGround && w.player.isRiding((w.flags.reel as any).solid), max: 3000 }, { hold: '', until: done, max: 1500 }],
    cause: 'dis-reel',
  });
}
function actDeaths(S: Record<string, Step[]>) {
  for (const [a, stage, f, cause, what] of ACT_MORE) {
    const route = S[stage];
    const i = route.findIndex((s) => s.note === `act:${a}`);
    const def = LEVELS.find((l) => l.id === stage)!;
    const x = def.parts!.find((p) => p.kind === a)!.x0 + (RUNUP[a] ?? 0);
    (mistakes[stage] ??= []).push({ what: `${a}: ${what}`, steps: [...route.slice(0, i), ...f(x)], cause });
  }
  for (const d of ACT_DEATHS) {
    const route = S[d.stage];
    const i = route.findIndex((s) => s.note === `act:${d.act}` || (s as { actMark?: string }).actMark === d.act);
    if (i < 0) throw new Error(`no act marker for ${d.act}`);
    const def = LEVELS.find((l) => l.id === d.stage)!;
    const x = def.parts!.find((p) => p.kind === d.act)!.x0 + (RUNUP[d.act] ?? 0);
    const pre = route.slice(0, i);
    (mistakes[d.stage] ??= []).push({ what: `${d.act}: ${d.naive[2]}`, steps: [...pre, ...d.naive[0](x)], cause: d.naive[1] });
    if (!d.fix) continue;
    // the stage's FIX play is an act's obvious fix where the room's own second play meets the same trap (ONE_PLAY)
    if (STAGE_FIX[d.act]) {
      fix[d.stage] = { steps: [...pre, ...d.fix[0](x)], cause: d.fix[1] };
      continue;
    }
    const label = ONE_PLAY[d.act] ? 'second scripted death, same trap' : 'fix';
    (mistakes[d.stage] ??= []).push({ what: `${d.act} (${label}): ${d.fix[2]}`, steps: [...pre, ...d.fix[0](x)], cause: d.fix[1] });
  }
}

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  void lengthen;
  S['DIS-01'] = [...tourStart(), ...benchWait(), ...tourEnd()];
  S['DIS-02'] = [
    { hold: 'R', until: X(6.3), max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the first bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: and(ground, barUp(0, 1)), max: 600, note: 'wait for the siren and the next bar to come up' },
    { hold: 'R', until: X(12.4), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the new bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: and(ground, barUp(0, 2)), max: 600, note: 'wait for the siren and the bar after it' },
    { hold: 'R', until: X(17.3), max: 200, note: 'across to the left end of the narrowing bar' },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the last bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(24), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the far bank' },
    { hold: 'R', until: and(ground, X(28.4)), max: 300 },
  ];
  lengthen('DIS-02', 0, []);
  S['DIS-03'] = [{ policy: follow(0), until: and(ground, X(31.4)), max: 4000, note: 'a few steps behind the plucker, up each hedge once it is picked' }];
  lengthen('DIS-03', 0, []);
  S['DIS-04'] = [
    ...hopsUp(1, 5),
    { hold: 'R', until: X(5.4), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up on to the landing: the stair starts to fall' },
    { hold: 'R', until: and(ground, X(17.4)), max: 400, note: 'down with the fall, on to the step before the last' },
    { hold: '', until: (w) => stairs(w)[0].solids[5].y <= px(9), max: 600, note: 'wait on it as it rises' },
    { hold: 'R', until: X(19.0), max: 100 },
    { hold: 'R', jump: 14, ticks: 14, note: 'over to the far side' },
    { hold: 'R', until: and(ground, X(28)), max: 400 },
  ];
  lengthen('DIS-04', 0, []);
  S['DIS-05'] = gamosaSet(0, 18);
  lengthen('DIS-05', 0, []);
  S['DIS-06'] = [
    { hold: 'R', until: X(10.4), max: 600, note: 'to the bank, well back from the edge' },
    { hold: '', until: (w) => banks(w)[0].slabs[1].solid.collidable, max: 900, note: 'wait for the sand step behind the first spur' },
    { hold: 'R', until: X(11.5), max: 100 },
    { hold: 'R', jump: 20, ticks: 20, long: true, note: 'over the slab and the spur on to the step' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: (w) => banks(w)[0].slabs[3].solid.collidable, max: 900, note: 'wait for the step behind the second spur' },
    { hold: 'R', until: X(17.4), max: 300 },
    { hold: 'R', jump: 20, ticks: 20, long: true, note: 'over the slab and the spur on to the step' },
    { hold: 'R', until: and(ground, X(28)), max: 600 },
  ];
  lengthen('DIS-06', 0, []);
  S['DIS-07'] = [{ policy: atTheGate(0), until: and(ground, X(28)), max: 3000, note: 'wait for the singers at the gate, inside the ring, and through with them' }];
  lengthen('DIS-07', 0, []);
  S['DIS-08'] = [
    { hold: 'R', until: X(3.2), max: 600, note: 'to the edge of the grass: the jeep starts up' },
    { hold: '', until: chargeGone(0), max: 1500, note: 'keep clear while the rhino charges at the dust and trots off' },
    { hold: 'R', until: and(ground, X(29.5)), max: 900, note: 'along the flattened strip' },
  ];
  lengthen('DIS-08', 0, []);
  S['DIS-09'] = [
    { hold: 'R', until: X(5.2), max: 1200, note: 'across the first oil to the grip pad' },
    ...roofLeap(5.2, 'over the rib and the oil, on to the next pad'),
    ...roofLeap(12.2, 'and the next'),
    ...roofLeap(19.2, 'and the last'),
    { hold: 'R', until: and(ground, X(31)), max: 900 },
  ];
  lengthen('DIS-09', 0, []);
  S['DIS-10'] = [
    { hold: 'R', until: X(6.3), max: 400 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the first bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: and(ground, barUp(0, 1)), max: 600, note: 'wait for the siren and the next bar to come up' },
    { hold: 'R', until: X(12.4), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the new bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: and(ground, barUp(0, 2)), max: 600, note: 'wait for the siren and the bar after it' },
    { hold: 'R', until: X(17.3), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the last bar' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(24), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the far bank' },
    { hold: 'R', until: and(ground, X(28.4)), max: 300 },
  ];
  lengthen('DIS-10', 0, []);
  actDeaths(S);
  doorDeaths(S);
}

/** the obvious play per stage, and the cause it must die of (every stage, 01-10). */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  // hop each rib as you reach it, never stopping on the pads: you land on the oil, and the ball finds you
  'DIS-09': { steps: [{ policy: ribHop(7), until: done, max: 3000 }], cause: 'dis-roof' },
  // the sandbars again: run on, the next one is not there yet
  'DIS-10': { steps: [{ hold: 'R', until: X(6.3), max: 400 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 14, ticks: 22 }))], cause: 'dis-luit' },
  // straight into the tall grass
  'DIS-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'dis-beel' },
  // run at the gate: the stakes
  'DIS-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'dis-gate' },
  // stop at the edge to have a look: by the time you jump, the near slab has gone
  'DIS-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'dis-porcupine' },
  // straight through every host, under the platform: three gamosas, and the pit is under the cloth
  'DIS-05': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'dis-gamosa' },
  // run at it: the next crepe isn't poured yet
  'DIS-04': { steps: [...hopsUp(1, 5), { hold: 'R', until: X(5.4), max: 300 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: done, max: 900 }], cause: 'dis-talatal' },
  // run at the plucker and the hedge
  'DIS-03': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'dis-basket' },
  // run and jump from bar to bar: the next one isn't there yet
  'DIS-02': { steps: [{ hold: 'R', until: X(6.3), max: 400 }, ...Array.from({ length: 30 }, (): Step => ({ hold: 'R', jump: 14, ticks: 22 }))], cause: 'dis-luit' },
  // down into the ghat and straight out again, then run at him
  'DIS-01': { steps: [...tourStart(), { hold: 'R', until: done, max: 1500 }], cause: 'dis-spill' },
};

/** the obvious correction after the first death, which dies too (at least 5 of 10). */
const dis02Start: Step[] = [
  { hold: 'R', until: X(6.3), max: 400 },
  { hold: 'R', jump: 14, ticks: 14, note: 'on to the first bar' },
  { hold: 'R', until: ground, max: 200 },
  { hold: '', until: and(ground, barUp(0, 1)), max: 600, note: 'wait for the siren and the next bar to come up' },
  { hold: 'R', until: X(12.4), max: 200 },
  { hold: 'R', jump: 14, ticks: 14, note: 'on to the new bar' },
  { hold: 'R', until: ground, max: 200 },
];
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  // after the oil, keep off the roof: up the pavilion's side on to the eave. It is the gutter, and its ball comes down it
  'DIS-09': {
    steps: [
      { hold: 'R', until: X(1.4), max: 200 },
      { hold: 'R', jump: 20, ticks: 20, long: true, note: 'up the pavilion’s side' },
      { hold: '', until: and(ground, (w) => w.player.y + w.player.h === px(12)), max: 200 },
      { hold: 'R', jump: 22, ticks: 22, long: true, note: 'on to the eave' },
      { hold: 'R', until: done, max: 900 },
    ],
    cause: 'dis-gutter',
  },
  // wait right at the edge of the grass for the strip: the rhino stops at the dust, which is right there
  'DIS-08': { steps: [{ hold: 'R', until: X(7.2), max: 600 }, { hold: '', until: done, max: 1500 }], cause: 'dis-gorh' },
  // go at once, but stop on the first slab to think: it is gone beneath you
  // wait for the silt on the near slab (in front of the spur): the river takes it
  'DIS-06': { steps: [{ hold: 'R', until: X(13.6), max: 600 }, { hold: '', until: done, max: 900 }], cause: 'dis-bank' },
  // wait on the first shiny crepe and stay: it dulls, sets, and is rolled with you in it
  // the careful play: wait on the landing for the stair to finish falling; the landing goes too
  'DIS-04': { steps: [...hopsUp(1, 5), { hold: 'R', until: X(5.4), max: 300 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: '', until: done, max: 900 }], cause: 'dis-doba' },
  // hop over her to get ahead: pinned against the hedge when she picks
  'DIS-03': { steps: [{ hold: 'R', until: (w) => pluckers(w)[0].phase !== 'wait' && pluckers(w)[0].x - w.player.cx < 30, max: 900 }, { hold: 'R', jump: 20, ticks: 20, note: 'over her' }, { hold: 'R', until: done, max: 1500 }], cause: 'dis-basket' },
  // the obvious correction: wait on every bar for the next one. The narrowing bar goes out from under the right end
  'DIS-02': { steps: [...dis02Start, { hold: 'R', until: X(19.0), max: 200 }, { hold: '', until: done, max: 1500 }], cause: 'dis-luit' },
  // hop clean over him instead: the tray tips on to where you land
  'DIS-01': { steps: [...tourStart(), { hold: 'R', until: (w) => w.player.x >= px(66), max: 600 }, { hold: 'R', until: (w) => boy(w).x - w.player.x < 38, max: 900 }, { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over him' }, { hold: 'R', until: done, max: 900 }], cause: 'dis-pool' },
};

/** more scripted first-timer deaths and 'like last time' moves. */
/** with the singers through every gate, but at the gamosa gate walk on as soon as they stop: the gate is still shut */
function tooEarly(): (w: World) => { move: 'L' | 'R' | ''; jump: boolean } {
  return (w) => {
    const p = w.player;
    const g = gatesOf(w).find((gt) => gt.gx + 14 > p.cx);
    if (!g) return { move: 'R', jump: false };
    if (g.open || (g.def.ritual > 0 && g.group.at === g.idx)) return { move: 'R', jump: false };
    if (p.cx < g.gx - 26) return { move: 'R', jump: false };
    return { move: '', jump: false };
  };
}
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'DIS-01': [
    {
      what: 'steps off the deck as the second boy comes: his tray',
      steps: [...tourStart(), ...benchWait(), ...hop(94 - 1.6, 'up on the deck'), { hold: 'R', until: done, max: 900 }],
      cause: 'dis-spill',
    },
    {
      what: 'goes past him before he has stopped at the bench: his tray swings out in front of him',
      steps: [...tourStart(), { hold: 'R', until: X(76), max: 700 }, { hold: '', until: (w) => boy(w).x < px(83), max: 1500 }, { hold: 'R', until: done, max: 900 }],
      cause: 'dis-spill',
    },
    {
      what: 'waits on where he stood to watch him pour: he picks the tray up and walks on into him',
      steps: [...tourStart(), { hold: 'R', until: X(76), max: 700 }, { hold: '', until: done, max: 2400 }],
      cause: 'dis-spill',
    },
  ],

  'DIS-03': [
    { what: 'follows her too close on the wet path and slides into her basket', steps: [{ policy: follow(0), until: and(ground, X(31.4)), max: 4000 }, { policy: follow(1, 34), until: done, max: 4000 }], cause: 'dis-basket' },
  ],
  'DIS-02': [
    { what: 'waits on the first bar for ever: it sinks once the next one is up', steps: [{ hold: 'R', until: X(6.3), max: 400 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: ground, max: 200 }, { hold: '', until: done, max: 1500 }], cause: 'dis-luit' },
  ],
};
/** Rooms and acts with only one play: their one trap is the whole room, so the second wrong move meets the same trap.
 *  It stays as a scripted death and is not counted as a FIX. */
export const ONE_PLAY: Record<string, string> = {
  'DIS-02': 'the sandbars have one hazard, the river under a bar that is not there: every wrong move is a wrong bar',
  'DIS-03': 'the tea row has one hazard, the plucker’s basket: too close, too early or over her all meet it',
  'dis05-atithi': 'the guest-house givers have one trap, three gamosas over your feet at the pit',
  'dis07-chowk': 'the chowk gates have one trap, the stakes: early, late and out of the ring all meet them',
  'dis09-chaal': 'the roof has one trap, the ball down the oil: every stop off a grip pad meets it',
  'dis10-talatal': 'the falling stair has one trap, the vault under it: any stop on a step meets the fall',
  'dis10-gamosa': 'the callback has one trap, the blinding gamosa at the pit: walking into the givers and taking the fourth one both blind you',
};
/** acts whose obvious fix is the stage's FIX play (a different trap from the stage's NAIVE) */
const STAGE_FIX: Record<string, true> = { 'dis07-bordoisila': true, 'dis10-tug': true };
for (const id of ['DIS-02', 'DIS-03']) {
  (mistakes[id] ??= []).push({ what: `second scripted death, same trap (one play: ${ONE_PLAY[id]})`, ...fix[id] });
  delete fix[id];
}

/** a route for each act, by act id ('dis02-...'). */
/** an act route that marks where it starts, so the act's own death plays can start from there */
const mark = (id: string, f: (x: number) => Step[]) => (x: number): Step[] => [{ hold: 'R', ticks: 1, note: `act:${id}` }, ...f(x)];
const hopR0 = 0;
void hopR0;
const hopR = (at: number, note: string, ticks = 14): Step[] => [{ hold: 'R', until: X(at), max: 900 }, { hold: 'R', jump: ticks, ticks, note }, { hold: 'R', until: ground, max: 300 }];
/** down into a ghat at columns g0..g1, the tea boy over your head and a few steps on, out the far side */
const ghatWait = (g0: number, g1: number): Step[] => [
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 250 && w.player.x > px(g0) && w.player.x < px(g1 + 1), max: 700, note: 'down into the ghat' },
  { hold: '', until: (w) => { const c = carriers(w).find((q) => q.ghat[0] === px(g0))!; return c.x < px(g0) - 6 || c.stopped; }, max: 2000, note: 'let him walk over and a few steps on' },
  { hold: 'R', until: (w) => w.player.x >= px(g1 + 1) - 12, max: 200 },
  { hold: 'R', jump: 14, ticks: 14, note: 'climb out of the ghat' },
  { hold: 'R', until: ground, max: 200 },
];
const changsOf = (w: World) => (w.flags.changs ?? []) as { boy: { down: boolean }; rung: { solid: any } }[];
const actRoutes: Record<string, (x: number) => Step[]> = {
  'dis05-char': mark('dis05-char', (x) => [{ policy: crossSand(), until: and(ground, X(x + 41)), max: 4000, note: 'givers, the taker on the bar, the bars at the siren' }]),
  'dis05-husori': mark('dis05-husori', (x) => [
    { policy: atTheGate(-1), until: and(ground, X(x + 50.4)), max: 6000, note: 'with the singers through both gates' },
    { hold: 'R', jump: 10, ticks: 10, note: 'hop the second giver' },
    { hold: 'R', until: ground, max: 200 },
    ...hopR(x + 54.4, 'over the pit', 12),
    { hold: 'R', until: and(ground, X(x + 65)), max: 600 },
  ]),
  'dis05-ghat': mark('dis05-ghat', (x) => [...ghatWait(x + 10, x + 14), ...hopR(x + 24.4, 'over the pit', 12), { hold: 'R', until: and(ground, X(x + 33)), max: 600 }]),
  'dis06-chang': mark('dis06-chang', (x) => [{ policy: changClimb(x + 11), until: and(ground, X(x + 32)), max: 4000, note: 'wait for the ladder, up and over the house' }]),
  'dis06-char': mark('dis06-char', (x) => [
    { hold: 'R', until: X(x + 2.7), max: 600 },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the bank slabs' },
    { hold: 'R', until: ground, max: 200 },
    { policy: edgeRun(12), until: and(ground, X(x + 13.4)), max: 600, note: 'across the slabs on to the sandbar' },
    { policy: crossSand(), until: and(ground, X(x + 39)), max: 3000, note: 'wait for the siren and the next bar' },
  ]),
  'dis06-chang2': mark('dis06-chang2', (x) => [
    { hold: 'R', until: X(x + 1.8), max: 600 },
    { hold: '', until: (w) => changsOf(w).some((k) => k.boy.down && k.rung.solid.x > px(x)), max: 2000, note: 'wait on the bank for the ladder' },
    { policy: edgeRun(12), until: (w) => changsOf(w).some((k) => w.standing(k.rung.solid)), max: 600, note: 'run the slabs on to the ladder' },
    { policy: changClimb(x + 11), until: and(ground, X(x + 35)), max: 2000, note: 'up and over' },
  ]),
  'dis07-paar': mark('dis07-paar', (x) => [
    { hold: 'R', until: X(x + 2.7), max: 600 },
    { hold: 'R', jump: 14, ticks: 14 },
    { hold: 'R', until: ground, max: 200 },
    { policy: edgeRun(12), until: and(ground, X(x + 31)), max: 900, note: 'slab to slab without stopping' },
  ]),
  'dis07-ghat': mark('dis07-ghat', (x) => [...ghatWait(x + 10, x + 14), { hold: 'R', until: and(ground, X(x + 29)), max: 600 }]),
  'dis07-lane': mark('dis07-lane', (x) => [{ policy: atTheGate(-1), until: and(ground, X(x + 77)), max: 9000, note: 'three gates' }]),
  'dis08-jeep': mark('dis08-jeep', (x) => [{ policy: rhinoWalk(), until: and(ground, X(x + 39)), max: 4000, note: 'stand back for both charges, then the strip' }]),
  'dis08-duijeep': mark('dis08-duijeep', (x) => [
    { hold: 'R', until: X(x + 5.1), max: 600, note: 'to the grass: both jeeps start up' },
    { hold: 'L', until: XL(x + 2.4), max: 200, note: 'back off the end of the near jeep’s strip' },
    { hold: '', until: (w) => charges(w).filter((c) => c.d.c0 === x + 6).every((c) => c.phase === 'gone'), max: 1500, note: 'the rhino charges the near jeep, rests, goes' },
    { policy: rhinoWalk(), until: and(ground, X(x + 25)), max: 1500 },
  ]),
  'dis08-bagori': mark('dis08-bagori', (x) => [
    { hold: 'R', until: X(x + 1.4), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the haystack' },
    { hold: '', until: and(ground, (w) => w.player.y < 200), max: 200 },
    { hold: '', until: (w) => charges(w).filter((c) => c.d.c0 >= x + 11 && c.d.c0 <= x + 25).every((c) => c.phase === 'gone'), max: 3000, note: 'both charges go past' },
    { policy: rhinoWalk(), until: and(ground, X(x + 43)), max: 2000 },
  ]),
  'dis09-bihu': mark('dis09-bihu', (x) => [{ policy: atTheGate(-1), until: and(ground, X(x + 79)), max: 9000, note: 'with the singers through three gates' }]),
  'dis09-chaal3': mark('dis09-chaal3', (x) => [
    { hold: 'R', until: X(x + 5.2), max: 1200, note: 'across the first oil to the pad' },
    ...roofLeap(x + 5.2, 'over the rib and the oil'),
    ...roofLeap(x + 12.2, 'and the next'),
    ...roofLeap(x + 19.2, 'and the last'),
    { hold: 'R', until: and(ground, X(x + 30)), max: 900 },
  ]),
  'dis06-chapori3': mark('dis06-chapori3', (x) => [{ policy: crossSand(), until: and(ground, X(x + 39)), max: 4000, note: 'three marks' }]),
  'dis06-ghat': mark('dis06-ghat', (x) => [...ghatWait(x + 10, x + 14), { hold: 'R', until: and(ground, X(x + 29)), max: 600 }]),
  'dis06-pitha': mark('dis06-pitha', (x) => [{ policy: crossPan(-1, 60), until: and(ground, X(x + 29)), max: 4000, note: 'shiny crepes only' }]),
  'dis08-kohora': mark('dis08-kohora', (x) => [{ policy: rhinoWalk(), until: and(ground, X(x + 39)), max: 4000 }]),
  'dis10-ghat': mark('dis10-ghat', (x) => [...ghatWait(x + 10, x + 14), { hold: 'R', until: and(ground, X(x + 29)), max: 600 }]),
  'dis10-char': mark('dis10-char', (x) => [{ policy: crossSand(), until: and(ground, X(x + 39)), max: 4000, note: 'the bars, the post far away' }]),
  'dis10-chang': mark('dis10-chang', (x) => [{ policy: changClimb(x + 11), until: and(ground, X(x + 32)), max: 4000 }]),
  'dis10-gorh': mark('dis10-gorh', (x) => [{ policy: rhinoWalk(), until: and(ground, X(x + 39)), max: 4000 }]),
  'dis10-gamosa': mark('dis10-gamosa', (x) => [
    { hold: 'R', until: X(x + 12.4), max: 600, note: 'two givers' },
    { hold: 'R', jump: 24, ticks: 24, long: true, note: 'one long jump over the third and the fourth' },
    { hold: 'R', until: ground, max: 200 },
    ...hopR(x + 20.4, 'over the pit', 12),
    { hold: 'R', until: and(ground, X(x + 29)), max: 300 },
  ]),
  'dis09-chaal': (x) => [
    { hold: 'R', until: X(x + 5.2), max: 1200, note: 'across the first oil to the pad' },
    ...roofLeap(x + 5.2, 'over the rib and the oil'),
    ...roofLeap(x + 12.2, 'and the next'),
    ...roofLeap(x + 19.2, 'and the next'),
    ...roofLeap(x + 26.2, 'and the last'),
    { hold: 'R', until: and(ground, X(x + 38)), max: 900 },
  ],
  'dis10-tawa': (x) => [{ policy: crossPan(0, 60), until: and(ground, X(x + 29)), max: 4000, note: 'the pan over the water' }],
  'dis10-bagan': (x) => [{ policy: follow(0), until: and(ground, X(x + 29.4)), max: 4000, note: 'behind the plucker through the tea rows' }],
  'dis10-gate': (x) => [{ policy: atTheGate(0), until: and(ground, X(x + 39)), max: 6000, note: 'the husori gate and the host’s ritual' }],
  'dis10-bank': (x) => [
    { hold: 'R', until: X(x + 2.7), max: 600, note: 'run to the edge' },
    { hold: 'R', jump: 14, ticks: 14, note: 'over the channel' },
    { hold: 'R', until: ground, max: 200 },
    ...hopR(x + 9.4, 'to the second slab', 12),
    ...hopR(x + 14.4, 'to the third slab', 12),
    ...hopR(x + 19.4, 'off the last slab', 12),
    { hold: 'R', until: X(x + 29), max: 600 },
  ],
  'dis10-talatal': mark('dis10-talatal', (x) => [
    ...hopsUp(x + 2, 6),
    { hold: 'R', until: and(ground, X(x + 21)), max: 600, note: 'straight down and out before the fall climbs up' },
  ]),
  'dis07-card': mark('dis07-card', (x) => [
    { hold: 'R', until: X(x + 16), max: 600, note: 'take the card, through the first corridor, to the bench' },
    { hold: '', until: (w) => (w.flags.card as TimeCard[])[0].left(w) <= 200, max: 1500, note: 'sit out the card on the bench' },
    { hold: 'R', until: and(ground, X(x + 38)), max: 600, note: 'through the corridors, reaching the gate as it opens' },
  ]),
  'dis07-rope': mark('dis07-rope', (x) => [
    { hold: 'R', until: X(x + 7), max: 600, note: 'on to the rope by the post, where it is still' },
    { hold: '', until: afterWhip, max: 600, note: 'wait for a stroke to pass' },
    { hold: 'R', until: and(ground, X(x + 27)), max: 400, note: 'over the middle and off the twisters’ end at once' },
  ]),
  'dis07-pepa': mark('dis07-pepa', (x) => [{ policy: atTheGate(2), until: and(ground, X(x + 20)), max: 3000, note: 'back from the gate till the pepa arrives, then through in its ring' }]),
  'dis07-tekeli': mark('dis07-tekeli', (x) => [
    { hold: 'R', until: X(x + 9), max: 600, note: 'his left: they shout "right"' },
    { hold: '', until: shoutAt(1), max: 600, note: '"left!": over to his right' },
    { hold: 'R', until: X(x + 12.3), max: 200 },
    { hold: '', until: shoutAt(2), max: 600, note: '"right!": on past him' },
    { hold: 'R', until: and(ground, X(x + 21)), max: 400 },
  ]),
  'dis09-sluice': mark('dis09-sluice', (x) => [
    { hold: 'R', until: X(x + 4.6), max: 600, note: 'to the channel’s edge' },
    { hold: '', until: drained, max: 900, note: 'wait for the water to drain' },
    { hold: 'R', until: X(x + 10.1), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the embankment' },
    { hold: 'R', until: and(ground, X(x + 12)), max: 200 },
    { hold: '', ticks: 30 },
    { hold: '', until: drained, max: 900, note: 'the bell, the flood: wait it out up here' },
    { hold: 'R', until: and(ground, X(x + 24.5)), max: 400, note: 'down and through the gate before the next bell' },
  ]),
  'dis07-goru': mark('dis07-goru', (x) => [{ policy: bullLane(x), until: and(ground, X(x + 28)), max: 4000, note: 'verandah to verandah, out of its lane when it stops' }]),
  'dis05-sanko': mark('dis05-sanko', (x) => [
    ...hopR(x + 4.2, 'over the ditch', 12),
    { hold: 'R', until: X(x + 11.4), max: 600, note: 'through the three hosts: blind' },
    { hold: 'R', until: and(ground, X(x + 23)), max: 600, note: 'walk the bamboo over the nala, then give two away' },
  ]),
  'dis05-feast': mark('dis05-feast', (x) => [
    { hold: 'R', until: X(x + 10.1), max: 600, note: 'walk across on the leaves' },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the ditch' },
    { hold: 'R', until: and(ground, X(x + 19)), max: 400 },
  ]),
  'dis05-machan': mark('dis05-machan', (x) => [
    { policy: (w) => ({ move: floorAhead(w, 3) ? 'R' : '', jump: false }), until: and(ground, X(x + 19)), max: 1500, note: 'plank by plank, as each is laid' },
    { hold: 'R', until: and(ground, X(x + 21)), max: 300 },
  ]),
  'dis06-wake': mark('dis06-wake', (x) => [
    ...hopR(x + 8.9, 'over the spur into its lee', 12),
    { hold: '', ticks: 4 },
    { hold: '', until: (w) => wakes(w)[0].started >= 0 && !wakes(w)[0].running, max: 900, note: 'let the wake run over' },
    { hold: 'R', until: and(ground, X(x + 33)), max: 600, note: 'walk the undercut slabs, no hopping' },
  ]),
  'dis06-traps': mark('dis06-traps', (x) => [
    ...onTrap(x, 0),
    { hold: '', until: (w) => traps(w)[1].state(w) === 'rest', max: 900, note: 'wait for the next trap to be silent and settled' },
    ...onTrap(x, 1),
    { hold: '', until: (w) => traps(w)[2].state(w) === 'rest', max: 900 },
    ...onTrap(x, 2),
    { hold: 'R', until: and(ground, X(x + 22)), max: 400, note: 'off the last trap on to the bank' },
  ]),
  'dis07-dhol': mark('dis07-dhol', (x) => [{ policy: dholHop(), until: and(ground, X(x + 33)), max: 6000, note: 'one plank on every beat of the dhol' }]),
  'dis10-dhol': mark('dis10-dhol', (x) => [{ policy: dholHop(), until: and(ground, X(x + 30)), max: 6000, note: 'one plank on every beat, slow or fast' }]),
  'dis09-tug': mark('dis09-tug', (x) => [
    { hold: 'R', until: X(x + 10.9), max: 600, note: 'to the edge of the ditch' },
    { hold: '', until: (w) => { const p = tug(w).phase(w.tick); return p.taut && p.dir > 0 && p.t < 6; }, max: 2400, note: 'wait for the far team’s red flag' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 600, note: 'across on the rope at once' },
  ]),
  'dis07-bordoisila': mark('dis07-bordoisila', (x) => [
    { hold: 'R', until: X(x + 11.6), max: 600, note: 'into the bhoral’s lee, away from the wind' },
    { hold: '', until: (w) => (w.flags.storm as Bordoisila[])[0].over, max: 900, note: 'till Bordoisila has passed' },
    ...hopR(x + 16.3, 'over the pond', 14),
    { hold: 'R', until: and(ground, X(x + 24)), max: 600 },
  ]),
  'dis10-tug': mark('dis10-tug', (x) => [
    { hold: 'R', until: X(x + 10.9), max: 600, note: 'to the edge of the ditch' },
    { hold: '', until: (w) => { const p = tug(w).phase(w.tick); return p.taut && p.dir > 0 && p.t < 6; }, max: 2400, note: 'wait for the far team (green caps now) to be winning' },
    { hold: 'R', until: and(ground, X(x + 32)), max: 600, note: 'across on the rope at once' },
  ]),
  'dis10-bordoisila': mark('dis10-bordoisila', (x) => [
    { hold: 'R', until: X(x + 9.5), max: 600, note: 'past the old bhoral to the channel' },
    { hold: '', until: (w) => (w.flags.storm as Bordoisila[]).some((s) => s.gusts[0].on && w.player.cx < px(x + 20)), max: 900, note: 'wait for the wind' },
    ...hopR(x + 11.3, 'and jump the channel on it', 14),
    { hold: 'R', until: and(ground, X(x + 28)), max: 600 },
  ]),
  'dis07-chowk': (x) => [{ policy: atTheGate(1), until: and(ground, X(x + 73)), max: 7000, note: 'three gates, the middle one after the gamosas' }],
  'dis05-atithi': (x) => [
    ...gamosaSet(x, 19),
    { hold: 'R', until: X(x + 22.2), max: 300 },
    { hold: 'R', jump: 10, ticks: 10, note: 'hop over the host who is holding out a gamosa' },
    { hold: 'R', until: ground, max: 200 },
    ...hopR(x + 29.5, 'over the second pit', 14),
    ...hopR(x + 40.0, 'over the third pit', 14),
    { hold: 'R', until: and(ground, X(x + 48)), max: 400 },
  ],
  'dis04-bhogali': (x) => [{ policy: crossPan(1, 60, 280), until: and(ground, X(x + 36)), max: 4000, note: 'the far-end cook: wait for the near crepe' }],
  'dis06-chapori': (x) => [
    { hold: 'R', until: X(x + 2.7), max: 600, note: 'run to the edge' },
    { hold: 'R', jump: 14, ticks: 14, note: 'over the channel' },
    { hold: 'R', until: and(ground, X(x + 17.6)), max: 600, note: 'across the slabs and on to the rock' },
    { hold: '', ticks: 60, note: 'a breath on the rock' },
    { hold: 'R', until: X(x + 20.0), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'off the rock over the water' },
    { hold: 'R', until: ground, max: 200 },
    ...hopR(x + 26.4, 'on across', 12),
    ...hopR(x + 31.4, 'and on', 12),
    ...hopR(x + 36.4, 'and off', 12),
    { hold: 'R', until: and(ground, X(x + 45)), max: 600 },
  ],
  'dis03-bagan': (x) => [
    { policy: follow(1, 58, 0), until: and(ground, X(x + 33.4)), max: 6000, note: 'behind her again; before the wet path, wait till it is dry' },
  ],
  'dis02-chapori': (x) => [
    ...hopR(x + 1.4, 'on to the first bar', 12),
    ...hopR(x + 7.2, 'on to the big bar', 14),
    ...hopR(x + 16.2, 'across to the hut, which never moves', 14),
    { hold: '', until: and(ground, barUp(1, 3)), max: 900, note: 'stop on the hut: the last bar comes up' },
    ...hopR(x + 25.2, 'on to the last bar', 14),
    ...hopR(x + 33.2, 'on to the far bank', 12),
    { hold: 'R', until: and(ground, X(x + 38)), max: 300 },
  ],
};
// acts without a mark step: tag their first step (no extra tick), so their scripted deaths can start where they start
/** acts given a run-up in levels.ts (`runUp`): their content starts this many columns later */
const RUNUP: Record<string, number> = { 'dis07-bordoisila': 3, 'dis04-bhogali': 3, 'dis07-dhol': 3, 'dis08-bagori': 3, 'dis10-dhol': 3, 'dis10-bordoisila': 3 };
for (const [id, f0] of Object.entries(actRoutes)) {
  const k = RUNUP[id] ?? 0;
  if (k) actRoutes[id] = (x) => f0(x + k);
}
for (const [id, f] of Object.entries(actRoutes)) actRoutes[id] = (x) => { const st = f(x); if (st[0] && st[0].note !== `act:${id}`) (st[0] as { actMark?: string }).actMark = id; return st; };

/** a policy for each door ending, by kind ('dis-...'). */
const endingPolicies: Record<string, Policy> = {
  'dis-royal-seat'(w, m, d) {
    const D = Math.round(d.x / 16) - 1;
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (!p.onGround) return go('R');
    // across the oil to the pad, then pad to pad
    const rib1 = px(D - 16);
    const rib2 = px(D - 9);
    const jumpAt = (rib: number) => p.cx >= rib - 14 && p.cx < rib - 4;
    if (jumpAt(rib1) || jumpAt(rib2)) {
      m.hold = 40;
      return { move: 'R', jump: true };
    }
    if (p.cx > px(D - 3) && w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4)) {
      m.hold = 9;
      return { move: 'R', jump: true };
    }
    return go('R');
  },
  'dis-post-bank'(w, m, d) {
    const pl = pluckers(w)[pluckers(w).length - 1];
    const p = w.player;
    const D = Math.round(d.x / 16);
    if (m.hold > 0) return { move: 'R', jump: true };
    if (p.cx > px(D - 3)) return go(toward(w, d.x + 8, 1) || 'R');
    if (!p.onGround) return go('R');
    const ground = w.solidAt(p.x + p.w + 3, p.y + p.h + 1, 1, 2);
    // a tile of water before a bar (or the bank) that is up: hop it
    const beyond = w.solidAt(p.x + p.w + 20, p.y + p.h + 1, 6, 2);
    if (!ground && beyond && (p.cx > px(D - 6) || p.cx - pluckers(w)[pluckers(w).length - 1].x < 52)) {
      m.hold = 12;
      return { move: 'R', jump: true };
    }
    if (pl.phase === 'wait') return go(p.cx < px(D - 33.3) ? 'R' : '');
    // keep a few steps in FRONT of her: go when she is close behind, and only on to a bar that is up
    const gap = p.cx - pl.x;
    if (ground && gap < 52) return go('R');
    return go('');
  },
  'dis-watch-tower'(w, m, d) {
    const cs = charges(w);
    const A = cs[cs.length - 2];
    const B = cs[cs.length - 1];
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (p.y + p.h <= 177 && p.cx > d.x - 56) return go(toward(w, d.x + 8, 1) || 'R');
    if (A.phase === 'noise' || A.phase === 'charge' || A.phase === 'rest') return go('');
    if (!p.onGround) return go('R');
    if (w.solidAt(p.x + p.w + 2, p.y + 2, 1, p.h - 4) && p.cx > px(Math.round(d.x / 16) - 8)) {
      m.hold = 9;
      return { move: 'R', jump: true };
    }
    void B;
    return go('R');
  },
  'dis-uruka-net'(w, m, d) {
    const n = w.flags.net as { t: (w: World) => number; pull: number };
    const D = Math.round(d.x / 16);
    const p = w.player;
    const t = n.t(w);
    const restFresh = t >= n.pull && t < n.pull + 20;
    m.stage ??= 0;
    if (m.stage === 0) {
      if (p.cx < px(D - 15)) return go('R');
      if (!restFresh) return go('');
      m.stage = 1;
    }
    if (m.stage === 1) {
      if (p.cx < px(D - 10) + 12) return go('R');
      m.stage = 2;
    }
    if (m.stage === 2) {
      if (!restFresh || !p.onGround) return go('');
      m.stage = 3;
    }
    return go(toward(w, d.x + 8, 1) || 'R');
  },

  'dis-tea-ladder'(w, m, d) {
    const k = w.flags.ladder as { boy: { down: boolean }; rung: { solid: { x: number; w: number } & object } };
    const D = Math.round(d.x / 16) - 1;
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (p.y + p.h <= 177 && p.cx > px(D - 1)) return go(toward(w, d.x + 8, 1) || 'R');
    if (!p.onGround) return go('R');
    const rungS = (k.rung as any).solid;
    if (w.standing(rungS)) {
      if (p.cx > rungS.x + rungS.w - 24) {
        m.hold = 10;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    if (p.cx < rungS.x - 24) return go(p.cx < px(D - 8) || k.boy.down ? 'R' : '');
    if (!k.boy.down) return go('');
    m.hold = 9;
    return { move: 'R', jump: true };
  },
  'dis-gamosa-latch'(w, _m, d) {
    return go(toward(w, d.x + 8, 1) || 'R');
  },
  'dis-laru-plate'(w, m, d) {
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    // on the plate: hop each laru ball as it comes
    const ball = w.entities.find((e: any) => e.kind === 'dis-laru' && e.alive && e.x > p.x && e.x - p.x < 64) as any;
    if (p.onGround && ball) {
      m.hold = 11;
      return { move: 'R', jump: true };
    }
    return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : 'R');
  },
  'dis-muga-reel'(w, m, d) {
    const r = w.flags.reel as { solid: { x: number; y: number }; phase: string; t: number };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (!p.onGround) return go('');
    if (p.y + p.h <= px(11) && p.cx > r.solid.x + 32) return go(toward(w, d.x + 8, 1) || 'R');
    if (w.player.isRiding(r.solid as never)) return go(r.phase === 'top' ? 'R' : toward(w, r.solid.x + 16, 2));
    if (p.cx < r.solid.x - 24) return go('R');
    if (r.phase === 'rest' && r.t < 60) {
      m.hold = 10;
      return { move: 'R', jump: true };
    }
    return go(p.cx > r.solid.x - 20 ? 'L' : '');
  },

  'dis-hut-shut'(w, m, d) {
    const f = fields(w)[fields(w).length - 1];
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (w.flags.twist === 'open') return go(p.onGround ? toward(w, d.x + 8, 1) || 'R' : '');
    if (!p.onGround) return go('R');
    const X0 = f.bars[0].slab.solid,
      Y = f.bars[1].slab.solid;
    if (p.cx < X0.x - 38) return go('R');
    if (p.cx < X0.x + 2 && !w.standing(X0)) {
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    if (w.standing(X0)) {
      if (Y.w < px(3)) return go('');
      if (p.cx < X0.x + X0.w - 6) return go('R');
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    if (w.standing(Y)) {
      if (p.cx < Y.x + Y.w - 5) return go('R');
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    return go(toward(w, d.x + 8, 1) || 'R');
  },
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['DIS-01', 'DIS-02', 'DIS-03', 'DIS-04', 'DIS-05', 'DIS-06', 'DIS-07', 'DIS-08', 'DIS-09', 'DIS-10'],
};
