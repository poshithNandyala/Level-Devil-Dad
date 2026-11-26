// SVP-10 Dweep: the island, all of it, in a new order. The finale has only this city's own ideas: the saw mill and the
// deer, the croc board and its logs, the roots, the luggage hall. The twist is the deer's food carried through the mill:
// the fritter stall is on the way in, the herd follows whoever carries it, and on the carriage they lean on you from
// behind, so the saw has you. Put the food down well back from the mill, then ride the log as before. The door is the
// island's gate, with the deer asleep across the doorway.
import type { LevelDef, World } from '../../world';
import { door, rival, collectible, sign } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { lock } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L, X } from './lines';
import { px } from './kit';
import { SawHall } from './s02';
import { nala } from './s03';
import { Herd, ghat } from './s04';
import { pul } from './s09';
import { doosra } from './s07';
import { FLOOR } from '../../levels/endkit';

// ================================================================== the room: the mill, with the deer's food
export function dweepRoom(): LevelDef {
  return {
    id: 'SVP-10',
    city: 'SVP',
    index: 10,
    name: 'Dweep',
    nameEn: 'The island',
    tagline: 'Everything the island has, in the wrong order: the mill, the deer, the crocodile’s creek, the roots, the luggage. And the fritter stall is on the way in.',
    hint: 'The stall hands you a fritter as you pass, and the herd follows whoever holds food. On the log they lean on you from behind and the saw has you. Put the food down well back from the mill: stand still till it is down, and the herd stays with it. Then board the log and stay on the end you boarded, as before: it is the end that stays.',
    par: 30,
    map: Grid.ground(15).pit(10, 23).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const herd = new Herd([px(2) + 6, px(3) + 6, px(4) + 6], [{ x: px(6) + 8, used: false }], [px(10), px(24)], 99999).install(w);
      herd.hurt.on = false;
      w.flags.herd = herd;
      const hall = new SawHall(px(10), [
        { off: 72, drop: 'right' },
        { off: 48, drop: 'right' },
      ]).install(w);
      w.flags.saw = hall;
      sign(w, 7.2, 10.4, 3.4, 'DWEEP', 'shop', null, 'island');
      rival(w, 3, 15, 1, { intro: L.intro[8], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-lobster', 17.5, 11.4);
    },
  };
}

/** the island's other places, as acts of the finale: the same ideas, one after another */
export const nadi: Act = { ...nala, id: 'svp10-nadi', advice: 'The crocodile’s creek: the board’s arrow shows where it is under the logs. Cross a gap when the arrow is pointing at another one.' };
export const jadFin: Act = { ...pul, id: 'svp10-jad', advice: 'The ruined cellar: green roots hold, grey roots and brick do not, and the middle green root swings.' };
export const samanFin: Act = { ...doosra, id: 'svp10-saman', advice: 'The luggage hall: the luggage is the floor until the real call, the crowd comes from the quay end, and the trench is the place to be.' };

export const ghatFin: Act = { ...ghat, id: 'svp10-ghat', advice: 'The last landing: the stall is by the edge, the herd follows the food, and the boat is late. Put the food down where you are and wait for the boat.' };

// ================================================================== the door: the island’s gate
export const dweepGate: Ending = {
  space: 16,
  advice: 'The island’s gate, and the herd asleep across the doorway. The last fritter stall is on the way in: take it, and the herd is up and after you. Put it down well back from the gate, stand still till it is down, and then the gate is yours.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const lk = lock(w, d, X.deer);
    const herd = new Herd([px(D - 2) + 6, px(D - 1) + 6, px(D) + 10], [{ x: px(D - 10) + 8, used: false }], [px(D + 30), px(D + 31)], px(D - 4)).install(w);
    herd.hurt.on = false;
    w.flags.guard = herd;
    w.flags.twist = 'gate';
    w.onTick((w2) => {
      if (!herd.carrying && herd.stalls[0].used && !lk.open) {
        lk.unlock();
        w2.flags.twist = 'open';
      }
    });
    void FLOOR;
  },
};
