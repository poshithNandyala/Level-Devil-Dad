// Ranchi: the city of waterfalls on the edge of the Chota Nagpur plateau. Dhuska frying on Main Road,
// Jharkhand's archers, the monsoon storm and its rugra, Seraikela's Chhau masks, Dokra brass, and Hundru,
// where the Subarnarekha drops off the plateau.
import { type LevelDef, type World } from '../world';
import { Paint } from './endkit';
import { LINES } from '../cities';
import { collectible, door, px, rival, sign } from './kit';
import type { Act } from './acts';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { Artisan, Boss, CastMould, ChhauDancer, Cook, Crucible, DhuskaStall, MaskStand, Mould, Mound, Musicians, Pool, Railing, Range, River, Rugra, Sal, Storm, Stream, addKadhai, dadMask, falls, type Bowman, type CookStep } from '../entities/jharkhand';

const TAUNTS = LINES.RNC.taunt;
const G = 15;
const FLOOR = px(15);
const tara = (n: number, beaten = 0) => ({ intro: LINES.RNC.intro[n], point: 1 as const, introAt: 0.5, taunts: TAUNTS, beaten: LINES.RNC.beaten[beaten] });

// ================================================================== RNC-02: Dhuska (the kadhai)
/** the usual routine for n dhuska: batter into each in turn, flip each in turn, scoop each in turn */
export function routine(n: number, gap = 72, order = [...Array(n).keys()]): { plan: CookStep[]; period: number } {
  const plan: CookStep[] = [];
  order.forEach((i, k) => plan.push({ at: k * gap, a: 'drop', i }));
  order.forEach((i, k) => plan.push({ at: (n + k) * gap, a: 'flip', i }));
  order.forEach((i, k) => plan.push({ at: (2 * n + k) * gap, a: 'scoop', i }));
  return { plan, period: (3 * n * gap) / 120 };
}
/** a kadhai over columns c0..c1 with dhuska at the given columns, and its cook at column cc */
export function dhuskaLine(w: World, c0: number, c1: number, cols: number[], cc: number, o: { gap?: number; order?: number[]; phase?: number; toss?: { vx: number; vy: number; stun?: number }; stall?: boolean } = {}) {
  const { ds } = addKadhai(
    w,
    px(c0),
    px(c1 + 1),
    cols.map((c) => px(c) + 8),
  );
  const r = routine(cols.length, o.gap ?? 72, o.order);
  const face: 1 | -1 = px(cc) > px(c0) ? -1 : 1;
  const cook = w.add(new Cook(px(cc) + 8, face, ds, r.plan, r.period, o.phase ?? 0, o.toss));
  cook.bank0 = px(c0);
  cook.bank1 = px(c1 + 1);
  if (o.stall !== false) w.add(new DhuskaStall(face < 0 ? px(cc) - 4 : px(cc) - 44, 56));
  (w.flags.cooks ??= []).push(cook);
  return { cook, ds };
}

function dhuskaRoom(): LevelDef {
  return {
    id: 'RNC-02',
    city: 'RNC',
    index: 2,
    name: 'Dhuska',
    nameEn: 'Breakfast on Main Road',
    tagline: 'Ranchi starts the day with dhuska: rice batter into hot oil, out puffed and golden. Watch the man work.',
    hint: 'Batter sinks out of sight, then comes up as a dhuska you can stand on. The cook flips every one once (whatever is standing on it goes flying) and later scoops it out. Keep hopping: on to each one as it comes up, off again before his spoon gets there.',
    par: 10,
    map: Grid.ground(15).pit(8, 22).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      dhuskaLine(w, 8, 22, [10, 13, 16, 19], 24, { gap: 80 });
      sign(w, 0.3, 10.4, 3.4, 'MAIN ROAD', 'shop', null, 'nashta');
      rival(w, 3, 15, 1, tara(0));
      onPass(w, px(5), (w2) => w2.guide('Ruk ke dekh! Chamach se pehle kood! | Watch! Jump off before his spoon!'));
      collectible(w, 'dhuska', 14.5, 10.6);
    },
  };
}

/** RNC-02 act: a cook who works out of order, then a long kadhai on a quicker rhythm. */
const galli: Act = {
  id: 'rnc02-galli',
  w: 48,
  advice: 'Two more stalls. The first cook doesn’t go left to right: watch where his ladle goes and wait on the road till the one ahead of you is up. The second kadhai is long and quick: go the moment each one comes up.',
  cps: [21.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 17).pit(c.x + 24, c.x + 42);
  },
  build: (w, c) => {
    const x = c.x;
    dhuskaLine(w, x + 3, x + 17, [x + 5, x + 8, x + 11, x + 14], x + 19, { order: [1, 0, 3, 2], gap: 70, phase: 40 });
    dhuskaLine(w, x + 24, x + 42, [x + 26, x + 29, x + 32, x + 35, x + 38], x + 44, { gap: 58, phase: 20 });
    sign(w, x + 19.5, 10.4, 3, 'GALLI', 'shop', null, 'dhuska');
  },
};


// ================================================================== RNC-03: Teer (the archery range)
/** three arrows a burst, 0.18 s apart, from each start time */
export const burst = (...at: number[]) => at.flatMap((t) => [t, t + 0.18, t + 0.36]);
/** a range: archers (column, the height they shoot at in px above the road, when in each end they loose),
 *  a straw boss from column b0 (bw wide, its top `top` px above the road), and the end's length */
export function range(w: World, men: { c: number; up: number; shots: number[] }[], b0: number, bw: number, top: number, end: number, phase = 0, bottom = px(G), edge?: number) {
  const bowmen: Bowman[] = men.map((m) => ({ x: px(m.c) + 8, feet: Math.min(px(G), px(G) - m.up + 16), lane: px(G) - m.up, shots: m.shots }));
  const boss = w.add(new Boss(px(b0), px(G) - top, px(bw), bowmen.map((b) => b.lane), bottom));
  const r = w.add(new Range(w, bowmen, px(b0), end, phase));
  (w.flags.ranges ??= []).push({ r, boss, edge });
  return { r, boss };
}

function teerRoom(): LevelDef {
  return {
    id: 'RNC-03',
    city: 'RNC',
    index: 3,
    name: 'Teer',
    nameEn: 'The archery range',
    tagline: 'Jharkhand is proud to be the land of archery, and its archers start on bamboo bows. The boss on this range is rather tall.',
    hint: 'The arrows fly over your head while you walk; it’s jumping through their height that gets you shot. Each arrow that hits the straw sticks out of it: a step. Climb them, one height at a time, between shots, and get on top before the whistle: then the coach walks up and pulls every arrow out.',
    par: 12,
    map: Grid.ground(15).put(1, 14, '@').put(26, 7, 'E').rows(),
    build(w: World) {
      door(w);
      range(
        w,
        [
          { c: 5, up: 24, shots: burst(0.6, 3.4) },
          { c: 7, up: 56, shots: burst(1.6, 4.4) },
          { c: 9, up: 88, shots: burst(2.6, 5.4) },
        ],
        24,
        5,
        112,
        7.0,
      );
      sign(w, 11, 10.4, 3.6, 'TEER-DHANUSH', 'shop', null, 'academy');
      rival(w, 2, 15, 1, tara(1));
      onPass(w, px(12), (w2) => w2.guide('Teer pe chadho, seeti se pehle! | Climb the arrows, before the whistle!'));
      collectible(w, 'dhuska', 16, 10.8);
    },
  };
}

/** RNC-03 act: arrows in a post over a pit, then a taller boss with a fourth archer. */
const maidan: Act = {
  id: 'rnc03-maidan',
  w: 50,
  advice: 'A pit with a target post in it: two archers stick a step and a second step in its face, and from the top one you jump over the post. Then a taller boss with four archers: the same climb, one step more, and quicker.',
  cps: [15.5],
  paint: (g, c) => {
    g.pit(c.x + 10, c.x + 13);
  },
  build: (w, c) => {
    const x = c.x;
    range(
      w,
      [
        { c: x + 3, up: 28, shots: burst(0.5, 2.6) },
        { c: x + 5, up: 52, shots: burst(1.3, 3.4) },
      ],
      x + 12,
      1,
      72,
      5.2,
      0.3,
      px(G) + 64,
      px(x + 10),
    );
    range(
      w,
      [
        { c: x + 17, up: 24, shots: burst(0.5, 2.9) },
        { c: x + 19, up: 56, shots: burst(1.1, 3.5) },
        { c: x + 21, up: 88, shots: burst(1.7, 4.1) },
        { c: x + 23, up: 120, shots: burst(2.3, 4.7) },
      ],
      x + 38,
      5,
      140,
      6.2,
      0.2,
    );
    sign(w, x + 26, 10.4, 3.4, 'MORABADI', 'shop', null, 'maidan');
  },
};

// ================================================================== RNC-04: Rugra (the storm)
/** a storm over the forest: the x it stops at each time (px), termite mounds [column, height], and
 *  bumps in the leaves where rugra wait [column, height, ground row] */
export function storm(
  w: World,
  stations: number[],
  o: { dwell?: number; speed?: number; phase?: number; mounds?: [number, number][]; bumps?: [number, number, number?][]; last?: number } = {},
) {
  const st = w.add(new Storm(stations, o.dwell ?? 1.2, o.speed ?? 90, Math.round((o.phase ?? 0) * 120)));
  for (const [c, h] of o.mounds ?? []) st.rods.push(w.add(new Mound(px(c) + 8, px(G) - h)));
  for (const [c, H, r] of o.bumps ?? []) st.spots.push(w.add(new Rugra(px(c) + 8, H, px(r ?? G), o.last)));
  (w.flags.storms ??= []).push(st);
  return st;
}

function rugraRoom(): LevelDef {
  return {
    id: 'RNC-04',
    city: 'RNC',
    index: 4,
    name: 'Rugra',
    nameEn: 'After the thunder',
    tagline: 'Monsoon in the sal forest. Everyone in Ranchi knows the thunder brings the rugra up. Tonight it brings them up rather big.',
    hint: 'The cloud stops, flickers, and its lightning hits the tallest thing under it. If that’s you, or you’re standing right beside it, that’s it. The thunder pushes rugra up out of the leaves all round: stand on a bump before it strikes and the rugra lifts you. Ride them up, and get off high ground before the cloud gets there.',
    par: 12,
    map: Grid.ground(15).fill(9, 15, 10, 14, '#').fill(25, 31, 9, 14, '#').put(1, 14, '@').put(29, 8, 'E').rows(),
    build(w: World) {
      door(w);
      for (const [c, t] of [
        [1, 3],
        [8, 1],
        [18, 2],
        [23, 4],
        [30, 1],
      ])
        w.add(new Sal(px(c) + 8, px(t)));
      const st = storm(w, [110, 216, 400, 216], { speed: 140, phase: -0.31, bumps: [[6, 50], [23, 76]] });
      st.rods.push(w.add(new Mound(px(26) + 8, px(9) - 30, px(9))));
      sign(w, 17, 10.4, 3.4, 'SAL BAN', 'shop', null, 'rugra');
      rival(w, 2, 15, 1, tara(2));
      onPass(w, px(3), (w2) => w2.guide('Garaj ke baad rugra niklega! | After the thunder come the rugra!'));
      collectible(w, 'dhuska', 6.5, 9.4);
    },
  };
}

/** RNC-04 act: no rocks, only rugra. The lightning hits the tallest one, and its thunder brings the next,
 *  taller one up beside it: stairs that build themselves, one strike at a time. */
const seedhi: Act = {
  id: 'rnc04-seedhi',
  w: 30,
  advice: 'No rocks here, only rugra: the lightning hits the tallest one, and its thunder brings the next, taller one up beside it. Climb them like stairs, one step behind the lightning: on to each rugra just after it’s been struck, never before (till then, it’s the tallest thing, and so are you on it).',
  cps: [1.5],
  paint: (g, c) => {
    g.fill(c.x + 16, c.x + 29, 8, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const s0 = px(x + 6) + 8;
    const st = storm(w, [px(x + 3) + 8, s0, s0 + 40, s0 + 80, s0 + 120], { dwell: 1.0, speed: 90, last: 3.4 });
    st.rods.push(w.add(new Mound(px(x + 3) + 8, px(G) - 26)));
    [32, 54, 76, 98].forEach((H, k) => st.spots.push(w.add(new Rugra(s0 + 40 * k, H, px(G), 3.4))));
    for (const [cc, t] of [
      [x + 1, 3],
      [x + 10, 1],
      [x + 20, 2],
      [x + 26, 0],
    ])
      w.add(new Sal(px(cc) + 8, px(t)));
  },
};

// ================================================================== RNC-05: Chhau (the masks)
function chhauRoom(): LevelDef {
  return {
    id: 'RNC-05',
    city: 'RNC',
    index: 5,
    name: 'Chhau',
    nameEn: 'As the mask, so the dance',
    tagline: 'Chaitra Parva in Seraikela, and the Chhau dancers are out under the lights. A dancer becomes whatever his mask is. So, it turns out, do you.',
    hint: 'Jump up at a stand to put its mask on, and the dancers take you for that character. A tiger pounces on a peacock and runs from a hunter. A peacock dances with another peacock: it spreads its wings beside you, and if you’re on them it leaps, and you with it.',
    par: 14,
    map: Grid.ground(15).fill(24, 31, 9, 14, '#').put(1, 14, '@').put(28, 8, 'E').rows(),
    build(w: World) {
      door(w);
      w.add(new Musicians(px(11) + 8));
      w.add(new MaskStand(px(3) + 8, 'mayur'));
      w.add(new MaskStand(px(5) + 8, 'shikari'));
      w.add(new ChhauDancer('baagh', px(8) + 8, px(14) + 8));
      w.add(new MaskStand(px(17) + 8, 'mayur'));
      w.add(new ChhauDancer('mayur', px(19), px(22) + 8));
      dadMask(w);
      sign(w, 8.5, 5.6, 5, 'SERAIKELA CHHAU', 'shop', null, 'chaitra parva');
      rival(w, 1, 15, 1, tara(3));
      onPass(w, px(2), (w2) => w2.guide('Jaisa mukhauta, waisa naach! | As the mask, so the dance!'));
      collectible(w, 'dhuska', 19, 8.4);
    },
  };
}

/** RNC-05 act: the tiger runs from the hunter, but comes back. By the Kharkai, a peacock with a tiger on
 *  its back flies for its life, straight over the river. */
const kharkai: Act = {
  id: 'rnc05-kharkai',
  w: 40,
  advice: 'The tiger runs from the hunter, but only for a while. Put on the peacock mask and the peacock by the river spreads its wings for you: get on, then reach up for the tiger mask hanging over him. A peacock with a tiger on its back flies for its life, straight over the Kharkai.',
  cps: [0.5],
  paint: (g, c) => {
    g.pit(c.x + 23, c.x + 32);
  },
  build: (w, c) => {
    const x = c.x;
    dadMask(w);
    w.add(new River(px(x + 23), px(x + 33)));
    w.add(new MaskStand(px(x + 1) + 8, 'shikari'));
    w.add(new ChhauDancer('baagh', px(x + 9) + 8, px(x + 14) + 8, FLOOR, 7));
    w.add(new MaskStand(px(x + 16) + 8, 'mayur'));
    const pea = w.add(new ChhauDancer('mayur', px(x + 18) + 8, px(x + 21) + 8, FLOOR, 4));
    pea.perch = px(x + 34) + 8;
    w.add(new MaskStand(px(x + 21) + 20, 'baagh', FLOOR, 72));
    sign(w, x + 34.5, 10.4, 3, 'KHARKAI', 'shop', null, 'nadi');
  },
};

// ================================================================== RNC-06: Dokra (the lost wax)
const MOULD = { clay: 1.6, melt: 0.8, hollow: 1.6, pour: 1.0, cool: 1.0, brass: 1.2, reset: 0.6 };
/** a kiln over a passage, with a clay elephant mould sitting in the arch */
function kiln(w: World, c0: number, c1: number, lag = 0, face: 1 | -1 = -1) {
  const m = w.add(new Mould(px(c0), px(c1 + 1), px(12), FLOOR, MOULD, Math.round(-lag * 120)));
  w.add(new Artisan(face < 0 ? px(c0) - 10 : px(c1 + 1) + 10, m, face < 0 ? 1 : -1));
  (w.flags.moulds ??= []).push(m);
  return m;
}

function dokraRoom(): LevelDef {
  return {
    id: 'RNC-06',
    city: 'RNC',
    index: 6,
    name: 'Dokra',
    nameEn: 'The lost wax',
    tagline: 'Dokra is cast the old way: a wax elephant inside a clay one, the wax melted out, the brass poured in. For a moment in between, the elephant is hollow. That’s your moment.',
    hint: 'Each kiln has a clay elephant sitting in its arch. On the fire the wax runs out (don’t touch that), and then it’s hollow: walk straight through before they pour the brass in. Then it’s brass, and solid, till they set the next one.',
    par: 12,
    map: Grid.ground(15).fill(8, 13, 5, 11, '#').fill(19, 24, 5, 11, '#').put(1, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      kiln(w, 8, 13, 0);
      kiln(w, 19, 24, 2.2);
      sign(w, 14.6, 10.4, 3.4, 'DOKRA', 'shop', null, 'malhar basti');
      rival(w, 2, 15, 1, tara(4));
      onPass(w, px(3), (w2) => w2.guide('Mom gaya, pital aaya. Beech mein raasta! | The wax goes out, the brass goes in. In between, a way through!'));
      collectible(w, 'dhuska', 16, 11);
    },
  };
}

/** RNC-06 act: the smiths are on their tea break with the brass still hot in the crucibles. This time you
 *  pour: tip a crucible into the mould below and you've cast yourself a step. */
const ghariya: Act = {
  id: 'rnc06-ghariya',
  w: 34,
  advice: 'The smiths have gone for chai and left the brass in the crucibles. Jump up into a crucible’s handle and it tips into the mould below: a moment later there’s a brass elephant to stand on, and from its back you reach the next ledge. Just don’t be standing in the mould, or under the spout.',
  cps: [1],
  paint: (g, c) => {
    g.fill(c.x + 10, c.x + 33, 11, 14, '#');
    g.fill(c.x + 20, c.x + 33, 8, 10, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const pour = (col: number, floor: number) => {
      const m = w.add(new CastMould(px(col) + 4, floor));
      const k = w.add(new Crucible(m, floor - 64));
      (w.flags.crucibles ??= []).push(k);
      return k;
    };
    pour(x + 7, FLOOR);
    pour(x + 17, FLOOR - 64);
    sign(w, x + 1.2, 10.4, 3.4, 'CHAI BREAK', 'shop', null, 'aate hain');
  },
};

// ================================================================== RNC-07: Hundru (the falls)
/** a stream from y `top` down to the road, centred `dx` px into column c, into the falls' rule */
function stream(w: World, c: number, top: number, dx = 12) {
  const s = w.add(new Stream(px(c) + dx, top, FLOOR));
  falls(w).streams.push(s);
  w.add(new Pool(s.x0, s.x1 + 8));
  return s;
}

function hundruRoom(): LevelDef {
  return {
    id: 'RNC-07',
    city: 'RNC',
    index: 7,
    name: 'Hundru',
    nameEn: 'The falls',
    tagline: 'Here the Subarnarekha jumps ninety-eight metres off the edge of the plateau. Everyone else takes the steps.',
    hint: 'At Hundru a long fall on to the rocks kills you, and it counts from the top of your jump. The falling water is the soft way down: get up on the railing and step off into it, and you sink gently to the pool. Don’t steer out of it.',
    par: 10,
    map: Grid.ground(15).fill(0, 8, 4, 14, '#').fill(20, 22, 12, 14, '#').put(1, 3, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.add(new Railing(px(8), px(4)));
      stream(w, 9, px(4));
      sign(w, 24.5, 10.4, 3.4, 'HUNDRU', 'shop', null, '98 m');
      rival(w, 3, 4, 1, tara(5));
      onPass(w, px(4), (w2) => w2.guide('Paani ke saath utro! | Go down with the water!'));
      collectible(w, 'dhuska', 21, 10.8);
    },
  };
}

/** RNC-07 act: the rocks below the falls. Up them any way you like; down a high one by walking off
 *  (a jump adds its own height to the fall), off the tallest at a run, and off the last into the water. */
const chattan: Act = {
  id: 'rnc07-chattan',
  w: 38,
  advice: 'Below the falls it’s all rock. Jump up the rocks as you like, but come down off a high one by walking off the edge: a jump off it adds its own height to the fall. Off the tallest one, run: the little rock below is a long step out. And off the last, there’s only the water.',
  cps: [10.5, 25.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 2, x + 4, 12, 14, '#');
    g.fill(x + 5, x + 9, 9, 14, '#');
    g.fill(x + 12, x + 14, 12, 14, '#');
    g.fill(x + 15, x + 17, 9, 14, '#');
    g.fill(x + 18, x + 22, 6, 14, '#');
    g.fill(x + 25, x + 26, 12, 14, '#');
    g.fill(x + 28, x + 30, 9, 14, '#');
    g.fill(x + 31, x + 34, 6, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    stream(w, x + 35, 0);
    sign(w, x + 10.2, 10.4, 3, 'PATHAR', 'shop', null, 'sambhal ke');
  },
};

// ================================================================== RNC-08: Toofan (the storm, the finale)
function toofanRoom(): LevelDef {
  return {
    id: 'RNC-08',
    city: 'RNC',
    index: 8,
    name: 'Toofan',
    nameEn: 'The storm',
    tagline: 'The monsoon breaks over the plateau all at once. Ranchi carries on regardless.',
    hint: 'The cloud has stopped over the falls: it flickers, and strikes the tallest thing under it. Sinking slowly down the water, that’s you. Wait up top till it has struck, then walk off into the water at once, and out from under the cloud at the bottom before it strikes again.',
    par: 14,
    map: Grid.ground(15).fill(0, 8, 4, 14, '#').put(1, 3, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      // the water comes out of a cleft in the rock, part way down
      w.add(
        new Paint((ctx) => {
          ctx.fillStyle = '#4A3B33';
          ctx.beginPath();
          ctx.moveTo(px(11), px(7) + 4);
          ctx.lineTo(px(12) + 6, px(6) - 6);
          ctx.lineTo(px(15), px(6) - 2);
          ctx.lineTo(px(16), px(7) + 6);
          ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.fillRect(px(13) - 4, px(7) - 3, 24, 4);
        }, 3),
      );
      stream(w, 13, px(7), 8);
      for (const [c, t] of [
        [19, 1],
        [24, 3],
      ])
        w.add(new Sal(px(c) + 8, px(t)));
      storm(w, [px(13) + 8], { dwell: 3.6, phase: 1.59 });
      sign(w, 17.2, 10.4, 3.4, 'HUNDRU', 'shop', null, 'toofan');
      rival(w, 3, 4, 1, tara(6, 1));
      onPass(w, px(4), (w2) => w2.guide('Paani mein tum sabse oonche ho! | In the water, you’re the tallest thing!'));
      collectible(w, 'dhuska', 20, 12.4);
    },
  };
}

/** RNC-08 act: the peacock still flies for its life with a tiger on its back, straight over the
 *  Subarnarekha... and lands on a rock far too high to jump down from. Down the falls, then. */
const ghagh: Act = {
  id: 'rnc08-ghagh',
  w: 36,
  advice: 'The peacock by the river: its mask on, up on its wings, and reach for the tiger mask over it. It flies for its life, with you aboard, over the river, and lands on a rock far too high to jump down from. Walk off the end into the falls.',
  cps: [27.5],
  paint: (g, c) => {
    g.pit(c.x + 10, c.x + 21);
    g.fill(c.x + 22, c.x + 27, 6, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    dadMask(w);
    w.add(new River(px(x + 10), px(x + 22)));
    w.add(new MaskStand(px(x + 2) + 8, 'mayur'));
    const pea = w.add(new ChhauDancer('mayur', px(x + 5) + 8, px(x + 8) + 8, FLOOR, 4));
    pea.perch = px(x + 24) + 8;
    pea.landY = px(6);
    w.add(new MaskStand(px(x + 8) + 20, 'baagh', FLOOR, 72));
    stream(w, x + 28, px(6));
    sign(w, x + 30.5, 10.4, 3.2, 'SUBARNAREKHA', 'shop', null, 'nadi');
  },
};

export const RNC: LevelDef[] = [
  tour({
    id: 'RNC-01',
    city: 'RNC',
    name: 'Johar, Ranchi!',
    nameEn: 'Greetings, Ranchi!',
    tagline: 'The city of waterfalls, up on the Chota Nagpur plateau.',
    lines: [
      'Hian aao, Dad! Ranchi mein swagat! | Come here, Dad! Welcome to Ranchi!',
      'Ranchi jharnon ka shahar hai! | Ranchi is the city of waterfalls!',
      'Hundru mein Swarnrekha sau meter girti hai! | At Hundru the river drops a hundred metres!',
      'Jharkhand, teer-dhanush ki dharti! | Jharkhand, the land of archery!',
      'Bijli ke baad rugra nikalta hai! | After the lightning, the rugra come up!',
      'Chal Dad, asli khel! | Come on Dad, the real game!',
    ],
    shouts: [
      [21, 'Dhuska garam, ghugni ke saath! | Hot dhuska, with ghugni!'],
      [84, 'Moen dhuska khamu! | I’ll have a dhuska!'],
    ],
    ride: 'cart',
    item: 'dhuska',
    signs: [
      [8, 'MAIN ROAD', 'nashta'],
      [55, 'MORABADI', 'maidan'],
      [102, 'HUNDRU', '45 km'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'DHUSKA' }],
      ['crowd', 33, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({ base: dhuskaRoom(), par: 56, acts: [galli], twist: 'ulta' }),
  longStage({ base: teerRoom(), par: 60, acts: [maidan], twist: 'nishana' }),
  longStage({ base: rugraRoom(), par: 56, acts: [seedhi], twist: 'tadit' }),
  longStage({ base: chhauRoom(), par: 40, acts: [kharkai], twist: 'chehra' }),
  longStage({ base: dokraRoom(), par: 56, acts: [ghariya], twist: 'kataar' }),
  longStage({ base: hundruRoom(), par: 44, acts: [chattan], twist: 'khoh' }),
  longStage({ base: toofanRoom(), par: 48, acts: [ghagh], twist: 'dwar' }),
];
