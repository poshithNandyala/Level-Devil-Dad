// SVP-10 Dweep: the island, all of it, in a new order. The finale has only this city's own ideas: the saw mill and the
// deer, the croc board and its logs, the roots, the luggage hall. The twist is the deer's food carried through the mill:
// the fritter stall is on the way in, the herd follows whoever carries it, and on the carriage they lean on you from
// behind, so the saw has you. Put the food down well back from the mill, then ride the log as before. The door is the
// island's gate, with the deer asleep across the doorway.
import type { LevelDef, World } from '../../world';
import { door, rival, collectible, sign } from '../../levels/kit';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { lock, Paint, text } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { lines as L, X } from './lines';
import { px } from './kit';
import { SawHall } from './s02';
import { nala, buildNala } from './s03';
import { Herd, ghatTied } from './s04';
import { jadBreak } from './s09';
import { nali, buildNali } from './nali';
import { FLOOR } from '../../levels/endkit';

// ================================================================== the room: the mill, with the deer's food
export function dweepRoom(): LevelDef {
  return {
    id: 'SVP-10',
    city: 'SVP',
    index: 10,
    name: 'Dweep',
    nameEn: 'The island',
    tagline: 'Everything the island has, in the wrong order: the mill, the creek, the roots, the luggage. The fritter stall is on the way in.',
    hint: 'The stall hands you a fritter as you pass, and the herd follows whoever holds food. On the log they lean on you from behind and push you into the saw or the mud. Put the food down well back from the mill: stand still till it is down, and the herd stays with it. Then board the log, and this time do not stay on the end you boarded: tonight the saw takes that end first, and the far end is the one that stays.',
    par: 30,
    map: Grid.ground(15).pit(10, 23).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const herd = new Herd([px(2) + 6, px(3) + 6, px(4) + 6], [{ x: px(6) + 8, used: false }], [px(10), px(24)], 99999).install(w);
      herd.hurt.on = false;
      w.flags.herd = herd;
      // tonight the saw takes the boarding end first, and the end that stays is the far one
      const hall = new SawHall(px(10), [
        { off: 40, drop: 'left' },
        { off: 64, drop: 'left' },
      ], true, 70).install(w);
      w.flags.saw = hall;
      // the herd leaning on you from behind is what the death line should name
      let leanedOnLog = false;
      w.onTick((w2) => {
        if (w2.tick === herd.lastNudge && w2.player.cx > px(10)) leanedOnLog = true;
        const leaned = leanedOnLog;
        hall.blade.cause = leaned ? 'svp-hiran4' : 'svp-aari';
        hall.mud.cause = leaned ? 'svp-hiran4' : 'svp-kichad';
      });
      sign(w, 7.2, 10.4, 3.4, 'DWEEP', 'shop', null, 'island');
      rival(w, 3, 15, 1, { intro: L.intro[8], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'svp-lobster', 17.5, 11.4);
    },
  };
}

/** the island's other places, as acts of the finale: the same ideas, one after another */
export const nadi: Act = { ...nala, id: 'svp10-nadi', advice: 'The crocodile’s creek again, and the board has been left as it was: nobody has turned its arrow since the crocodile moved. Look at the water instead: the ripples are where the crocodile is. And a crocodile that lies still leaves no ripples, only its eyes.', build: (w, c) => buildNala(w, c.x, true) };
export const jadFin: Act = jadBreak;

export const naliFin: Act = {
  ...nali,
  id: 'svp10-nali',
  advice: 'The reef at the island’s edge, and the sea walk has turned round: tonight the hose is fed the other way, and a bend over an arch costs the line while under it is free. Walk under every arch. The old way, over the top, runs the hose out.',
  build: (w, c) => buildNali(w, c.x, true),
};

export const ghatFin: Act = ghatTied;

// ================================================================== the door: the island’s gate
export const dweepGate: Ending = {
  space: 16,
  advice: 'The island’s gate, and tonight the guard is hungry: the deer are tied up by the doorway, and the last fritter stall is on the way in. Take the fritter, and this time it is the guard who wants it: carry it to his counter and stand still there till it is down. Put down anywhere else, as the first jetty taught, and the gate stays shut.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const lk = lock(w, d, 'Khaana meri mez par rakho! | Put the food on my counter!');
    const counter = px(D - 4) + 8;
    const herd = new Herd([px(D - 2) + 6, px(D - 1) + 6, px(D) + 10], [{ x: px(D - 10) + 8, used: false }], [px(D + 30), px(D + 31)], px(D - 4), 'svp-hiran3', true).install(w);
    herd.hurt.on = false;
    w.flags.guard = herd;
    w.flags.counter = counter;
    w.flags.twist = 'gate';
    w.onTick((w2) => {
      // the food is on his counter: he eats, and the gate opens
      if (!herd.carrying && herd.food !== null && Math.abs(herd.food - counter) < 26 && !lk.open) {
        lk.unlock();
        w2.flags.twist = 'open';
      }
    });
    w.add(
      new Paint((ctx) => {
        // the guard's counter: a table with a tin plate and a little bell
        ctx.fillStyle = '#6B4A34';
        ctx.fillRect(counter - 14, FLOOR - 14, 28, 3);
        ctx.fillRect(counter - 12, FLOOR - 11, 3, 11);
        ctx.fillRect(counter + 9, FLOOR - 11, 3, 11);
        ctx.fillStyle = '#C9D2D6';
        ctx.fillRect(counter - 6, FLOOR - 17, 12, 3);
        text(ctx, 'GUARD', counter, FLOOR - 24, 5.5, '#8A1F14', '');
      }, -2),
    );
  },
};
