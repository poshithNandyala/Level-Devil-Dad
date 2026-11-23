// The new bar, checked for every room:
//  - the natural first try dies; the obvious fix dies (unless the room says one trick is enough)
//  - the solution clears, in 5-12 s for regular rooms
//  - the solution survives human timing (inputs early or late) 90%+ of the time
import { describe, expect, test } from 'vitest';
import { DOORS } from '../src/rooms/doors';
import type { RoomDef } from '../src/rooms/types';
import { humanize, run } from './roomrun';

const ALL: RoomDef[] = DOORS.flatMap((d) => d.rooms);

describe('rooms', () => {
  for (const r of ALL) {
    describe(`${r.id} ${r.name}`, () => {
      test('the natural first try dies', () => {
        const o = run(r, r.natural);
        expect(o.state, `natural ended ${o.state} at t=${o.t.toFixed(2)} x=${o.x}`).toBe('dead');
      });
      test(r.fixWins ? 'the obvious fix works (one-trick room)' : 'the obvious fix dies too', () => {
        if (!r.fix) return;
        const o = run(r, r.fix);
        expect(o.state, `fix ended ${o.state} (${o.cause}) at t=${o.t.toFixed(2)} x=${o.x} y=${o.y}`).toBe(r.fixWins ? 'won' : 'dead');
      });
      test('the solution clears', () => {
        const o = run(r, r.solution);
        expect(o.state, `solution ended ${o.state} (${o.cause}) at t=${o.t.toFixed(2)} x=${o.x} y=${o.y}`).toBe('won');
        if (process.env.LDD_TIMES) console.log(`${r.id} solved in ${o.t.toFixed(2)} s`);
      });
      test('human timing clears it 90%+ of the time', () => {
        const N = 200;
        let ok = 0;
        const fails: string[] = [];
        for (let i = 0; i < N; i++) {
          const o = run(r, humanize(r.solution, i + 1, 16));
          if (o.state === 'won') ok++;
          else if (fails.length < 4) fails.push(`${o.state}:${o.cause}@${o.t.toFixed(2)}`);
        }
        if (process.env.LDD_TIMES) console.log(`${r.id} human ${((ok / N) * 100).toFixed(0)}%`, fails.join(' '));
        expect(ok / N, `${ok}/${N} ${fails.join(' ')}`).toBeGreaterThanOrEqual(0.9);
      });
    });
  }
});
