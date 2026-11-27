// DIS round 5, a Talatal Ghar act for DIS-04 (the floors below ground): at the end of an underground gallery three
// stairwells go down to the floor below. The first glows: daylight off the water in the flooded vault. The other two are
// dark. One of those has fallen in; the other goes through to the far side. Dad's oil lamp shows which: its flame leans
// with the draught, and the draught runs toward the way that goes through. Go down where the flame points.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tara } from '../../levels/endkit';
import { Danger, GROUND, px } from './entities';

/** the stairwells' left columns (tiles from the act's x): lit and flooded, dark and fallen in, dark and through */
export const WELLS = [7, 12, 17];

/** Dad's oil lamp: the flame leans toward the through well, more the nearer he is to it */
export class Lamp extends Entity {
  constructor(readonly to: number) {
    super();
    this.layer = 6;
  }
  lean(w: World) {
    const d = (this.to - w.player.cx) / px(4);
    return Math.max(-1, Math.min(1, d));
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    if (p.cx < this.to - px(16) || p.cx > this.to + px(6)) return;
    const hx = p.cx + 6;
    const hy = p.y + 4;
    ctx.fillStyle = '#7A5A22';
    ctx.fillRect(hx - 2, hy, 4, 3);
    const l = this.lean(w);
    const flick = Math.sin(w.tick * 0.4) * 0.6;
    ctx.fillStyle = '#FFB703';
    ctx.beginPath();
    ctx.moveTo(hx - 1.5, hy);
    ctx.lineTo(hx + l * 6 + flick, hy - 7 + Math.abs(l) * 2);
    ctx.lineTo(hx + 1.5, hy);
    ctx.fill();
  }
}

/** DIS-04 act: the draught in the tunnels (Talatal Ghar, round 5). */
export const talatalBatah: Act = {
  id: 'dis04-batah',
  w: 30,
  advice: 'The gallery ends in a wall, and three stairwells go down to the floor below. The one that glows is lit by daylight off the water in the flooded vault. Of the two dark ones, one has fallen in. Watch the flame of your lamp: it leans with the draught, and the draught runs toward the way that goes through. Go down where it points.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    for (const k of WELLS) g.pit(x + k, x + k + 1);
    g.fill(x + 22, x + 23, 8, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const [a, b, t] = WELLS.map((k) => px(x + k));
    w.add(new Danger({ x: a, y: GROUND + 8, w: px(2), h: 80 }, 'dis-kup'));
    w.add(new Danger({ x: b, y: GROUND + 8, w: px(2), h: 80 }, 'dis-garh'));
    // the through well: down it, and up the far stair beyond the wall
    w.onTick((w2) => {
      const p = w2.player;
      if (w2.state === 'play' && p.cx > t && p.cx < t + px(2) && p.y > GROUND + 4) w2.warp(px(x + 25), GROUND - p.h, 'blink');
    });
    w.add(new Lamp(t + px(1)));
    w.add(
      new (class extends Entity {
        constructor() {
          super();
          this.layer = 1;
        }
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          // daylight off the water glows up out of the first well; the other two are black
          const gl = ctx.createLinearGradient(0, GROUND - 30, 0, GROUND + 20);
          gl.addColorStop(0, 'rgba(160,210,220,0)');
          gl.addColorStop(1, `rgba(160,210,220,${0.55 + 0.1 * Math.sin(w2.tick * 0.05)})`);
          ctx.fillStyle = gl;
          ctx.fillRect(a, GROUND - 30, px(2), 50);
          ctx.fillStyle = '#7FB3C0';
          ctx.fillRect(a, GROUND + 14, px(2), 4);
          ctx.fillStyle = '#0B0806';
          for (const z of [b, t]) ctx.fillRect(z, GROUND, px(2), 40);
          // the fallen-in rubble just below the second well's lip, too deep to see from above
          ctx.fillStyle = '#3A2A1E';
          ctx.fillRect(b + 4, GROUND + 26, px(2) - 8, 6);
        }
      })(),
    );
    onPass(w, px(x + 2), (w2) => tara(w2, 'Pohor, Dad! Tolot! | Light, Dad! Down there!', 2.2));
  },
};
