// SVP-01 Namaste SVP: the welcome tour, with a bite. Aberdeen's lanes are steep, and when a cloud sits over one the
// rain makes a sheet of water that runs down it and pushes you back into the drain at its foot. Shelter under the
// awning. The cloud has two lobes with a lull between them, and the lull is not the end: wait for the sun.
import { Entity, type World } from '../../world';
import { onPass } from '../../levels/trolls';
import { FLOOR } from '../../levels/endkit';
import type { Grid } from '../../levels/grid';
import { Fx, Hurt, awning, px, TAU, type Ctx } from './kit';

const COME = 70,
  LOBE = 620,
  GAP = 108,
  OUT = 90;
export const LANE_TOTAL = COME + LOBE + GAP + LOBE + OUT;

/** the lane, its cloud, and the sheet of water: it runs for as long as a lobe of the cloud is over it */
export class Lane extends Entity {
  t = -1;
  lastPush = -999;
  readonly x0 = px(41);
  readonly x1 = px(67);
  constructor() {
    super();
    this.layer = 6;
  }
  /** the water is running now */
  get flowing() {
    const t = this.t;
    return t >= COME && ((t < COME + LOBE) || (t >= COME + LOBE + GAP && t < COME + LOBE + GAP + LOBE));
  }
  get done() {
    return this.t >= LANE_TOTAL - OUT;
  }
  start() {
    if (this.t < 0) this.t = 0;
  }
  update(w: World) {
    if (this.t < 0) return;
    this.t++;
    const p = w.player;
    if (this.flowing && w.state === 'play' && p.cx > this.x0 && p.cx < this.x1 && p.y + p.h > FLOOR - 30) {
      p.pushVx = -240;
      this.lastPush = w.tick;
    }
  }
  draw(ctx: Ctx, w: World) {
    const a = px(43),
      b = this.x1;
    // the awning that is the shelter, and the shop behind it
    ctx.fillStyle = 'rgba(58,30,18,0.3)';
    ctx.fillRect(px(33), FLOOR - 36, px(5), 36);
    awning(ctx, px(33), px(38), FLOOR - 44, '#B3392E', '#F4ECD6', -6);
    // the lane: a faint slope drawn on the ground, and the grating at its foot
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.moveTo(a, FLOOR);
    ctx.lineTo(b, FLOOR);
    ctx.lineTo(b, FLOOR - 2);
    ctx.lineTo(a, FLOOR - 0.5);
    ctx.fill();
    if (this.t < 0) return;
    const t = this.t;
    const cloudA = t < COME ? t / COME : t < COME + LOBE ? 1 : t < COME + LOBE + GAP ? 0.18 : t < COME + LOBE + GAP + LOBE ? 1 : Math.max(0, 1 - (t - (COME + LOBE + GAP + LOBE)) / OUT);
    const cx = a + (b - a) * 0.5 + (t < COME ? (1 - t / COME) * -160 : 0);
    ctx.fillStyle = `rgba(52,64,84,${(0.85 * cloudA).toFixed(2)})`;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(cx + i * 34, 52 + Math.abs(i) * 5, 40, 20, 0, 0, TAU);
      ctx.fill();
    }
    if (this.flowing) {
      ctx.strokeStyle = 'rgba(210,235,248,0.7)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (let x = a; x < b; x += 7) {
        const k = (x * 31) % 17;
        const y = 70 + ((w.tick * 3.2 + k * 9) % (FLOOR - 76));
        ctx.moveTo(x + (k % 4), y);
        ctx.lineTo(x + (k % 4) - 3, y + 9);
      }
      ctx.stroke();
      // the sheet on the road, running left
      ctx.fillStyle = 'rgba(140,200,215,0.55)';
      ctx.fillRect(a, FLOOR - 2.5, b - a, 3);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.9;
      for (let x = b - ((w.tick * 2.6) % 18); x > a + 8; x -= 18) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR - 1.5);
        ctx.lineTo(x - 8, FLOOR - 1.5);
        ctx.stroke();
      }
    }
  }
}

/** the course, with the lane painted in: a drain two tiles wide at the foot of it */
export const paint = (g: Grid) => {
  g.pit(41, 42);
};

export function extra(w: World) {
  const lane = new Lane();
  w.add(lane);
  w.flags.lane = lane;
  // the grating over the drain, and the hurt box that says why you fell
  const pit = new Hurt(px(41), FLOOR + 8, px(2), 40, 'fell', null);
  w.add(pit);
  w.onTick((w2) => {
    pit.cause = w2.tick - lane.lastPush < 150 ? 'svp-baha' : 'fell';
  });
  w.add(
    new Fx(null, (ctx) => {
      ctx.fillStyle = '#2B1E16';
      ctx.fillRect(px(41), FLOOR + 6, px(2), 40);
      ctx.fillStyle = '#5A6770';
      for (let x = px(41) + 2; x < px(43) - 2; x += 5) ctx.fillRect(x, FLOOR + 8, 2.5, 24);
    }, 4),
  );
  onPass(w, px(36), () => lane.start());
}
