import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// A slow Lakhnavi evening in raga Yaman's colour (the sharp fourth), tabla keeping an unhurried theka,
// the melody leaning on Ga and Ni the way a thumri does
export const music: MusicCfg = {
  bpm: 84,
  sa: 146.83,
  scale: [0, 2, 4, 6, 7, 9, 11],
  theka: ['dha', null, 'ge', 'na', 'dha', 'ti', 'na', null],
  phrases: [
    [6, _, 5, _, 4, _, 3, 2, _, _, 1, 2, 4, _, _, _, 2, _, 3, 4, 3, _, 2, _, 1, _, 0, _, _, _, _, _],
    [4, _, 5, 6, 7, _, 6, _, 5, _, 4, _, 3, 4, _, _, 2, _, 1, _, 2, 4, _, 3, 2, _, 1, _, 0, _, _, _],
  ],
};
