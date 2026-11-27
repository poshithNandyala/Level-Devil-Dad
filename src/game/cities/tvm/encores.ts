// Thiruvananthapuram's encore stages: TVM-09 Kovalam Flags and TVM-10 Dhara.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Act } from '../../levels/acts';
import { lines as L } from './lines';
import { collectible, group, prop, px, rival, sign } from '../../levels/kit';
import { Grid } from '../../levels/grid';
import { onPass } from '../../levels/trolls';
import { tara as taraSays } from '../../levels/endkit';
import { Surf } from './kovalam';
import { Dhara, Droni } from './dhara';
import { IceSlab, Launch, Tarp } from './entities';
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
            { at: 5.5, moves: [{ to: 15, sec: 0.9 }], inAt: 2.2, inFor: 1.2 },
            { moves: [{ to: 22, sec: 0.8 }], inAt: 2.2, inFor: 1.2 },
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
      collectible(w, 'tvm-chaaya', 11.5, 11.4);
    },
  };
}

/** Lighthouse beach: this time he carries the flags back, behind you; then far on, past a rock pool */
export const vilakku: Act = {
  id: 'tvm09-vilakku',
  w: 40,
  cps: [14],
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
  cps: [10.4],
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
          { at: x + 4.5, moves: [{ to: x + 15, sec: 0.8 }, { to: x + 7, sec: 0.8 }], inAt: 2.7, inFor: 2.0 },
          { at: x + 14.2, moves: [{ to: x + 24, sec: 1.1 }], inAt: 2.6, inFor: 2.0 },
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

/** Ashoka beach: he whistles and doesn't move the flags at all; then he does, a long way */
export const ashoka: Act = {
  id: 'tvm09-ashoka',
  w: 30,
  advice: 'At Ashoka beach he whistles and paces, but plants the flags right back where they were: stay put. At the next whistle he does carry them on.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#').fill(x + 27, x + 29, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const s = w.add(
      new Surf({
        name: 'ashoka',
        x0: x + 3,
        x1: x + 27,
        strip: x + 5,
        waves: [
          { at: x + 5, moves: [{ to: x + 9, sec: 0.5 }, { to: x + 5, sec: 0.5 }], inAt: 2.0, inFor: 1.2 },
          { moves: [{ to: x + 18, sec: 1.1 }], inAt: 2.5, inFor: 1.2 },
        ],
      }),
    );
    w.when(
      () => s.i === 0 && s.state === 'walk' && s.strip >= px(x + 8.9),
      (w2) => taraSays(w2, 'Pinnaale po! | Follow him!', 1.2),
    );
  },
};

/** Pozhikkara: he runs the flags far on past a rock pool, then brings them back over it */
export const pozhikkara: Act = {
  id: 'tvm09-pozhikkara',
  w: 32,
  cps: [23.4],
  advice: 'At Pozhikkara he runs the flags far on, past a rock pool: hop it and get between them. Head on, and at the next whistle he carries them back over the pool: hop it again, the other way.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#').fill(x + 29, x + 31, 14, 14, '#').pit(x + 13, x + 14);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(
      new Surf({
        name: 'pozhikkara',
        x0: x + 3,
        x1: x + 29,
        strip: x + 6,
        waves: [
          { at: x + 6.5, moves: [{ to: x + 20, sec: 1.3 }], inAt: 2.7, inFor: 2.0 },
          { at: x + 27, moves: [{ to: x + 7, sec: 1.3 }], inAt: 3.0, inFor: 2.0 },
        ],
      }),
    );
  },
};

// ================================================================== TVM-10: Dhara
/** TVM-10 act: Shankumugham shore, Kovalam's flags again, and the way to them is the trap: between you and the new
 *  strip lies the monsoon-soaked sand of the welcome tour's road (TVM-01). It looks like the rip, so you want to jump
 *  it, and soaked ground holds a walker and breaks under a hop. Walk it. */
export const theeram: Act = {
  id: 'tvm10-theeram',
  w: 36,
  cps: [23.6, 28.6],
  advice: 'On the shore the lifeguard runs the flags far on, and between you and them lies dark, soaked sand. It is not the rip: soaked ground holds a walker and gives way under a hop. Walk across it to the flags, and back across it when he brings them back. The last time he plants them on the soaked sand itself: stand there, it holds you.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#').fill(x + 33, x + 35, 14, 14, '#').fill(x + 11, x + 18, 15, 17, c.L[0]);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(
      new Surf({
        name: 'theeram',
        x0: x + 3,
        x1: x + 33,
        strip: x + 6,
        waves: [
          { at: x + 7, moves: [{ to: x + 20, sec: 1.4 }], inAt: 3.0, inFor: 2.6 },
          { at: x + 27.5, moves: [{ to: x + 6, sec: 1.6 }], inAt: 3.2, inFor: 2.6 },
          { at: x + 32.2, moves: [{ to: x + 13, sec: 1.4 }], inAt: 3.0, inFor: 2.6 },
        ],
      }),
    );
    const soaked = group(w, c.L[0]);
    soaked.paint = { fill: '#3E2A1C', trim: '#5B4630', line: 'rgba(24,58,70,0.55)' };
    w.when(
      (w2) => (w2.player.jumpTick === w2.tick || (w2.player.landTick === w2.tick && w2.tick > 1)) && w2.player.cx >= px(x + 10.4) && w2.player.cx < px(x + 18.8) && w2.player.y + w2.player.h <= px(15) + 1,
      (w2) => {
        w2.sfx('crack', px(x + 15), px(15));
        soaked.fall(w2, { delay: 0.1, g: 2400 });
      },
    );
    w.add(new Droni(x + 11, x + 19, 'tvm-soaked', 'none'));
    w.flags.soaked = soaked;
  },
};

/** TVM-10 act: Chalai market, the tour's fish ice over the drain, and oil past it before a kindi */
export const chanda: Act = {
  id: 'tvm10-chanda',
  w: 30,
  cps: [3.5],
  advice: 'At Chalai market the fish ice over the drain moves twice again: wait for the yank, then a long jump on to it. Past it there is oil and a kindi: jump both from the ice.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 8, x + 13).pit(x + 15, x + 16);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new IceSlab(x + 8, 2, x + 6.6));
    w.add(new Droni(x + 8, x + 14, 'tvm-chaal', 'drain'));
    w.add(new Dhara({ hookTx: x + 17, offTx: -2.4, slick: [x + 14, x + 15], ty: 8 }));
    w.add(new Droni(x + 15, x + 17, 'tvm-kindi'));
  },
};

/** TVM-10 act: Kovalam again, under the palms (TVM-04): the new strip has a coconut palm over it, and a coconut
 *  drops on whoever stands still under a palm. Stand in the part of the strip clear of the crown. */
export const kadappuram: Act = {
  id: 'tvm10-kadappuram',
  w: 36,
  cps: [17, 26.4, 33.5],
  advice: 'On the beach the flags move before every wave, and this time a coconut palm leans over the new strip: whoever stands still under it gets a coconut. Stand in the flags, clear of the crown. Then he carries them back, then far on, then a little way back.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    const s = w.add(
      new Surf({
        name: 'kadappuram',
        x0: x + 3,
        x1: x + 33,
        strip: x + 4,
        waves: [
          { at: x + 6.5, moves: [{ to: x + 12, sec: 0.9 }], inAt: 2.2, inFor: 1.2 },
          { moves: [{ to: x + 5, sec: 1.0 }], inAt: 2.0, inFor: 1.2 },
          { at: x + 21, moves: [{ to: x + 24, sec: 0.6 }], inAt: 2.6, inFor: 2.6 },
          { at: x + 30.2, moves: [{ to: x + 18, sec: 1.1 }], inAt: 2.8, inFor: 2.6 },
        ],
      }),
    );
    prop(w, 'palm', x + 15, 15, { h: 84, lean: -6 });
    const nut = coconut(w, px(x + 13.8), px(9));
    w.when(
      // (only while he has the flags under it: once that wave is out, the crown holds its last nut)
      (w2) => s.i === 0 && s.state !== 'calm' && w2.player.onGround && Math.abs(w2.player.vx) < 30 && w2.player.cx > px(x + 13.5) && w2.player.cx < px(x + 16.4),
      (w2) => drop(w2, nut, { shake: 0.1, v0: 60, land: false }),
    );
    w.when(
      () => s.i === 0 && s.state === 'rise',
      (w2) => taraSays(w2, 'Thanalil nilkku, Dad! | Stand in the shade, Dad!', 1.4),
    );
  },
};

/** TVM-10 act: the stall's tarp from the welcome tour, over the new strip: let it empty before you step in */
export const thira: Act = {
  id: 'tvm10-thira',
  w: 34,
  cps: [14.6, 25.4, 32.5],
  advice: 'He plants the flags under a stall tarp full of rain: step up to it, back off and let it empty, then get between the flags before the wave. Then he carries them on, and back again.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 2, 14, 14, '#').fill(x + 31, x + 33, 14, 14, '#');
  },
  build: (w, c) => {
    const x = c.x;
    w.add(
      new Surf({
        name: 'thira',
        x0: x + 3,
        x1: x + 31,
        strip: x + 4,
        waves: [
          { at: x + 7, moves: [{ to: x + 12, sec: 0.9 }], inAt: 3.2, inFor: 2.6 },
          { at: x + 18.5, moves: [{ to: x + 22, sec: 0.8 }], inAt: 2.6, inFor: 2.6 },
          { at: x + 29, moves: [{ to: x + 16, sec: 1.0 }], inAt: 2.8, inFor: 2.6 },
        ],
      }),
    );
    w.flags.thiraTarp = w.add(new Tarp({ tx0: x + 12, tx1: x + 15.6, ty: 11, groundTy: 15, drop: [x + 12.2, x + 15.4], triggerTx: x + 10.8 }));
  },
};

/** TVM-10 act: Thumba again (the welcome tour's two-stage rocket), on flat ground this time: it goes as you pass
 *  the gate, the booster comes down just ahead and the last stage where you'd stop short of the fire. Stop at once. */
export const thumba: Act = {
  id: 'tvm10-thumba',
  w: 30,
  advice: 'At Thumba the rocket goes as you pass the gate: stop at once. The booster comes down just ahead of you and the last stage further on, where you would wait for the fire to die. Once both are down, hop them and go.',
  build: (w, c) => {
    const x = c.x;
    const rocket = Launch.place(w, { tx: x + 21, groundTy: 15, blast: [x + 18, x + 24], blastSec: 2.4, stageTx: x + 13, sepAt: 1.7, boosters: [{ tx: x + 8, sepAt: 0.9 }] });
    onPass(w, px(x + 6), (w2) => rocket.fire(w2));
    sign(w, x + 4, 10.6, 3, 'THUMBA', 'green', null, 'launch station');
    w.flags.thumba = rocket;
  },
};

/** TVM-10's second act: the treatment rooms in a row, the pots in the order the room taught them backwards */
export const uzhichil: Act = {
  id: 'tvm10-uzhichil',
  w: 26,
  advice: 'In the treatment rooms the pots come the other way round: a short hop over the first trough (its oil is where a long jump lands, before the kindi), a long jump over the oil and the kindi, then the oil at the edge of the last trough: jump from before it.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 5, x + 6).pit(x + 11, x + 12).pit(x + 18, x + 19);
  },
  build: (w, c) => {
    const x = c.x;
    w.add(new Droni(x + 5, x + 7, 'tvm-droni'));
    w.add(new Dhara({ hookTx: x + 6, offTx: 4.2, slick: [x + 9.6, x + 10.9], ty: 8 }));
    w.add(new Droni(x + 11, x + 13, 'tvm-kindi'));
    w.add(new Dhara({ hookTx: x + 20.5, offTx: -3, slick: [x + 17, x + 18], ty: 8 }));
    w.add(new Droni(x + 18, x + 20, 'tvm-droni'));
  },
};

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
      collectible(w, 'tvm-chaaya', 15.5, 10.4);
    },
  };
}

/** TVM-10 act: the courtyard, the city's own ideas in a new order. The stall tarp from the welcome tour is full
 *  of rain over the oil (its rain washes the oil away), then a pot drips beside a coconut palm (TVM-04): slide on
 *  its oil and you come to rest under the palm. */
export const kizhi: Act = {
  id: 'tvm10-kizhi',
  w: 34,
  cps: [14.6],
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
