// GTK-07 Badal (the cloud in the street). In the monsoon the cloud sits on Gangtok's roads. It doesn't block
// anything: it hides where the road ends. Along the edge runs the kerb rope on its posts, and where the edge
// has gone the posts have gone with it: a gap in the rope is a gap in the road. Then the rope is down for
// repairs and you wait in the shelter for the cloud to lift and look; then the cloud lifts on a road that looks
// whole, because the retaining wall behind it is painted with a road; then the cloud rolls up behind you.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import type { World as W } from '../../world';
import { FL, Rig, box, cyc, decor, px } from './entities';
import { taraScript } from './common';

/** the cloud's clock for a stretch: thick for `thick` seconds, then lifts for `clear` (from when Dad arrives) */
export interface Cloud {
  t0: number;
  thick: number;
  clear: number;
  /** a cloud bank rolling in from the left at this speed (px/s) instead of a clock */
  roll?: number;
  /** a cloud bank drifting away ahead of you at this speed (px/s): it covers everything beyond its back edge */
  ahead?: number;
  front?: number;
}
export const isClear = (w: W, c: Cloud) => {
  if (c.roll || c.ahead) return false;
  if (c.t0 < 0) return false;
  return cyc(w, c.t0, c.thick + c.clear) >= c.thick;
};

/** the fog over columns c0..c1: drawn over the road (above the tiles, below Dad), clear when the clock says */
export function fog(w: World, c0: number, c1: number, cloud: Cloud | null) {
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Rig(x0, 0, x1 - x0, FL + 48, {
      layer: 2,
      tick: (_r, w2) => {
        if (cloud?.roll && cloud.t0 >= 0) cloud.front = x0 + ((w2.tick - cloud.t0) / 120) * cloud.roll;
        if (cloud?.ahead) cloud.front = x0 + Math.max(0, (w2.tick - cloud.t0) / 120) * cloud.ahead * (cloud.t0 >= 0 ? 1 : 0);
      },
      paint: (ctx, r, w2) => {
        let a = 1;
        if (cloud && !cloud.roll && cloud.t0 >= 0) {
          const u = cyc(w2, cloud.t0, cloud.thick + cloud.clear);
          // thins over 0.3 s, stays clear, thickens over 0.3 s
          if (u >= cloud.thick) a = Math.max(0, 1 - Math.min(u - cloud.thick, cloud.thick + cloud.clear - u) / 0.3);
        }
        let rx1 = r.x + r.w;
        let rx0 = r.x;
        if (cloud?.ahead) rx0 = Math.max(r.x, cloud.front ?? r.x);
        if (rx0 >= rx1) return;
        if (cloud?.roll) {
          if (cloud.t0 < 0) return;
          rx1 = Math.min(rx1, cloud.front ?? r.x);
          if (rx1 <= r.x) return;
        }
        if (a <= 0) return;
        const g = ctx.createLinearGradient(0, 120, 0, FL + 40);
        g.addColorStop(0, `rgba(236,239,241,${0.35 * a})`);
        g.addColorStop(0.45, `rgba(236,239,241,${0.93 * a})`);
        g.addColorStop(1, `rgba(236,239,241,${0.98 * a})`);
        ctx.fillStyle = g;
        ctx.fillRect(rx0, 110, rx1 - rx0, FL + 60 - 110);
        // soft puffs along the top so it reads as cloud, not a wall
        ctx.fillStyle = `rgba(245,247,248,${0.6 * a})`;
        for (let x = rx0 + 8; x < rx1; x += 26) {
          ctx.beginPath();
          ctx.arc(x + ((w2.tick >> 4) % 6), 116 + ((x * 7) % 9), 16, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    }),
  );
}

/** the kerb rope: posts every two columns from c0 to c1, none over the pits; drawn over the fog */
export function rope(w: World, c0: number, c1: number, pits: [number, number][]) {
  const posts: number[] = [];
  for (let c = c0; c <= c1; c += 2) if (!pits.some(([a, b]) => c >= a - 1 && c <= b + 1)) posts.push(c);
  decor(w, 3, (ctx) => {
    for (let i = 0; i < posts.length; i++) {
      const x = px(posts[i]) + 8;
      box(ctx, x - 1.5, FL - 18, 3, 18, '#F4F1EA');
      box(ctx, x - 1.5, FL - 18, 3, 4, '#E07A5F');
      const nx = posts[i + 1];
      if (nx === posts[i] + 2) {
        ctx.strokeStyle = '#F4D35E';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, FL - 15);
        ctx.quadraticCurveTo(x + 16, FL - 10, x + 32, FL - 15);
        ctx.stroke();
      }
    }
  });
  return posts;
}

/** a deadly drop under each pit (so the death names the cloud), with its cause */
function drops(w: World, pits: [number, number][], cause: string) {
  for (const [a, b] of pits) w.add(new Rig(px(a), FL + 20, px(b - a + 1), 40, { cause, inset: 0 }));
}

/** the painted retaining wall: a road drawn over the holes, seen only when the cloud is up (it's on the wall behind) */
function mural(w: World, pits: [number, number][]) {
    decor(w, -3, (ctx) => {
      for (const [a, b] of pits) {
        const x0 = px(a),
          ww = px(b - a + 1);
        box(ctx, x0 - 8, FL - 80, ww + 16, 80, '#C9C2B2');
        box(ctx, x0, FL, ww, 16, '#B9B3A5');
        box(ctx, x0, FL, ww, 4, '#D9D4C7');
        box(ctx, x0, FL + 4, ww, 2, '#8C8678');
        box(ctx, x0 + 4, FL - 40, ww - 8, 2, 'rgba(90,80,70,0.25)');
      }
    });
}

const ROOM_PITS: [number, number][] = [
  [9, 10],
  [16, 17],
  [24, 25],
];

export function room(): LevelDef {
  const g = Grid.ground(15);
  for (const [a, b] of ROOM_PITS) g.pit(a, b);
  return {
    id: 'GTK-07',
    city: 'GTK',
    index: 7,
    name: 'Badal',
    nameEn: 'The cloud in the street',
    tagline: 'Monsoon in Gangtok: the cloud comes down and sits in the road. It doesn’t stop you. It just hides where the road stops.',
    hint: 'The cloud hides the edge of the road. The kerb rope runs along it on posts, and where the edge has gone the posts have gone too: wherever the rope stops, the road stops. Walk along by the rope and jump each gap in it.',
    par: 14,
    map: g.put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      fog(w, 5, 31, null);
      rope(w, 3, 31, ROOM_PITS);
      drops(w, ROOM_PITS, 'gtk-badal');
      sign(w, 1.4, 9.6, 4.4, 'GHAT ROAD', 'warn', null, 'fog: go slow');
      rival(w, 3, 15, 1, taraScript(7));
      onPass(w, px(3.5), (w2) => tara(w2, 'Ke cha haal khabar? Just run! | What’s the news? Just run!', 2.2));
      collectible(w, 'gtk-selroti', 17, 10.8);
    },
  };
}

/** act 1 (shelter): the rope is down for repairs. Wait under the tea-stall awning for the cloud to lift, look */
export const THAU_PITS = [
  [6, 7],
  [12, 13],
  [19, 20],
  [26, 27],
  [33, 34],
];
// round 4: a shorter thick spell under the awning, so the wait replays in under 7.5 s (the holes are as before)
export const THAU: Cloud = { t0: -1, thick: 2.6, clear: 1.8 };
export const thauAct = (id: string, PITS: number[][], CL: Cloud, key: string): Act => ({
  id,
  w: 40,
  advice: 'The rope is down for repairs. Wait under the tea-stall awning: every few seconds the cloud lifts for a moment. Look then, and go while you can see the holes, jumping each one.',
  paint: (g, c) => {
    for (const [a, b] of PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const cl: Cloud = { ...CL };
    w.flags[key] = cl;
    onPass(w, c.X(1), (w2) => {
      cl.t0 = w2.tick;
    });
    fog(w, c.x + 4, c.x + 39, cl);
    drops(
      w,
      PITS.map(([a, b]) => [c.x + a, c.x + b]),
      'gtk-badal',
    );
    decor(w, -2, (ctx) => {
      // the tea stall's awning: a calm spot
      box(ctx, c.X(0), FL - 44, px(4), 5, '#E07A5F');
      box(ctx, c.X(0), FL - 39, 3, 39, '#5E5A50');
      box(ctx, c.X(4) - 3, FL - 39, 3, 39, '#5E5A50');
    });
    sign(w, c.x + 0.4, 8.6, 4.4, 'ROPE REPAIR', 'warn', null, 'wait for clear');
  },
});

/** act 2: the rope again, and the cloud lifting on a road that looks whole: the wall behind is painted */
export const CHITRA_PITS = [
  [8, 9],
  [17, 18],
  [26, 27],
];
export const CHITRA: Cloud = { t0: -1, thick: 3.6, clear: 1.6 };
export const chitraAct = (id: string, PITS: number[][], CL: Cloud, key: string): Act => ({
  id,
  w: 32,
  advice: 'Now the cloud lifts on a road that looks whole: the retaining wall behind it is painted with the road going on. The rope is back, and it doesn’t lie: where the rope stops, jump, however solid it looks.',
  paint: (g, c) => {
    for (const [a, b] of PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const cl: Cloud = { ...CL };
    w.flags[key] = cl;
    onPass(w, c.X(1), (w2) => {
      cl.t0 = w2.tick;
    });
    const pits = PITS.map(([a, b]) => [c.x + a, c.x + b] as [number, number]);
    mural(w, pits);
    fog(w, c.x, c.x + 31, cl);
    rope(w, c.x + 1, c.x + 31, pits);
    drops(w, pits, 'gtk-deewar');
    sign(w, c.x + 13, 8.4, 4.4, 'MURAL', 'shop', null, 'clean Gangtok');
  },
});

/** act 3 (momentum): clear air, and a cloud bank rolling up the road behind you. Keep going */
export const GHUMTI_PITS = [
  [5, 6],
  [11, 12],
  [17, 18],
  [25, 26],
  [32, 33],
];
export const GHUMTI: Cloud = { t0: -1, thick: 0, clear: 0, roll: 92 };
export const ghumtiAct = (id: string, PITS: number[][], CL: Cloud, key: string): Act => ({
  id,
  w: 40,
  advice: 'Clear air at last, and no rope: the holes are there to see. But a cloud bank is rolling up the road behind you, quicker than a walk. Keep moving and jump the holes before it swallows them.',
  paint: (g, c) => {
    for (const [a, b] of PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const cl: Cloud = { ...CL };
    w.flags[key] = cl;
    onPass(w, c.X(1.5), (w2) => {
      cl.t0 = w2.tick;
    });
    fog(w, c.x - 2, c.x + 39, cl);
    drops(
      w,
      PITS.map(([a, b]) => [c.x + a, c.x + b]),
      'gtk-badal',
    );
    sign(w, c.x + 37, 9.4, 3.6, 'HAIRPIN', 'warn', null, 'gangtok 2 km');
  },
});

export const act1 = thauAct('gtk07-thau', THAU_PITS, THAU, 'gtk7a');
export const act2 = chitraAct('gtk07-chitra', CHITRA_PITS, CHITRA, 'gtk7b');
export const act3 = ghumtiAct('gtk07-ghumti', GHUMTI_PITS, GHUMTI, 'gtk7c');
/** the last stretch: clear air, the cloud bank behind you again, the rope back, and the painted wall too: run,
 *  and jump where the rope stops even where the road looks whole */
export const act7: Act = {
  id: 'gtk07-dagar',
  w: 40,
  advice: 'The last stretch: the cloud bank is behind you again, the rope is back, and so is the painted wall. Keep running, and jump wherever the rope stops, even where the road looks whole.',
  paint: (g, c) => {
    for (const [a, b] of DAGAR_PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const cl: Cloud = { t0: -1, thick: 0, clear: 0, roll: 96 };
    w.flags.gtk7g = cl;
    onPass(w, c.X(1.5), (w2) => {
      cl.t0 = w2.tick;
    });
    const pits = DAGAR_PITS.map(([a, b]) => [c.x + a, c.x + b] as [number, number]);
    mural(w, pits.filter((_p, i) => i % 2 === 1));
    fog(w, c.x - 2, c.x + 39, cl);
    rope(w, c.x + 1, c.x + 39, pits);
    drops(w, pits, 'gtk-deewar');
    sign(w, c.x + 36.5, 9.4, 3.8, 'GANGTOK', 'green', null, '1 km');
  },
};
export const DAGAR_PITS: [number, number][] = [
  [5, 6],
  [11, 12],
  [17, 18],
  [23, 24],
  [29, 30],
  [34, 35],
];
/** two tea stalls on one long stretch with the rope down: wait under each for the cloud to lift, look, go */
export const SHELTERS = [1, 30];
export const chaiAct = (id: string, PITS: [number, number][], CL: Cloud, key: string): Act => ({
  id,
  w: 60,
  advice: 'A long stretch with the rope down and two tea stalls on it. Wait under the first awning for the cloud to lift, look, go; the cloud comes back before the end, so wait again under the second.',
  cps: [SHELTERS[1] + 1],
  paint: (g, c) => {
    for (const [a, b] of PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const cl: Cloud = { ...CL };
    w.flags[key] = cl;
    onPass(w, c.X(1), (w2) => {
      cl.t0 = w2.tick;
    });
    fog(w, c.x + 4, c.x + 59, cl);
    drops(
      w,
      PITS.map(([a, b]) => [c.x + a, c.x + b] as [number, number]),
      'gtk-badal',
    );
    decor(w, -2, (ctx) => {
      for (const s0 of SHELTERS) {
        box(ctx, c.X(s0 - 1), FL - 44, px(4), 5, '#E07A5F');
        box(ctx, c.X(s0 - 1), FL - 39, 3, 39, '#5E5A50');
        box(ctx, c.X(s0 + 3) - 3, FL - 39, 3, 39, '#5E5A50');
      }
    });
    sign(w, c.x + 0.4, 8.6, 3.8, 'CHIYA', 'shop', null, 'wait for clear');
  },
});
export const act10 = chaiAct('gtk07-chiya', [[6, 7], [11, 12], [17, 18], [23, 24], [35, 36], [41, 42], [47, 48], [53, 54]], { t0: -1, thick: 5.2, clear: 1.6 }, 'gtk7j');
export const act12 = ghumtiAct('gtk07-jaldi', [[4, 5], [8, 9], [13, 14], [18, 19], [23, 24], [28, 29], [33, 34], [37, 38]], { t0: -1, thick: 0, clear: 0, roll: 110 }, 'gtk7l');
/** door: up the hillside in thick cloud; the rope's posts climb with the hidden steps, the only guide to them */
export const ending: Ending = {
  space: 12,
  advice: 'The door is up on the hillside, hidden in the cloud. The rope climbs to it: follow its posts up the steps you can’t see, one hop at a time.',
  paint: (g, D) => {
    g.fill(D - 1, D + 4, 10, 14, '#');
    g.put(D, 14, '.');
    g.fill(D, D, 10, 14, '#');
    g.put(D, 9, 'E');
    for (const [c, r] of [
      [D - 9, 14],
      [D - 7, 13],
      [D - 5, 12],
      [D - 3, 11],
    ])
      g.fill(c, c + 1, r, 14, '#');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'rope';
    fog(w, D - 11, D + 4, null);
    decor(w, 3, (ctx) => {
      const tops: [number, number][] = [
        [D - 9, 14],
        [D - 7, 13],
        [D - 5, 12],
        [D - 3, 11],
        [D - 1, 10],
      ];
      ctx.strokeStyle = '#F4D35E';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      tops.forEach(([c, r], i) => {
        const x = px(c) + 8,
          y = px(r) - 11;
        box(ctx, px(c) + 6, px(r) - 14, 3, 14, '#F4F1EA');
        box(ctx, px(c) + 6, px(r) - 14, 3, 4, '#E07A5F');
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  },
};

export const meta07 = { family: 'fog-hides-edge-rope-gaps', betrayals: ['fog-edge'], ending: 'gtk-rope-climbs-to-door' };
