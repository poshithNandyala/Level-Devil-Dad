// CCU-04 (and the finale): College Street's book stacks, the customer who points, and the drain's muck.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { TILE } from '../../constants';
import { person } from '../../levels/endkit';
import { FLOOR } from './entities';

const SPINE = ['#8E2C24', '#1D5C96', '#2E7D32', '#C9A227', '#5D4037', '#6A1B9A', '#B5651D', '#37474F'];

/**
 * A stack of book bundles standing on `base` (px): n bundles, each one tile tall. The customer points at one
 * of its books (it glows), and the seller pulls it out: the stack drops by one, and whatever stands on it
 * drops with it. He pulls when the customer has waited `delay` s, or the moment Dad lands on the stack. A
 * stack with nothing left is gone; `back` s later (if set) he puts the books back.
 */
export class Stack extends Entity {
  n: number;
  solid: Solid;
  pointAt = -1;
  pointH = 0;
  delay = 1.2;
  pulls = 0;
  private dropTo = -1;
  private goneT = -1;
  constructor(
    readonly x: number,
    readonly wd: number,
    readonly n0: number,
    readonly base = FLOOR + TILE,
    readonly back = 0,
  ) {
    super();
    this.layer = 1;
    this.n = n0;
    this.solid = new Solid(x, base - n0 * TILE, wd, n0 * TILE + 40);
    this.solid.velX = 0;
  }
  top() {
    return this.base - this.n * TILE;
  }
  get pointed() {
    return this.pointAt >= 0;
  }
  /** seconds until the pull, if pointed */
  left(w: World) {
    return this.pointed ? this.delay - (w.tick - this.pointAt) / 120 : Infinity;
  }
  point(w: World, h = 1, delay = 1.2) {
    if (this.n <= 0 || this.pointed) return;
    this.pointAt = w.tick;
    this.pointH = Math.min(h, this.n);
    this.delay = delay;
  }
  pull(w: World) {
    this.pointAt = -1;
    this.n = Math.max(0, this.n - 1);
    this.pulls++;
    this.dropTo = this.top();
    w.sfx('slide', this.x + this.wd / 2, this.top());
    if (this.n === 0) {
      const p = w.player;
      if (p.isRiding(this.solid)) {
        // out from under him: no coyote hop off a book that isn't there
        w.flags.yanked = 1;
        p.onGround = false;
        p.coyoteT = 0;
        p.bufferT = 0;
        p.stun = 30;
        p.vy = 160;
        w.after(0.1, () => w.die('ccu-boi'));
      }
      this.solid.collidable = false;
      this.goneT = w.tick;
    }
  }
  update(w: World) {
    if (this.pointed) {
      const landed = w.player.onGround && w.player.isRiding(this.solid);
      if (landed || w.tick - this.pointAt >= Math.round(this.delay * 120)) this.pull(w);
    }
    if (this.dropTo >= 0 && this.solid.collidable) {
      const dy = Math.min(4, this.dropTo - this.solid.y);
      if (dy > 0) this.solid.moveBy(w, 0, dy);
      else this.dropTo = -1;
    }
    if (this.n === 0 && this.back > 0 && this.goneT >= 0 && w.tick - this.goneT >= this.back * 120) {
      this.n = this.n0;
      this.solid.place(this.x, this.top());
      this.solid.collidable = true;
      this.goneT = -1;
      this.dropTo = -1;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const sy = this.solid.collidable ? this.solid.y : this.base;
    for (let i = 0; i < this.n; i++) {
      const y = sy + i * TILE;
      const k = (Math.round(this.x / 16) * 3 + i * 5 + this.pulls * 7) % SPINE.length;
      // a bundle of second-hand books lying flat, tied with string
      ctx.fillStyle = SPINE[k];
      ctx.fillRect(this.x + 1, y + 1, this.wd - 2, 6);
      ctx.fillStyle = SPINE[(k + 3) % SPINE.length];
      ctx.fillRect(this.x, y + 7, this.wd, 5);
      ctx.fillStyle = SPINE[(k + 5) % SPINE.length];
      ctx.fillRect(this.x + 2, y + 12, this.wd - 3, 4);
      ctx.fillStyle = 'rgba(255,248,225,0.55)';
      ctx.fillRect(this.x + 1, y + 1, this.wd - 2, 1);
      ctx.fillRect(this.x, y + 7, this.wd, 1);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(this.x + this.wd / 2 - 0.5, y, 1, TILE);
    }
    if (this.pointed && this.n > 0) {
      const i = this.n - this.pointH;
      const y = sy + i * TILE;
      const a = 0.5 + 0.4 * Math.sin((w.tick - this.pointAt) * 0.3);
      ctx.strokeStyle = `rgba(255,236,120,${a})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 1, y, this.wd + 2, TILE);
    }
  }
}

/** a customer on the pavement behind the stalls, pointing at the book he wants (he points first: honest) */
export class Customer extends Entity {
  target: Stack | null = null;
  private said = -999;
  constructor(
    public x: number,
    readonly shirt = '#7B8D6E',
    readonly y = FLOOR - 54,
  ) {
    super();
    this.layer = -4;
  }
  ask(w: World, s: Stack, h = 1, delay = 1.2) {
    if (s.n <= 0) return;
    this.target = s;
    s.point(w, h, delay);
    if (w.tick - this.said > 220) {
      this.said = w.tick;
      w.say('Ei jinishtar dam koto? | How much is this?', this.x, this.y - 6, 1.6, 'npc');
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const y = this.y;
    person(ctx, this.x, y, 24, this.shirt);
    const s = this.target;
    if (s && s.pointed && s.n > 0) {
      const ty = s.solid.y + (s.n - s.pointH) * TILE + 8;
      const tx = s.x + s.wd / 2;
      const ax = this.x + (tx > this.x ? 5 : -5),
        ay = y + 10;
      const len = Math.min(16, Math.hypot(tx - ax, ty - ay));
      const ang = Math.atan2(ty - ay, tx - ax);
      const ex = ax + Math.cos(ang) * len,
        ey = ay + Math.sin(ang) * len;
      ctx.strokeStyle = this.shirt;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = 'rgba(255,236,120,0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
}

/** a wooden stall front behind the stacks, where the customers stand (drawn only) */
export class Stall extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly label: string,
  ) {
    super();
    this.layer = -6;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const y = FLOOR - 30;
    ctx.fillStyle = '#6B4A2E';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 4);
    ctx.fillStyle = 'rgba(60,40,24,0.55)';
    ctx.fillRect(this.x0, y + 4, this.x1 - this.x0, 26);
    for (let x = this.x0 + 3; x < this.x1 - 6; x += 7) {
      ctx.fillStyle = SPINE[Math.round(x / 7) % SPINE.length];
      ctx.fillRect(x, y - 14 + (Math.round(x / 7) % 3), 5, 14 - (Math.round(x / 7) % 3));
    }
    ctx.fillStyle = '#F4F1E8';
    ctx.font = '800 7px "Baloo 2", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, (this.x0 + this.x1) / 2, y + 14);
  }
}

/** the muck in an open drain: deadly below its surface; the cause depends on how Dad got there */
export class Muck extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly cause: (w: World) => string,
    readonly surface = FLOOR + 8,
  ) {
    super();
    this.layer = 4;
  }
  update(w: World) {
    const p = w.player;
    if (p.y + p.h > this.surface + 3 && p.x + p.w > this.x0 && p.x < this.x1) w.die(this.cause(w));
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const g = ctx.createLinearGradient(0, this.surface, 0, this.surface + 40);
    g.addColorStop(0, 'rgba(96,104,74,0.92)');
    g.addColorStop(1, 'rgba(40,44,28,0.98)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, this.surface, this.x1 - this.x0, 60);
    ctx.fillStyle = 'rgba(200,210,170,0.35)';
    for (let x = this.x0 + ((w.tick >> 3) % 12); x < this.x1 - 4; x += 12) ctx.fillRect(x, this.surface, 4, 1);
  }
}
