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
      ctx.strokeStyle = 'rgba(244,236,214,0.7)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([4, 3]);
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
  for (const [x0, x1] of segs) {
    w.add(new Hurt(x0, FLOOR + 12, x1 - x0, 40, 'svp-nazar', null));
    w.add(new Fx(null, (ctx, w2) => gapWater(ctx, x0, x1, w2), 5));
  }
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
  w: 56,
  advice: 'Two more views. The first has two benches: the first picture takes you to the little island in the middle, and the island has a bench of its own for the rest. The second has its footprints a long way from the bench: it’s the footprints that count.',
  cps: [17.2, 30],
  paint: (g, c) => {
    const x = c.x;
    // gap 1 with an island in the middle; gap 2 further on
    g.pit(x + 8, x + 25).fill(x + 15, x + 18, 15, 17, '#');
    g.pit(x + 38, x + 49);
  },
  build: (w, c) => {
    const x = c.x;
    const a = new Viewpoint(px(x + 4) + 8, [{ x: px(x + 8), w: px(7) }], 300).install(w);
    const b = new Viewpoint(px(x + 16) + 8, [{ x: px(x + 19), w: px(7) }], 300, px(x + 16) + 30).install(w);
    // the third: the bench stands by the road, the footprints are three tiles on
    const cc = new Viewpoint(px(x + 32) + 8, [{ x: px(x + 38), w: px(12) }], 300, px(x + 29) + 8).install(w);
    (w.flags.vps ??= []).push(a, b, cc);
    gap(w, [px(x + 8), px(x + 15)], [px(x + 19), px(x + 26)], [px(x + 38), px(x + 50)]);
  },
};

// ================================================================== the door that exists only on the note
export const noteDoor: Ending = {
  space: 12,
  advice: 'The door is drawn in dashes in front of the last bench and there is nothing there to open. It exists only on the note: stand on the footprints without moving for a moment, and the door is there.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    d.hidden = true;
    const vp = new Viewpoint(px(D - 6) + 8, [], 9999, px(D - 6) + 30);
    w.add(vp);
    w.flags.twist = 'note';
    w.flags.notedoor = vp;
    w.onTick((w2) => {
      if (vp.everAligned && d.hidden) {
        d.hidden = false;
        w2.flags.twist = 'open';
        w2.emit('fx', d.x + 8, d.y + 16, { kind: 'sparkle' });
      }
    });
    w.add(
      new Fx(null, (ctx) => {
        if (!d.hidden) return;
        ctx.strokeStyle = 'rgba(244,236,214,0.75)';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(d.x + 1.5, d.y + 1.5, 13, 30);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(244,236,214,0.7)';
        text(ctx, '?', d.x + 8, d.y + 16, 8, 'rgba(244,236,214,0.8)', '');
      }, 3),
    );
  },
};
