// ITA-08 Bans ka Bera (HWIK): bamboo rafts moored across the Siang. A raft is a row of poles lashed together, and
// the lashings are drawn: a rope band round a pole ties it to its neighbours. Stand on a banded pole and the raft
// holds. Stand on a plain pole and the lashings beside it give: the poles spread apart sideways under your weight and
// the one under you rolls, and you are in the river. Nothing sinks, nothing tilts: the floor opens. The last raft has
// a frayed band: that lashing snaps and whips the one standing on it. Cross that pole in one hop.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

export type Pole = 'plain' | 'band' | 'frayed';
export interface Raft {
  c0: number;
  poles: Pole[];
  rigs: Rig[];
  /** tick the raft spread (-1: whole) and the pole it spread round */
  spreadT: number;
  at: number;
}

function river(w: World, x0: number, x1: number) {
  w.add(
    new Rig(x0, FL + 6, x1 - x0, 42, {
      layer: 4,
      cause: 'ita-nadi',
      inset: 0,
      paint: (ctx, r, w2) => {
        const g = ctx.createLinearGradient(0, FL, 0, FL + 48);
        g.addColorStop(0, 'rgba(110,140,130,0.9)');
        g.addColorStop(1, 'rgba(40,60,60,0.97)');
        ctx.fillStyle = g;
        ctx.fillRect(r.x, FL + 2, r.w, 46);
        ctx.strokeStyle = 'rgba(230,240,235,0.5)';
        ctx.lineWidth = 0.8;
        for (let x = r.x + ((w2.tick * 0.6) % 18); x < r.x + r.w - 8; x += 18) {
          ctx.beginPath();
          ctx.moveTo(x, FL + 8);
          ctx.lineTo(x + 8, FL + 8);
          ctx.stroke();
        }
      },
    }),
  );
}

/** a raft of poles from column c0 (two columns per pole); `key` holds the state for the tests */
export const PW = 32;
export function raft(w: World, c0: number, poles: Pole[], key: string): Raft {
  const st: Raft = { c0, poles, rigs: [], spreadT: -1, at: -1 };
  w.flags[key] = st;
  poles.forEach((kind, i) => {
    const r = w.add(
      new Rig(px(c0 + 2 * i), FL - 16, PW, 32, {
        solid: true,
        layer: 2,
        cause: kind === 'frayed' ? 'ita-rassi' : 'ita-nadi',
        inset: kind === 'frayed' ? -8 : 1,
        live: (q) => q.s.live === true,
        tick: (q, w2) => {
          const on = w2.standing(q.solid!);
          if (kind === 'band') return;
          if (on && st.spreadT < 0) {
            st.spreadT = w2.tick;
            st.at = i;
            w2.sfx(kind === 'frayed' ? 'snap' : 'creak', q.x, FL);
          }
          if (st.spreadT < 0) return;
          const k = since(w2, st.spreadT);
          if (kind === 'frayed') {
            // the band snaps and whips whoever stands on the pole
            if (st.at === i) {
              q.s.live = k < 0.35;
              q.y = k < 0.35 ? FL - 30 : FL - 16;
              q.h = k < 0.35 ? 46 : 32;
            }
            return;
          }
          // every plain pole of the raft comes loose: the one stood on rolls, the others slide away from it
          if (poles[st.at] === 'frayed') return;
          q.s.live = k < 0.6;
          if (st.at === i) q.s.roll = k;
          else {
            const dir = i < st.at ? -1 : 1;
            if (k < 0.4) {
              q.solid!.moveBy(w2, dir * perTick(130), 0);
              q.x = q.solid!.x;
            }
          }
        },
        paint: (ctx, q, w2) => {
          // a bamboo pole seen end on: a pale ring, dark middle
          const roll = (q.s.roll ?? 0) as number;
          ctx.save();
          if (roll > 0.08) {
            ctx.translate(q.x + 16, FL + 6);
            ctx.rotate(Math.min(roll, 0.6) * 2);
            ctx.translate(-(q.x + 16), -(FL + 6));
          }
          // a bamboo pole lying across: a pale length with dark joints, floating
          box(ctx, q.x, FL, PW, 12, '#C9B06A');
          box(ctx, q.x, FL, PW, 3, '#E3D08A');
          box(ctx, q.x + 10, FL, 2, 12, '#8A7A3A');
          box(ctx, q.x + 21, FL, 2, 12, '#8A7A3A');
          if (kind !== 'plain') {
            // the lashing: a dark rope band over the pole, frayed ends on the loose one
            ctx.fillStyle = kind === 'frayed' ? '#8A4A2A' : '#3A2A1A';
            ctx.fillRect(q.x + 12, FL - 3, 8, 6);
            ctx.fillRect(q.x + 4, FL - 2, 24, 2);
            if (kind === 'frayed') {
              const f = ((w2.tick >> 3) % 2) as number;
              ctx.fillRect(q.x + 1, FL - 7 - f, 4, 2);
              ctx.fillRect(q.x + 27, FL - 6 + f, 4, 2);
            }
          }
          ctx.restore();
        },
      }),
    );
    // the solid is the pole's top only; the deadly box reaches up over whoever stands on it
    r.solid!.y = FL;
    r.solid!.h = 16;
    st.rigs.push(r);
  });
  return st;
}

export function room(): LevelDef {
  return {
    id: 'ITA-08',
    city: 'ITA',
    index: 8,
    name: 'Bans ka Bera',
    nameEn: 'The bamboo raft',
    tagline: 'Two rafts moored across the Siang. Look at the ropes.',
    hint: 'A raft is poles lashed together, and the lashings are drawn: a dark rope band round a pole. A banded pole holds. Stand on a plain pole and the lashings beside it give: the poles spread apart under your weight and the one under you rolls you into the river. Hop from banded pole to banded pole, and never put a foot on a plain one.',
    par: 24,
    map: Grid.ground(15).fill(6, 26, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      river(w, px(6), px(27));
      raft(w, 7, ['plain', 'band', 'plain', 'band', 'plain'], 'ita8a');
      raft(w, 17, ['band', 'plain', 'band', 'plain', 'band'], 'ita8b');
      onPass(w, px(3), (w2) => tara(w2, L.intro[6], 2.4));
      sign(w, 2, 10.4, 3.4, 'SIANG', 'shop', null, 'the river');
      rival(w, 28, 15, -1, taraScript(8));
      collectible(w, 'ita-pikapila', 14, 11.4);
    },
  };
}

/** act: the long moorings, and a frayed band among them: that lashing snaps and whips the one standing on it. Hop it. */
export const act: Act = {
  id: 'ita08-dhaara',
  w: 47,
  advice: 'Longer rafts, and one of the bands is frayed, its ends loose and twitching: that lashing snaps the moment you stand on it and the rope whips you. A frayed pole is not a step: hop over it to the next sound band.',
  cps: [44],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 40, 15, 17, '.');
  },
  build: (w, c) => {
    river(w, c.X(6), c.X(41));
    raft(w, c.x + 7, ['plain', 'band', 'frayed', 'band', 'plain', 'band', 'plain', 'band'], 'ita8c');
    raft(w, c.x + 23, ['band', 'plain', 'band', 'frayed', 'band', 'plain', 'band', 'plain', 'band'], 'ita8d');
    sign(w, c.x + 1, 10.4, 3, 'DHAARA', 'shop', null, 'the current');
  },
};

/** ending: the landing stage. The raft at the ghat is one pole with a frayed band: cross it in one running jump. */
export const ending: Ending = {
  space: 14,
  advice: 'The ghat: the last raft is one pole, and its band is frayed. There is nothing to stand on. Cross it in one running jump from the bank.',
  paint: (g, D) => {
    g.fill(D - 6, D - 4, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'ghat';
    river(w, px(D - 6), px(D - 3));
    raft(w, D - 6, ['frayed'], 'ita8e');
    w.flags.ita8g = { x0: px(D - 6), x1: px(D - 3) };
  },
};

export const meta08 = { family: 'raft-poles-spread-under-weight', betrayals: ['poles-spread'], ending: 'ita-ghat' };
