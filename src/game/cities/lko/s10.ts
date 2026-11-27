// LKO-10 Lakhnavi Tehzeeb (Lucknow manners), the finale. Only Lucknow's own ideas, in a new order: the
// gentlemen at the doorway, the chikan wash, the malai's long shadows, the maze's arches, and the bells. The
// new twist: here the bells are sewn under chikan covers. A step doesn't ring them; standing still does,
// and in Lucknow standing still is how you bow.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { lock, tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { Art, FLOOR, gent, px, stillness, bowIcon, TAU } from './kit';
import { archway, gentleman, looseStone, pehleDoorway, tara } from './s02';
import { washLine } from './s03';
import { Heap, karahi, shadows, type Light } from './s04';
import { Dancer, makeGuru, makeTihai } from './s06';
import { Flock, Flyer, drawFlyer, roofOf, roofs, type Roof } from './s09';
import { arch, well, hooks, chausar, makeDarwaza } from './s08';
import { on } from './kit';
import { julus, nala, photoGroup, pace, strollers, type PhotoPlan } from './s07';

/** ghungroo sewn under a chikan cover, columns [c0, c1]: a step is silent, but stand still on it (a bow)
 *  for a moment and the bells ring, and the dancer spins to the sound */
export function covered(w: World, c0: number, c1: number, d: Dancer, need = 30) {
  const still = stillness(w);
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx, w2) => {
      ctx.fillStyle = '#F5F1E8';
      ctx.fillRect(x0, FLOOR - 2, x1 - x0, 5);
      ctx.fillStyle = '#C9C0AE';
      for (let x = x0 + 4; x < x1 - 2; x += 8) {
        ctx.beginPath();
        ctx.arc(x, FLOOR, 1.1, 0, TAU);
        ctx.fill();
      }
      // the bells just peep out at the edge of the cover
      ctx.fillStyle = '#E8C547';
      for (let x = x0 + 2; x < x1; x += 6) ctx.fillRect(x, FLOOR + 3, 2, 1.5);
      void w2;
    }, -1),
  );
  let rung = false;
  w.onTick((w2) => {
    const p = w2.player;
    const onIt = p.onGround && p.y + p.h >= FLOOR - 1 && p.x + p.w > x0 + 2 && p.x < x1 - 2;
    if (onIt && still() > need && !rung) {
      rung = true;
      d.call(w2, p.cx, 'lko-tehzeeb');
    }
    if (!onIt) rung = false;
  });
}

// ================================================================ the room
function tehzeebRoom(): LevelDef {
  return {
    id: 'LKO-10',
    city: 'LKO',
    index: 10,
    name: 'Lakhnavi Tehzeeb',
    nameEn: 'Lucknow manners',
    tagline: 'The last haveli. Two gentlemen at the door, a dancer inside, and the floor in front of the door is sewn with bells under chikan covers.',
    hint: 'The gentlemen still want you to bow, and they still push in whoever leans in first. But the white covers in front of the door have bells under them: a step is silent, a bow (standing still) rings them, and the dancer spins straight to you. Bow on the one plain board, then walk over the covers, take the second gentleman’s offer and hop the hole.',
    par: 18,
    map: Grid.ground(15).pit(19, 20).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const d = new Dancer(w, px(27) + 8);
      w.flags.dancer10 = d;
      archway(w, 16, 2, 6);
      const hole = looseStone(w, 19, 2);
      pehleDoorway(w, 16, hole, 'finale');
      covered(w, 8, 9, d);
      covered(w, 12, 15, d);
      w.add(
        new Art((ctx) => {
          // the one plain board, polished
          ctx.fillStyle = '#8D5A3B';
          ctx.fillRect(px(10), FLOOR - 2, px(2), 2);
          ctx.fillStyle = 'rgba(255,230,190,0.4)';
          ctx.fillRect(px(10) + 2, FLOOR - 2, px(2) - 4, 1);
        }, -1),
      );
      sign(w, 2.2, 10.4, 3.4, 'TEHZEEB', 'shop', null, 'aadaab');
      rival(w, 3, 15, 1, tara(8, 1));
      onPass(w, px(4), (w2) => w2.guide('Aadaab! | Respectful greetings!'));
      collectible(w, 'lko-chikan', 23.5, 10.6);
    },
  };
}

// ================================================================ act 1: the wash, and the malai in the morning sun
const dhulai: Act = {
  id: 'lko10-dhulai',
  w: 36,
  advice: 'The wash line again: on to the first white flower and wait out both whistles (the print goes first, then the jali), then flower to flower. Then the malai heaps in the low sun from the right: the left tile of each is in its own shadow.',
  cps: [18.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 16);
    g.pit(c.x + 22, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    const L = washLine(w, x + 3, 'sjpspjsppsjpss', c.f('wash'), { dhobiAt: x + 18 });
    let start = -1;
    w.onTick((w2) => {
      if (start < 0 && L.cloth.some((cl) => on(w2, cl.solid))) start = w2.tick;
      if (start < 0) return;
      const t = w2.tick - start;
      if (t === 40) w2.flags[c.f('wash') + ':blow'] = w2.tick;
      if (t === 66) L.dh.wash(w2, ['p'], 'lko-chhapa');
      if (t === 200) w2.flags[c.f('wash') + ':blow'] = w2.tick;
      if (t === 220) L.dh.wash(w2, ['j'], 'lko-jali');
    });
    karahi(w, x + 22, x + 31);
    const light = () => 'R' as Light;
    const heaps = [x + 23, x + 26, x + 29].map((cc, k) => new Heap(w, px(cc), k % 2 ? px(14) : px(13), light));
    shadows(w, heaps);
    w.flags[c.f('heaps')] = heaps;
  },
};

// ================================================================ act 2: the arches, with the bells
const galiyara: Act = {
  id: 'lko10-galiyara',
  w: 34,
  advice: 'The maze again: walk over the drain through the first arch (a hop takes you up into the hooks), and jump through the second, over the well, up to the gallery. Then along the gallery to the far end.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 4, 15).fill(x + 4, x + 4, 16, 17, '#');
    g.fill(x + 7, x + 12, 9, 9, '#');
    g.pit(x + 15, x + 33, 15);
    g.fill(x + 15, x + 33, 12, 12, '#');
  },
  build: (w, c) => {
    const x = c.x;
    arch(w, c.X(5) + 8, FLOOR, { x: c.X(7) + 8, y: px(9) }, c.f('a1'));
    hooks(w, x + 8, x + 11, px(9));
    arch(w, c.X(14) + 8, FLOOR, { x: c.X(16) + 8, y: px(12) }, c.f('a2'));
    well(w, x + 15, x + 33);
  },
};

// ================================================================ the door: tehzeeb
/** The last door bows back. Stand still before it (a bow) and it opens; but the threshold right in front of
 *  it is bells under a cover, and a bow there brings the dancer. Bow from the plain board, two steps back,
 *  then walk in. */
export const tehzeeb: Ending = {
  space: 12,
  advice: 'The last door opens to a bow: stand still before it and it opens. But the threshold right in front of it is bells under a chikan cover, and a bow there brings the dancer spinning. Bow from the plain board two steps back, then walk in.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const L = lock(w, d, 'Aadaab! | Respectful greetings!');
    const still = stillness(w);
    bowIcon(w, still);
    const dn = new Dancer(w, px(D + 3) + 8);
    covered(w, D - 3, D - 1, dn);
    w.flags.twist = 'shut';
    w.add(
      new Art((ctx) => {
        ctx.fillStyle = '#8D5A3B';
        ctx.fillRect(px(D - 6), FLOOR - 2, px(3), 2);
      }, -1),
    );
    w.onTick((w2) => {
      const p = w2.player;
      if (w2.flags.twist === 'shut' && p.cx > px(D - 6) && p.cx < px(D - 3) && still() > 40) {
        w2.flags.twist = 'open';
        L.unlock();
        w2.say('Aadaab! | Respectful greetings!', d.x + 8, d.y - 8, 2, 'npc');
      }
    });
    w.when(
      (w2) => w2.player.cx > px(D - 10),
      (w2) => taraNow(w2, 'Pehle aap, phir aap, phir aap! | After you, after you, after you!', 2.4),
    );
  },
};

// ================================================================ the callbacks, each one broken once
/** The court again, but the courtier is a Lakhnavi too: when he stands two squares ahead he bows you on to
 *  the square between, 'pehle aap'. That square is lit and empty, and it's the loose stone. */
const darbar: Act = {
  id: 'lko10-darbar',
  w: 46,
  advice: 'The pachisi court again, in two halves with a chabutra between, and the courtier is a Lakhnavi too: when he bows you on to the square between you and him ("pehle aap"), it is lit and empty, and it is the loose stone. Wait on yours for the next throw.',
  cps: [20.5],
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 36, 15);
    g.fill(c.x + 19, c.x + 24, 13, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const wz = well(w, x + 4, x + 18);
    const wz2 = well(w, x + 25, x + 36);
    chausar(w, x + 5, 5, c.f('court'), 200, { bow: true, well: wz });
    chausar(w, x + 26, 4, c.f('court2'), 200, { bow: true, well: wz2, off: 2 });
    sign(w, x + 0.4, 10.4, 3.4, 'DARBAR', 'shop', null, 'pehle aap');
  },
};
/** The slow procession again, as in 07: a plain callback (DECISIONS W2: the covered-bells break is kept for
 *  jawab and tasveer only). */
const julusBells: Act = {
  ...julus,
  id: 'lko10-julus',
  cps: [19.5, 31.5, 41.5],
  advice: 'The slow procession again, going your way: walk behind them at their pace, and wait at each nala until they are over it.',
};
/** The photograph again, but the street in front of the posing group is bells under chikan covers. Photo
 *  taught: wait right by the group for the flash. Here that spot is a cover, and a wait there is a bow
 *  that rings the bells: wait three steps back on the plain board, and run the covers and the group in one
 *  go on the flash. */
const TASVEER: PhotoPlan = { nala: 8, wall: 12, cam: 19, period: 470, flashes: [[230, 170]] };
const tasveer: Act = {
  id: 'lko10-tasveer',
  w: 24,
  advice: 'The photograph again, but the street in front of the posing group is bells under chikan covers: waiting by the group, as on the Ganj, is a bow on the bells. Wait back on the plain board before the drain, and on the flash hop it and run the covers and the group in one go.',
  cps: [16.5],
  paint: (g, c) => {
    g.pit(c.x + TASVEER.nala, c.x + TASVEER.nala + 1);
  },
  build: (w, c) => {
    const x = c.x;
    const d = new Dancer(w, c.X(22) + 8, 210, 'lko-tehzeeb');
    covered(w, x + 10, x + 11, d, 30);
    photoGroup(w, c, TASVEER, 0, c.f('g'), pace(w));
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2));
    sign(w, x + 0.4, 10.4, 3.4, 'TASVEER', 'shop', null, 'ghungroo');
  },
};
/** The greeting again, but on the bell floor. Aadaab taught: stop where you are for one short bow. Here a
 *  stop on the covers rings the bells: step back off them to the plain board to return his greeting. */
const jawab: Act = {
  id: 'lko10-jawab',
  w: 16,
  advice: 'The greeting again, but he greets you when you are on the covered bells, and a bow there rings them. Step back to the plain board behind you to return his greeting with one short bow, then walk on over the covers without stopping and hop his drain.',
  cps: [-1.5],
  cp0: false,
  paint: (g, c) => {
    g.pit(c.x + 10, c.x + 11);
  },
  build: (w, c) => {
    const x = c.x;
    const d = new Dancer(w, c.X(15) + 8, 210, 'lko-tehzeeb');
    covered(w, x + 3, x + 9, d, 20);
    const still = stillness(w);
    bowIcon(w, still);
    gentleman(w, c, 8, 2, still, c.f('g'));
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Zehmat na kijiye. | Please don’t trouble yourself.', 2.2));
    sign(w, x + 0.2, 10.4, 3, 'JAWAB', 'shop', null, 'aadaab');
  },
};

/** The Ganj's strollers again: pause and they part, as on the Ganj. But they are Lakhnavi gentlemen, and a
 *  gap made by politeness is a doorway: the nearest one bows you through first, and the stone in the gap is
 *  the loose one. 07 taught: go through the gap. Here: bow back, let him go first, take the gap second. */
const raasta: Act = {
  id: 'lko10-raasta',
  w: 26,
  cp0: false,
  cps: [-2],
  advice: 'The strollers again: pause and they part. But a gap made by politeness is a doorway, and the gentleman in it bows you through first, on to the loose stone. Bow back (stand still) and let him go first, then hop the hole he leaves.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 5);
    g.pit(c.x + 18, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    nala(w, x + 4, x + 5, 'lko-nala');
    const crowd = strollers(w, x + 13, c.f('crowd'), 'lko-ganj', -210);
    const hole = looseStone(w, x + 18, 2, 'lko-pehle');
    const still = stillness(w);
    bowIcon(w, still);
    const G = { x: c.X(17) + 8, s: 'wait', y: FLOOR };
    w.flags[c.f('g')] = G;
    w.add(
      new Art((ctx) => {
        if (G.s === 'wait' || G.s === 'gone') return;
        gent(ctx, G.x, G.y, 26, '#7A4E6E', { face: G.s === 'bow' ? -1 : 1, bow: G.s === 'bow' ? 1 : 0, topi: '#F5F0E6' });
      }, 3),
    );
    w.onTick((w2) => {
      const p = w2.player;
      if (G.s === 'wait' && crowd.s === 'parted') {
        G.s = 'bow';
        w2.say('Pehle aap, janab! | After you, sir!', G.x, FLOOR - 36, 2, 'npc');
      } else if (G.s === 'bow' && still() > 50 && p.cx < c.X(17)) G.s = 'first';
      else if (G.s === 'first') {
        const sx = c.X(18) - 6,
          ex = c.X(20) + 10;
        if (!hole.st.down && G.x >= sx) hole.drop(w2);
        if (G.x < ex) {
          G.x += 1.4;
          G.y = hole.st.down && G.x > sx ? FLOOR - Math.sin((Math.PI * (G.x - sx)) / (ex - sx)) * 22 : FLOOR;
        } else G.s = 'gone';
      }
    });
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Pehle aap? Accha, pehle aap. | After you? Fine, after you.', 2.2));
    sign(w, x + 0.4, 10.4, 3.4, 'RAASTA', 'shop', null, 'pehle aap');
  },
};

/** The rooftops again, but the flyer's boy has scattered grain on the wide roof. 09 taught: cross on red.
 *  Grain beats the flag: the flock comes down to feed on it whatever the flag says, feeds, lifts, and comes
 *  back. Wait at the roof's near end and cross the grain while they are up; don't hop over feeding birds. */
const DAANA = { period: 420, feed: 240 };
class Grain extends Flyer {
  constructor(
    readonly flag: Flyer,
    readonly clock: { t: number; active: boolean },
  ) {
    super(flag.x, flag.feet, flag.plan, flag.from);
  }
  feeding(w: World) {
    return this.clock.active && this.clock.t >= 0 && (w.tick - this.clock.t) % DAANA.period < DAANA.feed;
  }
  order(w: World) {
    if (this.clock.active) return { c: this.feeding(w) ? ('white' as const) : ('red' as const), left: 1 };
    return this.flag.order(w);
  }
}
const daana: Act = {
  id: 'lko10-daana',
  w: 30,
  cp0: false,
  cps: [-2, 19.4],
  advice: 'The rooftops again, but grain is scattered on the wide roof, and grain beats the flag: the flock comes down to feed on it whatever the flag says, then lifts, then comes back. Wait at the roof’s near end, cross the grain while they are up, and never hop over feeding birds.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 5, x + 29, 15);
    g.fill(x + 7, x + 16, 13, 17, '#');
    g.fill(x + 19, x + 24, 13, 17, '#');
    g.fill(x + 27, x + 29, 14, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const G = roofOf(x + 7, x + 16, 13),
      patch: Roof = { x0: c.X(11), x1: c.X(14), top: px(13) },
      B = roofOf(x + 19, x + 24, 13),
      E = roofOf(x + 27, x + 29, 14);
    roofs(w, [G, B, E], c.X(5), c.X(30));
    const flag = new Flyer(c.X(1) + 8, FLOOR, [['red', 2.0], ['white', 1.8]], c.X(0.5));
    drawFlyer(w, flag);
    const clock = { t: -1, active: false };
    const sig = new Grain(flag, clock);
    const fl = new Flock(w, [B, E], sig, { x: c.X(14), y: px(4) }, 'lko-daana');
    w.flags[c.f('k')] = { f: flag, sig, clock };
    w.onTick((w2) => {
      const p = w2.player;
      if (clock.t < 0 && p.cx > c.X(5)) {
        clock.t = w2.tick;
        clock.active = true;
      }
      if (clock.active && p.cx > c.X(17)) clock.active = false;
      fl.always = clock.active ? patch : null;
      // hop over feeding birds and they burst up into you
      const over = !p.onGround && p.cx > patch.x0 - 4 && p.cx < patch.x1 + 4;
      if (over && sig.feeding(w2) && fl.z.on) w2.die('lko-daana-udaan');
      fl.z.hazard.cause = clock.active ? 'lko-daana' : 'lko-kabootar';
    });
    w.add(
      new Art((ctx) => {
        if (!clock.active && clock.t >= 0) return;
        ctx.fillStyle = '#E0B84C';
        for (let k = 0; k < 18; k++) ctx.fillRect(patch.x0 + 2 + ((k * 13) % 44), patch.top - 2 + (k % 2), 1.5, 1.5);
      }, 2),
    );
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2));
    sign(w, x + 0.2, 10.4, 3, 'DAANA', 'shop', null, 'kabootar');
  },
};

/** The malai heaps again, at night. 04 taught: the light comes from one side, stand in the heap's shadow.
 *  Here the only light is the lamplighter's lantern, and he walks the far rim of the karahi towards you: as
 *  he passes each heap its shady side changes. Read where he is against each heap, not where he was. */
const CHIRAG = { from: 20, to: 0.5, v: 0.7 };
const chirag: Act = {
  id: 'lko10-chirag',
  w: 24,
  cps: [21.6],
  advice: 'The malai heaps again, but at night the only light is the lamplighter’s lantern, and he is walking towards you along the far rim. As he passes each heap its shady side changes: the side away from his lantern holds. Go before he reaches a heap and keep the left tiles, or wait for him to pass and take the right ones.',
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 20);
  },
  build: (w, c) => {
    const x = c.x;
    const L = { x: c.X(CHIRAG.from) + 8, go: false };
    w.flags[c.f('ll')] = L;
    const kz = karahi(w, x + 5, x + 20);
    const heaps = [6, 9, 12, 15, 18].map((d, k) => {
      const mid = c.X(d) + 16;
      return new Heap(w, c.X(d), k % 2 ? px(14) : px(13), (): Light => (L.x > mid ? 'R' : 'L'));
    });
    shadows(w, heaps);
    let cur: { h: Heap; i: number; lit: boolean } | null = null;
    w.onTick((w2) => {
      if (!L.go && w2.player.cx > c.X(4)) L.go = true;
      if (L.go && L.x > c.X(CHIRAG.to) + 8) L.x -= CHIRAG.v;
      const p = w2.player;
      if (p.onGround) {
        for (const h of heaps)
          for (const i of [0, 1])
            if (h.t[i].on && on(w2, h.t[i].solid) && (cur?.h !== h || cur.i !== i)) cur = { h, i, lit: h.litIndex(w2) === i };
      }
      // you stood on a lit side, or a shady side that the lantern came round to: two different mistakes
      kz.hazard.cause = cur && !cur.lit ? 'lko-chirag' : 'lko-malai';
    });
    w.add(
      new Art((ctx, w2) => {
        // the lamplighter on the far rim, his lantern on a pole; the lamp post he is walking to
        ctx.fillStyle = '#2E2A26';
        ctx.fillRect(c.X(CHIRAG.to) + 6, FLOOR - 70, 3, 70);
        const done = L.x <= c.X(CHIRAG.to) + 8;
        ctx.fillStyle = done ? '#FFD54F' : '#6B6357';
        ctx.fillRect(c.X(CHIRAG.to) + 4, FLOOR - 80, 7, 10);
        gent(ctx, L.x, FLOOR, 24, '#6D5A48', { face: -1, arms: 0.6, skin: '#9C6B48' });
        ctx.fillStyle = '#4E3B2C';
        ctx.fillRect(L.x - 7, FLOOR - 46, 1.5, 30);
        const ly = FLOOR - 48 + Math.sin(w2.tick * 0.12) * 1.2;
        const g = ctx.createRadialGradient(L.x - 6, ly, 2, L.x - 6, ly, 46);
        g.addColorStop(0, 'rgba(255,213,79,0.55)');
        g.addColorStop(1, 'rgba(255,213,79,0)');
        ctx.fillStyle = g;
        ctx.fillRect(L.x - 52, ly - 46, 92, 92);
        ctx.fillStyle = '#FFD54F';
        ctx.fillRect(L.x - 9, ly - 3, 6, 7);
      }, -2),
    );
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Roshni chal rahi hai! | The light is moving!', 2.2));
    sign(w, x + 0.2, 10.4, 3, 'CHIRAG', 'shop', null, 'raat');
  },
};

/** The guru again, and her stamps again, but tonight she dances for the guests, not for a student: nobody
 *  is mirroring anybody, and a stamp swaps nothing. 06 taught: at a stamp, press the other way. */
const seedha = makeGuru(
  'lko10-seedha',
  false,
  'The guru again, stamping as before, but tonight she dances for the guests and nobody mirrors her: a stamp swaps nothing. Keep pressing the way you were going, hop the red strips, and never stop on her floor.',
  'SEEDHA',
);
/** The tihai again, but tonight the tabla player cuts it short for the nawab: two phrases, and sam on the
 *  second. 06 taught: count three. And the plain boards are chikan covers here: a pause on one is a bow. */
const do_ = makeTihai(
  'lko10-do',
  2,
  true,
  'lko-tihai-do',
  'The tihai again, but tonight he cuts it short: sam comes on the second lamp, not the third. Be on a board when the second lights. The boards are chikan covers over bells now: keep your feet moving on them, a pause is a bow.',
  'DO HI',
);
/** The hall door again, but tonight the maze stays put: the arch you saw is the arch. And the floor you
 *  come out on is bells under chikan covers, so 08's calm look round on arrival is a bow. Run on. */
const thahra = makeDarwaza(
  'lko10-thahra',
  false,
  'The hall door again, but tonight the maze stays put: the arch you saw over the well’s edge is still there. And the floor past the door is bells under chikan covers: stop to look round, as in the maze, and that is a bow. Run on and jump the arch you saw.',
  'THAHRA',
  (w, c) => {
    const d = new Dancer(w, c.X(17) + 8, 300, 'lko-tehzeeb');
    covered(w, c.x + 6, c.x + 16, d, 30);
  },
);
export const s10 = { room: tehzeebRoom, acts: [darbar, tasveer, jawab, daana, seedha, thahra] };
export const meta10 = { family: 'finale-bow-meets-bells', betrayals: ['bow-vs-bells'], ending: 'lko-tehzeeb' } as StageMeta;
