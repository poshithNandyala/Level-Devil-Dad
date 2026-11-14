// Gandhinagar (and its Gujarat): the kite looters' bamboo at Uttarayan, sunbeams in the Adalaj
// stepwell, Indroda's dinosaur, the lions of Gir, peacock feathers, a garba ring and GIFT City.
import { type LevelDef, type World } from '../world';
import { LINES } from '../cities';
import { collectible, door, prop, px, rival, sign } from './kit';
import type { Act } from './acts';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { Paint } from './endkit';
import { polHouse } from './westkit';
import { Bamboo, Dino, FeatherPickup, Feathers, GarbaRing, Lion, Manja, Naka, Peacock, Sandstone, Sunbeam, Thorns, Ticker, prices, type Ring } from '../entities/gujarat';
import { pool } from './acts';

const TAUNTS = LINES.GNR.taunt;
const G = 15;

/** pol houses drawn over hidden-tile blocks: [first col, last col, top row, wall colour] */
function houses(w: World, list: [number, number, number, string][]) {
  w.add(
    new Paint((ctx) => {
      for (const [c0, c1, r, col] of list) polHouse(ctx, px(c0), px(c1 + 1), px(r), px(G), col);
    }, -2),
  );
}

// ================================================================== GNR-02: Kai Po Che! (the bamboo)
function vaultRoom(): LevelDef {
  return {
    id: 'GNR-02',
    city: 'GNR',
    index: 2,
    name: 'Kai Po Che!',
    nameEn: 'I cut your kite!',
    tagline: 'Uttarayan in the pol: a kite on every roof, and the looters have bamboo.',
    hint: 'Grab the kite looters’ bamboo: now every running jump is a pole vault, higher the longer your run-up. Too long a run and you fly into a kite string; too short and you hit the wall. The pole slips on tin roofs: plant it on the concrete.',
    par: 9,
    map: Grid.ground(15).pit(9, 10).fill(11, 18, 10, 14, '%').pit(19, 21).fill(22, 27, 5, 14, '%').put(3, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      houses(w, [
        [11, 18, 10, '#F4A261'],
        [22, 27, 5, '#E9C46A'],
      ]);
      w.flags.bam = w.add(new Bamboo(px(1) + 8, px(G), [{ x0: px(11), x1: px(15), top: px(10) }]));
      w.add(new Manja(px(8) + 4, 112, px(13) + 8, 112));
      sign(w, 4.5, 10.4, 3.6, 'POL', 'shop', null, 'Khadia');
      sign(w, 23, 1.4, 4.2, 'UTTARAYAN', 'shop', null, '14 Jan');
      prop(w, 'bulbs', 24.5, 5);
      rival(w, 5, 15, -1, { intro: LINES.GNR.intro[0], point: -1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[1] });
      w.after(2.4, () => w.guide('Pachhal vaans padyo chhe, Dad! | There’s a bamboo behind you, Dad!'));
      w.when(
        (w2) => !!w2.flags.bamboo,
        // (only while it's still news: not once he's vaulted, or got as far as the last gap)
        (w2) => w2.guide('Have pura jor thi daudo ane kudo! | Now run flat out and jump!', (w3) => !w3.flags.vault && w3.player.cx < px(31)),
      );
      collectible(w, 'dhokla', 25, 3.4);
    },
  };
}

/** GNR-02 act: across the pol's terraces. The strings hang lower, so the run-ups get shorter, and
 *  most of the next roof is tin: plant on the last of the concrete before each gap. */
const terraces: Act = {
  id: 'gnr02-terraces',
  w: 40,
  advice: 'Over the terraces the strings hang lower: start your run-up only four or five steps back, and plant on the last bit of concrete before each gap.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 6).fill(x + 7, x + 14, 10, 14, '%').pit(x + 15, x + 16).fill(x + 17, x + 25, 5, 14, '%');
  },
  build: (w, c) => {
    const x = c.x;
    houses(w, [
      [x + 7, x + 14, 10, '#E76F51'],
      [x + 17, x + 25, 5, '#8AB17D'],
    ]);
    (w.flags.bam as Bamboo).tin.push({ x0: c.X(7), x1: c.X(12), top: px(10) });
    w.add(new Manja(c.X(3), 124, c.X(9), 124, '#AB47BC'));
    w.add(new Manja(c.X(15), 40, c.X(20) + 8, 40, '#FF7043'));
    sign(w, x + 0.4, 10.4, 4, 'MANJA', 'warn', null, 'mind the string');
    onPass(w, c.X(1), (w2) => w2.guide('Dori nichi chhe, dhire daudo! | The string is low, run less!'));
  },
};


// ================================================================== GNR-03: Adalaj Ni Vav (sunbeams)
const VAV: [string, string] = ['rgba(74,128,96,0.88)', 'rgba(24,62,46,0.97)'];
const deg = (d: number) => (d * Math.PI) / 180;

function vavRoom(): LevelDef {
  return {
    id: 'GNR-03',
    city: 'GNR',
    index: 3,
    name: 'Adalaj Ni Vav',
    nameEn: 'The Adalaj stepwell',
    tagline: 'Five storeys of carved stone going down to the water. The stairs are shut for repairs.',
    hint: 'The sunlight slanting into the stepwell is so dusty you can walk on it: hop on its low end and walk up it to the gallery. It swings as the sun moves, and when a cloud covers the sun it goes out (it flickers first): don’t be over the water then.',
    par: 8,
    scene: { kind: 'rock', place: 'Adalaj', sky: ['#E9B872', '#F3D29C', '#FBE6C2'], with: ['stepwell'] },
    map: Grid.ground(15).pit(10, 21).fill(12, 24, 9, 9, '%').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.add(new Sandstone());
      pool(w, 10, 22, 15.45, { colors: VAV, cause: 'splash' });
      w.flags.beams = [w.add(new Sunbeam(px(12), px(9), 150, -1, { a0: deg(25), a1: deg(55), period: 9, cloud: { every: 5, dur: 1.3, phase: 2 }, window: 'jharokha' }))];
      sign(w, 4.4, 10.4, 4.4, 'ADALAJ NI VAV', 'wood', null, '1499');
      sign(w, 26, 10.4, 3.6, 'BANDH', 'warn', null, 'stairs closed');
      prop(w, 'pigeons', 18, 9);
      rival(w, 5, 15, 1, { intro: LINES.GNR.intro[1], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[0] });
      w.after(2.6, () => w.guide('Prakash par chalo, Dad! | Walk on the light, Dad!'));
      collectible(w, 'dhokla', 19, 7.4);
    },
  };
}

/** GNR-03 act: up the well shaft, storey by storey, on three beams that swing out of step and lose
 *  the sun at different times. Board each one while its low end reaches you. */
const shaft: Act = {
  id: 'gnr03-shaft',
  w: 44,
  advice: 'Up the well shaft on three beams, storey by storey: each one reaches down to you only part of the time, and each loses the sun at its own moment. Board just after its cloud has passed.',
  cps: [9.5, 17.5, 25],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 27).fill(x + 8, x + 11, 11, 11, '%').fill(x + 16, x + 20, 7, 7, '%').fill(x + 24, x + 34, 3, 3, '%');
    g.fill(x + 35, x + 36, 6, 14, '%').fill(x + 37, x + 38, 9, 14, '%').fill(x + 39, x + 40, 12, 14, '%');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 28, 15.45, { colors: VAV, cause: 'splash' });
    w.flags.shaft = [
      w.add(new Sunbeam(X(8), px(11), 110, -1, { a0: deg(20), a1: deg(48), period: 7, cloud: { every: 4.6, dur: 1.1, phase: 1 }, window: 'jharokha' })),
      w.add(new Sunbeam(X(16), px(7), 100, -1, { a0: deg(22), a1: deg(58), period: 6.2, phase: 3.1, cloud: { every: 5.3, dur: 1.2, phase: 3.4 }, window: 'jharokha' })),
      w.add(new Sunbeam(X(24), px(3), 100, -1, { a0: deg(24), a1: deg(56), period: 5.6, phase: 1.4, cloud: { every: 4.2, dur: 1, phase: 0.6 }, window: 'jharokha' })),
    ];
    prop(w, 'pigeons', c.x + 30, 3);
    onPass(w, X(1), (w2) => w2.guide('Vaadal aave to prakash jaay! | When a cloud comes, the light goes!'));
  },
};

// ================================================================== GNR-04: Indroda (the dinosaur)
/** a wooden viewing walkway on stilts over hidden tiles: planks, a railing, stilts to the ground */
function walkway(w: World, c0: number, c1: number, row: number) {
  const x0 = px(c0),
    x1 = px(c1 + 1),
    y = px(row);
  w.add(
    new Paint((ctx) => {
      ctx.fillStyle = '#6D4C2F';
      for (let x = x0 + 4; x < x1; x += 28) ctx.fillRect(x, y + 16, 4, px(G) - y - 16);
      ctx.fillStyle = '#A1764A';
      ctx.fillRect(x0, y, x1 - x0, 16);
      ctx.fillStyle = '#7B5532';
      for (let x = x0; x < x1; x += 8) ctx.fillRect(x, y + 2, 1, 12);
      ctx.fillRect(x0, y + 13, x1 - x0, 3);
      ctx.fillStyle = 'rgba(255,235,200,0.45)';
      ctx.fillRect(x0, y, x1 - x0, 1);
      // the railing along the back
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x0, y - 12, x1 - x0, 2);
      for (let x = x0 + 2; x < x1; x += 14) ctx.fillRect(x, y - 12, 2, 12);
    }, -2),
  );
}

function dinoRoom(): LevelDef {
  return {
    id: 'GNR-04',
    city: 'GNR',
    index: 4,
    name: 'Indroda',
    nameEn: 'The dinosaur park',
    tagline: 'Gujarat’s own Rajasaurus, life size. It’s only a statue. Probably.',
    hint: 'Every few seconds the dinosaur stomps and a shockwave runs along the ground both ways. Anyone standing on the ground when it passes is thrown high into the air: under the thorn trees, jump as it reaches you; by the walkway, stand and let it throw you up on to it.',
    par: 8,
    scene: { kind: 'hills', place: 'Indroda Park', with: ['dinos'] },
    map: Grid.ground(15).fill(12, 24, 9, 9, '%').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      walkway(w, 12, 24, 9);
      w.flags.dino = w.add(new Dino(px(18), px(G), { period: 2.6, phase: 1.2, reach: 300, x0: px(2) + 4, x1: px(32), face: -1 }));
      w.add(new Thorns(px(3), px(8), px(9) + 4, px(2) + 8, px(G)));
      sign(w, 25.5, 10.4, 4.6, 'INDRODA PARK', 'green', null, 'dinosaur & fossil park');
      rival(w, 4, 15, 1, { intro: LINES.GNR.intro[2], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[0] });
      onPass(w, px(9), (w2) => w2.guide('Ahiya ubha raho, Dad! | Stand right here, Dad!'));
      collectible(w, 'dhokla', 28, 7.4);
    },
  };
}

/** GNR-04 act: the hatchery. Two dinosaurs, out of step, their waves crossing under the thorns
 *  between them: hop each one from either side, then get thrown up over the second. */
const hatchery: Act = {
  id: 'gnr04-hatchery',
  w: 44,
  advice: 'In the hatchery two dinosaurs stomp out of step: between them under the thorns the waves come from both sides, so hop each one as it reaches you. Get thrown up on to each walkway from the clear ground just before it.',
  cps: [18.5, 35.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 11, x + 17, 9, 9, '%').fill(x + 28, x + 34, 9, 9, '%');
  },
  build: (w, c) => {
    const { X } = c;
    walkway(w, c.x + 11, c.x + 17, 9);
    walkway(w, c.x + 28, c.x + 34, 9);
    w.add(new Thorns(X(3), X(8), px(9) + 4, X(2), px(G)));
    w.add(new Thorns(X(23), X(26), px(9) + 4, X(26) + 2, px(G)));
    w.flags.dinos = [
      w.add(new Dino(X(13) + 8, px(G), { period: 2.4, phase: 0.3, reach: 420, x0: X(2) + 4, x1: X(27), face: -1 })),
      w.add(new Dino(X(31) + 8, px(G), { period: 2, phase: 1, speed: 240, reach: 420, x0: X(18), x1: X(43), face: -1, scale: 0.85 })),
    ];
    sign(w, c.x + 0.4, 10.4, 4.2, 'HATCHERY', 'green', null, 'Balasinor eggs');
    onPass(w, X(18), (w2) => w2.guide('Banne baju thi aave chhe! | They come from both sides!'));
  },
};

// ================================================================== GNR-05: Sasan Gir (the lions)
/** a rocky outcrop over hidden tiles: grey-brown boulders */
function outcrop(w: World, c0: number, c1: number, row: number) {
  w.add(
    new Paint((ctx) => {
      const x0 = px(c0),
        x1 = px(c1 + 1),
        y = px(row);
      ctx.fillStyle = '#8A7560';
      ctx.beginPath();
      ctx.moveTo(x0 - 2, px(G));
      ctx.lineTo(x0 + 2, y + 2);
      ctx.quadraticCurveTo((x0 + x1) / 2, y - 3, x1 - 2, y + 2);
      ctx.lineTo(x1 + 2, px(G));
      ctx.fill();
      ctx.fillStyle = '#A28D74';
      ctx.fillRect(x0 + 2, y, x1 - x0 - 4, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (let x = x0 + 6; x < x1 - 4; x += 13) ctx.fillRect(x, y + 8, 6, 2);
    }, -2),
  );
}

function girRoom(): LevelDef {
  return {
    id: 'GNR-05',
    city: 'GNR',
    index: 5,
    name: 'Sasan Gir',
    nameEn: 'The lions’ forest',
    tagline: 'The last wild Asiatic lions in the world. Never turn your back on one.',
    hint: 'A lion only stalks you while your back is turned: look at it (press towards it) and it sits down and yawns, and backs off if it’s close. Jump over a sleeping one and it wakes up behind you. Lions can’t climb the rocks, and they won’t come through a shut gate.',
    par: 10,
    scene: { kind: 'hills', place: 'Sasan Gir', sky: ['#E8B66A', '#F2D399', '#F8E8C4'], with: ['gir'] },
    map: Grid.ground(15).fill(27, 31, 13, 14, '%').put(2, 14, '@').put(30, 12, 'E').rows(),
    build(w: World) {
      door(w);
      outcrop(w, 27, 31, 13);
      w.flags.lions = [w.add(new Lion(px(8) + 8, px(G), { asleep: true, x0: px(1), x1: px(30) }))];
      w.flags.naka = w.add(new Naka(px(16), px(G), { every: 4.6, dur: 1.6, phase: 2.2 }));
      sign(w, 3.6, 10.4, 4.2, 'SASAN GIR', 'green', null, 'lion sanctuary');
      rival(w, 4, 15, 1, { intro: LINES.GNR.intro[3], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[1] });
      onPass(w, px(10), (w2) => w2.guide('Pachhal jo, Dad! | Look behind you, Dad!'));
      collectible(w, 'dhokla', 29.5, 11.2);
    },
  };
}

/** GNR-05 act: the pride. A sleeping lion to hop, a gate to wait at, and a lioness ahead: while you
 *  watch her, the one behind you stalks you, and the other way round. */
const pride: Act = {
  id: 'gnr05-pride',
  w: 44,
  advice: 'In the pride, a lioness waits ahead past the gate: while you look at her the lion behind you stalks you, and while you look back she comes for you. Glance back, then go at her: she backs off, and you jump over her. Up on the rocks you’re safe.',
  cps: [35.5],
  paint: (g, c) => void g.fill(c.x + 33, c.x + 37, 13, 14, '%'),
  build: (w, c) => {
    const { X } = c;
    outcrop(w, c.x + 33, c.x + 37, 13);
    w.flags.pride = [
      w.add(new Lion(X(6) + 8, px(G), { asleep: true, x0: X(1), x1: X(33) })),
      w.add(new Lion(X(23) + 8, px(G), { maned: false, x0: X(18), x1: X(33), speed: 100 })),
    ];
    w.flags.naka2 = w.add(new Naka(X(13), px(G), { every: 4.2, dur: 1.4, phase: 0.9 }));
    onPass(w, X(15), (w2) => w2.guide('Simhan aagal pan chhe! | There’s a lioness ahead too!'));
  },
};

// ================================================================== GNR-06: Mor (peacock feathers)
const LOTUS: [string, string] = ['rgba(90,150,140,0.88)', 'rgba(30,80,78,0.96)'];

/** a feather lying in the grass at tile column tx (on the floor whose top is row `ty`), optionally with
 *  a peacock beside it that leaves a new one whenever the thunder rolls */
function feather(w: World, bag: Feathers, tx: number, ty = G, peacock?: { at: number; period: number; phase: number; face?: 1 | -1 }) {
  const f = w.add(new FeatherPickup(px(tx) + 8, px(ty), bag));
  if (peacock) w.add(new Peacock(px(peacock.at) + 8, px(ty), f, { period: peacock.period, phase: peacock.phase, face: peacock.face }));
  return f;
}

/** monsoon rain drawn over a stretch */
function rain(w: World, x0: number, x1: number) {
  w.add(
    new Paint((ctx, w2) => {
      const t = w2.tick / 120;
      ctx.strokeStyle = 'rgba(210,225,255,0.35)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let i = 0; i < 70; i++) {
        const x = x0 + ((i * 97.3 + t * 40) % (x1 - x0));
        const y = (i * 53.7 + t * 340) % 260;
        ctx.moveTo(x, y);
        ctx.lineTo(x - 2, y + 7);
      }
      ctx.stroke();
    }, 6),
  );
}

function morRoom(): LevelDef {
  return {
    id: 'GNR-06',
    city: 'GNR',
    index: 6,
    name: 'Mor',
    nameEn: 'The peacocks',
    tagline: 'Gandhinagar has more peacocks than people on its lawns. When thunder rolls, they dance.',
    hint: 'Pick up a peacock feather and tuck it in your hair: press jump again in the air and it flaps you up once more (then it’s gone). You can carry three. When thunder rolls, each peacock dances and leaves a new feather at its feet.',
    par: 8,
    map: Grid.ground(15).pit(9, 15).fill(20, 24, 10, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const bag = w.add(new Feathers());
      w.flags.bag = bag;
      pool(w, 9, 16, 15.45, { colors: LOTUS, cause: 'splash' });
      w.flags.spots = [feather(w, bag, 5, G, { at: 3, period: 5, phase: 2.5 }), feather(w, bag, 17, G, { at: 18.6, period: 5, phase: 0.4, face: -1 })];
      sign(w, 4.2, 10.4, 4.6, 'SARITA UDYAN', 'green', null, 'Sector 9');
      prop(w, 'flowers', 26, 15);
      rival(w, 2, 15, 1, { intro: LINES.GNR.intro[4], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[0] });
      w.when(
        (w2) => (w2.flags.feathers ?? 0) > 0,
        (w2) => w2.guide('Hava ma pachhu kudo, pichhu udaadse! | Jump again in the air, the feather flaps you up!'),
      );
      collectible(w, 'dhokla', 22, 7.2);
    },
  };
}

/** GNR-06 act: the Sabarmati riverfront in the monsoon. One river takes a feather to cross, the next
 *  takes two: pick up both before you go, and if you waste one, wait for the thunder. */
const sabarmati: Act = {
  id: 'gnr06-sabarmati',
  w: 44,
  advice: 'On the riverfront in the rain: the first stretch of river takes one flap, the wide one takes two, so carry two feathers over it. Wasted one? Wait for the thunder: the peacocks leave new ones.',
  cps: [11.5, 25],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 10).pit(x + 14, x + 23).fill(x + 30, x + 34, 9, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const bag = w.flags.bag as Feathers;
    pool(w, x + 4, x + 11, 15.45, { colors: RIVER_MONSOON, cause: 'splash' });
    pool(w, x + 14, x + 24, 15.45, { colors: RIVER_MONSOON, cause: 'splash' });
    w.flags.riverSpots = [
      feather(w, bag, x + 2, G, { at: x + 0.6, period: 4.6, phase: 1.2 }),
      feather(w, bag, x + 11, G),
      feather(w, bag, x + 12.5, G, { at: x + 13.4, period: 4.6, phase: 3.5, face: -1 }),
      feather(w, bag, x + 25, G, { at: x + 26.4, period: 4.2, phase: 0.8, face: -1 }),
    ];
    rain(w, c.X(-2), c.X(46));
    sign(w, x + 0.3, 10.4, 4.6, 'RIVERFRONT', 'green', null, 'Sabarmati');
    onPass(w, c.X(11), (w2) => w2.guide('Be pichha lo, nadi paholi chhe! | Take two feathers, the river is wide!'));
  },
};
const RIVER_MONSOON: [string, string] = ['rgba(120,110,80,0.9)', 'rgba(70,60,40,0.97)'];

// ================================================================== GNR-07: Garba Raas (the rings)
/** a garba: rings of dancers round a garbo lamp centred on world x `cx` (the near half drawn over Dad) */
export function garba(w: World, cx: number, rings: Ring[], o: { garbo?: boolean } = {}) {
  const g = w.add(new GarbaRing(cx, px(G), rings, o));
  w.add(g.front);
  return g;
}

function garbaRoom(): LevelDef {
  return {
    id: 'GNR-07',
    city: 'GNR',
    index: 7,
    name: 'Garba Raas',
    nameEn: 'The garba dance',
    tagline: 'Navratri: nine nights of dancing in circles round the lamp, and you have to get across.',
    hint: 'Each ring of dancers is a circle on the ground: the dancers only cross your path at the two ends of each ring; everywhere else they pass in front of you or behind you. Wait just short of an end for a gap, then walk through.',
    par: 9,
    scene: { kind: 'night', place: 'Navratri ground', sky: ['#1A1033', '#3A1A45', '#6A2A4A'], with: ['garba'] },
    map: Grid.ground(15).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.rings = [
        garba(w, px(16) + 8, [
          { r: 88, n: 6, w: 0.75 },
          { r: 44, n: 4, w: -1.05, phase: 0.6 },
        ]),
      ];
      sign(w, 3.6, 10.4, 4.6, 'NAVRATRI', 'shop', null, 'garba raas');
      rival(w, 4, 15, 1, { intro: LINES.GNR.intro[5], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[1] });
      onPass(w, px(8), (w2) => w2.guide('Chheda par j bhatkay chhe! | They only bump into you at the ends!'));
      collectible(w, 'dhokla', 16.5, 10.2);
    },
  };
}

/** GNR-07 act: a sheri garba in the lane. Two rings touch, so their ends meet in one spot: you need a
 *  gap in both at once. Then a ring with another turning the other way inside it. */
const sheri: Act = {
  id: 'gnr07-sheri',
  w: 44,
  advice: 'In the lane two rings touch, and where they meet you need a gap in both at the same moment. Then a big ring with a small one inside, turning the other way.',
  cps: [22.5],
  build: (w, c) => {
    w.flags.sheri = [
      garba(w, c.X(9) + 8, [{ r: 64, n: 5, w: 0.8 }]),
      garba(w, c.X(17) + 8, [{ r: 64, n: 5, w: -0.9, phase: 0.4 }], { garbo: false }),
      garba(w, c.X(32) + 8, [
        { r: 72, n: 6, w: 0.85, phase: 1.1 },
        { r: 32, n: 3, w: -1.3 },
      ]),
    ];
    sign(w, c.x + 0.3, 10.4, 4.4, 'SHERI GARBA', 'shop', null, 'pol chowk');
    onPass(w, c.X(4), (w2) => w2.guide('Banne gol ek j jagya e male chhe! | Both rings meet in one spot!'));
  },
};

// ================================================================== GNR-08: GIFT City (the market)
/** the market's prices for a chart: a seeded walk with a trading halt (two holes) every so often */
function market(seed: number, n: number, halts: number) {
  const walk = prices(seed, n, 8, 92, 12, 20);
  const out: number[] = [];
  // a halt (two holes) every so often; the price picks up after it where it left off
  walk.forEach((v, i) => {
    if (i > 0 && i % halts === 0) out.push(0, 0);
    out.push(v);
  });
  return out;
}

/** glass towers drawn over a block of hidden tiles */
function tower(w: World, c0: number, c1: number, row: number, tint = '#5C8DB8') {
  w.add(
    new Paint((ctx) => {
      const x0 = px(c0),
        x1 = px(c1 + 1),
        y = px(row);
      ctx.fillStyle = tint;
      ctx.fillRect(x0, y, x1 - x0, px(G) - y);
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      for (let x = x0 + 3; x < x1 - 2; x += 7) ctx.fillRect(x, y + 4, 4, px(G) - y - 8);
      ctx.fillStyle = 'rgba(20,40,70,0.35)';
      for (let yy = y + 10; yy < px(G); yy += 10) ctx.fillRect(x0, yy, x1 - x0, 1);
      ctx.fillStyle = '#CFD8DC';
      ctx.fillRect(x0 - 1, y, x1 - x0 + 2, 3);
    }, -2),
  );
}

function giftRoom(): LevelDef {
  return {
    id: 'GNR-08',
    city: 'GNR',
    index: 8,
    name: 'GIFT City',
    nameEn: 'The finance city',
    tagline: 'India’s first smart city, by the Sabarmati. Its trading screens never sleep.',
    hint: 'The floor is a live chart scrolling left: every candle is a step to stand on, small ones you walk up, big ones you jump. The chart carries you back, so keep moving: the candle under you scrolls off the screen in the end. A trading halt is a hole.',
    par: 8,
    map: Grid.ground(15).pit(4, 27).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.chart = w.add(new Ticker(px(4), px(28), px(G), market(7, 160, 11)));
      sign(w, 0.4, 10.4, 3.6, 'IFSC', 'metro', null, 'GIFT City');
      sign(w, 28.4, 10.4, 3.6, 'EXIT', 'metro', null, 'to the towers');
      rival(w, 2, 15, 1, { intro: LINES.GNR.intro[6], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.GNR.beaten[1] });
      w.after(2.2, () => w.guide('Laal ma vecho, leela ma lo! | Sell on red, buy on green!'));
      collectible(w, 'dhokla', 16, 6.4);
    },
  };
}

/** GNR-08 act: from the riverfront up into the towers, everything Gujarat taught you: a bamboo
 *  vault under a kite string, a sunbeam off the glass, and a garba ring at the riverfront. */
const towers: Act = {
  id: 'gnr08-towers',
  w: 48,
  advice: 'Then all of Gujarat at once: grab the bamboo and vault on to the podium under the kite string, walk up the sunlight off the glass to the sky garden, and cross the riverfront garba.',
  cps: [12, 28],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 8, x + 14, 10, 14, '%').fill(x + 20, x + 26, 5, 14, '%');
  },
  build: (w, c) => {
    const { X } = c;
    tower(w, c.x + 8, c.x + 14, 10, '#6A9BC3');
    tower(w, c.x + 20, c.x + 26, 5, '#4F7FA8');
    w.flags.towerPole = w.add(new Bamboo(X(1) + 8, px(G)));
    w.add(new Manja(X(5), 124, X(10), 124, '#EC407A'));
    w.flags.glass = w.add(new Sunbeam(X(20), px(5), 110, -1, { a0: deg(28), a1: deg(56), period: 6.4, phase: 0.4, cloud: { every: 5.2, dur: 1, phase: 2.6 } }));
    w.flags.riverGarba = garba(w, X(37) + 8, [{ r: 64, n: 5, w: 0.85, phase: 0.7 }]);
    sign(w, c.x + 1.6, 10.4, 4.6, 'GIFT ONE', 'metro', null, 'IFSC towers');
    onPass(w, X(2), (w2) => w2.guide('Vaans, prakash, garba: badhu yaad chhe ne? | Bamboo, light, garba: you remember?'));
  },
};

export const GNR: LevelDef[] = [
  tour({
    id: 'GNR-01',
    city: 'GNR',
    name: 'Kem Cho Gandhinagar',
    nameEn: 'Hello Gandhinagar',
    tagline: 'Thirty numbered sectors, roads named after letters, and peacocks everywhere.',
    lines: [
      'Kem cho, Dad! Gandhinagar ma aavo! | Hi Dad! Welcome to Gandhinagar!',
      'Aa shaher na trees sector chhe, badha numbered! | This city has thirty sectors, all numbered!',
      'Rasta na naam Gujarati akshar: K, Kh, G, Gh! | The roads are named after letters: K, Kh, G, Gh!',
      'Ahiya mor ghana chhe, jo pela! | Lots of peacocks here, look at that one!',
      'Uttarayan ma aakhu aakash patang thi bharay! | At Uttarayan the whole sky fills with kites!',
      'Chalo Dad, have saacho khel! | Come on Dad, now the real game!',
    ],
    shouts: [
      [21, 'Garam fafda-jalebi! | Hot fafda and jalebi!'],
      [84, 'BRTS aavi! Jaldi! | The BRTS is here! Quick!'],
    ],
    ride: 'cart',
    item: 'dhokla',
    signs: [
      [8, 'G-4 CIRCLE', 'Sector 21'],
      [55, 'SABARMATI', 'riverfront'],
      [102, 'GIFT CITY', 'towers'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'FAFDA' }],
      ['crowd', 33, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: vaultRoom(),
    par: 30,
    acts: [terraces],
    twist: 'setu',
  }),
  longStage({
    base: vavRoom(),
    par: 34,
    acts: [shaft],
    twist: 'jali',
  }),
  longStage({
    base: dinoRoom(),
    par: 30,
    acts: [hatchery],
    twist: 'milan',
  }),
  longStage({
    base: girRoom(),
    par: 34,
    acts: [pride],
    twist: 'safari',
  }),
  longStage({
    base: morRoom(),
    par: 30,
    acts: [sabarmati],
    twist: 'kichad',
  }),
  longStage({
    base: garbaRoom(),
    par: 30,
    acts: [sheri],
    twist: 'pravesh',
  }),
  longStage({
    base: giftRoom(),
    par: 36,
    acts: [towers],
    twist: 'herd',
  }),
];
