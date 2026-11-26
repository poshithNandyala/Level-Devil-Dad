// Proven routes for Sri Vijaya Puram: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import type { SawHall } from '../../src/game/cities/svp/s02';
import type { Creek } from '../../src/game/cities/svp/s03';
import type { Herd, LateBoat } from '../../src/game/cities/svp/s04';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
const px = (t: number) => t * 16;
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
      if (p.onGround && !w.solidAt(p.x + p.w + 6, p.y + p.h + 2, 2, 2)) {
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
}

/** the obvious play per stage, and the cause it must die of */
const naive: Record<string, { steps: Step[]; cause?: string }> = {
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
  fair: ['SVP-02', 'SVP-03', 'SVP-04'],
};
