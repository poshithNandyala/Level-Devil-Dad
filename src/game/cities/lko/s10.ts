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
import { Dancer } from './s06';
import { arch, well, hooks, chausar } from './s08';
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
  advice: 'The maze again: walk over the drain through the first arch (a hop takes you up into the hooks), and jump through the second, over the well, up to the gallery. On the gallery the floor is bells under covers: keep walking, don’t stop.',
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
    // the gallery's bells: a dancer down at the end of it spins along the gallery to any bow
    const d = new Dancer(w, c.X(31) + 8, 210, 'lko-tehzeeb', px(12));
    const still = stillness(w);
    let rung = false;
    w.onTick((w2) => {
      const p = w2.player;
      const onIt = p.onGround && Math.abs(p.y + p.h - px(12)) < 2 && p.cx > c.X(17) && p.cx < c.X(30);
      if (onIt && still() > 30 && !rung) {
        rung = true;
        d.call(w2, p.cx, 'lko-tehzeeb');
      }
      if (!onIt) rung = false;
    });
    w.add(
      new Art((ctx) => {
        ctx.fillStyle = '#F5F1E8';
        ctx.fillRect(c.X(17), px(12) - 2, px(13), 4);
        ctx.fillStyle = '#E8C547';
        for (let xx = c.X(17) + 2; xx < c.X(30); xx += 6) ctx.fillRect(xx, px(12) + 2, 2, 1.5);
      }, 1),
    );
    w.flags[c.f('dancer')] = d;
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
/** The slow procession again, now along a floor sewn with bells under chikan covers. Strolling behind them
 *  means pausing, and a pause long enough to be a bow rings the bells and brings the dancer. */
const JULUS10 = [12, 24, 36, 46];
const julusBells: Act = {
  ...julus,
  id: 'lko10-julus',
  cps: [19.5, 31.5, 41.5],
  advice: 'The slow procession again, but between the nalas the floor is bells under chikan covers. Behind them on the covers pause only for a blink (a pause long enough to be a bow rings the bells and the dancer spins to you); do your waiting on the plain boards in front of each nala.',
  build: (w, c) => {
    julus.build!(w, c);
    const d = new Dancer(w, c.X(56) + 8, 210, 'lko-tehzeeb');
    let from = 2;
    for (const n of JULUS10) {
      // five plain boards before each nala: room to wait, and to come back to
      covered(w, c.x + from, c.x + n - 6, d, 40);
      from = n + 2;
    }
  },
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
  w: 22,
  cp0: false,
  cps: [-2],
  advice: 'The strollers again: pause and they part. But a gap made by politeness is a doorway, and the gentleman in it bows you through first, on to the loose stone. Bow back (stand still) and let him go first, then hop the hole he leaves.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 5);
    g.pit(c.x + 14, c.x + 15);
  },
  build: (w, c) => {
    const x = c.x;
    nala(w, x + 4, x + 5, 'lko-nala');
    const crowd = strollers(w, x + 10, c.f('crowd'), 'lko-ganj', -210);
    const hole = looseStone(w, x + 14, 2, 'lko-pehle');
    const still = stillness(w);
    bowIcon(w, still);
    const G = { x: c.X(13) + 8, s: 'wait', y: FLOOR };
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
      } else if (G.s === 'bow' && still() > 50 && p.cx < c.X(13)) G.s = 'first';
      else if (G.s === 'first') {
        const sx = c.X(14) - 6,
          ex = c.X(16) + 10;
        if (!hole.st.down && G.x >= sx) hole.drop(w2);
        if (G.x < ex) {
          G.x += 1.4;
          G.y = hole.st.down && G.x > sx ? FLOOR - Math.sin((Math.PI * (G.x - sx)) / (ex - sx)) * 22 : FLOOR;
        } else G.s = 'gone';
      }
    });
    sign(w, x + 0.4, 10.4, 3.4, 'RAASTA', 'shop', null, 'pehle aap');
  },
};

export const s10 = { room: tehzeebRoom, acts: [dhulai, darbar, tasveer, julusBells, jawab, raasta, galiyara] };
export const meta10 = { family: 'finale-bow-meets-bells', betrayals: ['bow-vs-bells'], ending: 'lko-tehzeeb' } as StageMeta;
