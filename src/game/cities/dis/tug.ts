// DIS round 2: DIS-09's own unbuilt betrayal from the bible (Rang Ghar, idea 10): the courtyard is a game ground where
// royal games run. Here a tug of war over a ditch: the rope is the only way across, and only while it is taut.
// Deterministic: starts on Dad's position, then runs on ticks.
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { person } from '../../levels/endkit';
import { GROUND, px } from './entities';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { tara } from '../../levels/endkit';

/**
 * A rope over a ditch between two teams. Each round the referee's flag shows who is winning and the taut rope drifts
 * toward that team; then the losing team falls over and the rope goes slack (no floor) until the next round.
 * The ditch kills: `dis-khaal` when the rope was slack, `dis-rope` when the rope was pulled out from under you.
 */
export class TugRope extends Entity {
  solid: Solid;
  started = -1;
  hazard: Hazard;
  lastOff = 0;
  lastT = -1;
  /** -1: near team winning (rope drifts back toward you), +1: far team */
  readonly order = [-1, 1, -1, 1, 1, -1];
  constructor(
    readonly d0: number,
    readonly d1: number,
    readonly trig: number,
    readonly taut = 300,
    readonly slack = 150,
    readonly speed = 48,
    readonly wait = 240,
    /** the finale: the teams have changed ends, so the red caps (and the red flag) are the NEAR team */
    readonly swapped = false,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(d0 - 3, GROUND, d1 - d0 + 6, 6);
    this.solid.collidable = false;
    const self = this;
    this.hazard = {
      active: true,
      get cause() {
        return self.solid.collidable ? 'dis-rope' : 'dis-khaal';
      },
      hits: (x: number, y: number, w: number, h: number) => x + w / 2 > self.d0 && x + w / 2 < self.d1 && y + h > GROUND + 10,
    };
  }
  /** the round now (-1 before the game starts) and ticks into it */
  phase(tick: number): { round: number; t: number; taut: boolean; dir: number } {
    if (this.started < 0) return { round: -1, t: 0, taut: false, dir: 0 };
    const s = tick - this.started - this.wait;
    if (s < 0) return { round: -1, t: s, taut: false, dir: 0 };
    const len = this.taut + this.slack;
    const round = Math.floor(s / len);
    const t = s % len;
    return { round, t, taut: t < this.taut, dir: this.order[round % this.order.length] };
  }
  update(w: World) {
    if (this.started < 0) {
      if (w.player.cx < this.trig) return;
      this.started = w.tick;
    }
    const p = this.phase(w.tick);
    const home = this.d0 - 3;
    if (!p.taut) {
      this.solid.collidable = false;
      this.solid.x = home;
      this.lastOff = 0;
      this.lastT = -1;
      return;
    }
    // the rope slides toward the winners; only the part over the ditch is floor (the rest is in the teams' hands)
    const off = Math.round((p.dir * this.speed * p.t) / 120);
    const a = Math.max(home, home + off);
    const b = Math.min(this.d1 + 3, this.d1 + 3 + off);
    const riding = this.solid.collidable && w.player.isRiding(this.solid);
    this.solid.collidable = b > a;
    this.solid.x = a;
    this.solid.w = Math.max(0, b - a);
    if (riding && this.lastT >= 0) w.player.x += off - this.lastOff;
    this.lastOff = off;
    this.lastT = p.t;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = this.phase(w.tick);
    const s = this.solid;
    // the ditch
    ctx.fillStyle = '#4B5A4A';
    ctx.fillRect(this.d0, GROUND + 8, this.d1 - this.d0, 8);
    // the rope: straight when taut, sagging into the ditch when slack
    ctx.strokeStyle = '#C9A66B';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (p.taut) {
      ctx.moveTo(s.x - 40, GROUND - 2);
      ctx.lineTo(s.x + s.w + 40, GROUND - 2);
    } else {
      ctx.moveTo(this.d0 - 52, GROUND - 6);
      ctx.quadraticCurveTo((this.d0 + this.d1) / 2, GROUND + 22, this.d1 + 52, GROUND - 6);
    }
    ctx.stroke();
    // the teams: leaning back while they pull; the losers on their backs while the rope is slack
    const lean = p.taut ? 3 : 0;
    const fell = !p.taut && p.round >= 0 ? -p.dir : 0;
    for (let i = 0; i < 3; i++) {
      const nx = this.d0 - 22 - i * 12;
      const fx = this.d1 + 22 + i * 12;
      if (fell === -1) ctx.fillRect(nx - 8, GROUND - 5, 16, 5);
      else person(ctx, nx - lean, GROUND - 24, 24, '#F1EBDD', '#B9855A', { arms: 4, cap: this.swapped ? '#C1121F' : '#2F6B3A' });
      if (fell === 1) ctx.fillRect(fx - 8, GROUND - 5, 16, 5);
      else person(ctx, fx + lean, GROUND - 24, 24, '#F1EBDD', '#B9855A', { arms: 4, cap: this.swapped ? '#2F6B3A' : '#C1121F' });
    }
    // the referee on the far bank's corner; his flag shows the team that is winning (green: near, red: far)
    const rx = this.d1 + 8;
    person(ctx, rx, GROUND - 40, 22, '#1F2A44', '#B9855A');
    if (p.taut) {
      // the flag is the winning team's colour
      ctx.fillStyle = p.dir < 0 !== this.swapped ? '#2F6B3A' : '#C1121F';
      ctx.fillRect(rx + (p.dir < 0 ? -14 : 6), GROUND - 52, 10, 7);
    }
  }
}

/** DIS-09 act: the royal games in the Rang Ghar courtyard (bible idea 10's own betrayal). Its lie: a taut rope is a bridge. */
export const rangTug: Act = {
  id: 'dis09-tug',
  w: 34,
  advice: 'A tug of war across the courtyard ditch: the rope is the only way over, and only while it is taut. The team that is winning pulls it toward them, and the referee’s flag shows which. Get on only when the far team (red flag) is winning, and cross at once.',
  cps: [1.5, 30.5],
  paint: (g, c) => {
    g.pit(c.x + 12, c.x + 22);
  },
  build: (w, c) => {
    const x = c.x;
    const r = w.add(new TugRope(px(x + 12), px(x + 23), px(x + 4)));
    w.solids.push(r.solid);
    (w.flags.tug ??= []).push(r);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Bhal, Dad! | Good, Dad!', 2.4));
  },
};

/** DIS-10 callback: the tug of war again, but the teams have changed ends: the red caps pull from your side now, so the
 *  red flag that meant "go" in 09 means the rope is coming back at you. Read the lean of the teams, not the colour. */
export const luitTug: Act = {
  id: 'dis10-tug',
  w: 34,
  advice: 'The tug of war again on the river bank, but the teams have changed ends: the red caps are on your side now. The flag shows the winning team’s colour, so go when the far team (green) is winning.',
  cps: [1.5, 30.5],
  paint: (g, c) => {
    g.pit(c.x + 12, c.x + 22);
  },
  build: (w, c) => {
    const x = c.x;
    const r = w.add(new TugRope(px(x + 12), px(x + 23), px(x + 4), 300, 150, 48, 240, true));
    w.solids.push(r.solid);
    (w.flags.tug ??= []).push(r);
    onPass(w, px(x + 2), (w2) => tara(w2, 'Moi najanu! | I don’t know!', 2.4));
  },
};
