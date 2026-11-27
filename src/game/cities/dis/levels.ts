// Dispur (Guwahati, Assam): the gateway to the Northeast on the widest river you will ever see. Ten stages: the
// riverfront tour with a tea boy, the moving sandbars, the tea garden, the til pitha pan, the gamosa welcome,
// Majuli's retreating bank, the husori carollers, the rhino, the Rang Ghar pavilion and the Luit itself.
import { type LevelDef, type World } from '../../world';
import { bordoisila, luitBordoisila } from './storm';
import { taat } from './loom';
import { rangTug, luitTug } from './tug';
import { husDhol, luitDhol } from './dhol';
import { lines as L } from './lines';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { lock, tara as taraSays } from '../../levels/endkit';
import type { Door } from '../../entities/basics';
import { Pan } from './pitha';
import { husori } from './husori';
import { charge } from './gorh';
import { Eave, roof, type RoofSection } from './rangghar';
import { majChar3, majGhat, majPitha, gorhKohora, luitGhat, gamChar, gamGhat, gamHusori, gorhBagori, gorhJeep, husGhat, husLane, husPaar, luitChang, luitChar, luitGamosa, luitGorh, majChang, majChang2, majChar, rangBihu, rangWide, teaBoy } from './acts2';
import { Bank, type BankDef } from './bank';
import { Cloth, Host, gam, machan, pitDanger } from './gamosa';
import { Hedge, Plucker, Sprinkler } from './pluck';
import { Carrier, Decor, River, SandField, levelPost, river, sand, type Span } from './entities';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

// ================================================================== DIS-01: Nomoskar Guwahati (the tour)
const ghat = { x0: 74, x1: 79 };
const tourLevel = () =>
  tour({
    id: 'DIS-01',
    city: 'DIS',
    name: 'Nomoskar Guwahati',
    nameEn: 'Hello, Guwahati',
    tagline: 'A walk on the Luit riverfront with the tea boy. Mind the tray.',
    lines: [
      'Adorani, Dad! Kenekua aase? | Welcome, Dad! How are you?',
      'Bohudin dekha nai! | Long time no see!',
      'Khuwar amez lowa! | Enjoy your meal!',
      'Lahe lahe kowa. | Speak slowly.',
      'Dhonyobad! | Thank you!',
      'Xubho zatra, Dad! | Good journey, Dad!',
    ],
    shouts: [
      [46, 'Iyar dam kiman? | How much is this?'],
      [66, 'Khyoma koribo. | Excuse me.'],
    ],
    ride: 'cart',
    item: 'dis-chah',
    signs: [
      [8, 'LUIT RIVERFRONT', 'the Brahmaputra'],
      [34, 'UMANANDA', '10 min by ferry'],
      [64, 'LAL CHAH', 'black tea, hot'],
      [100, 'FANCY BAZAR', 'this way'],
    ],
    props: [
      ['lamp', 4, {}],
      ['lamp', 30, {}],
      ['crowd', 44, { n: 2 }],
      ['lamp', 62, {}],
      ['lamp', 104, {}],
    ],
    things: [],
    par: 34,
    hint: 'A boy walks the promenade with a tray of hot lal chah, and the tray swings on his arm. Touch him, or hop clean over him (the tray tips and the tea spreads over where you land), and you are scalded. There is a ghat, a step down to the river, in the middle of the promenade: climb down into it and let him walk over your head. Climb out only once he is a few steps past: as he crosses the ghat he swings the tray right back behind him, over the steps. A second boy comes from Fancy Bazar once you are up on the deck: stay up there until he has set his tray down.',
    cps: [27.5, 50.5, 58.5, 75, 82.5, 99.6],
    paint: (g) => {
      g.pit(ghat.x0, ghat.x1, 15);
      g.fill(ghat.x0, ghat.x1, 17, 17, '#');
    },
    extra: (w) => {
      w.add(new Carrier(px(92), px(60), px(62), 34, [px(ghat.x0), px(ghat.x1 + 1)]));
      w.add(
        new Decor((ctx) => {
          // the ghat: stone steps down to the water
          ctx.fillStyle = '#8D7B68';
          ctx.fillRect(px(ghat.x0), px(16), px(ghat.x1 - ghat.x0 + 1), 16);
          ctx.fillStyle = 'rgba(70,110,120,0.55)';
          ctx.fillRect(px(ghat.x0), px(16) + 8, px(ghat.x1 - ghat.x0 + 1), 8);
          ctx.fillStyle = '#6A5846';
          for (let i = 0; i < 3; i++) ctx.fillRect(px(ghat.x0) + i * 6, px(15) + i * 8, 6, 8);
        }, -3),
      );
      sign(w, 71.2, 10.6, 3.4, 'GHAT', 'green', null, 'river side');
      // the second boy, from Fancy Bazar, with the evening's chah: he comes once you are up on the deck, and sets his tray
      // down at its foot. The deck is the shelter; step off before he has stopped and the tray is in your face.
      teaBoy(w, 108, 97, 100.5, [0, 0], 18);
      // Tara urges you on as the boy comes (a lie: stepping out now meets the tray)
      onPass(w, px(66), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      onPass(w, px(58), (w2) => w2.guide('Lahe lahe, Dad? | Slowly slowly, Dad?', (w3) => w3.info.deaths > 0));
    },
  });

// ================================================================== DIS-02: Char (the sandbars)
const S2 = {
  // B sinks, C comes up, then C narrows when D comes up
  room: [
    [[10, 14], null, null],
    [null, [16, 20], [16, 18]],
    [null, null, [21, 25]],
  ] as Span[][],
};

function charRoom(): LevelDef {
  return {
    id: 'DIS-02',
    city: 'DIS',
    index: 2,
    name: 'Char',
    nameEn: 'The sandbar',
    tagline: 'The Luit keeps moving its islands. The post on the bank knows where they are today.',
    hint: 'The sandbars are not where they were: every time the siren goes, the water level on the post goes up a mark, and the bars move. Stand on a bar when you hear it and wait: the next bar comes up first (a white dashed outline shows where), and only later does yours go. A bar that stays but narrows keeps its left end: don’t be on its right when it does.',
    par: 22,
    map: Grid.ground(15).pit(8, 27).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      river(w, 8, 28);
      const f = sand(w, S2.room, [px(10) - 4, px(16) - 4]);
      levelPost(w, f, 3.2, 3);
      sign(w, 4.6, 10.4, 3.4, 'CHAR', 'shop', null, 'the island moves');
      rival(w, 5, 15, 1, tara(0));
      onPass(w, px(6), (w2) => w2.guide('Lahe lahe, Dad? | Slowly slowly, Dad?', (w3) => w3.info.deaths > 0 && w3.player.cx < px(10)));
      onPass(w, px(9), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      collectible(w, 'dis-japi', 20.4, 11);
    },
  };
}

/** DIS-02 act: three marks, a hut that never moves. The big bar narrows at the second mark; the hut stays. */
const chapori: Act = {
  id: 'dis02-chapori',
  w: 40,
  advice: 'A hut on a bar in the middle of the river: the farmer’s bar never moves, whatever the post says. The big bar before it narrows when you land on it (its left end stays), so don’t wait there: go on to the hut. Stop on the hut. The last bar comes up only when you have landed on the hut.',
  cps: [18.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 35);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 2), px(x + 36)));
    const f = sand(
      w,
      [
        [[x + 3, x + 8], null, null],
        [[x + 11, x + 17], [x + 11, x + 13], null],
        [[x + 20, x + 26], [x + 20, x + 26], [x + 20, x + 26]],
        [null, null, [x + 29, x + 34]],
      ],
      [px(x + 11) - 4, px(x + 20) - 4],
      [2],
    );
    levelPost(w, f, x + 0.6, 3);
    sign(w, x + 14.5, 10.4, 3.4, 'MISING HUT', 'shop', null, 'never moves');
  },
};

/** DIS-02 act 2: the post again, two sirens, and a bar that narrows from its right end while a new one rises far ahead. */
const dhar: Act = {
  id: 'dis02-dhar',
  w: 36,
  advice: 'One more channel and its post. After each siren, wait until the dashed bar ahead has come up, then go to it at once: the bar you are on narrows (from its right end) or sinks a little later.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new River(px(x + 2), px(x + 32)));
    const f = sand(
      w,
      [
        [[x + 3, x + 8], [x + 3, x + 8], null],
        [null, [x + 11, x + 17], [x + 11, x + 13]],
        [null, null, [x + 19, x + 24]],
        [[x + 26, x + 31], [x + 26, x + 31], [x + 26, x + 31]],
      ],
      [px(x + 3) - 4, px(x + 11) - 4],
    );
    levelPost(w, f, x + 0.6, 3);
  },
};

// ================================================================== DIS-03: Duta Paat, Ekta Kuhi (the tea garden)
/** a plucker with her hedges: hedges and slabs are added, and she is added last */
export function garden(w: World, hedgeTx: number[], plucker: { x: number; from: number; endX: number; speed?: number }) {
  const hs = hedgeTx.map((tx) => {
    const h = w.add(new Hedge(tx));
    w.add(h.slab);
    return h;
  });
  const p = w.add(new Plucker(plucker.x, plucker.from, hs, plucker.endX, plucker.speed));
  (w.flags.pluckers ??= []).push(p);
  return { hs, p };
}

function teaRoom(): LevelDef {
  return {
    id: 'DIS-03',
    city: 'DIS',
    index: 3,
    name: 'Duta Paat, Ekta Kuhi',
    nameEn: 'Two leaves and a bud',
    tagline: 'A tea garden in the morning. The hedges are taller than Dad until somebody picks them.',
    hint: 'The tea hedges are too tall to jump until a plucker has picked them, and then they step down to one step. The plucker walks the path ahead of you and swings her basket all round her while she picks: stay a few steps behind her and follow. Never run up to her and never hop over her: in front of her you are trapped against the hedge.',
    par: 24,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      garden(w, [14, 22], { x: px(6), from: px(2), endX: px(31) });
      sign(w, 8.4, 10.4, 3.4, 'CHA BAGAN', 'shop', null, 'tea garden');
      rival(w, 3, 15, 1, tara(1));
      onPass(w, px(4), (w2) => w2.guide('Roba! | Stop!', (w3) => w3.info.deaths > 0 && w3.player.cx < px(9)));
      onPass(w, px(7), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      collectible(w, 'dis-paat', 18, 11.5);
    },
  };
}

/** DIS-03 act: more hedges, and a sprinkler on the path. The wet path won't let you stop. */
const bagan: Act = {
  id: 'dis03-bagan',
  w: 34,
  advice: 'A sprinkler runs over the path. While it sprays and for a little after, the path is wet and you slide: you cannot stop behind her. Wait before the pipe until it is dry again, then follow her as before.',
  cps: [3.5, 14.5, 24.5],
  build: (w, c) => {
    const x = c.x;
    garden(w, [x + 18, x + 27], { x: px(x + 5), from: px(x), endX: px(x + 33) });
    const s = w.add(new Sprinkler(px(x + 8), px(x + 16), px(x + 1), 240, 180, 700));
    (w.flags.sprinklers ??= []).push(s);
    sign(w, x + 2, 10.4, 3.4, 'SPRINKLER', 'shop', null, 'wet path');
  },
};

// ================================================================== DIS-04: Til Pitha (the pan)
/** a pan over the pit columns c0..c1 with crepes; the clock starts when Dad passes `from` (tile column) */
export function pitha(w: World, c0: number, c1: number, defs: { x: number; w: number; o: number }[], from: number, o: { period?: number; liquid?: number } = {}) {
  const p = w.add(new Pan(px(c0), px(c1 + 1), defs, px(from), o.period, o.liquid));
  p.setup(w);
  (w.flags.pans ??= []).push(p);
  return p;
}

function pithaRoom(): LevelDef {
  return {
    id: 'DIS-04',
    city: 'DIS',
    index: 4,
    name: 'Til Pitha',
    nameEn: 'The rolled crepe',
    tagline: 'Magh Bihu morning: the cook pours thin rice batter on the pan, and rolls each crepe the moment it sets.',
    hint: 'The crepes sit on a hot pan. A shiny crepe is still liquid and holds you; a matte one has set, and the cook rolls it up with you in it. Each crepe is poured, shines for a few seconds, sets, is rolled, and is poured again. Wait on a shiny one until the next is poured, hop across, and don’t be standing when yours goes matte (it dulls and blinks first).',
    par: 24,
    map: Grid.ground(15).pit(7, 25).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pitha(
        w,
        7,
        25,
        [
          { x: 8, w: 4, o: 0 },
          { x: 14, w: 4, o: 422 },
          { x: 20, w: 4, o: 172 },
        ],
        6.5,
      );
      sign(w, 3.2, 10.4, 3.4, 'PITHA', 'shop', null, 'shiny = safe');
      rival(w, 4, 15, 1, tara(2));
      onPass(w, px(5), (w2) => w2.guide('Roba! | Stop!', (w3) => w3.info.deaths > 0 && w3.player.cx < px(8)));
      onPass(w, px(9), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      collectible(w, 'dis-pitha', 16, 11);
    },
  };
}

/** DIS-04 act: a longer pan, crepes poured one after the other with only a short overlap. */
const tawa: Act = {
  id: 'dis04-tawa',
  w: 38,
  advice: 'A longer pan: four crepes, each poured about two seconds after the last, each shiny only a little while. Hop on to the next as soon as it is poured and shiny, never wait for yours to dull.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    pitha(
      w,
      x + 2,
      x + 31,
      [
        { x: x + 4, w: 4, o: 0 },
        { x: x + 11, w: 4, o: 400 },
        { x: x + 18, w: 4, o: 200 },
        { x: x + 25, w: 4, o: 0 },
      ],
      x + 1,
      { period: 600, liquid: 300 },
    );
    sign(w, x + 0.2, 10.4, 3.4, 'TAWA', 'shop', null, 'hot');
  },
};

/** DIS-04 act 2: the cook works from the far end: the crepe nearest you is poured last. */
const bhogali: Act = {
  id: 'dis04-bhogali',
  w: 37,
  advice: 'Another pan, and a slow cook: each crepe is poured only a little after the one before it. Wait on the bank until the near one is freshly poured, then wait on each crepe until the next one shines, and only then hop.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    pitha(
      w,
      x + 3,
      x + 31,
      [
        { x: x + 4, w: 4, o: 0 },
        { x: x + 11, w: 4, o: 500 },
        { x: x + 18, w: 4, o: 360 },
        { x: x + 25, w: 4, o: 220 },
      ],
      x + 1,
      { period: 640, liquid: 320 },
    );
    sign(w, x + 0.4, 10.4, 3.4, 'BHOGALI', 'shop', null, 'magh bihu');
  },
};

// ================================================================== DIS-05: Gamosa (HWIK)
/** a host standing on ground column tx (feet on row `row`'s top) */
const host = (w: World, kind: 'give' | 'take', tx: number, row = 15) => w.add(new Host(px(tx) + 8, px(row), kind));

function gamosaRoom(): LevelDef {
  return {
    id: 'DIS-05',
    city: 'DIS',
    index: 5,
    name: 'Gamosa',
    nameEn: 'The welcome',
    tagline: 'In Assam a guest is welcomed with a gamosa round the neck. Everybody wants to welcome you.',
    hint: 'Each host who touches you puts a gamosa round you, and you can see them pile up on Dad. With three on, you cannot see your feet or the floor round them, and the pit is under the cloth. To give one away, walk into a host in a red sash: the next one is up on the platform. Or hop over a host who is holding out a gamosa: you don’t have to take it.',
    par: 30,
    map: Grid.ground(15).pit(18, 19).fill(12, 15, 13, 13, '=').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.add(new Cloth());
      host(w, 'give', 4);
      host(w, 'give', 7);
      host(w, 'give', 10);
      host(w, 'take', 14, 13);
      machan(w, 12, 15);
      pitDanger(w, 18, 19);
      sign(w, 14.6, 10.2, 3.2, 'ADORANI', 'shop', null, 'welcome');
      rival(w, 2, 15, 1, tara(3));
      onPass(w, px(3), (w2) => taraSays(w2, 'Xubhessa! | Best wishes!', 2.2));
      onPass(w, px(16), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      collectible(w, 'dis-gamosa', 18, 9.6);
    },
  };
}

/** DIS-05 act: two more pits, and a host holding out a gamosa right before one of them. */
const atithi: Act = {
  id: 'dis05-atithi',
  w: 58,
  advice: 'Three hosts, a platform with a red sash, and a pit: the same again. Then one more giver right before a pit: don’t let him touch you, hop over him. The last pit is easy again. You only need one gamosa left for the door, so don’t give them all away.',
  cps: [15.5, 33.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 11, x + 14, 13, 13, '=');
    g.pit(x + 19, x + 20);
    g.pit(x + 30, x + 31);
    g.fill(x + 35, x + 37, 13, 13, '=');
    g.pit(x + 41, x + 42);
  },
  build: (w, c) => {
    const x = c.x;
    // the stall at the start takes back every gamosa you are wearing
    onPass(w, px(x + 1.2), (w2) => {
      if (gam(w2).n > 0) w2.say('Dhonyobad! | Thank you!', px(x + 1.2), px(12.4), 1.6, 'npc');
      gam(w2).n = 0;
    });
    host(w, 'give', x + 3);
    host(w, 'give', x + 6);
    host(w, 'give', x + 9);
    host(w, 'take', x + 13, 13);
    machan(w, x + 11, x + 14);
    pitDanger(w, x + 19, x + 20);
    host(w, 'give', x + 24);
    pitDanger(w, x + 30, x + 31);
    host(w, 'take', x + 36, 13);
    machan(w, x + 35, x + 37);
    pitDanger(w, x + 41, x + 42);
    sign(w, x + 0.4, 10.2, 3.2, 'ATITHI', 'shop', null, 'leave yours here');
  },
};

/** DIS-05 act 2: the wedding line. Givers in a row along a ledge over the beel, takers on the steps above them. */
const biya: Act = {
  id: 'dis05-biya',
  w: 52,
  advice: 'A whole line of hosts along the bank, each with a gamosa. You can only carry two and still see: after every two givers there is a host in a red sash up on a step; walk into him. Then the pits come, two of them, close together.',
  cps: [18.5, 36.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 8, x + 10, 13, 13, '=');
    g.fill(x + 17, x + 19, 13, 13, '=');
    g.fill(x + 26, x + 28, 13, 13, '=');
    g.pit(x + 33, x + 34);
    g.pit(x + 40, x + 41);
  },
  build: (w, c) => {
    const x = c.x;
    onPass(w, px(x + 1.2), (w2) => {
      gam(w2).n = 0;
    });
    for (const k of [3, 5, 12, 14, 21, 23]) host(w, 'give', x + k);
    for (const k of [9, 18, 27]) host(w, 'take', x + k, 13);
    for (const k of [8, 17, 26]) machan(w, x + k, x + k + 2);
    pitDanger(w, x + 33, x + 34);
    pitDanger(w, x + 40, x + 41);
    sign(w, x + 0.4, 10.2, 3.2, 'BIYA', 'shop', null, 'the wedding');
  },
};

// ================================================================== DIS-06: Majuli ka Paar (the retreating bank)
/** a bank of slabs over a channel: the river takes them on a clock that starts when Dad passes `from` (tile column) */
export function bank(w: World, defs: BankDef[], from: number, reset: number, c0: number, c1: number) {
  river(w, c0, c1, 'dis-bank');
  const b = w.add(new Bank(defs, px(from), px(reset)));
  b.setup(w);
  (w.flags.banks ??= []).push(b);
  return b;
}

function majuliRoom(): LevelDef {
  return {
    id: 'DIS-06',
    city: 'DIS',
    index: 6,
    name: 'Majuli ka Paar',
    nameEn: 'Across from Majuli',
    tagline: 'Majuli is the biggest river island in the world, and the river takes a little of its bank every year. Today it takes it by the slab.',
    hint: 'Nobody is floating: the river is eating the island, a slab at a time, from the water’s edge inland: the slab nearest the water goes first, so the far bank keeps getting farther. The bank starts going the moment you set out, and cracks and a dark wet line show a slab seconds before it goes. Cross at a run: don’t stop at the edge, don’t wait on a slab, and keep moving across the slabs.',
    par: 22,
    map: Grid.ground(15).pit(13, 26).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      bank(w, [{ x: 15, w: 4, t: 240 }, { x: 19, w: 4, t: 380 }, { x: 23, w: 4, t: 520 }], 5, 3, 13, 27);
      sign(w, 8.2, 10.4, 3.4, 'MAJULI', 'shop', null, 'ferry ghat');
      rival(w, 3, 15, 1, tara(4));
      onPass(w, px(4), (w2) => taraSays(w2, 'Lahe lahe, Dad. | Slowly, slowly, Dad.', 2.4));
      collectible(w, 'dis-tenga', 20.5, 10.4);
    },
  };
}

/** DIS-06 act: four slabs with a gap between each, taken quickly one after another. */
const majuli: Act = {
  id: 'dis06-majuli',
  w: 42,
  advice: 'Another stretch of bank: four slabs with a gap between each, and the river is at the first one the moment you set out. Run and hop from slab to slab without stopping; each is gone a little after you were on it. Then the stilt house ladder: it is pulled up until the tea boy comes.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    bank(
      w,
      [
        { x: x + 5, w: 4, t: 230 },
        { x: x + 10, w: 4, t: 320 },
        { x: x + 15, w: 4, t: 410 },
        { x: x + 20, w: 4, t: 500 },
      ],
      x + 0.6,
      x - 4,
      x + 3,
      x + 25,
    );
    sign(w, x + 0.4, 10.4, 3.4, 'MAJULI GHAT', 'shop', null, 'run');
  },
};

/** DIS-06 act 2: a wide channel, five slabs, and a dry bar to rest on in the middle (the shelter). */
const chapori6: Act = {
  id: 'dis06-chapori',
  w: 46,
  advice: 'A wide channel with a rock in the middle that the river never takes: run the first three slabs, stop on the rock and get your breath, and the second stretch starts going only when you step off the rock.',
  cps: [1.5, 18.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 16);
    g.pit(x + 21, x + 38);
  },
  build: (w, c) => {
    const x = c.x;
    bank(w, [{ x: x + 4, w: 4, t: 230 }, { x: x + 8, w: 4, t: 320 }, { x: x + 12, w: 5, t: 410 }], x + 0.6, x - 4, x + 3, x + 17);
    bank(w, [{ x: x + 23, w: 4, t: 230 }, { x: x + 28, w: 4, t: 320 }, { x: x + 33, w: 4, t: 410 }], x + 20.4, x + 17, x + 21, x + 39);
    sign(w, x + 17.6, 10.4, 3.2, 'SHILA', 'shop', null, 'the rock');
  },
};

// ================================================================== DIS-07: Husori (the carollers, marathon)
function husoriRoom(): LevelDef {
  return {
    id: 'DIS-07',
    city: 'DIS',
    index: 7,
    name: 'Husori',
    nameEn: 'The carollers',
    tagline: 'Bohag Bihu: the husori group goes from house to house, singing, and every gate in the village opens for them.',
    hint: 'The bamboo gates open only for the husori group, and only for anyone inside its circle (the dashed ring round the dhol). The stakes on a shut gate kill you. Walk with the singers at their own slow pace, inside the ring, and go through each gate with them. A gate that has been opened for you shuts again a moment after you leave the ring: don’t be in the doorway then.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      husori(w, 6, 2, [{ x: 22, ritual: 0, stay: 200 }]);
      sign(w, 9.6, 10.4, 3.4, 'HUSORI', 'shop', null, 'bohag bihu');
      rival(w, 3, 15, 1, tara(5));
      // the one time in Guwahati Tara tells the truth
      onPass(w, px(3), (w2) => taraSays(w2, 'Lahe lahe, Dad? | Slowly slowly, Dad?', 2.4));
      collectible(w, 'dis-pepa', 16.4, 10.2);
    },
  };
}

/** DIS-07 act 1: two more houses, a long walk between. */
const ghar: Act = {
  id: 'dis07-ghar',
  w: 62,
  advice: 'Two more houses, a long walk apart. The gates are the same: they open when the group is at them and you are inside the ring. Walk with them. Don’t run ahead to the next gate and wait at it: the stakes are on this side.',
  cps: [14.5, 20.5, 44.5, 52.5],
  build: (w, c) => {
    const x = c.x;
    husori(w, x + 4, x, [{ x: x + 24, ritual: 0, stay: 140 }, { x: x + 56, ritual: 0, stay: 140 }], 56);
    sign(w, x + 0.6, 10.4, 3.4, 'BOHAG', 'shop', null, 'ghar ghar');
  },
};

/** DIS-07 act 2: a house where the gamosa is handed out first, and the gate waits for it. */
const chowk: Act = {
  id: 'dis07-chowk',
  w: 74,
  advice: 'Three more gates. At the middle one the host gives the singers gamosas first, and the gate stays shut until he is done: stay in the ring till it opens, and don’t go through before it does. Leave early and the group leaves you behind the stakes.',
  cps: [14.5, 18.5, 36.5, 42.5, 58.5, 66.5],
  build: (w, c) => {
    const x = c.x;
    husori(w, x + 4, x, [{ x: x + 22, ritual: 0, stay: 140 }, { x: x + 46, ritual: 120, stay: 240 }, { x: x + 70, ritual: 0, stay: 140 }], 56);
    sign(w, x + 0.6, 10.4, 3.4, 'CHOWK', 'shop', null, 'the yard');
  },
};

// ================================================================== DIS-08: Gorh (the rhino, HWIK)
function gorhRoom(): LevelDef {
  return {
    id: 'DIS-08',
    city: 'DIS',
    index: 8,
    name: 'Gorh',
    nameEn: 'The rhino',
    tagline: 'Kaziranga: elephant grass taller than a man, and under it more beel than ground. The rhino knows the way. The jeep makes it run.',
    hint: 'Under the tall grass there is no floor, only beel (wetland): the only floor in the grass is a strip a rhino has flattened. A jeep somewhere out in the grass revs its engine, and a column of dust rises where it is: the rhino charges at it, straight along the grass, and stops there. Keep out of its way until it has gone, then walk the strip it made. It always runs towards the dust.',
    par: 30,
    map: Grid.ground(15).pit(8, 27).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      charge(w, { trig: px(3), c0: 8, c1: 27, start: 30, plume: 8, delay: 170, rest: 100 });
      sign(w, 3.4, 10.4, 3.4, 'KAZIRANGA', 'shop', null, 'tall grass');
      rival(w, 2, 15, 1, tara(6));
      onPass(w, px(2), (w2) => taraSays(w2, 'Xubhessa! | Best wishes!', 2.2));
      onPass(w, px(5), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      collectible(w, 'dis-laru', 14.5, 10.4);
    },
  };
}

/** DIS-08 act: the same, then a plume on the far side with the rhino coming from behind you. */
const kaziranga: Act = {
  id: 'dis08-kaziranga',
  w: 64,
  advice: 'Two more fields. In the first the rhino comes from the far side again. In the second the dust is on the far side but the rhino starts BEHIND you, on the bank you are standing on: jump up through the haystack platform by the bank and stand on it while it runs past underneath.',
  cps: [18.5, 40.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 17);
    g.fill(x + 24, x + 27, 13, 13, '=');
    g.pit(x + 32, x + 45);
  },
  build: (w, c) => {
    const x = c.x;
    charge(w, { trig: px(x + 1), c0: x + 4, c1: x + 17, start: x + 21, plume: x + 4, delay: 160, rest: 90 });
    charge(w, { trig: px(x + 19.5), c0: x + 32, c1: x + 45, start: x + 15, plume: x + 45, delay: 170, rest: 90 });
    w.add(
      new Decor((ctx) => {
        // the haystack on its bamboo frame
        const x0 = px(x + 24);
        ctx.fillStyle = '#8D6B2E';
        ctx.fillRect(x0 + 2, px(13) + 3, 3, 29);
        ctx.fillRect(x0 + 58, px(13) + 3, 3, 29);
        ctx.fillStyle = '#D9B95A';
        ctx.fillRect(x0 + 6, px(13) + 6, 52, 26);
        ctx.fillStyle = '#C9A253';
        for (let k = 0; k < 6; k++) ctx.fillRect(x0 + 8 + k * 8, px(13) + 8, 2, 22);
        ctx.fillStyle = '#B8A04A';
        ctx.fillRect(x0 - 2, px(13), 68, 4);
      }, -1),
    );
    sign(w, x + 20.2, 10.4, 3.4, 'HAY', 'shop', null, 'climb');
  },
};

// ================================================================== DIS-10: Luit (the finale)
function luitRoom(): LevelDef {
  return {
    id: 'DIS-10',
    city: 'DIS',
    index: 10,
    name: 'Luit',
    nameEn: 'The river',
    tagline: 'The Brahmaputra, once more, with everything it has taught you. This time the level post is on the far bank.',
    hint: 'Everything on the river is as before, in a new order. The sandbars move at the siren (new bars first, yours last, a narrowing bar keeps its left end), but the level post is across on the far bank this time, so you have to remember the rule: wait where you are until the next bar is up. Then the pan, the husori gate, the bank. At the very end the way over the water is the plucker’s own path.',
    par: 40,
    map: Grid.ground(15).pit(8, 27).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      river(w, 8, 28);
      const f = sand(w, S2.room, [px(10) - 4, px(16) - 4]);
      levelPost(w, f, 29.4, 3);
      sign(w, 3.6, 10.4, 3.4, 'LUIT', 'shop', null, 'the post is over there');
      rival(w, 4, 15, 1, tara(8));
      onPass(w, px(5), (w2) => taraSays(w2, 'Luit one, Dad zero! | The river one, Dad zero!', 2.6));
      collectible(w, 'dis-chah', 20.4, 11);
    },
  };
}

/** DIS-10 act 1: the pan from Til Pitha, now over the Luit's own water. */
const luitTawa: Act = {
  id: 'dis10-tawa',
  w: 30,
  advice: 'The crepes of the pitha pan, one after another over the water: on to the next only when it has been poured and shines, and don’t be standing when yours dulls.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 22);
  },
  build: (w, c) => {
    const x = c.x;
    pitha(w, x + 2, x + 22, [{ x: x + 4, w: 5, o: 0 }, { x: x + 10, w: 5, o: 400 }, { x: x + 16, w: 5, o: 200 }], x + 1, { period: 600, liquid: 300 });
    sign(w, x + 0.2, 10.4, 3.4, 'TAWA', 'shop', null, 'shiny = safe');
  },
};

/** DIS-10 act: the tea rows: a hedge too tall to jump until the plucker has picked it. */
const luitBagan: Act = {
  id: 'dis10-bagan',
  w: 30,
  advice: 'The tea rows: a plucker walks ahead and the hedges step down only after she has picked them. Follow a few steps behind her.',
  cps: [1.5, 14.5],
  build: (w, c) => {
    const x = c.x;
    garden(w, [x + 12, x + 20], { x: px(x + 5), from: px(x), endX: px(x + 29) });
  },
};

/** DIS-10 act 2: the husori gate, this time with the host's ritual first. */
const luitGate: Act = {
  id: 'dis10-gate',
  w: 40,
  advice: 'The husori group, and a gate that waits for the host’s gamosa. Wait in front of it, not touching, until the group has come, the ritual is done and it opens for you inside the ring.',
  cps: [3.5, 26.5],
  build: (w, c) => {
    const x = c.x;
    husori(w, x + 4, x, [{ x: x + 30, ritual: 140, stay: 300 }]);
    sign(w, x + 0.6, 10.4, 3.4, 'HUSORI', 'shop', null, 'wait');
  },
};

/** DIS-10 act 3: Majuli's bank, three slabs. */
const luitBank: Act = {
  id: 'dis10-bank',
  w: 30,
  advice: 'Majuli’s bank again: run at it and keep going across the slabs; the river takes each one in order, nearest the water first.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    bank(w, [{ x: x + 5, w: 5, t: 230 }, { x: x + 10, w: 5, t: 330 }, { x: x + 15, w: 5, t: 430 }], x + 0.6, x - 4, x + 3, x + 20);
    sign(w, x + 0.4, 10.4, 3.4, 'MAJULI', 'shop', null, 'run');
  },
};

// ================================================================== DIS-09: Rang Ghar (the boat roof)
const ROOF_ROOM: RoofSection[] = [
  { slick: 3, slickW: 2, push: 100, chute: -1, every: 0 },
  { slick: 9, slickW: 3, push: 180, chute: 10, every: 250 },
  { slick: 16, slickW: 3, push: 180, chute: 17, every: 250 },
  { slick: 23, slickW: 3, push: 180, chute: 24, every: 250 },
];
function rangGharRoom(): LevelDef {
  const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
  for (const c of [8, 15, 22]) g.put(c, 14, '#');
  // the pavilion's side: a step and the upper eave, both one-way (you walk under them on the roof)
  g.fill(2, 3, 12, 12, '=');
  g.fill(4, 11, 9, 9, '=');
  return {
    id: 'DIS-09',
    city: 'DIS',
    index: 9,
    name: 'Rang Ghar',
    nameEn: 'The Ahom pavilion',
    tagline: 'The royal pavilion at Sivasagar, with its boat-shaped roof. The roof is oiled, and the royal games roll their balls down it.',
    hint: 'The roof is oiled: where it shines it pushes you back down the slope, almost as fast as you can run, and wooden balls roll down it from the gutters. They smash against the wooden ribs. Stand on the red-and-white grip pads in front of a rib, where nothing pushes you and no ball can reach, take a run along the pad and jump the rib and the oiled stretch beyond it in one leap, on to the next pad. Never stand or land on the oil. The steps up the pavilion’s side go only to the upper eave, which is the gutter: a ball comes rolling down it the moment you stand on it, and it ends over the oil.',
    par: 36,
    map: g.rows(),
    build(w: World) {
      door(w);
      roof(w, ROOF_ROOM, 4);
      w.add(new Eave(4, 11, 9));
      sign(w, 12.6, 10.4, 3.6, 'RANG GHAR', 'shop', null, 'grip pad');
      rival(w, 5, 15, 1, tara(7));
      onPass(w, px(6), (w2) => taraSays(w2, 'Xubho zatra, Dad! | Good journey, Dad!', 2.4));
      onPass(w, px(7.5), (w2) => taraSays(w2, 'Bhal, Dad! | Good, Dad!', 2));
      collectible(w, 'dis-paat', 14.5, 9.6);
    },
  };
}

/** DIS-09 act: a longer roof, and the slope pushes harder (you can no longer walk the oil at all). */
const ROOF_ACT: RoofSection[] = [
  { slick: 3, slickW: 2, push: 100, chute: -1, every: 0 },
  { slick: 9, slickW: 3, push: 180, chute: 10, every: 230 },
  { slick: 16, slickW: 3, push: 180, chute: 17, every: 230 },
  { slick: 23, slickW: 3, push: 180, chute: 24, every: 230 },
  { slick: 30, slickW: 3, push: 180, chute: 31, every: 230 },
];
const kaidhara: Act = {
  id: 'dis09-chaal',
  w: 40,
  advice: 'The roof goes on, and the oil pushes harder than you can run. Same way: stop on each grip pad, run along it, and clear the rib and the oil in one jump. A ball is rolling in every stretch.',
  cps: [6.5, 20.5],
  paint: (g, c) => {
    for (let i = 0; i < 4; i++) g.put(c.x + 8 + i * 7, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    roof(
      w,
      ROOF_ACT.map((s) => ({ ...s, slick: s.slick + x, chute: s.chute >= 0 ? s.chute + x : -1 })),
      x + 2,
    );
    sign(w, x + 0.6, 10.4, 3.4, 'CHAAL', 'shop', null, 'the roof');
  },
};

/** DIS-09 act 2: the far side of the roof, steeper, with the pads only two tiles long. */
const ROOF_ACT2: RoofSection[] = [
  { slick: 3, slickW: 2, push: 100, chute: -1, every: 0 },
  { slick: 9, slickW: 3, push: 200, chute: 10, every: 210 },
  { slick: 16, slickW: 3, push: 200, chute: 17, every: 210 },
  { slick: 23, slickW: 3, push: 200, chute: 24, every: 210 },
];
const dhal: Act = {
  id: 'dis09-dhal',
  w: 33,
  advice: 'The far side of the roof is steeper. The same: stop on each pad, back to its start, a run, and one long leap over the rib and the oil.',
  cps: [6.5],
  paint: (g, c) => {
    for (let i = 0; i < 3; i++) g.put(c.x + 8 + i * 7, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    roof(
      w,
      ROOF_ACT2.map((s) => ({ ...s, slick: s.slick + x, chute: s.chute >= 0 ? s.chute + x : -1 })),
      x + 2,
    );
  },
};

// the hut door: the farmer shuts it while the river is moving
const hutDoor = (w: World, d: Door, field: SandField) => {
  const L = lock(w, d, 'Roba! Chah khaba. | Wait! Have some tea.');
  const f = field;
  w.onTick((w2) => {
    if (f.e < 0 && f.level >= 1) L.unlock();
  });
  return L;
};
void hutDoor;

export const levels = (): LevelDef[] => [
  { ...tourLevel(), shape: 'tour', meta: { family: 'carrier-spills-on-contact', betrayals: ['carrier-spill'], ending: 'dis-tea-tray' } },
  longStage({ base: charRoom(), acts: [chapori, dhar], twist: 'dis-hut-shut', par: 36, shape: 'short', meta: { family: 'sandbars-relocate-by-level-post', betrayals: ['level-post-relocate'], ending: 'dis-hut-shut' } }),
  longStage({ base: teaRoom(), acts: [bagan], cps: [14.5], twist: 'dis-muga-reel', par: 58, shape: 'short', meta: { family: 'plucked-row-steps-down', betrayals: ['crop-floor-lowers'], ending: 'dis-muga-reel' } }),
  longStage({ base: pithaRoom(), acts: [tawa, bhogali], twist: 'dis-laru-plate', par: 34, shape: 'short', meta: { family: 'set-crepe-rolls-you-up', betrayals: ['roll-by-shine'], ending: 'dis-laru-plate' } }),
  longStage({ base: gamosaRoom(), acts: [biya, taat, atithi], twist: 'dis-gamosa-latch', par: 37, shape: 'wtf', meta: { family: 'gamosas-hide-feet-camera', betrayals: ['overloaded-blind'], ending: 'dis-gamosa-latch' } }),
  longStage({ base: majuliRoom(), acts: [majuli, majChang, chapori6], twist: 'dis-tea-ladder', par: 34, shape: 'long', meta: { family: 'bank-retreats-in-slabs', betrayals: ['retreating-bank'], ending: 'dis-tea-ladder' } }),
  longStage({ base: husoriRoom(), acts: [ghar, bordoisila, husDhol, chowk], cps: [18.5], twist: 'dis-uruka-net', par: 90, lives: 'act', shape: 'marathon', meta: { family: 'join-moving-group-to-pass-gate', betrayals: ['join-group'], ending: 'dis-uruka-net' } }),
  longStage({ base: gorhRoom(), acts: [kaziranga, gorhJeep, gorhBagori], twist: 'dis-watch-tower', par: 74, shape: 'wtf', meta: { family: 'follow-flattened-strip', betrayals: ['follow-flattened'], ending: 'dis-watch-tower' } }),
  longStage({ base: rangGharRoom(), acts: [rangTug, kaidhara, dhal], twist: 'dis-royal-seat', par: 36, shape: 'long', meta: { family: 'roof-curve-slides-stop-at-ribs', betrayals: ['slope-ribs'], ending: 'dis-royal-seat' } }),
  longStage({ base: luitRoom(), acts: [luitDhol, luitBordoisila, luitTug, luitGamosa], twist: 'dis-post-bank', par: 63, lives: 'act', shape: 'marathon', meta: { family: 'finale-level-post-far-bank', betrayals: ['level-post-far-bank'], ending: 'dis-post-bank' } }),
];
