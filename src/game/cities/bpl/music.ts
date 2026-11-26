import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Yaman-ish for a lakeside evening in Bhopal
export const music: MusicCfg = {
  bpm: 104,
  sa: 146.83,
  scale: [0, 2, 4, 6, 7, 9, 11],
  theka: ['dha', 'na', 'ti', 'na', 'ge', 'na', 'dha', 'ti'],
  phrases: [
    [6, _, 0, 2, 3, _, 2, _, 4, _, 3, 2, 1, _, 0, _, 2, _, 3, 4, 6, _, 4, _, 3, _, 2, _, 0, _, _, _],
    [4, _, 6, 7, 6, _, 4, _, 3, 4, 2, _, 3, _, _, _, 1, _, 2, 3, 2, _, 0, _, 6, _, 0, _, 0, _, _, _],
  ],
};
