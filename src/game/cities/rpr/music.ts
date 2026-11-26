import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// a bright pentatonic for Chhattisgarhi folk (mandar and bansuri)
export const music: MusicCfg = {
  bpm: 112,
  sa: 164.81,
  scale: [0, 2, 4, 7, 9, 12, 14],
  theka: ['dha', 'ti', 'na', 'dha', 'ge', 'ti', 'na', 'na'],
  phrases: [
    [2, _, 3, 4, 3, _, 2, _, 1, _, 2, 3, 2, _, 0, _, 0, _, 1, 2, 3, _, 4, _, 5, _, 4, _, 3, _, _, _],
    [5, _, 4, 3, 4, _, 2, _, 3, 2, 1, _, 2, _, _, _, 0, _, 1, 2, 1, _, 0, _, 2, _, 1, _, 0, _, _, _],
  ],
};
