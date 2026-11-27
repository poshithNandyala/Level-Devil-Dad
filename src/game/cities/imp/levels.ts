// Imphal's ten stages: 01 the welcome tour, 02-10 long stages (room + acts + door), harder each time, 10 the finale.
// Each stage lives in its own file (s01.ts .. s10.ts) with its allocation slot as `meta` (docs/allocation.json).
// `levels` is a function (docs/CITY-MODULE.md).
import type { LevelDef } from '../../world';
import type { Act, ActCtx } from '../../levels/acts';
import { longStage } from '../../levels/chunks';
import { tourLevel, meta01 } from './s01';
import { room as room02, act as act02, meta02 } from './s02';
import { room as room03, act as act03, meta03 } from './s03';
import { room as room04, act as act04, meta04 } from './s04';
import { room as room05, act as act05, act2 as act05b, meta05 } from './s05';
import { room as room06, act as act06, act2 as act06b, meta06 } from './s06';
import { room as room07, acts as acts07, meta07 } from './s07';
import { room as room08, act as act08, meta08 } from './s08';
import { room as room09, acts as acts09, meta09 } from './s09';
import { room as room10, acts as acts10, meta10 } from './s10';

/** every act starts with `LEAD` tiles of plain ground: its start checkpoint is then at least 4.5 tiles from any water
 * or hazard a tap-jump could reach (the walk-4.5 rule). The act's own columns are shifted by LEAD. */
export const LEAD = 2;
const sh = (c: ActCtx, d: number): ActCtx => ({ ...c, x: c.x + d, X: (t: number) => c.X(t + d) });
export const led = (a: Act): Act => ({
  ...a,
  w: a.w + LEAD,
  cps: a.cps?.map((t) => t + LEAD),
  paint: a.paint ? (g, c) => a.paint!(g, sh(c, LEAD)) : undefined,
  build: a.build ? (w, c) => a.build!(w, sh(c, LEAD)) : undefined,
});

export const levels = (): LevelDef[] => [
  { ...tourLevel(), meta: meta01 },
  // pars: 1.35 x the scripted route's clear time (BUILD.md has the times)
  longStage({ base: room02(), acts: [act02].map(led), par: 18, shape: 'long', meta: meta02 }),
  longStage({ base: room03(), acts: [act03].map(led), par: 36, shape: 'long', meta: meta03 }),
  longStage({ base: room04(), acts: [act04].map(led), par: 18, shape: 'long', meta: meta04 }),
  longStage({ base: room05(), acts: [act05, act05b].map(led), par: 42, shape: 'long', lives: 'act', meta: meta05 }),
  longStage({ base: room06(), acts: [act06, act06b].map(led), par: 19, shape: 'long', lives: 'act', meta: meta06 }),
  longStage({ base: room07(), acts: acts07.map(led), par: 38, shape: 'marathon', lives: 'act', meta: meta07 }),
  longStage({ base: room08(), acts: [act08].map(led), par: 12, shape: 'wtf', meta: meta08 }),
  longStage({ base: room09(), acts: acts09.map(led), par: 38, shape: 'long', lives: 'act', meta: meta09 }),
  longStage({ base: room10(), acts: acts10.map(led), par: 21, shape: 'long', lives: 'act', meta: meta10 }),
];
