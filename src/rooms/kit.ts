// The room trap kit: small, exact, deterministic betrayals for one-screen rooms.
// Every trigger is measured in pixels against Dad's box, so a trap always reaches
// exactly where it is meant to (and never "almost" touches him).
import { DT, secs, TILE } from '../game/constants';
import type { World } from '../game/world';
import { TileGroup } from '../game/entities/group';
import { SpikeGroup } from '../game/entities/basics';

export const px = (t: number) => t * TILE;
/** Dad's feet on the standard room floor (row 14) */
export const FLOOR = px(14);

/** a piece of floor marked with a lowercase letter in the map */
export function slab(w: World, letter: string): TileGroup {
  return w.add(new TileGroup(w, letter));
}

/** hidden spikes marked with an uppercase letter */
export function hidden(w: World, letter: string): SpikeGroup {
  return w.add(new SpikeGroup(w, letter));
}

/** drop a slab out of the room (fast, no wobble: the floor just isn't there any more) */
export function drop(w: World, g: TileGroup, o: { g?: number; v0?: number } = {}) {
  if (g.state === 'fall' || g.state === 'gone') return;
  g.fall(w, { g: o.g ?? 2600, v0: o.v0 ?? 60 });
  w.emit('slab', g.solid.x + g.solid.w / 2, g.solid.y, { w: g.solid.w });
}

/** bring a dropped slab back up into its place from under the room */
export function restore(w: World, g: TileGroup, seconds = 0.28) {
  const s = g.solid;
  const depth = 4;
  s.x = g.ox;
  s.y = g.oy + depth * TILE;
  s.xr = 0;
  s.yr = 0;
  s.collidable = true;
  g.visible = true;
  g.state = 'rest';
  g.slide(w, 0, -depth, seconds, 'out');
  w.emit('slabBack', s.x + s.w / 2, g.oy, { w: s.w });
}

/** the leading edge of Dad's box, moving right */
const front = (w: World) => w.player.x + w.player.w;

/**
 * The slab falls the moment Dad's leading edge comes within `lead` px of it
 * (from the left). `back`: seconds later it rises back into place, for good.
 */
export function dropNear(w: World, g: TileGroup, o: { lead?: number; back?: number; until?: () => boolean } = {}) {
  const lead = o.lead ?? 30;
  w.when(
    (w2) => w2.state === 'play' && front(w2) >= g.ox - lead && w2.player.x < g.ox + g.solid.w && !(o.until?.() ?? false),
    (w2) => {
      drop(w2, g);
      if (o.back !== undefined) w2.after(o.back, () => restore(w2, g));
    },
  );
}

/** Safe to walk onto; breaks the moment Dad lands on it from the air. */
export function dropOnLanding(w: World, g: TileGroup) {
  w.when(
    (w2) => w2.player.landTick === w2.tick && g.solid.collidable && g.state === 'rest' && w2.player.isRiding(g.solid),
    (w2) => drop(w2, g),
  );
}

/**
 * Stand still on it and it starts to shake; still there a moment later, it goes.
 * Any step (or a jump) settles it again.
 */
export function dropWhenIdle(w: World, g: TileGroup, o: { shake?: number; after?: number } = {}) {
  const shakeAt = secs(o.shake ?? 0.16);
  const dropAt = secs(o.after ?? 0.36);
  let still = 0;
  w.onTick((w2) => {
    if (g.state !== 'rest' && g.state !== 'shake') return;
    const p = w2.player;
    const on = w2.standing(g.solid);
    if (on && Math.abs(p.vx) < 2 && p.inputDir === 0) still++;
    else {
      still = 0;
      if (g.state === 'shake') g.state = 'rest';
      return;
    }
    if (still === shakeAt) g.shake(w2, 10);
    if (still >= dropAt) drop(w2, g);
  });
}

/**
 * The floor collapses behind Dad like a wave: once his centre passes `start`, a
 * front moves right at `speed` px/s and every slab whose centre it passes falls.
 */
export function collapseWave(w: World, groups: TileGroup[], o: { start: number; speed: number; from: number }) {
  let x = o.from;
  let on = false;
  const left = groups.slice().sort((a, b) => a.ox - b.ox);
  w.onTick((w2) => {
    if (!on) {
      if (w2.player.cx >= o.start) on = true;
      else return;
    }
    x += o.speed * DT;
    while (left.length && left[0].ox + left[0].solid.w / 2 <= x) drop(w2, left.shift()!);
  });
  return { get x() {
    return x;
  } };
}

/** run fn once when Dad's centre reaches x (px) */
export function onPass(w: World, x: number, fn: (w: World) => void) {
  w.when((w2) => w2.player.cx >= x, fn);
}

/**
 * Wears out under him: once Dad has stood on it for `budget` seconds in all (walking
 * counts), it shakes for a moment and goes. You can cross it; you can't live on it.
 */
export function wearsOut(w: World, g: TileGroup, budget = 0.8, warn = 0.2) {
  let on = 0;
  const end = secs(budget);
  w.onTick((w2) => {
    if (g.state !== 'rest' && g.state !== 'shake') return;
    if (!w2.standing(g.solid)) return;
    on++;
    if (on === end - secs(warn)) g.shake(w2, warn + 1);
    if (on >= end) drop(w2, g);
  });
}

/** stand on it a moment and it sinks, gently, `tiles` down (a lift nobody asked for) */
export function sinkOnStand(w: World, g: TileGroup, o: { after?: number; tiles: number; seconds?: number }) {
  let on = 0;
  let gone = false;
  const at = secs(o.after ?? 0.3);
  w.onTick((w2) => {
    if (gone || !w2.standing(g.solid)) return;
    if (++on >= at) {
      gone = true;
      g.shake(w2, 0.12, (w3) => g.slide(w3, 0, o.tiles, o.seconds ?? 1.0, 'inOut'));
    }
  });
}

/** run fn every time Dad jumps (optionally only while `when` holds) */
export function onJump(w: World, fn: (w: World) => void, when: (w: World) => boolean = () => true) {
  w.when((w2) => w2.player.jumpTick === w2.tick && when(w2), fn, false);
}
