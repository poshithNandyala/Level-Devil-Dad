// DIS round 4: Talatal Ghar (allocation v3 F448, collapsing-stair-penultimate-rises), the new DIS-04 room, and its finale
// callback. Talatal Ghar at Sivasagar is the Ahom palace with floors below ground (bible §2). Its stair down falls step by
// step in order as you descend; racing it to the bottom dies (the bottom step is gone), and the step before the last
// RISES back up and is the way: wait on it as it comes up. Wait at the top and the landing goes into the flooded vault.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { Danger, Decor, GROUND, px } from './entities';

export interface StepDef {
  /** column, row (top of the step), width in tiles */
  c: number;
  r: number;
  w: number;
  /** ticks after the trigger it falls (Infinity: never) */
  fall: number;
  /** rise: [start tick, rows up, ticks it takes] */
  rise?: [number, number, number];
}

export class Stair extends Entity {
  solids: Solid[] = [];
  started = -1;
  private risen: number[] = [];
  constructor(
    readonly steps: StepDef[],
    readonly trig: number,
  ) {
    super();
    this.layer = 1;
    for (const s of steps) {
      this.solids.push(new Solid(px(s.c), px(s.r), px(s.w), 10));
      this.risen.push(0);
    }
  }
  clock(w: World) {
    return this.started < 0 ? -1 : w.tick - this.started;
  }
  update(w: World) {
    if (this.started < 0 && w.player.cx >= this.trig) this.started = w.tick;
    const c = this.clock(w);
    if (c < 0) return;
    this.steps.forEach((s, i) => {
      const so = this.solids[i];
      if (c >= s.fall) so.collidable = false;
      if (s.rise && c >= s.rise[0] && this.risen[i] < px(s.rise[1])) {
        const dy = Math.min(px(s.rise[1]) / s.rise[2], px(s.rise[1]) - this.risen[i]);
        this.risen[i] += dy;
        so.moveBy(w, 0, -dy);
      }
    });
  }
  /** ticks until step i falls (Infinity if it does not), for the warning shake */
  left(w: World, i: number) {
    const c = this.clock(w);
    return c < 0 ? Infinity : this.steps[i].fall - c;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    this.steps.forEach((s, i) => {
      const so = this.solids[i];
      if (!so.collidable) return;
      const shake = this.left(w, i) < 40 ? Math.round(Math.sin(w.tick * 1.4)) : 0;
      // Ahom thin bricks: dark red courses with pale mortar lines
      ctx.fillStyle = '#8E3B2A';
      ctx.fillRect(so.x + shake, so.y, so.w, 10);
      ctx.fillStyle = '#D9C9A8';
      for (let k = 0; k < 3; k++) ctx.fillRect(so.x + shake, so.y + 2 + k * 3, so.w, 0.8);
      if (s.rise) {
        // the step that comes back: its edge is worn smooth, a paler brick
        ctx.fillStyle = '#B85C44';
        ctx.fillRect(so.x + shake, so.y, so.w, 2);
      }
    });
  }
}

/** a stair at columns (steps), the flooded vault under it (dis-doba) and the shaft where the last step was (dis-talatal) */
export function stair(w: World, steps: StepDef[], trig: number, vault: [number, number], shaft: [number, number]) {
  const s = w.add(new Stair(steps, px(trig)));
  w.add(new Danger({ x: px(vault[0]), y: GROUND + 4, w: px(vault[1] - vault[0]), h: 80 }, 'dis-doba'));
  w.add(new Danger({ x: px(shaft[0]), y: GROUND - 8, w: px(shaft[1] - shaft[0]), h: 80 }, 'dis-talatal'));
  (w.flags.stair ??= []).push(s);
  return s;
}

/** DIS-10 callback to 04, broken: in the river-bank cellar the steps fall BOTTOM-first, so the 04 wait on the penultimate
 *  step meets the fall; race down before the collapse climbs to you, out at the bottom. */
export const luitTalatal: Act = {
  id: 'dis10-talatal',
  w: 30,
  advice: 'An old cellar stair on the river bank, like Talatal Ghar’s. But these steps fall from the BOTTOM up, the moment you step on the stair: no step comes back. Run straight down and out along the bottom before the fall climbs up to you.',
  cps: [1.5],
  paint: (g, c) => {
    const x = c.x;
    // brick steps up on to the high bank (one tile each), the bank, then the cellar stair down to the river bank
    for (let k = 0; k < 6; k++) g.fill(x + 2 + k, x + 7, 14 - k, 14 - k, '#');
    g.fill(x + 7, x + 7, 9, 14, '#');
    g.pit(x + 8, x + 17);
  },
  build: (w, c) => {
    const x = c.x;
    // five steps from row 10 down to row 14; the bottom one goes first, then each one above it
    const steps: StepDef[] = [0, 1, 2, 3, 4].map((i) => ({ c: x + 8 + i * 2, r: 10 + i, w: 2, fall: 170 + (4 - i) * 25 }));
    stair(w, steps, x + 6.5, [x + 8, x + 18], [x + 18, x + 18]);
    // fix round 2 (QA B4): out at the foot of the stair the cellar passage is low. Run out under its brick vault; a
    // hop there (hopping down a falling stair, or mashing jump) meets the vault
    w.add(new Danger({ x: px(x + 20), y: GROUND - 26, w: px(3), h: 10 }, 'dis-talatal-ulta'));
    w.add(
      new Decor((ctx) => {
        ctx.fillStyle = '#5A3E2B';
        ctx.fillRect(px(x + 20), GROUND - 60, px(3), 44);
        ctx.fillStyle = '#3A2A1E';
        for (let k = 0; k < 6; k++) ctx.fillRect(px(x + 20) + k * 8, GROUND - 20, 7, 3);
      }, 2),
    );
    onPass(w, px(x + 2), (w2) => tara(w2, 'Rakhi thak, Dad! | Wait there, Dad!', 2.4));
  },
};
