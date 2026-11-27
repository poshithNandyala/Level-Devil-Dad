// Shared pieces for the door endings (endings.ts and the city modules' endings.ts).
import { Entity, type Hazard, type World } from '../world';
import type { Door } from '../entities/basics';
import type { Grid } from './grid';
import { DT, TILE } from '../constants';
import { FONT, rr } from '../../render/art/common';
import { drawDoor } from '../../render/art/tiles';
import { THEMES } from '../../render/theme';

export interface Ending {
  /** tiles of road between the last section and the door (default 9) */
  space?: number;
  /** tiles after the door (default 4) */
  after?: number;
  /** carve the ground; D is the door's column (its 'E' sits at row 14: move it if the door must sit elsewhere) */
  paint?: (g: Grid, D: number) => void;
  build: (w: World, d: Door) => void;
  /** a line for the stage's hint */
  advice: string;
}

export const FLOOR = 15 * TILE;
export const tt = (w: World) => w.tick * DT;
/** someone in the stage says something (a bubble over them) */
export const npc = (w: World, line: string, x: number, y: number, t = 1.4) => w.say(line, x, y, t, 'npc');
/** Tara tells Dad something (her card, right next to him) */
export const tara = (w: World, line: string, t = 3) => w.say(line, w.player.cx, w.player.y, t, 'rival');
export const hits = (p: { x: number; y: number; w: number; h: number }, x: number, y: number, ww: number, h: number) => p.x < x + ww && p.x + p.w > x && p.y < y + h && p.y + p.h > y;
export const LAGOON: [string, string] = ['rgba(70,200,205,0.86)', 'rgba(12,96,120,0.96)'];
export const RIVER: [string, string] = ['rgba(120,150,110,0.86)', 'rgba(52,70,48,0.96)'];

/** a drawn-only thing (labels, displays, mats, effects) */
export class Paint extends Entity {
  constructor(
    readonly f: (ctx: CanvasRenderingContext2D, w: World) => void,
    layer = -2,
  ) {
    super();
    this.layer = layer;
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    this.f(ctx, w);
  }
}

/** something that moves with a deadly box, drawn by the ending (it looks like a roller to the tests) */
export class Mover extends Entity {
  vx = 0;
  on = true;
  hazard: Hazard;
  constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number,
    cause: string,
    readonly paint: (ctx: CanvasRenderingContext2D, m: Mover, w: World) => void,
    inset = 2,
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause,
      hits: (x, y, w2, h2) => self.alive && self.on && x < self.x + self.w - inset && x + w2 > self.x + inset && y < self.y + self.h - inset && y + h2 > self.y + inset,
    };
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.alive) this.paint(ctx, this, w);
  }
}

export function text(ctx: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, fill: string, stroke = 'rgba(0,0,0,0.65)', align: CanvasTextAlign = 'center') {
  ctx.font = `800 ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (stroke) {
    ctx.lineWidth = Math.max(1.5, size / 4);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke;
    ctx.strokeText(s, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(s, x, y);
}

/** a locked door: walking into it only bumps you (with a line); unlock() lets you in */
export function lock(w: World, d: Door, msg: string) {
  const L = { open: false, unlock: () => {} };
  let told = -999;
  d.onReach = (w2) => {
    if (L.open) return w2.win('door');
    if (w2.tick - told < 110) return;
    told = w2.tick;
    w2.sfx('thud', d.x + 8, d.y + 16);
    npc(w2, msg, d.x + 8, d.y - 6, 1.3);
  };
  L.unlock = () => {
    if (L.open) return;
    L.open = true;
    w.flags.twist = 'open';
    w.sfx('win', d.x + 8, d.y);
    w.emit('fx', d.x + 8, d.y + 10, { kind: 'sparkle' });
  };
  w.add(
    new Paint((ctx) => {
      if (L.open || d.hidden) return;
      const x = d.x + 8,
        y = d.y + 17;
      ctx.strokeStyle = '#C9A227';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y - 2, 2.6, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#E8C547';
      rr(ctx, x - 3.5, y - 1.5, 7, 6, 1.2);
      ctx.fill();
      ctx.fillStyle = '#5D4A10';
      ctx.fillRect(x - 0.6, y + 0.5, 1.2, 2.4);
    }, -1),
  );
  return L;
}

/** a little person drawn in two blocks (cops, cooks, mimes, goons, govindas) */
export function person(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, shirt: string, skin = '#C68B59', o: { cap?: string; face?: string; arms?: number } = {}) {
  const bw = Math.round(h * 0.55);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(x, y + h, bw * 0.6, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2E2A36';
  ctx.fillRect(x - bw / 2 + 1, y + h * 0.62, bw / 2 - 1.5, h * 0.38);
  ctx.fillRect(x + 0.5, y + h * 0.62, bw / 2 - 1.5, h * 0.38);
  ctx.fillStyle = shirt;
  rr(ctx, x - bw / 2, y + h * 0.3, bw, h * 0.36, 2);
  ctx.fill();
  if (o.arms) {
    ctx.strokeStyle = shirt;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - bw / 2, y + h * 0.36);
    ctx.lineTo(x - bw / 2 - 3, y + h * 0.36 - o.arms);
    ctx.moveTo(x + bw / 2, y + h * 0.36);
    ctx.lineTo(x + bw / 2 + 3, y + h * 0.36 - o.arms);
    ctx.stroke();
  }
  ctx.fillStyle = o.face ?? skin;
  ctx.beginPath();
  ctx.arc(x, y + h * 0.17, h * 0.17, 0, Math.PI * 2);
  ctx.fill();
  if (o.cap) {
    ctx.fillStyle = o.cap;
    ctx.fillRect(x - h * 0.19, y - h * 0.02, h * 0.38, h * 0.1);
  }
  ctx.fillStyle = '#1D1A26';
  ctx.fillRect(x - h * 0.08, y + h * 0.15, 1.2, 1.2);
  ctx.fillRect(x + h * 0.05, y + h * 0.15, 1.2, 1.2);
}

/** the door's own picture somewhere else (a reflection, a sign, a tiny copy) */
export function doorPic(ctx: CanvasRenderingContext2D, w: World, x: number, y: number, glow = 1) {
  drawDoor(ctx, x, y, THEMES[w.city], 0, glow, false);
}

