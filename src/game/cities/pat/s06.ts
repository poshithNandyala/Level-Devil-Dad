// PAT-06 Setu ka Jod: the Gandhi Setu's expansion joints. Each seam between two spans is covered by a numbered
// steel plate, and one plate is missing: count them. Plates only hold a walker: land on one from a jump and it
// flips up under you. Act: a longer run of spans with two plates gone. Door: the toll booth that no longer charges.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box } from './entities';
import { since, taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;

/** the hazard under a seam: the Ganga far below (y from 256) */
export function under(w: World, c0: number, c1: number, cause: string) {
  w.add(
    new Rig(px(c0), 256, px(c1 - c0 + 1), 30, {
      layer: 4,
      cause,
      inset: 0,
      paint: (ctx, r) => {
        ctx.fillStyle = 'rgba(70,56,36,0.92)';
        ctx.fillRect(r.x, r.y, r.w, 30);
        ctx.fillStyle = 'rgba(255,241,201,0.35)';
        ctx.fillRect(r.x + 3, r.y + 4, r.w - 6, 1);
      },
    }),
  );
}

/** a numbered expansion plate over the seam at columns [c, c + 1]: it holds a walker and drops under a landing */
function plate(w: World, c: number, n: number, key: string) {
  const r = w.add(
    new Rig(px(c), FL, 32, 8, {
      solid: true,
      layer: 2,
      near: 900,
      cause: 'pat-taala',
      inset: -2,
      live: (s, w2) => s.s.drop !== undefined && w2.tick - s.s.drop < 40,
      tick: (s, w2) => {
        const p = w2.player;
        const on = w2.standing(s.solid!);
        // landing on a plate from a jump springs it: it flips up under you
        if (on && !s.s.was && s.s.air) {
          s.s.drop = w2.tick;
          w2.sfx('snap', s.x + 16, FL);
        }
        s.s.was = on;
        s.s.air = !p.onGround;
      },
      paint: (ctx, s, w2) => {
        const up = s.s.drop !== undefined && w2.tick - s.s.drop < 40;
        const y = s.y - (up ? 5 : 0);
        box(ctx, s.x, y, s.w, 8, up ? '#D7262E' : '#8A8F96');
        box(ctx, s.x, y, s.w, 2, '#B8BDC4');
        box(ctx, s.x + 2, y + 3, 3, 3, '#555');
        box(ctx, s.x + s.w - 5, y + 3, 3, 3, '#555');
        // its number, scratched in
        ctx.fillStyle = '#2A2A2E';
        ctx.font = '700 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(n), s.x + 16, y + 7);
      },
    }),
  );
  (w.flags[key] ??= []).push(r);
  return r;
}

/** the seams of a bridge: [column, number, present] */
export function seams(w: World, list: [number, number, boolean][], key: string) {
  for (const [c, n, present] of list) {
    if (present) plate(w, c, n, key);
  }
  w.add(
    new Paint((ctx) => {
      // the girder walls either side of each seam, so the gap reads as a joint
      for (const [c] of list) {
        box(ctx, px(c) - 2, FL, 2, 14, '#3F3B30');
        box(ctx, px(c) + 32, FL, 2, 14, '#3F3B30');
      }
    }, 1),
  );
}

export function room(): LevelDef {
  const S: [number, number, boolean][] = [
    [7, 1, true],
    [13, 2, true],
    [19, 3, false],
    [25, 4, true],
  ];
  return {
    id: 'PAT-06',
    city: 'PAT',
    index: 6,
    name: 'Setu ka Jod',
    nameEn: 'The Setu’s joint',
    tagline: 'Forty-five spans, forty-four joints, and a plate over each. Count them.',
    hint: 'Each seam between two spans has a numbered steel plate over it, and one of them is missing: the seam with a black gap is a pit. Walk over the plates: a plate flips up if you land on it from a jump. Jump only the one seam that has no plate, from the deck, and land on the deck.',
    par: 22,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
      for (const [c] of S) g.fill(c, c + 1, 15, 17, '.');
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      seams(w, S, 'pat6');
      for (const [c, , present] of S) under(w, c, c + 1, present ? 'pat-taala' : 'pat-jod');
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.win[1], 2.4);
          },
        }),
      );
      sign(w, 3.4, 10.4, 3.4, 'GANDHI SETU', 'shop', null, '5.75 km');
      rival(w, 28, 15, -1, taraScript(6));
      collectible(w, 'pat-thekua', 22, 11.8);
    },
  };
}

export const act: Act = {
  id: 'pat06-sau',
  w: 44,
  advice: 'The next run of spans is longer, with six seams and two plates gone. Read the numbers: each missing plate is a jump from the deck to the deck, and every plate you do cross is a plain walk.',
  cps: [16, 30],
  paint: (g, c) => {
    for (const x of [6, 13, 20, 27, 34, 40]) g.fill(c.x + x, c.x + x + 1, 15, 17, '.');
  },
  build: (w, c) => {
    const list: [number, number, boolean][] = [
      [c.x + 6, 1, true],
      [c.x + 13, 2, true],
      [c.x + 20, 3, false],
      [c.x + 27, 4, true],
      [c.x + 34, 5, false],
      [c.x + 40, 6, true],
    ];
    seams(w, list, 'pat6a');
    for (const [col, , present] of list) under(w, col, col + 1, present ? 'pat-taala' : 'pat-jod');
    sign(w, c.x + 2, 10.4, 3, 'SPAN 7', 'shop', null, 'joint ahead');
  },
};

/** the long run: eight spans, plates numbered 1-8, and every third one gone */
export const act2: Act = {
  id: 'pat06-nau',
  w: 58,
  advice: 'The far end of the bridge is eight spans long, and the plate numbers run from one to eight. Every third plate is gone: the three and the six. Walk the others, and jump the missing ones from the deck.',
  cps: [14, 36],
  paint: (g, c) => {
    for (const x of [6, 12, 18, 24, 30, 36, 42, 48]) g.fill(c.x + x, c.x + x + 1, 15, 17, '.');
  },
  build: (w, c) => {
    const list: [number, number, boolean][] = [6, 12, 18, 24, 30, 36, 42, 48].map((x, i) => [c.x + x, i + 1, (i + 1) % 3 !== 0]);
    seams(w, list, 'pat6b');
    for (const [col, , present] of list) under(w, col, col + 1, present ? 'pat-taala' : 'pat-jod');
    sign(w, c.x + 2, 10.4, 3, 'SPAN 9', 'shop', null, 'joint ahead');
  },
};

export interface Lift {
  /** seam index (0-based), seconds after Dad reaches the span, how long the plate stays out of its seat */
  k: number;
  at: number;
  dur: number;
}

/** plates a truck lifts out of their seats for a while: a seam is open only in its window, and the plate shakes in its
 *  seat for the second before. Same every time. */
export function liftSeams(w: World, c0: number, cols: number[], key: string, nums: number[], lifts: Lift[], trigger: number) {
  const st = { t0: -1, lifts, cols };
  w.flags[key] = st;
  w.when(
    (w2) => w2.player.cx >= trigger,
    (w2) => {
      st.t0 = w2.tick;
    },
  );
  const byK: Lift[][] = cols.map((_, k) => lifts.filter((q) => q.k === k));
  const open = (k: number, w2: World, ahead = 0) => {
    if (st.t0 < 0) return false;
    const t = since(w2, st.t0) + ahead;
    const qs = byK[k];
    for (let i = 0; i < qs.length; i++) if (t >= qs[i].at && t < qs[i].at + qs[i].dur) return true;
    return false;
  };
  cols.forEach((c, k) => {
    const r = w.add(
      new Rig(px(c), FL, 32, 8, {
        solid: true,
        layer: 2,
        near: 900,
        tick: (pl, w2) => {
          const out = open(k, w2);
          pl.solid!.collidable = !out;
          pl.s.shake = !out && open(k, w2, 1.0);
          pl.s.out = out;
        },
        paint: (ctx, pl, w2) => {
          if (pl.s.out) return;
          const sh = pl.s.shake ? Math.sin(w2.tick / 2) * 1.5 : 0;
          box(ctx, pl.x + sh, pl.y, pl.w, 8, '#8A8F96');
          box(ctx, pl.x + sh, pl.y, pl.w, 2, '#B8BDC4');
          ctx.fillStyle = '#2A2A2E';
          ctx.font = '700 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(nums[k]), pl.x + 16 + sh, pl.y + 7);
        },
      }),
    );
    r.s.k = k;
    (w.flags[key + 'p'] ??= []).push(r);
  });
  w.add(
    new Rig(px(c0), 256, px(cols[cols.length - 1] + 2 - c0), 30, {
      layer: 4,
      cause: 'pat-jod',
      inset: 0,
      paint: (ctx, r) => {
        ctx.fillStyle = 'rgba(70,56,36,0.92)';
        ctx.fillRect(r.x, r.y, r.w, 30);
      },
    }),
  );
  // a truck crossing over the lifted seam: drawn in passing
  w.add(
    new Paint((ctx, w2) => {
      for (const q of lifts) {
        if (!st.t0 || st.t0 < 0) break;
        const t = since(w2, st.t0);
        if (t >= q.at - 0.2 && t < q.at + q.dur) {
          const x = px(cols[q.k]) - 40 + ((t - q.at + 0.2) / (q.dur + 0.2)) * 112;
          box(ctx, x, FL - 36, 40, 22, '#3B6EA5');
          box(ctx, x + 28, FL - 42, 14, 14, '#F2B705');
          box(ctx, x, FL - 14, 40, 3, '#222');
        }
      }
    }, 3),
  );
  return st;
}

/** a long run of spans where a truck lifts each plate out of its seat in turn */
export const actGaadi: Act = {
  id: 'pat06-gaadi',
  w: 118,
  advice: 'The traffic is heavy on this stretch: a truck lifts each plate out of its seat for a couple of seconds, in turn, with the plate shaking a second before. Wait on the deck, never on a plate, and cross a seam only while its plate is in and not shaking.',
  cps: [52.5, 88.5],
  paint: (g, c) => {
    for (let i = 0; i < 18; i++) g.fill(c.x + 6 + i * 6, c.x + 7 + i * 6, 15, 17, '.');
  },
  build: (w, c) => {
    const cols = Array.from({ length: 18 }, (_, i) => c.x + 6 + i * 6);
    const lifts: Lift[] = [];
    // seams open in a ripple: 2.2 s each, 1.6 s apart, repeating every 9 s
    for (let i = 0; i < 18; i++) for (let rep = 0; rep < 3; rep++) lifts.push({ k: i, at: 0.4 + i * 1.6 + rep * 29, dur: 2.2 });
    liftSeams(w, c.x, cols, 'pat6c', Array.from({ length: 18 }, (_, i) => i + 1), lifts, px(c.x + 2));
    sign(w, c.x + 2, 10.4, 3.2, 'TRAFFIC', 'shop', null, 'plates lifting');
  },
};

/** Kumhrar's polished pillar stumps (Mauryan polished sandstone, 80-pillar hall, Kumhrar, Patna): rough ones hold a
 *  walker, polished ones are slick. Source: https://en.wikipedia.org/wiki/Kumhrar */
export const actKumhrar: Act = {
  id: 'pat06-kumhrar',
  w: 80,
  advice: 'Kumhrar’s pillar hall: a row of stone stumps over the pit. The rough, grey ones are fine to stand on. The ones polished to a shine are slick: you slide right across them, so run on and jump from the far edge, and never stop on one.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 73, 15, 17, '.');
  },
  build: (w, c) => {
    // 12 stumps, each 3 tiles wide with a 2 tile gap; stumps 3, 6, 9 and 11 are polished
    const polished = new Set([2, 5, 8, 10]);
    const stumps: Rig[] = [];
    for (let i = 0; i < 12; i++) {
      const x = px(c.x + 4 + i * 6);
      const slick = polished.has(i);
      const r = w.add(
        new Rig(x, FL, 64, 48, {
          solid: true,
          layer: 2,
          paint: (ctx, st) => {
            box(ctx, st.x, st.y, st.w, 48, slick ? '#C9B79A' : '#7A6E5E');
            box(ctx, st.x, st.y, st.w, 3, slick ? '#F4EAD2' : '#9A8E7C');
            if (slick) {
              box(ctx, st.x + 6, st.y + 1, 14, 1, '#FFFFFF');
              box(ctx, st.x + 36, st.y + 6, 12, 1, '#FFFFFF');
              box(ctx, st.x + 10, st.y + 20, 8, 1, '#FFFFFF');
            } else for (let k = 0; k < 7; k++) box(ctx, st.x + 4 + k * 9, st.y + 4 + (k % 2) * 8, 4, 2, '#5C5246');
          },
        }),
      );
      r.solid!.slippery = slick;
      r.s.slick = slick;
      stumps.push(r);
    }
    w.flags.pat6k = { stumps };
    w.add(
      new Rig(px(c.x + 4), 256, px(70), 30, {
        layer: 4,
        cause: 'pat-jod',
        inset: 0,
        paint: (ctx, r) => {
          ctx.fillStyle = 'rgba(70,56,36,0.92)';
          ctx.fillRect(r.x, r.y, r.w, 30);
        },
      }),
    );
    sign(w, c.x + 1, 10.4, 3.2, 'KUMHRAR', 'shop', null, '80 pillars');
  },
};

export const ending: Ending = {
  space: 16,
  advice: 'The old toll booth no longer charges, but its sensor strip still works: step on it and the barrier slams down at the door. Step on it and wait back for the barrier to lift, or jump the strip.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const st = { down: -1 };
    w.flags.pat6e = st;
    w.flags.twist = 'toll';
    w.add(
      new Paint((ctx) => {
        // the sensor strip (yellow chevrons) and the booth with its window shut
        for (let i = 0; i < 6; i++) box(ctx, px(D - 9) + i * 8, FL - 1, 5, 1, '#F2B705');
        box(ctx, px(D + 2), FL - 44, 28, 44, '#B8503A');
        box(ctx, px(D + 2) + 4, FL - 34, 20, 12, '#2B2B30');
        box(ctx, px(D + 2) + 4, FL - 34, 20, 4, '#E6E1D6');
      }, -4),
    );
    w.add(
      new Rig(px(D - 3), FL - 30, 8, 30, {
        layer: 3,
        cause: 'pat-barrier',
        inset: 1,
        live: (_r, w2) => st.down >= 0 && since(w2, st.down) >= 0.4 && since(w2, st.down) < 3.0,
        tick: (_r, w2) => {
          const p = w2.player;
          const onStrip = p.onGround && p.cx >= px(D - 9) && p.cx < px(D - 6);
          if (onStrip && (st.down < 0 || since(w2, st.down) > 3.4)) {
            st.down = w2.tick;
            w2.sfx('thud', px(D - 3), FL - 20);
          }
        },
        paint: (ctx, r, w2) => {
          const t = st.down < 0 ? 9 : since(w2, st.down);
          const down = t >= 0.4 && t < 3.0;
          // a red and white boom: hinged at its post, up or slammed across
          box(ctx, r.x - 6, FL - 30, 4, 30, '#555');
          if (down) for (let i = 0; i < 5; i++) box(ctx, r.x - 2 + i * 0, FL - 28 + i * 6, 12, 5, i % 2 ? '#fff' : '#D7262E');
          else for (let i = 0; i < 5; i++) box(ctx, r.x - 4, FL - 6 - i * 0, 0, 0, '#fff');
          if (!down) for (let i = 0; i < 8; i++) box(ctx, r.x - 2 + i * 6, FL - 34 - i * 2, 6, 3, i % 2 ? '#fff' : '#D7262E');
        },
      }),
    );
  },
};

export const meta06 = { family: 'setu-joint-missing-plate', betrayals: ['missing-plate'], ending: 'pat-toll' };
