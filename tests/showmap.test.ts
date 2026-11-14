import { it } from 'vitest';
import { LEVEL_BY_ID } from '../src/game/levels';
import { SOLUTIONS } from './solutions';
// LDD_SHOW=KVT-02,KVT-03 npx vitest run tests/showmap.test.ts --silent=false
it.runIf(!!process.env.LDD_SHOW)('show maps', () => {
  for (const id of process.env.LDD_SHOW!.split(',')) {
    const d = LEVEL_BY_ID.get(id)!;
    console.log(`== ${id} ${d.name} (par ${d.par})`);
    d.map.forEach((r, y) => { if (/[^.]/.test(r) || y > 3) console.log(String(y).padStart(2), r); });
    const sol = SOLUTIONS[id];
    console.log('  last steps:', sol.slice(-5).map((s) => JSON.stringify({ h: s.hold, j: s.jump, n: s.note, u: s.until ? s.until.toString().slice(0, 70) : undefined })).join('\n   '));
  }
});
