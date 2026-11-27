// DIS-06: Majuli's bank. The island across the channel is eaten by the river from the water's edge inland, one slab at a time,
// on a clock that starts when Dad passes the trigger. The slab nearest the water goes first, so the far bank you need keeps
// getting farther. A runner is always one slab ahead of the bite; anyone who dawdles finds the bank has retreated.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import { person } from '../../levels/endkit';
import { GROUND, Slab, px } from './entities';

export interface BankDef {
  /** first tile column and width in tiles */
  x: number;
  w: number;
  /** ticks after the trigger at which the river takes it (Infinity: never) */
  t: number;
  /** silt: the slab is not there at first and builds up at `t` (behind a spur, where the current slows) */
  grow?: boolean;
}

export class Bank extends Entity {
  slabs: Slab[] = [];
  started = -1;
  /** the slabs are rebuilt when Dad walks back inland, so nobody is ever stuck */
  constructor(
    readonly defs: BankDef[],
    /** world x (px) Dad passes to start the clock */
    readonly from: number,
    /** world x (px) back of which the bank grows back */
    readonly reset: number,
  ) {
    super();
    this.layer = 0;
  }
  setup(w: World) {
    for (const d of this.defs) {
      const s = new Slab(px(d.x), GROUND, px(d.w), 32, (ctx, sl) => this.paint(ctx, sl, w, d), 0);
      w.add(s);
      this.slabs.push(s);
    }
  }
  clock(w: World) {
    return this.started < 0 ? -1 : w.tick - this.started;
  }
  /** is slab i still there at the clock c (ticks), and how long till it goes */
  left(i: number, c: number) {
    return this.defs[i].t - c;
  }
  update(w: World) {
    const p = w.player;
    if (this.started < 0 && p.cx >= this.from && p.cx < this.from + 48) this.started = w.tick;
    if (this.started >= 0 && p.cx < this.reset && w.state === 'play') this.started = -1;
    const c = this.clock(w);
    this.slabs.forEach((s, i) => {
      const d = this.defs[i];
      s.solid.collidable = d.grow ? c >= d.t : c < 0 || c < d.t;
    });
  }
  private paint(ctx: CanvasRenderingContext2D, sl: Slab, w: World, d: BankDef) {
    const c = this.clock(w);
    if (d.grow) {
      // silt building up: a faint sandy shoal under the water, then the step itself
      const k = c < 0 ? 0 : Math.min(1, Math.max(0, (c - d.t + 90) / 90));
      ctx.fillStyle = '#D9C49A';
      ctx.globalAlpha = 0.25 + 0.75 * k;
      ctx.fillRect(sl.solid.x, GROUND + 14 - 14 * k, sl.solid.w, 18 + 14 * k);
      ctx.globalAlpha = 1;
      return;
    }
    const gone = c >= 0 && c >= d.t;
    const x = sl.solid.x;
    const ww = sl.solid.w;
    if (gone) {
      // the slab slides into the river for a moment before it is gone
      const k = (c - d.t) / 40;
      if (k > 1) return;
      ctx.globalAlpha = 1 - k;
      ctx.fillStyle = '#B79F7A';
      ctx.fillRect(x, GROUND + k * 40, ww, 32);
      ctx.globalAlpha = 1;
      return;
    }
    const warn = c >= 0 && d.t - c < 70;
    const shake = warn ? Math.round(Math.sin(w.tick * 1.3) * 1) : 0;
    ctx.fillStyle = '#B79F7A';
    ctx.fillRect(x + shake, GROUND, ww, 32);
    ctx.fillStyle = '#8D7B68';
    ctx.fillRect(x + shake, GROUND + 18, ww, 14);
    ctx.fillStyle = '#6FA04A';
    ctx.fillRect(x + shake, GROUND, ww, 3);
    ctx.fillStyle = '#4C7A33';
    for (let k = 2; k < ww - 2; k += 6) ctx.fillRect(x + k + shake, GROUND - 2, 1.5, 2);
    if (warn) {
      // the river is at its foot: a dark wet line, and cracks
      ctx.fillStyle = 'rgba(70,60,50,0.55)';
      ctx.fillRect(x + shake, GROUND + 22, ww, 10);
      ctx.strokeStyle = '#4A3C2E';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + ww * 0.3, GROUND + 3);
      ctx.lineTo(x + ww * 0.4, GROUND + 14);
      ctx.lineTo(x + ww * 0.34, GROUND + 24);
      ctx.moveTo(x + ww * 0.7, GROUND + 3);
      ctx.lineTo(x + ww * 0.62, GROUND + 12);
      ctx.stroke();
    }
  }
}

/**
 * The tea boy of the stilt house. He walks along the path, right, once Dad has passed `from`; the stilt house's ladder is
 * let down for him as he reaches `at` and stays down while he is there (`stay` ticks), then it is pulled up again.
 */
export class TeaBoy extends Entity {
  x: number;
  walking = false;
  /** ladder is down */
  down = false;
  t = 0;
  private lowered = false;
  constructor(
    x: number,
    readonly from: number,
    readonly at: number,
    readonly stay = 1200,
    readonly speed = 64,
  ) {
    super();
    this.x = x;
    this.layer = 2;
  }
  update(w: World) {
    if (!this.walking && w.player.cx >= this.from) this.walking = true;
    if (this.walking && this.x < this.at) this.x += this.speed * DT;
    if (this.x >= this.at && !this.lowered) {
      this.lowered = true;
      this.down = true;
      this.t = 0;
      w.sfx('creak', this.at, GROUND - 40);
      w.say('Khyoma koribo. | Excuse me.', this.at, GROUND - 44, 1.8, 'npc');
    }
    if (this.down) {
      this.t++;
      if (this.t > this.stay) this.down = false;
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.walking && this.x === 0) return;
    person(ctx, this.x, GROUND - 24, 24, '#FDF0D5', '#B9855A', { cap: '#C1121F' });
    ctx.fillStyle = '#9AA0A6';
    ctx.fillRect(this.x + 4, GROUND - 14, 9, 2);
    ctx.fillStyle = '#9B2D1F';
    ctx.fillRect(this.x + 5, GROUND - 19, 2.5, 5);
    ctx.fillRect(this.x + 9, GROUND - 19, 2.5, 5);
  }
}
