// Ranchi: the haat, Hundru's gorge, bamboo traps, Sarhul's pot, Dokra's furnace and Chhau's masks.
// Each stage's room teaches one idea; the act breaks the habit it taught; the door has its own last word.
import { type LevelDef, type World } from '../world';
import { LINES } from '../cities';
import { collectible, door, group, px, rival, sign } from './kit';
import type { Act } from './acts';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { Cast, Chute, Crucible, Dancer, FallCurtain, Hands, MaskPickup, MaskPole, Plate, Plunge, PotHands, Spout, Stall, setPot } from '../entities/jharkhand';

const TAUNTS = LINES.RNC.taunt;
const G = 15;
const tara = (n: number, beaten = 0) => ({ intro: LINES.RNC.intro[n], point: 1 as const, introAt: 0.5, taunts: TAUNTS, beaten: LINES.RNC.beaten[beaten] });

// ------------------------------------------------------------------ shared pieces
/** a woven trap mouth on the ground at columns c..c+w */
const mouth = (c: number, w: number, groundTop = 240) => ({ x: px(c), y: groundTop - 14, w: px(w), h: 14 });
/** a cast channel across the pit c0..c1 (the floor tiles must be cleared by the map) */
function cast(w: World, c0: number, c1: number) {
  return w.add(new Cast(px(c0), px(c1), 240));
}
/** a crucible tipped from the ground at columns c..c+w, pouring over `over` */
function crucible(w: World, c: number, wTiles: number, ch: Cast, over: number) {
  return w.add(new Crucible({ x: px(c), y: 226, w: px(wTiles), h: 14 }, ch, px(over)));
}
/** a dancer's blow breaks the wall group whose solid overlaps its sweep */
function wallBreaker(wall: { solid: { x: number; y: number; w: number; h: number }; fall: (w: World) => void }, w: World, from: number, to: number) {
  if (wall.solid.x + wall.solid.w > from && wall.solid.x < to) wall.fall(w);
}
/** the whole mask dance: a rack, a pole, a dancer and the wall his blow brings down */
function dance(w: World, o: { rack: number; pole: number; dancer: number; face: 1 | -1; reach: number; wall?: { solid: { x: number; y: number; w: number; h: number }; fall: (w: World) => void }; oneShot?: boolean }) {
  w.add(new MaskPickup(px(o.rack) + 2, 228));
  w.add(new MaskPole(px(o.pole), 240));
  return w.add(
    new Dancer(px(o.dancer) + 8, 240, o.face, o.reach, (w2, from, to) => {
      if (o.wall) wallBreaker(o.wall, w2, from, to);
    }, o.oneShot ?? true),
  );
}

/** the pot is carried by one pair of hands, however many sections a stage has */
function potHands(w: World) {
  if (!w.flags.potHands) w.flags.potHands = w.add(new PotHands());
  return w.flags.potHands as PotHands;
}

// ================================================================== RNC-02: Haat (the market's trade)
function haatRoom(): LevelDef {
  return {
    id: 'RNC-02',
    city: 'RNC',
    index: 2,
    name: 'Haat',
    nameEn: 'The weekly market',
    tagline: 'One day a week the lanes fill with stalls, and everything is a swap.',
    hint: 'A haat runs on trade. Walk into a stall carrying the thing its sign asks for and it lays down what it gives: a plank over the gap. You can carry one thing at a time, so the food and the leaf plate are two separate trips.',
    par: 13,
    map: Grid.ground(15).pit(12, 16).pit(23, 26).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.add(new Hands());
      w.add(new Plate('dhuska', px(6) + 2, 228));
      w.add(new Stall('dhuska', px(9) + 8, 240, px(12), px(5), 'PAAT'));
      w.add(new Plate('dona', px(17.5) + 2, 228));
      w.add(new Stall('dona', px(20) + 8, 240, px(23), px(4), 'PAAT'));
      sign(w, 0.3, 10.4, 3, 'HAAT', 'shop', null, 'mangal bazaar');
      rival(w, 3, 15, 1, tara(0));
      collectible(w, 'dhuska', 13.5, 8.6);
    },
  };
}

/** RNC-02 act: the lane. Two things on the ground, four stalls, and one trip you have to make twice. */
const haatAct: Act = {
  id: 'rnc02-haat',
  w: 48,
  advice: 'The stalls are choosy: the one before each gap wants the thing its sign names. Take the dhuska at the start, then the dona, then the second dhuska. When the last stall wants a dona you have already walked past, go back for it: the planks stay where they were laid.',
  cps: [22.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 7, x + 10).pit(x + 16, x + 19).pit(x + 26, x + 29).pit(x + 34, x + 37);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Hands());
    w.add(new Plate('dhuska', px(x + 2) + 2, 228));
    w.add(new Stall('dhuska', px(x + 5) + 8, 240, px(x + 7), px(4), 'PAAT'));
    w.add(new Plate('dona', px(x + 12) + 2, 228));
    w.add(new Stall('dona', px(x + 14) + 8, 240, px(x + 16), px(4), 'PAAT'));
    w.add(new Plate('dhuska', px(x + 21) + 2, 228));
    w.add(new Plate('dona', px(x + 22.5) + 2, 228));
    w.add(new Stall('dhuska', px(x + 24) + 8, 240, px(x + 26), px(4), 'PAAT'));
    w.add(new Stall('dona', px(x + 31) + 8, 240, px(x + 34), px(4), 'PAAT'));
    sign(w, x + 12, 10.4, 3, 'MANDI', 'shop', null, 'dhuska-dona');
  },
};

// ================================================================== RNC-03: Hundru (the plunge)
function hundruRoom(): LevelDef {
  return {
    id: 'RNC-03',
    city: 'RNC',
    index: 3,
    name: 'Hundru',
    nameEn: 'The falls',
    tagline: 'The Subarnarekha drops ninety-eight metres into its own pool, and the pool comes and goes with it.',
    hint: 'Down here the water is the only soft landing: the bare rock in the basin is shards. The pool drains when the falls thin and fills when they swell, so wait on the ledge, watch the fall, and step off into the water while it is full. Then climb out the far side.',
    par: 14,
    map: (() => {
      const g = Grid.ground(15);
      g.fill(0, 8, 5, 14, '#');
      g.fill(9, 21, 15, 16, '.');
      return g.put(1, 4, '@').put(30, 14, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      w.flags.pool = w.add(new Plunge(px(9), px(22), px(17), 5, 0.55, 0));
      w.add(new FallCurtain(px(13), 0, px(17), 30, 1));
      sign(w, 1.2, 3.4, 4, 'HUNDRU', 'green', null, '98 metre');
      rival(w, 4, 5, 1, tara(1, 1));
      collectible(w, 'dhuska', 18.5, 8.4);
    },
  };
}

/** RNC-03 act: three bays in one gorge. The last one has no water at all. */
const gorgeAct: Act = {
  id: 'rnc03-jharana',
  w: 50,
  advice: 'Three bays. The first two are the pool again: wait on the edge for the fall to swell, then step off into the water. The third has stopped running altogether, and the shards at the bottom are bare, so land on the flat shelf over them and not below it.',
  cps: [18.5, 31.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 8, x + 12, 15, 16, '.');
    g.fill(x + 21, x + 25, 15, 16, '.');
    g.fill(x + 34, x + 41, 15, 16, '.');
    g.fill(x + 35, x + 38, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.flags.poolA = w.add(new Plunge(px(x + 8), px(x + 13), px(17), 4.4, 0.58, 0));
    w.flags.poolB = w.add(new Plunge(px(x + 21), px(x + 26), px(17), 3.6, 0.55, 0.35));
    w.flags.poolC = w.add(new Plunge(px(x + 34), px(x + 42), px(17), 1, 0, 0, 0));
    w.add(new FallCurtain(px(x + 9), 0, px(17), 18, 1));
    w.add(new FallCurtain(px(x + 22), 0, px(17), 14, 1));
    sign(w, x + 3, 10.4, 3, 'GHAGH', 'green', null, 'teen kund');
  },
};

// ================================================================== RNC-04: Baans (the bamboo traps)
function baansRoom(): LevelDef {
  return {
    id: 'RNC-04',
    city: 'RNC',
    index: 4,
    name: 'Baans',
    nameEn: 'The bamboo traps',
    tagline: 'The weavers make fish traps with one way in and one way out, and the mouth is not the end you think.',
    hint: 'Woven traps lie in the dry stream bed. Walk into a wide mouth and it carries you out of the narrow end, always one way. The short trap near you points back down the lane; the long one beyond it crosses the gap. Hop over the mouth you do not want: only walking in sends you.',
    par: 12,
    map: Grid.ground(15).pit(14, 21).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.chuteTrap = w.add(new Chute(mouth(6, 1), { x: px(1.5), y: 240 }));
      w.flags.chute = w.add(new Chute(mouth(11, 3), { x: px(23), y: 240 }));
      sign(w, 0.4, 10.4, 3, 'BAANS', 'green', null, 'machhli jaal');
      rival(w, 3, 15, 1, tara(2));
      collectible(w, 'dhuska', 17.5, 8.4);
    },
  };
}

/** RNC-04 act: two more mouths, and the first one is a trap. */
const baansAct: Act = {
  id: 'rnc04-baans',
  w: 48,
  advice: 'A trap that points back at you, then two that cross their gaps. Read which end the mouth is at before you walk in, and hop over the backward one.',
  cps: [23.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 6, x + 10).pit(x + 19, x + 24).pit(x + 35, x + 40);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Chute(mouth(x + 2, 2), { x: px(x + 12), y: 240 }));
    w.add(new Chute(mouth(x + 15, 1), { x: px(x + 1.5), y: 240 }));
    w.add(new Chute(mouth(x + 17, 2), { x: px(x + 26), y: 240 }));
    w.add(new Chute(mouth(x + 30, 1), { x: px(x + 1.5), y: 240 }));
    w.add(new Chute(mouth(x + 33, 2), { x: px(x + 42), y: 240 }));
    sign(w, x + 9, 10.4, 3, 'JAAL', 'green', null, 'khokha');
  },
};

// ================================================================== RNC-05: Sarhul (the pot)
function sarhulRoom(): LevelDef {
  return {
    id: 'RNC-05',
    city: 'RNC',
    index: 5,
    name: 'Sarhul',
    nameEn: 'The sal blossom festival',
    tagline: 'The Pahan leaves pots of water at the sal tree overnight, and reads the morning level for the rains.',
    hint: 'You carry the Pahan’s pot. Every jump spills a little and every hard landing spills more, so fill at a spout, jump, then fill again at the next. The pot has to be almost full when he reads it at the door.',
    par: 14,
    map: Grid.ground(15).pit(12, 14).pit(21, 22).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      setPot(w, 0.35);
      potHands(w);
      for (const c of [5, 18, 26]) w.add(new Spout(px(c), 240, 1));
      sign(w, 0.3, 10.4, 3.4, 'SARHUL', 'green', null, 'sal phool');
      rival(w, 3, 15, 1, tara(3, 1));
      collectible(w, 'dhuska', 16.5, 8.4);
    },
  };
}

/** RNC-05 act: the fields. More gaps than spouts, and one stretch with two jumps in it. */
const phoolAct: Act = {
  id: 'rnc05-phool',
  w: 50,
  advice: 'Five spouts and four gaps, and between the last two spouts you have to jump twice. Start each stretch full; if you land with the pot low, refill before the next gap rather than after.',
  cps: [27.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 8, x + 9).pit(x + 17, x + 19).pit(x + 29, x + 30).pit(x + 38, x + 39);
  },
  build: (w, c) => {
    const x = c.x;
    potHands(w);
    for (const t of [3, 13, 24, 34, 43]) w.add(new Spout(px(x + t), 240, 1));
    sign(w, x + 18, 10.4, 3, 'KHET', 'green', null, 'dhan');
  },
};

// ================================================================== RNC-06: Dokra (the casting)
function dokraRoom(): LevelDef {
  return {
    id: 'RNC-06',
    city: 'RNC',
    index: 6,
    name: 'Dokra',
    nameEn: 'The lost-wax casting',
    tagline: 'Pundi’s brass comes out of a clay mould the smith breaks open, and the metal runs where the channel takes it.',
    hint: 'The gap has no floor and the only way to make one is to pour it. Stand on the far end of the beam and the crucible tips: the brass runs into the channel across the gap, glows, and sets. Do not step on it while it glows. When it goes dull it is a floor.',
    par: 14,
    map: Grid.ground(15).pit(12, 16).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const ch = cast(w, 12, 17);
      w.flags.cast = ch;
      crucible(w, 8, 2, ch, 14);
      sign(w, 0.3, 10.4, 3, 'DOKRA', 'shop', null, 'pundi');
      rival(w, 3, 15, 1, tara(4));
      collectible(w, 'dhuska', 18.5, 8.4);
    },
  };
}

/** RNC-06 act: the yard. A long channel, then one you must tip from a step above it. */
const dhalaiAct: Act = {
  id: 'rnc06-dhalai',
  w: 50,
  advice: 'Three pours. Tip the beam end, then wait out the glow: fresh brass burns, dull brass carries you. The step in the middle of the yard is just a step.',
  cps: [16.5, 33.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 6, x + 9).pit(x + 19, x + 24).fill(x + 28, x + 29, 14, 17, '#').pit(x + 34, x + 37);
  },
  build: (w, c) => {
    const x = c.x;
    const a = cast(w, x + 6, x + 11);
    crucible(w, x + 3, 2, a, x + 8);
    const b = cast(w, x + 19, x + 26);
    crucible(w, x + 17, 2, b, x + 22);
    const d = cast(w, x + 34, x + 39);
    crucible(w, x + 31, 2, d, x + 36);
    sign(w, x + 14, 10.4, 3, 'BHATTI', 'shop', null, 'dhalai');
  },
};

// ================================================================== RNC-07: Chhau (the masks)
function chhauRoom(): LevelDef {
  return {
    id: 'RNC-07',
    city: 'RNC',
    index: 7,
    name: 'Chhau',
    nameEn: 'The masked dance',
    tagline: 'Seraikela’s dancers wear their faces and never speak; the drum says when the blade comes down.',
    hint: 'The dancer strikes whatever wears a face in front of him, and one blow spends a mask. Hang a mask on the pole in front of the cracked wall, stand well back, and let his blade do the breaking. Walk through while he is bowing out; bare-handed in his reach, he turns on you.',
    par: 15,
    map: (() => {
      const g = Grid.ground(15);
      g.fill(13, 14, 10, 14, 'a');
      return g.put(1, 14, '@').put(30, 14, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      const wall = group(w, 'a');
      dance(w, { rack: 5, pole: 12, dancer: 17, face: -1, reach: 112, wall });
      sign(w, 0.3, 10.4, 3, 'CHHAU', 'green', null, 'mukhauta');
      rival(w, 3, 15, 1, tara(5, 1));
      collectible(w, 'dhuska', 16.5, 8.4);
    },
  };
}

/** RNC-07 act: three courtyards, three walls, and masks enough for exactly three blows. */
const mukhautaAct: Act = {
  id: 'rnc07-mukhauta',
  w: 54,
  advice: 'Three dancers and three walls, and one mask before each. Plant it on the pole, back off out of the sweep, wait for the blow, then walk through while he bows. There is no spare mask: wasting one means walking back for the next.',
  cps: [18.5, 36.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 7, x + 8, 10, 14, c.L[0]);
    g.fill(x + 21, x + 22, 10, 14, c.L[1]);
    g.fill(x + 35, x + 36, 10, 14, c.L[2]);
  },
  build: (w, c) => {
    const x = c.x;
    dance(w, { rack: x + 2, pole: x + 6, dancer: x + 11, face: -1, reach: 112, wall: group(w, c.L[0]) });
    dance(w, { rack: x + 16, pole: x + 20, dancer: x + 25, face: -1, reach: 112, wall: group(w, c.L[1]) });
    dance(w, { rack: x + 30, pole: x + 34, dancer: x + 39, face: -1, reach: 112, wall: group(w, c.L[2]) });
    sign(w, x + 25, 10.4, 3, 'AKHADA', 'green', null, 'chhau');
  },
};

// ================================================================== RNC-08: Sarhul Mela (everything)
function melaRoom(): LevelDef {
  return {
    id: 'RNC-08',
    city: 'RNC',
    index: 8,
    name: 'Sarhul Mela',
    nameEn: 'The festival ground',
    tagline: 'The whole city on one ground: a dancer, a furnace and the way out.',
    hint: 'Everything Ranchi has taught you, in one lane: hang a mask for the dancer so his blow opens the wall, then tip the crucible and wait for the brass to dull before you cross the gap.',
    par: 18,
    map: (() => {
      const g = Grid.ground(15);
      g.fill(8, 9, 10, 14, 'a');
      g.pit(20, 23);
      return g.put(1, 14, '@').put(30, 14, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      dance(w, { rack: 2, pole: 7, dancer: 13, face: -1, reach: 112, wall: group(w, 'a') });
      const ch = cast(w, 20, 24);
      crucible(w, 16, 2, ch, 22);
      sign(w, 0.3, 10.4, 3.4, 'MELA', 'shop', null, 'sarhul');
      rival(w, 3, 15, 1, tara(6));
      collectible(w, 'dhuska', 17.5, 8.4);
    },
  };
}

/** RNC-08 act: the long walk to the gate: a plunge, a trap, a wall, a pour. */
const melaAct: Act = {
  id: 'rnc08-mela',
  w: 62,
  advice: 'The last walk. Into the pool when the fall swells, out the far side; into the trap’s wide mouth and out past the gap; a mask for the dancer at the wall; then the crucible, and the wait for the brass to dull.',
  cps: [12.5, 28.5, 46.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 6, x + 11, 15, 16, '.');
    g.pit(x + 19, x + 25);
    g.fill(x + 32, x + 33, 10, 14, c.L[0]);
    g.pit(x + 50, x + 54);
  },
  build: (w, c) => {
    const x = c.x;
    w.flags.poolMela = w.add(new Plunge(px(x + 6), px(x + 12), px(17), 4.2, 0.6, 0));
    w.add(new FallCurtain(px(x + 8), 0, px(17), 20, 1));
    w.add(new Chute(mouth(x + 16, 2), { x: px(x + 27), y: 240 }));
    dance(w, { rack: x + 29, pole: x + 31, dancer: x + 37, face: -1, reach: 112, wall: group(w, c.L[0]) });
    const ch = cast(w, x + 50, x + 55);
    crucible(w, x + 46, 2, ch, x + 52);
    sign(w, x + 40, 10.4, 3, 'MELA', 'shop', null, 'jharkhand');
  },
};

export const RNC: LevelDef[] = [
  tour({
    id: 'RNC-01',
    city: 'RNC',
    name: 'Johar, Ranchi!',
    nameEn: 'Greetings, Ranchi!',
    tagline: 'The city of waterfalls, on the plateau’s edge.',
    lines: [
      'Johar, Dad! Ranchi ma swagat he! | Greetings, Dad! Welcome to Ranchi!',
      'Ranchi la jharna ke shahar kaheth he! | They call Ranchi the city of waterfalls!',
      'Hundru se paani sau meter neeche girthe! | At Hundru the water falls nearly a hundred metres!',
      'Sarhul ma sal ke phool sab jagah! | At Sarhul, sal flowers are everywhere!',
      'Haat ma dhuska garam milthe! | At the haat you get hot dhuska!',
      'Chal Dad, asli khel! | Come on Dad, the real game!',
    ],
    shouts: [
      [21, 'Dhuska garam! | Hot dhuska!'],
      [84, 'Jharna dekh ke jao! | Go and see the falls!'],
    ],
    ride: 'cart',
    item: 'dhuska',
    signs: [
      [8, 'HUNDRU', 'jharana'],
      [55, 'KANKE', 'bandh'],
      [102, 'SARNA', 'sal phool'],
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
  longStage({ base: haatRoom(), par: 40, acts: [haatAct], twist: 'bhaav' }),
  longStage({ base: hundruRoom(), par: 44, acts: [gorgeAct], twist: 'jharana' }),
  longStage({ base: baansRoom(), par: 42, acts: [baansAct], twist: 'khokha' }),
  longStage({ base: sarhulRoom(), par: 48, acts: [phoolAct], twist: 'pahan' }),
  longStage({ base: dokraRoom(), par: 52, acts: [dhalaiAct], twist: 'dhalai' }),
  longStage({ base: chhauRoom(), par: 56, acts: [mukhautaAct], twist: 'mukhauta' }),
  longStage({ base: melaRoom(), par: 84, acts: [melaAct], twist: 'ghumav' }),
];
