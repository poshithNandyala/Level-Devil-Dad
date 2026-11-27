// SVP-07 Ship Late Hai: the jetty waiting hall. The board says the ship is late and everyone sits on their luggage,
// so the luggage is the floor over the gap. When the ship is called they all stand at once and take it with them: the
// floor goes, and the crowd rushes to the ship, sweeping whoever is ahead of it. Shelter in the luggage trench under
// the pier. At the quay the first ship is the crowd's and sails off with whoever walked on; the second ship's deck is the
// way across. The second hall has a false alarm first and a crowd coming the other way. The door is the ticket window,
// which opens only after the ship has gone.
import { Entity, type LevelDef, type World } from '../../world';
import { DT } from '../../constants';
import { overlapXYWH } from '../../constants';
import { door, rival, collectible } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import { type Ending, lock, Paint, person, text, FLOOR } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L, X } from './lines';
import { Fx, Hurt, Plat, px, TAU, type Ctx } from './kit';

const SHIRTS = ['#C0392B', '#2E86C1', '#F2C230', '#8E44AD', '#27AE60', '#E67E22'];

function bag(ctx: Ctx, x: number, y: number, w: number, h: number, i: number) {
  ctx.fillStyle = ['#8A5A30', '#2F6F8F', '#B3392E', '#5B6B3A'][i % 4];
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillStyle = '#D9B98A';
  ctx.fillRect(x + w / 2 - 1.5, y - 2, 3, 2);
}

/** a stack of luggage drawn to fill a solid box */
function stackArt(ctx: Ctx, q: Plat) {
  const rows = Math.max(1, Math.round(q.h / 8));
  for (let r = 0; r < rows; r++) {
    const bw = q.w / Math.ceil(q.w / 14);
    for (let i = 0; i < Math.ceil(q.w / 14); i++) bag(ctx, q.x + i * bw + 0.5, q.y + r * 8 + 0.5, bw - 1, 7.5, i + r);
  }
}

export type Dir = 1 | -1;

/** the crowd: a wall of passengers with their bags, sweeping along the pier */
export class Crowd extends Entity {
  hurt: Hurt;
  on = false;
  done = false;
  x: number;
  onArrive: ((w: World) => void) | null = null;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly speed = 150,
    readonly width = 72,
    cause = 'svp-bheed',
    /** only the legs and the bags sweep: whoever is up on a tall stack is over them */
    low = false,
  ) {
    super();
    this.layer = 3;
    this.x = x0;
    this.hurt = low ? new Hurt(x0, FLOOR - 28, width, 29, cause, null) : new Hurt(x0, FLOOR - 52, width, 53, cause, null);
    this.hurt.on = false;
  }
  go() {
    this.on = true;
    this.hurt.on = true;
  }
  get dir(): Dir {
    return this.x1 >= this.x0 ? 1 : -1;
  }
  update(w: World) {
    if (!this.on || this.done) return;
    this.x += this.dir * this.speed * DT;
    if ((this.dir > 0 && this.x >= this.x1) || (this.dir < 0 && this.x <= this.x1)) {
      this.done = true;
      this.on = false;
      this.hurt.on = false;
      this.onArrive?.(w);
    }
    this.hurt.x = this.x - this.width / 2;
  }
  draw(ctx: Ctx, w: World) {
    if (!this.on || this.done) return;
    const n = Math.round(this.width / 14);
    for (let i = 0; i < n; i++) {
      const bx = this.x - this.width / 2 + 7 + i * 14;
      const hop = Math.abs(Math.sin((w.tick + i * 9) * 0.3)) * 2;
      person(ctx, bx, FLOOR - 34 - hop, 34, SHIRTS[i % 6], '#C68B59', { arms: 3 });
      bag(ctx, bx + 3 * this.dir - 4, FLOOR - 14 - hop, 8, 9, i);
    }
  }
}

/** the hall: luggage stacks over a gap that vanish at the call; passengers sit on them and on the pier */
export class Hall extends Entity {
  stacks: Plat[] = [];
  called = false;
  alarm = false;
  t0 = -1;
  private now = 0;
  seats: { x: number; y: number; i: number }[] = [];
  constructor(
    stacks: { x: number; w: number; h: number }[],
    readonly callAfter: number,
    readonly crowd: Crowd,
    readonly gapX: [number, number],
    /** a false alarm first: the call that is not the call */
    readonly alarmAfter = 0,
    readonly seatsOn: number[] = [],
    /** lashed down for the storm: the luggage stays after the call */
    readonly lashed = false,
  ) {
    super();
    this.layer = 1;
    for (const s of stacks) {
      const p = new Plat(s.x, FLOOR - s.h, s.w, s.h + 8, (ctx, q) => stackArt(ctx, q));
      this.stacks.push(p);
      this.seats.push({ x: s.x + s.w / 2, y: FLOOR - s.h, i: this.seats.length });
    }
    for (const x of seatsOn) this.seats.push({ x, y: FLOOR, i: this.seats.length });
  }
  install(w: World) {
    w.add(this);
    for (const p of this.stacks) w.add(p);
    w.add(this.crowd);
    w.add(this.crowd.hurt);
    w.add(new Hurt(this.gapX[0], FLOOR + 10, this.gapX[1] - this.gapX[0], 40, 'svp-saman', null));
    w.add(new Fx(null, (ctx, w2) => this.water(ctx, w2), 5));
    return this;
  }
  private water(ctx: Ctx, w: World) {
    const [x0, x1] = this.gapX;
    const g = ctx.createLinearGradient(0, FLOOR + 8, 0, FLOOR + 48);
    g.addColorStop(0, 'rgba(70,170,190,0.9)');
    g.addColorStop(1, 'rgba(18,90,110,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, FLOOR + 8, x1 - x0, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 0.8;
    for (let x = x0 + ((w.tick * 0.3) % 14); x < x1 - 6; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR + 8.5);
      ctx.lineTo(x + 6, FLOOR + 8.5);
      ctx.stroke();
    }
  }
  get boardText() {
    return this.called ? 'NOW BOARDING' : this.alarm && this.now - this.t0 > this.alarmAfter && this.now - this.t0 < this.alarmAfter + 180 ? 'ARRIVING' : 'SHIP LATE HAI';
  }
  update(w: World) {
    this.now = w.tick;
    if (this.called) return;
    if (this.t0 < 0) {
      if (this.stacks.some((p) => w.standing(p.solid))) this.t0 = w.tick;
      else return;
    }
    const t = w.tick - this.t0;
    if (this.alarmAfter && t === this.alarmAfter) {
      this.alarm = true;
      w.sfx('pop', this.gapX[0], FLOOR - 40);
    }
    if (t >= this.callAfter) {
      this.called = true;
      if (!this.lashed)
        for (const p of this.stacks) {
          p.hide();
          w.emit('fx', p.x + p.w / 2, p.y + 6, { kind: 'poof', w: p.w, h: p.h });
        }
      w.sfx('thud', this.gapX[0], FLOOR - 40);
      w.say('BHOOOONG!', this.gapX[0] + 40, FLOOR - 90, 1.6, 'npc');
      this.crowd.go();
    }
  }
  draw(ctx: Ctx) {
    // the board over the hall
    const bx = this.gapX[0] - 40;
    ctx.fillStyle = '#4A3A2A';
    ctx.fillRect(bx + 4, FLOOR - 70, 2, 70);
    ctx.fillRect(bx + 58, FLOOR - 70, 2, 70);
    ctx.fillStyle = '#16303A';
    ctx.fillRect(bx, FLOOR - 82, 64, 18);
    ctx.strokeStyle = '#F6E27F';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx + 0.5, FLOOR - 81.5, 63, 17);
    const t = this.boardText;
    text(ctx, t, bx + 32, FLOOR - 73, t.length > 11 ? 6.4 : 7.4, this.called ? '#7BE07B' : t === 'ARRIVING' ? '#F6E27F' : '#F2A33A', '');
    // passengers: sitting on their luggage until the call
    if (!this.called) {
      for (const s of this.seats) {
        const stand = this.alarm && this.now - this.t0 > this.alarmAfter && this.now - this.t0 < this.alarmAfter + 180;
        person(ctx, s.x, s.y - (stand ? 34 : 24), stand ? 34 : 24, SHIRTS[s.i % 6], '#C68B59', { arms: stand ? 3 : 0 });
        if (s.y === FLOOR) bag(ctx, s.x - 7, FLOOR - 9, 14, 9, s.i);
      }
    }
  }
}

/** a ship at the quay: a deck you can step on, a hull, and a funnel; it can sail off or arrive */
export class Ship extends Entity {
  deck: Plat;
  state: 'moored' | 'leaving' | 'gone' | 'arriving' = 'moored';
  private t = 0;
  readonly x0: number;
  constructor(
    x: number,
    readonly wTiles: number,
    readonly present = true,
    readonly colour = '#1F7A8C',
    /** a ship out in the harbour: not solid, and further back */
    readonly far = false,
  ) {
    super();
    this.layer = far ? -4 : 1;
    this.x0 = x;
    this.deck = new Plat(x, far ? FLOOR - 36 : FLOOR, wTiles * 16, 6, (ctx, q) => this.paintDeck(ctx, q), { layer: far ? -4 : 1 });
    if (far) this.deck.solid.collidable = false;
    if (!present) {
      this.state = 'gone';
      this.deck.hide();
    }
  }
  install(w: World) {
    w.add(this);
    w.add(this.deck);
    return this;
  }
  leave() {
    if (this.state === 'moored') {
      this.state = 'leaving';
      this.t = 0;
    }
  }
  arrive() {
    if (this.state === 'gone') {
      this.state = 'arriving';
      this.t = 0;
      this.deck.visible = true;
      this.deck.solid.collidable = false;
    }
  }
  get docked() {
    return this.state === 'moored';
  }
  update(w: World) {
    const s = this.deck.solid;
    if (this.state === 'leaving') {
      this.t++;
      // sails off out of the picture: first a long horn, then away and down
      const k = Math.max(0, this.t - 150);
      if (k > 0) {
        s.moveBy(w, 0, 0.5 + k * 0.012);
        if (this.deck.y > FLOOR + 70) {
          this.deck.hide();
          this.state = 'gone';
        }
      } else if (this.t === 1) w.say('BHOOOONG!', this.x0 + 40, FLOOR - 70, 1.8, 'npc');
      s.velX = 0;
    } else if (this.state === 'arriving') {
      this.t++;
      const k = Math.min(1, this.t / 300);
      const dx = Math.round(this.x0 + (1 - k) * 160) - s.x;
      this.deck.visible = true;
      if (dx) s.moveBy(w, dx, 0);
      s.velX = dx ? dx / DT : 0;
      if (k >= 1) {
        s.collidable = !this.far;
        this.state = 'moored';
        s.velX = 0;
      }
    }
  }
  private paintDeck(ctx: Ctx, q: Plat) {
    const lean = this.state === 'leaving' ? Math.max(0, this.t - 150) * 0.004 : 0;
    ctx.save();
    ctx.translate(q.x + q.w / 2, q.y);
    ctx.rotate(lean);
    ctx.translate(-q.w / 2, 0);
    // hull
    ctx.fillStyle = '#F2F2EA';
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(q.w + 4, 0);
    ctx.lineTo(q.w - 4, 16);
    ctx.lineTo(4, 16);
    ctx.fill();
    ctx.fillStyle = this.colour;
    ctx.fillRect(0, 5, q.w, 3);
    ctx.fillStyle = '#C9B48A';
    ctx.fillRect(0, -1, q.w, 4);
    // cabin, funnel and a rail
    ctx.fillStyle = '#E7E2D0';
    ctx.fillRect(q.w * 0.3, -26, q.w * 0.4, 25);
    ctx.fillStyle = '#7EB0B8';
    for (let i = 0; i < 3; i++) ctx.fillRect(q.w * 0.33 + i * 11, -21, 6, 6);
    ctx.fillStyle = '#C0392B';
    ctx.fillRect(q.w * 0.45, -36, 8, 11);
    ctx.strokeStyle = '#555E64';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1, -8);
    ctx.lineTo(q.w * 0.3, -8);
    ctx.moveTo(q.w * 0.7, -8);
    ctx.lineTo(q.w - 1, -8);
    ctx.stroke();
    ctx.restore();
  }
}

function sea(w: World, x0: number, x1: number, cause: string) {
  const h = new Hurt(x0, FLOOR + 12, x1 - x0, 40, cause, null);
  w.add(h);
  w.add(
    new Fx(null, (ctx, w2) => {
      const g = ctx.createLinearGradient(0, FLOOR + 8, 0, FLOOR + 48);
      g.addColorStop(0, 'rgba(70,170,190,0.92)');
      g.addColorStop(1, 'rgba(18,90,110,0.96)');
      ctx.fillStyle = g;
      ctx.fillRect(x0, FLOOR + 8, x1 - x0, 40);
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 0.8;
      for (let x = x0 + ((w2.tick * 0.3) % 14); x < x1 - 6; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, FLOOR + 8.5);
        ctx.lineTo(x + 6, FLOOR + 8.5);
        ctx.stroke();
      }
    }, 5),
  );
  return h;
}

/** the luggage trench: a notch in the pier floor, with a plank grating drawn over its mouth */
function trenchArt(w: World, c0: number, c1: number) {
  w.add(
    new Fx(null, (ctx) => {
      const x0 = px(c0),
        x1 = px(c1 + 1);
      ctx.fillStyle = '#3A2A1E';
      ctx.fillRect(x0, FLOOR, x1 - x0, 32);
      ctx.fillStyle = '#6B4A34';
      for (let x = x0 + 2; x < x1 - 4; x += 12) ctx.fillRect(x, FLOOR + 6, 6, 5);
      ctx.fillStyle = '#C9B48A';
      ctx.fillRect(x0, FLOOR - 1, x1 - x0, 2);
    }, -1),
  );
}

// ================================================================== the room: the first hall
export const HALL1 = { gap: [px(6), px(14)] as [number, number], trench: [22, 24] as [number, number] };

export function jettyRoom(): LevelDef {
  return {
    id: 'SVP-07',
    city: 'SVP',
    index: 7,
    name: 'Ship Late Hai',
    nameEn: 'The ship is late',
    tagline: 'The ship is late again, so the whole waiting hall has settled in for the night, sitting on its luggage. Then the call comes.',
    hint: 'The luggage is the floor over the gap, because everyone is sitting on it. The moment the ship is called they all stand up and take it with them, and then they all run for the ship and sweep away anyone ahead of them. Cross the gap and don’t wait on the luggage. Get down into the trench under the pier while the crowd goes by, and out again behind it.',
    par: 24,
    map: Grid.ground(15).pit(6, 13).pit(22, 24).fill(22, 24, 17, 17, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const crowd = new Crowd(px(15), px(39));
      const hall = new Hall([{ x: px(6), w: px(3), h: 16 }, { x: px(9), w: px(5), h: 24 }], 420, crowd, HALL1.gap, 0, [px(16) + 8, px(17) + 8, px(18) + 8, px(19) + 8]).install(w);
      w.flags.hall = hall;
      w.flags.crowd = crowd;
      trenchArt(w, HALL1.trench[0], HALL1.trench[1]);
      rival(w, 3, 15, 1, { intro: L.intro[5], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-lobster', 11.2, 9.4);
    },
  };
}

// ================================================================== the act: the quay and the two ships
export const ghatSte: Act = {
  id: 'svp07-ghat',
  w: 34,
  advice: 'The crowd boards the first ship at the quay, and the first ship sails off with whoever walked on it. The second ship comes in after, and its deck is the way across: wait for it to dock, then step over.',
  cps: [18],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 14);
  },
  build: (w, c) => {
    const x = c.x;
    const hall = w.flags.hall as Hall;
    const s1 = new Ship(px(x + 6), 2, true).install(w);
    const s2 = new Ship(px(x + 8), 7, false, '#B3392E').install(w);
    (w.flags.ships ??= []).push(s1, s2);
    const h = sea(w, px(x + 6), px(x + 15), 'svp-jahaz');
    void h;
    hall.crowd.onArrive = (w2) => {
      w2.after(1.0, () => s1.leave());
      w2.after(3.5, () => s2.arrive());
    };
    w.add(
      new Fx(null, (ctx) => {
        // the queue's sign and the quay edge
        ctx.fillStyle = '#4A3A2A';
        ctx.fillRect(px(x + 2), FLOOR - 40, 2, 40);
        ctx.fillStyle = '#F4ECD6';
        ctx.fillRect(px(x + 2) - 12, FLOOR - 52, 26, 12);
        text(ctx, 'JAHAZ 2', px(x + 2) + 1, FLOOR - 46, 6.5, '#8A1F14', '');
      }, -4),
    );
  },
};

// ================================================================== the act: the second hall
export const doosra: Act = {
  id: 'svp07-doosra',
  w: 46,
  advice: 'A second hall, and the call is not always the call: the board says ARRIVING first, and then everybody stands and sits down again, and the luggage stays. The real call, when the board says NOW BOARDING, takes the luggage. This time the crowd comes the other way, from the quay end, and the trench is still the place to be.',
  cps: [],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 11);
    g.pit(x + 24, x + 26).fill(x + 24, x + 26, 17, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const crowd = new Crowd(px(x + 42), px(x + 13), 210, 72);
    const hall = new Hall([{ x: px(x + 4), w: px(3), h: 16 }, { x: px(x + 7), w: px(5), h: 24 }], 300, crowd, [px(x + 4), px(x + 12)], 130, [px(x + 38) + 8, px(x + 39) + 8, px(x + 40) + 8, px(x + 41) + 8]).install(w);
    (w.flags.halls ??= []).push(hall);
    trenchArt(w, x + 24, x + 26);
    w.add(
      new Fx(null, (ctx) => {
        void ctx;
      }, 0),
    );
  },
};

// ================================================================== the act: the third hall, where the crowd comes back
export const teesra: Act = {
  id: 'svp07-teesra',
  w: 48,
  advice: 'A third hall. The crowd goes over the trench one way, and then the board says WRONG SHIP and they all come back the other way. Stay in the trench for both.',
  cps: [],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 11);
    g.pit(x + 24, x + 26).fill(x + 24, x + 26, 17, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const back = new Crowd(px(x + 13), px(x + 44), 250, 72);
    const crowd = new Crowd(px(x + 42), px(x + 13), 250, 72);
    const hall = new Hall([{ x: px(x + 4), w: px(3), h: 24 }, { x: px(x + 7), w: px(5), h: 16 }], 180, crowd, [px(x + 4), px(x + 12)], 0, [px(x + 38) + 8, px(x + 39) + 8, px(x + 40) + 8, px(x + 41) + 8]).install(w);
    w.add(back);
    w.add(back.hurt);
    crowd.onArrive = (w2) => w2.after(1.6, () => back.go());
    (w.flags.halls ??= []).push(hall);
    (w.flags.backs ??= []).push(back);
    trenchArt(w, x + 24, x + 26);
    w.add(
      new Fx(null, (ctx) => {
        if (!crowd.done || back.done) return;
        // the board over the pier flips
        const bx = px(x + 20);
        ctx.fillStyle = '#16303A';
        ctx.fillRect(bx, FLOOR - 82, 64, 18);
        ctx.strokeStyle = '#E8423A';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx + 0.5, FLOOR - 81.5, 63, 17);
        text(ctx, 'WRONG SHIP', bx + 32, FLOOR - 73, 7, '#F2A33A', '');
      }, 3),
    );
  },
};

// ================================================================== the finale's break of the halls: the luggage is lashed down
/** the luggage is lashed for the storm: it stays after the call, there is no trench, and the crowd goes by under a tall stack */
export const lashedHall: Act = {
  id: 'svp10-saman',
  w: 48,
  advice: 'The luggage hall again, but the storm is coming and every bag is lashed down with rope: it stays after the call. There is no trench tonight. The crowd still runs for the ship, and then comes back: look for a stack that is tall enough to be over them.',
  cps: [],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 11);
  },
  build: (w, c) => {
    const x = c.x;
    const crowd = new Crowd(px(x + 42), px(x + 13), 250, 72, 'svp-bheed', true);
    const back = new Crowd(px(x + 13), px(x + 44), 250, 72, 'svp-bheed2', true);
    const hall = new Hall(
      [
        { x: px(x + 4), w: px(3), h: 16 },
        { x: px(x + 7), w: px(5), h: 24 },
        { x: px(x + 21), w: px(3), h: 16 },
        { x: px(x + 24), w: px(4), h: 32 },
      ],
      260,
      crowd,
      [px(x + 4), px(x + 12)],
      0,
      [px(x + 38) + 8, px(x + 39) + 8, px(x + 40) + 8, px(x + 41) + 8],
      true,
    ).install(w);
    w.add(back);
    w.add(back.hurt);
    crowd.onArrive = (w2) => w2.after(1.0, () => back.go());
    (w.flags.halls ??= []).push(hall);
    (w.flags.backs ??= []).push(back);
    w.add(
      new Fx(null, (ctx) => {
        // the rope lashings over the tall stack
        ctx.strokeStyle = '#E8DDB5';
        ctx.lineWidth = 1.2;
        for (const sx of [px(x + 24) + 8, px(x + 24) + 30, px(x + 24) + 52]) {
          ctx.beginPath();
          ctx.moveTo(sx, FLOOR - 32);
          ctx.lineTo(sx, FLOOR);
          ctx.stroke();
        }
      }, 3),
    );
  },
};

// ================================================================== the door: the ticket window
export const ticketWindow: Ending = {
  space: 13,
  advice: 'The ticket window is shut and its queue is behind you: it opens only after the ship has gone. Stay clear of the quay edge, wait for the horn and watch the ship sail, and the window opens.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const lk = lock(w, d, X.queue);
    const ship = new Ship(px(D - 10), 5, true, '#2E6F40', true).install(w);
    let started = false;
    w.flags.twist = 'shut';
    w.flags.window = { ship, lk, get started() { return started; } };
    w.onTick((w2) => {
      if (!started && w2.player.cx > px(D - 12)) {
        started = true;
        w2.after(3.0, () => ship.leave());
      }
      if (started && ship.state === 'gone' && !lk.open) {
        lk.unlock();
        w2.flags.twist = 'open';
      }
    });
    w.add(
      new Paint((ctx) => {
        // the window: a counter with a grille and a tin sign
        const x = d.x - 10;
        ctx.fillStyle = '#C9B48A';
        ctx.fillRect(x - 8, FLOOR - 40, 34, 40);
        ctx.fillStyle = '#7C8A92';
        ctx.fillRect(x - 10, FLOOR - 44, 38, 5);
        ctx.fillStyle = lk.open ? '#7BE07B' : '#C0392B';
        ctx.fillRect(x, FLOOR - 28, 18, 12);
        text(ctx, lk.open ? 'OPEN' : 'SHUT', x + 9, FLOOR - 22, 6, '#FFFFFF', '');
      }, -3),
    );
    void overlapXYWH;
    void TAU;
  },
};
