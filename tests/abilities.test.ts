// The new ways to move: swimming, climbing palms, running on water, kicking off chawl walls.
import { describe, expect, it } from 'vitest';
import { emptyMap, inp, makeWorld } from './helpers';
import { Palm, Sea, Skim, ChawlWall } from '../src/game/entities/abilities';
import { Water } from '../src/game/entities/mumbai';

describe('swimming', () => {
  const pool = () =>
    makeWorld(
      emptyMap((r) => {
        for (let y = 8; y < 17; y++) for (let x = 6; x < 26; x++) r[y][x] = '.';
        for (let x = 0; x < 6; x++) r[7][x] = '#';
        for (let x = 26; x < 32; x++) r[7][x] = '#';
        r[6][2] = '@';
      }),
      (w) => {
        w.add(new Sea(w, 6 * 16, 26 * 16, 9 * 16));
      },
    );
  it('sinks when idle, floats when held, a stroke lifts', () => {
    const w = pool();
    // walk off the jetty into the sea
    for (let i = 0; i < 60; i++) w.step(inp({ right: true }));
    for (let i = 0; i < 120; i++) w.step(inp({}));
    expect(w.player.swimming).toBe(true);
    const y0 = w.player.y;
    for (let i = 0; i < 60; i++) w.step(inp({}));
    const sunk = w.player.y - y0;
    expect(sunk).toBeGreaterThan(20);
    const y1 = w.player.y;
    for (let i = 0; i < 60; i++) w.step(inp({ jump: true }));
    expect(Math.abs(w.player.y - y1)).toBeLessThan(12);
    const y2 = w.player.y;
    w.step(inp({ jump: true, jumpPressed: true }));
    for (let i = 0; i < 40; i++) w.step(inp({ jump: true }));
    const rise = y2 - w.player.y;
    console.log('sink/s', sunk, 'stroke rise', rise);
    expect(rise).toBeGreaterThan(18);
    expect(rise).toBeLessThan(48);
  });
  it('drowns without air, and leaps out at the surface', () => {
    const w = pool();
    for (let i = 0; i < 60; i++) w.step(inp({ right: true }));
    for (let i = 0; i < 900 && w.state === 'play'; i++) w.step(inp({}));
    expect(w.deathCause).toBe('drowned');
    const v = pool();
    for (let i = 0; i < 60; i++) v.step(inp({ right: true }));
    // swim to the far side near the surface, then leap out on to the jetty
    let t = 0;
    while (v.player.x < 23 * 16 && t++ < 2000) v.step(inp({ right: true, jump: true, jumpPressed: t % 20 === 0 }));
    for (let i = 0; i < 200 && !(v.player.onGround && v.player.y < 7 * 16); i++) v.step(inp({ right: true, jump: true, jumpPressed: i % 2 === 0 && v.player.swimming }));
    expect(v.state).toBe('play');
    expect(v.player.y + v.player.h).toBe(7 * 16);
  });
});

describe('palms', () => {
  it('jump at a palm to grab it, hold to climb, jump to leap off', () => {
    const w = makeWorld(
      emptyMap((r) => (r[14][2] = '@')),
      (w) => {
        const p = w.add(new Palm(10 * 16, 15 * 16, 140));
        w.climbables.push(p);
      },
    );
    for (let i = 0; i < 300 && w.player.x < 120; i++) w.step(inp({ right: true }));
    w.step(inp({ right: true, jump: true, jumpPressed: true }));
    for (let i = 0; i < 40 && !w.player.grip; i++) w.step(inp({ right: true, jump: true }));
    expect(w.player.grip).toBeTruthy();
    const y0 = w.player.y;
    for (let i = 0; i < 120; i++) w.step(inp({ right: true }));
    expect(y0 - w.player.y).toBeGreaterThan(50);
    // let go of everything: he hangs
    const y1 = w.player.y;
    for (let i = 0; i < 60; i++) w.step(inp({}));
    expect(w.player.y).toBe(y1);
    // over the top on to the crown
    for (let i = 0; i < 400 && w.player.grip; i++) w.step(inp({ right: true }));
    for (let i = 0; i < 5; i++) w.step(inp({}));
    expect(w.player.onGround).toBe(true);
    expect(w.player.y + w.player.h).toBeLessThan(15 * 16 - 120);
  });
});

describe('running on water', () => {
  const lagoon = () =>
    makeWorld(
      emptyMap((r) => {
        for (let y = 15; y < 18; y++) for (let x = 6; x < 26; x++) r[y][x] = '.';
        r[14][2] = '@';
      }),
      (w) => {
        const s = w.add(new Skim(6 * 16, 26 * 16, 15 * 16));
        void s;
        const wt = w.add(new Water(15.25, { rate: 0, minTy: 15.25, cause: 'splash' }));
        wt.x0 = 6 * 16;
        wt.x1 = 26 * 16;
      },
    );
  it('holds Dad while he runs flat out, not when he stops', () => {
    const w = lagoon();
    for (let i = 0; i < 600 && w.state === 'play' && w.player.x < 28 * 16; i++) w.step(inp({ right: true }));
    expect(w.state).toBe('play');
    expect(w.player.x).toBeGreaterThanOrEqual(28 * 16);
    const v = lagoon();
    for (let i = 0; i < 400 && v.state === 'play' && v.player.x < 12 * 16; i++) v.step(inp({ right: true }));
    for (let i = 0; i < 200 && v.state === 'play'; i++) v.step(inp({}));
    expect(v.deathCause).toBe('splash');
  });
});

describe('chawl walls', () => {
  it('kicks up between two walls', () => {
    const w = makeWorld(
      emptyMap((r) => {
        for (let y = 2; y < 15; y++) {
          r[y][9] = '#';
          r[y][13] = '#';
        }
        r[14][11] = '@';
      }),
      (w) => {
        w.add(new ChawlWall(w, 9, 2, 14));
        w.add(new ChawlWall(w, 13, 2, 14));
      },
    );
    const y0 = w.player.y;
    // hold right into the right wall, jump; then kick, alternating
    let side: 'R' | 'L' = 'R';
    w.step(inp({ right: true, jump: true, jumpPressed: true }));
    for (let k = 0; k < 6; k++) {
      for (let i = 0; i < 40; i++) {
        w.step(inp({ right: side === 'R', left: side === 'L', jump: i < 10 }));
        if (w.player.wallSide !== 0 || (side === 'R' ? w.player.x + w.player.w >= 13 * 16 : w.player.x <= 10 * 16)) break;
      }
      w.step(inp({ right: side === 'R', left: side === 'L', jump: true, jumpPressed: true }));
      side = side === 'R' ? 'L' : 'R';
    }
    console.log('climbed', y0 - w.player.y);
    expect(y0 - w.player.y).toBeGreaterThan(80);
  });
});
