import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Baul-flavoured folk at 110 bpm: a major pentatonic ektara line over a dhak-and-khol theka
export const music: MusicCfg = {
  bpm: 110,
  sa: 146.83,
  scale: [0, 2, 4, 7, 9, 12, 14],
  theka: ['dha', 'dha', 'ti', 'na', 'dha', 'ge', 'ti', 'na'],
  phrases: [
    [0, _, 2, _, 3, 2, 1, _, 2, _, 3, _, 4, _, 3, 2, 1, _, 2, 1, 0, _, _, _, 1, _, 2, _, 0, _, _, _],
    [4, _, 5, 4, 3, _, 4, _, 3, 2, 1, _, 2, _, _, _, 3, _, 2, 1, 2, _, 3, _, 1, _, 0, _, 0, _, _, _],
  ],
};
