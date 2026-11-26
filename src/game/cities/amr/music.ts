import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Kalyani colours with a jathi-like pulse
export const music: MusicCfg = {
  bpm: 108,
  sa: 155.56,
  scale: [0, 2, 4, 6, 7, 9, 11],
  theka: ['dha', 'ti', 'dha', 'ge', 'na', 'ti', 'dha', 'na'],
  phrases: [
    [0, _, 2, _, 4, _, 3, _, 4, _, 5, _, 6, _, _, _, 5, _, 4, _, 3, _, 2, _, 4, _, _, _, _, _, _, _],
    [7, _, 6, _, 5, _, 4, _, 5, _, 3, _, 4, _, _, _, 2, _, 3, _, 1, _, 2, _, 0, _, _, _, _, _, _, _],
  ],
};
