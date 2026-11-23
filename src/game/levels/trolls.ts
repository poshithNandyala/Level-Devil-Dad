// Troll kit v2: traps that give no warning, for long scrolling levels.
// Every trap is deterministic (same every attempt), so a death always teaches something.
import type { World } from '../world';
import type { TileGroup } from '../entities/group';
import type { SpikeGroup } from '../entities/basics';
import { Thing } from '../entities/traps';
import { collapseOnStand, group, px, spikes } from './kit';

/** Run `fn` once, the first time Dad's centre reaches world x (px). */
export function onPass(w: World, x: number, fn: (w: World) => void) {
  w.when((w2) => w2.player.cx >= x, fn);
}

/** The floor piece drops away as Dad reaches it (at `at`, default its left edge). */
export function dropFloor(w: World, letter: string, o: { at?: number; delay?: number } = {}): TileGroup {
  const g = group(w, letter);
  onPass(w, o.at ?? g.solid.x + 2, (w2) => g.fall(w2, { delay: o.delay ?? 0, g: 2400 }));
  return g;
}

/** The floor piece gives way a moment after Dad stands on it. */
export function crumble(w: World, letter: string, delay = 0.25): TileGroup {
  const g = group(w, letter);
  collapseOnStand(w, g, delay);
  return g;
}

/** Safe to walk on, but it drops if Dad lands on it from a jump. */
export function noLanding(w: World, letter: string): TileGroup {
  const g = group(w, letter);
  // (onGround only turns on the tick after a landing, so check the feet directly)
  w.when(
    (w2) => w2.player.landTick === w2.tick && g.solid.collidable && w2.player.isRiding(g.solid),
    (w2) => g.fall(w2, { g: 2400 }),
  );
  return g;
}

/** Spikes burst out of the ground when Dad's centre reaches `at`. */
export function popAt(w: World, letter: string, at: number): SpikeGroup {
  const s = spikes(w, letter);
  onPass(w, at, (w2) => s.pop(w2));
  return s;
}

/** Spikes that wait until Dad jumps (anywhere after `from`) and then pop. */
export function popOnJump(w: World, letter: string, from: number, to = Infinity): SpikeGroup {
  const s = spikes(w, letter);
  w.when(
    (w2) => w2.player.jumpTick === w2.tick && w2.player.cx >= from && w2.player.cx <= to,
    (w2) => s.pop(w2),
  );
  return s;
}

/** A ledge that shies away when Dad jumps towards it from within `from`..its edge, then creeps back. */
export function shyLedge(w: World, letter: string, o: { dx: number; from: number; back?: number; dy?: number }): TileGroup {
  const g = group(w, letter);
  w.when(
    (w2) => w2.player.jumpTick === w2.tick && w2.player.cx >= o.from && w2.player.cx < g.solid.x,
    (w2) => {
      g.slide(w2, o.dx, o.dy ?? 0, 0.16, 'out', (w3) => {
        if (o.back !== undefined) w3.after(o.back, () => g.slide(w3, -o.dx, -(o.dy ?? 0), 0.35, 'inOut'));
      });
    },
  );
  return g;
}

/** A block drops from above as Dad passes `at` (lands, so it can crush). */
export function ceilingDrop(w: World, letter: string, at: number, o: { delay?: number; land?: boolean } = {}): TileGroup {
  const g = group(w, letter);
  onPass(w, at, (w2) => g.fall(w2, { delay: o.delay ?? 0, land: o.land ?? true, g: 2600, v0: 120 }));
  return g;
}

/** A wall pushes up out of the ground (its cells sit in the floor) when Dad passes `at`. */
export function riseWall(w: World, letter: string, at: number, upTiles: number, seconds = 0.14): TileGroup {
  const g = group(w, letter);
  onPass(w, at, (w2) => g.slide(w2, 0, -upTiles, seconds, 'out'));
  return g;
}

/** A platform that moves when Dad passes `at` (eg. slides out from under him, or into the gap). */
export function shiftAt(w: World, letter: string, at: number, dx: number, dy: number, seconds = 0.2): TileGroup {
  const g = group(w, letter);
  onPass(w, at, (w2) => g.slide(w2, dx, dy, seconds, 'out'));
  return g;
}

/** Fake ground: looks like the rest, vanishes the moment Dad touches it. */
export function fakeFloor(w: World, letter: string): TileGroup {
  const g = group(w, letter);
  w.when(
    (w2) => w2.standing(g.solid) || w2.player.x + w2.player.w > g.solid.x - 1 && w2.player.x < g.solid.x + g.solid.w && Math.abs(w2.player.y + w2.player.h - g.solid.y) < 2,
    (w2) => g.vanish(w2),
  );
  return g;
}

/** Something deadly that chases Dad from behind once he passes `at`. */
export function chaser(w: World, kind: Thing['kind'], at: number, o: { x: number; y: number; w: number; h: number; speed: number; cause?: string; stopAt?: number }) {
  const t = new Thing(kind, o.x, o.y, { w: o.w, h: o.h, solid: false, deadly: o.cause ?? 'crushed' });
  w.add(t);
  let go = false;
  let x = o.x;
  onPass(w, at, () => (go = true));
  w.onTick((w2) => {
    if (!go || (o.stopAt !== undefined && x >= o.stopAt)) return;
    x += o.speed / 120;
    t.place(w2, x, o.y);
  });
  return t;
}

export { px };

/**
 * The floor ahead opens the moment Dad's leading edge comes within `lead` px of it, and slides
 * back up into place `back` seconds later, for good. (Jump it and you land on whatever's past it.)
 */
export function gapAhead(w: World, letter: string, o: { lead?: number; back: number }): TileGroup {
  const g = group(w, letter);
  const lead = o.lead ?? 30;
  w.when(
    (w2) => w2.player.x + w2.player.w >= g.ox - lead && w2.player.x < g.ox,
    (w2) => {
      g.fall(w2, { g: 2600, v0: 60 });
      w2.after(o.back, () => {
        const s = g.solid;
        s.x = g.ox;
        s.y = g.oy + 5 * 16;
        s.xr = 0;
        s.yr = 0;
        s.collidable = true;
        g.visible = true;
        g.state = 'rest';
        g.slide(w2, 0, -5, 0.3, 'out');
      });
    },
  );
  return g;
}
