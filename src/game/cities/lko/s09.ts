// LKO-09 Kabootarbazi (rooftop pigeons). Over the old city, flyers on the rooftops send their flocks up and
// call them down with a flag on a bamboo pole. Red: the flock goes up and circles. White: it comes down, on
// to the roof right in front of you.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { lock, tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { Art, FLOOR, Zone, gent, px, TAU, type Ctx } from './kit';
import { tara } from './s02';

export type Roof = { x0: number; x1: number; top: number };
/** a flag schedule: [colour, seconds] pairs, repeating, started when Dad passes `from` */
export class Flyer {
  t0 = -1;
  constructor(
    readonly x: number,
    readonly feet: number,
    readonly plan: ['red' | 'white', number][],
    readonly from: number,
    /** true: you see the near side of the flag, and the birds go by the far side (the opposite colour) */
    readonly twoSided = false,
  ) {}
  period() {
    return this.plan.reduce((s, [, d]) => s + d, 0);
  }
  /** what the birds are told, and seconds left of it */
  order(w: World): { c: 'red' | 'white'; left: number } {
    if (this.t0 < 0) return { c: 'red', left: 99 };
    let t = ((w.tick - this.t0) / 120) % this.period();
    for (const [c, d] of this.plan) {
      if (t < d) return { c, left: d - t };
      t -= d;
    }
    return { c: 'red', left: 1 };
  }
  /** the colour Dad sees */
  seen(w: World) {
    const o = this.order(w).c;
    return this.twoSided ? (o === 'red' ? 'white' : 'red') : o;
  }
}

/** the flock: circles high on red; on white it comes down on to the roof just ahead of Dad */
export class Flock {
  x: number;
  y = 30;
  target: Roof | null = null;
  /** the roof they always come down to (the loft), whatever is ahead of you */
  always: Roof | null = null;
  z: Zone;
  constructor(
    w: World,
    readonly roofs: Roof[],
    readonly flyer: Flyer,
    readonly home: { x: number; y: number },
    cause = 'lko-kabootar',
  ) {
    this.x = home.x;
    this.z = w.add(new Zone(0, 0, 44, 16, cause));
    this.z.on = false;
    w.add(new Art((ctx, w2) => this.draw(ctx, w2), 5));
    w.onTick((w2) => this.tick(w2));
  }
  tick(w: World) {
    const p = w.player;
    const o = this.flyer.order(w).c;
    if (o === 'white') {
      if (!this.target) this.target = this.always ?? this.roofs.find((r) => r.x0 > p.x + p.w - 2) ?? null;
    } else this.target = null;
    let tx: number, ty: number;
    if (this.target) {
      tx = (this.target.x0 + this.target.x1) / 2;
      ty = this.target.top - 8;
    } else {
      const a = w.tick * 0.03;
      tx = this.home.x + Math.cos(a) * 40;
      ty = this.home.y + Math.sin(a) * 12;
    }
    const sp = 5;
    const dx = tx - this.x,
      dy = ty - this.y;
    const d = Math.hypot(dx, dy);
    if (d > sp) {
      this.x += (dx / d) * sp;
      this.y += (dy / d) * sp;
    } else {
      this.x = tx;
      this.y = ty;
    }
    this.z.x = this.x - 22;
    this.z.y = this.y - 8;
    this.z.on = !!this.target && d < 10;
  }
  draw(ctx: Ctx, w: World) {
    const landed = !!this.target && Math.hypot(this.x - (this.target.x0 + this.target.x1) / 2, this.y - (this.target.top - 8)) < 10;
    for (let i = 0; i < 9; i++) {
      const ox = ((i * 37) % 44) - 22,
        oy = ((i * 13) % 14) - 7;
      const flap = Math.sin(w.tick * 0.5 + i) * (landed ? 0.3 : 2.5);
      const x = this.x + ox,
        y = this.y + oy + (landed ? 4 : 0);
      ctx.fillStyle = i % 3 ? '#8E9AA6' : '#D7DCE0';
      ctx.beginPath();
      ctx.ellipse(x, y, 3.2, 2.2, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#5E6A75';
      ctx.beginPath();
      ctx.moveTo(x - 1, y);
      ctx.lineTo(x - 4, y - 2 - flap);
      ctx.lineTo(x + 1, y - 0.5);
      ctx.fill();
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(x + 2.6, y - 0.5, 1, 1);
    }
  }
}

/** the flyer on his roof with his bamboo pole and flag */
export function drawFlyer(w: World, f: Flyer) {
  w.add(
    new Art((ctx, w2) => {
      const seen = f.seen(w2);
      const back = seen === 'red' ? 'white' : 'red';
      const col = (c: string) => (c === 'red' ? '#C62828' : '#FAFAFA');
      gent(ctx, f.x, f.feet, 25, '#EDE6D8', { face: -1, arms: 1, skin: '#9C6B48' });
      ctx.fillStyle = '#C8A96B';
      ctx.fillRect(f.x - 9, f.feet - 64, 2, 52);
      const wave = Math.sin(w2.tick * 0.12) * 2;
      ctx.fillStyle = col(seen);
      ctx.beginPath();
      ctx.moveTo(f.x - 9, f.feet - 64);
      ctx.lineTo(f.x - 30, f.feet - 61 + wave);
      ctx.lineTo(f.x - 30, f.feet - 47 + wave);
      ctx.lineTo(f.x - 9, f.feet - 50);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      if (f.twoSided) {
        // the other face shows only where the cloth curls over at its tip
        ctx.fillStyle = col(back);
        ctx.beginPath();
        ctx.moveTo(f.x - 30, f.feet - 61 + wave);
        ctx.lineTo(f.x - 34, f.feet - 57 + wave);
        ctx.lineTo(f.x - 34, f.feet - 50 + wave);
        ctx.lineTo(f.x - 30, f.feet - 47 + wave);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }, 3),
  );
  w.onTick((w2) => {
    if (f.t0 < 0 && w2.player.cx > f.from) f.t0 = w2.tick;
  });
}

/** flat old-city roofs with low parapets, and the lane far below */
export function roofs(w: World, rs: Roof[], laneFrom: number, laneTo: number) {
  w.add(
    new Art((ctx) => {
      for (const r of rs) {
        ctx.fillStyle = '#D9C6A5';
        ctx.fillRect(r.x0, r.top, r.x1 - r.x0, FLOOR + 48 - r.top);
        ctx.fillStyle = '#C2AE8A';
        ctx.fillRect(r.x0, r.top, r.x1 - r.x0, 3);
        ctx.fillStyle = 'rgba(90,70,50,0.35)';
        for (let y = r.top + 16; y < FLOOR + 40; y += 22) for (let x = r.x0 + 4; x < r.x1 - 8; x += 18) ctx.fillRect(x, y, 6, 9);
      }
    }, -5),
  );
  return w.add(new Zone(laneFrom, FLOOR + 20, laneTo - laneFrom, 30, 'lko-chhat'));
}

const roofOf = (c0: number, c1: number, row: number): Roof => ({ x0: px(c0), x1: px(c1 + 1), top: px(row) });

// ================================================================ the room
function kabootarRoom(): LevelDef {
  return {
    id: 'LKO-09',
    city: 'LKO',
    index: 9,
    name: 'Kabootarbazi',
    nameEn: 'Rooftop pigeons',
    tagline: 'Over the old city the pigeon flyers send their flocks up from the rooftops and call them down with a flag. You are on the rooftops.',
    hint: 'Watch the flyer’s flag. Red: the flock goes up and circles. White: it comes down on to the roof just ahead of you, and anything landing there is knocked off. Cross from roof to roof only while the flag is red, and early in the red.',
    par: 20,
    map: Grid.ground(15)
      .pit(7, 31, 15)
      .fill(8, 11, 13, 17, '#')
      .fill(14, 17, 12, 17, '#')
      .fill(20, 23, 13, 17, '#')
      .fill(26, 31, 14, 17, '#')
      .put(1, 14, '@')
      .put(30, 13, 'E')
      .rows(),
    build(w: World) {
      door(w);
      const rs = [roofOf(8, 11, 13), roofOf(14, 17, 12), roofOf(20, 23, 13), roofOf(26, 31, 14)];
      roofs(w, rs, px(7), px(32));
      const f = new Flyer(px(29) + 8, px(14), [['red', 0.6], ['white', 1.7], ['red', 2.4]], px(4));
      drawFlyer(w, f);
      const fl = new Flock(w, rs, f, { x: px(20), y: px(4) });
      w.flags.kabootar = { f, fl };
      sign(w, 1.6, 10.4, 3.6, 'CHOWK', 'shop', null, 'kabootarbazi');
      rival(w, 3, 15, 1, tara(7));
      onPass(w, px(4), (w2) => w2.guide('Wah! | Wow!', () => false));
      collectible(w, 'lko-kulfi', 15.5, 9.4);
    },
  };
}

// ================================================================ the act: the flag in the wind
/** The flyer is behind you now, and his flag is two-sided: red one face, white the other. The birds ahead
 *  go by the face that's turned to them, the far face. What you see is the near face: the opposite. */
const hawa: Act = {
  id: 'lko09-hawa',
  w: 34,
  advice: 'Now the flyer is behind you, and his flag has two faces, red and white. The birds ahead go by the face turned towards them, the one you can’t see: the flag you see is the opposite of their order. Read the tip where the cloth curls over: that’s their colour. Cross while you see white.',
  cps: [9.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 0, x + 33, 15);
    g.fill(x + 0, x + 5, 14, 17, '#');
    g.fill(x + 7, x + 10, 13, 17, '#');
    g.fill(x + 13, x + 16, 12, 17, '#');
    g.fill(x + 19, x + 22, 13, 17, '#');
    g.fill(x + 25, x + 28, 12, 17, '#');
    g.fill(x + 31, x + 33, 14, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const rs = [roofOf(x + 7, x + 10, 13), roofOf(x + 13, x + 16, 12), roofOf(x + 19, x + 22, 13), roofOf(x + 25, x + 28, 12), roofOf(x + 31, x + 33, 14)];
    roofs(w, [roofOf(x, x + 5, 14), ...rs], c.X(0), c.X(34));
    const f = new Flyer(c.X(1) + 8, px(14), [['white', 1.6], ['red', 2.4]], c.X(2.5), true);
    drawFlyer(w, f);
    const fl = new Flock(w, rs, f, { x: c.X(22), y: px(4) });
    w.flags[c.f('k')] = { f, fl };
  },
};

// ================================================================ the door: the loft
/** The door is the pigeon loft's. While the flock is home it's shut (full of birds); on red they burst out
 *  through it to circle; on white they all come home through it, and through whoever is in the doorway. */
export const chhatri: Ending = {
  space: 12,
  advice: 'The door is the pigeon loft’s. On white the flock comes home, in through the door; on red they burst out and the door stands open. Wait back on the roof, and go in early in the red, before the next white brings them home.',
  paint: (g, D) => {
    g.pit(D - 12, D + 4, 15);
    g.fill(D - 12, D - 7, 14, 17, '#');
    g.fill(D - 4, D + 4, 14, 17, '#');
    g.put(D, 13, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const L = lock(w, d, 'Intezaar kis baat ka? | Waiting for what?');
    roofs(w, [roofOf(D - 12, D - 7, 14), roofOf(D - 4, D + 4, 14)], px(D - 12), px(D + 5));
    const f = new Flyer(px(D + 3) + 8, px(14), [['white', 1.4], ['red', 2.6]], px(D - 11));
    drawFlyer(w, f);
    const loft: Roof = { x0: d.x - 8, x1: d.x + 24, top: px(14) };
    const fl = new Flock(w, [loft], f, { x: px(D - 2), y: px(5) });
    // the flock always comes home to the loft (whatever is ahead of you)
    fl.always = loft;
    w.flags.chhatri = { f, fl };
    w.flags.twist = 'home';
    w.onTick((w2) => {
      const o = f.order(w2).c;
      if (f.t0 >= 0) w2.flags.twist = o;
      if (o === 'red' && f.t0 >= 0) L.unlock();
    });
    w.add(
      new Art((ctx) => {
        // the loft: a wooden cage-house on the roof with the door in it
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(d.x - 14, px(14) - 50, 44, 50);
        ctx.fillStyle = '#6D4C41';
        for (let x = d.x - 12; x < d.x + 30; x += 6) ctx.fillRect(x, px(14) - 48, 1.5, 46);
        ctx.fillStyle = '#5D4037';
        ctx.beginPath();
        ctx.moveTo(d.x - 18, px(14) - 50);
        ctx.lineTo(d.x + 8, px(14) - 66);
        ctx.lineTo(d.x + 34, px(14) - 50);
        ctx.fill();
      }, -3),
    );
    w.when(
      (w2) => w2.player.cx > px(D - 11),
      (w2) => taraNow(w2, 'Pehle aap? Accha, pehle aap. | After you? Fine, after you.', 2.2),
    );
  },
};

export const s09 = { room: kabootarRoom, acts: [hawa] };
export const meta09 = { family: 'flag-colour-steers-flock', betrayals: ['flag-signal'], ending: 'lko-chhatri' } as StageMeta;
