// A throwaway 10-stage city module (LEH, not built yet): proves a module registers through install and that
// stage ids XXX-01..XXX-10 work end to end (codes, order, next stage, routes). Vitest isolates each test file,
// so this module never reaches the other suites.
import { describe, expect, it } from 'vitest';
import type { CityModule } from '../src/game/cities/module';
import { installCityModules } from '../src/game/cities/install';
import { RNC } from '../src/game/cities/rnc';
import { LEVEL_BY_ID, LEVELS, levelsOf, normalizeCode } from '../src/game/levels';
import { CHAPTER_BY_ID, LINES } from '../src/game/cities';
import { CITY_ORDER, THEMES } from '../src/render/theme';
import { door } from '../src/game/levels/kit';
import { Grid } from '../src/game/levels/grid';
import type { LevelDef } from '../src/game/world';
import { INFO } from './helpers';
import { play, X, and, ground } from './runner';

const room = (n: number): LevelDef => ({
  id: `LEH-${String(n).padStart(2, '0')}`,
  city: 'LEH',
  index: n,
  name: `Test ${n}`,
  hint: 'Walk to the door.',
  par: 30,
  map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
  build: (w) => void door(w),
});

const LEH: CityModule = {
  ...RNC,
  id: 'LEH',
  lines: { ...RNC.lines, hello: 'Julley! | Hello!' },
  endings: {},
  causeLines: {},
  things: {},
  theme: { ...RNC.theme, city: 'LEH', name: 'Leh' },
  // 01 is Ranchi's tour under a new id; 02-10 are plain walk-to-the-door rooms
  levels: () => [{ ...RNC.levels()[0], id: 'LEH-01', city: 'LEH' }, ...Array.from({ length: 9 }, (_, i) => room(i + 2))],
};

installCityModules([LEH]);

describe('a 10-stage city module', () => {
  it('registers ten stages in order, after the cities before it', () => {
    const ids = levelsOf('LEH').map((l) => l.id);
    expect(ids).toEqual(['LEH-01', 'LEH-02', 'LEH-03', 'LEH-04', 'LEH-05', 'LEH-06', 'LEH-07', 'LEH-08', 'LEH-09', 'LEH-10']);
    expect(levelsOf('LEH').map((l) => l.index)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(LEVELS[LEVELS.length - 1].id).toBe('LEH-10');
    expect(LEVEL_BY_ID.get('LEH-10')?.index).toBe(10);
  });
  it('installs its shared pieces', () => {
    expect(LINES.LEH.hello).toBe('Julley! | Hello!');
    expect(CHAPTER_BY_ID.get('LEH')?.city).toBe('LEH');
    expect(CHAPTER_BY_ID.get('LEH')?.teasers).toBeUndefined();
    expect(THEMES.LEH.name).toBe('Leh');
    expect(CITY_ORDER[CITY_ORDER.length - 1]).toBe('LEH');
  });
  it('parses every code from 01 to 10', () => {
    expect(normalizeCode('leh-10')).toBe('LEH-10');
    expect(normalizeCode('LEH10')).toBe('LEH-10');
    expect(normalizeCode('leh 9')).toBe('LEH-09');
    expect(normalizeCode('LEH-05')).toBe('LEH-05');
    expect(normalizeCode('RNC5')).toBe('RNC-05');
    expect(normalizeCode('LEH-11')).toBeNull();
    expect(normalizeCode('LEH-00')).toBeNull();
  });
  it('the next stage after 09 is 10, and 10 is the last', () => {
    const lv = levelsOf('LEH');
    const at = (id: string) => LEVEL_BY_ID.get(id)!;
    expect(lv[at('LEH-09').index]?.id).toBe('LEH-10');
    expect(lv[at('LEH-10').index]).toBeUndefined();
  });
  it('stage 01 builds', () => {
    expect(() => play(LEVEL_BY_ID.get('LEH-01')!, [{ hold: '', ticks: 60 }], INFO)).not.toThrow();
  });
  it('stage 10 builds and its route wins', () => {
    const { w } = play(LEVEL_BY_ID.get('LEH-10')!, [{ hold: 'R', until: and(ground, X(32)), max: 900 }], INFO);
    expect(w.state).toBe('won');
  });
  it('refuses a module installed twice or a duplicate stage', () => {
    expect(() => installCityModules([LEH])).not.toThrow();
    expect(() => installCityModules([{ ...LEH, id: 'SXR', levels: () => [{ ...room(2), city: 'SXR', id: 'LEH-02' }] }])).toThrow(/already/);
  });
});
