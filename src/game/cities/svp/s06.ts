// SVP-06 Tote: parrots at dusk over the mangroves. The branch over the creek is too high to reach, until the flock
// comes in and its weight bends the branch down. A bent branch is too low for the cliff, though: when the ship's horn
// sounds the whole flock leaves at once and the branch springs back up, slowly, with whoever is on it. The act is two
// more creeks like that; the door is on a bough that bobs with the flock.
import { Entity, type LevelDef, type World } from '../../world';
import { DT } from '../../constants';
import { door, rival, collectible } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L } from './lines';
import { Fx, Hurt, Plat, px, TAU, type Ctx } from './kit';

export const UP = FLOOR - 96;
export const BENT = FLOOR - 24;
const COME = 360,
  SAG = 150,
  HELD = 600,
  SPRING = 420,
  REST = 420;
const CYCLE = COME + SAG + HELD + SPRING + REST;

/** the flock: when it starts (Dad passes `startX`) it comes in, settles, and on the horn leaves all at once */
export class Flock extends Entity {
  t = -1;
  weight = 0;
  horn = -999;
  private now = 0;
  constructor(
    readonly startX: number,
    readonly perch: [number, number],
    readonly n = 9,
  ) {
    super();
    this.layer = 6;
  }
  /** where in the cycle: 'away' | 'coming' | 'landed' | 'leaving' | 'rest' */
  get phase() {
    if (this.t < 0) return 'away';
    const t = this.t % CYCLE;
    if (t < COME) return 'coming';
    if (t < COME + SAG + HELD) return t < COME + SAG ? 'sagging' : 'landed';
    if (t < COME + SAG + HELD + SPRING) return 'leaving';
    return 'rest';
  }
  /** ticks until the horn, or -1 */
  get hornIn() {
    if (this.t < 0) return -1;
    const t = this.t % CYCLE;
    return t < COME + SAG + HELD ? COME + SAG + HELD - t : -1;
  }
  update(w: World) {
    this.now = w.tick;
    if (this.t < 0) {
      if (w.player.cx >= this.startX) this.t = 0;
      else return;
    } else this.t++;
    const t = this.t % CYCLE;
    if (t === COME + SAG + HELD) {
      this.horn = w.tick;
      w.sfx('thud', this.perch[0], FLOOR - 60);
      w.say('BHOOOONG!', this.perch[0] + 60, FLOOR - 120, 1.6, 'npc');
    }
    if (t < COME) this.weight = 0;
    else if (t < COME + SAG) this.weight = (t - COME) / SAG;
    else if (t < COME + SAG + HELD) this.weight = 1;
    else if (t < COME + SAG + HELD + SPRING) this.weight = 1 - (t - COME - SAG - HELD) / SPRING;
    else this.weight = 0;
  }
  draw(ctx: Ctx) {
    if (this.t < 0) return;
    const t = this.t % CYCLE;
    const [x0, x1] = this.perch;
    const y = UP + (BENT - UP) * this.weight;
    for (let i = 0; i < this.n; i++) {
      const sx = x0 + 12 + ((x1 - x0 - 24) * (i + 0.5)) / this.n;
      let bx = sx,
        by = y - 6;
      let fly = 0;
      if (t < COME) {
        // flying in from the sea, one after another
        const k = Math.max(0, Math.min(1, (t - i * 14) / (COME - this.n * 14)));
        bx = sx + (1 - k) * 260;
        by = y - 6 - (1 - k) * (70 + (i % 3) * 14) - Math.sin(k * Math.PI) * 18;
        fly = k < 1 ? 1 : 0;
      } else if (t >= COME + SAG + HELD && t < COME + SAG + HELD + 70) {
        const k = (t - (COME + SAG + HELD)) / 70;
        bx = sx - k * 40 - (i % 3) * 20 * k;
        by = y - 6 - k * (110 + (i % 4) * 14);
        fly = 1;
      } else if (t >= COME + SAG + HELD + 70) continue;
      if (t >= COME && t < COME + SAG + HELD && t < COME + 40 + i * 6) {
        // still settling
        fly = 0;
      }
      parrot(ctx, bx, by, fly ? Math.sin((this.now + i * 5) * 0.6) : 0, fly === 1);
    }
  }
}

function parrot(ctx: Ctx, x: number, y: number, flap: number, flying: boolean) {
  ctx.fillStyle = '#35A845';
  ctx.beginPath();
  ctx.ellipse(x, y, 4.2, 2.6, flying ? -0.2 : -0.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#2B8A38';
  ctx.beginPath();
  if (flying) {
    ctx.moveTo(x - 1, y);
    ctx.lineTo(x - 4, y - 4 - flap * 3);
    ctx.lineTo(x + 2, y - 1);
  } else {
    ctx.moveTo(x - 3, y + 1);
    ctx.lineTo(x - 8, y + 5);
    ctx.lineTo(x - 2, y + 3);
  }
  ctx.fill();
  ctx.fillStyle = '#E8423A';
  ctx.fillRect(x + 3, y - 2.6, 2.4, 2);
  ctx.fillStyle = '#F2C230';
  ctx.fillRect(x + 4.6, y - 1.6, 2, 1.4);
}

/** a branch over a gap: its height follows the flock's weight */
export class Bough extends Entity {
  plat: Plat;
  constructor(
    readonly flock: Flock,
    readonly x0: number,
    readonly x1: number,
    readonly bent = BENT,
    readonly up = UP,
  ) {
    super();
    this.layer = 1;
    this.plat = new Plat(x0, up, x1 - x0, 8, (ctx, q) => this.draw2(ctx, q));
    this.plat.solid.velX = 0;
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    return this;
  }
  update(w: World) {
    const y = Math.round(this.up + (this.bent - this.up) * this.flock.weight);
    const dy = y - this.plat.y;
    if (dy) this.plat.solid.moveBy(w, 0, dy);
  }
  private draw2(ctx: Ctx, q: Plat) {
    // the limb: a thick brown bough with leaf clumps, thinner at the tip
    ctx.fillStyle = '#6B4A34';
    ctx.beginPath();
    ctx.moveTo(q.x - 6, q.y - 2);
    ctx.lineTo(q.x + q.w, q.y);
    ctx.lineTo(q.x + q.w, q.y + 5);
    ctx.lineTo(q.x - 6, q.y + 11);
    ctx.fill();
    ctx.fillStyle = '#8A6644';
    ctx.fillRect(q.x, q.y, q.w, 2);
    ctx.fillStyle = '#2E6F40';
    for (let x = q.x + 6; x < q.x + q.w - 4; x += 22) {
      ctx.beginPath();
      ctx.ellipse(x, q.y + 8, 9, 4, 0, 0, TAU);
      ctx.fill();
    }
    // the trunk it grows from
    ctx.fillStyle = '#5A3E2B';
    ctx.fillRect(q.x - 12, q.y - 4, 8, FLOOR - q.y + 4);
    ctx.fillStyle = '#2E6F40';
    ctx.beginPath();
    ctx.ellipse(q.x - 8, q.y - 6, 16, 8, 0, 0, TAU);
    ctx.fill();
  }
}

function mud(w: World, x0: number, x1: number, cause = 'svp-kichad') {
  w.add(new Hurt(x0, FLOOR + 10, x1 - x0, 40, cause, null));
  w.add(
    new Fx(null, (ctx, w2) => {
      const g = ctx.createLinearGradient(0, FLOOR + 8, 0, FLOOR + 48);
      g.addColorStop(0, '#6A5440');
      g.addColorStop(1, '#3E2F22');
      ctx.fillStyle = g;
      ctx.fillRect(x0, FLOOR + 8, x1 - x0, 40);
      ctx.fillStyle = 'rgba(190,160,120,0.5)';
      for (let i = 0; i < (x1 - x0) / 24; i++) {
        ctx.beginPath();
        ctx.arc(x0 + 10 + i * 24 + ((i * 7) % 9), FLOOR + 16 + ((i * 5) % 14), 1.5 + (((w2.tick >> 4) + i) % 3) * 0.5, 0, TAU);
        ctx.fill();
      }
    }, 5),
  );
}

// ================================================================== the room
export function toteRoom(): LevelDef {
  return {
    id: 'SVP-06',
    city: 'SVP',
    index: 6,
    name: 'Tote',
    nameEn: 'The parrots come in',
    tagline: 'At dusk the parrots come in from Baratang and every mangrove bends under them. The ship’s horn sends them off again, all at once.',
    hint: 'The branch over the mud is too high to reach until the flock lands: their weight bends it down, and you can hop on. A bent branch is too low for the cliff, though. Stay on it: when the ship’s horn sounds the parrots go all at once and the branch springs back up, slowly, and lifts you to the cliff top. Walk off on to it.',
    par: 20,
    map: Grid.ground(15).pit(12, 21).fill(22, 31, 9, 14, '#').put(1, 14, '@').put(30, 8, 'E').rows(),
    build(w: World) {
      door(w);
      const flock = new Flock(px(5), [px(12), px(22)]);
      w.add(flock);
      const bough = new Bough(flock, px(12), px(21)).install(w);
      w.flags.flock = flock;
      w.flags.bough = bough;
      mud(w, px(12), px(22));
      rival(w, 3, 15, 1, { intro: L.intro[4], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-machhli', 17.5, 11.4);
    },
  };
}

// ================================================================== the act
export const sanjh: Act = {
  id: 'svp06-sanjh',
  w: 46,
  advice: 'Two more creeks, one after the other. The same flock, the same horn: a cliff, a creek, a branch that bends and springs back. Each branch has its own flock, and each is only up for a few seconds after its horn, so be on it when the parrots go. Step off the cliff to go on.',
  cps: [20.5],
  paint: (g, c) => {
    const x = c.x;
    // the room's cliff goes on a little, a creek, a second cliff; then down to the road for the next creek
    g.fill(x, x + 3, 9, 14, '#');
    g.pit(x + 4, x + 11);
    g.fill(x + 12, x + 19, 9, 14, '#');
    g.pit(x + 26, x + 33);
    g.fill(x + 34, x + 41, 9, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const f1 = new Flock(px(x + 0.5), [px(x + 4), px(x + 11)], 8);
    const f2 = new Flock(px(x + 22), [px(x + 26), px(x + 33)], 8);
    w.add(f1);
    w.add(f2);
    const b1 = new Bough(f1, px(x + 4), px(x + 11)).install(w);
    const b2 = new Bough(f2, px(x + 26), px(x + 33)).install(w);
    (w.flags.flocks ??= []).push(f1, f2);
    (w.flags.boughs ??= []).push(b1, b2);
    mud(w, px(x + 4), px(x + 12), 'svp-kichad2');
    mud(w, px(x + 26), px(x + 34), 'svp-kichad2');
  },
};

// ================================================================== the door on the bough
export const boughDoor: Ending = {
  space: 12,
  advice: 'The door is hung on the last bough, and the bough bobs with the flock: down while they sit on it, up when the horn sends them off. Hop on while it’s low, and the door goes up and down with you.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const flock = new Flock(px(D - 12), [px(D - 4), px(D + 3)], 7);
    w.add(flock);
    const b = new Bough(flock, px(D - 4), px(D + 3), FLOOR - 22, FLOOR - 70).install(w);
    d.follow = () => ({ x: px(D) - 4, y: b.plat.y - 32 });
    w.flags.twist = 'bough';
    w.flags.boughdoor = { flock, b };
  },
};
