// Kohima's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10 the
// finale. Built stages live in their own files (s01.ts ..) with their allocation slot as `meta` (docs/allocation.json).
// Slots 06-10 are still the scaffold's placeholder rooms (round 1 ran out of budget there: see
// reports/cities/koh/BUILD.md); `levels` is a function (docs/CITY-MODULE.md).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { tourLevel, meta01 } from './s01';
import { room as room02, actTeen as act02, meta02 } from './s02';
import { room as room03, actUlta as act03, meta03 } from './s03';
import { room as room04, actKali as act04, meta04 } from './s04';
import { room as room05, actDui as act05a, actChadhai as act05b, meta05 } from './s05';
import { room as room06, actDhuan as act06a, actUpar as act06b, meta06 } from './s06';
import { room as room07, acts as acts07, meta07 } from './s07';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage `n`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: `KOH-${String(n).padStart(2, '0')}`,
    city: 'KOH',
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
      // TODO: the mechanic's entities, a sign, the guide's lines, one collectible(w, 'koh-item', tx, ty)
    },
  };
}

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], twist: 'koh-manch', par: 48, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03], twist: 'koh-dhila-patta', par: 46, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'koh-rim-lily', par: 55, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05a, act05b], twist: 'koh-rocking-drum', par: 80, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06a, act06b], twist: 'koh-skylight', par: 80, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: acts07, twist: 'koh-garage-nose', par: 170, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: todoRoom(8), par: 30, shape: 'long' }), // KOH-08 TODO: acts, twist (a koh-... ending), par
  longStage({ base: todoRoom(9), par: 30, shape: 'long' }), // KOH-09 TODO: acts, twist (a koh-... ending), par
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // KOH-10 TODO: acts, twist (a koh-... ending), par
];
