// PAT-05 Pipa Pul: the pontoon bridge. A deck of floating sections sinks under the heaviest thing on it, and the
// loaded handcart rolls to and fro along it: the section under the cart goes awash. Act: a longer deck with two
// carts. Door: the last float comes unhooked and drifts off with the door on it.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, perTick } from './entities';
import { since, taraScript } from './common';
import { onPass } from '../../levels/trolls';
import { lines as L } from './lines';

const FL = 240;
const SEC = 40;
/** a section is awash (deadly to stand on) once its top is below this */
const WATERLINE = 256;

function water(w: World, x0: number, x1: number, tag: string) {
  const rig = w.add(
    new Rig(x0, WATERLINE, x1 - x0, 40, {
      layer: 4,
      cause: 'pat-ganga',
      inset: 0,
      paint: (ctx, r, w2) => {
        const g = ctx.createLinearGradient(0, r.y - 6, 0, r.y + 34);
        g.addColorStop(0, 'rgba(160,140,100,0.9)');
        g.addColorStop(1, 'rgba(80,66,44,0.97)');
        ctx.fillStyle = g;
        ctx.fillRect(r.x, r.y - 6, r.w, 40);
        ctx.strokeStyle = 'rgba(255,241,201,0.5)';
        ctx.lineWidth = 0.8;
        for (let x = r.x + ((w2.tick * 0.3) % 14); x < r.x + r.w - 6; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x, r.y - 4);
          ctx.lineTo(x + 6, r.y - 4);
          ctx.stroke();
        }
      },
    }),
  );
  void tag;
  return rig;
}

export interface Pontoon {
  secs: Rig[];
  carts: Rig[];
  water?: Rig;
}

/** a deck of `n` floating sections from tile column c0; each cart rolls to and fro between the sections [lo, hi] at v px/s */
export function pontoon(w: World, c0: number, n: number, carts: { lo: number; hi: number; v: number; phase: number }[], key: string): Pontoon {
  const secs: Rig[] = [];
  const cartRigs: Rig[] = [];
  const x0 = px(c0);
  const cartAt = (i: number, w2: World) => {
    const c = carts[i];
    const a = x0 + c.lo * SEC + SEC / 2;
    const b = x0 + c.hi * SEC + SEC / 2;
    const span = b - a;
    const per = (2 * span) / c.v + 2 * 1.2;
    const t = (((w2.tick / 120 + c.phase) % per) + per) % per;
    // go right, rest 1.2 s, come back, rest 1.2 s
    const run = span / c.v;
    if (t < run) return { x: a + t * c.v, dir: 1 };
    if (t < run + 1.2) return { x: b, dir: 0 };
    if (t < 2 * run + 1.2) return { x: b - (t - run - 1.2) * c.v, dir: -1 };
    return { x: a, dir: 0 };
  };
  for (let i = 0; i < n; i++) {
    const r = w.add(
      new Rig(x0 + i * SEC, FL, SEC, 20, {
        solid: true,
        layer: 2,
        near: 900,
        cause: 'pat-pipa',
        inset: -3,
        live: (s) => s.y >= 250,
        tick: (s, w2) => {
          // a cart over this section sinks it; Dad's own weight a little
          let target = s.s.awash ? FL + 26 : FL;
          for (let k = 0; k < carts.length; k++) if (Math.abs(cartAt(k, w2).x - (s.x + SEC / 2)) < SEC / 2) target = FL + 26;
          if (target === FL && w2.standing(s.solid!)) target = FL + 4;
          const cur = s.y;
          const next = cur < target ? Math.min(target, cur + 100 / 120) : Math.max(target, cur - 60 / 120);
          s.moveTo(w2, s.x, Math.round(next * 4) / 4);
        },
        paint: (ctx, s) => {
          // a steel deck on a row of blue drums
          box(ctx, s.x, s.y, s.w, 5, '#7A8087');
          box(ctx, s.x, s.y, s.w, 2, '#A6ADB4');
          for (let k = 0; k < 3; k++) box(ctx, s.x + 4 + k * 15, s.y + 6, 11, 14, '#2F6BB0');
        },
      }),
    );
    secs.push(r);
  }
  for (let i = 0; i < carts.length; i++) {
    const r = w.add(
      new Rig(0, 0, 26, 22, {
        layer: 3,
        tick: (c, w2) => {
          const p = cartAt(i, w2);
          c.x = p.x - 13;
          // ride on the deck under it
          const s = secs.find((q) => Math.abs(p.x - (q.x + SEC / 2)) < SEC / 2);
          c.y = (s ? s.y : FL) - 22;
          c.s.dir = p.dir;
          c.s.cx = p.x;
        },
        paint: (ctx, c) => {
          // a handcart heaped with sacks of grain
          box(ctx, c.x, c.y + 8, 26, 10, '#6B3F1C');
          box(ctx, c.x + 2, c.y, 22, 9, '#C9A56B');
          box(ctx, c.x + 6, c.y - 3, 14, 5, '#E3C58A');
          ctx.fillStyle = '#1D1A1A';
          ctx.beginPath();
          ctx.arc(c.x + 6, c.y + 19, 4, 0, Math.PI * 2);
          ctx.arc(c.x + 20, c.y + 19, 4, 0, Math.PI * 2);
          ctx.fill();
        },
      }),
    );
    cartRigs.push(r);
  }
  const pt: Pontoon = { secs, carts: cartRigs };
  w.flags[key] = pt;
  pt.water = water(w, x0 - 2, x0 + n * SEC + 2, key);
  w.add(
    new Paint((ctx) => {
      // mooring chains at both ends
      for (const mx of [x0 - 8, x0 + n * SEC + 2]) box(ctx, mx, FL - 8, 6, 8, '#555');
    }, 1),
  );
  return pt;
}

export function room(): LevelDef {
  return {
    id: 'PAT-05',
    city: 'PAT',
    index: 5,
    name: 'Pipa Pul',
    nameEn: 'The pontoon bridge',
    tagline: 'A bridge that floats. It floats less where the cart is.',
    hint: 'Each section floats on its drums and sinks under the heaviest thing on it: the loaded cart rolls to and fro, and the section under it goes under the Ganga. Never stand on a section the cart is on or is rolling on to. To get past it, jump over its section from the edge of the one next to it, and do not wait on a section the cart is coming towards.',
    par: 24,
    map: Grid.ground(15).fill(6, 20, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pontoon(w, 6, 6, [{ lo: 1, hi: 4, v: 38, phase: 0.2 }], 'pat5');
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.win[1], 2.4);
          },
        }),
      );
      sign(w, 2, 10.4, 3.4, 'PIPA PUL', 'shop', null, 'pontoon');
      rival(w, 26, 15, -1, taraScript(5));
      collectible(w, 'pat-makhana', 15, 11.4);
    },
  };
}

export const act: Act = {
  id: 'pat05-ghat',
  w: 38,
  advice: 'A longer deck from the ghat, and a longer roll for the cart: it goes nearly the whole way along and back. Wait on the bank for it to come back towards you, and jump over its section just as before.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 28, 15, 17, '.');
  },
  build: (w, c) => {
    pontoon(w, c.x + 4, 10, [{ lo: 1, hi: 7, v: 46, phase: 0.5 }], 'pat5a');
    sign(w, c.x + 1, 10.4, 3, 'GHAT', 'shop', null, 'steps');
  },
};

export const act2: Act = {
  id: 'pat05-sangam',
  w: 46,
  advice: 'The last stretch of the pontoon is the longest, and the cart is quicker and goes nearly the whole way along it. Wait on the bank for it to start back towards you, and jump over its section.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 4 + 29, 15, 17, '.');
  },
  build: (w, c) => {
    pontoon(w, c.x + 4, 12, [{ lo: 1, hi: 9, v: 54, phase: 0.3 }], 'pat5b');
    sign(w, c.x + 1, 10.4, 3, 'SANGAM', 'shop', null, 'by the ghat');
  },
};

export interface Drop {
  /** section index, seconds after Dad reaches the bank, and how long the sack keeps it awash */
  k: number;
  at: number;
  dur: number;
  /** the section the sack hangs over first; if it is not `k` the sack slides along its rope to `k` just before it lands */
  from?: number;
}

/** a deck where porters drop sacks on sections: a sack hangs above a section for a second, drops, and the section
 *  stays awash while it lies there. The plan is the same every time. */
export function sackDeck(w: World, c0: number, n: number, key: string, plan: Drop[], lead = 200) {
  const pt = pontoon(w, c0, n, [], key);
  const st = { t0: -1, plan };
  w.flags[key + 't'] = st;
  w.when(
    (w2) => w2.player.cx >= px(c0) - lead,
    (w2) => {
      st.t0 = w2.tick;
    },
  );
  w.onTick((w2) => {
    const t = st.t0 < 0 ? -99 : since(w2, st.t0);
    pt.secs.forEach((sec, i) => {
      sec.s.awash = plan.some((q) => q.k === i && t >= q.at && t < q.at + q.dur);
    });
    // a sack that slid lands on whoever stands on its section
    const p = w2.player;
    for (const q of plan) {
      if (q.from === undefined || q.from === q.k || t < q.at || t >= q.at + 0.1) continue;
      const sx = pt.secs[q.k].x;
      if (p.cx >= sx && p.cx < sx + SEC && p.y + p.h < FL + 12) w2.die('pat-bori');
    }
  });
  w.add(
    new Paint((ctx, w2) => {
      const t = st.t0 < 0 ? -99 : since(w2, st.t0);
      for (const q of plan) {
        const sx = px(c0) + q.k * SEC + SEC / 2;
        if (t >= q.at - 1.2 && t < q.at) {
          // the porter's sack swinging on its rope above the section (or sliding along it to the section it will land on)
          const f = q.from ?? q.k;
          const slide = f === q.k ? 1 : Math.max(0, Math.min(1, (t - (q.at - 0.7)) / 0.6));
          const hx = px(c0) + (f + (q.k - f) * slide) * SEC + SEC / 2;
          const sw = Math.sin(w2.tick / 5) * 2 + (hx - sx);
          if (f !== q.k) box(ctx, Math.min(sx, px(c0) + f * SEC + SEC / 2) - 10, FL - 80, Math.abs(sx - (px(c0) + f * SEC + SEC / 2)) + 20, 3, '#2A1A0C');
          // the landing section is marked with a red bar on its deck while the sack hangs
          box(ctx, sx - 16, FL - 3, 32, 3, '#D7262E');
          box(ctx, sx - 8 + sw, FL - 62, 16, 14, '#C9A56B');
          box(ctx, sx - 8 + sw, FL - 62, 16, 3, '#E3C58A');
          box(ctx, sx + sw, FL - 78, 1, 16, '#8A6A3A');
        } else if (t >= q.at && t < q.at + q.dur) {
          box(ctx, sx - 8, FL + 14 + 6, 16, 8, '#C9A56B');
        }
      }
    }, 3),
  );
  return pt;
}

/** the porters' deck: a sack lands on a section and the section is awash while it lies there; the second sack slides along its rope first */
export const actBori: Act = {
  id: 'pat05-bori',
  w: 62,
  advice: 'Porters are loading the pontoon: a sack hangs over a section for a second and then lands, and while it lies there the section is awash. Wait at the end of the section before it. The second sack hangs over one section and slides back along its rope on to the one before: the section where it lands is the one to keep off, not the one it hangs over.',
  cps: [19, 37],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 4 + 50 - 1, 15, 17, '.');
  },
  build: (w, c) => {
    sackDeck(w, c.x + 4, 20, 'pat5s', [
      { k: 4, at: 2.0, dur: 4.0 },
      { k: 8, from: 9, at: 8.0, dur: 4.0 },
    ]);
    sign(w, c.x + 1, 10.4, 3, 'LOADING', 'shop', null, 'sacks going on');
  },
};

export const ending: Ending = {
  space: 18,
  advice: 'The last float has been unhooked for the night with the door on it, and it drifts away from the bank and back. Wait on the bank until it comes back in, jump on, and walk to the door while it is aboard.',
  paint: (g, D) => {
    g.fill(D - 15, D - 3, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const P = 10;
    const st = { t0: -1 };
    w.flags.pat5t = st;
    w.flags.twist = 'drift';
    onPass(w, px(D - 22), (w2) => {
      st.t0 = w2.tick;
    });
    const float = w.add(
      new Rig(px(D - 15), FL, 64, 20, {
        solid: true,
        layer: 2,
        tick: (f, w2) => {
          const t = st.t0 < 0 ? 0 : ((since(w2, st.t0) % P) + P) % P;
          // at the bank for 0.3 s, drifts out over 3 s, rests 1.7 s, comes back in over 3 s
          const k = t < 0.3 ? 0 : t < 3.3 ? (t - 0.3) / 3 : t < 5 ? 1 : t < 8 ? 1 - (t - 5) / 3 : 0;
          f.s.k = k;
          f.moveTo(w2, px(D - 15) + k * px(8), FL);
        },
        paint: (ctx, f) => {
          box(ctx, f.x, f.y, f.w, 5, '#7A8087');
          box(ctx, f.x, f.y, f.w, 2, '#A6ADB4');
          for (let k = 0; k < 4; k++) box(ctx, f.x + 4 + k * 15, f.y + 6, 11, 14, '#2F6BB0');
        },
      }),
    );
    float.s.x0 = px(D - 15);
    w.flags.pat5e = float;
    water(w, px(D - 15), px(D - 3), 'end');
    d.follow = () => ({ x: float.x + 40, y: float.y - 32 });
  },
};

export const meta05 = { family: 'float-sinks-under-load', betrayals: ['load-sinks'], ending: 'pat-nawka' };
void perTick;
