import { it } from 'vitest';
import { SOLUTIONS } from './solutions';
it.runIf(!!process.env.LDD_S)('steps', () => {
  const id = process.env.LDD_S!;
  console.log('STEPS\n' + SOLUTIONS[id].map((s, i) => `${i} ${s.note ?? ''} hold=${s.hold} jump=${s.jump} ticks=${s.ticks}`).join('\n'));
});
