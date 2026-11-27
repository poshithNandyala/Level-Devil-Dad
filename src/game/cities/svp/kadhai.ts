// Kadhai, the fish-fry stalls of Aberdeen Bazaar (spit-side): the counter is a wall to climb, and the pan spits oil
// over half of it at a time. The cook turns to face the half that is about to spit, and the pan bubbles on that half
// for a moment first. Climb on in the rest, stand on the other half, and change halves when the oil has stopped: the
// two halves take turns, the left and then the right.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { Hurt, FLOOR, px, TAU, type Ctx } from './kit';
import type { Weather } from './s08';

export const TELL = 90;
export const SPIT = 100;
export const REST = 170;
const HALF = TELL + SPIT + REST;
export const CYCLE = HALF * 2;
export type Phase = 'tellL' | 'spitL' | 'restL' | 'tellR' | 'spitR' | 'restR';
const ORDER: [Phase, number][] = [
  ['tellL', TELL],
  ['spitL', SPIT],
  ['restL', REST],
  ['tellR', TELL],
  ['spitR', SPIT],
  ['restR', REST],
];
const TOP = FLOOR - 32;

/** one stall: a counter of two halves, a cook, and a pan; it starts when Dad passes `startX` */
export class Stall extends Entity {
  t = -1;
  readonly left: Hurt;
  readonly right: Hurt;
  private now = 0;
  constructor(
    readonly x0: number,
    readonly startX: number,
    /** the counter is 6 tiles wide */
    readonly wide = 96,
  ) {
    super();
    this.layer = 5;
    const h = this.wide / 2;
    this.left = new Hurt(x0 + 2, TOP - 46, h - 4, 46, 'svp-tel', null);
    this.right = new Hurt(x0 + h + 2, TOP - 46, h - 4, 46, 'svp-tel', null);
    this.left.on = false;
    this.right.on = false;
  }
  install(w: World) {
    w.add(this);
    w.add(this.left);
    w.add(this.right);
    return this;
  }
  /** where in the cycle, and how many ticks of this phase are left */
  get phase(): { name: Phase | 'idle'; left: number } {
    if (this.t < 0) return { name: 'idle', left: 9999 };
    let k = this.t % CYCLE;
    for (const [name, n] of ORDER) {
      if (k < n) return { name, left: n - k };
      k -= n;
    }
    return { name: 'restR', left: 0 };
  }
  update(w: World) {
    this.now = w.tick;
    if (this.t < 0) {
      if (w.player.cx >= this.startX) this.t = 0;
      else return;
    } else this.t++;
    const ph = this.phase.name;
    this.left.on = ph === 'spitL';
    this.right.on = ph === 'spitR';
  }
  draw(ctx: Ctx, w: World) {
    const x0 = this.x0,
      wd = this.wide;
    const ph = this.phase.name;
    const side = ph === 'tellL' || ph === 'spitL' || ph === 'restR' ? 'L' : 'R';
    // the counter's cloth and the cook behind it, turned to the half that spits next
    ctx.fillStyle = '#B3392E';
    ctx.fillRect(x0 - 3, TOP - 2, wd + 6, 4);
    ctx.fillStyle = '#F4ECD6';
    for (let x = x0; x < x0 + wd; x += 16) ctx.fillRect(x, TOP - 2, 8, 4);
    const cx = side === 'L' ? x0 + wd * 0.25 : x0 + wd * 0.75;
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(cx - 5, TOP - 38, 10, 4);
    ctx.fillStyle = '#E8B98A';
    ctx.beginPath();
    ctx.arc(cx, TOP - 28, 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#2B1E16';
    ctx.fillRect(cx + (side === 'L' ? -4 : 1), TOP - 29, 3, 2);
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(cx - 6, TOP - 23, 12, 18);
    // the pan, on the half that is about to spit: bubbles in the tell, spray in the spit
    const px0 = side === 'L' ? x0 + 6 : x0 + wd / 2 + 6;
    const pw = wd / 2 - 12;
    ctx.fillStyle = '#2B2B2E';
    ctx.fillRect(px0, TOP - 7, pw, 5);
    const tell = ph === 'tellL' || ph === 'tellR';
    const spit = ph === 'spitL' || ph === 'spitR';
    if (tell || spit) {
      ctx.fillStyle = tell ? 'rgba(255,200,90,0.9)' : 'rgba(255,170,40,0.95)';
      for (let i = 0; i < 6; i++) {
        const k = (w.tick * (spit ? 3 : 1.4) + i * 11) % 30;
        const bx = px0 + 4 + ((i * 17) % Math.max(8, pw - 8));
        const h = spit ? 6 + k * 1.3 : 2 + k * 0.15;
        ctx.beginPath();
        ctx.arc(bx, TOP - 8 - h, spit ? 2.2 : 1.6, 0, TAU);
        ctx.fill();
      }
    }
    void this.now;
  }
}

/** SVP-08's second act: three stalls along the bazaar, each a wall of counter to climb over */
export const bazaar: Act = {
  id: 'svp08-bazaar',
  w: 64,
  advice: 'The fish-fry stalls: each counter is a wall you have to climb over, and the pan spits oil over half of it at a time. The cook turns to face the half that spits next, and the pan bubbles there first. Climb on while it is quiet, stand on the half that is not spitting, and change halves when the oil has stopped. Left half first, then right.',
  cps: [30],
  paint: (g, c) => {
    const x = c.x;
    for (const s of [4, 24, 44]) g.fill(x + s, x + s + 5, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    // the stalls are in the covered market, dry for any wind
    (w.flags.weather as Weather).porches.push([px(x - 3), px(x + 64)]);
    for (const s of [4, 24, 44]) {
      const st = new Stall(px(x + s), px(x + s - 4)).install(w);
      (w.flags.stalls ??= []).push(st);
    }
  },
};
