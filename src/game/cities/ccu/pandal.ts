// CCU-09: a pandal going up. The bamboo skeleton is the stage, and the decorators tie cloth panels on to it
// in the order they need them: a panel goes up exactly where your next foothold was. A tied panel is a solid
// wall you can stand on top of, until they tie the next one above it.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { person } from '../../levels/endkit';
import { FLOOR } from './entities';

const CLOTH = [
  ['#C62828', '#F2C14E'],
  ['#F4F1E8', '#C62828'],
  ['#F2C14E', '#6A1B9A'],
  ['#1D5C96', '#F4F1E8'],
];

/** a cloth panel tied on to the bamboo over columns [x, x+w) whose bottom is at `base` (px) */
export class ClothPanel extends Entity {
  solid: Solid;
  h = 0;
  target = 0;
  tied = false;
  tiedAt = -1;
  /** px a tick it unrolls at */
  speed = 128 * DT * 4;
  constructor(
    readonly x: number,
    readonly wd: number,
    readonly base: number,
    readonly tiles: number,
    readonly hue = 0,
    pre = false,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, base - 1, wd, 1);
    this.solid.collidable = false;
    this.solid.velX = 0;
    if (pre) {
      this.tied = true;
      this.target = this.h = tiles * TILE;
      this.solid.place(x, base - this.h);
      this.solid.h = this.h;
      this.solid.collidable = true;
    }
  }
  top() {
    return this.base - this.h;
  }
  /** tie it on now: it unrolls up to its full height in a quarter of a second */
  tie(w: World) {
    if (this.tied) return;
    this.tied = true;
    this.tiedAt = w.tick;
    this.target = this.tiles * TILE;
    this.solid.collidable = true;
    w.sfx('slide', this.x + this.wd / 2, this.base);
  }
  /** tie the next panel on above this one: it grows by `more` tiles, lifting whatever is on top */
  raise(w: World, more: number) {
    this.target += more * TILE;
    w.sfx('creak', this.x + this.wd / 2, this.top());
  }
  update(w: World) {
    if (!this.tied || this.h >= this.target) return;
    const nh = Math.min(this.target, this.h + this.speed);
    const top = Math.round(this.base - nh);
    const s = this.solid;
    if (top !== s.y) s.moveBy(w, 0, top - s.y);
    s.h = Math.max(1, this.base - s.y);
    this.h = nh;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.tied) return;
    const [a, b] = CLOTH[this.hue % CLOTH.length];
    const y = this.top();
    ctx.fillStyle = a;
    ctx.fillRect(this.x, y, this.wd, this.h);
    ctx.fillStyle = b;
    for (let yy = y + 3; yy < this.base - 2; yy += 8) ctx.fillRect(this.x, yy, this.wd, 2);
    // the scalloped edge, and the ties at the top
    ctx.fillStyle = b;
    for (let x = this.x + 2; x < this.x + this.wd - 2; x += 6) {
      ctx.beginPath();
      ctx.arc(x + 2, this.base - 1, 2.5, 0, Math.PI);
      ctx.fill();
    }
    ctx.fillStyle = '#C9A66B';
    ctx.fillRect(this.x - 1, y, this.wd + 2, 2);
    void w;
  }
}

/** a decorator waiting with his roll of cloth beside the next foothold (the tell), then tying it on */
export class Decorator extends Entity {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly panel: ClothPanel,
  ) {
    super();
    this.layer = -1;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = this.panel;
    const busy = p.tied && w.tick - p.tiedAt < 40;
    person(ctx, this.x, this.y - 20, 20, '#5D4037', '#9C6B48', { arms: busy ? 6 : 2 });
    if (!p.tied) {
      const [a, b] = CLOTH[p.hue % CLOTH.length];
      ctx.fillStyle = a;
      ctx.fillRect(this.x + 4, this.y - 14, 5, 12);
      ctx.fillStyle = b;
      ctx.fillRect(this.x + 4, this.y - 10, 5, 2);
    }
  }
}

/** the cut bamboo stakes on the pandal floor from x0 to x1: deadly to land on */
export class Stakes extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = 2;
  }
  update(w: World) {
    const p = w.player;
    if (p.y + p.h > FLOOR - 9 && p.x + p.w > this.x0 + 2 && p.x < this.x1 - 2) w.die('ccu-bansh');
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (let x = this.x0 + 3; x < this.x1 - 2; x += 6) {
      const h = 9 + ((x * 7) % 4);
      ctx.fillStyle = '#C9A66B';
      ctx.beginPath();
      ctx.moveTo(x - 2, FLOOR);
      ctx.lineTo(x, FLOOR - h);
      ctx.lineTo(x + 2, FLOOR);
      ctx.fill();
      ctx.fillStyle = '#7A8B3A';
      ctx.fillRect(x - 2, FLOOR - 3, 4, 1);
    }
  }
}

/** the pandal's bamboo skeleton behind everything: uprights and cross-ties (drawn only) */
export class Skeleton extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = -7;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(180,150,90,0.7)';
    ctx.lineWidth = 2;
    for (let x = this.x0; x <= this.x1; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR);
      ctx.lineTo(x, FLOOR - 160);
      ctx.stroke();
    }
    ctx.lineWidth = 1.2;
    for (let y = FLOOR - 32; y > FLOOR - 160; y -= 40) {
      ctx.beginPath();
      ctx.moveTo(this.x0, y);
      ctx.lineTo(this.x1, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(120,90,50,0.6)';
    for (let x = this.x0; x < this.x1; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR - 32);
      ctx.lineTo(x + 32, FLOOR - 72);
      ctx.stroke();
    }
  }
}

/** CCU-10: after the festival the pandal comes down. A panel let down from the roof frame on to the bamboo
 *  under it, a moment after Dad stands there: it squeezes whoever waits */
export class Lowered extends Entity {
  solid: Solid;
  t = -1;
  constructor(
    x: number,
    wd: number,
    readonly from: number,
    readonly to: number,
    readonly hue = 0,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, from, wd, 16);
    this.solid.velX = 0;
  }
  /** let it down `delay` s from now */
  lower(w: World, delay: number) {
    if (this.t < 0) this.t = w.tick + Math.round(delay * 120);
  }
  update(w: World) {
    if (this.t < 0 || w.tick < this.t || this.solid.y >= this.to) return;
    this.solid.moveBy(w, 0, Math.min(1, this.to - this.solid.y));
  }
  draw(ctx: CanvasRenderingContext2D) {
    const [a, b] = CLOTH[this.hue % CLOTH.length];
    const s = this.solid;
    ctx.fillStyle = '#C9A66B';
    ctx.fillRect(s.x + 2, s.y - 40, 1, 40);
    ctx.fillRect(s.x + s.w - 3, s.y - 40, 1, 40);
    ctx.fillStyle = a;
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = b;
    ctx.fillRect(s.x, s.y + 6, s.w, 2);
  }
}

/** CCU-09: the canopy frame they let down on the dhak's beat to tie it, and haul up again. Under it at the
 *  beat there is no room for anyone */
export class DhakFrame extends Entity {
  solid: Solid;
  t0 = -1;
  constructor(
    x: number,
    wd: number,
    readonly up: number,
    readonly down: number,
    /** the beat (s): it drops at the start of each, stays down `hold` s, and is hauled up again */
    readonly every = 2.8,
    readonly hold = 0.5,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, up, wd, 12);
    this.solid.velX = 0;
  }
  /** seconds into the current beat (-1: not drumming yet) */
  beatT(w: World) {
    return this.t0 < 0 || w.tick < this.t0 ? -1 : ((w.tick - this.t0) / 120) % this.every;
  }
  /** is it on its way up (or up), so the bamboo under it is clear for the rest of this beat */
  rising(w: World) {
    const t = this.beatT(w);
    return t >= 0.25 + this.hold;
  }
  update(w: World) {
    const t = this.beatT(w);
    if (t < 0) return;
    const span = this.down - this.up;
    const f = t < 0.25 ? t / 0.25 : t < 0.25 + this.hold ? 1 : t < 0.5 + this.hold ? 1 - (t - 0.25 - this.hold) / 0.25 : 0;
    const y = Math.round(this.up + span * f);
    if (y !== this.solid.y) this.solid.moveBy(w, 0, y - this.solid.y);
    if (t < 1 / 120) w.sfx('thud', this.solid.x + this.solid.w / 2, this.solid.y);
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    ctx.fillStyle = '#8D6E63';
    for (let x = s.x; x < s.x + s.w; x += 24) ctx.fillRect(x + 4, 0, 2, s.y);
    ctx.fillStyle = '#C9A66B';
    ctx.fillRect(s.x, s.y, s.w, 4);
    const [a, b] = CLOTH[1];
    ctx.fillStyle = a;
    ctx.fillRect(s.x, s.y + 4, s.w, s.h - 4);
    ctx.fillStyle = b;
    ctx.fillRect(s.x, s.y + 8, s.w, 2);
  }
}
