// Itanagar's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door), harder each time, 10 the
// finale. Each built stage lives in its own file (s01.ts ..) with its allocation slot as `meta` (docs/allocation.json).
// `levels` is a function (docs/CITY-MODULE.md).
// Doors: every door was checked like an act against the registry (reports/cities/ita/BUILD.md). Only 04's packing
// shed (the rope's shadow slides to the next landing spot) is an idea of its own; the other eight doors are PLAIN:
// the road ends at the door, walk in. Their earlier door twists were the stage's own rule again or a shipped thought.
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act as act05, actGilahri as act05b, meta05 } from './s05';
import { room as room06, act as act06, meta06 } from './s06';
import { room as room07, act as act07, actBarf as act07b, meta07 } from './s07';
import { room as room08, act as act08, meta08 } from './s08';
import { room as room09, act as act09, meta09 } from './s09';
import { room as room10, actPul, actMehraab, actMori, actTokri, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], par: 40, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03], par: 45, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'ita-peti', par: 50, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05, act05b], par: 80, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06], par: 70, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: [act07, act07b], par: 150, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08], par: 30, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09], par: 60, shape: 'long', lives: 'act', meta: meta09 }),
  longStage({ base: room10(), acts: [actPul, actMehraab, actMori, actTokri], par: 37, shape: 'long', lives: 'act', meta: meta10 }),
];
