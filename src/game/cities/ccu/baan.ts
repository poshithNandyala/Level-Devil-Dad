// CCU-07 and CCU-10: the Hooghly bore's front along the low causeway, and coming back down the river.
import { Entity, type Hazard, type World } from '../../world';

/** CCU-07 (R2, the bore's front): along the low causeway by the river the front comes up behind you and
 *  floods everything it has passed; it goes no further than `stop`, then the water goes down again. Keep
 *  moving ahead of it, over the drains, up on to the refuge */
export class Front extends Entity {
  x: number;
  t0 = -1;
  doneAt = -1;
  held = -1;
  hazard: Hazard;
  constructor(
    readonly x0: number,
    readonly stop: number,
    readonly v: number,
    /** water top behind the front (px) */
    readonly top = 222,
  ) {
    super();
    this.layer = 1;
    this.x = x0;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'ccu-baan',
      hits: (x, y, _w, h) => self.t0 >= 0 && self.doneAt < 0 && x < self.x && x + 4 > self.x0 && y + h > self.top + 2,
    };
  }
  get gone() {
    return this.doneAt >= 0;
  }
  update(w: World) {
    if (this.t0 < 0 || w.tick < this.t0 || this.doneAt >= 0) return;
    this.x = Math.min(this.stop, this.x + this.v / 120);
    if (this.x >= this.stop && this.doneAt < 0 && w.tick - this.t0 > 120) {
      // it stands at its furthest for a moment, then goes back down the river
      if (this.held < 0) this.held = w.tick;
      if (w.tick - this.held > 120) this.doneAt = w.tick;
    }
    if (w.tick === this.t0) w.sfx('rumble', this.x, this.top);
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.t0 < 0 || this.doneAt >= 0) return;
    ctx.fillStyle = 'rgba(110,127,106,0.92)';
    ctx.fillRect(this.x0, this.top, this.x - this.x0, 300 - this.top);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x - 6, this.top - 6, 6, 300 - this.top + 6);
    ctx.fillStyle = '#C8D3C0';
    ctx.fillRect(this.x0, this.top, this.x - this.x0, 2);
  }
}

/** CCU-10: the front coming back down the river, a crest `band` px wide running at you faster than you can
 *  run. Nothing outruns it: be up on a refuge while it goes by under you */
export class Ebb extends Entity {
  x: number;
  t0 = -1;
  hazard: Hazard;
  constructor(
    readonly from: number,
    readonly to: number,
    readonly v: number,
    readonly band: number,
    readonly top = 214,
  ) {
    super();
    this.layer = 1;
    this.x = from;
    const self = this;
    this.hazard = {
      active: true,
      // the finale's own cause (law 9): 07's rule "keep running ahead of it" is the one that kills here
      cause: 'ccu-phire',
      hits: (x, y, w, h) => self.running && x + w > self.x && x < self.x + self.band && y + h > self.top + 2,
    };
  }
  get running() {
    return this.t0 >= 0 && this.x > this.to;
  }
  /** has it gone by, west of `px` */
  past(px: number) {
    return this.t0 >= 0 && this.x + this.band < px;
  }
  update(w: World) {
    if (this.t0 < 0 || w.tick < this.t0 || this.x <= this.to) return;
    if (w.tick === this.t0) w.sfx('rumble', this.x, this.top);
    this.x -= this.v / 120;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.running) return;
    ctx.fillStyle = 'rgba(110,127,106,0.92)';
    ctx.fillRect(this.x, this.top, this.band, 300 - this.top);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.x, this.top - 6, 6, 300 - this.top + 6);
  }
}
