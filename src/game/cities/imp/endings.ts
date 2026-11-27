// Imphal's door endings. Most Imphal doors are PLAIN (the road ends at the door and you walk in): no legal new
// door idea was found for them, and a borrowed one is not allowed (docs/ALLOCATION.md, doors). The one built
// ending is IMP-08's hatch in the market roof. Kinds start with 'imp-'.
import type { Ending } from '../../levels/endkit';
import { ending as imaHatch } from './s08';

export type ImpEndingKind = 'imp-ima-hatch';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ImpEndingKind, true> {}
}

export const endings: Record<ImpEndingKind, Ending> = { 'imp-ima-hatch': imaHatch };
