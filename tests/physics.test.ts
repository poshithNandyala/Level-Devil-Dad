import { describe, it, expect } from 'vitest';
import { emptyMap, makeWorld, inp } from './helpers';
import { TPS } from '../src/game/constants';

describe('player physics', () => {
  it('stands still on flat ground', () => {
    const w = makeWorld(emptyMap((r) => (r[14][5] = '@')));
    const y0 = w.player.y;
    for (let i = 0; i < 120; i++) w.step(inp({}));
    expect(w.player.y).toBe(y0);
    expect(w.player.onGround).toBe(true);
  });

  it('full jump height and distance', () => {
    const w = makeWorld(emptyMap((r) => (r[14][2] = '@')));
    for (let i = 0; i < 60; i++) w.step(inp({ right: true }));
    const y0 = w.player.y, x0 = w.player.x;
    let minY = y0, t = 0;
    w.step(inp({ right: true, jump: true, jumpPressed: true }));
    t++;
    while (t < 400) {
      w.step(inp({ right: true, jump: true }));
      t++;
      minY = Math.min(minY, w.player.y);
      if (w.player.onGround) break;
    }
    const height = y0 - minY, dist = w.player.x - x0;
    console.log(`jump height ${height}px (${(height / 16).toFixed(2)} tiles), distance ${dist}px (${(dist / 16).toFixed(2)} tiles), airtime ${(t / TPS).toFixed(3)}s`);
    expect(height).toBeGreaterThanOrEqual(52);
    expect(height).toBeLessThanOrEqual(64);
  });

  it('a quick tap clears two tiles, a full hold goes much higher', () => {
    const height = (hold: number) => {
      const w = makeWorld(emptyMap((r) => (r[14][5] = '@')));
      w.step(inp({}));
      const y0 = w.player.y;
      let minY = y0;
      for (let i = 0; i < 200; i++) {
        w.step(inp({ jump: i < hold, jumpPressed: i === 0 }));
        minY = Math.min(minY, w.player.y);
      }
      return (y0 - minY) / 16;
    };
    const tap = height(2); // a 17 ms touch
    const full = height(60);
    console.log(`tap ${tap.toFixed(2)} tiles, full ${full.toFixed(2)} tiles`);
    expect(tap).toBeGreaterThan(2.2);
    expect(full).toBeGreaterThan(3.5);
    expect(full - tap).toBeGreaterThan(1);
  });

  it('cannot walk through walls and reaches max speed', () => {
    const w = makeWorld(emptyMap((r) => { r[14][2] = '@'; r[14][20] = '#'; r[13][20] = '#'; }));
    for (let i = 0; i < 400; i++) w.step(inp({ right: true }));
    expect(w.player.x + w.player.w).toBe(20 * 16);
  });

  it('falling into a pit kills', () => {
    const w = makeWorld(emptyMap((r) => { r[14][2] = '@'; for (let y = 15; y < 18; y++) for (let x = 6; x < 12; x++) r[y][x] = '.'; }));
    for (let i = 0; i < 400 && w.state === 'play'; i++) w.step(inp({ right: true }));
    expect(w.state).toBe('dead');
    expect(w.deathCause).toBe('fell');
  });

  it('spikes kill, tips do not', () => {
    const w = makeWorld(emptyMap((r) => { r[14][2] = '@'; r[14][8] = '^'; }));
    for (let i = 0; i < 400 && w.state === 'play'; i++) w.step(inp({ right: true }));
    expect(w.deathCause).toBe('spikes');
  });
});
