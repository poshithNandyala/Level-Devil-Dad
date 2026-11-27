// DIS round 3, finale callback F4 from DIS-IDEAS-2 (Thanda tawa, the pan gone cold): it breaks DIS-04's shine rule.
// Dawn after Uruka: the fire under the pitha pan is out and the cook is asleep against it. Nobody pours and nobody rolls:
// a matte crepe is set and stays, so it is the floor; a shiny patch is only oil on the cold iron, and you slide off it
// into the ash. 04 taught "only ever on a shiny crepe"; here shine means slide and matte means safe.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, GROUND, px } from './entities';

/** the cold pan from x0 to x1 (px): set crepes [c0, c1] (tiles) are floors, oil patches [c0, c1] look shiny and are not */
export class ColdPan extends Entity {
  solids: Solid[] = [];
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly matte: [number, number][],
    readonly oil: [number, number][],
  ) {
    super();
    this.layer = 1;
    for (const [a, b] of matte) this.solids.push(new Solid(px(a), GROUND, px(b - a), 6));
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the cold iron, grey ash in it, no flames
    ctx.fillStyle = '#26211F';
    ctx.fillRect(this.x0, GROUND + 4, this.x1 - this.x0, 60);
    ctx.fillStyle = '#8A8580';
    ctx.fillRect(this.x0 + 2, GROUND + 30, this.x1 - this.x0 - 4, 10);
    for (const [a, b] of this.matte) {
      ctx.fillStyle = '#C48E4A';
      ctx.fillRect(px(a), GROUND, px(b - a), 6);
      ctx.fillStyle = '#8D5A2B';
      for (let k = 0; k < px(b - a) / 7; k++) ctx.fillRect(px(a) + 3 + k * 7, GROUND + 2 + (k % 2) * 2, 1.6, 1.6);
    }
    for (const [a, b] of this.oil) {
      // a glossy patch: it looks exactly like 04's liquid crepe, and it is only oil
      ctx.fillStyle = '#F7EBC2';
      ctx.fillRect(px(a), GROUND, px(b - a), 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(px(a) + 3, GROUND + 1, px(b - a) - 6, 1.4);
    }
    // the cook asleep against the pan, and his snore
    const cx = this.x1 + 10;
    ctx.fillStyle = '#F1EBDD';
    ctx.fillRect(cx, GROUND - 10, 26, 10);
    ctx.fillStyle = '#B9855A';
    ctx.beginPath();
    ctx.arc(cx + 30, GROUND - 7, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(60,60,60,0.8)';
    ctx.font = '8px monospace';
    ctx.fillText('z'.repeat(1 + ((w.tick >> 5) % 3)), cx + 30, GROUND - 16);
  }
}

/** DIS-10 callback to 04, broken: the pan is cold. Walk the matte crepes; never step on the shine. */
export const luitThanda: Act = {
  id: 'dis10-thanda',
  w: 30,
  advice: 'The pitha pan again, at dawn after Uruka: the fire is out and the cook is asleep against it. Nobody pours and nobody rolls. A matte crepe has set and stays: it is the floor. A shiny patch is only oil on the cold pan, and you slide off it into the ash. Hop from matte to matte.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 25);
  },
  build: (w, c) => {
    const x = c.x;
    const matte: [number, number][] = [
      [x + 6, x + 9],
      [x + 11.5, x + 14],
      [x + 16.5, x + 19],
      [x + 21.5, x + 26],
    ];
    const oil: [number, number][] = [
      [x + 9, x + 11.5],
      [x + 14, x + 16.5],
      [x + 19, x + 21.5],
    ];
    const p = w.add(new ColdPan(px(x + 6), px(x + 26), matte, oil));
    w.solids.push(...p.solids);
    w.add(new Danger({ x: px(x + 6), y: GROUND + 4, w: px(20), h: 80 }, 'dis-tel'));
    onPass(w, px(x + 2), (w2) => tara(w2, 'Zui nai, randhoni xuise. | No fire, the cook’s asleep.', 2.6));
  },
};
