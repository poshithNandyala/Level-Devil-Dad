// PAT-09 Sonepur Mela: the great fair, tough but knowable. The crowd is a wall of people; it parts only behind a
// horse rider and closes again at once, so you walk in the gap he makes. Then the giant wheel: its gondolas are
// platforms you ride across the gap, and a gondola with a fairgoer in it swings you off. Door: the spinning gate.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk, perTick } from './entities';
import { cyc, since, taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;
const GAP_W = 56;

export interface GapRun {
  horse: Rig;
  L: Rig;
  R: Rig;
  x0: number;
  x1: number;
  t0: number;
  v: number;
  /** gap window [a, b] at this moment (px) */
  win: () => [number, number];
}

/** a stretch of fair crowd between x0 and x1 (px) that parts behind a horse rider, who starts when Dad is near */
export function gapRun(w: World, x0: number, x1: number, v: number, key: string, pause?: { at: number; secs: number }): GapRun {
  const g = { t0: -1 } as GapRun;
  g.x0 = x0;
  g.x1 = x1;
  g.v = v;
  const hx = (w2: World) => {
    if (g.t0 < 0) return x0 + 6;
    const t = since(w2, g.t0);
    let d = t * v;
    if (pause) {
      const td = (pause.at - x0) / v;
      d = t <= td ? t * v : t < td + pause.secs ? td * v : (t - pause.secs) * v;
    }
    return Math.min(x1 + 90, x0 + 6 + d);
  };
  const horse = w.add(
    new Rig(x0 + 6, FL - 26, 40, 26, {
      solid: true,
      layer: 3,
      tick: (r, w2) => {
        r.moveTo(w2, hx(w2), r.y);
        r.solid!.velX = g.t0 < 0 ? 0 : v;
        if (r.x > x1 + 50) {
          r.solid!.collidable = false;
          r.on = false;
        }
      },
      paint: (ctx, r, w2) => {
        // a horse in a red saddle-cloth, its rider with a turban, trotting
        const b = Math.sin(w2.tick / 6) * 1;
        box(ctx, r.x + 6, r.y + 8 + b, 28, 12, '#6B3F1C');
        box(ctx, r.x + 30, r.y + b, 8, 12, '#6B3F1C');
        box(ctx, r.x + 36, r.y + 1 + b, 5, 5, '#4A2A10');
        box(ctx, r.x + 8, r.y + 20, 3, 6, '#4A2A10');
        box(ctx, r.x + 28, r.y + 20, 3, 6, '#4A2A10');
        box(ctx, r.x + 10, r.y + 8 + b, 16, 5, '#D7262E');
        folk(ctx, r.x + 17, r.y - 14 + b, 20, '#F2B705');
        box(ctx, r.x + 12, r.y - 17 + b, 10, 4, '#D7262E');
      },
    }),
  );
  const win = (): [number, number] => [horse.x - GAP_W, horse.x + 40 + 20];
  const mk = (left: boolean) =>
    w.add(
      new Rig(left ? x0 : x1, FL - 80, 0, 80, {
        layer: 3,
        cause: 'pat-bheed',
        inset: 2,
        tick: (r) => {
          const [a, b] = win();
          if (left) {
            r.x = x0;
            r.w = Math.max(0, Math.min(a, x1) - x0);
          } else {
            r.x = Math.max(b, x0);
            r.w = Math.max(0, x1 - r.x);
          }
          r.on = r.w > 2;
        },
        paint: (ctx, r, w2) => {
          const cols = ['#D7262E', '#2F6BB0', '#F2B705', '#6F8F3A', '#8A4A8F', '#E07A2A'];
          for (let x = r.x + 5; x < r.x + r.w - 3; x += 10) {
            const i = Math.floor(x / 10);
            folk(ctx, x, FL - 30 - ((i * 7) % 3) - (((w2.tick >> 4) + i) % 2), 30, cols[i % 6], { sack: i % 3 === 0 ? '#C9A56B' : undefined });
          }
          // bunting overhead
          for (let x = r.x; x < r.x + r.w; x += 12) box(ctx, x, FL - 66 + ((x >> 2) % 3), 5, 4, cols[(x >> 3) % 6]);
        },
      }),
    );
  g.horse = horse;
  g.L = mk(true);
  g.R = mk(false);
  g.win = win;
  w.flags[key] = g;
  // the horse sets off when Dad is near the start of the crowd
  w.when(
    (w2) => w2.player.cx >= x0 - 56,
    (w2) => {
      g.t0 = w2.tick;
      w2.sfx('honk', x0, FL - 30);
    },
  );
  return g;
}

export function room(): LevelDef {
  return {
    id: 'PAT-09',
    city: 'PAT',
    index: 9,
    name: 'Sonepur Mela',
    nameEn: 'The great fair',
    tagline: 'Two million people, and every one of them is going the other way.',
    hint: 'The crowd is solid from top to bottom: you cannot hop it. It parts only for a horse rider and closes behind him. Stay in the gap just behind the horse and walk at his pace. Later the giant wheel: ride an empty gondola across the pit and jump off at the far side; a gondola with a fairgoer in it swings you off. At the door the gate spins: pass under it just after an arm has gone by.',
    par: 75,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      gapRun(w, px(10), px(26), 52, 'pat9');
      w.add(
        new Paint((ctx) => {
          // a fair: striped tents behind, a pennant string
          for (let i = 0; i < 4; i++) {
            const x = px(9) + i * 90;
            ctx.fillStyle = i % 2 ? '#D7262E' : '#F2B705';
            ctx.beginPath();
            ctx.moveTo(x, FL - 70);
            ctx.lineTo(x + 40, FL - 104);
            ctx.lineTo(x + 80, FL - 70);
            ctx.fill();
            box(ctx, x + 4, FL - 70, 72, 30, i % 2 ? '#F2D7A6' : '#E5B7A0');
          }
        }, -6),
      );
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.win[1], 2.4);
          },
        }),
      );
      sign(w, 4, 10.4, 3.4, 'SONEPUR', 'shop', null, 'Harihar mela');
      rival(w, 29, 15, -1, taraScript(9));
      collectible(w, 'pat-sattu', 19, 6.4);
    },
  };
}

// ---------------------------------------------------------------- the wheel
export const WHEEL = { R: 64, omega: 0.55, n: 6, occupied: [true, false, false, false, true, false], t0: -1 as number };

const wrap = (a: number) => {
  let t = a % (2 * Math.PI);
  if (t > Math.PI) t -= 2 * Math.PI;
  if (t <= -Math.PI) t += 2 * Math.PI;
  return t;
};

function wheel(w: World, cx: number, key: string, triggerX: number) {
  const st = { t0: -1, gond: [] as Rig[], cx };
  const theta0 = (k: number) => ((-100 + k * 60) * Math.PI) / 180;
  const theta = (k: number, w2: World) => wrap(theta0(k) + (st.t0 < 0 ? 0 : since(w2, st.t0)) * WHEEL.omega);
  const cy = FL - WHEEL.R;
  w.add(
    new Paint((ctx, w2) => {
      const a = st.t0 < 0 ? 0 : since(w2, st.t0) * WHEEL.omega;
      ctx.strokeStyle = '#8A8F96';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, WHEEL.R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 12; i++) {
        const t = a + (i * Math.PI) / 6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.sin(t) * WHEEL.R, cy + Math.cos(t) * WHEEL.R);
        ctx.stroke();
      }
      box(ctx, cx - 5, cy - 5, 10, 10, '#D7262E');
      box(ctx, cx - 14, cy + 6, 4, FL - cy - 6, '#6B6F76');
      box(ctx, cx + 10, cy + 6, 4, FL - cy - 6, '#6B6F76');
    }, -2),
  );
  for (let k = 0; k < WHEEL.n; k++) {
    const occ = WHEEL.occupied[k];
    const g = w.add(
      new Rig(cx - 16, FL, 32, 10, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const th = theta(k, w2);
          const x = cx + Math.sin(th) * WHEEL.R - 16;
          const y = cy + Math.cos(th) * WHEEL.R;
          r.s.th = th;
          // a gondola with a fairgoer in it swings out from under whoever steps on: the solid goes for a moment
          const on = w2.standing(r.solid!);
          if (occ && on && !r.s.swing) r.s.swing = 1;
          if (r.s.swing) {
            r.s.swing++;
            r.solid!.collidable = r.s.swing < 16 || r.s.swing > 200;
            if (r.s.swing > 240) r.s.swing = 0;
          }
          r.solid!.velX = st.t0 < 0 ? 0 : WHEEL.omega * WHEEL.R * Math.cos(th) * 1;
          r.moveTo(w2, Math.round(x), Math.round(y));
        },
        paint: (ctx, r) => {
          const sw = r.s.swing > 0 && r.s.swing < 40 ? Math.sin(r.s.swing / 3) * 5 : 0;
          box(ctx, r.x + sw, r.y, r.w, 10, occ ? '#2F6BB0' : '#D7262E');
          box(ctx, r.x + sw, r.y, r.w, 2, '#fff');
          box(ctx, r.x + 2 + sw, r.y - 14, 2, 14, '#8A8F96');
          box(ctx, r.x + r.w - 4 + sw, r.y - 14, 2, 14, '#8A8F96');
          if (occ) folk(ctx, r.x + 16 + sw, r.y - 26, 26, '#F2B705');
        },
      }),
    );
    st.gond.push(g);
  }
  w.flags[key] = st;
  w.when(
    (w2) => w2.player.cx >= triggerX,
    (w2) => {
      st.t0 = w2.tick;
    },
  );
  return st;
}

export const act: Act = {
  id: 'pat09-jhoola',
  w: 60,
  advice: 'The giant wheel: a pit under it, and its gondolas swing across. A gondola with a fairgoer sitting in it (blue, with a person) drops you through. Wait for an empty red one, hop on as it comes down the near side, and hop off on to the far bank before it climbs. Then another crowd and a faster horse: stay right behind him, and he stops once to let a family by.',
  cps: [20, 57],
  paint: (g, c) => {
    g.fill(c.x + 8, c.x + 16, 15, 17, '.');
  },
  build: (w, c) => {
    const cxw = px(c.x + 8) + 72;
    wheel(w, cxw, 'pat9w', px(c.x + 5));
    w.add(
      new Rig(px(c.x + 8), 256, px(9), 30, {
        layer: 4,
        cause: 'pat-jhoola',
        inset: 0,
        paint: (ctx, r) => {
          ctx.fillStyle = 'rgba(40,30,20,0.92)';
          ctx.fillRect(r.x, r.y, r.w, 30);
        },
      }),
    );
    gapRun(w, px(c.x + 24), px(c.x + 54), 68, 'pat9b', { at: px(c.x + 38), secs: 1.2 });
    sign(w, c.x + 3, 10.4, 3.4, 'JHOOLA', 'shop', null, 'giant wheel');
  },
};

export const ending: Ending = {
  space: 14,
  advice: 'The last gate is a turnstile of four arms spinning round: the arm that points down sweeps the road. Wait until one has swept by, run under the pivot, and out the other side before the next comes round.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'turnstile';
    const PIV = { x: px(D - 5) + 8, y: FL - 34 };
    const A = 2.0;
    const ang = (w2: World) => w2.tick / 120 * A;
    // two arms, opposite: the lower tip sweeps the ground; hazard when an arm points within ~38 degrees of straight down
    w.add(
      new Rig(PIV.x - 14, FL - 36, 28, 36, {
        layer: 3,
        cause: 'pat-charkhi',
        inset: 0,
        live: (_r, w2) => {
          const a = ang(w2);
          const down = Math.cos(a) > 0.8 || Math.cos(a) < -0.8;
          return down;
        },
        paint: (ctx, _r, w2) => {
          const a = ang(w2);
          ctx.strokeStyle = '#6B3F1C';
          ctx.lineWidth = 3;
          for (const off of [0, Math.PI]) {
            ctx.beginPath();
            ctx.moveTo(PIV.x, PIV.y);
            ctx.lineTo(PIV.x + Math.sin(a + off) * 34, PIV.y + Math.cos(a + off) * 34);
            ctx.stroke();
          }
          box(ctx, PIV.x - 3, PIV.y - 3, 6, 6, '#D7262E');
          box(ctx, PIV.x - 2, PIV.y - 40, 4, 40, '#6B6F76');
        },
      }),
    );
    w.flags.pat9e = { A, pivx: PIV.x };
  },
};

export const meta09 = { family: 'moving-gap-behind-rider', betrayals: ['moving-gap', 'gondola-swing'], ending: 'pat-charkhi' };
void cyc;
void perTick;
