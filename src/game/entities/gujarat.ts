// Gandhinagar's moving parts: the kite looters' bamboo (a pole vault), kite strings, sunbeams in the
// stepwell, Indroda's dinosaur, the lions of Gir, peacock feathers, the garba ring and GIFT City's ticker.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT } from '../constants';

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** a diamond kite with its tail */
export function kite(ctx: CanvasRenderingContext2D, x: number, y: number, col: string, s = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, 8);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-0.5, -7, 1, 15);
  ctx.fillRect(-6, -0.5, 12, 1);
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-2, 12);
  ctx.lineTo(2, 12);
  ctx.fill();
  ctx.restore();
}

/** a tin (patra) roof drawn over tiles: corrugated grey sheet */
export function tinArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number) {
  ctx.fillStyle = '#90A4AE';
  ctx.fillRect(x0, top, x1 - x0, 5);
  ctx.fillStyle = '#607D8B';
  for (let x = x0; x < x1; x += 4) ctx.fillRect(x, top, 2, 5);
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(x0, top, x1 - x0, 1);
}

/** a black rooftop water tank (the kind on every terrace) over a block of hidden tiles */
export function tankArt(ctx: CanvasRenderingContext2D, x: number, top: number, w: number, h: number) {
  ctx.fillStyle = '#212121';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, top + 3, w / 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x, top + 3, w, h - 3);
  ctx.fillStyle = '#424242';
  for (let y = top + 8; y < top + h; y += 7) ctx.fillRect(x, y, w, 1.5);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(x + 3, top + 4, 2, h - 6);
}

/** Uttarayan's kite looters run after cut kites with long bamboo poles. Pick one up and every running
 *  jump is a pole vault: the pole plants a little ahead of you and throws you up, higher the longer
 *  your run-up. It needs a roof to bite into: on a tin roof (patra) it slips, and over a gap there's
 *  nothing to plant it in (you just jump). */
export class Bamboo extends Entity {
  held = false;
  /** px of run-up: covered on the ground at a run, one way, since the last stop or turn */
  run = 0;
  private lastX = 0;
  private runDir = 0;
  vaultT = -999;
  plantX = 0;
  plantY = 0;
  power = 0;
  vdir = 1;
  vaults = 0;
  /** gone for good (laid across a gap) */
  gone = false;
  /** the ending: a gap's near edge (x) where a standing press lays the pole across instead */
  bridgeAt: { x: number; top: number; roof: number; onLay: (w: World) => void } | null = null;
  private skidTold = -999;
  static RUN0 = 12;
  static RUN1 = 96;
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly tin: { x0: number; x1: number; top: number }[] = [],
  ) {
    super();
    this.layer = 3;
  }
  /** how hard a vault after a run-up of `run` px throws you (0..1) */
  static power(run: number) {
    return clamp((run - Bamboo.RUN0) / (Bamboo.RUN1 - Bamboo.RUN0), 0, 1);
  }
  static vy(power: number) {
    return 470 + 210 * power;
  }
  /** can the pole bite into the roof at x, where Dad's feet are at `feet`? */
  plantable(w: World, x: number, feet: number) {
    if (!w.solidAt(x - 1, feet, 2, 2)) return false;
    // roof, not a wall in front
    if (w.solidAt(x - 1, feet - 6, 2, 5)) return false;
    for (const t of this.tin) if (x >= t.x0 - 1 && x <= t.x1 + 1 && Math.abs(feet - t.top) < 2) return false;
    return true;
  }
  update(w: World) {
    const p = w.player;
    if (this.gone) return;
    if (!this.held) {
      if (w.state === 'play' && p.x < this.x + 8 && p.x + p.w > this.x - 8 && p.y + p.h > this.floor - 44 && p.y < this.floor) {
        this.held = true;
        this.lastX = p.x;
        this.run = 0;
        w.sfx('pop', this.x, this.floor - 20);
        w.say('Le, vaans! | Here, a bamboo!', this.x, this.floor - 50, 1.0, 'npc');
        w.flags.bamboo = true;
      }
      return;
    }
    const dx = p.x - this.lastX;
    this.lastX = p.x;
    if (p.onGround) {
      const d = Math.sign(dx);
      if (Math.abs(p.vx) >= 60 && d !== 0 && d === Math.sign(p.vx)) {
        if (d !== this.runDir) {
          this.runDir = d;
          this.run = 0;
        }
        this.run += Math.abs(dx);
      } else if (Math.abs(p.vx) < 60) this.run = 0;
    } else this.run = 0; // a run-up is one stretch of roof: a hop on the way starts it again
    if (!(p.onGround && w.input.jumpPressed && !p.stun && w.state === 'play')) return;
    const f = p.facing;
    const feet = p.y + p.h;
    // the last gap: there's nothing to plant the pole in, so a jump anywhere on the little roof in
    // front of it lays the pole across instead (walking or standing)
    const b = this.bridgeAt;
    if (b && feet === b.top && p.x + p.w > b.x - b.roof && p.x + p.w <= b.x + 9) {
      this.gone = true;
      p.stun = 1;
      p.vx = 0;
      w.sfx('thud', b.x + 40, b.top);
      b.onLay(w);
      return;
    }
    if (this.run < Bamboo.RUN0) return;
    const tipX = f > 0 ? p.x + p.w + 14 : p.x - 14;
    if (this.plantable(w, tipX, feet)) {
      this.power = Bamboo.power(this.run);
      p.vy = -Bamboo.vy(this.power);
      p.launched = true;
      p.onGround = false;
      p.jumping = false;
      p.coyoteT = 0;
      p.jumpTick = w.tick;
      p.carryVx += f * 40 * this.power;
      this.vaultT = w.tick;
      this.plantX = tipX;
      this.plantY = feet;
      this.vdir = f;
      this.vaults++;
      w.sfx('boing', tipX, feet);
      w.flags.vault = { power: this.power, run: this.run, x: p.x, tick: w.tick };
      this.run = 0;
    } else if (w.tick - this.skidTold > 300) {
      this.skidTold = w.tick;
      const tin = this.tin.some((t) => tipX >= t.x0 - 1 && tipX <= t.x1 + 1 && Math.abs(feet - t.top) < 2);
      if (tin) {
        w.sfx('slide', tipX, feet);
        w.say('Patra par vaans lapsi jaay! | The bamboo slips on tin!', p.cx, p.y - 12, 1.2, 'npc');
      }
    }
  }
  /** the pole as it should be drawn this tick: from (x0, y0) to (x1, y1), bent by `bend` */
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.gone) return;
    const p = w.player;
    let x0: number, y0: number, x1: number, y1: number, bend: number;
    const since = (w.tick - this.vaultT) * DT;
    if (!this.held) {
      x0 = this.x + 4;
      y0 = this.floor;
      x1 = this.x - 8;
      y1 = this.floor - 50;
      bend = 0;
    } else if (since < 0.42 && !p.dead) {
      // planted: the pole runs from its tip in the roof up to Dad's hands, bending less as he rises
      x0 = this.plantX;
      y0 = this.plantY;
      x1 = p.cx;
      y1 = p.y + 5;
      bend = (1 - since / 0.42) * 10 * (0.4 + this.power);
    } else {
      // carried: tilted up ahead of him, the tip dipping as the run-up builds
      const f = p.facing;
      const pw = Bamboo.power(this.run);
      x0 = p.cx - f * 15;
      y0 = p.y + 9;
      x1 = p.cx + f * 32;
      y1 = p.y + 1 + pw * 6;
      bend = 0;
    }
    const mx = (x0 + x1) / 2,
      my = (y0 + y1) / 2;
    const len = Math.hypot(x1 - x0, y1 - y0) || 1;
    const nx = -(y1 - y0) / len,
      ny = (x1 - x0) / len;
    const cx = mx + nx * bend * this.vdir,
      cy = my + ny * bend * this.vdir;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#6D5A1E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, cy, x1, y1);
    ctx.stroke();
    ctx.strokeStyle = '#D4C06A';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // nodes along it
    ctx.fillStyle = '#8D7A2E';
    for (let k = 1; k < 5; k++) {
      const u = k / 5;
      const qx = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1;
      const qy = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1;
      ctx.fillRect(qx - 1, qy - 1, 2, 2);
    }
    // the thorny twig tied at the top, for snagging kites
    const tx = this.held && since >= 0.42 ? x1 : !this.held ? x1 : x0;
    const ty = this.held && since >= 0.42 ? y1 : !this.held ? y1 : y0;
    if (!(this.held && since < 0.42)) {
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 0.8;
      for (let k = -1; k <= 1; k++) {
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + k * 3 + 2, ty - 4 + Math.abs(k));
        ctx.stroke();
      }
    }
    ctx.lineCap = 'butt';
    for (const t of this.tin) tinArt(ctx, t.x0, t.x1, t.top);
  }
}

/** A kite string caught across the lane between two antennas: glass-coated manja. Touch it and it cuts. */
export class Manja extends Entity {
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly y0: number,
    readonly x1: number,
    readonly y1: number,
    readonly col = '#EC407A',
  ) {
    super();
    this.layer = 4;
    this.hazard = { active: true, cause: 'manja', hits: (x, y, ww, h) => this.hits(x, y, ww, h) };
  }
  yAt(x: number) {
    return this.y0 + ((x - this.x0) / (this.x1 - this.x0)) * (this.y1 - this.y0);
  }
  hits(x: number, y: number, ww: number, h: number) {
    const a = Math.max(x, Math.min(this.x0, this.x1)),
      b = Math.min(x + ww, Math.max(this.x0, this.x1));
    if (a > b) return false;
    for (let sx = a; sx <= b; sx += 1) {
      const sy = this.yAt(sx);
      if (sy >= y && sy <= y + h) return true;
    }
    return false;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    // the antennas it's caught on
    ctx.fillStyle = '#9E9E9E';
    for (const [x, y] of [
      [this.x0, this.y0],
      [this.x1, this.y1],
    ])
      ctx.fillRect(x - 0.5, y - 4, 1.5, 6);
    ctx.strokeStyle = 'rgba(40,10,30,0.55)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(this.x0, this.y0);
    ctx.lineTo(this.x1, this.y1);
    ctx.stroke();
    ctx.strokeStyle = this.col;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // glass glinting along it
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    const L = Math.abs(this.x1 - this.x0);
    for (let k = 0; k < 4; k++) {
      const u = (((t * 0.35 + k / 4) % 1) + 1) % 1;
      const gx = this.x0 + (this.x1 - this.x0) * u;
      ctx.fillRect(gx - 0.5, this.yAt(gx) - 0.5, 1.2, 1.2);
    }
    // the cut kite hanging off one end
    kite(ctx, this.x1 + 3, this.y1 + 10 + Math.sin(t * 2) * 1.5, '#7E57C2', 0.8);
    void L;
  }
}

/** Indroda's Rajasaurus: every few seconds it stomps and a shockwave runs out along its floor both
 *  ways. Anyone standing on that floor when it passes under them is thrown high in the air: that can
 *  lift you on to a ledge, or into whatever hangs above. Be in the air as it passes and you're fine. */
export class Dino extends Entity {
  /** fronts of the live waves: x, direction, when */
  waves: { x: number; dir: number; t0: number }[] = [];
  hazard: Hazard;
  private lastK = -1;
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly o: { period: number; phase?: number; reach: number; speed?: number; launch?: number; x0?: number; x1?: number; face?: 1 | -1; scale?: number; fence?: boolean },
  ) {
    super();
    this.layer = o.fence ? -3 : 1;
    // its legs and belly: walk into a dinosaur and it treads on you (unless it's behind a fence)
    const s = o.scale ?? 1;
    this.hazard = {
      active: !o.fence,
      cause: 'stomped',
      hits: (x2, y2, w2, h2) => x2 < this.x + 16 * s && x2 + w2 > this.x - 14 * s && y2 < this.floor && y2 + h2 > this.floor - 46 * s,
    };
  }
  get speed() {
    return this.o.speed ?? 220;
  }
  /** seconds until the next stomp */
  next(t: number) {
    const u = (((t - (this.o.phase ?? 0)) % this.o.period) + this.o.period) % this.o.period;
    return this.o.period - u;
  }
  update(w: World) {
    const t = w.tick * DT;
    const k = Math.floor((t - (this.o.phase ?? 0)) / this.o.period);
    if (k !== this.lastK) {
      this.lastK = k;
      if (k >= 0 && t > 0) {
        this.waves.push({ x: this.x, dir: 1, t0: t }, { x: this.x, dir: -1, t0: t });
        w.sfx('boom', this.x, this.floor);
        w.emit('fx', this.x, this.floor, { kind: 'dust' });
      }
    }
    const p = w.player;
    const lo = this.o.x0 ?? -1e9,
      hi = this.o.x1 ?? 1e9;
    this.waves = this.waves.filter((q) => (t - q.t0) * this.speed < this.o.reach);
    for (const q of this.waves) {
      const prev = q.x;
      q.x = this.x + q.dir * (t - q.t0) * this.speed;
      if (q.x < lo || q.x > hi || w.state !== 'play') continue;
      // the front passed under Dad this tick while he stood on this floor: up he goes
      const crossed = (prev - p.cx) * (q.x - p.cx) <= 0;
      if (!crossed || p.hidden) continue;
      if (p.onGround && p.y + p.h === this.floor) {
        p.vy = -(this.o.launch ?? 640);
        p.launched = true;
        p.jumping = false;
        p.onGround = false;
        p.coyoteT = 0;
        w.sfx('boing', p.cx, p.y + p.h);
        w.flags.thrown = (w.flags.thrown ?? 0) + 1;
        w.flags.thrownAt = w.tick;
        w.flags.thrownBy = this;
      } else if (p.launched && p.vy < 0 && w.flags.thrownBy && w.flags.thrownBy !== this && w.tick - (w.flags.thrownAt ?? -99) <= 8) {
        // a second wave from another dinosaur right under him: thrown twice as high
        p.vy -= 0.4 * (this.o.launch ?? 640);
        w.flags.thrownBy = null;
        w.flags.doubled = w.tick;
        w.sfx('boom', p.cx, p.y + p.h);
        w.emit('fx', p.cx, this.floor, { kind: 'dust' });
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const s = this.o.scale ?? 1;
    const f = this.o.face ?? 1;
    const fy = this.floor;
    // the shockwaves: a ripple of dust running along the ground
    for (const q of this.waves) {
      if (q.x < (this.o.x0 ?? -1e9) || q.x > (this.o.x1 ?? 1e9)) continue;
      ctx.fillStyle = 'rgba(150,110,60,0.55)';
      ctx.beginPath();
      ctx.ellipse(q.x, fy, 8, 5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = 'rgba(214,184,140,0.85)';
      ctx.fillRect(q.x - q.dir * 9 - 1, fy - 7, 2.5, 2.5);
      ctx.fillRect(q.x - q.dir * 14 - 1, fy - 4, 2, 2);
      ctx.fillRect(q.x + q.dir * 2, fy - 9, 1.5, 1.5);
    }
    const u = this.o.period - this.next(t);
    // the stomping foot rises for the last 0.6 s before each stomp
    const lift = u > this.o.period - 0.6 ? (u - (this.o.period - 0.6)) * 22 : 0;
    ctx.save();
    ctx.translate(this.x, fy);
    ctx.scale(f * s, s);
    const body = '#6D8B4A',
      dark = '#4E6B30';
    // tail, body, neck and head
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(-14, -48);
    ctx.quadraticCurveTo(-46, -44, -64, -26);
    ctx.lineTo(-58, -23);
    ctx.quadraticCurveTo(-40, -32, -12, -34);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(2, -42, 22, 14, -0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14, -50);
    ctx.quadraticCurveTo(22, -66, 34, -68);
    ctx.lineTo(40, -60);
    ctx.quadraticCurveTo(30, -54, 22, -42);
    ctx.fill();
    // head with the horn Rajasaurus is named for, jaw and teeth
    ctx.fillStyle = dark;
    ctx.fillRect(28, -70, 20, 9);
    ctx.fillStyle = body;
    ctx.fillRect(28, -61, 17, 4);
    ctx.fillStyle = '#FFFDE7';
    for (let k = 0; k < 4; k++) ctx.fillRect(31 + k * 4, -61.5, 1.6, 2.2);
    ctx.fillStyle = '#C62828';
    ctx.beginPath();
    ctx.arc(31, -71, 3, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#FFF59D';
    ctx.fillRect(37, -68, 2.4, 2.4);
    ctx.fillStyle = '#212121';
    ctx.fillRect(38, -67.4, 1.2, 1.2);
    // little arms
    ctx.fillStyle = dark;
    ctx.fillRect(18, -40, 6, 2);
    // legs: the front one lifts before a stomp
    ctx.fillStyle = body;
    ctx.fillRect(-10, -32, 9, 32);
    ctx.fillRect(6, -32 - lift, 9, 32);
    ctx.fillStyle = dark;
    ctx.fillRect(-12, -4, 13, 4);
    ctx.fillRect(4, -4 - lift, 14, 4);
    // stripes
    ctx.fillStyle = 'rgba(40,60,20,0.35)';
    for (let k = 0; k < 4; k++) ctx.fillRect(-10 + k * 8, -54, 3, 10);
    ctx.restore();
    if (this.o.fence) {
      // the enclosure's railing in front of it
      ctx.fillStyle = '#5D4037';
      const x0 = this.x - 40 * s,
        x1 = this.x + 44 * s;
      ctx.fillRect(x0, fy - 16, x1 - x0, 2);
      ctx.fillRect(x0, fy - 8, x1 - x0, 2);
      for (let x = x0; x <= x1; x += 8) ctx.fillRect(x, fy - 18, 2, 18);
    }
  }
}

/** Babool (acacia) branches overhead, full of long white thorns: being thrown into them is the end. */
export class Thorns extends Entity {
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y: number,
    readonly trunkX: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 3;
    this.hazard = { active: true, cause: 'thorns', hits: (x, y2, w2, h2) => x < this.x1 && x + w2 > this.x0 && y2 < this.y + 7 && y2 + h2 > this.y - 4 };
  }
  draw(ctx: CanvasRenderingContext2D) {
    // a branch hanging from a tree overhead: its crown up there
    if (this.floor < this.y) {
      ctx.fillStyle = '#6E8A45';
      ctx.beginPath();
      ctx.ellipse(this.trunkX, this.floor, 26, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5E7A3A';
      ctx.beginPath();
      ctx.ellipse(this.trunkX + 10, this.floor + 4, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // the trunk up from the ground, the branch along, and its thorns
    ctx.strokeStyle = '#5D4A36';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.trunkX, this.floor);
    ctx.quadraticCurveTo(this.trunkX + 4, (this.floor + this.y) / 2, this.trunkX < this.x0 ? this.x0 : this.trunkX, this.y - 2);
    ctx.stroke();
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(this.x0 - 4, this.y - 2);
    for (let x = this.x0; x <= this.x1; x += 12) ctx.lineTo(x, this.y - 2 + Math.sin(x * 0.3) * 1.5);
    ctx.stroke();
    ctx.lineCap = 'butt';
    // feathery leaves above
    ctx.fillStyle = '#7C9A4A';
    for (let x = this.x0 - 6; x < this.x1 + 6; x += 9) {
      ctx.beginPath();
      ctx.ellipse(x, this.y - 8 - ((x * 7) % 5), 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#F5F5F0';
    ctx.lineWidth = 1;
    for (let x = this.x0 + 2; x < this.x1; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x, this.y - 1);
      ctx.lineTo(x + ((x / 5) % 2 ? 2 : -2), this.y + 6);
      ctx.stroke();
    }
  }
}

export interface BeamOpts {
  /** the beam's slope from the horizontal (radians) swings between a0 and a1 as the sun moves */
  a0: number;
  a1: number;
  period: number;
  phase?: number;
  /** a cloud over the sun: the light goes out for `dur` s every `every` s (it flickers first) */
  cloud?: { every: number; dur: number; phase?: number };
  /** shadow stripes (a stone jali's bars) sliding down the beam: gaps in the light */
  gaps?: { n: number; w: number; speed: number };
  /** where the light comes in (drawn): a jharokha window or the jali */
  window?: 'jharokha' | 'jali';
}

/** Dusty sunlight slanting into the Adalaj stepwell, so thick you can walk on it: up its slope
 *  from the low end to the window it comes in through. It swings as the sun moves, and goes out
 *  while a cloud covers the sun. */
export class Sunbeam extends Entity {
  solid: Solid;
  lit = true;
  a: number;
  constructor(
    /** the top end, on a gallery floor (x, y); the beam runs down and away to `side` */
    readonly tx: number,
    readonly ty: number,
    readonly len: number,
    readonly side: -1 | 1,
    readonly o: BeamOpts,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(tx - 6, ty - 60, 12, 4);
    this.solid.oneWay = true;
    this.solid.collidable = false;
    this.a = this.angleAt(0);
  }
  angleAt(t: number) {
    const k = 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - (this.o.phase ?? 0))) / this.o.period);
    return this.o.a0 + (this.o.a1 - this.o.a0) * k;
  }
  /** horizontal reach from the top end */
  get reach() {
    return this.len * Math.cos(this.a);
  }
  get bx() {
    return this.tx + this.side * this.reach;
  }
  get by() {
    return this.ty + this.len * Math.sin(this.a);
  }
  /** the beam's top surface at x, or null off it */
  yAt(x: number): number | null {
    const d = (x - this.tx) * this.side;
    if (d < -2 || d > this.reach) return null;
    return this.ty + Math.max(0, d) * Math.tan(this.a);
  }
  /** how far down the beam x is (0 at the window, 1 at the low end) */
  uAt(x: number) {
    return ((x - this.tx) * this.side) / this.reach;
  }
  private cyc(t: number, every: number, phase = 0) {
    return (((t - phase) % every) + every) % every;
  }
  cloudy(t: number) {
    const c = this.o.cloud;
    return !!c && this.cyc(t, c.every, c.phase) < c.dur;
  }
  /** seconds until the next cloud (Infinity if none) */
  clearFor(t: number) {
    const c = this.o.cloud;
    if (!c) return Infinity;
    const u = this.cyc(t, c.every, c.phase);
    return u < c.dur ? 0 : c.every - u;
  }
  /** the shadow stripes' centres (fractions down the beam) */
  gapsAt(t: number): number[] {
    const g = this.o.gaps;
    if (!g) return [];
    const out: number[] = [];
    for (let k = 0; k < g.n; k++) out.push((((k / g.n + g.speed * t) % 1) + 1) % 1);
    return out;
  }
  inGap(u: number, t: number) {
    const g = this.o.gaps;
    if (!g) return false;
    return this.gapsAt(t).some((c) => Math.abs(u - c) < g.w / 2);
  }
  update(w: World) {
    const t = w.tick * DT;
    const p = w.player;
    const s = this.solid;
    this.a = this.angleAt(t);
    this.lit = !this.cloudy(t);
    const riding = s.collidable && p.isRiding(s);
    const y = this.yAt(p.cx);
    const here = y !== null && this.lit && !this.inGap(this.uAt(p.cx), t) && !p.hidden;
    w.flags.beamOn = riding;
    if (!here) {
      s.collidable = false;
      return;
    }
    const nx = Math.round(p.cx - 6);
    if (riding) {
      s.place(nx, s.y + s.yr);
      s.moveBy(w, 0, y - (s.y + s.yr));
      return;
    }
    // only a beam you're above can catch you
    if (p.y + p.h <= Math.round(y) + 1) {
      s.collidable = true;
      s.place(nx, Math.round(y));
    } else s.collidable = false;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const warn = this.clearFor(t) < 0.7;
    let alpha = this.lit ? 1 : 0.08;
    if (this.lit && warn) alpha = 0.45 + 0.55 * Math.abs(Math.sin(t * 22));
    const x0 = this.tx,
      y0 = this.ty,
      x1 = this.bx,
      y1 = this.by;
    // the light coming in above the window (faint, not to stand on)
    const ux = (x1 - x0) / this.len,
      uy = (y1 - y0) / this.len;
    ctx.save();
    ctx.globalAlpha = alpha * 0.35;
    ctx.fillStyle = 'rgba(255,236,170,0.55)';
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 - ux * 90, y0 - uy * 90);
    ctx.lineTo(x0 - ux * 90, y0 - uy * 90 + 16);
    ctx.lineTo(x0, y0 + 12);
    ctx.fill();
    ctx.restore();
    // the beam itself, cut by any shadow stripes
    const gaps = this.gapsAt(t);
    const gw = this.o.gaps?.w ?? 0;
    const segs: [number, number][] = [];
    if (!gaps.length) segs.push([0, 1]);
    else {
      const cuts = gaps.map((c) => [c - gw / 2, c + gw / 2] as [number, number]).sort((a, b) => a[0] - b[0]);
      let u = 0;
      for (const [a, b] of cuts) {
        if (a > u) segs.push([u, Math.min(1, a)]);
        u = Math.max(u, b);
      }
      if (u < 1) segs.push([u, 1]);
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    for (const [a, b] of segs) {
      const ax = x0 + (x1 - x0) * a,
        ay = y0 + (y1 - y0) * a,
        bx = x0 + (x1 - x0) * b,
        by = y0 + (y1 - y0) * b;
      // a soft glow, the body of the light, and a bright edge to stand on
      ctx.fillStyle = 'rgba(255,214,120,0.22)';
      ctx.beginPath();
      ctx.moveTo(ax, ay - 4);
      ctx.lineTo(bx, by - 4);
      ctx.lineTo(bx, by + 22);
      ctx.lineTo(ax, ay + 22);
      ctx.fill();
      const g = ctx.createLinearGradient(ax, ay, ax, ay + 16);
      g.addColorStop(0, 'rgba(255,232,150,0.95)');
      g.addColorStop(1, 'rgba(255,200,90,0.05)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx, by + 16);
      ctx.lineTo(ax, ay + 16);
      ctx.fill();
      ctx.strokeStyle = '#FFF8D8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    // dust motes drifting in it
    ctx.fillStyle = 'rgba(255,255,230,0.9)';
    for (let k = 0; k < 9; k++) {
      const u = (k * 0.137 + t * 0.05) % 1;
      const mx = x0 + (x1 - x0) * u + Math.sin(t * 1.3 + k) * 2;
      const my = y0 + (y1 - y0) * u + 3 + ((k * 5) % 9) + Math.cos(t + k) * 1.5;
      ctx.fillRect(mx, my, 1, 1);
    }
    ctx.restore();
    // where it comes in
    if (this.o.window === 'jharokha') {
      ctx.fillStyle = '#8D6E4A';
      ctx.fillRect(x0 - 8, y0 - 22, 16, 3);
      ctx.fillStyle = '#A1825C';
      ctx.beginPath();
      ctx.moveTo(x0 - 7, y0 - 19);
      ctx.lineTo(x0 - 7, y0 - 8);
      ctx.quadraticCurveTo(x0, y0 - 17, x0 + 7, y0 - 8);
      ctx.lineTo(x0 + 7, y0 - 19);
      ctx.fill();
      ctx.fillStyle = `rgba(255,240,190,${0.4 + 0.5 * alpha})`;
      ctx.beginPath();
      ctx.arc(x0, y0 - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** carved sandstone drawn over hidden tiles (a stepwell's galleries, landings and walls) */
export class Sandstone extends Entity {
  constructor() {
    super();
    this.layer = -2;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const cols = w.cols;
    for (let ty = 0; ty < 18; ty++)
      for (let tx = 0; tx < cols; tx++) {
        if (!w.hiddenTiles[ty * cols + tx]) continue;
        const x = tx * 16,
          y = ty * 16;
        const up = ty > 0 && w.hiddenTiles[(ty - 1) * cols + tx];
        const h = (tx * 73856093) ^ (ty * 19349663);
        ctx.fillStyle = (h & 3) === 0 ? '#E2BF8A' : '#EAC996';
        ctx.fillRect(x, y, 16, 16);
        const dn = ty < 17 && w.hiddenTiles[(ty + 1) * cols + tx];
        if (!dn) {
          ctx.fillStyle = '#7A5530';
          ctx.fillRect(x, y + 13, 16, 3);
        }
        ctx.fillStyle = 'rgba(110,70,30,0.28)';
        ctx.fillRect(x, y + 15, 16, 1);
        ctx.fillRect(x + ((ty & 1) ? 0 : 8), y, 1, 16);
        if (!up) {
          // a carved lip along the top, a band of little flowers under it
          ctx.fillStyle = '#B98D57';
          ctx.fillRect(x, y, 16, 3);
          ctx.fillStyle = 'rgba(255,248,225,0.8)';
          ctx.fillRect(x, y, 16, 1);
          ctx.fillStyle = 'rgba(120,80,40,0.45)';
          ctx.fillRect(x + 4, y + 6, 2, 2);
          ctx.fillRect(x + 11, y + 6, 2, 2);
        } else if ((h & 15) === 5) {
          // a kalash pot carved in relief
          ctx.fillStyle = 'rgba(120,80,40,0.4)';
          ctx.beginPath();
          ctx.arc(x + 8, y + 9, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(x + 6.5, y + 4, 3, 2);
        }
      }
  }
}

/** An Asiatic lion of Gir. It only stalks you while your back is turned: look at it (face it) and it
 *  sits down and yawns, and backs off if it's close. Let it reach you while you're looking away and
 *  it pounces. It can't climb rocks, and it won't come past a closed gate. Asleep, it lies still
 *  until you've gone past it. A show-off one (`vain`) is the other way round: it only struts about
 *  while you're watching it. */
export class Lion extends Entity {
  x: number;
  hazard: Hazard;
  state: 'sleep' | 'sit' | 'creep' | 'back' | 'strut' = 'sit';
  face: 1 | -1 = -1;
  /** a strutting show-off's direction */
  sdir: 1 | -1 = 1;
  private moved = 0;
  private wokeAt = -999;
  constructor(
    x: number,
    readonly floor: number,
    readonly o: { speed?: number; wake?: number; x0?: number; x1?: number; maned?: boolean; asleep?: boolean; vain?: { x0: number; x1: number; speed: number } } = {},
  ) {
    super();
    this.x = x;
    this.layer = 2;
    if (o.asleep) this.state = 'sleep';
    this.hazard = { active: true, cause: 'mauled', hits: (x2, y2, w2, h2) => x2 < this.x + 12 && x2 + w2 > this.x - 12 && y2 < this.floor && y2 + h2 > this.floor - 15 };
  }
  get speed() {
    return this.o.speed ?? 110;
  }
  /** is Dad looking at this lion? */
  watched(w: World) {
    const p = w.player;
    return p.facing === Math.sign(this.x - p.cx);
  }
  private step(w: World, dx: number) {
    const nx = Math.max(this.o.x0 ?? -1e9, Math.min(this.o.x1 ?? 1e9, this.x + dx));
    if (w.solidAt(Math.round(nx - 14), this.floor - 16, 28, 14)) return;
    this.x = nx;
    this.moved += Math.abs(dx);
  }
  update(w: World) {
    const p = w.player;
    if (w.state !== 'play') return;
    const dx = p.cx - this.x;
    const dist = Math.abs(dx);
    const low = p.y + p.h >= this.floor - 20;
    const looking = this.watched(w);
    const v = this.o.vain;
    if (v) {
      // the show-off: struts between its marks only while you watch
      if (looking && dist < 260) {
        this.state = 'strut';
        if (this.x >= v.x1) this.sdir = -1;
        if (this.x <= v.x0) this.sdir = 1;
        this.step(w, this.sdir * v.speed * DT);
        this.face = this.sdir;
      } else this.state = 'sit';
      w.flags.vain = { x: this.x, dir: this.sdir, state: this.state };
      return;
    }
    if (this.state === 'sleep') {
      // wakes once you've gone past it (or come right up to it), and takes a moment to get up
      if (dist < 10 || (this.o.wake !== undefined && dist < this.o.wake) || (dx > 0 && p.x > this.x + 14)) {
        this.state = 'sit';
        this.wokeAt = w.tick;
        w.sfx('snort', this.x, this.floor - 10);
        w.say('Grrr...', this.x, this.floor - 24, 0.9, 'npc');
      } else return;
    }
    this.face = dx >= 0 ? 1 : -1;
    if (w.tick - this.wokeAt < 108) {
      this.state = 'sit';
      return;
    }
    if (dist > 300) {
      this.state = 'sit';
      return;
    }
    if (looking) {
      // looked at: sit, and back off if too close
      if (dist < 56 && low) {
        this.state = 'back';
        this.step(w, -this.face * 60 * DT);
      } else this.state = 'sit';
      return;
    }
    // your back's turned: it stalks you, and springs once it's close
    this.state = 'creep';
    if (low && dist <= 26) {
      w.die('mauled');
      w.sfx('snort', this.x, this.floor - 10);
      return;
    }
    if (dist > 18) this.step(w, this.face * this.speed * DT);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const x = this.x,
      fy = this.floor,
      f = this.face;
    const crouch = this.state === 'creep' ? 3 : 0;
    const sit = this.state === 'sit' || this.state === 'sleep';
    const gait = this.state === 'creep' || this.state === 'back' || this.state === 'strut' ? Math.sin(this.moved * 0.25) * 2 : 0;
    ctx.save();
    ctx.translate(x, fy);
    ctx.scale(f, 1);
    const body = '#C8963E',
      dark = '#9C6E28';
    // tail with its tuft
    ctx.strokeStyle = body;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, -10 + crouch);
    ctx.quadraticCurveTo(-20, -14 + Math.sin(t * 3) * 3, -22, -4);
    ctx.stroke();
    ctx.fillStyle = '#5D3A12';
    ctx.beginPath();
    ctx.arc(-22, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    // body (lying flat when asleep)
    ctx.fillStyle = body;
    if (this.state === 'sleep') {
      ctx.beginPath();
      ctx.ellipse(0, -5, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.ellipse(0, -9 + crouch, 13, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // legs
      ctx.fillStyle = dark;
      ctx.fillRect(-10, -6 + crouch, 3, 6 - crouch + gait * 0.5);
      ctx.fillRect(7, -6 + crouch, 3, 6 - crouch - gait * 0.5);
      if (sit) ctx.fillRect(-3, -6, 3, 6);
    }
    // head and mane
    const hy = this.state === 'sleep' ? -6 : sit ? -15 : -12 + crouch;
    if (this.o.maned ?? true) {
      ctx.fillStyle = '#8D5A1E';
      ctx.beginPath();
      ctx.arc(12, hy, 7.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(13, hy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(14, hy, 6, 4);
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(19, hy + 0.5, 1.6, 1.6);
    if (this.state === 'sleep') {
      // asleep: eyes shut, a z
      ctx.fillRect(14, hy - 1.5, 3, 0.8);
    } else if (sit && Math.sin(t * 1.3 + x) > 0.6) {
      // a big yawn
      ctx.fillStyle = '#8E2B2B';
      ctx.fillRect(15, hy + 2, 5, 3.5);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(14, hy - 2, 2, 1);
    } else {
      // eyes: narrowed and glinting when it's stalking
      ctx.fillStyle = this.state === 'creep' ? '#FFEB3B' : '#3E2723';
      ctx.fillRect(14, hy - 2.5, 2.2, this.state === 'creep' ? 1 : 1.6);
    }
    ctx.restore();
    if (this.state === 'sleep') {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '6px sans-serif';
      ctx.fillText('z', x + 6, fy - 16 - ((t * 6) % 6));
    }
  }
}

/** A forest checkpost gate (naka): tall bars that slide up into their frame now and then. */
export class Naka extends Entity {
  solid: Solid;
  open = false;
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly o: { every: number; dur: number; phase?: number; h?: number },
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x, floor - (o.h ?? 96), 10, o.h ?? 96);
  }
  /** seconds until it next opens (0 while open) */
  untilOpen(t: number) {
    const u = (((t - (this.o.phase ?? 0)) % this.o.every) + this.o.every) % this.o.every;
    return u < this.o.dur ? 0 : this.o.every - u;
  }
  /** seconds it stays open from now (0 if shut) */
  openFor(t: number) {
    const u = (((t - (this.o.phase ?? 0)) % this.o.every) + this.o.every) % this.o.every;
    return u < this.o.dur ? this.o.dur - u : 0;
  }
  update(w: World) {
    const t = w.tick * DT;
    const was = this.open;
    this.open = this.untilOpen(t) === 0;
    // it doesn't close on Dad
    const p = w.player;
    if (!this.open && was && p.x < this.x + 10 && p.x + p.w > this.x && p.y < this.floor && p.y + p.h > this.floor - (this.o.h ?? 96)) this.open = true;
    this.solid.collidable = !this.open;
    if (this.open !== was) w.sfx(this.open ? 'creak' : 'thud', this.x + 5, this.floor - 40);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const h = this.o.h ?? 96;
    const t = w.tick * DT;
    const lift = this.open ? Math.min(1, (this.o.dur - this.openFor(t) + 0.0001) / 0.25) : 0;
    const top = this.floor - h;
    // the frame: two posts and a board on top
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(this.x - 4, top - 14, 4, h + 14);
    ctx.fillRect(this.x + 10, top - 14, 4, h + 14);
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(this.x - 10, top - 26, 30, 12);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SASAN GIR', this.x + 5, top - 18);
    // the bars, slid up while it's open
    ctx.fillStyle = '#455A64';
    // the bars retract up into the top beam while it's open
    const len = Math.max(4, h - lift * (h - 4));
    for (let k = 0; k < 3; k++) ctx.fillRect(this.x + 1 + k * 3.5, top, 2, len);
    if (len > h * 0.3) ctx.fillRect(this.x, top + Math.min(h * 0.3, len - 2), 10, 2);
    if (len > h * 0.7) ctx.fillRect(this.x, top + h * 0.7, 10, 2);
  }
}

/** a peacock feather: a long stem and its eye */
export function featherArt(ctx: CanvasRenderingContext2D, x: number, y: number, ang: number, len = 12) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.strokeStyle = '#7CB342';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len);
  ctx.stroke();
  ctx.fillStyle = '#558B2F';
  ctx.beginPath();
  ctx.ellipse(0, -len + 1, 2.6, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C0A030';
  ctx.beginPath();
  ctx.ellipse(0, -len + 1.4, 1.8, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1565C0';
  ctx.beginPath();
  ctx.ellipse(0, -len + 1.8, 1.1, 1.7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Peacock feathers (mor pankh) Dad tucks in his hair: each one is a flap, a second jump in the air.
 *  He can carry three. In monsoon mud (`mud`) his feet stick: no jumping from it at all, but a
 *  feather still flaps him out. */
export class Feathers extends Entity {
  n = 0;
  flaps = 0;
  lastFlap = -999;
  /** where the ground is mud: [x0, x1] ranges at floor `top` */
  mud: { x0: number; x1: number; top: number }[] = [];
  private told = -999;
  /** feathers fluttering away after a flap */
  private spent: { x: number; y: number; t0: number }[] = [];
  static MAX = 3;
  static VY = 340;
  constructor() {
    super();
    this.layer = 5;
  }
  inMud(w: World) {
    const p = w.player;
    return this.mud.some((m) => p.cx >= m.x0 && p.cx <= m.x1 && p.y + p.h === m.top);
  }
  update(w: World) {
    const p = w.player;
    if (w.state !== 'play' || !w.input.jumpPressed || p.stun > 0 || p.grip) return;
    const mud = p.onGround && this.inMud(w);
    const air = !p.onGround && p.coyoteT <= 0;
    if (!mud && !air) return;
    if (this.n <= 0) {
      if (mud) {
        // stuck in the mud: no jump
        p.stun = 1;
        if (w.tick - this.told > 200) {
          this.told = w.tick;
          w.say('Kichad! Pag chonti gaya! | Mud! My feet are stuck!', p.cx, p.y - 12, 1.2, 'npc');
        }
        w.emit('fx', p.cx, p.y + p.h, { kind: 'dust' });
      }
      return;
    }
    this.n--;
    this.flaps++;
    this.lastFlap = w.tick;
    p.vy = -Feathers.VY;
    p.onGround = false;
    p.coyoteT = 0;
    p.jumping = true;
    p.launched = false;
    p.jumpTick = w.tick;
    this.spent.push({ x: p.cx, y: p.y, t0: w.tick });
    w.sfx('jump', p.cx, p.y + p.h);
    w.emit('fx', p.cx, p.y + p.h, { kind: 'dust' });
    w.flags.feathers = this.n;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    const t = w.tick * DT;
    if (!p.dead && !p.hidden)
      for (let i = 0; i < this.n; i++) {
        const a = (i - (this.n - 1) / 2) * 0.35 - p.facing * 0.25 + Math.sin(t * 3 + i) * 0.05;
        featherArt(ctx, p.cx - p.facing * 2, p.y + 2, a, 13);
      }
    this.spent = this.spent.filter((s) => w.tick - s.t0 < 150);
    for (const s of this.spent) {
      const k = (w.tick - s.t0) / 150;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      featherArt(ctx, s.x + Math.sin(k * 9) * 8, s.y + 6 + k * 40, Math.sin(k * 7) * 0.8, 12);
      ctx.restore();
    }
  }
}

/** a feather lying in the grass: walk into it to pick it up */
export class FeatherPickup extends Entity {
  taken = false;
  constructor(
    readonly x: number,
    readonly y: number,
    readonly bag: Feathers,
  ) {
    super();
    this.layer = 3;
  }
  update(w: World) {
    if (this.taken || w.state !== 'play') return;
    const p = w.player;
    if (this.bag.n >= Feathers.MAX) return;
    if (p.x < this.x + 4 && p.x + p.w > this.x - 4 && p.y < this.y + 2 && p.y + p.h > this.y - 14) {
      this.taken = true;
      this.bag.n++;
      w.flags.feathers = this.bag.n;
      w.sfx('collect', this.x, this.y);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.taken) return;
    const t = w.tick * DT;
    featherArt(ctx, this.x, this.y, -0.35 + Math.sin(t * 2 + this.x) * 0.12, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(this.x - 1 + Math.sin(t * 5) * 3, this.y - 18, 1, 1);
  }
}

/** A peacock. When the thunder rolls it fans its tail and dances, and leaves a feather at its feet
 *  (if the last one has been taken). */
export class Peacock extends Entity {
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly spot: FeatherPickup | null,
    readonly o: { period: number; phase?: number; face?: 1 | -1 },
  ) {
    super();
    this.layer = 1;
  }
  private lastK = -1;
  danceT = -999;
  update(w: World) {
    const t = w.tick * DT;
    const k = Math.floor((t - (this.o.phase ?? 0)) / this.o.period);
    if (k !== this.lastK) {
      this.lastK = k;
      if (k >= 0 && t > 0.05) {
        this.danceT = w.tick;
        w.sfx('rumble', this.x, this.floor - 60);
        w.say('Mehaao!', this.x, this.floor - 34, 1, 'npc');
        if (this.spot && this.spot.taken) this.spot.taken = false;
      }
    }
  }
  /** seconds until it next dances */
  next(t: number) {
    const u = (((t - (this.o.phase ?? 0)) % this.o.period) + this.o.period) % this.o.period;
    return this.o.period - u;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.x,
      fy = this.floor,
      f = this.o.face ?? 1;
    const since = (w.tick - this.danceT) * DT;
    const fan = since < 2.2 ? Math.min(1, since / 0.3) * Math.min(1, (2.2 - since) / 0.3) : 0;
    const shake = fan > 0.9 ? Math.sin(w.tick * 1.3) * 0.03 : 0;
    ctx.save();
    ctx.translate(x, fy);
    ctx.scale(f, 1);
    if (fan > 0.02) {
      // the fan: a half wheel of eyed feathers
      for (let i = 0; i <= 14; i++) {
        const a = Math.PI + (i / 14) * Math.PI + shake;
        const r = 30 * fan;
        const ex = -4 + Math.cos(a) * r,
          ey = -14 + Math.sin(a) * r;
        ctx.strokeStyle = '#558B2F';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-4, -14);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.arc(ex, ey, 3.6 * fan, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#C0A030';
        ctx.beginPath();
        ctx.arc(ex, ey, 2.4 * fan, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0D47A1';
        ctx.beginPath();
        ctx.arc(ex, ey, 1.3 * fan, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // the train trailing behind
      ctx.fillStyle = '#558B2F';
      ctx.beginPath();
      ctx.moveTo(-4, -10);
      ctx.quadraticCurveTo(-20, -8, -30, -2);
      ctx.lineTo(-28, 1);
      ctx.quadraticCurveTo(-16, -3, -3, -6);
      ctx.fill();
      ctx.fillStyle = '#1565C0';
      for (let k = 0; k < 4; k++) ctx.fillRect(-26 + k * 6, -4 - k * 0.6, 2, 2);
    }
    // body, neck and crest
    ctx.fillStyle = '#1565C0';
    ctx.beginPath();
    ctx.ellipse(0, -10, 6, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, -12);
    ctx.quadraticCurveTo(5, -20, 4, -24);
    ctx.lineTo(7, -24);
    ctx.quadraticCurveTo(8, -18, 6, -11);
    ctx.fill();
    ctx.fillStyle = '#0D47A1';
    for (let k = -1; k <= 1; k++) ctx.fillRect(5 + k * 1.4, -28, 0.6, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(6, -23, 1.2, 1);
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(7.5, -22.5, 2, 1);
    ctx.fillStyle = '#795548';
    ctx.fillRect(-2, -6, 1, 6);
    ctx.fillRect(2, -6, 1, 6);
    ctx.restore();
  }
}

export interface Ring {
  /** radius (px), number of dancers, turn speed (rad/s; + = the near side moves right) */
  r: number;
  n: number;
  w: number;
  phase?: number;
}

/** A garba: rings of dancers circling the garbo lamp, seen from the side. Each ring is a circle on
 *  the ground, so its dancers only cross Dad's path at the ring's two ends; everywhere else they pass
 *  in front of him or behind him. Bump into one at an end and you're knocked flat. */
export class GarbaRing extends Entity {
  static Z = 0.22;
  /** Dad dancing in a ring (the door ending): which ring, and his angle in it */
  joined: { ring: number; th: number } | null = null;
  hazard: Hazard;
  front: Entity;
  constructor(
    readonly cx: number,
    readonly floor: number,
    readonly rings: Ring[],
    readonly o: { garbo?: boolean; door?: boolean } = {},
  ) {
    super();
    this.layer = 1;
    this.hazard = { active: true, cause: 'garba', hits: (x, y, ww, h) => !this.joined && this.hitsAt(x, y, ww, h, 0) };
    const self = this;
    this.front = new (class extends Entity {
      layer = 4;
      draw(ctx: CanvasRenderingContext2D, w: World) {
        self.drawDancers(ctx, w, true);
      }
    })();
  }
  /** a ring's base angle at time t */
  angle(i: number, t: number) {
    const R = this.rings[i];
    return (R.phase ?? 0) + R.w * t;
  }
  private time = 0;
  /** is there a dancer at Dad's depth overlapping this box, `dt` seconds from now? */
  hitsAt(x: number, y: number, ww: number, h: number, dt: number) {
    if (y + h <= this.floor - 60 || y >= this.floor) return false;
    const t = this.time + dt;
    for (let i = 0; i < this.rings.length; i++) {
      const R = this.rings[i];
      const a = this.angle(i, t);
      for (let k = 0; k < R.n; k++) {
        const th = a + (2 * Math.PI * k) / R.n;
        if (Math.abs(Math.sin(th)) >= GarbaRing.Z) continue;
        const dx = this.cx + R.r * Math.cos(th);
        if (x < dx + 5 && x + ww > dx - 5) return true;
      }
    }
    return false;
  }
  update(w: World) {
    this.time = w.tick * DT;
    const j = this.joined;
    if (j) {
      const R = this.rings[j.ring];
      j.th += R.w * DT;
      const p = w.player;
      const nx = Math.round(this.cx + R.r * Math.cos(j.th) - p.w / 2);
      // he's pulled into the ring from just outside it, then moves with it
      const dx = nx - p.x;
      p.vx = 0;
      p.x += Math.abs(dx) <= 3 ? dx : Math.sign(dx) * 3;
      p.xr = 0;
      p.stun = 2;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    // the circles chalked on the ground
    ctx.strokeStyle = 'rgba(255,240,200,0.18)';
    ctx.lineWidth = 1;
    for (const R of this.rings) {
      ctx.beginPath();
      ctx.ellipse(this.cx, this.floor - 1, R.r, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.o.garbo ?? true) {
      // the garbo: a holed clay pot with a lamp inside, on a stand with marigolds
      const gx = this.cx,
        gy = this.floor - 26;
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(gx - 2, gy + 8, 4, 18);
      ctx.fillRect(gx - 8, this.floor - 3, 16, 3);
      const g = ctx.createRadialGradient(gx, gy, 2, gx, gy, 26);
      g.addColorStop(0, 'rgba(255,200,90,0.55)');
      g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gx - 26, gy - 26, 52, 52);
      ctx.fillStyle = '#B5652F';
      ctx.beginPath();
      ctx.ellipse(gx, gy, 7, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE082';
      for (let k = 0; k < 6; k++) {
        const a = k + t * 0.5;
        ctx.fillRect(gx + Math.cos(a) * 4 - 0.6, gy + Math.sin(a * 1.7) * 4 - 0.6, 1.3, 1.3);
      }
      ctx.fillStyle = '#FF8F00';
      ctx.beginPath();
      ctx.moveTo(gx, gy - 14 - Math.sin(t * 9));
      ctx.quadraticCurveTo(gx + 2, gy - 9, gx, gy - 8);
      ctx.quadraticCurveTo(gx - 2, gy - 9, gx, gy - 14 - Math.sin(t * 9));
      ctx.fill();
      ctx.fillStyle = '#FFB300';
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath();
        ctx.arc(gx + k * 3, gy + 8, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    this.drawDancers(ctx, w, false);
  }
  /** the dancers on one side of Dad's line: behind (z < 0) or in front (z >= 0) */
  drawDancers(ctx: CanvasRenderingContext2D, w: World, front: boolean) {
    const t = w.tick * DT;
    const list: { x: number; z: number; k: number; spin: number }[] = [];
    for (let i = 0; i < this.rings.length; i++) {
      const R = this.rings[i];
      const a = this.angle(i, t);
      for (let k = 0; k < R.n; k++) {
        const th = a + (2 * Math.PI * k) / R.n;
        const z = Math.sin(th);
        if (z >= 0 !== front) continue;
        list.push({ x: this.cx + R.r * Math.cos(th), z, k: k + i * 7, spin: th * 2 + t * 3 });
      }
    }
    list.sort((a, b) => a.z - b.z);
    for (const d of list) dancer(ctx, d.x, this.floor + d.z * 5, 1 + d.z * 0.16, d.k, d.spin, d.z);
  }
}

/** a garba dancer: a twirling chaniya choli (or a kediyu), dandiya sticks up */
function dancer(ctx: CanvasRenderingContext2D, x: number, feet: number, s: number, k: number, spin: number, z: number) {
  const skirts = ['#D81B60', '#FFB300', '#8E24AA', '#E53935', '#00897B', '#F4511E', '#3949AB'];
  const man = k % 3 === 2;
  const col = man ? '#FAFAFA' : skirts[k % skirts.length];
  ctx.save();
  ctx.translate(x, feet);
  ctx.scale(s, s);
  if (z < 0) ctx.globalAlpha = 0.75 + 0.25 * (1 + z);
  const sw = Math.sin(spin) * 3;
  // skirt (flares as it twirls), with mirror-work glints
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-3, -14);
  ctx.lineTo(3, -14);
  ctx.lineTo(7 + sw * 0.5, -1);
  ctx.lineTo(-7 + sw * 0.5, -1);
  ctx.closePath();
  ctx.fill();
  if (!man) {
    ctx.fillStyle = '#FFF59D';
    for (let m = 0; m < 3; m++) ctx.fillRect(-4 + m * 3 + sw * 0.3, -4, 1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(-7 + sw * 0.5, -2, 14, 1);
  } else {
    ctx.fillStyle = '#C62828';
    ctx.fillRect(-6 + sw * 0.5, -3, 12, 1.5);
  }
  // legs, body, head
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(-2, -1, 1.5, 1);
  ctx.fillRect(1, -1, 1.5, 1);
  ctx.fillStyle = man ? '#FAFAFA' : '#FFCA28';
  ctx.fillRect(-2.5, -20, 5, 7);
  ctx.fillStyle = '#A0693F';
  ctx.beginPath();
  ctx.arc(0, -23, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = man ? '#E53935' : '#3E2723';
  if (man) ctx.fillRect(-3, -27, 6, 2.5);
  else {
    ctx.beginPath();
    ctx.arc(0, -24, 3.2, Math.PI, 0);
    ctx.fill();
  }
  // dandiya sticks raised, clicking together
  const c = Math.sin(spin * 1.5) * 0.4;
  ctx.strokeStyle = '#FFD54F';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-3, -18);
  ctx.lineTo(-6 - c * 4, -30);
  ctx.moveTo(3, -18);
  ctx.lineTo(6 + c * 4, -30);
  ctx.stroke();
  ctx.restore();
}

/** a small seeded random walk for prices (the same every run) */
export function prices(seed: number, n: number, lo: number, hi: number, step: number, start: number) {
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out: number[] = [];
  let p = start;
  for (let i = 0; i < n; i++) {
    p += Math.round((rnd() * 2 - 1) * step);
    if (p < lo) p = lo + (lo - p);
    if (p > hi) p = hi - (p - hi);
    out.push(Math.max(lo, Math.min(hi, p)));
  }
  return out;
}

/** GIFT City's trading screen as the floor: a candle chart scrolling left. Each candle is a ledge you
 *  can stand on (and jump up through); green ones closed higher than the last, red ones lower. The
 *  chart carries you back with it, and the candle under you scrolls off the screen in the end. */
export class Ticker extends Entity {
  solids: Solid[] = [];
  /** each candle's price (its top is `base - price`) */
  pr: number[] = [];
  private next = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly base: number,
    readonly seq: number[],
    readonly o: { cw?: number; speed?: number } = {},
  ) {
    super();
    this.layer = 2;
    const cw = this.cw;
    for (let x = x0; x < x1 + cw; x += cw) {
      const p = seq[this.next++ % seq.length];
      const s = new Solid(x, base - Math.max(p, 4), cw - 2, Math.max(p, 4) + 40);
      this.solids.push(s);
      this.pr.push(p);
    }
    this.hazard = { active: true, cause: 'crash', hits: (x, y, ww, h) => x + ww > this.x0 && x < this.x1 && y + h > this.base + 30 };
    this.gate();
  }
  hazard: Hazard;
  /** only candles fully on the screen (and with a price: a 0 is a trading halt, a hole) are solid */
  private gate() {
    for (let i = 0; i < this.solids.length; i++) {
      const s = this.solids[i];
      s.collidable = this.pr[i] > 0 && s.x + s.w > this.x0 && s.x + s.w <= this.x1;
    }
  }
  get cw() {
    return this.o.cw ?? 12;
  }
  get speed() {
    return this.o.speed ?? 28;
  }
  update(w: World) {
    const v = this.speed;
    // left to right, so a candle never shoves Dad off the one he rides
    const order = this.solids.map((s, i) => i).sort((a, b) => this.solids[a].x - this.solids[b].x);
    for (const i of order) {
      const s = this.solids[i];
      s.velX = -v;
      s.moveBy(w, -v * DT, 0);
    }
    // a candle gone off the left end comes back on at the right with the next price
    for (let i = 0; i < this.solids.length; i++) {
      const s = this.solids[i];
      if (s.x + s.w <= this.x0) {
        let right = -Infinity;
        for (const q of this.solids) right = Math.max(right, q.x + q.xr);
        const p = this.seq[this.next++ % this.seq.length];
        s.place(right + this.cw, this.base - Math.max(p, 4));
        s.h = Math.max(p, 4) + 40;
        this.pr[i] = p;
      }
    }
    this.gate();
  }
  /** the candle (if any) whose top is under world x */
  under(x: number) {
    for (let i = 0; i < this.solids.length; i++) {
      const s = this.solids[i];
      if (x >= s.x && x < s.x + s.w && s.x >= this.x0 - 1 && s.x + s.w <= this.x1 + 1) return { s, p: this.pr[i], i };
    }
    return null;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    // the screen behind: grid lines and the index readout
    ctx.fillStyle = 'rgba(8,16,28,0.85)';
    ctx.fillRect(this.x0 - 4, 40, this.x1 - this.x0 + 8, this.base - 30);
    ctx.strokeStyle = 'rgba(80,140,200,0.18)';
    ctx.lineWidth = 0.6;
    for (let y = 60; y < this.base + 10; y += 20) {
      ctx.beginPath();
      ctx.moveTo(this.x0 - 4, y);
      ctx.lineTo(this.x1 + 4, y);
      ctx.stroke();
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x0 - 4, 0, this.x1 - this.x0 + 8, 300);
    ctx.clip();
    for (let i = 0; i < this.solids.length; i++) {
      const s = this.solids[i];
      const x = s.x + s.xr;
      // compare with the candle to its left
      let prev = this.pr[i];
      let best = -Infinity;
      for (let k = 0; k < this.solids.length; k++) {
        const q = this.solids[k];
        if (q.x < s.x && q.x > best) {
          best = q.x;
          prev = this.pr[k];
        }
      }
      if (this.pr[i] <= 0) {
        ctx.fillStyle = 'rgba(255,214,0,0.5)';
        ctx.fillRect(x + s.w / 2 - 0.5, this.base - 20, 1, 20);
        continue;
      }
      const up = this.pr[i] >= prev;
      const col = up ? '#00C853' : '#FF1744';
      // the wick, then the body down to the floor of the screen
      ctx.fillStyle = up ? 'rgba(0,200,83,0.55)' : 'rgba(255,23,68,0.55)';
      ctx.fillRect(x + s.w / 2 - 0.5, s.y - 8, 1, 8);
      ctx.fillStyle = col;
      ctx.fillRect(x, s.y, s.w, 6);
      ctx.fillStyle = up ? 'rgba(0,200,83,0.35)' : 'rgba(255,23,68,0.3)';
      ctx.fillRect(x, s.y + 6, s.w, this.base + 40 - s.y);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(x, s.y, s.w, 1);
    }
    ctx.restore();
    // the index readout
    const c = this.under(w.player.cx);
    const val = 18000 + (c ? c.p : this.pr[0]) * 9 + Math.round(Math.sin(t * 7) * 3);
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`IFSC INDEX ${val.toLocaleString('en-IN')}`, this.x0 + 4, 52);
  }
}
