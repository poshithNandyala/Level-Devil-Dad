// Proven routes for Lucknow: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';
import { LEVEL_BY_ID } from '../../src/game/levels';
import { HAWA, JHANDE as JHANDE_L, GIRAH, after } from '../../src/game/cities/lko/s09';

type Move = 'L' | 'R' | '';
type Out = { move: Move; jump: boolean };
type Mem = { hold: number; [k: string]: any };
type Policy = (w: World, m: Mem, d: Door) => Out;
const px = (t: number) => t * 16;
const go = (move: Move): Out => ({ move, jump: false });
const toward = (w: World, x: number, slack = 2): Move => {
  const c = w.player.cx;
  return c < x - slack ? 'R' : c > x + slack ? 'L' : '';
};
const done = (w: World) => w.state !== 'play';
const until = (f: (w: World) => boolean, max = 900, note = ''): Step => ({ hold: '', until: f, max, note });
const runTo = (tx: number, max = 900, note = ''): Step => ({ hold: 'R', until: and(ground, X(tx)), max, note });
const walkTo = (tx: number, max = 900, note = ''): Step => ({ policy: (w) => go(toward(w, px(tx) + 8, 1)), until: (w) => w.player.onGround && Math.abs(w.player.cx - (px(tx) + 8)) <= 2 && Math.abs(w.player.vx) < 1, max, note });
/** run right and hop a gap whose near edge is at tile `gx` (tap jump, taken early enough for a slow thumb) */
const hop = (gx: number, land: number, note = '', lead = 22, hold = 12): Step => {
  let jt = 0;
  let W: World | null = null;
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
      if (p.onGround && p.x + p.w >= px(gx) - lead && p.x < px(gx)) {
        jt = hold - 1;
        return { move: 'R', jump: true };
      }
      return go('R');
    },
    until: and(ground, X(land)),
    max: 600,
    note,
  };
};
/** steer in the air to land on x: let go early enough to drift to a stop there (air brakes are soft) */
const airTo = (w: World, x: number): Move => {
  const p = w.player;
  const dx = x - p.cx;
  const stop = (p.vx * p.vx) / 1800 + 2;
  if (dx > 0) return p.vx > 0 && dx < stop ? '' : 'R';
  return p.vx < 0 && -dx < stop ? '' : dx < -2 ? 'L' : '';
};
/** hop from platform to platform: each target is a tile column (its centre), with an optional wait before leaving for it */
const hops = (targets: (number | [number, (w: World) => boolean])[], note = '', hold = 12, reach = 44): Step => {
  let W: World | null = null;
  let i = 0,
    jt = 0;
  const T = targets.map((t) => (Array.isArray(t) ? { c: px(t[0]) + 8, wait: t[1] } : { c: px(t) + 8, wait: null as null | ((w: World) => boolean) }));
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        i = 0;
        jt = 0;
      }
      const p = w.player;
      const t = T[Math.min(i, T.length - 1)];
      if (jt > 0) {
        jt--;
        return { move: toward(w, t.c, 1), jump: true };
      }
      if (!p.onGround) return go(airTo(w, t.c));
      if (Math.abs(p.cx - t.c) <= 9) {
        if (i >= T.length - 1) return go(toward(w, t.c, 3));
        const n = T[i + 1];
        if (n.wait && !n.wait(w)) return go('');
        i++;
        jt = hold - 1;
        return { move: toward(w, n.c, 1), jump: true };
      }
      if (t.wait && !t.wait(w)) return go('');
      if (Math.abs(t.c - p.cx) <= 14) return go(toward(w, t.c, 1));
      if (Math.abs(t.c - p.cx) <= reach + Math.abs(p.vx) * 0.13) {
        // a careful player stops at the edge, then jumps
        if (Math.abs(p.vx) > 30) return go('');
        jt = hold - 1;
        return { move: toward(w, t.c, 1), jump: true };
      }
      return go(toward(w, t.c, 1));
    },
    until: (w) => w.player.onGround && Math.abs(w.player.cx - T[T.length - 1].c) <= 9 && i >= T.length - 1,
    max: 2400,
    note,
  };
};
const flag = (k: string) => (w: World) => w.flags[k];
const actFlag = (id: string, k: string) => (w: World) => w.flags[`${id}:${k}`];

// ================================================================ LKO-02
const room02: Step[] = [
  runTo(8.2, 300, 'up to the haveli: the two gentlemen step into the doorway'),
  until((w) => w.flags.pehle?.s === 'offer', 900, 'stand still (a bow): one goes first and the stone drops under him'),
  hop(15, 17.5, 'take the second one’s offer and hop the hole'),
  runTo(31, 400),
];

// ================================================================ LKO-03
const room03: Step[] = [
  runTo(3.5, 200),
  hops([6, [9, (w) => w.flags.chhapa >= 2], 12, 15, 18, 21, 24], 'on to the first flower, wait out both whistles, then flower to flower'),
  hop(25, 27),
  runTo(31, 400),
];

// ================================================================ LKO-04
const lid = (w: World) => w.flags.malai?.lid ?? 0;
const room04: Step[] = [
  runTo(4, 200),
  hops([6, 9, 12], 'on the shady (left) tile of each heap: the sun is on the right'),
  until((w) => lid(w) > 0, 600, 'the halwai starts to lift his lid'),
  { policy: (w) => go(toward(w, px(13), 1)), until: (w) => lid(w) >= 1, max: 300, note: 'straddle the middle of the heap while it goes up' },
  hops([13, 16, 19, 22, 25], 'now the light comes from the left: the right tiles'),
  hop(26, 27.5),
  runTo(31, 300),
];

// ================================================================ LKO-05
const kflat = (key: string, i: number) => (w: World) => (w.flags[key] ?? [])[i]?.flat;
const room05: Step[] = [
  runTo(3.5, 200),
  hops([6, [9, kflat('kebabs', 0)], [12, kflat('kebabs', 1)], [15, kflat('kebabs', 2)], [18, kflat('kebabs', 3)], [21, kflat('kebabs', 4)], [24, kflat('kebabs', 5)], [26.5, kflat('kebabs', 6)]], 'squash each heap, then hop'),
  runTo(31, 300),
];

// ================================================================ LKO-06
const room06: Step[] = [
  walkTo(5.9, 200),
  hops([8.5, 10.6, 13.3, 15.6, 18.3, 20.5], 'over each red strip on to plain boards, then up on to the takht'),
  runTo(25.6, 300, 'along the takht, over the board she taps'),
  runTo(31, 300),
];

// ================================================================ LKO-07
const pause = (note = 'pause a moment'): Step => ({ hold: '', until: (w) => w.player.onGround && Math.abs(w.player.vx) < 5, max: 120, note });
const room07: Step[] = [
  runTo(7, 200),
  hop(9, 11.3, 'over the nala'),
  pause('pause before the strollers'),
  runTo(31, 400, 'stroll up: they part'),
];
type LL = { x: number; s: string; done: boolean; lamps: number[] };
const behindLamp = (key: string, passTo: number): Step => ({
  policy: (w) => {
    const l = w.flags[key] as LL;
    const p = w.player;
    if (l.s === 'up' || l.done || !l.lamps.length) return go('R');
    if (p.x > l.x + 8) return go('R');
    // follow, but well back from the swing
    return go(p.cx < l.x - 70 ? 'R' : '');
  },
  until: and(ground, X(passTo)),
  max: 1500,
  note: 'hang back while the ladder swings, go under while he is up',
});

// ================================================================ LKO-08
const room08: Step[] = [
  runTo(18, 500, 'walk through the first arch, over the drain, no hop'),
  hop(21.6, 23, 'through the second arch at a jump, up to the ledge past the well', 30),
  runTo(31.5, 300),
];

// ================================================================ LKO-09
type Fl = { order: (w: World) => { c: string; left: number } };
const redNow = (key: string, need = 1.0) => (w: World) => {
  const o = (w.flags[key]?.f as Fl | undefined)?.order(w);
  return !!o && o.c === 'red' && o.left > need;
};
const redSeen = (key: string) => (w: World) => {
  const f = w.flags[key]?.f as (Fl & { seen: (w: World) => string }) | undefined;
  return !!f && f.seen(w) === 'red' && f.order(w).left > 0.6;
};
const room09: Step[] = [
  walkTo(6.1, 300),
  hops([[8.6, redNow('kabootar')], 14.1, [17.6, redNow('kabootar')], 20.1, [23.6, redNow('kabootar')], 28], 'roof to roof, only early in the red'),
  runTo(31.5, 300),
];

// ================================================================ LKO-10
const room10: Step[] = [
  walkTo(10.6, 400, 'up to the plain board (the gentlemen step into the doorway)'),
  until((w) => w.flags.pehle?.s === 'offer', 900, 'bow on the plain board: one goes first'),
  hop(19, 21.6, 'walk over the covers, take his offer, hop the hole'),
  runTo(31, 400),
];

// ================================================================ LKO-01
/** walk right, hopping whatever is in the way (a step up, a post, a ditch), up to tile tx */
const stroll = (tx: number, note = ''): Step => {
  let jt = 0;
  let W: World | null = null;
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
      const feet = p.y + p.h;
      const ahead = Math.floor((p.x + p.w + 6) / 16);
      const wall = w.isSolidTile(w.tileAt(ahead, Math.floor((feet - 2) / 16))) || !!w.solidAt(p.x + p.w + 4, p.y + 2, 3, p.h - 4);
      const hole = !w.isSolidTile(w.tileAt(ahead, Math.floor((feet + 2) / 16))) && !w.isSolidTile(w.tileAt(Math.floor((p.x + p.w) / 16), Math.floor((feet + 2) / 16)));
      if (wall || hole) {
        jt = 13;
        return { move: 'R', jump: true };
      }
      return go('R');
    },
    until: and(ground, X(tx)),
    max: 1500,
    note,
  };
};
const room01: Step[] = [
  stroll(37, 'past the Rumi Darwaza, over the ditch and up and down the steps'),
  walkTo(37.3, 200),
  hops([40, 41.4, 44.6, 45.4, 48.6, 49.4, 51.8], 'bolt to bolt, off each before the hook gets its grip'),
  runTo(59, 300, 'straight under the unrolling bolt, before its roller comes down'),
  stroll(111, 'Hazratganj, the bollards, the thela, the wall and the deck'),
  { hold: 'R', until: done, max: 600 },
];

function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  S['LKO-01'] = room01;
  S['LKO-02'] = room02;
  lengthen('LKO-02', 0, []);
  S['LKO-03'] = room03;
  lengthen('LKO-03', 0, []);
  S['LKO-04'] = room04;
  lengthen('LKO-04', 0, []);
  S['LKO-05'] = room05;
  lengthen('LKO-05', 0, []);
  S['LKO-06'] = room06;
  lengthen('LKO-06', 0, []);
  S['LKO-07'] = room07;
  lengthen('LKO-07', 0, []);
  S['LKO-08'] = room08;
  lengthen('LKO-08', 0, []);
  S['LKO-09'] = room09;
  lengthen('LKO-09', 0, []);
  S['LKO-10'] = room10;
  lengthen('LKO-10', 0, []);
}

const naive: Record<string, { steps: Step[]; cause?: string }> = {
  'LKO-01': { steps: [stroll(37), walkTo(37.3, 200), hops([40], 'on to the first bolt, and look around'), until(done, 400)], cause: 'lko-than' },
  'LKO-02': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk straight in' }], cause: 'lko-pehle' },
  'LKO-03': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk out along the printed vine' }], cause: 'lko-chhapa' },
  'LKO-04': { steps: [runTo(4, 200), hops([7], 'line up on the far edge of the first heap'), { policy: (w) => go(toward(w, px(7) + 9, 1)), until: done, max: 400 }], cause: 'lko-malai' },
  'LKO-05': { steps: [runTo(3.5, 200), hops([6, 9, 12], 'hop along the heaps'), until(done, 300)], cause: 'lko-seekh' },
  'LKO-06': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk across the stage' }], cause: 'lko-chakkar' },
  'LKO-07': { steps: [runTo(7, 200), hop(9, 11.3), { hold: 'R', until: done, max: 900, note: 'on along the arcade at a run' }], cause: 'lko-ganj' },
  'LKO-08': { steps: [runTo(5, 200), hop(7, 9, 'hop the little drain into the arch'), { hold: 'R', until: done, max: 600 }], cause: 'lko-bhool' },
  'LKO-09': { steps: [walkTo(6.1, 300), hops([8.6, 14.1, 17.6, 20.1, 23.6, 28], 'roof to roof, never mind the flag'), until(done, 300)], cause: 'lko-kabootar' },
  'LKO-10': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk straight in' }], cause: 'lko-pehle' },
};

const fix: Record<string, { steps: Step[]; cause?: string }> = {
  'LKO-01': { steps: [...room01.slice(0, 3), { hold: '', ticks: 40, note: 'catch your breath after the bolts' }, { hold: 'R', until: done, max: 400 }], cause: 'lko-parda' },
  'LKO-02': { steps: [runTo(8.2), until(done, 900, 'bow, and keep bowing')], cause: 'lko-dhakka' },
  'LKO-10': { steps: [walkTo(13.5, 400, 'up to the gentlemen'), until(done, 600, 'and bow, as learned')], cause: 'lko-tehzeeb' },
  'LKO-08': { steps: [{ hold: 'R', until: done, max: 900, note: 'walk, as learned, through every arch' }], cause: 'lko-kuan' },
  'LKO-07': { steps: [...room07.slice(0, 3), runTo(32 + 8, 400), pause('stroll on, as learned'), runTo(32 + 14, 300), pause(), until(done, 300)], cause: 'lko-shamiyana' },
  'LKO-06': { steps: [walkTo(5.9, 200), hops([8.5, 10.6, 13.3, 15.6, 18.3], 'plain boards only'), { hold: 'R', until: done, max: 600 }], cause: 'lko-tatkar' },
  'LKO-05': { steps: [runTo(3.5, 200), hops([6]), until(done, 600, 'wait on it, to be sure')], cause: 'lko-tawa' },
  'LKO-04': { steps: [runTo(4, 200), hops([6, 9, 12], 'the shady left tiles, as learned'), until(done, 900, 'wait on it')], cause: 'lko-dhakkan' },
  'LKO-03': { steps: [runTo(3.5, 200), hops([6, 7, 9, 12, 13, 15, 17, 18, 21, 22, 24], 'every white tile in turn, jali too', 12, 30), until(done, 600)], cause: 'lko-jali' },
};

const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {
  'LKO-02': [
    {
      what: 'in the gali, walking on when the man offers the way',
      steps: [...room02, { hold: 'R', until: done, max: 900 }],
      cause: 'lko-pehle',
    },
  ],
};

const actX = (id: string, i = 0) => {
  const d = LEVEL_BY_ID.get(id)!;
  return d.parts!.filter((p) => !p.kind.startsWith('_'))[i].x0;
};
const doorX = (id: string) => LEVEL_BY_ID.get(id)!.doorX!;
const actRoutes: Record<string, (x: number) => Step[]> = {
  'lko02-gali': (x) => [
    runTo(x + 4.2, 300, 'the man behind offers the way'),
    until((w) => ['go', 'done'].includes(w.flags['lko02-gali:man']?.s) && w.flags['lko02-gali:man'].s === 'done', 900, 'stand still: he goes first'),
    hop(x + 12, x + 15),
    runTo(x + 30),
  ],
};

const R_lko03_kunda = (id: string) => (x: number): Step[] => [runTo(x + 1.5, 300), { hold: 'R', until: and(ground, X(x + 39)), max: 900, note: 'run each print without stopping' }];
actRoutes['lko03-kunda'] = R_lko03_kunda('lko03-kunda');

const R_lko04_chowk = (id: string) => (x: number): Step[] => [
  runTo(x + 1.5, 300),
  hops([x + 4, x + 6, x + 9, x + 12, x + 14], 'cups in the long shadow, quickly: the shadows are shrinking'),
  runTo(x + 18.5, 300),
  hops([x + 20, x + 22, x + 25, x + 28, x + 31]),
  runTo(x + 35, 300),
];
actRoutes['lko04-chowk'] = R_lko04_chowk('lko04-chowk');

const R_lko05_tawa = (id: string) => (x: number): Step[] => {
  const k = `${id}:kebabs`;
  const cols = [...Array.from({ length: 5 }, (_, i) => 6 + 3 * i), 20.5];
  return [runTo(x + 0.5, 300), hops([x + 3, ...cols.map((c, i) => [x + c, kflat(k, i)] as [number, (w: World) => boolean])], 'thin ones at once, thick ones once squashed'), runTo(x + 23.5, 300)];
};
actRoutes['lko05-tawa'] = R_lko05_tawa('lko05-tawa');
actRoutes['lko02-takrar'] = (x) => [
  runTo(x + 6.4, 300, 'up to the doorway: he bows'),
  until((w) => w.flags['lko02-takrar:g']?.s === 'done', 1200, 'keep bowing till he gives up and goes first'),
  hop(x + 13, x + 15.5, 'over the hole he left'),
  runTo(x + 23, 300),
];
const aadaabOk = (i: number) => (w: World) => (w.flags[`lko02-aadaab:g${i}`] as { s: string } | undefined)?.s === 'ok';
actRoutes['lko02-aadaab'] = (x) => [
  ...[6, 16].flatMap((n, i) => [walkTo(x + n - 2.5, 300, 'up to the gentleman: he greets you'), until(aadaabOk(i), 300, 'a short bow back'), hop(x + n + 2, x + n + 4.5, 'on, over the nala')]),
  runTo(x + 23, 300),
];
const rangPh = (w: World) => ((w.flags['lko03-rang:ph'] as ((w: World) => number) | undefined)?.(w) ?? -1);
/** the far half has just come up out of the dye */
const rangUp = (w: World) => {
  const p = rangPh(w);
  return p >= 0 && p < 40;
};
actRoutes['lko03-rang'] = (x) => [
  walkTo(x + 2, 300),
  hops([x + 4, x + 7, x + 10], 'on to the near flowers'),
  until(rangUp, 900, 'wait till his half comes up out of the dye'),
  hops([x + 10, x + 13, x + 16, x + 19.5], 'his half in one go'),
  runTo(x + 23, 300),
];
const hoopK = (w: World) => (w.flags['lko03-adda:hoop'] as { k: number }).k;
actRoutes['lko03-adda'] = (x) => [
  walkTo(x + 4.5, 400, 'into the hoop'),
  until((w) => hoopK(w) === 4, 1500, 'ride the hoop from flower to flower'),
  hops([x + 29.1, x + 32.6], 'off the far side'),
  runTo(x + 35, 300),
];
const BADAL = [4, 6.5, 9, 11.5, 18.5, 21, 23.5, 26, 28.5];
/** a cup is safe to land on when the cloud's shadow covers it with room to spare */
const shaded = (x: number, d: number) => (w: World) => {
  const B = w.flags['lko04-badal:cloud'] as { x: number; w: number };
  const cx = px(x + d) + 8;
  return cx > B.x - B.w / 2 + 36 && cx < B.x + B.w / 2 - 18;
};
actRoutes['lko04-badal'] = (x) => [
  walkTo(x + 2.4, 300),
  hops([...BADAL.slice(0, 4).map((d) => [x + d - 0.5, shaded(x, d)] as [number, (w: World) => boolean]), x + 13.4], 'cup to cup inside the cloud’s shadow, to the chabutra'),
  hops([x + 13.4, x + 16.5, ...BADAL.slice(4).map((d) => [x + d - 0.5, shaded(x, d)] as [number, (w: World) => boolean]), x + 31.6], 'and on with it'),
  runTo(x + 34, 300),
];
const DUM = [3, 6, 9, 12, 15];
actRoutes['lko05-dum'] = (x) => {
  const k = 'lko05-dum:kebabs';
  const cols = [...DUM.slice(1).map((d) => d + 0.1), 19.5];
  return [runTo(x + 0.5, 300), hops([x + 3, ...cols.map((c, i) => [x + c, kflat(k, i)] as [number, (w: World) => boolean])], 'wait for every squash, then hop'), runTo(x + 21, 300)];
};
const sizzling = (i: number) => (w: World) => !!(w.flags['lko05-ghee:heaps'] as { low: boolean }[] | undefined)?.[i]?.low;
const spit = (lo: number, hi: number) => (w: World) => {
  const f = w.flags['lko05-charkhi:state'] as ((w: World) => { flatFor: number }) | undefined;
  const n = f ? f(w).flatFor : -1;
  return n >= lo && n < hi;
};
actRoutes['lko05-charkhi'] = (x) => [
  walkTo(x + 0.8, 300),
  hops([[x + 4, spit(0, 22)], [x + 7, spit(0, 22)], [x + 10, spit(0, 22)], [x + 13, spit(0, 22)], [x + 16.6, spit(0, 22)]], 'heap to heap, the moment the skewers come up flat'),
  runTo(x + 18, 300),
];
actRoutes['lko05-ghee'] = (x) => [
  runTo(x + 0.6, 300),
  hops([x + 3, [x + 6, sizzling(0)], [x + 9, sizzling(1)], [x + 12, sizzling(2)], [x + 15.6, sizzling(3)]], 'heap to heap, each time the ladle makes it sizzle'),
  runTo(x + 17, 300),
];
const R_lko05_lane = (id: string) => (x: number): Step[] => [
  runTo(x + 1.2, 300),
  hops([x + 3], 'on to the end of the slab'),
  until(kflat(`${id}:slab`, 0), 300, 'it squashes under you'),
  { hold: 'R', until: and(ground, X(x + 26)), max: 1200, note: 'walk the lane right behind the squash, no jumping' },
  runTo(x + 33, 300),
];
actRoutes['lko05-lane'] = R_lko05_lane('lko05-lane');
const kafgirDone = (w: World) => !!w.flags['lko05-ulta:k']?.done;
actRoutes['lko05-ulta'] = (x) => [
  walkTo(x + 0.6, 300, 'stop on the ground before the slab: the cook presses from his end'),
  until(kafgirDone, 900, 'wait till his kafgir has pressed it all flat and lifted'),
  { hold: 'R', until: and(ground, X(x + 26.5)), max: 900, note: 'walk the flat lane, no jumping' },
];
const bharaUp = (need = 46) => (w: World) => ((w.flags['lko05-bhara:upNow'] as ((w: World) => number) | undefined)?.(w) ?? 0) > need;
/** keep a pair of heaps full: step from one to the other till the rack goes up, ending on the right one */
const shuffle = (a: number, need = 46, ready: ((w: World) => boolean) | null = null): Step => {
  let to = 1;
  let W: World | null = null;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        to = 1;
      }
      const t = px(a + to) + 8;
      if (Math.abs(w.player.cx - t) <= 3) to = 1 - to;
      return go(toward(w, px(a + to) + 8, 1));
    },
    until: (w) => (ready ? ready(w) : bharaUp(need)(w)) && w.player.onGround && Math.abs(w.player.cx - (px(a + 1) + 8)) <= 6,
    max: 1200,
    note: 'step from heap to heap so neither squashes, till he hoists the rack',
  };
};
const BHARA = [3, 7];
actRoutes['lko05-bhara'] = (x) => [
  walkTo(x + 0.9, 300, 'stop before the low rack'),
  until(bharaUp(), 900, 'wait till he hoists it'),
  hops([x + 1, x + 3], 'on to the first pair'),
  ...BHARA.slice(0, -1).flatMap((d, i) => [shuffle(x + d), hops([x + d + 1, x + BHARA[i + 1]], 'he hoisted it: hop')]),
  shuffle(x + 7, -1, (w) => { const t = (w.flags['lko05-bhara:toLift'] as (w: World) => number)(w); return t > 70 && t < 100; }),
  until((w) => bharaUp(40)(w) && kflat('lko05-bhara:kebabs', 3)(w), 600, 'the last one only half-hoisted: stand still till the heap squashes, then hop from flat'),
  hops([x + 8, x + 11.5]),
  runTo(x + 13.5, 300),
];

const R_lko06_tatkar = (id: string) => (x: number): Step[] => {
  const T = (w: World) => w.flags[`${id}:tap`] as { x: number; v: number };
  return [
    walkTo(x + 2, 300),
    {
      policy: (w) => {
        const t = T(w) as { x: number; v: number; lo: number };
        const p = w.player;
        const gap = t.x - 12 - (p.x + p.w);
        if (!p.onGround) return go('R');
        if (gap < -40) return go('R');
        if (t.v > 0) return go('');
        if (gap >= 30) return go('R');
        if (gap > -2 && t.x - t.lo > 30) return { move: 'R', jump: true };
        return go('');
      },
      until: (w) => w.player.onGround && w.player.x > T(w).x + 14,
      max: 1500,
      note: 'wait for her patch to come at you, then hop clean over it',
    },
    hops([x + 22.6, x + 25.4, x + 26.6, x + 29.4, x + 31], 'over the red strips'),
    runTo(x + 33, 300),
  ];
};
actRoutes['lko06-tatkar'] = R_lko06_tatkar('lko06-tatkar');

const MEHFIL = [6, 16, 26, 36, 46];
const R_lko06_mehfil = (id: string) => (x: number): Step[] => {
  const D = (w: World) => w.flags[`${id}:d`] as { x: number; v: number };
  const steps: Step[] = [walkTo(x + 3.6, 300), hops([x + 6.5], 'up on to the first takht')];
  MEHFIL.forEach((t, k) => {
    const nxt = MEHFIL[k + 1];
    // go when she is far enough away, whichever way she is spinning, to cross before she can come back
    const s0 = px(x + t + 6),
      s1 = px(x + (nxt ?? 56)) + 4;
    const lo = px(x + 4) + 8,
      hi = px(x + 54);
    const safe = (w: World) => {
      const d = D(w);
      if (d.v < 0) return d.x < s0 - 12 && (d.x - lo + (s0 - lo)) / 180 > 2.3;
      return d.x > s1 + 12 && (hi - d.x + (hi - s1)) / 180 > 2.3;
    };
    steps.push(until(safe, 2400, 'wait till she is far enough away to cross before she comes back'));
    if (nxt === undefined) steps.push(runTo(x + 56, 300));
    else steps.push(hops([x + t + 5.2, x + t + 8.6, x + nxt + 0.6], 'down over the strip, up on to the next takht'));
  });
  return steps;
};
actRoutes['lko06-mehfil'] = R_lko06_mehfil('lko06-mehfil');
/** forward whichever way the guru's stamps have turned the controls, hopping each red strip */
const GURU_STRIPS = [4, 9, 14, 19];
const guruFwd = (x: number, to: number, old = false, key = 'lko06-guru', mirror = false): Step => {
  let jt = 0;
  let W: World | null = null;
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
      }
      const p = w.player;
      const n = (w.flags[`${key}:g`] as { n: number } | undefined)?.n ?? 0;
      const move: Move = (w.flipped && !old) || (mirror && n % 2 === 1 && n < 99) ? 'L' : 'R';
      if (jt > 0) {
        jt--;
        return { move, jump: true };
      }
      const near = GURU_STRIPS.map((s0) => px(x + s0)).some((sx) => sx - (p.x + p.w) > 0 && sx - (p.x + p.w) < 14);
      if (p.onGround && near) {
        jt = 11;
        return { move, jump: true };
      }
      return { move, jump: false };
    },
    until: and(ground, X(to)),
    max: 1500,
    note: 'forward the way the last stamp left you, hopping the strips',
  };
};
actRoutes['lko06-guru'] = (x) => [guruFwd(x, x + 25.5), runTo(x + 27.5, 300)];
/** keep your feet moving on a covered board (a pause there is a bow) until `f` */
const pace10 = (x0: number, x1: number, f: (w: World) => boolean): Step => {
  let to = x1;
  return {
    policy: (w) => {
      const t = px(to) + 8;
      if (Math.abs(w.player.cx - t) <= 3) to = to === x1 ? x0 : x1;
      return go(toward(w, px(to) + 8, 1));
    },
    until: f,
    max: 1200,
    note: 'keep moving on the covered board till sam',
  };
};
const samDo = (w: World) => afterSam(w, 'lko10-do');
actRoutes['lko10-do'] = (x) => [
  walkTo(x + 2.6, 300, 'up to the stage: the short tihai starts'),
  until(samDo, 600, 'sam has rung, on the second'),
  runTo(x + 9.6, 300, 'on to the first covered board'),
  pace10(x + 9.4, x + 11.4, samDo),
  runTo(x + 18.6, 300),
  pace10(x + 18.4, x + 20.4, samDo),
  runTo(x + 29.5, 300),
];
const warped = (id: string) => (w: World) => !!(w.flags[`${id}:d`] as { warped: boolean } | undefined)?.warped;
actRoutes['lko10-thahra'] = (x) => [
  walkTo(x + 2, 300, 'to the hall door'),
  { hold: 'R', until: warped('lko10-thahra'), max: 200, note: 'walk through it' },
  runTo(x + 14.5, 300, 'no stopping on the covers: the arch has not moved'),
  hop(x + 15.6, x + 20, 'at a jump through the arch you saw, up on to the gallery', 8, 16),
  runTo(x + 31.6, 400),
];
actRoutes['lko10-seedha'] = (x) => [guruFwd(x, x + 25.5, false, 'lko10-seedha'), runTo(x + 27.5, 300)];
const tihaiAt = (w: World, id = 'lko06-tihai') => (w.flags[`${id}:at`] as ((w: World) => { n: number; k: number }) | undefined)?.(w) ?? { n: -1, k: -1 };
const afterSam = (w: World, id = 'lko06-tihai') => { const a = tihaiAt(w, id); return a.n === 0 && a.k > 2 && a.k < 40; };
actRoutes['lko06-tihai'] = (x) => [
  walkTo(x + 2.6, 300, 'up to the stage: the first tihai starts'),
  until(afterSam, 600, 'sam has rung'),
  runTo(x + 9.2, 300, 'on to the first plain board'),
  until(afterSam, 600, 'the next sam rings round us'),
  runTo(x + 18.2, 300),
  until(afterSam, 600),
  runTo(x + 29.5, 300),
]
const awningDown = (id: string, k: number) => (w: World) => {
  const st = w.flags[`${id}:st`] as { t: number }[] | undefined;
  return !!st && st[k].t >= 0 && w.tick - st[k].t > 26;
};
const R_lko07_shaam = (id: string) => (x: number): Step[] => [
  walkTo(x + 12.4, 400, 'the awning ahead shivers: stop short of it'),
  until(awningDown(id, 3), 300, 'it is down'),
  walkTo(x + 28.4, 600, 'over it, and on to the next that shivers'),
  until(awningDown(id, 7), 300),
  runTo(x + 45, 800),
];
actRoutes['lko07-shaam'] = R_lko07_shaam('lko07-shaam');
actRoutes['lko07-dukaan'] = (x) => [
  runTo(x - 3, 300, 'to the nala, under the shop awning'),
  hop(x + 2, x + 6, 'over the nala and up on to the sill, the window side', 2, 24),
  runTo(x + 12.4, 300, 'along the sill over his head'),
  runTo(x + 23.5, 400, 'down past him'),
];
const R_lko07_batti = (id: string) => (x: number): Step[] => [behindLamp(`${id}:ll1`, x + 13), behindLamp(`${id}:ll2`, x + 34), behindLamp(`${id}:ll3`, x + 56), runTo(x + 57, 300)];
actRoutes['lko07-batti'] = R_lko07_batti('lko07-batti');
const JN = [12, 24, 36, 46];
const R_lko07_julus = (id: string, jn = JN) => (x: number): Step[] => {
  let jt = 0;
  let W: World | null = null;
  return [
    {
      policy: (w) => {
        if (W !== w) {
          W = w;
          jt = 0;
        }
        const G = w.flags[`${id}:g`] as { x: number };
        const p = w.player;
        if (jt > 0) {
          jt--;
          return { move: 'R', jump: true };
        }
        if (!p.onGround) return go('R');
        const gap = G.x - (p.x + p.w);
        const nx = jn.map((n) => px(x + n)).find((n0) => n0 >= p.x + p.w - 2 && n0 - (p.x + p.w) < 14);
        if (nx !== undefined) {
          if (G.x - (nx + 32) > 60) {
            jt = 12;
            return { move: 'R', jump: true };
          }
          return go('');
        }
        return go(gap < 30 ? '' : 'R');
      },
      until: and(ground, X(x + 57)),
      max: 6000,
      note: 'behind the procession at its pace, waiting at each nala till they are clear',
    },
  ];
};
actRoutes['lko07-julus'] = R_lko07_julus('lko07-julus');
type Ph = { blind: number; test: boolean };
const flash = (k: number, need = 105) => (w: World) => {
  const S = w.flags[`lko07-photo:g${k}`] as Ph | undefined;
  return !!S && S.blind > need && !S.test;
};
actRoutes['lko07-photo'] = (x) => [
  walkTo(x + 4.5, 300),
  hop(x + 6, x + 8.5, 'over the nala'),
  walkTo(x + 9.2, 300, 'up to the posing group'),
  until(flash(0), 900, 'wait for the flash'),
  runTo(x + 18.5, 300, 'through them while they blink'),
  hop(x + 20, x + 22.5, 'over the second nala'),
  walkTo(x + 23.2, 300),
  until(flash(1), 900, 'not the short test flash: the real one'),
  runTo(x + 33, 300),
];
const R_lko07_chauraha = (id: string) => (x: number): Step[] => [walkTo(x + 3, 300), hop(x + 5, x + 7.3, 'over the nala'), pause('pause before the strollers'), runTo(x + 31, 600, 'stroll up, then run through')];
actRoutes['lko07-chauraha'] = R_lko07_chauraha('lko07-chauraha');

type Court = { t0: number; k: number; cur: number; lit: Set<number>; piece: number; n: number };
const R_lko08_chausar = (id: string, c0off = 5, n = 10, period = 200, mindPiece = true, mindBow = true, key = 'court', land = 3 * n + 1.5) => (x: number): Step[] => {
  let jt = 0,
    tgt = -1;
  let W: World | null = null;
  const c0 = x + c0off;
  const cx = (i: number) => px(c0 + 3 * i) + 16;
  return [
    walkTo(x + 3.2, 300),
    {
      policy: (w) => {
        if (W !== w) {
          W = w;
          jt = 0;
          tgt = -1;
        }
        const S = w.flags[`${id}:${key}`] as Court;
        const p = w.player;
        if (jt > 0) {
          jt--;
          return { move: toward(w, tgt < n ? cx(tgt) : px(c0 + land), 1), jump: true };
        }
        if (!p.onGround) return go(airTo(w, tgt < n ? cx(tgt) : px(c0 + land)));
        if (S.t0 < 0) return go('R');
        const left = period - ((w.tick - S.t0) % period);
        const nxt = S.cur + 1;
        if (S.cur >= 0 && Math.abs(p.cx - cx(S.cur)) > 5) return go(toward(w, cx(S.cur), 2));
        if (nxt >= n) {
          tgt = n;
          jt = 12;
          return { move: 'R', jump: true };
        }
        const bowed = (w.flags[`${id}:${key}:bowed`] as { i: number } | undefined)?.i ?? -1;
        if (S.lit.has(nxt) && (!mindPiece || S.piece !== nxt) && (!mindBow || bowed !== nxt) && left > 75) {
          tgt = nxt;
          jt = 12;
          return { move: 'R', jump: true };
        }
        return go('');
      },
      until: (w) => w.player.onGround && w.player.x > px(c0 + land - 0.5),
      max: 6000,
      note: 'one square at a time, only on to lit ones, never the courtier’s',
    },
  ];
};
actRoutes['lko08-chausar'] = (x) => [...R_lko08_chausar('lko08-chausar', 5, 5, 200, true, true, 'court', 14.6)(x), ...R_lko08_chausar('lko08-chausar', 5, 5, 200, true, true, 'court2')(x + 21)];
actRoutes['lko08-minar'] = (x) => [
  hop(x + 3, x + 6, 'at a jump through the first arch: a floor up'),
  hop(x + 9, x + 12, 'at a jump through the second: the third floor'),
  { hold: 'R', until: and(ground, X(x + 24.5)), max: 600, note: 'on foot through the third, and off the end of the floor' },
];
actRoutes['lko08-utar'] = (x) => [
  walkTo(x + 3.5, 300, 'up the gallery to the hanging arch'),
  hop(x + 6, x + 18, 'jump from three tiles back: falling through it takes you down', 0),
  walkTo(x + 18.6, 300),
  hop(x + 21, x + 23, 'at a jump through the plain arch, back up to the gallery'),
  runTo(x + 23.6, 300),
];
actRoutes['lko08-wapas'] = (x) => [
  hop(x + 2, x + 4.5, 'at a jump through the first arch: up on to the gallery'),
  walkTo(x + 13.4, 300, 'on foot past its arch'),
  { policy: () => ({ move: 'L', jump: true }), ticks: 12, note: 'turn and jump back through it' },
  { hold: 'L', until: (w) => w.player.onGround, max: 200 },
  walkTo(x + 17.6, 300, 'out past the well'),
  hop(x + 19, x + 21, 'up through the plain arch to the gallery'),
  runTo(x + 21.6, 200),
];
actRoutes['lko08-upar'] = (x) => [
  hop(x + 1, x + 3.5, 'at a jump through the first arch: up to the high ledge'),
  hops([x + 5.6, x + 9.6, x + 13.6, x + 17.6, x + 21.5], 'down on to the arch tops from above, top to top, and down past the well'),
  runTo(x + 25, 300),
];
actRoutes['lko08-darwaza'] = (x) => [
  walkTo(x + 2, 300, 'down off the gallery, to the hall door'),
  { hold: 'R', until: (w) => !!(w.flags['lko08-darwaza:d'] as { warped: boolean } | undefined)?.warped, max: 200, note: 'walk through the door' },
  walkTo(x + 9.5, 300, 'look again: the arch is nearer now'),
  hop(x + 11.6, x + 16, 'at a jump through it, up on to the gallery', 8, 16),
  runTo(x + 31.6, 400),
];
actRoutes['lko08-sargoshi'] = (x) => [
  walkTo(x + 0.8, 300, 'down on the gallery floor: keep to the middle'),
  hop(x + 7.4, x + 10.6, 'over the hole where light comes up', 6, 16),
  runTo(x + 13, 300),
  hop(x + 16.4, x + 19.6, 'over the next', 6, 16),
  hop(x + 22.8, x + 23, 'up the end steps'),
  hop(x + 23.4, x + 24.4, '', 8, 16),
  runTo(x + 25.6, 200),
];
actRoutes['lko08-roshandan'] = (x) => [
  hop(x + 5, x + 7.4, 'off the gallery on to the first down-lit patch'),
  hops([x + 7.6, x + 8.5, x + 12.6, x + 13.5, x + 17.6, x + 18.5, x + 22.6, x + 25], 'down-lit patch to down-lit patch'),
];
actRoutes['lko08-toota'] = (x) => [runTo(x + 1, 300), hop(x + 1.6, x + 5.5, 'at a jump through the whole arch, though the floor goes on', 30), runTo(x + 29.5, 400, 'along the gallery and down off its end')];
actRoutes['lko08-mehrab'] = (x) => [runTo(x + 12, 400, 'on foot through the vault arch'), hop(x + 14.6, x + 17, 'at a jump through the next, up past the well', 30), runTo(x + 29.5, 300)];

const R_lko09_hawa = (id: string) => (x: number): Step[] => {
  const ok = redNow(`${id}:k`);
  return [
    walkTo(x + 4.9, 300),
    hops([...HAWA.flatMap(([a, , wd]) => [[x + a + 0.6, ok] as [number, (w: World) => boolean], x + a + wd - 0.9]), [x + after(HAWA) + 0.6, ok], x + after(HAWA) + 2], 'cross while you see white: the birds see red'),
  ];
};
actRoutes['lko09-hawa'] = (x) => [stroll(x + 3, 'up on to the roofs'), ...R_lko09_hawa('lko09-hawa')(x)];
const R_lko09_jhande = (ok: (w: World) => boolean) => (x: number): Step[] => [
  walkTo(x + 3.4, 300),
  hops([...JHANDE_L.flatMap(([a, , wd]) => [[x + a + 0.6, ok] as [number, (w: World) => boolean], x + a + wd - 0.9]), [x + after(JHANDE_L) + 0.6, ok], x + after(JHANDE_L) + 2], 'cross on the red of the nearer flag'),
];
actRoutes['lko09-jhande'] = (x) => [...R_lko09_jhande(redNow('lko09-jhande:k'))(x), runTo(x + after(JHANDE_L) + 9, 300)];
const redOf = (who: 'a' | 'b') => (w: World) => {
  const o = (w.flags['lko09-jhande:k']?.[who] as Fl | undefined)?.order(w);
  return !!o && o.c === 'red' && o.left > 1.0;
};
const seetiPh = (w: World) => ((w.flags['lko09-seeti:k'] as { sig: { ph: (w: World) => number } } | undefined)?.sig.ph(w) ?? -1);
const seetiIn = (a: number, b: number) => (w: World) => {
  const p = seetiPh(w);
  return p >= a && p < b;
};
actRoutes['lko09-seeti'] = (x) => [
  walkTo(x + 2.5, 300),
  until(seetiIn(165, 175), 900, 'your flyer has called them and they have lifted'),
  hops([x + 2.5, x + 4.6, x + 8.8, x + 10.6, x + 15.6], 'over the near roof to the tank roof'),
  until(seetiIn(345, 355), 900, 'the rival has called them and they have lifted'),
  hops([x + 15.6, x + 18.6, x + 22.8, x + 24.6, x + 29.6], 'over the far roof'),
  runTo(x + 35, 300),
];
const tumbling = (w: World) => !!(w.flags['lko09-girah:tumbling'] as ((w: World) => boolean) | undefined)?.(w);
const girahGo = (w: World) => tumbling(w) && redNow('lko09-girah:k', 0.65)(w);
actRoutes['lko09-girah'] = (x) => [
  walkTo(x + 3.4, 300),
  hops([...GIRAH.flatMap(([a, , wd]) => [[x + a + 0.6, girahGo] as [number, (w: World) => boolean], x + a + wd - 0.9]), [x + after(GIRAH) + 1, girahGo]], 'through the tumble, early in the red'),
  runTo(x + after(GIRAH) + 7, 300),
];
const GUMBAD = [5, 13, 21];
/** stand where the dome is your size (its terrace 24 px up), then jump on to it */
const domeJump = (id: string, k: number, d: number, x: number): Step => {
  let jt = 0;
  let W: World | null = null;
  const tgt = px(x + d + 2.5);
  return {
    policy: (w) => {
      if (W !== w) {
        W = w;
        jt = 0;
      }
      const o = (w.flags[`${id}:domes`] as { b: { solid: { y: number }; on: boolean }; line: number }[])[k];
      const p = w.player;
      if (jt > 0) {
        jt--;
        return { move: 'R', jump: true };
      }
      if (!p.onGround) return go(airTo(w, tgt));
      if (o.b.on && o.b.solid.y === FLOOR_Y - 24 && Math.abs(p.vx) < 5) {
        jt = 12;
        return { move: 'R', jump: true };
      }
      return go(toward(w, px(x + d - (k === 2 ? 1 : 2)) + 8, 2));
    },
    until: (w) => w.player.onGround && w.player.y + w.player.h < FLOOR_Y - 10,
    max: 900,
    note: 'from the red paving line, where the dome is your size',
  };
};
const FLOOR_Y = 240;
const R_lko09_gumbad = () => (x: number): Step[] => [
  ...GUMBAD.flatMap((d, k) => [walkTo(x + d - (k === 2 ? 1 : 2), 400, 'to the red paving line'), domeJump('lko09-gumbad', k, d, x), hops([x + d + 3.1, x + d + 6], 'off the far side, on to the paving')]),
  runTo(x + 29, 300),
];
actRoutes['lko09-gumbad'] = R_lko09_gumbad();

actRoutes['lko10-dhulai'] = (x) => {
  const k = 'lko10-dhulai:wash';
  return [
    runTo(x + 3.4, 300, 'on to the first flower'),
    until((w) => w.flags[k] >= 2, 600, 'wait out both whistles'),
    hops([x + 3.4, x + 6, x + 9, x + 12, x + 15.5], 'flower to flower'),
    runTo(x + 21, 300),
    walkTo(x + 21.2, 200),
    hops([x + 23, x + 26, x + 29, x + 32.6], 'the shady left tiles'),
    runTo(x + 35.5, 300),
  ];
};
const grainUp = (w: World) => {
  const k = w.flags['lko10-daana:k'] as { sig: { feeding: (w: World) => boolean }; clock: { t: number } } | undefined;
  if (!k || k.clock.t < 0) return false;
  const p = (w.tick - k.clock.t) % 420;
  return p >= 250 && p < 330;
};
actRoutes['lko10-daana'] = (x) => [
  walkTo(x + 4.3, 300),
  hops([x + 4.3, x + 8.2], 'on to the near end of the grain roof'),
  until(grainUp, 900, 'they have fed and lifted'),
  runTo(x + 15.4, 300, 'over the grain while they are up'),
  hops([x + 15.4, [x + 19.6, redNow('lko10-daana:k', 1.0)], x + 24.1, [x + 27.8, redNow('lko10-daana:k', 1.0)]], 'then on the red, as on the roofs'),
  runTo(x + 29, 300),
];
const lampPast = (x: number, d: number) => (w: World) => {
  const L = w.flags['lko10-chirag:ll'] as { x: number } | undefined;
  return !!L && L.x < px(x + d) - 8;
};
actRoutes['lko10-chirag'] = (x) => [
  walkTo(x + 3.6, 300, 'to the rim: he sets off towards us'),
  until(lampPast(x, 6), 900, 'he has passed every heap: the light is from the left now'),
  hops([x + 3.6, x + 7, x + 10, x + 13, x + 16, x + 19, x + 21.6], 'the right tiles, away from his lantern'),
];
actRoutes['lko10-darbar'] = (x) => [...R_lko08_chausar('lko10-darbar', 5, 5, 200, true, true, 'court', 14.6)(x), ...R_lko08_chausar('lko10-darbar', 5, 4, 200, true, true, 'court2')(x + 21)];
actRoutes['lko10-julus'] = R_lko07_julus('lko10-julus');
actRoutes['lko10-galiyara'] = (x) => [runTo(x + 12, 400, 'walk over the drain, through the first arch'), hop(x + 14.6, x + 17, 'at a jump through the second', 30), runTo(x + 34.5, 600, 'along the gallery without stopping')];
const tflash = (need = 120) => (w: World) => ((w.flags['lko10-tasveer:g'] as Ph | undefined)?.blind ?? 0) > need;
actRoutes['lko10-tasveer'] = (x) => [
  walkTo(x + 6.6, 300, 'wait on the plain board, back from the covers'),
  until(tflash(), 1200, 'the flash'),
  hop(x + 8, x + 10.5, 'over the drain'),
  runTo(x + 17, 300, 'over the covers and through the group, no stopping'),
  runTo(x + 23, 300),
];
actRoutes['lko10-raasta'] = (x) => [
  walkTo(x + 2.5, 300),
  hop(x + 4, x + 6.5, 'over the nala'),
  pause('pause before them'),
  walkTo(x + 12.2, 300, 'stroll up: they part'),
  until((w) => ['gone'].includes((w.flags['lko10-raasta:g'] as { s: string }).s), 900, 'bow back: he goes first, and the stone goes under him'),
  hop(x + 18, x + 20.5, 'over the hole he left'),
  runTo(x + 25, 300),
];
const jawabOk = (w: World) => (w.flags['lko10-jawab:g'] as { s: string } | undefined)?.s === 'ok';
actRoutes['lko10-jawab'] = (x) => [
  walkTo(x + 5, 300, 'on to the covers: he greets you'),
  walkTo(x + 1.4, 300, 'back off the covers to the plain board'),
  until(jawabOk, 600, 'one short bow, on plain boards'),
  hop(x + 10, x + 12.5, 'walk on over the covers without stopping, and over his drain'),
  runTo(x + 15, 300),
];

const endingPolicies: Record<string, Policy> = {
  'lko-tehzeeb'(w, _m, d) {
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    return go(toward(w, d.x + 8 - px(4.8), 1));
  },
  'lko-chhatri'(w, m, d) {
    const D = Math.round(d.x / 16);
    if (!m.h) m.h = hops([D - 11, D - 7.2, [D - 3.6, redNow('chhatri', 1.4)], D - 1.5], 'wait on the roof, cross early in the red').policy!;
    const p = w.player;
    if (p.onGround && p.cx > px(D - 2)) return go(toward(w, d.x + 8, 1));
    return m.h(w);
  },
  'lko-489'(w, _m, d) {
    // walk: over the crack, through the last arch on foot, off the end of the gallery, down to the door
    return go(toward(w, d.x + 8, 1));
  },
  'lko-darban'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    if (!m.h) m.h = hop(D - 8, D - 5.6, 'over the nala, early').policy!;
    if (!m.over) {
      if (p.onGround && p.x > px(D - 6)) m.over = 1;
      else return m.h(w);
    }
    if (m.over === 1) {
      if (p.onGround && Math.abs(p.vx) < 5) m.over = 2;
      return go('');
    }
    return go(toward(w, d.x + 8, 1));
  },
  'lko-sam'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (w.flags.twist === 'sam' || w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    if (p.onGround && p.y + p.h <= px(13)) return go(toward(w, px(D - 7) + 8, 1));
    if (!m.h) m.h = hops([D - 10.5, D - 7.5], 'up on to the takht').policy!;
    return m.h(w);
  },
  'lko-sheermal'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (!m.h && w.flags.twist === 'tandoor') return go(toward(w, px(D - 9) + 6, 1));
    if (!m.h && w.flags.twist === 'slapped') m.h = hops([D - 5.5, D - 1], 'drop on to the sheermal, hop out').policy!;
    if (!m.h) return go('');
    if (p.onGround && p.cx > px(D - 1.5)) return go(toward(w, d.x + 8, 1));
    return m.h(w);
  },
  'lko-kulhad'(w, m, d) {
    const D = Math.round(d.x / 16);
    const p = w.player;
    if (p.onGround && p.y + p.h <= px(11)) return go(toward(w, d.x + 8, 1));
    if (p.cx < px(D - 8) - 4 && p.onGround) return go('R');
    if (!m.h) m.h = hops([D - 5, D - 2, D + 1], 'the right tiles of the steps, then the counter').policy!;
    return m.h(w);
  },
  'lko-balti'(w, m, d) {
    const D = Math.round(d.x / 16);
    if (!m.h) m.h = hops([D - 7.4, D - 4, D - 1], 'flower, flower, door, before his bucket').policy!;
    const p = w.player;
    if (p.onGround && p.cx > px(D - 1) + 2) return go(toward(w, d.x + 8, 1));
    return m.h(w);
  },
  'lko-kiwad'(w, _m, d) {
    if (w.flags.twist === 'open') return go(toward(w, d.x + 8, 1));
    return go(toward(w, d.x + 8 - px(4.5), 1));
  },
};

function actRoutes0(id: string, x: number) {
  return actRoutes[id](x);
}

mistakes['LKO-02'].push(
  { what: 'at the stand-off, walking into him', steps: [...through('LKO-02', room02, 1), { hold: 'R', until: done, max: 900 }], cause: 'lko-pehle' },
  { what: 'at the stand-off, bowing once and going, as learned', steps: [...through('LKO-02', room02, 1), runTo(actX('LKO-02', 1) + 6.4, 300), { hold: '', ticks: 80 }, { hold: 'R', until: done, max: 600 }], cause: 'lko-takrar' },
);
mistakes['LKO-03'] = [
  { what: 'stopping on the jali in the middle of the second vat', steps: [...room03, runTo(actX('LKO-03') + 1.5), runTo(actX('LKO-03') + 18.2), until(done, 400)], cause: 'lko-jali' },
  { what: 'walking straight on to the door over the cloth', steps: [...through('LKO-03', room03, 3), runTo(doorX('LKO-03') - 9), { hold: 'R', until: done, max: 900 }], cause: 'lko-chhapa' },
  { what: 'at the door, waiting on a white flower for the second wash, as the room taught', steps: [...through('LKO-03', room03, 3), runTo(doorX('LKO-03') - 9), hops([doorX('LKO-03') - 7.4, doorX('LKO-03') - 4]), until(done, 600)], cause: 'lko-balti' },
  { what: 'on the frame, waiting on the next flower ahead', steps: [...through('LKO-03', room03, 1), walkTo(actX('LKO-03', 1) + 4.5, 400), hops([actX('LKO-03', 1) + 5.6, actX('LKO-03', 1) + 9]), until(done, 600)], cause: 'lko-adda' },
  { what: 'on the frame, walking on off the hoop', steps: [...through('LKO-03', room03, 1), { hold: 'R', until: done, max: 900 }], cause: 'lko-kunda' },
];

mistakes['LKO-04'] = [
  {
    what: 'waiting at the start of the lane while the shadows shrink',
    steps: [...room04, runTo(actX('LKO-04') + 1.5), runTo(actX('LKO-04') + 2.3), { hold: '', ticks: 700 }, hops([actX('LKO-04') + 4, actX('LKO-04') + 6]), until(done, 300)],
    cause: 'lko-malai',
  },
  {
    what: 'at the counter, landing on the left tile of the step (the fire is behind you)',
    steps: [...through('LKO-04', room04, 2), runTo(doorX('LKO-04') - 9), hops([doorX('LKO-04') - 6]), until(done, 300)],
    cause: 'lko-malai',
  },
];

const pre07 = () => [...room07, ...actRoutes0('lko07-shaam', actX('LKO-07', 0)), ...actRoutes0('lko07-batti', actX('LKO-07', 1))];
mistakes['LKO-07'] = [
  { what: 'behind the procession, keeping the rhythm of the first three nalas', steps: [...pre07(), ...R_lko07_julus('lko07-julus', [12, 24, 36, 48])(actX('LKO-07', 2)), until(done, 600)], cause: 'lko-julus-nala' },
  { what: 'rushing up behind the slow procession', steps: [...pre07(), hop(actX('LKO-07', 2) + 12, actX('LKO-07', 2) + 14.5), { hold: 'R', until: done, max: 1200 }], cause: 'lko-julus' },
  {
    what: 'hopping the nala straight on to the procession’s heels',
    steps: [...pre07(), { policy: (w) => { const G = w.flags['lko07-julus:g']; const p = w.player; const n0 = px(actX('LKO-07', 2) + 12); if (!p.onGround) return go('R'); if (p.x + p.w >= n0 - 8 && p.x < n0 && G.x - (n0 + 32) < 20 && G.x > n0) return { move: 'R', jump: true }; return go(G.x - (p.x + p.w) < 30 && p.x + p.w < n0 - 10 ? '' : 'R'); }, until: done, max: 3000 }],
    cause: 'lko-julus',
  },
  {
    what: 'following the lamplighter close behind',
    steps: [...room07, ...actRoutes0('lko07-shaam', actX('LKO-07', 0)), { hold: 'R', until: done, max: 900 }],
    cause: 'lko-seedhi',
  },
  {
    what: 'hopping the café nala and going straight in',
    steps: [...room07, ...actRoutes0('lko07-shaam', actX('LKO-07', 0)), ...actRoutes0('lko07-batti', actX('LKO-07', 1)), ...actRoutes0('lko07-julus', actX('LKO-07', 2)), ...actRoutes0('lko07-photo', actX('LKO-07', 3)), ...actRoutes0('lko07-dukaan', actX('LKO-07', 4)), ...actRoutes0('lko07-chauraha', actX('LKO-07', 5)), runTo(doorX('LKO-07') - 10), hop(doorX('LKO-07') - 8, doorX('LKO-07') - 3), { hold: 'R', until: done, max: 600 }],
    cause: 'lko-darban',
  },
];
const pre08 = () => [...room08, ...actRoutes0('lko08-chausar', actX('LKO-08', 0))];
const court08 = (w: World) => w.flags['lko08-chausar:court'] as Court;
mistakes['LKO-08'] = [
  { what: 'on the pachisi court, hopping on square after square', steps: [...room08, walkTo(actX('LKO-08', 0) + 3.2, 300), hops([0, 1, 2, 3, 4, 5].map((i) => actX('LKO-08', 0) + 5 + 3 * i + 0.5)), until(done, 300)], cause: 'lko-kuan' },
  {
    what: 'on the court, taking every lit square of a big throw',
    steps: [
      ...room08,
      walkTo(actX('LKO-08', 0) + 3.2, 300),
      ...R_lko08_chausar('lko08-chausar', 5, 5, 200, false, true, 'court', 14.6)(actX('LKO-08', 0)).slice(1),
      ...R_lko08_chausar('lko08-chausar', 5, 5, 200, false, true, 'court2')(actX('LKO-08', 0) + 21),
      until(done, 600),
    ],
    cause: 'lko-goti',
  },
  { what: 'in the vault, hopping the drain into the arch', steps: [...through('LKO-08', room08, 4), runTo(actX('LKO-08', 4) + 1, 300), hop(actX('LKO-08', 4) + 3, actX('LKO-08', 4) + 6), { hold: 'R', until: done, max: 400 }], cause: 'lko-mehrab' },
  { what: 'hopping the crack into the last arch', steps: [...through('LKO-08', room08, 4), ...actRoutes0('lko08-mehrab', actX('LKO-08', 4)), ...actRoutes0('lko08-utar', actX('LKO-08', 5)), ...actRoutes0('lko08-wapas', actX('LKO-08', 6)), ...actRoutes0('lko08-darwaza', actX('LKO-08', 7)), ...actRoutes0('lko08-sargoshi', actX('LKO-08', 8)), ...actRoutes0('lko08-roshandan', actX('LKO-08', 9)), runTo(doorX('LKO-08') - 8.5, 300), hop(doorX('LKO-08') - 6, doorX('LKO-08') - 2), { hold: 'R', until: done, max: 400 }], cause: 'lko-bhool' },
];
/** the room's route and the routes of the stage's first n acts */
function through(id: string, room: Step[], n: number): Step[] {
  return [...room, ...LEVEL_BY_ID.get(id)!.parts!.slice(0, n).flatMap((pt) => actRoutes0(pt.kind, pt.x0))];
}
fix['LKO-09'] = {
  steps: [
    ...through('LKO-09', room09, 1),
    stroll(actX('LKO-09', 1) + 3),
    walkTo(actX('LKO-09', 1) + 4.9, 300),
    hops(HAWA.slice(0, 3).flatMap(([a, , wd]) => [[actX('LKO-09', 1) + a + 0.6, redSeen('lko09-hawa:k')] as [number, (w: World) => boolean], actX('LKO-09', 1) + a + wd - 0.9]), 'watch the flag, as learned: go on the red you see'),
    until(done, 600),
  ],
  cause: 'lko-hawa',
};
mistakes['LKO-09'] = [
  { what: 'jumping for the reflection from the usual distance', steps: [...room09, ...R_lko09_gumbad()(actX('LKO-09', 0)).slice(0, 6), walkTo(actX('LKO-09', 0) + 19, 300), { hold: 'R', jump: 12, ticks: 60 }, until(done, 300)], cause: 'lko-aks' },
  { what: 'walking up to the white dome', steps: [...room09, { hold: 'R', until: done, max: 900 }], cause: 'lko-gumbad' },
  { what: 'jumping for the dome from far back, where it looked big', steps: [...room09, walkTo(actX('LKO-09', 0) + 2.2, 300), { hold: 'R', jump: 14, ticks: 60 }, until(done, 300)], cause: 'lko-gumbad' },
];
const DK = (i: number) => (w: World) => (w.flags['lko05-dum:kebabs'] ?? [])[i]?.stage === 1;
mistakes['LKO-05'] = [
  { what: 'on the double heaps, hopping on after one squash, as learned', steps: [...through('LKO-05', room05, 4), runTo(actX('LKO-05', 4) + 0.5, 300), hops([actX('LKO-05', 4) + 3, [actX('LKO-05', 4) + 6.1, kflat('lko05-dum:kebabs', 0)], [actX('LKO-05', 4) + 9.1, DK(1)]]), until(done, 300)], cause: 'lko-dum' },
  {
    what: 'on the triple heap, hopping off after two squashes',
    steps: [...through('LKO-05', room05, 4), runTo(actX('LKO-05', 4) + 0.5, 300), hops([actX('LKO-05', 4) + 3, ...[6, 9, 12, 15].map((d, i) => [actX('LKO-05', 4) + d + 0.1, kflat('lko05-dum:kebabs', i)] as [number, (w: World) => boolean]), [actX('LKO-05', 4) + 19.5, (w: World) => (w.flags['lko05-dum:kebabs'] ?? [])[4]?.stage === 2]]), until(done, 300)],
    cause: 'lko-dum-teen',
  },
  { what: 'on the double heaps, hopping straight on', steps: [...through('LKO-05', room05, 4), runTo(actX('LKO-05', 4) + 0.5, 300), hops([actX('LKO-05', 4) + 3, actX('LKO-05', 4) + 6.1, actX('LKO-05', 4) + 9.1]), until(done, 300)], cause: 'lko-seekh' },
];
mistakes['LKO-05'].push(
  { what: 'down the long tawa, hopping straight off the first full heap', steps: [...room05, runTo(actX('LKO-05', 0) + 0.5, 300), hops([actX('LKO-05', 0) + 3, actX('LKO-05', 0) + 6]), until(done, 300)], cause: 'lko-seekh' },
  { what: 'down the long tawa, waiting on a flat one for it to squash, as on the full ones', steps: [...room05, runTo(actX('LKO-05', 0) + 0.5, 300), hops([actX('LKO-05', 0) + 3, [actX('LKO-05', 0) + 6, kflat('lko05-tawa:kebabs', 0)]]), until(done, 600)], cause: 'lko-tawa' },
  { what: 'in the low lane, hopping, as on the heaps', steps: [...through('LKO-05', room05, 1), runTo(actX('LKO-05', 1) + 1.2, 300), hops([actX('LKO-05', 1) + 3]), until(kflat('lko05-lane:slab', 0), 300), hops([actX('LKO-05', 1) + 3, actX('LKO-05', 1) + 6]), until(done, 300)], cause: 'lko-seekh' },
  { what: 'in the low lane, lingering on the squashed lane', steps: [...through('LKO-05', room05, 1), runTo(actX('LKO-05', 1) + 1.2, 300), hops([actX('LKO-05', 1) + 3]), until(kflat('lko05-lane:slab', 0), 300), walkTo(actX('LKO-05', 1) + 5, 300), until(done, 900)], cause: 'lko-tawa' },
  {
    what: 'under the half-hoisted rack: hopping off a full heap, as all along',
    steps: [...through('LKO-05', room05, 3), walkTo(actX('LKO-05', 3) + 0.9, 300), until(bharaUp(), 900), hops([actX('LKO-05', 3) + 1, actX('LKO-05', 3) + 3]), shuffle(actX('LKO-05', 3) + 3), hops([actX('LKO-05', 3) + 4, actX('LKO-05', 3) + 7]), shuffle(actX('LKO-05', 3) + 7), hops([actX('LKO-05', 3) + 8, actX('LKO-05', 3) + 11.5]), until(done, 400)],
    cause: 'lko-seekh',
  },
  { what: 'the cook’s slab: standing on its end to squash it, as learned', steps: [...through('LKO-05', room05, 2), walkTo(actX('LKO-05', 2) + 0.6, 300), hops([actX('LKO-05', 2) + 2.2], 'on to the slab'), until(done, 900)], cause: 'lko-kafgir' },
  { what: 'the cook’s slab: walking up it to meet him', steps: [...through('LKO-05', room05, 2), walkTo(actX('LKO-05', 2) + 0.6, 300), hops([actX('LKO-05', 2) + 2.2]), { hold: 'R', until: done, max: 400 }], cause: 'lko-seekh' },
  { what: 'under the low rack: waiting for the heap to squash, as learned', steps: [...through('LKO-05', room05, 3), walkTo(actX('LKO-05', 3) + 0.9, 300), until(bharaUp(), 900), hops([actX('LKO-05', 3) + 1, actX('LKO-05', 3) + 3]), until(done, 900)], cause: 'lko-tawa' },
  { what: 'under the low rack: hopping while it is down', steps: [...through('LKO-05', room05, 3), walkTo(actX('LKO-05', 3) + 0.9, 300), hops([actX('LKO-05', 3) + 1, actX('LKO-05', 3) + 3]), until(done, 600)], cause: 'lko-seekh' },
);
mistakes['LKO-08'].push(
  { what: 'in the minaret, walking through the second arch', steps: [...through('LKO-08', room08, 2), hop(actX('LKO-08', 2) + 3, actX('LKO-08', 2) + 6), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
  { what: 'in the minaret, jumping through every arch', steps: [...through('LKO-08', room08, 2), hop(actX('LKO-08', 2) + 3, actX('LKO-08', 2) + 6), hop(actX('LKO-08', 2) + 9, actX('LKO-08', 2) + 12), hop(actX('LKO-08', 2) + 16, actX('LKO-08', 2) + 18), until(done, 400)], cause: 'lko-bhool' },
  { what: 'jumping through the hanging arch up close, as everywhere', steps: [...through('LKO-08', room08, 5), walkTo(actX('LKO-08', 5) + 3.5, 300), hop(actX('LKO-08', 5) + 8, actX('LKO-08', 5) + 10, '', 6), until(done, 400)], cause: 'lko-bhool' },
  { what: 'walking through the hanging arch', steps: [...through('LKO-08', room08, 5), walkTo(actX('LKO-08', 5) + 3.5, 300), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
);
mistakes['LKO-09'].push(
  { what: 'two flags: watching the one behind you the whole way, as on the last roofs', steps: [...through('LKO-09', room09, 2), ...R_lko09_jhande(redOf('a'))(actX('LKO-09', 2)), until(done, 600)], cause: 'lko-jhanda-aage' },
  { what: 'two flags: watching the one ahead from the start', steps: [...through('LKO-09', room09, 2), ...R_lko09_jhande(redOf('b'))(actX('LKO-09', 2)), until(done, 600)], cause: 'lko-jhanda-peeche' },
);
mistakes['LKO-02'].push(
  { what: 'the greeting: walking on past it', steps: [...through('LKO-02', room02, 2), { hold: 'R', until: done, max: 900 }], cause: 'lko-aadaab' },
  { what: 'the greeting: bowing on and on, as at the stand-off', steps: [...through('LKO-02', room02, 2), walkTo(actX('LKO-02', 2) + 3.5, 300), until(done, 900)], cause: 'lko-aadaab-zyada' },
);
mistakes['LKO-03'].push(
  { what: 'the dyer: waiting on a stitched flower in his half, as learned', steps: [...through('LKO-03', room03, 2), walkTo(actX('LKO-03', 2) + 2, 300), hops([actX('LKO-03', 2) + 4, actX('LKO-03', 2) + 7, actX('LKO-03', 2) + 10]), until(rangUp, 900), hops([actX('LKO-03', 2) + 10, actX('LKO-03', 2) + 13]), until(done, 900)], cause: 'lko-rang' },
  { what: 'the dyer: hopping on to his half while it is under', steps: [...through('LKO-03', room03, 2), walkTo(actX('LKO-03', 2) + 2, 300), hops([actX('LKO-03', 2) + 4, actX('LKO-03', 2) + 7, actX('LKO-03', 2) + 10]), until((w) => rangPh(w) >= 352, 900), hops([actX('LKO-03', 2) + 10, actX('LKO-03', 2) + 13]), until(done, 600)], cause: 'lko-rang-kood' },
);
mistakes['LKO-04'].push(
  { what: 'under the cloud: hopping on before its shadow comes', steps: [...through('LKO-04', room04, 1), walkTo(actX('LKO-04', 1) + 2.4, 300), hops([actX('LKO-04', 1) + 3.5, actX('LKO-04', 1) + 6]), until(done, 300)], cause: 'lko-badal' },
  { what: 'under the cloud: waiting on a cup, as on the heaps', steps: [...through('LKO-04', room04, 1), walkTo(actX('LKO-04', 1) + 2.4, 300), hops([[actX('LKO-04', 1) + 3.5, shaded(actX('LKO-04', 1), 4)]]), until(done, 600)], cause: 'lko-badal-peeche' },
);
mistakes['LKO-06'] = [
  { what: 'in the mehfil, crossing her floor', steps: [...through('LKO-06', room06, 3), walkTo(actX('LKO-06', 3) + 3.6, 300), hops([actX('LKO-06', 3) + 6.5, actX('LKO-06', 3) + 12.2]), until(done, 1200)], cause: 'lko-mehfil' },
  {
    what: 'in the mehfil, stepping down on to the red strip as she goes away',
    steps: [...through('LKO-06', room06, 3), walkTo(actX('LKO-06', 3) + 3.6, 300), hops([actX('LKO-06', 3) + 6.5]), until((w) => w.flags['lko06-mehfil:d'].x > px(actX('LKO-06', 3) + 22), 2400), hops([actX('LKO-06', 3) + 11.2, actX('LKO-06', 3) + 12.4, actX('LKO-06', 3) + 13.5]), until(done, 1200)],
    cause: 'lko-ghungroo',
  },
];
mistakes['LKO-10'] = [
  { what: 'bowing to the last door from right in front of it', steps: [...through('LKO-10', room10, 12), walkTo(doorX('LKO-10') - 1.5, 600), until(done, 600)], cause: 'lko-tehzeeb' },
  { what: 'the court again: taking the square the courtier bows you on to', steps: [...through('LKO-10', room10, 1), ...R_lko08_chausar('lko10-darbar', 5, 5, 200, true, false, 'court', 14.6)(actX('LKO-10', 1)), walkTo(actX('LKO-10', 1) + 23.6, 300), until((w) => ((w.flags['lko10-darbar:court2:bowed'] as { i: number } | undefined)?.i ?? -1) === 0, 2400, 'he bows you on'), hops([actX('LKO-10', 1) + 26.6]), until(done, 600)], cause: 'lko-goti-pehle' },
];

// fix round 2: a second scripted play for the acts that had one or none
mistakes['LKO-03'].push({ what: 'at the first vat, stepping on the print and stopping', steps: [...room03, runTo(actX('LKO-03', 0) + 1.5, 300), { hold: 'R', ticks: 24 }, until(done, 600)], cause: 'lko-chhapa' });
mistakes['LKO-06'].push(
  { what: 'over her patch, landing on a red strip', steps: [...room06, ...actRoutes0('lko06-tatkar', actX('LKO-06', 0)).slice(0, 2), hops([actX('LKO-06', 0) + 22.6, actX('LKO-06', 0) + 24.2]), until(done, 600)], cause: 'lko-chakkar' },
  { what: 'walking into her tatkar patch', steps: [...room06, walkTo(actX('LKO-06', 0) + 2, 300), { hold: 'R', until: done, max: 900 }], cause: 'lko-tatkar' },
);
mistakes['LKO-07'].push(
  { what: 'at dusk, running the row without a stop, as the old awnings taught', steps: [...room07, { hold: 'R', until: done, max: 900 }], cause: 'lko-shamiyana' },
  { what: 'at dusk, stopping for the first shivering awning, then running the rest', steps: [...room07, walkTo(actX('LKO-07', 0) + 12.4, 400), until(awningDown('lko07-shaam', 3), 300), { hold: 'R', until: done, max: 900 }], cause: 'lko-shamiyana' },
  { what: 'at the chauraha, rushing the strollers', steps: [...through('LKO-07', room07, 5), walkTo(actX('LKO-07', 5) + 3, 300), hop(actX('LKO-07', 5) + 5, actX('LKO-07', 5) + 7.3), { hold: 'R', until: done, max: 900 }], cause: 'lko-ganj' },
  { what: 'at the chauraha, pausing again under the awnings once they part', steps: [...through('LKO-07', room07, 5), walkTo(actX('LKO-07', 5) + 3, 300), hop(actX('LKO-07', 5) + 5, actX('LKO-07', 5) + 7.3), pause(), runTo(actX('LKO-07', 5) + 14, 400), pause(), until(done, 600)], cause: 'lko-shamiyana' },
);
mistakes['LKO-08'].push({ what: 'in the vault, walking on through the well arch too', steps: [...through('LKO-08', room08, 4), runTo(actX('LKO-08', 4) + 12, 400), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' });
mistakes['LKO-10'].push(
  { what: 'the wash line again, walking straight over it', steps: [...room10, { hold: 'R', until: done, max: 900 }], cause: 'lko-chhapa' },
  { what: 'the heaps again, on the sunny right tiles', steps: [...room10, ...actRoutes0('lko10-dhulai', actX('LKO-10', 0)).slice(0, 5), hops([actX('LKO-10', 0) + 24, actX('LKO-10', 0) + 27]), until(done, 600)], cause: 'lko-malai' },
  { what: 'the court again, hopping square after square', steps: [...through('LKO-10', room10, 1), walkTo(actX('LKO-10', 1) + 3.2, 300), hops([0, 1, 2, 3, 4].map((i) => actX('LKO-10', 1) + 5 + 3 * i + 0.5)), until(done, 300)], cause: 'lko-kuan' },
  { what: 'the procession again, rushing up behind them', steps: [...through('LKO-10', room10, 3), { hold: 'R', until: done, max: 1200 }], cause: 'lko-julus' },
  { what: 'the procession again, keeping the rhythm of the first three nalas', steps: [...through('LKO-10', room10, 3), ...R_lko07_julus('lko10-julus', [12, 24, 36, 48])(actX('LKO-10', 3)), until(done, 600)], cause: 'lko-julus-nala' },
  { what: 'the gallery, walking through the second arch too', steps: [...through('LKO-10', room10, 11), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
  { what: 'the gallery, hopping the drain into the first arch', steps: [...through('LKO-10', room10, 11), runTo(actX('LKO-10', 11) + 1, 300), hop(actX('LKO-10', 11) + 3, actX('LKO-10', 11) + 6), { hold: 'R', until: done, max: 400 }], cause: 'lko-bhool' },
);

mistakes['LKO-07'].push(
  { what: 'at the photograph, pausing so they part, as the strollers taught', steps: [...pre07(), ...actRoutes0('lko07-julus', actX('LKO-07', 2)), walkTo(actX('LKO-07', 3) + 4.5, 300), hop(actX('LKO-07', 3) + 6, actX('LKO-07', 3) + 8.5), walkTo(actX('LKO-07', 3) + 9.2, 300), pause(), { hold: 'R', until: done, max: 600 }], cause: 'lko-photo' },
  { what: 'at the photograph, rushing them', steps: [...pre07(), ...actRoutes0('lko07-julus', actX('LKO-07', 2)), walkTo(actX('LKO-07', 3) + 4.5, 300), hop(actX('LKO-07', 3) + 6, actX('LKO-07', 3) + 8.5), { hold: 'R', until: done, max: 600 }], cause: 'lko-photo-jaldi' },
  { what: 'at the second camera, going on the test flash', steps: [...pre07(), ...actRoutes0('lko07-julus', actX('LKO-07', 2)), ...actRoutes0('lko07-photo', actX('LKO-07', 3)).slice(0, 7), until((w) => (w.flags['lko07-photo:g1'] as Ph).test, 900), { hold: 'R', until: done, max: 600 }], cause: 'lko-photo-test' },
);

mistakes['LKO-08'].push(
  { what: 'on the gallery, jumping on through its arch, as everywhere', steps: [...through('LKO-08', room08, 6), hop(actX('LKO-08', 6) + 2, actX('LKO-08', 6) + 4.5), hop(actX('LKO-08', 6) + 10, actX('LKO-08', 6) + 13), until(done, 400)], cause: 'lko-bhool' },
  { what: 'on the gallery, walking off its end, as at the hanging arch', steps: [...through('LKO-08', room08, 6), hop(actX('LKO-08', 6) + 2, actX('LKO-08', 6) + 4.5), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
);

mistakes['LKO-10'].push(
  { what: 'the photograph again: waiting right by the group, as on the Ganj', steps: [...through('LKO-10', room10, 2), walkTo(actX('LKO-10', 2) + 6.6, 300), hop(actX('LKO-10', 2) + 8, actX('LKO-10', 2) + 10.5), walkTo(actX('LKO-10', 2) + 10.7, 300), until(done, 900)], cause: 'lko-tehzeeb' },
  { what: 'the photograph again: rushing them', steps: [...through('LKO-10', room10, 2), walkTo(actX('LKO-10', 2) + 6.6, 300), hop(actX('LKO-10', 2) + 8, actX('LKO-10', 2) + 10.5), { hold: 'R', until: done, max: 600 }], cause: 'lko-photo-jaldi' },
  { what: 'the greeting again: bowing back right where he greets you, as learned', steps: [...through('LKO-10', room10, 4), walkTo(actX('LKO-10', 4) + 5, 300), until(done, 600)], cause: 'lko-tehzeeb' },
  { what: 'the greeting again: walking on past it, over the covers', steps: [...through('LKO-10', room10, 4), { hold: 'R', until: done, max: 600 }], cause: 'lko-aadaab' },
);

mistakes['LKO-08'].push(
  { what: 'in the vault, jumping at the first arch from the floor, as everywhere', steps: [...through('LKO-08', room08, 1), runTo(actX('LKO-08', 1) + 5, 300), hop(actX('LKO-08', 1) + 8, actX('LKO-08', 1) + 10, '', 6), until(done, 400)], cause: 'lko-bhool' },
  { what: 'in the vault, walking on along the floor', steps: [...through('LKO-08', room08, 1), runTo(actX('LKO-08', 1) + 5, 300), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
);

mistakes['LKO-09'].push(
  { what: 'the whistle duel: crossing on the red flag, as on the first roofs', steps: [...through('LKO-09', room09, 3), walkTo(actX('LKO-09', 3) + 2.5, 300), until(seetiIn(20, 30), 900), hops([actX('LKO-09', 3) + 2.5, actX('LKO-09', 3) + 5.3, actX('LKO-09', 3) + 8.8]), until(done, 600)], cause: 'lko-seeti' },
  { what: 'the whistle duel: going on past the tank roof once your flyer has called', steps: [...through('LKO-09', room09, 3), walkTo(actX('LKO-09', 3) + 2.5, 300), until(seetiIn(165, 175), 900), hops([actX('LKO-09', 3) + 2.5, actX('LKO-09', 3) + 5.3, actX('LKO-09', 3) + 8.8, actX('LKO-09', 3) + 11.2, actX('LKO-09', 3) + 15.6, actX('LKO-09', 3) + 19.2, actX('LKO-09', 3) + 22.8]), until(done, 600)], cause: 'lko-seeti-jawab' },
);

mistakes['LKO-05'].push(
  { what: 'under the ladle: waiting on a heap for it to squash, as all along', steps: [...through('LKO-05', room05, 5), runTo(actX('LKO-05', 5) + 0.6, 300), hops([actX('LKO-05', 5) + 3]), until(done, 900)], cause: 'lko-ghee' },
  { what: 'under the ladle: hopping on from a crusted heap', steps: [...through('LKO-05', room05, 5), runTo(actX('LKO-05', 5) + 0.6, 300), hops([actX('LKO-05', 5) + 3, actX('LKO-05', 5) + 6]), until(done, 600)], cause: 'lko-seekh' },
);

mistakes['LKO-08'].push(
  { what: 'in the dark, walking on to the next patch of light', steps: [...through('LKO-08', room08, 9), hop(actX('LKO-08', 9) + 5, actX('LKO-08', 9) + 7.4), hops([actX('LKO-08', 9) + 7.6]), { hold: 'R', until: done, max: 400 }], cause: 'lko-roshandan' },
  { what: 'in the dark, keeping off the light and walking on', steps: [...through('LKO-08', room08, 9), { hold: 'R', until: done, max: 400 }], cause: 'lko-kuan' },
);

mistakes['LKO-10'].push(
  { what: 'the strollers again: through the gap once they part, as on the Ganj', steps: [...through('LKO-10', room10, 5), walkTo(actX('LKO-10', 5) + 2.5, 300), hop(actX('LKO-10', 5) + 4, actX('LKO-10', 5) + 6.5), pause(), walkTo(actX('LKO-10', 5) + 12.2, 300), until((w) => (w.flags['lko10-raasta:g'] as { s: string }).s === 'bow', 600), { hold: 'R', until: done, max: 600 }], cause: 'lko-pehle' },
  { what: 'the strollers again: rushing them', steps: [...through('LKO-10', room10, 5), walkTo(actX('LKO-10', 5) + 2.5, 300), hop(actX('LKO-10', 5) + 4, actX('LKO-10', 5) + 6.5), { hold: 'R', until: done, max: 600 }], cause: 'lko-ganj' },
);

mistakes['LKO-09'].push(
  { what: 'the tumblers: waiting for the falling birds to clear, as birds coming down taught', steps: [...through('LKO-09', room09, 4), walkTo(actX('LKO-09', 4) + 3.4, 300), until(tumbling, 900), until((w) => !tumbling(w), 300), hops([actX('LKO-09', 4) + 3.4, actX('LKO-09', 4) + 6.6]), until(done, 600)], cause: 'lko-girah' },
  { what: 'the tumblers: crossing on the white, taking the landing for a tumble', steps: [...through('LKO-09', room09, 4), walkTo(actX('LKO-09', 4) + 3.4, 300), until((w) => { const o = (w.flags['lko09-girah:k']?.f as Fl | undefined)?.order(w); return !!o && o.c === 'white' && o.left < 1.4; }, 900), hops([actX('LKO-09', 4) + 3.4, actX('LKO-09', 4) + 6.6]), until(done, 600)], cause: 'lko-kabootar' },
);

mistakes['LKO-10'].push(
  { what: 'the grain: crossing on the red flag, as on the roofs', steps: [...through('LKO-10', room10, 6), walkTo(actX('LKO-10', 6) + 4.3, 300), hops([actX('LKO-10', 6) + 4.3, actX('LKO-10', 6) + 8.2]), until((w) => { const k = w.flags['lko10-daana:k']; return !!k && k.sig.feeding(w) && k.f.order(w).c === 'red'; }, 900), { hold: 'R', until: done, max: 600 }], cause: 'lko-daana' },
  { what: 'the grain: hopping over the feeding birds', steps: [...through('LKO-10', room10, 6), walkTo(actX('LKO-10', 6) + 4.3, 300), hops([actX('LKO-10', 6) + 4.3, actX('LKO-10', 6) + 8.2]), until((w) => { const k = w.flags['lko10-daana:k']; return !!k && k.sig.feeding(w) && k.clock.t >= 0 && (w.tick - k.clock.t) % 420 > 80; }, 900), hops([actX('LKO-10', 6) + 8.2, actX('LKO-10', 6) + 9.6, actX('LKO-10', 6) + 14.4]), until(done, 600)], cause: 'lko-daana-udaan' },
);

mistakes['LKO-10'].push(
  { what: 'the lantern: waiting on a heap’s shady left tile, as the low sun taught', steps: [...through('LKO-10', room10, 7), walkTo(actX('LKO-10', 7) + 3.6, 300), hops([actX('LKO-10', 7) + 3.6, actX('LKO-10', 7) + 6, actX('LKO-10', 7) + 9]), until(done, 900)], cause: 'lko-chirag' },
  { what: 'the lantern: once he has passed, keeping to the left tiles', steps: [...through('LKO-10', room10, 7), walkTo(actX('LKO-10', 7) + 3.6, 300), until(lampPast(actX('LKO-10', 7), 6), 900), hops([actX('LKO-10', 7) + 3.6, actX('LKO-10', 7) + 6]), until(done, 600)], cause: 'lko-malai' },
);

mistakes['LKO-08'].push(
  { what: 'the broken arch: walking the whole one, jumping the one at the floor’s end, as the maze taught', steps: [...through('LKO-08', room08, 3), runTo(actX('LKO-08', 3) + 5.4, 300), hop(actX('LKO-08', 3) + 6.2, actX('LKO-08', 3) + 10, '', 30), until(done, 600)], cause: 'lko-toota' },
  { what: 'the broken arch: walking on through both', steps: [...through('LKO-08', room08, 3), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
);

mistakes['LKO-06'].push(
  { what: 'the tihai: standing on a tied-up strip through the third phrase, as through the first two', steps: [...through('LKO-06', room06, 1), walkTo(actX('LKO-06', 1) + 6, 300), until(done, 900)], cause: 'lko-tihai' },
  { what: 'the tihai: running the stage in one go', steps: [...through('LKO-06', room06, 1), { hold: 'R', until: done, max: 900 }], cause: 'lko-tihai' },
);

mistakes['LKO-07'].push(
  { what: 'the window-shopper: over the nala and along the pavement behind him, as the open side', steps: [...through('LKO-07', room07, 4), runTo(actX('LKO-07', 4) - 3, 300), hop(actX('LKO-07', 4) + 2, actX('LKO-07', 4) + 4.4, '', 2, 1), { hold: 'R', until: done, max: 600 }], cause: 'lko-dukaan' },
  { what: 'the window-shopper: waiting on the step for him to finish', steps: [...through('LKO-07', room07, 4), walkTo(actX('LKO-07', 4) + 0.6, 300), until(done, 900)], cause: 'lko-shamiyana' },
);

mistakes['LKO-06'].push(
  { what: 'the guru: pressing on the old way after her stamp, as on every stage so far', steps: [...through('LKO-06', room06, 2), { ...guruFwd(actX('LKO-06', 2), actX('LKO-06', 2) + 25.5, true), until: done }], cause: 'lko-ghungroo' },
  { what: 'the guru: stopping after each stamp to work out which way is which', steps: [...through('LKO-06', room06, 2), { ...guruFwd(actX('LKO-06', 2), actX('LKO-06', 2) + 25.5), until: (w) => ((w.flags['lko06-guru:g'] as { n: number } | undefined)?.n ?? 0) >= 1 }, until(done, 900)], cause: 'lko-chakkar' },
);

mistakes['LKO-05'].push(
  { what: 'the turning skewers: waiting till they lie still before hopping, as with a still rack', steps: [...through('LKO-05', room05, 6), walkTo(actX('LKO-05', 6) + 0.8, 300), hops([[actX('LKO-05', 6) + 4, spit(48, 56)]]), until(done, 600)], cause: 'lko-seekh' },
  { what: 'the turning skewers: staying on a heap till it all looks safe', steps: [...through('LKO-05', room05, 6), walkTo(actX('LKO-05', 6) + 0.8, 300), hops([[actX('LKO-05', 6) + 4, spit(0, 16)]]), until(done, 900)], cause: 'lko-tawa' },
);

mistakes['LKO-10'].push(
  { what: 'the guru again: pressing the other way after her stamp, as 06 taught', steps: [...through('LKO-10', room10, 8), { ...guruFwd(actX('LKO-10', 8), actX('LKO-10', 8) + 25.5, false, 'lko10-seedha', true), until: done }], cause: 'lko-ghungroo' },
  { what: 'the guru again: stopping after her stamp to see which way is which', steps: [...through('LKO-10', room10, 8), { ...guruFwd(actX('LKO-10', 8), actX('LKO-10', 8) + 25.5, false, 'lko10-seedha'), until: (w) => ((w.flags['lko10-seedha:g'] as { n: number } | undefined)?.n ?? 0) >= 1 }, until(done, 900)], cause: 'lko-chakkar' },
);

mistakes['LKO-10'].push(
  { what: 'the short tihai: counting to three, as 06 taught', steps: [...through('LKO-10', room10, 9), walkTo(actX('LKO-10', 9) + 2.6, 300), until(samDo, 600), runTo(actX('LKO-10', 9) + 9.6, 300), pace10(actX('LKO-10', 9) + 9.4, actX('LKO-10', 9) + 11.4, (w) => tihaiAt(w, 'lko10-do').n === 1 && tihaiAt(w, 'lko10-do').k > 0), runTo(actX('LKO-10', 9) + 15, 300), until(done, 600)], cause: 'lko-tihai-do' },
  { what: 'the short tihai: standing still on a board to wait for sam', steps: [...through('LKO-10', room10, 9), walkTo(actX('LKO-10', 9) + 2.6, 300), until(samDo, 600), walkTo(actX('LKO-10', 9) + 10.4, 300), until(done, 600)], cause: 'lko-tehzeeb' },
);

mistakes['LKO-08'].push(
  { what: 'the whispering gallery: up on the ledge by the handrail, as anyone would', steps: [...through('LKO-08', room08, 8), hop(actX('LKO-08', 8), actX('LKO-08', 8) + 4.5, '', 4), { hold: 'R', until: done, max: 900 }], cause: 'lko-sargoshi' },
  { what: 'the whispering gallery: running the middle, never mind the light coming up', steps: [...through('LKO-08', room08, 8), walkTo(actX('LKO-08', 8) + 0.8, 300), { hold: 'R', until: done, max: 600 }], cause: 'lko-roshandan' },
);

mistakes['LKO-08'].push(
  { what: 'the hall door: jumping at the arch you saw before the door', steps: [...through('LKO-08', room08, 7), walkTo(actX('LKO-08', 7) + 2, 300), { hold: 'R', until: (w) => !!(w.flags['lko08-darwaza:d'] as { warped: boolean } | undefined)?.warped, max: 200 }, runTo(actX('LKO-08', 7) + 14.5, 300), hop(actX('LKO-08', 7) + 15.6, actX('LKO-08', 7) + 20, '', 8, 16), until(done, 400)], cause: 'lko-kuan' },
  { what: 'the hall door: hopping over it, so nothing moves', steps: [...through('LKO-08', room08, 7), walkTo(actX('LKO-08', 7) + 2, 300), hop(actX('LKO-08', 7) + 3, actX('LKO-08', 7) + 6.5), runTo(actX('LKO-08', 7) + 14.5, 300), hop(actX('LKO-08', 7) + 15.6, actX('LKO-08', 7) + 20, '', 8, 16), until(done, 400)], cause: 'lko-bhool' },
);

mistakes['LKO-10'].push(
  { what: 'the hall door again: stopping on arrival to look again, as in the maze', steps: [...through('LKO-10', room10, 10), walkTo(actX('LKO-10', 10) + 2, 300), { hold: 'R', until: warped('lko10-thahra'), max: 200 }, until(done, 600)], cause: 'lko-tehzeeb' },
  { what: 'the hall door again: jumping where the arch moved to in the maze', steps: [...through('LKO-10', room10, 10), walkTo(actX('LKO-10', 10) + 2, 300), { hold: 'R', until: warped('lko10-thahra'), max: 200 }, runTo(actX('LKO-10', 10) + 10.5, 300), hop(actX('LKO-10', 10) + 11.6, actX('LKO-10', 10) + 15, '', 8, 16), { hold: 'R', until: done, max: 600 }], cause: 'lko-kuan' },
);

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  fair: ['LKO-01', 'LKO-02', 'LKO-03', 'LKO-04', 'LKO-05', 'LKO-06', 'LKO-07', 'LKO-08', 'LKO-09', 'LKO-10'],
};
void flag;
void actFlag;
void walkTo;
