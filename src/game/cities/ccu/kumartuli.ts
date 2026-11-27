// CCU-05: Kumartuli, the potters' lane on the Hooghly. Clay figures (horses, people: never deities) stand on
// their plinths over the ghat's mud. Each is being painted from the feet up, and the paint line IS the
// clock: when it reaches the crown the figure is finished, and the men carry it out of the lane. A figure
// not yet painted is dry pale clay: land on it from a height and its top layer cracks away under you.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { person } from '../../levels/endkit';
import { FLOOR } from './entities';

export interface FigureSpec {
  x: number;
  /** height in tiles above the road (its top is where you stand) */
  h: number;
  /** paint already on at the start (0..1) and how fast it climbs (fraction a second); 0: dry, unpainted */
  paint?: number;
  rate?: number;
  look?: 'horse' | 'man' | 'woman';
}

export class Figure extends Entity {
  solid: Solid;
  paint: number;
  gone = false;
  cracked = false;
  started = false;
  liftT = -1;
  private wasRiding = false;
  private airTop = Infinity;
  constructor(readonly o: FigureSpec) {
    super();
    this.layer = 1;
    this.paint = o.paint ?? 0;
    this.solid = new Solid(o.x, FLOOR - o.h * TILE, 2 * TILE, o.h * TILE + 48);
    this.solid.velX = 0;
  }
  get dry() {
    return !this.o.rate;
  }
  top() {
    return this.solid.y;
  }
  riding(w: World) {
    return w.player.onGround && w.player.isRiding(this.solid);
  }
  update(w: World) {
    const p = w.player;
    if (this.gone) return;
    if (this.started && this.o.rate) this.paint = Math.min(1, this.paint + this.o.rate * DT);
    // finished: the men carry it out of the lane, whoever is on it
    if (this.paint >= 1 && this.liftT < 0) {
      this.liftT = 0;
      if (this.riding(w)) w.flags.carried = 1;
      w.sfx('creak', this.o.x + 16, this.top());
    }
    if (this.liftT >= 0) {
      this.liftT += DT;
      if (this.liftT > 0.25) {
        this.solid.collidable = false;
        this.gone = true;
      }
      return;
    }
    // how high did Dad come down from? a dry figure cracks under a landing from more than a tile up
    if (!p.onGround) this.airTop = Math.min(this.airTop, p.y + p.h);
    const r = this.riding(w);
    if (r && !this.wasRiding && this.dry && !this.cracked && this.top() - this.airTop > 22) {
      this.cracked = true;
      w.flags.cracked = 1;
      w.sfx('snap', p.cx, this.top());
      w.emit('fx', p.cx, this.top(), { kind: 'dust' });
      this.solid.collidable = false;
      this.gone = true;
      p.coyoteT = 0;
    }
    if (p.onGround) this.airTop = Infinity;
    this.wasRiding = r;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.gone && !(this.liftT >= 0 && this.liftT < 0.6)) {
      if (this.cracked) {
        ctx.fillStyle = 'rgba(214,200,170,0.8)';
        for (let i = 0; i < 4; i++) ctx.fillRect(this.o.x + 4 + i * 7, FLOOR + 4 + (i % 2) * 3, 5, 3);
      }
      return;
    }
    const x = this.o.x,
      top = this.top() - (this.liftT > 0 ? this.liftT * 60 : 0),
      wd = 2 * TILE,
      h = this.o.h * TILE;
    // the plinth: bamboo frame and straw
    ctx.fillStyle = '#8B6B3E';
    ctx.fillRect(x - 1, FLOOR - 6, wd + 2, 6);
    const clay = this.dry ? '#D8C7A4' : '#8C7A6B';
    ctx.fillStyle = clay;
    const look = this.o.look ?? 'man';
    if (look === 'horse') {
      ctx.fillRect(x + 1, top + 6, wd - 2, h * 0.5);
      ctx.fillRect(x + wd - 8, top, 7, 10);
      ctx.fillRect(x + 3, top + 6 + h * 0.5, 4, h * 0.5 - 12);
      ctx.fillRect(x + wd - 7, top + 6 + h * 0.5, 4, h * 0.5 - 12);
    } else {
      ctx.fillRect(x + 4, top + 8, wd - 8, h - 14);
      ctx.beginPath();
      ctx.arc(x + wd / 2, top + 5, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x + 1, top + 12, wd - 2, 4);
    }
    // a dark outline so the figure reads against the lane behind
    ctx.strokeStyle = '#3B2A1E';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x + 0.5, top + 0.5, wd - 1, FLOOR - 6 - top);
    // its standing top (where Dad goes): a flat headpiece or saddle
    ctx.fillStyle = this.dry ? '#E8DCC0' : '#7A6A5C';
    ctx.fillRect(x, top, wd, 3);
    if (this.dry) {
      ctx.strokeStyle = 'rgba(140,110,80,0.6)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + 6, top + 2);
      ctx.lineTo(x + 10, top + 9);
      ctx.lineTo(x + 8, top + 14);
      ctx.moveTo(x + 20, top + 3);
      ctx.lineTo(x + 24, top + 10);
      ctx.stroke();
    } else {
      // the paint, from the feet up: bright colours below the line, a painter at work on it
      const ph = h * this.paint;
      const py = FLOOR - 6 - ph;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x - 2, py, wd + 4, ph);
      ctx.clip();
      ctx.fillStyle = look === 'horse' ? '#F4F1E8' : '#C62828';
      ctx.fillRect(x, top, wd, h);
      ctx.fillStyle = '#F2C14E';
      for (let y = FLOOR - 10; y > top; y -= 9) ctx.fillRect(x, y, wd, 2);
      ctx.restore();
      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(x - 2, py - 1, wd + 4, 1.5);
      // the waist mark: past it, he's nearly done
      ctx.fillStyle = 'rgba(43,35,32,0.35)';
      ctx.fillRect(x - 3, FLOOR - 6 - h / 2, 3, 1);
      if (this.started && this.paint < 1) person(ctx, x + wd + 7, FLOOR - 20, 20, '#6D4C41', '#9C6B48', { arms: 8 });
    }
    void w;
  }
}

/** the ghat's mud and the river under the lane: deadly */
export class Ghat extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = 4;
  }
  update(w: World) {
    const p = w.player;
    if (p.y + p.h > FLOOR + 10 && p.x + p.w > this.x0 && p.x < this.x1) w.die(w.flags.cracked ? 'ccu-phata' : w.flags.carried ? 'ccu-murti' : 'ccu-ganga');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const g = ctx.createLinearGradient(0, FLOOR + 6, 0, FLOOR + 48);
    g.addColorStop(0, 'rgba(110,84,58,0.98)');
    g.addColorStop(1, 'rgba(60,78,84,1)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, FLOOR + 6, this.x1 - this.x0, 60);
    ctx.fillStyle = 'rgba(200,190,160,0.35)';
    for (let x = this.x0 + ((w.tick >> 4) % 18); x < this.x1 - 6; x += 18) ctx.fillRect(x, FLOOR + 7, 6, 1);
  }
}

/** the lane's biggest figure, nearly painted: stand on its head; when the paint reaches the crown four men
 *  carry it out (to the right) and set it down at `stopX`, whoever is on top coming along */
export class BigFigure extends Entity {
  paint = 0.55;
  x: number;
  state: 'wait' | 'paint' | 'carry' | 'down' = 'wait';
  solid: Solid;
  stopX = Infinity;
  constructor(
    x: number,
    readonly rate = 0.2,
  ) {
    super();
    this.layer = 3;
    this.x = x;
    this.solid = new Solid(x, FLOOR - 64, 40, 64);
    this.solid.velX = 0;
  }
  riding(w: World) {
    return w.player.onGround && w.player.isRiding(this.solid);
  }
  update(w: World) {
    if (this.state === 'paint') {
      this.paint = Math.min(1, this.paint + this.rate * DT);
      if (this.paint >= 1) {
        this.state = 'carry';
        w.flags.twist = 'carry';
        w.sfx('creak', this.x, FLOOR - 40);
      }
    } else if (this.state === 'carry') {
      const v = 45;
      this.solid.velX = v;
      this.solid.moveBy(w, v * DT, 0);
      this.x = this.solid.x;
      if (this.x >= this.stopX) {
        this.state = 'down';
        this.solid.velX = 0;
        w.flags.twist = 'down';
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const x = this.x;
    const top = this.solid.y;
    ctx.fillStyle = '#8C7A6B';
    ctx.fillRect(x + 6, top + 14, 28, 50);
    ctx.beginPath();
    ctx.arc(x + 20, top + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 4, top, 32, 3);
    const ph = 64 * this.paint;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, top + 64 - ph, 40, ph);
    ctx.clip();
    ctx.fillStyle = '#1D5C96';
    ctx.fillRect(x + 6, top + 14, 28, 50);
    ctx.fillStyle = '#F2C14E';
    ctx.beginPath();
    ctx.arc(x + 20, top + 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 4, top, 32, 3);
    ctx.restore();
    ctx.strokeStyle = '#3B2A1E';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(x + 6.5, top + 14.5, 27, 49);
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(x + 2, top + 64 - ph - 1, 36, 1.5);
    // the bamboo stretcher and its carriers
    ctx.fillStyle = '#8B6B3E';
    ctx.fillRect(x - 8, top + 60, 56, 3);
    if (this.state === 'carry') {
      person(ctx, x - 6, FLOOR - 24, 24, '#B23A2E');
      person(ctx, x + 46, FLOOR - 24, 24, '#B23A2E');
    } else if (this.state !== 'down') person(ctx, x + 50, FLOOR - 20, 20, '#6D4C41', '#9C6B48', { arms: 8 });
  }
}

