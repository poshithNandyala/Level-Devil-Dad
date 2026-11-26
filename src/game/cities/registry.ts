// Every city built as a module, in journey order. Found by folder: src/game/cities/<code>/index.ts exports
// one CityModule. A new city touches no shared file; its place in the journey comes from CHAPTERS.
import type { CityModule } from './module';
import { CHAPTERS } from '../cities';

const found = import.meta.glob<Record<string, unknown>>('./*/index.ts', { eager: true });

const isModule = (v: unknown): v is CityModule => !!v && typeof v === 'object' && 'id' in v && 'levels' in v && 'lines' in v;
const at = (m: CityModule) => {
  const i = CHAPTERS.findIndex((c) => c.id === m.id);
  if (i < 0) throw new Error(`city module ${m.id}: no chapter with that id in CHAPTERS`);
  return i;
};

export const CITY_MODULES: CityModule[] = Object.entries(found)
  .map(([path, exports]) => {
    const mods = Object.values(exports).filter(isModule);
    if (mods.length !== 1) throw new Error(`${path} must export exactly one CityModule (found ${mods.length})`);
    return mods[0];
  })
  .sort((a, b) => at(a) - at(b));
