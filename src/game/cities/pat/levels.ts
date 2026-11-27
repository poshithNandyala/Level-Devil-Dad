// Patna's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10 the
// finale. Each stage lives in its own file (s01.ts .. s10.ts) with its allocation slot as `meta`
// (docs/allocation.json). `levels` is a function (docs/CITY-MODULE.md).
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, actBhatti as act02b, meta02 } from './s02';
import { room as room03, act as act03, actLane2 as act03b, meta03 } from './s03';
import { room as room04, act as act04, actSidhi as act04b, meta04 } from './s04';
import { room as room05, act as act05, act2 as act05b, actBori, actKhokhla, meta05 } from './s05';
import { room as room06, act as act06, act2 as act06b, actGaadi, actGinti2 as act06c, meta06 } from './s06';
import { room as room07, act1 as act07a, actPul, actHaat, actMandi, act2 as act07b, meta07 } from './s07';
import { room as room08, act as act08, act2 as act08b, meta08 } from './s08';
import { room as room09, act as act09, act2 as act09b, actWapsi, meta09 } from './s09';
import { room as room10, act1 as act10a, actSetu as act10c, actStair as act10d, actBori as act10e, actGaadi as act10f, actRoll as act10g, actTempo as act10h, act2 as act10b, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02, act02b], twist: 'pat-musal', par: 35, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'pat-ghanti', par: 36, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04b, act04], twist: 'pat-bhitar', par: 51, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05, act05b, actBori, actKhokhla], twist: 'pat-nawka', par: 82, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06, act06b, act06c, actGaadi], twist: 'pat-toll', par: 82, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: [act07a, actPul, actHaat, actMandi, act07b], twist: 'pat-hauled-basket', par: 177, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08, act08b], twist: 'pat-mound', par: 13, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09, act09b, actWapsi], twist: 'pat-charkhi', par: 99, shape: 'long', lives: 'act', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10c, act10e, act10g, act10d, act10h, act10f, act10b], twist: 'pat-ginti-pad', par: 135, shape: 'long', lives: 'act', meta: meta10 }),
];
