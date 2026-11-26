// BBI-09 Chakka: Konark's temple is a stone chariot with giant carved wheels. Everyone expects the wheel to
// turn. It never does: it is the plinth that moves. Stand on the stone horses at its front and the chariot
// slides across the moat and slams into the temple wall, throwing whoever rides it on to the carvings. The
// wheel's hub stands still while the plinth slides under it: start the chariot, then wait on the hub.
// Beyond, the spokes of a half-sunk wheel are steps, numbered like hours, and they sink in order.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, label } from './entities';
import { FL, channel, since, taraScript } from './common';

const STONE = '#8C7B6B';
const STONE_HI = '#A99887';
const STONE_DK = '#5F5246';

/** a giant stone wheel (drawn, never turning): rim, eight spokes, hub; numbers on the spokes if asked */
export function wheelArt(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, nums = false) {
  ctx.strokeStyle = STONE_DK;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = STONE;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.strokeStyle = STONE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
    ctx.lineTo(cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3));
    ctx.stroke();
    if (nums) label(ctx, cx + Math.cos(a) * r * 0.62, cy + Math.sin(a) * r * 0.62 + 2, String(i + 1), '#FFF3D6', 6);
  }
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    box(ctx, cx + Math.cos(a) * (r + 5) - 1, cy + Math.sin(a) * (r + 5) - 1, 3, 3, STONE_HI);
  }
}

/** a stone horse block (drawn on its rig) */
function horseArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, face: 1 | -1 = 1) {
  box(ctx, x, y + 4, w, h - 4, STONE);
  box(ctx, face > 0 ? x + w - 8 : x, y - 6, 8, 12, STONE);
  box(ctx, face > 0 ? x + w - 4 : x, y - 9, 4, 4, STONE_HI);
  box(ctx, x + 2, y + h - 2, 3, 2, STONE_DK);
  box(ctx, x + w - 5, y + h - 2, 3, 2, STONE_DK);
  box(ctx, x + 2, y + 6, w - 4, 2, STONE_HI);
}

export interface ChariotCfg {
  /** plinth's first column and length (tiles), the column its front stops at, the hub's column */
  c0: number;
  len: number;
  stopAt: number;
  hub: number;
  hubY: number;
  /** seconds on the horses before it moves */
  wait: number;
  /** it moves for anyone standing anywhere on it, not only on the horses */
  any?: boolean;
  /** no horses on this one (the finale's plinth) */
  bare?: boolean;
}
export interface ChariotSt {
  started: number;
  x: number;
  moving: boolean;
  stopped: boolean;
  plinth: Rig;
  hub: Rig;
}

/** the chariot: a plinth over the moat with two stone horses at its front, and a fixed wheel hub ahead */
export function chariot(w: World, cfg: ChariotCfg, key: string) {
  const x0 = px(cfg.c0);
  const L = px(cfg.len);
  const dist = px(cfg.stopAt) - (x0 + L);
  const st = { started: -1, x: x0, v: 0, moving: false, stopped: false } as ChariotSt & { v: number; on: number };
  st.on = 0;
  (w.flags[key] as unknown) = st;
  const plinth = w.add(
    new Rig(x0, FL - 16, L, 16, {
      solid: true,
      layer: 3,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, r.h, STONE);
        box(ctx, r.x, r.y, r.w, 3, STONE_HI);
        for (let x = r.x + 6; x < r.x + r.w - 6; x += 12) box(ctx, x, r.y + 6, 6, 6, STONE_DK);
      },
    }),
  );
  const horses = w.add(
    new Rig(x0 + L - 32, FL - 36, 32, 20, {
      solid: true,
      layer: 3,
      paint: (ctx, r) => {
        if (cfg.bare) return;
        horseArt(ctx, r.x, r.y, 15, 20);
        horseArt(ctx, r.x + 16, r.y, 15, 20);
      },
    }),
  );
  if (cfg.bare) horses.setSolid(false);
  const hub = w.add(
    new Rig(px(cfg.hub), cfg.hubY, 40, 6, {
      solid: true,
      layer: 4,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, r.h, STONE_HI);
        box(ctx, r.x + 16, r.y + 6, 8, 8, STONE_DK);
      },
    }),
  );
  st.plinth = plinth;
  st.hub = hub;
  // the drive: entities update before Dad, so the plinth carries him
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -3,
      tick: (_r, w2) => {
        if (st.started < 0) {
          st.on = horses.rides(w2) || (cfg.any && plinth.rides(w2)) ? st.on + 1 : 0;
          if (st.on >= cfg.wait * 120) st.started = w2.tick;
        }
        if (st.started >= 0 && !st.stopped) {
          st.moving = true;
          st.v = Math.min(110, st.v + 260 / 120);
          let nx = st.x + st.v / 120;
          if (nx >= x0 + dist) {
            nx = x0 + dist;
            st.stopped = true;
            st.moving = false;
            // the slam: whoever rides the chariot is thrown forward against the temple wall
            if (plinth.rides(w2) || horses.rides(w2)) {
              const p = w2.player;
              // hard enough to reach the wall from anywhere on the stone
              p.vx = Math.max(240, (px(cfg.stopAt) - p.x) * 2.6);
              p.vy = -230;
              p.onGround = false;
              p.coyoteT = 0;
              p.launched = true;
              p.stun = 40;
            }
            w2.emit('shake', nx + L, FL - 20, { amount: 3 });
          }
          st.x = nx;
          plinth.moveTo(w2, nx, FL - 16);
          horses.moveTo(w2, nx + L - 32, FL - 36);
          // a jump off the sliding stone keeps none of its speed: it's a heavy, slow push
          plinth.solid!.velX = 0;
          horses.solid!.velX = 0;
        }
      },
      paint: (ctx) => wheelArt(ctx, px(cfg.hub) + 20, cfg.hubY + 3, 46),
    }),
  );
  return st;
}

/** the temple wall the chariot slams into: carved, with sharp stone relief on its face */
export function templeWall(w: World, c: number, top: number) {
  w.add(
    new Rig(px(c) - 4, top, 6, FL - 16 - top, {
      cause: 'bbi-chakka',
      inset: 0,
      layer: 4,
      paint: (ctx, r) => {
        ctx.fillStyle = '#FFF3E0';
        for (let y = r.y + 2; y < r.y + r.h; y += 8) {
          ctx.beginPath();
          ctx.moveTo(r.x + 6, y);
          ctx.lineTo(r.x, y + 4);
          ctx.lineTo(r.x + 6, y + 8);
          ctx.fill();
        }
      },
    }),
  );
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -2,
      paint: (ctx) => {
        for (let y = top + 6; y < FL; y += 12) box(ctx, px(c) + 2, y, 28, 2, STONE_DK);
      },
    }),
  );
}

export const C09: ChariotCfg = { c0: 6, len: 12, stopAt: 26, hub: 21, hubY: FL - 58, wait: 0.4 };

export function room(): LevelDef {
  return {
    id: 'BBI-09',
    city: 'BBI',
    index: 9,
    name: 'Chakka',
    nameEn: 'The stone wheel',
    tagline: 'Konark: a temple built as a stone chariot, with twelve pairs of giant carved wheels. Everyone waits for the wheel to turn.',
    hint: 'The wheel never turns: the plinth does the moving. Stand on the stone horses at its front and the chariot slides across the moat and slams into the temple wall, throwing everyone on it into the carvings. Start it, then jump up on to the wheel’s hub: the hub stands still while the plinth slides under it. Once it has stopped, go up on to the wall.',
    par: 30,
    map: Grid.ground(15).pit(C09.c0, C09.stopAt - 1).fill(C09.stopAt, C09.stopAt + 3, 11, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      channel(w, C09.c0, C09.stopAt - 1, 'bbi-khai', 'water');
      chariot(w, C09, 'bbi9');
      templeWall(w, C09.stopAt, px(11));
      sign(w, 2.4, 10.4, 3, 'KONARK', 'shop', null, 'chakka');
      rival(w, 2, 15, 1, taraScript(9));
      onPass(w, px(14), (w2) => tara(w2, 'Bahut bhala! | Very good!', 1.6));
      collectible(w, 'bbi-chhenapoda', 21.6, 6.9);
    },
  };
}

/** act: the spokes of a half-sunk wheel are steps up to the terrace; once you are on the first, they sink in
 *  order, one by one, behind you */
export const S09 = { n: 8, first: 1.1, each: 0.62, c0: 3, dx: 2.5, dy: 9 };
export const act: Act = {
  id: 'bbi09-ara',
  w: 30,
  advice: 'The spokes of a half-sunk wheel are steps up to the terrace, numbered like hours. Once you’re on spoke 1 they sink in order behind you, one every two-thirds of a second: don’t stop to check each one, climb on steadily, one hop after another.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 24).fill(c.x + 25, c.x + 27, 10, 14, '#');
  },
  build: (w, c) => {
    channel(w, c.x + 2, c.x + 24, 'bbi-ara', 'water');
    const st = { t0: -1 };
    w.flags.bbi9a = st;
    const spokes: Rig[] = [];
    for (let k = 0; k < S09.n; k++) {
      const x = c.X(S09.c0 + S09.dx * k);
      const y0 = FL - 16 - S09.dy * k;
      spokes.push(
        w.add(
          new Rig(x, y0, 28, 6, {
            solid: true,
            layer: 3,
            tick: (r, w2) => {
              if (st.t0 < 0 && k === 0 && r.rides(w2)) st.t0 = w2.tick;
              if (st.t0 < 0) return;
              const t = since(w2, st.t0) - (S09.first + S09.each * k);
              if (t > 0) r.moveTo(w2, x, Math.min(FL + 40, y0 + t * t * 900));
            },
            paint: (ctx, r) => {
              box(ctx, r.x, r.y, r.w, r.h, STONE);
              box(ctx, r.x, r.y, r.w, 2, STONE_HI);
              label(ctx, r.x + 14, r.y + 13, String(k + 1), '#FFF3D6', 7);
            },
          }),
        ),
      );
    }
    w.add(new Rig(0, 0, 0, 0, { layer: -4, paint: (ctx) => wheelArt(ctx, c.X(12), FL - 30, 70, false) }));
    void spokes;
  },
};

/** ending: the door between two stone horses on little plinths; step on a horse and the plinths slide together */
export const ending: Ending = {
  space: 16,
  advice: 'The door stands between two stone horses on their own little plinths. Touch a horse and the plinths slide together, closing the gap: jump right over the near horse into the gap without landing on it.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-horse-gap';
    const st = { started: -1, k: 0 };
    w.flags.bbi9e = st;
    const lx0 = px(D - 2) - 20;
    const rx0 = px(D + 3);
    const mk = (x: number, face: 1 | -1) =>
      w.add(
        new Rig(x, FL - 16, 20, 16, {
          solid: true,
          layer: 3,
          paint: (ctx, r) => {
            box(ctx, r.x - 2, FL - 6, r.w + 4, 6, STONE_DK);
            horseArt(ctx, r.x, r.y + 2, 20, 14, face);
          },
        }),
      );
    const L = mk(lx0, 1);
    const R = mk(rx0, -1);
    w.add(
      new Rig(lx0 + 20, FL - 30, rx0 - lx0 - 20, 30, {
        cause: 'bbi-ghoda',
        inset: 0,
        layer: 4,
        live: () => st.k > 0.6,
        tick: (_r, w2) => {
          if (st.started < 0 && (L.rides(w2) || R.rides(w2))) st.started = w2.tick;
          if (st.started < 0) return;
          st.k = Math.min(1, since(w2, st.started) / 0.5);
          const gap = (rx0 - lx0 - 20) / 2;
          L.moveTo(w2, lx0 + gap * st.k, FL - 16);
          R.moveTo(w2, rx0 - gap * st.k, FL - 16);
        },
      }),
    );
  },
};

export const meta09 = { family: 'world-slides-hub-stays-still', betrayals: ['hub-still'], ending: 'bbi-horse-gap' };
