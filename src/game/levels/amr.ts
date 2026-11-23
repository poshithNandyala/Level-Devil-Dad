import type { LevelDef, World } from '../world';
import { LINES } from '../cities';
import { Cable, Thing } from '../entities/traps';
import { cloud, collectible, door, group, gust, panel, prop, px, rider, rival, roller, shot, sign, thing, thingOn, water } from './kit';
import { Act, G, deco, pool } from './acts';
import { ceilingDrop, onPass } from './trolls';
import { DT } from '../constants';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { exitTwist } from './twists';
import { Aunty } from '../entities/andhra';

// Amaravati and Vijayawada: a capital being built by the Krishna, Guntur
// chillies drying in the sun, the long barrage, the hottest tar in India and
// Benz Circle. Coastal Telugu with -andi, plus English.

const L = LINES.AMR;
const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });
const CONCRETE = { fill: '#A7A9AC', trim: '#C9CBCE', line: 'rgba(60,60,60,0.25)' };
const TAR = { fill: '#262626', trim: '#3A3A3A', line: 'rgba(255,255,255,0.08)' };

/** Walking into a chilli heap: Dad freezes, wheezes, and sneezes himself forward. */
function sneezeHeap(w: World, tx: number) {
  const heap = thingOn(w, 'chilli', tx, 15, { solid: false });
  let busy = false;
  w.onTick((w2) => {
    const p = w2.player;
    if (busy || !p.onGround) return;
    if (p.x + p.w <= heap.x + 4 || p.x >= heap.x + heap.solid.w - 4) return;
    busy = true;
    heap.spin = true;
    p.vx = 0;
    p.stun = 60;
    w2.say('Aaa... aaa...', p.cx, p.y - 10, 0.5, 'npc');
    w2.emit('fx', p.cx, p.y, { kind: 'dust' });
    w.after(0.5, () => {
      const q = w.player;
      if (w.state !== 'play') return;
      q.vx = 400 * q.facing;
      q.vy = -330;
      q.stun = 30;
      q.launched = true;
      q.onGround = false;
      w.sfx('sneeze', q.cx, q.y);
      w.say('ACHOO!', q.cx, q.y - 12, 0.8, 'npc');
      w.emit('shake', q.cx, q.y, { amount: 2 });
      w.after(1.2, () => {
        busy = false;
        heap.spin = false;
      });
    });
  });
  return heap;
}


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');

/** AMR-02: chilli powder clouds make you sneeze away from the fan: the first blows you back into the pit,
 *  the second (fan on the other side) is the only way across the wide gap. */
const powder: Act = {
  id: 'amr02-powder',
  w: 34,
  advice: 'Chilli powder makes you sneeze away from the fan: wait for the first cloud to clear before you cross it. The second fan blows from behind, so stand in its cloud and let the sneeze carry you over the wide gap.',
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 7).pit(c.x + 22, c.x + 26);
  },
  build: (w, c) => {
    const { X } = c;
    const fan = (t0: number, t1: number, dir: 1 | -1, power: number, sched: { period: number; on: number; phase: number } | null) => {
      const cl = cloud(w, c.x + t0, 11.5, t1 - t0, 4, sched, '214,62,40');
      let inT = 0,
        busy = false;
      w.onTick((w2) => {
        const p = w2.player;
        const on = cl.schedule ? (((w2.tick * DT + (sched!.phase ?? 0)) % sched!.period) + sched!.period) % sched!.period < sched!.on : true;
        const inside = on && p.cx > cl.zone.x && p.cx < cl.zone.x + cl.zone.w && p.y + p.h > cl.zone.y;
        inT = inside ? inT + 1 : 0;
        if (busy || inT < 40) return;
        busy = true;
        p.stun = 40;
        say(w2, 'Aaa... CHOO!', p.cx, p.y / 16 - 1, 0.8);
        w2.sfx('sneeze', p.cx, p.y);
        p.vx = power * dir;
        p.vy = -power * 0.8;
        p.launched = true;
        p.onGround = false;
        w2.after(1.2, () => (busy = false));
      });
      sign(w, c.x + (dir < 0 ? t1 + 0.2 : t0 - 2.8), G - 4.4, 2.6, 'FAN', 'shop', dir < 0 ? 'left' : 'right', 'blowing');
    };
    fan(9, 14, -1, 280, { period: 2.2, on: 1.2, phase: 0.3 });
    fan(17, 21, 1, 420, null);
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'GUNTUR', 'shop', null, 'mirchi yard');
    onPass(w, X(2), (w2) => w2.guide('Mirchi podi chala mild andi! | The chilli powder is very mild!'));
  },
};

/** AMR-03: the logs roll under you: stand still and they tip you off the back; jump long, the roll eats your jump. */
const rollingLogs: Act = {
  id: 'amr03-logs',
  w: 32,
  advice: 'The floating logs roll under your feet and carry you backwards: keep running, and jump long, the roll shortens every jump.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 23);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 24, 15.4, { colors: ['rgba(90,150,170,0.85)', 'rgba(30,80,100,0.96)'] });
    for (const t of [4, 9, 14, 19]) {
      const lg = w.add(new Thing('log', X(t) + 4, px(G), { w: 48, h: 10, layer: 2 }));
      lg.solid.velX = -50;
      lg.spin = true;
    }
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'KRISHNA', 'green', null, 'logs for the barrage');
    onPass(w, X(2), (w2) => w2.guide('Dunga meeda nilabadandi, safe! | Stand on the logs, it is safe!'));
  },
};

/** AMR-04: the road is so hot you can't stand still on it; wait in the shade (the big umbrella has holes). */
const hotRoad: Act = {
  id: 'amr04-hot',
  w: 32,
  advice: 'The road is so hot you cannot stand still on it for long: wait only in real shade. The big umbrella is full of holes, the small tree is not.',
  paint: (g, c) => {
    g.fill(c.x + 11, c.x + 11, 10, 14, c.L[0]).fill(c.x + 22, c.x + 22, 10, 14, c.L[1]);
  },
  build: (w, c) => {
    const { X } = c;
    const shade = [
      [5.5, 8.5],
      [14.2, 15.4],
    ];
    prop(w, 'umbrellas', c.x + 7, G, { n: 1 });
    prop(w, 'tree', c.x + 14.8, G, {});
    prop(w, 'umbrellas', c.x + 18, G, { n: 1 });
    let still = 0;
    w.onTick((w2) => {
      const p = w2.player;
      const inAct = p.cx > X(1) && p.cx < X(30);
      const cool = shade.some(([a, b]) => p.cx >= X(a) && p.cx <= X(b));
      still = inAct && p.onGround && !cool && Math.abs(p.vx) < 30 ? still + 1 : 0;
      if (still === 30) say(w2, 'Ssss!', p.cx, p.y / 16 - 1, 0.5);
      if (still >= 84) w2.die('burnt');
    });
    const gate = (letter: string, phase: number) => {
      const gt = group(w, letter);
      gt.paint = { fill: '#E53935', trim: '#FFFFFF', line: 'rgba(255,255,255,0.4)' };
      let open = false;
      w.onTick((w2) => {
        const t = (w2.tick * DT + phase) % 2.6;
        const want = t < 1.1;
        if (want === open || gt.state === 'tween') return;
        open = want;
        gt.slide(w2, 0, want ? -3 : 3, 0.14, want ? 'out' : 'in', (w3) => {
          const p = w3.player;
          if (!open && p.x + p.w > gt.solid.x && p.x < gt.solid.x + 16 && p.y + p.h > gt.solid.y) w3.die('crushed');
        });
      });
    };
    gate(c.L[0], 0);
    gate(c.L[1], 1.3);
    sign(w, c.x + 0.5, G - 4.4, 3, '47°C', 'shop', null, 'Bezawada May');
    onPass(w, X(2), (w2) => w2.guide('Pedda godugu kinda rest teesukondi! | Rest under the big umbrella!'));
  },
};

/** AMR-05: speed breakers throw you up into the gantry if you run over them; the last one is the only way over the wall. */
const humps: Act = {
  id: 'amr05-humps',
  w: 32,
  advice: 'Run over a speed breaker and it throws you up into the sign gantry: hop over them. The last one is the only way over the wall: run straight over it.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 18, 9, 9, '#').fill(c.x + 7, c.x + 17, 10, 10, 'v');
    g.fill(c.x + 26, c.x + 27, 9, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const hump = (t: number, power: number) => {
      const h = deco(w, 'pad', X(t), G + 0.25, { layer: 2, tint: '#FBC02D' });
      let last = -99;
      w.onTick((w2) => {
        const p = w2.player;
        if (!p.onGround || Math.abs(p.vx) < 100 || w2.tick - last < 40) return;
        if (p.x + p.w < h.solid.x + 3 || p.x > h.solid.x + h.solid.w - 3) return;
        last = w2.tick;
        w2.sfx('boing', h.cx, h.y);
        p.vy = -power;
        p.launched = true;
        p.onGround = false;
        p.y -= 1;
      });
    };
    hump(9, 430);
    hump(14, 430);
    hump(23, 620);
    sign(w, c.x + 9, 6.6, 6, 'BENZ CIRCLE →', 'green', null, 'mind the gantry');
    onPass(w, X(2), (w2) => w2.guide('Speed breaker chinnave, parigettandi! | The speed breakers are tiny, just run!'));
  },
};

/** AMR-06: a zipline across Gandikota: the hook jams halfway and drops; the next one waits for you. */
const zipline: Act = {
  id: 'amr06-zip',
  w: 32,
  advice: 'Ride the zipline hook across the gorge. It jams halfway and drops a moment later: jump to the next hook straight away.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 27);
  },
  build: (w, c) => {
    const { X } = c;
    panel(w, c.x + 2, 7.5, 27, 0.08, '#5D4037', 'rgba(0,0,0,0)');
    const hook = (x0: number, x1: number, wait: boolean) => {
      const h = w.add(new Thing('hook', x0, px(G), { w: 32, h: 8, layer: 3, oneWay: true }));
      let go = false,
        x = x0,
        jam = -1;
      w.onTick((w2) => {
        if (!go && w2.standing(h.solid)) go = true;
        if (!go || jam >= 0) {
          if (jam >= 0 && w2.tick - jam === 60) h.fall(w2, { land: false, g: 1800 });
          h.solid.velX = 0;
          return;
        }
        x = Math.min(x1, x + 75 * DT);
        h.solid.velX = 75;
        h.place(w2, x, h.solid.y);
        if (x >= x1 && !wait) {
          jam = w2.tick;
          w2.sfx('creak', h.cx, h.y);
          say(w2, 'Hook stuck! | The hook is stuck!', h.cx, G - 3, 1);
        }
      });
      return h;
    };
    hook(X(2.5), X(11), false);
    hook(X(15), X(25), true);
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'GANDIKOTA', 'wood', null, 'zipline ₹50');
    onPass(w, X(1), (w2) => w2.guide('Hook pattukondi, end varaku! | Hold the hook, all the way to the end!'));
  },
};

/** AMR-07: the hole in the cave floor is the way on: the grand gallery above ends in a falling ceiling. */
const lowerGallery: Act = {
  id: 'amr07-gallery',
  w: 32,
  advice: 'Drop through the hole in the cave floor: the gallery below is the way on. The grand passage above ends in a falling ceiling.',
  paint: (g, c) => {
    g.fill(c.x + 2, c.x + 3, 14, 14, '#').fill(c.x + 4, c.x + 23, 12, 14, '#');
    g.fill(c.x + 4, c.x + 27, 15, 16, '.');
    g.fill(c.x + 9, c.x + 10, 12, 14, '.');
    // (no spikes after the falling ceiling: nobody who goes that way gets past the ceiling to meet them)
    g.fill(c.x + 14, c.x + 19, 9, 10, c.L[0]);
  },
  build: (w, c) => {
    const { X } = c;
    ceilingDrop(w, c.L[0], X(14), { delay: 0.05 });
    sign(w, c.x + 4.5, 8.2, 4, 'GRAND HALL', 'wood', 'right', 'this way!');
    onPass(w, X(2), (w2) => w2.guide('Straight-ga vellandi, pedda hall! | Go straight, the big hall!'));
  },
};

/** AMR-08: cyclone wind: don't shelter in the beach shack, its roof comes down; the second one you go straight through. */
const shacks: Act = {
  id: 'amr08-shack',
  w: 32,
  advice: 'In the cyclone wind, never shelter in a beach shack: the roof comes down. Go straight through the second one without stopping.',
  paint: (g, c) => {
    g.fill(c.x + 9, c.x + 13, 11, 11, c.L[0]).fill(c.x + 21, c.x + 25, 11, 11, c.L[1]);
  },
  build: (w, c) => {
    const { X } = c;
    gust(w, c.x, 8, 32, 8, -110, { period: 2.6, on: 0.7, phase: 0.6 });
    for (const [L, t] of [
      [c.L[0], 9],
      [c.L[1], 21],
    ] as const) {
      const roof = group(w, L);
      roof.paint = { fill: '#A1887F', trim: '#6D4C41', line: 'rgba(60,40,20,0.35)' };
      panel(w, c.x + t, 12, 0.15, 3, '#6D4C41', 'rgba(0,0,0,0)');
      panel(w, c.x + t + 4.85, 12, 0.15, 3, '#6D4C41', 'rgba(0,0,0,0)');
      let under = 0;
      w.onTick((w2) => {
        if (roof.state !== 'rest') return;
        const p = w2.player;
        under = p.cx > X(t) && p.cx < X(t + 5) ? under + 1 : 0;
        if (under === 80) roof.fall(w2, { land: true, g: 2400 });
      });
    }
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'RK BEACH', 'wood', null, 'cyclone warning');
    onPass(w, X(2), (w2) => w2.guide('Gaali! Shack lopala daakkondi! | Wind! Hide inside the shack!'));
  },
};

export const AMR: LevelDef[] = [
  tour({
    id: 'AMR-01',
    city: 'AMR',
    name: "Swagatham Amaravati",
    nameEn: "Welcome to Amaravati",
    tagline: "A new capital rising on the Krishna, with chillies that bite back.",
    lines: [
      "Namaskaram andi! Amaravati-ki swagatham! | Hello! Welcome to Amaravati!",
      "Idi Andhra Pradesh rajadhani! | The capital of Andhra Pradesh, rising on the Krishna!",
      "Krishna nadi chudandi, entha pedda! | Look at the Krishna: one of India's great rivers.",
      "Guntur mirchi chaala karam andi! | Guntur's red chillies are famous for their fire.",
      "Kondapalli bommalu, chekka tho chesaru! | Kondapalli toys are carved from soft wood.",
      "Sare Dad, ippudu asalu aata! | Okay Dad, now the real game!",
    ],
    shouts: [
      [21, "Punugulu! Vedi vedi punugulu! | Punugulu! Piping hot!"],
      [88, "Mirchi bajji ready! | Chilli fritters, ready!"],
    ],
    ride: "cart",
    item: "mirchi",
    signs: [[8, "AMARAVATI", "capital city"], [55, "KRISHNA", "river"], [102, "PRAKASAM", "barrage"]],
    props: [
      ["crane", 6, {}],
      ["chillisacks", 20, {}],
      ["palm", 34, { h: 80, lean: 5 }],
      ["crane", 64, {}],
      ["chillisacks", 88, {}],
      ["palm", 106, { h: 84, lean: -4 }],
    ],
    things: [["doll", 80]],
    hint: 'An aunty on her doorstep feeds everyone who walks past ("Annam tinnava?"), and a full stomach won’t make the long jump on the barrage piers. Hop past her plate, or wait a few seconds for it to settle (you’ll burp). Hold jump for the wide gap.',
    // the Krishna is deep here, and one pier is missing: a wide gap that wants a long jump
    paint: (g) => g.fill(36, 57, 17, 17, '.').fill(50, 51, 15, 16, '.').fill(52, 53, 15, 16, '#'),
    extra: (w) => {
      pool(w, 36, 58, 15.4, { colors: ['rgba(70,120,140,0.88)', 'rgba(30,70,90,0.97)'] });
      Aunty.place(w, { tx: 31, groundTy: 15, fullSec: 7 });
    },
  }),
  longStage({
    base: {
    id: 'AMR-02',
    city: 'AMR',
    index: 2,
    name: 'Mirchi Mild',
    tagline: 'Guntur chillies. Mild, they said.',
    hint: 'Walk into a chilli heap and you sneeze yourself forward, hard. Hop over the first heap. The last heap sits at the edge of the gap: face right, walk in, and let the sneeze fly you across.',
    par: 6,
    map: Grid.ground().pit(19, 24).put(15, 14, '^').put(16, 14, '^').fill(1, 2, 11, 11, '=').put(4, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      sneezeHeap(w, 7);
      sneezeHeap(w, 17);
      prop(w, 'chillisacks', 11, 15);
      prop(w, 'chillisacks', 27, 15);
      sign(w, 21, 9.6, 3.6, 'MIRCHI YARD', 'shop', null, 'Guntur special');
      rival(w, 26, 15, -1, tara(2, -1));
      collectible(w, 'mirchi', 1.5, 9.2);
    },
  },
    par: 12,
    acts: [powder],
    twist: 'key',
  }),
  longStage({
    base: {
    id: 'AMR-03',
    city: 'AMR',
    index: 3,
    name: 'Barrage Gates',
    tagline: 'Seventy gates on the Krishna. Every one of them is watching your feet.',
    hint: 'A gate drops if you stop on it, or land on it from a jump. Walk across the gates, wait on the concrete piers, and when you must jump, land on a pier.',
    par: 7,
    map: (() => {
      const g = Grid.ground(12).pit(5, 26, 12);
      for (const c of [5, 8, 11, 14, 17, 20, 23, 26]) g.fill(c, c, 12, 17, '#');
      return g.put(2, 11, '@').put(29, 11, 'E').rows();
    })(),
    build(w: World) {
      exitTwist(w, door(w), 'crush');
      water(w, 15.2, { rate: 0, minTy: 15.2, colors: ['rgba(90,150,170,0.85)', 'rgba(30,80,100,0.95)'], cause: 'splash' });
      const slots = [6, 9, 12, 15, 18, 21, 24];
      slots.forEach((tx, i) => {
        const gate = thing(w, 'sluice', tx, 12);
        const restY = gate.y;
        let still = 0;
        let open = false;
        const drop = (closeAfter = 1.6) => {
          if (open) return;
          open = true;
          w.sfx('creak', gate.cx, gate.y);
          gate.moveTo(w, gate.x, restY + 40, 0.22, 'in', () => {
            gate.solid.collidable = false;
            w.after(closeAfter, () => {
              gate.solid.collidable = true;
              gate.moveTo(w, gate.x, restY, 0.3, 'out', () => (open = false));
            });
          });
        };
        if (i === 3) {
          // gate four is under maintenance: down, up, down, up
          const cycle = () => {
            drop(1.4);
            w.after(2.8, cycle);
          };
          w.after(1.2, cycle);
        }
        w.onTick((w2) => {
          const p = w2.player;
          const on = w2.standing(gate.solid);
          // stopping on a gate opens it
          still = on && Math.abs(p.vx) < 30 ? still + 1 : 0;
          if (still >= 14) drop();
          // so does landing on it from a jump
          if (on && p.landTick === w2.tick && p.landSpeed > 150) drop();
        });
      });
      sign(w, 1.5, 7.6, 4, 'PRAKASAM BARRAGE', 'green', null, 'walk, don’t stop');
      rival(w, 28, 12, -1, tara(3, -1));
      collectible(w, 'mirchi', 20, 8.6);
    },
  },
    par: 16,
    twist: 'swing',
    acts: [rollingLogs],
  }),
  longStage({
    base: {
    id: 'AMR-04',
    city: 'AMR',
    index: 4,
    name: 'Bezawada Blaze',
    nameEn: 'Vijayawada heat',
    tagline: 'Forty-five degrees, fresh tar, and a road roller that does not brake.',
    hint: 'Fresh tar grabs your chappals: walking on it is slow. Hop across it, you are fast in the air. The road roller is right behind you.',
    par: 7,
    map: Grid.ground().fill(8, 24, 15, 15, 'a').put(3, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const tar = group(w, 'a');
      tar.paint = TAR;
      tar.solid.sticky = true;
      const x0 = px(8);
      let chased = false;
      w.onTick((w2) => {
        const p = w2.player;
        if (!chased && p.x >= x0) {
          chased = true;
          const r = rider(w2, 'roadroller', -px(4), 15, 88, 5, 'crushed');
          r.facesRight = true;
          w2.say('Road roller vastundi! | The road roller is coming!', px(4), px(11), 1.3, 'npc');
          w2.sfx('rumble', 0, px(14));
        }
      });
      sign(w, 9, 10.6, 3.4, 'WET TAR', 'warn', null, 'walk slowly');
      prop(w, 'chillisacks', 27, 15);
      rival(w, 27, 15, -1, tara(0, -1));
      collectible(w, 'mirchi', 16, 11.2);
    },
  },
    par: 14,
    acts: [hotRoad],
    twist: 'mirchi',
  }),
  longStage({
    base: {
    id: 'AMR-05',
    city: 'AMR',
    index: 5,
    name: 'Benz Circle',
    tagline: 'Every road leads to Benz Circle. Every direction is the wrong one.',
    hint: 'Hop the open drain. Up on the traffic island the circle spins your head: left is right for a few seconds, and again further on. Punugulu bounce at you from the stall: hop them.',
    par: 9,
    map: Grid.ground().pit(6, 7).fill(11, 16, 14, 14, 'i').put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'spikes');
      group(w, 'i').paint = { fill: '#7CB342', trim: '#9CCC65', line: 'rgba(0,0,0,0.12)', kerb: ['#212121', '#FDD835'] };
      const stall = thingOn(w, 'deg', 25, 15, { solid: false, layer: -3 });
      let spun = 0;
      let frying = false;
      const toss = () => {
        if (w.state !== 'play' || w.player.x > px(24)) return;
        roller(w, 'punugulu', stall.x - 6, stall.y - 4, -135, { vy: -160, bounce: 0.45, cause: 'hit', ghost: true });
        w.after(0.9, toss);
      };
      w.onTick((w2) => {
        const p = w2.player;
        if (spun === 0 && p.onGround && p.x >= px(11) && p.y < px(14)) {
          spun = 1;
          w2.flipControls(3.2);
          w2.say(L.flip, p.cx, p.y - 16, 1.4, 'npc');
          if (!frying) {
            frying = true;
            w.after(0.6, toss);
          }
        } else if (spun === 1 && p.x >= px(20)) {
          spun = 2;
          w2.flipControls(2.4);
          w2.say('Malli U-turn andi! | U-turn again!', p.cx, p.y - 16, 1.2, 'npc');
        }
      });
      prop(w, 'bougain', 13.5, 14);
      sign(w, 12, 9.6, 3.6, 'BENZ CIRCLE', 'green', null, 'all directions');
      sign(w, 23, 10.6, 3.2, 'PUNUGULU', 'shop', null, 'hot hot');
      rival(w, 27, 15, -1, tara(4, -1));
      collectible(w, 'mirchi', 7, 11);
    },
  },
    par: 17,
    twist: 'speed',
    acts: [humps],
  }),
  longStage({
    base: {
    id: 'AMR-06',
    city: 'AMR',
    index: 6,
    name: 'Gandikota',
    tagline: 'India’s own Grand Canyon, and one rope bridge',
    hint: 'Every plank drops a moment after you step on it, so keep moving. But the gorge wind blows every couple of seconds: start across just after a gust and you’ll reach the gap while it’s calm.',
    par: 8.5,
    scene: { kind: 'rock', place: 'Gandikota', with: ['canyon', 'fort'] },
    map: new Grid().fill(0, 5, 10, 17, '#').fill(26, 31, 10, 17, '#').put(2, 9, '@').put(30, 9, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'crush');
      water(w, 16.6, { rate: 0, minTy: 16.6, colors: ['#5C8C7A', '#35614F'], cause: 'splash' });
      const planks: Thing[] = [];
      for (let c = 6; c <= 25; c++) if (c < 15 || c > 17) planks.push(thing(w, 'plank', c, 10, { oneWay: true }));
      let told = false;
      w.onTick((w2) => {
        for (const pl of planks) {
          if (pl.state === 'rest' && !pl.look && w2.standing(pl.solid)) {
            pl.look = 'armed';
            pl.fall(w2, { delay: 0.45, land: false, g: 1500 });
            if (!told) {
              told = true;
              w2.say('Chekkalu padipothunnayi! | The planks are falling!', px(8), px(6), 1.8, 'npc');
            }
          }
        }
      });
      // the gorge wind, right over the gap
      gust(w, 12, 6, 6, 5, -170, { period: 2.2, on: 0.8, phase: 0.6 });
      rival(w, 28, 10, -1, { intro: 'Gandikota! Mana Grand Canyon andi! | Gandikota! Our own Grand Canyon!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'mirchi', 16, 7.4);
    },
  },
    par: 18,
    twist: 'monkey',
    acts: [zipline],
    skin: { rock: 'boulder', rockLine: 'Bandalu padutunnayi! | Rocks are falling!' },
  }),
  longStage({
    base: {
    id: 'AMR-07',
    city: 'AMR',
    index: 7,
    name: 'Belum Guhalu',
    nameEn: 'Belum Caves',
    tagline: 'Kurnool’s great cave goes deep. And dark.',
    hint: 'Stalactites drop when you come close: stop short, let them fall, then go. The bats fly over your head, so they only get you if you jump: time the stream jumps between them.',
    par: 9.5,
    dark: true,
    scene: { kind: 'cave', place: 'Belum Caves' },
    map: (() => {
      const g = Grid.ground(14).fill(0, 31, 0, 3, '#').pit(16, 23, 14);
      g.fill(18, 18, 13, 17, '#').fill(21, 21, 13, 17, '#');
      return g.put(1, 13, '@').put(30, 13, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      water(w, 14.8, { rate: 0, minTy: 14.8, colors: ['#3E6E7E', '#1F3D47'], cause: 'splash' });
      // stalactites drop as you come near: [column, the player's x that sets it off]
      const drops: [number, number][] = [
        [6, px(6) - 40],
        [9.5, px(9.5) - 40],
        [11, px(9.5) - 40],
        // ...and this one waits until you're right under it
        [14, px(14) - 6],
      ];
      let warned = false;
      for (const [col, at] of drops) {
        const s = thing(w, 'stalactite', col, 4, { deadly: 'hit', solid: false });
        w.when(
          (w2) => w2.player.x >= at,
          (w2) => {
            w2.sfx('thud', s.cx, px(4));
            if (!warned) {
              warned = true;
              w2.say('Paina chudandi! | Look up!', s.cx, px(6), 1.6, 'npc');
            }
            s.fall(w2, {
              v0: 320,
              g: 1600,
              land: true,
              then: (w3) => {
                s.hide();
                s.setDeadly(false);
                w3.emit('fx', s.cx, px(14), { kind: 'dust' });
              },
            });
          },
        );
      }
      // bats sweep in over the underground stream, just above Dad's head
      const bats: { x: number; y: number; glow?: { x: number; y: number; r: number }; alive: boolean }[] = [];
      const bat = () => {
        if (w.state !== 'play') return;
        bats.push(shot(w, 'bat', 520, px(11.3), -115, 0, 0, 'hit') as never);
        w.after(1.8, bat);
      };
      w.after(0.4, bat);
      w.onTick(() => {
        for (const b of bats) b.glow = b.alive ? { x: b.x + 7, y: b.y + 4, r: 12 } : undefined;
      });
      w.when(
        (w2) => w2.player.x >= px(14.5),
        (w2) => w2.say('Gabbilalu! Jagratha ga dookandi! | Bats! Jump carefully!', px(17), px(7), 1.8, 'npc'),
      );
      // a few lamps the cave guides leave on
      for (const [tx, ty] of [
        [3, 5],
        [12, 5],
        [26, 5],
      ] as const) {
        const l = thing(w, 'lantern', tx, ty, { solid: false });
        (l as unknown as { glow: object }).glow = { x: l.cx, y: px(ty) + 10, r: 34 };
      }
      rival(w, 28, 14, -1, { intro: 'Belum Guhalu! Chikatiga undi, jagratha! | Belum Caves! It’s dark, careful!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[1] });
      collectible(w, 'mirchi', 19.5, 9.4);
    },
  },
    par: 18,
    acts: [lowerGallery],
    twist: 'dejavu',
    skin: { bird: 'bat' },
  }),
  longStage({
    base: {
    id: 'AMR-08',
    city: 'AMR',
    index: 8,
    name: 'Vizag Beach Road',
    tagline: 'Waves, a submarine and a ropeway up the hill',
    hint: 'Waves wash over the sand: cross between them. The submarine sinks if you stand on it too long, so catch a cable car as it passes. Tara’s ropeway isn’t finished: jump off before the car hits the hill.',
    par: 16.5,
    scene: { kind: 'water', place: 'Visakhapatnam', with: ['palms', 'lighthouse'] },
    map: new Grid().fill(0, 3, 12, 17, '#').fill(4, 12, 14, 17, '#').fill(25, 31, 7, 17, '#').put(1, 11, '@').put(30, 6, 'E').rows(),
    build(w: World) {
      exitTwist(w, door(w), 'spikes');
      // the sea, with a big wave every few seconds
      const sea = water(w, 14.9, { rate: 0, minTy: 10, colors: ['#4FB3D9', '#1F6F96'], cause: 'splash' });
      const BASE = px(14.9),
        CREST = 213,
        P = 2.6;
      w.onTick((w2) => {
        const m = (w2.tick * DT) % P;
        let k = 0;
        if (m >= 1.4 && m < 1.65) k = (m - 1.4) / 0.25;
        else if (m >= 1.65 && m < 2.1) k = 1;
        else if (m >= 2.1 && m < 2.4) k = 1 - (m - 2.1) / 0.3;
        sea.level = BASE + (CREST - BASE) * k;
        w2.flags.wave = k;
        w2.flags.waveIn = m < 1.4 ? 1.4 - m : m >= 2.4 ? P - m + 1.4 : 0;
      });
      // INS Kursura, parked on the sand. It doesn't like visitors.
      const sub = thing(w, 'sub', 7, 14, { dy: -18 });
      let diving = false;
      let subY = sub.solid.y;
      w.when(
        (w2) => w2.standing(sub.solid),
        (w2) => {
          w2.after(0.7, () => {
            diving = true;
            w2.say('Submarine munigipothondi! | The submarine is sinking!', sub.cx, px(9), 1.8, 'npc');
          });
        },
      );
      w.onTick((w2) => {
        if (diving && subY < px(16)) {
          subY += 26 * DT;
          sub.place(w2, sub.solid.x, subY);
        }
      });
      // the ropeway: cars ride a cable up to the hill... which they hit
      const A = { x: 168, y: 174 },
        B = { x: 400 - 26, y: 128 };
      const len = Math.hypot(B.x - A.x, B.y - A.y);
      const m = (B.y - A.y) / (B.x - A.x);
      w.add(new Cable(A.x + 13 - 60, A.y - 8 - 60 * m, B.x + 13 + 40, B.y - 8 + 40 * m));
      const cars: { t: Thing; s: number; crashed: boolean; sag: number }[] = [];
      w.flags.cars = cars;
      const car = () => {
        if (w.state !== 'play') return;
        const t = thing(w, 'cablecar', 0, 0, { oneWay: true, dx: A.x, dy: A.y });
        cars.push({ t, s: 0, crashed: false, sag: 0 });
        w.after(2.2, car);
      };
      car();
      let stopped = false;
      w.onTick((w2) => {
        for (const c of cars) {
          if (c.crashed) continue;
          const riding = w2.standing(c.t.solid);
          // halfway up, the car you're on stops and sags for a scary second
          if (riding && !stopped && c.s >= len * 0.45) {
            stopped = true;
            c.sag = 1.0;
            w2.say('Ropeway aagipoyindi! | The ropeway stopped!', c.t.cx, c.t.solid.y - 30, 1.6, 'npc');
          }
          if (c.sag > 0) c.sag = Math.max(0, c.sag - DT);
          else c.s += 52 * DT;
          const k = Math.min(1, c.s / len);
          const drop = c.sag > 0 ? 10 * Math.min(1, (1 - c.sag) * 8) : 0;
          c.t.place(w2, A.x + (B.x - A.x) * k, A.y + (B.y - A.y) * k + drop);
          if (k >= 1) {
            c.crashed = true;
            w2.sfx('thud', c.t.cx, c.t.solid.y);
            w2.emit('shake', c.t.cx, c.t.solid.y, { amount: 3 });
            c.t.fall(w2, { land: false, g: 1400 });
          }
        }
      });
      w.when(
        (w2) => cars.some((c) => c.crashed && c.t.solid.y < px(14)),
        (w2) => w2.say('Ropeway inka complete kaaledu andi! | The ropeway isn’t finished yet!', px(24), px(5), 2, 'npc'),
      );
      rival(w, 28, 7, -1, { intro: 'Vizag beach! Ropeway ekkandi, Dad! | Vizag beach! Take the ropeway, Dad!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'mirchi', 20.5, 5.6);
    },
  },
    par: 25,
    twist: 'whirlwind',
    acts: [shacks],
    skin: { jet: 'water' },
  }),
];
