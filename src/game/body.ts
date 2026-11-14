import { Rect } from './constants';

/**
 * Collision model adapted from Maddy Thorson's "Celeste & TowerFall physics":
 * actors and solids live on an integer pixel grid with float remainders,
 * actors move one pixel at a time, solids push and carry actors, and an actor
 * that is pushed into something else gets squished. It is deterministic and
 * never lets anything tunnel through a wall.
 */
export interface Collider {
  actors: Actor[];
  solidAt(x: number, y: number, w: number, h: number): Solid | true | null;
  oneWayTopAt(x: number, bottom: number, w: number): boolean;
}

export class Solid {
  x: number;
  y: number;
  w: number;
  h: number;
  xr = 0;
  yr = 0;
  /** movement applied during the current tick (px), used for momentum inheritance */
  lastDx = 0;
  lastDy = 0;
  /** true sideways speed (px/s) for things that glide less than a pixel a tick; momentum uses it instead of lastDx */
  velX: number | null = null;
  collidable = true;
  oneWay = false;
  slippery = false;
  /** fresh tar: you can only shuffle across it */
  sticky = false;
  /** Optional solid parts, relative to (x, y). Null means the whole box is solid. */
  parts: Rect[] | null = null;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.w = w;
    this.h = h;
  }

  overlaps(ax: number, ay: number, aw: number, ah: number): boolean {
    if (!(ax < this.x + this.w && ax + aw > this.x && ay < this.y + this.h && ay + ah > this.y)) return false;
    const parts = this.parts;
    if (!parts) return true;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const px = this.x + p.x,
        py = this.y + p.y;
      if (ax < px + p.w && ax + aw > px && ay < py + p.h && ay + ah > py) return true;
    }
    return false;
  }

  /** Top edge (absolute) of the part under the given span, for one-way checks. */
  topsUnder(ax: number, aw: number): number[] {
    if (!this.parts) return ax < this.x + this.w && ax + aw > this.x ? [this.y] : [];
    const out: number[] = [];
    for (const p of this.parts) {
      const px = this.x + p.x;
      if (ax < px + p.w && ax + aw > px) out.push(this.y + p.y);
    }
    return out;
  }

  private edge(a: Actor, side: 'l' | 'r' | 't' | 'b'): number {
    const parts = this.parts ?? [{ x: 0, y: 0, w: this.w, h: this.h }];
    let best = side === 'r' || side === 'b' ? -Infinity : Infinity;
    for (const p of parts) {
      const px = this.x + p.x,
        py = this.y + p.y;
      if (!(a.x < px + p.w && a.x + a.w > px && a.y < py + p.h && a.y + a.h > py)) continue;
      if (side === 'r') best = Math.max(best, px + p.w);
      else if (side === 'l') best = Math.min(best, px);
      else if (side === 'b') best = Math.max(best, py + p.h);
      else best = Math.min(best, py);
    }
    return best;
  }

  /** Move by a float amount; pushes overlapping actors and carries riders. */
  moveBy(world: Collider, dx: number, dy: number) {
    this.lastDx += dx;
    this.lastDy += dy;
    this.xr += dx;
    this.yr += dy;
    const mx = Math.round(this.xr);
    const my = Math.round(this.yr);
    if (mx === 0 && my === 0) return;

    const riders: Actor[] = [];
    if (this.collidable) for (const a of world.actors) if (!a.dead && a.isRiding(this)) riders.push(a);

    const wasCollidable = this.collidable;
    this.collidable = false;

    if (mx !== 0) {
      this.xr -= mx;
      this.x += mx;
      if (wasCollidable) {
        for (const a of world.actors) {
          if (a.dead) continue;
          if (!this.oneWay && this.overlaps(a.x, a.y, a.w, a.h)) {
            const amt = mx > 0 ? this.edge(a, 'r') - a.x : this.edge(a, 'l') - (a.x + a.w);
            a.moveXExact(world, amt, () => a.squish('x', this));
          } else if (riders.includes(a)) {
            a.moveXExact(world, mx);
          }
        }
      }
    }
    if (my !== 0) {
      this.yr -= my;
      this.y += my;
      if (wasCollidable) {
        for (const a of world.actors) {
          if (a.dead) continue;
          if (!this.oneWay && this.overlaps(a.x, a.y, a.w, a.h)) {
            const amt = my > 0 ? this.edge(a, 'b') - a.y : this.edge(a, 't') - (a.y + a.h);
            a.moveYExact(world, amt, () => a.squish('y', this));
          } else if (riders.includes(a)) {
            a.moveYExact(world, my);
          }
        }
      }
    }
    this.collidable = wasCollidable;
  }

  /** Teleport without interacting with actors (used for off-screen wraps). */
  place(x: number, y: number) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.xr = 0;
    this.yr = 0;
  }
}

export class Actor {
  x: number;
  y: number;
  w: number;
  h: number;
  xr = 0;
  yr = 0;
  dead = false;
  squishedBy: Solid | null = null;
  squishAxis: 'x' | 'y' | null = null;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = Math.round(x);
    this.y = Math.round(y);
    this.w = w;
    this.h = h;
  }

  get cx() {
    return this.x + this.w / 2;
  }
  get cy() {
    return this.y + this.h / 2;
  }
  get bottom() {
    return this.y + this.h;
  }

  squish(axis: 'x' | 'y', by: Solid) {
    this.squishAxis = axis;
    this.squishedBy = by;
  }

  isRiding(s: Solid): boolean {
    if (s.oneWay) {
      for (const top of s.topsUnder(this.x, this.w)) if (top === this.y + this.h) return true;
      return false;
    }
    return s.overlaps(this.x, this.y + 1, this.w, this.h) && !s.overlaps(this.x, this.y, this.w, this.h);
  }

  moveX(world: Collider, amount: number, onCollide?: (hit: Solid | true) => void): boolean {
    this.xr += amount;
    const move = Math.round(this.xr);
    if (move === 0) return false;
    this.xr -= move;
    return this.moveXExact(world, move, onCollide, true);
  }

  moveXExact(world: Collider, move: number, onCollide?: (hit: Solid | true) => void, clearRem = false): boolean {
    const s = Math.sign(move);
    while (move !== 0) {
      const hit = world.solidAt(this.x + s, this.y, this.w, this.h);
      if (hit) {
        if (clearRem) this.xr = 0;
        onCollide?.(hit);
        return true;
      }
      this.x += s;
      move -= s;
    }
    return false;
  }

  moveY(world: Collider, amount: number, onCollide?: (hit: Solid | true) => void): boolean {
    this.yr += amount;
    const move = Math.round(this.yr);
    if (move === 0) return false;
    this.yr -= move;
    return this.moveYExact(world, move, onCollide, true);
  }

  moveYExact(world: Collider, move: number, onCollide?: (hit: Solid | true) => void, clearRem = false): boolean {
    const s = Math.sign(move);
    while (move !== 0) {
      let hit: Solid | true | null = world.solidAt(this.x, this.y + s, this.w, this.h);
      if (!hit && s > 0 && world.oneWayTopAt(this.x, this.y + this.h, this.w)) hit = true;
      if (hit) {
        if (clearRem) this.yr = 0;
        onCollide?.(hit);
        return true;
      }
      this.y += s;
      move -= s;
    }
    return false;
  }
}
