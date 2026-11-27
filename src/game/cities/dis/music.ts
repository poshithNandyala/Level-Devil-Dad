import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Bihu: a driving dhol beat (dha ge na ti...), major pentatonic, the pepa leading in short rising calls
export const music: MusicCfg = {
  bpm: 120,
  sa: 164.81,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'dha', 'ti', 'dha', 'ge', 'na', 'dha', 'ti'],
  phrases: [
    [0, _, 2, 4, 4, _, 3, 2, 0, _, 2, _, 4, _, _, _, 2, _, 4, 5, 4, _, 3, 2, 3, _, 2, _, 0, _, _, _],
    [4, _, 4, 5, 6, _, 5, 4, 2, _, 4, _, 3, 2, 0, _, 0, _, 2, 4, 2, _, 0, _, 4, _, 3, 2, 0, _, _, _],
  ],
};
