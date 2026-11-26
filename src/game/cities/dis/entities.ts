// Dispur's own entities: one class per mechanic (update, draw, solids, hazards).
// Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6). Everything that moves is driven by the tick
// or by where Dad is, never by a wall clock, so a respawn replay puts every sand bar and every host back exactly.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE, overlapXYWH } from '../../constants';
import { FLOOR, person } from '../../levels/endkit';

export const px = (t: number) => t * TILE;
export const GROUND = FLOOR; // 240: the top of the ground row

/** a box in px */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** an invisible-by-default deadly box that something else draws and moves */
export class Danger extends Entity {
  hazard: Hazard;
  constructor(
    public box: Box,
    cause: string,
    public on = true,
  ) {
    super();
    const self = this;
    this.hazard = { active: true, cause, hits: (x, y, w, h) => self.alive && self.on && overlapXYWH(x, y, w, h, self.box) };
  }
}

/** a solid slab that something else moves (setX/setBox) and draws; Dad on top is carried by moveBy */
export class Slab extends Entity {
  solid: Solid;
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    readonly paint: (ctx: CanvasRenderingContext2D, s: Slab, w: World) => void,
    layer = 0,
  ) {
    super();
    this.solid = new Solid(x, y, w, h);
    this.layer = layer;
  }
  /** move by an amount (carries Dad if he stands on it) */
  go(dx: number, dy: number) {
    this.solid.moveBy(this.world!, dx, dy);
  }
  world: World | null = null;
  /** change the horizontal extent in place (a bar growing or shrinking): Dad on a part that goes falls */
  span(x0: number, x1: number) {
    const s = this.solid;
    s.x = Math.round(x0);
    s.w = Math.max(0, Math.round(x1 - x0));
    s.collidable = s.w > 0;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.solid.w > 0) this.paint(ctx, this, w);
  }
}

/** a drawn-only thing with an update */
export class Decor extends Entity {
  constructor(
    readonly f: (ctx: CanvasRenderingContext2D, w: World) => void,
    layer = -5,
    readonly upd?: (w: World) => void,
  ) {
    super();
    this.layer = layer;
  }
  update(w: World) {
    this.upd?.(w);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    this.f(ctx, w);
  }
}

const smoothstep = (a: number) => (a <= 0 ? 0 : a >= 1 ? 1 : a * a * (3 - 2 * a));
export { smoothstep };

// ====================================================================== DIS-01: the tea boy on the promenade
/**
 * A boy with a tray of lal chah, walking the promenade towards Dad. Touch him or his tray and the tea spills on you.
 * Jump clean over him and the tray tips as you pass: a pool of hot tea spreads over exactly where you will land.
 * The tray swings on his arm, front then back, so a Dad who climbs out of the ghat right behind him meets it.
 * The boy starts when Dad reaches `from` (so a late start costs nothing) and walks to `stop`, where he sets the tray down.
 */
export class Carrier extends Entity {
  x: number;
  walking = false;
  stopped = false;
  hazard: Hazard;
  /** spill pools (px ranges) and the tick each began */
  pools: { x0: number; x1: number; t0: number }[] = [];
  private spilledAt = -999;
  constructor(
    x0: number,
    readonly from: number,
    readonly stop: number,
    readonly speed = 56,
  ) {
    super();
    this.x = x0;
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'dis-spill',
      hits(x, y, w, h) {
        if (!self.alive || self.stopped) return false;
        if (overlapXYWH(x, y, w, h, { x: self.x - 5, y: GROUND - 28, w: 10, h: 28 })) return true;
        const t = self.tray();
        if (overlapXYWH(x, y, w, h, t)) return true;
        return self.pools.some((p) => overlapXYWH(x, y, w, h, { x: p.x0, y: GROUND - 8, w: p.x1 - p.x0, h: 8 }));
      },
    };
  }
  /** swing phase: 1 = tray out front (towards where he walks), -1 = swung behind him */
  swing(w: World) {
    return Math.cos(((w.tick - 0) * DT * Math.PI * 2) / 1.8);
  }
  private lastSwing = 1;
  tray(): Box {
    const d = -1; // he walks left
    return { x: this.x + d * 17 * this.lastSwing - 6, y: GROUND - 28, w: 12, h: 8 };
  }
  update(w: World) {
    if (!this.walking && w.player.cx >= this.from) this.walking = true;
    this.lastSwing = this.swing(w);
    if (this.walking && !this.stopped) {
      this.x -= this.speed * DT;
      if (this.x <= this.stop) {
        this.stopped = true;
        this.pools = [];
      }
    }
    if (this.stopped) return;
    const p = w.player;
    // clean over the top of him: the tray tips and the tea lands where he will
    if (w.state === 'play' && !p.onGround && p.y + p.h < GROUND - 28 && Math.abs(p.cx - this.x) < 20 && w.tick - this.spilledAt > 240) {
      this.spilledAt = w.tick;
      this.pools.push({ x0: this.x + 8, x1: this.x + 70, t0: w.tick });
      w.sfx('splash', this.x, GROUND);
      w.emit('fx', this.x, GROUND - 10, { kind: 'poof', w: 20, h: 10 });
    }
    this.pools = this.pools.filter((q) => w.tick - q.t0 < 480);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (const q of this.pools) {
      const age = (w.tick - q.t0) / 480;
      ctx.globalAlpha = 0.9 * (1 - age * 0.5);
      ctx.fillStyle = '#7A2E14';
      ctx.fillRect(q.x0, GROUND - 4, q.x1 - q.x0, 4);
      ctx.fillStyle = '#B5502A';
      ctx.fillRect(q.x0 + 2, GROUND - 6, q.x1 - q.x0 - 4, 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const sx = q.x0 + 8 + i * 16;
        ctx.beginPath();
        ctx.moveTo(sx, GROUND - 8);
        ctx.quadraticCurveTo(sx + 3, GROUND - 14 - ((w.tick / 6 + i * 3) % 6), sx, GROUND - 20 - ((w.tick / 6 + i * 3) % 5));
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    const x = this.x;
    person(ctx, x, GROUND - 28, 28, '#FDF0D5', '#B9855A', { cap: '#C1121F', arms: 0 });
    // the tray and its glasses
    const t = this.stopped ? { x: x - 14, y: GROUND - 12, w: 12, h: 8 } : this.tray();
    ctx.fillStyle = '#9AA0A6';
    ctx.fillRect(t.x, t.y + 5, t.w, 3);
    ctx.fillStyle = '#9B2D1F';
    for (let i = 0; i < 3; i++) ctx.fillRect(t.x + 1 + i * 4, t.y, 3, 5);
    ctx.strokeStyle = '#6B6F73';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, GROUND - 17);
    ctx.lineTo(t.x + t.w / 2, t.y + 6);
    ctx.stroke();
  }
}

// ====================================================================== DIS-02: the sandbars and the level post
/** a tile range [x0, x1) for one water level, or null when the bar is not there at that level */
export type Span = [number, number] | null;

/** the river: deadly water under the sandbars, drawn over their feet so they look half sunk */
export class River extends Entity {
  danger: Danger;
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top = GROUND + 10,
    cause = 'dis-luit',
  ) {
    super();
    this.layer = 1;
    this.danger = new Danger({ x: x0, y: top, w: x1 - x0, h: 80 }, cause);
    this.hazard = this.danger.hazard;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const y = GROUND + 6;
    const g = ctx.createLinearGradient(0, y, 0, y + 50);
    g.addColorStop(0, '#A89A84');
    g.addColorStop(1, '#6F6250');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 50);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.9;
    for (let x = this.x0 + ((w.tick * 0.25) % 14); x < this.x1 - 4; x += 14) {
      const yy = y + 2 + ((x / 14) % 3) * 4;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + 6, yy);
      ctx.stroke();
    }
  }
}

interface FieldBar {
  slab: Slab;
  spans: Span[];
  cur: [number, number];
  hut: boolean;
}

/**
 * A stretch of braided river with sandbars. A bar is where its span says for the current water level. The level goes up a
 * mark when the siren sounds, and the siren sounds when Dad stands on the ground at its trigger column (so nothing depends
 * on how long anyone dawdled). From the siren: new bars grow first (ticks 60-100), a bar that keeps its place but narrows
 * does so later (150-210), and bars that are gone sink last (230-290). Ghost outlines of the bars to come show from the siren.
 * `auto`: after the last trigger the level goes round and round on its own, every `auto` ticks (the finale's river).
 */
export class SandField extends Entity {
  level = 0;
  /** ticks since the siren (-1: calm) */
  e = -1;
  bars: FieldBar[] = [];
  /** world x (px) at which Dad's feet-on-ground turns the level up from level k to k+1 */
  trig: number[] = [];
  /** how many levels there are (the last one is the highest) */
  constructor(
    spans: Span[][],
    trig: number[],
    readonly hutBars: number[] = [],
    readonly period = 0,
  ) {
    super();
    this.layer = 0;
    this.trig = trig;
    this.spans = spans;
  }
  spans: Span[][];
  built = false;
  /** call after add: creates the slabs */
  setup(w: World) {
    this.built = true;
    this.spans.forEach((sp, i) => {
      const first = sp[0] ?? sp.find((s) => s) ?? [0, 0];
      const slab = new Slab(px(first[0]), GROUND, px(first[1] - first[0]), 16, (ctx, s) => this.drawBar(ctx, s, i, w), 0);
      slab.world = w;
      w.add(slab);
      const bar: FieldBar = { slab, spans: sp, cur: [0, 0], hut: this.hutBars.includes(i) };
      this.bars.push(bar);
      this.place(bar, this.rangeAt(bar, 0, 0, 1));
    });
  }
  private rangeAt(b: FieldBar, from: number, to: number, k: number): [number, number] {
    const a = b.spans[from],
      c = b.spans[to];
    if (!a && !c) return [0, 0];
    const mid = (s: [number, number]) => (s[0] + s[1]) / 2;
    if (!a && c) {
      const m = mid(c);
      return [px(m - ((c[1] - c[0]) / 2) * k), px(m + ((c[1] - c[0]) / 2) * k)];
    }
    if (a && !c) {
      const m = mid(a);
      const s = 1 - k;
      return [px(m - ((a[1] - a[0]) / 2) * s), px(m + ((a[1] - a[0]) / 2) * s)];
    }
    return [px(a![0] + (c![0] - a![0]) * k), px(a![1] + (c![1] - a![1]) * k)];
  }
  private place(b: FieldBar, r: [number, number]) {
    b.cur = r;
    b.slab.span(r[0], r[1]);
  }
  /** the tick window in which this kind of change happens */
  private win(from: Span, to: Span): [number, number] {
    if (!from && to) return [60, 100];
    if (from && !to) return [230, 290];
    return [150, 210];
  }
  /** is level `l` (0-based) the one the river will be at, once the change in progress is over? */
  get next() {
    return this.e >= 0 ? this.level + 1 : this.level;
  }
  update(w: World) {
    if (!this.built) return;
    const p = w.player;
    if (this.e < 0) {
      const k = this.level;
      if (this.period > 0 && k >= this.trig.length) {
        // the river goes round on its own, once Dad has reached the first trigger
        if (w.flags.disRun) this.start(w);
      } else if (k < this.trig.length && w.state === 'play' && p.onGround && p.cx >= this.trig[k]) this.start(w);
    }
    if (this.e >= 0) {
      this.e++;
      const lv = this.level;
      const nl = this.period > 0 && lv >= this.spans.length - 1 ? this.period - 1 : lv + 1;
      for (const b of this.bars) {
        const from = b.spans[lv] ?? null,
          to = b.spans[this.period > 0 && lv >= this.spans.length - 1 ? this.period - 1 : nl] ?? null;
        const [t0, t1] = this.win(from, to);
        const k = smoothstep((this.e - t0) / (t1 - t0));
        this.place(b, this.rangeAt(b, lv, this.period > 0 && lv >= this.spans.length - 1 ? this.period - 1 : nl, k));
      }
      if (this.e >= 290) {
        this.level = this.period > 0 && lv >= this.spans.length - 1 ? this.period - 1 : lv + 1;
        this.e = -1;
        this.afterLevel?.(this.level);
      }
    }
  }
  afterLevel?: (level: number) => void;
  private start(w: World) {
    this.e = 0;
    w.sfx('siren', w.player.cx, GROUND - 40);
    this.onSiren?.(this.level + 1);
  }
  onSiren?: (next: number) => void;
  private drawBar(ctx: CanvasRenderingContext2D, s: Slab, i: number, w: World) {
    const x = s.solid.x,
      ww = s.solid.w;
    ctx.fillStyle = '#D8C8A8';
    ctx.beginPath();
    ctx.moveTo(x, GROUND + 16);
    ctx.lineTo(x + 2, GROUND + 2);
    ctx.lineTo(x + ww - 2, GROUND + 2);
    ctx.lineTo(x + ww, GROUND + 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#C9B78F';
    ctx.fillRect(x + 2, GROUND, ww - 4, 4);
    ctx.fillStyle = '#E7DAC0';
    ctx.fillRect(x + 4, GROUND, ww - 8, 1.5);
    const bar = this.bars[i];
    if (bar?.hut) {
      // the farmer's hut: a bamboo box with a thatch roof... of a Mising chang ghar on stilts, drawn small
      const hx = x + ww / 2;
      ctx.fillStyle = '#8D6B2E';
      ctx.fillRect(hx - 9, GROUND - 14, 18, 14);
      ctx.fillStyle = '#6A4B1C';
      ctx.fillRect(hx - 9, GROUND - 14, 18, 2);
      ctx.fillStyle = '#B08B3C';
      ctx.beginPath();
      ctx.moveTo(hx - 12, GROUND - 14);
      ctx.lineTo(hx, GROUND - 24);
      ctx.lineTo(hx + 12, GROUND - 14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#33261C';
      ctx.fillRect(hx - 2, GROUND - 9, 4, 9);
    }
    void w;
  }
  /** the ghost of each bar still to come, drawn once the siren has gone */
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.e < 0 || !this.built) return;
    const lv = this.level;
    const nl = this.period > 0 && lv >= this.spans.length - 1 ? this.period - 1 : lv + 1;
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    for (const b of this.bars) {
      const to = b.spans[nl];
      const from = b.spans[lv];
      if (to && !from && this.e < 80) ctx.strokeRect(px(to[0]) + 1, GROUND + 3, px(to[1] - to[0]) - 2, 12);
      if (from && !to && this.e > 60 && this.e < 230 && (w.tick >> 3) % 2) {
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(193,18,31,0.55)';
        ctx.fillRect(b.slab.solid.x, GROUND + 2, b.slab.solid.w, 3);
        ctx.setLineDash([3, 3]);
      }
    }
    ctx.setLineDash([]);
  }
}

/** the level post: a pole with three marks and the water line, and a little board of where the bars are at each mark */
export function levelPost(w: World, field: SandField, tx: number, rows: number) {
  w.add(
    new Decor((ctx, w2) => {
      const x = px(tx);
      const top = GROUND - 62;
      ctx.fillStyle = '#6A4B1C';
      ctx.fillRect(x, top, 4, 62);
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(x - 8, top - 2, 20, 62 - 18);
      ctx.strokeStyle = '#33261C';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 8, top - 2, 20, 44);
      for (let m = 0; m < rows; m++) {
        const yy = top + 34 - m * 11;
        ctx.fillStyle = '#C1121F';
        ctx.fillRect(x - 8, yy, 20, 1.5);
        ctx.fillStyle = '#33261C';
        ctx.font = '700 7px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(String(m + 1), x - 6, yy - 1.5);
      }
      const cur = field.level + (field.e >= 60 ? Math.min(1, (field.e - 60) / 120) : 0);
      const wy = top + 34 - cur * 11;
      ctx.fillStyle = 'rgba(70,110,120,0.7)';
      ctx.fillRect(x - 8, wy, 20, top + 42 - wy);
      void w2;
    }, -5),
  );
}

/** a river between tile columns c0 and c1 (the pit is painted by the stage; this is the water and the deadly part) */
export function river(w: World, c0: number, c1: number, cause = 'dis-luit') {
  w.add(new River(px(c0), px(c1), GROUND + 10, cause));
}
/** a field of sandbars whose slabs are built on add */
export function sand(w: World, spans: Span[][], trig: number[], hut: number[] = []) {
  const f = new SandField(spans, trig, hut);
  w.add(f);
  f.setup(w);
  (w.flags.sand ??= []).push(f);
  return f;
}
