// PAT-03 Ashok Rajpath: the coaching lane. The hoardings are the platforms across a jammed road, and at the class
// bell each is swapped for the next batch's banner: the new one is unrolled from the roll hanging above it, so the
// roll shows how wide it will be. A wider banner grows from the left end; a narrower one is pulled taut towards
// the right, and whoever is on the part that goes falls. The bell itself never moves you.
// Door: the bell rope, three iron bells swinging low over the road.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { since, taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;

export interface Swap {
  /** which bell swaps it (0-based), the new width in tiles, and which end stays put */
  bell: number;
  w: number;
  anchor: 'L' | 'R';
}
export interface Hoard {
  c0: number;
  w0: number;
  swaps: Swap[];
}

export interface Row {
  t0: number;
  bells: number[];
  hs: Rig[];
  specs: Hoard[];
}

const BANNERS = ['#D7262E', '#2F6BB0', '#F2B705', '#6F8F3A', '#8A4A8F'];

/** extent (px) of a hoarding at time t, and the swap still to come (its roll hangs above it until then) */
export function extent(spec: Hoard, bells: number[], t: number): { x: number; w: number; next: Swap | null; nx: number; nw: number } {
  let x = spec.c0 * 16;
  let w = spec.w0 * 16;
  let next: Swap | null = null;
  let nx = 0;
  let nw = 0;
  for (const sw of spec.swaps) {
    const nW = sw.w * 16;
    const nX = sw.anchor === 'L' ? x : x + w - nW;
    if (t >= bells[sw.bell] + 0.4) {
      x = nX;
      w = nW;
    } else {
      next = sw;
      nx = nX;
      nw = nW;
      break;
    }
  }
  return { x, w, next, nx, nw };
}

/** a row of hoardings; the clock starts when Dad reaches `trigger` (px) */
export function row(w: World, specs: Hoard[], bells: number[], trigger: number, key: string): Row {
  const r: Row = { t0: -1, bells, hs: [], specs };
  w.flags[key] = r;
  w.when(
    (w2) => w2.player.cx >= trigger,
    (w2) => {
      r.t0 = w2.tick;
    },
  );
  specs.forEach((sp, i) => {
    const h = w.add(
      new Rig(sp.c0 * 16, FL, sp.w0 * 16, 12, {
        solid: true,
        layer: 2,
        tick: (hh, w2) => {
          const t = r.t0 < 0 ? -1 : since(w2, r.t0);
          const e = extent(sp, bells, t);
          hh.solid!.x = Math.round(e.x);
          hh.solid!.w = e.w;
          hh.x = e.x;
          hh.w = e.w;
          for (const b of bells) if (i === 0 && t >= b && t < b + 0.01) w2.sfx('bell', hh.x + hh.w / 2, FL - 20);
        },
        paint: (ctx, hh, w2) => {
          const t = r.t0 < 0 ? -1 : since(w2, r.t0);
          const e = extent(sp, bells, t);
          const col = BANNERS[i % BANNERS.length];
          box(ctx, hh.x, FL, hh.w, 12, col);
          box(ctx, hh.x, FL, hh.w, 2, '#fff');
          box(ctx, hh.x + 3, FL + 5, Math.max(2, hh.w - 12), 2, '#fff');
          for (let k = 0; k < Math.floor(hh.w / 20); k++) box(ctx, hh.x + 4 + k * 20, FL + 8, 12, 2, '#3A1E10');
          // the next batch's banner, rolled up on a pole above it: as wide as it will be
          if (e.next) {
            box(ctx, e.nx, FL - 40, e.nw, 6, BANNERS[(i + 1) % BANNERS.length]);
            box(ctx, e.nx, FL - 40, e.nw, 2, '#fff');
            box(ctx, e.nx - 2, FL - 41, 3, 8, '#6B3F1C');
            box(ctx, e.nx + e.nw - 1, FL - 41, 3, 8, '#6B3F1C');
            box(ctx, e.nx + 3, FL - 34, 1, 34, '#8A6A3A');
            box(ctx, e.nx + e.nw - 4, FL - 34, 1, 34, '#8A6A3A');
          }
          void w2;
        },
      }),
    );
    r.hs.push(h);
  });
  return r;
}

/** the jammed road under the hoardings: cars nose to tail, deadly to fall into */
export function jam(w: World, c0: number, c1: number, specs?: Hoard[]) {
  const pit = w.add(
    new Rig(px(c0), 256, px(c1 - c0 + 1), 34, {
      layer: 4,
      cause: 'pat-jam',
      inset: 0,
      paint: (ctx, r) => {
        const cols = ['#C2603A', '#4A7A9A', '#E5D3A8', '#6F8F3A', '#8A4A8F'];
        for (let x = r.x; x < r.x + r.w - 10; x += 26) {
          const i = (x >> 4) % 5;
          box(ctx, x + 2, r.y + 4, 22, 9, cols[i]);
          box(ctx, x + 5, r.y, 14, 5, cols[(i + 2) % 5]);
          box(ctx, x + 4, r.y + 12, 4, 3, '#1D1A1A');
          box(ctx, x + 17, r.y + 12, 4, 3, '#1D1A1A');
        }
      },
    }),
  );
  // a hoarding that narrows from its right end (the left end is anchored) is its own death
  if (specs)
    w.onTick((w2) => {
      const cx = w2.player.cx;
      const sp = specs.find((q) => cx >= q.c0 * 16 - 16 && cx < (q.c0 + q.w0) * 16 + 16);
      let prev = sp?.w0 ?? 0;
      let narrowsRight = false;
      for (const q of sp?.swaps ?? []) {
        if (q.anchor === 'L' && q.w < prev) narrowsRight = true;
        prev = q.w;
      }
      pit.hazard!.cause = narrowsRight ? 'pat-patti' : 'pat-jam';
    });
}

export const ROOM_SPECS: Hoard[] = [
  { c0: 8, w0: 4, swaps: [] },
  { c0: 12, w0: 3, swaps: [{ bell: 0, w: 5, anchor: 'L' }, { bell: 1, w: 2, anchor: 'R' }] },
  { c0: 17, w0: 4, swaps: [{ bell: 0, w: 2, anchor: 'R' }] },
  { c0: 22, w0: 3, swaps: [{ bell: 1, w: 2, anchor: 'R' }] },
];
export const ROOM_BELLS = [1.0, 3.4];

export function room(): LevelDef {
  return {
    id: 'PAT-03',
    city: 'PAT',
    index: 3,
    name: 'Ashok Rajpath',
    nameEn: 'The coaching lane',
    tagline: 'Every hoarding on the road is the best coaching in Patna, until the bell.',
    hint: 'The hoardings are your platforms over the jammed road. At the class bell each one is swapped for the next batch’s banner, which hangs rolled up above it: the roll is as wide as the new banner will be. A wider banner only grows. A narrower one is pulled in towards its right end, and the part on the left goes. Stand where the banner will still be, or on a hoarding whose roll is wider, and cross between the bells.',
    par: 28,
    map: Grid.ground(15).fill(8, 24, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      row(w, ROOM_SPECS, ROOM_BELLS, px(6), 'pat3');
      jam(w, 8, 24);
      onPass(w, px(3), (w2) => tara(w2, L.win[1], 2.4));
      sign(w, 2.2, 10.2, 4.2, 'ASHOK RAJPATH', 'shop', null, 'coaching lane');
      rival(w, 28, 15, -1, taraScript(3));
      collectible(w, 'pat-sikki', 14.5, 9.4);
    },
  };
}

export const act: Act = {
  id: 'pat03-batch',
  w: 34,
  advice: 'The next lane has more hoardings and the bells come faster: read each roll before the bell, and do not stand on the left end of anything that is about to get narrower.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 27, 15, 17, '.');
  },
  build: (w, c) => {
    const S: Hoard[] = [
      { c0: c.x + 4, w0: 4, swaps: [{ bell: 0, w: 2, anchor: 'R' }] },
      { c0: c.x + 9, w0: 3, swaps: [{ bell: 0, w: 6, anchor: 'L' }, { bell: 2, w: 2, anchor: 'R' }] },
      { c0: c.x + 16, w0: 5, swaps: [{ bell: 1, w: 3, anchor: 'R' }] },
      { c0: c.x + 22, w0: 3, swaps: [{ bell: 1, w: 5, anchor: 'L' }, { bell: 2, w: 2, anchor: 'R' }] },
    ];
    row(w, S, [1.0, 3.2, 5.6], px(c.x + 2), 'pat3a');
    jam(w, c.x + 4, c.x + 27);
    sign(w, c.x + 1, 10.4, 3, 'BATCH 2', 'shop', null, 'bell at ten');
  },
};

/** the ladder: a banner can narrow from its right end too (the left end stays put), which catches whoever waits at the right end */
export const actLane2: Act = {
  id: 'pat03-patti',
  w: 36,
  advice: 'A third lane. The roll above each hoarding shows exactly where the new banner will hang, and this time some banners narrow from the right: the left end stays and the right end goes. Do not wait at the right end of one that is about to narrow, and wait for the last bell before you cross.',
  cps: [5.5],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 26, 15, 17, '.');
  },
  build: (w, c) => {
    const S: Hoard[] = [
      { c0: c.x + 4, w0: 4, swaps: [] },
      { c0: c.x + 8, w0: 5, swaps: [{ bell: 0, w: 4, anchor: 'L' }] },
      { c0: c.x + 13, w0: 3, swaps: [{ bell: 0, w: 5, anchor: 'L' }, { bell: 2, w: 3, anchor: 'R' }] },
      { c0: c.x + 18, w0: 4, swaps: [{ bell: 1, w: 3, anchor: 'L' }] },
      { c0: c.x + 22, w0: 4, swaps: [{ bell: 2, w: 3, anchor: 'L' }] },
    ];
    row(w, S, [1.8, 4.4, 6.8], px(c.x + 2), 'pat3b');
    jam(w, c.x + 4, c.x + 26, S);
    sign(w, c.x + 1, 10.4, 3, 'BATCH 3', 'shop', null, 'bell at noon');
  },
};

export const BELL = { T: 3.4, A: 0.7, L: 160, piv: FL - 183, phase: [0, 1.7], off: [20, 8] };

export const ending: Ending = {
  space: 34,
  advice: 'The last stretch is the bell rope: two iron bells swing low over the road. A bell is only in your way near the bottom of its swing. Cross under one while it is out at the far end of its swing, and not while it is coming back; and do not jump.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bells';
    const bob: Rig[] = [];
    BELL.off.forEach((off, i) => {
      const xc = px(D - off) + 8;
      const r = w.add(
        new Rig(xc - 9, FL - 20, 18, 20, {
          layer: 3,
          cause: 'pat-ghanti',
          inset: 1,
          tick: (b, w2) => {
            const th = BELL.A * Math.sin(((w2.tick / 120 + BELL.phase[i]) * 2 * Math.PI) / BELL.T);
            b.s.th = th;
            b.x = xc + BELL.L * Math.sin(th) - 9;
            b.y = BELL.piv + BELL.L * Math.cos(th) - 4;
          },
          paint: (ctx, b) => {
            ctx.strokeStyle = '#6B3F1C';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(xc, BELL.piv);
            ctx.lineTo(b.x + 9, b.y + 3);
            ctx.stroke();
            box(ctx, xc - 8, BELL.piv - 4, 16, 4, '#555');
            ctx.fillStyle = '#B08A2E';
            ctx.beginPath();
            ctx.moveTo(b.x + 1, b.y + 20);
            ctx.quadraticCurveTo(b.x + 9, b.y - 4, b.x + 17, b.y + 20);
            ctx.fill();
            box(ctx, b.x + 8, b.y + 20, 2, 3, '#555');
          },
        }),
      );
      bob.push(r);
    });
    w.flags.pat3e = { bob, xs: BELL.off.map((o) => px(D - o) + 8) };
  },
};

export const meta03 = { family: 'hoarding-swap-at-class-bell', betrayals: ['B8', 'banner-swap-width'], ending: 'pat-ghanti' };
void Paint;
