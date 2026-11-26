import { App as CapApp } from '@capacitor/app';
import { bi, EN_DELAY, EN_HOLD } from '../game/bi';
import { CityId, DT, TPS } from '../game/constants';
import { LEVEL_BY_ID, LEVELS, levelsOf, normalizeCode } from '../game/levels';
import { LevelDef, NO_INPUT, World } from '../game/world';
import { Audio } from '../audio/audio';
import { Input } from '../input/input';
import { Renderer } from '../render/renderer';
import { THEMES } from '../render/theme';
import { computeView, readSafeArea, View } from '../render/view';
import { Store } from '../platform/storage';
import { buzz, copyText, exitShell, inAndroidShell, inFrame, initNative, isNative, shareCard, tryFullscreen } from '../platform/device';
import { fmtTime, h, toast } from '../ui/dom';
import { IndiaMap, ChapterStatus } from '../ui/mapview';
import { CHAPTERS, Chapter, LINES, chapterOf } from '../game/cities';
import { makeCard } from '../ui/card';
import { HintSheet, hintPages, partPages } from '../ui/hintsheet';
import { hintPartAt } from '../game/levels/chunks';
import { cityName, homeChapter, homeId, homeLine, homePicker, setHome } from '../ui/home';
import { drawIcon } from '../render/art/icon';
import { GAME } from '../config';
import { Challenge, LIVES, Session } from './session';
import { CITY_LINE } from './citylines';

const SIZE_MUL = { S: 0.8, M: 1, L: 1.2, XL: 1.45 } as const;

export class App {
  root: HTMLElement;
  canvas: HTMLCanvasElement;
  ui: HTMLElement;
  screenEl: HTMLElement;
  hudEl: HTMLElement;
  modalEl: HTMLElement;
  store = new Store();
  audio = new Audio();
  input = new Input();
  renderer: Renderer;
  view!: View;
  session: Session | null = null;
  menuWorld!: World;
  menuCity: CityId = 'HYD';
  fx = { shake: 0, flash: 0, fade: 0, sx: 0, sy: 0, iris: { k: 1, x: 256, y: 144, v: 0 } };
  hud: Hud | null = null;
  time = 0;
  screen = 'title';
  private acc = 0;
  private last = 0;
  private versionTaps = 0;
  private unlocked = false;
  pending: Challenge | null = null;
  private hint: HintSheet | null = null;
  /** a home-city preview run: the stage id and its save record as it was before, put back when the run ends */
  private preview: { id: string; rec: string | undefined; deaths: number } | null = null;
  /** what the hint was opened at: a death or a restart after this closes it */
  private hintAt = { attempt: 0, deaths: 0, restarts: 0 };
  /** the hint page you last read, per stage (reopening carries on from there) */
  private hintPage = new Map<string, number>();

  constructor(root: HTMLElement) {
    this.root = root;
    this.canvas = root.querySelector('#game') as HTMLCanvasElement;
    this.ui = root.querySelector('#ui') as HTMLElement;
    this.screenEl = h('div.layer');
    this.hudEl = h('div.hud');
    this.modalEl = h('div');
    this.ui.append(this.hudEl, this.screenEl, this.modalEl);
    this.renderer = new Renderer(this.canvas);
  }

  // =================================================================== boot
  async boot() {
    await this.store.load();
    this.applySettings();
    this.input.attach(this.canvas, this.root);
    this.input.onPause = () => this.togglePause();
    this.input.onRestart = () => {
      if (this.session && !this.session.paused && !this.session.done) this.session.restart();
    };
    const unlock = () => {
      if (this.unlocked) return;
      this.unlocked = true;
      this.audio.unlock();
      this.audio.setMusic(this.session ? this.session.def.city : this.menuCity);
    };
    window.addEventListener('pointerdown', unlock, { capture: true });
    window.addEventListener('keydown', unlock, { capture: true });
    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.visualViewport?.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 200));
    await initNative({
      onPause: () => {
        if (this.session && !this.session.done && !this.session.paused) this.pause();
        this.audio.suspend();
      },
      onResume: () => this.audio.resume(),
      onBack: () => this.back(),
    });
    try {
      await (document as any).fonts?.load?.('800 20px "Baloo 2"');
    } catch {
      /* ignore */
    }
    this.renderer.invalidate();
    this.setMenuCity(this.nextStage()?.city ?? 'HYD');
    this.pending = this.readChallenge();
    window.addEventListener('hashchange', () => {
      const c = this.readChallenge();
      if (c) this.openChallenge(c);
    });
    if (this.pending) this.openChallenge(this.pending);
    else if (homeId(this.store.data) === undefined) this.showHomePicker('first');
    else this.showTitle();
    requestAnimationFrame((t) => this.frame(t));
  }

  private readChallenge(): Challenge | null {
    const q = new URLSearchParams(location.search);
    const raw = q.get('c') ?? decodeURIComponent(location.hash.replace(/^#/, ''));
    const id = raw ? normalizeCode(raw) : null;
    if (!id) return null;
    const num = (v: string | null) => (v !== null && v !== '' && isFinite(+v) ? +v : undefined);
    return { id, t: num(q.get('t')), d: num(q.get('d')) };
  }

  resize() {
    const vv = window.visualViewport;
    const W = Math.round(vv?.width ?? window.innerWidth);
    const H = Math.round(vv?.height ?? window.innerHeight);
    const cap = this.store.data.settings.hd ? 3 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, cap);
    this.view = computeView(W, H, dpr, readSafeArea());
    this.renderer.resize(this.view);
    this.input.layoutFor(this.view);
  }

  applySettings() {
    const s = this.store.data.settings;
    this.audio.sfxOn = s.sfx;
    this.audio.musicOn = s.music;
    this.audio.sfxVol = s.sfxVol;
    this.audio.musicVol = s.musicVol;
    this.audio.applyVolumes();
    this.input.prefs = { size: SIZE_MUL[s.btnSize], opacity: s.btnOpacity, swap: s.swap };
    if (this.view) {
      this.resize();
    }
  }

  // =================================================================== loop
  private frame(now: number) {
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    this.time += dt;
    const sess = this.session;
    if (sess && !sess.paused && !sess.done) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= DT && n < 14) {
        sess.tick(this.input.sample());
        this.acc -= DT;
        n++;
      }
      if (n >= 14) this.acc = 0;
    } else if (!sess && this.menuWorld) {
      this.acc += dt;
      let n = 0;
      while (this.acc >= DT && n < 14) {
        this.menuWorld.step(NO_INPUT);
        this.acc -= DT;
        n++;
      }
      if (this.menuWorld.tick > TPS * 40) this.setMenuCity(this.menuCity, true);
    } else {
      this.acc = 0;
    }
    this.renderer.particles.update(dt);
    const f = this.fx;
    const red = this.store.data.settings.reducedMotion || !this.store.data.settings.shake;
    if (f.shake > 0 && !red) {
      f.sx = (Math.random() * 2 - 1) * f.shake;
      f.sy = (Math.random() * 2 - 1) * f.shake;
    } else f.sx = f.sy = 0;
    f.shake = Math.max(0, f.shake - dt * 30);
    f.flash = Math.max(0, f.flash - dt * 6);
    f.fade = Math.max(0, f.fade - dt * 5);
    if (f.iris.v) {
      f.iris.k = Math.min(1, Math.max(0, f.iris.k + f.iris.v * dt));
      if (f.iris.k <= 0 || f.iris.k >= 1) f.iris.v = 0;
    }
    const world = sess ? sess.world : this.menuWorld;
    const playing = !!sess && !sess.done;
    this.input.live = playing && !sess!.paused;
    this.renderer.updateCamera(world, Math.min(dt, 0.05));
    this.renderer.render({
      world,
      character: this.store.data.settings.character,
      shake: { x: f.sx, y: f.sy },
      flash: f.flash,
      fade: f.fade,
      reduced: this.store.data.settings.reducedMotion,
      time: this.time,
      touch: { buttons: this.input.touchDraw(), opacity: this.input.prefs.opacity, visible: playing && !sess!.paused && this.showTouch() },
      dim: sess ? (sess.paused || sess.done ? 0.35 : 0) : 0.38,
      iris: sess && f.iris.k < 1 ? { k: f.iris.v > 0 ? 1 - (1 - f.iris.k) ** 3 : f.iris.k ** 1.6, x: f.iris.x, y: f.iris.y } : undefined,
    });
    this.hud?.refresh();
    requestAnimationFrame((t) => this.frame(t));
  }

  private showTouch() {
    return this.input.usingTouch || matchMedia('(pointer: coarse)').matches;
  }

  // ================================================================ effects
  handleEvents(w: World) {
    const pr = this.renderer.particles;
    const th = THEMES[w.city];
    for (const e of w.events) {
      switch (e.type) {
        case 'jump':
          this.audio.play('jump');
          pr.dust(e.x, e.y, 3);
          break;
        case 'land': {
          const k = Math.min(1, (e.data?.speed ?? 200) / 400);
          this.audio.play('land', 0.5 + k * 0.5);
          pr.dust(e.x, e.y, 2 + Math.round(k * 4));
          break;
        }
        case 'bonk':
          this.audio.play('bonk');
          pr.stars(e.x, e.y);
          break;
        case 'die': {
          this.audio.play('die');
          const papa = this.store.data.settings.character === 'papa';
          pr.death(e.x, e.y, papa ? ['#2F6FB5', '#B97A4C', '#3A3E4A', '#7FB0E6'] : ['#D63A6E', '#F2C14E', '#7B2D8E', '#B07446'], papa);
          this.fx.shake = 7;
          this.fx.flash = 1;
          if (this.store.data.settings.vibration) buzz('heavy');
          break;
        }
        case 'win':
          this.audio.play('win');
          pr.confetti(e.x, e.y - 6);
          if (this.store.data.settings.vibration) buzz('success');
          if (w.winVia === 'train') setTimeout(() => this.audio.play('train'), 250);
          if (w.winVia === 'auto') this.audio.play('honk');
          break;
        case 'shake':
          this.fx.shake = Math.max(this.fx.shake, e.data?.amount ?? 3);
          if (this.store.data.settings.vibration) buzz('light');
          break;
        case 'sfx':
          this.audio.play(e.data);
          break;
        case 'warp':
          this.renderer.snapNext = true;
          if (e.data?.how === 'blink') {
            this.fx.fade = 0.55;
            this.audio.play('blink');
          } else {
            this.fx.fade = 0.85;
            this.audio.play('train');
          }
          break;
        case 'flip':
          this.audio.play('ulta');
          this.quip(LINES[w.city].flip);
          break;
        case 'collect':
          this.quip('Found it! \u2605');
          if (this.store.data.settings.vibration) buzz('success');
          break;
        case 'splash':
          this.audio.play('splash');
          pr.dust(e.x, e.y, 12, 'rgba(170,225,255,0.9)', 2);
          break;
        case 'stroke':
          pr.dust(e.x, e.y + 4, 3, 'rgba(225,250,255,0.85)', 0.8);
          break;
        case 'grab':
          this.audio.play('click');
          break;
        case 'kick':
          this.audio.play('thud', 0.6);
          pr.dust(e.x, e.y, 4);
          break;
        case 'fx': {
          const k = e.data?.kind;
          if (k === 'crumble') pr.crumble(e.x, e.y, e.data.w, th.tileBase);
          else if (k === 'dust') pr.dust(e.x, e.y, 10, 'rgba(255,255,255,0.8)', 1.6);
          else if (k === 'poof') pr.poof(e.x, e.y, e.data.w, e.data.h);
          else if (k === 'rice') pr.rice(e.x, e.y);
          else if (k === 'steam') pr.steamPuff(e.x, e.y);
          else if (k === 'sparkle') pr.sparkle(e.x, e.y);
          else if (k === 'confetti') pr.confetti(e.x, e.y);
          else if (k === 'splash') pr.dust(e.x, e.y, 14, 'rgba(170,225,255,0.9)', 2.2);
          else if (k === 'remote') {
            pr.sparks(e.x, e.y, '#9AE6FF');
            this.audio.play('remote');
          }
          break;
        }
      }
    }
    w.events.length = 0;
  }

  /** Died a step from the exit: a bigger, warmer callout (the near-miss keeps people trying). */
  nearMiss(text: string) {
    const t = bi(text);
    const q = h('div.quip.near', 'SO CLOSE! ', h('span', t.main), t.en ? h('span.en', t.en) : null);
    this.hudEl.appendChild(q);
    this.audio.play('near');
    setTimeout(() => q.remove(), t.en ? (EN_DELAY + EN_HOLD) * 1000 : 1600);
  }

  /** First visit to a city: a postcard that greets you in the local language (never blocks play). */
  postcard(city: CityId) {
    const ch = chapterOf(city);
    const L = LINES[city];
    const hello = bi(L.hello);
    const pc = h('div.postcard', {}, h('div.pc-hello', hello.main), h('div.pc-name', ch.name), hello.en ? h('div.pc-hello-en', hello.en) : null, h('div.pc-famous', L.famous));
    // a CSS custom property can't go through a style object: set it directly
    pc.style.setProperty('--cc', THEMES[city].ui);
    this.hudEl.appendChild(pc);
    setTimeout(() => pc.classList.add('out'), 2600);
    setTimeout(() => pc.remove(), 3200);
  }

  /** the 7th death: a big "7" stamp and Thala for a reason, then the level starts over */
  seven(text: string) {
    const t = bi(text);
    const city = this.session?.def.city;
    const q = h('div.seven', h('div.s7-badge', '7'), h('div.s7-text', t.main), t.en ? h('div.s7-en', t.en) : null);
    if (city) q.style.setProperty('--cc', THEMES[city].ui);
    this.hudEl.appendChild(q);
    this.audio.play('seven');
    setTimeout(() => q.classList.add('out'), 2900);
    setTimeout(() => q.remove(), 3400);
  }

  quip(text: string) {
    const t = bi(text);
    const q = h('div.quip', t.main, t.en ? h('span.en', t.en) : null);
    this.hudEl.appendChild(q);
    setTimeout(() => q.remove(), t.en ? (EN_DELAY + EN_HOLD) * 1000 : 1350);
  }

  // ============================================================= navigation
  /** the circle wipe: open on the spawn point, close on the way out */
  irisOpen(x: number, y: number) {
    if (this.store.data.settings.reducedMotion) return void (this.fx.iris = { k: 1, x, y, v: 0 });
    this.fx.iris = { k: 0.02, x, y, v: 2.1 };
  }
  irisClose(x: number, y: number) {
    if (this.store.data.settings.reducedMotion) return;
    this.fx.iris = { k: 1, x, y, v: -2.0 };
  }

  /** a stage title that swings in and out over the first two seconds (never blocks play) */
  stageBanner(def: LevelDef) {
    const b = h(
      'div.stagebanner',
      {},
      h('div.sb-code', def.id),
      h('div.sb-name', def.name),
      def.nameEn ? h('div.sb-en', def.nameEn) : null,
      def.scene ? h('div.sb-place', '\u{1F4CD} ' + def.scene.place) : null,
      def.tagline ? h('div.sb-tag', def.tagline) : null,
    );
    b.style.setProperty('--cc', THEMES[def.city].ui);
    this.hudEl.appendChild(b);
    setTimeout(() => b.remove(), 2400);
  }

  private clearUI() {
    this.fx.iris = { k: 1, x: 256, y: 144, v: 0 };
    this.map?.destroy();
    this.map = null;
    this.screenEl.innerHTML = '';
    this.modalEl.innerHTML = '';
    this.screenEl.className = 'layer';
  }

  setMenuCity(city: CityId, keep = false) {
    if (city !== this.menuCity || !this.menuWorld || keep) {
      this.menuCity = city;
      const def = levelsOf(city)[0];
      this.menuWorld = new World(def, { attempt: 1, deaths: 0, justDied: false, rival: 'tara', character: this.store.data.settings.character });
      def.build?.(this.menuWorld);
      this.renderer.particles.clear();
    }
    if (this.unlocked) this.audio.setMusic(city);
    document.documentElement.style.setProperty('--accent', THEMES[city].ui);
  }

  isUnlocked(def: LevelDef): boolean {
    if ((this.store.data as any).unlockAll) return true;
    if (!this.cityUnlocked(def.city)) return false;
    if (def.index === 1) return true;
    const prev = levelsOf(def.city)[def.index - 2];
    return !!this.store.data.stages[prev.id]?.cleared;
  }

  /** Chapters you can actually play now, in journey order. */
  private playableChapters(): Chapter[] {
    return CHAPTERS.filter((c) => c.city && levelsOf(c.city).length > 0);
  }

  cityUnlocked(c: CityId) {
    if ((this.store.data as any).unlockAll) return true;
    // somewhere you've already played stays open (a new city slotted in before it doesn't lock it again)
    if (levelsOf(c).some((l) => this.store.data.stages[l.id]?.cleared)) return true;
    const list = this.playableChapters();
    const i = list.findIndex((ch) => ch.city === c);
    if (i < 0) return false;
    const ch = list[i];
    const stamped = (x: Chapter) => this.store.data.stamps[x.city!] !== undefined;
    const before = list.slice(0, i).filter((x) => !x.bonus && !x.preview);
    if (ch.preview) return before.every(stamped);
    if (ch.bonus) return before.length === 0 || stamped(before[before.length - 1]);
    return before.length === 0 || stamped(before[before.length - 1]);
  }

  chapterStatus(c: Chapter): ChapterStatus {
    if (!c.city || levelsOf(c.city).length === 0) return 'soon';
    if (this.store.data.stamps[c.city] !== undefined) return 'cleared';
    return this.cityUnlocked(c.city) ? 'open' : 'locked';
  }

  stars(def: LevelDef): number {
    const r = this.store.data.stages[def.id];
    if (!r?.cleared) return 0;
    return 1 + (r.best !== null && def.par !== undefined && r.best <= def.par ? 1 : 0) + (r.got ? 1 : 0);
  }

  nextStage(): LevelDef | null {
    const order = this.playableChapters();
    // main route first, then the side trips
    for (const pass of [(c: Chapter) => !c.bonus && !c.preview, (c: Chapter) => !!c.bonus || !!c.preview])
      for (const ch of order.filter(pass))
        for (const l of levelsOf(ch.city!)) if (this.isUnlocked(l) && !this.store.data.stages[l.id]?.cleared) return l;
    return null;
  }

  back() {
    if (this.modalEl.childElementCount && this.session && this.session.paused) return this.resume();
    if (this.session && !this.session.done) return this.togglePause();
    switch (this.screen) {
      case 'title':
        if (isNative) CapApp.exitApp();
        else if (inAndroidShell) exitShell();
        break;
      case 'stages':
        this.showJourney();
        break;
      case 'result':
        this.leaveToStages();
        break;
      default:
        this.showTitle();
    }
  }

  // ================================================================ screens
  showTitle() {
    this.endSession();
    this.screen = 'title';
    this.clearUI();
    const s = this.store.data.settings;
    const next = this.nextStage();
    const charChip = (id: 'papa' | 'mummy', label: string) =>
      h(
        'button.chip' + (s.character === id ? '.on' : ''),
        {
          onclick: () => {
            s.character = id;
            this.store.save();
            this.audio.play('ui');
            this.showTitle();
          },
        },
        label,
      );
    const menu = h(
      'div.menu',
      h(
        'button.btn.big',
        {
          onclick: () => {
            this.audio.play('ui');
            tryFullscreen();
            if (next) this.startStage(next.id, null);
            else this.showJourney();
          },
        },
        next ? (Object.values(this.store.data.stages).some((r) => r?.attempts) ? `▶  Continue · ${next.id}` : '▶  Play') : '▶  Journey',
      ),
      h(
        'div.row',
        { style: { flexWrap: 'nowrap' } },
        h('button.btn.ghost', { style: { flex: 1 }, onclick: () => (this.audio.play('ui'), this.showJourney()) }, '🗺  Journey'),
        h('button.btn.ghost', { style: { flex: 1 }, onclick: () => (this.audio.play('ui'), this.showChallengeEntry()) }, '🎟  Challenge'),
      ),
      h('div.row', { style: { flexWrap: 'nowrap' } }, h('button.btn.ghost.small', { onclick: () => (this.audio.play('ui'), this.showSettings('title')) }, '⚙  Settings'), h('div.chips', charChip('papa', 'Papa'), charChip('mummy', 'Mummy'))),
    );
    const logo = h(
      'div.logo',
      h('div.l1', 'LEVEL DEVIL'),
      h('div.l2', 'DAD'),
      h('div', h('span.tag', 'You fooled me. Now I know how to beat you.')),
    );
    this.screenEl.append(
      h('div.title-wrap.fade-in', logo, menu),
      h('div.tiny', { style: { position: 'absolute', bottom: 'max(6px, var(--sab))', right: 'max(12px, var(--sar))' }, onclick: () => this.tapVersion() }, `v${GAME.version}${this.store.persistent ? '' : ' · progress saves for this session only'}`),
    );
  }

  private tapVersion() {
    if (++this.versionTaps >= 5) {
      this.versionTaps = 0;
      this.showPlaytest();
    }
  }

  private map: IndiaMap | null = null;

  /** The India map: every capital, south to north. `focus` selects a chapter (default: where you are). */
  showJourney(focus?: string, fresh?: string) {
    this.endSession();
    this.screen = 'journey';
    this.clearUI();
    this.screenEl.className = 'layer mapscreen';
    const d = this.store.data;
    const next = this.nextStage();
    const current = focus ?? (next ? chapterOf(next.city).id : CHAPTERS.filter((c) => this.chapterStatus(c) === 'cleared').pop()?.id ?? 'TVM');
    const card = h('div.citycard');
    const home = homeChapter(d);
    const status = (c: Chapter) => this.chapterStatus(c);
    const accent = (c: Chapter) => (c.city ? THEMES[c.city].ui : '#8C7A5E');
    const fill = (c: Chapter) => {
      card.innerHTML = '';
      card.style.setProperty('--cc', accent(c));
      const st = this.chapterStatus(c);
      if (c.city) this.setMenuCity(c.city);
      card.append(
        h('div.cc-name', c.name),
        h('div.cc-state', c.state + (c.bonus ? '  ·  bonus' : c.preview ? '  ·  preview' : '')),
        ...(home?.id === c.id ? [h('div.homebadge', '🏠 Your city · ' + homeLine(c, status))] : []),
        h('div.cc-hello', bi(c.hello).main),
        ...(bi(c.hello).en ? [h('div.cc-hello-en', bi(c.hello).en!)] : []),
        h('p.cc-famous', c.famous),
      );
      if (st === 'soon' && home?.id === c.id) {
        // your city is not built yet: a postcard from it, so there is still something to look forward to
        card.append(
          h(
            'div.homepost',
            h('div.hpo-stamp', 'Postcard from home'),
            h('div.hpo-line', `Dad's on his way to ${c.name}. Traps being built here:`),
            ...(c.teasers ?? []).map((t) => h('div.hpo-teaser', t)),
            h('div.hpo-foot', 'Coming in a future update'),
          ),
        );
        return;
      }
      if (st === 'soon') {
        card.append(h('div.cc-soon', 'Coming in the next update'), ...(c.teasers ?? []).map((t) => h('div.cc-teaser', '🔒  ' + t)));
        return;
      }
      const lvls = levelsOf(c.city!);
      if (st === 'locked') {
        const list = this.playableChapters().filter((x) => !x.bonus && !x.preview);
        const prev = c.preview ? list[list.length - 1] : list[list.findIndex((x) => x.id === c.id) - 1] ?? list.filter((x) => CHAPTERS.indexOf(x) < CHAPTERS.indexOf(c)).pop();
        card.append(h('div.cc-soon', `🔒  Escape ${prev?.name ?? 'the city before'} first`));
      }
      // your city, still locked: its first stage as a preview, right under the lock line so it is in view
      if (st === 'locked' && home?.id === c.id && lvls[0])
        card.append(
          h(
            'button.btn.big.cc-play.cc-peek',
            { onclick: () => (this.audio.play('ui'), tryFullscreen(), this.startStage(lvls[0].id, null, true)) },
            `🏠  Sneak a peek: ${lvls[0].id}`,
          ),
          h('div.cc-peek-note', 'A preview. No stars, nothing unlocks. Dad still has to get here the long way.'),
        );
      const starsTotal = lvls.reduce((a, l) => a + this.stars(l), 0);
      if (st === 'cleared') card.append(h('div.cc-stamp', h('b', 'ESCAPED'), h('span', `${d.stamps[c.city!]}☠ · ★ ${starsTotal}/${lvls.length * 3}`)));
      const rows = lvls.map((l) => {
        const rec = d.stages[l.id];
        const open = this.isUnlocked(l);
        const nstar = this.stars(l);
        return h(
          'button.cc-stage' + (open ? '' : '.locked') + (rec?.cleared ? '.cleared' : '') + (next?.id === l.id ? '.next' : ''),
          { onclick: () => (open ? (this.audio.play('ui'), tryFullscreen(), this.startStage(l.id, null)) : toast(this.ui, 'Clear the stage before it first')) },
          h('span.cs-n', open ? String(l.index) : '🔒'),
          h('span.cs-nm', open ? l.name : '???', open && l.nameEn ? h('small.cs-en', l.nameEn) : null),
          h('span.cs-st', '★'.repeat(nstar) + '☆'.repeat(3 - nstar)),
          h('span.cs-t', rec?.cleared ? fmtTime(rec.best) : ''),
        );
      });
      card.append(h('div.cc-stages', ...rows));
      const nextHere = lvls.find((l) => this.isUnlocked(l) && !d.stages[l.id]?.cleared);
      if (nextHere) card.append(h('button.btn.big.cc-play', { onclick: () => (this.audio.play('ui'), tryFullscreen(), this.startStage(nextHere.id, null)) }, `▶  ${nextHere.id}  ${nextHere.name}`));
    };
    this.map?.destroy();
    const map = new IndiaMap({
      status: (c) => this.chapterStatus(c),
      accent,
      selected: current,
      fresh,
      home: home ? { id: home.id, line: homeLine(home, status) } : undefined,
      onSelect: (c) => {
        this.audio.play('ui');
        fill(c);
      },
    });
    this.map = map;
    fill(CHAPTERS.find((c) => c.id === current) ?? CHAPTERS[0]);
    const cleared = CHAPTERS.filter((c) => this.chapterStatus(c) === 'cleared').length;
    const allStars = LEVELS.reduce((a, l) => a + this.stars(l), 0);
    this.screenEl.append(
      map.el,
      h(
        'div.maphead',
        h('button.btn.ghost.small', { onclick: () => (this.audio.play('uiBack'), this.showTitle()) }, '←'),
        h('div.mh-title', 'Bharat Yatra'),
        h('div.mh-stats', `${cleared}/${CHAPTERS.length} capitals · ★ ${allStars} · ☠ ${d.totalDeaths}`),
      ),
      card,
    );
  }

  showStages(city: CityId) {
    this.endSession();
    this.screen = 'stages';
    this.setMenuCity(city);
    this.clearUI();
    const th = THEMES[city];
    const d = this.store.data;
    const cards = levelsOf(city).map((l) => {
      const rec = d.stages[l.id];
      const unlocked = this.isUnlocked(l);
      const isNext = unlocked && !rec?.cleared && this.nextStage()?.id === l.id;
      return h(
        'button.stage' + (!unlocked ? '.locked' : rec?.cleared ? '.cleared' : isNext ? '.new' : ''),
        { onclick: () => (this.audio.play('ui'), tryFullscreen(), this.startStage(l.id, null)) },
        h('div.n', unlocked ? String(l.index) : '🔒'),
        h('div.nm', unlocked ? l.name : '???'),
        h('div.meta', l.id),
        rec?.cleared ? h('div.meta', `⏱ ${fmtTime(rec.best)}`) : null,
        rec && rec.deaths ? h('div.meta', `☠ ${rec.deaths}`) : null,
      );
    });
    this.screenEl.append(
      h('button.btn.ghost.small.back', { onclick: () => (this.audio.play('uiBack'), this.showJourney(chapterOf(city).id)) }, '← Map'),
      h(
        'div.col.fade-in',
        h('div.row', h('p.h1', th.name), h('p.h2', { style: { opacity: 0.6, fontFamily: 'system-ui, sans-serif' } }, th.local), homeChapter(d)?.city === city ? h('div.homebadge', '🏠 Your city') : null),
        h('p.sub', CITY_LINE[city]),
        h('div.stages', ...cards),
      ),
    );
  }

  showChallengeEntry() {
    this.screen = 'challenge';
    this.clearUI();
    const input = h('input.codein', { maxlength: 6, placeholder: 'BLR-04', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', inputmode: 'text' }) as HTMLInputElement;
    const err = h('div.err');
    const go = () => {
      const id = normalizeCode(input.value);
      if (!id) {
        err.textContent = 'Codes look like HYD-02, BLR-04 or BOM-05.';
        this.audio.play('uiBack');
        return;
      }
      this.audio.play('ui');
      this.openChallenge({ id });
    };
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') go();
    });
    this.screenEl.append(
      h('button.btn.ghost.small.back', { onclick: () => (this.audio.play('uiBack'), this.showTitle()) }, '← Back'),
      h(
        'form.panel.col.fade-in',
        { onsubmit: (e: Event) => (e.preventDefault(), go()) },
        h('p.h1', 'Got a challenge?'),
        h('p.sub', 'Type the stage code your friend sent. You get the exact same room.'),
        input,
        err,
        h('button.btn.big', { type: 'submit' }, 'Play it'),
      ),
    );
    setTimeout(() => input.focus(), 60);
  }

  openChallenge(c: Challenge) {
    const start = () => this.startStage(c.id, c);
    if (!this.store.data.seenControls) this.showControlsIntro(start);
    else start();
  }

  showControlsIntro(then: () => void) {
    this.clearUI();
    this.screen = 'intro';
    const touch = this.showTouch();
    this.screenEl.append(
      h(
        'div.panel.col.fade-in',
        { style: { textAlign: 'center' } },
        h('p.h1', 'How to play'),
        touch
          ? h('div.controls-demo', h('span.kb', '◀'), h('span.kb', '▶'), h('span.sub', 'left thumb: move'), h('span.kb', { style: { width: '64px', height: '64px' } }, '▲'), h('span.sub', 'right thumb: jump'))
          : h('div.controls-demo', h('span.kb', '←'), h('span.kb', '→'), h('span.sub', 'move'), h('span.kb', { style: { width: '84px', borderRadius: '14px' } }, 'Space'), h('span.sub', 'jump  ·  R restart  ·  Esc pause')),
        h('p.sub', 'Every room has a trick. Deaths are free and retries are instant.'),
        h('p.sub', 'Hold jump longer to jump higher.'),
        h(
          'button.btn.big',
          {
            onclick: () => {
              this.store.data.seenControls = true;
              this.store.save();
              this.audio.play('ui');
              tryFullscreen();
              then();
            },
          },
          "Let's go",
        ),
      ),
    );
  }

  // ================================================================== play
  startStage(id: string, challenge: Challenge | null, preview = false) {
    const def = LEVEL_BY_ID.get(id);
    if (!def) return this.showTitle();
    if (!this.store.data.seenControls && !challenge) {
      return this.showControlsIntro(() => this.startStage(id, null, preview));
    }
    this.endSession();
    if (preview) {
      const rec = this.store.data.stages[id];
      this.preview = { id, rec: rec ? JSON.stringify(rec) : undefined, deaths: this.store.data.totalDeaths };
      this.store.log('preview', id);
    }
    this.clearUI();
    this.screen = 'play';
    this.setMenuCity(def.city);
    this.renderer.particles.clear();
    this.input.clear();
    const firstVisit = !levelsOf(def.city).some((l) => (this.store.data.stages[l.id]?.attempts ?? 0) > 0);
    this.session = new Session(this, def, challenge);
    this.store.log('start', def.id, { challenge: !!challenge });
    this.hud = new Hud(this, this.session);
    if (preview) this.hud.el.querySelector('.tl')?.append(h('div.pill.previewbadge', 'Preview'));
    const sp = this.session.world.player;
    this.irisOpen(sp.cx, sp.cy);
    if (firstVisit && !challenge) this.postcard(def.city);
    else this.stageBanner(def);
    document.body.classList.add('playing');
    this.audio.duckMusic(false);
  }

  endSession() {
    if (this.session && !this.session.done) {
      this.store.log('quit', this.session.def.id, { attempts: this.session.attempt, deaths: this.session.deaths });
    }
    this.session = null;
    if (this.preview) {
      // a preview leaves the save as it found it: no attempts, deaths, stars or unlocks from it
      const { id, rec, deaths } = this.preview;
      if (rec === undefined) delete this.store.data.stages[id];
      else this.store.data.stages[id] = JSON.parse(rec);
      this.store.data.totalDeaths = deaths;
      this.preview = null;
    }
    this.hint?.close(true);
    this.hud?.destroy();
    this.hud = null;
    document.body.classList.remove('playing');
    this.store.save();
  }

  togglePause() {
    if (!this.session || this.session.done) return;
    if (this.session.paused) this.resume();
    else this.pause();
  }

  pause() {
    const s = this.session;
    if (!s || s.done) return;
    s.paused = true;
    this.input.clear();
    this.audio.duckMusic(true);
    this.modalEl.innerHTML = '';
    const rec = this.store.stage(s.def.id);
    const hintOk = s.deaths >= 3 || rec.deaths >= 5;
    this.modalEl.append(
      h(
        'div.layer',
        h(
          'div.panel.col.fade-in',
          { style: { minWidth: '260px' } },
          h('p.h2', `${s.def.id} · ${s.def.name}`),
          h('p.sub', `${s.deaths} deaths this visit`),
          h('button.btn.big', { style: { width: '100%' }, onclick: () => (this.audio.play('ui'), this.resume()) }, '▶  Resume'),
          h(
            'div.row',
            { style: { flexWrap: 'nowrap', width: '100%' } },
            h('button.btn.ghost', { style: { flex: 1 }, onclick: () => (this.audio.play('ui'), this.resume(), s.restart()) }, '↻ Restart'),
            h('button.btn.ghost', { style: { flex: 1 }, disabled: !hintOk, onclick: () => this.showHint() }, '💡 Hint'),
          ),
          h(
            'div.row',
            { style: { flexWrap: 'nowrap', width: '100%' } },
            h('button.btn.ghost', { style: { flex: 1 }, onclick: () => (this.audio.play('ui'), this.showSettings('pause')) }, '⚙ Settings'),
            h('button.btn.ghost', { style: { flex: 1 }, onclick: () => (this.audio.play('uiBack'), this.leaveToStages()) }, '⏏ Leave'),
          ),
          hintOk ? null : h('p.tiny', 'Hints unlock after a few deaths. Try first!'),
        ),
      ),
    );
  }

  resume() {
    const s = this.session;
    this.modalEl.innerHTML = '';
    if (!s) return;
    s.paused = false;
    this.input.clear();
    this.audio.duckMusic(false);
    this.acc = 0;
  }

  /** The hint: a slim strip under the HUD. Play goes on (from the pause menu it resumes), the stage stays
   *  in view, and a death or a restart closes it. It may name what's ahead: the player asked. */
  showHint() {
    const s = this.session;
    if (!s || s.done) return;
    s.hintUsed = true;
    this.store.stage(s.def.id).hint = true;
    this.store.log('hint', s.def.id, { deaths: s.deaths });
    this.audio.play('ui');
    if (s.paused) this.resume();
    this.hint?.close(true);
    // the postcard and the stage title sit in the same spot: the hint replaces them
    this.hudEl.querySelectorAll('.postcard, .stagebanner').forEach((e) => e.remove());
    const id = s.def.id;
    // long stages: open on the stretch Dad is in, the rest a tap away; other stages: where you stopped reading
    const parts = s.def.hintParts?.length ? partPages(s.def.hintParts) : null;
    const pages = parts?.pages.length ? parts.pages : hintPages(s.def.hint);
    const partOf = parts?.pages.length ? parts.partOf : null;
    const start = partOf ? Math.max(0, partOf.findIndex((i) => i >= hintPartAt(s.def, s.world.player.cx))) : (this.hintPage.get(id) ?? 0);
    const sheet = new HintSheet(
      pages,
      start,
      () => this.hint === sheet && (this.hint = null),
      (p) => this.hintPage.set(id, p),
      partOf,
    );
    this.hint = sheet;
    this.hintAt = { attempt: s.attempt, deaths: s.deaths, restarts: s.restarts };
    this.hudEl.appendChild(sheet.el);
  }

  /** every frame while a hint is up: close it on a death or restart; see-through over Dad or the door */
  hintTick() {
    const sheet = this.hint,
      s = this.session;
    if (!sheet) return;
    if (!s || s.done || s.attempt !== this.hintAt.attempt || s.deaths !== this.hintAt.deaths || s.restarts !== this.hintAt.restarts) return sheet.close();
    const w = s.world,
      v = this.view,
      k = v.s;
    const left = v.ox - this.renderer.camX * k;
    const mirror = w.flags.view === 'mirror';
    const box = (x: number, y: number, bw: number, bh: number) => {
      let sx = left + x * k;
      if (mirror) sx = v.W - sx - bw * k;
      return { x: sx, y: v.oy + y * k, w: bw * k, h: bh * k };
    };
    const p = w.player;
    if (s.def.hintParts?.length) sheet.setHere(hintPartAt(s.def, p.cx));
    const boxes = [box(p.x, p.y, p.w, p.h)];
    for (const ex of w.exits) {
      const z = ex.zone();
      if (z) boxes.push(box(z.x, z.y, z.w, z.h));
    }
    sheet.seeThrough(boxes);
  }

  // ============================================================ home city
  /** "Where are you from?": on first launch, or from settings. */
  showHomePicker(from: 'first' | 'title' | 'pause') {
    const d = this.store.data;
    const done = () => {
      if (from === 'pause' && this.session) this.showSettings('pause');
      else if (from === 'title') this.showSettings('title');
      else this.showTitle();
    };
    const panel = homePicker({
      current: homeId(d) || undefined,
      first: from === 'first',
      status: (c) => this.chapterStatus(c),
      onPick: (c) => {
        setHome(d, c.id);
        this.store.save(true);
        this.store.log('home', c.id);
        this.audio.play('ui');
        done();
        toast(this.ui, `${cityName(c)}: ${homeLine(c, (x) => this.chapterStatus(x))}`);
      },
      onSkip: () => {
        if (homeId(d) === undefined) setHome(d, '');
        this.store.save(true);
        this.audio.play('uiBack');
        done();
      },
      onClear: () => {
        setHome(d, '');
        this.store.save(true);
        this.audio.play('uiBack');
        done();
      },
    });
    if (from === 'pause') {
      this.modalEl.innerHTML = '';
      this.modalEl.append(h('div.layer', panel));
    } else {
      this.screen = 'home';
      this.clearUI();
      this.screenEl.append(panel);
    }
  }

  leaveToStages() {
    if (this.preview) return this.showJourney(chapterOf(this.session?.def.city ?? this.menuCity).id);
    const city = this.session?.def.city ?? this.menuCity;
    this.showStages(city);
  }

  onStageClear(s: Session) {
    const def = s.def;
    const store = this.store;
    if (this.preview) {
      store.log('preview_clear', def.id, { deaths: s.deaths });
      this.audio.duckMusic(true);
      this.showJourney(chapterOf(def.city).id);
      toast(this.ui, 'Home, sweet trap. Now come back the long way!');
      return;
    }
    const rec = store.stage(def.id);
    const t = s.lastTime ?? s.elapsed;
    const firstClear = !rec.cleared;
    const prevBest = rec.best;
    rec.cleared = true;
    rec.clears++;
    if (s.world.flags.collected) rec.got = true;
    if (rec.best === null || t < rec.best) rec.best = +t.toFixed(2);
    if (rec.firstClearDeaths === null) rec.firstClearDeaths = s.deaths;
    if (rec.bestDeaths === null || s.deaths < rec.bestDeaths) rec.bestDeaths = s.deaths;
    store.log('clear', def.id, { deaths: s.deaths, t: +t.toFixed(2), attempts: s.attempt, hint: s.hintUsed, challenge: !!s.challenge });
    const cityDone = levelsOf(def.city).every((l) => store.data.stages[l.id]?.cleared);
    const newStamp = cityDone && store.data.stamps[def.city] === undefined;
    if (newStamp) {
      store.data.stamps[def.city] = levelsOf(def.city).reduce((a, l) => a + (store.data.stages[l.id]?.firstClearDeaths ?? 0), 0);
      store.log('city', def.city, { deaths: store.data.stamps[def.city] });
    }
    store.save(true);
    this.audio.duckMusic(true);
    if (newStamp) this.showCityEscaped(def.city, s);
    else this.showResult(s, t, firstClear, prevBest);
  }

  private shareStage(def: LevelDef, deaths: number, t: number | null) {
    const th = THEMES[def.city];
    const mine = homeChapter(this.store.data)?.city === def.city;
    const card = makeCard({ kind: 'stage', code: def.id, headline: `Escaped ${th.name}`, deaths, time: t, character: this.store.data.settings.character, home: mine });
    const text = `Escaped ${th.name} ${def.id} "${def.name}"${mine ? ', my home city' : ''}. ${deaths} ${deaths === 1 ? 'death' : 'deaths'}.${t !== null ? ` Best clear: ${t.toFixed(1)}s.` : ''} Try ${def.id} in ${GAME.title}!`;
    this.doShare(card, text, this.shareLink(def.id, t, deaths));
  }

  /** Build helper: render the app icon (used to generate PNG icons for the PWA and native apps). */
  debugIcon(size: number, maskable = false, transparent = false): string {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    drawIcon(c.getContext('2d')!, size, { maskable, transparent });
    return c.toDataURL('image/png');
  }

  /** Debug/QA helper: the share card for a stage as a data URL. */
  debugCard(code: string): string {
    const def = LEVEL_BY_ID.get(code)!;
    return makeCard({ kind: 'stage', code, headline: `Escaped ${THEMES[def.city].name}`, deaths: 18, time: 24.6, character: this.store.data.settings.character }).toDataURL('image/png');
  }

  shareLink(id: string, t: number | null, d: number): string {
    let base = GAME.shareUrl;
    if (!base && !inFrame && !isNative && !inAndroidShell && /^https?:/.test(location.protocol)) base = location.origin + location.pathname;
    if (!base) return '';
    const q = new URLSearchParams({ c: id, d: String(d) });
    if (t !== null) q.set('t', t.toFixed(1));
    return `${base}?${q.toString()}`;
  }

  private async doShare(card: HTMLCanvasElement, text: string, url: string) {
    this.audio.play('ui');
    this.store.log('share_open', undefined, { native: isNative });
    const r = await shareCard(card, text, url);
    if (r.ok) {
      this.store.log('share_done', undefined, { how: r.how });
      return;
    }
    // fallback: show the card and the text to copy
    const full = url ? `${text}\n${url}` : text;
    const img = h('img.cardimg', { src: card.toDataURL('image/png'), alt: 'Result card' });
    const box = h('div.copybox', full);
    const layer = h(
      'div.layer',
      { style: { zIndex: 70, background: 'rgba(10,8,20,0.6)' } },
      h(
        'div.panel.row.fade-in',
        { style: { alignItems: 'center', flexWrap: 'nowrap', gap: '16px' } },
        img,
        h(
          'div.col',
          { style: { alignItems: 'stretch', maxWidth: '300px' } },
          h('p.h2', 'Challenge a friend'),
          h('p.sub', 'Long-press the card to save it, then send it with this text:'),
          box,
          h(
            'button.btn',
            {
              onclick: async () => {
                const ok = await copyText(full);
                toast(this.ui, ok ? 'Copied! Paste it in WhatsApp.' : 'Select the text above to copy it.');
                if (ok) this.store.log('share_done', undefined, { how: 'copy' });
              },
            },
            '📋 Copy text',
          ),
          h('button.btn.ghost', { onclick: () => layer.remove() }, 'Close'),
        ),
      ),
    );
    this.modalEl.appendChild(layer);
  }

  showResult(s: Session, t: number, firstClear: boolean, prevBest: number | null) {
    const def = s.def;
    const rec = this.store.stage(def.id);
    this.screen = 'result';
    this.modalEl.innerHTML = '';
    const levels = levelsOf(def.city);
    const next = levels[def.index] ?? null;
    const newBest = prevBest === null || t < prevBest;
    let vs: HTMLElement | null = null;
    if (s.challenge?.t !== undefined) {
      const diff = s.challenge.t - t;
      vs = h('div.vs' + (diff >= 0 ? '.win' : '.lose'), diff >= 0 ? `You beat their ${s.challenge.t.toFixed(1)}s by ${diff.toFixed(1)}s!` : `They were ${(-diff).toFixed(1)}s faster. Once more?`);
    } else if (s.challenge?.d !== undefined) {
      vs = h('div.vs' + (s.deaths <= s.challenge.d ? '.win' : '.lose'), s.deaths <= s.challenge.d ? `Fewer deaths than your friend (${s.challenge.d})!` : `Your friend needed only ${s.challenge.d} deaths.`);
    }
    const quote = def.par
      ? t <= def.par
        ? h('p.sub', `Faster than the designer's ${def.par.toFixed(1)}s. Respect.`)
        : h('p.sub', `Designer's time: ${def.par.toFixed(1)}s. Can you catch it?`)
      : null;
    const buttons = h('div.row');
    if (s.challenge && !next) {
      buttons.append(h('button.btn.big', { onclick: () => this.startStage(def.id, s.challenge) }, '↻ Again'));
    }
    if (next && this.isUnlocked(next)) buttons.append(h('button.btn.big', { onclick: () => (this.audio.play('ui'), this.startStage(next.id, null)) }, `Next ▶`));
    else if (!next && !s.challenge) {
      const nx = this.nextStage();
      if (nx) buttons.append(h('button.btn.big', { onclick: () => (this.audio.play('ui'), this.startStage(nx.id, null)) }, `${chapterOf(nx.city).name} ▶`));
    }
    buttons.append(
      h('button.btn.ghost', { onclick: () => (this.audio.play('ui'), this.startStage(def.id, s.challenge)) }, '↻ Retry for time'),
      h('button.btn.light', { onclick: () => this.shareStage(def, s.deaths, t) }, '📣 Challenge a friend'),
    );
    if (s.challenge && !this.store.data.stages['TVM-01']?.cleared)
      buttons.append(h('button.btn.ghost', { onclick: () => this.startStage('TVM-01', null) }, 'Start the journey'));
    this.modalEl.append(
      h(
        'div.layer',
        h(
          'div.panel.result.fade-in',
          h('p.sub', `${def.id} · ${def.name}`),
          h('div.headline', firstClear ? 'Escaped!' : newBest ? 'New best!' : 'Escaped again!'),
          h(
            'div.stats',
            h('div.stat', h('b', String(s.deaths)), h('span', s.deaths === 1 ? 'death' : 'deaths')),
            h('div.stat', h('b', fmtTime(t)), h('span', 'this clear')),
            h('div.stat.best', h('b', fmtTime(rec.best)), h('span', 'your best')),
          ),
          this.starRow(def),
          vs,
          quote,
          buttons,
          h('div', { style: { marginTop: '8px' } }, h('button.btn.ghost.small', { onclick: () => (this.audio.play('uiBack'), this.showJourney(chapterOf(def.city).id)) }, '🗺 Map')),
        ),
      ),
    );
  }

  /** Three stars: cleared, beat the designer's time, found the hidden item. */
  private starRow(def: LevelDef): HTMLElement {
    const r = this.store.data.stages[def.id];
    const got = [!!r?.cleared, !!(r && r.best !== null && def.par !== undefined && r.best <= def.par), !!r?.got];
    const labels = ['Escaped', def.par !== undefined ? `Under ${def.par.toFixed(1)}s` : 'Fast', 'Hidden item'];
    return h('div.starrow', ...got.map((g, i) => h('div.star' + (g ? '.on' : ''), h('b', g ? '★' : '☆'), h('span', labels[i]))));
  }

  showCityEscaped(city: CityId, s: Session) {
    this.screen = 'result';
    this.modalEl.innerHTML = '';
    const th = THEMES[city];
    const deaths = this.store.data.stamps[city];
    const here = chapterOf(city);
    // the next chapter on the main route that you can play now
    const nextCh = CHAPTERS.slice(CHAPTERS.indexOf(here) + 1).find((c) => c.city && !c.bonus && this.chapterStatus(c) === 'open') ?? CHAPTERS.slice(CHAPTERS.indexOf(here) + 1).find((c) => !c.bonus) ?? null;
    const nextCity = nextCh?.city ?? null;
    const L = LINES[city];
    // challenge friends with the stage that fooled you most
    const worst = levelsOf(city).reduce((a, l) => ((this.store.data.stages[l.id]?.deaths ?? 0) > (this.store.data.stages[a.id]?.deaths ?? 0) ? l : a), levelsOf(city)[0]);
    const bestT = this.store.data.stages[worst.id]?.best ?? null;
    setTimeout(() => {
      this.audio.play('stamp');
      if (this.store.data.settings.vibration) buzz('heavy');
      this.fx.shake = 5;
    }, 420);
    const share = () => {
      const mine = homeChapter(this.store.data)?.city === city;
      const card = makeCard({ kind: 'city', code: worst.id, headline: `Escaped ${th.name}`, deaths, time: bestT, character: this.store.data.settings.character, home: mine });
      const text = `Escaped ${th.name}${mine ? ', my home city' : ''}. ${deaths} deaths.${bestT !== null ? ` Best clear: ${bestT.toFixed(1)}s.` : ''} Try ${worst.id} in ${GAME.title}!`;
      this.doShare(card, text, this.shareLink(worst.id, bestT, this.store.data.stages[worst.id]?.firstClearDeaths ?? deaths));
    };
    const nextLine = nextCh ? (nextCity && this.chapterStatus(nextCh) === 'open' ? `Next stop: ${nextCh.name}.` : `Next stop: ${nextCh.name}, coming in the next update.`) : 'You crossed all of India!';
    this.modalEl.append(
      h(
        'div.layer',
        h(
          'div.passport.fade-in',
          h('p.h2', `${th.name} escaped!`),
          h('div.big-stamp', h('div', th.name.toUpperCase(), h('b', `${deaths}☠`), 'ESCAPED')),
          h('p.sub', `${s.def.id} cleared in ${fmtTime(s.lastTime)}. ${nextLine}`),
          h('p.sub', { style: { fontStyle: 'italic' } }, `Tara: "${bi(L.cleared).main}"`, bi(L.cleared).en ? h('span.en', bi(L.cleared).en!) : null),
          h(
            'div.row',
            { style: { marginTop: '10px' } },
            h('button.btn.big', { onclick: () => (this.audio.play('ui'), this.showJourney(nextCh?.id ?? here.id, here.id)) }, nextCh ? `To ${nextCh.name} ▶` : 'Map ▶'),
            h('button.btn.light', { onclick: share }, `📣 Share · try ${worst.id}`),
          ),
        ),
      ),
    );
  }

  // ============================================================== settings
  showSettings(from: 'title' | 'pause') {
    const s = this.store.data.settings;
    const save = () => {
      this.store.save();
      this.applySettings();
    };
    const toggle = (label: string, sub: string, key: keyof typeof s) => {
      const inp = h('input.toggle', { type: 'checkbox' }) as HTMLInputElement;
      inp.checked = !!s[key];
      inp.addEventListener('change', () => {
        (s as any)[key] = inp.checked;
        this.audio.play('click');
        save();
      });
      return h('label.setting', h('span.lbl', label, sub ? h('small', sub) : null), inp);
    };
    const slider = (label: string, key: 'sfxVol' | 'musicVol' | 'btnOpacity', min: number, max: number) => {
      const inp = h('input', { type: 'range', min, max, step: 0.05, value: s[key] }) as HTMLInputElement;
      inp.addEventListener('input', () => {
        s[key] = +inp.value;
        save();
      });
      return h('label.setting', h('span.lbl', label), inp);
    };
    const seg = <K extends 'btnSize' | 'character'>(label: string, key: K, opts: [string, string][]) => {
      const wrap = h('div.seg');
      for (const [v, l] of opts) {
        const b = h('button' + ((s[key] as string) === v ? '.on' : ''), { type: 'button' }, l);
        b.addEventListener('click', () => {
          (s as any)[key] = v;
          wrap.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
          b.classList.add('on');
          this.audio.play('click');
          save();
        });
        wrap.append(b);
      }
      return h('div.setting', h('span.lbl', label), wrap);
    };
    const panel = h(
      'div.panel.settings.scroll.fade-in',
      h('div.row', { style: { justifyContent: 'space-between' } }, h('p.h1', 'Settings'), h('button.btn.small', { onclick: () => close() }, 'Done')),
      h(
        'div.grid',
        h('div.section', 'Sound'),
        toggle('Sound effects', '', 'sfx'),
        slider('Effects volume', 'sfxVol', 0, 1),
        toggle('Music', 'tanpura + tabla', 'music'),
        slider('Music volume', 'musicVol', 0, 1),
        h('div.section', 'Feel'),
        toggle('Vibration', '', 'vibration'),
        toggle('Screen shake', '', 'shake'),
        toggle('Reduced motion', 'no shake, flashes or rain', 'reducedMotion'),
        toggle('Show timer', '', 'showTimer'),
        h('div.section', 'Touch controls'),
        seg('Button size', 'btnSize', [
          ['S', 'S'],
          ['M', 'M'],
          ['L', 'L'],
          ['XL', 'XL'],
        ]),
        slider('Button opacity', 'btnOpacity', 0.1, 0.8),
        toggle('Left-handed', 'jump on the left', 'swap'),
        toggle('Sharper graphics', 'uses more battery', 'hd'),
        h('div.section', 'Character'),
        seg('Play as', 'character', [
          ['papa', 'Papa'],
          ['mummy', 'Mummy'],
        ]),
        h('div.section', 'Home city'),
        h(
          'div.setting',
          h('span.lbl', 'Where are you from?', h('small', ((c) => (c ? cityName(c) : 'not set'))(homeChapter(this.store.data)))),
          h('button.btn.small.ghost', { onclick: () => (this.audio.play('ui'), this.showHomePicker(from)) }, homeChapter(this.store.data) ? 'Change' : 'Pick'),
        ),
        h('div.section', 'Progress'),
        h(
          'div.setting',
          h('span.lbl', 'Reset progress', h('small', 'clears stamps, times and deaths')),
          h(
            'button.btn.small',
            {
              style: { background: 'var(--bad)', color: '#fff' },
              onclick: (e: Event) => {
                const b = e.currentTarget as HTMLButtonElement;
                if (b.dataset.armed) {
                  const home = homeId(this.store.data);
                  this.store.reset();
                  if (home !== undefined) setHome(this.store.data, home);
                  this.store.save(true);
                  toast(this.ui, 'Progress reset.');
                  close();
                } else {
                  b.dataset.armed = '1';
                  b.textContent = 'Tap again to confirm';
                }
              },
            },
            'Reset',
          ),
        ),
        h('div.setting', h('span.lbl', 'Version', h('small', isNative ? 'native app' : inAndroidShell ? 'Android test build' : 'web')), h('span.tiny', { onclick: () => this.tapVersion() }, `v${GAME.version}`)),
      ),
    );
    const close = () => {
      this.audio.play('uiBack');
      if (from === 'pause' && this.session) this.pause();
      else this.showTitle();
    };
    if (from === 'pause') {
      this.modalEl.innerHTML = '';
      this.modalEl.append(h('div.layer', panel));
    } else {
      this.screen = 'settings';
      this.clearUI();
      this.screenEl.append(panel);
    }
  }

  /** Hidden playtest tools (tap the version 5 times): A/B rival variants and a local event log. */
  showPlaytest() {
    const d = this.store.data as any;
    const s = this.store.data.settings;
    const counts: Record<string, { deaths: number; clears: number; quits: number; hints: number }> = {};
    for (const ev of this.store.data.log) {
      if (!ev.id) continue;
      counts[ev.id] ??= { deaths: 0, clears: 0, quits: 0, hints: 0 };
      if (ev.e === 'death') counts[ev.id].deaths++;
      if (ev.e === 'clear') counts[ev.id].clears++;
      if (ev.e === 'quit') counts[ev.id].quits++;
      if (ev.e === 'hint') counts[ev.id].hints++;
    }
    const rows = LEVELS.map((l) => `${l.id}  deaths ${counts[l.id]?.deaths ?? 0}  clears ${counts[l.id]?.clears ?? 0}  quits ${counts[l.id]?.quits ?? 0}  hints ${counts[l.id]?.hints ?? 0}`).join('\n');
    const variant = h('div.seg');
    for (const [v, l] of [
      ['tara', 'Tara'],
      ['bandar', 'Mascot'],
      ['none', 'No rival'],
    ] as const) {
      const b = h('button' + (s.rival === v ? '.on' : ''), { type: 'button' }, l);
      b.onclick = () => {
        s.rival = v;
        this.store.save();
        variant.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
      };
      variant.append(b);
    }
    this.modalEl.innerHTML = '';
    const layer = h(
      'div.layer',
      { style: { background: 'rgba(10,8,20,0.6)' } },
      h(
        'div.panel.col.scroll.fade-in',
        { style: { alignItems: 'stretch', width: 'min(620px, 94vw)' } },
        h('p.h2', '🧪 Playtest'),
        h('div.setting', h('span.lbl', 'Rival variant', h('small', 'same traps and timing; compare enjoyment')), variant),
        h('div.copybox', `sessions ${this.store.data.sessions} · total deaths ${this.store.data.totalDeaths} · events ${this.store.data.log.length}\n${rows}`),
        h(
          'div.row',
          h(
            'button.btn.small',
            {
              onclick: async () => {
                const ok = await copyText(JSON.stringify({ version: GAME.version, exportedAt: new Date().toISOString(), save: this.store.data }, null, 0));
                toast(this.ui, ok ? 'Log copied as JSON' : 'Copy blocked here');
              },
            },
            'Copy log JSON',
          ),
          h(
            'button.btn.small.ghost',
            {
              onclick: () => {
                d.unlockAll = !d.unlockAll;
                this.store.save();
                toast(this.ui, d.unlockAll ? 'All stages unlocked' : 'Normal unlocks');
              },
            },
            'Toggle unlock all',
          ),
          h('button.btn.small.ghost', { onclick: () => ((this.store.data.log = []), this.store.save(), toast(this.ui, 'Log cleared')) }, 'Clear log'),
          h('button.btn.small', { onclick: () => (layer.remove(), this.showTitle()) }, 'Close'),
        ),
      ),
    );
    this.modalEl.append(layer);
  }
}

/** The in-game HUD (DOM): stage name, deaths, timer, hint and pause. */
class Hud {
  app: App;
  s: Session;
  el: HTMLElement;
  deathsEl: HTMLElement;
  timerEl: HTMLElement;
  nameEl: HTMLElement;
  hintBtn: HTMLElement;
  livesEl: HTMLElement;
  hearts: HTMLElement[] = [];
  private lastLives = LIVES;
  private lastDeaths = -1;
  private lastTimer = '';
  private shownAt = performance.now();

  constructor(app: App, s: Session) {
    this.app = app;
    this.s = s;
    const def = s.def;
    this.nameEl = h('div.pill.name', h('span.code', def.id), def.name);
    this.deathsEl = h('span', '0');
    this.timerEl = h('span', '0.0s');
    for (let i = 0; i < LIVES; i++) this.hearts.push(h('i.hp'));
    this.livesEl = h('div.pill.lives', { 'aria-label': `${LIVES} lives` }, ...this.hearts);
    this.hintBtn = h(
      'button.btn.icon.hint',
      {
        style: { display: 'none' },
        'aria-label': 'Hint',
        onclick: (e: Event) => {
          e.stopPropagation();
          app.showHint();
        },
      },
      '💡',
    );
    const pauseBtn = h(
      'button.btn.icon',
      {
        'aria-label': 'Pause',
        onclick: (e: Event) => {
          e.stopPropagation();
          app.audio.play('ui');
          app.togglePause();
        },
      },
      '❚❚',
    );
    const timerPill = h('div.pill', '⏱ ', this.timerEl);
    if (!app.store.data.settings.showTimer) timerPill.style.display = 'none';
    this.el = h(
      'div.hud',
      h('div.tl', this.nameEl),
      h('div.tc', this.livesEl, h('div.pill', '☠ ', this.deathsEl), timerPill),
      h('div.tr', this.hintBtn, pauseBtn),
      s.challenge?.t !== undefined || s.challenge?.d !== undefined
        ? h('div.banner', h('div.pill', '🎟 ', s.challenge.t !== undefined ? `Beat ${s.challenge.t.toFixed(1)}s` : `Beat ${s.challenge.d} deaths`))
        : null,
      h(
        'div.rotate',
        h('div.phone'),
        h('p.h2', 'Turn your phone sideways'),
        h('p.sub', 'Level Devil Dad plays best in landscape.'),
        h('button.btn.ghost.small', { onclick: () => document.body.classList.add('portrait-ok') }, 'Play upright anyway'),
      ),
    );
    app.hudEl.innerHTML = '';
    app.hudEl.append(this.el);
  }

  refresh(force = false) {
    const s = this.s;
    if (s.lives !== this.lastLives || force) {
      // hearts: lost ones pop and go grey; a refill fills them all again
      const lost = s.lives < this.lastLives;
      this.hearts.forEach((el, i) => {
        const on = i < s.lives;
        el.classList.toggle('off', !on);
        if (lost && !on && i >= s.lives && i < this.lastLives) {
          el.classList.remove('pop');
          void el.offsetWidth;
          el.classList.add('pop');
        }
        if (!lost && on && i >= this.lastLives) {
          el.classList.remove('fill');
          void el.offsetWidth;
          el.classList.add('fill');
        }
      });
      this.livesEl.classList.toggle('low', s.lives <= 2);
      this.livesEl.setAttribute('aria-label', `${s.lives} ${s.lives === 1 ? 'life' : 'lives'} left`);
      this.lastLives = s.lives;
    }
    if (s.deaths !== this.lastDeaths || force) {
      this.lastDeaths = s.deaths;
      this.deathsEl.textContent = String(s.deaths);
      const rec = this.app.store.data.stages[s.def.id];
      const show = (s.deaths >= 5 || (rec?.deaths ?? 0) >= 8) && !s.done;
      this.hintBtn.style.display = show ? '' : 'none';
    }
    const t = s.elapsed.toFixed(1) + 's';
    if (t !== this.lastTimer) {
      this.lastTimer = t;
      this.timerEl.textContent = t;
    }
    if (performance.now() - this.shownAt > 2600) this.nameEl.style.opacity = '0.55';
    this.app.hintTick();
  }

  destroy() {
    this.el.remove();
  }
}
