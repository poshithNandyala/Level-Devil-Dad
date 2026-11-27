// GTK-10 Kanchenjunga (the finale). Only Gangtok's own ideas, in a new order: the hillside house again, but in
// the cloud, so you can't see the floors or the road you came in from: count the flights as you go down them.
// Then the momo stall with a wrapper in your hand (bin it before the jump on to the steamer), then the cloud on
// the road with the kerb rope, and its stair up to the viewpoint, where the door is two floors up in the cloud.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { npc, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { FL, Rig, box, decor, px } from './entities';
import { taraScript } from './common';
import { FLOORS, house, houseDecor } from './s04';
import { fog, rope, type Cloud } from './s07';
import { inspectorAct } from './s03';
import { bankLook, river, thinShore, yak } from './s09';
import { ACT_CFG, steamer } from './s02';
import { bin, litter, mgRule } from './s05';
import { bench, reserved, sweeper } from './s01';

const DOORS: ('none' | 'exit' | 'drop' | 'water')[] = ['none', 'drop', 'none', 'exit', 'water'];

/** handrail posts along each floor of the house in the cloud, with a gap over each stairwell (drawn over the fog) */
function stairRails(w: World, c: number) {
  decor(w, 3, (ctx) => {
    for (let i = 0; i < FLOORS.length; i++) {
      const y = px(FLOORS[i]);
      const hole = i === FLOORS.length - 1 ? null : i % 2 === 0 ? [c + 8, c + 10] : [c + 1, c + 3];
      for (let k = c; k <= c + 11; k++) {
        if (hole && k >= hole[0] - 1 && k <= hole[1]) continue;
        box(ctx, px(k) + 7, y - 12, 2, 12, '#F4F1EA');
        if (!(hole && k + 1 >= hole[0] - 1 && k + 1 <= hole[1]) && k < c + 11) box(ctx, px(k) + 8, y - 11, 16, 1.4, '#F4D35E');
      }
    }
  });
}

export function room(): LevelDef {
  const g = Grid.ground(15);
  g.fill(0, 9, 4, 17, '#');
  house(g, 10, DOORS, 6);
  return {
    id: 'GTK-10',
    city: 'GTK',
    index: 10,
    name: 'Kanchenjunga',
    nameEn: 'The mountain, in the cloud',
    tagline: 'On a clear morning Kanchenjunga fills the sky over Gangtok. This isn’t a clear morning.',
    hint: 'The house is in the cloud: you can’t see the floors, or the road you came in by. Count the flights of stairs as you go down them (the rail stops at each stairwell): the lower road is three floors down, so out of the door at the bottom of the third flight. The first door opens over the jhora; the bottom is the basement.',
    par: 18,
    map: g.put(1, 3, '@').rows(),
    build(w: World) {
      door(w);
      houseDecor(w, 10, DOORS, 'gtk10');
      fog(w, 10, 31, null);
      stairRails(w, 10);
      sign(w, 3.4, 0.6, 5.2, 'LOWER ROAD', 'green', 'down', '3 floors down');
      sign(w, 8.2, 1.4, 1.6, 'G', 'shop', null, '', false);
      rival(w, 2, 4, 1, taraScript(10));
      onPass(w, px(6), (w2) => tara(w2, 'Hajur! Out the first door, Dad! | Yes! Out the first door, Dad!', 2.2));
      collectible(w, 'gtk-churpi', 15, 8.4);
    },
  };
}

/** act 1: the momo stall again, with a wrapper on the paving. The jump on to the steamer is a jump: bin it first */
export const act1: Act = {
  id: 'gtk10-thela',
  w: 32,
  advice: 'Down at the momo stall there’s a wrapper on the paving, and you pick it up. The next bin is full; the one by the steps is empty. Bin it there, because getting on the steamer is a jump. Then ride the top tier and jump off to the shelf on the way up.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 1, 13, 14, '#');
    g.fill(x + 10, x + 10, 13, 14, '#');
    g.fill(x + 14, x + 28, 6, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    mgRule(w, false);
    bin(w, x + 3, false);
    litter(w, x + 5);
    bin(w, x + 8, true);
    steamer(w, x + 11, ACT_CFG, c.X(9), 'gtk10s');
    sign(w, x + 17, 3.2, 4, 'MOMO', 'shop', null, 'last stop');
  },
};

/** act 2: the cloud on the road again; the rope shows the holes, then climbs with the stair to the viewpoint */
const ROAD_PITS: [number, number][] = [
  [5, 6],
  [12, 13],
  [20, 21],
];
export const act2: Act = {
  id: 'gtk10-rassi',
  w: 30,
  advice: 'The road to the viewpoint is in the cloud: jump wherever the kerb rope stops.',
  paint: (g, c) => {
    for (const [a, b] of ROAD_PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const pits = ROAD_PITS.map(([a, b]) => [c.x + a, c.x + b] as [number, number]);
    fog(w, c.x, c.x + 29, null);
    rope(w, c.x + 1, c.x + 29, pits);
    // the drops get the cloud's cause
    for (const [a, b] of pits) w.add(new Rig(px(a), FL + 20, px(b - a + 1), 40, { cause: 'gtk-badal', inset: 0 }));
    sign(w, c.x + 0.5, 9.4, 4.2, 'VIEWPOINT', 'wood', 'right', 'tashi');
  },
};

/** act 3: the shortcut stair up in the cloud, with a wrapper lying at its foot. The rope climbs with the stair;
 *  every step up is a jump, so bin the wrapper first (the bin at the foot is full: the one back down the road) */
export const act3: Act = {
  id: 'gtk10-chadhai',
  w: 30,
  advice: 'The stair up to the next loop is in the cloud: the rope goes up with it. There’s a wrapper at its foot, and every step is a jump: the bin by the stair is full, so take it back to the empty one down the road first.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 12, x + 15, 13, 13, '=');
    g.fill(x + 15, x + 18, 11, 11, '=');
    g.fill(x + 18, x + 21, 9, 9, '=');
    g.fill(x + 21, x + 29, 7, 14, '#');
    g.fill(x + 26, x + 29, 5, 5, '=');
  },
  build: (w, c) => {
    const x = c.x;
    bin(w, x + 3, false);
    litter(w, x + 8);
    bin(w, x + 10, true);
    fog(w, x + 6, x + 29, null);
    decor(w, 3, (ctx) => {
      ctx.strokeStyle = '#F4D35E';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      [
        [x + 12, 13],
        [x + 15, 11],
        [x + 18, 9],
        [x + 21, 7],
      ].forEach(([cc, r], i) => {
        box(ctx, px(cc) + 7, px(r) - 14, 2, 14, '#F4F1EA');
        if (i === 0) ctx.moveTo(px(cc) + 8, px(r) - 11);
        else ctx.lineTo(px(cc) + 8, px(r) - 11);
      });
      ctx.stroke();
    });
    sign(w, x + 1, 9.4, 3.4, 'SEEDHI', 'green', 'up', 'next loop');
  },
};

/** act 4: down off the loop, one more house in the cloud; its sign says one floor down */
const DOORS2: ('none' | 'exit' | 'drop' | 'water')[] = ['none', 'exit', 'none', 'drop', 'water'];
export const act4: Act = {
  id: 'gtk10-ghar',
  w: 28,
  advice: 'One more house in the cloud, and its sign says one floor down: out of the door at the bottom of the first flight, whatever the last house taught you.',
  paint: (g, c) => {
    g.fill(c.x, c.x + 7, 4, 17, '#');
    house(g, c.x + 8, DOORS2, 4);
  },
  build: (w, c) => {
    houseDecor(w, c.x + 8, DOORS2, 'gtk10b');
    fog(w, c.x + 8, c.x + 27, null);
    stairRails(w, c.x + 8);
    sign(w, c.x + 3.4, 0.6, 3.4, 'LOWER RD', 'green', 'down', '1 floor down');
  },
};

/** act 5: the cloud bank rolls up behind you, there's a wrapper underfoot, and the bin ahead is full: back into
 *  the cloud to the empty one, then run, jumping where the rope stops */
const BANK_PITS: [number, number][] = [
  [10, 11],
  [16, 17],
  [22, 23],
  [28, 29],
];
export const act5: Act = {
  id: 'gtk10-peechha',
  w: 34,
  advice: 'A cloud bank rolls up behind you, there’s a wrapper underfoot and the bin ahead is full. Go back into the cloud to the empty bin (nothing to fall into behind you), then run, and jump where the rope stops.',
  paint: (g, c) => {
    for (const [a, b] of BANK_PITS) g.pit(c.x + a, c.x + b);
  },
  build: (w, c) => {
    const x = c.x;
    const pits = BANK_PITS.map(([a, b]) => [x + a, x + b] as [number, number]);
    bin(w, x + 1, false);
    // the wrapper two tiles past where Dad lands off the stair, so the act's checkpoint is taken empty-handed
    litter(w, x + 6);
    bin(w, x + 7, true);
    const cl: Cloud = { t0: -1, thick: 0, clear: 0, roll: 60 };
    w.flags.gtk10c = cl;
    onPass(w, c.X(3), (w2) => {
      cl.t0 = w2.tick;
    });
    fog(w, x - 2, x + 33, cl);
    rope(w, x + 1, x + 33, pits);
    for (const [a, b] of pits) w.add(new Rig(px(a), FL + 20, px(b - a + 1), 40, { cause: 'gtk-badal', inset: 0 }));
  },
};

/** the rest of the finale: Gangtok's own ideas once more, each in a new place */
// the cloud drifts off ahead of you over a road whose wall is painted; the rope is the truth
// the bag rail over the jhora on the way to the ropeway, the inspector working it towards you
export const act7 = inspectorAct(
  'gtk10-jhola',
  'gtk10j',
  'cctcctcc',
  -1,
  42,
  'Over the jhora on the bag rail once more, and the inspector is working it from the far end towards you: cloth bags only, and hop over him the moment he has passed the next one.',
);
// the ropeway up to the viewpoint: the far cabin stops above yours at the middle
/** the finale's ropeway breaks 08's middle-station change: tonight your cabin goes through to the viewpoint deck,
 *  and the other one that waits at the middle drops away down the valley line the moment yours comes in. Stay on
 *  yours past the middle, and off on the deck: it goes on up into its shed */
export const TAR10 = { wait: 0.5, toMid: 1.8, atMid: 0.8, toDeck: 1.6, atDeck: 1.4, up: 0.5, bDrop: 0.4 };
const lerp10 = (a: number, b: number, k: number) => a + (b - a) * Math.max(0, Math.min(1, k));
export const act8: Act = {
  id: 'gtk10-tar',
  w: 34,
  advice: 'The ropeway up to the viewpoint road, and tonight it runs through: your cabin goes all the way to the far deck. The other cabin at the middle is the valley line, and it drops away the moment yours comes in. Stay on past the middle, and get off on the far deck: your cabin goes on up into its shed.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x, x + 33);
    g.fill(x, x + 4, 15, 17, '#');
    g.fill(x + 29, x + 33, 9, 17, '#');
  },
  build: (w, c) => {
    const T = TAR10;
    const st = { t0: -1 };
    w.flags.gtk10tl = st;
    onPass(w, c.X(1.5), (w2) => {
      if (st.t0 < 0) st.t0 = w2.tick;
    });
    const t = (w2: World) => (st.t0 < 0 ? 0 : (w2.tick - st.t0) / 120);
    const a0 = { x: c.X(5), y: px(15) },
      am = { x: c.X(17) - 40, y: px(12) },
      ad = { x: c.X(29) - 40, y: px(9) };
    const aAt = (u: number) => {
      if (u < T.wait) return { ...a0, ph: 'end' };
      u -= T.wait;
      if (u < T.toMid) return { x: lerp10(a0.x, am.x, u / T.toMid), y: lerp10(a0.y, am.y, u / T.toMid), ph: 'up' };
      u -= T.toMid;
      if (u < T.atMid) return { ...am, ph: 'mid' };
      u -= T.atMid;
      if (u < T.toDeck) return { x: lerp10(am.x, ad.x, u / T.toDeck), y: lerp10(am.y, ad.y, u / T.toDeck), ph: 'up' };
      u -= T.toDeck;
      if (u < T.atDeck) return { ...ad, ph: 'deck' };
      u -= T.atDeck;
      return { x: ad.x, y: ad.y - 60 * Math.min(1, u / T.up), ph: 'shed' };
    };
    const roof = (ctx: CanvasRenderingContext2D, r: Rig, colour: string) => {
      const cx = r.x + r.w / 2;
      box(ctx, cx - 1, r.y - 14, 2, 14, '#4E5A62');
      box(ctx, r.x, r.y, r.w, 4, '#D9D4C7');
      box(ctx, r.x + 2, r.y + 4, r.w - 4, 22, colour);
      box(ctx, r.x + 5, r.y + 8, r.w - 10, 9, '#BFD7EA');
    };
    const A = w.add(
      new Rig(a0.x, a0.y, 40, 6, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const q = aAt(t(w2));
          r.moveTo(w2, q.x, q.y);
          r.s.ph = q.ph;
          // on up into the shed over the far deck, with Dad still on the roof: the eave takes him
          if (q.ph === 'shed' && q.y < ad.y - 30 && r.carries(w2)) w2.die('gtk-ropeway');
        },
        paint: (ctx, r) => roof(ctx, r, '#C0392B'),
      }),
    );
    // the valley-line cabin waiting at the middle, a little lower: it drops away as A comes in
    const b0 = { x: c.X(17) + 4, y: px(12) + 14 };
    const B = w.add(
      new Rig(b0.x, b0.y, 40, 6, {
        solid: true,
        layer: 2,
        tick: (r, w2) => {
          const u = t(w2) - (T.wait + T.toMid);
          const k = u < 0 ? 0 : Math.min(1, u / T.bDrop);
          r.moveTo(w2, b0.x + 40 * k, b0.y + 200 * k * k);
          r.s.ph = k > 0 ? 'gone' : 'mid';
        },
        paint: (ctx, r) => roof(ctx, r, '#2E86AB'),
      }),
    );
    w.flags.gtk10t = [A, B];
    decor(w, -3, (ctx) => {
      ctx.strokeStyle = '#26323A';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(a0.x + 20, a0.y - 16);
      ctx.lineTo(am.x + 20, am.y - 16);
      ctx.lineTo(ad.x + 20, ad.y - 16);
      ctx.stroke();
      // the valley line going down from the middle, and the far deck's shed roof
      ctx.beginPath();
      ctx.moveTo(b0.x + 20, b0.y - 16);
      ctx.lineTo(b0.x + 80, FL + 60);
      ctx.stroke();
      box(ctx, ad.x - 6, ad.y - 70, 52, 6, '#5E5A50');
    });
    w.add(new Rig(c.X(0), FL + 20, px(34), 40, { cause: 'gtk-khaai', inset: 0 }));
    sign(w, c.x + 0.4, 10.4, 3.6, 'TASHI', 'station', null, 'runs through');
  },
};
/** the yak by the viewpoint lake: it stops for a photo on the thin shore; stay on, off at the far bank */
export const act9: Act = {
  id: 'gtk10-chauri',
  w: 40,
  advice: 'A yak by the little lake below the viewpoint: it stops for a photo on the thin ice. Stay on, and get off on the real bank as it crosses it, before it wades into the stream. Jump the stream: the handler’s second yak takes you over the last of the shore and stands on the far bank.',
  paint: (g, c) => {
    g.pit(c.x + 19, c.x + 20);
  },
  build: (w, c) => {
    // a bank 7 tiles wide at the start, wider than a tap-jump, so the act's checkpoint is calm
    // two rides, each started as Dad gets on, with the bank between as a calm pause
    thinShore(w, c.x + 7.5, c.x + 13);
    bankLook(w, c.x + 8, c.x + 12);
    river(w, c.x + 19, c.x + 20);
    // the bank across the stream is 7 tiles: its checkpoint (+21.5) is clear of a tap-jump
    thinShore(w, c.x + 28, c.x + 34);
    yak(w, c.X(4.5), [{ wait: 0.6 }, { to: c.X(9) }, { wait: 1.8, photo: true }, { to: c.X(16.5) }, { sink: true }], 'mount', 'gtk10y');
    // the second yak stands on the far bank once it is there: the handler holds it for the next tourist
    yak(w, c.X(26.2), [{ wait: 0.6 }, { to: c.X(36) }, { wait: 9999 }], 'mount', 'gtk10y2');
  },
};
/** the last house in the cloud: three floors down again, the shop floor and all */
const DOORS3: ('none' | 'exit' | 'drop' | 'water')[] = ['none', 'drop', 'none', 'exit', 'water'];
export const act10: Act = {
  id: 'gtk10-antim',
  w: 31,
  advice: 'The last house in the cloud says three floors down: count the flights, past the first door and the shop floor, out at the bottom of the third.',
  paint: (g, c) => {
    for (let k = 0; k <= 10; k++) g.fill(c.x + k, c.x + k, 14 - k, 17, '#');
    house(g, c.x + 11, DOORS3, 4);
  },
  build: (w, c) => {
    houseDecor(w, c.x + 11, DOORS3, 'gtk10h');
    fog(w, c.x + 11, c.x + 30, null);
    stairRails(w, c.x + 11);
    sign(w, c.x + 6.4, 1.4, 3.4, 'LOWER RD', 'green', 'down', '3 floors down');
  },
};

/** the last momo stall: someone has left a wrapper on the cook's stool, the only step up to the steamer. Stand
 *  on it and it's in your hand: step down to the bin beside it, climb back, then on to the tier */
export const act11: Act = {
  id: 'gtk10-stool',
  w: 30,
  advice: 'The last stall: a wrapper lies on the stool you need to get on to the steamer. Stand on the stool and it’s in your hand; step down to the bin beside it, hop back up, and then ride the top tier and jump off to the shelf on the way up.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 6, x + 7, 13, 14, '#');
    g.fill(x + 11, x + 26, 6, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    bin(w, x + 3, false);
    litter(w, x + 6, FL - 32);
    steamer(w, x + 8, ACT_CFG, c.X(6), 'gtk10s2');
    sign(w, x + 14, 3.2, 4, 'MOMO', 'shop', null, 'one more plate');
  },
};
/** the tour's sweepers, last of all (01's callback): the first has a bench, the second a RESERVED one, whose owner
 *  asks you off it in front of the broom. Bench at the first; behind the stroke at the second */
export const act12: Act = {
  id: 'gtk10-jhadu',
  w: 34,
  advice: 'MG Marg again, swept as on the first evening. The first sweeper has a bench: up on it while he strokes. The second bench has a RESERVED card, and its owner will ask you down in front of the broom: wait outside his stroke and walk through right behind it.',
  build: (w, c) => {
    const x = c.x;
    sweeper(w, x + 9, 6, 'gtk10w');
    bench(w, c.X(9) - 8, 40);
    sweeper(w, x + 25, 6, 'gtk10w');
    reserved(w, c.X(25) - 8, true);
    sign(w, x + 15.5, 9.6, 4.4, 'MG MARG', 'green', null, 'swept again');
  },
};

/** door: the viewpoint house in the cloud. Its doors are stacked up the front, G, 1, 2: the exit is two floors up */
export const ending: Ending = {
  space: 18,
  advice: 'At the viewpoint the door is two floors up the house front, in the cloud, with a door on every floor. Climb the steps (the rope goes with them) past the ground floor and the first, to the second.',
  paint: (g, D) => {
    g.put(D, 14, '.');
    g.fill(D - 14, D - 11, 13, 13, '=');
    g.fill(D - 11, D - 8, 11, 11, '=');
    g.fill(D - 8, D - 5, 9, 9, '=');
    g.fill(D - 4, D + 2, 7, 14, '#');
    g.put(D, 6, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'counted';
    fog(w, D - 15, D + 3, null);
    // the doors that aren't the way out: the ground floor's and the first floor's, shut
    const fakes: [number, number][] = [
      [D - 15, 13],
      [D - 9, 9],
    ];
    decor(w, 1, (ctx) => {
      for (const [c, r] of fakes) {
        box(ctx, px(c), px(r), px(1), px(2), '#8E6C8A');
        box(ctx, px(c) + 3, px(r) + 3, 10, 26, '#5B4458');
      }
    });
    decor(w, 3, (ctx) => {
      for (const [c, r] of [
        [D - 12, 13],
        [D - 9, 11],
        [D - 6, 9],
        [D - 3, 7],
      ]) {
        box(ctx, px(c) + 7, px(r) - 12, 2, 12, '#F4F1EA');
        box(ctx, px(c) + 7, px(r) - 12, 2, 3, '#E07A5F');
      }
    });
    const told = { t: -999 };
    for (const [c, r] of fakes)
      onPass(w, px(c) - 2, (w2) => {
        if (w2.tick - told.t > 60 && w2.player.y > px(r) - 20 && w2.player.y < px(r + 2)) {
          told.t = w2.tick;
          npc(w2, 'Hoina. | No.', px(c) + 8, px(r) - 8, 1.0);
        }
      });
    sign(w, D - 17.5, 9.4, 4.4, 'VIEWPOINT', 'wood', null, '2 floors up');
  },
};

export const meta10 = { family: 'finale-two-roads-count-in-fog', betrayals: ['count-in-fog'], ending: 'gtk-viewpoint-second-floor' };
