// Andhra's own life.
import { Entity, type World } from '../world';
import { DT, PHYS, TILE, type Phys } from '../constants';

/** Dad after a Telugu welcome: a full stomach, and a jump that won't get him far. */
export const FULL_PHYS: Phys = { ...PHYS, jumpVel: PHYS.jumpVel * 0.66, maxRun: PHYS.maxRun * 0.9 };

/**
 * The Telugu greeting is "Annam tinnava?", have you eaten?, and nobody takes no for an answer. An aunty on
 * her doorstep feeds anyone who walks past her door: Dad comes away with a round stomach, a burp, and a
 * jump that falls short for a few seconds, just as the barrage piers ask for a long one. Leap past her
 * plate (she can't feed a dad in the air), or let it settle before you jump.
 */
export class Aunty extends Entity {
  readonly x: number;
  readonly ground: number;
  readonly fullSec: number;
  fed = false;
  private fullUntil = -1;
  private passed = false;
  private chew = -1;

  constructor(o: { tx: number; groundTy: number; fullSec?: number }) {
    super();
    this.layer = 6;
    this.x = o.tx * TILE + 8;
    this.ground = o.groundTy * TILE;
    this.fullSec = o.fullSec ?? 7;
  }

  static place(w: World, o: ConstructorParameters<typeof Aunty>[0]): Aunty {
    return w.add(new Aunty(o));
  }

  get full() {
    return this.fullUntil >= 0;
  }

  update(w: World) {
    const p = w.player;
    w.flags.full = this.full ? 1 : 0;
    if (w.state !== 'play') return;
    if (!this.fed && !this.passed) {
      const near = Math.abs(p.cx - this.x) < 18;
      if (near && p.onGround) {
        this.fed = true;
        this.fullUntil = w.tick + Math.round(this.fullSec / DT);
        this.chew = w.tick;
        p.phys = FULL_PHYS;
        w.sfx('collect', this.x, this.ground - 20);
        w.say('Tinu, tinu! Baaga tinu! | Eat, eat! Eat well!', this.x, this.ground - 56, 1.6, 'npc');
        w.after(1.1, () => w.say('Kadupu nindindaa? | Is your tummy full?', this.x, this.ground - 56, 1.6, 'npc'));
      } else if (p.cx > this.x + 18) {
        // past her door without stopping: a dad in the air can't be fed
        this.passed = true;
        w.say('Ayyo, tinakunda vellipoyadu! | He left without eating!', this.x, this.ground - 56, 1.8, 'npc');
      }
    }
    if (this.full && w.tick >= this.fullUntil) {
      this.fullUntil = -1;
      p.phys = PHYS;
      w.sfx('snort', p.cx, p.y);
      w.say('Burrp!', p.cx, p.y - 14, 0.8, 'npc');
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x = this.x,
      g = this.ground;
    // her doorway: a lime-washed front with a red-oxide step
    ctx.fillStyle = '#EDE6D6';
    ctx.fillRect(x - 26, g - 44, 30, 44);
    ctx.fillStyle = '#5B3A29';
    ctx.fillRect(x - 20, g - 34, 14, 34);
    ctx.fillStyle = '#B5482E';
    ctx.fillRect(x - 28, g - 4, 34, 4);
    // the aunty: saree, a steel plate held out
    const leanOut = this.fed ? 0 : Math.sin(w.tick * 0.08) * 1.2;
    ctx.fillStyle = '#2E7D5B';
    ctx.beginPath();
    ctx.moveTo(x - 6, g);
    ctx.lineTo(x + 6, g);
    ctx.lineTo(x + 4, g - 20);
    ctx.lineTo(x - 4, g - 20);
    ctx.fill();
    ctx.fillStyle = '#E0B12E';
    ctx.fillRect(x - 4, g - 26, 8, 7);
    ctx.fillStyle = '#7A4E33';
    ctx.beginPath();
    ctx.arc(x, g - 30, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1E1A18';
    ctx.beginPath();
    ctx.arc(x - 1, g - 33, 3.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#C62828';
    ctx.fillRect(x - 0.6, g - 32, 1.2, 1.2);
    // the arm and the plate (empty once Dad has eaten)
    ctx.fillStyle = '#7A4E33';
    ctx.fillRect(x + 3, g - 22 + leanOut, 9, 2.2);
    ctx.fillStyle = '#C9CED6';
    ctx.beginPath();
    ctx.ellipse(x + 14, g - 22 + leanOut, 6, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (!this.fed) {
      ctx.fillStyle = '#C8892E';
      for (const [dx, dy] of [
        [-2, -1.5],
        [1.5, -1.8],
        [0, -3.4],
      ])
        ctx.beginPath(), ctx.arc(x + 14 + dx, g - 22 + leanOut + dy, 1.6, 0, Math.PI * 2), ctx.fill();
    }
    // Dad's full stomach
    if (this.full) {
      const p = w.player;
      const chewing = w.tick - this.chew < 50;
      ctx.fillStyle = '#4A72B8';
      ctx.beginPath();
      ctx.ellipse(p.cx + p.facing * 2.5, p.y + 9, 5.2, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      if (chewing) {
        ctx.fillStyle = '#C8892E';
        ctx.beginPath();
        ctx.arc(p.cx + p.facing * 4, p.y + 4, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}
