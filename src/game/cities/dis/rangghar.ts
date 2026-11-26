// DIS-09: Rang Ghar's boat roof. The roof is oiled: wherever it is slick it pushes Dad back down the slope, faster than he can
// walk up it, and the royal games' wooden balls roll down it from the gutters. The ribs are the only things that stop a ball
// (they smash against them) and the grip pads in front of the ribs are the only places Dad can stand still.
import { Entity, type World } from '../../world';
import { roller } from '../../levels/kit';
import { GROUND, px } from './entities';

export interface RoofSection {
  /** first tile column of the slick part and its width in tiles; the pad (grip) is the 3 tiles after it, then the rib block */
  slick: number;
  slickW: number;
  /** push down the slope (px/s, positive = back to the left) */
  push: number;
  /** tile column of the chute above the slick part, or -1 for none */
  chute: number;
  /** ticks between balls */
  every: number;
}

export class Roof extends Entity {
  next: number[];
  started = -1;
  constructor(
    readonly secs: RoofSection[],
    readonly from: number,
  ) {
    super();
    this.layer = 1;
    this.next = secs.map(() => 0);
  }
  /** is tile column c slick, and how hard it pushes back */
  pushAt(cx: number) {
    for (const s of this.secs) if (cx >= px(s.slick) && cx < px(s.slick + s.slickW)) return s.push;
    return 0;
  }
  update(w: World) {
    const p = w.player;
    if (this.started < 0 && p.cx >= this.from) {
      this.started = w.tick;
      this.secs.forEach((s, i) => (this.next[i] = w.tick + 60 + i * 70));
    }
    if (p.onGround && w.state === 'play') p.pushVx -= this.pushAt(p.cx);
    if (this.started < 0 || w.state !== 'play') return;
    // land on the oil and the roof shakes: the gutter above tips its ball straight down on you
    if (p.landTick === w.tick)
      this.secs.forEach((s) => {
        if (s.chute >= 0 && p.cx >= px(s.slick) - 4 && p.cx < px(s.slick + s.slickW) + 4) {
          roller(w, 'dis-laru', p.x - 1, GROUND - 92, 0, { cause: 'dis-roof' });
          w.sfx('crack', px(s.chute), GROUND - 80);
        }
      });
    this.secs.forEach((s, i) => {
      if (s.chute >= 0 && w.tick >= this.next[i]) {
        this.next[i] = w.tick + s.every;
        roller(w, 'dis-laru', px(s.chute) + 3, GROUND - 10, -40, { cause: 'dis-roof', breakOnWall: true });
        w.sfx('thud', px(s.chute), GROUND - 80);
      }
    });
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    for (const s of this.secs) {
      const x0 = px(s.slick);
      const x1 = px(s.slick + s.slickW);
      // oiled roof: dark tiles with a sheen, and arrows down the slope
      ctx.fillStyle = 'rgba(40,30,20,0.35)';
      ctx.fillRect(x0, GROUND - 3, x1 - x0, 3);
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      for (let x = x0 + 4 + ((w.tick >> 2) % 10); x < x1 - 4; x += 10) ctx.fillRect(x, GROUND - 3, 4, 1);
      ctx.fillStyle = '#C1121F';
      for (let x = x0 + 8; x < x1 - 6; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x + 5, GROUND - 7);
        ctx.lineTo(x - 2, GROUND - 5.5);
        ctx.lineTo(x + 5, GROUND - 4);
        ctx.fill();
      }
      // the grip pad: unpainted brick-red tile with a gamosa-pattern stripe, and the wooden rib after it
      const p0 = x1;
      const p1 = x1 + 48;
      ctx.fillStyle = '#B5502A';
      ctx.fillRect(p0, GROUND - 2, p1 - p0, 2);
      ctx.fillStyle = '#FDF0D5';
      for (let x = p0 + 3; x < p1 - 3; x += 8) ctx.fillRect(x, GROUND - 2, 4, 2);
      if (s.chute >= 0) {
        // the gutter above the slick part where the balls come from
        ctx.fillStyle = '#6A4B1C';
        ctx.fillRect(px(s.chute) - 6, GROUND - 92, 16, 3);
        ctx.fillRect(px(s.chute) - 6, GROUND - 94, 2, 10);
        ctx.fillRect(px(s.chute) + 8, GROUND - 94, 2, 10);
      }
    }
  }
}

/** build the roof: the rib blocks are map tiles painted by the stage (see ribCols) */
export function ribCols(secs: RoofSection[]): number[] {
  return secs.map((s) => s.slick + s.slickW + 3);
}
/** the pavilion itself: the roof's brick-red tiles over the ground you walk on, its arches under it and the upper eave */
class Pavilion extends Entity {
  constructor(
    readonly x0: number,
    readonly x1: number,
  ) {
    super();
    this.layer = -3;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const { x0, x1 } = this;
    // roof tiles over the walking surface
    ctx.fillStyle = '#8C3B2A';
    ctx.fillRect(x0, GROUND, x1 - x0, 48);
    ctx.fillStyle = '#A9503A';
    for (let x = x0; x < x1; x += 8) ctx.fillRect(x, GROUND, 6, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let y = GROUND + 8; y < GROUND + 48; y += 8) ctx.fillRect(x0, y, x1 - x0, 1);
    // brick arches of the storey below, dark openings
    ctx.fillStyle = '#5A2A1E';
    for (let x = x0 + 10; x < x1 - 20; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND + 48);
      ctx.lineTo(x, GROUND + 30);
      ctx.quadraticCurveTo(x + 10, GROUND + 18, x + 20, GROUND + 30);
      ctx.lineTo(x + 20, GROUND + 48);
      ctx.fill();
    }
    // the upper eave the gutters hang from
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(x0, GROUND - 98, x1 - x0, 4);
    ctx.fillStyle = '#8C3B2A';
    ctx.beginPath();
    ctx.moveTo(x0 - 10, GROUND - 94);
    ctx.quadraticCurveTo((x0 + x1) / 2, GROUND - 116, x1 + 10, GROUND - 94);
    ctx.lineTo(x1 + 10, GROUND - 98);
    ctx.quadraticCurveTo((x0 + x1) / 2, GROUND - 124, x0 - 10, GROUND - 98);
    ctx.fill();
  }
}
export function roof(w: World, secs: RoofSection[], from: number) {
  const a = Math.min(...secs.map((s) => s.slick)) - 3;
  const b = Math.max(...secs.map((s) => s.slick + s.slickW)) + 4;
  w.add(new Pavilion(px(a), px(b)));
  const r = w.add(new Roof(secs, px(from)));
  (w.flags.roofs ??= []).push(r);
  return r;
}
