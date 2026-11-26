import type { CityId } from '../game/constants';
import type { SceneDef } from '../game/world';
import { drawScene, sceneSky } from './scenes';
import { THEMES, Theme } from './theme';
import { Ctx, circle, ellipse, hash, rr, withAlpha } from './art/common';

/** a city module's skyline, drawn in world units between x0 and x1; `variant` is the stage's index */
export type Backdrop = (ctx: Ctx, th: Theme, x0: number, x1: number, variant: number) => void;
/** city modules' backdrops (installed by src/game/cities/install.ts) */
export const MODULE_BACKDROPS: Partial<Record<CityId, Backdrop>> = {};
/** a city module's animated layer, drawn every frame over the cached backdrop */
export type Ambient = (ctx: Ctx, x0: number, x1: number, t: number, reduced: boolean) => void;
/** city modules' animated layers (installed by src/game/cities/install.ts) */
export const MODULE_AMBIENT: Partial<Record<CityId, Ambient>> = {};

/**
 * City backdrops, drawn in world units around the room. `x0..x1` is the
 * visible horizontal span in world px (wider than the room on wide screens).
 */
export function drawBackdrop(ctx: Ctx, city: CityId, x0: number, x1: number, y0: number, y1: number, variant = 0, scene?: SceneDef) {
  const th = THEMES[city];
  const sky = scene ? sceneSky(scene) : th.sky;
  const g = ctx.createLinearGradient(0, y0, 0, 250);
  g.addColorStop(0, sky[0]);
  g.addColorStop(0.55, sky[1]);
  g.addColorStop(1, sky[2]);
  ctx.fillStyle = g;
  ctx.fillRect(x0 - 2, y0 - 2, x1 - x0 + 4, y1 - y0 + 4);
  if (scene) {
    drawScene(ctx, scene, x0, x1);
    const hz = ctx.createLinearGradient(0, 170, 0, 260);
    hz.addColorStop(0, withAlpha(sky[2], 0));
    hz.addColorStop(1, withAlpha(sky[2], scene.kind === 'cave' || scene.kind === 'night' ? 0.12 : 0.3));
    ctx.fillStyle = hz;
    ctx.fillRect(x0, 170, x1 - x0, 120);
    return;
  }
  if (MODULE_BACKDROPS[city]) MODULE_BACKDROPS[city]!(ctx, th, x0, x1, variant);
  // haze near the ground line so the playfield pops
  const hz = ctx.createLinearGradient(0, 170, 0, 260);
  hz.addColorStop(0, withAlpha(th.sky[2], 0));
  hz.addColorStop(1, withAlpha(th.sky[2], city === 'BOM' ? 0.12 : 0.2));
  ctx.fillStyle = hz;
  ctx.fillRect(x0, 170, x1 - x0, 120);
}

export function sunGlow(ctx: Ctx, x: number, y: number, r: number, color: string) {
  const g = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 3);
  g.addColorStop(0, withAlpha(color, 0.55));
  g.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6);
  circle(ctx, x, y, r, color);
}

export function hills(ctx: Ctx, x0: number, x1: number, base: number, amp: number, freq: number, seed: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, 300);
  for (let x = x0; x <= x1 + 8; x += 8) {
    const y = base - amp * (0.55 + 0.45 * Math.sin(x * freq + seed) * Math.sin(x * freq * 0.37 + seed * 2));
    ctx.lineTo(x, y);
  }
  ctx.lineTo(x1 + 8, 300);
  ctx.closePath();
  ctx.fill();
}

// ------------------------------------------------------------------ Hyderabad
function minaret(ctx: Ctx, x: number, base: number, h: number, w: number, color: string, light: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x - w / 2, base - h, w, h);
  // balconies
  for (let i = 1; i <= 3; i++) {
    const by = base - h * (i / 3.4);
    ctx.fillRect(x - w / 2 - 2, by, w + 4, 2.2);
    ctx.fillStyle = light;
    ctx.fillRect(x - w / 2 + 1, by - 5, w - 2, 3);
    ctx.fillStyle = color;
  }
  // onion dome
  ctx.beginPath();
  ctx.moveTo(x - w / 2 - 1, base - h);
  ctx.quadraticCurveTo(x - w * 0.9, base - h - w * 0.9, x, base - h - w * 1.5);
  ctx.quadraticCurveTo(x + w * 0.9, base - h - w * 0.9, x + w / 2 + 1, base - h);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(x - 0.5, base - h - w * 1.5 - 4, 1, 4);
}

export function charminar(ctx: Ctx, cx: number, base: number, scale: number, color: string, light: string) {
  ctx.save();
  ctx.translate(cx, base);
  ctx.scale(scale, scale);
  const W = 70,
    H = 62;
  ctx.fillStyle = color;
  ctx.fillRect(-W / 2, -H, W, H);
  // upper gallery
  ctx.fillRect(-W / 2 + 4, -H - 14, W - 8, 14);
  for (let i = 0; i < 7; i++) {
    ctx.fillStyle = light;
    ctx.beginPath();
    const ax = -W / 2 + 7 + i * 8.6;
    ctx.moveTo(ax, -H - 2);
    ctx.lineTo(ax, -H - 8);
    ctx.quadraticCurveTo(ax + 3, -H - 12, ax + 6, -H - 8);
    ctx.lineTo(ax + 6, -H - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = color;
  ctx.fillRect(-W / 2 + 2, -H - 18, W - 4, 4);
  // great arch
  ctx.fillStyle = light;
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  ctx.lineTo(-15, -30);
  ctx.quadraticCurveTo(-15, -46, 0, -52);
  ctx.quadraticCurveTo(15, -46, 15, -30);
  ctx.lineTo(15, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = withAlpha(color, 0.35);
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.lineTo(-10, -28);
  ctx.quadraticCurveTo(-10, -40, 0, -44);
  ctx.quadraticCurveTo(10, -40, 10, -28);
  ctx.lineTo(10, 0);
  ctx.closePath();
  ctx.fill();
  // small side windows
  ctx.fillStyle = light;
  for (const sx of [-27, 21]) {
    ctx.beginPath();
    ctx.moveTo(sx, -36);
    ctx.lineTo(sx, -46);
    ctx.quadraticCurveTo(sx + 3, -50, sx + 6, -46);
    ctx.lineTo(sx + 6, -36);
    ctx.closePath();
    ctx.fill();
  }
  // minarets
  minaret(ctx, -W / 2 - 3, 0, 104, 9, color, light);
  minaret(ctx, W / 2 + 3, 0, 104, 9, color, light);
  // clock face
  circle(ctx, 0, -H + 6, 5, light);
  circle(ctx, 0, -H + 6, 3.4, withAlpha(color, 0.5));
  ctx.restore();
}

/** Animated layer drawn every frame on top of the cached backdrop. */
export function drawAmbient(ctx: Ctx, city: CityId, x0: number, x1: number, t: number, reduced: boolean) {
  MODULE_AMBIENT[city]?.(ctx, x0, x1, t, reduced);
}

