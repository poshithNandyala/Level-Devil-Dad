// DIS round 5, allocation v3 F462 portal-chain-backwards (B28): the Ahom tunnels under Talatal Ghar, said to run to the
// Dikhow. A vault opens under the floor, with stone piers standing in it too far apart to jump. Each tunnel mouth takes
// you through to the next pier, a step back from that pier's own mouth, and its grate lifts a moment after you come up.
// Six mouths in a chain; on the last pier the plank bridge to the far side slides out 2.7 s after you arrive. Walk the
// chain: step, wait for the grate, step. The oiled beam over the vault is no short cut: the oil balls roll along it.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, GROUND, px } from './entities';

/** the piers' left columns (tiles from the act's x); the mouth on each is its right-hand tile */
export const PIERS = [11, 18, 25, 32, 39, 46];
const OPEN_AFTER = 0.6;
const BRIDGE_AFTER = 2.7;

export class Tunnels extends Entity {
  /** which pier Dad is on (-1: still on the near bank) and the tick he came up there */
  at = -1;
  since = 0;
  bridge: Solid;
  constructor(readonly x: number) {
    super();
    this.layer = 1;
    this.bridge = new Solid(px(x + 48), GROUND, px(4), 6);
    this.bridge.collidable = false;
  }
  /** the mouth Dad can walk into now (tile column of its centre), or null */
  mouth(i: number) {
    return i < 0 ? this.x + 4.5 : this.x + PIERS[i] + 1.5;
  }
  open(w: World, i: number) {
    return i < 0 || (i === this.at && w.tick - this.since >= OPEN_AFTER * 120);
  }
  update(w: World) {
    if (w.state !== 'play') return;
    const p = w.player;
    if (this.at === PIERS.length - 1) {
      if (w.tick - this.since >= BRIDGE_AFTER * 120) this.bridge.collidable = true;
      return;
    }
    // up on a pier some other way (off the beam): the chain goes on from there
    for (let i = this.at + 1; i < PIERS.length; i++) {
      const a = px(this.x + PIERS[i]);
      if (p.onGround && p.cx > a && p.cx < a + px(2)) {
        this.at = i;
        this.since = w.tick;
      }
    }
    const m = px(this.mouth(this.at));
    if (p.onGround && Math.abs(p.cx - m) < 4 && this.open(w, this.at)) {
      this.at++;
      this.since = w.tick;
      w.warp(px(this.x + PIERS[this.at]) + 1, GROUND - p.h, 'blink');
      w.sfx('ding', p.cx, GROUND - 10);
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (let i = -1; i < PIERS.length; i++) {
      const m = px(this.mouth(i));
      ctx.fillStyle = '#3A2A1E';
      ctx.fillRect(m - 7, GROUND - 22, 14, 22);
      ctx.beginPath();
      ctx.arc(m, GROUND - 22, 7, Math.PI, 0);
      ctx.fill();
      // the grate: down until it lifts
      if (i >= 0 && !(i === this.at && this.open(w, i))) {
        ctx.strokeStyle = '#8A8A80';
        ctx.lineWidth = 1;
        for (let k = -5; k <= 5; k += 2.5) {
          ctx.beginPath();
          ctx.moveTo(m + k, GROUND - 26);
          ctx.lineTo(m + k, GROUND);
          ctx.stroke();
        }
      }
    }
    if (this.bridge.collidable) {
      ctx.fillStyle = '#9C7A45';
      ctx.fillRect(this.bridge.x, GROUND, this.bridge.w, 5);
    }
  }
}

/** the oil balls rolling right to left along the beam over the vault, one every `every` ticks (a fixed set, wrapped round) */
class OilBalls extends Entity {
  balls: Danger[] = [];
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly top: number,
    readonly every = 70,
  ) {
    super();
    this.layer = 3;
  }
  setup(w: World) {
    const n = Math.ceil((this.x1 - this.x0) / (1.6 * this.every)) + 1;
    for (let i = 0; i < n; i++) this.balls.push(w.add(new Danger({ x: this.x1, y: this.top - 10, w: 10, h: 10 }, 'dis-tel-gola')) as Danger);
  }
  update(w: World) {
    const span = 1.6 * this.every * this.balls.length;
    this.balls.forEach((b, i) => {
      const d = (w.tick * 1.6 + i * 1.6 * this.every) % span;
      b.box.x = this.x1 - 10 - d;
      b.on = b.box.x >= this.x0;
    });
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#3B2F24';
    for (const b of this.balls) {
      if (!b.on) continue;
      ctx.beginPath();
      ctx.arc(b.box.x + 5, b.box.y + 5, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(40,30,20,0.35)';
    ctx.fillRect(this.x0, this.top - 1, this.x1 - this.x0, 1);
  }
}

/** DIS-09 act: the Ahom tunnels (F462). */
export const rangTunnels: Act = {
  id: 'dis09-tunnels',
  w: 56,
  advice: 'A vault opens under the floor, with stone piers too far apart to jump. Each tunnel mouth takes you up on the next pier, a step behind its own mouth, and that grate lifts a moment after you come up: stop, wait for it, then walk in. On the last pier the plank bridge slides out a little while after you arrive. Don’t take the oiled beam overhead: the oil balls roll along it.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 6, x + 51);
    for (const k of PIERS) g.fill(x + k, x + k + 1, 15, 17, '#');
    g.fill(x + 1, x + 3, 13, 13, '=');
    g.fill(x + 4, x + 16, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Danger({ x: px(x + 6), y: GROUND + 8, w: px(46), h: 80 }, 'dis-vault'));
    const t = new Tunnels(x);
    w.add(t);
    w.solids.push(t.bridge);
    (w.flags.tunnels ??= []).push(t);
    const balls = new OilBalls(px(x + 4), px(x + 17), px(11), 35);
    w.add(balls);
    balls.setup(w);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Upore upore, Dad! | Over the top, Dad!', 2.2));
  },
};
