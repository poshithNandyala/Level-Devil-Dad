// Daman's moving parts: the pedal boat, mooring lines, ice from the ice factory.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT } from '../constants';

const approach = (v: number, t: number, d: number) => (v < t ? Math.min(t, v + d) : Math.max(t, v - d));

/** A pedal boat. Stand on it and run: your legs drive the boat, not you (no walking on it while it
 *  moves). Jump and you keep its speed, so you come down on it again. It stops against a bank, and
 *  then you can step off. */
export class PedalBoat extends Entity {
  solid: Solid;
  v = 0;
  /** a push from outside (a wave), px/s added this tick */
  shove = 0;
  private hop = false;
  constructor(
    x: number,
    readonly top: number,
    readonly o: { max?: number; acc?: number; drag?: number; col?: string } = {},
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x, top, 40, 10);
  }
  private blocked(w: World, dx: number) {
    const s = this.solid;
    s.collidable = false;
    const b = !!w.solidAt(s.x + dx, s.y, s.w, s.h);
    s.collidable = true;
    return b;
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    const max = this.o.max ?? 90,
      acc = this.o.acc ?? 220,
      drag = this.o.drag ?? 40;
    const aboard = w.standing(s);
    const dir = (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0);
    const stuck = dir !== 0 && this.blocked(w, dir * 2);
    if (aboard && dir !== 0 && !stuck) this.v = Math.max(-max, Math.min(max, this.v + dir * acc * DT));
    else this.v = approach(this.v, 0, drag * DT);
    this.v += this.shove;
    this.shove = 0;
    const dx = this.v * DT;
    if (dx !== 0 && this.blocked(w, dx)) this.v = 0;
    else {
      s.velX = this.v;
      s.moveBy(w, dx, 0);
    }
    const moving = Math.abs(this.v) > 15;
    // Dad's legs are busy pedalling; a hop off a moving boat keeps him over it till he lands
    if (aboard && ((dir !== 0 && !stuck) || moving)) {
      p.speedMul = 0;
      this.hop = true;
    } else if (this.hop && !p.onGround) p.speedMul = 0;
    else if (this.hop) {
      this.hop = false;
      p.speedMul = 1;
    }
    w.flags.boatV = this.v;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    const x = s.x,
      y = s.y;
    const t = w.tick * DT;
    // a swan-ish pedal boat: white hull, a coloured canopy rail, paddle wheel churning
    ctx.fillStyle = this.o.col ?? '#FF8F00';
    ctx.beginPath();
    ctx.moveTo(x - 2, y);
    ctx.lineTo(x + 42, y);
    ctx.lineTo(x + 36, y + 10);
    ctx.lineTo(x + 4, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(x, y, 40, 2.5);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    const a = t * (this.v / 8);
    for (let k = 0; k < 4; k++) {
      const q = a + (k * Math.PI) / 2;
      ctx.fillRect(x + 20 + Math.cos(q) * 5 - 1, y + 7 + Math.sin(q) * 3, 2, 3);
    }
    if (Math.abs(this.v) > 15) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.8;
      const back = this.v > 0 ? x - 4 : x + 44;
      ctx.beginPath();
      ctx.moveTo(back, y + 9);
      ctx.lineTo(back - Math.sign(this.v) * 10, y + 10);
      ctx.stroke();
    }
  }
}

/** A mooring line across the channel, tied between two posts at chest height on a boat: hop it. */
export class Mooring extends Entity {
  hazard: Hazard;
  constructor(
    readonly x: number,
    readonly y: number,
    readonly bottom: number,
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = { active: true, cause: 'moored', hits: (x2, y2, w2, h2) => x2 < self.x + 6 && x2 + w2 > self.x && y2 < self.y + 8 && y2 + h2 > self.y };
  }
  draw(ctx: CanvasRenderingContext2D) {
    // the near post, the line running away across the water, its float
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.x + 1, this.y - 6, 4, this.bottom - this.y + 6);
    ctx.strokeStyle = '#ECEFF1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - 8, this.y + 5);
    ctx.lineTo(this.x + 14, this.y + 3);
    ctx.stroke();
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.arc(this.x + 3, this.y + 4, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A block of ice from the ice factory: slippery, and it melts away under you (salted ones faster).
 *  Melts from both sides, so stand in the middle; when it's gone, it's gone. */
export class IceBlock extends Entity {
  solid: Solid;
  w: number;
  gone = false;
  constructor(
    readonly cx: number,
    readonly top: number,
    readonly w0: number,
    readonly o: { rate?: number; salted?: boolean } = {},
  ) {
    super();
    this.layer = 2;
    this.w = w0;
    this.solid = new Solid(cx - w0 / 2, top, w0, 12);
    this.solid.slippery = true;
  }
  melt(w: World, px: number) {
    if (this.gone) return;
    this.w = Math.max(0, this.w - px);
    const s = this.solid;
    if (this.w < 6) {
      this.gone = true;
      s.collidable = false;
      w.sfx('splash', this.cx, this.top);
      w.emit('fx', this.cx, this.top + 6, { kind: 'splash' });
      return;
    }
    const nx = Math.round(this.cx - this.w / 2);
    s.place(nx, this.top);
    s.w = Math.round(this.w);
  }
  update(w: World) {
    if (this.gone) return;
    const on = w.standing(this.solid);
    const r = (this.o.rate ?? 22) * (this.o.salted ? 2.6 : 1);
    this.melt(w, (on ? r : 1.2) * DT);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.gone) return;
    const s = this.solid;
    const k = this.w / this.w0;
    ctx.fillStyle = `rgba(200,236,255,${0.65 + 0.3 * k})`;
    ctx.fillRect(s.x, s.y, s.w, 12);
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.fillRect(s.x + 1, s.y + 1, s.w - 2, 2);
    ctx.strokeStyle = 'rgba(100,170,210,0.8)';
    ctx.lineWidth = 0.7;
    ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, 11);
    if (this.o.salted) {
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < s.w - 3; i += 4) ctx.fillRect(s.x + 2 + i, s.y - 1 + ((i / 4) % 2), 1.4, 1.4);
    }
    // drips
    const t = w.tick * DT;
    ctx.fillStyle = 'rgba(160,210,240,0.8)';
    for (let i = 0; i < 2; i++) {
      const ph = (t * 1.6 + i * 0.5) % 1;
      ctx.fillRect(s.x + 4 + i * (s.w - 8), s.y + 12 + ph * 8, 1, 2);
    }
  }
}

/** The boatyard's human chain: a plank goes from hand to hand up the scaffold round the dhow's hull,
 *  resting on each carpenter's head for a moment. Stand on it and you go up too. A sleepy one drops it
 *  on alternate rounds (he's dozing that round: watch him). */
export class PlankChain extends Entity {
  solid: Solid;
  /** which round it is, where the plank is in it, and whether it has been dropped this round */
  round = 0;
  stage = 0;
  dropped = false;
  private fallV = 0;
  constructor(
    readonly spots: { x: number; y: number }[],
    readonly o: { rest: number; pass: number; back: number; phase?: number; dozer?: number },
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(spots[0].x, spots[0].y, 40, 6);
    this.solid.oneWay = true;
  }
  get T() {
    const n = this.spots.length;
    return n * this.o.rest + (n - 1) * this.o.pass + this.o.back;
  }
  /** is the dozer asleep this round (he'll drop it)? */
  dozing(round: number) {
    return this.o.dozer !== undefined && round % 2 === 1;
  }
  /** where the plank is at time t (top-left), and which stretch: resting at i, passing i→i+1, or going back */
  at(t: number): { x: number; y: number; i: number; passing: boolean; back: boolean; k: number; round: number } {
    const o = this.o;
    const n = this.spots.length;
    const u0 = t - (o.phase ?? 0);
    const round = Math.floor(u0 / this.T);
    let u = u0 - round * this.T;
    for (let i = 0; i < n; i++) {
      if (u < o.rest) return { ...this.spots[i], i, passing: false, back: false, k: u / o.rest, round };
      u -= o.rest;
      if (i < n - 1) {
        if (u < o.pass) {
          const k = u / o.pass;
          const a = this.spots[i],
            b = this.spots[i + 1];
          const e = k * k * (3 - 2 * k);
          return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e - Math.sin(k * Math.PI) * 18, i, passing: true, back: false, k, round };
        }
        u -= o.pass;
      }
    }
    const k = Math.min(1, u / o.back);
    const a = this.spots[n - 1],
      b = this.spots[0];
    return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 30, i: n - 1, passing: false, back: true, k, round };
  }
  update(w: World) {
    const s = this.solid;
    const q = this.at(w.tick * DT);
    if (q.round !== this.round) {
      this.round = q.round;
      this.dropped = false;
      this.fallV = 0;
      s.collidable = true;
      s.place(this.spots[0].x, this.spots[0].y);
    }
    // the dozer lets it slip as it comes to him
    const dz = this.o.dozer;
    if (dz !== undefined && !this.dropped && this.dozing(q.round) && q.passing && q.i === dz - 1 && q.k > 0.55) {
      this.dropped = true;
      w.sfx('crack', s.x + 20, s.y);
      w.say('Oops!', s.x + 20, s.y - 10, 1, 'npc');
    }
    if (this.dropped) {
      this.fallV = Math.min(420, this.fallV + 1400 * DT);
      s.moveBy(w, 0, this.fallV * DT);
      if (s.y > 300) s.collidable = false;
      return;
    }
    s.velX = (q.x - (s.x + s.xr)) / DT;
    s.moveBy(w, q.x - (s.x + s.xr), q.y - (s.y + s.yr));
    this.stage = q.i;
    w.flags.chainAt = q;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const q = this.at(t);
    // the carpenters on their scaffold, arms up for the plank when it's theirs
    for (const [i, sp] of this.spots.entries()) {
      const x = sp.x + 20,
        feet = sp.y + 34;
      ctx.fillStyle = '#795548';
      ctx.fillRect(x - 12, feet, 24, 3);
      ctx.fillRect(x - 11, feet + 3, 2, 300);
      ctx.fillRect(x + 9, feet + 3, 2, 300);
      const mine = !this.dropped && ((!q.passing && !q.back && q.i === i) || (q.passing && (q.i === i || q.i + 1 === i)));
      const asleep = this.o.dozer === i && this.dozing(q.round);
      ctx.fillStyle = '#F5F5F5';
      ctx.fillRect(x - 4, feet - 20, 8, 12);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x - 4, feet - 8, 3, 8);
      ctx.fillRect(x + 1, feet - 8, 3, 8);
      ctx.fillStyle = '#8D5524';
      ctx.beginPath();
      ctx.arc(x, feet - 23, 3.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#F5F5F5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 4, feet - 18);
      ctx.lineTo(x - 6, mine ? feet - 29 : feet - 10);
      ctx.moveTo(x + 4, feet - 18);
      ctx.lineTo(x + 6, mine ? feet - 29 : feet - 10);
      ctx.stroke();
      if (asleep) {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = '700 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('z z', x + 7, feet - 30 - ((t * 8) % 4));
      }
    }
    // the plank
    const s = this.solid;
    if (s.collidable || this.dropped) {
      ctx.fillStyle = '#C49A6C';
      ctx.fillRect(s.x, s.y, 40, 6);
      ctx.fillStyle = '#8D6E4C';
      ctx.fillRect(s.x, s.y + 4, 40, 2);
      ctx.fillRect(s.x + 12, s.y + 1, 1, 3);
      ctx.fillRect(s.x + 27, s.y + 1, 1, 3);
    }
  }
}

/** A rope ferry: a raft on a rope stretched over the water. Aboard, your hands are on the rope: every
 *  press of jump hauls it along (no walking, no jumping), and the current drags it back the moment you
 *  ease off. It docks at the far end, where you can step off. */
export class RopeFerry extends Entity {
  solid: Solid;
  v = 0;
  hauls = 0;
  /** seconds since it left its dock (for the tide) */
  out = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top: number,
    readonly o: { pull?: number; drag?: number; max?: number; back?: number; tide?: number },
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x0, top, 44, 8);
  }
  get docked() {
    return this.solid.x + this.solid.w >= this.x1 - 1;
  }
  get home() {
    return this.solid.x <= this.x0 + 1 && this.v <= 0;
  }
  update(w: World) {
    const p = w.player;
    const s = this.solid;
    const aboard = w.standing(s);
    const pull = this.o.pull ?? 28,
      drag = this.o.drag ?? 60,
      max = this.o.max ?? 90,
      back = this.o.back ?? 50;
    if (aboard && !this.docked && !(this.home && w.input.left)) {
      // hands on the rope
      p.stun = 2;
      p.vx = 0;
      if (w.input.jumpPressed) {
        this.v = Math.min(max, this.v + pull);
        this.hauls++;
        w.sfx('creak', s.x + 22, s.y - 20);
      }
    }
    if (!this.docked) this.v = Math.max(-back, this.v - drag * DT);
    let nx = s.x + s.xr + this.v * DT;
    if (nx <= this.x0) {
      nx = this.x0;
      this.v = Math.max(0, this.v);
    }
    if (nx + s.w >= this.x1) {
      nx = this.x1 - s.w;
      this.v = 0;
    }
    s.velX = this.v;
    s.moveBy(w, nx - (s.x + s.xr), 0);
    this.out = this.home || this.docked ? 0 : this.out + DT;
    if (this.o.tide && this.out > this.o.tide && aboard) {
      w.say('Bharti aavi! | The tide’s in!', s.x + 22, s.y - 30, 1.2, 'npc');
      w.die('tide');
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    const ry = this.top - 22;
    // the rope from post to post, and the raft hanging off it
    ctx.strokeStyle = '#D7CCC8';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(this.x0 - 4, ry);
    ctx.lineTo(this.x1 + 4, ry);
    ctx.stroke();
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.x0 - 6, ry - 4, 4, this.top - ry + 14);
    ctx.fillRect(this.x1 + 2, ry - 4, 4, this.top - ry + 14);
    ctx.strokeStyle = 'rgba(215,204,200,0.9)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(s.x + 6, s.y);
    ctx.lineTo(s.x + 10, ry);
    ctx.moveTo(s.x + 38, s.y);
    ctx.lineTo(s.x + 34, ry);
    ctx.stroke();
    ctx.fillStyle = '#A1887F';
    ctx.fillRect(s.x, s.y, 44, 8);
    ctx.fillStyle = '#795548';
    for (let k = 0; k < 44; k += 7) ctx.fillRect(s.x + k, s.y, 1.5, 8);
    if (this.o.tide && this.out > 0) {
      const left = Math.max(0, this.o.tide - this.out);
      ctx.fillStyle = left < 2 ? '#FF5252' : '#FFFFFF';
      ctx.font = '800 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(left.toFixed(1), s.x + 22, s.y - 30);
    }
    // ripples where the current runs
    const t = w.tick * DT;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.7;
    for (let x = this.x0 + ((t * 30) % 20); x < this.x1; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, this.top + 10);
      ctx.lineTo(x - 6, this.top + 10);
      ctx.stroke();
    }
  }
}

/** The fishmonger's big balance. You stand on one pan; the porter keeps loading fish crates on to the
 *  other, so your side rises a step per crate. Then the lot is sold and it drops back. */
export class Scale extends Entity {
  solids: Solid[];
  theta = 0;
  crates = 0;
  constructor(
    readonly px0: number,
    readonly y0: number,
    readonly o: { R?: number; mine: 'A' | 'B'; every: number; max: number; hold: number; phase?: number },
  ) {
    super();
    this.layer = 2;
    this.solids = [new Solid(px0 - 56, y0, 32, 6), new Solid(px0 + 24, y0, 32, 6)];
    for (const s of this.solids) s.oneWay = true;
  }
  get cycle() {
    return this.o.every * this.o.max + this.o.hold;
  }
  /** crates on the loaded pan at time t */
  load(t: number) {
    const u = (((t - (this.o.phase ?? 0)) % this.cycle) + this.cycle) % this.cycle;
    return Math.min(this.o.max, Math.floor(u / this.o.every));
  }
  get mine() {
    return this.solids[this.o.mine === 'A' ? 0 : 1];
  }
  update(w: World) {
    const R = this.o.R ?? 40;
    const c = this.load(w.tick * DT);
    if (c !== this.crates) {
      w.sfx(c > this.crates ? 'thud' : 'clap', this.px0, this.y0);
      this.crates = c;
    }
    const [A, B] = this.solids;
    // (the fish pan is the porter's: only Dad's weight on his own pan counts)
    const dadA = this.o.mine === 'A' && w.standing(A) ? 2 : 0,
      dadB = this.o.mine === 'B' && w.standing(B) ? 2 : 0;
    const wA = dadA + (this.o.mine === 'A' ? 0 : c),
      wB = dadB + (this.o.mine === 'B' ? 0 : c);
    const target = Math.max(-1, Math.min(1, (wA - wB) / 2));
    this.theta += Math.max(-1.2 * DT, Math.min(1.2 * DT, target - this.theta));
    A.moveBy(w, 0, this.y0 + this.theta * R - (A.y + A.yr));
    B.moveBy(w, 0, this.y0 - this.theta * R - (B.y + B.yr));
  }
  draw(ctx: CanvasRenderingContext2D) {
    const R = this.o.R ?? 40;
    const [A, B] = this.solids;
    const top = this.y0 - R - 30;
    // the post, the beam (tilting), the chains and pans, crates on the loaded pan
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.px0 - 3, top, 6, 300);
    ctx.strokeStyle = '#4E342E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.px0 - 40, top + this.theta * 12);
    ctx.lineTo(this.px0 + 40, top - this.theta * 12);
    ctx.stroke();
    ctx.strokeStyle = '#90A4AE';
    ctx.lineWidth = 0.8;
    for (const [s, sx] of [
      [A, -40],
      [B, 40],
    ] as [Solid, number][]) {
      const by = top + (sx < 0 ? this.theta * 12 : -this.theta * 12);
      ctx.beginPath();
      ctx.moveTo(this.px0 + sx, by);
      ctx.lineTo(s.x + 2, s.y);
      ctx.moveTo(this.px0 + sx, by);
      ctx.lineTo(s.x + 30, s.y);
      ctx.stroke();
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(s.x, s.y, 32, 6);
      ctx.fillStyle = '#78909C';
      ctx.fillRect(s.x, s.y + 4, 32, 2);
    }
    const L = this.o.mine === 'A' ? B : A;
    for (let i = 0; i < this.crates; i++) {
      const cx = L.x + 2 + (i % 2) * 15,
        cy = L.y - 10 - Math.floor(i / 2) * 10;
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(cx, cy, 13, 10);
      ctx.fillStyle = '#B0BEC5';
      ctx.fillRect(cx + 2, cy + 1, 9, 3);
    }
  }
}

/** A Warli painter's brush paints the path across the gorge as it goes: white strokes you can walk
 *  on, which fade away behind it. Where the brush lifts off the wall there's nothing. */
export class Brush extends Entity {
  solids: Solid[] = [];
  private born: number[] = [];
  private pts: { x: number; y: number; ink: boolean }[] = [];
  started = -1;
  /** the brush's x now (-1 when it isn't painting) */
  hx = -1;
  constructor(
    path: [number, number, boolean?][],
    readonly o: { speed: number; life: number; startX: number; again?: number },
  ) {
    super();
    this.layer = 2;
    // sample the path every 8 px (ink: false where the brush is lifted)
    for (let i = 0; i < path.length - 1; i++) {
      const [x0, y0, lift] = path[i];
      const [x1, y1] = path[i + 1];
      const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 8));
      for (let k = 0; k < n; k++) this.pts.push({ x: Math.round(x0 + ((x1 - x0) * k) / n), y: Math.round(y0 + ((y1 - y0) * k) / n), ink: !lift });
    }
    const [lx, ly] = path[path.length - 1];
    this.pts.push({ x: lx, y: ly, ink: true });
    for (const q of this.pts) {
      // (solid, not one-way: Dad walks up the stroke's gentle slopes like steps)
      const sd = new Solid(q.x - 4, q.y, 9, 4);
      sd.collidable = false;
      this.solids.push(sd);
      this.born.push(-1);
    }
  }
  /** where the brush is now (index along the path), -1 before it starts */
  head(t: number) {
    if (this.started < 0) return -1;
    const T = this.pts.length / (this.o.speed / 8);
    let u = t - this.started;
    if (this.o.again) u = u % (T + this.o.again);
    return u > T ? -1 : Math.floor(u * (this.o.speed / 8));
  }
  update(w: World) {
    const t = w.tick * DT;
    if (this.started < 0 && w.player.cx >= this.o.startX) this.started = t;
    const h = this.head(t);
    for (let i = 0; i < this.pts.length; i++) {
      if (h >= 0 && i <= h && (this.born[i] < 0 || t - this.born[i] > this.o.life + 0.2) && i > h - 2) this.born[i] = t;
      const on = this.born[i] >= 0 && t - this.born[i] < this.o.life && this.pts[i].ink;
      this.solids[i].collidable = on;
    }
    this.hx = h >= 0 ? this.pts[Math.min(h, this.pts.length - 1)].x : -1;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    ctx.strokeStyle = '#FFFDF5';
    ctx.lineCap = 'round';
    for (let i = 0; i < this.pts.length - 1; i++) {
      if (!this.solids[i].collidable) continue;
      const age = t - this.born[i];
      ctx.globalAlpha = Math.max(0.15, 1 - age / this.o.life);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(this.pts[i].x, this.pts[i].y + 1);
      ctx.lineTo(this.pts[i + 1].x, this.pts[i + 1].y + 1);
      ctx.stroke();
      // little Warli triangles along the stroke
      if (i % 6 === 0) {
        ctx.fillStyle = '#FFFDF5';
        ctx.beginPath();
        ctx.moveTo(this.pts[i].x - 2, this.pts[i].y + 4);
        ctx.lineTo(this.pts[i].x + 2, this.pts[i].y + 4);
        ctx.lineTo(this.pts[i].x, this.pts[i].y + 8);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    const h = this.head(t);
    if (h >= 0) {
      const q = this.pts[Math.min(h, this.pts.length - 1)];
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(q.x + 10, q.y - 16);
      ctx.stroke();
      ctx.fillStyle = q.ink ? '#FFFDF5' : '#BCAAA4';
      ctx.beginPath();
      ctx.arc(q.x, q.y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
