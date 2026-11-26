// Patna's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale. Each slot below is a TODO placeholder (an empty room with a door): replace it with the stage
// from the allocation (docs/allocation.json), and set its meta. Keep `levels` a function (docs/CITY-MODULE.md).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { tourLevel, meta01 } from './s01';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage `n`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: `PAT-${String(n).padStart(2, '0')}`,
    city: 'PAT',
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
      // TODO: the mechanic's entities, a sign, the guide's lines, one collectible(w, 'pat-litti', tx, ty)
    },
  };
}

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: { family: meta01.family, betrayals: meta01.betrayals } },
  longStage({ base: todoRoom(2), par: 30, shape: 'long' }), // PAT-02 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(3), par: 30, shape: 'long' }), // PAT-03 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(4), par: 30, shape: 'long' }), // PAT-04 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(5), par: 30, shape: 'long' }), // PAT-05 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(6), par: 30, shape: 'long' }), // PAT-06 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }), // PAT-07 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // PAT-08 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // PAT-09 TODO: acts, twist (a pat-... ending), par
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // PAT-10 TODO: acts, twist (a pat-... ending), par
];
