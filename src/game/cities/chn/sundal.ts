// CHN-01's own bite: the sundal cart on the Marina promenade (archetype B5, cadence then a liar).
// The vendor lifts the pan's lid on a steady beat and a column of scalding steam stands over the path while it is
// up; shut, the path is clear. Everyone reads the beat and goes the moment it shuts. But the beat lies exactly once:
// when a customer (Dad) comes near, the vendor lifts the lid again right after shutting it, to show the sundal.
// The honest tell is his hand: it goes to the lid's handle before every lift. Cross when the lid is shut AND his
// hand is off the handle. Deterministic: the beat runs on the world's tick.
import { Entity, type Hazard, type World } from '../../world';
import { DT } from '../../constants';
import { px } from '../../levels/kit';
import { person, tara as taraSays } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';

const OPEN = 0.5;
const SHUT = 1.1;
/** the hand goes to the handle this long before a lift */
const TELL = 0.25;
/** the liar: the one shut after Dad comes near lasts only this long */
const LIE = 0.35;

export class SundalCart extends Entity {
  hazard: Hazard;
  lid: 'open' | 'shut' = 'shut';
  /** tick the lid last changed */
  at = 0;
  /** how long this shut lasts (the liar shortens one) */
  shutFor = SHUT;
  /** the one short shut is still to come (armed when Dad comes near) */
  private lie: 'off' | 'armed' | 'told' = 'off';
  readonly x0: number;
  readonly w = px(2);
  readonly ground: number;
  constructor(tx: number, groundTy: number) {
    super();
    this.layer = 3;
    this.x0 = px(tx);
    this.ground = px(groundTy);
    const self = this;
    this.hazard = {
      active: false,
      cause: 'chn-sundal',
      hits: (x, y, w, h) => self.hazard.active && x < self.x0 + self.w - 2 && x + w > self.x0 + 2 && y + h > self.ground - 44 && y < self.ground,
    };
  }
  /** seconds since the lid last changed */
  since(w: World) {
    return (w.tick - this.at) * DT;
  }
  /** the vendor's hand is on the handle: a lift is coming */
  hand(w: World) {
    return this.lid === 'shut' && this.since(w) >= this.shutFor - TELL;
  }
  /** a customer: the vendor lifts the lid now to show the sundal, and the shut after it is the short one */
  arm(w: World) {
    if (this.lie !== 'off') return;
    this.lie = 'armed';
    if (this.lid === 'shut') {
      this.lid = 'open';
      this.at = w.tick;
      this.hazard.active = true;
      w.sfx('pour', this.x0 + this.w / 2, this.ground - 30);
    }
  }
  update(w: World) {
    const t = this.since(w);
    if (this.lid === 'open' && t >= OPEN) {
      this.lid = 'shut';
      this.at = w.tick;
      this.hazard.active = false;
      if (this.lie === 'armed') {
        this.shutFor = LIE;
        this.lie = 'told';
      } else this.shutFor = SHUT;
      w.sfx('snap', this.x0 + this.w / 2, this.ground - 30);
    } else if (this.lid === 'shut' && t >= this.shutFor) {
      this.lid = 'open';
      this.at = w.tick;
      this.hazard.active = true;
      // the lift after the short shut is its own death (law 9): the beat lied, not the steam
      this.hazard.cause = this.shutFor === LIE ? 'chn-sooda' : 'chn-sundal';
      w.sfx('pour', this.x0 + this.w / 2, this.ground - 30);
      if (this.shutFor === LIE) w.say('Paaru, sooda irukku! | Look, it is hot!', this.x0 + 40, this.ground - 58, 1.2, 'npc');
    }
    w.flags.sundal = this.lid === 'open' ? 'open' : this.hand(w) ? 'hand' : 'shut';
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.x0,
      g = this.ground;
    // the cart: a wooden box on two wheels, a shelf of paper cones
    ctx.fillStyle = '#263238';
    ctx.beginPath();
    ctx.arc(x + 7, g - 4, 4, 0, Math.PI * 2);
    ctx.arc(x + this.w - 7, g - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(x, g - 22, this.w, 16);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(x, g - 22, this.w, 3);
    ctx.fillStyle = '#F5F5F5';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 3 + i * 6, g - 19);
      ctx.lineTo(x + 6 + i * 6, g - 19);
      ctx.lineTo(x + 4.5 + i * 6, g - 12);
      ctx.fill();
    }
    // the pan, and its lid: flat when shut, standing when open
    ctx.fillStyle = '#9E9E9E';
    ctx.fillRect(x + 4, g - 28, this.w - 8, 7);
    ctx.fillStyle = '#BDBDBD';
    if (this.lid === 'shut') ctx.fillRect(x + 3, g - 31, this.w - 6, 3);
    else ctx.fillRect(x + this.w - 8, g - 50, 3, 24);
    if (this.lid === 'open') {
      // the steam column over the path
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = 0; i < 9; i++) {
        const sy = g - 30 - ((w.tick * 1.6 + i * 9) % 46);
        const sx = x + 4 + ((i * 11 + Math.floor(w.tick / 3)) % (this.w - 12));
        ctx.beginPath();
        ctx.arc(sx + 2, sy, 3 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // the vendor, right of the cart; his hand goes up to the handle before a lift
    const hand = this.hand(w);
    person(ctx, x + this.w + 10, g - 18, 18, '#EF6C00', '#A0653B', { arms: hand ? 9 : 0 });
    ctx.fillStyle = '#A0653B';
    if (hand) ctx.fillRect(x + this.w - 2, g - 34, 6, 3);
  }
}

export const sundalOf = (w: World) => w.entities.find((e) => e instanceof SundalCart) as SundalCart | undefined;

/** place the cart with its steam over tiles tx..tx+2; Dad coming within 3 tiles makes the vendor lift the lid
 *  (a runner meets the steam) and arms the one short shut after it (the liar) */
export function sundalBite(w: World, tx: number, groundTy = 15) {
  const cart = w.add(new SundalCart(tx, groundTy));
  w.hazards.push(cart.hazard);
  cart.lid = 'shut';
  cart.at = 0;
  onPass(w, px(tx - 3), (w2) => {
    cart.arm(w2);
    w2.say('Sundal! Sooda sundal! | Sundal! Hot sundal!', px(tx) + 8, px(groundTy - 4.4), 1.6, 'npc');
  });
  onPass(w, px(tx - 7), (w2) => w2.guide('Moodi illa, avan kai-ya paaru. | Not the lid, watch his hand.'));
  onPass(w, px(tx - 2.2), (w2) => taraSays(w2, 'Moodina udane odu, Dad! | Run the moment it shuts, Dad!', 1.4));
  return cart;
}
