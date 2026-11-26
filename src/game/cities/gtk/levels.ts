// Gangtok's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale (Gangtok's own ideas only). One file per stage (s01.ts ... s10.ts).
import type { LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], twist: 'gtk-steam-vent', par: 40, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03], twist: 'gtk-jhola-entry', par: 36, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'gtk-lift-counts-down', par: 40, shape: 'long', meta: meta04 }),
];
