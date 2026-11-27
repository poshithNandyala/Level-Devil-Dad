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
  /** the troupe follows a drummer on the far bank; the one by you plays this many seconds out of step */
  decoy?: number;
  /** the drum plays while they hold the pose and stops while they whirl: the finale breaks the stage's rule */
  rev?: boolean;
  /** with `decoy`: the out-of-step drummer is the one across the pit, and the troupe follows the one by you */
  decoyFar?: boolean;
  /** the last stroke before each stop names the pose: a deep stroke (wide mark) ends in the bridge, a sharp one
   *  (thin high mark) in the tower */
  forecast?: boolean;
  /** the drummer sits at this column (world tiles) instead of on the troupe's own near bank */
  drumX?: number;
  /** on these stops (by index in `poses`) a drum roll at `at` s into the pose turns the bridge over towards the
   *  drummer for `dur` s: whoever is not walking with the turn is rolled under */
  roll?: { stops: number[]; at: number; dur: number };
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
  const st: TroupeSt & { t: number; decoyStopped?: boolean; decoyLeft?: number; next?: Pose; rolling?: boolean; rollSoon?: boolean } = { pose: null, into: 0, left: 0, stops: 0, t: -1 };
  (w.flags[key] as unknown) = st;
  const x0 = px(cfg.c0);
  const W = px(cfg.n);
  const cx = x0 + W / 2;
  const form = cfg.form ?? 0.35;
  // one solid for the whole troupe, reshaped to whatever pose they hold (fewer solids: a faster world)
  const boxes: Record<Pose, [number, number, number, number]> = {
    bridge: [x0, FL, W, 6],
    tower: [cx - 12, FL - 40, 24, 58],
    wheel: [cx - 32, FL - 36, 64, 8],
    gate: [x0, FL - 56, W, 8],
  };
  const body = w.add(new Rig(x0, FL, W, 6, { solid: true, layer: 3 }));
  body.setSolid(false);
  const shapes = { bridge: body };
  let was: Pose | null = null;
  let rolled = false;
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
        if (cfg.forecast) st.next = cfg.poses[((a.stops % cfg.poses.length) + cfg.poses.length) % cfg.poses.length];
        if (cfg.decoy !== undefined) {
          const d = t < 0 ? { pose: null, left: 9 } : troupeAt({ ...cfg, phase: (cfg.phase ?? 0) + cfg.decoy }, t);
          st.decoyStopped = d.pose !== null;
          st.decoyLeft = d.left;
        }
        // the drum starts again: whoever is on the pose is thrown up off it
        if (was && was !== a.pose) {
          if (body.rides(w2)) {
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
        const sol = body.solid!;
        if (!a.pose) {
          body.setSolid(false);
          rolled = false;
          return;
        }
        // the roll: the line turns over towards the drummer; ride it his way or be rolled under
        const ri = (((a.stops - 1) % cfg.poses.length) + cfg.poses.length) % cfg.poses.length;
        st.rolling = !!cfg.roll && cfg.roll.stops.includes(ri) && a.into >= cfg.roll.at && a.into < cfg.roll.at + cfg.roll.dur;
        st.rollSoon = !!cfg.roll && cfg.roll.stops.includes(ri) && a.into >= cfg.roll.at - 0.5 && a.into < cfg.roll.at;
        if (rolled) {
          body.setSolid(false);
          return;
        }
        if (cfg.roll && cfg.roll.stops.includes(ri) && body.rides(w2)) {
          const p = w2.player;
          if (st.rolling && p.vx < -20) p.pushVx = -220;
          // standing still, you go under as soon as the turn has begun; walking against it, when it ends
          const standing = Math.abs(p.vx) < 20 && a.into >= cfg.roll.at + 0.25;
          if (standing || a.into >= cfg.roll.at + cfg.roll.dur) {
            if (p.vx > -40) {
              w2.flags.bbiThrown = 1;
              w2.flags.bbiThrownCause = p.vx > 20 ? 'bbi-ulta-gadi' : 'bbi-gadi-tala';
              p.vy = -120;
              p.onGround = false;
              rolled = true;
              body.setSolid(false);
              return;
            }
          }
        }
        const [bx, by, bw, bh] = boxes[a.pose];
        // the bridge forms left to right as the dancers lie down, one after another
        const ww = a.pose === 'bridge' ? Math.max(8, Math.min(W, (a.into / form) * W)) : bw;
        sol.x = Math.round(bx);
        sol.y = Math.round(by);
        sol.w = ww;
        sol.h = bh;
        sol.velX = 0;
        body.x = sol.x;
        body.y = sol.y;
        body.w = ww;
        body.h = bh;
        body.setSolid(true);
      },
      paint: (ctx, _r, w2) => {
        const a = st;
        // the drummer with his mardala on the left bank: sticks up a moment before he starts again
        const drummer = (dx: number, face: 1 | -1, playing: boolean, warn: boolean) => {
          folk(ctx, dx, FL, 24, '#FFFFFF', { skirt: '#E9E1CF', face, arm: playing ? (Math.floor(w2.tick / 8) % 2 ? 0.2 : -0.3) : warn ? -1.2 : 0.6 });
          box(ctx, dx + 2, FL - 14, 12, 7, '#8D5A2B');
          box(ctx, dx + 1, FL - 14, 2, 7, '#5D3A1E');
          box(ctx, dx + 13, FL - 14, 2, 7, '#5D3A1E');
        };
        if (cfg.drumX !== undefined) drummer(px(cfg.drumX), cfg.drumX > cfg.c0 ? -1 : 1, a.pose === null, a.pose !== null && a.left < 0.45);
        else if (cfg.rev) drummer(x0 - 22, 1, a.pose !== null, a.pose === null && a.left < 0.45);
        else if (cfg.decoy === undefined) drummer(x0 - 22, 1, a.pose === null, a.pose !== null && a.left < 0.45);
        else {
          // the troupe's own drummer is across the pit; the one by you plays out of step
          const near = cfg.decoyFar ? x0 + W + 6 : x0 - 22;
          const far = cfg.decoyFar ? x0 - 22 : x0 + W + 6;
          drummer(near, cfg.decoyFar ? -1 : 1, a.pose === null, a.pose !== null && a.left < 0.45);
          drummer(far, cfg.decoyFar ? 1 : -1, !st.decoyStopped, !!st.decoyStopped && (st.decoyLeft ?? 9) < 0.45);
        }
        // the last stroke before the stop, drawn over the drummer: deep and wide for the bridge, sharp and high for the tower
        if (cfg.forecast && a.pose === null && a.left < 0.5 && st.next) {
          const dx = x0 - 22;
          if (st.next === 'bridge') box(ctx, dx - 6, FL - 40, 28, 6, '#1B1B3A');
          else box(ctx, dx + 6, FL - 58, 4, 22, '#E63946');
        }
        const n = Math.max(3, Math.round(cfg.n * 0.75));
        if (a.pose === null) {
          for (let i = 0; i < n; i++) {
            const sp = w2.tick / 10 + i * 1.3;
            dancer(ctx, x0 + 8 + ((i * W) / n + Math.sin(sp) * 10 + W) % W, cfg.ground ? FL : FL + 16, i, false, sp);
          }
        } else if (a.pose === 'bridge') {
          const r = shapes.bridge;
          if (st.rollSoon || st.rolling) for (let x = x0; x < x0 + r.w; x += 8) box(ctx, x + ((w2.tick >> 1) % 3) - 1, FL - 3, 4, 2, '#FFFFFF');
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
export function stagePit(w: World, c0: number, c1: number) {
  const g = channel(w, c0, c1, 'bbi-nacha', 'drain');
  g.o.tick = (r, w2) => {
    const p = w2.player;
    if (p.onGround && p.y + p.h >= FL - 1 && !w2.flags.bbiThrownKeep) w2.flags.bbiThrown = 0;
    if (!w2.flags.bbiThrown) w2.flags.bbiThrownCause = undefined;
    r.hazard!.cause = w2.flags.bbiThrown ? ((w2.flags.bbiThrownCause as string | undefined) ?? 'bbi-thrown') : 'bbi-nacha';
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
  cps: [14.3],
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

/** act 8, lamps: a string of oil lamps hangs low over the pit. The wheel pose comes first and looks like the way,
 *  but standing on its top puts your head in the lamps; only the bridge goes under them */
export const T07L: TroupeCfg = { c0: 4, n: 8, drum: 1.6, hold: 1.5, poses: ['wheel', 'bridge'], form: 0.3 };
export function deepaAct(id: string, key: string, low = false): Act {
  return {
  id,
  w: 16,
  advice: low
    ? 'The lamps hang right down to the bridge here: walking under them on the bridge burns you. The wheel’s top rides above them: on to the wheel, and off to the far bank before the drum.'
    : 'A string of oil lamps hangs low over this pit. The wheel comes first, but its top puts your head in the lamps: wait for the bridge and walk under them.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + T07L.c0, c.x + T07L.c0 + T07L.n - 1);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    onPass(w, c.X(T07L.c0 - 2.5), (w2) => (st.t0 = w2.tick));
    stagePit(w, c.x + T07L.c0, c.x + T07L.c0 + T07L.n - 1);
    troupe(w, { ...T07L, c0: c.x + T07L.c0 }, () => st.t0, key);
    w.add(
      new Rig(low ? c.X(T07L.c0 + 2) : c.X(T07L.c0) + 8, low ? FL - 22 : FL - 64, low ? px(T07L.n - 4) : px(T07L.n) - 16, 12, {
        cause: 'bbi-deepa',
        inset: 1,
        layer: 4,
        // thrown up off a pose into the lamps: the throw is what killed you
        tick: (r, w2) => {
          r.hazard!.cause = w2.flags.bbiThrown ? 'bbi-thrown' : 'bbi-deepa';
        },
        paint: (ctx, r) => {
          ctx.strokeStyle = '#5D3A1E';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(r.x - 8, r.y - 30);
          ctx.quadraticCurveTo(r.x + r.w / 2, r.y + 8, r.x + r.w + 8, r.y - 30);
          ctx.stroke();
          for (let x = r.x + 4; x < r.x + r.w; x += 14) {
            box(ctx, x, r.y + 4, 6, 4, '#8D5A2B');
            box(ctx, x + 2, r.y, 2, 4, '#FFB300');
            box(ctx, x + 2, r.y - 2, 2, 2, '#FFF59D');
          }
        },
      }),
    );
  },
};
}
export const act8 = deepaAct('bbi07-deepa', 'bbi7l');

/** act 9, the chain: three troupes in one long pit with no bank between them; each drummer stops as you reach his
 *  part, and each bridge only lasts the walk: no stopping anywhere */
export const T07C: TroupeCfg[] = [
  { c0: 4, n: 6, drum: 2.4, hold: 1.5, poses: ['tower', 'bridge'], form: 0.25 },
  { c0: 10, n: 6, drum: 0.12, hold: 1.4, poses: ['bridge', 'wheel'], form: 0.2 },
  { c0: 16, n: 6, drum: 0.12, hold: 1.4, poses: ['bridge', 'tower'], form: 0.2 },
];
export const act9: Act = { ...troupeAct('bbi07-shrinkhala', 26, T07C, 'bbi7k', 'One long pit, three troupes and no bank between them. Each drummer stops as you reach his part, and each bridge only lasts the walk over it: once on, keep walking to the far side without stopping.') };

/** act 10, the island: a long pit with a lamp plinth in the middle; the far troupe's bridge comes rarely: rest on
 *  the plinth (the shelter), not on a pose */
export const T07I: TroupeCfg[] = [
  { c0: 4, n: 6, drum: 1.6, hold: 1.5, poses: ['bridge', 'wheel'], form: 0.3 },
  { c0: 12, n: 7, drum: 1.8, hold: 1.5, poses: ['tower', 'bridge'], form: 0.3, phase: 0.8 },
];
export const act10 = troupeAct('bbi07-dweepa', 22, T07I, 'bbi7i', 'A lamp plinth stands in the middle of this pit. Cross the first troupe’s bridge to it and wait there: the second troupe makes a tower before its bridge comes.');

/** act 11, Bagudi (BBI reserve, tag-it-passes-to-you): the boys play bagudi between shows. The raider's touch
 *  makes Dad "it", and the line of boys tackles whoever is it. He jumps for anyone hopping him, so the tag
 *  can't be dodged. A2: tagged, run back over the chalk line to pass it on. A3: hopping him is a tag too. */
export const BAGUDI = { line: 3, p0: 6, p1: 12, v: 60, guards: 16, gw: 3 };
/** `want` (the finale's turn, law 7): tonight the boys let 'it' through and tackle anyone else, but only for
 *  a moment after the tag: be tagged, and go straight through */
export function bagudiAct(id: string, key: string, want = false): Act {
  return {
  id,
  w: 24,
  advice: want
    ? 'Bagudi on the stadium lawn, the other way round: the boys let “it” through and tackle anyone else, and only for a moment after the tag. Let him tag you and walk straight through; don’t go back to the line.'
    : 'Bagudi in the yard. The raider’s touch makes you “it”, and the line of boys tackles whoever is it. You can’t hop him: he jumps too. Let him tag you, run back over the chalk line to pass it on, then walk through.',
  cps: [],
  paint: () => {},
  build: (w, c) => {
    const st = { t0: -1, x: c.X(BAGUDI.p1), dir: -1, it: false, air: false, out: false, tagT: -1 };
    w.flags[key] = st;
    onPass(w, c.X(BAGUDI.line), (w2) => { if (st.t0 < 0) st.t0 = w2.tick; });
    const raider = w.add(
      new Rig(st.x, FL - 26, 14, 26, {
        layer: 3,
        tick: (r, w2) => {
          const p = w2.player;
          if (st.out || st.t0 < 0) return;
          st.x += (st.dir * BAGUDI.v) / 120;
          if (st.x <= c.X(BAGUDI.p0)) st.dir = 1;
          if (st.x >= c.X(BAGUDI.p1)) st.dir = -1;
          // anyone hopping him: he jumps up to touch
          const over = Math.abs(p.cx - (st.x + 7)) < 22 && p.y + p.h < FL - 20;
          r.x = st.x;
          r.y = over ? FL - 58 : FL - 26;
          if (!st.it && p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y) {
            st.it = true;
            st.tagT = w2.tick;
            st.air = !p.onGround;
          }
          if (st.it && p.x + p.w < c.X(BAGUDI.line)) {
            st.it = false;
            st.out = true;
          }
        },
        paint: (ctx, r) => {
          if (st.out) folk(ctx, c.X(BAGUDI.line) - 26, FL, 20, '#F4A261', { skirt: '#E63946', face: 1, arm: -0.4 });
          else folk(ctx, r.x + 7, r.y + 26, 24, '#F4A261', { skirt: '#E63946', face: st.dir < 0 ? -1 : 1, arm: 1.0 });
        },
      }),
    );
    void raider;
    const guard = w.add(
      new Rig(c.X(BAGUDI.guards), FL - 26, px(BAGUDI.gw), 26, {
        cause: 'bbi-bagudi',
        inset: 2,
        layer: 3,
        live: (_r, w2) => (want ? !st.it || since(w2, st.tagT) > 3.0 : st.it),
        tick: (r) => {
          r.hazard!.cause = want ? (st.it ? 'bbi-ghera' : 'bbi-bagudi') : st.air ? 'bbi-chhuin' : 'bbi-bagudi';
        },
        paint: (ctx, r) => {
          for (let i = 0; i < 3; i++) folk(ctx, r.x + 8 + i * 16, FL, 22, '#F4A261', { skirt: '#2A9D8F', face: -1, arm: st.it ? 1.2 : 0.2 });
        },
      }),
    );
    void guard;
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: -1,
        paint: (ctx) => {
          box(ctx, c.X(BAGUDI.line), FL - 1, 3, 1, '#FFFFFF');
          box(ctx, c.X(BAGUDI.line) - 1, FL - 2, 5, 2, '#F5F5F5');
        },
      }),
    );
    sign(w, c.x + 20, 10.4, 3.2, 'BAGUDI', 'shop', null, 'D');
  },
};
}
export const act11 = bagudiAct('bbi07-bagudi', 'bbi7bg');

/** act 12, the falling tower (pose-shapes family): this troupe never lies down as a bridge. Their tower stands
 *  at the far end of the pit and, on the drum's stop, falls over towards you: the tower IS the bridge, and its
 *  top lands on the edge you were taught to wait at. A2: wait back from the edge. A3: not too far back: it
 *  stands up again quickly, and from further back you're still on it. */
export const PADA = { c0: 7, n: 7, drum: 1.4, stand: 0.8, fall: 0.35, lie: 1.45, rise: 0.3, reach: 1.5 };
/** `away` (the finale's turn, law 7): the tower stands at YOUR edge and falls away from you, so it lies only a
 *  moment and the scuffs are on the far bank: wait right at the edge this time */
export function padaAct(id: string, key: string, away = false): Act {
  const lie = away ? 1.2 : PADA.lie;
  return {
  id,
  w: 18,
  advice: away
    ? 'Tonight the tower stands at your edge and falls away from you, and it gets up again quickly. Nothing lands on your side: wait right at the edge and go the moment it is down.'
    : 'This troupe never lies down: their tower stands at the far end and falls over towards you as the bridge, and its top lands right where you’d wait at the edge. Wait a little way back, by the scuffs, and go the moment it lands: it stands up again soon.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + PADA.c0, c.x + PADA.c0 + PADA.n - 1);
  },
  build: (w, c) => {
    const st = { t0: -1, phase: 'drum' as 'drum' | 'stand' | 'fall' | 'lie' | 'rise', into: 0 };
    w.flags[key] = st;
    onPass(w, c.X(0.5), (w2) => { if (st.t0 < 0) st.t0 = w2.tick; });
    stagePit(w, c.x + PADA.c0, c.x + PADA.c0 + PADA.n - 1);
    const per = PADA.drum + PADA.stand + PADA.fall + lie + PADA.rise;
    const near = away ? c.X(PADA.c0) - 8 : c.X(PADA.c0 - PADA.reach);
    const far = away ? c.X(PADA.c0 + PADA.n + PADA.reach) : c.X(PADA.c0 + PADA.n) + 8;
    const bridge = w.add(new Rig(near, FL, far - near, 6, { solid: true, layer: 3 }));
    bridge.setSolid(false);
    w.add(
      new Rig(away ? c.X(PADA.c0 + PADA.n) : near, FL - 30, away ? far - c.X(PADA.c0 + PADA.n) : c.X(PADA.c0) - near, 30, {
        cause: 'bbi-pada',
        inset: 2,
        layer: 4,
        live: () => st.phase === 'fall' && st.into > PADA.fall * 0.5,
        tick: (_r, w2) => {
          if (st.t0 < 0) return;
          let t = since(w2, st.t0) % per;
          const was = st.phase;
          const seq: [typeof st.phase, number][] = [['drum', PADA.drum], ['stand', PADA.stand], ['fall', PADA.fall], ['lie', lie], ['rise', PADA.rise]];
          for (const [ph, d] of seq) {
            if (t < d) { st.phase = ph; st.into = t; break; }
            t -= d;
          }
          if (was === 'lie' && st.phase !== 'lie' && bridge.rides(w2)) {
            const p = w2.player;
            p.vy = -240;
            p.vx = -50;
            p.onGround = false;
            p.coyoteT = 0;
            p.launched = true;
            p.stun = 48;
            w2.flags.bbiThrown = 1;
          }
          bridge.setSolid(st.phase === 'lie');
        },
        paint: (ctx) => {
          // scuffs on the bank where the top lands
          if (away) box(ctx, c.X(PADA.c0 + PADA.n), FL - 1, far - c.X(PADA.c0 + PADA.n), 1, '#6E4A2E');
          else box(ctx, near, FL - 1, c.X(PADA.c0) - near, 1, '#6E4A2E');
          const H = far - near;
          const dancersAt = (ang: number) => {
            // the tower pivots on its base at the far end: ang 0 upright, PI/2 lying towards you
            for (let i = 0; i < 7; i++) {
              const d = (i + 0.5) * (H / 7);
              const x = away ? near + 8 + Math.sin(ang) * d : far - 8 - Math.sin(ang) * d;
              const y = FL - Math.cos(ang) * d;
              box(ctx, x - 5, y - 5, 10, 10, SKIRT[i % SKIRT.length]);
              box(ctx, x - 2, y - 8, 4, 3, '#B07A4E');
            }
          };
          if (st.t0 < 0 || st.phase === 'drum') {
            for (let i = 0; i < 4; i++) box(ctx, (away ? near + 4 : far - 30) + i * 9 + Math.sin(st.into * 6 + i) * 4, FL + 2, 7, 12, SKIRT[i % SKIRT.length]);
          } else if (st.phase === 'stand') dancersAt(0);
          else if (st.phase === 'fall') dancersAt((Math.PI / 2) * Math.min(1, st.into / PADA.fall));
          else if (st.phase === 'lie') dancersAt(Math.PI / 2);
          else dancersAt((Math.PI / 2) * (1 - st.into / PADA.rise));
        },
      }),
    );
  },
};
}
export const act12 = padaAct('bbi07-pada', 'bbi7pd');

/** act 13, the far drummer (pose-shapes family): a second drummer sits on your bank playing out of step; the
 *  troupe follows its own drummer across the pit. A2: watch the far drummer, not the one by you. A3: his
 *  sticks are the warning too: the near drummer's still sticks don't mean you have time. */
export const T07F: TroupeCfg[] = [{ c0: 4, n: 7, drum: 1.6, hold: 1.7, poses: ['bridge'], form: 0.3, decoy: 1.65 }];
export const act13 = troupeAct('bbi07-dui-baja', 15, T07F, 'bbi7db', 'Two drummers: one by you, one across the pit. The troupe follows the one across the pit: go when he stops, not when yours does. And watch his sticks for the restart, not your drummer’s.');

/** act 14, gum-ta (IDEAS-3 B3, pose-shapes family): the mardala's last stroke before each stop names the pose: a
 *  deep stroke ends in the bridge, a sharp one in the tower. These bridges hold only just long enough to cross
 *  from the moment they land, so you must commit on the stroke, before you can see the shape. */
export const T07G: TroupeCfg[] = [{ c0: 4, n: 8, drum: 1.4, hold: 1.3, poses: ['tower', 'bridge', 'tower', 'tower', 'bridge'], form: 0.25, forecast: true }];
export const act14 = troupeAct('bbi07-gum-ta', 16, T07G, 'bbi7gt', 'Listen to the mardala’s last stroke before it stops: a deep stroke (the wide mark over the drummer) ends in the bridge, a sharp one (the thin high mark) in the tower. This bridge only just lasts the walk: on a deep stroke, go as it stops, before you can see it; on a sharp one, stay.');

/** act 15, jodi (IDEAS-3 B5, pose-shapes family): two troupes share each pit, half the bridge each, each on its own
 *  drummer; the half whose drummer stopped first gets up first. In the first pit the far half is older: go as the
 *  near half lands. In the second the near half is older: step on to it the moment it lands, though it ends in
 *  mid-air, and walk; the far half lands under your next step. */
export const JODI = { p1: 4, p2: 18, n: 5, drum: 1.4 };
export const act15: Act = {
  id: 'bbi07-jodi',
  w: 32,
  advice: 'Two troupes share each pit, half the bridge each, and the half whose drummer stopped first gets up first. Watch which drummer stops first. If it is the far one, go as the near half lands. If it is the near one, step on to his half the moment it lands, even though it ends in mid-air, and walk: the far half lands under your next step.',
  cps: [14.5],
  paint: (g, c) => {
    g.pit(c.x + JODI.p1, c.x + JODI.p1 + 2 * JODI.n - 1).pit(c.x + JODI.p2, c.x + JODI.p2 + 2 * JODI.n - 1);
  },
  build: (w, c) => {
    const st1 = { t0: -1 };
    const st2 = { t0: -1 };
    onPass(w, c.X(JODI.p1 - 2.5), (w2) => (st1.t0 = w2.tick));
    onPass(w, c.X(JODI.p2 - 2.5), (w2) => (st2.t0 = w2.tick));
    stagePit(w, c.x + JODI.p1, c.x + JODI.p1 + 2 * JODI.n - 1);
    // the second pit names its own death: the older half got up under you
    const g = channel(w, c.x + JODI.p2, c.x + JODI.p2 + 2 * JODI.n - 1, 'bbi-nacha', 'drain');
    g.o.tick = (r, w2) => {
      const p = w2.player;
      if (p.onGround && p.y + p.h >= FL - 1) w2.flags.bbiThrown = 0;
      r.hazard!.cause = w2.flags.bbiThrown ? 'bbi-adha' : 'bbi-nacha';
    };
    const n = JODI.n;
    // pit 1: the far half stops first and holds longer; the near half lands second
    troupe(w, { c0: c.x + JODI.p1, n, drum: 2.0, hold: 2.0, poses: ['bridge'], form: 0.2, drumX: c.x + JODI.p1 - 1.4 }, () => st1.t0, 'bbi7jd1n');
    troupe(w, { c0: c.x + JODI.p1 + n, n, drum: 1.4, hold: 2.2, poses: ['bridge'], form: 0.2, drumX: c.x + JODI.p1 + 2 * n + 0.4 }, () => st1.t0, 'bbi7jd1f');
    // pit 2: the near half stops first and holds only briefly; the far half lands second
    troupe(w, { c0: c.x + JODI.p2, n, drum: 1.4, hold: 1.25, poses: ['bridge'], form: 0.2, drumX: c.x + JODI.p2 - 1.4 }, () => st2.t0, 'bbi7jd2n');
    troupe(w, { c0: c.x + JODI.p2 + n, n, drum: 2.0, hold: 2.0, poses: ['bridge'], form: 0.2, drumX: c.x + JODI.p2 + 2 * n + 0.4 }, () => st2.t0, 'bbi7jd2f');
  },
};

/** act 16, gadiba (IDEAS-3 B1, pose-shapes family): the drummer sits on your bank, and on a drum roll (the bridge
 *  shivers first) the line of boys turns over towards him: walk his way and you ride the turn back to the bank;
 *  stand or walk on and you are rolled under. The next stop has no roll: cross on that one. */
export const T07R: TroupeCfg[] = [{ c0: 4, n: 11, drum: 1.4, hold: 2.0, poses: ['bridge', 'bridge'], form: 0.25, roll: { stops: [0], at: 0.6, dur: 0.5 } }];
export const act16 = troupeAct('bbi07-gadiba', 19, T07R, 'bbi7gd', 'On a drum roll (the bridge shivers first) this line of boys turns over towards the drummer on your bank. If it shivers under you, turn round and walk his way: you ride the turn back to the bank. The next stop has no roll: cross on that one.');

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
