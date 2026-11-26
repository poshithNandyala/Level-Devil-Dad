// A city as one self-contained module: everything a city adds to the game, in one object.
// A new city is a directory src/game/cities/<code>/ exporting a CityModule, plus one line in registry.ts.
// install.ts adds each module to the shared tables (LINES, LEVELS, ENDINGS, SKINS, THEMES, ...), so
// those shared files never change for a new city. Recipe: docs/CITY-MODULE.md.
import type { CityId } from '../constants';
import type { CityLines } from '../cities';
import type { LevelDef } from '../world';
import type { Ending } from '../levels/endkit';
import type { Skin } from '../levels/chunks';
import type { TourSeg } from '../levels/tour';
import type { MusicCfg } from '../../audio/audio';
import type { Theme } from '../../render/theme';
import type { Grade } from '../../render/renderer';
import type { GroundCaps } from '../../render/art/tiles';
import type { Ambient, Backdrop } from '../../render/backgrounds';
import type { SceneFeature } from '../../render/scenes';
import type { ThingDraw } from '../../render/art/things';

/** one of the city's own hidden items (or props): its box size and how to draw it */
export interface CityThing {
  size: [number, number];
  draw: ThingDraw;
}

export interface CityModule {
  /** the three-letter code, already in CityId and in CHAPTERS (docs/CITIES.md, "The journey") */
  id: CityId;
  /** everything the city says ("Local | English"); becomes LINES[id] (QUIPS fills from its `death`) */
  lines: CityLines;
  /** the map pin's text once the city is built (default: lines.hello and lines.famous); its teasers go */
  chapter?: { hello?: string; famous?: string };
  /**
   * The stages, XXX-01..XXX-10 in order (01 = tour(), the rest longStage()). A function, called once after
   * every other piece is installed, because tour() and longStage() read this city's course, skin and endings.
   */
  levels: () => LevelDef[];
  /** the door endings used by the stages' `twist` (kinds declared with `declare module`, see endings.ts) */
  endings: Record<string, Ending>;
  /** Tara's line for each new death cause: [what happened, how to beat it] */
  causeLines: Record<string, string[]>;
  /** how the city dresses the old troll sections (SKINS) */
  skin: Skin;
  /** the welcome tour's pieces (COURSES) */
  course: TourSeg[];
  /** one sentence for the postcard (CITY_LINE) */
  cityLine: string;
  /** the city's music loop (MUSIC) */
  music: MusicCfg;
  /** palette and local-script name (THEMES); the city joins CITY_ORDER in registry order */
  theme: Theme;
  /** colour grade (GRADES) */
  grade: Grade;
  /** ground caps (tiles.ts CAP) */
  tileCaps: GroundCaps;
  /** the skyline behind the stages */
  backdrop: Backdrop;
  /** the animated layer over the skyline every frame: rain, birds, kites, mist (optional) */
  ambient?: Ambient;
  /** extra features for stages with a `scene` (`scene.with: ['<name>']`) */
  sceneFeatures?: Record<string, SceneFeature>;
  /** the city's own thing kinds (hidden item, props), declared with `declare module` in its things.ts */
  things?: Record<string, CityThing>;
}

/** the test side of a city: tests/cities/<code>.ts exports `test: CityTests` (found by tests/city-tests.ts) */
export interface CityTestsShape<Step, Policy, ActRoute> {
  /** fills in the stage routes: S['XXX-0n'] = [...]; lengthen('XXX-0n', drop, extra) */
  solutions: (S: Record<string, Step[]>, lengthen: (id: string, drop: number, extra: Step[]) => void) => void;
  /** the obvious play per stage, and the cause it must die of */
  naive: Record<string, { steps: Step[]; cause?: string }>;
  /** the obvious correction after the first death, which dies too (at least 5 of the 10 stages) */
  fix?: Record<string, { steps: Step[]; cause?: string }>;
  /** more scripted first-timer deaths and 'like last time' moves per stage (as MISTAKES in tests/solutions.ts) */
  mistakes?: Record<string, { what: string; steps: Step[]; cause?: string }[]>;
  /** a route for each act, by act id */
  actRoutes: Record<string, ActRoute>;
  /** a policy for each door ending, by ending kind */
  endingPolicies: Record<string, Policy>;
  /** stage ids whose precision sections the human-timing check (LDD_FAIR) runs by default */
  fair?: string[];
}
