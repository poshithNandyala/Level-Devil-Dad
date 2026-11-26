// BBI-03 Chandua: Pipili's appliqué street. The parasols over the dye gutter are shut until a customer comes
// to that shop; then the shopkeeper opens it to show. Open, its silk is slippery: you slide to the edge and
// off. Only the appliqué cut-out sewn on its top (an elephant, a parrot, a flower, in a different place on
// each) holds you. And the shopkeeper sells cut-outs: on one parasol he peels yours off while you wait on it.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, since, taraScript } from './common';

const W = 56;
const SLIP = 55;
const CUT = 24;
const COLS = ['#E63946', '#F4D35E', '#2A9D8F', '#3D5A98', '#F28C28'];

export interface Parasol {
  rig: Rig;
  /** world x of the cut-out's left edge */
  cutX: () => number;
  open: (w: World) => boolean;
  peeled: (w: World) => boolean;
}

/** the motif sewn on the cut-out (16 px): 0 elephant, 1 parrot, 2 flower */
function motif(ctx: CanvasRenderingContext2D, x0: number, y: number, k: number) {
  box(ctx, x0, y - 3, CUT, 4, '#FFF3D6');
  const x = x0 + (CUT - 16) / 2;
  ctx.fillStyle = k === 0 ? '#2A9D8F' : k === 1 ? '#3FA34D' : '#E63946';
  if (k === 0) {
    ctx.fillRect(x + 3, y - 6, 9, 4);
    ctx.fillRect(x + 11, y - 5, 3, 5);
    ctx.fillRect(x + 4, y - 2, 2, 2);
    ctx.fillRect(x + 9, y - 2, 2, 2);
  } else if (k === 1) {
    ctx.fillRect(x + 5, y - 7, 6, 4);
    ctx.fillRect(x + 10, y - 7, 3, 2);
    ctx.fillStyle = '#E63946';
    ctx.fillRect(x + 12, y - 6, 2, 1);
  } else {
    for (let i = 0; i < 5; i++) ctx.fillRect(x + 4 + i * 2, y - 6 + (i % 2) * 2, 2, 2);
    ctx.fillStyle = '#F4D35E';
    ctx.fillRect(x + 7, y - 5, 2, 2);
  }
}

/**
 * A parasol on a pole at column c, canopy top at y: open during each [from, to) (seconds after `t0()`),
 * cut-out at `cut` (-1 left, 0 centre, 1 right), peeled off at `peelAt` if given. Slides Dad off its silk.
 */
export function parasol(w: World, c: number, y: number, cut: -1 | 0 | 1, opens: [number, number][], t0: () => number, o: { peelAt?: number; k?: number; colour?: number } = {}): Parasol {
  const x = px(c) + 8 - W / 2;
  const cutX = () => x + W / 2 - CUT / 2 + cut * 14;
  const t = (w2: World) => (t0() < 0 ? -1 : since(w2, t0()));
  const open = (w2: World) => {
    const tt = t(w2);
    return opens.some(([a, b]) => tt >= a && tt < b);
  };
  const peeled = (w2: World) => o.peelAt !== undefined && t(w2) >= o.peelAt;
  const rig = w.add(
    new Rig(x, y, W, 6, {
      solid: true,
      layer: 3,
      tick: (r, w2) => {
        const on = open(w2);
        r.setSolid(on);
        if (on && r.rides(w2)) {
          const p = w2.player;
          const onCut = !peeled(w2) && p.x + p.w > cutX() + 3 && p.x < cutX() + CUT - 3;
          if (onCut) w2.flags.bbiSlip = undefined;
          r.s.silk = onCut ? 0 : (r.s.silk ?? 0) + 1;
          if (!onCut && r.s.silk > 18) {
            // silk: after a moment you slide to the nearer edge
            const dir = p.cx < x + W / 2 ? -1 : 1;
            p.pushVx += dir * SLIP;
            w2.flags.bbiSlip = peeled(w2) ? 'bbi-peeled' : 'bbi-silk';
          }
        }
      },
      paint: (ctx, r, w2) => {
        const on = open(w2);
        const cx = r.x + W / 2;
        box(ctx, cx - 1, r.y, 2, FL + 20 - r.y, '#6D4C2F');
        const col = COLS[(o.colour ?? c) % COLS.length];
        if (on) {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(r.x - 2, r.y + 8);
          ctx.quadraticCurveTo(cx, r.y - 10, r.x + W + 2, r.y + 8);
          ctx.closePath();
          ctx.fill();
          box(ctx, r.x - 2, r.y + 6, W + 4, 3, '#F4D35E');
          for (let i = 0; i < 6; i++) box(ctx, r.x + 2 + i * 8, r.y + 9, 3, 3, i % 2 ? '#FFFFFF' : '#2A9D8F');
          // tiny mirrors on the silk
          for (let i = 0; i < 4; i++) box(ctx, r.x + 6 + i * 11, r.y + 2, 2, 2, '#E8F4FF');
          if (!peeled(w2)) motif(ctx, cutX(), r.y + 1, o.k ?? (c % 3));
        } else {
          // shut: the cloth wrapped tight round the top of the pole
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.moveTo(cx - 4, r.y + 2);
          ctx.lineTo(cx, r.y - 8);
          ctx.lineTo(cx + 4, r.y + 2);
          ctx.lineTo(cx + 2, r.y + 26);
          ctx.lineTo(cx - 2, r.y + 26);
          ctx.closePath();
          ctx.fill();
        }
      },
    }),
  );
  return { rig, cutX, open, peeled };
}

/** the gutter under the parasols: its death line depends on how you got in */
function gutter(w: World, c0: number, c1: number) {
  const g = channel(w, c0, c1, 'bbi-rangapani', 'water');
  const o = g.o.tick;
  g.o.tick = (r, w2) => {
    o?.(r, w2);
    const p = w2.player;
    if (p.onGround && p.y + p.h >= FL - 1) w2.flags.bbiSlip = undefined;
    r.hazard!.cause = (w2.flags.bbiSlip as string) ?? 'bbi-rangapani';
  };
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 2,
      paint: (ctx) => {
        for (let x = px(c0) + 4; x < px(c1 + 1) - 4; x += 13) box(ctx, x, FL + 21, 6, 1, x % 3 ? '#E63946' : '#F4D35E');
      },
    }),
  );
  return g;
}

/** a customer walking along the shop counters behind, stopping at each shop as its parasol opens */
function customer(w: World, stops: [number, number, number][], t0: () => number, shirt: string) {
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -5,
      paint: (ctx, _r, w2) => {
        const t = t0() < 0 ? -1 : since(w2, t0());
        let x = px(stops[0][0]) - 40;
        for (let i = 0; i < stops.length; i++) {
          const [c, a, b] = stops[i];
          const sx = px(c) + 8;
          if (t >= a) x = sx;
          if (t >= b && i + 1 < stops.length) {
            const [c2, a2] = stops[i + 1];
            const k = Math.min(1, (t - b) / Math.max(0.1, a2 - b));
            x = sx + (px(c2) + 8 - sx) * k;
          } else if (t >= b) x = sx + (t - b) * 60;
        }
        folk(ctx, x, FL - 46, 22, shirt, { skirt: '#7A3E5E' });
      },
    }),
  );
}

/** the counters behind the parasols: shopfronts with cloth hanging */
function shops(w: World, c0: number, c1: number) {
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -6,
      paint: (ctx) => {
        box(ctx, px(c0), FL - 46, px(c1 - c0), 4, '#8C5A3A');
        for (let c = c0; c < c1; c += 3) {
          box(ctx, px(c) + 2, FL - 90, 40, 42, COLS[c % COLS.length]);
          box(ctx, px(c) + 6, FL - 84, 32, 30, '#FFF3D6');
          box(ctx, px(c) + 14, FL - 76, 16, 12, COLS[(c + 2) % COLS.length]);
        }
      },
    }),
  );
}

export const OPENS03: { c: number; y: number; cut: -1 | 0 | 1; open: [number, number]; peel?: number }[] = [
  { c: 8, y: FL - 40, cut: 0, open: [0.8, 3.6] },
  { c: 12, y: FL - 48, cut: -1, open: [2.8, 5.6] },
  { c: 16, y: FL - 40, cut: 1, open: [4.6, 7.6], peel: 6.4 },
  { c: 20, y: FL - 48, cut: 0, open: [5.4, 8.8] },
];

export function room(): LevelDef {
  return {
    id: 'BBI-03',
    city: 'BBI',
    index: 3,
    name: 'Chandua',
    nameEn: 'The appliqué street',
    tagline: 'Pipili, on the Konark road: bright cloth cut-outs sewn on to parasols, canopies and lanterns. Shut, until someone wants to see one.',
    hint: 'A parasol only opens when a customer comes to its shop, one after another along the street. The silk is slippery: you slide to the edge and into the dye. Stand only on the cut-out sewn on top, and it’s in a different place on each one. The third shopkeeper sells his cut-out while you stand on it: don’t wait there, go on to the fourth as soon as it opens.',
    par: 14,
    map: Grid.ground(15).pit(5, 23).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = { t0: -1 };
      w.flags.bbi3 = st;
      onPass(w, px(2), (w2) => (st.t0 = w2.tick));
      shops(w, 4, 25);
      gutter(w, 5, 23);
      w.flags.bbi3p = OPENS03.map((p, i) => parasol(w, p.c, p.y, p.cut, [p.open], () => st.t0, { peelAt: p.peel, k: i % 3, colour: i }));
      customer(
        w,
        OPENS03.map((p) => [p.c, p.open[0], p.open[1] - 0.6] as [number, number, number]),
        () => st.t0,
        '#F28C28',
      );
      sign(w, 25.5, 10.4, 3, 'PIPILI', 'shop', null, 'chandua');
      rival(w, 2, 15, 1, taraScript(3));
      onPass(w, px(17), (w2) => tara(w2, 'Bahut bhala! | Very good!', 1.8));
      collectible(w, 'bbi-filigree', 14, 9.4);
    },
  };
}

/** act: a second street, shoppers coming back the other way: the far parasol opens first, out of reach */
export const OPENS03A: { c: number; y: number; cut: -1 | 0 | 1; open: [number, number][] }[] = [
  { c: 5, y: FL - 36, cut: 1, open: [[0.6, 3.6]] },
  { c: 9, y: FL - 50, cut: -1, open: [[2.8, 6.0]] },
  { c: 13, y: FL - 40, cut: 0, open: [[1.0, 2.6], [5.2, 8.6]] },
];
export const act: Act = {
  id: 'bbi03-gali',
  w: 20,
  advice: 'Another street, shoppers coming back the other way: the far parasol opens first, but it’s too far. Wait on the near one’s cut-out for the middle one, then the far one opens again.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 16);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi3a = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    shops(w, c.x + 1, c.x + 18);
    gutter(w, c.x + 2, c.x + 16);
    w.flags.bbi3ap = OPENS03A.map((p, i) => parasol(w, c.x + p.c, p.y, p.cut, p.open, () => st.t0, { k: (i + 1) % 3, colour: i + 2 }));
    customer(w, [[c.x + 5, 0.6, 3.0], [c.x + 9, 2.8, 5.4], [c.x + 13, 5.2, 8.0]], () => st.t0, '#3D5A98');
  },
};

/** act 2: the fair end of the street: four parasols, and this time the last shopkeeper sells his cut-out */
export const OPENS03B: { c: number; y: number; cut: -1 | 0 | 1; open: [number, number][]; peel?: number }[] = [
  { c: 5, y: FL - 40, cut: -1, open: [[0.6, 3.4]] },
  { c: 9, y: FL - 48, cut: 1, open: [[2.6, 5.2]] },
  { c: 13, y: FL - 40, cut: 0, open: [[4.4, 7.4]] },
  { c: 17, y: FL - 34, cut: -1, open: [[6.2, 9.6]], peel: 7.4 },
];
export const act2: Act = {
  id: 'bbi03-mela',
  w: 24,
  advice: 'The far end of the street, four more parasols. This time it is the last shopkeeper who sells his cut-out: land on it and hop straight off to the bank.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 20);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi3b = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    shops(w, c.x + 1, c.x + 22);
    gutter(w, c.x + 2, c.x + 20);
    w.flags.bbi3bp = OPENS03B.map((p, i) => parasol(w, c.x + p.c, p.y, p.cut, p.open, () => st.t0, { peelAt: p.peel, k: (i + 2) % 3, colour: i + 3 }));
    customer(w, OPENS03B.map((p) => [c.x + p.c, p.open[0][0], p.open[0][1] - 0.6] as [number, number, number]), () => st.t0, '#8E44AD');
  },
};

/** ending: an appliqué lantern hangs over the door step; the shopkeeper lets it down to show you, then hoists it */
export const LANTERN = { at: 6, delay: 0.35, drop: 0.2, down: 1.2, up: 0.6 };
export const ending: Ending = {
  space: 12,
  advice: 'A big appliqué lantern hangs over the door step. As you come up, the shopkeeper lets it down to show it off, right on the step: stop short, let it come down and go back up, then walk under.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-lantern-drop';
    const st = { t0: -1, k: 0 };
    w.flags.bbi3e = st;
    onPass(w, px(D - LANTERN.at), (w2) => (st.t0 = w2.tick));
    const top = FL - 120;
    w.add(
      new Rig(px(D - 3), top, 32, 30, {
        cause: 'bbi-lantern',
        inset: 2,
        layer: 4,
        tick: (r, w2) => {
          let k = 0;
          if (st.t0 >= 0) {
            const t = since(w2, st.t0) - LANTERN.delay;
            if (t >= 0 && t < LANTERN.drop) k = t / LANTERN.drop;
            else if (t >= LANTERN.drop && t < LANTERN.drop + LANTERN.down) k = 1;
            else if (t >= LANTERN.drop + LANTERN.down && t < LANTERN.drop + LANTERN.down + LANTERN.up) k = 1 - (t - LANTERN.drop - LANTERN.down) / LANTERN.up;
          }
          st.k = k;
          r.y = top + (FL - 30 - top) * k;
        },
        paint: (ctx, r) => {
          box(ctx, r.x + 15, 0, 2, r.y, '#6D4C2F');
          box(ctx, r.x, r.y, r.w, r.h, '#E63946');
          box(ctx, r.x, r.y, r.w, 4, '#F4D35E');
          box(ctx, r.x, r.y + r.h - 4, r.w, 4, '#F4D35E');
          motif(ctx, r.x + 8, r.y + 18, 0);
          for (let i = 0; i < 5; i++) box(ctx, r.x + 2 + i * 7, r.y + r.h, 2, 4, '#2A9D8F');
        },
      }),
    );
  },
};

export const meta03 = { family: 'cutout-safe-on-open-parasol', betrayals: ['safe-shape'], ending: 'bbi-lantern-drop' };
