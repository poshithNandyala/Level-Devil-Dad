// DIS-08: Kaziranga's tall grass. Under the elephant grass there is no floor at all, only beel (wetland). The one thing that makes
// a floor is a rhino running through: it charges at the jeep's engine noise (a dust plume rises where the jeep is) and the grass
// it flattens on the way is the only path. Everything is by position and by tick since Dad passed the trigger.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, overlapXYWH } from '../../constants';
import { Danger, GROUND, px } from './entities';

export interface ChargeDef {
  /** world x (px) Dad passes to set the jeep off */
  trig: number;
  /** tile columns of the grass: floor appears here as the rhino passes */
  c0: number;
  c1: number;
  /** where the rhino starts (tile column) and where it is charging to (tile column, the plume) */
  start: number;
  plume: number;
  /** ticks of engine noise and rising dust before it charges */
  delay: number;
  /** ticks it rests at the plume before it trots off */
  rest: number;
}

const RHINO_W = 30;
const RHINO_H = 22;

/** the whole event: noise, plume, rhino, flattened strip */
export class Charge extends Entity {
  t = -1;
  rhinoX = 0;
  phase: 'wait' | 'noise' | 'charge' | 'rest' | 'gone' = 'wait';
  restT = 0;
  slabs: Solid[] = [];
  flat: boolean[] = [];
  hazard: Hazard;
  /** the direction it runs: 1 right, -1 left */
  readonly dir: 1 | -1;
  constructor(readonly d: ChargeDef) {
    super();
    this.layer = 4;
    this.dir = d.plume > d.start ? 1 : -1;
    this.rhinoX = px(d.start) + 8;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'dis-gorh',
      hits: (x, y, w, h) => (self.phase === 'charge' || self.phase === 'rest') && overlapXYWH(x, y, w, h, { x: self.rhinoX - RHINO_W / 2 + 2, y: GROUND - RHINO_H, w: RHINO_W - 4, h: RHINO_H }),
    };
  }
  setup(w: World) {
    for (let c = this.d.c0; c <= this.d.c1; c++) {
      const s = new Solid(px(c), GROUND, 16, 16);
      s.collidable = false;
      w.solids.push(s);
      this.slabs.push(s);
      this.flat.push(false);
    }
    w.add(new Danger({ x: px(this.d.c0), y: GROUND + 8, w: px(this.d.c1 - this.d.c0 + 1), h: 80 }, 'dis-beel'));
  }
  /** is the strip floor now at column c */
  floorAt(c: number) {
    return this.flat[c - this.d.c0] === true;
  }
  /** the plume is up and the rhino has not yet gone: someone is about to charge */
  get warned() {
    return this.phase === 'noise' || this.phase === 'charge';
  }
  update(w: World) {
    const p = w.player;
    if (this.phase === 'wait' && p.cx >= this.d.trig) {
      this.phase = 'noise';
      this.t = 0;
    }
    if (this.phase === 'noise') {
      this.t++;
      if (this.t % 40 === 1) w.sfx('honk', px(this.d.plume), GROUND - 30);
      if (this.t >= this.d.delay) {
        this.phase = 'charge';
        w.sfx('snort', this.rhinoX, GROUND - 10);
      }
    } else if (this.phase === 'charge') {
      this.rhinoX += this.dir * 175 * DT;
      for (let c = this.d.c0; c <= this.d.c1; c++) {
        const cx = px(c) + 8;
        const passed = this.dir > 0 ? this.rhinoX >= cx : this.rhinoX <= cx;
        if (passed && !this.flat[c - this.d.c0]) {
          this.flat[c - this.d.c0] = true;
          this.slabs[c - this.d.c0].collidable = true;
        }
      }
      if (this.t % 12 === 0) w.sfx('thud', this.rhinoX, GROUND);
      this.t++;
      const arrived = this.dir > 0 ? this.rhinoX >= px(this.d.plume) + 8 : this.rhinoX <= px(this.d.plume) + 8;
      if (arrived) {
        this.phase = 'rest';
        this.restT = 0;
      }
    } else if (this.phase === 'rest') {
      this.restT++;
      if (this.restT >= this.d.rest) this.phase = 'gone';
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const d = this.d;
    // the field in front of everything: tall grass on every column that has no floor yet, a low flat mat where it has
    for (let c = d.c0; c <= d.c1; c++) {
      const x = px(c);
      // under the grass: the beel's dark water, all the way down
      ctx.fillStyle = '#3C4A36';
      ctx.fillRect(x, GROUND + 2, 16, 60);
      if (this.flat[c - d.c0]) {
        ctx.fillStyle = '#7A6A45';
        ctx.fillRect(x, GROUND, 16, 16);
        ctx.fillStyle = '#C9C26A';
        ctx.fillRect(x, GROUND - 2, 16, 3);
        ctx.fillStyle = '#A99B45';
        ctx.fillRect(x + 2, GROUND - 1, 5, 1);
        ctx.fillRect(x + 9, GROUND - 2, 5, 1);
      } else {
        const sway = Math.sin(w.tick * 0.05 + c * 0.7) * 1.5;
        ctx.fillStyle = '#4C8C3A';
        ctx.fillRect(x, GROUND - 26, 16, 34);
        ctx.fillStyle = '#6FAF4A';
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.moveTo(x + k * 4, GROUND - 22);
          ctx.lineTo(x + k * 4 + 2 + sway, GROUND - 32 - ((c + k) % 3) * 3);
          ctx.lineTo(x + k * 4 + 4, GROUND - 22);
          ctx.fill();
        }
        ctx.fillStyle = '#2F6B34';
        ctx.fillRect(x + 3, GROUND - 14, 2, 14);
        ctx.fillRect(x + 11, GROUND - 18, 2, 18);
      }
    }
    if (this.phase === 'charge' || this.phase === 'rest') {
      const x = this.rhinoX;
      const f = -this.dir;
      const y = GROUND;
      const run = this.phase === 'charge' ? Math.sin(w.tick * 0.9) * 1.2 : 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(-f, 1);
      ctx.fillStyle = '#8A8E91';
      ctx.fillRect(-14, -18 + run, 26, 14);
      ctx.beginPath();
      ctx.arc(12, -12 + run, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6E7275';
      ctx.fillRect(-14, -8 + run, 26, 3);
      ctx.fillRect(-12, -5, 4, 5);
      ctx.fillRect(6, -5, 4, 5);
      ctx.fillStyle = '#D9D2BD';
      ctx.beginPath();
      ctx.moveTo(17, -15 + run);
      ctx.lineTo(24, -22 + run);
      ctx.lineTo(19, -11 + run);
      ctx.fill();
      ctx.fillStyle = '#33261C';
      ctx.fillRect(14, -15 + run, 1.5, 1.5);
      ctx.restore();
      // the dust it kicks up
      ctx.fillStyle = 'rgba(214,196,150,0.55)';
      for (let k = 0; k < 4; k++) ctx.fillRect(x - this.dir * (16 + k * 9), GROUND - 4 - k * 2 - ((w.tick >> 2) % 3), 6 + k * 2, 5 + k);
    }
    // the jeep's dust plume: a column of brown dust that rises and thickens where the noise is
    if (this.phase === 'noise' || (this.phase === 'charge' && this.t < this.d.delay + 90)) {
      const k = Math.min(1, this.t / 90);
      const px0 = px(d.plume) + 8;
      for (let i = 0; i < 6; i++) {
        const r = 6 + i * 3 * k;
        ctx.fillStyle = `rgba(190,165,120,${0.5 - i * 0.05})`;
        ctx.beginPath();
        ctx.arc(px0 + Math.sin(w.tick * 0.04 + i) * 3, GROUND - 40 - i * 15 * k, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/** the jeep, small, out in the grass at the plume's foot (behind everything; this is the backdrop's noise made visible) */
export class FarJeep extends Entity {
  constructor(
    readonly c: Charge,
    readonly y = 156,
  ) {
    super();
    this.layer = -6;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const d = this.c.d;
    const x = px(d.plume) + 8 + (this.c.phase === 'wait' ? 0 : Math.sin(w.tick * 0.2));
    // a safari jeep seen across the grass: green body, canvas top, tiny people
    ctx.fillStyle = '#5E7A3A';
    ctx.fillRect(x - 11, this.y, 22, 8);
    ctx.fillStyle = '#E9DDB0';
    ctx.fillRect(x - 9, this.y - 5, 16, 5);
    ctx.fillStyle = '#26211F';
    ctx.fillRect(x - 9, this.y + 7, 4, 3);
    ctx.fillRect(x + 5, this.y + 7, 4, 3);
    if (this.c.phase === 'noise') {
      // engine noise, drawn as well as heard, for anyone playing muted
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const r = 8 + ((w.tick / 3 + i * 6) % 18);
        ctx.beginPath();
        ctx.arc(x, this.y + 2, r, -0.6, 0.6);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, this.y + 2, r, Math.PI - 0.6, Math.PI + 0.6);
        ctx.stroke();
      }
    }
  }
}

/** set up a charge: its entities and floor */
export function charge(w: World, d: ChargeDef) {
  const c = w.add(new Charge(d));
  c.setup(w);
  w.add(new FarJeep(c));
  (w.flags.charges ??= []).push(c);
  return c;
}
