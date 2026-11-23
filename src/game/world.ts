import { Actor, Collider, Solid } from './body';
import { bi, EN_DELAY, EN_HOLD } from './bi';
import { CityId, COLS, DT, overlapXYWH, PHYS, Rect, ROOM_H, ROOM_PHYS, ROOM_W, ROWS, secs, TILE } from './constants';
import { Player, type Climbable, type SeaZone } from './player';

export type RivalVariant = 'tara' | 'bandar' | 'none';
export type CharacterId = 'papa' | 'mummy';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean;
}
export const NO_INPUT: InputState = { left: false, right: false, jump: false, jumpPressed: false };

export interface AttemptInfo {
  attempt: number;
  deaths: number;
  justDied: boolean;
  lastCause?: string;
  rival: RivalVariant;
  character: CharacterId;
}

export interface LevelDef {
  id: string;
  city: CityId;
  index: number;
  name: string;
  /** English meaning when the name is in a local language */
  nameEn?: string;
  tagline?: string;
  hint: string;
  map: string[];
  build?: (w: World) => void;
  /** seconds; the time the designer clears it in (shown as a target) */
  par?: number;
  /** a famous place elsewhere in the same state gets its own backdrop (the map still shows the capital) */
  scene?: SceneDef;
  /** caves: only a pool of light around Dad */
  dark?: boolean;
  /** long stages: the troll sections after the original room (for tests and tools) */
  parts?: { kind: string; x0: number; id: number; letters: string; spikes: string }[];
  /** long stages: how wide the original room is, and where the door ended up */
  coreCols?: number;
  doorX?: number;
  /** long stages: the kind of surprise at the door */
  ending?: string;
  /** a one-screen room of the new game: room physics, and Dad dies the moment he drops out of the frame */
  room?: boolean;
}

/**
 * The part of a room's 32x18 grid that is on screen: columns 3..28 and rows 5..16 (the
 * floor top is row 14). Dad can't leave it sideways, and dropping out of it is a death.
 * 26 x 12 tiles fills a modern phone edge to edge and keeps Dad big (about 28 px tall).
 */
export const ROOM_FRAME = { x: 3 * TILE, y: 5 * TILE, w: 26 * TILE, h: 12 * TILE };

export type SceneKind = 'hills' | 'water' | 'rock' | 'falls' | 'night' | 'cave' | 'market' | 'filmset';
export interface SceneDef {
  kind: SceneKind;
  /** shown small on the stage card, never on the map */
  place: string;
  sky?: [string, string, string];
  /** extra features for the backdrop: nets, houseboats, bridge, lighthouse, plane, ropeway, submarine, fort, boulders, canyon, train, palace, fireworks, bangles, garlands */
  with?: string[];
}

export abstract class Entity {
  layer = 0;
  alive = true;
  update(_w: World): void {}
  draw(_ctx: CanvasRenderingContext2D, _w: World): void {}
}

export interface Hazard {
  active: boolean;
  cause: string;
  hits(x: number, y: number, w: number, h: number): boolean;
}

export interface ExitLike {
  zone(): Rect | null;
  reach(w: World): void;
}

export interface WorldEvent {
  type: string;
  x: number;
  y: number;
  data?: any;
}

interface Watch {
  pred: (w: World) => boolean;
  fn: (w: World) => void;
  once: boolean;
  prev: boolean;
  done: boolean;
}

export const TT = {
  EMPTY: 0,
  SOLID: 1,
  WET: 2,
  ONEWAY: 3,
  SPIKE_UP: 4,
  SPIKE_DOWN: 5,
  SPIKE_LEFT: 6,
  SPIKE_RIGHT: 7,
} as const;

export interface Bubble {
  text: string;
  x: number;
  y: number;
  until: number;
  start: number;
  tone: 'rival' | 'npc' | 'sign';
  follow?: () => { x: number; y: number };
}

export class World implements Collider {
  readonly level: LevelDef;
  readonly city: CityId;
  /** who is playing and how it went so far (replaced after a checkpoint replay) */
  info: AttemptInfo;
  /** level size: maps can be wider than one screen (the camera follows Dad) */
  cols = COLS;
  W = ROOM_W;
  tiles = new Uint8Array(COLS * ROWS);
  /** solid tiles that a prop draws instead of the tile renderer ('%') */
  hiddenTiles = new Uint8Array(COLS * ROWS);
  /** letters of dynamic group tiles before they were lifted out of the grid */
  groupCells = new Map<string, [number, number][]>();
  hiddenSpikeCells = new Map<string, [number, number][]>();
  markers = new Map<string, { tx: number; ty: number; x: number; y: number }>();
  spawn = { x: 0, y: 0 };
  exitCell: { tx: number; ty: number } | null = null;

  solids: Solid[] = [];
  actors: Actor[] = [];
  entities: Entity[] = [];
  hazards: Hazard[] = [];
  exits: ExitLike[] = [];
  bubbles: Bubble[] = [];
  private watches: Watch[] = [];
  private timers: { at: number; fn: () => void }[] = [];

  player: Player;
  tick = 0;
  input: InputState = { ...NO_INPUT };
  events: WorldEvent[] = [];
  state: 'play' | 'dead' | 'won' = 'play';
  deathCause = '';
  deathTick = -1;
  winTick = -1;
  winVia = 'door';
  flags: Record<string, any> = {};
  /** left/right are swapped until this tick (a troll: 'ulta' controls) */
  flipUntil = -1;
  /** hidden checkpoints (world x, px), and how many Dad has passed on his feet */
  checkpoints: number[] = [];
  cp = -1;
  /** lines Tara will say one after another (tours), each once the last has been read */
  talkQueue: string[] = [];
  private tickers: ((w: World) => void)[] = [];
  /** swimmable sea (not deadly), palms to climb, walls to kick off */
  seas: SeaZone[] = [];
  climbables: Climbable[] = [];
  kicks: Rect[] = [];
  /** Dad's long-lost twins: they get the same buttons */
  twins: Player[] = [];
  /** falling past this (his top, px) is a death */
  killY = ROOM_H + 24;
  /** the walls at the sides (px): the map's edges, or a room's frame */
  minX = 0;
  maxX = ROOM_W;

  /** the sea Dad's in (his feet a little under its surface), if any */
  seaAt(a: Actor): SeaZone | null {
    if (!this.seas.length) return null;
    const cx = a.x + a.w / 2,
      feet = a.y + a.h;
    for (const s of this.seas) if (cx >= s.x0 && cx < s.x1 && feet > s.top + 6 && a.y < s.bottom) return s;
    return null;
  }

  /** is the wall face at column x (px), from y down h px, one you can kick off? */
  kickAt(x: number, y: number, h: number): boolean {
    for (const r of this.kicks) if (x >= r.x - 1 && x <= r.x + r.w && y + h > r.y && y < r.y + r.h) return true;
    return false;
  }

  /** add a twin at (x, y): he gets Dad's buttons every tick */
  addTwin(x: number, y: number): Player {
    const t = new Player(x, y);
    t.twin = true;
    this.twins.push(t);
    this.actors.push(t);
    return t;
  }

  /** Run a check every simulation tick (after entities move, before the player). */
  onTick(fn: (w: World) => void) {
    this.tickers.push(fn);
  }
  /** set by the level when the rival's trap got outsmarted */
  rivalBeaten = false;

  constructor(level: LevelDef, info: AttemptInfo) {
    this.level = level;
    this.city = level.city;
    this.info = info;
    this.parse(level.map);
    this.player = new Player(this.spawn.x, this.spawn.y);
    if (level.room) {
      this.player.phys = ROOM_PHYS;
      this.killY = ROOM_FRAME.y + ROOM_FRAME.h;
      this.minX = ROOM_FRAME.x;
      this.maxX = ROOM_FRAME.x + ROOM_FRAME.w;
    }
    this.actors.push(this.player);
  }

  // ---------------------------------------------------------------- parsing
  private parse(map: string[]) {
    if (map.length !== ROWS) throw new Error(`${this.level.id}: map needs ${ROWS} rows, has ${map.length}`);
    const cols = map[0].length;
    if (cols < COLS) throw new Error(`${this.level.id}: map needs at least ${COLS} cols, has ${cols}`);
    this.cols = cols;
    this.W = cols * TILE;
    this.maxX = this.W;
    this.tiles = new Uint8Array(cols * ROWS);
    this.hiddenTiles = new Uint8Array(cols * ROWS);
    let spawnFound = false;
    for (let ty = 0; ty < ROWS; ty++) {
      const row = map[ty];
      if (row.length !== cols) throw new Error(`${this.level.id}: row ${ty} has ${row.length} cols, not ${cols}`);
      for (let tx = 0; tx < cols; tx++) {
        const c = row[tx];
        let t: number = TT.EMPTY;
        if (c === '#') t = TT.SOLID;
        else if (c === '%') {
          t = TT.SOLID;
          this.hiddenTiles[ty * cols + tx] = 1;
        }
        else if (c === '~') t = TT.WET;
        else if (c === '=') t = TT.ONEWAY;
        else if (c === '^') t = TT.SPIKE_UP;
        else if (c === 'v') t = TT.SPIKE_DOWN;
        else if (c === '<') t = TT.SPIKE_LEFT;
        else if (c === '>') t = TT.SPIKE_RIGHT;
        else if (c === '@') {
          this.spawn = { x: tx * TILE + (TILE - PHYS.width) / 2, y: (ty + 1) * TILE - PHYS.height };
          spawnFound = true;
        } else if (c === 'E') this.exitCell = { tx, ty };
        else if (c >= 'a' && c <= 'z') {
          if (!this.groupCells.has(c)) this.groupCells.set(c, []);
          this.groupCells.get(c)!.push([tx, ty]);
        } else if (c >= 'A' && c <= 'Z') {
          if (!this.hiddenSpikeCells.has(c)) this.hiddenSpikeCells.set(c, []);
          this.hiddenSpikeCells.get(c)!.push([tx, ty]);
        } else if (c >= '0' && c <= '9') {
          this.markers.set(c, { tx, ty, x: tx * TILE, y: ty * TILE });
        } else if (c !== '.' && c !== ' ') throw new Error(`${this.level.id}: unknown tile '${c}'`);
        this.tiles[ty * cols + tx] = t;
      }
    }
    if (!spawnFound) throw new Error(`${this.level.id}: no spawn '@'`);
  }

  tileAt(tx: number, ty: number): number {
    if (tx < 0 || tx >= this.cols || ty < 0 || ty >= ROWS) return TT.EMPTY;
    return this.tiles[ty * this.cols + tx];
  }
  isSolidTile(t: number) {
    return t === TT.SOLID || t === TT.WET;
  }

  // -------------------------------------------------------------- collision
  solidAt(x: number, y: number, w: number, h: number): Solid | true | null {
    if (x < this.minX || x + w > this.maxX || y < 0) return true;
    const tx0 = Math.floor(x / TILE),
      tx1 = Math.floor((x + w - 1) / TILE);
    const ty0 = Math.floor(y / TILE),
      ty1 = Math.floor((y + h - 1) / TILE);
    for (let ty = ty0; ty <= ty1; ty++) {
      if (ty < 0 || ty >= ROWS) continue;
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = this.tiles[ty * this.cols + tx];
        if (t === TT.SOLID || t === TT.WET) return true;
      }
    }
    for (const s of this.solids) {
      if (s.collidable && !s.oneWay && s.overlaps(x, y, w, h)) return s;
    }
    return null;
  }

  oneWayTopAt(x: number, bottom: number, w: number): boolean {
    if (bottom % TILE === 0) {
      const ty = bottom / TILE;
      if (ty >= 0 && ty < ROWS) {
        const tx0 = Math.floor(x / TILE),
          tx1 = Math.floor((x + w - 1) / TILE);
        for (let tx = tx0; tx <= tx1; tx++) if (this.tileAt(tx, ty) === TT.ONEWAY) return true;
      }
    }
    for (const s of this.solids) {
      if (!s.collidable || !s.oneWay) continue;
      for (const top of s.topsUnder(x, w)) if (top === bottom) return true;
    }
    return false;
  }

  /** What is directly under an actor's feet. */
  /** the ceiling Dad stands on while gravity is flipped (tiles and solids right above his head) */
  groundAbove(a: Actor): { on: boolean; solid: Solid | null; slippery: boolean; sticky?: boolean } {
    let on = false;
    let solid: Solid | null = null;
    if (a.y <= 0) return { on: false, solid: null, slippery: false };
    if (a.y % TILE === 0) {
      const ty = a.y / TILE - 1;
      for (let tx = Math.floor(a.x / TILE); tx <= Math.floor((a.x + a.w - 1) / TILE); tx++) if (this.tileAt(tx, ty) === TT.SOLID) on = true;
    }
    for (const s of this.solids) {
      if (!s.collidable || s.oneWay) continue;
      if (s.y + s.h === a.y && a.x + a.w > s.x && a.x < s.x + s.w) {
        on = true;
        solid = s;
      }
    }
    return { on, solid, slippery: false };
  }

  groundUnder(a: Actor): { on: boolean; solid: Solid | null; slippery: boolean; sticky?: boolean } {
    let on = false,
      slippery = false,
      sticky = false,
      solid: Solid | null = null;
    const by = a.y + a.h;
    if (by >= ROOM_H) return { on: false, solid: null, slippery: false };
    if (by % TILE === 0) {
      const ty = by / TILE;
      const tx0 = Math.floor(a.x / TILE),
        tx1 = Math.floor((a.x + a.w - 1) / TILE);
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = this.tileAt(tx, ty);
        if (t === TT.SOLID || t === TT.ONEWAY) on = true;
        if (t === TT.WET) {
          on = true;
          slippery = true;
        }
      }
    }
    for (const s of this.solids) {
      if (!s.collidable) continue;
      if (a.isRiding(s)) {
        on = true;
        if (!solid) solid = s;
        if (s.slippery) slippery = true;
        if (s.sticky) sticky = true;
      }
    }
    return { on, solid, slippery, sticky };
  }

  standing(s: Solid): boolean {
    const p = this.player;
    return this.state === 'play' && !p.hidden && p.onGround && s.collidable && p.isRiding(s);
  }

  // --------------------------------------------------------------- building
  add<T extends Entity>(e: T): T {
    this.entities.push(e);
    const anyE = e as any;
    if (anyE.solid instanceof Solid) this.solids.push(anyE.solid);
    if (Array.isArray(anyE.solids)) for (const s of anyE.solids) this.solids.push(s);
    if (anyE.hazard) this.hazards.push(anyE.hazard);
    if (anyE.exit) this.exits.push(anyE.exit);
    this.entities.sort((a, b) => a.layer - b.layer);
    return e;
  }

  marker(ch: string) {
    const m = this.markers.get(ch);
    if (!m) throw new Error(`${this.level.id}: marker '${ch}' missing`);
    return m;
  }

  when(pred: (w: World) => boolean, fn: (w: World) => void, once = true) {
    this.watches.push({ pred, fn, once, prev: false, done: false });
  }

  /** Fires when the player's box enters a tile-space rectangle. */
  enter(tx: number, ty: number, tw: number, th: number, fn: (w: World) => void, once = true) {
    const r = { x: tx * TILE, y: ty * TILE, w: tw * TILE, h: th * TILE };
    this.when((w) => w.playerIn(r), fn, once);
  }

  playerIn(r: Rect): boolean {
    const p = this.player;
    return this.state === 'play' && overlapXYWH(p.x, p.y, p.w, p.h, r);
  }

  after(seconds: number, fn: () => void) {
    this.timers.push({ at: this.tick + Math.max(1, secs(seconds)), fn });
  }

  say(text: string, x: number, y: number, seconds = 2.2, tone: Bubble['tone'] = 'rival', follow?: Bubble['follow']) {
    // a line with an English meaning stays up long enough to read both
    if (bi(text).en) seconds = Math.max(seconds, EN_DELAY + EN_HOLD);
    // and long enough to actually read: about a word every quarter second
    seconds = Math.max(seconds, Math.min(tone === 'npc' ? 4.5 : 6.5, (tone === 'npc' ? 0.9 : 1.3) + text.length * 0.045));
    // Tara (or the signpost) says one thing at a time, in her card by Dad (with a pop, so you look)
    if (tone !== 'npc') {
      this.bubbles = this.bubbles.filter((b) => b.tone === 'npc');
      this.emit('sfx', x, y, 'pop');
    }
    this.bubbles = this.bubbles.filter((b) => !(b.tone === tone && (follow ? b.follow === follow : Math.abs(b.x - x) < 24 && Math.abs(b.y - y) < 24)));
    this.bubbles.push({ text, x, y, start: this.tick, until: this.tick + secs(seconds), tone, follow });
  }

  /** queue a line for Tara (tours, chatty stages): she says it as soon as she's done talking */
  guide(line: string, stillTrue?: (w: World) => boolean) {
    this.talkQueue.push(line);
    if (stillTrue) this.talkIf.set(line, stillTrue);
  }
  /** queued lines that only make sense for a while: dropped, unsaid, once this says they're stale */
  talkIf = new Map<string, (w: World) => boolean>();

  /** is Tara (or the signpost) in the middle of saying something? */
  get talking() {
    return this.bubbles.some((b) => b.tone !== 'npc' && b.until > this.tick + 6);
  }

  /** move Dad somewhere else in the stage at once (after a train ride): the screen fades over it.
   *  'blink' is a quick cut with no train sound (sent back, teleported, rewound) */
  warp(x: number, y: number, how: 'train' | 'blink' = 'train') {
    const p = this.player;
    p.x = Math.round(x);
    p.y = Math.round(y);
    p.vx = 0;
    p.vy = 0;
    p.carryVx = 0;
    this.emit('warp', p.cx, p.cy, { how });
  }

  emit(type: string, x = this.player.cx, y = this.player.cy, data?: any) {
    this.events.push({ type, x, y, data });
  }
  sfx(name: string, x?: number, y?: number) {
    this.emit('sfx', x, y, name);
  }

  // ------------------------------------------------------------------ state
  die(cause: string, who: Player = this.player) {
    if (this.state !== 'play') return;
    this.state = 'dead';
    this.deathCause = cause;
    this.deathTick = this.tick;
    this.player.dead = true;
    who.dead = true;
    this.emit('die', who.cx, who.cy, { cause, vx: who.vx, vy: who.vy, twin: who.twin });
  }

  win(via = 'door') {
    if (this.state !== 'play') return;
    this.state = 'won';
    this.winTick = this.tick;
    this.winVia = via;
    this.emit('win', this.player.cx, this.player.cy, { via });
  }

  get seconds() {
    return this.tick * DT;
  }

  /** Swap left and right for a while. Announced with a bubble and an 'ulta' sound. */
  flipControls(seconds: number) {
    this.flipUntil = this.tick + Math.round(seconds * 120);
    this.emit('flip', this.player.cx, this.player.y, { seconds });
  }

  get flipped() {
    return this.tick < this.flipUntil;
  }

  step(input: InputState) {
    this.input = this.state === 'play' ? input : { ...NO_INPUT };
    if (this.tick < this.flipUntil && this.state === 'play') this.input = { ...this.input, left: this.input.right, right: this.input.left };
    this.tick++;
    for (const s of this.solids) {
      s.lastDx = 0;
      s.lastDy = 0;
    }
    if (this.timers.length) {
      const due = this.timers.filter((t) => t.at <= this.tick);
      if (due.length) {
        this.timers = this.timers.filter((t) => t.at > this.tick);
        for (const t of due) t.fn();
      }
    }
    for (const e of this.entities) if (e.alive) e.update(this);
    if (this.state === 'play') for (const fn of this.tickers) fn(this);
    if (this.state === 'play') {
      const p = this.player;
      p.update(this, this.input);
      for (const t of this.twins) if (!t.dead && !t.hidden && this.state === 'play') t.update(this, t.mirror ? { ...this.input, left: this.input.right, right: this.input.left } : this.input);
      if (p.squishAxis) this.die('crushed');
      else if (p.y > this.killY || (p.gsign < 0 && p.y <= 0)) this.die('fell');
      else {
        for (const h of p.hidden ? [] : this.hazards) {
          if (h.active && h.hits(p.x, p.y, p.w, p.h)) {
            this.die(h.cause);
            break;
          }
        }
        if (this.state === 'play') this.checkStaticSpikes();
      }
      // the twins face the same dangers (and losing one is losing the take)
      for (const t of this.twins) {
        if (this.state !== 'play' || t.dead || t.hidden) continue;
        let cause = t.squishAxis ? 'crushed' : t.y > this.killY ? 'fell' : '';
        if (!cause) for (const h of this.hazards) if (h.active && h.hits(t.x, t.y, t.w, t.h)) cause = h.cause;
        if (!cause && this.spikesAt(t)) cause = 'spikes';
        if (cause) this.die(cause, t);
      }
      if (this.state === 'play') {
        for (const w of this.watches) {
          if (w.done) continue;
          const v = w.pred(this);
          if (v && !w.prev) {
            w.fn(this);
            if (w.once) w.done = true;
          }
          w.prev = v;
          if (this.state !== 'play') break;
        }
      }
      // hidden checkpoints: passed on your feet, never shown
      if (this.state === 'play' && p.onGround) while (this.cp + 1 < this.checkpoints.length && p.cx >= this.checkpoints[this.cp + 1]) this.cp++;
      if (this.state === 'play') {
        for (const ex of this.exits) {
          const z = ex.zone();
          if (z && overlapXYWH(p.x, p.y, p.w, p.h, z)) {
            ex.reach(this);
            break;
          }
        }
      }
    }
    if (this.bubbles.length) this.bubbles = this.bubbles.filter((b) => b.until > this.tick);
  }

  private checkStaticSpikes() {
    if (this.spikesAt(this.player)) this.die('spikes');
  }

  /** is this actor touching a spike tile's sharp half? */
  spikesAt(p: Actor): boolean {
    const tx0 = Math.floor(p.x / TILE),
      tx1 = Math.floor((p.x + p.w - 1) / TILE);
    const ty0 = Math.floor(p.y / TILE),
      ty1 = Math.floor((p.y + p.h - 1) / TILE);
    for (let ty = ty0; ty <= ty1; ty++)
      for (let tx = tx0; tx <= tx1; tx++) {
        const t = this.tileAt(tx, ty);
        if (t < TT.SPIKE_UP) continue;
        const r = spikeHitbox(t, tx * TILE, ty * TILE);
        if (overlapXYWH(p.x, p.y, p.w, p.h, r)) return true;
      }
    return false;
  }
}

/** Spikes only hurt in their solid half, so grazing a tip never kills. */
export function spikeHitbox(t: number, x: number, y: number): Rect {
  switch (t) {
    case TT.SPIKE_UP:
      return { x: x + 2, y: y + 8, w: 12, h: 8 };
    case TT.SPIKE_DOWN:
      return { x: x + 2, y, w: 12, h: 8 };
    case TT.SPIKE_LEFT:
      return { x: x + 8, y: y + 2, w: 8, h: 12 };
    default:
      return { x, y: y + 2, w: 8, h: 12 };
  }
}
