// Kolkata: trams that still crawl, buses that never stop, College Street's books by the kilo, Howrah
// Bridge's porters, adda on the rok, the pandal's bamboo skeleton. 01 the welcome tour, 02-10 long stages
// (room + act + door ending), harder each time, 10 the finale. Slots: docs/allocation.json (CCU).
import { Entity, type LevelDef, type StageMeta, type World } from '../../world';
import { Solid } from '../../body';
import { lines as L } from './lines';
import { checkpoint, collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { pool } from '../../levels/acts';
import { Bus, Rail, feet } from './entities';
import { NALA } from './endings';
import { Customer, Muck, Stack, Stall } from './books';
import { Junction, OtherTram, Points, Tram } from './tram';
import { BookPorter, ChaiBoard, Girders, Pointer, Porter, Road, SHORT, TALL } from './porters';
import { Adda, House, TeaSeller, Wash } from './adda';
import { ClothPanel, Decorator, DhakFrame, Lowered, Queue, Skeleton, Stakes } from './pandal';
import { Tin } from './muri';
import { Kumir } from './kumir';
import { Bore, Ebb, Front } from './baan';
import { BigFigure, Figure, Ghat } from './kumartuli';
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
    tagline: 'Asia’s oldest trams still run here, slower than walking, on a pole that touches a wire. At junctions it jumps off.',
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


/** CCU-06 act: the double line. One more junction (the step again), and an island stop where a tram on
 *  the other line comes past right by the step: off on to the island till it's gone, then back on. The act
 *  ends on the island, so its last checkpoint is on the ground, never on the step */
const duiLine: Act = {
  id: 'ccu06-duiline',
  w: 26,
  // its checkpoint is the door's, at the island's far end, past the other line's tram
  cp0: false,
  advice: 'One more junction: stay on the step. At the island stop a tram on the other line comes past, right by the step: get off on to the island, let it go by, and hop back on before yours leaves.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    khod(w, x, x + 20);
    w.add(new Junction(c.X(8)));
    sign(w, x + 21.5, 8.4, 3.6, 'TRAM STOP', 'green', null, 'double line');
    w.flags.junctions6 = [c.X(8)];
    w.flags.stops6 = [{ x: c.X(20) - 2, dwell: 4.6, ride: true }];
    const other = w.add(new OtherTram(c.X(36), c.X(12)));
    w.when(
      (w2) => w2.flags.tramB && w2.flags.tramB.state === 'stop' && w2.flags.tramB.x > c.X(19),
      (w2) => {
        other.go = true;
        w2.after(0.1, () => (w2.flags.other6 = other));
      },
    );
  },
};

/** CCU-06 act: the island stop, the points, and the tram that goes straight on */
const points: Act = {
  id: 'ccu06-points',
  w: 48,
  cp0: false,
  // on the island's ground, never on the tram's step
  cps: [6.3],
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
        const b = w2.add(new Tram({ x: c.X(4) - 300, speed: 70, stops: [{ x: c.X(5) - 2, dwell: 0.8, ride: true }, ...(w2.flags.stops6 ?? [])], junctions: [c.X(30), ...(w2.flags.junctions6 ?? [])], end: w2.flags.terminus, label: '25' }));
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
    tagline: 'More people than cars cross Howrah Bridge every day, and the porters carry the city on their heads.',
    hint: 'The road is nose-to-tail taxis: ride the head-loads. A porter stops at the CHA board on the girder and sets his load down for tea, and on the road that’s you among the taxis: before his chai stop, hop on to the next load going your way. A load coming the other way knocks you off yours, so never jump at one of those.',
    par: 16,
    map: Grid.ground(15).fill(28, 31, 14, 14, '#').put(1, 14, '@').rows(),
    build(w: World) {
      w.add(new Girders(0, px(32)));
      road(w, px(6), px(28));
      const p1 = w.add(new Porter({ x: px(5), v: 40, h: SHORT, rests: [[px(21), 3]], go: (w2, me) => w2.player.isRiding(me.load) }));
      w.add(new Porter({ x: px(-2.5), v: 60, h: TALL, rests: [[px(30.5), Infinity]], go: walking(p1) }));
      w.add(new Porter({ x: px(23), v: -45, h: TALL - 1, go: walking(p1), off: px(6) }));
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
  cp0: false,
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


/** CCU-07 act 2: two streams. Tall loads come the other way over your head while you ride a short one; the
 *  tall porter going your way overtakes. Hop up to him, but never while an oncoming load is over you */
const dui: Act = {
  id: 'ccu07-dui',
  w: 44,
  advice: 'Two streams now. You ride a short porter, and tall loads come the other way, over your head: harmless, unless you jump into them. A tall porter going your way overtakes before the CHA board: hop up on to his load, but only when no oncoming load is over you.',
  paint: (g, c) => {
    g.fill(c.x, c.x + 3, 14, 14, '#').fill(c.x + 1, c.x + 3, 13, 13, '#');
  },
  build: (w, c) => {
    w.add(new Girders(c.X(0), c.X(44)));
    road(w, c.X(4), c.X(44));
    const q1 = w.add(new Porter({ x: c.X(4.9), v: 45, h: SHORT, rests: [[c.X(25), 3]], go: (w2, me) => w2.player.isRiding(me.load) }));
    w.add(new Porter({ x: c.X(-1), v: 78, h: TALL, rests: [[c.X(47.5), Infinity]], go: walking(q1) }));
    w.add(new Porter({ x: c.X(30), v: -50, h: TALL - 1, go: walking(q1), off: c.X(4) }));
    w.add(new Porter({ x: c.X(46), v: -50, h: TALL - 1, go: walking(q1), off: c.X(4) }));
    w.add(new ChaiBoard(c.X(25)));
    w.add(new ChaiBoard(c.X(2), true));
  },
};


/** CCU-07 long acts: a relay of three porters over a long span of road. `v` are the speeds of the first,
 *  second and third porter (also how the routes tell them apart); `tallFirst` swaps the heights */
function relay(id: string, v: [number, number, number], tallFirst: boolean, advice: string, cps: number[]): Act {
  return {
    id,
    w: 60,
    // on the pylon step, never on a load
    cp0: false,
    cps,
    advice,
    paint: (g, c) => {
      g.fill(c.x, c.x + 3, 14, 14, '#').fill(c.x + 1, c.x + 3, 13, 13, '#');
    },
    build: (w, c) => {
      w.add(new Girders(c.X(0), c.X(60)));
      road(w, c.X(4), c.X(60));
      // the third porter is a little taller or shorter than the first, so his load never sweeps you off the first one
      const [h1, h2, h3] = tallFirst ? [TALL, SHORT, TALL + 8] : [SHORT, TALL, SHORT - 4];
      const r1 = tallFirst ? 24 : 28;
      const a1 = w.add(new Porter({ x: c.X(5), v: v[0], h: h1, rests: [[c.X(r1), 3]], go: (w2, me) => w2.player.isRiding(me.load), kind: 'sack' }));
      w.add(new Porter({ x: c.X(tallFirst ? 1 : -1), v: v[1], h: h2, rests: [[c.X(46), 3]], go: walking(a1), kind: 'books' }));
      w.add(new Porter({ x: c.X(-12), v: v[2], h: h3, rests: [[c.X(60.8), Infinity]], go: walking(a1) }));
      w.add(new Porter({ x: c.X(52), v: -48, h: TALL - 1, go: walking(a1), off: c.X(4) }));
      w.add(new Porter({ x: c.X(80), v: -48, h: TALL - 1, go: walking(a1), off: c.X(4) }));
      w.add(new ChaiBoard(c.X(r1)));
      w.add(new ChaiBoard(c.X(46)));
      w.add(new ChaiBoard(c.X(2), true));
    },
  };
}
const ulto = relay('ccu07-ulto', [41, 59, 79], false, 'A long span, and the relay the other way up: a short porter from the pylon, a tall one overtaking (hop up when nothing is coming over), then a short one passing under (walk off the front on to him) before the second CHA board.', [2.4]);

/** CCU-07 act (R2, the bore's front, its A3): the low causeway along the river. The front comes up the
 *  river behind you as you step on to it and floods all it has passed: the momentum beat. Keep moving,
 *  hop each drain short, and be past the end of the causeway before it catches you */
const jowar: Act = {
  id: 'ccu07-jowar',
  w: 40,
  // the start is under the front once it's coming: the checkpoint is up the ghat steps past it
  cp0: false,
  cps: [36],
  advice: 'The low causeway along the river, and the bore’s front is coming up behind you: everything it has passed is under water. Don’t stop. Hop each drain short (they’re close together) and keep running till you’re up the ghat steps at the end.',
  paint: (g, c) => {
    const x = c.x;
    for (const d of [8, 12, 18, 24]) g.pit(x + d, x + d + 1);
    g.fill(x + 33, x + 39, 14, 14, '#');
  },
  build: (w, c) => {
    for (const d of [8, 12, 18, 24]) pool(w, c.x + d, c.x + d + 2, 16, { colors: NALA, cause: 'ccu-nala' });
    const front = w.add(new Front(c.X(-2), c.X(33), 80));
    onPass(w, c.X(1), (w2) => {
      if (front.t0 < 0) front.t0 = w2.tick + 60;
    });
    sign(w, c.x + 0.3, 10.4, 3.4, 'CAUSEWAY', 'green', null, 'low tide only');
    w.flags.jowar = front;
  },
};

/** CCU-07 act (reserve R2, the Hooghly bore): down at the ghat under the bridge. The river is too wide and
 *  the jetty too high; the bore comes up on a timetable, drowns the ghat steps and floats the moored launch
 *  up level with the jetty. Be on the launch before it comes, step off at the crest */
const baan: Act = {
  id: 'ccu07-baan',
  w: 28,
  advice: 'Down at the ghat under the bridge: the river is too wide and the jetty far too high. Watch for the bore: a white line on the water, a rumble, then the wave comes up the steps and drowns them. Be on the moored launch before it comes and stay on: the wave floats it up the river and level with the jetty. Step off on to the jetty at the crest.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 7, x + 13).fill(x + 14, x + 18, 10, 14, '#').fill(x + 19, x + 19, 11, 14, '#').fill(x + 20, x + 20, 12, 14, '#').fill(x + 21, x + 21, 13, 14, '#').fill(x + 22, x + 27, 14, 14, '#');
  },
  build: (w, c) => {
    const bore = w.add(new Bore({ river: [c.X(7), c.X(14)], ghat: [c.X(2), c.X(7)], low: 250, high: 166, launch: [c.X(7) + 2, c.X(10)], launchTo: c.X(11) - 2, first: 2.5, every: 12 }));
    onPass(w, c.X(2), (w2) => {
      if (bore.t0 < 0) bore.t0 = w2.tick + 300;
    });
    sign(w, c.x + 0.4, 10.4, 3.4, 'BAAN', 'green', null, 'tide table');
    w.flags.baan = bore;
  },
};

/** CCU-07 act 3: the second pylon, a porter who leaves at once (and stops for tea at once), and the one to wait for */
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
    tagline: 'The rok: the raised step outside old north Kolkata houses, where the neighbourhood argues for hours over tea.',
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


/** CCU-08 act: the broken rok. A gap too wide to jump, and on the far side the tea seller, who only comes
 *  when someone's sitting in the adda: the workers lay a plank across for him. So this time, sit down. */
const tokta: Act = {
  id: 'ccu08-tokta',
  w: 34,
  cp0: false,
  cps: [3.5],
  advice: 'The rok is broken off ahead, too wide a gap to jump, and nobody crosses it but the tea seller. He only comes when someone is sitting in the adda: so this time, stand still among the old men. The workers lay a plank across for him; when he lets you go, cross on it behind him.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 33).fill(c.x, c.x + 12, 13, 14, '#').fill(c.x + 20, c.x + 33, 13, 14, '#');
  },
  build: (w, c) => {
    w.add(new House(c.X(0), c.X(34)));
    khod(w, c.x, c.x + 34);
    const a = w.add(new Adda(c.X(6), c.X(12), 3));
    const t = teaRound(w, [a], c.X(30));
    const plank = new Solid(c.X(13), px(13), px(7), 4);
    plank.oneWay = true;
    plank.collidable = false;
    plank.velX = 0;
    let laid = -1;
    w.add(
      new (class extends Entity {
        solid = plank;
        update(w2: World) {
          // laid as he comes up to the gap; taken up again three seconds after he's crossed back
          if (t.active && t.x < c.X(22) && laid < 0) {
            laid = w2.tick;
            plank.collidable = true;
            w2.flags.plank = 1;
          }
          if (laid >= 0 && !t.active && w2.tick - laid > 600 && !w2.player.isRiding(plank)) {
            plank.collidable = false;
            laid = -1;
            w2.flags.plank = 0;
          }
        }
        draw(ctx: CanvasRenderingContext2D) {
          if (!plank.collidable) return;
          ctx.fillStyle = '#8B6B3E';
          ctx.fillRect(plank.x, plank.y, plank.w, 4);
          ctx.fillStyle = '#6B4A2E';
          for (let x = plank.x + 10; x < plank.x + plank.w; x += 22) ctx.fillRect(x, plank.y, 1, 4);
        }
      })(),
    );
    w.flags.tokta = { a, t, plank };
    w.flags.addas = [...(w.flags.addas ?? []), a];
  },
};

/** CCU-08 act: more of the rok, two more addas, and a door that washes the rok on a beat */
const rok: Act = {
  id: 'ccu08-rok',
  w: 44,
  cp0: false,
  cps: [15.2],
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


/** CCU-09 act: the cloth already tied is a staircase up the skeleton; at its top a panel goes up across
 *  the next foothold under the roof frame, so its top is no place to stand either */
const sinri: Act = {
  id: 'ccu09-sinri',
  cp0: false,
  cps: [-3.4],
  w: 30,
  advice: 'The panels they’ve already tied make a staircase: climb it, cloth top to cloth top. At the top a new panel goes up across the next bamboo: a full jump on to it, and walk straight off the far side before they tie the next one above, into the roof frame.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 2, x + 3, 12, 12, '=').fill(x + 5, x + 6, 12, 12, '=').fill(x + 8, x + 9, 12, 12, '=').fill(x + 12, x + 13, 9, 9, '=').fill(x + 16, x + 17, 9, 9, '=').fill(x + 18, x + 20, 9, 9, '=').fill(x + 15, x + 17, 3, 3, '#').fill(x + 24, x + 29, 12, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Skeleton(c.X(0), c.X(30)));
    w.add(new Stakes(c.X(0), c.X(24)));
    // the staircase of cloth already tied, one, two and three tiles tall
    w.add(new ClothPanel(c.X(5), px(2), px(12), 1, 3, true));
    w.add(new ClothPanel(c.X(8), px(2), px(12), 2, 0, true));
    w.add(new ClothPanel(c.X(12), px(2), px(9), 1, 1, true));
    const top = w.add(new ClothPanel(c.X(16), px(2), px(9), 2, 2));
    w.add(new Decorator(c.X(18) + 6, px(9), top));
    tieWhenOn(w, top, x + 12, x + 14, px(8));
    stackWhenOn(w, top, 3);
    w.flags.sinri = top;
  },
};

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
    tagline: 'Everything at once: book bundles on porters’ heads, a bus that never stops, a tram, an adda, and the potters.',
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
/** a bus stop before a drain too wide to jump: stand still and the conductor crawls for you; one “aaste” after the drain */
function stopBus(id: string, flag: string, stopName: string, label: string, advice: string): Act {
  return {
    id,
    w: 40,
    cps: [3.5],
    advice,
    paint: (g, c) => {
      g.pit(c.x + 12, c.x + 24);
    },
    build: (w, c) => {
      pool(w, c.x + 12, c.x + 25, 16, { colors: NALA, cause: 'ccu-nala' });
      sign(w, c.x + 2, 10.4, 3.2, 'BUS STOP', 'green', null, stopName);
      const stop = [c.X(1), c.X(5)];
      const bus = w.add(new Bus({ x: c.X(-14), go: (w2) => w2.player.cx > c.X(1), slow: [[c.X(25), c.X(28.5)]], end: c.X(31), fast: 130, crawl: 20, label, hidden: true }));
      w.flags[flag] = { bus, stop };
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
}
const bus10 = stopBus('ccu10-bus', 'bus10', 'Esplanade', 'ESPLANADE', 'A bus stop, and a drain too wide to jump. Stand still at the stop: the conductor crawls for you. Hop on the footboard, keep on over the drain, and step off forwards on his one “aaste” after it. There isn’t a second one: he turns into the depot.');

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
    tagline: 'Kumartuli’s potters paint each clay figure from the feet up, and carry it out the moment it’s done.',
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
  cp0: false,
  cps: [-0.6],
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


/** CCU-04 act: the tall stack. A pile too tall to climb blocks the drain; a customer is working down it,
 *  bottom book by bottom book. The short stack in front of it is wanted too: wait on the pavement, not on it */
/** a pile too tall to climb, bought down from the bottom; `tall` books to start, `flag` for the route */
function thakAct(id: string, tall: number, flag: string, label: string, advice: string): Act {
  return {
    id,
    w: 24,
    cp0: false,
    cps: [-1.5],
    advice,
    paint: (g, c) => {
      g.pit(c.x + 3, c.x + 17);
    },
    build: (w, c) => {
      const x = c.x;
      w.add(new Stall(c.X(3), c.X(18), label));
      boiDrain(w, x + 3, x + 18);
      const t1 = w.add(new Stack(c.X(4), px(2), 2));
      const t2 = w.add(new Stack(c.X(6), px(2), tall));
      const t3 = w.add(new Stack(c.X(10), px(2), 2));
      const t4 = w.add(new Stack(c.X(14), px(2), 1));
      const a = w.add(new Customer(c.X(7), '#6D4C41'));
      const b = w.add(new Customer(c.X(4.5), '#5C6BC0'));
      w.flags[flag] = { t1, t2, t3, t4 };
      w.when(
        (w2) => w2.player.cx > c.X(0.5),
        (w2) => {
          Array.from({ length: tall - 3 }, (_, k) => 0.6 + k).forEach((t) => w2.after(t, () => a.ask(w2, t2, 1, 0.5)));
          [0.4, 1.8].forEach((t) => w2.after(t, () => b.ask(w2, t1, 1, 0.6)));
        },
      );
      void t3;
      void t4;
    },
  };
}
const thak = thakAct('ccu04-thak', 7, 'thak', 'SECOND HAND', 'A pile too tall to climb stands in the drain, and a customer is buying it down from the bottom, one book at a time. The short stack in front of it is wanted too, so don’t wait on that: wait on the pavement till the tall pile is three high, then jump straight on to it.');


/** CCU-03 act: the second seller's tin, wider, with fewer peanuts and a quicker hand */
const dui3: Act = {
  id: 'ccu03-dokan',
  w: 30,
  // on the pavement before the tin: a run or a hop from here never reaches the muri
  cp0: false,
  cps: [-0.2],
  advice: 'The next seller’s tin is wider and his hand is quicker, and his peanuts are further apart. Same rules: wait on the rim for his first shake, be on a peanut for every shake, and hop on as the chilli comes up under you.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 26);
  },
  build: (w, c) => {
    const x = c.x;
    const tin = w.add(new Tin({ x0: c.X(3), x1: c.X(27), nuts: [5, 8, 11, 14, 17, 20, 23].map((k) => c.X(k)), every: 3.0, chilliFrom: 2 }));
    w.flags.tinB = tin;
    onPass(w, c.X(0.5), (w2) => {
      if (tin.t0 < 0) tin.t0 = w2.tick + 60;
    });
    sign(w, x + 0.4, 10.4, 3.4, 'JHALMURI', 'shop', null, 'Gariahat');
  },
};


/** CCU-10 act 3: north Kolkata's rok again, an adda and the maid's bucket on a beat */
const rok10: Act = {
  id: 'ccu10-rok',
  w: 34,
  cp0: false,
  cps: [3.5],
  advice: 'The rok again: walk through the adda without stopping, and hop each sheet of water from the door.',
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 29).fill(c.x + 6, c.x + 29, 13, 14, '#');
  },
  build: (w, c) => {
    w.add(new House(c.X(6), c.X(30)));
    khod(w, c.x + 6, c.x + 30);
    const a = w.add(new Adda(c.X(12), c.X(18), 3));
    const wash = w.add(new Wash(c.X(27), c.X(9)));
    teaRound(w, [a], c.X(31));
    let beat = -1;
    w.add(
      new (class extends Entity {
        update(w2: World) {
          if (beat < 0 && w2.player.cx > c.X(7)) beat = w2.tick;
          if (beat >= 0 && (w2.tick - beat) % 360 === 0) wash.throw(w2);
        }
      })(),
    );
    w.flags.rokWash = wash;
  },
};

/** CCU-10 act: College Street again (CCU-04's stacks), and its rule broken. 04 taught: the stack he points at
 *  goes down a book. Here a customer is bringing books back: the stack he points at grows, a book at a time,
 *  up to the high stall. The quiet one is being bought, and goes */
const pherot: Act = {
  id: 'ccu10-pherot',
  cp0: false,
  cps: [-1.3],
  w: 24,
  advice: 'College Street again, but this customer is bringing books back: the stack he points at grows a book at a time, all the way up to the high stall. Stand on that one and ride it up. The quiet stack next to it is being bought down.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 2, x + 9).fill(x + 10, x + 14, 8, 14, '#').fill(x + 15, x + 15, 10, 14, '#').fill(x + 16, x + 16, 12, 14, '#').fill(x + 17, x + 17, 13, 14, '#').fill(x + 16, x + 16, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Stall(c.X(2), c.X(10), 'RETURNS'));
    boiDrain(w, x + 2, x + 10);
    const b = w.add(new Stack(c.X(4), px(2), 2));
    const a = w.add(new Stack(c.X(7), px(2), 1));
    w.add(new Customer(c.X(9.2), '#00897B'));
    const buyer = w.add(new Customer(c.X(3.2), '#6D4C41'));
    onPass(w, c.X(1), (w2) => {
      for (let k = 0; k < 7; k++) w2.after(1 + 1.2 * k, () => a.shelve(w2));
      [2, 3.5].forEach((t) => w2.after(t, () => buyer.ask(w2, b, 1, 0.6)));
    });
    w.flags.pherot = { a, b };
  },
};

/** CCU-10 act: the bore's front again (CCU-07's causeway), and its rule broken. 07 taught: keep running ahead
 *  of it. Here it comes back down the river at you, faster than anyone runs: get up on the refuge and let it
 *  go by under you */
const phire: Act = {
  id: 'ccu10-phire',
  w: 30,
  advice: 'The causeway again, but the front is coming back down the river this time, straight at you and faster than you can run. Don’t run from it: get up on the refuge and let it go by under you.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 5, x + 6).fill(x + 10, x + 12, 12, 14, '#');
  },
  build: (w, c) => {
    pool(w, c.x + 5, c.x + 7, 16, { colors: NALA, cause: 'ccu-nala' });
    const ebb = w.add(new Ebb(c.X(34), c.X(-2), 150, px(5)));
    onPass(w, c.X(8), (w2) => {
      if (ebb.t0 < 0) ebb.t0 = w2.tick + 12;
    });
    sign(w, c.x + 0.3, 10.4, 3.4, 'CAUSEWAY', 'green', null, 'tide turning');
    w.flags.phire = ebb;
  },
};

/** CCU-10 act: the canopy again (CCU-09's dhak), and its rule broken. 09 taught: wait, and run under it as it
 *  goes up. Now they are hauling it up for good, level with the gallery: get on top of it while it's down,
 *  ride it up, step across. Under it there's no way through, and it comes down again */
const chhad: Act = {
  id: 'ccu10-chhad',
  cp0: false,
  cps: [-0.2],
  w: 26,
  advice: 'The canopy again, but they’re hauling it up for good now, level with the gallery: no running under it this time, there’s no way through. Get on top of it while it’s down, ride it up, and step across to the gallery.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 1, 13, 14, '#').fill(x + 3, x + 14, 12, 12, '#').fill(x + 17, x + 20, 7, 14, '#').fill(x + 21, x + 21, 9, 14, '#').fill(x + 22, x + 22, 11, 14, '#').fill(x + 23, x + 23, 13, 14, '#');
  },
  build: (w, c) => {
    w.add(new Skeleton(c.X(1), c.X(21)));
    w.add(new Stakes(c.X(2), c.X(17)));
    const frame = w.add(new DhakFrame(c.X(5), px(10), px(7), px(12) - 2, 5, 1.6));
    onPass(w, c.X(1), (w2) => {
      if (frame.t0 < 0) frame.t0 = w2.tick + 60;
    });
    sign(w, c.x + 0.2, 10.4, 3.2, 'CANOPY', 'green', null, 'going up');
    w.flags.chhad = frame;
  },
};

/** CCU-10 act: the pandal again, and its rule broken. After the festival they take it down: a cloth top you
 *  land on is untied under you, on to the stakes; the bamboo holds now. Over each panel, bamboo to bamboo,
 *  and never wait under the roof frame, where they let a panel down on to the bamboo */
const khola: Act = {
  id: 'ccu10-khola',
  w: 32,
  cp0: false,
  cps: [-0.7],
  advice: 'The pandal again, after the festival: they’re taking it down. A cloth top you land on, they untie under you. Stand on the bamboo now and jump over each panel to the next bamboo. Under the roof frame they let a panel down on to the bamboo: straight on from that one.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 1, 13, 14, '#');
    for (const b of [2, 7, 17, 22]) g.fill(x + b, x + b + 1, 12, 12, '=');
    // the bamboo under the frame is lashed double: a panel let down on to it has nowhere to push you
    g.fill(x + 12, x + 13, 12, 12, '#');
    g.fill(x + 11, x + 14, 6, 6, '#').fill(x + 27, x + 31, 12, 14, '#');
  },
  build: (w, c) => {
    w.add(new Skeleton(c.X(1), c.X(28)));
    w.add(new Stakes(c.X(2), c.X(27)));
    const cloth = [5, 10, 15, 20, 25].map((k, i) => w.add(new ClothPanel(c.X(k), px(1), px(12), 2, i, true)));
    for (const p of cloth)
      w.when(
        (w2) => w2.player.onGround && w2.player.isRiding(p.solid),
        (w2) =>
          w2.after(0.25, () => {
            p.tied = false;
            p.solid.collidable = false;
            w2.sfx('slide', p.x, p.base);
          }),
      );
    const down = w.add(new Lowered(c.X(12), px(2), px(7), px(12) - 2, 2));
    w.when(
      (w2) => w2.player.onGround && w2.player.y + w2.player.h === px(12) && w2.player.cx > c.X(12) && w2.player.cx < c.X(14),
      (w2) => down.lower(w2, 0.5),
    );
    sign(w, c.x + 0.2, 10.4, 3.4, 'PANDAL', 'green', null, 'coming down');
    w.flags.khola = { cloth, down };
  },
};

/** CCU-10 act 4: Kumartuli once more, the figures finishing fast */
const kumor10: Act = {
  id: 'ccu10-kumor',
  cp0: false,
  cps: [-3.3],
  w: 24,
  advice: 'Kumartuli once more: on the ones painted below the waist, quickly off the others, and walk (never jump) down on to the pale dry ones.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Ghat(c.X(0), c.X(20)));
    figures(
      w,
      [
        [x + 1, 2, 0.3, 0.12, 'man'],
        [x + 4, 3, 0.55, 0.16, 'horse'],
        [x + 6, 2, 0, 0, 'woman'],
        [x + 9, 3, 0.2, 0.12, 'man'],
        [x + 13, 3, 0.4, 0.14, 'horse'],
        [x + 15, 2, 0, 0, 'woman'],
      ],
      c.X(0),
    );
  },
};


/** CCU-05 act: the long lane to the ghat steps, every kind of figure mixed: read each one before you land */
const lane: Act = {
  id: 'ccu05-lane',
  w: 34,
  advice: 'The long lane down to the river: every kind of figure, mixed. Read each one before you land: below the waist, stay; above it, go on at once; pale and dry, walk down on to it, never jump.',
  paint: (g, c) => {
    g.pit(c.x, c.x + 29);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Ghat(c.X(0), c.X(30)));
    figures(
      w,
      [
        [x + 1, 2, 0.2, 0.08, 'woman'],
        [x + 3, 3, 0.7, 0.12, 'horse'],
        [x + 5, 2, 0, 0, 'man'],
        [x + 8, 2, 0.1, 0.08, 'horse'],
        [x + 11, 3, 0.4, 0.1, 'woman'],
        [x + 13, 2, 0, 0, 'man'],
        [x + 15, 1, 0, 0, 'horse'],
        [x + 18, 2, 0.5, 0.08, 'man'],
        [x + 21, 3, 0.1, 0.08, 'woman'],
        [x + 23, 2, 0, 0, 'horse'],
        [x + 26, 2, 0.3, 0.1, 'man'],
      ],
      c.X(0),
    );
  },
};


/** CCU-09 act: the gate arch, where two panels go up at once across both next footholds, the far one under
 *  the arch's frame */
const toran: Act = {
  id: 'ccu09-toran',
  cp0: false,
  cps: [-3.2],
  w: 26,
  advice: 'At the gate arch two panels go up at once, across both the next bamboos: a full jump on to the first, run across both tops, and off the far end at once, because the second is under the arch’s frame and they tie another on above it.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 2, x + 3, 12, 12, '=').fill(x + 6, x + 7, 12, 12, '=').fill(x + 8, x + 9, 12, 12, '=').fill(x + 12, x + 15, 12, 12, '=').fill(x + 8, x + 11, 7, 7, '#').fill(x + 18, x + 25, 12, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Skeleton(c.X(0), c.X(26)));
    w.add(new Stakes(c.X(0), c.X(18)));
    const p1 = w.add(new ClothPanel(c.X(6), px(2), px(12), 2, 1));
    const p2 = w.add(new ClothPanel(c.X(8), px(2), px(12), 2, 3));
    w.add(new Decorator(c.X(10) + 6, px(12), p2));
    tieWhenOn(w, p1, x + 2, x + 4);
    tieWhenOn(w, p2, x + 2, x + 4);
    stackWhenOn(w, p2, 2, 0.5);
    w.flags.toran = p2;
  },
};


/** CCU-05 carry acts: each stretch of the ghat has a mud gap too wide to jump and a big figure nearly
 *  painted beside it. Stand on its head: when the paint reaches the crown they carry it across, with you. */
function carryAct(id: string, n: number, rate: number, advice: string): Act {
  return {
    id,
    w: 22 * n,
    advice,
    paint: (g, c) => {
      for (let k = 0; k < n; k++) {
        const s0 = c.x + 22 * k;
        g.fill(s0 + 2, s0 + 2, 13, 14, '#').pit(s0 + 6, s0 + 15).fill(s0 + 16, s0 + 21, 12, 14, '#');
      }
    },
    build: (w, c) => {
      for (let k = 0; k < n; k++) {
        const s0 = c.x + 22 * k;
        w.add(new Ghat(px(s0 + 6), px(s0 + 16)));
        const big = w.add(new BigFigure(px(s0 + 3), rate));
        big.stopX = px(s0 + 14.5);
        w.when(
          () => big.riding(w),
          () => {
            if (big.state === 'wait') big.state = 'paint';
          },
        );
        (w.flags.bigs ??= []).push(big);
      }
    },
  };
}
const pratima = carryAct('ccu05-pratima', 2, 0.15, 'Down at the ghat the mud is too wide to jump. Each big figure beside it is nearly painted: climb on to its head and stay there. When the paint reaches the crown, they carry it across, with you; step off on to the landing.');


/** CCU-08 broken-rok acts: each break in the rok is crossed only on the tea seller's plank, laid as he
 *  comes and taken up again a few seconds after he has passed. He comes when someone sits in the adda
 *  before the break: [adda from, adda to, gap from, gap to, where he starts], columns in the act */
function brokenRok(id: string, w0: number, segs: [number, number, number, number, number][], speed: number, advice: string): Act {
  return {
    id,
    w: w0,
    cp0: false,
    cps: [3.5, ...segs.map(([, a1]) => a1 + 0.2)],
    advice,
    paint: (g, c) => {
      g.pit(c.x, c.x + w0 - 1).fill(c.x, c.x + w0 - 1, 13, 14, '#');
      for (const [, , g0, g1] of segs) g.fill(c.x + g0, c.x + g1, 13, 14, '.');
    },
    build: (w, c) => {
      w.add(new House(c.X(0), c.X(w0)));
      khod(w, c.x, c.x + w0);
      const out: { a: Adda; t: TeaSeller; plank: Solid }[] = [];
      for (const [a0, a1, g0, g1, from] of segs) {
        const a = w.add(new Adda(c.X(a0), c.X(a1), 3));
        const t = w.add(new TeaSeller(c.X(from), -speed, [a]));
        w.when(() => a.held, () => w.after(0.3, () => { if (!t.active) t.send(c.X(from)); }), false);
        const plank = new Solid(c.X(g0), px(13), px(g1 - g0 + 1), 4);
        plank.oneWay = true;
        plank.collidable = false;
        plank.velX = 0;
        let laid = -1,
          passed = -1;
        w.add(
          new (class extends Entity {
            solid = plank;
            update(w2: World) {
              if (t.active && t.x < c.X(g1 + 2) && t.x > c.X(g0 - 2) && laid < 0 && passed === -1) {
                laid = w2.tick;
                plank.collidable = true;
              }
              // taken up again three seconds after he has crossed it, unless someone's on it
              if (laid >= 0 && passed < 0 && t.x < c.X(g0 - 2)) passed = w2.tick;
              if (passed >= 0 && w2.tick - passed > 360 && !w2.player.isRiding(plank)) {
                plank.collidable = false;
                laid = -1;
                passed = -2;
              }
            }
            draw(ctx: CanvasRenderingContext2D) {
              if (!plank.collidable) return;
              ctx.fillStyle = '#8B6B3E';
              ctx.fillRect(plank.x, plank.y, plank.w, 4);
              ctx.fillStyle = '#6B4A2E';
              for (let x = plank.x + 10; x < plank.x + plank.w; x += 22) ctx.fillRect(x, plank.y, 1, 4);
            }
          })(),
        );
        out.push({ a, t, plank });
        w.flags.addas = [...(w.flags.addas ?? []), a];
      }
      w.flags[id] = out;
    },
  };
}
const gali = brokenRok('ccu08-gali', 34, [[6, 12, 13, 20, 32]], 55, 'A lane broken once more. Sit in the adda before the break and wait for the tea seller; his plank goes back up a few seconds after he’s gone by, so cross it right behind him.');


/** CCU-10 acts 5 and 6: back over Howrah Bridge, on the porters, both ways up */
const setu10a = relay('ccu10-setu', [45, 63, 83], true, 'Howrah Bridge again: tall porter, short one under you before his CHA board, tall one over you before the next, never jumping into a load coming the other way.', [0.2]);


/** CCU-09 act: the canopy. Over a long stretch of lashed bamboo they let the canopy frame down on the
 *  dhak's beat to tie it, and haul it up again: wait on the bamboo before it, and run under it as it goes up */
const dhak: Act = {
  id: 'ccu09-dhak',
  cp0: false,
  cps: [-2.1],
  w: 24,
  advice: 'The canopy: over the long lashed bamboo they let its frame right down on each beat of the dhak, then haul it up. Wait on the bamboo before it, and the moment it starts going up, run under it in one go.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 1, 13, 14, '#').fill(x + 2, x + 3, 12, 12, '=').fill(x + 6, x + 14, 12, 12, '#').fill(x + 17, x + 18, 12, 12, '=').fill(x + 20, x + 21, 13, 14, '#');
  },
  build: (w, c) => {
    w.add(new Skeleton(c.X(1), c.X(21)));
    w.add(new Stakes(c.X(2), c.X(20)));
    const frame = w.add(new DhakFrame(c.X(6), px(9), px(6), px(12) - 2));
    onPass(w, c.X(1), (w2) => {
      if (frame.t0 < 0) frame.t0 = w2.tick + 60;
    });
    sign(w, c.x + 0.2, 10.4, 3.2, 'DHAK', 'green', null, 'on the beat');
    w.flags.dhak = frame;
  },
};

/** CCU-09 act (the bible's second betrayal: opening night, the queue). The queue stands one to a bamboo
 *  and steps one bamboo on at each beat of the dhak. Climb on it and they shove you off; under it are the
 *  stakes. Move up into the bamboo just left, beat by beat */
const line: Act = {
  id: 'ccu09-line',
  cp0: false,
  cps: [-0.3],
  w: 30,
  advice: 'Opening night, and the queue for the pandal: one person to a bamboo, and on each beat of the dhak they all step one bamboo on. Nobody climbs over the queue, and under it are the stakes. Move up into the bamboo they’ve just left, one beat at a time.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 1, 13, 14, '#');
    for (let k = 0; k < 8; k++) g.fill(x + 3 + 3 * k, x + 4 + 3 * k, 12, 12, '=');
    g.fill(x + 26, x + 29, 12, 14, '#');
  },
  build: (w, c) => {
    w.add(new Skeleton(c.X(1), c.X(26)));
    w.add(new Stakes(c.X(2), c.X(26)));
    const xs = Array.from({ length: 8 }, (_, k) => c.X(3 + 3 * k) + 8);
    const q = w.add(new Queue(xs, px(12), [1, 2, 3]));
    onPass(w, c.X(1), (w2) => {
      if (q.t0 < 0) q.t0 = w2.tick + 120;
    });
    sign(w, c.x + 26.4, 8.4, 3.2, 'QUEUE', 'green', null, 'this way');
    w.flags.line = q;
  },
};

/** CCU-09 lift acts: up the inside of the pandal to its gallery. A panel already tied is your step; stand
 *  on it and they tie the next one on above it (slowly: the decorator climbs up with the cloth), lifting
 *  you to the next bamboo. At the top, under the roof frame, they tie one more: off before that. */
function liftAct(id: string, wait: number, advice: string): Act {
  return {
    id,
    w: 30,
    cp0: false,
    cps: [11.6, 27],
    advice,
    paint: (g, c) => {
      const x = c.x;
      g.fill(x + 1, x + 1, 13, 14, '#').fill(x + 3, x + 4, 12, 12, '=').fill(x + 6, x + 7, 7, 7, '=').fill(x + 9, x + 10, 7, 7, '=').fill(x + 11, x + 22, 3, 3, '=').fill(x + 8, x + 11, 1, 1, '#');
    },
    build: (w, c) => {
      const x = c.x;
      w.add(new Skeleton(c.X(0), c.X(30)));
      w.add(new Stakes(c.X(2), c.X(22)));
      const p1 = w.add(new ClothPanel(c.X(3), px(2), px(12), 1, 2, true));
      const p2 = w.add(new ClothPanel(c.X(9), px(2), px(7), 1, 0, true));
      p1.speed = 1;
      p2.speed = 1;
      w.add(new Decorator(c.X(5) + 6, px(12), p1));
      stackWhenOn(w, p1, 4, wait);
      // at the top: rest on it and they tie on one more, up into the roof frame
      w.when(
        (w2) => w2.player.onGround && w2.player.isRiding(p2.solid),
        (w2) =>
          w2.after(wait, () => {
            p2.raise(w2, 3);
            w2.after(1.6 + wait, () => p2.raise(w2, 1));
          }),
      );
      w.flags[id] = { p1, p2 };
      void x;
    },
  };
}
const uthan = liftAct('ccu09-uthan', 2.7, 'Up inside the pandal: stand on the tied panel and wait while they tie the next one on above it; it lifts you to the high bamboo. Do it again on the next, then step off on to the gallery straight away: there’s one more coming, up into the roof frame.');
const uthan2 = liftAct('ccu09-uthan2', 3.1, 'The second tower: the same lift, the decorator slower up the ladder. Wait for it, and off on to the gallery the moment it stops.');

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
      hint: 'A walk round town: jump the kerb ditch, climb the Maidan steps, hop the tram-stop posts and the parked thela. Past the thela there’s a tram rail in the road. Jump on to it and your foot drops into the groove: the rail steers you along its line, no turning, no jumping, straight into the rail-works trench. Walk on to the rail instead (up on the thela, and walk off it), then jump the trench. At Esplanade, ride the little tram across. And the children’s chalk rivers on the Maidan and by the door are kumir-danga: the kumir in the middle catches anyone on his water. Wait on the bank till he shuts his eyes and counts, then run straight across.',
      paint: (g) => {
        g.pit(70, 71);
      },
      extra: (w) => {
        feet(w);
        w.add(new Rail(px(62), px(70), px(72)));
        // kumir-danga: a chalk river too wide to jump, safe only while the kumir counts
        w.flags.kumirA = w.add(new Kumir(px(16), px(23.6), 4.5, 2.6));
        w.flags.kumirB = w.add(new Kumir(px(101.5), px(110.8), 6.5, 2.6));
        sign(w, 105.4, 10.4, 3.2, 'KUMIR-DANGA', 'green', null, 'chalk river');
        onPass(w, px(56), (w2) => w2.guide('Tram! Ei je, shunun! | The tram line! Excuse me, listen!', (w3) => w3.player.cx < px(70)));
      },
      cps: [8, 42, 57, 75, 97],
      par: 36,
    }),
    meta: meta('rail-groove-sticks-foot', ['groove-catch'], 'ccu-esplanade-tram-shuttle'),
  },
  longStage({ base: aasteRoom(), par: 23, acts: [], twist: 'ccu-stop', shape: 'short', meta: meta('exit-moving-vehicle-on-shout', ['exit-facing-forward'], 'ccu-bus-crawls-for-whoever-waits') }),
  longStage({ base: muriRoom(), par: 38, acts: [dui3], twist: 'ccu-thonga', shape: 'short', meta: meta('shake-tin-sorts-big-pieces-up', ['shake-sorts-up', 'B35'], 'ccu-tin-with-no-peanuts') }),
  longStage({ base: boiRoom(), par: 23, acts: [thak], twist: 'ccu-set', shape: 'short', meta: meta('stack-pulled-from-bottom', ['stack-drops-one-height'], 'ccu-customer-buys-the-whole-set') }),
  longStage({ base: kumartuliRoom(), par: 70, acts: [uthon, lane, pratima, ghat], twist: 'ccu-murti', shape: 'long', meta: meta('painted-figure-carried-out', ['paint-done-departs', 'dry-cracks-from-height'], 'ccu-ride-the-finished-figure-out') }),
  longStage({ base: poleRoom(), par: 85, acts: [points, duiLine], twist: 'ccu-pole-turn', shape: 'long', meta: meta('pole-swings-at-junction', ['pole-sweep', 'points-switch'], 'ccu-pole-turned-over-the-terminus') }),
  longStage({ base: howrahRoom(), par: 127, acts: [girder, dui, ulto, jowar, pylon, baan], twist: 'ccu-arch', shape: 'marathon', lives: 'act', meta: meta('head-load-platforms', ['carry-platform', 'porter-rests'], 'ccu-station-arch-sweeps-the-loads') }),
  longStage({ base: addaRoom(), par: 60, acts: [rok, tokta, gali], twist: 'ccu-dorja', shape: 'wtf', meta: meta('stand-still-held-by-chat', ['held-until-event'], 'ccu-old-men-on-the-doorstep-rise-for-tea') }),
  longStage({ base: pandalRoom(), par: 72, acts: [sinri, toran, chala, dhak, uthan, uthan2, line], twist: 'ccu-dwar-kapor', shape: 'long', meta: meta('cloth-panel-covers-foothold', ['build-order-wall'], 'ccu-last-panel-tied-over-the-door') }),
  longStage({ base: finaleRoom(), par: 128, acts: [bus10, tram10, chhad, phire, rok10, pherot, kumor10, khola, setu10a], twist: 'ccu-stup', shape: 'long', lives: 'act', meta: meta('finale-book-bundle-loads', ['customers-ask-mid-crossing'], 'ccu-door-on-a-pile-being-bought-down') }),
];
