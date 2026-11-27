import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Odissi-flavoured: a Bhupali-like pentatonic (Sa Re Ga Pa Dha) on the mardala, the flute over it, 96 bpm
export const music: MusicCfg = {
  bpm: 96,
  sa: 146.83,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'ti', 'na', 'ge', 'dha', 'na', 'ti', 'na'],
  phrases: [
    [2, _, 3, 4, 3, _, 2, _, 1, _, 2, 3, 2, _, 1, _, 0, _, 1, 2, 4, _, 3, _, 2, _, 1, _, 0, _, _, _],
    [4, _, 5, 4, 3, 2, 3, _, 4, _, _, 3, 2, _, 1, _, 2, _, 3, _, 2, 1, 0, _, 1, _, 2, _, 0, _, _, _],
  ],
};
