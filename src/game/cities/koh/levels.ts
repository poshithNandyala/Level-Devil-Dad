// Kohima's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10 the
// finale. Built stages live in their own files (s01.ts ..) with their allocation slot as `meta` (docs/allocation.json).
// `levels` is a function (docs/CITY-MODULE.md).
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, actTeen as act02, actJhatka as act02b, meta02 } from './s02';
import { room as room03, actUlta as act03, actBhari as act03b, meta03 } from './s03';
import { room as room04, actKali as act04, actUltaDhara as act04b, meta04 } from './s04';
import { room as room05, actDui as act05a, actChadhai as act05b, meta05 } from './s05';
import { room as room06, actDhuan as act06a, actUpar as act06b, meta06 } from './s06';
import { room as room07, acts as acts07, meta07 } from './s07';
import { room as room08, actGalli as act08a, actTaar as act08b, meta08 } from './s08';
import { room as room09, actTeen as act09a, actPaanch as act09b, meta09 } from './s09';
import { room as room10, actUltaGari as act10a, actBera as act10b, actJhanda as act10c, actTutaSira as act10d, actPilla as act10e, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02, act02b], twist: 'koh-manch', par: 60, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'koh-dhila-patta', par: 60, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04, act04b], twist: 'koh-rim-lily', par: 70, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05a, act05b], twist: 'koh-rocking-drum', par: 80, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06a, act06b], twist: 'koh-skylight', par: 80, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: acts07, twist: 'koh-garage-nose', par: 170, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08a, act08b], twist: 'koh-kitchen-door', par: 60, shape: 'wtf', lives: 'act', meta: meta08 }),
  longStage({ base: room09(), acts: [act09a, act09b], twist: 'koh-pichla-dwar', par: 70, shape: 'long', lives: 'act', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10b, act10c, act10d, act10e], twist: 'koh-morung-gate', par: 90, shape: 'long', lives: 'act', meta: meta10 }),
];
