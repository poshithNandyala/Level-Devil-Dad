// The bar every city module must meet (AGENTS.md, docs/CITY-MODULE.md), checked for every module city so a
// stage can't skip a proof by accident: 10 stages 01-10, a NAIVE for each, a FIX for at least 5, one hidden
// item each, a route for every act, a policy for every ending, a fair list covering the hard stages, 9 Tara
// intros, and every new key prefixed with the city code. Plus: act ids are unique across the whole game, and
// install refuses colliding keys.
import { describe, expect, it } from 'vitest';
import { CITY_MODULES } from '../src/game/cities/registry';
import type { CityModule } from '../src/game/cities/module';
import { installCityModules } from '../src/game/cities/install';
import { LEVELS, levelsOf } from '../src/game/levels';
import { CHAPTERS } from '../src/game/cities';
import { CHUNK_W } from '../src/game/levels/chunks';
import { World } from '../src/game/world';
import { Collectible } from '../src/game/entities/traps';
import { CITY_TESTS_BY_ID } from './city-tests';
import { NAIVE, FIX } from './solutions';
import { ACT_ROUTES } from './acts';
import { policyFor } from './endings';
import { INFO } from './helpers';

/**
 * Module cities that predate the 10-stage shape, and the checks they are excused from.
 * TODO: RNC gets stages 09-10, a NAIVE for its tour, 9 intros, FIX plays and rnc-prefixed endings/causes/things in its hardness pass;
 * then delete its entry. Never add a new city here.
 * TODO: the 8-stage cities moved into modules unchanged (infra round 4) get stages 09-10, 9 intros, a fair list,
 * prefixed keys and (where listed) the missing NAIVE / FIX plays in their own pass; then delete their entries.
 */
const OLD: Excuse[] = ['ten', 'intro', 'prefix', 'fair'];
const EXEMPT: Record<string, Excuse[]> = {
  RNC: ['ten', 'tour-naive', 'fix', 'intro', 'prefix'],
  PDY: OLD,
  BLR: [...OLD, 'fix'],
  AMR: OLD,
  HYD: [...OLD, 'naive', 'fix'],
  PNJ: [...OLD, 'naive', 'fix'],
  BOM: [...OLD, 'naive', 'fix'],
  DMN: [...OLD, 'naive', 'fix'],
  GNR: [...OLD, 'naive', 'fix'],
  JAI: [...OLD, 'naive', 'fix'],
  BPL: [...OLD, 'naive', 'fix'],
  RPR: [...OLD, 'naive', 'fix'],
};
type Excuse = 'ten' | 'tour-naive' | 'naive' | 'fix' | 'intro' | 'prefix' | 'fair';
const exempt = (m: CityModule, k: Excuse) => (EXEMPT[m.id] ?? []).includes(k);
const isChunk = (kind: string) => kind in CHUNK_W;
const two = (n: number) => String(n).padStart(2, '0');

describe('city modules', () => {
  it('are found by folder, in journey order', () => {
    expect(CITY_MODULES.length).toBeGreaterThan(0);
    const at = CITY_MODULES.map((m) => CHAPTERS.findIndex((c) => c.id === m.id));
    expect(at.every((i) => i >= 0)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
  });

  for (const m of CITY_MODULES) {
    describe(m.id, () => {
      const code = m.id.toLowerCase();
      const stages = levelsOf(m.id);
      const t = CITY_TESTS_BY_ID[m.id];
      it('has a test file tests/cities/<code>.ts', () => expect(t, `tests/cities/${code}.ts exporting test`).toBeDefined());
      it('has stages 01..N in order (N = 10)', () => {
        const n = exempt(m, 'ten') ? stages.length : 10;
        expect(stages.map((l) => l.id)).toEqual(Array.from({ length: n }, (_, i) => `${m.id}-${two(i + 1)}`));
        expect(stages.map((l) => l.index)).toEqual(Array.from({ length: n }, (_, i) => i + 1));
      });
      it('has a NAIVE play for every stage', () => {
        if (exempt(m, 'naive')) return;
        expect(stages.filter((l) => !NAIVE[l.id] && !(l.index === 1 && exempt(m, 'tour-naive'))).map((l) => l.id)).toEqual([]);
      });
      it('has a FIX play for at least 5 of its 10 stages', () => {
        if (exempt(m, 'fix')) return;
        expect(stages.filter((l) => FIX[l.id]).length).toBeGreaterThanOrEqual(5);
      });
      it('has one hidden item in every stage', () => {
        for (const l of stages) {
          const w = new World(l, INFO);
          l.build?.(w);
          expect(w.entities.filter((e) => e instanceof Collectible).length, l.id).toBe(1);
        }
      });
      it('has a route for every act', () => {
        const acts = stages.flatMap((l) => (l.parts ?? []).filter((p) => !isChunk(p.kind)).map((p) => p.kind));
        expect(acts.filter((a) => !ACT_ROUTES[a])).toEqual([]);
        if (!exempt(m, 'prefix')) expect(acts.filter((a) => !a.startsWith(code))).toEqual([]);
      });
      it('has a policy for every ending, and every stage twist is one of them or a known ending', () => {
        expect(Object.keys(m.endings).filter((k) => !policyFor(k))).toEqual([]);
      });
      it('names every long, marathon and wtf stage in its fair list', () => {
        if (exempt(m, 'fair')) return;
        const fair = new Set(t?.fair ?? []);
        expect(fair.size).toBeGreaterThan(0);
        const hard = stages.filter((l) => l.shape === 'long' || l.shape === 'marathon' || l.shape === 'wtf');
        expect(hard.filter((l) => !fair.has(l.id)).map((l) => l.id)).toEqual([]);
        expect([...fair].filter((id) => !stages.some((l) => l.id === id))).toEqual([]);
      });
      it('has a Tara intro for every long stage', () => {
        if (exempt(m, 'intro')) return;
        expect(m.lines.intro.length).toBeGreaterThanOrEqual(9);
        expect(m.lines.beaten.length).toBeGreaterThan(0);
      });
      it('has no TODO left from the scaffold', () => {
        const text = JSON.stringify([m.lines, m.cityLine, m.theme.local, m.course, m.skin, stages.map((l) => [l.name, l.nameEn, l.tagline, l.hint])]);
        expect(text.includes('TODO'), 'a TODO from scripts/dev/new-city.mjs is still in the module').toBe(false);
        expect(Object.keys(m.things ?? {}).filter((k) => k.endsWith('-item'))).toEqual([]);
      });
      it('prefixes its new keys with its code', () => {
        if (exempt(m, 'prefix')) return;
        const keys = [...Object.keys(m.endings), ...Object.keys(m.causeLines), ...Object.keys(m.things ?? {}), ...Object.keys(m.sceneFeatures ?? {})];
        expect(keys.filter((k) => !k.startsWith(code))).toEqual([]);
      });
    });
  }

  it('act ids are unique across the whole game', () => {
    const seen = new Map<string, string>();
    const dup: string[] = [];
    for (const l of LEVELS)
      for (const p of l.parts ?? []) {
        if (isChunk(p.kind)) continue;
        // compared squashed (case, hyphens, underscores), so 'pat02-ghat' and 'pat02_Ghat' collide too
        const k = p.kind.toLowerCase().replace(/[-_]/g, '');
        if (seen.has(k)) dup.push(`${p.kind}: ${seen.get(k)} and ${l.id}`);
        else seen.set(k, l.id);
      }
    expect(dup).toEqual([]);
  });

  it('install refuses a key another city already uses', () => {
    // throwaway modules under chapter ids no city module has yet (a built city's id would be skipped as installed)
    const [a, b, c, d, e] = CHAPTERS.map((ch) => ch.id).filter((id) => !CITY_MODULES.some((m) => m.id === id));
    expect(e, 'needs five unbuilt chapters for throwaway modules').toBeDefined();
    const base: CityModule = { ...CITY_MODULES[0], id: a as CityModule['id'], levels: () => [], endings: {}, causeLines: {}, things: {}, sceneFeatures: {} };
    // 'spikes' and 'crate' are shared keys (entities/props.ts CAUSE_LINES, render/art/things.ts SIZE), no city's
    expect(() => installCityModules([{ ...base, causeLines: { spikes: ['a', 'b'] } }])).toThrow(/death cause 'spikes'/);
    expect(() => installCityModules([{ ...base, id: b as CityModule['id'], things: { crate: { size: [1, 1], draw: () => {} } } }])).toThrow(/thing kind 'crate'/);
    // an ending kind some city already owns, read from the registry (no city's key is named here)
    const owner = CITY_MODULES.find((m) => Object.keys(m.endings).length > 0)!;
    const [usedEnding] = Object.keys(owner.endings);
    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(() => installCityModules([{ ...base, id: c as CityModule['id'], endings: { [usedEnding]: owner.endings[usedEnding] } }])).toThrow(new RegExp(`ending kind '${esc(usedEnding)}'`));
    const feature = `${d.toLowerCase()}-test-feature`;
    installCityModules([{ ...base, id: d as CityModule['id'], sceneFeatures: { [feature]: () => {} } }]);
    expect(() => installCityModules([{ ...base, id: e as CityModule['id'], sceneFeatures: { [feature]: () => {} } }])).toThrow(new RegExp(`scene feature '${esc(feature)}'`));
  });

});
