import { Solid } from '../body';
import { approach, DT, ease, EaseName, overlapXYWH, PHYS, Rect, ROOM_H, ROOM_W, secs, TILE } from '../constants';
import { Entity, ExitLike, Hazard, World } from '../world';
import { drawTrain, drawTrainDoor } from '../../render/art/vehicles';
import { Ctx, fillRR, rr, text } from '../../render/art/common';

/**
 * Mumbai's signature: the station platform moves while the train stays still.
 *  - treadmill: while you walk on it, it slides the other way (faster)
 *  - path:      glides between points, optionally waiting at each end
 *  - scripted:  slides when the level says so
 */
export class Platform extends Entity {
  solid: Solid;
  label: string;
  treadmill: { factor: number; minX: number; maxX: number } | null = null;
  path: { pts: { x: number; y: number }[]; speed: number; pause: number; i: number; dir: 1 | -1; wait: number; active: boolean; loop: boolean } | null = null;
  private tw: { sx: number; sy: number; ex: number; ey: number; t0: number; dur: number; e: EaseName; last: number; then?: (w: World) => void } | null = null;
  v = 0;
  look: 'slab' | 'cart' = 'slab';

  constructor(tx: number, ty: number, wTiles: number, opts: { label?: string; hTiles?: number } = {}) {
    super();
    this.layer = 1;
    this.solid = new Solid(tx * TILE, ty * TILE, wTiles * TILE, (opts.hTiles ?? 1) * TILE);
    this.label = opts.label ?? '';
  }

  asTreadmill(factor: number, minTx: number, maxTx: number) {
    this.treadmill = { factor, minX: minTx * TILE, maxX: maxTx * TILE };
    return this;
  }

  asPath(ptsTiles: [number, number][], speed: number, opts: { pause?: number; loop?: boolean; active?: boolean } = {}) {
    this.path = {
      pts: ptsTiles.map(([x, y]) => ({ x: x * TILE, y: y * TILE })),
      speed,
      pause: opts.pause ?? 0.6,
      i: 0,
      dir: 1,
      wait: 0,
      active: opts.active ?? true,
      loop: opts.loop ?? false,
    };
    return this;
  }

  start() {
    if (this.path) this.path.active = true;
  }

  slide(w: World, dxTiles: number, dyTiles: number, seconds: number, e: EaseName = 'inOut', then?: (w: World) => void) {
    const sx = this.solid.x + this.solid.xr,
      sy = this.solid.y + this.solid.yr;
    this.tw = { sx, sy, ex: sx + dxTiles * TILE, ey: sy + dyTiles * TILE, t0: w.tick, dur: Math.max(1, secs(seconds)), e, last: 0, then };
    w.sfx('slide', sx, sy);
  }

  update(w: World) {
    const s = this.solid;
    if (this.tw) {
      const tw = this.tw;
      const t = Math.min(1, (w.tick - tw.t0) / tw.dur);
      const k = ease[tw.e](t);
      s.moveBy(w, (tw.ex - tw.sx) * (k - tw.last), (tw.ey - tw.sy) * (k - tw.last));
      tw.last = k;
      if (t >= 1) {
        this.tw = null;
        tw.then?.(w);
      }
      return;
    }
    if (this.treadmill) {
      const tm = this.treadmill;
      const riding = w.state === 'play' && w.standing(s);
      const dir = riding ? (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0) : 0;
      const target = -dir * tm.factor * PHYS.maxRun;
      this.v = approach(this.v, target, 1800 * DT);
      let dx = this.v * DT;
      const cur = s.x + s.xr;
      if (cur + dx < tm.minX) dx = tm.minX - cur;
      if (cur + dx > tm.maxX) dx = tm.maxX - cur;
      if (dx === 0) this.v = 0;
      s.moveBy(w, dx, 0);
      return;
    }
    if (this.path && this.path.active) {
      const p = this.path;
      if (p.wait > 0) {
        p.wait--;
        return;
      }
      const nextI = p.i + p.dir;
      if (nextI < 0 || nextI >= p.pts.length) {
        if (p.loop) {
          p.dir = (p.dir * -1) as 1 | -1;
        } else {
          p.active = false;
          return;
        }
      }
      const target = p.pts[p.i + p.dir];
      const cx = s.x + s.xr,
        cy = s.y + s.yr;
      const dx = target.x - cx,
        dy = target.y - cy;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * DT;
      if (dist <= step) {
        s.moveBy(w, dx, dy);
        p.i += p.dir;
        p.wait = secs(p.pause);
      } else s.moveBy(w, (dx / dist) * step, (dy / dist) * step);
    }
  }

  draw(ctx: Ctx, w: World) {
    const s = this.solid;
    const x = s.x + s.xr,
      y = s.y + s.yr;
    if (this.look === 'cart') {
      // a dabbawala handcart full of tiffin boxes
      fillRR(ctx, x, y, s.w, 6, 1.2, '#9C6B3C', '#5A3A1E', 0.8);
      ctx.fillStyle = '#5A3A1E';
      for (let i = 4; i < s.w; i += 8) ctx.fillRect(x + i, y + 1, 0.8, 5);
      const cols = ['#C0392B', '#F2C14E', '#2E7D32', '#2F6FB5'];
      for (let i = 0; i < Math.floor(s.w / 10); i++) {
        fillRR(ctx, x + 2 + i * 10, y + 7, 7, 5, 1.4, cols[i % 4]);
        ctx.fillStyle = '#D9D9D9';
        ctx.fillRect(x + 2 + i * 10, y + 9, 7, 0.8);
      }
      const rot = (s.x + s.xr) / 4;
      for (const wx of [x + 7, x + s.w - 7]) {
        ctx.fillStyle = '#2E2D3E';
        ctx.beginPath();
        ctx.arc(wx, y + 14, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#B9B6C9';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(wx, y + 14);
        ctx.lineTo(wx + Math.cos(rot) * 3, y + 14 + Math.sin(rot) * 3);
        ctx.stroke();
      }
      return;
    }
    // slab
    fillRR(ctx, x, y, s.w, s.h, 1.5, '#8B8798');
    ctx.fillStyle = '#6E6A80';
    ctx.fillRect(x, y + 5, s.w, s.h - 5);
    ctx.fillStyle = '#F2C14E';
    ctx.fillRect(x, y, s.w, 2);
    ctx.fillStyle = '#1F1E2A';
    for (let i = 0; i < s.w; i += 6) ctx.fillRect(x + i + 1, y + 0.3, 2.6, 1.3);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 8; i < s.w; i += 16) ctx.fillRect(x + i, y + 3, 0.8, s.h - 4);
    if (this.treadmill || this.path) {
      // little rollers so it reads as "this moves"
      ctx.fillStyle = '#2E2D3E';
      for (let i = 6; i < s.w - 4; i += 14) {
        ctx.beginPath();
        ctx.arc(x + i, y + s.h, 2.2, Math.PI, 0);
        ctx.fill();
      }
    }
    if (this.label) {
      fillRR(ctx, x + 2, y + 6, 14, 7, 1, '#F2C14E');
      text(ctx, this.label, x + 9, y + 9.7, 5, '#111', { weight: 800 });
    }
  }
}

export interface TrainDoor {
  x: number; // relative to train x
  fake?: boolean;
  exit?: boolean;
}

/** A Mumbai local. It never moves. Until you board it. */
export class Train extends Entity {
  x: number;
  y: number;
  w: number;
  h: number;
  doors: TrainDoor[];
  label: string;
  departV = 0;
  dx = 0;
  exit: ExitLike;
  hazard: Hazard;
  shake = 0;
  lastBounce = -999;
  shoveV = 520;
  /** long stages: boarding doesn't end the stage; the local takes you on to the next station (px) */
  rideTo: { x: number; y: number } | null = null;
  private riding = 0;

  constructor(tx: number, tyTop: number, wTiles: number, doors: TrainDoor[], label = '') {
    super();
    this.layer = -4;
    this.x = tx * TILE;
    this.y = tyTop * TILE;
    this.w = wTiles * TILE;
    this.h = 2.5 * TILE;
    this.doors = doors;
    this.label = label;
    const self = this;
    this.exit = {
      zone(): Rect | null {
        const d = self.doors.find((d) => d.exit);
        if (!d) return null;
        return { x: self.x + self.dx + d.x + 3, y: self.y + 8, w: 10, h: self.h - 8 };
      },
      reach(w: World) {
        if (!self.rideTo) {
          w.win('train');
          return;
        }
        if (self.riding) return;
        // aboard: off it goes, and a moment later you step out at the next station
        self.riding = 1;
        w.player.hidden = true;
        w.player.stun = 1 << 30;
        w.flags.trainRide = 1;
        w.sfx('train', self.x + self.w / 2, self.y);
        w.after(1.1, () => {
          // (the train itself is long gone by now: it never flies over the next street)
          self.alive = false;
          w.warp(self.rideTo!.x, self.rideTo!.y);
          w.player.hidden = false;
          w.player.stun = 0;
          w.flags.trainRide = 2;
          w.say('Pudhcha station! | Next station!', self.rideTo!.x, self.rideTo!.y - 30, 1.6, 'npc');
        });
      },
    };
    // Fake doors are packed: the crowd shoves you straight back out.
    this.hazard = {
      active: false,
      cause: 'crowd',
      hits: () => false,
    };
  }

  update(w: World) {
    if ((w.state === 'won' && w.winVia === 'train') || this.riding) {
      this.departV = Math.min(this.departV + 260 * DT, 340);
      this.dx += this.departV * DT;
      if (this.riding && this.dx > w.W) this.alive = false;
      return;
    }
    if (w.state !== 'play') return;
    const p = w.player;
    for (const d of this.doors) {
      if (!d.fake) continue;
      const z = { x: this.x + d.x + 2, y: this.y + 6, w: 12, h: this.h - 6 };
      if (overlapXYWH(p.x, p.y, p.w, p.h, z) && w.tick - this.lastBounce > 20) {
        this.lastBounce = w.tick;
        const dir = Math.sign(p.cx - (this.x + d.x + 8)) || -1;
        p.vx = dir * this.shoveV;
        p.carryVx = 0;
        p.vy = -280;
        p.stun = secs(0.4);
        p.onGround = false;
        p.coyoteT = 0;
        this.shake = 6;
        w.sfx('shove', p.cx, p.cy);
        w.say(this.doorLine(w), this.x + d.x + 8, this.y - 2, 1.4, 'npc');
      }
    }
    if (this.shake > 0) this.shake--;
  }

  private doorLine(w: World) {
    const lines = ['Aage chalo!', 'Jagah nahi!', 'Arre, utro!'];
    return lines[(w.tick >> 4) % lines.length];
  }

  draw(ctx: Ctx, w: World) {
    const x = this.x + this.dx;
    drawTrain(ctx, x, this.y, this.w, this.h, this.doors.map((d) => x + d.x), this.shake ? Math.sin(this.shake) * 0.6 : 0);
    for (const d of this.doors) drawTrainDoor(ctx, x + d.x, this.y + 8, !!d.fake, w.tick / 120);
    if (this.label) {
      fillRR(ctx, x + 6, this.y - 9, 34, 8, 1.4, '#111');
      text(ctx, this.label, x + 23, this.y - 4.8, 5.2, '#FFB703', { weight: 800 });
    }
  }
}

/** Monsoon flood water. Rises; you cannot swim in it. */
export class Water extends Entity {
  level: number;
  rate: number;
  startAt: number;
  minLevel: number;
  hazard: Hazard;
  t = 0;

  colors: [string, string] = ['rgba(92,120,160,0.82)', 'rgba(40,52,84,0.95)'];
  /** the water stops here (px): a long stage's dry land starts after the room's lagoon */
  x1 = Infinity;
  /** and starts here (px): a pool in the middle of a stage */
  x0 = -Infinity;

  constructor(levelTy: number, opts: { rate: number; startAt?: number; minTy: number; colors?: [string, string]; cause?: string; behind?: boolean }) {
    super();
    this.layer = opts.behind ? -5 : 5;
    if (opts.colors) this.colors = opts.colors;
    this.level = levelTy * TILE;
    this.rate = opts.rate;
    this.startAt = opts.startAt ?? 0;
    this.minLevel = opts.minTy * TILE;
    const self = this;
    this.hazard = {
      active: true,
      cause: opts.cause ?? 'flood',
      hits(x, y, w, h) {
        return x < self.x1 && x + w > self.x0 && y + h - 5 > self.level;
      },
    };
  }

  update(w: World) {
    this.t += DT;
    if (w.tick * DT >= this.startAt && this.level > this.minLevel) this.level = Math.max(this.minLevel, this.level - this.rate * DT);
  }

  draw(ctx: Ctx, w: World) {
    const y = this.level;
    if (this.x1 < Infinity || this.x0 > -Infinity) {
      const a = Math.max(-400, this.x0),
        b = Math.min(this.x1, 1e6);
      ctx.save();
      ctx.beginPath();
      ctx.rect(a, -50, b - a, ROOM_H + 120);
      ctx.clip();
      this.drawWater(ctx, w, y);
      ctx.restore();
      return;
    }
    this.drawWater(ctx, w, y);
  }

  private drawWater(ctx: Ctx, w: World, y: number) {
    const g = ctx.createLinearGradient(0, y, 0, ROOM_H);
    g.addColorStop(0, this.colors[0]);
    g.addColorStop(1, this.colors[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(-200, ROOM_H + 40);
    ctx.lineTo(-200, y);
    for (let x = -200; x <= w.W + 200; x += 8) ctx.lineTo(x, y + Math.sin(x * 0.08 + this.t * 3) * 1.3);
    ctx.lineTo(w.W + 200, ROOM_H + 40);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(220,235,255,0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = -200; x <= w.W + 200; x += 8) {
      const yy = y + Math.sin(x * 0.08 + this.t * 3) * 1.3;
      if (x === -200) ctx.moveTo(x, yy);
      else ctx.lineTo(x, yy);
    }
    ctx.stroke();
    // rain rings
    ctx.strokeStyle = 'rgba(220,235,255,0.35)';
    for (let i = 0; i < 6; i++) {
      const ph = (this.t * 0.9 + i * 0.37) % 1;
      const rx = ((i * 97 + Math.floor(this.t * 0.9 + i * 0.37) * 53) % 512) + 0.5;
      ctx.beginPath();
      ctx.ellipse(rx, y + 3, 1 + ph * 6, 0.5 + ph * 1.6, 0, 0, Math.PI * 2);
      ctx.globalAlpha = 1 - ph;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

/** Something that floats up with the flood: crates, drums, a dabba cart. */
export class Floater extends Entity {
  solid: Solid;
  water: Water;
  kind: 'crate' | 'drum' | 'cart';
  draft: number;

  constructor(water: Water, tx: number, tyTop: number, wTiles: number, kind: Floater['kind'] = 'crate') {
    super();
    this.layer = 3;
    this.water = water;
    this.kind = kind;
    const h = kind === 'drum' ? 14 : 12;
    this.draft = 5;
    const y0 = tyTop < 0 ? water.level - (h - this.draft) : tyTop * TILE;
    this.solid = new Solid(tx * TILE, y0, wTiles * TILE, h);
  }

  stuck = false;

  update(w: World) {
    const s = this.solid;
    const target = this.water.level - (s.h - this.draft);
    const cur = s.y + s.yr;
    if (target < cur - 0.01) {
      s.collidable = false;
      const blocked = !!w.solidAt(s.x, s.y - 1, s.w, 1);
      s.collidable = true;
      this.stuck = blocked;
      if (!blocked) s.moveBy(w, 0, Math.max(target - cur, -2.5));
    }
  }

  draw(ctx: Ctx) {
    const s = this.solid;
    const x = s.x + s.xr,
      y = s.y + s.yr;
    if (this.kind === 'crate') {
      fillRR(ctx, x, y, s.w, s.h, 1.2, '#B5803F', '#6B4A2E', 0.8);
      ctx.strokeStyle = '#6B4A2E';
      ctx.lineWidth = 0.7;
      for (let i = 8; i < s.w; i += 8) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + s.h);
        ctx.stroke();
      }
      text(ctx, 'FRAGILE', x + s.w / 2, y + s.h / 2 + 0.4, 4, '#5A3A1E', { weight: 800 });
    } else if (this.kind === 'drum') {
      fillRR(ctx, x, y, s.w, s.h, 3, '#2F80ED', '#1B4F91', 0.8);
      ctx.fillStyle = '#1B4F91';
      ctx.fillRect(x, y + 4, s.w, 1.2);
      ctx.fillRect(x, y + s.h - 5, s.w, 1.2);
    } else {
      fillRR(ctx, x, y, s.w, s.h - 2, 1, '#D9D2C1', '#6B6455', 0.8);
      ctx.fillStyle = '#C0392B';
      for (let i = 4; i < s.w - 4; i += 7) {
        rr(ctx, x + i, y - 3, 5, 4, 1.4);
        ctx.fill();
      }
    }
  }
}
