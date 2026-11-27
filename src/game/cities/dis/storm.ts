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
  advice: 'Bordoisila, the April storm, blows in: first the wind, then the hail, and the hail drives in slantwise on the wind. Under the bhoral, the granary on stilts, it still reaches you. Read the wind (the leaves fly with it) and put the granary between you and it: stand in its lee, on the side away from the wind, till the storm has passed.',
  cps: [1.5, 23.5],
  paint: (g, c) => {
    g.pit(c.x + 17, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 17, x + 20, 'dis-bordoisila');
    const s = w.add(new Bordoisila(px(x + 3)));
    // the wind blows from the left, toward the pond. It blows round the granary (no push under it), but the hail
    // drives in slantwise on it, under the granary too; only the lee, the two columns just downwind of it, is clear
    for (const [a, b] of [
      [x, x + 7],
      [x + 13, x + 17],
    ]) s.gusts.push(w.add(new Gust(a, 0, b - a, 15, 260)));
    for (const [a, b] of [
      [x, x + 11],
      [x + 13, x + 17],
    ]) s.hail.push(w.add(new Danger({ x: px(a), y: 0, w: px(b - a), h: GROUND }, 'dis-hail', false)));
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

/** DIS-10 callback: Bordoisila again on the river bank, and this time the shelter is the trap: the old bhoral's stilts
 *  give way in the wind. The wind blows toward the far bank: jump the channel on it, before the hail comes. */
export const luitBordoisila: Act = {
  id: 'dis10-bordoisila',
  w: 30,
  advice: 'Bordoisila once more, at the channel. This bhoral is old: its stilts give way in the wind. The wind blows toward the far bank: run and jump the channel on the gust, before the hail comes down.',
  cps: [1.5, 26.5],
  paint: (g, c) => {
    g.pit(c.x + 12, c.x + 18);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 12, x + 19, 'dis-bordoisila');
    const s = w.add(new Bordoisila(px(x + 3), 220, 330, 170));
    const g = w.add(new Gust(x + 9, 0, 12, 15, 260));
    s.gusts.push(g);
    s.hail.push(w.add(new Danger({ x: px(x), y: 0, w: px(20), h: GROUND }, 'dis-hail', false)));
    (w.flags.storm ??= []).push(s);
    // the old bhoral falls in the wind on whoever is under it
    const fall = w.add(new Danger({ x: px(x + 5), y: GROUND - 30, w: px(4), h: 30 }, 'dis-bhoral', false));
    w.onTick((w2) => {
      fall.on = s.t(w2) >= s.warn + 40 && !s.done;
    });
    onPass(w, px(x + 2), (w2) => tara(w2, 'Roba! | Stop!', 2.4));
    w.add(
      new (class extends Entity {
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          const down = fall.on || (s.t(w2) >= s.warn + 40);
          ctx.fillStyle = '#7A5A22';
          if (down) {
            ctx.fillRect(px(x + 5), GROUND - 8, px(4), 8);
            return;
          }
          for (const sx of [5.2, 6.4, 7.6, 8.7]) ctx.fillRect(px(x + sx), GROUND - 30, 2, 30);
          ctx.fillStyle = '#8F7440';
          ctx.fillRect(px(x + 4.8), GROUND - 46, px(4.4), 16);
          ctx.fillStyle = '#B49A62';
          ctx.beginPath();
          ctx.moveTo(px(x + 4.3), GROUND - 44);
          ctx.lineTo(px(x + 7), GROUND - 64);
          ctx.lineTo(px(x + 9.7), GROUND - 44);
          ctx.fill();
        }
      })(),
    ).layer = -2;
  },
};
