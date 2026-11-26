// The idea allocation (docs/allocation.json) keeps parallel builders apart: every city's stage slots, each
// with a mechanic family and its betrayal types. This test checks the allocation itself, and that every built
// module stage's `meta` matches its slot, so a builder can't drift from the allocation silently.
// docs/allocation.json is the allocator's file (docs/ALLOCATION.md explains it); scripts/dev/allocation-check.py
// is its own guard and asserts the same duplicate rules.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CITY_MODULES } from '../src/game/cities/registry';
import { CHAPTERS } from '../src/game/cities';
import { LEVELS } from '../src/game/levels';
import type { StageMeta } from '../src/game/world';
import { ENDINGS } from '../src/game/levels/endings';

export interface Slot {
  index: number;
  shape: string;
  concept: string;
  family: string;
  betrayals: string[];
  [k: string]: unknown;
}
export interface Pick {
  family: string;
  betrayals: string[];
  concept?: string;
  [k: string]: unknown;
}
export interface CityAlloc {
  status: 'new' | 'shipped';
  slots: Slot[];
  reserves?: Pick[];
  /** shipped cities: the new betrayal in their welcome tour */
  tourNew?: Pick;
  seventhDeathTheme?: string;
  [k: string]: unknown;
}
export type Allocation = Record<string, CityAlloc>; // plus non-city keys such as "rules" (v2), ignored

const PATH = join(__dirname, '..', 'docs', 'allocation.json');
const SOURCE = '/local/home/saiposh/personal/ldd-inbox/docs/allocation.json';
const SHAPES = new Set(['tour', 'std', 'long', 'marathon', 'tough', 'HWIK', 'finale', 'shipped', 'encore-tough', 'encore-finale']);
/** a slot's shape without its note: 'HWIK (long 60-90 s)' -> 'HWIK' */
export const shapeOf = (s: string) => s.trim().split(/[\s(]/)[0];
/** top-level keys that are not cities (allocation v2 has a "rules" object) */
const isCityKey = (k: string) => /^[A-Z]{3}$/.test(k);

/**
 * Every problem with an allocation, as readable lines (empty: it's fine). The same rules as
 * scripts/dev/allocation-check.py (families counted over slots, reserves and tourNew; no (family, betrayal)
 * pair twice; no betrayal type twice in a city, the 'shipped' placeholder aside), plus: all 36 chapters,
 * 10 slots each with indices 1..10 and a known shape, at least 2 reserves per new city, and at most two
 * HWIK slots per new city, never next to each other.
 */
export function allocationProblems(a: Allocation): string[] {
  const out: string[] = [];
  const familyAt = new Map<string, string[]>();
  const pairs = new Map<string, number>();
  for (const c of CHAPTERS.map((ch) => ch.id)) if (!a[c]) out.push(`${c}: missing`);
  for (const [city, v] of Object.entries(a)) {
    if (!isCityKey(city)) continue;
    if (!CHAPTERS.some((ch) => ch.id === city)) out.push(`${city}: not a chapter`);
    if (v.status !== 'new' && v.status !== 'shipped') out.push(`${city}: status '${v.status}'`);
    if (!Array.isArray(v.slots)) {
      out.push(`${city}: no slots array`);
      continue;
    }
    if (v.slots.length !== 10) out.push(`${city}: ${v.slots.length} slots (want 10)`);
    const idx = v.slots.map((s) => s.index).join();
    if (idx !== '1,2,3,4,5,6,7,8,9,10') out.push(`${city}: slot indices ${idx} (want 1..10)`);
    for (const s of v.slots) if (!SHAPES.has(shapeOf(s.shape))) out.push(`${city}-${s.index}: unknown shape '${s.shape}'`);
    if (v.status === 'new') {
      if ((v.reserves ?? []).length < 2) out.push(`${city}: ${(v.reserves ?? []).length} reserves (want 2)`);
      const hw = v.slots.filter((s) => shapeOf(s.shape) === 'HWIK').map((s) => s.index);
      if (hw.length > 2 || hw.some((x, i) => i > 0 && x - hw[i - 1] === 1)) out.push(`${city}: HWIK slots ${hw.join(',')}`);
    }
    const items: Pick[] = [...v.slots, ...(v.reserves ?? []), ...(v.tourNew ? [{ ...v.tourNew, concept: `${city}-tour` }] : [])];
    const seen = new Map<string, number>();
    for (const s of items) {
      if (typeof s.family !== 'string' || !s.family) out.push(`${city} ${s.concept}: no family`);
      if (!Array.isArray(s.betrayals)) {
        out.push(`${city} ${s.concept}: betrayals must be a list`);
        continue;
      }
      familyAt.set(s.family, [...(familyAt.get(s.family) ?? []), `${city}:${s.concept}`]);
      for (const b of s.betrayals) {
        const key = `${s.family} / ${b}`;
        pairs.set(key, (pairs.get(key) ?? 0) + 1);
        if (!b.startsWith('shipped')) seen.set(b, (seen.get(b) ?? 0) + 1);
      }
    }
    for (const [b, n] of seen) if (n > 1) out.push(`${city}: betrayal '${b}' used ${n}x`);
  }
  for (const [f, w] of familyAt) if (w.length > 1) out.push(`family '${f}': ${w.join(', ')}`);
  for (const [k, n] of pairs) if (n > 1) out.push(`pair (${k}) x${n}`);
  return out;
}

/** a built module stage whose meta doesn't match its slot */
export function metaProblems(a: Allocation, city: string, stages: { id: string; index: number; meta?: StageMeta }[]): string[] {
  const out: string[] = [];
  for (const l of stages) {
    const slot = a[city]?.slots.find((s) => s.index === l.index);
    if (!slot) out.push(`${l.id}: no slot ${l.index} in the allocation`);
    else if (!l.meta) continue; // a stage without meta is not checked (shipped cities carry none yet)
    else {
      if (l.meta.family !== slot.family) out.push(`${l.id}: family '${l.meta.family}', allocated '${slot.family}'`);
      if ([...l.meta.betrayals].sort().join() !== [...slot.betrayals].sort().join()) out.push(`${l.id}: betrayals ${l.meta.betrayals.join(',')}, allocated ${slot.betrayals.join(',')}`);
    }
  }
  return out;
}

/** squash a key for comparison: lower case, no hyphens or underscores */
const squash = (k: string) => k.toLowerCase().replace(/[-_]/g, '');

/**
 * Door-ending keys on module stages: each '<city>-<kebab>' and unique game-wide, and none (prefix stripped)
 * the same as a shipped door ending or old twist (`shipped`: ENDINGS keys of the shipped cities, OldTwist).
 * A new module city's stage with meta must declare its ending.
 */
export function endingProblems(stages: { id: string; city: string; meta?: StageMeta }[], shipped: string[], needEnding: (city: string) => boolean): string[] {
  const out: string[] = [];
  const at = new Map<string, string>();
  const old = new Map(shipped.map((k) => [squash(k), k]));
  for (const l of stages) {
    const e = l.meta?.ending;
    if (!e) {
      if (l.meta && needEnding(l.city)) out.push(`${l.id}: meta has no ending`);
      continue;
    }
    const pre = `${l.city.toLowerCase()}-`;
    if (!e.startsWith(pre) || !/^[a-z0-9]+(-[a-z0-9]+)+$/.test(e)) out.push(`${l.id}: ending '${e}' must be '${pre}<kebab key>'`);
    if (at.has(e)) out.push(`ending '${e}' on ${at.get(e)} and ${l.id}`);
    else at.set(e, l.id);
    const hit = old.get(squash(e.startsWith(pre) ? e.slice(pre.length) : e));
    if (hit) out.push(`${l.id}: ending '${e}' is the shipped ending '${hit}'`);
  }
  return out;
}

const SHIPPED = new Set(['TVM', 'KVT', 'CHN', 'PDY', 'BLR', 'AMR', 'HYD', 'PNJ', 'BOM', 'DMN', 'GNR', 'JAI', 'BPL', 'RPR', 'RNC']);

describe('allocation checker (on a made-up allocation)', () => {
  const slot = (city: string, index: number, shape = 'std'): Slot => ({ index, shape, concept: `${city}-${index}`, family: `${city}-f${index}`, betrayals: [`b${index}`] });
  const full = (): Allocation =>
    Object.fromEntries(
      CHAPTERS.map((ch) => [
        ch.id,
        SHIPPED.has(ch.id)
          ? { status: 'shipped', slots: Array.from({ length: 10 }, (_, i) => ({ ...slot(ch.id, i + 1, i < 8 ? 'shipped' : 'encore-tough'), betrayals: i < 8 ? ['shipped'] : [`b${i}`] })), tourNew: { family: `${ch.id}-tour`, betrayals: ['t1'] } }
          : { status: 'new', slots: Array.from({ length: 10 }, (_, i) => slot(ch.id, i + 1, i === 3 || i === 6 ? 'HWIK' : 'std')), reserves: [{ family: `${ch.id}-r1`, betrayals: ['r1'] }, { family: `${ch.id}-r2`, betrayals: ['r2'] }] },
      ]),
    );
  it('accepts a clean one', () => expect(allocationProblems(full())).toEqual([]));
  it('catches a family under two cities, a repeated pair, a repeated betrayal, HWIK next to HWIK, too few reserves and slots', () => {
    const a = full();
    a.PAT.slots[1].family = 'LKO-f2';
    a.BBI.slots[2].betrayals = ['b1'];
    a.CCU.slots[4].shape = 'HWIK';
    a.GTK.reserves = [];
    a.DIS.slots.pop();
    a.TVM.tourNew = { family: 'KVT-tour', betrayals: ['t1'] };
    const p = allocationProblems(a).join('\n');
    expect(p).toMatch(/family 'LKO-f2': .*PAT:PAT-2/);
    expect(p).toMatch(/pair \(LKO-f2 \/ b2\) x2/);
    expect(p).toMatch(/BBI: betrayal 'b1' used 2x/);
    expect(p).toMatch(/CCU: HWIK slots 4,5,7/);
    expect(p).toMatch(/GTK: 0 reserves/);
    expect(p).toMatch(/DIS: 9 slots/);
    expect(p).toMatch(/family 'KVT-tour': KVT:KVT-tour, TVM:TVM-tour|family 'KVT-tour': TVM:TVM-tour, KVT:KVT-tour/);
  });
  it('catches a stage that drifted from its slot, and skips stages without meta', () => {
    const a = full();
    const p = metaProblems(a, 'PAT', [
      { id: 'PAT-02', index: 2, meta: { family: 'PAT-f2', betrayals: ['b2'] } },
      { id: 'PAT-03', index: 3, meta: { family: 'PAT-f9', betrayals: ['b3'] } },
      { id: 'PAT-04', index: 4, meta: { family: 'PAT-f4', betrayals: ['b9'] } },
      { id: 'PAT-05', index: 5 },
    ]);
    expect(p).toEqual(["PAT-03: family 'PAT-f9', allocated 'PAT-f3'", 'PAT-04: betrayals b9, allocated b4']);
  });
});

describe('ending keys checker (made-up stages)', () => {
  it('reads shapes with notes', () => {
    expect(shapeOf('HWIK (long 60-90 s)')).toBe('HWIK');
    expect(shapeOf('tough')).toBe('tough');
  });
  it('catches a duplicate, a bad prefix, a shipped ending under a new name and a missing ending', () => {
    const m = (family: string, ending?: string): StageMeta => ({ family, betrayals: ['x'], ...(ending ? { ending } : {}) });
    const p = endingProblems(
      [
        { id: 'PAT-02', city: 'PAT', meta: m('a', 'pat-ganga-steps') },
        { id: 'PAT-03', city: 'PAT', meta: m('b', 'pat-ganga-steps') },
        { id: 'LKO-02', city: 'LKO', meta: m('c', 'pat-kite') },
        { id: 'LKO-03', city: 'LKO', meta: m('d', 'lko-dahi-handi') },
        { id: 'LKO-04', city: 'LKO', meta: m('e') },
        { id: 'RNC-02', city: 'RNC', meta: m('f') },
      ],
      ['dahihandi', 'knock'],
      (c) => c !== 'RNC',
    );
    expect(p).toEqual([
      "ending 'pat-ganga-steps' on PAT-02 and PAT-03",
      "LKO-02: ending 'pat-kite' must be 'lko-<kebab key>'",
      "LKO-03: ending 'lko-dahi-handi' is the shipped ending 'dahihandi'",
      'LKO-04: meta has no ending',
    ]);
  });
});

describe('door endings and act ids on built stages', () => {
  const shippedCities = new Set(['TVM', 'KVT', 'CHN', 'PDY', 'BLR', 'AMR', 'HYD', 'PNJ', 'BOM', 'DMN', 'GNR', 'JAI', 'BPL', 'RPR', 'RNC']);
  const newModuleEndings = new Set(CITY_MODULES.filter((m) => !shippedCities.has(m.id)).flatMap((m) => Object.keys(m.endings)));
  // the old door twists, read from the OldTwist union so the list can't go stale
  const oldTwists = [...(readFileSync(join(__dirname, '..', 'src/game/levels/twists.ts'), 'utf8').match(/export type OldTwist = ([^;]+);/)?.[1].matchAll(/'([a-z]+)'/g) ?? [])].map((x) => x[1]);
  const shipped = [...Object.keys(ENDINGS).filter((k) => !newModuleEndings.has(k)), ...oldTwists];
  it('knows the shipped endings', () => {
    expect(oldTwists).toContain('crush');
    expect(shipped).toContain('dahihandi');
    expect(shipped).toContain('ulta');
  });
  it('every meta.ending is <city>-<kebab>, unique, and not a shipped ending renamed; new module stages declare one', () => {
    expect(endingProblems(LEVELS, shipped, (c) => !shippedCities.has(c))).toEqual([]);
  });
  // act ids: unique game-wide and prefixed with the city code is tests/modules.test.ts ('act ids are unique
  // across the whole game', 'has a route for every act'); not repeated here
});

describe('docs/allocation.json', () => {
  const have = existsSync(PATH);
  if (!have) {
    it.skip(`no docs/allocation.json yet: copy it from ${SOURCE}`, () => {});
    return;
  }
  const a: Allocation = JSON.parse(readFileSync(PATH, 'utf8'));
  it('has no collisions and the right number of slots', () => expect(allocationProblems(a)).toEqual([]));
  it('every built stage that declares meta matches its slot (family and betrayals)', () => {
    const withMeta = LEVELS.filter((l) => l.meta);
    const cities = [...new Set(withMeta.map((l) => l.city))];
    expect(cities.flatMap((c) => metaProblems(a, c, withMeta.filter((l) => l.city === c)))).toEqual([]);
  });
  it('every registered module city is in the allocation', () => {
    expect(CITY_MODULES.map((m) => m.id).filter((id) => !a[id])).toEqual([]);
  });
});
