import type { LevelDef } from '../world';
import type { CityId } from '../constants';
import { TVM } from './tvm';
import { KVT } from './kvt';
import { CHN } from './chn';
import { PDY } from './pdy';
import { AMR } from './amr';
import { HYD } from './hyd';
import { BLR } from './blr';
import { BOM } from './bom';
import { PNJ } from './pnj';
import { DMN } from './dmn';
import { GNR } from './gnr';
import { JAI } from './jai';
import { BPL } from './bpl';
import { RPR } from './rpr';

export const LEVELS: LevelDef[] = [...TVM, ...KVT, ...CHN, ...PDY, ...BLR, ...AMR, ...HYD, ...PNJ, ...BOM, ...DMN, ...GNR, ...JAI, ...BPL, ...RPR];
// city modules (src/game/cities/registry.ts) are appended by src/game/cities/install.ts

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
