// ITA-05 Anjeer Daal: the fig canopy over the gorge. Fig clusters hang high over the drop and ripen on their own
// timeline: when one is ripe it drops to the walkway height and stays there as a platform. The colour is the order:
// the nearer to orange, the sooner it drops. A dropping cluster is wide and lands over the edges of its neighbours,
// so wait on the far side of your platform from the one that is next. At dusk (the second act) the light inverts
// the read: ripe figs go dark and the green ones glow, so the darkest is next, not the brightest.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

export interface Fig {
  /** first column of the cluster (3 tiles wide; it lands over 12 px of each neighbour) */
  c: number;
  /** seconds after the trigger it drops */
  at: number;
}
export interface Canopy {
  t0: number;
  figs: Fig[];
  rigs: Rig[];
  dusk: boolean;
}
const HIGH = FL - 120;
const LOW = FL - 24;
const W = 56;
export const FALL = 0.55;

function gorge(w: World, x0: number, x1: number) {
  w.add(
    new Rig(x0, FL + 14, x1 - x0, 40, {
      layer: 4,
      cause: 'ita-khai',
      inset: 0,
      paint: (ctx, r) => {
        const g = ctx.createLinearGradient(0, FL, 0, FL + 48);
        g.addColorStop(0, 'rgba(20,30,40,0.2)');
        g.addColorStop(1, 'rgba(8,12,20,0.95)');
        ctx.fillStyle = g;
        ctx.fillRect(r.x, FL, r.w, 48);
      },
    }),
  );
}

/** ripeness colour: 0 green .. 1 orange; at dusk the read inverts */
function figColour(k: number, dusk: boolean) {
  const r = dusk ? 1 - k : k;
  const R = Math.round(90 + 160 * r),
    G = Math.round(150 - 60 * r),
    B = Math.round(60 - 30 * r);
  return `rgb(${R},${G},${B})`;
}

function figArt(ctx: CanvasRenderingContext2D, x: number, y: number, col: string, dusk: boolean) {
  // a cluster of figs under a bunch of leaves
  ctx.fillStyle = dusk ? '#1F3A2A' : '#3F7A3A';
  ctx.beginPath();
  ctx.ellipse(x + W / 2, y - 6, W / 2 + 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = col;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x + 8 + i * 11, y + 10, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x, y + 16, W, 3);
}

/** the canopy over the gorge from the trigger column; `key` holds the state for the tests */
export function canopy(w: World, trigger: number, figs: Fig[], key: string, dusk = false): Canopy {
  const st: Canopy = { t0: -1, figs, rigs: [], dusk };
  w.flags[key] = st;
  onPass(w, px(trigger), (w2) => {
    st.t0 = w2.tick;
  });
  const last = Math.max(...figs.map((f) => f.at));
  for (const f of figs) {
    const r = w.add(
      new Rig(px(f.c), HIGH, W, 20, {
        solid: true,
        layer: 2,
        cause: 'ita-anjeer',
        inset: -36,
        live: (r2) => r2.s.falling === true,
        tick: (r2, w2) => {
          const t = st.t0 < 0 ? -1 : since(w2, st.t0);
          const k = Math.max(0, Math.min(1, t / f.at));
          r2.s.k = k;
          if (t < f.at) {
            r2.s.falling = false;
            r2.setSolid(false);
            return;
          }
          const d = t - f.at;
          if (d < FALL) {
            r2.s.falling = true;
            r2.setSolid(false);
            r2.y = HIGH + (LOW - HIGH) * (d / FALL) * (d / FALL);
            return;
          }
          if (r2.s.falling) w2.sfx('thud', r2.x, LOW);
          r2.s.falling = false;
          r2.s.down = true;
          r2.setSolid(true);
          r2.moveTo(w2, r2.x, LOW);
        },
        paint: (ctx, r2) => figArt(ctx, r2.x, r2.y, r2.s.down ? (dusk ? '#4A2A1A' : '#A0522D') : figColour(r2.s.k ?? 0, dusk), dusk),
      }),
    );
    r.setSolid(false);
    st.rigs.push(r);
  }
  void last;
  void perTick;
  return st;
}

const ROOM: Fig[] = [
  { c: 8.5, at: 1.6 },
  { c: 17, at: 3.0 },
  { c: 13, at: 5.2 },
  { c: 25, at: 6.4 },
  { c: 21, at: 8.6 },
];

export function room(): LevelDef {
  return {
    id: 'ITA-05',
    city: 'ITA',
    index: 5,
    name: 'Anjeer Daal',
    nameEn: 'The fig canopy',
    tagline: 'The way across is not there yet. It is ripening.',
    hint: 'Fig clusters hang high over the gorge and drop to the walkway when they ripen, and a dropped cluster is a platform. The colour is the order: the nearest to orange drops next. A dropping cluster is wide and lands over the edges of its neighbours, so wait on the side of your platform away from the one that is next, and step across when it has landed. Never jump for a cluster that is still up.',
    par: 30,
    map: Grid.ground(15).fill(6, 26, 15, 17, '.').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      gorge(w, px(6), px(27));
      canopy(w, 3, ROOM, 'ita5');
      onPass(w, px(3), (w2) => tara(w2, L.intro[3], 2.4));
      w.add(
        new Paint((ctx) => {
          // the canopy: a dark band of leaves across the top
          ctx.fillStyle = '#2E5A3C';
          ctx.fillRect(px(5), 0, px(23), 70);
          ctx.fillStyle = '#3F7A3A';
          for (let x = px(5); x < px(28); x += 22) ctx.fillRect(x, 60 + (x % 3) * 4, 16, 12);
        }, -3),
      );
      sign(w, 2, 10.4, 3.4, 'NAMDAPHA', 'shop', null, 'the forest');
      rival(w, 29, 15, -1, taraScript(5));
      collectible(w, 'ita-pikapila', 18.5, 10.0);
    },
  };
}

const DUSK: Fig[] = [
  { c: 6.5, at: 1.5 },
  { c: 15, at: 2.8 },
  { c: 11, at: 5.0 },
  { c: 23, at: 6.0 },
  { c: 19, at: 8.4 },
  { c: 31, at: 9.2 },
  { c: 27, at: 11.6 },
];

/** act: dusk. The same canopy, longer, and the light turns the read round: ripe goes dark, green glows. */
export const act: Act = {
  id: 'ita05-shaam',
  w: 38,
  advice: 'Dusk in the canopy, and the light turns the read round: a ripe cluster goes dark and the green ones glow. The darkest cluster drops next, not the brightest. Same rule otherwise: wait on the far side from the one that is next, and step across once it has landed.',
  cps: [34],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 32, 15, 17, '.');
  },
  build: (w, c) => {
    gorge(w, c.X(4), c.X(33));
    canopy(w, c.x + 1, DUSK.map((f) => ({ ...f, c: c.x + f.c })), 'ita5a', true);
    w.add(
      new Paint((ctx) => {
        ctx.fillStyle = 'rgba(20,20,60,0.35)';
        ctx.fillRect(c.X(0), 0, px(38), FL + 48);
        ctx.fillStyle = '#1F3A2A';
        ctx.fillRect(c.X(3), 0, px(31), 70);
      }, -2),
    );
    sign(w, c.x + 1, 10.4, 3, 'SHAAM', 'shop', null, 'dusk');
  },
};

const GILAHRI: Fig[] = [
  { c: 6.5, at: 1.4 },
  { c: 12, at: 3.6 },
  { c: 22, at: 4.4 },
  { c: 17, at: 6.8 },
  { c: 27, at: 9.0 },
];

/** act: the giant flying squirrel glides along the walkway height every few seconds, from the far end, with a chirp a
 *  second before: be on a platform's far side and let it pass under the leaves above you (it flies low over the gaps). */
export const actGilahri: Act = {
  id: 'ita05-gilahri',
  w: 36,
  advice: 'A giant flying squirrel glides along the walkway from the far end every few seconds, a chirp before it comes. It flies at head height over the gaps and climbs over each platform: be standing on a platform, not jumping, when it passes.',
  cps: [32],
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 29, 15, 17, '.');
  },
  build: (w, c) => {
    gorge(w, c.X(4), c.X(30));
    const st = canopy(w, c.x + 1, GILAHRI.map((f) => ({ ...f, c: c.x + f.c })), 'ita5b');
    const P = 5.0;
    const x1 = c.X(31),
      x0 = c.X(3);
    w.add(
      new Rig(x1, LOW - 40, 30, 16, {
        layer: 3,
        cause: 'ita-gilahri',
        inset: 2,
        live: (r) => r.s.live === true,
        tick: (r, w2) => {
          if (st.t0 < 0) {
            r.s.live = false;
            r.on = false;
            return;
          }
          const t = (since(w2, st.t0) + 0.1) % P;
          // chirp at 1.0 s into the cycle, the glide from 2.0 s to the near end at 240 px/s
          if (Math.abs(t - 1.0) < 1 / 120) w2.sfx('whistle', x1, LOW - 40);
          const g = t - 2.0;
          const flying = g >= 0 && g < (x1 - x0) / 240;
          r.on = flying;
          r.s.live = flying;
          if (!flying) return;
          r.x = x1 - g * 240;
          // over a platform it climbs clear; over a gap it comes down to head height
          const over = st.rigs.some((q) => q.s.down && r.x + 15 >= q.x - 6 && r.x + 15 < q.x + W + 6);
          r.y = over ? LOW - 52 : LOW - 30;
        },
        paint: (ctx, r) => {
          box(ctx, r.x, r.y + 4, 30, 8, '#5A3A2A');
          box(ctx, r.x + 4, r.y, 22, 4, '#7A5A4A');
          box(ctx, r.x + 26, r.y + 6, 10, 4, '#3A2A1A');
        },
      }),
    );
    sign(w, c.x + 1, 10.4, 3, 'GILAHRI', 'shop', null, 'flying squirrel');
  },
};

/** ending: the hollow. The door is in a hollow trunk, and the one fig in front of it is round: stand on its edge and it
 *  rolls under you into the gorge. Cross its middle without stopping. */
export const ending: Ending = {
  space: 16,
  advice: 'The door is in the hollow trunk, and the last cluster in front of it is round: stand on its edge and it rolls under you. Cross it over the middle and do not stop on it.',
  paint: (g, D) => {
    g.fill(D - 12, D - 3, 15, 17, '.');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'khokhla';
    gorge(w, px(D - 12), px(D - 2));
    const st = { tilt: 0, x0: px(D - 10), x1: px(D - 10) + 112 };
    w.flags.ita5e = st;
    const fig = w.add(
      new Rig(px(D - 10), LOW, 112, 20, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const p = w2.player;
          const on = w2.standing(r.solid!);
          const mid = r.x + 56;
          if (on && Math.abs(p.cx - mid) > 30) st.tilt = Math.min(1, st.tilt + 1 / 48);
          else st.tilt = Math.max(0, st.tilt - 1 / 30);
          // tilted enough and it rolls out from under you: the solid drops away for a moment
          if (st.tilt >= 1) {
            r.setSolid(false);
            r.s.rolled = (r.s.rolled ?? 0) + 1;
            if (r.s.rolled > 90) {
              r.s.rolled = 0;
              st.tilt = 0;
              r.setSolid(true);
            }
          }
        },
        paint: (ctx, r) => {
          const gone = (r.s.rolled ?? 0) > 0;
          ctx.save();
          ctx.translate(r.x + 56, r.y + 10 + (gone ? 60 : 0));
          ctx.rotate(st.tilt * 0.25);
          ctx.fillStyle = '#A0522D';
          ctx.beginPath();
          ctx.ellipse(0, 0, 56, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        },
      }),
    );
    void fig;
    w.add(
      new Paint((ctx) => {
        box(ctx, d.x - 14, FL - 90, 44, 90, '#4A3020');
        box(ctx, d.x - 10, FL - 86, 36, 86, '#2A1810');
      }, -4),
    );
  },
};

export const meta05 = { family: 'fig-ripeness-drops-platforms', betrayals: ['ripeness-timeline'], ending: 'ita-khokhla' };
