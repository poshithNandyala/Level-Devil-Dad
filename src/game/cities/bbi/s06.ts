// BBI-06 Bandha: Sambalpuri ikat. The threads are tie-dyed before weaving, so the pattern only appears when
// they line up on the loom. Here each warp thread over the dye pit carries one dyed patch you can stand on,
// and every beat of the loom moves every patch along its thread by its own step. Most beats they are scattered
// (one is tucked into the weave and holds nobody); on one beat in five they all line up into the motif: a
// bridge. And on that beat, the weaver throws the shuttle across it.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, since, taraScript } from './common';

export const M = 5;
const IKAT = ['#B71C1C', '#F4D35E', '#1B1B3A', '#FFFFFF', '#2A9D8F'];

export interface LoomCfg {
  /** first thread's column, and how many threads */
  c0: number;
  n: number;
  /** each thread's step per beat (1..4) */
  speeds: number[];
  /** seconds per ordinary beat, and how long the motif (bridge) beat is held */
  beat: number;
  hold: number;
  /** shuttle passes on the bridge beat: [seconds into it, direction] */
  shuttle: [number, 1 | -1][];
  /** each thread's patch sits this many px higher than the one before: the motif is a staircase, not a bridge */
  rise?: number;
  /** the beater sweeps the warp at the end of the motif beat: be off the threads before it */
  reed?: boolean;
  /** threads (by index) left undyed: no patch at all, a hole in the motif */
  blank?: number[];
}

/** where in the loom's cycle the time t (s since it started) falls: the beat number and seconds into it */
export function beatAt(cfg: LoomCfg, t: number) {
  const cycle = 4 * cfg.beat + cfg.hold;
  const n = Math.floor(t / cycle);
  const r = t - n * cycle;
  const j = r < 4 * cfg.beat ? Math.floor(r / cfg.beat) : 4;
  const into = j < 4 ? r - j * cfg.beat : r - 4 * cfg.beat;
  return { b: n * 5 + j, j, into, left: (j < 4 ? cfg.beat : cfg.hold) - into };
}
/** a thread's patch level on beat b (0 = the bridge, flush with the banks; 4 = tucked in the weave) */
export const level = (s: number, b: number) => ((((-4 * s + s * b) % M) + M) % M);
const lvlY = (l: number) => FL - 20 * l;

/** the loom over a dye pit: threads, patches, the beater, the shuttle and the weaver */
export function loom(w: World, cfg: LoomCfg, t0: () => number, key: string) {
  const st = { b: -1, j: -1, bridge: false, shuttleX: -999, into: 0, left: 0 };
  (w.flags[key] as unknown) = st;
  const T = (w2: World) => (t0() < 0 ? -1 : since(w2, t0()));
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 2,
      tick: (_r, w2) => {
        const t = T(w2);
        if (t < 0) return;
        const a = beatAt(cfg, t);
        st.b = a.b;
        st.j = a.j;
        st.into = a.into;
        st.left = a.left;
        st.bridge = a.j === 4;
      },
      paint: (ctx, _r, w2) => {
        const x0 = px(cfg.c0);
        const x1 = px(cfg.c0 + cfg.n);
        // the loom's frame and the beater bar, which slams at each beat
        box(ctx, x0 - 6, FL - 110, 4, 110, '#6E4A2E');
        box(ctx, x1 + 2, FL - 110, 4, 110, '#6E4A2E');
        box(ctx, x0 - 6, FL - 112, x1 - x0 + 12, 5, '#6E4A2E');
        const slam = st.b >= 0 && st.into < 0.12;
        box(ctx, x0 - 4, slam ? FL - 90 : FL - 98, x1 - x0 + 8, 3, '#A0703C');
        for (let k = 0; k < cfg.n; k++) box(ctx, x0 + k * 16 + 7, FL - 107, 2, 107 + 30, 'rgba(250,240,220,0.75)');
        // the weaver at the side, and the woven cloth growing behind
        folk(ctx, x0 - 18, FL - 2, 24, '#F4D35E', { skirt: '#B71C1C', face: 1, arm: st.bridge ? -0.6 : 0.4 });
        void w2;
      },
    }),
  );
  const patches: Rig[] = [];
  for (let k = 0; k < cfg.n; k++) {
    const s = cfg.speeds[k % cfg.speeds.length];
    const x = px(cfg.c0 + k);
    patches.push(
      w.add(
        new Rig(x, lvlY(level(s, 0)) - (cfg.rise ?? 0) * k, 16, 6, {
          solid: true,
          layer: 3,
          tick: (r, w2) => {
            if (cfg.blank?.includes(k)) {
              r.setSolid(false);
              return;
            }
            if (st.b < 0) {
              r.setSolid(level(s, 0) !== 4);
              return;
            }
            const l = level(s, st.b);
            r.setSolid(l !== 4);
            // the patch slides to its new place over the first tenth of a second of the beat
            const prev = level(s, st.b - 1);
            const k2 = Math.min(1, st.into / 0.1);
            const yFrom = lvlY(prev === 4 ? l : prev);
            const yTo = lvlY(l === 4 ? prev : l);
            r.moveTo(w2, x, yFrom + (yTo - yFrom) * k2 - (cfg.rise ?? 0) * k);
          },
          paint: (ctx, r) => {
            if (!r.solid?.collidable) return;
            for (let i = 0; i < 4; i++) box(ctx, r.x + i * 4, r.y, 4, 6, IKAT[(k + i + (r.y > FL - 1 ? 0 : 1)) % IKAT.length]);
            box(ctx, r.x, r.y + 5, 16, 1, 'rgba(0,0,0,0.3)');
          },
        }),
      ),
    );
  }
  // the shuttle: on the motif beat it flies across the bridge at Dad's height
  const sh = w.add(
    new Rig(-999, FL - 14, 14, 8, {
      cause: 'bbi-shuttle',
      inset: 1,
      layer: 4,
      tick: (r, w2) => {
        r.x = -999;
        if (!st.bridge) return;
        for (const [at, dir] of cfg.shuttle) {
          const dt = st.into - at;
          const span = px(cfg.n) - 14;
          const d = dt * 320;
          if (dt >= 0 && d <= span) r.x = dir < 0 ? px(cfg.c0 + cfg.n) - 14 - d : px(cfg.c0) + d;
        }
        st.shuttleX = r.x;
        void w2;
      },
      paint: (ctx, r) => {
        if (r.x < -100) return;
        ctx.fillStyle = '#8D5A2B';
        ctx.beginPath();
        ctx.moveTo(r.x, r.y + 4);
        ctx.lineTo(r.x + 4, r.y);
        ctx.lineTo(r.x + 10, r.y);
        ctx.lineTo(r.x + 14, r.y + 4);
        ctx.lineTo(r.x + 10, r.y + 8);
        ctx.lineTo(r.x + 4, r.y + 8);
        ctx.closePath();
        ctx.fill();
        box(ctx, r.x + 5, r.y + 3, 4, 2, '#F4D35E');
      },
    }),
  );
  // the beater: at the end of the motif beat it sweeps the warp from the weaver's side
  if (cfg.reed)
    w.add(
      new Rig(-999, FL - 40, 6, 40, {
        cause: 'bbi-rachh',
        inset: 0,
        layer: 4,
        tick: (r) => {
          r.x = -999;
          if (!st.bridge) return;
          const k = (st.into - (cfg.hold - 0.7)) / 0.6;
          if (k >= 0 && k <= 1) r.x = px(cfg.c0) - 8 + (px(cfg.n) + 16) * k;
        },
        paint: (ctx, r) => {
          if (r.x < -100) {
            // resting by the weaver, a hand's width above the warp
            box(ctx, px(cfg.c0) - 10, FL - 40, 4, 40, '#A0703C');
            return;
          }
          box(ctx, r.x, r.y, r.w, r.h, '#A0703C');
          box(ctx, r.x + 1, r.y, 2, r.h, '#C8955A');
        },
      }),
    );
  return { st, patches, sh };
}

export const L06: LoomCfg = { c0: 9, n: 7, speeds: [1, 3, 2, 4, 2, 3, 1], beat: 0.9, hold: 1.8, shuttle: [[0, -1]] };

export function room(): LevelDef {
  return {
    id: 'BBI-06',
    city: 'BBI',
    index: 6,
    name: 'Bandha',
    nameEn: 'Ikat on the loom',
    tagline: 'Sambalpuri ikat: the threads are tie-dyed before they are woven, so the pattern only shows once they line up on the loom.',
    hint: 'Each thread over the dye carries one patch you can stand on, and every beat of the loom moves every patch by its own step: hop on them and the next beat takes yours away. Count the beats: one in five, they all line up into the motif, a bridge flush with the floor. But that is when the weaver throws the shuttle across: let it fly past, then walk over before the next beat.',
    par: 30,
    map: Grid.ground(15).pit(L06.c0, L06.c0 + L06.n - 1).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = { t0: -1 };
      w.flags.bbi6r = st;
      onPass(w, px(2), (w2) => (st.t0 = w2.tick));
      channel(w, L06.c0, L06.c0 + L06.n - 1, 'bbi-ranga', 'water');
      loom(w, L06, () => st.t0, 'bbi6');
      sign(w, 4, 10.4, 3.4, 'SAMBALPURI', 'shop', null, 'bandha');
      rival(w, 3, 15, 1, taraScript(6));
      onPass(w, px(5), (w2) => w2.guide('Ruha! Dekhi ki chala! | Stop! Look and walk!', (w3) => w3.player.cx < px(9)));
      collectible(w, 'bbi-chhenapoda', 12.4, 9.2);
    },
  };
}

/** act: a wider loom whose shuttle goes across and back on the motif beat */
export const L06A: LoomCfg = { c0: 4, n: 9, speeds: [2, 4, 1, 3, 4, 2, 3, 1, 2], beat: 0.85, hold: 2.8, shuttle: [[0, 1], [0.55, -1]] };
export const act: Act = {
  id: 'bbi06-tana',
  w: 20,
  advice: 'A wider loom, and on its motif beat the shuttle goes across and comes back. Wait for both, then cross before the beat ends.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + L06A.c0, c.x + L06A.c0 + L06A.n - 1);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi6a = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    channel(w, c.x + L06A.c0, c.x + L06A.c0 + L06A.n - 1, 'bbi-ranga', 'water');
    loom(w, { ...L06A, c0: c.x + L06A.c0 }, () => st.t0, 'bbi6b');
  },
};

/** a loom act: one loom over a pit at cfg.c0 (act columns) */
export function loomAct(id: string, w0: number, cfg: LoomCfg, key: string, advice: string): Act {
  return {
    id,
    w: w0,
    advice,
    cps: [],
    paint: (g, c) => {
      g.pit(c.x + cfg.c0, c.x + cfg.c0 + cfg.n - 1);
    },
    build: (w, c) => {
      const st = { t0: -1 };
      onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
      channel(w, c.x + cfg.c0, c.x + cfg.c0 + cfg.n - 1, 'bbi-ranga', 'water');
      loom(w, { ...cfg, c0: c.x + cfg.c0 }, () => st.t0, key);
    },
  };
}

/** act 6, the staircase: these threads are dyed so the motif lines up as steps, up to the raised far bank */
export const L06S: LoomCfg = { c0: 3, n: 7, speeds: [1, 2, 3, 4, 3, 2, 1], beat: 0.8, hold: 2.4, shuttle: [], rise: 9 };
export function sidhiAct(id: string, key: string): Act {
  return {
  id,
  w: 16,
  advice: 'This motif is a staircase, not a bridge: on its beat the patches line up as steps rising to the raised bank. Hop up them, one each, before the beat ends.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + L06S.c0, c.x + L06S.c0 + L06S.n - 1).fill(c.x + L06S.c0 + L06S.n, c.x + 15, 11, 14, '#');
  },
  build: (w, c) => {
    const st = { t0: -1 };
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    channel(w, c.x + L06S.c0, c.x + L06S.c0 + L06S.n - 1, 'bbi-ranga', 'water');
    loom(w, { ...L06S, c0: c.x + L06S.c0 }, () => st.t0, key);
  },
};
}
export const act6 = sidhiAct('bbi06-sidhi', 'bbi6s');
/** act 7, the beater: the motif holds, but at its end the beater sweeps the warp from the weaver's side */
export const L06R: LoomCfg = { c0: 3, n: 8, speeds: [4, 2, 1, 3, 1, 4, 3, 2], beat: 0.8, hold: 2.2, shuttle: [[0, -1]], reed: true };
export const act7 = loomAct('bbi06-rachh', 16, L06R, 'bbi6q', 'Here the beater sweeps the warp at the end of the motif beat. Let the shuttle by, then cross at once: be off the threads before the beater comes.');
/** act 11, the undyed thread (loom family): one warp thread here was never tied and dyed, so it carries no
 *  patch: the motif lines up with a hole in it. A2: the shuttle still goes first. A3: and then the hole, which
 *  only shows once the bridge is there: hop it. */
export const L06Z: LoomCfg = { c0: 3, n: 9, speeds: [3, 1, 4, 2, 1, 3, 2, 4, 1], beat: 0.8, hold: 2.8, shuttle: [[0, -1]], blank: [4, 5] };
export const act11: Act = {
  id: 'bbi06-sutra',
  w: 17,
  advice: 'Two threads on this loom were never dyed: when the motif lines up there’s a hole in it, two threads wide. Let the shuttle go by first, as ever, then walk out and hop the hole.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + L06Z.c0, c.x + L06Z.c0 + L06Z.n - 1);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi6ut = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    const h = c.x + L06Z.c0 + L06Z.blank![0];
    channel(w, c.x + L06Z.c0, h - 1, 'bbi-ranga', 'water');
    channel(w, h, h + 1, 'bbi-sutra', 'water');
    channel(w, h + 2, c.x + L06Z.c0 + L06Z.n - 1, 'bbi-ranga', 'water');
    loom(w, { ...L06Z, c0: c.x + L06Z.c0 }, () => st.t0, 'bbi6z');
  },
};

/** act 9, Pattachitra (BBI reserve, painted-panel-previews-next): two dye pits with cloth planks, and a painted
 *  panel on the bank before each. A panel paints the NEXT pit, not the one beside it. The first pit holds all
 *  over (the plain beat) and its panel shows the second; the second's panel shows what comes after. */
export const PATTA = { a: 3, b: 13, n: 3, rotten: [1], panelB: [1] };
export const act9: Act = {
  id: 'bbi06-patta',
  w: 22,
  advice: 'Painted panels by the pits. Each one shows the NEXT pit, not the one beside it: the first pit holds all over, and its panel shows the second. Remember it. The panel at the second pit is showing what comes after.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + PATTA.a, c.x + PATTA.a + PATTA.n * 2 - 1);
    g.pit(c.x + PATTA.b, c.x + PATTA.b + PATTA.n * 2 - 1);
  },
  build: (w, c) => {
    channel(w, c.x + PATTA.a, c.x + PATTA.a + PATTA.n * 2 - 1, 'bbi-ranga', 'water');
    const pitB = channel(w, c.x + PATTA.b, c.x + PATTA.b + PATTA.n * 2 - 1, 'bbi-sadha', 'water');
    // the cause: walked on to the rotten plank, or jumped to it because the panel beside the pit painted it
    const st = { touched0: false, fell: false };
    w.flags.bbi6pc = st;
    pitB.o.tick = (r) => {
      r.hazard!.cause = st.touched0 ? 'bbi-sadha' : 'bbi-chitra';
    };
    const planks = (c0: number, rotten: number[], first?: (on: boolean) => void) => {
      for (let i = 0; i < PATTA.n; i++) {
        const bad = rotten.includes(i);
        let on = 0;
        w.add(
          new Rig(c.X(c0 + i * 2), FL, 32, 6, {
            solid: true,
            layer: 2,
            tick: (r, w2) => {
              if (i === 0 && first && r.rides(w2)) first(true);
              if (!bad || !r.solid?.collidable) return;
              on = r.rides(w2) ? on + 1 : 0;
              if (on >= 6) r.setSolid(false);
            },
            paint: (ctx, r) => {
              if (!r.solid?.collidable) return;
              box(ctx, r.x + 1, r.y, r.w - 2, r.h, IKAT[(c0 + i) % 5]);
              box(ctx, r.x + 1, r.y + r.h - 1, r.w - 2, 1, '#3B2416');
            },
          }),
        );
      }
    };
    planks(PATTA.a, []);
    planks(PATTA.b, PATTA.rotten, () => (st.touched0 = true));
    // the panels: a framed painting of three planks, the ones it shows holding in colour, the rest torn
    const panel = (cx: number, good: number[]) =>
      w.add(
        new Rig(0, 0, 0, 0, {
          layer: -2,
          paint: (ctx) => {
            const x = c.X(cx);
            box(ctx, x + 4, FL - 44, 3, 44, '#5D3A1E');
            box(ctx, x - 6, FL - 74, 34, 30, '#7A1F1F');
            box(ctx, x - 4, FL - 72, 30, 26, '#F3E3C3');
            box(ctx, x - 2, FL - 60, 26, 8, '#5E7F86');
            for (let i = 0; i < 3; i++) if (good.includes(i)) box(ctx, x - 1 + i * 9, FL - 62, 7, 3, '#B71C1C');
            folk(ctx, x + 11, FL - 64, 8, '#1B1B3A', { skirt: '#F4D35E', face: 1, arm: 0.6 });
          },
        }),
      );
    panel(PATTA.a - 2, [0, 2]);
    panel(PATTA.b - 2, PATTA.panelB);
    sign(w, c.x + 20, 10.4, 3.6, 'PATTACHITRA', 'shop', null, 'D');
  },
};

/** ending: a curtain of warp threads in front of the door; only on the motif beat do they part into its shape */
export const L06E: LoomCfg = { c0: 0, n: 3, speeds: [1, 2, 3], beat: 0.8, hold: 1.6, shuttle: [] };
export const ending: Ending = {
  space: 12,
  advice: 'The door is behind a curtain of warp threads. Only on the motif beat do they part into the door’s shape: walk through then, and don’t be in it when the next beat closes it.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-motif-door';
    const st = { t0: -1, open: false };
    w.flags.bbi6e = st;
    onPass(w, px(D - 10), (w2) => (st.t0 = w2.tick));
    const cfg = { ...L06E, c0: D - 3 };
    w.add(
      new Rig(px(D - 3), FL - 64, px(3), 64, {
        solid: true,
        cause: 'bbi-tana',
        inset: 3,
        layer: 4,
        live: (r) => !!r.solid?.collidable,
        tick: (r, w2) => {
          const open = st.t0 >= 0 && beatAt(cfg, since(w2, st.t0)).j === 4;
          st.open = open;
          r.setSolid(!open);
        },
        paint: (ctx, r, w2) => {
          const a = st.t0 >= 0 ? beatAt(cfg, since(w2, st.t0)) : { b: 0, j: 0 };
          for (let k = 0; k < 9; k++) {
            const x = r.x + k * 5 + 2;
            if (st.open && k >= 2 && k <= 6) {
              // parted: the motif, the shape of a door, in the cloth either side
              box(ctx, x, r.y, 2, 6, IKAT[k % 5]);
              continue;
            }
            for (let y = 0; y < 64; y += 8) box(ctx, x, r.y + y, 3, 8, IKAT[(k + y / 8 + a.b * (k % 3 + 1)) % 5]);
          }
        },
      }),
    );
  },
};

export const meta06 = { family: 'loom-beat-aligns-threads', betrayals: ['beat-align'], ending: 'bbi-motif-door' };
