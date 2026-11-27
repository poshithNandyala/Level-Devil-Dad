// KOH-06 Chaal-Chaal: the stacked roofs of Bara Basti. The lane has fallen away and the way is over the roofs. A thatch
// roof is silent; a tin roof RINGS under a step, and the household below bangs the attic hatch open a moment later,
// through whoever stands on it. So cross thatch to thatch and jump the tin. Acts: the thatch roofs have chimneys, and a
// chimney's puff is warm air that lifts you into the tin eave above (cross between puffs); then the only way up is a
// chimney's lift on to a tin roof: it is a stepping stone, be off it before the hatch.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box } from './entities';
import { FL, cyc, ditch, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export type RoofKind = 'thatch' | 'tin';
export interface Roof {
  rig: Rig;
  kind: RoofKind;
  /** tick the tin first rang (-1: quiet) */
  ringT: number;
}

/** the gully between the houses: deadly */
export const gully = (w: World, c0: number, c1: number) => ditch(w, px(c0), px(c1), 'koh-gira', FL + 8, ['rgba(70,60,50,0.95)', 'rgba(30,24,18,0.98)']);

/**
 * a roof: x px, width px, top y. Thatch is silent. Tin rings under a step; `bang` seconds later the household bangs the
 * attic hatch open (deadly over the whole roof for 0.35 s); it is quiet again 2.5 s after Dad leaves.
 */
export function roof(w: World, x: number, wd: number, y: number, kind: RoofKind, key: string, o: { bang?: number; eave?: number; empty?: boolean } = {}): Roof {
  const st: Roof = { rig: null as any, kind, ringT: -1 };
  const bang = o.bang ?? 0.3;
  const rig = w.add(
    new Rig(x, y, wd, 8, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        if (kind !== 'tin') return;
        const on = w2.standing(r.solid!);
        if (on && st.ringT < 0) {
          st.ringT = w2.tick;
          w2.sfx('bell', r.x + r.w / 2, r.y - 10);
          w2.say('TANG! | TANG!', r.x + r.w / 2, r.y - 16, 0.5, 'npc');
        }
        if (!on && st.ringT >= 0 && since(w2, st.ringT) > 2.5) st.ringT = -1;
        r.s.left = st.ringT < 0 ? 0 : st.ringT;
      },
      paint: (ctx, r, w2) => {
        if (kind === 'thatch') {
          box(ctx, r.x, r.y, r.w, r.h, '#B8A05A');
          box(ctx, r.x, r.y, r.w, 2, '#D8C27A');
          ctx.fillStyle = '#8A7232';
          for (let k = 3; k < r.w - 3; k += 7) ctx.fillRect(r.x + k, r.y + 3, 1, 4);
          box(ctx, r.x + 2, r.y + r.h, r.w - 4, FL + 10 - (r.y + r.h), '#6E4F3A');
          return;
        }
        const t = st.ringT < 0 ? 99 : since(w2, st.ringT);
        const shake = t < 0.3 ? (w2.tick % 2 ? 1 : -1) : 0;
        box(ctx, r.x + shake, r.y, r.w, r.h, '#9AA3A8');
        box(ctx, r.x + shake, r.y, r.w, 2, '#D4DADF');
        ctx.fillStyle = '#6B747A';
        for (let k = 4; k < r.w - 2; k += 8) ctx.fillRect(r.x + k + shake, r.y + 2, 1, r.h - 2);
        box(ctx, r.x + 2, r.y + r.h, r.w - 4, FL + 10 - (r.y + r.h), '#7A6A5A');
        // the hatch: a dark square on the roof, flung open while the household bangs it
        const open = !o.empty && t >= bang && t < bang + 0.35;
        box(ctx, r.x + r.w / 2 - 6, r.y - (open ? 14 : 1), 12, open ? 14 : 2, '#3A2A1E');
        if (t < 0.3) {
          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(r.x + r.w / 2, r.y, 8 + t * 40, Math.PI, 0);
          ctx.stroke();
        }
      },
    }),
  );
  st.rig = rig;
  if (kind === 'tin' && !o.empty) {
    w.add(
      new Rig(x, y - 14, wd, 16, {
        layer: 3,
        cause: 'koh-khatkhat',
        inset: 0,
        live: (_r, w2) => st.ringT >= 0 && since(w2, st.ringT) >= bang && since(w2, st.ringT) < bang + 0.35,
        paint: () => {},
      }),
    );
  }
  if (kind === 'tin') {
    // the storey above overhangs the tin: its eave hangs `eave` px over the roof, so hop the tin low
    const eave = o.eave ?? 80;
    w.add(
      new Rig(x - 4, y - eave - 8, wd + 8, 8, {
        layer: 3,
        cause: 'koh-chhajja',
        inset: 0,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#8E979C');
          box(ctx, r.x, r.y + r.h - 2, r.w, 2, '#5C6468');
          box(ctx, r.x + 4, r.y - 10, r.w - 8, 10, '#7A6A5A');
        },
      }),
    );
  }
  w.flags[key] = st;
  return st;
}

/**
 * a chimney on a thatch roof at x (px), roof top y: puffs on a cycle (`period`, puff `on` s, offset `phase`); the puff is
 * warm air that lifts whoever is in it `lift` px above the roof. `eave`: a tin eave that height above the roof is deadly.
 */
export function chimney(w: World, x: number, y: number, key: string, o: { period: number; on: number; phase?: number; lift: number; eave?: boolean }) {
  const st = { on: false };
  w.flags[key] = st;
  w.add(
    new Rig(x - 12, y - o.lift, 24, o.lift, {
      layer: 1,
      tick: (r, w2) => {
        const t = cyc(w2, o.period, o.phase ?? 0);
        st.on = t < o.on;
        r.s.on = st.on;
        const p = w2.player;
        if (st.on && p.cx > r.x + 2 && p.cx < r.x + r.w - 2 && p.y + p.h > r.y && p.y < y + 4) {
          // the warm air holds him over the stack and carries him up
          p.vy = Math.min(p.vy, -190);
          p.vx = 0;
          p.x += (x - p.cx) * 0.25;
          p.onGround = false;
          p.coyoteT = 0;
          p.launched = true;
        }
      },
      paint: (ctx, r, w2) => {
        // the chimney stack and its smoke
        box(ctx, x - 5, y - 14, 10, 16, '#5D4037');
        box(ctx, x - 6, y - 16, 12, 3, '#3E2723');
        if (st.on) {
          ctx.fillStyle = 'rgba(230,230,220,0.55)';
          for (let k = 0; k < 4; k++) {
            const yy = y - 20 - ((w2.tick * 1.2 + k * 11) % (o.lift - 6));
            ctx.beginPath();
            ctx.arc(x + Math.sin((w2.tick + k * 30) / 20) * 3, yy, 4 + k, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillStyle = 'rgba(230,230,220,0.25)';
          ctx.beginPath();
          ctx.arc(x, y - 20, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        void r;
      },
    }),
  );
  if (o.eave) {
    w.add(
      new Rig(x - 22, y - o.lift - 6, 44, 8, {
        layer: 3,
        cause: 'koh-garam',
        inset: 0,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#9AA3A8');
          box(ctx, r.x, r.y + r.h - 2, r.w, 2, '#6B747A');
        },
      }),
    );
  }
  return st;
}

const Y1 = FL - 48;

export function room(): LevelDef {
  return {
    id: 'KOH-06',
    city: 'KOH',
    index: 6,
    name: 'Chaal-Chaal',
    nameEn: 'The stacked roofs',
    tagline: 'The lane fell away. The roofs are the road.',
    hint: 'Thatch is silent. A tin roof rings under your step, and the household bangs the attic hatch open a moment later, through whoever is standing on it. Cross thatch to thatch and hop the tin (not too high: the storey above hangs its eave over every tin roof). The chimney on the middle roof puffs warm air that lifts you into the eave: walk through it between puffs.',
    par: 36,
    map: Grid.ground(15).fill(5, 26, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      gully(w, 5, 27);
      roof(w, px(5), 64, Y1, 'thatch', 'koh6a');
      roof(w, px(9) + 8, 40, Y1, 'tin', 'koh6b');
      roof(w, px(12) + 8, 80, Y1, 'thatch', 'koh6c');
      chimney(w, px(15) + 8, Y1, 'koh6c1', { period: 2.2, on: 0.9, phase: 1.35, lift: 44, eave: true });
      roof(w, px(18), 40, Y1, 'tin', 'koh6d');
      roof(w, px(21), 96, Y1, 'thatch', 'koh6e');
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[0], 2.4);
          },
        }),
      );
      w.when(
        (w2) => w2.player.cx > px(6),
        (w2) => w2.guide(NPC.rasta),
      );
      sign(w, 2, 10.4, 3.4, 'BARA BASTI', 'shop', null, 'the roofs');
      rival(w, 28, 15, -1, taraScript(6));
      collectible(w, 'koh-shawl', 15, 8.6);
    },
  };
}

/** the chimneys: each thatch roof has one, puffing on its own beat; the puff is a lift into the tin eave above */
export const actDhuan: Act = {
  id: 'koh06-dhuan',
  w: 33,
  advice: 'These thatch roofs have chimneys, and a chimney’s puff is warm air that lifts you into the tin eave above. The smoke shows the puff: walk through each chimney between puffs, never jump near one, and hop the tin as before.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 30, 15, 17, '.');
  },
  build: (w, c) => {
    gully(w, c.x + 6, c.x + 31);
    roof(w, px(c.x + 6), 96, Y1, 'thatch', 'koh6f');
    chimney(w, px(c.x + 9), Y1, 'koh6f1', { period: 2.2, on: 0.9, phase: 0, lift: 44, eave: true });
    roof(w, px(c.x + 12) + 8, 48, Y1, 'tin', 'koh6g');
    roof(w, px(c.x + 16), 112, Y1, 'thatch', 'koh6h');
    chimney(w, px(c.x + 18) + 8, Y1, 'koh6h1', { period: 2.2, on: 0.9, phase: 1.1, lift: 44, eave: true });
    chimney(w, px(c.x + 21) + 8, Y1, 'koh6h2', { period: 2.2, on: 0.9, phase: 0.4, lift: 44, eave: true });
    roof(w, px(c.x + 23) + 8, 48, Y1, 'tin', 'koh6i');
    roof(w, px(c.x + 27), 64, Y1, 'thatch', 'koh6j');
    w.when(
      (w2) => w2.player.cx > px(c.x + 5),
      (w2) => w2.guide(NPC.cold),
    );
    sign(w, c.x + 2, 10.4, 3, 'DHUAN', 'shop', null, 'smoke');
  },
};

/** the way up: the top roof is a tin roof you can only reach on a chimney's lift, so the tin is a stepping stone: off it before the hatch */
export const actUpar: Act = {
  id: 'koh06-upar',
  w: 31,
  advice: 'The top roof is too high to jump to, and the only way up is a chimney’s lift: it sets you down on tin. Tin is a stepping stone, not a floor: jump off it on to the thatch before the hatch bangs.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 28, 15, 17, '.');
  },
  build: (w, c) => {
    gully(w, c.x + 6, c.x + 29);
    const Y2 = Y1 - 56;
    roof(w, px(c.x + 6), 80, Y1, 'thatch', 'koh6k');
    chimney(w, px(c.x + 8), Y1, 'koh6k1', { period: 2.0, on: 1.0, phase: 0, lift: 62 });
    // the upper row: tin where the lift sets you down (its edge just right of the column), thatch beyond it, a tin step and the last thatch
    roof(w, px(c.x + 9), 56, Y2, 'tin', 'koh6l', { bang: 0.6, eave: 84 });
    roof(w, px(c.x + 13), 80, Y2, 'thatch', 'koh6m');
    roof(w, px(c.x + 18) + 8, 48, Y2, 'tin', 'koh6n', { bang: 0.6, eave: 84 });
    roof(w, px(c.x + 22), 64, Y2, 'thatch', 'koh6o');
    // a thatch roof below the end to come down on
    roof(w, px(c.x + 26), 48, Y1, 'thatch', 'koh6p');
    w.when(
      (w2) => w2.player.cx > px(c.x + 5),
      (w2) => w2.guide(NPC.loghat),
    );
    sign(w, c.x + 2, 10.4, 3, 'UPAR', 'shop', null, 'up');
  },
};

export const ending: Ending = {
  space: 16,
  advice: 'The door is on the top roof, past its skylight. The skylight is glass: it holds a walker and breaks under a landing. Walk over it; never land on it.',
  paint: (g, D) => {
    g.fill(D - 8, D - 1, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'skylight';
    // the door stands on the roof, not in the gully
    d.y = Y1 - 32;
    gully(w, D - 8, D);
    roof(w, px(D - 8), 64, Y1, 'thatch', 'koh6q');
    // the skylight: a glass pane flush with the roof, then more thatch to the door
    const st = { wasAir: false, broken: false };
    w.flags.koh6sky = st;
    const pane = w.add(
      new Rig(px(D - 4), Y1, 32, 8, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const p = w2.player;
          const on = w2.standing(r.solid!);
          if (on && st.wasAir && !st.broken) {
            st.broken = true;
            w2.sfx('crack', r.x + 16, r.y);
            r.setSolid(false);
          }
          st.wasAir = !p.onGround;
          r.s.broken = st.broken;
        },
        paint: (ctx, r) => {
          if (st.broken) {
            box(ctx, r.x, r.y, r.w, 3, '#5D4037');
            return;
          }
          box(ctx, r.x, r.y, r.w, r.h, 'rgba(180,210,230,0.85)');
          box(ctx, r.x, r.y, r.w, 1, '#FFFFFF');
          box(ctx, r.x + r.w / 2 - 1, r.y, 2, r.h, '#5D4037');
        },
      }),
    );
    void pane;
    w.add(
      new Rig(px(D - 4), Y1 + 8, 32, 40, {
        layer: 1,
        cause: 'koh-kanch',
        inset: 0,
        live: () => st.broken,
        paint: () => {},
      }),
    );
    roof(w, px(D - 2), px(D + 2) - px(D - 2), Y1, 'thatch', 'koh6r');
    w.add(
      new Paint((ctx) => {
        box(ctx, px(D) - 6, Y1 - 28, 28, 28, '#6E4F3A');
      }, -2),
    );
  },
};

export const meta06 = { family: 'sloped-noisy-tin-roofs', betrayals: ['noisy-floor'], ending: 'koh-skylight' };
