// Uthao, the godown lifts (overrun): a goods lift in an open shaft goes where the porters send it, slowly, and stops
// at each floor with its gate open for a few seconds. The last stop is the one you want. Stay aboard after it and
// the lift overruns the floor, and the shaft is not built for that. Step off at the last stop, not the first. The
// first stop has a balcony of its own that goes nowhere. One lift goes up to the godown roof, and the second takes
// you down the other side.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, Plat, FLOOR, px, type Ctx } from './kit';

const SPEED = 16;
const STOP1 = 240;
const STOP2 = 240;
const OVER = 28;

export class Lift extends Entity {
  plat: Plat;
  state: 'wait' | 'go' | 'stop' | 'over' | 'hold' | 'back' = 'wait';
  /** which of the stops it is going to or standing at */
  at = 0;
  y: number;
  private n = 0;
  private still = 0;
  private readonly hurt: Hurt;
  constructor(
    readonly x: number,
    /** top surface at the start, and each stop's top surface in order, px */
    readonly y0: number,
    readonly stops: number[],
    readonly wd = 64,
    readonly speed = SPEED,
  ) {
    super();
    this.layer = 1;
    this.y = y0;
    this.plat = new Plat(x, y0, wd, 8, (ctx, q) => this.drawCage(ctx, q));
    this.hurt = new Hurt(x, y0, wd, 34, 'svp-uthao', null);
    this.hurt.on = false;
  }
  get dir() {
    return Math.sign(this.stops[this.stops.length - 1] - this.y0);
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    w.add(this.hurt);
    // the shaft: its rails
    w.add(
      new Fx(null, (ctx) => {
        const top = Math.min(this.y0, ...this.stops) - 60;
        ctx.fillStyle = '#3F4A52';
        ctx.fillRect(this.x - 4, top, 4, FLOOR + 14 - top);
        ctx.fillRect(this.x + this.wd, top, 4, FLOOR + 14 - top);
        ctx.fillRect(this.x - 4, top, this.wd + 8, 4);
      }, 0),
    );
    return this;
  }
  update(w: World) {
    const s = this.plat.solid;
    const last = this.stops.length - 1;
    const goal = this.stops[this.at];
    if (this.state === 'wait') {
      if (w.standing(s) && Math.abs(w.player.cx - (this.x + this.wd / 2)) < this.wd / 2 - 6) {
        if (++this.still >= 40) {
          this.state = 'go';
          this.at = 0;
        }
      } else this.still = 0;
    } else if (this.state === 'go') {
      const d = this.stops[this.at] - this.y;
      const step = this.speed * DT;
      if (Math.abs(d) <= step) {
        this.y = this.stops[this.at];
        this.state = 'stop';
        this.n = 0;
      } else this.y += Math.sign(d) * step;
    } else if (this.state === 'stop') {
      if (++this.n >= (this.at === last ? STOP2 : STOP1)) {
        if (this.at === last) {
          this.state = 'over';
          this.n = 0;
        } else {
          this.at++;
          this.state = 'go';
        }
      }
    } else if (this.state === 'over') {
      this.y += this.dir * 30 * DT;
      if (Math.abs(this.y - this.stops[last]) >= OVER) {
        this.state = 'hold';
        this.n = 0;
      }
    } else if (this.state === 'hold') {
      if (++this.n >= 60) this.state = 'back';
    } else {
      const d = this.y0 - this.y;
      const step = 90 * DT;
      if (Math.abs(d) <= step) {
        this.y = this.y0;
        this.state = 'wait';
        this.still = 0;
      } else this.y += Math.sign(d) * step;
    }
    void goal;
    const dy = Math.round(this.y) - s.y;
    s.velX = 0;
    if (dy) s.moveBy(w, 0, dy);
    // the overrun: the shaft ends, and so does anyone still standing on the lift
    const over = this.state === 'over' || this.state === 'hold';
    this.hurt.on = over;
    this.hurt.y = this.dir < 0 ? this.plat.y - 34 : this.plat.y - 30;
  }
  private drawCage(ctx: Ctx, q: Plat) {
    ctx.fillStyle = '#B07A3A';
    ctx.fillRect(q.x, q.y, q.w, 8);
    ctx.fillStyle = '#D9A55A';
    ctx.fillRect(q.x, q.y, q.w, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(q.x, q.y + 6, q.w, 2);
    // the gate frame and the cable
    ctx.strokeStyle = '#7C8A92';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(q.x + 2, q.y);
    ctx.lineTo(q.x + 2, q.y - 34);
    ctx.moveTo(q.x + q.w - 2, q.y);
    ctx.lineTo(q.x + q.w - 2, q.y - 34);
    ctx.moveTo(q.x + q.w / 2, q.y - 34);
    ctx.lineTo(q.x + q.w / 2, Math.min(q.y - 34, 0) - 400);
    ctx.stroke();
    ctx.fillStyle = this.state === 'stop' ? '#3DDC6B' : this.state === 'over' || this.state === 'hold' ? '#FF4A3A' : '#F6E27F';
    ctx.fillRect(q.x + q.w / 2 - 3, q.y - 38, 6, 4);
  }
}

/** a moving walkway for the porters: it carries whoever stands on it, and what it carries stays with a jump from it */
export class Walkway extends Entity {
  plat: Plat;
  private rode = -99;
  private boosted = -999;
  constructor(
    x: number,
    y: number,
    wd: number,
    readonly speed: number,
  ) {
    super();
    this.layer = 1;
    this.plat = new Plat(x, y, wd, 8, (ctx, q, w2) => {
      ctx.fillStyle = '#3F4A52';
      ctx.fillRect(q.x, q.y, q.w, 8);
      ctx.fillStyle = '#F6E27F';
      const off = (w2.tick * 1.3) % 16;
      for (let xx = q.x + off; xx < q.x + q.w - 10; xx += 16) {
        ctx.beginPath();
        ctx.moveTo(xx, q.y + 1);
        ctx.lineTo(xx + 8, q.y + 4);
        ctx.lineTo(xx, q.y + 7);
        ctx.fill();
      }
      ctx.fillStyle = '#7C8A92';
      ctx.fillRect(q.x, q.y, q.w, 2);
    });
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    return this;
  }
  update(w: World) {
    const p = w.player;
    if (w.standing(this.plat.solid) && w.state === 'play') {
      p.pushVx = this.speed;
      this.rode = w.tick;
    } else if (!p.onGround && p.jumpTick === w.tick - 1 && w.tick - this.rode <= 14 && this.boosted !== p.jumpTick) {
      // a jump from the walkway keeps its speed
      this.boosted = p.jumpTick;
      p.carryVx = this.speed;
    }
  }
}

/** SVP-07's fifth act: up two lifts to the godown roof, over a gap on a moving walkway, and down two more */
export const uthao: Act = {
  id: 'svp07-uthao',
  w: 58,
  advice: 'The godown lifts, in open shafts: two go up to the roof in turn and two take you down the far side, each with a ledge between. Each stops at its floor for a few seconds with the gate open. Step off then: if you stay aboard the lift overruns the shaft. On the roof a moving walkway carries you to the edge of a gap too wide to jump from standing: jump from the walkway, and what it carries stays with you in the air.',
  cps: [13, 22, 47],
  paint: (g, c) => {
    const x = c.x;
    // up: lift A (pit under it) to the first ledge, lift B to the roof
    g.pit(x + 7, x + 10);
    g.fill(x + 11, x + 16, 11, 14, '#');
    g.fill(x + 21, x + 26, 7, 14, '#');
    // over the roof: walkway on x+27..31, gap, then lift C (pit under it) down to the second ledge, lift D down to the road
    g.pit(x + 32, x + 44);
    g.fill(x + 45, x + 49, 11, 14, '#');
    g.pit(x + 50, x + 53);
  },
  build: (w, c) => {
    const x = c.x;
    const a = new Lift(px(x + 7), FLOOR, [FLOOR - 64]).install(w);
    const b = new Lift(px(x + 17), FLOOR - 64, [FLOOR - 128]).install(w);
    const d = new Lift(px(x + 38), FLOOR - 128, [FLOOR - 64], px(7)).install(w);
    const e = new Lift(px(x + 50), FLOOR - 64, [FLOOR]).install(w);
    w.add(new Hurt(px(x + 7), FLOOR + 16, px(4), 40, 'svp-uthao', null));
    w.add(new Hurt(px(x + 32), FLOOR + 16, px(13), 40, 'svp-uthao', null));
    w.add(new Hurt(px(x + 50), FLOOR + 16, px(4), 40, 'svp-uthao', null));
    (w.flags.lifts ??= []).push(a, b, d, e);
    (w.flags.belts ??= []).push(new Walkway(px(x + 27), FLOOR - 128, px(5), 320).install(w));
  },
};
