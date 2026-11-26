// Gangtok's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale (Gangtok's own ideas only). One file per stage (s01.ts ... s10.ts).
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, act2 as act03b, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act1 as act05a, act2 as act05b, meta05 } from './s05';
import { room as room06, act as act06, act2 as act06b, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, act3 as act07c, act4 as act07d, act5 as act07e, act6 as act07f, meta07 } from './s07';
import { room as room08, act as act08, meta08 } from './s08';
import { room as room09, act as act09, meta09 } from './s09';
import { room as room10, act1 as act10a, act2 as act10b, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], twist: 'gtk-steam-vent', par: 40, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'gtk-jhola-entry', par: 45, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'gtk-lift-counts-down', par: 40, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05a, act05b], twist: 'gtk-taxi-meter', par: 60, shape: 'wtf', meta: meta05 }),
  longStage({ base: room06(), acts: [act06, act06b], twist: 'gtk-tank-overflow', par: 45, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: [act07a, act07b, act07c, act07d, act07e, act07f], twist: 'gtk-rope-climbs-to-door', par: 110, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08], twist: 'gtk-cabin-both-doors', par: 50, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09], twist: 'gtk-gate-yak-snowbank', par: 50, shape: 'long', meta: meta09 }),
  longStage({ base: room10(), acts: [act10a, act10b], twist: 'gtk-viewpoint-second-floor', par: 80, shape: 'marathon', lives: 'act', meta: meta10 }),
];
