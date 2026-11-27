// CCU-03: jhalmuri. The seller's big tin is the floor: a bed of puffed rice (muri) you can walk on. When he
// shakes the tin the light muri sinks and the big pieces, the peanuts, come up to the top: on a peanut you
// stay up, on the muri you go under. From the second shake on, a green chilli comes up too, right where
// you last landed.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { person } from '../../levels/endkit';
import { FLOOR } from './entities';

export class Peanut {
  solid: Solid;
  up = false;
  gone = false;
  constructor(readonly x: number) {
    this.solid = new Solid(x, FLOOR + 6, 24, 10);
    this.solid.collidable = false;
    this.solid.velX = 0;
  }
}

export interface TinSpec {
  x0: number;
  x1: number;
  /** peanut columns (px of their left edge); none: a tin with only muri */
  nuts?: number[];
  /** first shake this long after Dad steps on the muri (s); then every `every` s */
  first?: number;
  every?: number;
  /** from which shake (1-based) a chilli comes up where Dad last landed (0: never) */
  chilliFrom?: number;
  /** after this many shakes the jhalmuri is mixed: he sets the tin down on his counter and it stays still */
  setDown?: number;
}

export class Tin extends Entity {
  muri: Solid;
  solids: Solid[];
  nuts: Peanut[];
  hazard: Hazard;
  t0 = -1;
  shakes = 0;
  /** where Dad last landed in the tin (px) */
  landX = -1;
  chilli: { x: number; t: number } | null = null;
  chillies: { x: number }[] = [];
  private wasGround = true;
  constructor(readonly o: TinSpec) {
    super();
    this.layer = 1;
    this.muri = new Solid(o.x0, FLOOR, o.x1 - o.x0, TILE);
    this.muri.velX = 0;
    this.nuts = (o.nuts ?? []).map((x) => new Peanut(x));
    this.solids = [this.muri, ...this.nuts.map((n) => n.solid)];
    const self = this;
    this.hazard = {
      active: true,
      cause: 'ccu-lonka',
      hits: (x, y, w, h) => [...self.chillies, ...(self.chilli ? [self.chilli] : [])].some((c) => {
        const top = self.chilliTop(c);
        return x < c.x + 17 && x + w > c.x + 7 && y + h > top + 2 && y < FLOOR;
      }),
    };
  }
  get every() {
    return this.o.every ?? 3;
  }
  /** seconds since the shaking started (-1: not yet) */
  clock(w: World) {
    return this.t0 < 0 ? -Infinity : (w.tick - this.t0) / 120;
  }
  /** has he set the tin down by clock time `c` */
  isDown(c: number) {
    return !!this.o.setDown && c >= 0 && Math.floor(c / this.every) >= this.o.setDown;
  }
  /** is the tin being shaken now, or about to be (the seller lifting it: the tell) */
  phase(w: World): 'calm' | 'tell' | 'shake' {
    const c = this.clock(w);
    if (c < 0 || this.isDown(c)) return 'calm';
    const k = c % this.every;
    if (k < 0.55) return 'tell';
    if (k < 1.55) return 'shake';
    return 'calm';
  }
  /** seconds until the next tell starts */
  untilTell(w: World) {
    const c = this.clock(w);
    if (c === -Infinity || this.isDown(c + this.every)) return Infinity;
    if (c < 0) return -c;
    return this.every - (c % this.every);
  }
  chilliTop(c: { x: number; t?: number }) {
    const t = c.t ?? 1;
    return FLOOR - Math.min(1, t / 0.25) * 18;
  }
  update(w: World) {
    const p = w.player;
    const inTin = p.x + p.w > this.o.x0 && p.x < this.o.x1;
    if (this.t0 < 0 && inTin && p.onGround && p.isRiding(this.muri)) this.t0 = w.tick + Math.round((this.o.first ?? 0.6) * 120);
    // remember where he lands in the tin
    if (p.onGround && !this.wasGround && inTin) this.landX = p.cx;
    this.wasGround = p.onGround;
    const ph = this.phase(w);
    if (ph === 'shake' && this.muri.collidable) {
      // the shake: muri sinks, the big pieces come up
      this.shakes++;
      this.muri.collidable = false;
      w.flags.shake = this.shakes;
      w.sfx('rumble', (this.o.x0 + this.o.x1) / 2, FLOOR);
      for (const n of this.nuts)
        if (!n.gone && !n.up) {
          n.up = true;
          n.solid.collidable = true;
          n.solid.moveBy(w, 0, FLOOR - 10 - n.solid.y);
        }
      const cf = this.o.chilliFrom ?? 0;
      if (cf && this.shakes >= cf && this.landX >= 0) {
        // a green chilli, big and spiky, comes up where he last landed; the peanut there goes under
        const nut = this.nuts.find((n) => !n.gone && this.landX > n.x - 4 && this.landX < n.x + 28);
        const x = nut ? nut.x : this.landX - 8;
        this.chilli = { x, t: -0.3 };
        w.flags.chilli = x;
        if (nut) w.after(0.3, () => {
          nut.gone = true;
          nut.solid.collidable = false;
        });
      }
    }
    if (ph !== 'shake' && !this.muri.collidable) this.muri.collidable = true;
    if (this.chilli) {
      this.chilli.t += DT;
      if (this.chilli.t > 0.3) {
        this.chillies.push({ x: this.chilli.x });
        this.chilli = null;
      }
    }
    // under the muri: smothered
    if (!this.muri.collidable && inTin && p.y + p.h > FLOOR + 6) w.die('ccu-muri');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const ph = this.phase(w);
    const shakeDx = ph === 'shake' ? Math.sin(w.tick * 1.4) * 1.5 : 0;
    const x0 = this.o.x0 + shakeDx,
      x1 = this.o.x1 + shakeDx;
    // the tin: a wide shallow drum, its rim shining
    ctx.fillStyle = '#9AA3A8';
    ctx.fillRect(x0 - 4, FLOOR - 4, 4, 40);
    ctx.fillRect(x1, FLOOR - 4, 4, 40);
    ctx.fillStyle = '#D5DADD';
    ctx.fillRect(x0 - 5, FLOOR - 5, 6, 2);
    ctx.fillRect(x1 - 1, FLOOR - 5, 6, 2);
    // the muri: puffed rice, pale, with a sprinkle of mustard oil and onion
    const sink = ph === 'shake' ? 8 : 0;
    ctx.fillStyle = '#F1E6C8';
    ctx.fillRect(x0, FLOOR + sink, x1 - x0, 32);
    for (let x = x0 + 2; x < x1 - 2; x += 4) {
      const k = Math.round(x) % 7;
      ctx.fillStyle = k === 0 ? '#C0392B' : k === 3 ? '#6B8E23' : k === 5 ? '#D4A340' : '#FFF8E7';
      ctx.fillRect(x, FLOOR + sink + (k % 3), 2.5, 2);
    }
    // peanuts up on top
    for (const n of this.nuts) {
      if (!n.up || n.gone) continue;
      ctx.fillStyle = '#B07A42';
      ctx.beginPath();
      ctx.ellipse(n.x + 12, n.solid.y + 5, 12, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8A5A2E';
      ctx.fillRect(n.x + 11.5, n.solid.y + 1, 1, 8);
    }
    // the chillies
    for (const c of [...this.chillies, ...(this.chilli ? [this.chilli] : [])]) {
      const top = this.chilliTop(c);
      if (top >= FLOOR) {
        ctx.fillStyle = '#2E7D32';
        ctx.fillRect(c.x + 10, FLOOR - 1, 4, 2);
        continue;
      }
      ctx.fillStyle = '#2E7D32';
      ctx.beginPath();
      ctx.moveTo(c.x + 5, FLOOR);
      ctx.quadraticCurveTo(c.x + 12, top - 4, c.x + 19, FLOOR);
      ctx.fill();
      ctx.fillStyle = '#1B5E20';
      ctx.fillRect(c.x + 11, top - 3, 2, 4);
    }
    // the seller at the far end, lifting the tin on the tell
    const sx = this.o.x1 + 14;
    person(ctx, sx, FLOOR - 26, 26, '#E8E2D0', '#9C6B48', { arms: ph === 'tell' ? 9 : ph === 'shake' ? 6 + Math.sin(w.tick) * 3 : 2 });
  }
}
