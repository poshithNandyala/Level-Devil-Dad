// The new game's shell: title, journey map, rooms, the fail montage and the result card.
// Wordless in play: Dad's face and the room do the talking.
import { DT, TPS } from '../game/constants';
import { InputState, NO_INPUT, World } from '../game/world';
import { Audio } from '../audio/audio';
import { Input } from '../input/input';
import { Store } from '../platform/storage';
import { buzz, initNative, exitShell, inAndroidShell } from '../platform/device';
import { h } from '../ui/dom';
import { GAME } from '../config';
import { MAP_CITY_XY, MAP_OUTLINE, MAP_VIEWBOX } from '../map/india-data';
import { DOORS, ROOM_BY_ID } from './doors';
import type { DoorDef, RoomDef } from './types';
import { RoomRenderer, roomViewport, Viewport } from './render';
import { freshRoom, HINT_AFTER, RoomSession, SKIP_AFTER } from './session';
import { Montage } from './montage';
import { ticksOf } from './script';
import { sceneFor } from './art/scenes';

type Screen = 'title' | 'map' | 'play' | 'montage' | 'result';

const ICON = {
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1.5" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.5" fill="currentColor"/></svg>',
  restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4.5h4.5"/></svg>',
  hint: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2.2h5c.1-1 .5-1.7 1.1-2.2A6 6 0 0 0 12 3z" fill="rgba(255,213,106,.35)"/></svg>',
  skip: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 5.5v13l8-6.5zM13 5.5v13l8-6.5z"/></svg>',
  sound: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  mute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg>',
  glasses: '<svg viewBox="0 0 30 16" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="8" cy="8" r="5.6" fill="rgba(210,235,255,.3)"/><circle cx="22" cy="8" r="5.6" fill="rgba(210,235,255,.3)"/><path d="M13.6 7.4c.9-.7 1.9-.7 2.8 0"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>',
};

function icon(name: keyof typeof ICON, onclick: () => void, extra = ''): HTMLElement {
  const b = h(`button.r-btn.r-icon${extra}`, { onclick, 'aria-label': name, html: ICON[name] });
  return b;
}

export class RoomApp {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  ui: HTMLElement;
  layer: HTMLElement;
  store = new Store();
  audio = new Audio();
  input = new Input();
  renderer: RoomRenderer;
  vp!: Viewport;
  screen: Screen = 'title';
  session: RoomSession | null = null;
  montage: Montage | null = null;
  /** the attract loop behind the title and the map */
  private demo: { w: World; ins: InputState[]; deadFor: number } | null = null;
  private acc = 0;
  private last = 0;
  time = 0;
  private fxShake = 0;
  private fxFlash = 0;
  private fxFade = 0;
  private hud: Hud | null = null;
  private unlocked = false;
  /** a scripted input stream (screenshots and demos) instead of the player's hands */
  scripted: InputState[] | null = null;
  private scriptAt = 0;

  constructor(root: HTMLElement) {
    this.root = root;
    this.canvas = root.querySelector('#game') as HTMLCanvasElement;
    this.ui = root.querySelector('#ui') as HTMLElement;
    this.layer = h('div.r-layer');
    this.ui.append(this.layer);
    this.renderer = new RoomRenderer(this.canvas);
  }

  async boot() {
    await this.store.load();
    const s = this.store.data.settings;
    this.audio.sfxOn = s.sfx;
    this.audio.musicOn = s.music;
    this.audio.sfxVol = s.sfxVol;
    this.audio.musicVol = s.musicVol;
    this.audio.applyVolumes();
    this.input.prefs = { size: 1, opacity: 0.4, swap: s.swap };
    this.input.attach(this.canvas, this.root);
    this.input.onPause = () => (this.screen === 'play' ? this.togglePause() : undefined);
    this.input.onRestart = () => this.session?.restart();
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      this.audio.unlock();
      this.music();
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    await initNative({
      onPause: () => {
        if (this.screen === 'play' && this.session && !this.session.paused) this.pause();
        this.audio.suspend();
      },
      onResume: () => this.audio.resume(),
      onBack: () => this.back(),
    });
    try {
      await (document as any).fonts?.load?.('700 20px "Fredoka"');
    } catch {
      /* ignore */
    }
    this.showTitle();
    requestAnimationFrame((t) => this.frame(t));
  }

  private music() {
    const d = this.session ? DOORS.find((x) => x.id === this.session!.def.door) : this.nextRoom() ? DOORS.find((x) => x.id === this.nextRoom()!.door) : DOORS[0];
    this.audio.setMusic(d?.cityId ?? 'BOM');
  }

  resize() {
    const vv = window.visualViewport;
    const W = Math.round(vv?.width ?? window.innerWidth);
    const H = Math.round(vv?.height ?? window.innerHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, this.store.data.settings.hd ? 3 : 2.5);
    const probe = document.getElementById('safe-probe');
    const cs = probe ? getComputedStyle(probe) : null;
    const n = (v?: string) => parseFloat(v ?? '') || 0;
    const safe = { l: n(cs?.paddingLeft), r: n(cs?.paddingRight), t: n(cs?.paddingTop), b: n(cs?.paddingBottom) };
    this.vp = roomViewport(W, H, dpr, safe);
    this.renderer.resize(this.vp);
    this.input.layoutFor({ W, H, dpr, s: this.vp.s, ox: this.vp.ox, oy: this.vp.oy, safe });
  }

  // ------------------------------------------------------------ progress
  rec(id: string) {
    return this.store.stage(id);
  }
  skipped(id: string) {
    return !!this.store.data.stamps[`skip:${id}`];
  }
  passed(id: string) {
    return this.rec(id).cleared || this.skipped(id);
  }
  doorOpen(i: number): boolean {
    return i === 0 || DOORS[i - 1].rooms.every((r) => this.passed(r.id));
  }
  roomOpen(r: RoomDef): boolean {
    const di = DOORS.findIndex((d) => d.id === r.door);
    if (!this.doorOpen(di)) return false;
    const d = DOORS[di];
    const k = d.rooms.indexOf(r);
    return k === 0 || this.passed(d.rooms[k - 1].id);
  }
  /** the first room not yet beaten, in journey order */
  nextRoom(): RoomDef | null {
    for (const d of DOORS) for (const r of d.rooms) if (!this.passed(r.id) && this.roomOpen(r)) return r;
    return null;
  }

  // ------------------------------------------------------------ loop
  private frame(now: number) {
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    this.time += dt;
    let world: World | null = null;
    let ghosts;
    const s = this.session;
    if (this.screen === 'play' && s) {
      if (!s.paused) {
        this.acc += dt;
        let n = 0;
        while (this.acc >= DT && n < 14) {
          s.tick(this.scripted ? this.scripted[this.scriptAt++] ?? NO_INPUT : this.input.sample());
          this.acc -= DT;
          n++;
        }
        if (n >= 14) this.acc = 0;
      }
      world = s.world;
      if (s.guide) ghosts = [{ world: s.guide, alpha: 0.5, tint: '#FFFFFF' }];
      this.consume(s.events, world);
      s.events.length = 0;
    } else if ((this.screen === 'montage' || this.screen === 'result') && this.montage) {
      const m = this.montage;
      this.acc += dt * 1.25;
      let n = 0;
      while (this.acc >= DT && n < 20) {
        m.step();
        this.acc -= DT;
        n++;
      }
      if (n >= 20) this.acc = 0;
      world = m.main;
      ghosts = m.ghosts;
      this.consume(m.events, world, true);
      m.events.length = 0;
      this.hud?.montage(m.fallen);
      if (m.done && this.screen === 'montage') this.showResult();
    } else if (this.demo) {
      const d = this.demo;
      this.acc += dt;
      let n = 0;
      while (this.acc >= DT && n < 14) {
        if (d.w.state === 'play') d.w.step(d.ins[d.w.tick] ?? NO_INPUT);
        else d.deadFor++;
        this.acc -= DT;
        n++;
      }
      if (n >= 14) this.acc = 0;
      this.consume(d.w.events, d.w, true);
      d.w.events.length = 0;
      if (d.deadFor > TPS * 1.1) this.startDemo();
      world = d.w;
    }
    this.fxShake = Math.max(0, this.fxShake - dt * 16);
    this.fxFlash = Math.max(0, this.fxFlash - dt * 5);
    this.fxFade = Math.max(0, this.fxFade - dt * 7);
    const playing = this.screen === 'play' && !!s && !s.paused && !s.done;
    this.input.live = playing;
    if (world) {
      const red = this.store.data.settings.reducedMotion || !this.store.data.settings.shake;
      this.renderer.render({
        world,
        t: this.time,
        dt,
        ghosts,
        touch: playing && this.showTouch() ? { buttons: this.input.touchDraw(), opacity: 0.45 } : undefined,
        flash: this.fxFlash,
        fade: this.fxFade,
        shake: red ? 0 : this.fxShake,
        dim: this.screen === 'title' ? 0.18 : this.screen === 'map' ? 0.3 : s?.paused ? 0.4 : 0,
      });
    }
    this.hud?.refresh();
    requestAnimationFrame((t) => this.frame(t));
  }

  private showTouch() {
    return this.input.usingTouch || matchMedia('(pointer: coarse)').matches;
  }

  /** world events -> particles, sounds, buzz */
  private consume(evs: World['events'], w: World, quiet = false) {
    if (!evs.length) return;
    const scene = sceneFor((w.level as RoomDef).door);
    const r = this.renderer.events(evs, scene);
    if (!quiet) {
      this.fxShake = Math.max(this.fxShake, r.shake);
      this.fxFlash = Math.max(this.fxFlash, r.flash);
    }
    const a = this.audio;
    for (const e of evs) {
      switch (e.type) {
        case 'jump':
          a.play('jump');
          break;
        case 'land':
          if ((e.data?.speed ?? 0) > 120) a.play('land', Math.min(1.4, e.data.speed / 300));
          break;
        case 'die':
          a.play('die');
          if (!quiet && this.store.data.settings.vibration) buzz('medium');
          break;
        case 'ghostPop':
          a.play('pop', 0.5);
          break;
        case 'win':
          a.play('win');
          a.play((w.level as RoomDef).door === 'blr' ? 'honk' : 'train');
          break;
        case 'bonk':
          a.play('bonk');
          break;
        case 'sfx':
          if (typeof e.data === 'string') a.play(e.data);
          break;
      }
    }
  }

  private startDemo() {
    const def = DOORS[0].rooms[0];
    this.demo = { w: freshRoom(def), ins: ticksOf([['', 70], ...def.natural]), deadFor: 0 };
    this.renderer.fx.clear();
  }

  // ------------------------------------------------------------ screens
  private clear() {
    this.layer.replaceChildren();
    this.hud = null;
  }

  showTitle() {
    this.screen = 'title';
    this.session = null;
    this.montage = null;
    this.startDemo();
    this.clear();
    const snd = this.store.data.settings.sfx;
    const title = h(
      'div.r-layer.r-title',
      h('div.r-logo', h('span.l1', 'LEVEL DEVIL'), h('span.l2', 'DAD')),
      h('div.r-tag', 'Dad is late. The city has other plans.'),
      h('button.r-btn.primary', { onclick: () => this.play() }, 'Play'),
      h('div.r-corner', icon(snd ? 'sound' : 'mute', () => this.toggleSound()), icon('map', () => this.showMap())),
      h('div.r-ver', `v${GAME.version}`),
    );
    this.layer.append(title);
  }

  private toggleSound() {
    const s = this.store.data.settings;
    s.sfx = !s.sfx;
    s.music = s.sfx;
    this.audio.sfxOn = s.sfx;
    this.audio.musicOn = s.music;
    this.audio.applyVolumes();
    this.music();
    this.store.save();
    if (this.screen === 'title') this.showTitle();
  }

  /** Play: straight into the next room (the very first time: no menus at all) */
  play() {
    const r = this.nextRoom();
    if (!r) return this.showMap();
    this.startRoom(r.id);
  }

  showMap(fresh?: string) {
    this.screen = 'map';
    this.session = null;
    this.montage = null;
    if (!this.demo) this.startDemo();
    this.clear();
    const [, , vw, vh] = MAP_VIEWBOX;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'india');
    svg.setAttribute('viewBox', `-20 -20 ${vw + 40} ${vh + 40}`);
    const pins = DOORS.map((d) => MAP_CITY_XY[d.pin] ?? [0, 0]);
    let route = '';
    pins.forEach(([x, y], i) => (route += `${i ? 'L' : 'M'}${x} ${y} `));
    svg.innerHTML = `
      <defs>
        <linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2b52"/><stop offset="1" stop-color="#261c38"/></linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
      </defs>
      <path d="${MAP_OUTLINE}" fill="#000" opacity=".45" transform="translate(10 18)" filter="url(#soft)"/>
      <path d="${MAP_OUTLINE}" fill="url(#land)" stroke="rgba(255,226,190,.28)" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="${route}" fill="none" stroke="rgba(255,213,106,.85)" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 13"/>
      ${pins
        .map(([x, y], i) => {
          const open = this.doorOpen(i);
          const done = DOORS[i].rooms.every((r) => this.passed(r.id));
          const cur = open && !done;
          return `<g transform="translate(${x} ${y})">
            ${cur ? `<circle r="30" fill="rgba(255,91,74,.25)"><animate attributeName="r" values="22;38;22" dur="1.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>` : ''}
            <circle r="24" fill="${done ? '#FFC94A' : open ? '#FF5B4A' : '#5b4c70'}" stroke="#1a1222" stroke-width="6"/>
            <text y="9" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="27" fill="${done || open ? '#2a0e08' : '#cfc4dd'}">${i + 1}</text>
            <text x="34" y="10" font-family="Fredoka" font-weight="600" font-size="30" fill="${open ? '#FFF7EE' : 'rgba(255,247,238,.5)'}" stroke="#1a1222" stroke-width="7" paint-order="stroke">${DOORS[i].city}</text>
          </g>`;
        })
        .join('')}`;
    const list = h('div.side', h('h2', "Dad's Journey"), h('div.sub', 'Every city has five rooms. Every room has a trick.'));
    DOORS.forEach((d, i) => {
      const open = this.doorOpen(i);
      const pips = h('div.r-pips', ...d.rooms.map((r) => h(`i${this.rec(r.id).cleared ? '.on' : this.skipped(r.id) ? '.skip' : ''}`)), ...Array.from({ length: 5 - d.rooms.length }, () => h('i')));
      const done = d.rooms.every((r) => this.passed(r.id));
      const b = h(
        `button.r-city${!open ? '.locked' : !done ? '.current' : ''}`,
        {
          onclick: () => {
            if (!open) return this.toast('Finish the city before it first.');
            const next = d.rooms.find((r) => !this.passed(r.id) && this.roomOpen(r)) ?? d.rooms[0];
            this.startRoom(next.id);
          },
        },
        h('div.medal', open ? String(i + 1) : '🔒'),
        h('div', h('div.name', d.city), h('div.ride', RIDE[d.ride]), pips),
      );
      if (fresh === d.id) b.classList.add('r-help');
      list.append(b);
    });
    list.append(h('div.r-soon', 'More cities on the way: Kolkata, Chennai, Jaipur…'));
    const back = h('div.r-corner', icon('sound', () => this.toggleSound()));
    void back;
    const map = h('div.r-layer.r-map', svg, list);
    this.layer.append(map);
  }

  toast(text: string) {
    const t = h('div.r-toast', text);
    this.layer.append(t);
    setTimeout(() => t.remove(), 2200);
  }

  /** play a room by script (for screenshots): `segs` as in the room tests */
  debugRun(id: string, segs: import('./types').Seg[]) {
    this.startRoom(id);
    this.scripted = ticksOf(segs);
    this.scriptAt = 0;
  }

  /** play several tries in a row by script, one per attempt (for montage screenshots) */
  debugTries(id: string, tries: import('./types').Seg[][]) {
    this.startRoom(id);
    let k = 0;
    this.scripted = ticksOf(tries[0]);
    this.scriptAt = 0;
    const s = this.session!;
    const prev = s.onSpawn;
    s.onSpawn = () => {
      prev?.();
      k = Math.min(k + 1, tries.length - 1);
      this.scripted = ticksOf(tries[k]);
      this.scriptAt = 0;
    };
  }

  startRoom(id: string) {
    this.scripted = null;
    const def = ROOM_BY_ID[id];
    if (!def) return this.showMap();
    this.clear();
    this.demo = null;
    this.montage = null;
    this.screen = 'play';
    this.renderer.fx.clear();
    const s = new RoomSession(def);
    this.session = s;
    this.store.stage(id).attempts++;
    s.onDeath = () => {
      const r = this.store.stage(id);
      r.deaths++;
      this.store.data.totalDeaths++;
      this.store.log('death', id, { t: +(s.world.deathTick * DT).toFixed(2), x: s.world.player.x, cause: s.world.deathCause });
      this.hud?.bump();
    };
    s.onSpawn = () => {
      this.renderer.fx.clear();
      this.fxFade = 0.25;
    };
    s.onDone = () => this.onCleared(s);
    this.hud = new Hud(this, s);
    this.layer.append(this.hud.el);
    const door = DOORS.find((d) => d.id === def.door)!;
    this.layer.append(h('div.r-banner', h('div.k', `${door.city} · ${def.n} of ${door.rooms.length}`), h('div.n', def.name)));
    this.fxFade = 0.6;
    this.music();
  }

  private onCleared(s: RoomSession) {
    const id = s.def.id;
    const r = this.store.stage(id);
    const first = !r.cleared;
    r.cleared = true;
    r.clears++;
    if (r.best === null || s.winTime < r.best) r.best = +s.winTime.toFixed(2);
    if (r.bestDeaths === null || s.deaths < r.bestDeaths) r.bestDeaths = s.deaths;
    if (first) r.firstClearDeaths = s.deaths;
    this.store.log('clear', id, { deaths: s.deaths, t: +s.winTime.toFixed(2) });
    this.store.save(true);
    // the montage: every try at once
    this.montage = new Montage(s.def, s.tries, s.winning ?? []);
    this.screen = 'montage';
    this.renderer.fx.clear();
    this.acc = 0;
    this.clear();
    this.hud = new Hud(this, s, true);
    this.layer.append(this.hud.el);
  }

  private showResult() {
    const s = this.session;
    if (!s) return;
    this.screen = 'result';
    const def = s.def;
    const door = DOORS.find((d) => d.id === def.door)!;
    const k = door.rooms.indexOf(def);
    const last = k === door.rooms.length - 1;
    const nextDoor = DOORS[DOORS.indexOf(door) + 1];
    const deaths = s.deaths;
    const card = h(
      'div.r-card',
      h('div.kicker', `${door.city} · Room ${def.n}`),
      h('h3', def.name),
      h(
        'div.big',
        h('div.stat', h('b', String(deaths)), h('span', deaths === 1 ? 'try failed' : 'tries failed')),
        h('div.stat', h('b', s.winTime.toFixed(1)), h('span', 'seconds')),
      ),
      h(
        'div.row',
        h('button.r-btn', { onclick: () => this.startRoom(def.id) }, 'Again'),
        h('button.r-btn.primary', { onclick: () => this.afterRoom(def, last ? nextDoor : undefined) }, last ? (nextDoor ? `On to ${nextDoor.city}` : 'Journey map') : 'Next room'),
      ),
    );
    if (last) card.prepend(h('div.kicker', { style: { color: '#FFC94A', marginBottom: '4px' } }, `${door.city} done!`));
    this.clear();
    this.layer.append(h('div.r-layer.r-veil', card));
  }

  private afterRoom(def: RoomDef, nextDoor?: DoorDef) {
    const door = DOORS.find((d) => d.id === def.door)!;
    const k = door.rooms.indexOf(def);
    if (k < door.rooms.length - 1) return this.startRoom(door.rooms[k + 1].id);
    this.showMap(nextDoor?.id);
  }

  skip() {
    const s = this.session;
    if (!s) return;
    this.store.data.stamps[`skip:${s.def.id}`] = 1;
    this.store.log('skip', s.def.id, { deaths: s.deaths });
    this.store.save(true);
    const door = DOORS.find((d) => d.id === s.def.door)!;
    const k = door.rooms.indexOf(s.def);
    if (k < door.rooms.length - 1) this.startRoom(door.rooms[k + 1].id);
    else this.showMap(DOORS[DOORS.indexOf(door) + 1]?.id);
  }

  togglePause() {
    if (this.session?.paused) this.resume();
    else this.pause();
  }

  pause() {
    const s = this.session;
    if (!s || this.screen !== 'play') return;
    s.paused = true;
    this.input.clear();
    const snd = this.store.data.settings.sfx;
    const card = h(
      'div.r-card',
      h('div.kicker', `${DOORS.find((d) => d.id === s.def.door)!.city} · Room ${s.def.n}`),
      h('h3', s.def.name),
      h(
        'div.row',
        h('button.r-btn', { onclick: () => this.showMap() }, 'Map'),
        h('button.r-btn', { onclick: () => (this.resume(), s.restart()) }, 'Restart'),
        h('button.r-btn.primary', { onclick: () => this.resume() }, 'Resume'),
      ),
      h('div', { style: { marginTop: '14px' } }, h('button.r-btn', { onclick: () => (this.toggleSound(), this.resume(), this.pause()) }, snd ? 'Sound: on' : 'Sound: off')),
    );
    const veil = h('div.r-layer.r-veil.r-pause', card);
    this.layer.append(veil);
  }

  resume() {
    const s = this.session;
    if (!s) return;
    s.paused = false;
    this.layer.querySelector('.r-pause')?.remove();
    this.acc = 0;
  }

  back() {
    if (this.screen === 'play') {
      if (this.session?.paused) this.resume();
      else this.pause();
    } else if (this.screen === 'map' || this.screen === 'result' || this.screen === 'montage') this.showTitle();
    else if (inAndroidShell) exitShell();
  }
}

const RIDE: Record<DoorDef['ride'], string> = {
  train: 'Late for the local train',
  auto: 'Late for an auto',
  metro: 'Late for the metro',
};

/** pause, deaths, the door's five rooms, and the hint and skip when they're earned */
class Hud {
  el: HTMLElement;
  private count: HTMLElement;
  private num: HTMLElement;
  private help: HTMLElement;
  private shown = -1;
  private app: RoomApp;
  private s: RoomSession;
  private hinted = false;
  private skipShown = false;

  constructor(app: RoomApp, s: RoomSession, montage = false) {
    this.app = app;
    this.s = s;
    const door = DOORS.find((d) => d.id === s.def.door)!;
    this.num = h('span', '0');
    this.count = h('div.tc', h('span', { html: ICON.glasses }), this.num);
    this.help = h('div.tr');
    const pips = h('div.r-pips', ...door.rooms.map((r) => h(`i${r === s.def ? '.here' : app.rec(r.id).cleared ? '.on' : ''}`)));
    this.help.append(pips);
    this.el = h('div.r-hud', this.count, this.help);
    if (montage) {
      this.el.append(h('div.r-ghostline', 'Every try, all at once'));
      this.el.addEventListener('pointerdown', () => app.montage && (app.montage.done = true));
      return;
    }
    this.el.prepend(h('div.tl', icon('pause', () => app.pause()), icon('restart', () => s.restart())));
  }

  bump() {
    this.count.classList.remove('bump');
    void this.count.offsetWidth;
    this.count.classList.add('bump');
  }

  montage(n: number) {
    if (n !== this.shown) {
      this.shown = n;
      this.num.textContent = String(n);
      if (n > 0) this.bump();
    }
  }

  refresh() {
    const s = this.s;
    if (this.app.screen !== 'play') return;
    if (s.deaths !== this.shown) {
      this.shown = s.deaths;
      this.num.textContent = String(s.deaths);
    }
    if (!this.hinted && s.deaths >= HINT_AFTER) {
      this.hinted = true;
      const b = icon('hint', () => {
        s.startGuide();
        s.restart();
        b.remove();
      }, '.r-help.glow');
      this.help.prepend(b);
    }
    if (!this.skipShown && s.deaths >= SKIP_AFTER) {
      this.skipShown = true;
      this.help.prepend(icon('skip', () => this.app.skip(), '.r-help'));
    }
  }
}
