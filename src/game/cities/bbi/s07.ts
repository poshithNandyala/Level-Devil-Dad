// BBI-07 Gotipua: the boy dancers of Odisha, in bright skirts and flowers, who hold acrobatic poses (bandha)
// on the drum's stops. Here a troupe dances in each pit: while the mardala plays they whirl (no one to stand
// on); when it stops they hold a pose, and each pose is a shape: a tower, a wheel, a bridge. Wait for the
// bridge, but go the moment the drum stops: when it starts again, the pose breaks and throws you off.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, since, taraScript } from './common';

export type Pose = 'tower' | 'wheel' | 'bridge' | 'gate';
export interface TroupeCfg {
  c0: number;
  n: number;
  /** seconds of drumming, then of each held pose */
  drum: number;
  hold: number;
  /** the poses, one per stop, in order (looping) */
  poses: Pose[];
  /** seconds the bridge takes to form, left to right */
  form?: number;
  /** start this many seconds into the cycle */
  phase?: number;
  /** dancing on the floor (not down in a pit) */
  ground?: boolean;
}

export interface TroupeSt {
  pose: Pose | null;
  /** seconds since the drum stopped (while posed), or since it started (while drumming) */
  into: number;
  /** seconds left of this pose (or of this drumming) */
  left: number;
  stops: number;
}

/** where the troupe is at t seconds */
export function troupeAt(cfg: TroupeCfg, t: number): TroupeSt {
  const per = cfg.drum + cfg.hold;
  const tt = t + (cfg.phase ?? 0);
  const k = Math.floor(tt / per);
  const r = tt - k * per;
  if (r < cfg.drum) return { pose: null, into: r, left: cfg.drum - r, stops: k };
  return { pose: cfg.poses[((k % cfg.poses.length) + cfg.poses.length) % cfg.poses.length], into: r - cfg.drum, left: per - r, stops: k + 1 };
}

const SKIRT = ['#E63946', '#F4D35E', '#2A9D8F', '#F28C28', '#8E44AD'];
/** a Gotipua dancer: flowers in the hair, bright pleated skirt; drawn at (x, feet y), lying (bridge) or upright */
function dancer(ctx: CanvasRenderingContext2D, x: number, y: number, k: number, lie: boolean, spin = 0) {
  if (lie) {
    box(ctx, x - 7, y - 4, 14, 4, SKIRT[k % SKIRT.length]);
    box(ctx, x - 9, y - 2, 4, 4, '#B07A4E');
    box(ctx, x + 6, y - 1, 3, 3, '#B07A4E');
    box(ctx, x - 9, y - 4, 2, 2, '#FFFFFF');
    return;
  }
  const sw = Math.sin(spin) * 3;
  ctx.fillStyle = SKIRT[k % SKIRT.length];
  ctx.beginPath();
  ctx.moveTo(x - 6 - sw, y - 2);
  ctx.lineTo(x + 6 + sw, y - 2);
  ctx.lineTo(x + 2, y - 10);
  ctx.lineTo(x - 2, y - 10);
  ctx.closePath();
  ctx.fill();
  box(ctx, x - 3, y - 16, 6, 6, '#F4D35E');
  box(ctx, x - 2, y - 21, 5, 5, '#B07A4E');
  box(ctx, x - 3, y - 23, 7, 2, '#FFFFFF');
  box(ctx, x - 1, y - 2, 2, 2, '#B07A4E');
}

/** a troupe in the pit at columns c0..c0+n-1, its drummer on the left bank */
export function troupe(w: World, cfg: TroupeCfg, t0: () => number, key: string) {
  const st: TroupeSt & { t: number } = { pose: null, into: 0, left: 0, stops: 0, t: -1 };
  (w.flags[key] as unknown) = st;
  const x0 = px(cfg.c0);
  const W = px(cfg.n);
  const cx = x0 + W / 2;
  const form = cfg.form ?? 0.35;
  const shapes: Record<Pose, Rig> = {
    bridge: w.add(new Rig(x0, FL, W, 6, { solid: true, layer: 3 })),
    tower: w.add(new Rig(cx - 12, FL - 40, 24, 58, { solid: true, layer: 3 })),
    wheel: w.add(new Rig(cx - 32, FL - 36, 64, 8, { solid: true, layer: 3 })),
    gate: w.add(new Rig(x0, FL - 56, W, 8, { solid: true, layer: 3 })),
  };
  for (const r of Object.values(shapes)) r.setSolid(false);
  let was: Pose | null = null;
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 3,
      tick: (_r, w2) => {
        const t = t0() < 0 ? -1 : since(w2, t0());
        st.t = t;
        const a = t < 0 ? { pose: null, into: 0, left: 9, stops: 0 } : troupeAt(cfg, t);
        st.pose = a.pose;
        st.into = a.into;
        st.left = a.left;
        st.stops = a.stops;
        // the drum starts again: whoever is on the pose is thrown up off it
        if (was && was !== a.pose) {
          const r = shapes[was];
          if (r.rides(w2)) {
            const p = w2.player;
            // straight up and a little back: the dancer under you stands up
            p.vy = -240;
            p.vx = -50;
            p.onGround = false;
            p.coyoteT = 0;
            p.launched = true;
            p.stun = 48;
            w2.flags.bbiThrown = 1;
          }
        }
        was = a.pose;
        for (const [k, r] of Object.entries(shapes) as [Pose, Rig][]) {
          const on = a.pose === k;
          r.setSolid(on);
          if (k === 'bridge' && r.solid) {
            // the bridge forms left to right as the dancers lie down, one after another
            const ww = on ? Math.max(8, Math.min(W, (a.into / form) * W)) : W;
            r.solid.w = ww;
            r.w = ww;
          }
        }
      },
      paint: (ctx, _r, w2) => {
        const a = st;
        // the drummer with his mardala on the left bank: sticks up a moment before he starts again
        const dx = x0 - 22;
        const warn = a.pose !== null && a.left < 0.45;
        folk(ctx, dx, FL, 24, '#FFFFFF', { skirt: '#E9E1CF', face: 1, arm: a.pose === null ? (Math.floor(w2.tick / 8) % 2 ? 0.2 : -0.3) : warn ? -1.2 : 0.6 });
        box(ctx, dx + 2, FL - 14, 12, 7, '#8D5A2B');
        box(ctx, dx + 1, FL - 14, 2, 7, '#5D3A1E');
        box(ctx, dx + 13, FL - 14, 2, 7, '#5D3A1E');
        const n = Math.max(3, Math.round(cfg.n * 0.75));
        if (a.pose === null) {
          for (let i = 0; i < n; i++) {
            const sp = w2.tick / 10 + i * 1.3;
            dancer(ctx, x0 + 8 + ((i * W) / n + Math.sin(sp) * 10 + W) % W, cfg.ground ? FL : FL + 16, i, false, sp);
          }
        } else if (a.pose === 'bridge') {
          const r = shapes.bridge;
          for (let x = x0; x < x0 + r.w - 8; x += 16) dancer(ctx, x + 8, FL + 4, x / 16, true);
          for (let x = x0 + 4; x < x0 + r.w; x += 16) box(ctx, x, FL + 4, 3, 14, '#B07A4E');
        } else if (a.pose === 'tower') {
          for (let i = 0; i < 4; i++) dancer(ctx, cx, FL + 16 - i * 14, i, false);
          dancer(ctx, cx - 10, FL + 16, 5, false);
          dancer(ctx, cx + 10, FL + 16, 6, false);
        } else if (a.pose === 'wheel') {
          for (let i = 0; i < 7; i++) {
            const an = Math.PI + (i * Math.PI) / 6;
            dancer(ctx, cx + Math.cos(an) * 28, FL - 30 - Math.sin(an) * -26 + 16, i, false);
          }
          box(ctx, cx - 32, FL - 36, 64, 3, 'rgba(244,211,94,0.6)');
        } else {
          for (let i = 0; i < cfg.n; i++) dancer(ctx, x0 + 8 + i * 16, FL - 48, i, true);
          for (const ex of [x0 + 6, x0 + W - 6]) for (let i = 0; i < 4; i++) dancer(ctx, ex, FL - i * 14, i + 2, false);
        }
      },
    }),
  );
  return { st, shapes };
}

/** the pit the troupe dances in: thrown off a pose, or simply fallen in */
function stagePit(w: World, c0: number, c1: number) {
  const g = channel(w, c0, c1, 'bbi-nacha', 'drain');
  g.o.tick = (r, w2) => {
    const p = w2.player;
    if (p.onGround && p.y + p.h >= FL - 1 && !w2.flags.bbiThrownKeep) w2.flags.bbiThrown = 0;
    r.hazard!.cause = w2.flags.bbiThrown ? 'bbi-thrown' : 'bbi-nacha';
  };
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: -5,
      paint: (ctx) => {
        // the night stage: oil lamps along the edge
        for (let x = px(c0) - 8; x < px(c1 + 1) + 8; x += 24) {
          box(ctx, x, FL - 6, 4, 6, '#8D5A2B');
          box(ctx, x + 1, FL - 10, 2, 4, '#FFD54F');
        }
      },
    }),
  );
}

export const T07: TroupeCfg = { c0: 10, n: 8, drum: 1.5, hold: 1.3, poses: ['tower', 'wheel', 'bridge'], form: 0.35 };

export function room(): LevelDef {
  return {
    id: 'BBI-07',
    city: 'BBI',
    index: 7,
    name: 'Gotipua',
    nameEn: 'The drum and the poses',
    tagline: 'Raja nights: Gotipua boys in bright skirts and flowers hold impossible poses whenever the mardala stops.',
    hint: 'While the drum plays, the dancers whirl: there’s nothing to stand on. When it stops they hold a pose: a tower, a wheel, then a bridge across the pit. Wait for the bridge, but don’t wait for it to finish forming: walk on the moment the drum stops, because when the drummer lifts his sticks and starts again, the pose breaks and throws whoever is on it.',
    par: 60,
    map: Grid.ground(15).pit(T07.c0, T07.c0 + T07.n - 1).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = { t0: -1 };
      w.flags.bbi7r = st;
      onPass(w, px(3), (w2) => (st.t0 = w2.tick));
      stagePit(w, T07.c0, T07.c0 + T07.n - 1);
      troupe(w, T07, () => st.t0, 'bbi7');
      sign(w, 4.4, 10.4, 3.2, 'GOTIPUA', 'shop', null, 'tonight');
      rival(w, 2, 15, 1, taraScript(7));
      onPass(w, px(6), (w2) => tara(w2, 'Bahut bhala! | Very good!', 1.6));
      collectible(w, 'bbi-podapitha', 14, 9.6);
    },
  };
}

/** act 1, the shelter: two troupes either side of a small bank; rest on the bank between them */
export const T07a1: TroupeCfg = { c0: 4, n: 6, drum: 1.3, hold: 1.4, poses: ['bridge', 'tower'], form: 0.3 };
export const T07a2: TroupeCfg = { c0: 14, n: 7, drum: 1.6, hold: 1.4, poses: ['wheel', 'bridge', 'tower'], form: 0.3, phase: 0.7 };
export const act1: Act = {
  id: 'bbi07-mardala',
  w: 26,
  advice: 'Two troupes with a little bank between them, each to its own drummer. Cross the first on its bridge, then stand on the bank and wait: the second troupe’s bridge comes in its own time.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + T07a1.c0, c.x + T07a1.c0 + T07a1.n - 1).pit(c.x + T07a2.c0, c.x + T07a2.c0 + T07a2.n - 1);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi7a = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    stagePit(w, c.x + T07a1.c0, c.x + T07a1.c0 + T07a1.n - 1);
    stagePit(w, c.x + T07a2.c0, c.x + T07a2.c0 + T07a2.n - 1);
    troupe(w, { ...T07a1, c0: c.x + T07a1.c0 }, () => st.t0, 'bbi7a1');
    troupe(w, { ...T07a2, c0: c.x + T07a2.c0 }, () => st.t0, 'bbi7a2');
  },
};

/** act 2, the momentum: a long pit whose bridge only just lasts the walk, and a wheel that lifts you to a ledge */
export const T07b1: TroupeCfg = { c0: 3, n: 11, drum: 1.4, hold: 1.6, poses: ['tower', 'bridge'], form: 0.3 };
export const T07b2: TroupeCfg = { c0: 19, n: 6, drum: 1.4, hold: 1.5, poses: ['bridge', 'wheel'], form: 0.3, phase: 0.4 };
export const act2: Act = {
  id: 'bbi07-bandha',
  w: 34,
  advice: 'A long pit: its bridge only just lasts the walk, so be at the edge when the drum stops and go straight over. Then a high bank: only the wheel pose is tall enough. Jump on to its top when it forms and up to the bank before the drum.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + T07b1.c0, c.x + T07b1.c0 + T07b1.n - 1).pit(c.x + T07b2.c0, c.x + T07b2.c0 + T07b2.n - 1);
    g.fill(c.x + T07b2.c0 + T07b2.n, c.x + 33, 11, 14, '#');
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi7b = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    const st2 = { t0: -1 };
    w.flags.bbi7b2 = st2;
    onPass(w, c.X(15), (w2) => (st2.t0 = w2.tick));
    stagePit(w, c.x + T07b1.c0, c.x + T07b1.c0 + T07b1.n - 1);
    stagePit(w, c.x + T07b2.c0, c.x + T07b2.c0 + T07b2.n - 1);
    troupe(w, { ...T07b1, c0: c.x + T07b1.c0 }, () => st.t0, 'bbi7b1');
    troupe(w, { ...T07b2, c0: c.x + T07b2.c0 }, () => st2.t0, 'bbi7b2');
    sign(w, c.x + 29, 6.4, 3.2, 'RAJA NIGHT', 'shop', null, 'stage');
  },
};

/** act 3: three troupes in a row; the middle one never makes a bridge, only a wheel and a tower */
export const T07c1: TroupeCfg = { c0: 3, n: 6, drum: 1.2, hold: 1.3, poses: ['tower', 'bridge'], form: 0.3 };
export const T07c2: TroupeCfg = { c0: 12, n: 7, drum: 1.5, hold: 1.6, poses: ['tower', 'wheel'], form: 0.3, phase: 0.5 };
export const T07c3: TroupeCfg = { c0: 23, n: 6, drum: 1.0, hold: 1.2, poses: ['bridge', 'wheel', 'tower'], form: 0.25 };
export const act3: Act = {
  id: 'bbi07-sahi',
  w: 32,
  advice: 'Three troupes in a row. The middle one never lies down for a bridge: it only makes a tower and a wheel. Jump on to the wheel’s top when it forms and off to the far bank before the drum. The last drummer plays fast: be at the edge for its bridge.',
  cps: [],
  paint: (g, c) => {
    for (const t of [T07c1, T07c2, T07c3]) g.pit(c.x + t.c0, c.x + t.c0 + t.n - 1);
  },
  build: (w, c) => {
    const ks = ['bbi7c1', 'bbi7c2', 'bbi7c3'];
    [T07c1, T07c2, T07c3].forEach((t, i) => {
      const st = { t0: -1 };
      w.flags[ks[i] + 't'] = st;
      onPass(w, c.X(t.c0 - 2.5), (w2) => (st.t0 = w2.tick));
      stagePit(w, c.x + t.c0, c.x + t.c0 + t.n - 1);
      troupe(w, { ...t, c0: c.x + t.c0 }, () => st.t0, ks[i]);
    });
  },
};

/** a street of troupes, each in its own pit with its own drummer (the drum starts as you come near) */
export function troupeAct(id: string, w0: number, cfgs: TroupeCfg[], key: string, advice: string, cps: number[] = []): Act {
  return {
    id,
    w: w0,
    advice,
    cps,
    paint: (g, c) => {
      for (const t of cfgs) g.pit(c.x + t.c0, c.x + t.c0 + t.n - 1);
    },
    build: (w, c) => {
      cfgs.forEach((t, i) => {
        const st = { t0: -1 };
        onPass(w, c.X(t.c0 - 2.5), (w2) => (st.t0 = w2.tick));
        stagePit(w, c.x + t.c0, c.x + t.c0 + t.n - 1);
        troupe(w, { ...t, c0: c.x + t.c0 }, () => st.t0, `${key}${i}`);
      });
    },
  };
}

/** act 4: the tower pose is the only stepping stone: jump on to its top and off before the drum */
export const T07d: TroupeCfg[] = [
  { c0: 3, n: 5, drum: 1.3, hold: 1.8, poses: ['tower'], form: 0.3 },
  { c0: 13, n: 6, drum: 1.1, hold: 1.8, poses: ['wheel', 'tower'], form: 0.3, phase: 0.3 },
];
export const act4 = troupeAct('bbi07-stambha', 23, T07d, 'bbi7d', 'Two troupes that never lie down. The first only ever makes a tower: jump on to its top and off to the far bank before the drum starts. The second makes a wheel, then a tower: either will do, if you go at once.');

/** act 5: the long night: three bridges back to back, quicker drummers each time */
export const T07e2: TroupeCfg[] = [
  { c0: 3, n: 7, drum: 1.4, hold: 1.4, poses: ['wheel', 'bridge'], form: 0.3 },
  { c0: 13, n: 8, drum: 1.2, hold: 1.4, poses: ['tower', 'bridge'], form: 0.3, phase: 0.6 },
  { c0: 24, n: 9, drum: 1.0, hold: 1.4, poses: ['bridge', 'tower', 'wheel'], form: 0.3, phase: 0.2 },
];
export const act5 = troupeAct('bbi07-raati', 36, T07e2, 'bbi7f', 'The last three troupes, each drummer quicker than the one before. Be at each edge as its drum stops for the bridge, and rest on the banks between.');

export const act6 = troupeAct(
  'bbi07-mancha',
  26,
  [
    { c0: 3, n: 6, drum: 1.6, hold: 1.5, poses: ['wheel', 'tower', 'bridge'], form: 0.3 },
    { c0: 13, n: 9, drum: 1.3, hold: 1.5, poses: ['bridge', 'wheel'], form: 0.3, phase: 0.9 },
  ],
  'bbi7g',
  'The main stage: a slow drummer, then a long pit whose bridge only just lasts the walk. Rest on the bank between them.',
  [],
);
export const act7 = troupeAct(
  'bbi07-dhol',
  24,
  [
    { c0: 3, n: 5, drum: 1.0, hold: 1.8, poses: ['tower', 'wheel'], form: 0.3 },
    { c0: 13, n: 7, drum: 1.4, hold: 1.4, poses: ['tower', 'tower', 'bridge'], form: 0.3, phase: 0.2 },
  ],
  'bbi7h',
  'The drummers trade places: the first troupe only towers and wheels (on to its top and off), the second makes two towers before its bridge.',
  [],
);

/** ending: the last pose is a gate over the door; between poses the troupe whirls across the doorway */
export const T07e: TroupeCfg = { c0: 0, n: 4, drum: 1.6, hold: 1.6, poses: ['gate'], form: 0.3, ground: true };
export const ending: Ending = {
  space: 12,
  advice: 'The troupe dances across the doorway, and its last pose is a gate over the door. Wait while they whirl; walk through under the gate as soon as the drum stops.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-pose-gate';
    const st = { t0: -1 };
    w.flags.bbi7e = st;
    onPass(w, px(D - 10), (w2) => (st.t0 = w2.tick));
    const cfg = { ...T07e, c0: D - 3 };
    const tr = troupe(w, cfg, () => st.t0, 'bbi7e');
    // while they whirl, the dancers fill the doorway: their kicks send you flying
    w.add(
      new Rig(px(D - 3), FL - 24, px(4), 24, {
        cause: 'bbi-kick',
        inset: 3,
        layer: 4,
        live: (_r, w2) => st.t0 >= 0 && troupeAt(cfg, since(w2, st.t0)).pose === null,
      }),
    );
    void tr;
  },
};

export const meta07 = { family: 'troupe-pose-platform-shapes', betrayals: ['pose-shapes'], ending: 'bbi-pose-gate' };
