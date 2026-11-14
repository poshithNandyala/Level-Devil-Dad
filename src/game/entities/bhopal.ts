// Bhopal's moving parts: skipping like a stone across the Upper Lake, stepping in to Bhimbetka's rock
// paintings, a zardozi thread you mustn't cross, jal tarang bowls, Surma Bhopali's tall tales, and
// BHEL's crane magnets.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT, ROOM_H } from '../constants';

/** A stretch of the lake. Stand in it and you sink. Hit it at a run and you skip like a flat stone:
 *  three skips, each a little slower, and then you're in. Tap jump just as you touch and that skip
 *  costs you nothing. Shallows (a ghat's steps under the water) don't drown anyone. */
export class Lake extends Entity {
  /** skips since he last stood on something */
  n = 0;
  /** all the skips of this crossing, clean ones too */
  count = 0;
  private sinkT = 0;
  private tapT = -99;
  private rings: { x: number; t: number }[] = [];
  shallows: { x0: number; x1: number }[] = [];
  static MIN = 100;
  static LOSS = 0.85;
  static MAX = 3;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly y: number,
  ) {
    super();
    this.layer = 4;
  }
  inShallows(x: number) {
    return this.shallows.some((s) => x > s.x0 && x < s.x1);
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    if (w.input.jumpPressed) this.tapT = w.tick;
    const over = p.cx > this.x0 && p.cx < this.x1;
    if (p.onGround && !(over && p.y + p.h > this.y + 2)) {
      // on something dry: a fresh stone
      if (this.n > 0 || p.speedMul !== 1) p.speedMul = 1;
      this.n = 0;
      this.count = 0;
    }
    w.flags.lake = { n: this.n, count: this.count };
    if (!over) {
      this.sinkT = 0;
      return;
    }
    const feet = p.y + p.h;
    if (feet < this.y) return;
    if (this.inShallows(p.cx)) {
      // the ghat: wade
      p.speedMul = 0.6;
      this.sinkT = 0;
      w.flags.wading = true;
      return;
    }
    w.flags.wading = false;
    if (this.sinkT === 0 && p.vy >= 0 && feet <= this.y + 8 && Math.abs(p.vx) >= Lake.MIN && this.n < Lake.MAX) {
      // skip
      const clean = w.tick - this.tapT <= 9;
      if (!clean) {
        this.n++;
        p.speedMul = Math.pow(Lake.LOSS, this.n);
      }
      this.count++;
      w.flags.skips = (w.flags.skips ?? 0) + 1;
      p.y = this.y - p.h;
      p.vy = clean ? -330 : -290;
      p.launched = true;
      p.onGround = false;
      p.coyoteT = 0;
      this.rings.push({ x: p.cx, t: w.tick });
      if (this.rings.length > 8) this.rings.shift();
      w.sfx(clean ? 'jump' : 'land', p.cx, this.y);
      return;
    }
    // in he goes
    if (this.sinkT === 0) {
      this.rings.push({ x: p.cx, t: w.tick });
      w.sfx('thud', p.cx, this.y);
    }
    this.sinkT++;
    p.vx *= 0.9;
    p.fallCap = 50;
    p.stun = 2;
    if (this.sinkT > 40) w.die('doob');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const g = ctx.createLinearGradient(0, this.y, 0, ROOM_H);
    g.addColorStop(0, 'rgba(120,200,210,0.72)');
    g.addColorStop(1, 'rgba(30,90,110,0.9)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, this.y, this.x1 - this.x0, ROOM_H - this.y);
    const t = w.tick * DT;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let x = this.x0 + 3; x < this.x1 - 8; x += 14) ctx.fillRect(x + Math.sin(t * 1.6 + x * 0.3) * 3, this.y + 0.5, 7, 1);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    for (const r of this.rings) {
      const a = (w.tick - r.t) / 60;
      if (a > 1) continue;
      ctx.globalAlpha = 1 - a;
      ctx.beginPath();
      ctx.ellipse(r.x, this.y + 1, 3 + a * 12, 1 + a * 2.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

/** A boat-club sailboat tacking back and forth on the lake: somewhere dry to land. */
export class Sailboat extends Entity {
  solid: Solid;
  private dir = 1;
  constructor(
    readonly xa: number,
    readonly xb: number,
    readonly y: number,
    readonly speed: number,
    readonly hue = '#E53935',
    start = 0,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(xa + (xb - xa) * start, y, 30, 6);
    this.solid.oneWay = true;
  }
  /** where its left end will be t seconds from now */
  xAt(w: World, t: number) {
    let x = this.solid.x,
      d = this.dir;
    let left = t * this.speed;
    while (left > 0 && this.xb > this.xa) {
      const to = d > 0 ? this.xb - x : x - this.xa;
      if (left <= to) {
        x += d * left;
        break;
      }
      left -= to;
      x = d > 0 ? this.xb : this.xa;
      d = -d;
    }
    void w;
    return x;
  }
  update(w: World) {
    if (this.speed === 0) return;
    const s = this.solid;
    if (s.x >= this.xb) this.dir = -1;
    if (s.x <= this.xa) this.dir = 1;
    s.moveBy(w, this.dir * this.speed * DT, 0);
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    ctx.fillStyle = this.hue;
    ctx.beginPath();
    ctx.moveTo(s.x - 2, s.y);
    ctx.lineTo(s.x + 32, s.y);
    ctx.lineTo(s.x + 27, s.y + 7);
    ctx.lineTo(s.x + 3, s.y + 7);
    ctx.fill();
    ctx.fillStyle = '#FFF8E1';
    ctx.fillRect(s.x - 2, s.y, 34, 1.5);
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(s.x + 14, s.y - 30, 1.5, 30);
    ctx.fillStyle = '#FAFAFA';
    ctx.beginPath();
    ctx.moveTo(s.x + 16, s.y - 29);
    ctx.lineTo(s.x + 16, s.y - 4);
    ctx.lineTo(s.x + 29, s.y - 4);
    ctx.fill();
  }
}

/** Bhimbetka. There are two worlds here: the rock shelter, and the painting on its wall. Touch a red
 *  hand stencil and Dad steps from one in to the other. Painted ledges and painted bison are only
 *  there for a painted man; the shelter's boulders only for a real one. */
export class Shelter extends Entity {
  /** is he in the painting? */
  painted = false;
  private cool = 0;
  hands: { x: number; y: number; t: number }[] = [];
  ledges: { s: Solid; real: boolean }[] = [];
  flips = 0;
  constructor() {
    super();
    this.layer = 3;
  }
  hand(x: number, y: number) {
    this.hands.push({ x, y, t: -999 });
    return this;
  }
  private apply() {
    for (const l of this.ledges) l.s.collidable = l.real !== this.painted;
  }
  update(w: World) {
    const p = w.player;
    w.flags.painted = this.painted;
    if (w.tick <= 1) this.apply();
    if (this.cool > 0) this.cool--;
    if (w.state !== 'play' || this.cool > 0) return;
    for (const h of this.hands) {
      if (Math.abs(p.cx - h.x) < 9 && Math.abs(p.cy - h.y) < 12) {
        // would he come out inside something? then the wall won't take him
        const to = !this.painted;
        const clash = this.ledges.some((l) => l.real !== to && p.x < l.s.x + l.s.w && p.x + p.w > l.s.x && p.y < l.s.y + l.s.h && p.y + p.h > l.s.y);
        this.cool = 60;
        if (clash) {
          w.sfx('thud', p.cx, p.cy);
          return;
        }
        this.painted = to;
        this.flips++;
        h.t = w.tick;
        this.apply();
        w.sfx('win', p.cx, p.cy);
        w.emit('fx', p.cx, p.cy, { kind: 'sparkle' });
        return;
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (const h of this.hands) handArt(ctx, h.x, h.y, w.tick - h.t < 40 ? 1 : 0.75 + Math.sin(w.tick * 0.05) * 0.1);
    if (!this.painted) return;
    // he's a painted man now: red ochre, flat, a white outline
    const p = w.player;
    ctx.fillStyle = 'rgba(176,58,30,0.82)';
    ctx.fillRect(p.x - 0.5, p.y - 0.5, p.w + 1, p.h + 1);
    ctx.strokeStyle = 'rgba(255,240,220,0.9)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(p.x - 0.5, p.y - 0.5, p.w + 1, p.h + 1);
    ctx.fillStyle = 'rgba(255,240,220,0.95)';
    ctx.fillRect(p.x + (p.facing > 0 ? 6 : 2), p.y + 3, 2, 2);
  }
}
/** a hand stencil, blown red ochre round a hand on the rock */
export function handArt(ctx: CanvasRenderingContext2D, x: number, y: number, a: number) {
  ctx.fillStyle = `rgba(176,58,30,${0.55 * a})`;
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(245,232,210,${a})`;
  ctx.fillRect(x - 3, y - 1, 6, 6);
  for (let k = 0; k < 4; k++) ctx.fillRect(x - 3.4 + k * 1.9, y - 6 + (k === 0 || k === 3 ? 1.5 : 0), 1.3, 6);
  ctx.fillRect(x - 5.5, y + 0.5, 3, 1.4);
}

/** A ledge that is there in only one of Bhimbetka's two worlds: painted (ochre strokes on the wall)
 *  or real (a boulder). */
export class Ledge extends Entity {
  solid: Solid;
  constructor(
    readonly sh: Shelter,
    x: number,
    y: number,
    w: number,
    h: number,
    readonly real: boolean,
  ) {
    super();
    this.layer = real ? 0 : -3;
    this.solid = new Solid(x, y, w, h);
    this.solid.collidable = real;
    sh.ledges.push({ s: this.solid, real });
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    const here = this.real !== this.sh.painted;
    if (this.real) {
      // a boulder: solid for a real man, a ghost of itself for a painted one
      ctx.globalAlpha = here ? 1 : 0.22;
      ctx.fillStyle = '#6E5544';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y + s.h);
      ctx.lineTo(s.x, s.y + 5);
      ctx.quadraticCurveTo(s.x + 2, s.y, s.x + 7, s.y);
      ctx.lineTo(s.x + s.w - 7, s.y);
      ctx.quadraticCurveTo(s.x + s.w - 2, s.y, s.x + s.w, s.y + 5);
      ctx.lineTo(s.x + s.w, s.y + s.h);
      ctx.fill();
      ctx.strokeStyle = '#3E2C22';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#B79A82';
      ctx.fillRect(s.x + 3, s.y + 1, s.w - 6, 2);
      ctx.fillStyle = 'rgba(60,40,30,0.35)';
      for (let k = 0; k < s.w * s.h * 0.012; k++) ctx.fillRect(s.x + 3 + ((k * 37) % Math.max(1, s.w - 8)), s.y + 6 + ((k * 23) % Math.max(1, s.h - 8)), 3, 1);
      ctx.globalAlpha = 1;
      return;
    }
    // painted: ochre strokes, bright when he's in the picture, faint on the wall otherwise
    ctx.globalAlpha = here ? 1 : 0.4;
    ctx.fillStyle = '#B03A1E';
    ctx.fillRect(s.x, s.y, s.w, Math.min(4, s.h));
    ctx.fillStyle = '#D9774A';
    for (let x = s.x + 2; x < s.x + s.w - 2; x += 6) ctx.fillRect(x, s.y + 4, 2, Math.min(5, s.h - 4));
    if (s.h > 10) {
      ctx.strokeStyle = '#B03A1E';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
      for (let y = s.y + 8; y < s.y + s.h - 2; y += 7) {
        ctx.beginPath();
        ctx.moveTo(s.x + 2, y);
        for (let x = s.x + 2; x < s.x + s.w - 2; x += 5) ctx.lineTo(x + 2.5, y + (((x - s.x) / 5) % 2 ? -2 : 2));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}

/** A painted bison, charging up and down its bit of wall. It only gores painted men. */
export class Bison extends Entity {
  hazard: Hazard;
  x: number;
  dir = 1;
  constructor(
    readonly sh: Shelter,
    readonly xa: number,
    readonly xb: number,
    readonly floor: number,
    readonly speed = 70,
    start = 0,
  ) {
    super();
    this.layer = -3;
    this.x = xa + (xb - xa) * start;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'bison',
      hits: (x, y, w2, h2) => self.sh.painted && x + w2 > self.x - 9 && x < self.x + 9 && y + h2 > self.floor - 13 && y < self.floor,
    };
  }
  /** x at t seconds from now */
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
  update() {
    this.x += this.dir * this.speed * DT;
    if (this.x >= this.xb) this.dir = -1;
    if (this.x <= this.xa) this.dir = 1;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    ctx.save();
    ctx.translate(this.x, this.floor);
    ctx.scale(this.dir, 1);
    ctx.globalAlpha = this.sh.painted ? 1 : 0.4;
    const leg = Math.sin(w.tick * 0.3) * 2;
    ctx.fillStyle = '#B03A1E';
    ctx.beginPath();
    ctx.ellipse(-1, -8, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, -11, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(7, -10, 5, 4);
    ctx.fillRect(-8 + leg, -4, 1.5, 4);
    ctx.fillRect(-4 - leg, -4, 1.5, 4);
    ctx.fillRect(3 + leg, -4, 1.5, 4);
    ctx.fillRect(6 - leg, -4, 1.5, 4);
    ctx.strokeStyle = '#B03A1E';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(10, -10);
    ctx.quadraticCurveTo(13, -15, 9, -15);
    ctx.stroke();
    ctx.restore();
  }
}

/** Zardozi. From the spool at x0 Dad trails a gold thread, and it lies wherever he's been. Touch it
 *  again anywhere and he's tangled: where he's walked he can't walk again. It's snipped at x1.
 *  `knot` is the one place touching it ties a knot instead. */
export class Thread extends Entity {
  pts: { x: number; y: number }[] = [];
  on = false;
  cut = false;
  knot: { x0: number; x1: number; y0: number; y1: number } | null = null;
  tied = false;
  static STEP = 3;
  static SLACK = 9;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 2;
  }
  /** how near is (x, y) to the thread already laid (leaving out the last bit behind him)? */
  near(x: number, y: number) {
    let best = 1e9;
    const n = this.pts.length - Thread.SLACK;
    for (let i = 1; i < n; i++) {
      const a = this.pts[i - 1],
        b = this.pts[i];
      const dx = b.x - a.x,
        dy = b.y - a.y;
      const L = dx * dx + dy * dy || 1;
      const u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L));
      const ex = a.x + u * dx - x,
        ey = a.y + u * dy - y;
      best = Math.min(best, ex * ex + ey * ey);
    }
    return Math.sqrt(best);
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    w.flags.thread = this.on;
    if (this.cut || this.tied) return;
    if (!this.on) {
      if (p.cx >= this.x0 && p.cx < this.x1) {
        this.on = true;
        this.pts = [{ x: this.x0, y: this.floor - 7 }];
      } else return;
    }
    if (p.cx >= this.x1) {
      this.cut = true;
      this.on = false;
      w.sfx('land', p.cx, p.cy);
      return;
    }
    const last = this.pts[this.pts.length - 1];
    if (Math.hypot(p.cx - last.x, p.cy - last.y) >= Thread.STEP) this.pts.push({ x: p.cx, y: p.cy });
    if (this.near(p.cx, p.cy) < 4) {
      const k = this.knot;
      if (k && p.cx > k.x0 && p.cx < k.x1 && p.cy > k.y0 && p.cy < k.y1) {
        this.tied = true;
        w.flags.knot = true;
        w.sfx('win', p.cx, p.cy);
        w.emit('fx', p.cx, p.cy, { kind: 'sparkle' });
        return;
      }
      w.die('uljhan');
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the spool
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(this.x0 - 4, this.floor - 12, 8, 2);
    ctx.fillRect(this.x0 - 4, this.floor - 2, 8, 2);
    ctx.fillStyle = '#FFC107';
    ctx.fillRect(this.x0 - 3, this.floor - 10, 6, 8);
    // the scissors where it's snipped
    if (this.x1 < 1e8) {
      ctx.strokeStyle = '#B0BEC5';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(this.x1 - 4, this.floor - 20);
      ctx.lineTo(this.x1 + 3, this.floor - 6);
      ctx.moveTo(this.x1 + 4, this.floor - 20);
      ctx.lineTo(this.x1 - 3, this.floor - 6);
      ctx.stroke();
      ctx.strokeStyle = '#E53935';
      ctx.beginPath();
      ctx.arc(this.x1 - 4, this.floor - 4, 2, 0, Math.PI * 2);
      ctx.arc(this.x1 + 4, this.floor - 4, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (this.pts.length < 2) return;
    ctx.strokeStyle = this.tied ? '#FFF176' : '#FFC107';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.pts[0].x, this.pts[0].y);
    for (const q of this.pts) ctx.lineTo(q.x, q.y);
    if (this.on) ctx.lineTo(w.player.cx, w.player.cy);
    ctx.stroke();
    // sequins along it
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 6; i < this.pts.length; i += 12) ctx.fillRect(this.pts[i].x - 0.7, this.pts[i].y - 0.7, 1.4, 1.4);
  }
}

/** A sitara (sequin) to stitch in: touch it and it's sewn on. Gates wait for theirs. */
export class Sitara extends Entity {
  got = false;
  constructor(
    readonly x: number,
    readonly y: number,
  ) {
    super();
    this.layer = 2;
  }
  update(w: World) {
    const p = w.player;
    if (!this.got && w.state === 'play' && Math.abs(p.cx - this.x) < 11 && Math.abs(p.cy - this.y) < 13) {
      this.got = true;
      w.flags.sitaras = (w.flags.sitaras ?? 0) + 1;
      w.sfx('win', this.x, this.y);
      w.emit('fx', this.x, this.y, { kind: 'sparkle' });
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const r = this.got ? 3 : 5 + Math.sin(w.tick * 0.08) * 0.8;
    ctx.fillStyle = this.got ? 'rgba(255,255,255,0.35)' : '#FFD54F';
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + w.tick * 0.01;
      const rr = k % 2 ? r * 0.45 : r;
      ctx.lineTo(this.x + Math.cos(a) * rr, this.y + Math.sin(a) * rr);
    }
    ctx.fill();
    if (!this.got) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
    }
  }
}

/** A panel of the embroidery frame across the way: it rolls up once every one of its sitaras is sewn. */
export class Gate extends Entity {
  solid: Solid;
  open = false;
  private up = 0;
  constructor(
    readonly x: number,
    readonly y: number,
    readonly h: number,
    readonly keys: Sitara[],
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, y, 10, h);
  }
  update(w: World) {
    if (!this.open && this.keys.every((k) => k.got)) {
      this.open = true;
      w.sfx('creak', this.x, this.y);
    }
    if (this.open && this.up < 1) {
      this.up = Math.min(1, this.up + DT * 2);
      if (this.up >= 1) this.solid.collidable = false;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const h = this.h * (1 - this.up);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(this.x - 1, this.y - 3, 12, 4);
    if (h < 1) return;
    ctx.fillStyle = '#7B1FA2';
    ctx.fillRect(this.x, this.y, 10, h);
    ctx.fillStyle = '#FFD54F';
    for (let y = this.y + 4; y < this.y + h - 3; y += 9) {
      ctx.fillRect(this.x + 2, y, 6, 1.5);
      ctx.fillRect(this.x + 4, y + 3, 2, 2);
    }
    // how many sitaras it still wants
    const need = this.keys.filter((k) => !k.got).length;
    ctx.fillStyle = '#FFFFFF';
    for (let k = 0; k < need; k++) ctx.fillRect(this.x + 2 + k * 4, this.y + h - 6, 2.5, 2.5);
  }
}

/** A jal tarang bowl: china, with water in it. Jump in and it rings and throws you up, and some of the
 *  water slops out, so the next bounce is higher (a higher note, too). Five bounces and it's dry: a
 *  dull clink and no bounce at all. It fills itself again slowly; quickly if there's a tap over it. */
export class Katori extends Entity {
  /** how much has slopped out: 0 full .. N dry */
  k = 0;
  /** bounces without touching the ground in between */
  streak = 0;
  private fillT = 0;
  private ringT = -99;
  tap = false;
  /** seconds per step of refilling (0: never) */
  refill = 2.6;
  static V = [280, 340, 400, 460, 520];
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly r = 13,
    readonly steps = 5,
  ) {
    super();
    this.layer = 1;
  }
  get dry() {
    return this.k >= this.steps;
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    const every = this.tap ? 0.5 : this.refill;
    if (this.k > 0 && every > 0) {
      this.fillT += DT;
      if (this.fillT >= every) {
        this.fillT = 0;
        this.k--;
      }
    } else this.fillT = 0;
    const inside = Math.abs(p.cx - this.x) < this.r - 2;
    if (p.onGround && !(inside && p.y + p.h >= this.floor - 1)) this.streak = 0;
    if (inside && p.vy > 60 && p.y + p.h >= this.floor - 7 && p.y + p.h <= this.floor + 2) {
      this.ringT = w.tick;
      if (this.dry) {
        // nothing in it: clink
        w.sfx('thud', this.x, this.floor);
        this.streak = 0;
        return;
      }
      const v = Katori.V[Math.min(Katori.V.length - 1, this.k)];
      this.k++;
      this.fillT = 0;
      this.streak++;
      w.flags.bounce = { k: this.k, streak: this.streak };
      w.flags.bounces = (w.flags.bounces ?? 0) + 1;
      p.y = this.floor - 7 - p.h;
      p.vy = -v;
      p.launched = true;
      p.onGround = false;
      p.coyoteT = 0;
      w.sfx('win', this.x, this.floor);
      for (let i = 0; i < 4; i++) w.emit('fx', this.x + (i - 1.5) * 5, this.floor - 8, { kind: 'sparkle' });
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const { x, floor, r } = this;
    const ring = Math.max(0, 1 - (w.tick - this.ringT) / 30);
    const wob = Math.sin(w.tick * 0.9) * ring * 1.2;
    // the tap over it, running
    if (this.tap) {
      ctx.fillStyle = '#90A4AE';
      ctx.fillRect(x - 1.5, floor - 60, 3, 8);
      ctx.fillRect(x - 6, floor - 62, 12, 3);
      ctx.fillStyle = 'rgba(160,220,240,0.8)';
      ctx.fillRect(x - 0.8, floor - 52, 1.6, 44);
    }
    // water
    const lvl = 1 - this.k / this.steps;
    if (lvl > 0) {
      ctx.fillStyle = 'rgba(110,200,225,0.9)';
      ctx.beginPath();
      ctx.ellipse(x, floor - 2, (r - 3) * (0.55 + 0.45 * lvl), 2 + 5 * lvl, 0, Math.PI, 0);
      ctx.fill();
    }
    // the bowl: white china (you see in to it), a blue band
    ctx.fillStyle = 'rgba(250,250,250,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + wob, floor - 9, r, 9, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x + wob, floor - 9, r, 9, 0, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - r - 1.5 + wob, floor - 10.5, 3, 3);
    ctx.fillRect(x + r - 1.5 + wob, floor - 10.5, 3, 3);
    ctx.strokeStyle = '#1E88E5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x + wob, floor - 8, r - 1.5, 6.5, 0, 0.25, Math.PI - 0.25);
    ctx.stroke();
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(x - 4, floor - 1.5, 8, 1.5);
    // sound rings
    if (ring > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${ring * 0.8})`;
      ctx.beginPath();
      ctx.ellipse(x, floor - 10, r + (1 - ring) * 12, 4 + (1 - ring) * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

/** A bit of the world Surma Bhopali's stories rearrange: a block that can vanish, appear, grow up
 *  out of the floor, or come down from the roof. */
export class Morph extends Entity {
  solid: Solid;
  private mode: '' | 'grow' | 'drop' = '';
  private left = 0;
  shown: boolean;
  constructor(
    x: number,
    y: number,
    readonly w0: number,
    private h: number,
    shown = true,
    readonly look: 'plank' | 'stone' = 'stone',
  ) {
    super();
    this.layer = 0;
    this.solid = new Solid(x, y, w0, h);
    this.shown = shown;
    this.solid.collidable = shown;
  }
  vanish(w: World) {
    this.shown = false;
    this.solid.collidable = false;
    for (let k = 0; k < 5; k++) w.emit('fx', this.solid.x + (k + 0.5) * (this.w0 / 5), this.solid.y + 3, { kind: 'dust' });
    w.sfx('thud', this.solid.x, this.solid.y);
  }
  appear(w: World) {
    this.shown = true;
    this.solid.collidable = true;
    w.sfx('thud', this.solid.x, this.solid.y);
  }
  /** grow upwards by `px` over about a second */
  grow(pxUp: number) {
    this.mode = 'grow';
    this.left = pxUp;
  }
  /** come down by `px`, fast */
  drop(pxDown: number) {
    this.mode = 'drop';
    this.left = pxDown;
  }
  update(w: World) {
    if (this.left <= 0) return;
    const s = this.solid;
    if (this.mode === 'grow') {
      const d = Math.min(this.left, 2);
      this.left -= d;
      s.moveBy(w, 0, -d);
      this.h += d;
      s.h = this.h;
    } else if (this.mode === 'drop') {
      const d = Math.min(this.left, 3);
      this.left -= d;
      s.moveBy(w, 0, d);
      if (this.left <= 0) w.sfx('thud', s.x, s.y + s.h);
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.shown) return;
    const s = this.solid;
    if (this.look === 'plank') {
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(s.x, s.y, s.w, Math.min(6, s.h));
      ctx.fillStyle = '#5D4037';
      for (let x = s.x + 7; x < s.x + s.w; x += 8) ctx.fillRect(x, s.y, 1, Math.min(6, s.h));
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(s.x, s.y, s.w, 1.2);
      return;
    }
    ctx.fillStyle = '#7A8F74';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = '#A9BC98';
    ctx.fillRect(s.x, s.y, s.w, 3);
    ctx.fillStyle = 'rgba(40,60,40,0.3)';
    for (let y = s.y + 8; y < s.y + s.h; y += 8) ctx.fillRect(s.x, y, s.w, 1);
  }
}

export interface Tale {
  /** told when Dad's middle passes this x */
  at: number;
  say: string;
  /** seconds between the telling and its coming true */
  after?: number;
  then: (w: World) => void;
}
/** Surma Bhopali, on his stool with a paan, telling it the way it never happened. And here, whatever
 *  he says comes true a moment later. With his mouth full he can't say a word. */
export class Surma extends Entity {
  private told = new Set<number>();
  private due: { t: number; f: (w: World) => void }[] = [];
  /** ticks of chewing left */
  chew = 0;
  talk = 0;
  constructor(
    readonly x: number,
    readonly floor: number,
    readonly tales: Tale[],
  ) {
    super();
    this.layer = -1;
  }
  say(w: World, line: string, t = 2) {
    w.say(line, this.x, this.floor - 34, t, 'npc');
    this.talk = Math.round(t * 120);
  }
  update(w: World) {
    if (w.state !== 'play') return;
    if (this.chew > 0) this.chew--;
    if (this.talk > 0) this.talk--;
    const p = w.player;
    this.tales.forEach((tale, i) => {
      if (this.told.has(i) || p.cx < tale.at || this.chew > 0) return;
      this.told.add(i);
      this.say(w, tale.say, 1.8);
      this.due.push({ t: w.tick + Math.round((tale.after ?? 0.7) * 120), f: tale.then });
      w.flags.tales = this.told.size;
    });
    for (const d of this.due.filter((q) => q.t <= w.tick)) d.f(w);
    this.due = this.due.filter((q) => q.t > w.tick);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const { x, floor } = this;
    // stool
    ctx.fillStyle = '#6D4C41';
    ctx.fillRect(x - 6, floor - 8, 12, 2);
    ctx.fillRect(x - 5, floor - 6, 1.5, 6);
    ctx.fillRect(x + 3.5, floor - 6, 1.5, 6);
    // kurta, legs
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(x - 5, floor - 20, 10, 12);
    ctx.fillRect(x - 5, floor - 9, 4, 8);
    ctx.fillRect(x + 1, floor - 9, 4, 8);
    // waistcoat
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(x - 5, floor - 20, 3, 9);
    ctx.fillRect(x + 2, floor - 20, 3, 9);
    // head, cap, the famous moustache
    ctx.fillStyle = '#C68642';
    ctx.fillRect(x - 3.5, floor - 27, 7, 7);
    ctx.fillStyle = '#212121';
    ctx.fillRect(x - 4, floor - 30, 8, 3.5);
    ctx.fillRect(x - 4.5, floor - 23, 9, 1.4);
    ctx.fillRect(x - 5.5, floor - 24, 1.4, 2);
    ctx.fillRect(x + 4.1, floor - 24, 1.4, 2);
    // waving an arm as he talks; chewing otherwise
    const a = this.talk > 0 ? Math.sin(w.tick * 0.25) * 4 : 0;
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(x + 5, floor - 19 - Math.abs(a), 6, 2.5);
    if (this.chew > 0) {
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(x - 1.5, floor - 22 + (Math.sin(w.tick * 0.3) > 0 ? 0 : 1), 3, 2);
    }
  }
}

/** The tiger of the story: across the floor, flat out, once. */
export class Sher extends Entity {
  hazard: Hazard;
  x: number;
  live = false;
  constructor(
    readonly from: number,
    readonly to: number,
    readonly floor: number,
    readonly speed = 210,
  ) {
    super();
    this.layer = 2;
    this.x = from;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'sher',
      hits: (x, y, w2, h2) => self.live && x + w2 > self.x - 10 && x < self.x + 10 && y + h2 > self.floor - 12 && y < self.floor,
    };
  }
  go() {
    this.live = true;
    this.x = this.from;
  }
  update() {
    if (!this.live) return;
    const d = Math.sign(this.to - this.from);
    this.x += d * this.speed * DT;
    if ((this.x - this.to) * d >= 0) this.live = false;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.live) return;
    const d = Math.sign(this.to - this.from);
    ctx.save();
    ctx.translate(this.x, this.floor);
    ctx.scale(d, 1);
    const leg = Math.sin(w.tick * 0.5) * 3;
    ctx.fillStyle = '#F57C00';
    ctx.beginPath();
    ctx.ellipse(0, -7, 11, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(11, -9, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-8 + leg, -4, 2, 4);
    ctx.fillRect(-3 - leg, -4, 2, 4);
    ctx.fillRect(4 + leg, -4, 2, 4);
    ctx.fillRect(8 - leg, -4, 2, 4);
    ctx.fillStyle = '#212121';
    for (let k = -7; k < 8; k += 4) ctx.fillRect(k, -11, 1.5, 5);
    ctx.fillRect(12, -10, 1.2, 1.2);
    ctx.strokeStyle = '#F57C00';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-11, -8);
    ctx.quadraticCurveTo(-17, -12, -15, -16);
    ctx.stroke();
    ctx.restore();
  }
}

/** The poha-wala's iron tawa: from x0 on Dad is carrying it (so BHEL's magnets want him). He can put
 *  it down on a `stand` by standing still there. */
export class Tawa extends Entity {
  has = false;
  down = false;
  stand: number | null = null;
  private stillT = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly floor: number,
  ) {
    super();
    this.layer = 3;
  }
  static carried(w: World) {
    return w.entities.some((e) => e instanceof Tawa && e.has);
  }
  update(w: World) {
    const p = w.player;
    this.has = !this.down && p.cx >= this.x0 && p.cx < this.x1;
    w.flags.tawa = Tawa.carried(w) || this.has;
    if (this.has && this.stand !== null && p.onGround && Math.abs(p.cx - this.stand) < 9 && Math.abs(p.vx) < 6) {
      if (++this.stillT >= 60) {
        this.down = true;
        this.has = false;
        w.flags.tawaDown = true;
        w.sfx('thud', p.cx, p.y);
      }
    } else this.stillT = 0;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const tawa = (x: number, y: number) => {
      ctx.fillStyle = '#263238';
      ctx.beginPath();
      ctx.ellipse(x, y, 7, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#546E7A';
      ctx.fillRect(x - 5, y - 1.6, 10, 1);
      ctx.fillStyle = '#263238';
      ctx.fillRect(x + 6, y - 0.8, 5, 1.6);
    };
    if (this.stand !== null) {
      // a chulha to rest it on
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(this.stand - 8, this.floor - 8, 16, 8);
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(this.stand - 4, this.floor - 5, 8, 5);
      ctx.fillStyle = '#FF7043';
      ctx.fillRect(this.stand - 3, this.floor - 3, 6, 2);
      if (this.down) tawa(this.stand, this.floor - 10);
    }
    if (this.has) tawa(w.player.cx, w.player.y - 3);
  }
}

/** A BHEL shop-floor crane magnet. When it's switched on, anyone under it with iron on him goes
 *  straight up and sticks; it lets go when it's switched off. Some run along a girder. Some have had
 *  their guard taken off (spiked: don't). */
export class Chumbak extends Entity {
  x: number;
  dir = 1;
  on = false;
  stuck = false;
  solid: Solid;
  hangs = 0;
  private onT = 0;
  constructor(
    x: number,
    /** the y of its face (Dad's head when he's stuck to it) */
    readonly y: number,
    readonly o: { every?: number; on?: number; phase?: number; rail?: [number, number]; speed?: number; spiked?: boolean; reach?: number; dwell?: number } = {},
  ) {
    super();
    this.layer = 3;
    this.x = x;
    this.solid = new Solid(x - 6, y + 14, 12, 2);
    this.solid.oneWay = true;
    this.solid.collidable = false;
  }
  onAt(t: number) {
    if (!this.o.every) return true;
    const u = (((t + (this.o.phase ?? 0)) % this.o.every) + this.o.every) % this.o.every;
    return u < (this.o.on ?? this.o.every / 2);
  }
  update(w: World) {
    const p = w.player;
    const t = w.tick * DT;
    this.on = this.onAt(t);
    const r = this.o.rail;
    let dx = 0;
    if (r && this.o.speed) {
      // out along the girder while it's on (after a moment to pick up its load), back while it's off
      this.onT = this.on ? this.onT + DT : 0;
      const want = this.on && this.onT > (this.o.dwell ?? 0.7) ? r[1] : this.on ? this.x : r[0];
      const step = Math.min(Math.abs(want - this.x), this.o.speed * DT);
      dx = Math.sign(want - this.x) * step;
      this.x += dx;
    }
    if (w.state !== 'play') return;
    const s = this.solid;
    const iron = Tawa.carried(w);
    if (!this.on || !iron) {
      if (this.stuck) {
        this.stuck = false;
        s.collidable = false;
        p.stun = 0;
      }
      return;
    }
    const reach = this.o.reach ?? 110;
    if (this.stuck) {
      p.x = Math.round(this.x - p.w / 2);
      p.y = this.y;
      p.xr = 0;
      p.yr = 0;
      p.vx = 0;
      p.vy = 0;
      p.stun = 2;
      s.collidable = true;
      s.place(p.x - 1, p.y + p.h);
      return;
    }
    if (Math.abs(p.cx - this.x) < 14 && p.y >= this.y - 2 && p.y - this.y < reach) {
      // up he goes
      p.vy = -260;
      p.vx = (this.x - p.cx) * 6;
      p.onGround = false;
      p.coyoteT = 0;
      p.launched = true;
      p.stun = 2;
      if (p.y <= this.y + 3) {
        this.stuck = true;
        this.hangs++;
        w.flags.hangs = (w.flags.hangs ?? 0) + 1;
        w.sfx('thud', this.x, this.y);
        if (this.o.spiked) w.die('chipak');
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const { x, y } = this;
    const r = this.o.rail;
    // the girder and the trolley
    ctx.fillStyle = '#FBC02D';
    if (r) ctx.fillRect(r[0] - 12, y - 30, r[1] - r[0] + 24, 4);
    ctx.fillStyle = '#455A64';
    ctx.fillRect(x - 7, y - 32, 14, 7);
    ctx.fillRect(x - 1, y - 25, 2, 13);
    // the magnet: a fat disc, red when live
    ctx.fillStyle = this.on ? '#E53935' : '#78909C';
    ctx.fillRect(x - 10, y - 12, 20, 9);
    ctx.fillStyle = '#B0BEC5';
    ctx.fillRect(x - 11, y - 3, 22, 3);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 6, y - 9, 12, 2);
    if (this.o.spiked) {
      ctx.fillStyle = '#ECEFF1';
      for (let k = -10; k < 10; k += 5) {
        ctx.beginPath();
        ctx.moveTo(x + k, y);
        ctx.lineTo(x + k + 2.5, y + 5);
        ctx.lineTo(x + k + 5, y);
        ctx.fill();
      }
    }
    if (this.on) {
      // its pull, humming downwards
      const reach = this.o.reach ?? 110;
      ctx.strokeStyle = 'rgba(255,120,120,0.35)';
      ctx.lineWidth = 1;
      for (let k = 0; k < 3; k++) {
        const u = ((w.tick * 0.015 + k / 3) % 1) * reach;
        ctx.beginPath();
        ctx.ellipse(x, y + 6 + u, 12 - u * 0.03, 3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }
}
