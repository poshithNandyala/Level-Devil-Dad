// The idea allocation (docs/allocation.json) keeps parallel builders apart: every city's stage slots, each
// with a mechanic family and its betrayal types. This test checks the allocation itself, and that every built
// module stage's `meta` matches its slot, so a builder can't drift from the allocation silently.
// The allocator writes /local/home/saiposh/personal/ldd-inbox/docs/allocation.json; copy it to docs/.
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CITY_MODULES } from '../src/game/cities/registry';
import { CHAPTERS } from '../src/game/cities';
import { levelsOf } from '../src/game/levels';
import type { CityId } from '../src/game/constants';
import type { StageMeta } from '../src/game/world';

export interface Slot {
  index: number;
  shape: string;
  concept: string;
  family: string;
  betrayals: string[];
}
export type Allocation = Record<string, { slots: Slot[]; reserves: unknown[] }>;

const PATH = join(__dirname, '..', 'docs', 'allocation.json');
const SOURCE = '/local/home/saiposh/personal/ldd-inbox/docs/allocation.json';
/** cities shipped before the module system: 8 slots, or 10 once their 09-10 encore is allocated */
const SHIPPED = new Set(['TVM', 'KVT', 'CHN', 'PDY', 'BLR', 'AMR', 'HYD', 'PNJ', 'BOM', 'DMN', 'GNR', 'JAI', 'BPL', 'RPR', 'RNC']);
/** module cities built before the allocation existed (no meta yet). TODO: add RNC's meta with its pass. */
const NO_META = new Set(['RNC']);

/** every problem with an allocation, as readable lines (empty: it's fine) */
export function allocationProblems(a: Allocation): string[] {
  const out: string[] = [];
  const pair = new Map<string, string>();
  const familyCity = new Map<string, string>();
  for (const c of CHAPTERS.map((ch) => ch.id)) if (!a[c]) out.push(`${c}: missing`);
  for (const [city, { slots, reserves }] of Object.entries(a)) {
    if (!CHAPTERS.some((ch) => ch.id === city)) out.push(`${city}: not a chapter`);
    if (!Array.isArray(slots) || !Array.isArray(reserves)) {
      out.push(`${city}: needs "slots" and "reserves" arrays`);
      continue;
    }
    const n = slots.length;
    if (SHIPPED.has(city) ? n !== 8 && n !== 10 : n !== 10) out.push(`${city}: ${n} slots (want ${SHIPPED.has(city) ? '8, or 10 with the encore' : 10})`);
    const idx = slots.map((s) => s.index);
    if (idx.join() !== Array.from({ length: n }, (_, i) => i + 1).join()) out.push(`${city}: slot indices ${idx.join(',')} (want 1..${n})`);
    const seen = new Set<string>();
    for (const s of slots) {
      for (const k of ['shape', 'concept', 'family'] as const) if (typeof s[k] !== 'string' || !s[k]) out.push(`${city}-${s.index}: no ${k}`);
      if (!Array.isArray(s.betrayals)) {
        out.push(`${city}-${s.index}: betrayals must be an array`);
        continue;
      }
      const other = familyCity.get(s.family);
      if (other && other !== city) out.push(`family '${s.family}' is in ${other} and ${city}`);
      familyCity.set(s.family, city);
      for (const b of s.betrayals) {
        if (seen.has(b)) out.push(`${city}: betrayal '${b}' twice in one city`);
        seen.add(b);
        const key = `${s.family} / ${b}`;
        if (pair.has(key)) out.push(`(${key}) used twice: ${pair.get(key)} and ${city}-${s.index}`);
        else pair.set(key, `${city}-${s.index}`);
      }
    }
  }
  return out;
}

/** a built module stage whose meta doesn't match its slot */
export function metaProblems(a: Allocation, city: string, stages: { id: string; index: number; meta?: StageMeta }[]): string[] {
  const out: string[] = [];
  for (const l of stages) {
    const slot = a[city]?.slots.find((s) => s.index === l.index);
    if (!slot) out.push(`${l.id}: no slot ${l.index} in the allocation`);
    else if (!l.meta) out.push(`${l.id}: no meta (want family '${slot.family}')`);
    else {
      if (l.meta.family !== slot.family) out.push(`${l.id}: family '${l.meta.family}', allocated '${slot.family}'`);
      if ([...l.meta.betrayals].sort().join() !== [...slot.betrayals].sort().join()) out.push(`${l.id}: betrayals ${l.meta.betrayals.join(',')}, allocated ${slot.betrayals.join(',')}`);
    }
  }
  return out;
}

describe('allocation checker (on a made-up allocation)', () => {
  const slot = (index: number, family: string, betrayals: string[]): Slot => ({ index, shape: 'long', concept: 'x', family, betrayals });
  const full = (): Allocation =>
    Object.fromEntries(
      CHAPTERS.map((ch) => [ch.id, { slots: Array.from({ length: SHIPPED.has(ch.id) ? 8 : 10 }, (_, i) => slot(i + 1, `${ch.id}-f${i}`, [`b${i}`])), reserves: [] }]),
    );
  it('accepts a clean one', () => expect(allocationProblems(full())).toEqual([]));
  it('catches a family under two cities, a repeated pair, a repeated betrayal and a wrong slot count', () => {
    const a = full();
    a.PAT.slots[1].family = a.LKO.slots[1].family;
    a.BBI.slots[2].betrayals = ['b0'];
    a.CCU.slots.pop();
    const p = allocationProblems(a).join('\n');
    expect(p).toMatch(/family 'LKO-f1' is in PAT and LKO|family 'LKO-f1' is in LKO and PAT/);
    expect(p).toMatch(/\(LKO-f1 \/ b1\) used twice/);
    expect(p).toMatch(/BBI: betrayal 'b0' twice/);
    expect(p).toMatch(/CCU: 9 slots/);
  });
  it('catches a stage that drifted from its slot', () => {
    const a = full();
    const p = metaProblems(a, 'PAT', [
      { id: 'PAT-02', index: 2, meta: { family: 'PAT-f1', betrayals: ['b1'] } },
      { id: 'PAT-03', index: 3, meta: { family: 'PAT-f9', betrayals: ['b2'] } },
      { id: 'PAT-04', index: 4 },
    ]);
    expect(p).toEqual(["PAT-03: family 'PAT-f9', allocated 'PAT-f2'", "PAT-04: no meta (want family 'PAT-f3')"]);
  });
});

describe('docs/allocation.json', () => {
  const have = existsSync(PATH);
  if (!have) {
    it.skip(`no docs/allocation.json yet: copy it from ${SOURCE}`, () => {});
    return;
  }
  const a: Allocation = JSON.parse(readFileSync(PATH, 'utf8'));
  it('has no collisions and the right number of slots', () => expect(allocationProblems(a)).toEqual([]));
  for (const m of CITY_MODULES)
    it(`${m.id}: every built stage matches its slot`, () => {
      if (NO_META.has(m.id)) return;
      expect(metaProblems(a, m.id, levelsOf(m.id as CityId))).toEqual([]);
    });
});
