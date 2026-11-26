// SVP-02 Aari: the Chatham saw mill. A log on a carriage rides across the pit into a band saw; each pass cuts a
// piece off it. The room: cuts take the far end, then the middle: the boarding end is the piece that stays and
// rides on to the far bank. The act breaks that rule (the boarding end is cut off, the middle stays). The door
// is the timber stack: three planks come down in front of it, and it opens when the stack is full.
import { Entity, type LevelDef, type World } from '../../world';
import { DT } from '../../constants';
import { door, rival, sign, collectible } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR, lock, Paint } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L } from './lines';
import { Fx, Hurt, Plat, plank, px, TAU, type Ctx } from './kit';

export interface Cut {
  /** where the saw is, measured from the log's own left end, when it cuts */
  off: number;
  /** which piece falls into the mud: the far one or the boarding one */
  drop: 'right' | 'left';
}

const STRIP = 24;
const LOG = 96;
const SPEED = 52;
const SPAN = 224;
const SAW_AT = 176;

/** a carriage with a log that moves through a band saw across a pit of mud; cuts drop pieces; it docks at the far bank */
export class SawHall extends Entity {
  log: Plat;
  /** the log's left end of the whole log, px */
  L: number;
  a = 0;
  b = LOG;
  started = false;
  docked = false;
  cutsMade = 0;
  blade: Hurt;
  mud: Hurt;
  private plan: ({ k: 'wait'; n: number } | { k: 'move'; to: number } | { k: 'cut'; c: Cut } | { k: 'blade' })[] = [];
  private i = 0;
  private n = 0;
  private bladeUp = 0;
  readonly S: number;
  constructor(
    readonly bankX: number,
    readonly cuts: Cut[],
    /** the blade only comes down for the moment of each cut (the room's blade stands in the road for good) */
    readonly retract = false,
  ) {
    super();
    this.layer = 1;
    this.L = bankX;
    this.S = bankX + SAW_AT;
    this.log = new Plat(bankX, FLOOR, LOG, 24, (ctx) => this.drawLog(ctx, this.log, 0, this.a), { velX: 0 });
    this.blade = new Hurt(this.S - 2, FLOOR - 44, 4, 66, 'svp-aari', null);
    this.blade.on = !retract;
    this.mud = new Hurt(bankX, FLOOR + 22, SPAN, 40, 'svp-kichad', null);
    let a = 0,
      b = LOG;
    for (const c of cuts) {
      this.plan.push({ k: 'move', to: this.S - c.off }, { k: 'wait', n: 40 }, { k: 'cut', c }, { k: 'wait', n: 110 });
      if (c.drop === 'right') b = c.off;
      else a = c.off;
    }
    this.plan.push({ k: 'blade' }, { k: 'move', to: bankX + SPAN - b });
    void a;
  }
  /** the whole thing: log, blade and mud are added by build() */
  install(w: World) {
    w.add(this);
    w.add(this.log);
    w.add(this.blade);
    w.add(this.mud);
    return this;
  }
  private drawLog(ctx: Ctx, p: Plat, _s: number, a: number) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x, p.y - 1, p.w, p.h + 2);
    ctx.clip();
    for (let i = Math.floor(a / STRIP); i * STRIP < this.b; i++) plank(ctx, this.L + i * STRIP, p.y, STRIP, p.h, false);
    ctx.restore();
  }
  private piece(w: World, x: number, wd: number, i0: number) {
    const p = new Plat(x, FLOOR, wd, 24, (ctx, q) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(q.x, q.y - 1, q.w, q.h + 2);
      ctx.clip();
      for (let i = i0; i * STRIP < i0 * STRIP + wd + STRIP; i++) plank(ctx, q.x + (i - i0) * STRIP, q.y, STRIP, q.h, true);
      ctx.restore();
    });
    let vy = 40;
    p.step = (w2, q) => {
      vy = Math.min(vy + 900 * DT, 420);
      q.solid.moveBy(w2, 0, vy * DT);
      if (q.y > FLOOR + 90) {
        q.hide();
        q.alive = false;
      }
    };
    w.add(p);
    w.sfx('collapse', x + wd / 2, FLOOR);
  }
  update(w: World) {
    const lg = this.log.solid;
    if (!this.started) {
      if (w.standing(lg)) this.started = true;
      else return;
    }
    if (this.bladeUp) this.blade.on = false;
    const st = this.plan[this.i];
    // a retracting blade is down for the 20 ticks before a cut and 10 after it
    if (this.retract && !this.bladeUp) {
      const nx = this.plan[this.i + 1];
      const pre = st?.k === 'wait' && nx?.k === 'cut' && this.n >= 20;
      const post = st?.k === 'wait' && this.plan[this.i - 1]?.k === 'cut' && this.n < 10;
      this.blade.on = pre || post;
    }
    if (!st) {
      lg.velX = 0;
      this.docked = true;
      return;
    }
    if (st.k === 'wait') {
      lg.velX = 0;
      if (++this.n >= st.n) this.next();
    } else if (st.k === 'move') {
      const d = st.to - this.L;
      const step = SPEED * DT;
      if (Math.abs(d) <= step) {
        lg.moveBy(w, d, 0);
        this.L = st.to;
        this.next();
      } else {
        lg.moveBy(w, Math.sign(d) * step, 0);
        this.L += Math.sign(d) * step;
        lg.velX = Math.sign(d) * SPEED;
      }
    } else if (st.k === 'cut') {
      lg.velX = 0;
      const c = st.c;
      this.cutsMade++;
      if (c.drop === 'right') {
        this.piece(w, Math.round(this.L + c.off), this.b - c.off, Math.round(c.off / STRIP));
        this.b = c.off;
        lg.w = this.b - this.a;
      } else {
        this.piece(w, Math.round(this.L + this.a), c.off - this.a, Math.round(this.a / STRIP));
        this.a = c.off;
        lg.x = Math.round(this.L + this.a);
        lg.xr = 0;
        lg.w = this.b - this.a;
      }
      w.emit('shake', this.S, FLOOR, { amount: 2 });
      this.next();
    } else {
      this.bladeUp = 1;
      this.next();
    }
  }
  private next() {
    this.i++;
    this.n = 0;
  }
  draw(ctx: Ctx, w: World) {
    const x0 = this.bankX,
      x1 = this.bankX + SPAN;
    // mud pit and its bubbles
    const g = ctx.createLinearGradient(0, FLOOR + 14, 0, FLOOR + 48);
    g.addColorStop(0, '#6A5440');
    g.addColorStop(1, '#3E2F22');
    ctx.fillStyle = g;
    ctx.fillRect(x0, FLOOR + 14, SPAN, 40);
    ctx.fillStyle = 'rgba(190,160,120,0.5)';
    for (let i = 0; i < 9; i++) {
      const bx = x0 + 12 + i * 25 + ((i * 7) % 9);
      const r = 1.5 + ((w.tick / 20 + i * 3) % 4) * 0.5;
      ctx.beginPath();
      ctx.arc(bx, FLOOR + 22 + ((i * 5) % 12), r, 0, TAU);
      ctx.fill();
    }
    // rails under the log's path
    ctx.fillStyle = '#4A3A2A';
    ctx.fillRect(x0, FLOOR + 24, SPAN, 3);
    for (let x = x0 + 6; x < x1; x += 22) ctx.fillRect(x, FLOOR + 27, 4, 10);
    // the saw: housing over the log and a casing under it
    const S = this.S;
    ctx.fillStyle = '#5A6770';
    ctx.fillRect(S - 9, FLOOR - 78, 18, 22);
    ctx.beginPath();
    ctx.arc(S, FLOOR - 66, 9, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#7C8A92';
    ctx.fillRect(S - 6, FLOOR - 84, 12, 6);
    ctx.fillStyle = '#5A6770';
    ctx.fillRect(S - 8, FLOOR + 20, 16, 18);
    ctx.fillStyle = '#3F4A52';
    ctx.fillRect(S - 11, FLOOR + 36, 22, 4);
    if (this.blade.on) {
      ctx.fillStyle = '#B8C2C8';
      ctx.fillRect(S - 2, FLOOR - 56, 4, 78);
      ctx.fillStyle = '#E6EDF0';
      const o = (w.tick * 2) % 6;
      for (let y = FLOOR - 56 + o; y < FLOOR + 20; y += 6) ctx.fillRect(S - 4, y, 2, 3);
    } else {
      ctx.fillStyle = '#B8C2C8';
      ctx.fillRect(S - 2, FLOOR - 62, 4, 12);
    }
  }
}

// ================================================================== the room
function roomMap() {
  return Grid.ground(15).pit(10, 23).put(1, 14, '@').put(30, 14, 'E').rows();
}

export function aariRoom(): LevelDef {
  return {
    id: 'SVP-02',
    city: 'SVP',
    index: 2,
    name: 'Aari',
    nameEn: 'The saw mill',
    tagline: 'Chatham saw mill has cut padauk since 1883. Today the log is the bridge, and the saw is at the middle of it.',
    hint: 'The log rides across the mud into the band saw, and each pass cuts a piece off it: first the far end, then the middle. Whatever you stand on that is cut off falls into the mud, and the blade takes you if you stand where it cuts. The boarding end is the piece that is left: stay on it, and it carries you to the far bank.',
    par: 14,
    map: roomMap(),
    build(w: World) {
      door(w);
      const hall = new SawHall(px(10), [
        { off: 72, drop: 'right' },
        { off: 48, drop: 'right' },
      ]).install(w);
      w.flags.saw = hall;
      sign(w, 2.4, 10.4, 4.6, 'CHATHAM MILL', 'shop', null, 'aari');
      rival(w, 3, 15, 1, { intro: L.intro[0], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-padauk', 18.5, 11.2);
    },
  };
}

// ================================================================== the act: the second hall
export const chirai: Act = {
  id: 'svp02-chirai',
  w: 30,
  advice: 'A second hall, a longer cut: this time the saw takes the boarding end first. Walk to the middle of the log and stand there: the middle is what is left, and it carries you over.',
  cps: [3],
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 17);
  },
  build: (w, c) => {
    const hall = new SawHall(
      px(c.x + 4),
      [
        { off: 72, drop: 'right' },
        { off: 24, drop: 'left' },
      ],
      true,
    ).install(w);
    (w.flags.halls ??= []).push(hall);
    sign(w, c.x + 0.5, 10.4, 3.4, 'SORTING', 'shop', null, 'chirai');
  },
};

// ================================================================== the door: the timber stack
export const timberStack: Ending = {
  space: 14,
  advice: 'The door is behind the timber stack and it opens when the stack is full: three planks come down on to it, one after the other, and a plank that comes down on you is the end of you. Wait back from the stack, and walk in after the third.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const lk = lock(w, d, 'Line mein raho! | Stay in the line!');
    let landed = 0;
    let started = false;
    const zone = { x: px(D - 4), w: px(4) };
    const hurt = new Hurt(zone.x, -20, zone.w, 8, 'svp-lakdi', (ctx, h) => plank(ctx, h.x, h.y, h.w, 8, false), 3);
    hurt.on = false;
    w.add(hurt);
    const shadow = { at: -1, t: 0 };
    w.flags.twist = 'stack';
    w.flags.stack = { zone, get landed() { return landed; }, lk };
    const drop = (w2: World) => {
      const k = landed;
      shadow.at = k;
      shadow.t = w2.tick;
      w2.after(0.75, () => {
        hurt.on = true;
        hurt.y = -20;
        let vy = 0;
        const f = new Fx((w3) => {
          vy += 2400 * DT;
          hurt.y += vy * DT;
          if (hurt.y + 8 >= FLOOR - 8 * k) {
            hurt.y = FLOOR - 8 * (k + 1);
            hurt.on = false;
            landed++;
            w3.sfx('thud', zone.x + zone.w / 2, FLOOR);
            w3.emit('shake', zone.x, FLOOR, { amount: 3 });
            f.alive = false;
            if (landed >= 3) {
              lk.unlock();
              w3.flags.twist = 'open';
            } else w3.after(0.6, () => drop(w3));
          }
        }, null);
        w2.add(f);
      });
    };
    onPass(w, px(D - 7), (w2) => {
      if (started) return;
      started = true;
      drop(w2);
    });
    // the pile and the shadow of the next plank
    w.add(
      new Paint((ctx, w2) => {
        for (let i = 0; i < landed; i++) plank(ctx, zone.x, FLOOR - 8 * (i + 1), zone.w, 8, i % 2 === 1);
        if (started && landed < 3 && w2.tick - shadow.t < 90 && shadow.at === landed) {
          ctx.fillStyle = `rgba(0,0,0,${0.12 + 0.12 * ((w2.tick >> 3) & 1)})`;
          ctx.fillRect(zone.x, FLOOR - 2 - 8 * landed, zone.w, 2);
        }
      }, 3),
    );
    void lk;
  },
};
