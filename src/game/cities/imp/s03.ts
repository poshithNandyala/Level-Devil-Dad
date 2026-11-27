// IMP-03 Samban Lei: the 50-foot topiary, a cone of green tiers. A gardener on his ladder trims it with long
// shears, and his two blades cut the tier ABOVE him and the tier BELOW him: the one tier his shears never touch is
// the tier he stands on. Climb straight up and the blade meets you on the tier above him; wait below for him to
// pass and the lower blade finds you. Be level with him, or two tiers away.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

/** tiers: tier k (0..3) spans cols x0+4k .. x0+4k+5, standing row 13-2k */
export const TIER = { n: 4, w: 6, step: 4, rise: 2 };
/** the gardener: `per` seconds on each tier; two snips per tier, each `snip` seconds long */
export const SNIP = { per: 2.4, at: [0.7, 1.6], snip: 0.4 };

export interface TopiaryState {
  t0: number;
  /** the gardener's tier (0..n-1); -1 before he starts */
  tier: number;
  dir: 1 | -1;
  /** 1 while the blades are closed on the adjacent tiers */
  snipping: boolean;
  done: boolean;
}

export function topiary(w: World, key: string, x0: number, start: number, dir: 1 | -1, causeUp: string, causeDown: string, trigger: number) {
  const st: TopiaryState = { t0: -1, tier: start, dir, snipping: false, done: false };
  w.flags[key] = st;
  const tierX = (k: number) => px(x0 + TIER.step * k);
  const tierY = (k: number) => px(13 - TIER.rise * k) + 16; // top of the platform (Dad stands with his feet here)
  // the tiers: solid shelves of hedge
  for (let k = 0; k < TIER.n; k++) {
    w.add(
      new Rig(tierX(k), tierY(k), px(TIER.w), 12, {
        layer: 1,
        solid: true,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#4F7A2A');
          box(ctx, r.x, r.y, r.w, 3, '#8FBF4A');
          for (let i = 2; i < r.w; i += 7) box(ctx, r.x + i, r.y + 4 + ((i * 3) % 4), 3, 3, '#6FA33A');
        },
      }),
    );
    // the blade on this tier: live when the gardener is on the tier above or below and snipping
    w.add(
      new Rig(tierX(k) - 4, tierY(k) - 18, px(TIER.w) + 8, 18, {
        layer: 3,
        cause: causeUp,
        inset: 1,
        live: () => st.t0 >= 0 && st.snipping && Math.abs(st.tier - k) === 1,
        tick: (r) => {
          r.hazard!.cause = st.tier === k + 1 ? causeDown : causeUp;
        },
        paint: (ctx, r) => {
          if (!(st.t0 >= 0 && Math.abs(st.tier - k) === 1)) return;
          // the blades: two long steel lines meeting over the tier, open when not snipping
          const open = st.snipping ? 2 : 10;
          box(ctx, r.x, r.y + 9 - open, r.w, 2, '#B8C0C8');
          box(ctx, r.x, r.y + 9 + open, r.w, 2, '#B8C0C8');
          if (st.snipping) for (let i = 0; i < r.w; i += 9) box(ctx, r.x + i, r.y + 2 - (i % 3) * 3, 3, 3, '#8FBF4A');
        },
      }),
    );
  }
  // the trunk and the gardener on his ladder (he stands at the right end of his tier)
  w.add(
    new Paint((ctx, w2) => {
      box(ctx, tierX(0) + px(TIER.w) + 2, px(13 - TIER.rise * (TIER.n - 1)) - 10, 4, FL - (px(13 - TIER.rise * (TIER.n - 1)) - 10), '#6E4B2A');
      const k = st.tier;
      const gx = tierX(k) + px(TIER.w) + 14;
      const gy = tierY(k) - 26;
      box(ctx, gx - 6, tierY(k) - 2, 2, FL - tierY(k) + 2, '#A88A5C');
      box(ctx, gx + 6, tierY(k) - 2, 2, FL - tierY(k) + 2, '#A88A5C');
      for (let y = tierY(k) + 6; y < FL; y += 8) box(ctx, gx - 6, y, 14, 2, '#A88A5C');
      folk(ctx, gx, gy, 26, '#2F6BB0', { phanek: '#8A7A4F' });
      if (st.t0 >= 0 && !st.done) {
        const t = since(w2, st.t0) % SNIP.per;
        ctx.fillStyle = '#F2E6C4';
        ctx.fillRect(gx - 14, gy + 8 + (t < 1.2 ? 0 : 1), 10, 2);
      }
    }, 1),
  );
  onPass(w, px(trigger), (w2) => {
    if (st.t0 < 0) st.t0 = w2.tick;
  });
  // the clock: on each tier two snips, then he moves one tier in his direction; at the end he stops (done)
  w.onTick((w2) => {
    if (st.t0 < 0 || st.done) return;
    const t = since(w2, st.t0);
    const k = Math.floor(t / SNIP.per);
    const into = t - k * SNIP.per;
    const tier = start + dir * k;
    if (tier < 0 || tier >= TIER.n) {
      st.done = true;
      st.snipping = false;
      st.tier = Math.max(0, Math.min(TIER.n - 1, tier));
      return;
    }
    st.tier = tier;
    st.snipping = SNIP.at.some((a) => into >= a && into < a + SNIP.snip);
  });
  return st;
}

export function room(): LevelDef {
  return {
    id: 'IMP-03',
    city: 'IMP',
    index: 3,
    name: 'Samban Lei',
    nameEn: 'The trimmed hedge',
    tagline: 'The world’s tallest topiary. The gardener is up it with his shears.',
    hint: 'The gardener’s shears cut the tier above him and the tier below him, and never the tier he stands on. He works his way up from the bottom. Stay level with him: step on to his tier, and move up each time he does. A tier two away from him is safe as well.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      topiary(w, 'imp3', 6, 0, 1, 'imp-shear', 'imp-shear-makha', 4);
      onPass(w, px(3), (w2) => tara(w2, L.intro[1], 2.2));
      sign(w, 2.5, 10.4, 3.8, 'SAMBAN LEI', 'green', null, '50 ft, 35 steps');
      rival(w, 29, 15, -1, taraScript(3));
      collectible(w, 'imp-singju', 6 + TIER.step * 3 + 3, 13 - TIER.rise * 3 - 2.2);
    },
  };
}

/** act: a second topiary, and this gardener starts at the top and comes DOWN. You cannot follow him down, so
 * pass him: be two tiers away from him when his blades close, level with him only as he passes. */
export const act: Act = {
  id: 'imp03-makha',
  w: 36,
  advice: 'The second hedge’s gardener starts at the top and works down. His rule is the same: his own tier is safe, the ones next to him are cut. Wait on the lowest tier while he is high, step up on to his tier as he reaches the one above you, and when he goes on down keep two tiers between you and him.',
  cps: [30],
  build: (w, c) => {
    topiary(w, 'imp3b', c.x + 4, TIER.n - 1, -1, 'imp-shear', 'imp-shear-makha', c.x + 2);
    sign(w, c.x + 1.5, 10.4, 3.4, 'MAALI', 'shop', null, 'the gardener');
  },
};

export const meta03 = { family: 'shears-trim-tier', betrayals: ['trim-tier'], ending: 'imp-crown-door-plain' };
