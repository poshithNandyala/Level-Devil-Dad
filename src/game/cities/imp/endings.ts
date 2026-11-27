// Imphal's door endings: all nine doors are PLAIN (the road ends at the door and you walk in). No legal new door
// idea was found for them in the time the city had, and a borrowed one is not allowed (docs/ALLOCATION.md, doors;
// BUILD.md records the check). Each stage still carries its own `meta.ending` key ('imp-...-plain').
import type { Ending } from '../../levels/endkit';

export type ImpEndingKind = never;

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ImpEndingKind, true> {}
}

export const endings: Record<ImpEndingKind, Ending> = {};
