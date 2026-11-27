// DIS round 5, allocation v3 F447 false-cue-among-true (B5): the Umananda bhutbhuti ferry passes the chars and blows its
// horn, which sounds just like the level siren but moves no bar. Land on the long bar and its far end goes on 02's own
// landing clock (a bar you land on narrows, its left end stays): walk back along it. The ferry's horn comes first: the
// level post does not move, so stay. The real siren comes after, the post turns, and the next bar comes up: hop then.
import { Entity, type World } from '../../world';
import type { Act } from '../../levels/acts';
import { tara } from '../../levels/endkit';
import { GROUND, River, levelPost, px, sand } from './entities';

/** seconds after Dad first stands on the long bar */
export const HORN_AT = 1.0;
export const SIREN_AT = 2.6;

/** the ferry going by behind the chars; it blows its horn once, `at` s after `t` starts */
export class Bhutbhuti extends Entity {
  t = -1;
  blew = false;
  constructor(
    readonly x0: number,
    readonly at: number,
  ) {
    super();
    this.layer = -2;
  }
  update(w: World) {
    if (this.t < 0 || w.state !== 'play') return;
    this.t++;
    if (!this.blew && this.t >= this.at * 120) {
      this.blew = true;
      w.sfx('siren', this.x, GROUND - 60);
      w.say('Bhooooo!', this.x, GROUND - 70, 1.4, 'npc');
    }
  }
  get x() {
    return this.x0 + Math.max(0, this.t) * 0.35;
  }
  draw(ctx: CanvasRenderingContext2D) {
    // a small wooden motor ferry on the far channel, its blue cabin and the smoke stack
    const x = this.x;
    const y = GROUND - 30;
    ctx.fillStyle = '#5B3A1E';
    ctx.fillRect(x - 22, y + 6, 44, 6);
    ctx.fillStyle = '#2F6690';
    ctx.fillRect(x - 14, y - 4, 24, 10);
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 12, y - 10, 3, 10);
    if (this.blew && this.t < (this.at + 1.2) * 120) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillRect(x + 11, y - 16 - ((this.t / 6) % 6), 5, 4);
    }
  }
}

/** DIS-02 act: the ferry's horn among the sirens (F447). */
export const charHorn: Act = {
  id: 'dis02-bhutbhuti',
  w: 24,
  advice: 'Land on the long bar and walk back along it: a bar you land on narrows, and its left end stays. The bhutbhuti ferry going to Umananda blows its horn first. It sounds just like the siren, but the level post does not move: no bar is coming, so stay where you are. When the real siren goes, the post turns and the next bar comes up: hop on to it then.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    // under the long bar's far end, the water it narrows away from; beyond it the river proper
    w.add(new River(px(x + 2), px(x + 12), GROUND + 10, 'dis-char-sink'));
    w.add(new River(px(x + 12), px(x + 20)));
    const long = sand(w, [[[x + 3, x + 12], [x + 3, x + 8]]], []);
    const next = sand(w, [[null, [x + 11, x + 18]]], []);
    levelPost(w, next, x + 0.6, 2);
    w.flags.hornNext = next;
    const ferry = new Bhutbhuti(px(x + 4), HORN_AT);
    w.add(ferry);
    let t0 = -1;
    w.onTick((w2) => {
      const p = w2.player;
      if (t0 < 0 && p.onGround && w2.standing(long.bars[0].slab.solid)) {
        t0 = w2.tick;
        long.go(w2, true);
        ferry.t = 0;
      }
      if (t0 >= 0 && w2.tick - t0 === Math.round(SIREN_AT * 120)) next.go(w2);
    });
    let said = false;
    w.onTick((w2) => {
      if (!said && ferry.blew) {
        said = true;
        tara(w2, 'Siren bajil, Dad! | That’s the siren, Dad!', 2.2);
      }
    });
  },
};
