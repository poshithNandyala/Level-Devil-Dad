import { TILE } from '../../game/constants';
import { TT } from '../../game/world';
import type { Theme } from '../theme';
import { Ctx, hash, rr, text } from './common';

export interface Nb {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  /** how many solid tiles sit above this one (0 = the surface); deeper is darker */
  depth?: number;
}

function hex2rgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
/** mix two #rrggbb colours */
export function mix(a: string, b: string, k: number) {
  const x = hex2rgb(a),
    y = hex2rgb(b);
  const c = x.map((v, i) => Math.round(v + (y[i] - v) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export type GroundCaps = { cap: string; capHi: string; blades?: string; flowers?: string[]; pebbles?: string };
export const CAP: Record<string, GroundCaps> = {
  CHN: { cap: '#E2B86C', capHi: '#F3D597', pebbles: '#B98E4E' },
  PDY: { cap: '#F4E6C2', capHi: '#FFF6DF', pebbles: '#D8C397' },
  BLR: { cap: '#5E9E45', capHi: '#8CC765', blades: '#4E8A38', flowers: ['#B983D9', '#F7F7F7'] },
  AMR: { cap: '#C47A4A', capHi: '#E09A66', pebbles: '#8D4E2C' },
  HYD: { cap: '#59A452', capHi: '#83C46F', blades: '#478A41' },
  PNJ: { cap: '#5E9E36', capHi: '#8CC152', blades: '#4C8A2C', flowers: ['#E91E63', '#FFEB3B'] },
  DMN: { cap: '#D9C79E', capHi: '#EFE2C0', pebbles: '#A8946C' },
  GNR: { cap: '#8BBF5A', capHi: '#AED581', blades: '#689F38', flowers: ['#FFB300', '#E53935'] },
  JAI: { cap: '#E8B989', capHi: '#F6D4AE', pebbles: '#C2885E' },
  RPR: { cap: '#9CCC65', capHi: '#C5E1A5', pebbles: '#8D5A3B' },
  BPL: { cap: '#B9C7A6', capHi: '#D9E3C8', pebbles: '#7E8F6E' },
  BOM: { cap: '#4A4858', capHi: '#6B6980', pebbles: '#2E2D3A' },
};

/** One ground tile in the city's style. Edges depend on neighbours so groups of tiles read as one mass. */
export function drawTile(ctx: Ctx, x: number, y: number, th: Theme, n: Nb, wet = false) {
  const T = TILE;
  const tx = Math.round(x / T),
    ty = Math.round(y / T);
  const depth = Math.min(4, n.depth ?? (n.up ? 2 : 0));
  // body: lit near the surface, darker as it goes down (soft ambient occlusion)
  const top = mix(th.tileBase, th.tileDark, Math.min(1, depth * 0.2));
  const bot = mix(th.tileBase, th.tileDark, Math.min(1, (depth + 1) * 0.2));
  const g = ctx.createLinearGradient(0, y, 0, y + T);
  g.addColorStop(0, top);
  g.addColorStop(1, bot);
  ctx.fillStyle = g;
  // rounded outer corners on exposed tops
  const rTL = !n.up && !n.left ? 3.5 : 0,
    rTR = !n.up && !n.right ? 3.5 : 0;
  ctx.beginPath();
  ctx.moveTo(x - 0.35 + rTL, y - 0.35);
  ctx.lineTo(x + T + 0.35 - rTR, y - 0.35);
  if (rTR) ctx.quadraticCurveTo(x + T + 0.35, y - 0.35, x + T + 0.35, y + rTR);
  ctx.lineTo(x + T + 0.35, y + T + 0.35);
  ctx.lineTo(x - 0.35, y + T + 0.35);
  ctx.lineTo(x - 0.35, y + rTL);
  if (rTL) ctx.quadraticCurveTo(x - 0.35, y - 0.35, x - 0.35 + rTL, y - 0.35);
  ctx.closePath();
  ctx.fill();

  // material
  ctx.save();
  ctx.clip();
  if (th.pattern === 'brick') {
    ctx.fillStyle = th.tileEdge;
    ctx.globalAlpha = 0.55;
    for (let row = 0; row < 2; row++) {
      const yy = y + row * 8;
      ctx.fillRect(x, yy + 7.3, T, 0.7);
      const off = (ty * 2 + row) % 2 === 0 ? 0 : 6;
      for (let bx = off; bx < T; bx += 12) ctx.fillRect(x + bx, yy, 0.7, 8);
    }
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#FFFFFF';
    for (let row = 0; row < 2; row++) ctx.fillRect(x, y + row * 8 + 0.6, T, 0.6);
  } else if (th.pattern === 'granite') {
    for (let i = 0; i < 5; i++) {
      const sx = hash(tx, ty, i) * 14,
        sy = hash(tx, ty, i + 9) * 14;
      ctx.fillStyle = i % 2 ? th.tileDark : th.tileTop;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x + sx + 1, y + sy + 1, 0.9 + hash(tx, ty, i + 3) * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
    if (hash(tx, ty, 5) > 0.7) {
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = th.tileEdge;
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 5);
      ctx.lineTo(x + 8, y + 8);
      ctx.lineTo(x + 7, y + 12);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = th.tileEdge;
    ctx.globalAlpha = 0.35;
    if ((tx + ty) % 2 === 0) ctx.fillRect(x, y, 0.7, T);
    ctx.fillRect(x, y + T - 0.7, T, 0.7);
    if (hash(tx, ty, 3) > 0.7) {
      ctx.fillStyle = th.tileDark;
      ctx.beginPath();
      ctx.ellipse(x + 4 + hash(tx, ty, 4) * 8, y + 6 + hash(tx, ty, 6) * 6, 3, 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // fine speckle so it reads as a material, not a flat colour
  for (let i = 0; i < 6; i++) {
    ctx.globalAlpha = 0.1 + hash(tx, ty, 20 + i) * 0.1;
    ctx.fillStyle = i % 2 ? '#000000' : '#FFFFFF';
    ctx.fillRect(x + hash(tx, ty, 30 + i) * 15, y + hash(tx, ty, 40 + i) * 15, 0.8, 0.8);
  }
  ctx.restore();
  ctx.globalAlpha = 1;

  // exposed sides: a soft dark rim that separates the ground from the sky
  if (!n.left) {
    const sg = ctx.createLinearGradient(x, 0, x + 3, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0.32)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(x, y + rTL, 3, T - rTL);
  }
  if (!n.right) {
    const sg = ctx.createLinearGradient(x + T - 3, 0, x + T, 0);
    sg.addColorStop(0, 'rgba(0,0,0,0)');
    sg.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = sg;
    ctx.fillRect(x + T - 3, y + rTR, 3, T - rTR);
  }
  if (!n.down) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x, y + T - 1.4, T, 1.4);
  }
  // the lit cap on surfaces
  if (!n.up) {
    const cap = CAP[th.city] ?? { cap: th.topper, capHi: th.tileTop };
    // shadow under the cap
    const sh = ctx.createLinearGradient(0, y + 3, 0, y + 7);
    sh.addColorStop(0, 'rgba(0,0,0,0.28)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.fillRect(x + (rTL ? 1 : 0), y + 3, T - (rTL ? 1 : 0) - (rTR ? 1 : 0), 4);
    // cap with a little overhang and wavy lower edge
    ctx.fillStyle = cap.cap;
    ctx.beginPath();
    const l = x - (n.left ? 0 : 0.8),
      r = x + T + (n.right ? 0 : 0.8);
    ctx.moveTo(l + rTL * 0.6, y - 0.5);
    ctx.lineTo(r - rTR * 0.6, y - 0.5);
    if (rTR) ctx.quadraticCurveTo(r, y - 0.5, r, y + 2);
    ctx.lineTo(r, y + 3.2);
    for (let i = 4; i >= 0; i--) {
      const xx = x + (i / 4) * T;
      ctx.lineTo(xx, y + 3.2 + (hash(tx * 5 + i, ty, 11) > 0.5 ? 1 : 0.2));
    }
    ctx.lineTo(l, y + 3.2);
    ctx.lineTo(l, y + 2);
    if (rTL) ctx.quadraticCurveTo(l, y - 0.5, l + rTL * 0.6, y - 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = cap.capHi;
    ctx.fillRect(x + (rTL ? 2 : 0), y - 0.5, T - (rTL ? 2 : 0) - (rTR ? 2 : 0), 1);
    if (cap.blades) {
      ctx.fillStyle = cap.blades;
      for (let i = 0; i < 5; i++) {
        const gx = x + 0.5 + i * 3.2 + hash(tx, ty, i) * 1.6;
        const hgt = 1.4 + hash(tx, ty, i + 4) * 2;
        ctx.beginPath();
        ctx.moveTo(gx, y + 0.5);
        ctx.lineTo(gx + 0.7, y - hgt);
        ctx.lineTo(gx + 1.4, y + 0.5);
        ctx.fill();
      }
      if (cap.flowers && hash(tx, ty, 17) > 0.82) {
        ctx.fillStyle = cap.flowers[hash(tx, ty, 18) > 0.5 ? 1 : 0];
        ctx.beginPath();
        ctx.arc(x + 3 + hash(tx, ty, 19) * 10, y - 1.6, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (cap.pebbles) {
      ctx.fillStyle = cap.pebbles;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(x + 2 + hash(tx, ty, i + 50) * 12, y + 1.4, 0.9, 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (th.city === 'BOM') {
      ctx.fillStyle = '#F2C14E';
      for (let i = 0; i < 2; i++) ctx.fillRect(x + i * 8 + 1, y + 0.8, 4, 0.8);
    }
    if (wet) {
      ctx.fillStyle = 'rgba(160,200,255,0.55)';
      ctx.fillRect(x, y + 2.6, T, 1.2);
      ctx.fillStyle = 'rgba(220,238,255,0.8)';
      ctx.fillRect(x + 2 + hash(tx, ty, 7) * 6, y + 0.4, 5, 0.9);
    }
  }
}

export function drawOneWay(ctx: Ctx, x: number, y: number, th: Theme) {
  ctx.fillStyle = th.tileTop;
  rr(ctx, x, y, TILE, 4, 1);
  ctx.fill();
  ctx.fillStyle = th.tileEdge;
  ctx.fillRect(x, y + 3, TILE, 1);
  ctx.fillStyle = th.tileDark;
  ctx.fillRect(x + 3, y + 4, 1.5, 3);
  ctx.fillRect(x + TILE - 4.5, y + 4, 1.5, 3);
}

export function drawSpikeTile(ctx: Ctx, t: number, x: number, y: number, th: Theme, scale = 1) {
  ctx.save();
  const cx = x + 8,
    cy = y + 8;
  const rot = t === TT.SPIKE_UP ? 0 : t === TT.SPIKE_DOWN ? Math.PI : t === TT.SPIKE_LEFT ? -Math.PI / 2 : Math.PI / 2;
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.translate(0, 8);
  ctx.scale(1, scale);
  ctx.fillStyle = th.spike;
  ctx.strokeStyle = th.spikeEdge;
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  for (let i = 0; i < 2; i++) {
    const bx = -8 + i * 8;
    ctx.beginPath();
    ctx.moveTo(bx + 0.6, 0);
    ctx.lineTo(bx + 4, -11);
    ctx.lineTo(bx + 7.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.moveTo(bx + 4, -11);
    ctx.lineTo(bx + 7.4, 0);
    ctx.lineTo(bx + 4.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = th.spike;
  }
  ctx.restore();
}

/** A door is 16 x 32 px, drawn with its top-left at (x, y). */
export function drawDoor(ctx: Ctx, x: number, y: number, th: Theme, open = 0, glow = 1, fake = false) {
  // frame
  ctx.fillStyle = '#3A2418';
  rr(ctx, x - 1, y - 1, 18, 33, 2);
  ctx.fill();
  // interior when open
  ctx.fillStyle = fake ? '#120A08' : '#FFF4C8';
  ctx.fillRect(x + 1.5, y + 2, 13, 30);
  if (!fake && open > 0) {
    const g = ctx.createRadialGradient(x + 8, y + 18, 2, x + 8, y + 18, 18);
    g.addColorStop(0, 'rgba(255,255,220,0.95)');
    g.addColorStop(1, 'rgba(255,220,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 8, y - 4, 32, 40);
  }
  // door panel (swings by shrinking)
  const pw = 13 * (1 - open * 0.85);
  ctx.fillStyle = th.city === 'BOM' ? '#7A4A2E' : th.city === 'BLR' ? '#6B4A2E' : '#8A4E2B';
  ctx.fillRect(x + 1.5, y + 2, pw, 30);
  if (pw > 4) {
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    ctx.fillRect(x + 3, y + 4, pw - 3, 11);
    ctx.fillRect(x + 3, y + 17, pw - 3, 12);
    ctx.fillStyle = '#F2C14E';
    ctx.beginPath();
    ctx.arc(x + 1.5 + pw - 2.6, y + 18, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }
  // EXIT sign
  const sy = y - 8;
  ctx.fillStyle = '#0E5F2E';
  rr(ctx, x - 2, sy, 20, 7, 1.5);
  ctx.fill();
  if (glow > 0) {
    ctx.globalAlpha = 0.35 * glow;
    ctx.fillStyle = '#5CFF9A';
    rr(ctx, x - 4, sy - 2, 24, 11, 3);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  text(ctx, 'EXIT', x + 8, sy + 3.8, 5.6, '#E9FFE9', { weight: 800 });
}
