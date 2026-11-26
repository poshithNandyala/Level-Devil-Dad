// Sri Vijaya Puram's door endings, one per stage 02-10, each a new idea. Kinds start with 'svp-'.
import type { Ending } from '../../levels/endkit';
import { timberStack } from './s02';
import { boardBridge } from './s03';
import { jettyGuard } from './s04';

export type SvpEndingKind = 'svp-timber-stack' | 'svp-board-bridge' | 'svp-jetty-guard';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<SvpEndingKind, true> {}
}

export const endings: Record<SvpEndingKind, Ending> = {
  'svp-timber-stack': timberStack,
  'svp-board-bridge': boardBridge,
  'svp-jetty-guard': jettyGuard,
};
