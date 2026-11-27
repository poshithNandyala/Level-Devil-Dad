// SHL-04 Knup: the bamboo-and-leaf rain shield, hands free. Jump at a hook to put it on or take it off. With it
// on, the rain and the awning drips are nothing; but it stands wide and high over your head, and a low branch
// or a half-door catches it. Read what each stretch needs: knup on for the wet, off for the low.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { knupArt, rainArt, taraScript, FL } from './common';
import { lines as L, npc } from './lines';

export interface KnupState {
  on: boolean;
  /** the knup worn: the big one covers heavy rain; the small one fits under a low arch but not heavy rain */
  size: 'big' | 'small';
  hooks: { x: number; inside: boolean }[];
}
/** the knup's extra size over Dad: px each side, px above his head */
export const KNUP = { side: 7, up: 14, sideSmall: 4, upSmall: 4 };

export function knupState(w: World, key: string): KnupState {
  const st: KnupState = { on: false, size: 'big', hooks: [] };
  w.flags[key] = st;
  // Dad wears it: drawn over him
  w.add(
    new Paint((ctx, w2) => {
      if (!st.on) return;
      const p = w2.player;
      if (st.size === 'big') knupArt(ctx, p.cx, p.y - KNUP.up - 2, 2 * KNUP.side + 12, 30);
      else knupArt(ctx, p.cx, p.y - KNUP.upSmall - 2, 2 * KNUP.sideSmall + 12, 22);
    }, 6),
  );
  return st;
}

/** a hook on a post at column c: jump at it (head height and above) to put the knup on or hang it up */
export function hook(w: World, st: KnupState, c: number, size: 'big' | 'small' = 'big') {
  const h = { x: px(c), inside: false };
  st.hooks.push(h);
  const r = w.add(
    new Rig(px(c) - 2, FL - 56, 24, 20, {
      layer: 3,
      tick: (rr, w2) => {
        const p = w2.player;
        const over = p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y < rr.y + rr.h && p.y + p.h > rr.y;
        if (over && !h.inside) {
          // wearing the same size: hang it up; wearing the other: swap; bare: take this one
          if (st.on && st.size === size) st.on = false;
          else {
            st.on = true;
            st.size = size;
          }
          w2.sfx(st.on ? 'click' : 'thud', rr.x, rr.y);
        }
        h.inside = over;
      },
      paint: (ctx, rr) => {
        box(ctx, rr.x + 10, FL - 60, 3, 60, '#6B4F2E');
        box(ctx, rr.x + 2, FL - 60, 20, 3, '#6B4F2E');
        box(ctx, rr.x + 18, FL - 58, 2, 6, '#3E4D47');
        // this hook's knup hangs here unless Dad is wearing it
        if (!(st.on && st.size === size)) {
          if (size === 'big') knupArt(ctx, rr.x + 12, FL - 56, 22, 26);
          else knupArt(ctx, rr.x + 12, FL - 52, 14, 18);
        }
      },
    }),
  );
  return r;
}

/** heavy rain over columns c0..c1: deadly to a bare Dad */
export function rain(w: World, st: KnupState, c0: number, c1: number) {
  return w.add(
    new Rig(px(c0), 0, px(c1 - c0 + 1), FL, {
      layer: 4,
      cause: 'shl-slap',
      inset: 3,
      live: () => !st.on || st.size === 'small',
      paint: (ctx, r, w2) => {
        ctx.fillStyle = 'rgba(150,170,180,0.45)';
        ctx.fillRect(r.x - 6, 20, r.w + 12, 18);
        rainArt(ctx, r.x + 2, r.x + r.w - 2, 36, w2.tick / 120, 1);
      },
    }),
  );
}

/** an awning whose edge drips in a row over columns c0..c1: a spike row to a bare head, nothing to a knup */
export function drips(w: World, st: KnupState, c0: number, c1: number) {
  return w.add(
    new Rig(px(c0), FL - 40, px(c1 - c0 + 1), 40, {
      layer: 4,
      cause: 'shl-drip',
      inset: 2,
      live: () => !st.on,
      paint: (ctx, r, w2) => {
        box(ctx, r.x - 8, FL - 64, r.w + 16, 6, '#2F5D45');
        box(ctx, r.x - 8, FL - 58, r.w + 16, 2, '#1F4030');
        ctx.fillStyle = 'rgba(190,224,240,0.9)';
        for (let x = r.x + 3; x < r.x + r.w; x += 7) {
          const y = FL - 56 + ((w2.tick * 2.2 + x * 5) % 56);
          ctx.fillRect(x, y, 2, 7);
        }
      },
    }),
  );
}

/** a low branch (or lintel) across the path at column c, `clear` px above the ground: the knup catches on it */
export function lowBar(w: World, st: KnupState, c: number, clear: number, cause: string, art: (ctx: CanvasRenderingContext2D, x: number) => void, wide = 10) {
  // the deadly box is the bar grown by the knup's size, so a bare Dad under it is never touched
  return w.add(
    new Rig(px(c) - KNUP.side, FL - clear - 6, wide + 2 * KNUP.side, 6 + KNUP.up, {
      layer: 3,
      cause,
      inset: 0,
      live: () => st.on && st.size === 'big',
      paint: (ctx) => art(ctx, px(c)),
    }),
  );
}

export const branchArt = (ctx: CanvasRenderingContext2D, x: number) => {
  box(ctx, x - 30, FL - 70, 60, 4, '#4A3A2A');
  box(ctx, x - 2, FL - 30, 14, 6, '#4A3A2A');
  box(ctx, x - 12, FL - 66, 8, 36, '#4A3A2A');
  ctx.fillStyle = '#2F5D45';
  for (let i = 0; i < 5; i++) box(ctx, x - 28 + i * 12, FL - 80 + (i % 2) * 6, 10, 10, '#2F5D45');
};

export function room(): LevelDef {
  return {
    id: 'SHL-04',
    city: 'SHL',
    index: 4,
    name: 'Knup',
    nameEn: 'The rain shield',
    tagline: 'Hands free, head dry, and a lot wider than you think.',
    hint: 'Jump at the hook to put the knup on; jump at the next to hang it up. With it on, heavy rain and the awning’s drips do nothing to you; without it they kill. But it stands wide and high over your head, and the low branch catches it: knup on through the rain, off under the branch, on again under the awning.',
    par: 24,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = knupState(w, 'shl4');
      hook(w, st, 5);
      rain(w, st, 8, 13);
      hook(w, st, 15);
      lowBar(w, st, 18, 24, 'shl-dieng', branchArt);
      hook(w, st, 20.5);
      drips(w, st, 23, 25);
      rain(w, st, 26, 28);
      onPass(w, px(2.5), (w2) => w2.say(npc.knup, px(5) + 8, px(10.6), 2.4, 'npc'));
      onPass(w, px(6), (w2) => tara(w2, L.intro[2], 2.2));
      sign(w, 2.5, 10.2, 3, 'KNUP', 'shop', null, 'bamboo and leaf');
      rival(w, 29, 15, -1, taraScript(4));
      collectible(w, 'shl-pumaloi', 10.5, 11.4);
    },
  };
}

/** act: the market lane: a tall arch the knup fits under, with a hook before it as a lure, then a low one */
export const act: Act = {
  id: 'shl04-iew',
  w: 34,
  advice: 'The lane to Ïewduh. The first arch is tall: the knup fits, so leave it on for the rain beyond, whatever the hook before the arch invites. The second arch is low: hang the knup up before it, and take it again for the awning after.',
  cps: [1.5],
  paint: () => {},
  build: (w, c) => {
    const st = w.flags.shl4 as KnupState;
    rain(w, st, c.x + 4, c.x + 8);
    hook(w, st, c.x + 10.5);
    // the tall arch: 4 tiles clear, the knup passes
    w.add(
      new Paint((ctx) => {
        const x = px(c.x + 13);
        box(ctx, x - 4, FL - 76, 6, 76, '#5C6F66');
        box(ctx, x + 14, FL - 76, 6, 76, '#5C6F66');
        box(ctx, x - 6, FL - 82, 28, 8, '#5C6F66');
      }, -3),
    );
    rain(w, st, c.x + 15, c.x + 19);
    hook(w, st, c.x + 21.5);
    lowBar(w, st, c.x + 24, 24, 'shl-lintel', (ctx, x) => {
      box(ctx, x - 4, FL - 30, 4, 30, '#5C6F66');
      box(ctx, x + 10, FL - 30, 4, 30, '#5C6F66');
      box(ctx, x - 6, FL - 36, 22, 8, '#5C6F66');
    });
    hook(w, st, c.x + 26.5);
    drips(w, st, c.x + 29, c.x + 31);
    sign(w, c.x + 1, 10.4, 3, 'ÏEWDUH', 'shop', null, 'the big market');
  },
};

/** act 2: a child's knup hangs by the school lane: small enough for the low arch, too small for the heavy rain */
export const actSmall: Act = {
  id: 'shl04-khynnah',
  w: 32,
  advice: 'A small knup hangs by the school lane: jump at it wearing the big one and you swap. The small one passes under the low arch and keeps the awning’s drips off, but it is too small for heavy rain: swap back to a big one at the hook before the rain.',
  cps: [1],
  paint: () => {},
  build: (w, c) => {
    const st = w.flags.shl4 as KnupState;
    hook(w, st, c.x + 5, 'small');
    lowBar(w, st, c.x + 9, 24, 'shl-lintel', (ctx, x) => {
      box(ctx, x - 4, FL - 30, 4, 30, '#5C6F66');
      box(ctx, x + 10, FL - 30, 4, 30, '#5C6F66');
      box(ctx, x - 6, FL - 36, 22, 8, '#5C6F66');
    });
    drips(w, st, c.x + 12, c.x + 15);
    hook(w, st, c.x + 18.5, 'big');
    rain(w, st, c.x + 21, c.x + 27);
    sign(w, c.x + 2, 10.4, 3, 'SCHOOL', 'shop', null, 'small knups');
  },
};

/** ending: a Khasi half-door, lintel at head height: hang the knup on the hook outside and walk in bare */
export const ending: Ending = {
  space: 12,
  advice: 'The house door is a half-door, low: hang the knup on the hook outside it and walk in without it.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const st = w.flags.shl4 as KnupState;
    w.flags.twist = 'halfdoor';
    hook(w, st, D - 6);
    lowBar(w, st, D - 1.2, 24, 'shl-lintel', (ctx, x) => {
      box(ctx, x - 6, FL - 30, 4, 30, '#6B4F2E');
      box(ctx, x + 12, FL - 30, 4, 30, '#6B4F2E');
      box(ctx, x - 8, FL - 36, 28, 6, '#6B4F2E');
    }, 14);
  },
};

export const meta04 = { family: 'wide-gear-hitbox', betrayals: ['wide-gear'], ending: 'shl-halfdoor' };
