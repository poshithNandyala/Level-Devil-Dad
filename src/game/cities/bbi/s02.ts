// BBI-02 Hockey: Kalinga-style blue turf. The only way over the sunken drain is the goalkeeper: stand on his
// pads and, when the ball is flicked, he dives at it right across, carrying you. The front pad is where the
// ball arrives; the save rebounds it on to the far side and it rolls on. Ride the back pad, let the rebound
// go, then step off. The act is a penalty corner (cross between the stop and the flick); the door is inside
// a goal net that only opens once a goal goes in.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, since, taraScript } from './common';

export const K = { c0: 7.5, w: 48, travel: px(9), dive: 0.6, down: 2.8, back: 0.9, wait: 0.5, ballFrom: 26, ballV: 190, gap: [11, 18] as [number, number] };
const BALL = 8;

/** the ball: a small white hazard at (x, y) */
function ballArt(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(x + BALL / 2, y + BALL / 2, BALL / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#C8C8C8';
  ctx.fillRect(x + 2, y + 3, 2, 1);
}

/** the turf: blue with white lines, laid over the ground */
function turf(w: World, c0: number, c1: number) {
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 1,
      paint: (ctx) => {
        box(ctx, px(c0), FL, px(c1 - c0 + 1), 3, '#2F6FB5');
        for (let x = px(c0); x < px(c1 + 1); x += 48) box(ctx, x, FL, 2, 3, '#F5F5F5');
      },
    }),
  );
}


/** the keeper and his pads on a bank at x0 (px), the flicker at ballFrom; he dives `travel` px at the flick,
 *  and the save rebounds off the boards (px) back to his front pad */
export function keeperOn(w: World, o: { x0: number; travel: number; boards: number; ballFrom: number; ballY?: number; drop?: boolean; feet?: number }, key: string) {
  const st = { t0: -1, flick: -1, save: -1, bx: 0, by: 0, bvx: 0, bvy: 0, ball: 'none' as 'none' | 'flick' | 'rebound' | 'roll' | 'back' | 'gone', kx: o.x0 };
  (w.flags[key] as unknown) = st;
  const keeper = w.add(
    new Rig(o.x0, FL - 10, K.w, 10, {
      solid: true,
      layer: 3,
      tick: (r, w2) => {
        if (st.t0 < 0 && r.rides(w2)) st.t0 = w2.tick;
        let x = o.x0;
        if (st.t0 >= 0) {
          const t = since(w2, st.t0) - K.wait;
          if (t > 0 && st.flick < 0) st.flick = w2.tick;
          if (t > 0) {
            const a = Math.min(1, t / K.dive);
            const b = t > K.dive + K.down ? Math.min(1, (t - K.dive - K.down) / K.back) : 0;
            x = o.x0 + o.travel * (a - b);
            if (t > K.dive + K.down + K.back) {
              st.t0 = -1;
              st.flick = -1;
              st.ball = 'none';
            }
          }
        }
        r.moveTo(w2, x, FL - 10);
        st.kx = r.x;
      },
      paint: (ctx, r, w2) => {
        const diving = st.t0 >= 0 && since(w2, st.t0) > K.wait;
        // the body: a keeper in a yellow kit, lying flat when he dives; his two pads at each end
        if (diving) {
          box(ctx, r.x + 8, r.y - 4, r.w - 16, 8, '#F4D35E');
          box(ctx, r.x + r.w - 14, r.y - 9, 8, 7, '#B07A4E');
          box(ctx, r.x + r.w - 15, r.y - 11, 10, 4, '#1E2B3A');
        } else {
          folk(ctx, r.x + r.w / 2, r.y, 28, '#F4D35E', { skirt: '#1E2B3A' });
          box(ctx, r.x + r.w / 2 - 6, r.y - 33, 12, 6, '#1E2B3A');
        }
        for (const dx of [0, r.w - 16]) {
          box(ctx, r.x + dx, r.y, 16, 10, '#E9EEF5');
          box(ctx, r.x + dx + 2, r.y + 2, 12, 2, '#2A9D8F');
          box(ctx, r.x + dx + 2, r.y + 6, 12, 2, '#2A9D8F');
        }
      },
    }),
  );
  // the flicker on the far side, and the ball
  const fx = o.ballFrom;
  w.add(
    new Rig(fx, FL - 22, BALL, BALL, {
      cause: 'bbi-ball',
      inset: 1,
      layer: 4,
      live: () => st.ball !== 'none' && st.ball !== 'gone',
      tick: (r, w2) => {
        if (st.flick >= 0 && st.ball === 'none') {
          st.ball = 'flick';
          st.bx = fx;
          st.by = o.ballY ?? FL - 22;
        }
        if (st.ball === 'flick') {
          st.bx -= K.ballV / 120;
          if (st.bx <= keeper.x + keeper.w - 18) {
            st.ball = 'rebound';
            st.save = w2.tick;
            st.bvx = o.drop ? 0 : 220;
            st.bvy = o.drop ? 60 : -200;
            w2.emit('shake', st.bx, st.by, { amount: 2 });
          }
        } else if (st.ball === 'rebound') {
          st.bx += st.bvx / 120;
          st.bvy += 900 / 120;
          st.by += st.bvy / 120;
          if (o.drop && st.by >= FL + 30) st.ball = 'gone';
          else if (!o.drop && st.by >= FL - BALL) {
            st.by = FL - BALL;
            st.ball = 'roll';
          }
        } else if (st.ball === 'roll') {
          // on along the turf to the boards...
          st.bx += 220 / 120;
          if (st.bx >= o.boards - BALL) st.ball = 'back';
        } else if (st.ball === 'back') {
          // ...and back off them, all the way to the keeper's front pad
          st.bx -= 180 / 120;
          if (st.bx <= keeper.x + keeper.w) st.ball = 'gone';
        }
        r.x = st.bx || fx;
        r.y = st.by || FL - 22;
        r.hazard!.cause = st.ball === 'flick' ? 'bbi-ball' : 'bbi-rebound';
      },
      paint: (ctx, r) => {
        if (st.ball !== 'none' && st.ball !== 'gone') ballArt(ctx, r.x, r.y);
      },
    }),
  );
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 3,
      paint: (ctx, _r, w2) => {
        const swung = st.flick >= 0 && since(w2, st.flick) < 0.4;
        folk(ctx, fx + 16, o.feet ?? FL, 26, '#E63946', { skirt: '#F5F5F5', face: -1, arm: swung ? -0.9 : 0.6 });
        ctx.strokeStyle = '#6D4C2F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(fx + 12, (o.feet ?? FL) - 16);
        ctx.lineTo(fx + (swung ? 0 : 6), (o.feet ?? FL) - 2);
        ctx.stroke();
        if (st.ball === 'none') ballArt(ctx, fx, (o.feet ?? FL) - BALL);
      },
    }),
  );
  return { st, keeper };
}

export function room(): LevelDef {
  return {
    id: 'BBI-02',
    city: 'BBI',
    index: 2,
    name: 'Hockey',
    nameEn: 'The drag-flick',
    tagline: 'Odisha lives for hockey. On this turf the keeper is very keen, and very quick to dive.',
    hint: 'The keeper is your way over the drain: stand on his pads and he dives right across at the ball, carrying you. The ball hits whoever is on his front pad, so ride the back one. The save rebounds the ball on to the far side, off the boards and back at him: stay on him until it has come back to his pad, then step off before he gets up.',
    par: 14,
    map: Grid.ground(15).pit(K.gap[0], K.gap[1]).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      turf(w, 0, 31);
      channel(w, K.gap[0], K.gap[1], 'bbi-turf', 'water');
      const { st, keeper } = keeperOn(w, { x0: px(K.c0), travel: K.travel, boards: px(30), ballFrom: px(K.ballFrom) }, 'bbi2');
      sign(w, 21, 10.4, 3.4, 'KALINGA', 'shop', null, 'hockey');
      rival(w, 3, 15, 1, taraScript(2));
      onPass(w, px(8.5) + 24, (w2) => {
        if (w2.player.cx > keeper.x + keeper.w - 16) tara(w2, 'Bahut bhala! | Very good!', 1.6);
      });
      collectible(w, 'bbi-chhenapoda', 14, 11.4);
    },
  };
}

/** act: a penalty corner. The injector pushes the ball in along the turf, the stopper stops it dead, and the
 *  flicker drag-flicks it back to the goal at chest height. Cross the stopper's spot while the ball sits still. */
export const CORNER0 = { period: 5.0, push: 1.1, stop: 2.3, inj: 31, stopAt: 20, goal: 2, pushV: 160, flickV: 300 };
export function cornerAct(id: string, w0: number, CORNER: typeof CORNER0 & { dummy?: boolean }, key: string, advice: string): Act {
  return {
  id,
  w: w0,
  advice,
  cps: [],
  paint: () => {},
  build: (w, c) => {
    turf(w, c.x, c.x + w0 - 1);
    const st = { t0: -1, k: 0, x: c.X(CORNER.inj), y: FL - BALL, phase: 'wait' as 'wait' | 'push' | 'stop' | 'flick' | 'dummy' };
    (w.flags[key] as unknown) = st;
    onPass(w, c.X(1), (w2) => (st.t0 = w2.tick));
    const sx = c.X(CORNER.stopAt);
    w.add(
      new Rig(st.x, st.y, BALL, BALL, {
        cause: 'bbi-ball',
        inset: 1,
        layer: 4,
        live: () => st.t0 >= 0,
        tick: (r, w2) => {
          if (st.t0 < 0) return;
          const t = since(w2, st.t0) % CORNER.period;
          const k = Math.floor(since(w2, st.t0) / CORNER.period);
          st.k = k;
          if ((CORNER as { dummy?: boolean }).dummy && k % 2 === 0) {
            // the dummy: the stopper lets it run, and it rolls on along the turf to the goal behind you
            st.phase = 'dummy';
            st.x = c.X(CORNER.inj) - (c.X(CORNER.inj) - sx) * (t / CORNER.push);
            st.y = FL - BALL;
            if (st.x < c.X(CORNER.goal)) st.x = -999;
          } else if (t < CORNER.push) {
            st.phase = 'push';
            st.x = c.X(CORNER.inj) - (c.X(CORNER.inj) - sx) * (t / CORNER.push);
            st.y = FL - BALL;
          } else if (t < CORNER.push + CORNER.stop) {
            st.phase = 'stop';
            st.x = sx;
            st.y = FL - BALL;
          } else {
            st.phase = 'flick';
            st.x = sx - CORNER.flickV * (t - CORNER.push - CORNER.stop);
            st.y = FL - 20;
            if (st.x < c.X(CORNER.goal)) st.x = -999;
          }
          r.x = st.x;
          r.y = st.y;
        },
        paint: (ctx, r) => {
          if (st.t0 >= 0 && r.x > 0) ballArt(ctx, r.x, r.y);
        },
      }),
    );
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 3,
        paint: (ctx) => {
          // the goal net behind you, the stopper crouched at the top of the circle, the injector on the line
          box(ctx, c.X(CORNER.goal) - 6, FL - 40, 4, 40, '#F5F5F5');
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 1;
          for (let y = FL - 38; y < FL; y += 6) {
            ctx.beginPath();
            ctx.moveTo(c.X(CORNER.goal) - 26, y);
            ctx.lineTo(c.X(CORNER.goal) - 6, y);
            ctx.stroke();
          }
          folk(ctx, sx + 14, FL, 24, '#2A9D8F', { skirt: '#F5F5F5', face: -1, arm: 1.1 });
          folk(ctx, sx + 30, FL, 26, '#2A9D8F', { skirt: '#F5F5F5', face: -1, arm: 0.5 });
          folk(ctx, c.X(CORNER.inj) + 18, FL, 26, '#2A9D8F', { skirt: '#F5F5F5', face: -1, arm: 0.8 });
          box(ctx, sx - 32, FL, 2, 3, '#F5F5F5');
        },
      }),
    );
    sign(w, c.x + 24, 10.4, 3.6, 'SHORT CORNER', 'shop', null, 'D');
  },
};
}
export const act = cornerAct('bbi02-corner', 36, CORNER0, 'bbi2c', 'A penalty corner: the injector pushes the ball in, the stopper stops it dead, and then it is drag-flicked back the way you came, at chest height. Never wait on the goal side for the flick: cross the stopper’s spot, hopping the still ball, while it sits there.');
export const CORNER3 = { period: 4.0, push: 1.2, stop: 1.8, inj: 25, stopAt: 14, goal: 2, pushV: 160, flickV: 300, dummy: true };
export const act4 = cornerAct('bbi02-chhal', 30, CORNER3, 'bbi2h', 'A dummy: on the first corner the stopper lets the ball run, and it rolls on along the turf at you. Hop it, then wait for the next corner, where he stops it, and go over the still ball.');

/** act 2: a second keeper by a second drain, the flicker further off: the same ride, longer */
export const act2: Act = {
  id: 'bbi02-dive',
  w: 30,
  advice: 'Another keeper by another drain. Same as before: his back pad, the dive, the rebound off the boards and back, then step off before he gets up.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 13);
  },
  build: (w, c) => {
    turf(w, c.x, c.x + 29);
    channel(w, c.x + 6, c.x + 13, 'bbi-turf', 'water');
    keeperOn(w, { x0: c.X(2.5), travel: px(9), boards: c.X(22), ballFrom: c.X(21) }, 'bbi2b');
    sign(w, c.x + 17, 10.4, 3.4, 'ASTRO TURF', 'shop', null, 'D');
  },
};

/** ending: the groundsmen roll the turf up from the door end once you step on it; the roll comes back along the floor at you */
export const ROLL = { at: 10, bench: 6, delay: 0.5, v: 150, end: 16, size: 22 };
export const ending: Ending = {
  space: 15,
  advice: 'Match over: the groundsmen roll the turf up from the door end, and the roll comes along the floor at you. Get up on the bench and let it pass under, or hop it. Then walk to the door.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-turf-roll';
    turf(w, D - 15, D + 3);
    const st = { t0: -1, x: px(D - 1), passed: false };
    w.flags.bbi2e = st;
    onPass(w, px(D - ROLL.at), (w2) => { if (st.t0 < 0) st.t0 = w2.tick; });
    w.add(
      new Rig(px(D - ROLL.bench), FL - 30, 32, 30, {
        solid: true,
        layer: 2,
        paint: (ctx, r) => {
          box(ctx, r.x, r.y, r.w, 5, '#2F6FB5');
          box(ctx, r.x + 2, r.y + 5, 4, r.h - 5, '#1E2B3A');
          box(ctx, r.x + r.w - 6, r.y + 5, 4, r.h - 5, '#1E2B3A');
        },
      }),
    );
    w.add(
      new Rig(st.x, FL - ROLL.size, ROLL.size, ROLL.size, {
        cause: 'bbi-roll',
        inset: 2,
        layer: 4,
        live: () => st.t0 >= 0 && !st.passed,
        tick: (r, w2) => {
          if (st.t0 < 0 || st.passed) return;
          if (since(w2, st.t0) >= ROLL.delay) st.x -= ROLL.v / 120;
          if (st.x <= px(D - ROLL.end)) st.passed = true;
          r.x = st.x;
        },
        paint: (ctx, r, w2) => {
          if (st.t0 < 0 || st.passed) return;
          // the rolled-up turf, and the bare floor it leaves behind
          box(ctx, r.x + r.w, FL - 2, px(D - 1) - r.x - r.w, 2, '#8A7F6A');
          ctx.fillStyle = '#2E8B57';
          ctx.beginPath();
          ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1F5E3B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(r.x + r.w / 2, r.y + r.h / 2, r.w / 4, (w2.tick / 10) % 6, ((w2.tick / 10) % 6) + 4);
          ctx.stroke();
        },
      }),
    );
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 3,
        paint: (ctx, _r, w2) => {
          const push = st.t0 >= 0 && !st.passed && since(w2, st.t0) >= ROLL.delay;
          if (!push) {
            folk(ctx, px(D) + 4, FL, 26, '#6B8E23', { skirt: '#F5F5F5', face: -1, arm: 0.4 });
            folk(ctx, px(D) + 18, FL, 24, '#6B8E23', { skirt: '#F5F5F5', face: -1, arm: 0.6 });
          }
        },
      }),
    );
  },
};

export const meta02 = { family: 'keeper-pads-carry-you', betrayals: ['carried-by-actor'], ending: 'bbi-turf-roll' };
