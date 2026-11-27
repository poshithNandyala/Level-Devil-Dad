// PAT-06 Setu ka Jod: the Gandhi Setu's expansion joints. Each seam between two spans is covered by a numbered
// steel plate, and one plate is missing: count them. Plates only hold a walker: land on one from a jump and it
// flips up under you. Act: a longer run of spans with two plates gone. Door: the toll booth that no longer charges.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { since, taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;

/** the hazard under a seam: the Ganga far below (y from 256) */
export function under(w: World, c0: number, c1: number, cause: string) {
  w.add(
    new Rig(px(c0), 256, px(c1 - c0 + 1), 30, {
      layer: 4,
      cause,
      inset: 0,
      paint: (ctx, r) => {
        ctx.fillStyle = 'rgba(70,56,36,0.92)';
        ctx.fillRect(r.x, r.y, r.w, 30);
        ctx.fillStyle = 'rgba(255,241,201,0.35)';
        ctx.fillRect(r.x + 3, r.y + 4, r.w - 6, 1);
      },
    }),
  );
}

/** a numbered expansion plate over the seam at columns [c, c + 1]: solid steel, bolted down */
function plate(w: World, c: number, n: number, key: string) {
  const r = w.add(
    new Rig(px(c), FL, 32, 8, {
      solid: true,
      layer: 2,
      paint: (_ctx, s, _w2) => void s,
    }),
  );
  void n;
  (w.flags[key] ??= []).push(r);
  return r;
}

/** the seams of a bridge: [column, number, present]. Every seam looks plated; a missing plate is a tarp laid flat over
 *  the gap, with the same number painted on it but no bolts. The sacks on the truck at the foot say which numbers. */
export function seams(w: World, list: [number, number, boolean][], key: string) {
  for (const [c, , present] of list) {
    if (present) plate(w, c, 0, key);
  }
  w.add(
    new Paint((ctx) => {
      for (const [c, n, present] of list) {
        // the girder walls either side of each seam, so the joint reads
        box(ctx, px(c) - 2, FL, 2, 14, '#3F3B30');
        box(ctx, px(c) + 32, FL, 2, 14, '#3F3B30');
        box(ctx, px(c), FL, 32, 8, present ? '#8A8F96' : '#858A8E');
        box(ctx, px(c), FL, 32, 2, present ? '#B8BDC4' : '#AEB3B9');
        if (present) {
          box(ctx, px(c) + 2, FL + 3, 3, 3, '#555');
          box(ctx, px(c) + 27, FL + 3, 3, 3, '#555');
        }
        ctx.fillStyle = '#2A2A2E';
        ctx.font = '700 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(n), px(c) + 16, FL + 7);
      }
    }, 2),
  );
}

/** a lorry body with n sacks on its bed (the stretch's count) */
function lorry(ctx: CanvasRenderingContext2D, x: number, n: number) {
  box(ctx, x - 6, FL - 18, 52, 5, '#6B3F1C');
  box(ctx, x + 36, FL - 34, 14, 22, '#3B6EA5');
  box(ctx, x + 40, FL - 31, 8, 7, '#BFE3F2');
  box(ctx, x - 6, FL - 14, 58, 4, '#222');
  ctx.fillStyle = '#1D1A1A';
  for (const wx of [4, 20, 42]) {
    ctx.beginPath();
    ctx.arc(x + wx, FL - 6, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < n; i++) {
    box(ctx, x + (i % 4) * 9, FL - 28 - Math.floor(i / 4) * 9, 8, 10, '#C9A56B');
    box(ctx, x + (i % 4) * 9, FL - 28 - Math.floor(i / 4) * 9, 8, 2, '#E3C58A');
  }
}

/** a parked truck with n sacks on it: the count is the rule of the stretch */
export function cart(w: World, x: number, n: number) {
  w.add(new Paint((ctx) => lorry(ctx, x, n), 2));
}

export function room(): LevelDef {
  const S: [number, number, boolean][] = [
    [7, 1, true],
    [13, 2, true],
    [19, 3, false],
    [25, 4, true],
  ];
  return {
    id: 'PAT-06',
    city: 'PAT',
    index: 6,
    name: 'Setu ka Jod',
    nameEn: 'The Setu’s joint',
    tagline: 'Forty-five spans, forty-four joints, and a plate over each. Count the sacks.',
    hint: 'Each seam between two spans looks plated, with a number on it. The truck at the start carries three sacks: every plate whose number is a multiple of three is only a tarp laid over the gap (it has no bolts). Walk the plates, and jump the tarp from the deck to the deck.',
    par: 22,
    map: (() => {
      const g = Grid.ground(15).put(1, 14, '@').put(30, 14, 'E');
      for (const [c] of S) g.fill(c, c + 1, 15, 17, '.');
      return g.rows();
    })(),
    build(w: World) {
      door(w);
      seams(w, S, 'pat6');
      for (const [c] of S) under(w, c, c + 1, 'pat-jod');
      cart(w, px(2), 3);
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.win[1], 2.4);
          },
        }),
      );
      sign(w, 3.4, 10.4, 3.4, 'GANDHI SETU', 'shop', null, '5.75 km');
      rival(w, 28, 15, -1, taraScript(6));
      collectible(w, 'pat-thekua', 22, 11.8);
    },
  };
}

export const act: Act = {
  id: 'pat06-sau',
  w: 44,
  advice: 'The next truck carries two sacks, not three: every second plate is the tarp now, the two, the four and the six. Read the sacks again, walk the others, and jump the tarps from the deck to the deck.',
  cps: [20, 33.5],
  paint: (g, c) => {
    for (const x of [6, 13, 20, 27, 34, 40]) g.fill(c.x + x, c.x + x + 1, 15, 17, '.');
  },
  build: (w, c) => {
    const list: [number, number, boolean][] = [6, 13, 20, 27, 34, 40].map((x, i) => [c.x + x, i + 1, (i + 1) % 2 !== 0]);
    seams(w, list, 'pat6a');
    for (const [col] of list) under(w, col, col + 1, 'pat-ginti');
    cart(w, px(c.x + 1), 2);
    sign(w, c.x + 2, 10.4, 3, 'SPAN 7', 'shop', null, 'load: 2 sacks');
  },
};

/** the long run: eight spans, plates numbered 1-8, and every third one gone */
export const act2: Act = {
  id: 'pat06-nau',
  w: 58,
  advice: 'The far end of the bridge is eight spans long, and the truck carries three sacks again: the three and the six are tarps. Walk the others, and jump those two from the deck.',
  cps: [14, 36],
  paint: (g, c) => {
    for (const x of [6, 12, 18, 24, 30, 36, 42, 48]) g.fill(c.x + x, c.x + x + 1, 15, 17, '.');
  },
  build: (w, c) => {
    const list: [number, number, boolean][] = [6, 12, 18, 24, 30, 36, 42, 48].map((x, i) => [c.x + x, i + 1, (i + 1) % 3 !== 0]);
    seams(w, list, 'pat6b');
    for (const [col] of list) under(w, col, col + 1, 'pat-jod');
    cart(w, px(c.x + 1), 3);
    sign(w, c.x + 2, 10.4, 3, 'SPAN 9', 'shop', null, 'load: 3 sacks');
  },
};

export interface Lift {
  /** seam index (0-based), seconds after Dad reaches the span, how long the plate stays out of its seat */
  k: number;
  at: number;
  dur: number;
}

/** plates a truck lifts out of their seats for a while: a seam is open only in its window, and the plate shakes in its
 *  seat for the second before. Same every time. */
export function liftSeams(w: World, c0: number, cols: number[], key: string, nums: number[], lifts: Lift[], trigger: number) {
  const st = { t0: -1, lifts, cols };
  w.flags[key] = st;
  w.when(
    (w2) => w2.player.cx >= trigger,
    (w2) => {
      st.t0 = w2.tick;
    },
  );
  const byK: Lift[][] = cols.map((_, k) => lifts.filter((q) => q.k === k));
  const open = (k: number, w2: World, ahead = 0) => {
    if (st.t0 < 0) return false;
    const t = since(w2, st.t0) + ahead;
    const qs = byK[k];
    for (let i = 0; i < qs.length; i++) if (t >= qs[i].at && t < qs[i].at + qs[i].dur) return true;
    return false;
  };
  cols.forEach((c, k) => {
    const r = w.add(
      new Rig(px(c), FL, 32, 8, {
        solid: true,
        layer: 2,
        near: 900,
        tick: (pl, w2) => {
          const out = open(k, w2);
          pl.solid!.collidable = !out;
          pl.s.shake = !out && open(k, w2, 1.0);
          pl.s.out = out;
        },
        paint: (ctx, pl, w2) => {
          if (pl.s.out) return;
          const sh = pl.s.shake ? Math.sin(w2.tick / 2) * 1.5 : 0;
          box(ctx, pl.x + sh, pl.y, pl.w, 8, '#8A8F96');
          box(ctx, pl.x + sh, pl.y, pl.w, 2, '#B8BDC4');
          ctx.fillStyle = '#2A2A2E';
          ctx.font = '700 8px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(String(nums[k]), pl.x + 16 + sh, pl.y + 7);
        },
      }),
    );
    r.s.k = k;
    (w.flags[key + 'p'] ??= []).push(r);
  });
  const pit = w.add(
    new Rig(px(c0), 256, px(cols[cols.length - 1] + 2 - c0), 30, {
      layer: 4,
      cause: 'pat-jod',
      inset: 0,
      paint: (ctx, r) => {
        ctx.fillStyle = 'rgba(70,56,36,0.92)';
        ctx.fillRect(r.x, r.y, r.w, 30);
      },
    }),
  );
  // a seam a second truck follows is its own death: the plate was back for a breath and went again
  w.onTick((w2) => {
    const k = cols.findIndex((c) => Math.abs(w2.player.cx - px(c) - 16) < 40);
    pit.hazard!.cause = k >= 0 && byK[k].length > 1 ? 'pat-gaadi' : 'pat-jod';
  });
  // a truck crossing over the lifted seam: drawn in passing
  w.add(
    new Paint((ctx, w2) => {
      for (const q of lifts) {
        if (!st.t0 || st.t0 < 0) break;
        const t = since(w2, st.t0);
        if (t >= q.at - 0.2 && t < q.at + q.dur) {
          const x = px(cols[q.k]) - 40 + ((t - q.at + 0.2) / (q.dur + 0.2)) * 112;
          box(ctx, x, FL - 36, 40, 22, '#3B6EA5');
          box(ctx, x + 28, FL - 42, 14, 14, '#F2B705');
          box(ctx, x, FL - 14, 40, 3, '#222');
        }
      }
    }, 3),
  );
  return st;
}

/** a truck whose load is changing: a porter takes sacks off it (or puts them on) one by one once Dad is near. The count
 *  that counts is the one left when the porter has finished. State on w.flags[key]: { t0, n, done }. */
export function truckLoad(w: World, x: number, key: string, start: number, changes: { at: number; n: number }[], trigger: number) {
  const st = { t0: -1, n: start, done: false, last: changes[changes.length - 1].at, final: changes[changes.length - 1].n };
  w.flags[key] = st;
  w.when(
    (w2) => w2.player.cx >= trigger,
    (w2) => {
      st.t0 = w2.tick;
    },
  );
  w.onTick((w2) => {
    const t = st.t0 < 0 ? -1 : since(w2, st.t0);
    let n = start;
    for (const c of changes) if (t >= c.at) n = c.n;
    st.n = n;
    st.done = t >= st.last;
  });
  w.add(
    new Paint((ctx, w2) => {
      const t = st.t0 < 0 ? -9 : since(w2, st.t0);
      lorry(ctx, x, st.n);
      // the porter walking a sack off the truck (or on to it) in the second before the count changes
      let prev = start;
      for (const c of changes) {
        if (t >= c.at - 1.2 && t < c.at) {
          const k = (t - (c.at - 1.2)) / 1.2;
          const off = c.n < prev;
          const px0 = x + 62 + (off ? k : 1 - k) * 36;
          folk(ctx, px0, FL - 28, 28, '#2F6BB0', { sack: '#C9A56B' });
        }
        prev = c.n;
      }
    }, 2),
  );
  return st;
}

/** a bridge in traffic: a truck lifts a plate out of its seat (it shakes a second before), and at the second
 *  window a second truck follows the first, so the plate is back for only a breath before it goes again */
export const actGaadi: Act = {
  id: 'pat06-gaadi',
  w: 66,
  advice: 'Traffic: a truck lifts a plate out of its seat for a couple of seconds, and the plate shakes a second before. Wait on the deck, never on a plate. Where a second truck follows the first, the plate is back for a breath and still shaking: cross only when it is in and still.',
  cps: [20, 47],
  paint: (g, c) => {
    for (let i = 0; i < 6; i++) g.fill(c.x + 6 + i * 9, c.x + 7 + i * 9, 15, 17, '.');
  },
  build: (w, c) => {
    const cols = Array.from({ length: 6 }, (_, i) => c.x + 6 + i * 9);
    const lifts: Lift[] = [
      { k: 1, at: 1.0, dur: 2.2 },
      { k: 4, at: 5.5, dur: 2.2 },
      { k: 4, at: 8.0, dur: 2.2 },
    ];
    liftSeams(w, c.x, cols, 'pat6c', [1, 2, 3, 4, 5, 6], lifts, px(c.x + 2));
    sign(w, c.x + 2, 10.4, 3.2, 'TRAFFIC', 'shop', null, 'plates lifting');
  },
};

/** the count that lies: the truck at the foot is being unloaded while you read it; a second truck parked further on is being loaded */
export const actGinti2: Act = {
  id: 'pat06-ginti',
  w: 120,
  advice: 'Two trucks this time. The one at the foot is being unloaded: wait until the porter has finished, then count what is left. A second truck stands half-way along, and a porter is loading it as you come up: read that one when he has finished too, and count the plates after it by its sacks, not the first truck’s.',
  cps: [28, 62, 82],
  paint: (g, c) => {
    for (let i = 0; i < 12; i++) g.fill(c.x + 10 + i * 8, c.x + 11 + i * 8, 15, 17, '.');
  },
  build: (w, c) => {
    // part one: plates 1-6 by the first truck's final count (two); part two: plates 7-12 by the second truck's (three)
    const list: [number, number, boolean][] = Array.from({ length: 12 }, (_, i) => {
      const n = i + 1;
      return [c.x + 10 + i * 8, n, n <= 6 ? n % 2 !== 0 : n % 3 !== 0];
    });
    seams(w, list, 'pat6d');
    list.forEach(([col], i) => under(w, col, col + 1, i < 6 ? 'pat-ginti' : 'pat-load'));
    truckLoad(w, px(c.x + 1), 'pat6t', 5, [{ at: 2.0, n: 4 }, { at: 4.2, n: 3 }, { at: 6.4, n: 2 }], px(c.x + 1));
    truckLoad(w, px(c.x + 61), 'pat6u', 1, [{ at: 2.0, n: 2 }, { at: 4.4, n: 3 }], px(c.x + 55));
    sign(w, c.x + 2, 10.4, 3.2, 'UNLOADING', 'shop', null, 'wait for the porter');
    sign(w, c.x + 62, 10.4, 3.2, 'LOADING', 'shop', null, 'the next truck');
  },
};

export const ending: Ending = {
  space: 16,
  advice: 'The old toll booth no longer charges, but its sensor strip still works: step on it and the barrier slams down at the door. Step on it and wait back for the barrier to lift, or jump the strip.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const st = { down: -1 };
    w.flags.pat6e = st;
    w.flags.twist = 'toll';
    w.add(
      new Paint((ctx) => {
        // the sensor strip (yellow chevrons) and the booth with its window shut
        for (let i = 0; i < 6; i++) box(ctx, px(D - 9) + i * 8, FL - 1, 5, 1, '#F2B705');
        box(ctx, px(D + 2), FL - 44, 28, 44, '#B8503A');
        box(ctx, px(D + 2) + 4, FL - 34, 20, 12, '#2B2B30');
        box(ctx, px(D + 2) + 4, FL - 34, 20, 4, '#E6E1D6');
      }, -4),
    );
    w.add(
      new Rig(px(D - 3), FL - 30, 8, 30, {
        layer: 3,
        cause: 'pat-barrier',
        inset: 1,
        live: (_r, w2) => st.down >= 0 && since(w2, st.down) >= 0.4 && since(w2, st.down) < 3.0,
        tick: (_r, w2) => {
          const p = w2.player;
          const onStrip = p.onGround && p.cx >= px(D - 9) && p.cx < px(D - 6);
          if (onStrip && (st.down < 0 || since(w2, st.down) > 3.4)) {
            st.down = w2.tick;
            w2.sfx('thud', px(D - 3), FL - 20);
          }
        },
        paint: (ctx, r, w2) => {
          const t = st.down < 0 ? 9 : since(w2, st.down);
          const down = t >= 0.4 && t < 3.0;
          // a red and white boom: hinged at its post, up or slammed across
          box(ctx, r.x - 6, FL - 30, 4, 30, '#555');
          if (down) for (let i = 0; i < 5; i++) box(ctx, r.x - 2 + i * 0, FL - 28 + i * 6, 12, 5, i % 2 ? '#fff' : '#D7262E');
          else for (let i = 0; i < 5; i++) box(ctx, r.x - 4, FL - 6 - i * 0, 0, 0, '#fff');
          if (!down) for (let i = 0; i < 8; i++) box(ctx, r.x - 2 + i * 6, FL - 34 - i * 2, 6, 3, i % 2 ? '#fff' : '#D7262E');
        },
      }),
    );
  },
};

export const meta06 = { family: 'setu-joint-missing-plate', betrayals: ['missing-plate'], ending: 'pat-toll' };
