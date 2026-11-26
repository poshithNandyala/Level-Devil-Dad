// Bhubaneswar's ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale. Each slot below is a TODO placeholder (an empty room with a door): replace it with the stage
// from the allocation (docs/allocation.json), and set its meta. Keep `levels` a function (docs/CITY-MODULE.md).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act1 as act05a, act2 as act05b, meta05 } from './s05';
import { room as room06, act as act06, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, meta07 } from './s07';
import { room as room08, act as act08, meta08 } from './s08';
import { room as room09, act as act09, meta09 } from './s09';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage `n`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: `BBI-${String(n).padStart(2, '0')}`,
    city: 'BBI',
    index: n,
    name: `TODO stage ${n}`,
    nameEn: 'TODO',
    tagline: 'TODO',
    hint: 'TODO: what kills you and how to beat it.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
      // TODO: the mechanic's entities, a sign, the guide's lines, one collectible(w, 'bbi-item', tx, ty)
    },
  };
}

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [act02], twist: 'bbi-goal-net', par: 18, shape: 'short', meta: meta02 }),
  longStage({ base: room03(), acts: [act03], twist: 'bbi-lantern-drop', par: 24, shape: 'short', meta: meta03 }),
  longStage({ base: room04(), acts: [act04], twist: 'bbi-curl-stair', par: 36, shape: 'short', meta: meta04 }),
  longStage({ base: room05(), acts: [act05a, act05b], twist: 'bbi-behind-step', par: 16, shape: 'wtf', meta: meta05 }),
  longStage({ base: room06(), acts: [act06], twist: 'bbi-motif-door', par: 24, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: [act07a, act07b], twist: 'bbi-pose-gate', par: 60, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08], twist: 'bbi-leaf-plate', par: 40, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [act09], twist: 'bbi-horse-gap', par: 40, shape: 'long', meta: meta09 }),
  longStage({ base: todoRoom(10), par: 30, shape: 'long' }), // BBI-10 TODO: acts, twist (a bbi-... ending), par
];
