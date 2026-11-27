// ITA-10 Subah (finale): dawn on the Siang, and the fort's bricks are being carried over the cane bridge to the new
// wall. Callbacks only (docs/allocation.json slot 10: one-lane bridge, bricks, sluice, fruit baskets), and each one
// turns the rule its stage taught against the player (TROLL-BIBLE law 7):
//   room  (02) a brick porter over the DEEP bay loses his load and follows it in: the bay that cleared you takes him
//   act A (02) his pile sheds off the back as he clears the shallow bay: don't chase the gate behind him; the shed
//              bricks lie on the span and hold the gate open, so there is no rush
//   act B (09) the spiked stub stands under the fort's arch and its loose brick: hopping the stub lands you under it;
//              pull the stub down too and walk under
//   act C (06) the sluice gate here is held by the pour alone and drops the moment it stops; the water goes over the
//              top into the river beyond: go through UNDER the pour, not after it
//   act D (04) the stair is already hung (empty baskets at step height) and the tree already shaken (every notch
//              lit): climb; one shake and the harvester's basket comes down on the shaker
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, brick, folk, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';
import { carveBay, deck, type Deck } from './s02';
import { wall } from './s09';
import { carveTanks, paddies } from './s06';

// ------------------------------------------------------------------ the room: the deep bay takes the porter
export interface Heap {
  /** tick the porter went in (-1: not yet) */
  t: number;
  /** settled: the bay is filled and solid */
  done: boolean;
}
const FALL = 0.5;

/** the porter with a head-load of bricks: over the deep bay at column `bay` he loses the lot and follows it in */
function brickPorter(w: World, st: Deck, bay: number, key: string) {
  const heap: Heap = { t: -1, done: false };
  w.flags[key] = heap;
  const porter = st.porters[0];
  // the heap: bricks and the man, falling into the bay, then a filled bay (a floor)
  w.add(
    new Rig(px(bay), FL - 40, 32, 72, {
      layer: 3,
      solid: true,
      cause: 'ita-dher',
      inset: 0,
      live: (r) => r.s.live === true,
      tick: (r, w2) => {
        if (heap.t < 0) {
          r.setSolid(false);
          r.s.live = false;
          // his centre over the bay: the pile goes, and he goes after it
          if (porter.on && porter.x + 6 < px(bay + 2) - 2) {
            heap.t = w2.tick;
            porter.alive = false;
            porter.on = false;
            w2.sfx('crack', porter.x, FL - 20);
            w2.sfx('splash', porter.x, FL + 10);
          }
          return;
        }
        const k = Math.min(1, since(w2, heap.t) / FALL);
        r.s.k = k;
        r.y = FL - 40 + 40 * k * k;
        r.s.live = since(w2, heap.t) < FALL + 0.25;
        if (k >= 1 && !heap.done) {
          heap.done = true;
          // the bay is bricked up: a floor flush with the deck
          r.y = FL;
          r.h = 32;
          if (r.solid) {
            r.solid.y = FL;
            r.solid.h = 32;
          }
          r.setSolid(true);
        }
      },
      paint: (ctx, r, w2) => {
        if (heap.t < 0) return;
        const k = (r.s.k ?? 0) as number;
        if (!heap.done) {
          // bricks tumbling, the man under them
          for (let i = 0; i < 5; i++) brick(ctx, r.x + 2 + (i % 3) * 10, r.y + (i >> 1) * 10 + (i % 2) * 6, 10, 7, false, 0.3 * i - k);
          folk(ctx, r.x + 20, r.y + 30, 24, '#8A4A2A');
          return;
        }
        box(ctx, r.x, FL, 32, 32, '#7A3A26');
        for (let row = 0; row < 2; row++) for (let i = 0; i < 2; i++) brick(ctx, r.x + i * 16, FL + row * 16, 16, 16, false, 0);
        // a hand and a hat sticking out: he is fine, and cross
        box(ctx, r.x + 22, FL + 2, 6, 3, '#B07A52');
        if ((w2.tick >> 4) % 2 === 0) box(ctx, r.x + 8, FL + 4, 8, 3, '#C9B06A');
      },
    }),
  );
  return heap;
}

const BAY = 15;

export function room(): LevelDef {
  return {
    id: 'ITA-10',
    city: 'ITA',
    index: 10,
    name: 'Subah',
    nameEn: 'Dawn',
    tagline: 'First light on the Siang. The fort’s bricks are coming over the bridge.',
    hint: 'The cane bridge again, one lane, and the porter coming over it carries a head-load of bricks. You know the deep bay clears any porter: not this one. Over the deep bay the pile goes, and he goes in after it, on to whoever is in the bay. Stay on the deck short of the bay until he is in; the bay is bricked up then, and you cross over it.',
    par: 24,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
      g.fill(6, 25, 16, 17, '.');
      carveBay(g, BAY, true);
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      const st = deck(w, 6, 25, 7, [{ at: 0.3, v: 52 }], [{ c: BAY, deep: true }], 'ita10d');
      brickPorter(w, st, BAY, 'ita10');
      onPass(w, px(7), (w2) => tara(w2, L.intro[8], 2.4));
      w.add(new Paint((ctx) => folk(ctx, px(4) + 8, FL - 28, 28, '#F2D16B'), -1));
      onPass(w, px(3), (w2) => w2.say(NPC.ekEk, px(4) + 8, FL - 34, 2.2, 'npc'));
      sign(w, 2, 10.4, 3.4, 'SIANG PUL', 'shop', null, 'at first light');
      rival(w, 29, 15, -1, taraScript(10));
      collectible(w, 'ita-santra', 11, 11.4);
    },
  };
}

// ------------------------------------------------------------------ act A: the shed load and the gate
export interface Shed {
  t: number;
  done: boolean;
}
const SHED = 1.1;

/** the long span to the far bank's gate: the brick porter sheds bricks off the back as he steps up out of the shallow
 *  bay's dip, and the shed bricks on the span hold the gate open after him */
export const actPul: Act = {
  id: 'ita10-pul',
  w: 27,
  advice: 'The far bank’s gate hangs open while there is weight on the span, as before. The brick porter clears the shallow bay and his pile tips: the bricks come off the back of his load, on to whoever is climbing out behind him. Stay down until they have landed. They lie on the span then, and they hold the gate open: no rush.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 3, c.x + 22, 16, 17, '.');
    carveBay(g, c.x + 9, false);
  },
  build: (w, c) => {
    const bay = c.x + 9;
    const st = deck(w, c.x + 3, c.x + 22, c.x + 4, [{ at: 0.3, v: 54 }], [{ c: bay, deep: false }], 'ita10ad');
    const shed: Shed = { t: -1, done: false };
    w.flags.ita10a = shed;
    const porter = st.porters[0];
    // the shed bricks: deadly over the deck round the bay while they fall, then lying on the slats
    w.add(
      new Rig(px(bay - 1), FL - 44, 64, 42, {
        layer: 3,
        cause: 'ita-peeth',
        inset: 0,
        live: (r) => r.s.live === true,
        tick: (r, w2) => {
          if (shed.t < 0 && porter.on && porter.x + 6 < px(bay) - 20) {
            shed.t = w2.tick;
            w2.sfx('crack', porter.x + 12, FL - 30);
          }
          r.s.live = shed.t >= 0 && since(w2, shed.t) < SHED;
          if (shed.t >= 0 && since(w2, shed.t) >= SHED) shed.done = true;
        },
        paint: (ctx, r, w2) => {
          if (shed.t < 0) return;
          const k = Math.min(1, since(w2, shed.t) / SHED);
          if (k < 1) {
            for (let i = 0; i < 4; i++) brick(ctx, r.x + 6 + i * 14, FL - 40 + 36 * Math.min(1, k * 1.4 + i * 0.1), 12, 8, false, 0.4 * k * (i % 2 ? 1 : -1));
          } else {
            for (let i = 0; i < 4; i++) brick(ctx, r.x + 6 + i * 14, FL - 8 - (i % 2) * 4, 12, 8, false, 0.1 * (i % 2 ? 1 : -1));
          }
        },
      }),
    );
    // the gate: a cane bar before the far bank, up while someone (or his bricks) is on the span
    const gate = { down: 1 };
    w.flags.ita10ag = gate;
    const G = c.x + 24;
    w.add(
      new Rig(px(G), FL - 40, 8, 40, {
        layer: 3,
        solid: true,
        inset: 0,
        tick: (b, w2) => {
          const onSpan = porter.on && porter.x > px(c.x + 3) - 8;
          const target = onSpan || shed.t >= 0 ? 0 : 1;
          gate.down += (target - gate.down) * (target > gate.down ? 0.08 : 0.04);
          if (Math.abs(target - gate.down) < 0.01) gate.down = target;
          const h = Math.round(gate.down * 40);
          b.setSolid(gate.down > 0.5);
          b.moveTo(w2, px(G), FL - h);
          b.h = h;
          if (b.solid) b.solid.h = Math.max(1, h);
        },
        paint: (ctx, b) => {
          box(ctx, b.x, b.y, 8, b.h, '#C9B06A');
          box(ctx, b.x + 8, FL - 48, 3, 48, '#8A6A3A');
          box(ctx, b.x - 6, FL - 50 - Math.round((1 - gate.down) * 20), 20, 6, '#6B5A2A');
        },
      }),
    );
    sign(w, c.x + 1, 10.4, 3, 'LAMBA PUL', 'shop', null, 'the long span');
  },
};

// ------------------------------------------------------------------ act B: the stub under the arch
const ARCH_Y = FL - 16 - 54;

/** the fort's gate arch over the road right after the wall: a loose three-brick lintel section drops on whoever LANDS under it */
function arch(w: World, x0: number, key: string) {
  const st = { falling: false, t: 0 };
  w.flags[key] = st;
  let wasAir = false;
  w.add(
    new Rig(x0, ARCH_Y, 48, 14, {
      layer: 3,
      cause: 'ita-mehraab',
      inset: 0,
      live: () => st.falling,
      tick: (b, w2) => {
        const p = w2.player;
        const landed = wasAir && p.onGround && w2.state === 'play';
        wasAir = !p.onGround;
        if (!st.falling && landed && p.cx >= x0 - 6 && p.cx < x0 + 54) {
          st.falling = true;
          st.t = w2.tick;
          w2.sfx('crack', x0 + 24, ARCH_Y);
          // the deadly box is the whole column under the lintel while it comes down
          b.h = FL - ARCH_Y;
        }
        if (st.falling) {
          b.s.y = Math.min(FL - 14, ARCH_Y + since(w2, st.t) * 560);
          if (since(w2, st.t) > 0.45) {
            b.on = false;
            b.alive = false;
          }
        }
      },
      paint: (ctx, b) => {
        const y = st.falling ? ((b.s.y ?? ARCH_Y) as number) : ARCH_Y;
        for (let i = 0; i < 3; i++) brick(ctx, x0 + i * 16, y, 16, 14, false, st.falling ? 0.2 : -0.06 + 0.04 * i);
      },
    }),
  );
  w.add(
    new Paint((ctx) => {
      // two brick piers and the mortared parts of the lintel either side of the loose section
      for (let y = ARCH_Y; y < FL - 16; y += 14) {
        brick(ctx, x0 - 34, y, 16, 14, true);
        brick(ctx, x0 + 66, y, 16, 14, true);
      }
      brick(ctx, x0 - 34, ARCH_Y - 14, 16, 14, true);
      brick(ctx, x0 - 18, ARCH_Y - 14, 16, 14, true);
      brick(ctx, x0 - 16, ARCH_Y, 16, 14, true);
      for (let i = 0; i < 3; i++) brick(ctx, x0 + i * 16, ARCH_Y - 14, 16, 14, true);
      brick(ctx, x0 + 48, ARCH_Y, 16, 14, true);
      brick(ctx, x0 + 50, ARCH_Y - 14, 16, 14, true);
      brick(ctx, x0 + 66, ARCH_Y - 14, 16, 14, true);
      for (let y = FL - 16; y < FL; y += 8) {
        brick(ctx, x0 - 34, y, 16, 8, true);
        brick(ctx, x0 + 66, y, 16, 8, true);
      }
    }, -4),
  );
  return st;
}

export const actMehraab: Act = {
  id: 'ita10-mehraab',
  w: 22,
  advice: 'The fort’s gate: a wall two bricks high, spikes on top, no fresh mortar, and over the road behind it the arch with its loose brick. Pull once and step back as it slumps, as you learned. Then do not hop the stub: you would land under the loose brick. Pull the stub down too, and walk under.',
  cps: [],
  build: (w, c) => {
    wall(w, c.x + 10, [false, false], 'ita10b');
    arch(w, px(c.x + 10) + 40, 'ita10m');
    sign(w, c.x + 1, 10.4, 3, 'ITA FORT', 'shop', null, 'the gate');
  },
};

// ------------------------------------------------------------------ act C: the sluice held by the pour
export interface Gate10 {
  open: number;
  pourT: number;
}
const POUR = 3.6;
const DROP = 0.5;

export const actMori: Act = {
  id: 'ita10-mori',
  w: 21,
  advice: 'The river sluice again, and this gate is held by the pour alone: the water runs over its top into the river beyond, pushing it open, and the moment the pour stops the gate drops. There is no gap after the pour. Pull, cross the drained tank, and go through under the pour while it still runs.',
  cps: [],
  paint: (g, c) => {
    carveTanks(g, [{ c: c.x + 6 }]);
  },
  build: (w, c) => {
    const st = paddies(w, [{ c: c.x + 6, full: true }], [{ c: c.x + 5, k: 0, to: -1 }], 'ita10c');
    const tank = st.tanks[0];
    const gate: Gate10 = { open: 0, pourT: -1 };
    w.flags.ita10cg = gate;
    const G = c.x + 14;
    w.add(
      new Rig(px(G), FL - 40, 8, 40, {
        layer: 3,
        solid: true,
        cause: 'ita-kapaat',
        inset: 0,
        live: (r) => r.s.live === true,
        tick: (r, w2) => {
          if (tank.drainT >= 0 && gate.pourT < 0) gate.pourT = w2.tick;
          const t = gate.pourT < 0 ? -1 : since(w2, gate.pourT);
          // missed it: the channel refills the tank and the lever can be pulled again
          if (t > POUR + 3.0 && gate.open < 0.01) {
            tank.level = 'full';
            gate.pourT = -1;
          }
          const pouring = t >= 0 && t < POUR;
          const target = pouring ? 1 : 0;
          const prev = gate.open;
          if (target > gate.open) gate.open = Math.min(1, gate.open + 0.15);
          else gate.open = Math.max(0, gate.open - 1 / (DROP * 120));
          r.s.pouring = pouring;
          // the gate coming down is deadly: there is no hold after the pour
          r.s.live = target === 0 && prev > 0 && gate.open > 0.02 && gate.open < 0.98;
          const h = Math.round((1 - gate.open) * 40);
          r.setSolid(gate.open < 0.5);
          r.moveTo(w2, px(G), FL - h);
          r.h = h;
          if (r.solid) r.solid.h = Math.max(1, h);
        },
        paint: (ctx, r, w2) => {
          // the chute: a bamboo pipe from the tank's far bund up and over the gate post
          box(ctx, px(c.x + 10) + 2, FL - 66, px(G) - px(c.x + 10) + 14, 4, '#A88A4A');
          box(ctx, px(c.x + 10) + 2, FL - 66, 4, 50, '#A88A4A');
          box(ctx, r.x + 12, FL - 66, 4, 10, '#A88A4A');
          box(ctx, r.x, r.y, 8, r.h, '#8A6A3A');
          box(ctx, r.x + 9, FL - 48, 3, 48, '#6B4A2A');
          box(ctx, r.x - 2, FL - 52, 14, 4, '#6B4A2A');
          if (r.s.pouring) {
            // water over the top, falling on the far side into the river channel
            const wob = (w2.tick >> 2) % 2;
            box(ctx, r.x + 10, FL - 60, 10 + wob, 60, 'rgba(200,235,235,0.9)');
            box(ctx, r.x + 18, FL - 6, 30, 6, 'rgba(230,245,245,0.8)');
            ctx.font = '700 8px sans-serif';
            ctx.fillStyle = '#E8E0D0';
            ctx.fillText('NADI', r.x + 24, FL - 70);
          }
        },
      }),
    );
    w.add(new Paint((ctx) => box(ctx, px(G) - 10, FL - 72, 40, 8, '#6B4A2A'), -4));
    sign(w, c.x + 1, 10.4, 3, 'MORI', 'shop', null, 'the sluice');
  },
};

// ------------------------------------------------------------------ act D: the stair already hung
export interface Grove10 {
  shakes: number;
  dropped: boolean;
  dropT: number;
  lastShake: number;
  oranges: Rig[];
}

export const actTokri: Act = {
  id: 'ita10-tokri',
  w: 29,
  advice: 'The orange terrace, and the harvester has been here before you: the baskets hang on their ropes at step height, empty, and every notch on the post is lit. The stair is built. Climb it as it is. One shake, from any side, and the harvester’s basket is on you.',
  cps: [],
  paint: (g, c) => {
    g.fill(c.x + 22, c.x + 28, 12, 14, '#');
  },
  build: (w, c) => {
    const trunk = c.x + 8;
    const W = px(c.x + 22);
    const st: Grove10 = { shakes: 0, dropped: false, dropT: 0, lastShake: -99, oranges: [] };
    w.flags.ita10t = st;
    const BR = FL - 54;
    const bx0 = px(trunk - 2),
      bx1 = px(trunk + 5);
    // the shake: Dad's head in the branch while in the air
    w.add(
      new Rig(bx0, BR, bx1 - bx0, 16, {
        layer: 1,
        tick: (_r, w2) => {
          const p = w2.player;
          if (!p.onGround && p.y <= BR + 14 && p.cx >= bx0 && p.cx < bx1 && since(w2, st.lastShake) > 0.6) {
            st.lastShake = w2.tick;
            st.shakes++;
            w2.sfx('creak', p.cx, BR);
            for (const dx of [0, 14]) {
              st.oranges.push(
                w2.add(
                  new Rig(px(trunk) + 6 + dx, FL - 12, 12, 12, {
                    layer: 3,
                    cause: 'ita-santra',
                    inset: 1,
                    tick: (r) => {
                      r.x += perTick(110);
                      if (r.x + 12 >= W) {
                        r.on = false;
                        r.alive = false;
                      }
                    },
                    paint: (ctx, r) => {
                      ctx.fillStyle = '#F28C28';
                      ctx.beginPath();
                      ctx.arc(r.x + 6, r.y + 6, 6, 0, Math.PI * 2);
                      ctx.fill();
                    },
                  }),
                ),
              );
            }
            if (!st.dropped) {
              st.dropped = true;
              st.dropT = w2.tick;
              w2.sfx('snap', bx0, BR);
            }
          }
        },
        paint: () => {},
      }),
    );
    // the harvester's basket over the shaking spot, on its last notch (all lit): the next shake is the drop
    w.add(
      new Rig(px(trunk - 2), BR - 90 + 3 * 14, 32, 28, {
        layer: 3,
        cause: 'ita-aakhri',
        inset: 2,
        live: (_r, w2) => st.dropped && since(w2, st.dropT) < 0.9,
        tick: (r, w2) => {
          if (st.dropped) r.y = Math.min(FL - 28, r.y + perTick(520) * Math.min(1.6, 0.3 + since(w2, st.dropT) * 3));
        },
        paint: (ctx, r) => {
          box(ctx, r.x + 15, 0, 2, Math.max(0, r.y), '#6B5A2A');
          box(ctx, r.x, r.y, 32, 28, '#B08A4A');
          box(ctx, r.x + 2, r.y + 2, 28, 24, '#C9A66A');
          for (let k = 0; k < 2; k++)
            for (let i = 0; i < 3; i++) {
              ctx.fillStyle = '#F28C28';
              ctx.beginPath();
              ctx.arc(r.x + 6 + i * 10, r.y + 8 + k * 11, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          // every notch lit
          for (let k = 0; k < 4; k++) box(ctx, r.x + 34, BR - 90 + k * 14, 6, 2, '#F28C28');
        },
      }),
    );
    // the tree
    w.add(
      new Paint((ctx) => {
        box(ctx, px(trunk) + 4, BR, 8, FL - BR, '#6B4A2A');
        ctx.fillStyle = '#3F7A3A';
        ctx.beginPath();
        ctx.ellipse(px(trunk) + 20, BR - 10, 64, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        box(ctx, bx0, BR + 4, bx1 - bx0, 4, '#6B4A2A');
        for (let i = 0; i < 7; i++) {
          ctx.fillStyle = '#F28C28';
          ctx.beginPath();
          ctx.arc(bx0 + 8 + i * 15, BR - 8 - (i % 3) * 7, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }, -3),
    );
    // the hung baskets: empty, on ropes from a beam, at step height
    const steps = [c.x + 16, c.x + 18, c.x + 20];
    steps.forEach((col, i) => {
      const top = FL - 16 * (i + 1);
      w.add(
        new Rig(px(col), top, 32, 14, {
          solid: true,
          layer: 2,
          paint: (ctx, r) => {
            box(ctx, r.x + 6, 30, 2, r.y - 30, '#6B5A2A');
            box(ctx, r.x + 24, 30, 2, r.y - 30, '#6B5A2A');
            box(ctx, r.x, r.y, 32, 14, '#B08A4A');
            box(ctx, r.x + 2, r.y + 2, 28, 10, '#C9A66A');
            box(ctx, r.x, r.y, 32, 2, '#8A6A3A');
          },
        }),
      );
    });
    w.add(new Paint((ctx) => box(ctx, px(c.x + 15), 26, px(7), 6, '#6B4A2A'), -2));
    sign(w, c.x + 1, 10.4, 3, 'DAMBUK', 'shop', null, 'the terrace');
  },
};

export const meta10 = { family: 'finale-bricks-on-one-lane-bridge', betrayals: ['brick-bridge-oncoming'], ending: 'ita-subah-plain-door' };
