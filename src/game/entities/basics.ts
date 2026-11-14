import { clamp, DT, ease, EaseName, overlapXYWH, Rect, secs, TILE } from '../constants';
import { Entity, ExitLike, Hazard, spikeHitbox, TT, World } from '../world';
import { THEMES } from '../../render/theme';
import { drawDoor, drawSpikeTile } from '../../render/art/tiles';
import { Ctx } from '../../render/art/common';

/** Spikes hidden in a map under an uppercase letter. Invisible until they pop. */
export class SpikeGroup extends Entity {
  cells: { x: number; y: number; t: number }[] = [];
  popped = false;
  popTick = -1;
  hazard: Hazard;

  constructor(w: World, letter: string) {
    super();
    const abs = w.hiddenSpikeCells.get(letter);
    if (!abs) throw new Error(`${w.level.id}: spike group '${letter}' missing`);
    for (const [tx, ty] of abs) {
      const solid = (x: number, y: number) => w.isSolidTile(w.tileAt(x, y)) || (y >= 18 ? false : hasGroup(w, x, y));
      let t: number = TT.SPIKE_UP;
      if (solid(tx, ty + 1)) t = TT.SPIKE_UP;
      else if (solid(tx, ty - 1)) t = TT.SPIKE_DOWN;
      else if (solid(tx + 1, ty)) t = TT.SPIKE_LEFT;
      else if (solid(tx - 1, ty)) t = TT.SPIKE_RIGHT;
      this.cells.push({ x: tx * TILE, y: ty * TILE, t });
    }
    const self = this;
    this.hazard = {
      active: false,
      cause: 'spikes',
      hits(x, y, w2, h) {
        for (const c of self.cells) if (overlapXYWH(x, y, w2, h, spikeHitbox(c.t, c.x, c.y))) return true;
        return false;
      },
    };
  }

  pop(w: World) {
    if (this.popped) return;
    this.popped = true;
    this.popTick = w.tick;
    this.hazard.active = true;
    const c = this.cells[0];
    w.sfx('spikes', c.x, c.y);
  }

  retract(w: World) {
    this.popped = false;
    this.hazard.active = false;
    w.sfx('slide');
  }

  draw(ctx: Ctx, w: World) {
    if (!this.popped) return;
    const th = THEMES[w.city];
    const k = clamp((w.tick - this.popTick) / 5, 0, 1);
    const s = k < 1 ? ease.back(k) : 1;
    for (const c of this.cells) drawSpikeTile(ctx, c.t, c.x, c.y, th, Math.max(0.05, s));
  }
}

function hasGroup(w: World, x: number, y: number) {
  for (const cells of w.groupCells.values()) for (const [cx, cy] of cells) if (cx === x && cy === y) return true;
  return false;
}

/** The exit door. Can move, follow something, or be a fake. */
export class Door extends Entity {
  x: number;
  y: number;
  fake = false;
  hidden = false;
  openT = 0;
  glowPhase = 0;
  follow: (() => { x: number; y: number }) | null = null;
  private tw: { sx: number; sy: number; ex: number; ey: number; t0: number; dur: number; e: EaseName; then?: (w: World) => void } | null = null;
  exit: ExitLike;
  hazard: Hazard;
  onReach: ((w: World) => void) | null = null;

  constructor(tx: number, tyBottom: number) {
    super();
    this.layer = -2;
    this.x = tx * TILE;
    this.y = (tyBottom - 1) * TILE;
    const self = this;
    this.exit = {
      zone(): Rect | null {
        return self.fake || self.hidden ? null : { x: self.x + 3, y: self.y + 8, w: 10, h: 24 };
      },
      reach(w: World) {
        if (self.onReach) self.onReach(w);
        else w.win('door');
      },
    };
    this.hazard = {
      active: true,
      cause: 'fake exit',
      hits(x, y, w2, h) {
        return self.fake && !self.hidden && overlapXYWH(x, y, w2, h, { x: self.x + 2, y: self.y + 6, w: 12, h: 26 });
      },
    };
  }

  static fromMap(w: World): Door {
    if (!w.exitCell) throw new Error(`${w.level.id}: no exit 'E'`);
    return new Door(w.exitCell.tx, w.exitCell.ty);
  }

  moveTo(w: World, x: number, y: number, seconds: number, e: EaseName = 'inOut', then?: (w: World) => void) {
    this.tw = { sx: this.x, sy: this.y, ex: x, ey: y, t0: w.tick, dur: Math.max(1, secs(seconds)), e, then };
    w.sfx('slide', this.x + 8, this.y);
  }

  update(w: World) {
    if (this.tw) {
      const t = Math.min(1, (w.tick - this.tw.t0) / this.tw.dur);
      const k = ease[this.tw.e](t);
      this.x = this.tw.sx + (this.tw.ex - this.tw.sx) * k;
      this.y = this.tw.sy + (this.tw.ey - this.tw.sy) * k;
      if (t >= 1) {
        const then = this.tw.then;
        this.tw = null;
        then?.(w);
      }
    }
    if (this.follow) {
      const p = this.follow();
      this.x = p.x;
      this.y = p.y;
    }
    if (w.state === 'won' && w.winVia === 'door') this.openT = Math.min(1, this.openT + DT * 5);
    this.glowPhase += DT;
  }

  draw(ctx: Ctx, w: World) {
    if (this.hidden) return;
    const th = THEMES[w.city];
    const revealed = this.fake && w.state === 'dead' && w.deathCause === 'fake exit';
    const glow = 0.6 + Math.sin(this.glowPhase * 4) * 0.4;
    drawDoor(ctx, this.x, this.y, th, revealed ? 1 : this.openT, glow, revealed);
    if (revealed) {
      // the "door" was a mouth full of spikes
      ctx.fillStyle = th.spike;
      ctx.strokeStyle = th.spikeEdge;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + 2 + i * 4, this.y + 2);
        ctx.lineTo(this.x + 4 + i * 4, this.y + 9);
        ctx.lineTo(this.x + 6 + i * 4, this.y + 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x + 2 + i * 4, this.y + 32);
        ctx.lineTo(this.x + 4 + i * 4, this.y + 25);
        ctx.lineTo(this.x + 6 + i * 4, this.y + 32);
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}
