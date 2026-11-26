// Patna's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10 the
// finale. Each stage lives in its own file (s01.ts .. s10.ts) with its allocation slot as `meta`
// (docs/allocation.json). `levels` is a function (docs/CITY-MODULE.md).
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act as act05, meta05 } from './s05';
import { room as room06, act as act06, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, meta07 } from './s07';
import { room as room08, act as act08, meta08 } from './s08';
import { room as room09, act as act09, meta09 } from './s09';
import { room as room10, act1 as act10a, act2 as act10b, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], twist: 'pat-musal', par: 40, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03], twist: 'pat-ghanti', par: 45, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'pat-bhitar', par: 50, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05], twist: 'pat-nawka', par: 60, shape: 'long', meta: meta05 }),
  longStage({ base: room06(), acts: [act06], twist: 'pat-toll', par: 55, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: [act07a, act07b], twist: 'pat-hauled-basket', par: 110, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08], twist: 'pat-mound', par: 55, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09], twist: 'pat-charkhi', par: 80, shape: 'long', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10b], twist: 'pat-ginti-pad', par: 100, shape: 'long', meta: meta10 }),
];
