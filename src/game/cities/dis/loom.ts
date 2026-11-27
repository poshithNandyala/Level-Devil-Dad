// DIS round 2: a new rule for DIS-05 (the welcome): the gamosa is woven for you while you wait. The weaver's cloth is the
// floor over the ditch, and it grows a little with every pass of the shuttle, which flies along the cloth at ankle height.
// Deterministic: starts on Dad's position, then runs on ticks.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { person } from '../../levels/endkit';
import { GROUND, px, Danger } from './entities';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tara } from '../../levels/endkit';

/**
 * A handloom across a ditch. Each pass: the shuttle flies out along the woven cloth to its edge and back (`fly` ticks
 * each way), then the beater packs the new rows and the cloth grows by `grow` px. Done once it reaches the far side.
 */
export class Loom extends Entity {
  cloth: Solid;
  shuttle: Danger;
  started = -1;
  sx = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly trig: number,
    readonly grow = 32,
    readonly fly = 80,
    readonly rest = 40,
  ) {
    super();
    this.layer = 1;
    this.cloth = new Solid(x0, GROUND, 0, 6);
    this.cloth.collidable = false;
    this.shuttle = new Danger({ x: x0, y: GROUND - 7, w: 10, h: 6 }, 'dis-shuttle', false);
    this.sx = x0;
  }
  get done() {
    return this.cloth.w >= this.x1 - this.x0;
  }
  update(w: World) {
    if (this.started < 0) {
      if (w.player.cx < this.trig) return;
      this.started = w.tick;
    }
    if (this.done) {
      this.shuttle.on = false;
      return;
    }
    const per = 2 * this.fly + this.rest;
    const t = (w.tick - this.started) % per;
    const pass = Math.floor((w.tick - this.started) / per);
    const width = Math.min(this.x1 - this.x0, (pass + 1) * this.grow);
    this.cloth.w = width;
    this.cloth.collidable = width > 0;
    // the shuttle starts from the weaver's hand, a little behind the cloth, so it is seen coming
    const from = this.x0 - 56;
    const end = this.x0 + width - 10;
    if (t < this.fly) this.sx = from + ((end - from) * t) / this.fly;
    else if (t < 2 * this.fly) this.sx = end - ((end - from) * (t - this.fly)) / this.fly;
    else this.sx = from;
    this.shuttle.on = t < 2 * this.fly;
    this.shuttle.box.x = Math.round(this.sx);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the warp threads over the ditch, the woven gamosa (white with its red border), the shuttle and the weaver
    ctx.strokeStyle = 'rgba(240,235,220,0.6)';
    ctx.lineWidth = 0.6;
    for (let y = GROUND + 1; y < GROUND + 6; y += 2) {
      ctx.beginPath();
      ctx.moveTo(this.x0, y);
      ctx.lineTo(this.x1, y);
      ctx.stroke();
    }
    const c = this.cloth;
    if (c.w > 0) {
      ctx.fillStyle = '#F4EFE2';
      ctx.fillRect(c.x, GROUND, c.w, 6);
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(c.x, GROUND, c.w, 1.5);
      ctx.fillRect(c.x, GROUND + 4.5, c.w, 1.5);
    }
    if (this.shuttle.on) {
      ctx.fillStyle = '#6B3E1E';
      ctx.fillRect(this.shuttle.box.x, GROUND - 6, 10, 5);
    }
    const beat = this.started >= 0 && !this.done && (w.tick - this.started) % (2 * this.fly + this.rest) >= 2 * this.fly;
    person(ctx, this.x0 - 66, GROUND - 24, 24, '#F4EFE2', '#B9855A', { arms: beat ? 6 : 3 });
    ctx.fillStyle = '#8D6B2E';
    ctx.fillRect(this.x0 - 58, GROUND - 26, 3, 26);
  }
}

/** DIS-05 act: the loom. Its lie: the floor is the cloth, so stand on it; the truth: hop the shuttle on every pass. */
export const taat: Act = {
  id: 'dis05-taat',
  w: 30,
  advice: 'The host is weaving your gamosa on her loom across the ditch: the cloth is the floor, and it grows a little with each pass of the shuttle. Stand on the cloth by its edge, and hop the shuttle every time it flies along at your ankles.',
  cps: [1.5, 27.5],
  paint: (g, c) => {
    g.pit(c.x + 10, c.x + 23);
  },
  build: (w, c) => {
    const x = c.x;
    const l = w.add(new Loom(px(x + 10), px(x + 24), px(x + 3)));
    w.add(l.shuttle);
    w.solids.push(l.cloth);
    (w.flags.loom ??= []).push(l);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Olop! | A little!', 2.4));
    w.add(new Danger({ x: px(x + 10), y: GROUND + 12, w: px(14), h: 40 }, 'dis-taat'));
  },
};
