// Khula, the lift bridge at the harbour (opening-bridge): the road crosses the channel on a deck that is level with
// the road while the channel is shut. When a ship wants to pass, the lights on the posts flash and the bell goes, and
// the deck lifts clear of the road, with whatever is on it. It stays up while the ship goes by, comes down again, and
// the lights go green. The gap under it is the channel. Cross while the lights are green, and not when they flash.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, Plat, FLOOR, px, TAU, type Ctx } from './kit';

export const DOWN = 420;
export const WARN = 90;
export const UP = 540;
export const LIFT = 90;
const HIGH = 96;
const CYCLE = DOWN + WARN + LIFT + UP + LIFT;
export type Lamp = 'green' | 'flash' | 'red';

/** a bridge: deck, lights, the channel under it, and the shape of the deck that makes it deadly while it moves */
export class LiftBridge extends Entity {
  deck: Plat;
  t = -1;
  private readonly hurt: Hurt;
  private now = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    /** the bridge begins its first cycle when Dad passes `startX` */
    readonly startX: number,
    /** ticks into the cycle it starts at (so the first one is not always the same) */
    readonly offset = 0,
  ) {
    super();
    this.layer = 1;
    this.deck = new Plat(x0, FLOOR, x1 - x0, 8, (ctx, q) => this.drawDeck(ctx, q));
    this.hurt = new Hurt(x0, FLOOR - 36, x1 - x0, 36, 'svp-khula', null);
    this.hurt.on = false;
  }
  install(w: World) {
    w.add(this);
    w.add(this.deck);
    w.add(this.hurt);
    w.add(new Hurt(this.x0, FLOOR + 14, this.x1 - this.x0, 40, 'svp-khula', null));
    w.add(new Fx(null, (ctx, w2) => this.drawChannel(ctx, w2), 5));
    return this;
  }
  /** the stage of the cycle and how many ticks of it are left */
  get phase(): { name: 'down' | 'warn' | 'rise' | 'up' | 'fall' | 'idle'; left: number } {
    if (this.t < 0) return { name: 'idle', left: 9999 };
    let k = (this.t + this.offset) % CYCLE;
    for (const [name, n] of [['down', DOWN], ['warn', WARN], ['rise', LIFT], ['up', UP], ['fall', LIFT]] as const) {
      if (k < n) return { name, left: n - k };
      k -= n;
    }
    return { name: 'down', left: 0 };
  }
  get lamp(): Lamp {
    const n = this.phase.name;
    return n === 'down' || n === 'idle' ? 'green' : n === 'warn' ? 'flash' : 'red';
  }
  update(w: World) {
    this.now = w.tick;
    if (this.t < 0) {
      if (w.player.cx >= this.startX) this.t = 0;
      else return;
    } else this.t++;
    const ph = this.phase;
    let k = 0;
    if (ph.name === 'rise') k = 1 - ph.left / LIFT;
    else if (ph.name === 'up') k = 1;
    else if (ph.name === 'fall') k = ph.left / LIFT;
    const y = Math.round(FLOOR - HIGH * k);
    const dy = y - this.deck.y;
    if (dy) this.deck.solid.moveBy(w, 0, dy);
    // anyone on the deck while it moves, or while it is up, is in the way of the ship
    this.hurt.y = this.deck.y - 36;
    this.hurt.on = ph.name === 'rise' || ph.name === 'up' || ph.name === 'fall';
    if (ph.name === 'warn' && ph.left === WARN - 1) w.sfx('thud', this.x0, FLOOR - 40);
  }
  private drawDeck(ctx: Ctx, q: Plat) {
    ctx.fillStyle = '#5A6770';
    ctx.fillRect(q.x, q.y, q.w, 6);
    ctx.fillStyle = '#7C8A92';
    ctx.fillRect(q.x, q.y, q.w, 2);
    ctx.fillStyle = '#F6E27F';
    for (let x = q.x + 4; x < q.x + q.w - 8; x += 24) ctx.fillRect(x, q.y + 2, 10, 2);
    ctx.fillStyle = '#3F4A52';
    ctx.fillRect(q.x, q.y + 6, q.w, 3);
  }
  private drawChannel(ctx: Ctx, w: World) {
    const { x0, x1 } = this;
    const g = ctx.createLinearGradient(0, FLOOR + 10, 0, FLOOR + 48);
    g.addColorStop(0, 'rgba(70,170,190,0.9)');
    g.addColorStop(1, 'rgba(18,90,110,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, FLOOR + 12, x1 - x0, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.8;
    for (let x = x0 + ((w.tick * 0.3) % 14); x < x1 - 6; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR + 12.5);
      ctx.lineTo(x + 6, FLOOR + 12.5);
      ctx.stroke();
    }
    // the towers and their lights, either side of the channel
    const lamp = this.lamp;
    const on = lamp === 'flash' ? (w.tick >> 3) % 2 === 0 : true;
    for (const tx of [x0 - 10, x1 + 4]) {
      ctx.fillStyle = '#3F4A52';
      ctx.fillRect(tx, FLOOR - 70, 6, 70);
      ctx.fillStyle = '#2B1E16';
      ctx.fillRect(tx - 3, FLOOR - 84, 12, 14);
      ctx.fillStyle = lamp === 'green' ? '#3DDC6B' : on ? '#FF4A3A' : '#5A1E18';
      ctx.beginPath();
      ctx.arc(tx + 3, FLOOR - 77, 4, 0, TAU);
      ctx.fill();
    }
    // the ship that passes while the deck is up
    const ph = this.phase;
    if (ph.name === 'up') {
      const k = 1 - ph.left / UP;
      const sx = x0 - 140 + (x1 - x0 + 280) * k;
      ctx.fillStyle = '#B3392E';
      ctx.fillRect(sx, FLOOR + 6, 120, 12);
      ctx.fillStyle = '#F4ECD6';
      ctx.fillRect(sx + 20, FLOOR - 8, 50, 14);
      ctx.fillStyle = '#3F4A52';
      ctx.fillRect(sx + 50, FLOOR - 20, 8, 12);
    }
  }
}

/** SVP-07's fourth act: three lift bridges across the harbour channels, a plain stretch between each */
export const khula: Act = {
  id: 'svp07-khula',
  w: 66,
  advice: 'The harbour road crosses its channels on lift bridges. When a ship wants to pass the lights on the posts flash and the bell rings, and the deck lifts clear of the road, with whatever is on it. Cross while the lights are green, and not once they flash: wait on the road for the green.',
  cps: [24, 46],
  paint: (g, c) => {
    const x = c.x;
    for (const s of [6, 26, 46]) g.pit(x + s, x + s + 8);
  },
  build: (w, c) => {
    const x = c.x;
    [6, 26, 46].forEach((s, i) => {
      const b = new LiftBridge(px(x + s), px(x + s + 9), px(x + s - 6), i * 170).install(w);
      (w.flags.bridges ??= []).push(b);
    });
  },
};
