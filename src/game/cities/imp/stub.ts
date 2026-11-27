// temporary placeholders while the stages are written one by one (deleted before the city is handed over)
import type { Act } from '../../levels/acts';
import type { LevelDef, World } from '../../world';
import { Grid } from '../../levels/grid';
import { collectible, door, rival } from '../../levels/kit';
import { taraScript } from './common';

export const stubRoom = (n: number, name: string): LevelDef => ({
  id: `IMP-${String(n).padStart(2, '0')}`,
  city: 'IMP',
  index: n,
  name,
  nameEn: name,
  tagline: name,
  hint: 'placeholder',
  par: 30,
  map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
  build(w: World) {
    door(w);
    rival(w, 3, 15, 1, taraScript(n));
    collectible(w, 'imp-chakhao', 16, 11.6);
  },
});
export const stubAct = (id: string): Act => ({ id, w: 10, advice: 'placeholder', build: () => {} });
