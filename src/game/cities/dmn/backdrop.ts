import type { Theme } from '../../../render/theme';
import { Ctx, hash } from '../../../render/art/common';
import { palm } from '../../../render/backdrops-south';
import { sunGlow } from '../../../render/backdrops-west';

/** Daman by day: the sea with trawlers flying flags, the Moti Daman fort wall with its bastions and
 *  lighthouse, the white Bom Jesus church front, and bombil drying on racks along the shore. */
export function daman(ctx: Ctx, th: Theme, x0: number, x1: number) {
  sunGlow(ctx, 110, 70, 15, th.sun);
  // the sea
  const sea = ctx.createLinearGradient(0, 150, 0, 205);
  sea.addColorStop(0, '#4FA3C7');
  sea.addColorStop(1, '#2A6F93');
  ctx.fillStyle = sea;
  ctx.fillRect(x0 - 4, 150, x1 - x0 + 8, 56);
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 24; i++) {
    const wx = x0 + hash(i, 13) * (x1 - x0),
      wy = 156 + hash(i, 14) * 44;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 5 + hash(i, 15) * 7, wy);
    ctx.stroke();
  }
  // trawlers with their flags
  for (let x = Math.floor(x0 / 170) * 170 + 30; x < x1 + 60; x += 170) {
    const bx = x + hash(x, 3) * 60,
      by = 168 + hash(x, 4) * 16;
    ctx.fillStyle = ['#1565C0', '#C62828', '#2E7D32'][Math.floor(hash(x, 5) * 3)];
    ctx.beginPath();
    ctx.moveTo(bx - 18, by);
    ctx.lineTo(bx + 20, by);
    ctx.lineTo(bx + 14, by + 7);
    ctx.lineTo(bx - 14, by + 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FAFAFA';
    ctx.fillRect(bx - 6, by - 8, 12, 8);
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(bx + 8, by - 22, 1.5, 22);
    ctx.fillStyle = hash(x, 6) > 0.5 ? '#FF6F00' : '#E91E63';
    ctx.beginPath();
    ctx.moveTo(bx + 9.5, by - 22);
    ctx.lineTo(bx + 18, by - 19);
    ctx.lineTo(bx + 9.5, by - 16);
    ctx.fill();
  }
  // the fort wall with its bastions, and the lighthouse
  ctx.fillStyle = '#9E8C72';
  ctx.fillRect(x0 - 4, 196, x1 - x0 + 8, 44);
  for (let x = Math.floor(x0 / 120) * 120 - 120; x < x1 + 120; x += 120) {
    ctx.fillStyle = '#8C7A60';
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.lineTo(x + 6, 186);
    ctx.lineTo(x + 40, 186);
    ctx.lineTo(x + 46, 240);
    ctx.fill();
    ctx.fillStyle = '#A8967A';
    for (let k = 0; k < 4; k++) ctx.fillRect(x + 6 + k * 10, 181, 6, 5);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = Math.floor(x0 / 10) * 10; x < x1; x += 10) ctx.fillRect(x, 210 + ((x / 10) % 3) * 9, 6, 1);
  const lx = 300;
  ctx.fillStyle = '#FAFAFA';
  ctx.beginPath();
  ctx.moveTo(lx - 7, 186);
  ctx.lineTo(lx - 4, 112);
  ctx.lineTo(lx + 4, 112);
  ctx.lineTo(lx + 7, 186);
  ctx.fill();
  ctx.fillStyle = '#E53935';
  ctx.fillRect(lx - 5.5, 140, 11, 8);
  ctx.fillRect(lx - 5, 164, 10, 8);
  ctx.fillStyle = '#37474F';
  ctx.fillRect(lx - 6, 104, 12, 8);
  ctx.fillStyle = '#FFF59D';
  ctx.fillRect(lx - 4, 106, 8, 4);
  // Bom Jesus: a white church front with a curly gable
  const cx = 430;
  ctx.fillStyle = '#FBF8F2';
  ctx.fillRect(cx - 20, 142, 40, 44);
  ctx.beginPath();
  ctx.moveTo(cx - 20, 142);
  ctx.quadraticCurveTo(cx - 14, 128, cx, 126);
  ctx.quadraticCurveTo(cx + 14, 128, cx + 20, 142);
  ctx.fill();
  ctx.fillRect(cx - 1, 116, 2, 10);
  ctx.fillRect(cx - 3.5, 119, 7, 2);
  ctx.fillStyle = '#6D5A44';
  ctx.beginPath();
  ctx.arc(cx, 172, 6, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(cx - 6, 172, 12, 14);
  // bombil drying on racks
  for (let x = Math.floor(x0 / 90) * 90 + 50; x < x1 + 40; x += 90) {
    ctx.strokeStyle = '#6D4C41';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.lineTo(x, 214);
    ctx.moveTo(x + 34, 240);
    ctx.lineTo(x + 34, 214);
    ctx.moveTo(x - 2, 214);
    ctx.lineTo(x + 36, 214);
    ctx.stroke();
    ctx.fillStyle = '#E0D2B4';
    for (let k = 0; k < 8; k++) ctx.fillRect(x + 2 + k * 4, 215, 2, 9 + ((k * 3) % 4));
  }
  void palm;
}
