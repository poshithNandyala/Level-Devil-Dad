// Thiruvananthapuram's door endings.
import { lock, npc, FLOOR } from '../../levels/endkit';
import type { Ending } from '../../levels/endkit';
import { Entity, type Hazard, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';
import { Backwash } from './kovalam';
import { Dhara, Droni } from './dhara';

export type TvmEndingKind = 'tvm-knock' | 'tvm-backwash-ride' | 'tvm-oily-feet-coir-mat';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<TvmEndingKind, true> {}
}

/** TVM-10's door: a coir mat over the gutter wipes oily feet; oily feet slip off the polished doorstep */
class Doorstep extends Entity {
  readonly mat0: number;
  readonly mat1: number;
  readonly step0: number;
  readonly step1: number;
  solid: Solid;
  oily = false;
  constructor(mat0: number, mat1: number, step0: number, step1: number) {
    super();
    this.layer = 3;
    this.mat0 = mat0;
    this.mat1 = mat1;
    this.step0 = step0;
    this.step1 = step1;
    // the mat lies over the gutter: it holds
    this.solid = new Solid(mat0, FLOOR, mat1 - mat0, 4);
  }
  update(w: World) {
    const p = w.player;
    if ((w.flags.slipped ?? 0) > (w.flags.slippedSeen ?? 0)) {
      w.flags.slippedSeen = w.flags.slipped;
      if (p.cx > this.mat0 - 12 * TILE) this.oily = true;
    }
    if (p.onGround && w.standing(this.solid) && this.oily) {
      this.oily = false;
      npc(w, 'Kaal thudachu, nannaayi. | Feet wiped, good.', (this.mat0 + this.mat1) / 2, FLOOR - 24, 1.2);
    }
    // oily feet on the polished step: they go, and back down he slides
    if (this.oily && p.onGround && Math.abs(p.y + p.h - (FLOOR - TILE)) < 1 && p.cx > this.step0 && p.cx < this.step1 && p.stun <= 0) {
      p.vx = -190;
      p.stun = 40;
      w.sfx('slide', p.cx, FLOOR - TILE);
    }
    w.flags.twist = this.oily ? 'oily' : 'dry';
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the coir mat: brown, bristly
    ctx.fillStyle = '#A0703A';
    ctx.fillRect(this.mat0, FLOOR - 1, this.mat1 - this.mat0, 4);
    ctx.fillStyle = '#7B5226';
    for (let x = this.mat0 + 1; x < this.mat1 - 1; x += 3) ctx.fillRect(x, FLOOR - 2, 1, 2);
    // the polished granite step shines
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(this.step0, FLOOR - TILE, this.step1 - this.step0, 1.5);
    if (this.oily) {
      // oily footprints follow him
      ctx.fillStyle = 'rgba(230,180,60,0.7)';
      const p = w.player;
      ctx.fillRect(p.cx - 3, p.y + p.h - 1, 2, 1);
      ctx.fillRect(p.cx + 1, p.y + p.h - 1, 2, 1);
    }
  }
}

export const endings: Record<TvmEndingKind, Ending> = {
  // ================================================================ Thiruvananthapuram
  /** The door is locked. Knock: jump into it, three times, and Ammachi opens up. */
  'tvm-knock': {
    advice: 'The last door is locked: knock. Jump into it three times.',
    build(w, d) {
      const L = lock(w, d, 'Aara? Aarum illa! | Who is it? Nobody home!');
      let n = 0,
        last = -999;
      w.flags.twist = 'shut';
      w.flags.knocks = 0;
      w.onTick((w2) => {
        if (L.open || n >= 3) return;
        const p = w2.player;
        if (w2.tick - p.jumpTick !== 1 || w2.tick - last < 16) return;
        if (!(p.x + p.w > d.x + 1 && p.x < d.x + 15 && p.y + p.h > d.y + 10)) return;
        last = w2.tick;
        n++;
        w2.flags.knocks = n;
        w2.sfx('thud', d.x + 8, d.y + 16);
        w2.emit('shake', d.x + 8, d.y, { amount: 1 });
        npc(w2, ['Thak! | Knock!', 'Thak thak! | Knock knock!', 'Aara? Oh, Dad! Vaa, vaa! | Who is it? Oh, Dad! Come in!'][n - 1], d.x + 8, d.y - 6, 1.3);
        if (n >= 3) w2.after(0.45, () => L.unlock());
      });
    },
  },
  /** TVM-09: the door is out past a long stretch of open sand with no flags, too long to cross between two
   *  waves. Wait on the rocks for a wave to run in, and step into it as it runs back out: the backwash carries
   *  you to the door. Wait for the sand to dry and the next wave takes you half way. */
  'tvm-backwash-ride': {
    space: 31,
    advice: 'The last stretch of sand has no flags and is too long to cross between two waves. Wait on the rocks for a wave, and step off the moment it starts running back out: the backwash carries you to the door. Wait for the sand to dry and the next one catches you.',
    paint: (g, D) => {
      g.fill(D - 31, D - 28, 14, 14, '#');
    },
    build(w, d) {
      const D = Math.round(d.x / TILE);
      const b = w.add(new Backwash(D - 27, D + 1, D - 29.5));
      w.flags.twist = 'rocks';
      w.onTick(() => {
        w.flags.twist = b.phase();
      });
      w.when(
        (w2) => w2.player.cx >= (D - 29.5) * TILE,
        (w2) => npc(w2, 'Thira povumbol pokuka! | Go as the wave goes!', (D - 26) * TILE, FLOOR - 30, 1.6),
      );
    },
  },
  /** TVM-10: the last pot's oil is all over the floor before the door. The polished doorstep throws oily feet
   *  back off it, into the gutter. The coir mat over the gutter looks like a trap to jump: walk on it, it wipes
   *  your feet. */
  'tvm-oily-feet-coir-mat': {
    space: 16,
    advice: 'Oil all over the floor before the door, and the doorstep is polished granite: oily feet slip straight back off it, into the gutter. The coir mat over the first gutter holds: walk across it, don’t jump it, and it wipes your feet. Then hop the second gutter up on to the step.',
    paint: (g, D) => {
      g.pit(D - 9, D - 8).pit(D - 3, D - 2);
      g.fill(D - 1, D + 4, 14, 14, '#');
      g.put(D, 14, '#');
      g.put(D, 13, 'E');
    },
    build(w, d) {
      const D = Math.round(d.x / TILE);
      w.add(new Dhara({ hookTx: D - 12, offTx: -2, slick: [D - 15, D - 13], ty: 8 }));
      w.add(new Doorstep((D - 9.3) * TILE, (D - 6.7) * TILE, (D - 1) * TILE, (D + 2) * TILE));
      w.add(new Droni(D - 3, D - 1, 'tvm-chaal'));
      w.flags.twist = 'dry';
    },
  },
};

void DT;
void ({} as Hazard);
