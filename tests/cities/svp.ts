// Proven routes for Sri Vijaya Puram: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import type { SawHall } from '../../src/game/cities/svp/s02';
import type { Creek } from '../../src/game/cities/svp/s03';
import type { Herd, LateBoat } from '../../src/game/cities/svp/s04';
import type { Viewpoint } from '../../src/game/cities/svp/s05';
import type { Bough, Flock } from '../../src/game/cities/svp/s06';
import type { Crowd, Hall, Ship } from '../../src/game/cities/svp/s07';
import type { Weather } from '../../src/game/cities/svp/s08';

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
  const aws = k.awnings.slice().sort((a, b) => a.x0 - b.x0);
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

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['SVP-02'] = [
    board((w) => hall(w, -1), 'on to the boarding end of the log'),
    stayOnLog((w) => hall(w, -1), 12, 'stay on the end that is left: it rides over'),
    { hold: 'R', until: and(ground, X(31)), max: 600, note: 'off on to the far bank' },
  ];
  lengthen('SVP-02', 0, []);
  S['SVP-03'] = [
    { hold: 'R', until: (w) => (w.flags.creek as Creek).state !== 'sun', max: 900, note: 'wade into the creek: the crocodile slides in after you' },
    { hold: 'L', until: (w) => w.player.x < 197 && w.player.onGround, max: 600, note: 'back to the wall: the arrow has swung to the water' },
    { hold: 'L', jump: 14, until: (w) => w.player.onGround && w.player.y + w.player.h <= 241, max: 200, note: 'up out of the creek on to the bank' },
    hopUntil((w) => w.player.x > 31 * 16 && w.player.onGround, 'the logs are only logs now: hop them'),
  ];
  lengthen('SVP-03', 0, []);
  S['SVP-04'] = [
    { hold: 'R', until: (w) => herd0(w).carrying, max: 600, note: 'past the stall: the fritter is yours, and the herd is up' },
    { hold: 'R', until: X(12.5), max: 300, note: 'well back from the edge' },
    putDown(herd0, 'stand still: Dad puts it down, and the herd goes to it'),
    ...boatRide(herd0, boat0, 20 * 16, 26 * 16 + 4),
    { hold: 'R', until: and(ground, X(31)), max: 400 },
  ];
  lengthen('SVP-04', 0, []);
  S['SVP-05'] = [standOn(vp0, 'on the footprints by the bench: the view lines up'), hopUntil(and(ground, X(25)), 'across the ledge while it holds')];
  lengthen('SVP-05', 0, []);
  S['SVP-06'] = [...boughCross(fl0, bg0, 172, 144, 24 * 16), { hold: 'R', until: and(ground, X(31)), max: 300 }];
  lengthen('SVP-06', 0, []);
  S['SVP-07'] = [
    hopUntil(and(ground, X(14.5)), 'across the luggage, no stopping'),
    { hold: 'R', until: inTrench, max: 600, note: 'down into the luggage trench' },
    { hold: '', until: (w) => crowd0(w).x > 27 * 16 && crowd0(w).on, max: 2400, note: 'in the trench while the ship is called and the crowd goes over' },
    climbRight('out behind the crowd', 25 * 16),
    { hold: 'R', until: and(ground, X(31)), max: 300 },
  ];
  lengthen('SVP-07', 0, []);
  S['SVP-08'] = [streetUntil(2, 'awning to awning, in the lee of the rain that is coming')];
  lengthen('SVP-08', 0, []);
}

/** the obvious play per stage, and the cause it must die of */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
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
const actRoutes: Record<string, (x: number) => Step[]> = {
  'svp08-gali': () => [streetUntil(6, 'the longer street, awning to awning')],
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
    hopUntil(and(ground, X(x + 51)), 'three slabs and across'),
    { hold: 'R', until: and(ground, X(x + 55)), max: 300 },
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
    const clear = !k.raining && g.flood === 0 && k.left > 150;
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

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['SVP-02', 'SVP-03', 'SVP-04', 'SVP-05', 'SVP-06', 'SVP-07', 'SVP-08'],
};
