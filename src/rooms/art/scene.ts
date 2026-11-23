import type { Ctx } from './dad';
import type { GroundStyle } from './ground';

/** the part of the world that is on screen (can run past the room's edges) */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Scene {
  /** sky to near layer, drawn once into a cache */
  backdrop(ctx: Ctx, r: Box): void;
  /** under the floor, seen through holes (drawn into the same cache, below the floor line) */
  pit(ctx: Ctx, r: Box, floorY: number): void;
  /** every frame, over the backdrop and behind the play layer: rain, a passing train, lights */
  ambient?(ctx: Ctx, r: Box, t: number): void;
  /** every frame over everything in the world (before the UI): weather in front, a colour grade */
  front?(ctx: Ctx, r: Box, t: number): void;
  ground: GroundStyle;
  /** the colour behind the menus (the page around the canvas) */
  base: string;
  /** a gentle tint over the menus' backdrop */
  accent: string;
}

// ---------------------------------------------------------------- helpers
export function vgrad(ctx: Ctx, y0: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [k, c] of stops) g.addColorStop(k, c);
  return g;
}

export function glow(ctx: Ctx, x: number, y: number, r: number, color: string, alpha = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** a soft cloud from a few overlapping ellipses, lit from below */
export function cloud(ctx: Ctx, x: number, y: number, w: number, body: string, lit: string) {
  const blobs: [number, number, number, number][] = [
    [0, 0, 0.5, 0.32],
    [-0.28, 0.06, 0.3, 0.22],
    [0.3, 0.05, 0.34, 0.24],
    [0.08, -0.12, 0.3, 0.26],
    [-0.12, -0.06, 0.26, 0.2],
  ];
  ctx.fillStyle = body;
  for (const [dx, dy, rx, ry] of blobs) {
    ctx.beginPath();
    ctx.ellipse(x + dx * w, y + dy * w, rx * w, ry * w, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.ellipse(x + 0.04 * w, y + 0.16 * w, 0.52 * w, 0.1 * w, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** a deterministic pseudo-random number in [0, 1) for a seed */
export function hash(n: number): number {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}
