import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { CharacterId, RivalVariant } from '../game/world';

export interface Settings {
  sfx: boolean;
  sfxVol: number;
  music: boolean;
  musicVol: number;
  vibration: boolean;
  shake: boolean;
  reducedMotion: boolean;
  btnSize: 'S' | 'M' | 'L' | 'XL';
  btnOpacity: number;
  swap: boolean;
  showTimer: boolean;
  character: CharacterId;
  rival: RivalVariant;
  hd: boolean;
}

export interface StageRec {
  cleared: boolean;
  best: number | null;
  bestDeaths: number | null;
  deaths: number;
  firstClearDeaths: number | null;
  attempts: number;
  clears: number;
  hint: boolean;
  /** found the stage's hidden item */
  got?: boolean;
}

export interface LogEvent {
  t: number; // epoch ms
  e: string;
  id?: string;
  d?: Record<string, number | string | boolean>;
}

export interface Save {
  v: 1;
  savedAt: number;
  settings: Settings;
  stages: Record<string, StageRec>;
  stamps: Record<string, number>;
  seenControls: boolean;
  totalDeaths: number;
  sessions: number;
  log: LogEvent[];
}

export const DEFAULT_SETTINGS: Settings = {
  sfx: true,
  sfxVol: 0.8,
  music: true,
  musicVol: 0.5,
  vibration: true,
  shake: true,
  reducedMotion: false,
  btnSize: 'M',
  btnOpacity: 0.35,
  swap: false,
  showTimer: true,
  character: 'papa',
  rival: 'tara',
  hd: false,
};

const KEY = 'ldd.save.v1';
const LOG_CAP = 3000;

export function emptyStage(): StageRec {
  return { cleared: false, best: null, bestDeaths: null, deaths: 0, firstClearDeaths: null, attempts: 0, clears: 0, hint: false };
}

function fresh(): Save {
  return { v: 1, savedAt: Date.now(), settings: { ...DEFAULT_SETTINGS }, stages: {}, stamps: {}, seenControls: false, totalDeaths: 0, sessions: 0, log: [] };
}

function parse(raw: string | null): Save | null {
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (!s || s.v !== 1) return null;
    const f = fresh();
    return { ...f, ...s, settings: { ...DEFAULT_SETTINGS, ...(s.settings ?? {}) }, stages: s.stages ?? {}, stamps: s.stamps ?? {}, log: Array.isArray(s.log) ? s.log : [] };
  } catch {
    return null;
  }
}

/**
 * Auto-saving progress. localStorage everywhere (wrapped, since some
 * embedded browsers throw), mirrored to Capacitor Preferences on phones,
 * where the OS may otherwise clear web storage.
 */
export class Store {
  data: Save = fresh();
  private timer: number | null = null;
  private memoryOnly = false;
  readonly native = Capacitor.isNativePlatform();

  async load() {
    let local: Save | null = null;
    try {
      local = parse(localStorage.getItem(KEY));
    } catch {
      this.memoryOnly = true;
    }
    let nat: Save | null = null;
    if (this.native) {
      try {
        nat = parse((await Preferences.get({ key: KEY })).value);
      } catch {
        /* ignore */
      }
    }
    const pick = [local, nat].filter(Boolean).sort((a, b) => b!.savedAt - a!.savedAt)[0];
    this.data = pick ?? fresh();
    this.data.sessions++;
    this.save(true);
  }

  stage(id: string): StageRec {
    if (!this.data.stages[id]) this.data.stages[id] = emptyStage();
    return this.data.stages[id];
  }

  log(e: string, id?: string, d?: LogEvent['d']) {
    this.data.log.push({ t: Date.now(), e, id, d });
    if (this.data.log.length > LOG_CAP) this.data.log.splice(0, this.data.log.length - LOG_CAP);
    this.save();
  }

  save(now = false) {
    this.data.savedAt = Date.now();
    if (this.timer !== null) clearTimeout(this.timer);
    const write = () => {
      this.timer = null;
      const raw = JSON.stringify(this.data);
      if (!this.memoryOnly) {
        try {
          localStorage.setItem(KEY, raw);
        } catch {
          this.memoryOnly = true;
        }
      }
      if (this.native) Preferences.set({ key: KEY, value: raw }).catch(() => {});
    };
    if (now) write();
    else this.timer = window.setTimeout(write, 400);
  }

  reset() {
    const keep = this.data.settings;
    this.data = fresh();
    this.data.settings = keep;
    this.save(true);
  }

  get persistent() {
    return !this.memoryOnly;
  }
}
