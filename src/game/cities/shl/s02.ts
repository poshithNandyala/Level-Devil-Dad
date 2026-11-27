// SHL-02 Pine Peak: the view point on Shillong Peak. A cloud bank slides across the gap below the mast, and the
// sun comes through the pines in beams. The cloud is a floor only where a beam lights it, and never at its two
// ends, which are thin whatever the light does: wait for the thick middle to be under the beam, then step.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { cloudArt, cyc, taraScript, FL } from './common';
import { lines as L } from './lines';

export interface Bank {
  /** left edge of the bank in tiles (world) at this tick */
  x: (w: World) => number;
  /** tiles wide; the thick middle is [x + end, x + w - end) */
  w: number;
  end: number;
}

/**
 * A gap with sunbeams over it and cloud banks sliding across. A beam's columns are solid while a bank's thick
 * middle covers them all. State for the tests on w.flags[key]: { banks, beams, lit(i) }.
 */
export interface Sun {
  period: number;
  /** seconds per period the high cloud covers the sun (no beam lights anything) */
  inFor: number;
  phase: number;
  /** the sun's clock in seconds (set by cloudGap when the gap has a `from` trigger; else the stage clock) */
  tsec?: (w: World) => number;
}
const sunCyc = (w: World, sun: Sun) => {
  const t = (sun.tsec ? sun.tsec(w) : w.tick / 120) + sun.phase;
  return ((t % sun.period) + sun.period) % sun.period;
};
export const sunOut = (w: World, sun: Sun) => sunCyc(w, sun) >= sun.inFor;
/** seconds the sun stays out from now (0 if it is in) */
export const sunLeft = (w: World, sun: Sun) => (sunOut(w, sun) ? sun.period - sunCyc(w, sun) : 0);

export function cloudGap(w: World, key: string, gap: [number, number], beams: [number, number][], o: { w: number; end: number; speed: number; span: number; phase: number; n: number; sun?: Sun; from?: number }) {
  const banks: Bank[] = [];
  // the banks' clock: the stage clock, or (with `from`) the moment Dad passes that column, so the beat from a
  // checkpoint there is the same on every try
  const clk = { t0: o.from === undefined ? 0 : -1 };
  if (o.from !== undefined) onPass(w, px(o.from), (w2) => (clk.t0 = w2.tick));
  const tsec = (w2: World) => (clk.t0 < 0 ? 0 : (w2.tick - clk.t0) / 120);
  if (o.sun && o.from !== undefined) o.sun.tsec = tsec;
  for (let k = 0; k < o.n; k++) {
    const off = (o.span / o.n) * k;
    banks.push({ x: (w2) => (((tsec(w2) * o.speed + o.phase + off) % o.span) + o.span) % o.span + gap[0] - o.w - 2, w: o.w, end: o.end });
  }
  const covered = (w2: World, b: [number, number]) => (!o.sun || sunOut(w2, o.sun)) && banks.some((bk) => bk.x(w2) + bk.end <= b[0] && bk.x(w2) + bk.w - bk.end >= b[1] + 1);
  const st = { banks, beams, lit: (w2: World, i: number) => covered(w2, beams[i]), gap, sun: o.sun };
  w.flags[key] = st;
  // the beam floors
  beams.forEach((b) => {
    const r = w.add(
      new Rig(px(b[0]), FL, px(b[1] - b[0] + 1), 16, {
        solid: true,
        layer: 2,
        tick: (rr, w2) => rr.setSolid(covered(w2, b)),
        paint: () => {},
      }),
    );
    if (r.solid) r.solid.velX = 0;
  });
  // the fall: cause by where Dad went through
  w.add(
    new Rig(px(gap[0]), FL + 26, px(gap[1] - gap[0] + 1), 24, {
      layer: 0,
      cause: 'shl-edge',
      inset: 0,
      tick: (r, w2) => {
        // the cause is where Dad went through the floor plane, not where he is when he hits the bottom
        const p = w2.player;
        if (p.onGround) {
          r.s.locked = false;
          return;
        }
        if (r.s.locked || p.vy < 0 || p.y + p.h < FL - 2) return;
        r.s.locked = true;
        const cx = p.cx / 16;
        const bank = banks.find((bk) => cx >= bk.x(w2) && cx < bk.x(w2) + bk.w);
        if (!bank) r.hazard!.cause = 'shl-pit';
        else if (cx < bank.x(w2) + bank.end || cx >= bank.x(w2) + bank.w - bank.end) r.hazard!.cause = 'shl-edge';
        else r.hazard!.cause = 'shl-dum';
      },
      paint: () => {},
    }),
  );
  // the picture: beams from the sky, the banks, the pit's dark
  w.add(
    new Paint((ctx, w2) => {
      box(ctx, px(gap[0]), FL + 10, px(gap[1] - gap[0] + 1), 60, 'rgba(20,34,30,0.85)');
      const out = !o.sun || sunOut(w2, o.sun);
      if (o.sun) {
        // the sun over the gap, and the high cloud that crosses it
        const sx = px((gap[0] + gap[1]) / 2);
        ctx.fillStyle = '#FFF6C8';
        ctx.beginPath();
        ctx.arc(sx, 26, 12, 0, Math.PI * 2);
        ctx.fill();
        const k = (((((o.sun.tsec ? o.sun.tsec(w2) : w2.tick / 120) + o.sun.phase) % o.sun.period) + o.sun.period) % o.sun.period) / o.sun.period;
        const hx = sx - 150 + 300 * k;
        cloudArt(ctx, hx - 44, hx + 44, 10, 30, 0.55);
      }
      for (const b of beams) {
        ctx.fillStyle = out ? 'rgba(255,246,200,0.22)' : 'rgba(255,246,200,0.04)';
        ctx.beginPath();
        ctx.moveTo(px(b[0]) - 14, 0);
        ctx.lineTo(px(b[1] + 1) + 14, 0);
        ctx.lineTo(px(b[1] + 1), FL + 8);
        ctx.lineTo(px(b[0]), FL + 8);
        ctx.closePath();
        ctx.fill();
      }
      for (const bk of banks) {
        const x = px(bk.x(w2));
        cloudArt(ctx, x, x + px(bk.w), FL - 10, 26, 0.3);
        // the thin ends: wispy
        ctx.fillStyle = 'rgba(235,240,242,0.55)';
        ctx.beginPath();
        ctx.ellipse(x + px(bk.end) / 2, FL + 3, px(bk.end) / 2 + 2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + px(bk.w) - px(bk.end) / 2, FL + 3, px(bk.end) / 2 + 2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // the lit floor: a bright line where a beam crosses the thick middle
        for (const b of beams) {
          const l = Math.max(px(b[0]), x + px(bk.end)),
            r = Math.min(px(b[1] + 1), x + px(bk.w - bk.end));
          if (r > l) box(ctx, l, FL - 1, r - l, 3, covered(w2, b) ? '#FFF6C8' : 'rgba(255,246,200,0.35)');
        }
      }
    }, 3),
  );
  return st;
}

export const ROOM2 = { gap: [10, 24] as [number, number], beams: [[13, 15], [19, 21]] as [number, number][], bank: { w: 18, end: 2, speed: 1.875, span: 44, phase: 17, n: 2 } };

export function room(): LevelDef {
  return {
    id: 'SHL-02',
    city: 'SHL',
    index: 2,
    name: 'Pine Peak',
    nameEn: 'Shillong Peak',
    tagline: 'The view point is in the cloud. The cloud is the floor, in places.',
    hint: 'A cloud bank slides across the gap and the sun lights it in two beams. Where a beam lights the thick middle of the bank, the cloud holds you; its two ends are thin whatever the light does, and so is any part no beam reaches. Hop on to the first beam when the middle is under it, wait there until the middle is under the second, jump across, and off to the far bank.',
    par: 20,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').fill(10, 24, 15, 17, '.').rows(),
    build(w: World) {
      door(w);
      cloudGap(w, 'shl2', ROOM2.gap, ROOM2.beams, ROOM2.bank);
      onPass(w, px(5), (w2) => tara(w2, L.intro[0], 2.2));
      // the mast on the far bank
      w.add(
        new Paint((ctx) => {
          box(ctx, px(28) + 7, FL - 110, 2, 110, '#3E4D47');
          box(ctx, px(28) + 2, FL - 96, 12, 1, '#3E4D47');
          box(ctx, px(28) + 4, FL - 80, 8, 1, '#3E4D47');
          box(ctx, px(28) + 6, FL - 112, 4, 4, '#D7262E');
        }, -4),
      );
      sign(w, 4.5, 10.2, 3.6, 'VIEW POINT', 'shop', null, 'Shillong Peak, 1,965 m');
      rival(w, 29, 15, -1, taraScript(2));
      collectible(w, 'shl-pumaloi', 20, 11.4);
    },
  };
}

// Fix round 1 cut both acts of this stage and made its door plain (QA F2, F3, F4, F5, F7): `shl02-sngi` (the lit end
// under the third beam) re-asked the room's "never the thin ends" and had one play whose cause changed with lag;
// `shl02-lyoh` (the high cloud over the sun) is GNR-03's thought ("board a beam just after its cloud has passed"), which
// a shipped city owns; the radar dish re-asked BLR-07's `cctv` (let the sweeping beam pass). The stage is its room.
export const ending: Ending | null = null;

export const meta02 = { family: 'cloud-bank-platform-thins-edge', betrayals: ['cloud-platform'], ending: 'shl-dish' };
