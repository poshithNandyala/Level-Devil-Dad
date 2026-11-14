// Acts: each long stage's own sections after its room. Unlike the old shared sections, every act is
// written for one stage, used once in the whole game, and built around one idea that turns what the
// player has learned so far upside down (teach it, then break it).
import { Entity, type Hazard, type World } from '../world';
import { DT, TILE } from '../constants';
import type { Grid } from './grid';
import type { TileGroup } from '../entities/group';
import { Water } from '../entities/mumbai';
import { Thing } from '../entities/traps';
import type { ThingKind } from '../../render/art/things';
import { group, px } from './kit';

export interface ActCtx {
  /** first column of the act */
  x: number;
  /** five free lowercase letters (moving tiles) and four free uppercase letters (pop-up spikes) */
  L: string;
  U: string;
  id: number;
  /** tile column (relative to the act) -> world px */
  X: (t: number) => number;
  /** a flag name private to this act */
  f: (k: string) => string;
}

export interface Act {
  /** unique in the whole game; the test route for it is keyed by this */
  id: string;
  /** columns */
  w: number;
  paint?: (g: Grid, c: ActCtx) => void;
  build?: (w: World, c: ActCtx) => void;
  /** one line for the stage's hint */
  advice: string;
  /** extra hidden checkpoints (columns relative to the act) */
  cps?: number[];
  /** a hidden checkpoint at the act's first column (default: yes) */
  cp0?: boolean;
}

export const G = 15;

/** A group of tiles that starts invisible and not solid (call `appear` to bring it in). */
export function hiddenGroup(w: World, letter: string): TileGroup {
  const g = group(w, letter);
  g.solid.collidable = false;
  g.visible = false;
  g.state = 'gone';
  return g;
}

/** Water between two columns (a lagoon, a pothole, a tank): deadly below its surface. */
export function pool(w: World, tx0: number, tx1: number, levelTy: number, o: { colors?: [string, string]; cause?: string; behind?: boolean } = {}): Water {
  const wt = w.add(new Water(levelTy, { rate: 0, minTy: levelTy, colors: o.colors, cause: o.cause ?? 'splash', behind: o.behind }));
  wt.x0 = px(tx0);
  wt.x1 = px(tx1);
  return wt;
}

/** A sprite standing on ground row `tyGround`, not solid (decoration or a hazard). */
export function deco(w: World, kind: ThingKind, x: number, tyGround: number, o: { deadly?: string; layer?: number; w?: number; h?: number; tint?: string } = {}): Thing {
  const t = new Thing(kind, x, 0, { solid: false, deadly: o.deadly, layer: o.layer ?? -3, w: o.w, h: o.h, tint: o.tint });
  t.solid.y = px(tyGround) - t.solid.h;
  return w.add(t);
}

/** true while Dad is on the ground or has just walked off an edge (not jumped) */
export function walking(w: World): boolean {
  const p = w.player;
  return p.onGround || (!p.jumping && p.airTicks <= 14 && w.tick - p.jumpTick > 40);
}

// ------------------------------------------------------------------ small pieces some acts share the look of

/** Heat haze drawn as road: looks like the ground, isn't (the hole under it is real). */
export class Shimmer extends Entity {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly top: string,
    readonly body: string,
  ) {
    super();
    this.layer = -1;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    for (let i = 0; i < 6; i++) {
      const yy = this.y + i * 2.6;
      const wob = Math.sin(t * 7 + i * 1.3) * 1.4;
      ctx.globalAlpha = 0.85 - i * 0.12;
      ctx.fillStyle = i === 0 ? this.top : this.body;
      ctx.fillRect(this.x + wob, yy, this.w, 2.6);
    }
    ctx.globalAlpha = 1;
  }
}

/** A dark patch painted on the road: looks like a hole, is solid. */
export class Decal extends Entity {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
  ) {
    super();
    this.layer = -1;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const g = ctx.createLinearGradient(0, this.y, 0, this.y + this.h);
    g.addColorStop(0, '#120A08');
    g.addColorStop(1, 'rgba(18,10,8,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x, this.y - 0.5, this.w, this.h + 0.5);
  }
}

/** A firecracker string's explosion front: runs along the ground, burns everything it reaches. */
export class Blast extends Entity {
  y: number;
  w = 18;
  h = 18;
  hazard: Hazard;
  private pop = 0;
  constructor(
    public x: number,
    yGround: number,
    public vx: number,
    readonly stopAt: number,
  ) {
    super();
    this.y = yGround - this.h;
    this.layer = 4;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'burnt',
      hits(x, y, w, h) {
        return self.alive && x < self.x + self.w - 3 && x + w > self.x + 3 && y < self.y + self.h && y + h > self.y + 4;
      },
    };
  }
  update(w: World) {
    if (!this.alive) return;
    this.x += this.vx * DT;
    if ((this.vx < 0 && this.x <= this.stopAt) || (this.vx > 0 && this.x >= this.stopAt)) {
      this.alive = false;
      this.hazard.active = false;
      w.emit('fx', this.x + 9, this.y + 9, { kind: 'poof', w: 18, h: 18 });
      return;
    }
    if (++this.pop % 9 === 0) {
      w.sfx('snap', this.x + 9, this.y + 9);
      w.emit('fx', this.x + 9, this.y + 6, { kind: 'sparkle' });
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.alive) return;
    const t = w.tick;
    const cx = this.x + 9,
      cy = this.y + 11;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + t * 0.3;
      const r = 6 + ((t * 3 + i * 5) % 7);
      ctx.strokeStyle = i % 2 ? '#FFD54F' : '#FF7043';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.8);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,240,200,0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + (t % 4), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(90,80,80,0.35)';
    ctx.beginPath();
    ctx.arc(cx - Math.sign(this.vx) * 10, cy - 8, 7, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The firecracker string itself, lying along the ground; burnt behind a blast. */
export class Ladi extends Entity {
  burnt0 = Infinity;
  burnt1 = -Infinity;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y: number,
  ) {
    super();
    this.layer = -1;
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (let x = this.x0; x < this.x1; x += 5) {
      const burnt = x >= this.burnt0 && x <= this.burnt1;
      ctx.fillStyle = burnt ? '#3E2723' : x % 10 === 0 ? '#D32F2F' : '#F9A825';
      ctx.fillRect(x, this.y - (burnt ? 1.5 : 4), 3, burnt ? 1.5 : 4);
    }
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(this.x0, this.y - 1, this.x1 - this.x0, 1);
  }
}

export const T = TILE;
