// Bengaluru's door endings.
import type { World } from '../../world';
import { FLOOR, hits, npc, Paint, tara, text, tt } from '../../levels/endkit';
import { Thing } from '../../entities/traps';
import { secs } from '../../constants';
import { px } from '../../levels/kit';
import { rr } from '../../../render/art/common';
import type { Ending } from '../../levels/endkit';

export type BlrEndingKind = 'revolve' | 'pull' | 'wrap' | 'cctv';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<BlrEndingKind, true> {}
}

export const endings: Record<BlrEndingKind, Ending> = {
  // ================================================================ Bengaluru
  /** A tech-park revolving door: it only lets you in when the gap comes round. */
  revolve: {
    advice: 'The revolving door lets you in only through its gap: stand at the glass, wait for the gap, and step in at once.',
    build(w, d) {
      const R = 0.82,
        GAP = 0.22;
      const open = (w2: World) => tt(w2) % R < GAP;
      w.add(
        new Paint((ctx, w2) => {
          const a = ((tt(w2) % R) / R) * Math.PI;
          ctx.fillStyle = 'rgba(160,200,230,0.35)';
          ctx.fillRect(d.x - 4, d.y - 2, 24, 3);
          for (let i = 0; i < 2; i++) {
            const k = Math.cos(a + i * (Math.PI / 2));
            ctx.fillStyle = `rgba(190,225,255,${0.4 + Math.abs(k) * 0.3})`;
            ctx.fillRect(d.x + 8 + k * 11 - 1, d.y, 2.4, 32);
          }
        }, 2),
      );
      w.flags.twist = 'closed';
      d.onReach = (w2) => (open(w2) ? w2.win('door') : undefined);
      w.onTick((w2) => {
        const o = open(w2);
        const p = w2.player;
        if (!o && p.x + p.w > d.x + 2 && p.x < d.x + 14 && p.y + p.h > d.y + 6) {
          p.x = d.x + 2 - p.w - 1;
          if (p.vx > 0) p.vx = 0;
        }
        w2.flags.twist = o ? 'gap' : 'closed';
        w2.flags.gapIn = o ? 0 : R - (tt(w2) % R);
      });
    },
  },

  /** The glass door says PULL. Walking into it is pushing. Stand at it and pull: walk away. */
  pull: {
    advice: 'The glass door says PULL, and walking into it is pushing: stand against it and pull, press away from it, then walk in before it swings shut.',
    build(w, d) {
      const gx = d.x + 1;
      const pane = w.add(new Thing('slab', gx, d.y, { w: 6, h: 32, layer: 2 }));
      pane.visible = false;
      let open = 0,
        told = -999,
        t0 = 0;
      w.add(
        new Paint((ctx, w2) => {
          const k = open > 0 ? Math.min(1, (w2.tick - t0) / 10) : 0;
          ctx.save();
          ctx.translate(gx, d.y);
          ctx.transform(1 - k * 0.75, 0, 0, 1, -k * 10, 0);
          ctx.fillStyle = 'rgba(180,220,245,0.45)';
          ctx.fillRect(0, 0, 14, 32);
          ctx.strokeStyle = '#90A4AE';
          ctx.lineWidth = 1;
          ctx.strokeRect(0.5, 0.5, 13, 31);
          ctx.fillStyle = '#ECEFF1';
          ctx.fillRect(2, 15, 3, 1.5);
          ctx.restore();
          // the sticker
          ctx.fillStyle = '#C62828';
          rr(ctx, d.x - 6, d.y - 19, 28, 13, 2);
          ctx.fill();
          text(ctx, 'PULL', d.x + 8, d.y - 14.5, 7, '#FFFFFF', '');
          text(ctx, 'ELEYIRI', d.x + 8, d.y - 9, 3.5, '#FFCDD2', '');
        }, 2),
      );
      w.flags.twist = 'shut';
      w.onTick((w2) => {
        const p = w2.player;
        const at = p.x + p.w >= gx - 1 && p.x + p.w <= gx + 1 && p.y + p.h > d.y + 6;
        if (open > 0) {
          open--;
          if (open === 0) {
            pane.show();
            if (hits(p, gx, d.y, 6, 32)) p.x = gx - p.w - 1;
            w2.sfx('slide', gx, d.y);
          }
        } else if (at && p.inputDir < 0 && p.onGround) {
          open = secs(1.8);
          t0 = w2.tick;
          pane.hide();
          p.vx = -70;
          w2.sfx('creak', gx, d.y);
          npc(w2, 'Sari! | Right!', d.x + 8, d.y - 28, 0.9);
        } else if (at && p.inputDir > 0 && w2.tick - told > 160) {
          told = w2.tick;
          w2.sfx('thud', gx, d.y + 16);
          npc(w2, 'Guru, adu PULL! Push maadbedi! | Boss, it says PULL! Don’t push!', d.x + 8, d.y - 28, 1.4);
        }
        w2.flags.twist = open > 0 ? 'open' : 'shut';
      });
    },
  },

  /** A garden-maze wall right in front of the door, up to the sky. The way forward is back:
   *  walk out the way you came and you come out on the far side of the wall. */
  wrap: {
    space: 13,
    advice: 'The hedge wall can’t be climbed. Walk back the way you came, past the arrow sign, and you come out on the far side of it.',
    paint: (g, D) => void g.fill(D - 2, D - 2, 0, 14, '#'),
    build(w, d) {
      const edge = d.x - px(12.5);
      const wallX = d.x - px(2);
      w.add(
        new Paint((ctx, w2) => {
          // hedge leaves over the wall
          for (let y = 0; y < FLOOR; y += 6) {
            ctx.fillStyle = (y / 6) % 2 ? '#2E7D32' : '#388E3C';
            ctx.fillRect(wallX - 2, y, 20, 6);
          }
          ctx.fillStyle = '#1B5E20';
          for (let y = 3; y < FLOOR; y += 12) ctx.fillRect(wallX + ((y * 7) % 12), y, 3, 3);
          // the arrow sign where the trick is
          ctx.fillStyle = '#6D4C41';
          ctx.fillRect(edge + 7, FLOOR - 22, 2, 22);
          ctx.fillStyle = '#FFF8E1';
          rr(ctx, edge - 6, FLOOR - 30, 28, 10, 2);
          ctx.fill();
          const bob = Math.sin(w2.tick * 0.1) * 1;
          text(ctx, '← ↻ →', edge + 8 + bob, FLOOR - 25, 6, '#4527A0', '');
        }, 1),
      );
      w.flags.twist = 'wall';
      let prev = 0,
        said = false;
      w.onTick((w2) => {
        const p = w2.player;
        if (!said && p.x + p.w >= wallX - 2) {
          said = true;
          tara(w2, 'Garden maze, guru! Sometimes forward is backward. | Garden maze! Sometimes forward is backward.', 2.8);
        }
        if (prev >= edge && p.x < edge && p.vx < 0 && w2.state === 'play') {
          w2.warp(wallX + 20, p.y, 'blink');
          w2.flags.twist = 'through';
        }
        prev = p.x;
      });
    },
  },

  /** A tech-park camera sweeps the lawn. If its beam finds you, you're done: wait behind a planter
   *  while it sweeps past, then follow behind it. */
  cctv: {
    space: 13,
    advice: 'Never let the camera’s red beam touch you: hide inside a bush while it sweeps towards you, and run on once it has gone past behind you.',
    build(w, d) {
      const cam = { x: d.x + 26, y: FLOOR - 120 };
      const near = d.x - px(1),
        far = d.x - px(12.5);
      const P = 3.4;
      const bushes = [d.x - px(9), d.x - px(5)].map((x) => ({ x, y: FLOOR - 36, w: 28, h: 36 }));
      const spot = (w2: World) => {
        const k = (tt(w2) % P) / P;
        const tri = k < 0.5 ? k * 2 : 2 - k * 2;
        return near + (far - near) * tri;
      };
      const movingLeft = (w2: World) => (tt(w2) % P) / P < 0.5;
      const ang = (x: number, y: number) => Math.atan2(y - cam.y, x - cam.x);
      const blocked = (x: number, y: number) =>
        bushes.some((r) => {
          // does the ray from the camera to (x, y) pass through the bush?
          for (let i = 1; i <= 32; i++) {
            const k = i / 32;
            const sx = cam.x + (x - cam.x) * k,
              sy = cam.y + (y - cam.y) * k;
            if (sx > r.x && sx < r.x + r.w && sy > r.y && sy < r.y + r.h) return true;
          }
          return false;
        });
      const seen = (w2: World) => {
        const g = spot(w2);
        const a0 = ang(g + 16, FLOOR),
          a1 = ang(g - 16, FLOOR);
        const p = w2.player;
        for (const [x, y] of [
          [p.cx, p.y + 2],
          [p.cx, p.y + p.h - 2],
        ]) {
          const a = ang(x, y);
          if (a >= Math.min(a0, a1) && a <= Math.max(a0, a1) && !blocked(x, y)) return true;
        }
        return false;
      };
      w.add(
        new Paint((ctx, w2) => {
          // the camera on its tall pole, and its beam
          ctx.fillStyle = '#546E7A';
          ctx.fillRect(cam.x - 1, cam.y, 3, FLOOR - cam.y);
          ctx.fillStyle = '#ECEFF1';
          rr(ctx, cam.x - 8, cam.y - 4, 11, 7, 1.5);
          ctx.fill();
          ctx.fillStyle = w2.tick % 40 < 20 ? '#F44336' : '#7f1d1d';
          ctx.fillRect(cam.x - 7, cam.y - 3, 2, 2);
          const g = spot(w2);
          const beam = ctx.createLinearGradient(cam.x, cam.y, g, FLOOR);
          beam.addColorStop(0, 'rgba(255,60,60,0.55)');
          beam.addColorStop(1, 'rgba(255,60,60,0.3)');
          ctx.fillStyle = beam;
          ctx.beginPath();
          ctx.moveTo(cam.x - 7, cam.y);
          ctx.lineTo(g - 16, FLOOR);
          ctx.lineTo(g + 16, FLOOR);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,120,120,0.85)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = 'rgba(255,90,90,0.75)';
          ctx.beginPath();
          ctx.ellipse(g, FLOOR - 0.5, 16, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();
          text(ctx, 'REC ●', cam.x - 2, cam.y - 10, 4.5, '#FF8A80');
        }, -1),
      );
      // the bushes, drawn over Dad so he really is hidden in them
      w.add(
        new Paint((ctx, w2) => {
          for (const [i, r] of bushes.entries()) {
            const sway = Math.sin(w2.tick * 0.05 + i) * 1;
            ctx.fillStyle = '#2E7D32';
            ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2 + sway, r.y + r.h * 0.55, r.w / 2 + 2, r.h * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#43A047';
            ctx.beginPath();
            ctx.ellipse(r.x + r.w / 2 - 4 + sway, r.y + r.h * 0.35, r.w / 3, r.h * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#795548';
            ctx.fillRect(r.x + 4, FLOOR - 4, r.w - 8, 4);
          }
        }, 4),
      );
      let said = false;
      w.flags.twist = 'sweep';
      w.flags.cam = [cam.x, cam.y];
      w.flags.cover = bushes.map((r) => r.x);
      w.onTick((w2) => {
        const p = w2.player;
        w2.flags.beamX = spot(w2);
        w2.flags.beamLeft = movingLeft(w2);
        if (!said && p.x > d.x - px(13)) {
          said = true;
          tara(w2, 'CCTV, Dad! Hide in the bushes when the red beam comes! | Hide in the bushes from the red beam!', 2.8);
        }
        if (w2.state === 'play' && p.x > d.x - px(13) && seen(w2)) {
          w2.sfx('siren', cam.x, cam.y);
          npc(w2, 'Caught on camera! Security! | Caught on camera!', cam.x - 10, cam.y - 18, 1.4);
          w2.die('spotted');
        }
      });
    },
  },
};
