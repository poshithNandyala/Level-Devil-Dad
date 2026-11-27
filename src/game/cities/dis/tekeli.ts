// DIS round 4, allocation v3 F460 shout-steers-hazard: tekeli bhonga at the Uruka field games. A blindfolded man swings
// his bamboo stick where the crowd shouts, "Bau!" (left) or "Xou!" (right), a moment after the shout. Stand where they
// are NOT shouting. Struck standing still is the stick; struck while moving across into the shouted side, as he turns
// on the shout, is the turn.
import { Entity, type World } from '../../world';
import { person, tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { GROUND, px } from './entities';

export class Tekeli extends Entity {
  started = -1;
  constructor(
    /** the man's column (px); his left side is [x - 3 tiles, x), his right side [x, x + 3 tiles) */
    readonly x: number,
    readonly trig: number,
    /** the shouts in order, one every `every` ticks: the swing comes `lead` ticks after each shout and lasts `swing` */
    readonly shouts: ('L' | 'R')[],
    readonly every = 150,
    readonly lead = 60,
    readonly swing = 36,
  ) {
    super();
    this.layer = 3;
  }
  /** index of the current shout and ticks into it (-1 before the trigger or after the last) */
  at(w: World): [number, number] {
    if (this.started < 0) return [-1, 0];
    const t = w.tick - this.started;
    const i = Math.floor(t / this.every);
    return i < this.shouts.length ? [i, t % this.every] : [-1, 0];
  }
  swingingSide(w: World): 'L' | 'R' | null {
    const [i, k] = this.at(w);
    if (i < 0) return null;
    return k >= this.lead && k < this.lead + this.swing ? this.shouts[i] : null;
  }
  update(w: World) {
    const p = w.player;
    if (this.started < 0 && p.cx >= this.trig) this.started = w.tick;
    const [i, k] = this.at(w);
    if (i >= 0 && k === 0) w.say(this.shouts[i] === 'L' ? 'Bau! | Left!' : 'Xou! | Right!', this.x + (this.shouts[i] === 'L' ? -40 : 40), GROUND - 50, 1, 'npc');
    const side = this.swingingSide(w);
    if (!side || w.state !== 'play' || p.y + p.h < GROUND - 30) return;
    const inL = p.cx >= this.x - px(3) && p.cx < this.x;
    const inR = p.cx >= this.x && p.cx < this.x + px(3);
    if ((side === 'L' && inL) || (side === 'R' && inR)) w.die(Math.abs(p.vx) > 20 ? 'dis-lathi-ghur' : 'dis-lathi');
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const side = this.swingingSide(w);
    person(ctx, this.x, GROUND - 28, 28, '#F1EBDD', '#B9855A', { arms: side ? 6 : 2, cap: '#C1121F' });
    // the blindfold, and the stick swung to one side
    ctx.fillStyle = '#C1121F';
    ctx.fillRect(this.x - 4, GROUND - 26, 10, 2);
    ctx.strokeStyle = '#8D6B2E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x + 2, GROUND - 16);
    const d = side === 'L' ? -1 : side === 'R' ? 1 : 0;
    ctx.lineTo(this.x + 2 + d * 44, GROUND - 6 - (d ? 0 : 20));
    ctx.stroke();
    ctx.lineWidth = 1;
    // the pots on poles behind him (the game's targets), not a trap
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(this.x - 50, GROUND - 70, 8, 8);
    ctx.fillRect(this.x + 42, GROUND - 70, 8, 8);
  }
}

/** DIS-07 act: tekeli bhonga (F460). */
export const husTekeli: Act = {
  id: 'dis07-tekeli',
  w: 22,
  advice: 'Tekeli bhonga at the Uruka field: a blindfolded man swings his stick wherever the crowd shouts, "Bau!" for his left or "Xou!" for his right, a moment after the shout. Get to the side they are NOT shouting, and get past him on a shout for the side you have just left.',
  cps: [1.5],
  build: (w, c) => {
    const x = c.x;
    const t = w.add(new Tekeli(px(x + 11), px(x + 6), ['R', 'L', 'R', 'L', 'L', 'R']));
    (w.flags.tekeli ??= []).push(t);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Bau, Dad! Bau! | Left, Dad! Left!', 2.2));
  },
};
