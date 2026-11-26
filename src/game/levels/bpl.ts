// Bhopal: the city of lakes. Skip like a stone across the Upper Lake, step in to Bhimbetka's rock
// paintings, trail a zardozi thread you mustn't cross, bounce on jal tarang bowls, survive Surma
// Bhopali's tall tales, and dodge BHEL's crane magnets.
import { type LevelDef, type World } from '../world';
import { LINES } from '../cities';
import { collectible, door, prop, px, rival, sign } from './kit';
import type { Act } from './acts';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { Bison, Chumbak, Gate, Katori, Lake, Ledge, Morph, Sailboat, Shelter, Sher, Sitara, Surma, Tawa, Thread } from '../entities/bhopal';

const TAUNTS = LINES.BPL.taunt;
const G = 15;
const tara = (n: number, beaten = 0) => ({ intro: LINES.BPL.intro[n % LINES.BPL.intro.length], point: 1 as const, introAt: 0.5, taunts: TAUNTS, beaten: LINES.BPL.beaten[beaten % LINES.BPL.beaten.length] });

// ================================================================== BPL-02: Bada Talab (skip like a stone)
/** the lake over tile columns c0..c1 (which the map leaves as a pit) */
export function lake(w: World, c0: number, c1: number) {
  return w.add(new Lake(px(c0), px(c1 + 1), px(G) + 3));
}
/** a sailboat tacking between columns ca and cb */
export function sailboat(w: World, ca: number, cb: number, speed = 26, hue?: string, start = 0) {
  return w.add(new Sailboat(px(ca), px(cb), px(G) - 3, speed, hue, start));
}

function talabRoom(): LevelDef {
  return {
    id: 'BPL-02',
    city: 'BPL',
    index: 2,
    name: 'Bada Talab',
    nameEn: 'The big lake',
    tagline: 'Raja Bhoj dammed a river a thousand years ago and Bhopal has had its lake ever since. There is no bridge.',
    hint: 'Stand in the lake and you sink. Hit it at a run and you skip like a flat stone: three skips, each a bit slower, then in you go. Start with a running jump off the bank, keep holding forward, and tap jump just as you touch the water for a skip that costs nothing.',
    par: 9,
    map: Grid.ground(15).pit(8, 17).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.lakes = [lake(w, 8, 17)];
      sign(w, 1.6, 10.4, 4.4, 'BADA TALAB', 'shop', null, 'boat club');
      rival(w, 4, 15, 1, tara(0));
      onPass(w, px(4), (w2) => w2.guide('Daud ke koodo, tappa khao! | Run, jump, and skip!'));
      collectible(w, 'poha', 14.5, 12.6);
    },
  };
}

/** BPL-02 act: a wider reach with a sailboat tacking in the middle of it, then one with an island. */
const jheel: Act = {
  id: 'bpl02-jheel',
  w: 50,
  advice: 'A wider reach: skip out to the sailboat (it tacks back and forth, so time your run), take a running jump off its deck and skip on. Then an island: two skips to it, three on to the bank.',
  cps: [22.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 19).pit(x + 26, x + 33).pit(x + 37, x + 46);
  },
  build: (w, c) => {
    const x = c.x;
    lake(w, x + 4, x + 19);
    sailboat(w, x + 10, x + 12.5, 22, '#E53935');
    lake(w, x + 26, x + 33);
    lake(w, x + 37, x + 46);
    sign(w, x + 21, 10.4, 3.6, 'TAKIA', 'shop', null, 'island');
  },
};

// ================================================================== BPL-03: Bhimbetka (in to the painting)
/** the stage's one rock shelter (its two worlds) */
export function shelter(w: World): Shelter {
  if (!w.flags.shelter) w.flags.shelter = w.add(new Shelter());
  return w.flags.shelter as Shelter;
}
/** a hand stencil at tile column c, a jump above the floor */
export function hand(w: World, c: number, up = 40) {
  shelter(w).hand(px(c) + 8, px(G) - up);
}
/** a boulder (real) over columns c0..c1 from row r0 down to the floor */
export function boulder(w: World, c0: number, c1: number, r0: number, r1 = G - 1) {
  return w.add(new Ledge(shelter(w), px(c0), px(r0), px(c1 - c0 + 1), px(r1 - r0 + 1), true));
}
/** something painted (only there for a painted man) over columns c0..c1, rows r0..r1 */
export function painted(w: World, c0: number, c1: number, r0: number, r1 = r0, thin = false) {
  return w.add(new Ledge(shelter(w), px(c0), px(r0), px(c1 - c0 + 1), thin ? 6 : px(r1 - r0 + 1), false));
}
export function bison(w: World, ca: number, cb: number, speed = 70, start = 0, floor = px(G)) {
  return w.add(new Bison(shelter(w), px(ca), px(cb), floor, speed, start));
}

function bhimbetkaRoom(): LevelDef {
  return {
    id: 'BPL-03',
    city: 'BPL',
    index: 3,
    name: 'Bhimbetka',
    nameEn: 'The painted shelters',
    tagline: 'Rock shelters painted on for thirty thousand years: bison, hunters, dancers, and the odd red hand.',
    hint: 'Jump up and touch a red hand stencil and you step in to the painting on the wall (touch another to step out). A painted man walks through real boulders, but painted things are real to him: painted walls, painted ledges, painted bison.',
    par: 10,
    scene: { kind: 'rock', place: 'Bhimbetka', sky: ['#7A5C48', '#B98E6A', '#E8C9A0'], with: ['bhimbetka'] },
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      hand(w, 8);
      boulder(w, 11, 12, 5);
      bison(w, 14, 19, 60, 0.6);
      hand(w, 21.5);
      painted(w, 24, 24, 5, 14);
      sign(w, 1.4, 10.4, 4.2, 'BHIMBETKA', 'shop', null, 'rock shelters');
      rival(w, 4, 15, 1, tara(1, 1));
      onPass(w, px(5), (w2) => w2.guide('Laal haath chhuo, koodke! | Jump and touch the red hand!'));
      collectible(w, 'poha', 17, 11);
    },
  };
}

/** BPL-03 act: a painted bridge over a real drop, bison, a real slab over the next drop, and out. */
const shelters: Act = {
  id: 'bpl03-shelters',
  w: 46,
  advice: 'The first gap only has a painted bridge, so be painted. The bison is on the far side with the next hand: touch it, because the second gap only has a real slab. Then a painted wall (stay real), and one more painted bridge.',
  cps: [21.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 6, x + 12).pit(x + 23, x + 29).pit(x + 36, x + 41);
  },
  build: (w, c) => {
    const x = c.x;
    hand(w, x + 3);
    painted(w, x + 6, x + 12, G, G, true);
    bison(w, x + 14, x + 18, 64, 0.3);
    hand(w, x + 20);
    w.add(new Ledge(shelter(w), px(x + 23), px(G), px(7), 8, true));
    painted(w, x + 31, x + 31, 5, 14);
    hand(w, x + 33.5);
    painted(w, x + 36, x + 41, G, G, true);
    hand(w, x + 43);
    boulder(w, x + 45, x + 45, 5);
  },
};

// ================================================================== BPL-04: Zari ka Dhaaga (the thread)
export function thread(w: World, c0: number, c1: number) {
  return w.add(new Thread(px(c0) + 8, px(c1) + 8, px(G)));
}
export function sitara(w: World, c: number, r: number) {
  return w.add(new Sitara(px(c) + 8, px(r) + 8));
}
/** a rolled-down panel standing on row `r1` at column c, `rows` tall */
export function gate(w: World, c: number, r1: number, rows: number, keys: Sitara[]) {
  return w.add(new Gate(px(c) + 3, px(r1 + 1 - rows), px(rows), keys));
}

function zariRoom(): LevelDef {
  return {
    id: 'BPL-04',
    city: 'BPL',
    index: 4,
    name: 'Zari ka Dhaaga',
    nameEn: 'The gold thread',
    tagline: 'Bhopal’s zardozi: gold thread and sequins on velvet. Today the needle is you.',
    hint: 'From the spool on, you trail a gold thread, and it stays wherever you’ve been. Touch it again and you’re tangled: where you’ve walked you can’t walk again, and you can’t turn back. So look first: the panel wants its sitara, and the sitara is up the steps.',
    par: 10,
    map: Grid.ground(15).fill(6, 7, 12, 14, '#').fill(8, 20, 10, 10, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      thread(w, 3, 27);
      const s = sitara(w, 7.6, 8.4);
      gate(w, 24, 14, 6, [s]);
      sign(w, 0.3, 10.4, 3.4, 'ZARDOZI', 'shop', null, 'karkhana');
      rival(w, 2, 15, 1, tara(2));
      w.after(1.2, () => w.guide('Pehle upar! Sitara lo! | Up first! Get the sequin!'));
      collectible(w, 'poha', 14, 8.2);
    },
  };
}

/** BPL-04 act: the karchob (the embroidery frame). Two sitaras, three levels, one order that works. */
const karchob: Act = {
  id: 'bpl04-karchob',
  w: 46,
  advice: 'Two sitaras: one down at the far right, one up at the top left, and the way out is top right. Don’t go up first. Walk the floor right to the low sitara, climb on to the middle level and come back left along it, hop to the block, up to the top, take the high sitara and walk out along the top.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 3, x + 5, 12, 12, '#').fill(x + 7, x + 30, 12, 12, '#').fill(x + 6, x + 38, 9, 9, '#');
    g.fill(x + 39, x + 40, 12, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    thread(w, x + 1, x + 43);
    const a = sitara(w, x + 32.5, 13.6);
    const b = sitara(w, x + 7.5, 7.4);
    gate(w, x + 36, 8, 5, [a, b]);
    sign(w, x + 41.5, 10.4, 3.2, 'KARCHOB', 'shop', null, 'frame');
  },
};

// ================================================================== BPL-05: Jal Tarang (the bowls)
export function katori(w: World, c: number, floor = px(G)) {
  return w.add(new Katori(px(c) + 8, floor));
}

function tarangRoom(): LevelDef {
  return {
    id: 'BPL-05',
    city: 'BPL',
    index: 5,
    name: 'Jal Tarang',
    nameEn: 'Waves in water',
    tagline: 'At Bharat Bhavan someone is playing the jal tarang: china bowls of water, each a note. Mind your feet.',
    hint: 'Jump in to a bowl and it rings and bounces you. Water slops out each time, so every bounce is higher than the last: the fifth is higher than you can jump. After that the bowl is dry and won’t bounce till it has filled again.',
    par: 11,
    map: Grid.ground(15).fill(15, 16, 11, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.bowls = [katori(w, 12)];
      sign(w, 2.4, 10.4, 4.6, 'BHARAT BHAVAN', 'shop', null, 'aaj: jal tarang');
      rival(w, 5, 15, 1, tara(3, 1));
      onPass(w, px(8), (w2) => w2.guide('Katori mein koodo! Baar baar! | Jump in the bowl! Again and again!'));
      collectible(w, 'poha', 12, 9.4);
    },
  };
}

/** BPL-05 act: three bowls on posts across a drop, a wall, and a higher wall with the bowl on a block. */
const mehfil: Act = {
  id: 'bpl05-mehfil',
  w: 40,
  advice: 'Bowl to bowl across the drop: a full bowl only gives a little bounce, just enough to reach the next, so keep steering. Then a wall (five bounces), and a higher wall whose bowl is up on a block.',
  cps: [16.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 5, x + 6).pit(x + 8, x + 9).pit(x + 11, x + 12).pit(x + 14, x + 14);
    g.fill(x + 23, x + 24, 11, 14, '#');
    g.fill(x + 30, x + 30, 14, 14, '#').fill(x + 33, x + 34, 10, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    katori(w, x + 7);
    katori(w, x + 10);
    katori(w, x + 13);
    katori(w, x + 20);
    katori(w, x + 30, px(14));
    sign(w, x + 16, 10.4, 3.4, 'MEHFIL', 'shop', null, 'sham 7 baje');
  },
};

// ================================================================== BPL-06: Batolebaaz (Surma Bhopali's tall tales)
/** a plank bridge over the pit at columns c0..c1 (which the story can break) */
export function plank(w: World, c0: number, c1: number) {
  return w.add(new Morph(px(c0), px(G), px(c1 - c0 + 1), 8, true, 'plank'));
}
/** a low wall at column c (which the story can make taller) */
export function stub(w: World, c: number) {
  return w.add(new Morph(px(c), px(G) - 16, 16, 16));
}

function batoleRoom(): LevelDef {
  return {
    id: 'BPL-06',
    city: 'BPL',
    index: 6,
    name: 'Batolebaaz',
    nameEn: 'The teller of tall tales',
    tagline: 'Surma Bhopali, on his stool in the Chowk, telling it the way it never happened.',
    hint: 'Whatever Surma Bhopali says about the road ahead comes true a moment after he says it. "The bridge fell": jump now. "The wall was sky high": get over it while it’s small. He tells it the same way every time.',
    par: 9,
    map: Grid.ground(15).pit(10, 13).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const bridge = plank(w, 10, 13);
      const wall = stub(w, 23);
      w.flags.surma = w.add(
        new Surma(px(17) + 8, px(G), [
          { at: px(10) + 4, say: 'Yahan pul tha, miyan... toot gaya! | There was a bridge here, sir... it fell!', after: 0.5, then: (w2) => bridge.vanish(w2) },
          { at: px(18) + 8, say: 'Aur deewar? Asmaan tak thi! | And the wall? Sky high!', after: 0.6, then: () => wall.grow(40) },
        ]),
      );
      sign(w, 2, 10.4, 3.4, 'CHOWK', 'shop', null, 'purana Bhopal');
      sign(w, 15.6, 10.4, 3, 'PAAN', 'shop', null, 'Surma & Sons');
      rival(w, 5, 15, 1, tara(4));
      collectible(w, 'poha', 12, 11.4);
    },
  };
}

/** BPL-06 act: five more of his stories: a tiger, another bridge, the roof, a wall, the ground. */
const chowk: Act = {
  id: 'bpl06-chowk',
  w: 44,
  advice: 'Five more stories, in this order: a tiger (jump it), a bridge that falls (jump), the roof coming down (don’t stop running), a wall growing (hop it early) and the ground opening (jump). Listen, then do it at once.',
  cps: [14.5, 25.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 10, x + 13).pit(x + 36, x + 39);
  },
  build: (w, c) => {
    const x = c.x;
    const X = c.X;
    const sher = w.add(new Sher(X(21), X(0) - 20, px(G)));
    const bridge = plank(w, x + 10, x + 13);
    const roof = w.add(new Morph(X(18), px(3), px(5), 64));
    const wall = stub(w, x + 31);
    const floor = plank(w, x + 36, x + 39);
    w.add(
      new Surma(X(25) + 8, px(G), [
        { at: X(4), say: 'Tabhi ek sher aa gaya, khan! | Just then a tiger turned up, friend!', after: 0.5, then: () => sher.go() },
        { at: X(10) + 4, say: 'Pul? Woh bhi toot gaya! | The bridge? That fell too!', after: 0.5, then: (w2) => bridge.vanish(w2) },
        { at: X(16), say: 'Phir chhat gir padi! | Then the roof came down!', after: 0.95, then: () => roof.drop(113) },
        { at: X(27), say: 'Deewar? Asmaan tak thi! | The wall? Sky high!', after: 0.6, then: () => wall.grow(40) },
        { at: X(36) + 4, say: 'Aur zameen phat gayi! | And the ground split open!', after: 0.5, then: (w2) => floor.vanish(w2) },
      ]),
    );
    sign(w, x + 1, 10.4, 3.4, 'IBRAHIMPURA', 'shop', null, 'gali');
  },
};

// ================================================================== BPL-07: BHEL (the crane magnets)
/** the stage's tawa (carried from column c on) */
export function tawa(w: World, c: number): Tawa {
  if (!w.flags.tawaEnt) w.flags.tawaEnt = w.add(new Tawa(px(c), 1e9, px(G)));
  return w.flags.tawaEnt as Tawa;
}
/** a crane magnet that runs along its girder from column ca to cb while it's on, and back while off */
export function crane(w: World, ca: number, cb: number, row: number, every: number, phase = 0, speed = 90) {
  const a = px(ca) + 8,
    b = px(cb) + 8;
  const on = 0.7 + (b - a) / speed + 0.25;
  return w.add(new Chumbak(a, px(row), { every, on, phase, rail: [a, b], speed }));
}
/** a magnet with its guard off, always on: touch it and that's that */
export function spiked(w: World, c: number, row = 5, reach = 100) {
  return w.add(new Chumbak(px(c), px(row), { spiked: true, reach }));
}

function bhelRoom(): LevelDef {
  return {
    id: 'BPL-07',
    city: 'BPL',
    index: 7,
    name: 'BHEL',
    nameEn: 'The heavy electricals works',
    tagline: 'Bhopal builds turbines the size of houses, and lifts them with magnets. You are carrying the poha-wala’s iron tawa.',
    hint: 'With the iron tawa on you, a crane magnet that’s switched on (red) pulls you straight up and carries you along its girder till it switches off. The ones with spikes are always on: under those, small hops only, a full jump gets you close enough to be grabbed.',
    par: 14,
    scene: { kind: 'rock', place: 'BHEL Bhopal', sky: ['#37474F', '#607D8B', '#B0BEC5'], with: ['bhel'] },
    map: Grid.ground(15).pit(10, 19).pit(24, 25).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      tawa(w, 3);
      w.flags.cranes = [crane(w, 8, 21.5, 8, 6.6, 5.2)];
      spiked(w, 25);
      sign(w, 0.4, 10.4, 3, 'BHEL', 'shop', null, 'block 3');
      rival(w, 5, 15, 1, tara(5, 1));
      onPass(w, px(3), (w2) => w2.guide('Tawa lo! Ab chumbak ke neeche! | Take the tawa! Now under the magnet!'));
      onPass(w, px(21), (w2) => w2.guide('Kaante wala! Chhota koodo! | The spiked one! Small hop!'));
      collectible(w, 'poha', 15, 9.6);
    },
  };
}

/** BPL-07 act: a relay of two cranes with an island between, a magnet for a lift, two spiked ones. */
const karkhana: Act = {
  id: 'bpl07-karkhana',
  w: 48,
  advice: 'Two cranes in relay: the first sets you down on the island, wait there under the second. Then the magnet by the tall wall is your lift: it drops you when it switches off, so steer right on to the wall as you fall. Then walk off the wall (don’t jump off it) to two spiked ones over gaps: small hops.',
  cps: [24.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 11).pit(x + 14, x + 21);
    g.fill(x + 28, x + 31, 8, 14, '#');
    g.pit(x + 37, x + 38).pit(x + 42, x + 43);
  },
  build: (w, c) => {
    const x = c.x;
    crane(w, x + 2, x + 12.5, 8, 6, 0.4);
    crane(w, x + 12.5, x + 23, 8, 6, 3.0);
    w.add(new Chumbak(px(x + 27), px(5), { every: 3.2, on: 1.7, phase: 0, reach: 170 }));
    spiked(w, x + 38);
    spiked(w, x + 43);
    sign(w, x + 24, 10.4, 3.4, 'TURBINE', 'shop', null, 'shop floor');
  },
};

// ================================================================== BPL-08: Bhojtal (everything, on the lake)
function bhojtalRoom(): LevelDef {
  return {
    id: 'BPL-08',
    city: 'BPL',
    index: 8,
    name: 'Bhojtal',
    nameEn: 'Raja Bhoj’s lake',
    tagline: 'Tal toh Bhopal Tal, baaki sab talaiya: there is one lake, and the rest are ponds.',
    hint: 'The whole width of the lake, with two sailboats tacking on it. Skip to the first, take a running jump off its deck, skip to the second, and on to the bank. Time each run for where the boat will be.',
    par: 16,
    map: Grid.ground(15).pit(6, 25).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      lake(w, 6, 25);
      sailboat(w, 12, 13.6, 14, '#E53935');
      sailboat(w, 21.4, 23, 14, '#FB8C00', 0.5);
      sign(w, 0.3, 10.4, 3.6, 'BHOJTAL', 'shop', null, 'Raja Bhoj');
      rival(w, 3, 15, 1, tara(6));
      collectible(w, 'poha', 17.5, 12.4);
    },
  };
}

/** BPL-08 act: a painted bridge, a bowl up a wall, a crane over a drop, and a sitara to sew on. */
const bhojtal: Act = {
  id: 'bpl08-bhojtal',
  w: 58,
  advice: 'All of Bhopal: touch the hand for the painted bridge and the next to step out; five bounces up the wall; the crane over the drop (you have the tawa again); then the thread: up the step for the sitara first.',
  cps: [14.5, 24, 41],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 5, x + 10);
    g.fill(x + 20, x + 21, 11, 14, '#');
    g.pit(x + 28, x + 36);
    g.fill(x + 45, x + 46, 12, 14, '#').fill(x + 47, x + 51, 10, 10, '#');
  },
  build: (w, c) => {
    const x = c.x;
    hand(w, x + 2);
    painted(w, x + 5, x + 10, G, G, true);
    hand(w, x + 12.5);
    katori(w, x + 17.4);
    w.add(new Tawa(px(x + 24), px(x + 40), px(G)));
    crane(w, x + 26, x + 38.5, 8, 6.4, 0);
    thread(w, x + 42, x + 55);
    const s = sitara(w, x + 46.6, 8.4);
    gate(w, x + 53, 14, 6, [s]);
  },
};

export const BPL: LevelDef[] = [
  tour({
    id: 'BPL-01',
    city: 'BPL',
    name: 'Ko Khan, Bhopal!',
    nameEn: 'Hello, Bhopal!',
    tagline: 'A city built round two lakes by a king and kept by four begums in a row.',
    lines: [
      'Ko khan, Dad! Bhopal mein khushamdeed! | Hey there, Dad! Welcome to Bhopal!',
      'Bada Talab hazaar saal purana hai, Raja Bhoj ka! | The big lake is a thousand years old, Raja Bhoj’s own!',
      'Sau saal yahan begumon ne raj kiya, miyan! | Begums ruled here for a hundred years, sir!',
      'Taj-ul-Masajid dekho, kitni badi! | Look at Taj-ul-Masajid, the size of it!',
      'Subah poha-jalebi, shaam ko paan aur batole! | Poha-jalebi in the morning, paan and tall tales at night!',
      'Chalo Dad, asli khel! | Come on Dad, the real game!',
    ],
    shouts: [
      [21, 'Garam poha! Jalebi taazi! | Hot poha! Fresh jalebi!'],
      [84, 'Gaadi aa rahi hai, khan! | Train’s coming, friend!'],
    ],
    ride: 'cart',
    item: 'poha',
    signs: [
      [8, 'CHOWK BAZAAR', 'purana shehar'],
      [55, 'VIP ROAD', 'lake view'],
      [102, 'BHARAT BHAVAN', 'kala kendra'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'POHA' }],
      ['crowd', 33, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: talabRoom(),
    par: 30,
    acts: [jheel],
    twist: 'ghat',
  }),
  longStage({
    base: bhimbetkaRoom(),
    par: 34,
    acts: [shelters],
    twist: 'haath',
  }),
  longStage({
    base: zariRoom(),
    par: 36,
    acts: [karchob],
    twist: 'gaanth',
  }),
  longStage({
    base: tarangRoom(),
    par: 38,
    acts: [mehfil],
    twist: 'khaali',
  }),
  longStage({
    base: batoleRoom(),
    par: 30,
    acts: [chowk],
    twist: 'paan',
  }),
  longStage({
    base: bhelRoom(),
    par: 44,
    acts: [karkhana],
    twist: 'rakhdo',
  }),
  longStage({
    base: bhojtalRoom(),
    par: 70,
    acts: [bhojtal],
    twist: 'kissa',
  }),
];
void prop;
