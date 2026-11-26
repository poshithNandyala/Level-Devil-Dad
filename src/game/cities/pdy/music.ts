import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// a jaunty waltz-ish major melody
export const music: MusicCfg = {
  bpm: 100,
  sa: 174.61,
  scale: [0, 2, 4, 5, 7, 9, 11],
  theka: ['dha', 'na', 'na', 'dha', 'na', 'na', 'dha', 'ti'],
  phrases: [
    [4, _, 3, 2, _, 3, 4, _, 4, 4, _, _, 3, _, 3, 3, _, _, 4, _, 6, 6, _, _, 4, _, 3, 2, _, _, _, _],
    [2, _, 3, 4, _, 2, 0, _, 1, 2, _, _, 1, _, 0, -1, _, _, 0, _, 2, 4, _, _, 3, _, 1, 0, _, _, _, _],
  ],
};
