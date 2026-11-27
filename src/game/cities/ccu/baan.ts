// CCU-07 (reserve R2, the Hooghly bore): on a spring tide the sea comes up the Hooghly as one wave, the
// baan. It climbs the ghat steps under Howrah Bridge in seconds, drowns whatever is standing on them, and
// lifts every moored launch with it. The ghat below is no place to wait; the launch is: it floats you up
// to the high jetty, where you step off at the crest before the water goes down again.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';

export interface BoreSpec {
  /** the river (px): too wide and the jetty too high without the tide */
  river: [number, number];
  /** the ghat steps that go under at the crest (px) */
  ghat: [number, number];
  /** water top at rest and at the crest (px) */
  low: number;
  high: number;
  /** the launch at rest (px), and its left edge at the crest: the wave carries it up the river to the jetty */
  launch: [number, number];
  launchTo: number;
  /** first bore this long after Dad comes down to the ghat (s), then every `every` s */
  first: number;
  every: number;
}

const TELL = 1.2;
const RISE = 1.5;
const CREST = 3;

export class Bore extends Entity {
  t0 = -1;
  level: number;
  launch: Solid;
  solid: Solid;
  hazard: Hazard;
  constructor(readonly o: BoreSpec) {
    super();
    this.layer = 1;
    this.level = o.low;
    const [l0, l1] = o.launch;
    this.launch = new Solid(l0, o.low - 6, l1 - l0, 6);
    this.launch.velX = 0;
    this.solid = this.launch;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'ccu-ghat',
      hits: (x, y, w, h) => {
        if (y + h <= self.level + 2) return false;
        const inRiver = x + w > o.river[0] && x < o.river[1];
        const onGhat = x + w > o.ghat[0] && x < o.ghat[1];
        return inRiver || onGhat;
      },
    };
  }
  /** seconds into the current bore (-1: none yet) */
  phaseT(w: World) {
    if (this.t0 < 0 || w.tick < this.t0) return -1;
    return ((w.tick - this.t0) / 120) % this.o.every;
  }
  phase(w: World): 'calm' | 'tell' | 'rise' | 'crest' | 'fall' {
    const t = this.phaseT(w);
    if (t < 0) return 'calm';
    if (t < TELL) return 'tell';
    if (t < TELL + RISE) return 'rise';
    if (t < TELL + RISE + CREST) return 'crest';
    if (t < TELL + RISE * 2 + CREST) return 'fall';
    return 'calm';
  }
  update(w: World) {
    const { low, high } = this.o;
    const t = this.phaseT(w);
    let lv = low;
    if (t >= TELL && t < TELL + RISE) lv = low + ((high - low) * (t - TELL)) / RISE;
    else if (t >= TELL + RISE && t < TELL + RISE + CREST) lv = high;
    else if (t >= TELL + RISE + CREST && t < TELL + RISE * 2 + CREST) lv = high + ((low - high) * (t - TELL - RISE - CREST)) / RISE;
    lv = Math.round(lv);
    if (lv !== this.level) {
      this.level = lv;
      const top = lv - 6;
      const f = (low - lv) / (low - high);
      const lx = Math.round(this.o.launch[0] + (this.o.launchTo - this.o.launch[0]) * f);
      if (top !== this.launch.y || lx !== this.launch.x) this.launch.moveBy(w, lx - this.launch.x, top - this.launch.y);
    }
    // drowned by the wave itself, or just into the river at rest
    this.hazard.cause = this.level < low - 8 ? 'ccu-baan' : 'ccu-ghat';
    if (this.phase(w) === 'tell' && t < 1 / 60) w.sfx('rumble', (this.o.river[0] + this.o.river[1]) / 2, this.level);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const { river, ghat } = this.o;
    const y = this.level;
    ctx.fillStyle = '#6E7F6A';
    ctx.fillRect(river[0], y, river[1] - river[0], 300 - y);
    if (y < 240) ctx.fillRect(ghat[0], y, ghat[1] - ghat[0], 240 - y);
    // the foam on the wave's front, and the tell: the water drawing back with a white line far off
    const ph = this.phase(w);
    ctx.fillStyle = ph === 'tell' ? '#FFFFFF' : '#C8D3C0';
    ctx.fillRect(Math.min(river[0], ghat[0]), y, Math.max(river[1], ghat[1]) - Math.min(river[0], ghat[0]), ph === 'rise' || ph === 'tell' ? 3 : 1);
    // the launch: hull, cabin and its rope
    const l = this.launch;
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(l.x, l.y, l.w, 6);
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(l.x + 6, l.y - 10, 22, 10);
    ctx.fillStyle = '#1565C0';
    ctx.fillRect(l.x + 6, l.y - 10, 22, 2);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(l.x + l.w - 2, l.y - 1, 1, Math.max(1, 240 - l.y));
  }
}

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
      cause: 'ccu-baan',
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
