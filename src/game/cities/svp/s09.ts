// SVP-09 Jad: Ross Island's ruins, where the roots hold what the walls cannot. Brick looks solid and crumbles a
// moment after you land on it; the roots that wrap the old walls are only roots, and they hold. The room: a cellar of
// brick under a line of roots, one of which swings. The act: roots that are dead are no better than brick, and one
// living root swings. The door hangs over a stair of brick and root.
import { Entity, type LevelDef, type World } from '../../world';
import { DT } from '../../constants';
import { door, rival, collectible } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L } from './lines';
import { Fx, Hurt, Plat, px, TAU, type Ctx } from './kit';

/** a brick (or dead root) that crumbles 0.25 s after you land on it, and falls */
export class Crumbler extends Entity {
  plat: Plat;
  t = -1;
  fallV = 0;
  gone = false;
  private now = 0;
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    readonly kind: 'brick' | 'dead',
    readonly delay = 30,
  ) {
    super();
    this.layer = 1;
    this.plat = new Plat(x, y, w, h, (ctx, q) => this.paint(ctx, q));
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    return this;
  }
  update(w: World) {
    this.now = w.tick;
    if (this.gone) return;
    if (this.t < 0) {
      if (w.standing(this.plat.solid)) {
        this.t = 0;
        w.sfx('rumble', this.plat.x + this.plat.w / 2, this.plat.y);
      }
    } else if (this.t < this.delay) this.t++;
    else {
      this.fallV = Math.min(this.fallV + 1700 * DT, 560);
      this.plat.solid.moveBy(w, 0, this.fallV * DT);
      if (this.plat.y > FLOOR + 90) {
        this.gone = true;
        this.plat.hide();
      }
    }
    if (this.t === this.delay) {
      w.emit('fx', this.plat.x + this.plat.w / 2, this.plat.y, { kind: 'crumble', w: this.plat.w });
      this.t++;
    }
  }
  private paint(ctx: Ctx, q: Plat) {
    const shake = this.t > 0 && this.t < this.delay ? ((this.now * 7) % 3) - 1 : 0;
    const x = q.x + shake;
    if (this.kind === 'brick') {
      ctx.fillStyle = '#9A4A34';
      ctx.fillRect(x, q.y, q.w, q.h);
      ctx.fillStyle = '#B85F45';
      ctx.fillRect(x, q.y, q.w, 3);
      ctx.strokeStyle = 'rgba(244,236,214,0.55)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      for (let r = 0; r * 6 + 6 <= q.h; r++) {
        const yy = q.y + 6 + r * 6;
        ctx.moveTo(x, yy);
        ctx.lineTo(x + q.w, yy);
        for (let c = (r % 2) * 8; c < q.w; c += 16) {
          ctx.moveTo(x + c, yy - 6);
          ctx.lineTo(x + c, yy);
        }
      }
      ctx.stroke();
    } else {
      // a dead root: grey, bare, no leaves
      ctx.fillStyle = '#8D8678';
      ctx.fillRect(x, q.y, q.w, q.h);
      ctx.fillStyle = '#B5AE9C';
      ctx.fillRect(x, q.y, q.w, 2);
      ctx.strokeStyle = '#6B655A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let c = 4; c < q.w - 3; c += 9) {
        ctx.moveTo(x + c, q.y + 1);
        ctx.lineTo(x + c + 3, q.y + q.h);
      }
      ctx.stroke();
    }
    if (this.t > 8 && this.t <= this.delay) {
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + q.w * 0.3, q.y);
      ctx.lineTo(x + q.w * 0.4, q.y + q.h * 0.6);
      ctx.moveTo(x + q.w * 0.7, q.y);
      ctx.lineTo(x + q.w * 0.6, q.y + q.h * 0.7);
      ctx.stroke();
    }
  }
}

/** a living root: it holds. It may swing on its hanging roots once Dad has come near */
export class Root extends Entity {
  plat: Plat;
  x0: number;
  started = false;
  private now = 0;
  constructor(
    x: number,
    y: number,
    w: number,
    readonly amp = 0,
    readonly period = 400,
    readonly startX = 0,
    readonly phase0 = 0,
  ) {
    super();
    this.layer = 1;
    this.x0 = x;
    this.plat = new Plat(x, y, w, 7, (ctx, q) => this.paint(ctx, q), { velX: 0 });
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    return this;
  }
  /** nominal x plus the swing at tick t since start */
  at(t: number) {
    return Math.round(this.x0 + this.amp * Math.sin(this.phase0 + (t * TAU) / this.period));
  }
  t = 0;
  update(w: World) {
    this.now = w.tick;
    if (!this.amp) return;
    if (!this.started) {
      if (w.player.cx >= this.startX) this.started = true;
      else return;
    }
    this.t++;
    const nx = this.at(this.t);
    const dx = nx - this.plat.x;
    // the true speed of the swing (not the pixel steps it is drawn in), so a jump off it carries the right momentum
    this.plat.solid.velX = (this.amp * Math.cos(this.phase0 + (this.t * TAU) / this.period) * (TAU / this.period)) / DT;
    if (dx) this.plat.solid.moveBy(w, dx, 0);
  }
  private paint(ctx: Ctx, q: Plat) {
    // two or three twisted strands, with leaves; a swinging one hangs from the branches above on ropes of root
    if (this.amp) {
      ctx.strokeStyle = '#4A3A28';
      ctx.lineWidth = 2;
      for (const dx of [6, q.w - 6]) {
        ctx.beginPath();
        ctx.moveTo(q.x + dx, q.y);
        ctx.lineTo(q.x + dx - (q.x - this.x0) * 0.25, q.y - 44);
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(244,236,214,0.35)';
    ctx.fillRect(q.x - 2, q.y - 3, q.w + 4, 1.4);
    ctx.fillStyle = '#7A5232';
    ctx.beginPath();
    ctx.moveTo(q.x - 4, q.y + 5);
    ctx.quadraticCurveTo(q.x + q.w * 0.3, q.y - 3, q.x + q.w * 0.5, q.y + 1);
    ctx.quadraticCurveTo(q.x + q.w * 0.75, q.y + 4, q.x + q.w + 4, q.y);
    ctx.lineTo(q.x + q.w + 4, q.y + 6);
    ctx.quadraticCurveTo(q.x + q.w * 0.6, q.y + 10, q.x + q.w * 0.4, q.y + 7);
    ctx.quadraticCurveTo(q.x + q.w * 0.15, q.y + 9, q.x - 4, q.y + 5);
    ctx.fill();
    ctx.strokeStyle = '#7A5A3C';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(q.x, q.y + 3);
    ctx.quadraticCurveTo(q.x + q.w * 0.5, q.y - 1, q.x + q.w, q.y + 2);
    ctx.stroke();
    ctx.fillStyle = '#4FC060';
    for (let x = q.x + 5; x < q.x + q.w - 3; x += 11) {
      ctx.beginPath();
      ctx.ellipse(x, q.y - 2.5, 4.6, 2.4, -0.5, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 4, q.y + 8, 2.8, 1.4, 0.6, 0, TAU);
      ctx.fill();
    }
    void this.now;
  }
}

/** the ruined cellar floor: brick all the way across [c0, c1] over a pit, in pieces of `piece` tiles */
function cellar(w: World, c0: number, c1: number, piece = 4, delay = 30, cause = 'svp-eent') {
  const bricks: Crumbler[] = [];
  for (let c = c0; c <= c1; c += piece) {
    const wd = Math.min(piece, c1 - c + 1);
    bricks.push(new Crumbler(px(c), FLOOR, px(wd), 16, 'brick', delay).install(w));
  }
  w.add(new Hurt(px(c0), FLOOR + 16, px(c1 - c0 + 1), 40, cause, null));
  w.add(
    new Fx(null, (ctx) => {
      const g = ctx.createLinearGradient(0, FLOOR + 14, 0, FLOOR + 60);
      g.addColorStop(0, '#2B1E16');
      g.addColorStop(1, '#120C08');
      ctx.fillStyle = g;
      ctx.fillRect(px(c0), FLOOR + 14, px(c1 - c0 + 1), 50);
      // the old walls of the cellar
      ctx.fillStyle = '#6B3A2A';
      for (let x = px(c0) + 6; x < px(c1 + 1) - 8; x += 40) ctx.fillRect(x, FLOOR + 22, 10, 30);
    }, 0),
  );
  return bricks;
}

// ================================================================== the room
export function jadRoom(): LevelDef {
  return {
    id: 'SVP-09',
    city: 'SVP',
    index: 9,
    name: 'Jad',
    nameEn: 'The roots',
    tagline: 'The British left Ross Island in 1945 and the jungle took it back: the walls are brick, and the roots are what is still holding them up.',
    hint: 'Brick looks solid, but it crumbles a moment after you land on it, and the cellar under it is a long fall. The roots wrapped over the walls hold. Hop up on to the first root and go along them: the middle one swings on its hanging roots, so step across when it is at your end, and off the last one on to the road.',
    par: 22,
    map: Grid.ground(15).pit(8, 23).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      cellar(w, 8, 23);
      const r1 = new Root(px(9), FLOOR - 28, 64).install(w);
      const r2 = new Root(px(14), FLOOR - 28, 64, 18, 560, px(7)).install(w);
      const r3 = new Root(px(20), FLOOR - 28, 64).install(w);
      w.flags.roots = [r1, r2, r3];
      rival(w, 3, 15, 1, { intro: L.intro[7], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-padauk', 16.5, 8.4);
    },
  };
}

// ================================================================== the act
export const pul: Act = {
  id: 'svp09-pul',
  w: 112,
  advice: 'Not every root is alive. A dead root is grey and bare, with no leaves, and it crumbles like brick: only the green ones hold. Take the green ones, and skip the grey ones between them. The middle green one swings. Then the roots make a stair up and down, and a long cellar with more swinging ones.',
  cps: [21.5, 47, 74, 93.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 19);
    g.pit(c.x + 28, c.x + 44);
    g.pit(c.x + 51, c.x + 70);
    g.pit(c.x + 79, c.x + 90);
    g.pit(c.x + 97, c.x + 107);
  },
  build: (w, c) => {
    const x = c.x;
    cellar(w, x + 3, x + 19, 4, 30, 'svp-eent2');
    cellar(w, x + 28, x + 44, 4, 30, 'svp-eent2');
    cellar(w, x + 51, x + 70, 4, 30, 'svp-eent2');
    cellar(w, x + 79, x + 90, 4, 30, 'svp-eent2');
    cellar(w, x + 97, x + 107, 4, 30, 'svp-eent2');
    // first creek of ruin: green, green (swinging), a grey step to tempt you, green
    const y = FLOOR - 28;
    new Root(px(x + 4), y, 64).install(w);
    const sw = new Root(px(x + 10), y, 64, 12, 520, px(x + 5)).install(w);
    new Crumbler(px(x + 15) + 8, y, 16, 7, 'dead', 20).install(w);
    new Root(px(x + 17), y, 48).install(w);
    // second: a swing, a grey step lower down under the gap (it will not hold you if you fall short), and the last green on to the road
    new Root(px(x + 29), y, 64).install(w);
    const sw2 = new Root(px(x + 35), y, 64, 12, 540, px(x + 27), 1.2).install(w);
    new Crumbler(px(x + 39) + 8, y + 18, 16, 7, 'dead', 20).install(w);
    new Root(px(x + 41), y, 48).install(w);
    // third: a stair of roots up and down, with a brick landing at the top that is not a landing
    new Root(px(x + 52), FLOOR - 28, 64).install(w);
    new Root(px(x + 57), FLOOR - 56, 64).install(w);
    new Root(px(x + 62), FLOOR - 56, 64).install(w);
    new Root(px(x + 67), FLOOR - 28, 64).install(w);
    new Crumbler(px(x + 59), FLOOR - 12, 32, 12, 'brick', 20).install(w);
    // fourth: a long cellar of roots, two of them swinging, with a stretch of sound floor in the middle to get your breath on
    const sw3 = new Root(px(x + 86), y, 64, 12, 520, px(x + 77.5), 0.4).install(w);
    const sw4 = new Root(px(x + 98), y, 64, 12, 560, px(x + 77.5), 2.1).install(w);
    new Root(px(x + 80), y, 64).install(w);
    new Root(px(x + 104), y, 64).install(w);
    (w.flags.swingers ??= []).push(sw, sw2, sw3, sw4);
  },
};

// ================================================================== the door
export const frameDoor: Ending = {
  space: 17,
  advice: 'The door stands in what is left of the ballroom’s doorframe, up on the old floor, and the way up is a stair of brick and root. Take the roots: the brick steps go as soon as you land.',
  paint: (g, D) => {
    g.fill(D - 3, D + 3, 11, 14, '#');
    g.put(D, 14, '.');
    g.put(D, 10, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    // up the stair of roots to the old floor where the door stands; the brick step at the foot of it is not a step
    new Root(px(D - 12), FLOOR - 28, 64).install(w);
    new Root(px(D - 8), FLOOR - 52, 64).install(w);
    w.flags.twist = 'frame';
  },
};
