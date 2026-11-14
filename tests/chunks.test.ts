// Every troll section, in every city's dress: the proven route clears it, and walking straight in dies.
import { describe, expect, it } from 'vitest';
import type { LevelDef } from '../src/game/world';
import { CHUNK_W, ChunkKind, longStage } from '../src/game/levels/chunks';
import { Grid } from '../src/game/levels/grid';
import { door, rival } from '../src/game/levels/kit';
import { LINES } from '../src/game/cities';
import { play, X, done } from './runner';
import { longRun } from './chunks';

const KINDS = Object.keys(CHUNK_W) as ChunkKind[];
const CITIES = ['TVM', 'KVT', 'CHN', 'PDY', 'BLR', 'AMR', 'HYD', 'BOM'] as const;

function room(city: (typeof CITIES)[number]): LevelDef {
  return {
    id: `${city}-T`,
    city,
    index: 9,
    name: 'test',
    hint: '',
    map: Grid.ground().put(2, 14, '@').put(28, 14, 'E').rows(),
    build(w) {
      door(w);
      rival(w, 6, 15, 1, { intro: LINES[city].intro[0], point: 1, taunts: LINES[city].taunt, beaten: LINES[city].beaten[0] });
    },
  };
}

describe('troll sections', () => {
  for (const kind of KINDS)
    for (const city of CITIES) {
      it(`${kind} (${city})`, () => {
        const def = longStage({ base: room(city), parts: [kind, 'birds'] });
        const { w, log } = play(def, longRun(def, [{ hold: 'R', until: X(32), max: 600 }]), undefined, true);
        if (w.state !== 'won') console.log(log.slice(-25).join('\n'));
        expect(w.state, `${kind}/${city}: ${w.deathCause}`).toBe('won');
        if (kind !== 'awning' && kind !== 'jets' && kind !== 'terraces') {
          const n = play(def, [{ hold: 'R', until: done, max: 2400 }]).w;
          expect(n.state, `${kind}/${city} naive`).toBe('dead');
        }
      });
    }
});
