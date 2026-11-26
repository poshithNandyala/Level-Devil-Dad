// SVP-04 Hiran: the Ross Island deer. The fritter stall hands you a fritter as you pass, and the herd follows whoever
// holds food, right up to your heels. Stand still and Dad puts it down: then the herd goes to the food instead. The
// road ends at a pit with a boat that is late. Wait at the edge with food, or with food just put down, and the herd
// nudges you in. Put it down well back from the edge. The act has the stall three tiles from the pit; the door has
// the jetty guard, who will not let anyone in with food in hand.
import { Entity, type LevelDef, type World } from '../../world';
import { DT } from '../../constants';
import { door, rival, collectible, sign } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR, lock, npc, Paint } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L, X } from './lines';
import { Fx, Hurt, Plat, plank, px, TAU, type Ctx } from './kit';

/** a spotted deer: sleeping (lying down), awake, or eating */
function deerArt(ctx: Ctx, x: number, feet: number, dir: 1 | -1, mode: 'sleep' | 'awake' | 'eat', t: number, stag: boolean) {
  ctx.save();
  ctx.translate(x, feet);
  ctx.scale(dir, 1);
  const hop = mode === 'awake' ? Math.abs(Math.sin(t * 0.35)) * 2 : 0;
  ctx.translate(0, -hop);
  const body = '#B9773F';
  if (mode === 'sleep') {
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, -4, 9, 4.5, 0, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(8, -6, 3.4, 2.6, -0.3, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = '#8A5A30';
    ctx.fillRect(-6, -6, 1.8, 6);
    ctx.fillRect(-2, -6, 1.8, 6);
    ctx.fillRect(3, -6, 1.8, 6);
    ctx.fillRect(6.5, -6, 1.8, 6);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, -8, 9, 4.6, 0, 0, TAU);
    ctx.fill();
    // neck and head
    const hy = mode === 'eat' ? -3 : -15;
    ctx.beginPath();
    ctx.moveTo(5, -10);
    ctx.lineTo(9, hy + 1);
    ctx.lineTo(11, hy + 1);
    ctx.lineTo(8, -7);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(11, hy, 3.2, 2.2, 0.3, 0, TAU);
    ctx.fill();
    if (stag && mode !== 'eat') {
      ctx.strokeStyle = '#D8C8A0';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(10, hy - 2);
      ctx.lineTo(8, hy - 9);
      ctx.moveTo(9, hy - 6);
      ctx.lineTo(12, hy - 8);
      ctx.moveTo(11, hy - 2);
      ctx.lineTo(13, hy - 8);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#F4ECD6';
  for (const [sx, sy] of [[-4, -9], [-1, -7], [2, -10], [-6, -6], [4, -7]]) ctx.fillRect(sx, sy + (mode === 'sleep' ? 3 : 0), 1.3, 1.3);
  ctx.restore();
}

export class Deer {
  mode: 'sleep' | 'awake' | 'eat' = 'sleep';
  dir: 1 | -1 = 1;
  constructor(
    public x: number,
    readonly i: number,
  ) {}
}

/** the herd, the stalls that hand out food, the food on the ground, and what the deer do about all that */
export class Herd extends Entity {
  deer: Deer[];
  carrying = false;
  food: number | null = null;
  started = false;
  lastNudge = -999;
  private still = 0;
  private now = 0;
  hurt: Hurt;
  /** the pit: [x0, x1] px */
  constructor(
    deerX: number[],
    readonly stalls: { x: number; used: boolean }[],
    readonly pit: [number, number],
    /** the deer don't go past this x (px) */
    readonly limit: number,
  ) {
    super();
    this.layer = 2;
    this.deer = deerX.map((x, i) => new Deer(x, i));
    this.hurt = new Hurt(pit[0], FLOOR + 10, pit[1] - pit[0], 40, 'fell', null);
  }
  install(w: World) {
    w.add(this);
    w.add(this.hurt);
    return this;
  }
  private target(i: number, w: World): number | null {
    if (this.carrying) return w.player.cx - 8 - 13 * i;
    if (this.food !== null) return this.food - 8 - 13 * i;
    return null;
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    // a stall hands over a fritter to whoever passes (on foot or in the air)
    if (!this.carrying) {
      for (const s of this.stalls)
        if (!s.used && Math.abs(p.cx - s.x) < 11 && p.y + p.h > FLOOR - 40 && w.state === 'play') {
          s.used = true;
          this.carrying = true;
          this.food = null;
          this.started = true;
          w.sfx('collect', s.x, FLOOR - 10);
          for (const d of this.deer) d.mode = 'awake';
        }
    } else {
      // stand still on the ground and Dad puts the fritter down
      if (p.onGround && Math.abs(p.vx) < 3 && !w.input.left && !w.input.right) this.still++;
      else this.still = 0;
      if (this.still > 66) {
        this.carrying = false;
        this.food = p.cx;
        this.still = 0;
        w.sfx('pop', p.cx, FLOOR);
      }
    }
    for (const d of this.deer) {
      if (d.mode === 'sleep') continue;
      const tg = this.target(d.i, w);
      if (tg === null) continue;
      const dx = Math.min(tg, this.limit) - d.x;
      if (Math.abs(dx) > 1) {
        d.x += Math.sign(dx) * Math.min(Math.abs(dx), 130 * DT);
        d.dir = dx > 0 ? 1 : -1;
        d.mode = 'awake';
      } else d.mode = this.food !== null && !this.carrying ? 'eat' : 'awake';
      // a deer that gets to you leans on you
      if (Math.abs(p.cx - d.x) < 19 && p.y + p.h > FLOOR - 14 && w.state === 'play') {
        p.pushVx = 150 * Math.sign(p.cx - d.x || 1);
        this.lastNudge = w.tick;
      }
    }
    this.hurt.cause = w.tick - this.lastNudge < 180 ? 'svp-hiran' : 'fell';
  }
  draw(ctx: Ctx, w: World) {
    for (const s of this.stalls) {
      // the fritter stall: a tin awning over a tray
      ctx.fillStyle = '#4A3A2A';
      ctx.fillRect(s.x - 10, FLOOR - 26, 2, 26);
      ctx.fillRect(s.x + 8, FLOOR - 26, 2, 26);
      ctx.fillStyle = s.used ? '#9AA3A8' : '#1F7A8C';
      ctx.fillRect(s.x - 13, FLOOR - 30, 26, 5);
      ctx.fillStyle = '#C8A06A';
      ctx.fillRect(s.x - 9, FLOOR - 8, 18, 4);
      if (!s.used) {
        ctx.fillStyle = '#E3A93A';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.ellipse(s.x - 5 + i * 5, FLOOR - 10, 2.6, 1.8, 0, 0, TAU);
          ctx.fill();
        }
      }
    }
    for (const d of this.deer) deerArt(ctx, d.x, FLOOR, d.dir, d.mode, w.tick + d.i * 7, d.i % 2 === 0);
    // the fritter in Dad's hand, or on the ground
    const p = w.player;
    ctx.fillStyle = '#E3A93A';
    if (this.carrying) {
      ctx.beginPath();
      ctx.ellipse(p.cx + (p.facing > 0 ? 6 : -6), p.y + 8, 3.2, 2.2, 0, 0, TAU);
      ctx.fill();
    } else if (this.food !== null) {
      ctx.beginPath();
      ctx.ellipse(this.food, FLOOR - 2, 3.4, 2.2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#C07A1B';
      ctx.fillRect(this.food - 2, FLOOR - 2.5, 4, 1);
    }
    void this.now;
  }
}

/** the late boat across the pit: it starts when the first fritter has been handed over */
export class LateBoat extends Entity {
  boat: Plat;
  docked = false;
  private prevX = 0;
  private t = 0;
  private plan: ('wait' | 'go' | 'back')[] = [];
  constructor(
    readonly herd: Herd,
    readonly L0: number,
    readonly R0: number,
    readonly waitS: number,
    readonly goS: number,
  ) {
    super();
    this.layer = 1;
    this.prevX = R0;
    this.boat = new Plat(R0, FLOOR, 40, 8, (ctx, q) => {
      ctx.fillStyle = '#F2F2EA';
      ctx.beginPath();
      ctx.moveTo(q.x - 4, q.y);
      ctx.lineTo(q.x + q.w + 4, q.y);
      ctx.lineTo(q.x + q.w - 2, q.y + 10);
      ctx.lineTo(q.x + 2, q.y + 10);
      ctx.fill();
      ctx.fillStyle = '#1F7A8C';
      ctx.fillRect(q.x, q.y + 2, q.w, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(q.x + 2, q.y + 8, q.w - 4, 2);
    });
  }
  install(w: World) {
    w.add(this);
    w.add(this.boat);
    return this;
  }
  update(w: World) {
    if (!this.herd.started) return;
    const s = this.boat.solid;
    // wait at the far dock, come across, wait at the near dock, go back, again
    const cycle = this.waitS + this.goS + 1.6 + this.goS + 0.6;
    const t = (this.t++ * DT) % cycle;
    let x: number;
    if (t < this.waitS) x = this.R0;
    else if (t < this.waitS + this.goS) x = this.R0 + (this.L0 - this.R0) * ease((t - this.waitS) / this.goS);
    else if (t < this.waitS + this.goS + 1.6) x = this.L0;
    else if (t < this.waitS + this.goS + 1.6 + this.goS) x = this.L0 + (this.R0 - this.L0) * ease((t - this.waitS - this.goS - 1.6) / this.goS);
    else x = this.R0;
    this.docked = Math.abs(x - this.L0) < 1 && t < this.waitS + this.goS + 1.6 - 0.2;
    const dx = Math.round(x) - s.x;
    // the true speed, not the pixel steps it is drawn in, so a hop off the boat carries the right momentum
    s.velX = (x - this.prevX) / DT;
    this.prevX = x;
    if (dx) s.moveBy(w, dx, 0);
    void w;
  }
}
const ease = (k: number) => k * k * (3 - 2 * k);

function pitWater(ctx: Ctx, x0: number, x1: number, w: World) {
  const g = ctx.createLinearGradient(0, FLOOR + 8, 0, FLOOR + 40);
  g.addColorStop(0, 'rgba(70,170,190,0.9)');
  g.addColorStop(1, 'rgba(18,90,110,0.95)');
  ctx.fillStyle = g;
  ctx.fillRect(x0, FLOOR + 8, x1 - x0, 32);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 0.8;
  for (let x = x0 + ((w.tick * 0.3) % 14); x < x1 - 6; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, FLOOR + 8.5);
    ctx.lineTo(x + 6, FLOOR + 8.5);
    ctx.stroke();
  }
}

// ================================================================== the room
const PIT: [number, number] = [px(20), px(26)];

export function hiranRoom(): LevelDef {
  return {
    id: 'SVP-04',
    city: 'SVP',
    index: 4,
    name: 'Hiran',
    nameEn: 'The deer of Ross Island',
    tagline: 'Everyone on Ross Island is told not to feed the deer. Nobody has told the deer.',
    hint: 'The stall hands you a fritter as you pass, and the herd follows whoever holds food, right up to your heels. At the edge of the pit, where you wait for the late boat, they lean on you and in you go. Stand still and Dad puts the fritter down: the herd goes to the food instead, and the food is wherever you put it. Do it well back from the edge, then wait for the boat in peace.',
    par: 22,
    map: Grid.ground(15).pit(20, 25).put(6, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const herd = new Herd([px(1) + 6, px(2) + 6, px(3) + 6], [{ x: px(10) + 8, used: false }], PIT, PIT[0] - 8).install(w);
      const boat = new LateBoat(herd, PIT[0], PIT[1] - 40, 5.2, 2.0).install(w);
      w.flags.herd = herd;
      w.flags.boat = boat;
      w.add(new Fx(null, (ctx, w2) => pitWater(ctx, PIT[0], PIT[1], w2), 5));
      sign(w, 14.2, 10.4, 3.4, 'ROSS ISLAND', 'shop', null, 'hiran');
      rival(w, 4, 15, 1, { intro: L.intro[2], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-kela', 22.5, 11.6);
    },
  };
}

// ================================================================== the act: the stall by the edge
export const ghat: Act = {
  id: 'svp04-ghat',
  w: 34,
  advice: 'A second landing, and this time the stall is only three tiles from the edge: the fritter is yours the moment you pass it. Put it down where you stand, right there at the stall, and the herd gathers there, away from the pit. Then wait for the boat.',
  cps: [1],
  paint: (g, c) => {
    g.pit(c.x + 17, c.x + 22);
  },
  build: (w, c) => {
    const x0 = px(c.x + 17),
      x1 = px(c.x + 23);
    const herd = new Herd([px(c.x + 1) + 6, px(c.x + 2) + 6, px(c.x + 3) + 6], [{ x: px(c.x + 13) + 8, used: false }], [x0, x1], x0 - 8).install(w);
    const boat = new LateBoat(herd, x0, x1 - 40, 3.6, 1.8).install(w);
    (w.flags.herds ??= []).push(herd);
    (w.flags.boats ??= []).push(boat);
    w.add(new Fx(null, (ctx, w2) => pitWater(ctx, x0, x1, w2), 5));
    sign(w, c.x + 6, 10.4, 3.6, 'JETTY 2', 'shop', null, 'ship');
  },
};

// ================================================================== the door: the jetty guard
export const jettyGuard: Ending = {
  space: 14,
  advice: 'The jetty guard stands at the door and will not let anyone in with food in hand: "Hiran ko khana mat do!" The last fritter stall is on the way. Put it down before the guard, stand still till it is down, and then the door is yours.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const lk = lock(w, d, X.deer);
    const herd = new Herd([px(D - 13) + 6, px(D - 12) + 6, px(D - 11) + 6], [{ x: px(D - 8) + 8, used: false }], [px(D + 20), px(D + 21)], px(D - 3)).install(w);
    w.flags.guard = herd;
    w.flags.twist = 'guard';
    w.onTick((w2) => {
      if (!herd.carrying && herd.stalls[0].used && !lk.open) {
        lk.unlock();
        w2.flags.twist = 'open';
      } else if (herd.carrying && lk.open) {
        // food in hand again: the guard shuts the door
        w2.flags.twist = 'guard';
      }
    });
    // the guard
    w.add(
      new Paint((ctx, w2) => {
        const x = d.x - 14,
          y = FLOOR;
        ctx.fillStyle = '#2E3F57';
        ctx.fillRect(x - 3, y - 20, 7, 14);
        ctx.fillStyle = '#C68B59';
        ctx.beginPath();
        ctx.arc(x, y - 24, 4, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#2E3F57';
        ctx.fillRect(x - 5, y - 29, 10, 3);
        ctx.fillStyle = '#2E2A36';
        ctx.fillRect(x - 3, y - 6, 3, 6);
        ctx.fillRect(x + 1, y - 6, 3, 6);
        if (herd.carrying) {
          ctx.strokeStyle = '#C0392B';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(x + 4, y - 17);
          ctx.lineTo(x + 12, y - 25 + ((w2.tick >> 4) & 1));
          ctx.stroke();
        }
      }, 3),
    );
    void npc;
    void plank;
  },
};
