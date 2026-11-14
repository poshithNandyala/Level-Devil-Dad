import { World, LevelDef, InputState, NO_INPUT, AttemptInfo } from '../src/game/world';

export const INFO: AttemptInfo = { attempt: 1, deaths: 0, justDied: false, rival: 'tara', character: 'papa' };

export function emptyMap(fill: (rows: string[][]) => void): string[] {
  const rows: string[][] = [];
  for (let y = 0; y < 18; y++) rows.push(Array.from({ length: 32 }, () => (y >= 15 ? '#' : '.')));
  fill(rows);
  return rows.map((r) => r.join(''));
}

export function makeWorld(map: string[], build?: (w: World) => void): World {
  const def: LevelDef = { id: 'TST-00', city: 'HYD', index: 0, name: 'test', hint: '', map, build };
  const w = new World(def, INFO);
  def.build?.(w);
  return w;
}

export function inp(p: Partial<InputState>): InputState {
  return { ...NO_INPUT, ...p };
}
