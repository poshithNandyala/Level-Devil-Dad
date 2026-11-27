// DIS round 5, a Talatal Ghar act for DIS-04 (the floors below ground): at the end of an underground gallery three
// stairwells go down to the floor below. The first glows: daylight off the water in the flooded vault. The other two are
// dark. One of those has fallen in; the other goes through to the far side, and the draught runs down into it.
// Fix round 1 (QA F7): the tell reads at phone size and at every well. Dad carries a lantern a tile high; its flame
// stands straight up over a well with no draught (the flooded one, the fallen one) and streams down toward the well
// that draws, the nearer he is the more. Dust and smoke from the gallery drift along the floor and pour down that well
// only. The gallery has a brick vault and a back wall instead of the open sky; Tara's lure is gone (it covered a well).
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { Danger, GROUND, px } from './entities';

/** the stairwells' left columns (tiles from the act's x): lit and flooded, dark and fallen in, dark and through */
// fix round 3: the fallen well moved one column on (12 -> 13), so a hop-mash's second landing (x+13.8 at every lag)
// comes down inside it instead of on the lip before the through well
export const WELLS = [7, 13, 17];

/** Dad's lantern: the flame streams toward the through well (centre `to`, px) when he is within 3 tiles of it */
export class Lamp extends Entity {
  constructor(
    readonly to: number,
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = 6;
  }
  /** -1..1: how hard and which way the flame streams (0 = straight up, no draught here) */
  lean(w: World) {
    const d = (this.to - w.player.cx) / px(3);
    if (Math.abs(d) > 1) return 0;
    return Math.sign(d) * (1 - Math.abs(d) * 0.5);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    if (p.cx < this.x0 || p.cx > this.x1) return;
    // a hurricane lantern held out in front, a tile high
    const hx = p.cx + 9;
    const top = p.y - 6;
    ctx.fillStyle = '#5B3A1E';
    ctx.fillRect(hx - 5, top, 10, 2);
    ctx.fillRect(hx - 5, top + 14, 10, 3);
    ctx.fillStyle = 'rgba(255,240,200,0.35)';
    ctx.fillRect(hx - 4, top + 2, 8, 12);
    const l = this.lean(w);
    const flick = Math.sin(w.tick * 0.4) * 0.6;
    ctx.fillStyle = '#FFB703';
    ctx.beginPath();
    ctx.moveTo(hx - 2.5, top + 13);
    ctx.lineTo(hx + l * 9 + flick, top + 3 + Math.abs(l) * 6);
    ctx.lineTo(hx + 2.5, top + 13);
    ctx.fill();
    // the glow round it
    const g = ctx.createRadialGradient(hx, top + 8, 2, hx, top + 8, 40);
    g.addColorStop(0, 'rgba(255,200,90,0.25)');
    g.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = g;
    ctx.fillRect(hx - 40, top - 32, 80, 80);
  }
}

/** dust and smoke: drift along the gallery floor toward the through well and pour down it */
class Draught extends Entity {
  constructor(
    readonly x0: number,
    readonly to: number,
  ) {
    super();
    this.layer = 3;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (let k = 0; k < 14; k++) {
      const len = this.to - this.x0;
      const s = ((w.tick * 0.8 + k * 37) % (len + 40)) / len; // 0..1 along the floor, then down the well
      const x = this.x0 + Math.min(1, s) * len + (k % 3) * 3;
      const y = s < 1 ? GROUND - 6 - ((k * 7) % 14) + Math.sin(w.tick * 0.05 + k) * 2 : GROUND - 6 + (s - 1) * len * 0.9;
      ctx.fillStyle = k % 2 ? 'rgba(200,190,170,0.75)' : 'rgba(150,140,130,0.6)';
      ctx.fillRect(x, y, 3, 3);
    }
  }
}

/** DIS-04 act: the draught in the tunnels (Talatal Ghar, round 5). */
export const talatalBatah: Act = {
  id: 'dis04-batah',
  w: 30,
  advice: 'The gallery ends in a wall, and three stairwells go down to the floor below. The one that glows is lit by daylight off the water in the flooded vault. Of the two dark ones, one has fallen in. Only the one that goes through draws air: the dust drifts along the floor and pours down it, and over it your lantern’s flame streams down; over the others it stands straight. Go down that one.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    for (const k of WELLS) g.pit(x + k, x + k + 1);
    g.fill(x + 22, x + 23, 8, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const [a, b, t] = WELLS.map((k) => px(x + k));
    // the gallery: a brick vault and back wall over the act, in place of the open sky
    w.add(
      new (class extends Entity {
        constructor() {
          super();
          this.layer = -3;
        }
        draw(ctx: CanvasRenderingContext2D) {
          const x0 = px(x - 1);
          const x1 = px(x + 24);
          ctx.fillStyle = '#2B201A';
          ctx.fillRect(x0, 0, x1 - x0, GROUND);
          ctx.fillStyle = '#3A2A20';
          for (let yy = 4; yy < GROUND; yy += 8) for (let xx = x0 + ((yy / 8) % 2) * 8; xx < x1; xx += 16) ctx.fillRect(xx, yy, 14, 6);
          // the vault's arches
          ctx.strokeStyle = '#1A130F';
          ctx.lineWidth = 3;
          for (let xx = x0; xx + 64 <= x1; xx += 64) {
            ctx.beginPath();
            ctx.arc(xx + 32, GROUND - 70, 32, Math.PI, 0);
            ctx.stroke();
          }
        }
      })(),
    );
    w.add(new Danger({ x: a, y: GROUND + 8, w: px(2), h: 80 }, 'dis-kup'));
    const fallen = new Danger({ x: b, y: GROUND + 8, w: px(2), h: 80 }, 'dis-garh');
    w.add(fallen);
    // walked down into it, or came down into it from a hop (law 9: the line names which)
    let hopping = false;
    w.onTick((w2) => {
      const p = w2.player;
      if (p.onGround) hopping = false;
      else if (p.vy < 0) hopping = true;
      fallen.hazard.cause = hopping ? 'dis-garh-hop' : 'dis-garh';
    });
    // the through well: down it, and up the far stair beyond the wall
    w.onTick((w2) => {
      const p = w2.player;
      if (w2.state === 'play' && p.cx > t && p.cx < t + px(2) && p.y > GROUND + 4) w2.warp(px(x + 25), GROUND - p.h, 'blink');
    });
    w.add(new Lamp(t + px(1), px(x - 1), px(x + 22)));
    w.add(new Draught(px(x + 1), t + px(1)));
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
  },
};
