import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Slow (80 bpm), pentatonic, a pung-style hand drum played gently on beats 1 and 3 only (no beat-forced hops).
export const music: MusicCfg = {
  bpm: 80,
  sa: 146.83,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', _, 'ti', _, 'dha', _, 'na', _],
  phrases: [
    [0, _, 2, _, 4, _, _, _, 7, _, 4, _, 2, _, _, _, 4, _, 7, _, 9, _, _, _, 7, _, 4, _, 2, _, _, _],
    [9, _, 7, _, 4, _, _, _, 2, _, 4, _, 0, _, _, _, 2, _, 4, _, 7, _, _, _, 4, _, 2, _, 0, _, _, _],
  ],
};
