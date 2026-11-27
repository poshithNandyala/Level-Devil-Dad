// KOH-03 Bans Jhula: the bamboo seesaw at the games ground. A plank on a post spans the pit; its far end rests on the
// far bank, where a bamboo gate bars the way, and Kewhi (the helper) stands on the far end. The near end is held level
// by a wedge that pops the moment anything LANDS on it: the landing throws Kewhi up, and the near half is loose from
// then on (stand on it and it sinks into the pit). Land on the very tip and Kewhi reaches the ledge and lifts the
// gate's bar; land nearer the post and he is thrown short, comes down on the plank, and it kicks off whoever is on
// it. Act: Kewhi on the wrong (near) end, the far end propped on a stone: the throw needs a running jump on to the
// far tip.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, ditch, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export interface Seesaw {
  near: Rig;
  far: Rig;
  gate: Rig;
  /** the near half is loose (the wedge has popped) */
  popped: boolean;
  popT: number;
  open: boolean;
  helper: { side: -1 | 1; x: number; y: number; flying: boolean; t0: number; h: number; gone: boolean; full: boolean };
  /** the landing distance from the post, tiles (for the tests) */
  d: number;
  slamT: number;
  lastLand: number;
}

/**
 * a seesaw over the pit columns c0..c0+2*half-1 (the plank is 2*half tiles, the post in the middle); the helper stands
 * on `side` (1 far, -1 near); in the act (`wedge: false`) the near half is loose from the start and the far end is
 * propped; the gate stands at the far bank and the ledge is at `ledge` (px). A landing at least `full` tiles from
 * the post is a full throw.
 */
export function seesaw(w: World, c0: number, half: number, side: 1 | -1, key: string, o: { wedge: boolean; ledge: [number, number]; full: number }): Seesaw {
  const x0 = px(c0);
  const mid = x0 + px(half);
  const xEnd = mid + px(half);
  const st: Seesaw = {
    near: null as any,
    far: null as any,
    gate: null as any,
    popped: !o.wedge,
    popT: -1,
    open: false,
    helper: { side, x: side > 0 ? xEnd - 12 : x0 + 12, y: FL - 4 - 26, flying: false, t0: 0, h: 0, gone: false, full: false },
    d: -1,
    slamT: -1,
    lastLand: -999,
  };
  ditch(w, x0 - 6, xEnd + 6, 'koh-khad', FL + 22);
  const plank = (ctx: CanvasRenderingContext2D, r: Rig, lift = 0) => {
    box(ctx, r.x, r.y - lift, r.w, 5, '#C9B870');
    box(ctx, r.x, r.y - lift, r.w, 1.5, '#E6D898');
    box(ctx, r.x, r.y - lift + 5, r.w, 1, '#8A7A3A');
  };
  st.near = w.add(
    new Rig(x0, FL - 4, px(half), 6, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        // loose and loaded: it sinks into the pit (after a creak)
        const loaded = w2.standing(r.solid!);
        if (st.popped && loaded && r.s.t0 === undefined) r.s.t0 = w2.tick;
        if (!loaded && r.y <= FL - 4) r.s.t0 = undefined;
        const sinking = st.popped && r.s.t0 !== undefined && since(w2, r.s.t0) >= 0.6;
        const target = sinking ? FL + 44 : FL - 4;
        const ny = r.y < target ? Math.min(target, r.y + 60 / 120) : Math.max(target, r.y - 120 / 120);
        if (ny !== r.y) r.moveTo(w2, r.x, ny);
      },
      paint: (ctx, r, w2) => plank(ctx, r, st.slamT >= 0 && since(w2, st.slamT) < 0.5 && st.helper.side > 0 ? 18 : 0),
    }),
  );
  st.far = w.add(
    new Rig(mid, FL - 4, px(half), 6, {
      solid: true,
      layer: 2,
      paint: (ctx, r, w2) => plank(ctx, r, st.slamT >= 0 && since(w2, st.slamT) < 0.5 && st.helper.side < 0 ? 18 : 0),
    }),
  );
  // the thorn gate: a hedge of cut thorn bundles on a bar; deadly until Kewhi lifts the bar from the ledge
  st.gate = w.add(
    new Rig(xEnd + 2, FL - 44, 10, 44, {
      layer: 2,
      cause: 'koh-kanta',
      inset: 1,
      live: () => !st.open,
      paint: (ctx, r) => {
        box(ctx, r.x + 3, FL - 50, 4, 50, '#5D4037');
        if (st.open) {
          box(ctx, r.x - 2, FL - 56, 14, 5, '#C9B870');
          return;
        }
        for (let k = 0; k < 4; k++) {
          box(ctx, r.x - 2, r.y + 2 + k * 11, 14, 4, '#C9B870');
          ctx.fillStyle = '#2B1A12';
          for (let s = 0; s < 14; s += 3) ctx.fillRect(r.x - 2 + s, r.y + k * 11, 1, 3);
        }
      },
    }),
  );
  w.flags[key] = st;
  // the post, the wedge, the stone and the ledge
  w.add(
    new Paint((ctx) => {
      box(ctx, mid - 3, FL - 2, 6, 26, '#5D4037');
      box(ctx, mid - 8, FL - 4, 16, 3, '#4E342E');
      if (o.wedge && !st.popped) box(ctx, x0 + 2, FL + 2, 8, 6, '#7D7D72');
      if (!o.wedge) box(ctx, xEnd - 14, FL + 2, 12, 16, '#7D7D72');
      box(ctx, o.ledge[0], o.ledge[1], 48, 6, '#6D4C41');
      box(ctx, o.ledge[0], o.ledge[1], 48, 2, '#A1887F');
    }, -1),
  );
  // the helper
  w.add(
    new Paint((ctx, w2) => {
      const h = st.helper;
      if (h.flying) {
        const t = since(w2, h.t0);
        const T = h.full ? 0.9 : 1.0;
        const k = Math.min(1, t / T);
        const up = 4 * k * (1 - k) * h.h + (h.full ? k * (h.y - (o.ledge[1] - 26)) : 0);
        const sx = h.full ? h.x + (o.ledge[0] + 24 - h.x) * k : h.x;
        folk(ctx, sx, h.y - up, 26, '#C0392B');
      } else folk(ctx, h.x, h.y, 26, '#C0392B');
    }, 3),
  );
  w.onTick((w2) => {
    const p = w2.player;
    const h = st.helper;
    const onNear = w2.standing(st.near.solid!);
    const onFar = w2.standing(st.far.solid!);
    // a landing on the plank pops the wedge; a landing on the half opposite the helper throws him, higher the farther from the post
    // (entities run before the player, and the ground is only known on the next tick, so the landing is seen two ticks late)
    const landed = w2.tick - p.landTick <= 2 && st.lastLand !== p.landTick;
    if (landed && (onNear || onFar)) {
      st.lastLand = p.landTick;
      if (!st.popped) {
        st.popped = true;
        st.popT = w2.tick;
        w2.sfx('click', x0, FL);
      }
      if (!h.flying && !h.gone && (p.cx < mid ? -1 : 1) !== h.side) {
        const d = Math.abs(p.cx - mid) / 16;
        st.d = d;
        h.flying = true;
        h.t0 = w2.tick;
        h.full = d >= o.full;
        h.h = h.full ? 40 : 18 + d * 12;
        w2.sfx('boing', mid, FL - 20);
      }
    }
    if (h.flying) {
      const t = since(w2, h.t0);
      if (h.full && t >= 0.9) {
        h.flying = false;
        h.gone = true;
        h.x = o.ledge[0] + 24;
        h.y = o.ledge[1] - 26;
        st.open = true;
        w2.sfx('click', xEnd, FL - 40);
        w2.guide(NPC.loghat);
      } else if (!h.full && t >= 1.0) {
        // came down on his end: the plank slams, and whoever is on it is kicked off
        h.flying = false;
        st.slamT = w2.tick;
        w2.sfx('thud', h.x, FL);
        if (onNear || onFar) w2.die('koh-patak');
      }
    }
  });
  return st;
}

export function room(): LevelDef {
  return {
    id: 'KOH-03',
    city: 'KOH',
    index: 3,
    name: 'Bans Jhula',
    nameEn: 'The bamboo seesaw',
    tagline: 'A plank, a post, a pit, a thorn gate, and a boy on the far end.',
    hint: 'The plank over the pit is a seesaw and the gate on the far bank is barred with thorns: do not run into it. Kewhi on the far end is the one who must fly: jump and land on the very tip of the near end and he is thrown up to the ledge, where he lifts the bar. Then run across: the landing loosened the near half, and it sinks under anyone who stays on it. Land nearer the post and he is thrown short: he comes down on the plank and it kicks you off.',
    par: 30,
    map: Grid.ground(15).fill(9, 16, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      seesaw(w, 9, 4, 1, 'koh3', { wedge: true, ledge: [px(18), FL - 76], full: 2.4 });
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[1], 2.4);
          },
        }),
      );
      sign(w, 2, 10.4, 3.4, 'BANS JHULA', 'shop', null, 'seesaw');
      rival(w, 27, 15, -1, taraScript(3));
      collectible(w, 'koh-chutney', 13, 9.6);
    },
  };
}

/** the wrong end: Kewhi stands on the near end and a stone props the far end, so the throw needs a running jump on to the far tip */
export const actUlta: Act = {
  id: 'koh03-ulta',
  w: 30,
  advice: 'This seesaw has Kewhi on the near end and a stone under the far end, and the near half is loose: land beside him and it sinks with you. Take a running jump from the edge of the bank and land on the far tip: he flies to the ledge and lifts the bar. Land short of the tip and he comes down on the plank and it kicks you off.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 6 + 4, 15, 17, '.');
  },
  build: (w, c) => {
    seesaw(w, c.x + 6, 3, -1, 'koh3b', { wedge: false, ledge: [px(c.x + 1), FL - 76], full: 1.3 });
    sign(w, c.x + 1, 10.4, 3, 'ULTA', 'shop', null, 'wrong end');
  },
};

export const ending: Ending = {
  space: 14,
  advice: 'The door stands on the far half of one more plank, propped at the door’s end. The near half is loose: step on it and it dips you into the pit. Jump the near half and land on the far one.',
  paint: (g, D) => {
    g.fill(D - 9, D - 1, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const x0 = px(D - 9);
    ditch(w, x0 - 6, px(D) + 6, 'koh-khad', FL + 22);
    w.flags.twist = 'loose-plank';
    const near = w.add(
      new Rig(x0, FL - 4, 48, 6, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          if (w2.standing(r.solid!)) r.s.down = true;
          const target = r.s.down ? FL + 44 : FL - 4;
          const ny = r.y < target ? Math.min(target, r.y + 220 / 120) : r.y;
          if (ny !== r.y) r.moveTo(w2, r.x, ny);
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, 5, '#C9B870');
          box(ctx, r.x, r.y + 5, r.w, 1, '#8A7A3A');
        },
      }),
    );
    w.flags.koh3e = near;
    w.add(
      new Rig(x0 + 48, FL - 4, px(6), 6, {
        solid: true,
        layer: 2,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, 5, '#C9B870');
          box(ctx, r.x, r.y + 5, r.w, 1, '#8A7A3A');
          box(ctx, x0 + 48 - 3, FL - 2, 6, 26, '#5D4037');
          box(ctx, r.x + r.w - 14, FL, 12, 18, '#7D7D72');
        },
      }),
    );
    d.follow = () => ({ x: px(D) - 20, y: FL - 4 - 32 });
  },
};

export const meta03 = { family: 'helper-launched-by-your-jump', betrayals: ['helper-launched'], ending: 'koh-dhila-patta' };
