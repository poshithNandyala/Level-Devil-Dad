// CCU-07: Howrah Bridge's porters. Head-loads move along the bridge at walking pace, in both directions and
// at two heights (a short porter, a tall one); the road under them is full of taxis. Each porter stops for
// chai at a marked chai stop (a CHA board on the girder): he sets his load down there, and on the road that
// puts you among the cars. A load coming the other way knocks you off it.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT } from '../../constants';
import { person, text } from '../../levels/endkit';
import { FLOOR } from './entities';

export const SHORT = 28;
export const TALL = 54;
const LW = 28;

export interface PorterSpec {
  /** centre x (px) and speed (px/s, negative: walking left) */
  x: number;
  v: number;
  /** the top of his load, px above the road */
  h: number;
  /** chai stops: [x where he stops (px), seconds] (Infinity: he stays there) */
  rests?: [number, number][];
  /** he sets off once this is true (default: at once) */
  go?: (w: World, me: Porter) => boolean;
  /** he walks off the bridge here (px) */
  off?: number;
  /** what he carries */
  kind?: 'basket' | 'sack' | 'books';
}

export class Porter extends Entity {
  x: number;
  load: Solid;
  hazard: Hazard;
  state: 'idle' | 'walk' | 'down' | 'rest' | 'up' | 'gone' = 'idle';
  t = 0;
  lift = 1;
  private restI = 0;
  constructor(readonly o: PorterSpec) {
    super();
    this.layer = 1;
    this.x = o.x;
    this.load = new Solid(o.x - LW / 2, FLOOR - o.h, LW, 4);
    this.load.oneWay = true;
    this.load.velX = 0;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'ccu-bojha',
      // a load coming the other way: its bundle knocks you off yours (you can't ride a load against you)
      hits: (x, y, w, h) => self.o.v < 0 && self.state !== 'gone' && x < self.load.x + LW && x + w > self.load.x && y < self.load.y + 10 && y + h > self.load.y + 1,
    };
  }
  get solid() {
    return this.load;
  }
  top() {
    return this.load.y;
  }
  riding(w: World) {
    return w.player.onGround && w.player.isRiding(this.load);
  }
  /** px to his next chai stop (Infinity if none) */
  toRest() {
    const r = this.o.rests?.[this.restI];
    return r ? (r[0] - this.x) * Math.sign(this.o.v) : Infinity;
  }
  private setTop(w: World, y: number) {
    const dy = Math.round(y) - this.load.y;
    if (dy) this.load.moveBy(w, 0, dy);
  }
  update(w: World) {
    this.t += DT;
    const r = this.o.rests?.[this.restI];
    if (this.state === 'idle') {
      this.load.velX = 0;
      if (this.o.go ? this.o.go(w, this) : true) {
        this.state = 'walk';
        this.t = 0;
      }
      return;
    }
    if (this.state === 'walk') {
      this.load.velX = this.o.v;
      this.load.moveBy(w, this.o.v * DT, 0);
      this.x = this.load.x + LW / 2;
      if (r && (this.x - r[0]) * Math.sign(this.o.v) >= 0) {
        this.state = 'down';
        this.t = 0;
        this.load.velX = 0;
        if (this.riding(w)) w.flags.cha = 1;
        w.sfx('thud', this.x, FLOOR - this.o.h);
      }
      if (this.o.off !== undefined && (this.x - this.o.off) * Math.sign(this.o.v) >= 0) {
        this.state = 'gone';
        this.load.collidable = false;
      }
    } else if (this.state === 'down') {
      // the load comes down off his head, on to the ground beside him
      this.lift = Math.max(0, 1 - this.t / 0.45);
      this.setTop(w, FLOOR - 6 - (this.o.h - 6) * this.lift);
      if (this.t >= 0.45) {
        this.state = 'rest';
        this.t = 0;
      }
    } else if (this.state === 'rest') {
      if (r && this.t >= r[1]) {
        this.state = 'up';
        this.t = 0;
      }
    } else if (this.state === 'up') {
      this.lift = Math.min(1, this.t / 0.45);
      this.setTop(w, FLOOR - 6 - (this.o.h - 6) * this.lift);
      if (this.t >= 0.45) {
        this.restI++;
        this.state = 'walk';
        this.t = 0;
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.state === 'gone') return;
    const x = this.x;
    const tall = this.o.h >= TALL;
    const bodyH = tall ? this.o.h - 10 : this.o.h - 8;
    // the porter: red shirt, a cloth coil on his head; arms up to the load while it's up
    const resting = this.state === 'rest' || this.state === 'down' || this.state === 'up';
    if (resting) person(ctx, x - 12 * Math.sign(this.o.v), FLOOR - bodyH * 0.8, bodyH * 0.8, '#B23A2E');
    else {
      const step = Math.sin(this.load.x * 0.25) * 2;
      person(ctx, x, FLOOR - bodyH, bodyH, '#B23A2E', '#9C6B48', { arms: 6 });
      ctx.fillStyle = '#2E2A36';
      ctx.fillRect(x - 3 + step, FLOOR - 3, 2, 3);
    }
    // the load
    const ly = this.load.y;
    const kind = this.o.kind ?? (this.o.v < 0 ? 'sack' : 'basket');
    if (kind === 'basket') {
      ctx.fillStyle = '#C9A66B';
      ctx.fillRect(this.load.x, ly, LW, 9);
      ctx.strokeStyle = '#8B6B3E';
      ctx.lineWidth = 1;
      for (let i = 3; i < LW; i += 5) {
        ctx.beginPath();
        ctx.moveTo(this.load.x + i, ly);
        ctx.lineTo(this.load.x + i, ly + 9);
        ctx.stroke();
      }
      ctx.fillStyle = '#E67E22';
      ctx.fillRect(this.load.x + 2, ly - 1, LW - 4, 2);
    } else if (kind === 'sack') {
      ctx.fillStyle = '#B8A27A';
      ctx.beginPath();
      ctx.ellipse(this.load.x + LW / 2, ly + 5, LW / 2 + 2, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7A6A4E';
      ctx.fillRect(this.load.x + LW / 2 - 1, ly - 1, 2, 12);
    } else {
      const sp = ['#8E2C24', '#1D5C96', '#2E7D32', '#C9A227'];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = sp[(i + Math.round(this.o.x / 16)) % 4];
        ctx.fillRect(this.load.x + (i % 2), ly + i * 3, LW - 1, 3);
      }
      ctx.strokeStyle = '#E8E2D0';
      ctx.beginPath();
      ctx.moveTo(this.load.x + LW / 2, ly);
      ctx.lineTo(this.load.x + LW / 2, ly + 9);
      ctx.stroke();
    }
  }
}

/** a chai stop board on the bridge's girder at x: where the porters set their loads down */
export class ChaiBoard extends Entity {
  constructor(
    readonly x: number,
    readonly safe = false,
  ) {
    super();
    this.layer = -5;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const y = FLOOR - 92;
    ctx.fillStyle = '#5A4A3A';
    ctx.fillRect(this.x - 1, y + 10, 2, 82);
    ctx.fillStyle = this.safe ? '#2E7D32' : '#B5651D';
    ctx.fillRect(this.x - 14, y, 28, 12);
    text(ctx, 'CHA', this.x, y + 6.5, 7, '#FFF8E1');
    // a clay cup on a ledge, and a kettle
    ctx.fillStyle = '#B5562B';
    ctx.fillRect(this.x + 6, y + 22, 4, 5);
    ctx.fillStyle = '#6D6A64';
    ctx.fillRect(this.x - 10, y + 21, 7, 6);
  }
}

/** Howrah Bridge's carriageway between x0 and x1: yellow taxis nose to tail; touch the road and that's it */
export class Road extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly cause: (w: World) => string,
  ) {
    super();
    this.layer = -1;
  }
  update(w: World) {
    const p = w.player;
    if (p.y + p.h > FLOOR - 12 && p.x + p.w > this.x0 + 2 && p.x < this.x1 - 2) w.die(this.cause(w));
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    ctx.fillStyle = 'rgba(60,58,56,0.55)';
    ctx.fillRect(this.x0, FLOOR - 12, this.x1 - this.x0, 12);
    // taxis, the old boxy yellow kind, streaming past (drawn in the carriageway, under the porters)
    const off = (w.tick * 2.2) % 72;
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x0, FLOOR - 20, this.x1 - this.x0, 20);
    ctx.clip();
    for (let x = this.x0 - 72 + off; x < this.x1; x += 72) {
      ctx.fillStyle = '#F2C14E';
      ctx.fillRect(x, FLOOR - 11, 30, 8);
      ctx.fillRect(x + 6, FLOOR - 17, 17, 7);
      ctx.fillStyle = '#2B2320';
      ctx.fillRect(x + 4, FLOOR - 3, 5, 3);
      ctx.fillRect(x + 21, FLOOR - 3, 5, 3);
      ctx.fillStyle = '#C7DCE8';
      ctx.fillRect(x + 8, FLOOR - 16, 6, 4);
      ctx.fillRect(x + 15, FLOOR - 16, 6, 4);
    }
    ctx.restore();
  }
}

/** the bridge's girders across the frame from x0 to x1 (drawn behind) */
export class Girders extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = -7;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = 'rgba(90,100,110,0.85)';
    ctx.lineWidth = 3;
    const top = FLOOR - 110;
    ctx.beginPath();
    ctx.moveTo(this.x0, top);
    ctx.lineTo(this.x1, top);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let x = this.x0; x < this.x1; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x + 24, FLOOR - 14);
      ctx.lineTo(x + 48, top);
      ctx.stroke();
    }
  }
}
