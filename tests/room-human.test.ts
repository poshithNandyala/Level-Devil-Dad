import { test } from 'vitest';
import { ROOM_BY_ID } from '../src/rooms/doors';
import { humanize, run } from './roomrun';
test('human fails', () => {
  const id = process.env.LDD_ROOM!;
  if (!id) return;
  const def = ROOM_BY_ID[id];
  let shown = 0;
  for (let i = 0; i < 200 && shown < +(process.env.LDD_SHOW ?? 3); i++) {
    const segs = humanize(def.solution, i + 1, 16);
    const o = run(def, segs);
    if (o.state !== 'won') {
      shown++;
      console.log(`seed ${i + 1}: ${o.state} ${o.cause} t=${o.t.toFixed(2)} x=${o.x} y=${o.y} segs=${JSON.stringify(segs)}`);
    }
  }
});
