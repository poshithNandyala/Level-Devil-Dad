// Shillong's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door ending), harder each time, 10
// the finale. Each built stage lives in its own file (s01.ts ..) with its allocation slot as `meta`
// (docs/allocation.json). Slots not built yet are placeholders that say so. `levels` is a function (docs/CITY-MODULE.md).
import type { LevelDef, World } from '../../world';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { collectible, door, rival } from '../../levels/kit';
import { taraScript } from './common';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, actSun as act02b, meta02 } from './s02';
import { room as room03, act as act03, actWet as act03b, meta03 } from './s03';
import { room as room04, act as act04, actSmall as act04b, meta04 } from './s04';

/** a slot not built in this round: an empty room with a door, named so the tester knows (replaced by its stage file) */
function unbuilt(n: number, name: string, nameEn: string, meta: LevelDef['meta']): LevelDef {
  return {
    id: `SHL-${String(n).padStart(2, '0')}`,
    city: 'SHL',
    index: n,
    name,
    nameEn,
    tagline: 'Not built yet: next round.',
    hint: 'This stage is not built yet. Walk to the door.',
    par: 10,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    meta,
    build(w: World) {
      door(w);
      rival(w, 29, 15, -1, taraScript(n));
      collectible(w, 'shl-pumaloi', 16, 11.4);
    },
  };
}

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02, act02b], twist: 'shl-dish', par: 40, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03, act03b], twist: 'shl-tollbar', par: 45, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04, act04b], twist: 'shl-halfdoor', par: 40, shape: 'long', meta: meta04 }),
  unbuilt(5, 'Seven Sisters', 'The seven falls', { family: 'one-stream-schedule-mark', betrayals: ['hidden-schedule'], ending: 'shl-pool' }),
  unbuilt(6, 'Root Guide', 'Growing the bridge', { family: 'choose-guide-root-grows', betrayals: ['choose-grow'], ending: 'shl-root-door' }),
  unbuilt(7, 'Mawsmai', 'The growing cave', { family: 'drip-growth-gate-pairs', betrayals: ['drip-growth'], ending: 'shl-column' }),
  unbuilt(8, 'Wettest Desert', 'Sohra’s water', { family: 'tank-fills-when-not-under-rain', betrayals: ['cloud-meter'], ending: 'shl-tap' }),
  unbuilt(9, 'Eight-Day Market', 'Ïewduh', { family: 'day-cycle-rearranged-stalls', betrayals: ['day-cycle'], ending: 'shl-sold-out' }),
  unbuilt(10, 'Down Seven Hundred', 'The steps to Nongriat', { family: 'finale-cadence-bridge-day-stalls', betrayals: ['stalls-on-swaying-span'], ending: 'shl-bottom-gate' }),
];
