// SHL-06 Root Guide: Nongriat, where people guide the rubber fig's roots across a stream and wait years for a
// bridge. Jump at a bamboo guide and that root grows across the gorge over a few seconds; the others wither.
// The shortest root lands in the spray; the long one, from the rock, lands dry. A root you guided keeps growing
// if you stand on its tip. Every guide you touch grows a root, wanted or not.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { taraScript, FL } from './common';
import { lines as L } from './lines';

export const GROW = { secs: 3.5, speed: 0 };

export interface RootSet {
  /** index of the guide chosen (-1 none) */
  chosen: number;
  roots: Rig[];
  t0: number;
}

/** a root that grows from (x0, y) rightwards to length `len` px over `secs` once `started()`; solid as far as it has grown */
export function root(w: World, x0: number, y: number, len: number, secs: number, started: () => number, o: { stopAt?: number; onDone?: (w: World) => void; left?: boolean } = {}) {
  const r = w.add(
    new Rig(x0, y, 1, 10, {
      solid: true,
      layer: 2,
      tick: (rr, w2) => {
        const t0 = started();
        if (t0 < 0) {
          rr.setSolid(false);
          return;
        }
        const k = Math.min(1, (w2.tick - t0) / 120 / secs);
        const full = o.stopAt !== undefined ? Math.min(k, o.stopAt) : k;
        const wd = Math.max(1, Math.round(len * full));
        if (rr.solid) {
          rr.solid.w = wd;
          if (o.left) rr.solid.x = x0 - wd;
          rr.solid.collidable = wd > 4;
        }
        rr.w = wd;
        if (o.left) rr.x = x0 - wd;
        if (k >= 1 && !rr.s.done) {
          rr.s.done = true;
          o.onDone?.(w2);
        }
      },
      paint: (ctx, rr) => {
        if (started() < 0 || rr.w < 2) return;
        // the root: a braid of brown strands with a leaf fringe
        box(ctx, rr.x, rr.y, rr.w, 4, '#6B4A2B');
        box(ctx, rr.x, rr.y + 4, rr.w, 3, '#4E3520');
        for (let x = rr.x; x < rr.x + rr.w - 4; x += 9) box(ctx, x + 2, rr.y + 7, 5, 2, '#8A6A3E');
        for (let x = rr.x + 4; x < rr.x + rr.w; x += 14) box(ctx, x, rr.y - 3, 4, 3, '#4E8A3E');
        // the growing tip
        box(ctx, o.left ? rr.x - 1 : rr.x + rr.w - 2, rr.y - 1, 3, 6, '#C8D86B');
      },
    }),
  );
  if (r.solid) {
    r.solid.velX = 0;
    r.solid.collidable = false;
  }
  return r;
}

/** a bamboo guide hanging at column c: jump at it to choose its root; choosing one withers the rest of its set */
export function guide(w: World, set: RootSet, i: number, c: number, label: string) {
  w.add(
    new Rig(px(c) - 2, FL - 56, 24, 20, {
      layer: 3,
      tick: (rr, w2) => {
        const p = w2.player;
        const over = p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y < rr.y + rr.h && p.y + p.h > rr.y;
        if (over && set.chosen < 0) {
          set.chosen = i;
          set.t0 = w2.tick;
          w2.sfx('snap', rr.x, rr.y);
        }
      },
      paint: (ctx, rr) => {
        const dead = set.chosen >= 0 && set.chosen !== i;
        box(ctx, rr.x + 11, FL - 110, 2, 54, dead ? '#6B6B5A' : '#B9A25A');
        box(ctx, rr.x + 6, FL - 58, 12, 3, dead ? '#6B6B5A' : '#B9A25A');
        // the young root's tip hanging at the guide
        box(ctx, rr.x + 10, FL - 55, 4, 8, dead ? '#5A4A3A' : '#6B4A2B');
        ctx.fillStyle = '#F4F7F2';
        ctx.font = '7px monospace';
        ctx.fillText(label, rr.x + 2, FL - 112);
      },
    }),
  );
}

/** a plume of spray from the gorge over columns c0..c1: it reaches a tile and a half up, never higher */
export function spray(w: World, c0: number, c1: number) {
  w.add(
    new Rig(px(c0), FL - 24, px(c1 - c0 + 1), 24, {
      layer: 4,
      cause: 'shl-spray',
      inset: 2,
      paint: (ctx, r, w2) => {
        ctx.fillStyle = 'rgba(225,240,248,0.75)';
        for (let x = r.x; x < r.x + r.w; x += 5) {
          const h = 14 + ((x * 7 + w2.tick * 3) % 12);
          ctx.fillRect(x, FL - h, 3, h);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(r.x - 2, FL - 2, r.w + 4, 2);
      },
    }),
  );
}

/** the gorge under cols c0..c1: the fall is a death with its own line */
export function gorge(w: World, c0: number, c1: number) {
  w.add(
    new Rig(px(c0), FL + 28, px(c1 - c0 + 1), 30, {
      layer: 0,
      cause: 'shl-gorge',
      inset: 0,
      paint: (ctx, r) => {
        box(ctx, r.x, FL + 8, r.w, 70, 'rgba(20,34,30,0.9)');
        box(ctx, r.x, FL + 60, r.w, 6, 'rgba(120,200,210,0.5)');
      },
    }),
  );
}

export function room(): LevelDef {
  return {
    id: 'SHL-06',
    city: 'SHL',
    index: 6,
    name: 'Root Guide',
    nameEn: 'Growing the bridge',
    tagline: 'Nongriat. Choose a root, and wait for it.',
    hint: 'Three bamboo guides hang over the bank: jump at one and its root grows across the gorge over a few seconds; the other two wither. The short root from the path lands in the spray on the low landing; the middle one gives up half way; the long one, from the rock by the start, lands dry on the far rock. Get up on the rock, jump at its guide, wait, and walk high over the spray.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(13, 24, 15, 17, '.').fill(3, 5, 13, 14, '#').rows(),
    build(w: World) {
      door(w);
      const set: RootSet = { chosen: -1, roots: [], t0: -1 };
      w.flags.shl6 = set;
      gorge(w, 13, 24);
      spray(w, 25, 27);
      const when = (i: number) => () => (set.chosen === i ? set.t0 : -1);
      set.roots.push(root(w, px(13), FL, px(12), GROW.secs, when(0)));
      set.roots.push(root(w, px(13), FL, px(12), GROW.secs, when(1), { stopAt: 0.55 }));
      set.roots.push(root(w, px(6), FL - 32, px(22), GROW.secs + 0.5, when(2)));
      guide(w, set, 0, 8.5, 'short');
      guide(w, set, 1, 10.4, 'mid');
      // the long guide hangs over the rock: reachable only from up there
      w.add(
        new Rig(px(4) - 2, FL - 32 - 56, 24, 20, {
          layer: 3,
          tick: (rr, w2) => {
            const p = w2.player;
            const over = p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y < rr.y + rr.h && p.y + p.h > rr.y;
            if (over && set.chosen < 0) {
              set.chosen = 2;
              set.t0 = w2.tick;
              w2.sfx('snap', rr.x, rr.y);
            }
          },
          paint: (ctx, rr) => {
            const dead = set.chosen >= 0 && set.chosen !== 2;
            box(ctx, rr.x + 11, FL - 32 - 110, 2, 54, dead ? '#6B6B5A' : '#B9A25A');
            box(ctx, rr.x + 6, FL - 32 - 58, 12, 3, dead ? '#6B6B5A' : '#B9A25A');
            box(ctx, rr.x + 10, FL - 32 - 55, 4, 8, dead ? '#5A4A3A' : '#6B4A2B');
            ctx.fillStyle = '#F4F7F2';
            ctx.font = '7px monospace';
            ctx.fillText('long', rr.x + 2, FL - 32 - 112);
          },
        }),
      );
      onPass(w, px(2.5), (w2) => tara(w2, L.intro[4], 2.2));
      sign(w, 10.5, 10.2, 3.4, 'NONGRIAT', 'shop', null, 'living root bridges');
      rival(w, 29, 15, -1, taraScript(6));
      collectible(w, 'shl-pumaloi', 18, 9.4);
    },
  };
}

/** act: no guides here; the root you came over keeps growing if you stand on its tip, and sprouts the next span */
export const act: Act = {
  id: 'shl06-sprout',
  w: 32,
  advice: 'No guides at this gorge. The root you grew is alive: stand on its tip at the edge and it sprouts the next span across. Nothing else here grows anything, so no jumping the gap.',
  cps: [1],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 19, 15, 17, '.');
  },
  build: (w, c) => {
    const st = { t0: -1, stood: 0 };
    w.flags.shl6a = st;
    gorge(w, c.x + 6, c.x + 19);
    // the old root's tip: a marked strip at the edge; standing on it starts the sprout
    w.add(
      new Rig(px(c.x + 3), FL - 2, px(3), 2, {
        layer: 1,
        tick: (r, w2) => {
          const p = w2.player;
          const on = p.onGround && p.x + p.w > r.x && p.x < r.x + r.w && Math.abs(p.vx) < 5;
          st.stood = on ? st.stood + 1 : 0;
          if (st.stood >= 60 && st.t0 < 0) {
            st.t0 = w2.tick;
            w2.sfx('snap', r.x, FL);
          }
        },
        paint: (ctx, r) => {
          box(ctx, r.x, FL - 6, r.w, 6, '#6B4A2B');
          for (let x = r.x + 3; x < r.x + r.w; x += 12) box(ctx, x, FL - 9, 4, 3, '#4E8A3E');
          box(ctx, r.x + r.w - 3, FL - 7, 3, 7, '#C8D86B');
        },
      }),
    );
    root(w, px(c.x + 6), FL, px(14), 3.5, () => st.t0);
    sign(w, c.x + 1, 10.4, 3, 'ALIVE', 'shop', null, 'it grows while you stand');
  },
};

/** act 2: a guide stands in the path on the far landing: touch it and a root grows across the path; hop it */
export const actPole: Act = {
  id: 'shl06-kiang',
  w: 30,
  advice: 'A bamboo guide stands in the path. Every guide you touch grows a root, and this one grows straight across the path at head height a moment after you touch it. Hop over the guide; do not walk into it.',
  cps: [1],
  paint: () => {},
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.shl6b = st;
    const pole = px(c.x + 12);
    w.add(
      new Rig(pole, FL - 14, 4, 14, {
        layer: 3,
        tick: (r, w2) => {
          const p = w2.player;
          const over = p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y;
          if (over && st.t0 < 0) {
            st.t0 = w2.tick;
            w2.sfx('snap', r.x, FL);
          }
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, 3, r.h, '#B9A25A');
          box(ctx, r.x - 2, r.y, 7, 2, '#B9A25A');
        },
      }),
    );
    // the root it grows: across the path ahead at head height, within a second
    w.add(
      new Rig(pole + 8, FL - 30, px(4), 22, {
        layer: 3,
        cause: 'shl-jri',
        inset: 2,
        live: (_r, w2) => st.t0 >= 0 && w2.tick - st.t0 >= 30,
        paint: (ctx, r, w2) => {
          if (st.t0 < 0) return;
          const k = Math.min(1, (w2.tick - st.t0) / 30);
          box(ctx, r.x, r.y + 4, Math.round(r.w * k), 5, '#6B4A2B');
          box(ctx, r.x, r.y + 9, Math.round(r.w * k), 2, '#4E3520');
          for (let x = r.x + 4; x < r.x + r.w * k; x += 12) box(ctx, x, r.y + 1, 4, 3, '#4E8A3E');
        },
      }),
    );
    sign(w, c.x + 2, 10.4, 3, 'MIND IT', 'shop', null, 'a guide in the path');
  },
};

/** ending: the door is on a ledge across a last gorge, reached only by a root: jump at the one guide, wait, walk */
export const ending: Ending = {
  space: 16,
  advice: 'The door stands on a ledge across one last gorge, and one guide hangs at the edge: jump at it, wait for the root to reach the ledge, then walk across.',
  paint: (g, D) => {
    g.fill(D - 10, D - 2, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const set: RootSet = { chosen: -1, roots: [], t0: -1 };
    w.flags.shl6e = set;
    w.flags.twist = 'rootdoor';
    gorge(w, D - 10, D - 2);
    set.roots.push(root(w, px(D - 10), FL, px(9), 3.0, () => (set.chosen === 0 ? set.t0 : -1)));
    guide(w, set, 0, D - 12, 'door');
  },
};

export const meta06 = { family: 'choose-guide-root-grows', betrayals: ['choose-grow'], ending: 'shl-rootdoor' };
