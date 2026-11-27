// SVP-03 Magarmachh: a creek with a warning board. The board is honest: its arrow turns to wherever the crocodile
// is. The room: a line of logs over the creek, one of them is the crocodile asleep in the sun; wade the shallows
// instead and it slides in and comes for you. The arrow swings to the water: climb back out and take the logs.
// The act: the crocodile patrols under the logs and rises through the gaps; cross a gap when the arrow points away.
// The door: the board at the pit folds down into a bridge for someone who stands by it.
import { Entity, type LevelDef, type World } from '../../world';
import { DT } from '../../constants';
import { door, rival, collectible } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR, text } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L } from './lines';
import { Fx, Hurt, Plat, px, TAU, type Ctx } from './kit';

/** the honest warning board: its arrow always points at the crocodile */
export class Board extends Entity {
  ang = 0;
  constructor(
    readonly x: number,
    readonly y: number,
    readonly target: () => { x: number; y: number },
  ) {
    super();
    this.layer = -5;
    const t = target();
    this.ang = Math.atan2(t.y - (y + 12), t.x - (x + 50));
  }
  update() {
    const t = this.target();
    const want = Math.atan2(t.y - (this.y + 12), t.x - (this.x + 50));
    let d = want - this.ang;
    while (d > Math.PI) d -= TAU;
    while (d < -Math.PI) d += TAU;
    this.ang += d * 0.1;
  }
  draw(ctx: Ctx) {
    const { x, y } = this;
    ctx.fillStyle = '#4A3A2A';
    ctx.fillRect(x + 6, y + 20, 3, FLOOR - y - 20);
    ctx.fillRect(x + 36, y + 20, 3, FLOOR - y - 20);
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(x, y, 46, 24);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, 44, 22);
    text(ctx, 'MAGARMACHH', x + 23, y + 8, 6.5, '#8A1F14', '');
    text(ctx, 'CROCODILE', x + 23, y + 17, 6.5, '#3A1E12', '');
    // the arrow on its hinge
    const hx = x + 50,
      hy = y + 12;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(this.ang);
    ctx.fillStyle = '#C0392B';
    ctx.beginPath();
    ctx.moveTo(0, -2.2);
    ctx.lineTo(13, -2.2);
    ctx.lineTo(13, -5.5);
    ctx.lineTo(21, 0);
    ctx.lineTo(13, 5.5);
    ctx.lineTo(13, 2.2);
    ctx.lineTo(0, 2.2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#2B2B2E';
    ctx.beginPath();
    ctx.arc(hx, hy, 2.2, 0, TAU);
    ctx.fill();
  }
}

function crocBody(ctx: Ctx, x: number, y: number, wd: number, dir: 1 | -1, jaws: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dir, 1);
  ctx.fillStyle = '#5B6B3A';
  ctx.beginPath();
  ctx.ellipse(0, 0, wd / 2, 6, 0, 0, TAU);
  ctx.fill();
  // snout and jaws
  ctx.fillStyle = '#6B7B45';
  ctx.fillRect(wd / 2 - 4, -3.5, 12, 4);
  ctx.fillStyle = '#6B7B45';
  ctx.save();
  ctx.translate(wd / 2 - 4, 0.5);
  ctx.rotate(jaws);
  ctx.fillRect(0, 0, 12, 3);
  ctx.restore();
  ctx.fillStyle = '#F4ECD6';
  for (let i = 0; i < 4; i++) ctx.fillRect(wd / 2 + i * 2.6, -0.2, 1.2, 2.2);
  // ridges and eyes
  ctx.fillStyle = '#3F4D26';
  for (let i = -3; i <= 3; i++) ctx.fillRect(i * 6 - 1, -8, 3, 3);
  ctx.fillStyle = '#E8D84A';
  ctx.fillRect(wd / 2 - 6, -6.5, 2.2, 2.2);
  ctx.restore();
}

/** the three logs over the creek, the sleeping crocodile among them, and the one that wades in */
export class Creek extends Entity {
  logs: Plat[] = [];
  state: 'sun' | 'slide' | 'water' = 'sun';
  cx = 0;
  cy = FLOOR + 20;
  private t0 = 0;
  private snap = -999;
  now = 0;
  private from = 0;
  readonly bait: Plat;
  readonly hurt: Hurt;
  constructor(
    readonly x0: number,
    readonly x1: number,
    spans: [number, number][],
    baitIndex: number,
  ) {
    super();
    this.layer = 5;
    for (const [a, b] of spans) {
      const p = new Plat(px(a), FLOOR, px(b - a), 12, (ctx, q) => {
        const bait = q === this.bait;
        ctx.fillStyle = '#7A3E1D';
        ctx.fillRect(q.x, q.y, q.w, q.h);
        ctx.fillStyle = '#A8683A';
        ctx.fillRect(q.x, q.y, q.w, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(q.x, q.y + q.h - 2, q.w, 2);
        ctx.fillStyle = '#5E2F14';
        for (let x = q.x + 8; x < q.x + q.w - 4; x += 14) ctx.fillRect(x, q.y + 4, 1.4, 6);
        if (bait && this.state === 'sun') {
          // knobbly: a hint for anyone who looks, and the eyes
          ctx.fillStyle = '#5B6B3A';
          for (let x = q.x + 5; x < q.x + q.w - 4; x += 9) ctx.fillRect(x, q.y - 2.5, 4, 2.5);
          ctx.fillStyle = '#E8D84A';
          ctx.fillRect(q.x + q.w - 7, q.y - 3, 2, 2);
          if (this.now - this.snap < 20) crocBody(ctx, q.x + q.w / 2, q.y - 4, q.w - 6, 1, 0.5);
        }
      });
      this.logs.push(p);
    }
    this.bait = this.logs[baitIndex];
    this.cx = this.bait.x + this.bait.w / 2;
    this.hurt = new Hurt(0, 0, 28, 24, 'svp-magar', null);
    this.hurt.on = false;
  }
  install(w: World) {
    for (const p of this.logs) w.add(p);
    w.add(this);
    w.add(this.hurt);
    return this;
  }
  inPit(w: World) {
    const p = w.player;
    return p.y + p.h > FLOOR + 14 && p.cx > this.x0 && p.cx < this.x1;
  }
  /** where the arrow should point */
  aim() {
    return this.state === 'sun' ? { x: this.bait.x + this.bait.w / 2, y: FLOOR - 2 } : { x: this.cx, y: this.cy };
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    const b = this.bait;
    if (this.state === 'sun') {
      const over = p.x + p.w > b.x - 4 && p.x < b.x + b.w + 4 && p.y + p.h > FLOOR - 28 && p.y + p.h <= FLOOR + 4;
      if (over && w.state === 'play') {
        this.snap = w.tick;
        w.sfx('thud', b.x + b.w / 2, FLOOR);
        w.die('svp-magar');
        return;
      }
      if (this.inPit(w) && p.cx > b.x - 40 && p.cx < b.x + b.w + 40) {
        this.state = 'slide';
        this.t0 = w.tick;
        this.from = this.cx;
        w.sfx('splash', this.cx, FLOOR);
      }
    } else if (this.state === 'slide') {
      const k = Math.min(1, (w.tick - this.t0) / 100);
      this.cx = this.from + 26 * k;
      this.cy = FLOOR - 4 + 24 * k;
      this.hurt.on = false;
      if (k >= 1) {
        this.state = 'water';
        this.hurt.on = true;
      }
    } else {
      if (this.inPit(w)) this.cx += Math.sign(p.cx - this.cx) * Math.min(55 * DT, Math.abs(p.cx - this.cx));
      this.cx = Math.max(this.x0 + 14, Math.min(this.x1 - 14, this.cx));
      this.hurt.on = true;
    }
    this.hurt.x = this.cx - 14;
    this.hurt.y = FLOOR + 8;
  }
  draw(ctx: Ctx, w: World) {
    // the water over the creek, in front of Dad
    const g = ctx.createLinearGradient(0, FLOOR + 6, 0, FLOOR + 32);
    g.addColorStop(0, 'rgba(70,170,190,0.55)');
    g.addColorStop(1, 'rgba(18,90,110,0.8)');
    ctx.fillStyle = g;
    ctx.fillRect(this.x0, FLOOR + 6, this.x1 - this.x0, 26);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 0.8;
    for (let x = this.x0 + ((w.tick * 0.3) % 14); x < this.x1 - 6; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR + 6.5);
      ctx.lineTo(x + 6, FLOOR + 6.5);
      ctx.stroke();
    }
    if (this.state !== 'sun') {
      const surf = this.state === 'slide' ? this.cy : FLOOR + 12;
      crocBody(ctx, this.cx, surf, 40, 1, w.tick % 80 < 8 ? 0.4 : 0.08);
      ctx.fillStyle = 'rgba(70,170,190,0.55)';
      ctx.fillRect(this.cx - 22, surf, 44, 14);
    }
  }
}

// ================================================================== the room
export function magarRoom(): LevelDef {
  return {
    id: 'SVP-03',
    city: 'SVP',
    index: 3,
    name: 'Magarmachh',
    nameEn: 'The warning board',
    tagline: 'A board at the creek says CROCODILE and its arrow is never wrong. The trouble is knowing what it is pointing at.',
    hint: 'The board’s arrow always points at the crocodile. At first it points at the middle log: that log is the crocodile asleep in the sun, and it snaps at whoever lands on it. Wade the creek instead and it slides in after you: when the arrow swings down to the water, climb out the way you came and take the logs, which are now only logs.',
    par: 14,
    map: Grid.ground(15).pit(12, 27).fill(12, 27, 17, 17, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const creek = new Creek(px(12), px(28), [[15, 19], [20, 24], [25, 28]], 1).install(w);
      w.flags.creek = creek;
      w.add(new Board(px(6.4), px(10.6), () => creek.aim()));
      rival(w, 3, 15, 1, { intro: L.intro[1], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-machhli', 25.5, 11.4);
    },
  };
}

// ================================================================== the act: the crocodile under the logs
class Patrol extends Entity {
  cx: number;
  idx = 0;
  dir: 1 | -1 = 1;
  rest = 0;
  lunge = -999;
  started = false;
  moving = false;
  hurt: Hurt;
  private cause0: string;
  private now = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly gaps: number[],
    /** where it goes and rests (the gaps by default); only the gaps are deadly */
    readonly stops: number[] = gaps,
    /** it wakes when Dad is past this x */
    readonly startX = x0 + 16,
    cause = 'svp-magar2',
    /** the cause of the last two gaps */
    readonly cause2 = cause,
  ) {
    super();
    this.layer = 5;
    this.cx = stops[0];
    this.cause0 = cause;
    this.hurt = new Hurt(0, FLOOR - 40, 22, 48, cause, null);
    this.hurt.on = false;
  }
  aim() {
    return { x: this.cx, y: FLOOR + 14 };
  }
  /** px/s toward its next gap, 0 while it rests */
  get heading() {
    return this.rest > 0 ? 0 : Math.sign(this.stops[this.idx] - this.cx);
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    if (!this.started) {
      if (p.cx > this.startX && p.cx < this.x1) {
        this.started = true;
        this.rest = 150;
      } else return;
    }
    if (this.rest > 0) {
      this.rest--;
      if (this.rest === 0) {
        let n = this.idx + this.dir;
        if (n < 0 || n >= this.stops.length) {
          this.dir = (-this.dir) as 1 | -1;
          n = this.idx + this.dir;
        }
        this.idx = n;
      }
    } else {
      const t = this.stops[this.idx];
      const step = 34 * DT;
      if (Math.abs(t - this.cx) <= step) {
        this.cx = t;
        this.rest = 150;
      } else this.cx += Math.sign(t - this.cx) * step;
    }
    const gx = this.gaps.find((g) => Math.abs(g - this.cx) < 10);
    const inWater = Math.abs(p.cx - this.cx) < 18 && p.y + p.h > FLOOR + 14;
    this.hurt.cause = gx !== undefined && this.gaps.indexOf(gx) >= 2 ? this.cause2 : this.cause0;
    this.hurt.on = gx !== undefined || inWater;
    if (this.hurt.on) this.lunge = w.tick;
    this.hurt.x = inWater ? this.cx - 11 : (gx ?? this.cx) - 8;
    this.hurt.w = inWater ? 22 : 16;
    this.hurt.y = inWater ? FLOOR + 8 : FLOOR - 40;
    this.hurt.h = inWater ? 24 : 48;
  }
  draw(ctx: Ctx) {
    if (!this.started) return;
    const lunging = this.now - this.lunge < 14 && this.lunge > 0 && this.gaps.some((g) => Math.abs(g - this.cx) < 10);
    crocBody(ctx, this.cx, lunging ? FLOOR - 14 : FLOOR + 14, 40, this.heading < 0 ? -1 : 1, lunging ? 0.5 : 0.06);
    ctx.fillStyle = 'rgba(70,170,190,0.55)';
    ctx.fillRect(this.cx - 24, FLOOR + 12, 48, 18);
  }
}

/** the long creek; `stale` is the finale's break: the board is not turned any more, read the ripples */
export function buildNala(w: World, x: number, stale: boolean) {
  const spans: [number, number][] = [
    [x + 3, x + 8],
    [x + 9, x + 14],
    [x + 15, x + 20],
    [x + 21, x + 26],
    [x + 27, x + 34],
  ];
  for (const [a, b] of spans) {
    w.add(
      new Plat(px(a), FLOOR, px(b - a), 12, (ctx, q) => {
        ctx.fillStyle = '#7A3E1D';
        ctx.fillRect(q.x, q.y, q.w, q.h);
        ctx.fillStyle = '#A8683A';
        ctx.fillRect(q.x, q.y, q.w, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(q.x, q.y + q.h - 2, q.w, 2);
      }),
    );
  }
  const gaps = [x + 8.5, x + 14.5, x + 20.5, x + 26.5].map(px);
  const pat = new Patrol(px(x + 3), px(x + 34), gaps, gaps, px(x + 3) + 16, stale ? 'svp-magar3' : 'svp-magar2', stale ? 'svp-magar4' : 'svp-magar2');
  w.add(pat);
  w.add(pat.hurt);
  (w.flags.patrols ??= []).push(pat);
  // the stale board points at the last gap and stays there: nobody turned it
  const stuck = { x: gaps[3], y: FLOOR + 14 };
  w.add(new Board(px(x + 0.6), px(10.6), () => (stale ? stuck : pat.aim())));
  w.add(
    new Fx(null, (ctx, w2) => {
      const g = ctx.createLinearGradient(0, FLOOR + 6, 0, FLOOR + 32);
      g.addColorStop(0, 'rgba(70,170,190,0.55)');
      g.addColorStop(1, 'rgba(18,90,110,0.8)');
      ctx.fillStyle = g;
      ctx.fillRect(px(x + 3), FLOOR + 6, px(31), 26);
      if (stale && pat.started) {
        // the ripples follow the crocodile: rings on the water over it
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1;
        for (let k = 0; k < 3; k++) {
          const r = 5 + (((w2.tick >> 1) + k * 9) % 27);
          ctx.globalAlpha = 1 - r / 34;
          ctx.beginPath();
          ctx.ellipse(pat.cx, FLOOR + 8, r, r * 0.28, 0, 0, TAU);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }, 6),
  );
}

export const nala: Act = {
  id: 'svp03-nala',
  w: 36,
  advice: 'A longer creek, and this time the crocodile is already in the water, strolling to and fro under the logs. The board’s arrow shows where it is. It comes up through a gap to whoever is jumping it: cross a gap when the arrow is pointing at another one.',
  cps: [9.1, 15.1, 21.1],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 33).fill(c.x + 3, c.x + 33, 17, 17, '#');
  },
  build: (w, c) => buildNala(w, c.x, false),
};

// ================================================================== the door: the board's arrow and the door's log
// Round 3 (allocation v3, DECISIONS I4): the old door folded the board into a bridge for someone standing by it, and
// that is Kolkata's "stand still so a bridge is made for you". Now the door is 03's own rule: the croc is under the
// door's logs, the board's arrow points at the log it is under, and the gap is safe when the arrow points away.
export const boardBridge: Ending = {
  space: 18,
  after: 4,
  advice: 'The door is across the creek on two logs with one gap between, and the crocodile is under them. The board by the creek has its arrow on whichever log the crocodile is under: jump the gap when the arrow points away from it.',
  paint: (g, D) => {
    g.pit(D - 13, D - 3).fill(D - 13, D - 3, 17, 17, '#');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const spans: [number, number][] = [
      [D - 13, D - 8],
      [D - 7, D - 2],
    ];
    for (const [a, b] of spans) {
      w.add(
        new Plat(px(a), FLOOR, px(b - a), 12, (ctx, q) => {
          ctx.fillStyle = '#7A3E1D';
          ctx.fillRect(q.x, q.y, q.w, q.h);
          ctx.fillStyle = '#A8683A';
          ctx.fillRect(q.x, q.y, q.w, 4);
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.fillRect(q.x, q.y + q.h - 2, q.w, 2);
        }),
      );
    }
    const gap = px(D - 7.5);
    const pat = new Patrol(px(D - 13), px(D - 2), [gap], [gap, px(D - 12), gap, px(D - 3.5)], px(D - 15.5));
    w.add(pat);
    w.add(pat.hurt);
    w.add(new Board(px(D - 17), px(10.6), () => pat.aim()));
    w.flags.doorPatrol = pat;
    w.flags.twist = 'pit';
    w.add(
      new Fx(null, (ctx) => {
        const g = ctx.createLinearGradient(0, FLOOR + 6, 0, FLOOR + 32);
        g.addColorStop(0, 'rgba(70,170,190,0.55)');
        g.addColorStop(1, 'rgba(18,90,110,0.8)');
        ctx.fillStyle = g;
        ctx.fillRect(px(D - 13), FLOOR + 6, px(11), 26);
      }, 6),
    );
  },
};
