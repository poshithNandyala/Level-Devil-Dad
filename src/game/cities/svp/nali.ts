// Nali, the air hose of the sea walk (line topology): Dad walks the seabed on a hose of fixed length fed from a
// pontoon. The hose runs straight from the pontoon to him unless a coral arch is in the way, and then it goes where
// Dad went: over the arch's top if he climbed over it, under it if he walked through. Under an arch the hose bends
// and uses up a length of its own. Past the end of the hose it goes taut and pulls him off his feet. So the way round
// each arch is a choice about how much line he has left, and the line is drawn: slack curve, or taut and white.
// The decision: which way round an obstacle do I let my line run.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, Plat, FLOOR, px, TAU, type Ctx } from './kit';

/** the line an arch takes up when the hose runs under it, px */
export const K = 120;
const SLACK = 30;

export interface Arch {
  x0: number;
  x1: number;
  /** the top of the arch, px (y) */
  top: number;
  /** the hose runs under it now */
  under: boolean;
}

/** one stretch of seabed with its own pontoon: the anchor is where the pontoon floats, `len` is the hose's length */
export class Hose extends Entity {
  arches: Arch[] = [];
  used = 0;
  private prevX = -1;
  private now = 0;
  constructor(
    readonly ax: number,
    /** the stretch this pontoon serves: [x0, x1] px */
    readonly span: [number, number],
    readonly len: number,
    arches: [number, number][],
    readonly cause = 'svp-nali',
  ) {
    super();
    this.layer = 6;
    for (const [a, b] of arches) this.arches.push({ x0: a, x1: b, top: FLOOR - 40, under: false });
  }
  /** how much of the hose Dad has used at his place now */
  usedAt(cx: number) {
    return Math.max(0, Math.min(cx, this.span[1]) - this.ax) + this.arches.filter((a) => a.under).length * K;
  }
  /** the hose is taut: within a step of its end */
  get taut() {
    return this.used > this.len - 40;
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    const cx = p.cx;
    if (cx < this.span[0] || cx > this.span[1] + 40) {
      this.prevX = cx;
      return;
    }
    if (this.prevX < 0) this.prevX = cx;
    for (const a of this.arches) {
      // crossing the arch's far edge going right: under it if on the floor, over it if on its top
      if (this.prevX < a.x1 && cx >= a.x1) a.under = p.y + p.h > a.top + 12;
      // and back the other way: the hose comes off the arch
      if (this.prevX > a.x0 && cx <= a.x0) a.under = false;
    }
    this.prevX = cx;
    this.used = this.usedAt(cx);
    if (w.state === 'play' && this.used > this.len) {
      w.die(this.cause);
      w.sfx('thud', cx, FLOOR);
    }
  }
  draw(ctx: Ctx, w: World) {
    const [x0, x1] = this.span;
    const p = w.player;
    const cx = p.cx;
    // the pontoon, up on the surface
    const py = 38;
    ctx.fillStyle = '#B3392E';
    ctx.fillRect(this.ax - 26, py, 52, 8);
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(this.ax - 14, py - 10, 28, 10);
    ctx.fillStyle = 'rgba(70,170,190,0.35)';
    ctx.fillRect(x0 - 40, py + 6, x1 - x0 + 120, 4);
    if (cx < x0 - 30 || cx > x1 + 60) return;
    const taut = this.used > this.len - 60;
    ctx.strokeStyle = taut ? (w.tick >> 3) % 2 ? '#FFFFFF' : '#FF8A7A' : '#F2C230';
    ctx.lineWidth = taut ? 2 : 1.6;
    ctx.beginPath();
    ctx.moveTo(this.ax, py + 8);
    // the hose: a polyline through the arches it is wrapped on, sagging by what is left of it
    const spare = Math.max(0, this.len - this.used);
    const sag = Math.min(30, spare * 0.12);
    let lx = this.ax,
      ly = py + 8;
    const pts: [number, number][] = [];
    for (const a of this.arches) {
      if (a.x1 > cx - 20 || a.under) {
        if (a.x0 > cx) continue;
        pts.push(a.under ? [a.x1 - 6, FLOOR - 22] : [(a.x0 + a.x1) / 2, a.top - 3]);
      }
    }
    pts.push([cx, p.y + 8]);
    for (const [x, y] of pts) {
      ctx.quadraticCurveTo((lx + x) / 2, (ly + y) / 2 + sag, x, y);
      lx = x;
      ly = y;
    }
    ctx.stroke();
    void TAU;
  }
}

function arch(ctx: Ctx, a: Arch) {
  // a coral head with an opening beneath it
  ctx.fillStyle = '#D9867A';
  ctx.fillRect(a.x0 - 2, a.top, a.x1 - a.x0 + 4, 8);
  ctx.fillStyle = '#E8A396';
  ctx.fillRect(a.x0 - 2, a.top, a.x1 - a.x0 + 4, 3);
  ctx.fillStyle = '#B5655A';
  ctx.fillRect(a.x0 - 2, a.top + 8, 6, FLOOR - a.top - 8);
  ctx.fillRect(a.x1 - 4, a.top + 8, 6, FLOOR - a.top - 8);
}

/** SVP-09's second act: two stretches of the reef, each with its own pontoon and two coral arches */
export const nali: Act = {
  id: 'svp09-nali',
  w: 64,
  advice: 'The sea walk on the reef: a heavy helmet, an air hose from the pontoon above, and coral arches across the path. The hose lies where you went: over the top of an arch costs nothing, but through the opening under one it bends, and the bend uses up a length of hose. When the hose goes taut and white it pulls you off your feet. In the first stretch you can afford one arch underneath. The second pontoon is on a shorter hose: no spare for a bend.',
  cps: [30.5],
  build: (w, c) => {
    const x = c.x;
    // the pontoons float over each stretch's start; each hose is long enough for the walk plus one arch's worth of bend
    const walk1 = px(x + 31) - px(x + 3);
    const h1 = new Hose(px(x + 3), [px(x + 3), px(x + 31)], walk1 + K + SLACK, [
      [px(x + 8), px(x + 13)],
      [px(x + 19), px(x + 24)],
    ]);
    const walk2 = px(x + 61) - px(x + 34);
    const h2 = new Hose(px(x + 34), [px(x + 34), px(x + 61)], walk2 + SLACK, [
      [px(x + 40), px(x + 45)],
      [px(x + 51), px(x + 56)],
    ], 'svp-nali2');
    for (const h of [h1, h2]) {
      w.add(h);
      w.add(new Fx(null, (ctx) => h.arches.forEach((a) => arch(ctx, a)), 2));
      for (const a of h.arches) w.add(new Plat(a.x0, a.top, a.x1 - a.x0, 8, () => {}));
    }
    (w.flags.hoses ??= []).push(h1, h2);
  },
};

// ================================================================== the weight belt: from where you let go, straight up
/** the seabed walk's way up: stand still and the weight belt lets go, and Dad floats straight up from where he stood */
export class Belt extends Entity {
  rising = false;
  private still = 0;
  private t = 0;
  constructor(
    /** the stretch of seabed where a belt can be let go: [x0, x1] px */
    readonly zone: [number, number],
    /** the surface: the deck's top, px (y) */
    readonly surface: number,
    /** the hatch in the deck: [x0, x1] px */
    readonly hatch: [number, number],
    readonly standTicks = 45,
  ) {
    super();
    this.layer = 6;
  }
  update(w: World) {
    const p = w.player;
    if (w.state !== 'play') return;
    if (this.rising) {
      // the belt is gone: the way is straight up and nothing else moves him
      w.input = { left: false, right: false, jump: false, jumpPressed: false };
      p.vx = 0;
      p.vy = -90;
      this.t++;
      if (p.y + p.h <= this.surface + 1) {
        // up through the hatch: a little hop, to get over the deck
        this.rising = false;
        p.vy = -260;
      } else if (this.t > 600) this.rising = false;
      return;
    }
    const still = p.onGround && Math.abs(p.vx) < 4 && !w.input.left && !w.input.right && p.cx > this.zone[0] && p.cx < this.zone[1] && p.y + p.h > FLOOR - 4;
    this.still = still ? this.still + 1 : 0;
    if (this.still === this.standTicks) {
      this.rising = true;
      this.t = 0;
      w.sfx('pop', p.cx, FLOOR);
    }
  }
  draw(ctx: Ctx, w: World) {
    const p = w.player;
    if (this.still > 4 || this.rising) {
      // the belt dropping off, and a few bubbles going straight up
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let i = 0; i < 5; i++) ctx.fillRect(p.cx - 6 + ((i * 5 + (w.tick >> 2)) % 12), p.y - ((w.tick * 2 + i * 17) % 60), 1.6, 1.6);
    }
  }
}

/** SVP-09's third act: the sea walk's pontoon, with the one hatch, and a rock pillar the seabed runs into */
export const patta: Act = {
  id: 'svp09-patta',
  w: 36,
  advice: 'The sea walk again, and the seabed ends at a rock pillar. The only way on is up, and the way up is a straight line: stand still and the weight belt lets go, and you float up from exactly where you stood. The pontoon above has one hatch, with its light coming down. Let go under the hatch.',
  cps: [],
  build: (w, c) => {
    const x = c.x;
    const top = FLOOR - 120;
    const hatch: [number, number] = [px(x + 9), px(x + 12)];
    const belt = new Belt([px(x + 4), px(x + 24.2)], top, hatch);
    w.add(belt);
    // the deck, in two pieces round the hatch, and the pillar the seabed runs into
    const deck = (a: number, b: number) => w.add(new Plat(a, top, b - a, 8, (ctx, q) => {
      ctx.fillStyle = '#B3392E';
      ctx.fillRect(q.x, q.y, q.w, 8);
      ctx.fillStyle = '#F4ECD6';
      ctx.fillRect(q.x, q.y, q.w, 2);
    }));
    deck(px(x + 6), hatch[0]);
    deck(hatch[1], px(x + 22));
    w.add(new Plat(px(x + 24), top, px(6), FLOOR - top, (ctx, q) => {
      ctx.fillStyle = '#7A6A58';
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.fillStyle = '#9A8A76';
      ctx.fillRect(q.x, q.y, q.w, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let yy = q.y + 14; yy < q.y + q.h; yy += 26) ctx.fillRect(q.x + 6, yy, q.w - 14, 4);
    }));
    // under the hull and in the open water either side of the pontoon: the hull, and the propeller
    w.add(new Hurt(px(x + 6), top + 8, hatch[0] - px(x + 6), 24, 'svp-hull', null));
    w.add(new Hurt(hatch[1], top + 8, px(x + 22) - hatch[1], 24, 'svp-hull', null));
    w.add(new Hurt(px(x + 3), top + 6, px(3), 40, 'svp-pankha', null));
    w.add(new Hurt(px(x + 22), top + 6, px(2), 40, 'svp-pankha', null));
    w.add(
      new Fx(null, (ctx, w2) => {
        // the sea over the stretch, the light from the hatch, and the propeller at the pontoon's end
        const x0 = px(x + 3),
          x1 = px(x + 24);
        const g = ctx.createLinearGradient(0, top, 0, FLOOR);
        g.addColorStop(0, 'rgba(70,170,190,0.30)');
        g.addColorStop(1, 'rgba(18,90,110,0.55)');
        ctx.fillStyle = g;
        ctx.fillRect(x0, top, x1 - x0, FLOOR - top);
        ctx.fillStyle = 'rgba(255,240,170,0.22)';
        ctx.fillRect(hatch[0], top + 8, hatch[1] - hatch[0], FLOOR - top - 8);
        ctx.fillStyle = '#555E64';
        ctx.fillRect(px(x + 22) - 3, top + 14, 5, 14);
        const a = (w2.tick * 0.5) % 6.28;
        ctx.strokeStyle = '#C9D2D6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px(x + 22) - 0.5, top + 21 - Math.sin(a) * 9);
        ctx.lineTo(px(x + 22) - 0.5, top + 21 + Math.sin(a) * 9);
        ctx.stroke();
        // the hatch itself, a dark square with a rim
        ctx.strokeStyle = '#F6E27F';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(hatch[0] + 0.5, top - 3, hatch[1] - hatch[0] - 1, 3);
      }, 5),
    );
    (w.flags.belts ??= []).push(belt);
  },
};
