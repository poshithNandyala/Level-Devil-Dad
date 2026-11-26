// Ranchi's (and Jharkhand's) moving parts: dhuska puffing up in the kadhai, arrows that become steps in the
// straw boss, a monsoon storm whose lightning finds the tallest thing and whose thunder pushes the rugra up,
// Seraikela's Chhau dancers who become whoever their mask says, Dokra's lost wax and brass, and Hundru's
// falls, where a long drop on to the rocks kills and the falling water is the soft way down.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, PHYS, ROWS, TILE } from '../../constants';

const FLOOR = 15 * TILE;
const TAU = Math.PI * 2;
type Ctx = CanvasRenderingContext2D;

/** a person, side on: legs, kurta, head; `pose` lifts the arms (0..1) */
function figure(ctx: Ctx, x: number, feet: number, h: number, cloth: string, o: { skin?: string; hair?: string; face?: number; legs?: string; arms?: number; lean?: number; sari?: string } = {}) {
  const skin = o.skin ?? '#8D5A3B';
  const bw = Math.max(5, Math.round(h * 0.42));
  const lean = o.lean ?? 0;
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, feet, bw * 0.7, 1.5, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = o.legs ?? '#3E2F28';
  ctx.fillRect(x - bw / 2 + 1, feet - h * 0.38, bw / 2 - 1.2, h * 0.38);
  ctx.fillRect(x + 0.4, feet - h * 0.38, bw / 2 - 1.2, h * 0.38);
  ctx.fillStyle = cloth;
  ctx.fillRect(x - bw / 2 + lean, feet - h * 0.74, bw, h * 0.4);
  if (o.sari) {
    ctx.fillStyle = o.sari;
    ctx.fillRect(x - bw / 2 - 1 + lean, feet - h * 0.45, bw + 2, h * 0.45);
  }
  if (o.arms !== undefined) {
    ctx.strokeStyle = skin;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x - bw / 2 + lean, feet - h * 0.68);
    ctx.lineTo(x - bw / 2 - 3 + lean, feet - h * (0.5 + 0.45 * o.arms));
    ctx.moveTo(x + bw / 2 + lean, feet - h * 0.68);
    ctx.lineTo(x + bw / 2 + 3 + lean, feet - h * (0.5 + 0.45 * o.arms));
    ctx.stroke();
  }
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x + lean, feet - h * 0.84, h * 0.13, 0, TAU);
  ctx.fill();
  ctx.fillStyle = o.hair ?? '#1D1A1A';
  ctx.beginPath();
  ctx.arc(x + lean, feet - h * 0.87, h * 0.13, Math.PI, TAU);
  ctx.fill();
  ctx.fillStyle = '#1D1A26';
  const f = o.face ?? 1;
  ctx.fillRect(x + lean + f * h * 0.05, feet - h * 0.85, 1.1, 1.1);
}

// ================================================================== Dhuska: the kadhai
export type DhuskaState = 'gone' | 'sink' | 'rise' | 'pale' | 'flip' | 'gold' | 'scoop';

/** A kadhai of hot oil set in the road from x0 to x1. The oil is everywhere a dhuska isn't. */
export class Kadhai extends Entity {
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly oil = FLOOR + 5,
  ) {
    super();
    this.layer = 4;
    const self = this;
    this.hazard = { active: true, cause: 'tel', hits: (x, y, w, h) => x + w > self.x0 + 2 && x < self.x1 - 2 && y + h > self.oil + 2 };
    const back = new KadhaiBack(this);
    this.back = back;
  }
  back: KadhaiBack;
  draw(ctx: Ctx, w: World) {
    const { x0, x1, oil } = this;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0 - 2, oil);
    ctx.lineTo(x1 + 2, oil);
    ctx.quadraticCurveTo(x1 - 4, FLOOR + 40, (x0 + x1) / 2, FLOOR + 44);
    ctx.quadraticCurveTo(x0 + 4, FLOOR + 40, x0 - 2, oil);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, oil, 0, FLOOR + 44);
    g.addColorStop(0, 'rgba(242,178,51,0.96)');
    g.addColorStop(1, 'rgba(160,82,24,0.98)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.clip();
    // shimmer and bubbles
    const t = w.tick * DT;
    ctx.fillStyle = 'rgba(255,240,180,0.55)';
    for (let x = x0 + 4, k = 0; x < x1 - 6; x += 13, k++) ctx.fillRect(x + Math.sin(t * 2 + k) * 2, oil + 1, 6, 1);
    ctx.fillStyle = 'rgba(255,230,160,0.7)';
    for (let k = 0; k < Math.floor((x1 - x0) / 14); k++) {
      const ph = (t * 0.9 + k * 0.37) % 1;
      const bx = x0 + 6 + ((k * 53) % Math.max(1, x1 - x0 - 12));
      ctx.beginPath();
      ctx.arc(bx, oil + 10 - ph * 9, 1.2 + ph, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    // the iron rim
    ctx.strokeStyle = '#2B2422';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0 - 4, FLOOR - 1);
    ctx.lineTo(x0 - 1, oil + 2);
    ctx.moveTo(x1 + 4, FLOOR - 1);
    ctx.lineTo(x1 + 1, oil + 2);
    ctx.stroke();
  }
}

/** the kadhai's iron body and the fire under it (behind the road) */
export class KadhaiBack extends Entity {
  constructor(readonly k: Kadhai) {
    super();
    this.layer = -4;
  }
  draw(ctx: Ctx, w: World) {
    const { x0, x1 } = this.k;
    const t = w.tick * DT;
    // the mud chulha the kadhai sits in, fire glowing inside
    ctx.fillStyle = '#5A3422';
    ctx.fillRect(x0, FLOOR - 2, x1 - x0, 70);
    const glow = ctx.createLinearGradient(0, FLOOR + 20, 0, FLOOR + 64);
    glow.addColorStop(0, 'rgba(90,52,34,0)');
    glow.addColorStop(1, 'rgba(255,120,30,0.55)');
    ctx.fillStyle = glow;
    ctx.fillRect(x0, FLOOR + 20, x1 - x0, 46);
    // flames
    for (let x = x0 + 6, k = 0; x < x1 - 4; x += 9, k++) {
      const h = 9 + Math.sin(t * 9 + k * 1.7) * 4 + ((k * 7) % 4);
      ctx.fillStyle = k % 2 ? '#FF8F00' : '#FFD54F';
      ctx.beginPath();
      ctx.moveTo(x - 4, FLOOR + 60);
      ctx.quadraticCurveTo(x, FLOOR + 60 - h * 2, x + 4, FLOOR + 60);
      ctx.fill();
    }
    // the black iron bowl
    ctx.fillStyle = '#2B2422';
    ctx.beginPath();
    ctx.moveTo(x0 - 4, FLOOR);
    ctx.quadraticCurveTo(x0 + 2, FLOOR + 46, (x0 + x1) / 2, FLOOR + 48);
    ctx.quadraticCurveTo(x1 - 2, FLOOR + 46, x1 + 4, FLOOR);
    ctx.closePath();
    ctx.fill();
  }
}

/** One dhuska. Dropped as batter it sinks out of sight, then puffs up and floats: a step flush with the
 *  road. The cook flips it once (whatever is standing on it is thrown off) and later scoops it out. */
export class Dhuska extends Entity {
  state: DhuskaState = 'gone';
  t = 0;
  solid: Solid;
  /** a flip throws you this way, this hard (set by the cook: away from him) */
  toss = { vx: -120, vy: 300, stun: 34 };
  flips = 0;
  static W = 24;
  static SINK = 0.5;
  static RISE = 0.22;
  static FLIP = 0.4;
  static SCOOP = 0.4;
  constructor(
    readonly x: number,
    readonly top = FLOOR,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x - Dhuska.W / 2, top + 12, Dhuska.W, 6);
    this.solid.oneWay = true;
    this.solid.collidable = false;
    this.solid.velX = 0;
  }
  get up() {
    return this.state === 'pale' || this.state === 'gold';
  }
  drop(w: World) {
    if (this.state !== 'gone') return;
    this.state = 'sink';
    this.t = 0;
    this.solid.collidable = false;
    this.solid.place(this.x - Dhuska.W / 2, this.top + 12);
    w.sfx('pour', this.x, this.top);
    w.emit('fx', this.x, this.top + 4, { kind: 'splash' });
  }
  flip(w: World) {
    if (this.state !== 'pale') return;
    const p = w.player;
    if (this.solid.collidable && p.isRiding(this.solid)) {
      p.vy = -this.toss.vy;
      p.vx = this.toss.vx;
      p.onGround = false;
      p.coyoteT = 0;
      p.launched = true;
      p.stun = this.toss.stun;
      w.flags.flipped = (w.flags.flipped ?? 0) + 1;
    }
    this.state = 'flip';
    this.t = 0;
    this.flips++;
    this.solid.collidable = false;
    w.sfx('pop', this.x, this.top);
  }
  scoop(w: World) {
    if (!this.up) return;
    this.state = 'scoop';
    this.t = 0;
    this.solid.collidable = false;
  }
  update(w: World) {
    this.t += DT;
    const s = this.solid;
    if (this.state === 'sink' && this.t >= Dhuska.SINK) {
      this.state = 'rise';
      this.t = 0;
      s.collidable = true;
      w.sfx('pop', this.x, this.top);
    }
    if (this.state === 'rise') {
      const k = Math.min(1, this.t / Dhuska.RISE);
      const y = Math.round(this.top + 12 * (1 - k));
      if (y !== s.y) s.moveBy(w, 0, y - s.y);
      if (k >= 1) {
        this.state = 'pale';
        this.t = 0;
      }
    } else if (this.state === 'flip' && this.t >= Dhuska.FLIP) {
      this.state = 'gold';
      this.t = 0;
      s.place(this.x - Dhuska.W / 2, this.top);
      s.collidable = true;
    } else if (this.state === 'scoop' && this.t >= Dhuska.SCOOP) {
      this.state = 'gone';
      this.t = 0;
    }
  }
  draw(ctx: Ctx, w: World) {
    const st = this.state;
    if (st === 'gone') return;
    const x = this.x,
      top = this.top;
    if (st === 'sink') {
      // bubbles where the batter went down
      ctx.fillStyle = 'rgba(255,240,190,0.85)';
      for (let k = 0; k < 4; k++) {
        const ph = (this.t * 2.2 + k * 0.27) % 1;
        ctx.beginPath();
        ctx.arc(x - 7 + k * 5, top + 6 - ph * 4, 1 + ph * 1.2, 0, TAU);
        ctx.fill();
      }
      return;
    }
    let y = this.solid.y;
    let sy = 1;
    let gold = st === 'gold' || st === 'scoop';
    if (st === 'flip') {
      const k = this.t / Dhuska.FLIP;
      y = top - Math.sin(k * Math.PI) * 14;
      sy = Math.cos(k * Math.PI);
      gold = k > 0.5;
    } else if (st === 'scoop') {
      const k = this.t / Dhuska.SCOOP;
      y = top - k * 30;
    }
    const ripe = st === 'pale' ? Math.min(1, this.t / 1.6) : 1;
    ctx.save();
    ctx.translate(x, y + 3);
    ctx.scale(1, Math.max(0.12, Math.abs(sy)));
    ctx.fillStyle = gold ? '#C7782A' : ripe > 0.7 ? '#E9C47A' : '#F1DDA4';
    ctx.beginPath();
    ctx.ellipse(0, 0, Dhuska.W / 2, 4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = gold ? '#E7A447' : '#F8EBC4';
    ctx.beginPath();
    ctx.ellipse(-1, -1.2, Dhuska.W / 2 - 3, 2.4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = gold ? 'rgba(110,58,20,0.65)' : 'rgba(170,140,80,0.35)';
    for (let k = 0; k < 6; k++) ctx.fillRect(-9 + ((k * 7) % 17), -1.5 + (k % 2), 1.4, 1);
    ctx.restore();
  }
}

/** a step of the cook's routine: at tick `at` of his loop, do `a` to dhuska `i` */
export interface CookStep {
  at: number;
  a: 'drop' | 'flip' | 'scoop';
  i: number;
}

/** The dhuska man. He works his kadhai to a routine: batter in, flip each one, scoop each one out.
 *  His long jhanjhra (slotted spoon) goes out to the dhuska half a second before he acts on it. */
export class Cook extends Entity {
  readonly period: number;
  /** the kadhai's near and far edges (px): the bots and the guide use them */
  bank0 = 0;
  bank1 = 0;
  /** half a second's warning */
  static WARN = 60;
  constructor(
    readonly x: number,
    readonly face: 1 | -1,
    readonly dhuskas: Dhuska[],
    readonly plan: CookStep[],
    periodS: number,
    readonly phase = 0,
    toss: { vx: number; vy: number; stun?: number } = { vx: 120, vy: 300 },
  ) {
    super();
    this.layer = -1;
    this.period = Math.round(periodS * 120);
    for (const d of dhuskas) d.toss = { vx: face * toss.vx, vy: toss.vy, stun: toss.stun ?? 34 };
  }
  /** the tick he started work (his first update) */
  private t0: number | null = null;
  /** this tick's place in the routine */
  at(w: World) {
    const t = w.tick - (this.t0 ?? w.tick) + this.phase;
    return ((t % this.period) + this.period) % this.period;
  }
  /** the next step and how many ticks away it is */
  next(w: World): { s: CookStep; in: number } | null {
    const t = this.at(w);
    let best: { s: CookStep; in: number } | null = null;
    for (const s of this.plan) {
      const d = (((s.at - t) % this.period) + this.period) % this.period;
      if (!best || d < best.in) best = { s, in: d };
    }
    return best;
  }
  update(w: World) {
    this.t0 ??= w.tick;
    if (w.state !== 'play') return;
    const t = this.at(w);
    for (const s of this.plan) {
      if (s.at !== t) continue;
      const d = this.dhuskas[s.i];
      if (s.a === 'drop') d.drop(w);
      else if (s.a === 'flip') d.flip(w);
      else d.scoop(w);
    }
  }
  draw(ctx: Ctx, w: World) {
    const x = this.x;
    const n = this.next(w);
    // the tool reaching out: the ladle for batter, the jhanjhra for flips and scoops
    let tx = x + this.face * 10,
      ty = FLOOR - 18,
      tool: 'ladle' | 'jhanjhra' = 'jhanjhra';
    if (n && n.in <= Cook.WARN) {
      const d = this.dhuskas[n.s.i];
      const k = 1 - n.in / Cook.WARN;
      tool = n.s.a === 'drop' ? 'ladle' : 'jhanjhra';
      const ex = d.x,
        ey = n.s.a === 'drop' ? FLOOR - 16 : FLOOR + 2;
      tx = x + this.face * 10 + (ex - (x + this.face * 10)) * Math.min(1, k * 1.3);
      ty = FLOOR - 18 + (ey - (FLOOR - 18)) * Math.min(1, k * 1.3);
    }
    figure(ctx, x, FLOOR, 26, '#ECEFF1', { arms: 0.45, face: this.face, legs: '#5D4037' });
    // gamchha on the shoulder
    ctx.fillStyle = '#E53935';
    ctx.fillRect(x - 4, FLOOR - 19, 3, 6);
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + this.face * 4, FLOOR - 16);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    if (tool === 'ladle') {
      ctx.fillStyle = '#B0BEC5';
      ctx.beginPath();
      ctx.arc(tx, ty + 2, 3.2, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#F1DDA4';
      ctx.fillRect(tx - 2.4, ty + 1.4, 4.8, 1.4);
    } else {
      ctx.fillStyle = '#90A4AE';
      ctx.beginPath();
      ctx.ellipse(tx, ty, 5, 2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#455A64';
      for (let k = -2; k <= 2; k += 2) ctx.fillRect(tx + k - 0.5, ty - 0.5, 1, 1);
    }
  }
}

/** The dhuska stall behind the kadhai: tin roof, a basket of dhuska, the ghugni pot, the sign. */
export class DhuskaStall extends Entity {
  constructor(
    readonly x: number,
    readonly w = 64,
    readonly label = 'DHUSKA · GHUGNI',
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: Ctx, w: World) {
    const x = this.x,
      wd = this.w;
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x, FLOOR - 52, 2, 52);
    ctx.fillRect(x + wd - 2, FLOOR - 52, 2, 52);
    // corrugated tin
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath();
    ctx.moveTo(x - 6, FLOOR - 50);
    ctx.lineTo(x + wd + 6, FLOOR - 56);
    ctx.lineTo(x + wd + 6, FLOOR - 51);
    ctx.lineTo(x - 6, FLOOR - 45);
    ctx.fill();
    ctx.fillStyle = 'rgba(55,71,79,0.45)';
    for (let k = x - 4; k < x + wd + 4; k += 4) ctx.fillRect(k, FLOOR - 55 + ((k - x) / (wd + 12)) * -6 + 5, 1, 5);
    // sign
    ctx.fillStyle = '#FDD835';
    ctx.fillRect(x + 4, FLOOR - 44, wd - 8, 9);
    ctx.fillStyle = '#B71C1C';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, x + wd / 2, FLOOR - 37.5);
    // counter, basket, pot
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(x + 2, FLOOR - 16, wd - 4, 16);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x + 2, FLOOR - 17, wd - 4, 2);
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.ellipse(x + wd * 0.3, FLOOR - 19, 9, 4, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#D08A35';
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.ellipse(x + wd * 0.3 - 6 + k * 3, FLOOR - 21 - (k % 2), 3.5, 1.6, 0, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x + wd * 0.65, FLOOR - 26, 12, 9);
    ctx.fillStyle = '#C49A47';
    ctx.fillRect(x + wd * 0.65 + 1, FLOOR - 26, 10, 2);
    // steam
    const t = w.tick * DT;
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let k = 0; k < 3; k++) {
      const ph = (t * 0.6 + k / 3) % 1;
      ctx.beginPath();
      ctx.arc(x + wd * 0.65 + 6 + Math.sin(ph * 6 + k) * 2, FLOOR - 28 - ph * 14, 2 + ph * 2, 0, TAU);
      ctx.fill();
    }
  }
}

/** a kadhai with its dhuska at the given x positions (px), plus the iron body behind it */
export function addKadhai(w: World, x0: number, x1: number, xs: number[]) {
  const k = w.add(new Kadhai(x0, x1));
  w.add(k.back);
  const ds = xs.map((x) => w.add(new Dhuska(x)));
  return { k, ds };
}

// ================================================================== Teer: the archery range
/** One arrow. In flight it kills; once it's in the boss it is a little step to stand on, until the coach
 *  walks up after the whistle and pulls it out. */
export class Arrow extends Entity {
  state: 'quiver' | 'fly' | 'stuck' = 'quiver';
  x = -100;
  y = -100;
  vx = 0;
  stopX = 0;
  wob = 0;
  solid: Solid;
  hazard: Hazard;
  /** called when it strikes (a target sheet counts its holes) */
  onHit: ((w: World) => void) | null = null;
  static SPEED = 380;
  static LEN = 16;
  constructor() {
    super();
    this.layer = 3;
    this.solid = new Solid(-100, -100, Arrow.LEN, 3);
    this.solid.oneWay = true;
    this.solid.collidable = false;
    this.solid.velX = 0;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'teer',
      hits: (x, y, w, h) => {
        if (self.state !== 'fly') return false;
        const a = self.vx > 0 ? self.x - Arrow.LEN : self.x - 1,
          b = self.vx > 0 ? self.x + 1 : self.x + Arrow.LEN;
        return x < b && x + w > a && y < self.y + 1.5 && y + h > self.y - 1.5;
      },
    };
  }
  fire(w: World, x: number, y: number, stopX: number) {
    this.state = 'fly';
    this.x = x;
    this.y = y;
    this.vx = Math.sign(stopX - x) * Arrow.SPEED;
    this.stopX = stopX;
    this.solid.collidable = false;
  }
  pull() {
    this.state = 'quiver';
    this.solid.collidable = false;
    this.solid.place(-100, -100);
  }
  update(w: World) {
    if (this.wob > 0) this.wob = Math.max(0, this.wob - DT * 3);
    if (this.state !== 'fly') return;
    this.x += this.vx * DT;
    if ((this.vx > 0 && this.x >= this.stopX) || (this.vx < 0 && this.x <= this.stopX)) {
      this.x = this.stopX;
      this.state = 'stuck';
      this.wob = 1;
      this.solid.place(this.vx > 0 ? this.stopX - Arrow.LEN : this.stopX, this.y - 2);
      this.solid.collidable = true;
      w.sfx('thud', this.x, this.y);
      this.onHit?.(w);
    }
  }
  draw(ctx: Ctx, w: World) {
    if (this.state === 'quiver') return;
    const dir = Math.sign(this.vx) || 1;
    const a = Math.sin(w.tick * 0.9) * this.wob * 0.14;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(a);
    ctx.fillStyle = '#C49A6C';
    ctx.fillRect(dir > 0 ? -Arrow.LEN : 0, -0.7, Arrow.LEN, 1.4);
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.moveTo(dir * 3, 0);
    ctx.lineTo(0, -1.8);
    ctx.lineTo(0, 1.8);
    ctx.fill();
    const tx = -dir * Arrow.LEN;
    ctx.fillStyle = '#E53935';
    ctx.beginPath();
    ctx.moveTo(tx, -0.6);
    ctx.lineTo(tx - dir * 4, -2.6);
    ctx.lineTo(tx + dir * 2, -0.6);
    ctx.moveTo(tx, 0.6);
    ctx.lineTo(tx - dir * 4, 2.6);
    ctx.lineTo(tx + dir * 2, 0.6);
    ctx.fill();
    ctx.restore();
  }
}

/** A straw boss: bales stacked into a wall, a target face pinned on at each archer's height. */
export class Boss extends Entity {
  solid: Solid;
  constructor(
    readonly x: number,
    readonly top: number,
    readonly wd: number,
    readonly faces: number[],
    readonly bottom = FLOOR,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, top, wd, bottom - top);
  }
  draw(ctx: Ctx) {
    const { x, top, wd, bottom } = this;
    ctx.fillStyle = '#D9B65A';
    ctx.fillRect(x, top, wd, bottom - top);
    ctx.fillStyle = 'rgba(140,100,30,0.35)';
    for (let y = top + 5; y < bottom; y += 7) for (let k = 0; k < wd; k += 9) ctx.fillRect(x + k + ((y * 3) % 7), y, 6, 1);
    ctx.fillStyle = 'rgba(110,70,20,0.55)';
    for (let y = top + 15; y < bottom; y += 16) ctx.fillRect(x, y, wd, 1.4);
    ctx.fillStyle = '#F2D98A';
    ctx.fillRect(x, top, wd, 2);
    // the target faces, on the archers' side
    for (const fy of this.faces) {
      const cx = x + 9;
      const rings = ['#FAFAFA', '#212121', '#1E88E5', '#E53935', '#FDD835'];
      rings.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(cx, fy, 7.5 - i * 1.4, 9 - i * 1.7, 0, 0, TAU);
        ctx.fill();
      });
    }
  }
}

/** An archer at the line: where he stands, the height he shoots at, and when in each end he looses. */
export interface Bowman {
  x: number;
  /** his feet (he may be up on the bamboo stand) */
  feet: number;
  lane: number;
  shots: number[];
}

/** The range: archers loose their arrows through an end, the coach whistles, walks up to the boss and
 *  pulls every arrow out, walks back, and the next end begins. */
export class Range extends Entity {
  readonly period: number;
  private t0: number | null = null;
  quivers: Arrow[][];
  /** seconds the coach takes to walk up to the boss (and back) */
  walk = 1.8;
  /** where the coach waits (by the line) */
  coachX: number;
  constructor(
    w: World,
    readonly men: Bowman[],
    readonly face: number,
    readonly end: number,
    readonly phase = 0,
    readonly onPull: ((w: World) => void) | null = null,
    walk = 1.8,
  ) {
    super();
    this.layer = -1;
    this.walk = walk;
    this.period = Math.round((end + 2 * walk) * 120);
    this.quivers = men.map((m) => m.shots.map(() => w.add(new Arrow())));
    this.coachX = Math.min(...men.map((m) => m.x)) - 14;
  }
  /** ticks into the cycle */
  at(w: World) {
    const t = w.tick - (this.t0 ?? w.tick) + Math.round(this.phase * 120);
    return ((t % this.period) + this.period) % this.period;
  }
  get whistleAt() {
    return Math.round(this.end * 120);
  }
  get pullAt() {
    return Math.round((this.end + this.walk) * 120);
  }
  /** shooting right now (not collecting) */
  shooting(w: World) {
    return this.at(w) < this.whistleAt;
  }
  update(w: World) {
    this.t0 ??= w.tick;
    if (w.state !== 'play') return;
    const t = this.at(w);
    this.men.forEach((m, i) =>
      m.shots.forEach((s, j) => {
        if (Math.round(s * 120) === t) this.quivers[i][j].fire(w, m.x + 10, m.lane, this.face);
      }),
    );
    if (t === this.whistleAt) {
      w.sfx('whistle', this.coachX, FLOOR - 20);
      if (Math.abs(this.coachX - w.player.cx) < 280) w.say('Teer uthao! | Collect the arrows!', this.coachX, FLOOR - 30, 1.2, 'npc');
    }
    if (t === this.pullAt) {
      for (const q of this.quivers) for (const a of q) a.pull();
      w.sfx('snap', this.face, FLOOR - 40);
      this.onPull?.(w);
    }
  }
  /** where the coach is (he walks to the boss and back) */
  coach(w: World) {
    const t = this.at(w) / 120;
    const far = this.face - 12;
    if (t < this.end) return this.coachX;
    const k = (t - this.end) / this.walk;
    return k < 1 ? this.coachX + (far - this.coachX) * k : far + (this.coachX - far) * (k - 1);
  }
  draw(ctx: Ctx, w: World) {
    const t = this.at(w);
    for (const [i, m] of this.men.entries()) {
      // the bamboo stand he shoots from
      if (m.feet < FLOOR - 2) {
        ctx.fillStyle = '#A1887F';
        ctx.fillRect(m.x - 10, m.feet, 22, 3);
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(m.x - 9, m.feet + 3, 2, FLOOR - m.feet - 3);
        ctx.fillRect(m.x + 9, m.feet + 3, 2, FLOOR - m.feet - 3);
        ctx.fillStyle = 'rgba(141,110,99,0.6)';
        for (let y = m.feet + 12; y < FLOOR; y += 14) ctx.fillRect(m.x - 9, y, 20, 1.5);
      }
      // drawing the bow in the half second before each shot
      let draw = 0;
      for (const s of m.shots) {
        const d = Math.round(s * 120) - t;
        if (d >= 0 && d < 60) draw = Math.max(draw, 1 - d / 60);
      }
      figure(ctx, m.x, m.feet, 24, ['#1565C0', '#C62828', '#2E7D32'][i % 3], { face: 1, legs: '#263238' });
      const bx = m.x + 6,
        by = m.lane;
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(bx - 6, by, 9, -1.1, 1.1);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 0.7;
      const sx = bx - 6 + Math.cos(1.1) * 9 - draw * 5;
      ctx.beginPath();
      ctx.moveTo(bx - 6 + Math.cos(-1.1) * 9, by + Math.sin(-1.1) * 9);
      ctx.lineTo(sx, by);
      ctx.lineTo(bx - 6 + Math.cos(1.1) * 9, by + Math.sin(1.1) * 9);
      ctx.stroke();
      if (draw > 0) {
        ctx.fillStyle = '#C49A6C';
        ctx.fillRect(sx, by - 0.6, 14, 1.2);
      }
    }
    // the coach, whistle on a cord
    const cx = this.coach(w);
    figure(ctx, cx, FLOOR, 25, '#FDD835', { face: cx > this.coachX + 2 && t < this.pullAt ? 1 : -1, legs: '#37474F', arms: t >= this.whistleAt && t < this.whistleAt + 30 ? 0.9 : 0.2 });
  }
}

// ================================================================== Rugra: the storm in the sal forest
/** A rugra: Jharkhand's monsoon mushroom, a round white puffball. The thunder pushes them up out of the
 *  sal leaves all round wherever the lightning struck; they stand a while and sink back. Stand on the
 *  bump when it comes up and it lifts you. */
export class Rugra extends Entity {
  state: 'down' | 'grow' | 'up' | 'shrink' = 'down';
  t = 0;
  h = 0;
  solid: Solid;
  static GROW = 0.35;
  static SHRINK = 0.5;
  constructor(
    readonly x: number,
    readonly H: number,
    readonly floor = FLOOR,
    readonly last = 2.6,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x - 11, floor, 22, 1);
    this.solid.oneWay = true;
    this.solid.collidable = false;
    this.solid.velX = 0;
  }
  get up() {
    return this.state !== 'down';
  }
  /** seconds until it's back in the leaves (0 when it's down) */
  left() {
    if (this.state === 'grow') return Rugra.GROW - this.t + this.last + Rugra.SHRINK;
    if (this.state === 'up') return this.last - this.t + Rugra.SHRINK;
    if (this.state === 'shrink') return Rugra.SHRINK - this.t;
    return 0;
  }
  /** seconds it will still stand at full height */
  firm() {
    if (this.state === 'grow') return Rugra.GROW - this.t + this.last;
    if (this.state === 'up') return this.last - this.t;
    return 0;
  }
  pop(w: World) {
    if (this.state !== 'down') return;
    this.state = 'grow';
    this.t = 0;
    this.solid.place(this.x - 11, this.floor);
    this.solid.h = 1;
    this.solid.collidable = true;
    w.sfx('pop', this.x, this.floor);
    w.emit('fx', this.x, this.floor - 2, { kind: 'dust' });
  }
  private setH(w: World, h: number) {
    const s = this.solid;
    const top = Math.round(this.floor - h);
    if (top !== s.y) s.moveBy(w, 0, top - s.y);
    s.h = Math.max(1, this.floor - s.y);
    this.h = h;
  }
  update(w: World) {
    if (this.state === 'down') return;
    this.t += DT;
    if (this.state === 'grow') {
      this.setH(w, Math.min(this.H, (this.t / Rugra.GROW) * this.H));
      if (this.t >= Rugra.GROW) {
        this.state = 'up';
        this.t = 0;
      }
    } else if (this.state === 'up') {
      if (this.t >= this.last) {
        this.state = 'shrink';
        this.t = 0;
      }
    } else {
      this.setH(w, Math.max(0, this.H * (1 - this.t / Rugra.SHRINK)));
      if (this.t >= Rugra.SHRINK) {
        this.state = 'down';
        this.h = 0;
        this.solid.collidable = false;
      }
    }
  }
  draw(ctx: Ctx, w: World) {
    const x = this.x,
      f = this.floor;
    if (this.state === 'down') {
      // a little crack in the leaves where one is waiting
      ctx.fillStyle = '#8D6E3F';
      ctx.beginPath();
      ctx.ellipse(x, f, 9, 3, 0, Math.PI, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(60,40,20,0.7)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 5, f - 1);
      ctx.lineTo(x - 1, f - 2.5);
      ctx.lineTo(x + 2, f - 1.2);
      ctx.lineTo(x + 5, f - 2);
      ctx.stroke();
      ctx.fillStyle = '#EDE6D6';
      ctx.fillRect(x - 1, f - 2.5, 2, 1);
      return;
    }
    const h = this.h;
    const tired = this.state === 'shrink' || (this.state === 'up' && this.t > this.last - 0.6 && Math.floor(w.tick / 8) % 2 === 0);
    // the stalk (a column of white, so it reads as something to stand on)
    ctx.fillStyle = '#E6DFCF';
    ctx.fillRect(x - 6, f - h + 6, 12, Math.max(0, h - 6));
    ctx.fillStyle = 'rgba(120,100,70,0.3)';
    ctx.fillRect(x + 2, f - h + 6, 4, Math.max(0, h - 6));
    // the cap: a round white puffball
    ctx.fillStyle = tired ? '#C9BFA8' : '#F6F1E6';
    ctx.beginPath();
    ctx.ellipse(x, f - h + 5, 12, 7, 0, Math.PI, TAU);
    ctx.ellipse(x, f - h + 5, 12, 3, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = 'rgba(110,90,60,0.45)';
    ctx.fillRect(x - 5, f - h + 1, 3, 1);
    ctx.fillRect(x + 3, f - h + 2, 2, 1);
    ctx.fillRect(x - 1, f - h - 1, 2, 1);
    // leaves pushed up round its foot
    ctx.fillStyle = '#7A5A2E';
    ctx.beginPath();
    ctx.ellipse(x, f, 12, 3, 0, Math.PI, TAU);
    ctx.fill();
  }
}

/** something tall for the lightning: a termite mound, a rock, a pole. `earth` (if set) is where a pole's
 *  wire takes the strike into the ground; the rugra come up there instead. */
export interface Rod {
  x: number;
  top: number;
  earth?: number;
}

/** A termite mound: a spire of red earth, solid, taller than Dad. */
export class Mound extends Entity implements Rod {
  solid: Solid;
  constructor(
    readonly x: number,
    readonly top: number,
    readonly floor = FLOOR,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x - 7, top + 4, 14, floor - top - 4);
  }
  draw(ctx: Ctx) {
    const { x, top, floor } = this;
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.moveTo(x - 10, floor);
    ctx.lineTo(x - 7, top + 12);
    ctx.lineTo(x - 2, top);
    ctx.lineTo(x + 3, top + 6);
    ctx.lineTo(x + 7, top + 14);
    ctx.lineTo(x + 10, floor);
    ctx.fill();
    ctx.fillStyle = 'rgba(70,30,10,0.4)';
    for (let y = top + 10; y < floor - 3; y += 9) ctx.fillRect(x - 5 + ((y * 7) % 5), y, 3, 2);
    ctx.fillStyle = 'rgba(255,200,150,0.22)';
    ctx.fillRect(x - 6, top + 9, 2, floor - top - 11);
  }
}

export interface Aim {
  x: number;
  top: number;
  rod: Rod | null;
  /** Dad is the tallest thing under the cloud */
  dad: boolean;
  /** Dad is standing right beside what it's going to hit */
  near: boolean;
}

/** The monsoon cloud. It goes from station to station; at each it stops, flickers, and the lightning
 *  comes down on the tallest thing beneath it (Dad included: and on anything right beside that). The
 *  thunder pushes the rugra up out of the leaves all round where it struck. */
export class Storm extends Entity {
  cx = 0;
  aim: Aim | null = null;
  bolt: { x: number; top: number; t: number; earth: number | null } | null = null;
  /** the last strike */
  last: Aim | null = null;
  rods: Rod[] = [];
  spots: Rugra[] = [];
  /** called after every strike (endings use it for poles and their wires) */
  onStrike: ((w: World, a: Aim) => void) | null = null;
  readonly period: number;
  private plan: { at: number; len: number; x0: number; x1: number; crack: boolean }[] = [];
  private t0: number | null = null;
  static WARN = 108;
  static SPAN = 56;
  static REACH = 60;
  static SIDE = 14;
  constructor(
    readonly stations: number[],
    dwellS: number,
    speed: number,
    readonly phase = 0,
    readonly y = 40,
  ) {
    super();
    this.layer = 5;
    let at = 0;
    const dwell = Math.round(dwellS * 120);
    stations.forEach((x, i) => {
      const nx = stations[(i + 1) % stations.length];
      this.plan.push({ at, len: dwell, x0: x, x1: x, crack: true });
      at += dwell;
      const len = Math.max(1, Math.round((Math.abs(nx - x) / speed) * 120));
      if (nx !== x) {
        this.plan.push({ at, len, x0: x, x1: nx, crack: false });
        at += len;
      }
    });
    this.period = at;
    this.cx = stations[0];
  }
  private cyc(w: World, tick = w.tick) {
    const P = this.period;
    return (((tick - (this.t0 ?? w.tick) + this.phase) % P) + P) % P;
  }
  posAt(c: number) {
    for (const s of this.plan) if (c < s.at + s.len) return s.x0 + (s.x1 - s.x0) * ((c - s.at) / s.len);
    return this.stations[0];
  }
  /** ticks until the next crack */
  next(w: World) {
    const c = this.cyc(w);
    for (const s of this.plan) if (s.crack && c < s.at + s.len) return s.at + s.len - 1 - c;
    const first = this.plan[0];
    return this.period - c + first.at + first.len - 1;
  }
  /** where the cloud will be stopped for the next crack */
  nextX(w: World) {
    const c = this.cyc(w);
    for (const s of this.plan) if (s.crack && c < s.at + s.len) return s.x0;
    return this.plan[0].x0;
  }
  /** what it would hit if it struck right now */
  target(w: World): Aim {
    const cx = this.cx,
      a = cx - Storm.SPAN,
      b = cx + Storm.SPAN;
    let x = cx,
      top = FLOOR + 40,
      d = 1e9,
      rod: Rod | null = null;
    const take = (tx: number, ttop: number, r: Rod | null) => {
      const dd = Math.abs(tx - cx);
      if (ttop < top - 0.5 || (Math.abs(ttop - top) <= 0.5 && dd < d)) {
        x = tx;
        top = ttop;
        d = dd;
        rod = r;
      }
    };
    for (let sx = Math.ceil(a / 8) * 8; sx <= b; sx += 8) {
      const col = Math.floor(sx / TILE);
      for (let ty = 0; ty < ROWS; ty++)
        if (w.isSolidTile(w.tileAt(col, ty))) {
          take(sx, ty * TILE, null);
          break;
        }
    }
    for (const r of this.rods) if (r.x >= a && r.x <= b) take(r.x, r.top, r);
    for (const s of this.spots) if (s.up && s.x >= a && s.x <= b) take(s.x, s.solid.y, null);
    const p = w.player;
    if (!p.dead && p.x + p.w > a && p.x < b && p.y < top - 1) return { x: p.cx, top: p.y, rod: null, dad: true, near: false };
    const near = !p.dead && p.x + p.w > x - Storm.SIDE && p.x < x + Storm.SIDE && p.y + p.h > top;
    return { x, top, rod, dad: false, near };
  }
  update(w: World) {
    this.t0 ??= w.tick;
    this.cx = this.posAt(this.cyc(w));
    if (this.bolt) {
      this.bolt.t -= DT;
      if (this.bolt.t <= 0) this.bolt = null;
    }
    if (w.state !== 'play') return;
    const n = this.next(w);
    this.aim = n < Storm.WARN && n > 0 ? this.target(w) : null;
    if (n !== 0) return;
    const t = this.target(w);
    const earth = t.rod?.earth ?? null;
    this.bolt = { x: t.x, top: t.top, t: 0.32, earth };
    w.sfx('crack', t.x, t.top);
    w.emit('shake', t.x, t.top, { amount: 3 });
    w.flags.strikes = (w.flags.strikes ?? 0) + 1;
    this.last = t;
    if (t.dad || t.near) return w.die('bijli');
    w.sfx('boom', t.x, t.top);
    const at = earth ?? t.x;
    for (const s of this.spots) if (Math.abs(s.x - at) <= Storm.REACH) s.pop(w);
    this.onStrike?.(w, t);
  }
  draw(ctx: Ctx, w: World) {
    const x = this.cx,
      y = this.y;
    const n = this.next(w);
    const warn = n < Storm.WARN && n > 0;
    const flick = warn && Math.floor(w.tick / 6) % 2 === 0;
    // rain under it
    ctx.strokeStyle = 'rgba(200,220,240,0.35)';
    ctx.lineWidth = 1;
    for (let k = 0; k < 18; k++) {
      const rx = x - Storm.SPAN + ((k * 37 + w.tick * 2) % (Storm.SPAN * 2));
      const ry = y + 16 + ((k * 53 + w.tick * 7) % (FLOOR - y - 16));
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 7);
      ctx.stroke();
    }
    // the cloud
    ctx.fillStyle = flick ? '#A3ABBD' : '#4A5263';
    for (const [dx, dy, r] of [
      [-38, 6, 16],
      [-17, -3, 21],
      [8, -5, 20],
      [32, 4, 17],
      [-2, 10, 22],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(30,34,44,0.5)';
    ctx.fillRect(x - 46, y + 14, 92, 6);
    // where it's going to come down, and the ground right round it
    const a = this.aim;
    if (warn && a) {
      const bad = a.dad || a.near;
      if (!a.dad) {
        ctx.fillStyle = bad ? 'rgba(255,82,82,0.22)' : 'rgba(255,245,180,0.16)';
        ctx.fillRect(a.x - Storm.SIDE, a.top, Storm.SIDE * 2, FLOOR - a.top);
      }
      ctx.strokeStyle = bad ? 'rgba(255,70,70,0.9)' : 'rgba(255,255,200,0.6)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(a.x, y + 20);
      ctx.lineTo(a.x, a.top);
      ctx.stroke();
      ctx.setLineDash([]);
      if (bad && flick) {
        const p = w.player;
        ctx.fillStyle = '#FF5252';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', p.cx, p.y - 5);
      }
    }
    const b = this.bolt;
    if (b) {
      const al = Math.min(1, b.t * 5);
      ctx.strokeStyle = `rgba(255,255,220,${al})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(b.x + 4, y + 18);
      const segs = 6;
      for (let k = 1; k <= segs; k++) ctx.lineTo(b.x + (k < segs ? (k % 2 ? -5 : 5) : 0), y + 18 + ((b.top - y - 18) * k) / segs);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,250,200,${al * 0.5})`;
      ctx.beginPath();
      ctx.arc(b.x, b.top, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(255,255,240,${Math.min(0.3, b.t)})`;
      ctx.fillRect(x - 700, -100, 1400, 600);
    }
  }
}

/** a sal tree in the forest behind (scenery only: nobody shelters under a tree in a storm) */
export class Sal extends Entity {
  constructor(
    readonly x: number,
    readonly top: number,
    readonly floor = FLOOR,
  ) {
    super();
    this.layer = -4;
  }
  draw(ctx: Ctx) {
    const { x, top, floor } = this;
    ctx.fillStyle = '#4E3B30';
    ctx.fillRect(x - 3, top + 16, 6, floor - top - 16);
    ctx.fillStyle = '#2F5A24';
    ctx.beginPath();
    ctx.ellipse(x, top + 18, 16, 20, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#3F7330';
    ctx.beginPath();
    ctx.ellipse(x - 4, top + 11, 10, 11, 0, 0, TAU);
    ctx.fill();
  }
}

/** A lightning arrester (tadit chalak): a tall spike on a mast, its copper wire running down and,
 *  under the ground, off to the earth pit. It's the tallest thing about, so the lightning takes it, and
 *  the strike goes down the wire into the ground at the pit: that's where the rugra come up. */
export class Tadit extends Entity implements Rod {
  pulse = 0;
  constructor(
    readonly x: number,
    readonly top: number,
    readonly earth: number,
    readonly floor = FLOOR,
  ) {
    super();
    this.layer = -3;
  }
  update() {
    if (this.pulse > 0) this.pulse = Math.max(0, this.pulse - DT / 0.45);
  }
  draw(ctx: Ctx, w: World) {
    const { x, top, earth, floor } = this;
    // the buried strip, then the pit
    ctx.strokeStyle = 'rgba(184,115,51,0.55)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(x + 2, floor + 4);
    ctx.lineTo(earth, floor + 4);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(earth - 7, floor - 3, 14, 5);
    ctx.fillStyle = '#616161';
    ctx.fillRect(earth - 5, floor - 2, 10, 2);
    // the mast, the copper down-conductor, the spike
    ctx.fillStyle = '#78909C';
    ctx.fillRect(x - 1.5, top + 8, 3, floor - top - 8);
    ctx.fillStyle = '#B87333';
    ctx.fillRect(x + 1.5, top + 8, 1.2, floor - top - 8);
    ctx.fillStyle = '#B0BEC5';
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x + 2, top + 9);
    ctx.lineTo(x - 2, top + 9);
    ctx.fill();
    ctx.fillRect(x - 5, top + 10, 10, 1.5);
    // its little sign
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(x - 15, floor - 34, 30, 11);
    ctx.fillStyle = '#C62828';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TADIT', x, floor - 29);
    ctx.fillText('CHALAK', x, floor - 24.5);
    // the strike running down and along to the pit
    if (this.pulse > 0) {
      const f = 1 - this.pulse;
      const down = floor - top;
      const along = Math.abs(earth - x);
      const d = f * (down + along) * 1.4;
      ctx.fillStyle = 'rgba(255,250,190,0.95)';
      const py = d < down ? top + d : floor + 4;
      const pxx = d < down ? x + 2 : x + Math.sign(earth - x) * Math.min(along, d - down);
      ctx.beginPath();
      ctx.arc(pxx, py, 3, 0, TAU);
      ctx.fill();
      if (d >= down + along) {
        ctx.fillStyle = `rgba(255,240,170,${this.pulse})`;
        ctx.beginPath();
        ctx.arc(earth, floor - 2, 10, 0, TAU);
        ctx.fill();
      }
    }
    void w;
  }
}

// ================================================================== Chhau: the mask makes the dancer
export type MaskKind = 'baagh' | 'mayur' | 'shikari';
export const MASK_NAME: Record<MaskKind, string> = { baagh: 'BAAGH', mayur: 'MAYUR', shikari: 'SHIKARI' };

/** a Seraikela Chhau mask: a calm face, its character painted on, and a tall crown */
export function drawMask(ctx: Ctx, kind: MaskKind, x: number, y: number, s = 1, face = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s * face, s);
  // the crown behind
  if (kind === 'mayur') {
    for (let k = -2; k <= 2; k++) {
      ctx.strokeStyle = '#1B5E20';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(k * 2.6, -11 - (2 - Math.abs(k)) * 1.5);
      ctx.stroke();
      ctx.fillStyle = '#00897B';
      ctx.beginPath();
      ctx.arc(k * 2.6, -11.5 - (2 - Math.abs(k)) * 1.5, 1.4, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1A237E';
      ctx.fillRect(k * 2.6 - 0.4, -11.9 - (2 - Math.abs(k)) * 1.5, 0.8, 0.8);
    }
  } else if (kind === 'shikari') {
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(-4.5, -6, 9, 2);
    ctx.strokeStyle = '#ECEFF1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(2, -6);
    ctx.quadraticCurveTo(5, -11, 3, -15);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.arc(-3.5, -4.5, 1.6, 0, TAU);
    ctx.arc(3.5, -4.5, 1.6, 0, TAU);
    ctx.fill();
  }
  // the face
  const skin = kind === 'baagh' ? '#FB8C00' : kind === 'mayur' ? '#4DB6AC' : '#A1887F';
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, 4.2, 5.2, 0, 0, TAU);
  ctx.fill();
  if (kind === 'baagh') {
    ctx.fillStyle = '#212121';
    ctx.fillRect(-0.4, -5, 0.8, 2.2);
    ctx.fillRect(-3.8, -2, 1.6, 0.7);
    ctx.fillRect(2.2, -2, 1.6, 0.7);
    ctx.fillStyle = '#FFF3E0';
    ctx.beginPath();
    ctx.ellipse(0, 2.6, 2.4, 1.8, 0, 0, TAU);
    ctx.fill();
  }
  // brows, eyes, lips: painted, serene
  ctx.fillStyle = '#1A1A1A';
  ctx.fillRect(-3, -1.6, 2, 0.5);
  ctx.fillRect(1, -1.6, 2, 0.5);
  ctx.fillRect(-2.7, -0.6, 1.6, 0.8);
  ctx.fillRect(1.1, -0.6, 1.6, 0.8);
  if (kind === 'shikari') ctx.fillRect(-2.2, 1.6, 4.4, 0.8);
  ctx.fillStyle = '#C62828';
  ctx.fillRect(-0.9, 2.8, 1.8, 0.7);
  ctx.restore();
}

/** a stand with a mask hung on it: jump up at the mask and you're wearing it */
export class MaskStand extends Entity {
  private was = false;
  constructor(
    readonly x: number,
    readonly kind: MaskKind,
    readonly floor = FLOOR,
    /** how high the mask hangs (its top, above the floor) */
    readonly hang = 52,
  ) {
    super();
    this.layer = -2;
  }
  get box() {
    return { x: this.x - 7, y: this.floor - this.hang, w: 14, h: 14 };
  }
  update(w: World) {
    const p = w.player;
    const b = this.box;
    const on = !p.dead && p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y;
    if (on && !this.was && w.flags.mask !== this.kind) {
      w.flags.mask = this.kind;
      w.flags.masks = (w.flags.masks ?? 0) + 1;
      w.sfx('click', this.x, b.y);
      w.emit('fx', this.x, b.y + 6, { kind: 'sparkle' });
    }
    this.was = on;
  }
  draw(ctx: Ctx, w: World) {
    const { x, floor } = this;
    const top = floor - this.hang;
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x - 1.5, top - 2, 3, floor - top + 2);
    ctx.fillRect(x - 8, floor - 2, 16, 2);
    ctx.fillRect(x - 6, top - 2, 12, 2);
    if (w.flags.mask !== this.kind) drawMask(ctx, this.kind, x, top + 8, 1.25);
    else {
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([2, 2]);
      ctx.strokeRect(x - 5, top + 1, 10, 13);
      ctx.setLineDash([]);
    }
    ctx.fillStyle = '#FFF8E1';
    ctx.font = 'bold 4.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(MASK_NAME[this.kind], x, top + 22);
  }
}

/** put Dad's mask on his face (once per world) */
export function dadMask(w: World) {
  if (!w.entities.some((e) => e instanceof DadMask)) w.add(new DadMask());
}

/** whatever mask Dad has on, drawn on his face */
export class DadMask extends Entity {
  constructor() {
    super();
    this.layer = 6;
  }
  draw(ctx: Ctx, w: World) {
    const k = w.flags.mask as MaskKind | undefined;
    const p = w.player;
    if (!k || p.dead) return;
    drawMask(ctx, k, p.cx + p.facing * 1, p.y + 4, 0.95, p.facing);
  }
}

/** A Chhau dancer working his part of the stage, in character, and playing along with whatever Dad has
 *  on his face. A tiger prowls (and pounces on a peacock); a hunter sends a tiger running; a peacock
 *  dances with another peacock, wings spread, and leaps with whoever is on them; a tiger sends a peacock
 *  flying. */
export class ChhauDancer extends Entity {
  state: 'prowl' | 'crouch' | 'pounce' | 'rest' | 'flee' | 'gone' | 'dance' | 'court' | 'rise' | 'fly' | 'perched' = 'prowl';
  kind: 'baagh' | 'mayur';
  /** where a frightened peacock flies to (null: off and away) */
  perch: number | null = null;
  /** swapped faces with Dad */
  swapped = false;
  x: number;
  y: number;
  dir = 1;
  t = 0;
  gone = 0;
  hazard: Hazard;
  solid: Solid;
  private from = 0;
  private to = 0;
  static RISE = 38;
  constructor(
    kind: 'baagh' | 'mayur',
    readonly x0: number,
    readonly x1: number,
    readonly floor = FLOOR,
    readonly back = Infinity,
    /** where a peacock goes to dance with you */
    readonly mark = x1,
  ) {
    super();
    this.layer = 2;
    this.kind = kind;
    this.x = (x0 + x1) / 2;
    this.y = floor;
    if (kind === 'mayur') this.state = 'dance';
    const self = this;
    this.hazard = {
      active: kind === 'baagh',
      cause: 'baagh',
      hits: (x, y, ww, h) => {
        if (self.kind !== 'baagh' || self.state === 'gone' || (self.state === 'flee' && self.t > 0.25)) return false;
        if (self.world && self.onHead(self.world)) return false;
        // a tall dancer with his paws up: no hopping over him
        const top = self.y - (self.state === 'pounce' ? 40 : 66);
        const r = self.state === 'pounce' ? 10 : 8;
        return x < self.x + r && x + ww > self.x - r && y < self.y && y + h > top;
      },
    };
    this.solid = new Solid(this.x - 26, floor - 26, 52, 4);
    this.solid.oneWay = true;
    this.solid.collidable = false;
    this.solid.velX = 0;
  }
  world: World | null = null;
  /** Dad coming down on his head, with a mask he could give him */
  onHead(w: World) {
    const p = w.player;
    const mask = w.flags.mask as MaskKind | undefined;
    if (!mask || mask === 'baagh' || p.dead || p.vy < 0) return false;
    const feet = p.y + p.h;
    const top = this.y - 66;
    return p.x < this.x + 9 && p.x + p.w > this.x - 9 && feet >= top - 2 && feet <= top + 12;
  }
  private near(w: World, r: number) {
    const p = w.player;
    return !p.dead && Math.abs(p.cx - this.x) < r && p.y + p.h > this.floor - 70;
  }
  private set(s: ChhauDancer['state']) {
    this.state = s;
    this.t = 0;
  }
  private wings(w: World, on: boolean, lift = 0) {
    const s = this.solid;
    if (on && !s.collidable) {
      s.place(this.x - 26, this.floor - 26 - lift);
      s.collidable = true;
    }
    if (!on) {
      s.collidable = false;
      return;
    }
    const ty = Math.round(this.floor - 26 - lift);
    if (ty !== s.y) s.moveBy(w, 0, ty - s.y);
    const tx = Math.round(this.x - 26);
    if (tx !== s.x) s.moveBy(w, tx - s.x, 0);
  }
  update(w: World) {
    this.t += DT;
    if (w.state !== 'play') return;
    const p = w.player;
    const mask = w.flags.mask as MaskKind | undefined;
    if (this.kind === 'baagh') {
      // landing on his head with a mask on: you swap faces (and characters)
      this.world = w;
      if (this.state !== 'gone' && this.state !== 'flee' && this.onHead(w)) {
        const top = this.y - 66;
        {
          w.flags.mask = 'baagh';
          this.kind = mask === 'mayur' ? 'mayur' : 'baagh';
          this.swapped = true;
          p.vy = -220;
          w.sfx('poof', this.x, top);
          w.emit('fx', this.x, top + 6, { kind: 'confetti' });
          this.dir = p.cx < this.x ? 1 : -1;
          this.set('flee');
          return;
        }
      }
      switch (this.state) {
        case 'prowl':
          this.x += this.dir * 46 * DT;
          if (this.x > this.x1) (this.x = this.x1), (this.dir = -1);
          if (this.x < this.x0) (this.x = this.x0), (this.dir = 1);
          if (mask === 'shikari' && this.near(w, 130)) {
            this.dir = p.cx < this.x ? 1 : -1;
            w.sfx('gasp', this.x, this.floor - 20);
            this.set('flee');
          } else if (mask === 'mayur' && this.near(w, 104)) {
            this.dir = p.cx < this.x ? -1 : 1;
            w.sfx('snort', this.x, this.floor - 20);
            this.set('crouch');
          }
          break;
        case 'crouch':
          if (this.t >= 0.35) {
            this.from = this.x;
            this.to = Math.max(this.x0 - 70, Math.min(this.x1 + 70, p.cx));
            this.set('pounce');
          }
          break;
        case 'pounce': {
          const f = Math.min(1, this.t / 0.5);
          this.x = this.from + (this.to - this.from) * f;
          this.y = this.floor - Math.sin(f * Math.PI) * 30;
          if (f >= 1) {
            this.y = this.floor;
            this.set('rest');
          }
          break;
        }
        case 'rest':
          if (this.t >= 0.8) {
            this.dir = this.x > (this.x0 + this.x1) / 2 ? -1 : 1;
            this.set('prowl');
          }
          break;
        case 'flee':
          this.x += this.dir * 150 * DT;
          this.y = this.floor - Math.max(0, this.t - 0.25) * 260;
          if (this.t > 0.7) {
            this.gone = this.back;
            this.set('gone');
          }
          break;
        case 'gone':
          this.gone -= DT;
          if (this.gone <= 0) {
            this.x = this.dir > 0 ? this.x1 : this.x0;
            this.y = this.floor;
            this.dir = -this.dir;
            this.set('prowl');
          }
          break;
      }
      return;
    }
    // the peacock
    switch (this.state) {
      case 'dance':
        this.x += this.dir * 28 * DT;
        if (this.x > this.x1) (this.x = this.x1), (this.dir = -1);
        if (this.x < this.x0) (this.x = this.x0), (this.dir = 1);
        if (mask === 'baagh' && this.near(w, 100)) {
          w.sfx('gasp', this.x, this.floor - 20);
          this.dir = p.cx < this.x ? 1 : -1;
          this.set('flee');
        } else if (mask === 'mayur' && this.near(w, 80) && p.onGround && p.cx > this.x0 - 30 && p.cx < this.x1 + 30) this.set('court');
        break;
      case 'court': {
        // go to his mark and spread the wings for you
        const want = this.mark;
        if (!this.solid.collidable) {
          const d = want - this.x;
          this.x += Math.sign(d) * Math.min(Math.abs(d), 60 * DT);
          if (Math.abs(d) < 1) {
            this.wings(w, true);
            w.sfx('ui', this.x, this.floor - 26);
          }
        }
        if (mask === 'baagh' && this.solid.collidable && this.perch !== null) {
          // a tiger on its back! off it goes, wings out, rider and all
          if (p.isRiding(this.solid)) {
            w.sfx('gasp', this.x, this.floor - 30);
            this.from = this.x;
            this.to = this.perch;
            this.set('fly');
            break;
          }
          // (still in the air above the wings, coming down on them: hold on a moment)
          const s2 = this.solid;
          if (!p.dead && p.x < s2.x + s2.w && p.x + p.w > s2.x && p.y + p.h <= s2.y + 1) break;
        }
        if (mask !== 'mayur' || !this.near(w, 120)) {
          this.wings(w, false);
          this.set(mask === 'baagh' ? 'flee' : 'dance');
          break;
        }
        if (this.solid.collidable && p.isRiding(this.solid)) {
          if ((this.gone += DT) > 0.25) {
            this.gone = 0;
            w.sfx('whistle', this.x, this.floor - 30);
            this.set('rise');
          }
        } else this.gone = 0;
        break;
      }
      case 'rise': {
        const t = this.t;
        const lift = t < 0.45 ? (t / 0.45) * ChhauDancer.RISE : t < 1.6 ? ChhauDancer.RISE : Math.max(0, ChhauDancer.RISE * (1 - (t - 1.6) / 0.45));
        this.y = this.floor - lift;
        this.wings(w, true, lift);
        if (t >= 2.05) {
          this.y = this.floor;
          this.set('court');
        }
        break;
      }
      case 'fly': {
        const T = 1.5;
        const f = Math.min(1, this.t / T);
        this.x = this.from + (this.to - this.from) * f;
        const lift = Math.sin(f * Math.PI) * 70 + (this.landY - this.floor) * -f;
        this.y = this.floor - lift;
        this.wings(w, true, lift);
        if (f >= 1) {
          this.y = this.landY;
          this.set('perched');
        }
        break;
      }
      case 'perched':
        if (this.t > 1.6 && !(this.solid.collidable && p.isRiding(this.solid))) {
          this.wings(w, false);
          this.gone = Infinity;
          this.set('gone');
        }
        break;
      case 'flee':
        this.x += this.dir * 120 * DT;
        this.y = this.floor - this.t * 200;
        if (this.t > 0.8) {
          this.gone = this.back;
          this.set('gone');
        }
        break;
      case 'gone':
        this.gone -= DT;
        if (this.gone <= 0) {
          this.y = this.floor;
          this.x = (this.x0 + this.x1) / 2;
          this.set('dance');
        }
        break;
    }
  }
  /** the ground where a flying peacock lands (its perch's floor) */
  landY = FLOOR;
  draw(ctx: Ctx, w: World) {
    if (this.state === 'gone') return;
    const { x, y } = this;
    const f = this.dir;
    if (this.kind === 'baagh') {
      const low = this.state === 'crouch';
      const h = low ? 22 : 28;
      const lean = this.state === 'pounce' ? f * 3 : this.state === 'crouch' ? -f * 1.5 : 0;
      // tail
      ctx.strokeStyle = '#E65100';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - f * 4, y - h * 0.5);
      ctx.quadraticCurveTo(x - f * 12, y - h * 0.5 - 6 + Math.sin(w.tick * 0.2) * 2, x - f * 10, y - h * 0.9);
      ctx.stroke();
      figure(ctx, x, y, h, '#EF6C00', { face: f, legs: '#3E2723', arms: this.state === 'crouch' ? 0.3 : 1, lean, skin: '#FB8C00' });
      // paws up high, claws out
      if (this.state !== 'crouch') {
        ctx.fillStyle = '#FB8C00';
        const py = y - h - 8 - Math.abs(Math.sin(w.tick * 0.12)) * 4;
        ctx.fillRect(x - 7 + lean, py, 3, 5);
        ctx.fillRect(x + 4 + lean, py + 1, 3, 5);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x - 7 + lean, py - 1, 3, 1);
        ctx.fillRect(x + 4 + lean, py, 3, 1);
      }
      ctx.fillStyle = '#212121';
      for (let k = 0; k < 3; k++) ctx.fillRect(x - 4 + lean + k * 3, y - h * 0.72, 1, h * 0.36);
      drawMask(ctx, 'baagh', x + lean + f * 0.5, y - h * 0.84, 0.95, f);
      return;
    }
    // the peacock: a fan of feathers behind, arms out like wings
    const spread = this.state === 'court' || this.state === 'rise';
    const fan = spread ? 1 : 0.45;
    for (let k = -4; k <= 4; k++) {
      const a = -Math.PI / 2 + (k / 4) * 1.25 * fan;
      const L = 22 * (0.7 + 0.3 * fan);
      const ex = x + Math.cos(a) * L,
        ey = y - 16 + Math.sin(a) * L;
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(x, y - 14);
      ctx.lineTo(ex, ey);
      ctx.stroke();
      ctx.fillStyle = '#00897B';
      ctx.beginPath();
      ctx.arc(ex, ey, 2.2, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1A237E';
      ctx.beginPath();
      ctx.arc(ex, ey, 1, 0, TAU);
      ctx.fill();
    }
    figure(ctx, x, y, 26, '#1565C0', { face: f, legs: '#0D47A1', sari: '#00897B', skin: '#C68B59' });
    // the wings (arms and a scarf): spread wide when he dances with you
    const wy = this.floor - 26 - (this.floor - y);
    ctx.fillStyle = '#26A69A';
    if (spread) {
      ctx.fillRect(x - 26, wy, 52, 3);
      ctx.fillStyle = '#FFD54F';
      for (let k = -24; k <= 22; k += 6) ctx.fillRect(x + k, wy + 3, 2, 1.5);
    } else {
      ctx.fillRect(x - 12, wy + 6, 24, 2);
    }
    drawMask(ctx, 'mayur', x + f * 0.5, y - 26 * 0.84, 0.95, f);
  }
}

/** the musicians at the side of the akhra: dhol, nagara and shehnai */
export class Musicians extends Entity {
  constructor(
    readonly x: number,
    readonly floor = FLOOR,
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: Ctx, w: World) {
    const { x, floor } = this;
    const beat = Math.floor(w.tick / 30) % 2;
    // nagara: a big bowl drum on the ground
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.ellipse(x, floor - 7, 11, 8, 0, Math.PI, TAU);
    ctx.fill();
    ctx.fillStyle = '#D7CCC8';
    ctx.fillRect(x - 11, floor - 8, 22, 2);
    figure(ctx, x + 14, floor, 20, '#F5F5F5', { face: -1, arms: beat ? 0.9 : 0.4, legs: '#ECEFF1' });
    // dhol player
    figure(ctx, x - 16, floor, 24, '#FFFFFF', { face: 1, arms: beat ? 0.3 : 0.6, legs: '#ECEFF1' });
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x - 21, floor - 15, 10, 7);
    ctx.fillStyle = '#EFEBE9';
    ctx.fillRect(x - 22, floor - 15, 1.5, 7);
    ctx.fillRect(x - 11.5, floor - 15, 1.5, 7);
    // shehnai
    figure(ctx, x - 32, floor, 24, '#FFF59D', { face: 1, legs: '#ECEFF1' });
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - 30, floor - 19);
    ctx.lineTo(x - 24, floor - 14);
    ctx.stroke();
  }
}

/** a river in a pit, drawn (falling in is falling) */
export class River extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top = FLOOR + 10,
  ) {
    super();
    this.layer = -2;
  }
  draw(ctx: Ctx, w: World) {
    const { x0, x1, top } = this;
    ctx.fillStyle = '#3E6E8E';
    ctx.fillRect(x0, top, x1 - x0, 80);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    for (let k = 0; k < (x1 - x0) / 14; k++) ctx.fillRect(x0 + ((k * 14 + w.tick * 0.4) % (x1 - x0)), top + 2 + (k % 3) * 5, 6, 1);
  }
}

// ================================================================== Dokra: the lost wax
export type MouldPhase = 'clay' | 'melt' | 'hollow' | 'pour' | 'cool' | 'brass' | 'reset';

/** A Dokra mould wedged in a passage through the rock: a clay elephant with a wax one inside. On the
 *  fire the wax runs out (hot, for a moment), and for a little while it's a hollow elephant you can walk
 *  right through. Then they pour the brass in. */
export class Mould extends Entity {
  phase: MouldPhase = 'clay';
  t = 0;
  solid: Solid;
  hazard: Hazard;
  /** level code may hold it at a phase (eg. to show it) */
  readonly plan: [MouldPhase, number][];
  readonly period: number;
  private t0: number | null = null;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top: number,
    readonly floor = FLOOR,
    times: { clay?: number; melt?: number; hollow?: number; pour?: number; cool?: number; brass?: number; reset?: number } = {},
    readonly phase0 = 0,
  ) {
    super();
    this.layer = 1;
    this.plan = [
      ['clay', times.clay ?? 2.2],
      ['melt', times.melt ?? 1.0],
      ['hollow', times.hollow ?? 1.5],
      ['pour', times.pour ?? 1.1],
      ['cool', times.cool ?? 1.4],
      ['brass', times.brass ?? 1.6],
      ['reset', times.reset ?? 0.8],
    ];
    this.period = Math.round(this.plan.reduce((a, [, s]) => a + s, 0) * 120);
    this.solid = new Solid(x0, top, x1 - x0, floor - top);
    const self = this;
    this.hazard = {
      active: true,
      cause: 'mom',
      hits: (x, y, w, h) => {
        if (self.phase !== 'melt' && self.phase !== 'pour') return false;
        if (!(x < self.x1 - 2 && x + w > self.x0 + 2 && y < self.floor && y + h > self.top)) return false;
        if (self.phase === 'pour') return y + h > self.floor - self.fill() * (self.floor - self.top);
        return true;
      },
    };
  }
  /** how full of brass (0..1) while pouring */
  fill() {
    if (this.phase !== 'pour') return this.phase === 'cool' || this.phase === 'brass' ? 1 : 0;
    return Math.min(1, 0.15 + this.t / this.dur('pour'));
  }
  dur(p: MouldPhase) {
    return this.plan.find(([q]) => q === p)![1];
  }
  /** the tick in its cycle */
  at(w: World) {
    return (((w.tick - (this.t0 ?? w.tick) + this.phase0) % this.period) + this.period) % this.period;
  }
  /** ticks until it next turns to `p` (0 if it is now) */
  until(w: World, p: MouldPhase) {
    let c = 0;
    for (const [q, s] of this.plan) {
      if (q === p) break;
      c += Math.round(s * 120);
    }
    const a = this.at(w);
    return (((c - a) % this.period) + this.period) % this.period;
  }
  update(w: World) {
    this.t0 ??= w.tick;
    let a = this.at(w);
    let ph: MouldPhase = 'clay';
    for (const [q, s] of this.plan) {
      const n = Math.round(s * 120);
      if (a < n) {
        ph = q;
        break;
      }
      a -= n;
    }
    if (ph !== this.phase) {
      this.phase = ph;
      if (ph === 'melt') w.sfx('steam', (this.x0 + this.x1) / 2, this.floor - 10);
      if (ph === 'pour') w.sfx('pour', this.x1 - 10, this.top);
      if (ph === 'brass') {
        w.sfx('crack', (this.x0 + this.x1) / 2, this.top + 10);
        w.emit('fx', (this.x0 + this.x1) / 2, this.top + 10, { kind: 'crumble' });
      }
    }
    this.t = a / 120;
    this.hazard.cause = ph === 'pour' ? 'pital' : 'mom';
    // solid while it's clay, cooling brass, or the brass elephant; open while the wax runs and while hollow
    this.solid.collidable = ph === 'clay' || ph === 'cool' || ph === 'brass' || ph === 'reset';
  }
  draw(ctx: Ctx, w: World) {
    const { x0, x1, top, floor } = this;
    const W = x1 - x0,
      H = floor - top;
    const ph = this.phase;
    // the fire under it
    const fire = ph === 'melt' || ph === 'hollow' || ph === 'pour';
    if (fire) {
      for (let k = 0; k < W / 8; k++) {
        const fx = x0 + 4 + k * 8;
        const fh = 4 + ((k * 7 + w.tick) % 9);
        ctx.fillStyle = k % 2 ? 'rgba(255,152,0,0.85)' : 'rgba(255,214,0,0.8)';
        ctx.beginPath();
        ctx.moveTo(fx - 3, floor);
        ctx.lineTo(fx, floor - fh);
        ctx.lineTo(fx + 3, floor);
        ctx.fill();
      }
    }
    // an elephant: body, head, trunk, legs (the clay shell)
    const elephant = (fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(x0 + W * 0.42, top + H * 0.42, W * 0.42, H * 0.4, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x0 + W * 0.83, top + H * 0.3, W * 0.16, H * 0.28, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(x0 + W * 0.9, top + H * 0.35, W * 0.08, H * 0.6);
      for (const lx of [0.08, 0.28, 0.52, 0.7]) ctx.fillRect(x0 + W * lx, top + H * 0.6, W * 0.14, H * 0.4);
    };
    if (ph === 'clay' || ph === 'reset') {
      elephant('#8D6E63');
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      for (let k = 0; k < 6; k++) ctx.fillRect(x0 + 6 + k * (W / 6), top + 6 + (k % 3) * 7, 5, 2);
      // the pouring cup on top
      ctx.fillStyle = '#6D4C41';
      ctx.fillRect(x1 - W * 0.24, top - 6, 10, 7);
      return;
    }
    if (ph === 'melt' || ph === 'hollow' || ph === 'pour') {
      // the shell, open: you can see right through the elephant
      ctx.fillStyle = 'rgba(30,18,12,0.55)';
      ctx.fillRect(x0, top + 6, W, H - 6);
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(x0 + W * 0.42, top + H * 0.42, W * 0.42, H * 0.4, 0, Math.PI, TAU);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x0 + W * 0.83, top + H * 0.3, W * 0.16, H * 0.28, 0, Math.PI, TAU);
      ctx.stroke();
      if (ph === 'melt') {
        ctx.fillStyle = '#FFE082';
        for (let k = 0; k < 9; k++) {
          const dx = x0 + 6 + ((k * 37) % (W - 12));
          const dy = top + 8 + ((k * 23 + w.tick * 3) % (H - 8));
          ctx.fillRect(dx, dy, 2, 4);
        }
        ctx.fillStyle = 'rgba(255,224,130,0.35)';
        ctx.fillRect(x0, floor - 4, W, 4);
      }
      if (ph === 'pour') {
        const f = this.fill();
        const g = ctx.createLinearGradient(0, floor - f * H, 0, floor);
        g.addColorStop(0, '#FFEB3B');
        g.addColorStop(1, '#FF6D00');
        ctx.fillStyle = g;
        ctx.fillRect(x0 + 2, floor - f * H, W - 4, f * H);
        // the stream from the crucible
        ctx.fillStyle = '#FFC400';
        ctx.fillRect(x1 - W * 0.22, top - 30, 3, 30 + (1 - f) * H);
      }
      return;
    }
    // cooling brass, then the clay knocked off: a brass elephant
    const hot = ph === 'cool' ? 1 - this.t / this.dur('cool') : 0;
    if (ph === 'cool') elephant('#8D6E63');
    else {
      elephant(`rgb(${200 + hot * 55},${150 - hot * 40},${40})`);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x0 + W * 0.2, top + H * 0.18, W * 0.3, 2);
      // the thread work, Dokra's signature
      ctx.strokeStyle = 'rgba(120,80,20,0.6)';
      ctx.lineWidth = 0.8;
      for (let k = 0; k < 5; k++) {
        ctx.beginPath();
        ctx.arc(x0 + W * (0.2 + k * 0.12), top + H * 0.45, 3, 0, TAU);
        ctx.stroke();
      }
    }
    if (ph === 'cool') {
      ctx.fillStyle = `rgba(255,120,0,${0.3 + 0.4 * hot})`;
      ctx.fillRect(x0 + 4, top + 8, W - 8, H - 10);
    }
  }
}

/** a Dokra artisan beside his mould, with tongs and a hammer */
export class Artisan extends Entity {
  constructor(
    readonly x: number,
    readonly m: Mould,
    readonly face: 1 | -1 = 1,
  ) {
    super();
    this.layer = -1;
  }
  draw(ctx: Ctx, w: World) {
    const ph = this.m.phase;
    const arms = ph === 'brass' ? (Math.floor(w.tick / 8) % 2 ? 1 : 0.2) : ph === 'pour' ? 0.8 : 0.4;
    figure(ctx, this.x, this.m.floor, 24, '#FFFFFF', { face: this.face, arms, legs: '#ECEFF1', skin: '#7A4A2E' });
    if (ph === 'pour') {
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(this.x + this.face * 6, this.m.floor - 26, 8, 6);
    }
  }
}

/** A mould standing in the yard, open at the top, waiting for brass. Pour it full and, once it's cooled
 *  and the clay's knocked off, there's a brass elephant to stand on. */
export class CastMould extends Entity {
  state: 'shell' | 'filling' | 'cool' | 'brass' = 'shell';
  t = 0;
  solid: Solid;
  hazard: Hazard;
  static FILL = 1.0;
  static COOL = 1.0;
  constructor(
    readonly x0: number,
    readonly floor: number,
    readonly w = 40,
    readonly h = 32,
    /** a mould for a door instead of an elephant: nothing to stand on, something to walk through */
    readonly door = false,
  ) {
    super();
    this.layer = door ? 6 : 1;
    this.solid = new Solid(x0, floor - h, w, h);
    this.solid.collidable = false;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'pital',
      hits: (x, y, ww, hh) =>
        ((self.state === 'filling' && self.t > 0.3) || self.state === 'cool') && x < self.x0 + self.w - 1 && x + ww > self.x0 + 1 && y < self.floor && y + hh > self.floor - self.h - 2,
    };
  }
  get cx() {
    return this.x0 + this.w / 2;
  }
  private drawDoor(ctx: Ctx) {
    castDoor(ctx, this);
  }
  fill(w: World) {
    if (this.state !== 'shell') return;
    this.state = 'filling';
    this.t = 0;
    w.sfx('pour', this.cx, this.floor - this.h);
  }
  update(w: World) {
    if (this.state === 'shell' || this.state === 'brass') return;
    this.t += DT;
    if (this.state === 'filling' && this.t >= CastMould.FILL) {
      this.state = 'cool';
      this.t = 0;
    } else if (this.state === 'cool' && this.t >= CastMould.COOL) {
      this.state = 'brass';
      this.t = 0;
      this.solid.collidable = !this.door;
      w.sfx('crack', this.cx, this.floor - this.h);
      w.emit('fx', this.cx, this.floor - this.h / 2, { kind: 'crumble' });
    }
  }
  draw(ctx: Ctx, w: World) {
    if (this.door) return this.drawDoor(ctx);
    const { x0, floor, h } = this;
    const W = this.w;
    const body = (fill: string) => {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.ellipse(x0 + W * 0.42, floor - h * 0.58, W * 0.42, h * 0.4, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x0 + W * 0.84, floor - h * 0.68, W * 0.16, h * 0.3, 0, 0, TAU);
      ctx.fill();
      ctx.fillRect(x0 + W * 0.9, floor - h * 0.62, W * 0.08, h * 0.6);
      for (const lx of [0.06, 0.26, 0.52, 0.7]) ctx.fillRect(x0 + W * lx, floor - h * 0.4, W * 0.14, h * 0.4);
    };
    if (this.state === 'brass') {
      body('#D4A017');
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x0 + W * 0.18, floor - h * 0.9, W * 0.32, 1.5);
      ctx.strokeStyle = 'rgba(110,70,10,0.6)';
      ctx.lineWidth = 0.8;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        ctx.arc(x0 + W * (0.18 + k * 0.14), floor - h * 0.55, 2.5, 0, TAU);
        ctx.stroke();
      }
      return;
    }
    body('#8D6E63');
    // the open pouring cup on its back
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(x0 + W * 0.4, floor - h - 3, 8, 4);
    if (this.state === 'filling' || this.state === 'cool') {
      const hot = this.state === 'filling' ? 1 : 1 - this.t / CastMould.COOL;
      ctx.fillStyle = `rgba(255,${120 + 80 * hot},0,${0.35 + 0.45 * hot})`;
      body(ctx.fillStyle);
      void w;
    }
  }
}

/** a cast door: clay shell, then glowing, then brass with the Dokra wirework on it */
function castDoor(ctx: Ctx, m: CastMould) {
  const { x0, floor, h } = m;
  const W = m.w;
  const shape = (fill: string) => {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(x0, floor);
    ctx.lineTo(x0, floor - h + W / 2);
    ctx.arc(x0 + W / 2, floor - h + W / 2, W / 2, Math.PI, 0);
    ctx.lineTo(x0 + W, floor);
    ctx.fill();
  };
  if (m.state === 'brass') {
    shape('#C99A1E');
    ctx.strokeStyle = 'rgba(100,60,10,0.75)';
    ctx.lineWidth = 0.8;
    for (let y = floor - h + 10; y < floor - 3; y += 6) {
      ctx.beginPath();
      ctx.moveTo(x0 + 2, y);
      for (let x = x0 + 2; x <= x0 + W - 2; x += 3) ctx.lineTo(x, y + ((x - x0) % 6 < 3 ? -1.5 : 1.5));
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x0 + 3, floor - h + 6, 1.5, h - 10);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x0 + W - 5, floor - h * 0.45, 2, 3);
    return;
  }
  shape('#8D6E63');
  ctx.fillStyle = 'rgba(60,35,20,0.35)';
  ctx.fillRect(x0 + 2, floor - h * 0.6, W - 4, 1);
  ctx.fillStyle = '#4E342E';
  ctx.fillRect(x0 + W / 2 - 3, floor - h - 3, 6, 4);
  if (m.state === 'filling' || m.state === 'cool') {
    const hot = m.state === 'filling' ? 1 : 1 - m.t / CastMould.COOL;
    shape(`rgba(255,${120 + 80 * hot},0,${0.35 + 0.5 * hot})`);
  }
}

/** A crucible of molten brass hanging from a tripod over a mould. Jump up into its handle and it tips. */
export class Crucible extends Entity {
  state: 'full' | 'tip' | 'pour' | 'empty' = 'full';
  t = 0;
  hazard: Hazard;
  constructor(
    readonly into: CastMould,
    readonly y: number,
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'pital',
      hits: (x, yy, ww, hh) => self.state === 'pour' && x < self.spout + 3 && x + ww > self.spout - 3 && yy < self.into.floor && yy + hh > self.y + 10,
    };
  }
  /** where the brass comes down */
  get spout() {
    return this.into.cx;
  }
  /** the handle: the end you jump up into */
  get handle() {
    return { x: this.into.x0 - 24, y: this.y + 2, w: 10, h: 12 };
  }
  update(w: World) {
    this.t += DT;
    const p = w.player;
    if (this.state === 'full') {
      const hb = this.handle;
      if (!p.dead && p.vy < 0 && p.x < hb.x + hb.w && p.x + p.w > hb.x && p.y < hb.y + hb.h && p.y > hb.y - 6) {
        this.state = 'tip';
        this.t = 0;
        w.sfx('creak', this.spout, this.y);
      }
    } else if (this.state === 'tip' && this.t >= 0.25) {
      this.state = 'pour';
      this.t = 0;
      this.into.fill(w);
    } else if (this.state === 'pour' && this.t >= CastMould.FILL) {
      this.state = 'empty';
      this.t = 0;
    }
  }
  draw(ctx: Ctx) {
    const { y } = this;
    const hx = this.handle.x;
    const sx = this.spout;
    // the tripod
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hx - 6, this.into.floor);
    ctx.lineTo((hx + sx) / 2, y - 14);
    ctx.lineTo(sx + 10, this.into.floor);
    ctx.stroke();
    ctx.strokeStyle = '#9E9E9E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((hx + sx) / 2, y - 14);
    ctx.lineTo((hx + sx) / 2, y);
    ctx.stroke();
    // the pot, tipping towards the spout
    const tilt = this.state === 'full' ? 0 : this.state === 'tip' ? (this.t / 0.25) * 0.6 : this.state === 'pour' ? 0.6 : 0.15;
    ctx.save();
    ctx.translate((hx + sx) / 2, y + 6);
    ctx.rotate(tilt);
    const half = (sx - hx) / 2;
    ctx.fillStyle = '#6D3B2A';
    ctx.fillRect(-half + 4, -4, half * 2 - 4, 12);
    ctx.fillStyle = this.state === 'empty' ? '#3E2723' : '#FFB300';
    ctx.fillRect(-half + 6, -4, half * 2 - 8, 3);
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(-half - 2, -2, 7, 4);
    ctx.restore();
    if (this.state === 'pour') {
      const g = ctx.createLinearGradient(0, y + 8, 0, this.into.floor);
      g.addColorStop(0, '#FFEB3B');
      g.addColorStop(1, '#FF6D00');
      ctx.fillStyle = g;
      ctx.fillRect(sx - 2, y + 8, 4, this.into.floor - this.into.h - y - 6);
    }
  }
}

/** A row of brass elephants on show, standing on end. Knock one and it knocks the next. */
export class ElephantRow extends Entity {
  fall: number[];
  hits = 0;
  done = false;
  onDone: ((w: World) => void) | null = null;
  /** when the boy stands them up again and gives the first a push */
  private next = 0;
  static T = 0.3;
  constructor(
    readonly xs: (number | null)[],
    readonly floor = FLOOR,
    readonly every = 6,
  ) {
    super();
    this.layer = 1;
    this.fall = xs.map(() => -1);
  }
  private knock(w: World, i: number) {
    if (i >= this.xs.length || this.xs[i] === null || this.fall[i] >= 0) return;
    this.fall[i] = 0;
    w.sfx('bell', this.xs[i]!, this.floor - 12);
  }
  update(w: World) {
    if (w.state !== 'play' || this.done) return;
    this.next -= DT;
    const p = w.player;
    if (this.next <= 0 && this.fall.every((f) => f < 0)) {
      // the shop boy sets one going for the customers
      this.knock(w, 0);
      this.next = this.every;
    }
    for (let i = 0; i < this.xs.length; i++) {
      if (this.fall[i] < 0) continue;
      const was = this.fall[i];
      this.fall[i] = Math.min(1, this.fall[i] + DT / ElephantRow.T);
      if (was < 0.7 && this.fall[i] >= 0.7) {
        const j = i + 1;
        if (j >= this.xs.length) {
          this.done = true;
          this.onDone?.(w);
        } else if (this.xs[j] !== null) this.knock(w, j);
        else {
          // nobody standing in the gap? then it stops here. Dad in it? he gets knocked into the next one
          const gx = this.xs[i]! + 20;
          if (!p.dead && p.x < gx + 9 && p.x + p.w > gx - 9 && p.y + p.h > this.floor - 26) {
            p.vx = 320;
            p.vy = -120;
            p.stun = 14;
            p.launched = true;
            w.sfx('bonk', gx, this.floor - 10);
            this.hits++;
            this.knock(w, j + 1);
          }
        }
      }
    }
    // stood up again after a while, if it stopped
    if (!this.done && this.fall.some((f) => f >= 1) && this.fall.every((f) => f < 0 || f >= 1) && this.next <= 0.01) {
      this.fall = this.fall.map(() => -1);
      this.next = 1.5;
    }
  }
  draw(ctx: Ctx) {
    this.xs.forEach((x, i) => {
      if (x === null) {
        ctx.fillStyle = 'rgba(80,50,20,0.25)';
        ctx.fillRect(-7 + (this.xs[i - 1] ?? 0) + 20, this.floor - 2, 14, 2);
        return;
      }
      const f = Math.max(0, this.fall[i]);
      ctx.save();
      ctx.translate(x + 7, this.floor);
      ctx.rotate(f * (Math.PI / 2));
      ctx.fillStyle = '#D4A017';
      ctx.fillRect(-14, -24, 14, 18);
      ctx.fillRect(-14, -6, 4, 6);
      ctx.fillRect(-4, -6, 4, 6);
      ctx.fillRect(-16, -24, 4, 12);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(-12, -22, 8, 1);
      ctx.restore();
    });
  }
}

// ================================================================== Hundru: the water breaks your fall
/** A column of falling water from `top` down to `bottom`, `w` wide, centred on x. Inside it you sink
 *  slowly and wade slowly; `lip` px of river are drawn running in to its top from the left. */
export class Stream extends Entity {
  constructor(
    readonly x: number,
    readonly top: number,
    readonly bottom = FLOOR,
    readonly w = 24,
    readonly lip = 0,
  ) {
    super();
    this.layer = 4;
  }
  get x0() {
    return this.x - this.w / 2;
  }
  get x1() {
    return this.x + this.w / 2;
  }
  holds(x: number, y: number, ww: number, h: number) {
    return y + h > this.top && y < this.bottom && x + ww > this.x0 && x < this.x1;
  }
  draw(ctx: Ctx, w: World) {
    const { x0, top, bottom } = this;
    const t = w.tick;
    if (this.lip) {
      ctx.fillStyle = 'rgba(120,180,205,0.85)';
      ctx.fillRect(x0 - this.lip, top - 4, this.lip + this.w * 0.6, 4);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let k = 0; k < this.lip; k += 9) ctx.fillRect(x0 - this.lip + ((k + t * 0.6) % this.lip), top - 4, 4, 1);
    }
    ctx.fillStyle = 'rgba(190,225,240,0.8)';
    ctx.fillRect(x0, top, this.w, bottom - top);
    // the water's streaks, running down
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let k = 0; k < 6; k++) {
      const sx = x0 + 2 + ((k * 5) % (this.w - 3));
      const len = 10 + ((k * 7) % 9);
      for (let y = top + ((t * (2.2 + (k % 3) * 0.4) + k * 23) % 40) - 40; y < bottom; y += 40) {
        const a = Math.max(top, y);
        const b = Math.min(bottom, y + len);
        if (b > a) ctx.fillRect(sx, a, 1.5, b - a);
      }
    }
    ctx.fillStyle = 'rgba(80,140,170,0.25)';
    ctx.fillRect(x0, top, 2, bottom - top);
    ctx.fillRect(x0 + this.w - 2, top, 2, bottom - top);
    // spray where it lands
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    for (let k = 0; k < 7; k++) {
      const r = 3 + ((k * 13 + t * 0.5) % 6);
      ctx.beginPath();
      ctx.arc(x0 - 6 + k * ((this.w + 12) / 6), bottom - 3 - (k % 2) * 3, r, 0, TAU);
      ctx.fill();
    }
  }
}

/** Hundru's rule: a long fall on to the rocks kills. It counts from the highest point since Dad last
 *  stood on something or was in the water, so a jump off a high rock adds its own height to the fall.
 *  Inside the falling water he sinks gently and wades slowly. Only inside `zone` (px). */
export class Falls extends Entity {
  streams: Stream[] = [];
  zone: [number, number] = [-Infinity, Infinity];
  inWater = false;
  /** the highest point (least y) since he last stood or was in the water, and where that was */
  private top = 0;
  private from = 0;
  private was = true;
  private slowed = false;
  static SPLAT = 120;
  static SINK = 70;
  static WADE = 0.35;
  constructor() {
    super();
    this.layer = -9;
  }
  update(w: World) {
    const p = w.player;
    if (p.dead) return;
    const here = p.cx >= this.zone[0] && p.cx < this.zone[1];
    this.inWater = here && this.streams.some((s) => s.holds(p.x, p.y, p.w, p.h));
    if (this.inWater) {
      this.slowed = true;
      p.fallCap = Falls.SINK;
      p.speedMul = Falls.WADE;
      const m = PHYS.maxRun * Falls.WADE;
      if (Math.abs(p.vx) > m) p.vx = Math.sign(p.vx) * m;
    } else if (this.slowed) {
      this.slowed = false;
      p.fallCap = null;
      p.speedMul = 1;
    }
    if (here && p.onGround && !this.was && !this.inWater && p.y - this.top > Falls.SPLAT) {
      this.was = true;
      w.emit('shake', p.cx, p.y + p.h, { amount: 2 });
      // walked off something that high: the rocks. Jumped, and the jump made it too far: the leap.
      return w.die(p.y - this.from > Falls.SPLAT ? 'pathar' : 'chhalang');
    }
    if (p.onGround || this.inWater) {
      this.top = p.y;
      this.from = p.y;
    } else this.top = Math.min(this.top, p.y);
    this.was = p.onGround;
  }
}

/** the falls' rule, once per world */
export function falls(w: World): Falls {
  return (w.entities.find((e) => e instanceof Falls) as Falls) ?? w.add(new Falls());
}

/** the plunge pool where a stream lands (just water to look at: the stream is what breaks the fall) */
export class Pool extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly floor = FLOOR,
  ) {
    super();
    this.layer = 5;
  }
  draw(ctx: Ctx, w: World) {
    const { x0, x1, floor } = this;
    ctx.fillStyle = 'rgba(60,130,160,0.7)';
    ctx.fillRect(x0, floor - 5, x1 - x0, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    const n = Math.max(1, Math.floor((x1 - x0) / 10));
    for (let k = 0; k < n; k++) ctx.fillRect(x0 + ((k * 10 + w.tick * 0.25) % (x1 - x0 - 4)), floor - 5, 4, 1);
  }
}

/** the iron railing at the view point: a post to stand on, and that's all it stops */
export class Railing extends Entity {
  solid: Solid;
  constructor(
    readonly x: number,
    readonly feet: number,
    readonly w = 16,
    readonly h = 16,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x, feet - h, w, h);
  }
  draw(ctx: Ctx) {
    const { x, feet, w, h } = this;
    ctx.fillStyle = '#37474F';
    ctx.fillRect(x, feet - h, w, 2);
    ctx.fillRect(x, feet - h * 0.5, w, 1.5);
    for (let k = 0; k <= w; k += 5) ctx.fillRect(x + Math.min(k, w - 1.5), feet - h, 1.5, h);
    ctx.fillStyle = '#FBC02D';
    ctx.fillRect(x, feet - h, w, 1);
  }
}

/** The steps down to the pool (and, for the tired, back up): stone blocks, each `rise` px above the one
 *  before, from (x, bottom) up to the right. You can walk underneath them. */
export class Steps extends Entity {
  solids: Solid[] = [];
  constructor(
    readonly x: number,
    readonly bottom: number,
    readonly n: number,
    readonly run = TILE,
    readonly rise = TILE,
  ) {
    super();
    this.layer = 1;
    for (let k = 0; k < n; k++) this.solids.push(new Solid(x + k * run, bottom - (k + 1) * rise, run, rise));
  }
  draw(ctx: Ctx) {
    const { x, bottom, n, run, rise } = this;
    for (let k = 0; k < n; k++) {
      const sx = x + k * run;
      const sy = bottom - (k + 1) * rise;
      ctx.fillStyle = '#7E766B';
      ctx.fillRect(sx, sy, run, rise);
      ctx.fillStyle = '#A39A8C';
      ctx.fillRect(sx, sy, run, 3);
      ctx.fillStyle = 'rgba(40,30,20,0.3)';
      ctx.fillRect(sx, sy + rise - 2, run, 2);
      ctx.fillRect(sx + run - 1, sy + 3, 1, rise - 3);
      // the posts of the hand rail
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(sx + 2, sy - 13, 1.2, 13);
    }
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x + 2, bottom - rise - 13);
    ctx.lineTo(x + (n - 1) * run + 2, bottom - n * rise - 13);
    ctx.stroke();
  }
}
