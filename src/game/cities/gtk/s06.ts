// GTK-06 Seedhi (the shortcut stairs). Gangtok's roads loop back and forth across the hillside, and footpath
// stairs cut straight between the loops. The stair down looks like the short cut, and it is: to the loop below,
// into the taxi stand. Take the stair up to the loop above and walk down the road. Then the rule flips: the
// stair up ends on someone's doorstep over the gully, and the way across is the stair down on to a roof garden.
// Tara says so, and for once she's telling the truth.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, cyc, decor, local, perTick, px } from './entities';
import { taraScript } from './common';

/** the taxi stand at the foot of the shortcut: taxis back out across the stair's foot, one after another */
export const STAND = { period: 2.4, out: 1.0 };

function taxiArt(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  box(ctx, x, y + 9, w, h - 14, '#F4F6F6');
  box(ctx, x + 6, y, w - 14, 11, '#F4F6F6');
  box(ctx, x + 8, y + 2, w - 18, 6, '#9FC3D9');
  box(ctx, x, y + 15, w, 2, '#2E86AB');
  ctx.fillStyle = '#26323A';
  ctx.beginPath();
  ctx.arc(x + 9, y + h - 4, 4, 0, Math.PI * 2);
  ctx.arc(x + w - 9, y + h - 4, 4, 0, Math.PI * 2);
  ctx.fill();
}

/** one taxi backing out of its slot at [x0] to x1 and pulling back in, on a clock that starts at `startX` */
export function standTaxi(w: World, x0: number, x1: number, floor: number, startX: number, key: string, cfg = STAND as { period: number; out: number }) {
  const cause = 'gtk-taxi';
  const st = { t0: -1 };
  w.flags[key] = st;
  onPass(w, startX, (w2) => {
    st.t0 = w2.tick;
  });
  return w.add(
    new Rig(x0, floor - 24, 44, 24, {
      layer: 3,
      cause,
      inset: 3,
      live: (r) => st.t0 >= 0 && (r.s.k ?? 0) > 0.03,
      tick: (r, w2) => {
        if (st.t0 < 0) return;
        const u = cyc(w2, st.t0 + Math.round(((cfg as { delay?: number }).delay ?? 0) * 120), cfg.period);
        const k = u < cfg.out ? u / cfg.out : u < cfg.out * 2 ? 1 - (u - cfg.out) / cfg.out : 0;
        r.s.k = k;
        r.x = x0 + (x1 - x0) * Math.sin((k * Math.PI) / 2);
      },
      paint: (ctx, r) => taxiArt(ctx, r.x, r.y, r.w, r.h),
    }),
  );
}

/** a footpath stair drawn over one-way steps (the tiles are '=') */
const stairArt = (w: World, steps: [number, number][]) =>
  decor(w, -1, (ctx) => {
    for (const [c, r] of steps) {
      box(ctx, px(c), px(r), px(4), 4, '#8C8678');
      box(ctx, px(c), px(r) + 4, px(4), 3, '#B9B3A5');
      box(ctx, px(c) + 2, px(r) + 7, 2, 12, '#5E5A50');
      box(ctx, px(c) + 58, px(r) + 7, 2, 12, '#5E5A50');
    }
  });

export function room(): LevelDef {
  const g = Grid.ground(15);
  // the middle loop (cols 0-12), the hairpin gap, the low loop's taxi pocket (cols 15-21), the middle loop again (22-31)
  g.fill(0, 12, 9, 17, '#');
  g.fill(13, 13, 11, 17, '#');
  g.fill(14, 14, 13, 17, '#');
  g.fill(22, 31, 9, 17, '#');
  // the stair up (one-way steps) and the top loop, from which you walk down to the middle loop's far side
  g.fill(5, 8, 7, 7, '=');
  g.fill(8, 11, 5, 5, '=');
  g.fill(11, 24, 4, 4, '=');
  return {
    id: 'GTK-06',
    city: 'GTK',
    index: 6,
    name: 'Seedhi',
    nameEn: 'The shortcut stairs',
    tagline: 'Gangtok’s roads loop back and forth across the hill, and footpath stairs cut straight between the loops.',
    hint: 'The stair down is a short cut, but to the loop below: you come out at the foot of the taxi stand, where they back out over the last step. Take the stair up to the loop above instead and walk along it: it brings you down on the far side of the bend.',
    par: 14,
    map: g.put(2, 8, '@').put(30, 8, 'E').rows(),
    build(w: World) {
      door(w);
      stairArt(w, [
        [5, 7],
        [8, 5],
      ]);
      standTaxi(w, px(17), px(14.6), FL, px(11), 'gtk6t');
      decor(w, -3, (ctx) => {
        // the taxi stand's shed, and the bend of the road
        box(ctx, px(16), px(12), px(6), 3, '#2E86AB');
        box(ctx, px(16), px(12), 2, px(3), '#4E5A62');
        box(ctx, px(21), px(12), 2, px(3), '#4E5A62');
      });
      sign(w, 12.5, 6.8, 3.4, 'SEEDHI', 'green', 'down', 'short cut');
      sign(w, 3.2, 4.2, 4.2, 'UPPER RD', 'green', 'up', 'stairs');
      rival(w, 4, 9, 1, taraScript(6));
      onPass(w, px(9), (w2) => tara(w2, 'Hajur! The shortcut stairs, Dad! | Yes! The shortcut stairs, Dad!', 2.2));
      collectible(w, 'gtk-thukpa', 17.5, 2.4);
    },
  };
}

/** act: the up stair ends on a doorstep over the gully; the down stair lands on a roof garden that crosses it */
export const act: Act = {
  id: 'gtk06-chhat',
  w: 34,
  advice: 'Here the stair up ends on someone’s doorstep, high over the gully, with nowhere to go. The stair down lands on a roof garden that runs right across: go down, along the roof between the pots, and jump up to the road at the far end.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 5, 9, 17, '#');
    // the gully, and the house whose flat roof bridges it
    g.fill(x + 6, x + 25, 9, 17, '.');
    g.fill(x + 7, x + 24, 11, 17, '#');
    g.fill(x + 6, x + 6, 10, 17, '#');
    g.fill(x + 26, x + 33, 9, 17, '#');
    // the stair up to the doorstep
    g.fill(x + 0, x + 3, 7, 7, '=');
    g.fill(x + 3, x + 6, 5, 5, '=');
    g.fill(x + 6, x + 8, 4, 4, '=');
  },
  build: (w, c) => {
    const x = c.x;
    stairArt(w, [
      [x, 7],
      [x + 3, 5],
    ]);
    // the doorstep: a front door, shut
    decor(w, -2, (ctx) => {
      box(ctx, c.X(7), px(2), px(2), px(2), '#8E6C8A');
      box(ctx, c.X(7) + 4, px(2) + 4, px(2) - 8, px(2) - 4, '#5B4458');
      box(ctx, c.X(8) + 6, px(3), 3, 3, '#F4D35E');
      // the roof garden: pots and a tank on the flat roof
      for (let i = 0; i < 6; i++) {
        const px0 = c.X(9 + i * 2.6);
        box(ctx, px0, px(11) - 8, 8, 8, '#B5562E');
        box(ctx, px0 + 1, px(11) - 14, 6, 6, i % 2 ? '#E07A5F' : '#3E8E41');
      }
      box(ctx, c.X(22), px(11) - 26, 18, 26, '#26323A');
    });
    // the gully: a long way down
    w.add(new Rig(c.X(6), px(17) - 4, px(20), 24, { cause: 'gtk-khaai', inset: 0 }));
    // and a long drop on to the roof is no better: off the doorstep, it's too far down
    const air = { from: -1 };
    w.add(
      new Rig(c.X(5), 0, px(21), px(18), {
        tick: (r, w2) => {
          const p = w2.player;
          const over = p.x + p.w > r.x && p.x < r.x + r.w;
          if (!over || p.onGround) {
            if (over && p.onGround && air.from >= 0 && p.y - air.from > 72) w2.die('gtk-chhat');
            air.from = -1;
            return;
          }
          if (air.from < 0) air.from = p.y;
        },
      }),
    );
    onPass(w, c.X(2.5), (w2) => tara(w2, 'Hajur! The roof garden, Dad! Really! | Yes! The roof garden, Dad! Really!', 2.6));
    onPass(w, c.X(9), (w2) => npc(w2, 'Namaste! | Hello!', c.X(12), px(11) - 30, 1.2));
    w.add(new Rig(c.X(12) - 4, px(11) - 28, 10, 28, { layer: -1, paint: (ctx, r) => local(ctx, r.x + 5, r.y, 28, '#8E6C8A', { scarf: '#F4D35E' }) }));
    sign(w, x + 9.6, 6.6, 4, 'ROOF', 'shop', null, 'garden');
  },
};

/** act 2: the next bend. Here the short cut down is the only way, and its foot is the taxi stand again: wait
 *  on the last step while the taxi backs out, and go behind it as it pulls back in */
export const STAND2 = { period: 4.6, out: 0.8 };
export const act2: Act = {
  id: 'gtk06-modh',
  w: 30,
  advice: 'At the next bend the only way on is the stair down, and it comes out at a taxi stand again. Wait on the last step while the taxi backs out over the foot of the stair; the moment it pulls back in, walk down and on past it.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 5, 9, 17, '#');
    g.fill(x + 6, x + 7, 11, 17, '#');
    g.fill(x + 8, x + 9, 13, 17, '#');
  },
  build: (w, c) => {
    standTaxi(w, c.X(14), c.X(10.1), FL, c.X(4), 'gtk6m', STAND2);
    decor(w, -3, (ctx) => {
      box(ctx, c.X(13), px(12), px(6), 3, '#2E86AB');
      box(ctx, c.X(13), px(12), 2, px(3), '#4E5A62');
      box(ctx, c.X(19) - 2, px(12), 2, px(3), '#4E5A62');
    });
    sign(w, c.x + 3, 6.6, 3.8, 'TAXI STAND', 'green', 'down', 'seedhi');
  },
};

/** act 3: the switchback. The road ends at the hillside; its stair up is at the far end, past a taxi stand, and the
 *  loop above runs back the way you came, to another stair up at its far end, and only the top loop goes on */
export const STAND3 = { period: 3.6, out: 0.8 };
export const ultaAct = (id: string, key: string, cfg: { period: number; out: number }): Act => ({
  id,
  w: 36,
  advice: 'The road ends at the hillside. Get past the taxi stand while the taxi is in, up the stair at the end, then along the loop above back the way you came (yes, back), up the next stair, and on along the top loop over the hill.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 31, x + 35, 6, 17, '#');
    g.fill(x + 25, x + 28, 13, 13, '=');
    g.fill(x + 27, x + 30, 11, 11, '=');
    g.fill(x + 2, x + 30, 10, 10, '=');
    g.fill(x + 2, x + 2, 9, 9, '#');
    g.fill(x + 5, x + 10, 8, 8, '=');
    g.fill(x + 0, x + 7, 6, 6, '=');
    g.fill(x - 6, x + 35, 5, 5, '=');
  },
  build: (w, c) => {
    standTaxi(w, c.X(14), c.X(9.5), FL, c.X(2), key, cfg);
    decor(w, -3, (ctx) => {
      box(ctx, c.X(13), px(12), px(6), 3, '#2E86AB');
      box(ctx, c.X(13), px(12), 2, px(3), '#4E5A62');
      box(ctx, c.X(19) - 2, px(12), 2, px(3), '#4E5A62');
    });
    stairArt(w, [
      [c.x + 25, 13],
      [c.x + 27, 11],
      [c.x + 6, 8],
      [c.x + 4, 6],
    ]);
    sign(w, c.x + 20, 6.4, 3.6, 'UPPER RD', 'green', 'left', 'this way');
  },
});
export const act3 = ultaAct('gtk06-ulta', 'gtk6u', STAND3);
/** act 10: one more switchback, its stand slower */
export const act10 = ultaAct('gtk06-ghumao', 'gtk6g', { period: 5.2, out: 1.0 });
/** act 4: the stair up comes out at the top among the taxis: wait on the step below the top while one backs out */
export const act4: Act = {
  id: 'gtk06-adda',
  w: 30,
  advice: 'This stair goes up, and comes out at a taxi stand on the road above. Wait on the step below the top while the taxi backs out across it; when it has pulled back in, up and past it.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 4, x + 5, 14, 17, '#');
    g.fill(x + 6, x + 7, 13, 17, '#');
    g.fill(x + 8, x + 9, 12, 17, '#');
    g.fill(x + 10, x + 29, 11, 17, '#');
  },
  build: (w, c) => {
    standTaxi(w, c.X(15), c.X(10.1), px(11), c.X(2), 'gtk6a', STAND2);
    sign(w, c.x + 1, 9.4, 3.6, 'TAXI STAND', 'green', 'up', 'seedhi');
  },
};

/** act 5: two loops down. The stair down lands in a taxi pocket again, but this time the road you want is the
 *  loop below that: wait out the taxi on the last step, cross the pocket, take the second stair down */
export const STAND5 = { period: 3.4, out: 0.7 };
export const act5: Act = {
  id: 'gtk06-neeche',
  w: 34,
  advice: 'The road you want is two loops down. The first stair lands in a taxi pocket: wait on the last step while the taxi backs out, cross behind it as it pulls in, and take the second stair down at the far side.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 33, 15, 15, '.');
    g.fill(x, x + 3, 11, 17, '#');
    g.fill(x + 4, x + 5, 12, 17, '#');
    g.fill(x + 6, x + 7, 13, 17, '#');
    g.fill(x + 8, x + 20, 14, 17, '#');
    g.fill(x + 21, x + 22, 15, 17, '#');
    g.fill(x + 23, x + 33, 16, 17, '#');
  },
  build: (w, c) => {
    standTaxi(w, c.X(13), c.X(8.1), px(14), c.X(2), 'gtk6n', STAND5);
    decor(w, -3, (ctx) => {
      box(ctx, c.X(12), px(11), px(6), 3, '#2E86AB');
      box(ctx, c.X(12), px(11), 2, px(3), '#4E5A62');
      box(ctx, c.X(18) - 2, px(11), 2, px(3), '#4E5A62');
    });
    sign(w, c.x + 0.5, 7.4, 3.6, 'LOWER RD', 'green', 'down', '2 loops');
  },
};
export const STAND6 = { period: 5.0, out: 0.7 };
/** act 6: the loop above has its own taxi stand, and the stair up from it lands right in the taxis' way */
export const act6: Act = {
  id: 'gtk06-upar2',
  w: 32,
  advice: 'Up again, and the loop above has its own stand: the stair comes out where two taxis back out in turn. Wait on the stair until the second has pulled in, then up and across.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 4, x + 5, 14, 17, '#');
    g.fill(x + 6, x + 7, 13, 17, '#');
    g.fill(x + 8, x + 9, 12, 17, '#');
    g.fill(x + 10, x + 31, 11, 17, '#');
  },
  build: (w, c) => {
    standTaxi(w, c.X(14), c.X(10.1), px(11), c.X(2), 'gtk6p', STAND6);
    standTaxi(w, c.X(22), c.X(17.5), px(11), c.X(2), 'gtk6q', { ...STAND6, delay: STAND6.out * 2 } as typeof STAND6);
    sign(w, c.x + 1, 9.4, 3.6, 'TAXI STAND', 'green', 'up', 'two taxis');
  },
};

/** act 7: the stair up is behind you. The road runs on into a dead end at the hill; the way on starts back where
 *  you came in: up the stair there, then along the loop above, forwards, over the hill */
export const act7: Act = {
  id: 'gtk06-peeche',
  w: 34,
  advice: 'This road runs into the hillside. The way on is the stair up back near where you came in: go back, up it, and along the loop above, forwards, over the hill.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 30, x + 33, 10, 17, '#');
    g.fill(x + 3, x + 9, 13, 13, '=');
    g.fill(x + 0, x + 5, 11, 11, '=');
    g.fill(x - 8, x + 33, 9, 9, '=');
  },
  build: (w, c) => {
    stairArt(w, [
      [c.x + 3, 13],
      [c.x + 1, 11],
    ]);
    // and the stand at the dead end, a taxi waiting to back out the moment you get there
    standTaxi(w, c.X(26), c.X(20.5), FL, c.X(14), 'gtk6r', STAND5);
    decor(w, -3, (ctx) => {
      box(ctx, c.X(25), px(12), px(5), 3, '#2E86AB');
    });
    sign(w, c.x + 20, 5.2, 3.6, 'DEAD END', 'warn', null, 'taxi stand');
  },
};

/** act 8: the share-jeep stand at the foot of a long stair down. A share jeep waits to fill up and then pulls
 *  out across the foot of the stair, and the next one backs straight in: wait on the step for the gap */
export const JEEP = { period: 8.0, out: 1.4 };
export const act8: Act = {
  id: 'gtk06-sawari',
  w: 32,
  advice: 'The long stair down ends at the share-jeep stand: each jeep backs in across the foot of the stair, waits to fill, and pulls out again. Wait on the last step while it backs in and out; go as it pulls back in.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 31, 15, 15, '.');
    g.fill(x, x + 2, 9, 17, '#');
    g.fill(x + 3, x + 4, 10, 17, '#');
    g.fill(x + 5, x + 6, 11, 17, '#');
    g.fill(x + 7, x + 8, 12, 17, '#');
    g.fill(x + 9, x + 10, 13, 17, '#');
    g.fill(x + 11, x + 31, 16, 17, '#');
  },
  build: (w, c) => {
    standTaxi(w, c.X(16), c.X(11.1), px(16), c.X(1), 'gtk6s', JEEP);
    decor(w, -3, (ctx) => {
      box(ctx, c.X(15), px(13), px(6), 3, '#3E8E41');
      box(ctx, c.X(15), px(13), 2, px(3), '#4E5A62');
      box(ctx, c.X(21) - 2, px(13), 2, px(3), '#4E5A62');
    });
    sign(w, c.x + 13, 9.4, 4.2, 'SHARE JEEP', 'green', null, 'singtam, rangpo');
  },
};

/** act 9: roofs all the way down the hill. Each house's flat roof is the next one's step; the stair up from each
 *  roof goes to a front door, and a jump off a doorstep on to the roof below is too far */
export const act9: Act = {
  id: 'gtk06-chhatein',
  w: 36,
  advice: 'Down the hill over the rooftops: each flat roof is a step down to the next, a little hop across the gap. The stairs up only go to front doors; the gaps between the houses go all the way down.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 35, 15, 15, '.');
    g.fill(x, x + 2, 11, 17, '#');
    g.fill(x + 3, x + 10, 10, 17, '#');
    g.fill(x + 12, x + 19, 12, 17, '#');
    g.fill(x + 21, x + 28, 14, 17, '#');
    g.fill(x + 30, x + 35, 16, 17, '#');
    for (const [a, r] of [
      [x + 5, 8],
      [x + 7, 6],
      [x + 14, 10],
      [x + 16, 8],
      [x + 23, 12],
      [x + 25, 10],
    ] as [number, number][])
      g.fill(a, a + 2, r, r, '=');
  },
  build: (w, c) => {
    const x = c.x;
    stairArt(w, [
      [x + 5, 8],
      [x + 14, 10],
      [x + 23, 12],
    ]);
    decor(w, -2, (ctx) => {
      for (const [a, r] of [
        [x + 8, 6],
        [x + 17, 8],
        [x + 26, 10],
      ]) {
        box(ctx, px(a), px(r) - 32, px(2), 32, '#8E6C8A');
        box(ctx, px(a) + 4, px(r) - 28, px(2) - 8, 28, '#5B4458');
      }
      for (const a of [x + 4, x + 13, x + 22]) {
        box(ctx, px(a), px(10) - 8, 8, 8, '#B5562E');
      }
    });
    w.add(new Rig(c.X(0), px(17) - 2, px(36), 24, { cause: 'gtk-khaai', inset: 0 }));
    sign(w, x + 0.4, 12.6, 3.4, 'SEEDHI', 'green', 'down', 'roofs');
  },
};

/** door: the roof's water tank overflows down the house front, over the doorway, and the gush shoves you back */
export const TANK = { period: 3.0, on: 1.1 };
export const ending: Ending = {
  space: 11,
  advice: 'The water tank on the roof over the door overflows every few seconds, and the gush pushes you back down the road. Wait for it to stop, then walk in before it fills again.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'tank';
    const st = { t0: -1 };
    w.flags.gtk6e = st;
    onPass(w, px(D - 9), (w2) => {
      st.t0 = w2.tick;
    });
    w.add(
      new Rig(px(D - 2), 0, px(2), FL, {
        layer: 4,
        tick: (r, w2) => {
          if (st.t0 < 0) return;
          const p = w2.player;
          const on = cyc(w2, st.t0, TANK.period) < TANK.on;
          if (on && p.x + p.w > r.x && p.x < r.x + r.w) {
            p.vx = -260;
            p.pushVx = -260;
            p.stun = 24;
            p.x -= perTick(200);
          }
        },
        paint: (ctx, r, w2) => {
          box(ctx, r.x - 8, FL - 120, r.w + 16, 26, '#26323A');
          box(ctx, r.x - 10, FL - 96, r.w + 20, 4, '#5E5A50');
          if (st.t0 < 0) return;
          const u = cyc(w2, st.t0, TANK.period);
          if (u < TANK.on) {
            ctx.fillStyle = 'rgba(160,200,230,0.75)';
            ctx.fillRect(r.x + 2, FL - 94, r.w - 4, 94);
            for (let k = 0; k < 6; k++) box(ctx, r.x + 4 + ((w2.tick * 3 + k * 7) % (r.w - 8)), FL - 90 + ((w2.tick * 4 + k * 17) % 90), 2, 6, 'rgba(255,255,255,0.8)');
          } else if (u > TANK.period - 0.5) {
            box(ctx, r.x + r.w / 2 - 2, FL - 94, 4, 8, 'rgba(160,200,230,0.8)');
          }
        },
      }),
    );
  },
};

export const meta06 = { family: 'shortcut-stairs-one-loop-low', betrayals: ['topology'], ending: 'gtk-tank-overflow' };
