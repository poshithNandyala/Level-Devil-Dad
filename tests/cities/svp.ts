// Proven routes for Sri Vijaya Puram: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVELS } from '../../src/game/levels';
import type { Rope } from '../../src/game/cities/svp/rassi';
import type { Formation } from '../../src/game/cities/svp/choona';
import type { Barge, Swell } from '../../src/game/cities/svp/lehar';
import type { Stall } from '../../src/game/cities/svp/kadhai';
import type { Pool } from '../../src/game/cities/svp/hauz';
import type { LiftBridge } from '../../src/game/cities/svp/khula';
import type { Lift } from '../../src/game/cities/svp/uthao';
import type { SawHall } from '../../src/game/cities/svp/s02';
import type { Creek } from '../../src/game/cities/svp/s03';
import type { Herd, LateBoat } from '../../src/game/cities/svp/s04';
import type { Viewpoint } from '../../src/game/cities/svp/s05';
import type { Bough, Flock } from '../../src/game/cities/svp/s06';
import type { Crowd, Hall, Ship } from '../../src/game/cities/svp/s07';
import type { Weather } from '../../src/game/cities/svp/s08';
import type { Root } from '../../src/game/cities/svp/s09';
import type { Lane } from '../../src/game/cities/svp/s01';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
const px = (t: number) => t * 16;
const FLOOR_Y = 240;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};

/** run right and hop every gap in the road (a tap), as a person would */
function hopEdges(note = ''): Step {
  let W: World | null = null;
  let jt = 0;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
      }
      const p = w.player;
      if (jt > 0) {
        jt--;
        return { move: 'R', jump: true };
      }
      if (p.onGround && (!w.solidAt(p.x + p.w + 6, p.y + p.h + 2, 2, 2) || w.solidAt(p.x + p.w + 4, p.y + 3, 2, p.h - 8))) {
        jt = 11;
        return { move: 'R', jump: true };
      }
      return go('R');
    },
    until: () => false,
    max: 1,
    note,
  };
}
/** hopEdges until `done` */
const hopUntil = (done: (w: World) => boolean, note: string, max = 1500): Step => ({ ...hopEdges(note), until: done, max });

// ------------------------------------------------------------------ SVP-04: the deer
/** put the food down where Dad stands (stand still till it is down) */
const putDown = (get: (w: World) => Herd, note: string): Step => ({ hold: '', until: (w) => !get(w).carrying && get(w).food !== null, max: 400, note });
/** wait back from the edge until the boat is in, then ride it across and step off */
const boatRide = (get: (w: World) => Herd, getBoat: (w: World) => LateBoat, edgeX: number, farX: number): Step[] => [
  { policy: (w) => (getBoat(w).docked ? go('R') : go(toward(w, edgeX - 22, 3))), until: (w) => getBoat(w).docked && w.standing(getBoat(w).boat.solid), max: 1800, note: 'wait back from the edge for the boat, then step on' },
  { hold: '', until: (w) => getBoat(w).boat.x >= getBoat(w).R0 - 1, max: 900, note: 'ride it across' },
  { hold: 'R', until: and(ground, (w) => w.player.x > farX), max: 400, note: 'off on to the far bank' },
];
const herd0 = (w: World) => w.flags.herd as Herd;
const boat0 = (w: World) => w.flags.boat as LateBoat;
const herdA = (w: World) => (w.flags.herds as Herd[])[0];
const boatA = (w: World) => (w.flags.boats as LateBoat[])[0];

// ------------------------------------------------------------------ SVP-05: the view from the bench
/** stand on the footprints until the view lines up */
const standOn = (get: (w: World) => Viewpoint, note: string): Step => ({ policy: (w) => go(toward(w, get(w).spot, 2)), until: (w) => get(w).aligned > 0, max: 900, note });
const vp0 = (w: World) => w.flags.vp as Viewpoint;
const vpN = (i: number) => (w: World) => (w.flags.vps as Viewpoint[])[i];

// ------------------------------------------------------------------ SVP-06: the parrots
const fl0 = (w: World) => w.flags.flock as Flock;
const bg0 = (w: World) => w.flags.bough as Bough;
const flN = (i: number) => (w: World) => (w.flags.flocks as Flock[])[i];
const bgN = (i: number) => (w: World) => (w.flags.boughs as Bough[])[i];
/** over a creek by its branch: wait back for the flock to bend it, hop on, out to the tip, and wait for the horn to lift it */
const boughCross = (fl: (w: World) => Flock, bg: (w: World) => Bough, waitX: number, upY: number, farX: number): Step[] => [
  { policy: (w) => go(toward(w, waitX, 3)), until: (w) => fl(w).weight >= 0.95 && Math.abs(w.player.cx - waitX) < 6, max: 2400, note: 'back from the edge until the flock has landed and bent the branch' },
  { hold: 'R', jump: 14, until: (w) => w.standing(bg(w).plat.solid), max: 200, note: 'hop on to the bent branch' },
  { hold: 'R', until: (w) => w.player.x >= bg(w).x1 - 20, max: 400, note: 'out to the tip' },
  { hold: '', until: (w) => fl(w).weight < 0.02 && bg(w).plat.y <= upY + 1, max: 2000, note: 'wait for the horn: the branch lifts you up' },
  { hold: 'R', until: and(ground, (w) => w.player.x >= farX), max: 300, note: 'off on to the cliff' },
];

// ------------------------------------------------------------------ SVP-07: the jetty
const hall0 = (w: World) => w.flags.hall as Hall;
const crowd0 = (w: World) => w.flags.crowd as Crowd;
const hallN = (w: World) => (w.flags.halls as Hall[])[0];
const inTrench = (w: World) => w.player.onGround && w.player.y + w.player.h > 255;
/** out of the trench by its right wall */
const climbRight = (note: string, farX: number): Step => ({ hold: 'R', jump: 14, until: (w) => w.player.onGround && w.player.y + w.player.h <= 241 && w.player.x >= farX, max: 300, note });
const ships = (w: World) => w.flags.ships as Ship[];

// ------------------------------------------------------------------ SVP-08: the two monsoons
const wx = (w: World) => w.flags.weather as Weather;
/** along the street: in the lee of an awning for the rain that is coming, and over to the next one in the lull */
function streetPolicy(w: World): Out {
  const k = wx(w);
  const p = w.player;
  const cx = p.cx;
  if (k.t < 0) return go('R');
  const aws = k.awnings.filter((a) => a.lee(1)[1] - a.lee(1)[0] >= 36).sort((a, b) => a.x0 - b.x0);
  const inside = aws.find((a) => cx >= a.x0 - 6 && cx <= a.x1 + 6);
  const nextAw = aws.find((a) => a.x0 > cx + 4);
  const dirNow = k.raining ? k.dir : k.next;
  const spot = (a: (typeof aws)[0]) => {
    const [z0, z1] = a.lee(dirNow);
    return (z0 + z1) / 2;
  };
  const porch = k.porches.find(([a, b]) => cx >= a && cx <= b);
  if (k.raining && porch) return go('');
  if (k.raining) return go(toward(w, spot(inside ?? nextAw ?? aws[aws.length - 1]), 2));
  const tgt = nextAw ?? inside ?? aws[aws.length - 1];
  const dist = Math.abs(spot(tgt) - cx);
  if (inside && nextAw && k.left < dist / 2.3 + 45) return go(toward(w, spot(inside), 2));
  return go(toward(w, spot(tgt), 2));
}
const streetUntil = (idx: number, note: string): Step => ({ policy: streetPolicy, until: (w) => !!wx(w).awnings[idx] && Math.abs(w.player.cx - (wx(w).awnings[idx].lee(wx(w).raining ? wx(w).dir : wx(w).next)[0] + 19)) < 4 && w.player.onGround, max: 6000, note });

// ------------------------------------------------------------------ SVP-09: the roots
const allRoots = (w: World) => w.entities.filter((e) => e.constructor.name === 'Root') as unknown as Root[];
const rootAt = (w: World, tx: number) => allRoots(w).find((r) => Math.abs(r.x0 - px(tx)) < 2)!;
const roots = (w: World) => w.flags.roots as Root[];
/** along the living roots (their first tile columns), then on to the ground at `groundX` px: wait at the start of a root until the next is within a run-up's reach, then run and jump from its end */
function rootsPolicy(txs: number[], groundX: number, note: string, until: (w: World) => boolean, lead = 60, firstHold = 24): Step {
  let W: World | null = null;
  let jt = 0;
  let committed = false;
  let up = false;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
        committed = false;
        up = false;
      }
      const p = w.player;
      if (jt > 0) {
        if (!p.onGround) up = true;
        if (p.onGround && up) jt = 0;
        else {
          jt--;
          return { move: 'R', jump: true };
        }
      }
      if (!p.onGround) return go('R');
      const rs = txs.map((t) => rootAt(w, t));
      const cur = rs.findIndex((r) => w.standing(r.plat.solid));
      if (cur < 0) {
        // on the bank: run at the first root and hop up when close
        const first = rs[0];
        if (p.cx >= first.plat.x - 6) return go('L');
        if (p.cx >= first.plat.x - lead && p.cx < first.plat.x) {
          jt = firstHold;
          up = false;
          return { move: 'R', jump: true };
        }
        return go('R');
      }
      const r = rs[cur];
      const nx = cur + 1 < rs.length ? rs[cur + 1] : null;
      const nextX = nx ? nx.plat.x : groundX;
      const gap = nextX - (r.plat.x + r.plat.w) + (nx ? (nx.plat.solid.velX ?? 0) * 0.32 : 0) + ((r.plat.solid.velX ?? 0) * -0.32);
      if (!committed && gap <= 36) committed = true;
      if (!committed) return go(toward(w, r.plat.x + 6, 2));
      if (p.cx < r.plat.x + r.plat.w - (gap > 28 ? 14 : 22) && p.cx >= r.plat.x + 4) return go('R');
      if (p.cx < r.plat.x + 4) return go('R');
      committed = false;
      jt = gap > 28 ? 20 : 14;
      up = false;
      return { move: 'R', jump: true };
    },
    until,
    max: 4000,
    note,
  };
}

// ------------------------------------------------------------------ SVP-01: the welcome tour
const lane = (w: World) => w.flags.lane as Lane;
const hop = (at: number, note: string, ticks = 12): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note },
  { hold: 'R', until: ground, max: 300 },
];
const ferryOf = (w: World) => w.entities.find((e: any) => e.ferry) as any;
/** posts and steps up to the awning, standing under it */
const tourToAwning = (): Step[] => [...hop(8.6, 'a bollard'), ...hop(11.6, 'a bollard'), ...hop(14.6, 'a bollard'), ...hop(18.7, 'a step'), ...hop(20.7, 'a step'), { hold: 'R', until: X(36.4), max: 900, note: 'under the awning' }];
/** from the drain to the door */
const tourFromDrain = (): Step[] => [
  ...hop(39.4, 'the drain', 14),
  { hold: 'R', until: X(65.8), max: 900, note: 'up the lane' },
  { hold: 'R', jump: 14, ticks: 14, note: 'hop the cart' },
  { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 },
  { hold: 'R', until: X(74.8), max: 900 },
  { hold: '', until: (w) => { const f = ferryOf(w); return f.state === 'rest' && f.x === 76 * 16; }, max: 900, note: 'wait for the shuttle' },
  { hold: 'R', until: (w) => w.standing(ferryOf(w).solid) && w.player.x >= ferryOf(w).x + 10, max: 200, note: 'step aboard' },
  { hold: '', until: (w) => { const f = ferryOf(w); return f.state === 'rest' && f.x === (76 + 14 - 3) * 16; }, max: 900, note: 'ride across' },
  { hold: 'R', until: X(90.4), max: 200, note: 'step off' },
  { hold: 'R', until: X(94 - 1.6), max: 900 },
  { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: (w) => w.state !== 'play', max: 900 },
];

// ------------------------------------------------------------------ SVP-02: the saw mill
const hall = (w: World, i = 0) => (i < 0 ? (w.flags.saw as SawHall) : ((w.flags.halls ?? []) as SawHall[])[i]);
/** stay at `off` px from the log's own left end (the log moves, so follow it) until the carriage has docked */
const stayOnLog = (get: (w: World) => SawHall, off: number, note: string): Step => ({
  policy: (w) => {
    const h = get(w);
    return go(toward(w, h.L + off, 2));
  },
  until: (w) => get(w).docked,
  max: 2400,
  note,
});
const board = (get: (w: World) => SawHall, note: string): Step => ({ hold: 'R', until: (w) => w.player.x >= get(w).bankX + 6 && w.player.onGround, max: 600, note });

/** each stage's own room steps, before its acts and door are added (for the act-level plays) */
const ROOM: Record<string, Step[]> = {};
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['SVP-01'] = [...tourToAwning(), { hold: '', until: (w) => lane(w).done, max: 2400, note: 'under the awning till the cloud has gone' }, ...tourFromDrain()];
  S['SVP-02'] = [
    board((w) => hall(w, -1), 'on to the boarding end of the log'),
    stayOnLog((w) => hall(w, -1), 12, 'stay on the end that is left: it rides over'),
    { hold: 'R', until: and(ground, X(31)), max: 600, note: 'off on to the far bank' },
  ];
  ROOM['SVP-02'] = S['SVP-02'];
  lengthen('SVP-02', 0, []);
  S['SVP-03'] = [
    { hold: 'R', until: (w) => (w.flags.creek as Creek).state !== 'sun', max: 900, note: 'wade into the creek: the crocodile slides in after you' },
    { hold: 'L', until: (w) => w.player.x < 197 && w.player.onGround, max: 600, note: 'back to the wall: the arrow has swung to the water' },
    { hold: 'L', jump: 14, until: (w) => w.player.onGround && w.player.y + w.player.h <= 241, max: 200, note: 'up out of the creek on to the bank' },
    hopUntil((w) => w.player.x > 31 * 16 && w.player.onGround, 'the logs are only logs now: hop them'),
  ];
  ROOM['SVP-03'] = S['SVP-03'];
  lengthen('SVP-03', 0, []);
  S['SVP-04'] = [
    { hold: 'R', until: (w) => herd0(w).carrying, max: 600, note: 'past the stall: the fritter is yours, and the herd is up' },
    { hold: 'R', until: X(12.5), max: 300, note: 'well back from the edge' },
    putDown(herd0, 'stand still: Dad puts it down, and the herd goes to it'),
    ...boatRide(herd0, boat0, 20 * 16, 26 * 16 + 4),
    { hold: 'R', until: and(ground, X(31)), max: 400 },
  ];
  ROOM['SVP-04'] = S['SVP-04'];
  lengthen('SVP-04', 0, []);
  S['SVP-05'] = [standOn(vp0, 'on the footprints by the bench: the view lines up'), hopUntil(and(ground, X(25)), 'across the ledge while it holds')];
  ROOM['SVP-05'] = S['SVP-05'];
  lengthen('SVP-05', 0, []);
  S['SVP-06'] = [...boughCross(fl0, bg0, 172, 144, 24 * 16), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  ROOM['SVP-06'] = S['SVP-06'];
  lengthen('SVP-06', 0, []);
  S['SVP-07'] = [
    hopUntil(and(ground, X(14.5)), 'across the luggage, no stopping'),
    { hold: 'R', until: inTrench, max: 600, note: 'down into the luggage trench' },
    { hold: '', until: (w) => crowd0(w).x > 27 * 16 && crowd0(w).on, max: 2400, note: 'in the trench while the ship is called and the crowd goes over' },
    climbRight('out behind the crowd', 25 * 16),
    { hold: 'R', until: and(ground, X(31)), max: 300 },
  ];
  ROOM['SVP-07'] = S['SVP-07'];
  lengthen('SVP-07', 0, []);
  S['SVP-08'] = [streetUntil(2, 'awning to awning, in the lee of the rain that is coming')];
  ROOM['SVP-08'] = S['SVP-08'];
  lengthen('SVP-08', 0, []);
  S['SVP-09'] = [
    rootsPolicy([9, 14, 20], 24 * 16, 'up on the roots, across the swinging one, and off on to the road', and(ground, (w) => w.player.x >= 24 * 16 + 2)),
    { hold: 'R', until: and(ground, X(26)), max: 300 },
  ];
  ROOM['SVP-09'] = S['SVP-09'];
  lengthen('SVP-09', 0, []);
  S['SVP-10'] = [
    { hold: 'R', until: (w) => herd0(w).carrying, max: 600, note: 'past the stall: the fritter is yours' },
    putDown(herd0, 'put it down here, well back from the mill'),
    board((w) => hall(w, -1), 'on to the log'),
    stayOnLog((w) => hall(w, -1), 12, 'stay on the end that stays'),
    { hold: 'R', until: and(ground, X(31)), max: 600, note: 'off on to the far bank' },
  ];
  ROOM['SVP-10'] = S['SVP-10'];
  lengthen('SVP-10', 0, []);
}

/** the obvious play per stage, and the cause it must die of */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'SVP-01': { steps: [hopUntil((w) => w.state !== 'play', 'up the lane in the rain')], cause: 'svp-baha' },
  'SVP-10': { steps: [{ hold: 'R', until: (w) => herd0(w).carrying, max: 600 }, board((w) => hall(w, -1), 'on to the log with the food'), stayOnLog((w) => hall(w, -1), 12, 'and stay on the end that stays, with the herd behind you')], cause: 'svp-aari' },
  'SVP-09': { steps: [{ hold: 'R', until: (w) => w.state !== 'play', max: 900, note: 'across the brick floor' }], cause: 'svp-eent' },
  'SVP-08': { steps: [{ hold: 'R', until: (w) => w.state !== 'play', max: 1500, note: 'run for it' }], cause: 'svp-baarish' },
  'SVP-07': { steps: [hopUntil(and(ground, X(11.5)), 'on to the luggage'), { hold: '', until: (w) => w.state !== 'play', max: 1500, note: 'ship late hai: sit on the luggage like everyone' }], cause: 'svp-saman' },
  'SVP-06': { steps: [{ hold: 'R', until: X(11.2), max: 400 }, { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'run at the creek and jump for the cliff' }], cause: 'svp-kichad' },
  'SVP-05': { steps: [hopUntil((w) => w.state !== 'play', 'at the gap, run and hop the dashes')], cause: 'svp-nazar' },
  'SVP-04': { steps: [{ hold: 'R', until: X(19.2), max: 600 }, ...Array.from({ length: 40 }, (): Step => ({ hold: '', jump: 8, ticks: 40, note: 'waiting for the boat, hopping to keep warm' }))], cause: 'svp-hiran' },
  'SVP-03': { steps: [hopUntil((w) => w.state !== 'play', 'hop the logs')], cause: 'svp-magar' },
  'SVP-02': {
    steps: [
      { hold: 'R', until: (w) => w.player.x >= hall(w, -1).bankX + 6 && w.player.onGround, max: 600 },
      { policy: (w) => go(toward(w, hall(w, -1).L + 84, 2)), until: (w) => w.state !== 'play', max: 1500, note: 'out to the far end of the log, by the bank you want' },
    ],
    cause: 'svp-aari',
  },
};

/** the obvious correction after the first death, which dies too */
const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'SVP-01': { steps: [...tourToAwning(), { hold: '', until: (w) => lane(w).t > 70 + 620 + 40, max: 1200, note: 'under the awning till the rain stops' }, hopUntil((w) => w.state !== 'play', 'and up the lane at once')], cause: 'svp-baha' },
  'SVP-09': {
    steps: [
      { hold: 'R', until: X(7.6), max: 400 },
      { hold: 'R', jump: 14, until: (w) => w.standing(roots(w)[0].plat.solid), max: 200, note: 'up on to the roots' },
      { policy: (w) => go(toward(w, roots(w)[0].plat.x + 40, 2)), until: (w) => roots(w)[1].plat.x - (roots(w)[0].plat.x + roots(w)[0].plat.w) >= 28 && (roots(w)[1].plat.solid.velX ?? 0) > 0 && Math.abs(w.player.cx - (roots(w)[0].plat.x + 40)) < 4, max: 1200, note: 'at the end of the first root while the swinging one is away' },
      { hold: 'R', jump: 6, until: (w) => w.state !== 'play', max: 600, note: 'and step across to where the root was' },
    ],
    cause: 'svp-eent',
  },
  'SVP-08': { steps: [{ policy: (w) => go(toward(w, 6 * 16 + 80 - 19, 2)), until: (w) => w.state !== 'play', max: 3000, note: 'shelter at the right end of the first awning, and stay put' }], cause: 'svp-baarish' },
  'SVP-07': { steps: [hopUntil(and(ground, X(37)), 'over the luggage and the trench, to the jetty edge'), { hold: '', until: (w) => w.state !== 'play', max: 1800, note: 'wait there for the ship to be called' }], cause: 'svp-bheed' },
  'SVP-06': {
    steps: [
      { policy: (w) => go(toward(w, 172, 3)), until: (w) => fl0(w).weight >= 0.95 && Math.abs(w.player.cx - 172) < 6, max: 2400, note: 'wait for the parrots' },
      { hold: 'R', jump: 14, until: (w) => w.standing(bg0(w).plat.solid), max: 200 },
      { hold: 'R', until: (w) => w.player.x >= bg0(w).x1 - 14, max: 400, note: 'out on the bent branch' },
      { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'and jump for the cliff from the tip' },
    ],
    cause: 'svp-kichad',
  },
  'SVP-05': { steps: [standOn(vp0, 'stand at the bench spot'), { hold: '', ticks: 330, note: 'and make sure of the view for a while' }, hopUntil((w) => w.state !== 'play', 'then go')], cause: 'svp-nazar' },
  'SVP-04': { steps: [{ hold: 'R', until: X(19.2), max: 600 }, { hold: '', until: (w) => w.state !== 'play', max: 1500, note: 'put it down right here at the edge, and wait for the boat' }], cause: 'svp-hiran' },
  'SVP-03': { steps: [{ hold: 'R', until: (w) => w.state !== 'play', max: 1500, note: 'wade the creek instead' }], cause: 'svp-magar' },
  'SVP-02': {
    steps: [
      { hold: 'R', until: (w) => w.player.x >= hall(w, -1).bankX + 6 && w.player.onGround, max: 600 },
      { policy: (w) => go(toward(w, hall(w, -1).L + 48, 2)), until: (w) => w.state !== 'play', max: 2400, note: 'the middle of the log, away from both ends' },
    ],
    cause: 'svp-aari',
  },
};

/** more scripted first-timer deaths and 'like last time' moves */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {};
/** the stage played properly up to act `act`, then `then(x0)`: for the plays that must die inside an added act */
function atAct(id: string, act: string, then: (x: number) => Step[]): Step[] {
  const def = LEVELS.find((l) => l.id === id)!;
  const out: Step[] = [...ROOM[id]];
  for (const p of def.parts ?? []) {
    if (p.kind === act) return [...out, ...then(p.x0)];
    out.push(...actRoutes[p.kind](p.x0));
  }
  throw new Error(`${id} has no act ${act}`);
}
/** a death that must happen in an added act: the NAIVE play and the obvious FIX of it */
/** acts taken out of the stages after the uniqueness probe (docs: LENGTH.md): their routes and files stay, one line in levels.ts puts them back */
const RETIRED = new Set(['svp06-lehar', 'svp07-khula', 'svp07-uthao', 'svp08-bazaar', 'svp09-hauz']);
function actDeath(id: string, act: string, what: string, cause: string, then: (x: number) => Step[]) {
  if (RETIRED.has(act)) return;
  (mistakes[id] ??= []).push({
    what,
    cause,
    get steps() {
      return atAct(id, act, then);
    },
  });
}


/** a route for each act, by act id */
const patrols = (w: World) => (w.flags.patrols ?? []) as { cx: number; heading: number }[];
/** along the logs: wait well back from each gap, and go when the crocodile is a gap or more away from it */
function crossGaps(): Step {
  let W: World | null = null;
  let jt = 0;
  let committed = false;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
        committed = false;
      }
      const p = w.player;
      if (jt > 0) {
        jt--;
        return { move: 'R', jump: true };
      }
      if (!p.onGround) return go('R');
      let d = -1;
      for (let k = 4; k <= 90; k += 2)
        if (!w.solidAt(p.x + p.w + k, p.y + p.h + 2, 2, 2)) {
          d = k;
          break;
        }
      if (d < 0) return go('R');
      const gapX = p.x + p.w + d + 8;
      const c = patrols(w)[0];
      const safe = Math.abs(c.cx - gapX) >= 86;
      if (safe) committed = true;
      if (committed) {
        if (d <= 22) {
          jt = 11;
          committed = false;
          return { move: 'R', jump: true };
        }
        return go('R');
      }
      return d > 52 ? go('R') : go('');
    },
    until: () => false,
    max: 1,
  };
}
// ------------------------------------------------------------------ SVP-05 act 2: the mooring rope
const rope = (i: number) => (w: World) => (w.flags.ropes as Rope[])[i];
/** by the bollard: hop until the boat is alongside, step on, ride across and walk off on to `farX` */
const ropeCross = (i: number, bollardTx: number, farTx: number): Step[] => [
  { policy: (w) => go(toward(w, px(bollardTx) + 8, 3)), until: (w) => Math.abs(w.player.cx - (px(bollardTx) + 8)) < 6 && w.player.onGround, max: 900, note: 'to the bollard' },
  { policy: (w) => ({ move: toward(w, px(bollardTx) + 8, 14), jump: w.player.onGround && rope(i)(w).state === 'out' }), until: (w) => rope(i)(w).state !== 'out', max: 2400, note: 'hop by the bollard: every hop pulls the boat in' },
  { hold: 'R', until: (w) => w.standing(rope(i)(w).boat.solid), max: 900, note: 'step on to the boat' },
  { hold: '', until: (w) => rope(i)(w).state === 'docked', max: 3000, note: 'the boat poles across' },
  { hold: 'R', until: and(ground, X(farTx)), max: 900, note: 'off on to the far bank' },
];
// ------------------------------------------------------------------ SVP-05 act 3: the caves
const form = (i: number) => (w: World) => (w.flags.forms as Formation[])[i];
/** hop to the thing under formation `i`, wait on the dry side until it has stopped dripping, then on over the drain to `farTx` */
const caveBeat = (i: number, hopTx: number, jump: number, waitTx: number, drainTx: number, farTx: number): Step[] => [
  { hold: 'R', until: X(hopTx), max: 900 },
  { hold: 'R', jump, ticks: jump, note: 'hop it: that raps the formation' },
  { hold: 'R', until: and(ground, X(waitTx)), max: 400, note: 'on to the dry side' },
  { hold: '', until: (w) => form(i)(w).knocks > 0 && !form(i)(w).dripping, max: 1500, note: 'wait for the dripping to stop' },
  { hold: 'R', until: X(drainTx), max: 400 },
  { hold: 'R', jump: 14, ticks: 14, note: 'over the drain' },
  { hold: 'R', until: and(ground, X(farTx)), max: 900, note: 'across the dry floor' },
];
// ------------------------------------------------------------------ SVP-06 act 2: the swell
const swell = (k: number) => (w: World) => (w.flags.swells as Swell[])[k];
const bargeOf = (w: World) => (w.flags.barges as Barge[])[0];

// ------------------------------------------------------------------ SVP-08 act 2: the fish-fry stalls
// ------------------------------------------------------------------ SVP-09 act 2: the drained pools
const pool = (i: number) => (w: World) => (w.flags.pools as Pool[])[i];
// ------------------------------------------------------------------ SVP-07 act 5: the godown lifts
const lift = (i: number) => (w: World) => (w.flags.lifts as Lift[])[i];
/** on to lift `i` and ride to its last stop (where `until` ends the wait) */
const liftRide = (i: number, boardTx: number): Step[] => [
  { hold: 'R', until: (w) => w.standing(lift(i)(w).plat.solid) && w.player.cx > lift(i)(w).x + 20, max: 900, note: 'on to the lift' },
  { hold: '', until: (w) => lift(i)(w).state === 'stop', max: 6000, note: 'ride it to its floor' },
];
// ------------------------------------------------------------------ SVP-07 act 4: the lift bridges
const bridge = (i: number) => (w: World) => (w.flags.bridges as LiftBridge[])[i];
/** back from the channel on the road until the lights have just gone green, then straight across and on to the far road */
const bridgeCross = (i: number, s: number): Step[] => [
  { policy: (w) => go(toward(w, px(s) - 20, 3)), until: (w) => { const p = bridge(i)(w).phase; return p.name === 'down' && p.left >= 330 && Math.abs(w.player.cx - (px(s) - 20)) < 8; }, max: 4000, note: 'on the road, waiting for the green' },
  { hold: 'R', until: and(ground, X(s + 11)), max: 700, note: 'straight across the deck' },
];
/** into the pool, on to the raft, up with the water, across to the wall and off its far side */
const poolCross = (i: number, p: number): Step[] => [
  { hold: 'R', until: X(p + 0.9), max: 900, note: 'into the dry pool: a pipe starts to run' },
  { policy: (w) => ({ move: 'R', jump: w.player.onGround && w.player.x > pool(i)(w).raft.x - 22 }), until: (w) => w.standing(pool(i)(w).raft.solid), max: 400, note: 'up on the raft' },
  { hold: '', until: (w) => pool(i)(w).level >= pool(i)(w).top - 1, max: 3000, note: 'on the raft while the water rises to the top of the wall' },
  { hold: 'R', until: (w) => w.player.x >= pool(i)(w).raft.x + 30, max: 200, note: 'to the wall end of the raft' },
  { hold: 'R', jump: 16, ticks: 16, note: 'across to the wall' },
  { hold: 'R', until: and(ground, X(p + 11.6)), max: 600, note: 'over the wall and down the far side' },
];
const stall = (i: number) => (w: World) => (w.flags.stalls as Stall[])[i];
/** over one counter: climb on in the rest before the left half spits, stand on the right half, change to the left in the rest, and off at the end */
const stallCross = (i: number, s: number): Step[] => [
  { policy: (w) => go(toward(w, px(s) - 22, 3)), until: (w) => { const p = stall(i)(w).phase; return p.name === 'restR' && p.left >= 80 && Math.abs(w.player.cx - (px(s) - 22)) < 8; }, max: 4000, note: 'back from the counter, waiting for a rest' },
  { hold: 'R', jump: 20, ticks: 20, note: 'up on the counter' },
  { hold: 'R', until: (w) => w.player.cx >= px(s) + 72, max: 300, note: 'over to the right half: the left is about to spit' },
  { hold: '', until: (w) => stall(i)(w).phase.name === 'restL', max: 900, note: 'on the right half while the left spits' },
  { policy: (w) => go(toward(w, px(s) + 24, 3)), until: (w) => stall(i)(w).phase.name === 'restR', max: 900, note: 'over to the left half: the right is next' },
  { hold: 'R', until: and(ground, X(s + 8)), max: 600, note: 'off the end of the counter' },
];
/** along one row of floats: stand on the one you are on, and hop to the next when it is within a jump of you */
function floatsStep(k: number, lastTx: number, note: string): Step {
  let W: World | null = null;
  let jt = 0;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
      }
      const p = w.player;
      if (jt > 0) {
        jt--;
        return { move: 'R', jump: true };
      }
      if (!p.onGround) return go('R');
      const sw = swell(k)(w);
      const cur = sw.floats.findIndex((f) => w.standing(f.solid));
      const curTop = cur < 0 ? FLOOR_Y : sw.floats[cur].y;
      const next = cur + 1;
      const t = w.tick;
      if (next >= sw.floats.length) {
        // off the last float on to the island
        if (FLOOR_Y >= curTop - 30) {
          jt = 22;
          return { move: 'R', jump: true };
        }
        const f = sw.floats[cur];
        return go(toward(w, f.x + f.w - 10, 2));
      }
      const f = sw.floats[next];
      const edge = cur < 0 ? sw.water[0] - 14 : sw.floats[cur].x + sw.floats[cur].w - 10;
      if (Math.abs(p.cx - edge) > 3) return go(toward(w, edge, 2));
      const pred = sw.top(next, t + 36);
      if (pred >= curTop - 30 && sw.top(next, t + 20) >= curTop - 34) {
        jt = 22;
        return { move: 'R', jump: true };
      }
      return go('');
    },
    until: (w) => w.player.onGround && w.player.x >= px(lastTx),
    max: 6000,
    note,
  };
}
// ------------------------------------------------------------------ SVP-09 act 2: the hose
/** over a coral arch whose slab starts at column `tx`: hop on from before it, walk across, drop off the far side */
const overArch = (tx: number): Step[] => [
  { hold: 'R', until: X(tx - 3.5), max: 900, note: 'up to the arch' },
  { hold: 'R', jump: 20, ticks: 20, long: true, note: 'up on the arch: the hose lies over its top' },
  { hold: 'R', until: and(ground, X(tx + 5.6)), max: 600, note: 'across and down the far side' },
];
const actRoutes: Record<string, (x: number) => Step[]> = {
  'svp09-nali': (x) => [
    ...overArch(x + 8),
    { hold: 'R', until: and(ground, X(x + 26)), max: 900, note: 'under the second arch: one bend is all the hose can spare' },
    { hold: 'R', until: and(ground, X(x + 34.5)), max: 600, note: 'to the second pontoon’s stretch' },
    ...overArch(x + 40),
    ...overArch(x + 51),
    { hold: 'R', until: and(ground, X(x + 62.5)), max: 600 },
  ],
  'svp07-uthao': (x) => [
    ...liftRide(0, x + 8),
    ...liftRide(1, x + 18),
    { hold: 'R', until: (w) => w.standing(((w.flags.belts ?? []) as { plat: { solid: unknown } }[])[0].plat.solid as never), max: 600, note: 'along the roof to the moving walkway' },
    { hold: 'R', jump: 15, ticks: 15, note: 'jump from the walkway: it carries you over the gap' },
    ...liftRide(2, x + 39),
    ...liftRide(3, x + 51),
    { hold: 'R', until: and(ground, X(x + 56)), max: 600, note: 'off on to the road' },
    { hold: 'R', until: and(ground, X(x + 57.5)), max: 600 },
  ],
  'svp07-khula': (x) => [...bridgeCross(0, x + 6), ...bridgeCross(1, x + 26), ...bridgeCross(2, x + 46), ...bridgeCross(3, x + 66), ...bridgeCross(4, x + 86), { hold: 'R', until: and(ground, X(x + 104)), max: 600 }],
  'svp09-hauz': (x) => [...poolCross(0, x + 6), ...poolCross(1, x + 26), ...poolCross(2, x + 46), { hold: 'R', until: and(ground, X(x + 64)), max: 600 }],
  'svp08-bazaar': (x) => [...stallCross(0, x + 4), ...stallCross(1, x + 24), ...stallCross(2, x + 44), { hold: 'R', until: and(ground, X(x + 62)), max: 600 }],
  'svp06-lehar': (x) => [
    { hold: 'R', until: X(x + 3.2), max: 600 },
    floatsStep(0, x + 28, 'across the row of floats, a beat at a time'),
    { policy: (w) => ({ move: 'R', jump: bargeOf(w).plat.y < FLOOR_Y - 14 && w.player.onGround && w.player.cx > px(x + 33.4) }), until: (w) => w.standing(bargeOf(w).plat.solid) && w.player.cx > bargeOf(w).plat.x + 30, max: 3000, note: 'on to the barge, a hop if it is up' },
    { hold: '', until: (w) => bargeOf(w).state === 'docked', max: 4000, note: 'the barge goes across, heaving' },
    { policy: (w) => ({ move: 'R', jump: bargeOf(w).plat.y <= FLOOR_Y - 20 && w.player.onGround }), until: and(ground, X(x + 62)), max: 1800, note: 'off to the far shore when the barge is up' },
    { hold: 'R', until: and(ground, X(x + 66)), max: 300 },
  ],
  'svp05-choona': (x) => [...caveBeat(0, x + 10.6, 12, x + 14.2, x + 16.8, x + 32), ...caveBeat(1, x + 39.4, 20, x + 45.2, x + 46.8, x + 61)],
  'svp05-rassi': (x) => [...ropeCross(0, x + 4, x + 29), ...ropeCross(1, x + 27, x + 57)],
  'svp10-rassi': (x) => actRoutes['svp05-rassi'](x),
  'svp10-nali': (x) => actRoutes['svp09-nali'](x),
  'svp07-teesra': (x) => [
    hopUntil(and(ground, X(x + 12.5)), 'across the luggage, no stopping'),
    { hold: 'R', until: inTrench, max: 600, note: 'into the trench' },
    { hold: '', until: (w) => ((w.flags.backs as Crowd[])[0]).on && ((w.flags.backs as Crowd[])[0]).x > px(x + 32), max: 4000, note: 'in the trench through the crowd going one way and the same crowd coming back' },
    climbRight('out behind the crowd', px(x + 26)),
    { hold: 'R', until: and(ground, X(x + 47)), max: 600 },
  ],
  'svp10-nadi': (x) => actRoutes['svp03-nala'](x),
  'svp10-jad': (x) => actRoutes['svp09-pul'](x),
  'svp10-saman': (x) => actRoutes['svp07-doosra'](x),
  'svp10-ghat': (x) => actRoutes['svp04-ghat'](x),
  'svp09-pul': (x) => [
    rootsPolicy([x + 4, x + 10, x + 17], px(x + 20), 'the green roots, skipping the grey step', and(ground, (w) => w.player.x >= px(x + 20) + 2)),
    { hold: 'R', until: and(ground, X(x + 22.5)), max: 300 },
    rootsPolicy([x + 29, x + 35, x + 41], px(x + 45), 'the second creek of ruin', and(ground, (w) => w.player.x >= px(x + 45) + 2), 74, 26),
    { hold: 'R', until: and(ground, X(x + 50)), max: 300 },
    rootsPolicy([x + 52, x + 57, x + 62, x + 67], px(x + 71), 'the stair of roots, up and down', and(ground, (w) => w.player.x >= px(x + 71) + 2), 74, 26),
    { hold: 'R', until: and(ground, X(x + 74.5)), max: 300 },
    rootsPolicy([x + 80, x + 86], px(x + 91), 'the first half of the long cellar', and(ground, (w) => w.player.x >= px(x + 91) + 2), 74, 26),
    { hold: 'R', until: and(ground, X(x + 94.5)), max: 300, note: 'across the sound floor in the middle' },
    rootsPolicy([x + 98, x + 104], px(x + 108), 'the second half of the long cellar', and(ground, (w) => w.player.x >= px(x + 108) + 2), 60, 24),
    { hold: 'R', until: and(ground, X(x + 110)), max: 300 },
  ],
  'svp08-gali': () => [streetUntil(6, 'the longer street, awning to awning')],
  'svp08-deewar': () => [streetUntil(9, 'the tall buildings, not the short ones'), { policy: streetPolicy, until: (w) => !wx(w).raining && wx(w).left > 9000, max: 4000, note: 'in the shadow of the tall one until both rains have gone' }],
  'svp07-ghat': (x) => [
    { hold: 'R', until: and(ground, (w) => w.player.x >= px(x + 4)), max: 600, note: 'on along the pier to the quay' },
    { policy: (w) => go(toward(w, px(x + 6) - 12, 3)), until: (w) => ships(w)[1].docked, max: 3600, note: 'wait at the quay edge: the first ship is the crowd’s' },
    { hold: 'R', jump: 14, until: (w) => w.standing(ships(w)[1].deck.solid), max: 200, note: 'step over to the second ship’s deck' },
    { hold: 'R', until: and(ground, X(x + 16.5)), max: 400, note: 'off on to the far quay' },
    { hold: 'R', until: and(ground, X(x + 33.5)), max: 600 },
  ],
  'svp07-doosra': (x) => [
    hopUntil(and(ground, X(x + 12.5)), 'across the luggage, no stopping'),
    { hold: 'R', until: inTrench, max: 600, note: 'into the trench' },
    { hold: '', until: (w) => hallN(w).called && hallN(w).crowd.x < px(x + 23), max: 3600, note: 'in the trench through the false alarm, the real call and the crowd' },
    climbRight('out behind the crowd', px(x + 26)),
    { hold: 'R', until: and(ground, X(x + 45)), max: 600 },
  ],
  'svp06-sanjh': (x) => [
    hopUntil(and(ground, X(x + 12.5)), 'the branch is up, level with the cliff: across before the flock comes'),
    { hold: 'R', until: and(ground, X(x + 21)), max: 600, note: 'down off the cliff' },
    ...boughCross(flN(1), bgN(1), px(x + 25) + 12, 144, px(x + 36)),
    { hold: 'R', until: and(ground, X(x + 45)), max: 600 },
  ],
  'svp05-dekho': (x) => [
    standOn(vpN(0), 'the first footprints'),
    hopUntil(and(ground, (w) => w.player.x >= px(x + 15.5)), 'over the first slabs to the island'),
    standOn(vpN(1), 'the island’s own footprints'),
    hopUntil(and(ground, X(x + 28)), 'over the rest'),
    standOn(vpN(2), 'the third footprints: not at the bench'),
    hopUntil(and(ground, X(x + 51)), 'across the long ledge'),
    standOn(vpN(3), 'the fourth footprints: the ledge is a stair going up'),
    hopUntil(and(ground, X(x + 76)), 'up the stair to the landing'),
    { hold: 'R', until: and(ground, X(x + 82)), max: 600, note: 'down off the landing' },
    standOn(vpN(4), 'the last footprints: the long gap'),
    hopUntil(and(ground, X(x + 107)), 'the whole long ledge'),
    { hold: 'R', until: and(ground, X(x + 111)), max: 300 },
  ],
  'svp04-ghat': (x) => [
    { hold: 'R', until: (w) => herdA(w).carrying, max: 900, note: 'past the stall' },
    putDown(herdA, 'put it down at the stall: the herd gathers there'),
    ...boatRide(herdA, boatA, px(x + 17), px(x + 23) + 4),
    { hold: 'R', until: and(ground, X(x + 33.5)), max: 400 },
  ],
  'svp03-nala': (x) => [{ ...crossGaps(), until: (w) => w.player.x > px(x + 34.5) && w.player.onGround, max: 3600, note: 'along the logs, a gap at a time, when the arrow points away' }, { hold: 'R', until: and(ground, X(x + 35.5)), max: 300 }],
  'svp02-chirai': (x) => [
    { hold: 'R', until: (w) => w.player.x >= px(x + 4) + 6 && w.player.onGround, max: 900, note: 'on to the boarding end' },
    {
      policy: (w) => go(toward(w, ((w.flags.halls ?? []) as SawHall[])[0].L + 48, 2)),
      until: (w) => ((w.flags.halls ?? []) as SawHall[])[0].docked,
      max: 2400,
      note: 'this time the middle is what stays',
    },
    { hold: 'R', until: and(ground, X(x + 29)), max: 600 },
  ],
};

/** a policy for each door ending, by kind */
const endingPolicies: Record<string, Policy> = {
  'svp-dweep-gate'(w) {
    const h = w.flags.guard as Herd;
    return h.carrying ? go('') : go('R');
  },
  'svp-frame-door'(w, _m, d) {
    const D = Math.round(d.x / 16);
    if (w.player.cx > px(D - 3)) return go(toward(w, d.x + 8, 1) || 'R');
    const k = ((w.flags as any).framePolicy ??= rootsPolicy([D - 12, D - 8], px(D - 3), '', () => false));
    return k.policy(w);
  },
  'svp-gutter-river'(w, m, d) {
    const D = Math.round(d.x / 16);
    const gx0 = px(D - 8),
      gx1 = px(D - 3);
    const k = wx(w);
    const g = w.flags.gutter as { flood: number };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (p.cx > gx1 + 6) return go(toward(w, d.x + 8, 1) || 'R');
    if (p.y + p.h > FLOOR_Y + 8) {
      // in the gutter: across, and up the far wall
      if (p.onGround && p.x >= gx1 - 16) {
        m.hold = 14;
        return { move: 'R', jump: true };
      }
      return go('R');
    }
    if (p.cx >= gx0 - 4 && !p.onGround) return go('R');
    const clear = !k.raining && g.flood === 0 && k.left > 110;
    if (clear) return go('R');
    return streetPolicy(w);
  },
  'svp-ticket-window'(w, _m, d) {
    const k = w.flags.window as { lk: { open: boolean } };
    if (k.lk.open) return go(toward(w, d.x + 8, 1) || 'R');
    return go(toward(w, d.x - 70, 3));
  },
  'svp-bough-door'(w, m, d) {
    const { flock, b } = w.flags.boughdoor as { flock: Flock; b: Bough };
    const p = w.player;
    if (m.hold > 0) return { move: 'R', jump: true };
    if (!p.onGround && p.cx > b.x0 - 24) return go('R');
    if (w.standing(b.plat.solid)) return go(toward(w, d.x + 8, 1) || 'R');
    if (flock.weight >= 0.95 && p.onGround && p.cx > b.x0 - 24) {
      m.hold = 12;
      return { move: 'R', jump: true };
    }
    return go(toward(w, b.x0 - 15, 2));
  },
  'svp-note-door'(w, _m, d) {
    const vp = w.flags.notedoor as Viewpoint;
    if (vp.everAligned) return go(toward(w, d.x + 8, 1) || 'R');
    return go(toward(w, vp.spot, 2));
  },
  'svp-jetty-guard'(w) {
    const h = w.flags.guard as Herd;
    return h.carrying ? go('') : go('R');
  },
  'svp-board-bridge'(w, _m, d) {
    const b = w.flags.bridge as { state: string; x0: number };
    if (b.state === 'down') return go(toward(w, d.x + 8, 1) || 'R');
    return go(toward(w, b.x0 - 8, 2));
  },
  'svp-timber-stack'(w, _m, d) {
    const st = w.flags.stack as { zone: { x: number; w: number } };
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1) || 'R');
    return go(toward(w, st.zone.x - 28, 2));
  },
};

// ------------------------------------------------------------------ the second attempts and first-timer mistakes of 07 and 10
// 07: the obvious fix of 'sit on the luggage' is 'run to the jetty edge' (svp-bheed, in `fix`); these are the other ways it goes wrong
(mistakes['SVP-07'] ??= []).push({
  what: 'into the trench, straight out again and on to the quay',
  cause: 'svp-jahaz',
  steps: [hopUntil(and(ground, X(14.5)), 'across the luggage'), { hold: 'R', until: inTrench, max: 600 }, { hold: '', ticks: 120, note: 'a moment in the trench' }, climbRight('out again', 25 * 16), { hold: 'R', until: (w) => w.state !== 'play', max: 900, note: 'and on towards the quay' }],
});
actDeath('SVP-07', 'svp07-ghat', 'on to the first ship with everyone else', 'svp-jahaz', (x) => [
  { hold: 'R', until: and(ground, X(x + 4.5)), max: 600, note: 'along the pier' },
  { hold: 'R', jump: 14, until: (w) => w.state !== 'play', max: 1800, note: 'step over to the first ship’s deck, and ride it out' },
]);
actDeath('SVP-07', 'svp07-doosra', 'sit down on the luggage like everyone', 'svp-bheed', (x) => [hopUntil(and(ground, X(x + 11.5)), 'on to the luggage'), { hold: '', until: (w) => w.state !== 'play', max: 2400, note: 'wait for the ship' }]);
actDeath('SVP-07', 'svp07-doosra', 'out of the trench the moment the real call comes', 'svp-bheed', (x) => [
  hopUntil(and(ground, X(x + 12.5)), 'across the luggage'),
  { hold: 'R', until: inTrench, max: 600 },
  { hold: '', until: (w) => hallN(w).called, max: 3600, note: 'in the trench through the false alarm, till the real call' },
  climbRight('out at once, into the crowd', px(x + 26)),
  { hold: 'R', until: (w) => w.state !== 'play', max: 1500, note: 'and on' },
]);
actDeath('SVP-07', 'svp07-teesra', 'sit down on the luggage like everyone, a third time', 'svp-bheed', (x) => [hopUntil(and(ground, X(x + 11.5)), 'on to the luggage'), { hold: '', until: (w) => w.state !== 'play', max: 3000, note: 'wait for the ship' }]);
// the second attempt of 01 to 06: the room (and the acts before) done properly, then a different trap in the next beat
const later = (id: string, act: string, cause: string, then: (x: number) => Step[]) => {
  fix[id] = {
    cause,
    get steps() {
      return atAct(id, act, then);
    },
  };
};
later('SVP-09', 'svp09-pul', 'svp-eent2', () => [{ hold: 'R', until: (w) => w.state !== 'play', max: 900, note: 'across the brick of the cellar' }]);
// 08: the street and the longer street done properly, then the gutter at the door: wait for the rain, then cross it
fix['SVP-08'] = {
  cause: 'svp-nala',
  get steps(): Step[] {
    const def = LEVELS.find((l) => l.id === 'SVP-08')!;
    const out: Step[] = [...ROOM['SVP-08']];
    for (const p of def.parts ?? []) out.push(...actRoutes[p.kind](p.x0));
    return [
      ...out,
      streetUntil(11, 'to the last awning, before the gutter'),
      { hold: '', until: (w) => (w.flags.gutter as { flood: number }).flood > 0.5, max: 4000, note: 'wait there for the rain: the gutter fills' },
      { hold: 'R', until: (w) => w.state !== 'play', max: 900, note: 'and cross it now, the awnings are dry' },
    ];
  },
};
later('SVP-02', 'svp02-chirai', 'svp-kichad', (x) => [
  { hold: 'R', until: (w) => w.player.x >= px(x + 4) + 6 && w.player.onGround, max: 900, note: 'on to the boarding end' },
  { policy: (w) => go(toward(w, hall(w, 0).L + 12, 2)), until: (w) => w.state !== 'play', max: 2400, note: 'and stay on it, as the first log taught' },
]);
later('SVP-03', 'svp03-nala', 'svp-magar2', () => [hopUntil((w) => w.state !== 'play', 'hop the logs')]);
later('SVP-04', 'svp04-ghat', 'svp-hiran2', (x) => [
  { hold: 'R', until: (w) => herdA(w).carrying, max: 900, note: 'past the stall' },
  { hold: 'R', until: X(x + 15.5), max: 600 },
  ...Array.from({ length: 40 }, (): Step => ({ hold: '', jump: 8, ticks: 40, note: 'hopping at the edge to keep warm' })),
]);
later('SVP-05', 'svp05-rassi', 'svp-rassi', (x) => [
  { hold: 'R', until: X(x + 9.4), max: 600 },
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'jump for the boat from the edge' },
]);
later('SVP-06', 'svp06-sanjh', 'svp-kichad2', (x) => [
  { hold: 'R', until: X(x + 3.4), max: 600 },
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'jump for the next cliff, no branch' },
]);
// 10: the second attempt gets through the mill with the food put down, and dies at the creek (a different trap from the blade)
fix['SVP-10'] = {
  cause: 'svp-magar2',
  get steps() {
    return atAct('SVP-10', 'svp10-nadi', () => [hopUntil((w) => w.state !== 'play', 'hop the logs without reading the arrow')]);
  },
};
(mistakes['SVP-10'] ??= []).push({
  what: 'food put down, then ride the middle of the log',
  cause: 'svp-aari',
  steps: [{ hold: 'R', until: (w) => herd0(w).carrying, max: 600 }, putDown(herd0, 'put it down'), board((w) => hall(w, -1), 'on to the log'), { policy: (w) => go(toward(w, hall(w, -1).L + 48, 2)), until: (w) => w.state !== 'play', max: 2400, note: 'the middle of the log' }],
});
actDeath('SVP-10', 'svp10-jad', 'walk the brick floor of the cellar', 'svp-eent2', () => [{ hold: 'R', until: (w) => w.state !== 'play', max: 900, note: 'across the brick' }]);
actDeath('SVP-10', 'svp10-saman', 'sit down on the luggage like everyone', 'svp-bheed', (x) => [hopUntil(and(ground, X(x + 11.5)), 'on to the luggage'), { hold: '', until: (w) => w.state !== 'play', max: 2400, note: 'wait for the ship' }]);
actDeath('SVP-10', 'svp10-ghat', 'carry the food to the edge and hop there waiting for the boat', 'svp-hiran2', (x) => [
  { hold: 'R', until: (w) => herdA(w).carrying, max: 900, note: 'past the stall' },
  { hold: 'R', until: X(x + 15.5), max: 600 },
  ...Array.from({ length: 40 }, (): Step => ({ hold: '', jump: 8, ticks: 40, note: 'hopping at the edge to keep warm' })),
]);

// ------------------------------------------------------------------ the plays that must die in an added act
actDeath('SVP-07', 'svp07-uthao', 'ride the lift up and stay aboard past the last stop', 'svp-uthao', () => [
  { hold: 'R', until: (w) => w.standing(lift(0)(w).plat.solid) && w.player.cx > lift(0)(w).x + 20, max: 900 },
  { hold: '', until: (w) => w.state !== 'play', max: 6000, note: 'stay aboard' },
]);
actDeath('SVP-07', 'svp07-uthao', 'step on the walkway and just stand there', 'svp-uthao', (x) => [
  ...actRoutes['svp07-uthao'](x).slice(0, 5),
  { hold: '', until: (w) => w.state !== 'play', max: 900, note: 'it carries you to the edge of the gap, and over' },
]);
actDeath('SVP-07', 'svp07-uthao', 'take the roof lift down and stay aboard past the ground', 'svp-uthao', (x) => [
  ...actRoutes['svp07-uthao'](x).slice(0, 6),
  { hold: 'R', until: (w) => w.standing(lift(2)(w).plat.solid) && w.player.cx > lift(2)(w).x + 20, max: 900 },
  { hold: '', until: (w) => w.state !== 'play', max: 6000, note: 'stay aboard' },
]);
actDeath('SVP-07', 'svp07-khula', 'run across the bridge without looking at the lights', 'svp-khula', () => [{ hold: 'R', until: (w) => w.state !== 'play', max: 1200, note: 'across the deck' }]);
actDeath('SVP-07', 'svp07-khula', 'start across when the lights begin to flash', 'svp-khula', (x) => [
  { policy: (w) => go(toward(w, px(x + 6) - 20, 3)), until: (w) => bridge(0)(w).phase.name === 'warn' && Math.abs(w.player.cx - (px(x + 6) - 20)) < 8, max: 4000, note: 'wait for the flashing lights' },
  { hold: 'R', until: (w) => w.state !== 'play', max: 1200, note: 'and cross before it lifts' },
]);
actDeath('SVP-09', 'svp09-hauz', 'run across the dry pool to the wall', 'svp-hauz', (x) => [
  { hold: 'R', until: X(x + 7.5), max: 600 },
  { hold: '', until: (w) => w.state !== 'play', max: 2500, note: 'wait at the wall: the water has to go somewhere' },
]);
actDeath('SVP-09', 'svp09-hauz', 'wait for the water on the floor beside the raft', 'svp-hauz', (x) => [
  { hold: 'R', until: X(x + 6.5), max: 600 },
  { hold: '', until: (w) => w.state !== 'play', max: 2500, note: 'wait on the floor by the raft' },
]);
actDeath('SVP-09', 'svp09-nali', 'walk under both arches, the easy way', 'svp-nali', () => [{ hold: 'R', until: (w) => w.state !== 'play', max: 1500, note: 'along the sand, under the arches' }]);
actDeath('SVP-09', 'svp09-nali', 'one arch over, one under, then under both in the next stretch', 'svp-nali2', (x) => [
  ...overArch(x + 8),
  { hold: 'R', until: (w) => w.state !== 'play', max: 2400, note: 'and on under the arches, as the first stretch allowed' },
]);
actDeath('SVP-10', 'svp10-nali', 'walk under both arches, the easy way', 'svp-nali', () => [{ hold: 'R', until: (w) => w.state !== 'play', max: 1500, note: 'along the sand, under the arches' }]);
actDeath('SVP-10', 'svp10-nali', 'one arch over, one under, then under both in the next stretch', 'svp-nali2', (x) => [
  ...overArch(x + 8),
  { hold: 'R', until: (w) => w.state !== 'play', max: 2400, note: 'and on under the arches, as the first stretch allowed' },
]);
actDeath('SVP-08', 'svp08-deewar', 'shelter against the first building you come to, the short shop', 'svp-baarish', () => [
  { policy: (w) => go(toward(w, (wx(w).awnings[7] as unknown as { bx: number; bw: number }).bx + 40, 2)), until: (w) => w.state !== 'play', max: 3000, note: 'in the shadow of the short shop' },
]);
actDeath('SVP-08', 'svp08-deewar', 'the tall house right, then the two-storey one instead of the three', 'svp-baarish2', (x) => [
  streetUntil(8, 'the tall house'),
  { policy: (w) => go(toward(w, (wx(w).awnings[10] as unknown as { bx: number; bw: number }).bx - 20, 2)), until: (w) => w.state !== 'play', max: 3000, note: 'and the nearer, lower one' },
]);
actDeath('SVP-08', 'svp08-bazaar', 'run over the stalls', 'svp-tel', () => [hopUntil((w) => w.state !== 'play', 'hop the counters')]);
actDeath('SVP-08', 'svp08-bazaar', 'climb on in the rest and stay on the right half', 'svp-tel', (x) => [
  ...stallCross(0, x + 4).slice(0, 3),
  { hold: '', until: (w) => w.state !== 'play', max: 1500, note: 'and stay put on the right half' },
]);
actDeath('SVP-06', 'svp06-lehar', 'run and hop the floats without watching', 'svp-lehar', () => [hopUntil((w) => w.state !== 'play', 'hop on')]);
actDeath('SVP-06', 'svp06-lehar', 'across the floats properly, then jump from the island for the far shore', 'svp-lehar', (x) => [
  ...actRoutes['svp06-lehar'](x).slice(0, 3),
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 1200, long: true, note: 'jump from the island for the far shore' },
]);
actDeath('SVP-06', 'svp06-lehar', 'wait for the first float, then hop on without watching the rest', 'svp-lehar', (x) => [
  { hold: 'R', until: X(x + 3.2), max: 600 },
  { hold: '', until: (w) => swell(0)(w).top(0, w.tick + 30) >= FLOOR_Y - 20, max: 1500, note: 'the first float is level' },
  hopUntil((w) => w.state !== 'play', 'then hop on, hop on'),
]);
actDeath('SVP-05', 'svp05-choona', 'hop everything in the cave', 'svp-chuna', () => [hopUntil((w) => w.state !== 'play', 'hop the rock, the drain, on')]);
actDeath('SVP-05', 'svp05-choona', 'wait out the first drip, then hop the wall without waiting', 'svp-chuna2', (x) => [
  ...caveBeat(0, x + 10.6, 12, x + 14.2, x + 16.8, x + 32),
  hopUntil((w) => w.state !== 'play', 'then on, hopping'),
]);
actDeath('SVP-05', 'svp05-rassi', 'run to the edge and jump for the tied-up boat', 'svp-rassi', (x) => [
  { hold: 'R', until: X(x + 9.4), max: 600 },
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'jump for the boat from the edge' },
]);
actDeath('SVP-05', 'svp05-rassi', 'over the first creek by the rope, then run for the second boat and jump from the edge', 'svp-rassi2', (x) => [
  ...ropeCross(0, x + 4, x + 29),
  { hold: 'R', until: X(x + 33.4), max: 600 },
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'and jump for it' },
]);

actDeath('SVP-10', 'svp10-rassi', 'run to the edge and jump for the tied-up boat', 'svp-rassi', (x) => [
  { hold: 'R', until: X(x + 9.4), max: 600 },
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'jump for the boat from the edge' },
]);
actDeath('SVP-10', 'svp10-rassi', 'over the first creek by the rope, then run for the second boat and jump from the edge', 'svp-rassi2', (x) => [
  ...ropeCross(0, x + 4, x + 29),
  { hold: 'R', until: X(x + 33.4), max: 600 },
  { hold: 'R', jump: 20, until: (w) => w.state !== 'play', max: 400, long: true, note: 'and jump for it' },
]);

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['SVP-01', 'SVP-02', 'SVP-03', 'SVP-04', 'SVP-05', 'SVP-06', 'SVP-07', 'SVP-08', 'SVP-09', 'SVP-10'],
};
