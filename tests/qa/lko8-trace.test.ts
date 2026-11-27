import { it } from 'vitest';
import { LEVELS } from '../../src/game/levels';
import { World, NO_INPUT, type InputState } from '../../src/game/world';
import { decodeInput, replay } from '../../src/game/replay';
import { INFO } from '../helpers';
import { play } from '../runner';
import { SOLUTIONS, MISTAKES } from '../solutions';
// round 8 scratch: trace a play from the lag-0 route's first stand in one part. LKO8_STAGE, LKO8_PART, LKO8_PLAY
const R: InputState = { ...NO_INPUT, right: true };
const GEN: Record<string, (t: number) => InputState> = {
  walk: () => R,
  wait4walk: (t) => (t < 480 ? NO_INPUT : R),
  backoff: () => ({ ...NO_INPUT, left: true }),
  hop: (t) => ({ ...R, jump: t % 36 < 10, jumpPressed: t % 36 === 0 }),
  shorthop: (t) => ({ ...R, jump: t < 6, jumpPressed: t === 0 }),
};
it.runIf(!!process.env.LKO8_ROUTE)('lko8 route', () => {
  const def = LEVELS.find((d) => d.id === process.env.LKO8_ROUTE)!;
  const m = process.env.LKO8_M;
  const { log } = play(def, m ? MISTAKES[def.id][Number(m)].steps : SOLUTIONS[def.id], INFO, true);
  console.log('ROUTE\n' + log.filter((l) => l.startsWith('ended') || (process.env.LKO8_GREP && l.includes(process.env.LKO8_GREP))).join('\n'));
}, 600000);
it.runIf(!!process.env.LKO8_STAGE)('lko8 trace', () => {
  const def = LEVELS.find((d) => d.id === process.env.LKO8_STAGE)!;
  (globalThis as any).__lddRec = [];
  play(def, SOLUTIONS[def.id]);
  const rec = (globalThis as any).__lddRec as number[];
  (globalThis as any).__lddRec = undefined;
  const part = def.parts!.find((p) => p.kind === process.env.LKO8_PART)!;
  const w0 = new World(def, INFO);
  def.build?.(w0);
  let at = -1;
  for (let i = 0; i < rec.length && w0.state === 'play'; i++) {
    w0.step(decodeInput(rec[i]));
    if (w0.player.onGround && w0.player.x >= (part.x0 + 0.5) * 16) { at = i + 1; break; }
  }
  const g = GEN[process.env.LKO8_PLAY ?? 'walk'];
  const r = replay(def, INFO, rec.slice(0, at));
  r.player.vx = 0;
  const out: string[] = [`start tick ${r.tick} x0 ${part.x0}`];
  const jat = process.env.LKO8_JUMPAT ? (part.x0 + Number(process.env.LKO8_JUMPAT)) * 16 : -1;
  let jt = -1;
  for (let t = 0; t < 2400 && r.state === 'play'; t++) {
    if (jat > 0 && jt < 0 && r.player.cx >= jat) jt = t;
    r.step(jat > 0 ? { ...R, jump: jt >= 0 && t - jt < 24, jumpPressed: t === jt } : g(t));
    if (t % 10 === 0) out.push(`${r.tick} x${(r.player.cx / 16).toFixed(2)} (act+${(r.player.cx / 16 - part.x0).toFixed(2)}) y${((r.player.y + r.player.h) / 16).toFixed(2)} g${r.player.onGround ? 1 : 0}`);
  }
  out.push(`${r.state} ${r.deathCause ?? ''}@${r.tick} x${(r.player.cx / 16).toFixed(2)}`);
  console.log(out.slice(0, 80).join('\n') + '\n...\n' + out.slice(-3).join('\n'));
}, 600000);
