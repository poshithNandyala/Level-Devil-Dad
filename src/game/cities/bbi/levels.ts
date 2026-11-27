// Bhubaneswar's ten stages, one per allocation slot (docs/allocation.json): 01 the welcome tour, 02-10 a room,
// its acts and a door ending each, 10 the finale (Bhubaneswar's own ideas only). `levels` stays a function
// (docs/CITY-MODULE.md): tour() and longStage() read the course, skin and endings once they are installed.
import { type LevelDef } from '../../world';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, act2 as act02b, act4 as act02d, meta02 } from './s02';
import { room as room03, act as act03, act2 as act03b, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act1 as act05a, act2 as act05b, act3 as act05c, act6 as act05f, act8 as act05h, act9 as act05i, act11 as act05k, act12 as act05l, act13 as act05m, meta05 } from './s05';
import { room as room06, act as act06, act6 as act06f, act7 as act06g, act9 as act06i, act11 as act06k, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, act8 as act07h, act11 as act07k, act12 as act07l, act13 as act07m, act9 as act07i, act10 as act07j, meta07 } from './s07';
import { room as room08, act as act08, act5 as act08e, act6 as act08f, act7 as act08g, meta08 } from './s08';
import { room as room09, act as act09, act2 as act09b, act4 as act09d, act6 as act09f, act7 as act09g, act8 as act09h, meta09 } from './s09';
import { room as room10, act1 as act10a, act2 as act10b, act3 as act10c, act4 as act10d, act5 as act10e, act6 as act10f, meta10 } from './s10';
import { longStage } from '../../levels/chunks';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02, act02b, act02d], twist: 'bbi-turf-roll', par: 35, shape: 'short', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'bbi-lantern-drop', par: 32, shape: 'short', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'bbi-curl-stair', par: 36, shape: 'short', meta: meta04 }),
  longStage({ base: room05(), acts: [act05a, act05b, act05f, act05l, act05c, act05m, act05k, act05i, act05h], twist: 'bbi-behind-step', par: 58, shape: 'wtf', meta: meta05 }),
  longStage({ base: room06(), acts: [act06, act06f, act06i, act06k, act06g], twist: 'bbi-motif-door', par: 48, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: [act07a, act07h, act07b, act07m, act07k, act07l, act07i, act07j], twist: 'bbi-pose-gate', par: 78, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08, act08f, act08g, act08e], twist: 'bbi-leaf-plate', par: 46, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09d, act09g, act09b, act09f, act09h, act09], twist: 'bbi-horse-gap', par: 74, shape: 'long', meta: meta09 }),
  longStage({ base: room10(), acts: [act10d, act10a, act10f, act10e, act10c, act10b], twist: 'bbi-ribbon-snip', par: 112, shape: 'marathon', lives: 'act', meta: meta10 }),
];
