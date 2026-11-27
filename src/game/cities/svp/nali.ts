// Nali, the air hose of the sea walk (line topology): Dad walks the seabed on a hose of fixed length fed from a
// pontoon. The hose runs straight from the pontoon to him unless a coral arch is in the way, and then it goes where
// Dad went: over the arch's top if he climbed over it, under it if he walked through. Under an arch the hose bends
// and uses up a length of its own. Past the end of the hose it goes taut and pulls him off his feet. So the way round
// each arch is a choice about how much line he has left, and the line is drawn: slack curve, or taut and white.
// The decision: which way round an obstacle do I let my line run.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { Fx, Plat, FLOOR, px, TAU, type Ctx } from './kit';

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
