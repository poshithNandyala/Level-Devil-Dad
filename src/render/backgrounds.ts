import type { CityId } from '../game/constants';
import type { SceneDef } from '../game/world';
import { drawScene, sceneSky } from './scenes';
import { THEMES, Theme } from './theme';
import { Ctx, circle, ellipse, hash, rr, withAlpha } from './art/common';
import { ambientSouth } from './backdrops-south';
import { ambientWest, daman, gandhinagar, bhopal, jaipur, raipur } from './backdrops-west';

/** a city module's skyline, drawn in world units between x0 and x1; `variant` is the stage's index */
export type Backdrop = (ctx: Ctx, th: Theme, x0: number, x1: number, variant: number) => void;
/** city modules' backdrops (installed by src/game/cities/install.ts) */
export const MODULE_BACKDROPS: Partial<Record<CityId, Backdrop>> = {};

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
  if (city === 'BOM') mumbai(ctx, th, x0, x1, variant);
  else if (city === 'DMN') daman(ctx, th, x0, x1);
  else if (city === 'GNR') gandhinagar(ctx, th, x0, x1);
  else if (city === 'JAI') jaipur(ctx, th, x0, x1);
  else if (city === 'BPL') bhopal(ctx, th, x0, x1);
  else if (city === 'RPR') raipur(ctx, th, x0, x1);
  else if (MODULE_BACKDROPS[city]) MODULE_BACKDROPS[city]!(ctx, th, x0, x1, variant);
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



// --------------------------------------------------------------------- Mumbai
function mumbai(ctx: Ctx, th: Theme, x0: number, x1: number, variant: number) {
  sunGlow(ctx, 330, 196, 26, th.sun);
  // sea
  const sg = ctx.createLinearGradient(0, 200, 0, 260);
  sg.addColorStop(0, '#3A3772');
  sg.addColorStop(1, '#1B1A3D');
  ctx.fillStyle = sg;
  ctx.fillRect(x0 - 2, 200, x1 - x0 + 4, 100);
  ctx.fillStyle = 'rgba(255,200,140,0.35)';
  for (let i = 0; i < 8; i++) ctx.fillRect(330 - 18 + hash(i, 1) * 12, 204 + i * 5, 24 - i * 2, 1.2);
  // far skyline with lit windows
  for (let x = Math.floor(x0 / 22) * 22 - 22; x < x1 + 22; x += 22) {
    if (x > 250 && x < 400) continue;
    const h = 40 + hash(x, 21) * 90;
    const w = 14 + hash(x, 22) * 8;
    ctx.fillStyle = hash(x, 23) > 0.5 ? th.far : th.mid;
    ctx.fillRect(x, 200 - h, w, h);
    ctx.fillStyle = 'rgba(255,214,140,0.65)';
    for (let wy = 204 - h; wy < 196; wy += 5) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (hash(wx, wy, 3) > 0.62) ctx.fillRect(wx, wy, 1.6, 2);
  }
  // Bandra-Worli Sea Link
  const px = 470;
  if (px > x0 - 120 && px < x1 + 120) {
    ctx.fillStyle = th.mid;
    ctx.fillRect(px - 120, 186, 240, 3);
    ctx.beginPath();
    ctx.moveTo(px - 4, 186);
    ctx.lineTo(px - 1.5, 120);
    ctx.lineTo(px + 1.5, 120);
    ctx.lineTo(px + 4, 186);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = withAlpha('#C9C2F0', 0.5);
    ctx.lineWidth = 0.4;
    for (let i = 1; i <= 9; i++) {
      ctx.beginPath();
      ctx.moveTo(px, 124 + i * 2);
      ctx.lineTo(px - i * 12, 186);
      ctx.moveTo(px, 124 + i * 2);
      ctx.lineTo(px + i * 12, 186);
      ctx.stroke();
    }
  }
  // Gateway of India
  const gx = variant === 5 ? 160 : 120;
  ctx.fillStyle = th.near;
  ctx.fillRect(gx - 30, 160, 60, 42);
  ctx.fillRect(gx - 34, 156, 68, 6);
  for (const tx of [-28, -8, 12]) ctx.fillRect(gx + tx, 146, 16, 12);
  for (const tx of [-24, 16]) {
    ctx.beginPath();
    ctx.arc(gx + tx + 4, 146, 5, Math.PI, 0);
    ctx.fill();
  }
  ctx.fillStyle = '#4C3F7E';
  ctx.beginPath();
  ctx.moveTo(gx - 9, 202);
  ctx.lineTo(gx - 9, 178);
  ctx.quadraticCurveTo(gx, 166, gx + 9, 178);
  ctx.lineTo(gx + 9, 202);
  ctx.closePath();
  ctx.fill();
  // Queen's Necklace along Marine Drive
  ctx.fillStyle = th.accent;
  for (let x = x0; x < x1; x += 5) {
    const y = 214 + Math.sin((x - x0) * 0.008) * 8;
    if (hash(Math.round(x), 41) > 0.15) {
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }
  ctx.globalAlpha = 1;
  // station roof girders across the top
  ctx.fillStyle = 'rgba(20,18,40,0.55)';
  ctx.fillRect(x0 - 2, 0, x1 - x0 + 4, 10);
  ctx.strokeStyle = 'rgba(20,18,40,0.45)';
  ctx.lineWidth = 1.2;
  for (let x = Math.floor(x0 / 24) * 24; x < x1 + 24; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 10);
    ctx.lineTo(x + 12, 0);
    ctx.lineTo(x + 24, 10);
    ctx.stroke();
  }
  void rr;
}

/** Animated layer drawn every frame on top of the cached backdrop. */
export function drawAmbient(ctx: Ctx, city: CityId, x0: number, x1: number, t: number, reduced: boolean) {
  ambientSouth(ctx, city, x0, x1, t, reduced);
  ambientWest(ctx, city, x0, x1, t, reduced);
  if (!reduced) ambientVibe(ctx, city, x0, x1, t);
  if (city === 'BLR') {
    // metro train on the viaduct
    const span = x1 - x0 + 200;
    const mx = x0 - 100 + ((t * 40) % span);
    ctx.fillStyle = '#8E6CCB';
    rr(ctx, mx, 156, 64, 9, 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 6; i++) ctx.fillRect(mx + 4 + i * 10, 158, 6, 3);
  } else if (city === 'HYD') {
    // pigeons circling the Charminar
    ctx.strokeStyle = 'rgba(80,50,40,0.55)';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.6 + i * 1.25;
      const bx = 300 + Math.cos(a) * (60 + i * 6),
        by = 90 + Math.sin(a) * 18 + i * 4;
      const flap = Math.sin(t * 10 + i) * 1.5;
      ctx.beginPath();
      ctx.moveTo(bx - 3, by - flap);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 3, by - flap);
      ctx.stroke();
    }
  } else if (city === 'BOM' && !reduced) {
    // monsoon drizzle
    ctx.strokeStyle = 'rgba(200,215,255,0.28)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    for (let i = 0; i < 70; i++) {
      const rx = x0 + ((hash(i, 1) * (x1 - x0) + t * 30) % (x1 - x0));
      const ry = (hash(i, 2) * 300 + t * 260) % 300;
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 2, ry + 7);
    }
    ctx.stroke();
  }
}

/** A little life in each city's air: petals, sparkles, kites, dust, crows, mist, lightning. */
function ambientVibe(ctx: Ctx, city: CityId, x0: number, x1: number, t: number) {
  const span = Math.max(1, x1 - x0);
  const drift = (n: number, seed: number, fall: number, sway: number, f: (x: number, y: number, i: number) => void) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + ((hash(i, seed) * span + t * (12 + hash(i, seed + 1) * 18)) % span);
      const y = (hash(i, seed + 2) * 300 + t * fall * (0.6 + hash(i, seed + 3) * 0.8)) % 300;
      f(x + Math.sin(t * 1.3 + i) * sway, y - 10, i);
    }
  };
  if (city === 'PDY' || city === 'BLR') {
    // bougainvillea (magenta) in the French Quarter, jacaranda (lavender) in the garden city
    const cols = city === 'PDY' ? ['#E91E8C', '#FF5CA8', '#C2185B'] : ['#B39DDB', '#9575CD', '#CE93D8'];
    drift(city === 'PDY' ? 22 : 26, city === 'PDY' ? 31 : 37, 22, 9, (x, y, i) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * (1 + (i % 3)) + i);
      ctx.fillStyle = cols[i % 3];
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(0, 0, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  } else if (city === 'KVT') {
    // the sun glinting on the lagoon
    for (let i = 0; i < 26; i++) {
      const k = (Math.sin(t * 2.2 + i * 1.7) + 1) / 2;
      if (k < 0.75) continue;
      const x = x0 + hash(i, 41) * span,
        y = 176 + hash(i, 42) * 40;
      ctx.strokeStyle = `rgba(255,255,255,${((k - 0.75) * 3.6).toFixed(2)})`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 3, y);
      ctx.lineTo(x + 3, y);
      ctx.moveTo(x, y - 2);
      ctx.lineTo(x, y + 2);
      ctx.stroke();
    }
  } else if (city === 'AMR') {
    // warm dust hanging in the heat
    drift(30, 51, 4, 14, (x, y) => {
      ctx.fillStyle = 'rgba(255,214,150,0.55)';
      ctx.fillRect(x, y, 1.4, 1.4);
    });
  } else if (city === 'HYD') {
    // Sankranti kites high over the old city
    const kc = ['#E53935', '#FDD835', '#1E88E5', '#43A047', '#F06292'];
    for (let i = 0; i < 6; i++) {
      const kx = x0 + ((hash(i, 61) * span + t * 9) % span),
        ky = 34 + hash(i, 62) * 50 + Math.sin(t * 1.1 + i) * 6;
      ctx.strokeStyle = 'rgba(255,230,210,0.35)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(kx, ky + 5);
      ctx.quadraticCurveTo(kx + 10, ky + 60, kx - 20, ky + 140);
      ctx.stroke();
      ctx.fillStyle = kc[i % kc.length];
      ctx.beginPath();
      ctx.moveTo(kx, ky - 5);
      ctx.lineTo(kx + 4, ky);
      ctx.lineTo(kx, ky + 5);
      ctx.lineTo(kx - 4, ky);
      ctx.closePath();
      ctx.fill();
    }
  } else if (city === 'CHN') {
    // crows crossing the hot sky
    ctx.strokeStyle = 'rgba(40,30,30,0.6)';
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 5; i++) {
      const bx = x0 + ((hash(i, 71) * span + t * (26 + i * 3)) % span),
        by = 40 + hash(i, 72) * 60 + Math.sin(t * 2 + i) * 4;
      const flap = Math.sin(t * 9 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(bx - 4, by - flap);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + 4, by - flap);
      ctx.stroke();
    }
  } else if (city === 'TVM') {
    // low monsoon mist drifting across the hills
    for (let i = 0; i < 4; i++) {
      const mx = x0 + ((hash(i, 81) * span + t * 6) % span),
        my = 120 + i * 18;
      const g = ctx.createRadialGradient(mx, my, 0, mx, my, 70);
      g.addColorStop(0, 'rgba(235,245,240,0.22)');
      g.addColorStop(1, 'rgba(235,245,240,0)');
      ctx.fillStyle = g;
      ctx.fillRect(mx - 70, my - 30, 140, 60);
    }
  } else if (city === 'BOM') {
    // monsoon lightning, now and then
    const k = t % 7.3;
    if (k < 0.16 || (k > 0.24 && k < 0.3)) {
      ctx.fillStyle = 'rgba(210,225,255,0.22)';
      ctx.fillRect(x0, 0, span, 240);
    }
  }
}
