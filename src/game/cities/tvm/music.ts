import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Kerala: brisk chenda-like groove on Mohanam (major pentatonic)
export const music: MusicCfg = {
  bpm: 112,
  sa: 146.83,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'dha', 'ti', 'na', 'dha', 'ge', 'ti', 'na'],
  phrases: [
    [0, _, 2, _, 4, _, 2, _, 3, _, 4, _, 5, _, _, _, 4, _, 3, _, 2, _, 1, _, 0, _, _, _, _, _, _, _],
    [5, _, 4, _, 3, _, 4, _, 2, _, _, _, 3, _, 1, _, 2, _, 0, _, 1, _, -1, _, 0, _, _, _, _, _, _, _],
  ],
};
