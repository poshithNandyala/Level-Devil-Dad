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
import { Art, FLOOR, px, stillness, bowIcon, TAU } from './kit';
import { archway, looseStone, pehleDoorway, tara, gali } from './s02';
import { washLine, kunda } from './s03';
import { Heap, karahi, shadows, type Light } from './s04';
import { Dancer } from './s06';
import { arch, well, hooks } from './s08';
import { on, again } from './kit';
import { tawa2 } from './s05';
import { tatkar } from './s06';
import { julus } from './s07';
import { hawa } from './s09';
import { chaupar } from './s08';

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
  cps: [21.5],
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

// the callbacks, in a new order: kebabs, the dancer's patch, the slow procession, the pigeons, the court
const tawa10 = again(tawa2, 'lko10-tawa', 'Aminabad’s tawa once more: thin kebabs at once, full heaps once they squash. Tap the jump.');
const tatkar10 = again(tatkar, 'lko10-tatkar', 'The dancer’s tatkar patch again: wait for it to come at you and hop clean over it; keep off the red strips.');
const julus10 = again(julus, 'lko10-julus', 'The slow procession again: walk behind it at its pace, and wait at each nala till they’re well across.');
const hawa10 = again(hawa, 'lko10-hawa', 'Up on the roofs with the flyer behind you and his two-faced flag: cross while you see white, the birds see red.');
const chausar10 = again(chaupar, 'lko10-chausar', 'The pachisi court once more: one lit square at a time, never the courtier’s.');
const kunda10 = again(kunda, 'lko10-kunda', 'The rinsing vats again: each washer whistles a beat after you step on his print. Run each without stopping.');
const gali10 = again(gali, 'lko10-gali', 'The gali again: the man behind you offers the way before the stone has gone. Let him go first.');
export const s10 = { room: tehzeebRoom, acts: [dhulai, tawa10, tatkar10, julus10, gali10, hawa10, chausar10, kunda10, galiyara] };
export const meta10 = { family: 'finale-bow-meets-bells', betrayals: ['bow-vs-bells'], ending: 'lko-tehzeeb' } as StageMeta;
