import type { World } from '../../game/world';
import { Ctx, circle, ellipse, fillRR, rr, text } from './common';
import { palm } from '../backdrops-south';

export type PropKind =
  | 'lamp'
  | 'chai'
  | 'tree'
  | 'jacaranda'
  | 'barricade'
  | 'cone'
  | 'bench'
  | 'pillar'
  | 'stall'
  | 'bulbs'
  | 'board'
  | 'clock'
  | 'pigeons'
  | 'flowers'
  | 'busstop'
  | 'crowd'
  | 'puddle'
  | 'hangsign'
  | 'branch'
  | 'rails'
  | 'cablebox'
  | 'palm'
  | 'teastall'
  | 'umbrellas'
  | 'kudamrow'
  | 'rueplaque'
  | 'bougain'
  | 'crane'
  | 'chillisacks'
  | 'irani'
  | 'boat'
  | 'netpole'
  | 'teabush'
  | 'footbridge';

/** Decorative props. (x, y) is the foot/bottom-centre unless noted. */
export function drawProp(ctx: Ctx, kind: PropKind, x: number, y: number, w: World, o: Record<string, any>) {
  const t = w.tick / 120;
  switch (kind) {
    case 'lamp': {
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - 1, y - 46, 2, 46);
      ctx.fillRect(x - 1, y - 46, 9, 1.6);
      fillRR(ctx, x + 5, y - 46, 6, 3, 1, '#2B2F33');
      const g = ctx.createRadialGradient(x + 8, y - 42, 1, x + 8, y - 42, 18);
      g.addColorStop(0, 'rgba(255,214,120,0.55)');
      g.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 12, y - 62, 40, 40);
      circle(ctx, x + 8, y - 42.6, 1.6, '#FFE7A6');
      break;
    }
    case 'chai': {
      fillRR(ctx, x - 16, y - 14, 32, 14, 1.4, '#7A4A2A');
      ctx.fillStyle = '#A0643A';
      ctx.fillRect(x - 16, y - 14, 32, 2.6);
      fillRR(ctx, x - 18, y - 34, 36, 9, 1.4, '#1F7A5C');
      text(ctx, 'IRANI CHAI', x, y - 29.4, 5, '#FFF3D6', { weight: 800 });
      ctx.fillStyle = '#5A3A22';
      ctx.fillRect(x - 15, y - 25, 1.6, 11);
      ctx.fillRect(x + 13.4, y - 25, 1.6, 11);
      // kettle + glasses
      fillRR(ctx, x - 10, y - 20, 7, 6, 2, '#C0C4C8');
      ctx.fillStyle = '#C0C4C8';
      ctx.fillRect(x - 3.4, y - 19, 3, 1);
      for (let i = 0; i < 4; i++) {
        fillRR(ctx, x + 1 + i * 3.4, y - 18, 2.4, 3.6, 0.6, 'rgba(255,255,255,0.7)');
        ctx.fillStyle = '#C8843C';
        ctx.fillRect(x + 1.3 + i * 3.4, y - 16.6, 1.8, 2);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 0.7;
      const ph = t % 1;
      ctx.globalAlpha = 1 - ph;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 21 - ph * 5);
      ctx.quadraticCurveTo(x - 4, y - 24 - ph * 5, x - 6, y - 27 - ph * 5);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;
    }
    case 'tree':
    case 'jacaranda': {
      ctx.fillStyle = '#5B4030';
      ctx.fillRect(x - 2, y - 28, 4, 28);
      ctx.fillRect(x - 8, y - 26, 8, 2);
      const c1 = kind === 'jacaranda' ? '#9B7AD1' : '#4F9D5A';
      const c2 = kind === 'jacaranda' ? '#B79BE3' : '#6DBA6E';
      const sway = Math.sin(t * 1.2 + x) * 0.8;
      ellipse(ctx, x - 9 + sway, y - 32, 12, 9, c1);
      ellipse(ctx, x + 8 + sway, y - 34, 13, 10, c1);
      ellipse(ctx, x + sway, y - 42, 14, 10, c2);
      ellipse(ctx, x - 3 + sway, y - 33, 9, 6, c2);
      if (kind === 'jacaranda') {
        ctx.fillStyle = '#C9B3EE';
        for (let i = 0; i < 5; i++) {
          const fy = (t * 8 + i * 13) % 34;
          circle(ctx, x - 14 + i * 7 + Math.sin(t + i) * 2, y - 30 + fy, 0.8, '#C9B3EE');
        }
      }
      break;
    }
    case 'barricade': {
      // o.wide: half-width in px (default 15); o.tall: covers a 2-tile solid block
      const hw = o.wide ?? 15;
      const top = o.tall ? y - 32 : y - 15;
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - hw + 2, top + 3, 2, y - top - 3);
      ctx.fillRect(x + hw - 4, top + 3, 2, y - top - 3);
      const bands = o.tall ? [top, top + 12] : [top];
      for (const by of bands) {
        fillRR(ctx, x - hw, by, hw * 2, 7, 1, '#F2C14E');
        ctx.save();
        rr(ctx, x - hw, by, hw * 2, 7, 1);
        ctx.clip();
        ctx.fillStyle = '#1B1B1B';
        for (let i = -1; i < (hw * 2) / 6 + 1; i++) {
          ctx.beginPath();
          ctx.moveTo(x - hw + i * 6, by);
          ctx.lineTo(x - hw + 3 + i * 6, by);
          ctx.lineTo(x - hw + i * 6, by + 7);
          ctx.lineTo(x - hw - 3 + i * 6, by + 7);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
      if (o.label) text(ctx, o.label, x, top - 5, 4.6, '#C0392B', { weight: 800, stroke: '#fff', lw: 1.4 });
      break;
    }
    case 'cone': {
      ctx.fillStyle = '#F77F00';
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x - 1.2, y - 11);
      ctx.lineTo(x + 1.2, y - 11);
      ctx.lineTo(x + 4, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - 2.4, y - 6.6, 4.8, 1.6);
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - 5, y - 1, 10, 1);
      break;
    }
    case 'bench': {
      ctx.fillStyle = '#5B4030';
      ctx.fillRect(x - 12, y - 7, 24, 2);
      ctx.fillRect(x - 12, y - 12, 24, 1.6);
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - 10, y - 7, 1.6, 7);
      ctx.fillRect(x + 8.4, y - 7, 1.6, 7);
      break;
    }
    case 'pillar': {
      const h = o.h ?? 120;
      ctx.fillStyle = o.color ?? 'rgba(120,110,150,0.55)';
      ctx.fillRect(x - 7, y - h, 14, h);
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(x - 7, y - h, 3, h);
      ctx.fillStyle = o.color ?? 'rgba(120,110,150,0.55)';
      ctx.fillRect(x - 12, y - h, 24, 6);
      break;
    }
    case 'stall': {
      fillRR(ctx, x - 18, y - 14, 36, 14, 1, '#C0392B');
      ctx.fillStyle = '#F2C14E';
      ctx.fillRect(x - 18, y - 14, 36, 2);
      ctx.fillStyle = '#5A3A22';
      ctx.fillRect(x - 16, y - 34, 1.6, 20);
      ctx.fillRect(x + 14.4, y - 34, 1.6, 20);
      ctx.fillStyle = '#F2C14E';
      ctx.beginPath();
      ctx.moveTo(x - 22, y - 30);
      for (let i = 0; i <= 8; i++) ctx.lineTo(x - 22 + i * 5.5, y - 30 + (i % 2 ? 3 : 0));
      ctx.lineTo(x + 22, y - 36);
      ctx.lineTo(x - 22, y - 36);
      ctx.closePath();
      ctx.fill();
      text(ctx, o.label ?? 'VADA PAV ₹15', x, y - 9, 4.8, '#FFF3D6', { weight: 800 });
      for (let i = 0; i < 4; i++) circle(ctx, x - 9 + i * 6, y - 17, 2.2, '#D99A3C');
      break;
    }
    case 'bulbs': {
      const x2 = o.x2 ?? x + 80,
        y2 = o.y2 ?? y;
      ctx.strokeStyle = 'rgba(40,30,30,0.6)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo((x + x2) / 2, Math.max(y, y2) + 10, x2, y2);
      ctx.stroke();
      const cols = ['#FFD166', '#EF476F', '#06D6A0', '#118AB2'];
      for (let i = 1; i < 12; i++) {
        const k = i / 12;
        const bx = (1 - k) * (1 - k) * x + 2 * (1 - k) * k * ((x + x2) / 2) + k * k * x2;
        const by = (1 - k) * (1 - k) * y + 2 * (1 - k) * k * (Math.max(y, y2) + 10) + k * k * y2;
        const on = Math.sin(t * 3 + i) > -0.3;
        circle(ctx, bx, by + 1.4, 1.2, on ? cols[i % 4] : '#4A4A4A');
      }
      break;
    }
    case 'board': {
      const bw = o.w ?? 64;
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - bw / 2 + 4, y - 16, 1.6, 16);
      ctx.fillRect(x + bw / 2 - 5.6, y - 16, 1.6, 16);
      fillRR(ctx, x - bw / 2, y - 34, bw, 19, 1.4, '#F7D046', '#111', 1);
      text(ctx, o.local ?? '', x, y - 29, 5.6, '#111', { weight: 700 });
      text(ctx, o.name ?? '', x, y - 21.4, 6, '#111', { weight: 800 });
      break;
    }
    case 'clock': {
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - 0.8, y - 10, 1.6, 10);
      circle(ctx, x, y - 16, 7, '#F4F1EA', '#2B2F33', 1.4);
      const m = (t * 0.6) % (Math.PI * 2);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + Math.sin(m) * 5, y - 16 - Math.cos(m) * 5);
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + Math.sin(m / 12 + 1) * 3.4, y - 16 - Math.cos(m / 12 + 1) * 3.4);
      ctx.stroke();
      break;
    }
    case 'pigeons': {
      for (let i = 0; i < (o.n ?? 3); i++) {
        const px = x + i * 7,
          peck = Math.sin(t * 5 + i * 2) > 0.6 ? 1.2 : 0;
        ellipse(ctx, px, y - 2.4, 2.8, 1.9, '#8A93A6');
        circle(ctx, px + 2.4, y - 3.8 + peck, 1.2, '#6E778B');
        ctx.fillStyle = '#E07A3C';
        ctx.fillRect(px + 3.3, y - 3.8 + peck, 1, 0.6);
      }
      break;
    }
    case 'flowers': {
      fillRR(ctx, x - 6, y - 7, 12, 7, 1.6, '#B5653A');
      for (let i = 0; i < 5; i++) circle(ctx, x - 5 + i * 2.5, y - 9 - (i % 2) * 1.6, 1.8, i % 2 ? '#F9A826' : '#F77F00');
      break;
    }
    case 'busstop': {
      ctx.fillStyle = '#3A3F44';
      ctx.fillRect(x - 20, y - 30, 2, 30);
      ctx.fillRect(x + 18, y - 30, 2, 30);
      fillRR(ctx, x - 24, y - 34, 48, 5, 1.4, '#2E7D32');
      text(ctx, 'BUS STOP', x, y - 31.4, 3.8, '#fff', { weight: 800 });
      ctx.fillStyle = 'rgba(180,220,230,0.25)';
      ctx.fillRect(x - 18, y - 29, 36, 18);
      ctx.fillStyle = '#5B4030';
      ctx.fillRect(x - 14, y - 8, 28, 2);
      break;
    }
    case 'crowd': {
      const n = o.n ?? 4;
      const cols = ['#2F6FB5', '#E63946', '#F2C14E', '#2E7D32', '#8E6CCB', '#F77F00'];
      for (let i = 0; i < n; i++) {
        const cx = x + i * 7,
          bob = Math.sin(t * 2 + i * 1.7) * 0.4;
        fillRR(ctx, cx - 3, y - 12 + bob, 6, 12, 2, cols[(i + (o.seed ?? 0)) % cols.length]);
        circle(ctx, cx, y - 15 + bob, 2.6, i % 2 ? '#8A5A36' : '#A86F45');
        ctx.fillStyle = '#1B1B1B';
        ctx.beginPath();
        ctx.arc(cx, y - 15.6 + bob, 2.7, Math.PI, 0);
        ctx.fill();
      }
      break;
    }
    case 'hangsign': {
      // a gantry board hanging over the road; (x, y) = centre-x, top of its tile row; covers 2x1 tiles
      ctx.strokeStyle = '#3A3F44';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - 5, 0);
      ctx.lineTo(x - 5, y);
      ctx.moveTo(x + 5, 0);
      ctx.lineTo(x + 5, y);
      ctx.stroke();
      fillRR(ctx, x - 8, y, 16, 16, 1.6, '#C0392B', '#F4F4F4', 0.9);
      text(ctx, o.label ?? '', x, y + 6.4, 4.4, '#FFFFFF', { weight: 800, maxW: 14 });
      if (o.sub) text(ctx, o.sub, x, y + 11.6, 2.8, '#FFE3DE', { weight: 600, maxW: 14 });
      break;
    }
    case 'branch': {
      // a low rain-tree branch; covers 2x1 tiles at (x centre, y top)
      ctx.strokeStyle = '#5B4030';
      ctx.lineCap = 'round';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + 70, -6);
      ctx.quadraticCurveTo(x + 34, y - 18, x + 2, y + 6);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 24, y - 10);
      ctx.lineTo(x + 16, y - 24);
      ctx.stroke();
      const sway = Math.sin(t * 1.4) * 0.6;
      ellipse(ctx, x + sway, y + 9, 8, 7, '#4F9D5A');
      ellipse(ctx, x + 6 + sway, y + 4, 7, 6, '#6DBA6E');
      ellipse(ctx, x + 18 + sway, y - 16, 9, 6, '#4F9D5A');
      ellipse(ctx, x - 2 + sway, y + 4, 5, 4, '#86C987');
      break;
    }
    case 'cablebox': {
      // a sagging tangle of overhead cables with a junction box; covers 1x1 tile at (x centre, y top)
      ctx.strokeStyle = '#1C1F22';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 90, 30 + i * 6);
        ctx.quadraticCurveTo(x - 30, y + 4 + i * 2, x, y + 4 + i * 2);
        ctx.quadraticCurveTo(x + 40, y + 2 + i * 2, x + 110, 20 + i * 7);
        ctx.stroke();
      }
      fillRR(ctx, x - 8, y, 16, 16, 1.4, '#3A3F44', '#111', 0.8);
      ctx.fillStyle = '#F2C14E';
      ctx.fillRect(x - 6, y + 2, 12, 3);
      ctx.fillStyle = '#111';
      for (let i = 0; i < 3; i++) ctx.fillRect(x - 5 + i * 4, y + 2, 2, 3);
      text(ctx, '⚡', x, y + 10.5, 7, '#F2C14E', { weight: 800 });
      break;
    }
    case 'rails': {
      // railway tracks along the bottom of the pit; (x, y) = left, bottom
      ctx.fillStyle = '#2A2833';
      ctx.fillRect(x - 8, y - 10, 600, 10);
      ctx.fillStyle = '#5A4636';
      for (let i = -8; i < 600; i += 10) ctx.fillRect(x + i, y - 7, 6, 4);
      ctx.fillStyle = '#9A98AA';
      ctx.fillRect(x - 8, y - 8, 600, 1.2);
      ctx.fillRect(x - 8, y - 4, 600, 1.2);
      break;
    }
    case 'palm': {
      palm(ctx, x, y, o.h ?? 70, o.lean ?? 8, '#6E5434', '#3E8E4A');
      break;
    }
    case 'footbridge': {
      // a whitewashed canal footbridge: railings on the deck, two pillars down into the water
      const span = (o.w ?? 2) * 16;
      const x0 = x - span / 2;
      const deckH = (o.h ?? 2) * 16;
      // pillars from under the deck down into the canal
      for (const px0 of [x0 + 3, x0 + span - 8]) {
        ctx.fillStyle = '#BDB5A3';
        ctx.fillRect(px0, y + deckH, 5, 34);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(px0 + 3.5, y + deckH, 1.5, 34);
      }
      // railing
      ctx.fillStyle = '#F2EEE4';
      for (let i = 0; i <= span; i += 8) ctx.fillRect(x0 + Math.min(i, span - 1.6), y - 9, 1.6, 9);
      ctx.fillRect(x0 - 1, y - 10, span + 2, 1.8);
      ctx.fillStyle = '#A3342B';
      ctx.fillRect(x0 - 1, y - 5, span + 2, 1.2);
      break;
    }
    case 'teabush': {
      // pruned tea bushes, flat-topped at plucking height, bright new leaves on top
      const span = (o.w ?? 3) * 16;
      const n = Math.max(1, Math.round(span / 13));
      const x0 = x - span / 2;
      for (let i = 0; i < n; i++) {
        const bx = x0 + (i + 0.5) * (span / n);
        const h = 7 + ((i * 7) % 3);
        const sway = Math.sin(t * 1.4 + bx * 0.3) * 0.35;
        ellipse(ctx, bx, y - h * 0.5, 6.8, h * 0.62, '#2A5A34');
        fillRR(ctx, bx - 6.4 + sway, y - h - 1.4, 12.8, 4.2, 2.1, '#3D7D47');
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.fillRect(bx - 5 + sway, y - h - 1.2, 10, 1);
        for (let k = 0; k < 3; k++) circle(ctx, bx - 4 + k * 4 + ((i + k) % 2) + sway, y - h - 1.6, 0.9, '#A8DA70');
      }
      break;
    }
    case 'teastall': {
      // a Kerala-style tea stall: tin roof, glass jars, a kettle on the boil
      fillRR(ctx, x - 22, y - 26, 44, 26, 2, '#8D6E63');
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x - 22, y - 26, 44, 3);
      ctx.fillStyle = '#B0BEC5';
      ctx.beginPath();
      ctx.moveTo(x - 28, y - 30);
      ctx.lineTo(x + 28, y - 34);
      ctx.lineTo(x + 28, y - 38);
      ctx.lineTo(x - 28, y - 34);
      ctx.fill();
      for (let i = 0; i < 3; i++) fillRR(ctx, x - 18 + i * 8, y - 22, 6, 8, 1.5, 'rgba(255,255,255,0.6)', '#78909C', 0.6);
      ctx.fillStyle = '#FBC02D';
      for (let i = 0; i < 3; i++) ctx.fillRect(x - 17 + i * 8, y - 18, 4, 3);
      fillRR(ctx, x + 6, y - 24, 10, 8, 3, '#B0BEC5', '#546E7A', 0.6);
      text(ctx, o.label ?? 'CHAAYA', x, y - 6, 6, '#FFF8E1', { weight: 800 });
      break;
    }
    case 'umbrellas': {
      for (let i = 0; i < (o.n ?? 2); i++) {
        const ux = x - 10 + i * 14;
        ctx.strokeStyle = '#1D1D22';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ux, y);
        ctx.lineTo(ux, y - 16);
        ctx.stroke();
        ctx.fillStyle = i % 2 ? '#1D1D22' : '#263238';
        ctx.beginPath();
        ctx.moveTo(ux - 8, y - 14);
        ctx.quadraticCurveTo(ux, y - 24 + Math.sin(t * 3 + i) * 1.5, ux + 8, y - 14);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'kudamrow': {
      const cols = ['#E53935', '#1E88E5', '#43A047', '#FDD835', '#8E24AA', '#FB8C00'];
      for (let i = 0; i < (o.n ?? 4); i++) {
        const kx = x - 20 + i * 11;
        ellipse(ctx, kx, y - 5, 5, 5, cols[i % cols.length]);
        fillRR(ctx, kx - 2, y - 13, 4, 4, 1, cols[i % cols.length]);
      }
      break;
    }
    case 'rueplaque': {
      fillRR(ctx, x - 16, y - 40, 32, 10, 2, '#1976D2', '#F4F1E8', 1);
      text(ctx, o.label ?? 'Rue', x, y - 34.5, 5.5, '#FFFFFF', { weight: 800, maxW: 28 });
      break;
    }
    case 'bougain': {
      for (let i = 0; i < 16; i++) circle(ctx, x - 14 + ((i * 7) % 28), y - 30 + ((i * 5) % 18), 3, i % 3 ? '#D81B60' : '#F06292');
      ctx.strokeStyle = '#5E8B3E';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.quadraticCurveTo(x - 4, y - 18, x - 8, y - 30);
      ctx.stroke();
      break;
    }
    case 'crane': {
      ctx.strokeStyle = '#E3A21A';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - (o.h ?? 120));
      ctx.moveTo(x - 30, y - (o.h ?? 120));
      ctx.lineTo(x + (o.arm ?? 90), y - (o.h ?? 120));
      ctx.stroke();
      ctx.lineWidth = 0.8;
      for (let yy = y; yy > y - (o.h ?? 120); yy -= 8) {
        ctx.beginPath();
        ctx.moveTo(x - 3, yy);
        ctx.lineTo(x + 3, yy - 8);
        ctx.stroke();
      }
      fillRR(ctx, x - 34, y - (o.h ?? 120) - 2, 12, 8, 1, '#7F8C8D');
      break;
    }
    case 'chillisacks': {
      for (let i = 0; i < 3; i++) {
        fillRR(ctx, x - 16 + i * 11, y - 14, 10, 14, 4, '#E8DCC0', '#A1887F', 0.6);
        ellipse(ctx, x - 11 + i * 11, y - 14, 4, 2.5, '#C62828');
      }
      break;
    }
    case 'irani': {
      // an Irani cafe front: bentwood chairs, a menu board, round marble tables
      fillRR(ctx, x - 26, y - 34, 52, 34, 2, '#F4E3C1', '#8D6E63', 1);
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(x - 26, y - 34, 52, 6);
      text(ctx, o.label ?? 'IRANI CAFE', x, y - 31, 5, '#FFF8E1', { weight: 800, maxW: 48 });
      fillRR(ctx, x - 18, y - 22, 14, 10, 1, '#1B5E20');
      text(ctx, 'CHAI 20', x - 11, y - 17, 3.5, '#FFFFFF', { weight: 800 });
      ellipse(ctx, x + 10, y - 8, 7, 2, '#ECEFF1');
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(x + 9, y - 8, 2, 8);
      break;
    }
    case 'boat': {
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath();
      ctx.moveTo(x - 20, y - 8);
      ctx.lineTo(x + 20, y - 8);
      ctx.lineTo(x + 14, y);
      ctx.lineTo(x - 14, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#E8D5B0';
      ctx.fillRect(x - 18, y - 8, 36, 2);
      break;
    }
    case 'netpole': {
      ctx.strokeStyle = '#6D4C41';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 36);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(60,60,60,0.5)';
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y - 34 + i * 5);
        ctx.lineTo(x + 20, y - 30 + i * 5);
        ctx.stroke();
      }
      break;
    }
    case 'puddle': {
      ctx.fillStyle = 'rgba(170,200,240,0.45)';
      ctx.beginPath();
      ctx.ellipse(x, y - 0.6, o.r ?? 10, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

export { rr };
