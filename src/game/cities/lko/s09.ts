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
import { Art, Block, FLOOR, Zone, gent, px, TAU, type Ctx } from './kit';
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
  /** land on the near end of a wide roof (where you land from the roof before), not its middle */
  near = false;
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
      tx = this.spot(this.target);
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
  spot(r: Roof) {
    return this.near ? Math.min(r.x0 + 32, (r.x0 + r.x1) / 2) : (r.x0 + r.x1) / 2;
  }
  draw(ctx: Ctx, w: World) {
    const landed = !!this.target && Math.hypot(this.x - this.spot(this.target), this.y - (this.target.top - 8)) < 10;
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
export function drawFlyer(w: World, f: Flyer, show?: (w: World) => boolean) {
  w.add(
    new Art((ctx, w2) => {
      if (show && !show(w2)) return;
      // the two-faced flag swings round in the wind every 1.5 s and for a moment shows its far face whole
      const swing = f.twoSided && w2.tick % 180 > 140;
      const seen = swing ? (f.seen(w2) === 'red' ? 'white' : 'red') : f.seen(w2);
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
        // the other face shows where the cloth curls over at its tip: a big curl, and the whole far face
        // when the wind swings it round
        ctx.fillStyle = col(back);
        ctx.beginPath();
        ctx.moveTo(f.x - 30, f.feet - 61 + wave);
        ctx.lineTo(f.x - 38, f.feet - 56 + wave);
        ctx.lineTo(f.x - 38, f.feet - 49 + wave);
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

export const roofOf = (c0: number, c1: number, row: number): Roof => ({ x0: px(c0), x1: px(c1 + 1), top: px(row) });
/** a row of roofs two tiles apart, from column `start`: [column, row, width]. The low roofs (row 13), where a
 *  hop from a higher roof lands long, are seven wide, so wherever a late landing puts you there is room to
 *  stand, run or hop before the edge; the others are four. */
export const lay = (start: number, rows: number[]): [number, number, number][] => {
  let a = start;
  return rows.map((r) => {
    const wd = r === 13 ? 7 : 4;
    const out: [number, number, number] = [a, r, wd];
    a += wd + 2;
    return out;
  });
};
/** the column two tiles past the last roof of a row */
export const after = (L: [number, number, number][]) => L[L.length - 1][0] + L[L.length - 1][2] + 2;

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
      .fill(8, 14, 13, 17, '#')
      .fill(17, 20, 12, 17, '#')
      .fill(23, 29, 13, 17, '#')
      .fill(30, 31, 14, 17, '#')
      .put(1, 14, '@')
      .put(30, 13, 'E')
      .rows(),
    build(w: World) {
      door(w);
      const rs = [roofOf(8, 14, 13), roofOf(17, 20, 12), roofOf(23, 29, 13), roofOf(30, 31, 14)];
      roofs(w, rs, px(7), px(32));
      const f = new Flyer(px(29) + 8, px(13), [['red', 0.6], ['white', 1.7], ['red', 2.4]], px(4));
      drawFlyer(w, f);
      const fl = new Flock(w, rs, f, { x: px(20), y: px(4) });
      fl.near = true;
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
export const HAWA = lay(7, [13, 12, 13, 12]);
/** the flyer who walks round in front of you for the last crossing: then the face you see is the birds' too */
class Round extends Flyer {
  front = false;
  seen(w: World) {
    return this.front ? this.order(w).c : super.seen(w);
  }
}
const HAWA_END = after(HAWA);
export const hawa: Act = {
  id: 'lko09-hawa',
  w: HAWA_END + 3,
  advice: 'Now the flyer is behind you, and his flag has two faces, red and white. The birds ahead go by the face turned towards them, the one you can’t see: the flag you see is the opposite of their order. Cross while you see white. For the last roof he walks round in front of you: now you and the birds see the same face, so cross on red again.',
  cps: HAWA.map(([a]) => a + 0.2),
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 0, x + HAWA_END + 2, 15);
    g.fill(x + 0, x + 5, 14, 17, '#');
    HAWA.forEach(([a, r, wd]) => g.fill(x + a, x + a + wd - 1, r, 17, '#'));
    g.fill(x + HAWA_END, x + HAWA_END + 2, 14, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const rs = [...HAWA.map(([a, r, wd]) => roofOf(x + a, x + a + wd - 1, r)), roofOf(x + HAWA_END, x + HAWA_END + 2, 14)];
    roofs(w, [roofOf(x, x + 5, 14), ...rs], c.X(0), c.X(HAWA_END + 3));
    const f = new Round(c.X(1) + 8, px(14), [['white', 1.6], ['red', 2.4]], c.X(2.5), true);
    // the same man, the same flag, seen from in front once he has come round on to the end roof
    const ahead = new Flyer(c.X(HAWA_END + 1) + 8, px(14), f.plan, f.from, false);
    drawFlyer(w, f, () => !f.front);
    drawFlyer(w, ahead, () => f.front);
    const fl = new Flock(w, rs, f, { x: c.X(HAWA_END / 2), y: px(4) }, 'lko-hawa');
    fl.near = true;
    w.onTick((w2) => {
      ahead.t0 = f.t0;
      if (!f.front && w2.player.onGround && w2.player.cx > c.X(HAWA[2][0])) f.front = true;
      fl.z.hazard.cause = f.front ? 'lko-hawa-ulta' : 'lko-hawa';
    });
    w.flags[c.f('k')] = { f, fl };
  },
};

// ================================================================ act: two flags
/** Two flyers, one on the roof behind you and one on the roof far ahead, and only one flock. It obeys the
 *  flag nearer to you (it circles over that flyer's roof): the one behind for the first half of the way,
 *  the one ahead once you're past the middle. Both flags are plain, one face. */
class Nearer extends Flyer {
  constructor(
    readonly a: Flyer,
    readonly b: Flyer,
  ) {
    super(a.x, a.feet, a.plan, a.from);
  }
  near(w: World) {
    const c = w.player.cx;
    return Math.abs(c - this.a.x) <= Math.abs(c - this.b.x) ? this.a : this.b;
  }
  order(w: World) {
    return this.near(w).order(w);
  }
}
export const JHANDE = lay(6, [13, 12, 13, 12, 13]);
const JHANDE_END = after(JHANDE);
export const jhande: Act = {
  id: 'lko09-jhande',
  w: JHANDE_END + 10,
  advice: 'Two flyers now, one behind you and one far ahead, and one flock. It obeys the flag nearer to you (watch where it circles): the one behind you for the first half of the way, the one ahead once you’re over the middle of the middle roof. Cross on the nearer flag’s red.',
  cps: JHANDE.map(([a]) => a + 0.2),
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + JHANDE_END + 9, 15);
    g.fill(x, x + 4, 14, 17, '#');
    JHANDE.forEach(([a, r, wd]) => g.fill(x + a, x + a + wd - 1, r, 17, '#'));
    g.fill(x + JHANDE_END, x + JHANDE_END + 9, 14, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const rs = JHANDE.map(([a, r, wd]) => roofOf(x + a, x + a + wd - 1, r));
    roofs(w, [roofOf(x, x + 4, 14), ...rs, roofOf(x + JHANDE_END, x + JHANDE_END + 9, 14)], c.X(0), c.X(JHANDE_END + 10));
    const a = new Flyer(c.X(1) + 8, px(14), [['red', 1.8], ['white', 1.8]], c.X(1.5));
    const b = new Flyer(c.X(JHANDE_END + 1) + 8, px(14), [['white', 1.8], ['red', 1.8]], c.X(1.5));
    drawFlyer(w, a);
    drawFlyer(w, b);
    const f = new Nearer(a, b);
    const home = { x: a.x, y: px(4) };
    const fl = new Flock(w, rs, f, home, 'lko-jhanda-peeche');
    fl.near = true;
    w.flags[c.f('k')] = { f, fl, a, b };
    w.onTick((w2) => {
      const n = f.near(w2);
      // the flock circles over the flyer it obeys; its death names which flag it was
      home.x = n === a ? a.x + 40 : b.x - 40;
      fl.z.hazard.cause = n === a ? 'lko-jhanda-peeche' : 'lko-jhanda-aage';
    });
    sign(w, x + 0.2, 9.4, 3.4, 'DO JHANDE', 'shop', null, 'paas waala');
  },
};

// ================================================================ the door: the loft

// ================================================================ act 2: the white domes (a Chota Imambara-style garden tank)
/** From the rooftops a row of white domed kiosks stands in the long garden pool. A dome seems bigger the
 *  farther you stand from it, and so does its terrace: from far away the terrace is high above your jump;
 *  walk up to it and it shrinks into the water. Only from the paving line (the inlaid strip) is it your size.
 *  The dome keeps the size it had when you left the ground. */
const GUMBAD = [5, 13, 21];
export const gumbad: Act = {
  id: 'lko09-gumbad',
  w: 30,
  advice: 'A dome seems bigger the farther you stand from it, and its terrace with it: from far away the terrace is far above your jump, and walk right up and it shrinks into the pool. Stand on the inlaid paving line in front of each dome and jump from there: it keeps the size it had when you left the ground. The last one is the reflection in the tank, and works the other way round: it sinks as you step back. Its line is right at the edge.',
  paint: (g, c) => {
    for (const d of GUMBAD) g.pit(c.x + d, c.x + d + 4);
  },
  build: (w, c) => {
    const x = c.x;
    const domes = GUMBAD.map((d, k) => {
      const aks = k === GUMBAD.length - 1;
      const x0 = c.X(d + 1),
        line = aks ? x0 - 21 : x0 - 38;
      const S = { y: FLOOR - 24, line };
      const b = w.add(
        new Block(x0, S.y, 48, 6, (ctx, bb) => {
          // the marble terrace and its dome, drawn at the size it seems from where you stand
          const k2 = Math.max(0.35, Math.min(1.8, (FLOOR - bb.y) / 24));
          ctx.fillStyle = '#F7F4EE';
          ctx.fillRect(bb.x, bb.y, 48, 6);
          ctx.beginPath();
          ctx.ellipse(bb.x + 24, bb.y, 14 * k2, 14 * k2, 0, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#E3DCCF';
          ctx.fillRect(bb.x + 23, bb.y - 16 * k2, 2, 4 * k2);
          for (const mx of [3, 43]) ctx.fillRect(bb.x + mx, bb.y - 10 * k2, 2, 10 * k2);
        }, 2),
      );
      w.onTick((w2) => {
        const p = w2.player;
        if (!p.onGround || p.isRiding(b.solid)) return;
        // the size it seems from where you stand (only while you're on the ground)
        const d = x0 - (p.x + p.w);
        if (d < -4 || d > 140) return;
        let y = FLOOR - 24;
        if (aks) {
          // the reflection: it shrinks into the tank as you step back from it
          if (d > 26) y = FLOOR - 24 + (d - 26) * 3;
        } else if (d > 46) y = FLOOR - 24 - (d - 46) * 1.1;
        else if (d < 22) y = FLOOR - 24 + (22 - d) * 3;
        b.set(y < FLOOR + 4);
        b.solid.y = Math.round(y);
      });
      w.add(
        new Art((ctx) => {
          // the paving line, an inlaid strip of red sandstone
          ctx.fillStyle = '#B5562E';
          ctx.fillRect(line - 3, FLOOR - 1, 12, 3);
        }, -1),
      );
      return { b, line: line + 3, k };
    });
    w.flags[c.f('domes')] = domes;
    // the long garden pool
    const pools: { z: Zone; d: number }[] = [];
    for (const d of GUMBAD) {
      w.add(
        new Art((ctx, w2) => {
          ctx.fillStyle = '#6FA3B8';
          ctx.fillRect(c.X(d), FLOOR + 4, px(5), 44);
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          for (let xx = c.X(d) + ((w2.tick >> 2) % 9); xx < c.X(d + 5) - 3; xx += 9) ctx.fillRect(xx, FLOOR + 6, 4, 1);
        }, -4),
      );
      const z = w.add(new Zone(c.X(d) + 1, FLOOR + 14, px(5) - 2, 30, d === GUMBAD[GUMBAD.length - 1] ? 'lko-aks' : 'lko-gumbad'));
      if (d !== GUMBAD[GUMBAD.length - 1]) pools.push({ z, d });
    }
    // from far back the terrace froze too high to land on; from close up it had shrunk into the pool
    let left = 0;
    let was = true;
    w.onTick((w2) => {
      const p = w2.player;
      if (was && !p.onGround) left = p.x + p.w;
      was = p.onGround;
      for (const { z, d } of pools) z.hazard.cause = c.X(d + 1) - left > 46 ? 'lko-gumbad-uncha' : 'lko-gumbad';
    });
    sign(w, x + 0.2, 10.4, 3.4, 'BAGH', 'shop', null, 'gumbad');
    sign(w, x + 18.6, 10.4, 2.6, 'AKS', 'shop', null, 'reflection');
  },
};

// ================================================================ act: seeti, the whistle duel
/** Two flyers, yours behind you and a rival on the far roof, both flying red. But they duel with
 *  whistles: a whistle calls the flock down to the roof beside the whistler, whatever any flag says. Yours
 *  calls them to the near roof, his to the far one. Stand where neither calls them: the tank roof between. */
const SEETI = { period: 360, ours: [50, 150], his: [230, 330], raise: 50 };
class Whistles extends Flyer {
  constructor(
    readonly clock: { t: number },
    x: number,
  ) {
    super(x, px(14), [['red', 99]], 0);
  }
  ph(w: World) {
    return this.clock.t < 0 ? -1 : (w.tick - this.clock.t) % SEETI.period;
  }
  order(w: World) {
    const p = this.ph(w);
    const on = (r: number[]) => p >= r[0] && p < r[1];
    return { c: on(SEETI.ours) || on(SEETI.his) ? ('white' as const) : ('red' as const), left: 1 };
  }
}
export const seeti: Act = {
  id: 'lko09-seeti',
  w: 36,
  advice: 'Two flyers, yours behind you and a rival on the far roof, both flying red. But they duel with whistles, and a whistle beats any flag: yours calls the flock down to the near roof, his to the far one. Watch who lifts his whistle, and wait on the tank roof between, where neither calls them.',
  cps: [15.2],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + 35, 15);
    g.fill(x, x + 5, 14, 17, '#');
    g.fill(x + 8, x + 11, 13, 17, '#');
    g.fill(x + 14, x + 19, 12, 17, '#');
    g.fill(x + 22, x + 25, 13, 17, '#');
    g.fill(x + 28, x + 35, 14, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const R1 = roofOf(x + 8, x + 11, 13),
      T = roofOf(x + 14, x + 19, 12),
      R2 = roofOf(x + 22, x + 25, 13);
    roofs(w, [roofOf(x, x + 5, 14), R1, T, R2, roofOf(x + 28, x + 35, 14)], c.X(0), c.X(36));
    const t0 = { t: -1 };
    const sig = new Whistles(t0, c.X(1) + 8);
    w.flags[c.f('k')] = { sig };
    // the two flyers, drawn with plain red flags: the flag is not what the birds go by here
    const mine = new Flyer(c.X(1) + 8, px(14), [['red', 99]], c.X(0.5));
    const his = new Flyer(c.X(33) + 8, px(14), [['red', 99]], c.X(0.5));
    drawFlyer(w, mine);
    drawFlyer(w, his);
    const fl = new Flock(w, [R1, R2], sig, { x: c.X(17), y: px(4) }, 'lko-seeti');
    w.add(
      new Art((ctx, w2) => {
        // the whistle raised to the lips before it blows: the tell
        const p = sig.ph(w2);
        for (const [f, r] of [
          [mine, SEETI.ours],
          [his, SEETI.his],
        ] as [Flyer, number[]][]) {
          const up = p >= r[0] - SEETI.raise && p < r[0] + 20;
          if (!up) continue;
          ctx.fillStyle = '#ECEFF1';
          ctx.fillRect(f.x - 6, f.feet - 26, 4, 2);
          if (p >= r[0]) {
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.lineWidth = 1;
            for (let k = 1; k <= 3; k++) {
              ctx.beginPath();
              ctx.arc(f.x - 8, f.feet - 25, 3 * k, -0.6, 0.6);
              ctx.stroke();
            }
          }
        }
      }, 4),
    );
    w.onTick((w2) => {
      if (t0.t < 0 && w2.player.cx > c.X(0.5)) t0.t = w2.tick;
      const p = sig.ph(w2);
      // the whistle decides the roof: yours the near one, his the far one
      fl.always = p >= SEETI.ours[0] - 10 && p < SEETI.his[0] - 10 ? R1 : R2;
      fl.z.hazard.cause = fl.always === R1 ? 'lko-seeti' : 'lko-seeti-jawab';
      if (p === SEETI.ours[0] || p === SEETI.his[0]) w2.sfx('click', p === SEETI.ours[0] ? mine.x : his.x, px(13));
    });
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2));
    sign(w, x + 0.2, 9.4, 3, 'SEETI', 'shop', null, 'muqabla');
  },
};

// ================================================================ act: girah, the tumblers
/** This flyer's flock has tumblers in it: at the start of every red, a few birds drop at the roof ahead,
 *  rolling over backwards, and then recover and climb. A tumble is not a landing. Wait it out, as birds
 *  coming down taught you, and the red is gone before you cross; go through the tumble, early in the red. */
export const GIRAH = lay(6, [13, 12, 13]);
const GIRAH_END = after(GIRAH);
const TUMBLE = 1.15;
export const girah: Act = {
  id: 'lko09-girah',
  w: GIRAH_END + 8,
  cp0: false,
  advice: 'This flock has tumblers in it: at the start of every red a few birds drop at the roof ahead, rolling over backwards, then climb again. A tumble is not a landing. Cross early in the red, through the tumble: wait for it to clear and the red is gone.',
  cps: [-2, ...GIRAH.map(([a]) => a + 0.2), GIRAH_END + 0.4],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + GIRAH_END + 7, 15);
    g.fill(x, x + 4, 14, 17, '#');
    GIRAH.forEach(([a, r, wd]) => g.fill(x + a, x + a + wd - 1, r, 17, '#'));
    g.fill(x + GIRAH_END, x + GIRAH_END + 7, 14, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const rs = GIRAH.map(([a, r, wd]) => roofOf(x + a, x + a + wd - 1, r));
    const end = roofOf(x + GIRAH_END, x + GIRAH_END + 7, 14);
    roofs(w, [roofOf(x, x + 4, 14), ...rs, end], c.X(0), c.X(GIRAH_END + 8));
    const f = new Flyer(c.X(1) + 8, px(14), [['red', 1.4], ['white', 1.8]], c.X(1.5));
    drawFlyer(w, f);
    const fl = new Flock(w, [...rs, end], f, { x: c.X(16), y: px(4) }, 'lko-girah');
    fl.near = true;
    w.flags[c.f('k')] = { f, fl };
    // when you left the ground: in the red after the tumble had cleared (you waited it out), or in the white
    let left: 'tumble-late' | 'white' | 'ok' = 'ok';
    let was = true;
    // how long you stood on the roof before you set off: a long stand late in the red is waiting it out
    let stood = 0;
    let waited = false;
    const tumbling = (w2: World) => {
      const o = f.order(w2);
      return f.t0 >= 0 && o.c === 'red' && 1.4 - o.left < TUMBLE;
    };
    w.flags[c.f('tumbling')] = tumbling;
    w.onTick((w2) => {
      const p = w2.player;
      if (was && !p.onGround && p.cx > c.X(2)) {
        const o = f.order(w2);
        left = o.c === 'white' ? 'white' : tumbling(w2) ? 'ok' : 'tumble-late';
        waited = left === 'tumble-late' && stood >= 30;
      }
      stood = p.onGround && Math.abs(p.vx) < 10 ? stood + 1 : 0;
      was = p.onGround;
      fl.z.hazard.cause = left === 'white' ? 'lko-kabootar' : waited ? 'lko-girah' : 'lko-girah-der';
    });
    w.add(
      new Art((ctx, w2) => {
        // the tumblers: three birds rolling down at the roof ahead of you and climbing away again
        if (!tumbling(w2)) return;
        const o = f.order(w2);
        const t = (1.4 - o.left) / TUMBLE;
        const p = w2.player;
        const r = [...rs, end].find((q) => q.x0 > p.x + p.w - 2) ?? end;
        const cx = fl.spot(r);
        const dy = Math.sin(Math.PI * t) * (r.top - 30 - px(4));
        for (let i = 0; i < 3; i++) {
          const a = t * 14 + i;
          const bx = cx - 12 + i * 12,
            by = px(4) + dy - i * 4;
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(a);
          ctx.fillStyle = '#8E9AA6';
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.4, 2.3, 0, 0, TAU);
          ctx.fill();
          ctx.fillStyle = '#5E6A75';
          ctx.fillRect(-4, -1, 3, 2);
          ctx.restore();
        }
      }, 5),
    );
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Bas zara sa! | Just a little!', 2.2));
    sign(w, x + 0.2, 9.4, 3, 'GIRAH', 'shop', null, 'kalabaaz');
  },
};

export const s09 = { room: kabootarRoom, acts: [gumbad, hawa, jhande, seeti, girah] };
export const meta09 = { family: 'flag-colour-steers-flock', betrayals: ['flag-signal'], ending: 'lko-chhatri' } as StageMeta;
