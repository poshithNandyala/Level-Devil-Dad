// BBI-01 Namaskara Bhubaneswar: the welcome walk down a wide planned road. The median is a row of potted
// plants, and the gardener waters them from a hose. When he turns to the road, his jet follows the dad who
// waits, and the one tile it wets slides you into the open storm drain. Pass while he faces his pots. Further
// on, a second gardener has his back to you, but he left one wet tile at the lip of the next drain.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import { tara } from '../../levels/endkit';
import { onPass } from '../../levels/trolls';
import { px } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, channel, cyc, decor } from './common';

/** gardener 1: watering the pots for POTS s, then the road for ROAD s, on a loop from the start */
export const G1 = { col: 24, potsFor: 2.4, roadFor: 2.4, aim0: 27, drain: [30, 30] as [number, number], reach: 8 };
export const G2 = { col: 66, wet: 72, drain: [73, 73] as [number, number] };
export const SLIDE = { v: 180, ticks: 96 };

/** is gardener 1 facing the road right now? */
export const g1Road = (w: World) => cyc(w, G1.potsFor + G1.roadFor) >= G1.potsFor;

/** a sliding dad goes straight into any drain he slides over (he can't hop while sliding) */
function intoDrain(w: World) {
  const p = w.player;
  if (!(p.stun > 0) || !w.flags.bbi1sliding) return;
  const c = Math.floor(p.cx / 16);
  if (c === G1.drain[0] || c === G2.drain[0]) w.die('bbi-nala');
  if (p.stun <= 1) w.flags.bbi1sliding = false;
}

function slide(w: World) {
  const p = w.player;
  if (!p.onGround || p.stun > 0) return;
  const dir = p.vx < -1 ? -1 : 1;
  p.stun = SLIDE.ticks;
  p.vx = dir * SLIDE.v;
  w.flags.bbi1slid = (w.flags.bbi1slid ?? 0) + 1;
  w.flags.bbi1sliding = true;
}

/** potted plants along the median, drawn behind the road */
function pots(ctx: CanvasRenderingContext2D, c0: number, n: number) {
  for (let i = 0; i < n; i++) {
    const x = px(c0) + i * 22;
    box(ctx, x, FL - 12, 12, 12, '#B5562E');
    box(ctx, x - 1, FL - 13, 14, 3, '#C9693D');
    ctx.fillStyle = i % 2 ? '#3F8F3A' : '#5DA34A';
    ctx.beginPath();
    ctx.ellipse(x + 6, FL - 18, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    if (i % 3 === 0) {
      ctx.fillStyle = '#F4D35E';
      ctx.fillRect(x + 3, FL - 22, 2, 2);
      ctx.fillRect(x + 8, FL - 19, 2, 2);
    }
  }
}

function extra(w: World) {
  for (const [c0, c1] of [G1.drain, G2.drain]) channel(w, c0, c1, 'bbi-nala');
  decor(w, -6, (ctx) => {
    pots(ctx, 17, 5);
    pots(ctx, 60, 4);
  });
  // gardener 1: the jet's aim (world x of the wet tile's centre), following Dad while he faces the road
  const st = { aim: px(G1.aim0) + 8, road: false };
  w.flags.bbi1 = st;
  w.add(
    new Rig(px(G1.col), FL - 30, 12, 30, {
      layer: 3,
      tick: (_r, w2) => {
        const road = g1Road(w2);
        if (road && !st.road) st.aim = px(G1.aim0) + 8;
        st.road = road;
        const p = w2.player;
        if (road && Math.abs(p.cx - px(G1.col)) < px(G1.reach) && p.cx < px(G1.drain[0])) {
          const d = p.cx - st.aim;
          st.aim += Math.sign(d) * Math.min(Math.abs(d), 90 / 120);
        }
        // the wet tile is the one under the jet: step on it while he aims and you slide
        const tile = Math.floor(st.aim / 16);
        if (road && Math.floor(p.cx / 16) === tile && p.cx < px(G1.drain[0])) slide(w2);
        intoDrain(w2);
      },
      paint: (ctx, r, w2) => {
        const road = g1Road(w2);
        const gx = r.x + 6;
        folk(ctx, gx, FL, 26, '#2A9D8F', { skirt: '#E9E1CF', face: road ? 1 : -1, arm: road ? 0.15 : -0.2, cloth: '#F4D35E' });
        // the hose: a green line back to the tap on the median, and the jet
        ctx.strokeStyle = '#2E7D32';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx, FL - 16);
        ctx.quadraticCurveTo(gx - 20, FL - 2, px(17), FL - 2);
        ctx.stroke();
        const tx = road ? st.aim : px(G1.col) - 30;
        ctx.strokeStyle = 'rgba(160,215,240,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(gx + (road ? 8 : -8), FL - 18);
        ctx.quadraticCurveTo((gx + tx) / 2, FL - 44, tx, road ? FL - 1 : FL - 22);
        ctx.stroke();
        if (road) {
          const t0 = Math.floor(st.aim / 16) * 16;
          box(ctx, t0, FL - 2, 16, 2, 'rgba(150,210,240,0.95)');
          box(ctx, t0 + 3, FL - 3, 10, 1, 'rgba(255,255,255,0.9)');
        }
      },
    }),
  );
  // gardener 2: back to the road, watering pots; the tile at the drain's lip is still wet from him
  w.add(
    new Rig(px(G2.wet), FL - 4, 16, 4, {
      layer: 3,
      tick: (_r, w2) => {
        const p = w2.player;
        if (Math.floor(p.cx / 16) === G2.wet && p.y + p.h >= FL - 1) slide(w2);
      },
      paint: (ctx, r) => {
        folk(ctx, px(G2.col) + 6, FL, 26, '#E63946', { skirt: '#E9E1CF', face: -1, arm: -0.2, cloth: '#2A9D8F' });
        ctx.strokeStyle = 'rgba(160,215,240,0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px(G2.col) - 2, FL - 18);
        ctx.quadraticCurveTo(px(G2.col) - 16, FL - 36, px(G2.col) - 26, FL - 22);
        ctx.stroke();
        box(ctx, r.x, FL - 2, 16, 2, 'rgba(150,210,240,0.95)');
        box(ctx, r.x + 3, FL - 3, 10, 1, 'rgba(255,255,255,0.9)');
        box(ctx, r.x + 9, FL - 6, 2, 2, 'rgba(150,210,240,0.8)');
      },
    }),
  );
  // Tara's lie at the first gardener: stop and watch him (the waiting dad is the one he follows)
  onPass(w, px(17), (w2) => tara(w2, 'Ruha! | Stop!', 2));
  onPass(w, px(35), (w2) => w2.guide('Bahut bhala! | Very good!', (w3) => w3.player.cx > px(33)));
}

export const tourLevel = (): LevelDef =>
  tour({
    id: 'BBI-01',
    city: 'BBI',
    name: 'Namaskara Bhubaneswar',
    nameEn: 'Down the wide road',
    tagline: 'A planned capital: wide roads, long medians full of pots, and a gardener with a hose who takes his job seriously.',
    lines: [
      'Namaskara, Dad! | Hello, Dad!',
      'Ethare garam hue! | It’s hot here!',
      'Chala bajar jiba! | Let’s go to the market!',
      'Eita kete tanka? | How much is this?',
      'Chala ame mishiki khaiba! | Let’s eat together!',
      'Subha jatra, Dad! | Good journey, Dad!',
    ],
    shouts: [[50, 'Dhanyabad! | Thank you!']],
    ride: 'cart',
    item: 'bbi-dahibara',
    signs: [
      [6, 'EKAMRA HAAT', 'crafts'],
      [44, 'KHANDAGIRI', 'caves'],
      [86, 'KALINGA', 'stadium'],
      [104, 'BHUBANESWAR', 'welcome'],
    ],
    props: [],
    par: 22,
    cps: [8, 33.5, 52, 77, 90],
    paint: (g) => {
      g.pit(G1.drain[0], G1.drain[1]).pit(G2.drain[0], G2.drain[1]);
    },
    hint: 'The gardener on the median turns his hose on the road, and his jet follows a dad who stands and waits: the tile it wets slides you straight into the open drain. Go while he faces his pots, and hop the drain. The second gardener has his back to you, but the tile at the lip of the next drain is still wet: jump from the tile before it. Then the steps, the posts and what’s parked.',
    extra,
  });

export const meta01 = { family: 'aimed-hose-slick-follows-waiter', betrayals: ['aimed-slide'], ending: 'bbi-wet-lip-drain' };
