// BBI-10 Kalinga: the finale, at the new stadium gate. Only Bhubaneswar's own ideas, each turned against the rule
// it taught (law 7): the keeper's pads carry you on to a plinth with no horses (any step starts it); a parasol
// street where every parasol is open and a customer is what shuts it; a quiet loom; a troupe whose drummer plays
// while they hold the pose; and the ribbon at the gate.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk } from './entities';
import { FL, channel, cyc, since, taraScript } from './common';
import { keeperOn } from './s02';
import { parasol } from './s03';
import { chheliAct, patraAct } from './s05';
import { loom, type LoomCfg } from './s06';
import { bagudiAct, deepaAct, padaAct, stagePit, troupe, troupeAct, type TroupeCfg } from './s07';
import { chariot, risingSpokes, templeWall, type ChariotCfg } from './s09';

export const C10: ChariotCfg = { c0: 18, len: 10, stopAt: 36, hub: 30, hubY: FL - 58, wait: 0.35, any: true, bare: true };
export const K10 = { x0: 5, travel: 9, gap: [9, 35] as [number, number] };

export function room(): LevelDef {
  return {
    id: 'BBI-10',
    city: 'BBI',
    index: 10,
    name: 'Kalinga',
    nameEn: 'All of Bhubaneswar',
    tagline: 'The finale at the stadium gate: the keeper, the stone chariot, the parasols, the loom and the dancers, in a new order.',
    hint: 'Ride the keeper’s back pad: at the flick he dives right across the moat and puts you down by the stone plinth. Hop on to it and it slides for the temple wall: go to its front and jump up on to the wheel’s hub as it comes over, and let the plinth slam under you. Then up on to the wall.',
    par: 90,
    map: Grid.ground(15, 44).pit(K10.gap[0], K10.gap[1]).fill(C10.stopAt, C10.stopAt + 3, 11, 14, '#').put(1, 14, '@').put(42, 14, 'E').rows(),
    build(w: World) {
      door(w);
      channel(w, K10.gap[0], K10.gap[1], 'bbi-khai', 'water');
      keeperOn(w, { x0: px(K10.x0), travel: px(K10.travel) + 8, boards: px(36), ballFrom: px(37.5), ballY: FL - 22, drop: true, feet: FL - 64 }, 'bbi10k');
      chariot(w, C10, 'bbi10c');
      templeWall(w, C10.stopAt, px(11));
      sign(w, 40.5, 10.4, 3.2, 'KALINGA', 'shop', null, 'stadium');
      rival(w, 2, 15, 1, taraScript(10));
      onPass(w, px(4), (w2) => tara(w2, 'Hockey one, Dad zero!', 1.6));
      collectible(w, 'bbi-dahibara', 30.8, 9.4);
    },
  };
}

/** act 1, the parasol street turned round (law 7): on the finale's festival day every parasol is open already,
 *  and each is folded up when its customer comes to buy it. Pipili taught you to wait for the customer; here
 *  the customer is what shuts it. */
export const P10: { c: number; y: number; cut: -1 | 0 | 1; open: [number, number]; peel?: number }[] = [
  { c: 5, y: FL - 36, cut: -1, open: [0, 3.0] },
  { c: 9, y: FL - 36, cut: -1, open: [0, 3.8] },
  { c: 13, y: FL - 48, cut: 0, open: [0, 4.6] },
  { c: 17, y: FL - 40, cut: 1, open: [0, 5.6] },
];
export const act1: Act = {
  id: 'bbi10-chhata',
  w: 24,
  advice: 'Festival day: every parasol is open already, and each one is folded up when its customer comes to buy it. Don’t wait for anyone: cut-out to cut-out, straight across, before the buyers arrive.',
  cps: [],
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 20);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi10p = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    channel(w, c.x + 2, c.x + 20, 'bbi-rangapani', 'water');
    w.flags.bbi10ps = P10.map((p, i) => parasol(w, c.x + p.c, p.y, p.cut, [p.open], () => st.t0, { peelAt: p.peel, k: i % 3, colour: i + 1 }));
    // the gutter's death line follows the silk, as in Pipili
    const g = (w.entities as Rig[]).filter((e) => e instanceof Rig && e.hazard?.cause === 'bbi-rangapani').pop();
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: -6,
        tick: (_r, w2) => {
          const p = w2.player;
          if (p.onGround && p.y + p.h >= FL - 1) w2.flags.bbiSlip = undefined;
          if (g?.hazard) g.hazard.cause = (w2.flags.bbiSlip as string) ?? 'bbi-rangapani';
        },
        paint: (ctx) => {
          for (let k = c.x + 2; k < c.x + 20; k += 3) box(ctx, px(k) + 2, FL - 90, 40, 42, ['#E63946', '#F4D35E', '#2A9D8F'][k % 3]);
        },
      }),
    );
  },
};

/** act 2: a quiet loom (the weaver is away, no shuttle: the plain beat), then the troupe turned round (law 7):
 *  this drummer plays while they hold the pose and stops while they whirl, so going at the drum's stop, as the
 *  Raja night taught, is going into the whirl. */
export const L10: LoomCfg = { c0: 3, n: 6, speeds: [3, 1, 4, 2, 4, 1], beat: 0.85, hold: 2.0, shuttle: [] };
export const T10: TroupeCfg = { c0: 14, n: 9, drum: 1.4, hold: 1.5, poses: ['tower', 'bridge'], form: 0.3, rev: true };
export const act2: Act = {
  id: 'bbi10-tana',
  w: 28,
  advice: 'The weaver is away: no shuttle today, cross on the motif. Then this drummer plays while his troupe holds the pose: go when the bridge forms, never at his stop.',
  cps: [9.4],
  paint: (g, c) => {
    g.pit(c.x + L10.c0, c.x + L10.c0 + L10.n - 1).pit(c.x + T10.c0, c.x + T10.c0 + T10.n - 1);
  },
  build: (w, c) => {
    const st = { t0: -1 };
    w.flags.bbi10l = st;
    onPass(w, c.X(0.5), (w2) => (st.t0 = w2.tick));
    const st2 = { t0: -1 };
    w.flags.bbi10t = st2;
    onPass(w, c.X(11), (w2) => (st2.t0 = w2.tick));
    channel(w, c.x + L10.c0, c.x + L10.c0 + L10.n - 1, 'bbi-ranga', 'water');
    stagePit(w, c.x + T10.c0, c.x + T10.c0 + T10.n - 1);
    loom(w, { ...L10, c0: c.x + L10.c0 }, () => st.t0, 'bbi10lm');
    troupe(w, { ...T10, c0: c.x + T10.c0 }, () => st2.t0, 'bbi10tr');
  },
};

/** act 3, the lamps turned round (law 7): the Raja night taught you to wait for the bridge and walk under the
 *  lamps, because the wheel's top put your head in them. Here they hang down to the bridge, and the wheel rides
 *  above them. */
export const act3 = deepaAct('bbi10-deepa', 'bbi10d', true);

/** act 4, the palm leaves turned round (law 7): an old manuscript, where the soot shows the worn lines and the
 *  written leaves are the rotten ones */
export const act4 = patraAct('bbi10-patra', 'bbi10pt', true);

/** act 5, the two drummers turned round (law 7): the Raja night taught you to watch the drummer across the pit.
 *  Here he is the one out of step, and the troupe follows the drummer by you. */
export const T10F: TroupeCfg[] = [{ c0: 4, n: 7, drum: 1.6, hold: 1.7, poses: ['bridge'], form: 0.3, decoy: 1.65, decoyFar: true }];
export const act5 = troupeAct('bbi10-dui-baja', 15, T10F, 'bbi10db', 'Two drummers again, but tonight the one across the pit is out of step: this troupe follows the drummer by you. Go when he stops.');

/** act 6, the falling tower turned round (law 7): it stands at your edge and falls away from you, and it is down
 *  only a moment: waiting back by the scuffs, as the Raja night taught, leaves you too far to cross */
export const act6 = padaAct('bbi10-pada', 'bbi10pd', true);

/** act 7, bagudi turned round (law 7): the yard taught you to pass "it" back at the line; tonight the boys let
 *  "it" through and tackle anyone else, for a moment after the tag */
export const act7 = bagudiAct('bbi10-bagudi', 'bbi10bg', true);

/** act 8, the rising spokes turned round (law 7): Konark taught you to wait on each spoke for the next one. These
 *  rise only while nobody stands on a spoke, so stepping on stops the stair: wait on the bank for all of it */
export const act8 = risingSpokes('bbi10-udaya', 1, 'bbi10u', true);

/** act 9, the goat turned round (law 7): Raja taught you to jump once the goat was back on your side; this one
 *  charges the straw when it comes back, so jump while it is away */
export const act9 = chheliAct('bbi10-chheli', 'bbi10ch', true);

/** ending: the inauguration ribbon across the stadium gate, and the big ceremonial scissors that snip at it */
export const RIB = { period: 2.2, shut: 0.5, at: 9 };
export const ending: Ending = {
  space: 12,
  advice: 'A ribbon across the gate, and a pair of ceremonial scissors snipping at it every couple of seconds. Wait while they close, then walk through as they open.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'bbi-ribbon-snip';
    const st = { t0: -1 };
    w.flags.bbi10e = st;
    onPass(w, px(D - RIB.at), (w2) => (st.t0 = w2.tick));
    w.add(
      new Rig(px(D - 3), FL - 40, 24, 40, {
        cause: 'bbi-kainchi',
        inset: 2,
        layer: 4,
        live: (_r, w2) => st.t0 >= 0 && cyc(w2, RIB.period, 0.4 - st.t0 / 120) < RIB.shut,
        paint: (ctx, r, w2) => {
          const t = st.t0 >= 0 ? cyc(w2, RIB.period, 0.4 - st.t0 / 120) : 1.5;
          const shut = t < RIB.shut;
          const open = shut ? 0 : Math.min(1, (t - RIB.shut) / 0.3) * (t > RIB.period - 0.4 ? (RIB.period - t) / 0.4 : 1);
          // the ribbon
          box(ctx, px(D - 4), FL - 18, px(5), 3, shut ? '#E63946' : '#E63946');
          // two blades meeting on the ribbon
          ctx.fillStyle = '#CFD8DC';
          ctx.save();
          ctx.translate(r.x + 12, r.y - 6);
          ctx.rotate(0.5 * open);
          ctx.fillRect(-2, 0, 4, 42);
          ctx.restore();
          ctx.save();
          ctx.translate(r.x + 12, r.y - 6);
          ctx.rotate(-0.5 * open);
          ctx.fillRect(-2, 0, 4, 42);
          ctx.restore();
          box(ctx, r.x + 8, r.y - 12, 8, 8, '#F4D35E');
        },
      }),
    );
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: -3,
        paint: (ctx) => {
          // the stadium gate: two floodlit pillars
          for (const gx of [px(D - 5), px(D + 2)]) {
            box(ctx, gx, FL - 96, 12, 96, '#2F6FB5');
            box(ctx, gx - 2, FL - 100, 16, 6, '#FFF6D8');
          }
          folk(ctx, px(D - 5) - 10, FL, 26, '#FFFFFF', { skirt: '#E9E1CF', face: 1, arm: -0.3 });
        },
      }),
    );
  },
};

export const meta10 = { family: 'finale-pads-onto-plinth', betrayals: ['pads-to-plinth'], ending: 'bbi-ribbon-snip' };
