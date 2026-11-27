// Lakshadweep's own life.
import { Entity, type Hazard, type World } from '../../world';
import { DT, TILE, overlapXYWH } from '../../constants';

type Baby = { x: number; start: number; speed: number; in: boolean; inAt: number };

/**
 * A green turtle's nest on the beach (marked with a stake, as the islanders mark them). It hatches as you
 * come along the jetty, and the babies scramble across your path for the lagoon. Step on one and it's
 * over: they spread wider than any jump, so stop and let them all reach the water.
 */
export class Nest extends Entity {
  /** the mound's centre, the beach and the water's edge (px) */
  readonly x: number;
  readonly ground: number;
  readonly waterX: number;
  /** the tick it hatched (-1: not yet) */
  t0 = -1;
  readonly babies: Baby[] = [];
  hazard: Hazard;
  private said = false;

  /** what the islander shouts as it hatches (KVT-01's: stop) */
  readonly line: string;
  constructor(o: { tx: number; groundTy: number; waterTx: number; n?: number; gap?: number; line?: string }) {
    super();
    this.line = o.line ?? 'Nilkku! Aamakkunjungal! | Stop! Baby turtles!';
    this.layer = 2;
    this.x = o.tx * TILE + 8;
    this.ground = o.groundTy * TILE;
    this.waterX = o.waterTx * TILE;
    const speeds = [40, 35, 44, 37, 42, 34, 39];
    const n = o.n ?? 6;
    const gap = o.gap ?? 0.35;
    for (let i = 0; i < n; i++) this.babies.push({ x: this.x - 3, start: Math.round((i * gap) / DT), speed: speeds[i % speeds.length]!, in: false, inAt: -1 });
    const self = this;
    this.hazard = {
      active: true,
      cause: 'kvt-hatchling',
      hits(x, y, w, h) {
        if (self.t0 < 0) return false;
        for (const b of self.babies) if (self.out(b) && overlapXYWH(x, y, w, h, { x: b.x - 4, y: self.ground - 5, w: 8, h: 5 })) return true;
        return false;
      },
    };
  }

  static place(w: World, o: ConstructorParameters<typeof Nest>[0]): Nest {
    return w.add(new Nest(o));
  }

  private age(b: Baby) {
    return this.t0 < 0 ? -1 : this.tick - this.t0 - b.start;
  }
  private tick = 0;
  /** on the sand, between the nest and the water */
  out(b: Baby) {
    return this.age(b) >= 0 && !b.in;
  }
  /** every one of them is in the lagoon */
  get done() {
    return this.t0 >= 0 && this.babies.every((b) => b.in);
  }

  hatch(w: World) {
    if (this.t0 >= 0) return;
    this.t0 = this.tick;
    w.sfx('crack', this.x, this.ground - 6);
    w.emit('fx', this.x, this.ground - 4, { kind: 'dust' });
    w.say(this.line, this.x, this.ground - 50, 2.2, 'npc');
  }

  update(w: World) {
    this.tick = w.tick;
    if (this.t0 < 0) return;
    for (const b of this.babies) {
      const a = this.age(b);
      if (a < 0 || b.in) continue;
      // a waddle: flipper, flipper
      const step = 0.7 + 0.6 * Math.abs(Math.sin(a * 0.2));
      b.x += b.speed * step * DT;
      if (b.x >= this.waterX + 6) {
        b.in = true;
        b.inAt = w.tick;
        w.sfx('splash', b.x, this.ground);
      }
    }
    if (!this.said && w.state === 'dead' && w.deathCause === 'kvt-hatchling') {
      this.said = true;
      w.say('Kunjungale chavittalle! | Don’t step on the babies!', w.player.cx, w.player.y - 26, 2.4, 'npc');
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    const g = this.ground;
    const opened = this.t0 >= 0;
    // the marker stake with its ribbon
    ctx.fillStyle = '#7A5A3A';
    ctx.fillRect(this.x + 12, g - 22, 2, 22);
    ctx.fillStyle = '#D8432F';
    const flap = Math.sin(w.tick * 0.12) * 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x + 14, g - 22);
    ctx.lineTo(this.x + 21, g - 20 + flap);
    ctx.lineTo(this.x + 14, g - 17);
    ctx.fill();
    // the mound (flattened and broken open once they're out)
    ctx.fillStyle = '#EDE0C2';
    ctx.beginPath();
    ctx.ellipse(this.x, g, 13, opened ? 4 : 7, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(150,120,80,0.6)';
    ctx.lineWidth = 0.8;
    if (!opened) {
      // it twitches a little before it hatches
      const tw = Math.sin(w.tick * 0.9) > 0.92 ? 1 : 0;
      ctx.beginPath();
      ctx.moveTo(this.x - 5, g - 3 - tw);
      ctx.lineTo(this.x - 1, g - 6 - tw);
      ctx.lineTo(this.x + 3, g - 4);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#C9B48C';
      ctx.beginPath();
      ctx.ellipse(this.x, g - 1, 7, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // the babies
    for (const b of this.babies) {
      const a = this.age(b);
      if (a < 0) continue;
      if (b.in) {
        // a ring on the water where each one went in
        const k = (w.tick - b.inAt) / 40;
        if (k < 1) {
          ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(b.x, g + 7, 3 + 8 * k, 1 + 2 * k, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        continue;
      }
      const fl = Math.sin(a * 0.4) * 1.2;
      const y = g - 3;
      // flippers
      ctx.fillStyle = '#1F3A2C';
      ctx.fillRect(b.x - 4, y + 1 + fl * 0.5, 2, 1.5);
      ctx.fillRect(b.x + 2, y + 1 - fl * 0.5, 2, 1.5);
      // shell and head
      ctx.fillStyle = '#2F5A40';
      ctx.beginPath();
      ctx.ellipse(b.x, y, 3.6, 2.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4C7D5C';
      ctx.fillRect(b.x - 1.5, y - 1.6, 3, 1);
      ctx.fillStyle = '#1F3A2C';
      ctx.beginPath();
      ctx.arc(b.x + 4.2, y - 0.2, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
