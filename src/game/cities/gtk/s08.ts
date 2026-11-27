// GTK-08 Ropeway (how would I know). The cable car station at Deorali: you ride inside the cabin, and you board
// from its door side. A cabin that comes in with its door facing away has no door and no step your side: walk round
// the station over the footbridge to the far platform. The next cabin, door your side, goes back into the shed.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, cyc, decor, gullyBack, px } from './entities';
import { taraScript } from './common';

export const CAB = { w: 40, h: 26 };
/** a shuttle's clock: dwell at its own end, travel, dwell at the middle, travel back (seconds) */
export interface Line {
  t0: number;
  dwellEnd: number;
  travel: number;
  dwellMid: number;
}
export const period = (l: Line) => 2 * l.travel + l.dwellEnd + l.dwellMid;
/** 0 at its own end .. 1 at the middle station, and the phase name */
export function shuttleAt(l: Line, t: number): { k: number; ph: 'end' | 'up' | 'mid' | 'down' } {
  if (l.t0 === -1) return { k: 0, ph: 'end' };
  const u = ((t % period(l)) + period(l)) % period(l);
  if (u < l.dwellEnd) return { k: 0, ph: 'end' };
  if (u < l.dwellEnd + l.travel) return { k: (u - l.dwellEnd) / l.travel, ph: 'up' };
  if (u < l.dwellEnd + l.travel + l.dwellMid) return { k: 1, ph: 'mid' };
  return { k: 1 - (u - l.dwellEnd - l.travel - l.dwellMid) / l.travel, ph: 'down' };
}

const ease = (k: number) => k * k * (3 - 2 * k);

/** a cabin whose roof runs from (ax, ay) at its own end to (mx, my) at the middle; Dad rides on the roof */
export function cabin(w: World, line: Line, ax: number, ay: number, mx: number, my: number, colour: string, key: string, shed?: { x0: number; x1: number }) {
  const c = w.add(
    new Rig(ax, ay, CAB.w, 6, {
      solid: true,
      layer: 2,
      tick: (r, w2) => {
        const s = shuttleAt(line, (w2.tick - line.t0) / 120);
        const k = ease(s.k);
        r.moveTo(w2, ax + (mx - ax) * k, ay + (my - ay) * k);
        r.s.ph = s.ph;
        r.s.k = s.k;
        // back into its shed with Dad on the roof: the eave takes him off
        if (shed && s.ph === 'down' && s.k < 0.12 && r.carries(w2)) w2.die('gtk-ropeway');
      },
      paint: (ctx, r) => {
        const cx = r.x + r.w / 2;
        // the hanger up to the cable and the grip
        box(ctx, cx - 1, r.y - 14, 2, 14, '#4E5A62');
        box(ctx, cx - 5, r.y - 16, 10, 3, '#26323A');
        // the roof Dad stands on, the cabin body below it, windows
        box(ctx, r.x, r.y, r.w, 4, '#D9D4C7');
        box(ctx, r.x + 2, r.y + 4, r.w - 4, CAB.h - 4, colour);
        box(ctx, r.x + 5, r.y + 8, r.w - 10, 9, '#BFD7EA');
        box(ctx, r.x + r.w / 2 - 1, r.y + 8, 2, 9, colour);
        box(ctx, r.x + 2, r.y + CAB.h - 2, r.w - 4, 2, '#26323A');
      },
    }),
  );
  (w.flags[key] ??= []).push(c);
  return c;
}

/** the cable, the middle station's pylon, and the two station sheds, drawn */
function stations(w: World, lower: [number, number], mid: [number, number], upper: [number, number], midTower: number) {
  decor(w, -3, (ctx) => {
    ctx.strokeStyle = '#26323A';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(lower[0], lower[1] - 16);
    ctx.lineTo(mid[0], mid[1] - 16);
    ctx.lineTo(upper[0], upper[1] - 16);
    ctx.stroke();
    // the middle station: a lattice pylon with a little platform-less cabin house, out of reach
    box(ctx, midTower - 6, mid[1] - 30, 12, 300, '#6F7A82');
    for (let y = mid[1] - 20; y < FL + 40; y += 14) {
      ctx.beginPath();
      ctx.moveTo(midTower - 6, y);
      ctx.lineTo(midTower + 6, y + 14);
      ctx.stroke();
    }
    box(ctx, midTower - 16, mid[1] - 44, 32, 14, '#C0392B');
  });
}

/** a boxed cabin Dad rides INSIDE: floor, roof and two walls move together. Its door is on one side; while
 *  docked with the door open, that wall is gone and a step over the gap is out. `path(t)` gives the cabin's
 *  floor-top (x, y) and whether the door is open, t seconds after the clock starts (before it: as at t = 0) */
export const BOX = { w: 48, h: 32 };
export type BoxAt = { x: number; y: number; open: boolean; side?: 'L' | 'R' };
export function boxCabin(w: World, door: 'L' | 'R', path: (t: number) => BoxAt, clock: { t0: number }, colour: string, key: string, shedY?: number) {
  const at = (w2: World) => path(clock.t0 < 0 ? 0 : (w2.tick - clock.t0) / 120);
  const a0 = path(0);
  // which side the door is on now (a cabin turns round on the wheel at the top station)
  const sideOf = (q: BoxAt) => q.side ?? door;
  const part = (dx: number, dy: number, wd: number, ht: number, wall?: 'L' | 'R', stepSide?: 'L' | 'R') => {
    const r = w.add(
      new Rig(a0.x + dx, a0.y + dy, wd, ht, {
        solid: true,
        layer: 2,
        tick: (rr, w2) => {
          const q = at(w2);
          rr.moveTo(w2, q.x + dx, q.y + dy);
          if (wall) rr.setSolid(!(q.open && sideOf(q) === wall));
          if (stepSide) rr.setSolid(q.open && sideOf(q) === stepSide);
        },
      }),
    );
    if (wall) r.setSolid(!(a0.open && sideOf(a0) === wall));
    if (stepSide) r.setSolid(a0.open && sideOf(a0) === stepSide);
    return r;
  };
  const floor = part(0, 0, BOX.w, 4);
  const roof = part(0, -BOX.h - 4, BOX.w, 4);
  part(0, -BOX.h, 4, BOX.h, 'L');
  part(BOX.w - 4, -BOX.h, 4, BOX.h, 'R');
  // the step over the gap on the door side, out only while the door is open
  part(-16, 0, 16, 4, undefined, 'L');
  part(BOX.w, 0, 16, 4, undefined, 'R');
  const body = w.add(
    new Rig(a0.x, a0.y - BOX.h - 4, BOX.w, BOX.h + 8, {
      layer: 1,
      tick: (r, w2) => {
        const q = at(w2);
        r.x = q.x;
        r.y = q.y - BOX.h - 4;
        r.s.open = q.open;
        r.s.side = sideOf(q);
        // going down into the shed with Dad in it, or on its roof: the shed takes him
        const sinking = q.y > (r.s.lastY ?? q.y);
        r.s.lastY = q.y;
        if (shedY !== undefined && sinking && q.y > shedY && (floor.carries(w2) || roof.carries(w2))) w2.die('gtk-ropeway');
      },
      paint: (ctx, r) => {
        const x = r.x,
          y = r.y;
        box(ctx, x + BOX.w / 2 - 1, y - 14, 2, 14, '#4E5A62');
        box(ctx, x + BOX.w / 2 - 5, y - 16, 10, 3, '#26323A');
        box(ctx, x, y, BOX.w, 4, '#D9D4C7');
        box(ctx, x, y + 4, BOX.w, BOX.h, colour);
        box(ctx, x + 8, y + 8, BOX.w - 16, 10, 'rgba(191,215,234,0.55)');
        box(ctx, x, y + BOX.h + 4, BOX.w, 4, '#26323A');
        // the door side: an opening while open, a door panel with a yellow handle while shut; the blind side is plain
        const sd = r.s.side ?? door;
        const dx = sd === 'L' ? x : x + BOX.w - 6;
        box(ctx, dx, y + 4, 6, BOX.h, r.s.open ? 'rgba(20,20,20,0.2)' : '#7A2A1F');
        if (!r.s.open) box(ctx, sd === 'L' ? x + 2 : x + BOX.w - 4, y + 20, 2, 4, '#F4D35E');
        if (r.s.open) box(ctx, sd === 'L' ? x - 16 : x + BOX.w, y + BOX.h + 4, 16, 4, '#8A8478');
      },
    }),
  );
  (w.flags[key] ??= []).push(body);
  return body;
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const DOORSIDE = { dwell: 4.6, rise: 0.9, across: 1.6, down: 0.9, next: 4.8, nextUp: 0.5, nextDwell: 1.4, nextDown: 0.6 };

/** the door-side station: near platform (cols n0..n0+9), the bay (n0+11..n0+13), the far platform (n0+15..n0+19),
 *  the footbridge over the bay, the top station at n0+28..n0+31. Cabin 1, door to the far platform, goes up the
 *  line; cabin 2, door your side, comes up out of the shed and goes back down into it */
export function doorSide(w: World, n0: number, key: string, D = DOORSIDE, swap = false) {
  const clock = { t0: -1 };
  w.flags[key] = clock;
  onPass(w, px(n0 + 5.5), (w2) => {
    if (clock.t0 < 0) clock.t0 = w2.tick;
  });
  // the top station's platform is higher, level with the next span's deck
  const fy = px(10),
    ty = px(6),
    topY = px(2),
    x1 = px(n0 + 11),
    x2 = px(n0 + 24);
  const up = (t: number): BoxAt => {
    if (t < D.dwell) return { x: x1, y: fy, open: true };
    let u = t - D.dwell;
    if (u < D.rise) return { x: x1, y: lerp(fy, topY, u / D.rise), open: false };
    u -= D.rise;
    if (u < D.across) return { x: lerp(x1, x2, u / D.across), y: topY, open: false };
    u -= D.across;
    // round the wheel at the top: whichever side it boarded, it lets you out on the platform side
    if (u < D.down) return { x: x2, y: lerp(topY, ty, u / D.down), open: false, side: 'R' };
    return { x: x2, y: ty, open: true, side: 'R' };
  };
  // waiting below the gorge's floor, out of the way of anyone who falls
  const below = fy + 160;
  const shed = (t: number): BoxAt => {
    if (t < D.next) return { x: x1, y: below, open: false };
    let u = t - D.next;
    if (u < D.nextUp) return { x: x1, y: lerp(below, fy, u / D.nextUp), open: false };
    u -= D.nextUp;
    if (u < D.nextDwell) return { x: x1, y: fy, open: true };
    u -= D.nextDwell;
    return { x: x1, y: lerp(fy, below, u / D.nextDown), open: false };
  };
  // swap: the cabin going up has its door on YOUR side, and the shed one comes in door away
  boxCabin(w, swap ? 'L' : 'R', up, clock, '#C0392B', key + 'up');
  boxCabin(w, swap ? 'R' : 'L', shed, clock, '#2E86AB', key + 'shed', fy + 20);
  // the footbridge: three steps up from the near platform and the span over the bay (you can walk under them)
  const plank = (ctx: CanvasRenderingContext2D, r: Rig) => box(ctx, r.x, r.y, r.w, 4, '#8A8478');
  const fb: Rig[] = [];
  for (let i = 0; i < 3; i++) fb.push(w.add(new Rig(px(n0 + 6 + i), fy - 16 * (i + 1), 16, 4, { solid: true, oneWay: true, layer: 3, paint: plank })));
  fb.push(w.add(new Rig(px(n0 + 9), fy - 48, px(7), 4, { solid: true, oneWay: true, layer: 3, paint: plank })));
  w.flags[key + 'fb'] = fb;
  decor(w, -3, (ctx) => {
    ctx.strokeStyle = '#26323A';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x1 + BOX.w / 2, topY - 52);
    ctx.lineTo(x2 + BOX.w / 2, topY - 52);
    ctx.stroke();
    // the shed under the bay, its dark mouth
    box(ctx, x1 - 4, fy + 22, BOX.w + 8, 6, '#5E5A50');
    box(ctx, x1, fy + 28, BOX.w, 60, '#2A2A26');
  });
  gullyBack(w, px(n0 + 10), px(n0 + 28), px(9));
  w.add(new Rig(px(n0), FL + 20, px(32), 40, { cause: 'gtk-khaai', inset: 0 }));
  return clock;
}
export const paintDoorSide = (g: Grid, n0: number) => {
  g.pit(n0, n0 + 31);
  g.fill(n0, n0 + 9, 10, 17, '#');
  g.fill(n0 + 15, n0 + 19, 10, 17, '#');
  g.fill(n0 + 28, n0 + 31, 6, 17, '#');
};

export function room(): LevelDef {
  const g = Grid.ground(15);
  paintDoorSide(g, 0);
  return {
    id: 'GTK-08',
    city: 'GTK',
    index: 8,
    name: 'Ropeway',
    nameEn: 'The cable car',
    tagline: 'The ropeway station at Deorali: the cabins come in one after another. Every visitor rides one. Not every visitor gets in.',
    hint: 'Board from the door side. A cabin that comes in with its door facing away from you has no door your side, and no step over the gap: walk round the station, over the footbridge, to the far platform, and get in through its door. The next cabin, with its door on your side, is the one going back into the shed.',
    par: 16,
    map: g.put(1, 9, '@').put(30, 5, 'E').rows(),
    build(w: World) {
      door(w);
      doorSide(w, 0, 'gtk8');
      sign(w, 0.4, 5.8, 4.2, 'ROPEWAY', 'station', null, 'deorali');
      rival(w, 2, 9, 1, taraScript(8));
      onPass(w, px(3), (w2) => tara(w2, 'Hajur! Hop in, Dad, it’s right there! | Yes! Hop in, Dad, it’s right there!', 2.4));
      collectible(w, 'gtk-momo', 29.2, 2.6);
    },
  };
}

/** act: a second span; this time the down cabin passes under the up one at the middle: drop on to it */
export const ACT_LINES: { a: Line; b: Line } = {
  a: { t0: -1, dwellEnd: 1.0, travel: 2.4, dwellMid: 1.2 },
  b: { t0: -1, dwellEnd: 1.0, travel: 2.4, dwellMid: 1.2 },
};
export function spanAct(id: string, key: string, start: number, end: number, midA: number, midB: number, colours: [string, string], advice: string, sub: string, late = false): Act {
  return {
    id,
    w: 34,
    advice,
    paint: (g, c) => {
      const x = c.x;
      g.pit(x, x + 33);
      g.fill(x, x + 4, start, 17, '#');
      g.fill(x + 29, x + 33, end, 17, '#');
    },
    build: (w, c) => {
      const x = c.x;
      // a late far cabin waits out a whole turn at its end, so it only meets yours on your second trip up
      const L = { a: { ...ACT_LINES.a }, b: { ...ACT_LINES.b, ...(late ? { dwellEnd: period(ACT_LINES.a) + ACT_LINES.a.dwellEnd } : {}) } };
      w.flags[key + 'l'] = L;
      onPass(w, c.X(1.5), (w2) => {
        L.a.t0 = L.b.t0 = w2.tick - 0.1 * 120;
      });
      const a0: [number, number] = [c.X(5), px(start)],
        am: [number, number] = [c.X(17) - CAB.w, midA],
        bm: [number, number] = [midB < midA ? c.X(17) + 4 : c.X(17) - 6, midB],
        b0: [number, number] = [c.X(29) - CAB.w, px(end)];
      stations(w, a0, [c.X(17), Math.min(midA, midB) + 16], [c.X(29), px(end)], c.X(17));
      cabin(w, L.a, a0[0], a0[1], am[0], am[1], colours[0], key);
      cabin(w, L.b, b0[0], b0[1], bm[0], bm[1], colours[1], key);
      gullyBack(w, c.X(5), c.X(29), px(Math.min(start, end) - 1));
      w.add(new Rig(c.X(0), FL + 20, px(34), 40, { cause: 'gtk-khaai', inset: 0 }));
      sign(w, x + 0.4, start - 4.6, 3.6, 'TASHI', 'station', null, sub);
    },
  };
}
export const act = spanAct(
  'gtk08-tar',
  'gtk8ac',
  6,
  12,
  px(7),
  px(10),
  ['#3E8E41', '#8E6C8A'],
  'The second span: the cabins meet at the middle again, but the far cabin stops below yours. Ride the first one out, and step off its roof on to the lower one while they’re together. It takes you down to the far deck.',
  'second span',
);
/** act: the same station, the other way about. The cabin in the bay has its door on YOUR side this time: get in
 *  from here. Walk round as in the first station and its blind side faces you; the next one is the shed's */
export const act6: Act = {
  id: 'gtk08-saamne',
  w: 32,
  advice: 'The next station: this time the cabin in the bay has its door on your side. Get in from here. Walk round to the far platform as before and you face its blind side; and the next cabin is the one going back into the shed.',
  paint: (g, c) => paintDoorSide(g, c.x),
  build: (w, c) => {
    doorSide(w, c.x, 'gtk8s', DOORSIDE, true);
    sign(w, c.x + 0.4, 5.8, 3.6, 'TASHI', 'station', null, 'door this side');
  },
};

/** door: the far station. The exit is through a docked cabin: its doors open both sides at once, for a moment */
export const DOCK = { period: 4.2, open: 2.0 };
export const ending: Ending = {
  space: 13,
  advice: 'The way out of the far station is through the docked cabin. Its doors open on both sides at once for a couple of seconds: walk straight through while they’re open, and don’t be inside when they shut, or it takes you with it.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'cabin';
    const st = { t0: -1 };
    w.flags.gtk8e = st;
    onPass(w, px(D - 11), (w2) => {
      st.t0 = w2.tick;
    });
    const x0 = px(D - 6),
      wd = 56;
    const open = (w2: World) => st.t0 >= 0 && cyc(w2, st.t0, DOCK.period) < DOCK.open;
    for (const wx of [x0, x0 + wd - 4]) {
      w.add(
        new Rig(wx, FL - 40, 4, 40, {
          solid: true,
          layer: 3,
          tick: (r, w2) => r.setSolid(!open(w2)),
          paint: (ctx, r, w2) => box(ctx, r.x, r.y + (open(w2) ? 36 : 0), r.w, open(w2) ? 4 : 40, '#C0392B'),
        }),
      );
    }
    w.add(
      new Rig(x0 + 4, FL - 40, wd - 8, 40, {
        layer: -1,
        tick: (r, w2) => {
          const p = w2.player;
          // inside when the doors shut: the cabin leaves with you
          if (!open(w2) && st.t0 >= 0 && p.x + p.w > r.x + 2 && p.x < r.x + r.w - 2) w2.die('gtk-ropeway');
        },
        paint: (ctx, r) => {
          box(ctx, r.x - 4, r.y - 4, r.w + 8, 4, '#D9D4C7');
          box(ctx, r.x, r.y, r.w, r.h, 'rgba(192,57,43,0.35)');
          box(ctx, r.x + 6, r.y + 6, r.w - 12, 12, '#BFD7EA');
        },
      }),
    );
  },
};

// shortcut: the slot in the shared docs/allocation.json still names the old family; the room's rule is F489
// door-side-boarding since round 4. Upgrade when the allocation file carries F489 for GTK-08
export const meta08 = { family: 'cabins-cross-at-midpoint', betrayals: ['cabin-cross'], ending: 'gtk-cabin-both-doors' };
