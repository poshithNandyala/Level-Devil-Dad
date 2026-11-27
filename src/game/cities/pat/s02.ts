// PAT-02 Litti ki Aanch: the roadside litti fire. The embers are a floor you can walk, but the iron poker
// digs where the cooked litti are (a crack in the ash), and it digs the moment you are on your way.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { column, since, taraScript } from './common';
import { lines as L } from './lines';

const FL = 240;
/** the three strikes of the room: [column, seconds after Dad reaches column 5, telegraph], active 0.5 s */
export const STRIKES = [
  { c: 10, at: 0.65 },
  { c: 16, at: 2.6 },
  { c: 22, at: 4.5 },
];
export const RAKE_AT = 5.3;
export const STRIKE_ON = 0.5;

/** a strike of the poker: a column of thrown embers at column c (3 tiles wide), warned by the crack glowing first */
function ember(ctx: CanvasRenderingContext2D, x: number, glow: number, on: number) {
  // the crack in the ash
  box(ctx, x - 14, FL - 3, 28, 3, glow > 0 ? '#E8742A' : '#6B5A48');
  if (glow > 0) for (let i = 0; i < 6; i++) box(ctx, x - 12 + i * 5, FL - 4 - (i % 2) * 2, 2, 2, '#FFD27A');
  if (on > 0) {
    // the poker driven into the ash, embers flying up round it
    box(ctx, x - 2, 0, 4, FL - 4, '#4A4A52');
    box(ctx, x - 4, FL - 14, 8, 10, '#2E2E36');
    for (let i = 0; i < 12; i++) box(ctx, x - 22 + i * 4 + ((i * 7) % 5), FL - 10 - ((i * 13) % 40), 3, 3, i % 2 ? '#FF8A2A' : '#FFD27A');
  }
}

function ashBed(w: World, c0: number, c1: number) {
  w.add(
    new Paint((ctx, w2) => {
      // a long bed of grey ash with live embers glowing through it
      const x0 = px(c0),
        wd = px(c1 - c0 + 1);
      box(ctx, x0, FL - 7, wd, 7, '#7E786C');
      box(ctx, x0, FL - 7, wd, 2, '#A39D90');
      for (let x = x0; x < x0 + wd; x += 6) {
        const k = (x * 7) % 11;
        box(ctx, x + (k % 3), FL - 5 + (k % 3), 3, 2, k % 3 === 0 ? '#E8642A' : k % 3 === 1 ? '#5C554A' : '#FFB347');
      }
      void w2;
    }, 1),
  );
}

function cook(w: World, x: number, label: string) {
  w.add(
    new Paint((ctx) => {
      // a clay angeethi with the cook beside it
      box(ctx, x - 12, FL - 22, 24, 22, '#8A4A30');
      box(ctx, x - 9, FL - 24, 18, 3, '#2E2E36');
      box(ctx, x - 6, FL - 27, 12, 3, '#E06A2A');
      box(ctx, x + 14, FL - 26, 8, 16, '#D7262E');
      box(ctx, x + 15, FL - 32, 6, 6, '#C68B59');
      void label;
    }, -3),
  );
}

export function room(): LevelDef {
  return {
    id: 'PAT-02',
    city: 'PAT',
    index: 2,
    name: 'Litti ki Aanch',
    nameEn: 'The litti fire',
    tagline: 'Litti bakes buried in the embers. The man with the poker knows exactly where.',
    hint: 'The ash is a safe floor, but the poker digs where the cracks are. Each crack glows just before it strikes: three strikes, one after another, and you only stand between them. When the last has struck, the cook rakes the whole bed from the left: keep moving, and hop the rake if it catches up.',
    par: 14,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = { t0: -1, rake: 0 };
      w.flags.pat2 = st;
      ashBed(w, 7, 26);
      cook(w, px(4) + 8, 'litti');
      onPass(w, px(5), (w2) => {
        st.t0 = w2.tick;
        tara(w2, L.intro[0], 2.2);
      });
      for (const s of STRIKES) {
        w.add(
          new Rig(px(s.c - 1.5), 0, px(3), FL, {
            layer: 3,
            cause: 'pat-angara',
            inset: 3,
            live: (_r, w2) => {
              if (st.t0 < 0) return false;
              const t = since(w2, st.t0);
              return t >= s.at && t < s.at + STRIKE_ON;
            },
            paint: (ctx, r, w2) => {
              const t = st.t0 < 0 ? -9 : since(w2, st.t0);
              ember(ctx, r.x + r.w / 2, t >= s.at - 0.5 && t < s.at ? 1 : 0, t >= s.at && t < s.at + STRIKE_ON ? 1 : 0);
            },
          }),
        );
      }
      // the rake: a low iron bar the cook drags along the bed from the left once the last strike is done
      const rake = w.add(
        new Rig(px(5), FL - 12, 14, 12, {
          layer: 3,
          cause: 'pat-chimta',
          inset: 1,
          tick: (r, w2) => {
            if (st.t0 < 0) return;
            const t = since(w2, st.t0);
            if (t >= RAKE_AT && r.x < px(27)) r.x += perTick(100);
            r.on = t >= RAKE_AT - 0.4 && r.x < px(27);
            st.rake = r.x;
          },
          paint: (ctx, r) => {
            box(ctx, r.x, r.y, r.w, 3, '#4A4A52');
            for (let i = 0; i < 4; i++) box(ctx, r.x + 1 + i * 4, r.y + 3, 2, 9, '#4A4A52');
          },
        }),
      );
      rake.on = false;
      sign(w, 12.5, 10.2, 3.4, 'LITTI', 'shop', null, 'fresh from the fire');
      rival(w, 29, 15, -1, taraScript(2));
      collectible(w, 'pat-chokha', 16, 11.9);
    },
  };
}

/** a bed where the poker follows rolling litti: each marker is {start column, phase (s), cause}. State is on w.flags[key]. */
function markerBed(w: World, c: { x: number; X: (t: number) => number }, key: string, marks: { start: number; off: number; cause: string }[], len = 34) {
  ashBed(w, c.x + 1, c.x + len);
  const st: { t0: number; x: number; xs: number[]; offs: number[] } = { t0: -1, x: 0, xs: marks.map(() => 0), offs: marks.map((m) => m.off) };
  w.flags[key] = st;
  onPass(w, c.X(2), (w2) => {
    st.t0 = w2.tick;
  });
  const P = 2.6;
  marks.forEach((m, i) => {
    // the marker starts at its column and rolls right at 30 px/s between strikes; the poker comes down on it every 2.6 s
    w.add(
      new Rig(c.X(m.start), 0, px(3), FL, {
        layer: 3,
        cause: m.cause,
        inset: 3,
        live: (_r, w2) => st.t0 >= 0 && (since(w2, st.t0) + m.off) % P < STRIKE_ON && since(w2, st.t0) + m.off >= 1.5,
        tick: (rr, w2) => {
          if (st.t0 < 0) return;
          const t = since(w2, st.t0) + m.off;
          const k = Math.floor(t / P);
          const into = t - k * P;
          const moved = (k + Math.min(1, Math.max(0, (into - STRIKE_ON) / (P - STRIKE_ON)))) * 30 * (P - STRIKE_ON);
          rr.x = c.X(m.start) - px(1.5) + moved;
          st.xs[i] = rr.x + rr.w / 2;
          if (i === 0) st.x = st.xs[0];
        },
        paint: (ctx, rr, w2) => {
          const t = st.t0 < 0 ? -9 : since(w2, st.t0) + m.off;
          const into = t % P;
          ember(ctx, rr.x + rr.w / 2, t >= 1 && into > P - 0.5 ? 1 : 0, t >= 1.5 && into < STRIKE_ON ? 1 : 0);
        },
      }),
    );
  });
}

/** act: the cook rolls a cooked litti along the bed; the poker follows the marker, so walk behind it and go on */
export const act: Act = {
  id: 'pat02-chokha',
  w: 36,
  advice: 'A second bed: the cook rolls one cooked litti along it, and the poker follows the litti, striking it every few seconds. Stay behind the litti until its strike has gone, then run past it and on.',
  cps: [3],
  paint: () => {},
  build: (w, c) => {
    markerBed(w, c, 'pat2a', [{ start: 7, off: 0, cause: 'pat-angara' }]);
    sign(w, c.x + 31, 10.4, 3, 'CHOKHA', 'shop', null, 'a bowl of it');
  },
};

/** the ladder: two litti on one bed, each with its own strike; getting past the first does not get you past the second */
export const actBhatti: Act = {
  id: 'pat02-bhatti',
  w: 50,
  advice: 'The big bhatti: the cook has rolled two litti along the bed, and the poker follows each one in turn. Get behind the first until its strike has gone and run past it, then do the same behind the second, which strikes at a different moment.',
  cps: [18],
  paint: () => {},
  build: (w, c) => {
    markerBed(w, c, 'pat2b', [{ start: 7, off: 0, cause: 'pat-angara' }, { start: 25, off: 1.3, cause: 'pat-doosra' }], 40);
    sign(w, c.x + 46, 10.4, 3, 'BHATTI', 'shop', null, 'two litti, one poker');
  },
};

/** ending: two pestles pound a mortar of chokha either side of the door; slip between them */
export const ending: Ending = {
  space: 16,
  advice: 'The door is behind two mortars of chokha with a pestle pounding each. A pestle drops, lifts, drops again: cross each one just after it lifts, and wait in the gap between them.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'pestles';
    const art = (ctx: CanvasRenderingContext2D, r: Rig, lowered: number) => {
      const cx = r.x + r.w / 2;
      const top = lowered > 0.9 ? FL - 40 : 0 - 40 + (1 - lowered) * -6;
      // the wooden pestle: a long pole, a thick head
      box(ctx, cx - 3, top, 6, FL - top - 12, '#8A5A2B');
      box(ctx, cx - 9, FL - 28 - (lowered > 0.9 ? 0 : 150), 18, 22, '#6B3F1C');
      if (lowered > 0.9) box(ctx, cx - 12, FL - 6, 24, 6, '#5B3A1E');
    };
    w.flags.pat2e = [
      [8, 0],
      [4, 1.6],
    ].map(([dx, ph]) => column(w, px(D - dx) - 8, px(2), 3.2, ph, 1.1, 'pat-musal', art));
    w.add(
      new Paint((ctx) => {
        // the mortars: two wooden okhli with chokha in them
        for (const dx of [8, 4]) {
          box(ctx, px(D - dx) - 10, FL - 10, 36, 10, '#6B3F1C');
          box(ctx, px(D - dx) - 6, FL - 12, 28, 3, '#7A5F3A');
        }
      }, 2),
    );
  },
};

export const meta02 = { family: 'ember-floor-poker-targets-food', betrayals: ['poker-targets-food'], ending: 'pat-musal' };
