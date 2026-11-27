// GTK-09 Tsomgo (the high lake). Up at Tsomgo the lake is frozen hard, but the shore is where the ice is thin.
// The yaks walk tourists along the shore and never turn back: after the far bank they wade on into the river.
// Ride one across the thin shore. It stops halfway for the photo, on thin ice that looks like a bank: stay on.
// Get off on the real bank, before it walks you into the river.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, decor, local, px } from './entities';
import { taraScript } from './common';

// round 5: the yaks walk a little quicker, so no ride between two banks is longer than about 7 s
export const YAK = { w: 40, h: 22, speed: 72 };

/** one leg of the yak's loop: walk to x (px) or stop for `wait` seconds (a photo stop if `photo`) */
export type Leg = { to: number } | { wait: number; photo?: boolean } | { sink: true };

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
        if ('sink' in leg) {
          // into the river: forward and down, and the water takes whoever is still on its back
          if (r.y < FL + 30) r.moveTo(w2, r.x + YAK.speed / 120, r.y + 0.5);
          return;
        }
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
  ((w.flags.gtkYaks as Yak[] | undefined) ?? (w.flags.gtkYaks = [] as Yak[])).push(y);
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
      // off a yak that is standing for its photo, beside it: the photo stop's own cause
      tick: (r, w2) => {
        const yaks = (w2.flags.gtkYaks as Yak[] | undefined) ?? [];
        const by = yaks.some((y) => y.s.photo && Math.abs(y.x + y.w / 2 - w2.player.cx) < px(4));
        if (r.hazard) r.hazard.cause = by ? 'gtk-photo' : 'gtk-hiun';
      },
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

/** the glacier river below the bank: the yak wades in, and whoever is on its back goes with it */
export function river(w: World, c0: number, c1: number) {
  w.add(
    new Rig(px(c0), FL + 8, px(c1 - c0 + 1), 40, {
      layer: 3,
      cause: 'gtk-nadi',
      inset: 0,
      paint: (ctx, r, w2) => {
        box(ctx, r.x, FL + 4, r.w, 32, '#4F7F9E');
        for (let i = 0; i < r.w; i += 10) box(ctx, r.x + i + ((w2.tick >> 1) % 10), FL + 7, 5, 1, 'rgba(240,250,255,0.6)');
      },
    }),
  );
}

/** the photo stop: thin shore with stones and grass on it, so it looks like the bank (the cracks still show) */
export function bankLook(w: World, c0: number, c1: number) {
  decor(w, 2, (ctx) => {
    for (let x = px(c0); x < px(c1); x += 9) box(ctx, x, FL - 4, 5, 3, (x >> 3) % 2 ? '#8C8C84' : '#6F7A5A');
  });
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
    hint: 'The snow along the shore lies on thin ice: stand on it and you’re through. Ride the yak across. Halfway it stops for the handler’s photo, on thin ice that only looks like a bank: stay on. It never turns back: get off on the real bank as it walks over it, before it wades on into the river.',
    par: 20,
    map: Grid.ground(15).pit(23, 24).put(1, 14, '@').put(31, 14, 'E').rows(),
    build(w: World) {
      door(w);
      lake(w, px(5), px(27));
      thinShore(w, 6, 17);
      bankLook(w, 7, 13);
      river(w, 23, 24);
      yak(
        w,
        px(2.5),
        [{ wait: 0.6 }, { to: px(9) }, { wait: 1.6, photo: true }, { to: px(20.5) }, { sink: true }],
        'mount',
        'gtk9',
      );
      w.add(new Rig(px(4), FL - 28, 10, 28, { layer: -1, paint: (ctx, r) => local(ctx, r.x + 5, r.y, 28, '#8E6C8A', { cap: '#C0392B' }) }));
      sign(w, 2, 8.6, 4.2, 'TSOMGO', 'wood', null, 'yak ride');
      rival(w, 4.5, 15, 1, taraScript(9));
      onPass(w, px(3), (w2) => tara(w2, 'Hajur! Off the yak when it stops! | Yes! Off the yak when it stops!', 2.4));
      collectible(w, 'gtk-churpi', 9.8, 10.2);
    },
  };
}

/** act: a yak that only goes as far as the photo stop and back: jump for the bank from its back */
export const act: Act = {
  id: 'gtk09-chamri',
  w: 34,
  advice: 'This yak stops for its photo right under the high bank, and then wades on into the river. Ride it out, and while it stands for the photo, jump from its back up on to the bank.',
  paint: (g, c) => {
    g.pit(c.x + 19, c.x + 20);
    g.fill(c.x + 21, c.x + 33, 13, 14, '#');
  },
  build: (w, c) => {
    lake(w, c.X(2), c.X(22));
    // a bank 5 tiles wide at the start, so a checkpoint there is calm
    thinShore(w, c.x + 5.5, c.x + 18);
    river(w, c.x + 19, c.x + 20);
    yak(w, c.X(3), [{ wait: 0.5 }, { to: c.X(17) }, { wait: 2.0, photo: true }, { sink: true }], 'mount', 'gtk9a');
    onPass(w, c.X(10), (w2) => npc(w2, 'Hajur! Photo! | Yes! A photo!', c.X(17), FL - 50, 1.4));
    sign(w, c.x + 27, 8, 3.6, 'CHANGU', 'wood', null, 'snow point');
  },
};

/** act 2: a yak that doesn't stop till the far end, and the far end is thin ice too. Its loop passes under the
 *  stair up to the snow road: get off on the move, up on to the stair */
export const act2: Act = {
  id: 'gtk09-chattan',
  w: 36,
  advice: 'The last yak doesn’t stop at all: it walks the whole thin shore and out into the open lake, through the ice. Its way passes under the stair up to the snow road: as you go under the first step, jump off its back on to it, and climb.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 24, x + 25);
    g.fill(x + 12, x + 15, 12, 12, '=');
    g.fill(x + 15, x + 18, 10, 10, '=');
    g.fill(x + 18, x + 33, 8, 9, '#');
  },
  build: (w, c) => {
    const x = c.x;
    thinShore(w, x + 5.5, x + 23);
    // the open lake past the shore: the yak walks into it, through the ice, and takes whoever is still on it
    river(w, x + 24, x + 25);
    thinShore(w, x + 26, x + 32);
    yak(w, c.X(3), [{ wait: 0.5 }, { to: c.X(22) }, { sink: true }], 'mount', 'gtk9b');
    sign(w, x + 30, 4.4, 3.8, 'SNOW POINT', 'wood', null, 'this way');
  },
};

/** act 3: two photo stops, on two yaks. The first stops for its photo on the thin shore and wades into the stream
 *  past the moraine bank; across the stream the second waits at the end of a long bank, stops for its photo, and
 *  wades into the river past the far bank. Stay on through each photo, off on each real bank. Each ride starts
 *  when Dad gets on, and the long bank between them is a calm pause */
export const act3: Act = {
  id: 'gtk09-dophoto',
  w: 50,
  advice: 'Two yaks, two photo stops, both on the thin shore. Stay on through the first photo and get off on the moraine before it wades into the stream; jump the stream, walk the bank to the second yak, stay on through its photo too, and off on the far bank before the river.',
  paint: (g, c) => {
    g.pit(c.x + 21, c.x + 22);
    g.pit(c.x + 44, c.x + 45);
  },
  build: (w, c) => {
    lake(w, c.X(3), c.X(40));
    // a 6.5-tile bank at the start: the act's checkpoint is 4.5 tiles or more from the thin shore
    thinShore(w, c.x + 7, c.x + 15);
    river(w, c.x + 21, c.x + 22);
    // the bank across the stream is 7 tiles: its checkpoint (+23.5) is clear of a tap-jump
    thinShore(w, c.x + 31, c.x + 38);
    river(w, c.x + 44, c.x + 45);
    yak(w, c.X(3), [{ wait: 0.5 }, { to: c.X(10) }, { wait: 1.8, photo: true }, { to: c.X(18.5) }, { sink: true }], 'mount', 'gtk9c');
    yak(w, c.X(28.2), [{ wait: 0.5 }, { to: c.X(33) }, { wait: 1.8, photo: true }, { to: c.X(41) }, { sink: true }], 'mount', 'gtk9c2');
    sign(w, c.x + 16, 8.6, 3.4, 'MORAINE', 'wood', null, 'firm ground');
    sign(w, c.x + 40, 8.6, 3.4, 'TSOMGO', 'wood', null, 'far bank');
  },
};
/** act 4: here the yak's loop crosses the lake itself, and the frozen lake is the safe part: off its back on to
 *  the blue ice, and walk across; the white snow either side lies on thin ice */
export const act4: Act = {
  id: 'gtk09-barf',
  w: 40,
  advice: 'This yak walks out across the frozen lake and back. The blue lake ice is thick and holds: get off on to it and walk across. It’s the white snow at the shore, either side, that lies on thin ice.',
  build: (w, c) => {
    thinShore(w, c.x + 5.5, c.x + 12);
    thinShore(w, c.x + 27, c.x + 34);
    decor(w, 1, (ctx) => {
      // the lake ice, blue and hard, cracked only on top
      box(ctx, c.X(13), FL - 3, px(14), 5, '#7FB3D5');
      for (let i = 0; i < 6; i++) box(ctx, c.X(14) + i * 34, FL - 1, 12, 1, 'rgba(255,255,255,0.7)');
    });
    // the yaks never turn back: the first stands on the lake ice once it is out there, the second on the far bank
    yak(w, c.X(3), [{ wait: 0.6 }, { to: c.X(17) }, { wait: 9999 }], 'mount', 'gtk9d');
    // and a second yak waiting on the far side of the lake, to take you over the far shore
    yak(w, c.X(24), [{ wait: 0.6 }, { to: c.X(35) }, { wait: 9999 }], 'mount', 'gtk9d2');
    sign(w, c.x + 18, 8.6, 3.4, 'LAKE ICE', 'wood', null, 'thick');
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
