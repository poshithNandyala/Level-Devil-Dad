// DIS round 5, allocation v3 F451 spike-slides-under-jump (B11): sharpened bamboo splits laid out at the japi-maker's
// stall in Fancy Bazar. Each split slides along the ground the moment you jump at it: the first slides two tiles ahead,
// under the landing of an ordinary hop; the next slides back, toward you. Jump where it will NOT be: a short hop
// from well back on the first, down on the place it left, then over it where it stopped; an ordinary hop over the second. Waiting for a split to settle is no good either: the japi-maker's wife is coming up behind you
// with a third gamosa, and with three on you cannot see your feet.
import { Entity, type Hazard, type World } from '../../world';
import { person, tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { overlapXYWH } from '../../constants';
import { Danger, GROUND, px } from './entities';
import { BLIND_AT, Host, gam } from './gamosa';

export class SlidingSplit extends Entity {
  danger: Danger;
  hazard: Hazard;
  x: number;
  moved = false;
  private wasGround = true;
  constructor(
    readonly x0: number,
    /** tiles it slides when you jump at it (+ ahead, - back toward you) */
    readonly slide: number,
  ) {
    super();
    this.layer = 2;
    this.x = x0;
    this.danger = new Danger({ x: x0 + 2, y: GROUND - 10, w: 12, h: 10 }, 'dis-kaath');
    this.hazard = this.danger.hazard;
  }
  get settled() {
    return !this.moved || this.x === this.x0 + px(this.slide);
  }
  update(w: World) {
    const p = w.player;
    const tookOff = this.wasGround && !p.onGround && p.vy < 0;
    this.wasGround = p.onGround;
    // a jump from up to four tiles short of it sets it sliding (a hop from further back does not reach it anyway)
    if (!this.moved && tookOff && p.cx < this.x0 + 8 && p.cx > this.x0 - px(4)) this.moved = true;
    const target = this.x0 + px(this.slide);
    if (this.moved && this.x !== target) this.x += Math.sign(target - this.x) * Math.min(Math.abs(target - this.x), 6);
    this.danger.box.x = this.x + 2;
    // skidding flat along the dust it cuts nobody; it stands up again where it stops
    this.danger.on = this.settled;
    // fix round 2 (QA B1): walking into a split that never slid is not "it slid under your landing"
    this.hazard.cause = this.moved ? 'dis-kaath' : 'dis-kaath-walk';
  }
  draw(ctx: CanvasRenderingContext2D) {
    // the drag marks in the dust that show which way a split went
    ctx.fillStyle = 'rgba(80,60,40,0.4)';
    ctx.fillRect(Math.min(this.x0, this.x) + 2, GROUND - 1, Math.abs(this.x - this.x0) + 12, 1);
    ctx.fillStyle = '#C9A253';
    const h = this.settled ? 10 : 4;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(this.x + 2 + k * 4, GROUND);
      ctx.lineTo(this.x + 4 + k * 4, GROUND - h);
      ctx.lineTo(this.x + 6 + k * 4, GROUND);
      ctx.fill();
    }
    // the carved arrow on its base: which way it will go
    ctx.fillStyle = '#6B4A1E';
    const d = Math.sign(this.slide);
    const cx = this.x + 8;
    ctx.beginPath();
    ctx.moveTo(cx + d * 5, GROUND - 1.5);
    ctx.lineTo(cx - d * 2, GROUND - 3.5);
    ctx.lineTo(cx - d * 2, GROUND + 0.5);
    ctx.fill();
  }
}

/** the japi-maker's wife with the third gamosa, hurrying after Dad; she gives it once, if she reaches him */
export class Chaser extends Entity {
  done = false;
  going = false;
  constructor(
    public x: number,
    /** px per second */
    readonly speed: number,
  ) {
    super();
    this.layer = 2;
  }
  update(w: World) {
    if (this.done || !this.going || w.state !== 'play') return;
    this.x += this.speed / 120;
    const p = w.player;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x - 8, y: GROUND - 26, w: 16, h: 26 })) return;
    this.done = true;
    const g = gam(w);
    g.n = Math.min(4, g.n + 1);
    w.sfx('ding', this.x, GROUND - 20);
    w.say('Rok, rok! Aru ekhon! | Wait! One more!', this.x, GROUND - 34, 1.6, 'npc');
  }
  draw(ctx: CanvasRenderingContext2D) {
    person(ctx, this.x, GROUND - 26, 26, '#F2EAD3', '#B9855A', { arms: this.done ? 2 : 5 });
    if (!this.done) {
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(this.x - 8, GROUND - 25, 16, 4);
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(this.x - 8, GROUND - 25, 16, 1.2);
    }
  }
}

/** DIS-05 act: the japi-maker's splits (F451). */
export const gamKaath: Act = {
  id: 'dis05-kaath',
  w: 30,
  advice: 'At the japi-maker’s stall the sharpened bamboo splits lie in the lane, and each one slides the moment you jump at it: the carved arrow shows which way. The first slides ahead, under where an ordinary hop lands: hop short, down where it was, then hop it where it stopped. The next slides back toward you: an ordinary hop is right. Don’t stop to let a split settle: his wife is behind you with a third gamosa.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 22, c.x + 23);
  },
  build: (w, c) => {
    const x = c.x;
    onPass(w, px(x + 0.5), (w2) => (gam(w2).n = 0));
    for (const k of [6, 7]) w.add(new Host(px(x + k) + 8, GROUND, 'give'));
    const chaser = new Chaser(px(x + 2), 70);
    w.add(chaser);
    onPass(w, px(x + 8), () => (chaser.going = true));
    w.add(new SlidingSplit(px(x + 11), 2));
    w.add(new SlidingSplit(px(x + 18), -2));
    const ditch = new Danger({ x: px(x + 22), y: GROUND + 4, w: px(2), h: 80 }, 'dis-japi-gat');
    w.add(ditch);
    w.onTick((w2) => (ditch.hazard.cause = gam(w2).n >= BLIND_AT ? 'dis-kaath-gamosa' : 'dis-japi-gat'));
    for (const k of [26, 28]) w.add(new Host(px(x + k) + 8, GROUND, 'take'));
    onPass(w, px(x + 4), (w2) => tara(w2, 'Jump, Dad! | Jump, Dad!', 2));
  },
};
