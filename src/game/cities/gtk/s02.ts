// GTK-02 Momo Steamer. A momo stall's steamer: three aluminium tiers stacked on the stove. To cook them evenly
// the cook lifts the top tier off, carries it round and slides it under the bottom, into the heat. Ride the top
// tier and it lifts you to the shelf where the door is; stay on it and it takes you down into the steam. Get
// on below it (on the second tier) and the lid comes down on you. Step off at the top of the lift.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, cyc, local, px } from './entities';
import { taraScript } from './common';

export const TIER = { h: 16, w: 48, lift: 80 };

/** phases of one cycle (seconds): idle, lift, hold at the top, carry left, lower, lid on the stack, stack rises, slide in */
export interface SteamCfg {
  period: number;
  liftAt: number;
  liftT: number;
  hold: number;
  carryT: number;
  lowerT: number;
  lidAt: number;
  lidT: number;
}
// round 4: the cook works about a quarter quicker, so a wait on the stack replays in under 7.5 s
export const ROOM_CFG: SteamCfg = { period: 3.8, liftAt: 1.15, liftT: 0.6, hold: 0.8, carryT: 0.45, lowerT: 0.45, lidAt: 2.55, lidT: 0.65 };
/** the act's cook has no time to stop at the top: the tier goes round at once */
// round 5: the finale's cooks work a quarter quicker too, so a wait on the stack replays in under 7.5 s
export const ACT_CFG: SteamCfg = { period: 3.4, liftAt: 1.0, liftT: 0.65, hold: 0, carryT: 0.45, lowerT: 0.45, lidAt: 1.9, lidT: 0.65 };

export interface Steamer {
  t0: number;
  x: number;
  base: number;
  cfg: SteamCfg;
  tiers: Rig[];
  /** which tier is at the top right now */
  top: number;
  k: number;
  lidDown: boolean;
  phase: string;
}

/** the top of the stack (y of the tier surface at rank r: 0 bottom .. 2 top) */
const rankTop = (s: Steamer, r: number) => s.base - TIER.h * (r + 1);

/** a steamer on a stove at column c (stack x = px(c)), the cook beside it on the left; clock starts at `startX` */
export function steamer(w: World, c: number, cfg: SteamCfg, startX: number, key: string): Steamer {
  const x = px(c);
  const base = FL - 16; // the stove's top
  const s: Steamer = { t0: -1, x, base, cfg, tiers: [], top: 2, k: 0, lidDown: false, phase: 'idle' };
  w.flags[key] = s;
  onPass(w, startX, (w2) => {
    s.t0 = w2.tick;
  });
  const carryX = x - 48;
  // the stove: clay, fire glowing under the pot
  w.add(
    new Rig(x - 2, base, TIER.w + 4, 16, {
      layer: 1,
      solid: true,
      paint: (ctx, r, w2) => {
        box(ctx, r.x, r.y, r.w, 16, '#8A5A44');
        box(ctx, r.x + 4, r.y + 5, r.w - 8, 7, '#2A1A14');
        const fl = (w2.tick >> 3) % 3;
        for (let i = 0; i < 5; i++) box(ctx, r.x + 8 + i * 8, r.y + 9 - ((i + fl) % 3), 4, 3, i % 2 ? '#F57C00' : '#FFD54F');
      },
    }),
  );
  for (let i = 0; i < 3; i++) {
    const t = w.add(
      new Rig(x, rankTop(s, i), TIER.w, TIER.h, {
        solid: true,
        layer: 2,
        paint: (ctx, r) => {
          if (r.solid && !r.solid.collidable) ctx.globalAlpha = 0.75;
          box(ctx, r.x, r.y, r.w, r.h, '#C9CED3');
          box(ctx, r.x, r.y, r.w, 2, '#EEF1F3');
          box(ctx, r.x, r.y + r.h - 3, r.w, 3, '#8E979E');
          box(ctx, r.x - 3, r.y + 5, 3, 4, '#6F7A82');
          box(ctx, r.x + r.w, r.y + 5, 3, 4, '#6F7A82');
          for (let j = 0; j < 5; j++) box(ctx, r.x + 5 + j * 9, r.y + 7, 4, 2, '#A9B1B7');
          ctx.globalAlpha = 1;
        },
      }),
    );
    t.s.rank = i;
    s.tiers.push(t);
  }
  // the lid: comes down on the stack while the top tier is away
  const lid = w.add(
    new Rig(x - 2, 0, TIER.w + 4, 14, {
      layer: 3,
      cause: 'gtk-dhakkan',
      inset: 2,
      live: () => s.lidDown,
      paint: (ctx, r) => {
        if (r.y < -20) return;
        ctx.fillStyle = '#B7BEC4';
        ctx.beginPath();
        ctx.ellipse(r.x + r.w / 2, r.y + 12, r.w / 2, 9, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        box(ctx, r.x + r.w / 2 - 4, r.y, 8, 4, '#4E5A62');
      },
    }),
  );
  lid.y = -40;
  // the steam that cooks whatever goes under: kills anyone carried down on the tier
  const steam = w.add(
    new Rig(carryX, base - 60, TIER.w, 60, {
      layer: 4,
      paint: (ctx, r, w2) => {
        const a = s.phase === 'lower' || s.phase === 'slide' ? 0.55 : 0.18;
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = `rgba(245,248,250,${a})`;
          ctx.beginPath();
          ctx.arc(x + 8 + i * 11, base - 18 - ((w2.tick + i * 23) % 40), 6 + (i % 2) * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        void r;
      },
    }),
  );
  void steam;
  // the clock
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 0,
      tick: (_r, w2) => {
        if (s.t0 < 0) return;
        const k = Math.floor((w2.tick - s.t0) / 120 / cfg.period);
        if (k !== s.k) {
          // one cycle done: the carried tier is now the bottom, the others went up one
          for (const t of s.tiers) t.s.rank = t.s.rank === 2 ? 0 : t.s.rank + 1;
          s.k = k;
        }
        const u = cyc(w2, s.t0, cfg.period);
        const lifting = s.tiers.find((t) => t.s.rank === 2)!;
        const tLift = u - cfg.liftAt;
        const top0 = rankTop(s, 2);
        let lx = x,
          ly = top0;
        const endLift = cfg.liftT,
          endHold = endLift + cfg.hold,
          endCarry = endHold + cfg.carryT,
          endLower = endCarry + cfg.lowerT;
        const riseAt = cfg.lidAt + cfg.lidT;
        if (tLift < 0) s.phase = 'idle';
        else if (tLift < endLift) {
          s.phase = 'lift';
          ly = top0 - TIER.lift * (tLift / cfg.liftT);
        } else if (tLift < endHold) {
          s.phase = 'hold';
          ly = top0 - TIER.lift;
        } else if (tLift < endCarry) {
          s.phase = 'carry';
          ly = top0 - TIER.lift;
          lx = x + (carryX - x) * ((tLift - endHold) / cfg.carryT);
        } else if (tLift < endLower) {
          s.phase = 'lower';
          lx = carryX;
          ly = top0 - TIER.lift + (rankTop(s, 0) - top0 + TIER.lift) * ((tLift - endCarry) / cfg.lowerT);
        } else {
          lx = carryX;
          ly = rankTop(s, 0);
          s.phase = 'wait';
          const slideAt = riseAt + 0.25 - cfg.liftAt;
          if (tLift >= slideAt) {
            s.phase = 'slide';
            lx = carryX + (x - carryX) * Math.min(1, (tLift - slideAt) / 0.4);
          }
        }
        // the carried tier takes whoever rides it down into the steam
        if (lifting.carries(w2) && (s.phase === 'lower' || s.phase === 'wait' || s.phase === 'slide') && ly > top0 - TIER.lift + 24) w2.die('gtk-bhaap');
        // nobody aboard: on the way down and round it passes behind (it can't squash a dad standing by)
        if ((s.phase === 'carry' || s.phase === 'lower') && !lifting.carries(w2)) lifting.setSolid(false);
        if (s.phase === 'idle' || s.phase === 'lift') lifting.setSolid(true);
        lifting.moveTo(w2, lx, ly);
        // the stack under it: stays, then rises one tier once the lid is off (room for the carried one underneath)
        const rise = u >= riseAt ? Math.min(1, (u - riseAt) / 0.25) : 0;
        for (const t of s.tiers) if (t !== lifting) t.moveTo(w2, x, rankTop(s, t.s.rank) - TIER.h * rise);
        // the lid on the stack's new top while the carried tier is away
        const lidOn = u >= cfg.lidAt && u < cfg.lidAt + cfg.lidT;
        const lidDrop = u >= cfg.lidAt - 0.3 && u < cfg.lidAt ? (u - (cfg.lidAt - 0.3)) / 0.3 : lidOn ? 1 : 0;
        s.lidDown = lidOn;
        lid.y = lidDrop > 0 ? -40 + (rankTop(s, 1) - 14 + 40) * lidDrop : -40;
      },
    }),
  );
  // the cook, working from the left
  w.add(
    new Rig(carryX - 22, FL - 28, 10, 28, {
      layer: -1,
      paint: (ctx, r) => local(ctx, r.x + 5, r.y, 28, '#3E6E8E', { cap: '#F4F1EA' }),
    }),
  );
  return s;
}

export function room(): LevelDef {
  return {
    id: 'GTK-02',
    city: 'GTK',
    index: 2,
    name: 'Momo Steamer',
    nameEn: 'Top tier to the bottom',
    tagline: 'A momo stall off MG Marg: three tiers on the stove, and a cook who keeps them moving so they all cook evenly.',
    hint: 'The cook lifts the top tier high, carries it round and slides it under the bottom, into the steam. Get on the top tier while the stack is still, ride it up, and step off on to the shelf while he holds it up there. Don’t get on lower down while the top one is away: that’s where the lid comes down.',
    par: 14,
    // the stool (col 7), the steamer on its stove (cols 8-10), the shelf the lift reaches (cols 11-27, top row 6)
    map: Grid.ground(15).fill(7, 7, 13, 14, '#').fill(11, 27, 6, 14, '#').put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      steamer(w, 8, ROOM_CFG, px(2), 'gtk2');
      sign(w, 14, 3.2, 4, 'MOMO', 'shop', null, 'steamed');
      rival(w, 1, 15, 1, taraScript(2));
      onPass(w, px(3), (w2) => tara(w2, 'Hajur! Climb on top and wait! | Yes! Climb on top and wait!', 2.4));
      collectible(w, 'gtk-momo', 22.5, 4.6);
    },
  };
}

/** act 2: the third stall has its shelf behind you: ride the top tier up, and as the cook carries it round to
 *  the left, step off backwards on to the shelf over the stool; the way on is the walkway above */
export const act2: Act = {
  id: 'gtk02-ulta',
  w: 32,
  advice: 'At the third stall the shelf is behind you, over the stool: ride the top tier up, and as the cook carries it round to his side, step off it backwards on to that shelf. Climb to the walkway above and go on along it.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 10, x + 10, 13, 14, '#');
    g.fill(x + 2, x + 8, 6, 6, '=');
    g.fill(x + 0, x + 6, 4, 4, '=');
    g.fill(x - 6, x + 31, 2, 2, '=');
  },
  build: (w, c) => {
    steamer(w, c.x + 11, ROOM_CFG, c.X(4), 'gtk2b');
    sign(w, c.x + 20, 6.2, 4.4, 'SHAPALEY', 'shop', null, 'and momo');
  },
};

/** door: the steam vent. The door stands past a floor grate over the big pot; the grate puffs a column of steam */
export const VENT = { period: 2.6, on: 0.9 };
export const ending: Ending = {
  space: 12,
  advice: 'In front of the door a grate over the big pot puffs a tall column of steam: too high to jump over. Cross the grate just after a puff ends.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const st = { t0: -1 };
    w.flags.gtk2e = st;
    w.flags.twist = 'vent';
    onPass(w, px(D - 9), (w2) => {
      st.t0 = w2.tick;
    });
    w.add(
      new Rig(px(D - 5), 0, px(2), FL, {
        layer: 4,
        cause: 'gtk-bhaap',
        inset: 3,
        live: (_r, w2) => st.t0 >= 0 && cyc(w2, st.t0, VENT.period) < VENT.on,
        paint: (ctx, r, w2) => {
          box(ctx, r.x, FL - 3, r.w, 3, '#4E5A62');
          for (let i = 0; i < 4; i++) box(ctx, r.x + 3 + i * 7, FL - 3, 2, 3, '#26323A');
          if (st.t0 < 0) return;
          const u = cyc(w2, st.t0, VENT.period);
          if (u < VENT.on) {
            for (let k = 0; k < 9; k++) {
              ctx.fillStyle = `rgba(248,250,252,${0.75 - k * 0.06})`;
              ctx.beginPath();
              ctx.arc(r.x + 16 + Math.sin(k + w2.tick * 0.1) * 4, FL - 10 - k * 18, 10 + k, 0, Math.PI * 2);
              ctx.fill();
            }
          } else if (u > VENT.period - 0.5) {
            ctx.fillStyle = 'rgba(248,250,252,0.5)';
            ctx.fillRect(r.x + 4, FL - 10, r.w - 8, 7);
          }
        },
      }),
    );
  },
};

export const meta02 = { family: 'tier-cycle-top-to-bottom', betrayals: ['tier-cycle'], ending: 'gtk-steam-vent' };
