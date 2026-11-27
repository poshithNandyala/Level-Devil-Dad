// Itanagar's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10 the
// finale. Each built stage lives in its own file (s01.ts ..) with its allocation slot as `meta` (docs/allocation.json).
// `levels` is a function (docs/CITY-MODULE.md). Slots not yet built are TODO placeholders (an empty room with a door).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act as act05, actGilahri as act05b, meta05 } from './s05';
import { room as room06, act as act06, meta06 } from './s06';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage `n`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: `ITA-${String(n).padStart(2, '0')}`,
    city: 'ITA',
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
    },
  };
}

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], twist: 'ita-phatak', par: 40, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03], twist: 'ita-baada', par: 45, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'ita-peti', par: 50, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05, act05b], twist: 'ita-khokhla', par: 80, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06], twist: 'ita-mori', par: 70, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: todoRoom(7), par: 30, shape: 'long' }), // ITA-07 TODO
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // ITA-08 TODO
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // ITA-09 TODO
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // ITA-10 TODO
];
