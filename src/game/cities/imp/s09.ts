// IMP-09 Chukker (tough): sagol kangjei on the Imphal polo ground. Dad rides a Manipuri pony that plays the whole
// match: a gallop spends its breath (the bar over his head), standing still rests it, and the dark soft ground
// costs three times the breath. A pony with no breath left stands, and the ball rolling up the ground from behind
// takes whoever is standing. Between chukkers a trough fills the bar; the last chukker has no trough. Budget the
// breath: gallop the firm ground, rest just after a ball has gone by, never rest on the soft, and reach the last
// chukker full.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

/** the ball is faster than the pony: it passes a galloper harmlessly and takes whoever is standing */
export const PONY = { max: 10, firm: 1.4, soft: 4.0, rest: 3.0, winded: 3.5, ball: 220, every: 4.5, ballFrom: 520 };

export interface PonyState {
  breath: number;
  /** tick the pony stopped winded, -1 when running */
  winded: number;
  soft: [number, number][];
  /** balls in play */
  balls: Rig[];
  nextBall: number;
  on: boolean;
  troughs: number[];
  /** sideline columns (the chukker starts and the half-way marks): the ball is never hit at a man standing there */
  safe: number[];
}

/** installs the pony on the whole stage (called once by the room); soft patches and troughs are added by the acts */
export function pony(w: World) {
  const st: PonyState = { breath: PONY.max, winded: -1, soft: [], balls: [], nextBall: 0, on: false, troughs: [], safe: [0.5] };
  w.flags.imp9 = st;
  w.onTick((w2) => {
    const p = w2.player;
    if (!st.on) return;
    const cx = p.x + p.w / 2;
    const onSoft = st.soft.some(([a, b]) => cx >= px(a) && cx < px(b));
    const galloping = Math.abs(p.vx) > 20 && p.onGround && st.winded < 0;
    if (st.winded >= 0) {
      if (since(w2, st.winded) >= PONY.winded) {
        st.winded = -1;
        st.breath = 3;
      }
    } else if (galloping) st.breath -= (onSoft ? PONY.soft : PONY.firm) / 120;
    else if (p.onGround) st.breath = Math.min(PONY.max, st.breath + PONY.rest / 120);
    if (st.breath <= 0 && st.winded < 0) {
      st.winded = w2.tick;
      st.breath = 0;
      w2.sfx('thud', cx, p.y);
    }
    // a winded pony stands
    p.speedMul = st.winded >= 0 ? 0 : 1;
    p.noJump = st.winded >= 0;
    // troughs: passing one fills the bar
    for (const t of st.troughs) if (Math.abs(cx - px(t)) < 6) st.breath = PONY.max;
    // the ball: one at a time; the next is hit up the ground once the last has rolled well past
    st.balls = st.balls.filter((b) => b.alive);
    if (st.balls.every((b) => b.x > cx + 200) && w2.tick >= st.nextBall) {
      st.nextBall = w2.tick + 30;
      const b = w2.add(
        new Rig(cx - PONY.ballFrom, FL - 10, 10, 10, {
          layer: 3,
          cause: 'imp-kangjei',
          inset: 1,
          // a galloping pony is not a target: the ball rolls past; a standing or winded one is
          live: (_r, w3) => {
            const p = w3.player;
            // on the sideline (a chukker's start or its half-way mark) nobody hits a ball at a standing man
            const cx = p.x + p.w / 2;
            if (st.safe.some((t) => cx >= t * 16 - 16 && cx <= t * 16 + 80)) return false;
            return Math.abs(p.vx) < 30 || st.winded >= 0;
          },
          tick: (r, w3) => {
            r.x += perTick(PONY.ball);
            r.hazard!.cause = st.winded >= 0 ? 'imp-kangjei-wa' : 'imp-kangjei';
            if (r.x > w3.player.x + 600) r.alive = false;
          },
          paint: (ctx, r, w3) => {
            ctx.fillStyle = '#EDE6D0';
            ctx.beginPath();
            ctx.arc(r.x + 5, r.y + 5, 5, 0, Math.PI * 2);
            ctx.fill();
            box(ctx, r.x + 3 + ((w3.tick >> 2) % 4), r.y + 4, 2, 2, '#8A6A3A');
          },
        }),
      );
      st.balls.push(b);
    }
  });
  // the breath bar over Dad, the soft ground, the troughs
  w.add(
    new Paint((ctx, w2) => {
      const p = w2.player;
      for (const [a, b] of st.soft) {
        box(ctx, px(a), FL - 2, px(b - a), 4, '#3E3524');
        for (let x = px(a) + 3; x < px(b) - 3; x += 9) box(ctx, x, FL - 4, 4, 2, '#5E5236');
      }
      for (const t of st.troughs) {
        box(ctx, px(t) - 10, FL - 12, 20, 12, '#6E4B2A');
        box(ctx, px(t) - 8, FL - 10, 16, 4, '#5AA0B0');
      }
      if (!st.on) return;
      const k = Math.max(0, st.breath / PONY.max);
      box(ctx, p.x - 6, p.y - 10, 22, 4, '#2E2A1E');
      box(ctx, p.x - 5, p.y - 9, 20 * k, 2, k > 0.3 ? '#8FBF4A' : '#D7262E');
      if (st.winded >= 0) box(ctx, p.x + 2, p.y - 16, 6, 4, '#FFF');
    }, 4),
  );
  return st;
}

export function room(): LevelDef {
  return {
    id: 'IMP-09',
    city: 'IMP',
    index: 9,
    name: 'Chukker',
    nameEn: 'The pony plays on',
    tagline: 'Sagol kangjei. The pony plays the whole match. Mind its breath.',
    hint: 'The bar over your head is the pony’s breath: a gallop spends it, standing still rests it, and the dark soft ground spends it three times as fast. With no breath the pony stands, and the ball rolling up from behind takes whoever stands. Gallop the firm ground; rest right after a ball has passed; cross the soft ground without stopping on it. The trough at the end of each chukker fills the bar.',
    par: 50,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const st = pony(w);
      st.soft.push([12, 17]);
      st.troughs.push(28);
      onPass(w, px(4), (w2) => {
        st.on = true;
        st.nextBall = w2.tick + 120;
      });
      onPass(w, px(2), (w2) => tara(w2, L.intro[7], 2.2));
      sign(w, 1.5, 10.4, 4.2, 'POLO GROUND', 'green', null, 'first chukker');
      rival(w, 30.5, 15, -1, taraScript(9));
      collectible(w, 'imp-singju', 21, 11.6);
    },
  };
}

const chukker = (id: string, n: number, soft: [number, number][], trough: boolean, advice: string): Act => ({
  id,
  w: 40,
  advice,
  cps: [20],
  build: (w, c) => {
    const st = w.flags.imp9 as PonyState;
    for (const [a, b] of soft) st.soft.push([c.x + a, c.x + b]);
    if (trough) st.troughs.push(c.x + 37);
    // the sidelines: the act's start checkpoint (two columns before the content, levels.ts LEAD) and the half-way mark
    st.safe.push(c.x - 1.5, c.x + 20);
    if (!trough) st.safe.push(c.x + 39.5); // the last chukker: the door's checkpoint (doorX - 9.5) too
    sign(w, c.x + 1.5, 10.4, 3.4, `CHUKKER ${n}`, 'green', null, trough ? 'trough at the end' : 'no trough');
  },
});

export const acts = [
  chukker('imp09-ani', 2, [[8, 14], [22, 30]], true, 'Second chukker: two soft stretches. Cross each at a gallop with the bar above a third, and rest only on firm ground right after a ball has gone by.'),
  chukker('imp09-ahum', 3, [[6, 16], [20, 24], [30, 34]], true, 'Third chukker: a long soft stretch first. Fill up at the trough, gallop it, rest after the ball, finish.'),
  chukker('imp09-mari', 4, [[8, 14], [26, 34]], false, 'The last chukker has no trough: there is nothing to fill the bar. Rest to full right after a ball passes before you start it, and spend it on the two soft stretches only.'),
];
export const meta09 = { family: 'steed-stamina-gallop-walk', betrayals: ['stamina'], ending: 'imp-marjing-door-plain' };
