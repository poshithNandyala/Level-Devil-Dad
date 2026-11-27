// DIS round 5: the jute rope-walk (ALLOCATION-V3.1 §3, the re-skin of the cut dheki: the still point is the anchored END
// of a swung thing, not a fulcrum and not a centre). Jute is twisted into rope on a rope-walk: the strands are made fast to
// a post, and two twisters walk backwards from it, whipping them as they twist. Here the twisted rope is laid across a
// channel as a bridge while it is worked: fast to the post on the near bank, held by the twisters on the far bank. Near
// the post it does not move; in the middle it is whipped high and down on every stroke; at the twisters' end it moves
// with them each time they step back. Wait on it by the post, cross the middle between strokes, and step off at the
// twisters' end without stopping there.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { person, tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { GROUND, px, river } from './entities';

export class RopeWalk extends Entity {
  solids: Solid[] = [];
  started = -1;
  constructor(
    /** columns: post end [a, m0), whipped middle [m0, m1), twisters' end [m1, b) */
    readonly a: number,
    readonly m0: number,
    readonly m1: number,
    readonly b: number,
    readonly trig: number,
    readonly cycle = 240,
    /** the whip: the middle is thrown up and down over [whip0, whip1) of each cycle */
    readonly whip0 = 120,
    readonly whip1 = 170,
    /** the twisters step back over [step0, step1) of each cycle, taking their end of the rope with them */
    readonly step0 = 200,
    readonly step1 = 240,
  ) {
    super();
    this.layer = 1;
    this.solids.push(new Solid(px(a), GROUND, px(m0 - a), 6), new Solid(px(m0), GROUND, px(m1 - m0), 6), new Solid(px(m1), GROUND, px(b - m1), 6));
  }
  t(w: World) {
    return this.started < 0 ? -1 : (w.tick - this.started) % this.cycle;
  }
  whipping(w: World) {
    const t = this.t(w);
    return t >= this.whip0 && t < this.whip1;
  }
  stepping(w: World) {
    const t = this.t(w);
    return t >= this.step0 && t < this.step1;
  }
  update(w: World) {
    if (this.started < 0 && w.player.cx >= px(this.trig)) this.started = w.tick;
    if (w.state !== 'play') return;
    if (this.whipping(w) && w.standing(this.solids[1])) w.die('dis-pat');
    if (this.stepping(w) && w.standing(this.solids[2])) w.die('dis-paakoni');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = this.t(w);
    const k = this.whipping(w) ? Math.sin(((t - this.whip0) / (this.whip1 - this.whip0)) * Math.PI) : 0;
    const x0 = px(this.a);
    const x1 = px(this.b);
    // the post on the near bank, the rope (sagging and whipped in the middle), the two twisters walking backwards
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(x0 - 4, GROUND - 40, 6, 46);
    ctx.strokeStyle = '#C9A253';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i <= 40; i++) {
      const s = i / 40;
      const x = x0 + (x1 - x0) * s;
      const y = GROUND + 2 - Math.sin(Math.PI * s) * k * 40 * (s > 0.15 && s < 0.85 ? 1 : 0.2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.lineWidth = 1;
    const back = this.stepping(w) ? 4 : 0;
    person(ctx, x1 + 10 + back, GROUND - 26, 26, '#F1EBDD', '#B9855A', { arms: 5 });
    person(ctx, x1 + 26 + back, GROUND - 26, 26, '#E8E1CC', '#B9855A', { arms: k > 0 ? 6 : 2 });
  }
}

/** DIS-07 act: the jute rope-walk (v3.1, the dheki's re-skin). */
export const husRope: Act = {
  id: 'dis07-rope',
  w: 30,
  advice: 'Jute is being twisted into rope across the channel: the strands are made fast to a post on this bank, and two twisters on the far bank walk backwards, whipping them. Next to the post the rope never moves; in the middle it is whipped high and down on every stroke; at the twisters’ end it moves with them each time they step back. Wait on the rope by the post, cross the middle between strokes, and step off at the far end without stopping.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 22);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 6, x + 23, 'dis-pukhuri');
    const r = w.add(new RopeWalk(x + 6, x + 10, x + 18, x + 23, x + 4));
    (w.flags.ropewalk ??= []).push(r);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Pat boi ase, Dad! Dour! | They are twisting jute, Dad! Run!', 2.4));
  },
};
