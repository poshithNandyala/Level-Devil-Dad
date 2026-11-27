// SVP-05 Note Ki Tasveer: the view from the bench. A note shows a viewpoint with a ledge across the gap; the ledge is
// drawn in dashes in the world, and it is only solid when seen from the spot the note was taken from, the
// footprints by the bench. Stand there a moment and the view lines up, for a few seconds. The act has more gaps, and
// a spot that is not at the bench. The door exists only on the note, until you stand at the last bench.
import { Entity, type LevelDef, type World } from '../../world';
import { door, rival, collectible } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { FLOOR, text } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L } from './lines';
import { Fx, Hurt, Plat, px, TAU, type Ctx } from './kit';

export interface Slab {
  x: number;
  w: number;
  y?: number;
}

const SLAB_H = 8;

/** a bench with footprints, and the ledge that is solid only while the view from the footprints lines up */
export class Viewpoint extends Entity {
  slabs: Plat[] = [];
  aligned = 0;
  everAligned = false;
  private still = 0;
  private now = 0;
  constructor(
    readonly spot: number,
    slabs: Slab[],
    readonly hold = 270,
    readonly benchX = spot + 22,
    readonly standTicks = 45,
  ) {
    super();
    this.layer = 1;
    for (const s of slabs) {
      const p = new Plat(s.x, s.y ?? FLOOR, s.w, SLAB_H, (ctx, q) => this.drawSlab(ctx, q));
      p.solid.collidable = false;
      p.visible = true;
      this.slabs.push(p);
    }
  }
  install(w: World) {
    w.add(this);
    for (const p of this.slabs) w.add(p);
    return this;
  }
  private drawSlab(ctx: Ctx, q: Plat) {
    if (this.aligned > 0) {
      const blink = this.aligned < 100 && (this.now >> 3) % 2 === 0;
      ctx.fillStyle = blink ? '#D9B98A' : '#C75C3C';
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.fillStyle = '#F4ECD6';
      ctx.fillRect(q.x, q.y, q.w, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(q.x, q.y + q.h - 2, q.w, 2);
    } else {
      // the ledge as the note shows it: dashes in the air
      ctx.fillStyle = 'rgba(244,236,214,0.14)';
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.strokeStyle = 'rgba(255,250,235,0.95)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(q.x + 0.5, q.y + 0.5, q.w - 1, q.h - 1);
      ctx.setLineDash([]);
    }
  }
  /** the player stands on the footprints */
  onSpot(w: World) {
    const p = w.player;
    return p.onGround && Math.abs(p.cx - this.spot) < 9 && Math.abs(p.vx) < 4 && !w.input.left && !w.input.right;
  }
  update(w: World) {
    this.now = w.tick;
    if (this.onSpot(w)) {
      this.still++;
      if (this.still === this.standTicks) {
        this.aligned = this.hold;
        this.everAligned = true;
        w.sfx('chime', this.spot, FLOOR);
        w.emit('fx', this.spot, FLOOR - 20, { kind: 'sparkle' });
      }
    } else this.still = 0;
    if (this.aligned > 0) this.aligned--;
    for (const p of this.slabs) p.solid.collidable = this.aligned > 0;
  }
  draw(ctx: Ctx, w: World) {
    const x = this.benchX;
    // the footprints: two little prints on the road
    ctx.fillStyle = 'rgba(58,30,18,0.55)';
    for (const dx of [-4, 3]) {
      ctx.beginPath();
      ctx.ellipse(this.spot + dx, FLOOR - 1.5, 2.6, 1.3, 0, 0, TAU);
      ctx.fill();
    }
    // the bench and the post with the note on it
    ctx.fillStyle = '#6B4A34';
    ctx.fillRect(x - 11, FLOOR - 8, 22, 3);
    ctx.fillRect(x - 10, FLOOR - 5, 2, 5);
    ctx.fillRect(x + 8, FLOOR - 5, 2, 5);
    ctx.fillRect(x - 11, FLOOR - 15, 22, 2);
    ctx.fillStyle = '#4A3A2A';
    ctx.fillRect(x + 14, FLOOR - 40, 2, 40);
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(x + 6, FLOOR - 50, 20, 14);
    ctx.strokeStyle = '#3A1E12';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 6.5, FLOOR - 49.5, 19, 13);
    // the picture on the note: two cliffs and the dashed ledge between
    ctx.fillStyle = '#7EC8E3';
    ctx.fillRect(x + 8, FLOOR - 48, 16, 9);
    ctx.fillStyle = '#2E6F40';
    ctx.fillRect(x + 8, FLOOR - 43, 4, 4);
    ctx.fillRect(x + 20, FLOOR - 43, 4, 4);
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 0.9;
    ctx.setLineDash([2, 1.5]);
    ctx.beginPath();
    ctx.moveTo(x + 12, FLOOR - 43);
    ctx.lineTo(x + 20, FLOOR - 43);
    ctx.stroke();
    ctx.setLineDash([]);
    void w;
  }
}

function gapWater(ctx: Ctx, x0: number, x1: number, w: World) {
  const g = ctx.createLinearGradient(0, FLOOR + 14, 0, FLOOR + 48);
  g.addColorStop(0, 'rgba(70,160,185,0.55)');
  g.addColorStop(1, 'rgba(18,80,100,0.9)');
  ctx.fillStyle = g;
  ctx.fillRect(x0, FLOOR + 14, x1 - x0, 34);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 0.8;
  for (let x = x0 + ((w.tick * 0.25) % 16); x < x1 - 6; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, FLOOR + 14.5);
    ctx.lineTo(x + 6, FLOOR + 14.5);
    ctx.stroke();
  }
}

/** a deep gap: water at the bottom and a hurt box, drawn in front; `segs` are the open stretches [x0, x1] (px) */
function gap(w: World, ...segs: [number, number][]) {
  return gapC(w, 'svp-nazar', ...segs);
}
function gapC(w: World, cause: string, ...segs: [number, number][]) {
  const hs: Hurt[] = [];
  for (const [x0, x1] of segs) {
    const h = new Hurt(x0, FLOOR + 12, x1 - x0, 40, cause, null);
    hs.push(h);
    w.add(h);
    w.add(new Fx(null, (ctx, w2) => gapWater(ctx, x0, x1, w2), 5));
  }
  return hs;
}

// ================================================================== the room
export function tasveerRoom(): LevelDef {
  return {
    id: 'SVP-05',
    city: 'SVP',
    index: 5,
    name: 'Note Ki Tasveer',
    nameEn: 'The picture on the note',
    tagline: 'North Bay has a viewpoint with a bench, and the old note has a picture taken from it. Tara says the picture is a lie. Tara says a lot of things.',
    hint: 'The gap is a long fall, and the ledge drawn in dashes across it is only a picture. It is solid only when the view lines up, and that is from the footprints by the bench, where the note was taken from. Stand on the footprints without moving for a moment, then run: the ledge holds for a few seconds.',
    par: 14,
    map: Grid.ground(15).pit(12, 23).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const vp = new Viewpoint(px(7) + 8, [{ x: px(12), w: px(12) }], 300).install(w);
      w.flags.vp = vp;
      gap(w, [px(12), px(24)]);
      rival(w, 3, 15, 1, { intro: L.intro[3], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-fishstick', 17.5, 10.8);
    },
  };
}

// ================================================================== the act
export const dekho: Act = {
  id: 'svp05-dekho',
  w: 36,
  advice: 'One more view, further on, and this time the bench is not where the picture was taken: it stands three tiles before the footprints. It is the footprints that count. Stand on them, and go while the ledge holds: it does not hold for ever.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 10, c.x + 21);
  },
  build: (w, c) => {
    const x = c.x;
    const a = new Viewpoint(px(x + 4) + 8, [{ x: px(x + 10), w: px(12) }], 300, px(x + 1) + 8).install(w);
    const [h] = gapC(w, 'svp-nazar', [px(x + 10), px(x + 22)]);
    // fell off a ledge that held for a while and was let go of: the picture only lined up for a time
    w.onTick(() => {
      h.cause = a.everAligned ? 'svp-nazar3' : 'svp-nazar';
    });
    (w.flags.vps ??= []).push(a);
  },
};

// ================================================================== the act: the eye height
/** the picture on the note was taken from a taller person's eyes: the view lines up only at the right height, not the right place */
export class EyeView extends Entity {
  /** slabs at the true height of the ledge, and the same slabs as seen from too high up: lower down the slope */
  right: Plat[] = [];
  low: Plat[] = [];
  aligned = 0;
  alignedLow = 0;
  private still = 0;
  private now = 0;
  constructor(
    readonly benchTop: number,
    readonly poleTop: number,
    readonly benchX: [number, number],
    readonly poleX: [number, number],
    slabs: Slab[],
    readonly gapHurt: Hurt,
    readonly hold = 300,
    readonly standTicks = 45,
  ) {
    super();
    this.layer = 1;
    for (const s of slabs) {
      const a = new Plat(s.x, FLOOR, s.w, SLAB_H, (ctx, q) => this.drawSlab(ctx, q, this.aligned > 0));
      const b = new Plat(s.x, FLOOR + 40, s.w, SLAB_H, (ctx, q) => this.drawSlab(ctx, q, this.alignedLow > 0, true));
      a.solid.collidable = false;
      b.solid.collidable = false;
      this.right.push(a);
      this.low.push(b);
    }
  }
  install(w: World) {
    w.add(this);
    for (const p of [...this.right, ...this.low]) w.add(p);
    return this;
  }
  private drawSlab(ctx: Ctx, q: Plat, on: boolean, lowOnes = false) {
    if (on) {
      ctx.fillStyle = (this.now >> 3) % 2 && (lowOnes ? this.alignedLow : this.aligned) < 100 ? '#D9B98A' : '#C75C3C';
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.fillStyle = '#F4ECD6';
      ctx.fillRect(q.x, q.y, q.w, 2);
    } else if (!lowOnes) {
      ctx.fillStyle = 'rgba(244,236,214,0.14)';
      ctx.fillRect(q.x, q.y, q.w, q.h);
      ctx.strokeStyle = 'rgba(255,250,235,0.95)';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(q.x + 0.5, q.y + 0.5, q.w - 1, q.h - 1);
      ctx.setLineDash([]);
    }
  }
  update(w: World) {
    this.now = w.tick;
    const p = w.player;
    const feet = p.y + p.h;
    const still = p.onGround && Math.abs(p.vx) < 4 && !w.input.left && !w.input.right;
    const onBench = still && Math.abs(feet - this.benchTop) < 3 && p.cx > this.benchX[0] && p.cx < this.benchX[1];
    const onPole = still && Math.abs(feet - this.poleTop) < 3 && p.cx > this.poleX[0] && p.cx < this.poleX[1];
    this.still = onBench || onPole ? this.still + 1 : 0;
    if (this.still === this.standTicks) {
      if (onBench) this.aligned = this.hold;
      else this.alignedLow = this.hold;
      w.sfx('chime', p.cx, feet);
      w.emit('fx', p.cx, feet - 20, { kind: 'sparkle' });
    }
    if (this.aligned > 0) this.aligned--;
    if (this.alignedLow > 0) this.alignedLow--;
    for (const s of this.right) s.solid.collidable = this.aligned > 0;
    for (const s of this.low) s.solid.collidable = this.alignedLow > 0;
    this.gapHurt.cause = this.alignedLow > 0 ? 'svp-nazar2' : 'svp-nazar';
  }
  draw(ctx: Ctx) {
    // the footprints on the road, for someone taller; the note on its post with the horizon above the trees
    const fx = (this.benchX[1] + this.poleX[0]) / 2;
    ctx.fillStyle = 'rgba(58,30,18,0.55)';
    for (const dx of [-4, 3]) {
      ctx.beginPath();
      ctx.ellipse(fx + dx, FLOOR - 1.5, 2.6, 1.3, 0, 0, TAU);
      ctx.fill();
    }
    const nx = this.benchX[0] - 24;
    ctx.fillStyle = '#4A3A2A';
    ctx.fillRect(nx + 14, FLOOR - 56, 2, 56);
    ctx.fillStyle = '#F4ECD6';
    ctx.fillRect(nx + 4, FLOOR - 70, 24, 16);
    ctx.strokeStyle = '#3A1E12';
    ctx.lineWidth = 1;
    ctx.strokeRect(nx + 4.5, FLOOR - 69.5, 23, 15);
    ctx.fillStyle = '#7EC8E3';
    ctx.fillRect(nx + 6, FLOOR - 68, 20, 11);
    ctx.fillStyle = '#2E6F40';
    ctx.fillRect(nx + 6, FLOOR - 63, 20, 6);
    // the horizon on the note, drawn well above the treetops
    ctx.strokeStyle = '#C0392B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(nx + 6, FLOOR - 65.5);
    ctx.lineTo(nx + 26, FLOOR - 65.5);
    ctx.stroke();
    // the bench, a low step, and the signboard on its pole
    ctx.fillStyle = '#6B4A34';
    ctx.fillRect(this.benchX[0], this.benchTop, this.benchX[1] - this.benchX[0], 4);
    ctx.fillRect(this.benchX[0] + 3, this.benchTop + 4, 3, FLOOR - this.benchTop - 4);
    ctx.fillRect(this.benchX[1] - 6, this.benchTop + 4, 3, FLOOR - this.benchTop - 4);
    ctx.fillStyle = '#4A3A2A';
    ctx.fillRect((this.poleX[0] + this.poleX[1]) / 2 - 1, this.poleTop, 2, FLOOR - this.poleTop);
    ctx.fillStyle = '#E8D7A8';
    ctx.fillRect(this.poleX[0], this.poleTop, this.poleX[1] - this.poleX[0], 5);
    ctx.fillStyle = '#8A1F14';
    text(ctx, 'VIEW', (this.poleX[0] + this.poleX[1]) / 2, this.poleTop + 2.5, 5, '#8A1F14', '');
  }
}

/** SVP-05's third act: the last bench's footprints are for someone taller */
export const ooncha: Act = {
  id: 'svp05-ooncha',
  w: 36,
  advice: 'The last view, and the footprints on the road are painted for someone taller: from the ground the picture never lines up, the horizon on the note sits above the trees. The bench behind them is the height of Dad’s eyes: stand on that. A signboard on a pole is higher still, and too high is as wrong as too low.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 11, c.x + 25);
  },
  build: (w, c) => {
    const x = c.x;
    const hurt = new Hurt(px(x + 11), FLOOR + 12, px(15), 40, 'svp-nazar', null);
    w.add(hurt);
    w.add(new Fx(null, (ctx, w2) => gapWater(ctx, px(x + 11), px(x + 26), w2), 5));
    const bench = new Plat(px(x + 3), FLOOR - 16, px(3), 16, () => {});
    const pole = new Plat(px(x + 8), FLOOR - 40, px(2), 5, () => {});
    w.add(bench);
    w.add(pole);
    const ev = new EyeView(FLOOR - 16, FLOOR - 40, [px(x + 3), px(x + 6)], [px(x + 8), px(x + 10)], [{ x: px(x + 11), w: px(15) }], hurt, 420).install(w);
    (w.flags.eyes ??= []).push(ev);
  },
};
