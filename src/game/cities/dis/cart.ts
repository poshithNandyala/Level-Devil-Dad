// DIS round 5, allocation v3 F459 treat-trail-herds (B19): at a husori yard in Barpeta the host lays a trail of pithas
// along the singers' bamboo cart. Step on the cart and it rolls off down its track over the pond at 150 px/s, into the
// buffer stakes at the end. Stand to take a pitha and you are carried into the stakes; take them as you walk forward,
// and get off on to the jetty as the cart runs under it. Running straight off the cart's front lands in the pond.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { DT } from '../../constants';
import { GROUND, px, river } from './entities';

export class TreatCart extends Entity {
  solid: Solid;
  rolling = false;
  stopped = false;
  constructor(
    x0: number,
    readonly w0: number,
    readonly stopAt: number,
    readonly speed = 150,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x0, GROUND, w0, 8);
  }
  update(w: World) {
    const p = w.player;
    if (!this.rolling && !this.stopped && w.standing(this.solid)) this.rolling = true;
    if (!this.rolling) return;
    const dx = Math.min(this.speed * DT, this.stopAt - this.solid.x);
    if (dx > 0) this.solid.moveBy(w, dx, 0);
    if (this.solid.x >= this.stopAt) {
      this.rolling = false;
      this.stopped = true;
      // the buffer: anyone still on it is thrown into the stakes
      if (w.state === 'play' && w.standing(this.solid)) w.die('dis-herd');
    }
    void p;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    ctx.fillStyle = '#A8874A';
    ctx.fillRect(s.x, GROUND, s.w, 8);
    ctx.fillStyle = '#6A4B1C';
    ctx.beginPath();
    ctx.arc(s.x + 10, GROUND + 10, 5, 0, Math.PI * 2);
    ctx.arc(s.x + s.w - 10, GROUND + 10, 5, 0, Math.PI * 2);
    ctx.fill();
    // the trail of pithas laid along it
    ctx.fillStyle = '#E9D7A8';
    for (let k = 6; k < s.w - 6; k += 12) ctx.fillRect(s.x + k, GROUND - 4, 7, 4);
    // the buffer and its stakes at the end of the track
    ctx.fillStyle = '#7A5A22';
    for (let k = 0; k < 3; k++) ctx.fillRect(this.stopAt + s.w + k * 5, GROUND - 26, 3, 30);
    void w;
  }
}

/** DIS-07 act: the treat trail on the husori cart (F459). */
export const husCart: Act = {
  id: 'dis07-cart',
  w: 34,
  advice: 'The host has laid a trail of pithas along the singers’ bamboo cart. Step on it and it rolls off over the pond, into the stakes at the end of its track. Never stop on it: walk forward along it, and jump up on to the jetty as the cart runs under it. Run straight off its front and you are in the pond.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    // fix round 1: the pond runs on under the whole jetty, so running off the stopped cart's front is no way across
    g.pit(x + 8, x + 30);
    // the jetty over the end of the track
    g.fill(x + 16, x + 31, 13, 13, '#');
  },
  build: (w, c) => {
    const x = c.x;
    river(w, x + 8, x + 31, 'dis-pukhuri');
    const k = w.add(new TreatCart(px(x + 8), px(8), px(x + 19)));
    (w.flags.cart ??= []).push(k);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Pitha lua, Dad! Lahe lahe! | Take the pithas, Dad! Slowly!', 2.4));
  },
};
