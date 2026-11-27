// IMP-06 Sangai Steps: Keibul Lamjao, the floating park. A sangai walks ahead over the phumdi and steps only on
// the firm patches: the ones with reeds on them (reeds grow where the mat is thick). The bare mat between tears
// under Dad a moment after he steps on it. The deer shows you the rule, not the path: at a gap it leaps further
// than you can, and in the park it walks mat too thin for you. Read the reeds yourself; where the deer leaps,
// Tara's "go straight" is the lie: the way is the reed hummock beside the line.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { pool } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { crumble, onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { FL, LOKTAK, taraScript } from './common';
import { lines as L } from './lines';

export const THIN = 0.12;

/** the sangai: walks right from `c0` when Dad passes `trigger`, bounding where `leaps` says (columns), stops at `c1` */
export function sangai(w: World, key: string, c0: number, c1: number, trigger: number, leaps: [number, number][]) {
  const st = { t0: -1, x: px(c0), done: false };
  w.flags[key] = st;
  w.add(
    new Rig(px(c0), FL - 30, 28, 30, {
      layer: -1,
      tick: (r, w2) => {
        if (st.t0 < 0 || st.done) return;
        r.x += perTick(118);
        st.x = r.x;
        if (r.x >= px(c1)) st.done = true;
        void w2;
      },
      paint: (ctx, r, w2) => {
        // a brow-antlered deer: body, neck, head, antlers, four light legs
        const leap = leaps.find(([a, b]) => r.x > px(a) && r.x < px(b));
        const k = leap ? Math.sin(((r.x - px(leap[0])) / (px(leap[1]) - px(leap[0]))) * Math.PI) : 0;
        const y = r.y - k * 22;
        const step = st.t0 >= 0 && !st.done && !leap ? ((w2.tick >> 3) % 2) * 2 : 0;
        box(ctx, r.x + 4, y + 10, 20, 9, '#8A5A2B');
        box(ctx, r.x + 20, y + 2, 5, 10, '#8A5A2B');
        box(ctx, r.x + 19, y - 2, 9, 6, '#7A4A22');
        box(ctx, r.x + 20, y - 8, 1, 7, '#E8DCC0');
        box(ctx, r.x + 25, y - 8, 1, 7, '#E8DCC0');
        box(ctx, r.x + 17, y - 7, 5, 1, '#E8DCC0');
        box(ctx, r.x + 24, y - 7, 5, 1, '#E8DCC0');
        box(ctx, r.x + 6, y + 19, 2, 11 - step, '#5E3A1E');
        box(ctx, r.x + 10, y + 19, 2, 11 - (2 - step), '#5E3A1E');
        box(ctx, r.x + 18, y + 19, 2, 11 - step, '#5E3A1E');
        box(ctx, r.x + 22, y + 19, 2, 11 - (2 - step), '#5E3A1E');
      },
    }),
  );
  onPass(w, px(trigger), (w2) => {
    if (st.t0 < 0) st.t0 = w2.tick;
  });
  return st;
}

/** reeds drawn on firm patches (the tell) */
function reeds(w: World, patches: [number, number][], ty = 15) {
  w.add(
    new Paint((ctx, w2) => {
      for (const [a, b] of patches)
        for (let x = px(a) + 3; x < px(b + 1) - 2; x += 5) {
          const sway = Math.sin(w2.tick / 40 + x) * 1.5;
          box(ctx, x + sway, px(ty) - 12 - ((x * 7) % 5), 1, 12 + ((x * 7) % 5), '#7F9A3B');
          box(ctx, x + sway - 1, px(ty) - 13 - ((x * 7) % 5), 3, 3, '#B59A5A');
        }
    }, -1),
  );
}

/** a hummock: a raised reed clump (a one-way shelf two tiles up), the way past a leap */
function hummock(g: Grid, c0: number, c1: number) {
  g.fill(c0, c1, 13, 13, '=');
}

export function room(): LevelDef {
  const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
  // bank 0-5; thin mat a 6-7, patch 8-9, thin b 10-12, patch 13-14, thin c 15-20 (the leap), patch 21-22, thin d 23-24, patch 25-26, bank 27+
  g.fill(6, 7, 15, 15, 'a').fill(10, 12, 15, 15, 'b').fill(15, 20, 15, 15, 'c').fill(23, 24, 15, 15, 'd');
  g.fill(6, 26, 16, 17, '.');
  hummock(g, 16, 18);
  return {
    id: 'IMP-06',
    city: 'IMP',
    index: 6,
    name: 'Sangai Steps',
    nameEn: 'The deer’s steps',
    tagline: 'Keibul Lamjao. The sangai knows where the mat is thick.',
    hint: 'The mat is firm only where reeds grow; the bare mat tears a moment after you step on it. The deer steps only on reed patches: hop from patch to patch as it does. Where it leaps, the gap is too long for you: take the reed hummock above the line and come down on the patch beyond. Tara’s "go straight" there is a lie.',
    par: 40,
    map: g.rows(),
    build(w: World) {
      door(w);
      for (const l of 'abd') crumble(w, l, THIN);
      crumble(w, 'c', 0.02); // the leap's stretch: thinnest of all, it goes the moment a foot lands on it
      pool(w, 6, 15, 15.6, { cause: 'imp-phum', colors: LOKTAK, behind: true });
      pool(w, 15, 21, 15.6, { cause: 'imp-chong', colors: LOKTAK, behind: true });
      pool(w, 21, 27, 15.6, { cause: 'imp-phum', colors: LOKTAK, behind: true });
      reeds(w, [[8, 9], [13, 14], [21, 22], [25, 26]]);
      reeds(w, [[16, 18]], 13);
      sangai(w, 'imp6', 3, 28, 2, [[px(14) / 16, px(21) / 16]]);
      onPass(w, px(12.5), (w2) => tara(w2, L.taunt[0], 2.4));
      onPass(w, px(2), (w2) => tara(w2, L.intro[4], 2.2));
      sign(w, 1.5, 10.4, 3.8, 'KEIBUL LAMJAO', 'green', null, 'the floating park');
      rival(w, 29.5, 15, -1, taraScript(6));
      collectible(w, 'imp-eromba', 17, 9.6);
    },
  };
}

/** act 1: in the park the deer WALKS a bare stretch its light feet can take: follow it there and the mat tears. The
 * reeds are the rule; the deer is not. */
export const act: Act = {
  id: 'imp06-lamjao',
  w: 40,
  advice: 'Deeper in the park the deer walks straight across a bare stretch: its feet are light, yours are not. Hop only reed patch to reed patch, and where the patches are too far apart take the hummock.',
  cps: [20, 36],
  paint: (g, c) => {
    const L5 = c.L;
    g.fill(c.x + 3, c.x + 4, 15, 15, L5[0]).fill(c.x + 7, c.x + 9, 15, 15, L5[1]).fill(c.x + 12, c.x + 15, 15, 15, L5[2]).fill(c.x + 23, c.x + 28, 15, 15, L5[3]).fill(c.x + 31, c.x + 32, 15, 15, L5[4]);
    g.fill(c.x + 3, c.x + 32, 16, 17, '.');
    hummock(g, c.x + 24, c.x + 26);
  },
  build: (w, c) => {
    for (const l of c.L) crumble(w, l, THIN);
    pool(w, c.x + 3, c.x + 33, 15.6, { cause: 'imp-phum', colors: LOKTAK, behind: true });
    reeds(w, [[c.x + 5, c.x + 6], [c.x + 10, c.x + 11], [c.x + 16, c.x + 22], [c.x + 29, c.x + 30], [c.x + 33, c.x + 35]]);
    reeds(w, [[c.x + 24, c.x + 26]], 13);
    sangai(w, c.f('deer'), c.x + 1, c.x + 38, c.x + 1, []);
    sign(w, c.x + 37, 10.4, 3.4, 'SANGAI', 'green', null, 'the dancing deer');
  },
};

/** act 2: the Pabot hill edge: long thin stretches, two hummocks, the deer long gone */
export const act2: Act = {
  id: 'imp06-pabot',
  w: 38,
  advice: 'Toward Pabot hill the firm patches thin out: two hummocks in a row, with bare mat under both. Hop hummock to hummock and come down on the reeds at the hill’s foot.',
  cps: [19],
  paint: (g, c) => {
    const L5 = c.L;
    g.fill(c.x + 3, c.x + 5, 15, 15, L5[0]).fill(c.x + 8, c.x + 11, 15, 15, L5[1]).fill(c.x + 14, c.x + 26, 15, 15, L5[2]).fill(c.x + 29, c.x + 31, 15, 15, L5[3]);
    g.fill(c.x + 3, c.x + 31, 16, 17, '.');
    hummock(g, c.x + 15, c.x + 17);
    hummock(g, c.x + 21, c.x + 23);
  },
  build: (w, c) => {
    for (const l of c.L.slice(0, 4)) crumble(w, l, THIN);
    pool(w, c.x + 3, c.x + 32, 15.6, { cause: 'imp-phum', colors: LOKTAK, behind: true });
    reeds(w, [[c.x + 6, c.x + 7], [c.x + 12, c.x + 13], [c.x + 27, c.x + 28], [c.x + 32, c.x + 34]]);
    reeds(w, [[c.x + 15, c.x + 17], [c.x + 21, c.x + 23]], 13);
    sign(w, c.x + 35, 10.4, 3.4, 'PABOT', 'green', null, 'the hill');
  },
};

export const meta06 = { family: 'animal-scout-firm-patches', betrayals: ['animal-scout'], ending: 'imp-hill-door-plain' };
