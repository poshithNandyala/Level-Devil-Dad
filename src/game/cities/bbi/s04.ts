// BBI-04 Tarakasi: a Cuttack silver filigree workshop. The silversmith solders a new curl of wire wherever you
// stand still: half a second still and a glowing curl goes on the tile ahead of you. On the bench it is a wall
// (hot, then cool, then he lifts it away to finish it); over a gap it is a flat curl you can walk on. So keep
// moving through the torches, and stop only at the quench trough, where your standing builds the bridge.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, cyc, since, taraScript } from './common';

export const SMITH = { still: 0.5, hot: 0.6, wallFor: 3.2, wallH: 48 };

interface Curl {
  rig: Rig;
  c: number;
  bridge: boolean;
  born: number;
}

/** filigree: loops of silver wire filling a box */
function wire(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, hot: number) {
  ctx.strokeStyle = hot > 0 ? `rgba(255,${150 + 80 * (1 - hot)},90,1)` : '#E3E8EC';
  ctx.lineWidth = 1.2;
  box(ctx, x, y, w, 2, ctx.strokeStyle as string);
  box(ctx, x, y + h - 2, w, 2, ctx.strokeStyle as string);
  for (let yy = y + 6; yy < y + h - 2; yy += 8)
    for (let xx = x + 4; xx < x + w; xx += 8) {
      ctx.beginPath();
      ctx.arc(xx, yy, 3, 0, Math.PI * 1.6);
      ctx.stroke();
    }
}

/**
 * The silversmith over columns c0..c1: half a second standing still there and he solders a curl on the first
 * free tile ahead of Dad. On a floor tile it is a wall (deadly while it glows, gone after `wallFor`); over a
 * gap it is a flat bridge piece that stays.
 */
export function smith(w: World, c0: number, c1: number, isGap: (c: number) => boolean, key = 'bbi4') {
  const st = { still: 0, curls: [] as Curl[] };
  (w.flags[key] as unknown) = st;
  const make = (c: number, bridge: boolean) => {
    const born = w.tick;
    const y = bridge ? FL : FL - SMITH.wallH;
    const h = bridge ? 6 : SMITH.wallH;
    const rig = w.add(
      new Rig(px(c), y, 16, h, {
        solid: true,
        // a wall burns while it glows; a bridge piece is soft till it stops glowing (it holds nobody)
        cause: bridge ? undefined : 'bbi-jhala',
        inset: -2,
        layer: 3,
        live: (_r, w2) => since(w2, born) < SMITH.hot,
        tick: (r, w2) => {
          if (bridge) r.setSolid(since(w2, born) >= SMITH.hot);
          if (!bridge && since(w2, born) >= SMITH.wallFor && r.on) {
            r.on = false;
            r.setSolid(false);
            st.curls = st.curls.filter((k) => k.rig !== r);
          }
        },
        paint: (ctx, r, w2) => {
          const hot = Math.max(0, 1 - since(w2, born) / SMITH.hot);
          wire(ctx, r.x, r.y, r.w, r.h, hot);
        },
      }),
    );
    st.curls.push({ rig, c, bridge, born });
  };
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 3,
      tick: (_r, w2) => {
        const p = w2.player;
        const c = Math.floor(p.cx / 16);
        const still = p.onGround && Math.abs(p.vx) < 4 && c >= c0 && c <= c1 && w2.state === 'play';
        st.still = still ? st.still + 1 : 0;
        if (st.still >= SMITH.still * 120) {
          st.still = 0;
          const bridgeAt = (k: number) => st.curls.some((q) => q.c === k && q.bridge);
          const a0 = Math.floor((p.x + p.w - 1) / 16);
          let ahead = isGap(a0) && !bridgeAt(a0) ? a0 : a0 + 1;
          // over a gap he keeps adding pieces along it; on the floor, one wall at a time, a step clear of you
          while (bridgeAt(ahead)) ahead++;
          if (!isGap(ahead) && px(ahead) - (p.x + p.w) < 3) ahead++;
          const wallNear = st.curls.some((k) => !k.bridge && k.c >= ahead && k.c <= ahead + 1);
          if (ahead <= c1 + 1 && !wallNear) make(ahead, isGap(ahead));
        }
      },
      paint: (ctx, _r, w2) => {
        // the smith on his stool behind the bench, tongs out over wherever Dad has stopped
        const p = w2.player;
        const c = Math.floor(p.cx / 16);
        const inside = c >= c0 && c <= c1;
        const sx = inside ? p.cx + 22 : px(c0) + 20;
        folk(ctx, sx, FL - 60, 22, '#F5F0E6', { skirt: '#C9B79C', face: -1, arm: st.still > 20 ? -0.4 : 0.6 });
        if (inside && st.still > 20) {
          ctx.strokeStyle = '#3B3B3B';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(sx - 4, FL - 74);
          ctx.lineTo(p.x + p.w + 10, FL - 30);
          ctx.stroke();
        }
      },
    }),
  );
  return st;
}

/** a blowtorch hanging from the shelf: a flame down to the bench, on for `on` s every `period` s */
export function torch(w: World, c: number, period: number, on: number, t0: () => number, phase = 0) {
  return w.add(
    new Rig(px(c) + 2, FL - 46, 12, 46, {
      cause: 'bbi-agni',
      inset: 2,
      layer: 4,
      live: (_r, w2) => t0() >= 0 && cyc(w2, period, phase - t0() / 120) < on,
      paint: (ctx, r, w2) => {
        box(ctx, r.x + 2, r.y - 6, 8, 8, '#5A5A60');
        const t = t0() >= 0 ? cyc(w2, period, phase - t0() / 120) : 9;
        if (t < on) {
          for (let i = 0; i < 5; i++) box(ctx, r.x + 2 + ((i * 5) % 7), r.y + i * 9, 8 - (i % 2) * 3, 10, i % 2 ? '#FFB74D' : '#4FC3F7');
        } else if (t > period - 0.5) box(ctx, r.x + 4, r.y + 2, 4, 4, '#4FC3F7');
      },
    }),
  );
}

/** the workshop shelf over the bench: a low ceiling of wood (tiles in the map), drawn with boxes on it */
function shelfArt(w: World, c0: number, c1: number) {
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -4,
      paint: (ctx) => {
        for (let c = c0; c <= c1; c += 2) {
          box(ctx, px(c) + 2, FL - 66, 10, 8, '#8D6E63');
          box(ctx, px(c) + 4, FL - 64, 6, 2, '#CFD8DC');
        }
      },
    }),
  );
}

export const T04 = { period: 2.2, on: 0.7, phase: 1.8, torch: 9, trough: [17, 23] as [number, number], shelf: [4, 14] as [number, number] };

export function room(): LevelDef {
  return {
    id: 'BBI-04',
    city: 'BBI',
    index: 4,
    name: 'Tarakasi',
    nameEn: 'Silver filigree',
    tagline: 'Cuttack’s silver filigree: fine wire curled and soldered, curl by curl. This silversmith works wherever you stand.',
    hint: 'Stand still for half a second and the silversmith solders a glowing curl on the tile ahead of you: on the bench it’s a wall that burns while it glows. So don’t stop for the blowtorch: slow down and pass under it between bursts. At the quench trough, stop at the edge: there each curl he adds is a flat piece of bridge. Wait for each to stop glowing, step on, stop again.',
    par: 22,
    map: Grid.ground(15).fill(T04.shelf[0], T04.shelf[1], 12, 12, '#').pit(T04.trough[0], T04.trough[1]).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = { t0: -1 };
      w.flags.bbi4r = st;
      onPass(w, px(2), (w2) => (st.t0 = w2.tick));
      smith(w, 2, 26, (c) => c >= T04.trough[0] && c <= T04.trough[1]);
      torch(w, T04.torch, 2.2, 0.7, () => st.t0, 1.8);
      channel(w, T04.trough[0], T04.trough[1], 'bbi-kunda', 'water');
      shelfArt(w, T04.shelf[0], T04.shelf[1]);
      sign(w, 26, 10.4, 3.2, 'TARAKASI', 'shop', null, 'Cuttack');
      rival(w, 2, 15, 1, taraScript(4));
      onPass(w, px(5), (w2) => tara(w2, 'Ruha! | Stop!', 1.6));
      collectible(w, 'bbi-filigree', 20, 11.4);
    },
  };
}

/** act: two more torches, each with a trough after it; the second trough has a torch over its middle */
export const A04 = { t1: 5, tr1: [10, 15] as [number, number], t2: 21, tr2: [25, 30] as [number, number], t3: 28 };
export const act: Act = {
  id: 'bbi04-karkhana',
  w: 36,
  advice: 'The rest of the workshop: a torch, a trough, another torch and a trough with a torch hanging over its middle. Keep moving under the torches, stop at each trough’s edge to build the bridge, and wait between bursts before you build past the torch over the second one.',
  cps: [8.5, 23.5],
  paint: (g, c) => {
    g.fill(c.x + 2, c.x + 8, 12, 12, '#').fill(c.x + 18, c.x + 23, 12, 12, '#');
    g.pit(c.x + A04.tr1[0], c.x + A04.tr1[1]).pit(c.x + A04.tr2[0], c.x + A04.tr2[1]);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi4a = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    const gap = (k: number) => (k >= c.x + A04.tr1[0] && k <= c.x + A04.tr1[1]) || (k >= c.x + A04.tr2[0] && k <= c.x + A04.tr2[1]);
    smith(w, c.x + 1, c.x + 32, gap, 'bbi4b');
    torch(w, c.x + A04.t1, 2.0, 0.6, () => st.t0, 0.2);
    torch(w, c.x + A04.t2, 2.0, 0.6, () => st.t0, 1.0);
    w.add(
      new Rig(c.X(A04.t3) + 2, FL - 70, 12, 64, {
        cause: 'bbi-agni',
        inset: 2,
        layer: 4,
        live: (_r, w2) => st.t0 >= 0 && cyc(w2, 2.4, -st.t0 / 120) < 0.6,
        paint: (ctx, r, w2) => {
          box(ctx, r.x + 2, r.y - 8, 8, 8, '#5A5A60');
          box(ctx, r.x + 5, 0, 2, r.y - 8, '#5A5A60');
          if (st.t0 >= 0 && cyc(w2, 2.4, -st.t0 / 120) < 0.6) for (let i = 0; i < 7; i++) box(ctx, r.x + 2 + ((i * 5) % 7), r.y + i * 9, 8 - (i % 2) * 3, 10, i % 2 ? '#FFB74D' : '#4FC3F7');
        },
      }),
    );
    channel(w, c.x + A04.tr1[0], c.x + A04.tr1[1], 'bbi-kunda', 'water');
    channel(w, c.x + A04.tr2[0], c.x + A04.tr2[1], 'bbi-kunda', 'water');
    shelfArt(w, c.x + 2, c.x + 8);
    shelfArt(w, c.x + 18, c.x + 23);
  },
};

/** ending: the door sits up in a filigree box on a high shelf: your standing builds the step up to it */
export const ending: Ending = {
  space: 12,
  advice: 'The door is up in a filigree box on a high shelf, out of reach. Stand still in front of it: the wall he solders is your step. Let it stop glowing, climb it, jump up.',
  paint: (g, D) => {
    g.fill(D - 1, D + 2, 11, 14, '#');
    g.put(D, 10, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-curl-stair';
    smith(w, D - 10, D - 2, () => false, 'bbi4e');
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 2,
        paint: (ctx) => {
          // the box round the door: silver lattice
          wire(ctx, px(D - 1) + 2, px(10) - 24, px(3) - 4, 22, 0);
        },
      }),
    );
  },
};

export const meta04 = { family: 'standing-builds-blocker', betrayals: ['stand-builds-block'], ending: 'bbi-curl-stair' };
