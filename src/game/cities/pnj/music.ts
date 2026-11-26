import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// a quick dulpod feel (3+3+2) on a bright Mixolydian: a Goan band at a village feast
export const music: MusicCfg = {
  bpm: 126,
  sa: 164.81,
  scale: [0, 2, 4, 5, 7, 9, 10],
  theka: ['dha', 'na', 'ti', 'dha', 'na', 'ti', 'dha', 'ge'],
  phrases: [
    [4, _, 5, 6, _, 5, 4, _, 2, _, 3, 4, _, 3, 2, _, 1, _, 0, 1, _, 2, 4, _, 5, _, 4, 2, _, _, _, _],
    [7, _, 6, 5, _, 6, 4, _, 5, _, 3, 4, _, 2, 3, _, 1, _, 2, 0, _, 1, -1, _, 0, _, _, _, _, _, _, _],
  ],
};
