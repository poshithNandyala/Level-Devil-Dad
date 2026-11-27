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
        guideArt(ctx, rr.x + 11, FL, dead, label);
      },
    }),
  );
}

/** a guide's bamboo: a pole planted in the ground at x, leaning, with the young root's tip hanging from its top (QA F12: nothing floats) */
export function guideArt(ctx: CanvasRenderingContext2D, x: number, ground: number, dead: boolean, label: string) {
  const c = dead ? '#6B6B5A' : '#B9A25A';
  // the pole from the ground to the hook height, with a cross-piece and a lashing at the foot
  box(ctx, x, ground - 96, 2, 96, c);
  box(ctx, x - 5, ground - 58, 12, 3, c);
  box(ctx, x - 3, ground - 6, 8, 6, '#6B4A2B');
  box(ctx, x - 2, ground - 10, 6, 4, c);
  // the young root's tip hanging from the cross-piece
  box(ctx, x - 1, ground - 55, 4, 8, dead ? '#5A4A3A' : '#6B4A2B');
  ctx.fillStyle = '#F4F7F2';
  ctx.font = '7px monospace';
  ctx.fillText(label, x - 9, ground - 98);
}

/** the gorge under cols c0..c1: the fall is a death with its own line (`cause` names the place: one line per place) */
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

export function gorge(w: World, c0: number, c1: number, cause = 'shl-gorge') {
  w.add(
    new Rig(px(c0), FL + 28, px(c1 - c0 + 1), 30, {
      layer: 0,
      cause,
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
          paint: (ctx, rr) => guideArt(ctx, rr.x + 11, FL - 32, set.chosen >= 0 && set.chosen !== 2, 'long'),
        }),
      );
      onPass(w, px(2.5), (w2) => tara(w2, L.intro[4], 2.2));
      sign(w, 10.5, 10.2, 3.4, 'NONGRIAT', 'shop', null, 'living root bridges');
      rival(w, 29, 15, -1, taraScript(6));
      collectible(w, 'shl-pumaloi', 18, 9.4);
    },
  };
}

// `shl06-sprout` (stand on the tip of the root you grew and it sprouts the next span) was cut in fix round 1: QA F4, one
// play and no second trap of its own that is not the gorge again.

/** act: two guides in the path: a standing one that grows a root across the path when touched (hop it), and a hanging one that grows a root down into the path when hopped into (walk under it) */
export const actPole: Act = {
  id: 'shl06-kiang',
  w: 34,
  advice: 'Two guides stand in the path, and every guide you touch grows a root. The first stands on the ground: walk into it and its root grows across the path at head height, so hop over it. The second hangs from a pole over the path at jump height: hop into it and its root grows down into the path, so walk under it. Hop the one, walk under the other.',
  cps: [1],
  paint: () => {},
  build: (w, c) => {
    const st = { t0: -1, t1: -1 };
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
          box(ctx, r.x - 2, FL - 4, 7, 4, '#6B4A2B');
        },
      }),
    );
    // the standing guide's root: across the path ahead at head height, within a second
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
    // the hanging guide: its tip hangs 2 tiles up from a pole planted beside the path; a hop into it grows a root down into the path
    const hx = px(c.x + 22);
    w.add(
      new Rig(hx - 4, FL - 46, 14, 16, {
        layer: 3,
        tick: (r, w2) => {
          const p = w2.player;
          const over = p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y;
          if (over && st.t1 < 0) {
            st.t1 = w2.tick;
            w2.sfx('snap', r.x, r.y);
          }
        },
        paint: (ctx, r) => {
          // the pole beside the path, its arm over the path, the root's tip hanging from the arm
          box(ctx, hx + 20, FL - 70, 3, 70, '#B9A25A');
          box(ctx, hx - 4, FL - 70, 27, 3, '#B9A25A');
          box(ctx, hx + 18, FL - 6, 7, 6, '#6B4A2B');
          box(ctx, r.x + 5, FL - 67, 2, 22, '#B9A25A');
          box(ctx, r.x + 4, r.y, 4, 8, st.t1 >= 0 ? '#C8D86B' : '#6B4A2B');
        },
      }),
    );
    // the hanging guide's root: down to the floor and along the path ahead
    w.add(
      new Rig(hx + 4, FL - 46, px(3), 46, {
        layer: 3,
        cause: 'shl-jri-hang',
        inset: 2,
        live: (_r, w2) => st.t1 >= 0 && w2.tick - st.t1 >= 30,
        paint: (ctx, r, w2) => {
          if (st.t1 < 0) return;
          const k = Math.min(1, (w2.tick - st.t1) / 30);
          box(ctx, r.x, r.y, 5, Math.round(r.h * k), '#6B4A2B');
          box(ctx, r.x + 5, r.y, 2, Math.round(r.h * k), '#4E3520');
          for (let y = r.y + 6; y < r.y + r.h * k; y += 12) box(ctx, r.x + 7, y, 3, 4, '#4E8A3E');
        },
      }),
    );
    sign(w, c.x + 2, 10.4, 3, 'MIND THEM', 'shop', null, 'two guides in the path');
  },
};

/** act 2: a gorge too wide for one root: the near guide's root stops half way; the far guide hangs over its tip. Near first, then far. */
export const actDouble: Act = {
  id: 'shl06-double',
  w: 40,
  advice: 'This gorge is too wide for one root. The guide on your bank grows a root that stops half way; a second guide hangs over where that root ends, and grows one from the far bank to meet it. Near first: grow it, walk out to its tip, jump at the far guide, wait, walk on. A root grown out of order grows high, into your path.',
  cps: [1],
  paint: (g, c) => {
    g.fill(c.x + 10, c.x + 31, 15, 17, '.');
    g.fill(c.x + 7, c.x + 8, 13, 14, '#');
  },
  build: (w, c) => {
    const st = { near: -1, far: -1 };
    w.flags.shl6c = st;
    gorge(w, c.x + 10, c.x + 31, 'shl-double');
    // the near root: ten tiles out from the bank, at floor level if it is the first chosen; at head height if the far one came first
    root(w, px(c.x + 10), FL, px(11), 3.5, () => ((st.near >= 0 && st.far < 0) || (st.near >= 0 && st.near < st.far) ? st.near : -1));
    w.add(
      new Rig(px(c.x + 10), FL - 30, px(11), 18, {
        layer: 3,
        cause: 'shl-double-high',
        inset: 2,
        live: (_r, w2) => st.near >= 0 && st.far >= 0 && st.far < st.near && w2.tick - st.near >= 40,
        paint: (ctx, r, w2) => {
          if (!(st.near >= 0 && st.far >= 0 && st.far < st.near)) return;
          const k = Math.min(1, (w2.tick - st.near) / 240);
          box(ctx, r.x, r.y + 4, Math.round(r.w * k), 5, '#6B4A2B');
          box(ctx, r.x, r.y + 9, Math.round(r.w * k), 2, '#4E3520');
        },
      }),
    );
    // the far root grows from the far bank leftwards to meet the near one
    root(w, px(c.x + 32), FL, px(11), 3.5, () => st.far, { left: true });
    // the near guide stands on the bank; the far guide hangs over the near root's tip from a pole on the far bank, and over the high rock by the edge
    const hang = (cx: number, y: number, pick: () => void, chosen: () => boolean, label: string, poleFrom: number) =>
      w.add(
        new Rig(px(cx) - 2, y - 56, 24, 20, {
          layer: 3,
          tick: (rr, w2) => {
            const p = w2.player;
            const over = p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y < rr.y + rr.h && p.y + p.h > rr.y;
            if (over && !chosen()) {
              pick();
              w2.sfx('snap', rr.x, rr.y);
            }
          },
          paint: (ctx, rr) => {
            const col = chosen() ? '#6B6B5A' : '#B9A25A';
            if (poleFrom === cx) guideArt(ctx, rr.x + 11, y, chosen(), label);
            else {
              // a long bamboo from the far bank, its tip over the water, the root's tip hanging from it
              ctx.strokeStyle = col;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(px(poleFrom) + 8, FL - 2);
              ctx.lineTo(rr.x + 12, y - 58);
              ctx.stroke();
              box(ctx, px(poleFrom) + 4, FL - 6, 9, 6, '#6B4A2B');
              box(ctx, rr.x + 10, y - 55, 4, 8, '#6B4A2B');
              ctx.fillStyle = '#F4F7F2';
              ctx.font = '7px monospace';
              ctx.fillText(label, rr.x + 2, y - 62);
            }
          },
        }),
      );
    hang(c.x + 4, FL, () => (st.near = w.tick), () => st.near >= 0, 'near', c.x + 4);
    hang(c.x + 20, FL, () => (st.far = w.tick), () => st.far >= 0, 'far', c.x + 33);
    // the high rock by the edge reaches the far guide's tip too (out of order)
    hang(c.x + 7.5, FL - 32, () => (st.far = w.tick), () => st.far >= 0, 'far', c.x + 33);
    sign(w, c.x + 1, 10.4, 3, 'TWO ROOTS', 'shop', null, 'near first, then far');
  },
};

/** the plain door of 06 lives in endings.ts (QA F2: the root door re-asked the room's rule) */
export const ending: Ending | null = null;

export const meta06 = { family: 'choose-guide-root-grows', betrayals: ['choose-grow'], ending: 'shl-rootdoor' };
