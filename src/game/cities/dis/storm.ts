// DIS round 2: the marathon's shelter beat, a new rule: Bordoisila, the April storm of Bohag Bihu (in the song the
// daughter coming home for Bihu brings the storm). The wind comes first and blows toward the pond; the hail comes a
// moment later. Shelter under the bhoral, the granary on stilts. Deterministic: starts on Dad's position.
import { Entity, type World } from '../../world';
import { Gust } from '../../entities/traps';
import { GROUND, px, Danger, river } from './entities';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tara } from '../../levels/endkit';

export class Bordoisila extends Entity {
  started = -1;
  gusts: Gust[] = [];
  hail: Danger[] = [];
  constructor(
    readonly trig: number,
    readonly warn = 120,
    readonly wind = 330,
    readonly hailAt = 90,
  ) {
    super();
    this.layer = 6;
  }
  /** ticks since the storm was triggered (-1 before) */
  t(w: World) {
    return this.started < 0 ? -1 : w.tick - this.started;
  }
  get over() {
    return this.done;
  }
  done = false;
  update(w: World) {
    if (this.started < 0) {
      if (w.player.cx >= this.trig) this.started = w.tick;
      return;
    }
    const t = w.tick - this.started;
    const blowing = t >= this.warn && t < this.warn + this.wind;
    for (const g of this.gusts) g.on = blowing;
    for (const h of this.hail) h.on = blowing && t >= this.warn + this.hailAt;
    if (t >= this.warn + this.wind) this.done = true;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = this.t(w);
    if (t < 0 || this.done) return;
    // the sky darkens while the storm comes in, and the hail
    const dark = Math.min(1, t / this.warn) * 0.25;
    ctx.fillStyle = `rgba(30,40,50,${dark})`;
    for (const h of this.hail) ctx.fillRect(h.box.x, 0, h.box.w, GROUND);
    if (this.hail[0]?.on) {
      ctx.fillStyle = '#F2F5F7';
      for (const h of this.hail) for (let i = 0; i < h.box.w / 6; i++) ctx.fillRect(h.box.x + ((i * 37 + w.tick * 5) % h.box.w), (i * 53 + w.tick * 9) % GROUND, 2, 2);
    }
  }
}

/** DIS-07 act: Bordoisila. Its lie: hold on against the wind; the truth: it is the hail that follows it. */
export const bordoisila: Act = {
  id: 'dis07-bordoisila',
  w: 26,
  advice: 'Bordoisila, the April storm, blows in: first the wind, toward the pond, then the hail. Get under the bhoral, the granary on stilts, before it comes, and stay there till it has passed. Holding on in the open won’t save you from the hail.',
  cps: [1.5, 9, 23.5],
  paint: (g, c) => {
    g.pit(c.x + 17, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 17, x + 20, 'dis-bordoisila');
    const s = w.add(new Bordoisila(px(x + 3)));
    for (const [a, b] of [
      [x, x + 7],
      [x + 11, x + 17],
    ]) {
      const g = w.add(new Gust(a, 0, b - a, 15, 260));
      s.gusts.push(g);
      s.hail.push(w.add(new Danger({ x: px(a), y: 0, w: px(b - a), h: GROUND }, 'dis-hail', false)));
    }
    (w.flags.storm ??= []).push(s);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Roba! | Stop!', 2.4));
    // the bhoral: a granary on four bamboo stilts, thatched, high enough to walk under
    w.add(
      new (class extends Entity {
        draw(ctx: CanvasRenderingContext2D) {
          ctx.fillStyle = '#7A5A22';
          for (const sx of [7.2, 8.4, 9.6, 10.7]) ctx.fillRect(px(x + sx), GROUND - 30, 2, 30);
          ctx.fillStyle = '#A8874A';
          ctx.fillRect(px(x + 6.8), GROUND - 46, px(4.4), 16);
          ctx.fillStyle = '#C9A66B';
          ctx.beginPath();
          ctx.moveTo(px(x + 6.3), GROUND - 44);
          ctx.lineTo(px(x + 9), GROUND - 64);
          ctx.lineTo(px(x + 11.7), GROUND - 44);
          ctx.fill();
        }
      })(),
    ).layer = -2;
  },
};
