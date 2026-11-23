// Draws a room: a cached backdrop and ground, then the live layer (slabs, spikes, the
// ride, Dad, his ghosts, particles), then screen effects. Everything in world units
// under one transform, so it is sharp at any screen density.
import { ROWS, TILE } from '../game/constants';
import { TileGroup } from '../game/entities/group';
import { SpikeGroup } from '../game/entities/basics';
import { ROOM_FRAME, TT, World, WorldEvent } from '../game/world';
import type { Player } from '../game/player';
import { DadPose, drawDad } from './art/dad';
import { drawGroundTile, drawSpikes, faceGradient, Nb } from './art/ground';
import { Fx } from './art/fx';
import type { Box, Scene } from './art/scene';
import { RideExit } from './exits';
import { RoomProp } from './props';
import { drawProp } from './art/props';
import { drawRide, drawRidesFront, sceneFor } from './art/scenes';
import type { RoomDef } from './types';

export interface Viewport {
  W: number;
  H: number;
  dpr: number;
  /** world px -> CSS px */
  s: number;
  /** CSS px of world (0, ROOM_FRAME.y) */
  ox: number;
  oy: number;
}

export interface Safe {
  l: number;
  r: number;
  t: number;
  b: number;
}

export function roomViewport(W: number, H: number, dpr: number, safe: Safe): Viewport {
  const wSafe = Math.max(100, W - safe.l - safe.r);
  const s = Math.min(wSafe / ROOM_FRAME.w, H / ROOM_FRAME.h);
  return { W, H, dpr, s, ox: safe.l + (wSafe - ROOM_FRAME.w * s) / 2, oy: (H - ROOM_FRAME.h * s) / 2 };
}

export interface Ghost {
  world: World;
  alpha: number;
  tint: string;
  /** where and when it died, for the little mark it leaves */
  diedAt?: { x: number; y: number };
}

export interface TouchDraw {
  kind: 'left' | 'right' | 'jump';
  x: number;
  y: number;
  r: number;
  pressed: boolean;
}

export interface RoomFrame {
  world: World;
  t: number;
  dt: number;
  ghosts?: Ghost[];
  /** draw the live player (false while the montage owns the picture) */
  showDad?: boolean;
  touch?: { buttons: TouchDraw[]; opacity: number };
  /** 0..1 white flash, 0..1 black fade, px of shake */
  flash?: number;
  fade?: number;
  shake?: number;
  /** dims the room behind a menu */
  dim?: number;
}

const DAD_TICKS_LAND = 9,
  DAD_TICKS_JUMP = 8;

export class RoomRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  vp!: Viewport;
  fx = new Fx();
  private bg: HTMLCanvasElement | null = null;
  private bgKey = '';
  private ground: HTMLCanvasElement | null = null;
  private groundKey = '';
  private groundWorld: World | null = null;
  /** static tile sides that face a slab: drawn as cut edges once the slab moves */
  private seams = new Map<TileGroup, { x: number; y: number; side: 'l' | 'r' | 't' | 'b' }[]>();
  private idle = 0;
  private lastWorld: World | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  resize(vp: Viewport) {
    this.vp = vp;
    const c = this.canvas;
    c.width = Math.round(vp.W * vp.dpr);
    c.height = Math.round(vp.H * vp.dpr);
    c.style.width = vp.W + 'px';
    c.style.height = vp.H + 'px';
    this.bgKey = '';
    this.groundKey = '';
  }

  /** the world rect on screen */
  box(): Box {
    const v = this.vp;
    return { x0: -v.ox / v.s, y0: ROOM_FRAME.y - v.oy / v.s, x1: (v.W - v.ox) / v.s, y1: ROOM_FRAME.y + (v.H - v.oy) / v.s };
  }

  /** world -> device px transform */
  private worldTx(ctx: CanvasRenderingContext2D, dx = 0, dy = 0) {
    const v = this.vp;
    const k = v.s * v.dpr;
    ctx.setTransform(k, 0, 0, k, (v.ox + dx) * v.dpr, (v.oy + dy) * v.dpr - ROOM_FRAME.y * k);
  }

  private offscreen(): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = this.canvas.width;
    c.height = this.canvas.height;
    return c;
  }

  private ensureBg(scene: Scene, key: string) {
    const k = `${key}|${this.canvas.width}x${this.canvas.height}|${this.vp.s}`;
    if (this.bg && this.bgKey === k) return;
    const c = this.bg && this.bg.width === this.canvas.width && this.bg.height === this.canvas.height ? this.bg : this.offscreen();
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = scene.base;
    ctx.fillRect(0, 0, c.width, c.height);
    this.worldTx(ctx);
    const r = this.box();
    scene.backdrop(ctx, r);
    scene.pit(ctx, r, 224);
    this.bg = c;
    this.bgKey = k;
  }

  /** is (tx, ty) solid ground for drawing (the map's edges run on past the screen) */
  private static solid(w: World, tx: number, ty: number, groups: Set<string>): boolean {
    const cx = Math.max(0, Math.min(w.cols - 1, tx));
    const cy = Math.min(ROWS - 1, ty);
    if (cy < 0) return false;
    const t = w.tileAt(cx, cy);
    return t === TT.SOLID || t === TT.WET || groups.has(`${cx},${cy}`);
  }

  private ensureGround(w: World, scene: Scene, key: string) {
    const k = `${key}|${w.level.id}|${this.canvas.width}x${this.canvas.height}|${this.vp.s}`;
    if (this.ground && this.groundKey === k && this.groundWorld?.level === w.level) return;
    const c = this.ground && this.ground.width === this.canvas.width && this.ground.height === this.canvas.height ? this.ground : this.offscreen();
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    this.worldTx(ctx);
    const groups = new Set<string>();
    for (const cells of w.groupCells.values()) for (const [x, y] of cells) groups.add(`${x},${y}`);
    const r = this.box();
    const face = faceGradient(ctx, scene.ground, 224);
    const tx0 = Math.floor(r.x0 / TILE) - 1,
      tx1 = Math.ceil(r.x1 / TILE) + 1,
      ty0 = Math.max(0, Math.floor(r.y0 / TILE)),
      ty1 = Math.ceil(r.y1 / TILE) + 1;
    const S = (x: number, y: number) => RoomRenderer.solid(w, x, y, groups) && !w.hiddenTiles[Math.min(ROWS - 1, Math.max(0, y)) * w.cols + Math.max(0, Math.min(w.cols - 1, x))];
    for (let ty = ty0; ty <= ty1; ty++)
      for (let tx = tx0; tx <= tx1; tx++) {
        const cx = Math.max(0, Math.min(w.cols - 1, tx)),
          cy = Math.min(ROWS - 1, ty);
        const t = w.tileAt(cx, cy);
        if (t !== TT.SOLID && t !== TT.WET) continue;
        if (groups.has(`${cx},${cy}`)) continue;
        if (w.hiddenTiles[cy * w.cols + cx]) continue;
        drawGroundTile(ctx, scene.ground, tx * TILE, ty * TILE, { up: S(tx, ty - 1), down: S(tx, ty + 1), left: S(tx - 1, ty), right: S(tx + 1, ty) }, face);
      }
    // static spikes
    for (let ty = 0; ty < ROWS; ty++)
      for (let tx = 0; tx < w.cols; tx++) {
        const t = w.tileAt(tx, ty);
        if (t < TT.SPIKE_UP) continue;
        drawSpikes(ctx, scene.ground, tx * TILE, ty * TILE, t === TT.SPIKE_UP ? 'up' : t === TT.SPIKE_DOWN ? 'down' : t === TT.SPIKE_LEFT ? 'left' : 'right');
      }
    // remember which static sides face each slab
    this.seams.clear();
    for (const e of w.entities) {
      if (!(e instanceof TileGroup)) continue;
      const own = new Set(e.cells.map(([x, y]) => `${x + e.ox / TILE},${y + e.oy / TILE}`));
      const list: { x: number; y: number; side: 'l' | 'r' | 't' | 'b' }[] = [];
      for (const key2 of own) {
        const [x, y] = key2.split(',').map(Number);
        const isStatic = (a: number, b: number) => !own.has(`${a},${b}`) && S(a, b) && !groups.has(`${a},${b}`);
        if (isStatic(x - 1, y)) list.push({ x: (x - 1) * TILE, y: y * TILE, side: 'r' });
        if (isStatic(x + 1, y)) list.push({ x: (x + 1) * TILE, y: y * TILE, side: 'l' });
        if (isStatic(x, y + 1)) list.push({ x: x * TILE, y: (y + 1) * TILE, side: 't' });
        if (isStatic(x, y - 1)) list.push({ x: x * TILE, y: (y - 1) * TILE, side: 'b' });
      }
      this.seams.set(e, list);
    }
    this.ground = c;
    this.groundKey = k;
    this.groundWorld = w;
  }

  /** feed the world's events to the particles and effects; returns screen shake to add */
  events(evs: WorldEvent[], scene: Scene): { shake: number; flash: number } {
    let shake = 0,
      flash = 0;
    for (const e of evs) {
      switch (e.type) {
        case 'jump':
          this.fx.dust(e.x, e.y, 4, 0.8);
          break;
        case 'land':
          if ((e.data?.speed ?? 0) > 150) this.fx.dust(e.x, e.y, 6, Math.min(1.6, (e.data.speed as number) / 260));
          break;
        case 'die':
          this.fx.pop(e.x, e.y, e.data?.vx ?? 0, e.data?.vy ?? 0);
          shake = Math.max(shake, 2);
          flash = 0.22;
          break;
        case 'slab':
          this.fx.crumble(e.x, e.y, e.data?.w ?? 32, [scene.ground.top, scene.ground.face[0], scene.ground.edge]);
          shake = Math.max(shake, 1);
          break;
        case 'slabBack':
          this.fx.dust(e.x, e.y, 8, 1.4);
          break;
        case 'bonk':
          this.fx.stars(e.x, e.y);
          break;
        case 'win':
          this.fx.sparkle(e.x, e.y - 6);
          break;
        case 'ghostPop':
          this.fx.ghostPop(e.x, e.y);
          break;
      }
    }
    return { shake, flash };
  }

  private pose(w: World, p: Player, t: number): DadPose {
    const sinceLand = w.tick - p.landTick,
      sinceJump = w.tick - p.jumpTick;
    let squash = 0;
    if (sinceLand >= 0 && sinceLand < DAD_TICKS_LAND) squash = (1 - sinceLand / DAD_TICKS_LAND) * Math.min(0.3, p.landSpeed / 1300);
    else if (sinceJump >= 0 && sinceJump < DAD_TICKS_JUMP && !p.onGround) squash = -(1 - sinceJump / DAD_TICKS_JUMP) * 0.22;
    const moving = Math.abs(p.vx) > 8;
    // a hole right at his toes (and he's not walking into it on purpose)
    const toe = p.facing > 0 ? p.x + p.w + 2 : p.x - 3;
    const edge = p.onGround && !w.solidAt(toe, p.y + p.h, 1, 2) && !w.oneWayTopAt(toe, p.y + p.h, 1);
    return {
      x: p.x + p.w / 2,
      y: p.y + p.h,
      facing: p.facing,
      t,
      run: p.runDist,
      moving: moving && p.onGround,
      air: !p.onGround,
      vy: p.vy,
      squash,
      idle: this.idle,
      edge,
      worried: edge,
    };
  }

  render(f: RoomFrame) {
    const ctx = this.ctx;
    const w = f.world;
    const def = w.level as RoomDef;
    const scene = sceneFor(def.door);
    const key = def.door;
    this.ensureBg(scene, key);
    this.ensureGround(w, scene, key);
    if (w !== this.lastWorld) {
      this.lastWorld = w;
      this.idle = 0;
    }
    const p = w.player;
    if (w.state === 'play' && p.onGround && Math.abs(p.vx) < 1 && p.inputDir === 0) this.idle += f.dt;
    else this.idle = 0;
    this.fx.update(f.dt);

    const sh = f.shake ?? 0;
    const sx = sh ? (Math.random() * 2 - 1) * sh * this.vp.s * 0.5 : 0,
      sy = sh ? (Math.random() * 2 - 1) * sh * this.vp.s * 0.5 : 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.bg!, sx * this.vp.dpr, sy * this.vp.dpr);
    this.worldTx(ctx, sx, sy);
    const r = this.box();
    scene.ambient?.(ctx, r, f.t);
    // things behind the floor (the ride)
    for (const e of w.entities) if (e instanceof RideExit) drawRide(ctx, e, f.t);
    // the static ground
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.ground!, sx * this.vp.dpr, sy * this.vp.dpr);
    this.worldTx(ctx, sx, sy);
    this.drawLive(ctx, w, scene);
    for (const e of w.entities) if (e instanceof RoomProp) drawProp(ctx, e, w, f.t);
    drawRidesFront(ctx, w, f.t);
    // ghosts of earlier tries
    if (f.ghosts) {
      for (const g of f.ghosts) {
        const gp = g.world.player;
        if (g.world.state === 'play' || (g.world.state === 'won' && !gp.hidden)) {
          drawDad(ctx, { ...this.pose(g.world, gp, f.t), ghost: { alpha: g.alpha, tint: g.tint } });
        }
        if (g.diedAt) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = g.tint;
          ctx.lineWidth = 1.2;
          ctx.lineCap = 'round';
          const { x, y } = g.diedAt;
          ctx.beginPath();
          ctx.moveTo(x - 2.4, y - 2.4);
          ctx.lineTo(x + 2.4, y + 2.4);
          ctx.moveTo(x + 2.4, y - 2.4);
          ctx.lineTo(x - 2.4, y + 2.4);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
    // Dad
    if ((f.showDad ?? true) && w.state !== 'dead' && !p.hidden) {
      this.shadow(ctx, w, p);
      drawDad(ctx, this.pose(w, p, f.t));
    }
    this.fx.draw(ctx);
    scene.front?.(ctx, r, f.t);

    // ---- screen space
    ctx.setTransform(this.vp.dpr, 0, 0, this.vp.dpr, 0, 0);
    this.vignette(ctx);
    if (f.dim) {
      ctx.fillStyle = `rgba(8,6,14,${f.dim})`;
      ctx.fillRect(0, 0, this.vp.W, this.vp.H);
    }
    if (f.touch) this.drawTouch(ctx, f.touch.buttons, f.touch.opacity, w.flipped);
    if (f.flash) {
      ctx.fillStyle = `rgba(255,250,240,${f.flash})`;
      ctx.fillRect(0, 0, this.vp.W, this.vp.H);
    }
    if (f.fade) {
      ctx.fillStyle = `rgba(10,8,16,${f.fade})`;
      ctx.fillRect(0, 0, this.vp.W, this.vp.H);
    }
  }

  /** slabs, cut edges, popped spikes */
  private drawLive(ctx: CanvasRenderingContext2D, w: World, scene: Scene) {
    const st = scene.ground;
    const face = faceGradient(ctx, st, 224);
    for (const e of w.entities) {
      if (e instanceof TileGroup) {
        const moved = !e.atRest || e.state === 'shake' || !e.visible || e.state === 'gone' || e.state === 'fall';
        if (moved) {
          // the cut faces of the ground it left
          ctx.fillStyle = st.edge;
          for (const s of this.seams.get(e) ?? []) {
            if (s.side === 'l') ctx.fillRect(s.x, s.y, 1.1, TILE);
            else if (s.side === 'r') ctx.fillRect(s.x + TILE - 1.1, s.y, 1.1, TILE);
            else if (s.side === 't') ctx.fillRect(s.x, s.y, TILE, 1.1);
            else ctx.fillRect(s.x, s.y + TILE - 1.1, TILE, 1.1);
          }
        }
        if (!e.visible) continue;
        const s = e.solid;
        let ox = s.x + s.xr,
          oy = s.y + s.yr;
        if (e.state === 'shake') {
          ox += ((w.tick * 7) % 3) - 1;
          oy += ((w.tick * 5) % 2) * 0.5;
        }
        const own = new Set(e.cells.map(([x, y]) => `${x},${y}`));
        const rest = e.atRest && e.state !== 'shake';
        const groups = new Set<string>();
        if (rest) for (const cells of w.groupCells.values()) for (const [x, y] of cells) groups.add(`${x},${y}`);
        const gx = e.ox / TILE,
          gy = e.oy / TILE;
        for (const [cx, cy] of e.cells) {
          let nb: Nb;
          if (rest) {
            const S = (a: number, b: number) => RoomRenderer.solid(w, a, b, groups);
            nb = { up: S(gx + cx, gy + cy - 1), down: S(gx + cx, gy + cy + 1), left: S(gx + cx - 1, gy + cy), right: S(gx + cx + 1, gy + cy) };
          } else nb = { up: own.has(`${cx},${cy - 1}`), down: own.has(`${cx},${cy + 1}`), left: own.has(`${cx - 1},${cy}`), right: own.has(`${cx + 1},${cy}`) };
          drawGroundTile(ctx, st, ox + cx * TILE, oy + cy * TILE, nb, face);
        }
      } else if (e instanceof SpikeGroup) {
        if (!e.popped) continue;
        const k = Math.min(1, (w.tick - e.popTick) / 5);
        const g = k < 1 ? 1 + 2.70158 * Math.pow(k - 1, 3) + 1.70158 * Math.pow(k - 1, 2) : 1;
        for (const c of e.cells) drawSpikes(ctx, st, c.x, c.y, c.t === TT.SPIKE_UP ? 'up' : c.t === TT.SPIKE_DOWN ? 'down' : c.t === TT.SPIKE_LEFT ? 'left' : 'right', Math.max(0.05, g));
      }
    }
  }

  /** a soft contact shadow on whatever is under him */
  private shadow(ctx: CanvasRenderingContext2D, w: World, p: Player) {
    const feet = p.y + p.h;
    let d = 0;
    for (; d < 48; d++) if (w.solidAt(p.x + 2, feet + d, p.w - 4, 1)) break;
    if (d >= 48) return;
    const k = 1 - d / 48;
    ctx.fillStyle = `rgba(0,0,0,${0.28 * k})`;
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, feet + d + 0.6, 5.5 * (0.6 + 0.4 * k), 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private vignette(ctx: CanvasRenderingContext2D) {
    const { W, H } = this.vp;
    const g = ctx.createRadialGradient(W / 2, H * 0.48, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.72);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(6,4,12,0.38)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  private drawTouch(ctx: CanvasRenderingContext2D, btns: TouchDraw[], opacity: number, flipped = false) {
    for (const b0 of btns) {
      // ulta: the arrows swap (and glow orange) while left and right are swapped
      const b = flipped && b0.kind !== 'jump' ? { ...b0, kind: (b0.kind === 'left' ? 'right' : 'left') as TouchDraw['kind'] } : b0;
      ctx.save();
      ctx.globalAlpha = Math.min(1, opacity * (b.pressed ? 2.2 : 1.4));
      ctx.fillStyle = b.pressed ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.12)';
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = flipped && b.kind !== 'jump' ? 'rgba(255,170,70,1)' : 'rgba(255,255,255,0.95)';
      ctx.lineWidth = Math.max(2.5, b.r * 0.12);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const a = b.r * 0.3;
      ctx.beginPath();
      if (b.kind === 'left') {
        ctx.moveTo(b.x + a * 0.5, b.y - a);
        ctx.lineTo(b.x - a * 0.6, b.y);
        ctx.lineTo(b.x + a * 0.5, b.y + a);
      } else if (b.kind === 'right') {
        ctx.moveTo(b.x - a * 0.5, b.y - a);
        ctx.lineTo(b.x + a * 0.6, b.y);
        ctx.lineTo(b.x - a * 0.5, b.y + a);
      } else {
        ctx.moveTo(b.x - a, b.y + a * 0.45);
        ctx.lineTo(b.x, b.y - a * 0.65);
        ctx.lineTo(b.x + a, b.y + a * 0.45);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
}
