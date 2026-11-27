// Two door betrayals of their own (the length pass), from DIS's reserve ideas: the Uruka fishing net pulled in by a group
// (DIS-R1, no thatch) and the muga cocoon reeled up (DIS-R2). Deterministic: both start on Dad's position, then run on ticks.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { person } from '../../levels/endkit';
import { GROUND } from './entities';

/**
 * DIS-07's door: Uruka night fishing. A net lies across the pond and the fishers on the far bank pull it in together once
 * you come near: its near end slides away toward them. Cross it at a run; stop and it is gone from under you.
 */
export class UrukaNet extends Entity {
  solid: Solid;
  started = -1;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly trig: number,
    readonly speed = 50,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(x0, GROUND, x1 - x0, 8);
  }
  update(w: World) {
    if (this.started < 0 && w.player.cx >= this.trig) {
      this.started = w.tick;
      w.sfx('shove', this.x1, GROUND - 20);
    }
    if (this.started >= 0 && this.solid.w > 0) {
      const nx = Math.min(this.x1, this.x0 + ((w.tick - this.started) * this.speed) / 120);
      this.solid.x = Math.round(nx);
      this.solid.w = Math.max(0, this.x1 - this.solid.x);
      this.solid.collidable = this.solid.w > 0;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    if (s.w > 0) {
      ctx.strokeStyle = '#D9CBB0';
      ctx.lineWidth = 0.8;
      for (let x = s.x; x < s.x + s.w - 2; x += 6) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND);
        ctx.lineTo(x + 6, GROUND + 6);
        ctx.moveTo(x + 6, GROUND);
        ctx.lineTo(x, GROUND + 6);
        ctx.stroke();
      }
      ctx.fillStyle = '#8D6B2E';
      ctx.fillRect(s.x, GROUND - 1, s.w, 2);
    }
    // the fishers on the far bank, hauling on the rope
    const pulling = this.started >= 0 && s.w > 0;
    const pull = pulling ? Math.sin(w.tick * 0.3) * 2 : 0;
    for (const dx of [12, 26, 40]) person(ctx, this.x1 + dx + pull, GROUND - 24, 24, '#E8E1CC', '#B9855A', { arms: pulling ? 4 : 0, cap: '#C1121F' });
  }
}

/**
 * DIS-03's door: a muga cocoon on the reeling frame by the garden bungalow. The reel lifts the cocoon up its thread to the
 * verandah, pauses there, and then reels it in to the wheel: step off at the top, or be reeled in with it.
 */
export class MugaReel extends Entity {
  solid: Solid;
  /** ticks into the current cycle (-1: waiting for Dad) */
  t = -1;
  readonly yRest: number;
  constructor(
    readonly x: number,
    readonly yTop: number,
    readonly from: number,
  ) {
    super();
    this.layer = 2;
    this.yRest = GROUND - 8;
    this.solid = new Solid(x, this.yRest, 32, 8);
  }
  /** cycle: rest 0-90, rise 90-250, top 250-340, reeled in 340-380, gone 380-470 */
  private yAt(t: number) {
    if (t < 90) return this.yRest;
    if (t < 250) return this.yRest + ((this.yTop - this.yRest) * (t - 90)) / 160;
    if (t < 340) return this.yTop;
    if (t < 380) return this.yTop - ((t - 340) * 60) / 40;
    return this.yRest;
  }
  get phase() {
    const t = this.t;
    return t < 0 ? 'wait' : t < 90 ? 'rest' : t < 250 ? 'rise' : t < 340 ? 'top' : t < 380 ? 'reel' : 'gone';
  }
  update(w: World) {
    if (this.t < 0 && w.player.cx >= this.from) this.t = 0;
    if (this.t < 0) return;
    this.t = (this.t + 1) % 470;
    const ny = this.yAt(this.t);
    const riding = w.player.isRiding(this.solid);
    if (this.phase === 'reel' && w.state === 'play' && riding) {
      w.die('dis-reel');
      return;
    }
    this.solid.collidable = this.t < 340 || this.t >= 380;
    if (this.t >= 380) this.solid.place(this.x, this.yRest);
    else {
      const dy = Math.round(ny) - this.solid.y;
      if (dy !== 0) this.solid.moveBy(w, 0, dy);
    }
    if (this.t === 560) w.sfx('creak', this.x + 16, this.yTop - 40);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const cx = this.x + 16;
    const wy = this.yTop - 70;
    // the reeling frame: two posts and the wheel
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(cx - 18, wy, 3, GROUND - wy);
    ctx.fillRect(cx + 15, wy, 3, GROUND - wy);
    ctx.strokeStyle = '#6A4B1C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, wy, 12, 0, Math.PI * 2);
    ctx.stroke();
    const a = w.tick * (this.phase === 'rise' || this.phase === 'reel' ? 0.12 : 0.01);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * 12, wy + Math.sin(a) * 12);
    ctx.lineTo(cx - Math.cos(a) * 12, wy - Math.sin(a) * 12);
    ctx.stroke();
    const shown = this.phase !== 'gone';
    const y = this.phase === 'reel' ? this.yAt(this.t) : this.solid.y;
    if (shown) {
      ctx.strokeStyle = 'rgba(230,190,90,0.9)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, wy + 12);
      ctx.lineTo(cx, y);
      ctx.stroke();
      ctx.fillStyle = '#D9A93A';
      ctx.beginPath();
      ctx.ellipse(cx, y + 4, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F2D27A';
      ctx.fillRect(cx - 10, y + 1, 20, 1.5);
    }
  }
}
