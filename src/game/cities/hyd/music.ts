import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Bhupali (major pentatonic): bright and sunny for Hyderabad
export const music: MusicCfg = {
  bpm: 96,
  sa: 146.83,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'ge', 'na', 'ti', 'na', _, 'dha', 'na'],
  phrases: [
    [0, _, 1, _, 2, _, _, _, 3, _, 2, _, 1, _, _, _, 2, _, 1, _, 0, _, _, _, 1, _, 0, _, -1, _, _, _],
    [3, _, 4, _, 5, _, _, _, 4, _, 3, _, 2, _, _, _, 3, _, 2, _, 1, _, 2, _, 0, _, _, _, _, _, _, _],
  ],
};
