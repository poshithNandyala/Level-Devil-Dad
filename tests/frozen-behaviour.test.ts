// Frozen behaviour of the shipped cities: per stage, the route's win tick, the NAIVE and FIX plays' death
// cause and tick, the hidden item's tile, the checkpoint columns and par, as they are today. Stored in
// tests/cities/_frozen/<code>.json. Any change fails here, so the hardness pass changes a stage on purpose and
// re-freezes it deliberately, never by accident:
//   LDD_REFREEZE=TVM npx vitest run tests/frozen-behaviour.test.ts      (one city; or TVM,KVT; or all)
//   npm run refreeze -- TVM
// Cities without a frozen file (new modules) are not checked until someone freezes them.
import { describe, expect, it } from 'vitest';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEVELS } from '../src/game/levels';
import { World, type LevelDef } from '../src/game/world';
import { Collectible } from '../src/game/entities/traps';
import { CITY_ORDER } from '../src/render/theme';
import { SOLUTIONS, NAIVE, FIX } from './solutions';
import { INFO } from './helpers';
import { play, type Step } from './runner';

const DIR = join(__dirname, 'cities', '_frozen');
const SHIPPED = ['TVM', 'KVT', 'CHN', 'PDY', 'BLR', 'AMR', 'HYD', 'PNJ', 'BOM', 'DMN', 'GNR', 'JAI', 'BPL', 'RPR', 'RNC'];
const r1 = (v: number) => Math.round(v * 10) / 10;

interface Outcome {
  state: string;
  tick: number;
  cause?: string;
}
interface Frozen {
  par?: number;
  item: [number, number][];
  checkpoints: number[];
  route?: Outcome;
  naive?: Outcome;
  fix?: Outcome;
}

function outcome(def: LevelDef, steps: Step[]): Outcome {
  const { w } = play(def, steps);
  return w.state === 'won' ? { state: 'won', tick: w.winTick } : w.state === 'dead' ? { state: 'dead', tick: w.deathTick, cause: w.deathCause } : { state: w.state, tick: w.tick };
}

function freeze(def: LevelDef): Frozen {
  const w = new World(def, INFO);
  def.build?.(w);
  const f: Frozen = {
    par: def.par,
    item: (w.entities.filter((e) => e instanceof Collectible) as Collectible[]).map((c) => [r1(c.x / 16), r1(c.y / 16)]),
    checkpoints: w.checkpoints.map((x) => r1(x / 16)),
  };
  if (SOLUTIONS[def.id]) f.route = outcome(def, SOLUTIONS[def.id]);
  if (NAIVE[def.id]) f.naive = outcome(def, NAIVE[def.id].steps);
  if (FIX[def.id]) f.fix = outcome(def, FIX[def.id].steps);
  return f;
}

const cityOf = (code: string) => LEVELS.filter((l) => l.city === code);
const file = (code: string) => join(DIR, `${code.toLowerCase()}.json`);
const refreeze = (process.env.LDD_REFREEZE ?? '').toUpperCase();
const want = refreeze === 'ALL' ? CITY_ORDER.map(String) : refreeze ? refreeze.split(',') : [];

describe.runIf(want.length > 0)('re-freeze', () => {
  for (const code of want)
    it(`writes tests/cities/_frozen/${code.toLowerCase()}.json`, () => {
      const stages = cityOf(code);
      expect(stages.length, `no stages for ${code}`).toBeGreaterThan(0);
      mkdirSync(DIR, { recursive: true });
      writeFileSync(file(code), JSON.stringify(Object.fromEntries(stages.map((l) => [l.id, freeze(l)])), null, 1) + '\n');
    });
});

describe.runIf(want.length === 0)('frozen behaviour', () => {
  it('every shipped city has a frozen file', () => {
    expect(SHIPPED.filter((c) => !existsSync(file(c)))).toEqual([]);
  });
  for (const code of CITY_ORDER) {
    if (!existsSync(file(code))) continue;
    describe(code, () => {
      const frozen: Record<string, Frozen> = JSON.parse(readFileSync(file(code), 'utf8'));
      it('has the same stages', () => expect(cityOf(code).map((l) => l.id)).toEqual(Object.keys(frozen)));
      for (const def of cityOf(code))
        it(`${def.id} behaves as frozen (re-freeze on purpose: LDD_REFREEZE=${code})`, () => {
          expect(freeze(def)).toEqual(frozen[def.id]);
        });
    });
  }
});
