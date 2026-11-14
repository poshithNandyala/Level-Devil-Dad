import { Solid } from '../body';
import { DT, ease, EaseName, Rect, ROOM_H, secs, TILE } from '../constants';
import { Entity, World } from '../world';
import { THEMES } from '../../render/theme';
import { drawTile, Nb } from '../../render/art/tiles';

interface Tween {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  t0: number;
  dur: number;
  ease: EaseName;
  last: number;
  then?: (w: World) => void;
}

/**
 * Tiles marked with the same lowercase letter in a map become one movable
 * solid. At rest they are drawn exactly like the ground around them, which
 * is the whole point.
 */
export class TileGroup extends Entity {
  readonly letter: string;
  solid: Solid;
  cells: [number, number][];
  private nbRest: Nb[];
  private nbOwn: Nb[];
  readonly ox: number;
  readonly oy: number;
  visible = true;
  state: 'rest' | 'shake' | 'fall' | 'tween' | 'landed' | 'gone' = 'rest';
  private shakeUntil = 0;
  private shakeThen: ((w: World) => void) | null = null;
  private fallV = 0;
  private fallG = 1500;
  private fallMax = 620;
  private land = false;
  private tween: Tween | null = null;
  wet = false;
  /** draw a puddle on top (Kerala monsoon) */
  puddle = false;
  /** draw as a painted wall instead of ground tiles (Pondy's yellow walls) */
  paint: { fill: string; trim: string; line: string; windows?: string; kerb?: [string, string] } | null = null;

  constructor(w: World, letter: string) {
    super();
    this.letter = letter;
    const abs = w.groupCells.get(letter);
    if (!abs || !abs.length) throw new Error(`${w.level.id}: group '${letter}' has no tiles`);
    let minX = 99,
      minY = 99,
      maxX = -1,
      maxY = -1;
    for (const [tx, ty] of abs) {
      minX = Math.min(minX, tx);
      minY = Math.min(minY, ty);
      maxX = Math.max(maxX, tx);
      maxY = Math.max(maxY, ty);
    }
    this.cells = abs.map(([tx, ty]) => [tx - minX, ty - minY]);
    this.ox = minX * TILE;
    this.oy = minY * TILE;
    this.solid = new Solid(this.ox, this.oy, (maxX - minX + 1) * TILE, (maxY - minY + 1) * TILE);
    this.solid.parts = mergeRuns(this.cells);

    const own = new Set(this.cells.map(([x, y]) => `${x},${y}`));
    const allGroups = new Set<string>();
    for (const cells of w.groupCells.values()) for (const [x, y] of cells) allGroups.add(`${x},${y}`);
    const solidAbs = (x: number, y: number) =>
      y >= 18 || w.isSolidTile(w.tileAt(x, y)) || allGroups.has(`${x},${y}`) || (x < 0 || x >= 32 ? false : false);
    this.nbRest = abs.map(([x, y]) => ({
      up: solidAbs(x, y - 1),
      down: solidAbs(x, y + 1),
      left: solidAbs(x - 1, y),
      right: solidAbs(x + 1, y),
    }));
    this.nbOwn = this.cells.map(([x, y]) => ({
      up: own.has(`${x},${y - 1}`),
      down: own.has(`${x},${y + 1}`),
      left: own.has(`${x - 1},${y}`),
      right: own.has(`${x + 1},${y}`),
    }));
  }

  get atRest() {
    return this.solid.x === this.ox && this.solid.y === this.oy;
  }

  shake(w: World, seconds: number, then?: (w: World) => void) {
    if (this.state === 'gone') return;
    this.state = 'shake';
    this.shakeUntil = w.tick + secs(seconds);
    this.shakeThen = then ?? null;
    w.sfx('rumble', this.solid.x + this.solid.w / 2, this.solid.y);
  }

  /** Drop out of the room (or until it lands if `land` is set). */
  fall(w: World, opts: { delay?: number; land?: boolean; g?: number; max?: number; v0?: number } = {}) {
    if (this.state === 'fall' || this.state === 'gone') return;
    const go = () => {
      this.state = 'fall';
      this.fallV = opts.v0 ?? 30;
      this.land = !!opts.land;
      if (opts.g) this.fallG = opts.g;
      if (opts.max) this.fallMax = opts.max;
      w.sfx('collapse', this.solid.x + this.solid.w / 2, this.solid.y);
      w.emit('fx', this.solid.x + this.solid.w / 2, this.solid.y, { kind: 'crumble', w: this.solid.w });
    };
    if (opts.delay && opts.delay > 0) this.shake(w, opts.delay, go);
    else go();
  }

  slide(w: World, dxTiles: number, dyTiles: number, seconds: number, e: EaseName = 'inOut', then?: (w: World) => void) {
    const sx = this.solid.x + this.solid.xr,
      sy = this.solid.y + this.solid.yr;
    this.tween = {
      sx,
      sy,
      ex: sx + dxTiles * TILE,
      ey: sy + dyTiles * TILE,
      t0: w.tick,
      dur: Math.max(1, secs(seconds)),
      ease: e,
      last: 0,
      then,
    };
    this.state = 'tween';
    w.sfx('slide', this.solid.x + this.solid.w / 2, this.solid.y);
  }

  vanish(w: World) {
    this.solid.collidable = false;
    this.visible = false;
    this.state = 'gone';
    w.emit('fx', this.solid.x + this.solid.w / 2, this.solid.y + this.solid.h / 2, { kind: 'poof', w: this.solid.w, h: this.solid.h });
    w.sfx('poof', this.solid.x + this.solid.w / 2, this.solid.y);
  }

  appear(w: World) {
    this.solid.collidable = true;
    this.visible = true;
    this.state = 'rest';
    const p = w.player;
    if (this.solid.overlaps(p.x, p.y, p.w, p.h)) w.die('crushed');
    w.emit('fx', this.solid.x + this.solid.w / 2, this.solid.y + this.solid.h / 2, { kind: 'poof', w: this.solid.w, h: this.solid.h });
  }

  private blockedBelow(w: World): boolean {
    const s = this.solid;
    s.collidable = false;
    let hit = false;
    for (const p of s.parts!) {
      const r = w.solidAt(s.x + p.x, s.y + p.y + 1, p.w, p.h);
      if (r && !(r === true && s.y + p.y + 1 < 0)) {
        hit = true;
        break;
      }
    }
    s.collidable = true;
    return hit;
  }

  update(w: World) {
    const s = this.solid;
    if (this.state === 'shake') {
      if (w.tick >= this.shakeUntil) {
        this.state = 'rest';
        const fn = this.shakeThen;
        this.shakeThen = null;
        fn?.(w);
      }
    } else if (this.state === 'fall') {
      this.fallV = Math.min(this.fallV + this.fallG * DT, this.fallMax);
      let dy = this.fallV * DT;
      if (this.land) {
        s.yr += dy;
        let steps = Math.round(s.yr);
        s.yr -= steps;
        while (steps > 0) {
          if (this.blockedBelow(w)) {
            this.state = 'landed';
            w.sfx('thud', s.x + s.w / 2, s.y + s.h);
            w.emit('fx', s.x + s.w / 2, s.y + s.h, { kind: 'dust', w: s.w });
            w.emit('shake', s.x, s.y, { amount: 3 });
            s.yr = 0;
            break;
          }
          s.moveBy(w, 0, 1);
          steps--;
        }
      } else {
        s.moveBy(w, 0, dy);
        if (s.y > ROOM_H + 40) {
          this.state = 'gone';
          s.collidable = false;
          this.visible = false;
        }
      }
    } else if (this.state === 'tween' && this.tween) {
      const tw = this.tween;
      const t = Math.min(1, (w.tick - tw.t0) / tw.dur);
      const e = ease[tw.ease](t);
      const prev = tw.last;
      tw.last = e;
      s.moveBy(w, (tw.ex - tw.sx) * (e - prev), (tw.ey - tw.sy) * (e - prev));
      if (t >= 1) {
        this.tween = null;
        this.state = 'rest';
        tw.then?.(w);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (!this.visible) return;
    const th = THEMES[w.city];
    const s = this.solid;
    let ox = s.x + s.xr,
      oy = s.y + s.yr;
    if (this.state === 'shake') {
      ox += ((w.tick * 7) % 3) - 1;
      oy += ((w.tick * 5) % 2) * 0.6;
    }
    const rest = this.atRest && this.state !== 'shake';
    if (this.paint) {
      const pnt = this.paint;
      const top = Math.min(...this.cells.map(([, cy]) => cy));
      for (const [cx, cy] of this.cells) {
        const x = ox + cx * TILE,
          y = oy + cy * TILE;
        ctx.fillStyle = pnt.fill;
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = pnt.line;
        ctx.fillRect(x, y + TILE - 1, TILE, 1);
        if ((cx + cy) % 3 === 0) ctx.fillRect(x + 5, y + 6, 3, 1);
        if (pnt.windows && cy > top && cy % 2 === 0 && cx % 2 === 0) {
          // a tall shuttered window
          ctx.fillStyle = 'rgba(0,0,0,0.18)';
          ctx.fillRect(x + 4, y + 3, 9, 13);
          ctx.fillStyle = pnt.windows;
          ctx.fillRect(x + 4, y + 2, 4, 13);
          ctx.fillRect(x + 9, y + 2, 4, 13);
          ctx.fillStyle = pnt.trim;
          ctx.fillRect(x + 3, y + 1, 11, 1.5);
        }
        if (pnt.kerb) {
          // painted kerb stones, black and yellow
          for (let k = 0; k < 2; k++) {
            ctx.fillStyle = pnt.kerb[(cx * 2 + k) % 2];
            ctx.fillRect(x + k * 8, y + TILE - 7, 8, 7);
          }
        }
        if (cy === top) {
          ctx.fillStyle = pnt.trim;
          ctx.fillRect(x - 1, y, TILE + 2, 4);
          ctx.fillStyle = pnt.line;
          ctx.fillRect(x - 1, y + 4, TILE + 2, 1);
        }
      }
      return;
    }
    for (let i = 0; i < this.cells.length; i++) {
      const [cx, cy] = this.cells[i];
      drawTile(ctx, ox + cx * TILE, oy + cy * TILE, th, rest ? this.nbRest[i] : this.nbOwn[i], this.wet);
    }
    if (this.puddle) {
      // a muddy monsoon puddle sitting on top: looks shallow, isn't
      const top = Math.min(...this.cells.map(([, cy]) => cy));
      const xs = this.cells.filter(([, cy]) => cy === top).map(([cx]) => cx);
      const x0 = ox + Math.min(...xs) * TILE - 3;
      const x1 = ox + (Math.max(...xs) + 1) * TILE + 3;
      const y = oy + top * TILE;
      ctx.fillStyle = 'rgba(92,140,165,0.9)';
      ctx.beginPath();
      ctx.ellipse((x0 + x1) / 2, y + 1.5, (x1 - x0) / 2, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(210,235,245,0.75)';
      const ph = (w.tick % 90) / 90;
      ctx.beginPath();
      ctx.ellipse(x0 + (x1 - x0) * (0.3 + ph * 0.4), y + 1, 4 + ph * 4, 1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Merge tile cells into horizontal runs (relative rects). */
export function mergeRuns(cells: [number, number][]): Rect[] {
  const byRow = new Map<number, number[]>();
  for (const [x, y] of cells) {
    if (!byRow.has(y)) byRow.set(y, []);
    byRow.get(y)!.push(x);
  }
  const out: Rect[] = [];
  for (const [y, xs] of byRow) {
    xs.sort((a, b) => a - b);
    let start = xs[0],
      prev = xs[0];
    for (let i = 1; i <= xs.length; i++) {
      if (i < xs.length && xs[i] === prev + 1) {
        prev = xs[i];
        continue;
      }
      out.push({ x: start * TILE, y: y * TILE, w: (prev - start + 1) * TILE, h: TILE });
      if (i < xs.length) start = prev = xs[i];
    }
  }
  return out;
}
