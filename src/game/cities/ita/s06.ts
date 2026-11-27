// ITA-06 Dhaan aur Machhli: the Apatani paddies of Ziro, rice and fish in one tank. A row of tanks with bunds between
// them. A full tank is deep water: walking in is the end. A low tank is knee-deep and a floor. On each bund stands the
// lever of a sluice, and a bamboo channel is drawn from it to the tank its water goes to: pull the lever (jump at its
// handle) and this tank drains in a second, and a second and a half later its water arrives in that other tank as a surge
// that runs the length of it. Read the channel: never be in the tank the water is on its way to.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export const TW = 4;
const BED = FL + 32;
const DRAIN = 1.0;
export const TRAVEL = 1.5;
const SURGE = 1.3;

export interface Tank {
  /** first column (TW wide) */
  c: number;
  level: 'full' | 'low';
  /** seconds (tick) at which it started draining / will be filled, -1 if not */
  drainT: number;
  fillT: number;
  rig?: Rig;
}
export interface Lever {
  /** the bund column it stands on */
  c: number;
  /** the tank it drains (index) */
  k: number;
  /** the tank its water goes to (index), or -1 for the river */
  to: number;
  pulledT: number;
}
export interface Paddy {
  tanks: Tank[];
  levers: Lever[];
}

/** carve the tanks: the pit of each (2 deep, a one-way bed) */
export function carveTanks(g: Grid, tanks: { c: number }[]) {
  for (const t of tanks) {
    g.fill(t.c, t.c + TW - 1, 15, 16, '.');
    for (let c = t.c; c < t.c + TW; c++) g.put(c, 17, '=');
  }
}

function waterArt(ctx: CanvasRenderingContext2D, x: number, w: number, top: number, deep: boolean, tick: number) {
  ctx.fillStyle = deep ? 'rgba(60,110,120,0.92)' : 'rgba(120,170,140,0.75)';
  ctx.fillRect(x, top, w, BED - top);
  ctx.strokeStyle = 'rgba(230,245,235,0.5)';
  ctx.lineWidth = 0.8;
  for (let xx = x + ((tick * 0.3) % 14); xx < x + w - 6; xx += 14) {
    ctx.beginPath();
    ctx.moveTo(xx, top + 2);
    ctx.lineTo(xx + 6, top + 2);
    ctx.stroke();
  }
  // a fish or two
  ctx.fillStyle = '#C8C8A0';
  const fx = x + 8 + ((tick >> 2) % Math.max(1, w - 24));
  ctx.fillRect(fx, BED - 10, 6, 3);
  ctx.fillRect(fx - 2, BED - 11, 2, 5);
}

/** the paddies from the tank specs; `key` holds the state for the tests */
export function paddies(w: World, tanks: { c: number; full: boolean }[], levers: { c: number; k: number; to: number }[], key: string): Paddy {
  const st: Paddy = {
    tanks: tanks.map((t) => ({ c: t.c, level: t.full ? 'full' : 'low', drainT: -1, fillT: -1 })),
    levers: levers.map((l) => ({ ...l, pulledT: -99 })),
  };
  w.flags[key] = st;
  for (const t of st.tanks) {
    const x0 = px(t.c),
      wd = px(TW);
    t.rig = w.add(
      new Rig(x0, FL + 2, wd, BED - (FL + 2), {
        layer: 4,
        cause: 'ita-doob',
        inset: 0,
        live: () => t.level === 'full',
        tick: (_r, w2) => {
          if (t.drainT >= 0 && since(w2, t.drainT) >= DRAIN) {
            t.level = 'low';
            t.drainT = -1;
          }
          if (t.fillT >= 0 && since(w2, t.fillT) >= TRAVEL + SURGE) {
            t.level = 'full';
            t.fillT = -1;
          }
        },
        paint: (ctx, r, w2) => {
          const draining = t.drainT >= 0 ? since(w2, t.drainT) / DRAIN : -1;
          const surging = t.fillT >= 0 ? (since(w2, t.fillT) - TRAVEL) / SURGE : -1;
          let top = t.level === 'full' ? FL - 10 : BED - 10;
          if (draining >= 0) top = FL - 10 + (BED - 10 - (FL - 10)) * Math.min(1, draining);
          waterArt(ctx, r.x, r.w, top, t.level === 'full' && draining < 0, w2.tick);
          if (surging >= 0 && surging <= 1) {
            // the surge: a wave running the length of the tank
            const sx = r.x + surging * (r.w - 24);
            ctx.fillStyle = 'rgba(200,235,235,0.95)';
            ctx.fillRect(sx, FL - 8, 24, BED - (FL - 8));
            ctx.fillRect(sx - 6, FL - 14, 12, 8);
          }
          // the bund walls either side
          box(ctx, r.x - 2, FL, 2, BED - FL, '#6B5A3A');
          box(ctx, r.x + r.w, FL, 2, BED - FL, '#6B5A3A');
        },
      }),
    );
    // the surge is deadly where the wave is
    w.add(
      new Rig(x0, FL + 2, 24, BED - (FL + 2), {
        layer: 3,
        cause: 'ita-bahaav',
        inset: 0,
        live: (r) => r.s.live === true,
        tick: (r, w2) => {
          const surging = t.fillT >= 0 ? (since(w2, t.fillT) - TRAVEL) / SURGE : -1;
          r.s.live = surging >= 0 && surging <= 1;
          if (r.s.live) r.x = x0 + surging * (wd - 24);
          if (surging >= 0 && surging < 1 / 120 + 0.001) w2.sfx('splash', x0, FL);
        },
        paint: () => {},
      }),
    );
  }
  for (const l of st.levers) {
    const hx = px(l.c) + 3;
    const tank = st.tanks[l.k];
    const dest = l.to >= 0 ? st.tanks[l.to] : null;
    w.add(
      new Rig(hx - 6, FL - 74, 22, 14, {
        layer: 3,
        tick: (r, w2) => {
          const p = w2.player;
          const hit = !p.onGround && p.y <= r.y + r.h && p.y + p.h > r.y - 6 && p.x + p.w > r.x && p.x < r.x + r.w;
          if (hit && since(w2, l.pulledT) > 1.0) {
            l.pulledT = w2.tick;
            if (tank.level === 'full' && tank.drainT < 0) {
              tank.drainT = w2.tick;
              w2.sfx('pour', hx, FL);
              if (dest) dest.fillT = w2.tick;
              r.s.pulled = true;
            } else {
              // nothing to drain: the handle springs back
              w2.sfx('creak', hx, FL - 40);
              r.s.sprang = w2.tick;
            }
          }
        },
        paint: (ctx, r, w2) => {
          const recent = since(w2, l.pulledT) < 0.6;
          // the post, the handle (down when just pulled), the channel to its tank
          box(ctx, hx, FL - 78, 4, 78, '#6B4A2A');
          box(ctx, hx - 8, recent ? FL - 60 : FL - 76, recent ? 4 : 16, recent ? 16 : 4, '#C9B06A');
          box(ctx, hx + 6, FL - 62, 4, 4, '#F28C28');
          void r;
          // the channel: a bamboo pipe from this bund over the tanks to the destination (or off to the river)
          const x1 = dest ? px(dest.c) + 6 : px(l.c) + 40;
          const cy = FL - 60 - l.k * 5;
          ctx.fillStyle = '#A88A4A';
          const a = Math.min(hx, x1),
            b = Math.max(hx, x1);
          ctx.fillRect(a, cy, b - a + 4, 4);
          ctx.fillRect(x1, cy, 4, dest ? FL - 10 - cy : 20);
          ctx.fillStyle = '#F28C28';
          ctx.fillRect(x1 - 2, cy - 4, 8, 3);
          if (!dest) {
            ctx.font = '700 8px sans-serif';
            ctx.fillStyle = '#E8E0D0';
            ctx.fillText('NADI', x1 - 6, cy - 6);
          }
        },
      }),
    );
  }
  return st;
}

const ROOM_T = [
  { c: 6, full: true },
  { c: 12, full: false },
  { c: 18, full: true },
];
const ROOM_L = [
  { c: 5, k: 0, to: 1 },
  { c: 11, k: 1, to: 2 },
  { c: 17, k: 2, to: -1 },
];

export function room(): LevelDef {
  return {
    id: 'ITA-06',
    city: 'ITA',
    index: 6,
    name: 'Dhaan aur Machhli',
    nameEn: 'Rice and fish',
    tagline: 'Three tanks, three levers, and the water has to go somewhere.',
    hint: 'A full tank is deep: walking in is the end. A low tank is a knee-deep floor. The lever on each bund (a full jump at its handle) drains the tank after it in a second, and the bamboo channel drawn from the lever shows where that water goes: a second and a half later it arrives in that tank as a surge that runs its length and sweeps whoever stands in it. Pull, cross the drained tank, and on the next bund wait for the surge to have filled the tank ahead before you pull its lever. The last lever sends its water to the river.',
    par: 36,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
      carveTanks(g, ROOM_T);
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      paddies(w, ROOM_T, ROOM_L, 'ita6');
      onPass(w, px(3), (w2) => tara(w2, L.intro[4], 2.4));
      onPass(w, px(2), (w2) => w2.say(NPC.machhli, px(3), FL - 36, 2.2, 'npc'));
      sign(w, 2, 10.4, 3.4, 'ZIRO', 'shop', null, 'Apatani paddies');
      rival(w, 28, 15, -1, taraScript(6));
      collectible(w, 'ita-momo', 14, 11.4);
    },
  };
}

// the first tank starts 4.5 tiles after the act's checkpoint (a walk or a tap-walk from it stops on the bund)
const NAHAR_T = [
  { c: 5, full: true },
  { c: 12, full: true },
  { c: 18, full: false },
  { c: 24, full: false },
  { c: 30, full: true },
];
/** two levers share the second bund: the near one drains the second tank into the fourth, the far one drains the third
 *  tank back into the second: pull both at once ("drain everything ahead") and the second tank fills under you */
const NAHAR_L = [
  { c: 3, k: 0, to: 2 },
  { c: 8.6, k: 1, to: 3 },
  { c: 10.2, k: 2, to: 1 },
  { c: 22, k: 3, to: 4 },
  { c: 28, k: 4, to: -1 },
];

export const act: Act = {
  id: 'ita06-nahar',
  w: 36,
  advice: 'Five tanks, and the channels cross. The second bund has two levers: the near one drains the tank after it into the fourth tank, the far one drains the third tank back into the second. Pull them one at a time, in the order of your walk, and read each channel before you pull: never drain into a tank you are about to cross.',
  cps: [33],
  paint: (g, c) => {
    carveTanks(g, NAHAR_T.map((t) => ({ c: c.x + t.c })));
  },
  build: (w, c) => {
    paddies(
      w,
      NAHAR_T.map((t) => ({ ...t, c: c.x + t.c })),
      NAHAR_L.map((l) => ({ ...l, c: c.x + l.c })),
      'ita6a',
    );
    sign(w, c.x + 1, 10.4, 3, 'NAHAR', 'shop', null, 'the channels');
  },
};

// The door is plain. The river sluice whose gate the pour held open ("go through in the gap after the pour stops") was
// TVM-03's cross-after-the-pour thought (DECISIONS.md S20) and was cut. The finale's act C is the sluice turned round.
export const meta06 = { family: 'linked-tanks-lever-order', betrayals: ['lever-water-order'], ending: 'ita-plain-river-bund' };
