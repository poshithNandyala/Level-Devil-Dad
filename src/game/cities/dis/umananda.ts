// DIS round 2: a new rule for DIS-05 from the bible's unused ideas: Umananda, the rock island in the Luit, and its
// golden langurs. The river floods over the flats when the ferry's wake comes in; a flood mark on the rock tells you how
// high it comes. Deterministic: starts on Dad's position, then runs on ticks.
import { Entity, type World } from '../../world';
import { GROUND, px, Danger } from './entities';
import type { Act } from '../../levels/acts';

/** The wake: the water over the flats rises to `top` (px), holds, and goes back down. Deadly below its surface. */
export class Wake extends Entity {
  level: number;
  started = -1;
  hazard;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly trig: number,
    readonly top: number,
    readonly rise = 150,
    readonly hold = 300,
    readonly fall = 240,
  ) {
    super();
    this.layer = 5;
    this.level = GROUND + 12;
    const self = this;
    this.hazard = { active: true, cause: 'dis-umananda', hits: (x: number, y: number, w: number, h: number) => x < self.x1 && x + w > self.x0 && y + h - 5 > self.level };
  }
  /** true once the water has gone back down */
  get over() {
    return this.started >= 0 && this.level >= GROUND + 12;
  }
  update(w: World) {
    if (this.started < 0) {
      if (w.player.cx >= this.trig) this.started = w.tick;
      return;
    }
    const t = w.tick - this.started;
    const lo = GROUND + 12;
    if (t < this.rise) this.level = lo - ((lo - this.top) * t) / this.rise;
    else if (t < this.rise + this.hold) this.level = this.top;
    else this.level = Math.min(lo, this.top + ((lo - this.top) * (t - this.rise - this.hold)) / this.fall);
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.level >= GROUND + 12) return;
    ctx.fillStyle = 'rgba(88,104,96,0.85)';
    ctx.fillRect(this.x0, this.level, this.x1 - this.x0, GROUND + 16 - this.level);
    ctx.fillStyle = 'rgba(220,230,220,0.5)';
    for (let x = this.x0; x < this.x1; x += 10) ctx.fillRect(x, this.level, 6, 1);
  }
}

/** DIS-05 act: Umananda. Its lie: the highest place is the safest. */
export const umananda: Act = {
  id: 'dis05-umananda',
  w: 30,
  advice: 'Umananda, the rock island: when the ferry’s wake comes in, the river floods over the flats. The red flood mark on the rock shows how high it comes: wait on the ledge just above it. Not on the top: that is the golden langurs’ rock.',
  cps: [1.5, 11],
  paint: (g, c) => {
    g.fill(c.x + 10, c.x + 12, 13, 13, '=');
    g.fill(c.x + 12, c.x + 14, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    const top = px(13) + 8;
    const wk = w.add(new Wake(px(x + 3), px(x + 27), px(x + 6), top));
    (w.flags.wake ??= []).push(wk);
    // the langur on the top ledge: it sits there and swats whoever climbs up to it
    const lg = w.add(new Danger({ x: px(x + 12), y: px(11) - 20, w: px(3), h: 20 }, 'dis-langur'));
    void lg;
    w.add(
      new (class extends Entity {
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          // the rock behind the ledges, its flood mark, and the langur
          ctx.fillStyle = '#6E6A60';
          ctx.beginPath();
          ctx.moveTo(px(x + 9), GROUND);
          ctx.lineTo(px(x + 11), px(12));
          ctx.lineTo(px(x + 12.5), px(10.5));
          ctx.lineTo(px(x + 14.5), px(11));
          ctx.lineTo(px(x + 16), GROUND);
          ctx.fill();
          ctx.fillStyle = '#C1121F';
          ctx.fillRect(px(x + 9.6), top - 1, px(6), 2);
          const bob = Math.sin(w2.tick * 0.1) * 1.5;
          ctx.fillStyle = '#D9A441';
          ctx.fillRect(px(x + 13) - 5, px(11) - 14 + bob, 10, 12);
          ctx.beginPath();
          ctx.arc(px(x + 13), px(11) - 17 + bob, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#3A2A1A';
          ctx.fillRect(px(x + 13) - 2, px(11) - 18 + bob, 1, 1);
          ctx.fillRect(px(x + 13) + 1, px(11) - 18 + bob, 1, 1);
        }
      })(),
    ).layer = -2;
  },
};
