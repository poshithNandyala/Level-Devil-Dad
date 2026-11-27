// DIS-05: the gamosa welcome. Every giver host who touches Dad puts a gamosa round him; with three on he cannot see his feet
// (cloth fills the screen under him). A taker host accepts one when Dad walks into him. All of it is by contact, never by waiting.
import { Entity, type World } from '../../world';
import { overlapXYWH } from '../../constants';
import { person } from '../../levels/endkit';
import { Danger, GROUND, px } from './entities';

export interface GamState {
  /** gamosas on Dad */
  n: number;
}
export const gam = (w: World): GamState => (w.flags.gam ??= { n: 0 });
export const BLIND_AT = 3;

/** a host: a giver puts a gamosa on Dad as he touches him, a taker accepts one. Once each. */
export class Host extends Entity {
  done = false;
  /** ticks since contact (for the little bow) */
  t = -1;
  constructor(
    readonly x: number,
    readonly feet: number,
    readonly kind: 'give' | 'take',
  ) {
    super();
    this.layer = 2;
  }
  box() {
    return { x: this.x - 8, y: this.feet - 26, w: 16, h: 26 };
  }
  update(w: World) {
    if (this.t >= 0) this.t++;
    if (this.done || w.state !== 'play') return;
    const p = w.player;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, this.box())) return;
    const g = gam(w);
    if (this.kind === 'give') {
      this.done = true;
      this.t = 0;
      g.n = Math.min(4, g.n + 1);
      w.sfx('ding', this.x, this.feet - 20);
      w.say('Adorani! | Welcome!', this.x, this.feet - 34, 1.6, 'npc');
    } else if (g.n > 0) {
      this.done = true;
      this.t = 0;
      g.n--;
      w.sfx('ding', this.x, this.feet - 20);
      w.say('Dhonyobad! | Thank you!', this.x, this.feet - 34, 1.6, 'npc');
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const give = this.kind === 'give';
    person(ctx, this.x, this.feet - 26, 26, give ? '#F2EAD3' : '#B3261E', '#B9855A', { cap: give ? undefined : '#FDF0D5', arms: give && !this.done ? 5 : 2 });
    if (give && !this.done) {
      // the gamosa held out over both hands
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(this.x - 8, this.feet - 25, 16, 4);
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(this.x - 8, this.feet - 25, 16, 1.2);
      ctx.fillRect(this.x - 8, this.feet - 22.2, 16, 1.2);
    }
    if (!give) {
      // a taker: a red sash and open hands
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(this.x - 6, this.feet - 17, 12, 2);
    }
  }
}

/** the scarves on Dad, one band each, and the cloth over his feet at three */
export class Cloth extends Entity {
  constructor() {
    super();
    this.layer = 5;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const n = gam(w).n;
    if (n <= 0 || w.state === 'won') return;
    const p = w.player;
    // bands round his chest, white and red
    for (let i = 0; i < Math.min(n, 3); i++) {
      const y = p.y + 3 + i * 3;
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(p.x - 1, y, p.w + 2, 3);
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(p.x - 1, y, p.w + 2, 1);
      ctx.fillRect(p.x - 1, y + 2, p.w + 2, 0.6);
    }
    if (n >= BLIND_AT) {
      // the cloth hangs down over everything below his waist: he cannot see his feet or the floor round them
      const x0 = p.cx - 90;
      const x1 = p.cx + 90;
      const y0 = p.y + 9;
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(x0, y0, x1 - x0, 300 - y0);
      ctx.fillStyle = '#C1121F';
      for (let y = y0; y < 300; y += 18) {
        ctx.fillRect(x0, y, x1 - x0, 3);
        ctx.fillRect(x0, y + 6, x1 - x0, 1);
      }
      ctx.fillStyle = '#E4D3A6';
      for (let x = x0 + 6; x < x1; x += 14) ctx.fillRect(x, y0 + 4, 4, 4);
      // fade the edges so the cloth reads as a hanging, not a box
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'rgba(253,240,213,1)');
      g.addColorStop(0.1, 'rgba(253,240,213,0)');
      g.addColorStop(0.9, 'rgba(253,240,213,0)');
      g.addColorStop(1, 'rgba(253,240,213,1)');
    }
  }
}

/** a pit with a deadly floor: the cause tells you what you did */
export function pitDanger(w: World, c0: number, c1: number) {
  const d = w.add(new Danger({ x: px(c0), y: GROUND + 8, w: px(c1 - c0 + 1), h: 80 }, 'dis-gamosa')) as Danger;
  // fix round 2 (QA B1): blind under three gamosas, or walking into a pit you could see; fix round 4 (QA B2): and a hop
  // that came down in it is its own line, as at 04's fallen well
  let hopping = false;
  w.onTick((w2) => {
    const p = w2.player;
    if (p.onGround) hopping = false;
    else if (p.vy < 0) hopping = true;
    d.hazard.cause = gam(w2).n >= BLIND_AT ? 'dis-gamosa' : hopping ? 'dis-gamosa-hop' : 'dis-gamosa-gat';
  });
  return d;
}

/** a bamboo machan (raised stage) drawn over one-way tiles c0..c1 on row `row`, with its legs */
export function machan(w: World, c0: number, c1: number, row = 13) {
  w.add(
    new (class extends Entity {
      constructor() {
        super();
        this.layer = -1;
      }
      draw(ctx: CanvasRenderingContext2D) {
        const x0 = px(c0);
        const x1 = px(c1 + 1);
        const y = px(row);
        ctx.fillStyle = '#B8A04A';
        ctx.fillRect(x0, y, x1 - x0, 4);
        ctx.fillStyle = '#8D6B2E';
        ctx.fillRect(x0, y + 4, x1 - x0, 1.5);
        for (const x of [x0 + 2, x1 - 5]) ctx.fillRect(x, y + 4, 3, GROUND - y - 4);
        ctx.strokeStyle = '#8D6B2E';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0 + 3, GROUND);
        ctx.lineTo(x1 - 4, y + 6);
        ctx.stroke();
      }
    })(),
  );
}
