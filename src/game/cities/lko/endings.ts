// Lucknow's door endings, one per stage 02-10, each a new idea. Kinds start with 'lko-'.
import type { World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { lock, tara as taraNow } from '../../levels/endkit';
import { bakhiya } from './s03';
import { kulhad } from './s04';
import { sheermal } from './s05';
import { sam } from './s06';
import { darban } from './s07';
import { Art, FLOOR, Zone, gent, px } from './kit';

export type LkoEndingKind = 'lko-kiwad' | 'lko-bakhiya' | 'lko-kulhad' | 'lko-sheermal' | 'lko-sam' | 'lko-darban';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<LkoEndingKind, true> {}
}

// ================================================================ LKO-02: the darwaza opens outwards
/** The haveli's big door is locked: someone inside is coming out first. Its two heavy leaves swing out,
 *  towards you, over the last two tiles in front of it. Wait back from the door, then go in. */
const kiwad: Ending = {
  space: 12,
  advice: 'The big door is shut because someone inside is coming out first. Its heavy leaves swing outwards, over the two tiles in front of it: wait a few steps back, let him out, then walk in.',
  build(w: World, d) {
    const D = Math.round(d.x / 16);
    const L = lock(w, d, 'Nahin nahin, pehle aap! | No no, after you!');
    const S = { s: 'shut', t: 0, ang: 0, manX: d.x + 8 };
    w.flags.kiwad = S;
    w.flags.twist = 'shut';
    const sweep = w.add(new Zone(px(D - 2), FLOOR - 34, px(2) + 4, 34, 'lko-kiwad'));
    sweep.on = false;
    w.add(
      new Art((ctx) => {
        // the darwaza: a tall cusped frame, two studded leaves that open towards you
        const x = d.x + 8,
          top = FLOOR - 52;
        ctx.fillStyle = '#E7D9C3';
        ctx.fillRect(x - 22, top - 6, 44, 58);
        ctx.fillStyle = '#5A8F7B';
        ctx.fillRect(x - 22, top - 6, 44, 3);
        const open = S.ang;
        for (const s of [-1, 1]) {
          // each leaf shortens as it swings out (seen side on, it turns towards us and sweeps the street)
          const lw = 16 * (1 - open) + 2;
          const lx = s < 0 ? x - 18 - open * 18 : x + 2 + 0;
          ctx.fillStyle = '#6D4127';
          ctx.fillRect(s < 0 ? lx : x + 2, top, s < 0 ? lw + open * 0 : lw, 52);
          ctx.fillStyle = '#C9A227';
          for (let k = 0; k < 4; k++) ctx.fillRect((s < 0 ? lx : x + 2) + 3, top + 6 + k * 12, 2, 2);
        }
        if (open > 0.2) {
          // the left leaf, now out over the street, drawn in front as a long dark board
          ctx.fillStyle = 'rgba(109,65,39,0.95)';
          ctx.fillRect(px(D - 2) + (1 - open) * 30, FLOOR - 34, 34 * open, 34);
        }
        if (S.s !== 'shut') gent(ctx, S.manX, FLOOR, 26, '#3E5C76', { face: -1, topi: '#F5F0E6' });
      }, 3),
    );
    w.when(
      (w2) => w2.player.cx > px(D - 9),
      (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.4),
    );
    w.onTick((w2) => {
      const p = w2.player;
      const age = w2.tick - S.t;
      if (S.s === 'shut' && p.cx > px(D - 7)) {
        S.s = 'coming';
        S.t = w2.tick;
      } else if (S.s === 'coming' && age > 70) {
        S.s = 'swing';
        S.t = w2.tick;
        sweep.on = true;
        w2.sfx('thud', d.x, FLOOR - 20);
        w2.flags.twist = 'swing';
      } else if (S.s === 'swing') {
        S.ang = Math.min(1, age / 24);
        if (age > 60) {
          sweep.on = false;
          S.s = 'out';
          S.t = w2.tick;
        }
      } else if (S.s === 'out') {
        S.manX -= 0.9;
        if (age > 50 && !w2.flags.kiwadOpen) {
          w2.flags.kiwadOpen = 1;
          L.unlock();
        }
      }
    });
  },
};

export const endings: Record<LkoEndingKind, Ending> = { 'lko-kiwad': kiwad, 'lko-bakhiya': bakhiya, 'lko-kulhad': kulhad, 'lko-sheermal': sheermal, 'lko-sam': sam, 'lko-darban': darban };
