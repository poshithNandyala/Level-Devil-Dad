// Kolkata: trams that still crawl, buses that never stop, College Street's books by the kilo, Howrah
// Bridge's porters, adda on the rok, the pandal's bamboo skeleton. 01 the welcome tour, 02-10 long stages
// (room + act + door ending), harder each time, 10 the finale. Slots: docs/allocation.json (CCU).
import { Entity, type LevelDef, type StageMeta, type World } from '../../world';
import { lines as L } from './lines';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { pool } from '../../levels/acts';
import { Bus, Rail, feet } from './entities';
import { NALA } from './endings';
import { Customer, Muck, Stack, Stall } from './books';
import { Junction, Points, Tram } from './tram';
import { BookPorter, ChaiBoard, Girders, Pointer, Porter, Road, SHORT, TALL } from './porters';
import { Adda, House, TeaSeller, Wash } from './adda';
import { ClothPanel, Decorator, Skeleton, Stakes } from './pandal';
import { Tin } from './muri';
import { Figure, Ghat } from './kumartuli';
import type { Act } from '../../levels/acts';

const tara = (n: number, beaten = 0) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[beaten % L.beaten.length] });
/** the allocation slot, plus the door ending's idea key (the uniqueness test reads `ending`) */
const meta = (family: string, betrayals: string[], ending: string): StageMeta => ({ family, betrayals, ending }) as StageMeta;

// ================================================================== CCU-02: Aaste! (the bus)
function aasteRoom(): LevelDef {
  return {
    id: 'CCU-02',
    city: 'CCU',
    index: 2,
    name: 'Aaste!',
    nameEn: 'Slowly!',
    tagline: 'A Kolkata private bus never really stops. The conductor slaps the side and shouts “aaste!”, it crawls for a moment, and you step off.',
    hint: 'The bus never stops, not even at the stop: step off at speed and you go flying. It only crawls when the conductor shouts “aaste!”, and then you walk off forwards, the way it’s going (backwards and you go over). The first “aaste” is for someone on the far side of the open drain: wait for the second one, over the pavement.',
    par: 10,
    map: Grid.ground(15).pit(17, 22).put(3, 13, '@').rows(),
    build(w: World) {
      w.add(new Bus({ x: px(3) - 2, go: (w2) => w2.tick > 90, slow: [[px(16), px(19.5)], [px(25), px(28.5)]], end: px(36), label: 'HOWRAH' }));
      pool(w, 17, 23, 16, { colors: NALA, cause: 'ccu-nala' });
      sign(w, 9, 10.4, 3.4, 'BUS STOP', 'green', null, 'Esplanade');
      rival(w, 10, 15, -1, tara(0));
      onPass(w, px(6), (w2) => w2.guide('Aaste, Dad, aaste! | Slowly, Dad, slowly!', (w3) => w3.player.cx < px(16)));
      collectible(w, 'ccu-jhalmuri', 20, 11.6);
    },
  };
}


// ================================================================== CCU-04: Boi Para (College Street)
/** a drain of muck between the stalls from column c0 to c1, with Dad's death told by how he got in */
export function boiDrain(w: World, c0: number, c1: number) {
  w.add(new Muck(px(c0), px(c1), (w2) => (w2.flags.yanked ? 'ccu-boi' : 'ccu-kada')));
}
function boiRoom(): LevelDef {
  return {
    id: 'CCU-04',
    city: 'CCU',
    index: 4,
    name: 'Boi Para',
    nameEn: 'Book Street',
    tagline: 'College Street: second-hand books by the bundle, stacked over the drain, and a seller who can find any title from the bottom of any pile.',
    hint: 'Watch the customers. When one points at a book, the seller pulls that book out: the stack drops by one, and so do you if you’re on it (and if you land on a pointed stack he pulls it at once). A stack of one goes from under you into the drain. Count the books under the finger: jump over a pointed one-book stack, but a pointed stack of two only drops to one and still holds you, so go on to it rather than wait where you are.',
    par: 12,
    map: Grid.ground(15).pit(6, 27).put(2, 14, '@').rows(),
    build(w: World) {
      w.add(new Stall(px(6), px(28), 'BOI PARA'));
      boiDrain(w, 6, 28);
      const s = [
        [7, 2, 2],
        [10, 1, 1],
        [12, 2, 1],
        [16, 2, 2],
        [20, 2, 1],
        [24, 2, 2],
      ].map(([c, wd, n]) => w.add(new Stack(px(c), px(wd), n)));
      const a = w.add(new Customer(px(10) + 8, '#7B8D6E'));
      const b = w.add(new Customer(px(17), '#A0522D'));
      w.flags.stacks = s;
      onPass(w, px(4), (w2) => a.ask(w2, s[1], 1, 4));
      // on the third stack: the next one is asked for, and a moment later, the one you're standing on
      w.when(
        (w2) => w2.player.onGround && w2.player.isRiding(s[2].solid),
        (w2) => {
          b.ask(w2, s[3], 2, 3);
          w2.after(0.9, () => a.ask(w2, s[2], 1, 1.0));
        },
      );
      sign(w, 1.2, 10.4, 3.6, 'COLLEGE ST', 'green', null, 'boi para');
      rival(w, 3, 15, 1, tara(2));
      onPass(w, px(3.5), (w2) => w2.guide('Ei je, shunun! | Excuse me, listen!', (w3) => w3.player.cx < px(7)));
      collectible(w, 'ccu-roll', 22, 11.8);
    },
  };
}


// ================================================================== CCU-06: Trolley Pole (the tram)
const khod = (w: World, c0: number, c1: number) => w.add(new Muck(px(c0), px(c1), (w2) => (w2.flags.switched ? 'ccu-points' : 'ccu-khod')));
function poleRoom(): LevelDef {
  return {
    id: 'CCU-06',
    city: 'CCU',
    index: 6,
    name: 'Trolley Pole',
    nameEn: 'The tram’s pole',
    tagline: 'Asia’s oldest trams still run here, slower than walking, on a pole that touches a wire. At the junctions in the wire, the pole sometimes jumps off.',
    hint: 'The road is dug up: ride the tram. At the junction in the overhead wire the pole jumps the wire, the tram stops dead and the pole swings forward right over the roof. Ride on the open rear step instead (hop on to it from the road), not on the roof.',
    par: 14,
    map: Grid.ground(15).fill(4, 4, 13, 14, '#').fill(5, 6, 12, 12, '=').pit(11, 31).put(1, 14, '@').rows(),
    build(w: World) {
      khod(w, 11, 32);
      w.add(new Junction(px(24)));
      sign(w, 8.2, 8.4, 3.6, 'TRAM STOP', 'green', null, 'route 5');
      rival(w, 2, 15, 1, tara(4));
      onPass(w, px(3), (w2) => w2.guide('Tram! Ei je, shunun! | The tram! Excuse me, listen!', (w3) => !w3.flags.tramA?.riding(w3)));
      collectible(w, 'ccu-sandesh', 19, 9.2);
    },
  };
}

/** CCU-06 act: the island stop, the points, and the tram that goes straight on */
const points: Act = {
  id: 'ccu06-points',
  w: 48,
  cp0: false,
  cps: [8],
  advice: 'At the island stop, look at the pointsman: his lever is set for the other line, and this tram turns off there, step and all. Get off at the island and wait. The next tram comes along the straight line: hop on its step and stay on it through the second junction.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 3).pit(c.x + 10, c.x + 47);
  },
  build: (w, c) => {
    const x = c.x;
    khod(w, x, x + 4);
    khod(w, x + 10, x + 48);
    w.add(new Junction(c.X(30)));
    w.add(new Points(c.X(16), true));
    sign(w, x + 6.2, 8.4, 3.6, 'TRAM STOP', 'green', null, 'island');
    const a = w.add(new Tram({ x: px(7), speed: 56, stops: [{ x: px(7), dwell: 0.6, ride: true }, { x: c.X(5) - 2, dwell: 1.8 }], junctions: [px(24)], turnAt: c.X(14), label: '5' }));
    w.flags.tramA = a;
    w.when(
      (w2) => (a.state === 'turn' || a.state === 'gone') && w2.player.onGround && w2.player.cx > c.X(4) && w2.player.cx < c.X(10) && !a.riding(w2),
      (w2) => {
        const b = w2.add(new Tram({ x: c.X(4) - 300, speed: 70, stops: [{ x: c.X(5) - 2, dwell: 0.8, ride: true }], junctions: [c.X(30)], end: w2.flags.terminus, label: '25' }));
        w2.flags.tramB = b;
      },
    );
  },
};


// ================================================================== CCU-07: Howrah Bridge (the porters)
const road = (w: World, x0: number, x1: number) => w.add(new Road(x0, x1, (w2) => (w2.flags.cha ? 'ccu-cha' : 'ccu-gaari')));
const walking = (p: Porter) => () => p.state !== 'idle';
function howrahRoom(): LevelDef {
  return {
    id: 'CCU-07',
    city: 'CCU',
    index: 7,
    name: 'Howrah Bridge',
    nameEn: 'The porters’ bridge',
    tagline: 'A hundred thousand vehicles and more people than that cross Howrah Bridge every day, and the porters carry the city across on their heads.',
    hint: 'The road is nose-to-tail taxis: ride the head-loads. A porter stops at the CHA board on the girder and sets his load down for tea, and on the road that’s you among the taxis: before his chai stop, hop on to the next load going your way. A load coming the other way knocks you off yours, so never jump at one of those.',
    par: 16,
    map: Grid.ground(15).fill(28, 31, 14, 14, '#').put(1, 14, '@').rows(),
    build(w: World) {
      w.add(new Girders(0, px(32)));
      road(w, px(6), px(28));
      const p1 = w.add(new Porter({ x: px(5), v: 40, h: SHORT, rests: [[px(21), 3]], go: (w2, me) => w2.player.isRiding(me.load) }));
      w.add(new Porter({ x: px(-2.5), v: 60, h: TALL, rests: [[px(30.5), Infinity]], go: walking(p1) }));
      w.add(new Porter({ x: px(23), v: -45, h: TALL, go: walking(p1), off: px(6) }));
      w.add(new ChaiBoard(px(21)));
      w.add(new ChaiBoard(px(30.5), true));
      sign(w, 0.4, 10.4, 3.4, 'HOWRAH', 'green', null, '705 m');
      rival(w, 2, 15, 1, tara(5));
      onPass(w, px(2.5), (w2) => w2.guide('Howrah, Howrah, Howrah! | Howrah, Howrah, Howrah!'));
      collectible(w, 'ccu-bhanr', 30, 10.2);
    },
  };
}

/** CCU-07 act 1: a tall porter from the pylon, and a short one overtaking under him before his chai stop */
const girder: Act = {
  id: 'ccu07-girder',
  w: 48,
  advice: 'From the pylon step, on to the tall porter’s load. His chai stop is ahead on the road: a short porter comes up from behind, faster, and passes under you. Walk off the front of your load on to his as he goes by.',
  paint: (g, c) => {
    g.fill(c.x, c.x + 3, 14, 14, '#').fill(c.x + 1, c.x + 3, 13, 13, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Girders(c.X(0), c.X(48)));
    road(w, c.X(4), c.X(48));
    const p3 = w.add(new Porter({ x: c.X(5), v: 45, h: TALL, rests: [[c.X(30), 3]], go: (w2, me) => w2.player.isRiding(me.load) }));
    w.add(new Porter({ x: c.X(-2), v: 66, h: SHORT, rests: [[c.X(51.5), Infinity]], go: walking(p3) }));
    w.add(new ChaiBoard(c.X(30)));
    sign(w, x + 0.3, 8.6, 3.2, 'PYLON', 'green', null, 'east');
    w.flags.girder = { x };
  },
};

/** CCU-07 act 2: the second pylon, a porter who leaves at once (and stops for tea at once), and the one to wait for */
const pylon: Act = {
  id: 'ccu07-pylon',
  w: 40,
  advice: 'The second pylon, and a porter about to leave from it: don’t take him, his chai stop is just ahead. Wait on the step for the tall porter coming up behind, and get on his load as he goes by.',
  paint: (g, c) => {
    g.fill(c.x, c.x + 7, 14, 14, '#').fill(c.x + 5, c.x + 7, 13, 13, '#');
  },
  build: (w, c) => {
    w.add(new Girders(c.X(0), c.X(40)));
    road(w, c.X(8), c.X(40));
    const p5 = w.add(new Porter({ x: c.X(8.8), v: 45, h: SHORT, rests: [[c.X(15), 3]], go: (w2, me) => w2.player.isRiding(me.load) }));
    w.add(new Porter({ x: c.X(-6), v: 55, h: TALL, kind: 'books', go: (w2) => w2.player.onGround && w2.player.cx > c.X(2) && w2.player.cx < c.X(8), off: Infinity }));
    w.add(new ChaiBoard(c.X(15)));
    w.add(new ChaiBoard(c.X(3), true));
  },
};


// ================================================================== CCU-08: Adda (the rok)
/** the tea seller for a stretch of rok: sent along from `from` whenever someone's been taken into an adda */
function teaRound(w: World, addas: Adda[], from: number) {
  const t = w.add(new TeaSeller(from, -70, addas));
  for (const a of addas) w.when(() => a.held, () => w.after(0.3, () => { if (!t.active) t.send(from); }), false);
  return t;
}
function addaRoom(): LevelDef {
  return {
    id: 'CCU-08',
    city: 'CCU',
    index: 8,
    name: 'Adda',
    nameEn: 'The endless chat',
    tagline: 'Outside the old houses of north Kolkata, the rok: a raised brick step where the neighbourhood sits and argues, for hours, over tea. The lane below has been dug up for weeks.',
    hint: 'The lane is dug up: keep to the rok. The old men sitting on it are an adda, and if you stand still among them you’ve joined it: you can’t get up again until the tea seller comes by with his clay cups. Meanwhile the maid sloshes her bucket of water along the rok from the door. So never stop beside the old men: walk straight through them, and hop the water.',
    par: 12,
    map: Grid.ground(15).pit(4, 31).fill(4, 31, 13, 14, '#').put(1, 14, '@').rows(),
    build(w: World) {
      w.add(new House(px(3), px(32)));
      khod(w, 4, 32);
      const a = w.add(new Adda(px(11), px(18), 3));
      const wash = w.add(new Wash(px(28), px(4)));
      teaRound(w, [a], px(31));
      // the first time they hold you, the maid comes out with her bucket
      w.when(() => a.held, (w2) => w2.after(0.3, () => wash.throw(w2)));
      w.flags.addas = [a];
      sign(w, 0.3, 10.4, 3.4, 'SHOVABAZAR', 'green', null, 'north');
      rival(w, 2, 15, 1, tara(6));
      collectible(w, 'ccu-bhanr', 21.5, 10.8);
    },
  };
}

/** CCU-08 act: more of the rok, two more addas, and a door that washes the rok on a beat */
const rok: Act = {
  id: 'ccu08-rok',
  w: 44,
  cp0: false,
  cps: [17.5],
  advice: 'Two more addas on the rok, and a door ahead whose maid throws her water every few seconds: you see the door open first. Walk through the old men without stopping, hop each sheet of water, and if you need to wait, wait on the bare rok between them.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 35).fill(c.x, c.x + 35, 13, 14, '#');
  },
  build: (w, c) => {
    w.add(new House(c.X(0), c.X(36)));
    khod(w, c.x, c.x + 36);
    const a1 = w.add(new Adda(c.X(7), c.X(13), 3));
    const a2 = w.add(new Adda(c.X(22), c.X(28), 3));
    const wash = w.add(new Wash(c.X(33), c.X(20)));
    teaRound(w, [a1, a2], c.X(37));
    let beat = -1;
    w.add(
      new (class extends Entity {
        update(w2: World) {
          if (beat < 0 && w2.player.cx > c.X(1)) beat = w2.tick;
          if (beat >= 0 && (w2.tick - beat) % 384 === 0) wash.throw(w2);
        }
      })(),
    );
    w.flags.addas = [...(w.flags.addas ?? []), a1, a2];
    w.flags.rokWash = wash;
  },
};


// ================================================================== CCU-09: Pandal (the bamboo skeleton)
/** a decorator ties `panel` on as soon as Dad lands on the bamboo between columns c0 and c1 at row top y */
function tieWhenOn(w: World, panel: ClothPanel, c0: number, c1: number, y = px(12)) {
  w.when(
    (w2) => w2.player.onGround && w2.player.y + w2.player.h === y && w2.player.cx > px(c0) && w2.player.cx < px(c1),
    (w2) => panel.tie(w2),
  );
}
/** the next panel goes on above `panel` a moment after Dad stands on its top */
function stackWhenOn(w: World, panel: ClothPanel, more: number, delay = 0.35) {
  w.when(
    (w2) => panel.tied && w2.player.onGround && w2.player.isRiding(panel.solid),
    (w2) => w2.after(delay, () => panel.raise(w2, more)),
  );
}
function pandalRoom(): LevelDef {
  return {
    id: 'CCU-09',
    city: 'CCU',
    index: 9,
    name: 'Pandal',
    nameEn: 'The bamboo skeleton',
    tagline: 'Weeks before the festival, every para in Kolkata builds its pandal: a palace of cloth over a skeleton of bamboo, tied on panel by panel.',
    hint: 'Cross on the bamboo; the floor is all cut stakes. The decorators tie a cloth panel on exactly where your next foothold was, the moment you land before it: it’s a solid wall, but you can stand on its top. Jump high (hold it) on to the top of the cloth, not at the bamboo under it. And don’t stay on a cloth top under the roof frame: they tie the next panel on above it, and up you go.',
    par: 14,
    map: Grid.ground(15).fill(3, 3, 13, 14, '#').fill(5, 6, 12, 12, '=').fill(9, 10, 12, 12, '=').fill(13, 14, 12, 12, '=').fill(17, 18, 12, 12, '=').fill(21, 22, 12, 12, '=').fill(24, 26, 12, 12, '=').fill(19, 23, 7, 7, '#').fill(28, 31, 12, 14, '#').put(1, 14, '@').rows(),
    build(w: World) {
      w.add(new Skeleton(px(4), px(32)));
      w.add(new Stakes(px(4), px(28)));
      const p3 = w.add(new ClothPanel(px(13), px(2), px(12), 2, 0));
      const p5 = w.add(new ClothPanel(px(21), px(2), px(12), 2, 1));
      w.add(new Decorator(px(15) + 6, px(12), p3));
      w.add(new Decorator(px(23) + 6, px(12), p5));
      tieWhenOn(w, p3, 9, 11);
      tieWhenOn(w, p5, 17, 19);
      stackWhenOn(w, p5, 2);
      w.flags.panels = [p3, p5];
      sign(w, 0.3, 10.4, 3.6, 'KUMARTULI PARK', 'green', null, 'pandal');
      rival(w, 1, 15, 1, tara(7));
      onPass(w, px(2), (w2) => w2.guide('Ei je, shunun! | Excuse me, listen!', (w3) => w3.player.cx < px(6)));
      collectible(w, 'ccu-sandesh', 23.5, 9.2);
    },
  };
}

/** CCU-09 act: a wide panel across the next bamboo, and no roof frame over it: this time, ride the raise */
const chala: Act = {
  id: 'ccu09-chala',
  w: 40,
  cp0: false,
  cps: [27.5],
  advice: 'A wide panel goes up across the long bamboo: a full jump on to its top. Here there’s no roof frame over it, and the high bamboo ahead is out of reach: stay on the cloth while they tie the next panel on above, and ride it up to the high bamboo.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 2, x + 3, 12, 12, '=').fill(x + 6, x + 11, 12, 12, '=').fill(x + 14, x + 17, 6, 6, '=').fill(x + 20, x + 23, 9, 9, '=');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Skeleton(c.X(0), c.X(40)));
    w.add(new Stakes(c.X(0), c.X(25)));
    const wide = w.add(new ClothPanel(c.X(6), px(6), px(12), 2, 2));
    w.add(new Decorator(c.X(12) + 6, px(12), wide));
    tieWhenOn(w, wide, x + 2, x + 4);
    stackWhenOn(w, wide, 3, 0.25);
    w.flags.wide = wide;
  },
};


// ================================================================== CCU-10: Kolkata Kolkata (the finale)
const road10 = (w: World, x0: number, x1: number) => w.add(new Road(x0, x1, (w2) => (w2.flags.yanked ? 'ccu-boi' : w2.flags.cha ? 'ccu-cha' : 'ccu-gaari')));
function finaleRoom(): LevelDef {
  return {
    id: 'CCU-10',
    city: 'CCU',
    index: 10,
    name: 'Kolkata Kolkata',
    nameEn: 'Kolkata, Kolkata',
    tagline: 'Everything at once: College Street’s bundles on the porters’ heads, a bus that never stops, a tram on its pole, and the customers who want that book.',
    hint: 'The porters are carrying book bundles across the road, and the customers on the pavement point at the bundle they want: the porter hands it down and his pile drops by one. A pile of one goes from under you. Count the bundles: off the single on to the porter with three as he passes, and stay on him while they buy, down to the far kerb.',
    par: 14,
    map: Grid.ground(15).fill(28, 31, 14, 14, '#').put(1, 14, '@').rows(),
    build(w: World) {
      w.add(new Girders(px(4), px(30)));
      road10(w, px(6), px(28));
      const b1 = w.add(new BookPorter({ x: px(5), v: 40, h: 0, go: (w2, me) => w2.player.isRiding(me.load), off: px(48) }, 1));
      const b2 = w.add(new BookPorter({ x: px(0), v: 58, h: 0, go: () => b1.state !== 'idle', off: px(48) }, 3));
      const c1 = w.add(new Pointer(px(14), '#7B8D6E'));
      const c2 = w.add(new Pointer(px(21), '#A0522D'));
      const c3 = w.add(new Pointer(px(26), '#5C6BC0'));
      w.when(() => b1.x > px(12), (w2) => c1.ask(w2, b1, 2.0));
      w.when(() => b2.x > px(19), (w2) => c2.ask(w2, b2, 1.0));
      w.when(() => b2.x > px(24), (w2) => c3.ask(w2, b2, 1.0));
      w.flags.book = { b1, b2 };
      w.add(new Stall(px(6), px(28), 'COLLEGE ST'));
      sign(w, 0.3, 10.4, 3.4, 'BOI PARA', 'green', null, 'finale');
      rival(w, 2, 15, 1, tara(8, 1));
      onPass(w, px(2.5), (w2) => w2.guide('Ei jinishtar dam koto? | How much is this?'));
      collectible(w, 'ccu-doi', 17, 9.6);
    },
  };
}

/** CCU-10 act 1: the bus again, in a new order: it crawls for you at the stop, flies the drain, and its one
 *  "aaste" is the last chance before the depot */
const bus10: Act = {
  id: 'ccu10-bus',
  w: 40,
  cps: [3.5],
  advice: 'A bus stop, and a drain too wide to jump. Stand still at the stop: the conductor crawls for you. Hop on the footboard, keep on over the drain, and step off forwards on his one “aaste” after it. There isn’t a second one: he turns into the depot.',
  paint: (g, c) => {
    g.pit(c.x + 12, c.x + 24);
  },
  build: (w, c) => {
    pool(w, c.x + 12, c.x + 25, 16, { colors: NALA, cause: 'ccu-nala' });
    sign(w, c.x + 2, 10.4, 3.2, 'BUS STOP', 'green', null, 'Esplanade');
    const stop = [c.X(1), c.X(5)];
    const bus = w.add(new Bus({ x: c.X(-14), go: (w2) => w2.player.cx > c.X(1), slow: [[c.X(25), c.X(28.5)]], end: c.X(31), fast: 130, crawl: 20, label: 'ESPLANADE' }));
    w.flags.bus10 = { bus, stop };
    w.add(
      new (class extends Entity {
        update(w2: World) {
          const p = w2.player;
          const still = p.onGround && Math.abs(p.vx) < 4 && p.cx > stop[0] && p.cx < stop[1];
          if (!bus.slowed && still && bus.x < stop[0] - 8 && bus.x > stop[0] - 150) bus.slowed = true;
          if (bus.slowed && bus.x > c.X(9)) bus.slowed = false;
        }
      })(),
    );
  },
};

/** CCU-10 act 2: the tram once more: through a junction on its step, off at the island before the points */
const tram10: Act = {
  id: 'ccu10-tram',
  w: 44,
  cp0: false,
  cps: [26.5],
  advice: 'The tram: on to its rear step, never the roof. Through the junction on the step, and off at the island: the pointsman has it set for the other line.',
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 21);
  },
  build: (w, c) => {
    khod(w, c.x + 6, c.x + 22);
    w.add(new Junction(c.X(14)));
    w.add(new Points(c.X(30), true));
    sign(w, c.x + 1.5, 8.4, 3.6, 'TRAM STOP', 'green', null, 'route 25');
    const t = w.add(new Tram({ x: c.X(2), speed: 60, stops: [{ x: c.X(2), dwell: 0.5, ride: true }, { x: c.X(22), dwell: 1.6 }], junctions: [c.X(14)], turnAt: c.X(28), label: '25' }));
    w.flags.tram10 = t;
  },
};


// ================================================================== CCU-03: Jhalmuri (the shaken tin)
function muriRoom(): LevelDef {
  return {
    id: 'CCU-03',
    city: 'CCU',
    index: 3,
    name: 'Jhalmuri',
    nameEn: 'The shaken tin',
    tagline: 'Every Kolkata street corner has a jhalmuri man: puffed rice, peanuts, onion, chilli and mustard oil, tossed in a big tin and shaken.',
    hint: 'The tin is the floor, and the muri holds you up, until he shakes it: then the light muri sinks and the big pieces come up. Watch him lift the tin: that’s the shake coming. Be on a peanut when it comes, never on the muri. And from the second shake, a green chilli comes up right where you last landed: as he shakes, hop on to the next peanut.',
    par: 14,
    map: Grid.ground(15).pit(6, 25).put(1, 14, '@').rows(),
    build(w: World) {
      const tin = w.add(new Tin({ x0: px(6), x1: px(26), nuts: [8, 10.5, 13, 15.5, 18, 20.5, 23].map((c) => px(c)), every: 3.4, chilliFrom: 2 }));
      w.flags.tin = tin;
      // the seller starts shaking as Dad comes up to his tin
      onPass(w, px(3), (w2) => {
        if (tin.t0 < 0) tin.t0 = w2.tick + 72;
      });
      sign(w, 0.3, 10.4, 3.6, 'JHALMURI', 'shop', null, 'Esplanade');
      rival(w, 2, 15, 1, tara(1));
      onPass(w, px(2), (w2) => w2.guide('Ei je, shunun! | Excuse me, listen!', (w3) => w3.player.cx < px(6)));
      collectible(w, 'ccu-jhalmuri', 15.5, 11.4);
    },
  };
}


// ================================================================== CCU-05: Kumartuli (the potters' lane)
type Fig = [number, number, number, number, Figure['o']['look']?];
/** figures from columns: [col, height tiles, paint at start, paint rate (0: dry clay)] ; all start painting when Dad passes `go` */
function figures(w: World, list: Fig[], go: number) {
  const fs = list.map(([c, h, paint, rate, look]) => w.add(new Figure({ x: px(c), h, paint, rate, look })));
  onPass(w, go, () => fs.forEach((f) => (f.started = true)));
  (w.flags.figures ??= []).push(...fs);
  return fs;
}
function kumartuliRoom(): LevelDef {
  return {
    id: 'CCU-05',
    city: 'CCU',
    index: 5,
    name: 'Kumartuli',
    nameEn: 'The potters’ lane',
    tagline: 'On the Hooghly’s bank, Kumartuli’s potters shape clay figures by the hundred, paint them from the feet up, and carry each one out the moment it’s done.',
    hint: 'The lane is over the ghat’s mud: go figure to figure. Each one is being painted from the feet up, and when the paint reaches the top they carry it out, with you on it. Stand only on figures the paint hasn’t passed the waist of (the little mark), and move on quickly from the others. The pale ones aren’t painted yet: they’re dry, and their top cracks under a landing from a height. Walk off on to a pale one; never jump down on to it.',
    par: 18,
    map: Grid.ground(15).pit(4, 29).put(1, 14, '@').rows(),
    build(w: World) {
      w.add(new Ghat(px(4), px(30)));
      figures(
        w,
        [
          [5, 2, 0.1, 0.05, 'man'],
          [8, 3, 0.55, 0.12, 'horse'],
          [10, 2, 0, 0, 'woman'],
          [13, 3, 0.3, 0.08, 'man'],
          [17, 4, 0.62, 0.14, 'horse'],
          [20, 3, 0.15, 0.08, 'woman'],
          [22, 2, 0, 0, 'man'],
          [26, 2, 0, 0.06, 'horse'],
        ],
        px(2),
      );
      sign(w, 0.3, 10.4, 3.6, 'KUMARTULI', 'green', null, 'potters');
      rival(w, 2, 15, 1, tara(3));
      onPass(w, px(1.5), (w2) => w2.guide('Ei je, shunun! | Excuse me, listen!', (w3) => w3.player.cx < px(5)));
      collectible(w, 'ccu-roll', 15.5, 9.4);
    },
  };
}


/** CCU-05 act: the drying yard: unpainted figures drying in the sun, at every height. Walk off a dry one on
 *  to one a tile lower and it holds; two tiles lower and it cracks even under a walk */
const uthon: Act = {
  id: 'ccu05-uthon',
  w: 26,
  advice: 'The drying yard: most of these are dry. A walk off on to a dry figure one step lower is fine; two steps lower and it cracks even under a walk. From the high dry one, hop across to the half-painted one instead, and quickly on.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 21);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Ghat(c.X(0), c.X(22)));
    figures(
      w,
      [
        [x + 1, 2, 0.2, 0.06, 'horse'],
        [x + 3, 3, 0.1, 0.06, 'man'],
        [x + 5, 4, 0.3, 0.06, 'woman'],
        [x + 7, 3, 0, 0, 'man'],
        [x + 9, 1, 0, 0, 'horse'],
        [x + 12, 2, 0.5, 0.12, 'woman'],
        [x + 14, 1, 0, 0, 'man'],
        [x + 17, 2, 0.1, 0.06, 'horse'],
      ],
      c.X(0),
    );
  },
};

/** CCU-05 act: the lane where they're finishing in order, one after another behind you */
const ghat: Act = {
  id: 'ccu05-ghat',
  w: 26,
  advice: 'Here they finish one after another, from the near end, and carry each one out as you go: keep moving, never wait, and still walk off (never jump) on to the pale dry ones.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 21);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Ghat(c.X(0), c.X(22)));
    figures(
      w,
      [
        [x + 1, 2, 0.45, 0.14, 'horse'],
        [x + 4, 3, 0.35, 0.14, 'man'],
        [x + 6, 2, 0, 0, 'woman'],
        [x + 9, 3, 0.3, 0.13, 'horse'],
        [x + 11, 2, 0, 0, 'man'],
        [x + 14, 3, 0.2, 0.13, 'woman'],
        [x + 18, 2, 0.15, 0.13, 'horse'],
      ],
      c.X(0),
    );
  },
};

/** built on demand: tour() and longStage() read this city's course, skin and endings, which the registry installs first */
export const levels = (): LevelDef[] => [
  {
    ...tour({
      id: 'CCU-01',
      city: 'CCU',
      name: 'Nomoshkar Kolkata',
      nameEn: 'Hello, Kolkata',
      tagline: 'The City of Joy: the Maidan, a tram stop, and the oldest trams in Asia, still crawling down the middle of the road.',
      lines: [
        'Nomoshkar, Dad! | Hello, Dad!',
        'Ki khobor, Dad? | What’s up, Dad?',
        'Howrah, Howrah, Howrah! | Howrah, Howrah, Howrah!',
        'Ei je, shunun! | Excuse me, listen!',
        'Ei jinishtar dam koto? | How much is this?',
        'Jatra shubho hok, Dad! | Have a good journey, Dad!',
      ],
      shouts: [[34, 'Bhalo theko! | Stay well!']],
      ride: 'ccu-thela',
      item: 'ccu-doi',
      signs: [
        [8, 'MAIDAN', 'morning walk'],
        [53, 'TRAM STOP', 'route 25'],
        [101, 'ESPLANADE', 'terminus'],
      ],
      props: [
        ['lamp', 4, {}],
        ['stall', 20, { label: 'CHA' }],
        ['crowd', 36, { n: 3 }],
        ['lamp', 57, {}],
        ['crowd', 78, { n: 2 }],
        ['lamp', 106, {}],
      ],
      things: [],
      hint: 'A walk round town: jump the kerb ditch, climb the Maidan steps, hop the tram-stop posts and the parked thela. Past the thela there’s a tram rail in the road. Jump on to it and your foot drops into the groove: the rail steers you along its line, no turning, no jumping, straight into the rail-works trench. Walk on to the rail instead (up on the thela, and walk off it), then jump the trench. At Esplanade, ride the little tram across.',
      paint: (g) => {
        g.pit(70, 71);
      },
      extra: (w) => {
        feet(w);
        w.add(new Rail(px(62), px(70), px(72)));
        onPass(w, px(56), (w2) => w2.guide('Tram! Ei je, shunun! | The tram line! Excuse me, listen!'));
      },
      cps: [16.5, 42, 57, 75, 97],
    }),
    meta: meta('rail-groove-sticks-foot', ['groove-catch'], 'ccu-esplanade-tram-shuttle'),
  },
  longStage({ base: aasteRoom(), par: 30, twist: 'ccu-stop', shape: 'short', meta: meta('exit-moving-vehicle-on-shout', ['exit-facing-forward'], 'ccu-bus-crawls-for-whoever-waits') }),
  longStage({ base: muriRoom(), par: 30, twist: 'ccu-thonga', shape: 'short', meta: meta('shake-tin-sorts-big-pieces-up', ['shake-sorts-up', 'B35'], 'ccu-tin-with-no-peanuts') }),
  longStage({ base: boiRoom(), par: 26, twist: 'ccu-set', shape: 'short', meta: meta('stack-pulled-from-bottom', ['stack-drops-one-height'], 'ccu-customer-buys-the-whole-set') }),
  longStage({ base: kumartuliRoom(), par: 50, acts: [uthon, ghat], twist: 'ccu-murti', shape: 'long', meta: meta('painted-figure-carried-out', ['paint-done-departs', 'dry-cracks-from-height'], 'ccu-finished-figure-carried-over-the-lane') }),
  longStage({ base: poleRoom(), par: 60, acts: [points], twist: 'ccu-pole-turn', shape: 'long', meta: meta('pole-swings-at-junction', ['pole-sweep', 'points-switch'], 'ccu-pole-turned-over-the-terminus') }),
  longStage({ base: howrahRoom(), par: 90, acts: [girder, pylon], twist: 'ccu-arch', shape: 'marathon', lives: 'act', meta: meta('head-load-platforms', ['carry-platform', 'porter-rests'], 'ccu-station-arch-sweeps-the-loads') }),
  longStage({ base: addaRoom(), par: 40, acts: [rok], twist: 'ccu-bhanr', shape: 'wtf', meta: meta('stand-still-held-by-chat', ['held-until-event'], 'ccu-door-opens-for-a-cup-of-tea') }),
  longStage({ base: pandalRoom(), par: 40, acts: [chala], twist: 'ccu-dhak', shape: 'long', meta: meta('cloth-panel-covers-foothold', ['build-order-wall'], 'ccu-dhak-beat-lifts-the-gate-curtain') }),
  longStage({ base: finaleRoom(), par: 80, acts: [bus10, tram10], twist: 'ccu-wall', shape: 'long', lives: 'act', meta: meta('finale-book-bundle-loads', ['customers-ask-mid-crossing'], 'ccu-customers-buy-the-wall-down') }),
];
