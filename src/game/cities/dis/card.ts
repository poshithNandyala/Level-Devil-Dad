// DIS round 3, from DIS-IDEAS-2 candidate 3 (the time card): the road through Kaziranga's edge. At the entry gate Dad
// is handed a card: "exit not before" a time. The exit gate stays shut to anyone early, and its stakes are the 07 gate's.
// Between the gates hog deer cross the road at marked corridors, each on its own cycle. The one place to spend the time
// that is off every corridor is the lay-by: a bench under a shade tree. A minimum time, not a deadline.
// Fallback the research names (no real-world claim): a plain speed-check gate with the same "not before" rule.
import { Entity, type World } from '../../world';
import { person, tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { DT } from '../../constants';
import { Danger, GROUND, px } from './entities';

/** the card: handed over when Dad passes `from`; the exit gate opens `wait` ticks later */
export class TimeCard extends Entity {
  started = -1;
  stakes: Danger;
  constructor(
    readonly from: number,
    readonly gateX: number,
    readonly wait: number,
  ) {
    super();
    this.layer = 3;
    this.stakes = new Danger({ x: gateX, y: GROUND - 40, w: 14, h: 40 }, 'dis-gate');
  }
  left(w: World) {
    return this.started < 0 ? this.wait : Math.max(0, this.wait - (w.tick - this.started));
  }
  get open() {
    return this.opened;
  }
  private opened = false;
  update(w: World) {
    if (this.started < 0 && w.player.cx >= this.from) {
      this.started = w.tick;
      w.say(`Card: ${Math.round(this.wait * DT)} s`, this.from, GROUND - 40, 1.8, 'npc');
    }
    this.opened = this.started >= 0 && this.left(w) === 0;
    this.stakes.on = !this.opened;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the gate: bamboo stakes, lowered once the card's time has come
    ctx.fillStyle = '#7A5A22';
    const h = this.opened ? 6 : 40;
    for (let k = 0; k < 3; k++) ctx.fillRect(this.gateX + k * 5, GROUND - h, 3, h);
    // the card in Dad's hand: the seconds still to spend
    if (this.started >= 0) {
      const s = Math.ceil(this.left(w) * DT);
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(w.player.cx - 9, w.player.y - 16, 18, 10);
      ctx.fillStyle = this.opened ? '#2E7D32' : '#C1121F';
      ctx.font = '8px monospace';
      ctx.fillText(this.opened ? 'GO' : String(s), w.player.cx - 7, w.player.y - 8);
    }
  }
}

/** a deer corridor over columns c..c+2: a hog deer crosses the road for `on` ticks of every `period`, from the card */
export class Corridor extends Entity {
  danger: Danger;
  constructor(
    readonly c: number,
    readonly card: TimeCard,
    readonly period: number,
    readonly on: number,
    readonly phase: number,
    readonly cw = 2,
  ) {
    super();
    this.layer = 2;
    this.danger = new Danger({ x: px(c), y: GROUND - 30, w: px(cw), h: 30 }, 'dis-horin', false);
  }
  t(w: World) {
    return this.card.started < 0 ? -1 : (w.tick - this.card.started + this.phase) % this.period;
  }
  crossing(w: World) {
    const t = this.t(w);
    return t >= 0 && t < this.on;
  }
  update(w: World) {
    this.danger.on = this.crossing(w);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the corridor's road marking: yellow chevrons
    ctx.fillStyle = '#E0B040';
    for (let k = 0; k < this.cw * 2; k++) ctx.fillRect(px(this.c) + k * 8, GROUND - 2, 4, 2);
    const t = this.t(w);
    // the deer: comes out of the grass a moment before (a rustle), then crosses
    if (t >= this.period - 50) {
      ctx.fillStyle = 'rgba(90,70,40,0.6)';
      ctx.fillRect(px(this.c) + 6, GROUND - 34, 20, 4);
    }
    if (this.crossing(w)) {
      const k = t / this.on;
      ctx.fillStyle = '#8B5E34';
      for (let d = 0; d < this.cw; d += 3) {
        const x0 = px(this.c + d);
        ctx.fillRect(x0 + 2, GROUND - 22 + Math.sin(k * 12 + d) * 2, 26, 12);
        ctx.fillRect(x0 + 24, GROUND - 30, 6, 10);
        ctx.fillRect(x0 + 4, GROUND - 10, 3, 10);
        ctx.fillRect(x0 + 22, GROUND - 10, 3, 10);
      }
    }
  }
}

/** DIS-07 act: the time card on the forest road. Its lie: run, the gate is right there; the truth: not before the card says,
 *  and spend the time on the bench, off every corridor. */
export const husCard: Act = {
  id: 'dis07-card',
  w: 40,
  advice: 'The road along the Kaziranga edge: the guard at the gate hands you a card, and the exit gate will not open before its time is up. Hog deer cross the road at the marked corridors. Cross each corridor between deer, and spend the time on the bench under the tree, which no corridor reaches. Go to the gate only when the card says GO.',
  cps: [1.5, 16.5],
  build: (w, c) => {
    const x = c.x;
    const card = w.add(new TimeCard(px(x + 2), px(x + 34), 900));
    w.hazards.push(card.stakes.hazard);
    // [column, period, crossing ticks, phase, width]: the deer at the gate (the last) cross just before the card's time,
    // and none of the corridors after the bench has a deer in the seconds after it
    for (const [cc, period, on, phase, cw] of [
      [8, 600, 90, 400, 2],
      [22, 700, 90, 100, 8],
      [30, 600, 90, 450, 4],
    ] as const) {
      const k = w.add(new Corridor(x + cc, card, period, on, phase, cw));
      w.hazards.push(k.danger.hazard);
    }
    (w.flags.card ??= []).push(card);
    // the guard at the entry gate, and the bench under the shade tree (the lay-by)
    w.add(
      new (class extends Entity {
        draw(ctx: CanvasRenderingContext2D) {
          person(ctx, px(x + 1), GROUND - 28, 28, '#5B6B3A', '#B9855A', { cap: '#3C4A26' });
          ctx.fillStyle = '#3F6B2E';
          ctx.beginPath();
          ctx.arc(px(x + 16.5), GROUND - 70, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#6A4B1C';
          ctx.fillRect(px(x + 16.2), GROUND - 50, 6, 50);
          ctx.fillStyle = '#7A5A22';
          ctx.fillRect(px(x + 14.5), GROUND - 12, 40, 4);
        }
      })(),
    ).layer = -2;
    onPass(w, px(x + 2.5), (w2) => tara(w2, 'Aagote nahiba, Dad. Card-ot likha ase. | Don’t come early, Dad. It’s written on the card.', 3));
  },
};
