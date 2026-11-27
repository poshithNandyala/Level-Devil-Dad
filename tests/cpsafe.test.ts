// Every hidden checkpoint must be a fair place to come back to (docs/CITY-MODULE.md, "Checkpoints").
// Put back at a checkpoint, Dad plays each of these, and must still be alive at the end:
//   idle      stand still for 4 s
//   run       wait `lag` ticks, run forward 0.3 s, then stand still until 4 s
//   tap-jump  wait `lag` ticks, tap jump (6 ticks) running forward until he lands, then stand still until 4 s
// at lag 0, 6 and 12 ticks (the idle play once). Cities still on the allow-list in tests/modules.test.ts
// (EXEMPT: the cities from before the 10-stage shape) keep the old check, standing still for 1.5 s, until
// their own pass takes them off that list. CPSAFE3_PENDING lists new cities that do the same until a named
// fix round lands.
//
// Each play starts from replay() of the route's inputs up to the checkpoint, as a real respawn does, so the
// cost is plays x checkpoints x route length. That is allowed to grow: a stage takes as many checkpoints
// as its play needs, and the explicit timeout below is set so no test limit decides how far a player replays.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LEVELS } from '../src/game/levels';
import { World, NO_INPUT, type InputState, type LevelDef } from '../src/game/world';
import { decodeInput, replay } from '../src/game/replay';
import { INFO } from './helpers';
import { play } from './runner';
import { SOLUTIONS } from './solutions';

/** the cities on the allow-list (EXEMPT in tests/modules.test.ts), read from that file so there is one list */
const ALLOWLISTED = new Set(
  [...(readFileSync(join(__dirname, 'modules.test.ts'), 'utf8').match(/const EXEMPT[^=]*= \{([\s\S]*?)\n\};/)?.[1].matchAll(/^\s+([A-Z]{3}):/gm) ?? [])].map((m) => m[1]),
);

/**
 * New cities that get the idle-only check for now, each with the round that removes it.
 * PAT: fails the three plays at PAT-01 cp4, PAT-02 cp3, PAT-03 cp2, PAT-04 cp0, PAT-07 cp0/1/6/8/10/11/12/13/14
 * and PAT-10 cp6/cp9 (reports/integrate-cpsafe3.md); removed by the Patna checkpoint fix round.
 */
const CPSAFE3_PENDING: string[] = [];

const TICKS = 480; // 4 s
const LAGS = [0, 6, 12];

type Play = { name: string; lag: number; input: (t: number, w: World) => InputState };
const fwd = (w: World): InputState => (w.flipped ? { ...NO_INPUT, left: true } : { ...NO_INPUT, right: true });
const PLAYS: Play[] = [
  { name: 'idle', lag: 0, input: () => NO_INPUT },
  ...LAGS.map((lag): Play => ({ name: 'run', lag, input: (t, w) => (t >= lag && t < lag + 36 ? fwd(w) : NO_INPUT) })),
  ...LAGS.map((lag): Play => {
    let landed = false;
    return {
      name: 'tap-jump',
      lag,
      input: (t, w) => {
        if (t === 0) landed = false;
        if (t < lag || landed) return NO_INPUT;
        const k = t - lag;
        if (k > 6 && w.player.onGround) landed = true;
        if (landed || k > 240) return NO_INPUT;
        return { ...fwd(w), jump: k < 6, jumpPressed: k === 0 };
      },
    };
  }),
];

/** from the world rebuilt at a checkpoint: does Dad survive this play? */
function survives(def: LevelDef, inputs: number[], p: Play): { ok: boolean; why?: string } {
  const r = replay(def, INFO, inputs);
  r.player.vx = 0;
  for (let t = 0; t < TICKS && r.state === 'play'; t++) r.step(p.input(t, r));
  return r.state === 'play' ? { ok: true } : { ok: false, why: `${r.deathCause} @x${(r.player.x / 16).toFixed(1)}` };
}

describe('checkpoints are safe to respawn at', () => {
  for (const def of LEVELS) {
    const probe = new World(def, INFO);
    def.build?.(probe);
    if (!probe.checkpoints.length) continue;
    const strict = !ALLOWLISTED.has(def.city) && !CPSAFE3_PENDING.includes(def.city);
    it(
      `${def.id}${strict ? ': idle, run and tap-jump at lag 0/6/12' : CPSAFE3_PENDING.includes(def.city) ? ': idle 1.5 s (pending its checkpoint fix)' : ': idle 1.5 s (allow-listed city)'}`,
      () => {
        (globalThis as any).__lddRec = [];
        play(def, SOLUTIONS[def.id]);
        const rec = (globalThis as any).__lddRec as number[];
        (globalThis as any).__lddRec = undefined;
        const w = new World(def, INFO);
        def.build?.(w);
        const bad: string[] = [];
        for (let i = 0; i < rec.length && w.state === 'play'; i++) {
          const cp = w.cp;
          w.step(decodeInput(rec[i]));
          if (w.cp <= cp) continue;
          const at = `cp${w.cp} x${(w.checkpoints[w.cp] / 16).toFixed(1)}`;
          const inputs = rec.slice(0, i + 1);
          if (!strict) {
            const r = replay(def, INFO, inputs);
            r.player.vx = 0;
            for (let k = 0; k < 180 && r.state === 'play'; k++) r.step(NO_INPUT);
            if (r.state !== 'play') bad.push(`${at} idle: ${r.deathCause}`);
            continue;
          }
          for (const p of PLAYS) {
            const s = survives(def, inputs, p);
            if (!s.ok) bad.push(`${at} ${p.name}${p.name === 'idle' ? '' : ` lag ${p.lag}`}: ${s.why}`);
          }
        }
        expect(bad, `${def.id} unsafe checkpoints`).toEqual([]);
      },
      300_000,
    );
  }
});
