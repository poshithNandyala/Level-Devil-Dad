// Raipur's (and Chhattisgarh's) moving parts: gedi stilts over the paddy mud, a clock that only ticks
// when Dad moves, hills of rice poured from sacks, bhaunra spinning tops, kosa cocoons, and the red
// weaver ants' living bridges.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT } from '../constants';

/** Gedi: the bamboo stilts of Hareli. From the stand at x0 Dad is up on them: taller, slower, safe from
 *  the mud, and his jump is a great deal higher. But come down from a jump still moving and over he
 *  goes, off the stilts. They come off (gently) at x1. */
export class Gedi extends Entity {
  on = false;
  private armed = true;
  topples = 0;
  static H = 20;
  static JUMP = 1.27;
  static SLOW = 72;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 3;
  }
  static up(w: World) {
    return w.entities.some((e) => e instanceof Gedi && e.on);
  }
  private off(w: World) {
    const p = w.player;
    this.on = false;
    p.h -= Gedi.H;
    p.y += Gedi.H;
    p.lift = 0;
    p.speedMul = 1;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    w.flags.gedi = Gedi.up(w);
    if (!this.on) {
      if (Math.abs(p.cx - this.x0) > 24) this.armed = true;
      if (this.armed && p.onGround && Math.abs(p.cx - this.x0) < 6 && p.cx < this.x1 && Math.abs(p.y + p.h - this.floor) < 3 && !w.solidAt(p.x, p.y - Gedi.H, p.w, Gedi.H)) {
        this.on = true;
        this.armed = false;
        p.y -= Gedi.H;
        p.h += Gedi.H;
        p.lift = Gedi.H;
        w.sfx('land', p.cx, p.y);
      }
      return;
    }
    p.speedMul = 0.75;
    if (p.jumpTick === w.tick - 1) p.vy *= Gedi.JUMP;
    if (p.landTick === w.tick - 1 && p.landSpeed > 150 && Math.abs(p.vx) > Gedi.SLOW) {
      // came down still travelling: off the stilts
      this.off(w);
      this.topples++;
      w.flags.toppled = (w.flags.toppled ?? 0) + 1;
      p.vx *= 0.3;
      p.stun = 36;
      w.sfx('thud', p.cx, p.y);
      return;
    }
    if (p.cx >= this.x1) this.off(w);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the stand: a pair leaning on a post
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.x0 - 1, this.floor - 30, 2, 30);
    const pole = (x: number, top: number, bot: number, lean: number) => {
      ctx.strokeStyle = '#C0A060';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + lean, top);
      ctx.lineTo(x, bot);
      ctx.stroke();
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(x + lean * 0.4 - 3, bot - Gedi.H - 1, 6, 2.5);
    };
    if (!this.on) {
      pole(this.x0 - 5, this.floor - 44, this.floor, 4);
      pole(this.x0 + 6, this.floor - 44, this.floor, -3);
      return;
    }
    const p = w.player;
    const sw = p.onGround ? Math.sin(w.tick * 0.2) * Math.min(3, Math.abs(p.vx) * 0.04) : 0;
    pole(p.x + 1 + sw, p.y - 3, p.y + p.h, 0);
    pole(p.x + p.w - 1 - sw, p.y - 3, p.y + p.h, 0);
  }
}

/** Paddy mud, knee deep. On foot you're stuck in it for good; on stilts you stalk straight through. */
export class Mud extends Entity {
  hazard: Hazard;
  safe = false;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y: number,
  ) {
    super();
    this.layer = 4;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'daldal',
      hits: (x, y2, w2, h2) => !self.safe && x + w2 > self.x0 + 3 && x < self.x1 - 3 && y2 + h2 > self.y - 1 && y2 + h2 <= self.y + 2,
    };
  }
  update(w: World) {
    this.safe = Gedi.up(w);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    ctx.fillStyle = 'rgba(96,72,44,0.9)';
    ctx.fillRect(this.x0, this.y - 3, this.x1 - this.x0, 5);
    ctx.fillStyle = 'rgba(150,190,200,0.5)';
    for (let x = this.x0 + 2; x < this.x1 - 6; x += 11) ctx.fillRect(x + Math.sin(w.tick * 0.02 + x) * 1.5, this.y - 3, 6, 1);
    // seedlings
    ctx.strokeStyle = '#7CB342';
    ctx.lineWidth = 1;
    for (let x = this.x0 + 4, k = 0; x < this.x1 - 2; x += 6, k++) {
      ctx.beginPath();
      ctx.moveTo(x, this.y - 2);
      ctx.lineTo(x - 1.5, this.y - 8 - (k % 3));
      ctx.moveTo(x, this.y - 2);
      ctx.lineTo(x + 1.5, this.y - 7 - (k % 2));
      ctx.stroke();
    }
  }
}

/** Ghadi Chowk's clock. Here time only passes when Dad moves: a second of it for every second's worth
 *  of running, jumping or falling. Stand still and every hand, piston and pendulum stops dead. */
export class Ghadi extends Entity {
  t = 0;
  private lx = NaN;
  private ly = NaN;
  moving = false;
  faces: { x: number; y: number; r: number }[] = [];
  constructor(readonly x0 = -1e9) {
    super();
    this.layer = -3;
  }
  update(w: World) {
    const p = w.player;
    if (w.state === 'play' && !Number.isNaN(this.lx) && p.cx >= this.x0) {
      const d = Math.min(6, Math.hypot(p.x - this.lx, p.y - this.ly));
      this.t += d / 140;
      this.moving = d > 0.05;
    } else this.moving = false;
    this.lx = p.x;
    this.ly = p.y;
    w.flags.ghadiT = this.t;
  }
  /** the hour (0..12) its faces show: one hour per 2 s of his moving, starting at `start` */
  hour(start = 0) {
    return (((start + this.t / 2) % 12) + 12) % 12;
  }
  draw(ctx: CanvasRenderingContext2D) {
    for (const f of this.faces) clockFace(ctx, f.x, f.y, f.r, this.t, this.moving);
  }
}
export function clockFace(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number, live: boolean, start = 0) {
  ctx.fillStyle = '#FFFDE7';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = live ? '#D84315' : '#5D4037';
  ctx.lineWidth = Math.max(1.5, r * 0.12);
  ctx.stroke();
  ctx.fillStyle = '#3E2723';
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    ctx.fillRect(x + Math.sin(a) * r * 0.8 - 0.6, y - Math.cos(a) * r * 0.8 - 0.6, 1.2, 1.2);
  }
  const hr = ((start + t / 2) / 12) * Math.PI * 2;
  const mn = (t / 2) * Math.PI * 2;
  ctx.strokeStyle = '#3E2723';
  ctx.lineWidth = Math.max(1.2, r * 0.1);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.sin(hr) * r * 0.5, y - Math.cos(hr) * r * 0.5);
  ctx.stroke();
  ctx.lineWidth = Math.max(0.8, r * 0.06);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.sin(mn) * r * 0.78, y - Math.cos(mn) * r * 0.78);
  ctx.stroke();
}

/** A giant clock hand sweeping round its pivot on the Ghadi's time. Don't be where it is. */
export class Hand extends Entity {
  hazard: Hazard;
  constructor(
    readonly g: Ghadi,
    readonly cx: number,
    readonly cy: number,
    readonly len: number,
    readonly period: number,
    readonly phase = 0,
  ) {
    super();
    this.layer = 2;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'kaanta',
      hits: (x, y, w2, h2) => self.hitsAt(self.g.t, x, y, w2, h2),
    };
  }
  angle(t: number) {
    return (t / this.period + this.phase) * Math.PI * 2;
  }
  hitsAt(t: number, x: number, y: number, w2: number, h2: number) {
    const a = this.angle(t);
    const ex = this.cx + Math.sin(a) * this.len,
      ey = this.cy - Math.cos(a) * this.len;
    // distance from the rect's middle to the hand
    const mx = x + w2 / 2,
      my = y + h2 / 2;
    const dx = ex - this.cx,
      dy = ey - this.cy;
    const u = Math.max(0.12, Math.min(1, ((mx - this.cx) * dx + (my - this.cy) * dy) / (dx * dx + dy * dy)));
    const qx = this.cx + u * dx - mx,
      qy = this.cy + u * dy - my;
    return Math.abs(qx) < w2 / 2 + 2 && Math.abs(qy) < h2 / 2 + 2;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const a = this.angle(this.g.t);
    const ex = this.cx + Math.sin(a) * this.len,
      ey = this.cy - Math.cos(a) * this.len;
    clockFace(ctx, this.cx, this.cy, 9, this.g.t, this.g.moving);
    ctx.strokeStyle = '#1B1B1B';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.strokeStyle = '#D84315';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.lineCap = 'butt';
    ctx.fillStyle = '#FDD835';
    ctx.beginPath();
    ctx.arc(ex, ey, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A hill of rice. It lies where it's poured and slumps to its own slope; Dad walks up it. */
export class Heap extends Entity {
  h: number[];
  solids: Solid[] = [];
  static COL = 8;
  static SLOPE = 5;
  constructor(
    readonly x0: number,
    readonly n: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 1;
    this.h = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      const s = new Solid(x0 + i * Heap.COL, floor, Heap.COL, 1);
      s.collidable = false;
      this.solids.push(s);
    }
  }
  /** `vol` px² of rice landing at world x */
  pour(x: number, vol: number) {
    const i = Math.max(0, Math.min(this.n - 1, Math.floor((x - this.x0) / Heap.COL)));
    this.h[i] += vol / Heap.COL;
    this.busy = true;
  }
  topAt(x: number) {
    const i = Math.floor((x - this.x0) / Heap.COL);
    return i < 0 || i >= this.n ? this.floor : this.floor - this.h[i];
  }
  get peak() {
    return Math.max(...this.h);
  }
  private busy = true;
  update(w: World) {
    // settled, and nothing poured since: nothing to do
    if (!this.busy) return;
    let moved = false;
    for (let pass = 0; pass < 4; pass++)
      for (let i = 0; i < this.n; i++)
        for (const j of [i - 1, i + 1]) {
          if (j < 0 || j >= this.n) continue;
          // a wall where the next column would be: nothing slides in to it
          const jx = this.x0 + j * Heap.COL;
          if (w.solidAt(jx + 3, this.floor - this.h[j] - 4, 2, 2) === true) continue;
          const d = this.h[i] - this.h[j] - Heap.SLOPE;
          if (d > 0.01) {
            const m = Math.min(2.5, d / 2);
            this.h[i] -= m;
            this.h[j] += m;
            moved = true;
          }
        }
    for (let i = 0; i < this.n; i++) {
      const s = this.solids[i];
      const want = Math.round(this.h[i]);
      const cur = s.collidable ? s.h : 0;
      if (want === cur) continue;
      if (want <= 0) {
        s.collidable = false;
        s.place(s.x, this.floor);
        s.h = 1;
        continue;
      }
      if (!s.collidable) {
        s.collidable = true;
        s.place(s.x, this.floor);
        s.h = 1;
        s.moveBy(w, 0, -1);
        if (want > 1) s.moveBy(w, 0, -(want - 1));
        s.h = want;
        continue;
      }
      s.moveBy(w, 0, cur - want);
      s.h = want;
    }
    w.flags.heap = Math.round(this.peak);
    this.busy = moved;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#F5F0DC';
    ctx.beginPath();
    ctx.moveTo(this.x0, this.floor);
    for (let i = 0; i < this.n; i++) ctx.lineTo(this.x0 + (i + 0.5) * Heap.COL, this.floor - this.h[i]);
    ctx.lineTo(this.x0 + this.n * Heap.COL, this.floor);
    ctx.fill();
    ctx.fillStyle = 'rgba(200,180,120,0.55)';
    for (let i = 0; i < this.n; i++) {
      const hh = this.h[i];
      for (let y = 3; y < hh; y += 5) ctx.fillRect(this.x0 + i * Heap.COL + ((i * 5 + y * 3) % 6), this.floor - y, 1.5, 1);
    }
  }
}

/** A sack of rice hung up over a Heap, with a cord. Pull the cord (touch it) and it empties. */
export class Sack extends Entity {
  open = false;
  left: number;
  /** if it slides on a rail, the crate below that drags it */
  constructor(
    public x: number,
    readonly y: number,
    readonly vol: number,
    readonly heap: Heap,
    readonly cord = 46,
    readonly rate = 2400,
  ) {
    super();
    this.layer = 2;
    this.left = vol;
  }
  update(w: World) {
    const p = w.player;
    if (w.state !== 'play') return;
    if (!this.open && this.left > 0 && Math.abs(p.cx - this.x) < 7 && p.y < this.y + 14 + this.cord && p.y + p.h > this.y + 14) {
      this.open = true;
      w.flags.sacks = (w.flags.sacks ?? 0) + 1;
      w.sfx('creak', this.x, this.y);
    }
    if (this.open && this.left > 0) {
      const v = Math.min(this.left, this.rate * DT);
      this.left -= v;
      this.heap.pour(this.x, v);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const { x, y } = this;
    const full = this.left / this.vol;
    // the hook and the sack
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - 0.8, y - 16, 1.6, 16);
    ctx.fillStyle = '#C9A66B';
    ctx.beginPath();
    ctx.ellipse(x, y + 2, 7 + full * 4, 6 + full * 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#A8824A';
    ctx.fillRect(x - 5, y - 6 - full * 4, 10, 3);
    ctx.strokeStyle = 'rgba(90,60,30,0.4)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 2);
    ctx.lineTo(x + 6, y + 2);
    ctx.stroke();
    // the cord
    if (!this.open) {
      ctx.strokeStyle = '#D84315';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + 12);
      ctx.lineTo(x + Math.sin(w.tick * 0.05) * 1.5, y + 14 + this.cord);
      ctx.stroke();
      ctx.fillStyle = '#FDD835';
      ctx.fillRect(x - 2 + Math.sin(w.tick * 0.05) * 1.5, y + 12 + this.cord, 4, 4);
    } else if (this.left > 0) {
      // rice pouring
      ctx.fillStyle = 'rgba(245,240,220,0.9)';
      ctx.fillRect(x - 2, y + 12, 4, this.heap.topAt(x) - y - 12);
    }
  }
}

/** A bhaunra: a big wooden spinning top with a flat crown to stand on. Spinning fast it stands still;
 *  as it slows it wanders in wider and wider circles, and then it falls over. Landing on it whips it
 *  back up to speed. The children set a fallen one going again after a while. */
export class Top extends Entity {
  /** spin: 1 flat out .. 0 stopped */
  s = 1;
  private th = 0;
  down = 0;
  solid: Solid;
  static DECAY = 0.11;
  static FALL = 0.12;
  constructor(
    readonly x0: number,
    readonly floor: number,
    readonly o: { w?: number; h?: number; s?: number; decay?: number; relaunch?: number; phase?: number } = {},
  ) {
    super();
    this.layer = 1;
    const wd = o.w ?? 26;
    this.solid = new Solid(x0 - wd / 2, floor - (o.h ?? 26), wd, 4);
    this.solid.oneWay = true;
    // its wandering isn't a push: a jump off it is a plain jump
    this.solid.velX = 0;
    this.s = o.s ?? 1;
    this.th = o.phase ?? 0;
  }
  get x() {
    return this.solid.x + this.solid.w / 2;
  }
  get wobble() {
    return (1 - this.s) * (1 - this.s) * 18;
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    if (this.down > 0) {
      if (--this.down === 0) {
        this.s = 1;
        s.collidable = true;
        s.place(this.x0 - s.w / 2, s.y);
      }
      return;
    }
    this.s = Math.max(0, this.s - (this.o.decay ?? Top.DECAY) * DT);
    if (w.state === 'play' && p.landTick === w.tick - 1 && p.isRiding(s)) {
      this.s = Math.min(1, this.s + 0.45);
      w.sfx('land', this.x, s.y);
    }
    this.th += (2 + 5 * (1 - this.s)) * DT;
    const nx = this.x0 + Math.sin(this.th) * this.wobble - s.w / 2;
    s.moveBy(w, nx - s.x, 0);
    if (this.s < Top.FALL) {
      s.collidable = false;
      this.down = Math.round((this.o.relaunch ?? 3) * 120);
      w.sfx('thud', this.x, this.floor);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    const hgt = this.floor - s.y;
    ctx.save();
    if (this.down > 0) {
      // on its side
      ctx.translate(this.x0, this.floor - 6);
      ctx.rotate(1.35);
      ctx.globalAlpha = 0.85;
    } else {
      ctx.translate(this.x, this.floor);
      ctx.rotate(Math.cos(this.th) * (1 - this.s) * 0.35);
    }
    const hw = s.w / 2;
    // the body: a fat cone down to an iron point
    ctx.fillStyle = '#A1662F';
    ctx.beginPath();
    ctx.moveTo(-hw, -hgt + 3);
    ctx.lineTo(hw, -hgt + 3);
    ctx.lineTo(1.5, -3);
    ctx.lineTo(-1.5, -3);
    ctx.fill();
    ctx.fillStyle = '#607D8B';
    ctx.fillRect(-1, -3, 2, 3);
    // painted bands, streaking with the spin
    const bands = ['#D84315', '#FDD835', '#2E7D32'];
    for (let k = 0; k < 3; k++) {
      const y = -hgt + 6 + k * (hgt - 10) * 0.28;
      const ww = hw * (1 - (k + 0.6) * 0.26);
      ctx.fillStyle = bands[k];
      ctx.fillRect(-ww, y, ww * 2, 2.5);
      if (this.down === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        const u = ((w.tick * 0.2 * this.s + k * 0.3) % 1) * 2 - 1;
        ctx.fillRect(u * ww - 1.5, y, 3, 2.5);
      }
    }
    // the crown he stands on
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(-hw, -hgt, s.w, 4);
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(-hw, -hgt, s.w, 1.2);
    ctx.restore();
  }
}

/** Kosa: the tussar silk moth's cocoon. Stand quite still for a moment and Dad is wrapped in one:
 *  nothing the forest throws gets through it. Touch any control and it splits open. */
export class Kosa extends Entity {
  wrapped = false;
  private still = 0;
  /** how long he's been wrapped this time, in ticks */
  held = 0;
  static WAIT = 36;
  constructor(
    readonly x0 = -1e9,
    readonly x1 = 1e9,
  ) {
    super();
    this.layer = 3;
  }
  static on(w: World) {
    return w.entities.some((e) => e instanceof Kosa && e.wrapped);
  }
  update(w: World) {
    const p = w.player;
    if (w.state !== 'play') return;
    const inp = w.input.left || w.input.right || w.input.jump;
    const here = p.cx >= this.x0 && p.cx < this.x1;
    if (here && !inp && p.onGround && Math.abs(p.vx) < 4) this.still++;
    else this.still = 0;
    const was = this.wrapped;
    this.wrapped = this.still >= Kosa.WAIT;
    this.held = this.wrapped ? this.held + 1 : 0;
    if (this.wrapped && !was) w.sfx('land', p.cx, p.cy);
    if (!this.wrapped && was) w.emit('fx', p.cx, p.cy, { kind: 'sparkle' });
    w.flags.kosa = Kosa.on(w) || this.wrapped;
    w.flags.kosaHeld = this.held;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    const a = Math.min(1, this.still / Kosa.WAIT);
    if (a <= 0.05) return;
    // threads winding round him, then the whole golden cocoon
    ctx.strokeStyle = `rgba(232,200,120,${a})`;
    ctx.lineWidth = 1;
    for (let k = 0; k < Math.floor(a * 8); k++) {
      ctx.beginPath();
      ctx.ellipse(p.cx, p.y + 2 + k * 1.8, 6.5, 1.6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (!this.wrapped) return;
    ctx.fillStyle = '#E8C878';
    ctx.beginPath();
    ctx.ellipse(p.cx, p.cy, 8, 10.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#C9A24E';
    for (let k = -3; k <= 3; k++) {
      ctx.beginPath();
      ctx.ellipse(p.cx, p.cy + k * 2.6, 7.6 * Math.sqrt(1 - (k * k) / 16), 1.2, 0, 0, Math.PI);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(p.cx - 4, p.cy - 6 + Math.sin(w.tick * 0.05), 2, 5);
  }
}

/** A cloud of forest hornets coming down the path, every so often, right to left. Too tall to jump:
 *  be in a cocoon when it reaches you. */
export class Swarm extends Entity {
  hazard: Hazard;
  x = 1e9;
  live = false;
  constructor(
    readonly from: number,
    readonly to: number,
    readonly floor: number,
    readonly o: { every: number; phase?: number; speed?: number },
  ) {
    super();
    this.layer = 4;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'bhanwra',
      hits: (x, y, w2, h2) => self.live && !self.shielded && x + w2 > self.x - 12 && x < self.x + 12 && y + h2 > self.floor - 70 && y < self.floor,
    };
  }
  shielded = false;
  /** where it is at time t seconds (null: not out) */
  xAt(t: number): number | null {
    const u = (((t + (this.o.phase ?? 0)) % this.o.every) + this.o.every) % this.o.every;
    const x = this.from - u * (this.o.speed ?? 200);
    return x < this.to ? null : x;
  }
  update(w: World) {
    const x = this.xAt(w.tick * DT);
    this.live = x !== null;
    if (x !== null) this.x = x;
    this.shielded = Kosa.on(w);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.live) return;
    for (let k = 0; k < 26; k++) {
      const a = w.tick * 0.31 + k * 2.4;
      const bx = this.x + Math.sin(a) * 11 + Math.sin(a * 0.37 + k) * 4;
      const by = this.floor - 6 - ((k * 37) % 62) + Math.cos(a * 1.3) * 3;
      ctx.fillStyle = k % 3 ? '#212121' : '#FBC02D';
      ctx.fillRect(bx, by, 3, 2.2);
    }
    ctx.fillStyle = 'rgba(40,30,10,0.24)';
    ctx.fillRect(this.x - 13, this.floor - 70, 26, 70);
  }
}

/** A shikra hawk quartering its patch. It takes no notice of a man. A fat cocoon sitting in the open
 *  under it is another matter. */
export class Baaj extends Entity {
  x: number;
  dir = 1;
  private dive = 0;
  constructor(
    readonly xa: number,
    readonly xb: number,
    readonly y: number,
    readonly floor: number,
    readonly speed = 60,
    start = 0,
  ) {
    super();
    this.layer = 4;
    this.x = xa + (xb - xa) * start;
  }
  xAt(t: number) {
    let x = this.x,
      d = this.dir,
      left = t * this.speed;
    while (left > 0) {
      const to = d > 0 ? this.xb - x : x - this.xa;
      if (left <= to) return x + d * left;
      left -= to;
      x = d > 0 ? this.xb : this.xa;
      d = -d;
    }
    return x;
  }
  update(w: World) {
    const p = w.player;
    if (this.dive > 0) {
      if (++this.dive > 26 && w.state === 'play') w.die('baaj');
      return;
    }
    this.x += this.dir * this.speed * DT;
    if (this.x >= this.xb) this.dir = -1;
    if (this.x <= this.xa) this.dir = 1;
    if (w.state === 'play' && Kosa.on(w) && Math.abs(p.cx - this.x) < 34 && p.y + p.h > this.floor - 40) {
      this.dive = 1;
      w.sfx('thud', this.x, this.y);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = w.player;
    const u = this.dive > 0 ? Math.min(1, this.dive / 26) : 0;
    const x = this.x + (p.cx - this.x) * u,
      y = this.y + (p.cy - 6 - this.y) * u;
    const f = this.dive > 0 ? -3 : Math.sin(w.tick * 0.18) * 4;
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(x - 10, y - f);
    ctx.lineTo(x, y + 2);
    ctx.lineTo(x + 10, y - f);
    ctx.lineTo(x, y - 2);
    ctx.fill();
    ctx.fillStyle = '#EFEBE9';
    ctx.fillRect(x - 2, y - 1, 4, 3);
    ctx.fillStyle = '#FBC02D';
    ctx.fillRect(x + this.dir * 3, y, 2, 1.5);
    // the patch it watches
    ctx.fillStyle = 'rgba(93,64,55,0.10)';
    ctx.fillRect(this.xa, this.y + 6, this.xb - this.xa, 2);
  }
}

/** Chapda: the red weaver ants. Wait at the edge of a gap and they come out from the far side to you,
 *  linked leg to leg in to a bridge. It bears your weight. They also bite: a second on it is as long
 *  as anyone lasts. Walk away and they go home. */
export class Chapda extends Entity {
  len = 0;
  private bite = 0;
  private wait = 0;
  solid: Solid;
  /** when set, they only come out if this returns true (he has the bait) */
  lure: ((w: World) => boolean) | null = null;
  static GROW = 46;
  constructor(
    readonly g0: number,
    readonly g1: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(g1, floor, 1, 4);
    this.solid.oneWay = true;
    this.solid.collidable = false;
  }
  get full() {
    return this.len >= this.g1 - this.g0 - 0.5;
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    if (w.state !== 'play') return;
    const riding = s.collidable && p.isRiding(s);
    const near = p.onGround && !riding && p.cx > this.g0 - 70 && p.cx < this.g0 + 2 && Math.abs(p.y + p.h - this.floor) < 4;
    const want = (near || riding) && (!this.lure || this.lure(w));
    this.len = Math.max(0, Math.min(this.g1 - this.g0, this.len + (want ? Chapda.GROW : -30) * DT));
    const L = Math.round(this.len);
    if (L >= 2) {
      s.collidable = true;
      s.place(this.g1 - L, this.floor);
      s.w = L;
    } else s.collidable = false;
    // hopping along it doesn't shake them off
    const over = s.collidable && p.cx > s.x && p.cx < s.x + s.w && p.y + p.h <= this.floor && p.y + p.h > this.floor - 70;
    this.bite = riding ? this.bite + DT : over ? this.bite : Math.max(0, this.bite - 2 * DT);
    this.wait = near && this.full ? this.wait + DT : 0;
    w.flags.chapda = { len: this.len, full: this.full, bite: this.bite };
    if (this.bite > 1.05 || this.wait > 2.6) w.die('chapda');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the nest: stitched leaves in a branch on the far side
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(this.g1 + 10, this.floor - 44, 3, 44);
    ctx.fillStyle = '#558B2F';
    ctx.beginPath();
    ctx.ellipse(this.g1 + 12, this.floor - 46, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7CB342';
    ctx.beginPath();
    ctx.ellipse(this.g1 + 9, this.floor - 49, 5, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    if (this.len < 2) return;
    const x0 = this.g1 - this.len;
    for (let x = this.g1 - 2, k = 0; x > x0; x -= 4, k++) {
      const j = Math.sin(w.tick * 0.4 + k) * 0.6;
      ctx.fillStyle = this.bite > 0.6 ? '#FF3D00' : '#C62828';
      ctx.fillRect(x - 1.5, this.floor + j, 3, 2.2);
      ctx.fillStyle = '#7F0000';
      ctx.fillRect(x - 2.2, this.floor + 2 + j, 1, 1.5);
      ctx.fillRect(x + 1.2, this.floor + 2 + j, 1, 1.5);
    }
  }
}

/** A stretch of babool thorn across the path. A cocoon can be dragged over it; a man can't walk it. */
export class Kaante extends Entity {
  hazard: Hazard;
  safe = false;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y: number,
  ) {
    super();
    this.layer = 2;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'thorns',
      hits: (x, y2, w2, h2) => !self.safe && x + w2 > self.x0 + 3 && x < self.x1 - 3 && y2 + h2 > self.y - 5 && y2 < self.y,
    };
  }
  update(w: World) {
    this.safe = Kosa.on(w);
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 1.2;
    for (let x = this.x0 + 2, k = 0; x < this.x1 - 2; x += 5, k++) {
      ctx.beginPath();
      ctx.moveTo(x, this.y);
      ctx.lineTo(x + ((k * 7) % 5) - 2, this.y - 5 - (k % 3));
      ctx.moveTo(x + 2, this.y - 2);
      ctx.lineTo(x + 5, this.y - 6);
      ctx.stroke();
    }
    ctx.fillStyle = '#EFEBE9';
    for (let x = this.x0 + 4, k = 0; x < this.x1 - 2; x += 5, k++) ctx.fillRect(x + ((k * 3) % 4) - 2, this.y - 6 - (k % 3), 1, 1.5);
  }
}
