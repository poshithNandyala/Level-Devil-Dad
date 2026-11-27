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
import { Rig, box, folk } from './entities';
import { FL, channel, since, taraScript } from './common';

export interface BowlCfg {
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
          const under = t >= cfg.pour2[0] && t < cfg.pour2[1] && x + BW > x1 - 30;
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
        jug(x1 + 8, -1, p2 ? 1.2 : pre2 ? 0.45 + 0.04 * Math.sin(w2.tick / 6) : 0.12, p2);
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

/** act 8, the server (ALLOCATION v3 F470, bad coins that accelerate): a server on the far bank tosses fried
 *  badi into the trough of pakhala, faster and further each time. The first lands soft and floats across; the
 *  second he throws too hard and it goes under; from the third on they land on the near bank. Go at once. */
export const PHINGA = { c0: 4, c1: 13, serve: 16, v: 60, sink: 0.9 };
/** each throw: when (s), where it lands (act column; below c0 it lands on your bank and hurts), and whether a badi
 *  that lands in the water floats ('f') or goes under ('s') */
const THROWS: Record<'fast' | 'slow', { at: number[]; land: number[]; kind: string }> = {
  fast: { at: [0.9, 2.2, 3.2, 4.0, 4.6, 5.1, 5.5, 5.9, 6.3], land: [5.2, 4.3, 3.4, 2.5, 1.6, 1, 1, 1, 1], kind: 'fs' },
  // the finale's turn (law 7): he starts hard and long and slows down; the fourth lands soft
  slow: { at: [0.9, 1.6, 2.5, 3.6, 5.0], land: [2.8, 3.4, 4.6, 5.2, 5.2], kind: '..sff' },
};
export function phingaAct(id: string, key: string, slow = false): Act {
  const TH = THROWS[slow ? 'slow' : 'fast'];
  return {
  id,
  w: 20,
  advice: slow
    ? 'This server starts hard: his first throws land on your bank and the first in the water goes under. He slows down as he goes. Wait back from the rim, then ride the first soft one.'
    : 'The server on the far bank tosses badi into the trough, faster and further each time: the first lands soft and floats across, the second goes under, and the rest land on your bank. Do not stand and watch: hop on the first as it lands and ride it over.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + PHINGA.c0, c.x + PHINGA.c1);
  },
  build: (w, c) => {
    const st = { t0: -1, rode: -1, floats: [] as Rig[] };
    (w.flags[key] as unknown) = st;
    onPass(w, c.X(1), (w2) => (st.t0 = w2.tick));
    const ch = channel(w, c.x + PHINGA.c0, c.x + PHINGA.c1, 'bbi-pakhala', 'water');
    // the death line names the badi that went under you
    ch.o.tick = (r) => {
      r.hazard!.cause = st.rode >= 0 && TH.kind[st.rode] === 's' ? 'bbi-buda' : 'bbi-pakhala';
    };
    const T = (w2: World) => (st.t0 < 0 ? -1 : since(w2, st.t0));
    const sx = c.X(PHINGA.serve) + 4;
    const FLY = 0.55;
    TH.at.forEach((at, k) => {
      const lx = c.X(TH.land[k]);
      const inWater = TH.land[k] >= PHINGA.c0;
      // the badi in flight, and where it lands on the bank: hot, and it hurts
      w.add(
        new Rig(-999, -999, 14, 10, {
          cause: inWater ? undefined : 'bbi-badi',
          inset: 1,
          layer: 5,
          live: (r) => !inWater && r.y > FL - 40,
          tick: (r, w2) => {
            const tk = T(w2) - at;
            r.x = -999;
            r.y = -999;
            if (tk < 0 || tk > FLY + (inWater ? 0 : 0.25)) return;
            const u = Math.min(1, tk / FLY);
            r.x = sx + (lx - sx) * u;
            r.y = FL - 40 - 70 * Math.sin(Math.PI * u) + (inWater ? 16 * u : 30 * u);
          },
          paint: (ctx, r) => {
            if (r.x < -100) return;
            box(ctx, r.x, r.y, 14, 10, '#B5652B');
            box(ctx, r.x + 3, r.y + 2, 4, 3, '#E0A060');
          },
        }),
      );
      // the first two land in the water: the first floats across, the second goes under
      if (inWater)
        st.floats[k] = w.add(
          new Rig(-999, FL + 30, 26, 6, {
            solid: true,
            layer: 3,
            tick: (r, w2) => {
              const tk = T(w2) - at - FLY;
              if (tk < 0) {
                r.setSolid(false);
                return;
              }
              const gone = TH.kind[k] === 's' && tk > PHINGA.sink;
              r.setSolid(!gone);
              const x = Math.min(c.X(PHINGA.c1 + 1) - 26, lx + Math.max(0, tk - 0.2) * PHINGA.v);
              r.moveTo(w2, x, gone ? FL + 30 : FL - 4 + (TH.kind[k] === 's' ? Math.min(6, tk * 6) : 0));
              if (r.rides(w2) && st.rode < 0) st.rode = k;
            },
            paint: (ctx, r) => {
              if (!r.solid?.collidable) return;
              box(ctx, r.x, r.y, r.w, r.h, '#B5652B');
              box(ctx, r.x + 4, r.y + 1, 6, 2, '#E0A060');
              box(ctx, r.x + 15, r.y + 2, 5, 2, '#E0A060');
            },
          }),
        );
    });
    // the server
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 2,
        paint: (ctx, _r, w2) => {
          const t = T(w2);
          const throwing = TH.at.some((a) => t >= a - 0.2 && t < a);
          folk(ctx, c.X(PHINGA.serve) + 8, FL, 26, '#F28C28', { skirt: '#E9E1CF', face: -1, arm: throwing ? 1.0 : 0.2 });
          box(ctx, c.X(PHINGA.serve) + 14, FL - 10, 14, 10, '#9E9E9E');
        },
      }),
    );
  },
};
}
export const act8 = phingaAct('bbi08-phinga', 'bbi8ph');

/** act 9, the stir (ALLOCATION v3 F469): the uncle stirs the bowl and every badi goes round. Seen from the side,
 *  a badi on its circle is slow at the outer edge and fast through the middle: hop on and off only at the edge.
 *  Sit on one too long and his spoon scoops it. */
export const GHURNI = { c0: 4, c1: 19, a: 8, b: 15, r: 3.5, per: 4.0, spin: 50, scoop: 4.5 };
/** `rev` (the finale's turn, law 7): the stir is reversed: each badi idles through the middle of its swing and is
 *  flung round at the edges. Two small circles side by side: hop on, across and off in the middles */
const GHURNI_REV = { c0: 4, c1: 13, a: 6, b: 10, r: 2.2 };
export function ghurniAct(id: string, key: string, rev = false): Act {
  const G = rev ? { ...GHURNI, ...GHURNI_REV } : GHURNI;
  return {
  id,
  w: rev ? 17 : 24,
  advice: rev
    ? 'Tonight he stirs the other way: every badi idles through the middle of its swing and is flung round at the edges. Hop on, across and off only in the middle.'
    : 'The uncle is stirring: every badi goes round. From the side it is slow at the edge of its circle and fast through the middle. Hop on and off only at the slow edge, and do not sit on one for long: his spoon scoops it.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + G.c0, c.x + G.c1);
  },
  build: (w, c) => {
    const st = { t0: -1, rigs: [] as Rig[], th: [0, 0], u: [0, 0], du: [0, 0] };
    (w.flags[key] as unknown) = st;
    onPass(w, c.X(1), (w2) => (st.t0 = w2.tick));
    // reversed, what drops you in is a badi flung away at the edge of its swing: the death line says so
    // (QA fix round 2: only once you have been on a badi; a walk straight into the trough is the pakhala's)
    let rode = false;
    const ch = channel(w, c.x + G.c0, c.x + G.c1, 'bbi-pakhala', 'water');
    if (rev) ch.o.tick = (r) => { r.hazard!.cause = rode ? 'bbi-ghurni' : 'bbi-pakhala'; };
    const om = (2 * Math.PI) / G.per;
    [G.a, G.b].forEach((cx, i) => {
      // badi A starts at the near edge of its circle; B at the near edge of its own, so they meet edge to edge
      const sign = i === 0 || rev ? 1 : -1;
      const ride = { on: false, since: -1 };
      st.rigs[i] = w.add(
        new Rig(c.X(cx) - 13, FL - 4, 26, 6, {
          solid: true,
          layer: 3,
          tick: (r, w2) => {
            const t = st.t0 < 0 ? 0 : since(w2, st.t0);
            // A comes to its near edge 0.4 s after you pass the trigger, just as you reach the rim
            // reversed, A is already swinging in towards its middle as you reach the rim
            const th = Math.PI + (rev ? Math.PI - 0.95 : 0) + om * (t - 0.4);
            st.th[i] = th;
            let x = c.X(cx) + 8 + sign * G.r * 16 * Math.cos(th) - 13;
            let v = Math.abs(G.r * 16 * om * Math.sin(th));
            if (rev) {
              // reversed: an even swing, slowed right down through the middle and flung at the ends
              const u = (2 / Math.PI) * Math.asin(Math.sin(th));
              st.du[i] = u - st.u[i];
              st.u[i] = u;
              x = c.X(cx) + 8 + G.r * 16 * Math.sign(u) * Math.abs(u) ** 2.5 - 13;
              v = G.r * 16 * 2.5 * Math.abs(u) ** 1.5 * (4 / G.per);
            }
            r.moveTo(w2, x, FL - 4);
            const on = r.rides(w2);
            // jumping on while it races through the middle spins you off into the rim
            if (on && !ride.on && v > G.spin) w2.die('bbi-ghurni');
            if (on) rode = true;
            if (on && ride.since < 0) ride.since = w2.tick;
            if (!on) ride.since = -1;
            ride.on = on;
            r.s.spoon = on ? since(w2, ride.since) / G.scoop : 0;
            if (on && since(w2, ride.since) > G.scoop) w2.die('bbi-chamacha');
          },
          paint: (ctx, r) => {
            ctx.fillStyle = '#9C5A1E';
            ctx.beginPath();
            ctx.ellipse(r.x + 13, r.y + 3, 13, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, r.x + 5, r.y + 1, 2, 2, '#D08A3C');
            box(ctx, r.x + 15, r.y + 2, 2, 2, '#D08A3C');
            // the spoon comes down over a badi you have sat on too long
            const k = r.s.spoon as number;
            if (k > 0.6) box(ctx, r.x + 10, FL - 110 + 60 * Math.min(1, (k - 0.6) / 0.4), 6, 40, '#8D6E63');
          },
        }),
      );
    });
    // the uncle with his ladle on the far rim, stirring
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 2,
        paint: (ctx, _r, w2) => {
          const t = st.t0 < 0 ? 0 : since(w2, st.t0);
          folk(ctx, c.X(G.c1 + 2) + 8, FL, 26, '#2A9D8F', { skirt: '#E9E1CF', face: rev ? 1 : -1, arm: 0.4 + 0.3 * Math.sin(om * t) });
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 1;
          for (const cx of [G.a, G.b]) {
            ctx.beginPath();
            ctx.ellipse(c.X(cx) + 8, FL + 2, G.r * 16, 4, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        },
      }),
    );
  },
};
}
export const act9 = ghurniAct('bbi08-ghurni', 'bbi8gh');

/** ending (QA fix F4, plain): the old leaf-plate ride was the lift class laid flat. The road ends at the kitchen
 *  door, a pile of sal-leaf plates by it, and the door is the way out */
export const ending: Ending = {
  space: 6,
  advice: 'The kitchen door at the end of the yard, leaf plates stacked by it. Walk in.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-rosei-ghara';
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: -2,
        paint: (ctx) => {
          for (let i = 0; i < 4; i++) box(ctx, px(D - 2) + 2, FL - 4 - i * 3, 22, 2, i % 2 ? '#5D8A3A' : '#7FB15A');
        },
      }),
    );
  },
};

export const meta08 = { family: 'pakhala-pour-floats-grains', betrayals: ['pour-floats'], ending: 'bbi-rosei-ghara' };
