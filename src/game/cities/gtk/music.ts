import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// a Nepali folk lilt: major pentatonic on the madal, a bansuri line over it, 92 bpm
export const music: MusicCfg = {
  bpm: 92,
  sa: 146.83,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'ti', 'na', 'dha', 'ge', 'na', 'ti', 'na'],
  phrases: [
    [2, _, 3, 4, 3, _, 2, _, 1, _, 2, _, 0, _, _, _, 3, _, 4, 5, 4, _, 3, _, 2, 3, 2, _, 1, _, _, _],
    [4, _, 5, 6, 5, _, 4, 3, 4, _, 2, _, 3, _, _, _, 2, _, 1, _, 2, 3, 2, _, 1, _, 0, _, 1, _, _, _],
  ],
};
