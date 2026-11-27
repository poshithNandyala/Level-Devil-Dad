// DIS round 2: a new rule for the marathon from the bible's unused ideas: the Bihu dhol beat as a timer.
// Bamboo planks over a village pond rise and sink on the drummer's beat; Bihu drumming quickens as it goes on.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { person } from '../../levels/endkit';
import { GROUND, px, river } from './entities';
import type { Act } from '../../levels/acts';

/**
 * Planks across a pond. On each beat of the dhol, plank i is up when (i + beat) is even, so the next plank rises on every
 * beat and the one you are on sinks `grace` ticks later: hop one plank per beat. After `quick` planks the drummer
 * quickens (period `fast`): wait for the old tempo and the plank sinks under you.
 */
export class DholPlanks extends Entity {
  planks: Solid[] = [];
  beat = -1;
  started = -1;
  lastBeat = 0;
  constructor(
    readonly xs: number[],
    readonly pw: number,
    readonly trig: number,
    readonly slow = 120,
    readonly fast = 84,
    readonly quick = 6,
    readonly grace = 30,
    readonly drumX = 0,
  ) {
    super();
    this.layer = 1;
    for (const x of xs) this.planks.push(new Solid(x, GROUND, pw, 8));
    // before the drummer starts: only the first plank is up
    this.planks.forEach((s, i) => (s.collidable = i === 0));
  }
  /** ticks between beats right now */
  period(): number {
    return this.beat >= this.quick ? this.fast : this.slow;
  }
  update(w: World) {
    if (this.started < 0) {
      if (w.player.cx < this.trig) return;
      this.started = w.tick;
      this.lastBeat = w.tick;
      this.beat = 0;
    }
    if (w.tick - this.lastBeat >= this.period()) {
      this.beat++;
      this.lastBeat = w.tick;
      w.sfx('drum', this.drumX, GROUND - 20);
    }
    const since = w.tick - this.lastBeat;
    this.planks.forEach((s, i) => {
      const up = (i + this.beat) % 2 === 0;
      const wasUp = (i + this.beat - 1) % 2 === 0 && this.beat > 0;
      // the last plank is the far bank's step: it stays up once reached
      s.collidable = up || (wasUp && since < this.grace) || (i === this.planks.length - 1 && this.beat >= i);
    });
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (const s of this.planks) {
      if (!s.collidable) {
        ctx.fillStyle = 'rgba(141,107,46,0.35)';
        ctx.fillRect(s.x, GROUND + 6, s.w, 3);
        continue;
      }
      ctx.fillStyle = '#B08A3E';
      ctx.fillRect(s.x, GROUND, s.w, 5);
      ctx.fillStyle = '#7A5A22';
      for (let x = s.x + 3; x < s.x + s.w; x += 8) ctx.fillRect(x, GROUND, 1, 5);
    }
    // the dhol player on the near bank; his arms beat with the drum, faster once he quickens
    const hit = this.started >= 0 && w.tick - this.lastBeat < 10;
    person(ctx, this.drumX, GROUND - 24, 24, '#F1EBDD', '#B9855A', { arms: hit ? 6 : 2, cap: '#C1121F' });
    ctx.fillStyle = '#8B2A1E';
    ctx.beginPath();
    ctx.ellipse(this.drumX + 10, GROUND - 12, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** DIS-07 act: the Bihu dhol on the pond's bamboo planks (bible: the dhol beat as a timer). Its lie: the beat you learn. */
export const husDhol: Act = {
  id: 'dis07-dhol',
  w: 38,
  advice: 'A dhol player at the village pond: bamboo planks across it rise on his beat, and the one behind you sinks a moment later. Hop one plank on every beat. Bihu drumming quickens: when his arms go faster, so must you.',
  cps: [1.5, 34.5],
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 33);
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 4, x + 34, 'dis-pukhuri');
    const xs: number[] = [];
    for (let i = 0; i < 10; i++) xs.push(px(x + 4.5 + i * 3));
    const d = w.add(new DholPlanks(xs, 32, px(x + 3), 120, 84, 5, 30, px(x + 1.5)));
    w.solids.push(...d.planks);
    (w.flags.dhol ??= []).push(d);
  },
};
