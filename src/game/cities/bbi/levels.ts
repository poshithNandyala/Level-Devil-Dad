// Bhubaneswar's ten stages, one per allocation slot (docs/allocation.json): 01 the welcome tour, 02-10 a room,
// its acts and a door ending each, 10 the finale (Bhubaneswar's own ideas only). `levels` stays a function
// (docs/CITY-MODULE.md): tour() and longStage() read the course, skin and endings once they are installed.
import { type LevelDef } from '../../world';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, act2 as act02b, act4 as act02d, meta02 } from './s02';
import { room as room03, act as act03, act2 as act03b, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act1 as act05a, act2 as act05b, act3 as act05c, act6 as act05f, act8 as act05h, act9 as act05i, act11 as act05k, act12 as act05l, act13 as act05m, act14 as act05n, act15 as act05o, meta05 } from './s05';
import { room as room06, act as act06, act6 as act06f, act7 as act06g, act9 as act06i, act11 as act06k, act12 as act06l, act13 as act06m, meta06 } from './s06';
import { room as room07, act1 as act07a, act2 as act07b, act8 as act07h, act11 as act07k, act12 as act07l, act13 as act07m, act15 as act07o, act16 as act07p, act17 as act07q, act18 as act07r, act19 as act07s, act20 as act07t, act21 as act07u, act9 as act07i, act10 as act07j, meta07 } from './s07';
import { room as room08, act5 as act08e, act6 as act08f, act7 as act08g, act8 as act08h, act9 as act08i, meta08 } from './s08';
import { room as room09, act as act09, act2 as act09b, act4 as act09d, act6 as act09f, act7 as act09g, act8 as act09h, meta09 } from './s09';
import { room as room10, act1 as act10a, act2 as act10b, act3 as act10c, act4 as act10d, act5 as act10e, act6 as act10f, act7 as act10g, act8 as act10h, act9 as act10i, act10 as act10j, act11 as act10k, act12 as act10l, act13 as act10m, act14 as act10n, act15 as act10o, act16 as act10p, act17 as act10q, meta10 } from './s10';
import { longStage } from '../../levels/chunks';
import type { Act, ActCtx } from '../../levels/acts';

/** plain ground added before an act, so its first checkpoint (at the act's first column) is a calm place to come
 *  back to: at least 4.5 tiles from its first pit and from anything moving (tests/cpsafe.test.ts) */
export const LEAD: Record<string, number> = {
  'bbi02-chhal': 4, 'bbi06-tana': 4, 'bbi06-sidhi': 4, 'bbi03-gali': 4, 'bbi03-mela': 4, 'bbi05-thaka': 4, 'bbi05-bail': 4, 'bbi06-sutra': 4, 'bbi06-rachh': 4, 'bbi06-tantu': 4, 'bbi06-palaa': 4, 'bbi08-phinga': 4, 'bbi08-ghurni': 4, 'bbi07-ghungur': 4, 'bbi07-kachha': 4, 'bbi07-pothi': 4, 'bbi10-ghungur': 4, 'bbi10-phinga': 4, 'bbi10-tantu': 4, 'bbi10-chakra': 4, 'bbi10-palaa': 4, 'bbi10-ghurni': 4,
  'bbi07-bandha': 4, 'bbi07-dui-baja': 4, 'bbi07-jodi': 4, 'bbi07-gadiba': 4, 'bbi07-hulahuli': 4, 'bbi07-sajaghara': 4, 'bbi09-udaya': 4, 'bbi09-asta': 4, 'bbi09-ara': 4, 'bbi10-chhata': 4, 'bbi10-tana': 4, 'bbi10-udaya': 4,
};
const lead = (a: Act): Act => {
  const L = LEAD[a.id] ?? 0;
  if (!L) return a;
  const sh = (c: ActCtx): ActCtx => ({ ...c, x: c.x + L, X: (t: number) => c.X(t + L) });
  return { ...a, w: a.w + L, cps: a.cps?.map((k) => k + L), paint: a.paint && ((g, c) => a.paint!(g, sh(c))), build: a.build && ((w, c) => a.build!(w, sh(c))) };
};

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  longStage({ base: room02(), acts: [lead(act02), lead(act02b), lead(act02d)], twist: 'bbi-turf-roll', par: 35, shape: 'short', meta: meta02 }),
  longStage({ base: room03(), acts: [lead(act03), lead(act03b)], twist: 'bbi-lantern-drop', par: 32, shape: 'short', meta: meta03 }),
  longStage({ base: room04(), acts: [lead(act04)], twist: 'bbi-curl-stair', par: 36, shape: 'short', meta: meta04 }),
  longStage({ base: room05(), acts: [lead(act05a), lead(act05b), lead(act05f), lead(act05l), lead(act05c), lead(act05m), lead(act05k), lead(act05i), lead(act05o), lead(act05n), lead(act05h)], twist: 'bbi-behind-step', par: 72, shape: 'wtf', meta: meta05 }),
  longStage({ base: room06(), acts: [lead(act06), lead(act06f), lead(act06i), lead(act06k), lead(act06g), lead(act06l), lead(act06m)], twist: 'bbi-motif-door', par: 60, shape: 'long', meta: meta06 }),
  longStage({ base: room07(), acts: [lead(act07a), lead(act07h), lead(act07b), lead(act07m), lead(act07k), lead(act07l), lead(act07o), lead(act07p), lead(act07q), lead(act07r), lead(act07s), lead(act07t), lead(act07u), lead(act07i), lead(act07j)], twist: 'bbi-pose-gate', par: 114, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [lead(act08h), lead(act08f), lead(act08g), lead(act08e), lead(act08i)], twist: 'bbi-leaf-plate', par: 60, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: [lead(act09d), lead(act09g), lead(act09b), lead(act09f), lead(act09h), lead(act09)], twist: 'bbi-horse-gap', par: 70, shape: 'long', meta: meta09 }),
  longStage({ base: room10(), acts: [lead(act10d), lead(act10i), lead(act10a), lead(act10j), lead(act10n), lead(act10p), lead(act10g), lead(act10f), lead(act10e), lead(act10l), lead(act10k), lead(act10m), lead(act10q), lead(act10c), lead(act10o), lead(act10h), lead(act10b)], twist: 'bbi-ribbon-snip', par: 114, shape: 'marathon', lives: 'act', meta: meta10 }),
];
