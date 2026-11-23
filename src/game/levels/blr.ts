import { secs } from '../constants';
import type { LevelDef, World } from '../world';
import { LINES } from '../cities';
import { blinker, cascade, panel, collapseOnStand, door, group, pedButton, prop, px, rival, roller, sign, signal, thing, vehicle, collectible, water } from './kit';
import { exitTwist } from './twists';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';
import { DT, ROOM_W } from '../constants';
import type { Blinker, Roller } from '../entities/traps';
import { Thing } from '../entities/traps';
import { Vehicle } from '../entities/traffic';
import type { ThingKind } from '../../render/art/things';
import { Act, G, deco, pool } from './acts';
import { onPass } from './trolls';
import { LoadingBridge } from '../entities/karnataka';
import { checkpoint } from './kit';

// Bengaluru: traffic signals stop and rearrange the vehicles you stand on.
// Kannada + English.

const L = LINES.BLR;
const TAUNTS = L.taunt;


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');
const FLAP = { fill: '#B0BEC5', trim: '#455A64', line: 'rgba(0,0,0,0.18)' };

/** BLR-02: tech-park gates. The first opens if you stand on the mat; the second only if you stamp on it. */
const badgeGates: Act = {
  id: 'blr02-badge',
  w: 30,
  advice: 'The tech-park gates: stand still on the first mat and its flaps open for a moment. The second mat wants a stamp: jump on it.',
  paint: (g, c) => {
    g.fill(c.x + 9, c.x + 9, 13, 14, c.L[0]).fill(c.x + 21, c.x + 21, 13, 14, c.L[1]);
    g.pit(c.x + 14, c.x + 15);
  },
  build: (w, c) => {
    const { X } = c;
    const gate = (letter: string, matT: number, needStamp: boolean, open: number) => {
      const f = group(w, letter);
      f.paint = FLAP;
      deco(w, 'pad', X(matT), G + 0.5, { layer: -2, tint: '#26A69A' });
      let still = 0,
        busy = false;
      w.onTick((w2) => {
        const p = w2.player;
        const over = p.cx >= X(matT) - 2 && p.cx <= X(matT) + 18;
        const on = p.onGround && over;
        still = on && Math.abs(p.vx) < 10 ? still + 1 : 0;
        const go = needStamp ? over && w2.tick - p.landTick <= 2 : still >= 60;
        if (!go || busy) return;
        busy = true;
        w2.sfx('beep', f.solid.x + 8, f.solid.y);
        f.slide(w2, 0, 2, 0.15, 'out', (w3) =>
          w3.after(open, () => {
            w3.sfx('slide', f.solid.x + 8, f.solid.y);
            f.slide(w3, 0, -2, 0.12, 'in', (w4) => {
              busy = false;
              still = 0;
              const q = w4.player;
              if (q.x + q.w > f.solid.x && q.x < f.solid.x + 16 && q.y + q.h > f.solid.y) w4.die('crushed');
            });
          }),
        );
      });
    };
    gate(c.L[0], 7, false, 1.3);
    gate(c.L[1], 19, true, 1.2);
    sign(w, c.x + 6, G - 4.4, 3, 'TAP ID', 'metro', 'down', 'and wait');
    sign(w, c.x + 18, G - 4.4, 3.4, 'TAP HARDER', 'metro', 'down', 'reader is slow');
    onPass(w, X(2), (w2) => w2.guide('Automatic doors, guru! Run! | Automatic doors, boss! Just run!'));
  },
};

/** BLR-03: the crane lays the viaduct one piece at a time; wait for each. The last one is "coming soon": jump. */
const viaduct: Act = {
  id: 'blr03-viaduct',
  w: 34,
  advice: 'The crane lays the metro deck one piece at a time: wait for each to land before you step on. The last piece is opening in 2027: long jump.',
  paint: (g, c) => {
    g.fill(c.x + 2, c.x + 3, 13, 14, '#').fill(c.x + 4, c.x + 5, 11, 14, '#').fill(c.x + 6, c.x + 8, 10, 10, '#').fill(c.x + 7, c.x + 7, 11, 14, '#');
    g.fill(c.x + 9, c.x + 24, 14, 14, '^');
    for (const t of [10, 14, 18]) g.fill(c.x + t + 1, c.x + t + 2, 11, 14, '#');
    [0, 1, 2].forEach((i) => g.fill(c.x + 9 + i * 4, c.x + 12 + i * 4, 2, 2, c.L[i]));
    g.fill(c.x + 25, c.x + 29, 10, 10, '#').fill(c.x + 27, c.x + 27, 11, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const segs = [0, 1, 2].map((i) => group(w, c.L[i]));
    onPass(w, X(6.5), (w2) => {
      say(w2, 'Crane bartide! | Here comes the crane!', X(10), 6);
      segs.forEach((s, i) => w2.after(0.4 + i * 1.5, () => s.fall(w2, { land: true, g: 1800 })));
    });
    sign(w, c.x + 21.2, 6.2, 3.8, 'METRO 2027*', 'metro', null, '*conditions apply');
    onPass(w, X(1), (w2) => w2.guide('Metro ready aagide, guru! Odi! | The metro is ready, boss! Run!'));
  },
};

/** BLR-04: the jam over the trench: hop roof to roof; the jeep pulls away just after you land on it. */
const jamHop: Act = {
  id: 'blr04-jam',
  w: 32,
  advice: 'Hop across the stuck traffic over the trench. The jeep pulls away a moment after you land on it: keep going.',
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 26).fill(c.x + 5, c.x + 26, 17, 17, '#').fill(c.x + 5, c.x + 26, 16, 16, '^');
  },
  build: (w, c) => {
    const { X } = c;
    const on = (kind: ThingKind, t: number, ww: number, hh: number) => w.add(new Thing(kind, X(t), px(G) - hh, { w: ww, h: hh, layer: 1 }));
    on('scooter', 5.5, 24, 16);
    on('shareauto', 9, 64, 36);
    const jeep = on('jeep', 15, 40, 22);
    on('redbus', 19, 96, 40);
    let gone = false;
    w.when(
      (w2) => w2.standing(jeep.solid),
      (w2) =>
        w2.after(0.35, () => {
          gone = true;
          w2.sfx('honk', jeep.cx, jeep.y);
          say(w2, 'Signal green! | Green light!', jeep.cx, G - 4, 1);
        }),
    );
    w.onTick((w2) => {
      if (gone && jeep.alive) {
        jeep.solid.velX = -170;
        jeep.place(w2, jeep.solid.x - 170 * DT, jeep.solid.y);
        if (jeep.solid.x < X(-4)) {
          jeep.alive = false;
          jeep.solid.collidable = false;
        }
      }
    });
    // the room's bus turns off before the jam (it never drives into this part)
    w.onTick((w2) => {
      for (const e of w2.entities)
        if (e instanceof Vehicle && e.alive && e.solid.x > X(-5)) {
          e.alive = false;
          e.solid.collidable = false;
        }
    });
    sign(w, c.x + 1, G - 4.4, 3.4, 'SILK BOARD', 'green', 'right', '45 min ahead');
    onPass(w, X(2), (w2) => w2.guide('Traffic jam, guru! Mele mele hogi! | Traffic jam, boss! Go over the top!'));
  },
};

/** BLR-05: the Lalbagh glasshouse: the glass roof is low over the lily pond, so only little hops; pads sink. */
const glasshouse: Act = {
  id: 'blr05-glasshouse',
  w: 30,
  advice: 'In the glasshouse the glass roof hangs low over the lily pond: only small hops, a big jump bonks you into the water. The pads sink if you stand still.',
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 22);
    g.fill(c.x + 6, c.x + 22, 10, 10, '%');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 5, c.x + 23, 15.3, { colors: ['rgba(70,140,90,0.82)', 'rgba(25,70,45,0.96)'] });
    panel(w, c.x + 6, 10, 17, 1, 'rgba(220,240,255,0.10)', 'rgba(255,255,255,0.28)', 16);
    for (const t of [7, 11, 15, 19]) {
      const pad = w.add(new Thing('leaf', X(t), px(G), { w: 32, h: 6, layer: 2, oneWay: true }));
      pad.tint = '#43A047';
      let on = -1;
      w.onTick((w2) => {
        if (on < 0 && w2.standing(pad.solid)) on = w2.tick;
        if (on >= 0 && (w2.tick - on) * DT > 0.6 && pad.solid.y < px(G) + 24) pad.place(w2, pad.solid.x, pad.solid.y + 40 * DT + 0.5);
      });
    }
    sign(w, c.x + 0.5, G - 4.4, 3.6, 'GLASSHOUSE', 'green', 'right', 'Lalbagh, 1889');
    onPass(w, X(2), (w2) => w2.guide('Doddha jump maadi, guru! | Do a big jump, boss!'));
  },
};

/** BLR-06: power cut. In the dark you see only a step ahead; the lights blink back now and then. */
const powerCut: Act = {
  id: 'blr06-powercut',
  w: 32,
  advice: 'Power cut: you only see a step ahead, and the lights blink back every few seconds. Use the blinks to learn where the holes are.',
  paint: (g, c) => {
    for (const t of [7, 14, 21]) g.pit(c.x + t, c.x + t + 1);
    g.fill(c.x + 17, c.x + 18, 14, 14, '^');
  },
  build: (w, c) => {
    const { X } = c;
    onPass(w, X(2), (w2) => {
      w2.flags.dark = 1;
      w2.flags.darkR = 34;
      w2.sfx('snap', X(4), px(G));
      say(w2, 'Current hoytu! | Power cut!', X(5), G - 4, 1.2);
    });
    onPass(w, X(28.5), (w2) => {
      w2.flags.dark = 0;
      say(w2, 'Current bantu! | Power’s back!', X(30), G - 4, 1);
    });
    w.onTick((w2) => {
      if (!w2.flags.dark) return;
      const t = (w2.tick * DT) % 2.6;
      w2.flags.lit = t < 0.35 ? 1 : 0;
    });
    sign(w, c.x + 0.5, G - 4.4, 3.6, 'BESCOM', 'green', null, 'scheduled cut');
  },
};

/** BLR-07: the awake boulder overhead sinks whenever you stand still under it: keep moving, small hops only. */
const sinkingRock: Act = {
  id: 'blr07-crusher',
  w: 32,
  advice: 'The great boulder overhead settles whenever you stand still under it: keep moving, and use small hops, it hangs low.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 26, 9, 10, c.L[0]);
    g.pit(c.x + 11, c.x + 12).pit(c.x + 19, c.x + 20);
    g.fill(c.x + 23, c.x + 23, 14, 14, '^');
  },
  build: (w, c) => {
    const { X } = c;
    const rock = group(w, c.L[0]);
    let yr = 0;
    w.onTick((w2) => {
      const p = w2.player;
      const under = p.cx > X(6) && p.cx < X(27);
      if (!under || Math.abs(p.vx) > 40 || rock.state !== 'rest') return;
      yr += 70 * DT;
      const dy = Math.floor(yr);
      if (dy > 0) {
        yr -= dy;
        rock.solid.moveBy(w2, 0, dy);
        if (rock.solid.y + rock.solid.h > p.y + 1 && p.onGround) w2.die('crushed');
      }
    });
    onPass(w, X(5), (w2) => say(w2, 'Bande eddide! | The rock is awake!', X(14), 6, 1.4));
    onPass(w, X(2), (w2) => w2.guide('Swalpa rest maadi, guru! | Take a little rest, boss!'));
  },
};

/** BLR-08: the waterfall curtain isn't deadly here: walk through it into the tunnel; then the stones are wet. */
const curtain: Act = {
  id: 'blr08-curtain',
  w: 30,
  advice: 'This waterfall is only a thin curtain: walk through it into the tunnel under the cliff. After it the stones are wet: jump the gap before you slide in.',
  paint: (g, c) => {
    g.fill(c.x + 14, c.x + 16, 3, 13, '#');
    g.fill(c.x + 17, c.x + 21, G, G, '~');
    g.pit(c.x + 22, c.x + 23);
  },
  build: (w, c) => {
    const { X } = c;
    const fall = cascade(w, X(12.5), 0, px(G), 1, [[0, 1]], { width: 26, warn: 0 });
    fall.hazard.hits = () => false;
    onPass(w, X(2), (w2) => w2.guide('Neeru muttabedi! Mele hatti! | Don’t touch the water! Climb over!'));
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'JOG', 'green', null, 'the cliff');
  },
};

export const BLR: LevelDef[] = [
  tour({
    id: 'BLR-01',
    city: 'BLR',
    name: "Namaskara Bengaluru",
    nameEn: "Welcome to Bengaluru",
    tagline: "Gardens, tech parks, filter kaapi and weather everyone brags about.",
    lines: [
      "Namaskara! Bengaluru-ge swaagatha! | Hello! Welcome to Bengaluru!",
      "Idu Karnataka-da rajadhani! | This is the capital of Karnataka!",
      "Garden City antha hesaru! | They call it the Garden City: Lalbagh, Cubbon Park...",
      "India-da Silicon Valley, guru! | India's Silicon Valley, boss: tech parks everywhere.",
      "Sumaaru 900 meter ettaradalli! | It sits about 900 m up, so the weather stays lovely.",
      "Sari Dad, ivaga nija aata shuru! | Okay Dad, now the real game starts!",
    ],
    shouts: [
      [21, "Kaapi, masala dose ready! | Coffee and masala dosa, ready!"],
      [88, "Swalpa adjust maadi! | Adjust a little!"],
    ],
    ride: "scooter",
    item: "kaapi",
    signs: [[8, "MG ROAD", "metro"], [55, "LALBAGH", "glass house"], [102, "CUBBON PARK", "this way"]],
    props: [
      ["jacaranda", 3, {}],
      ["lamp", 18, {}],
      ["jacaranda", 34, {}],
      ["jacaranda", 63, {}],
      ["cablebox", 90, {}],
      ["jacaranda", 107, {}],
    ],
    things: [],
    hint: 'After the metro, the dug-up road has a smart bridge. It loads a tile at a time when you step up: walk behind the loading edge. It sticks at 99% and then restarts from nothing, so don’t wait for the last tile: jump it.',
    paint: (g) => g.fill(72, 79, 15, 17, '.'),
    extra: (w) => {
      LoadingBridge.place(w, { tx: 72, ty: 15, n: 8 });
      checkpoint(w, 80.6);
    },
  }),
  longStage({
    base: {
    id: 'BLR-02',
    city: 'BLR',
    index: 2,
    name: 'Green Man',
    tagline: 'The button actually works',
    hint: 'The button works. Maybe too well. Be on top of the little car when the traffic arrives, then step up.',
    par: 3.1,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '...E............................',
      '#######.........................',
      '#######.........................',
      '#######.........................',
      '#######..@......................',
      '################################',
      '################################',
      '################################',
    ],
    build(w: World) {
      exitTwist(w, door(w), 'crush', { from: -1 });
      const sig = signal(w, 17, 15, [{ light: 'red' }, { light: 'green', dur: 8 }]);
      // the low car leads; the big bus and a scooter pile in right behind it
      const car = vehicle(w, 'car', 296, 15, { facing: -1, color: '#E9C46A' });
      const bus = vehicle(w, 'bus', 368, 15, { facing: -1, label: 'K.R. PURAM' });
      const scooter = vehicle(w, 'scooter', 460, 15, { facing: -1, color: '#E9ECEF' });
      car.follow(sig, { 1: (v) => v.drive(112) });
      bus.follow(sig, { 1: (v) => v.wait(0.3).drive(160) });
      scooter.follow(sig, { 1: (v) => v.wait(0.55).drive(244) });
      rival(w, 4, 11, 1, { intro: L.intro[3], point: 1, introAt: 0.6, taunts: TAUNTS, beaten: L.beaten[0] });
      pedButton(w, 7, 12, 15, (wd) => {
        if (sig.idx === 0) sig.go(wd, 1);
      });
      prop(w, 'tree', 12, 15);
      prop(w, 'jacaranda', 28, 15);
      prop(w, 'cone', 9.6, 15, {}, 4);
      sign(w, 9.5, 10.2, 5, 'PRESS FOR GREEN', 'wood', null, 'pedestrians first!');
      collectible(w, 'kaapi', 12, 6.0);
      for (const tx of [15, 25]) panel(w, tx, 10, 1, 5, '#B7B2A8', 'rgba(0,0,0,0.18)');
    },
  },
    // the metro line: up from the building roof, along over the junction, then steps down
    join: (g) => g.fill(7, 33, 9, 9, '#').fill(34, 35, 11, 17, '#').fill(36, 37, 13, 17, '#'),
    joinW: 8,
    par: 20,
    twist: 'revolve',
    acts: [badgeGates],
  }),
  longStage({
    base: {
    id: 'BLR-03',
    city: 'BLR',
    index: 3,
    name: 'Namma Metro',
    nameEn: 'Our metro',
    tagline: 'Opening soon. Since 2019.',
    hint: "Tara's Metro isn't finished. The rebar is deadly on foot, but buses don't mind it.",
    par: 7.6,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '...#######aaaaaaaa#########.....',
      '................................',
      '................................',
      '##..............................',
      '................................',
      '...@......^^^^^^^^^^^........E..',
      '################################',
      '################################',
      '################################',
    ],
    build(w: World) {
      exitTwist(w, door(w), 'swap', { to: 24 });
      const deck = group(w, 'a');
      w.when(
        () => w.standing(deck.solid) && w.player.x >= px(10) + 1,
        () => deck.fall(w, { delay: 0.12 }),
      );
      const sig = signal(w, 11, 15, [
        { light: 'red', dur: 8 },
        { light: 'green', dur: 6 },
      ]);
      sig.start = -secs(4);
      const bus = vehicle(w, 'bus', 96, 15, { label: '335-E' });
      bus.follow(sig, { 1: (v) => v.drive(352).wait(3).drive(640).warp(-140).drive(96) });
      w.when(
        () => w.standing(bus.solid) && bus.x > px(12),
        () => (w.rivalBeaten = true),
      );
      rival(w, 7, 9, -1, {
        intro: 'Metro open aagide! Trust me, guru. | The metro is open! Trust me, boss.',
        point: 1,
        introAt: 0.6,
        taunts: TAUNTS,
        beaten: 'Bus-alli?! Yaaru bus hattodu?! | By bus?! Who even takes the bus?!',
      });
      sign(w, 19, 7.2, 5, 'METRO 2027*', 'metro', null, '*conditions apply', false);
      prop(w, 'pillar', 8, 15, { h: 96, color: '#8C7BB0' }, -8);
      prop(w, 'pillar', 22, 15, { h: 96, color: '#8C7BB0' }, -8);
      prop(w, 'barricade', 11.5, 15, { label: 'WORK IN PROGRESS' }, -6);
      prop(w, 'jacaranda', 27, 15);
      collectible(w, 'kaapi', 14, 10.4);
    },
  },
    par: 20,
    twist: 'pull',
    acts: [viaduct],
  }),
  longStage({
    base: {
    id: 'BLR-04',
    city: 'BLR',
    index: 4,
    name: 'Silk Board',
    tagline: 'Signal is a suggestion',
    hint: "Bengaluru drivers don't wait for green, so be on board before it. Then mind your head.",
    par: 8.0,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '..............................E.',
      '............................####',
      '..............%......%..........',
      '................................',
      '................................',
      '..@...^^^^^^^^^^^^^^^^^^^^^^^^^^',
      '################################',
      '################################',
      '################################',
    ],
    build(w: World) {
      door(w);
      // the countdown shows 5..2, then the bus jumps the signal at "1"
      const sig = signal(w, 9, 15, [
        { light: 'red', dur: 4, show: (r) => String(Math.ceil(r - 1e-6) + 1) },
        { light: 'red', dur: 1, show: () => '1' },
        { light: 'green', dur: 3 },
      ]);
      const bus = vehicle(w, 'bus', 48, 15, { label: '500-D SILK BRD', maxV: 120, accel: 220 });
      bus.follow(sig, { 1: (v) => v.drive(700).warp(-100).drive(48) });
      prop(w, 'hangsign', 14, 11, { label: 'SLOW', sub: 'silk board' }, 6);
      prop(w, 'cablebox', 21, 11, {}, 6);
      sign(w, 2, 8.4, 5, 'SILK BOARD JN.', 'green', 'right', 'wait time: yes');
      rival(w, 30, 10, -1, { intro: L.intro[4], point: -1, introAt: 0.6, taunts: TAUNTS, beaten: L.beaten[1] });
      prop(w, 'jacaranda', 1, 15);
      prop(w, 'pillar', 29.5, 15, { h: 80, color: '#7D8C88' }, -8);
      collectible(w, 'kaapi', 17.5, 9.6);
    },
  },
    // off the ledge and down to the road beyond the jam
    join: (g) => g.fill(32, 35, 10, 17, '#').fill(36, 37, 12, 17, '#').fill(38, 39, 14, 17, '#'),
    joinW: 8,
    par: 22,
    acts: [jamHop],
    twist: 'wall',
  }),
  longStage({
    base: {
    id: 'BLR-05',
    city: 'BLR',
    index: 5,
    name: 'Garden City Remote',
    tagline: 'Her signal, her rules',
    hint: 'Every time you jump, Tara flips the signal. Jump in place right in front of the auto: green, and it rolls under you. Then don’t jump again until the building.',
    par: 3.1,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '..........................E.....',
      '.........................#######',
      '.........................#######',
      '.........................#######',
      '........@................#######',
      '################################',
      '################################',
      '################################',
    ],
    build(w: World) {
      door(w);
      const sig = signal(w, 15, 15, [{ light: 'red' }, { light: 'green' }]);
      const bus = vehicle(w, 'autoV', 86, 15, { accel: 520, maxV: 150 });
      bus.follow(sig, {
        0: (v) => v.drive(86),
        1: (v) => v.drive(360),
      });
      // Tara's remote: every player jump flips the signal
      w.when(
        () => w.player.jumpTick === w.tick,
        (wd) => {
          sig.next(wd);
          wd.emit('fx', px(29) + 8, px(10) - 14, { kind: 'remote' });
        },
        false,
      );
      w.when(
        () => w.standing(bus.solid) && bus.x >= 358,
        () => (w.rivalBeaten = true),
      );
      rival(w, 29, 10, -1, {
        intro: 'Nanna signal, nanna rules! | My signal, my rules!',
        point: -1,
        introAt: 0.5,
        taunts: TAUNTS,
        beaten: 'Ayyo! Remote ulta aaythu! Mysuru-ge hogona! | Oh no! The remote backfired! Let’s go to Mysuru!',
      });
      prop(w, 'jacaranda', 11, 15);
      prop(w, 'bench', 21, 15);
      sign(w, 2, 9.2, 6, 'CUBBON PARK', 'green', null, 'gate 2');
      collectible(w, 'kaapi', 16, 10.2);
    },
  },
    par: 15,
    acts: [glasshouse],
    twist: 'wrap',
  }),
  longStage({
    base: {
    id: 'BLR-06',
    city: 'BLR',
    index: 6,
    name: 'Deepalankara',
    nameEn: 'Festival lights',
    tagline: 'Sunday, 7 pm: the palace switches on',
    hint: 'Only lit bulbs hold you, so ride inside the running lights. Halfway, they run backwards: jump up to the top string before that. When the bulbs flicker, sprint for the balcony.',
    par: 6,
    scene: { kind: 'night', place: 'Mysuru Palace', with: ['palace'] },
    map: new Grid().fill(0, 4, 12, 17, '#').fill(26, 31, 10, 17, '#').put(2, 11, '@').put(30, 9, 'E').rows(),
    build(w: World) {
      door(w);
      // running lights: a pulse lights the bulbs within HALF px of its centre
      const V = 96,
        HALF = 40,
        PERIOD = 2.5;
      type Pulse = { c: number; v: number };
      const lower: Pulse[] = [],
        upper: Pulse[] = [];
      w.flags.lower = lower;
      w.flags.upper = upper;
      const lowSegs: Blinker[] = [],
        upSegs: Blinker[] = [];
      for (let c = 5; c <= 25; c++) lowSegs.push(blinker(w, 'bulbs', c, 12, null, { w: 16, h: 6 }));
      for (let c = 12; c <= 25; c++) upSegs.push(blinker(w, 'bulbs', c, 10, null, { w: 16, h: 6 }));
      let reversed = false;
      let cut: 'none' | 'warn' | 'off' | 'back' = 'none';
      w.flags.cut = cut;
      const spawn = () => {
        if (w.state !== 'play') return;
        upper.push({ c: px(5) - HALF, v: V });
        lower.push(reversed ? { c: px(26) + HALF, v: -V } : { c: px(5) - HALF, v: V });
        w.after(PERIOD, spawn);
      };
      spawn();
      const light = (segs: Blinker[], ps: Pulse[]) => {
        for (const b of segs) {
          const cx = b.solid.x + 8;
          b.forced = cut === 'off' ? false : ps.some((q) => Math.abs(cx - q.c) <= HALF);
          b.flicker = cut === 'warn';
        }
      };
      w.onTick(() => {
        for (const list of [lower, upper]) {
          for (const q of list) q.c += q.v * DT;
          for (let i = list.length - 1; i >= 0; i--) if (list[i].c < -HALF - 16 || list[i].c > ROOM_W + HALF + 16) list.splice(i, 1);
        }
        light(lowSegs, lower);
        light(upSegs, upper);
      });
      // halfway, the bottom string runs backwards
      w.when(
        (w2) => !reversed && w2.player.x >= px(13.5),
        (w2) => {
          reversed = true;
          for (const q of lower) q.v = -V;
          w2.sfx('blink', w2.player.cx, px(12));
          w2.say('Ayyo, ulta hoythu! | Oh no, it’s running backwards!', px(14), px(8), 2, 'npc');
        },
      );
      // and near the balcony: a power cut
      w.when(
        (w2) => cut === 'none' && w2.player.x >= px(22.5) && w2.player.y + w2.player.h <= px(10) + 2,
        (w2) => {
          cut = 'warn';
          w2.flags.cut = cut;
          w2.say('Current hoythu! | Power cut!', px(24), px(7), 1.6, 'npc');
          w2.after(0.45, () => {
            cut = 'off';
            w2.flags.cut = cut;
            w2.sfx('blink', px(22), px(10));
          });
          w2.after(1.75, () => {
            cut = 'back';
            w2.flags.cut = cut;
          });
        },
      );
      rival(w, 28, 10, -1, { intro: 'Mysuru Dasara! Belaku mele nadi, Dad! | Mysuru Dasara! Walk on the lights, Dad!', point: -1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[0] });
      collectible(w, 'kaapi', 19.5, 6.6);
    },
  },
    par: 16,
    acts: [powerCut],
    twist: 'invisible',
  }),
  longStage({
    base: {
    id: 'BLR-07',
    city: 'BLR',
    index: 7,
    name: 'Hampi Harigolu',
    nameEn: 'Hampi coracle',
    tagline: 'Boulders everywhere. One of them is awake.',
    hint: 'The boulder rolls at you, then bounces back off the cliff: jump it both times. On the coracle, left and right swap, so press left to jump right. Don’t stop when you land.',
    par: 8.5,
    scene: { kind: 'rock', place: 'Hampi', with: ['boulders'] },
    map: Grid.ground(13).pit(14, 23, 13).fill(24, 31, 12, 12, '#').fill(26, 27, 7, 7, '#').put(2, 12, '@').put(30, 11, 'E').rows(),
    build(w: World) {
      door(w);
      water(w, 13.6, { rate: 0, minTy: 13.6, colors: ['#4F8FA8', '#2E6478'], cause: 'splash' });
      // a boulder that looks like all the others... until you come near
      const still = thing(w, 'boulder', 12, 13, { dy: -24, solid: false });
      let rolling: Roller | null = null;
      w.when(
        (w2) => w2.player.x >= px(3.5),
        (w2) => {
          still.hide();
          rolling = roller(w2, 'boulder', still.solid.x, still.solid.y, -150, { cause: 'hit' });
          w2.say('Bande bartide, odi! | The boulder’s coming, run!', px(8), px(9), 2, 'npc');
        },
      );
      // ...it bounces back off the cliff, and plops into the river at the edge
      w.onTick((w2) => {
        const r = rolling;
        if (r && r.alive && r.vx > 0 && r.x + 16 > px(14)) {
          r.alive = false;
          r.hazard.active = false;
          w2.emit('fx', px(14), px(13.6), { kind: 'dust' });
          w2.sfx('splash', px(14), px(13.6));
        }
      });
      // the coracle spins: on board, left and right swap
      const boat = thing(w, 'coracle', 14, 0, { dy: 211, oneWay: true });
      let told = false;
      w.flags.boat = boat;
      w.onTick((w2) => {
        const t = w2.tick * DT;
        boat.place(w2, 286 + Math.sin(t * 0.97 + 2.384) * 58, 211 + Math.sin(t * 2.3) * 1.5);
        if (w2.standing(boat.solid)) {
          if (!told) {
            told = true;
            w2.flipControls(0.35);
          } else w2.flipUntil = Math.max(w2.flipUntil, w2.tick + 42);
        }
      });
      // a balancing rock over the far bank
      const perch = thing(w, 'boulder', 26, 7, { dy: -24 });
      w.when(
        (w2) => w2.player.onGround && w2.player.x >= px(24) - 6 && w2.player.y + w2.player.h <= px(12) + 1,
        (w2) => {
          perch.shake(w2, 0.35, (w3) => perch.moveTo(w3, perch.solid.x - 34, perch.solid.y, 0.12, 'in', (w4) => perch.fall(w4, { land: true, g: 1700 })));
        },
      );
      rival(w, 29, 12, -1, { intro: 'Harigolu hatti, Dad! Hampi suttona! | Get in the coracle, Dad! Let’s tour Hampi!', point: -1, introAt: 0.5, taunts: TAUNTS, beaten: L.beaten[1] });
      collectible(w, 'kaapi', 19, 9.4);
    },
  },
    par: 18,
    acts: [sinkingRock],
    twist: 'cctv',
  }),
  longStage({
    base: {
    id: 'BLR-08',
    city: 'BLR',
    index: 8,
    name: 'Jog Jalapatha',
    nameEn: 'Jog Falls',
    tagline: 'Raja, Rani, Roarer and Rocket',
    hint: 'Cross each stream while it’s dry. Rani stops twice, and the first gap is a trick. The Roarer swells when you land next to it, so stay on the left of that ledge. Logs roll off the top: hop them.',
    par: 9.5,
    scene: { kind: 'falls', place: 'Jog Falls' },
    map: (() => {
      const g = new Grid().fill(0, 31, 16, 17, '#').fill(0, 4, 14, 17, '#');
      g.fill(6, 9, 12, 12, '=').fill(11, 14, 10, 10, '=').fill(16, 19, 8, 8, '=').fill(21, 24, 6, 6, '=').fill(26, 31, 4, 4, '#');
      return g.put(2, 13, '@').put(30, 3, 'E').rows();
    })(),
    build(w: World) {
      door(w);
      water(w, 14.75, { rate: 0, minTy: 14.75, colors: ['#7FB9D6', '#3F7FA0'], cause: 'splash' });
      const top = 0,
        pool = px(14.75);
      const raja = cascade(w, px(10.5), top, pool, 2.4, [[0, 1.3]], { width: 14 });
      const rani = cascade(w, px(15.5), top, pool, 3.0, [[0, 0.8], [1.15, 0.6]], { width: 12 });
      const roarer = cascade(w, px(20.5), top, pool, 2.6, [[0.6, 1.4]], { width: 14 });
      const rocket = cascade(w, px(25.5), top, pool, 1.7, [[0.3, 0.9]], { width: 12 });
      void raja;
      void rocket;
      // Rani's first gap is a fake: she comes straight back
      let fooled = false;
      w.when(
        (w2) => {
          const m = (w2.tick * DT) % 3.0;
          return !fooled && m > 0.8 && m < 1.15 && w2.player.x >= px(12.5) && w2.player.y + w2.player.h <= px(10) + 1;
        },
        (w2) => {
          fooled = true;
          w2.say('Rani matthe bandlu! | Rani’s back already!', px(15), px(6), 1.6, 'npc');
        },
      );
      // the Roarer swells when you land beside it
      w.when(
        (w2) => w2.player.onGround && w2.player.x >= px(15.5) && w2.player.y + w2.player.h <= px(8) + 1,
        (w2) => {
          roarer.forced = true;
          w2.sfx('splash', px(20), px(8));
          w2.emit('shake', px(20), px(8), { amount: 2 });
          w2.say('Ayyo, Roarer! Hindhe banni! | Oh no, the Roarer! Step back!', px(18), px(5), 1.8, 'npc');
          const grow = (k: number) => {
            roarer.surge = k;
          };
          for (let i = 1; i <= 7; i++) w2.after(i * 0.04, () => grow(i * 2));
          w2.after(1.6, () => {
            roarer.surge = 0;
            roarer.forced = null;
          });
        },
      );
      // logs roll along the top and tip over into the falls
      const logs: Roller[] = [];
      const log = () => {
        if (w.state !== 'play') return;
        // (none spawn once you're up past where they come from: the way on is over the top)
        if (w.player.x < ROOM_W - 64) logs.push(roller(w, 'log', ROOM_W - 34, px(4) - 10, -95, { cause: 'hit' }));
        w.after(2.1, log);
      };
      w.after(0.8, log);
      w.onTick((w2) => {
        for (const r of logs) {
          if (r.alive && r.x < px(26) + 6) {
            r.alive = false;
            r.hazard.active = false;
            w2.emit('fx', r.x + 16, r.y + 8, { kind: 'dust' });
          }
        }
      });
      rival(w, 28, 4, -1, { intro: 'Jog Jalapatha! Raja, Rani, Roarer, Rocket! | Jog Falls! Raja, Rani, Roarer, Rocket!', point: -1, introAt: 0.5, taunts: TAUNTS, beaten: 'Sakkath, Dad! Amaravati-alli sigona! | Awesome, Dad! See you in Amaravati!' });
      collectible(w, 'kaapi', 10.2, 7.5);
    },
  },
    // over the top of the falls, then down the far side
    join: (g) => g.fill(32, 33, 4, 17, '#').fill(34, 35, 6, 17, '#').fill(36, 37, 8, 17, '#').fill(38, 39, 10, 17, '#').fill(40, 41, 12, 17, '#').fill(42, 43, 14, 17, '#'),
    joinW: 12,
    par: 21,
    acts: [curtain],
    twist: 'spikes',
  }),
];
