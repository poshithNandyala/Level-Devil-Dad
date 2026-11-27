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
}
export const sunOut = (w: World, sun: Sun) => cyc(w, sun.period, sun.phase) >= sun.inFor;
/** seconds the sun stays out from now (0 if it is in) */
export const sunLeft = (w: World, sun: Sun) => (sunOut(w, sun) ? sun.period - cyc(w, sun.period, sun.phase) : 0);

export function cloudGap(w: World, key: string, gap: [number, number], beams: [number, number][], o: { w: number; end: number; speed: number; span: number; phase: number; n: number; sun?: Sun }) {
  const banks: Bank[] = [];
  for (let k = 0; k < o.n; k++) {
    const off = (o.span / o.n) * k;
    banks.push({ x: (w2) => ((((w2.tick / 120) * o.speed + o.phase + off) % o.span) + o.span) % o.span + gap[0] - o.w - 2, w: o.w, end: o.end });
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
        const k = cyc(w2, o.sun.period, o.sun.phase) / o.sun.period;
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

/** act: a longer gap, three beams, a shorter bank: the third beam is lit while the bank's END is under it; wait for the middle */
export const act: Act = {
  id: 'shl02-sngi',
  w: 32,
  advice: 'A longer gap, three beams, and a thinner bank. The third beam lights up while only the end of the bank is under it: lit or not, an end is thin. Stay on the second beam until the thick middle has reached the third, then jump.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 24, 15, 17, '.');
  },
  build: (w, c) => {
    cloudGap(w, 'shl2a', [c.x + 6, c.x + 24], [[c.x + 9, c.x + 11], [c.x + 14, c.x + 16], [c.x + 19, c.x + 21]], { w: 14, end: 2, speed: 1.875, span: 40, phase: 10, n: 2 });
    sign(w, c.x + 2, 10.4, 3, 'SUN', 'shop', null, 'through the pines');
  },
};

/** act 2: the same floor, but a high cloud crosses the sun: while it does, no beam lights anything and nothing holds */
export const actSun: Act = {
  id: 'shl02-lyoh',
  w: 30,
  advice: 'Back at the view point, and a high cloud crosses the sun every few seconds. While the sun is covered, no beam lights anything and nothing holds, whatever the bank below is doing. Cross beam to beam only with the sun out and time in hand; wait on the bank while it is in.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 20, 15, 17, '.');
  },
  build: (w, c) => {
    cloudGap(w, 'shl2b', [c.x + 6, c.x + 20], [[c.x + 9, c.x + 11], [c.x + 15, c.x + 17]], { w: 20, end: 2, speed: 2.5, span: 44, phase: 14, n: 2, sun: { period: 12, inFor: 2.0, phase: 3 } });
    sign(w, c.x + 2, 10.4, 3, 'SUN', 'shop', null, 'behind a high cloud');
  },
};

/** ending: the radar dish by the door turns, and its beam sweeps the last stretch of path every few seconds */
export const ending: Ending = {
  space: 14,
  advice: 'The radar dish beside the door turns, and when it faces the path its beam sweeps the last four tiles. Wait just outside them until a sweep has gone by, then walk in.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'dish';
    const P = 4.0,
      ON = 0.8;
    const e = { x0: px(D - 5), x1: px(D - 1), P, ON, on: (w2: World) => cyc(w2, P) < ON };
    w.flags.shl2e = e;
    w.add(
      new Rig(e.x0, 0, e.x1 - e.x0, FL, {
        layer: 3,
        cause: 'shl-dish',
        inset: 3,
        live: (_r, w2) => e.on(w2),
        paint: (ctx, r, w2) => {
          const t = cyc(w2, P);
          const ang = (t / P) * Math.PI * 2;
          // the pole and the dish
          box(ctx, px(D) + 20, FL - 70, 3, 70, '#3E4D47');
          ctx.save();
          ctx.translate(px(D) + 21, FL - 74);
          ctx.rotate(ang);
          box(ctx, -9, -4, 18, 8, '#C9D3D0');
          ctx.restore();
          if (e.on(w2)) {
            ctx.fillStyle = 'rgba(255,240,180,0.35)';
            ctx.beginPath();
            ctx.moveTo(px(D) + 21, FL - 74);
            ctx.lineTo(r.x, FL);
            ctx.lineTo(r.x + r.w, FL);
            ctx.closePath();
            ctx.fill();
          } else if (t > P - 0.6) {
            ctx.fillStyle = 'rgba(255,240,180,0.12)';
            ctx.beginPath();
            ctx.moveTo(px(D) + 21, FL - 74);
            ctx.lineTo(r.x + 20, FL);
            ctx.lineTo(r.x + r.w, FL);
            ctx.closePath();
            ctx.fill();
          }
        },
      }),
    );
  },
};

export const meta02 = { family: 'cloud-bank-platform-thins-edge', betrayals: ['cloud-platform'], ending: 'shl-dish' };
