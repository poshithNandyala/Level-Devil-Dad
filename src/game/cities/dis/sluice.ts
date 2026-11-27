// DIS round 4, allocation v3 F463 bell-opens-the-sluice: the Joysagar tank at Sivasagar. A bell rings and the sluice
// opens; a beat later the channel below floods for a while. On the bell be past the gate, or up on the embankment in the
// middle of the channel. The embankment is oiled like the Rang Ghar roof: wait up there too long and you slide back in.
import { Entity, type World } from '../../world';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, GROUND, px } from './entities';

export class Sluice extends Entity {
  started = -1;
  flood: Danger;
  private onBank = 0;
  constructor(
    readonly c0: number,
    readonly c1: number,
    readonly bank: [number, number],
    readonly trig: number,
    readonly cycle = 420,
    readonly from = 60,
    readonly to = 200,
    readonly slip = 420,
  ) {
    super();
    this.layer = 4;
    this.flood = new Danger({ x: px(c0), y: GROUND - 18, w: px(c1 - c0), h: 18 }, 'dis-sluice', false);
  }
  t(w: World) {
    return this.started < 0 ? -1 : (w.tick - this.started) % this.cycle;
  }
  flooding(w: World) {
    const t = this.t(w);
    return t >= this.from && t < this.to;
  }
  update(w: World) {
    const p = w.player;
    if (this.started < 0 && p.cx >= this.trig) this.started = w.tick;
    this.flood.on = this.flooding(w);
    const t = this.t(w);
    if (t >= 0 && t % 20 === 0 && t < 40) w.sfx('bell', px(this.c1), GROUND - 60);
    // on the oiled embankment the foothold goes after a while
    const up = p.onGround && p.cx >= px(this.bank[0]) && p.cx <= px(this.bank[1]) && p.y + p.h <= px(13);
    this.onBank = up ? this.onBank + 1 : 0;
    if (this.onBank > this.slip && w.state === 'play') w.die('dis-roof');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = this.t(w);
    // the bell on its post by the gate
    ctx.fillStyle = t >= 0 && t < 40 ? '#F2C14E' : '#9C8A55';
    ctx.beginPath();
    ctx.arc(px(this.c1) + 8, GROUND - 60 + (t >= 0 && t < 40 ? Math.sin(w.tick) * 2 : 0), 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(px(this.c1) + 6, GROUND - 54, 4, 54);
    // the channel bed, and the water when the sluice is open
    if (this.flooding(w)) {
      ctx.fillStyle = 'rgba(70,110,130,0.75)';
      ctx.fillRect(px(this.c0), GROUND - 16, px(this.c1 - this.c0), 16);
    }
    // the embankment's oiled top
    ctx.fillStyle = 'rgba(40,30,20,0.4)';
    ctx.fillRect(px(this.bank[0]), px(13) - 2, px(this.bank[1] - this.bank[0]), 2);
  }
}

/** DIS-09 act: the Joysagar sluice (F463). */
export const rangSluice: Act = {
  id: 'dis09-sluice',
  w: 26,
  advice: 'At Joysagar tank a bell by the sluice gate rings, and a moment later the channel floods for a while. You can’t cross the whole channel between two bells: go up on the embankment in the middle when the bell rings, wait out the water, and go on as soon as it drains. The embankment is oiled like the roof: don’t stay up there through a second flood.',
  cps: [1.5],
  paint: (g, c) => {
    g.fill(c.x + 11, c.x + 14, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const s = w.add(new Sluice(x + 6, x + 20, [x + 11, x + 15], px(x + 2)));
    w.hazards.push(s.flood.hazard);
    (w.flags.sluice ??= []).push(s);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Ghonta bazil, Dad! Dour! | The bell, Dad! Run!', 2.4));
  },
};
