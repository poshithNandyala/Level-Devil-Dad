// The Bengaluru auto: a ride that moves. Stopped, its open side lets Dad in; moving
// towards him, its bumper knocks him flat. Each room gives it different manners.
import { clamp, DT, ease, Rect, TILE } from '../game/constants';
import { Entity, ExitLike, Hazard, World } from '../game/world';

export const AUTO_W = 46;

export class AutoRide extends Entity {
  /** left end of the body (px) and the road it drives on */
  x: number;
  floor: number;
  /** px/s this tick (+ right, - left) */
  vx = 0;
  facing: 1 | -1 = 1;
  /** will it take him? (a stopped auto with a willing driver) */
  willing = true;
  /** pulling up beside him on purpose: it won't knock him over */
  gentle = false;
  boardTick = -1;
  /** how far it has driven off after he got in (drawing) */
  away = 0;
  /** honk this tick (for the drawing) */
  honkTick = -999;
  private tw: { from: number; to: number; t0: number; dur: number; e: keyof typeof ease; then?: (w: World) => void } | null = null;
  /** a per-tick brain set by the room (runs when no drive is in progress) */
  brain: ((w: World, a: AutoRide) => void) | null = null;
  exit: ExitLike;
  hazard: Hazard;
  /** the room's right and left limits for the body */
  minX = 3 * TILE;
  maxX = 29 * TILE - AUTO_W;

  constructor(x: number, floor: number) {
    super();
    this.layer = -2;
    this.x = x;
    this.floor = floor;
    const self = this;
    this.exit = {
      zone(): Rect | null {
        if (!self.willing || Math.abs(self.vx) >= 1 || self.boardTick >= 0) return null;
        // a little wider than the open side: if he's touching the doorway, he's in
        return { x: self.x + (self.facing > 0 ? 4 : 16), y: self.floor - 22, w: 26, h: 22 };
      },
      reach(w: World) {
        self.boardTick = w.tick;
        w.player.hidden = true;
        w.win('ride');
      },
    };
    // the end that's moving into him knocks him over (pulling up gently, it doesn't)
    this.hazard = {
      active: true,
      cause: 'auto',
      hits: (x, y, ww, h) => {
        if (Math.abs(this.vx) < 30 || this.boardTick >= 0 || this.gentle) return false;
        const cx = x + ww / 2;
        if (!(x < this.x + AUTO_W - 2 && x + ww > this.x + 2 && y < this.floor && y + h > this.floor - 26)) return false;
        return this.vx > 0 ? cx > this.x + AUTO_W / 2 - 4 : cx < this.x + AUTO_W / 2 + 4;
      },
    };
  }

  /** drive to x over `seconds` */
  drive(w: World, to: number, seconds: number, e: keyof typeof ease = 'inOut', then?: (w: World) => void) {
    to = clamp(to, this.minX, this.maxX);
    this.tw = { from: this.x, to, t0: w.tick, dur: Math.max(1, Math.round(seconds * 120)), e, then };
    w.sfx('honk', this.x + AUTO_W / 2, this.floor - 10);
    this.honkTick = w.tick;
  }

  get moving() {
    return this.tw !== null;
  }

  update(w: World) {
    const x0 = this.x;
    if (this.boardTick >= 0) {
      if (w.tick > this.boardTick + 20) this.away += DT * 140 * Math.min(3, (w.tick - this.boardTick - 20) / 30);
      this.vx = 0;
      return;
    }
    if (this.tw) {
      const t = Math.min(1, (w.tick - this.tw.t0) / this.tw.dur);
      this.x = this.tw.from + (this.tw.to - this.tw.from) * ease[this.tw.e](t);
      if (t >= 1) {
        const then = this.tw.then;
        this.tw = null;
        then?.(w);
      }
    } else if (this.brain && w.state === 'play') this.brain(w, this);
    this.x = clamp(this.x, this.minX, this.maxX);
    this.vx = (this.x - x0) / DT;
  }

  /** move by up to `speed` px/s towards x this tick (for brains) */
  steer(to: number, speed: number) {
    const d = clamp(to, this.minX, this.maxX) - this.x;
    this.x += Math.sign(d) * Math.min(Math.abs(d), speed * DT);
  }
}

export function auto(w: World, tx: number, floorRow = 14): AutoRide {
  return w.add(new AutoRide(tx * TILE, floorRow * TILE));
}
