// Lehar, the swell at the Ross Island jetty: a row of floats rides the swell, each one a beat behind the one before.
// Every float looks level with its neighbour from the side you are standing on, and half the time it is not: the
// swell lifts one and drops the next, and a jump for a float that is a man's height above you is a jump into the
// harbour. Stand on a float and watch the next: go when it is no higher than you can reach. There is an island of
// stones in the middle of the row to get your breath on.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { DT } from '../../constants';
import { Fx, Hurt, Plat, FLOOR, px, TAU, type Ctx } from './kit';

export const PERIOD = 900;
const BASE = FLOOR - 16;
const AMP = 38;

/** the float heights: `top(i, t)` is where float i's top is at tick t */
export class Swell extends Entity {
  floats: Plat[] = [];
  private phase: number[] = [];
  private t0 = 0;
  constructor(
    /** [x px, width px] for each float */
    readonly spec: [number, number][],
    /** the phase step between one float and the next, radians */
    readonly step = 3.0,
    /** the left and right edge of the water, px */
    readonly water: [number, number] = [spec[0][0] - 24, spec[spec.length - 1][0] + spec[spec.length - 1][1] + 24],
    /** floats that are solid ground in every phase: islands, as [x px, width px] (drawn here, solid in the grid) */
    readonly islands: [number, number][] = [],
  ) {
    super();
    this.layer = 1;
    spec.forEach(([x, wd], i) => {
      this.phase.push(i * step);
      this.floats.push(new Plat(x, this.top(i, 0), wd, 8, (ctx, q) => this.drawFloat(ctx, q)));
    });
  }
  top(i: number, t: number) {
    return BASE + AMP * Math.sin((t / PERIOD) * TAU + this.phase[i]);
  }
  install(w: World) {
    w.add(this);
    for (const f of this.floats) w.add(f);
    w.add(new Hurt(this.water[0], FLOOR + 26, this.water[1] - this.water[0], 40, 'svp-lehar', null));
    w.add(new Fx(null, (ctx, w2) => this.drawWater(ctx, w2), 5));
    return this;
  }
  update(w: World) {
    this.floats.forEach((f, i) => {
      const y = Math.round(this.top(i, w.tick - this.t0));
      const dy = y - f.y;
      if (dy) f.solid.moveBy(w, 0, dy);
    });
  }
  private drawFloat(ctx: Ctx, q: Plat) {
    // a float: a plank deck on two drums
    ctx.fillStyle = '#8A5A34';
    ctx.fillRect(q.x, q.y, q.w, 5);
    ctx.fillStyle = '#C79A5E';
    ctx.fillRect(q.x, q.y, q.w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(q.x, q.y + 4, q.w, 1.5);
    ctx.fillStyle = '#2F6F8F';
    ctx.fillRect(q.x + 5, q.y + 5, 12, 8);
    ctx.fillRect(q.x + q.w - 17, q.y + 5, 12, 8);
    ctx.fillStyle = '#E8D9B0';
    for (let x = q.x + 4; x < q.x + q.w - 4; x += 12) ctx.fillRect(x, q.y + 2, 1, 3);
  }
  private drawWater(ctx: Ctx, w: World) {
    const [x0, x1] = this.water;
    const g = ctx.createLinearGradient(0, FLOOR + 6, 0, FLOOR + 50);
    g.addColorStop(0, 'rgba(70,170,190,0.85)');
    g.addColorStop(1, 'rgba(18,90,110,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, FLOOR + 14, x1 - x0, 40);
    // the swell itself: a long wave on the surface, running along the row
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 6) {
      const k = (x - x0) / 90;
      const y = FLOOR + 14 + Math.sin(k * 1.0 - (w.tick / PERIOD) * TAU) * 3;
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}


/** a barge on the same swell: it heaves as it goes, and it only sets off once somebody is on it */
export class Barge extends Entity {
  plat: Plat;
  state: 'wait' | 'ride' | 'docked' = 'wait';
  x: number;
  private still = 0;
  constructor(
    /** where it lies (left edge), and where it ends up, px */
    readonly x0: number,
    readonly x1: number,
    readonly wd = 112,
    readonly speed = 17,
    readonly amp = 22,
    readonly period = 480,
  ) {
    super();
    this.layer = 1;
    this.x = x0;
    this.plat = new Plat(x0, this.top(0), wd, 8, (ctx, q) => this.drawBarge(ctx, q));
  }
  /** the heave grows as the barge leaves the island and dies away as it comes in, so boarding and landing are level */
  top(t: number) {
    const k = Math.sin(Math.PI * Math.max(0, Math.min(1, (this.x - this.x0) / (this.x1 - this.x0))));
    return FLOOR - 2 + this.amp * (0.12 + 0.88 * k) * Math.sin((t / this.period) * TAU);
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    return this;
  }
  update(w: World) {
    const s = this.plat.solid;
    if (this.state === 'wait') {
      if (w.standing(s) && w.player.cx > s.x + 20) {
        if (++this.still >= 40) this.state = 'ride';
      } else this.still = 0;
    } else if (this.state === 'ride') {
      this.x = Math.min(this.x1, this.x + this.speed * DT);
      if (this.x >= this.x1) this.state = 'docked';
    }
    const dx = Math.round(this.x) - s.x;
    const dy = Math.round(this.top(w.tick)) - s.y;
    s.velX = this.state === 'ride' ? this.speed : 0;
    if (dx || dy) s.moveBy(w, dx, dy);
  }
  private drawBarge(ctx: Ctx, q: Plat) {
    ctx.fillStyle = '#5A6770';
    ctx.fillRect(q.x - 4, q.y, q.w + 8, 6);
    ctx.fillStyle = '#7C8A92';
    ctx.fillRect(q.x - 4, q.y, q.w + 8, 2);
    ctx.fillStyle = '#B3392E';
    ctx.fillRect(q.x + 2, q.y + 6, q.w - 4, 4);
    ctx.fillStyle = '#3F4A52';
    for (let x = q.x + 4; x < q.x + q.w - 4; x += 14) ctx.fillRect(x, q.y + 2, 6, 2);
  }
}

/** SVP-06's second act: a row of floats, an island, and a barge across the bay */
export const lehar: Act = {
  id: 'svp06-lehar',
  w: 68,
  advice: 'The jetty is gone and the floats are left, riding the swell, each a beat behind the one before. Stand on one and watch the next: when it is no higher than you can jump, go. The island is steady ground. The barge across the bay heaves on the same swell: step on when it is low, and step off on the far side the same way.',
  cps: [30],
  paint: (g, c) => {
    const x = c.x;
    // shore, floats x+4 .. x+27, island x+28 .. x+33, the bay x+34 .. x+61, shore
    g.pit(x + 4, x + 27);
    g.pit(x + 34, x + 61);
  },
  build: (w, c) => {
    const x = c.x;
    const spec: [number, number][] = [];
    for (let i = 0; i < 4; i++) spec.push([px(x + 5 + i * 6), px(4)]);
    const a = new Swell(spec, 3.0, [px(x + 4), px(x + 28)]).install(w);
    (w.flags.swells ??= []).push(a);
    const bay = px(x + 34);
    const barge = new Barge(bay + 2, px(x + 62) - 114).install(w);
    (w.flags.barges ??= []).push(barge);
    w.add(new Hurt(bay, FLOOR + 26, px(28), 40, 'svp-lehar', null));
    w.add(
      new Fx(null, (ctx, w2) => {
        const g = ctx.createLinearGradient(0, FLOOR + 14, 0, FLOOR + 50);
        g.addColorStop(0, 'rgba(70,170,190,0.85)');
        g.addColorStop(1, 'rgba(18,90,110,0.95)');
        ctx.fillStyle = g;
        ctx.fillRect(bay, FLOOR + 14, px(28), 40);
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let xx = bay; xx <= bay + px(28); xx += 6) {
          const y = FLOOR + 14 + Math.sin(xx / 60 - (w2.tick / 480) * TAU) * 3;
          if (xx === bay) ctx.moveTo(xx, y);
          else ctx.lineTo(xx, y);
        }
        ctx.stroke();
      }, 5),
    );
  },
};
