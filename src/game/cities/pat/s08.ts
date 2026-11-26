// PAT-08 Nalanda: the brick university. "How would I know?" stage: every hatch in the courtyard floor is a passage
// to the cell with the same number of bricks over its door in the next courtyard. Step on the wrong hatch and you
// come up in a cell with a well in it. The bricks are drawn over every hatch and every cell; the answer is to
// read them. Door: the library mound, the cell with no bricks at all.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box } from './entities';
import { taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;

/** n bricks stacked in a pyramid, centred at (cx, base) */
function bricks(ctx: CanvasRenderingContext2D, cx: number, base: number, n: number) {
  if (n === 0) {
    ctx.fillStyle = '#F5E6C0';
    ctx.font = '800 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', cx, base - 2);
    return;
  }
  let k = 0;
  for (let row = 0; k < n; row++) {
    const inRow = Math.min(n - k, 4 - row > 0 ? 4 - row : 1);
    for (let i = 0; i < inRow; i++) {
      const x = cx - (inRow * 7) / 2 + i * 7;
      box(ctx, x, base - 5 - row * 5, 6, 4, '#B5502F');
      box(ctx, x, base - 5 - row * 5, 6, 1, '#D97A4E');
    }
    k += inRow;
  }
}

/** the cell: an arch in the brick wall behind the courtyard, with its bricks over it */
function cellArt(w: World, cx: number, n: number, wall = true) {
  w.add(
    new Paint((ctx) => {
      if (wall) {
        box(ctx, cx - 22, FL - 56, 44, 56, '#9C5A3C');
        box(ctx, cx - 22, FL - 56, 44, 3, '#C07A55');
      }
      ctx.fillStyle = '#2B1A10';
      ctx.beginPath();
      ctx.moveTo(cx - 10, FL);
      ctx.lineTo(cx - 10, FL - 24);
      ctx.arc(cx, FL - 24, 10, Math.PI, 0);
      ctx.lineTo(cx + 10, FL);
      ctx.fill();
      bricks(ctx, cx, FL - 40, n);
    }, -5),
  );
}

/** a well in a cell: the hazard under its pit */
function well(w: World, x0: number, x1: number) {
  w.add(
    new Rig(x0, 256, x1 - x0, 30, {
      layer: 4,
      cause: 'pat-kua',
      inset: 0,
      paint: (ctx, r) => {
        ctx.fillStyle = '#1B140E';
        ctx.fillRect(r.x, r.y, r.w, 30);
        ctx.fillStyle = 'rgba(80,120,160,0.6)';
        ctx.fillRect(r.x + 2, r.y + 8, r.w - 4, 2);
      },
    }),
  );
}

export interface Landing {
  /** world px of the cell's centre */
  cx: number;
  n: number;
  safe: boolean;
}

/** a hatch (a flush plate in the courtyard floor): stepping on it takes Dad to where `dest` says */
function hatch(w: World, x: number, n: number, dest: () => { x: number; y: number } | null, key: string) {
  const r = w.add(
    new Rig(x, FL - 2, 32, 2, {
      layer: 1,
      tick: (_r, w2) => {
        const p = w2.player;
        if (p.onGround && p.cx >= x + 2 && p.cx < x + 30 && p.y + p.h >= FL - 1 && p.y + p.h <= FL + 1) {
          const d = dest();
          if (d) {
            w2.warp(d.x - 5, d.y, 'blink');
            w2.sfx('slide', d.x, d.y);
          }
        }
      },
      paint: (ctx, h) => {
        box(ctx, h.x, FL - 2, 32, 2, '#3A2A1E');
        box(ctx, h.x + 2, FL - 2, 28, 1, '#7A5A3A');
        for (let i = 0; i < 5; i++) box(ctx, h.x + 3 + i * 6, FL - 1, 3, 1, '#C9A56B');
        bricks(ctx, h.x + 16, FL - 18, n);
      },
    }),
  );
  (w.flags[key] ??= []).push({ x, n });
  return r;
}

export function room(): LevelDef {
  const HATCH: [number, number][] = [
    [7, 2],
    [12, 4],
    [17, 1],
    [22, 3],
  ];
  return {
    id: 'PAT-08',
    city: 'PAT',
    index: 8,
    name: 'Nalanda',
    nameEn: 'The brick university',
    tagline: 'Rows of identical cells. Nobody told you to count.',
    hint: 'The wall ahead is too high, and the only way on is through a hatch in the floor. Each hatch has bricks drawn over it, and takes you to the cell with the same number of bricks in the next courtyard. Only the cell with three bricks stands on solid ground: the others have a well in them. Jump the other hatches and step on the one with three bricks.',
    par: 30,
    map: (() => {
      const g = Grid.ground(15).fill(28, 29, 0, 14, '#').put(1, 14, '@').put(30, 14, 'E');
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      w.flags.pat8 = [];
      w.flags.pat8L = [] as Landing[];
      for (const [c, n] of HATCH)
        hatch(
          w,
          px(c),
          n,
          () => {
            const L2 = (w.flags.pat8L as Landing[]).find((l) => l.n === n);
            return L2 ? { x: L2.cx, y: FL - 14 } : null;
          },
          'pat8',
        );
      w.add(
        new Paint((ctx) => {
          // the courtyard: a brick wall behind, a stone well-head, the high wall at the end
          box(ctx, px(28), 0, 32, FL, '#8A4A30');
          for (let y = 0; y < FL; y += 8) box(ctx, px(28), y, 32, 1, '#6B3A22');
        }, -3),
      );
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.win[1], 2.4);
          },
        }),
      );
      sign(w, 2.4, 10.4, 3.4, 'NALANDA', 'shop', null, 'brick monastery');
      rival(w, 26, 15, -1, taraScript(8));
      collectible(w, 'pat-pittu', 19.5, 11.4);
    },
  };
}

export const act: Act = {
  id: 'pat08-chowk',
  w: 34,
  advice: 'The next courtyard: four cells, each with its bricks, and wells in all but one. You came up in the one with three bricks. Walk on, and hop the well in the last cell.',
  cps: [],
  paint: (g, c) => {
    // wells in the cells with 1, 2 and 4 bricks (2 tiles wide each)
    for (const x of [3, 9, 24]) g.fill(c.x + x, c.x + x + 1, 15, 17, '.');
  },
  build: (w, c) => {
    const lands: Landing[] = [
      { n: 1, cx: c.X(3) + 16, safe: false },
      { n: 2, cx: c.X(9) + 16, safe: false },
      { n: 3, cx: c.X(16) + 8, safe: true },
      { n: 4, cx: c.X(24) + 16, safe: false },
    ];
    (w.flags.pat8L as Landing[]).push(...lands);
    for (const l of lands) {
      cellArt(w, l.cx, l.n);
      if (!l.safe) well(w, l.cx - 16, l.cx + 16);
    }
    // a wall of bricks behind the whole courtyard
    sign(w, c.x + 28, 10.4, 3.2, 'CHOWK', 'shop', null, 'courtyard');
  },
};

export const ending: Ending = {
  space: 18,
  advice: 'The library mound: three more hatches, with bricks, are decoys and send you back to the start of the courtyard. The door is the cell with no bricks at all: jump the hatches and walk in.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'mound';
    const start = px(D - 16);
    w.flags.pat8e = [];
    for (const [off, n] of [
      [13, 3],
      [9, 1],
      [5, 2],
    ] as [number, number][])
      hatch(w, px(D - off), n, () => ({ x: start + 8, y: FL - 14 }), 'pat8e');
    w.add(
      new Paint((ctx) => {
        // the zero cell is the door: its lintel says nothing at all
        bricks(ctx, d.x + 8, FL - 40, 0);
        box(ctx, d.x - 8, FL - 54, 32, 3, '#C07A55');
      }, -4),
    );
  },
};

export const meta08 = { family: 'count-bricks-routes-cells', betrayals: ['count-routing'], ending: 'pat-mound' };
