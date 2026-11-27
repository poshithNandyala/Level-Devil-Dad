// Shillong's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + a plain door), harder each time, 10
// the finale. Each stage lives in its own file (s01.ts ..) with its allocation slot as `meta` (docs/allocation.json).
// `levels` is a function (docs/CITY-MODULE.md). Fix round 1 cut the acts QA round 1 found to be repeats or one-play
// (02 sngi and lyoh, 04 iew, 05 ar and roar, 06 sprout, 08 pull, bucket and two, 09 sngi and doh, 10 wet) and made
// every door plain; docs/cities/SHL.md and reports/cities/shl/FIX-1.md say why.
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, meta02 } from './s02';
import { room as room03, act as act03, actWet as act03b, meta03 } from './s03';
import { room as room04, actSmall as act04b, meta04 } from './s04';
import { room as room05, actBasin as act05b, meta05 } from './s05';
import { room as room06, actPole as act06b, actDouble as act06c, meta06 } from './s06';
import { room as room07, act as act07, actPool as act07b, actPlop as act07c, actKnock as act07d, actPairs as act07e, meta07 } from './s07';
import { room as room08, actRoof as act08a, meta08 } from './s08';
import { room as room09, actBlank as act09b, actMid as act09c, actHoliday as act09e, meta09 } from './s09';
import { room as room10, actMark as act10a, actFar as act10b, actKeepers as act10c, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [], twist: 'shl-dish', par: 20, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'shl-tollbar', par: 34, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04b], twist: 'shl-halfdoor', par: 14, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05b], twist: 'shl-pool', par: 22, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06c, act06b], twist: 'shl-rootdoor', par: 42, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: [act07, act07b, act07c, act07d, act07e], twist: 'shl-column', par: 68, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08a], twist: 'shl-tap', par: 32, shape: 'wtf', lives: 'act', meta: meta08 }),
  longStage({ base: room09(), acts: [act09b, act09c, act09e], twist: 'shl-board', par: 32, shape: 'long', lives: 'act', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10b, act10c], twist: 'shl-tallgate', par: 38, shape: 'long', lives: 'act', meta: meta10 }),
];
