// Record each stage's proven route and where its door ending starts, for the browser QA shots:
//   LDD_ENDREC=1 npx vitest run tests/endrec.test.ts   (writes /tmp/rec/<id>.json)
import { it } from 'vitest';
import { writeFileSync } from 'fs';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { SOLUTIONS } from './solutions';

it.runIf(!!process.env.LDD_ENDREC)('record endings', () => {
  for (const def of LEVELS) {
    if (process.env.LDD_ID && !process.env.LDD_ID.split(',').includes(def.id)) continue;
    let from = -1;
    const steps = SOLUTIONS[def.id].map((s) =>
      s.policy && (s.note ?? '').startsWith('the door')
        ? { ...s, policy: (w: any) => { if (from < 0) from = w.tick; return s.policy!(w); } }
        : s,
    );
    (globalThis as any).__lddRec = [];
    const { w } = play(def, steps);
    const rec = (globalThis as any).__lddRec as number[];
    (globalThis as any).__lddRec = undefined;
    if (def.id.endsWith('-01')) from = 0;
    writeFileSync(`/tmp/rec/${def.id}.json`, JSON.stringify({ rec, from, end: w.tick, state: w.state, ending: def.ending ?? '' }));
  }
});
