// CCU-06: Kolkata's trams and their trolley poles. A tram crawls along with a roof you can ride and an open
// rear step. At every junction in the overhead wire its pole jumps the wire: the tram stops dead and the pole
// swings forward, sweeping the roof. At the points it can turn off on to the other line, and it takes its
// step (and you) with it. At a stop it waits.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { person, text } from '../../levels/endkit';
import { rr } from '../../../render/art/common';
import { FLOOR } from './entities';

export const ROOF = FLOOR - 44;
const BODY = 128;

export interface TramSpec {
  x: number;
  speed?: number;
  /** where it halts (its rear x, px) and for how long; `ride`: it won't leave till Dad is aboard */
  stops?: { x: number; dwell: number; ride?: boolean }[];
  /** overhead junctions (px): the pole jumps the wire as its head passes */
  junctions?: number[];
  /** it turns off on to the other line here (rear x, px) */
  turnAt?: number;
  /** the end of the line (rear x, px): it stops there for good */
  end?: number;
  label?: string;
}

export class Tram extends Entity {
  x: number;
  v = 0;
  roof: Solid;
  step: Solid;
  solids: Solid[];
  hazard: Hazard;
  state: 'wait' | 'go' | 'junction' | 'stop' | 'turn' | 'gone' | 'end' = 'go';
  t = 0;
  /** pole angle: 0 = trailing back up to the wire; 1 = swung right over the roof */
  swing = 0;
  sweeps = 0;
  private stopI = 0;
  private junI = 0;
  private fade = 1;
  constructor(readonly o: TramSpec) {
    super();
    this.layer = 2;
    this.x = o.x;
    this.roof = new Solid(o.x, ROOF, BODY, 4);
    this.roof.oneWay = true;
    this.step = new Solid(o.x + 2, FLOOR - 10, 22, 4);
    this.step.oneWay = true;
    this.roof.velX = 0;
    this.step.velX = 0;
    this.solids = [this.roof, this.step];
    const self = this;
    this.hazard = {
      active: true,
      cause: 'ccu-dando',
      // the swinging pole sweeps the whole roof, from just above it to a man's height
      hits: (x, y, w, h) => self.sweeping() && x < self.x + BODY && x + w > self.x && y < ROOF && y + h > ROOF - 26,
    };
  }
  sweeping() {
    return this.state === 'junction' && this.swing > 0.15 && this.swing < 0.98;
  }
  riding(w: World) {
    const p = w.player;
    return p.onGround && (p.isRiding(this.roof) || p.isRiding(this.step));
  }
  onStep(w: World) {
    return w.player.onGround && w.player.isRiding(this.step);
  }
  private move(w: World, dx: number) {
    this.roof.velX = this.v;
    this.step.velX = this.v;
    this.roof.moveBy(w, dx, 0);
    this.step.moveBy(w, dx, 0);
    this.x = this.roof.x;
  }
  update(w: World) {
    const sp = this.o.speed ?? 60;
    this.t += DT;
    const stop = this.o.stops?.[this.stopI];
    const jun = this.o.junctions?.[this.junI];
    if (this.state === 'go') {
      let want = sp;
      // ease into stops, the junction and the end of the line
      const ahead = Math.min(stop ? stop.x - this.x : Infinity, jun !== undefined ? jun - (this.x + 10) : Infinity, this.o.end !== undefined ? this.o.end - this.x : Infinity);
      if (ahead < 24) want = Math.max(14, sp * (ahead / 24));
      this.v += Math.sign(want - this.v) * Math.min(Math.abs(want - this.v), 200 * DT);
      this.move(w, this.v * DT);
      if (stop && this.x >= stop.x) {
        this.state = 'stop';
        this.t = 0;
        this.v = 0;
      } else if (jun !== undefined && this.x + 10 >= jun) {
        // the pole's head reaches the junction: it jumps the wire, and the tram stops dead
        this.state = 'junction';
        this.t = 0;
        this.v = 0;
        this.junI++;
        this.sweeps++;
        w.sfx('snap', this.x + 10, ROOF - 60);
        w.emit('fx', this.x + 10, ROOF - 66, { kind: 'sparkle' });
      } else if (this.o.turnAt !== undefined && this.x >= this.o.turnAt) {
        this.state = 'turn';
        this.t = 0;
        w.flags.turned = 1;
        w.sfx('creak', this.x + 60, FLOOR);
      } else if (this.o.end !== undefined && this.x >= this.o.end) {
        this.state = 'end';
        this.v = 0;
        this.t = 0;
      }
    } else if (this.state === 'stop') {
      this.move(w, 0);
      const s = stop!;
      if (this.t >= s.dwell && (!s.ride || this.riding(w))) {
        if (s.ride && this.t - s.dwell < 0.5) return;
        this.stopI++;
        this.state = 'go';
        this.t = 0;
      }
    } else if (this.state === 'junction') {
      this.move(w, 0);
      // up and over (0.7 s), a moment, then the conductor pulls it back by the rope (0.5 s)
      if (this.t < 0.7) this.swing = this.t / 0.7;
      else if (this.t < 1.3) this.swing = 1;
      else this.swing = Math.max(0, 1 - (this.t - 1.3) / 0.5);
      if (this.t > 2.0) {
        this.swing = 0;
        this.state = 'go';
        this.t = 0;
      }
    } else if (this.state === 'turn') {
      // off on to the other line: it swings away from the road, and its step and roof go with it
      this.v = sp;
      this.move(w, this.v * DT);
      this.fade = Math.max(0, 1 - this.t / 0.6);
      if (this.t > 0.15) {
        if (this.riding(w)) w.flags.switched = 1;
        this.roof.collidable = false;
        this.step.collidable = false;
      }
      if (this.t > 0.6) this.state = 'gone';
    } else if (this.state === 'end' || this.state === 'wait') this.move(w, 0);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.state === 'gone') return;
    ctx.save();
    ctx.globalAlpha = this.fade;
    const x = this.x,
      top = ROOF;
    if (this.state === 'turn') ctx.translate(0, -this.t * 30);
    // body: white upper, blue lower, the old Calcutta tram shape (generic, unbranded)
    ctx.fillStyle = '#F4F1E8';
    rr(ctx, x, top, BODY, 30, 4);
    ctx.fill();
    ctx.fillStyle = '#1D5C96';
    ctx.fillRect(x, top + 18, BODY, 18);
    ctx.fillStyle = '#9FC3DC';
    for (let i = 0; i < 7; i++) ctx.fillRect(x + 26 + i * 14, top + 5, 10, 10);
    // the open rear platform and its step
    ctx.fillStyle = 'rgba(30,26,24,0.75)';
    ctx.fillRect(x + 2, top + 4, 22, 30);
    ctx.fillStyle = '#C9CDD1';
    ctx.fillRect(this.step.x, this.step.y, this.step.w, 3);
    ctx.fillStyle = '#4A4541';
    ctx.fillRect(this.step.x + 3, this.step.y + 3, 2, 7);
    ctx.fillRect(this.step.x + this.step.w - 5, this.step.y + 3, 2, 7);
    // the roof boards
    ctx.fillStyle = '#8E9399';
    ctx.fillRect(x, top, BODY, 3);
    // wheels on the rail
    ctx.fillStyle = '#1C1916';
    for (const wx of [x + 22, x + BODY - 22]) {
      ctx.beginPath();
      ctx.arc(wx, FLOOR - 3, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (this.o.label) text(ctx, this.o.label, x + BODY / 2 + 10, top + 27, 7, '#FFFFFF');
    // the trolley pole: from its base at the rear of the roof up to the wire; swung, it lies over the roof
    const bx = x + 12,
      by = top;
    const a0 = (-112 * Math.PI) / 180,
      a1 = (-6 * Math.PI) / 180;
    const a = a0 + (a1 - a0) * this.swing;
    const len = 74;
    ctx.strokeStyle = '#2B2320';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + Math.cos(a) * len, by + Math.sin(a) * len);
    ctx.stroke();
    ctx.fillStyle = '#4A4541';
    ctx.fillRect(bx - 3, by - 3, 6, 3);
    // the rope the conductor pulls it back with
    ctx.strokeStyle = 'rgba(120,90,60,0.8)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bx - 2, by + 2);
    ctx.lineTo(x - 2, top + 30);
    ctx.stroke();
    ctx.restore();
    if (this.state === 'junction' && this.t > 1.0 && this.t < 2.0) person(ctx, x - 8, FLOOR - 24, 24, '#5D7A8C');
    void w;
  }
}

/** the overhead wire with a crossing (a junction) at x: drawn only */
export class Junction extends Entity {
  constructor(readonly x: number) {
    super();
    this.layer = -5;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const y = ROOF - 68;
    ctx.strokeStyle = '#2B2320';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(this.x - 40, y - 10);
    ctx.lineTo(this.x + 40, y + 10);
    ctx.moveTo(this.x - 40, y + 10);
    ctx.lineTo(this.x + 40, y - 10);
    ctx.stroke();
    ctx.fillStyle = '#4A4541';
    ctx.fillRect(this.x - 5, y - 3, 10, 6);
    ctx.fillStyle = '#3A3530';
    ctx.fillRect(this.x + 44, y - 14, 3, FLOOR - y + 14);
  }
}

/** the points: a second rail curving away, and the pointsman with his lever; `turn` sets which way it's set */
export class Points extends Entity {
  constructor(
    readonly x: number,
    public turn: boolean,
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#8E9399';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(this.x, FLOOR + 1);
    ctx.quadraticCurveTo(this.x + 40, FLOOR + 1, this.x + 80, FLOOR - 16);
    ctx.stroke();
    // the pointsman, his lever leaning towards the line it's set for
    person(ctx, this.x - 10, FLOOR - 24, 24, '#6D4C41');
    ctx.strokeStyle = '#B71C1C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + 2, FLOOR);
    ctx.lineTo(this.x + 2 + (this.turn ? 8 : -8), FLOOR - 14);
    ctx.stroke();
    ctx.fillStyle = this.turn ? '#F2C14E' : '#2E7D32';
    ctx.fillRect(this.x + (this.turn ? 8 : -8), FLOOR - 18, 6, 5);
  }
}
