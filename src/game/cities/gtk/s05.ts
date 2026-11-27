// GTK-05 MG Marg ka Niyam (how would I know: MG Marg's rule). MG Marg is a walking street with rules, and the
// rules are kept: no littering. Dad has a momo wrapper in his hand (you can see it). Jump while holding
// anything and it falls out of his hand: the whistle goes, the warden holds him there while he writes the fine,
// and the sweeper sweeps up the wrapper, and Dad with it. Walk past a bin first and it goes in. A dad picks up
// any litter he walks over; and a bin heaped full won't take it: use the next one.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, local, perTick, px } from './entities';
import { taraScript } from './common';
import { bench, reserved, sweeper } from './s01';

export interface Rule {
  hold: boolean;
  /** how many wrappers are in his hand */
  n?: number;
  /** tick the wrapper fell (the fine started), or -1 */
  fined: number;
  dropX: number;
  wasGround: boolean;
}
export const FINE = { warden: 0.55, write: 1.5 };

/** the rule, the wrapper in Dad's hand, and the fine: one per stage */
export function mgRule(w: World, holding = true): Rule {
  const st: Rule = { hold: holding, fined: -1, dropX: 0, wasGround: true };
  w.flags.gtk5 = st;
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 6,
      tick: (_r, w2) => {
        const p = w2.player;
        if (st.fined >= 0) {
          // held while he writes: no moving off
          p.stun = 30;
          if (p.onGround) p.vx = 0;
          if ((w2.tick - st.fined) / 120 >= FINE.write) w2.die('gtk-jurmana');
          return;
        }
        // jumped with something in hand: it falls out
        if (st.hold && st.wasGround && !p.onGround && p.vy < 0) {
          st.hold = false;
          st.n = 0;
          st.fined = w2.tick;
          st.dropX = p.cx;
          w2.sfx('whistle', p.cx, p.y);
          npc(w2, 'Roknuhos! | Stop!', p.cx + 30, p.y - 16, 1.4);
        }
        st.wasGround = p.onGround;
      },
      paint: (ctx, _r, w2) => {
        const p = w2.player;
        if (st.hold) {
          // the wrapper in his hand: a crumpled silver-and-red momo paper (two if he has two)
          const hx = p.x + (p.facing > 0 ? 9 : -3);
          for (let k = 0; k < Math.min(2, st.n ?? 1); k++) {
            box(ctx, hx, p.y + 7 - k * 4, 5, 4, '#E9EEF2');
            box(ctx, hx + 1, p.y + 8 - k * 4, 3, 1, '#C62828');
          }
        }
        if (st.fined < 0) return;
        const t = (w2.tick - st.fined) / 120;
        // the wrapper on the paving, the warden walking up with his book, the sweeper's broom coming for it
        box(ctx, st.dropX - 2, FL - 3, 5, 3, '#E9EEF2');
        const wx = p.cx + 26 + Math.max(0, 1 - t / FINE.warden) * 120;
        local(ctx, wx, FL - 28, 28, '#2F4858', { cap: '#E07A5F' });
        if (t > FINE.warden) box(ctx, wx - 8, FL - 18, 6, 4, '#F4F1EA');
        const bx = p.cx - 70 + Math.min(1, Math.max(0, (t - 0.8) / (FINE.write - 0.8))) * 74;
        if (t > 0.6) {
          ctx.fillStyle = '#C9A55A';
          ctx.beginPath();
          ctx.moveTo(bx + 4, FL - 8);
          ctx.lineTo(bx - 6, FL);
          ctx.lineTo(bx + 8, FL);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#8A6A3E';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(bx + 4, FL - 6);
          ctx.lineTo(bx - 14, FL - 30);
          ctx.stroke();
          local(ctx, bx - 18, FL - 28, 28, '#E8772E', { cap: '#2F4858' });
        }
      },
    }),
  );
  return st;
}

/** a municipal bin at column c: empty ones take what Dad holds as he walks past; full ones are heaped over */
export function bin(w: World, c: number, full: boolean, room = 99) {
  const x = px(c) + 3;
  const st = { told: -999, full, room };
  const b = w.add(
    new Rig(x, FL - 16, 10, 16, {
      layer: 3,
      tick: (r, w2) => {
        const rule = w2.flags.gtk5 as Rule;
        const p = w2.player;
        if (!rule.hold || rule.fined >= 0) return;
        if (p.x < r.x + r.w && p.x + p.w > r.x && p.y + p.h > r.y) {
          if (st.full) {
            if (w2.tick - st.told > 120) {
              st.told = w2.tick;
              npc(w2, 'Hoina. | No.', r.x + 5, r.y - 10, 1.2);
            }
          } else {
            const n = rule.n ?? 1;
            const take = Math.min(n, st.room);
            st.room -= take;
            rule.n = n - take;
            rule.hold = rule.n > 0;
            if (st.room <= 0) st.full = true;
            npc(w2, rule.hold ? 'Hoina. | No.' : 'Dhanyabad! | Thank you!', r.x + 5, r.y - 10, 1.2);
          }
        }
      },
      paint: (ctx, r) => {
        box(ctx, r.x, r.y + 2, r.w, r.h - 2, '#2E7D5B');
        box(ctx, r.x - 1, r.y + 1, r.w + 2, 2, '#1E5A40');
        box(ctx, r.x + 3, r.y + 6, 4, 4, '#F4F1EA');
        if (st.full) {
          // heaped over the rim
          for (let i = 0; i < 5; i++) box(ctx, r.x - 2 + i * 3, r.y - 3 - (i % 2) * 2, 4, 4, i % 2 ? '#E9EEF2' : '#B5893A');
        }
      },
    }),
  );
  b.s = st;
  return b;
}

/** a wrapper someone left on the paving at column c: Dad picks it up as he walks over it */
export function litter(w: World, c: number, top = FL) {
  const r = w.add(
    new Rig(px(c) + 4, top - 4, 8, 4, {
      layer: 3,
      tick: (rr, w2) => {
        const rule = w2.flags.gtk5 as Rule;
        const p = w2.player;
        if (rule.fined >= 0) return;
        if (p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y + p.h >= top - 2 && p.y + p.h <= top + 2) {
          rule.hold = true;
          rule.n = (rule.n ?? 0) + 1;
          rr.on = false;
          rr.alive = false;
        }
      },
      paint: (ctx, rr) => {
        box(ctx, rr.x, rr.y + 1, 6, 3, '#E9EEF2');
        box(ctx, rr.x + 1, rr.y + 2, 3, 1, '#C62828');
      },
    }),
  );
  return r;
}

/** a raised flower bed down the middle of the street: a low wall you have to jump */
const planterPaint = (w: World, c0: number, c1: number, rows: number) =>
  w.add(
    new Rig(px(c0), FL - px(rows), px(c1 - c0 + 1), px(rows), {
      layer: 3,
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, 4, '#8C8678');
        for (let i = 0; i < r.w; i += 6) box(ctx, r.x + i + 1, r.y - 5 - (i % 4), 4, 5, i % 12 ? '#E07A5F' : '#F4A261');
        for (let i = 0; i < r.w; i += 5) box(ctx, r.x + i, r.y - 2, 3, 3, '#3E8E41');
      },
    }),
  );

export function room(): LevelDef {
  return {
    id: 'GTK-05',
    city: 'GTK',
    index: 5,
    name: 'MG Marg ka Niyam',
    nameEn: 'MG Marg’s rule',
    tagline: 'MG Marg: no vehicles, no smoking, no spitting and no littering. Nobody here takes the rules lightly.',
    hint: 'Look at Dad’s hand: he’s holding a momo wrapper. Jump with anything in your hand and it falls: the warden holds you while he writes the fine, and the sweeper sweeps you up with it. Walk past a green bin first and it goes in (there’s one just behind you). Dad picks up any litter he walks over, and a heaped-up bin is full: go back to the last empty bin before you jump.',
    par: 20,
    map: Grid.ground(15).fill(7, 8, 14, 14, '#').fill(18, 19, 14, 14, '#').put(4, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      mgRule(w, true);
      bin(w, 1, false);
      planterPaint(w, 7, 8, 1);
      bin(w, 10, false);
      litter(w, 12);
      bin(w, 15, true);
      planterPaint(w, 18, 19, 1);
      bin(w, 25, false);
      sign(w, 10.5, 9.6, 4.6, 'MG MARG', 'green', null, 'no littering');
      rival(w, 5.5, 15, 1, taraScript(5));
      onPass(w, px(5.2), (w2) => tara(w2, 'Hajur! Hop the flowers, Dad! | Yes! Hop the flowers, Dad!', 2.0));
      collectible(w, 'gtk-momo', 18.5, 11.0);
    },
  };
}

/** act: the sweepers again. A bench to hop on is a jump: with litter in hand, go behind the stroke on foot */
export const act1: Act = {
  id: 'gtk05-shaam',
  w: 46,
  advice: 'Evening on MG Marg, and the sweepers are out. Hopping up on the bench is a jump, and you’ve just picked up a wrapper: so no bench. Walk through behind the broom’s stroke instead. Bin the next wrapper (the first bin is full) before the flower bed, and walk behind the second sweeper too.',
  cps: [18.5, 38],
  paint: (g, c) => {
    g.fill(c.x + 19, c.x + 20, 13, 14, '#');
    g.fill(c.x + 40, c.x + 41, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    litter(w, x + 3);
    sweeper(w, x + 9, 7, 'gtk5s');
    bench(w, px(x + 9) - 8, 40);
    bin(w, x + 14, true);
    bin(w, x + 16, false);
    planterPaint(w, x + 19, x + 20, 2);
    litter(w, x + 24);
    sweeper(w, x + 31, 7, 'gtk5s');
    bin(w, x + 36, false);
    planterPaint(w, x + 40, x + 41, 1);
    sign(w, x + 22.5, 9.6, 3.6, 'BINS', 'shop', null, 'use them');
  },
};

/** act 2: the bin round. Both bins here are heaped full and the way back is a wall: wait for the man on his
 *  round to empty one, then bin your wrapper and jump */
export const ROUND = { speed: 22, start: 0.6 };
export const kachraAct = (id: string, key: string, speed: number): Act => ({
  id,
  w: 34,
  advice: 'Down off the step there’s a wrapper, both bins are heaped full, and there’s no going back up. The man doing the bin round comes from the far end, emptying each bin he reaches: wait by the first bin till he has emptied it, bin your wrapper, then jump the beds.',
  cps: [1.5],
  paint: (g, c) => {
    g.fill(c.x - 3, c.x - 1, 13, 14, '#');
    g.fill(c.x + 14, c.x + 15, 13, 14, '#');
    g.fill(c.x + 24, c.x + 25, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    litter(w, x + 3);
    const b1 = bin(w, x + 7, true);
    const b2 = bin(w, x + 10, true);
    planterPaint(w, x + 14, x + 15, 2);
    planterPaint(w, x + 24, x + 25, 1);
    const st = { t0: -1, x: c.X(31) };
    w.flags[key] = st;
    onPass(w, c.X(2), (w2) => {
      st.t0 = w2.tick;
    });
    // the bin man: walks in from the far end, stops at each full bin to tip it into his cart
    w.add(
      new Rig(c.X(31), FL - 28, 12, 28, {
        layer: 2,
        tick: (r, w2) => {
          if (st.t0 < 0 || (w2.tick - st.t0) / 120 < ROUND.start) return;
          const next = [b2, b1].find((b) => b.s.full && b.x < r.x + 4);
          if (next && r.x <= next.x + 14) {
            r.s.tip = (r.s.tip ?? 0) + 1;
            if (r.s.tip > 90) {
              next.s.full = false;
              r.s.tip = 0;
            }
            return;
          }
          if (r.x > c.X(5)) r.x -= perTick(speed);
          st.x = r.x;
        },
        paint: (ctx, r) => {
          box(ctx, r.x + 12, FL - 14, 20, 12, '#2E7D5B');
          local(ctx, r.x + 6, r.y, 28, '#E8772E', { cap: '#3E8E41' });
        },
      }),
    );
    sign(w, x + 18.5, 9.6, 4.6, 'BIN ROUND', 'green', null, 'every evening');
  },
});
export const act2 = kachraAct('gtk05-kachra', 'gtk5r', ROUND.speed * 3);

/** act 3: the high flower bed. The bench in front of it is the only step up, and someone has left a wrapper on
 *  the bench. Stand on it and you've picked it up: walk off the end, back to the bin, and up again */
export const act3: Act = {
  id: 'gtk05-chabutra',
  w: 30,
  advice: 'The tall flower bed can only be climbed from the bench in front of it, and there’s a wrapper lying on the bench: stand on it and it’s in your hand. Walk off the bench (walking down isn’t a jump), take it back to the bin, then up on the bench and the bed.',
  paint: (g, c) => {
    g.fill(c.x + 7, c.x + 14, 12, 14, '#');
    g.fill(c.x + 22, c.x + 23, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    bin(w, x + 1, false);
    bench(w, c.X(4), 40);
    litter(w, x + 5, FL - 14);
    planterPaint(w, x + 7, x + 14, 3);
    litter(w, x + 18);
    bin(w, x + 20, false);
    planterPaint(w, x + 22, x + 23, 1);
    sign(w, x + 9, 6.4, 4, 'FLOWER BED', 'green', null, 'MG Marg');
  },
};

/** act 4: the bin round, going away from you. A wrapper underfoot, every bin ahead heaped full, and the bin man
 *  setting off up the street emptying them in turn: follow him, and bin it in the first one he has emptied */
export const act4: Act = {
  id: 'gtk05-peeche',
  w: 36,
  advice: 'Every bin ahead is heaped full, and the bin man is just setting off up the street, emptying them in turn. Follow him (don’t pass him), bin your wrapper in the first one he has emptied, and only then jump the bed.',
  paint: (g, c) => {
    g.fill(c.x + 27, c.x + 28, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    litter(w, x + 2);
    const bins = [x + 8, x + 13, x + 18, x + 23].map((cc) => bin(w, cc, true));
    planterPaint(w, x + 27, x + 28, 2);
    const st = { t0: -1, x: c.X(4) };
    w.flags.gtk5p = st;
    onPass(w, c.X(2.5), (w2) => {
      st.t0 = w2.tick;
    });
    w.add(
      new Rig(c.X(4), FL - 28, 12, 28, {
        layer: 2,
        tick: (r, w2) => {
          if (st.t0 < 0) return;
          const next = bins.find((b) => b.s.full && b.x + 4 > r.x);
          if (next && r.x >= next.x - 14) {
            r.s.tip = (r.s.tip ?? 0) + 1;
            if (r.s.tip > 120) {
              next.s.full = false;
              r.s.tip = 0;
            }
            return;
          }
          if (r.x < c.X(34)) r.x += perTick(30);
          st.x = r.x;
        },
        paint: (ctx, r) => {
          box(ctx, r.x - 22, FL - 14, 20, 12, '#2E7D5B');
          local(ctx, r.x + 6, r.y, 28, '#E8772E', { cap: '#3E8E41' });
        },
      }),
    );
    sign(w, x + 30, 9.6, 4, 'BIN ROUND', 'green', null, 'up the street');
  },
};
/** act 5: MG Marg's benches with RESERVED cards (GTK reserve F3), by a sweeper. A bench is the way over his stroke;
 *  a reserved one, the owner asks you off it, down on to the paving, in front of his broom */
export const act5: Act = {
  id: 'gtk05-aarakshit',
  w: 36,
  advice: 'Two sweepers along a row of benches. Some benches have a RESERVED card on them: get up on one and its owner asks you down, straight on to the paving in front of the broom. Use the benches with no card, or walk behind the stroke.',
  build: (w, c) => {
    const x = c.x;
    sweeper(w, x + 9, 6, 'gtk5b');
    reserved(w, c.X(8), true);
    sweeper(w, x + 25, 6, 'gtk5b');
    reserved(w, c.X(22), true);
    reserved(w, c.X(26), false);
    sign(w, x + 15.5, 9.6, 4.4, 'MG MARG', 'green', null, 'benches');
  },
};

/** act 6: two wrappers. Two left lying close together, and the bins here are nearly full: each takes one more
 *  and is heaped. One bin won't do: bin one, and the other in the next, before the jump */
export const act6: Act = {
  id: 'gtk05-do',
  w: 30,
  advice: 'Two wrappers lie close together, so you pick up both, and these bins are nearly full: each takes just one more. The bin ahead takes one; take the other back to the bin you passed, before you jump.',
  paint: (g, c) => {
    g.fill(c.x + 13, c.x + 14, 14, 14, '#');
    g.fill(c.x + 23, c.x + 24, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    bin(w, x + 1, false, 1);
    litter(w, x + 4);
    litter(w, x + 6);
    bin(w, x + 9, false, 1);
    planterPaint(w, x + 13, x + 14, 1);
    planterPaint(w, x + 23, x + 24, 2);
    sign(w, x + 10.5, 9.6, 3.8, 'NEARLY FULL', 'warn', null, 'one each');
  },
};

/** act 7: what the broom brings you. Each stroke sweeps the paving towards his cart, and the wrapper it pushed
 *  along ends up right where you'll step in behind it. You pick it up; the only bin is his cart, behind you */
export const act7: Act = {
  id: 'gtk05-jhadu',
  w: 30,
  advice: 'The sweeper’s strokes push litter towards his cart, so a wrapper lies just where you step in behind the stroke: you’ll pick it up. The only bin is his cart, behind you: go back to it before the flower bed.',
  paint: (g, c) => {
    g.fill(c.x + 22, c.x + 23, 13, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const sw = sweeper(w, x + 12, 6, 'gtk5j');
    // his cart takes litter like a bin (it is one)
    bin(w, Math.floor((sw.sx - 32 - 30) / 16), false);
    litter(w, x + 10);
    planterPaint(w, x + 22, x + 23, 2);
    sign(w, x + 1, 9.6, 3.6, 'MG MARG', 'green', null, 'swept hourly');
  },
};

/** door: where MG Marg ends the taxis may come: one stands across the door till the fare is paid at the meter */
export const ending: Ending = {
  space: 12,
  advice: 'A taxi stands across the door. Jump up and hit the fare meter on its post to pay, and it drives off. Jumping is jumping: bin the wrapper lying in front of it first.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'taxi';
    const st = { paid: false, x: px(D) - 20 };
    w.flags.gtk5e = st;
    litter(w, D - 9);
    bin(w, D - 7, false);
    // the meter post
    w.add(
      new Rig(px(D - 4) + 4, FL - 40, 10, 10, {
        layer: 4,
        tick: (r, w2) => {
          const p = w2.player;
          if (!st.paid && p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y) {
            st.paid = true;
            npc(w2, 'Dhanyabad! | Thank you!', r.x, r.y - 8, 1.2);
          }
        },
        paint: (ctx, r) => {
          box(ctx, r.x + 4, r.y + 10, 2, 30, '#4E5A62');
          box(ctx, r.x, r.y, r.w, r.h, st.paid ? '#3E8E41' : '#F4D35E');
          box(ctx, r.x + 2, r.y + 2, 6, 3, '#26323A');
        },
      }),
    );
    // the taxi: a little white hatchback across the door; solid till paid, then it pulls away
    const taxi = w.add(
      new Rig(st.x, FL - 36, 52, 36, {
        solid: true,
        layer: 3,
        tick: (r, w2) => {
          if (!st.paid) return;
          r.moveTo(w2, r.x + perTick(160), r.y);
          if (r.x > px(D + 6)) {
            r.setSolid(false);
            r.on = false;
          }
        },
        paint: (ctx, r) => {
          // a tall little hill taxi: white, a blue band, roof rack
          box(ctx, r.x, r.y + 12, r.w, 18, '#F4F6F6');
          box(ctx, r.x + 4, r.y + 2, r.w - 12, 12, '#F4F6F6');
          box(ctx, r.x + 7, r.y + 4, r.w - 18, 7, '#9FC3D9');
          box(ctx, r.x + 6, r.y, r.w - 16, 2, '#4E5A62');
          box(ctx, r.x, r.y + 20, r.w, 3, '#2E86AB');
          ctx.fillStyle = '#26323A';
          ctx.beginPath();
          ctx.arc(r.x + 11, r.y + 31, 5, 0, Math.PI * 2);
          ctx.arc(r.x + r.w - 11, r.y + 31, 5, 0, Math.PI * 2);
          ctx.fill();
        },
      }),
    );
    void taxi;
  },
};

export const meta05 = { family: 'dropped-litter-warden-pause', betrayals: ['rule-broken-by-jump'], ending: 'gtk-taxi-meter' };
