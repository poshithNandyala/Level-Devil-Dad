// Bengaluru's own life.
import { Entity, type World } from '../../world';
import { Solid } from '../../body';
import { DT, TILE } from '../../constants';

/**
 * India's Silicon Valley builds a smart walkway over the dug-up road, and it behaves like every progress
 * bar in town: it loads a tile at a time when you step up to it, sticks at 99% (the last tile never comes),
 * and a moment later it restarts from nothing, with whoever was waiting on it. Walk behind the loading
 * edge, and jump the last tile while it's stuck at 99%.
 */
export class LoadingBridge extends Entity {
  /** the first tile's left edge, the walkway's top, and its length in tiles */
  readonly x0: number;
  readonly top: number;
  readonly n: number;
  state: 'idle' | 'loading' | 'stalled' | 'reboot' | 'off' = 'idle';
  loaded = 0;
  private t = 0;
  readonly solid: Solid;
  static readonly STEP = 0.35;
  static readonly STALL = 2.2;
  static readonly DOWN = 0.9;

  constructor(o: { tx: number; ty: number; n: number }) {
    super();
    this.layer = 1;
    this.x0 = o.tx * TILE;
    this.top = o.ty * TILE;
    this.n = o.n;
    this.solid = new Solid(this.x0, this.top, 0, 6);
    this.solid.collidable = false;
  }

  static place(w: World, o: ConstructorParameters<typeof LoadingBridge>[0]): LoadingBridge {
    return w.add(new LoadingBridge(o));
  }

  get percent() {
    if (this.state === 'stalled') return 99;
    return Math.round((this.loaded / this.n) * 100);
  }

  private setLoaded(k: number) {
    this.loaded = k;
    this.solid.w = k * TILE;
    this.solid.collidable = k > 0;
  }

  update(w: World) {
    this.t++;
    const s = this.t * DT;
    const p = w.player;
    w.flags.bridge = this.state;
    if (this.state === 'idle') {
      // it wakes when someone steps up to the edge (and stops for good once they're across)
      if (p.x > this.x0 + this.n * TILE) this.state = 'off';
      else if (w.state === 'play' && p.x + p.w >= this.x0 - 10 && p.x < this.x0 + 4) {
        this.state = 'loading';
        this.t = 0;
        w.say('Swalpa wait maadi! | Wait a little!', this.x0 + (this.n * TILE) / 2, this.top - 70, 1.6, 'npc');
      }
    } else if (this.state === 'loading') {
      const want = Math.min(this.n - 1, Math.floor(s / LoadingBridge.STEP) + 1);
      if (want > this.loaded) {
        this.setLoaded(want);
        w.sfx('blink', this.x0 + want * TILE, this.top);
      }
      if (this.loaded >= this.n - 1 && s >= (this.n - 1) * LoadingBridge.STEP) {
        this.state = 'stalled';
        this.t = 0;
      }
    } else if (this.state === 'stalled') {
      if (p.x > this.x0 + this.n * TILE && p.onGround) {
        this.state = 'off';
      } else if (s >= LoadingBridge.STALL) {
        this.state = 'reboot';
        this.t = 0;
        this.setLoaded(0);
        w.sfx('collapse', this.x0 + (this.n * TILE) / 2, this.top);
        w.say('Ayyo! Restart aaytu! | Oh no! It restarted!', this.x0 + (this.n * TILE) / 2, this.top - 70, 1.6, 'npc');
      }
    } else if (this.state === 'reboot') {
      if (s >= LoadingBridge.DOWN) {
        this.state = 'idle';
        this.t = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    const x0 = this.x0,
      top = this.top,
      L = this.n * TILE;
    // the loaded tiles: glowing glass panels with a scan line
    for (let i = 0; i < this.loaded; i++) {
      const x = x0 + i * TILE;
      ctx.fillStyle = 'rgba(90,220,255,0.55)';
      ctx.fillRect(x + 0.5, top, TILE - 1, 6);
      ctx.strokeStyle = 'rgba(200,250,255,0.9)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, top + 0.5, TILE - 1, 5);
    }
    if (this.state === 'loading' || this.state === 'stalled') {
      // the tile that's "loading": a blinking outline
      const i = this.loaded;
      if (i < this.n && Math.floor(w.tick / 15) % 2 === 0) {
        ctx.strokeStyle = 'rgba(200,250,255,0.6)';
        ctx.setLineDash([2, 2]);
        ctx.strokeRect(x0 + i * TILE + 0.5, top + 0.5, TILE - 1, 5);
        ctx.setLineDash([]);
      }
    }
    // the sign on its post: SMART BRIDGE and the progress bar
    const sx = x0 + L / 2 - 34,
      sy = top - 52;
    ctx.fillStyle = '#5A6472';
    ctx.fillRect(x0 - 6, sy + 18, 2.5, top - sy - 18);
    ctx.fillStyle = '#1D2733';
    ctx.fillRect(sx, sy, 68, 24);
    ctx.strokeStyle = '#9AD7FF';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx + 0.5, sy + 0.5, 67, 23);
    ctx.fillStyle = '#E6F6FF';
    ctx.font = 'bold 6px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SMART BRIDGE', sx + 34, sy + 8);
    ctx.strokeStyle = '#9AD7FF';
    ctx.strokeRect(sx + 6.5, sy + 12.5, 44, 6);
    const pc = this.state === 'reboot' ? 0 : this.percent / 100;
    ctx.fillStyle = this.state === 'stalled' && Math.floor(w.tick / 20) % 2 === 0 ? '#FFD166' : '#5AD7FF';
    ctx.fillRect(sx + 7.5, sy + 13.5, 42 * pc, 4);
    ctx.fillStyle = '#E6F6FF';
    ctx.font = 'bold 5px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.state === 'reboot' ? 'ERR' : `${this.percent}%`, sx + 53, sy + 18);
  }
}
