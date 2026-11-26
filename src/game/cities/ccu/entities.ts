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

// ================================================================== CCU-01: the tram rail
/**
 * A tram rail set in the road from x0 to x1 (px), running on into the open rail-works trench at x1. Walk
 * over it and nothing happens. Land on it from a jump and your foot drops into the groove: it locks and the
 * rail steers you along its line (you slide with it, can't turn, can't jump) until it runs out at the
 * trench.
 */
export class Rail extends Entity {
  locked = false;
  private onIt = false;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly pit1: number,
    readonly speed = 96,
  ) {
    super();
    this.layer = -3;
  }
  private on(w: World) {
    const p = w.player;
    return p.onGround && p.y + p.h === FLOOR && p.x + p.w > this.x0 + 2 && p.x < this.x1 - 2;
  }
  update(w: World) {
    const p = w.player;
    const f = feet(w);
    const now = this.on(w);
    if (now && !this.onIt && f.landedFromJump()) {
      this.locked = true;
      w.flags.groove = (w.flags.groove ?? 0) + 1;
      w.sfx('thud', p.cx, FLOOR);
      w.emit('fx', p.cx, FLOOR - 2, { kind: 'dust' });
    } else if (p.onGround) f.landedFromJump();
    this.onIt = now;
    if (this.locked) {
      // the groove has him: along the line, no turning, no jumping
      p.stun = 2;
      p.vx = 0;
      p.pushVx = this.speed;
      p.facing = 1;
      if (p.y > FLOOR + 4 && p.x + p.w > this.x1 && p.x < this.pit1) w.die('ccu-rail');
    }
    if (p.onGround && p.x > this.pit1) this.locked = false;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // two steel rail heads with the groove between, sunk in the cobbles, running into the trench
    const y = FLOOR;
    ctx.fillStyle = '#4A4541';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 4);
    ctx.fillStyle = '#C9CDD1';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 1.4);
    ctx.fillStyle = '#1C1916';
    ctx.fillRect(this.x0, y + 1.4, this.x1 - this.x0, 1.6);
    for (let x = this.x0 + 6; x < this.x1; x += 14) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x, y + 4, 8, 2);
    }
    // the bent rail ends hanging over the trench, and the works barrier
    ctx.strokeStyle = '#8E9399';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x1, y + 1);
    ctx.lineTo(this.x1 + 6, y + 6);
    ctx.stroke();
    const bx = this.pit1 + 2;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 ? '#F4F1E8' : '#D84315';
      ctx.fillRect(bx + i * 5, y - 12, 5, 4);
    }
    ctx.fillStyle = '#3A3530';
    ctx.fillRect(bx, y - 8, 1.5, 8);
    ctx.fillRect(bx + 13.5, y - 8, 1.5, 8);
    if (this.locked && w.state === 'play') {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(w.player.x - 4, y - 1, 3, 1);
    }
  }
}

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
  constructor(readonly o: BusSpec) {
    super();
    this.layer = 2;
    this.x = o.x;
    this.deck = new Solid(o.x, FLOOR - 9, 26, 4);
    this.deck.oneWay = true;
    this.deck.velX = 0;
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
    if (!this.started && (this.o.go ? this.o.go(w) : true)) this.started = true;
    if (!this.gone && this.started) {
      const want = this.crawling() || this.slowed ? this.crawl : this.fast;
      const a = 260 * DT;
      this.v = this.v < want ? Math.min(want, this.v + a) : Math.max(want, this.v - a);
      if (this.crawling() || this.slowed) {
        if (w.tick - this.said > 150 && this.o.shout !== '') {
          this.said = w.tick;
          w.say(this.o.shout ?? 'Aaste! Aaste! | Slowly! Slowly!', this.x + 40, FLOOR - 52, 1.6, 'npc');
        }
      } else if (this.o.call && !this.called && Math.abs(this.x - p.cx) < 120) {
        this.called = true;
        w.say(this.o.call, this.x + 40, FLOOR - 52, 1.6, 'npc');
      }
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
    if (this.gone) return;
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
