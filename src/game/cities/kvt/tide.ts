// The jetty's coral step (KVT-01's own betrayal, called back in KVT-10): three tiles of coral head when you
// first see it; as the tide drops, the sand washes off its shoulders and it shrinks to its one-tile top. Never
// less than a tile.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { px } from '../../levels/kit';
import { DT } from '../../constants';

export class CoralStep extends Entity {
  solid: Solid;
  /** ticks since the tide started dropping (-1: not yet) */
  t = -1;
  private x0: number;
  constructor(
    tx: number,
    readonly top: number,
    /** seconds after the tide turns that the near and the far shoulder go */
    readonly near = 0.3,
    readonly far = 1.1,
  ) {
    super();
    this.layer = 1;
    this.x0 = px(tx);
    this.solid = new Solid(this.x0, px(top), px(3), px(18 - top));
  }
  /** the tide starts dropping */
  turn(w: World) {
    if (this.t >= 0) return;
    this.t = 0;
    w.sfx('splash', this.x0 + 24, px(this.top));
  }
  get settled() {
    return this.t * DT >= this.far;
  }
  update(w: World) {
    if (this.t < 0) return;
    this.t++;
    const s = this.t * DT;
    const l = s >= this.near ? 1 : 0,
      r = s >= this.far ? 1 : 0;
    const x = this.x0 + px(l),
      wd = px(3 - l - r);
    if (x !== this.solid.x || wd !== this.solid.w) {
      this.solid.x = x;
      this.solid.w = wd;
      w.sfx('crack', x, px(this.top));
      w.emit('fx', x + (l && !r ? -8 : wd + 8), px(this.top) + 6, { kind: 'splash' });
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const top = px(this.top);
    const s = Math.max(0, this.t) * DT;
    // the coral head: always there, under the water line, one tile across at the top
    ctx.fillStyle = '#C98B7B';
    ctx.fillRect(this.x0 + 16, top + 2, 16, 40);
    ctx.fillStyle = '#E9A898';
    ctx.fillRect(this.x0 + 16, top, 16, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(this.x0 + 19, top + 7, 2, 2);
    ctx.fillRect(this.x0 + 26, top + 12, 2, 2);
    // the sand on its shoulders, washing off as the tide drops
    const shoulder = (x: number, gone: number) => {
      const k = Math.min(1, Math.max(0, (s - gone + 0.25) / 0.25));
      if (k >= 1) return;
      ctx.fillStyle = `rgba(242,231,207,${1 - k})`;
      ctx.fillRect(x, top + k * 10, 16, 5 + (1 - k) * 4);
      ctx.fillStyle = `rgba(217,203,170,${1 - k})`;
      ctx.fillRect(x + 2, top + 2 + k * 10, 3, 2);
      ctx.fillRect(x + 10, top + 4 + k * 10, 3, 2);
    };
    shoulder(this.x0, this.near);
    shoulder(this.x0 + 32, this.far);
    void w;
  }
}
