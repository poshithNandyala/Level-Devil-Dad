// KOH-10 Subah Kisama (finale): the morning run to the Hornbill ground, and every callback BREAKS a rule the earlier
// stages taught (TROLL-BIBLE law 7). The tour said nothing laid across a drain is a bridge: here the rod is lashed to
// its brackets and is the only way over a drain too wide to jump. Chaal-Chaal said thatch is the floor and tin rings:
// this house is empty for the festival (dark windows, no hatch), its thatch is rotten and the tin is the floor. Kath ka
// Gari said ride, never walk: this lane climbs, so a boarded cart rolls BACK into the wall, and the paved lane is for
// walking. Dhol Gach said step off at the surge that first touches the bank: the first thing it touches here is a raft
// that sinks under a man; stay aboard to the real bank. The door: the great morung gate, which opens for a man who
// stands still before it (Kisama said keep moving).
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, bamboo, ditch, since, taraScript } from './common';
import { lines as L, NPC } from './lines';
import { roof } from './s06';
import { DECK_W, DECK_Y } from './s07';
import { ford, log } from './s05';

/** the lashed rod: a bamboo across the drain from column c0 to c1, tied at both ends; it is a bridge this time */
function lashedRod(w: World, c0: number, c1: number) {
  // its solid is flush with the lane (Dad walks on to it); drawn a little above
  w.add(
    new Rig(px(c0) - 4, FL, px(c1) - px(c0) + 8, 6, {
      solid: true,
      layer: 2,
      paint: (ctx, r) => {
        bamboo(ctx, r.x, r.y - 5, r.w, 6);
        // the lashings
        box(ctx, r.x + 2, r.y - 7, 4, 10, '#C0392B');
        box(ctx, r.x + r.w - 6, r.y - 7, 4, 10, '#C0392B');
      },
    }),
  );
}

/** rotten thatch at x px, width wd, top y: it holds for 0.15 s and then gives */
function rottenThatch(w: World, x: number, wd: number, y: number) {
  const st = { onT: -1, gone: false };
  w.add(
    new Rig(x, y, wd, 8, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        if (st.gone) return;
        if (w2.standing(r.solid!)) {
          if (st.onT < 0) {
            st.onT = w2.tick;
            w2.sfx('creak', r.x + wd / 2, y);
          }
          if (since(w2, st.onT) > 0.15) {
            st.gone = true;
            r.setSolid(false);
            w2.sfx('collapse', r.x + wd / 2, y);
          }
        }
        r.s.gone = st.gone;
      },
      paint: (ctx, r) => {
        if (r.s.gone) {
          box(ctx, r.x, r.y, r.w, 2, '#6E5A3A');
          return;
        }
        box(ctx, r.x, r.y, r.w, r.h, '#8A7A4A');
        box(ctx, r.x, r.y, r.w, 2, '#A89A6A');
        ctx.fillStyle = '#4E4028';
        for (let k = 3; k < r.w - 3; k += 6) ctx.fillRect(r.x + k, r.y + 3, 2, 4);
      },
    }),
  );
  w.add(
    new Rig(x, y + 8, wd, 40, {
      layer: 1,
      cause: 'koh-sadi',
      inset: 0,
      live: () => st.gone,
      paint: () => {},
    }),
  );
}

const Y1 = FL - 48;
const step = (w: World, c: number) => w.add(new Rig(px(c), FL - 24, 16, 24, { solid: true, layer: 2, paint: (ctx, r) => box(ctx, r.x, r.y, r.w, r.h, '#6E4F3A') }));

export function room(): LevelDef {
  return {
    id: 'KOH-10',
    city: 'KOH',
    index: 10,
    name: 'Subah Kisama',
    nameEn: 'Morning at Kisama',
    tagline: 'The run to the Hornbill ground. Everything you learned, backwards.',
    hint: 'The rod across the drain is lashed to its brackets this time: walk it. The house beyond is empty for the festival (dark windows, no one home): its thatch is rotten and gives after a step, and its tin is the floor, rung or not. Hop from the step to the tin, and from tin to tin, low: the eaves still hang over them.',
    par: 40,
    map: Grid.ground(15).fill(6, 11, 15, 17, '.').fill(15, 26, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      ditch(w, px(6), px(12), 'koh-nala');
      lashedRod(w, 6, 12);
      // the empty house: a step up, rotten thatch, tin, rotten thatch, tin, down
      ditch(w, px(15), px(27), 'koh-gira', FL + 8, ['rgba(70,60,50,0.95)', 'rgba(30,24,18,0.98)']);
      step(w, 14);
      rottenThatch(w, px(15), 48, Y1);
      roof(w, px(18), 48, Y1, 'tin', 'koh10t1', { eave: 70, empty: true });
      rottenThatch(w, px(21), 48, Y1);
      roof(w, px(24), 48, Y1, 'tin', 'koh10t2', { eave: 70, empty: true });
      // nobody home: the household is at the festival, so the tin rings to an empty house (no hatch)
      w.flags.koh10empty = true;
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[1], 2.4);
          },
        }),
      );
      w.when(
        (w2) => w2.player.cx > px(13),
        (w2) => w2.guide(NPC.rasta),
      );
      sign(w, 2, 10.4, 3.4, 'KISAMA ROAD', 'shop', null, 'the festival');
      rival(w, 28, 15, -1, taraScript(10));
      collectible(w, 'koh-galho', 9, 11.6);
    },
  };
}

/** the uphill lane: the cart rolls BACK when boarded, into the wall behind; the paved lane is for walking */
export const actUltaGari: Act = {
  id: 'koh10-ulta-gari',
  w: 30,
  advice: 'A cart waits as before, but this lane climbs: stand on the plank and it rolls backwards into the wall. The lane is paved here, not scree. Walk it.',
  cps: [],
  build: (w, c) => {
    const x0 = px(c.x + 10);
    const st = { v: 0, going: false };
    const deck: Rig = w.add(
      new Rig(x0, DECK_Y, DECK_W, 6, {
        solid: true,
        layer: 2,
        cause: 'koh-takkar',
        inset: 0,
        live: (r: Rig) => st.going && r.x <= px(c.x + 4) + 4,
        tick: (r, w2) => {
          if (!st.going && w2.standing(r.solid!)) {
            st.going = true;
            w2.sfx('creak', r.x, r.y);
          }
          if (st.going && r.x > px(c.x + 4)) {
            st.v = Math.min(st.v + 180 / 120, 220);
            const nx = Math.max(px(c.x + 4), r.x - st.v / 120);
            r.solid!.velX = -st.v;
            if (nx !== r.x) r.moveTo(w2, nx, DECK_Y);
            if (nx <= px(c.x + 4)) w2.sfx('crack', nx, FL - 10);
          }
        },
        paint: (ctx, r) => {
          ctx.fillStyle = '#2B1A12';
          ctx.beginPath();
          ctx.arc(r.x + 9, FL - 5, 5, 0, Math.PI * 2);
          ctx.arc(r.x + DECK_W - 9, FL - 5, 5, 0, Math.PI * 2);
          ctx.fill();
          box(ctx, r.x, r.y - 6, DECK_W, 5, '#A1887F');
          box(ctx, r.x + DECK_W - 3, r.y - 14, 3, 10, '#6D4C41');
        },
      }),
    );
    // the front board keeps a rider on the plank while it rolls back
    w.add(
      new Rig(x0 + DECK_W - 3, DECK_Y - 10, 3, 10, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const nx = deck.x + DECK_W - 3;
          if (nx !== r.x) r.moveTo(w2, nx, DECK_Y - 10);
        },
        paint: () => {},
      }),
    );
    // the wall behind the cart (a house wall at the back of the lane), and the crushing when the cart reaches it with a rider
    w.add(
      new Rig(px(c.x + 3), FL - 60, 16, 60, {
        layer: -1,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, r.h, '#8C5A3C');
          for (let k = 0; k < r.h; k += 8) box(ctx, r.x, r.y + k, r.w, 1, '#5A3A28');
        },
      }),
    );
    w.add(
      new Rig(px(c.x + 4), FL - 30, 56, 30, {
        layer: 1,
        cause: 'koh-takkar',
        inset: 0,
        live: (_r, w2) => st.going && deck.x <= px(c.x + 4) + 2 && w2.standing(deck.solid!),
        paint: () => {},
      }),
    );
    w.add(
      new Paint((ctx) => {
        // the paved lane: flagstones
        for (let x = px(c.x + 2); x < px(c.x + 29); x += 14) box(ctx, x, FL - 2, 12, 2, '#9A8A7A');
        folk(ctx, px(c.x + 8), FL - 26, 26, '#E0B04A');
      }, -1),
    );
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.cold),
    );
    sign(w, c.x + 1, 10.4, 3, 'CHADHAI', 'shop', null, 'uphill');
  },
};

/** the ford again: the crew hauls as before, but the first thing the log touches is a raft that sinks under a man; the bank is beyond it */
export const actBera: Act = {
  id: 'koh10-bera',
  w: 32,
  advice: 'The crew hauls the log as at Dhol Gach, and the first thing its surge touches is a raft tied in the ford: it sinks under a man. Stay aboard: the next surge reaches the bank, and there is no lintel here.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 24, 15, 17, '.');
  },
  build: (w, c) => {
    ford(w, c.x + 4, c.x + 24);
    log(w, c.x + 4, c.x + 25, c.x + 29, c.f('log'), { P: 1.4, surge: 4, roll: 2.5, bank: 999 });
    // the raft: a float the log's first top reaches; it sinks 0.3 s after a man stands on it
    const rx = px(c.x + 13);
    const st = { onT: -1 };
    w.add(
      new Rig(rx, FL, 40, 8, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          if (w2.standing(r.solid!) && st.onT < 0) {
            st.onT = w2.tick;
            w2.sfx('splash', r.x + 20, FL);
          }
          if (st.onT >= 0) {
            const k = Math.min(1, since(w2, st.onT) / 0.35);
            const ny = FL + Math.round(k * 20);
            if (ny !== r.y) r.moveTo(w2, r.x, ny);
          }
        },
        paint: (ctx, r) => {
          bamboo(ctx, r.x, r.y, r.w, 4);
          bamboo(ctx, r.x, r.y + 4, r.w, 4);
        },
      }),
    );
    w.when(
      (w2) => w2.player.cx > px(c.x + 2),
      (w2) => w2.guide(NPC.loghat),
    );
    sign(w, c.x + 1, 10.4, 3, 'BERA', 'shop', null, 'the raft');
  },
};

export const ending: Ending = {
  space: 12,
  advice: 'The great morung gate opens for a man who stands still before it: walk up to it and wait. (Kisama said keep moving. Not here.)',
  build(w, d) {
    w.flags.twist = 'morung-gate';
    const st = { still: 0, open: false };
    w.flags.koh10gate = st;
    w.add(
      new Rig(d.x - 4, FL - 60, 24, 60, {
        solid: true,
        layer: 3,
        tick: (r, w2) => {
          const p = w2.player;
          if (!st.open) {
            if (p.onGround && Math.abs(p.vx) < 5 && p.cx > d.x - 60 && p.cx < d.x) st.still += 1 / 120;
            else st.still = 0;
            if (st.still >= 0.8) {
              st.open = true;
              r.setSolid(false);
              w2.sfx('creak', d.x, FL - 30);
            }
          }
          r.s.open = st.open;
        },
        paint: (ctx, r) => {
          if (r.s.open) {
            box(ctx, r.x - 6, FL - 70, 36, 10, '#4E3B2A');
            return;
          }
          box(ctx, r.x, r.y, r.w, r.h, '#5D4037');
          box(ctx, r.x - 6, FL - 70, 36, 10, '#4E3B2A');
          for (let k = 8; k < r.h; k += 10) box(ctx, r.x + 3, r.y + k, r.w - 6, 2, '#3E2723');
        },
      }),
    );
    w.add(
      new Paint((ctx) => {
        folk(ctx, d.x + 36, FL - 26, 26, '#C0392B');
        folk(ctx, d.x + 48, FL - 26, 26, '#1B1B1B');
      }, -3),
    );
  },
};

export const meta10 = { family: 'finale-run-to-hornbill-ground', betrayals: ['hornbill-ground-run'], ending: 'koh-morung-gate' };
