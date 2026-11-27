// Kolkata's own entities: one class per mechanic (update, draw, solids, hazards).
// Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6). Timers count ticks from a trigger
// Dad sets off (his position), so a respawn replay always meets the same thing at the same moment.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { person, text } from '../../levels/endkit';
import { rr } from '../../../render/art/common';

export const FLOOR = 15 * TILE;
const px = (t: number) => t * TILE;

/** Dad's jump state, shared by the rules that care how he came down: did he leave the ground by a jump? */
export class Feet extends Entity {
  jumped = false;
  private lastGround = -1;
  update(w: World) {
    const p = w.player;
    if (p.onGround) {
      this.lastGround = w.tick;
      return;
    }
    if (p.jumpTick >= this.lastGround) this.jumped = true;
  }
  /** call when Dad lands: true if this landing came from a jump; resets */
  landedFromJump() {
    const j = this.jumped;
    this.jumped = false;
    return j;
  }
}
export const feet = (w: World): Feet => (w.flags.ccuFeet ??= w.add(new Feet()));

// ================================================================== CCU-02: the bus that never stops
export interface BusSpec {
  /** the footboard's left edge at the start (px) */
  x: number;
  /** crawl ("aaste!") while the footboard's left edge is inside these [x0, x1) ranges, px */
  slow?: [number, number][];
  /** full speed and crawl speed, px/s */
  fast?: number;
  crawl?: number;
  /** it pulls away once this is true (default: at once) */
  go?: (w: World) => boolean;
  /** turns off into the depot lane here (px): gone */
  end: number;
  /** what the conductor shouts as it crawls */
  shout?: string;
  /** what he shouts as it goes by full tilt */
  call?: string;
  label?: string;
  /** not there at all (drawn or solid) until it sets off */
  hidden?: boolean;
}
/**
 * A Kolkata private bus, seen side-on, and its footboard (a one-way step at the door). It never stops: it
 * only crawls where the conductor shouts "aaste!". Step off it at speed and you go flying; step off going
 * backwards and you go over; step off forward at a crawl and you're fine. Hop on to it at full speed and you
 * can't hold on.
 */
export class Bus extends Entity {
  x: number;
  v = 0;
  deck: Solid;
  solids: Solid[];
  gone = false;
  started = false;
  slowed = false;
  private riding = false;
  private left: { v: number; back: boolean } | null = null;
  private said = -999;
  private called = false;
  private wasSlow = false;
  constructor(readonly o: BusSpec) {
    super();
    this.layer = 2;
    this.x = o.x;
    this.deck = new Solid(o.x, FLOOR - 9, 26, 4);
    this.deck.oneWay = true;
    this.deck.velX = 0;
    if (o.hidden) this.deck.collidable = false;
    this.solids = [this.deck];
  }
  get fast() {
    return this.o.fast ?? 120;
  }
  get crawl() {
    return this.o.crawl ?? 22;
  }
  crawling() {
    return (this.o.slow ?? []).some(([a, b]) => this.x >= a && this.x < b);
  }
  update(w: World) {
    const p = w.player;
    if (!this.started && (this.o.go ? this.o.go(w) : true)) {
      this.started = true;
      if (this.o.hidden) this.deck.collidable = true;
    }
    if (!this.gone && this.started) {
      const want = this.crawling() || this.slowed ? this.crawl : this.fast;
      const a = 260 * DT;
      this.v = this.v < want ? Math.min(want, this.v + a) : Math.max(want, this.v - a);
      const slow = this.crawling() || this.slowed;
      if (slow) {
        // one shout each time it starts to crawl
        if (!this.wasSlow && w.tick - this.said > 240 && this.o.shout !== '') {
          this.said = w.tick;
          w.say(this.o.shout ?? 'Aaste! Aaste! | Slowly! Slowly!', this.x + 40, FLOOR - 52, 1.6, 'npc');
        }
      } else if (this.o.call && !this.called && Math.abs(this.x - p.cx) < 120) {
        this.called = true;
        w.say(this.o.call, this.x + 40, FLOOR - 52, 1.6, 'npc');
      }
      this.wasSlow = slow;
      this.deck.velX = this.v;
      this.deck.moveBy(w, this.v * DT, 0);
      this.x = this.deck.x;
      if (this.x > this.o.end) {
        this.gone = true;
        this.deck.collidable = false;
        this.deck.velX = 0;
      }
    }
    // the footboard's rules
    const on = !this.gone && this.deck.collidable && p.isRiding(this.deck) && p.onGround;
    if (on && !this.riding && this.v > 50) {
      w.die('ccu-gir');
      return;
    }
    if (this.riding && !on && w.state === 'play') this.left = { v: this.v, back: p.vx < -4 || (w.input.left && !w.input.right) };
    this.riding = on;
    if (this.left && p.onGround && !on) {
      const l = this.left;
      this.left = null;
      if (l.v > 50) w.die('ccu-gir');
      else if (l.back) w.die('ccu-ulto');
    }
    if (on) this.left = null;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.gone || (this.o.hidden && !this.started)) return;
    const x = this.x - 34,
      y = FLOOR - 46,
      bw = 116,
      bh = 38;
    // body: cream top, blue band, the yellow-and-blue livery of a Kolkata private bus (unbranded)
    ctx.fillStyle = '#F2C14E';
    rr(ctx, x, y, bw, bh, 5);
    ctx.fill();
    ctx.fillStyle = '#1D5C96';
    ctx.fillRect(x, y + 22, bw, 6);
    ctx.fillStyle = '#B5651D';
    ctx.fillRect(x, y + bh - 5, bw, 5);
    ctx.fillStyle = '#C7DCE8';
    for (let i = 0; i < 6; i++) if (i !== 1) ctx.fillRect(x + 6 + i * 18, y + 5, 13, 12);
    // the door, open, with the conductor hanging out of it
    ctx.fillStyle = '#2B2320';
    ctx.fillRect(x + 30, y + 4, 22, bh - 6);
    person(ctx, x + 41, y + 4, 22, '#5D7A8C');
    ctx.strokeStyle = '#5D7A8C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 44, y + 12);
    ctx.lineTo(x + 54 + Math.sin(w.tick * 0.2) * 2, y + 8);
    ctx.stroke();
    // wheels
    for (const wx of [x + 18, x + bw - 18]) {
      ctx.fillStyle = '#1C1916';
      ctx.beginPath();
      ctx.arc(wx, FLOOR - 4, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8E9399';
      ctx.beginPath();
      ctx.arc(wx, FLOOR - 4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.o.label) text(ctx, this.o.label, x + bw - 24, y + 31, 6, '#FFFFFF');
    // the footboard
    ctx.fillStyle = '#8E9399';
    ctx.fillRect(this.deck.x, this.deck.y, this.deck.w, 3);
    ctx.fillStyle = '#4A4541';
    ctx.fillRect(this.deck.x + 2, this.deck.y + 3, 2, 6);
    ctx.fillRect(this.deck.x + this.deck.w - 4, this.deck.y + 3, 2, 6);
    if (this.crawling() || this.slowed) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(x - 6, FLOOR - 3, 3, 1);
    }
  }
}

/** a hazard box drawn by the caller */
export function zone(x: number, y: number, ww: number, h: number, cause: string): Hazard & { box: { x: number; y: number; w: number; h: number } } {
  const box = { x, y, w: ww, h };
  return {
    active: true,
    cause,
    box,
    hits: (ax, ay, aw, ah) => ax < box.x + box.w && ax + aw > box.x && ay < box.y + box.h && ay + ah > box.y,
  };
}
