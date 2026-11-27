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
import { archway, looseStone, pehleDoorway, tara } from './s02';
import { washLine } from './s03';
import { Heap, karahi, shadows, type Light } from './s04';
import { Dancer, makeGuru } from './s06';
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
      // the bells ring for whoever set them under this cover: the dancer's own cause says which place it was
      d.call(w2, p.cx);
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
    tagline: 'The last haveli. Two gentlemen at the door, a dancer inside, and the floor is sewn with bells under chikan covers.',
    hint: 'The gentlemen still want you to bow, and they still push in whoever leans in first. But the white covers in front of the door have bells under them: a step is silent, a bow (standing still) rings them, and the dancer spins straight to you. Bow on the one plain board, then walk over the covers, take the second gentleman’s offer and hop the hole.',
    par: 18,
    map: Grid.ground(15).pit(19, 20).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const d = new Dancer(w, px(27) + 8, 210, 'lko-tehzeeb');
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

// ================================================================ act 2: the arches, with the bells

// ================================================================ the door: tehzeeb

// ================================================================ the callbacks, each one broken once
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
    const d = new Dancer(w, c.X(22) + 8, 210, 'lko-tasveer');
    covered(w, x + 10, x + 11, d, 30);
    photoGroup(w, c, TASVEER, 0, c.f('g'), pace(w), { pause: 'lko-tasveer-jaldi', rush: 'lko-tasveer-jaldi' });
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2));
    sign(w, x + 0.4, 10.4, 3.4, 'TASVEER', 'shop', null, 'ghungroo');
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


/** The guru again, and her stamps again, but tonight she dances for the guests, not for a student: nobody
 *  is mirroring anybody, and a stamp swaps nothing. 06 taught: at a stamp, press the other way. */
const seedha = makeGuru(
  'lko10-seedha',
  false,
  'The guru again, stamping as before, but tonight she dances for the guests and nobody mirrors her: a stamp swaps nothing. Keep pressing the way you were going, hop the red strips, and never stop on her floor.',
  'SEEDHA',
  'lko-seedha',
  'lko-seedha-aage',
  'lko-seedha-ruka',
);
/** The hall door again, but tonight the maze stays put: the arch you saw is the arch. And the floor you
 *  come out on is bells under chikan covers, so 08's calm look round on arrival is a bow. Run on. */
const thahra = makeDarwaza(
  'lko10-thahra',
  false,
  'The hall door again, but tonight the maze stays put: the arch you saw over the well’s edge is still there. And the floor past the door is bells under chikan covers: stop to look round, as in the maze, and that is a bow. Run on and jump the arch you saw.',
  'THAHRA',
  (w, c) => {
    const d = new Dancer(w, c.X(17) + 8, 300, 'lko-thahra-ruka');
    covered(w, c.x + 6, c.x + 16, d, 30);
  },
  'lko-thahra',
);
export const s10 = { room: tehzeebRoom, acts: [tasveer, daana, seedha, thahra] };
export const meta10 = { family: 'finale-bow-meets-bells', betrayals: ['bow-vs-bells'], ending: 'lko-tehzeeb' } as StageMeta;
