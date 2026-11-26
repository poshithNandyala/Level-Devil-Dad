// Endings: the last surprise at each stage's door. Every stage has its own and no two share one. Each city
// module declares and builds its own in its endings.ts (see docs/CITY-MODULE.md); the nine old twists live in
// twists.ts. An ending can carve its own ground (paint), ask for more road before the door (space), and keeps
// w.flags.twist up to date with what it's doing, which the test policies read.
export type { Ending } from './endkit';
import type { Ending } from './endkit';

/** filled in by city modules: `declare module` this to add an ending kind */
export interface ModuleEndingKinds {}

export type EndingKind = keyof ModuleEndingKinds;

/** every door ending; the city modules' endings are added by src/game/cities/install.ts */
export const ENDINGS = {} as Record<EndingKind, Ending>;

export const isEnding = (k: string | undefined): k is EndingKind => !!k && k in ENDINGS;
