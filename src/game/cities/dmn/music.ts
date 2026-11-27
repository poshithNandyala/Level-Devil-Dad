import type { MusicCfg } from '../../../audio/audio';

const _ = null;
// a garba-ish lilt on Khamaj (major with a flat seventh), for the Gujarati coast
export const music: MusicCfg = {
  bpm: 116,
  sa: 155.56,
  scale: [0, 2, 4, 5, 7, 9, 10],
  theka: ['dha', null, 'ti', 'dha', 'na', null, 'dha', 'ti'],
  phrases: [
    [2, _, 4, _, 5, 4, 2, _, 4, _, 2, 1, 0, _, _, _, 1, _, 2, _, 4, 2, 1, _, 0, _, _, _, _, _, _, _],
    [5, _, 6, _, 7, 6, 5, _, 4, _, 5, 4, 2, _, _, _, 4, _, 2, _, 1, 2, 0, _, -1, _, 0, _, _, _, _, _],
  ],
};
