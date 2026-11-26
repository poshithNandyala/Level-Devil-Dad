// Sri Vijaya Puram's door endings, one per stage 02-10, each a new idea. Kinds start with 'svp-'.
import type { Ending } from '../../levels/endkit';
import { timberStack } from './s02';
import { boardBridge } from './s03';
import { jettyGuard } from './s04';
import { noteDoor } from './s05';
import { boughDoor } from './s06';

export type SvpEndingKind = 'svp-timber-stack' | 'svp-board-bridge' | 'svp-jetty-guard' | 'svp-note-door' | 'svp-bough-door';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<SvpEndingKind, true> {}
}

export const endings: Record<SvpEndingKind, Ending> = {
  'svp-timber-stack': timberStack,
  'svp-board-bridge': boardBridge,
  'svp-jetty-guard': jettyGuard,
  'svp-note-door': noteDoor,
  'svp-bough-door': boughDoor,
};
