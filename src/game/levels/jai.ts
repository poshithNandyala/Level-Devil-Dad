// Jaipur (and its Rajasthan): kathputli strings, pots on your head in the Hawa Mahal, the marble bowls
// of Jantar Mantar, a lac bangle to roll in, the Kachchhi Ghodi horse dance, a balloon at night, and Amer.
import { type LevelDef, type World } from '../world';
import { LINES } from '../cities';
import { collectible, door, prop, px, rival, sign } from './kit';
import type { Act } from './acts';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { Paint } from './endkit';
import { Balloon, Bangle, Board, Bowl, Elephant, Ghodi, Pots, Rocket, Shards, Strings, Talwar, breezeArt, stageArt } from '../entities/rajasthan';
import { Entity } from '../world';
import { Solid } from '../body';

const TAUNTS = LINES.JAI.taunt;
const G = 15;

// ================================================================== JAI-02: Kathputli (the strings)
/** a puppet stage between two columns: the theatre drawn behind, the strings entity over it */
function puppetStage(w: World, c0: number, c1: number, pattern: number[], phase = 0.6) {
  w.add(new Paint((ctx) => stageArt(ctx, px(c0), px(c1), px(3), px(G)), -3));
  return w.add(new Strings(px(c0), px(c1), px(3), { pattern, phase }));
}

function kathputliRoom(): LevelDef {
  return {
    id: 'JAI-02',
    city: 'JAI',
    index: 2,
    name: 'Kathputli',
    nameEn: 'The puppet show',
    tagline: 'Rajasthan’s string puppets dance to the dholak. Tonight Dad is one of them.',
    hint: 'On the puppet stage you’re on strings: your own jump does nothing, and on every beat of the dholak the puppeteer jerks you up. Walk so the beat comes just as you reach a gap, and never be under the spiky beam on a beat. Listen: every third beat is a long one.',
    par: 10,
    map: Grid.ground(15).pit(10, 12).pit(17, 18).fill(21, 22, 11, 11, 'v').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.strings = [puppetStage(w, 5, 28, [0.8, 0.8, 1.6])];
      sign(w, 1.2, 10.4, 4.2, 'KATHPUTLI', 'shop', null, 'puppet show 7 pm');
      prop(w, 'bulbs', 16, 3);
      rival(w, 3, 15, 1, { intro: LINES.JAI.intro[0], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[0] });
      onPass(w, px(5), (w2) => w2.guide('Dhol ri thaap pe uchhlo! | You jump on the drum beat!'));
      collectible(w, 'ghevar', 14.5, 11.6);
    },
  };
}

/** JAI-02 act: the full show. A quicker beat (three short, one long), a step to hop up, a gap from the
 *  top of it, a spiky beam, and two gaps one beat apart. */
const show: Act = {
  id: 'jai02-show',
  w: 40,
  advice: 'In the full show the beat is quicker (three short, one long): hop up the step, cross the gap from the top of it, slip under the spiky beam on the long beat, and take the double gap on two beats in a row.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 6, x + 10, 13, 14, '#').pit(x + 11, x + 13).fill(x + 14, x + 17, 13, 14, '#').fill(x + 21, x + 22, 11, 11, 'v');
    g.pit(x + 27, x + 29).pit(x + 32, x + 34);
  },
  build: (w, c) => {
    w.flags.show = puppetStage(w, c.x + 2, c.x + 38, [0.6, 0.6, 0.6, 1.2], 0.3);
    sign(w, c.x + 0.2, 10.4, 4, 'SHOW', 'shop', null, 'house full');
    onPass(w, c.X(3), (w2) => w2.guide('Teen chhoti, ek lambi! | Three short, one long!'));
  },
};

// ================================================================== JAI-03: Hawa Mahal (the pots)
/** the Hawa Mahal's honeycomb facade drawn over a stretch: pink tiers of little arched windows */
function facade(w: World, x0: number, x1: number, top: number, bottom: number) {
  w.add(
    new Paint((ctx) => {
      ctx.fillStyle = '#E0907E';
      ctx.fillRect(x0, top, x1 - x0, bottom - top);
      for (let y = top + 6, r = 0; y < bottom - 10; y += 18, r++) {
        ctx.fillStyle = r % 2 ? 'rgba(160,70,60,0.25)' : 'rgba(255,255,255,0.12)';
        ctx.fillRect(x0, y - 4, x1 - x0, 2);
        for (let x = x0 + 4 + (r % 2) * 5; x < x1 - 8; x += 10) {
          ctx.fillStyle = '#F8EDE6';
          ctx.beginPath();
          ctx.moveTo(x, y + 10);
          ctx.lineTo(x, y + 4);
          ctx.quadraticCurveTo(x + 3.5, y - 1, x + 7, y + 4);
          ctx.lineTo(x + 7, y + 10);
          ctx.fill();
          ctx.fillStyle = '#7A3B32';
          ctx.fillRect(x + 1.5, y + 4.5, 4, 5.5);
        }
      }
    }, -3),
  );
}

function breeze(w: World, pots: Pots, b: Pots['breezes'][number]) {
  pots.breezes.push(b);
  w.add(new Paint((ctx, w2) => breezeArt(ctx, b, pots.blowing(b, w2.tick / 120), w2.tick / 120, px(6), px(14)), 5));
}

function hawaRoom(): LevelDef {
  return {
    id: 'JAI-03',
    city: 'JAI',
    index: 3,
    name: 'Hawa Mahal',
    nameEn: 'The Palace of Winds',
    tagline: '953 little windows to catch the breeze. And a Bhavai dancer’s tower of pots, on your head.',
    hint: 'The tower of pots on your head sways like a pendulum: every start, stop and turn kicks it the other way, and a landing tips it further. Let it settle before you jump, cross the windows’ breeze while it’s calm, and if it leans too far, it all comes down.',
    par: 12,
    map: Grid.ground(15).fill(8, 27, 13, 14, '#').fill(22, 23, 13, 17, '.').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      facade(w, px(6), px(30), px(2), px(13));
      const pots = w.add(new Pots(4));
      w.flags.pots = pots;
      breeze(w, pots, { x0: px(12), x1: px(19), dir: -1, every: 4, on: 2, phase: 1.5 });
      sign(w, 0.6, 10.4, 4, 'HAWA MAHAL', 'shop', null, '1799');
      rival(w, 4, 15, 1, { intro: LINES.JAI.intro[1], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[1] });
      w.after(2.4, () => w.guide('Dheere chaalo, matka hile! | Walk gently, the pots sway!'));
      collectible(w, 'ghevar', 16, 10.6);
    },
  };
}

/** JAI-03 act: up the palace's levels. A step, a higher step in a breeze blowing the other way, a gap,
 *  another breeze, and down again. */
const zenana: Act = {
  id: 'jai03-zenana',
  w: 40,
  advice: 'Up through the zenana’s levels: the breezes blow both ways now. Before every jump, let the pots settle; cross each breeze when it’s calm.',
  cps: [14.5, 29.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 6, x + 9, 13, 14, '#').fill(x + 10, x + 17, 11, 14, '#').fill(x + 20, x + 25, 11, 14, '#').fill(x + 26, x + 31, 13, 14, '#');
    g.fill(x + 18, x + 19, 11, 17, '.').fill(x + 32, x + 33, 13, 17, '.');
  },
  build: (w, c) => {
    const { X } = c;
    facade(w, X(4), X(38), px(1), px(11));
    const pots = w.flags.pots as Pots;
    breeze(w, pots, { x0: X(10), x1: X(17), dir: 1, every: 3.6, on: 1.8, phase: 0.6 });
    breeze(w, pots, { x0: X(20), x1: X(26), dir: -1, every: 3, on: 1.4, phase: 1.9 });
    onPass(w, X(2), (w2) => w2.guide('Hawa banne taraf su! | Breeze from both sides!'));
  },
};

// ================================================================== JAI-04: Jantar Mantar (the bowls)
/** a marble bowl `half` px either side of world x `bx`, `depth` px deep down to the floor at row G */
export function bowl(w: World, bx: number, half: number, depth: number, o: { hatch?: boolean } = {}) {
  // a circle through both rims and the bottom
  const R = (half * half + depth * depth) / (2 * depth);
  const max = Math.asin(half / R);
  // a diving board from the near rim out to just short of the middle: you drop in near the bottom
  w.add(new Board(bx - half, px(G) - depth, half - 32));
  return w.add(new Bowl(bx, px(G), R, max, max, o));
}

function yantraRoom(): LevelDef {
  return {
    id: 'JAI-04',
    city: 'JAI',
    index: 4,
    name: 'Jantar Mantar',
    nameEn: 'The instruments',
    tagline: 'Giant stone instruments for reading the sky. One of them is a marble bowl you can’t climb out of.',
    hint: 'In the Jai Prakash Yantra’s marble bowl you slide like a marble: the slope pulls you back to the bottom, and left or right only gives you a push. Push the way you’re already going, every swing, and it builds till you fly out over the rim.',
    par: 12,
    scene: { kind: 'rock', place: 'Jantar Mantar', sky: ['#5B9BD5', '#A9D0EE', '#F6E3D0'], with: ['yantra'] },
    map: Grid.ground(15).fill(2, 3, 13, 14, '#').fill(4, 7, 11, 14, '#').fill(20, 24, 11, 14, '#').fill(25, 26, 13, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.bowls = [bowl(w, px(14), 96, 64)];
      sign(w, 0.4, 10.4, 4.6, 'JANTAR MANTAR', 'shop', null, 'Jai Prakash Yantra');
      rival(w, 3, 13, 1, { intro: LINES.JAI.intro[2], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[0] });
      w.when(
        (w2) => (w2.flags.bowl ? true : false),
        (w2) => w2.guide('Jis taraf jaavo, us taraf dhakko! | Push the way you’re going!'),
      );
      collectible(w, 'ghevar', 14, 12.6);
    },
  };
}

/** JAI-04 act: a second bowl just like the first, then a deeper, wider one. */
const yantras: Act = {
  id: 'jai04-yantras',
  w: 44,
  advice: 'Then two more bowls, the second deeper and wider: it takes more swings to get out.',
  cps: [18.5, 36.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 2, 13, 14, '#').fill(x + 3, x + 5, 11, 14, '#').fill(x + 18, x + 19, 11, 14, '#').fill(x + 20, x + 21, 10, 14, '#');
    g.fill(x + 36, x + 39, 10, 14, '#').fill(x + 40, x + 41, 13, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    w.flags.yantras = [bowl(w, X(12), 96, 64), bowl(w, X(29), 112, 80)];
    sign(w, c.x + 7, 6, 4, 'KAPALI', 'shop', null, 'Yantra');
    onPass(w, X(20), (w2) => w2.guide('Yeh waala gehro hai! | This one’s deeper!'));
  },
};

// ================================================================== JAI-05: Maniharon ka Rasta (the bangle)
/** a giant lac bangle on its peg at tile column `c` */
export function bangle(w: World, c: number, hue?: string) {
  return w.add(new Bangle(px(c) + 8, px(G), 20, hue));
}
/** broken bangles all over the lane from column c0 to c1 (inclusive) */
export function shards(w: World, c0: number, c1: number) {
  return w.add(new Shards(px(c0), px(c1 + 1), px(G)));
}
/** a shop's shutter hanging half down at column `c`: Dad walks under it, a bangle is too tall */
export function shutter(w: World, c: number, clear = 30) {
  const x = px(c) + 2,
    y1 = px(G) - clear;
  w.add(
    new (class extends Entity {
      solid = new Solid(x, y1 - 110, 12, 110);
      layer = 2;
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#8D8D8D';
        ctx.fillRect(x, y1 - 110, 12, 110);
        ctx.fillStyle = '#6E6E6E';
        for (let y = y1 - 108; y < y1 - 2; y += 5) ctx.fillRect(x, y, 12, 1.5);
        ctx.fillStyle = '#E91E63';
        ctx.fillRect(x - 1, y1 - 3, 14, 3);
      }
    })(),
  );
}

function rastaRoom(): LevelDef {
  return {
    id: 'JAI-05',
    city: 'JAI',
    index: 5,
    name: 'Maniharon ka Rasta',
    nameEn: 'The bangle makers’ lane',
    tagline: 'A whole lane of lac bangles, and the floor is what’s left of the ones that broke.',
    hint: 'Walk in to the giant bangle and it rolls with you, right over the broken glass. It’s slow to get going and slow to stop: you need speed to skip a gap, but roll in to anything too fast and it shatters. Jump to hop out.',
    par: 12,
    map: Grid.ground(15).pit(16, 17).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.bangles = [bangle(w, 5)];
      shards(w, 8, 15);
      shards(w, 18, 21);
      shutter(w, 26);
      sign(w, 0.4, 10.4, 5.2, 'MANIHARON KA RASTA', 'shop', null, 'lac bangles');
      prop(w, 'bulbs', 12, 3);
      rival(w, 3, 15, 1, { intro: LINES.JAI.intro[3], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[1] });
      onPass(w, px(4), (w2) => w2.guide('Choodi mein ghus jaavo! | Step in to the bangle!'));
      onPass(w, px(22), (w2) => w2.guide('Dheere! Phoot jaasi! | Slow down! It’ll shatter!'));
      collectible(w, 'ghevar', 16.5, 12.4);
    },
  };
}

/** JAI-05 act: change bangles under a shutter, two gaps in a row with glass between, then brake for a step. */
const rasta: Act = {
  id: 'jai05-rasta',
  w: 46,
  advice: 'Down the lane: stop at the half-shut shutter, hop out, walk under and take the next bangle. Then two gaps with glass between them, so keep your speed up through both, and brake before the step at the end.',
  cps: [16.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 26, x + 27).pit(x + 32, x + 33).fill(x + 43, x + 45, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    bangle(w, x + 2, '#00897B');
    shards(w, x + 5, x + 10);
    shutter(w, x + 15);
    bangle(w, x + 18, '#F9A825');
    shards(w, x + 21, x + 25);
    shards(w, x + 28, x + 31);
    shards(w, x + 34, x + 37);
    sign(w, x + 11.5, 10.4, 3.4, 'CHOODI', 'shop', null, 'naya maal');
    onPass(w, px(x + 20), (w2) => w2.guide('Tez! Dono khadda ek saath! | Fast! Both gaps in one go!'));
  },
};

// ================================================================== JAI-06: Kachchhi Ghodi (the horse that won't stop)
/** the dummy horse on its stand at column c0; it comes off at column c1 */
export function ghodi(w: World, c0: number, c1: number) {
  return w.add(new Ghodi(px(c0) + 8, px(c1), px(G)));
}
/** a pair of sword dancers at column c */
export function talwar(w: World, c: number, every: number, on: number, phase = 0, floor = px(G)) {
  return w.add(new Talwar(px(c) + 8, floor, { every, on, phase }));
}

function ghodiRoom(): LevelDef {
  return {
    id: 'JAI-06',
    city: 'JAI',
    index: 6,
    name: 'Kachchhi Ghodi',
    nameEn: 'The dummy-horse dance',
    tagline: 'The dancers wear a horse round the waist and tell bandit tales with swords. The horse has ideas of its own.',
    hint: 'In the dummy horse you can’t stop: it gallops the way it faces. Press the other way and it rears up and gallops back, and a wall turns it round too. To wait for the sword dancers, turn round and come back.',
    par: 12,
    scene: { kind: 'night', place: 'Jaipur', with: ['mela'] },
    map: Grid.ground(15).fill(9, 9, 14, 14, '#').pit(13, 15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.ghodi0 = ghodi(w, 4, 26);
      w.flags.talwars = [talwar(w, 21, 2.4, 1.3, 0.2)];
      sign(w, 0.3, 10.4, 4.6, 'KACHCHHI GHODI', 'shop', null, 'aaj raat');
      prop(w, 'bulbs', 10, 3);
      prop(w, 'bulbs', 22, 3);
      rival(w, 2, 15, 1, { intro: LINES.JAI.intro[4], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[0] });
      onPass(w, px(4), (w2) => w2.guide('Ghodi rukti koni! | The horse won’t stop!'));
      onPass(w, px(16), (w2) => w2.guide('Ulta dabao, ghoom jaasi! | Press back, she turns round!'));
      collectible(w, 'ghevar', 14.5, 10.6);
    },
  };
}

/** JAI-06 act: the mela. Two drums in a stride, a long jump, swords, stairs taken at a gallop, and
 *  swords again seen from the top. */
const mela: Act = {
  id: 'jai06-mela',
  w: 48,
  advice: 'Through the fair at a gallop: two drums close together, a wide gap (hold the jump), sword dancers, then stairs you have to jump on the run (hit a riser and the horse turns round), and one more pair of swords.',
  // no checkpoints part-way: you'd come back at a gallop
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 7, x + 7, 14, 14, '#').fill(x + 10, x + 10, 14, 14, '#').pit(x + 14, x + 17);
    g.fill(x + 29, x + 31, 14, 14, '#').fill(x + 32, x + 37, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    ghodi(w, x + 2, x + 45);
    talwar(w, x + 23, 2.0, 1.0, 0.7);
    talwar(w, x + 42, 2.2, 1.2, 0.1);
    sign(w, x + 24.5, 10.4, 3.4, 'MELA', 'shop', null, 'jhoola 10/-');
    prop(w, 'bulbs', x + 12, 3);
    prop(w, 'bulbs', x + 34, 3);
  },
};

// ================================================================== JAI-07: Balloon ki Raat (pick your wind)
/** the winds over Jaipur tonight: high goes right fast, the middle goes back left, low drifts right */
export const WINDS = [
  { below: 112, vx: 110 },
  { below: 176, vx: -70 },
  { below: 999, vx: 50 },
];
/** a balloon waiting at column c; Dad gets out when it settles between columns l0 and l1 */
export function balloon(w: World, c: number, l0: number, l1: number, hue?: string, floor = px(G)) {
  return w.add(new Balloon(px(c) + 8, floor, WINDS, { x0: px(l0), x1: px(l1) }, hue));
}
/** a Diwali rocket standing at column c */
export function rocket(w: World, c: number, every: number, phase = 0) {
  return w.add(new Rocket(px(c) + 8, px(G), 28, { every, phase }));
}

function balloonRoom(): LevelDef {
  return {
    id: 'JAI-07',
    city: 'JAI',
    index: 7,
    name: 'Balloon ki Raat',
    nameEn: 'Balloon night',
    tagline: 'Diwali night over the Pink City, in a hot-air balloon. There is no steering wheel.',
    hint: 'In the balloon, left and right do nothing. Hold jump to burn and climb, let go to sink, and the wind takes you: up high it blows right, in the middle it blows back left, down low it drifts right. To wait for a rocket, dip in to the middle wind.',
    par: 14,
    scene: { kind: 'night', place: 'Jaipur', with: ['diwali'] },
    map: Grid.ground(15).fill(14, 15, 8, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.balloons = [balloon(w, 4, 20, 29)];
      w.flags.rockets = [rocket(w, 19, 2.6, 0.4)];
      sign(w, 0.3, 10.4, 4.2, 'SKY WALTZ', 'shop', null, 'balloon safari');
      rival(w, 2, 15, 1, { intro: LINES.JAI.intro[5], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[1] });
      w.when(
        (w2) => !!w2.flags.balloon,
        (w2) => w2.guide('Jump dabao: upar! Chhodo: neeche! | Hold jump: up! Let go: down!'),
      );
      collectible(w, 'ghevar', 9, 8.6);
    },
  };
}

/** JAI-07 act: two flights. Under a palace canopy down low and past a rocket, over a wall; then a
 *  taller wall and two rockets with a short hop of sky between them. */
const udaan: Act = {
  id: 'jai07-udaan',
  w: 62,
  advice: 'Two flights: stay low under the canopy, wait for the rocket by dipping up in to the middle wind (it carries you back), then climb over the wall and land. The second balloon has a taller wall and two rockets close together.',
  cps: [30.5],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 7, x + 12, 0, 9, '#').fill(x + 25, x + 26, 8, 14, '#');
    g.fill(x + 40, x + 41, 7, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    balloon(w, x + 2, x + 28, x + 33, '#00897B');
    rocket(w, x + 19, 2.4, 0.2);
    balloon(w, x + 35, x + 53, x + 60, '#F9A825');
    rocket(w, x + 45, 2.4, 0.9);
    rocket(w, x + 49, 2.4, 2.1);
    sign(w, x + 29, 10.4, 3.6, 'UTARO', 'shop', null, 'land here');
  },
};

// ================================================================== JAI-08: Amer (the elephant, and everything else)
/** an Amer elephant standing at column c */
export function haathi(w: World, c: number) {
  return w.add(new Elephant(px(c), px(G)));
}

function amerRoom(): LevelDef {
  return {
    id: 'JAI-08',
    city: 'JAI',
    index: 8,
    name: 'Amer',
    nameEn: 'The fort on the hill',
    tagline: 'Up to Amer fort the old way: by elephant. She’s friendly. Too friendly.',
    hint: 'Jump on the elephant’s back and you’re the mahout: she walks the way you press, till a wall stops her, and then she’s your step up. On the ground she follows you about. Just don’t dawdle in front of her trunk, or she’ll pick you up and toss you over her back.',
    par: 16,
    scene: { kind: 'hills', place: 'Amer', sky: ['#7FB6DE', '#C4DFF0', '#F5E6C8'], with: ['amer'] },
    map: Grid.ground(15).fill(18, 19, 10, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.haathis = [haathi(w, 6)];
      sign(w, 0.3, 10.4, 3.6, 'AMER', 'shop', null, 'haathi sawaari');
      rival(w, 3, 15, 1, { intro: LINES.JAI.intro[6], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.JAI.beaten[0] });
      onPass(w, px(2), (w2) => w2.guide('Peeth pe chadho, haanko! | Up on her back, and drive!'));
      w.when(
        (w2) => !!w2.flags.tossed,
        (w2) => w2.guide('Soond su uchhaal diyo! | She tossed you with her trunk!'),
      );
      collectible(w, 'ghevar', 19, 7.4);
    },
  };
}

/** JAI-08 act: all of Jaipur on the way up. The elephant for a wall; a bangle over glass and a gap; the
 *  horse past a drum and the swords; and out of a marble bowl. */
const amer: Act = {
  id: 'jai08-amer',
  w: 72,
  advice: 'The whole city on the way up: the elephant is your step over the wall, a bangle takes you over the glass and the gap (stop at the shutter), the horse gallops you past a drum and the swords, and you pump your way out of one last marble bowl.',
  cps: [15.5, 34.5, 50.3],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 12, x + 13, 10, 14, '#').pit(x + 25, x + 26).fill(x + 40, x + 40, 14, 14, '#');
    g.fill(x + 51, x + 52, 13, 14, '#').fill(x + 53, x + 54, 11, 14, '#');
    g.fill(x + 67, x + 68, 11, 14, '#').fill(x + 69, x + 70, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    haathi(w, x + 3);
    bangle(w, x + 17, '#00897B');
    shards(w, x + 19, x + 24);
    shards(w, x + 27, x + 29);
    shutter(w, x + 33);
    ghodi(w, x + 36, x + 49);
    talwar(w, x + 45, 2.2, 1.1, 0.5);
    bowl(w, c.X(61), 96, 64);
    sign(w, x + 14.5, 10.4, 3.4, 'CHOODI', 'shop', null, 'lac');
  },
};

export const JAI: LevelDef[] = [
  tour({
    id: 'JAI-01',
    city: 'JAI',
    name: 'Padharo Mhare Des',
    nameEn: 'Welcome to my land',
    tagline: 'The Pink City: painted terracotta pink in 1876 to welcome a prince, and pink ever since.',
    lines: [
      'Khamma ghani, Dad! Jaipur mein padharo! | Warm greetings, Dad! Welcome to Jaipur!',
      'Aakho shehar gulabi hai, 1876 su! | The whole city has been pink since 1876!',
      'Hawa Mahal mein nau so trepan jharokha! | The Hawa Mahal has 953 little windows!',
      'Jantar Mantar ri ghadi, suraj su chaale! | Jantar Mantar’s clock runs on the sun!',
      'Kathputli, ghevar, ghoomar, sab ahiya! | Puppets, ghevar, ghoomar, all of it here!',
      'Chaalo Dad, asli khel! | Come on Dad, the real game!',
    ],
    shouts: [
      [21, 'Garam pyaaz kachori! | Hot onion kachori!'],
      [84, 'Metro aayi! Jaldi! | The metro’s here! Quick!'],
    ],
    ride: 'cart',
    item: 'ghevar',
    signs: [
      [8, 'JOHARI BAZAAR', 'pink city'],
      [55, 'HAWA MAHAL', '953 windows'],
      [102, 'JANTAR MANTAR', 'UNESCO'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'KACHORI' }],
      ['crowd', 33, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: kathputliRoom(),
    par: 34,
    acts: [show],
    twist: 'sutradhar',
  }),
  longStage({
    base: hawaRoom(),
    par: 40,
    acts: [zenana],
    twist: 'toran',
  }),
  longStage({
    base: yantraRoom(),
    par: 36,
    acts: [yantras],
    twist: 'shant',
  }),
  longStage({
    base: rastaRoom(),
    par: 36,
    acts: [rasta],
    twist: 'naap',
  }),
  longStage({
    base: ghodiRoom(),
    par: 36,
    acts: [mela],
    twist: 'dulha',
  }),
  longStage({
    base: balloonRoom(),
    par: 44,
    acts: [udaan],
    twist: 'palat',
  }),
  longStage({
    base: amerRoom(),
    par: 60,
    acts: [amer],
    twist: 'salaami',
  }),
];
