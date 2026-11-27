// ITA-07 Sela Dhakka (marathon): the pass road, and a stalled truck across it. Lean on its back and it moves; let go
// and it rolls back down the slope, faster and faster, on to whoever is behind it, until a chock stone on the road
// stops it. The driver keeps trying the engine: the cab shakes, then the exhaust coughs black smoke over the one
// pushing. So push in bursts, chock to chock, and be off the truck when it coughs: when its wheel drops over a chock
// the truck settles a step ahead of you, out of the smoke, and from there it rolls back only to that chock.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk, perTick } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L } from './lines';

export const TRUCK_W = 64;
export const TRUCK_H = 60;
export const PUSH = 46;
const SETTLE = 14;
const COUGH_ON = 0.6;
const TELL = 1.0;

export interface TruckSt {
  t0: number;
  x0: number;
  /** chock columns the rear wheel must pass */
  chocks: number[];
  /** the lay-by column: the truck pulls off the road once its rear passes it */
  bay: number;
  coughs: number[];
  /** cough tell by sound only (the cab is iced over) */
  deaf?: boolean;
  rig: Rig;
  rolled: number;
  parked: boolean;
  /** tick the truck last moved (the driver only tries the engine when he feels it move) */
  lastMove: number;
  /** settled on its start or a step past a chock, not moving */
  atRest: boolean;
  /** the rest spot the truck rolls back to (px) */
  hold: number;
}

function truckArt(ctx: CanvasRenderingContext2D, x: number, y: number, shake: number, parked: boolean, tick: number) {
  const dy = shake > 0 ? ((tick >> 2) % 2) * 2 - 1 : 0;
  ctx.save();
  ctx.globalAlpha = parked ? 0.6 : 1;
  // the body: a tall goods truck, tarp over the load, cab at the front (right)
  box(ctx, x, y + dy, TRUCK_W - 18, TRUCK_H - 12, '#2F4F6B');
  box(ctx, x, y + dy, TRUCK_W - 18, 6, '#C9B06A');
  box(ctx, x + TRUCK_W - 18, y + 16 + dy, 18, TRUCK_H - 28, '#D7262E');
  box(ctx, x + TRUCK_W - 14, y + 20 + dy, 10, 10, '#BFE3F2');
  for (const wx of [10, TRUCK_W - 12]) {
    ctx.fillStyle = '#1D1A1A';
    ctx.beginPath();
    ctx.arc(x + wx, FL - 7, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // the exhaust pipe at the back, low
  box(ctx, x - 4, FL - 14, 6, 4, '#4A4A52');
  ctx.restore();
}

/** a stalled truck on the road from column c (its rear); `key` holds the state for the tests */
export function truck(w: World, c: number, trigger: number, chocks: number[], bay: number, coughs: number[], key: string, deaf = false): TruckSt {
  const rig = w.add(
    new Rig(px(c), FL - TRUCK_H, TRUCK_W, TRUCK_H, {
      solid: true,
      layer: 2,
      paint: (ctx, r, w2) => {
        const t = st.t0 < 0 ? -1 : since(w2, st.t0);
        const shake = !st.deaf && since(w2, st.lastMove) < 0.5 && r.x - st.hold > 24 && coughs.some((ct) => t >= ct - TELL && t < ct) ? 1 : 0;
        truckArt(ctx, r.x, r.y, shake, st.parked, w2.tick);
      },
    }),
  );
  const st: TruckSt = { t0: -1, x0: px(c), chocks, bay, coughs, deaf, rig, rolled: 0, parked: false, lastMove: -99, atRest: true, hold: px(c) };
  w.flags[key] = st;
  onPass(w, px(trigger), (w2) => {
    st.t0 = w2.tick;
  });
  let lastPush = -99;
  let v = 0;
  const passed = new Set<number>();
  // the roll-back hazard: the zone right behind the truck, live once it has rolled back more than a step
  const back = w.add(
    new Rig(0, FL - 40, 12, 40, {
      layer: 3,
      cause: 'ita-truck',
      inset: 0,
      live: () => st.rolled > 24 && !st.parked,
      tick: (b) => {
        b.x = rig.x - 8;
      },
      paint: () => {},
    }),
  );
  void back;
  // the exhaust: a cough of black smoke behind the truck on the driver's schedule
  w.add(
    new Rig(0, FL - 26, 10, 26, {
      layer: 3,
      cause: 'ita-dhuan',
      inset: 0,
      live: (r) => r.s.live === true,
      tick: (r, w2) => {
        r.x = rig.x - 10;
        const t = st.t0 < 0 ? -1 : since(w2, st.t0);
        // the driver tries the engine only when he has felt the truck move in the last half second, and only
        // between chocks: at a stone he rests too
        const felt = since(w2, st.lastMove) < 0.5 && rig.x - st.hold > 24;
        const ct = coughs.find((q) => t >= q && t < q + COUGH_ON);
        if (ct !== undefined && r.s.seen !== ct) {
          r.s.seen = ct;
          r.s.goAt = felt ? ct : -1;
          if (felt) w2.sfx('boom', rig.x, FL - 20);
        }
        r.s.live = ct !== undefined && !st.parked && r.s.goAt === ct;
        const tell = coughs.find((q) => t >= q - TELL && t < q - TELL + 1 / 120 + 0.001);
        if (tell !== undefined && felt) w2.sfx('rumble', rig.x + 40, FL - 40);
      },
      paint: (ctx, r, w2) => {
        if (!r.s.live) return;
        ctx.fillStyle = 'rgba(30,30,34,0.85)';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(r.x + 2 + ((i * 5 + (w2.tick >> 1)) % 14), FL - 8 - i * 4, 5 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      },
    }),
  );
  // the truck itself: pushed while leaned on, rolling back otherwise, held by the last chock passed
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 1,
      paint: () => {},
      tick: (_r, w2) => {
        if (st.parked || w2.state !== 'play') return;
        st.atRest = since(w2, st.lastMove) > 1 / 120 && (rig.x <= st.x0 + 0.5 || chocks.some((ch) => Math.abs(rig.x - (px(ch) + SETTLE)) < 0.6));
        const p = w2.player;
        const touching = p.onGround && Math.abs(p.x + p.w - rig.x) <= 1 && p.y + p.h > rig.y + 10;
        if (touching && w2.input.right) {
          lastPush = w2.tick;
          st.lastMove = w2.tick;
          v = 0;
          st.rolled = 0;
          rig.moveTo(w2, rig.x + perTick(PUSH), rig.y);
          // the rear wheel drops over a chock: the truck settles a step ahead
          for (const ch of chocks) {
            if (!passed.has(ch) && rig.x >= px(ch)) {
              passed.add(ch);
              rig.moveTo(w2, rig.x + SETTLE, rig.y);
              st.hold = px(ch) + SETTLE;
              w2.sfx('thud', rig.x, FL);
            }
          }
          if (rig.x >= px(bay)) {
            // into the lay-by: off the road
            st.parked = true;
            rig.setSolid(false);
            rig.layer = -1;
            w2.sfx('honk', rig.x, FL - 40);
          }
          return;
        }
        if (since(w2, lastPush) < 0.25) return;
        // rolling back down the slope to the last chock passed
        const hold = Math.max(st.x0, ...[...passed].map((ch) => px(ch) + SETTLE));
        st.hold = hold;
        if (rig.x > hold) {
          st.lastMove = w2.tick;
          v = Math.min(170, v + 150 / 120);
          const nx = Math.max(hold, rig.x - perTick(v));
          st.rolled += rig.x - nx;
          rig.moveTo(w2, nx, rig.y);
          if (st.rolled > 24 && st.rolled - (rig.x - nx) <= 24) w2.sfx('creak', rig.x, FL - 20);
        } else {
          v = 0;
          st.rolled = 0;
        }
      },
    }),
  );
  // the chocks and the lay-by
  w.add(
    new Paint((ctx) => {
      for (const ch of chocks) {
        box(ctx, px(ch) - 2, FL - 6, 10, 6, '#8A8A90');
        box(ctx, px(ch), FL - 8, 6, 2, '#C8C8CC');
      }
      box(ctx, px(bay), FL - 4, 40, 4, '#6A6A70');
      box(ctx, px(bay) + 6, FL - 44, 2, 40, '#8A6A3A');
      box(ctx, px(bay) + 2, FL - 50, 20, 8, '#F2D16B');
    }, 1),
  );
  return st;
}

/** the pass: snow banks and the rock cut above the road (no way over the truck) */
function passArt(w: World, c0: number, c1: number) {
  w.add(
    new Paint((ctx) => {
      box(ctx, px(c0), 0, px(c1 - c0), 110, '#4A4A52');
      box(ctx, px(c0), 104, px(c1 - c0), 8, '#E8EEF4');
      for (let x = px(c0); x < px(c1); x += 30) box(ctx, x + 6, 112, 12, 6 + (x % 7), '#F4F8FC');
    }, -4),
  );
}

export function room(): LevelDef {
  return {
    id: 'ITA-07',
    city: 'ITA',
    index: 7,
    name: 'Sela Dhakka',
    nameEn: 'The push at Sela',
    tagline: 'A truck across the pass road. The driver is trying. You are pushing.',
    hint: 'The truck across the road moves while you lean on its back, and rolls back down the slope the moment you let go, faster and faster, on to whoever is behind it, until a chock stone holds it. The driver keeps trying the engine: the cab shakes for a second, then the exhaust coughs black smoke over the one pushing. Push in bursts from chock to chock: when the wheel drops over a chock the truck settles a step ahead of you, and that is the only place to rest. Never let go between chocks, and never be pushing when it coughs.',
    par: 40,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      passArt(w, 0, 32);
      truck(w, 6, 3, [11, 17, 23], 26, [6.5, 13.5, 20.5, 27.5, 34.5, 41.5], 'ita7');
      for (const ch of [11, 17, 23]) w.checkpoints.push(px(ch) - 4);
      onPass(w, px(3), (w2) => tara(w2, L.intro[5], 2.4));
      w.add(new Paint((ctx) => folk(ctx, px(2) + 8, FL - 28, 28, '#2F6BB0'), -1));
      onPass(w, px(2), (w2) => w2.say('Dada, raasta band hai. | Brother, the road is shut.', px(3), FL - 36, 2.2, 'npc'));
      sign(w, 2, 10.4, 3.4, 'SELA', 'shop', null, '13,700 ft');
      rival(w, 29, 15, -1, taraScript(7));
      collectible(w, 'ita-momo', 20, 11.4);
    },
  };
}

/** act: the climb. A second truck, chocks spaced unevenly, and the driver's tries come on no rhythm: watch the cab. */
export const act: Act = {
  id: 'ita07-chadhai',
  w: 44,
  advice: 'The climb: a second stalled truck, and its chocks are spaced unevenly, so the bursts are long and short. This driver tries the engine on no rhythm at all: watch the cab, not the clock. Rest only where the truck has settled past a chock.',
  cps: [9 - 0.25, 13 - 0.25, 22 - 0.25, 27 - 0.25, 34 - 0.25],
  build: (w, c) => {
    passArt(w, c.x, c.x + 44);
    truck(w, c.x + 4, c.x + 1, [c.x + 9, c.x + 13, c.x + 22, c.x + 27, c.x + 34], c.x + 38, [3.5, 6.0, 12.0, 14.5, 21.0, 27.0, 29.5, 36.0, 42.0, 48.0], 'ita7a');
    sign(w, c.x + 1, 10.4, 3, 'CHADHAI', 'shop', null, 'the climb');
  },
};

/** act: the snow. The cab is iced over and does not show the shake: the only tell is the sound of the engine turning (a sound beat). */
export const actBarf: Act = {
  id: 'ita07-barf',
  w: 44,
  advice: 'Snow on the pass: this cab is iced over and you cannot see it shake. The only tell is the sound of the engine turning over, a second before the cough. Listen, push in bursts, and rest past the chocks.',
  cps: [10 - 0.25, 16 - 0.25, 23 - 0.25, 30 - 0.25, 35 - 0.25],
  build: (w, c) => {
    passArt(w, c.x, c.x + 44);
    truck(w, c.x + 4, c.x + 1, [c.x + 10, c.x + 16, c.x + 23, c.x + 30, c.x + 35], c.x + 38, [4.5, 9.0, 15.5, 20.0, 26.5, 31.0, 37.5, 43.0, 49.0], 'ita7b', true);
    w.add(
      new Paint((ctx, w2) => {
        ctx.fillStyle = 'rgba(240,246,252,0.8)';
        for (let i = 0; i < 40; i++) {
          const x = c.X(0) + ((i * 97 + w2.tick * 0.7) % px(44));
          const y = (i * 53 + w2.tick * 1.3) % 260;
          ctx.fillRect(x, y, 2, 2);
        }
      }, 5),
    );
    sign(w, c.x + 1, 10.4, 3, 'BARF', 'shop', null, 'snow');
  },
};

/** ending: the tailgate. The last truck has started at the summit: the door is on its tailgate, and its exhaust coughs on
 *  the driver's rhythm. Walk in to the door between coughs. */
export const ending: Ending = {
  space: 14,
  advice: 'At the summit the truck has finally started, and the door is on its tailgate. Its exhaust coughs every few seconds, a rumble first: walk in right after a cough.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'tailgate';
    const P = 3.4;
    w.flags.ita7e = { P, x: d.x };
    w.add(
      new Rig(d.x - 18, FL - 26, 16, 26, {
        layer: 3,
        cause: 'ita-dhuan',
        inset: 0,
        live: (r) => r.s.live === true,
        tick: (r, w2) => {
          const t = (w2.tick / 120) % P;
          r.s.live = t >= P - COUGH_ON;
          if (Math.abs(t - (P - COUGH_ON - TELL)) < 1 / 120 + 0.001) w2.sfx('rumble', d.x, FL - 40);
          if (Math.abs(t - (P - COUGH_ON)) < 1 / 120 + 0.001) w2.sfx('boom', d.x, FL - 20);
        },
        paint: (ctx, r, w2) => {
          // the truck's back end round the door: tailgate down, the body above
          box(ctx, d.x - 10, FL - 80, 48, 30, '#2F4F6B');
          box(ctx, d.x - 10, FL - 80, 48, 6, '#C9B06A');
          if (!r.s.live) return;
          ctx.fillStyle = 'rgba(30,30,34,0.85)';
          for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(r.x + 2 + ((i * 5 + (w2.tick >> 1)) % 14), FL - 8 - i * 4, 5 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
          }
        },
      }),
    );
    void D;
  },
};

export const meta07 = { family: 'push-heavy-slope-object', betrayals: ['push-in-bursts'], ending: 'ita-tailgate' };
