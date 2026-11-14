import { DT, secs } from '../game/constants';
import { AttemptInfo, InputState, LevelDef, NO_INPUT, World } from '../game/world';
import { CheckpointSave, encodeInput, probeSafe, replay } from '../game/replay';
import { Rival } from '../game/entities/props';
import type { App } from './app';

export interface Challenge {
  id: string;
  t?: number; // friend's best clear (seconds)
  d?: number; // friend's deaths
}

const RESPAWN_TICKS = secs(0.36);
/** lives per run: the 7th death wipes the hidden checkpoints and sends Dad back to the start */
export const LIVES = 7;
const WIN_TICKS = secs(0.75);

import { LINES } from '../game/cities';

/** death quips when no rival is on screen: every city's LINES[city].death (new cities need nothing here) */
export const QUIPS: Record<string, string[]> = Object.fromEntries(Object.entries(LINES).map(([city, l]) => [city, l.death]));

/** One visit to one stage: attempts, deaths, the instant-retry loop. */
export class Session {
  app: App;
  def: LevelDef;
  world!: World;
  attempt = 0;
  deaths = 0;
  restarts = 0;
  paused = false;
  private saidNear = false;
  done = false;
  challenge: Challenge | null;
  private deadTicks = 0;
  private wonTicks = 0;
  private lastQuip = -1;
  hintUsed = false;
  lastTime: number | null = null;
  /** inputs of this attempt so far (from its true start, replayed part included) */
  private rec: number[] = [];
  /** the info the current world was first built with (a replay keeps the original's) */
  private baseInfo!: AttemptInfo;
  /** hidden checkpoints passed in this visit, oldest first */
  private saves: CheckpointSave[] = [];
  /** which checkpoint the current attempt came back to, and when */
  private backAt: CheckpointSave | null = null;
  private backTick = 0;
  /** lives left in this run (shown at the top); 0 means the next spawn starts over */
  lives = LIVES;
  /** how many times the 7th death sent Dad back to the start */
  wipes = 0;

  constructor(app: App, def: LevelDef, challenge: Challenge | null) {
    this.app = app;
    this.def = def;
    this.challenge = challenge;
    this.spawn(false);
  }

  spawn(justDied: boolean, cause?: string) {
    this.attempt++;
    const s = this.app.store.data.settings;
    const info: AttemptInfo = {
      attempt: this.attempt,
      deaths: this.deaths,
      justDied,
      lastCause: cause,
      rival: s.rival,
      character: s.character,
    };
    // a death within a second of coming back to a checkpoint counts against it; twice and it's dropped
    if (justDied && this.backAt && this.world.state === 'dead' && this.world.deathTick - this.backTick < 144) {
      this.backAt.quick = (this.backAt.quick ?? 0) + 1;
      if (this.backAt.quick >= 2) this.backAt.safe = false;
    }
    // out of lives: the checkpoints are gone, back to the very start with a full set
    let wiped = false;
    if (justDied && this.lives <= 0) {
      wiped = true;
      this.wipes++;
      this.saves = [];
      this.backAt = null;
      this.app.store.log('wipe', this.def.id, { attempt: this.attempt, deaths: this.deaths });
    }
    if (!justDied || wiped) this.lives = LIVES;
    // the latest checkpoint that's actually safe to stand at (never a respawn straight into a death)
    let save: CheckpointSave | null = null;
    if (justDied && !wiped) for (let i = this.saves.length - 1; i >= 0 && !save; i--) if (probeSafe(this.def, this.saves[i])) save = this.saves[i];
    this.backAt = save;
    if (save) {
      // back at the last hidden checkpoint: rebuild the moment Dad passed it, then carry on
      const w = replay(this.def, save.info, save.inputs);
      w.info = info;
      const p = w.player;
      p.vx = 0;
      p.vy = 0;
      p.carryVx = 0;
      (w.entities.find((e) => e instanceof Rival) as Rival | undefined)?.greet(w);
      this.world = w;
      this.backTick = w.tick;
      this.baseInfo = save.info;
      this.rec = save.inputs.slice();
      this.app.store.log('checkpoint', this.def.id, { cp: save.cp, t: +w.seconds.toFixed(2) });
    } else {
      this.world = new World(this.def, info);
      this.def.build?.(this.world);
      this.baseInfo = info;
      this.rec = [];
      if (!justDied) this.saves = [];
    }
    this.deadTicks = 0;
    this.wonTicks = 0;
    this.app.fx.fade = justDied && !wiped ? 0.35 : 0.9;
    this.app.store.stage(this.def.id).attempts++;
    this.app.hud?.refresh(true);
  }

  restart() {
    if (this.done) return;
    this.restarts++;
    this.app.store.log('restart', this.def.id, { attempt: this.attempt, t: +this.world.seconds.toFixed(2) });
    this.spawn(false);
  }

  get elapsed() {
    const w = this.world;
    if (w.state === 'won') return w.winTick * DT;
    if (w.state === 'dead') return w.deathTick * DT;
    return w.tick * DT;
  }

  tick(input: InputState) {
    if (this.paused || this.done) return;
    const w = this.world;
    const cp = w.cp;
    if (w.state === 'play') this.rec.push(encodeInput(input));
    w.step(w.state === 'play' ? input : NO_INPUT);
    if (w.cp > cp && w.state === 'play' && !this.saves.some((s) => s.cp === w.cp)) this.saves.push({ info: this.baseInfo, inputs: this.rec.slice(), cp: w.cp });
    this.app.handleEvents(w);
    if (w.state === 'dead') {
      if (this.deadTicks === 0) this.onDeath();
      this.deadTicks++;
      if (this.deadTicks >= RESPAWN_TICKS) this.spawn(true, w.deathCause);
    } else if (w.state === 'won') {
      this.wonTicks++;
      if (this.wonTicks === 1) this.lastTime = w.winTick * DT;
      if (this.wonTicks === secs(0.22)) {
        const z = w.exits[0]?.zone();
        this.app.irisClose(z ? z.x + z.w / 2 : w.player.cx, z ? z.y + z.h / 2 : w.player.cy);
      }
      if (this.wonTicks >= WIN_TICKS) {
        this.done = true;
        this.app.onStageClear(this);
      }
    }
  }

  private onDeath() {
    const w = this.world;
    this.deaths++;
    const store = this.app.store;
    const rec = store.stage(this.def.id);
    rec.deaths++;
    store.data.totalDeaths++;
    store.log('death', this.def.id, { attempt: this.attempt, cause: w.deathCause, x: w.player.x, y: w.player.y, t: +(w.deathTick * DT).toFixed(2) });
    this.lives = Math.max(0, this.lives - 1);
    this.app.hud?.refresh(true);
    const L = LINES[this.def.city];
    // the 7th death: Thala for a reason (the respawn starts the level over)
    if (this.lives === 0) {
      this.app.seven(L.seven);
      return;
    }
    // so close: died right next to the way out
    let near = Infinity;
    for (const ex of w.exits) {
      const z = ex.zone();
      if (!z) continue;
      near = Math.min(near, Math.hypot(w.player.cx - (z.x + z.w / 2), w.player.cy - (z.y + z.h / 2)));
    }
    if (near < 40 && !this.saidNear) {
      // (once per stage: the door endings put a lot of deaths right by the door)
      this.saidNear = true;
      this.app.nearMiss(L.near[this.deaths % L.near.length]);
      store.log('near', this.def.id, { d: Math.round(near) });
      return;
    }
    // one life left: a warning (and a little pressure)
    if (this.lives === 1) {
      this.app.quip(L.lastLife);
      return;
    }
    // a short quip now and then: first death, then every 3rd; never insulting, never every time
    const hasRival = w.entities.some((e) => (e as any).script !== undefined);
    if (!hasRival && (this.deaths === 1 || this.deaths % 3 === 0) && this.deaths !== this.lastQuip) {
      this.lastQuip = this.deaths;
      const q = QUIPS[this.def.city];
      if (q?.length) this.app.quip(q[(this.deaths * 5 + this.def.index) % q.length]);
    }
  }
}
