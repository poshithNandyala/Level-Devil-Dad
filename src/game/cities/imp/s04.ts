// IMP-04 Thambal: lotus leaves on the lake, each with a cluster of dew beads resting at one rim. A leaf tilts
// toward whoever lands on it, and the beads roll downhill: land on the EMPTY half and they roll across the leaf
// into you; land at the rim beyond the beads and they roll over you on their way off; land on the beads' half,
// inside them, and the leaf tips their way and the beads roll off the rim away from you.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { FL, lake, since, taraScript } from './common';
import { lines as L } from './lines';

export const LEAF = { w: 5, tilt: 0.25, speed: 120, beadIn: 0.8 };

export interface LeafState {
  /** rest side of the beads: -1 left rim, 1 right rim, 0 both rims */
  side: -1 | 0 | 1;
  /** tick Dad landed (-1: nobody on it yet) */
  t0: number;
  /** which way the leaf tipped: sign of Dad's offset from the centre */
  tip: number;
  /** the beads: x offsets from the leaf centre (px), gone once off the rim */
  beads: { x: number; gone: boolean }[];
  cx: number;
}

/** a lotus leaf whose left column is c0 (5 tiles wide), floating at ground level, beads resting at `side` */
export function leaf(w: World, key: string, c0: number, side: LeafState['side'], wTiles = LEAF.w) {
  const wd = px(wTiles);
  const cx = px(c0) + wd / 2;
  const rim = wd / 2 - 6;
  const st: LeafState = { side, t0: -1, tip: 0, cx, beads: (side === 0 ? [-1, 1] : [side]).map((s) => ({ x: s * (rim - px(LEAF.beadIn)), gone: false })) };
  const all = (w.flags[key] ??= []) as LeafState[];
  all.push(st);
  const plate = w.add(
    new Rig(px(c0), FL - 4, wd, 8, {
      layer: 1,
      solid: true,
      tick: (r, w2) => {
        const p = w2.player;
        const on = w2.standing(r.solid!);
        if (on && st.t0 < 0) {
          st.t0 = w2.tick;
          st.tip = Math.sign(p.x + p.w / 2 - cx) || 1;
        }
        if (!on && st.t0 >= 0 && st.beads.every((b) => b.gone || Math.abs(b.x) > rim + 40)) {
          // nobody on it and the beads are off: the leaf settles and new dew gathers at the rest rim
          st.t0 = -1;
          st.tip = 0;
          st.beads.forEach((b, i) => {
            b.gone = false;
            b.x = (st.side === 0 ? [-1, 1][i] : st.side) * (rim - px(LEAF.beadIn));
          });
        }
        if (st.t0 >= 0 && since(w2, st.t0) >= LEAF.tilt) {
          // downhill is toward the side Dad tipped: roll that way; off the rim is gone
          for (const b of st.beads) {
            if (b.gone) continue;
            b.x += st.tip * (LEAF.speed / 120);
            if (Math.abs(b.x) > rim + 10) b.gone = true;
          }
        }
      },
      paint: (ctx, r, w2) => {
        const k = st.t0 >= 0 ? Math.min(1, since(w2, st.t0) / LEAF.tilt) : 0;
        const dy = 4 * k * st.tip;
        ctx.fillStyle = '#4F8A3A';
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + 2 - dy);
        ctx.lineTo(r.x + r.w, r.y + 2 + dy);
        ctx.lineTo(r.x + r.w, r.y + r.h + dy);
        ctx.lineTo(r.x, r.y + r.h - dy);
        ctx.fill();
        ctx.fillStyle = '#7FBF5A';
        ctx.beginPath();
        ctx.moveTo(r.x + 2, r.y + 2 - dy);
        ctx.lineTo(r.x + r.w - 2, r.y + 2 + dy);
        ctx.lineTo(r.x + r.w - 2, r.y + 4 + dy);
        ctx.lineTo(r.x + 2, r.y + 4 - dy);
        ctx.fill();
        box(ctx, cx - 1, r.y + 1, 2, r.h - 2, '#3F6A2A');
      },
    }),
  );
  // the beads: a shining cluster, deadly when rolling into Dad
  w.add(
    new Rig(cx, FL - 14, 14, 12, {
      layer: 3,
      cause: 'imp-dew',
      inset: 1,
      live: () => st.t0 >= 0 && st.beads.some((b) => !b.gone),
      tick: (r, w2) => {
        const live = st.beads.find((b) => !b.gone);
        if (!live) return;
        r.x = cx + live.x - 7;
        r.w = 14;
        // rolled over at the rim (beyond the beads) or run across by beads from the empty half
        const p = w2.player;
        const dadOff = p.x + p.w / 2 - cx;
        r.hazard!.cause = st.side !== 0 && Math.sign(dadOff) === st.side && Math.abs(dadOff) > Math.abs(live.x) - 8 ? 'imp-dew-rim' : 'imp-dew';
        // two clusters: the hazard box covers both (a leaf with dew on both rims is jumped, not landed on)
        const other = st.beads.find((b) => !b.gone && b !== live);
        if (other) {
          const x0 = Math.min(live.x, other.x) - 7;
          r.x = cx + x0;
          r.w = Math.abs(live.x - other.x) + 14;
          r.hazard!.cause = 'imp-dew-ani';
        }
      },
      paint: (ctx) => {
        for (const b of st.beads) {
          if (b.gone) continue;
          for (let i = 0; i < 3; i++) {
            ctx.fillStyle = 'rgba(220,245,255,0.9)';
            ctx.beginPath();
            ctx.arc(cx + b.x - 5 + i * 5, FL - 7 - (i % 2) * 2, 3, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, cx + b.x - 6 + i * 5, FL - 9 - (i % 2) * 2, 1, 1, '#FFF');
          }
        }
      },
    }),
  );
  void plate;
  return st;
}

/** three leaves across a stretch of lake from column c0: beads on the far rim, the near rim, the far rim */
function leaves(w: World, key: string, c0: number, sides: LeafState['side'][], gap = 2, widths?: number[]) {
  let c = c0;
  for (let i = 0; i < sides.length; i++) {
    const wd = widths?.[i] ?? LEAF.w;
    leaf(w, key, c, sides[i], wd);
    c += wd + gap;
  }
}
/** the columns a row of leaves spans */
export const leafSpan = (n: number, gap = 2, widths?: number[]) => (widths ? widths.reduce((a, b) => a + b, 0) : n * LEAF.w) + (n - 1) * gap;
/** the act's leaves: the both-rim leaf is narrow (3 tiles) with one-tile gaps round it, so it is jumped from the leaf before */
export const ACT_W = [5, 5, 3, 5, 5];

export function room(): LevelDef {
  return {
    id: 'IMP-04',
    city: 'IMP',
    index: 4,
    name: 'Thambal',
    nameEn: 'Lotus leaves',
    tagline: 'Lotus leaves on Loktak, each with a pool of dew at one rim.',
    hint: 'A leaf tips toward whoever lands on it, and the dew rolls downhill. Land on the half the dew is on, inside the beads: the leaf tips their way and the dew rolls off the rim away from you. Land on the empty half and the dew rolls across the leaf into you; land at the rim beyond the dew and it rolls over you.',
    par: 32,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(5, 5 + leafSpan(3) + 1, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      lake(w, 5, 5 + leafSpan(3) + 2);
      leaves(w, 'imp4', 6, [1, -1, 1]);
      onPass(w, px(3), (w2) => tara(w2, L.intro[2], 2.2));
      sign(w, 2.2, 10.4, 3.4, 'THAMBAL', 'green', null, 'lotus');
      rival(w, 29, 15, -1, taraScript(4));
      collectible(w, 'imp-umorok', 6 + LEAF.w + 2 + 2.5, 11.4);
    },
  };
}

/** act: more leaves, the dew swapping rims, and one leaf with dew at BOTH rims: that one cannot be landed on
 * from either side, so take it in one jump from the leaf before it */
export const act: Act = {
  id: 'imp04-ani',
  w: 40,
  advice: 'More leaves, the dew on the far rim, then the near, then the far. One leaf has dew on both rims: there is no half to land on, so jump it in one go from the edge of the leaf before it.',
  cps: [33],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 3 + leafSpan(5, 1, ACT_W) + 1, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 3 + leafSpan(5, 1, ACT_W) + 2);
    leaves(w, 'imp4b', c.x + 4, [-1, 1, 0, -1, 1], 1, ACT_W);
    sign(w, c.x + 1.5, 10.4, 3.4, 'KEIBUL', 'green', null, 'lamjao');
  },
};

export const meta04 = { family: 'dew-beads-roll-leaf-tilt', betrayals: ['tilt-by-drops'], ending: 'imp-bloom-door-plain' };
