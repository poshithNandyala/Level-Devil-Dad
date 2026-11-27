// Mooring rope (rope-throw): the boat is tied up on the far bank and the rope runs back to a bollard on yours. The
// honest rule is the one the dockhands use: a hop by the bollard is a pull on the line, and every pull brings the boat
// in a little. Run to the edge and the boat is out of reach; the rope only answers to hops at the bollard. Once it is
// alongside, step on, and it is poled across at a walking pace. Used by SVP-05's second act and the finale.
import { Entity, type World } from '../../world';
import { DT } from '../../constants';
import type { Act } from '../../levels/acts';
import { Fx, Hurt, Plat, FLOOR, px, TAU, type Ctx } from './kit';

const DRIFT = 5;
const RIDE = 36;
const SETTLE = 40;
const GIVE_UP = 900;

/** one creek: the boat, its rope and its bollard */
export class Rope extends Entity {
  boat: Plat;
  /** the boat's left edge, px */
  pos: number;
  state: 'out' | 'moored' | 'ride' | 'docked' = 'out';
  hauls = 0;
  tug = -99;
  private seenJump = -999;
  private still = 0;
  private idle = 0;
  private prev: number;
  private now = 0;
  constructor(
    /** the near bank's last column edge and the far bank's first, px */
    readonly nearX: number,
    readonly farX: number,
    readonly bollard: number,
    readonly boatW = 80,
    readonly pull = 38,
    readonly cause = 'svp-rassi',
  ) {
    super();
    this.layer = 1;
    this.pos = farX - boatW;
    this.prev = this.pos;
    this.boat = new Plat(this.pos, FLOOR, boatW, 8, (ctx, q) => this.drawBoat(ctx, q));
  }
  install(w: World) {
    w.add(this);
    w.add(this.boat);
    w.add(new Hurt(this.nearX, FLOOR + 12, this.farX - this.nearX, 40, this.cause, null));
    w.add(new Fx(null, (ctx, w2) => this.water(ctx, w2), 5));
    return this;
  }
  /** Dad is by the bollard, where a hop pulls */
  inZone(w: World) {
    return Math.abs(w.player.cx - this.bollard) < 44;
  }
  get alongside() {
    return this.pos <= this.nearX + 6;
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    const s = this.boat.solid;
    const lo = this.nearX + 2;
    const hi = this.farX - this.boatW;
    if (p.jumpTick !== this.seenJump) {
      this.seenJump = p.jumpTick;
      if (this.state === 'out' && this.inZone(w) && p.onGround === false && p.cx < this.nearX) {
        this.pos = Math.max(lo, this.pos - this.pull);
        this.hauls++;
        this.tug = w.tick;
        w.sfx('thud', this.bollard, FLOOR);
        if (this.pos <= lo) this.state = 'moored';
      }
    }
    if (this.state === 'out') {
      this.pos = Math.min(hi, this.pos + DRIFT * DT);
    } else if (this.state === 'moored') {
      if (w.standing(s)) {
        if (++this.still >= SETTLE) this.state = 'ride';
        this.idle = 0;
      } else {
        this.still = 0;
        // nobody got on: the knot slips and the boat floats off again
        if (++this.idle >= GIVE_UP) this.state = 'out';
      }
    } else if (this.state === 'ride') {
      this.pos = Math.min(hi, this.pos + RIDE * DT);
      if (this.pos >= hi) this.state = 'docked';
    }
    const dx = Math.round(this.pos) - s.x;
    s.velX = this.state === 'ride' ? RIDE : (this.pos - this.prev) / DT;
    if (this.state === 'docked') s.velX = 0;
    this.prev = this.pos;
    if (dx) s.moveBy(w, dx, 0);
  }
  private drawBoat(ctx: Ctx, q: Plat) {
    ctx.fillStyle = '#8A5A34';
    ctx.beginPath();
    ctx.moveTo(q.x - 6, q.y);
    ctx.lineTo(q.x + q.w + 8, q.y);
    ctx.lineTo(q.x + q.w - 4, q.y + 12);
    ctx.lineTo(q.x + 4, q.y + 12);
    ctx.fill();
    ctx.fillStyle = '#C79A5E';
    ctx.fillRect(q.x - 6, q.y, q.w + 14, 3);
    ctx.fillStyle = '#1F7A8C';
    ctx.fillRect(q.x + 2, q.y + 5, q.w - 4, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(q.x + 5, q.y + 10, q.w - 10, 2);
    // the cleat the rope is made fast to
    ctx.fillStyle = '#3A2A1E';
    ctx.fillRect(q.x - 1, q.y - 4, 5, 4);
  }
  private water(ctx: Ctx, w: World) {
    const x0 = this.nearX,
      x1 = this.farX;
    const g = ctx.createLinearGradient(0, FLOOR + 10, 0, FLOOR + 46);
    g.addColorStop(0, 'rgba(70,170,190,0.9)');
    g.addColorStop(1, 'rgba(18,90,110,0.95)');
    ctx.fillStyle = g;
    ctx.fillRect(x0, FLOOR + 10, x1 - x0, 36);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 0.8;
    for (let x = x0 + ((w.tick * 0.3) % 14); x < x1 - 6; x += 14) {
      ctx.beginPath();
      ctx.moveTo(x, FLOOR + 10.5);
      ctx.lineTo(x + 6, FLOOR + 10.5);
      ctx.stroke();
    }
    // the bollard and its coil, on the near bank
    const bx = this.bollard;
    ctx.fillStyle = '#3A2A1E';
    ctx.fillRect(bx - 4, FLOOR - 12, 8, 12);
    ctx.fillRect(bx - 6, FLOOR - 14, 12, 3);
    // the rope: slack when the boat is close, taut when it is out; it jerks on a pull
    const bowX = this.boat.x - 2;
    const bowY = FLOOR - 4;
    const dist = Math.hypot(bowX - bx, bowY - (FLOOR - 12));
    const slack = this.state === 'out' ? Math.max(2, 26 - dist * 0.12) : 14;
    const jerk = w.tick - this.tug < 14 ? -6 : 0;
    ctx.strokeStyle = '#E8D9B0';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bx, FLOOR - 12);
    ctx.quadraticCurveTo((bx + bowX) / 2, (FLOOR - 12 + bowY) / 2 + slack + jerk, bowX, bowY);
    ctx.stroke();
    // a little chevron over the bollard while Dad is in reach of it: hop here
    if (this.state === 'out' && this.inZone(w)) {
      const k = Math.sin(w.tick * 0.12) * 2;
      ctx.fillStyle = 'rgba(255,240,200,0.9)';
      ctx.beginPath();
      ctx.moveTo(bx, FLOOR - 30 + k);
      ctx.lineTo(bx - 5, FLOOR - 24 + k);
      ctx.lineTo(bx + 5, FLOOR - 24 + k);
      ctx.fill();
    }
    void TAU;
  }
}

/** SVP-05's second act: two creeks, a boat tied up on the far bank of each, and the rope home to a bollard */
export const rassi: Act = {
  id: 'svp05-rassi',
  w: 62,
  advice: 'The boats are tied up on the far banks and the ropes run back to the bollards on yours. The edge is no use: the boat is out of reach. A hop beside a bollard is a pull on its rope, and every pull brings the boat in a little. When it is alongside, step on and let it carry you over. The second creek is wider and its bollard is well back from the edge.',
  cps: [27.5, 56],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 10, x + 23);
    g.pit(x + 34, x + 51);
  },
  build: (w, c) => {
    const x = c.x;
    const a = new Rope(px(x + 10), px(x + 24), px(x + 4) + 8, 80, 50).install(w);
    const b = new Rope(px(x + 34), px(x + 52), px(x + 27) + 8, 96, 58, 'svp-rassi2').install(w);
    (w.flags.ropes ??= []).push(a, b);
  },
};
