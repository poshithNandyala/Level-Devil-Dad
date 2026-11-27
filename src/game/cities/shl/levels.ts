// Shillong's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10
// the finale. Each built stage lives in its own file (s01.ts ..) with its allocation slot as `meta`
// (docs/allocation.json). `levels` is a function (docs/CITY-MODULE.md).
import type { LevelDef, World } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, actSun as act02b, meta02 } from './s02';
import { room as room03, act as act03, actWet as act03b, meta03 } from './s03';
import { room as room04, act as act04, actSmall as act04b, meta04 } from './s04';
import { room as room05, act as act05, actBasin as act05b, actRoar as act05c, meta05 } from './s05';
import { room as room06, act as act06, actPole as act06b, actDouble as act06c, meta06 } from './s06';
import { room as room07, act as act07, actPool as act07b, actPlop as act07c, actKnock as act07d, actPairs as act07e, meta07 } from './s07';
import { room as room08, actRoof as act08a, actPull as act08b, actBucket as act08c, actTwo as act08d, meta08 } from './s08';
import { room as room09, actTwo as act09a, actBlank as act09b, actMid as act09c, actPack as act09d, meta09 } from './s09';
import { room as room10, actMark as act10a, actFar as act10b, actSpan as act10c, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02, act02b], twist: 'shl-dish', par: 46, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'shl-tollbar', par: 34, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04, act04b], twist: 'shl-halfdoor', par: 17, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05, act05b, act05c], twist: 'shl-pool', par: 42, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06, act06c, act06b], twist: 'shl-rootdoor', par: 48, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: [act07, act07b, act07c, act07d, act07e], twist: 'shl-column', par: 68, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08a, act08b, act08c, act08d], twist: 'shl-tap', par: 93, shape: 'wtf', lives: 'act', meta: meta08 }),
  longStage({ base: room09(), acts: [act09a, act09b, act09c, act09d], twist: 'shl-board', par: 30, shape: 'long', lives: 'act', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10b, act10c], twist: 'shl-tallgate', par: 33, shape: 'long', lives: 'act', meta: meta10 }),
];
