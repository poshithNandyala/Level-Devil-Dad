// IMP-07 Resurface (marathon, honest-short): in the monsoon the grounded phumdi lifts off the lake bed and floats.
// Each stretch of mat is a ride that starts when you walk on to it in the rain: the mat detaches, drifts to the
// next hill and regrounds there. Running on ahead of the drift runs you off its front into the lake; standing
// where you are puts your head into the low branch the mat passes under, because only the FRONT of a drifting mat
// dips (it is the end that takes the water): ride at the front. When the mat regrounds on a shoal it is the BACK
// that goes under: be at the front then too, and hop the last gap.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, matArt, perTick } from './entities';
import { FL, hut, lake, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export const RIDE = { detach: 1.2, speed: 64, dip: 6 };

export interface RideState {
  t0: number;
  phase: 'grounded' | 'rain' | 'drift' | 'reground';
  p0: number;
  mat: Rig;
  /** px the mat has drifted */
  moved: number;
}

/** a mat from column c0 (w tiles) that detaches `RIDE.detach` s after Dad passes c0 + 1.5 and drifts right `dist` tiles */
export function ride(w: World, key: string, c0: number, wTiles: number, dist: number, o: { branch?: number; shoal?: boolean; hut?: boolean } = {}) {
  const mat = w.add(
    new Rig(px(c0), FL - 6, px(wTiles), 10, {
      layer: -4,
      solid: true,
      tick: (r, w2) => {
        if (st.phase === 'rain' && since(w2, st.p0) >= RIDE.detach) {
          st.phase = 'drift';
          st.p0 = w2.tick;
          w2.sfx('splash', r.x, FL);
        }
        if (st.phase === 'drift') {
          const step = Math.min(perTick(RIDE.speed), px(dist) - st.moved);
          r.moveTo(w2, r.x + step, r.y);
          st.moved += step;
          if (st.moved >= px(dist) - 0.01) {
            st.phase = 'reground';
            st.p0 = w2.tick;
            w2.sfx('thud', r.x + r.w, FL);
          }
        }
      },
      paint: (ctx, r, w2) => {
        const drifting = st.phase === 'drift';
        const grounded = st.phase === 'grounded' || st.phase === 'rain';
        // the front dips while drifting; the back goes under for a moment on regrounding on a shoal
        const dipF = drifting ? RIDE.dip : 0;
        const dipB = st.phase === 'reground' && o.shoal && since(w2, st.p0) < 0.6 ? RIDE.dip : 0;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + dipB);
        ctx.lineTo(r.x + r.w, r.y + dipF);
        ctx.lineTo(r.x + r.w, r.y + r.h + 6 + dipF);
        ctx.lineTo(r.x, r.y + r.h + 6 + dipB);
        ctx.clip();
        matArt(ctx, r.x, r.y + Math.max(dipF, dipB) * 0.5, r.w, r.h + 6, { reeds: true, dull: !grounded });
        ctx.restore();
        if (grounded) box(ctx, r.x - 2, r.y + r.h, r.w + 4, 6, '#5E5236'); // the lake bed it sits on
        if (o.hut) hut(ctx, r.x + r.w / 2 - 15, r.y + 1);
      },
    }),
  );
  const st: RideState = { t0: -1, phase: 'grounded', p0: 0, mat, moved: 0 };
  w.flags[key] = st;
  // the branch: a bough over the water at head height; it clears a man standing on the dipped front half
  if (o.branch !== undefined) {
    w.add(
      new Rig(px(o.branch) - 10, FL - 22, 20, 8, {
        layer: 3,
        cause: 'imp-branch',
        inset: 1,
        live: (_r, w2) => {
          const p = w2.player;
          // the front half of the mat rides lower: whoever stands on it passes under
          const onFront = w2.standing(mat.solid!) && p.x + p.w / 2 > mat.x + mat.w / 2;
          return st.phase === 'drift' && !onFront;
        },
        paint: (ctx, r) => {
          box(ctx, r.x - 30, r.y - 60, 6, 70, '#5E3A1E');
          box(ctx, r.x - 10, r.y, r.w + 10, 5, '#6E4B2A');
          for (let i = 0; i < 4; i++) box(ctx, r.x - 6 + i * 8, r.y - 6 + (i % 2) * 3, 7, 6, '#4F7A2A');
        },
      }),
    );
  }
  // the shoal: pale water where the mat will ground; at the stop the back of the mat goes under for a moment
  if (o.shoal) {
    w.add(
      new Rig(0, FL - 20, px(1.6), 24, {
        layer: 3,
        cause: 'imp-tilt',
        inset: 1,
        live: (_r, w2) => st.phase === 'reground' && since(w2, st.p0) < 0.5,
        tick: (r) => {
          r.x = mat.x;
        },
        paint: (ctx, _r, w2) => {
          const x = px(c0 + dist) - 4;
          ctx.fillStyle = 'rgba(220,230,200,0.45)';
          ctx.fillRect(x, FL + 4, px(wTiles) * 0.5, 8);
          if (st.phase === 'reground' && since(w2, st.p0) < 0.7) for (let i = 0; i < 5; i++) box(ctx, mat.x + i * 5, FL - 10 - (i % 3) * 4, 3, 3, 'rgba(220,240,235,0.8)');
        },
      }),
    );
  }
  // the rain
  w.add(
    new Paint((ctx, w2) => {
      if (st.phase === 'grounded') return;
      const t = since(w2, st.p0);
      ctx.strokeStyle = 'rgba(200,220,230,0.5)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 40; i++) {
        const x = px(c0) - 60 + ((i * 37 + w2.tick * 3) % (px(wTiles + dist) + 120));
        const y = ((i * 53 + w2.tick * 7) % 240) - 20;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 2, y + 10);
        ctx.stroke();
      }
      void t;
    }, 4),
  );
  onPass(w, px(c0 + 1.5), (w2) => {
    if (st.phase !== 'grounded') return;
    st.t0 = w2.tick;
    st.phase = 'rain';
    st.p0 = w2.tick;
    w2.sfx('rain', px(c0), 100);
  });
  return st;
}

export function room(): LevelDef {
  return {
    id: 'IMP-07',
    city: 'IMP',
    index: 7,
    name: 'Resurface',
    nameEn: 'The monsoon mat',
    tagline: 'The rain comes, and the ground you stand on floats off.',
    hint: 'When the rain starts the grounded mat lifts and drifts to the next hill: it is a ride. Run ahead of it and you run off its front into the lake. The drifting mat dips at its FRONT, so stand on the front half: the branch over the water passes over your head there and takes anyone standing further back.',
    par: 60,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(5, 26, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      lake(w, 5, 27);
      ride(w, 'imp7', 5, 7, 15, { branch: 18, hut: true });
      onPass(w, px(2), (w2) => tara(w2, L.intro[5], 2.2));
      sign(w, 1.5, 10.4, 3.4, 'TOYA', 'green', null, 'the first hill');
      rival(w, 29.5, 15, -1, taraScript(7));
      collectible(w, 'imp-kauna', 23, 11.2);
    },
  };
}

/** act 1: a longer ride that regrounds on a shoal short of the hill: at the stop the BACK goes under: be at the
 * front, and hop the last gap to the hill */
const actChingjao: Act = {
  id: 'imp07-chingjao',
  w: 44,
  advice: 'This mat grounds on a shoal (the pale water) short of the hill, and when it grounds its back end goes under for a moment: ride at the front as before, and when it stops hop the last gap to the bank.',
  cps: [40],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 35, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 36);
    ride(w, c.f('ride'), c.x + 3, 7, 24, { branch: c.x + 20, shoal: true });
    onPass(w, c.X(1), (w2) => w2.say(NPC.dontGet, c.X(6), FL - 50, 2.2, 'npc'));
    sign(w, c.x + 39, 10.4, 3.4, 'CHINGJAO', 'green', null, 'the hill');
  },
};

/** act 2: two short rides back to back; the second's branch comes early, right after it detaches */
const actPabot: Act = {
  id: 'imp07-pabot',
  w: 50,
  advice: 'Two mats in a row. Walk straight to the front of each as the rain starts; the second mat’s branch comes almost at once.',
  cps: [22, 46],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 18, 15, 17, '.');
    g.fill(c.x + 24, c.x + 42, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 19);
    lake(w, c.x + 24, c.x + 43);
    ride(w, c.f('ride1'), c.x + 3, 6, 10, { branch: c.x + 14 });
    ride(w, c.f('ride2'), c.x + 24, 6, 13, { branch: c.x + 33, hut: true });
    sign(w, c.x + 45, 10.4, 3.4, 'PABOT', 'green', null, 'the last hill');
  },
};

export const acts = [actChingjao, actPabot];
export const meta07 = { family: 'phumdi-detach-reground', betrayals: ['detach-ground'], ending: 'imp-chingjao-door-plain' };
