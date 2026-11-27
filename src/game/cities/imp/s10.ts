// IMP-10 Loktak Sandhya (finale): one run across the lake at dusk, calling back the city's own ideas and BREAKING
// each rule as it was taught (TROLL-BIBLE law 7). The deer's reeds: at dusk the reeds stand on drifted debris and
// TEAR, and the bare mat is the firm one. The lotus leaves: the dew has dried, and a leaf with no dew tips whoever
// lands at its rim into the lake: land at the centre. The dock: the dusk mats click and the newcomer rides UP over
// the seam, so the seam is where you are pitched and the far end is where you are safe.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { pool } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { crumble, onPass } from '../../levels/trolls';
import { Rig, box, matArt, perTick } from './entities';
import { FL, LOKTAK, hut, lake, since, taraScript } from './common';
import { lines as L } from './lines';

const THIN = 0.12;

/** reeds that stand on drifted debris: drawn pale, dusk-lit */
function duskReeds(w: World, patches: [number, number][]) {
  w.add(
    new Paint((ctx, w2) => {
      for (const [a, b] of patches)
        for (let x = px(a) + 3; x < px(b + 1) - 2; x += 5) {
          const sway = Math.sin(w2.tick / 40 + x) * 1.5;
          box(ctx, x + sway, FL - 12 - ((x * 7) % 5), 1, 12 + ((x * 7) % 5), '#9A8A5A');
          box(ctx, x + sway - 1, FL - 13 - ((x * 7) % 5), 3, 3, '#D8B080');
        }
    }, -1),
  );
}

export function room(): LevelDef {
  const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
  // bank 0-4; bare mat 5-8 (holds), reed patch a 9-10 (tears), bare 11-14, reed b 15-17 (tears), bare 18-21, reed c 22-23 (tears), bare 24-26, bank 27+
  g.fill(9, 10, 15, 15, 'a').fill(15, 17, 15, 15, 'b').fill(22, 23, 15, 15, 'c');
  g.fill(5, 26, 16, 17, '.');
  return {
    id: 'IMP-10',
    city: 'IMP',
    index: 10,
    name: 'Loktak Sandhya',
    nameEn: 'Loktak at dusk',
    tagline: 'One run across the lake at dusk. Everything you learned, the other way round.',
    hint: 'At dusk the reeds stand on drifted debris: the reed patches TEAR and the bare mat holds. Walk the bare mat and jump the reeds. Further on, the lotus leaves have no dew left: a dry leaf tips whoever lands at its rim, so land at the centre. At the dock the newcomer rides up over the seam: stand at the far end, not at the seam.',
    par: 70,
    map: g.rows(),
    build(w: World) {
      door(w);
      for (const l of 'abc') crumble(w, l, THIN);
      pool(w, 5, 27, 15.6, { cause: 'imp-phum-lei', colors: LOKTAK, behind: true });
      duskReeds(w, [[9, 10], [15, 17], [22, 23]]);
      onPass(w, px(2), (w2) => tara(w2, L.intro[8], 2.2));
      onPass(w, px(7), (w2) => tara(w2, L.taunt[1], 2.2));
      sign(w, 1.5, 10.4, 3.4, 'LOKTAK', 'green', null, 'sandhya: dusk');
      rival(w, 29.5, 15, -1, taraScript(10, 1));
      collectible(w, 'imp-chakhao', 19.5, 11.6);
      // dusk: a warm band low in the sky
      w.add(
        new Paint((ctx, w2) => {
          const cam = w2.player.x;
          const grd = ctx.createLinearGradient(0, 60, 0, 170);
          grd.addColorStop(0, 'rgba(216,108,138,0)');
          grd.addColorStop(1, 'rgba(232,160,96,0.35)');
          ctx.fillStyle = grd;
          ctx.fillRect(cam - 600, 60, 1200, 110);
        }, -6),
      );
    },
  };
}

/** callback: the lotus leaves, dry at dusk: a leaf with no dew tips whoever lands at a rim */
const actThambal: Act = {
  id: 'imp10-thambal',
  w: 36,
  advice: 'The lotus leaves again, but the dew has dried off them. A dry leaf tips whoever lands near a rim: land at the centre of each.',
  cps: [30],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 28, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 29, 'imp-dew-lei');
    for (let i = 0; i < 4; i++) {
      const x0 = px(c.x + 4 + i * 6);
      const wd = px(5);
      const st = { t0: -1, tip: 0 };
      w.add(
        new Rig(x0, FL - 4, wd, 8, {
          layer: 1,
          solid: true,
          tick: (r, w2) => {
            const p = w2.player;
            if (w2.standing(r.solid!) && st.t0 < 0) {
              const off = p.x + p.w / 2 - (r.x + r.w / 2);
              st.t0 = w2.tick;
              st.tip = Math.abs(off) > wd / 2 - px(1.4) ? Math.sign(off) : 0;
            }
            if (!w2.standing(r.solid!) && st.t0 >= 0 && since(w2, st.t0) > 1) {
              st.t0 = -1;
              st.tip = 0;
            }
          },
          paint: (ctx, r, w2) => {
            const k = st.t0 >= 0 ? Math.min(1, since(w2, st.t0) / 0.3) : 0;
            const dy = 8 * k * st.tip;
            ctx.fillStyle = '#5E7A3A';
            ctx.beginPath();
            ctx.moveTo(r.x, r.y + 2 - dy);
            ctx.lineTo(r.x + r.w, r.y + 2 + dy);
            ctx.lineTo(r.x + r.w, r.y + r.h + dy);
            ctx.lineTo(r.x, r.y + r.h - dy);
            ctx.fill();
            box(ctx, r.x + r.w / 2 - 1, r.y + 1, 2, r.h - 2, '#3F5A2A');
          },
        }),
      );
      // the tip: a rim that goes under pitches the one who stands on it
      w.add(
        new Rig(x0, FL - 20, px(1.4), 24, {
          layer: 3,
          cause: 'imp-dew-lei',
          inset: 1,
          live: (_r, w2) => st.t0 >= 0 && st.tip !== 0 && since(w2, st.t0) >= 0.08 && since(w2, st.t0) < 0.8,
          tick: (r) => {
            r.x = st.tip < 0 ? x0 : x0 + wd - px(1.4);
          },
          paint: () => {},
        }),
      );
    }
    sign(w, c.x + 30, 10.4, 3.4, 'THAMBAL', 'green', null, 'dry at dusk');
  },
};

/** callback: the dock at dusk; the newcomer rides up over the seam: the seam pitches, the far end carries */
const actDock: Act = {
  id: 'imp10-dock',
  w: 40,
  advice: 'The dock again. At dusk the drifting mat rides UP over the anchored one when it clicks, so the seam is where you are thrown and the far end is where you are carried. Stand at the far end for the click, then cross.',
  cps: [24],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 18, 15, 17, '.');
  },
  build: (w, c) => {
    lake(w, c.x + 3, c.x + 19);
    const st = { t0: -1, click: -1 };
    w.flags[c.f('dock')] = st;
    const A = w.add(
      new Rig(px(c.x + 5), FL - 6, px(6), 10, {
        layer: -4,
        solid: true,
        paint: (ctx, r) => {
          matArt(ctx, r.x, r.y, r.w, r.h + 6, {});
          hut(ctx, r.x + r.w / 2 - 15, r.y + 1);
        },
      }),
    );
    const B = w.add(
      new Rig(px(c.x + 13), FL - 6, px(6), 10, {
        layer: -4,
        solid: true,
        tick: (r, w2) => {
          if (st.t0 < 0 || st.click >= 0) return;
          const nx = r.x - perTick(30);
          if (nx <= A.x + A.w) {
            r.moveTo(w2, A.x + A.w, r.y);
            st.click = w2.tick;
            w2.sfx('thud', r.x, FL);
          } else r.moveTo(w2, nx, r.y);
        },
        paint: (ctx, r, w2) => {
          const up = st.click >= 0 && since(w2, st.click) < 0.5 ? 5 : 0;
          matArt(ctx, r.x, r.y - up, r.w, r.h + 6, { reeds: true, dull: true });
        },
      }),
    );
    void B;
    // the seam pitch
    w.add(
      new Rig(A.x + A.w - px(1.6), FL - 24, px(1.6), 28, {
        layer: 3,
        cause: 'imp-lurch-lei',
        inset: 1,
        live: (_r, w2) => st.click >= 0 && since(w2, st.click) < 0.4,
        paint: (ctx, r, w2) => {
          if (!(st.click >= 0 && since(w2, st.click) < 0.6)) return;
          for (let i = 0; i < 5; i++) box(ctx, r.x + i * 5, FL - 14 - (i % 3) * 4, 3, 3, 'rgba(240,220,200,0.8)');
        },
      }),
    );
    onPass(w, c.X(5.2), (w2) => {
      if (st.t0 < 0) st.t0 = w2.tick;
    });
    sign(w, c.x + 22, 10.4, 3.4, 'SENDRA', 'green', null, 'the far shore');
  },
};

export const acts = [actThambal, actDock];
export const meta10 = { family: 'finale-lake-at-dusk', betrayals: ['lake-dusk-run'], ending: 'imp-sendra-door-plain' };
