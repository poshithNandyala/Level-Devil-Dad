// DIS round 5, allocation v3 F461 birds-up-means-charge: Kaziranga's tall elephant grass at Bagori. A rhino lies hidden
// in it; the only sign of it is the cattle egrets on its back, white over the grass. While they sit, it lies still and
// you can walk through. When they rise, it is up and charging up and down the stretch under them. Cross while they sit.
// Not while they are up, and not a whole round later either: the rangers have lit their controlled burn at the far end
// when the egrets next go up, and it comes back through the grass toward you.
import { Entity, type Hazard, type World } from '../../world';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, GROUND, px } from './entities';

/** egrets up for the first `up` s, then sitting for `sit` s, round and round (from the moment Dad comes to the grass) */
export class GrassRhino extends Entity {
  t = -1;
  x: number;
  dir = -1;
  danger: Danger;
  hazard: Hazard;
  constructor(
    readonly g0: number,
    readonly g1: number,
    readonly up = 1.4,
    readonly sit = 2.2,
  ) {
    super();
    this.layer = 1;
    this.x = (g0 + g1) / 2;
    this.danger = new Danger({ x: this.x, y: GROUND - 24, w: 30, h: 24 }, 'dis-bogoli', false);
    this.hazard = this.danger.hazard;
  }
  /** the egrets are up (the rhino is charging) */
  get flying() {
    if (this.t < 0) return false;
    return (this.t / 120) % (this.up + this.sit) < this.up;
  }
  update(w: World) {
    if (this.t < 0 || w.state !== 'play') return;
    this.t++;
    if (this.flying) {
      // up and down the stretch, inside the grass
      this.x += this.dir * 2.6;
      if (this.x < this.g0 + 4) this.dir = 1;
      if (this.x > this.g1 - 34) this.dir = -1;
    }
    this.danger.box.x = this.x;
    this.danger.on = this.flying;
  }
  draw(ctx: CanvasRenderingContext2D) {
    // the rhino's grey back just shows over the grass
    ctx.fillStyle = '#6E6A64';
    ctx.beginPath();
    ctx.ellipse(this.x + 15, GROUND - 14, 15, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // the egrets (fix round 1, QA F7: a flock of six big white birds that read at phone size): standing in a row on its
    // back, or flapping in a cloud high over it
    ctx.fillStyle = '#FFFFFF';
    const up = this.flying;
    for (let k = 0; k < 6; k++) {
      const bx = this.x - 4 + k * 7;
      if (!up) {
        const by = GROUND - 30;
        ctx.fillRect(bx, by, 7, 5); // body
        ctx.fillRect(bx + 5, by - 5, 2, 5); // neck
        ctx.fillRect(bx + 5, by - 6, 4, 2); // head and bill
        ctx.fillStyle = '#E0A800';
        ctx.fillRect(bx + 8, by - 6, 2, 1);
        ctx.fillStyle = '#FFFFFF';
      } else {
        const by = GROUND - 56 - ((k * 9 + this.t) % 22);
        const flap = Math.floor((this.t + k * 5) / 6) % 2;
        ctx.fillRect(bx, by, 7, 3);
        ctx.fillRect(bx - 4, by - (flap ? 4 : -2), 5, 2); // wings
        ctx.fillRect(bx + 6, by - (flap ? 4 : -2), 5, 2);
      }
    }
  }
}

/** the tall grass, drawn in front of the rhino */
class Grass extends Entity {
  constructor(
    readonly g0: number,
    readonly g1: number,
  ) {
    super();
    this.layer = 2;
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#A9A14A';
    for (let x = this.g0; x < this.g1; x += 3) ctx.fillRect(x, GROUND - 22 - ((x * 7) % 5), 2, 22 + ((x * 7) % 5));
  }
}

/** the rangers' controlled burn: lit at the far end, it comes back through the grass and stops at its near edge */
export class Burn extends Entity {
  front: number;
  lit = false;
  danger: Danger;
  hazard: Hazard;
  constructor(
    readonly g0: number,
    readonly from: number,
    /** px per second */
    readonly speed = 160,
  ) {
    super();
    this.layer = 3;
    this.front = from;
    this.danger = new Danger({ x: from, y: GROUND - 30, w: 0, h: 30 }, 'dis-jui', false);
    this.hazard = this.danger.hazard;
  }
  update(w: World) {
    if (!this.lit || w.state !== 'play') return;
    this.front = Math.max(this.g0, this.front - this.speed / 120);
    this.danger.on = true;
    this.danger.box.x = this.front;
    this.danger.box.w = this.from - this.front;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.lit) return;
    for (let x = this.front; x < this.from; x += 5) {
      const h = 12 + ((x * 3 + w.tick) % 9);
      ctx.fillStyle = x - this.front < 24 ? '#F77F00' : 'rgba(60,50,40,0.6)';
      ctx.fillRect(x, GROUND - h, 4, h);
    }
  }
}

/** DIS-08 act: the egrets over the grass (F461). */
export const gorhBogoli: Act = {
  id: 'dis08-bogoli',
  w: 26,
  advice: 'In the tall grass at Bagori a rhino lies hidden, and the only sign of it is the white egrets on its back. While they sit, it lies still: walk through. When they rise, it is up and charging under them: wait at the edge. Go the moment they settle, and don’t wait a whole round: the rangers light their burn at the far end when the egrets next go up, and it comes back through the grass.',
  cps: [1.5],
  build: (w, c) => {
    const x = c.x;
    const g0 = px(x + 6);
    const g1 = px(x + 17);
    const rhino = new GrassRhino(g0, g1);
    w.add(rhino);
    w.add(new Grass(g0, g1));
    const burn = new Burn(g0, px(x + 18));
    w.add(burn);
    onPass(w, px(x + 2), () => (rhino.t = 0));
    // lit when the egrets next go up
    w.onTick(() => {
      if (!burn.lit && rhino.t >= (rhino.up + rhino.sit) * 120) burn.lit = true;
    });
    onPass(w, px(x + 3), (w2) => tara(w2, 'Sorai uri gol, Dad! | The birds flew off, Dad!', 2));
  },
};
