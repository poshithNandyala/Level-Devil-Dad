import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// A slow hill tune: pentatonic with a rising line, hand drum under a flute-like lead (docs/cities/ITA.md section 6). No real song.
export const music: MusicCfg = {
  bpm: 84,
  sa: 174.61,
  scale: [0, 2, 4, 7, 9],
  theka: ['dha', 'na', 'ti', 'na', 'dha', 'ge', 'na', 'ti'],
  phrases: [
    [0, _, 1, _, 2, _, 4, _, 3, _, 2, _, 4, _, 5, _, 4, _, 3, 2, 1, _, 2, _, 4, _, _, _, 2, _, _, _],
    [2, _, 4, _, 5, _, 6, _, 5, _, 4, _, 2, _, 1, _, 2, _, 4, 5, 4, _, 2, _, 1, _, 0, _, 1, _, _, _],
  ],
};
