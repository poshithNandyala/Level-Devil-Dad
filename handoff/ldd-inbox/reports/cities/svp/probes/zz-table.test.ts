import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { LEVELS } from '../src/game/levels';
import { play } from './runner';
import { NAIVE, FIX, MISTAKES } from './solutions';
// scratch: probe table 1 (every act id of every SVP stage with the scripted plays that die in it) and the same-tick FIX scan
it.runIf(!!process.env.LDD_TABLE)('probe table 1', () => {
  const LABEL: Record<string, string> = JSON.parse(process.env.LDD_LABELS ?? '{}');
  const rows: string[] = [];
  const scan: string[] = [];
  for (const def of LEVELS) {
    if (!def.id.startsWith('SVP-')) continue;
    const run = (steps: any[]) => {
      try {
        const { w } = play(def, steps);
        return w.state === 'dead' ? `${w.deathCause}@${w.deathTick}` : `${w.state}`;
      } catch (e) {
        return 'ERR';
      }
    };
    const plays: { act: string; what: string; res: string }[] = [];
        if (FIX[def.id]) plays.push({ act: (FIX[def.id] as any).act ?? 'room', what: 'FIX (stage)', res: run(FIX[def.id].steps) });
    for (const m of MISTAKES[def.id] ?? []) plays.push({ act: (m as any).act ?? 'room', what: m.what, res: run(m.steps) });
    const nv = NAIVE[def.id] ? run(NAIVE[def.id].steps) : '-';
    const fx = FIX[def.id] ? run(FIX[def.id].steps) : '-';
    const pairOk = nv.split('@')[0] !== fx.split('@')[0] && nv.split('@')[1] !== fx.split('@')[1];
    rows.push(`| ${def.id} | STAGE PAIR | NAIVE / FIX | ${nv}; ${fx} | | | ${pairOk ? 'ok' : def.id === 'SVP-01' ? 'same cause (one-trap tour, ruled)' : 'SAME CAUSE OR TICK'} |`);
    if (NAIVE[def.id]) plays.push({ act: 'room', what: 'NAIVE', res: nv });
    const acts = [...(def.parts ?? []).map((p) => p.kind), 'door'];
    for (const a of ['room', ...acts]) {
      const ps = plays.filter((p) => p.act === a);
      const causes = new Set(ps.map((p) => p.res.split('@')[0]));
      const ticks = new Set(ps.map((p) => p.res.split('@')[1]));
      const ok = ps.length >= 2 && causes.size >= 2 && ticks.size >= 2;
      const withNaive = a !== 'room' && a !== 'door' && ps.length === 1 && ps[0].what === 'FIX (stage)' ? 'FIX of the stage; its NAIVE is the room\'s' : '';
      const lab = LABEL[a] ?? '';
      const verdict = a === 'room' && ps.length === 1 && ps[0].what === 'NAIVE' ? 'NAIVE only: the stage FIX is carried by the act marked FIX' : a === 'room' && ps.length === 0 ? 'covered by the stage pair' : lab.includes('momentum') && ps.length === 0 ? 'labelled momentum beat: the room again, no trap of its own' : lab.includes('shelter') ? 'labelled shelter beat: the room\'s rule, the room\'s two mistakes' : a === 'door' ? (ps.length ? 'door: baited play dies' : 'plain door, no idea (ruled)') : withNaive ? withNaive : ps.length === 0 ? 'NO SCRIPTED DEATH' : ok ? 'ok' : ps.length < 2 ? 'ONE TRAP' : 'SAME CAUSE OR TICK';
      rows.push(`| ${def.id} | ${a} | ${LABEL[a] ?? ''} | ${ps.map((p) => p.res).join('; ') || '-'} | ${causes.size} | ${ticks.size} | ${verdict} |`);
    }
    // same-tick scan: any two plays of the stage with the same cause and tick
    const seen = new Map<string, string>();
    for (const p of plays) {
      const k = p.res;
      if (seen.has(k)) scan.push(`| ${def.id} | ${k} | ${seen.get(k)} | ${p.act}: ${p.what} |`);
      else seen.set(k, `${p.act}: ${p.what}`);
    }
  }
  const out = ['| Stage | Part | Label | Scripted deaths cause@tick | Causes | Ticks | Verdict |', '|---|---|---|---|---|---|---|', ...rows, '', '| Stage | Cause@tick | Play 1 | Play 2 |', '|---|---|---|---|', ...scan];
  writeFileSync(process.env.LDD_TABLE!, out.join('\n') + '\n');
});
