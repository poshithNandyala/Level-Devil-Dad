// Thiruvananthapuram's encore stages: TVM-09 Kovalam Flags and TVM-10 Dhara.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Act } from '../../levels/acts';
import { lines as L } from './lines';
import { collectible, prop, px, rival, sign } from '../../levels/kit';
import { Grid } from '../../levels/grid';
import { onPass } from '../../levels/trolls';
import { tara as taraSays } from '../../levels/endkit';
import { Surf } from './kovalam';
import { Dhara, Droni } from './dhara';
import { Tarp } from './entities';
import { coconut, drop } from './levels';

const meta = (family: string, betrayals: string[], ending: string): StageMeta => ({ family, betrayals, ending });
const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[n % L.beaten.length] });
/** a surf's flags, for the tests and the guide */
export const surfOf = (w: World, name: string) => w.entities.find((e) => e instanceof Surf && e.name === name) as Surf | undefined;

// ================================================================== TVM-09: Kovalam Flags
export const KOVALAM_META = meta('flag-strip-shifts', ['strip-shift'], 'tvm-backwash-ride');

/** Hawa beach: the flags stand ahead of you; he moves them on, and on again */
export function kovalamRoom(): LevelDef {
  return {
    id: 'TVM-09',
    city: 'TVM',
    index: 9,
    name: 'Kovalam Flags',
    nameEn: 'Swim between the flags',
    tagline: 'On Kovalam beach the lifeguard plants two flags: between them the sand is safe. He moves them before every wave.',
    hint: 'When a wave runs in, only the sand between the two flags stays dry: anywhere else the drift takes you. The lifeguard whistles and carries the flags somewhere new before each wave, so the strip you stood in is the drift next time. Watch where he plants them and stand there, and go with him again at the next whistle.',
    par: 70,
    map: Grid.ground(15).fill(28, 31, 14, 14, '#').put(1, 14, '@').put(30, 13, 'E').rows(),
    build(w: World) {
      const s = w.add(
        new Surf({
          name: 'hawa',
          x0: 3,
          x1: 28,
          strip: 7,
          waves: [
            { at: 8.5, moves: [{ to: 15, sec: 0.9 }], inAt: 2.3, inFor: 2.0 },
            { moves: [{ to: 22, sec: 0.8 }], inAt: 2.2, inFor: 2.0 },
          ],
        }),
      );
      sign(w, 0.3, 10.4, 3.4, 'KOVALAM', 'green', null, 'swim between the flags');
      rival(w, 5, 15, 1, tara(8));
      onPass(w, px(2), (w2) => w2.guide('Flag-inte idayil maathram nilkkuka. | Only stand between the flags.'));
      // Tara, as the second whistle goes: stay where you are (the flags are already on their way)
      w.when(
        () => s.i === 1 && s.state === 'walk',
        (w2) => taraSays(w2, 'Avide thanne nilkku, Dad! Safe aanu! | Stay right there, Dad! It’s safe!', 1.6),
      );
      // the guide only says what's true now: once he has planted them
      w.when(
        () => s.i === 1 && s.state === 'rise',
        (w2) => w2.guide('Flag ippo avide aanu. | The flags are over there now.', () => s.i === 1 && s.state !== 'calm'),
      );
      collectible(w, 'chaaya', 11.5, 11.4);
    },
  };
}

/** Lighthouse beach: this time he carries the flags back, behind you; then far on, past a rock pool */
export const vilakku: Act = {
  id: 'tvm09-vilakku',
  w: 40,
  cps: [38.5],
  advice: 'At the lighthouse he carries the flags back behind you: turn round and follow him. Next time he runs them far ahead, past the rock pool: hop it and get between them.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#').fill(x + 37, x + 39, 14, 14, '#').pit(x + 22, x + 23);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(
      new Surf({
        name: 'vilakku',
        x0: x + 3,
        x1: x + 37,
        strip: x + 12,
        waves: [
          { at: x + 10, moves: [{ to: x + 4, sec: 1.0 }], inAt: 2.5, inFor: 2.0 },
          { at: x + 18, moves: [{ to: x + 27, sec: 1.2 }], inAt: 2.6, inFor: 2.0 },
        ],
      }),
    );
    sign(w, (c.X(1) + 0) / 16, 10.6, 3.2, 'LIGHTHOUSE', 'green', null, 'beach');
  },
};

/** Samudra beach: he plants them, looks back, and carries them back again; then a long run on */
export const samudra: Act = {
  id: 'tvm09-samudra',
  w: 34,
  cps: [33.0],
  advice: 'At Samudra beach he plants the flags ahead, thinks again and brings them back: stay with the flags till he stops, not where he first put them. Then he runs them a long way on: go at once.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#').fill(x + 31, x + 33, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const s = w.add(
      new Surf({
        name: 'samudra',
        x0: x + 3,
        x1: x + 31,
        strip: x + 7,
        waves: [
          { at: x + 4.5, moves: [{ to: x + 15, sec: 0.8 }, { to: x + 8, sec: 0.8 }], inAt: 2.9, inFor: 2.0 },
          { moves: [{ to: x + 24, sec: 1.3 }], inAt: 2.8, inFor: 2.0 },
        ],
      }),
    );
    // Tara: where he planted first is where she sends you
    w.when(
      () => s.i === 0 && s.state === 'walk' && s.strip >= px(x + 14.9),
      (w2) => taraSays(w2, 'Avide plant cheythu! Odu! | He planted them there! Run!', 1.4),
    );
  },
};

// ================================================================== TVM-10: Dhara
export const DHARA_META = meta('pendulum-oil-slick', ['offset-swing'], 'tvm-oily-feet-coir-mat');

/**
 * The treatment hall: dhara pots swing from the beam, each hung on a crooked arm, so the oil they drip at the
 * middle of the swing lands beside the hook, not under it. Oil on the floor: step on it and your feet go.
 * The wooden droni (the oil trough) is where you slide to.
 */
export function dharaRoom(): LevelDef {
  return {
    id: 'TVM-10',
    city: 'TVM',
    index: 10,
    name: 'Dhara',
    nameEn: 'The oil pot',
    tagline: 'An Ayurveda hall: a pot of warm oil swings over each bed and drips as it goes. The pots hang off-centre.',
    hint: 'Step on oil and your feet go: you slide on your back and can’t jump till you stop. The pots hang on crooked arms, so the oil lands where the pot is at the middle of its swing, not under the hook: watch the drops, not the hook. Jump the troughs from before the oil, and over the oil on the far side too.',
    par: 60,
    map: Grid.ground(15).pit(10, 11).pit(19, 20).pit(25, 26).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      // pot 1: hook over the far side of the first trough, the arm crooked back: the oil is at the take-off
      w.add(new Dhara({ hookTx: 12.5, offTx: -3, slick: [9, 10], ty: 8 }));
      w.add(new Droni(10, 12, 'tvm-droni'));
      // pot 2: hook over the second trough, the arm crooked forward: the oil is where a long jump lands,
      // just before the big kindi (the copper oil vessel) let into the floor
      w.add(new Dhara({ hookTx: 20, offTx: 4.2, slick: [23.6, 24.9], ty: 8 }));
      w.add(new Droni(19, 21, 'tvm-droni'));
      w.add(new Droni(25, 27, 'tvm-kindi'));
      sign(w, 0.3, 10.4, 3.4, 'VAIDYASALA', 'green', null, 'dhara');
      rival(w, 5, 15, 1, tara(9));
      onPass(w, px(2), (w2) => w2.guide('Ennayil chavittaruthu. | Don’t step in the oil.'));
      collectible(w, 'chaaya', 15.5, 10.4);
    },
  };
}

/** TVM-10 act: the courtyard, the city's own ideas in a new order. The stall tarp from the welcome tour is full
 *  of rain over the oil (its rain washes the oil away), then a pot drips beside a coconut palm (TVM-04): slide on
 *  its oil and you come to rest under the palm. */
export const kizhi: Act = {
  id: 'tvm10-kizhi',
  w: 34,
  cps: [16.5],
  advice: 'In the courtyard a tarp full of rain hangs over the oil: stop short of it and let it empty. Its rain washes the oil off the edge of the trough, so jump from there. Then hop over the oil by the palm: slide on it and you stop right under the coconuts.',
  paint: (g, c) => {
    g.pit(c.x + 11, c.x + 12);
  },
  build: (w, c) => {
    const x = c.x;
    const pot = w.add(new Dhara({ hookTx: x + 13.5, offTx: -3, slick: [x + 10, x + 11], ty: 8 }));
    w.add(new Droni(x + 11, x + 13, 'tvm-droni'));
    const tarp = w.add(new Tarp({ tx0: x + 8, tx1: x + 11, ty: 11, groundTy: 15, drop: [x + 8.2, x + 11], triggerTx: x + 5 }));
    w.when(
      () => tarp.state === 'dump',
      (w2) => pot.wash(w2),
    );
    w.add(new Dhara({ hookTx: x + 17, offTx: 3, slick: [x + 19.5, x + 20.5], ty: 8 }));
    prop(w, 'palm', x + 21.5, 15, { h: 84, lean: -4 });
    const nut = coconut(w, px(x + 21.2), px(9));
    // a coconut for whoever comes to rest under the palm
    w.when(
      (w2) => w2.player.onGround && Math.abs(w2.player.vx) < 30 && w2.player.cx > px(x + 20.6) && w2.player.cx < px(x + 22.6),
      (w2) => drop(w2, nut, { shake: 0.1, v0: 60, land: false }),
    );
    w.flags.kizhi = { tarp, pot };
  },
};
