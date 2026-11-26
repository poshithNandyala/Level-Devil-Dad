// PAT-01 Prannam Patna: the welcome tour with two bites. A tempo pulls in behind Dad at the bus stop and the
// waiting crowd surges to it along the road (walk on and it sweeps you off your feet: sidestep up on the kerb
// board). Then a coaching hoarding comes down in the road ahead of you.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import type { Grid } from '../../levels/grid';
import { Paint, tara } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';
import { px } from '../../levels/kit';
import { Rig, box, folk, perTick } from './entities';
import { lines as L } from './lines';

const FL = 240;
export const TEMPO_W = 56;
/** the bus stop: Dad meets the horn at this column; the kerb board is cols 68-73, a tile and a half above the road */
export const STOP = { trigger: 63, kerb: [68, 73] as [number, number], crowdFrom: 80, board: 62.5, stopAt: 62 };

export const tempoArt = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, flip = false) => {
  // a shared tempo: three-wheeler body, canopy and a red stripe, passengers' heads at the back
  ctx.save();
  ctx.translate(x, y);
  if (flip) {
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  box(ctx, 0, 10, w, h - 18, '#2F6B4F');
  box(ctx, 0, 10, w, 3, '#1F4A36');
  box(ctx, 0, h - 14, w, 3, '#D7262E');
  box(ctx, 2, 0, w - 14, 10, '#F2B705');
  box(ctx, 3, 2, w - 16, 3, '#FFE9A0');
  box(ctx, w - 12, 12, 9, 10, '#BFE3F2');
  for (let i = 0; i < 4; i++) box(ctx, 6 + i * 9, 14, 6, 6, i % 2 ? '#C68B59' : '#9A6A42');
  ctx.fillStyle = '#1D1A1A';
  for (const wx of [8, w - 10]) {
    ctx.beginPath();
    ctx.arc(wx, h - 4, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

function bus(w: World) {
  const st: { phase: string; t0: number } = { phase: 'wait', t0: 0 };
  w.flags.pat1 = st;
  const tempo = w.add(
    new Rig(-300, FL - 50, TEMPO_W, 50, {
      layer: 1,
      cause: 'pat-tempo',
      inset: 3,
      live: () => st.phase === 'leave',
      paint: (ctx, r) => tempoArt(ctx, r.x, r.y, r.w, r.h),
      tick: (r, w2) => {
        const t = (w2.tick - st.t0) / 120;
        if (st.phase === 'arrive') {
          r.x += perTick(220);
          if (r.x + r.w >= px(STOP.stopAt)) {
            r.x = px(STOP.stopAt) - r.w;
            st.phase = 'load';
          }
        } else if (st.phase === 'load' && t >= 3.4) {
          st.phase = 'leave';
          w2.sfx('honk', r.x, FL - 20);
        } else if (st.phase === 'leave') {
          r.s.v = Math.min(100, (r.s.v ?? 0) + 70 / 120);
          r.x += perTick(r.s.v);
          if (r.x > px(STOP.kerb[1] + 22)) {
            st.phase = 'gone';
            r.on = false;
          }
        }
      },
    }),
  );
  // the crowd: five people with their bundles, a wall of them at road height
  const crowd = w.add(
    new Rig(-300, FL - 26, 62, 26, {
      layer: 3,
      cause: 'pat-bheed',
      inset: 2,
      live: (r) => (st.phase === 'load' || st.phase === 'arrive') && r.on && !r.s.boarded,
      paint: (ctx, r, w2) => {
        for (let i = 0; i < 5; i++) folk(ctx, r.x + 6 + i * 12, r.y - 4 + ((w2.tick >> 3) + i) % 2, 28, ['#D7262E', '#2F6BB0', '#F2B705', '#6F8F3A', '#8A4A8F'][i], { sack: i % 2 ? '#C9A56B' : undefined });
      },
      tick: (r, w2) => {
        const t = (w2.tick - st.t0) / 120;
        if ((st.phase === 'load' || st.phase === 'arrive') && t >= 1.0 && r.on) {
          if (r.x > px(STOP.board)) r.x -= perTick(160);
          else {
            r.on = false;
            r.s.boarded = true;
          }
        }
      },
    }),
  );
  crowd.on = false;
  st.t0 = 0;
  // the stop's sign and shelter
  onPass(w, px(STOP.trigger), (w2) => {
    st.t0 = w2.tick;
    st.phase = 'arrive';
    tempo.x = px(STOP.trigger - 28) - TEMPO_W;
    tempo.on = true;
    crowd.x = px(STOP.crowdFrom);
    crowd.on = true;
    w2.sfx('honk', px(STOP.trigger), FL - 20);
    tara(w2, L.win[1], 2.4);
    w2.flags.pat1.crowd = crowd;
    w2.flags.pat1.tempo = tempo;
  });
  w.add(
    new Paint((ctx) => {
      // the bus stop pole and a hand-painted board
      box(ctx, px(STOP.kerb[1] + 2), FL - 40, 2, 40, '#555');
      box(ctx, px(STOP.kerb[1]) - 6, FL - 52, 30, 12, '#2F6BB0');
      box(ctx, px(STOP.kerb[1]) - 4, FL - 50, 26, 2, '#fff');
      box(ctx, px(STOP.kerb[1]) - 4, FL - 46, 14, 2, '#fff');
    }, -6),
  );
}

/** a coaching hoarding that comes down in the road once Dad is near; it lands as a step */
function hoarding(w: World, col: number) {
  const st = { phase: 'up' as 'up' | 'fall' | 'down' };
  w.flags.pat1h = st;
  const h = w.add(
    new Rig(px(col), -40, 32, 28, {
      solid: true,
      layer: 2,
      cause: 'pat-hoarding',
      inset: 3,
      live: () => st.phase === 'fall',
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, r.h, '#D7262E');
        box(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, '#F9E3B0');
        box(ctx, r.x + 5, r.y + 6, r.w - 10, 3, '#D7262E');
        box(ctx, r.x + 5, r.y + 12, r.w - 14, 2, '#3A1E10');
        box(ctx, r.x + 5, r.y + 17, r.w - 18, 2, '#3A1E10');
      },
      tick: (r, w2) => {
        if (st.phase === 'fall') {
          r.s.v = Math.min(500, (r.s.v ?? 0) + 1500 / 120);
          let y = r.y + perTick(r.s.v);
          if (y + r.h >= FL) {
            y = FL - r.h;
            st.phase = 'down';
            r.solid!.collidable = true;
            w2.sfx('thud', r.x + 16, FL);
          }
          r.moveTo(w2, r.x, y);
        }
      },
    }),
  );
  h.solid!.collidable = false;
  onPass(w, px(col - 4), (w2) => {
    st.phase = 'fall';
    w2.sfx('creak', h.x, 40);
  });
}

export const tourLevel = (): LevelDef =>
  tour({
    id: 'PAT-01',
    city: 'PAT',
    name: 'Prannam, Patna!',
    nameEn: 'Hello, Patna!',
    tagline: 'Pataliputra, on the Ganga. Watch the bus stop.',
    lines: [
      L.intro[7 + 1],
      'Litti garam ba, maze se khaa! | Litti’s hot, enjoy it!',
      'Do litti, ek chokha! | Two litti, one chokha!',
      'Eeh ketna ha? | How much is this?',
      'Safar badhiya rahe, Dad! | Have a good journey, Dad!',
      'Chalo, aage! | Let’s go on!',
    ],
    shouts: [
      [18, 'Do litti, ek chokha! | Two litti, one chokha!'],
      [46, 'Eeh ketna ha? | How much is this?'],
    ],
    ride: 'cart',
    item: 'pat-litti',
    signs: [
      [8, 'GANDHI MAIDAN', 'morning walk'],
      [34, 'ASHOK RAJPATH', 'coaching lane'],
      [100, 'GOLGHAR', '1786 granary'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 28, { label: 'LITTI' }],
      ['lamp', 58, {}],
      ['crowd', 84, { n: 2 }],
      ['lamp', 108, {}],
    ],
    things: [],
    hint: 'A walk round Patna: hop the ditch, climb the steps, hop the posts and the parked cart. At the bus stop a tempo pulls in behind you and the crowd rushes at it along the road: climb on to the kerb board and let them go by under you, then run on before the tempo pulls out. Further on a coaching hoarding falls in the road: wait for it to land, then hop it.',
    cps: [20, 36, 50, 59, 90, 101],
    paint: (g: Grid) => {
      g.fill(STOP.kerb[0], STOP.kerb[1], 13, 13, '=');
    },
    extra: (w: World) => {
      bus(w);
      hoarding(w, 104);
    },
  });

export const meta01 = { family: 'crowd-carried-by-vehicle', betrayals: ['sidestep-surge'], ending: 'pat-tour-bus-stop' };
