// Adds every city module to the shared tables. Imported first by src/main.ts and by tests/setup.ts.
// Push, not pull: a module's stages import tour.ts, chunks.ts, cities.ts and friends, so those shared files
// can't import the registry themselves (it would be an import cycle). This file imports both sides instead.
import { CITY_MODULES } from './registry';
import type { CityModule } from './module';
import { CHAPTERS, LINES } from '../cities';
import { ENDINGS } from '../levels/endings';
import type { Ending } from '../levels/endkit';
import { CAUSE_LINES } from '../entities/props';
import { SKINS } from '../levels/chunks';
import { COURSES } from '../levels/tour';
import { LEVELS, LEVEL_BY_ID } from '../levels';
import { QUIPS } from '../../app/session';
import { CITY_LINE } from '../../app/citylines';
import { MUSIC } from '../../audio/audio';
import { CITY_ORDER, THEMES } from '../../render/theme';
import { GRADES } from '../../render/renderer';
import { CAP } from '../../render/art/tiles';
import { MODULE_BACKDROPS } from '../../render/backgrounds';
import { MODULE_SCENE_FEATURES } from '../../render/scenes';
import { BASE_THING_SIZE, MODULE_THING_DRAW, MODULE_THING_SIZE, type ThingKind } from '../../render/art/things';

const installed = new Set<string>();

/** add a module's keys to a shared table; a key that is already there is a collision between cities */
function addAll<T>(id: string, what: string, into: Record<string, T>, from: Record<string, T> | undefined) {
  for (const [k, v] of Object.entries(from ?? {})) {
    if (k in into) throw new Error(`city module ${id}: ${what} '${k}' is already used (start new keys with '${id.toLowerCase()}')`);
    into[k] = v;
  }
}

function install(m: CityModule) {
  if (installed.has(m.id)) return;
  installed.add(m.id);
  const id = m.id;
  const ch = CHAPTERS.find((c) => c.id === id);
  if (!ch) throw new Error(`city module ${id}: no chapter with that id in CHAPTERS`);
  LINES[id] = m.lines;
  QUIPS[id] = m.lines.death;
  ch.city = id;
  ch.hello = m.chapter?.hello ?? m.lines.hello;
  ch.famous = m.chapter?.famous ?? m.lines.famous;
  delete ch.teasers;
  addAll(id, 'ending kind', ENDINGS as Record<string, Ending>, m.endings);
  addAll(id, 'death cause', CAUSE_LINES, m.causeLines);
  SKINS[id] = m.skin;
  COURSES[id] = m.course;
  CITY_LINE[id] = m.cityLine;
  MUSIC[id] = m.music;
  THEMES[id] = m.theme;
  if (!CITY_ORDER.includes(id)) CITY_ORDER.push(id);
  GRADES[id] = m.grade;
  CAP[id] = m.tileCaps;
  MODULE_BACKDROPS[id] = m.backdrop;
  addAll(id, 'scene feature', MODULE_SCENE_FEATURES, m.sceneFeatures);
  for (const [k, t] of Object.entries(m.things ?? {})) {
    if (k in MODULE_THING_SIZE || k in BASE_THING_SIZE) throw new Error(`city module ${id}: thing kind '${k}' is already used (start new keys with '${id.toLowerCase()}')`);
    MODULE_THING_SIZE[k as ThingKind] = t.size;
    MODULE_THING_DRAW[k as ThingKind] = t.draw;
  }
  // last: the stages read the course, skin and endings above as they are built
  for (const l of m.levels()) {
    if (l.city !== id) throw new Error(`city module ${id}: stage ${l.id} says city ${l.city}`);
    if (LEVEL_BY_ID.has(l.id)) throw new Error(`city module ${id}: stage ${l.id} already exists`);
    LEVELS.push(l);
    LEVEL_BY_ID.set(l.id, l);
  }
}

/** install every module in the registry (idempotent); tests call it with extra throwaway modules */
export function installCityModules(mods: CityModule[] = CITY_MODULES) {
  for (const m of mods) install(m);
  // shortcut: while some cities are still in the shared LEVELS / CITY_ORDER literals, keep both in journey
  // order (stable sort); a no-op once every city is a module, remove it then
  const at = (city: string) => CHAPTERS.findIndex((c) => c.id === city);
  LEVELS.sort((a, b) => at(a.city) - at(b.city));
  CITY_ORDER.sort((a, b) => at(a) - at(b));
}

installCityModules();
