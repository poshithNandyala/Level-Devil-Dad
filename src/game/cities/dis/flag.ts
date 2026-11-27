// DIS round 5, allocation v3 F455 marker-moves-floor-stays (B20): the Majuli ghat's long gangplank and the ghat man's red
// landing flag. As the Brahmaputra rises he moves the flag twice: first along the plank to its far end (he stays there,
// holding out a gamosa for the guests), then out over the water, toward the bank, on the end of its long bamboo. The plank
// does not move. Land where the plank goes on to: hop over the ghat man (a giver: you need not take it) and run-jump from
// the plank's end right across to the bank. Hop to the flag and you are in the river; go to where the flag WAS and the ghat
// man puts a third gamosa on you, and with three you cannot see the end of the plank.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { overlapXYWH } from '../../constants';
import { person, tara } from '../../levels/endkit';
import type { Act } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { GROUND, River, px } from './entities';
import { BLIND_AT, Cloth, Host, gam } from './gamosa';

/** the ghat man and his flag: t counts ticks since Dad came down to the ghat */
export class GhatMan extends Entity {
  t = -1;
  x: number;
  flagX: number;
  gave = false;
  /** water over the plank (px above GROUND + 6), for the drawing */
  rise = 0;
  constructor(
    readonly p: number,
    readonly f1: number,
    readonly f2: number,
  ) {
    super();
    this.layer = 3;
    this.x = p;
    this.flagX = p;
  }
  update(w: World) {
    if (this.t < 0 || w.state !== 'play') return;
    this.t++;
    const s = this.t / 120;
    // first rise: he walks the flag along the plank to its far end
    if (s > 0.3) this.rise = Math.min(4, this.rise + 0.1);
    if (s > 0.4 && this.x < this.f1) this.x = Math.min(this.f1, this.x + 1.2);
    if (s < 1.6) this.flagX = this.x;
    // second rise: he leans the flag out over the water on its bamboo
    if (s > 1.4) this.rise = Math.min(7, this.rise + 0.1);
    if (s >= 1.6 && this.flagX < this.f2) this.flagX = Math.min(this.f2, this.flagX + 1.6);
    if (this.gave) return;
    const p = w.player;
    if (!overlapXYWH(p.x, p.y, p.w, p.h, { x: this.x - 6, y: GROUND - 22, w: 12, h: 22 })) return;
    this.gave = true;
    const g = gam(w);
    g.n = Math.min(4, g.n + 1);
    w.sfx('ding', this.x, GROUND - 20);
    w.say('Adorani, Majulit! | Welcome to Majuli!', this.x, GROUND - 34, 1.6, 'npc');
  }
  draw(ctx: CanvasRenderingContext2D) {
    person(ctx, this.x, GROUND - 26, 26, '#F2EAD3', '#7A5A3A', { arms: this.gave ? 2 : 5 });
    if (!this.gave) {
      ctx.fillStyle = '#FDF0D5';
      ctx.fillRect(this.x - 8, GROUND - 25, 16, 4);
      ctx.fillStyle = '#C1121F';
      ctx.fillRect(this.x - 8, GROUND - 25, 16, 1.2);
    }
    // the flag on its bamboo, from his hands to wherever it stands now
    const top = GROUND - 44;
    ctx.strokeStyle = '#8D6B2E';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x + 4, GROUND - 14);
    ctx.lineTo(this.flagX, top);
    ctx.stroke();
    ctx.fillStyle = '#D62828';
    ctx.fillRect(this.flagX, top, 10, 7);
  }
}

/** DIS-06 act: the ghat man's flag (F455). */
export const majuliFlag: Act = {
  id: 'dis06-flag',
  w: 31,
  advice: 'At the Majuli ghat the ghat man moves his red landing flag as the river rises: first along the gangplank to its far end, where he stands holding out a gamosa, then out over the water on its long bamboo. The plank stays where it is. Hop over the ghat man (you don’t have to take his gamosa) and run-jump from the end of the plank right across to the bank. Not to the flag, and not to where it was.',
  cps: [1.5],
  paint: (g, c) => {
    g.pit(c.x + 14, c.x + 24);
  },
  build: (w, c) => {
    const x = c.x;
    if (!w.entities.some((e) => e instanceof Cloth)) w.add(new Cloth());
    onPass(w, px(x + 0.5), (w2) => (gam(w2).n = 0));
    // the welcome on the ghat steps: two on, the third would blind you
    for (const k of [5, 7]) w.add(new Host(px(x + k) + 8, GROUND, 'give'));
    const water = new River(px(x + 14), px(x + 25), GROUND + 10, 'dis-flag-luit');
    w.add(water);
    w.onTick((w2) => (water.hazard.cause = gam(w2).n >= BLIND_AT ? 'dis-ghat-gamosa' : 'dis-flag-luit'));
    // the gangplank over the water: it does not move
    w.solids.push(new Solid(px(x + 15), GROUND, px(7.5), 6));
    const man = new GhatMan(px(x + 16), px(x + 19) + 8, px(x + 23.5));
    w.add(man);
    w.add(
      new (class extends Entity {
        constructor() {
          super();
          this.layer = 4;
        }
        draw(ctx: CanvasRenderingContext2D) {
          // the plank, and the risen water lapping over it
          ctx.fillStyle = '#9C7A45';
          ctx.fillRect(px(x + 15), GROUND, px(7.5), 4);
          ctx.fillStyle = 'rgba(126,143,138,0.55)';
          ctx.fillRect(px(x + 14), GROUND + 6 - man.rise, px(11), man.rise);
        }
      })(),
    );
    onPass(w, px(x + 1), () => (man.t = 0));
    for (const k of [27, 29]) w.add(new Host(px(x + k) + 8, GROUND, 'take'));
    onPass(w, px(x + 10), (w2) => tara(w2, 'Flag-tu tat, Dad! | The flag’s over there, Dad!', 2.2));
  },
};
