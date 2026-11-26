// Choona, the limestone caves (knock-drip): a formation hangs over the path, and a hop under it raps it. It rings,
// and for a while it drips on the floor ahead: wet limestone is a slide that carries you back into the drain at its
// foot. Walk through without hopping and nothing happens. If the path makes you hop under it, wait on the dry side
// until the dripping stops (it drips for seven seconds, and every new knock starts it again). Used by SVP-05's third
// act and the finale.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, FLOOR, px, TAU, type Ctx } from './kit';

export const WET = 840;
const PUSH = -240;

/** a formation, the floor it drips on, and the drain at the foot of that floor */
export class Formation extends Entity {
  wet = 0;
  knocks = 0;
  lastPush = -999;
  private seenJump = -999;
  private shake = -99;
  private now = 0;
  readonly drain: Hurt;
  constructor(
    /** centre of the formation, px */
    readonly cx: number,
    /** half-width of the stretch under it where a hop raps it, px */
    readonly reach: number,
    /** the wet floor ahead: [x0, x1] px */
    readonly patch: [number, number],
    /** the drain at its foot: [x0, x1] px */
    readonly pit: [number, number],
  ) {
    super();
    this.layer = 5;
    this.drain = new Hurt(pit[0], FLOOR + 8, pit[1] - pit[0], 40, 'fell', null);
  }
  install(w: World) {
    w.add(this);
    w.add(this.drain);
    w.add(
      new Fx(null, (ctx) => {
        ctx.fillStyle = '#2B1E16';
        ctx.fillRect(this.pit[0], FLOOR + 6, this.pit[1] - this.pit[0], 40);
        ctx.fillStyle = '#5A6770';
        for (let x = this.pit[0] + 2; x < this.pit[1] - 2; x += 5) ctx.fillRect(x, FLOOR + 8, 2.5, 24);
      }, 4),
    );
    return this;
  }
  get dripping() {
    return this.wet > 0;
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    if (p.jumpTick !== this.seenJump) {
      this.seenJump = p.jumpTick;
      if (w.state === 'play' && Math.abs(p.cx - this.cx) < this.reach && p.y + p.h > FLOOR - 40) {
        this.wet = WET;
        this.knocks++;
        this.shake = w.tick;
        w.sfx('chime', this.cx, FLOOR - 50);
      }
    } else if (this.wet > 0) this.wet--;
    if (this.wet > 0 && w.state === 'play' && p.cx > this.pit[0] && p.cx < this.patch[1] && p.y + p.h > FLOOR - 30) {
      p.pushVx = PUSH;
      this.lastPush = w.tick;
    }
    this.drain.cause = w.tick - this.lastPush < 150 ? 'svp-chuna' : 'fell';
    void DT;
  }
  draw(ctx: Ctx, w: World) {
    const x = this.cx;
    const sh = w.tick - this.shake < 20 ? Math.sin((w.tick - this.shake) * 1.6) * 1.8 : 0;
    // the ceiling it hangs from
    ctx.fillStyle = 'rgba(40,36,34,0.55)';
    ctx.fillRect(x - this.reach - 20, FLOOR - 150, this.reach * 2 + 40, 34);
    // the formation: a pale cone with a bead on its tip
    ctx.fillStyle = '#E4DCC4';
    ctx.beginPath();
    ctx.moveTo(x - 12 + sh, FLOOR - 118);
    ctx.lineTo(x + 12 + sh, FLOOR - 118);
    ctx.lineTo(x + sh * 1.4, FLOOR - 56);
    ctx.fill();
    ctx.fillStyle = 'rgba(150,130,100,0.35)';
    ctx.beginPath();
    ctx.moveTo(x + 2 + sh, FLOOR - 118);
    ctx.lineTo(x + 12 + sh, FLOOR - 118);
    ctx.lineTo(x + sh * 1.4, FLOOR - 56);
    ctx.fill();
    if (this.wet > 0) {
      // drips falling from the tip on to the wet floor ahead
      const t = (w.tick % 40) / 40;
      ctx.fillStyle = 'rgba(160,215,235,0.95)';
      ctx.beginPath();
      ctx.ellipse(x + sh * 1.4, FLOOR - 54 + t * 50, 1.8, 2.6, 0, 0, TAU);
      ctx.fill();
      // the wet limestone: a sheen over the patch, blinking when it is nearly dry
      const dying = this.wet < 170 && (w.tick >> 3) % 2 === 0;
      const [a, b] = this.patch;
      ctx.fillStyle = dying ? 'rgba(150,200,220,0.25)' : 'rgba(110,190,225,0.55)';
      ctx.fillRect(a, FLOOR - 3, b - a, 3);
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 0.9;
      for (let xx = b - ((w.tick * 2.6) % 18); xx > a + 8; xx -= 18) {
        ctx.beginPath();
        ctx.moveTo(xx, FLOOR - 1.5);
        ctx.lineTo(xx - 8, FLOOR - 1.5);
        ctx.stroke();
      }
      // a ring where the drip lands
      ctx.strokeStyle = 'rgba(200,235,245,0.6)';
      ctx.beginPath();
      ctx.ellipse(x + 24 + sh, FLOOR - 1.5, 3 + t * 6, 1 + t * 1.4, 0, 0, TAU);
      ctx.stroke();
    }
  }
}

/** SVP-05's third act: two formations, each over the one place the path makes you hop */
export const choona: Act = {
  id: 'svp05-choona',
  w: 62,
  advice: 'The caves. A formation hangs over each place the path makes you hop, and a hop under it raps it: it rings and drips for a while on the floor ahead, and wet limestone slides you back into the drain. Hop, then stay on the dry side and let it drip itself out. When the drops stop, the floor is just floor.',
  cps: [32],
  paint: (g, c) => {
    const x = c.x;
    // first: a rock to hop, the drain, the floor that gets wet
    g.fill(x + 12, x + 12, 14, 14, '#');
    g.pit(x + 18, x + 19);
    // second: a wall to climb, the drain, the floor that gets wet
    g.fill(x + 42, x + 43, 13, 14, '#');
    g.pit(x + 48, x + 49);
  },
  build: (w, c) => {
    const x = c.x;
    const a = new Formation(px(x + 12) + 8, 44, [px(x + 20), px(x + 29)], [px(x + 18), px(x + 20)]).install(w);
    const b = new Formation(px(x + 42) + 8, 56, [px(x + 50), px(x + 59)], [px(x + 48), px(x + 50)]).install(w);
    (w.flags.forms ??= []).push(a, b);
  },
};
