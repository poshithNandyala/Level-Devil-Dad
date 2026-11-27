// BBI-08 Pakhala: rice soaked in water, Odisha's cure for a hot day, eaten with fried badi. A giant bell-metal
// bowl of settled rice is a floor, and a jug sits on its rim, tilting, from the first moment. Walk in and it
// pours: the water comes up, the grains float apart, and the floor is gone. Only the badi float. Stand on one
// before the jug tips. Then the second jug pours from the other rim: the badi under it goes under, and the
// current turns. Hop to the next one, and ride it back to the rim when the water settles.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { FL, channel, since, taraScript } from './common';

export interface BowlCfg {
  /** the second pour comes from a jug held over these badi (by index), not from the right rim */
  over?: number[];
  /** inside of the bowl: columns c0..c1 (rims at c0-1 and c1+1) */
  c0: number;
  c1: number;
  /** badi columns (left edge) */
  badi: number[];
  /** first pour (left jug): when it starts and stops; second (right jug) likewise */
  pour1: [number, number];
  pour2: [number, number];
  /** the current: px/s right during pour 1, left during pour 2, right again after */
  v1: number;
  v2: number;
  v3: number;
}
const SURF = FL - 20;
const BW = 26;

export interface BowlSt {
  t: number;
  water: number;
  rice: boolean;
  badis: Rig[];
}

/** a bowl of pakhala over a pit (cut c0..c1); rims are map tiles at c0-1 and c1+1, rows 13-14 */
export function bowl(w: World, cfg: BowlCfg, t0: () => number, key: string) {
  const st: BowlSt = { t: -1, water: FL + 4, rice: true, badis: [] };
  (w.flags[key] as unknown) = st;
  const x0 = px(cfg.c0);
  const x1 = px(cfg.c1 + 1);
  const T = (w2: World) => (t0() < 0 ? -1 : since(w2, t0()));
  // the settled rice: a floor until the grains float apart
  const rice = w.add(
    new Rig(x0, FL, x1 - x0, 8, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        const t = T(w2);
        st.t = t;
        // the water: up while the first jug pours, a little more with the second
        const p1 = Math.max(0, Math.min(1, (t - cfg.pour1[0]) / 1.0));
        st.water = t < 0 ? FL + 4 : FL + 4 - 24 * p1;
        st.rice = t < cfg.pour1[0] + 1.2;
        r.setSolid(st.rice);
      },
      paint: (ctx, r) => {
        if (st.rice) {
          box(ctx, r.x, r.y, r.w, 8, '#F3EEDC');
          for (let x = r.x + 2; x < r.x + r.w; x += 5) box(ctx, x, r.y + 1 + ((x * 7) % 4), 3, 1, '#FFFFFF');
        } else {
          // the grains, floating apart
          for (let x = r.x + 2; x < r.x + r.w; x += 7) box(ctx, x + ((x * 13) % 5), st.water + 2 + ((x * 3) % 9), 3, 1, '#FFFFFF');
        }
      },
    }),
  );
  void rice;
  // the water (deadly once the rice has gone: you sink in pakhala)
  w.add(
    new Rig(x0, FL + 6, x1 - x0, 60, {
      cause: 'bbi-pakhala',
      inset: 0,
      layer: 4,
      live: () => !st.rice,
      tick: (r, w2) => {
        r.hazard!.cause = (w2.flags.bbi8why as string) ?? 'bbi-pakhala';
      },
      paint: (ctx, _r) => {
        if (st.water < FL + 4) {
          ctx.fillStyle = 'rgba(236,232,214,0.72)';
          ctx.fillRect(x0, st.water, x1 - x0, FL + 48 - st.water);
          box(ctx, x0, st.water, x1 - x0, 1, 'rgba(255,255,255,0.9)');
        }
      },
    }),
  );
  // the badi: on the rice, then floating with the water and drifting with the current
  cfg.badi.forEach((c, i) => {
    const bx0 = px(c);
    const maxX = x1 - BW - 4 - (cfg.badi.length - 1 - i) * 34;
    const minX = x0 + 4 + i * 34;
    const b = w.add(
      new Rig(bx0, FL - 8, BW, 8, {
        solid: true,
        layer: 5,
        tick: (r, w2) => {
          const t = st.t;
          let x = (r.s.fx as number | undefined) ?? r.x;
          if (t >= 0) {
            const v = t >= cfg.pour1[0] && t < cfg.pour1[1] ? cfg.v1 : t >= cfg.pour2[0] && t < cfg.pour2[1] ? -cfg.v2 : t >= cfg.pour2[1] ? cfg.v3 : 0;
            x = Math.max(minX, Math.min(maxX, x + v / 120));
          }
          r.s.fx = x;
          // under the second jug's stream it is pushed under
          const under = t >= cfg.pour2[0] && t < cfg.pour2[1] && (cfg.over ? cfg.over.includes(i) : x + BW > x1 - 30);
          if (under && !r.s.under && r.rides(w2)) w2.flags.bbi8why = 'bbi-dhara';
          r.s.under = under;
          r.setSolid(!under);
          const y = st.rice ? FL - 8 : st.water - 4 + (under ? 14 : 0);
          r.moveTo(w2, x, y);
        },
        paint: (ctx, r) => {
          if (r.s.under) return;
          ctx.fillStyle = '#9C5A1E';
          ctx.beginPath();
          ctx.ellipse(r.x + BW / 2, r.y + 4, BW / 2, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
          box(ctx, r.x + 4, r.y + 1, 2, 2, '#D08A3C');
          box(ctx, r.x + 11, r.y + 2, 2, 2, '#D08A3C');
        },
      }),
    );
    st.badis.push(b);
  });
  // the bowl itself and the two jugs on its rims
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 6,
      paint: (ctx, _r, w2) => {
        const t = T(w2);
        // the kansa bowl's golden rim
        box(ctx, x0 - 16, FL - 32, 16, 32, '#C9A13B');
        box(ctx, x1, FL - 32, 16, 32, '#C9A13B');
        box(ctx, x0 - 16, FL - 33, 16, 3, '#E8C766');
        box(ctx, x1, FL - 33, 16, 3, '#E8C766');
        const jug = (jx: number, face: 1 | -1, tilt: number, pouring: boolean) => {
          ctx.save();
          ctx.translate(jx, FL - 34);
          ctx.rotate(face * tilt);
          ctx.fillStyle = '#B0563A';
          ctx.beginPath();
          ctx.ellipse(0, -10, 9, 10, 0, 0, Math.PI * 2);
          ctx.fill();
          box(ctx, -4, -24, 8, 5, '#B0563A');
          box(ctx, -5, -14, 10, 2, '#E9C46A');
          ctx.restore();
          if (pouring) {
            box(ctx, jx + face * 12, FL - 36, 5, 36 + (FL - st.water), 'rgba(236,232,214,0.9)');
          } else if (tilt > 0.3) box(ctx, jx + face * 12, FL - 32 + ((w2.tick >> 3) % 4) * 3, 2, 2, 'rgba(236,232,214,0.9)');
        };
        // the left jug tilts on the rim from the very first moment (the tell); it tips when you come in
        const wob = 0.42 + 0.04 * Math.sin(w2.tick / 14);
        const p1 = t >= cfg.pour1[0] && t < cfg.pour1[1];
        jug(x0 - 8, 1, p1 ? 1.2 : t >= cfg.pour1[1] ? 0.2 : wob, p1);
        const p2 = t >= cfg.pour2[0] && t < cfg.pour2[1];
        const pre2 = t >= cfg.pour2[0] - 1.2 && t < cfg.pour2[0];
        if (!cfg.over) jug(x1 + 8, -1, p2 ? 1.2 : pre2 ? 0.45 + 0.04 * Math.sin(w2.tick / 6) : 0.12, p2);
        else
          // a second jug, held high by the cook, over the badi it will push under
          for (const i of cfg.over) {
            const b = st.badis[i];
            const bx = ((b.s.fx as number | undefined) ?? b.x) + BW / 2;
            ctx.save();
            ctx.translate(bx - 10, FL - 92);
            ctx.rotate(p2 ? 1.0 : pre2 ? 0.35 : 0.1);
            ctx.fillStyle = '#8D6E63';
            ctx.beginPath();
            ctx.ellipse(0, -8, 8, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, -5, -12, 10, 2, '#E9C46A');
            ctx.restore();
            if (p2) box(ctx, bx - 2, FL - 86, 5, 86 + (FL - st.water) - 20, 'rgba(236,232,214,0.9)');
          }
      },
    }),
  );
  return st;
}

/** act 6, the drain (pakhala family): a bowl being emptied through a hole by the far rim. The cook drops a badi
 *  in at the near rim every few seconds and the water carries it to the hole, where it goes down. The badi is
 *  still the only floor, and it takes you down with it. A2: hop off before the hole. A3: only at the very last
 *  moment: from further out, the far rim is out of reach. */
export const DRAIN = { c0: 4, c1: 15, hole: 14, v: 24, per: 8, n: 2 };
export const act6: Act = {
  id: 'bbi08-bhanwar',
  w: 22,
  advice: 'This bowl is being emptied through a hole by the far rim. The badi still float, but the water carries each one to the hole and down. Ride one, and hop up on to the far rim at the very last moment: any sooner and the rim is out of reach.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + DRAIN.c0, c.x + DRAIN.c1).fill(c.x + DRAIN.c0 - 1, c.x + DRAIN.c0 - 1, 13, 14, '#').fill(c.x + DRAIN.c1 + 1, c.x + DRAIN.c1 + 1, 13, 14, '#');
  },
  build: (w, c) => {
    const x0 = c.X(DRAIN.c0);
    const x1 = c.X(DRAIN.c1 + 1);
    const hx = c.X(DRAIN.hole) + 8;
    const st = { t0: -1, why: 'bbi-pakhala', s: [] as number[], badis: [] as Rig[] };
    w.flags.bbi8dr = st;
    onPass(w, c.X(0.5), (w2) => { if (st.t0 < 0) st.t0 = w2.tick; });
    w.add(
      new Rig(x0, FL - 2, x1 - x0, 60, {
        cause: 'bbi-pakhala',
        inset: 0,
        layer: 4,
        tick: (r) => {
          r.hazard!.cause = st.why;
        },
        paint: (ctx, _r, w2) => {
          ctx.fillStyle = 'rgba(236,232,214,0.72)';
          ctx.fillRect(x0, FL - 4, x1 - x0, 52);
          box(ctx, x0, FL - 4, x1 - x0, 1, 'rgba(255,255,255,0.9)');
          // the whirl over the hole
          ctx.strokeStyle = 'rgba(120,110,90,0.8)';
          ctx.lineWidth = 1;
          for (let k = 1; k <= 3; k++) {
            ctx.beginPath();
            ctx.ellipse(hx, FL - 2, 5 * k, 1.6 * k, 0, (w2.tick / 8 + k) % 6, ((w2.tick / 8 + k) % 6) + 4);
            ctx.stroke();
          }
          // the cook at the near rim with his basket of badi
          box(ctx, x0 - 30, FL - 12, 12, 8, '#8D6E63');
        },
      }),
    );
    for (let k = 0; k < DRAIN.n; k++) {
      st.s.push(-1);
      const b = w.add(
        new Rig(x0 + 2, FL - 8, BW, 8, {
          solid: true,
          layer: 5,
          tick: (r, w2) => {
            if (st.t0 < 0) {
              r.setSolid(false);
              return;
            }
            const s2 = (since(w2, st.t0) + (k * DRAIN.per) / DRAIN.n) % DRAIN.per;
            st.s[k] = s2;
            const x = x0 + 2 + s2 * DRAIN.v;
            const under = x + BW / 2 > hx - 6;
            if (under && r.solid?.collidable && r.rides(w2)) st.why = 'bbi-bhanwar';
            r.setSolid(!under);
            r.moveTo(w2, Math.min(x, hx - BW / 2), under ? FL + 10 : FL - 8);
          },
          paint: (ctx, r) => {
            if (!r.solid?.collidable) return;
            ctx.fillStyle = '#9C5A1E';
            ctx.beginPath();
            ctx.ellipse(r.x + BW / 2, r.y + 4, BW / 2, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, r.x + 4, r.y + 1, 2, 2, '#D08A3C');
            box(ctx, r.x + 11, r.y + 2, 2, 2, '#D08A3C');
          },
        }),
      );
      st.badis.push(b);
    }
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 6,
        paint: (ctx) => {
          box(ctx, x0 - 16, FL - 32, 16, 32, '#C9A13B');
          box(ctx, x1, FL - 32, 16, 32, '#C9A13B');
          box(ctx, x0 - 16, FL - 33, 16, 3, '#E8C766');
          box(ctx, x1, FL - 33, 16, 3, '#E8C766');
        },
      }),
    );
  },
};

/** act 7, the plug (pakhala family, the drain turned stale): this bowl drains through a hole in its middle, and
 *  the hole is only a badi wide. Your badi drifts for it from the near side, another from the far side, slower.
 *  The far rim is too far from the hole to reach, so the bhanwar answer (hop at the last moment) falls short.
 *  The answer feeds the drain: hop across to the other badi and let yours go down the hole; it plugs it, the
 *  water stops, and the far rim is a hop away. */
export const PLUG = { c0: 4, c1: 13, hole: 9, v1: 24, v2: 5, b1: 4.6, b2: 12.6 };
export const act7: Act = {
  id: 'bbi08-dati',
  w: 20,
  advice: 'The hole in this bowl is only a badi wide, and the far rim is too far from it to reach. Don’t ride your badi to the hole: hop across to the other one, let yours go down and plug the hole, and the water stops.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + PLUG.c0, c.x + PLUG.c1).fill(c.x + PLUG.c0 - 1, c.x + PLUG.c0 - 1, 13, 14, '#').fill(c.x + PLUG.c1 + 1, c.x + PLUG.c1 + 1, 13, 14, '#');
  },
  build: (w, c) => {
    const x0 = c.X(PLUG.c0);
    const x1 = c.X(PLUG.c1 + 1);
    const hx = c.X(PLUG.hole) + 8;
    const st = { t0: -1, plugged: false, why: 'bbi-pakhala', bx: [c.X(PLUG.b1) - BW / 2, c.X(PLUG.b2) - BW / 2], down: [false, false], badis: [] as Rig[] };
    w.flags.bbi8pl = st;
    w.add(
      new Rig(x0, FL - 2, x1 - x0, 60, {
        cause: 'bbi-pakhala',
        inset: 0,
        layer: 4,
        tick: (r) => {
          r.hazard!.cause = st.why;
        },
        paint: (ctx, _r, w2) => {
          ctx.fillStyle = 'rgba(236,232,214,0.72)';
          ctx.fillRect(x0, FL - 4, x1 - x0, 52);
          box(ctx, x0, FL - 4, x1 - x0, 1, 'rgba(255,255,255,0.9)');
          if (!st.plugged) {
            ctx.strokeStyle = 'rgba(120,110,90,0.8)';
            ctx.lineWidth = 1;
            for (let k = 1; k <= 2; k++) {
              ctx.beginPath();
              ctx.ellipse(hx, FL - 2, 5 * k, 1.6 * k, 0, (w2.tick / 8 + k) % 6, ((w2.tick / 8 + k) % 6) + 4);
              ctx.stroke();
            }
          }
          box(ctx, x0 - 16, FL - 32, 16, 32, '#C9A13B');
          box(ctx, x1, FL - 32, 16, 32, '#C9A13B');
        },
      }),
    );
    [0, 1].forEach((k) => {
      const b = w.add(
        new Rig(st.bx[k], FL - 8, BW, 8, {
          solid: true,
          layer: 5,
          tick: (r, w2) => {
            if (st.t0 < 0 && k === 0 && r.rides(w2)) st.t0 = w2.tick;
            if (st.down[k]) {
              r.setSolid(false);
              return;
            }
            if (st.t0 >= 0 && !st.plugged) st.bx[k] += ((k === 0 ? 1 : -1) * (k === 0 ? PLUG.v1 : PLUG.v2)) / 120;
            const atHole = k === 0 ? st.bx[k] + BW / 2 >= hx - 4 : st.bx[k] + BW / 2 <= hx + 4;
            if (atHole && !st.plugged) {
              if (r.rides(w2)) {
                st.down[k] = true;
                st.why = 'bbi-bhanwar';
                r.setSolid(false);
                return;
              }
              // an empty badi the size of the hole: it plugs it, and the water stops
              st.plugged = true;
              st.bx[k] = hx - BW / 2;
            }
            r.moveTo(w2, st.bx[k], st.plugged && atHole ? FL - 6 : FL - 8);
          },
          paint: (ctx, r) => {
            if (!r.solid?.collidable) return;
            ctx.fillStyle = '#9C5A1E';
            ctx.beginPath();
            ctx.ellipse(r.x + BW / 2, r.y + 4, BW / 2, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, r.x + 4, r.y + 1, 2, 2, '#D08A3C');
          },
        }),
      );
      st.badis.push(b);
    });
  },
};

export const B08: BowlCfg = { c0: 7, c1: 24, badi: [9, 14, 20], pour1: [0.6, 3.0], pour2: [3.8, 6.0], v1: 30, v2: 40, v3: 45 };

export function room(): LevelDef {
  return {
    id: 'BBI-08',
    city: 'BBI',
    index: 8,
    name: 'Pakhala',
    nameEn: 'Rice in water',
    tagline: 'Pakhala: cooked rice soaked in water, eaten cool on a hot afternoon with fried badi on the side. This bowl hasn’t had its water yet.',
    hint: 'The settled rice is a floor only until the water goes in: the jug on the left rim is already tilting, and it tips the moment you step in. Then the grains float apart. Stand on a badi before it pours: badi float. When the second jug on the right rim pours, the badi under it goes under and the current turns: be on the middle one, not the one by the right rim. When the water settles it drifts you back to the rim: hop out.',
    par: 30,
    map: Grid.ground(15).pit(B08.c0, B08.c1).fill(B08.c0 - 1, B08.c0 - 1, 13, 14, '#').fill(B08.c1 + 1, B08.c1 + 1, 13, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = { t0: -1 };
      w.flags.bbi8r = st;
      onPass(w, px(B08.c0) + 4, (w2) => (st.t0 = w2.tick));
      bowl(w, B08, () => st.t0, 'bbi8');
      sign(w, 2.5, 10.4, 3, 'PAKHALA', 'shop', null, 'thanda');
      rival(w, 2, 15, 1, taraScript(8));
      onPass(w, px(3), (w2) => w2.guide('Ethare garam hue! | It’s hot here!', (w3) => w3.player.cx < px(6)));
      collectible(w, 'bbi-badi', 16, 9.8);
    },
  };
}

/** act: a smaller bowl, both jugs at once from the start of the pour, and the badi in the middle only */
export const B08A: BowlCfg = { c0: 4, c1: 15, badi: [6, 10], pour1: [0.5, 2.4], pour2: [2.4, 4.0], v1: 35, v2: 30, v3: 40 };
export const act: Act = {
  id: 'bbi08-kansa',
  w: 22,
  advice: 'A smaller bowl with two badi. The same rule: on a badi before the jug tips, and not on the one the right jug will push under. Ride back to the rim and hop out.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + B08A.c0, c.x + B08A.c1).fill(c.x + B08A.c0 - 1, c.x + B08A.c0 - 1, 13, 14, '#').fill(c.x + B08A.c1 + 1, c.x + B08A.c1 + 1, 13, 14, '#');
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi8a = st;
    onPass(w, c.X(B08A.c0) + 4, (w2) => (st.t0 = w2.tick));
    bowl(w, { ...B08A, c0: c.x + B08A.c0, c1: c.x + B08A.c1, badi: B08A.badi.map((k) => c.x + k) }, () => st.t0, 'bbi8b');
  },
};

/** act 5: four badi and two jugs held over two of them */
export const B08E: BowlCfg = { c0: 4, c1: 24, badi: [6, 11, 16, 20], pour1: [0.5, 2.8], pour2: [3.4, 6.0], v1: 30, v2: 15, v3: 25, over: [0, 2] };
export const act5: Act = {
  id: 'bbi08-dui',
  w: 31,
  advice: 'Four badi and two jugs held over two of them. Watch where the jugs hang and ride one of the other two.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + B08E.c0, c.x + B08E.c1).fill(c.x + B08E.c0 - 1, c.x + B08E.c0 - 1, 13, 14, '#').fill(c.x + B08E.c1 + 1, c.x + B08E.c1 + 1, 13, 14, '#');
  },
  build: (w, c) => {
    const st = { t0: -1 };
    onPass(w, c.X(B08E.c0) + 4, (w2) => (st.t0 = w2.tick));
    bowl(w, { ...B08E, c0: c.x + B08E.c0, c1: c.x + B08E.c1, badi: B08E.badi.map((k) => c.x + k) }, () => st.t0, 'bbi8h');
  },
};

/** ending: a trough of pakhala water before the door; a sal-leaf plate floats in it, and turns over when it
 *  reaches the door's side, so step off on to the step before it gets there */
export const ending: Ending = {
  space: 14,
  advice: 'A trough of pakhala before the door with a sal-leaf plate floating in it. Ride the plate across, but step off on to the door’s step before it reaches the far end: there it turns over.',
  paint: (g, D) => {
    g.pit(D - 8, D - 2);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-leaf-plate';
    const st = { t0: -1, x: px(D - 8) + 2, flipped: false };
    w.flags.bbi8e = st;
    channel(w, D - 8, D - 2, 'bbi-pakhala', 'water');
    onPass(w, px(D - 9), (w2) => (st.t0 = w2.tick));
    w.add(
      new Rig(st.x, FL - 4, 30, 6, {
        solid: true,
        layer: 4,
        tick: (r, w2) => {
          if (st.t0 < 0) return;
          const t = since(w2, st.t0);
          // it drifts over once it's been stepped on, and turns over at the far wall
          if (r.rides(w2)) st.flipped = st.flipped || false;
          if (t > 0.6) {
            const nx = Math.min(px(D - 2) - 30, st.x + (t - 0.6) * 50);
            r.moveTo(w2, nx, FL - 4);
            const atEnd = nx >= px(D - 2) - 31;
            if (atEnd && !st.flipped) {
              st.flipped = true;
              r.s.flipAt = w2.tick;
            }
          }
          r.setSolid(!st.flipped);
        },
        paint: (ctx, r) => {
          if (st.flipped) {
            box(ctx, r.x + 4, FL + 18, 22, 3, '#3F7A3A');
            return;
          }
          box(ctx, r.x, r.y, r.w, 4, '#5D8A3A');
          box(ctx, r.x + 2, r.y - 1, r.w - 4, 1, '#7FB15A');
          for (let i = 0; i < 4; i++) box(ctx, r.x + 4 + i * 7, r.y + 1, 1, 2, '#3F6B2A');
        },
      }),
    );
  },
};

export const meta08 = { family: 'pakhala-pour-floats-grains', betrayals: ['pour-floats'], ending: 'bbi-leaf-plate' };
