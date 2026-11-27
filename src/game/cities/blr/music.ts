import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// a breezy minor pentatonic for Bengaluru
export const music: MusicCfg = {
  bpm: 104,
  sa: 164.81,
  scale: [0, 3, 5, 7, 10],
  theka: ['dha', 'ti', 'na', 'ge', 'na', 'ti', 'dha', _],
  phrases: [
    [2, _, 3, _, 4, _, 3, _, 2, _, _, _, 1, _, 2, _, 0, _, _, _, 1, _, 2, _, 3, _, _, _, _, _, _, _],
    [4, _, 5, _, 4, _, 3, _, 2, _, 3, _, 1, _, _, _, 2, _, 1, _, 0, _, -1, _, 0, _, _, _, _, _, _, _],
  ],
};
