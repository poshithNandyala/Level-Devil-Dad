// Dispur (Guwahati, Assam): the gateway to the Northeast on the widest river you will ever see. Ten stages: the
// riverfront tour with a tea boy, the moving sandbars, the tea garden, the til pitha pan, the gamosa welcome,
// Majuli's retreating bank, the husori carollers, the rhino, the Rang Ghar pavilion and the Luit itself.
import { type LevelDef, type World } from '../../world';
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
import { Cloth, Host, gam, pitDanger } from './gamosa';
import { Hedge, Plucker, Sprinkler } from './pluck';
import { Carrier, Decor, River, SandField, levelPost, river, sand, type Span } from './entities';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
void px; void sign; void rival; void door; void collectible; void onPass; void taraSays; void longStage; void Decor; void tara; void L;

/** the placeholder rooms of the stages that are not built yet */
function todoRoom(n: number): LevelDef {
  return {
    id: `DIS-${String(n).padStart(2, '0')}`,
    city: 'DIS',
    index: n,
    name: `Stage ${n}`,
    nameEn: 'unbuilt',
    tagline: 'not built yet',
    hint: 'not built yet.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
    },
  };
}

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
    par: 24,
    hint: 'A boy walks the promenade with a tray of hot lal chah, and the tray swings on his arm. Touch him, or hop clean over him (the tray tips and the tea spreads over where you land), and you are scalded. There is a ghat, a step down to the river, in the middle of the promenade: climb down into it and let him walk over your head. Climb out only once he is a few steps past.',
    cps: [27.5, 50.5, 58.5],
    paint: (g) => {
      g.pit(ghat.x0, ghat.x1, 15);
      g.fill(ghat.x0, ghat.x1, 17, 17, '#');
    },
    extra: (w) => {
      w.add(new Carrier(px(92), px(60), px(62)));
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
      collectible(w, 'dis-paat', 18, 11.5);
    },
  };
}

/** DIS-03 act: more hedges, and a sprinkler on the path. The wet path won't let you stop. */
const bagan: Act = {
  id: 'dis03-bagan',
  w: 34,
  advice: 'A sprinkler runs over the path. While it sprays and for a little after, the path is wet and you slide: you cannot stop behind her. Wait before the pipe until it is dry again, then follow her as before.',
  cps: [3.5],
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
      pitDanger(w, 18, 19);
      sign(w, 14.6, 10.2, 3.2, 'ADORANI', 'shop', null, 'welcome');
      rival(w, 2, 15, 1, tara(3));
      onPass(w, px(3), (w2) => taraSays(w2, 'Xubhessa! | Best wishes!', 2.2));
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
    pitDanger(w, x + 19, x + 20);
    host(w, 'give', x + 24);
    pitDanger(w, x + 30, x + 31);
    host(w, 'take', x + 36, 13);
    pitDanger(w, x + 41, x + 42);
    sign(w, x + 0.4, 10.2, 3.2, 'ATITHI', 'shop', null, 'leave yours here');
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
  longStage({ base: charRoom(), acts: [chapori], twist: 'dis-hut-shut', par: 24, shape: 'short', meta: { family: 'sandbars-relocate-by-level-post', betrayals: ['level-post-relocate'], ending: 'dis-hut-shut' } }),
  longStage({ base: teaRoom(), acts: [bagan], twist: 'dis-tea-chest', par: 58, shape: 'short', meta: { family: 'plucked-row-steps-down', betrayals: ['crop-floor-lowers'], ending: 'dis-tea-chest' } }),
  longStage({ base: pithaRoom(), acts: [tawa], twist: 'dis-laru-plate', par: 40, shape: 'short', meta: { family: 'set-crepe-rolls-you-up', betrayals: ['roll-by-shine'], ending: 'dis-laru-plate' } }),
  longStage({ base: gamosaRoom(), acts: [atithi], twist: 'dis-gamosa-latch', par: 60, shape: 'wtf', meta: { family: 'gamosas-hide-feet-camera', betrayals: ['overloaded-blind'], ending: 'dis-gamosa-latch' } }),
  longStage({ base: todoRoom(6), par: 30, shape: 'long' }), // DIS-06 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }), // DIS-07 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // DIS-08 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // DIS-09 TODO: acts, twist (a dis-... ending), par
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // DIS-10 TODO: acts, twist (a dis-... ending), par
];
