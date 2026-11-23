import type { LevelDef, World } from '../world';
import { LINES } from '../cities';
import { Rider, Roller, Thing } from '../entities/traps';
import { arc, checkpoint, cloud, collapseOnStand, collectible, door, geyser, group, gust, panel, prop, px, rider, rival, roller, shot, sign, spikes, spring, thing, thingOn, water } from './kit';
import { DT } from '../constants';
import { tour } from './tour';
import { Grid } from './grid';
import { exitTwist } from './twists';
import { crumble, dropFloor, fakeFloor, gapAhead, noLanding, onPass, popAt, popOnJump, riseWall, shyLedge } from './trolls';
import { Counterweight, Launch, Puddle, Slab, Tarp } from '../entities/kerala';

// Thiruvananthapuram: monsoon puddles, a red express bus, a tea stall,
// coconut palms and the old fort gate. Lines: Malayalam + English.

const L = LINES.TVM;
const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });

/** A coconut hanging in a palm crown at (x, y) px. Falls (hurts), lands, then rolls. */
function coconut(w: World, x: number, y: number) {
  return w.add(new Thing('coconut', x, y, { solid: false, layer: 3 }));
}

function drop(w: World, c: Thing, o: { shake?: number; rollVx?: number; v0?: number; land?: boolean } = {}) {
  if (c.state !== 'rest') return;
  c.setDeadly('coconut');
  w.sfx('creak', c.cx, c.y);
  c.fall(w, {
    delay: o.shake ?? 0.15,
    v0: o.v0 ?? 30,
    land: o.land ?? true,
    then: () => {
      c.hide();
      if (o.rollVx) roller(w, 'coconut', c.x, c.y, o.rollVx, { cause: 'coconut' });
    },
  });
}

/** Seconds-free helper: is a rolling coconut alive? (used by the solution scripts too) */
export function rollerOf(w: World): Roller | undefined {
  return w.entities.find((e) => e instanceof Roller && (e as Roller).alive) as Roller | undefined;
}

export const TVM: LevelDef[] = [
  tour({
    id: 'TVM-01',
    city: 'TVM',
    name: "Swagatham",
    nameEn: "Welcome to Thiruvananthapuram",
    tagline: "Red buses, coconut palms, a rocket station and chaaya in the rain.",
    lines: [
      "Namaskaram! Thiruvananthapuram-ilekku swagatham! | Hello! Welcome to Thiruvananthapuram!",
      "Ithu Kerala-yude thalasthaanam! | This is the capital of Kerala!",
      "Monsoon aadyam ethunnathu Kerala-yil! | The monsoon reaches India first in Kerala, around June!",
      "1963-il India-yude aadya rocket Thumba-yil ninnu! | India's first rocket took off from Thumba, right here, in 1963!",
      "Kerala-yil ellarum vaayikkum! | Kerala has the highest literacy in India!",
      "Sheri Dad, ini sharikkum kali! Sookshicho! | Okay Dad, now the real game. Watch out!",
    ],
    shouts: [
      [21, "Chaaya! Choodu chaaya! | Tea! Hot tea!"],
      [85, "Puttum kadalayum ready! | Puttu and kadala curry, ready!"],
    ],
    ride: "scooter",
    item: "chaaya",
    signs: [[8, "KSRTC", "bus stand"], [55, "THUMBA", "rocket station"], [102, "KOVALAM", "16 km"]],
    props: [
      ["palm", 2, { h: 80, lean: 6 }],
      ["teastall", 20, { label: 'CHAAYA' }],
      ["palm", 33, { h: 88, lean: -5 }],
      ["palm", 64, { h: 76, lean: 4 }],
      ["teastall", 84, { label: 'PUTTU' }],
      ["palm", 108, { h: 84, lean: -6 }],
    ],
    things: [["redbus", 29]],
    // three long runs, Level Devil style: dying sends you back to the start of the run, not the last step
    cps: [32, 67, 81],
    hint: 'The road caves in right after Tara: hop it, a small hop. That hop puts broken glass on the compound wall: jump clean over it, then hop again at once, the road past it is full of glass too. The ditch is only a puddle: walk in and climb out (jump it from the road and spikes meet you on the far side). When the rocket at Thumba goes up, the road burns: stop on the last step, not at the bottom (the spent stage falls there); hop it once it’s down. The canoe’s landing gives way: hop off it. At the puttu stall, stop short of the blue tarp and let it empty, then jump the puddle after it: that one is a pothole. At the very end the road opens in front of you: don’t jump it (the far side breaks), wait, it closes again.',
    // the monsoon has eaten the road after Tara; the compound wall wears broken glass (Kerala's
    // walls do) and the road below it is strewn with more; the ditch is just a puddle to wade, but
    // jump it and its far side bristles; Thumba's rocket goes up as you come down the steps; the
    // canoe's landing gives way; the puttu stall's tarp is full of rain, and the puddle past it is
    // a pothole; and the road at the very end opens up
    paint: (g) =>
      g
        .fill(8, 9, 15, 17, 'a')
        .put(12, 13, 'G')
        .put(17, 14, 'K')
        .fill(26, 30, 14, 14, 'J')
        .fill(78, 79, 15, 17, 'c')
        .fill(89, 90, 15, 16, '.')
        .fill(104, 106, 15, 17, 'g')
        .fill(107, 110, 15, 17, 'h'),
    extra: (w) => {
      dropFloor(w, 'a', { at: px(8) - 6 });
      popOnJump(w, 'G', px(6), px(12.5)).look = 'glass';
      // the wall's glass doesn't stay on the wall: the road under it is strewn with it
      popAt(w, 'K', px(16) + 4).look = 'glass';
      // wade the ditch; jump it from the road and its far side bristles where you come down
      const far = spikes(w, 'J');
      w.when(
        (w2) => w2.player.jumpTick === w2.tick && w2.player.cx >= px(20) && w2.player.cx < px(26) && w2.player.y + w2.player.h <= px(15) + 1,
        (w2) => far.pop(w2),
      );
      dropFloor(w, 'c', { at: px(77.4) });
      const rocket = Launch.place(w, { tx: 61, groundTy: 15, blast: [58, 65], blastSec: 1.4, stageTx: 52, sepAt: 1.5 });
      onPass(w, px(50), (w2) => rocket.fire(w2));
      // the puttu stall's tarp is full of rain; the puddle past it is a pothole, not a ditch to wade
      w.add(new Tarp({ tx0: 85.6, tx1: 88.6, ty: 11, groundTy: 15, drop: [86.2, 89], triggerTx: 83.6 }));
      w.add(new Puddle(px(89), px(91)));
      gapAhead(w, 'g', { lead: 30, back: 0.8 });
      noLanding(w, 'h');
    },
  }),
  {
    id: 'TVM-02',
    city: 'TVM',
    index: 2,
    name: 'Aanavandi Express',
    nameEn: 'The elephant-bus express',
    tagline: 'Monsoon flood. One red bus. Ride on the roof.',
    hint: 'Hop the crows that fly at you, but not the big brown kite: it glides over your head if you stand, and a hop meets it. Never jump under a flyover. A chunk of the first flyover falls on the back of the roof, and one of the second on the middle. One bell: he brakes and you slide forward. Two bells: he jerks off and you slide back. So ride the middle through the bells, then go to the front before the second flyover. At the end it turns back: jump off before it does.',
    par: 23,
    map: (() => {
      const g = new Grid(96).fill(0, 3, 13, 17, '#').fill(88, 95, 12, 17, '#');
      // two low flyovers over the road; spikes hide under their decks (A, B)
      g.fill(29, 35, 9, 10, 'c').fill(29, 35, 11, 11, 'A');
      g.fill(60, 66, 9, 10, 'd').fill(60, 66, 11, 11, 'B');
      return g.put(1, 12, '@').put(93, 11, 'E').rows();
    })(),
    build(w: World) {
      for (const tx of [36, 60]) checkpoint(w, tx);
      exitTwist(w, door(w), 'knock');
      // the flood: only the bus is dry
      water(w, 14.4, { rate: 0, minTy: 14.4, colors: ['rgba(86,140,150,0.88)', 'rgba(36,80,92,0.96)'], cause: 'splash' });
      const bus = thing(w, 'redbus', 10, 0, { dy: 240 - 40, h: 40, label: 'SUPER FAST' });
      const Y = bus.y;
      let x = bus.x,
        lastX = x,
        v = 0,
        rung = false;
      let phase: 'arrive' | 'wait' | 'go' | 'brake' | 'stop' | 'go2' | 'end' | 'back' = 'arrive';
      w.flags.bus = phase;
      const set = (p2: typeof phase) => {
        phase = p2;
        w.flags.bus = p2;
      };
      w.after(0.7, () => w.say('Side kodu! Bus varunnu! | Make way! The bus is coming!', bus.cx, Y - 14, 1.6, 'npc'));
      w.onTick((w2) => {
        const riding = w2.standing(bus.solid);
        if (phase === 'arrive') {
          x = Math.max(px(4), x - 95 * DT);
          if (x <= px(4)) set('wait');
        } else if (phase === 'wait') {
          if (riding) {
            set('go');
            w2.sfx('honk', bus.cx, Y);
          }
        } else if (phase === 'go' || phase === 'go2') {
          v = Math.min(108, v + 160 * DT);
          x += v * DT;
          // one bell means stop: the conductor rings it a moment before the statue
          if (phase === 'go' && !rung && x >= px(31.6)) {
            rung = true;
            w2.sfx('ding', bus.cx, Y);
            w2.say('Statue! Statue! | Statue stop!', bus.cx, Y - 14, 1.4, 'npc');
          }
          if (phase === 'go' && x >= px(37)) {
            set('brake');
            w2.sfx('honk', bus.cx, Y);
          }
          if (phase === 'go2' && x >= px(80)) {
            set('end');
            v = 0;
            w2.say('Last stop!', bus.cx + 30, Y - 14, 1.1, 'npc');
            w2.after(0.75, () => set('back'));
          }
        } else if (phase === 'brake') {
          // slams the brakes: whoever stands on the roof slides on forward
          v = 0;
          if (riding) {
            w2.player.vx = 200;
            w2.player.stun = 12;
          }
          w2.emit('shake', bus.cx, Y, { amount: 3 });
          w2.sfx('thud', bus.cx, Y);
          set('stop');
          // two bells mean go: and he takes off with a jerk that slides the roof out from under you
          w2.after(0.6, () => {
            w2.sfx('bell', bus.cx, Y);
            w2.say('Right, right! | Go on, go!', bus.cx, Y - 14, 1.2, 'npc');
          });
          w2.after(1.4, () => {
            set('go2');
            v = 70;
            if (w2.standing(bus.solid)) {
              w2.player.vx = -230;
              w2.player.stun = 32;
            }
            w2.emit('shake', bus.cx, Y, { amount: 2 });
            w2.sfx('thud', bus.cx, Y);
          });
        } else if (phase === 'back') {
          x = Math.max(px(4), x - 120 * DT);
        }
        // its speed, so a hop on the roof keeps it (you land where you took off)
        bus.solid.velX = (x - lastX) / DT;
        lastX = x;
        bus.place(w2, x, Y);
      });
      // under the first flyover a tired chunk of it cracks off on to the back of the roof
      w.when(
        () => x >= px(30) && (phase === 'go' || phase === 'go2'),
        (w2) => {
          w2.sfx('crack', px(32), px(11));
          w2.add(new Slab(px(30) + 20, px(11) + 2));
        },
      );
      // crows fly at you along the road, at head height above the roof
      const crowAt = (busX: number) =>
        w.when(
          (w2) => x >= busX && (phase === 'go' || phase === 'go2'),
          (w2) => shot(w2, 'crow', w2.player.x + 230, Y - 13, -125, 0, 0, 'hit'),
        );
      [px(14), px(18), px(67), px(72)].forEach(crowAt);
      // by now you hop anything with wings. A Brahminy kite glides over, well above your head:
      // stand and it passes; hop it like a crow and you meet it
      w.when(
        (w2) => x >= px(46) && phase === 'go2',
        (w2) => {
          shot(w2, 'parunthu', w2.player.x + 220, Y - 44, -100, 0, 0, 'hit');
          w2.sfx('caw', w2.player.x + 180, Y - 40);
        },
      );
      // under the second flyover a chunk drops on the middle of the roof, where the bells taught you to ride
      w.when(
        () => x >= px(60) - 30 && phase === 'go2',
        (w2) => {
          w2.sfx('crack', x + 64, px(11));
          w2.add(new Slab(x + 53, px(11) + 2));
        },
      );
      // jump under a flyover and its spikes come down
      popOnJump(w, 'A', px(28) - 4, px(36) + 4);
      popOnJump(w, 'B', px(59) - 4, px(67) + 4);
      // the flyovers are concrete decks on pillars
      const deck = { fill: '#9AA0A6', trim: '#C9CDD1', line: 'rgba(40,44,48,0.35)' };
      for (const [l, c0] of [
        ['c', 29],
        ['d', 60],
      ] as const) {
        group(w, l).paint = deck;
        panel(w, c0 + 0.6, 11, 0.8, 7, '#8A9096', 'rgba(0,0,0,0.12)');
        panel(w, c0 + 5.6, 11, 0.8, 7, '#8A9096', 'rgba(0,0,0,0.12)');
      }
      // dressing
      prop(w, 'busstop', 2, 13);
      sign(w, 0.4, 9.2, 3.4, 'KSRTC', 'green', 'right', 'bus stop');
      prop(w, 'palm', 20, 15, { h: 96, lean: -6 }, -8);
      prop(w, 'palm', 44, 15, { h: 90, lean: 5 }, -8);
      prop(w, 'palm', 76, 15, { h: 94, lean: -4 }, -8);
      sign(w, 36.6, 6.4, 3.8, 'STATUE', 'green', null, 'next stop', false);
      prop(w, 'palm', 92, 12, { h: 70, lean: 6 });
      rival(w, 91, 12, -1, tara(1, -1));
      collectible(w, 'chaaya', 48, 8.6);
    },
  },
  {
    id: 'TVM-03',
    city: 'TVM',
    index: 3,
    name: 'Chaaya Later',
    nameEn: 'Tea later',
    tagline: 'A tea street. Everything is hot, and half of it is a trick.',
    hint: 'Jump the steam: spikes hide in it. Cross under the long pour when it stops. Up on the counter, hop the glasses he slides at you, and jump off before the end gives way. Mind the boiling sprays. The shiny floor is fake, and your jump over it brings up spikes where a short jump lands: jump long. A scooter comes from behind: hop it, and the moment it’s by, hop the one coming the other way. The door jumps back over you: on the way back to it, hop the broken glasses that come up.',
    par: 18,
    map: (() => {
      const g = Grid.ground(15, 80);
      g.fill(10, 10, 14, 14, '^');
      // the long counter over a hot drain
      g.pit(24, 34).fill(24, 31, 13, 13, '#').fill(32, 34, 13, 13, 'a');
      // a shiny shop floor that isn't there (b), and where the hop over it lands, hidden spikes (S)
      g.fill(50, 51, 15, 17, 'b').fill(52, 53, 14, 14, 'S');
      // broken glasses (K) on the way back to where the door lands
      g.put(72, 14, 'K');
      return g.put(2, 14, '@').put(77, 14, 'E').rows();
    })(),
    build(w: World) {
      for (const tx of [47]) checkpoint(w, tx);
      exitTwist(w, door(w), 'swap', { to: 69 });
      water(w, 16.5, { rate: 0, minTy: 16.5, colors: ['#8C6A44', '#4E3620'], cause: 'burnt', behind: true });
      prop(w, 'teastall', 4, 15, { label: 'CHAAYA' });
      w.after(0.6, () => w.say('Chaaya ready! | Tea’s ready!', px(4) + 8, px(12), 1.4, 'npc'));
      // 1. steam hides the spikes
      cloud(w, 8, 12, 4, 3);
      // 2. the tea master's long pour across the lane, in a rhythm
      prop(w, 'teastall', 12, 15, { label: 'METHA' });
      // he starts pouring the moment you're out of the steam (so whoever runs straight on meets it)
      const pour = { period: 1e9, on: 0, phase: 0 };
      arc(w, px(13) + 8, px(11), px(21), px(15) - 4, 26, pour, '#C98B4F', 'burnt');
      onPass(w, px(11.5), (w2) => {
        const t = w2.tick * DT + 0.15;
        pour.period = 2.2;
        pour.on = 0.95;
        pour.phase = (2.2 - (t % 2.2)) % 2.2;
      });
      thingOn(w, 'tumbler', 21, 15, { solid: false });
      // 3. glasses slide down the counter at you; its far end gives way
      const counterDrop = dropFloor(w, 'a', { at: px(31.2) });
      counterDrop.paint = { fill: '#8A5A3B', trim: '#B88458', line: 'rgba(40,20,10,0.4)' };
      const slide = () => {
        if (w.state !== 'play') return;
        // (he stops sliding them once you're well along: the end of the counter is its own trap)
        if (w.player.x > px(20) && w.player.x < px(25.5)) roller(w, 'tumbler', px(31) - 12, px(13) - 12, -100, { cause: 'burnt', breakOnWall: false });
        w.after(1.3, slide);
      };
      w.after(0.5, slide);
      w.when(
        (w2) => w2.player.x >= px(22),
        (w2) => w2.say('Chaaya, saare! | Tea, sir!', px(30), px(9), 1.4, 'npc'),
      );
      // 4. boiling sprays from the drain covers
      [39, 42, 45].forEach((tx, i) => {
        const g2 = geyser(w, px(tx) + 8, px(15), 64, 2.4, [[i * 0.35, 0.7]], 'burnt');
        g2.fire = false;
      });
      // 5. the shiny floor is a painted board over the drain
      const fake = fakeFloor(w, 'b');
      fake.paint = { fill: '#C9B38C', trim: '#EFE2C4', line: 'rgba(80,60,30,0.25)' };
      // the hop over it brings up spikes where a hop lands: jump long
      popOnJump(w, 'S', px(46), px(51.5));
      // 6. a scooter comes up behind you... and the moment it's by, another comes the other way
      let first: Rider | null = null;
      w.when(
        (w2) => w2.player.x >= px(54),
        (w2) => {
          w2.sfx('honk', w2.player.x - 120, px(15));
          w2.say('Maaru, maaru! | Move, move!', w2.player.x - 60, px(11), 1.2, 'npc');
          first = rider(w2, 'scooter', w2.player.x - 170, 15, 240, 4, 'hit');
          first.facesRight = true;
        },
      );
      w.when(
        (w2) => !!first && first.x > w2.player.x + w2.player.w + 16 && w2.player.onGround,
        (w2) => {
          w2.sfx('honk', w2.player.x + 170, px(15));
          rider(w2, 'scooter', w2.player.x + 230, 15, -200, 4, 'hit').facesRight = true;
        },
      );
      // 7. the door hops back over you, and the lane back to it is strewn with broken tea glasses
      const shards = spikes(w, 'K');
      shards.look = 'glass';
      w.when(
        (w2) => w2.flags.twist === 'swapped' && w2.player.cx <= px(74.6),
        (w2) => shards.pop(w2),
      );
      prop(w, 'palm', 16, 15, { h: 84, lean: -5 });
      prop(w, 'umbrellas', 37, 15, { n: 1 });
      prop(w, 'palm', 55, 15, { h: 88, lean: 6 });
      prop(w, 'umbrellas', 66, 15, { n: 2 });
      rival(w, 74, 15, -1, tara(2, -1));
      collectible(w, 'chaaya', 28, 9.2);
    },
  },
  {
    id: 'TVM-04',
    city: 'TVM',
    index: 4,
    name: 'Thenga Trajectory',
    nameEn: 'Coconut trajectory',
    tagline: 'Gravity in Kerala always finds Dad’s head.',
    hint: 'Coconuts fall where you’re going: wait, then hop the roll. The one over the gap falls when you jump, so bait it with a little hop. A palm crashes across the river as a bridge, then sinks: don’t stop on it. In the last grove they fall in a wave: follow behind it. The far bank of the last gap backs away from your first jump: bait it too, wait for it to come back, then jump.',
    par: 18,
    map: Grid.ground(15, 96).pit(15, 16).pit(36, 45).pit(78, 79).fill(80, 83, 15, 17, 'k').put(2, 14, '@').put(92, 14, 'E').rows(),
    build(w: World) {
      for (const tx of [33, 71]) checkpoint(w, tx);
      exitTwist(w, door(w), 'fake');
      // the far bank of the last gap backs off from the first jump at it, then creeps back: bait it
      shyLedge(w, 'k', { dx: px(3), from: px(72), back: 1.1 });
      water(w, 15.6, { rate: 0, minTy: 15.6, colors: ['#4F8C83', '#295B57'], cause: 'splash', behind: true });
      // the first grove (as before)
      prop(w, 'palm', 9, 15, { h: 80, lean: 4 });
      prop(w, 'palm', 17, 15, { h: 86, lean: -10 });
      prop(w, 'palm', 26, 15, { h: 80, lean: 6 });
      const a = coconut(w, px(9) + 7, 162);
      // (measured: a dad who jumps the gap from its edge meets this one head first)
      const b = coconut(w, px(16) - 4, 156);
      const c1 = coconut(w, px(26) + 9, 162);
      const c2 = coconut(w, px(26) + 15, 160);
      w.when((w2) => w2.player.x >= px(6), () => drop(w, a, { shake: 0.15, rollVx: -90 }));
      w.when(
        (w2) => w2.input.jumpPressed && w2.player.x >= px(12) && w2.player.x < px(16),
        () => drop(w, b, { shake: 0.02, v0: 220, land: false }),
      );
      w.when(
        (w2) => w2.player.x >= px(22),
        () => {
          drop(w, c1, { shake: 0.15, rollVx: -80 });
          w.after(0.9, () => drop(w, c2, { shake: 0.1, rollVx: -80 }));
        },
      );
      // the river: a palm crashes across it... and then sinks
      prop(w, 'palm', 34, 15, { h: 70, lean: 2 });
      const trunk = thing(w, 'log', 36, 0, { dy: 40, w: 160, h: 10, oneWay: true });
      trunk.hide();
      let sinking = false,
        ty = 228;
      w.when(
        (w2) => w2.player.x >= px(32.5),
        (w2) => {
          trunk.show();
          w2.sfx('creak', px(36), px(10));
          trunk.moveTo(w2, px(36), 228, 0.35, 'in', () => {
            w2.sfx('splash', px(41), 236);
            w2.emit('shake', px(41), 236, { amount: 4 });
            w2.say('Thenga maram! | A coconut tree!', px(41), px(11), 1.4, 'npc');
          });
        },
      );
      w.when(
        (w2) => w2.standing(trunk.solid) && w2.player.x >= px(39.5),
        () => (sinking = true),
      );
      w.onTick((w2) => {
        if (!sinking || ty > 300) return;
        ty += 15 * DT;
        trunk.place(w2, trunk.solid.x, ty);
      });
      // a coconut on the far bank waits for you
      prop(w, 'palm', 48, 15, { h: 78, lean: -8 });
      const far = coconut(w, px(47) + 6, 160);
      w.when((w2) => w2.player.x >= px(43.5), () => drop(w, far, { shake: 0.05, v0: 150, rollVx: -70 }));
      // the shaken grove: coconuts drop palm after palm, left to right
      const grove = [58, 62, 66, 70, 74];
      grove.forEach((tx, i) => prop(w, 'palm', tx, 15, { h: 82 + (i % 2) * 8, lean: i % 2 ? -6 : 5 }));
      const nuts = grove.map((tx) => coconut(w, px(tx) + 7, 160));
      w.when(
        (w2) => w2.player.x >= px(55),
        (w2) => {
          w2.say('Kaattu! | Wind!', px(60), px(8), 1.2, 'npc');
          w2.emit('shake', px(64), px(10), { amount: 2 });
          nuts.forEach((n, i) => w2.after(0.25 + i * 0.42, () => drop(w2, n, { shake: 0.05, v0: 90, land: false })));
        },
      );
      prop(w, 'palm', 88, 15, { h: 76, lean: 4 });
      rival(w, 4, 15, 1, tara(3, 1));
      collectible(w, 'chaaya', 41, 10.6);
    },
  },
  {
    id: 'TVM-05',
    city: 'TVM',
    index: 5,
    name: 'Fort Gate Forward',
    tagline: 'Two gates, a moat, a headwind and one very light sleeper.',
    hint: 'Let each gate drop and rise before you go under, and never while the wind holds you back. Over the moat, every stone crumbles: keep hopping. Jump the spikes that pop up, then walk past the dog. Do not jump near it.',
    par: 22,
    map: (() => {
      const g = Grid.ground(15, 90).fill(19, 22, 6, 9, '#').fill(52, 55, 6, 9, '#');
      // the moat with crumbling stepping stones (a, b, c)
      g.pit(40, 50).put(42, 14, 'a').put(45, 13, 'b').put(48, 14, 'c');
      g.fill(42, 42, 15, 15, 'a').fill(48, 48, 15, 15, 'c');
      g.fill(76, 76, 14, 14, 'A');
      return g.put(3, 14, '@').put(86, 14, 'E').rows();
    })(),
    build(w: World) {
      for (const tx of [34, 61]) checkpoint(w, tx);
      const d = door(w);
      water(w, 15.8, { rate: 0, minTy: 15.8, colors: ['#5B7F6E', '#2F4E43'], cause: 'splash', behind: true });
      prop(w, 'umbrellas', 8, 15, { n: 2 });
      prop(w, 'palm', 13, 15, { h: 72, lean: -4 });
      sign(w, 14.5, 10.6, 3.4, 'EAST FORT', 'wood', 'right', '');
      // headwind across the gate approaches and the moat, in gusts
      gust(w, 13, 7, 11, 8, -230, { period: 2.6, on: 0.9, phase: 1.7 });
      gust(w, 39, 7, 13, 8, -200, { period: 3.0, on: 0.8, phase: 0.6 });
      // a portcullis: drops when you come close, then keeps its own rhythm
      const portcullis = (tx: number, armAt: number, down: number, upWait: number) => {
        const gate = thing(w, 'gate', tx, 10, { dx: 8, h: 48 });
        gate.setDeadly('crushed');
        const up = gate.y;
        const low = px(15) - 48;
        const cycle = () => {
          gate.moveTo(w, gate.x, low, 0.22, 'in', () => {
            w.emit('shake', gate.cx, low + 48, { amount: 4 });
            w.sfx('thud', gate.cx, low + 48);
            w.after(down, () => gate.moveTo(w, gate.x, up, 0.5, 'inOut', () => w.after(upWait, cycle)));
          });
        };
        w.when(
          (w2) => w2.player.x >= px(armAt),
          () => {
            gate.shake(w, 0.18, cycle);
            w.sfx('creak', gate.cx, gate.y);
          },
        );
        return gate;
      };
      portcullis(20, 17, 0.9, 1.3);
      portcullis(53, 50.5, 0.6, 1.0);
      // stepping stones in the moat crumble under you
      crumble(w, 'a', 0.3);
      crumble(w, 'b', 0.3);
      crumble(w, 'c', 0.3);
      sign(w, 56.5, 10.6, 3.4, 'FORT', 'wood', 'right', '');
      // spikes jump out of the path before the dog
      popAt(w, 'A', px(75) + 2);
      // a sleeping dog in front of the exit: jumping near it wakes it, and the door runs away
      const dog = thingOn(w, 'dog', 81, 15, { solid: false, layer: 2 });
      dog.spin = true;
      let woke = false;
      w.when(
        (w2) => !woke && w2.input.jumpPressed && Math.abs(w2.player.cx - dog.cx) < 30,
        () => {
          woke = true;
          dog.look = 'awake';
          w.say('Bow! Bow!', dog.cx, dog.y - 6, 1.2, 'npc');
          w.sfx('bonk', dog.cx, dog.y);
          d.moveTo(w, px(66), d.y, 0.7, 'inOut');
        },
      );
      prop(w, 'palm', 62, 15, { h: 80, lean: 5 });
      prop(w, 'umbrellas', 70, 15, { n: 1 });
      rival(w, 21, 6, -1, tara(4, -1));
      collectible(w, 'chaaya', 45.5, 10.2);
    },
  },
  // ------------------------------------------------------------------ around Kerala
  {
    id: 'TVM-06',
    city: 'TVM',
    index: 6,
    name: 'Cheena Vala',
    nameEn: 'Chinese fishing nets',
    tagline: 'Fort Kochi’s giant fishing nets go up and down all day. You are today’s catch.',
    hint: 'A crow skims the promenade: hop it. Each net dips into the sea and comes back up, one after another like a wave: hop along while they’re up. The last net dips the moment you land on it, so jump straight off, and long: as your weight leaves it, it springs up and its stones slam down on the bank’s edge. Spikes on the jetty.',
    par: 14,
    scene: { kind: 'water', place: 'Fort Kochi', with: ['nets', 'palms'] },
    map: Grid.ground(13, 64).pit(6, 25, 13).pit(35, 46, 13).fill(50, 50, 12, 12, 'A').put(2, 12, '@').put(60, 12, 'E').rows(),
    build(w: World) {
      for (const tx of [31]) checkpoint(w, tx);
      exitTwist(w, door(w), 'shy');
      water(w, 14.6, { rate: 0, minTy: 14.6, colors: ['rgba(70,150,180,0.85)', 'rgba(20,70,100,0.95)'], cause: 'splash' });
      const UP = 196,
        DOWN = 240,
        P = 3.2;
      const cycle = (m: number) => (m < 1.2 ? UP : m < 1.6 ? UP + ((m - 1.2) / 0.4) * (DOWN - UP) : m < 2.6 ? DOWN : DOWN - ((m - 2.6) / 0.6) * (DOWN - UP));
      // the last net's stones hang over the bank's edge: net up, stones down
      const stones = w.add(new Counterweight({ tx: 26, tw: 2, floorTy: 13, lift: 54 }));
      [7, 11, 15, 19, 23].forEach((tx, i) => {
        const net = thing(w, 'net', tx, 0, { oneWay: true, dy: UP });
        let caught = -1;
        let sprung = -1;
        w.onTick((w2) => {
          const t = w2.tick * DT - i * 0.55;
          const m = ((t % P) + P) % P;
          let y = cycle(m);
          // the last net: whoever lands on it is the catch of the day
          if (i === 4) {
            if (caught < 0 && w2.standing(net.solid)) {
              caught = w2.tick;
              w2.say('Meen kitti! | Got a fish!', net.cx, UP - 30, 1.0, 'npc');
            }
            // step off the dipped net and it springs back up: its stones slam down on the bank
            if (caught >= 0 && sprung < 0 && !w2.standing(net.solid) && w2.player.x > net.solid.x + 4) sprung = w2.tick;
            if (sprung >= 0) {
              const k = Math.min(1, (w2.tick - sprung) * DT / 0.12);
              y = DOWN - k * (DOWN - UP);
              if ((w2.tick - sprung) * DT > 2.2) {
                sprung = -1;
                caught = -1;
              }
            } else if (caught >= 0) {
              const k = Math.min(1, (w2.tick - caught) * DT / 0.35);
              y = Math.max(y, UP + k * (DOWN - UP));
              if ((w2.tick - caught) * DT > 2.5) caught = -1;
            }
            stones.set(y < UP + 8, w2);
          }
          w2.flags[`net${i}`] = m < 1.2 && caught < 0 ? 1.2 - m : 0;
          net.place(w2, net.solid.x, y);
        });
      });
      // a crow from Fort Kochi beach skims the promenade at head height
      let crow = false;
      w.onTick((w2) => {
        if (crow || w2.player.x < px(2.6)) return;
        crow = true;
        shot(w2, 'crow', px(33), 197, -170, 0, 0, 'hit');
        w2.sfx('caw', px(30), 190);
      });
      // the harbour: fishing boats bob in the swell; the middle one rolls over when you land
      const boats = [36, 40, 44].map((tx, i) => {
        const b = thing(w, 'odam', tx, 0, { oneWay: true, dy: 214, w: 40, h: 14 });
        let tipped = -1;
        w.onTick((w2) => {
          const t = w2.tick * DT;
          let y = 214 + Math.sin(t * 2.2 + i * 1.7) * 4;
          if (i === 1) {
            if (tipped < 0 && w2.standing(b.solid)) {
              tipped = w2.tick;
              w2.say('Thoni marinju! | The boat flipped!', b.cx, 180, 1.2, 'npc');
            }
            if (tipped >= 0) {
              const k = (w2.tick - tipped) * DT;
              if (k > 0.22) y += Math.min(40, (k - 0.22) * 160);
              if (k > 2.6) tipped = -1;
            }
          }
          b.place(w2, b.solid.x, y);
        });
        return b;
      });
      void boats;
      // spikes in the jetty boards, and a second crow
      popAt(w, 'A', px(49) + 4);
      w.when(
        (w2) => w2.player.x >= px(52),
        (w2) => {
          shot(w2, 'crow', w2.player.x + 200, 197, -150, 0, 0, 'hit');
          w2.sfx('caw', w2.player.x + 160, 190);
        },
      );
      prop(w, 'netpole', 56, 13);
      rival(w, 58, 13, -1, { intro: 'Kochi vala kando? Keri po! | Seen the Kochi nets? Climb on!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'chaaya', 13.5, 9.6);
    },
  },
  {
    id: 'TVM-07',
    city: 'TVM',
    index: 7,
    name: 'Munnar Hairpins',
    nameEn: 'Munnar hill road',
    tagline: 'Hairpin bends, tea terraces, mist, and jeeps that never slow down.',
    hint: 'Hop the jeep, then stop: it backs up for another go. Hop straight up the terraces, the middle one gives way. Let the landslide boulder come to you and hop it. Wait for the mist on the ridge to lift: two spike pits hide in it. Under the rock cutting, hop the first rock the moment it lands, then let the second one fall. Don’t step down to the factory: leap. The factory has a shutter.',
    par: 20,
    scene: { kind: 'hills', place: 'Munnar' },
    map: Grid.ground(15, 96)
      .put(7, 14, '^')
      // the tea terraces
      .fill(36, 41, 13, 14, '#')
      .fill(42, 45, 11, 17, 'a')
      .fill(46, 53, 9, 14, '#')
      // the ridge road, with two spike pits where the mist sits
      .fill(54, 81, 7, 14, '#')
      .fill(58, 59, 7, 7, '.')
      .fill(58, 59, 8, 8, '^')
      .fill(62, 63, 7, 7, '.')
      .fill(62, 63, 8, 8, '^')
      // the last hairpin down to the tea factory
      .fill(82, 85, 9, 17, 'e')
      .fill(86, 95, 11, 14, '#')
      .put(2, 14, '@')
      .put(92, 10, 'E')
      .rows(),
    build(w: World) {
      for (const tx of [36, 55, 77]) checkpoint(w, tx);
      exitTwist(w, door(w), 'crush');
      // the lower road: a jeep comes down the hill... and then backs up for another go
      let jeep: Rider | null = null;
      let phase = 0,
        since = 0;
      w.onTick((w2) => {
        const p = w2.player;
        if (phase === 0 && p.x >= px(9)) {
          phase = 1;
          jeep = rider(w2, 'jeep', p.x + 330, 15, -150, 4);
          w2.sfx('honk', p.x + 220, px(14));
        } else if (phase === 1 && jeep && jeep.x + jeep.w < p.x - 20) {
          phase = 2;
          since = w2.tick;
        } else if (phase === 2 && jeep && (w2.tick - since) * DT >= 0.3) {
          phase = 3;
          jeep.vx = 260;
          w2.flags.reverse = 1;
          for (let i = 0; i < 3; i++) w2.after(i * 0.18, () => w2.sfx('beep', jeep!.cx, px(14)));
          w2.say('Reverse gear! | Backing up!', jeep.cx, px(12), 1.1, 'npc');
        } else if (phase === 3 && jeep && jeep.x + jeep.w >= px(36) - 1) {
          // it parks against the terrace wall, sheepishly
          phase = 4;
          jeep.vx = 0;
          jeep.hazard.active = false;
          w2.flags.reverse = 0;
          w2.sfx('thud', jeep.x + jeep.w, px(14));
          w2.emit('shake', jeep.x + jeep.w, px(15), { amount: 2 });
          w2.say('Sorry, sorry! | Sorry!', jeep.cx, px(12.4), 1.0, 'npc');
        }
      });
      // the middle terrace gives way under you
      crumble(w, 'a', 0.42);
      // a landslide: a boulder tumbles off the hill, bounces on to your terrace and rolls at you
      let slid = false;
      w.onTick((w2) => {
        const p = w2.player;
        if (slid || !p.onGround || p.x < px(46) || p.y + p.h > px(9) + 1) return;
        slid = true;
        w2.flags.slid = 1;
        w2.sfx('rumble', px(56), px(6));
        w2.emit('shake', px(56), px(7), { amount: 2 });
        w2.say('Urulpottal! | Landslide!', px(52), px(4), 1.2, 'npc');
        roller(w2, 'boulder', px(55.5), px(1.5), -150, { bounce: 0.25, cause: 'hit' });
      });
      // the mist rolls over the ridge and hides two spike pits
      cloud(w, 55.5, 3.5, 10, 6.5, { period: 3.4, on: 2.2, phase: 0 }, '232,240,238');
      // rocks tumble off the hillside above: one lands in front of you, the next waits for you to run on
      const rock = (x: number, at: number, delay: number) => {
        onPass(w, at, (w2) => {
          w2.sfx('crack', x + 16, 8);
          // a trickle of pebbles first
          for (const [dx, dy] of [[-9, 0], [34, 3], [-17, 7]]) w2.add(new Thing('pebble', x + dx, dy, { solid: false, layer: 3 })).fall(w2, { v0: 40 + dy * 8, g: 1400 });
          w2.after(delay, () => {
            const r = w2.add(new Thing('boulder', x, 0, { layer: 3 }));
            r.setDeadly('crushed');
            r.fall(w2, { v0: 160, g: 2600, then: () => r.setDeadly(false) });
          });
        });
      };
      rock(px(70), px(70) - 56, 0);
      rock(px(75), px(72) - 2, 0.18);
      // the step down to the factory looks solid. It isn't, if you land on it.
      noLanding(w, 'e');
      prop(w, 'teastall', 4, 15, { label: 'CHAAYA' });
      prop(w, 'tree', 25, 15, { h: 70 });
      sign(w, 28.4, 10.8, 3.6, 'MUNNAR', 'green', 'right', '2 km');
      prop(w, 'teabush', 38.5, 13, { w: 4 });
      prop(w, 'teabush', 49.5, 9, { w: 6 });
      prop(w, 'teabush', 56, 7, { w: 2 });
      sign(w, 78.6, 4.4, 3.2, 'HAIRPIN', 'warn', null, 'bend');
      sign(w, 86.3, 7.6, 4.2, 'TEA FACTORY', 'wood', null, 'est. 1890');
      prop(w, 'teabush', 66, 7, { w: 3 });
      prop(w, 'tree', 64, 7, { h: 70 }, -8);
      rival(w, 90, 11, -1, { intro: 'Munnar thottam! Mukalil kayari vaa! | Munnar tea gardens! Climb up to the top!', point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[1] });
      collectible(w, 'chaaya', 60.5, 2.2);
    },
  },
  {
    id: 'TVM-08',
    city: 'TVM',
    index: 8,
    name: 'Vallam Kali',
    nameEn: 'Snake-boat race',
    tagline: 'The snake boat race at Alappuzha. A hundred oarsmen, and they don’t stop for bridges.',
    hint: 'Ride the snake boat. It slips under the footbridges and you don’t: hop up, cross, drop back on. The second bridge is taller: hold jump. The third is high enough to sit under: stay seated, spikes come out of its deck if you hop at it. Do hop the one after it. Hop the crows. Spikes pop up twice on the finish jetty.',
    par: 20,
    scene: { kind: 'water', place: 'Alappuzha', with: ['houseboats', 'palms'] },
    map: Grid.ground(13, 96)
      .pit(5, 86, 13)
      // footbridges: low, tall, spiky underneath, and low again
      .fill(22, 23, 11, 12, 'b')
      .fill(36, 37, 10, 12, 'c')
      .fill(54, 55, 10, 10, 'd')
      .fill(54, 55, 9, 9, 'D')
      .fill(64, 65, 11, 12, 'f')
      .put(89, 12, 'A')
      .put(2, 12, '@')
      .put(94, 12, 'E')
      .rows(),
    build(w: World) {
      for (const tx of [41, 59]) checkpoint(w, tx);
      exitTwist(w, door(w), 'none');
      water(w, 13.85, { rate: 0, minTy: 13.85, colors: ['rgba(70,140,120,0.85)', 'rgba(25,70,60,0.95)'], cause: 'splash' });
      // whitewashed footbridges with red-oxide edges
      for (const [l, tx, ty, h] of [['b', 23, 11, 2], ['c', 37, 10, 3], ['d', 55, 10, 1], ['f', 65, 11, 2]] as const) {
        group(w, l).paint = { fill: '#DCD5C4', trim: '#A3342B', line: 'rgba(70,60,45,0.22)' };
        prop(w, 'footbridge', tx, ty, { w: 2, h: h + (l === 'd' ? 1 : 0) }, -8);
      }
      const boat = thing(w, 'snakeboat', 5, 0, { dy: 212 });
      const END = px(87) - 128;
      // the crew rows at a steady pace (a steady deck is a fair deck); the chant keeps the beat
      let go = false,
        sprint = false,
        bx = boat.x,
        beat = 0;
      w.onTick((w2) => {
        if (!go || bx >= END) {
          boat.solid.velX = 0;
          return;
        }
        const v = sprint ? 112 : 86;
        bx = Math.min(END, bx + v * DT);
        boat.solid.velX = bx >= END ? 0 : v;
        boat.place(w2, bx, boat.y);
        if (++beat % 50 === 0) w2.sfx('pour', boat.cx, 220);
        if (bx >= END) w2.say('Jayichu! | We won!', boat.cx, 176, 1.2, 'npc');
      });
      w.when(
        (w2) => !go && w2.standing(boat.solid),
        () => {
          w.say('Thithithara thithithai! | Row, row, row!', boat.cx, 180, 1.4, 'npc');
          w.after(0.3, () => (go = true));
        },
      );
      w.flags.boatEnd = END;
      // the high bridge you can sit under: hop up on to it like the first two and spikes come out of its deck
      popOnJump(w, 'D', px(51), px(58));
      // crows skim the water at head height
      const crow = (at: number, ahead: number) =>
        onPass(w, at, (w2) => {
          shot(w2, 'crow', w2.player.x + ahead, 200, -150, 0, 0, 'hit');
          w2.sfx('caw', w2.player.x + ahead - 40, 196);
        });
      crow(px(8), 230);
      crow(px(44), 240);
      crow(px(71), 240);
      crow(px(76), 250);
      // the home stretch: everyone rows faster
      onPass(w, px(79), (w2) => {
        sprint = true;
        w2.say('Vegam! Vegam! | Faster! Faster!', boat.cx, 176, 1.2, 'npc');
      });
      // spikes in the finish jetty
      popAt(w, 'A', px(88) + 2);
      sign(w, 87.4, 8.6, 3.4, 'FINISH', 'warn', null, 'vallam kali');
      prop(w, 'palm', 1, 13, { h: 80, lean: 6 });
      prop(w, 'palm', 92, 13, { h: 86, lean: -5 }, -8);
      rival(w, 91, 13, -1, { intro: 'Vallam kali! Vegam keri iriku! | Boat race! Quick, hop on and sit!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'chaaya', 22.5, 8.6);
    },
  },
];
