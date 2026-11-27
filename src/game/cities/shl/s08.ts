// SHL-08 Wettest Desert (HWIK): Sohra, the wettest place, short of water. A rain cloud seeks whoever walks
// under it; the tank by the path fills only while the rain falls into its gutter, so it fills only while you are
// out of the cloud's reach, or under the tank's own roof, where the rain on you drains into it. The gate opens
// when the gauge is full, and the spout pours across the path for a moment as it does.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { cloudArt, rainArt, taraScript, FL } from './common';
import { lines as L } from './lines';

export interface TankOpts {
  key: string;
  /** the tank's left column (two tiles wide); its gutter is over it */
  tank: number;
  /** the cloud seeks Dad while his centre is within these columns */
  reach: [number, number];
  /** where the cloud goes when Dad is out of reach (column of its centre); default over the gutter */
  home?: number;
  /** a tin roof over these columns: rain on it drains into the tank, and a Dad under it stays dry */
  roof?: [number, number];
  /** a hole in the roof over these columns: rain comes through */
  hole?: [number, number];
  /** the roof's lower edge sheds a sheet on to this column while rain is on the roof */
  runoff?: number;
  /** the gate column: a wall until the tank is full (none: no gate) */
  gate?: number;
  /** the spout column: pours across the path for 2.2 s when the tank fills */
  spout?: number;
  /** seconds of rain into the gutter (or on to the roof) to fill */
  fill?: number;
  /** a second tank the gate also waits for */
  also?: string;
  /** the beat starts (the gauge counts) once Dad has passed this column */
  arm: number;
}

export interface TankState {
  armed: boolean;
  cx: number;
  gauge: number;
  soak: number;
  fullAt: number;
  o: TankOpts;
  /** is Dad under this tank's roof (and not under its hole) right now */
  dry: (w: World) => boolean;
  spouting: (w: World) => boolean;
}

export const SOAK_AT = 1.5;
export const SPOUT_FOR = 2.2;
export const CLOUD_V = 100;

/** one tank, one cloud, one gate: the whole beat */
export function tank(w: World, o: TankOpts): TankState {
  const home = px((o.home ?? o.tank + 1) + 0.5);
  // the cloud starts over the beat's entrance, on whoever comes in; it goes home only once nobody is in its reach
  const st: TankState = {
    armed: false,
    cx: px(o.arm + 2),
    gauge: 0,
    soak: 0,
    fullAt: -1,
    o,
    // dry under any roof of the stage (two tanks can share a stretch), but not under a hole
    dry: (w2) => {
      const c = w2.player.cx / 16;
      const roofs = (w2.flags.shl8roofs ?? []) as { roof: [number, number]; hole?: [number, number] }[];
      return roofs.some((r) => c >= r.roof[0] && c < r.roof[1] + 1 && !(r.hole && c >= r.hole[0] && c < r.hole[1] + 1));
    },
    spouting: (w2) => st.fullAt >= 0 && (w2.tick - st.fullAt) / 120 < SPOUT_FOR,
  };
  w.flags[o.key] = st;
  if (o.roof) (w.flags.shl8roofs = w.flags.shl8roofs ?? []).push({ roof: o.roof, hole: o.hole });
  const gutter: [number, number] = [px(o.tank), px(o.tank + 2)];
  const roofPx: [number, number] | null = o.roof ? [px(o.roof[0]), px(o.roof[1] + 1)] : null;
  const fill = o.fill ?? 3.0;
  // the cloud forms over whoever comes in: when the beat arms it is on Dad, and goes home only once he is out of reach
  onPass(w, px(o.arm), (w2) => {
    st.armed = true;
    st.cx = w2.player.cx;
  });
  // the cloud, its shadow and its rain; the soaking of whoever stands in it
  const cloud = w.add(
    new Rig(st.cx - 20, 0, 40, FL, {
      layer: 4,
      cause: 'shl-soaked',
      inset: 3,
      live: () => false,
      tick: (r, w2) => {
        const p = w2.player;
        const c = p.cx / 16;
        const target = c >= o.reach[0] && c <= o.reach[1] + 1 ? p.cx : home;
        const d = target - st.cx;
        st.cx += Math.sign(d) * Math.min(Math.abs(d), perTick(CLOUD_V));
        r.x = st.cx - 20;
        const rain: [number, number] = [st.cx - 20, st.cx + 20];
        const over = (a: [number, number]) => rain[0] < a[1] && rain[1] > a[0];
        // the gauge: rain into the gutter, or on to the roof
        if (st.armed && st.fullAt < 0 && (over(gutter) || (roofPx && over(roofPx)))) st.gauge = Math.min(1, st.gauge + 1 / (fill * 120));
        if (st.gauge >= 1 && st.fullAt < 0) {
          st.fullAt = w2.tick;
          w2.sfx('splash', gutter[0], FL - 40);
        }
        // the soak
        const under = p.x + p.w > rain[0] && p.x < rain[1];
        if (under && !st.dry(w2)) {
          st.soak += 1 / 120;
          if (st.soak >= SOAK_AT) {
            const roofs = (w2.flags.shl8roofs ?? []) as { roof: [number, number]; hole?: [number, number] }[];
            const inHole = roofs.some((rf) => rf.hole && c >= rf.hole[0] && c < rf.hole[1] + 1);
            w2.die(inHole ? 'shl-leak' : 'shl-soaked');
          }
        } else st.soak = Math.max(0, st.soak - 0.7 / 120);
      },
      paint: (ctx, r, w2) => {
        if (!st.armed) return;
        // the cloud sits below the HUD band (QA F10), its rain from under it
        cloudArt(ctx, r.x - 14, r.x + r.w + 14, 50, 32, 0.6);
        rainArt(ctx, r.x + 2, r.x + r.w - 2, 78, w2.tick / 120, 1);
        // the shadow on the ground, the tell of where the rain is: a dark wet band with a pale rim, half a tile tall
        box(ctx, r.x - 6, FL - 7, r.w + 12, 7, '#0F1A17');
        box(ctx, r.x - 6, FL - 7, r.w + 12, 1, 'rgba(190,224,240,0.9)');
        box(ctx, r.x - 2, FL - 4, r.w + 4, 2, 'rgba(90,167,201,0.6)');
        // the soak meter over Dad when it is rising
        if (st.soak > 0.1) {
          const p = w2.player;
          box(ctx, p.cx - 8, p.y - 10, 16, 3, '#2A352F');
          box(ctx, p.cx - 8, p.y - 10, Math.round((16 * st.soak) / SOAK_AT), 3, '#5AA7C9');
        }
      },
    }),
  );
  void cloud;
  // the tank, gutter, gauge and roof
  w.add(
    new Paint((ctx, w2) => {
      const x = px(o.tank);
      // the tank on legs
      box(ctx, x + 2, FL - 44, 28, 32, '#4A5A54');
      box(ctx, x + 2, FL - 44, 28, 3, '#5C6F66');
      box(ctx, x + 4, FL - 12, 3, 12, '#3A4842');
      box(ctx, x + 25, FL - 12, 3, 12, '#3A4842');
      // the gutter: a bright funnel on top of the tank, in the city's leaf-yellow, so it reads against the roof (QA F10)
      box(ctx, x - 4, FL - 54, 40, 3, '#C8D86B');
      box(ctx, x - 6, FL - 58, 44, 4, '#E8B04B');
      box(ctx, x + 12, FL - 51, 8, 8, '#C8D86B');
      // the gauge: a glass strip with the level, a white frame so an empty gauge still shows
      box(ctx, x + 5, FL - 41, 8, 26, '#F4F7F2');
      box(ctx, x + 6, FL - 40, 6, 24, st.armed ? '#1D2A26' : '#0E1512');
      box(ctx, x + 7, FL - 40 + 24 - Math.round(22 * st.gauge), 4, Math.round(22 * st.gauge), '#5AA7C9');
      if (o.roof) {
        const r0 = px(o.roof[0]),
          r1 = px(o.roof[1] + 1);
        box(ctx, r0, FL - 60, r1 - r0, 5, '#7A8A84');
        box(ctx, r0, FL - 55, r1 - r0, 2, '#3A4842');
        for (let xx = r0 + 4; xx < r1; xx += 24) box(ctx, xx, FL - 55, 3, 55, '#5C6F66');
        // the roof's lower edge over the shedding tile: a lip that drips
        if (o.runoff !== undefined) box(ctx, px(o.runoff) - 2, FL - 60, 20, 7, '#5C6F66');
        if (o.hole) {
          box(ctx, px(o.hole[0]), FL - 60, px(o.hole[1] + 1) - px(o.hole[0]), 7, '#9FB8C7');
          // rain through the hole
          const rain: [number, number] = [st.cx - 20, st.cx + 20];
          if (rain[0] < px(o.hole[1] + 1) && rain[1] > px(o.hole[0])) rainArt(ctx, px(o.hole[0]) + 2, px(o.hole[1] + 1) - 2, FL - 54, w2.tick / 120, 1);
        }
        if (o.runoff !== undefined) {
          const rain: [number, number] = [st.cx - 20, st.cx + 20];
          if (rain[0] < r1 && rain[1] > r0) rainArt(ctx, px(o.runoff) + 1, px(o.runoff) + 15, FL - 56, w2.tick / 120, 1);
        }
      }
    }, -3),
  );
  // the runoff sheet
  if (o.runoff !== undefined && roofPx) {
    w.add(
      new Rig(px(o.runoff), FL - 56, 16, 56, {
        layer: 4,
        cause: 'shl-runoff',
        inset: 3,
        live: () => st.cx - 20 < roofPx[1] && st.cx + 20 > roofPx[0],
        paint: () => {},
      }),
    );
  }
  // the spout
  if (o.spout !== undefined) {
    w.add(
      new Rig(px(o.spout), FL - 40, 16, 40, {
        layer: 4,
        cause: 'shl-spout',
        inset: 2,
        live: (_r, w2) => st.spouting(w2),
        paint: (ctx, r, w2) => {
          box(ctx, r.x - 6, FL - 44, 20, 4, '#8A6A3E');
          box(ctx, r.x + 12, FL - 46, 4, 8, '#8A6A3E');
          if (st.spouting(w2)) {
            ctx.fillStyle = 'rgba(190,224,240,0.9)';
            ctx.fillRect(r.x + 2, FL - 40, 12, 40);
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            for (let y = FL - 40 + ((w2.tick * 4) % 12); y < FL; y += 12) ctx.fillRect(r.x + 3, y, 10, 2);
          } else {
            // the wet stain: the spout's tell
            box(ctx, r.x - 2, FL - 2, 20, 2, 'rgba(90,167,201,0.5)');
          }
        },
      }),
    );
  }
  // the gate
  if (o.gate !== undefined) {
    const g = w.add(
      new Rig(px(o.gate), FL - 64, 16, 64, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const other = o.also ? (w2.flags[o.also] as TankState | undefined) : undefined;
          const open = st.fullAt >= 0 && (!other || other.fullAt >= 0);
          r.setSolid(!open);
          r.s.open = open;
        },
        paint: (ctx, r) => {
          if (r.s.open) {
            box(ctx, r.x + 2, FL - 110, 12, 50, '#6B4F2E');
            box(ctx, r.x + 6, FL - 64, 4, 64, '#3A4842');
          } else {
            box(ctx, r.x + 2, FL - 64, 12, 64, '#6B4F2E');
            for (let y = FL - 60; y < FL; y += 10) box(ctx, r.x + 2, y, 12, 2, '#4A3620');
          }
        },
      }),
    );
    if (g.solid) g.solid.velX = 0;
  }
  return st;
}

export function room(): LevelDef {
  return {
    id: 'SHL-08',
    city: 'SHL',
    index: 8,
    name: 'Wettest Desert',
    nameEn: 'Sohra’s water',
    tagline: 'The wettest place on earth, and the tank is empty.',
    hint: 'The cloud follows whoever walks under its reach, and its rain soaks you in a moment and a half. The tank fills only while the rain falls into its gutter, so stay out of the cloud’s reach and it goes home over the tank and fills it. When the gauge is full the gate lifts, and the spout by the gate pours across the path for a moment: let it finish before you go through.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      tank(w, { key: 'shl8', tank: 16, reach: [5, 21], gate: 20, spout: 18.5, arm: 2, fill: 2.2 });
      onPass(w, px(2.5), (w2) => tara(w2, L.intro[6], 2.2));
      sign(w, 2, 10.2, 3.2, 'SOHRA', 'shop', null, 'wettest place, dry tank');
      rival(w, 29, 15, -1, taraScript(8));
      collectible(w, 'shl-pumaloi', 24, 11.4);
    },
  };
}

/**
 * act: a bigger cloud, no out-of-reach spot: stand under the tank's roof, whose rain drains into the tank; but not under
 * the hole at its near end, and not at its far edge, which sheds a sheet while rain is on the roof. Two traps of its own
 * (QA F6): the hole (`shl-leak`) and the shedding edge (`shl-runoff`).
 */
export const actRoof: Act = {
  id: 'shl08-roof',
  w: 30,
  advice: 'This cloud reaches the whole stretch: there is no standing out of it. Stand under the tank’s tin roof: the rain on you runs into the tank, and you stay dry, except under the hole at the roof’s near end, and except at its far edge, which sheds a sheet on to the path while rain is on the roof. Stand under the whole middle of it.',
  paint: () => {},
  build: (w, c) => {
    tank(w, { key: 'shl8a', tank: c.x + 18, reach: [c.x + 6, c.x + 29], roof: [c.x + 12, c.x + 19], hole: [c.x + 12, c.x + 13], runoff: c.x + 20, gate: c.x + 23, spout: c.x + 21.5, arm: c.x + 1 });
    sign(w, c.x + 2, 10.4, 3, 'NO SHADE', 'shop', null, 'the cloud reaches all of it');
  },
};

// Cut in fix round 1 (QA F6: one play of their own each, the other being the room's rule): `shl08-pull` (the cloud resting
// over the path, dragged on to the roof), `shl08-bucket` (the bucket gauge over the only out-of-reach spot) and `shl08-two`
// (two tanks, one gate). The runoff edge from `pull` moved into `roof`.

/** the plain door of 08 lives in endings.ts (QA F2: the tap re-asked the room's rule) */
export const ending: Ending | null = null;

export const meta08 = { family: 'tank-fills-when-not-under-rain', betrayals: ['cloud-meter'], ending: 'shl-tap' };
