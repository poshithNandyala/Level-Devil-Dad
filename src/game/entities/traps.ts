import { Solid } from '../body';
import { DT, ease, EaseName, overlapXYWH, Rect, ROOM_H, ROOM_W, secs, TILE } from '../constants';
import { Entity, Hazard, World } from '../world';
import { drawThing, thingSize, ThingKind } from '../../render/art/things';
import { rr, type Ctx } from '../../render/art/common';

/*
 * The reusable trap kit. Every city builds its tricks from these few pieces:
 * a sprite-drawn solid that can move, fall, hide or hurt (Thing), things that
 * roll (Roller) or fly (Shot), wind (Gust), launch pads (Spring), platforms on a
 * timer (Blinker), a scalding arc (Arc), a cloud that hides things (Cloud) and
 * the hidden collectible in every stage (Collectible).
 * All of them are deterministic: same inputs, same tick, same result.
 */

interface Move {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  t0: number;
  dur: number;
  ease: EaseName;
  then?: (w: World) => void;
}

export interface ThingOpts {
  /** collidable (default true) */
  solid?: boolean;
  /** stand on top only */
  oneWay?: boolean;
  /** touching it kills, with this cause */
  deadly?: string | false;
  /** shrink the deadly box by this many px on every side */
  inset?: number;
  layer?: number;
  flip?: boolean;
  hidden?: boolean;
  label?: string;
  /** override sprite size in px */
  w?: number;
  h?: number;
  slippery?: boolean;
  /** visual bob amplitude in px (sprite only) */
  bob?: number;
  /** colour variant for the sprite */
  tint?: string;
}

/** A sprite-drawn solid: buses, boats, gates, pots, slabs, bollards... */
export class Thing extends Entity {
  readonly kind: ThingKind;
  solid: Solid;
  hazard: Hazard;
  visible = true;
  state: 'rest' | 'shake' | 'move' | 'fall' | 'landed' | 'gone' = 'rest';
  flip: boolean;
  label: string;
  tint: string | undefined;
  /** free animation counter for the sprite (eg. wheels) */
  anim = 0;
  /** sprite variant/phase the level can set (eg. 'open', 'lit') */
  look = '';
  /** animate even when standing still (eg. a dog's tail) */
  spin = false;
  private deadlyCause: string | false;
  private inset: number;
  private move: Move | null = null;
  private shakeUntil = 0;
  private shakeThen: ((w: World) => void) | null = null;
  private fallV = 0;
  private fallG = 1600;
  private fallMax = 640;
  private fallLand = true;
  private fallThen: ((w: World) => void) | null = null;
  private bob: number;
  private baseSolid: boolean;

  constructor(kind: ThingKind, x: number, y: number, o: ThingOpts = {}) {
    super();
    this.kind = kind;
    const [dw, dh] = thingSize(kind);
    this.solid = new Solid(x, y, o.w ?? dw, o.h ?? dh);
    this.solid.oneWay = !!o.oneWay;
    this.solid.slippery = !!o.slippery;
    this.baseSolid = o.solid !== false;
    this.solid.collidable = this.baseSolid && !o.hidden;
    this.visible = !o.hidden;
    this.layer = o.layer ?? 1;
    this.flip = !!o.flip;
    this.label = o.label ?? '';
    this.tint = o.tint;
    this.bob = o.bob ?? 0;
    this.deadlyCause = o.deadly ?? false;
    this.inset = o.inset ?? 2;
    this.hazard = {
      active: !!this.deadlyCause && this.visible,
      cause: this.deadlyCause || 'hit',
      hits: (x2, y2, w2, h2) => {
        const s = this.solid;
        const i = this.inset;
        return this.visible && overlapXYWH(x2, y2, w2, h2, { x: s.x + i, y: s.y + i, w: s.w - 2 * i, h: s.h - 2 * i });
      },
    };
  }

  get x() {
    return this.solid.x;
  }
  get y() {
    return this.solid.y;
  }
  get cx() {
    return this.solid.x + this.solid.w / 2;
  }
  get rect(): Rect {
    return { x: this.solid.x, y: this.solid.y, w: this.solid.w, h: this.solid.h };
  }

  setDeadly(cause: string | false) {
    this.deadlyCause = cause;
    this.hazard.cause = cause || 'hit';
    this.hazard.active = !!cause && this.visible;
  }

  hide() {
    this.visible = false;
    this.solid.collidable = false;
    this.hazard.active = false;
  }

  show() {
    this.visible = true;
    this.solid.collidable = this.baseSolid;
    this.hazard.active = !!this.deadlyCause;
  }

  /** Move by (dx, dy) px over `seconds`, carrying anything standing on it. */
  tween(w: World, dx: number, dy: number, seconds: number, e: EaseName = 'inOut', then?: (w: World) => void) {
    return this.moveTo(w, this.solid.x + dx, this.solid.y + dy, seconds, e, then);
  }

  moveTo(w: World, x: number, y: number, seconds: number, e: EaseName = 'inOut', then?: (w: World) => void) {
    this.move = { sx: this.solid.x, sy: this.solid.y, ex: Math.round(x), ey: Math.round(y), t0: w.tick, dur: Math.max(1, secs(seconds)), ease: e, then };
    this.state = 'move';
    return this;
  }

  /** Walk back and forth by dx px forever (seconds each way, pause at the ends). */
  patrol(w: World, dx: number, seconds: number, pause = 0.3) {
    const go = (sign: number) => {
      this.flip = sign < 0 ? !this.flip : this.flip;
      this.tween(w, sign * dx, 0, seconds, 'inOut', () => w.after(pause, () => go(-sign)));
    };
    go(1);
    return this;
  }

  /** move right now (carrying whoever stands on it); for things driven every tick */
  place(w: World, x: number, y: number) {
    const sl = this.solid;
    const dx = Math.round(x) - sl.x,
      dy = Math.round(y) - sl.y;
    if (dx || dy) sl.moveBy(w, dx, dy);
    this.anim++;
  }

  shake(w: World, seconds: number, then?: (w: World) => void) {
    this.state = 'shake';
    this.shakeUntil = w.tick + secs(seconds);
    this.shakeThen = then ?? null;
    return this;
  }

  /** Drop under gravity; `land` makes it stop on the first solid below and stay as a block. */
  fall(w: World, o: { delay?: number; land?: boolean; g?: number; max?: number; v0?: number; then?: (w: World) => void } = {}) {
    const go = () => {
      this.state = 'fall';
      this.fallV = o.v0 ?? 30;
      this.fallG = o.g ?? 1600;
      this.fallMax = o.max ?? 640;
      this.fallLand = o.land ?? true;
      this.fallThen = o.then ?? null;
    };
    if (o.delay) this.shake(w, o.delay, go);
    else go();
    return this;
  }

  private blockedBelow(w: World) {
    const s = this.solid;
    const was = s.collidable;
    s.collidable = false;
    const hit = !!w.solidAt(s.x, s.y + 1, s.w, s.h);
    s.collidable = was;
    return hit;
  }

  update(w: World) {
    if (this.state === 'move' || this.spin) this.anim++;
    if (this.state === 'shake' && w.tick >= this.shakeUntil) {
      this.state = 'rest';
      const t = this.shakeThen;
      this.shakeThen = null;
      t?.(w);
    } else if (this.state === 'move' && this.move) {
      const m = this.move;
      const k = Math.min(1, (w.tick - m.t0) / m.dur);
      const f = ease[m.ease](k);
      const tx = Math.round(m.sx + (m.ex - m.sx) * f);
      const ty = Math.round(m.sy + (m.ey - m.sy) * f);
      const s = this.solid;
      if (tx !== s.x || ty !== s.y) s.moveBy(w, tx - s.x, ty - s.y);
      if (k >= 1) {
        this.move = null;
        this.state = 'rest';
        m.then?.(w);
      }
    } else if (this.state === 'fall') {
      const s = this.solid;
      this.fallV = Math.min(this.fallV + this.fallG * DT, this.fallMax);
      s.yr += this.fallV * DT;
      let steps = Math.round(s.yr);
      s.yr -= steps;
      while (steps-- > 0) {
        if (this.fallLand && this.blockedBelow(w)) {
          this.state = 'landed';
          s.yr = 0;
          w.sfx('thud', this.cx, s.y + s.h);
          w.emit('fx', this.cx, s.y + s.h, { kind: 'dust', w: s.w });
          w.emit('shake', this.cx, s.y, { amount: 3 });
          const t = this.fallThen;
          this.fallThen = null;
          t?.(w);
          break;
        }
        s.moveBy(w, 0, 1);
      }
      if (s.y > ROOM_H + 40) {
        this.state = 'gone';
        this.hide();
      }
    }
  }

  draw(ctx: Ctx, w: World) {
    if (!this.visible) return;
    const s = this.solid;
    let x = s.x;
    let y = s.y + (this.state === 'fall' ? s.yr : 0);
    if (this.state === 'shake') x += ((w.tick * 7) % 3) - 1;
    if (this.bob) y += Math.sin(w.tick * 0.05) * this.bob;
    drawThing(ctx, this.kind, x, y, s.w, s.h, { t: w.tick, anim: this.anim, flip: this.flip, label: this.label, tint: this.tint, look: this.look, state: this.state });
  }
}

/** Something round that rolls along the ground and hurts: coconuts, vadas, bangles, punugulu. */
export class Roller extends Entity {
  readonly kind: ThingKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  spin = 0;
  hazard: Hazard;
  bounce: number;
  alive = true;
  /** smash on the first wall instead of bouncing back */
  breakOnWall: boolean;
  /** tumble straight through things in the way (still lands on floors) */
  ghost: boolean;

  constructor(kind: ThingKind, x: number, y: number, vx: number, o: { vy?: number; bounce?: number; cause?: string; breakOnWall?: boolean; ghost?: boolean } = {}) {
    super();
    this.kind = kind;
    const [w, h] = thingSize(kind);
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = o.vy ?? 0;
    this.bounce = o.bounce ?? 0;
    this.breakOnWall = !!o.breakOnWall;
    this.ghost = !!o.ghost;
    this.layer = 3;
    const cause = o.cause ?? 'hit';
    this.hazard = {
      active: true,
      cause,
      hits: (x2, y2, w2, h2) => this.alive && overlapXYWH(x2, y2, w2, h2, { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 }),
    };
  }

  update(w: World) {
    if (!this.alive) return;
    this.vy = Math.min(this.vy + 1500 * DT, 600);
    // vertical
    const ny = this.y + this.vy * DT;
    if (this.vy > 0 && w.solidAt(Math.round(this.x), Math.round(ny), this.w, this.h)) {
      // land: snap onto the surface
      let yy = Math.round(this.y);
      while (!w.solidAt(Math.round(this.x), yy + 1, this.w, this.h) && yy < ROOM_H) yy++;
      this.y = yy;
      if (this.bounce && this.vy > 120) {
        this.vy = -this.vy * this.bounce;
        w.sfx('thud', this.x + this.w / 2, this.y + this.h);
      } else this.vy = 0;
    } else this.y = ny;
    // horizontal
    const nx = this.x + this.vx * DT;
    if (!this.ghost && w.solidAt(Math.round(nx), Math.round(this.y) - 1, this.w, this.h)) {
      if (this.breakOnWall) {
        this.alive = false;
        this.hazard.active = false;
        w.emit('fx', this.x + this.w / 2, this.y + this.h, { kind: 'dust' });
        w.sfx('thud', this.x + this.w / 2, this.y + this.h);
        return;
      }
      this.vx = -this.vx * 0.6;
    } else this.x = nx;
    this.spin += (this.vx * DT) / Math.max(4, this.w / 2);
    if (this.x < -40 || this.x > w.W + 40 || this.y > ROOM_H + 40) {
      this.alive = false;
      this.hazard.active = false;
    }
  }

  draw(ctx: Ctx, w: World) {
    if (!this.alive) return;
    drawThing(ctx, this.kind, this.x, this.y, this.w, this.h, { t: w.tick, anim: this.spin, flip: this.vx < 0 });
  }
}

/** A projectile on a straight or ballistic path: baguettes, kites, spat seeds. */
export class Shot extends Entity {
  readonly kind: ThingKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  g: number;
  hazard: Hazard;
  alive = true;
  /** splat on the first floor or wall it meets (fish, fruit), instead of flying through */
  stopOnSolid = false;

  constructor(kind: ThingKind, x: number, y: number, vx: number, vy = 0, g = 0, cause = 'hit') {
    super();
    this.kind = kind;
    const [w, h] = thingSize(kind);
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.g = g;
    this.layer = 4;
    this.hazard = {
      active: true,
      cause,
      hits: (x2, y2, w2, h2) => this.alive && overlapXYWH(x2, y2, w2, h2, { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 }),
    };
  }

  update(w: World) {
    if (!this.alive) return;
    this.vy += this.g * DT;
    this.x += this.vx * DT;
    this.y += this.vy * DT;
    if (this.stopOnSolid && this.vy > 0 && w.solidAt(Math.round(this.x) + 2, Math.round(this.y) + 2, this.w - 4, this.h - 4)) {
      this.alive = false;
      this.hazard.active = false;
      w.emit('fx', this.x + this.w / 2, this.y + this.h, { kind: 'dust' });
      return;
    }
    if (this.x < -60 || this.x > w.W + 60 || this.y > ROOM_H + 60 || this.y < -200) {
      this.alive = false;
      this.hazard.active = false;
    }
  }

  draw(ctx: Ctx, w: World) {
    if (!this.alive) return;
    drawThing(ctx, this.kind, this.x, this.y, this.w, this.h, { t: w.tick, anim: w.tick, flip: this.vx < 0 });
  }
}

export interface Schedule {
  /** seconds per cycle */
  period: number;
  /** seconds the thing is "on" at the start of each cycle */
  on: number;
  /** offset into the cycle at t=0, seconds */
  phase?: number;
}

export function scheduleOn(w: World, s: Schedule): boolean {
  const t = (w.tick * DT + (s.phase ?? 0)) % s.period;
  return t < s.on;
}

/** Seconds until the schedule flips state (for telegraphs). */
export function scheduleLeft(w: World, s: Schedule): number {
  const t = (w.tick * DT + (s.phase ?? 0)) % s.period;
  return t < s.on ? s.on - t : s.period - t;
}

/** Wind: pushes the player sideways inside a zone while it blows. */
export class Gust extends Entity {
  zone: Rect;
  force: number;
  on = false;
  schedule: Schedule | null;
  private streaks: { x: number; y: number; l: number; s: number }[] = [];

  constructor(tx: number, ty: number, tw: number, th: number, force: number, schedule: Schedule | null = null) {
    super();
    this.zone = { x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE };
    this.force = force;
    this.schedule = schedule;
    this.layer = 6;
    for (let i = 0; i < Math.max(6, tw * th * 0.4); i++) {
      this.streaks.push({ x: (i * 97) % this.zone.w, y: (i * 53) % this.zone.h, l: 10 + ((i * 7) % 14), s: 0.8 + ((i * 13) % 10) / 10 });
    }
  }

  update(w: World) {
    const active = this.schedule ? scheduleOn(w, this.schedule) : this.on;
    if (active && !(this as any).was) w.sfx('wind', this.zone.x + this.zone.w / 2, this.zone.y);
    (this as any).was = active;
    if (!active) return;
    const p = w.player;
    if (overlapXYWH(p.x, p.y, p.w, p.h, this.zone)) p.pushVx += this.force;
  }

  draw(ctx: Ctx, w: World) {
    const active = this.schedule ? scheduleOn(w, this.schedule) : this.on;
    const warn = this.schedule && !active && scheduleLeft(w, this.schedule) < 0.6;
    if (!active && !warn) return;
    const dir = Math.sign(this.force) || 1;
    ctx.save();
    ctx.strokeStyle = active ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    const z = this.zone;
    for (const st of this.streaks) {
      const off = ((w.tick * st.s * 3 * dir) % z.w + z.w) % z.w;
      const x = z.x + ((st.x + off) % z.w);
      const y = z.y + st.y + Math.sin((w.tick + st.x) * 0.08) * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - dir * st.l * (active ? 1 : 0.5), y);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** A launch pad: steamer lids, blowholes, biryani lids, chilli sneezes. */
export class Spring extends Entity {
  readonly kind: ThingKind;
  solid: Solid;
  launch: number;
  kickVx: number;
  delay: number;
  once: boolean;
  armed = true;
  private standT = 0;
  private fireTick = -999;
  onFire: ((w: World) => void) | null = null;
  tint?: string;

  constructor(kind: ThingKind, x: number, y: number, launch: number, o: { kickVx?: number; delay?: number; once?: boolean } = {}) {
    super();
    this.kind = kind;
    const [w, h] = thingSize(kind);
    this.solid = new Solid(x, y, w, h);
    this.launch = launch;
    this.kickVx = o.kickVx ?? 0;
    this.delay = o.delay ?? 0;
    this.once = !!o.once;
    this.layer = 1;
  }

  update(w: World) {
    if (!this.armed) return;
    if (w.standing(this.solid) && w.player.vy >= 0) {
      this.standT += DT;
      if (this.standT >= this.delay) {
        const p = w.player;
        p.vy = -this.launch;
        p.vx += this.kickVx;
        p.onGround = false;
        p.launched = true;
        (p as any).jumping = false;
        p.y -= 1;
        this.fireTick = w.tick;
        this.standT = 0;
        w.sfx('boing', this.solid.x + this.solid.w / 2, this.solid.y);
        w.emit('fx', this.solid.x + this.solid.w / 2, this.solid.y, { kind: 'steam' });
        this.onFire?.(w);
        if (this.once) this.armed = false;
      }
    } else this.standT = 0;
  }

  draw(ctx: Ctx, w: World) {
    const s = this.solid;
    const pressed = w.tick - this.fireTick < 10;
    const charging = this.delay > 0 && this.standT > 0;
    drawThing(ctx, this.kind, s.x, s.y, s.w, s.h, { t: w.tick, anim: pressed ? 1 : charging ? this.standT / this.delay : 0, look: this.armed ? '' : 'spent', tint: this.tint });
  }
}

/** A platform on a timer (lighthouse beam, tide rock, blinking sign). */
export class Blinker extends Entity {
  readonly kind: ThingKind;
  solid: Solid;
  schedule: Schedule | null;
  forced: boolean | null = null;
  on = true;
  /** level code sets this to make lit bulbs flicker (a warning) */
  flicker = false;

  constructor(kind: ThingKind, x: number, y: number, schedule: Schedule | null, o: { w?: number; h?: number } = {}) {
    super();
    this.kind = kind;
    const [w, h] = thingSize(kind);
    this.solid = new Solid(x, y, o.w ?? w, o.h ?? h);
    this.solid.oneWay = true;
    this.schedule = schedule;
    this.layer = 1;
  }

  update(w: World) {
    const want = this.forced ?? (this.schedule ? scheduleOn(w, this.schedule) : true);
    if (want !== this.on) {
      this.on = want;
      this.solid.collidable = want;
      if (!want) w.sfx('blink', this.solid.x + this.solid.w / 2, this.solid.y);
    }
  }

  draw(ctx: Ctx, w: World) {
    const s = this.solid;
    const warn = this.on && (this.flicker ? (w.tick >> 2) % 2 === 0 : this.schedule && this.forced === null && scheduleLeft(w, this.schedule) < 0.45);
    drawThing(ctx, this.kind, s.x, s.y, s.w, s.h, { t: w.tick, anim: 0, look: this.on ? (warn ? 'warn' : 'on') : 'off' });
  }
}

/** A scalding stream between two points on a timer (filter-kaapi pour, water spout). */
export class Arc extends Entity {
  ax: number;
  ay: number;
  bx: number;
  by: number;
  height: number;
  schedule: Schedule;
  hazard: Hazard;
  color: string;

  constructor(ax: number, ay: number, bx: number, by: number, height: number, schedule: Schedule, color = '#7A4A2A', cause = 'burnt') {
    super();
    this.ax = ax;
    this.ay = ay;
    this.bx = bx;
    this.by = by;
    this.height = height;
    this.schedule = schedule;
    this.color = color;
    this.layer = 5;
    this.hazard = {
      active: true,
      cause,
      hits: (x, y, w2, h2) => {
        if (!(this as any).liveNow) return false;
        for (let i = 1; i < 12; i++) {
          const [px, py] = this.at(i / 12);
          if (px > x - 3 && px < x + w2 + 3 && py > y - 3 && py < y + h2 + 3) return true;
        }
        return false;
      },
    };
  }

  at(k: number): [number, number] {
    const x = this.ax + (this.bx - this.ax) * k;
    const y = this.ay + (this.by - this.ay) * k - this.height * 4 * k * (1 - k);
    return [x, y];
  }

  update(w: World) {
    (this as any).liveNow = scheduleOn(w, this.schedule);
  }

  draw(ctx: Ctx, w: World) {
    const live = scheduleOn(w, this.schedule);
    const warn = !live && scheduleLeft(w, this.schedule) < 0.5;
    if (!live && !warn) return;
    ctx.save();
    ctx.strokeStyle = live ? this.color : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = live ? 3 : 1;
    ctx.lineCap = 'round';
    if (!live) ctx.setLineDash([3, 4]);
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const [x, y] = this.at(i / 16);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    if (live) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 4; i++) {
        const k = ((w.tick / 40 + i / 4) % 1);
        const [x, y] = this.at(k);
        ctx.beginPath();
        ctx.arc(x, y - 3, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

/** A drifting cloud of steam/smoke that hides what is behind it. */
export class Cloud extends Entity {
  zone: Rect;
  schedule: Schedule | null;
  on = true;
  color: string;

  constructor(tx: number, ty: number, tw: number, th: number, schedule: Schedule | null = null, color = '255,255,255') {
    super();
    this.zone = { x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE };
    this.schedule = schedule;
    this.color = color;
    this.layer = 9;
  }

  draw(ctx: Ctx, w: World) {
    // opacity: fades in and out over a quarter second so the reveal reads as weather, not a switch
    let k = this.on ? 1 : 0;
    if (this.schedule) {
      const s = this.schedule;
      const t = (((w.tick * DT + (s.phase ?? 0)) % s.period) + s.period) % s.period;
      k = t < s.on ? Math.min(1, t / 0.25, (s.on - t) / 0.25) : 0;
    }
    if (k <= 0.01) return;
    const z = this.zone;
    const time = w.tick * DT;
    const img = puffSprite(this.color);
    ctx.save();
    if (!img) {
      ctx.globalAlpha = k * 0.9;
      ctx.fillStyle = `rgb(${this.color})`;
      rr(ctx, z.x + 4, z.y + 4, z.w - 8, z.h - 8, 8);
      ctx.fill();
      ctx.restore();
      return;
    }
    // the bank: soft puffs packed tight enough that whatever is inside is really hidden,
    // with a ragged, slowly breathing edge
    const step = 11;
    const cols = Math.max(1, Math.round(z.w / step)),
      rows = Math.max(1, Math.round(z.h / step));
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < cols; i++) {
        const n = j * 97 + i;
        const edge = i === 0 || j === 0 || i === cols - 1 || j === rows - 1;
        const x = z.x + (i + 0.5) * (z.w / cols) + Math.sin(time * 0.6 + n * 1.3) * 3;
        const y = z.y + (j + 0.5) * (z.h / rows) + Math.cos(time * 0.5 + n * 0.7) * 2;
        const r = (edge ? 10 : 14) + rnd(n, 1) * 7 + Math.sin(time * 0.8 + n) * 1.2;
        ctx.globalAlpha = k * (edge ? 0.55 + rnd(n, 2) * 0.3 : 0.9);
        ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
      }
    // drifting wisps beyond the edges
    const wisps = Math.round((z.w + z.h) / 14);
    for (let i = 0; i < wisps; i++) {
      const u = (rnd(i, 3) + time * 0.02 * (0.4 + rnd(i, 4))) % 1;
      const x = z.x - 10 + u * (z.w + 20);
      const y = z.y + rnd(i, 5) * z.h;
      const r = 12 + rnd(i, 6) * 10;
      ctx.globalAlpha = k * 0.35;
      ctx.drawImage(img, x - r * 1.4, y - r, r * 2.8, r * 2);
    }
    // a soft light on the upper edge gives it body
    const hi = puffSprite('255,255,255')!;
    for (let i = 0; i < Math.round(z.w / 18); i++) {
      const u = (rnd(i, 7) + time * 0.012) % 1;
      const r = 9 + rnd(i, 8) * 8;
      ctx.globalAlpha = k * 0.4;
      ctx.drawImage(hi, z.x + u * z.w - r, z.y + 3 - r * 0.6, r * 2, r * 1.3);
    }
    ctx.restore();
  }
}

const rnd = (i: number, s: number) => {
  const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return v - Math.floor(v);
};
const PUFFS = new Map<string, HTMLCanvasElement>();
/** a soft round puff of mist, pre-rendered once per colour */
function puffSprite(color: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let c = PUFFS.get(color);
  if (c) return c;
  c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${color},1)`);
  gr.addColorStop(0.5, `rgba(${color},0.8)`);
  gr.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  PUFFS.set(color, c);
  return c;
}

/** The hidden extra in every stage. Optional; collecting all of a city's earns its gold stamp. */
export class Collectible extends Entity {
  readonly kind: ThingKind;
  x: number;
  y: number;
  got = false;

  constructor(kind: ThingKind, tx: number, ty: number) {
    super();
    this.kind = kind;
    this.x = tx * TILE + 8;
    this.y = ty * TILE + 8;
    this.layer = 4;
  }

  update(w: World) {
    if (this.got || w.state !== 'play') return;
    const p = w.player;
    if (overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x - 7, y: this.y - 7, w: 14, h: 14 })) {
      this.got = true;
      w.flags.collected = true;
      w.emit('collect', this.x, this.y, { kind: this.kind });
      w.sfx('collect', this.x, this.y);
      w.emit('fx', this.x, this.y, { kind: 'sparkle' });
    }
  }

  draw(ctx: Ctx, w: World) {
    if (this.got) return;
    const bob = Math.sin(w.tick * 0.06) * 2;
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.15 * Math.sin(w.tick * 0.1);
    ctx.fillStyle = '#FFF4C2';
    ctx.beginPath();
    ctx.arc(this.x, this.y + bob, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawThing(ctx, this.kind, this.x - 6, this.y - 6 + bob, 12, 12, { t: w.tick, anim: 0 });
  }
}

/** Pure decor: a tiled back wall behind the play area (subways, shop fronts, fort walls). */
export class Panel extends Entity {
  constructor(
    readonly x: number,
    readonly y: number,
    readonly w: number,
    readonly h: number,
    readonly color: string,
    readonly line: string,
    readonly tile = 8,
  ) {
    super();
    this.layer = -5;
  }

  draw(ctx: Ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = this.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let yy = this.y + this.tile; yy < this.y + this.h; yy += this.tile) {
      ctx.moveTo(this.x, yy + 0.5);
      ctx.lineTo(this.x + this.w, yy + 0.5);
    }
    for (let xx = this.x + this.tile; xx < this.x + this.w; xx += this.tile) {
      ctx.moveTo(xx + 0.5, this.y);
      ctx.lineTo(xx + 0.5, this.y + this.h);
    }
    ctx.stroke();
  }
}

/**
 * A blowhole between sea rocks. Bubbles for a moment as a warning, then fires a
 * tall column of spray. `pulses` are [start, length] pairs inside each period,
 * so one geyser can fire twice in a row.
 */
export class Geyser extends Entity {
  hazard: Hazard;
  private time = 0;
  /** 'fire' draws a stunt flame instead of water */
  fire = false;

  constructor(
    readonly x: number,
    readonly yBase: number,
    readonly height: number,
    readonly period: number,
    readonly pulses: [number, number][],
    readonly warn = 0.35,
    cause = 'splash',
  ) {
    super();
    this.layer = 2;
    this.hazard = {
      active: true,
      cause,
      hits: (x, y, w, h) => this.on && overlapXYWH(x, y, w, h, { x: this.x - 6, y: this.yBase - this.height, w: 12, h: this.height }),
    };
  }

  private phaseAt(t: number) {
    const m = ((t % this.period) + this.period) % this.period;
    let on = false,
      warning = false;
    for (const [s0, len] of this.pulses) {
      const d = (((m - s0) % this.period) + this.period) % this.period;
      if (d < len) on = true;
      const ahead = (((s0 - m) % this.period) + this.period) % this.period;
      if (ahead > 0 && ahead <= this.warn) warning = true;
    }
    return { on, warning };
  }

  get on() {
    return this.phaseAt(this.time).on;
  }

  /** quiet now and for the next `need` seconds (used by the test solver) */
  quietFor(t: number, need: number) {
    for (let k = 0; k <= need + 1e-6; k += 1 / 60) if (this.phaseAt(t + k).on) return false;
    return true;
  }

  get warning() {
    return this.phaseAt(this.time).warning;
  }

  update(w: World) {
    const was = this.on;
    this.time = w.tick * DT;
    if (this.on && !was) w.sfx(this.fire ? 'poof' : 'splash', this.x, this.yBase);
  }

  draw(ctx: Ctx, w: World) {
    const t = w.tick;
    if (this.warning && !this.on) {
      for (let i = 0; i < 4; i++) {
        const bx = this.x - 6 + ((i * 5 + t * 0.4) % 12);
        const by = this.yBase - 2 - ((t * 0.6 + i * 7) % 10);
        ctx.fillStyle = this.fire ? 'rgba(255,170,80,0.85)' : 'rgba(230,248,255,0.85)';
        ctx.beginPath();
        ctx.arc(bx, by, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (!this.on) return;
    const top = this.yBase - this.height;
    for (let yy = this.yBase; yy > top; yy -= 5) {
      const k = (this.yBase - yy) / this.height;
      const r = 7 - k * 2.5 + Math.sin(yy * 0.4 + t * 0.5) * 1.2;
      const dx = Math.sin(yy * 0.13 + t * 0.3) * 2;
      ctx.fillStyle = this.fire ? `rgba(255,${120 + k * 110},${40 + k * 60},${0.92 - k * 0.3})` : `rgba(${200 + k * 40},${235 + k * 15},255,${0.9 - k * 0.25})`;
      ctx.beginPath();
      ctx.arc(this.x + dx, yy, Math.max(2, r), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = this.fire ? 'rgba(255,236,150,0.95)' : 'rgba(255,255,255,0.9)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(this.x + Math.sin(i * 1.7 + t * 0.2) * 9, top + Math.cos(i * 2.3 + t * 0.25) * 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** A cable (ropeway, power line) drawn between two points. Decoration only. */
export class Cable extends Entity {
  constructor(
    readonly ax: number,
    readonly ay: number,
    readonly bx: number,
    readonly by: number,
    readonly color = '#3E3E42',
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: Ctx) {
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(this.ax, this.ay);
    ctx.lineTo(this.bx, this.by);
    ctx.stroke();
  }
}

/** A waterfall stream falling from yTop to yBottom at x; deadly while it flows. `pulses` are [start, seconds] inside each period. */
export class Cascade extends Entity {
  hazard: Hazard;
  private time = 0;
  /** extra width while it roars (set by level code) */
  surge = 0;
  /** level code can hold it on (true) or off (false) */
  forced: boolean | null = null;

  constructor(
    readonly x: number,
    readonly yTop: number,
    readonly yBottom: number,
    readonly width: number,
    readonly period: number,
    readonly pulses: [number, number][],
    readonly warn = 0.4,
    cause = 'splash',
  ) {
    super();
    this.layer = 2;
    this.hazard = {
      active: true,
      cause,
      hits: (x, y, w, h) => this.on && overlapXYWH(x, y, w, h, { x: this.x - this.half + 2, y: this.yTop, w: this.half * 2 - 4, h: this.yBottom - this.yTop }),
    };
  }

  get half() {
    return this.width / 2 + this.surge;
  }

  private phaseAt(t: number) {
    if (this.forced !== null) return { on: this.forced, warning: false };
    const m = ((t % this.period) + this.period) % this.period;
    let on = false,
      warning = false;
    for (const [s0, len] of this.pulses) {
      const d = (((m - s0) % this.period) + this.period) % this.period;
      if (d < len) on = true;
      const ahead = (((s0 - m) % this.period) + this.period) % this.period;
      if (ahead > 0 && ahead <= this.warn) warning = true;
    }
    return { on, warning };
  }

  get on() {
    return this.phaseAt(this.time).on;
  }

  get warning() {
    return this.phaseAt(this.time).warning;
  }

  /** dry now and for the next `need` seconds (used by the test solver) */
  quietFor(t: number, need: number) {
    if (this.forced !== null) return !this.forced;
    for (let k = 0; k <= need + 1e-6; k += 1 / 60) if (this.phaseAt(t + k).on) return false;
    return true;
  }

  update(w: World) {
    const was = this.on;
    this.time = w.tick * DT;
    if (this.on && !was) w.sfx('splash', this.x, this.yBottom);
  }

  draw(ctx: Ctx, w: World) {
    const t = w.tick;
    const h = this.yBottom - this.yTop;
    if (!this.on) {
      // a thin trickle; it thickens just before the water comes
      const k = this.warning ? 2.4 : 1;
      ctx.fillStyle = this.warning ? 'rgba(235,250,255,0.85)' : 'rgba(220,240,255,0.35)';
      ctx.fillRect(this.x - k / 2, this.yTop, k, h);
      if (this.warning) {
        for (let i = 0; i < 5; i++) {
          const yy = this.yTop + ((t * 3 + i * 41) % h);
          ctx.beginPath();
          ctx.arc(this.x + Math.sin(i * 2.1 + t * 0.2) * 3, yy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return;
    }
    const half = this.half;
    const g = ctx.createLinearGradient(this.x - half, 0, this.x + half, 0);
    g.addColorStop(0, 'rgba(190,225,250,0.55)');
    g.addColorStop(0.5, 'rgba(245,252,255,0.95)');
    g.addColorStop(1, 'rgba(190,225,250,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x - half, this.yTop, half * 2, h);
    // streaks rushing down
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1;
    for (let i = 0; i < Math.max(4, half); i++) {
      const xx = this.x - half + 1 + ((i * 7.3) % (half * 2 - 2));
      const yy = this.yTop + ((t * 5 + i * 37) % h);
      ctx.beginPath();
      ctx.moveTo(xx, yy);
      ctx.lineTo(xx, Math.min(this.yBottom, yy + 10));
      ctx.stroke();
    }
    // foam where it lands
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(this.x + Math.sin(i * 1.9 + t * 0.25) * (half + 3), this.yBottom - 2 + Math.cos(i * 2.7 + t * 0.3) * 2, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Something on wheels that rides along the ground and can brake and turn round (bakers, carts). */
export class Rider extends Entity {
  readonly kind: ThingKind;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  hazard: Hazard;
  private spin = 0;
  /** the art faces right (default: faces left) */
  facesRight = false;

  constructor(kind: ThingKind, x: number, yGround: number, vx: number, inset = 5, cause = 'hit') {
    super();
    this.kind = kind;
    const [w, h] = thingSize(kind);
    this.w = w;
    this.h = h;
    this.x = x;
    this.y = yGround - h;
    this.vx = vx;
    this.layer = 3;
    this.hazard = {
      active: true,
      cause,
      hits: (x2, y2, w2, h2) => this.alive && overlapXYWH(x2, y2, w2, h2, { x: this.x + inset, y: this.y + inset, w: this.w - inset * 2, h: this.h - inset }),
    };
  }

  get cx() {
    return this.x + this.w / 2;
  }

  update(w: World) {
    if (!this.alive) return;
    this.x += this.vx * DT;
    this.spin += (this.vx * DT) / 5;
    if (this.x < -80 || this.x > w.W + 80) {
      this.alive = false;
      this.hazard.active = false;
    }
  }

  draw(ctx: Ctx, w: World) {
    if (!this.alive) return;
    drawThing(ctx, this.kind, this.x, this.y, this.w, this.h, { t: w.tick, anim: Math.abs(this.spin), flip: this.facesRight ? this.vx < 0 : this.vx > 0 });
  }
}
