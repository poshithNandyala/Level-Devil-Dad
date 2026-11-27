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
import { log } from './s05';
import { type Pot, crow, pot, wire } from './s08';

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

export function room(): LevelDef {
  return {
    id: 'KOH-10',
    city: 'KOH',
    index: 10,
    name: 'Subah Kisama',
    nameEn: 'Morning at Kisama',
    tagline: 'The run to the Hornbill ground. Everything you learned, backwards.',
    hint: 'The rod across the drain is lashed to its brackets this time: walk it. The house beyond is empty for the festival (dark windows, no one home): the tin is the floor, rung or not, and the thatch past the first tin is rotten and gives after a step. Jump up on to the first roof, walk the tin, hop the rotten thatch low: the eaves still hang over the tin.',
    par: 40,
    map: Grid.ground(15).fill(6, 11, 15, 17, '.').fill(15, 26, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      // the axone pot comes along to the festival (its lid matters again at the stall's puppy)
      pot(w);
      ditch(w, px(6), px(12), 'koh-nala');
      lashedRod(w, 6, 12);
      // the empty house: a step up, rotten thatch, tin, rotten thatch, tin, down
      ditch(w, px(15), px(27), 'koh-gira', FL + 8, ['rgba(70,60,50,0.95)', 'rgba(30,24,18,0.98)']);
      roof(w, px(15), 48, Y1, 'thatch', 'koh10h');
      roof(w, px(18), 48, Y1, 'tin', 'koh10t1', { eave: 64, empty: true });
      rottenThatch(w, px(21), 48, Y1);
      roof(w, px(24), 48, Y1, 'tin', 'koh10t2', { eave: 64, empty: true });
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
  advice: 'A cart waits as before, but this lane climbs: stand on the plank and it rolls backwards into the wall. The lane is paved here, not scree: walk it. Higher up a second cart is chocked; when the chock gives it comes down the lane at you. Hop it. A cart coming at you is not a ride.',
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
    // a second cart is chocked higher up the lane; once you are past the first, the chock gives and it comes DOWN the lane
    // at you: a cart coming at you is a thing to hop, not a thing to board
    const x2 = px(c.x + 24);
    const loose = { going: false, t0: -1, done: false, x: x2 };
    w.flags[c.f('loose')] = loose;
    w.add(
      new Rig(x2, DECK_Y - 6, DECK_W, 12, {
        layer: 2,
        cause: 'koh-bhagti-gari',
        inset: 2,
        live: () => loose.going && !loose.done,
        tick: (r, w2) => {
          const p = w2.player;
          if (!loose.going && p.cx > px(c.x + 13.5)) {
            loose.going = true;
            loose.t0 = w2.tick;
            w2.sfx('crack', x2, FL - 10);
            w2.say('Gari! Gari! | The cart! The cart!', x2, FL - 40, 0.8, 'npc');
          }
          if (loose.going && !loose.done) {
            r.x -= 190 / 120;
            if (r.x <= deck.x + DECK_W + 2) {
              loose.done = true;
              w2.sfx('thud', r.x, FL - 6);
            }
          }
          loose.x = r.x;
        },
        paint: (ctx, r) => {
          ctx.fillStyle = '#2B1A12';
          ctx.beginPath();
          ctx.arc(r.x + 9, FL - 5, 5, 0, Math.PI * 2);
          ctx.arc(r.x + DECK_W - 9, FL - 5, 5, 0, Math.PI * 2);
          ctx.fill();
          box(ctx, r.x, FL - 12, DECK_W, 5, '#A1887F');
          box(ctx, r.x, FL - 20, 3, 10, '#6D4C41');
          // the chock, until it gives
          if (!loose.going) box(ctx, r.x - 5, FL - 6, 5, 6, '#5D4037');
        },
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
    // the ford's water sits a little lower here, so the raft (3 px under the log's deck) has room to sink before the water bites
    ditch(w, px(c.x + 4), px(c.x + 25), 'koh-nala', FL + 10, ['rgba(120,150,150,0.9)', 'rgba(50,70,70,0.97)']);
    log(w, c.x + 4, c.x + 25, c.x + 29, c.f('log'), { P: 1.4, surge: 4, roll: 2.5, bank: 999 });
    // the raft: a float the log's first top reaches; it sinks 0.3 s after a man stands on it
    const rx = px(c.x + 13);
    const st = { onT: -1 };
    w.add(
      new Rig(rx, FL + 3, 40, 8, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          if (w2.standing(r.solid!) && st.onT < 0) {
            st.onT = w2.tick;
            w2.sfx('splash', r.x + 20, FL);
          }
          if (st.onT >= 0) {
            const k = Math.min(1, since(w2, st.onT) / 0.5);
            const ny = FL + 3 + Math.round(k * 20);
            if (ny !== r.y) r.moveTo(w2, r.x, ny);
            // whoever is still on it when it is under: the raft took him down (its own death, not the ford's)
            const p = w2.player;
            const over = p.cx > r.x - 2 && p.cx < r.x + r.w + 2 && p.y + p.h >= r.y - 8;
            if (k >= 0.15 && over) w2.die('koh-bera');
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

/**
 * the show rope (02's callback): a tug-of-war demonstration over a ditch; the mat heaves a little each way and never
 * reaches a bank, and this rope carries a TEAM flag at each end of the mat and none in the middle; stand behind a flag
 * (02's habit) and you are on an end, which dips; and the bout ends on the whistle, when both teams drop the rope.
 */
function showMat(w: World, c0: number, key: string, o: { bout: number }) {
  const W = 64;
  const x0 = px(c0);
  const st = { t0: -1, endT: -1, dropped: false, x: x0 };
  w.flags[key] = st;
  const rig = w.add(
    new Rig(x0, FL, W, 8, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        const p = w2.player;
        if (st.dropped) {
          if (r.y < FL + 40) r.moveTo(w2, r.x, r.y + 3);
          return;
        }
        const on = w2.standing(r.solid!);
        if (st.t0 < 0 && on) st.t0 = w2.tick;
        if (st.t0 >= 0) {
          const t = since(w2, st.t0);
          // a heave each way every 1.2 s, 12 px, and back: a show, not a contest
          const k = Math.sin((t / 1.2) * Math.PI);
          const nx = Math.round(x0 + 12 * k);
          r.solid!.velX = (nx - r.x) * 120;
          if (nx !== r.x) r.moveTo(w2, nx, FL);
          if (t >= o.bout) {
            st.dropped = true;
            r.setSolid(false);
            w2.sfx('whistle', r.x + W / 2, FL - 40);
            w2.say('Bas! | Enough!', r.x + W / 2, FL - 46, 0.8, 'npc');
          }
        }
        // the ends are the teams' ends: stand on one for a third of a second and it dips
        const onEnd = on && (p.cx < r.x + 14 || p.cx > r.x + W - 14);
        if (onEnd) {
          if (st.endT < 0) st.endT = w2.tick;
          else if (since(w2, st.endT) > 0.3) {
            w2.sfx('splash', p.cx, FL);
            w2.die('koh-jhanda');
          }
        } else st.endT = -1;
        st.x = r.x;
      },
      paint: (ctx, r, w2) => {
        // the mat, the rope through it, a red team flag at each end
        box(ctx, r.x, r.y - 4, r.w, 5, '#C9B870');
        box(ctx, r.x, r.y - 4, r.w, 1, '#E6D898');
        box(ctx, r.x - 60, r.y - 2, r.w + 120, 2, '#8A7A3A');
        for (const fx of [r.x + 4, r.x + r.w - 7]) {
          box(ctx, fx, r.y - 22, 1, 18, '#5D4037');
          box(ctx, fx + 1, r.y - 22, 7, 5, '#C0392B');
        }
        // the teams, pulling on the beat
        const lean = st.t0 < 0 ? 0 : Math.sin((since(w2, st.t0) / 1.2) * Math.PI) * 3;
        for (let i = 0; i < 3; i++) folk(ctx, r.x - 70 - i * 12 - lean, FL - 26, 26, i % 2 ? '#C0392B' : '#1B1B1B');
        for (let i = 0; i < 3; i++) folk(ctx, r.x + r.w + 70 + i * 12 - lean, FL - 26, 26, i % 2 ? '#E0B04A' : '#1B1B1B');
        // the referee with the whistle
        folk(ctx, r.x + r.w / 2, FL - 86, 22, '#F2EFE4');
      },
    }),
  );
  return { st, rig };
}

export const actJhanda: Act = {
  id: 'koh10-jhanda',
  w: 30,
  advice: 'The festival’s tug-of-war is a show over a ditch, and this mat has a team flag at each end and none in the middle. The ends dip; the teams are matched and the mat never reaches a bank; and at the whistle both teams drop the rope. Walk straight across the middle, in one go.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 10, c.x + 15, 15, 17, '.');
  },
  build: (w, c) => {
    ditch(w, px(c.x + 10) - 6, px(c.x + 16) + 6, 'koh-nala', FL + 10);
    showMat(w, c.x + 11, c.f('mat'), { bout: 6 });
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.rasta),
    );
    sign(w, c.x + 1, 10.4, 3, 'RASSI SHOW', 'shop', null, 'a show');
  },
};

/**
 * the stall's plank (03's callback): a seesaw over the water with a prize sack on the far end and nobody to throw; the
 * near tip, where 03 taught you to land, is rotten and breaks under a landing; a landing on the far half dips it into
 * the water. The plank is a walkway: walk it.
 */
function stallPlank(w: World, c0: number, key: string) {
  const x0 = px(c0);
  const L = 96;
  const st = { tipGone: false, dipT: -1, wasAir: false };
  w.flags[key] = st;
  // the near tip (rotten), the near half, the far half
  const tip = w.add(
    new Rig(x0, FL - 4, 14, 5, {
      solid: true,
      layer: 2,
      paint: (ctx, r) => {
        if (st.tipGone) return;
        box(ctx, r.x, r.y, r.w, r.h, '#9A8A4A');
        ctx.fillStyle = '#4E4028';
        for (let k = 2; k < r.w - 2; k += 4) ctx.fillRect(r.x + k, r.y + 1, 1, 3);
      },
    }),
  );
  w.add(new Rig(x0 + 14, FL - 4, L / 2 - 14, 5, { solid: true, layer: 2, paint: (ctx, r) => box(ctx, r.x, r.y, r.w, r.h, '#C9B870') }));
  const far = w.add(
    new Rig(x0 + L / 2, FL - 4, L / 2, 5, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        if (st.dipT >= 0) {
          const t = since(w2, st.dipT);
          const k = t < 0.4 ? t / 0.4 : t < 1.2 ? 1 : Math.max(0, 1 - (t - 1.2) / 0.5);
          const ny = FL - 4 + Math.round(k * 26);
          if (ny !== r.y) r.moveTo(w2, r.x, ny);
          if (t > 1.7) st.dipT = -1;
        }
      },
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, r.h, '#C9B870');
        // the prize sack on the far end
        box(ctx, r.x + r.w - 16, r.y - 14, 14, 14, '#8D5524');
        box(ctx, r.x + r.w - 12, r.y - 17, 6, 4, '#C9A24B');
      },
    }),
  );
  w.onTick((w2) => {
    const p = w2.player;
    const landed = p.onGround && st.wasAir;
    st.wasAir = !p.onGround;
    if (!landed) return;
    if (!st.tipGone && w2.standing(tip.solid!)) {
      st.tipGone = true;
      tip.setSolid(false);
      w2.sfx('snap', tip.x + 7, FL - 4);
      w2.die('koh-tuta-sira');
      return;
    }
    if (st.dipT < 0 && w2.standing(far.solid!)) {
      st.dipT = w2.tick;
      w2.sfx('creak', far.x + 20, FL - 4);
    }
  });
  w.add(
    new Paint((ctx) => {
      // the post under the middle
      box(ctx, x0 + L / 2 - 3, FL - 1, 6, 14, '#5D4037');
    }, -1),
  );
  return st;
}

export const actTutaSira: Act = {
  id: 'koh10-tuta-sira',
  w: 28,
  advice: 'A stall’s seesaw over the water, a prize sack on the far end and nobody to throw. The near tip, where you learned to land, is rotten and breaks under a landing; a landing on the far half dips it into the water. It is a walkway: walk on to it and across.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 9, c.x + 15, 15, 17, '.');
  },
  build: (w, c) => {
    ditch(w, px(c.x + 9) - 4, px(c.x + 16) + 4, 'koh-nala', FL + 10);
    stallPlank(w, c.x + 9, c.f('plank'));
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.thik),
    );
    sign(w, c.x + 1, 10.4, 3, 'MELA JHULA', 'shop', null, 'the stall');
  },
};

/** the stall's puppy (08's callback): he LOVES axone; an open pot within 4.5 tiles and he runs at you and trips you */
function pilla(w: World, c: number, key: string) {
  const x0 = px(c);
  const st = { mode: 'sit' as 'sit' | 'run' | 'done' };
  w.flags[key] = st;
  w.add(
    new Rig(x0, FL - 10, 12, 10, {
      layer: 3,
      cause: 'koh-pilla',
      inset: 1,
      live: () => st.mode === 'run',
      tick: (r, w2) => {
        const p = w2.player;
        const lid = (w2.flags.koh8 as Pot).lid;
        const d = p.cx - (r.x + 6);
        if (st.mode === 'sit' && !lid && Math.abs(d) < 72) {
          st.mode = 'run';
          w2.sfx('monkey', r.x, r.y);
        }
        if (st.mode === 'run') {
          r.x += Math.sign(d) * (210 / 120);
          if (Math.abs(d) > 150) st.mode = 'done';
        }
        r.s.mode = st.mode;
      },
      paint: (ctx, r, w2) => {
        ctx.fillStyle = '#D7A86E';
        ctx.fillRect(r.x + 1, r.y + 3, 9, 5);
        ctx.fillRect(r.x + 8, r.y, 4, 5);
        // the wagging tail: the tell that he likes it
        ctx.fillStyle = '#B07A52';
        ctx.fillRect(r.x - 3 + ((w2.tick >> 2) % 2) * 2, r.y + 1, 4, 2);
        ctx.fillStyle = '#1B1B1B';
        ctx.fillRect(r.x + 10, r.y + 1, 1, 1);
      },
    }),
  );
  return st;
}

export const actPilla: Act = {
  id: 'koh10-pilla',
  w: 32,
  advice: 'The stall’s puppy loves axone: an open pot within a few tiles and he runs at you and trips you, so pass him lidded (stand still first). The crows on the wire past him are the same as ever: they dive at a lidded walker, so hop once after the puppy and walk under them open.',
  cps: [],
  build: (w, c) => {
    pilla(w, c.x + 11, c.f('pilla'));
    wire(w, c.x + 20, c.x + 28);
    crow(w, c.x + 22, c.f('c1'));
    crow(w, c.x + 26, c.f('c2'));
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.bhat),
    );
    sign(w, c.x + 1, 10.4, 3, 'PILLA', 'shop', null, 'the puppy');
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
