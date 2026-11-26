// DIS-04: the til pitha pan. Crepes on a hot pan: shiny means liquid and safe, matte means set, and a set crepe is rolled
// up with whoever stands on it. Everything runs on one clock that starts when Dad passes the pan, so idle time never matters.
import { Entity, type Hazard, type World } from '../../world';
import { overlapXYWH } from '../../constants';
import { GROUND, Slab, px } from './entities';

export interface CrepeDef {
  /** first tile column and width in tiles */
  x: number;
  w: number;
  /** ticks into the cycle at the moment the clock starts (0 = just poured) */
  o: number;
}

export type CrepeState = 'liquid' | 'set' | 'gone';

/** a pan with crepes on it, over a fire (deadly) */
export class Pan extends Entity {
  slabs: Slab[] = [];
  started = -1;
  hazard: Hazard;
  /** ticks Dad has stood on a set crepe */
  private onSet = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly defs: CrepeDef[],
    readonly from: number,
    readonly period = 672,
    readonly liquid = 384,
    readonly set = 72,
  ) {
    super();
    this.layer = 1;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'dis-tawa',
      hits: (x, y, w, h) => self.alive && overlapXYWH(x, y, w, h, { x: self.x0, y: GROUND + 8, w: self.x1 - self.x0, h: 80 }),
    };
  }
  setup(w: World) {
    for (const d of this.defs) {
      const s = new Slab(px(d.x), GROUND, px(d.w), 6, (ctx, sl) => this.paint(ctx, sl, w), 0);
      w.add(s);
      this.slabs.push(s);
      s.solid.collidable = false;
    }
  }
  /** the clock: ticks since Dad passed the pan, or -1 */
  clock(w: World) {
    return this.started < 0 ? -1 : w.tick - this.started;
  }
  /** state of crepe i now, and ticks left in that state */
  stateOf(w: World, i: number): { s: CrepeState; left: number } {
    const c = this.clock(w);
    if (c < 0) return { s: 'gone', left: 0 };
    const ph = (c + this.defs[i].o) % this.period;
    if (ph < this.liquid) return { s: 'liquid', left: this.liquid - ph };
    if (ph < this.liquid + this.set) return { s: 'set', left: this.liquid + this.set - ph };
    return { s: 'gone', left: this.period - ph };
  }
  update(w: World) {
    const p = w.player;
    if (this.started < 0 && p.cx >= this.from) this.started = w.tick;
    let onSetNow = false;
    this.slabs.forEach((sl, i) => {
      const st = this.stateOf(w, i).s;
      sl.solid.collidable = st !== 'gone';
      sl.solid.h = 6;
      if (st === 'set' && w.standing(sl.solid)) onSetNow = true;
    });
    this.onSet = onSetNow ? this.onSet + 1 : 0;
    if (this.onSet > 18 && w.state === 'play') w.die('dis-roll');
  }
  private paint(ctx: CanvasRenderingContext2D, sl: Slab, w: World) {
    const i = this.slabs.indexOf(sl);
    const { s, left } = this.stateOf(w, i);
    const { x, w: ww } = sl.solid;
    if (s === 'gone') return;
    const y = GROUND;
    if (s === 'liquid') {
      // shiny: a pale glossy batter with a bright streak, dulling in its last half second
      const dull = left < 60 && (w.tick >> 3) % 2 === 0;
      ctx.fillStyle = dull ? '#E4D3A6' : '#F7EBC2';
      ctx.fillRect(x, y, ww, 6);
      ctx.fillStyle = dull ? '#D8C48C' : '#FFFFFF';
      ctx.fillRect(x + 3, y + 1, ww - 6, 1.6);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (let k = 0; k < ww / 12; k++) ctx.fillRect(x + 5 + k * 12 + ((w.tick >> 4) % 3), y + 3.4, 3, 1);
    } else {
      // matte: toasted tan, speckled, the edge already curling up
      ctx.fillStyle = '#C48E4A';
      ctx.fillRect(x, y, ww, 6);
      ctx.fillStyle = '#8D5A2B';
      for (let k = 0; k < ww / 7; k++) ctx.fillRect(x + 3 + k * 7, y + 2 + (k % 2) * 2, 1.6, 1.6);
      ctx.fillStyle = '#E3B672';
      ctx.fillRect(x, y - 2, 4, 3);
      ctx.fillRect(x + ww - 4, y - 1, 4, 2);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the pan: a black iron mouth with flames flickering in it
    const y = GROUND + 4;
    ctx.fillStyle = '#26211F';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 60);
    ctx.fillStyle = '#3B3330';
    ctx.fillRect(this.x0, y, this.x1 - this.x0, 3);
    for (let x = this.x0 + 4; x < this.x1 - 6; x += 10) {
      const h = 6 + ((w.tick / 3 + x) % 7);
      ctx.fillStyle = (x / 10) % 2 ? '#FF7043' : '#FFB300';
      ctx.beginPath();
      ctx.moveTo(x - 4, y + 38);
      ctx.quadraticCurveTo(x, y + 38 - h * 2.4, x + 4, y + 38);
      ctx.fill();
    }
  }
}
