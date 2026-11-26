// GTK-03 Plastic Nahin. Sikkim banned polythene bags long ago, and Lal Market shoppers carry cloth. Over the
// jhora (the drain) the bags hang on a rail like stepping stones. The cloth ones hold: look for the stitches on
// the handles. The thin ones look much the same and tear under you. Then the inspector comes down the rail
// behind you, taking every thin bag he passes, and lifting any bag with you on it to have a look.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { lock, npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, gullyBack, local, px } from './entities';
import { taraScript } from './common';

export const BAG = { w: 32, h: 14, top: FL - 32, step: 40, tear: 0.04 };

export interface Bag extends Rig {
  s: { thin: boolean; gone: boolean; on: number; torn: boolean; lifted: number; key: string };
}

/** water in the jhora: whoever falls in is done */
function jhora(w: World, c0: number, c1: number, key: string) {
  gullyBack(w, px(c0), px(c1 + 1), FL - 90);
  w.add(
    new Rig(px(c0), FL + 8, px(c1 - c0 + 1), 40, {
      layer: 3,
      cause: 'gtk-jhora',
      inset: 0,
      live: (_r, w2) => !w2.flags[key + 'torn'] && !w2.flags[key + 'lifted'],
      paint: (ctx, r, w2) => {
        box(ctx, r.x, FL + 6, r.w, 30, '#5B6B5A');
        for (let i = 0; i < r.w; i += 12) box(ctx, r.x + i + ((w2.tick >> 2) % 12), FL + 9, 5, 1, 'rgba(230,240,230,0.5)');
      },
    }),
  );
  // the same water, when it was a thin bag that put you there
  w.add(new Rig(px(c0), FL + 8, px(c1 - c0 + 1), 40, { cause: 'gtk-polythene', inset: 0, live: (_r, w2) => !!w2.flags[key + 'torn'] }));
}

/** a row of bags on the rail from column c (thin ones marked 't', cloth 'c') */
export function bags(w: World, c: number, pattern: string, key: string): Bag[] {
  const out: Bag[] = [];
  const x0 = px(c);
  // the rail and its hooks
  w.add(
    new Rig(x0 - 8, BAG.top - 48, pattern.length * BAG.step + 8, 3, {
      layer: -1,
      paint: (ctx, r) => box(ctx, r.x, r.y, r.w, 3, '#5D4A3A'),
    }),
  );
  [...pattern].forEach((k, i) => {
    const thin = k === 't';
    const b = w.add(
      new Rig(x0 + i * BAG.step, BAG.top, BAG.w, BAG.h, {
        solid: true,
        oneWay: true,
        layer: 2,
        tick: (r, w2) => {
          const s = r.s as Bag['s'];
          if (s.gone) return;
          if (s.lifted > 0) {
            s.lifted--;
            if (s.lifted === 0) r.setSolid(true);
            return;
          }
          if (thin && r.carries(w2)) {
            s.on++;
            if (s.on >= BAG.tear * 120) {
              s.gone = s.torn = true;
              r.setSolid(false);
              w2.flags[key + 'torn'] = true;
              w2.sfx('thud', r.x + 12, r.y);
            }
          } else s.on = 0;
        },
        paint: (ctx, r) => {
          const s = r.s as Bag['s'];
          const hx = r.x + r.w / 2;
          const lift = s.lifted > 0 ? 30 : 0;
          const y = r.y - lift;
          if (s.gone) {
            if (s.torn) {
              // a torn scrap left on the hook
              box(ctx, hx - 3, BAG.top - 46, 6, 6, 'rgba(230,236,240,0.8)');
            }
            return;
          }
          // the string up to the rail
          box(ctx, hx - 0.5, BAG.top - 46, 1, 46 - lift - 8, '#5D4A3A');
          if (thin) {
            // thin polythene: shiny, crinkled, handles cut out of the bag itself
            box(ctx, r.x + 1, y + 2, r.w - 2, r.h - 2, '#D8E4EA');
            box(ctx, r.x + 3, y + 4, 3, r.h - 6, 'rgba(255,255,255,0.8)');
            box(ctx, r.x + 12, y + 5, 2, 4, 'rgba(150,170,180,0.5)');
            ctx.strokeStyle = '#B9C9D2';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(hx, y + 2, 5, Math.PI, 0);
            ctx.stroke();
          } else {
            // a cloth jhola: woven, a hem, and handles sewn on with stitches you can see
            box(ctx, r.x, y + 2, r.w, r.h - 2, '#C9B48A');
            box(ctx, r.x, y + r.h - 3, r.w, 2, '#A68F62');
            box(ctx, r.x + 8, y + 6, r.w - 16, 4, '#E07A5F');
            ctx.strokeStyle = '#7A5B35';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(hx, y + 2, 6, Math.PI, 0);
            ctx.stroke();
            for (const sx of [hx - 6, hx + 6]) {
              box(ctx, sx - 1.5, y + 2, 3, 1, '#F4F1EA');
              box(ctx, sx - 1.5, y + 4, 3, 1, '#F4F1EA');
            }
            for (let j = 0; j < 6; j++) box(ctx, r.x + 2 + j * 5, y + 3, 2, 1, '#F4F1EA');
          }
        },
      }),
    ) as Bag;
    b.s = { thin, gone: false, on: 0, torn: false, lifted: 0, key };
    out.push(b);
  });
  (w.flags[key + 'bags'] ??= []).push(...out);
  return out;
}

export function room(): LevelDef {
  return {
    id: 'GTK-03',
    city: 'GTK',
    index: 3,
    name: 'Plastic Nahin',
    nameEn: 'No polythene',
    tagline: 'Lal Market. Sikkim gave up polythene bags years ago; everyone carries a cloth jhola. Nearly everyone.',
    hint: 'The bags on the rail are your stepping stones over the jhora. The cloth ones hold: they have stitched handles and a hem. The thin shiny ones tear the moment you stand on them. Hop cloth to cloth and jump over the thin ones.',
    par: 12,
    map: Grid.ground(15).pit(6, 23).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      jhora(w, 6, 23, 'gtk3');
      bags(w, 7, 'ctcctcc', 'gtk3');
      sign(w, 1.5, 9.6, 4.4, 'LAL MARKET', 'shop', null, 'jhola only');
      rival(w, 3, 15, 1, taraScript(3));
      onPass(w, px(4), (w2) => tara(w2, 'Hajur! Any bag will do, Dad! | Yes! Any bag will do, Dad!', 2.2));
      collectible(w, 'gtk-selroti', 15.6, 8.2);
    },
  };
}

/** act: the inspector comes down the rail behind you; thin bags he takes for good, a bag with you on it he lifts */
export const INSPECTOR = { speed: 46, lift: 1.0, startBehind: 2.5 };
export const inspectorAct = (id: string, key: string, pattern: string, dir: 1 | -1, speed: number, advice: string): Act => ({
  id,
  w: 36,
  advice,
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 26);
  },
  build: (w, c) => {
    jhora(w, c.x + 4, c.x + 26, key);
    const row = bags(w, c.x + 5, pattern, key);
    const from = dir > 0 ? c.X(1) : c.X(28);
    const st = { t0: -1, x: from, dir };
    w.flags[key + 'i'] = st;
    onPass(w, c.X(3), (w2) => {
      st.t0 = w2.tick;
    });
    w.add(
      new Rig(from, BAG.top - 76, 12, 28, {
        layer: 3,
        tick: (r, w2) => {
          if (st.t0 < 0) return;
          r.x = from + dir * ((w2.tick - st.t0) / 120) * speed;
          st.x = r.x + 6;
          for (const b of row) {
            const s = b.s;
            if (s.gone || s.lifted > 0 || st.x < b.x + 4 || st.x > b.x + 8) continue;
            if (s.thin) {
              s.gone = true;
              b.setSolid(false);
            } else if (b.carries(w2)) {
              s.lifted = Math.round(INSPECTOR.lift * 120);
              b.setSolid(false);
              w2.flags[key + 'lifted'] = true;
              npc(w2, 'Hajur? | Yes?', r.x + 6, r.y - 4, 1.2);
            }
          }
        },
        paint: (ctx, r) => {
          // the inspector on the market's upper walkway, reaching down to the rail with his hook
          box(ctx, r.x - 40, r.y + 28, 80, 3, '#6B5A48');
          local(ctx, r.x + 6, r.y, 28, '#4E6E5D', { cap: '#26323A' });
          box(ctx, r.x + 8, r.y + 12, 8, 2, '#F4F1EA');
          ctx.strokeStyle = '#3A3A3A';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(r.x + 10, r.y + 14);
          ctx.lineTo(r.x + 8, r.y + 52);
          ctx.stroke();
        },
      }),
    );
    // the lifted-bag fall gets its own line
    w.add(new Rig(c.X(4), FL + 8, px(23), 40, { cause: 'gtk-jaanch', inset: 0, live: (_r, w2) => !!w2.flags[key + 'lifted'] }));
    sign(w, c.x + 0.6, 9.6, 4.6, 'NO PLASTIC', 'warn', null, 'inspection');
  },
});
export const act = inspectorAct(
  'gtk03-jaanch',
  'gtk3a',
  'cctcctcct',
  1,
  INSPECTOR.speed,
  'The inspector comes along the rail behind you. Thin bags he takes for good; any bag with you on it he lifts to check the stitches, and down you go. Keep hopping, cloth to cloth, and stay ahead of him.',
);
/** act 2: the next row, and the inspector is working it from the far end, towards you: hop over his head */
export const act2 = inspectorAct(
  'gtk03-ulto',
  'gtk3b',
  'ctcctcctc',
  -1,
  40,
  'The next row he works from the far end, coming towards you, so staying ahead is no use. Wait on a cloth bag; the moment he has walked past the next cloth bag, hop on to it, over him, before he reaches yours.',
);

/** door: the cloth-bag stall. Nobody goes in empty-handed: take a jhola off the hook over the door first */
export const ending: Ending = {
  space: 11,
  advice: 'The cloth-bag stall won’t let you in empty-handed. Jump up and take the jhola off the hook before the door.',
  build(w, d) {
    const L = lock(w, d, 'Hoina. | No.');
    w.flags.twist = 'jhola';
    const hx = d.x - 40;
    const st = { got: false };
    w.flags.gtk3e = st;
    w.add(
      new Rig(hx, FL - 62, 16, 16, {
        layer: 3,
        tick: (r, w2) => {
          if (st.got) return;
          const p = w2.player;
          if (p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y) {
            st.got = true;
            L.unlock();
          }
        },
        paint: (ctx, r) => {
          box(ctx, r.x - 30, r.y - 18, 100, 3, '#5D4A3A');
          if (st.got) return;
          box(ctx, r.x + 7, r.y - 16, 2, 6, '#5D4A3A');
          box(ctx, r.x, r.y - 6, 16, 14, '#C9B48A');
          box(ctx, r.x + 3, r.y + 1, 10, 4, '#3E8E41');
          ctx.strokeStyle = '#7A5B35';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(r.x + 8, r.y - 6, 5, Math.PI, 0);
          ctx.stroke();
        },
      }),
    );
    // the jhola Dad carries once he has it
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 6,
        paint: (ctx, _r, w2) => {
          if (!st.got) return;
          const p = w2.player;
          box(ctx, p.x + (p.facing > 0 ? 8 : -4), p.y + 6, 6, 6, '#C9B48A');
        },
      }),
    );
    sign(w, Math.round(d.x / 16) - 6.5, 9.4, 4.2, 'JHOLA', 'shop', null, 'cloth bags');
  },
};

export const meta03 = { family: 'inspector-confiscates-thin-bags', betrayals: ['inspector-removes'], ending: 'gtk-jhola-entry' };
