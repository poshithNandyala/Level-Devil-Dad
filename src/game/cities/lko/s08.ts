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
import { Art, FLOOR, Zone, px } from './kit';
import { tara } from './s02';

/** An arch at world x on the level whose floor is at y. Cross it in the air and you come out at `up`
 *  (one level higher, a step past the arch); cross it on your feet and nothing happens. */
export function arch(w: World, x: number, floorY: number, up: { x: number; y: number } | null, key: string) {
  let prev = w.player.cx;
  w.onTick((w2) => {
    const p = w2.player;
    const cx = p.cx;
    const atLevel = p.y + p.h <= floorY + 2 && p.y + p.h > floorY - 56;
    if (prev < x && cx >= x && atLevel && !p.onGround && up) {
      const vx = p.vx;
      w2.warp(up.x - p.w / 2, up.y - p.h, 'blink');
      p.vx = vx * 0.5;
      w2.flags[key] = (w2.flags[key] ?? 0) + 1;
      w2.sfx('blink', up.x, up.y - 8);
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
      ctx.quadraticCurveTo(x, top - 3, x + 4, top + 3);
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
      onPass(w, px(4), (w2) => w2.guide('Har darwaza ek jaisa hai. | Every doorway is alike.'));
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

export const s08 = { room: bhoolRoom, acts: [mehrab] };
export const meta08 = { family: 'entry-height-routes-level', betrayals: ['enter-height'], ending: 'lko-489' } as StageMeta;
