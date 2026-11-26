// GTK-09 Tsomgo (the high lake). Up at Tsomgo the lake is frozen hard, but the shore is where the ice is thin.
// The yaks walk tourists round the shore on a fixed loop, and they never leave it. Ride one across the thin
// shore. It stops halfway for the photo, right on the thin ice: stay on. Get off on the far bank, before it turns
// back. Then a yak that only goes as far as the photo stop: from its back, jump for the bank.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, decor, local, px } from './entities';
import { taraScript } from './common';

export const YAK = { w: 40, h: 22, speed: 44 };

/** one leg of the yak's loop: walk to x (px) or stop for `wait` seconds (a photo stop if `photo`) */
export type Leg = { to: number } | { wait: number; photo?: boolean };

export interface Yak extends Rig {
  s: { leg: number; t: number; photo: boolean; dir: 1 | -1; started: boolean };
}

/** a yak that walks its loop (legs, repeated) from x0 once Dad comes past `startX` */
export function yak(w: World, x0: number, legs: Leg[], startX: number | 'mount', key: string, h = YAK.h): Yak {
  const y = w.add(
    new Rig(x0, FL - h, YAK.w, h, {
      solid: true,
      oneWay: true,
      layer: 2,
      tick: (r, w2) => {
        const s = r.s as Yak['s'];
        if (!s.started && startX === 'mount' && r.carries(w2)) s.started = true;
        if (!s.started) return;
        const leg = legs[s.leg % legs.length];
        s.photo = false;
        if ('to' in leg) {
          const d = leg.to - r.x;
          const step = YAK.speed / 120;
          if (Math.abs(d) <= step) {
            r.moveTo(w2, leg.to, r.y);
            s.leg++;
            s.t = 0;
          } else {
            s.dir = d > 0 ? 1 : -1;
            r.moveTo(w2, r.x + Math.sign(d) * step, r.y);
          }
        } else {
          r.moveTo(w2, r.x, r.y);
          if (r.solid) r.solid.velX = 0;
          s.photo = !!leg.photo;
          s.t++;
          if (s.t >= leg.wait * 120) {
            s.leg++;
            s.t = 0;
          }
        }
      },
      paint: (ctx, r) => {
        const s = r.s as Yak['s'];
        const f = s.dir;
        const x = r.x,
          yy = r.y + r.h - YAK.h;
        if (r.h > YAK.h) {
          // the gate yak's load: sacks roped on high
          box(ctx, x + 6, r.y, r.w - 12, r.h - YAK.h + 2, '#A68F62');
          box(ctx, x + 6, r.y + 4, r.w - 12, 2, '#5D4A3A');
        }
        // a black-and-white yak with a red saddle blanket; shaggy skirt, horns, tassels
        box(ctx, x + 2, yy + 4, r.w - 4, 12, '#2B2622');
        for (let i = 0; i < 9; i++) box(ctx, x + 3 + i * 4, yy + 14, 3, 5 + (i % 2) * 2, '#3A332D');
        box(ctx, x + 10, yy + 1, 18, 6, '#C0392B');
        box(ctx, x + 10, yy + 1, 18, 2, '#F4D35E');
        const hx = f > 0 ? x + r.w - 4 : x - 4;
        box(ctx, hx, yy + 3, 8, 8, '#F1ECE1');
        box(ctx, hx + (f > 0 ? 6 : -2), yy, 2, 4, '#E9E4D6');
        box(ctx, hx + (f > 0 ? 0 : 6), yy, 2, 4, '#E9E4D6');
        box(ctx, hx + 2, yy + 10, 4, 2, '#C0392B');
        for (const lx of [x + 6, x + 14, x + 24, x + 32]) box(ctx, lx, yy + 18, 3, 4, '#2B2622');
        if (s.photo) {
          // the handler stepping back with the camera
          box(ctx, x + r.w / 2 - 3, yy - 30, 6, 4, '#26323A');
        }
      },
    }),
  ) as Yak;
  y.s = { leg: 0, t: 0, photo: false, dir: 1, started: false };
  if (startX !== 'mount')
    onPass(w, startX, () => {
      y.s.started = true;
    });
  (w.flags[key] ??= []).push(y);
  return y;
}

/** the thin shore: looks like snow on ice; stand on it and you go through (it's the feet that matter) */
export function thinShore(w: World, c0: number, c1: number) {
  w.add(
    new Rig(px(c0), FL - 3, px(c1 - c0 + 1), 3, {
      layer: 1,
      cause: 'gtk-hiun',
      inset: 0,
      live: (_r, w2) => w2.player.onGround && w2.player.y + w2.player.h >= FL - 1,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y - 1, r.w, 4, '#E8F1F6');
        for (let x = r.x + 5; x < r.x + r.w; x += 19) {
          ctx.strokeStyle = '#9DB8C9';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, FL - 2);
          ctx.lineTo(x + 6, FL + 3);
          ctx.lineTo(x + 3, FL + 9);
          ctx.stroke();
        }
      },
    }),
  );
}

/** the lake behind: frozen hard, blue-white, ringed by snowy slopes */
const lake = (w: World, x0: number, x1: number) =>
  decor(w, -5, (ctx) => {
    ctx.fillStyle = '#CFE3EE';
    ctx.beginPath();
    ctx.ellipse((x0 + x1) / 2, FL - 18, (x1 - x0) / 2, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let x = x0 + 20; x < x1 - 20; x += 46) ctx.fillRect(x, FL - 24, 22, 2);
  });

export function room(): LevelDef {
  return {
    id: 'GTK-09',
    city: 'GTK',
    index: 9,
    name: 'Tsomgo',
    nameEn: 'The high lake',
    tagline: 'Tsomgo, high above Gangtok: the lake frozen solid, the yaks waiting in a line for the tourists.',
    hint: 'The snow along the shore lies on thin ice: stand on it and you’re through. Ride the yak: it walks the shore on its loop. Halfway it stops for the handler’s photo, still on the thin ice: stay on. Step off on to the far bank before it turns round and walks you back.',
    par: 20,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      lake(w, px(5), px(27));
      thinShore(w, 6, 25);
      yak(
        w,
        px(2.5),
        [{ wait: 0.8 }, { to: px(13) }, { wait: 2.4, photo: true }, { to: px(26) }, { wait: 0.9 }, { to: px(2.5) }, { wait: 1.0 }],
        'mount',
        'gtk9',
      );
      w.add(new Rig(px(4), FL - 28, 10, 28, { layer: -1, paint: (ctx, r) => local(ctx, r.x + 5, r.y, 28, '#8E6C8A', { cap: '#C0392B' }) }));
      sign(w, 2, 8.6, 4.2, 'TSOMGO', 'wood', null, 'yak ride');
      rival(w, 4.5, 15, 1, taraScript(9));
      onPass(w, px(3), (w2) => tara(w2, 'Hajur! Off the yak when it stops! | Yes! Off the yak when it stops!', 2.4));
      collectible(w, 'gtk-churpi', 13.8, 10.2);
    },
  };
}

/** act: a yak that only goes as far as the photo stop and back: jump for the bank from its back */
export const act: Act = {
  id: 'gtk09-chamri',
  w: 34,
  advice: 'This yak only goes as far as the photo stop and turns back, short of the far bank. Ride it out, and while it stands for the photo, jump from its back on to the bank.',
  paint: (g, c) => {
    g.fill(c.x + 25, c.x + 33, 13, 14, '#');
  },
  build: (w, c) => {
    lake(w, c.X(2), c.X(26));
    thinShore(w, c.x + 3, c.x + 24);
    yak(w, c.X(0.5), [{ wait: 0.8 }, { to: c.X(21) }, { wait: 2.4, photo: true }, { to: c.X(0.5) }, { wait: 1.0 }], 'mount', 'gtk9a');
    onPass(w, c.X(14), (w2) => npc(w2, 'Hajur! Photo! | Yes! A photo!', c.X(21), FL - 50, 1.4));
    sign(w, c.x + 27, 8, 3.6, 'CHANGU', 'wood', null, 'snow point');
  },
};

/** door: up on the snowbank. The gate yak walks to and fro below it; ride it to the high end and hop up */
export const ending: Ending = {
  space: 13,
  advice: 'The door is up on the snowbank, too high to jump to from the ground. The gate yak walks to and fro along its foot: get on its back, ride it to the bank end and hop up to the door.',
  paint: (g, D) => {
    g.fill(D - 2, D + 4, 10, 14, '#');
    g.put(D, 14, '.');
    g.fill(D, D, 10, 14, '#');
    g.put(D, 9, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'gateyak';
    yak(w, px(D - 9), [{ to: px(D - 4.5) }, { wait: 1.4 }, { to: px(D - 9) }, { wait: 1.4 }], px(D - 13), 'gtk9e', 36);
  },
};

export const meta09 = { family: 'ride-animal-fixed-loop', betrayals: ['ride-fixed-loop'], ending: 'gtk-gate-yak-snowbank' };
