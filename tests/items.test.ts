// Every stage hides exactly one item for the third star, out in the open (never inside a wall).
import { describe, expect, it } from 'vitest';
import { LEVELS } from '../src/game/levels';
import { World } from '../src/game/world';
import { Collectible } from '../src/game/entities/traps';
import { INFO } from './helpers';
import { TILE } from '../src/game/constants';

describe('hidden items', () => {
  for (const def of LEVELS) {
    it(`${def.id} has one reachable-looking item`, () => {
      const w = new World(def, INFO);
      def.build?.(w);
      const items = w.entities.filter((e) => e instanceof Collectible) as Collectible[];
      expect(items.length).toBe(1);
      const c = items[0];
      expect(c.x).toBeGreaterThan(8);
      expect(c.x).toBeLessThan(w.W - 8);
      expect(c.y).toBeGreaterThan(8);
      // not buried in the tile map
      const t = w.tileAt(Math.floor(c.x / TILE), Math.floor(c.y / TILE));
      expect(w.isSolidTile(t)).toBe(false);
    });
  }
});
