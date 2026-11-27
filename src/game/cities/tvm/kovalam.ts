// TVM-09 Kovalam Flags: the lifeguard's two flags mark the safe strip of sand, and he moves them before
// every wave. Whoever stands outside the flags when a wave runs in is taken by the drift.
import { Entity, type Hazard, type World } from '../../world';
import { DT, TILE } from '../../constants';
import { person } from '../../levels/endkit';

const FLOOR = 15 * TILE;
/** the safe strip between the flags, px */
export const STRIP = 4 * TILE;

/** one wave: what starts it, where the lifeguard carries the flags (one walk or more), when it runs in */
export interface WaveSpec {
  /** start when Dad's centre passes this tile x; leave it out to follow the wave before at once */
  at?: number;
  /** each walk: the strip's new left edge (tile x) and how long the walk takes (s) */
  moves: { to: number; sec: number }[];
  /** seconds from the whistle to the wave running in */
  inAt: number;
  /** how long it stays in (s) */
  inFor: number;
}

type State = 'calm' | 'walk' | 'rise' | 'in' | 'fall';

/**
 * A stretch of Kovalam beach (tile x0 to x1) with its lifeguard. Each wave in `waves` starts at its trigger:
 * he blows the whistle, walks the flags to their next place (`moves`), and the wave runs in at `inAt`: for
 * `inFor` seconds the sand outside the flags is the drift (`tvm-drift`). Then it runs out again.
 */
export class Surf extends Entity {
  readonly x0: number;
  readonly x1: number;
  readonly waves: WaveSpec[];
  /** the strip's left edge, px (where the flags stand, or where he's carrying them) */
  strip: number;
  state: State = 'calm';
  i = 0;
  t = 0;
  hazard: Hazard;
  /** the walk in progress: from, to, start, length (s) */
  private walk: { from: number; to: number; t0: number; sec: number } | null = null;
  private mi = 0;
  /** the strip's left edge (px) when this wave's whistle went, if he has moved the flags off it since */
  prev: number | null = null;
  readonly name: string;
  constructor(o: { x0: number; x1: number; strip: number; waves: WaveSpec[]; name?: string }) {
    super();
    this.layer = 2;
    this.x0 = o.x0 * TILE;
    this.x1 = o.x1 * TILE;
    this.strip = o.strip * TILE;
    this.waves = o.waves;
    this.name = o.name ?? 'surf';
    const self = this;
    this.hazard = {
      active: true,
      cause: 'tvm-drift',
      hits(x, y, w, h) {
        if (self.state !== 'in') return false;
        const cx = x + w / 2;
        if (cx < self.x0 || cx > self.x1) return false;
        if (cx >= self.strip && cx <= self.strip + STRIP) return false;
        if (y + h <= FLOOR - 7) return false;
        // the strip the flags stood in before this wave is where the backwash runs out hardest: the rip
        self.hazard.cause = self.prev !== null && cx >= self.prev && cx <= self.prev + STRIP ? 'tvm-rip' : 'tvm-drift';
        return true;
      },
    };
  }
  /** the wave now starting or running, if any */
  get wave(): WaveSpec | undefined {
    return this.waves[this.i];
  }
  /** strip left edge (px) once the current walks are done */
  get target(): number {
    const w = this.wave;
    if (!w || this.state === 'calm') return this.strip;
    return w.moves[w.moves.length - 1].to * TILE;
  }
  /** true while the lifeguard is still carrying flags this wave */
  get walking() {
    return this.walk !== null;
  }
  private startWalk(w: World) {
    const wv = this.wave!;
    const m = wv.moves[this.mi];
    if (!m) {
      this.walk = null;
      return;
    }
    this.walk = { from: this.strip, to: m.to * TILE, t0: this.t, sec: m.sec };
  }
  update(w: World) {
    const wv = this.wave;
    w.flags[this.name] = { state: this.state, i: this.i, strip: this.strip / TILE, walking: this.walking };
    if (!wv) return;
    if (this.state === 'calm') {
      if (wv.at !== undefined && w.player.cx < wv.at * TILE) return;
      this.state = 'walk';
      this.t = 0;
      this.mi = 0;
      this.prev = this.strip;
      this.startWalk(w);
      w.sfx('ding', this.strip + STRIP / 2, FLOOR - 30);
      w.say('Priii! Thira varunnu! | Whistle! A wave is coming!', this.strip + STRIP / 2, FLOOR - 34, 1.2, 'npc');
      return;
    }
    this.t += DT;
    if (this.walk) {
      const k = Math.min(1, (this.t - this.walk.t0) / this.walk.sec);
      this.strip = this.walk.from + (this.walk.to - this.walk.from) * k;
      if (k >= 1) {
        this.strip = this.walk.to;
        this.mi++;
        this.startWalk(w);
      }
    }
    if (this.state === 'walk' && this.t >= wv.inAt - 0.6) this.state = 'rise';
    if (this.state === 'rise' && this.t >= wv.inAt) {
      this.state = 'in';
      w.sfx('splash', (this.x0 + this.x1) / 2, FLOOR);
    }
    if (this.state === 'in' && this.t >= wv.inAt + wv.inFor) this.state = 'fall';
    if (this.state === 'fall' && this.t >= wv.inAt + wv.inFor + 0.45) {
      this.state = 'calm';
      this.i++;
      this.walk = null;
      this.prev = null;
    }
  }
  /** how far the foam has come up the beach, 0..1 */
  private reach(): number {
    const wv = this.wave;
    if (!wv) return 0;
    if (this.state === 'rise') return Math.max(0, 1 - (wv.inAt - this.t) / 0.6);
    if (this.state === 'in') return 1;
    if (this.state === 'fall') return Math.max(0, 1 - (this.t - wv.inAt - wv.inFor) / 0.45);
    return 0;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const tick = w.tick;
    // wet sand along the whole stretch, a darker band where the drift runs
    ctx.fillStyle = 'rgba(120,96,60,0.25)';
    ctx.fillRect(this.x0, FLOOR - 1, this.x1 - this.x0, 3);
    const r = this.reach();
    if (r > 0) {
      const h = 3 + r * 6;
      const segs: [number, number][] = [
        [this.x0, this.strip],
        [this.strip + STRIP, this.x1],
      ];
      for (const [a, b] of segs) {
        if (b <= a) continue;
        const g = ctx.createLinearGradient(0, FLOOR - h, 0, FLOOR + 2);
        g.addColorStop(0, 'rgba(240,250,255,0.95)');
        g.addColorStop(1, 'rgba(70,150,175,0.9)');
        ctx.fillStyle = g;
        ctx.fillRect(a, FLOOR - h, b - a, h + 2);
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        for (let x = a; x < b; x += 6) ctx.fillRect(x, FLOOR - h - 1 + Math.sin(tick * 0.2 + x * 0.3) * 1.2, 3, 1.5);
      }
      // the old strip, if the flags have left it: the rip, darker, running out to sea
      if (this.prev !== null && Math.abs(this.prev - this.strip) >= STRIP) {
        ctx.fillStyle = 'rgba(20,70,95,0.75)';
        ctx.fillRect(this.prev, FLOOR - h, STRIP, h + 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 0.8;
        for (let x = this.prev + 4; x < this.prev + STRIP - 2; x += 10) {
          const o = (tick * 0.8 + x) % 8;
          ctx.beginPath();
          ctx.moveTo(x, FLOOR - h + o);
          ctx.lineTo(x, FLOOR - h + o + 3);
          ctx.stroke();
        }
      }
      // the strip stays dry: the drift runs round the flags
      ctx.fillStyle = 'rgba(255,236,170,0.35)';
      ctx.fillRect(this.strip, FLOOR - 2, STRIP, 2);
    }
    // the flags: red over yellow, the Indian lifeguard's pair
    for (const fx of [this.strip, this.strip + STRIP]) {
      ctx.strokeStyle = '#5D4037';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(fx, FLOOR);
      ctx.lineTo(fx, FLOOR - 26);
      ctx.stroke();
      const wav = Math.sin(tick * 0.15 + fx) * 1.5;
      const dir = fx === this.strip ? 1 : -1;
      ctx.fillStyle = '#E53935';
      ctx.beginPath();
      ctx.moveTo(fx, FLOOR - 26);
      ctx.lineTo(fx + dir * (9 + wav), FLOOR - 25);
      ctx.lineTo(fx, FLOOR - 21);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#FDD835';
      ctx.beginPath();
      ctx.moveTo(fx, FLOOR - 21);
      ctx.lineTo(fx + dir * (9 + wav), FLOOR - 20);
      ctx.lineTo(fx, FLOOR - 16);
      ctx.closePath();
      ctx.fill();
    }
    // the lifeguard: walks with the flags, then stands by the strip with his whistle
    const gx = this.strip + STRIP / 2 + (this.walk ? 0 : 6);
    const bob = this.walk ? Math.abs(Math.sin(tick * 0.4)) * 1.5 : 0;
    person(ctx, gx, FLOOR - 16 - bob, 16, '#E53935', '#8D5524', { cap: '#FDD835', arms: this.walk ? 4 : 0 });
  }
}

/** The door's last stretch: open sand with no flags. Waves run in on a beat once Dad reaches `start`;
 *  in between, the backwash runs out towards the door and carries whoever stands in it. */
export class Backwash extends Entity {
  readonly x0: number;
  readonly x1: number;
  readonly start: number;
  static readonly IN = 1.2;
  static readonly BACK = 1.5;
  static readonly CALM = 0.9;
  static readonly PUSH = 150;
  t = -1;
  hazard: Hazard;
  constructor(tx0: number, tx1: number, startTx: number) {
    super();
    this.layer = 2;
    this.x0 = tx0 * TILE;
    this.x1 = tx1 * TILE;
    this.start = startTx * TILE;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'tvm-drift',
      hits(x, y, w, h) {
        const cx = x + w / 2;
        return self.phase() === 'in' && cx > self.x0 && cx < self.x1 && y + h > FLOOR - 7;
      },
    };
  }
  /** 'calm' (dry sand), 'in' (the wave runs up: the drift), 'back' (it runs back out, carrying you) */
  phase(): 'wait' | 'calm' | 'in' | 'back' {
    if (this.t < 0) return 'wait';
    const P = Backwash.CALM + Backwash.IN + Backwash.BACK;
    const k = this.t % P;
    return k < Backwash.CALM ? 'calm' : k < Backwash.CALM + Backwash.IN ? 'in' : 'back';
  }
  update(w: World) {
    if (this.t < 0) {
      if (w.player.cx >= this.start) this.t = 0;
    } else this.t += DT;
    const ph = this.phase();
    w.flags.backwash = ph;
    const p = w.player;
    if (ph === 'back' && p.onGround && p.cx > this.x0 && p.cx < this.x1) p.pushVx += Backwash.PUSH;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const ph = this.phase();
    ctx.fillStyle = 'rgba(120,96,60,0.25)';
    ctx.fillRect(this.x0, FLOOR - 1, this.x1 - this.x0, 3);
    if (ph === 'in' || ph === 'back') {
      const P = Backwash.CALM + Backwash.IN + Backwash.BACK;
      const k = this.t % P - Backwash.CALM;
      const h = ph === 'in' ? 3 + Math.min(1, k / 0.25) * 6 : 6 * (1 - (k - Backwash.IN) / Backwash.BACK);
      ctx.fillStyle = ph === 'in' ? 'rgba(220,240,250,0.92)' : 'rgba(140,200,215,0.55)';
      ctx.fillRect(this.x0, FLOOR - h, this.x1 - this.x0, h + 2);
      if (ph === 'back') {
        // ripples running out towards the door
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 0.8;
        for (let x = this.x0 + ((w.tick * 2) % 12); x < this.x1; x += 12) {
          ctx.beginPath();
          ctx.moveTo(x, FLOOR - h);
          ctx.lineTo(x + 5, FLOOR - h + 1);
          ctx.stroke();
        }
      }
    }
  }
}
