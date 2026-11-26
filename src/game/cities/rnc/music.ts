import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Nagpuri dhun: a bright folk scale on the dhol-mandar, flute over it
export const music: MusicCfg = {
  bpm: 116,
  sa: 155.56,
  scale: [0, 2, 4, 5, 7, 9, 10],
  theka: ['dha', 'ge', 'na', 'ti', 'na', 'ge', 'dha', 'ti'],
  phrases: [
    [4, _, 5, 4, 3, _, 4, _, 5, _, 6, 5, 4, _, 3, _, 2, _, 3, 4, 3, _, 2, _, 1, _, 2, _, 0, _, _, _],
    [7, _, 6, 5, 6, _, 4, _, 5, 4, 3, _, 4, _, _, _, 2, _, 1, 0, 1, _, 2, _, 4, _, 3, _, 2, _, _, _],
  ],
};
