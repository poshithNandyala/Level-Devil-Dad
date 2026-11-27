// DIS round 3: the dheki, the Assamese foot-operated husking lever, from DIS-IDEAS-2 candidate 1 (the research file
// cites Wikipedia: Dheki for the lever, its fulcrum, the pestle that falls by its own weight and the pitha flour).
// Uruka night in the courtyard: women pound rice on a row of dhekis. Each dheki lies over a trench: the beam's tail
// over the trench, the fulcrum (pedestal) on solid ground, the pestle over a wide mortar. While a woman presses the
// tail, the tail is a plank over the trench and the pestle is up (the mortar is open). When she steps off, the tail
// flies up and the pestle falls into the mortar and lies there a moment: its head is then the floor over the mortar.
// The only still tile is the pedestal.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { person, tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, GROUND, px } from './entities';

export class Dheki extends Entity {
  tail: Solid;
  head: Solid;
  started = -1;
  constructor(
    /** first column of the trench (tail 3 tiles, pedestal 1, mortar 4) */
    readonly c: number,
    /** pressed (pestle up) / released (pestle down) windows within one cycle, in ticks: [start, end) of each press */
    readonly presses: [number, number][],
    readonly cycle: number,
    readonly phase: number,
    readonly trig: number,
    /** how many women are at the tail (the second one changes the pattern) */
    readonly women = 1,
  ) {
    super();
    this.layer = 1;
    this.tail = new Solid(px(c), GROUND, px(3), 8);
    this.head = new Solid(px(c + 4), GROUND, px(4), 8);
  }
  /** the cycle position, or -1 before the trigger (then the tail is pressed and the pestle up) */
  t(w: World) {
    return this.started < 0 ? -1 : (w.tick - this.started + this.phase) % this.cycle;
  }
  pressed(w: World) {
    const t = this.t(w);
    return t < 0 || this.presses.some(([a, b]) => t >= a && t < b);
  }
  update(w: World) {
    if (this.started < 0 && w.player.cx >= this.trig) this.started = w.tick;
    const p = this.pressed(w);
    this.tail.collidable = p;
    this.head.collidable = !p;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = this.pressed(w);
    const f = px(this.c + 3) + 8; // fulcrum
    const tailY = p ? GROUND - 2 : GROUND - 26;
    const headY = p ? GROUND - 34 : GROUND - 2;
    // the beam
    ctx.strokeStyle = '#7A5A22';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px(this.c), tailY);
    ctx.lineTo(f, GROUND - 14);
    ctx.lineTo(px(this.c + 7), headY);
    ctx.stroke();
    // the pedestal
    ctx.fillStyle = '#5E4A2E';
    ctx.fillRect(f - 5, GROUND - 16, 10, 16);
    // the pestle head and the mortar bowl
    ctx.fillStyle = '#9C7A45';
    ctx.fillRect(px(this.c + 4), headY - 2, px(4), p ? 10 : 6);
    ctx.fillStyle = '#4A3A26';
    ctx.fillRect(px(this.c + 4), GROUND + 6, px(4), 10);
    ctx.fillStyle = '#EDE3C8';
    ctx.fillRect(px(this.c + 4) + 4, GROUND + 4, px(4) - 8, 3);
    // the women at the tail: pressing (foot down) or stepped off
    for (let i = 0; i < this.women; i++) {
      const x = px(this.c) - 14 - i * 14;
      person(ctx, x, GROUND - 28 - (p ? 0 : 3), 26, i ? '#F1EBDD' : '#FDF0D5', '#B9855A', { arms: p ? 2 : 5, cap: '#C1121F' });
    }
  }
}

/** a dheki at column c: trench and mortar are deadly, the tail and the pestle head are floors in turn */
function dheki(w: World, c: number, presses: [number, number][], cycle: number, phase: number, trig: number, women = 1) {
  const d = w.add(new Dheki(c, presses, cycle, phase, px(trig), women));
  w.solids.push(d.tail, d.head);
  w.add(new Danger({ x: px(c), y: GROUND + 10, w: px(3), h: 80 }, 'dis-dheki-tail'));
  w.add(new Danger({ x: px(c + 4), y: GROUND + 10, w: px(4), h: 80 }, 'dis-dheki'));
  (w.flags.dheki ??= []).push(d);
  return d;
}

/** DIS-07 act: three dhekis in the Uruka courtyard. Its lie: the tail is a plank and the hop is quick; the truth: stand
 *  on the pedestal, and cross the mortar only while the pestle lies in it. */
export const husDheki: Act = {
  id: 'dis07-dheki',
  w: 38,
  advice: 'Women pound rice for pitha on three dhekis. Each lever lies over a trench: its tail is a plank only while a woman presses it, and then its pestle is up over the open mortar. When she steps off, the tail flies up and the pestle drops into the mortar and lies there for a moment. Cross the tail while she presses, wait on the pedestal in the middle, and walk over the mortar on the pestle while it is down. Where two women work, the pestle falls twice, quickly.',
  cps: [1.5, 24.5],
  paint: (g, c) => {
    const x = c.x;
    for (const d of [6, 14, 29]) {
      g.pit(x + d, x + d + 2);
      g.pit(x + d + 4, x + d + 7);
    }
  },
  build: (w, c) => {
    const x = c.x;
    // one woman each on the first two, in turn (the second presses while the first has stepped off); two on the third
    dheki(w, x + 6, [[0, 150]], 260, 0, x + 3);
    dheki(w, x + 14, [[0, 150]], 260, 120, x + 3);
    // two women: the pestle falls, is pressed up again at once, and falls again for longer
    dheki(w, x + 29, [[0, 160], [205, 250]], 360, 0, x + 26, 2);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Dheki-t bhori nidiba, Dad! | Don’t put your foot in the dheki, Dad!', 2.6));
  },
};
