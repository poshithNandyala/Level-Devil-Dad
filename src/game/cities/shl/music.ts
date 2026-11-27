import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Shillong: slow, 76 bpm, a minor pentatonic with a bright major lift (the 6th), a light duitara-style pluck over soft rain-percussion
export const music: MusicCfg = {
  bpm: 76,
  sa: 146.83,
  scale: [0, 3, 5, 7, 9, 10],
  theka: ['ti', 'na', 'ti', 'na', 'dha', 'na', 'ti', 'na'],
  phrases: [
    [0, _, 1, _, 2, _, 1, 0, _, _, 3, _, 2, _, 1, _, 0, _, 1, 2, _, _, 1, _, 0, _, _, _, _, _, _, _],
    [3, _, 4, _, 3, 2, _, _, 1, _, 2, _, 4, _, 3, _, 2, _, 1, _, 0, _, 1, _, 0, _, _, _, _, _, _, _],
  ],
};
