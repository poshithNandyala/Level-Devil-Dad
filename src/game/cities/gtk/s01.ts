// GTK-01 Namaste Gangtok: the welcome tour, with a bite. MG Marg is swept all day: the sweeper strokes his broom
// along the paving in an arc, and it takes everything lying on the ground with it into his cart. Dad included.
// The broom only moves things on the ground: up on a bench (or in the air) it goes under you. The first sweeper
// has a bench by him; the second has none, so you go through behind his stroke, while the broom is in the air.
import type { LevelDef, World } from '../../world';
import { tour } from '../../levels/tour';
import { onPass } from '../../levels/trolls';
import { npc, tara } from '../../levels/endkit';
import { FL, Rig, box, local, px } from './entities';
import { lines as L } from './lines';

/** one stroke: the broom lands at the right end, sweeps left on the paving, lifts and comes back in the air */
export const STROKE = { reach: 32, sweep: 0.7, back: 2.4 };
export const SWEEP_PERIOD = STROKE.sweep + STROKE.back;
/** the two sweepers (tile columns of the man), the bench beside the first */
export const SWEEPERS: { c: number; bench: 'free' | 'reserved' | null }[] = [
  { c: 36, bench: 'free' },
  { c: 56, bench: 'reserved' },
  { c: 86, bench: null },
  { c: 104, bench: null },
];

export interface Sweep {
  t0: number;
  sx: number;
  /** the broom head's x now, and whether it is on the paving */
  bx: number;
  down: boolean;
}

/** the broom at time t into the stroke cycle (before t0: resting at the cart) */
export function broomAt(st: Sweep, t: number): { bx: number; down: boolean; lift: number } {
  const { reach, sweep, back } = STROKE;
  if (st.t0 < 0) return { bx: st.sx - reach, down: false, lift: 1 };
  const u = ((t % SWEEP_PERIOD) + SWEEP_PERIOD) % SWEEP_PERIOD;
  if (u < sweep) {
    const k = u / sweep;
    return { bx: st.sx + reach - 2 * reach * k, down: true, lift: 0 };
  }
  const k = (u - sweep) / back;
  return { bx: st.sx - reach + 2 * reach * k, down: false, lift: Math.sin(k * Math.PI) };
}

/** a sweeper with his broom and cart at column c; the stroke clock starts when Dad comes within `lead` tiles */
export function sweeper(w: World, c: number, lead = 7, key = 'gtk1', always = false): Sweep {
  const sx = px(c) + 8;
  const st: Sweep = { t0: always ? Math.round(c * 7) : -1, sx, bx: sx - STROKE.reach, down: false };
  (w.flags[key] ??= []).push(st);
  // the clock: timed so that the first stroke meets someone who walks straight on (or, `always`, just sweeping away)
  if (!always)
    onPass(w, sx - px(lead), (w2) => {
      st.t0 = w2.tick - Math.round(0.08 * 120);
    });
  w.add(
    new Rig(0, FL - 10, 12, 10, {
      layer: 4,
      cause: 'gtk-jhadu',
      inset: 0,
      // only on the paving: an airborne Dad, or one up on a bench, isn't on the ground the broom sweeps
      live: (_r, w2) => st.down && w2.player.onGround && w2.player.y + w2.player.h >= FL - 1,
      tick: (r, w2) => {
        const b = broomAt(st, st.t0 < 0 ? 0 : (w2.tick - st.t0) / 120);
        st.bx = b.bx;
        st.down = b.down;
        r.x = b.bx - 6;
        r.s.lift = b.lift;
        const asked = w2.flags.gtkAsked as number | undefined;
        if (r.hazard) r.hazard.cause = asked !== undefined && w2.tick - asked < 480 ? 'gtk-aarakshit' : 'gtk-jhadu';
      },
      paint: (ctx, r, w2) => {
        const lift = r.s.lift ?? 0;
        const hx = st.bx,
          hy = FL - 2 - lift * 18;
        // the leaves on the paving, pushed along in front of the broom while it sweeps
        for (let i = 0; i < 7; i++) {
          const lx = st.down ? Math.min(hx - 3 - i * 3, sx + STROKE.reach) : sx - STROKE.reach - 8 + ((i * 5) % 9);
          box(ctx, lx, FL - 2 - (i % 2), 3, 2, i % 3 ? '#B5893A' : '#7E9F4E');
        }
        // the sweeper: orange jacket, cap, the long broom from his hands to the head
        const mx = sx + 10;
        local(ctx, mx, FL - 26, 26, '#E8772E', { cap: '#2F4858', scarf: '#F4D35E' });
        ctx.strokeStyle = '#8A6A3E';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(mx - 3, FL - 17);
        ctx.lineTo(hx + 4, hy - 2);
        ctx.stroke();
        // the broom head: a fan of grass bristles
        ctx.fillStyle = '#C9A55A';
        ctx.beginPath();
        ctx.moveTo(hx + 3, hy - 4);
        ctx.lineTo(hx - 7, hy + 2);
        ctx.lineTo(hx + 5, hy + 2);
        ctx.closePath();
        ctx.fill();
        void w2;
      },
    }),
  );
  // the cart he sweeps into, behind the start of his stroke
  w.add(
    new Rig(sx - STROKE.reach - 30, FL - 16, 18, 16, {
      layer: -2,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y + 2, 18, 11, '#2E7D5B');
        box(ctx, r.x, r.y + 2, 18, 2, '#1E5A40');
        ctx.fillStyle = '#26323A';
        ctx.beginPath();
        ctx.arc(r.x + 4, FL - 2, 2.4, 0, Math.PI * 2);
        ctx.arc(r.x + 14, FL - 2, 2.4, 0, Math.PI * 2);
        ctx.fill();
      },
    }),
  );
  return st;
}

/** an MG Marg bench: wooden slats on iron legs, a step up you can stand on */
export function bench(w: World, x: number, wd = 40) {
  return w.add(
    new Rig(x, FL - 14, wd, 14, {
      solid: true,
      oneWay: true,
      layer: 3,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, 3, '#8A5A2B');
        box(ctx, r.x, r.y + 4, r.w, 2, '#6B4420');
        box(ctx, r.x + 3, r.y + 6, 2, 8, '#2F3A40');
        box(ctx, r.x + r.w - 5, r.y + 6, 2, 8, '#2F3A40');
      },
    }),
  );
}

/** an MG Marg bench, with or without a RESERVED card; a reserved one turns you off it */
export function reserved(w: World, x: number, card: boolean) {
  const b = bench(w, x, 32);
  const st = { on: 0, off: 0 };
  w.add(
    new Rig(x, FL - 30, 32, 16, {
      layer: 3,
      tick: (_r, w2) => {
        if (st.off > 0) {
          st.off--;
          if (st.off === 0) b.setSolid(true);
          return;
        }
        if (card && b.carries(w2)) {
          st.on++;
          if (st.on > 24) {
            st.on = 0;
            st.off = 90;
            b.setSolid(false);
            // a broom that takes Dad in the next 4 s (one stroke and more) took him because the owner asked him down: its own cause
            w2.flags.gtkAsked = w2.tick;
            npc(w2, 'Maphi paun. | Excuse me.', x + 16, FL - 40, 1.2);
          }
        } else st.on = 0;
      },
      paint: (ctx, r) => {
        if (!card) return;
        box(ctx, r.x + 8, r.y + 4, 16, 8, '#F4F1EA');
        box(ctx, r.x + 8, r.y + 4, 16, 2, '#C0392B');
      },
    }),
  );
  return b;
}

export function tourLevel(): LevelDef {
  return tour({
    id: 'GTK-01',
    city: 'GTK',
    name: 'Namaste Gangtok',
    nameEn: 'Hello, Gangtok',
    tagline: 'MG Marg is the evening living room of Gangtok, and it is swept all day long. Very thoroughly.',
    hint: 'Up the stairs, across on the little shuttle, over the kerb posts, across on the ropeway shuttle, over the parked jeep. On MG Marg the sweepers stroke their brooms along the paving and sweep everything on the ground into the cart, you too: the broom only takes what’s on the ground. At the first one, hop up on the bench while he strokes. The second bench has a RESERVED card: its owner asks you off it, in front of the broom. There, and at the last two, wait outside the stroke and walk through right behind it while the broom is in the air.',
    lines: [
      'Namaste! Kasto chha? Swagatam, Dad! | Hello! How are you? Welcome, Dad!',
      'Gangtok: every house on the ground floor! | Gangtok: every house on the ground floor!',
      'MG Marg: no litter, no smoking! | MG Marg: no litter, no smoking!',
      'Momo, thukpa, sel roti! Ramrari khanuhola! | Momo, thukpa, sel roti! Enjoy your meal!',
      'Kanchenjunga, on a clear morning! | Kanchenjunga, on a clear morning!',
      'Dhanyabad, Dad! Now the real stages! | Thank you, Dad! Now the real stages!',
    ],
    shouts: [
      [20, 'Maphi paun! | Excuse me!'],
      [80, 'Yasko kati ho? | How much is this?'],
    ],
    ride: 'jeep',
    item: 'gtk-momo',
    signs: [
      [4, 'GANGTOK', 'swagatam'],
      [30, 'MG MARG', 'no vehicles'],
      [96, 'LAL MARKET', '200 m'],
    ],
    props: [
      ['lamp', 22, {}],
      ['lamp', 47, {}],
      ['stall', 83, { label: 'MOMO' }],
      ['lamp', 100, {}],
      ['crowd', 116, { n: 3 }],
    ],
    things: [],
    par: 40,
    cps: [30.5, 47.5, 74.5, 94.5],
    extra(w: World) {
      for (const [i, s] of SWEEPERS.entries()) {
        sweeper(w, s.c, 7, 'gtk1', i > 0);
        if (s.bench === 'free') bench(w, px(s.c) - 8, 40);
        if (s.bench === 'reserved') reserved(w, px(s.c) - 8, true);
      }
      // Tara, at the second sweeper: "just walk on" (it's his stroke she wants you in)
      onPass(w, px(78), (w2) => tara(w2, 'Hajur! Just walk past him, Dad! | Yes! Just walk past him, Dad!', 2.2));
      void L;
    },
  });
}

export const meta01 = { family: 'sweeper-sweeps-ground-things', betrayals: ['sweep-arc'], ending: 'gtk-tour-plain-door' };
