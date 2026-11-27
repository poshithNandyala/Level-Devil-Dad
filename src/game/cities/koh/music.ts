import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// Kohima: 92 bpm, pentatonic major, a slow choir-like tune, the log drum on beat 1 only (bible section 6); no real song
export const music: MusicCfg = {
  bpm: 92,
  sa: 174.61,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', null, 'na', null, 'na', null, 'na', null],
  phrases: [
    [0, _, _, 2, _, _, 4, _, _, _, 2, _, 0, _, _, _, 1, _, _, 2, _, _, 1, _, 0, _, _, _, _, _, _, _],
    [4, _, _, 3, _, _, 2, _, _, _, 4, _, 3, _, _, _, 2, _, _, 1, _, _, 2, _, 0, _, _, _, _, _, _, _],
  ],
};
