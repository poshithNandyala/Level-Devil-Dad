// Thiruvananthapuram's own route file. Its older proven plays still live in the shared tables
// (tests/solutions.ts, tests/west.ts, tests/acts.ts, tests/endings.ts); anything set here is merged LAST and
// replaces that stage's (or act's, or ending's) entry there. After a change on purpose: npm run refreeze -- TVM.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { type Step, X, and, done, ground, thingOf } from '../runner';
import type { CityTests } from '../city-tests';
import { STRIP } from '../../src/game/cities/tvm/kovalam';
import { surfOf } from '../../src/game/cities/tvm/encores';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;

const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => (w.player.cx < x - slack ? 'R' : w.player.cx > x + slack ? 'L' : '');
const walk = (to: number, note?: string, max = 900): Step => ({ hold: 'R', until: and(ground, X(to)), max, note });
const hopAt = (at: number, ticks: number, note: string, long = false): Step[] => [
  { hold: 'R', until: X(at), max: 900 },
  { hold: 'R', jump: ticks, ticks, note, long },
  { hold: 'R', until: ground, max: 300 },
];
const until = (pred: (w: World) => boolean, note: string, max = 900): Step => ({ hold: '', until: pred, max, note });
/** is there no floor just ahead of Dad (the next 14 px, going right)? */
const pitAhead = (w: World, dir: Move = 'R') => {
  const p = w.player;
  const tx = Math.floor((dir === 'R' ? p.x + p.w + 6 : p.x - 6) / 16);
  // anything solid there (ground, or a tile group that hasn't moved) is floor
  return !w.solidAt(tx * 16 + 4, 15 * 16 + 2, 4, 4);
};

// ------------------------------------------------------------------ TVM-09: Kovalam Flags
/** walk with the lifeguard to where he plants the flags this wave (hopping any rock pool), and stand there till it's out */
function follow(name: string, i: number, note: string): Step {
  let jt = 0;
  return {
    note,
    max: 1500,
    until: (w) => (surfOf(w, name)?.i ?? 0) > i,
    policy: (w) => {
      const s = surfOf(w, name)!;
      const c = s.target + STRIP / 2;
      if (jt > 0) {
        jt--;
        return { move: c > w.player.cx ? 'R' : 'L', jump: true };
      }
      const mv = toward(w, c, 5);
      if (mv !== '' && w.player.onGround && pitAhead(w, mv)) {
        jt = 12;
        return { move: mv, jump: true };
      }
      return { move: mv, jump: false };
    },
  };
}
const kovalamRoom = (): Step[] => [walk(8.7, 'into the flags'), follow('hawa', 0, 'go with him to the new flags'), follow('hawa', 1, 'and on again'), ...hopAt(27.2, 12, 'up on the rocks'), walk(31.5)];

/** stand at tile x `tx` (not the strip's middle) through wave `i` of surf `name` */
function standAt(name: string, i: number, tx: number, note: string): Step {
  return {
    note,
    max: 1500,
    until: (w) => (surfOf(w, name)?.i ?? 0) > i,
    policy: (w) => ({ move: toward(w, px(tx), 3), jump: false }),
  };
}

// ------------------------------------------------------------------ TVM-10: Dhara
const dharaRoom = (): Step[] => [
  ...hopAt(7.6, 30, 'over the oil and the trough, from before the oil', true),
  walk(18.3),
  { hold: '', ticks: 24, note: 'stop at the edge of the second trough' },
  { hold: 'R', jump: 16, ticks: 16, note: 'a little hop over it, short of the oil' },
  { hold: 'R', until: ground, max: 300 },
  { hold: '', ticks: 30, note: 'and stop' },
  { hold: 'R', until: X(22.6), max: 300 },
  { hold: 'R', jump: 30, ticks: 30, note: 'over the oil and the kindi', long: true },
  { hold: 'R', until: ground, max: 300 },
  walk(31.5),
];

// ------------------------------------------------------------------ TVM-01: the tour, with Connemara market's fish ice
const die: Step = { hold: 'R', until: (w) => w.state !== 'play', max: 900 };
const ice = (w: World) => w.flags.ice as string | undefined;
/** the market: wait for the ice to move twice (the twitch, then the yank), then a long jump over the drain on to it */
const tvm01Market: Step[] = [
  { hold: 'R', until: X(101.7), max: 900, note: 'up to the fish ice: it twitches' },
  { hold: '', until: (w) => ice(w) === 'done', max: 300, note: 'wait for the yank' },
  { hold: 'R', until: X(102.3), max: 300 },
  { hold: '', ticks: 20, note: 'stop at the edge of the drain' },
  { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a long jump on to the ice' },
  { hold: 'R', until: done, max: 600 },
];
/** the stage-01 plays that need the shared route (built from it, so they can't drift from it) */
function tour01(S: Record<string, Step[]>) {
  // the shared route ends with the old opening road (3 steps): the market replaces it
  const R = S['TVM-01'].slice(0, -3);
  const at = (note: string) => {
    const i = R.findIndex((st) => st.note === note);
    if (i < 0) throw new Error(`TVM-01: no step '${note}'`);
    return i;
  };
  S['TVM-01'] = [...R, ...tvm01Market];
  // the obvious play at the ice: it twitches, you stop, it looks still, you go
  naive['TVM-01'] = { steps: [...R, { hold: 'R', until: (w) => ice(w) === 'twitch', max: 900 }, { hold: '', ticks: 42, note: 'it twitched: stop, it settles' }, die], cause: 'tvm-chaal' };
  const ditch = at('walk into the ditch');
  const tarp = at('let the tarp empty') - 1;
  const rocket = at('over the top of the steps: the rocket goes');
  const canoe = at('hop off: the landing gives way') - 1;
  mistakes['TVM-01'] = [
    { what: 'hop up on to the wall', steps: [...R.slice(0, 3), { hold: 'R', until: (w) => w.player.x + w.player.w >= px(12) - 0.5, max: 200 }, { hold: '', jump: 14, ticks: 14 }, { hold: 'R', until: (w) => w.state !== 'play' || w.player.onGround, max: 200 }, die], cause: 'spikes' },
    { what: 'walk on after the wall', steps: [...R.slice(0, 3), die], cause: 'spikes' },
    { what: 'hop the soaked road, like last time', steps: [{ hold: 'R', until: X(6.3), max: 300 }, { hold: 'R', jump: 10, ticks: 10 }, die], cause: 'fell' },
    { what: 'jump the ditch', steps: [...R.slice(0, ditch), { hold: 'R', until: X(22.4), max: 400 }, { hold: 'R', jump: 12, ticks: 12 }, die], cause: 'spikes' },
    { what: 'jump the ditch, long', steps: [...R.slice(0, ditch), { hold: 'R', until: X(22.9), max: 400 }, { hold: 'R', jump: 30, ticks: 30, long: true }, die], cause: 'spikes' },
    { what: 'walk on under the full tarp', steps: [...R.slice(0, tarp), die], cause: 'tvm-drenched' },
    { what: 'let the tarp empty, then wade the puddle like the ditch', steps: [...R.slice(0, tarp + 2), die], cause: 'splash' },
    { what: 'run on when the rocket goes', steps: [...R.filter((st) => st.note !== 'over the top of the steps: the rocket goes' && !st.note?.startsWith('the rocket goes')), die], cause: 'burnt' },
    { what: 'stop at the foot of the steps when it goes', steps: [...R.slice(0, rocket), { hold: 'R', until: X(52.3), max: 400 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' },
    { what: 'wait on the last step, like last time', steps: [...R.slice(0, rocket), { hold: 'R', until: X(49.9), max: 400 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' },
    { what: 'step off the canoe', steps: [...R.slice(0, canoe), die], cause: 'fell' },
    { what: 'run straight over the fish ice', steps: [...R, die], cause: 'tvm-chaal' },
    { what: 'wait for the ice to stop twitching, then walk on to it', steps: [...R, { hold: 'R', until: (w) => ice(w) === 'twitch', max: 900 }, { hold: '', until: (w) => ice(w) === 'wait', max: 60 }, { hold: '', ticks: 20 }, die], cause: 'tvm-chaal' },
  ];
}

// ------------------------------------------------------------------ TVM-02, 06, 08: the plays that find TVM's things by kind
// (copied from tests/solutions.ts with the tvm- kinds; the door step is the shared one, kept from S)
const px16 = (t: number) => t * 16;
/** TVM-06's fishing nets, in order along the promenade */
const netNo = (i: number) => (w: World): any => w.entities.filter((e: any) => e.kind === 'tvm-net')[i];
/** hop on to something moving: steer over its middle, then drop */
const hopOn = (get: (w: World) => { solid: { x: number; w: number } }, dir: 'R' | 'FWD' = 'R'): Step[] => [
  { hold: dir, jump: 12, ticks: 12 },
  { hold: dir, until: (w) => w.player.onGround || w.player.x + 5 >= get(w).solid.x + get(w).solid.w / 2 - 2, max: 120 },
  { hold: '', until: ground, max: 200 },
];
/** no crow ahead within reach of the next jump */
const noCrow = (w: World) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 24 && e.x - w.player.x < 110);
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
    const bird = w.entities.some((e: any) => e.alive && (e.kind === 'crow' || e.kind === 'tvm-parunthu') && e.vx < 0 && e.x - (p.x + p.w) > -4 && (e.x - (p.x + p.w)) / (-e.vx + Math.max(0, pv)) <= 0.13);
    if (bird && p.onGround) {
      hold = 11;
      return { move: '', jump: true };
    }
    return { move: '', jump: false };
  };
}
function kinds(S: Record<string, Step[]>) {
  const SOLUTIONS = S;
  S['TVM-06'] = [
    { hold: 'R', until: X(2.9), dodge: 1, note: 'wait back from the edge: the swell crashes over it' },
    { hold: '', until: (w) => !w.entities.some((e: any) => e.kind === 'crow' && e.alive && e.x > w.player.x - 20), max: 600, dodge: 1, note: 'hop the crow' },
    { hold: '', until: (w) => (w.flags.net0 ?? 0) >= 0.7 && noCrow(w), max: 900, dodge: 44 },
    { hold: 'R', until: X(4.3), max: 100, note: 'the net is up: to the edge' },
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
    ...S['TVM-06'].slice(-1),
  ];
  S['TVM-08'] = [
    { hold: 'R', until: X(5.6) },
    { hold: '', until: (w) => w.player.onGround && thingOf(w, 'tvm-snakeboat').x > px16(5) + 2, max: 300, note: 'on the boat; off it goes' },
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
    { hold: '', until: (w) => thingOf(w, 'tvm-snakeboat').x >= w.flags.boatEnd - 0.5, max: 1500, dodge: 1, note: 'hop the crows, ride to the finish' },
    { hold: 'R', until: X(86.4), max: 300 },
    { hold: '', until: (w) => w.entities.some((e: any) => e.cells?.[0]?.x === px16(89) && e.popTick >= 0 && !e.popped), max: 300, note: 'spikes in the jetty: let them sink back' },
    ...S['TVM-08'].slice(-1),
  ];
  mistakes['TVM-02'] = [
    {
      what: 'ride at the back of the roof through the bells',
      steps: [
        ...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note?.startsWith('hop the crows'))),
        { hold: 'L', until: (w) => w.player.x <= thingOf(w, 'redbus').solid.x + 12, max: 120 },
        { hold: '', dodge: 60, until: (w) => w.state !== 'play', max: 2000 },
      ],
      cause: 'splash',
    },
    {
      what: 'ride the middle under the first flyover, like last time',
      steps: [
        ...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note?.startsWith('hop the crows'))),
        { hold: 'R', until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 46, max: 200 },
        { hold: '', dodge: 60, until: (w) => w.state !== 'play', max: 2000 },
      ],
      cause: 'crushed',
    },
    {
      what: 'hop the kite like the crows',
      steps: [...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note?.startsWith('ride the middle: the second'))), { policy: hopAnyBird(), until: (w) => w.state !== 'play', max: 2000 }],
      cause: 'hit',
    },
    {
      what: 'run to the front before the second flyover, like last time',
      steps: [
        ...SOLUTIONS['TVM-02'].slice(0, SOLUTIONS['TVM-02'].findIndex((st) => st.note?.startsWith('ride the middle: the second'))),
        { hold: '', dodge: 60, until: (w) => thingOf(w, 'redbus').solid.x >= px16(50), max: 2000 },
        { hold: 'R', dodge: 60, until: (w) => w.player.x >= thingOf(w, 'redbus').solid.x + 70, max: 200 },
        { hold: '', dodge: 60, until: (w) => w.state !== 'play', max: 2000 },
      ],
      cause: 'crushed',
    },
  ];
}

/** like the route bot's dodge reflex, but timed for a person: hop anything coming at Dad once it's `lead` s away
 *  (the bot hops at 0.13 s; a late press then lands in the jeep) */
function earlyHop(hold: Move, lead: number): (w: World) => Out {
  let jt = 0,
    last = -1;
  return (w) => {
    if (w.tick < last) jt = 0;
    last = w.tick;
    if (jt > 0) {
      jt--;
      return { move: hold, jump: true };
    }
    const p = w.player;
    if (!p.onGround) return { move: hold, jump: false };
    const gs: any = p.groundSolid;
    const pv = p.vx + (gs ? (gs.velX ?? 0) : 0);
    for (const e of w.entities as any[]) {
      if (!e.alive || e.vx === undefined || e.x === undefined || !e.hazard?.active) continue;
      const ew = e.w ?? 12,
        eh = e.h ?? 12;
      if (e.y + eh < p.y - 6 || e.y > p.y + p.h + 2) continue;
      const ahead = e.x - (p.x + p.w),
        behind = p.x - (e.x + ew);
      const t = e.vx < 0 && ahead > -4 ? ahead / (-e.vx + Math.max(0, pv)) : e.vx > 0 && behind > -4 ? behind / (e.vx + Math.max(0, -pv)) : 99;
      if (t <= lead) {
        jt = 11;
        return { move: hold, jump: true };
      }
    }
    return { move: hold, jump: false };
  };
}
/** swap the bot's dodge reflex for a person's hop on the step of `id` noted `note` */
function earlier(S: Record<string, Step[]>, id: string, note: string, lead: number) {
  S[id] = S[id].map((st) => (st.dodge && st.note === note ? { ...st, dodge: undefined, policy: earlyHop((st.hold === 'FWD' ? 'R' : st.hold) ?? '', lead) } : st));
}

const solutions = (S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) => {
  tour01(S);
  kinds(S);
  // TVM-05, a person's timing (stage unchanged): on the hop to the last moat stone let go of right earlier, so a
  // late hop (held a little longer) still lands on the stone and not past it in the bank's mud
  {
    // the FIX (run on under the second gate after the long jump) stays the shipped play, from the unchanged route
    const was = S['TVM-05'];
    fix['TVM-05'] = { steps: [...was.slice(0, was.findIndex((st) => st.note === 'off the last stone, long: past the mud on the bank') + 1), { hold: 'R', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' };
    S['TVM-05'] = [...was];
    const r = S['TVM-05'];
    const i = r.findIndex((st) => st.note === 'off the last stone, long: past the mud on the bank') - 3;
    r[i] = { ...r[i], until: (w: World) => w.player.onGround || w.player.x + 5 >= 47 * 16 + 16 - 12 };
  }
  // TVM-03, a person's timing (stage unchanged): hop the sliding glasses a moment before the bot would
  earlier(S, 'TVM-03', 'hop the glasses', 0.18);
  // TVM-06, a person's timing (stage unchanged): on the hop on to the last net, let go of right over its middle
  // (a late hop held a little longer flies past it on to the bank, under the stones)
  {
    const r = S['TVM-06'];
    const i = r.findIndex((st) => st.note === 'onto the last net');
    r.splice(i + 1, 1, { hold: 'R', until: (w) => w.player.onGround || w.player.x + 5 >= netNo(4)(w).solid.x + netNo(4)(w).solid.w / 2 - 10, max: 200 }, { hold: '', until: ground, max: 200 });
  }
  // TVM-07, a person's timing (the stage is unchanged): hop each jeep a moment before the bot would, and go
  // over the boulder a little earlier, so a late press still clears it
  earlier(S, 'TVM-07', 'hop the jeep coming down', 0.15);
  earlier(S, 'TVM-07', 'it backs up: stop and hop it', 0.15);
  S['TVM-07'] = S['TVM-07'].map((st) =>
    st.note === 'let the landslide boulder come to you'
      ? { ...st, until: (w: World) => w.entities.some((e: any) => e.kind === 'boulder' && e.alive && e.y > 100 && e.x - (w.player.x + 10) <= 28) }
      : st,
  );
  S['TVM-09'] = kovalamRoom();
  lengthen('TVM-09', 0, []);
  S['TVM-10'] = dharaRoom();
  lengthen('TVM-10', 0, []);
  {
    const r = S['TVM-10'];
    const i = r.findIndex((st) => st.note === 'walk across the soaked sand to the new flags');
    mistakes['TVM-10'].push({ what: 'jump the dark sand on the way to the flags (it looks like the rip)', steps: [...r.slice(0, i), { hold: 'R', until: X(32 + 34 + 30 + 9.6), max: 300 }, { hold: 'R', jump: 30, ticks: 30, long: true }, die], cause: 'tvm-soaked' });
    const u = r.findIndex((st) => st.note === 'stop at the edge of the first trough');
    mistakes['TVM-10'].push({ what: 'in the treatment rooms, the long jump first, like the hall', steps: [...r.slice(0, u + 1), { hold: 'R', jump: 30, ticks: 30, long: true }, die], cause: 'tvm-kindi' });
    // every finale act: the obvious play (A1) and the obvious fix (A2), each dying to its own trap
    const at = (note: string) => {
      const n = r.findIndex((st) => st.note === note);
      if (n < 0) throw new Error(`TVM-10: no step '${note}'`);
      return n;
    };
    const stay: Step = { hold: '', until: (w) => w.state !== 'play', max: 900 };
    mistakes['TVM-10'].push(
      { what: 'courtyard A1: walk on under the full tarp', steps: [...r.slice(0, at('stop short of the tarp')), die], cause: 'tvm-drenched' },
      { what: 'courtyard A2: let the tarp empty, jump the trough, walk on over the oil by the palm and get up there', steps: [...r.slice(0, at('over the trough') + 2), { hold: 'R', until: (w) => w.player.stun > 0, max: 300 }, stay], cause: 'coconut' },
      { what: 'Thumba A1: walk on when the rocket goes', steps: [...r.slice(0, at('through the gate: the rocket goes')), die], cause: 'burnt' },
      { what: 'shore A1: stay in the flags you were in', steps: [...r.slice(0, at('walk across the soaked sand to the new flags')), stay], cause: 'tvm-rip' },
      { what: 'palm beach A1: stay in the flags you were in', steps: [...r.slice(0, at('in the new flags, clear of the palm')), stay], cause: 'tvm-rip' },
      { what: 'treatment rooms A1: walk on', steps: [...r.slice(0, at('stop at the edge of the first trough') - 1), die], cause: 'tvm-droni' },
      { what: 'tarp beach A2: stay in the flags you were in, away from the tarp', steps: [...r.slice(0, at('up to the tarp')), stay], cause: 'tvm-rip' },
      { what: 'Chalai A1: walk on', steps: [...r.slice(0, at('up to the fish ice: it twitches')), die], cause: 'tvm-chaal' },
      { what: 'Chalai A2: wait for the yank, jump on to the ice, walk off on to the oil', steps: [...r.slice(0, at('a long jump on to the ice') + 2), die], cause: 'tvm-kindi' },
    );
    const c = r.findIndex((st) => st.note === 'up to the fish ice: it twitches');
    mistakes['TVM-10'].push({ what: 'at Chalai, step on to the ice after the twitch', steps: [...r.slice(0, c + 1), { hold: '', ticks: 20 }, { hold: 'R', jump: 30, ticks: 30, long: true }, { hold: '', until: (w) => w.state !== 'play', max: 300 }], cause: 'tvm-chaal' });
    const g = r.findIndex((st) => st.note === 'through the gate: the rocket goes');
    mistakes['TVM-10'].push({ what: 'stop short of the rocket fire, like the tour', steps: [...r.slice(0, g), { hold: 'R', until: (w) => w.player.x >= px(32 + 34 + 13.2), max: 600 }, { hold: '', until: (w) => w.state !== 'play', max: 600 }], cause: 'crushed' });
    const k = r.findIndex((st) => st.note === 'in the new flags, clear of the palm');
    mistakes['TVM-10'].push({ what: 'stand in the middle of the flags, under the palm', steps: [...r.slice(0, k), follow('kadappuram', 0, 'to the middle of the strip'), die], cause: 'coconut' });
    const t = r.findIndex((st) => st.note === 'up to the tarp');
    mistakes['TVM-10'].push({ what: 'walk straight into the flags under the full tarp', steps: [...r.slice(0, t), follow('thira', 0, 'to the middle of the strip'), die], cause: 'tvm-drenched' });
  }
};

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'TVM-09': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'tvm-drift' },
  'TVM-10': { steps: [{ hold: 'R', until: done, max: 900 }], cause: 'tvm-droni' },
};

const fix: Record<string, { steps: Step[]; cause?: string }> = {
  // first death: ran on out of the strip. So: stop in the flags you reached... and he moves them again
  'TVM-09': { steps: [walk(8.7), follow('hawa', 0, 'to the new flags'), until(done, 'and stay in them', 900)], cause: 'tvm-rip' },
  // first death: slid off the oil into the trough. So: jump long from before the oil, every trough
  'TVM-10': { steps: [...hopAt(7.6, 30, 'from before the oil', true), walk(18.4), ...hopAt(18.7, 30, 'the same long jump', true), { hold: 'R', until: done, max: 300 }], cause: 'tvm-kindi' },
};

const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'TVM-09': [{ what: 'stand still in the first flags', steps: [walk(8.7), until(done, 'stay', 900)], cause: 'tvm-rip' }],
  'TVM-10': [{ what: 'jump the first trough from its edge', steps: [...hopAt(9.4, 30, 'from the edge, on the oil'), { hold: 'R', until: done, max: 300 }], cause: 'tvm-droni' }],
};

const actRoutes: Record<string, (x: number) => Step[]> = {
  'tvm09-vilakku': (x) => [walk(x + 10.2, 'into the flags'), follow('vilakku', 0, 'back with him, behind you'), walk(x + 18.2), follow('vilakku', 1, 'far on, over the rock pool'), ...hopAt(x + 36.2, 12, 'up on the rocks'), walk(x + 39.5)],
  'tvm09-samudra': (x) => [walk(x + 4.7, 'into the flags'), follow('samudra', 0, 'with the flags till he stops'), walk(x + 14.4, 'on'), follow('samudra', 1, 'the long run on'), ...hopAt(x + 30.2, 12, 'up on the rocks'), walk(x + 33.5)],
  'tvm09-ashoka': (x) => [walk(x + 6.6, 'into the flags'), follow('ashoka', 0, 'he paces and puts them back: stay'), follow('ashoka', 1, 'then on with him'), ...hopAt(x + 26.2, 12, 'up on the rocks'), walk(x + 29.5)],
  'tvm09-pozhikkara': (x) => [walk(x + 6.6, 'into the flags'), follow('pozhikkara', 0, 'far on, over the rock pool'), walk(x + 27.2, 'on'), follow('pozhikkara', 1, 'and back over it'), ...hopAt(x + 11.9, 12, 'over the pool again, on'), ...hopAt(x + 28.2, 12, 'up on the rocks'), walk(x + 31.5)],
  'tvm10-theeram': (x) => [
    ...hopAt(x - 0.9, 12, 'up on the rocks'),
    walk(x + 7.2, 'into the flags'),
    follow('theeram', 0, 'walk across the soaked sand to the new flags'),
    walk(x + 27.7, 'on'),
    follow('theeram', 1, 'and walk back across it'),
    { hold: 'R', until: X(x + 34.1), max: 600, note: 'and walk on across it' },
    follow('theeram', 2, 'back to the flags on the soaked sand'),
    { hold: 'R', until: X(x + 34.2), max: 600, note: 'and on across it to the rocks' },
    ...hopAt(x + 34.2, 12, 'up on the rocks'),
    walk(x + 37.5),
  ],
  'tvm10-chanda': (x) => [
    walk(x + 6.7, 'up to the fish ice: it twitches'),
    until((w) => w.flags.ice === 'done', 'wait for the yank', 300),
    { hold: 'R', until: X(x + 7.3), max: 300 },
    { hold: '', ticks: 20, note: 'stop at the edge of the drain' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'a long jump on to the ice' },
    { hold: 'R', until: ground, max: 300 },
    { hold: '', ticks: 20, note: 'stop on the ice, short of the oil' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the oil and the kindi' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 29.5),
  ],
  'tvm10-thumba': (x) => [
    { hold: 'R', until: X(x + 6.1), max: 600, note: 'through the gate: the rocket goes' },
    until((w) => w.flags.thumba.stage === 'down' && !w.flags.thumba.burning, 'stop at once; let both stages come down and the fire die', 600),
    ...hopAt(x + 6.6, 14, 'over the booster'),
    walk(x + 11.4),
    ...hopAt(x + 11.6, 14, 'over the last stage'),
    walk(x + 29.2),
  ],
  'tvm10-kadappuram': (x) => [
    walk(x + 6.7, 'into the flags'),
    standAt('kadappuram', 0, x + 12.8, 'in the new flags, clear of the palm'),
    follow('kadappuram', 1, 'back with him'),
    walk(x + 21.2, 'on'),
    follow('kadappuram', 2, 'with him'),
    walk(x + 30.4, 'on'),
    follow('kadappuram', 3, 'a little way back'),
    walk(x + 35.2),
  ],
  'tvm10-thira': (x) => [
    ...hopAt(x - 0.9, 12, 'up on the rocks'),
    walk(x + 7.2, 'into the flags'),
    { hold: 'R', until: X(x + 10.7), max: 300, note: 'up to the tarp' },
    { hold: 'L', until: (w) => w.player.x <= px(x + 9.8), max: 120, note: 'and back off' },
    until((w) => w.flags.thiraTarp.state === 'empty', 'let it empty', 400),
    standAt('thira', 0, x + 14, 'in the flags under the empty tarp'),
    walk(x + 18.7, 'on'),
    follow('thira', 1, 'with him'),
    walk(x + 29.2, 'on'),
    follow('thira', 2, 'and back'),
    ...hopAt(x + 30.2, 12, 'up on the rocks'),
    walk(x + 33.2),
  ],
  'tvm10-uzhichil': (x) => [
    walk(x + 4.3),
    { hold: '', ticks: 24, note: 'stop at the edge of the first trough' },
    { hold: 'R', jump: 12, ticks: 12, note: 'a short hop, short of the oil' },
    { hold: 'R', until: ground, max: 300 },
    { hold: '', ticks: 30 },
    { hold: 'R', until: X(x + 8.6), max: 300 },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the oil and the kindi' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 15.2),
    { hold: '', ticks: 24, note: 'stop before the oil' },
    { hold: 'R', jump: 30, ticks: 30, long: true, note: 'over the oil and the last trough' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 24.8),
  ],
  'tvm10-kizhi': (x) => [
    walk(x + 6.0, 'stop short of the tarp'),
    until((w) => w.flags.kizhi.tarp.state === 'empty', 'let it empty: it washes the oil off'),
    walk(x + 10.3),
    { hold: '', ticks: 24, note: 'stop on the washed edge' },
    { hold: 'R', jump: 16, ticks: 16, note: 'over the trough' },
    { hold: 'R', until: ground, max: 300 },
    walk(x + 18.6),
    ...hopAt(x + 18.9, 14, 'over the oil by the palm'),
    walk(x + 32.8),
  ],
};

const endingPolicies: Record<string, Policy> = {
  // the old knock, under its prefixed name (same play as tests/endings.ts 'knock')
  'tvm-knock'(w, m, d) {
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8));
    if (Math.abs(p.cx - (d.x + 8)) > 3) return go(toward(w, d.x + 8, 1));
    if (!p.onGround || w.input.jump) return go('');
    m.hold = 7;
    return { move: '', jump: true };
  },
  'tvm-backwash-ride'(w, m, d) {
    const D = d.x / 16;
    const ph = w.flags.backwash as string;
    if (m.go) return go('R');
    if (w.player.cx < px(D - 28.8)) return go('R');
    if (ph === 'in') m.seen = true;
    if (ph === 'back' && m.seen) m.go = true;
    return go('');
  },
  'tvm-oily-feet-coir-mat'(w, m, d) {
    const D = d.x / 16;
    const p = w.player;
    if (p.cx >= px(D - 3.6) && p.cx < px(D - 1) && p.onGround && !m.j) {
      m.j = 1;
      m.hold = 13;
      return { move: 'R', jump: true };
    }
    return go(toward(w, d.x + 8, 1));
  },
};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['TVM-09', 'TVM-10'],
};
