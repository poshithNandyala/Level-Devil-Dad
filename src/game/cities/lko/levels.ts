// Lucknow's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale. Each slot below is a TODO placeholder (an empty room with a door): replace it with the stage
// from the allocation (docs/allocation.json), and set its meta. Keep `levels` a function (docs/CITY-MODULE.md).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { s02, meta02 } from './s02';
import { s03, meta03 } from './s03';
import { s04, meta04 } from './s04';
import { s05, meta05 } from './s05';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage `n`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: `LKO-${String(n).padStart(2, '0')}`,
    city: 'LKO',
    index: n,
    name: `TODO stage ${n}`,
    nameEn: 'TODO',
    tagline: 'TODO',
    hint: 'TODO: what kills you and how to beat it.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
      // TODO: the mechanic's entities, a sign, the guide's lines, one collectible
    },
  };
}

export const levels = (): LevelDef[] => [
  tour({
    id: 'LKO-01',
    city: 'LKO',
    name: 'TODO welcome',
    nameEn: 'TODO',
    tagline: 'TODO',
    lines: ['TODO | TODO', 'TODO | TODO', 'TODO | TODO', 'TODO | TODO', 'TODO | TODO', 'TODO | TODO'],
    shouts: [],
    ride: 'cart',
    item: 'lko-malai',
    signs: [],
    props: [],
    things: [],
  }),
  longStage({ base: s02.room(), acts: s02.acts, twist: 'lko-kiwad', par: 40, shape: 'short', meta: meta02 }),
  longStage({ base: s03.room(), acts: s03.acts, twist: 'lko-bakhiya', par: 40, shape: 'short', meta: meta03 }),
  longStage({ base: s04.room(), acts: s04.acts, twist: 'lko-kulhad', par: 44, shape: 'short', meta: meta04 }),
  longStage({ base: s05.room(), acts: s05.acts, twist: 'lko-sheermal', par: 60, shape: 'long', meta: meta05 }),
  longStage({ base: todoRoom(6), par: 30, shape: 'long' }), // LKO-06 TODO: acts, twist (a lko-... ending), par
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }), // LKO-07 TODO: acts, twist (a lko-... ending), par
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // LKO-08 TODO: acts, twist (a lko-... ending), par
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // LKO-09 TODO: acts, twist (a lko-... ending), par
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // LKO-10 TODO: acts, twist (a lko-... ending), par
];
