// Lucknow's ten stages: 01 the welcome tour (with Chowk's cloth bolts), 02-10 long stages (room + acts + door
// ending), harder each time, 10 the finale (only Lucknow's own ideas). Each stage lives in its own file
// (s01.ts .. s10.ts) with its allocation slot as `meta`. Keep `levels` a function (docs/CITY-MODULE.md).
import { type LevelDef } from '../../world';
import { longStage } from '../../levels/chunks';
import { s01 } from './s01';
import { s02, meta02 } from './s02';
import { s03, meta03 } from './s03';
import { s04, meta04 } from './s04';
import { s05, meta05 } from './s05';
import { s06, meta06 } from './s06';
import { s07, meta07 } from './s07';
import { s08, meta08 } from './s08';
import { s09, meta09 } from './s09';
import { s10, meta10 } from './s10';

export const levels = (): LevelDef[] => [
  s01(),
  longStage({ base: s02.room(), acts: s02.acts, twist: 'lko-kiwad', par: 27, shape: 'short', meta: meta02 }),
  longStage({ base: s03.room(), acts: s03.acts, twist: 'lko-balti', par: 33, shape: 'short', meta: meta03 }),
  longStage({ base: s04.room(), acts: s04.acts, twist: 'lko-kulhad', par: 14, shape: 'short', meta: meta04 }),
  longStage({ base: s05.room(), acts: s05.acts, twist: 'lko-sheermal', par: 56, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: s06.room(), acts: s06.acts, twist: 'lko-sam', par: 49, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: s07.room(), acts: s07.acts, twist: 'lko-darban', par: 65, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: s08.room(), acts: s08.acts, twist: 'lko-489', par: 50, shape: 'wtf', lives: 'act', meta: meta08 }),
  longStage({ base: s09.room(), acts: s09.acts, twist: 'lko-chhatri', par: 80, shape: 'long', lives: 'act', cps: [8.2, 23.3], meta: meta09 }),
  longStage({ base: s10.room(), acts: s10.acts, twist: 'lko-tehzeeb', par: 32, shape: 'long', lives: 'act', meta: meta10 }),
];
