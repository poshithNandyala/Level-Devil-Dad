import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// A Bihari folk tune on the dholak: major pentatonic close to Bilawal, kaharwa eight-beat (dha ge na ti | na ka dhi na)
export const music: MusicCfg = {
  bpm: 100,
  sa: 164.81,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'ge', 'na', 'ti', 'na', 'ge', 'dha', 'na'],
  phrases: [
    [2, _, 3, 2, 1, _, 2, _, 4, _, 3, 2, 1, _, 0, _, 1, _, 2, 3, 2, _, 1, _, 0, _, 1, _, 0, _, _, _],
    [4, _, 5, 4, 3, _, 4, _, 2, _, 3, 2, 1, _, 2, _, 3, _, 2, 1, 0, _, 1, _, 2, _, 1, _, 0, _, _, _],
  ],
};
