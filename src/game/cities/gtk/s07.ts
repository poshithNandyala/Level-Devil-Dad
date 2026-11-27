// GTK-07 Badal (the cloud in the street). In the monsoon the cloud sits on Gangtok's roads. It doesn't block
// anything: it hides where the road ends. Along the edge runs the kerb rope on its posts, and where the edge
// has gone the posts have gone with it: a gap in the rope is a gap in the road. Then the rope is down for
// repairs and you wait in the shelter for the cloud to lift and look; then the cloud lifts on a road that looks
// whole, because the retaining wall behind it is painted with a road; then the cloud rolls up behind you.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
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
export const act10 = chaiAct('gtk07-chiya', [[6, 7], [11, 12], [17, 18], [23, 24], [35, 36], [41, 42], [47, 48], [53, 54]], { t0: -1, thick: 3.0, clear: 1.6 }, 'gtk7j');
export const act12 = ghumtiAct('gtk07-jaldi', [[4, 5], [8, 9], [13, 14], [18, 19], [23, 24], [28, 29], [33, 34], [37, 38]], { t0: -1, thick: 0, clear: 0, roll: 110 }, 'gtk7l');
/** F485 walk-to-sound (the sound beat): thick cloud, and the lower road has slid away under the kerb rope, which
 *  went down with it. The mule train resting on the path above rings its bells: walk to the sound, up on to that
 *  path and past them. Wait for the bells to come to you and the train comes down on to the road, through you */
export const GHANTI = { start: 3.4, speed: 60, ring: 1.0 };
export const act13: Act = {
  id: 'gtk07-ghanti',
  w: 34,
  advice: 'Thick cloud, and the road ahead has slid away, rope and all. Listen: the mule train is resting on the path above, ringing its bells. Walk to the sound: up on to that path, and on past them before they move off down towards you.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 12, x + 18);
    // the path above: a step up, then the path, which you can walk under
    g.fill(x + 3, x + 8, 13, 13, '=');
    g.fill(x + 6, x + 30, 12, 12, '=');
  },
  build: (w, c) => {
    const st = { t0: -1, walking: false };
    w.flags.gtk7g = st;
    onPass(w, c.X(2), (w2) => {
      if (st.t0 < 0) st.t0 = w2.tick;
    });
    fog(w, c.x + 3, c.x + 33, null);
    drops(w, [[c.x + 12, c.x + 18]], 'gtk-badal');
    rope(w, c.x + 1, c.x + 11, []);
    rope(w, c.x + 19, c.x + 33, []);
    // the rope that went down with the slide: its posts lean down into the hole
    decor(w, 3, (ctx) => {
      for (let i = 0; i < 3; i++) box(ctx, c.X(12.5 + i * 2.2), FL - 6 + i * 10, 3, 14, '#F4F1EA');
    });
    const upY = px(12) - 22,
      lowY = FL - 22;
    for (const [k, x0] of [[0, c.X(10)], [1, c.X(11.6)]] as [number, number][]) {
      w.add(
        new Rig(x0, upY, 22, 22, {
          layer: 1,
          cause: 'gtk-khachar',
          inset: 2,
          live: () => st.walking,
          tick: (r, w2) => {
            if (st.t0 < 0) return;
            const u = (w2.tick - st.t0) / 120;
            if (k === 0 && u % GHANTI.ring < 1 / 120) npc(w2, 'Ting! | Ting!', r.x + 10, upY - 20, 0.6);
            if (u < GHANTI.start) return;
            st.walking = true;
            r.x -= GHANTI.speed / 120;
            // down the step on to the road, and on towards the start
            if (r.x < c.X(6)) r.y = Math.min(lowY, r.y + 1.5);
          },
          paint: (ctx, r) => {
            box(ctx, r.x + 2, r.y + 6, 18, 9, '#7A6250');
            box(ctx, r.x - 3, r.y + 2, 6, 8, '#7A6250');
            for (const lx of [r.x + 3, r.x + 16]) box(ctx, lx, r.y + 15, 3, 7, '#4A3B30');
            box(ctx, r.x + 4, r.y + 2, 12, 5, '#C0392B');
            box(ctx, r.x - 2, r.y + 10, 3, 3, '#F4D35E');
          },
        }),
      );
    }
    sign(w, c.x + 0.6, 8.6, 4.2, 'NH 10', 'green', null, 'mule track above');
  },
};

/** F486 drip-line-shelter: a shower comes through the cloud. Somewhere above, a balcony the cloud hides keeps it
 *  off: when the rain starts it drips in a line on to the road along its edges. Stand between the drip lines.
 *  The tea-stall awning you remember from the last stall has gone with the stall, and the road with it */
export const PAANI = { start: 2.4, rain: 3.0, slip: 2.0, roof: [5, 8.5] as [number, number], gap: [10, 11] as [number, number] };
export const act14: Act = {
  id: 'gtk07-paani',
  w: 30,
  advice: 'A shower comes through the cloud, and out in it the wet slope takes your feet. When it starts, look at the road: where it drips in a line, a balcony is up there in the cloud. Stand between the drip lines till it stops. The tea-stall awning is not where you remember it.',
  paint: (g, c) => {
    g.pit(c.x + PAANI.gap[0], c.x + PAANI.gap[1]);
  },
  build: (w, c) => {
    const st = { t0: -1, wet: 0, raining: false, over: false };
    w.flags.gtk7p = st;
    onPass(w, c.X(1), (w2) => {
      if (st.t0 < 0) st.t0 = w2.tick;
    });
    const [r0, r1] = PAANI.roof.map((k) => c.X(k));
    fog(w, c.x + 3, c.x + 29, null);
    drops(w, [[c.x + PAANI.gap[0], c.x + PAANI.gap[1]]], 'gtk-khaai');
    rope(w, c.x + 1, c.x + 29, [[c.x + PAANI.gap[0], c.x + PAANI.gap[1]]]);
    // the balcony up in the cloud (behind the fog) and the stall's broken awning frame beyond the gap
    decor(w, -1, (ctx) => {
      box(ctx, r0, FL - 70, r1 - r0, 6, '#8C8678');
      box(ctx, c.X(PAANI.gap[0]) + 4, FL - 44, px(3) - 8, 3, '#E07A5F');
    });
    w.add(
      new Rig(c.X(0), 0, px(30), FL, {
        layer: 4,
        tick: (_r, w2) => {
          if (st.t0 < 0) return;
          const u = (w2.tick - st.t0) / 120;
          st.raining = u >= PAANI.start && u < PAANI.start + PAANI.rain;
          st.over = u >= PAANI.start + PAANI.rain;
          if (!st.raining) return;
          const p = w2.player;
          const under = p.x >= r0 && p.x + p.w <= r1;
          if (under) st.wet = 0;
          else if (++st.wet > PAANI.slip * 120 && w2.state === 'play') w2.die('gtk-chiplo');
        },
        paint: (ctx, r, w2) => {
          if (!st.raining) return;
          // rain everywhere but under the balcony; and the drip lines along its edges
          ctx.fillStyle = 'rgba(170,190,205,0.55)';
          for (let x = r.x; x < r.x + r.w; x += 7) {
            if (x > r0 && x < r1) continue;
            const y = ((w2.tick * 9 + x * 13) % (FL - 100)) + 100;
            ctx.fillRect(x, y, 1, 7);
          }
          for (const ex of [r0, r1 - 2])
            for (let k = 0; k < 4; k++) box(ctx, ex, FL - 4 - (((w2.tick >> 1) + k * 9) % 36), 2, 3, 'rgba(210,225,235,0.9)');
          box(ctx, r0 - 1, FL - 2, 3, 2, '#9DB8C9');
          box(ctx, r1 - 2, FL - 2, 3, 2, '#9DB8C9');
        },
      }),
    );
    sign(w, c.x + PAANI.gap[1] + 1, 8.2, 3.4, 'CHIYA', 'shop', null, 'tea, 10 m');
  },
};

/** F488 count-flash-to-thunder: a storm over the open ridge. Count from the flash to the thunder: while it is
 *  short the storm is overhead and the next bolt hits the ridge; when a count runs long, cross. Wait for the
 *  storm to pass altogether and the cloud comes down on the shelter, which stands on the kerb's edge */
export const BIJULI = { flashes: [[0.3, 0.4], [1.4, 0.6], [3.0, 3.0]] as [number, number][], strike: 1.5, cloud: 5.4, ridge: [8, 15] as [number, number], gap: [11, 12] as [number, number] };
export const act15: Act = {
  id: 'gtk07-bijuli',
  w: 22,
  advice: 'A storm over the open ridge. From the shelter, count from each flash to its thunder: while the count is short the storm is overhead, and the next bolt hits the ridge. When a count runs long, cross, and jump where the rope stops. Don’t wait for it all to pass: the cloud comes down after it, and the shelter stands on the kerb.',
  paint: (g, c) => {
    g.pit(c.x + BIJULI.gap[0], c.x + BIJULI.gap[1]);
  },
  build: (w, c) => {
    const st = { t0: -1, flash: -99, struck: -99, cloud: false };
    w.flags.gtk7b2 = st;
    onPass(w, c.X(3), (w2) => {
      if (st.t0 < 0) st.t0 = w2.tick;
    });
    const R0 = c.X(BIJULI.ridge[0]),
      R1 = c.X(BIJULI.ridge[1] + 1);
    drops(w, [[c.x + BIJULI.gap[0], c.x + BIJULI.gap[1]]], 'gtk-badal');
    rope(w, c.x + 6, c.x + 21, [[c.x + BIJULI.gap[0], c.x + BIJULI.gap[1]]]);
    const cl: Cloud = { t0: -1, thick: 999, clear: 0, roll: 200 };
    fog(w, c.x + 1, c.x + 21, cl);
    w.add(
      new Rig(c.X(0), 0, px(22), FL, {
        layer: 4,
        tick: (_r, w2) => {
          if (st.t0 < 0) return;
          const u = (w2.tick - st.t0) / 120;
          const p = w2.player;
          for (const [f, n] of BIJULI.flashes) {
            const k = w2.tick - st.t0;
            if (k === Math.round(f * 120)) {
              st.flash = w2.tick;
              npc(w2, 'Flash! | Flash!', c.X(11), px(5), 0.5);
            }
            if (k === Math.round((f + n) * 120)) {
              npc(w2, 'Rumble... | Rumble...', c.X(11), px(5), 0.8);
              // a short count: the storm is overhead and the bolt comes down on the ridge
              if (n < BIJULI.strike) {
                st.struck = w2.tick;
                if (p.x + p.w > R0 && p.x < R1 && w2.state === 'play') w2.die('gtk-bijuli');
              }
            }
          }
          if (u >= BIJULI.cloud && cl.t0 < 0) cl.t0 = w2.tick;
          // the cloud on the kerb: the shelter's edge of road goes with it
          if (u >= BIJULI.cloud + 0.1 && !st.cloud) {
            st.cloud = true;
            if (p.x < c.X(7) && p.onGround && w2.state === 'play') w2.die('gtk-badal');
          }
        },
        paint: (ctx, r, w2) => {
          if (w2.tick - st.flash < 8) {
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.fillRect(r.x, r.y, r.w, r.h);
          }
          if (w2.tick - st.struck < 10) {
            ctx.strokeStyle = '#FFF6C8';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(c.X(12), 0);
            ctx.lineTo(c.X(10.5), FL - 120);
            ctx.lineTo(c.X(12.5), FL - 60);
            ctx.lineTo(c.X(11), FL);
            ctx.stroke();
          }
        },
      }),
    );
    // the shelter: a tin roof on posts at the very edge of the road
    decor(w, 1, (ctx) => {
      box(ctx, c.X(1), FL - 40, px(6), 4, '#8C8C84');
      box(ctx, c.X(1), FL - 36, 3, 36, '#5E5A50');
      box(ctx, c.X(7) - 3, FL - 36, 3, 36, '#5E5A50');
    });
    sign(w, c.x + 8, 8.6, 3.6, 'RIDGE ROAD', 'green', null, 'open');
  },
};

/** F487 fog-hides-ceiling: the lane past the old houses, the road broken where the rope stops, and over each hole a
 *  balcony the cloud hides. Its drip line on the road gives it away. A full jump puts your head into the balcony's
 *  iron; a low hop clears the hole and not the balcony */
export const CHHAJJA = { gaps: [[6, 7], [13, 14], [20, 21]] as [number, number][] };
export const act16: Act = {
  id: 'gtk07-chhajja',
  w: 28,
  advice: 'The lane past the old houses. Where the rope stops the road is broken, as ever; but here it drips in a line on the road either side of each hole: a balcony is over it, hidden in the cloud. Hop low over those holes. A full jump puts your head into the balcony.',
  paint: (g, c) => {
    for (const [a, b] of CHHAJJA.gaps) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const gaps = CHHAJJA.gaps.map(([a, b]) => [c.x + a, c.x + b] as [number, number]);
    fog(w, c.x + 2, c.x + 27, null);
    drops(w, gaps, 'gtk-khaai');
    rope(w, c.x + 1, c.x + 27, gaps);
    for (const [a, b] of gaps) {
      const x0 = px(a) - 20,
        x1 = px(b + 1) + 20;
      // the balcony's underside: wrought iron, just above where a low hop's head reaches
      w.add(new Rig(x0, FL - 72, x1 - x0, 10, { layer: 1, cause: 'gtk-chhajja', inset: 0, paint: (ctx, r) => box(ctx, r.x, r.y, r.w, r.h, '#4A4A44') }));
      decor(w, 3, (ctx, w2) => {
        for (const ex of [x0, x1 - 2])
          for (let k = 0; k < 3; k++) box(ctx, ex, FL - 6 - (((w2.tick >> 1) + k * 11) % 30), 2, 3, 'rgba(210,225,235,0.9)');
        box(ctx, x0 - 1, FL - 2, 3, 2, '#9DB8C9');
        box(ctx, x1 - 2, FL - 2, 3, 2, '#9DB8C9');
      });
    }
    sign(w, c.x + 0.4, 8.6, 3.6, 'OLD LANE', 'green', null, 'balconies');
  },
};

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
