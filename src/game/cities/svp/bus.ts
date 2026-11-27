// Mohanpura bus stand (SVP-07's momentum and sound beat): the lane is shut by a barrier arm that lifts only for the
// bus. A bus about to leave rolls BACK a little first, its engine note rising as it does, and then pulls away at
// speed. Whoever waits right behind it is rolled over, whoever runs ahead of it down the lane is run down, and the way
// through is on its roof: it carries you to the barrier and the barrier lifts for it.
// The decision: where do I stand when the engine note rises, so that neither the roll back nor the pull away has me.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, Plat, FLOOR, px, type Ctx } from './kit';

const LEN = 80;
const H = 28;
const BACK = 24;

export class Bus extends Entity {
  plat: Plat;
  /** ticks since Dad came near the bus; -1 until he does */
  t = -1;
  x: number;
  v = 0;
  rolled = 0;
  stopped = false;
  private rear: Hurt;
  private front: Hurt;
  constructor(
    readonly x0: number,
    readonly trigger: number,
    readonly stopX: number,
    readonly gate: Plat,
  ) {
    super();
    this.layer = 3;
    this.x = x0;
    this.plat = new Plat(x0, FLOOR - H, LEN, H, (ctx, q) => this.paintBus(ctx, q), { velX: 0 });
    this.rear = new Hurt(0, FLOOR - H, BACK + 4, H, 'svp-bus', null);
    this.front = new Hurt(0, FLOOR - H, 14, H, 'svp-bus-aage', null);
    this.rear.on = false;
    this.front.on = false;
  }
  install(w: World) {
    w.add(this);
    w.add(this.plat);
    w.add(this.rear);
    w.add(this.front);
    return this;
  }
  get phase(): 'wait' | 'note' | 'back' | 'go' | 'stop' {
    if (this.t < 0) return 'wait';
    if (this.stopped) return 'stop';
    if (this.t < 70) return 'wait';
    if (this.t < 130) return 'note';
    if (this.t < 160) return 'back';
    return 'go';
  }
  update(w: World) {
    const p = w.player;
    if (this.t < 0) {
      if (p.cx > this.trigger && p.cx < this.x0) this.t = 0;
      else return;
    } else if (!this.stopped) this.t++;
    const s = this.plat.solid;
    const ph = this.phase;
    // the engine note: faster and faster until the bus rolls back
    if (ph === 'note') {
      const rate = Math.max(6, 24 - Math.floor((this.t - 70) / 4));
      if (this.t % rate === 0) w.sfx('rumble', this.x + LEN / 2, FLOOR - 20);
    }
    let nx = this.x;
    if (ph === 'back') {
      nx = this.x0 - BACK * ((this.t - 130) / 30);
      this.v = 0;
    } else if (ph === 'go') {
      this.v = Math.min(this.v + 110 * DT, 300);
      nx = this.x + this.v * DT;
      if (nx >= this.stopX) {
        nx = this.stopX;
        this.stopped = true;
        this.v = 0;
        this.gate.hide();
        w.sfx('thud', nx + LEN, FLOOR - 20);
      }
    }
    const dx = Math.round(nx) - s.x;
    s.velX = (nx - this.x) / DT;
    this.x = nx;
    if (dx) s.moveBy(w, dx, 0);
    this.rear.x = this.x - BACK - 4;
    this.front.x = this.x + LEN;
    this.rear.on = ph === 'back';
    this.front.on = ph === 'go' && !this.stopped;
  }
  private paintBus(ctx: Ctx, q: Plat) {
    const ph = this.phase;
    ctx.fillStyle = '#1F7A8C';
    ctx.fillRect(q.x, q.y, q.w, q.h);
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(q.x, q.y + 10, q.w, 4);
    ctx.fillStyle = '#16303A';
    for (let i = 0; i < 6; i++) ctx.fillRect(q.x + 5 + i * 12, q.y + 3, 8, 6);
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(q.x + q.w - 6, q.y + 4, 5, 8);
    // the brake lights flash while the note rises
    ctx.fillStyle = ph === 'note' && (this.t >> 2) % 2 ? '#FF4A3A' : '#7A1E16';
    ctx.fillRect(q.x, q.y + 16, 3, 5);
    ctx.fillStyle = '#222';
    for (const wx of [14, 60]) {
      ctx.beginPath();
      ctx.arc(q.x + wx, q.y + q.h, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (ph === 'note' || ph === 'back' || ph === 'go') {
      ctx.fillStyle = 'rgba(200,200,200,0.55)';
      for (let i = 0; i < 3; i++) ctx.fillRect(q.x - 4 - i * 4 - ((this.t >> 1) % 6), q.y + q.h - 4 - i * 3, 3, 3);
    }
  }
}

/** SVP-07's fourth act: the bus stand, with the lane shut by an arm that lifts only for the bus */
export const busStand: Act = {
  id: 'svp07-bus',
  w: 42,
  advice: 'The bus stand: the lane is shut by a barrier arm, and the arm lifts only for the bus. A bus that is about to leave rolls back a little first, its engine note rising, and then pulls away fast. Behind it you are rolled over, ahead of it down the lane you are run down. Be on the bus: its roof carries you to the barrier.',
  cps: [],
  build: (w, c) => {
    const x = c.x;
    const gate = new Plat(px(x + 31), FLOOR - 56, px(1), 56, (ctx, q) => {
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.fillStyle = '#F4ECD6';
      for (let yy = q.y + 4; yy < q.y + q.h; yy += 14) ctx.fillRect(q.x, yy, q.w, 6);
    });
    w.add(gate);
    const bus = new Bus(px(x + 8), px(x + 5.5), px(x + 25), gate).install(w);
    (w.flags.buses ??= []).push(bus);
    w.add(
      new Fx(null, (ctx) => {
        // the stand's sign, and the road marking of the lane
        ctx.fillStyle = '#4A3A2A';
        ctx.fillRect(px(x + 3), FLOOR - 44, 2, 44);
        ctx.fillStyle = '#F4ECD6';
        ctx.fillRect(px(x + 3) - 14, FLOOR - 58, 30, 14);
        ctx.fillStyle = '#8A1F14';
        ctx.font = '6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BUS STAND', px(x + 3) + 1, FLOOR - 49);
        ctx.fillStyle = 'rgba(244,236,214,0.5)';
        for (let xx = px(x + 14); xx < px(x + 30); xx += 24) ctx.fillRect(xx, FLOOR - 1, 12, 1);
      }, -4),
    );
  },
};
