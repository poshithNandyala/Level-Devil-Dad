import { test } from 'vitest';
import { NO_INPUT } from '../src/game/world';
import { ROOM_BY_ID } from '../src/rooms/doors';
import { TileGroup } from '../src/game/entities/group';
import { build, ticksOf } from './roomrun';
test('trace', () => {
  const id = process.env.LDD_ROOM!;
  if (!id) return;
  const def = ROOM_BY_ID[id];
  const segs = process.env.LDD_SEGS ? JSON.parse(process.env.LDD_SEGS) : def.solution;
  const ins = ticksOf(segs);
  const w = build(def);
  const every = +(process.env.LDD_EVERY ?? 10);
  let i = 0;
  while (w.state === 'play' && w.tick < 2400) {
    const inp = ins[i++] ?? NO_INPUT;
    w.step(inp);
    if (w.tick % every === 0 || w.state !== 'play') {
      const p = w.player;
      const gs = w.entities.filter((e) => e instanceof TileGroup).map((g: any) => `${g.letter}:${g.state[0]}${g.solid.y}`).join(' ');
      console.log(`t${w.tick} ${inp.left ? 'L' : inp.right ? 'R' : '.'}${inp.jumpPressed ? 'J' : ''} x=${p.x} y=${p.y} g=${p.onGround ? 1 : 0} vx=${p.vx.toFixed(0)} | ${gs} ${w.state} ${w.deathCause}`);
    }
  }
});
