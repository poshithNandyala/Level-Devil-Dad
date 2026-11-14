// Raipur: the rice bowl. Gedi stilts over the paddy mud, a clock that only ticks when you move, hills
// of rice poured from sacks, bhaunra spinning tops, kosa cocoons, and the red ants' living bridges.
import { Entity, type LevelDef, type World } from '../world';
import { LINES } from '../cities';
import { collectible, door, px, rival, sign } from './kit';
import type { Act } from './acts';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { Baaj, Chapda, Gedi, Ghadi, Hand, Heap, Kosa, Mud, Sack, Swarm, Top } from '../entities/raipur';

const TAUNTS = LINES.RPR.taunt;
const G = 15;
const tara = (n: number, beaten = 0) => ({ intro: LINES.RPR.intro[n], point: 1 as const, introAt: 0.5, taunts: TAUNTS, beaten: LINES.RPR.beaten[beaten] });

// ================================================================== RPR-02: Hareli (the stilts)
export function gedi(w: World, c0: number, c1: number) {
  return w.add(new Gedi(px(c0) + 8, px(c1), px(G)));
}
export function mud(w: World, c0: number, c1: number) {
  return w.add(new Mud(px(c0), px(c1 + 1), px(G)));
}

function hareliRoom(): LevelDef {
  return {
    id: 'RPR-02',
    city: 'RPR',
    index: 2,
    name: 'Hareli',
    nameEn: 'The stilt festival',
    tagline: 'At Hareli, when the paddy is in and the lanes are mud, all Chhattisgarh gets up on bamboo gedi.',
    hint: 'On the gedi stilts you walk straight through the paddy mud (on foot it has you for good) and you jump far higher. But land from a jump still moving and you’re off them: let go of left and right just before you come down.',
    par: 11,
    map: Grid.ground(15).fill(17, 18, 10, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.gedis = [gedi(w, 4, 27)];
      mud(w, 7, 16);
      mud(w, 19, 24);
      sign(w, 0.3, 10.4, 3.2, 'HARELI', 'shop', null, 'gedi daud');
      rival(w, 2, 15, 1, tara(0));
      onPass(w, px(4), (w2) => w2.guide('Utre ke pehli haath chhod! | Let go before you land!'));
      collectible(w, 'chila', 12, 8.6);
    },
  };
}

/** RPR-02 act: the fields. A bund to hop, a canal to clear, a high bund, and a post in the last canal. */
const khet: Act = {
  id: 'rpr02-khet',
  w: 44,
  advice: 'Across the fields on stilts: over the low bund, a long jump over the canal (let go only at the very end), up the high bund, then the last canal by way of the post in the middle. Every landing: slow.',
  cps: [22.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 10, x + 11, 12, 14, '#').pit(x + 16, x + 18).fill(x + 26, x + 27, 10, 14, '#');
    g.pit(x + 31, x + 32).pit(x + 34, x + 35);
  },
  build: (w, c) => {
    const x = c.x;
    gedi(w, x + 2, x + 41);
    mud(w, x + 4, x + 9);
    mud(w, x + 12, x + 15);
    mud(w, x + 19, x + 25);
    mud(w, x + 28, x + 30);
    mud(w, x + 36, x + 39);
    sign(w, x + 21, 10.4, 3, 'KHET', 'shop', null, 'dhan');
  },
};

// ================================================================== RPR-03: Ghadi Chowk (time moves when you do)
/** the stage's clock */
export function ghadi(w: World, c = 3): Ghadi {
  if (!w.flags.ghadi) w.flags.ghadi = w.add(new Ghadi(px(c)));
  return w.flags.ghadi as Ghadi;
}
/** a clock hand pivoting `up` px above the floor at column c */
export function hand(w: World, c: number, len: number, period: number, phase = 0, up = 70) {
  return w.add(new Hand(ghadi(w), px(c), px(G) - up, len, period, phase));
}

function ghadiRoom(): LevelDef {
  return {
    id: 'RPR-03',
    city: 'RPR',
    index: 3,
    name: 'Ghadi Chowk',
    nameEn: 'Clock tower square',
    tagline: 'Raipur’s clock tower plays a folk song on the hour. Today it has stopped. So has everything else.',
    hint: 'Here time only moves when you do. Stand still and the great clock hands stop dead, so stop and look. If a hand is going to be in your way when you get there, jump on the spot: that winds the clock on without taking you anywhere.',
    par: 12,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const g = ghadi(w, 2);
      g.faces.push({ x: px(4), y: px(5), r: 14 });
      hand(w, 12, 62, 4, 0.37);
      hand(w, 22, 62, 3, 0.2);
      sign(w, 5.4, 10.4, 3.6, 'GHADI CHOWK', 'shop', null, 'Nagar Ghadi');
      rival(w, 3, 15, 1, tara(1, 1));
      onPass(w, px(5), (w2) => w2.guide('Ruk, dekh! Jagah ma kood! | Stop, look! Jump on the spot!'));
      collectible(w, 'chila', 17, 10.6);
    },
  };
}

/** RPR-03 act: a quick hand, a pair turning together, and a very long slow one. */
const chowk: Act = {
  id: 'rpr03-chowk',
  w: 44,
  advice: 'Three more: a quick hand, then two on one pivot (half the room to get by), then a very long one. Stop before each, see where it will be by the time you’re under it, and jump on the spot till it suits you.',
  cps: [16.5, 29.5],
  build: (w, c) => {
    const x = c.x;
    hand(w, x + 8, 60, 2.6, 0.5);
    hand(w, x + 22, 58, 4.4, 0.1);
    hand(w, x + 22, 58, 4.4, 0.6);
    hand(w, x + 36, 84, 5.2, 0.45, 92);
    sign(w, x + 13.6, 10.4, 3, 'SADAR', 'shop', null, 'bazaar');
  },
};

// ================================================================== RPR-04: Dhan (hills of rice)
/** a place for rice to lie: columns c0..c1 (the floor between walls) */
export function heap(w: World, c0: number, c1: number, floor = px(G)) {
  return w.add(new Heap(px(c0), (c1 - c0 + 1) * 2, floor));
}
/** a sack hanging over column c with its cord down to head height */
export function sack(w: World, c: number, h: Heap, vol: number, row = 4) {
  return w.add(new Sack(px(c) + 8, px(row), vol, h, px(G) - px(row) - 22));
}

function dhanRoom(): LevelDef {
  return {
    id: 'RPR-04',
    city: 'RPR',
    index: 4,
    name: 'Dhan ka Katora',
    nameEn: 'The rice bowl',
    tagline: 'Chhattisgarh grows so much rice they call it the bowl. Some of it is hanging over your head.',
    hint: 'Pull a sack’s red cord (just walk in to it) and it empties: the rice lies in a hill, slumping to its own slope, and you can walk up it. Stand under the sack and you ride up on the hill as it grows.',
    par: 14,
    map: Grid.ground(15).fill(16, 17, 10, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const h = heap(w, 3, 15);
      w.flags.heaps = [h];
      sack(w, 15, h, 6200);
      sign(w, 0.3, 10.4, 3.4, 'MANDI', 'shop', null, 'dhan kharidi');
      rival(w, 2, 15, 1, tara(2));
      onPass(w, px(11), (w2) => w2.guide('Laal dori khinch! | Pull the red cord!'));
      collectible(w, 'chila', 16.5, 7.6);
    },
  };
}

/** RPR-04 act: the kothi. A higher wall, then one whose sack is hung well short of it. */
const kothi: Act = {
  id: 'rpr04-kothi',
  w: 44,
  advice: 'Two more walls. The first is higher, with the sack right against it. The second sack hangs well short of its wall, so the hill has to spread: one sackful won’t do it, wait under it for the man to fill it again.',
  cps: [18.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 13, x + 14, 9, 14, '#').fill(x + 34, x + 35, 10, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const a = heap(w, x + 0, x + 12);
    sack(w, x + 12, a, 8600);
    const b = heap(w, x + 16, x + 33);
    const s = sack(w, x + 30, b, 6400);
    // the mandi man keeps filling this one
    w.add(
      new (class extends Entity {
        private t = 0;
        update() {
          if (s.open && s.left <= 0 && b.topAt(px(x + 33) + 12) > px(10) + 4) {
            if (++this.t > 90) {
              this.t = 0;
              s.left = s.vol;
            }
          }
        }
      })(),
    );
    sign(w, x + 19, 10.4, 3, 'KOTHI', 'shop', null, 'godown 2');
  },
};

// ================================================================== RPR-05: Bhaunra (the spinning tops)
export function top(w: World, c: number, o: ConstructorParameters<typeof Top>[2] = {}, floor = px(G)) {
  return w.add(new Top(px(c) + 8, floor, o));
}

function bhaunraRoom(): LevelDef {
  return {
    id: 'RPR-05',
    city: 'RPR',
    index: 5,
    name: 'Bhaunra',
    nameEn: 'The spinning tops',
    tagline: 'Every Chhattisgarhi child can keep a bhaunra spinning all afternoon. These ones are rather large.',
    hint: 'A top spinning fast stands still and you can stand on its crown. As it slows it wanders in wider and wider circles and then falls over. Landing on one whips it back up to speed, so don’t stand about: hop. A fallen one gets set going again after a bit.',
    par: 10,
    map: Grid.ground(15).pit(8, 21).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.tops = [top(w, 10.5, {}, px(G) + 20), top(w, 14.5, {}, px(G) + 20), top(w, 18.5, {}, px(G) + 20)];
      sign(w, 0.4, 10.4, 3.4, 'BHAUNRA', 'shop', null, 'khel mela');
      rival(w, 4, 15, 1, tara(3, 1));
      collectible(w, 'chila', 14.5, 9.4);
    },
  };
}

/** RPR-05 act: three with one already slowing; then three that get taller, up to a ledge. */
const mela: Act = {
  id: 'rpr05-mela',
  w: 46,
  advice: 'Three tops with the middle one already slowing and wandering: land on it and it steadies. Then three that get taller each time, the last your step up on to the ledge. A fallen top comes back: wait on the one you’re on, hopping to keep it going.',
  cps: [19.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 17).pit(x + 22, x + 37).fill(x + 38, x + 40, 12, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const f = px(G) + 20;
    top(w, x + 6.5, {}, f);
    top(w, x + 10.5, { s: 0.55, phase: 1 }, f);
    top(w, x + 14.5, {}, f);
    top(w, x + 24.5, {}, f);
    top(w, x + 29, { h: 56, s: 0.7, phase: 2 }, f);
    top(w, x + 33.5, { h: 66 }, f);
    sign(w, x + 19, 10.4, 3, 'MELA', 'shop', null, 'bati-bhaunra');
  },
};

// ================================================================== RPR-06: Kosa (the cocoon)
/** the stage's cocoon-spinning */
export function kosa(w: World): Kosa {
  if (!w.flags.kosaEnt) w.flags.kosaEnt = w.add(new Kosa());
  return w.flags.kosaEnt as Kosa;
}
/** hornets down the path from column c1 to c0, every `every` seconds */
export function swarm(w: World, c0: number, c1: number, every: number, phase = 0, floor = px(G)) {
  return w.add(new Swarm(px(c1), px(c0), floor, { every, phase }));
}
export function baaj(w: World, ca: number, cb: number, speed = 60, start = 0) {
  return w.add(new Baaj(px(ca), px(cb), px(G) - 74, px(G), speed, start));
}

function kosaRoom(): LevelDef {
  return {
    id: 'RPR-06',
    city: 'RPR',
    index: 6,
    name: 'Kosa',
    nameEn: 'Tussar silk',
    tagline: 'Champa’s kosa silk comes from wild cocoons in the sal forest. The forest also has hornets.',
    hint: 'Stand quite still for a moment (touch nothing) and you’re wrapped in a cocoon that nothing gets through. A cloud of hornets comes down the path every few seconds, too tall to jump: be still before it reaches you. Any button and the cocoon splits.',
    par: 12,
    scene: { kind: 'hills', place: 'Sal forest', sky: ['#5E9C6A', '#A9D6A0', '#EAF3C8'], with: ['sal'] },
    map: Grid.ground(15).pit(14, 15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      kosa(w);
      w.flags.swarms = [swarm(w, 0, 32, 4.6, 3.4)];
      sign(w, 0.3, 10.4, 3, 'KOSA', 'shop', null, 'Champa silk');
      rival(w, 3, 15, 1, tara(4));
      onPass(w, px(5), (w2) => w2.guide('Bhanwra aavat he! Chup khade raha! | Hornets coming! Stand still!'));
      collectible(w, 'chila', 14.5, 11);
    },
  };
}

/** RPR-06 act: hornets all the way, and two hawks that like a cocoon. */
const jungle: Act = {
  id: 'rpr06-jungle',
  w: 46,
  advice: 'The hornets keep coming, and now there are hawks: a hawk ignores a man but takes a cocoon. So under a hawk’s patch keep moving, and wrap up only where it can’t see you, or when it’s at the far end of its beat.',
  cps: [12.5, 30.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 8, x + 9).pit(x + 28, x + 29);
  },
  build: (w, c) => {
    const x = c.x;
    swarm(w, x - 2, x + 48, 4.2, 1.0);
    baaj(w, x + 16, x + 26, 60, 0.3);
    baaj(w, x + 35, x + 43, 76, 0.7);
    sign(w, x + 11, 10.4, 3, 'JUNGLE', 'shop', null, 'saal van');
  },
};

// ================================================================== RPR-07: Chapda (the red ants' bridge)
/** the red ants bridge the pit at columns c0..c1 */
export function chapda(w: World, c0: number, c1: number) {
  return w.add(new Chapda(px(c0), px(c1 + 1), px(G)));
}

function chapdaRoom(): LevelDef {
  return {
    id: 'RPR-07',
    city: 'RPR',
    index: 7,
    name: 'Chapda',
    nameEn: 'The red ants',
    tagline: 'Bastar makes chutney out of red weaver ants. The ants make bridges out of themselves.',
    hint: 'Wait at the edge of the gap and the red ants come out from the far side, linked in to a bridge. Wait till it reaches you, then run across without stopping: they bite, and a second on them is all anyone can stand. Keep them waiting too long and they come for you.',
    par: 12,
    scene: { kind: 'hills', place: 'Bastar', sky: ['#5E9C6A', '#A9D6A0', '#EAF3C8'], with: ['sal'] },
    map: Grid.ground(15).pit(10, 16).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.ants = [chapda(w, 10, 16)];
      sign(w, 0.3, 10.4, 3.2, 'BASTAR', 'shop', null, 'haat bazaar');
      rival(w, 3, 15, 1, tara(5, 1));
      onPass(w, px(6), (w2) => w2.guide('Tir ma ruk, chanti aahi! | Wait at the edge, the ants will come!'));
      collectible(w, 'chila', 13.5, 11.6);
    },
  };
}

/** RPR-07 act: a longer gap, two with a little island between, and a wide one with a post half way. */
const saal: Act = {
  id: 'rpr07-saal',
  w: 48,
  advice: 'A longer gap: go the instant the bridge touches your bank. Then two gaps with a small island between: stand on the island till the second bridge is whole (the bites wear off). Then a wide one with a single post in the middle: same again, on the post.',
  cps: [13.5, 30.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 11).pit(x + 17, x + 21).pit(x + 24, x + 28).pit(x + 33, x + 37).pit(x + 39, x + 43);
  },
  build: (w, c) => {
    const x = c.x;
    chapda(w, x + 4, x + 11);
    chapda(w, x + 17, x + 21);
    chapda(w, x + 24, x + 28);
    chapda(w, x + 33, x + 37);
    chapda(w, x + 39, x + 43);
    sign(w, x + 13.4, 10.4, 3, 'SAAL', 'shop', null, 'van');
  },
};

// ================================================================== RPR-08: Bastar Dussehra (everything)
function dussehraRoom(): LevelDef {
  return {
    id: 'RPR-08',
    city: 'RPR',
    index: 8,
    name: 'Bastar Dussehra',
    nameEn: 'The seventy-five day festival',
    tagline: 'The longest Dussehra in the world: seventy-five days, and a wooden chariot the whole town pulls.',
    hint: 'Stilts through the mud again, and the hornets are out: you can wrap up in a cocoon on stilts, standing in the mud. Stop in good time, and still let go before every landing.',
    par: 16,
    scene: { kind: 'hills', place: 'Jagdalpur', sky: ['#5E9C6A', '#A9D6A0', '#EAF3C8'], with: ['sal'] },
    map: Grid.ground(15).fill(14, 15, 11, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      kosa(w);
      gedi(w, 4, 27);
      mud(w, 6, 13);
      mud(w, 16, 25);
      swarm(w, 0, 32, 5.2, 3.2);
      sign(w, 0.3, 10.4, 3.6, 'JAGDALPUR', 'shop', null, 'Dussehra');
      rival(w, 2, 15, 1, tara(6));
      collectible(w, 'chila', 14.5, 7.6);
    },
  };
}

/** RPR-08 act: a clock hand, a wall of rice, tops over a drop, and the ants. */
const dussehra: Act = {
  id: 'rpr08-dussehra',
  w: 62,
  advice: 'All of Chhattisgarh on the way to the chariot: a clock hand (time only moves when you do), a sack of rice for the wall, three tops over the drop, and the red ants’ bridge.',
  cps: [12.5, 27.5, 46.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 24, x + 25, 10, 14, '#').pit(x + 30, x + 43).pit(x + 50, x + 56);
  },
  build: (w, c) => {
    const x = c.x;
    const g = w.add(new Ghadi(px(x)));
    w.add(new Hand(g, px(x + 6), px(G) - 70, 62, 3.6, 0.3));
    w.flags.ghadi2 = g;
    const h = heap(w, x + 13, x + 23);
    sack(w, x + 23, h, 6200);
    const f = px(G) + 20;
    top(w, x + 32.5, {}, f);
    top(w, x + 36.5, { s: 0.6 }, f);
    top(w, x + 40.5, {}, f);
    chapda(w, x + 50, x + 56);
  },
};

export const RPR: LevelDef[] = [
  tour({
    id: 'RPR-01',
    city: 'RPR',
    name: 'Jai Johar, Raipur!',
    nameEn: 'Greetings, Raipur!',
    tagline: 'The capital of the rice bowl, on the way to the forests of Bastar.',
    lines: [
      'Jai Johar, Dad! Raipur ma swagat he! | Greetings, Dad! Welcome to Raipur!',
      'Chhattisgarh la dhan ke katora kaheth! | They call Chhattisgarh the bowl of rice!',
      'Ghadi Chowk ke ghadi har ghanta lok geet bajathe! | The clock tower plays a folk song every hour!',
      'Hareli ma sab jhan gedi chadhthe! | At Hareli everyone gets up on stilts!',
      'Bastar ke Dussehra pachhattar din chalthe! | Bastar’s Dussehra goes on for seventy-five days!',
      'Chal Dad, asli khel! | Come on Dad, the real game!',
    ],
    shouts: [
      [21, 'Garam chila! Fara! | Hot chila! Fara!'],
      [84, 'Gaadi aavat he, sangwari! | Train’s coming, friend!'],
    ],
    ride: 'cart',
    item: 'chila',
    signs: [
      [8, 'GHADI CHOWK', 'Nagar Ghadi'],
      [55, 'TELIBANDHA', 'talab'],
      [102, 'MANDI', 'dhan kharidi'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'CHILA' }],
      ['crowd', 33, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({ base: hareliRoom(), par: 36, acts: [khet], twist: 'utar' }),
  longStage({ base: ghadiRoom(), par: 40, acts: [chowk], twist: 'ghanta' }),
  longStage({ base: dhanRoom(), par: 60, acts: [kothi], twist: 'khisko' }),
  longStage({ base: bhaunraRoom(), par: 36, acts: [mela], twist: 'lattu' }),
  longStage({ base: kosaRoom(), par: 44, acts: [jungle], twist: 'reel' }),
  longStage({ base: chapdaRoom(), par: 50, acts: [saal], twist: 'gud' }),
  longStage({ base: dussehraRoom(), par: 80, acts: [dussehra], twist: 'rath' }),
];
