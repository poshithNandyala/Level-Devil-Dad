import { gustNOn, gustNLeft, cascadeN, dry, windOn, Step, X, XL, ground, and, done, onVeh, vehAt, veh, plat, floodLevel, float, thingOf, rollerNear, gustOn, gustLeft, arcOn, arcLeft, blinkers, blinkerLeft, arcNOn, arcNLeft, shotAhead, or, floaterOf, riderNear, quiet, shotNear, geyserN } from './runner';
import type { World } from '../src/game/world';
import { COURSES, TOUR } from '../src/game/levels/tour';
import type { CityId } from '../src/game/constants';
import type { Thing } from '../src/game/entities/traps';
import { LEVEL_BY_ID } from '../src/game/levels';
import { exitPolicy, longRun, solveChunk } from './chunks';
import { DT } from '../src/game/constants';
import { swim, skimmer, kicker } from './moves';
import { Jelly } from '../src/game/levels/kvt';
import { westSolutions } from './west';
import { eastSolutions, EAST_NAIVE } from './east';
const px16 = (t: number) => t * 16;
/** a tile group that has moved away (fallen, slid) is back home and still */
const groupBack = (letter: string) => (w: World) => {
  const g = groupAt(w, letter) as unknown as { state: string; atRest: boolean };
  return g.state === 'rest' && g.atRest;
};
/** jellyfish i is drifting down, well under the surface: room to swim over it */
const jellyLow = (i: number) => (w: World) => {
  const j = w.entities.filter((e) => e instanceof Jelly)[i] as Jelly;
  const k = ((((w.tick * DT + j.phase) % j.period) + j.period) % j.period) / j.period;
  return k >= 0.28 && j.y > 200;
};
/** a platform starting `x` px is a comfortable tap-jump ahead */
/** no cannonball ahead at or above Dad's level (HYD-06): safe to jump up a step */
const ballClear = (ahead: number, dueWithin = 0) => (w: World) =>
  !w.entities.some((e: any) => e.kind === 'cannonball' && e.alive && e.x + 12 > w.player.x - 6 && e.x < w.player.x + ahead && e.y < w.player.y + w.player.h + 2) &&
  !((w.flags.balls ?? []) as number[]).some((at) => at - w.tick * DT < dueWithin);
/** no bat in the way of a jump (AMR-07): none from just behind Dad to `ahead` px in front */
const batClear = (ahead: number) => (w: World) => !w.entities.some((e: any) => e.kind === 'bat' && e.alive && e.x + 14 > w.player.x - 20 && e.x < w.player.x + ahead);
type Car = { t: { cx: number; solid: { x: number; y: number; w: number } }; s: number; crashed: boolean };
const cars = (w: World) => (w.flags.cars ?? []) as Car[];
/** a cable car will start up the rope within about a second (AMR-08) */
const carSoon = (w: World) => {
  const cs = cars(w);
  const last = cs[cs.length - 1];
  return !!last && last.s >= 52 * 1.0 && last.s <= 52 * 1.35;
};
/** a cable car low enough to jump on, just ahead of Dad */
const carNear = (w: World) => cars(w).find((c) => !c.crashed && c.s < 60 && c.t.solid.x - (w.player.x + 10) >= -6 && c.t.solid.x - (w.player.x + 10) <= 14) ?? null;
let target: Car | null = null;
const carRiding = (w: World) => cars(w).find((c) => w.standing(c.t.solid as never)) ?? null;
/** the pour (Arc) is off now and stays off for `need` seconds */
const arcCalm = (w: World, need: number) => {
  const a = w.entities.find((e: any) => e.schedule && e.ax !== undefined) as any;
  if (!a) return true;
  const s0 = a.schedule as { period: number; on: number; phase?: number };
  for (let k = 0; k <= need; k += 1 / 30) if ((w.tick / 120 + k + (s0.phase ?? 0)) % s0.period < s0.on) return false;
  return true;
};
/** the tile group with this map letter */
const groupAt = (w: World, letter: string) => w.entities.find((e: any) => e.letter === letter) as unknown as { state: string; solid: { x: number } };
/** ride a running-lights pulse on one bulb string (BLR-06): stay near its centre */
const pulseAt = (w: World, row: 'lower' | 'upper') => {
  const ps = (w.flags[row] ?? []) as { c: number; v: number }[];
  const cx = w.player.x + 5;
  let best: { c: number; v: number } | null = null;
  for (const q of ps) if (!best || Math.abs(q.c - cx) < Math.abs(best.c - cx)) best = q;
  return best;
};
const ride = (row: 'lower' | 'upper') => (w: World): 'L' | 'R' | '' => {
  const q = pulseAt(w, row);
  if (!q) return '';
  const cx = w.player.x + 5;
  return cx < q.c - 2 ? 'R' : cx > q.c + 8 ? 'L' : '';
};
/** hop on to something moving: steer over its middle, then drop */
const hopOn = (get: (w: World) => { solid: { x: number; w: number } }, dir: 'R' | 'FWD' = 'R'): Step[] => [
  { hold: dir, jump: 12, ticks: 12 },
  { hold: dir, until: (w) => w.player.onGround || w.player.x + 5 >= get(w).solid.x + get(w).solid.w / 2 - 2, max: 120 },
  { hold: '', until: ground, max: 200 },
];
/** stay near the middle-right of a bobbing board, leaning into the wind */
const balance = (board: (w: World) => { solid: { x: number } }) => (w: World): 'L' | 'R' | '' => {
  if (windOn(w) < 0) return 'R';
  const b = board(w).solid.x;
  return w.player.x < b + 15 ? 'R' : w.player.x > b + 20 ? 'L' : '';
};
const reach = (w: World, x: number) => x - (w.player.x + 10) >= 4 && x - (w.player.x + 10) <= 36;
/** no crow ahead within reach of the next jump */
const noCrow = (w: World) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 24 && e.x - w.player.x < 110);

/** the first thing of this kind (rider, roller or thing) */
const thingOf2 = (w: World, kind: string) => w.entities.find((e: any) => e.kind === kind && e.alive !== false) as unknown as { x: number; w: number; cx: number } | undefined;
/** the mist (Cloud) is gone now and stays gone for `need` seconds */
const mistClear = (w: World, need: number) => {
  const c = w.entities.find((e: any) => e.zone && e.color && e.schedule) as any;
  if (!c) return true;
  const s0 = c.schedule as { period: number; on: number; phase?: number };
  for (let k = 0; k <= need; k += 1 / 30) if ((((w.tick / 120 + k + (s0.phase ?? 0)) % s0.period) + s0.period) % s0.period < s0.on) return false;
  return true;
};

/** Stage 1 of every city: the welcome tour, along that city's own course (src/game/levels/tour.ts) */
const ferryOf = (w: World) => w.entities.find((e: any) => e.ferry) as unknown as Thing;
const tourRun = (city: CityId): Step[] => {
  const steps: Step[] = [];
  const hop = (at: number, note: string, ticks = 12): void => {
    steps.push({ hold: 'R', until: X(at), max: 900 }, { hold: 'R', jump: ticks, ticks, note }, { hold: 'R', until: ground, max: 300 });
  };
  for (const s of COURSES[city]) {
    if (s.k === 'wall') hop(s.x - 1.6, 'a low wall', (s.w ?? 1) > 1 ? 14 : 12);
    else if (s.k === 'ditch') hop(s.x - 1.6, 'a shallow ditch', s.w > 2 ? 14 : 12);
    else if (s.k === 'parked') {
      steps.push({ hold: 'R', until: X(s.x - 2.2), max: 900 }, { hold: 'R', jump: 14, ticks: 14, note: 'hop the parked ride' }, { hold: 'R', until: (w) => w.player.onGround && w.player.y > 220, max: 400 });
    } else if (s.k === 'posts') for (let i = 0; i < s.n; i++) hop(s.x + 3 * i - 1.4, 'a post');
    else if (s.k === 'steps') for (let i = 0; i < s.n; i++) hop(s.x + i * s.run - 1.3, 'a step up');
    else if (s.k === 'stones') {
      hop(s.x - 0.9, 'onto the first stone', 10);
      for (let i = 0; i < s.n; i++) hop(s.x + 3.1 + 4 * i, 'the next stone', 10);
    } else if (s.k === 'ferry') {
      const sw = 3;
      steps.push(
        { hold: 'R', until: X(s.x - 1.2), max: 900 },
        { hold: '', until: (w) => { const f = ferryOf(w); return f.state === 'rest' && f.x === s.x * 16; }, max: 900, note: 'wait for the shuttle' },
        { hold: 'R', until: (w) => w.standing(ferryOf(w).solid) && w.player.x >= ferryOf(w).x + 10, max: 200, note: 'step aboard' },
        { hold: '', until: (w) => { const f = ferryOf(w); return f.state === 'rest' && f.x === (s.x + s.w - sw) * 16; }, max: 900, note: 'ride across' },
        { hold: 'R', until: X(s.x + s.w + 0.4), max: 200, note: 'step off' },
      );
    }
  }
  steps.push(
    { hold: 'R', until: X(TOUR.deck[0] - 1.6), max: 900 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the deck' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: done, max: 900 },
  );
  return steps;
};

/** up on to a 3-tile ledge at tile column `tx`, easing off over its middle (KVT-05's lighthouse steps) */
function stairHop(tx: number, dir: 'L' | 'R', note: string): Step[] {
  const mid = (tx + 1.5) * 16 - 5;
  return [
    { hold: dir, jump: 14, ticks: 14, note },
    { hold: dir, until: (w) => w.player.onGround || (dir === 'R' ? w.player.x >= mid - 3 : w.player.x <= mid + 3), max: 120 },
    { hold: '', until: ground, max: 200 },
  ];
}
/** TVM-05's portcullis at tile column `tx` (found by place: the hidden one sorts first, being drawn behind the walls) */
const gateNear = (w: World, tx: number): any => w.entities.find((e: any) => e.kind === 'gate' && Math.abs(e.x - (tx * 16 + 8)) < 6);
/** TVM-06's fishing nets, in order along the promenade */
const netNo = (i: number) => (w: World): any => w.entities.filter((e: any) => e.kind === 'net')[i];
/** a dad who hops anything with wings the moment it's close (the crow lesson), however high it flies */
function hopAnyBird(): (w: World) => { move: 'L' | 'R' | ''; jump: boolean } {
  let hold = 0,
    last = -1;
  return (w) => {
    if (w.tick < last) hold = 0;
    last = w.tick;
    if (hold > 0) {
      hold--;
      return { move: '', jump: true };
    }
    const p = w.player;
    const gs: any = p.onGround ? p.groundSolid : null;
    const pv = p.vx + (gs ? (gs.velX ?? 0) : 0);
    const bird = w.entities.some((e: any) => e.alive && (e.kind === 'crow' || e.kind === 'parunthu') && e.vx < 0 && e.x - (p.x + p.w) > -4 && (e.x - (p.x + p.w)) / (-e.vx + Math.max(0, pv)) <= 0.13);
    if (bird && p.onGround) {
      hold = 11;
      return { move: '', jump: true };
    }
    return { move: '', jump: false };
  };
}

/** Known-good input scripts. If a change breaks one, a stage became unbeatable. */
export const SOLUTIONS: Record<string, Step[]> = {
  'TVM-02': [
    { hold: '', until: (w) => w.flags.bus === 'wait', max: 600, note: 'the bus backs up to the stop' },
    { hold: 'R', until: X(2.4) },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the roof' },
    { hold: 'R', until: (w) => w.player.onGround || w.player.x >= thingOf(w, 'redbus').solid.x + 6, max: 100 },
    { hold: '', until: ground, max: 200 },
    { hold: '', dodge: 60, until: (w) => thingOf(w, 'redbus').solid.x >= px16(26), max: 2000, note: 'hop the crows; never jump under a flyover' },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 46, max: 120, note: 'ride in the middle of the roof' },
    { hold: '', until: (w) => w.flags.bus === 'go2' && w.player.stun === 0, max: 2000, note: 'one bell, two bells: the middle stays on' },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 40, max: 120, note: 'back to the middle' },
    { hold: '', dodge: 60, until: (w) => thingOf(w, 'redbus').solid.x >= px16(50), max: 2000, note: 'ride the middle' },
    { hold: 'R', dodge: 60, until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 70, max: 200, note: 'to the front before the second flyover' },
    { hold: '', dodge: 60, until: (w) => w.flags.bus === 'end', max: 2000 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 78, max: 200, note: 'run to the front at the last stop' },
    { hold: 'R', jump: 12, ticks: 12, note: 'off before it turns back' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400 },
    { hold: 'R', until: done, max: 300 },
  ],
  'TVM-03': [
    { hold: 'R', until: X(8.3) },
    { hold: 'R', jump: 12, ticks: 12, note: 'jump the steam (spikes inside)' },
    { hold: 'R', until: and(ground, X(12.4)), max: 300 },
    { hold: '', until: (w) => arcCalm(w, 1.05), max: 600, note: 'wait for the pour to stop' },
    { hold: 'R', until: X(22.4), max: 300 },
    { hold: '', dodge: 40, until: (w) => !w.entities.some((e: any) => e.kind === 'tumbler' && e.alive && e.vx < 0 && e.x < px16(24) + 4), max: 300, note: 'let a glass fall off the end' },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the counter' },
    { hold: 'R', dodge: 46, until: X(29.8), max: 600, note: 'hop the glasses' },
    { hold: 'R', until: and(ground, X(29.8)), max: 200 },
    { hold: 'R', jump: 45, ticks: 45, long: true, note: 'off before the end drops' },
    { hold: 'R', until: and(ground, X(37.2)), max: 300 },
    { hold: '', until: (w) => { const m = (w.tick / 120) % 2.4; return m >= 0.7 && m < 0.76; }, max: 900, note: 'follow the wave of sprays as it moves on' },
    { hold: 'R', until: X(49.3), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the painted floor, long: spikes come up where a hop lands' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.entities.some((e: any) => e.kind === 'scooter' && e.alive && e.x > w.player.x - 70), max: 600, note: 'a scooter comes up behind' },
    { hold: '', dodge: 60, until: (w) => !w.entities.some((e: any) => e.kind === 'scooter' && e.alive && e.x < w.player.x + 14), max: 400, note: 'stop and hop it' },
    { hold: '', until: ground, max: 100 },
    { hold: 'R', dodge: 60, until: (w: World) => w.flags.twist === 'swapped', max: 900, note: 'and hop the one coming the other way' },
    { hold: 'L', until: XL(74.1), max: 300, note: 'the door ran back' },
    { hold: 'L', jump: 12, ticks: 12, note: 'hop the broken glasses on the way back' },
    { hold: 'L', until: done, max: 300 },
  ],
  'TVM-04': [
    { hold: 'R', until: X(6.05), note: 'the first coconut drops ahead' },
    { hold: '', until: rollerNear(40), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the roll' },
    { hold: 'R', until: and(ground, X(12.3)) },
    { hold: '', jump: 6, ticks: 50, note: 'little hop to bait the gap coconut' },
    { hold: 'R', until: and(ground, X(14.2)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the gap' },
    { hold: 'R', until: and(ground, X(22.05)), note: 'last palm' },
    { hold: '', until: rollerNear(40), max: 400 },
    { hold: 'R', jump: 12, ticks: 30, note: 'hop roll one' },
    { hold: '', until: rollerNear(40), max: 400 },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop roll two' },
    { hold: 'R', until: and(ground, X(32.8)), max: 400, note: 'the palm by the river crashes down' },
    { hold: '', until: (w) => thingOf(w, 'log').state === 'rest' && thingOf(w, 'log').solid.y === 228, max: 200 },
    { hold: 'R', until: X(34.6), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the trunk' },
    { hold: 'R', dodge: 50, until: and(ground, X(47)), max: 400, note: 'run: it sinks (hop the far coconut)' },
    { hold: 'R', until: X(49.6), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the fronds: a coir pit under them' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(55.1), max: 400 },
    { hold: '', until: (w) => w.entities.some((e: any) => e.kind === 'coconut' && e.x >= px16(58) && e.x < px16(59) && e.state !== 'rest'), max: 400, note: 'wind: wait for the wave to start' },
    { hold: '', ticks: 34 },
    { hold: 'R', until: X(76.6), max: 600, note: 'follow behind the wave' },
    { hold: '', jump: 6, ticks: 40, note: 'a little hop: the far bank backs away' },
    { hold: '', until: groupBack('k'), max: 400, note: 'and creeps back' },
    { hold: 'R', jump: 12, ticks: 12, note: 'now over the gap' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'swapped', max: 900 },
    { hold: 'L', until: done, max: 600, note: 'the door jumped behind you' },
  ],
  'KVT-02': [
    { hold: 'R', until: X(2.9) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the jetty' },
    { hold: 'R', until: and(ground, X(9.8)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the rotten plank' },
    { hold: 'R', until: and(ground, X(14.3)), note: 'the boat sees you and leaves' },
    { hold: '', until: (w) => w.flags.sailed && thingOf(w, 'odam').x <= 300 && thingOf(w, 'odam').state === 'rest', max: 900, note: 'wait for it to come back' },
    { hold: 'R', until: done, note: 'step aboard' },
  ],
  'KVT-03': [
    { hold: 'R', until: X(6.1) },
    { hold: '', until: (w) => blinkers(w)[0].on && blinkerLeft(w, 0) > 1.3, max: 600, note: 'beam on the first step' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(9.9)) },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(13.9)) },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(17.9)) },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(21.9)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'to the island' },
    { hold: 'R', until: and(ground, X(27.9)) },
    { hold: 'R', jump: 20, ticks: 20, long: true, note: 'over the fake door' },
    { hold: 'R', until: done },
  ],
  'CHN-02': [
    { hold: 'R', until: X(6.5) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the first pots' },
    { hold: 'R', until: and(ground, X(10.1)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'skip pot number three' },
    { hold: 'R', until: and(ground, X(14.6)) },
    { hold: '', until: (w) => w.player.onGround && !arcOn(w) && arcLeft(w) > 0.7, max: 600, note: 'wait for the spray to stop' },
    { hold: 'R', until: X(19.2) },
    { hold: 'R', jump: 14, ticks: 14, note: 'onto the lorry' },
    { hold: 'R', until: and(ground, X(24.6)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'jump off the lorry, over the spikes, into the door' },
    { hold: 'R', until: done, max: 300 },
  ],
  'CHN-03': [
    { hold: 'R', until: and(ground, X(12.2)), max: 400, note: 'down the stairs' },
    { hold: 'R', jump: 10, ticks: 10, note: 'onto the drum, now' },
    { hold: '', until: (w) => w.standing(floaterOf(w).solid), max: 200 },
    { hold: '', until: (w) => floaterOf(w).solid.y <= 80, max: 600, note: 'float up' },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the balcony' },
    { hold: 'R', until: done },
  ],
  'CHN-04': [
    { hold: 'R', until: X(10.4) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the shady ledge' },
    { hold: 'R', until: and(ground, X(16.8)), note: 'do not stop here' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(20.6)) },
    { hold: '', until: (w) => arcNOn(1)(w) && arcNLeft(w, 1) > 0.8, max: 600, note: 'high stream on: walk under it' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400, note: 'the shutter slams, wait for it' },
    { hold: 'R', until: done, max: 300 },
  ],
  'CHN-05': [
    { hold: 'R', until: or(shotAhead(60), X(26.6)), max: 900 },
    { hold: 'R', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'R', until: or(shotAhead(60), X(26.6)), max: 900 },
    { hold: 'R', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'R', until: or(shotAhead(60), X(26.6)), max: 900 },
    { hold: 'R', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'R', until: or(shotAhead(60), X(26.6)), max: 900 },
    { hold: 'R', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'R', until: or(shotAhead(60), X(26.6)), max: 900 },
    { hold: 'R', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'R', until: X(26.7), max: 900 },
    { hold: 'L', until: or(shotNear(55), XL(9.6)), max: 900 },
    { hold: 'L', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'L', until: or(shotNear(55), XL(9.6)), max: 900 },
    { hold: 'L', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'L', until: or(shotNear(55), XL(9.6)), max: 900 },
    { hold: 'L', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'L', until: or(shotNear(55), XL(9.6)), max: 900 },
    { hold: 'L', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'L', until: or(shotNear(55), XL(9.6)), max: 900 },
    { hold: 'L', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'L', until: or(shotNear(55), XL(9.6)), max: 900 },
    { hold: 'L', jump: 12, ticks: 22, note: 'hop the kite' },
    { hold: 'L', until: done, max: 900, note: 'the real door, back in the shade' },
  ],
  'PDY-02': [
    { hold: 'R', until: X(8.2) },
    { hold: '', until: and(ground, quiet(0)), max: 600 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(12.2)), max: 200 },
    { hold: '', until: and(ground, quiet(1)), max: 600 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(16.2)), max: 200 },
    { hold: '', until: and(ground, quiet(2)), max: 600 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(20.2)), max: 200 },
    { hold: '', until: and(ground, quiet(3)), max: 600, note: 'wait for the second sneeze' },
    { hold: 'R', jump: 14, ticks: 14 },
    { hold: 'R', until: done, max: 400 },
  ],
  'PDY-03': [
    { hold: 'R', until: X(8.6) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the scooter' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'straight on to the awning' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up on the wall' },
    { hold: 'R', until: and(ground, X(26.3)), max: 600, note: 'down and run' },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the flower pot' },
    { hold: 'R', until: done, max: 300 },
  ],
  'PDY-04': [
    { hold: 'R', until: X(9.4) },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the first socket' },
    { hold: 'R', until: and(ground, X(13.4)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(17.4)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: done, max: 600, note: 'the last bollard is the lift' },
  ],
  'PDY-05': [
    { hold: 'R', until: X(13.05) },
    { hold: '', ticks: 460, note: 'let the boat pass, wait for the bridge to close' },
    { hold: 'R', until: rollerNear(46), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the coconut cart' },
    { hold: 'R', until: and(ground, X(26.6)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'the loose cobble again' },
    { hold: 'R', until: done, max: 300 },
  ],
  'AMR-02': [
    { hold: 'R', until: X(5.6) },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the first chilli heap' },
    { hold: 'R', until: and(ground, X(14.0)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the spikes, into the last heap' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: (w) => w.player.vx > 300, max: 200, note: 'ACHOO' },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: done, max: 600 },
  ],
  'AMR-03': [
    { hold: 'R', until: X(14.1), note: 'walk across, stop on the pier' },
    { hold: '', until: (w) => w.tick >= 356, max: 600, note: 'gate four is back up' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400, note: 'the shutter slams, wait for it' },
    { hold: 'R', until: done, max: 300 },
  ],
  'AMR-04': [
    { hold: 'R', until: X(7.2) },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: done, max: 600 },
  ],
  'AMR-05': [
    { hold: 'R', until: X(4.5) },
    { hold: 'R', jump: 12, ticks: 12, note: 'hop the drain' },
    { hold: 'R', until: and(ground, X(9.6)), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the island' },
    { hold: 'FWD', until: ground, max: 200 },
    { hold: 'FWD', until: or(rollerNear(34), X(26)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 22, note: 'hop the punugulu' },
    { hold: 'FWD', until: or(rollerNear(34), X(26)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 22, note: 'hop the punugulu' },
    { hold: 'FWD', until: or(rollerNear(34), X(26)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 22, note: 'hop the punugulu' },
    { hold: 'FWD', until: or(rollerNear(34), X(26)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 22, note: 'hop the punugulu' },
    { hold: 'FWD', until: or(rollerNear(34), X(26)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 22, note: 'hop the punugulu' },
    { hold: 'FWD', until: or(rollerNear(34), X(26)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 22, note: 'hop the punugulu' },
    { hold: 'FWD', until: and(ground, X(25.6)), max: 900 },
    { hold: 'FWD', jump: 12, ticks: 12, note: 'spikes before the door' },
    { hold: 'FWD', until: done, max: 300 },
  ],
  'TVM-06': [
    { hold: 'R', until: X(4.1), dodge: 1 },
    { hold: '', until: (w) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 20), max: 600, dodge: 1, note: 'hop the crow' },
    { hold: '', until: (w) => (w.flags.net0 ?? 0) >= 0.55 && noCrow(w), max: 900, dodge: 44 },
    ...hopOn(netNo(0)),
    { hold: '', until: (w) => (w.flags.net1 ?? 0) >= 0.55 && w.player.onGround && noCrow(w), max: 900, dodge: 44 },
    ...hopOn(netNo(1)),
    { hold: '', until: (w) => (w.flags.net2 ?? 0) >= 0.55 && w.player.onGround && noCrow(w), max: 900, dodge: 44 },
    ...hopOn(netNo(2)),
    { hold: '', until: (w) => (w.flags.net3 ?? 0) >= 0.55 && w.player.onGround && noCrow(w), max: 900, dodge: 44 },
    ...hopOn(netNo(3)),
    { hold: '', until: (w) => (w.flags.net4 ?? 0) >= 0.55 && w.player.onGround && noCrow(w), max: 900, dodge: 44 },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the last net' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 40, ticks: 40, long: true, note: 'it dips at once: straight off to the jetty' },
    { hold: 'R', until: and(ground, X(33.6)), max: 400 },
    ...hopOn((w) => thingOf(w, 'odam', 0)),
    ...hopOn((w) => thingOf(w, 'odam', 1)),
    ...hopOn((w) => thingOf(w, 'odam', 2), 'R'),
    { hold: 'R', jump: 12, ticks: 12, note: 'off the boats on to the jetty' },
    { hold: 'R', until: and(ground, X(50.9)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'spikes in the boards' },
    { hold: 'R', until: ground, max: 300 },
    { hold: '', dodge: 50, until: (w) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 20), max: 600, note: 'hop the second crow' },
    { hold: 'R', until: and(ground, X(57.2)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'spikes right at the door' },
    { hold: 'R', until: done, max: 300 },
  ],
  'TVM-07': [
    { hold: 'R', until: X(5.6), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'a spike on the road' },
    { hold: 'R', until: (w) => w.flags.reverse === 1, max: 900, dodge: 1, note: 'hop the jeep coming down' },
    { hold: '', until: (w) => { const j = thingOf2(w, 'jeep'); return !!j && j.x > w.player.x + 12 && w.player.onGround; }, max: 600, dodge: 1, note: 'it backs up: stop and hop it' },
    { hold: 'R', until: X(33.4), max: 600 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up the first terrace' },
    { hold: 'R', until: and(ground, X(39.4)), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'the middle terrace' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(43.6), max: 100 },
    { hold: 'R', jump: 14, ticks: 14, note: 'straight on: it gives way' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(46.6), max: 200 },
    { hold: '', until: (w) => w.entities.some((e: any) => e.kind === 'boulder' && e.alive && e.y > 100 && e.x - (w.player.x + 10) <= 20), max: 900, note: 'let the landslide boulder come to you' },
    { hold: '', jump: 34, ticks: 34, long: true, note: 'a big jump over it' },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: X(51.4), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'up on the ridge' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(55.0), max: 300 },
    { hold: '', until: (w) => mistClear(w, 1.1), max: 900, note: 'wait for the mist to lift' },
    { hold: 'R', until: X(56.6), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'spike pit one' },
    { hold: 'R', until: and(ground, X(60.6)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'spike pit two' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(68.2), max: 300 },
    { hold: 'R', jump: 14, ticks: 14, note: 'over the first rock as soon as it lands' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w) => !!thingOf(w, 'boulder', 1), max: 200 },
    { hold: '', until: (w) => thingOf(w, 'boulder', 1)?.state === 'landed', max: 300, note: 'the next one falls just ahead: let it' },
    { hold: 'R', until: and(ground, X(72.8)), max: 200 },
    { hold: 'R', jump: 14, ticks: 14, note: 'over the second rock' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(80.9), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, note: 'leap past the step: it drops if you land on it' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400 },
    { hold: 'R', until: done, max: 300 },
  ],
  'TVM-08': [
    { hold: 'R', until: X(5.6) },
    { hold: '', until: (w) => w.player.onGround && thingOf(w, 'snakeboat').x > px16(5) + 2, max: 300, note: 'on the boat; off it goes' },
    { hold: '', until: (w) => px16(22) - (w.player.x + 10) <= 22, max: 1500, dodge: 1, note: 'ride towards the first footbridge, hop the crow' },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on to the bridge' },
    { hold: 'R', until: X(24.2), max: 300 },
    { hold: '', until: ground, max: 200, note: 'drop back on the boat' },
    { hold: '', until: (w) => px16(36) - (w.player.x + 10) <= 44, max: 900 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'the tall bridge: hold jump' },
    { hold: 'R', until: X(38.2), max: 300 },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: (w) => w.player.x > px16(56) + 2, max: 900, dodge: 1, note: 'hop the crow; under the spiky bridge, no jumping' },
    { hold: '', until: (w) => px16(64) - (w.player.x + 10) <= 22, max: 900 },
    { hold: 'R', jump: 12, ticks: 12, note: 'the low bridge after it: do hop this one' },
    { hold: 'R', until: X(66.2), max: 300 },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: (w) => thingOf(w, 'snakeboat').x >= w.flags.boatEnd - 0.5, max: 1500, dodge: 1, note: 'hop the crows, ride to the finish' },
    { hold: 'R', until: and(ground, X(87.0)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'spikes in the jetty' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(91.4), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'and at the door: jump in' },
    { hold: 'R', until: done, max: 300 },
  ],
  'KVT-04': [
    { hold: 'R', until: X(5.4) },
    { hold: 'R', jump: 12, ticks: 12, note: 'runway light one' },
    { hold: 'R', until: and(ground, X(10.4)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'runway light two' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.entities.some((e: any) => e.kind === 'jeep' && e.x + 40 < w.player.x - 4), max: 600, dodge: 50, note: 'hop the baggage tug' },
    { hold: 'R', until: and(ground, X(21.4)), max: 600 },
    { hold: '', until: (w) => !gustOn(w) && gustLeft(w) > 1.3, max: 600, note: 'wait for the propellers to pause' },
    { hold: 'R', until: X(22.4), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'runway light three' },
    { hold: 'R', until: done, max: 300 },
  ],
  'KVT-05': [
    { hold: 'R', until: X(7.0), max: 300, dodge: 40 },
    { hold: '', until: (w) => thingOf(w, 'odam').x <= px16(10) + 3 && !w.entities.some((e: any) => e.kind === 'tuna' && e.alive && e.x > w.player.x - 30), max: 900, dodge: 40, note: 'wait for the boat, back from the end of the pier' },
    { hold: 'R', jump: 14, ticks: 14, note: 'on to the boat' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', ticks: 4 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'odam').x + 24, max: 200, note: 'to the front of the boat' },
    { hold: '', until: (w) => thingOf(w, 'odam').x >= px16(17.3), max: 900 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the shore' },
    { hold: 'R', until: and(ground, X(22.2)), max: 300 },
    ...stairHop(24, 'R', 'first step'),
    { steer: (w) => (w.player.x < px16(25.9) ? 'R' : w.player.x > px16(26.2) ? 'L' : ''), until: (w) => w.player.x >= px16(25.9) && w.player.x <= px16(26.2), max: 120, note: 'under the next step' },
    { hold: '', ticks: 8 },
    { hold: '', until: (w) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 30), max: 600, note: 'let the gull pass' },
    { hold: '', jump: 14, ticks: 14, note: 'second step, straight up' },
    { hold: '', until: ground, max: 200 },
    { hold: '', jump: 14, ticks: 14, note: 'third step, straight up' },
    { hold: '', until: ground, max: 200 },
    { hold: '', ticks: 8 },
    { hold: '', until: (w) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 30), max: 600, note: 'let the next gull pass' },
    { hold: '', jump: 14, ticks: 14, note: 'top of the lighthouse' },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: done, max: 300 },
  ],
  'CHN-06': [
    { hold: 'R', until: X(6.6) },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the first jasmine string' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'quick, it snaps' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'off the drain' },
    { hold: 'R', until: and(ground, X(17.4)), max: 300 },
    { hold: '', until: (w) => !gustOn(w) && gustLeft(w) > 0.9, max: 600, note: 'wait for the crowd to settle' },
    { hold: 'R', until: X(20.2), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the gap between surges' },
    { hold: 'R', until: and(ground, X(24.2)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the petals' },
    { hold: 'R', until: done, max: 400 },
  ],
  'CHN-07': [
    { hold: 'R', until: X(5.0) },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the first doll' },
    { hold: 'R', until: (w) => w.player.vy < -300, max: 200, note: 'boing' },
    { hold: 'R', until: X(11.4), max: 200 },
    { hold: '', until: (w) => w.player.vy < -300, max: 200 },
    { hold: 'R', until: X(15.2), max: 200 },
    { hold: '', until: (w) => w.player.vy < -300, max: 200 },
    { hold: 'R', until: X(19.4), max: 200 },
    { hold: '', until: (w) => w.player.vy < -300, max: 200 },
    { hold: 'R', until: (w) => w.player.vy < -300, max: 200, note: 'keep holding: the last doll steps aside' },
    { hold: 'R', until: done, max: 400 },
  ],
  'CHN-08': [
    { hold: 'R', until: X(4.6) },
    { hold: '', until: and(ground, quiet(0, 0.55)), max: 600, note: 'between the waves' },
    { hold: 'R', until: X(13.6), max: 300, note: 'on to the middle span (the train is behind)' },
    { hold: '', until: (w) => thingOf(w, 'slab').y <= 137, max: 400, note: 'up it goes' },
    { hold: '', until: (w) => thingOf(w, 'slab').y >= 191.5, max: 600, note: 'and down again' },
    { hold: 'R', until: X(22.6), max: 300 },
    { hold: '', until: and(ground, quiet(1, 0.5)), max: 600 },
    { hold: 'R', until: X(25.0), max: 300 },
    { hold: '', until: and(ground, quiet(2, 0.9)), max: 600 },
    { hold: 'R', until: X(26.4), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'spikes before the door' },
    { hold: 'R', until: done, max: 300 },
  ],
  'PDY-06': [
    { hold: 'R', until: X(4.6) },
    { hold: '', until: (w) => (w.flags.dryLeft ?? 0) >= 0.9, max: 600, note: 'wait for low tide' },
    { hold: 'R', until: X(7.9), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'out of the dip' },
    { hold: 'R', until: and(ground, X(10.6)), max: 300 },
    { hold: '', until: (w) => (w.flags.dryLeft ?? 0) >= 0.9, max: 600 },
    { hold: 'R', until: X(13.9), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(16.6)), max: 300 },
    { hold: '', until: (w) => (w.flags.dryLeft ?? 0) >= 0.9, max: 600 },
    { hold: 'R', until: X(19.9), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(22.6)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the umbrella' },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: (w) => !w.player.onGround, max: 200, note: 'it folds' },
    { hold: '', until: ground, max: 200 },
    { hold: '', ticks: 70 },
    { hold: 'R', jump: 12, ticks: 12, note: 'again: this time it bounces' },
    { hold: 'R', until: (w) => w.player.vy < -400, max: 200 },
    { hold: 'R', until: done, max: 300 },
  ],
  'PDY-07': [
    { hold: 'R', until: X(2.4) },
    { hold: '', brace: true, until: (w) => !gustOn(w) && gustLeft(w) > 0.7 && reach(w, thingOf(w, 'surfboard', 0).solid.x), max: 1500 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to board 1' },
    { hold: 'R', until: (w) => w.player.onGround || w.player.x + 5 >= thingOf(w, 'surfboard', 0).solid.x + 15, max: 120 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'surfboard', 0).solid.x + 18, max: 100 },
    { hold: '', ticks: 3 },
    { hold: '', brace: true, steer: balance((w) => thingOf(w, 'surfboard', 0)), until: (w) => !gustOn(w) && gustLeft(w) > 0.7 && reach(w, thingOf(w, 'surfboard', 1).solid.x), max: 1500 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to board 2' },
    { hold: 'R', until: (w) => w.player.onGround || w.player.x + 5 >= thingOf(w, 'surfboard', 1).solid.x + 15, max: 120 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'surfboard', 1).solid.x + 18, max: 100 },
    { hold: '', ticks: 3 },
    { hold: '', brace: true, steer: balance((w) => thingOf(w, 'surfboard', 1)), until: (w) => !gustOn(w) && gustLeft(w) > 0.7 && reach(w, thingOf(w, 'surfboard', 2).solid.x), max: 1500 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to board 3' },
    { hold: 'R', until: (w) => w.player.onGround || w.player.x + 5 >= thingOf(w, 'surfboard', 2).solid.x + 15, max: 120 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'surfboard', 2).solid.x + 18, max: 100 },
    { hold: '', ticks: 3 },
    { hold: '', brace: true, steer: balance((w) => thingOf(w, 'surfboard', 2)), until: (w) => !gustOn(w) && gustLeft(w) > 0.7 && reach(w, thingOf(w, 'surfboard', 3).solid.x), max: 1500 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to board 4' },
    { hold: 'R', until: (w) => w.player.onGround || w.player.x + 5 >= thingOf(w, 'surfboard', 3).solid.x + 15, max: 120 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'surfboard', 3).solid.x + 18, max: 100 },
    { hold: '', ticks: 3 },
    { hold: '', brace: true, steer: balance((w) => thingOf(w, 'surfboard', 3)), until: (w) => !gustOn(w) && gustLeft(w) > 0.7 && reach(w, thingOf(w, 'surfboard', 4).solid.x), max: 1500 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to board 5' },
    { hold: 'R', until: (w) => w.player.onGround || w.player.x + 5 >= thingOf(w, 'surfboard', 4).solid.x + 15, max: 120 },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'surfboard', 4).solid.x + 18, max: 100 },
    { hold: '', ticks: 3 },
    { hold: '', brace: true, steer: balance((w) => thingOf(w, 'surfboard', 4)), until: (w) => !gustOn(w) && gustLeft(w) > 0.8, max: 900 },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the rock: now the sea rises' },
    { hold: 'R', until: and(ground, X(25.6)), max: 200 },
    { hold: '', ticks: 2 },
    { hold: '', jump: 12, ticks: 12, note: 'tower step one' },
    { hold: 'R', until: (w) => w.player.x >= 28 * 16 + 2, max: 100 },
    { hold: '', until: ground, max: 200 },
    { hold: '', jump: 12, ticks: 12, note: 'step two' },
    { hold: '', until: ground, max: 200 },
    { hold: '', jump: 12, ticks: 12, note: 'step three' },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', until: done, max: 300 },
  ],
  'PDY-08': [
    { hold: 'R', until: X(4.9) },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the first street' },
    { hold: 'R', until: and(ground, X(10.9)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the second street' },
    { hold: 'R', until: and(ground, X(16.9)), max: 300 },
    { hold: '', until: (w) => w.entities.some((e: any) => e.kind === 'lantern' && e.alive && e.solid.y > 194 && e.solid.y < 206), max: 900, note: 'a lantern comes up' },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the lantern' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', until: (w) => w.player.y + 14 <= 136, max: 400, note: 'ride it up' },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the high roof' },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', ticks: 8 },
    { hold: '', until: (w) => !w.entities.some((e: any) => e.kind === 'spark' && e.alive && e.x > 370), max: 600, note: 'let the sparks burn out' },
    { hold: 'R', until: X(22.9), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'down on to the last roof' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400 },
    { hold: 'R', until: done, max: 300 },
  ],
  'BLR-06': [
    { hold: 'R', until: X(3.4) },
    { hold: '', until: (w) => (w.flags.lower as { c: number; v: number }[]).some((q) => q.v > 0 && q.c >= 66 && q.c <= 74), max: 700, note: 'a pulse comes along' },
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the running lights' },
    { hold: '', steer: ride('lower'), until: ground, max: 200 },
    { hold: '', steer: ride('lower'), until: X(13.6), max: 600 },
    { hold: '', steer: ride('upper'), jump: 12, ticks: 12, note: 'up before it runs backwards' },
    { hold: '', steer: ride('upper'), until: ground, max: 200 },
    { hold: '', steer: ride('upper'), until: (w) => w.flags.cut === 'warn', max: 900 },
    { hold: 'R', until: (w) => w.player.x >= 26 * 16 + 4, max: 200, note: 'sprint for the balcony' },
    { hold: 'R', until: done, max: 300 },
  ],
  'BLR-07': [
    { hold: 'R', dodge: 60, until: X(12.3), max: 900, note: 'hop the boulder' },
    { hold: '', until: (w) => thingOf(w, 'coracle').solid.x <= 234, max: 1500, note: 'wait for the coracle' },
    ...hopOn((w) => thingOf(w, 'coracle')),
    { hold: '', until: (w) => thingOf(w, 'coracle').solid.x >= 336, max: 1200, note: 'drift across' },
    ...hopOn(() => ({ solid: { x: 24 * 16 + 4, w: 24 } }), 'FWD'),
    { hold: 'FWD', until: done, max: 400, note: 'keep moving: the perched rock drops' },
  ],
  'BLR-08': [
    { hold: 'R', until: X(3.6) },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(8.2)), max: 200 },
    { hold: '', until: dry(0, 0.5), max: 600, note: 'Raja stops' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(13.2)), max: 200 },
    { hold: '', until: dry(1, 0.5), max: 600, note: 'Rani stops for real' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: '', ticks: 4 },
    { hold: '', until: (w) => cascadeN(w, 2).forced === null && dry(2, 0.9)(w), max: 900, note: 'let the Roarer calm down' },
    { hold: 'R', until: X(18.2), max: 200 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(23.2)), max: 200 },
    { hold: '', until: (w) => dry(3, 0.5)(w) && !w.entities.some((e: any) => e.kind === 'log' && e.alive && e.x < 470), max: 900, note: 'Rocket dry and no log near' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', dodge: 40, until: done, max: 600 },
  ],
  'AMR-06': [
    { hold: 'R', until: X(5.0) },
    { hold: '', until: (w) => gustOn(w) && gustLeft(w) <= 0.3, max: 900, note: 'go as the wind dies' },
    { hold: 'R', until: X(14.2), max: 300, note: 'across the planks before they drop' },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the gap in the bridge' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400 },
    { hold: 'R', until: done, max: 300 },
  ],
  'AMR-07': [
    { hold: 'R', until: X(3.6), note: 'set off the first stalactite' },
    { hold: '', until: (w) => thingOf(w, 'stalactite', 0).state === 'landed', max: 300, note: 'let it fall' },
    { hold: 'R', until: X(7.1) },
    { hold: '', until: (w) => thingOf(w, 'stalactite', 2).state === 'landed', max: 300, note: 'two fall together' },
    { hold: 'R', until: X(15.4), max: 300, note: 'keep walking under the last one' },
    { hold: '', until: batClear(115), max: 900, note: 'a gap between bats' },
    ...hopOn(() => ({ solid: { x: 18 * 16, w: 16 } })),
    { hold: '', until: batClear(115), max: 900 },
    ...hopOn(() => ({ solid: { x: 21 * 16, w: 16 } })),
    { hold: '', until: batClear(115), max: 900 },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: done, max: 300 },
  ],
  'AMR-08': [
    { hold: '', until: (w) => w.flags.waveIn >= 1.15 && carSoon(w) , max: 1500, note: 'after a wave, with a car on its way' },
    { hold: 'R', until: X(5.3), max: 200 },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on to the submarine' },
    { hold: 'R', until: and(ground, X(9.6)), max: 200 },
    { hold: '', until: (w) => (target = carNear(w)) !== null, max: 600, note: 'a cable car comes by' },
    ...hopOn(() => target!.t),
    { hold: '', until: (w) => carRiding(w) !== null && carRiding(w)!.s >= 190, max: 900, note: 'ride up (it stops halfway)' },
    ...hopOn(() => ({ solid: { x: 25 * 16 + 4, w: 20 } })),
    { hold: 'R', until: and(ground, X(26.6)), max: 300 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the spikes by the door' },
    { hold: 'R', until: done, max: 300 },
  ],
  'HYD-06': [
    { hold: 'R', until: X(2.6) },
    { hold: '', jump: 12, ticks: 12, note: 'clap on the stone' },
    { hold: '', until: ground, max: 200 },
    { hold: 'R', dodge: 34, until: and(ground, X(8.6)), max: 300 },
    { hold: '', dodge: 34, until: ballClear(150, 0), max: 400, note: 'let the cannonball pass' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', dodge: 34, until: and(ground, X(12.6)), max: 300 },
    { hold: '', dodge: 34, until: ballClear(150, 0), max: 400, note: 'let the cannonball pass' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', dodge: 34, until: and(ground, X(16.6)), max: 300 },
    { hold: '', dodge: 34, until: ballClear(150, 0), max: 400, note: 'let the cannonball pass' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', dodge: 34, until: and(ground, X(20.6)), max: 300 },
    { hold: '', dodge: 34, until: ballClear(150, 0.7), max: 400, note: 'let the cannonball pass' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', dodge: 34, until: and(ground, X(24.6)), max: 300 },
    { hold: '', dodge: 34, until: ballClear(120, 0.5), max: 400, note: 'let the cannonball pass' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: done, max: 400 },
  ],
  'HYD-07': [
    { hold: 'R', until: X(12.4), max: 300, note: 'slide along the bangles' },
    ...hopOn(() => ({ solid: { x: 14.8 * 16, w: 30 } })),
    ...hopOn(() => ({ solid: { x: 18.0 * 16, w: 30 } })),
    { hold: 'R', jump: 12, ticks: 12, note: 'skip the last string' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', dodge: 30, until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', dodge: 30, until: (w: World) => w.flags.twist === 'open', max: 400 },
    { hold: 'R', until: done, max: 300 },
  ],
  'HYD-08': [
    { hold: 'R', until: X(4.0) },
    { hold: 'R', jump: 12, ticks: 12, note: 'up on the catwalk, not the plywood' },
    { hold: 'R', until: and(ground, X(12.6)), max: 300 },
    { hold: 'R', until: (w) => w.player.x >= 13 * 16 + 2, max: 200 },
    { hold: '', until: ground, max: 200 },
    { hold: '', until: (w) => quiet(0, 1.1)(w) && quiet(1, 1.1)(w) && quiet(2, 1.1)(w), max: 900, note: 'after the late jet stops' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'swapped', max: 600 },
    { hold: 'L', until: done, max: 300, note: 'the real door' },
  ],
  'TVM-05': [
    { hold: 'R', until: X(17.05), max: 900, note: 'push through the gusts to the gate' },
    { hold: '', until: (w) => gateNear(w, 20).y > 180, max: 300, note: 'let it drop' },
    { hold: '', until: (w) => gateNear(w, 20).y <= 160 && gateNear(w, 20).state === 'rest' && !gustNOn(w, 0) && gustNLeft(w, 0) > 0.8, max: 900, note: 'gate up, wind calm' },
    { hold: 'R', until: X(22.6), max: 300, note: 'under the first gate, and stop' },
    { hold: '', until: (w) => w.flags.inner === 'up', max: 600, note: 'the hidden gate drops and goes back up' },
    { hold: 'R', until: X(37.4), max: 900 },
    { hold: '', until: (w) => !gustNOn(w, 1) && gustNLeft(w, 1) > 2.1, max: 900, note: 'calm over the moat' },
    { hold: 'R', until: X(39.5), max: 100 },
    ...hopOn(() => ({ solid: { x: 41 * 16, w: 32 } })),
    ...hopOn(() => ({ solid: { x: 44 * 16, w: 32 } })),
    ...hopOn(() => ({ solid: { x: 47 * 16, w: 32 } })),
    { hold: 'R', jump: 12, ticks: 12, note: 'on to the bank before it crumbles' },
    { hold: 'R', until: ground, max: 200 },
    { hold: 'R', until: X(52.6), max: 200, note: 'up to the second gate' },
    { hold: '', until: (w) => gateNear(w, 55).y > 180, max: 300, note: 'second gate drops' },
    { hold: '', until: (w) => gateNear(w, 55).y <= 160 && gateNear(w, 55).state === 'rest', max: 900 },
    { hold: 'R', until: X(74.2), max: 600 },
    { hold: 'R', jump: 12, ticks: 12, note: 'over the spikes (far from the dog)' },
    { hold: 'R', until: done, note: 'walk past the dog, do not jump' },
  ],
  'HYD-02': [{ hold: 'L', until: done, note: 'walk away, auto picks you up' }],
  'HYD-03': [
    { hold: 'R', until: X(18.6), note: 'run to pit edge' },
    { hold: 'R', jump: 12, ticks: 12 },
    { hold: 'R', until: and(ground, X(23.6)), note: 'land then bait' },
    { hold: 'L', until: XL(22.2), note: 'retreat' },
    { hold: '', ticks: 120, note: 'pot falls' },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto pot' },
    { hold: 'R', until: and(ground, X(24.9)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto tower' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'shut', max: 900 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400, note: 'the shutter slams, wait for it' },
    { hold: 'R', until: done, max: 300 },
  ],
  'HYD-04': [
    { hold: 'L', ticks: 2, note: 'face away' },
    { hold: '', until: done, note: 'wait for the shy auto' },
  ],
  'HYD-05': [
    { hold: '', ticks: 1 },
    { hold: 'R', until: X(4.6) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto P1' },
    { hold: 'R', until: and(ground, X(7.4)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto P2' },
    { hold: 'R', until: and(ground, X(9.8)) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto balcony' },
    { hold: 'R', until: and(ground, X(17.4)), note: 'to fake door' },
    { hold: 'R', jump: 12, ticks: 12, note: 'over fake door' },
    { hold: 'R', until: and(ground, X(21)) },
    { hold: 'R', until: done, note: 'off the balcony end, corner the auto' },
  ],
  'BLR-02': [
    { hold: 'L', until: (w) => w.player.x <= 118, note: 'press the button' },
    { hold: 'R', until: (w) => w.player.x >= 132 },
    { hold: '', until: (w) => veh(w, 'car').x < 152, note: 'wait for the little car' },
    { hold: '', jump: 12, ticks: 12, note: 'hop on the arriving car' },
    { hold: '', until: and(ground, onVeh('car')), max: 200 },
    { hold: '', until: vehAt('car', 112) },
    { hold: 'L', jump: 14, ticks: 14, note: 'onto the building' },
    { hold: 'L', until: (w: World) => w.flags.twist === 'shut', max: 400 },
    { hold: '', until: (w: World) => w.flags.twist === 'open', max: 400, note: 'shutter: wait' },
    { hold: 'L', until: done, max: 300 },
  ],
  'BLR-03': [
    { hold: 'R', until: X(3.6) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto bus' },
    { hold: 'R', until: and(ground, onVeh('bus')), max: 200 },
    { hold: '', ticks: 2 },
    { hold: '', until: vehAt('bus', 352), note: 'ride across the rebar' },
    { hold: 'R', until: (w: World) => w.flags.twist === 'swapped', max: 900 },
    { hold: 'L', until: done, max: 600, note: 'the door jumped behind you' },
  ],
  'BLR-04': [
    { hold: 'R', jump: 40, ticks: 30, note: 'onto bus' },
    { hold: '', until: and(ground, onVeh('bus')) },
    { hold: 'L', until: XL(4.0) },
    { hold: '', until: (w) => w.player.x + 10 >= 14 * 16 - 14, note: 'ride to the sign' },
    { hold: '', jump: 40, ticks: 1, note: 'over the sign' },
    { hold: '', until: and(ground, onVeh('bus')) },
    { hold: '', until: (w) => w.player.x + 10 >= 21 * 16 - 14, note: 'ride to the branch' },
    { hold: '', jump: 40, ticks: 1, note: 'over the branch' },
    { hold: '', until: and(ground, onVeh('bus')) },
    { hold: '', until: (w) => w.player.x + 10 >= 28 * 16 - 26, note: 'ride to the ledge' },
    { hold: 'R', jump: 40, ticks: 40, note: 'onto the ledge' },
    { hold: 'R', until: done, max: 300 },
  ],
  'BLR-05': [
    { hold: '', jump: 12, ticks: 1, note: 'jump in place: the auto comes under you' },
    { hold: '', until: and(ground, onVeh('autoV')), max: 300 },
    { hold: '', until: vehAt('autoV', 360), note: 'ride to the building' },
    { hold: 'R', until: X(23.4) },
    { hold: 'R', jump: 12, ticks: 12, note: 'onto the roof' },
    { hold: 'R', until: done },
  ],
  'BOM-02': [
    { hold: 'R', until: X(3.6) },
    { hold: 'R', jump: 40, ticks: 10, note: 'onto the cart' },
    { hold: 'R', until: and(ground, (w) => w.standing(plat(w, 0).solid)) },
    { hold: '', until: (w) => plat(w, 0).solid.x >= 224 },
    { hold: 'R', until: X(16.9) },
    { hold: 'R', jump: 40, ticks: 10, note: 'onto the sinking platform' },
    { hold: 'R', until: and(ground, (w) => w.standing(plat(w, 1).solid)) },
    { hold: 'R', jump: 40, ticks: 10, note: 'quickly off it' },
    { hold: 'R', until: done },
  ],
  'BOM-03': [
    { hold: '', until: (w) => plat(w).solid.x <= 289 && w.tick > 200, note: 'wait for the shuttle to dock' },
    { hold: 'R', until: (w) => w.standing(plat(w).solid) && w.player.x > 296 },
    { hold: '', until: (w) => plat(w).solid.x >= 351 },
    { hold: 'R', until: done },
  ],
  'BOM-04': [
    { hold: '', ticks: 100, note: 'let the flood lift the crates' },
    { hold: 'R', until: X(5.2) },
    { hold: 'R', jump: 40, ticks: 12, note: 'onto crate 1' },
    { hold: '', until: and(ground, (w) => w.standing(float(w, 0).solid)) },
    { hold: 'R', until: X(9.0) },
    { hold: 'R', jump: 45, until: and(ground, (w) => w.standing(float(w, 1).solid)), note: 'onto the drum' },
    { hold: 'R', until: X(16.0) },
    { hold: 'R', jump: 45, until: and(ground, (w) => w.standing(float(w, 2).solid)), note: 'onto crate 3' },
    { hold: 'R', until: X(21.5) },
    { hold: '', until: (w) => float(w, 2).solid.y <= 96, note: 'ride the flood up' },
    { hold: 'R', jump: 45, ticks: 40, note: 'onto the exit ledge' },
    { hold: 'R', until: done },
  ],
  'BOM-05': [
    { hold: 'L', until: (w) => plat(w, 0).solid.x >= 71, note: 'walk backward on the treadmill' },
    { hold: '', ticks: 4 },
    { hold: 'R', jump: 45, ticks: 40, note: 'hop to the middle platform' },
    { hold: 'R', until: and(ground, X(14.6)) },
    { hold: 'R', until: X(14.9) },
    { hold: 'R', jump: 45, ticks: 40, note: "over Tara's packed door" },
    { hold: '', until: ground },
    { hold: '', until: (w) => plat(w, 1).solid.x <= 321 && w.tick > 280, note: 'wait for the shuttle' },
    { hold: 'R', until: (w) => w.standing(plat(w, 1).solid) && w.player.x > 328 },
    { hold: '', until: (w) => plat(w, 1).solid.x >= 383 },
    { hold: 'R', until: done },
  ],
};

for (const c of Object.keys(COURSES) as CityId[]) SOLUTIONS[`${c}-01`] = tourRun(c);

// ---------------------------------------------------------------- the hardness pass: tours that bite
/** a tour run with extra steps spliced in: before the step whose note is `at` (its i-th occurrence) */
function tourWith(city: CityId, cuts: { before: string; nth?: number; steps: Step[] }[], tail?: Step[]): Step[] {
  const run = tourRun(city);
  for (const c of cuts) {
    let n = c.nth ?? 0;
    const i = run.findIndex((st) => st.note === c.before && n-- === 0);
    if (i < 0) throw new Error(`tourWith ${city}: no step '${c.before}'`);
    // the step before a noted jump is its approach (`until X`): splice in front of the approach
    run.splice(i - 1, 0, ...c.steps);
  }
  if (tail) run.splice(run.length - 1, 1, ...tail);
  return run;
}
const launchIs = (st: string) => (w: World) => w.flags.launch === st;
// Thumba: stop on the last step while the rocket's fire dies down and its spent stage lands (it makes a
// step down); at the very end, wait for the road to close again
let FIX_AMR01: Step[] = [];
const pongalIs = (st: string) => (w: World) => w.flags.pongal === st;
const bridgeIs = (st: string) => (w: World) => w.flags.bridge === st;
/** AMR-01: hop past the aunty's plate, then the barrage piers with the long jump over the missing one */
const amrPiers = (fed: boolean): Step[] => [
  ...(fed ? [] : [{ hold: 'R' as const, until: (w: World) => w.player.cx >= px16(29.7), max: 600 }, { hold: 'R' as const, jump: 10, ticks: 10, note: 'hop past the aunty’s plate' }, { hold: 'R' as const, until: ground, max: 200 }]),
  { hold: 'R', until: X(35.1), max: 600 },
  { hold: 'R', jump: 10, ticks: 10, note: 'onto the first pier' },
  { hold: 'R', until: and(ground, X(39.1)), max: 200 },
  { hold: 'R', jump: 10, ticks: 10 },
  { hold: 'R', until: and(ground, X(43.1)), max: 200 },
  { hold: 'R', jump: 10, ticks: 10 },
  { hold: 'R', until: and(ground, X(47.5)), max: 200 },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'the long jump over the missing pier' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(55.2), max: 200 },
  { hold: 'R', jump: 10, ticks: 10, note: 'on to the far bank' },
  { hold: 'R', until: ground, max: 200 },
];
{
  const run = tourRun('AMR');
  const a = run.findIndex((st) => st.note === 'onto the first stone') - 1;
  const b = run.findIndex((st, i) => i > a && st.note === 'a low wall') - 1;
  SOLUTIONS['AMR-01'] = [...run.slice(0, a), ...amrPiers(false), ...run.slice(b)];
  FIX_AMR01 = [...run.slice(0, a), ...amrPiers(true), { hold: '', until: (w) => w.state !== 'play', max: 300 }];
}
SOLUTIONS['BLR-01'] = tourWith('BLR', [
  {
    before: 'a post',
    steps: [
      { hold: 'R', until: X(70.6), max: 600, note: 'up to the edge of the dug-up road' },
      { hold: '', until: bridgeIs('stalled'), max: 600, note: 'let the smart bridge load' },
      { hold: 'R', until: X(77.5), max: 200, note: 'across: it is stuck at 99%' },
      { hold: 'R', jump: 12, ticks: 12, note: 'jump the tile that never loads' },
      { hold: 'R', until: ground, max: 200 },
    ],
  },
]);
/** the policeman's cap: [x, y] while it's blowing down the street */
const capAt = (w: World) => {
  const k = w.entities.find((e: any) => e.hatX !== undefined && e.copX0 !== undefined) as any;
  return k && k.state === 'chase' ? { x: k.hatX as number, y: k.hatY as number } : null;
};
SOLUTIONS['PDY-01'] = tourWith('PDY', [
  {
    before: 'a shallow ditch',
    nth: 1,
    steps: [
      { hold: 'R', until: (w) => w.flags.kepi === 'chase', max: 600 },
      { hold: '', until: (w) => { const c = capAt(w); return !!c && c.x - (w.player.x + 10) < 30; }, max: 600, note: 'the cap comes down the street' },
      { hold: '', jump: 10, until: (w) => w.flags.kepi !== 'chase', max: 120, note: 'jump and catch it' },
      { hold: '', until: (w) => w.flags.kepi === 'done', max: 400, note: 'he takes it back' },
    ],
  },
]);
SOLUTIONS['CHN-01'] = tourWith('CHN', [
  {
    before: 'up on the deck',
    steps: [
      { hold: 'R', until: pongalIs('bubble'), max: 600 },
      { hold: 'L', ticks: 30, note: 'it bubbles: back off' },
      { hold: '', until: pongalIs('cool'), max: 600, note: 'wait till it stops steaming' },
    ],
  },
]);
SOLUTIONS['KVT-01'] = tourWith('KVT', [
  {
    before: 'a shallow ditch',
    steps: [
      { hold: 'R', until: X(66), max: 300 },
      { hold: '', until: (w) => w.flags.nest === 1, max: 900, note: 'let every baby turtle reach the water' },
    ],
  },
]);
/** swap a tour route's noted jump (with its approach before it and its landing after it) for `steps` */
function tourSwap(run: Step[], note: string, steps: Step[], nth = 0): Step[] {
  let n = nth;
  const i = run.findIndex((st) => st.note === note && n-- === 0);
  if (i < 0) throw new Error(`tourSwap: no step '${note}'`);
  return [...run.slice(0, i - 1), ...steps, ...run.slice(i + 2)];
}
/** TVM-01's start: a small hop over the cave-in, clean over the wall and the glass your hop put on it, and
 *  at once over the glass on the road past it */
const tvm01Wall: Step[] = [
  { hold: 'R', until: X(6.3), max: 300 },
  { hold: 'R', jump: 10, ticks: 10, note: 'a small hop over the cave-in' },
  { hold: 'R', until: ground, max: 200 },
  { hold: 'R', until: X(10.3), max: 200 },
  { hold: 'R', jump: 20, ticks: 20, long: true, note: 'clean over the wall and its glass' },
  { hold: 'R', until: ground, max: 200 },
];
const tvm01Start: Step[] = [
  ...tvm01Wall,
  { hold: 'R', until: X(15.0), max: 200 },
  { hold: 'R', jump: 12, ticks: 12, note: 'and over the glass on the road' },
  { hold: 'R', until: ground, max: 200 },
];
/** the ditch is a puddle: walk down into it and climb out (a jump at it from the road brings up spikes) */
const tvm01Ditch: Step[] = [
  { hold: 'R', until: (w) => w.player.y + w.player.h > px16(15) + 8, max: 400, note: 'walk into the ditch' },
  { hold: 'R', until: and(ground, X(24.4)), max: 200 },
  { hold: 'R', jump: 12, ticks: 12, note: 'climb out of the ditch' },
  { hold: 'R', until: ground, max: 200 },
];
/** the puttu stall: stop short of the tarp, let it empty, then jump the puddle (a pothole) */
const tvm01Tarp: Step[] = [
  { hold: 'R', until: X(83.4), max: 400 },
  { hold: '', until: (w) => w.flags.tarp === 'empty', max: 300, note: 'let the tarp empty' },
  { hold: 'R', until: X(88.4), max: 300 },
  { hold: 'R', jump: 12, ticks: 12, note: 'jump the puddle: it is a pothole' },
  { hold: 'R', until: ground, max: 200 },
];
/** the TVM course with the city's own betrayals (the end gap added by the callers) */
function tvm01(start = tvm01Start, offCanoe: Step[] = [{ hold: 'R', until: X(76.7), max: 200 }, { hold: 'R', jump: 10, ticks: 10, note: 'hop off: the landing gives way' }, { hold: 'R', until: ground, max: 200 }], ditch = tvm01Ditch, tarp = tvm01Tarp): Step[] {
  let run = tourSwap(tourRun('TVM'), 'a low wall', start);
  run = tourSwap(run, 'a shallow ditch', ditch);
  const off = run.findIndex((st) => st.note === 'step off');
  run = [...run.slice(0, off), ...offCanoe, ...run.slice(off + 1)];
  const rocket = run.findIndex((st) => st.note === 'hop the parked ride') - 1;
  run.splice(rocket, 0, { hold: 'R', until: X(49.9), max: 400, note: 'on to the last step' }, { hold: '', until: launchIs('down'), max: 600, note: 'the rocket goes; wait out the fire and the falling stage' });
  const deck = run.findIndex((st) => st.note === 'up on the deck') - 1;
  run.splice(deck, 0, ...tarp);
  return run;
}
const tvm01End: Step[] = [{ hold: 'R', until: X(101.9), max: 900 }, { hold: '', until: groupBack('g'), max: 400, note: 'the road opens: wait for it to close' }, { hold: 'R', until: done, max: 400 }];
SOLUTIONS['TVM-01'] = [...tvm01().slice(0, -1), ...tvm01End];
const tvm01Die: Step = { hold: 'R', until: (w) => w.state !== 'play', max: 900 };

/** A long stage = its old room + troll sections + the door: drop the room's last `drop` steps
 *  (its old door), walk on with `extra`, then the sections' routes and the door. */
function lengthen(id: string, drop: number, extra: Step[]) {
  const def = LEVEL_BY_ID.get(id)!;
  const room = SOLUTIONS[id];
  SOLUTIONS[id] = longRun(def, [...room.slice(0, room.length - drop), ...extra]);
}
const onThing = (kind: string) => (w: World) => w.standing(thingOf(w, kind).solid);

/** swap a stage's last `drop` steps (its old door twist) for the careful door policy */
function newDoor(id: string, drop: number) {
  const r = SOLUTIONS[id];
  SOLUTIONS[id] = [...r.slice(0, r.length - drop), { policy: exitPolicy(), until: done, max: 1800, dodge: 1, note: 'the door, and whatever it does' }];
}
newDoor('TVM-02', 3);
newDoor('TVM-04', 2);
newDoor('TVM-06', 2);
newDoor('TVM-08', 3);

// Kavaratti
SOLUTIONS['KVT-06'] = [
  { hold: 'R', until: (w) => w.player.swimming, max: 300, note: 'off the jetty into the lagoon' },
  swim(
    [
      { x: 190, y: 236, tx: 6 },
      { x: 270, y: 236, tx: 6 },
      { x: 285, y: 148, tx: 5, ty: 4, wait: jellyLow(0) },
      { x: 345, y: 148, tx: 5, ty: 4, wait: jellyLow(1) },
      { x: 425, y: 148, tx: 6, ty: 4 },
      { x: 475, y: 100, tx: 4, ty: 4 },
    ],
    (w) => w.player.y + w.player.h <= 128 && !w.player.swimming && w.player.x > 446,
    'under the sea stack, between the jellyfish, up at the pier',
  ),
  { hold: 'R', until: (w) => w.player.onGround && w.player.y < 128, max: 200, note: 'on to the pier' },
];
lengthen('KVT-06', 0, [{ hold: 'R', until: and(ground, X(40)), max: 600, note: 'down the rocks' }]);
{
  const palmAt = (tx: number) => (w: World) => w.climbables.find((c: any) => Math.abs(c.bx - (tx * 16 + 8)) < 1);
  const grab = (tx: number) => (w: World) => !!w.player.grip && w.player.grip === palmAt(tx)(w);
  SOLUTIONS['KVT-07'] = [
    { hold: 'R', until: X(5.4), max: 300 },
    { hold: 'R', jump: 14, until: grab(7), max: 120, note: 'jump at the palm: grab it' },
    { hold: 'R', until: (w) => w.player.onGround && !w.player.grip, max: 600, note: 'climb it, and over the top on to the crown' },
    { hold: 'R', until: and(ground, X(10.6)), max: 300, note: 'step off on to the sea wall' },
    { hold: 'R', until: X(11.2), max: 100 },
    { hold: 'R', jump: 8, until: grab(15), max: 160, note: 'leap for the palm in the water' },
    { hold: 'R', until: (w) => w.player.gripS >= 0.9, max: 300, note: 'no crown on this one: climb high' },
    { hold: 'R', jump: 10, until: grab(20), max: 160, note: 'leap to the next one' },
    { hold: 'R', until: (w) => w.player.onGround && !w.player.grip, max: 600, note: 'up on its crown' },
    { hold: 'R', until: X(20.9), max: 100 },
    { hold: 'R', jump: 14, ticks: 14, note: 'and jump for the far bank' },
    { hold: 'R', until: and(ground, X(27)), max: 300 },
  ];
  lengthen('KVT-07', 0, [{ hold: 'R', until: X(32), max: 300 }]);
}
SOLUTIONS['KVT-08'] = [
  { hold: 'R', until: X(20.3), max: 400, note: 'flat out on to the lagoon (walking slowly sinks you)' },
  { hold: 'R', jump: 12, ticks: 12, note: 'hop the rock' },
  { hold: 'R', until: and(ground, X(28.5)), max: 300 },
];
lengthen('KVT-08', 0, [{ hold: 'R', until: X(32), max: 300 }]);
lengthen('KVT-02', 1, [
  { hold: 'R', until: onThing('odam'), max: 300, note: 'step aboard' },
  { hold: '', until: (w) => !!w.flags.ferried, max: 600, note: 'it ferries you over' },
  { hold: 'R', until: X(32), max: 300 },
]);
lengthen('KVT-03', 1, [{ hold: 'R', until: X(32), max: 300 }]);
lengthen('KVT-04', 1, [{ hold: 'R', until: X(32), max: 300 }]);
lengthen('KVT-05', 1, [{ hold: 'R', until: X(44), max: 600, note: 'over the top of the lighthouse and down the steps' }]);

// Chennai
lengthen('CHN-02', 2, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the lorry and on down the road' }]);
lengthen('CHN-03', 1, [{ hold: 'R', until: and(ground, X(44)), max: 900, note: 'along the walkway above the flood, then down the steps' }]);
lengthen('CHN-04', 3, [{ hold: 'R', until: X(32), max: 600 }]);
{
  const def = LEVEL_BY_ID.get('CHN-05')!;
  const dx = def.doorX!;
  SOLUTIONS['CHN-05'] = [
    { hold: 'R', until: X(32), max: 1200, dodge: 1, note: 'hop the kites; the first EXIT is a mirage' },
    ...def.parts!.flatMap((p) => solveChunk(p)),
    { hold: 'R', until: X(dx + 2), max: 900, dodge: 1, note: 'past the shade of the tree... another mirage' },
    { hold: 'L', until: done, max: 900, dodge: 1, note: 'the real door was in the shade behind you' },
  ];
}
lengthen('CHN-06', 1, [{ hold: 'R', until: X(32), max: 600 }]);
lengthen('CHN-07', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('CHN-08', 2, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);

// Puducherry
lengthen('PDY-02', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('PDY-03', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'on through the archway' }]);
lengthen('PDY-04', 1, [
  { hold: 'R', until: and(ground, X(21.4)), max: 400 },
  { hold: 'R', jump: 12, ticks: 12, note: 'over the last socket too' },
  { hold: 'R', until: and(ground, X(32)), max: 600, note: 'through the café door' },
]);
lengthen('PDY-05', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('PDY-06', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the hut roof and on' }]);
lengthen('PDY-07', 1, [{ hold: 'R', until: and(ground, X(42)), max: 900, note: 'over the top and down the steps' }]);
lengthen('PDY-08', 3, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the last roof' }]);

// Bengaluru
lengthen('BLR-02', 3, [
  { hold: 'L', until: and(ground, (w) => w.player.x < 6 * 16), max: 300 },
  { hold: 'R', jump: 14, ticks: 14, note: 'up on to the metro line' },
  { hold: 'R', until: and(ground, X(40)), max: 900, note: 'along the line and down the steps' },
]);
lengthen('BLR-03', 2, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('BLR-04', 1, [{ hold: 'R', until: and(ground, X(40)), max: 600, note: 'off the ledge and down' }]);
lengthen('BLR-05', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the roof' }]);
lengthen('BLR-06', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the balcony' }]);
lengthen('BLR-07', 1, [{ hold: 'FWD', until: and(ground, X(32)), max: 600, note: 'keep moving: the perched rock drops' }]);
lengthen('BLR-08', 1, [{ hold: 'R', until: and(ground, X(44)), max: 900, note: 'over the top of the falls and down' }]);

// Amaravati
lengthen('AMR-02', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('AMR-03', 3, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('AMR-04', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('AMR-05', 2, [{ hold: 'FWD', until: and(ground, X(32)), max: 600 }]);
lengthen('AMR-06', 3, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('AMR-07', 1, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('AMR-08', 2, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the top and on' }]);

// Hyderabad (the autos now drive you on to the next stretch)
const rideOver: Step[] = [
  { hold: '', until: (w) => w.flags.autoRide === 2, max: 900, note: 'the auto drives you on, and drops you off' },
  { hold: 'R', until: and(ground, X(32)), max: 400 },
];
/** the room's last step got you into the auto: now it only needs to get you in */
const boardInstead = (id: string) => {
  const last = SOLUTIONS[id][SOLUTIONS[id].length - 1];
  return { ...last, until: (w: World) => (w.flags.autoRide ?? 0) >= 1, max: 900 } as Step;
};
lengthen('HYD-02', 1, [boardInstead('HYD-02'), ...rideOver]);
lengthen('HYD-03', 3, [{ hold: 'R', until: and(ground, X(32)), max: 600, note: 'off the tower' }]);
lengthen('HYD-04', 1, [boardInstead('HYD-04'), ...rideOver]);
lengthen('HYD-05', 1, [boardInstead('HYD-05'), ...rideOver]);
lengthen('HYD-06', 1, [{ hold: 'R', until: and(ground, X(42)), max: 900, note: 'over the top of the fort and down' }]);
lengthen('HYD-07', 3, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);
lengthen('HYD-08', 2, [{ hold: 'R', until: and(ground, X(32)), max: 600 }]);

// Mumbai (the locals now take you on to the next station)
const boardTrain = (id: string) => {
  const last = SOLUTIONS[id][SOLUTIONS[id].length - 1];
  return [
    { ...last, until: (w: World) => (w.flags.trainRide ?? 0) >= 1, max: 900 } as Step,
    { hold: '', until: (w: World) => w.flags.trainRide === 2, max: 400, note: 'next station' } as Step,
    { hold: '', ticks: 10 } as Step,
  ];
};
lengthen('BOM-02', 1, boardTrain('BOM-02'));
lengthen('BOM-03', 1, boardTrain('BOM-03'));
lengthen('BOM-04', 1, [{ hold: 'R', until: and(ground, X(44)), max: 900, note: 'over the wall and down the steps' }]);
lengthen('BOM-05', 1, boardTrain('BOM-05'));
SOLUTIONS['BOM-06'] = [
  { hold: 'R', until: X(11.6), max: 400, note: 'under the arcade, into the gali' },
  { policy: kicker({ xL: 176, xR: 224, roofY: 48, exit: 'R' }), until: (w) => w.player.onGround && w.player.y + w.player.h === 48, max: 900, note: 'kick from wall to wall up to the roof' },
  { hold: 'R', until: and(ground, X(29)), max: 600, note: 'along the roof and down to the street' },
];
lengthen('BOM-06', 0, [{ hold: 'R', until: X(32), max: 300 }]);
{
  // no jumping all the way: ride the handcart and the lifts
  const at = (i: number, x: number, y: number) => (w: World) => plat(w, i).solid.x === x * 16 && plat(w, i).solid.y === y * 16;
  SOLUTIONS['BOM-07'] = [
    { hold: 'R', until: X(6.3), max: 300, note: 'to the platform edge, dabba in hand' },
    { hold: '', until: at(0, 7, 15), max: 600, note: 'wait for the handcart' },
    { hold: 'R', until: X(7.9), max: 100, note: 'step on' },
    { hold: '', until: at(0, 10, 15), max: 600, note: 'ride it over' },
    { hold: 'R', until: X(14.2), max: 200 },
    { hold: '', until: at(1, 15, 15), max: 900, note: 'wait for the lift' },
    { hold: 'R', until: X(15.4), max: 100 },
    { hold: '', until: at(1, 15, 9), max: 900, note: 'up' },
    { hold: 'R', until: X(25.2), max: 300, note: 'over the tracks' },
    { hold: '', until: at(2, 26, 9), max: 900 },
    { hold: 'R', until: X(26.4), max: 100 },
    { hold: '', until: at(2, 26, 15), max: 900, note: 'down' },
    { hold: 'R', until: X(32), max: 300 },
  ];
  lengthen('BOM-07', 0, []);
}
SOLUTIONS['BOM-08'] = [
  { hold: 'R', until: X(4.6), max: 300, note: 'both of you, same buttons' },
  { hold: 'R', jump: 12, ticks: 12, note: 'you over the crate, him over the gap' },
  { hold: 'R', until: and(ground, X(32)), max: 1500, note: 'the walls hold one of you back while the other steps on his plate' },
];
lengthen('BOM-08', 0, []);
westSolutions(SOLUTIONS, lengthen);
eastSolutions(SOLUTIONS, lengthen);

/** The obvious play that a trap is designed to punish. */
export const NAIVE: Record<string, { steps: Step[]; cause?: string }> = {
  ...EAST_NAIVE,
  'TVM-01': { steps: tourRun('TVM'), cause: 'fell' },
  'KVT-01': { steps: tourRun('KVT'), cause: 'hatchling' },
  'CHN-01': { steps: tourRun('CHN'), cause: 'burnt' },
  'PDY-01': { steps: tourRun('PDY'), cause: 'hit' },
  'BLR-01': { steps: tourRun('BLR'), cause: 'fell' },
  'AMR-01': { steps: tourRun('AMR'), cause: 'splash' },
  'TVM-02': { steps: [{ hold: 'R', until: done }], cause: 'splash' },
  'TVM-03': { steps: [{ hold: 'R', until: done }], cause: 'spikes' },
  'TVM-04': { steps: [{ hold: 'R', until: done }], cause: 'coconut' },
  'KVT-02': { steps: [{ hold: 'R', until: X(3.4) }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done }], cause: 'splash' },
  'KVT-03': {
    steps: [
      { hold: 'R', until: X(6.1) },
      { hold: '', until: (w) => blinkers(w)[0].on && blinkerLeft(w, 0) > 1.3, max: 600 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(9.9)) },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(13.9)) },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(17.9)) },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(21.9)) },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: done },
    ],
    cause: 'fake exit',
  },
  'CHN-02': { steps: [{ hold: 'R', until: X(6.5) }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 900 }], cause: 'hit' },
  'CHN-03': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'flood' },
  'CHN-04': { steps: [{ hold: 'R', until: X(10.4) }, { hold: 'R', jump: 12, ticks: 12 }, { hold: '', until: done, max: 600 }], cause: 'fell' },
  'CHN-05': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'hit' },
  'PDY-02': { steps: [{ hold: 'R', until: X(8.2) }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'PDY-03': { steps: [{ hold: 'R', until: X(8.6) }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: ground, max: 200 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: ground, max: 200 }, { hold: 'R', jump: 14, ticks: 14 }, { hold: 'R', until: and(ground, X(18.5)), max: 300 }, { hold: '', until: done, max: 900 }], cause: 'crushed' },
  'PDY-04': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'burnt' },
  'PDY-05': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'AMR-02': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'spikes' },
  'AMR-03': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'AMR-04': { steps: [{ hold: 'R', until: done, max: 1500 }], cause: 'crushed' },
  'AMR-05': { steps: [{ hold: 'R', until: X(4.5) }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: and(ground, X(9.6)), max: 200 }, { hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'TVM-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'TVM-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'spikes' },
  'TVM-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'hit' },
  'KVT-04': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'spikes' },
  'KVT-05': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'hit' },
  'CHN-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'CHN-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'CHN-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'PDY-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'PDY-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'PDY-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'BLR-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'BLR-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'hit' },
  'BLR-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'AMR-06': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'AMR-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'hit' },
  'AMR-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'splash' },
  'HYD-06': {
    // rush up the steps without clapping, ignoring the cannon
    steps: [
      { hold: 'R', until: and(ground, X(8.6)), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(12.6)), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(16.6)), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(20.6)), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: and(ground, X(24.6)), max: 300 },
      { hold: 'R', jump: 12, ticks: 12 },
      { hold: 'R', until: done, max: 900 },
    ],
    cause: 'hit',
  },
  'HYD-07': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'HYD-08': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'fell' },
  'TVM-05': { steps: [{ hold: 'R', until: done }], cause: 'crushed' },
  'HYD-02': { steps: [{ hold: 'R', until: done }], cause: 'fell' },
  'HYD-03': { steps: [{ hold: 'R', until: done }], cause: 'fell' },
  'HYD-04': { steps: [{ hold: 'R', until: done }], cause: 'fell' },
  'HYD-05': {
    steps: [
      { hold: 'R', until: X(11.2) },
      { hold: 'R', jump: 45, ticks: 45, note: 'over the barricade, chase the auto' },
      { hold: 'R', until: done },
    ],
    cause: 'fell',
  },
  'BLR-02': { steps: [{ hold: 'L', until: XL(7.4) }, { hold: '', until: done }], cause: 'crushed' },
  'BLR-03': {
    steps: [
      { hold: 'L', until: XL(1.6) },
      { hold: 'L', jump: 45, ticks: 12, note: 'onto the stairs' },
      { hold: '', until: ground },
      { hold: 'R', jump: 45, until: and(ground, X(4)), note: "onto Tara's Metro" },
      { hold: 'R', until: done },
    ],
    cause: 'spikes',
  },
  'BLR-04': { steps: [{ hold: '', until: (w) => w.tick > 600 }, { hold: 'R', until: done }], cause: 'spikes' },
  'BLR-05': { steps: [{ hold: 'R', until: X(22) }, { hold: '', jump: 45, until: done }], cause: 'crushed' },
  'BOM-02': {
    steps: [
      { hold: 'R', until: X(3.6) },
      { hold: 'R', jump: 40, ticks: 10 },
      { hold: 'R', until: and(ground, (w) => w.standing(plat(w, 0).solid)) },
      { hold: '', until: (w) => plat(w, 0).solid.x >= 224 },
      { hold: 'R', until: X(16.9) },
      { hold: 'R', jump: 40, ticks: 10 },
      { hold: 'R', until: and(ground, (w) => w.standing(plat(w, 1).solid)) },
      { hold: '', until: done, note: 'wait on the sinking platform' },
    ],
    cause: 'fell',
  },
  'BOM-03': { steps: [{ hold: 'L', until: done, note: 'trust Tara, board the fast local' }], cause: 'fell' },
  'BOM-04': { steps: [{ hold: '', until: done }], cause: 'flood' },
  'BOM-05': { steps: [{ hold: 'R', until: done }], cause: 'fell' },
};

/** The hardness pass: what the player tries after the first death. It must die too (in at least half the stages). */
const tvm08 = SOLUTIONS['TVM-08'];
const tvm08At = tvm08.findIndex((st) => st.note?.startsWith('hop the crow; under the spiky bridge'));
/** a route with the step noted `note` (and the `n` after it) swapped for `with` */
function swapAt(id: string, note: string, n: number, w: Step[]): Step[] {
  const r = SOLUTIONS[id];
  const i = r.findIndex((st) => st.note === note);
  if (i < 0) throw new Error(`swapAt ${id}: no step '${note}'`);
  return [...r.slice(0, i), ...w, ...r.slice(i + n)];
}
/** More scripted mistakes per stage: each is something a first-timer does, and each must die. */
export const MISTAKES: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'TVM-06': [
    { what: 'hop straight off the last net (a short hop)', steps: swapAt('TVM-06', 'it dips at once: straight off to the jetty', 2, [{ hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: (w) => w.state !== 'play', max: 300 }]), cause: 'crushed' },
  ],
  'TVM-03': [
    {
      what: 'walk on after hopping the scooter',
      steps: [...SOLUTIONS['TVM-03'].slice(0, SOLUTIONS['TVM-03'].findIndex((st) => st.note === 'and hop the one coming the other way')), { hold: 'R', until: (w) => w.state !== 'play', max: 600 }],
      cause: 'hit',
    },
    { what: 'walk straight back to the door', steps: [...SOLUTIONS['TVM-03'].slice(0, SOLUTIONS['TVM-03'].findIndex((st) => st.note === 'the door ran back')), { hold: 'L', until: (w) => w.state !== 'play', max: 300 }], cause: 'spikes' },
    { what: 'hop over the shiny floor', steps: swapAt('TVM-03', 'over the painted floor, long: spikes come up where a hop lands', 1, [{ hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: (w) => w.state !== 'play', max: 300 }]), cause: 'spikes' },
  ],
  'KVT-02': [
    { what: 'wait for the boat at the very end of the jetty', steps: [...SOLUTIONS['KVT-02'].slice(0, SOLUTIONS['KVT-02'].findIndex((st) => st.note === 'the boat sees you and leaves')), { hold: 'R', until: and(ground, X(16.4)), max: 300 }, { hold: '', until: (w) => w.state !== 'play', max: 900 }], cause: 'splash' },
  ],
  'KVT-08': [
    { what: 'stop for a rest on the sandbar', steps: [{ hold: 'R', until: X(15.1), max: 400 }, { hold: '', until: (w) => w.state !== 'play', max: 400 }], cause: 'fell' },
  ],
  'TVM-05': [
    { what: 'wait for the first gate, then run on', steps: [...SOLUTIONS['TVM-05'].slice(0, SOLUTIONS['TVM-05'].findIndex((st) => st.note === 'under the first gate, and stop')), { hold: 'R', until: (w) => w.state !== 'play', max: 400 }], cause: 'crushed' },
    { what: 'stand on a stone in the moat', steps: [...SOLUTIONS['TVM-05'].slice(0, SOLUTIONS['TVM-05'].findIndex((st) => st.note === 'calm over the moat') + 2), { hold: 'R', jump: 12, ticks: 12 }, { hold: '', until: (w) => w.state !== 'play', max: 400 }], cause: 'splash' },
  ],
  'TVM-04': [
    { what: 'walk over the fallen fronds', steps: swapAt('TVM-04', 'hop the fronds: a coir pit under them', 2, [{ hold: 'R', until: (w) => w.state !== 'play', max: 300 }]), cause: 'splash' },
    { what: 'jump the last gap', steps: swapAt('TVM-04', 'a little hop: the far bank backs away', 2, [{ hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: (w) => w.state !== 'play', max: 300 }]), cause: 'splash' },
  ],
  'TVM-02': [
    {
      what: 'ride at the back of the roof',
      steps: [
        ...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note?.startsWith('hop the crows'))),
        { hold: 'L', until: (w) => w.player.x <= thingOf(w, 'redbus').solid.x + 12, max: 120 },
        { hold: '', dodge: 60, until: (w) => w.state !== 'play', max: 2000 },
      ],
      cause: 'crushed',
    },
    {
      what: 'hop the kite like the crows',
      steps: [...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note === 'ride the middle')), { policy: hopAnyBird(), until: (w) => w.state !== 'play', max: 2000 }],
      cause: 'hit',
    },
    {
      what: 'stay in the middle under the second flyover',
      steps: [...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note === 'to the front before the second flyover')), { hold: '', dodge: 60, until: (w) => w.state !== 'play', max: 2000 }],
      cause: 'crushed',
    },
  ],
  'TVM-01': [
    { what: 'hop up on to the wall', steps: [...tvm01Start.slice(0, 3), { hold: 'R', until: (w) => w.player.x + w.player.w >= px16(12) - 0.5, max: 200 }, { hold: '', jump: 14, ticks: 14 }, { hold: 'R', until: (w) => w.state !== 'play' || w.player.onGround, max: 200 }, tvm01Die], cause: 'spikes' },
    { what: 'walk on after the wall', steps: [...tvm01Wall, tvm01Die], cause: 'spikes' },
    { what: 'jump the ditch', steps: tvm01(tvm01Start, undefined, [{ hold: 'R', until: X(22.4), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, tvm01Die]), cause: 'spikes' },
    { what: 'jump the ditch, long', steps: tvm01(tvm01Start, undefined, [{ hold: 'R', until: X(22.9), max: 400 }, { hold: 'R', jump: 30, ticks: 30, long: true }, tvm01Die]), cause: 'spikes' },
    { what: 'walk on under the full tarp', steps: tvm01(tvm01Start, undefined, tvm01Ditch, [tvm01Die]), cause: 'drenched' },
    { what: 'let the tarp empty, then wade the puddle like the ditch', steps: tvm01(tvm01Start, undefined, tvm01Ditch, [...tvm01Tarp.slice(0, 2), tvm01Die]), cause: 'splash' },
    { what: 'run on when the rocket goes', steps: tvm01().filter((st) => st.note !== 'on to the last step' && !st.note?.startsWith('the rocket goes')), cause: 'burnt' },
    { what: 'stop at the foot of the steps when it goes', steps: [...tvm01().slice(0, tvm01().findIndex((st) => st.note === 'on to the last step')), { hold: 'R', until: X(52.3), max: 400 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' },
    { what: 'step off the canoe', steps: [...tvm01([...tvm01Start], [tvm01Die])], cause: 'fell' },
    { what: 'jump the hole at the end', steps: [...tvm01().slice(0, -1), { hold: 'R', until: X(101.9), max: 900 }, { hold: 'R', jump: 30, ticks: 30, long: true }, tvm01Die], cause: 'fell' },
  ],
};

export const FIX: Record<string, { steps: Step[]; cause?: string }> = {
  // you fell short: take the long jump properly, holding jump (but you ate at the aunty's: still short)
  'AMR-01': { steps: FIX_AMR01, cause: 'splash' },
  // the first wait was in the shade of an umbrella: wait under the next umbrella too (it's full of holes)
  'AMR-04': { steps: swapAt('AMR-04', 'to the little tree', 2, [{ hold: 'R', ticks: 150 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }]), cause: 'burnt' },
  // the hook carried you: ride it all the way (it jams and drops)
  'AMR-06': { steps: swapAt('AMR-06', 'to the next hook before this one drops', 1, [{ hold: '', until: (w) => w.state !== 'play', max: 600 }]) },
  // Tara said go straight to the big hall: jump the hole and go along the grand passage (its ceiling falls)
  'AMR-07': {
    steps: swapAt('AMR-07', 'drop through the hole', 1, [
      { hold: 'R', until: ground, max: 100 },
      // jump the hole in the floor where it opens in front of you, and keep going
      { policy: (w) => { const p = w.player; return { move: 'R', jump: p.onGround && w.tileAt(Math.floor((p.x + p.w + 4) / 16), 12) === 0 }; }, until: (w) => w.state !== 'play', max: 400 },
    ]),
    cause: 'crushed',
  },
  // a cyclone gust: shelter in the beach shack (its roof comes down)
  'AMR-08': { steps: swapAt('AMR-08', 'straight through the first shack', 1, [{ hold: 'R', ticks: 70 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }]), cause: 'crushed' },
  // the crane laid every piece so far: wait for the last one too, then step on (it comes in 2027)
  'BLR-03': { steps: swapAt('BLR-03', 'the piece that comes in 2027', 1, [{ hold: '', ticks: 240 }, { hold: 'R', until: (w) => w.state !== 'play', max: 400 }]), cause: 'spikes' },
  // every car in the jam held still: stand on the jeep too (it pulls away)
  'BLR-04': { steps: swapAt('BLR-04', 'straight on to the bus before the jeep pulls away', 1, [{ hold: '', ticks: 120 }, { hold: 'R', until: (w) => w.state !== 'play', max: 400 }]) },
  // the waterfall was only a curtain: walk on over the wet stones too (you slide in)
  'BLR-08': { steps: swapAt('BLR-08', 'off the wet stones', 1, [{ hold: 'R', until: (w) => w.state !== 'play', max: 400 }]) },
  // the smart bridge: wait on it for the last tile (it restarts from nothing)
  'BLR-01': {
    steps: tourWith('BLR', [
      {
        before: 'a post',
        steps: [
          { hold: 'R', until: X(70.6), max: 600 },
          { hold: '', until: bridgeIs('stalled'), max: 600 },
          { hold: 'R', until: X(77.6), max: 200 },
          { hold: '', until: (w) => w.state !== 'play', max: 600, note: 'wait for the last tile' },
        ],
      },
    ]),
    cause: 'fell',
  },
  // the pools taught "the rocks are steps": hop on the rock in the last pool (it's a turtle)
  'PDY-02': { steps: swapAt('PDY-02', 'over the whole turtle pool', 1, [{ hold: 'R', jump: 12, ticks: 12 }, { hold: '', until: (w) => w.state !== 'play', max: 400 }]) },
  // the signs lied: so the street that says walk must be a lie too (walk it)... it isn't
  'PDY-03': { steps: swapAt('PDY-03', 'jump the street that says walk', 1, [{ hold: 'R', until: (w) => w.state !== 'play', max: 400 }]) },
  // the first raft waited at the post: wait for the second one too (it only kisses the post)
  'PDY-05': { steps: swapAt('PDY-05', 'on it at once', 1, [{ hold: '', ticks: 90 }, { hold: 'R', until: (w) => w.state !== 'play', max: 400 }]) },
  // the first palm let you walk under: walk under the second and jump the urchins (the jump brings its coconut down)
  'PDY-06': { steps: swapAt('PDY-06', 'a hop under the second palm brings its coconut down', 3, []), cause: 'hit' },
  // the policeman ran you over: hop him next time (he leaps for his cap as you do)
  'PDY-01': {
    steps: tourWith('PDY', [
      {
        before: 'a shallow ditch',
        nth: 1,
        steps: [
          { hold: 'R', until: (w) => w.entities.some((e: any) => e.copOn && e.copX - 5 - (w.player.x + 10) < 34), max: 900 },
          { hold: 'R', jump: 20, ticks: 20, note: 'hop the policeman' },
          { hold: 'R', until: (w) => w.state !== 'play', max: 300 },
        ],
      },
    ]),
    cause: 'hit',
  },
  // the room taught "pot three is the trap": in the second queue, step on to pot two (it's pot two here)
  'CHN-02': { steps: swapAt('CHN-02', 'over pots one and two, straight onto pot three', 1, [{ hold: 'R', jump: 8, ticks: 8 }, { hold: '', until: (w) => w.state !== 'play', max: 300 }]), cause: 'hit' },
  // Tara says jump every ball: jump the bouncer too (it flies at jump height)
  'CHN-04': {
    steps: swapAt('CHN-04', 'hop the balls on the ground, stay down for the bouncer', 1, [
      { policy: (w) => ({ move: 'R', jump: w.player.onGround && w.entities.some((e: any) => e.kind === 'ball' && e.alive && e.x > w.player.x && e.x - w.player.x < 44) }), until: (w) => w.state !== 'play', max: 1500 },
    ]),
    cause: 'hit',
  },
  // the shimmer was a hole: so jump the black patch too
  'CHN-05': { steps: swapAt('CHN-05', 'walk across the black patch', 1, [{ hold: 'R', jump: 12, ticks: 12 }, { hold: 'R', until: (w) => w.state !== 'play', max: 300 }]), cause: 'fell' },
  // the first hanging stone: walk under it to drop it; do the same with the second (it's over the spike pit)
  'CHN-07': { steps: swapAt('CHN-07', 'wait at the edge: it drops into the pit', 1, [{ hold: 'R', until: (w) => w.state !== 'play', max: 400 }]), cause: 'spikes' },
  // the Pongal pot: stop the moment it bubbles (the spill runs past where you stand)
  'CHN-01': {
    steps: tourWith('CHN', [{ before: 'up on the deck', steps: [{ hold: 'R', until: pongalIs('bubble'), max: 600 }, { hold: '', until: done, max: 400 }] }]),
    cause: 'burnt',
  },
  // the glass gap was walkable: so walk the next gap too (it's real water)
  'KVT-02': { steps: swapAt('KVT-02', 'the real gap', 1, []), cause: 'splash' },
  // the reef rose under every step: so walk the last gap too (it's real water)
  'KVT-03': { steps: swapAt('KVT-03', 'the last gap is real', 1, []), cause: 'splash' },
  // Tara said go all the way up: the basket hauls you into the pulley
  'KVT-05': { steps: swapAt('KVT-05', 'off onto the pier: a little hop (a big one meets the pulley)', 1, [{ hold: '', until: (w) => w.state !== 'play', max: 900 }]), cause: 'spikes' },
  // the baby turtles: jump over them (they spread wider than a jump)
  'KVT-01': {
    steps: tourWith('KVT', [
      {
        before: 'a shallow ditch',
        steps: [
          { hold: 'R', until: X(69.4), max: 300 },
          { hold: 'R', jump: 20, ticks: 20, note: 'jump the babies' },
          { hold: 'R', until: ground, max: 200 },
        ],
      },
    ]),
    cause: 'hatchling',
  },
  // the bus jerked off and threw you off the back: ride at the front then (the brake throws you off it)
  'TVM-02': {
    steps: swapAt('TVM-02', 'ride in the middle of the roof', 1, [
      { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 80, max: 120 },
    ]),
    cause: 'splash',
  },
  // out of the steam, straight on: the tea master starts his pour as you come out of it
  'TVM-03': { steps: [...SOLUTIONS['TVM-03'].slice(0, 2), { hold: 'R', until: (w) => w.state !== 'play', max: 900 }], cause: 'burnt' },
  // the moat's stones crumble, so keep hopping, on to the bank and on: the second gate drops right there
  'TVM-05': { steps: [...SOLUTIONS['TVM-05'].slice(0, SOLUTIONS['TVM-05'].findIndex((st) => st.note === 'on to the bank before it crumbles') + 1), { hold: 'R', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' },
  // the coconut over the gap: just jump the gap, like the roll before it (it drops on the jump)
  'TVM-04': { steps: swapAt('TVM-04', 'little hop to bait the gap coconut', 1, []), cause: 'coconut' },
  // the last net: wait on it for the right moment, like the four before it (it dips the moment you land)
  'TVM-06': { steps: swapAt('TVM-06', 'it dips at once: straight off to the jetty', 2, [{ hold: '', until: done, max: 400 }]), cause: 'splash' },
  // the jeep: hop it and run on, it's gone by (it backs up for another go)
  'TVM-07': { steps: swapAt('TVM-07', 'it backs up: stop and hop it', 1, [{ hold: 'R', until: done, max: 600 }]), cause: 'hit' },
  // the third bridge: hop it like the first two (its spikes only come out when you do)
  'TVM-08': {
    steps: [...tvm08.slice(0, tvm08At), { hold: '', until: (w) => px16(54) - (w.player.x + 10) <= 30, max: 900, dodge: 1 }, { hold: 'R', jump: 30, ticks: 30, long: true }, { hold: '', until: done, max: 300 }],
    cause: 'spikes',
  },
  // stop at the foot of the steps until the fire is out: the spent stage comes down there
  // the road caved in: jump it properly next time, a big jump (it lands you on the wall's glass)
  'TVM-01': {
    steps: [{ hold: 'R', until: X(7.3), max: 300 }, { hold: 'R', jump: 30, ticks: 30, long: true }, { hold: 'R', until: (w) => w.state !== 'play', max: 200 }],
    cause: 'spikes',
  },
};
