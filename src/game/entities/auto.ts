import { approach, DT, PHYS, Rect } from '../constants';
import { Entity, ExitLike, World } from '../world';
import { drawAuto } from '../../render/art/vehicles';
import { Ctx } from '../../render/art/common';

export type AutoMode = 'copy' | 'shy' | 'parked';

export interface AutoLines {
  flee?: string;
  stuck?: string;
  board?: string;
  shy?: string;
  come?: string;
}

/**
 * Hyderabad's signature: an auto-rickshaw that *is* the exit, and that
 * responds to how you move.
 *  - copy: drives the way you walk, but faster (walk away to get picked up)
 *  - shy:  only creeps toward you while you are looking away
 */
export class Auto extends Entity {
  x: number;
  y: number;
  readonly w = 40;
  readonly h = 30;
  mode: AutoMode;
  gain = 1.6;
  shySpeed = 105;
  minX: number;
  maxX: number;
  vx = 0;
  wheel = 0;
  facing: 1 | -1;
  lines: AutoLines;
  private said = new Set<string>();
  private wasMoving = false;
  private stuckTicks = 0;
  exitTag = false;
  /** long stages: instead of ending the stage, it gives you a ride to here (px) and drops you off */
  rideTo: number | null = null;
  rideLine = 'Utro, miya! | Hop out, buddy!';
  private riding: 'no' | 'in' | 'done' = 'no';
  accel: number | null = null;
  vy = 0;
  fell = false;
  exit: ExitLike;

  constructor(x: number, groundY: number, mode: AutoMode, opts: { minX?: number; maxX?: number; facing?: 1 | -1; lines?: AutoLines; gain?: number } = {}) {
    super();
    this.layer = 1;
    this.x = x;
    this.y = groundY - this.h;
    this.mode = mode;
    this.minX = opts.minX ?? 0;
    this.maxX = opts.maxX ?? 512 - this.w;
    this.facing = opts.facing ?? -1;
    this.lines = opts.lines ?? {};
    if (opts.gain) this.gain = opts.gain;
    const self = this;
    this.exit = {
      zone(): Rect | null {
        if (self.fell || self.riding !== 'no') return null;
        return { x: self.x + 3, y: self.y + 4, w: self.w - 6, h: self.h - 4 };
      },
      reach(w: World) {
        self.speak(w, 'board', self.lines.board ?? 'Baitho!');
        if (self.rideTo === null) {
          w.win('auto');
          return;
        }
        // hop in: a ride to the next bit of the stage
        self.riding = 'in';
        self.facing = Math.sign(self.rideTo - self.x) >= 0 ? 1 : -1;
        w.player.hidden = true;
        w.player.stun = 1 << 30;
        w.flags.autoRide = 1;
        w.sfx('honk', self.cx, self.y);
      },
    };
  }

  get cx() {
    return this.x + this.w / 2;
  }

  /** Is the player looking toward the auto? */
  looked(w: World): boolean {
    const p = w.player;
    return p.facing === Math.sign(this.cx - p.cx);
  }

  private anchor = () => ({ x: this.x + this.w / 2, y: this.y - 8 });

  speak(w: World, key: string, line?: string) {
    if (!line || this.said.has(key)) return;
    this.said.add(key);
    w.say(line, this.x + this.w / 2, this.y - 8, 1.8, 'npc', this.anchor);
  }

  update(w: World) {
    if (this.riding === 'in' && this.rideTo !== null && w.state === 'play') {
      const dir = Math.sign(this.rideTo - this.x) || 1;
      this.vx = approach(this.vx, 230 * dir, 700 * DT);
      this.x += this.vx * DT;
      this.wheel += (this.vx * DT) / 3.6;
      const p = w.player;
      p.x = Math.round(this.cx - p.w / 2);
      p.y = this.y + this.h - p.h;
      p.vx = 0;
      p.vy = 0;
      if ((dir > 0 && this.x >= this.rideTo) || (dir < 0 && this.x <= this.rideTo)) {
        this.x = this.rideTo;
        this.vx = 0;
        this.riding = 'done';
        p.x = Math.round(this.x + (this.facing > 0 ? this.w + 2 : -p.w - 2));
        p.hidden = false;
        p.stun = 0;
        w.flags.autoRide = 2;
        w.say(this.rideLine, this.cx, this.y - 8, 1.8, 'npc');
      }
      return;
    }
    if (this.riding === 'done') {
      // and off it goes, on up the road
      this.vx = approach(this.vx, 300 * this.facing, 600 * DT);
      this.x += this.vx * DT;
      this.wheel += (this.vx * DT) / 3.6;
      if (this.x < -80 || this.x > w.W + 80) this.alive = false;
      return;
    }
    if (w.state === 'won' && w.winVia === 'auto') {
      const out = this.facing;
      this.vx = approach(this.vx, 300 * out, 700 * DT);
      this.x += this.vx * DT;
      this.wheel += (this.vx * DT) / 3.6;
      return;
    }
    let target = 0;
    if (w.state === 'play') {
      const p = w.player;
      if (this.mode === 'copy') {
        const dir = (w.input.right ? 1 : 0) - (w.input.left ? 1 : 0);
        target = this.gain * PHYS.maxRun * dir;
      } else if (this.mode === 'shy') {
        if (!this.looked(w)) target = Math.sign(p.cx - this.cx) * this.shySpeed;
      }
    }
    const accel = this.accel ?? (this.mode === 'copy' ? 1500 : 800);
    this.vx = approach(this.vx, target, accel * DT);
    const prevX = this.x;
    this.x += this.vx * DT;
    // cartoon physics: an auto with no road under it drops
    const supported = this.fell ? false : !!w.solidAt(this.x + 6, this.y + this.h, this.w - 12, 1);
    if (!supported) {
      this.fell = true;
      this.vy = Math.min(this.vy + 1400 * DT, 500);
      this.y += this.vy * DT;
      this.vx *= 0.98;
      return;
    }
    if (this.x < this.minX) {
      this.x = this.minX;
      this.vx = 0;
    }
    if (this.x > this.maxX) {
      this.x = this.maxX;
      this.vx = 0;
    }
    const moved = this.x - prevX;
    this.wheel += moved / 3.6;
    const moving = Math.abs(moved) > 0.01;
    if (w.state === 'play') {
      if (target !== 0 && !moving) {
        this.stuckTicks++;
        if (this.stuckTicks === 20) this.speak(w, 'stuck', this.lines.stuck);
      } else this.stuckTicks = 0;
      if (moving && !this.wasMoving) {
        const away = Math.sign(moved) === Math.sign(this.cx - w.player.cx);
        if (away) this.speak(w, 'flee', this.lines.flee);
        else this.speak(w, 'come', this.lines.come);
        if (this.mode === 'copy') w.sfx('honk', this.cx, this.y);
      }
      if (this.mode === 'shy' && this.looked(w) && this.wasMoving && !moving) this.speak(w, 'shy', this.lines.shy);
    }
    this.wasMoving = moving;
  }

  draw(ctx: Ctx, w: World) {
    const shyHide = this.mode === 'shy' && w.state === 'play' && this.looked(w);
    const engine = Math.sin(w.tick * 0.9) * 0.25;
    drawAuto(ctx, this.x, this.y, {
      facing: this.facing,
      wheel: this.wheel,
      driver: w.state === 'won' ? 'happy' : shyHide ? 'shy' : 'normal',
      bounce: engine,
      passenger: w.state === 'won' && w.winVia === 'auto',
      exitTag: this.exitTag,
    });
  }
}
