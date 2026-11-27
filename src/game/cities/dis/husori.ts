// DIS-07: the husori carollers. A group sings its way from house to house; each house has a bamboo gate that opens only for
// the group, and only for anyone walking inside its circle. The group never waits for Dad and never changes pace.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, overlapXYWH } from '../../constants';
import { person } from '../../levels/endkit';
import { GROUND, px } from './entities';

/** how close to the middle of the group counts as being inside its circle (px) */
export const CIRCLE = 40;

export interface GateDef {
  /** tile column of the gate */
  x: number;
  /** ticks of the group's stop at this gate before the gate opens (the host's gamosa ritual); 0: it opens as they arrive */
  ritual: number;
  /** ticks the group stays at the gate in all (including the ritual) */
  stay: number;
}

export class Husori extends Entity {
  /** centre of the circle */
  x: number;
  /** which gate it is at (index) or -1 */
  at = -1;
  /** ticks since it arrived at the gate it is at */
  t = 0;
  next = 0;
  walking = false;
  constructor(
    x: number,
    readonly gates: GateDef[],
    readonly from: number,
    readonly speed = 34,
  ) {
    super();
    this.x = x;
    this.layer = 2;
  }
  inside(w: World) {
    return !this.gone && w.state === 'play' && Math.abs(w.player.cx - this.x) <= CIRCLE;
  }
  update(w: World) {
    if (this.gone) return;
    if (!this.walking && w.player.cx >= this.from) this.walking = true;
    if (!this.walking) return;
    if (this.at >= 0) {
      this.t++;
      if (this.t >= this.gates[this.at].stay) {
        this.at = -1;
        this.next++;
      }
      return;
    }
    this.x += this.speed * DT;
    // past its last house the group turns off the lane and is gone
    const lastG = this.gates[this.gates.length - 1];
    if (this.next >= this.gates.length && this.x > px(lastG.x) + px(7)) this.gone = true;
    const g = this.gates[this.next];
    if (g && this.x >= px(g.x) + 8 - 6) {
      this.at = this.next;
      this.t = 0;
      w.sfx('dong', this.x, GROUND - 20);
    }
  }
  gone = false;
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.gone) return;
    const sing = this.walking && w.state !== 'dead';
    const bob = (k: number) => (sing ? Math.round(Math.sin(w.tick * 0.11 + k)) : 0);
    // a circle of men in white with red gamosas round their heads, a dhol in the middle
    const offs = [-30, -15, 15, 30];
    offs.forEach((o, k) => {
      const x = this.x + o;
      person(ctx, x, GROUND - 26 + bob(k), 26, '#F4EEDD', '#B9855A', { arms: sing ? 3 : 0 });
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(x - 4, GROUND - 28 + bob(k), 8, 2.5);
    });
    // the dhol and the man who plays it
    const cx = this.x;
    person(ctx, cx, GROUND - 27 + bob(9), 27, '#F4EEDD', '#B9855A', {});
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(cx - 9, GROUND - 17 + bob(9), 18, 8);
    ctx.fillStyle = '#E8D5A2';
    ctx.fillRect(cx - 10, GROUND - 17 + bob(9), 2, 8);
    ctx.fillRect(cx + 8, GROUND - 17 + bob(9), 2, 8);
    ctx.fillStyle = '#C1121F';
    ctx.fillRect(cx - 8, GROUND - 14 + bob(9), 16, 1.4);
    // a small ring on the ground under them, so you can see where the circle is
    ctx.strokeStyle = 'rgba(253,240,213,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(this.x - CIRCLE, GROUND - 1.5, CIRCLE * 2, 1.5);
    ctx.setLineDash([]);
    void w;
  }
}

/** a bamboo gate with sharpened stakes: shut unless the group is stopped here and Dad is inside its circle */
export class Gate extends Entity {
  solid: Solid;
  hazard: Hazard;
  open = false;
  /** ticks the opening condition has been false (a gate shuts only after a short warning) */
  private bad = 0;
  readonly gx: number;
  constructor(
    readonly group: Husori,
    readonly idx: number,
    readonly def: GateDef,
  ) {
    super();
    this.layer = 3;
    this.gx = px(def.x);
    this.solid = new Solid(this.gx, GROUND - 80, 12, 80);
    const self = this;
    this.hazard = {
      active: true,
      cause: 'dis-gate',
      hits: (x, y, w, h) => !self.open && overlapXYWH(x, y, w, h, { x: self.gx - 5, y: GROUND - 80, w: 5, h: 80 }),
    };
  }
  /** does the gate's rule hold now */
  wanted(w: World) {
    const g = this.group;
    return g.at === this.idx && g.t >= this.def.ritual && g.inside(w);
  }
  update(w: World) {
    const want = this.wanted(w);
    if (want) {
      this.bad = 0;
      if (!this.open) {
        this.open = true;
        this.solid.collidable = false;
        w.sfx('creak', this.gx, GROUND - 30);
      }
    } else if (this.open) {
      this.bad++;
      if (this.bad > 40) {
        this.open = false;
        this.solid.collidable = true;
        w.sfx('thud', this.gx, GROUND - 30);
        const p = w.player;
        if (w.state === 'play' && overlapXYWH(p.x, p.y, p.w, p.h, { x: this.gx, y: GROUND - 80, w: 12, h: 80 })) w.die('dis-gate');
      }
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.gx;
    const warn = this.open && this.bad > 0 && (w.tick >> 2) % 2 === 0;
    // the gate: two posts and bamboo bars; when open the bars are raised out of the way
    ctx.fillStyle = '#6A4B1C';
    ctx.fillRect(x - 2, GROUND - 90, 3, 90);
    ctx.fillRect(x + 11, GROUND - 90, 3, 90);
    const lift = this.open ? 76 : 0;
    ctx.fillStyle = warn ? '#C1121F' : '#B8A04A';
    for (let k = 0; k < 6; k++) ctx.fillRect(x + 1 + k * 2, GROUND - 78 - lift, 1.6, 78);
    ctx.fillStyle = '#8D6B2E';
    ctx.fillRect(x, GROUND - 56 - lift, 13, 2);
    ctx.fillRect(x, GROUND - 24 - lift, 13, 2);
    // the sharpened stakes on the road side: the tell
    ctx.fillStyle = '#E9DDB0';
    if (!this.open) for (let y = GROUND - 74; y < GROUND - 4; y += 12) {
      ctx.beginPath();
      ctx.moveTo(x - 1, y);
      ctx.lineTo(x - 7, y + 3);
      ctx.lineTo(x - 1, y + 6);
      ctx.fill();
    }
  }
}

/** build a group and its gates; returns them */
export function husori(w: World, startTx: number, from: number, gates: GateDef[], speed = 34) {
  const h = w.add(new Husori(px(startTx), gates, px(from), speed));
  const gs = gates.map((g, i) => {
    return w.add(new Gate(h, i, g));
  });
  (w.flags.husori ??= []).push(h);
  (w.flags.gates ??= []).push(...gs);
  return { h, gs };
}
