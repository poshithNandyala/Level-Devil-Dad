// Shillong's doors. Fix round 1 (QA F2) made all nine plain: the road ends at the door and you walk in. Each stage keeps
// its own ending kind (the allocation's `meta.ending` and the game-wide unique-key rule need one), but a plain door has
// no trap, no tell and no death play. Kinds start with 'shl-'.
import type { Ending } from '../../levels/endkit';

const plain = (advice: string): Ending => ({ space: 9, advice, build() {} });

export type ShlEndingKind = 'shl-dish' | 'shl-tollbar' | 'shl-halfdoor' | 'shl-pool' | 'shl-rootdoor' | 'shl-column' | 'shl-tap' | 'shl-board' | 'shl-tallgate';

declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<ShlEndingKind, true> {}
}

export const endings: Record<ShlEndingKind, Ending> = {
  'shl-dish': plain('The view-point rail door at the end of the path: just a door. Walk in.'),
  'shl-tollbar': plain('The door stands at the far tower, on the bank: just a door. Walk in.'),
  'shl-halfdoor': plain('The house door at the end of the lane: just a door. Walk in.'),
  'shl-pool': plain('The door is on the dry rock past the last sister: just a door. Walk in.'),
  'shl-rootdoor': plain('The door is on the far bank: just a door. Walk in.'),
  'shl-column': plain('The cave mouth at the end: just a door. Walk out.'),
  'shl-tap': plain('The door is beyond the last tank: just a door. Walk in.'),
  'shl-board': plain('The market gate at the end of the rows: just a gate. Walk through.'),
  'shl-tallgate': plain('The gate at the bottom of the steps: just a gate. Walk through.'),
};
