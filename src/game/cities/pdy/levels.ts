import type { LevelDef, World } from '../../world';
import { lines as L } from './lines';
import { Thing } from '../../entities/traps';
import { collectible, door, geyser, group, gust, prop, px, rider, rival, roller, shot, sign, spikes, thing, thingOn, water } from '../../levels/kit';
import { Act, G, deco, pool } from '../../levels/acts';
import { dropFloor, onPass, popOnJump } from '../../levels/trolls';
import { DT } from '../../constants';
import { exitTwist } from '../../levels/twists';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { Kepi } from '../../entities/tamil';
import { MIMOSA_META, PETANQUE_META, aaru, carreau, doublette, mimosaRoom, petanqueRoom, pitFloor, pointe, thenga, tir } from './encores';
/** the sea where it has eaten the Promenade: a splash */
const seaFloor = (w: World, x0: number, x1: number) => pitFloor(w, x0, x1, 'splash');

// Puducherry: yellow walls, cobbled rues, a rocky seafront that sneezes,
// bollards that close the beach road at six, and a canal bridge that opens
// for boats. Tamil + English, with a little French.

const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });
const YELLOW = { fill: '#F2C14E', trim: '#FFF8E7', line: 'rgba(150,95,20,0.35)' };


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');
const SEA: [string, string] = ['rgba(46,150,200,0.72)', 'rgba(16,70,120,0.94)'];

/** PDY-02: clear rock pools are ankle deep (walk), the dark one is deep (jump); that rock is a turtle. */
const rockPools: Act = {
  id: 'pdy02-pools',
  w: 34,
  advice: 'Clear rock pools are only ankle deep: walk through. The dark one is deep: jump it. The rock in the last pool is a turtle: jump the whole pool.',
  paint: (g, c) => {
    g.pit(c.x + 16, c.x + 17).pit(c.x + 24, c.x + 27);
  },
  build: (w, c) => {
    const { X } = c;
    for (const [a, b] of [
      [5, 7],
      [10, 13],
      [16, 18],
      [24, 28],
    ])
      pool(w, c.x + a, c.x + b, 15.02, { colors: SEA });
    const turtle = thing(w, 'rock', c.x + 25, 0, { dy: 238, w: 32, h: 12 });
    w.when(
      (w2) => w2.player.landTick === w2.tick && w2.player.isRiding(turtle.solid),
      (w2) => {
        say(w2, 'Aamai! | A turtle!', turtle.cx, G - 3, 1);
        w2.sfx('splash', turtle.cx, turtle.y);
        turtle.moveTo(w2, turtle.solid.x + 20, turtle.solid.y + 40, 0.5, 'in');
      },
    );
    onPass(w, X(2), (w2) => w2.guide('Thanni-la kaal vekkaadhe, Monsieur! | Don’t step in the water, sir!'));
  },
};

/** PDY-03: French signs. "Jump!" (don't: the balcony bites), "Walk" (don't: the street drops), then one honest sign. */
const frenchSigns: Act = {
  id: 'pdy03-signs',
  w: 32,
  advice: 'The signs lie, then don’t: walk through the cardboard flower pot under the balcony, jump the street that says walk, and believe the last one.',
  paint: (g, c) => {
    g.fill(c.x + 7, c.x + 12, 12, 12, '#');
    g.fill(c.x + 8, c.x + 11, 13, 13, c.U[0]);
    g.fill(c.x + 18, c.x + 20, G, 17, c.L[0]);
    g.pit(c.x + 27, c.x + 28);
  },
  build: (w, c) => {
    const { X } = c;
    deco(w, 'flowers', X(9.5), G, { layer: 2 });
    popOnJump(w, c.U[0], X(6), X(13.5));
    dropFloor(w, c.L[0]);
    sign(w, c.x + 3, G - 4.4, 3.2, 'SAUTEZ!', 'wood', 'up', 'jump!');
    sign(w, c.x + 14.5, G - 4.4, 3.4, 'MARCHEZ', 'wood', 'right', 'walk');
    sign(w, c.x + 23.5, G - 4.4, 3.2, 'SAUTEZ!', 'wood', 'up', 'vraiment');
    onPass(w, X(2), (w2) => w2.guide('French sign, Monsieur! Sautez means jump! | French sign, sir! Sautez means jump!'));
  },
};

/** PDY-04: at six the paving turns to spikes behind you, a little faster than you run. */
const sixOClock: Act = {
  id: 'pdy04-closing',
  w: 32,
  advice: 'At six the paving turns to spikes behind you, a little faster than you can run: don’t stop for anything.',
  paint: (g, c) => {
    g.pit(c.x + 9, c.x + 10).pit(c.x + 22, c.x + 23);
    g.fill(c.x + 15, c.x + 15, 14, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const skip = new Set([9, 10, 15, 22, 23]);
    const rows: { t: number; s: Thing; up: boolean }[] = [];
    for (let t = 0; t < 29; t++) if (!skip.has(t)) rows.push({ t, s: w.add(new Thing('spikerow', X(t), px(G) + 1, { solid: false, deadly: 'spikes', layer: -4 })), up: false });
    let t0 = -1;
    onPass(w, X(3), (w2) => {
      t0 = w2.tick;
      w2.sfx('bell', X(4), px(G));
      say(w2, 'Six mani! Road close! | Six o’clock! The road is closed!', X(6), G - 4);
    });
    w.onTick((w2) => {
      if (t0 < 0) return;
      const front = X(0) - 40 + (w2.tick - t0) * DT * 152;
      for (const r of rows) {
        if (r.up || X(r.t) > front) continue;
        r.up = true;
        if (r.t % 3 === 0) w2.sfx('spikes', X(r.t) + 8, px(G));
        r.s.moveTo(w2, X(r.t), px(G) - 10, 0.05, 'out');
      }
    });
    sign(w, c.x + 0.5, G - 4.4, 3.2, '18:00', 'green', null, 'road closed');
  },
};

/** PDY-05: two ferries: the first waits for you, the second only kisses the post: jump on as it passes. */
const ferries: Act = {
  id: 'pdy05-raft',
  w: 30,
  advice: 'Ride the first raft to the stone post. The second one barely stops at the post: step on the moment it touches, and get off at the far bank.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 25).fill(c.x + 13, c.x + 13, G, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 26, 15.4, { colors: ['rgba(60,140,150,0.82)', 'rgba(20,70,80,0.96)'] });
    const ferry = (a: number, b: number, speed: number, waitA: number, waitB: number, phase: number) => {
      const r = w.add(new Thing('board', a, px(G), { w: 48, h: 10, layer: 2, oneWay: true }));
      const run = (b - a) / speed;
      const T = waitA + run + waitB + run;
      w.onTick((w2) => {
        const t = (((w2.tick * DT + phase) % T) + T) % T;
        let x = a,
          v = 0;
        if (t < waitA) x = a;
        else if (t < waitA + run) {
          x = a + (t - waitA) * speed;
          v = speed;
        } else if (t < waitA + run + waitB) x = b;
        else {
          x = b - (t - waitA - run - waitB) * speed;
          v = -speed;
        }
        r.solid.velX = v;
        r.place(w2, x, px(G));
      });
      return r;
    };
    ferry(X(4), X(10), 48, 1.4, 1.4, 0);
    ferry(X(14), X(23), 62, 0.45, 1.4, 1.1);
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'FERRY', 'wood', 'right', 'French side');
    onPass(w, X(2), (w2) => w2.guide('Boat wait pannum, take your time! | The boat will wait, take your time!'));
  },
};

/** PDY-06: coconuts drop when you jump under the palms. Walk under the first; bait the second before the urchins. */
const jumpyPalms: Act = {
  id: 'pdy06-palms',
  w: 30,
  advice: 'A coconut drops when you jump under its palm: walk under the first one, and before the sea urchins, hop once to bring the second one down, then jump.',
  paint: (g, c) => {
    g.pit(c.x + 14, c.x + 16).fill(c.x + 14, c.x + 16, 17, 17, '#').fill(c.x + 14, c.x + 16, 16, 16, '^');
  },
  build: (w, c) => {
    const { X } = c;
    prop(w, 'palm', c.x + 6, G, { h: 86, lean: 6 });
    prop(w, 'palm', c.x + 13.2, G, { h: 86, lean: 4 });
    const nut = (tx: number, from: number, to: number, roll: boolean) => {
      const n = w.add(new Thing('coconut', X(tx), px(G) - 86 + 6, { solid: false, layer: 3 }));
      w.when(
        (w2) => w2.player.jumpTick === w2.tick - 1 && w2.player.cx >= X(from) && w2.player.cx <= X(to),
        (w2) => {
          w2.sfx('crack', n.cx, n.y);
          n.setDeadly('hit');
          n.fall(w2, {
            g: 1700,
            then: (w3) => {
              n.setDeadly(false);
              if (roll) {
                n.hide();
                roller(w3, 'coconut', n.x, n.y, 90, { cause: 'hit', ghost: true });
              }
            },
          });
        },
      );
    };
    nut(6.6, 4.5, 8.5, false);
    // (measured: it meets the head of a dad who jumps the urchins from their edge, a little after take-off)
    nut(13.6, 10.5, 14.5, true);
    onPass(w, X(2), (w2) => w2.guide('Thenga venuma? Jump pannu, Dad! | Want a coconut? Jump, Dad!'));
  },
};

/** PDY-07: the waves come in threes and the third one is big: be up on a rock for it. */
const waveSets: Act = {
  id: 'pdy07-waves',
  w: 34,
  advice: 'Waves come in sets of three: the first two only push you back, the third is the big one. Be up on a rock when it comes.',
  paint: (g, c) => {
    g.fill(c.x + 10, c.x + 12, 12, 14, '#').fill(c.x + 21, c.x + 23, 12, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const sea = pool(w, c.x + 34, c.x + 34, 15.02, { colors: SEA });
    const push = gust(w, c.x, 13.5, 34, 2.5, -150);
    // each surge: 0.9 s up the beach, 0.9 s back; 1.2 s between; 3.4 s of calm after every third
    const SURGE = 1.8,
      GAPS = 1.2,
      CALM = 3.4;
    const set = 3 * SURGE + 2 * GAPS + CALM;
    let t0 = -1;
    onPass(w, X(1.5), (w2) => (t0 = w2.tick));
    w.onTick((w2) => {
      push.on = false;
      sea.x0 = X(34);
      sea.level = px(19);
      w2.flags[c.f('big')] = 0;
      if (t0 < 0) return;
      const t = ((w2.tick - t0) * DT) % set;
      for (let i = 0; i < 3; i++) {
        const s = i * (SURGE + GAPS);
        if (t < s || t >= s + SURGE) continue;
        const k = (t - s) / SURGE;
        const reach = k < 0.5 ? k * 2 : 2 - k * 2;
        sea.x0 = X(34) - reach * px(31);
        sea.level = i === 2 ? px(12.6) : px(15.02);
        if (i === 2) w2.flags[c.f('big')] = 1;
        else {
          push.zone.x = sea.x0;
          push.zone.w = X(34) - sea.x0;
          push.on = true;
        }
        if (t - s < DT * 1.5) {
          w2.sfx(i === 2 ? 'rumble' : 'splash', X(28), px(G));
          if (i === 2) say(w2, 'Periya alai! | Big wave!', X(26), G - 5, 1);
        }
      }
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'SERENITY', 'wood', null, 'surf school');
    onPass(w, X(3), (w2) => w2.guide('Chinna alai dhaan, payapadaadhe! | Just little waves, don’t be scared!'));
  },
};

/** PDY-08: fireworks rain sparks where the glowing marks are: stop short of each shower, finish under the balcony. */
const sparkRain: Act = {
  id: 'pdy08-sparks',
  w: 32,
  advice: 'Each burst rains sparks wherever the glow marks the road: stop before the marks until it passes. The grand finale rains everywhere except under the balcony.',
  paint: (g, c) => {
    g.fill(c.x + 27, c.x + 29, 11, 11, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const volley = (at: number, cols: number[]) =>
      onPass(w, X(at), (w2) => {
        w2.sfx('remote', X(cols[0]), px(4));
        say(w2, 'Feu d’artifice! | Fireworks!', X(cols[2]), 4, 1);
        const marks = cols.map((t) => w2.add(new Thing('spark', X(t) + 5, px(G) - 4, { solid: false, layer: -2 })));
        w2.after(0.75, () =>
          cols.forEach((t, i) => {
            const sp = shot(w2, 'spark', X(t) + 5, 24 + (i % 2) * 6, 0, 330, 0, 'burnt');
            sp.stopOnSolid = true;
          }),
        );
        w2.after(1.45, () => marks.forEach((m) => m.hide()));
      });
    volley(3.5, [6, 8, 10, 12, 14]);
    volley(15.5, [17, 19, 21, 23, 25]);
    volley(26.2, [26, 27, 28, 29, 30, 31]);
    sign(w, c.x + 0.5, G - 4.4, 3.4, '14 JUILLET', 'wood', null, 'feu d’artifice');
    onPass(w, X(2), (w2) => w2.guide('Regarde en haut, Dad! Run, run! | Look up, Dad! Run, run!'));
  },
};

export const levels = (): LevelDef[] => [
  tour({
    id: 'PDY-01',
    city: 'PDY',
    name: "Bienvenue",
    nameEn: "Welcome to Puducherry",
    tagline: "Yellow walls, French street names and a rocky seafront.",
    lines: [
      "Vanakkam! Bienvenue à Pondichéry! | Hello! Welcome to Puducherry!",
      "Idhu Puducherry-oda thalainagaram! | The capital of its own union territory!",
      "1954 varaikkum French ooru! | It was a French town until 1954.",
      "Rue-nnu French-la, theru-nnu Tamil-la! | Street signs here are in French and Tamil.",
      "Saayangaalam Promenade-la car illa! | In the evening the Promenade belongs to walkers: no cars.",
      "Allez Dad, ippo real game! | Come on Dad, now the real game!",
    ],
    shouts: [
      [21, "Croissant! Fresh croissant! | Croissants! Fresh ones!"],
      [88, "Cycle vaadagaikku! | Bicycles for hire!"],
    ],
    ride: "cart",
    item: "pdy-croissant",
    signs: [[8, "RUE DE LA PLAGE", "beach road"], [55, "WHITE TOWN", "quartier français"], [102, "PROMENADE", "rock beach"]],
    props: [
      ["bougain", 4, {}],
      ["lamp", 18, {}],
      ["rueplaque", 33, {}],
      ["bougain", 62, {}],
      ["lamp", 90, {}],
      ["bougain", 106, {}],
    ],
    things: [["cyclist", 24]],
    hint: 'After the café terrace, the sea breeze takes a policeman’s red cap down the street and he comes running after it. Don’t stand in his way and don’t hop him (he leaps for his cap). Jump up and catch the cap as it goes over you: he stops and takes it back. On the Promenade the sea has eaten the path, and a yellow plywood square lies on the far side of the gap like a landing mat: it is not the far side. The moment you jump for it, it slides a tile on and the water it covered is under you. Jump long, for the sea wall itself, not for the paint.',
    // (tour-pdy-b20) the Promenade: the sea has taken four tiles of path past the deck; the yellow
    // square that seems to be the landing is a loose plywood lid over the last tile of water
    paint: (g) => g.pit(103, 106).fill(103, 106, 17, 17, '#'),
    extra: (w) => {
      const kepi = Kepi.place(w, { hatTx: 85, copTx: 85, giveUpTx: 40, groundTy: 15 });
      onPass(w, px(69), (w2) => kepi.start(w2));
      // the Promenade's gap: sea water, and the painted landing square that is not a landing
      seaFloor(w, px(103), px(107));
      const square = thing(w, 'pdy-square', 106, 15, { dy: -4, oneWay: true, layer: 2 });
      w.flags.square = 'lid';
      onPass(w, px(99.5), (w2) => w2.say('Manjal square-la land pannu, Dad! Easy! | Land on the yellow square, Dad! Easy!', w2.player.cx, w2.player.y, 2.2, 'rival'));
      onPass(w, px(100.6), (w2) => w2.guide('Paint-a nambaadhe, Dad. Suvar-a nambu. | Don’t trust the paint, Dad. Trust the wall.'));
      // commit to the jump and the lid slides a tile on, on to the sea wall, where it was never needed
      w.when(
        (w2) => w2.player.jumpTick === w2.tick && w2.player.cx >= px(100.4) && w2.player.cx < px(103.2) && w2.player.y + w2.player.h >= px(15) - 2,
        (w2) => {
          w2.flags.square = 'sliding';
          w2.sfx('creak', square.cx, square.y);
          square.moveTo(w2, px(107), square.y, 0.22, 'out', (w3) => {
            w3.flags.square = 'slid';
          });
        },
      );
    },
  }),
  longStage({
    base: {
    id: 'PDY-02',
    city: 'PDY',
    index: 2,
    name: 'Rock Beach',
    tagline: 'Big black rocks. Bigger waves. Perfect rhythm. Almost.',
    hint: 'The blowholes fire one after another, left to right. The last one sneezes twice: if it is still bubbling, it is not done.',
    par: 8,
    map: Grid.ground(12).pit(7, 22, 12).put(3, 11, '@').put(29, 11, 'E').rows(),
    build(w: World) {
      door(w);
      water(w, 14.5, { rate: 0, minTy: 14.5, colors: ['rgba(64,160,200,0.85)', 'rgba(20,80,120,0.95)'], cause: 'splash' });
      for (const tx of [7, 11, 15, 19]) thing(w, 'rock', tx, 13, { h: 24 });
      const P = 2.4;
      geyser(w, px(10), px(14.5), 104, P, [[0, 0.6]]);
      geyser(w, px(14), px(14.5), 104, P, [[0.6, 0.6]]);
      geyser(w, px(18), px(14.5), 104, P, [[1.2, 0.6]]);
      // the last one sneezes twice
      geyser(w, px(22), px(14.5), 104, P, [[1.8, 0.4], [0.05, 0.4]]);
      prop(w, 'umbrellas', 27, 12, { n: 2 });
      thing(w, 'lighthouse', 1, 4, { solid: false, layer: -6 });
      rival(w, 26, 12, -1, tara(0, -1));
      collectible(w, 'pdy-croissant', 14, 9.2);
    },
  },
    par: 15,
    acts: [rockPools],
    twist: 'pdy-shuffle',
  }),
  longStage({
    base: {
    id: 'PDY-03',
    city: 'PDY',
    index: 3,
    name: 'Yellow Wall Jam',
    tagline: 'In White Town the walls are yellow. And a little bit jealous.',
    hint: 'The rental scooter leaves the moment you settle on it: hop straight on to the awning. Past the wall, run and hop the flower pot: the yellow wall slides after you.',
    par: 7,
    map: Grid.ground().fill(15, 17, 10, 14, 'b').fill(30, 31, 6, 11, 'f').put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const wall = group(w, 'b');
      wall.paint = YELLOW;
      group(w, 'f').paint = { fill: '#F4E9D0', trim: '#FFFFFF', line: 'rgba(120,90,40,0.3)', windows: '#2E7D9A' };
      // a flower pot outside the door: hop it, or the wall squashes you against it
      thingOn(w, 'kudam', 28, 15, { tint: '#C0643B' });
      prop(w, 'bougain', 28.5, 14);
      const scooter = thingOn(w, 'scooter', 11, 15);
      let sat = 0;
      let gone = false;
      w.onTick((w2) => {
        if (gone) return;
        sat = w2.standing(scooter.solid) ? sat + 1 : 0;
        if (sat >= 40) {
          gone = true;
          w2.say('Rental-u, sir! Bye! | It\'s a rental, sir! Bye!', scooter.cx, scooter.y - 12, 1.2, 'npc');
          w2.sfx('honk', scooter.cx, scooter.y);
          scooter.moveTo(w2, px(-3), scooter.y, 0.7, 'in', () => scooter.hide());
        }
      });
      thing(w, 'pdy-awning', 12.5, 11.75, { oneWay: true, tint: '#1E88E5' });
      let chased = false;
      w.when(
        (w2) => !chased && w2.player.onGround && w2.player.x >= px(18) && w2.player.y > px(13),
        () => {
          chased = true;
          w.emit('shake', px(16), px(12), { amount: 2 });
          w.say('Wall-um varudhu! | The wall is coming too!', px(16), px(9), 1.2, 'npc');
          wall.slide(w, 10, 0, 3.0, 'in');
        },
      );
      prop(w, 'bougain', 16, 10);
      prop(w, 'rueplaque', 21, 15, { label: 'Rue Dumas' });
      rival(w, 25, 15, -1, tara(2, -1));
      collectible(w, 'pdy-croissant', 16, 7.6);
    },
  },
    par: 13,
    acts: [frenchSigns],
    twist: 'pdy-mirror',
  }),
  longStage({
    base: {
    id: 'PDY-04',
    city: 'PDY',
    index: 4,
    name: 'Six O’Clock',
    tagline: 'At six the beach road closes. Everything on it must leave. Including you.',
    hint: 'After six, a bollard shoots up out of the road the moment you walk over it, and fires you into the festoon lights. Jump over the sockets. The last bollard is your lift to the café balcony.',
    par: 7,
    map: Grid.ground().fill(29, 31, 3, 11, 'g').fill(24, 28, 9, 9, '=').put(2, 14, '@').put(27, 8, 'E').rows(),
    build(w: World) {
      door(w);
      group(w, 'g').paint = { fill: '#F3B6B0', trim: '#FFF8E7', line: 'rgba(120,40,40,0.25)', windows: '#3E8E5E' };
      const clock = thing(w, 'clock', 5, 7.5, { solid: false, label: '5:59', layer: -3 });
      clock.look = 'pole';
      let six = false;
      w.when(
        (w2) => w2.player.x >= px(7),
        () => {
          six = true;
          clock.label = '6:00';
          w.sfx('bell', clock.cx, clock.y);
          w.say('Six o’clock! Road closed!', px(9), px(10), 1.3, 'npc');
        },
      );
      const sockets = [11, 15, 19, 23];
      const lit = [true, true, true, false];
      sockets.forEach((tx, i) => {
        const b = thing(w, 'pdy-bollard', tx, 15, { dx: 4, w: 8, h: 24, layer: -4 });
        const cx = px(tx) + 8;
        if (lit[i]) thing(w, 'pdy-lights', tx, 7.6, { dx: -8, solid: false, deadly: 'burnt' });
        let up = false;
        w.onTick((w2) => {
          if (!six || up) return;
          // it fires the moment anything passes over its socket
          const p = w2.player;
          if (p.x + p.w <= b.x + 1 || p.x >= b.x + 7) return;
          up = true;
          w2.sfx('boing', cx, px(15));
          b.moveTo(w2, b.x, px(15) - 24, 0.08, 'out', (w3) => {
            if (w3.standing(b.solid)) {
              const q = w3.player;
              q.vy = -520;
              q.launched = true;
              q.onGround = false;
              w3.say('Poi! Poi! | Off you go!', cx, px(12), 0.8, 'npc');
            }
            w3.after(1.2, () => b.moveTo(w3, b.x, px(15), 0.25, 'in', () => (up = false)));
          });
        });
      });
      prop(w, 'umbrellas', 3, 15, { n: 1 });
      sign(w, 25.4, 5.6, 3.2, 'CAFÉ', 'shop', null, 'balcony seats', false);
      rival(w, 26, 9, -1, tara(3, -1));
      collectible(w, 'pdy-croissant', 22, 7.4);
    },
  },
    par: 15,
    acts: [sixOClock],
    twist: 'pdy-lamp',
  }),
  longStage({
    base: {
    id: 'PDY-05',
    city: 'PDY',
    index: 5,
    name: 'Grand Canal',
    tagline: 'The French side, the Tamil side, and a bridge with opinions.',
    hint: 'Half-way across, the bridge opens for a boat: stop and wait for it to close (or jump the gap while it is small). On the far side a coconut cart rolls at you, and one cobble is loose again.',
    par: 11,
    map: Grid.ground().pit(9, 22).fill(9, 15, 15, 15, 'c').fill(16, 22, 15, 15, 'd').put(28, 14, 'A').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      water(w, 16.6, { rate: 0, minTy: 16.6, colors: ['rgba(90,140,110,0.85)', 'rgba(40,80,60,0.95)'], cause: 'splash' });
      const left = group(w, 'c');
      const right = group(w, 'd');
      left.paint = { fill: '#8D6E63', trim: '#D7CCC8', line: 'rgba(0,0,0,0.25)' };
      right.paint = left.paint;
      let opened = false;
      w.when(
        (w2) => !opened && w2.player.onGround && w2.player.x >= px(13),
        () => {
          opened = true;
          w.sfx('whistle', px(16), px(14));
          w.say('Boat varudhu! Bridge open! | A boat is coming! Bridge opening!', px(16), px(11), 1.4, 'npc');
          left.slide(w, -3, 0, 1.0, 'inOut');
          right.slide(w, 3, 0, 1.0, 'inOut');
          const boat = thing(w, 'odam', 0, 0, { solid: false, dx: -px(4), dy: px(16.6) - 12, layer: -3 });
          boat.moveTo(w, px(34), boat.y, 3.4, 'linear');
          w.after(2.6, () => {
            left.slide(w, 3, 0, 1.0, 'inOut');
            right.slide(w, -3, 0, 1.0, 'inOut');
          });
        },
      );
      // a coconut cart gets away from its owner on the far bank
      let carted = false;
      w.when(
        (w2) => !carted && w2.player.x >= px(16),
        () => {
          carted = true;
          w.sfx('honk', px(31), px(14));
          w.say('Vandi! Vandi! | The cart! The cart!', px(29), px(11), 1.1, 'npc');
          roller(w, 'cart', px(33), px(15) - 24, -150, { cause: 'hit', ghost: true });
        },
      );
      const cobble = spikes(w, 'A');
      w.when(
        (w2) => w2.player.x + 10 >= px(27.6),
        () => cobble.pop(w),
      );
      prop(w, 'bougain', 4, 15);
      sign(w, 6, 10.6, 3.6, 'GRAND CANAL', 'green', 'right', 'Tamil town this side');
      rival(w, 25, 15, -1, tara(4, -1));
      collectible(w, 'pdy-croissant', 11, 11.4);
      void Thing;
    },
  },
    par: 22,
    acts: [ferries],
    twist: 'pdy-bells',
  }),
  // ------------------------------------------------------------------ around Puducherry
  longStage({
    base: {
    id: 'PDY-06',
    city: 'PDY',
    index: 6,
    name: 'Paradise Beach',
    tagline: 'The boat drops you at Paradise Beach. The tide decides the rest.',
    hint: 'The tide fills the dips in the sand every few seconds: cross each dip while it’s dry, and wait on the high sand in between. The big umbrella bounces you up to the lifeguard tower, but it folds the first time, so try twice.',
    par: 14,
    scene: { kind: 'water', place: 'Paradise Beach', with: ['palms'], sky: ['#7FD0EA', '#C6EDF2', '#FBF0D4'] },
    map: (() => {
      const g = Grid.ground();
      for (const [a, b] of [
        [6, 8],
        [12, 14],
        [18, 20],
      ])
        g.pit(a, b).fill(a, b, 16, 17, '#');
      g.fill(27, 30, 9, 9, '#').fill(27, 27, 10, 14, '#').fill(30, 30, 10, 14, '#');
      return g.put(2, 14, '@').put(29, 8, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      const sea = water(w, 16.4, { rate: 0, minTy: 10, colors: ['rgba(70,180,210,0.7)', 'rgba(20,110,160,0.9)'], cause: 'splash' });
      const HIGH = 245,
        LOW = 262,
        P = 3.0;
      w.onTick((w2) => {
        const m = (w2.tick * DT) % P;
        sea.level = m < 1.3 ? HIGH : m < 1.6 ? HIGH + ((m - 1.3) / 0.3) * (LOW - HIGH) : m < 2.7 ? LOW : LOW - ((m - 2.7) / 0.3) * (LOW - HIGH);
        w2.flags.dryLeft = m >= 1.6 && m < 2.7 ? 2.7 - m : 0;
      });
      // the big beach umbrella: folds the first time, bounces you the second
      const umb = thing(w, 'pdy-umbrella', 24.5, 0, { dy: 208, w: 34, h: 32, oneWay: true, tint: '#E8572A' });
      let folded = false;
      let busy = false;
      w.onTick((w2) => {
        if (busy || !w2.standing(umb.solid)) return;
        busy = true;
        if (!folded) {
          folded = true;
          w2.say('Kudai madangiduchu! | The umbrella folded!', umb.cx, 180, 1.2, 'npc');
          w2.sfx('creak', umb.cx, 208);
          umb.solid.collidable = false;
          w2.after(0.9, () => {
            umb.solid.collidable = true;
            busy = false;
          });
        } else {
          const p = w2.player;
          p.vy = -610;
          p.launched = true;
          p.onGround = false;
          w2.sfx('boing', umb.cx, 208);
          w2.after(0.4, () => (busy = false));
        }
      });
      rival(w, 28, 9, -1, { intro: 'Paradise Beach-ku vaa! Tide paathu po! | Come to Paradise Beach! Watch the tide!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'pdy-croissant', 16, 10.6);
    },
  },
    par: 24,
    acts: [jumpyPalms],
    twist: 'pdy-mime',
  }),
  longStage({
    base: {
    id: 'PDY-07',
    city: 'PDY',
    index: 7,
    name: 'Serenity Surf',
    tagline: 'Serenity Beach has surf schools. You have no lessons.',
    hint: 'Hop from board to board while they bob. A wave rolls in every few seconds and shoves you back: stand on the right half of a board and hold right. When you reach the last board the sea starts to rise, so get up the tower steps fast.',
    par: 9,
    scene: { kind: 'water', place: 'Serenity Beach', with: ['sea'] },
    map: Grid.ground(13).pit(4, 24, 13).fill(26, 28, 11, 11, '=').fill(28, 30, 9, 9, '=').fill(26, 31, 7, 7, '=').put(1, 12, '@').put(30, 6, 'E').rows(),
    build(w: World) {
      door(w);
      const sea = water(w, 14.5, { rate: 0, minTy: 6, colors: ['rgba(40,140,200,0.8)', 'rgba(10,60,120,0.95)'], cause: 'splash' });
      const tints = ['#FF7043', '#26C6DA', '#FFCA28', '#AB47BC', '#66BB6A'];
      [5, 9, 13, 17, 21].forEach((tx, i) => {
        const b = thing(w, 'pdy-surfboard', tx, 0, { dy: 220, oneWay: true, tint: tints[i] });
        w.onTick((w2) => {
          const t = w2.tick * DT;
          b.place(w2, px(tx) + Math.sin(t * 0.9 + i * 1.7) * 10, 218 + Math.sin(t * 2.2 + i) * 5);
        });
      });
      gust(w, 4, 9, 22, 5, -160, { period: 3.0, on: 0.6, phase: 0 });
      let surge = false;
      w.when(
        (w2) => !surge && w2.player.x >= px(25) && w2.player.onGround,
        () => {
          surge = true;
          sea.rate = 24;
          w.say('Periya alai! | Big wave!', px(24), px(9), 1.4, 'npc');
          w.emit('shake', px(16), px(14), { amount: 2 });
        },
      );
      rival(w, 29, 7, -1, { intro: 'Surf pannalaam vaa! Board mela yeru! | Let’s surf! Get on a board!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[1] });
      collectible(w, 'pdy-croissant', 12.5, 10.4);
    },
  },
    // the only way on is over the top platform: a wall, then steps down to the road
    join: (g) => g.fill(32, 33, 7, 17, '#').fill(34, 35, 9, 17, '#').fill(36, 37, 11, 17, '#').fill(38, 39, 13, 17, '#'),
    joinW: 10,
    par: 21,
    acts: [waveSets],
    twist: 'rise',
  }),
  longStage({
    base: {
    id: 'PDY-08',
    city: 'PDY',
    index: 8,
    name: 'Quatorze Juillet',
    nameEn: 'The fourteenth of July',
    tagline: 'Bastille Day in the French quarter: fireworks, lanterns, and you on the rooftops.',
    hint: 'Rockets shoot up out of the streets between the roofs: cross each street just after one goes up. The high roof is too high to jump to, so ride a sky lantern up. Fireworks rain sparks on the last roof: wait for them to burn out.',
    par: 8,
    scene: { kind: 'night', place: 'White Town', with: ['fireworks'] },
    map: new Grid().fill(0, 5, 12, 17, '#').fill(8, 11, 11, 17, '#').fill(14, 17, 12, 17, '#').fill(20, 23, 8, 17, '#').fill(26, 31, 11, 17, '#').put(2, 11, '@').put(30, 10, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'crush');
      // rockets out of the streets, each on its own beat
      const street = (cx: number, period: number, phase: number) => {
        const fire = () => {
          if (w.state !== 'play') return;
          const r = shot(w, 'pdy-rocket', cx - 3, 290, 0, -330, 0, 'burnt');
          w.sfx('whistle', cx, 280);
          w.after(0.75, () => {
            if (!r.alive) return;
            r.alive = false;
            r.hazard.active = false;
            w.emit('fx', r.x, r.y, { kind: 'sparkle' });
            for (let i = 0; i < 6; i++) shot(w, 'spark', r.x, r.y, Math.cos((i / 6) * Math.PI * 2) * 60, Math.sin((i / 6) * Math.PI * 2) * 60 - 30, 260, 'burnt').stopOnSolid = true;
          });
          w.after(period, fire);
        };
        w.after(phase, fire);
      };
      street(px(7), 1.8, 0.4);
      street(px(13), 1.8, 1.0);
      // sky lanterns rise out of the street below the high roof
      const lanterns = () => {
        if (w.state !== 'play') return;
        const l = thing(w, 'lantern', 18.15, 0, { dy: 290, w: 22, h: 16, oneWay: true });
        const t0 = w.tick;
        w.onTick((w2) => {
          if (!l.alive) return;
          const y = 290 - (w2.tick - t0) * DT * 48;
          if (y < -40) {
            l.alive = false;
            l.solid.collidable = false;
            return;
          }
          l.place(w2, l.solid.x, y);
        });
        w.after(2.3, lanterns);
      };
      lanterns();
      // the grand finale over the last roof
      let finale = false;
      w.onTick((w2) => {
        if (finale || w2.player.x < px(20) || w2.player.y > px(8)) return;
        finale = true;
        w2.say('Vive la France! Vanakkam Pondy! | Long live France! Hello, Pondy!', px(28), px(6), 1.4, 'npc');
        for (let i = 0; i < 12; i++) w2.after(i * 0.09, () => (shot(w2, 'spark', px(25.5) + (i % 6) * 14, -10 - (i % 3) * 20, (i % 2 ? 1 : -1) * 12, 60, 300, 'burnt').stopOnSolid = true));
      });
      rival(w, 28, 11, -1, { intro: 'Bastille Day! Rooftop-la vaa, Dad! | Bastille Day! Come up on the rooftops, Dad!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'pdy-croissant', 21.5, 5.2);
    },
  },
    par: 17,
    twist: 'pdy-fakewin',
    acts: [sparkRain],
  }),
  // ------------------------------------------------------------------ encores (the new bar: ten stages)
  longStage({ base: petanqueRoom(), acts: [pointe, carreau, doublette, tir], twist: 'pdy-boule-pile', par: 75, shape: 'long', meta: PETANQUE_META }),
  longStage({ base: mimosaRoom(), acts: [thenga, aaru], twist: 'pdy-night-leaf', par: 60, shape: 'long', lives: 'act', meta: MIMOSA_META }),
];
