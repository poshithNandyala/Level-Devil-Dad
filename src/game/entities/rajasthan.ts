// Jaipur's (and Rajasthan's) moving parts: kathputli strings, a tower of pots on your head, the marble
// bowls of Jantar Mantar, bolts of cloth, the dummy horse of the Kachchhi Ghodi dance.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT, ROOM_H, secs } from '../constants';

/** A kathputli stage: while Dad is on it he's a puppet on strings. His own jumps do nothing; on every
 *  beat of the dholak the puppeteer jerks him up (if he's standing). He can still walk and steer. */
export class Strings extends Entity {
  on = false;
  private k = 0;
  nextAt: number;
  lastBeat = -999;
  beats = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top: number,
    readonly o: { pattern: number[]; vy?: number; phase?: number },
  ) {
    super();
    this.layer = 4;
    this.nextAt = secs(o.phase ?? 0.6);
  }
  get vy() {
    return this.o.vy ?? 400;
  }
  /** is Dad on this stage (on its strings)? */
  holds(w: World) {
    const p = w.player;
    return !p.dead && p.cx >= this.x0 && p.cx <= this.x1 && p.y > this.top - 20;
  }
  /** ticks until the next beat */
  until(w: World) {
    return this.nextAt - w.tick;
  }
  /** the beat after next (ticks from now) */
  after(w: World) {
    return this.until(w) + secs(this.o.pattern[this.k % this.o.pattern.length]);
  }
  update(w: World) {
    const p = w.player;
    this.on = this.holds(w);
    // on any stage, his own jumps do nothing
    p.noJump = (w.entities.filter((e) => e instanceof Strings) as Strings[]).some((s) => s.holds(w));
    if (w.tick < this.nextAt) return;
    // the beat
    this.k++;
    this.nextAt = w.tick + secs(this.o.pattern[(this.k - 1) % this.o.pattern.length]);
    this.lastBeat = w.tick;
    this.beats++;
    if (this.on) w.sfx('dong', p.cx, this.top);
    if (this.on && p.onGround && w.state === 'play') {
      p.vy = -this.vy;
      p.launched = true;
      p.jumping = false;
      p.onGround = false;
      p.coyoteT = 0;
      p.jumpTick = w.tick;
      w.flags.yanks = (w.flags.yanks ?? 0) + 1;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    const t = w.tick * DT;
    // the puppeteer's control bar over Dad (or resting at the stage's left), and the strings down to him
    const bx = this.on ? p.cx : this.x0 + 20;
    const tight = this.on && (this.until(w) < 18 || w.tick - this.lastBeat < 10);
    const by = this.top + (w.tick - this.lastBeat < 10 ? -4 : 0);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(bx - 12, by - 2, 24, 3);
    ctx.fillRect(bx - 1.5, by - 10, 3, 9);
    // the puppeteer's hand
    ctx.fillStyle = '#A0693F';
    ctx.beginPath();
    ctx.arc(bx, by - 11, 3, 0, Math.PI * 2);
    ctx.fill();
    if (!this.on || p.dead) return;
    ctx.strokeStyle = tight ? 'rgba(255,255,240,0.95)' : 'rgba(255,255,240,0.55)';
    ctx.lineWidth = tight ? 0.9 : 0.6;
    ctx.beginPath();
    for (const [sx, tx, ty] of [
      [-11, p.cx - 5, p.y + 6],
      [0, p.cx, p.y],
      [11, p.cx + 5, p.y + 6],
    ] as [number, number, number][]) {
      ctx.moveTo(bx + sx, by);
      if (tight) ctx.lineTo(tx, ty);
      else ctx.quadraticCurveTo((bx + sx + tx) / 2 + Math.sin(t * 3 + sx) * 2, (by + ty) / 2 + 6, tx, ty);
    }
    ctx.stroke();
  }
}

/** a kathputli puppet theatre framing a stretch of stage: red curtains, a valance with tassels */
export function stageArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number, floor: number) {
  // the painted backdrop: a palace scene in faded colours
  ctx.fillStyle = 'rgba(255,214,150,0.18)';
  ctx.fillRect(x0, top, x1 - x0, floor - top);
  ctx.fillStyle = 'rgba(180,90,70,0.22)';
  for (let x = x0 + 30; x < x1 - 30; x += 70) {
    ctx.fillRect(x, floor - 70, 40, 70);
    ctx.beginPath();
    ctx.arc(x + 20, floor - 70, 20, Math.PI, 0);
    ctx.fill();
  }
  // curtains at the sides
  for (const [cx, dir] of [
    [x0, 1],
    [x1, -1],
  ] as [number, number][]) {
    ctx.fillStyle = '#B71C1C';
    ctx.beginPath();
    ctx.moveTo(cx, top);
    ctx.lineTo(cx + dir * 22, top);
    ctx.quadraticCurveTo(cx + dir * 8, (top + floor) / 2, cx + dir * 14, floor);
    ctx.lineTo(cx, floor);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let k = 1; k < 4; k++) ctx.fillRect(cx + dir * k * 5, top, 1.2, floor - top);
  }
  // the valance with its tassels
  ctx.fillStyle = '#880E4F';
  ctx.fillRect(x0 - 4, top - 6, x1 - x0 + 8, 12);
  ctx.fillStyle = '#FFC107';
  ctx.fillRect(x0 - 4, top + 5, x1 - x0 + 8, 2);
  for (let x = x0; x < x1; x += 10) {
    ctx.fillRect(x, top + 7, 1.5, 5);
    ctx.beginPath();
    ctx.arc(x + 0.75, top + 13, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Bhavai: a tower of pots (matkas) balanced on Dad's head. It sways like a pendulum: every start,
 *  stop and turn kicks it the other way, a landing kicks it further the way it leans, and the breeze
 *  from the windows pushes it. Let it lean past the limit and down it comes. */
export class Pots extends Entity {
  /** lean (radians, + = to the right) and its rate */
  th = 0;
  om = 0;
  n: number;
  held = true;
  private lastVx = 0;
  /** breeze zones: [x0, x1], direction, and when it blows */
  breezes: { x0: number; x1: number; dir: 1 | -1; every: number; on: number; phase?: number; push?: number }[] = [];
  static K0 = 9;
  static C = 0.45;
  static KICK = 0.0045;
  static MAX = 0.55;
  constructor(n = 4) {
    super();
    this.n = n;
    this.layer = 4;
  }
  /** is breeze zone b blowing at time t? */
  blowing(b: Pots['breezes'][number], t: number) {
    const u = (((t - (b.phase ?? 0)) % b.every) + b.every) % b.every;
    return u < b.on;
  }
  /** the torque the breeze puts on the stack where Dad is now */
  wind(w: World) {
    const p = w.player,
      t = w.tick * DT;
    let tq = 0;
    for (const b of this.breezes) if (p.cx >= b.x0 && p.cx <= b.x1 && this.blowing(b, t)) tq += b.dir * (b.push ?? 1.8);
    return tq;
  }
  update(w: World) {
    const p = w.player;
    if (!this.held || w.state !== 'play') {
      this.lastVx = p.vx;
      return;
    }
    const a = (p.vx + p.carryVx - this.lastVx) / DT;
    this.lastVx = p.vx + p.carryVx;
    let acc = -Pots.K0 * Math.sin(this.th) - Pots.C * this.om - Pots.KICK * a * Math.cos(this.th) + this.wind(w);
    this.om += acc * DT;
    // a landing jolts it further the way it leans
    if (p.landTick === w.tick - 1 && p.landSpeed > 80) this.om += (this.th >= 0 ? 1 : -1) * p.landSpeed * 0.0012;
    this.th += this.om * DT;
    w.flags.lean = this.th;
    if (Math.abs(this.th) > Pots.MAX) {
      this.held = false;
      w.die('matka');
    }
  }
  /** where the top of the stack is (for things it can hit) */
  top(w: World) {
    const p = w.player;
    const h = this.n * 9;
    return { x: p.cx + Math.sin(this.th) * h, y: p.y - Math.cos(this.th) * h };
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    if (!this.held || p.dead) return;
    ctx.save();
    ctx.translate(p.cx, p.y + 1);
    ctx.rotate(this.th);
    // a cushion ring, then the pots, brass and clay, smallest on top
    ctx.fillStyle = '#C62828';
    ctx.fillRect(-4, -2, 8, 2);
    for (let i = 0; i < this.n; i++) {
      const r = 5.2 - i * 0.6,
        y = -2 - i * 9 - 4.5;
      ctx.fillStyle = i % 2 ? '#B87333' : '#D4A017';
      ctx.beginPath();
      ctx.ellipse(0, y, r, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-r + 1.5, y - 2, 1.2, 3);
      ctx.fillStyle = i % 2 ? '#8D5524' : '#A67C00';
      ctx.fillRect(-2, y - 5.5, 4, 1.6);
    }
    ctx.restore();
    // a warning tint when it's about to go
    if (Math.abs(this.th) > Pots.MAX * 0.7) {
      ctx.fillStyle = 'rgba(255,82,82,0.8)';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', p.cx + Math.sign(this.th) * 14, p.y - 20);
    }
  }
}

/** the breeze pouring out of a stretch of the Hawa Mahal's windows: streaks of air while it blows */
export function breezeArt(ctx: CanvasRenderingContext2D, b: { x0: number; x1: number; dir: number }, on: boolean, t: number, y0: number, y1: number) {
  if (!on) return;
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const span = b.x1 - b.x0;
    const x = b.x0 + ((i * 37 + t * 160 * b.dir) % span + span) % span;
    const y = y0 + ((i * 23) % (y1 - y0));
    ctx.moveTo(x, y);
    ctx.lineTo(x + b.dir * 12, y);
  }
  ctx.stroke();
}

/** The Jai Prakash Yantra: a marble bowl sunk in the ground. Inside it Dad slides like a bead on a
 *  circle: the slope pulls him back to the bottom, and holding left or right only gives him a push.
 *  Push the way he's going on every swing and it builds, till he flies out over a rim. */
export class Bowl extends Entity {
  /** the circle's centre (the bottom of the bowl is R below it) */
  readonly cx: number;
  readonly cy: number;
  in = false;
  phi = 0;
  dphi = 0;
  solid: Solid;
  static G = 600;
  static PUSH = 110;
  static FRICTION = 0.3;
  /** times Dad flew out of it */
  exits = 0;
  /** the hatch in the bottom: 0 shut .. 1 about to open */
  calm = 0;
  constructor(
    /** the bottom of the bowl (world x, y) */
    readonly bx: number,
    readonly by: number,
    readonly R: number,
    /** how far up each side the marble goes (radians from the bottom) */
    readonly maxL: number,
    readonly maxR: number,
    readonly o: { hatch?: boolean } = {},
  ) {
    super();
    this.layer = -1;
    this.cx = bx;
    this.cy = by - R;
    this.solid = new Solid(bx - 6, by, 12, 3);
    this.solid.oneWay = true;
    this.solid.collidable = false;
  }
  /** the marble surface at angle phi (0 = the bottom, + = right side) */
  at(phi: number) {
    return { x: this.cx + this.R * Math.sin(phi), y: this.cy + this.R * Math.cos(phi) };
  }
  /** the rims' world x */
  get xL() {
    return this.cx - this.R * Math.sin(this.maxL);
  }
  get xR() {
    return this.cx + this.R * Math.sin(this.maxR);
  }
  /** surface speed (px/s, + = rightwards along the marble) */
  get speed() {
    return this.dphi * this.R;
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    if (w.state !== 'play') return;
    if (!this.in) {
      s.collidable = false;
      // drops on to the marble: from above, inside the rims
      if (p.cx > this.xL && p.cx < this.xR && p.vy >= 0 && !p.onGround) {
        const ph = Math.asin(Math.max(-1, Math.min(1, (p.cx - this.cx) / this.R)));
        const sy = this.at(ph).y;
        if (p.y + p.h >= sy - 1 && p.y + p.h <= sy + 12) {
          this.in = true;
          this.phi = ph;
          this.dphi = (p.vx * Math.cos(ph) - p.vy * Math.sin(ph) * 0.25) / this.R;
        }
      }
      if (!this.in) return;
    }
    // sliding on the marble: the slope, a push from the buttons, a little friction
    const dir = (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0);
    const acc = -Bowl.G * Math.sin(this.phi) + dir * Bowl.PUSH - Bowl.FRICTION * this.speed;
    this.dphi += (acc / this.R) * DT;
    this.phi += this.dphi * DT;
    // hands off, nearly still at the bottom: it comes to rest
    if (dir === 0 && Math.abs(this.phi) < 0.035 && Math.abs(this.speed) < 10) {
      this.dphi = 0;
      this.phi *= 0.9;
    }
    w.flags.bowl = { phi: this.phi, v: this.speed };
    // over a rim, still going: out he flies along the marble's last slope
    const out = (this.phi >= this.maxR && this.dphi > 0) || (this.phi <= -this.maxL && this.dphi < 0);
    if (out) {
      const ph = this.phi > 0 ? this.maxR : -this.maxL;
      const v = this.speed;
      this.in = false;
      this.exits++;
      s.collidable = false;
      const pt = this.at(ph);
      p.x = Math.round(pt.x - p.w / 2);
      p.y = Math.round(pt.y - p.h) - 1;
      p.vx = v * Math.cos(ph);
      p.vy = -Math.abs(v * Math.sin(ph));
      p.launched = true;
      p.onGround = false;
      p.stun = 0;
      w.sfx('jump', p.cx, p.y + p.h);
      return;
    }
    // the far reaches stop it dead at the rim (it slides back)
    if (this.phi > this.maxR) {
      this.phi = this.maxR;
      this.dphi = Math.min(0, this.dphi);
    }
    if (this.phi < -this.maxL) {
      this.phi = -this.maxL;
      this.dphi = Math.max(0, this.dphi);
    }
    const pt = this.at(this.phi);
    p.x = Math.round(pt.x - p.w / 2);
    p.y = Math.round(pt.y) - p.h;
    p.xr = 0;
    p.yr = 0;
    p.vx = 0;
    p.vy = 0;
    p.stun = 2;
    p.facing = this.dphi > 0.05 ? 1 : this.dphi < -0.05 ? -1 : p.facing;
    // something under his feet, so he counts as standing
    s.collidable = true;
    s.place(p.x - 1, p.y + p.h);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the marble bowl: a thick white rim of stone round a shaded hollow, carved lines of the sky
    const R = this.R;
    ctx.fillStyle = '#E8DDD0';
    ctx.beginPath();
    ctx.moveTo(this.xL - 6, this.at(-this.maxL).y);
    for (let k = 0; k <= 40; k++) {
      const ph = -this.maxL + ((this.maxL + this.maxR) * k) / 40;
      const pt = this.at(ph);
      ctx.lineTo(pt.x, pt.y);
    }
    ctx.lineTo(this.xR + 6, this.at(this.maxR).y);
    ctx.lineTo(this.xR + 6, this.by + 30);
    ctx.lineTo(this.xL - 6, this.by + 30);
    ctx.closePath();
    ctx.fill();
    // the hollow's shading and the carved grid
    ctx.strokeStyle = 'rgba(120,100,80,0.35)';
    ctx.lineWidth = 0.7;
    for (let k = 1; k < 8; k++) {
      const ph = -this.maxL + ((this.maxL + this.maxR) * k) / 8;
      const pt = this.at(ph);
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      ctx.lineTo(pt.x + (this.cx - pt.x) * 0.12, pt.y + 10);
      ctx.stroke();
    }
    ctx.strokeStyle = '#B0A090';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 40; k++) {
      const ph = -this.maxL + ((this.maxL + this.maxR) * k) / 40;
      const pt = this.at(ph);
      if (k === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();
    if (this.o.hatch) {
      // a little bronze hatch at the very bottom
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(this.bx - 9, this.by - 1, 18, 3);
      // it fills with light while he stays still on it
      ctx.fillStyle = '#FFC107';
      ctx.fillRect(this.bx - 9, this.by - 1, 18 * this.calm, 3);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(this.bx - 1, this.by - 1, 2, 3);
    }
    void R;
    void w;
  }
}

/** A stone diving board out over a bowl from its rim: thin, you can come up through it. */
export class Board extends Entity {
  solid: Solid;
  constructor(readonly x: number, readonly y: number, readonly len: number) {
    super();
    this.layer = 0;
    this.solid = new Solid(x, y, len, 4);
    this.solid.oneWay = true;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#C9A27E';
    ctx.fillRect(this.x, this.y, this.len, 4);
    ctx.fillStyle = '#F3E3CF';
    ctx.fillRect(this.x, this.y, this.len, 1.5);
    ctx.fillStyle = '#A9825F';
    for (let k = 6; k < this.len - 2; k += 12) ctx.fillRect(this.x + k, this.y + 4, 3, 3);
    ctx.fillRect(this.x + this.len - 2, this.y, 2, 6);
  }
}

/** A giant lac bangle from Maniharon ka Rasta. Walk in to it and it rolls with you: slow to get going
 *  and slow to stop, faster than Dad on foot, and it carries him over broken glass. At speed it skips a
 *  gap; too fast in to a wall, or dropped too far, and it shatters. Jump to hop out (it rolls on). */
export class Bangle extends Entity {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  r: number;
  riding = false;
  /** ticks until a shattered one is back on its stand */
  gone = 0;
  spin = 0;
  cool = 0;
  solid: Solid;
  /** braziers that soften (shrink) it: world x ranges */
  heat: { x0: number; x1: number }[] = [];
  static MAX = 176;
  static ACCEL = 300;
  static BRAKE = 340;
  static ROLL = 70;
  static SMASH = 150;
  static DROP = 345;
  static MELT = 11;
  constructor(
    readonly hx: number,
    readonly floor: number,
    readonly r0 = 20,
    readonly hue = '#D81B60',
  ) {
    super();
    this.layer = 3;
    this.r = r0;
    this.x = hx;
    this.y = floor - r0;
    this.solid = new Solid(hx - 6, floor - 3, 12, 3);
    this.solid.oneWay = true;
    this.solid.collidable = false;
  }
  private shatter(w: World, why: string) {
    w.sfx('thud', this.x, this.y);
    for (let k = 0; k < 8; k++) w.emit('fx', this.x + Math.cos(k) * this.r, this.y + Math.sin(k) * this.r, { kind: 'sparkle' });
    w.flags.bangleBroke = why;
    this.riding = false;
    this.solid.collidable = false;
    this.gone = 150;
    this.vx = this.vy = 0;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    const s = this.solid;
    if (this.gone > 0) {
      if (--this.gone === 0) {
        this.x = this.hx;
        this.r = this.r0;
        this.y = this.floor - this.r0;
      }
      return;
    }
    if (this.cool > 0) this.cool--;
    const grounded = !!w.solidAt(this.x - 11, this.y + this.r, 22, 2);
    // step in: walk in to it, or drop in to it
    if (!this.riding && this.cool === 0 && Math.abs(p.cx - this.x) < 7 && p.y + p.h > this.y - 4 && p.y + p.h <= this.y + this.r + 2 && p.vy >= 0) {
      this.riding = true;
      this.vx += p.vx * 0.5;
      w.sfx('land', this.x, this.y);
    }
    if (this.riding) {
      // hop out: a jump of his own, the bangle rolls on
      if (w.input.jumpPressed) {
        this.riding = false;
        this.cool = 40;
        s.collidable = false;
        p.stun = 0;
        p.vy = -375;
        p.vx = Math.max(-140, Math.min(140, this.vx));
        p.onGround = false;
        p.coyoteT = 0;
        w.sfx('jump', p.cx, p.y + p.h);
      }
    }
    // rolling: his push, or just the rolling on
    const dir = this.riding ? (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0) : 0;
    if (grounded) {
      if (dir !== 0) {
        const a = Math.sign(this.vx) === -dir ? Bangle.BRAKE : Bangle.ACCEL;
        this.vx += dir * a * DT;
      } else {
        const d = Bangle.ROLL * DT;
        this.vx = Math.abs(this.vx) <= d ? 0 : this.vx - Math.sign(this.vx) * d;
      }
      this.vx = Math.max(-Bangle.MAX, Math.min(Bangle.MAX, this.vx));
    }
    // sideways, a pixel at a time: a wall (or a beam too low for it) stops it; hard, and it's in pieces
    let dx = this.vx * DT + this.fx;
    const step = Math.sign(dx);
    this.fx = dx - Math.trunc(dx);
    dx = Math.trunc(dx);
    for (let k = 0; k < Math.abs(dx); k++) {
      const lead = this.x + step * (this.r - 1);
      if (w.solidAt(lead + (step > 0 ? 0 : -1), this.y - this.r + 4, 2, 2 * this.r - 10)) {
        if (Math.abs(this.vx) > Bangle.SMASH) return this.shatter(w, 'wall');
        this.vx = -this.vx * 0.25;
        this.fx = 0;
        w.sfx('thud', this.x, this.y);
        break;
      }
      this.x += step;
      // a lip no higher than its rim's curve: it rolls up
      let up = 0;
      for (; up < 6 && w.solidAt(this.x - 11, this.y + this.r - 1, 22, 1); up++) this.y--;
      // sunk too deep in a gap to roll out the far side: that edge is a wall to it
      if (w.solidAt(this.x - 11, this.y + this.r - 1, 22, 1)) {
        this.y += up;
        this.x -= step;
        if (Math.abs(this.vx) > Bangle.SMASH) return this.shatter(w, 'edge');
        this.vx = -this.vx * 0.25;
        break;
      }
    }
    this.spin += (this.vx / this.r) * DT;
    // down: nothing under the middle of it and it drops
    if (!w.solidAt(this.x - 11, this.y + this.r, 22, 2)) {
      this.vy = Math.min(410, this.vy + 1750 * DT);
      let dy = this.vy * DT + this.fy;
      this.fy = dy - Math.trunc(dy);
      dy = Math.trunc(dy);
      for (let k = 0; k < dy; k++) {
        if (w.solidAt(this.x - 11, this.y + this.r, 22, 1)) break;
        this.y++;
      }
      if (w.solidAt(this.x - 11, this.y + this.r, 22, 1)) {
        if (this.vy > Bangle.DROP) return this.shatter(w, 'drop');
        this.vy = 0;
      }
      if (this.y > ROOM_H + 60) return this.shatter(w, 'pit');
    } else this.vy = 0;
    // over a brazier the lac softens and it shrinks; too long and it's a puddle
    if (this.heat.some((h) => this.x > h.x0 && this.x < h.x1) && grounded) {
      const dr = 3 * DT;
      this.r -= dr;
      this.y += dr;
      if (this.r < Bangle.MELT) return this.shatter(w, 'melt');
    }
    if (this.riding) {
      p.x = Math.round(this.x - p.w / 2);
      p.y = Math.round(this.y + this.r - 3) - p.h;
      p.xr = 0;
      p.yr = 0;
      p.vx = 0;
      p.vy = 0;
      p.stun = 2;
      if (dir) p.facing = dir as 1 | -1;
      s.collidable = true;
      s.place(p.x - 1, p.y + p.h);
    }
    if (this.riding) w.flags.bangle = { x: this.x, y: this.y, vx: this.vx, r: this.r };
  }
  private fx = 0;
  private fy = 0;
  draw(ctx: CanvasRenderingContext2D) {
    // its stand: a peg rail
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.hx - 1.5, this.floor - 4, 3, 4);
    if (this.gone > 0) return;
    const { x, y, r } = this;
    // soft and glowing as it heats
    const hot = Math.max(0, (this.r0 - r) / (this.r0 - Bangle.MELT));
    ctx.lineWidth = 4;
    ctx.strokeStyle = hot > 0.02 ? `rgb(${216 + 39 * hot},${27 + 150 * hot},${96 - 60 * hot})` : this.hue;
    ctx.beginPath();
    ctx.arc(x, y, r - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.arc(x, y, r - 0.6, Math.PI * 1.1, Math.PI * 1.6);
    ctx.stroke();
    // gold work and little mirrors round it
    for (let k = 0; k < 10; k++) {
      const a = this.spin + (k * Math.PI) / 5;
      ctx.fillStyle = k % 2 ? '#FFD54F' : '#E0F7FA';
      ctx.fillRect(x + Math.cos(a) * (r - 2) - 1, y + Math.sin(a) * (r - 2) - 1, 2, 2);
    }
  }
}

/** Broken glass bangles all over the lane: on foot, it's the end of the walk. */
export class Shards extends Entity {
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y: number,
  ) {
    super();
    this.layer = -1;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'kaanch',
      hits: (x, y2, w2, h2) => !self.safe && x + w2 > self.x0 + 2 && x < self.x1 - 2 && y2 + h2 > self.y - 1 && y2 + h2 <= self.y + 2,
    };
  }
  safe = false;
  update(w: World) {
    // inside a bangle his feet are off the floor
    this.safe = w.entities.some((e) => e instanceof Bangle && e.riding);
  }
  draw(ctx: CanvasRenderingContext2D) {
    const cols = ['#E91E63', '#26C6DA', '#FFCA28', '#66BB6A', '#AB47BC'];
    // curved bits of broken bangle standing up out of the dust, and the odd glint
    for (let x = this.x0 + 2, k = 0; x < this.x1 - 3; x += 4, k++) {
      const h = 3 + ((k * 7) % 4);
      ctx.strokeStyle = cols[(k * 3) % 5];
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x + 2, this.y + 1, h, Math.PI * (1.05 + ((k * 5) % 3) * 0.12), Math.PI * (1.55 + ((k * 3) % 4) * 0.1));
      ctx.stroke();
      if (k % 3 === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillRect(x + ((k * 11) % 3), this.y - h + 1, 1, 1);
      }
    }
  }
}

/** a manihar's coal brazier let in to the floor: art only (the Bangle knows its heat ranges) */
export function brazierArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, y: number, t: number) {
  // an iron tray of coals on stubby legs, flames licking up, a shimmer of heat over it
  ctx.fillStyle = 'rgba(255,140,40,0.16)';
  ctx.fillRect(x0 - 2, y - 44, x1 - x0 + 4, 40);
  ctx.fillStyle = '#263238';
  ctx.fillRect(x0, y - 5, x1 - x0, 5);
  ctx.fillStyle = '#455A64';
  ctx.fillRect(x0 - 1, y - 6, x1 - x0 + 2, 2);
  for (let x = x0 + 2, k = 0; x < x1 - 3; x += 4, k++) {
    const g = 0.5 + 0.5 * Math.sin(t * 5 + k * 1.7);
    ctx.fillStyle = `rgb(255,${Math.round(70 + 110 * g)},20)`;
    ctx.fillRect(x, y - 8, 3, 3);
    ctx.fillStyle = `rgba(255,${Math.round(190 + 50 * g)},80,0.85)`;
    ctx.beginPath();
    ctx.moveTo(x, y - 8);
    ctx.lineTo(x + 1.5, y - 12 - g * 5);
    ctx.lineTo(x + 3, y - 8);
    ctx.fill();
  }
}

/** The Kachchhi Ghodi dancer's dummy horse. From its stand at x0 Dad is wearing it, and the horse does
 *  not stop: it gallops the way it faces. Press the other way and it rears, then gallops back; a wall
 *  turns it round too. Jumps are his own. It comes off at x1 (or on a snag). */
export class Ghodi extends Entity {
  on = false;
  dir: 1 | -1 = 1;
  /** rearing: ticks left before it sets off the other way */
  rear = 0;
  private lastX = -999;
  private stuck = 0;
  private armed = true;
  turns = 0;
  static V = 170;
  static REAR = 22;
  /** rects that pull the costume off (world px) */
  snags: { x: number; y: number; w: number; h: number }[] = [];
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 3;
  }
  private off(w: World) {
    this.on = false;
    this.rear = 0;
    w.player.speedMul = 1;
    w.sfx('thud', w.player.cx, w.player.y);
  }
  update(w: World) {
    const p = w.player;
    if (w.state !== 'play') return;
    w.flags.ghodi = this.on;
    if (!this.on) {
      if (Math.abs(p.cx - this.x0) > 20) this.armed = true;
      if (this.armed && Math.abs(p.cx - this.x0) < 6 && p.cx < this.x1 && Math.abs(p.y + p.h - this.floor) < 20) {
        this.on = true;
        this.armed = false;
        this.dir = 1;
        this.lastX = -999;
        w.sfx('win', p.cx, p.y);
      }
      if (!this.on) return;
    }
    if (p.cx >= this.x1) return this.off(w);
    for (const s of this.snags) if (p.x < s.x + s.w && p.x + p.w > s.x && p.y < s.y + s.h && p.y + p.h > s.y) return this.off(w);
    const inp = (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0);
    if (this.rear > 0) {
      // up on its hind legs: no going anywhere, no jumping
      p.vx = 0;
      p.stun = 2;
      if (--this.rear === 0) {
        this.dir = -this.dir as 1 | -1;
        this.lastX = -999;
      }
      return;
    }
    // a wall (or anything else that stops it dead): round it goes
    if (p.x === this.lastX) {
      if (++this.stuck >= 2) {
        this.dir = -this.dir as 1 | -1;
        this.stuck = 0;
        this.turns++;
        w.sfx('thud', p.cx, p.cy);
      }
    } else this.stuck = 0;
    this.lastX = p.x;
    if (inp === -this.dir && p.onGround) {
      this.rear = Ghodi.REAR;
      this.turns++;
      p.vx = 0;
      p.stun = 2;
      w.sfx('jump', p.cx, p.y);
      return;
    }
    p.speedMul = Ghodi.V / 140;
    p.facing = this.dir;
    if (inp === this.dir) p.vx = this.dir * Ghodi.V;
    else if (inp === 0) p.vx = this.dir * (Ghodi.V + (p.onGround ? 2600 : 900) * DT);
    else {
      // in the air, pulling back: the horse isn't listening
      p.vx = this.dir * Ghodi.V;
      p.stun = 1;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // its stand: a bamboo frame, with the horse on it when nobody's wearing it
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x0 - 8, this.floor);
    ctx.lineTo(this.x0 - 4, this.floor - 14);
    ctx.moveTo(this.x0 + 8, this.floor);
    ctx.lineTo(this.x0 + 4, this.floor - 14);
    ctx.stroke();
    const p = w.player;
    if (!this.on) return horseArt(ctx, this.x0, this.floor - 12, 1, 0, 0);
    horseArt(ctx, p.cx, p.y + p.h - 5, this.dir, this.rear > 0 ? 1 : 0, w.tick);
  }
}
/** the dummy horse: a decked-out body with a hole for the dancer, a skirt to hide his legs */
export function horseArt(ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, rear: number, tick: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  if (rear) ctx.rotate(-0.45);
  const bob = Math.sin(tick * 0.35) * 0.8;
  // skirt
  ctx.fillStyle = '#C62828';
  ctx.fillRect(-11, 0, 22, 5);
  ctx.fillStyle = '#FFD54F';
  for (let k = -10; k < 11; k += 4) ctx.fillRect(k, 3, 2, 2);
  // body
  ctx.fillStyle = '#F5F5F5';
  ctx.beginPath();
  ctx.ellipse(0, -2, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1565C0';
  ctx.fillRect(-5, -6, 10, 3);
  // neck and head
  ctx.fillStyle = '#F5F5F5';
  ctx.beginPath();
  ctx.moveTo(8, -3);
  ctx.lineTo(13, -13 + bob);
  ctx.lineTo(19, -11 + bob);
  ctx.lineTo(17, -7 + bob);
  ctx.lineTo(12, -1);
  ctx.fill();
  ctx.fillStyle = '#212121';
  ctx.fillRect(15, -11 + bob, 1.2, 1.2);
  ctx.fillStyle = '#E65100';
  ctx.fillRect(11, -14 + bob, 3, 2);
  // tail
  ctx.strokeStyle = '#424242';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-11, -3);
  ctx.quadraticCurveTo(-16, -4 - bob, -15, 3);
  ctx.stroke();
  ctx.restore();
}

/** Two sword dancers either side of the lane. On their count the swords come down and cross:
 *  nothing gets through. In between, they hold them high. */
export class Talwar extends Entity {
  hazard: Hazard;
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly o: { every: number; on: number; phase?: number },
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'talwar',
      hits: (x2, y2, w2, h2) => self.live && x2 + w2 > self.x - 7 && x2 < self.x + 7 && y2 + h2 > self.floor - 30 && y2 < self.floor,
    };
  }
  live = false;
  /** are the swords down at time t (seconds)? */
  downAt(t: number) {
    const u = (((t + (this.o.phase ?? 0)) % this.o.every) + this.o.every) % this.o.every;
    return u < this.o.on;
  }
  update(w: World) {
    this.live = this.downAt(w.tick * DT);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const down = this.live;
    const soon = !down && this.downAt(t + 0.3);
    for (const side of [-1, 1]) {
      const bx = this.x + side * 15;
      // dancer: turban, kurta, sash
      ctx.fillStyle = side < 0 ? '#EF6C00' : '#00897B';
      ctx.fillRect(bx - 3, this.floor - 15, 6, 11);
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(bx - 3, this.floor - 5, 6, 5);
      ctx.fillStyle = '#C68642';
      ctx.fillRect(bx - 2.5, this.floor - 20, 5, 5);
      ctx.fillStyle = side < 0 ? '#D81B60' : '#FDD835';
      ctx.fillRect(bx - 3.5, this.floor - 23, 7, 3.5);
      // the sword: high, wavering before the cut, crossed when down
      const a = down ? 0.35 : soon ? -0.9 + Math.sin(t * 40) * 0.12 : -1.25;
      ctx.strokeStyle = down ? '#FFFFFF' : '#CFD8DC';
      ctx.lineWidth = down ? 2.4 : 1.8;
      ctx.beginPath();
      ctx.moveTo(bx - side * 2, this.floor - 13);
      ctx.lineTo(bx - side * 2 - side * Math.cos(a) * 20, this.floor - 13 + Math.sin(a) * 20);
      ctx.stroke();
    }
    if (down) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(this.x - 1.5, this.floor - 12, 3, 3);
    }
  }
}

export interface WindBand {
  /** applies while the basket's floor is above this y (bands listed top to bottom) */
  below: number;
  vx: number;
}
/** A hot-air balloon over the Pink City. Left and right do nothing up here: hold jump to burn and
 *  climb, let go to sink, and the wind at each height takes you where it's going. Pick your wind. */
export class Balloon extends Entity {
  bx: number;
  by: number;
  vx = 0;
  vy = 0;
  riding = false;
  done = false;
  rest = 0;
  burning = false;
  solid: Solid;
  private fx = 0;
  private fy = 0;
  static UP = 230;
  static DOWN = 120;
  static RISE = 95;
  static SINK = 80;
  static GUST = 320;
  constructor(
    readonly x0: number,
    readonly floor: number,
    readonly bands: WindBand[],
    /** where he gets out: basket resting on something inside this x range */
    readonly land: { x0: number; x1: number },
    readonly hue = '#E91E63',
  ) {
    super();
    this.layer = 3;
    this.bx = x0;
    this.by = floor;
    this.solid = new Solid(x0 - 6, floor - 2, 12, 2);
    this.solid.oneWay = true;
    this.solid.collidable = false;
  }
  wind(y = this.by) {
    for (const b of this.bands) if (y < b.below) return b.vx;
    return 0;
  }
  private blocked(w: World, x: number, y: number) {
    return !!(w.solidAt(x - 7, y - 11, 14, 11) || w.solidAt(x - 11, y - 46, 22, 26));
  }
  /** does a point (with a radius) touch the balloon or its basket? */
  touches(x: number, y: number, r: number) {
    if (!this.riding) return false;
    const ex = x - this.bx,
      ey = y - (this.by - 33);
    if (ex * ex + ey * ey < (13 + r) * (13 + r)) return true;
    return x > this.bx - 8 - r && x < this.bx + 8 + r && y > this.by - 12 - r && y < this.by + r;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    const s = this.solid;
    if (!this.riding) {
      if (!this.done && Math.abs(p.cx - this.bx) < 6 && Math.abs(p.y + p.h - this.by) < 6 && p.onGround) {
        this.riding = true;
        w.sfx('land', this.bx, this.by);
      } else return;
    }
    const burn = w.input.jump;
    this.burning = burn;
    const grounded = !!w.solidAt(this.bx - 7, this.by, 14, 1);
    this.vy += (burn ? -Balloon.UP : Balloon.DOWN) * DT;
    this.vy = Math.max(-Balloon.RISE, Math.min(Balloon.SINK, this.vy));
    if (grounded && this.vy > 0) this.vy = 0;
    if (grounded && !burn) {
      // sat on the ground: no wind down here
      this.vx *= 0.9;
      if (Math.abs(this.vx) < 4) this.vx = 0;
      this.rest++;
    } else {
      this.rest = 0;
      const want = this.wind();
      const d = Balloon.GUST * DT;
      this.vx = Math.abs(want - this.vx) <= d ? want : this.vx + Math.sign(want - this.vx) * d;
    }
    let dx = this.vx * DT + this.fx;
    this.fx = dx - Math.trunc(dx);
    dx = Math.trunc(dx);
    for (let k = 0, st = Math.sign(dx); k < Math.abs(dx); k++) {
      if (this.blocked(w, this.bx + st, this.by)) {
        this.vx = 0;
        this.fx = 0;
        break;
      }
      this.bx += st;
    }
    let dy = this.vy * DT + this.fy;
    this.fy = dy - Math.trunc(dy);
    dy = Math.trunc(dy);
    for (let k = 0, st = Math.sign(dy); k < Math.abs(dy); k++) {
      if (this.by + st - 46 < 2 || this.blocked(w, this.bx, this.by + st)) {
        this.vy = 0;
        this.fy = 0;
        break;
      }
      this.by += st;
    }
    w.flags.balloon = { x: this.bx, y: this.by, vx: this.vx, vy: this.vy };
    // down on the landing ground and settled: out he gets
    if (this.rest > 40 && this.bx > this.land.x0 && this.bx < this.land.x1) {
      this.riding = false;
      this.done = true;
      this.burning = false;
      s.collidable = false;
      p.y = this.by - p.h;
      p.stun = 0;
      w.sfx('win', this.bx, this.by);
      return;
    }
    p.x = Math.round(this.bx - p.w / 2);
    p.y = this.by - 2 - p.h;
    p.xr = 0;
    p.yr = 0;
    p.vx = 0;
    p.vy = 0;
    p.stun = 2;
    s.collidable = true;
    s.place(p.x - 1, p.y + p.h);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const { bx, by } = this;
    const t = w.tick * DT;
    // the winds, where he can see them: streaks drifting the way each one blows
    if (this.riding) {
      let top = 8;
      for (let i = 0; i < this.bands.length; i++) {
        const b = this.bands[i];
        const bot = Math.min(b.below, this.floor);
        const inIt = by >= top && by < b.below;
        ctx.strokeStyle = `rgba(255,255,255,${inIt ? 0.6 : 0.26})`;
        ctx.lineWidth = 1;
        for (let k = 0; k < 10; k++) {
          const span = 420;
          const y = top + 6 + ((k * 37 + i * 11) % Math.max(8, bot - top - 12));
          let x = (((k * 97 + t * b.vx * 1.4) % span) + span) % span;
          x += bx - span / 2;
          const hx = x + Math.sign(b.vx) * (6 + Math.abs(b.vx) * 0.12);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(hx, y);
          // a little arrowhead
          ctx.moveTo(hx, y);
          ctx.lineTo(hx - Math.sign(b.vx) * 3, y - 2);
          ctx.moveTo(hx, y);
          ctx.lineTo(hx - Math.sign(b.vx) * 3, y + 2);
          ctx.stroke();
        }
        top = b.below;
      }
    }
    // envelope: stripes, lit from inside when the burner's on
    const cy = by - 33;
    if (this.burning) {
      const g = ctx.createRadialGradient(bx, cy + 6, 2, bx, cy, 26);
      g.addColorStop(0, 'rgba(255,220,120,0.55)');
      g.addColorStop(1, 'rgba(255,180,60,0)');
      ctx.fillStyle = g;
      ctx.fillRect(bx - 26, cy - 26, 52, 52);
    }
    const cols = [this.hue, '#FFD54F', this.hue, '#FFF3E0', this.hue];
    for (let k = 0; k < 5; k++) {
      ctx.fillStyle = cols[k];
      ctx.beginPath();
      ctx.ellipse(bx, cy, 13 - k * 2.6, 13.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = this.hue;
    ctx.beginPath();
    ctx.moveTo(bx - 7, cy + 11);
    ctx.lineTo(bx + 7, cy + 11);
    ctx.lineTo(bx + 3, cy + 18);
    ctx.lineTo(bx - 3, cy + 18);
    ctx.fill();
    if (this.burning) {
      ctx.fillStyle = '#FFB300';
      ctx.fillRect(bx - 1.5, cy + 17, 3, 4);
    }
    // ropes and the basket
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bx - 3, cy + 18);
    ctx.lineTo(bx - 7, by - 9);
    ctx.moveTo(bx + 3, cy + 18);
    ctx.lineTo(bx + 7, by - 9);
    ctx.stroke();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(bx - 8, by - 9, 16, 9);
    ctx.fillStyle = '#6D4C41';
    for (let k = -7; k < 8; k += 3) ctx.fillRect(bx + k, by - 9, 1, 9);
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(bx - 8, by - 9, 16, 1.5);
  }
}

/** A Diwali rocket from the street: a fuse, then straight up the sky, a burst at the top. Again and again. */
export class Rocket extends Entity {
  hazard: Hazard;
  static FUSE = 0.6;
  static FLY = 0.75;
  constructor(
    readonly x: number,
    readonly y0: number,
    readonly y1: number,
    readonly o: { every: number; phase?: number },
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'phataka',
      hits: (x2, y2, w2, h2) => {
        const y = self.y;
        return y !== null && x2 < self.x + 4 && x2 + w2 > self.x - 4 && y2 < y + 8 && y2 + h2 > y - 4;
      },
    };
  }
  private u(t: number) {
    return (((t + (this.o.phase ?? 0)) % this.o.every) + this.o.every) % this.o.every;
  }
  /** where the rocket is at time t (null: not in the air) */
  yAt(t: number): number | null {
    const u = this.u(t) - Rocket.FUSE;
    if (u < 0 || u > Rocket.FLY) return null;
    return this.y0 + (this.y1 - this.y0) * (u / Rocket.FLY);
  }
  y: number | null = null;
  update(w: World) {
    const t = w.tick * DT;
    const was = this.y;
    this.y = this.yAt(t);
    if (this.y !== null && was === null) w.sfx('jump', this.x, this.y0);
    if (this.y === null && was !== null) w.emit('fx', this.x, this.y1, { kind: 'sparkle' });
    if (this.y !== null && w.state === 'play')
      for (const e of w.entities) if (e instanceof Balloon && e.touches(this.x, this.y, 3)) return w.die('phataka');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const u = this.u(t);
    // the bottle it stands in
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(this.x - 2, this.y0 - 7, 4, 7);
    if (u < Rocket.FUSE) {
      // fuse fizzing: it's about to go
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(this.x - 1, this.y0 - 15, 2, 8);
      ctx.fillStyle = Math.sin(t * 60) > 0 ? '#FFEB3B' : '#FF9800';
      ctx.fillRect(this.x - 2 + Math.sin(t * 47) * 2, this.y0 - 3 - (u / Rocket.FUSE) * 3, 3, 3);
      return;
    }
    const y = this.y;
    if (y !== null) {
      const g = ctx.createLinearGradient(0, y, 0, y + 40);
      g.addColorStop(0, 'rgba(255,220,120,0.9)');
      g.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(this.x - 1.5, y, 3, 40);
      ctx.fillStyle = '#D32F2F';
      ctx.fillRect(this.x - 1.5, y - 6, 3, 7);
      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(this.x - 1, y - 8, 2, 2);
      return;
    }
    // the burst, fading
    const b = u - Rocket.FUSE - Rocket.FLY;
    if (b < 0.7) {
      const cols = ['#FF4081', '#FFD740', '#69F0AE', '#40C4FF'];
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const r = 6 + b * 34;
        ctx.fillStyle = cols[k % 4];
        ctx.globalAlpha = 1 - b / 0.7;
        ctx.fillRect(this.x + Math.cos(a) * r - 1, this.y1 + Math.sin(a) * r + b * b * 20 - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }
}

/** An Amer elephant, painted for the ride up to the fort. On the ground she follows Dad about (when
 *  he's near). On her back he's the mahout: she walks the way he presses, till something stops her.
 *  And dawdle in front of her trunk and she picks you up and puts you down behind her, over her back,
 *  with some force. */
export class Elephant extends Entity {
  solid: Solid;
  facing: 1 | -1 = 1;
  turn = 0;
  still = 0;
  cool = 0;
  tosses = 0;
  moving = false;
  private fling = 0;
  private vy = 0;
  private walkT = 0;
  static W = 44;
  static H = 34;
  static SPEED = 42;
  static STOP = 22;
  static REACH = 27;
  static WAIT = 84;
  constructor(x: number, floor: number) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, floor - Elephant.H, Elephant.W, Elephant.H);
  }
  get x() {
    return this.solid.x;
  }
  get y() {
    return this.solid.y;
  }
  /** the gap between her front and Dad (negative: he's behind her front) */
  gap(w: World) {
    const p = w.player;
    return this.facing > 0 ? p.x - (this.x + Elephant.W) : this.x - (p.x + p.w);
  }
  private canStep(w: World, dir: number) {
    const s = this.solid;
    const fx = dir > 0 ? s.x + Elephant.W : s.x - 1;
    if (w.solidAt(fx, s.y, 1, Elephant.H - 1)) return false;
    // nothing to stand on ahead: she won't
    return !!w.solidAt(dir > 0 ? fx : fx - 3, s.y + Elephant.H, 4, 40);
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    const s = this.solid;
    this.moving = false;
    if (this.cool > 0) this.cool--;
    // she's heavy: off an edge, down she goes
    if (!w.solidAt(s.x + 4, s.y + Elephant.H, Elephant.W - 8, 1)) {
      this.vy = Math.min(410, this.vy + 1750 * DT);
      s.moveBy(w, 0, this.vy * DT);
      while (w.solidAt(s.x + 4, s.y + Elephant.H - 1, Elephant.W - 8, 1)) s.moveBy(w, 0, -1);
    } else this.vy = 0;
    // mid-toss: once he's above her back, over it he goes
    if (this.fling > 0) {
      this.fling--;
      if (p.y + p.h <= s.y) p.vx = -this.facing * 170;
    }
    const riding = p.isRiding(s);
    w.flags.haathi = { x: s.x, facing: this.facing, riding, still: this.still };
    if (riding) {
      // someone on her back: he's the mahout now. She goes the way he presses; he stays put up there
      this.still = 0;
      this.turn = 0;
      const dir = (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0);
      if (w.input.jumpPressed) {
        // off (or up) he jumps, his own jump
        p.stun = 0;
        p.vy = -375;
        p.vx = dir * 120;
        p.onGround = false;
        p.coyoteT = 0;
        p.jumping = true;
        p.jumpTick = w.tick;
        w.emit('jump', p.cx, p.y + p.h);
        return;
      }
      p.stun = 2;
      p.vx = 0;
      if (dir !== 0) {
        this.facing = dir as 1 | -1;
        p.facing = this.facing;
        if (this.canStep(w, dir)) {
          s.moveBy(w, dir * Elephant.SPEED * DT, 0);
          this.moving = true;
          this.walkT++;
        }
      }
      return;
    }
    // on the ground she only minds someone close by
    if (Math.abs(p.cx - (s.x + Elephant.W / 2)) > 150) {
      this.still = 0;
      this.turn = 0;
      return;
    }
    const want = p.cx >= s.x + Elephant.W / 2 ? 1 : -1;
    if (want !== this.facing) {
      // turning a whole elephant round takes a moment
      this.still = 0;
      if (++this.turn >= 72) {
        this.facing = want;
        this.turn = 0;
      }
      return;
    }
    this.turn = 0;
    const gap = this.gap(w);
    if (gap > Elephant.STOP && this.canStep(w, this.facing)) {
      s.moveBy(w, this.facing * Elephant.SPEED * DT, 0);
      this.moving = true;
      this.walkT++;
    }
    // the trunk: someone standing about right in front of her
    const low = p.y + p.h > s.y + Elephant.H - 8;
    if (this.cool === 0 && p.onGround && low && gap >= -2 && gap <= Elephant.REACH && Math.abs(p.vx) < 12) {
      if (++this.still >= Elephant.WAIT) {
        this.still = 0;
        this.cool = 150;
        this.tosses++;
        p.vy = -700;
        p.vx = 0;
        this.fling = 62;
        p.launched = true;
        p.onGround = false;
        p.coyoteT = 0;
        p.stun = 62;
        w.flags.tossed = (w.flags.tossed ?? 0) + 1;
        w.sfx('jump', p.cx, p.y);
      }
    } else this.still = 0;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    const f = this.facing;
    const W = Elephant.W,
      H = Elephant.H;
    ctx.save();
    ctx.translate(s.x + W / 2, s.y);
    ctx.scale(f, 1);
    const step = this.moving ? Math.sin(this.walkT * 0.18) * 1.5 : 0;
    // legs
    ctx.fillStyle = '#78828A';
    ctx.fillRect(-18, H - 13 + step, 8, 13 - step);
    ctx.fillRect(-7, H - 13 - step, 8, 13 + step);
    ctx.fillRect(5, H - 13 + step, 8, 13 - step);
    ctx.fillRect(13, H - 13 - step, 7, 13 + step);
    // body and head
    ctx.fillStyle = '#8C969E';
    ctx.beginPath();
    ctx.ellipse(-3, 15, 19, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, 12, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // the trunk: hanging, or curling up as she reaches for him
    const reach = Math.min(1, this.still / Elephant.WAIT);
    ctx.strokeStyle = '#8C969E';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(21, 14);
    ctx.quadraticCurveTo(25 + reach * 6, 24 - reach * 4, 22 + reach * 10, H - 4 - reach * 14);
    ctx.stroke();
    ctx.lineCap = 'butt';
    // painted face, tusk, eye, ear
    ctx.fillStyle = '#F06292';
    ctx.fillRect(17, 5, 5, 2);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(18, 8, 4, 1.5);
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(17, 18, 6, 2);
    ctx.fillStyle = '#212121';
    ctx.fillRect(17, 11, 1.6, 1.6);
    ctx.fillStyle = '#7A848C';
    ctx.beginPath();
    ctx.ellipse(8, 12, 5, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#EC407A';
    ctx.beginPath();
    ctx.ellipse(8, 12, 2.5, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // the jhool (her cloth) and the flat howdah seat he stands on
    ctx.fillStyle = '#C62828';
    ctx.fillRect(-17, 2, 24, 15);
    ctx.fillStyle = '#FFD54F';
    ctx.fillRect(-17, 15, 24, 2);
    for (let k = -15; k < 6; k += 5) ctx.fillRect(k, 6, 2, 2);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(-W / 2, 0, W, 3);
    ctx.fillStyle = '#FFB300';
    ctx.fillRect(-W / 2, 0, W, 1);
    // tail
    ctx.strokeStyle = '#78828A';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-21, 10);
    ctx.lineTo(-23, 22);
    ctx.stroke();
    ctx.restore();
  }
}
