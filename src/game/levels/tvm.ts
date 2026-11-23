import type { LevelDef, World } from '../world';
import { LINES } from '../cities';
import { Rider, Roller, Thing } from '../entities/traps';
import { arc, checkpoint, cloud, collapseOnStand, collectible, door, geyser, group, gust, panel, prop, px, rider, rival, roller, shot, sign, spikes, spring, thing, thingOn, water } from './kit';
import { DT } from '../constants';
import { tour } from './tour';
import { Grid } from './grid';
import { exitTwist } from './twists';
import { tara as taraSays } from './endkit';
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
    hint: 'The soaked road after Tara holds you if you walk: hop on it and it breaks. Any hop near the compound wall puts broken glass on it: jump clean over it, then hop again at once, the road past it is full of glass too. The ditch is only a puddle: walk in and climb out (jump it from the road and spikes meet you on the far side). The rocket at Thumba goes up as you come over the top of the steps, and the road burns: stop up there. It has two stages: the first comes down on the last step, the second at the foot of the steps. Hop them once they’re down. The canoe’s landing gives way: hop off it. At the puttu stall, stop short of the blue tarp and let it empty, then jump the puddle after it: that one is a pothole. At the very end the road opens in front of you: don’t jump it (the far side breaks), wait, it closes again.',
    // the monsoon has eaten the road after Tara; the compound wall wears broken glass (Kerala's
    // walls do) and the road below it is strewn with more; the ditch is just a puddle to wade, but
    // jump it and its far side bristles; Thumba's rocket goes up as you come down the steps; the
    // canoe's landing gives way; the puttu stall's tarp is full of rain, and the puddle past it is
    // a pothole; and the road at the very end opens up
    paint: (g) =>
      g
        .fill(8, 10, 15, 17, 'a')
        .put(12, 13, 'G')
        .put(17, 14, 'K')
        .fill(26, 30, 14, 14, 'J')
        .fill(78, 79, 15, 17, 'c')
        .fill(89, 90, 15, 16, '.')
        .fill(104, 106, 15, 17, 'g')
        .fill(107, 110, 15, 17, 'h'),
    extra: (w) => {
      // the monsoon has soaked the road after Tara: it holds a dad who walks over it, not one who hops at it
      // (last time it caved in and you hopped; this time the hop is what breaks it)
      const soaked = group(w, 'a');
      soaked.paint = { fill: '#5B3020', trim: '#6A8A46', line: 'rgba(24,58,70,0.45)' };
      w.when(
        (w2) => w2.player.jumpTick === w2.tick && w2.player.cx >= px(4.5) && w2.player.cx < px(10.6) && w2.player.y + w2.player.h <= px(15) + 1,
        (w2) => {
          w2.sfx('crack', px(9.5), px(15));
          soaked.fall(w2, { delay: 0.1, g: 2400 });
        },
      );
      popOnJump(w, 'G', px(6), px(12.5)).look = 'glass';
      // the wall's glass doesn't stay on the wall: the road under it is strewn with it
      popAt(w, 'K', px(16) + 4).look = 'glass';
      // Tara, helpful as ever: at the ditch she says jump, at the puttu stall she says hurry
      onPass(w, px(19.5), (w2) => taraSays(w2, 'Kuzhi! Chaadu, Dad! | A ditch! Jump, Dad!', 1.8));
      onPass(w, px(82.2), (w2) => taraSays(w2, 'Puttu thanuthu pokum! Vegam! | The puttu’s going cold! Hurry!', 1.8));
      // wade the ditch; jump it from the road and its far side bristles where you come down
      const far = spikes(w, 'J');
      w.when(
        (w2) => w2.player.jumpTick === w2.tick && w2.player.cx >= px(20) && w2.player.cx < px(26) && w2.player.y + w2.player.h <= px(15) + 1,
        (w2) => far.pop(w2),
      );
      dropFloor(w, 'c', { at: px(77.4) });
      // Thumba's rockets have two stages: the first comes down on the last step (where you waited last
      // time), the second at the foot of the steps. It goes up as you come over the top: stay up there
      const rocket = Launch.place(w, { tx: 61, groundTy: 15, blast: [58, 65], blastSec: 2.0, stageTx: 52, sepAt: 1.5, boosters: [{ tx: 48.6, groundTy: 14, sepAt: 0.85 }] });
      onPass(w, px(44.5), (w2) => rocket.fire(w2));
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
    hint: 'Hop the crows that fly at you, but not the big brown kite: it glides over your head if you stand, and a hop meets it. Never jump under a flyover. A chunk of the first flyover falls on the middle of the roof, and one of the second on the front: look for the cracks. One bell: he brakes and you slide forward. Two bells: he jerks off and you slide back. So ride the back under the first flyover, the middle through the bells, and stay off the front under the second. At the end it turns back: jump off before it does.',
    par: 23,
    map: (() => {
      const g = new Grid(96).fill(0, 3, 13, 17, '#').fill(88, 95, 12, 17, '#');
      // two low flyovers over the road; spikes hide under their decks (A, B)
      g.fill(29, 35, 9, 10, 'c').fill(29, 35, 11, 11, 'A');
      g.fill(60, 66, 9, 10, 'd').fill(60, 66, 11, 11, 'B');
      return g.put(1, 12, '@').put(93, 11, 'E').rows();
    })(),
    build(w: World) {
      for (const tx of [48]) checkpoint(w, tx);
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
      // under the first flyover a tired chunk of it cracks off on to the middle of the roof (last time it
      // was the back, and the middle was where you rode): ride the back under this one
      w.when(
        () => x >= px(30) - 30 && (phase === 'go' || phase === 'go2'),
        (w2) => {
          w2.sfx('crack', x + 64, px(11));
          w2.add(new Slab(x + 53, px(11) + 2));
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
          taraSays(w2, 'Parunthu! Chaadu! | A kite! Jump!', 1.4);
        },
      );
      // under the second flyover a chunk drops on the front of the roof, where you ran last time
      w.when(
        () => x >= px(60) - 30 && phase === 'go2',
        (w2) => {
          w2.sfx('crack', x + 88, px(11));
          w2.add(new Slab(x + 80, px(11) + 2));
        },
      );
      // the tired bits of the decks: dark cracks where the chunks will come away
      panel(w, 31.1, 10.55, 1.5, 0.45, '#6A7076', 'rgba(20,22,24,0.55)');
      panel(w, 62.9, 10.55, 1.5, 0.45, '#6A7076', 'rgba(20,22,24,0.55)');
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
    hint: 'Jump the steam: spikes hide in it. He pulls the tea twice: cross under it after the second pull. Up on the counter, hop the glasses he slides at you, and jump off before the end gives way. Mind the boiling sprays. The shiny floor is fake (it’s nearer than it was), and your jump over it brings up spikes where a short jump lands: jump long. A scooter comes from behind: hop it, and the moment it’s by, hop the one coming the other way. The door jumps back over you: on the way back to it, hop the broken glasses that come up.',
    par: 18,
    map: (() => {
      const g = Grid.ground(15, 80);
      g.fill(10, 10, 14, 14, '^');
      // the long counter over a hot drain
      g.pit(24, 34).fill(24, 31, 13, 13, '#').fill(32, 34, 13, 13, 'a');
      // a shiny shop floor that isn't there (b), and where the hop over it lands, hidden spikes (S)
      // (two tiles nearer than last time: the dad who walks up to where he jumped from walks on to it)
      g.fill(48, 49, 15, 17, 'b').fill(50, 51, 14, 14, 'S');
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
      // he starts pouring the moment you're out of the steam (so whoever runs straight on meets it), and he
      // pulls it twice: the dad who goes the moment the pour stops meets the second pull
      const pour = { period: 1e9, on: 0, phase: 0 };
      const pull2 = { period: 1e9, on: 0, phase: 0 };
      arc(w, px(13) + 8, px(11), px(21), px(15) - 4, 26, pour, '#C98B4F', 'burnt');
      arc(w, px(13) + 8, px(11), px(21), px(15) - 4, 26, pull2, '#C98B4F', 'burnt');
      onPass(w, px(11.5), (w2) => {
        const t = w2.tick * DT + 0.15;
        for (const [s2, at] of [[pour, 0], [pull2, 1.3]] as const) {
          s2.period = 3.9;
          s2.on = 0.95;
          s2.phase = (3.9 - ((t + at) % 3.9) + 3.9 * 2) % 3.9;
        }
        w2.after(0.15 + 1.25, () => w2.say('Onnoode! | Once more!', px(13) + 8, px(10), 1.0, 'npc'));
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
      popOnJump(w, 'S', px(44), px(49.5));
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
          taraSays(w2, 'Poyi! Ini safe! | It’s gone! Safe now!', 1.4);
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
    hint: 'Coconuts fall where you’re going, and on whoever stops under a palm: stop between the palms, then hop the roll. The one over the gap falls when you jump, so bait it with a little hop. A palm crashes across the river as a bridge, then sinks: don’t stop on it. Past the river, don’t walk on the fallen fronds: there’s a coir pit under them, hop it. In the last grove they fall in a wave: let it go by. The last palm keeps one nut back for you: stop just before it and let it fall. The far bank of the last gap backs away from your first jump: bait it too, wait for it to come back, then jump.',
    par: 18,
    map: Grid.ground(15, 96).pit(15, 16).pit(36, 45).pit(78, 79).fill(80, 83, 15, 17, 'k').fill(51, 52, 15, 17, 'f').put(2, 14, '@').put(92, 14, 'E').rows(),
    build(w: World) {
      for (const tx of [46]) checkpoint(w, tx);
      exitTwist(w, door(w), 'fake');
      // the far bank of the last gap backs off from the first jump at it, then creeps back: bait it
      shyLedge(w, 'k', { dx: px(3), from: px(72), back: 1.1 });
      // fallen fronds on the bank: underneath them, a coir pit where the husks are soaked
      fakeFloor(w, 'f').paint = { fill: '#7E8B3C', trim: '#A4B45A', line: 'rgba(60,66,20,0.45)' };
      onPass(w, px(48.3), (w2) => taraSays(w2, 'Olayude mele nadannu po! | Walk across on the fronds!', 1.8));
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
      // never stand under a coconut palm: the one you stop under to wait for the roll drops on you
      // (last time you waited right here). Stop past it, between the palms
      prop(w, 'palm', 6, 15, { h: 74, lean: -3 });
      const overhead = coconut(w, px(6) + 2, 168);
      let still = 0;
      w.onTick((w2) => {
        const p = w2.player;
        const under = p.onGround && Math.abs(p.vx) < 8 && p.cx >= px(5.1) && p.cx < px(7.4);
        still = under ? still + 1 : 0;
        if (still === 12) drop(w2, overhead, { shake: 0.08, v0: 80, land: false });
      });
      onPass(w, px(4.2), (w2) => taraSays(w2, 'Thanalil nikku, Dad! | Stand in the shade, Dad!', 1.6));
      w.when(
        (w2) => w2.input.jumpPressed && w2.player.x >= px(12) && w2.player.x < px(16),
        () => drop(w, b, { shake: 0.02, v0: 220, land: false }),
      );
      w.when(
        (w2) => w2.player.x >= px(22),
        () => {
          drop(w, c1, { shake: 0.15, rollVx: -80 });
          w.after(1.4, () => drop(w, c2, { shake: 0.1, rollVx: -80 }));
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
      w.when((w2) => w2.player.x >= px(42.3), () => drop(w, far, { shake: 0.05, v0: 150, rollVx: -70 }));
      // the shaken grove: coconuts drop palm after palm, left to right
      const grove = [58, 62, 66, 70, 74];
      grove.forEach((tx, i) => prop(w, 'palm', tx, 15, { h: 82 + (i % 2) * 8, lean: i % 2 ? -6 : 5 }));
      const nuts = grove.map((tx) => coconut(w, px(tx) + 7, 160));
      // the last palm has two. The second stays up when the wave goes by and waits for the dad who follows it
      const straggler = coconut(w, px(74) + 1, 158);
      w.when(
        (w2) => w2.player.x >= px(55),
        (w2) => {
          w2.say('Kaattu! | Wind!', px(60), px(8), 1.2, 'npc');
          w2.emit('shake', px(64), px(10), { amount: 2 });
          nuts.forEach((n, i) => w2.after(0.25 + i * 0.42, () => drop(w2, n, { shake: 0.05, v0: 90, land: false })));
        },
      );
      w.when(
        (w2) => nuts[4].state !== 'rest' && w2.player.x >= px(70.5),
        (w2) => drop(w2, straggler, { shake: 0.18, v0: 90, land: false }),
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
    hint: 'Let the first gate drop and rise, never while the wind holds you back, then go under it and stop at once: a second gate hides in the gatehouse and drops as you pass the first. Let it go back up. Over the moat, every stone crumbles: keep hopping, and jump long off the last one, past the mud at the bank’s edge (it goes from under you). Then stop: the next gate drops right there. Jump the spikes that pop up, then walk past the dog. Do not jump near it, whatever Tara says. It growls in its sleep: keep walking, or you back on to the spikes.',
    par: 22,
    map: (() => {
      // the first gatehouse is deep: it hides a second portcullis behind the one you can see
      const g = Grid.ground(15, 90).fill(19, 26, 6, 9, '#').fill(54, 57, 6, 9, '#');
      // the moat with crumbling stepping stones (a, b, c)
      g.pit(40, 49).fill(41, 42, 14, 15, 'a').fill(44, 45, 13, 13, 'b').fill(47, 48, 14, 15, 'c');
      // the far bank's edge is moat mud: it goes the moment a dad lands on it (last time it held)
      g.fill(50, 52, 15, 17, 'm');
      g.fill(76, 76, 14, 14, 'A');
      return g.put(3, 14, '@').put(86, 14, 'E').rows();
    })(),
    build(w: World) {
      for (const tx of [38]) checkpoint(w, tx);
      const d = door(w);
      water(w, 15.8, { rate: 0, minTy: 15.8, colors: ['#5B7F6E', '#2F4E43'], cause: 'splash', behind: true });
      prop(w, 'umbrellas', 8, 15, { n: 2 });
      prop(w, 'palm', 13, 15, { h: 72, lean: -4 });
      sign(w, 14.5, 10.6, 3.4, 'EAST FORT', 'wood', 'right', '');
      // headwind across the gate approaches and the moat, in gusts
      gust(w, 13, 7, 6, 8, -230, { period: 3.0, on: 0.9, phase: 1.7 });
      gust(w, 39, 7, 11, 8, -200, { period: 3.6, on: 0.8, phase: 0.6 });
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
      portcullis(20, 17, 0.9, 1.8);
      portcullis(55, 52.5, 0.6, 1.0);
      // ...and the one hidden in the gatehouse behind the first: it drops once, as you pass under the first,
      // so the dad who waited for the first gate and ran on meets this one. Stop between them, let it go back up.
      const inner = thing(w, 'gate', 25, 7, { h: 48, layer: -4 });
      const innerUp = inner.y;
      w.when(
        (w2) => w2.player.cx >= px(20) + 16,
        (w2) => {
          w2.sfx('creak', inner.cx, px(9));
          inner.shake(w2, 0.33, () => {
            inner.setDeadly('crushed');
            inner.moveTo(w2, inner.x, px(15) - 48, 0.2, 'in', () => {
              w2.emit('shake', inner.cx, px(15), { amount: 4 });
              w2.sfx('thud', inner.cx, px(15));
              w2.flags.inner = 'down';
              w2.after(0.9, () =>
                inner.moveTo(w2, inner.x, innerUp, 0.5, 'inOut', () => {
                  inner.setDeadly(false);
                  w2.flags.inner = 'up';
                }),
              );
            });
          });
        },
      );
      // stepping stones in the moat crumble under you
      crumble(w, 'a', 0.4);
      crumble(w, 'b', 0.4);
      crumble(w, 'c', 0.4);
      const mud = noLanding(w, 'm');
      mud.paint = { fill: '#4E3B26', trim: '#5E6B34', line: 'rgba(20,14,8,0.45)' };
      sign(w, 58.5, 10.6, 3.4, 'FORT', 'wood', 'right', '');
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
      // Tara says jump the dog; the dog growls in its sleep when you land near it. It's only a growl: a dad who
      // steps back from it steps back on to the spikes he just jumped
      onPass(w, px(76.8), (w2) => taraSays(w2, 'Patti! Chaadi kadakku! | A dog! Jump over it!', 1.6));
      w.when(
        (w2) => w2.player.onGround && w2.player.cx >= px(77.6) && !woke,
        (w2) => {
          w2.say('Grrr...', dog.cx, dog.y - 6, 1.0, 'npc');
          w2.sfx('growl', dog.cx, dog.y);
          w2.emit('shake', dog.cx, dog.y, { amount: 1 });
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
    hint: 'Wait back from the edge of the promenade: the swell crashes over it while the first net is down. A crow skims the promenade: hop it. Each net dips into the sea and comes back up, one after another like a wave: hop along while they’re up. The last net dips the moment you land on it, so jump straight off, and long: as your weight leaves it, it springs up and its stones slam down on the bank’s edge. Spikes on the jetty.',
    par: 14,
    scene: { kind: 'water', place: 'Fort Kochi', with: ['nets', 'palms'] },
    map: Grid.ground(13, 70).pit(5, 23, 13).pit(35, 46, 13).fill(53, 53, 12, 12, 'A').put(2, 12, '@').put(64, 12, 'E').rows(),
    build(w: World) {
      for (const tx of [31]) checkpoint(w, tx);
      exitTwist(w, door(w), 'shy');
      water(w, 14.6, { rate: 0, minTy: 14.6, colors: ['rgba(70,150,180,0.85)', 'rgba(20,70,100,0.95)'], cause: 'splash' });
      const UP = 196,
        DOWN = 240,
        P = 3.2;
      const cycle = (m: number) => (m < 1.2 ? UP : m < 1.6 ? UP + ((m - 1.2) / 0.4) * (DOWN - UP) : m < 2.6 ? DOWN : DOWN - ((m - 2.6) / 0.6) * (DOWN - UP));
      // the last net's stones hang over the bank's edge: net up, stones down
      const stones = w.add(new Counterweight({ tx: 24, tw: 2, floorTy: 13, lift: 54 }));
      [7, 10.5, 14, 17.5, 21].forEach((tx, i) => {
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
              // and this time Tara tells the truth (a dad who's learnt she lies stays put)
              taraSays(w2, 'Ippo thanne chaadu! | Jump right now!', 1.2);
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
      // the swell crashes over the edge of the promenade while the first net is down (last time you waited
      // right there for it): wait back from the edge, and go when the net comes up
      geyser(w, px(4) + 8, px(13), 44, P, [[1.75, 0.65]], 'splash');
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
              if (k > 0.3) y += Math.min(40, (k - 0.3) * 140);
              if (k > 2.6) tipped = -1;
            }
          }
          b.place(w2, b.solid.x, y);
        });
        return b;
      });
      void boats;
      // spikes in the jetty boards, and a second crow
      // (they sink back after a moment: the door's dance later goes back over these boards)
      const jetty = popAt(w, 'A', px(52) + 4);
      w.when(() => jetty.popped, (w2) => w2.after(1.5, () => jetty.retract(w2)));
      w.when(
        (w2) => w2.player.x >= px(52),
        (w2) => {
          shot(w2, 'crow', w2.player.x + 200, 197, -150, 0, 0, 'hit');
          w2.sfx('caw', w2.player.x + 160, 190);
        },
      );
      prop(w, 'netpole', 59, 13);
      rival(w, 62, 13, -1, { intro: 'Kochi vala kando? Keri po! | Seen the Kochi nets? Climb on!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
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
    hint: 'A spike comes out of the road just ahead of the tea stall: hop early. Hop the jeep, then stop: it backs up for another go. Hop straight up the terraces, the middle one gives way. Let the landslide boulder come to you and hop it. Wait for the mist on the ridge to lift: three spike pits hide in it. Under the rock cutting, hop the first rock the moment it lands and keep going: the second comes down where you’d stop (watch the pebbles). Don’t step down to the factory: leap. The factory has a shutter.',
    par: 20,
    scene: { kind: 'hills', place: 'Munnar' },
    map: Grid.ground(15, 96)
      // the road's first spike hides until you're on top of it
      .put(8, 14, 'A')
      // the tea terraces
      .fill(36, 41, 13, 14, '#')
      .fill(42, 45, 11, 17, 'a')
      .fill(46, 53, 9, 14, '#')
      // the ridge road, with three spike pits where the mist sits (last time there were two)
      .fill(54, 81, 7, 14, '#')
      .fill(58, 59, 7, 7, '.')
      .fill(58, 59, 8, 8, '^')
      .fill(62, 63, 7, 7, '.')
      .fill(62, 63, 8, 8, '^')
      .fill(66, 67, 7, 7, '.')
      .fill(66, 67, 8, 8, '^')
      // the last hairpin down to the tea factory
      .fill(82, 85, 9, 17, 'e')
      .fill(86, 95, 11, 14, '#')
      .put(2, 14, '@')
      .put(92, 10, 'E')
      .rows(),
    build(w: World) {
      // two long runs: the terraces, the landslide, the mist and the rock cutting are one stretch
      for (const tx of [36, 77]) checkpoint(w, tx);
      exitTwist(w, door(w), 'crush');
      popAt(w, 'A', px(6.6) + 4);
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
      // the mist rolls over the ridge and hides three spike pits
      cloud(w, 55.5, 3.5, 13, 6.5, { period: 3.6, on: 1.9, phase: 0 }, '232,240,238');
      // rocks tumble off the hillside above: one lands in front of you, and the next comes down where you stop
      // to let it fall (last time it fell ahead of you): its pebbles trickle down first, right over you
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
      rock(px(71), px(70) - 40, 0);
      rock(px(73), px(72) - 2, 0.45);
      // the step down to the factory looks solid. It isn't, if you land on it. (Tara says take the steps.)
      noLanding(w, 'e');
      onPass(w, px(78.6), (w2) => taraSays(w2, 'Padi irangi vaa! | Come down the steps!', 1.6));
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
    hint: 'Ride the snake boat. It slips under the footbridges and you don’t: hop up, cross, drop back on. The second bridge is taller: hold jump. The third is high enough to sit under: stay seated, spikes come out of its deck if you hop at it. Do hop the one after it. Hop the crows. On the finish jetty the spikes come up and sink back: wait, then walk. Hop them and more come up where you land.',
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
      .fill(90, 91, 12, 12, 'B')
      .put(2, 12, '@')
      .put(94, 12, 'E')
      .rows(),
    build(w: World) {
      for (const tx of [50]) checkpoint(w, tx);
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
      // Tara: a lie at the third bridge, the truth at the fourth. Read the bridge, not Tara
      onPass(w, px(49.5), (w2) => taraSays(w2, 'Paalam! Mukalil kayaru! | A bridge! Get up on top!', 1.6));
      onPass(w, px(60), (w2) => taraSays(w2, 'Ee paalam chaadi kayaru! | Jump up on this bridge!', 1.6));
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
      // spikes in the finish jetty: they come up as you step off the boat and sink back after a moment (like
      // Fort Kochi's jetty); hop them (as you did last time) and more come up where you land (like the tea
      // shop's painted floor). Wait, and walk
      const finish = popAt(w, 'A', px(86.5));
      w.when(() => finish.popped, (w2) => w2.after(1.1, () => finish.retract(w2)));
      popOnJump(w, 'B', px(85), px(89.5));
      sign(w, 87.4, 8.6, 3.4, 'FINISH', 'warn', null, 'vallam kali');
      prop(w, 'palm', 1, 13, { h: 80, lean: 6 });
      prop(w, 'palm', 92, 13, { h: 86, lean: -5 }, -8);
      rival(w, 91, 13, -1, { intro: 'Vallam kali! Vegam keri iriku! | Boat race! Quick, hop on and sit!', point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'chaaya', 22.5, 8.6);
    },
  },
];
