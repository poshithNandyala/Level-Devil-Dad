import { circle, Ctx, ellipse, fillRR, rr, shade, text } from './common';

/*
 * Sprites for the trap kit. Every kind is a few flat shapes in the game's
 * hand-drawn style: readable at 16px, recognisable as the real thing,
 * never a copy of any brand, logo or real person.
 */

/** the things built into the shared art (cities before the module system) */
export type BaseThingKind =
  // generic
  | 'crate'
  | 'gate'
  | 'slab'
  | 'boulder'
  | 'barricade'
  | 'shutter'
  | 'pad'
  | 'beam'
  | 'board'
  | 'pebble'
  // Kerala
  | 'redbus'
  | 'coconut'
  | 'puttu'
  | 'scooter'
  | 'dog'
  // Lakshadweep
  | 'odam'
  | 'crab'
  | 'coral'
  | 'shell'
  | 'lighthouse'
  | 'jetty'
  | 'hermit'
  // Chennai
  | 'shareauto'
  | 'kudam'
  | 'kite'
  | 'tumbler'
  | 'pillar'
  // Puducherry
  | 'cyclist'
  | 'baguette'
  | 'flowers'
  | 'rock'
  | 'spout'
  | 'cart'
  | 'spikerow'
  | 'crow'
  | 'jeep'
  | 'frond'
  | 'garland'
  | 'traincar'
  | 'lantern'
  | 'bulbs'
  | 'log'
  | 'bat'
  | 'setwall'
  | 'spark'
  | 'plank'
  // Amaravati
  | 'hook'
  | 'chilli'
  | 'putti'
  | 'doll'
  | 'mirchi'
  | 'mixer'
  // Hyderabad
  | 'biscuit'
  | 'chaicup'
  | 'divider'
  | 'clock'
  // Bengaluru / Mumbai
  | 'paver'
  | 'blossom'
  | 'kaapi'
  | 'cable'
  | 'vada'
  // Goa
  | 'ferry'
  | 'football'
  // Daman
  // Gandhinagar
  | 'ghevar'
  | 'poha'
  | 'chila';
/** every thing kind: the built-in ones plus each city module's own (declared in its things.ts, see docs/CITY-MODULE.md) */
export type ThingKind = BaseThingKind | keyof ModuleThingKinds;

/** filled in by city modules: `declare module` this to add a kind (docs/CITY-MODULE.md) */
export interface ModuleThingKinds {}
/** how a city module draws its own things (installed by src/game/cities/install.ts) */
export type ThingDraw = (ctx: Ctx, x: number, y: number, w: number, h: number, o: ThingDrawOpts) => void;
export const MODULE_THING_DRAW: Partial<Record<ThingKind, ThingDraw>> = {};
export const MODULE_THING_SIZE: Partial<Record<ThingKind, [number, number]>> = {};

const SIZE: Record<BaseThingKind, [number, number]> = {
  crate: [16, 16],
  gate: [16, 48],
  slab: [48, 12],
  boulder: [32, 24],
  barricade: [32, 24],
  shutter: [32, 32],
  pad: [16, 8],
  beam: [48, 8],
  board: [48, 16],
  pebble: [8, 6],
  redbus: [96, 44],
  coconut: [10, 10],
  puttu: [16, 12],
  scooter: [24, 16],
  dog: [24, 12],
  odam: [64, 16],
  crab: [16, 10],
  coral: [32, 8],
  shell: [12, 12],
  lighthouse: [24, 96],
  jetty: [48, 8],
  hermit: [32, 14],
  shareauto: [64, 36],
  kudam: [16, 16],
  kite: [20, 16],
  tumbler: [12, 12],
  pillar: [32, 96],
  cyclist: [32, 30],
  baguette: [24, 6],
  flowers: [32, 16],
  rock: [32, 16],
  spout: [16, 8],
  hook: [32, 12],
  chilli: [32, 12],
  putti: [32, 10],
  doll: [16, 28],
  mirchi: [12, 12],
  mixer: [48, 40],
  biscuit: [32, 8],
  chaicup: [12, 12],
  divider: [16, 16],
  clock: [32, 20],
  paver: [16, 6],
  blossom: [32, 6],
  kaapi: [12, 12],
  cable: [16, 24],
  vada: [12, 12],
  cart: [32, 24],
  spikerow: [16, 10],
  crow: [14, 10],
  jeep: [40, 22],
  frond: [24, 10],
  garland: [32, 6],
  traincar: [48, 26],
  lantern: [12, 16],
  bulbs: [32, 6],
  log: [32, 10],
  bat: [14, 8],
  setwall: [16, 64],
  spark: [5, 5],
  plank: [16, 5],
  ferry: [48, 10],
  football: [10, 10],
  ghevar: [12, 10],
  poha: [12, 10],
  chila: [12, 10],
};

/** the built-in kinds' sizes (install checks a module's new kinds against these) */
export const BASE_THING_SIZE: Readonly<Record<string, [number, number]>> = SIZE;

export function thingSize(k: ThingKind): [number, number] {
  return (SIZE as Partial<Record<ThingKind, [number, number]>>)[k] ?? MODULE_THING_SIZE[k]!;
}

export interface ThingDrawOpts {
  t: number;
  anim: number;
  flip?: boolean;
  label?: string;
  tint?: string;
  look?: string;
  state?: string;
}

export function wheel(ctx: Ctx, x: number, y: number, r: number, spin: number) {
  circle(ctx, x, y, r, '#2B2B2E');
  circle(ctx, x, y, r * 0.45, '#9AA0A6');
  ctx.strokeStyle = '#2B2B2E';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + Math.cos(spin) * r * 0.45, y + Math.sin(spin) * r * 0.45);
  ctx.lineTo(x - Math.cos(spin) * r * 0.45, y - Math.sin(spin) * r * 0.45);
  ctx.stroke();
}

export function steam(ctx: Ctx, x: number, y: number, t: number, n = 2, alpha = 0.55) {
  ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const ph = (t / 50 + i / n) % 1;
    ctx.globalAlpha = 1 - ph;
    ctx.beginPath();
    ctx.moveTo(x + i * 4, y - ph * 8);
    ctx.quadraticCurveTo(x + 2 + i * 4, y - 3 - ph * 8, x + i * 4, y - 6 - ph * 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawThing(ctx: Ctx, kind: ThingKind, x: number, y: number, w: number, h: number, o: ThingDrawOpts) {
  ctx.save();
  if (o.flip) {
    ctx.translate(x * 2 + w, 0);
    ctx.scale(-1, 1);
  }
  const t = o.t;
  switch (kind) {
    case 'crate': {
      fillRR(ctx, x, y, w, h, 2, '#B07A45', '#6B4423', 1);
      ctx.strokeStyle = '#6B4423';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 2);
      ctx.lineTo(x + w - 2, y + h - 2);
      ctx.moveTo(x + w - 2, y + 2);
      ctx.lineTo(x + 2, y + h - 2);
      ctx.stroke();
      break;
    }
    case 'gate': {
      // old fort portcullis: iron bars in a wooden frame
      fillRR(ctx, x, y, w, h, 1, '#5A3A22');
      ctx.fillStyle = '#2E2E33';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 2 + i * 5, y + 2, 2, h - 4);
      ctx.fillRect(x + 1, y + h * 0.3, w - 2, 2);
      ctx.fillRect(x + 1, y + h * 0.65, w - 2, 2);
      ctx.fillStyle = '#B9B9C0';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 1 + i * 5, y + h);
        ctx.lineTo(x + 3 + i * 5, y + h + 4);
        ctx.lineTo(x + 5 + i * 5, y + h);
        ctx.fill();
      }
      break;
    }
    case 'slab': {
      if (o.look === 'hook' || o.look === 'slip') {
        // hanging from a crane: two chains to a hook, a cable to the sky
        const hx = x + w / 2,
          hy = y - 16;
        ctx.strokeStyle = '#3E3E42';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 3, y);
        ctx.lineTo(hx, hy + 4);
        ctx.lineTo(x + w - 3, y);
        ctx.moveTo(hx, hy);
        ctx.lineTo(hx, hy - 400);
        ctx.stroke();
        fillRR(ctx, hx - 4, hy - 2, 8, 6, 2, o.look === 'slip' ? '#E53935' : '#F2B01E', '#7A5A0B');
      }
      fillRR(ctx, x, y, w, h, 1, '#B9B4AA', '#6E6A63');
      ctx.fillStyle = '#9C978D';
      for (let i = 4; i < w; i += 9) ctx.fillRect(x + i, y + 3, 4, 1);
      ctx.fillStyle = '#5F5B55';
      ctx.fillRect(x + 4, y + h - 3, w - 8, 1);
      break;
    }
    case 'boulder': {
      ctx.fillStyle = o.tint ?? '#9C8A78';
      ctx.beginPath();
      ctx.moveTo(x + 3, y + h);
      ctx.quadraticCurveTo(x - 1, y + h * 0.3, x + w * 0.45, y + 1);
      ctx.quadraticCurveTo(x + w + 2, y + h * 0.2, x + w - 2, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ellipse(ctx, x + w * 0.4, y + h * 0.3, w * 0.18, h * 0.12, 'rgba(255,255,255,0.2)');
      break;
    }
    case 'barricade': {
      fillRR(ctx, x, y, w, h - 4, 1, '#2F6FB3', '#1D4878');
      ctx.strokeStyle = '#5C95D1';
      for (let i = 3; i < w; i += 4) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 2);
        ctx.lineTo(x + i, y + h - 6);
        ctx.stroke();
      }
      ctx.fillStyle = '#3B3B3B';
      ctx.fillRect(x + 3, y + h - 4, 3, 4);
      ctx.fillRect(x + w - 6, y + h - 4, 3, 4);
      break;
    }
    case 'shutter': {
      fillRR(ctx, x, y, w, h, 1, '#8C9196', '#4B4F53');
      ctx.strokeStyle = '#6A6F74';
      for (let i = 3; i < h; i += 3) {
        ctx.beginPath();
        ctx.moveTo(x + 1, y + i);
        ctx.lineTo(x + w - 1, y + i);
        ctx.stroke();
      }
      fillRR(ctx, x + w / 2 - 4, y + h - 4, 8, 3, 1, '#3B3E41');
      break;
    }
    case 'pad': {
      const sq = o.anim ? 2 : 0;
      fillRR(ctx, x, y + 3 + sq, w, h - 3 - sq, 2, '#5D6D7E');
      ctx.strokeStyle = '#D5DBDB';
      ctx.beginPath();
      for (let i = 0; i < 3; i++) ctx.moveTo(x + 3 + i * 5, y + 3 + sq), ctx.lineTo(x + 5 + i * 5, y + 1 + sq);
      ctx.stroke();
      fillRR(ctx, x + 1, y + sq, w - 2, 3, 1, '#E74C3C');
      break;
    }
    case 'beam':
    case 'coral': {
      const on = o.look !== 'off';
      const warn = o.look === 'warn';
      if (!on) {
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = 'rgba(255,255,255,0.45)';
        ctx.lineWidth = 1;
        rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 3);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      ctx.globalAlpha = warn ? 0.55 + 0.45 * Math.abs(Math.sin(t * 0.4)) : 1;
      if (kind === 'coral') {
        fillRR(ctx, x, y, w, h, 3, '#F08A7E', '#B4574D');
        ctx.fillStyle = '#FFD1C8';
        for (let i = 3; i < w - 2; i += 6) circle(ctx, x + i, y + 3, 1.3, '#FFD1C8');
      } else {
        const g = ctx.createLinearGradient(x, y, x, y + h);
        g.addColorStop(0, '#FFF6C9');
        g.addColorStop(1, '#F7C948');
        fillRR(ctx, x, y, w, h, 3, '#F7C948');
        ctx.fillStyle = g;
        rr(ctx, x, y, w, h, 3);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'board': {
      fillRR(ctx, x, y, w, h, 2, o.tint ?? '#1F6F43', '#F4F1E8', 1.2);
      if (o.label) text(ctx, o.label, x + w / 2, y + h / 2 + 0.5, Math.min(9, h - 5), '#FFFFFF', { weight: 800, maxW: w - 6 });
      break;
    }
    case 'pebble': {
      ellipse(ctx, x + w / 2, y + h / 2 + 1, w / 2, h / 2, '#8E8478');
      break;
    }
    // ------------------------------------------------------------ Kerala
    case 'redbus': {
      // a state express bus: deep red with a cream band, rounded front
      const body = o.tint ?? '#C62828';
      fillRR(ctx, x, y + 2, w, h - 10, 6, body, shade(body, -0.4), 1);
      fillRR(ctx, x + 2, y + 4, w - 4, 6, 3, '#F3D27A');
      ctx.fillStyle = '#BFE3F2';
      for (let i = 0; i < 6; i++) fillRR(ctx, x + 6 + i * 13, y + 12, 10, 9, 1.5, '#CDE8F2');
      fillRR(ctx, x + w - 12, y + 12, 9, 14, 2, '#9FD0E6');
      ctx.fillStyle = shade(body, -0.25);
      ctx.fillRect(x + 2, y + h - 16, w - 4, 4);
      ctx.fillStyle = '#F3D27A';
      ctx.fillRect(x + 4, y + h - 21, w - 20, 2);
      wheel(ctx, x + 18, y + h - 6, 6, o.anim * 0.2);
      wheel(ctx, x + w - 22, y + h - 6, 6, o.anim * 0.2);
      if (o.label) text(ctx, o.label, x + w / 2 - 6, y + 7, 6, '#7A1B12', { weight: 800, maxW: w - 20 });
      break;
    }
    case 'coconut': {
      circle(ctx, x + w / 2, y + h / 2, w / 2, '#7B5232');
      ctx.strokeStyle = '#5A3A22';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2 - 1.5, o.anim, o.anim + 1.6);
      ctx.stroke();
      circle(ctx, x + w * 0.4 + Math.cos(o.anim) * 1.5, y + h * 0.4 + Math.sin(o.anim) * 1.5, 1, '#3A2414');
      break;
    }
    case 'puttu': {
      // a steel puttu steamer on a pot: steps fine, then fires steam
      const lift = o.anim >= 1 ? -2 : 0;
      fillRR(ctx, x + 1, y + 4, w - 2, h - 4, 2, '#A9B2B9', '#5F676E');
      fillRR(ctx, x + 4, y + lift, w - 8, 6, 2, '#C7CED3', '#5F676E');
      ctx.fillStyle = '#7C858C';
      ctx.fillRect(x + 3, y + 8, w - 6, 1);
      if (o.anim > 0 && o.anim < 1) {
        ctx.globalAlpha = 0.4 + o.anim * 0.6;
        steam(ctx, x + 4, y, t, 3, 0.9);
      } else steam(ctx, x + 5, y, t, 2, 0.4);
      break;
    }
    case 'scooter': {
      const c = o.tint ?? '#2E86C1';
      fillRR(ctx, x + 4, y + 3, 13, 7, 3, c);
      fillRR(ctx, x + 2, y + 1, 9, 3, 1.5, '#2B2B2E');
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 9);
      ctx.lineTo(x + 20, y);
      ctx.stroke();
      fillRR(ctx, x + 17, y - 1, 6, 2, 1, '#555');
      wheel(ctx, x + 5, y + h - 3, 3, o.anim * 0.3);
      wheel(ctx, x + 19, y + h - 3, 3, o.anim * 0.3);
      break;
    }
    case 'dog': {
      const sleeping = o.look !== 'awake';
      ellipse(ctx, x + 12, y + h - 4, 10, sleeping ? 4 : 5, '#C89B6A');
      circle(ctx, x + 20, y + h - (sleeping ? 5 : 8), 3.5, '#C89B6A');
      ctx.fillStyle = '#8A6440';
      ctx.beginPath();
      ctx.moveTo(x + 19, y + h - (sleeping ? 8 : 11));
      ctx.lineTo(x + 21, y + h - (sleeping ? 11 : 14));
      ctx.lineTo(x + 22, y + h - (sleeping ? 8 : 11));
      ctx.fill();
      ctx.strokeStyle = '#8A6440';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 3, y + h - 5);
      ctx.quadraticCurveTo(x - 1, y + h - (sleeping ? 6 : 10) + Math.sin(t * 0.3) * (sleeping ? 0 : 2), x + 1, y + h - 9);
      ctx.stroke();
      if (sleeping) text(ctx, 'z', x + 23, y + 1 + Math.sin(t * 0.05) * 1.5, 6, '#5D6D7E', { weight: 800 });
      break;
    }
    // ------------------------------------------------------------ Lakshadweep
    case 'odam': {
      // a wooden island launch with a curved prow
      ctx.fillStyle = '#8B5A2B';
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.lineTo(x + w, y + 2);
      ctx.quadraticCurveTo(x + w + 4, y - 6, x + w + 2, y - 8);
      ctx.lineTo(x + w - 6, y + h);
      ctx.lineTo(x + 6, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#E8D5B0';
      ctx.fillRect(x + 2, y + 2, w - 4, 3);
      ctx.fillStyle = '#2E86C1';
      ctx.fillRect(x + 6, y + 7, w - 14, 2);
      ctx.fillStyle = '#6B4423';
      ctx.fillRect(x + w / 2 - 1, y - 14, 2, 16);
      ctx.fillStyle = '#F4F1E8';
      ctx.beginPath();
      ctx.moveTo(x + w / 2 + 1, y - 14);
      ctx.lineTo(x + w / 2 + 10, y - 4);
      ctx.lineTo(x + w / 2 + 1, y - 4);
      ctx.fill();
      break;
    }
    case 'crab': {
      const sc = Math.sin(t * 0.4) * 1.2;
      ellipse(ctx, x + w / 2, y + h - 4, 6, 4, '#E4572E');
      ctx.strokeStyle = '#E4572E';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + h - 1);
      ctx.lineTo(x + 4, y + h - 4);
      ctx.moveTo(x + w - 2, y + h - 1);
      ctx.lineTo(x + w - 4, y + h - 4);
      ctx.stroke();
      circle(ctx, x + 2, y + 3 + sc, 2.3, '#E4572E');
      circle(ctx, x + w - 2, y + 3 - sc, 2.3, '#E4572E');
      circle(ctx, x + w / 2 - 2, y + h - 8, 1, '#1D1D22');
      circle(ctx, x + w / 2 + 2, y + h - 8, 1, '#1D1D22');
      break;
    }
    case 'shell': {
      ctx.fillStyle = '#F6D7C3';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 11);
      ctx.lineTo(x + 1, y + 3);
      ctx.quadraticCurveTo(x + 6, y - 1, x + 11, y + 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#C9967A';
      ctx.lineWidth = 0.8;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 6, y + 10);
        ctx.lineTo(x + 6 + i * 2.2, y + 2);
        ctx.stroke();
      }
      break;
    }
    case 'lighthouse': {
      const lit = o.look === 'lit';
      ctx.fillStyle = '#F4F1E8';
      ctx.beginPath();
      ctx.moveTo(x + 5, y + h);
      ctx.lineTo(x + 8, y + 18);
      ctx.lineTo(x + w - 8, y + 18);
      ctx.lineTo(x + w - 5, y + h);
      ctx.fill();
      ctx.fillStyle = '#D84315';
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 6 + i * 0.6, y + 26 + i * 24, w - 12 - i * 1.2, 10);
      fillRR(ctx, x + 6, y + 8, w - 12, 10, 2, lit ? '#FFF59D' : '#B0BEC5', '#37474F');
      ctx.fillStyle = '#37474F';
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 8);
      ctx.lineTo(x + w / 2, y);
      ctx.lineTo(x + w - 5, y + 8);
      ctx.fill();
      break;
    }
    case 'hermit': {
      // a giant hermit crab shell: looks like a reef stone until it moves
      const walk = o.state === 'move' ? Math.sin(t * 0.6) * 1.5 : 0;
      ctx.strokeStyle = '#C0392B';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + 8 + i * 6, y + h - 3);
        ctx.lineTo(x + 6 + i * 6 + walk, y + h + 2);
        ctx.stroke();
      }
      ctx.fillStyle = o.look === 'awake' ? '#F3C6A8' : '#E9D6C2';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.quadraticCurveTo(x + 2, y - 2, x + w * 0.55, y);
      ctx.quadraticCurveTo(x + w + 2, y + 2, x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#C9A88C';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(x + w * 0.55, y + h, i * 4, Math.PI, Math.PI * 1.9);
        ctx.stroke();
      }
      if (o.look === 'awake') {
        circle(ctx, x + w - 3, y + 4, 1.4, '#1D1D22');
        circle(ctx, x + w - 7, y + 3, 1.4, '#1D1D22');
      }
      break;
    }
    case 'jetty': {
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(x, y, w, 4);
      ctx.fillStyle = '#6D4C41';
      for (let i = 2; i < w; i += 10) ctx.fillRect(x + i, y + 4, 3, h + 10);
      ctx.strokeStyle = '#5D4037';
      for (let i = 6; i < w; i += 6) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i, y + 4);
        ctx.stroke();
      }
      break;
    }
    // ------------------------------------------------------------ Chennai
    case 'shareauto': {
      // the long yellow eight-seater
      const c = o.tint ?? '#FFB300';
      fillRR(ctx, x + 2, y + 4, w - 8, h - 12, 5, c, shade(c, -0.45), 1);
      fillRR(ctx, x, y + 2, w - 4, 6, 3, '#2B2B2E');
      ctx.fillStyle = '#2B2B2E';
      for (let i = 0; i < 3; i++) fillRR(ctx, x + 8 + i * 15, y + 11, 11, 9, 1.5, 'rgba(30,30,35,0.75)');
      fillRR(ctx, x + w - 12, y + 9, 8, 12, 2, '#CDE8F2');
      ctx.fillStyle = shade(c, -0.25);
      ctx.fillRect(x + 4, y + h - 13, w - 12, 3);
      wheel(ctx, x + 12, y + h - 5, 5, o.anim * 0.25);
      wheel(ctx, x + w - 16, y + h - 5, 5, o.anim * 0.25);
      break;
    }
    case 'kudam': {
      // plastic water pot, bright and round
      const c = o.tint ?? '#E53935';
      ellipse(ctx, x + w / 2, y + h - 6, 7.5, 6, c);
      fillRR(ctx, x + 5, y + 1, 6, 5, 1.5, shade(c, -0.15));
      ellipse(ctx, x + w / 2, y + 1.5, 4, 1.4, shade(c, -0.35));
      ellipse(ctx, x + 5, y + h - 8, 1.5, 3, 'rgba(255,255,255,0.35)');
      break;
    }
    case 'kite': {
      ctx.fillStyle = o.tint ?? '#E91E63';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w / 2, y + h);
      ctx.lineTo(x, y + h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#FFF';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y);
      ctx.lineTo(x + w / 2, y + h);
      ctx.moveTo(x, y + h / 2);
      ctx.lineTo(x + w, y + h / 2);
      ctx.stroke();
      ctx.strokeStyle = '#555';
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.quadraticCurveTo(x + w / 2 - 6, y + h + 6 + Math.sin(t * 0.3) * 2, x + w / 2 - 12, y + h + 4);
      ctx.stroke();
      break;
    }
    case 'tumbler': {
      // filter kaapi: brass tumbler in a dabarah
      ellipse(ctx, x + 6, y + 11, 6, 1.6, '#B8860B');
      fillRR(ctx, x + 3, y + 2, 6, 9, 1.2, '#D4A017', '#8B6508', 0.8);
      ellipse(ctx, x + 6, y + 2.5, 3, 1, '#6D4C41');
      steam(ctx, x + 4, y + 1, t, 2, 0.5);
      break;
    }
    case 'pillar': {
      ctx.fillStyle = '#B0ADA6';
      ctx.fillRect(x + 8, y + 12, w - 16, h - 12);
      ctx.fillStyle = '#9A978F';
      ctx.fillRect(x + 8, y + 12, 4, h - 12);
      ctx.fillStyle = '#C9C6BE';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - 8, y + 14);
      ctx.lineTo(x + 8, y + 14);
      ctx.fill();
      break;
    }
    // ------------------------------------------------------------ Puducherry
    case 'cyclist': {
      // a baker on an old black bicycle, baguettes sticking out of the rear basket (faces left)
      const gy = y + h - 6.5;
      const pedal = o.anim * 0.35;
      wheel(ctx, x + 7, gy, 6.5, pedal);
      wheel(ctx, x + w - 7, gy, 6.5, pedal);
      const seatX = x + w - 12,
        seatY = y + h - 17;
      const barX = x + 9,
        barY = y + h - 19;
      const crankX = x + 16,
        crankY = y + h - 8;
      ctx.strokeStyle = '#1D1D22';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + w - 7, gy);
      ctx.lineTo(seatX, seatY);
      ctx.lineTo(crankX, crankY);
      ctx.lineTo(x + w - 7, gy);
      ctx.moveTo(crankX, crankY);
      ctx.lineTo(barX, barY);
      ctx.lineTo(x + 7, gy);
      ctx.moveTo(barX - 2, barY - 1);
      ctx.lineTo(barX + 3, barY - 1);
      ctx.stroke();
      // basket and bread
      fillRR(ctx, x + w - 11, y + h - 19, 10, 5, 1, '#A1887F', '#5D4037', 0.8);
      ctx.strokeStyle = '#E0A458';
      ctx.lineWidth = 2.6;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w - 9 + i * 3, y + h - 18);
        ctx.lineTo(x + w - 3 + i * 3, y + h - 28 + i * 2);
        ctx.stroke();
      }
      // legs, pedalling
      const px2 = crankX + Math.cos(pedal) * 3.5,
        py2 = crankY + Math.sin(pedal) * 3.5;
      ctx.strokeStyle = '#37474F';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(seatX, seatY - 1);
      ctx.lineTo(x + 15, y + h - 15);
      ctx.lineTo(px2, py2);
      ctx.stroke();
      // body leaning to the handlebar
      ctx.strokeStyle = '#F4F1E8';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(seatX, seatY - 2);
      ctx.lineTo(x + 15, y + h - 26);
      ctx.stroke();
      ctx.strokeStyle = '#8D5524';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(x + 15, y + h - 25);
      ctx.lineTo(barX + 1, barY - 1);
      ctx.stroke();
      ctx.lineCap = 'butt';
      circle(ctx, x + 13, y + h - 30, 3.6, '#8D5524');
      fillRR(ctx, x + 9, y + h - 35, 8, 3, 1.2, '#263238');
      break;
    }
    case 'baguette': {
      fillRR(ctx, x, y + 1, w, h - 2, 3, '#E0A458', '#A86B2D', 0.8);
      ctx.strokeStyle = '#F6D49A';
      for (let i = 5; i < w - 2; i += 5) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 2);
        ctx.lineTo(x + i + 2, y + h - 2);
        ctx.stroke();
      }
      break;
    }
    case 'flowers': {
      // bougainvillea spilling over a wall
      ctx.fillStyle = '#5E8B3E';
      ctx.fillRect(x + 2, y + 4, w - 4, 3);
      for (let i = 0; i < 14; i++) {
        const fx = x + 2 + ((i * 7) % (w - 4));
        const fy = y + 2 + ((i * 5) % (h - 4));
        circle(ctx, fx, fy, 2.4, i % 3 ? '#D81B60' : '#F06292');
      }
      break;
    }
    case 'rock': {
      // black seawall granite
      ctx.fillStyle = '#37474F';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x + 3, y + 3);
      ctx.lineTo(x + w * 0.45, y);
      ctx.lineTo(x + w - 4, y + 2);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fillRect(x + 6, y + 3, w * 0.4, 2);
      break;
    }
    case 'spout': {
      // a blowhole between rocks: spray when it fires
      fillRR(ctx, x, y + 4, w, h - 4, 2, '#263238');
      if (o.anim > 0) {
        ctx.fillStyle = 'rgba(200,235,255,0.85)';
        for (let i = 0; i < 6; i++) circle(ctx, x + w / 2 + Math.sin(i * 2 + t) * 4, y - i * 6, 3 - i * 0.3, 'rgba(200,235,255,0.85)');
      }
      break;
    }
    // ------------------------------------------------------------ Amaravati
    case 'hook': {
      ctx.strokeStyle = '#3E3E42';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y - 400);
      ctx.lineTo(x + w / 2, y);
      ctx.stroke();
      fillRR(ctx, x + w / 2 - 5, y - 2, 10, 6, 2, '#F2B01E', '#7A5A0B');
      ctx.strokeStyle = '#3E3E42';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + h);
      ctx.lineTo(x + w / 2, y + 4);
      ctx.lineTo(x + w - 2, y + h);
      ctx.stroke();
      break;
    }
    case 'chilli': {
      // a drying mound of red chillies
      ctx.fillStyle = '#B71C1C';
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.quadraticCurveTo(x + w / 2, y - 4 + (o.anim ? 2 : 0), x + w, y + h);
      ctx.fill();
      for (let i = 0; i < 9; i++) {
        const cx = x + 4 + ((i * 11) % (w - 8));
        const cy = y + h - 2 - ((i * 7) % 7);
        ellipse(ctx, cx, cy, 3, 1.1, i % 2 ? '#E53935' : '#C62828', (i * 0.7) % 3);
      }
      if (o.anim > 0) {
        ctx.fillStyle = 'rgba(229,57,53,0.35)';
        circle(ctx, x + w / 2, y - 6, 7, 'rgba(229,57,53,0.3)');
      }
      break;
    }
    case 'putti': {
      // round woven coracle (seen from the side)
      ctx.fillStyle = '#8D6E3F';
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.quadraticCurveTo(x + w / 2, y + h + 6, x + w, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5D4523';
      ctx.lineWidth = 0.8;
      for (let i = 4; i < w; i += 4) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 2);
        ctx.lineTo(x + i, y + h - 2);
        ctx.stroke();
      }
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(x, y, w, 2.5);
      break;
    }
    case 'doll': {
      // a painted wooden toy that nods its head
      const nod = Math.sin(o.anim * 0.25) * (o.look === 'nod' ? 6 : 1);
      fillRR(ctx, x + 3, y + 12, 10, 16, 4, '#E53935', '#7B1F1F', 0.8);
      ctx.fillStyle = '#FDD835';
      ctx.fillRect(x + 4, y + 18, 8, 2);
      ctx.save();
      ctx.translate(x + 8, y + 12);
      ctx.rotate(nod * 0.06);
      circle(ctx, 0, -6, 5, '#F2C9A0', '#7B4A2A', 0.8);
      ctx.fillStyle = '#1B1B1B';
      ctx.fillRect(-5, -11, 10, 3);
      circle(ctx, -2, -6, 0.8, '#1B1B1B');
      circle(ctx, 2, -6, 0.8, '#1B1B1B');
      ctx.restore();
      break;
    }
    case 'mirchi': {
      ctx.fillStyle = '#D32F2F';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 3);
      ctx.quadraticCurveTo(x + 6, y + 14, x + 11, y + 9);
      ctx.quadraticCurveTo(x + 6, y + 9, x + 4, y + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2E7D32';
      ctx.fillRect(x + 2, y + 1, 3, 2);
      break;
    }
    case 'mixer': {
      // cement mixer: drum on a little truck
      fillRR(ctx, x + w - 16, y + 12, 14, 18, 2, '#F2F2F2', '#555');
      ctx.save();
      ctx.translate(x + 18, y + 18);
      ctx.rotate(-0.25);
      ellipse(ctx, 0, 0, 16, 11, '#E67E22');
      ctx.strokeStyle = '#A04000';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-12, -6 + Math.sin(o.anim * 0.1) * 2);
      ctx.lineTo(10, 7);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#4A4A4A';
      ctx.fillRect(x + 2, y + h - 12, w - 4, 4);
      wheel(ctx, x + 10, y + h - 5, 5, o.anim * 0.2);
      wheel(ctx, x + w - 10, y + h - 5, 5, o.anim * 0.2);
      break;
    }
    // ------------------------------------------------------------ Hyderabad
    case 'biscuit': {
      // a round Osmania biscuit floating in chai, seen edge-on
      const soggy = o.look === 'soggy';
      fillRR(ctx, x, y, w, h, 4, soggy ? '#B07A45' : '#E2B068', soggy ? '#7A4E22' : '#A8742E', 1);
      ctx.fillStyle = soggy ? '#93622F' : '#C99247';
      for (let i = 4; i < w - 2; i += 6) circle(ctx, x + i, y + h / 2, 0.9, ctx.fillStyle as string);
      break;
    }
    case 'chaicup': {
      // Irani chai in a white cup and saucer
      ellipse(ctx, x + 6, y + 11, 6, 1.5, '#ECEFF1');
      fillRR(ctx, x + 2, y + 4, 8, 7, 2, '#FFFFFF', '#90A4AE', 0.8);
      ellipse(ctx, x + 6, y + 4.5, 4, 1.2, '#C8915A');
      ctx.strokeStyle = '#90A4AE';
      ctx.beginPath();
      ctx.arc(x + 10.5, y + 7, 1.8, -1.2, 1.2);
      ctx.stroke();
      steam(ctx, x + 4, y + 3, t, 2, 0.5);
      break;
    }
    case 'divider': {
      fillRR(ctx, x, y + 2, w, h - 2, 1, '#F2F2F2', '#555');
      ctx.fillStyle = '#212121';
      for (let i = 0; i < w; i += 6) ctx.fillRect(x + i, y + 2, 3, h - 2);
      ctx.fillStyle = '#F9A825';
      ctx.fillRect(x, y, w, 2);
      break;
    }
    case 'clock': {
      if (o.look === 'pole') {
        fillRR(ctx, x + w / 2 - 2, y + h - 1, 4, 240 - (y + h) + 1, 1, '#3E3E42');
        fillRR(ctx, x + w / 2 - 5, 236, 10, 4, 1, '#3E3E42');
      }
      fillRR(ctx, x, y, w, h, 3, '#1B1B1B', '#555');
      text(ctx, o.label ?? '0:02', x + w / 2, y + h / 2 + 0.5, 9, '#FF5252', { weight: 800 });
      break;
    }
    // ------------------------------------------------------------ Bengaluru / Mumbai
    case 'paver': {
      ctx.fillStyle = '#A8A39A';
      ctx.beginPath();
      ctx.moveTo(x + 3, y);
      ctx.lineTo(x + w - 3, y);
      ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w - 3, y + h);
      ctx.lineTo(x + 3, y + h);
      ctx.lineTo(x, y + h / 2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'blossom': {
      for (let i = 0; i < 18; i++) circle(ctx, x + 1 + ((i * 7) % (w - 2)), y + 1 + ((i * 3) % (h - 1)), 1.8, i % 3 ? '#F48FB1' : '#F8BBD0');
      break;
    }
    case 'kaapi': {
      // by-two: two small steel glasses
      fillRR(ctx, x, y + 3, 5, 9, 1, '#CFD8DC', '#78909C', 0.8);
      fillRR(ctx, x + 7, y + 3, 5, 9, 1, '#CFD8DC', '#78909C', 0.8);
      ctx.fillStyle = '#A1887F';
      ctx.fillRect(x + 0.5, y + 4, 4, 2);
      ctx.fillRect(x + 7.5, y + 4, 4, 2);
      steam(ctx, x + 2, y + 2, t, 2, 0.45);
      break;
    }
    case 'cable': {
      ctx.strokeStyle = '#1B1B1B';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + w / 2, y + h * 1.6, x + w, y);
      ctx.stroke();
      break;
    }
    case 'cart': {
      // a tender-coconut push cart
      fillRR(ctx, x + 2, y + 7, w - 4, 9, 1.5, '#A0522D', '#5D2E0C');
      ctx.fillStyle = '#7A3E12';
      ctx.fillRect(x + 4, y + 10, w - 8, 1);
      for (let i = 0; i < 5; i++) circle(ctx, x + 6 + i * 5, y + 5 - (i % 2) * 2, 3.2, i % 2 ? '#7CB342' : '#558B2F');
      ctx.strokeStyle = '#5D2E0C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + w - 3, y + 10);
      ctx.lineTo(x + w + 4, y + 6);
      ctx.stroke();
      wheel(ctx, x + 9, y + h - 5, 5, o.anim * 0.35);
      wheel(ctx, x + w - 9, y + h - 5, 5, o.anim * 0.35);
      break;
    }
    case 'crow': {
      const flap = Math.sin(t * 0.5) * 3;
      ctx.fillStyle = '#1B1B1F';
      ctx.beginPath();
      ctx.ellipse(x + 7, y + 6, 6, 3.4, 0, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, x + 2.5, y + 4.5, 2.6, '#26262B');
      ctx.fillStyle = '#5E5E66';
      ctx.fillRect(x + 1.6, y + 3, 2, 1.4);
      ctx.beginPath();
      ctx.moveTo(x - 1.5, y + 5);
      ctx.lineTo(x + 0.8, y + 4);
      ctx.lineTo(x + 0.8, y + 6);
      ctx.fillStyle = '#3A3A40';
      ctx.fill();
      ctx.fillStyle = '#1B1B1F';
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + 9, y - 2 + flap);
      ctx.lineTo(x + 12, y + 5);
      ctx.fill();
      circle(ctx, x + 2, y + 4, 0.7, '#FFFFFF');
      break;
    }
    case 'jeep': {
      // an old open hill jeep (faces left)
      fillRR(ctx, x + 1, y + 8, w - 2, 9, 2, '#2E7D32', '#1B5E20');
      ctx.fillStyle = '#1B5E20';
      ctx.fillRect(x + 12, y + 1, 2, 8);
      ctx.fillRect(x + w - 6, y + 1, 2, 8);
      ctx.fillRect(x + 12, y + 1, w - 16, 2);
      ctx.fillStyle = '#B3E5FC';
      ctx.fillRect(x + 5, y + 4, 6, 4);
      circle(ctx, x + 2, y + 12, 1.2, '#FFF6C2');
      wheel(ctx, x + 9, y + h - 4, 4.4, o.anim * 0.35);
      wheel(ctx, x + w - 9, y + h - 4, 4.4, o.anim * 0.35);
      break;
    }
    case 'frond': {
      // a low coconut frond hanging over the water
      ctx.strokeStyle = '#2E7D32';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y + 2);
      ctx.quadraticCurveTo(x + w / 2, y + h, x + w, y + 3);
      ctx.stroke();
      ctx.strokeStyle = '#43A047';
      ctx.lineWidth = 1.2;
      for (let i = 2; i < w; i += 3) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 2 + Math.sin((i / w) * Math.PI) * (h - 3));
        ctx.lineTo(x + i - 2, y + h + 3);
        ctx.stroke();
      }
      break;
    }
    case 'garland': {
      if (o.look === 'bangles' || o.look === 'banglesag') {
        // a string of Laad Bazaar glass bangles, lac and glitter
        const cols = ['#E53935', '#8E24AA', '#1E88E5', '#43A047', '#FDD835', '#FB8C00'];
        ctx.strokeStyle = '#C9A44A';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + w / 2, y + h + (o.look === 'banglesag' ? 8 : 3), x + w, y);
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const k = (i + 0.5) / 8;
          const yy = y + 2 + Math.sin(k * Math.PI) * (h - 1 + (o.look === 'banglesag' ? 4 : 0));
          ctx.strokeStyle = cols[i % cols.length];
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.ellipse(x + k * w, yy, 2.2, 3.2, 0, 0, Math.PI * 2);
          ctx.stroke();
          circle(ctx, x + k * w - 0.8, yy - 1.6, 0.5, 'rgba(255,255,255,0.9)');
        }
        break;
      }
      // a sagging string of jasmine
      for (let i = 0; i <= 16; i++) {
        const k = i / 16;
        circle(ctx, x + k * w, y + 1 + Math.sin(k * Math.PI) * (h + (o.look === 'sag' ? 4 : 0)), 1.7, i % 4 === 0 ? '#F8BBD0' : '#FFFDF2');
      }
      break;
    }
    case 'traincar': {
      // a little blue mountain-railway carriage (faces left)
      fillRR(ctx, x, y + 2, w, h - 8, 2, '#3B5BA5', '#23386B');
      ctx.fillStyle = '#F2F5FB';
      ctx.fillRect(x, y + 2, w, 3);
      ctx.fillStyle = '#C9D6EE';
      for (let i = 0; i < 4; i++) ctx.fillRect(x + 4 + i * 11, y + 7, 7, 6);
      ctx.fillStyle = '#C62828';
      ctx.fillRect(x, y + h - 9, w, 2);
      wheel(ctx, x + 9, y + h - 4, 4, o.anim * 0.3);
      wheel(ctx, x + w - 9, y + h - 4, 4, o.anim * 0.3);
      break;
    }
    case 'lantern': {
      // a paper sky lantern, glowing
      const g = ctx.createRadialGradient(x + 6, y + 8, 1, x + 6, y + 8, 14);
      g.addColorStop(0, 'rgba(255,200,90,0.55)');
      g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 8, y - 6, 28, 30);
      fillRR(ctx, x, y, w, h - 3, 3, '#FFB74D', '#E65100');
      ctx.fillStyle = '#FFE0B2';
      ctx.fillRect(x + 3, y + 3, w - 6, h - 9);
      ctx.fillStyle = '#E65100';
      ctx.fillRect(x + 4, y + h - 3, w - 8, 3);
      break;
    }
    case 'bulbs': {
      // a row of palace bulbs: solid gold when lit, dark glass when off
      const on = o.look !== 'off';
      if (on) {
        ctx.fillStyle = 'rgba(255,214,110,0.25)';
        ctx.fillRect(x - 2, y - 3, w + 4, h + 6);
      }
      fillRR(ctx, x, y + 2, w, 2, 1, on ? '#B8860B' : '#7A6A66');
      for (let i = 0; i < Math.floor(w / 4); i++) circle(ctx, x + 2 + i * 4, y + 3, 1.6, on && o.look !== 'warn' ? '#FFE7A0' : o.look === 'warn' ? '#C8A27A' : '#8C7C78');
      break;
    }
    case 'log': {
      fillRR(ctx, x, y, w, h, h / 2, '#8D6E63', '#4E342E');
      ctx.strokeStyle = 'rgba(62,39,35,0.6)';
      ctx.lineWidth = 0.8;
      for (let i = 6; i < w - 4; i += 7) {
        ctx.beginPath();
        ctx.moveTo(x + i, y + 2);
        ctx.lineTo(x + i + 3, y + h - 2);
        ctx.stroke();
      }
      circle(ctx, x + w - 3, y + h / 2, h / 2 - 1, '#BCAAA4', '#4E342E');
      break;
    }
    case 'bat': {
      const f = Math.sin(t * 0.8) * 3;
      ctx.fillStyle = '#2B2230';
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 4);
      ctx.lineTo(x, y + 1 + f);
      ctx.lineTo(x + 3, y + 6);
      ctx.lineTo(x + 7, y + 5);
      ctx.lineTo(x + 11, y + 6);
      ctx.lineTo(x + 14, y + 1 + f);
      ctx.closePath();
      ctx.fill();
      circle(ctx, x + 7, y + 4, 2.2, '#2B2230');
      circle(ctx, x + 6.2, y + 3.6, 0.5, '#FF5252');
      circle(ctx, x + 7.8, y + 3.6, 0.5, '#FF5252');
      break;
    }
    case 'setwall': {
      // a film-set wall: painted on the front, bare wood on the back
      fillRR(ctx, x, y, w, h, 1, o.tint ?? '#F2C14E', '#8D6E63');
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + 3, y + 8, w - 6, 12);
      ctx.fillRect(x + 3, y + 30, w - 6, 12);
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(x + w - 2, y, 2, h);
      break;
    }
    case 'plank': {
      // one plank of a rope bridge, with its bit of hand rope
      ctx.strokeStyle = '#8D7B5A';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x + w, y - 15);
      ctx.moveTo(x + 1, y - 16);
      ctx.lineTo(x + 1, y);
      ctx.stroke();
      fillRR(ctx, x + 0.5, y, w - 1, h, 1, '#A1765A', '#5D3F2E');
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x + 5, y + 1, 1, h - 2);
      ctx.fillRect(x + 11, y + 1, 1, h - 2);
      break;
    }
    case 'spark': {
      circle(ctx, x + 2.5, y + 2.5, 4, 'rgba(255,210,120,0.35)');
      circle(ctx, x + 2.5, y + 2.5, 1.8, ['#FFD54F', '#FF7043', '#81D4FA'][Math.floor(t / 4) % 3]);
      break;
    }
    case 'spikerow': {
      // a row of steel spikes that pops out of the floor
      ctx.fillStyle = '#9AA3AD';
      ctx.strokeStyle = '#4A525B';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const bx = x + 1 + i * 5;
        ctx.beginPath();
        ctx.moveTo(bx, y + h);
        ctx.lineTo(bx + 2.5, y);
        ctx.lineTo(bx + 5, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'ferry': {
      // a Mandovi car ferry: white deck, blue hull, yellow railing posts
      ctx.fillStyle = '#ECEFF1';
      ctx.fillRect(x, y, w, h * 0.45);
      ctx.fillStyle = '#1E6FB8';
      ctx.fillRect(x + 1, y + h * 0.45, w - 2, h * 0.55);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 1, y + h * 0.45, w - 2, 1);
      ctx.fillStyle = '#FBC02D';
      for (let i = 0; i <= 4; i++) ctx.fillRect(x + 1 + ((w - 3) * i) / 4, y - 4, 1.2, 4);
      ctx.fillRect(x + 1, y - 4, w - 2, 1);
      if (o.label) {
        ctx.font = '700 4.4px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(o.label, x + w / 2, y + h * 0.88);
      }
      break;
    }
    case 'football': {
      circle(ctx, x + w / 2, y + h / 2, w / 2, '#FAFAFA', '#37474F', 0.8);
      const sp = (o.t / 10) % (Math.PI * 2);
      for (let i = 0; i < 3; i++) {
        const a = sp + (i * Math.PI * 2) / 3;
        circle(ctx, x + w / 2 + Math.cos(a) * 2.6, y + h / 2 + Math.sin(a) * 2.6, 1.4, '#263238');
      }
      circle(ctx, x + w / 2, y + h / 2, 1.3, '#263238');
      break;
    }
    case 'chila': {
      // a rice-flour chila folded on a sal leaf, with green chutney and a tomato one
      const cx = x + w / 2,
        cy = y + h / 2 + 1;
      ctx.fillStyle = '#558B2F';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1.5, w / 2, h / 2 - 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF3D6';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 2);
      ctx.quadraticCurveTo(cx, cy - 6, cx + 5, cy + 2);
      ctx.fill();
      ctx.fillStyle = '#E8C98A';
      for (let i = 0; i < 5; i++) ctx.fillRect(cx - 3 + ((i * 3) % 6), cy - 2 + ((i * 2) % 3), 1, 1);
      ctx.fillStyle = '#7CB342';
      ctx.fillRect(cx - 5.5, cy + 2, 2.4, 1.6);
      ctx.fillStyle = '#E53935';
      ctx.fillRect(cx + 3.2, cy + 2, 2.4, 1.6);
      break;
    }
    case 'poha': {
      // a leaf plate of poha: yellow flattened rice, sev on top, a jalebi on the side, a wedge of lime
      const cx = x + w / 2,
        cy = y + h / 2 + 1.5;
      ctx.fillStyle = '#5E8C3A';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, w / 2, h / 2 - 1.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F4D03F';
      ctx.beginPath();
      ctx.ellipse(cx - 1, cy - 0.5, w / 2 - 2.5, h / 2 - 2.5, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#E67E22';
      for (let i = 0; i < 6; i++) ctx.fillRect(cx - 4 + ((i * 3) % 7), cy - 3 + ((i * 2) % 3), 1.6, 0.7);
      ctx.strokeStyle = '#F39C12';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx + 3.5, cy + 0.5, 1.6, 0, Math.PI * 1.7);
      ctx.stroke();
      ctx.fillStyle = '#C0CA33';
      ctx.fillRect(cx - 5, cy, 2, 1.2);
      break;
    }
    case 'ghevar': {
      // a disc of ghevar: a golden honeycomb, a layer of rabri, slivered pistachios and silver leaf
      const cx = x + w / 2,
        cy = y + h / 2 + 1;
      ctx.fillStyle = '#D9A441';
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2 - 0.5, h / 2 - 1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#A9741F';
      for (let i = 0; i < 9; i++) ctx.fillRect(cx - 4 + ((i * 3) % 8), cy - 2 + ((i * 5) % 4), 1, 1);
      ctx.fillStyle = '#FFF3D6';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 1.5, w / 2 - 2.5, 1.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7CB342';
      ctx.fillRect(cx - 2, cy - 2.4, 1.6, 0.8);
      ctx.fillRect(cx + 1.5, cy - 2, 1.6, 0.8);
      ctx.fillStyle = '#ECEFF1';
      ctx.fillRect(cx - 0.5, cy - 2.6, 1.4, 1);
      break;
    }
    case 'vada': {
      fillRR(ctx, x + 1, y + 4, 10, 4, 2, '#F5DEB3');
      circle(ctx, x + 6, y + 6, 3, '#D4882B');
      fillRR(ctx, x + 1, y + 7, 10, 3, 1.5, '#F5DEB3');
      break;
    }
    default:
      (MODULE_THING_DRAW as Record<string, ThingDraw | undefined>)[kind as string]?.(ctx, x, y, w, h, o);
  }
  ctx.restore();
}
