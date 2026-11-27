// Dispur (Guwahati, Assam): the gateway to the Northeast on the widest river you will ever see. Ten stages: the
// riverfront tour with a tea boy, the moving sandbars, the tea garden, the til pitha pan, the gamosa welcome,
// Majuli's retreating bank, the husori carollers, the rhino, the Rang Ghar pavilion and the Luit itself.
import { type LevelDef, type World } from '../../world';
import { bordoisila, luitBordoisila } from './storm';
import { rangTug, luitTug } from './tug';
import { husDhol, luitDhol } from './dhol';
import { lines as L } from './lines';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import { luitTalatal, stair } from './stair';
import { majuliTraps, majuliWake } from './majuli';
import { gamFeast, gamMachan, gamSanko } from './feast';
import { husGoru } from './goru';
import { rangSluice } from './sluice';
import { husTekeli } from './tekeli';
import { husPepa } from './pepa';
import { husCard } from './card';
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
import { majChar3, majGhat, majPitha, gorhKohora, luitGhat, gamChar, gamGhat, gamHusori, gorhBagori, gorhDuiJeep, gorhJeep, husGhat, husLane, husPaar, luitChang, luitChar, luitGamosa, luitGorh, majChang, majChang2, majChar, rangBihu, rangWide, teaBoy } from './acts2';
import { Bank, type BankDef } from './bank';
import { Cloth, Host, gam, machan, pitDanger } from './gamosa';
import { Hedge, Plucker, Sprinkler } from './pluck';
import { Carrier, Danger, Decor, GROUND, River, SandField, levelPost, river, sand, type Span } from './entities';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

// ================================================================== DIS-01: Nomoskar Guwahati (the tour)
/** the bench (tile) on the promenade where the tea boy stops to pour */
const bench = 80;
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
    hint: 'A boy walks the promenade towards you with a tray of hot lal chah, and the tray swings out in front of him. Touch him or his tray and you are scalded; hop clean over him and the tray tips, and the tea spreads where you land. He stops at the bench to pour, and sets the tray down: wait well back from the bench till he does, then walk past him while he pours. A second boy comes from Fancy Bazar once you are up on the deck: stay up there until he has set his tray down.',
    cps: [27.5, 50.5, 58.5, 75, 82.5, 99.6],
    extra: (w) => {
      // he walks at you along the promenade, and pours at the bench (tray set down) before walking on
      w.add(new Carrier(px(92), px(60), px(62), 34, [0, 0], [px(bench) + 8], 220));
      w.add(
        new Decor((ctx) => {
          // the bench where the tea boy stops to pour
          ctx.fillStyle = '#7A5A22';
          ctx.fillRect(px(bench) - 4, px(15) - 12, 30, 4);
          ctx.fillRect(px(bench) - 2, px(15) - 8, 3, 8);
          ctx.fillRect(px(bench) + 21, px(15) - 8, 3, 8);
        }, -3),
      );
      sign(w, bench - 0.8, 10.6, 3.4, 'CHAH', 'shop', null, 'tea at the bench');
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

// ================================================================== DIS-04: Talatal (allocation v3 F448; the pitha room was TAKEN)
function talatalRoom(): LevelDef {
  return {
    id: 'DIS-04',
    city: 'DIS',
    index: 4,
    name: 'Talatal',
    nameEn: 'The palace below ground',
    tagline: 'Talatal Ghar at Sivasagar: the Ahom palace has more floors under the ground than above it, and its stairs are old.',
    hint: 'Climb on to the landing at the top of the stair. As soon as you are on it the stair starts to fall, one step after another, from the top down, and the bottom step is already gone. Go down with it, keeping ahead of the fall, and stop on the step before the last: that one comes back up. Wait on it as it rises, then hop over to the far side. Wait at the top instead and the landing goes too, into the flooded vault.',
    par: 22,
    map: Grid.ground(15).pit(6, 20).fill(1, 5, 14, 14, '#').fill(2, 5, 13, 13, '#').fill(3, 5, 12, 12, '#').fill(4, 5, 11, 11, '#').fill(5, 5, 10, 10, '#').fill(21, 31, 9, 14, '#').put(0, 14, '@').put(30, 8, 'E').rows(),
    build(w: World) {
      door(w);
      // the landing (sinks once the stair is done) and five steps down; the fifth, the step before the last, rises back
      stair(
        w,
        [
          { c: 6, r: 9, w: 3, fall: 330 },
          { c: 9, r: 10, w: 2, fall: 120 },
          { c: 11, r: 11, w: 2, fall: 150 },
          { c: 13, r: 12, w: 2, fall: 180 },
          { c: 15, r: 13, w: 2, fall: 210 },
          { c: 17, r: 14, w: 3, fall: Infinity, rise: [230, 5, 80] },
        ],
        6.4,
        [6, 20],
        [20, 21],
      );
      sign(w, 1.2, 10.4, 3.4, 'TALATAL', 'shop', null, 'palace stairs');
      rival(w, 2, 15, 1, tara(1));
      onPass(w, px(6.4), (w2) => taraSays(w2, 'Jaldi, Dad! Tolot! | Quick, Dad! Down!', 2.2));
      collectible(w, 'dis-pitha', 18, 7.2);
    },
  };
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
  cps: [14.5, 33.5],
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
    tagline: 'Majuli is the biggest river island in the world, and the river takes a little of its bank every year. The villagers’ bamboo spurs give a little back.',
    hint: 'The current runs left to right (see the lines on the water). The river takes the bank on the upstream side of each bamboo spur early, and lays silt on its downstream side: a sand step builds up there. Never stand on a slab in front of a spur, and never on the spur itself (it is only poles). Wait on the bank till the step behind the first spur is up, jump over the slab and the spur on to it, and do the same at the second spur.',
    par: 22,
    map: Grid.ground(15).pit(13, 26).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      // upstream of each spur the slab goes early; downstream the silt builds a step that stays
      bank(w, [{ x: 13, w: 2, t: 150 }, { x: 15.6, w: 3.4, t: 220, grow: true }, { x: 19, w: 2, t: 330 }, { x: 21.6, w: 4.4, t: 420, grow: true }], 5, 3, 13, 27);
      for (const sx of [15, 21]) spur(w, sx);
      currents(w, 13, 26);
      sign(w, 8.2, 10.4, 3.4, 'MAJULI', 'shop', null, 'ferry ghat');
      rival(w, 3, 15, 1, tara(4));
      onPass(w, px(4), (w2) => taraSays(w2, 'Porcupine-r pisofale thiya diya. | Stand behind the porcupine.', 2.6));
      collectible(w, 'dis-tenga', 17.6, 11.6);
    },
  };
}

/** a bamboo "porcupine" spur in the water at column x: a star of poles, no floor (standing on it, you slip through) */
function spur(w: World, x: number) {
  w.add(new Danger({ x: px(x), y: GROUND + 2, w: px(0.6), h: 20 }, 'dis-porcupine'));
  w.add(
    new Decor((ctx) => {
      ctx.strokeStyle = '#8D6B2E';
      ctx.lineWidth = 2;
      const cx = px(x) + 5;
      for (const [dx, dy] of [[-8, -12], [8, -12], [0, -16], [-10, 4], [10, 4]]) {
        ctx.beginPath();
        ctx.moveTo(cx, GROUND + 6);
        ctx.lineTo(cx + dx, GROUND + 6 + dy);
        ctx.stroke();
      }
    }, 2),
  );
}

/** the current drawn on the water: short lines drifting right (downstream), so which side of a spur is which can be read */
function currents(w: World, c0: number, c1: number) {
  w.add(
    new Decor((ctx, w2) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const x = px(c0) + ((w2.tick * 0.6 + i * 40) % px(c1 - c0));
        ctx.beginPath();
        ctx.moveTo(x, GROUND + 20 + (i % 3) * 6);
        ctx.lineTo(x + 10, GROUND + 20 + (i % 3) * 6);
        ctx.lineTo(x + 7, GROUND + 17 + (i % 3) * 6);
        ctx.stroke();
      }
    }, 2),
  );
}



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


/** DIS-07 act 2: a house where the gamosa is handed out first, and the gate waits for it. */
const chowk: Act = {
  id: 'dis07-chowk',
  w: 74,
  advice: 'Three more gates. At the middle one the host gives the singers gamosas first, and the gate stays shut until he is done: stay in the ring till it opens, and don’t go through before it does. Leave early and the group leaves you behind the stakes.',
  cps: [14.5, 16.5, 36.5, 40.5, 58.5, 64.5], // 4.5 tiles back from each gate's stakes
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
  cps: [5.5, 19.5],
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

/** the act with `s` more columns of bank in front of it, so the checkpoints at its start sit >= 4.5 tiles before its
 *  trap (a respawned Dad who runs or hops a step must not land in it). Checkpoints past column 2 move with the act. */
const runUp = (a: Act, s: number): Act => ({
  ...a,
  w: a.w + s,
  cps: (a.cps ?? []).map((c) => (c > 2 ? c + s : c)),
  paint: a.paint && ((g, c) => a.paint!(g, { ...c, x: c.x + s })),
  build: a.build && ((w, c) => a.build!(w, { ...c, x: c.x + s })),
});

export const levels = (): LevelDef[] => [
  { ...tourLevel(), shape: 'tour', meta: { family: 'carrier-spills-on-contact', betrayals: ['carrier-spill'], ending: 'dis-tea-tray' } },
  longStage({ base: charRoom(), acts: [chapori], twist: 'dis-hut-shut', par: 36, shape: 'short', meta: { family: 'sandbars-relocate-by-level-post', betrayals: ['level-post-relocate'], ending: 'dis-hut-shut' } }),
  longStage({ base: teaRoom(), acts: [bagan], cps: [12], twist: 'dis-muga-reel', par: 58, shape: 'short', meta: { family: 'plucked-row-steps-down', betrayals: ['crop-floor-lowers'], ending: 'dis-muga-reel' } }),
  longStage({ base: talatalRoom(), acts: [], twist: 'dis-laru-plate', par: 34, shape: 'short', meta: { family: 'set-crepe-rolls-you-up', betrayals: ['roll-by-shine'], ending: 'dis-laru-plate' } /* repo allocation.json label; v3 names this slot collapsing-stair-penultimate-rises (the integrator lands it) */ }),
  longStage({ base: gamosaRoom(), acts: [atithi, gamSanko, gamFeast, gamMachan], twist: 'dis-gamosa-latch', par: 37, shape: 'wtf', meta: { family: 'gamosas-hide-feet-camera', betrayals: ['overloaded-blind'], ending: 'dis-gamosa-latch' } }),
  longStage({ base: majuliRoom(), acts: [majuliWake, majuliTraps], twist: 'dis-tea-ladder', par: 34, shape: 'long', meta: { family: 'bank-retreats-in-slabs', betrayals: ['retreating-bank'], ending: 'dis-tea-ladder' } }),
  longStage({ base: husoriRoom(), acts: [runUp(bordoisila, 3), runUp(husDhol, 3), husGoru, husTekeli, husCard, chowk, husPepa], cps: [16], twist: 'dis-uruka-net', par: 90, lives: 'act', shape: 'marathon', meta: { family: 'join-moving-group-to-pass-gate', betrayals: ['join-group'], ending: 'dis-uruka-net' } }),
  longStage({ base: gorhRoom(), acts: [gorhJeep, gorhDuiJeep, runUp(gorhBagori, 3)], twist: 'dis-watch-tower', par: 74, shape: 'wtf', meta: { family: 'follow-flattened-strip', betrayals: ['follow-flattened'], ending: 'dis-watch-tower' } }),
  longStage({ base: rangGharRoom(), acts: [rangTug, kaidhara, rangSluice], twist: 'dis-royal-seat', par: 36, shape: 'long', meta: { family: 'roof-curve-slides-stop-at-ribs', betrayals: ['slope-ribs'], ending: 'dis-royal-seat' } }),
  longStage({ base: luitRoom(), acts: [runUp(luitDhol, 3), runUp(luitBordoisila, 3), luitTug, luitTalatal, luitGamosa], twist: 'dis-post-bank', par: 63, lives: 'act', shape: 'marathon', meta: { family: 'finale-level-post-far-bank', betrayals: ['level-post-far-bank'], ending: 'dis-post-bank' } }),
];
