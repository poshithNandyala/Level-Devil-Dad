// CCU-08: adda on the rok. Old men sit on the raised brick platform outside an old house, arguing over tea.
// Stand still beside them and you've joined the adda: you can't get up until the tea seller comes by. And
// in the morning the maid sloshes a bucket of water along the rok from the door, washing it.
import { Solid } from '../../body';
import { Entity, type Hazard, type World } from '../../world';
import { DT, TILE } from '../../constants';
import { person } from '../../levels/endkit';
import { rr } from '../../../render/art/common';

/** the rok's top (px): two tiles above the lane */
export const ROK = 13 * TILE;

/** a group of old men on the rok from x0 to x1: stand still among them and they hold you */
export class Adda extends Entity {
  still = 0;
  held = false;
  heldAt = -1;
  releasedAt = -1;
  private said = false;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly n = 3,
    readonly need = 0.35,
  ) {
    super();
    this.layer = -2;
  }
  inZone(w: World) {
    const p = w.player;
    return p.onGround && p.y + p.h === ROK && p.cx > this.x0 && p.cx < this.x1;
  }
  update(w: World) {
    const p = w.player;
    if (!this.said && p.cx > this.x0 - 40) {
      this.said = true;
      w.say('Ki khobor, Dad? | What’s up, Dad?', (this.x0 + this.x1) / 2, ROK - 30, 2.4, 'npc');
    }
    if (this.held) {
      // in the adda: sat down, and going nowhere until the topic changes
      p.stun = 2;
      p.vx = 0;
      return;
    }
    if (this.inZone(w) && Math.abs(p.vx) < 5 && w.tick - this.releasedAt > 90) this.still += DT;
    else this.still = 0;
    if (this.still >= this.need) {
      this.held = true;
      this.heldAt = w.tick;
      w.flags.held = (w.flags.held ?? 0) + 1;
      w.sfx('laugh', p.cx, ROK);
    }
  }
  release(w: World) {
    if (!this.held) return;
    this.held = false;
    this.still = 0;
    this.releasedAt = w.tick;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const span = this.x1 - this.x0;
    for (let i = 0; i < this.n; i++) {
      const x = this.x0 + ((i + 0.5) * span) / this.n;
      // sitting on the rok's edge, legs over it, dhoti and kurta; one waves his hand mid-argument
      ctx.fillStyle = '#F4F1E8';
      ctx.fillRect(x - 3, ROK - 2, 6, 10);
      person(ctx, x, ROK - 16, 16, i % 2 ? '#E8E2D0' : '#D7CCB5', '#B98A62', { arms: i === 1 ? 3 + Math.sin(w.tick * 0.15) * 3 : 0 });
      ctx.fillStyle = '#B5562B';
      ctx.fillRect(x + 5, ROK - 5, 3, 4);
    }
    if (this.held && w.state === 'play') {
      const p = w.player;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      rr(ctx, p.cx - 9, p.y - 14, 18, 9, 3);
      ctx.fill();
      ctx.fillStyle = '#2B2320';
      for (let k = 0; k < 3; k++) ctx.fillRect(p.cx - 5 + k * 4, p.y - 10, 2, 2);
    }
  }
}

/** the tea seller, kettle in one hand, a stack of clay cups in the other: whoever he passes is let go */
export class TeaSeller extends Entity {
  x: number;
  active = false;
  constructor(
    x: number,
    readonly v = -70,
    readonly addas: Adda[] = [],
  ) {
    super();
    this.layer = 3;
    this.x = x;
  }
  send(x: number) {
    this.x = x;
    this.active = true;
  }
  update(w: World) {
    if (!this.active) return;
    this.x += this.v * DT;
    for (const a of this.addas) if (a.held && Math.abs(this.x - w.player.cx) < 8) a.release(w);
    if (this.x < -40 || this.x > w.W + 40) this.active = false;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    const x = this.x,
      y = ROK - 24;
    person(ctx, x, y, 24, '#8D6E63');
    // the kettle and the cups (the tell: a stack of bhanr in his hand)
    ctx.fillStyle = '#8E9399';
    rr(ctx, x - 13, y + 10, 7, 7, 2);
    ctx.fill();
    ctx.fillStyle = '#B5562B';
    for (let i = 0; i < 4; i++) ctx.fillRect(x + 6, y + 6 + i * 2.5, 5, 2);
  }
}

/** a house door on the rok at x that opens and sloshes a sheet of water along the rok towards -1 (left) */
export class Wash extends Entity {
  waves: { x: number; t: number }[] = [];
  hazard: Hazard;
  openT = -999;
  constructor(
    readonly x: number,
    readonly stop: number,
    readonly speed = 110,
  ) {
    super();
    this.layer = 2;
    this.hazard = {
      active: true,
      cause: 'ccu-dhowa',
      // the water runs along the rok's top: anything standing in it goes over the edge
      hits: (x, y, w, h) => this.waves.some((v) => x < v.x + 12 && x + w > v.x - 12 && y + h > ROK - 5 && y + h <= ROK + 1),
    };
  }
  /** open the door now: the water follows 0.5 s later */
  throw(w: World) {
    this.openT = w.tick;
    w.after(0.5, () => {
      this.waves.push({ x: this.x - 10, t: 0 });
      w.sfx('splash', this.x, ROK);
    });
  }
  update() {
    for (const v of this.waves) {
      v.x -= this.speed * DT;
      v.t += DT;
    }
    this.waves = this.waves.filter((v) => v.x > this.stop);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the door: green wooden leaves, open for a moment, the maid's bucket in it
    const open = w.tick - this.openT < 110;
    ctx.fillStyle = '#2F5D46';
    ctx.fillRect(this.x - 8, ROK - 34, 16, 34);
    if (open) {
      ctx.fillStyle = '#1C1916';
      ctx.fillRect(this.x - 6, ROK - 32, 12, 32);
      ctx.fillStyle = '#8E9399';
      ctx.fillRect(this.x - 10, ROK - 14, 7, 6);
    }
    ctx.fillStyle = '#C9A227';
    ctx.fillRect(this.x + 4, ROK - 18, 1.5, 1.5);
    for (const v of this.waves) {
      const g = ctx.createLinearGradient(v.x - 12, 0, v.x + 12, 0);
      g.addColorStop(0, 'rgba(160,210,230,0.95)');
      g.addColorStop(1, 'rgba(160,210,230,0.2)');
      ctx.fillStyle = g;
      ctx.fillRect(v.x - 12, ROK - 5, 24, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(v.x - 12, ROK - 6, 4, 2);
    }
  }
}

/** the old house behind the rok: crumbling plaster, green shutters, a balcony (drawn only) */
export class House extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = -8;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#D9C3A0';
    ctx.fillRect(this.x0, ROK - 120, this.x1 - this.x0, 120);
    ctx.fillStyle = 'rgba(120,90,60,0.25)';
    for (let x = this.x0 + 10; x < this.x1; x += 37) ctx.fillRect(x, ROK - 100 + ((x * 7) % 30), 14, 9);
    for (let x = this.x0 + 12; x < this.x1 - 16; x += 30) {
      ctx.fillStyle = '#3F7A55';
      ctx.fillRect(x, ROK - 104, 12, 20);
      ctx.fillRect(x, ROK - 66, 12, 20);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x + 5.5, ROK - 104, 1, 20);
    }
    ctx.strokeStyle = '#4A4541';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(this.x0, ROK - 78);
    ctx.lineTo(this.x1, ROK - 78);
    ctx.stroke();
  }
}

/** CCU-08: the crowd round the phuchka man. A wall of backs; it lets through only someone who has just eaten
 *  (for `open` s after), and whoever climbs on to it, or is still in it when it closes, is shoved off the rok */
export class Crowd extends Entity {
  solid: Solid;
  openUntil = -1;
  constructor(
    readonly x: number,
    readonly wd: number,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, ROK - 48, wd, 48);
    this.solid.velX = 0;
  }
  open(w: World, s: number) {
    this.openUntil = w.tick + Math.round(s * 120);
    this.solid.collidable = false;
  }
  update(w: World) {
    const p = w.player;
    const inside = p.x + p.w > this.x && p.x < this.x + this.wd && p.y + p.h > ROK - 48 && p.y < ROK;
    if (!this.solid.collidable && w.tick >= this.openUntil) {
      if (inside) return w.die('ccu-bhid');
      this.solid.collidable = true;
    }
    if (this.solid.collidable && p.onGround && p.isRiding(this.solid)) w.die('ccu-bhid');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const open = !this.solid.collidable;
    for (let k = 0; k < this.wd / 8; k++) {
      const x = this.x + k * 8 + (open ? (k % 2 ? 6 : -6) : 0);
      ctx.fillStyle = ['#7B4B3A', '#3F5E8C', '#8C6D3F', '#5E7D4A'][k % 4];
      ctx.fillRect(x, ROK - 34, 7, 34);
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.arc(x + 3.5, ROK - 40, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    void w;
  }
}
