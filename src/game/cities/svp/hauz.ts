// Hauz, the drained pool on Ross Island (rising water): the pool is dry and its floor is the ground, with a raft
// sitting on it and a high wall at the far end. Walk into it and a pipe in the wall starts to run. The water rises
// until it laps the top of the wall, and it takes the raft up with it: be on the raft. Anyone on the floor when it
// gets above their boots is drowned, and the wall is too high to jump. After a while it drains again.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, Plat, FLOOR, px, TAU, type Ctx } from './kit';

export const GURGLE = 150;
const SPEED = 12;
const HOLD = 330;
const DEADLY = 18;

/** one pool: its water, its raft, the wall it laps */
export class Pool extends Entity {
  raft: Plat;
  /** how far up the water is, px */
  level = 0;
  state: 'idle' | 'gurgle' | 'rise' | 'hold' | 'fall' = 'idle';
  /** the level the raft has to reach to be even with the wall top */
  readonly top: number;
  readonly hurt: Hurt;
  private n = 0;
  private now = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    raftX: number,
    wallTop: number,
  ) {
    super();
    this.layer = 5;
    this.top = FLOOR - 6 - wallTop + 3;
    this.raft = new Plat(raftX, FLOOR - 6, 48, 6, (ctx, q) => this.drawRaft(ctx, q));
    this.hurt = new Hurt(x0, FLOOR, x1 - x0, 0, 'svp-hauz', null);
    this.hurt.on = false;
  }
  install(w: World) {
    w.add(this);
    w.add(this.raft);
    w.add(this.hurt);
    return this;
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    const inside = p.cx > this.x0 + 6 && p.cx < this.x1 && p.y + p.h > FLOOR - 120;
    if (this.state === 'idle') {
      if (inside && w.state === 'play') {
        this.state = 'gurgle';
        this.n = 0;
        w.sfx('splash', this.x1, FLOOR);
      }
    } else if (this.state === 'gurgle') {
      if (++this.n >= GURGLE) this.state = 'rise';
    } else if (this.state === 'rise') {
      this.level = Math.min(this.top, this.level + SPEED * DT);
      if (this.level >= this.top) {
        this.state = 'hold';
        this.n = 0;
      }
    } else if (this.state === 'hold') {
      if (++this.n >= HOLD) this.state = 'fall';
    } else {
      this.level = Math.max(0, this.level - SPEED * 2 * DT);
      if (this.level <= 0) this.state = 'idle';
    }
    const dy = Math.round(FLOOR - 6 - this.level) - this.raft.y;
    if (dy) this.raft.solid.moveBy(w, 0, dy);
    // the water is deadly once it is above somebody's boots
    const h = Math.max(0, this.level - 2);
    this.hurt.y = FLOOR - h;
    this.hurt.h = h;
    this.hurt.on = this.level > DEADLY;
  }
  private drawRaft(ctx: Ctx, q: Plat) {
    ctx.fillStyle = '#8A5A34';
    ctx.fillRect(q.x, q.y, q.w, q.h);
    ctx.fillStyle = '#C79A5E';
    ctx.fillRect(q.x, q.y, q.w, 2);
    ctx.fillStyle = '#2F6F8F';
    ctx.fillRect(q.x + 4, q.y + q.h, 10, 5);
    ctx.fillRect(q.x + q.w - 14, q.y + q.h, 10, 5);
  }
  draw(ctx: Ctx, w: World) {
    const { x0, x1 } = this;
    // the pipe in the wall: a stream while it runs
    if (this.state !== 'idle') {
      ctx.fillStyle = '#3F4A52';
      ctx.fillRect(x1 - 6, FLOOR - 20, 10, 8);
      ctx.fillStyle = 'rgba(150,215,235,0.9)';
      for (let i = 0; i < 4; i++) {
        const k = (w.tick * 2 + i * 9) % 36;
        ctx.fillRect(x1 - 12 - k * 0.5, FLOOR - 14 + k * 0.45, 3, 2);
      }
    }
    if (this.level > 0.5) {
      const y = FLOOR - this.level;
      ctx.fillStyle = 'rgba(60,150,180,0.62)';
      ctx.fillRect(x0, y, x1 - x0, this.level);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = x0; x <= x1; x += 5) {
        const yy = y + Math.sin(x / 9 - w.tick * 0.12) * 1.6;
        if (x === x0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
    } else {
      // the dry pool: a stained tile line along the floor
      ctx.fillStyle = 'rgba(110,150,160,0.35)';
      ctx.fillRect(x0, FLOOR - 3, x1 - x0, 3);
    }
    void TAU;
  }
}

/** SVP-09's second act: three drained pools with a raft in each, and a wall each higher than the last */
export const hauz: Act = {
  id: 'svp09-hauz',
  w: 66,
  advice: 'The old swimming pools of Ross Island, drained, and a raft in each. Walk in and a pipe in the wall starts to run: the water rises to the top of the wall and takes the raft with it. Be on the raft. When it is level with the wall, step across, and walk on. The floor is not the place to be.',
  cps: [25, 46],
  paint: (g, c) => {
    const x = c.x;
    // three walls, 5, 7 and 9 tiles high, at the far end of each pool
    g.fill(x + 14, x + 16, 10, 14, '#');
    g.fill(x + 34, x + 36, 8, 14, '#');
    g.fill(x + 54, x + 56, 6, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const tops = [FLOOR - 5 * 16, FLOOR - 7 * 16, FLOOR - 9 * 16];
    [6, 26, 46].forEach((p, i) => {
      const pool = new Pool(px(x + p), px(x + p + 8), px(x + p + 2), tops[i]).install(w);
      (w.flags.pools ??= []).push(pool);
    });
  },
};
