import type { LevelDef } from '../world';
import type { CityId } from '../constants';

/** every stage; each city module's stages are added in journey order by src/game/cities/install.ts */
export const LEVELS: LevelDef[] = [];

export const LEVEL_BY_ID = new Map(LEVELS.map((l) => [l.id, l]));

export function levelsOf(city: CityId): LevelDef[] {
  return LEVELS.filter((l) => l.city === city);
}

export function normalizeCode(raw: string): string | null {
  // stages run 01..10: "rnc5", "RNC-05" and "RNC-10" all work
  const m = raw.trim().toUpperCase().replace(/\s+/g, '').match(/^([A-Z]{3})-?(\d{1,2})$/);
  if (!m) return null;
  const id = `${m[1]}-${m[2].padStart(2, '0')}`;
  return LEVEL_BY_ID.has(id) ? id : null;
}
