// GTK-08 Ropeway (how would I know). The cable car over the valley: two cabins, and the middle station between
// them, all in view from the start. You'd think a cabin goes end to end. Here each one is a shuttle: the lower
// cabin goes up to the middle station and comes back; the upper one comes down to the middle and goes back up.
// They meet at the middle, side by side, for a moment. Stay on yours and it takes you back into its shed. Hop
// across to the other one while they're together.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, cyc, decor, px } from './entities';
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

export const ROOM_LINES: { a: Line; b: Line } = {
  a: { t0: -1, dwellEnd: 1.2, travel: 2.6, dwellMid: 1.6 },
  b: { t0: -1, dwellEnd: 1.2, travel: 2.6, dwellMid: 1.6 },
};

export function room(): LevelDef {
  const g = Grid.ground(15);
  // the gorge under the line, the lower station deck (left) and the upper one (right)
  g.pit(0, 31);
  g.fill(0, 4, 12, 17, '#');
  g.fill(27, 31, 6, 17, '#');
  return {
    id: 'GTK-08',
    city: 'GTK',
    index: 8,
    name: 'Ropeway',
    nameEn: 'The cable car',
    tagline: 'The ropeway hangs over the valley, two cabins and a station in the middle. Every visitor rides it. Not every visitor gets across.',
    hint: 'Each cabin only goes to the middle station and back: the lower one takes you up to the middle, then straight back down into its shed, and you on the roof under the eave. The upper cabin comes down to meet it. When they stop side by side at the middle, hop across to the upper cabin, and ride it up to the far deck.',
    par: 16,
    map: g.put(1, 11, '@').put(30, 5, 'E').rows(),
    build(w: World) {
      door(w);
      const L = { a: { ...ROOM_LINES.a }, b: { ...ROOM_LINES.b } };
      w.flags.gtk8 = L;
      // the clock starts as Dad comes on to the deck, so the cabin is in when he gets there
      onPass(w, px(2), (w2) => {
        L.a.t0 = L.b.t0 = w2.tick - 0.2 * 120;
      });
      const lower: [number, number] = [px(5), px(12)],
        mid: [number, number] = [px(15) - CAB.w, px(9)],
        midB: [number, number] = [px(16) + 2, px(9) - 6],
        upper: [number, number] = [px(27) - CAB.w, px(6)];
      stations(w, lower, [px(15.5), px(9)], [px(27), px(6)], px(15.5));
      cabin(w, L.a, lower[0], lower[1], mid[0], mid[1], '#C0392B', 'gtk8c', { x0: px(3), x1: px(8) });
      cabin(w, L.b, upper[0], upper[1], midB[0], midB[1], '#2E86AB', 'gtk8c');
      decor(w, 3, (ctx) => {
        // the lower station's shed: its eave over the dock
        box(ctx, px(0), px(12) - 34, px(8) + 4, 6, '#5E5A50');
        box(ctx, px(0), px(12) - 28, 4, 28, '#5E5A50');
        box(ctx, px(27) - 4, px(6) - 34, px(5) + 4, 6, '#5E5A50');
      });
      w.add(new Rig(px(0), FL + 20, px(32), 40, { cause: 'gtk-khaai', inset: 0 }));
      sign(w, 0.4, 6.8, 4.2, 'ROPEWAY', 'station', null, 'deorali');
      rival(w, 2, 12, 1, taraScript(8));
      onPass(w, px(3), (w2) => tara(w2, 'Hajur! Stay on, Dad, all the way! | Yes! Stay on, Dad, all the way!', 2.4));
      onPass(w, px(6), (w2) => npc(w2, 'Hajur! | Yes!', px(2), px(12) - 40, 1.0));
      collectible(w, 'gtk-momo', 29.2, 2.6);
    },
  };
}

/** act: a second span; this time the down cabin passes under the up one at the middle: drop on to it */
export const ACT_LINES: { a: Line; b: Line } = {
  a: { t0: -1, dwellEnd: 1.0, travel: 2.4, dwellMid: 1.2 },
  b: { t0: -1, dwellEnd: 1.0, travel: 2.4, dwellMid: 1.2 },
};
export const act: Act = {
  id: 'gtk08-tar',
  w: 34,
  advice: 'The second span: the cabins meet at the middle again, but the far cabin stops below yours. Ride the first one out, and step off its roof on to the lower one while they’re together. It takes you down to the far deck.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + 33);
    g.fill(x, x + 4, 6, 17, '#');
    g.fill(x + 29, x + 33, 12, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const L = { a: { ...ACT_LINES.a }, b: { ...ACT_LINES.b } };
    w.flags.gtk8a = L;
    onPass(w, c.X(1.5), (w2) => {
      L.a.t0 = L.b.t0 = w2.tick - 0.1 * 120;
    });
    const start: [number, number] = [c.X(5), px(6)],
      mid: [number, number] = [c.X(17) - CAB.w, px(7)],
      midB: [number, number] = [c.X(17) - 6, px(10)],
      end: [number, number] = [c.X(29) - CAB.w, px(12)];
    stations(w, start, [c.X(17), px(8)], [c.X(29), px(12)], c.X(17));
    cabin(w, L.a, start[0], start[1], mid[0], mid[1], '#3E8E41', 'gtk8ac');
    cabin(w, L.b, end[0], end[1], midB[0], midB[1], '#8E6C8A', 'gtk8ac');
    w.add(new Rig(c.X(0), FL + 20, px(34), 40, { cause: 'gtk-khaai', inset: 0 }));
    sign(w, x + 0.4, 1.4, 3.6, 'TASHI', 'station', null, 'second span');
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

export const meta08 = { family: 'cabins-cross-at-midpoint', betrayals: ['cabin-cross'], ending: 'gtk-cabin-both-doors' };
