// Bhubaneswar's ten stages, one per allocation slot (docs/allocation.json): 01 the welcome tour, 02-10 a room,
// its acts and a door ending each, 10 the finale (Bhubaneswar's own ideas only). `levels` stays a function
// (docs/CITY-MODULE.md): tour() and longStage() read the course, skin and endings once they are installed.
import { type LevelDef } from '../../world';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, act2 as act02b, act3 as act02c, meta02 } from './s02';
import { room as room03, act as act03, act2 as act03b, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act1 as act05a, act2 as act05b, act3 as act05c, act4 as act05d, act5 as act05e, meta05 } from './s05';
import { room as room06, act as act06, act2 as act06b, act3 as act06c, act4 as act06d, act5 as act06e, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, act3 as act07c, act4 as act07d, act5 as act07e, act6 as act07f, act7 as act07g, meta07 } from './s07';
import { room as room08, act as act08, act2 as act08b, act3 as act08c, meta08 } from './s08';
import { room as room09, act as act09, act2 as act09b, act3 as act09c, act4 as act09d, act5 as act09e, meta09 } from './s09';
import { room as room10, act1 as act10a, act2 as act10b, act3 as act10c, act4 as act10d, act5 as act10e, act6 as act10f, act7 as act10g, act8 as act10h, meta10 } from './s10';
import { longStage } from '../../levels/chunks';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02, act02b, act02c], twist: 'bbi-goal-net', par: 28, shape: 'short', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'bbi-lantern-drop', par: 33, shape: 'short', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'bbi-curl-stair', par: 38, shape: 'short', meta: meta04 }),
  longStage({ base: room05(), acts: [act05a, act05b, act05d, act05c, act05e], twist: 'bbi-behind-step', par: 30, shape: 'wtf', meta: meta05 }),
  longStage({ base: room06(), acts: [act06, act06d, act06b, act06e, act06c], twist: 'bbi-motif-door', par: 54, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: [act07a, act07b, act07f, act07c, act07d, act07g, act07e], twist: 'bbi-pose-gate', par: 100, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08, act08c, act08b], twist: 'bbi-leaf-plate', par: 48, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09d, act09b, act09e, act09c, act09], twist: 'bbi-horse-gap', par: 38, shape: 'long', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10b, act10d, act10f, act10e, act10g, act10h, act10c], twist: 'bbi-ribbon-snip', par: 76, shape: 'marathon', lives: 'act', meta: meta10 }),
];
