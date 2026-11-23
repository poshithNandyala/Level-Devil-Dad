// Thiruvananthapuram's own machinery.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT, TILE } from '../constants';
import { overlapXYWH } from '../constants';

/**
 * Thumba: a sounding rocket on its launch rail. When it goes, the exhaust floods the
 * road for a moment, and a little later the spent first stage drops back out of the
 * sky (where a careful dad waits for the fire to die down) and lies there, a log to hop.
 */
/** one spent stage of a Launch: separates `sepAt` s after the launch, falls, and lies where it lands */
interface SpentStage {
  x: number;
  ground: number;
  sepAt: number;
  y: number;
  v: number;
  state: 'up' | 'falling' | 'down';
  solid: Solid;
  hazard: Hazard;
}

export class Launch extends Entity {
  /** the rocket's centre and the ground it stands on */
  readonly x: number;
  readonly ground: number;
  t0 = -1;
  readonly blastSec: number;
  /** the burning stretch of road, px */
  readonly blastX0: number;
  readonly blastX1: number;
  /** the spent stages, in the order they separate: where each comes down (and on what), and when */
  readonly stages: SpentStage[];
  hazard: Hazard;

  /** `stageTx`/`sepAt` is the last stage; `boosters` are stages that separate before it (lower, and sooner) */
  constructor(o: { tx: number; groundTy: number; blast: [number, number]; blastSec?: number; stageTx: number; sepAt?: number; boosters?: { tx: number; groundTy?: number; sepAt: number }[] }) {
    super();
    this.layer = -1;
    this.x = o.tx * TILE + 8;
    this.ground = o.groundTy * TILE;
    this.blastX0 = o.blast[0] * TILE;
    this.blastX1 = (o.blast[1] + 1) * TILE;
    this.blastSec = o.blastSec ?? 1.4;
    const mk = (tx: number, groundTy: number, sepAt: number): SpentStage => {
      const st: SpentStage = { x: tx * TILE, ground: groundTy * TILE, sepAt, y: -60, v: 0, state: 'up', solid: new Solid(tx * TILE, groundTy * TILE - 12, 40, 12), hazard: null as unknown as Hazard };
      st.solid.collidable = false;
      st.hazard = {
        active: true,
        cause: 'crushed',
        hits(x, y, w, h) {
          return st.state === 'falling' && overlapXYWH(x, y, w, h, { x: st.x + 2, y: st.y + 2, w: 36, h: 10 });
        },
      };
      return st;
    };
    this.stages = [...(o.boosters ?? []).map((b) => mk(b.tx, b.groundTy ?? o.groundTy, b.sepAt)), mk(o.stageTx, o.groundTy, o.sepAt ?? 1.5)];
    const self = this;
    this.hazard = {
      active: true,
      cause: 'burnt',
      hits(x, y, w, h) {
        return self.burning && overlapXYWH(x, y, w, h, { x: self.blastX0, y: self.ground - 22, w: self.blastX1 - self.blastX0, h: 22 });
      },
    };
  }

  /** the last stage (the one that falls furthest out) */
  get stage(): 'up' | 'falling' | 'down' {
    return this.stages[this.stages.length - 1].state;
  }

  /** add it to the world (it brings a hazard and a solid for each spent stage) */
  static place(w: World, o: ConstructorParameters<typeof Launch>[0]): Launch {
    const l = w.add(new Launch(o));
    for (const st of l.stages) {
      w.hazards.push(st.hazard);
      w.solids.push(st.solid);
    }
    return l;
  }

  get since() {
    return this.t0 < 0 ? -1 : 0;
  }

  get burning() {
    return this.t0 >= 0 && this.elapsed < this.blastSec;
  }

  private elapsedTicks = 0;
  get elapsed() {
    return this.elapsedTicks * DT;
  }

  fire(w: World) {
    if (this.t0 >= 0) return;
    this.t0 = w.tick;
    this.elapsedTicks = 0;
    w.sfx('boom', this.x, this.ground);
    w.sfx('rumble', this.x, this.ground);
    w.emit('shake', this.x, this.ground, { amount: 5 });
    w.flags.launch = 'fire';
  }

  update(w: World) {
    if (this.t0 < 0) return;
    this.elapsedTicks = w.tick - this.t0;
    const t = this.elapsed;
    if (t >= this.blastSec && w.flags.launch === 'fire') w.flags.launch = 'calm';
    for (const st of this.stages) {
      if (st.state === 'up' && t >= st.sepAt) {
        st.state = 'falling';
        st.y = -60;
        st.v = 60;
        w.sfx('whistle', st.x + 20, 40);
        w.flags.launch = 'stage';
      }
      if (st.state === 'falling') {
        st.v = Math.min(520, st.v + 1400 * DT);
        st.y += st.v * DT;
        if (st.y >= st.ground - 12) {
          st.y = st.ground - 12;
          st.state = 'down';
          st.solid.collidable = true;
          w.sfx('thud', st.x + 20, st.ground);
          w.emit('shake', st.x + 20, st.ground, { amount: 4 });
          w.emit('fx', st.x + 20, st.ground, { kind: 'dust', w: 40 });
          // 'down' once every stage is down
          w.flags.launch = this.stages.every((s2) => s2.state === 'down') ? 'down' : 'stage';
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = this.t0 < 0 ? 0 : this.elapsed;
    const g = this.ground;
    const x = this.x;
    // the launch rail and its tower
    ctx.strokeStyle = '#5A6470';
    ctx.lineWidth = 1;
    const tx = x + 9;
    ctx.beginPath();
    ctx.moveTo(tx, g);
    ctx.lineTo(tx, g - 62);
    ctx.moveTo(tx + 8, g);
    ctx.lineTo(tx + 8, g - 62);
    for (let y = g; y > g - 62; y -= 8) {
      ctx.moveTo(tx, y);
      ctx.lineTo(tx + 8, y - 8);
      ctx.moveTo(tx + 8, y);
      ctx.lineTo(tx, y - 8);
    }
    ctx.stroke();
    ctx.fillStyle = '#3E4650';
    ctx.fillRect(x - 10, g - 4, 30, 4);
    ctx.fillStyle = '#C62828';
    ctx.fillRect(tx - 1, g - 64, 10, 2);
    // the rocket: white, slim, an orange band and fins
    const rise = t <= 0 ? 0 : 0.5 * 300 * t * t;
    const ry = g - 4 - rise;
    if (ry > -80) {
      ctx.save();
      ctx.translate(x, ry);
      ctx.fillStyle = '#F4F1EA';
      ctx.strokeStyle = '#2B2B2B';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-3.5, 0);
      ctx.lineTo(-3.5, -38);
      ctx.quadraticCurveTo(0, -48, 3.5, -38);
      ctx.lineTo(3.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F57C00';
      ctx.fillRect(-3.5, -30, 7, 3);
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(-3.5, -14, 7, 1.6);
      ctx.fillStyle = '#B0BEC5';
      ctx.beginPath();
      ctx.moveTo(-3.5, -8);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-3.5, 0);
      ctx.moveTo(3.5, -8);
      ctx.lineTo(7, 0);
      ctx.lineTo(3.5, 0);
      ctx.fill();
      if (this.t0 >= 0) {
        // the flame under it
        const f = 10 + Math.sin(w.tick * 1.3) * 3 + Math.min(20, t * 30);
        const grad = ctx.createLinearGradient(0, 0, 0, f);
        grad.addColorStop(0, 'rgba(255,250,210,1)');
        grad.addColorStop(0.4, 'rgba(255,170,40,0.95)');
        grad.addColorStop(1, 'rgba(220,60,20,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.quadraticCurveTo(0, f * 1.2, 3, 0);
        ctx.fill();
      }
      ctx.restore();
      // a smoke trail behind it
      if (this.t0 >= 0) {
        for (let i = 0; i < 10; i++) {
          const yy = ry + 8 + i * Math.max(6, rise / 10);
          if (yy > g) break;
          ctx.fillStyle = `rgba(235,232,226,${0.5 - i * 0.04})`;
          ctx.beginPath();
          ctx.arc(x + Math.sin(i * 1.7 + w.tick * 0.05) * 2, yy, 4 + i * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // the blast flooding the road
    if (this.burning) {
      const k = Math.min(1, t / 0.12) * (t > this.blastSec - 0.25 ? (this.blastSec - t) / 0.25 : 1);
      for (let xx = this.blastX0; xx < this.blastX1; xx += 5) {
        const h = (14 + Math.sin(xx * 0.31 + w.tick * 0.7) * 5 + Math.sin(xx * 0.07 - w.tick * 0.4) * 4) * k;
        ctx.fillStyle = `rgba(255,${130 + Math.sin(xx + w.tick) * 40},40,${0.85 * k})`;
        ctx.beginPath();
        ctx.ellipse(xx + 2.5, g - h / 2, 4, h / 2 + 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,240,180,${0.8 * k})`;
        ctx.beginPath();
        ctx.ellipse(xx + 2.5, g - h / 4, 2.4, h / 4 + 1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(90,86,80,${0.35 * k})`;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(this.blastX0 + ((i + 0.5) / 6) * (this.blastX1 - this.blastX0), g - 26 - Math.sin(i + w.tick * 0.05) * 4, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.t0 >= 0 && t < this.blastSec + 2.5) {
      // smoke drifting off the scorched road
      const k = 1 - (t - this.blastSec) / 2.5;
      ctx.fillStyle = `rgba(120,116,110,${0.3 * k})`;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(this.blastX0 + ((i + 0.5) / 5) * (this.blastX1 - this.blastX0), g - 10 - (t - this.blastSec) * 14 - i * 2, 8 + (t - this.blastSec) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // the spent stages
    for (const st of this.stages) {
      if (st.state === 'up') continue;
      const sx = st.x,
        sy = st.y;
      if (st.state === 'falling') {
        for (let i = 1; i < 6; i++) {
          ctx.fillStyle = `rgba(230,226,220,${0.45 - i * 0.07})`;
          ctx.beginPath();
          ctx.arc(sx + 20, sy - i * 9, 5 + i, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#ECE8E0';
      ctx.strokeStyle = '#2B2B2B';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.rect(sx, sy, 40, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F57C00';
      ctx.fillRect(sx + 26, sy, 3, 12);
      ctx.fillStyle = '#5A5A5A';
      ctx.fillRect(sx - 2, sy + 2, 3, 8);
      if (st.state === 'down') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(sx + 1, sy + 12, 38, 1);
      }
    }
  }
}

/**
 * A chunk of a tired flyover: it cracks off the underside as something passes beneath, falls, and bursts
 * into dust on whatever it hits. Deadly on the way down.
 */
export class Slab extends Entity {
  x: number;
  y: number;
  readonly w = 22;
  readonly h = 9;
  private vy = 0;
  alive = true;
  private dust = -1;
  hazard: Hazard;
  constructor(x: number, y: number) {
    super();
    this.layer = 4;
    this.x = x;
    this.y = y;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'crushed',
      hits(x2, y2, w2, h2) {
        return self.dust < 0 && overlapXYWH(x2, y2, w2, h2, { x: self.x + 1, y: self.y + 1, w: self.w - 2, h: self.h - 1 });
      },
    };
  }
  update(w: World) {
    if (this.dust >= 0) {
      if (++this.dust > 30) this.alive = false;
      return;
    }
    this.vy = Math.min(520, this.vy + 1700 * DT);
    this.y += this.vy * DT;
    if (w.solidAt(this.x, this.y + this.h, this.w, 1)) {
      this.dust = 0;
      w.sfx('crack', this.x + this.w / 2, this.y);
      w.emit('shake', this.x, this.y, { amount: 2 });
    }
    if (this.y > 300) this.alive = false;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.dust >= 0) {
      const k = this.dust / 30;
      ctx.fillStyle = `rgba(190,190,185,${0.8 * (1 - k)})`;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(this.x + 2 + i * 4, this.y + this.h - 2 - k * 10 - (i % 2) * 3, 2.5 + k * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }
    ctx.fillStyle = '#9AA0A6';
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + 2);
    ctx.lineTo(this.x + 6, this.y);
    ctx.lineTo(this.x + this.w, this.y + 1);
    ctx.lineTo(this.x + this.w - 2, this.y + this.h);
    ctx.lineTo(this.x + 3, this.y + this.h - 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#6E757C';
    ctx.fillRect(this.x + 5, this.y + 3, 1.5, 1.5);
    ctx.fillRect(this.x + 14, this.y + 5, 2, 1.2);
    ctx.strokeStyle = '#5B4636';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(this.x + 8, this.y + this.h);
    ctx.lineTo(this.x + 9, this.y + this.h + 4);
    ctx.moveTo(this.x + 16, this.y + this.h - 1);
    ctx.lineTo(this.x + 18, this.y + this.h + 3);
    ctx.stroke();
  }
}

/**
 * Fort Kochi's Chinese fishing nets are levers: the net on the sea end, a bundle of granite stones on ropes
 * at the shore end. Net up, stones down. Step off a dipped net and it springs up, and its stones slam down
 * on the bank's edge, right where a short hop lands.
 */
export class Counterweight extends Entity {
  /** left edge and width (px), the bank's surface, how high the bundle hangs when the net is down */
  readonly x: number;
  readonly w: number;
  readonly floor: number;
  readonly lift: number;
  /** 0: hanging up (net in the sea), 1: down on the bank (net up) */
  k = 0;
  private target = 0;
  hazard: Hazard;
  constructor(o: { tx: number; tw: number; floorTy: number; lift: number }) {
    super();
    this.layer = 3;
    this.x = o.tx * TILE;
    this.w = o.tw * TILE;
    this.floor = o.floorTy * TILE;
    this.lift = o.lift;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'crushed',
      hits(x, y, w, h) {
        return self.k > 0.5 && overlapXYWH(x, y, w, h, { x: self.x + 2, y: self.bottom - 16, w: self.w - 4, h: 16 });
      },
    };
  }
  get bottom() {
    return this.floor - (1 - this.k) * this.lift;
  }
  /** slam down (the net springs up) or haul up (the net goes back in the sea) */
  set(down: boolean, w?: World) {
    const t = down ? 1 : 0;
    if (t === this.target) return;
    this.target = t;
    if (down && w) {
      w.sfx('thud', this.x + this.w / 2, this.floor);
      w.emit('shake', this.x, this.floor, { amount: 3 });
    }
  }
  update() {
    // slams down fast, comes up slowly
    this.k = this.target > this.k ? Math.min(1, this.k + DT / 0.12) : Math.max(0, this.k - DT / 0.6);
  }
  draw(ctx: CanvasRenderingContext2D) {
    const b = this.bottom;
    const cx = this.x + this.w / 2;
    // the ropes up to the lever
    ctx.strokeStyle = '#6B5A44';
    ctx.lineWidth = 1;
    for (const dx of [-this.w / 3, 0, this.w / 3]) {
      ctx.beginPath();
      ctx.moveTo(cx + dx * 0.4, 0);
      ctx.lineTo(cx + dx, b - 14);
      ctx.stroke();
    }
    // the stones, lashed together
    const stones: [number, number, number][] = [
      [-0.32, -6, 6],
      [0, -9, 7],
      [0.3, -6, 6],
      [-0.15, -15, 5],
      [0.17, -15, 5],
    ];
    for (const [fx, dy, r] of stones) {
      ctx.fillStyle = '#7D7F84';
      ctx.beginPath();
      ctx.ellipse(cx + fx * this.w, b + dy, r * 1.25, r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.ellipse(cx + fx * this.w - r * 0.4, b + dy - r * 0.4, r * 0.5, r * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = '#5B4A36';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(this.x + 4, b - 10);
    ctx.lineTo(this.x + this.w - 4, b - 10);
    ctx.stroke();
  }
}

/**
 * Monsoon: a blue tarp over a stall front, sagging with rainwater. Come close and the stall-keeper
 * pokes it clear with a stick: it wobbles and dribbles for a moment, then the lot comes down on
 * the road under it. Once only (it's empty after).
 */
export class Tarp extends Entity {
  readonly x0: number;
  readonly x1: number;
  readonly y: number;
  readonly ground: number;
  /** the stretch of road the water comes down on (px) */
  readonly dropX0: number;
  readonly dropX1: number;
  readonly trigger: number;
  static readonly TIP = 0.5;
  static readonly DUMP = 0.45;
  state: 'full' | 'tip' | 'dump' | 'empty' = 'full';
  t = 0;
  hazard: Hazard;
  constructor(o: { tx0: number; tx1: number; ty: number; groundTy: number; drop: [number, number]; triggerTx: number }) {
    super();
    this.layer = 4;
    this.x0 = o.tx0 * TILE;
    this.x1 = o.tx1 * TILE;
    this.y = o.ty * TILE;
    this.ground = o.groundTy * TILE;
    this.dropX0 = o.drop[0] * TILE;
    this.dropX1 = o.drop[1] * TILE;
    this.trigger = o.triggerTx * TILE;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'drenched',
      hits(x, y, w, h) {
        if (self.state !== 'dump') return false;
        const [top, bottom] = self.column();
        return bottom > top && overlapXYWH(x, y, w, h, { x: self.dropX0, y: top, w: self.dropX1 - self.dropX0, h: bottom - top });
      },
    };
  }
  /** the falling water's top and bottom (px), while it dumps */
  column(): [number, number] {
    const y0 = this.y + 10;
    const bottom = Math.min(this.ground, y0 + 600 * this.t);
    const top = this.t < 0.28 ? y0 : Math.min(this.ground, y0 + 700 * (this.t - 0.28));
    return [top, bottom];
  }
  update(w: World) {
    if (this.state === 'full') {
      if (w.player.cx < this.trigger) return;
      this.state = 'tip';
      this.t = 0;
      w.sfx('creak', (this.x0 + this.x1) / 2, this.y);
    } else if (this.state === 'tip') {
      this.t += DT;
      if (this.t >= Tarp.TIP) {
        this.state = 'dump';
        this.t = 0;
        w.sfx('splash', (this.dropX0 + this.dropX1) / 2, this.ground);
        w.say('Ayyo, mazha vellam! | Oops, rainwater!', this.x0 - 6, this.y - 12, 1.3, 'npc');
      }
    } else if (this.state === 'dump') {
      this.t += DT;
      if (this.t >= Tarp.DUMP) this.state = 'empty';
    }
    w.flags.tarp = this.state;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const tick = w.tick;
    // bamboo poles
    ctx.strokeStyle = '#8D6E3F';
    ctx.lineWidth = 1.6;
    for (const x of [this.x0 + 1, this.x1 - 1]) {
      ctx.beginPath();
      ctx.moveTo(x, this.ground);
      ctx.lineTo(x, this.y - 2);
      ctx.stroke();
    }
    // the sag: deep and wobbling while full of water, slack once it's tipped out
    const wob = this.state === 'tip' ? Math.sin(tick * 0.9) * 2.2 : this.state === 'full' ? Math.sin(tick * 0.05) * 0.6 : 0;
    const sag = this.state === 'full' || this.state === 'tip' ? 13 + wob : this.state === 'dump' ? Math.max(-3, 13 - this.t * 80) : 4;
    const mx = (this.x0 + this.x1) / 2;
    ctx.fillStyle = '#2F6FB3';
    ctx.beginPath();
    ctx.moveTo(this.x0 - 2, this.y - 3);
    ctx.quadraticCurveTo(mx, this.y + sag * 2 - 3, this.x1 + 2, this.y - 3);
    ctx.lineTo(this.x1 + 2, this.y);
    ctx.quadraticCurveTo(mx, this.y + sag * 2, this.x0 - 2, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1D4F86';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    if (this.state === 'full' || this.state === 'tip') {
      // the water pooled in it
      ctx.fillStyle = 'rgba(150,205,235,0.85)';
      ctx.beginPath();
      ctx.ellipse(mx, this.y + sag - 4, (this.x1 - this.x0) * 0.28, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // drips: a few while it's tipping, the odd one after
    if (this.state === 'tip' || this.state === 'empty') {
      ctx.fillStyle = 'rgba(160,210,240,0.9)';
      const n = this.state === 'tip' ? 3 : 1;
      for (let i = 0; i < n; i++) {
        const ph = ((tick * 2.2 + i * 23) % 60) / 60;
        ctx.fillRect(mx - 6 + i * 6, this.y + sag + ph * (this.ground - this.y - sag), 1, 2.5);
      }
    }
    if (this.state === 'dump') {
      const [top, bottom] = this.column();
      if (bottom > top) {
        const g = ctx.createLinearGradient(0, top, 0, bottom);
        g.addColorStop(0, 'rgba(170,215,240,0.55)');
        g.addColorStop(1, 'rgba(110,170,210,0.8)');
        ctx.fillStyle = g;
        ctx.fillRect(this.dropX0, top, this.dropX1 - this.dropX0, bottom - top);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.8;
        for (let x = this.dropX0 + 3; x < this.dropX1 - 2; x += 5) {
          const off = (tick * 7 + x * 3) % 14;
          ctx.beginPath();
          ctx.moveTo(x, top + off);
          ctx.lineTo(x, Math.min(bottom, top + off + 9));
          ctx.stroke();
        }
      }
      if (bottom >= this.ground) {
        // the splash on the road
        ctx.fillStyle = 'rgba(190,225,245,0.8)';
        for (let i = 0; i < 5; i++) {
          const k = Math.min(1, (this.t - 0.11) / 0.3);
          ctx.beginPath();
          ctx.arc(this.dropX0 - 4 + i * ((this.dropX1 - this.dropX0 + 8) / 4), this.ground - 2 - k * 6 * (i % 2 ? 1 : 0.6), 2 + k * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

/**
 * A puddle in a dip in the road, drawn just like the tour's shallow ditches (wade those). This one
 * is a monsoon pothole: step in and you're gone.
 */
export class Puddle extends Entity {
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly x1: number,
    cause = 'splash',
  ) {
    super();
    this.layer = 5;
    const self = this;
    const surface = 15 * TILE + 6;
    this.hazard = {
      active: true,
      cause,
      hits(x, y, w, h) {
        return x < self.x1 && x + w > self.x0 && y + h > surface + 4;
      },
    };
  }
  draw(ctx: CanvasRenderingContext2D, w: { tick: number }) {
    const y = 15 * TILE + 6;
    const g = ctx.createLinearGradient(0, y, 0, y + 26);
    g.addColorStop(0, 'rgba(110,190,210,0.7)');
    g.addColorStop(1, 'rgba(40,110,130,0.85)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 0.8;
    for (let x = this.x0 + ((w.tick * 0.3) % 12); x < this.x1 - 4; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, y + 0.5);
      ctx.lineTo(x + 5, y + 0.5);
      ctx.stroke();
    }
  }
}
