// Goa's moving parts that both its stages and its door endings use.
import { Entity, type Hazard, type World } from '../../world';
import type { Climbable } from '../../player';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';

const approach = (v: number, t: number, d: number) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));

export type KickKind = 'ground' | 'volley' | 'header';

/** A football. Run into it and it's kicked: along the ground from your feet, high and long if you
 *  meet it in the air (a volley), straight up off your head if you jump into it from below. */
export class Football extends Entity {
  x: number;
  y: number;
  vx = 0;
  vy = 0;
  readonly w = 10;
  readonly h = 10;
  private rx = 0;
  private ry = 0;
  onGround = false;
  lastKick = -999;
  lastKind: KickKind | null = null;
  kicks = 0;
  spin = 0;
  stillT = 0;
  readonly home: [number, number];
  /** areas that do something when the ball gets into them (once) */
  goals: { x: number; y: number; w: number; h: number; fn: (w: World) => void; done?: boolean }[] = [];
  /** a kid fetches the ball back to its spot once it's lying still past here (px), or anywhere if null */
  fetchFrom: number | null = null;
  fetchAfter = 1.5;
  constructor(x: number, y: number) {
    super();
    this.layer = 3;
    this.x = x;
    this.y = y;
    this.home = [x, y];
  }
  get cx() {
    return this.x + this.w / 2;
  }
  get moving() {
    return Math.abs(this.vx) > 4 || !this.onGround;
  }
  reset() {
    [this.x, this.y] = this.home;
    this.vx = this.vy = this.rx = this.ry = 0;
    this.stillT = 0;
  }
  private hit(w: World, x: number, y: number) {
    return !!w.solidAt(x, y, this.w, this.h);
  }
  update(w: World) {
    const p = w.player;
    if (w.tick - this.lastKick > 10 && w.state === 'play' && p.x < this.x + this.w + 1 && p.x + p.w > this.x - 1 && p.y < this.y + this.h + 1 && p.y + p.h > this.y - 1) {
      const dir = p.cx <= this.cx ? 1 : -1;
      let kind: KickKind;
      if (!p.onGround && p.vy < -40 && p.y > this.y + 3) {
        kind = 'header';
        this.vx = dir * 60;
        this.vy = -400;
      } else if (!p.onGround) {
        kind = 'volley';
        this.vx = dir * 210;
        this.vy = -330;
      } else {
        kind = 'ground';
        this.vx = dir * 240;
        this.vy = -140;
      }
      this.lastKind = kind;
      this.lastKick = w.tick;
      this.kicks++;
      w.sfx('bonk', this.cx, this.y);
      w.emit('fx', this.cx, this.y + this.h, { kind: 'dust' });
    }
    this.vy = Math.min(this.vy + 900 * DT, 480);
    if (this.onGround) this.vx = approach(this.vx, 0, 110 * DT);
    // move a pixel at a time: bounce off walls, ground and ceilings
    this.rx += this.vx * DT;
    let mx = Math.round(this.rx);
    this.rx -= mx;
    while (mx !== 0) {
      const s = Math.sign(mx);
      if (this.hit(w, this.x + s, this.y)) {
        this.vx = -this.vx * 0.6;
        this.rx = 0;
        if (Math.abs(this.vx) > 40) w.sfx('thud', this.cx, this.y);
        break;
      }
      this.x += s;
      mx -= s;
    }
    this.ry += this.vy * DT;
    let my = Math.round(this.ry);
    this.ry -= my;
    while (my !== 0) {
      const s = Math.sign(my);
      if (this.hit(w, this.x, this.y + s)) {
        if (s > 0) this.vy = this.vy > 120 ? -this.vy * 0.5 : 0;
        else this.vy = 0;
        this.ry = 0;
        break;
      }
      this.y += s;
      my -= s;
    }
    this.onGround = this.hit(w, this.x, this.y + 1);
    this.spin += this.vx * DT * 0.25;
    for (const g of this.goals) {
      if (g.done) continue;
      if (this.x < g.x + g.w && this.x + this.w > g.x && this.y < g.y + g.h && this.y + this.h > g.y) {
        g.done = true;
        g.fn(w);
      }
    }
    // lying still somewhere unhelpful: a kid brings it back to its spot
    this.stillT = this.moving ? 0 : this.stillT + DT;
    const away = Math.abs(this.x - this.home[0]) > 2 || Math.abs(this.y - this.home[1]) > 2;
    if (away && this.stillT > this.fetchAfter && (this.fetchFrom === null || this.x > this.fetchFrom)) {
      w.emit('fx', this.cx, this.y, { kind: 'poof', w: 10, h: 10 });
      this.reset();
    }
    if (this.y > 18 * TILE + 40) this.reset();
  }
  draw(ctx: CanvasRenderingContext2D) {
    const x = this.x + 5,
      y = this.y + 5;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x, this.y + 10.5, 5, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FAFAFA';
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#263238';
    for (let i = 0; i < 3; i++) {
      const a = this.spin + (i * Math.PI * 2) / 3;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 2.7, y + Math.sin(a) * 2.7, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** a footballer in a jersey (the defenders' wall, the keeper, the kids) */
export function footballer(ctx: CanvasRenderingContext2D, x: number, feet: number, h: number, jersey: string, o: { arms?: 'cross' | 'up' | 'wide'; lean?: number; skin?: string } = {}) {
  const sk = o.skin ?? '#8D5524';
  ctx.save();
  ctx.translate(x, feet);
  ctx.rotate(o.lean ?? 0);
  const k = h / 30;
  ctx.fillStyle = '#212121';
  ctx.fillRect(-3.5 * k, -9 * k, 2.6 * k, 9 * k);
  ctx.fillRect(1 * k, -9 * k, 2.6 * k, 9 * k);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(-4 * k, -13 * k, 8 * k, 4.5 * k);
  ctx.fillStyle = jersey;
  ctx.fillRect(-5 * k, -23 * k, 10 * k, 10.5 * k);
  ctx.fillStyle = sk;
  ctx.beginPath();
  ctx.arc(0, -26 * k, 3.6 * k, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1B1B1B';
  ctx.fillRect(-3.6 * k, -30 * k, 7.2 * k, 2 * k);
  ctx.strokeStyle = jersey;
  ctx.lineWidth = 2.2 * k;
  ctx.beginPath();
  if (o.arms === 'up') {
    ctx.moveTo(-5 * k, -21 * k);
    ctx.lineTo(-8 * k, -31 * k);
    ctx.moveTo(5 * k, -21 * k);
    ctx.lineTo(8 * k, -31 * k);
  } else if (o.arms === 'wide') {
    ctx.moveTo(-5 * k, -21 * k);
    ctx.lineTo(-11 * k, -24 * k);
    ctx.moveTo(5 * k, -21 * k);
    ctx.lineTo(11 * k, -24 * k);
  } else {
    ctx.moveTo(-5 * k, -19 * k);
    ctx.lineTo(4 * k, -16 * k);
    ctx.moveTo(5 * k, -19 * k);
    ctx.lineTo(-4 * k, -16 * k);
  }
  ctx.stroke();
  ctx.restore();
}

/** goalposts and a net between two x's, crossbar at `top` (px) */
export function goalArt(ctx: CanvasRenderingContext2D, x0: number, x1: number, top: number, floor: number, depth = 12) {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = x0 + 4; x < x1; x += 5) {
    ctx.moveTo(x, top);
    ctx.lineTo(x + depth * 0.3, floor);
  }
  for (let y = top + 4; y < floor; y += 5) {
    ctx.moveTo(x0, y);
    ctx.lineTo(x1 + depth * 0.3, y);
  }
  ctx.stroke();
  ctx.fillStyle = '#FAFAFA';
  ctx.fillRect(x0 - 2, top - 2, 3, floor - top + 2);
  ctx.fillRect(x1 - 1, top - 2, 3, floor - top + 2);
  ctx.fillRect(x0 - 2, top - 2, x1 - x0 + 4, 3);
}

export type SleeperKind = 'dog' | 'cat' | 'uncle';

/** Somebody having a siesta in the street. Land anywhere inside the ring around them (the thud wakes
 *  them) and they're after you. Walking past is fine: it's the landing they hear. */
export class Sleeper extends Entity {
  awake = false;
  private wokeAt = -1;
  x: number;
  vx = 0;
  constructor(
    readonly home: number,
    readonly feet: number,
    readonly r: number,
    readonly kind: SleeperKind,
  ) {
    super();
    this.layer = 1;
    this.x = home;
  }
  wake(w: World) {
    if (this.awake) return;
    this.awake = true;
    this.wokeAt = w.tick;
    w.sfx(this.kind === 'cat' ? 'gasp' : 'snort', this.x, this.feet - 8);
    w.say(this.kind === 'dog' ? 'Bhow! Bhow!' : this.kind === 'cat' ? 'Myaaav!' : 'Kon re to?! | Who is it?!', this.x, this.feet - 26, 1.2, 'npc');
    w.flags.woke = (w.flags.woke ?? 0) + 1;
  }
  hears(px: number) {
    return Math.abs(px - this.x) < this.r;
  }
  update(w: World) {
    const p = w.player;
    if (!this.awake && w.state === 'play' && p.landTick === w.tick - 1 && Math.abs(p.y + p.h - this.feet) < 24 && this.hears(p.cx)) this.wake(w);
    if (!this.awake || w.state !== 'play') return;
    // a moment to bark, then after you: faster than you, but never off an edge
    if (w.tick - this.wokeAt < 30) return;
    const dir = Math.sign(p.cx - this.x);
    const nx = this.x + dir * 220 * DT;
    const foot = w.solidAt(nx - 2, this.feet + 1, 4, 2);
    const wall = w.solidAt(nx - 6, this.feet - 10, 12, 8);
    if (foot && !wall) this.x = nx;
    if (Math.abs(p.cx - this.x) < 10 && Math.abs(p.y + p.h - this.feet) < 14) w.die('woke');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const x = this.x,
      y = this.feet;
    if (!this.awake) {
      // the ring it hears inside, dotted on the street
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, y - 1, this.r, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '700 5px sans-serif';
      ctx.textAlign = 'center';
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.6 + i / 3) % 1;
        ctx.globalAlpha = 1 - k;
        ctx.fillText('z', x + 4 + k * 8, y - 12 - k * 14 - i);
      }
      ctx.globalAlpha = 1;
    }
    if (this.kind === 'uncle') {
      // asleep on a bench under his hat
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(x - 13, y - 7, 26, 3);
      ctx.fillRect(x - 11, y - 4, 2, 4);
      ctx.fillRect(x + 9, y - 4, 2, 4);
      if (!this.awake) {
        ctx.fillStyle = '#ECEFF1';
        ctx.fillRect(x - 10, y - 12, 16, 5);
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(x - 10, y - 9, 6, 3);
        ctx.fillStyle = '#D7B56D';
        ctx.beginPath();
        ctx.ellipse(x + 8, y - 12, 6, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ECEFF1';
        ctx.fillRect(x - 3, y - 22, 7, 12);
        ctx.fillStyle = '#8D5524';
        ctx.beginPath();
        ctx.arc(x, y - 25, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    const cat = this.kind === 'cat';
    const col = cat ? '#F5A35B' : '#C8A27A';
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y, 9, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col;
    if (!this.awake) {
      // curled up
      ctx.beginPath();
      ctx.ellipse(x, y - 4, cat ? 6 : 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + (cat ? 5 : 7), y - 5, cat ? 2.6 : 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x + (cat ? 5 : 7), y - 5.5, 1.6, 0.6);
    } else {
      const f = Math.sign(w.player.cx - x) || 1;
      const leg = Math.sin(t * 30) * 2;
      ctx.fillRect(x - 7, y - 9, 14, 5);
      ctx.fillRect(x - 6 + leg, y - 4, 2, 4);
      ctx.fillRect(x + 4 - leg, y - 4, 2, 4);
      ctx.beginPath();
      ctx.arc(x + f * 8, y - 10, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1D1A26';
      ctx.fillRect(x + f * 9, y - 11, 1.2, 1.2);
    }
  }
}

/** A toddy tapper's rope between two palms. It sags under you (slowly as you walk out, all the way if
 *  you stand still in the middle) and springs back when you jump off: jump from deep in the sag and
 *  it throws you far higher than any jump. A frayed one snaps a moment after you land on it. */
export class Rope extends Entity {
  solid: Solid;
  depth = 0;
  /** where along it (0..1) the sag is: under Dad while he's on it */
  u = 0.5;
  private onAt = -999;
  private firstOn = -1;
  snapped = false;
  static GIVE = 50;
  static BACK = 260;
  static KICK = 6.5;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y0: number,
    readonly S = 56,
    readonly frayed = 0,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x0, y0, 12, 4);
    this.solid.oneWay = true;
  }
  /** the rope's height at world x (its current sag shape: a V with its point at u) */
  yAt(x: number) {
    const v = (x - this.x0) / (this.x1 - this.x0);
    if (v <= 0 || v >= 1) return this.y0;
    return this.y0 + this.depth * (v <= this.u ? v / this.u : (1 - v) / (1 - this.u));
  }
  get on() {
    return this.onAt >= 0;
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    if (this.snapped) return;
    const standing = w.standing(s);
    // the throw: he jumped off it last tick, from however deep it was
    if (this.onAt === w.tick - 1 && p.jumpTick === w.tick - 1 && !standing) {
      p.vy -= this.depth * Rope.KICK;
      if (this.depth > 12) w.sfx('boing', p.cx, p.y + p.h);
      w.flags.ropeKick = this.depth;
    }
    if (standing) {
      if (this.firstOn < 0) this.firstOn = w.tick;
      this.onAt = w.tick;
    } else this.onAt = -999;
    if (this.frayed && this.firstOn >= 0 && (w.tick - this.firstOn) * DT >= this.frayed) {
      this.snapped = true;
      s.collidable = false;
      w.sfx('snap', s.x + 6, s.y);
      w.emit('fx', s.x + 6, s.y, { kind: 'dust' });
      return;
    }
    const over = p.cx > this.x0 && p.cx < this.x1;
    const u = Math.max(0.03, Math.min(0.97, (p.cx - this.x0) / (this.x1 - this.x0)));
    if (standing) this.u = u;
    // deepest in the middle, hardly at all near the palms (so you can always step off at either end)
    const target = standing ? this.S * Math.pow(4 * u * (1 - u), 1.6) : 0;
    const d = target - this.depth;
    this.depth += d > 0 ? Math.min(d, Rope.GIVE * DT) : Math.max(d, -Rope.BACK * DT);
    // keep the bit you stand on (or would land on) under Dad
    const tx = Math.max(this.x0, Math.min(this.x1 - 12, p.cx - 6));
    const ty = standing ? this.y0 + this.depth : this.yAt(p.cx);
    if (over || standing) {
      s.place(tx, s.y + s.yr);
      s.moveBy(w, 0, ty - (s.y + s.yr));
    } else s.place(tx, this.y0);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const sx = this.solid.x + 6;
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1.4;
    if (this.snapped) {
      ctx.beginPath();
      ctx.moveTo(this.x0, this.y0);
      ctx.quadraticCurveTo(this.x0 + 6, this.y0 + 30, this.x0 + 2, this.y0 + 46);
      ctx.moveTo(this.x1, this.y0);
      ctx.quadraticCurveTo(this.x1 - 6, this.y0 + 30, this.x1 - 2, this.y0 + 46);
      ctx.stroke();
      return;
    }
    // the foot rope, sagging (dark outline, light core so it reads over the houses), and the hand rope
    const k = this.x0 + (this.x1 - this.x0) * this.u;
    for (const [col, lw] of [
      ['#3E2723', 3.4],
      ['#E0B07A', 1.6],
    ] as [string, number][]) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(this.x0, this.y0);
      ctx.lineTo(k, this.y0 + this.depth);
      ctx.lineTo(this.x1, this.y0);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(62,39,35,0.85)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(this.x0, this.y0 - 22);
    ctx.quadraticCurveTo(k, this.y0 - 18 + this.depth * 0.8, this.x1, this.y0 - 22);
    ctx.stroke();
    if (this.frayed) {
      // the frayed bit, and how long it has left
      ctx.strokeStyle = '#D7CCC8';
      ctx.lineWidth = 0.8;
      const fx = (this.x0 + this.x1) / 2 + 10;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(fx, this.yAt(fx));
        ctx.lineTo(fx + i * 1.5, this.yAt(fx) + 4 + Math.abs(i));
        ctx.stroke();
      }
    }
    void sx;
    void w;
  }
}

/** a palm trunk from the ground up to (x, top), its crown of fronds */
export function palmArt(ctx: CanvasRenderingContext2D, x: number, top: number, floor: number, lean = 0) {
  ctx.strokeStyle = '#6D4C41';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - lean, floor);
  ctx.quadraticCurveTo(x - lean * 0.3, (top + floor) / 2, x, top);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  for (let y = top + 8; y < floor; y += 7) {
    ctx.beginPath();
    ctx.moveTo(x - 2.5 - lean * ((y - top) / (floor - top)), y);
    ctx.lineTo(x + 2.5 - lean * ((y - top) / (floor - top)), y + 1);
    ctx.stroke();
  }
  ctx.fillStyle = '#2E7D32';
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.quadraticCurveTo(x + Math.cos(a) * 14, top + Math.sin(a) * 14 - 5, x + Math.cos(a) * 24, top + Math.sin(a) * 24 + 7);
    ctx.quadraticCurveTo(x + Math.cos(a) * 12, top + Math.sin(a) * 12, x, top + 1);
    ctx.fill();
  }
  ctx.fillStyle = '#5D4037';
  ctx.beginPath();
  ctx.arc(x - 2, top + 4, 2.4, 0, Math.PI * 2);
  ctx.arc(x + 3, top + 5, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

export type Bet = 'R' | 'B' | 'G';

/** The casino boat's roulette. While the wheel spins every chip-pad on the floor holds; when the ball
 *  lands, only the winning colour's pads stay up (green zero: none do). */
export class Roulette extends Entity {
  solids: Solid[] = [];
  private drop: number[] = [];
  constructor(
    readonly pads: { x: number; y: number; w: number; c: 'R' | 'B' }[],
    readonly wheel: { x: number; y: number },
    readonly o: { spin: number; show: number; phase?: number; seq: Bet[] },
  ) {
    super();
    this.layer = 1;
    for (const p of pads) {
      this.solids.push(new Solid(p.x, p.y, p.w, 8));
      this.drop.push(0);
    }
  }
  get cycle() {
    return this.o.spin + this.o.show;
  }
  /** where the wheel is now: spinning (and for how much longer), or showing a result */
  at(t: number): { spinning: boolean; left: number; result: Bet; next: Bet } {
    const u = t - (this.o.phase ?? 0);
    const k = Math.floor(u / this.cycle);
    const tau = u - k * this.cycle;
    const seq = this.o.seq;
    const r = seq[((k % seq.length) + seq.length) % seq.length];
    const n = seq[(((k + 1) % seq.length) + seq.length) % seq.length];
    if (tau < this.o.spin) return { spinning: true, left: this.o.spin - tau, result: r, next: r };
    return { spinning: false, left: this.cycle - tau, result: r, next: n };
  }
  holds(i: number, t: number) {
    const s = this.at(t);
    return s.spinning || s.result === this.pads[i].c;
  }
  update(w: World) {
    const t = w.tick * DT;
    const st = this.at(t);
    const was = w.flags.wheel?.spinning;
    w.flags.wheel = st;
    if (was === true && !st.spinning && Math.abs(w.player.cx - this.wheel.x) < 16 * 14) {
      w.sfx(st.result === 'G' ? 'laugh' : 'click', this.wheel.x, this.wheel.y);
      w.say(st.result === 'R' ? 'Vermelho! | Red!' : st.result === 'B' ? 'Preto! | Black!' : 'Zero! A casa ganha! | Zero! The house wins!', this.wheel.x, this.wheel.y - 30, 1.4, 'npc');
    }
    for (let i = 0; i < this.pads.length; i++) {
      const on = st.spinning || st.result === this.pads[i].c;
      this.solids[i].collidable = on;
      this.drop[i] = on ? Math.max(0, this.drop[i] - DT * 4) : Math.min(1, this.drop[i] + DT * 3);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const st = this.at(t);
    // the pads: casino chips laid flat
    for (let i = 0; i < this.pads.length; i++) {
      const p = this.pads[i];
      const k = this.drop[i];
      const blink = st.spinning && st.left < 0.45 && Math.floor(t * 12) % 2 === 0;
      ctx.save();
      ctx.globalAlpha = 1 - k * 0.75;
      const y = p.y + k * 10;
      ctx.fillStyle = p.c === 'R' ? '#C62828' : '#212121';
      ctx.fillRect(p.x, y, p.w, 8);
      ctx.fillStyle = blink ? '#FFF59D' : '#ECEFF1';
      for (let x = p.x + 3; x < p.x + p.w - 2; x += 7) ctx.fillRect(x, y + 1, 3, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(p.x, y + 6, p.w, 2);
      ctx.restore();
    }
    // the wheel, with its ball
    const { x, y } = this.wheel;
    const spinA = st.spinning ? t * 9 : 0;
    for (let i = 0; i < 18; i++) {
      const a0 = spinA + (i / 18) * Math.PI * 2,
        a1 = a0 + (Math.PI * 2) / 18;
      ctx.fillStyle = i === 0 ? '#2E7D32' : i % 2 ? '#C62828' : '#212121';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, 18, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#C9A227';
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.stroke();
    const ba = st.spinning ? -t * 14 : -Math.PI / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + Math.cos(ba) * 14, y + Math.sin(ba) * 14, 2, 0, Math.PI * 2);
    ctx.fill();
    // the result board
    const label = st.spinning ? 'GIRANDO' : st.result === 'R' ? 'VERMELHO' : st.result === 'B' ? 'PRETO' : 'ZERO';
    const col = st.spinning ? '#FFD54F' : st.result === 'R' ? '#FF5252' : st.result === 'B' ? '#ECEFF1' : '#69F0AE';
    ctx.fillStyle = 'rgba(20,10,30,0.85)';
    ctx.fillRect(x - 26, y + 24, 52, 11);
    ctx.font = '800 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = col;
    ctx.fillText(label, x, y + 30);
  }
}

/** A parasail off Miramar. Jump and grab the harness and the boat sets off: hold right to pull on the
 *  risers and climb, left to spill air and drop, nothing and you sink slowly. Jump to let go. Touch the
 *  sea and you're dunked; hang on past the end of the beach and you're off to Aguada. */
export class Parasail extends Entity implements Climbable {
  active = true;
  len = 1e6;
  hx: number;
  hy: number;
  vy = 0;
  held = false;
  started = false;
  done = false;
  private bob = 0;
  constructor(
    readonly x0: number,
    readonly y0: number,
    readonly xEnd: number,
    readonly sea: number,
    readonly o: { speed: number; top?: number },
  ) {
    super();
    this.layer = 4;
    this.hx = x0;
    this.hy = y0;
  }
  at() {
    return { x: this.hx, y: this.hy + 14 };
  }
  touch(x: number, y: number, w: number, h: number) {
    if (this.done) return null;
    return x < this.hx + 8 && x + w > this.hx - 8 && y < this.hy + 6 && y + h > this.hy - 4 ? 0.5 : null;
  }
  onGrip() {
    this.held = true;
  }
  onLeave() {
    this.held = false;
    if (this.started) this.done = true;
  }
  update(w: World) {
    const p = w.player;
    if (this.held && !this.started) {
      this.started = true;
      w.sfx('wind', this.hx, this.hy);
    }
    if (!this.started) {
      this.bob += DT;
      this.hy = this.y0 + Math.sin(this.bob * 2) * 1.5;
      return;
    }
    if (this.done) {
      // empty, the chute flies on out to sea
      this.hx += this.o.speed * DT;
      this.hy = Math.max(this.o.top ?? 24, this.hy - 30 * DT);
      return;
    }
    this.hx += this.o.speed * DT;
    const dir = (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0);
    const want = dir > 0 ? -72 : dir < 0 ? 110 : 24;
    this.vy = approach(this.vy, want, 320 * DT);
    this.hy = Math.max(this.o.top ?? 24, this.hy + this.vy * DT);
    if (this.hy > this.sea - 14) this.vy = Math.min(this.vy, 0);
    w.flags.sail = { x: this.hx, y: this.hy, vy: this.vy, held: this.held };
    if (this.held && p.y + p.h > this.sea) w.die('dunked');
    if (this.held && this.hx > this.xEnd) w.die('far');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.hx,
      y = this.hy;
    const t = w.tick * DT;
    // the canopy, striped, with its lines down to the harness
    const cy = y - 62,
      cw = 46;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (const k of [-1, -0.5, 0, 0.5, 1]) {
      ctx.moveTo(x + k * cw * 0.5, cy + 6);
      ctx.lineTo(x, y - 2);
    }
    ctx.stroke();
    const cols = ['#E53935', '#FDD835', '#1E88E5', '#FDD835', '#E53935'];
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = cols[i];
      ctx.beginPath();
      const a0 = Math.PI + (i / 5) * Math.PI,
        a1 = Math.PI + ((i + 1) / 5) * Math.PI;
      ctx.moveTo(x, cy + 8);
      ctx.arc(x, cy + 8, cw * 0.5, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    // the harness bar
    ctx.fillStyle = '#37474F';
    ctx.fillRect(x - 7, y - 2, 14, 3);
    // the tow rope to the boat, and the boat
    if (this.started || true) {
      const bx = x + 110,
        by = this.sea - 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x + 4, y);
      ctx.quadraticCurveTo(x + 60, (y + by) / 2 + 20, bx - 10, by - 4);
      ctx.stroke();
      ctx.fillStyle = '#FAFAFA';
      ctx.beginPath();
      ctx.moveTo(bx - 14, by - 6);
      ctx.lineTo(bx + 16, by - 6);
      ctx.lineTo(bx + 10, by + 2);
      ctx.lineTo(bx - 12, by + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(bx - 12, by - 2, 22, 2);
      if (this.started) {
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(bx - 16, by + 1);
        ctx.lineTo(bx - 30 - Math.sin(t * 9) * 3, by + 2);
        ctx.stroke();
      }
    }
  }
}

/** a deadly box (kite strings and their kites, a mast, a flock): `look` decides how it's drawn */
export class Snag extends Entity {
  hazard: Hazard;
  constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    readonly look: 'kites' | 'mast',
    cause = 'tangled',
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = { active: true, cause, hits: (x2, y2, w2, h2) => x2 < self.x + self.w && x2 + w2 > self.x && y2 < self.y + self.h && y2 + h2 > self.y };
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const cx = this.x + this.w / 2;
    if (this.look === 'mast') {
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(cx - 1.5, this.y, 3, this.h);
      ctx.fillStyle = '#FF7043';
      ctx.beginPath();
      ctx.moveTo(cx + 1.5, this.y + 2);
      ctx.lineTo(cx + 12, this.y + 7);
      ctx.lineTo(cx + 1.5, this.y + 12);
      ctx.fill();
      return;
    }
    // a column of kites on one long string
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(cx, this.y);
    ctx.lineTo(cx, this.y + this.h);
    ctx.stroke();
    const cols = ['#E91E63', '#FFC107', '#00BCD4', '#8BC34A'];
    for (let k = 0, yy = this.y + 6; yy < this.y + this.h - 4; yy += 14, k++) {
      const sw = Math.sin(t * 3 + k) * 1.5;
      ctx.fillStyle = cols[k % cols.length];
      ctx.beginPath();
      ctx.moveTo(cx + sw, yy - 6);
      ctx.lineTo(cx + 5 + sw, yy);
      ctx.lineTo(cx + sw, yy + 6);
      ctx.lineTo(cx - 5 + sw, yy);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/** King Momo's parade: floats roll down the street while the band plays. When the music stops, the
 *  parade freezes and King Momo looks round: anyone standing in the street (not up on a float) is out. */
export class Parade extends Entity {
  solids: Solid[] = [];
  private x: number[] = [];
  private gone: number[] = [];
  readonly fl: { w: number; h: number; v: number; col: string; x0: number }[];
  constructor(
    readonly x0: number,
    readonly x1: number,
    floats: { w: number; h: number; v: number; col: string; at: number }[],
    readonly music: { play: number[]; stop: number; phase?: number },
  ) {
    super();
    this.layer = 1;
    this.fl = floats.map((f) => ({ ...f, x0: f.at }));
    for (const f of floats) {
      const sl = new Solid(f.at, 240 - f.h, f.w, 6);
      sl.oneWay = true;
      this.solids.push(sl);
      this.x.push(f.at);
      this.gone.push(0);
    }
  }
  /** the music now: playing (and how long until it stops) or stopped */
  tune(t: number) {
    const m = this.music;
    const cyc = m.play.reduce((a, b) => a + b, 0) + m.play.length * m.stop;
    let u = (((t - (m.phase ?? 0)) % cyc) + cyc) % cyc;
    for (let i = 0; i < m.play.length; i++) {
      if (u < m.play[i]) return { playing: true, left: m.play[i] - u, i };
      u -= m.play[i];
      if (u < m.stop) return { playing: false, left: m.stop - u, i };
      u -= m.stop;
    }
    return { playing: true, left: 1, i: 0 };
  }
  onFloat(w: World) {
    return this.solids.some((s) => w.standing(s));
  }
  update(w: World) {
    const t = w.tick * DT;
    const m = this.tune(t);
    const prev = w.flags.music as { playing: boolean } | undefined;
    w.flags.music = m;
    const p = w.player;
    if (prev && prev.playing && !m.playing && p.cx > this.x0 - 160 && p.cx < this.x1 + 160) {
      w.sfx('whistle', p.cx, p.y);
      // everybody freeze! anyone in the street is out
      const inStreet = p.cx > this.x0 && p.cx < this.x1;
      if (inStreet && !this.onFloat(w)) {
        w.say('Fora! Momo dekhta! | Out! Momo sees you!', p.cx, p.y - 10, 1.4, 'npc');
        w.die('momo');
        return;
      }
    }
    if (!m.playing) return;
    for (let i = 0; i < this.fl.length; i++) {
      const f = this.fl[i];
      const sl = this.solids[i];
      if (this.gone[i] > 0) {
        // round the corner and back in at the top of the street
        this.gone[i] -= DT;
        if (this.gone[i] <= 0) {
          sl.place(this.x0 - f.w, sl.y);
          sl.collidable = true;
        }
        continue;
      }
      sl.velX = f.v;
      sl.moveBy(w, f.v * DT, 0);
      if (sl.x > this.x1) {
        sl.collidable = false;
        sl.velX = 0;
        this.gone[i] = 0.8;
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const m = this.tune(t);
    for (let i = 0; i < this.fl.length; i++) {
      if (this.gone[i] > 0) continue;
      const f = this.fl[i];
      const s = this.solids[i];
      const x = s.x,
        top = s.y;
      // the truck under the float, its skirt, the big papier-mache head on top
      ctx.fillStyle = f.col;
      ctx.fillRect(x, top, f.w, 240 - top - 6);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let k = 0; k < f.w; k += 8) ctx.fillRect(x + k, top + 6 + ((k / 8) % 2) * 3, 4, 3);
      ctx.fillStyle = '#FFD54F';
      ctx.fillRect(x, top, f.w, 3);
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.arc(x + 8, 236, 4, 0, Math.PI * 2);
      ctx.arc(x + f.w - 8, 236, 4, 0, Math.PI * 2);
      ctx.fill();
      const bob = m.playing ? Math.sin(t * 8 + i) * 1.5 : 0;
      const hx = x + f.w * 0.7;
      ctx.fillStyle = '#FFCC80';
      ctx.beginPath();
      ctx.arc(hx, top - 12 + bob, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(hx - 9, top - 22 + bob, 18, 4);
      ctx.fillStyle = '#1D1A26';
      ctx.fillRect(hx - 4, top - 13 + bob, 2, 2);
      ctx.fillRect(hx + 2, top - 13 + bob, 2, 2);
      ctx.fillStyle = '#C62828';
      ctx.fillRect(hx - 3, top - 8 + bob, 6, 1.6);
    }
    // the band's warning: the drummer lifts his sticks just before the music stops
    const warn = m.playing && m.left < 0.7;
    ctx.font = '800 9px sans-serif';
    ctx.textAlign = 'center';
    for (let bx = this.x0 + 40; bx < this.x1; bx += 160) {
      ctx.fillStyle = 'rgba(20,10,30,0.6)';
      ctx.fillRect(bx - 18, 30, 36, 14);
      ctx.fillStyle = m.playing ? (warn ? '#FF5252' : '#69F0AE') : '#FFD54F';
      ctx.fillText(m.playing ? (warn && Math.floor(t * 10) % 2 ? '♪  !' : '♪ ♫') : 'STOP', bx, 40);
    }
  }
}
