// KOH-02 Rassi Tan: the tug of war at the festival ground. The rope's woven middle section (the mat with the flag
// knot) is the only way over the ditch, and the two teams haul it to and fro: the team on the far side of the flag
// from Dad gains (his weight anchors his half), so the mat drifts AWAY from him. A moment after a heave settles, the
// trailing end (Dad's end) dips into the ditch. Stand just behind the flag to be carried to the far bank; past the
// flag the pull reverses, so step over only when the mat already lies on the far bank.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, ditch, since, taraScript } from './common';
import { lines as L } from './lines';

export interface Mat {
  rig: Rig;
  /** px/s the mat drifts at while a team gains */
  v: number;
  /** +1 the far team gains (mat drifts right), -1 the near team, 0 nobody */
  have: number;
  want: number;
  /** tick `want` last changed / tick `have` last changed */
  wantT: number;
  haveT: number;
  x0: number;
  x1: number;
  /** tiles of the trailing end that dip */
  dip: number;
  /** which end is dipped right now: -1 left, 1 right, 0 none */
  dipped: number;
}

/** ticks the teams take to answer a change of sides, and ticks of steady pull before the trailing end dips */
export const HEAVE = 60;
export const DIP_AFTER = 60;

/**
 * a tug-of-war mat over the ditch columns c0..c1 (open), `n` tiles long, resting at the near bank. `fast` is the act's
 * third team: the dip comes sooner.
 */
export function mat(w: World, c0: number, c1: number, n: number, key: string, o: { v?: number; dipAfter?: number } = {}): Mat {
  const W = px(n);
  const x0 = px(c0);
  const x1 = px(c1 + 1) - W + 24; // rests 1.5 tiles on to the far bank when hauled all the way
  const st: Mat = { rig: null as any, v: o.v ?? 48, have: -1, want: -1, wantT: 0, haveT: 0, x0, x1, dip: 2, dipped: 0 };
  const dipAfter = o.dipAfter ?? DIP_AFTER;
  ditch(w, x0 - 8, px(c1 + 1) + 8, 'koh-khai', FL + 12);
  const rig = w.add(
    new Rig(x0, FL, W, 8, {
      solid: true,
      layer: 2,
      cause: 'koh-dubki',
      inset: 0,
      live: () => false, // the dip zones are their own rigs
      tick: (r, w2) => {
        const p = w2.player;
        const on = w2.standing(r.solid!);
        const want = on ? (p.cx < r.x + W / 2 ? 1 : -1) : -1;
        if (want !== st.want) {
          st.want = want;
          st.wantT = w2.tick;
        }
        if (st.have !== st.want && w2.tick - st.wantT >= HEAVE) {
          st.have = st.want;
          st.haveT = w2.tick;
          if (on) w2.sfx('thud', r.x + (st.have > 0 ? W : 0), FL);
        }
        const nx = Math.max(st.x0, Math.min(st.x1, r.x + (st.have * st.v) / 120));
        const moved = Math.abs(nx - r.x) > 1e-6;
        r.solid!.velX = moved ? st.have * st.v : 0;
        if (moved) r.moveTo(w2, nx, FL);
        // a heave only settles while the mat is really being hauled
        if (!moved) st.haveT = w2.tick;
        // the trailing end dips once the pull has settled; the end on the far bank cannot dip
        const settled = w2.tick - st.haveT >= dipAfter;
        const overBank = st.have > 0 ? r.x + W > px(c1 + 1) : false;
        st.dipped = settled && !overBank && on ? -st.have : 0;
        r.s.dipped = st.dipped;
      },
      paint: (ctx, r) => {
        // the woven mat on the rope, the flag knot in the middle, the dipped end drawn tilted into the water
        const dipL = st.dipped < 0 ? 1 : 0;
        const dipR = st.dipped > 0 ? 1 : 0;
        for (let k = 0; k < n; k++) {
          const dy = (dipL && k < st.dip ? (st.dip - k) * 5 : 0) + (dipR && k >= n - st.dip ? (k - (n - st.dip) + 1) * 5 : 0);
          box(ctx, r.x + k * 16, r.y + dy, 16, 6, k % 2 ? '#B8863B' : '#C9A24B');
          box(ctx, r.x + k * 16, r.y + dy + 6, 16, 2, '#7A5A1E');
        }
        box(ctx, r.x + W / 2 - 1, r.y - 14, 2, 14, '#5D4037');
        box(ctx, r.x + W / 2 + 1, r.y - 14, 8, 6, '#C0392B');
        // the ropes to the two teams
        box(ctx, x0 - 60, r.y + 2, r.x - (x0 - 60), 2, '#A58A4A');
        box(ctx, r.x + W, r.y + 2, px(c1 + 1) + 60 - (r.x + W), 2, '#A58A4A');
      },
    }),
  );
  st.rig = rig;
  // the two dip zones: deadly while that end is dipped
  for (const side of [-1, 1]) {
    w.add(
      new Rig(0, FL - 2, px(st.dip), 12, {
        layer: 1,
        cause: 'koh-dubki',
        inset: 1,
        live: () => st.dipped === side,
        tick: (z) => {
          z.x = side < 0 ? rig.x : rig.x + W - px(st.dip);
        },
        paint: () => {},
      }),
    );
  }
  // the teams: four pullers each, leaning back when they gain
  w.add(
    new Paint((ctx, w2) => {
      for (let i = 0; i < 4; i++) {
        const lean = st.have < 0 ? -3 : 1;
        folk(ctx, x0 - 20 - i * 14 + lean, FL - 26 + ((w2.tick >> 4) + i) % 2, 26, i % 2 ? '#C0392B' : '#1B1B1B');
      }
      for (let i = 0; i < 4; i++) {
        const lean = st.have > 0 ? 3 : -1;
        folk(ctx, px(c1 + 1) + 20 + i * 14 + lean, FL - 26 + ((w2.tick >> 4) + i) % 2, 26, i % 2 ? '#2E7D32' : '#F2EFE4');
      }
    }, 1),
  );
  w.flags[key] = st;
  return st;
}

export function room(): LevelDef {
  return {
    id: 'KOH-02',
    city: 'KOH',
    index: 2,
    name: 'Rassi Tan',
    nameEn: 'Tug of war',
    tagline: 'Two teams, one rope, and the rope is the bridge.',
    hint: 'The woven middle of the rope is the only way over the ditch, and the teams haul it: the team on the far side of the flag from you gains, so the mat drifts away from you, and a moment later your end dips into the water. Walk to just behind the flag and stay there while the mat is hauled to the far bank. Step over the flag only when the mat already lies on the far bank, and walk off at once.',
    par: 30,
    map: Grid.ground(15).fill(8, 19, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      mat(w, 8, 19, 6, 'koh2');
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[1], 2.4);
          },
        }),
      );
      sign(w, 2, 10.4, 3.4, 'RASSI TAN', 'shop', null, 'tug of war');
      rival(w, 27, 15, -1, taraScript(2));
      collectible(w, 'koh-bamboo-shoot', 13.5, 11.2);
    },
  };
}

/** the third team: a longer ditch, a longer mat, and the pull answers you quicker (the labelled momentum beat: get to the flag at once) */
export const actTeen: Act = {
  id: 'koh02-teen',
  w: 34,
  advice: 'A third team has joined on the far bank, so the mat is longer and the heave comes quicker: your end dips sooner. Walk to just behind the flag at once and stay there; step over only when the mat lies on the far bank.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 5, c.x + 5 + 15, 15, 17, '.');
  },
  build: (w, c) => {
    mat(w, c.x + 5, c.x + 5 + 15, 8, 'koh2b', { dipAfter: 36, v: 56 });
    sign(w, c.x + 1, 10.4, 3, 'TEEN TEAM', 'shop', null, 'three teams');
  },
};

export const ending: Ending = {
  space: 16,
  advice: 'The winners’ stand with the door on it is hoisted up and set down again by the team. Walk in while it is down, and keep off the spot under it while it is up.',
  paint: () => {},
  build(w, d) {
    const DX = d.x;
    const st = { t0: -1 };
    w.flags.koh2e = st;
    w.flags.twist = 'hoist';
    const P = 4.0;
    const k = (w2: World) => {
      const t = st.t0 < 0 ? 0 : ((since(w2, st.t0) % P) + P) % P;
      // down 1.4 s, up over 0.6 s, high 1.4 s, down over 0.6 s
      return t < 1.4 ? 0 : t < 2.0 ? (t - 1.4) / 0.6 : t < 3.4 ? 1 : 1 - (t - 3.4) / 0.6;
    };
    w.when(
      (w2) => w2.player.cx > DX - px(14),
      (w2) => {
        st.t0 = w2.tick;
      },
    );
    const stand = w.add(
      new Rig(DX - 20, FL - 4, 56, 4, {
        solid: true,
        layer: 2,
        cause: 'koh-manch',
        inset: 2,
        live: (r) => r.s.k > 0.05 && r.s.k < 0.95 && r.s.dir < 0,
        tick: (r, w2) => {
          const kk = k(w2);
          r.s.dir = kk < (r.s.k ?? 0) ? -1 : kk > (r.s.k ?? 0) ? 1 : 0;
          r.s.k = kk;
          r.moveTo(w2, DX - 20, FL - 4 - kk * 56);
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#8D6E63');
          box(ctx, r.x, r.y, r.w, 2, '#D7CCC8');
          // the hoist ropes
          box(ctx, r.x + 4, 60, 2, r.y - 60, '#A58A4A');
          box(ctx, r.x + r.w - 6, 60, 2, r.y - 60, '#A58A4A');
          box(ctx, r.x - 6, 54, r.w + 12, 6, '#5D4037');
        },
      }),
    );
    w.flags.koh2s = stand;
    d.follow = () => ({ x: stand.x + 36, y: stand.y - 32 });
  },
};

export const meta02 = { family: 'tug-rope-bridge-drifts', betrayals: ['team-drift'], ending: 'koh-manch' };
