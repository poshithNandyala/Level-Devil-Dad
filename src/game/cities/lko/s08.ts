// LKO-08 Bhool Bhulaiya (the old maze), the "how would I know" stage. Lucknow's old maze has hundreds of
// identical doorways on several levels. Here every arch is the right one: what decides where you come out
// is how you go in. Go through an arch at a jump and you come out one floor up; walk through and you stay.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { Art, Block, FLOOR, Zone, gent, on, px, type Ctx } from './kit';
import { tara } from './s02';

/** An arch at world x on the level whose floor is at y. Cross it in the air and you come out at `up`
 *  (one level higher, a step past the arch); cross it on your feet and nothing happens. */
export function arch(w: World, x: number, floorY: number, up: { x: number; y: number } | null, key: string, down: { x: number; y: number } | null = null, back: { x: number; y: number } | null = null) {
  let prev = w.player.cx;
  w.onTick((w2) => {
    const p = w2.player;
    const cx = p.cx;
    const atLevel = p.y + p.h <= floorY + 2 && p.y + p.h > floorY - 56;
    // a down-arch (drawn cusp down) takes you a floor down if you come through it falling
    const to = down && p.vy > 0 ? down : up;
    if (prev < x && cx >= x && atLevel && !p.onGround && to) {
      const vx = p.vx;
      w2.warp(to.x - p.w / 2, to.y - p.h, 'blink');
      p.vx = vx * 0.5;
      w2.flags[key] = (w2.flags[key] ?? 0) + 1;
      w2.sfx('blink', to.x, to.y - 8);
    }
    // taken backwards (right to left) at a jump, an arch takes you a floor down
    if (back && prev > x && cx <= x && atLevel && !p.onGround) {
      w2.warp(back.x - p.w / 2, back.y - p.h, 'blink');
      w2.flags[key + ':back'] = (w2.flags[key + ':back'] ?? 0) + 1;
      w2.sfx('blink', back.x, back.y - 8);
    }
    prev = cx;
  });
  w.add(
    new Art((ctx) => {
      // a cream lime-plaster pier on each side and the cusped arch: every one exactly alike
      const top = floorY - 50;
      ctx.fillStyle = '#E9DCC4';
      ctx.fillRect(x - 14, top - 8, 5, 58);
      ctx.fillRect(x + 9, top - 8, 5, 58);
      ctx.fillRect(x - 14, top - 10, 28, 6);
      ctx.strokeStyle = '#B9A47E';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 9, floorY);
      ctx.lineTo(x - 9, top + 14);
      ctx.quadraticCurveTo(x - 9, top + 2, x - 4, top + 3);
      ctx.quadraticCurveTo(x, down ? top + 9 : top - 3, x + 4, top + 3);
      ctx.quadraticCurveTo(x + 9, top + 2, x + 9, top + 14);
      ctx.lineTo(x + 9, floorY);
      ctx.stroke();
    }, 4),
  );
}

/** the maze's inside: dim corridors and the rows of identical arches on every wall */
function mazeWall(w: World, c0: number, c1: number, rows: number[]) {
  w.add(
    new Art((ctx) => {
      const x0 = px(c0),
        x1 = px(c1 + 1);
      ctx.fillStyle = '#CDB994';
      ctx.fillRect(x0, px(3), x1 - x0, FLOOR - px(3));
      for (const r of rows) {
        const fy = px(r);
        for (let x = x0 + 6; x < x1 - 12; x += 20) {
          ctx.fillStyle = 'rgba(70,52,36,0.45)';
          ctx.beginPath();
          ctx.moveTo(x, fy);
          ctx.lineTo(x, fy - 22);
          ctx.quadraticCurveTo(x + 7, fy - 34, x + 14, fy - 22);
          ctx.lineTo(x + 14, fy);
          ctx.closePath();
          ctx.fill();
        }
      }
    }, -6),
  );
}

/** a deep shaft of the old well under the maze: fall in and that's that */
export function well(w: World, c0: number, c1: number, cause = 'lko-kuan') {
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx) => {
      const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 48);
      g.addColorStop(0, '#2A2018');
      g.addColorStop(1, '#0E0B08');
      ctx.fillStyle = g;
      ctx.fillRect(x0, FLOOR, x1 - x0, 48);
    }, -4),
  );
  return w.add(new Zone(x0 + 1, FLOOR + 16, x1 - x0 - 2, 30, cause));
}

/** sharp old iron hooks in a low vault (where the lamps once hung), along row `ty`, columns [c0, c1] */
export function hooks(w: World, c0: number, c1: number, y: number, cause = 'lko-bhool', up = true) {
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = '#5D5348';
      for (let x = x0 + 2; x < x1 - 2; x += 5) {
        ctx.beginPath();
        if (up) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2.5, y - 9);
          ctx.lineTo(x + 5, y);
        } else {
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2.5, y + 9);
          ctx.lineTo(x + 5, y);
        }
        ctx.fill();
      }
    }, 2),
  );
  return w.add(new Zone(x0 + 2, up ? y - 7 : y, x1 - x0 - 4, 7, cause));
}

// ================================================================ the room
function bhoolRoom(): LevelDef {
  return {
    id: 'LKO-08',
    city: 'LKO',
    index: 8,
    name: 'Bhool Bhulaiya',
    nameEn: 'The old maze',
    tagline: 'The old maze: corridors on several levels and hundreds of doorways, every one exactly alike. Every one of them is right. It depends how you go in.',
    hint: 'Look at how you went in, not which arch: go through an arch at a jump and you come out one floor up; walk through and you stay on your floor. The first arch has a little drain in front of it: walk over it, don’t hop. The second has the old well past it: jump through that one.',
    par: 14,
    map: Grid.ground(15)
      .pit(7, 7, 15)
      .fill(7, 7, 16, 17, '#')
      .fill(10, 19, 9, 9, '#')
      .pit(22, 25, 15)
      .fill(22, 31, 12, 12, '=')
      .put(1, 14, '@')
      .put(30, 14, 'E')
      .rows(),
    build(w: World) {
      door(w);
      mazeWall(w, 9, 31, [9, 15]);
      // arch 1: a hop over the drain takes you up to the gallery, straight on to the hooks
      arch(w, px(8) + 8, FLOOR, { x: px(10) + 8, y: px(9) }, 'arch1');
      hooks(w, 12, 14, px(9));
      // arch 2: the floor past it is the old well; at a jump you come out up on the ledge beyond it
      arch(w, px(21) + 8, FLOOR, { x: px(23) + 8, y: px(12) }, 'arch2');
      well(w, 22, 25);
      sign(w, 2.2, 10.4, 4.6, 'BHOOL BHULAIYA', 'shop', null, '489 darwaze');
      rival(w, 3, 15, 1, tara(6));
      onPass(w, px(4), (w2) => taraNow(w2, 'Har darwaza ek jaisa hai. | Every doorway is alike.', 2.4));
      collectible(w, 'lko-sheermal', 16.5, 7.6);
    },
  };
}

// ================================================================ the act: the low vault
/** One arch with a low vault over its upper floor (old lamp hooks in the ceiling): go through that one on
 *  foot. Then the floor ends at the well again: through the next one at a jump, up on to the gallery. */
const mehrab: Act = {
  id: 'lko08-mehrab',
  w: 30,
  advice: 'Past the next arch the upper floor is a low vault full of old lamp hooks: walk through that arch, over the drain, don’t hop. The one after has the well beyond it: through that one at a jump, up on to the gallery, and along.',
  cps: [9.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 3, 15).fill(x + 3, x + 3, 16, 17, '#');
    g.fill(x + 5, x + 10, 11, 11, '#');
    g.pit(x + 15, x + 29, 15);
    g.fill(x + 15, x + 29, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 29, [11, 15]);
    arch(w, c.X(4) + 8, FLOOR, { x: c.X(6) + 8, y: px(11) }, c.f('a1'));
    hooks(w, x + 5, x + 10, px(9) + 12, 'lko-mehrab', false);
    arch(w, c.X(14) + 8, FLOOR, { x: c.X(16) + 8, y: px(11) }, c.f('a2'));
    well(w, x + 15, x + 29);
    w.add(
      new Art((ctx) => {
        // the low vault's ceiling over the upper floor
        ctx.fillStyle = '#A8916B';
        ctx.fillRect(c.X(5), px(9), px(6), 12);
      }, 1),
    );
  },
};

// ================================================================ act: toota, the broken arch
/** An arch must be whole to lift you. The arch at the end of this floor has lost its crown: it is only a
 *  doorway, and a jump through it lifts no one, out over the well. Take the lift at the whole arch before
 *  it, though the floor goes on past that one. */
const toota: Act = {
  id: 'lko08-toota',
  w: 30,
  advice: 'An arch must be whole to lift you. The one at the end of this floor has lost its crown: it is only a doorway, and a jump through it takes you nowhere but out over the well. Jump through the whole arch before it, though the floor goes on past that one, and walk the gallery.',
  cps: [16.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 9, x + 24, 15);
    g.fill(x + 5, x + 26, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 29, [11, 15]);
    arch(w, c.X(3) + 8, FLOOR, { x: c.X(5) + 8, y: px(11) }, c.f('a1'));
    const wz = well(w, x + 9, x + 24);
    const bx = c.X(7) + 8;
    let prev = w.player.cx;
    w.onTick((w2) => {
      const p = w2.player;
      // a jump through the crownless arch: you were counting on a lift it cannot give
      if (prev < bx && p.cx >= bx && !p.onGround) wz.hazard.cause = 'lko-toota';
      prev = p.cx;
    });
    w.add(
      new Art((ctx) => {
        // the broken arch: both piers, but the cusped crown has fallen; its stones lie on the floor
        ctx.fillStyle = '#E9DCC4';
        ctx.fillRect(bx - 14, px(12) + 4, 5, FLOOR - px(12) - 4);
        ctx.fillRect(bx + 9, px(12) + 10, 5, FLOOR - px(12) - 10);
        ctx.strokeStyle = '#B9A47E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx - 9, FLOOR);
        ctx.lineTo(bx - 9, px(12) + 8);
        ctx.quadraticCurveTo(bx - 8, px(12) + 4, bx - 5, px(12) + 6);
        ctx.moveTo(bx + 9, FLOOR);
        ctx.lineTo(bx + 9, px(12) + 14);
        ctx.stroke();
        ctx.fillStyle = '#D6C6A6';
        ctx.fillRect(bx - 22, FLOOR - 4, 6, 4);
        ctx.fillRect(bx - 30, FLOOR - 3, 5, 3);
        ctx.fillRect(bx - 18, FLOOR - 6, 4, 2);
      }, 4),
    );
    sign(w, x + 0.4, 10.4, 3.2, 'TOOTA', 'shop', null, 'mehrab');
  },
};

// ================================================================ the door: the 489th doorway
/** The gallery runs on over the well to one last arch at its end, and the door is down below it, beyond the
 *  well. Walk through the last arch and off the end of the gallery, and you drop to the door. Hop through
 *  it (there's a crack in the gallery floor just before it) and you're on the roof, among the finials. */
export const doorway489: Ending = {
  space: 12,
  advice: 'The last arch is at the end of the gallery, over the well, and the door is below it on the far side. Walk through it, over the crack, and simply step off the end: you drop to the door. Hop through it and you’re up on the roof.',
  paint: (g, D) => {
    g.pit(D - 12, D - 2, 15);
    g.fill(D - 12, D - 3, 11, 11, '#');
    g.put(D - 6, 11, '.');
    g.fill(D - 9, D + 3, 6, 6, '#');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'gallery';
    well(w, D - 12, D - 2);
    arch(w, px(D - 5) + 8, px(11), { x: px(D - 4) + 8, y: px(6) }, 'arch489');
    hooks(w, D - 3, D + 2, px(6), 'lko-bhool');
    w.when(
      (w2) => w2.player.cx > px(D - 10),
      (w2) => taraNow(w2, 'Har darwaza ek jaisa hai. | Every doorway is alike.', 2.2),
    );
    w.onTick((w2) => {
      if (w2.flags.arch489) w2.flags.twist = 'roof';
    });
  },
};


// ================================================================ act 2: the chausar court (the Pachisi reserve)
/** A courtyard laid out as a pachisi board over the well. Each throw of the cowries lights as many squares
 *  ahead of yours as fell mouth-up; only lit squares (and the one you stand on) hold. A courtier moves on
 *  the board too: land on his square and he knocks you off. */
const CHAUSAR_THROWS = [2, 1, 3, 1, 2, 3, 1, 2, 2, 3, 1, 2];
const CHAUSAR_PIECE = [5, 5, 6, 6, 3, 3, 7, 8, 8, 2, 2, 2];
export function chausar(w: World, c0: number, n: number, key: string, period = 200, o: { bow?: boolean; well?: Zone; off?: number } = {}) {
  const sq = Array.from({ length: n }, (_, i) => w.add(new Block(px(c0 + 3 * i), px(13), 32, 8, (ctx, b, w2) => drawSquare(ctx, b, i, w2, S), 2)));
  const S = { t0: -1, k: -1, cur: -1, lit: new Set<number>(), piece: -1, n: 0 };
  w.flags[key] = S;
  const piece = w.add(new Zone(0, px(13) - 26, 20, 26, 'lko-goti'));
  piece.on = false;
  // the finale's courtier: when he stands two ahead he bows you on to the square between, 'pehle aap', and
  // that square, lit and empty, is the loose stone
  const bowed = { i: -1 };
  w.flags[key + ':bowed'] = bowed;
  const update = () => {
    sq.forEach((b, i) => b.set((i === S.cur || S.lit.has(i)) && i !== bowed.i));
  };
  update();
  w.onTick((w2) => {
    const p = w2.player;
    const onI = sq.findIndex((b) => b.on && on(w2, b.solid));
    if (onI >= 0) S.cur = onI;
    else if (p.onGround && p.cx < px(c0)) S.cur = -1;
    if (S.t0 < 0 && p.onGround && p.cx > px(c0 - 3)) S.t0 = w2.tick;
    if (S.t0 < 0) return;
    const k = Math.floor((w2.tick - S.t0) / period);
    if (k !== S.k) {
      S.k = k;
      S.piece = CHAUSAR_PIECE[(k + (o.off ?? 0)) % CHAUSAR_PIECE.length] - (o.off ?? 0);
      S.n = CHAUSAR_THROWS[(k + (o.off ?? 0)) % CHAUSAR_THROWS.length];
      if (S.piece <= S.cur) S.piece = S.cur + 2;
      if (S.piece >= n - 1) S.piece = -1;
      bowed.i = -1;
      if (o.bow && S.piece === S.cur + 2) {
        bowed.i = S.cur + 1;
        S.lit.add(bowed.i);
        w2.say('Pehle aap, janab! | After you, sir!', px(c0 + 3 * S.piece) + 16, px(13) - 34, 1.8, 'npc');
      }
      S.lit = new Set(Array.from({ length: S.n }, (_, j) => S.cur + 1 + j).filter((j) => j < n));
      // the courtier's square always holds (he's standing on it)
      if (S.piece < n) S.lit.add(S.piece);
      w2.sfx('click', px(c0), px(12));
      update();
    }
    piece.on = S.piece >= 0 && S.piece < n;
    if (o.well) o.well.hazard.cause = bowed.i >= 0 && Math.abs(w2.player.cx - (px(c0 + 3 * bowed.i) + 16)) < 24 ? 'lko-goti-pehle' : 'lko-kuan';
    if (piece.on) piece.x = px(c0 + 3 * S.piece) + 6;
  });
  w.add(
    new Art((ctx) => {
      // the thrower and his cowries
      const tx = px(c0 - 2) + 8;
      gent(ctx, tx, px(13) - 1, 24, '#C9A27E', { face: 1, arms: 0.6, topi: '#F5F0E6' });
      if (S.t0 >= 0) {
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = '#F5F1E8';
          ctx.beginPath();
          ctx.ellipse(tx + 10 + i * 5, px(13) - 3, 2, 1.4, 0, 0, Math.PI * 2);
          ctx.fill();
          if (i < S.n) {
            ctx.fillStyle = '#3B2E22';
            ctx.fillRect(tx + 9.5 + i * 5, px(13) - 3.3, 1.2, 0.7);
          }
        }
      }
      if (S.piece >= 0 && S.piece < n) gent(ctx, px(c0 + 3 * S.piece) + 16, px(13), 26, '#7A4E6E', { face: -1, topi: '#E8C547' });
    }, 3),
  );
  return { sq, S };
}
function drawSquare(ctx: Ctx, b: Block, i: number, w: World, S: { lit: Set<number>; cur: number }) {
  const x = b.x,
    y = b.y;
  const solid = b.on;
  ctx.fillStyle = solid ? (i % 2 ? '#C2485B' : '#F3EEE6') : 'rgba(243,238,230,0.15)';
  ctx.fillRect(x, y, 32, 8);
  ctx.strokeStyle = solid ? '#5A3E2B' : 'rgba(243,238,230,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, 31, 7);
  if (S.lit.has(i) && i !== S.cur && !solid) {
    // the square he bowed you on to: lit like the rest, a crack across it, nothing under the light
    ctx.fillStyle = i % 2 ? 'rgba(194,72,91,0.85)' : 'rgba(243,238,230,0.85)';
    ctx.fillRect(x, y, 32, 8);
    ctx.fillStyle = 'rgba(60,40,30,0.8)';
    ctx.fillRect(x + 15, y, 1.5, 8);
    ctx.fillRect(x + 9, y + 3, 12, 1);
  }
  if (solid && S.lit.has(i) && i !== S.cur) {
    ctx.fillStyle = 'rgba(255,230,120,0.6)';
    ctx.fillRect(x + 4, y + 2, 24, 2);
  }
  void w;
}

export const chaupar: Act = {
  id: 'lko08-chausar',
  w: 46,
  advice: 'A pachisi court over the well, in two halves with a stone chabutra between. Each throw of the cowries (count the dark mouths) lights that many squares ahead of yours; only lit squares and your own hold, and they go dark at the next throw. Never hop past the lit ones, and never on to the courtier’s square: wait on yours for a throw that takes you past him.',
  cp0: false,
  cps: [-2, 20.5],
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 40, 15);
    // the chabutra between the two halves of the court: calm stone
    g.fill(c.x + 19, c.x + 24, 13, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    well(w, x + 4, x + 18);
    well(w, x + 25, x + 40);
    chausar(w, x + 5, 5, c.f('court'));
    chausar(w, x + 26, 5, c.f('court2'), 200, { off: 2 });
    sign(w, x + 0.4, 10.4, 3.4, 'CHAUSAR', 'shop', null, 'pachisi');
  },
};

// ================================================================ act: the minaret of arches
/** Three arches stacked one above the other, a floor apart, over the well. Each jump through one takes you
 *  one floor up. The second floor stops short over the well; the top one (the roof) is full of old hooks.
 *  The way on is the third floor: jump, jump, then walk. */
export const minar: Act = {
  id: 'lko08-minar',
  w: 26,
  advice: 'A minaret of arches, one above the other. Each jump through one takes you one floor up: the second floor stops short over the well, and the roof is full of old hooks. You want the third floor: jump through the first two, walk through the third, and step off its end.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 5, x + 21, 15);
    g.fill(x + 5, x + 12, 11, 11, '#');
    g.fill(x + 11, x + 21, 7, 7, '#');
    g.fill(x + 17, x + 20, 3, 3, '#');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x + 5, x + 21, [3, 7, 11]);
    well(w, x + 5, x + 21);
    arch(w, c.X(3) + 8, FLOOR, { x: c.X(6) + 8, y: px(11) }, c.f('a1'));
    arch(w, c.X(9) + 8, px(11), { x: c.X(12) + 8, y: px(7) }, c.f('a2'));
    arch(w, c.X(16) + 8, px(7), { x: c.X(18) + 8, y: px(3) }, c.f('a3'));
    hooks(w, x + 17, x + 20, px(2), 'lko-bhool', false);
    w.add(
      new Art((ctx) => {
        // the minaret's lime-plaster shaft behind the arches
        ctx.fillStyle = 'rgba(233,220,196,0.35)';
        ctx.fillRect(c.X(2), px(1), px(19), FLOOR - px(1));
      }, -5),
    );
    sign(w, x + 0.2, 10.4, 3.2, 'MINAR', 'shop', null, 'teen manzil');
  },
};

// ================================================================ act: the down-arch
/** On the gallery, one arch is cusped the other way (it hangs down). Jump through it up close, rising, as
 *  everywhere else, and you come out a floor up among the hooks. Come through it falling (jump from three
 *  tiles back, so you're on your way down) and you come out a floor below, on the ground past the well.
 *  Walk through and nothing happens: the gallery ends over the well. Then a plain arch takes you back up. */
export const utar: Act = {
  id: 'lko08-utar',
  w: 24,
  advice: 'One arch hangs the other way: it takes you a floor DOWN if you come through it falling. Jump from three tiles back so you’re on your way down when you reach it. Up close, rising, it takes you up into the hooks; walking, the gallery just ends over the well. Below, jump through the plain arch back up.',
  cps: [19.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + 17, 15);
    g.fill(x, x + 12, 11, 11, '=');
    g.fill(x + 9, x + 12, 7, 7, '#');
    g.fill(x + 22, x + 23, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 23, [7, 11, 15]);
    well(w, x, x + 17);
    arch(w, c.X(8) + 8, px(11), { x: c.X(10) + 8, y: px(7) }, c.f('a1'), { x: c.X(18) + 8, y: FLOOR });
    hooks(w, x + 9, x + 12, px(6), 'lko-bhool', false);
    arch(w, c.X(21) + 8, FLOOR, { x: c.X(23) + 8, y: px(11) }, c.f('a2'));
    sign(w, x + 1, 6.4, 3, 'UTAR', 'shop', null, 'neeche');
  },
};

// ================================================================ act: wapas, back through the arch
/** Up through the first arch on to a gallery over the well, and the gallery goes nowhere: forward through
 *  its arch at a jump is the hook roof, and its end is over the well. Walk past that arch, turn, and jump
 *  back through it the other way: an arch taken backwards takes you a floor DOWN, and out on the far side
 *  of the well. */
export const wapas: Act = {
  id: 'lko08-wapas',
  w: 22,
  advice: 'Up through the first arch on to a gallery over the well, and the gallery goes nowhere: forward through its arch at a jump is the hook roof, and its end is over the well. Walk on past that arch, turn round, and jump back through it the other way: an arch taken backwards takes you a floor down, out past the well.',
  cps: [17.5],
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 15, 15);
    g.fill(x + 3, x + 14, 11, 11, '=');
    g.fill(x + 12, x + 16, 7, 7, '#');
    g.fill(x + 20, x + 21, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 21, [7, 11, 15]);
    // and a plain arch at the end, back up to the gallery that leads to the door
    arch(w, c.X(19) + 8, FLOOR, { x: c.X(21) + 8, y: px(11) }, c.f('a3'));
    well(w, x + 4, x + 15);
    arch(w, c.X(2) + 8, FLOOR, { x: c.X(4) + 8, y: px(11) }, c.f('a1'));
    arch(w, c.X(11) + 8, px(11), { x: c.X(13) + 8, y: px(7) }, c.f('a2'), null, { x: c.X(17) + 8, y: FLOOR });
    hooks(w, x + 12, x + 16, px(6), 'lko-bhool', false);
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Har darwaza ek jaisa hai. | Every doorway is alike.', 2.2));
    sign(w, x + 0.2, 10.4, 3, 'WAPAS', 'shop', null, 'ulte paon');
  },
};

// ================================================================ act: upar, on top of the arches
/** The beamless vault: a row of arches standing in the well, and nothing over them but their own stone
 *  tops. Jump at one, as everywhere, and it takes you up into the hooks; walk on and the floor ends at the
 *  well. Go up through the first arch to the high ledge, and come down on to the arch tops from above:
 *  from up there an arch is only a floor. */
export const upar: Act = {
  id: 'lko08-upar',
  cp0: false,
  cps: [-3],
  w: 26,
  advice: 'The beamless vault: arches standing in the well, and nothing over them but their stone tops. Jump at one and it takes you up into the hooks; walk on and the floor ends. Go up through the first arch to the high ledge, then come down on to the arch tops from above, and hop top to top.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 8, x + 20, 15);
    g.fill(x + 3, x + 6, 8, 8, '#');
    for (const t of [9, 13, 17]) g.fill(x + t, x + t + 1, 10, 10, '#');
    g.fill(x + 9, x + 19, 5, 5, '#');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 25, [8, 10, 15]);
    well(w, x + 8, x + 20);
    arch(w, c.X(1) + 8, FLOOR, { x: c.X(4) + 8, y: px(8) }, c.f('a0'));
    for (const t of [9, 13, 17]) arch(w, c.X(t) + 16, FLOOR, { x: c.X(t) + 16, y: px(5) }, c.f('a' + t));
    hooks(w, x + 9, x + 19, px(4), 'lko-bhool', false);
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Har darwaza ek jaisa hai. | Every doorway is alike.', 2.2));
    sign(w, x + 0.2, 10.4, 3, 'UPAR', 'shop', null, 'mehrab par');
  },
};

// ================================================================ act: roshandan, the light well
/** A dark stretch of gallery over the well. You can't see the floor; you see only patches of light. Light
 *  that comes DOWN from an opening in the vault falls on floor; light that comes UP through a hole from the
 *  hall below is the hole itself, and its beam widens upwards. Hop from down-lit patch to down-lit patch. */
const ROSHAN = { floor: [7, 12, 17, 22], hole: [9, 14, 19] };
export const roshandan: Act = {
  id: 'lko08-roshandan',
  w: 26,
  advice: 'A dark stretch of gallery: you see only patches of light. Light coming down from an opening in the vault falls on floor; light coming up through a hole from the hall below is the hole, and its beam widens upwards. Hop from down-lit patch to down-lit patch, over the dark and over the up-lit ones.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + 25, 15);
    g.fill(x, x + 4, 11, 11, '=');
    g.fill(x + 24, x + 25, 11, 11, '=');
  },
  build: (w, c) => {
    const x = c.x;
    well(w, x, x + 25);
    const fy = px(11);
    // the floor patches: solid, seen only in their own beam
    for (const f of ROSHAN.floor) w.add(new Block(c.X(f), fy, 32, 6, () => {}, 1));
    w.add(
      new Art((ctx, w2) => {
        // the dark gallery
        ctx.fillStyle = 'rgba(20,16,12,0.88)';
        ctx.fillRect(c.X(4), px(3), px(20), FLOOR + 40 - px(3));
        // beams from above: narrow at the vault, wide on the floor they light
        for (const f of ROSHAN.floor) {
          const x0 = c.X(f);
          const g = ctx.createLinearGradient(0, px(4), 0, fy);
          g.addColorStop(0, 'rgba(255,240,200,0.15)');
          g.addColorStop(1, 'rgba(255,240,200,0.55)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0 + 12, px(4));
          ctx.lineTo(x0 + 20, px(4));
          ctx.lineTo(x0 + 32, fy);
          ctx.lineTo(x0, fy);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#C9B08A';
          ctx.fillRect(x0, fy, 32, 6);
          // the roshandan itself: a lit square opening in the vault, in a dark wooden frame
          ctx.fillStyle = '#3B2A1C';
          ctx.fillRect(x0 + 9, px(4) - 9, 14, 10);
          ctx.fillStyle = '#FFF3D0';
          ctx.fillRect(x0 + 11, px(4) - 7, 10, 7);
          // a solid stone slab: a pool of light on its top, a hard edge under it
          ctx.fillStyle = 'rgba(255,244,210,0.8)';
          ctx.fillRect(x0 + 3, fy - 1, 26, 2);
          ctx.fillStyle = '#7A6448';
          ctx.fillRect(x0, fy + 5, 32, 2);
          // dust falling down the beam
          ctx.fillStyle = 'rgba(255,248,225,0.8)';
          for (let k = 0; k < 4; k++) {
            const ph = ((w2.tick * 0.6 + k * 23) % 90) / 90;
            ctx.fillRect(x0 + 10 + k * 4 + ph * 4, px(4) + ph * (fy - px(4)), 1.5, 1.5);
          }
        }
        // beams from below: a bright hole, the beam widening upwards to the vault
        for (const h of ROSHAN.hole) {
          const x0 = c.X(h);
          const g = ctx.createLinearGradient(0, fy, 0, px(4));
          g.addColorStop(0, 'rgba(255,236,190,0.6)');
          g.addColorStop(1, 'rgba(255,236,190,0.1)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0, fy);
          ctx.lineTo(x0 + 32, fy);
          ctx.lineTo(x0 + 44, px(4));
          ctx.lineTo(x0 - 12, px(4));
          ctx.closePath();
          ctx.fill();
          // the hole: a black opening in the floor with its broken lip lit from beneath
          ctx.fillStyle = '#0B0806';
          ctx.fillRect(x0 + 2, fy, 28, 6);
          ctx.fillStyle = '#FFE9B0';
          ctx.fillRect(x0 + 2, fy + 4, 28, 2);
          ctx.fillRect(x0, fy - 1, 3, 7);
          ctx.fillRect(x0 + 29, fy - 1, 3, 7);
          // dust rising up out of it
          ctx.fillStyle = 'rgba(255,240,200,0.8)';
          for (let k = 0; k < 4; k++) {
            const ph = ((w2.tick * 0.6 + k * 23) % 90) / 90;
            ctx.fillRect(x0 + 6 + k * 6 - ph * 8 + k * ph * 4, fy - ph * (fy - px(4)), 1.5, 1.5);
          }
        }
      }, 0),
    );
    // falling through an up-lit patch is its own death; anywhere else in the dark is the well
    const zone = w.add(new Zone(c.X(0), fy + 24, px(26), 40, 'lko-kuan'));
    let left = 0;
    w.onTick((w2) => {
      const p = w2.player;
      // where you stepped off decides it: into an up-lit patch, or into the dark
      if (p.onGround) left = (p.cx - c.X(0)) / 16;
      zone.hazard.cause = ROSHAN.hole.some((h) => left >= h - 1 && left < h + 2) ? 'lko-roshandan' : 'lko-kuan';
    });
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Har darwaza ek jaisa hai. | Every doorway is alike.', 2.2));
  },
};

// ================================================================ act: sargoshi, the whispering gallery
/** The whispering gallery: a word near the wall carries along it to the far end, where the guard listens.
 *  The handrail is on the wall side, along a raised ledge; keep off it and walk the middle, though the
 *  middle floor has holes in it (light coming up through them: hop those). */
const SARGOSHI = { holes: [8, 17] };
export const sargoshi: Act = {
  id: 'lko08-sargoshi',
  w: 26,
  cps: [12],
  advice: 'The whispering gallery: anything near the wall carries along it to the far end, where the guard listens. The handrail is on the wall side, along the raised ledge: keep off it. Walk the middle, and hop the holes where light comes up through the floor.',
  paint: (g, c) => {
    const x = c.x;
    for (const h of SARGOSHI.holes) g.pit(x + h, x + h + 1, 15);
    g.fill(x + 3, x + 22, 11, 11, '=');
    g.fill(x + 23, x + 23, 13, 14, '#');
    g.fill(x + 24, x + 25, 11, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 25, [11, 15]);
    for (const h of SARGOSHI.holes) well(w, x + h, x + h + 1, 'lko-roshandan');
    const H = { on: 0, heard: false };
    w.flags[c.f('h')] = H;
    const gate = w.add(new Zone(c.X(20), px(8), px(3), px(3), 'lko-sargoshi'));
    gate.on = false;
    w.onTick((w2) => {
      const p = w2.player;
      const ledge = p.onGround && Math.abs(p.y + p.h - px(11)) < 2 && p.cx > c.X(3) && p.cx < c.X(23);
      H.on = ledge ? H.on + 1 : 0;
      if (H.on > 20 && !H.heard) {
        H.heard = true;
        w2.say('Kaun hai? | Who is there?', c.X(24), px(8), 2, 'npc');
        w2.sfx('thud', c.X(21), px(10));
      }
      gate.on = H.heard;
    });
    w.add(
      new Art((ctx, w2) => {
        // the handrail along the wall-side ledge
        ctx.fillStyle = '#8D6E63';
        ctx.fillRect(c.X(3), px(11) - 12, px(20), 2);
        for (let xx = c.X(3); xx < c.X(23); xx += 16) ctx.fillRect(xx, px(11) - 12, 2, 12);
        // the ripples of a whisper running along the wall when you are on the ledge
        if (H.on > 0) {
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
          const ph = (w2.tick % 30) / 30;
          for (let k = 0; k < 3; k++) {
            ctx.beginPath();
            ctx.arc(w2.player.cx + (k + ph) * 50, px(11) - 20, 6, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();
          }
        }
        // the guard at the far end, and his grille over the ledge's end
        gent(ctx, c.X(24) + 8, px(11), 25, '#5D4A3A', { face: H.heard ? -1 : 1, arms: H.heard ? 1 : 0.3, skin: '#8C5A3C' });
        ctx.fillStyle = '#3B3A36';
        const gy = H.heard ? px(8) : px(5);
        for (let xx = c.X(20); xx < c.X(23); xx += 6) ctx.fillRect(xx, gy, 2, px(3));
        ctx.fillRect(c.X(20), gy + px(3) - 2, px(3), 2);
        // light coming up through the holes in the middle floor
        for (const h of SARGOSHI.holes) {
          const x0 = c.X(h);
          const g = ctx.createLinearGradient(0, FLOOR, 0, px(9));
          g.addColorStop(0, 'rgba(255,236,190,0.55)');
          g.addColorStop(1, 'rgba(255,236,190,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(x0, FLOOR);
          ctx.lineTo(x0 + 32, FLOOR);
          ctx.lineTo(x0 + 40, px(11) + 4);
          ctx.lineTo(x0 - 8, px(11) + 4);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#FFE9B0';
          ctx.fillRect(x0, FLOOR + 3, 32, 2);
        }
      }, 0),
    );
    sign(w, x + 0.4, 10.4, 3.4, 'SARGOSHI', 'shop', null, 'dhire');
  },
};

// ================================================================ act: darwaza, the hall door
/** A hall door in the maze: walk through and it puts you down a little further on, and while you were in
 *  it the maze moved. The arch you saw before the door, the one over the well's edge, is gone; there is one
 *  nearer now. Take the calm on arrival to look again. Hop over the door and nothing moves, but the arch you
 *  saw from out here lifts you only into the old lamp hooks. */
const DARWAZA = { door: 4, out: 6.5, before: 17, after: 13 };
export const makeDarwaza = (id: string, moves: boolean, advice: string, word: string, extra?: (w: World, c: Parameters<NonNullable<Act['build']>>[1]) => void): Act => ({
  id,
  w: 32,
  cp0: false,
  cps: [-2, 24],
  advice,
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 19, x + 31, 15);
    g.fill(x + 14, x + 31, 11, 11, '=');
    g.fill(x + 18, x + 21, 7, 7, '=');
  },
  build: (w, c) => {
    const x = c.x;
    mazeWall(w, x, x + 31, [7, 11, 15]);
    well(w, x + 19, x + 31);
    hooks(w, x + 18, x + 21, px(7));
    const D = { warped: false };
    w.flags[c.f('d')] = D;
    const archAt = () => c.X(D.warped && moves ? DARWAZA.after : DARWAZA.before) + 8;
    let prev = w.player.cx;
    w.onTick((w2) => {
      const p = w2.player;
      // walk into the door and it sets you down further on; the maze has moved
      if (!D.warped && prev < c.X(DARWAZA.door) + 8 && p.cx >= c.X(DARWAZA.door) + 8 && p.onGround) {
        D.warped = true;
        w2.warp(c.X(DARWAZA.out) + 8 - p.w / 2, FLOOR - p.h, 'blink');
        w2.sfx('blink', c.X(DARWAZA.out), FLOOR - 8);
      }
      // the one arch, wherever it stands now: at a jump it lifts you a floor (the old one: into the hooks)
      const ax = archAt();
      if (prev < ax && p.cx >= ax && !p.onGround && p.y + p.h > FLOOR - 56) {
        const to = D.warped ? { x: (moves ? c.X(15) : c.X(19)) + 8, y: px(11) } : { x: c.X(19) + 8, y: px(7) };
        w2.warp(to.x - p.w / 2, to.y - p.h, 'blink');
        w2.sfx('blink', to.x, to.y - 8);
      }
      prev = p.cx;
    });
    w.add(
      new Art((ctx) => {
        // the hall door
        const dx = c.X(DARWAZA.door);
        ctx.fillStyle = '#6D4C33';
        ctx.fillRect(dx, FLOOR - 40, 16, 40);
        ctx.fillStyle = '#2B2018';
        ctx.fillRect(dx + 3, FLOOR - 36, 10, 36);
        // the arch, where it stands now
        const ax = archAt();
        const top = FLOOR - 50;
        ctx.fillStyle = '#E9DCC4';
        ctx.fillRect(ax - 14, top - 8, 5, 58);
        ctx.fillRect(ax + 9, top - 8, 5, 58);
        ctx.fillRect(ax - 14, top - 10, 28, 6);
        ctx.strokeStyle = '#B9A47E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ax - 9, FLOOR);
        ctx.lineTo(ax - 9, top + 14);
        ctx.quadraticCurveTo(ax - 9, top + 2, ax - 4, top + 3);
        ctx.quadraticCurveTo(ax, top - 3, ax + 4, top + 3);
        ctx.quadraticCurveTo(ax + 9, top + 2, ax + 9, top + 14);
        ctx.lineTo(ax + 9, FLOOR);
        ctx.stroke();
      }, 4),
    );
    extra?.(w, c);
    sign(w, x + 0.4, 10.4, 3.4, word, 'shop', null, 'hall');
  },
});
export const darwaza = makeDarwaza(
  'lko08-darwaza',
  true,
  'A hall door: walk through it and it sets you down a little further on, and while you were in it the arches moved. The one you saw over the well’s edge is gone; there is one nearer now. Look again before you jump. Hop over the door and nothing moves, but that arch lifts you only into the old lamp hooks.',
  'DARWAZA',
);

export const s08 = { room: bhoolRoom, acts: [chaupar, upar, minar, toota, mehrab, utar, wapas, darwaza, sargoshi, roshandan] };
export const meta08 = { family: 'entry-height-routes-level', betrayals: ['enter-height'], ending: 'lko-489' } as StageMeta;
