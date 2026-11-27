import type { Theme } from '../../../render/theme';
import { Ctx, hash } from '../../../render/art/common';
import { sunGlow } from '../../../render/backdrops-west';

// --------------------------------------------------------------- Jaipur
/** the Pink City: Nahargarh's walls along the Aravalli ridge, the giant sundial of Jantar Mantar,
 *  and rows of terracotta-pink havelis with white borders, chhatris and the Hawa Mahal's honeycomb */
export function jaipur(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 110, 62, 15, th.sun);
  // the Aravalli ridge with Nahargarh's crenellated wall snaking along it
  ctx.fillStyle = '#C9A08E';
  ctx.beginPath();
  ctx.moveTo(x0 - 10, 200);
  for (let x = x0 - 10; x <= x1 + 10; x += 16) ctx.lineTo(x, 132 + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 5);
  ctx.lineTo(x1 + 10, 200);
  ctx.fill();
  ctx.fillStyle = '#B88C7A';
  for (let x = Math.floor(x0 / 8) * 8; x < x1; x += 8) {
    const y = 132 + Math.sin(x * 0.011) * 14 + Math.sin(x * 0.037) * 5;
    ctx.fillRect(x, y - 6, 5, 6);
  }
  // the Samrat Yantra: a giant triangular sundial gnomon with its quadrant
  ctx.fillStyle = '#E2B79A';
  ctx.beginPath();
  ctx.moveTo(300, 200);
  ctx.lineTo(340, 118);
  ctx.lineTo(352, 118);
  ctx.lineTo(352, 200);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,60,40,0.4)';
  ctx.lineWidth = 0.8;
  for (let k = 0; k < 8; k++) {
    ctx.beginPath();
    ctx.moveTo(304 + k * 5, 200 - k * 10);
    ctx.lineTo(352, 200 - k * 10);
    ctx.stroke();
  }
  // havelis: pink with white borders, little chhatris on top
  for (let x = Math.floor(x0 / 48) * 48 - 48; x < x1 + 48; x += 48) {
    const h = 46 + hash(x, 5) * 26;
    ctx.fillStyle = hash(x, 6) > 0.5 ? '#D88B7A' : '#C97B6B';
    ctx.fillRect(x, 240 - h, 46, h);
    ctx.fillStyle = '#F8EDE6';
    ctx.fillRect(x, 240 - h, 46, 2);
    for (let k = 0; k < 3; k++) {
      // arched windows outlined in white
      const wx = x + 6 + k * 13,
        wy = 240 - h + 12;
      ctx.fillStyle = '#F8EDE6';
      ctx.beginPath();
      ctx.moveTo(wx - 1, wy + 12);
      ctx.lineTo(wx - 1, wy + 3);
      ctx.quadraticCurveTo(wx + 4, wy - 4, wx + 9, wy + 3);
      ctx.lineTo(wx + 9, wy + 12);
      ctx.fill();
      ctx.fillStyle = '#7A3B32';
      ctx.fillRect(wx + 1, wy + 4, 6, 8);
    }
    if (hash(x, 9) > 0.45) {
      // a chhatri: four little pillars and a dome
      const cx = x + 23,
        cy = 240 - h;
      ctx.fillStyle = '#E8C3B0';
      ctx.fillRect(cx - 8, cy - 9, 2, 9);
      ctx.fillRect(cx + 6, cy - 9, 2, 9);
      ctx.beginPath();
      ctx.arc(cx, cy - 9, 9, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(cx - 0.5, cy - 21, 1, 4);
    }
  }
  // the Hawa Mahal now and then: a tall pink honeycomb of little windows
  for (let x = Math.floor(x0 / 340) * 340 + 210; x < x1 + 60; x += 340) {
    for (let r = 0; r < 6; r++) {
      const w = 70 - r * 9,
        y = 236 - (r + 1) * 17;
      ctx.fillStyle = r % 2 ? '#D9806E' : '#E0907E';
      ctx.fillRect(x - w / 2, y, w, 17);
      ctx.fillStyle = '#F8EDE6';
      for (let k = -w / 2 + 3; k < w / 2 - 3; k += 6) {
        ctx.beginPath();
        ctx.arc(x + k + 2, y + 6, 2.2, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(x + k, y + 6, 4.4, 6);
      }
    }
  }
}
