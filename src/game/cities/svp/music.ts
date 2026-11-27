import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// The islands' mix: a khol, a thavil and a dholak taking turns under a steady major tune, 104 bpm.
// The long note on the downbeat of each phrase is the ship's horn.
export const music: MusicCfg = {
  bpm: 104,
  sa: 174.61,
  scale: [0, 2, 4, 5, 7, 9, 11],
  theka: ['dha', 'ti', 'na', 'dha', 'ge', 'ti', 'na', 'ge'],
  phrases: [
    [0, _, _, _, 4, _, 2, 4, 5, _, 4, _, 2, _, 0, _, 2, _, 4, 5, 7, _, 5, _, 4, _, 2, _, 0, _, _, _],
    [7, _, _, _, 5, _, 4, 5, 7, _, 9, _, 7, _, 5, _, 4, _, 5, 4, 2, _, 4, _, 2, _, 0, 2, 0, _, _, _],
    [4, _, 5, _, 7, _, 7, 5, 4, _, 2, _, 4, _, _, _, 5, _, 7, _, 9, _, 7, 5, 4, _, 2, _, 0, _, _, _],
  ],
};
