import { PHYS, ROOM_H, ROOM_W, ROWS, TILE } from '../game/constants';
import { Door } from '../game/entities/basics';
import { Collectible } from '../game/entities/traps';
import { bi, EN_DELAY } from '../game/bi';
import { TT, World } from '../game/world';
import { THEMES } from './theme';
import { drawAmbient, drawBackdrop } from './backgrounds';
import { drawOneWay, drawSpikeTile, drawTile, Nb } from './art/tiles';
import { drawHero, drawRivalBust } from './art/characters';
import type { Bubble } from '../game/world';
import { Rival } from '../game/entities/props';
import { FONT, rr } from './art/common';
import { Particles } from './particles';
import { View } from './view';

export interface TouchButtonDraw {
  kind: 'left' | 'right' | 'jump';
  x: number;
  y: number;
  r: number;
  pressed: boolean;
}

export interface FrameOpts {
  world: World;
  character: 'papa' | 'mummy';
  shake: { x: number; y: number };
  flash: number;
  fade: number;
  reduced: boolean;
  time: number;
  touch: { buttons: TouchButtonDraw[]; opacity: number; visible: boolean };
  dim?: number;
  /** circle wipe between stages: k = 1 fully open, 0 closed, centred on a world point */
  iris?: { k: number; x: number; y: number };
}

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  view!: View;
  particles = new Particles();
  private bg: HTMLCanvasElement | null = null;
  private bgKey = '';
  private bgScale = 1;
  /** tiles are cached in chunks one screen wide, drawn as the camera reaches them */
  private chunks = new Map<number, HTMLCanvasElement>();
  private chunksKey = '';
  private chunkScale = 1;
  /** camera: the world x shown at the left edge of the safe area */
  camX = 0;
  private lead = 0;
  private camWorld: World | null = null;
  /** jump the camera straight to Dad on the next frame (after a warp) */
  snapNext = false;
  private idleSince = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('no 2d context');
    this.ctx = ctx;
  }

  resize(v: View) {
    this.view = v;
    const w = Math.round(v.W * v.dpr),
      h = Math.round(v.H * v.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.canvas.style.width = v.W + 'px';
    this.canvas.style.height = v.H + 'px';
    this.bgKey = '';
    this.chunksKey = '';
  }

  /** world -> device transform (with optional CSS-px offset) */
  private worldTx(ctx: CanvasRenderingContext2D, dx = 0, dy = 0) {
    const v = this.view;
    ctx.setTransform(v.s * v.dpr, 0, 0, v.s * v.dpr, (v.ox + dx) * v.dpr, (v.oy + dy) * v.dpr);
  }

  /** the world rect on screen when the world is shifted by `dx` CSS px */
  private span(dx = 0) {
    const v = this.view;
    return { x0: (-v.ox - dx) / v.s, x1: (v.W - v.ox - dx) / v.s, y0: -v.oy / v.s, y1: (v.H - v.oy) / v.s };
  }

  /** width of the level part that fits the safe area, in world px */
  get viewW() {
    const v = this.view;
    return (v.W - v.safe.l - v.safe.r) / v.s;
  }

  private camRange(w: World) {
    const vw = this.viewW;
    if (w.W <= vw + 0.5) {
      const c = (w.W - vw) / 2;
      return { min: c, max: c };
    }
    return { min: 0, max: w.W - vw };
  }

  /** follow Dad, leading a little the way he faces; snaps on a new attempt */
  updateCamera(w: World, dt: number) {
    const { min, max } = this.camRange(w);
    const snap = w !== this.camWorld || this.snapNext;
    this.snapNext = false;
    this.camWorld = w;
    if (min === max) {
      this.camX = min;
      return;
    }
    const vw = this.viewW;
    const p = w.player;
    const want = p.facing * vw * 0.13;
    this.lead = snap ? want : this.lead + (want - this.lead) * (1 - Math.exp(-dt * 2.4));
    const target = Math.max(min, Math.min(max, p.x + p.w / 2 - vw / 2 + this.lead));
    this.camX = snap ? target : this.camX + (target - this.camX) * (1 - Math.exp(-dt * 6.5));
    this.camX = Math.max(min, Math.min(max, this.camX));
  }

  private canvasOf(wCss: number, hCss: number, scale: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(wCss * scale));
    c.height = Math.max(1, Math.round(hCss * scale));
    return c;
  }

  /** backdrop for the whole camera travel, scrolling slower than the level (parallax) */
  private ensureBg(w: World) {
    const v = this.view;
    const { min, max } = this.camRange(w);
    const key = `${w.city}|${w.level.scene ? w.level.id : w.level.index}|${w.W}|${v.W}x${v.H}@${v.dpr}`;
    if (key === this.bgKey && this.bg) return;
    const travel = (max - min) * BG_PARALLAX;
    const wCss = v.W + travel * v.s;
    const scale = Math.min(v.dpr, 2);
    const c = this.canvasOf(wCss, v.H, scale);
    const ctx = c.getContext('2d')!;
    const left = min * BG_PARALLAX;
    ctx.setTransform(v.s * scale, 0, 0, v.s * scale, (v.ox - left * v.s) * scale, v.oy * scale);
    const x0 = left - v.ox / v.s,
      x1 = x0 + wCss / v.s;
    drawBackdrop(ctx, w.city, x0, x1, -v.oy / v.s, (v.H - v.oy) / v.s, w.level.index, w.level.scene);
    this.bg = c;
    this.bgScale = scale;
    this.bgKey = key;
  }

  private resetChunks(w: World) {
    const v = this.view;
    const key = `${w.level.id}|${v.W}x${v.H}@${v.dpr}`;
    if (key === this.chunksKey) return;
    this.chunks.clear();
    this.chunksKey = key;
    this.chunkScale = Math.min(v.dpr, 2);
  }

  /** one screen-wide slice of the tile map, drawn once */
  private chunk(w: World, k: number): HTMLCanvasElement {
    const have = this.chunks.get(k);
    if (have) return have;
    const v = this.view;
    const scale = this.chunkScale;
    const c = this.canvasOf(CHUNK * v.s, v.H, scale);
    const ctx = c.getContext('2d')!;
    const cx0 = k * CHUNK;
    ctx.setTransform(v.s * scale, 0, 0, v.s * scale, -cx0 * v.s * scale, v.oy * scale);
    ctx.beginPath();
    ctx.rect(cx0, -v.oy / v.s - 2, CHUNK, v.H / v.s + 4);
    ctx.clip();
    const th = THEMES[w.city];
    const cols = w.cols;
    const groupCells = new Set<string>();
    for (const cells of w.groupCells.values()) for (const [x, y] of cells) groupCells.add(`${x},${y}`);
    const clampX = (tx: number) => Math.max(0, Math.min(cols - 1, tx));
    const at = (tx: number, ty: number) => {
      const cy = Math.min(ROWS - 1, ty);
      if (cy < 0) return TT.EMPTY;
      return w.tiles[cy * cols + clampX(tx)];
    };
    const hidden = (tx: number, ty: number) => {
      const cy = Math.min(ROWS - 1, ty);
      return cy >= 0 && w.hiddenTiles[cy * cols + clampX(tx)] === 1;
    };
    const solidLike = (tx: number, ty: number) => {
      if (ty < 0) return false;
      const cx = clampX(tx);
      const cy = Math.min(ROWS - 1, ty);
      if (hidden(cx, cy)) return false;
      const t = at(cx, cy);
      return t === TT.SOLID || t === TT.WET || groupCells.has(`${cx},${cy}`);
    };
    const txMin = Math.floor(cx0 / TILE) - 2,
      txMax = Math.ceil((cx0 + CHUNK) / TILE) + 2;
    const tyMax = Math.ceil((v.H - v.oy) / v.s / TILE) + 1;
    for (let ty = 0; ty < tyMax; ty++) {
      for (let tx = txMin; tx < txMax; tx++) {
        const cx = clampX(tx);
        const cy = Math.min(ROWS - 1, ty);
        if (groupCells.has(`${cx},${cy}`) && cx === tx && cy === ty) continue;
        if (hidden(cx, cy)) continue;
        const t = at(cx, cy);
        const x = tx * TILE,
          y = ty * TILE;
        if (t === TT.SOLID || t === TT.WET) {
          let depth = 0;
          while (depth < 4 && solidLike(tx, ty - depth - 1)) depth++;
          const n: Nb = { up: depth > 0, down: solidLike(tx, ty + 1), left: solidLike(tx - 1, ty), right: solidLike(tx + 1, ty), depth };
          drawTile(ctx, x, y, th, n, t === TT.WET);
        } else if (t === TT.ONEWAY && ty < ROWS && tx === cx) {
          drawOneWay(ctx, x, y, th);
        } else if (t >= TT.SPIKE_UP && tx === cx && ty === cy) {
          drawSpikeTile(ctx, t, x, y, th);
        }
        // group cells extended into the margins look like ground too
        if (groupCells.has(`${cx},${cy}`) && (cx !== tx || cy !== ty)) {
          drawTile(ctx, x, y, th, { up: solidLike(tx, ty - 1), down: true, left: true, right: true });
        }
      }
    }
    if (this.chunks.size >= 6) this.chunks.delete(this.chunks.keys().next().value as number);
    this.chunks.set(k, c);
    return c;
  }

  invalidate() {
    this.bgKey = '';
    this.chunksKey = '';
  }

  render(o: FrameOpts) {
    const { ctx } = this;
    const v = this.view;
    const w = o.world;
    if (w !== this.camWorld) this.updateCamera(w, 0);
    this.ensureBg(w);
    this.resetChunks(w);
    const { min } = this.camRange(w);
    const cam = -this.camX * v.s;
    // backdrop, scrolling slower than the level
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const k = v.dpr / this.bgScale;
    ctx.drawImage(this.bg!, (-(this.camX - min) * BG_PARALLAX * v.s + o.shake.x * 0.3) * v.dpr, o.shake.y * 0.3 * v.dpr, this.bg!.width * k, this.bg!.height * k);
    const sx = o.shake.x + cam,
      sy = o.shake.y;
    // ambient animation (moves with the backdrop)
    const bgx = o.shake.x * 0.4 - this.camX * BG_PARALLAX * v.s;
    this.worldTx(ctx, bgx, sy * 0.4);
    const sp = this.span(bgx);
    if (!w.level.scene) drawAmbient(ctx, w.city, sp.x0, sp.x1, o.time, o.reduced);
    // background entities (behind tiles)
    this.worldTx(ctx, sx, sy);
    for (const e of w.entities) if (e.layer <= -4) e.draw(ctx, w);
    // tiles, a screen-wide chunk at a time
    const { x0, x1 } = this.span(sx);
    const kc = v.dpr / this.chunkScale;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = Math.floor(x0 / CHUNK); i <= Math.floor(x1 / CHUNK); i++) {
      const c = this.chunk(w, i);
      ctx.drawImage(c, (v.ox + i * CHUNK * v.s + sx) * v.dpr, sy * v.dpr, c.width * kc, c.height * kc);
    }
    this.worldTx(ctx, sx, sy);
    for (const e of w.entities) if (e.layer > -4 && e.layer < 3) e.draw(ctx, w);
    this.drawPlayer(o, sx, sy);
    for (const e of w.entities) if (e.layer >= 3) e.draw(ctx, w);
    this.particles.draw(ctx);

    // screen space
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    const dark = (w.level.dark || !!w.flags.dark) && !w.flags.lit;
    if (!dark && !o.reduced) this.drawGrade(w);
    if (dark) this.drawDark(w, sx, sy);
    this.drawTricks(w, o);
    this.drawBubbles(w, sx, sy);
    this.drawTalkBar(w, o, sx, sy);
    if (o.iris && o.iris.k < 1) this.drawIris(o.iris, sx, sy);
    if (o.flash > 0 && !o.reduced) {
      ctx.fillStyle = `rgba(255,255,255,${o.flash * 0.35})`;
      ctx.fillRect(0, 0, v.W, v.H);
    }
    if (o.dim) {
      ctx.fillStyle = `rgba(10,8,20,${o.dim})`;
      ctx.fillRect(0, 0, v.W, v.H);
    }
    if (o.touch.visible) this.drawTouch(o.touch);
    if (o.fade > 0) {
      ctx.fillStyle = `rgba(12,10,22,${o.fade})`;
      ctx.fillRect(0, 0, v.W, v.H);
    }
  }

  private drawPlayer(o: FrameOpts, _sx: number, _sy: number) {
    const w = o.world;
    for (const t of w.twins) if (!t.dead && !t.hidden) this.drawOne(o, t);
    this.drawOne(o, w.player);
  }

  private drawOne(o: FrameOpts, p: World['player']) {
    const w = o.world;
    const main = p === w.player;
    if (p.dead || p.hidden) return;
    const ctx = this.ctx;
    const t = w.tick;
    let squash = 0;
    const sinceLand = t - p.landTick,
      sinceJump = t - p.jumpTick;
    if (sinceLand >= 0 && sinceLand < 9) squash += 0.24 * (1 - sinceLand / 9) * Math.min(1, p.landSpeed / 380);
    if (sinceJump >= 0 && sinceJump < 10) squash -= 0.2 * (1 - sinceJump / 10);
    let alpha = 1,
      scale = 1;
    let fx = p.x + p.xr + p.w / 2,
      fy = p.y + p.yr + p.h - p.lift;
    if (w.state === 'won') {
      if (w.winVia !== 'door' && t - w.winTick > 4) return; // climbed aboard
      const k = Math.min(1, (t - w.winTick) / 36);
      alpha = 1 - k;
      scale = 1 - k * 0.45;
      const ex = w.exits[0]?.zone();
      if (ex && w.winVia === 'door') {
        fx += (ex.x + ex.w / 2 - fx) * k;
      }
    }
    // a quick ring so you can find yourself on every (re)spawn
    if (main && t < 54 && w.state === 'play' && !o.reduced) {
      const k = t / 54;
      ctx.strokeStyle = `rgba(255,255,255,${0.85 * (1 - k)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(fx, fy - 8, 7 + k * 16, 0, Math.PI * 2);
      ctx.stroke();
    }
    // gravity flipped: Dad hangs from the ceiling, head down
    if (p.gsign < 0) {
      ctx.save();
      ctx.translate(0, 2 * (p.y + p.yr + p.h / 2));
      ctx.scale(1, -1);
    }
    ctx.globalAlpha = alpha;
    ctx.save();
    ctx.translate(fx, fy);
    // shrunk (a magic biscuit): draw him to his size
    const size = (p.h - p.lift) / PHYS.height;
    ctx.scale(scale * size, scale * size);
    // soft shadow
    if (p.onGround) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // idle time, a foot over the edge, danger close by: the little things Dad reacts to
    const now = o.time;
    if (main && (!p.onGround || Math.abs(p.vx) > 6)) this.idleSince = now;
    const sup = (x: number) => !!w.solidAt(x, p.y + p.h, 2, 2) || w.oneWayTopAt(x, p.y + p.h, 2);
    let edge: -1 | 0 | 1 = 0;
    if (p.onGround && w.state === 'play') {
      const l = sup(p.x),
        r = sup(p.x + p.w - 2);
      edge = l && !r ? 1 : r && !l ? -1 : 0;
    }
    let danger = false;
    if (w.state === 'play') {
      for (const e of w.entities) {
        const hz = (e as { hazard?: { active: boolean; hits: (x: number, y: number, w: number, h: number) => boolean } }).hazard;
        if (hz?.active && hz.hits(p.x - 22, p.y - 16, p.w + 44, p.h + 28)) {
          danger = true;
          break;
        }
      }
      if (!danger)
        for (let ty = Math.floor((p.y - 8) / TILE); ty <= Math.floor((p.y + p.h + 8) / TILE) && !danger; ty++)
          for (let tx = Math.floor((p.x - 18) / TILE); tx <= Math.floor((p.x + p.w + 18) / TILE); tx++)
            if (w.tileAt(tx, ty) >= TT.SPIKE_UP) {
              danger = true;
              break;
            }
    }
    const blinkT = t % 330;
    const swim = p.swimming ? Math.min(1, (t - p.strokeTick) / 30) : undefined;
    const climb = !!p.grip;
    drawHero(ctx, o.character, climb ? -p.facing * 3 : 0, climb && p.climbing ? Math.sin(t * 0.4) * 0.8 : 0, {
      facing: climb ? p.facing : p.wallSide ? (-p.wallSide as 1 | -1) : p.facing,
      run: p.runDist * 0.42,
      moving: p.onGround && Math.abs(p.vx) > 12,
      air: climb ? 'up' : swim !== undefined ? (swim < 1 ? 'up' : 'down') : p.onGround ? null : p.vy < 0 ? 'up' : 'down',
      alt: p.twin,
      swim,
      climb,
      wall: p.wallSide,
      carry: p.carry,
      squash,
      blink: blinkT < 7 || (t % 990 > 14 && t % 990 < 20),
      rim: THEMES[w.city].rim,
      t: now,
      vy: p.vy,
      vx: p.vx,
      idle: now - this.idleSince,
      edge,
      danger,
    });
    ctx.restore();
    ctx.globalAlpha = 1;
    // in the sea: his air, as bubbles over his head
    if (p.swimming && p.air < 4.95 && w.state === 'play') {
      const n = Math.ceil(p.air);
      for (let i = 0; i < 5; i++) {
        const full = i < n;
        const last = i === n - 1 && p.air < 1.6;
        if (!full) continue;
        if (last && t % 16 < 8) continue;
        ctx.fillStyle = 'rgba(225,250,255,0.85)';
        ctx.strokeStyle = 'rgba(30,90,120,0.9)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(fx - 8 + i * 4, fy - 27 + Math.sin(t * 0.12 + i) * 0.6, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    // left and right are swapped: a little swirl of arrows over Dad's head
    if (main && w.flipped && w.state === 'play') {
      const bob = Math.sin(t * 0.25) * 1.5;
      const yy = fy - 26 + bob;
      ctx.save();
      ctx.fillStyle = 'rgba(30,20,40,0.75)';
      ctx.beginPath();
      ctx.ellipse(fx, yy, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFD166';
      ctx.fillStyle = '#FFD166';
      ctx.lineWidth = 1.3;
      for (const d of [-1, 1]) {
        const y2 = yy + d * 1.8;
        ctx.beginPath();
        ctx.moveTo(fx - 6 * d, y2);
        ctx.lineTo(fx + 6 * d, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fx + 7 * d, y2);
        ctx.lineTo(fx + 4 * d, y2 - 2);
        ctx.lineTo(fx + 4 * d, y2 + 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
    if (p.gsign < 0) ctx.restore();
  }

  /** a circle wipe: everything dark except a disc round the point (screen space) */
  private drawIris(ir: { k: number; x: number; y: number }, sx: number, sy: number) {
    const v = this.view;
    const ctx = this.ctx;
    const cx = v.ox + sx + ir.x * v.s,
      cy = v.oy + sy + ir.y * v.s;
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(v.W - cx, cy), Math.hypot(cx, v.H - cy), Math.hypot(v.W - cx, v.H - cy));
    const r = Math.max(0, ir.k) * far;
    ctx.save();
    ctx.fillStyle = '#140F22';
    ctx.beginPath();
    ctx.rect(0, 0, v.W, v.H);
    if (r > 0.5) ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    if (r > 0.5) {
      ctx.strokeStyle = 'rgba(255,214,120,0.55)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** caves: darkness everywhere but a pool of light round Dad, and a glow at the exit and the hidden item */
  private darkC: HTMLCanvasElement | null = null;
  private drawDark(w: World, sx: number, sy: number) {
    const v = this.view;
    if (!this.darkC) this.darkC = document.createElement('canvas');
    const c = this.darkC;
    if (c.width !== Math.round(v.W * v.dpr) || c.height !== Math.round(v.H * v.dpr)) {
      c.width = Math.round(v.W * v.dpr);
      c.height = Math.round(v.H * v.dpr);
    }
    const d = c.getContext('2d')!;
    d.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    d.globalCompositeOperation = 'source-over';
    d.clearRect(0, 0, v.W, v.H);
    d.fillStyle = 'rgba(6,4,3,0.93)';
    d.fillRect(0, 0, v.W, v.H);
    d.globalCompositeOperation = 'destination-out';
    const hole = (wx: number, wy: number, r: number, a = 1) => {
      const x = v.ox + sx + wx * v.s,
        y = v.oy + sy + wy * v.s,
        rr2 = r * v.s;
      const g = d.createRadialGradient(x, y, rr2 * 0.2, x, y, rr2);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      d.fillStyle = g;
      d.fillRect(x - rr2, y - rr2, rr2 * 2, rr2 * 2);
    };
    const flicker = 1 + Math.sin(w.tick * 0.21) * 0.03;
    hole(w.player.cx, w.player.cy, (w.flags.darkR ?? 74) * flicker);
    for (const e of w.entities) {
      if (e instanceof Door && !e.hidden) hole(e.x + 8, e.y + 16, 30, 0.85);
      else if (e instanceof Collectible && !e.got) hole(e.x, e.y, 16, 0.8);
      else {
        const gl = (e as { glow?: { x: number; y: number; r: number } }).glow;
        if (gl) hole(gl.x, gl.y, gl.r, 0.9);
      }
    }
    this.ctx.drawImage(c, 0, 0, v.W, v.H);
  }

  /**
   * Colour grade: a soft-light pass (warm light from above, a cool tint in the shadows) and a
   * gentle bloom where the light comes from, so every city reads as one cohesive palette.
   */
  // ------------------------------------------------------------ endings' screen tricks
  private fxA: HTMLCanvasElement | null = null;
  private fxB: HTMLCanvasElement | null = null;
  private slowK = 0;
  private sized(c: HTMLCanvasElement | null, w: number, h: number) {
    const b = c ?? document.createElement('canvas');
    if (b.width !== w || b.height !== h) {
      b.width = w;
      b.height = h;
    }
    return b;
  }

  /** mirror image, lost specs, slow motion, fake banners, a time rewind */
  private drawTricks(w: World, o: FrameOpts) {
    const f = w.flags;
    const ctx = this.ctx;
    const v = this.view;
    const c = ctx.canvas;
    if (f.blur) {
      // shrink and grow back with smoothing: a soft blur that works on every phone
      this.fxB = this.sized(this.fxB, Math.max(1, Math.round(c.width / 7)), Math.max(1, Math.round(c.height / 7)));
      const bx = this.fxB.getContext('2d')!;
      bx.imageSmoothingEnabled = true;
      bx.drawImage(c, 0, 0, this.fxB.width, this.fxB.height);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.globalAlpha = 0.92;
      ctx.drawImage(this.fxB, 0, 0, c.width, c.height);
      ctx.restore();
    }
    if (f.view === 'mirror') {
      this.fxA = this.sized(this.fxA, c.width, c.height);
      const ax = this.fxA.getContext('2d')!;
      ax.clearRect(0, 0, c.width, c.height);
      ax.drawImage(c, 0, 0);
      ctx.save();
      ctx.setTransform(-1, 0, 0, 1, c.width, 0);
      ctx.drawImage(this.fxA, 0, 0);
      ctx.restore();
    }
    // slow motion: the colour drains and black bars slide in
    this.slowK += ((f.slowmo ? 1 : 0) - this.slowK) * 0.18;
    if (this.slowK > 0.02) {
      const k = this.slowK;
      ctx.save();
      if (!o.reduced) {
        ctx.globalCompositeOperation = 'saturation';
        ctx.globalAlpha = 0.75 * k;
        ctx.fillStyle = 'hsl(0,0%,50%)';
        ctx.fillRect(0, 0, v.W, v.H);
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#000';
      const bar = v.H * 0.09 * k;
      ctx.fillRect(0, 0, v.W, bar);
      ctx.fillRect(0, v.H - bar, v.W, bar);
      ctx.globalAlpha = k;
      ctx.font = `800 ${Math.round(v.H * 0.05)}px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFD740';
      ctx.fillText('SLOW-MO', v.W - 18, v.H - bar / 2);
      ctx.restore();
    }
    // a time echo: the picture rolls like an old tape
    if (f.rewind !== undefined && w.tick - f.rewind < 70 && !o.reduced) {
      const k = 1 - (w.tick - f.rewind) / 70;
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${0.1 * k})`;
      for (let y = (w.tick * 9) % 12; y < v.H; y += 12) ctx.fillRect(0, y, v.W, 2);
      ctx.fillStyle = `rgba(120,200,255,${0.18 * k})`;
      ctx.fillRect(0, ((w.tick * 23) % v.H) - 20, v.W, 26);
      ctx.globalAlpha = k;
      ctx.font = `800 ${Math.round(v.H * 0.07)}px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('◀◀ REWIND', 22, 22 + v.safe.t);
      ctx.restore();
    }
    // a banner in the middle of the screen (a fake "ESCAPED!", THE END)
    const b = f.banner as { text: string; sub: string; t0: number; dur: number; style: string } | undefined;
    if (b) {
      const age = (w.tick - b.t0) / 120;
      if (age >= 0 && age < b.dur) {
        const pop = Math.min(1, age / 0.14);
        const out = Math.min(1, (b.dur - age) / 0.2);
        const size = Math.round(Math.min(v.W * 0.12, v.H * 0.15));
        ctx.save();
        ctx.globalAlpha = out;
        ctx.translate(v.W / 2, v.H * 0.34);
        ctx.scale(0.6 + 0.4 * pop + (1 - out) * 0.1, 0.6 + 0.4 * pop + (1 - out) * 0.1);
        ctx.rotate(b.style === 'troll' ? Math.sin(w.tick * 0.5) * 0.04 : 0);
        ctx.font = `900 ${size}px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.lineWidth = size * 0.16;
        ctx.strokeStyle = b.style === 'troll' ? '#3B0A0A' : '#1A1030';
        ctx.strokeText(b.text, 0, 0);
        ctx.fillStyle = b.style === 'troll' ? '#FF5252' : b.style === 'end' ? '#FFFFFF' : '#FFD740';
        ctx.fillText(b.text, 0, 0);
        if (b.sub) {
          ctx.font = `800 ${Math.round(size * 0.32)}px ${FONT}`;
          ctx.lineWidth = size * 0.07;
          ctx.strokeText(b.sub, 0, size * 0.72);
          ctx.fillStyle = '#FFF3E0';
          ctx.fillText(b.sub, 0, size * 0.72);
        }
        ctx.restore();
      }
    }
  }

  /** The city's light: a soft glow from its sun (or moon), a whisper of its colour, and a tinted
   *  (never black) vignette that holds the eye on Dad. Nothing here darkens the play area. */
  private drawGrade(w: World) {
    const v = this.view;
    const ctx = this.ctx;
    const gr = GRADES[w.city];
    if (!gr) return;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const gx = v.W * gr.gx,
      gy = v.H * gr.gy;
    const g1 = ctx.createRadialGradient(gx, gy, 0, gx, gy, Math.max(v.W, v.H) * 0.85);
    g1.addColorStop(0, gr.glow);
    g1.addColorStop(0.45, gr.glow.replace(/[\d.]+\)$/, (m) => `${(parseFloat(m) * 0.35).toFixed(3)})`));
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, v.W, v.H);
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = gr.tint;
    ctx.fillRect(0, 0, v.W, v.H);
    ctx.globalCompositeOperation = 'source-over';
    const g2 = ctx.createRadialGradient(v.W / 2, v.H * 0.55, Math.min(v.W, v.H) * 0.5, v.W / 2, v.H * 0.55, Math.max(v.W, v.H) * 0.8);
    g2.addColorStop(0, 'rgba(0,0,0,0)');
    g2.addColorStop(1, gr.vig);
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, v.W, v.H);
    ctx.restore();
  }

  /** Tara's talk bar: where it sits (screen px), how far it has slid in, and her portrait on its left */
  private portrait = { k: 0, last: 0, x: 0, y: 0, r: 26 };
  private bar = { k: 0, x: 0, y: 0, w: 0, h: 0, max: 300, top: true, text: '', start: 0, until: 0, tone: 'rival' as Bubble['tone'], placed: false, pop: 1, side: 0, ox: 0, oy: 0 };

  private drawPortrait(w: World, time: number) {
    const v = this.view;
    const rv = w.entities.find((e) => e instanceof Rival) as Rival | undefined;
    const kind = w.info.rival;
    const talking = this.bar.k > 0.05 && this.bar.tone === 'rival';
    const reacting = !!rv && (rv.mood === 'laugh' || rv.mood === 'shocked');
    const want = rv && kind !== 'none' && (talking || reacting) ? 1 : 0;
    const dt = Math.min(0.05, Math.max(0, time - this.portrait.last));
    this.portrait.last = time;
    const P = this.portrait;
    P.k += (want - P.k) * (1 - Math.exp(-dt * (want ? 14 : 9)));
    const B = this.bar;
    P.r = Math.max(24, Math.min(36, v.H * 0.085));
    // sits on the left end of the talk bar (or where the bar would be)
    if (!B.w) this.layoutBar(w, 'x');
    P.x = B.x + P.r + 8;
    P.y = B.y + B.h / 2 + (1 - P.k) * -10;
    if (P.k < 0.02 || !rv || kind === 'none') return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = Math.min(1, P.k * 1.4) * this.barDim;
    const wob = Math.sin(time * 3) * 0.04;
    ctx.translate(P.x, P.y);
    ctx.rotate(wob);
    ctx.scale(0.8 + 0.2 * P.k, 0.8 + 0.2 * P.k);
    drawRivalBust(ctx, 0, 0, P.r, rv.mood, time, THEMES[w.city].ui, kind === 'bandar' ? 'bandar' : 'tara');
    ctx.restore();
  }

  /** the talk card's text size and widest width (where it goes is worked out as it's drawn, next to Dad) */
  private layoutBar(w: World, text: string) {
    const v = this.view;
    const B = this.bar;
    const size = Math.max(13, Math.min(17, v.H * 0.043));
    if (!B.h) B.h = Math.round(size * 3.15);
    B.max = Math.round(Math.min(300, Math.max(220, v.W * 0.36)));
    if (!B.w) {
      B.w = B.max;
      B.x = Math.round(Math.max(v.safe.l, 0) + 12);
      B.y = Math.round(Math.max(v.safe.t, 0) + 52);
    }
    void w;
    void text;
    return size;
  }

  /** 1 normally; fades down when Dad (on screen) is under the talk card, so he's never hidden */
  private barDim = 1;

  /** wrap a line into at most two rows that fit `max` px */
  private wrap(text: string, max: number): string[] {
    const ctx = this.ctx;
    if (ctx.measureText(text).width <= max) return [text];
    const words = text.split(' ');
    let a = '';
    for (let i = 0; i < words.length; i++) {
      const t = a ? a + ' ' + words[i] : words[i];
      if (ctx.measureText(t).width > max && a) return [a, words.slice(i).join(' ')];
      a = t;
    }
    return [a];
  }

  /** Tara's lines (and the signpost's) as a slim subtitle at the bottom of the screen, over the ground
   *  strip and between the touch buttons: right under Dad's feet where the eye already is, but never over
   *  the play. Her little face sits at its left. It fades away if Dad ever drops behind it. */
  private drawTalkBar(w: World, o: FrameOpts, sx = 0, sy = 0) {
    const B = this.bar;
    const cur = w.bubbles.filter((b) => b.tone !== 'npc').pop();
    if (cur && (cur.text !== B.text || cur.start !== B.start)) {
      B.text = cur.text;
      B.start = cur.start;
      B.tone = cur.tone;
    }
    if (cur) B.until = cur.until;
    const want = cur ? 1 : 0;
    B.k += (want - B.k) * (want ? 0.28 : 0.2);
    if (B.k < 0.02 || !B.text) return;
    const v = this.view;
    const ctx = this.ctx;
    const size = Math.round(Math.max(12, Math.min(15, v.H * 0.036)));
    const small = Math.round(size * 0.84);
    const { main, en } = bi(B.text);
    const age = (w.tick - B.start) / 120;
    const k = en ? Math.max(0, Math.min(1, (age - EN_DELAY) * 4)) : 0;
    const rv = w.entities.find((e) => e instanceof Rival) as Rival | undefined;
    const hasFace = B.tone === 'rival' && w.info.rival !== 'none' && !!rv;
    const face = size * 1.05;
    const padL = hasFace ? face * 2 + 14 : 12;
    // the room between the touch buttons (or the whole width without them)
    let x0 = Math.max(v.safe.l, 0) + 12,
      x1 = v.W - Math.max(v.safe.r, 0) - 12;
    if (o.touch.visible)
      for (const b of o.touch.buttons) {
        if (b.x < v.W / 2) x0 = Math.max(x0, b.x + b.r + 10);
        else x1 = Math.min(x1, b.x - b.r - 10);
      }
    const maxW = Math.min(600, x1 - x0);
    ctx.font = `800 ${size}px ${FONT}`;
    const mainRows = this.wrap(main, maxW - padL - 12);
    let tw = Math.max(...mainRows.map((r) => ctx.measureText(r).width));
    ctx.font = `italic 700 ${small}px ${FONT}`;
    const enRows = en ? this.wrap(en, maxW - padL - 12) : [];
    if (enRows.length) tw = Math.max(tw, ...enRows.map((r) => ctx.measureText(r).width));
    const bw = Math.round(Math.min(maxW, tw + padL + 14));
    const h = Math.round(8 + mainRows.length * size * 1.14 + enRows.length * small * 1.14 + 4);
    // at the bottom, over the ground; at the top when an ending needs the ground seen (a reflection)
    const top = !!w.flags.subTop;
    const bx = Math.round((x0 + x1) / 2 - bw / 2);
    const by = top ? Math.max(v.safe.t, 0) + 48 : Math.round(v.H - Math.max(v.safe.b ?? 0, 0) - 6 - h);
    B.x = bx;
    B.y = by;
    B.w = bw;
    B.h = h;
    // never over Dad: if he's behind it (down in a ditch), it fades right down
    const p = w.player;
    let dx = v.ox + sx + p.x * v.s;
    if (w.flags.view === 'mirror') dx = v.W - dx - p.w * v.s;
    const dy = v.oy + sy + p.y * v.s;
    const over = dx + p.w * v.s > bx - 4 && dx < bx + bw + 4 && dy + p.h * v.s > by - 4 && dy < by + h + 4;
    this.barDim += ((over ? 0.12 : 1) - this.barDim) * 0.25;
    ctx.save();
    ctx.globalAlpha = Math.min(1, B.k * 1.3) * this.barDim;
    ctx.translate(0, (1 - B.k) * (top ? -8 : 8));
    const ui = THEMES[w.city].ui;
    ctx.fillStyle = B.tone === 'sign' ? 'rgba(52,36,22,0.82)' : 'rgba(16,12,26,0.78)';
    rr(ctx, bx, by, bw, h, h / 2.4);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = B.tone === 'sign' ? 'rgba(201,163,107,0.8)' : ui;
    ctx.stroke();
    if (hasFace) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx + 7 + face, by + h / 2, face, 0, Math.PI * 2);
      ctx.clip();
      drawRivalBust(ctx, bx + 7 + face, by + h / 2, face, rv!.mood, o.time, ui, w.info.rival === 'bandar' ? 'bandar' : 'tara');
      ctx.restore();
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    let ty = by + 4 + size * 0.6;
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.fillStyle = '#FFFFFF';
    for (const r of mainRows) {
      ctx.fillText(r, bx + padL, ty);
      ty += size * 1.14;
    }
    if (enRows.length) {
      ctx.globalAlpha = Math.min(1, B.k * 1.3) * Math.max(0.35, k) * this.barDim;
      ctx.font = `italic 700 ${small}px ${FONT}`;
      ctx.fillStyle = '#FFE08A';
      for (const r of enRows) {
        ctx.fillText(r, bx + padL, ty - size * 0.06);
        ty += small * 1.14;
      }
    }
    ctx.restore();
  }

  private drawBubbles(w: World, sx: number, sy: number) {
    const ctx = this.ctx;
    const v = this.view;
    const size = Math.max(11, Math.min(16, 7.4 * v.s));
    const small = Math.round(size * 0.84);
    const mainFont = `800 ${size}px ${FONT}`;
    const enFont = `italic 700 ${small}px ${FONT}`;
    for (const b of w.bubbles) {
      if (b.tone !== 'npc') continue;
      const { main, en } = bi(b.text);
      const age = (w.tick - b.start) / 120;
      const pop = Math.min(1, age * 7);
      const left = (b.until - w.tick) / 120;
      const alpha = Math.min(1, left * 4);
      // the English meaning slides in under the regional line after a beat
      const k = en ? Math.max(0, Math.min(1, (age - EN_DELAY) * 4)) : 0;
      const pos = b.follow ? b.follow() : b;
      let ax = v.ox + sx + pos.x * v.s;
      const ay = v.oy + sy + pos.y * v.s;
      if (w.flags.view === 'mirror') ax = v.W - ax;
      ctx.font = mainFont;
      const tw = ctx.measureText(main).width;
      ctx.font = enFont;
      const ew = en ? ctx.measureText(en).width : 0;
      const bw = Math.max(tw, ew * k) + size * 1.2,
        bh = size * 1.75 + k * small * 1.25;
      let bx = ax - bw / 2;
      const by = Math.max(6, ay - bh - size * 0.6);
      bx = Math.max(6, Math.min(v.W - bw - 6, bx));
      // a bubble over Dad goes see-through, he always stays visible
      const pl = w.player;
      const pdx = v.ox + sx + pl.x * v.s,
        pdy = v.oy + sy + pl.y * v.s;
      const overDad = pdx + pl.w * v.s > bx - 6 && pdx < bx + bw + 6 && pdy + pl.h * v.s > by - 6 && pdy < by + bh + size * 0.5 + 6;
      ctx.save();
      ctx.globalAlpha = alpha * (overDad ? 0.22 : 1);
      ctx.translate(ax, ay);
      ctx.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
      ctx.translate(-ax, -ay);
      const fill = '#FFF8E1';
      const edge = '#2B2B2B';
      const rad = Math.min(bh / 2, size * 0.9);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      rr(ctx, bx + 2, by + 3, bw, bh, rad);
      ctx.fill();
      ctx.fillStyle = fill;
      rr(ctx, bx, by, bw, bh, rad);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = edge;
      ctx.stroke();
      {
        const tx = Math.max(bx + rad, Math.min(bx + bw - rad, ax));
        ctx.beginPath();
        ctx.moveTo(tx - size * 0.35, by + bh - 1);
        ctx.lineTo(tx, by + bh + size * 0.5);
        ctx.lineTo(tx + size * 0.35, by + bh - 1);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = fill;
        ctx.fillRect(tx - size * 0.32, by + bh - 3, size * 0.64, 3);
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = mainFont;
      ctx.fillStyle = '#1D1A26';
      ctx.fillText(main, bx + bw / 2, by + size * 0.875 + 1);
      if (en && k > 0) {
        ctx.globalAlpha = alpha * k;
        ctx.font = enFont;
        ctx.fillStyle = '#5B4A86';
        ctx.fillText(en, bx + bw / 2, by + size * 1.75 + small * 0.55);
      }
      ctx.restore();
    }
  }

  private drawTouch(t: FrameOpts['touch']) {
    const ctx = this.ctx;
    for (const b of t.buttons) {
      const a = b.pressed ? Math.min(0.85, t.opacity + 0.3) : t.opacity;
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = b.pressed ? 'rgba(255,255,255,0.55)' : 'rgba(20,18,30,0.45)';
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * (b.pressed ? 0.94 : 1), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = Math.min(1, a + 0.35);
      const r = b.r * 0.36;
      ctx.beginPath();
      if (b.kind === 'left') {
        ctx.moveTo(b.x - r, b.y);
        ctx.lineTo(b.x + r * 0.7, b.y - r);
        ctx.lineTo(b.x + r * 0.7, b.y + r);
      } else if (b.kind === 'right') {
        ctx.moveTo(b.x + r, b.y);
        ctx.lineTo(b.x - r * 0.7, b.y - r);
        ctx.lineTo(b.x - r * 0.7, b.y + r);
      } else {
        ctx.moveTo(b.x, b.y - r * 1.05);
        ctx.lineTo(b.x + r, b.y + r * 0.45);
        ctx.lineTo(b.x + r * 0.35, b.y + r * 0.45);
        ctx.lineTo(b.x + r * 0.35, b.y + r);
        ctx.lineTo(b.x - r * 0.35, b.y + r);
        ctx.lineTo(b.x - r * 0.35, b.y + r * 0.45);
        ctx.lineTo(b.x - r, b.y + r * 0.45);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  /** Render a level thumbnail (initial state) into a canvas, for share cards and menus. */
  static thumbnail(world: World, w: number, h: number, character: 'papa' | 'mummy'): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    const s = Math.max(w / ROOM_W, h / ROOM_H);
    const ox = (w - ROOM_W * s) / 2,
      oy = (h - ROOM_H * s) / 2;
    ctx.setTransform(s, 0, 0, s, ox, oy);
    drawBackdrop(ctx, world.city, -ox / s, (w - ox) / s, -oy / s, (h - oy) / s, world.level.index, world.level.scene);
    const th = THEMES[world.city];
    const groupCells = new Set<string>();
    for (const cells of world.groupCells.values()) for (const [x, y] of cells) groupCells.add(`${x},${y}`);
    const solid = (x: number, y: number) => {
      if (y < 0) return false;
      const cx = Math.max(0, Math.min(world.cols - 1, x)),
        cy = Math.min(ROWS - 1, y);
      const t = world.tiles[cy * world.cols + cx];
      return (t === TT.SOLID || t === TT.WET) && world.hiddenTiles[cy * world.cols + cx] !== 1 ? true : groupCells.has(`${cx},${cy}`);
    };
    for (let ty = 0; ty < ROWS; ty++)
      for (let tx = 0; tx < Math.min(world.cols, 34); tx++) {
        const t = world.tiles[ty * world.cols + tx];
        const isG = groupCells.has(`${tx},${ty}`);
        if (world.hiddenTiles[ty * world.cols + tx]) continue;
        if (t === TT.SOLID || t === TT.WET || isG)
          drawTile(ctx, tx * TILE, ty * TILE, th, { up: solid(tx, ty - 1), down: solid(tx, ty + 1), left: solid(tx - 1, ty), right: solid(tx + 1, ty) }, t === TT.WET);
        else if (t === TT.ONEWAY) drawOneWay(ctx, tx * TILE, ty * TILE, th);
        else if (t >= TT.SPIKE_UP) drawSpikeTile(ctx, t, tx * TILE, ty * TILE, th);
      }
    for (const e of world.entities) e.draw(ctx, world);
    const p = world.player;
    drawHero(ctx, character, p.x + p.w / 2, p.y + p.h, { facing: 1, run: 0, moving: false, air: null, squash: 0, blink: false, rim: th.rim });
    return c;
  }
}

export const ROOM = { W: ROOM_W, H: ROOM_H };
/** per-city colour grade: light from above, shadow tint below, a soft bloom */
/** per city: where its light comes from (fraction of the screen), the glow, a colour whisper, a vignette tint */
export type Grade = { gx: number; gy: number; glow: string; tint: string; vig: string };
export const GRADES: Record<string, Grade> = {
  TVM: { gx: 0.82, gy: -0.15, glow: 'rgba(255,236,190,0.30)', tint: 'rgba(110,200,160,0.12)', vig: 'rgba(8,46,36,0.16)' },
  KVT: { gx: 0.74, gy: -0.22, glow: 'rgba(255,255,236,0.34)', tint: 'rgba(60,220,235,0.10)', vig: 'rgba(0,48,86,0.12)' },
  CHN: { gx: 0.84, gy: -0.12, glow: 'rgba(255,242,205,0.38)', tint: 'rgba(255,196,120,0.10)', vig: 'rgba(84,34,12,0.12)' },
  PDY: { gx: 0.22, gy: -0.16, glow: 'rgba(255,246,220,0.32)', tint: 'rgba(255,214,140,0.08)', vig: 'rgba(26,48,96,0.12)' },
  BLR: { gx: 0.12, gy: 0.34, glow: 'rgba(255,206,190,0.32)', tint: 'rgba(196,140,230,0.12)', vig: 'rgba(42,20,74,0.16)' },
  AMR: { gx: 0.7, gy: -0.22, glow: 'rgba(255,228,160,0.42)', tint: 'rgba(255,160,70,0.12)', vig: 'rgba(96,32,8,0.16)' },
  HYD: { gx: 0.18, gy: 0.56, glow: 'rgba(255,160,100,0.36)', tint: 'rgba(220,80,160,0.12)', vig: 'rgba(28,8,52,0.22)' },
  PNJ: { gx: 0.22, gy: 0.5, glow: 'rgba(255,186,120,0.3)', tint: 'rgba(255,110,70,0.09)', vig: 'rgba(40,14,30,0.22)' },
  DMN: { gx: 0.7, gy: 0.2, glow: 'rgba(255,240,200,0.24)', tint: 'rgba(60,140,200,0.08)', vig: 'rgba(10,30,50,0.2)' },
  GNR: { gx: 0.6, gy: 0.25, glow: 'rgba(255,236,190,0.26)', tint: 'rgba(255,170,60,0.07)', vig: 'rgba(30,20,10,0.2)' },
  RPR: { gx: 0.7, gy: 0.2, glow: 'rgba(255,240,190,0.26)', tint: 'rgba(120,170,60,0.07)', vig: 'rgba(20,35,10,0.2)' },
  BPL: { gx: 0.3, gy: 0.24, glow: 'rgba(255,236,200,0.24)', tint: 'rgba(60,150,160,0.07)', vig: 'rgba(10,30,40,0.2)' },
  JAI: { gx: 0.65, gy: 0.22, glow: 'rgba(255,222,196,0.26)', tint: 'rgba(230,100,120,0.07)', vig: 'rgba(40,15,20,0.2)' },
  BOM: { gx: 0.8, gy: -0.1, glow: 'rgba(170,200,255,0.22)', tint: 'rgba(80,110,255,0.10)', vig: 'rgba(4,6,26,0.26)' },
};
/** tile cache slice width (world px) */
const CHUNK = 512;
/** how fast the backdrop scrolls compared with the level */
const BG_PARALLAX = 0.32;
