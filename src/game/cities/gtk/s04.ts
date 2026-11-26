// GTK-04 Kun Floor? Gangtok's houses start at the road and go floors down the slope, so a house has a "ground
// floor" on every road it touches. You come in at the top road's G. The lower road is three floors down. The
// first door you reach opens over the jhora; count doors and the third is the basement's, on the water, because
// the second floor down is a shop with no door. Count the flights of stairs from the door you came in by.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { lock, tara, text } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, decor, px } from './entities';
import { taraScript } from './common';

/** floor surfaces (tile rows): G at the top road, then a floor every three rows down the slope */
export const FLOORS = [4, 7, 10, 13, 16];

/**
 * One hillside house from column c (12 columns inside, the facade at c + 12). `doors[i]` is what floor i's
 * door on the facade does: 'none' (a shop floor, no door), 'exit' (a footbridge to the lower road), 'drop'
 * (opens over the jhora) or 'water' (the basement, at the jhora's level). The top floor (G) is the way in.
 */
export function house(g: Grid, c: number, doors: ('none' | 'exit' | 'drop' | 'water')[], exitW: number) {
  // inside: clear, then the floors; the stairwell zigzags down: right end, left end, right end, left end
  g.fill(c, c + 11, 0, 17, '.');
  for (let i = 0; i < FLOORS.length; i++) {
    const r = FLOORS[i];
    g.fill(c, c + 11, r, i === FLOORS.length - 1 ? 17 : r, '#');
    if (i === FLOORS.length - 1) break;
    // the stairwell: down at the right end on G, 2, ...; at the left end on 1, 3, ...
    if (i % 2 === 0) g.fill(c + 8, c + 10, r, r, '.');
    else g.fill(c + 1, c + 3, r, r, '.');
  }
  // the facade: solid but for a doorway (two rows high) where a floor has a door
  g.fill(c + 12, c + 12, 0, 17, '#');
  doors.forEach((d, i) => {
    if (i === 0 || d === 'none') return;
    const r = FLOORS[i];
    g.fill(c + 12, c + 12, r - 2, r - 1, '.');
  });
  // outside: the jhora gully, three columns wide, all the way down
  g.fill(c + 13, c + 15, 0, 17, '.');
  const ex = doors.indexOf('exit');
  const re = FLOORS[ex];
  // the footbridge from the exit door, and the lower road beyond it
  g.fill(c + 13, c + 15, re, re, '#');
  g.fill(c + 16, c + 15 + exitW, re, 17, '#');
}

/** the jhora at the foot of the gully, the stair drawings and the shop shutter, for the house at column c */
export function houseDecor(w: World, c: number, doors: ('none' | 'exit' | 'drop' | 'water')[], key: string) {
  // water at the bottom of the gully: the basement door opens straight on to it
  w.add(
    new Rig(px(c + 13), px(15) + 6, px(3), px(3), {
      layer: 3,
      cause: 'gtk-jhora',
      inset: 0,
      live: (_r, w2) => w2.flags[key + 'fell'] !== true,
      paint: (ctx, r, w2) => {
        box(ctx, r.x, r.y, r.w, r.h, '#56705F');
        for (let i = 0; i < 3; i++) box(ctx, r.x + 4 + ((w2.tick >> 2) + i * 15) % 40, r.y + 3 + i * 4, 6, 1, 'rgba(230,240,230,0.6)');
      },
    }),
  );
  // a fall from a high door into the gully has its own line: the floor was wrong
  w.add(new Rig(px(c + 13), px(15) + 6, px(3), px(3), { cause: 'gtk-galat-tala', inset: 0, live: (_r, w2) => w2.flags[key + 'fell'] === true }));
  // out of a door above the lower road: the drop down the gully is what gets you, whatever you land on
  const air = { from: -1 };
  w.add(
    new Rig(px(c + 12), 0, px(9), px(18), {
      layer: 0,
      tick: (r, w2) => {
        const p = w2.player;
        const inGully = p.x + p.w > r.x + 4 && p.x < r.x + r.w;
        if (!inGully || p.onGround) {
          if (inGully && p.onGround && air.from >= 0 && p.y - air.from > 40) {
            w2.flags[key + 'fell'] = true;
            w2.die('gtk-galat-tala');
          }
          air.from = -1;
          return;
        }
        if (air.from < 0) air.from = p.y;
        if (p.y - air.from > 40) w2.flags[key + 'fell'] = true;
      },
    }),
  );
  decor(w, -2, (ctx) => {
    // inside: plaster walls, a stair drawn in each hole, the shop floor's shutter where its door would be
    for (let i = 0; i < FLOORS.length - 1; i++) {
      const top = px(FLOORS[i]) + 16,
        bot = px(FLOORS[i + 1]);
      box(ctx, px(c), top, px(12), bot - top, i % 2 ? '#EDE6D6' : '#F4EEE1');
      const hole = i % 2 === 0 ? px(c + 8) : px(c + 1);
      // the flight: a handrail and steps drawn down the stairwell
      ctx.strokeStyle = '#8C8678';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let k = 0; k < 4; k++) {
        const sx = i % 2 === 0 ? hole + k * 12 : hole + px(3) - (k + 1) * 12;
        ctx.moveTo(sx, top - 16 + k * 12);
        ctx.lineTo(sx + 12, top - 16 + k * 12);
      }
      ctx.stroke();
      if (doors[i + 1] === 'none') {
        // a shop: shelves and the shutter down over the facade side, no way out
        box(ctx, px(c + 8), bot - 30, px(4), 28, '#9AA5AE');
        for (let k = 0; k < 6; k++) box(ctx, px(c + 8), bot - 28 + k * 5, px(4), 1, '#6F7A82');
        text(ctx, 'SHOP', px(c + 6), bot - 18, 7, '#E07A5F');
      }
    }
  });
}

export function room(): LevelDef {
  const doors: ('none' | 'exit' | 'drop' | 'water')[] = ['none', 'drop', 'none', 'exit', 'water'];
  const g = Grid.ground(15);
  g.fill(0, 9, 4, 17, '#');
  house(g, 10, doors, 6);
  return {
    id: 'GTK-04',
    city: 'GTK',
    index: 4,
    name: 'Kun Floor?',
    nameEn: 'Which floor?',
    tagline: 'Gangtok builds down the hill from the road. Every road a house touches has its own ground floor.',
    hint: 'You came in on the top road’s ground floor. The lower road is three floors down from there: count the flights of stairs, not the doors (the second floor down is a shop with no door), and go out at the bottom of the third flight. The first door opens over the jhora; the bottom of the stairs is the basement, on the water.',
    par: 16,
    map: g.put(1, 3, '@').rows(),
    build(w: World) {
      door(w);
      houseDecor(w, 10, doors, 'gtk4');
      sign(w, 3.4, 0.6, 5.2, 'LOWER ROAD', 'green', 'down', '3 floors down');
      sign(w, 8.2, 1.4, 1.6, 'G', 'shop', null, '', false);
      rival(w, 2, 4, 1, taraScript(4));
      onPass(w, px(11), (w2) => tara(w2, 'Hajur! Out the first door, Dad! | Yes! Out the first door, Dad!', 2.4));
      collectible(w, 'gtk-churpi', 14.5, 11.3);
    },
  };
}

/** act: up the steps to the next road and its house: this one is one floor down, the very first door */
const ACT_DOORS: ('none' | 'exit' | 'drop' | 'water')[] = ['none', 'exit', 'none', 'drop', 'water'];
export const act: Act = {
  id: 'gtk04-ghar',
  w: 28,
  advice: 'Up the steps to the next road and the next house. Read its sign: this one is one floor down, so it’s the first door this time. Count from where you came in, every house.',
  paint: (g, c) => {
    // up the steps from the lower road to the next top road
    for (let k = 0; k < 8; k++) g.fill(c.x + k, c.x + k, 12 - k, 17, '#');
    house(g, c.x + 8, ACT_DOORS, 4);
  },
  build: (w, c) => {
    houseDecor(w, c.x + 8, ACT_DOORS, 'gtk4a');
    sign(w, c.x + 5.4, 0.6, 3.4, 'LOWER RD', 'green', 'down', '1 floor down');
  },
};

/** door: the goods lift. Its buttons count from the top road: G is where you are; the door is on 1 */
export const ending: Ending = {
  space: 12,
  advice: 'The door is down the goods-lift shaft. The lift’s buttons count from the top road, so G is where you already are: jump up and press 1 to go down to the door.',
  paint: (g, D) => {
    g.fill(D - 3, D + 2, 15, 16, '.');
    g.put(D, 14, '.');
    g.put(D, 16, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'lift';
    const st = { down: false, pressedG: 0, y: FL };
    w.flags.gtk4e = st;
    const L = lock(w, d, 'Hoina. | No.');
    L.unlock();
    // the cage: a platform over the shaft, down 32 px once 1 is pressed
    const cage = w.add(
      new Rig(px(D - 3), FL, px(6), 8, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const ty = st.down ? FL + 32 : FL;
          if (r.y < ty) r.moveTo(w2, r.x, Math.min(ty, r.y + 0.5));
          st.y = r.y;
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, 4, '#5E5A50');
          box(ctx, r.x, r.y - 34, 2, 34, '#8C8678');
          box(ctx, r.x + r.w - 2, r.y - 34, 2, 34, '#8C8678');
          box(ctx, r.x, r.y - 34, r.w, 2, '#8C8678');
        },
      }),
    );
    void cage;
    // the button panel on a post by the cage: G above, 1 below; press by jumping into it
    const panelX = px(D - 3) + 4;
    for (const [label, bx] of [
      ['G', panelX],
      ['1', panelX + 40],
    ] as [string, number][]) {
      w.add(
        new Rig(bx, FL - 34, 10, 10, {
          layer: 4,
          tick: (r, w2) => {
            const p = w2.player;
            if (p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y) {
              if (label === '1') st.down = true;
              else st.pressedG = w2.tick;
            }
          },
          paint: (ctx, r, w2) => {
            const lit = (label === '1' && st.down) || (label === 'G' && w2.tick - st.pressedG < 40);
            box(ctx, r.x, r.y, r.w, r.h, lit ? '#F4A261' : '#D9D4C7');
            text(ctx, label, r.x + 5, r.y + 8, 8, '#26323A', 'rgba(0,0,0,0)');
          },
        }),
      );
    }
  },
};

export const meta04 = { family: 'floor-numbering-by-entrance', betrayals: ['numbering'], ending: 'gtk-lift-counts-down' };
