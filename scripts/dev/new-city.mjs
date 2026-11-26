#!/usr/bin/env node
// Scaffold a new city module: npm run new-city -- PAT "Patna" "Bihar"
// Creates src/game/cities/<code>/ (the RNC module's shape, ten stage slots) and tests/cities/<code>.ts.
// Every placeholder says TODO; tests/modules.test.ts fails until each one is real. Registers nothing:
// src/game/cities/registry.ts finds the folder by itself. Recipe: docs/CITY-MODULE.md.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const [CODE_IN, NAME, STATE] = process.argv.slice(2);
const die = (m) => {
  console.error(m);
  process.exit(1);
};
if (!CODE_IN || !NAME || !STATE) die('usage: npm run new-city -- <CODE> "<Name>" "<State>"   (eg. PAT "Patna" "Bihar")');
const CODE = CODE_IN.toUpperCase();
if (!/^[A-Z]{3}$/.test(CODE)) die(`city code must be three letters, got ${CODE_IN}`);
const c = CODE.toLowerCase();
const cities = readFileSync(join(root, 'src/game/cities.ts'), 'utf8');
if (!cities.includes(`{ id: '${CODE}',`)) die(`${CODE} is not a chapter in src/game/cities.ts (docs/CITIES.md, "The journey")`);
if (!readFileSync(join(root, 'src/game/constants.ts'), 'utf8').includes(`'${CODE}'`)) die(`${CODE} is not in CityId (src/game/constants.ts)`);
const dir = join(root, 'src/game/cities', c);
const testFile = join(root, 'tests/cities', `${c}.ts`);
if (existsSync(dir)) die(`${dir} already exists`);
if (existsSync(testFile)) die(`${testFile} already exists`);

const ids = Array.from({ length: 10 }, (_, i) => `${CODE}-${String(i + 1).padStart(2, '0')}`);
const T = 'TODO | TODO';
const q = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

const files = {
  'index.ts': `// ${NAME} (${STATE}) as a city module. Scaffolded by scripts/dev/new-city.mjs: replace every TODO.
// Recipe: docs/CITY-MODULE.md. Found by src/game/cities/registry.ts; nothing to register.
import type { CityModule } from '../module';
import { lines } from './lines';
import { levels } from './levels';
import { endings } from './endings';
import { causeLines } from './causes';
import { skin } from './skin';
import { course } from './course';
import { music } from './music';
import { theme } from './theme';
import { cityLine, grade, tileCaps } from './look';
import { backdrop } from './backdrop';
import { things } from './things';

export const ${CODE}: CityModule = {
  id: '${CODE}',
  lines,
  levels,
  endings,
  causeLines,
  skin,
  course,
  cityLine,
  music,
  theme,
  grade,
  tileCaps,
  backdrop,
  things,
};
`,
  'lines.ts': `import type { CityLines } from '../../cities';

// TODO: every line in the city's own language, "Local | English", max 8 words a side (AGENTS.md, bar 4).
export const lines: CityLines = {
  hello: ${q(T)},
  famous: 'TODO: one sentence, what the city is famous for.',
  lang: 'TODO: the language mix (docs/CITIES.md)',
  // one per stage 02-10 (9)
  intro: [${Array.from({ length: 9 }, () => q(T)).join(', ')}],
  taunt: [${q(T)}, ${q(T)}, ${q(T)}],
  beaten: [${q(T)}, ${q(T)}],
  death: [${q(T)}, ${q(T)}, ${q(T)}],
  near: [${q(T)}, ${q(T)}],
  win: [${q(T)}, ${q(T)}],
  flip: ${q(T)},
  cleared: ${q(`TODO | ${NAME} cleared.`)},
  brag: ${q(T)},
  idle: [${q(T)}, ${q(T)}],
  seven: ${q(T)},
  lastLife: ${q(T)},
};
`,
  'levels.ts': `// ${NAME}'s ten stages: 01 the welcome tour, 02-10 long stages (room + act + door ending), harder each time,
// 10 the finale. Each slot below is a TODO placeholder (an empty room with a door): replace it with the stage
// from the allocation (docs/allocation.json), and set its meta. Keep \`levels\` a function (docs/CITY-MODULE.md).
import { type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { door, rival } from '../../levels/kit';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';

const tara = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

/** TODO placeholder room for stage \`n\`: replace with the real room (its own idea, sign, Tara, hidden item) */
function todoRoom(n: number): LevelDef {
  return {
    id: \`${CODE}-\${String(n).padStart(2, '0')}\`,
    city: '${CODE}',
    index: n,
    name: \`TODO stage \${n}\`,
    nameEn: 'TODO',
    tagline: 'TODO',
    hint: 'TODO: what kills you and how to beat it.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      rival(w, 3, 15, 1, tara(n - 2));
      // TODO: the mechanic's entities, a sign, the guide's lines, one collectible(w, '${c}-item', tx, ty)
    },
  };
}

export const levels = (): LevelDef[] => [
  tour({
    id: '${ids[0]}',
    city: '${CODE}',
    name: 'TODO welcome',
    nameEn: 'TODO',
    tagline: 'TODO',
    lines: [${q(T)}, ${q(T)}, ${q(T)}, ${q(T)}, ${q(T)}, ${q(T)}],
    shouts: [],
    ride: 'cart',
    item: '${c}-item',
    signs: [],
    props: [],
    things: [],
  }),
${ids
  .slice(1)
  .map((id, i) => `  longStage({ base: todoRoom(${i + 2}), par: 30, shape: '${i === 8 ? 'long' : 'long'}' }), // ${id} TODO: acts, twist (a ${c}-... ending), par`)
  .join('\n')}
];
`,
  'entities.ts': `// ${NAME}'s own entities: one class per mechanic (update, draw, solids, hazards). TODO.
// Deterministic: no Math.random, Date or real time (AGENTS.md, bar 6).
export {};
`,
  'endings.ts': `// ${NAME}'s door endings, one per stage 02-10, each a new idea. Kinds start with '${c}-'. TODO.
import type { Ending } from '../../levels/endkit';

export type ${CODE[0] + c.slice(1)}EndingKind = never; // TODO: '${c}-...' | '${c}-...' (nine of them)

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<${CODE[0] + c.slice(1)}EndingKind, true> {}
}

export const endings: Record<${CODE[0] + c.slice(1)}EndingKind, Ending> = {};
`,
  'causes.ts': `/** Tara's line for each new death cause ('${c}-...'): [what happened, how to beat it]. TODO */
export const causeLines: Record<string, string[]> = {};
`,
  'skin.ts': `import type { Skin } from '../../levels/chunks';

/** how ${NAME} dresses the old troll sections, and what its people shout. TODO: the city's own words */
export const skin: Skin = { rock: 'boulder', rockLine: ${q(T)}, vehicle: 'scooter', reverse: ${q(T)}, sorry: ${q(T)}, roll: 'coconut', bird: 'crow', jet: 'water', mist: '228,240,234', lie: ${q(T)}, chaser: 'dog', chaseLine: ${q(T)}, awning: { fill: '#33691E', trim: '#1B5E20', line: 'rgba(0,0,0,0.2)' } };
`,
  'course.ts': `import type { TourSeg } from '../../levels/tour';

/** the welcome tour's pieces (${ids[0]}). TODO: the city's own shuttle label */
export const course: TourSeg[] = [{ k: 'ditch', x: 12, w: 2 }, { k: 'steps', x: 24, n: 3, run: 2, top: 3 }, { k: 'posts', x: 44, n: 3 }, { k: 'parked', x: 62 }, { k: 'ferry', x: 76, w: 14, kind: 'traincar', label: 'TODO' }];
`,
  'music.ts': `import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// TODO: ${NAME}'s own loop (region's scale, theka, two phrases); this is Ranchi's as a placeholder
export const music: MusicCfg = {
  bpm: 116,
  sa: 155.56,
  scale: [0, 2, 4, 5, 7, 9, 10],
  theka: ['dha', 'ge', 'na', 'ti', 'na', 'ge', 'dha', 'ti'],
  phrases: [
    [4, _, 5, 4, 3, _, 4, _, 5, _, 6, 5, 4, _, 3, _, 2, _, 3, 4, 3, _, 2, _, 1, _, 2, _, 0, _, _, _],
    [7, _, 6, 5, 6, _, 4, _, 5, 4, 3, _, 4, _, _, _, 2, _, 1, 0, 1, _, 2, _, 4, _, 3, _, 2, _, _, _],
  ],
};
`,
  'theme.ts': `import type { Theme } from '../../../render/theme';

// TODO: ${NAME}'s palette and its name in the local script; these are Ranchi's colours as a placeholder
export const theme: Theme = {
  city: '${CODE}',
  name: ${q(NAME)},
  local: 'TODO',
  sky: ['#3E7FA8', '#9ECFC0', '#F3E9BE'],
  sun: '#FFF6D0',
  far: '#7FA86A',
  mid: '#4E8C4A',
  near: '#2C5E32',
  accent: '#D84315',
  accent2: '#FDD835',
  tileBase: '#8A4A2E',
  tileTop: '#B96B44',
  tileEdge: '#63301C',
  tileDark: '#421E10',
  topper: '#7CB342',
  pattern: 'brick',
  spike: '#FFF8E1',
  spikeEdge: '#3A1E10',
  ink: '#3A1E10',
  rim: null,
  ui: '#D84315',
};
`,
  'look.ts': `import type { Grade } from '../../../render/renderer';
import type { GroundCaps } from '../../../render/art/tiles';

/** colour grade over the whole frame. TODO */
export const grade: Grade = { gx: 0.68, gy: 0.12, glow: 'rgba(255,246,205,0.27)', tint: 'rgba(90,150,80,0.07)', vig: 'rgba(18,32,14,0.2)' };

/** the grass and pebbles on top of the ground tiles. TODO */
export const tileCaps: GroundCaps = { cap: '#7CB342', capHi: '#AED581', blades: '#5E8C33', pebbles: '#8D5A3B' };

/** one sentence for the postcard. TODO */
export const cityLine = 'TODO: one sentence for the postcard.';
`,
  'backdrop.ts': `import type { Theme } from '../../../render/theme';
import type { Ctx } from '../../../render/art/common';

/** ${NAME}'s skyline, drawn in world units between x0 and x1 (landmarks as generic shapes). TODO */
export function backdrop(ctx: Ctx, th: Theme, x0: number, x1: number) {
  // TODO: far hills, the city's buildings, its landmark as a generic shape (see ../rnc/backdrop.ts)
  ctx.fillStyle = th.far;
  ctx.fillRect(x0, 200, x1 - x0, 40);
}
`,
  'things.ts': `// ${NAME}'s hidden item (and any props of its own). Kinds start with '${c}-'. TODO: the real food and art.
import type { ThingDraw } from '../../../render/art/things';

declare module '../../../render/art/things' {
  interface ModuleThingKinds {
    '${c}-item': true; // TODO: rename to the city's food, eg. '${c}-litti'
  }
}

const item: ThingDraw = (ctx, x, y, w, h) => {
  // TODO: draw it
  ctx.fillStyle = '#E8A33D';
  ctx.fillRect(x + 1, y + 2, w - 2, h - 3);
};

export const things = { '${c}-item': { size: [12, 10] as [number, number], draw: item } };
`,
};

const test = `// Proven routes for ${NAME}: every stage's room, its acts and its door, plus the plays that must die.
// Found by tests/city-tests.ts; merged into SOLUTIONS, NAIVE, FIX, MISTAKES, ACT_ROUTES and ENDING_POLICIES.
// tests/modules.test.ts fails until every table is filled. Scaffolded by scripts/dev/new-city.mjs.
import type { World } from '../../src/game/world';
import type { Door } from '../../src/game/entities/basics';
import { Step, X, and, ground } from '../runner';
import type { CityTests } from '../city-tests';

type Out = { move: 'L' | 'R' | ''; jump: boolean };
type Policy = (w: World, m: { hold: number; [k: string]: any }, d: Door) => Out;
void X;
void and;
void ground;

/** S['${CODE}-0n'] = room route; lengthen(id, drop, extra) appends each act's route and the door's policy */
function solutions(S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) {
  // TODO: one per stage, eg.
  // S['${ids[1]}'] = [{ hold: 'R', until: and(ground, X(28)), max: 600, note: '...' }];
  // lengthen('${ids[1]}', 0, []);
  void S;
  void lengthen;
}

/** the obvious play per stage, and the cause it must die of (every stage, 01-10). TODO */
const naive: Record<string, { steps: Step[]; cause?: string }> = {};

/** the obvious correction after the first death, which dies too (at least 5 of 10). TODO */
const fix: Record<string, { steps: Step[]; cause?: string }> = {};

/** more scripted first-timer deaths and 'like last time' moves. TODO */
const mistakes: Record<string, { what: string; steps: Step[]; cause?: string }[]> = {};

/** a route for each act, by act id ('${c}02-...'). TODO */
const actRoutes: Record<string, (x: number) => Step[]> = {};

/** a policy for each door ending, by kind ('${c}-...'). TODO */
const endingPolicies: Record<string, Policy> = {};

export const test: CityTests = {
  solutions,
  naive,
  fix,
  mistakes,
  actRoutes,
  endingPolicies,
  // TODO: at least every long, marathon and wtf stage
  fair: [],
};
`;

mkdirSync(dir, { recursive: true });
for (const [f, s] of Object.entries(files)) writeFileSync(join(dir, f), s);
writeFileSync(testFile, test);
console.log(`created src/game/cities/${c}/ (${Object.keys(files).length} files) and tests/cities/${c}.ts`);
console.log(`next: npx vitest run tests/modules.test.ts -t ${CODE}   (fails on every TODO until the city is real)`);
