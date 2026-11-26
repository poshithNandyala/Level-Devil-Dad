// DIS-03: the tea pluckers, their hedges and the sprinkler. Deterministic: everything runs off the tick and Dad's position.
import { Entity, type Hazard, type World } from '../../world';
import { DT, overlapXYWH } from '../../constants';
import { person } from '../../levels/endkit';
import { GROUND, Slab, px, smoothstep } from './entities';

/** a tall tea hedge: four tiles of unplucked bush that nobody can jump; once plucked it is one step high */
export class Hedge extends Entity {
  slab: Slab;
  readonly x0: number;
  readonly x1: number;
  h = 64;
  private lowerAt = -1;
  constructor(tx: number, readonly wTiles = 3) {
    super();
    this.x0 = px(tx);
    this.x1 = px(tx + wTiles);
    this.slab = new Slab(this.x0, GROUND - 64, px(wTiles), 64, (ctx, s) => this.paintHedge(ctx, s), 0);
  }
  /** the plucker starts picking it now: it steps down over the next half second */
  lower(w: World) {
    if (this.lowerAt < 0) {
      this.lowerAt = w.tick;
      w.sfx('snap', this.x0 + 24, GROUND - 40);
    }
  }
  update(w: World) {
    if (this.lowerAt >= 0 && this.h > 16) {
      const k = smoothstep((w.tick - this.lowerAt) / 70);
      this.h = Math.round(64 - 48 * k);
      this.slab.solid.y = GROUND - this.h;
      this.slab.solid.h = this.h;
    }
  }
  private paintHedge(ctx: CanvasRenderingContext2D, s: Slab) {
    const { x, y, w, h } = s.solid;
    ctx.fillStyle = '#2F6B34';
    ctx.fillRect(x, y + 3, w, h - 3);
    ctx.fillStyle = '#4C8C3A';
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.quadraticCurveTo(x + w / 2, y - 3, x + w, y + 6);
    ctx.lineTo(x + w, y + 10);
    ctx.lineTo(x, y + 10);
    ctx.fill();
    ctx.fillStyle = '#7CB342';
    for (let i = 0; i < w; i += 6) ctx.fillRect(x + i + 1, y + 2 + ((i * 7) % 4), 2, 2);
    if (h > 40) {
      ctx.fillStyle = '#B5E068';
      for (let i = 4; i < w; i += 9) ctx.fillRect(x + i, y - 1, 2, 3);
    }
  }
}

/**
 * A plucker walking the garden path with her basket on her back. She walks right at `speed`; at each tall hedge she stops a
 * little short of it, bends and picks, swinging the basket round her (that swing is deadly), and the hedge steps down to one
 * tile. Touching her on the way is deadly too. She starts walking when Dad passes `from`. At the end she stops (`onEnd`).
 */
export class Plucker extends Entity {
  x: number;
  y = GROUND;
  i = 0;
  phase: 'wait' | 'walk' | 'pluck' | 'end' = 'wait';
  t = 0;
  hazard: Hazard;
  onEnd?: (w: World) => void;
  constructor(
    x: number,
    readonly from: number,
    readonly hedges: Hedge[],
    readonly endX: number,
    readonly speed = 32,
  ) {
    super();
    this.x = x;
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'dis-basket',
      hits(x2, y2, w2, h2) {
        if (!self.alive || self.phase === 'end' || self.phase === 'wait') return false;
        const top = self.y - 26;
        if (overlapXYWH(x2, y2, w2, h2, { x: self.x - 8, y: top, w: 16, h: 26 })) return true;
        return self.swinging && overlapXYWH(x2, y2, w2, h2, { x: self.x - 32, y: top - 4, w: 64, h: 30 });
      },
    };
  }
  get swinging() {
    return this.phase === 'pluck' && this.t >= 20 && this.t <= 130;
  }
  private floor() {
    let h = 0;
    for (const hd of this.hedges) if (this.x >= hd.x0 && this.x <= hd.x1) h = Math.max(h, hd.h);
    return GROUND - h;
  }
  update(w: World) {
    if (this.phase === 'wait' && w.player.cx >= this.from) this.phase = 'walk';
    if (this.phase === 'walk') {
      this.x += this.speed * DT;
      const hd = this.hedges[this.i];
      if (hd && this.x >= hd.x0 - 14) {
        this.phase = 'pluck';
        this.t = 0;
      } else if (!hd && this.x >= this.endX) {
        this.phase = 'end';
        this.onEnd?.(w);
      }
    } else if (this.phase === 'pluck') {
      this.t++;
      const hd = this.hedges[this.i];
      if (this.t === 40) hd.lower(w);
      if (this.t === 22) w.sfx('whistle', this.x, this.y - 20);
      if (this.t >= 150) {
        this.phase = 'walk';
        this.i++;
      }
    }
    this.y = this.floor();
  }
  draw(ctx: CanvasRenderingContext2D) {
    const x = this.x;
    const y = this.y;
    person(ctx, x, y - 25, 25, '#E8E1CC', '#B9855A', { arms: this.phase === 'pluck' ? 4 : 0 });
    ctx.fillStyle = '#C9A253';
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 20);
    ctx.lineTo(x, y - 32);
    ctx.lineTo(x + 9, y - 20);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#C1121F';
    ctx.fillRect(x - 6, y - 21, 12, 1.6);
    let bx = x - 9;
    let by = y - 18;
    if (this.swinging) {
      const a = ((this.t - 20) / 110) * Math.PI * 4;
      bx = x + Math.cos(a) * 26;
      by = y - 14 + Math.sin(a) * 3;
      ctx.strokeStyle = '#6A4B1C';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.fillStyle = '#8D6B2E';
    ctx.fillRect(bx - 5, by - 3, 10, 9);
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(bx - 5, by - 3, 10, 2);
    ctx.fillStyle = '#9CCC4F';
    ctx.fillRect(bx - 4, by - 5, 8, 3);
  }
}

/**
 * A sprinkler pipe over the path. Once Dad has passed `from` it runs rounds: it sprays (`on` ticks), the path stays wet and
 * slippery for `wet` ticks more, then dries for `dry`. Slippery: Dad can't stop or turn quickly on it.
 */
export class Sprinkler extends Entity {
  state: 'idle' | 'on' | 'wet' | 'dry' = 'idle';
  t = 0;
  private base: any = null;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly from: number,
    readonly on = 300,
    readonly wet = 300,
    readonly dry = 500,
  ) {
    super();
    this.layer = 4;
  }
  get slippery() {
    return this.state === 'on' || this.state === 'wet';
  }
  update(w: World) {
    const p = w.player;
    if (this.state === 'idle' && p.cx >= this.from) {
      this.state = 'on';
      this.t = 0;
      w.sfx('splash', this.x0 + 24, GROUND - 30);
    }
    if (this.state !== 'idle') {
      this.t++;
      if (this.state === 'on' && this.t >= this.on) {
        this.state = 'wet';
        this.t = 0;
      } else if (this.state === 'wet' && this.t >= this.wet) {
        this.state = 'dry';
        this.t = 0;
      } else if (this.state === 'dry' && this.t >= this.dry) {
        this.state = 'on';
        this.t = 0;
        w.sfx('splash', this.x0 + 24, GROUND - 30);
      }
    }
    if (this.base === null) this.base = p.phys;
    const inside = p.onGround && p.cx >= this.x0 && p.cx <= this.x1 && this.slippery;
    p.phys = inside ? { ...this.base, accelGround: this.base.wetAccel, decelGround: this.base.wetDecel, turnGround: this.base.wetAccel } : this.base;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const y = GROUND - 44;
    ctx.fillStyle = '#6A6F73';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 3);
    ctx.fillRect(this.x0, y, 3, 44);
    ctx.fillRect(this.x1 - 3, y, 3, 44);
    if (this.state === 'on') {
      ctx.strokeStyle = 'rgba(190,225,240,0.8)';
      ctx.lineWidth = 1;
      for (let x = this.x0 + 8; x < this.x1 - 4; x += 10) {
        for (let k = 0; k < 3; k++) {
          const ph = ((w.tick + k * 7 + x) % 21) / 21;
          ctx.beginPath();
          ctx.moveTo(x, y + 3);
          ctx.lineTo(x + (k - 1) * 4 * ph, y + 3 + ph * 38);
          ctx.stroke();
        }
      }
    }
    if (this.slippery) {
      ctx.fillStyle = 'rgba(70,110,130,0.45)';
      ctx.fillRect(this.x0, GROUND - 2, this.x1 - this.x0, 2);
    }
  }
}
