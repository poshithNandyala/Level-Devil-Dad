// Ranchi's (and Jharkhand's) moving parts: the weekly haat's barter, Hundru's plunge pools that
// fill and empty with the falls, the one-way mouths of woven bamboo fish traps, the Pahan's pot of
// water that spills when you jump, Dokra's poured brass that has to cool, and the Chhau dancer who
// strikes whatever wears a face.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT, overlapXYWH, secs, TILE } from '../constants';
import { Thing } from './traps';

export const FLOOR = 15 * TILE;
export const MASK = 'maskCarried';
export const carried = (w: World) => (w.flags.carry as Carry | null) ?? null;
export const setCarried = (w: World, k: Carry | null) => {
  w.flags.carry = k;
};
export type Carry = 'dhuska' | 'dona';

// ------------------------------------------------------------------ the haat
/** Something for sale on a sal-leaf plate: a dhuska, or the plate itself once the food is gone. */
export class Plate extends Entity {
  taken = false;
  constructor(
    readonly kind: Carry,
    readonly x: number,
    readonly y: number,
  ) {
    super();
    this.layer = 2;
  }
  update(w: World) {
    if (this.taken || w.state !== 'play' || carried(w)) return;
    const p = w.player;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x - 2, y: this.y - 2, w: 18, h: 16 })) return;
    this.taken = true;
    this.alive = false;
    setCarried(w, this.kind);
    w.sfx('pop', this.x + 7, this.y + 6);
    w.emit('fx', this.x + 7, this.y + 6, { kind: 'sparkle' });
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.taken) return;
    const bob = Math.sin(w.tick * 0.08 + this.x) * 1.2;
    // the sal-leaf plate
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath();
    ctx.ellipse(this.x + 7, this.y + 9 + bob, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#558B2F';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    if (this.kind === 'dhuska') {
      ctx.fillStyle = '#E8A33D';
      ctx.beginPath();
      ctx.ellipse(this.x + 7, this.y + 6 + bob, 5, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#C97B22';
      ctx.fillRect(this.x + 4, this.y + 5 + bob, 6, 0.9);
    }
  }
}

/** What Dad is carrying, drawn at his side. */
export class Hands extends Entity {
  constructor() {
    super();
    this.layer = 6;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const k = carried(w);
    if (!k) return;
    const p = w.player;
    const x = p.cx + (p.facing > 0 ? 7 : -7);
    const y = p.y + 7;
    ctx.fillStyle = '#8BC34A';
    ctx.beginPath();
    ctx.ellipse(x, y + 3, 5, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    if (k === 'dhuska') {
      ctx.fillStyle = '#E8A33D';
      ctx.beginPath();
      ctx.ellipse(x, y + 1.4, 3.4, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** A haat stall: it takes one kind of thing and lays down what it gives at its own lay-by. */
export class Stall extends Entity {
  used = false;
  trades = 0;
  constructor(
    readonly want: Carry,
    readonly cx: number,
    readonly groundY: number,
    readonly layX: number,
    readonly layW: number,
    readonly label: string,
  ) {
    super();
    this.layer = -6;
  }
  update(w: World) {
    if (this.used || w.state !== 'play') return;
    const p = w.player;
    if (!p.onGround || Math.abs(p.cx - this.cx) > 20) return;
    if (carried(w) !== this.want) return;
    this.used = true;
    setCarried(w, null);
    this.trades++;
    w.flags.stallTrades = (w.flags.stallTrades ?? 0) + 1;
    w.add(new Thing('plank', this.layX, this.groundY, { w: this.layW, h: 8, layer: 1 }));
    w.sfx('thud', this.cx, this.groundY - 18);
    w.say(this.want === 'dhuska' ? 'Le, paat! | Here, take it!' : 'Dona badiya he! | Good leaf plate!', this.cx, this.groundY - 36, 1.3, 'npc');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.cx;
    const y = this.groundY;
    // counter
    ctx.fillStyle = '#7B5E3B';
    ctx.fillRect(x - 15, y - 14, 30, 14);
    ctx.fillStyle = '#A0784A';
    ctx.fillRect(x - 16, y - 17, 32, 4);
    // canopy on two poles
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - 16, y - 44, 2, 28);
    ctx.fillRect(x + 14, y - 44, 2, 28);
    ctx.fillStyle = this.want === 'dhuska' ? '#E8A33D' : '#7CB342';
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 42);
    ctx.lineTo(x + 20, y - 42);
    ctx.lineTo(x + 16, y - 37);
    ctx.lineTo(x - 16, y - 37);
    ctx.closePath();
    ctx.fill();
    // the sign: what he takes, under what he gives
    ctx.font = '800 5px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFDE7';
    ctx.fillText(this.used ? 'BAND' : this.label, x, y - 30);
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(x - 13, y - 27, 26, 0.8);
    ctx.fillStyle = '#4E342E';
    ctx.font = '700 4px monospace';
    ctx.fillText(this.want === 'dhuska' ? 'DHUSKA' : 'DONA', x, y - 22);
    if (!this.used && w.tick % 60 < 30) {
      ctx.fillStyle = '#FFD54F';
      ctx.beginPath();
      ctx.arc(x, y - 18, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ------------------------------------------------------------------ Hundru
/**
 * A plunge pool in a gorge. While it is full it is the only soft landing down there; when the
 * falls thin it drains and the rock under it is bare. `always` pins it full (1) or dry (0).
 */
export class Plunge extends Entity {
  hazard: Hazard;
  level = 0;
  target = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly floorY: number,
    readonly period = 5,
    readonly duty = 0.6,
    readonly phase = 0,
    public always: 0 | 1 | null = null,
  ) {
    super();
    this.layer = 4;
    this.level = always === 1 ? 1 : 0;
    this.target = this.level;
    const self = this;
    this.hazard = {
      active: this.level < 0.6,
      cause: 'rocks',
      hits: (x, y, w, h) => self.level < 0.6 && overlapXYWH(x, y, w, h, { x: self.x0 + 2, y: self.floorY - 7, w: self.x1 - self.x0 - 4, h: 10 }),
    };
  }
  get full() {
    return this.target === 1;
  }
  update(w: World) {
    if (this.always !== null) this.target = this.always;
    else {
      const k = ((((w.tick * DT) / this.period + this.phase) % 1) + 1) % 1;
      this.target = k < this.duty ? 1 : 0;
    }
    this.level += (this.target - this.level) * Math.min(1, DT * 9);
    if (this.level < 0.02) this.level = 0;
    if (this.level > 0.98) this.level = 1;
    // the bare rock is shards: it bites the fall, not the standing. Land in a dry basin and it has you;
    // step around in one after the water has gone and you are only cold.
    this.hazard.active = false;
    if (this.level < 0.6 && w.state === 'play') {
      const p = w.player;
      if (p.vy > 150 && overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x0 + 2, y: this.floorY - 20, w: this.x1 - this.x0 - 4, h: 20 })) w.die('rocks');
    }
    w.flags.pools = (w.flags.pools ?? 0) + 1;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const top = this.floorY - 26 * this.level;
    if (this.level > 0.03) {
      const g = ctx.createLinearGradient(0, top, 0, this.floorY);
      g.addColorStop(0, 'rgba(150,215,225,0.86)');
      g.addColorStop(1, 'rgba(30,105,135,0.94)');
      ctx.fillStyle = g;
      ctx.fillRect(this.x0, top, this.x1 - this.x0, this.floorY - top);
      ctx.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 1;
      for (let x = this.x0 + ((w.tick * 0.4) % 14); x < this.x1 - 5; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, top + 1);
        ctx.lineTo(x + 5, top + 1);
        ctx.stroke();
      }
      // spray where the fall lands
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      for (let i = 0; i < 5; i++) {
        const px2 = this.x0 + ((i * 37 + w.tick * 0.9) % (this.x1 - this.x0));
        ctx.fillRect(px2, top - 3 - (i % 3) * 2, 2, 2);
      }
    } else {
      // bare wet rock and the sharp shards of it
      ctx.fillStyle = '#5B5E63';
      ctx.fillRect(this.x0, this.floorY - 7, this.x1 - this.x0, 7);
      ctx.fillStyle = '#8E9296';
      for (let x = this.x0 + 3; x < this.x1 - 4; x += 9) {
        ctx.beginPath();
        ctx.moveTo(x, this.floorY - 6);
        ctx.lineTo(x + 3, this.floorY - 12);
        ctx.lineTo(x + 6, this.floorY - 6);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
}

/** The white column of a fall, drawn behind everything. Not a hazard: water here only pushes. */
export class FallCurtain extends Entity {
  constructor(
    readonly x: number,
    readonly topY: number,
    readonly botY: number,
    readonly width = 22,
    public on = 1,
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.on) return;
    ctx.fillStyle = 'rgba(226,244,248,0.72)';
    ctx.fillRect(this.x - this.width / 2, this.topY, this.width, this.botY - this.topY);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 6; i++) {
      const xx = this.x - this.width / 2 + 2 + i * (this.width / 6);
      const off = (w.tick * 2.6 + i * 33) % 40;
      ctx.fillRect(xx, this.topY + off, 1.6, 14);
      ctx.fillRect(xx, this.topY + ((off + 20) % 40), 1.6, 10);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.botY - 2, this.width * 0.8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ------------------------------------------------------------------ bamboo traps
/**
 * A woven bamboo trap lying in the stream: you can walk into its wide mouth and it carries you to
 * the other end; the narrow end has splines pointing in, so there is no way back in there.
 */
export class Chute extends Entity {
  private cool = -999;
  used = 0;
  constructor(
    readonly mouth: { x: number; y: number; w: number; h: number },
    readonly out: { x: number; y: number },
    readonly drop = 0,
  ) {
    super();
    this.layer = 1;
  }
  update(w: World) {
    if (w.state !== 'play' || w.tick < this.cool) return;
    const p = w.player;
    if (!p.onGround) return;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, this.mouth)) return;
    this.cool = w.tick + 20;
    this.used++;
    w.flags.chuteUse = (w.flags.chuteUse ?? 0) + 1;
    w.sfx('slide', p.cx, p.cy);
    w.emit('fx', p.cx, p.cy, { kind: 'poof', w: 16, h: 14 });
    w.warp(this.out.x, this.out.y - p.h, 'blink');
    p.vx = 0;
    p.vy = 0;
    w.emit('fx', this.out.x + 5, this.out.y - 7, { kind: 'poof', w: 16, h: 14 });
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const ax = this.mouth.x + this.mouth.w / 2,
      ay = this.mouth.y + this.mouth.h / 2;
    const bx = this.out.x + 5,
      by = this.out.y - 7;
    ctx.strokeStyle = '#B08A3E';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 14, bx, by);
    ctx.stroke();
    ctx.strokeStyle = '#D8B760';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.quadraticCurveTo((ax + bx) / 2, Math.min(ay, by) - 14, bx, by);
    ctx.stroke();
    // the woven rings
    ctx.strokeStyle = 'rgba(90,66,26,0.75)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 9; i++) {
      const t = i / 9;
      const mx = (1 - t) * (1 - t) * ax + 2 * (1 - t) * t * ((ax + bx) / 2) + t * t * bx;
      const my = (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * (Math.min(ay, by) - 14) + t * t * by;
      ctx.beginPath();
      ctx.arc(mx, my, 4.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    // splines at the narrow end
    ctx.strokeStyle = '#7A5A22';
    ctx.lineWidth = 0.9;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(bx, by + i * 3);
      ctx.lineTo(bx - 5, by + i * 3 - 2);
      ctx.stroke();
    }
    // the wide mouth
    ctx.fillStyle = 'rgba(40,28,10,0.55)';
    ctx.beginPath();
    ctx.ellipse(ax, ay + 1, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    void w;
  }
}

// ------------------------------------------------------------------ Sarhul pot
export const pot = (w: World) => (w.flags.potLevel as number) ?? 0.35;
export function setPot(w: World, v: number) {
  w.flags.potLevel = Math.max(0, Math.min(1, v));
}
function spill(w: World, by: number) {
  const before = pot(w);
  setPot(w, before - by);
  if (before > 0.03 && pot(w) < before) {
    w.sfx('spout', w.player.cx, w.player.cy - 4);
    w.emit('fx', w.player.cx, w.player.cy + 4, { kind: 'splash', w: 8 });
  }
}
/** The pot Dad carries: it spills when he jumps and when he lands hard. */
export class PotHands extends Entity {
  constructor() {
    super();
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    if (p.jumpTick === w.tick - 1) spill(w, 0.14);
    if (p.landTick === w.tick - 1 && p.landSpeed > 300) spill(w, 0.07);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    const lvl = pot(w);
    const x = p.cx + (p.facing > 0 ? 8 : -8);
    const y = p.y + 8;
    // the earthen ghara
    ctx.fillStyle = '#A9603B';
    ctx.beginPath();
    ctx.ellipse(x, y, 4.6, 5.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7A4026';
    ctx.fillRect(x - 2.6, y - 6.2, 5.2, 2);
    // the water inside, and its float
    ctx.fillStyle = 'rgba(90,180,205,0.95)';
    ctx.fillRect(x - 3.2, y - 1.6, 6.4, Math.max(0.6, 5.2 * lvl));
    ctx.fillStyle = '#FFFDE7';
    ctx.fillRect(x - 1, y - 3.2 + (1 - lvl) * 3.4, 2, 2);
    void w;
  }
}
/** A bamboo spout running into a pot: stand in it and the pot fills. */
export class Spout extends Entity {
  constructor(
    readonly x: number,
    readonly groundY: number,
    readonly wTiles = 1,
  ) {
    super();
    this.layer = -4;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x, y: this.groundY - 30, w: this.wTiles * 16, h: 30 })) return;
    if (pot(w) >= 1) return;
    setPot(w, pot(w) + 1.25 * DT);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.x;
    const y = this.groundY;
    ctx.strokeStyle = '#B08A3E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 24);
    ctx.lineTo(x + 3, y - 14);
    ctx.lineTo(x + 9, y - 12);
    ctx.stroke();
    ctx.fillStyle = 'rgba(150,220,235,0.9)';
    for (let i = 0; i < 3; i++) {
      const yy = y - 11 + ((w.tick * 1.6 + i * 5) % 11);
      ctx.fillRect(x + 9, yy, 1.4, 3);
    }
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x + 1, y - 26, 5, 3);
  }
}

// ------------------------------------------------------------------ Dokra
/** A channel of poured brass: while it glows it burns; when it dulls it is a floor. */
export class Cast extends Entity {
  solid: Solid;
  hazard: Hazard;
  state: 'empty' | 'pour' | 'hot' | 'set' = 'empty';
  private t0 = -1;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly topY: number,
    private readonly fill = 1.0,
    private readonly cool = 2.3,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x0, topY, x1 - x0, 8);
    this.solid.collidable = false;
    const self = this;
    this.hazard = {
      active: false,
      cause: 'burnt',
      hits: (x, y, w, h) => self.hazard.active && overlapXYWH(x, y, w, h, { x: self.x0 + 1, y: self.topY - 3, w: self.x1 - self.x0 - 2, h: 11 }),
    };
  }
  get hot() {
    return this.state === 'pour' || this.state === 'hot';
  }
  pour(w: World) {
    if (this.state !== 'empty') return;
    this.state = 'pour';
    this.t0 = w.tick;
    w.sfx('pour', (this.x0 + this.x1) / 2, this.topY - 10);
  }
  update(w: World) {
    if (this.state === 'pour' && (w.tick - this.t0) * DT >= this.fill) {
      this.state = 'hot';
      this.t0 = w.tick;
      this.solid.collidable = true;
      this.hazard.active = true;
      w.sfx('hiss', (this.x0 + this.x1) / 2, this.topY);
      w.emit('fx', (this.x0 + this.x1) / 2, this.topY - 2, { kind: 'sparkle' });
    } else if (this.state === 'hot' && (w.tick - this.t0) * DT >= this.cool) {
      this.state = 'set';
      this.hazard.active = false;
      w.sfx('thud', (this.x0 + this.x1) / 2, this.topY);
    }
    w.flags.castState = this.state;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.x0,
      y = this.topY,
      wd = this.x1 - this.x0;
    if (this.state === 'empty') {
      ctx.fillStyle = 'rgba(60,52,44,0.55)';
      ctx.fillRect(x, y - 3, wd, 3);
      return;
    }
    if (this.hot) {
      const glow = this.state === 'pour' ? 1 : 0.7 + 0.3 * Math.sin(w.tick * 0.25);
      ctx.fillStyle = `rgba(255,${Math.round(120 + 80 * (1 - glow))},40,0.95)`;
      ctx.fillRect(x, y - 4, wd, 8);
      ctx.fillStyle = 'rgba(255,240,180,0.9)';
      for (let i = 0; i < 4; i++) {
        const bx = x + ((i * 31 + w.tick * 0.7) % Math.max(1, wd - 4));
        ctx.fillRect(bx, y - 5 - (i % 2), 2, 2);
      }
    } else {
      ctx.fillStyle = '#9A7B3F';
      ctx.fillRect(x, y - 4, wd, 8);
      ctx.fillStyle = '#C0A060';
      ctx.fillRect(x, y - 4, wd, 1.4);
    }
  }
}

/** The crucible on its beam: stand on the far end and it tips. */
export class Crucible extends Entity {
  tipped = false;
  constructor(
    readonly zone: { x: number; y: number; w: number; h: number },
    readonly cast: Cast,
    readonly overX: number,
  ) {
    super();
    this.layer = -1;
  }
  update(w: World) {
    if (this.tipped || w.state !== 'play') return;
    const p = w.player;
    if (!p.onGround || !overlapXYWH(p.x, p.y, p.w, p.h, this.zone)) return;
    this.tipped = true;
    this.cast.pour(w);
    w.flags.crucible = 1;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const z = this.zone;
    const y = this.cast.topY;
    // the beam
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(z.x, z.y + z.h - 2);
    ctx.lineTo(this.overX, y - 40);
    ctx.stroke();
    // the pivot
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(z.x + 2, z.y + z.h - 8, 4, 8);
    // the crucible
    const cx = this.overX;
    const cy = y - 46 + (this.tipped ? 6 : 0);
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.lineTo(cx + 6, cy + 10);
    ctx.lineTo(cx - 6, cy + 10);
    ctx.closePath();
    ctx.fill();
    if (this.tipped) {
      ctx.fillStyle = 'rgba(255,170,60,0.95)';
      ctx.fillRect(cx - 2, cy + 10, 4, y - 40 - cy + 34);
      ctx.fillStyle = 'rgba(255,240,180,0.8)';
      ctx.fillRect(cx - 1, cy + 10, 1.6, y - 40 - cy + 34);
    }
    // the bench it stands on
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(z.x - 2, z.y + z.h - 2, z.w + 4, 2);
    void w;
  }
}

// ------------------------------------------------------------------ Chhau
export const mask = (w: World) => !!w.flags[MASK];
export const setMask = (w: World, v: boolean) => {
  w.flags[MASK] = v;
};

/** A mask on a rack: walk into it and Dad is holding it (one at a time). */
export class MaskPickup extends Entity {
  taken = false;
  constructor(
    readonly x: number,
    readonly y: number,
  ) {
    super();
    this.layer = 2;
  }
  update(w: World) {
    if (this.taken || w.state !== 'play' || mask(w)) return;
    const p = w.player;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x - 2, y: this.y - 3, w: 18, h: 18 })) return;
    this.taken = true;
    this.alive = false;
    setMask(w, true);
    w.sfx('pop', this.x + 7, this.y + 6);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.taken) return;
    drawMask(ctx, this.x + 7, this.y + 7, 8, '#F9A825', w.tick);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.x - 2, this.y + 12, 16, 3);
  }
}

/** A bamboo pole to hang a mask on: the dancer will go for whatever wears a face. */
export class MaskPole extends Entity {
  masked = false;
  broken = false;
  constructor(
    readonly x: number,
    readonly groundY: number,
  ) {
    super();
    this.layer = 1;
  }
  update(w: World) {
    if (this.masked || this.broken || w.state !== 'play') return;
    if (!mask(w)) return;
    const p = w.player;
    if (Math.abs(p.cx - (this.x + 8)) > 12) return;
    setMask(w, false);
    this.masked = true;
    w.flags.maskPlanted = (w.flags.maskPlanted ?? 0) + 1;
    w.sfx('pop', this.x + 8, this.groundY - 32);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.x + 8;
    const y = this.groundY;
    ctx.strokeStyle = '#B08A3E';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 34);
    ctx.stroke();
    ctx.fillStyle = '#8BC34A';
    ctx.fillRect(x - 5, y - 32, 10, 2);
    if (this.masked) drawMask(ctx, x, y - 30, 8, '#F9A825', w.tick);
    void w;
  }
}

export function drawMask(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, tick: number) {
  ctx.fillStyle = '#F5E6C8';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B71C1C';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = fill;
  ctx.fillRect(x - r * 0.7, y - r * 0.7, r * 1.4, r * 0.5);
  ctx.fillStyle = '#26160C';
  ctx.beginPath();
  ctx.arc(x - r * 0.38, y + r * 0.05, r * 0.2, 0, Math.PI * 2);
  ctx.arc(x + r * 0.38, y + r * 0.05, r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#B71C1C';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.4, y + r * 0.55);
  ctx.lineTo(x + r * 0.4, y + r * 0.55);
  ctx.stroke();
  // the little eye-holes catch the light
  ctx.fillStyle = `rgba(255,240,180,${0.4 + 0.3 * Math.sin(tick * 0.12)})`;
  ctx.fillRect(x - r * 0.5, y - r * 0.1, 2, 1);
}

export type DanceState = 'idle' | 'wind' | 'strike' | 'rest';

/**
 * A Chhau dancer. He dances on his mark, and he strikes whatever wears a face in front of him:
 * a mask on a pole, or Dad. A mask is spent in one blow, and the blow breaks what is behind it.
 */
export class Dancer extends Entity {
  hazard: Hazard;
  state: DanceState = 'idle';
  private t0 = -1;
  private cool = -999;
  private victim: MaskPole | null = null;
  private targetKind: 'mask' | 'dad' | null = null;
  constructor(
    readonly cx: number,
    readonly feetY: number,
    readonly face: 1 | -1,
    readonly reach: number,
    readonly onStrike?: (w: World, from: number, to: number) => void,
    private readonly oneShot = false,
    /** he only ever goes for the mask: he never turns on Dad (the last dancer, at his own door) */
    private readonly spare = false,
  ) {
    super();
    this.layer = 5;
    const self = this;
    this.hazard = {
      active: false,
      cause: 'talwar',
      hits: (x, y, w, h) => !self.spare && self.hazard.active && overlapXYWH(x, y, w, h, self.blade()),
    };
  }
  /** the arc his sweep covers */
  blade() {
    const a = this.face < 0 ? this.cx - this.reach : this.cx - 10;
    const b = this.face < 0 ? this.cx + 10 : this.cx + this.reach;
    return { x: a, y: this.feetY - 30, w: b - a, h: 30 };
  }
  private inFront(x: number) {
    const b = this.blade();
    return x > b.x && x < b.x + b.w;
  }
  /** the first mask hung in front of him, if any */
  private frontPole(w: World) {
    return (w.entities.filter((e) => e instanceof MaskPole && e.masked && !e.broken && this.inFront(e.x + 8)) as MaskPole[])[0] ?? null;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    const t = w.tick;
    if (this.state === 'idle' && t >= this.cool) {
      const maskPole = this.frontPole(w);
      const dadIn = !this.spare && this.inFront(p.cx) && p.y + p.h > this.feetY - 30 && p.y < this.feetY;
      if (maskPole) {
        this.victim = maskPole;
        this.targetKind = 'mask';
      } else if (dadIn) {
        this.victim = null;
        this.targetKind = 'dad';
      } else {
        this.targetKind = null;
        this.victim = null;
      }
      if (this.targetKind) {
        this.state = 'wind';
        this.t0 = t;
        w.flags.dancer = 'wind';
        w.sfx('bell', this.cx, this.feetY - 20);
      }
    } else if (this.state === 'wind' && this.targetKind === 'dad' && this.frontPole(w)) {
      // a face goes up in front of him mid-swing: he always prefers the face
      this.victim = this.frontPole(w);
      this.targetKind = 'mask';
    } else if (this.state === 'wind' && (t - this.t0) * DT >= 1.3) {
      this.state = 'strike';
      this.t0 = t;
      this.hazard.active = true;
      w.flags.dancer = 'strike';
      w.sfx('clang', this.cx, this.feetY - 12);
      if (this.targetKind === 'mask' && this.victim) {
        this.victim.broken = true;
        this.victim.masked = false;
        const b = this.blade();
        this.onStrike?.(w, b.x, b.x + b.w);
        w.emit('fx', this.victim.x + 8, this.feetY - 30, { kind: 'sparkle' });
      }
    } else if (this.state === 'strike' && (t - this.t0) * DT >= 0.2) {
      this.state = 'rest';
      this.t0 = t;
      this.hazard.active = false;
      w.flags.dancer = 'rest';
      this.cool = t + secs(this.oneShot && this.targetKind === 'mask' ? 0.5 : 0.75);
      this.targetKind = null;
      this.victim = null;
    } else if (this.state === 'rest' && (t - this.t0) * DT >= 0.55) {
      this.state = 'idle';
      if (this.oneShot) this.alive = false;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.cx,
      y = this.feetY;
    const lean = this.state === 'wind' ? -this.face * 2 : this.state === 'strike' ? this.face * 4 : 0;
    const bob = Math.sin(w.tick * 0.09) * 1.2;
    // legs in a wide dance stance
    ctx.strokeStyle = '#2E2A36';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 4, y);
    ctx.lineTo(x - 2, y - 7);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 2, y - 7);
    ctx.stroke();
    // the skirt and sash
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.moveTo(x - 7 + lean, y - 20);
    ctx.lineTo(x + 7 + lean, y - 20);
    ctx.lineTo(x + 9, y - 6);
    ctx.lineTo(x - 9, y - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#F9A825';
    ctx.fillRect(x - 8 + lean, y - 14, 16, 2);
    // arms: the sweeping blade
    const armY = y - 22 + bob;
    ctx.strokeStyle = '#C62828';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + lean, armY);
    ctx.lineTo(x + this.face * (this.state === 'strike' ? 14 : 8) + lean, armY - (this.state === 'wind' ? 8 : 2));
    ctx.stroke();
    // the curved blade
    const bx = x + this.face * (this.state === 'strike' ? 26 : 10) + lean;
    const by = armY - (this.state === 'wind' ? 10 : 0);
    ctx.strokeStyle = '#CFD8DC';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bx, by, 11, this.face < 0 ? Math.PI * 0.2 : Math.PI * 0.8, this.face < 0 ? Math.PI * 1.25 : -Math.PI * 0.25, this.face > 0);
    ctx.stroke();
    // the mask
    drawMask(ctx, x + lean, y - 30 + bob, 6.5, '#6A1B9A', w.tick);
    // his mark on the floor
    ctx.strokeStyle = 'rgba(198,40,40,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y + 1, 12, 2.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (this.state === 'wind') {
      ctx.fillStyle = 'rgba(255,235,120,0.9)';
      ctx.fillRect(x + this.face * 14 - 1, y - 46, 2, 4);
    }
  }
}

/** The stone door of a Chhau courtyard: cracked by the dancer's blow, not by a key. */
export class StoneSlab extends Entity {
  cracked = false;
  constructor(
    readonly x: number,
    readonly y: number,
  ) {
    super();
    this.layer = 2;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.cracked ? 'rgba(90,92,96,0.55)' : 'rgba(96,98,102,0.95)';
    ctx.fillRect(this.x, this.y, 26, 30);
    ctx.strokeStyle = 'rgba(40,40,44,0.7)';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x + 0.5, this.y + 0.5, 25, 29);
    ctx.strokeStyle = 'rgba(230,235,240,0.5)';
    ctx.beginPath();
    if (this.cracked) {
      ctx.moveTo(this.x + 6, this.y + 2);
      ctx.lineTo(this.x + 12, this.y + 14);
      ctx.lineTo(this.x + 8, this.y + 27);
      ctx.moveTo(this.x + 12, this.y + 14);
      ctx.lineTo(this.x + 22, this.y + 20);
      ctx.lineWidth = 2.2;
    } else {
      ctx.moveTo(this.x + 5, this.y + 3);
      ctx.lineTo(this.x + 10, this.y + 12);
      ctx.lineWidth = 0.8;
    }
    ctx.stroke();
  }
}
