// DIS round 4, allocation v3 F458 pause-before-charge (B17): Goru Bihu, the day the cattle are bathed and fed, in a lane
// by the river. A bull patrols the lane. When it stops and lowers its head you have about a second to be out of its lane,
// sideways, up on a verandah; then it charges along the lane. Run past it while it walks and it turns on you.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { DT } from '../../constants';
import { GROUND, px } from './entities';

export class Bull extends Entity {
  x: number;
  dir = 1;
  phase: 'wait' | 'walk' | 'pause' | 'charge' = 'wait';
  t = 0;
  /** the cause a hit has now: a charge is the bull's charge; turning on someone who passed it is the lane */
  cause = 'dis-goru';
  constructor(
    readonly a: number,
    readonly b: number,
    readonly trig: number,
    readonly walkTicks = 260,
    readonly pauseTicks = 80,
    readonly walkSpeed = 40,
    readonly chargeSpeed = 240,
  ) {
    super();
    this.x = (a + b) / 2;
    this.layer = 3;
  }
  inLane(w: World) {
    const p = w.player;
    return p.y + p.h >= GROUND - 1 && p.cx > this.a - 20 && p.cx < this.b + 20;
  }
  update(w: World) {
    const p = w.player;
    if (this.phase === 'wait') {
      if (p.cx >= this.trig) {
        this.phase = 'walk';
        this.t = 0;
      }
      return;
    }
    this.t++;
    if (this.phase === 'walk') {
      this.cause = 'dis-goru-lane';
      this.x += this.dir * this.walkSpeed * DT;
      if (this.x <= this.a || this.x >= this.b) this.dir = -this.dir;
      // pass it while it walks and it turns on you at once
      const behind = this.dir > 0 ? p.cx < this.x - 10 : p.cx > this.x + 10;
      if (this.inLane(w) && behind && Math.abs(p.cx - this.x) < 36) {
        this.dir = -this.dir;
        this.phase = 'charge';
        this.t = 0;
        this.cause = 'dis-goru-lane';
      } else if (this.t >= this.walkTicks) {
        this.phase = 'pause';
        this.t = 0;
        w.sfx('snort', this.x, GROUND - 20);
      }
    } else if (this.phase === 'pause') {
      // head down, facing Dad
      this.dir = p.cx >= this.x ? 1 : -1;
      if (this.t >= this.pauseTicks) {
        this.phase = 'charge';
        this.t = 0;
        this.cause = 'dis-goru';
      }
    } else {
      this.x += this.dir * this.chargeSpeed * DT;
      if (this.x <= this.a || this.x >= this.b) {
        this.x = Math.max(this.a, Math.min(this.b, this.x));
        this.dir = -this.dir;
        this.phase = 'walk';
        this.t = 0;
      }
    }
    if (w.state === 'play' && this.phase !== 'pause' && this.inLane(w) && Math.abs(p.cx - this.x) < 18) w.die(this.cause);
    if (w.state === 'play' && this.phase === 'pause' && this.inLane(w) && Math.abs(p.cx - this.x) < 12) w.die('dis-goru');
  }
  draw(ctx: CanvasRenderingContext2D) {
    const x = this.x;
    const head = this.phase === 'pause' || this.phase === 'charge' ? 6 : 0;
    ctx.fillStyle = '#6B4A2E';
    ctx.fillRect(x - 16, GROUND - 20, 32, 14);
    ctx.fillRect(x - 14, GROUND - 6, 3, 6);
    ctx.fillRect(x + 11, GROUND - 6, 3, 6);
    // the head, lowered before a charge, horns forward
    const hx = x + this.dir * 18;
    ctx.fillRect(hx - 5, GROUND - 22 + head, 10, 10);
    ctx.fillStyle = '#E8E1CC';
    ctx.fillRect(hx + this.dir * 4, GROUND - 24 + head, 6, 2);
    // a Goru Bihu garland
    ctx.fillStyle = '#F2A33A';
    ctx.fillRect(x + this.dir * 10 - 3, GROUND - 18, 6, 4);
  }
}

/** DIS-07 act: the Goru Bihu bull in the lane (F458). */
export const husGoru: Act = {
  id: 'dis07-goru',
  w: 30,
  advice: 'Goru Bihu: a garlanded bull walks up and down the lane by the river. When it stops and lowers its head it will charge along the lane a second later: get out of the lane sideways, up on a verandah, and wait till it has run past and is walking again. Don’t run past it while it walks: it turns on you.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    // two verandahs beside the lane, a step up
    g.fill(x + 8, x + 11, 14, 14, '#');
    g.fill(x + 17, x + 20, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const b = w.add(new Bull(px(x + 5), px(x + 25), px(x + 4)));
    (w.flags.bull ??= []).push(b);
    void Solid;
    onPass(w, px(x + 2), (w2) => tara(w2, 'Goru Bihu, Dad! Thiya thaka! | Goru Bihu, Dad! Stand still!', 2.6));
  },
};
