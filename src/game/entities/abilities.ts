// New ways to move, each owned by one stage: swimming the reef (KVT-06), climbing palms (KVT-07),
// running on the lagoon (KVT-08) and kicking up between chawl walls (BOM-06).
import { Solid } from '../body';
import { DT, ROOM_H, TILE } from '../constants';
import { Entity, type Hazard, type World } from '../world';
import type { Climbable, SeaZone } from '../player';
import type { Ctx } from '../../render/art/common';

// ------------------------------------------------------------------ the sea you can swim in
/** A stretch of sea Dad swims in (not deadly: only running out of air is). Drawn over him, see-through. */
export class Sea extends Entity {
  zone: SeaZone;
  constructor(
    w: World,
    x0: number,
    x1: number,
    top: number,
    bottom = ROOM_H + 40,
    readonly colors: [string, string] = ['rgba(60,200,215,0.42)', 'rgba(10,70,120,0.72)'],
  ) {
    super();
    this.layer = 5;
    this.zone = { x0, x1, top, bottom };
    w.seas.push(this.zone);
  }
  draw(ctx: Ctx, w: World) {
    const { x0, x1, top } = this.zone;
    const t = w.tick * DT;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, top - 6, x1 - x0, ROOM_H + 60 - top);
    ctx.clip();
    const g = ctx.createLinearGradient(0, top, 0, ROOM_H);
    g.addColorStop(0, this.colors[0]);
    g.addColorStop(1, this.colors[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0 - 4, ROOM_H + 40);
    for (let x = x0 - 4; x <= x1 + 4; x += 6) ctx.lineTo(x, top + Math.sin(x * 0.09 + t * 2.6) * 1.2);
    ctx.lineTo(x1 + 4, ROOM_H + 40);
    ctx.closePath();
    ctx.fill();
    // light ripples on the sand and the surface line
    ctx.strokeStyle = 'rgba(220,250,255,0.18)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < (x1 - x0) / 22; i++) {
      const x = x0 + i * 22 + Math.sin(t * 1.3 + i) * 5;
      const y = top + 14 + ((i * 37) % Math.max(20, ROOM_H - top - 30));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 6, y - 3 + Math.sin(t * 2 + i) * 2, x + 12, y);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(235,255,255,0.75)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 6) {
      const y = top + Math.sin(x * 0.09 + t * 2.6) * 1.2;
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // a few bubbles drifting up
    ctx.fillStyle = 'rgba(235,255,255,0.45)';
    for (let i = 0; i < (x1 - x0) / 40; i++) {
      const x = x0 + 12 + i * 40 + Math.sin(t + i * 2) * 3;
      const span = ROOM_H - top - 10;
      const y = ROOM_H - 6 - ((t * 18 + i * 53) % span);
      ctx.beginPath();
      ctx.arc(x, y, 0.9 + (i % 3) * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** Air from the reef: a column of bubbles. While it's bubbling, swimming into it fills Dad's lungs. */
export class Vent extends Entity {
  on = true;
  constructor(
    readonly x: number,
    readonly y0: number,
    readonly y1: number,
    readonly sched: { period: number; on: number; phase?: number } | null = null,
  ) {
    super();
    this.layer = 4;
  }
  isOn(w: World) {
    if (!this.sched) return true;
    const s = this.sched;
    const t = ((w.tick * DT + (s.phase ?? 0)) % s.period + s.period) % s.period;
    return t < s.on;
  }
  update(w: World) {
    this.on = this.isOn(w);
    if (!this.on) return;
    for (const p of [w.player, ...w.twins]) {
      if (p.dead) continue;
      if (p.x < this.x + 10 && p.x + p.w > this.x - 10 && p.y < this.y1 && p.y + p.h > this.y0) p.air = Math.min(5, p.air + 8 * DT);
    }
  }
  draw(ctx: Ctx, w: World) {
    const t = w.tick * DT;
    // the crack in the reef
    ctx.fillStyle = '#3D2C2A';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y1, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    const k = this.on ? 1 : 0.18;
    for (let i = 0; i < 14; i++) {
      const life = ((t * 1.4 + i / 14) % 1 + 1) % 1;
      const y = this.y1 - life * (this.y1 - this.y0);
      const x = this.x + Math.sin(t * 5 + i * 1.7) * (2 + life * 4);
      ctx.globalAlpha = k * (1 - life * 0.6);
      ctx.strokeStyle = 'rgba(240,255,255,0.95)';
      ctx.fillStyle = 'rgba(200,245,255,0.35)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(x, y, 1.2 + (i % 4) * 0.7 + life * 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------ palms to climb
export interface PalmOpts {
  /** a young palm: under Dad's weight it leans over, up to this angle (degrees, + is right) */
  bend?: number;
  /** greased: it slides you down this fast (px/s) when you stop climbing */
  slide?: number;
  /** fronds and a crown to stand on at the top (default yes) */
  crown?: boolean;
  /** the trunk leans a little (degrees): it climbs along the lean */
  lean?: number;
  /** a young palm keeps sagging while you hang on it (degrees per second) */
  creep?: number;
  /** how wide its crown is to stand on (px, default 44) */
  crownW?: number;
}

/** A coconut palm: jump at it to grab it, hold left or right to climb, jump to leap off. */
export class Palm extends Entity implements Climbable {
  active = true;
  len: number;
  slide?: number;
  crown?: Solid;
  solids: Solid[] = [];
  /** the lean right now (radians, + is right) */
  angle = 0;
  private target = 0;
  private held = false;
  constructor(
    readonly bx: number,
    readonly by: number,
    height: number,
    readonly o: PalmOpts = {},
  ) {
    super();
    this.layer = -2;
    this.len = height;
    this.slide = o.slide;
    if (o.crown !== false) {
      const top = this.point(1);
      const cw = o.crownW ?? 44;
      this.crown = new Solid(top.x - cw / 2, top.y - 4, cw, 6);
      this.crown.oneWay = true;
      this.solids.push(this.crown);
    }
  }
  /** a point on the trunk's middle line */
  point(s: number) {
    const a = this.angle + ((this.o.lean ?? 0) * Math.PI) / 180;
    return { x: this.bx + s * this.len * Math.sin(a), y: this.by - s * this.len * Math.cos(a) };
  }
  at(s: number) {
    const p = this.point(s);
    return { x: p.x, y: p.y + 7 };
  }
  touch(x: number, y: number, w: number, h: number): number | null {
    let best: number | null = null,
      bd = 1e9;
    const cy = y + h / 2;
    for (let i = 2; i <= 50; i++) {
      const s = i / 50;
      const p = this.point(s);
      if (p.x < x - 3 || p.x > x + w + 3 || p.y < y - 3 || p.y > y + h + 3) continue;
      const d = Math.abs(p.y - cy);
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    return best;
  }
  private sag = 0;
  onGrip(_w: World, s: number) {
    if (!this.held) this.sag = 0;
    this.held = true;
    if (!this.o.bend) return;
    if (this.o.creep) this.sag = Math.min(1, this.sag + ((this.o.creep / Math.abs(this.o.bend)) * DT));
    this.target = ((this.o.bend * Math.PI) / 180) * Math.min(1, s + this.sag);
  }
  onLeave() {
    this.held = false;
  }
  update(w: World) {
    if (!this.o.bend) return;
    // standing on its crown counts as being at the top
    const p = w.player;
    const onCrown = !!this.crown && p.onGround && this.crown.collidable && p.isRiding(this.crown);
    if (onCrown) this.target = (this.o.bend * Math.PI) / 180;
    else if (!this.held || p.grip !== this) {
      this.held = false;
      this.target = 0;
    }
    const step = (onCrown || this.held ? 1.6 : 2.6) * DT;
    const before = this.angle;
    this.angle = this.angle < this.target ? Math.min(this.target, this.angle + step) : Math.max(this.target, this.angle - step);
    if (this.angle !== before && this.crown) {
      const top = this.point(1);
      this.crown.moveBy(w, top.x - this.crown.w / 2 - this.crown.x - this.crown.xr, top.y - 4 - this.crown.y - this.crown.yr);
    }
  }
  draw(ctx: Ctx, w: World) {
    const n = 16;
    const pts = Array.from({ length: n + 1 }, (_, i) => this.point(i / n));
    // trunk: a soft curve, darker rings
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#5B3A22';
    ctx.lineWidth = 8;
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.stroke();
    ctx.strokeStyle = this.o.slide ? '#B48A5C' : '#8D6440';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(60,36,20,0.55)';
    ctx.lineWidth = 1;
    for (let i = 1; i < n; i++) {
      const a = pts[i],
        b = pts[i + 1];
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L,
        ny = dx / L;
      ctx.beginPath();
      ctx.moveTo(a.x - nx * 3, a.y - ny * 3);
      ctx.lineTo(a.x + nx * 3, a.y + ny * 3 + 1);
      ctx.stroke();
    }
    if (this.o.slide) {
      // the grease shines
      ctx.strokeStyle = `rgba(255,250,210,${0.35 + Math.sin(w.tick * 0.08) * 0.15})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x + 1.5, p.y) : ctx.moveTo(p.x + 1.5, p.y)));
      ctx.stroke();
    }
    if (this.o.crown === false) return;
    const top = pts[n];
    // fronds
    const sway = Math.sin(w.tick * 0.03 + this.bx) * 0.08;
    for (let i = 0; i < 7; i++) {
      const a = -Math.PI / 2 + (i - 3) * 0.5 + sway + this.angle * 0.6;
      const L = 24 + (i % 2) * 5;
      const ex = top.x + Math.cos(a) * L,
        ey = top.y + Math.sin(a) * L * 0.55 + 6;
      ctx.strokeStyle = i % 2 ? '#2E7D32' : '#43A047';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.quadraticCurveTo((top.x + ex) / 2, top.y - 6, ex, ey);
      ctx.stroke();
    }
    // coconuts
    ctx.fillStyle = '#6B4F1D';
    for (const dx of [-3, 2, 6]) {
      ctx.beginPath();
      ctx.arc(top.x + dx - 1, top.y + 3, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ------------------------------------------------------------------ the lagoon you can run on
/** Water that holds Dad up while he runs flat out over it. Slow down, stop or turn: he sinks. */
export class Skim extends Entity {
  solid: Solid;
  hazard: Hazard;
  /** px/s he needs to keep going */
  static readonly SPEED = 118;
  /** ticks he can be slow on it before it gives */
  static readonly GRACE = 8;
  private slowT = 0;
  sunk = false;
  /** seaweed: patches that slow him to a crawl (x0, x1 px) */
  weed: [number, number][] = [];
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top: number,
    readonly colors: [string, string] = ['rgba(70,205,215,0.92)', 'rgba(12,90,130,0.98)'],
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x0, top, x1 - x0, 6);
    this.solid.oneWay = true;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'splash',
      hits(x, y, w, h) {
        return x + w > self.x0 + 2 && x < self.x1 - 2 && y + h - 6 > self.top;
      },
    };
  }
  /** is Dad's middle over seaweed? */
  inWeed(cx: number) {
    return this.weed.some(([a, b]) => cx >= a && cx < b);
  }
  update(w: World) {
    const p = w.player;
    if (this.sunk) return;
    const on = this.solid.collidable && p.onGround && p.isRiding(this.solid);
    if (!on) {
      this.slowT = 0;
      return;
    }
    const weed = this.inWeed(p.cx);
    if (weed && Math.abs(p.vx) > 70) p.vx = Math.sign(p.vx) * 70;
    const fast = Math.abs(p.vx) >= Skim.SPEED && (p.inputDir === Math.sign(p.vx) || p.stun > 0);
    if (fast) this.slowT = 0;
    else if (++this.slowT > Skim.GRACE) {
      this.sunk = true;
      this.solid.collidable = false;
      w.sfx('splash', p.cx, this.top);
      w.emit('fx', p.cx, this.top, { kind: 'splash' });
    }
    if (fast && w.tick % 5 === 0) w.emit('fx', p.cx - p.facing * 4, this.top, { kind: 'splash' });
  }
  draw(ctx: Ctx, w: World) {
    const t = w.tick * DT;
    const { x0, x1, top } = this;
    const g = ctx.createLinearGradient(0, top, 0, ROOM_H);
    g.addColorStop(0, this.colors[0]);
    g.addColorStop(1, this.colors[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x0, ROOM_H + 40);
    for (let x = x0; x <= x1; x += 4) ctx.lineTo(x, top + 1 + Math.sin(x * 0.11 + t * 3) * 0.9);
    ctx.lineTo(x1, ROOM_H + 40);
    ctx.closePath();
    ctx.fill();
    // seaweed: a dark green mat on the surface, fronds sticking up
    for (const [a, b] of this.weed) {
      ctx.fillStyle = 'rgba(24,70,30,0.92)';
      ctx.fillRect(a, top - 1, b - a, 7);
      ctx.fillStyle = 'rgba(70,130,50,0.95)';
      for (let x = a + 1; x < b - 2; x += 3) ctx.fillRect(x, top - 1 + ((x * 7) % 3), 2, 2);
      ctx.strokeStyle = 'rgba(110,170,70,0.95)';
      ctx.lineWidth = 1.1;
      for (let x = a + 2; x < b; x += 5) {
        ctx.beginPath();
        ctx.moveTo(x, top + 1);
        ctx.quadraticCurveTo(x + Math.sin(t * 2 + x) * 2.5, top - 4, x + 1.5, top - 7);
        ctx.stroke();
      }
    }
    ctx.strokeStyle = 'rgba(240,255,255,0.8)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let x = x0; x <= x1; x += 4) {
      const y = top + 1 + Math.sin(x * 0.11 + t * 3) * 0.9;
      if (x === x0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // glints
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let x = x0 + 10; x < x1; x += 37) ctx.fillRect(x + Math.sin(t + x) * 4, top + 4 + (x % 11), 4, 0.8);
  }
}

// ------------------------------------------------------------------ chawl walls
/** A chawl's wall you can kick off (the tiles are the wall; this registers it and paints the facade). */
export class ChawlWall extends Entity {
  rect: { x: number; y: number; w: number; h: number };
  wet = false;
  constructor(
    w: World,
    tx: number,
    ty0: number,
    ty1: number,
    readonly paintCol = '#D9C7A3',
    readonly face: 'left' | 'right' | 'both' = 'both',
  ) {
    super();
    this.layer = -1;
    this.rect = { x: tx * TILE, y: ty0 * TILE, w: TILE, h: (ty1 - ty0 + 1) * TILE };
    w.kicks.push(this.rect);
  }
  /** fresh paint: no kicking off it any more */
  setWet(w: World, wet: boolean) {
    if (wet === this.wet) return;
    this.wet = wet;
    const i = w.kicks.indexOf(this.rect);
    if (wet && i >= 0) w.kicks.splice(i, 1);
    if (!wet && i < 0) w.kicks.push(this.rect);
  }
  draw(ctx: Ctx, w: World) {
    const { x, y, w: ww, h } = this.rect;
    ctx.fillStyle = this.wet ? '#F06292' : this.paintCol;
    ctx.fillRect(x, y, ww, h);
    // plaster cracks and damp
    ctx.fillStyle = 'rgba(80,60,40,0.12)';
    for (let yy = y + 6; yy < y + h; yy += 23) ctx.fillRect(x + 2 + ((yy * 7) % 9), yy, 3, 7);
    ctx.strokeStyle = 'rgba(60,40,30,0.35)';
    ctx.lineWidth = 0.6;
    for (let yy = y; yy < y + h; yy += 16) {
      ctx.beginPath();
      ctx.moveTo(x, yy + 0.5);
      ctx.lineTo(x + ww, yy + 0.5);
      ctx.stroke();
    }
    if (this.wet) {
      // fresh paint drips and shine
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 3, y, 2, h);
      ctx.fillStyle = '#EC407A';
      for (let xx = x + 2; xx < x + ww; xx += 5) ctx.fillRect(xx, y + h, 1.5, 3 + ((xx * 13) % 5) + Math.sin(w.tick * 0.05 + xx) * 1);
    }
  }
}

/** The face of a Mumbai chawl over a block of tiles: plaster, barred windows, a gallery, washing. */
export class Facade extends Entity {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    readonly col = '#E8D5B0',
    readonly seed = 1,
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: Ctx, w: World) {
    const { x, y, w: ww, h } = this;
    ctx.fillStyle = this.col;
    ctx.fillRect(x, y, ww, h);
    // damp streaks
    ctx.fillStyle = 'rgba(90,70,40,0.12)';
    for (let i = 0; i < ww / 24; i++) ctx.fillRect(x + 6 + i * 24 + ((i * this.seed * 7) % 9), y, 4, h * (0.3 + ((i * 3 + this.seed) % 5) / 10));
    // floors: a sunshade and windows with grilles every 3 tiles
    for (let fy = y + 10; fy < y + h - 14; fy += 48) {
      ctx.fillStyle = 'rgba(60,40,30,0.35)';
      ctx.fillRect(x, fy - 3, ww, 2);
      for (let wx = x + 8; wx < x + ww - 14; wx += 30) {
        const k = ((wx * 13 + fy * 7 + this.seed) % 5) | 0;
        ctx.fillStyle = k === 0 ? '#FFE9A8' : '#3E3A44';
        ctx.fillRect(wx, fy + 4, 14, 16);
        ctx.strokeStyle = '#2E2A2A';
        ctx.lineWidth = 0.8;
        for (let gx = wx + 3; gx < wx + 14; gx += 3.5) {
          ctx.beginPath();
          ctx.moveTo(gx, fy + 4);
          ctx.lineTo(gx, fy + 20);
          ctx.stroke();
        }
        // washing on a line
        if (k === 2) {
          ctx.fillStyle = ['#E53935', '#43A047', '#1E88E5', '#FDD835'][((wx + fy) >> 4) % 4];
          const sway = Math.sin(w.tick * 0.05 + wx) * 1;
          ctx.fillRect(wx - 2 + sway, fy + 22, 6, 8);
          ctx.fillRect(wx + 7 + sway, fy + 22, 5, 6);
        }
      }
    }
    ctx.strokeStyle = 'rgba(40,30,25,0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, ww - 1, h - 1);
  }
}
