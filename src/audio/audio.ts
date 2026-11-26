import type { CityId } from '../game/constants';

/**
 * Every sound is synthesized with Web Audio, so the game ships with no audio
 * files and works offline. Music is a light tanpura drone plus tabla-style
 * percussion and a short bansuri-like motif, per city.
 */
export class Audio {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private sfxBus!: GainNode;
  private musicBus!: GainNode;
  private noise!: AudioBuffer;
  sfxOn = true;
  musicOn = true;
  sfxVol = 0.8;
  musicVol = 0.5;
  private musicCity: CityId | null = null;
  private nextNote = 0;
  private step = 0;
  private timer: number | null = null;
  private duck = 1;
  private lastPlay = new Map<string, number>();

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC({ latencyHint: 'interactive' });
      } catch {
        return;
      }
      const c = this.ctx;
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master = c.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(comp).connect(c.destination);
      this.sfxBus = c.createGain();
      this.musicBus = c.createGain();
      this.sfxBus.connect(this.master);
      this.musicBus.connect(this.master);
      const len = c.sampleRate * 1;
      this.noise = c.createBuffer(1, len, c.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  suspend() {
    this.ctx?.suspend().catch(() => {});
  }
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  applyVolumes() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.sfxBus.gain.setTargetAtTime(this.sfxOn ? this.sfxVol : 0, t, 0.02);
    this.musicBus.gain.setTargetAtTime(this.musicOn ? this.musicVol * 0.55 * this.duck : 0, t, 0.08);
  }

  // ----------------------------------------------------------- primitives
  private env(g: GainNode, t: number, a: number, peak: number, d: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  private tone(type: OscillatorType, f0: number, f1: number, t: number, dur: number, vol: number, bus?: AudioNode, a = 0.004) {
    const c = this.ctx!;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    this.env(g, t, a, vol, dur);
    o.connect(g).connect(bus ?? this.sfxBus);
    o.start(t);
    o.stop(t + a + dur + 0.05);
    return o;
  }

  private burst(t: number, dur: number, vol: number, type: BiquadFilterType, freq: number, q = 1, bus?: AudioNode, f1?: number) {
    const c = this.ctx!;
    const s = c.createBufferSource();
    s.buffer = this.noise;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    f.Q.value = q;
    const g = c.createGain();
    this.env(g, t, 0.003, vol, dur);
    s.connect(f).connect(g).connect(bus ?? this.sfxBus);
    s.start(t, Math.random() * 0.5);
    s.stop(t + dur + 0.05);
  }

  private formant(t: number, pitch: number, dur: number, vol: number, f1: number, f2: number) {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(pitch, t);
    o.frequency.exponentialRampToValueAtTime(pitch * 0.86, t + dur);
    const g = c.createGain();
    this.env(g, t, 0.012, vol, dur);
    for (const ff of [f1, f2]) {
      const bp = c.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = ff;
      bp.Q.value = 7;
      o.connect(bp).connect(g);
    }
    g.connect(this.sfxBus);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  // ------------------------------------------------------------------ sfx
  play(name: string, intensity = 1) {
    if (!this.ctx || !this.sfxOn || name === 'none') return;
    const c = this.ctx;
    const now = c.currentTime;
    const last = this.lastPlay.get(name) ?? -1;
    if (now - last < 0.035) return; // de-dupe bursts
    this.lastPlay.set(name, now);
    const t = now + 0.005;
    switch (name) {
      case 'jump':
        this.tone('square', 300, 620, t, 0.09, 0.07);
        this.tone('sine', 600, 900, t, 0.06, 0.04);
        break;
      case 'land':
        this.burst(t, 0.06, 0.12 * intensity, 'lowpass', 500);
        this.tone('sine', 120, 70, t, 0.06, 0.08 * intensity);
        break;
      case 'bonk':
        this.tone('sine', 520, 380, t, 0.05, 0.08);
        break;
      case 'die':
        this.tone('triangle', 640, 70, t, 0.32, 0.22);
        this.tone('square', 220, 55, t + 0.02, 0.22, 0.07);
        this.burst(t, 0.16, 0.22, 'bandpass', 1400, 0.8);
        break;
      case 'win':
        [523, 659, 784, 1047].forEach((f, i) => this.tone('triangle', f, f, t + i * 0.075, 0.18, 0.13));
        this.tone('sine', 2093, 2093, t + 0.3, 0.35, 0.05);
        break;
      case 'stamp':
        this.tone('sine', 140, 60, t, 0.16, 0.3);
        this.burst(t, 0.09, 0.25, 'lowpass', 900);
        break;
      case 'collapse':
      case 'rumble':
        this.burst(t, 0.42, 0.22, 'lowpass', 420, 0.7, undefined, 140);
        this.tone('sine', 70, 45, t, 0.35, 0.12);
        break;
      case 'slide':
        this.burst(t, 0.22, 0.12, 'bandpass', 700, 1.2, undefined, 300);
        break;
      case 'spikes':
        this.burst(t, 0.07, 0.2, 'highpass', 3500);
        this.tone('sine', 1900, 1400, t, 0.12, 0.08);
        break;
      case 'poof':
        this.burst(t, 0.16, 0.14, 'bandpass', 1100, 0.9, undefined, 500);
        break;
      case 'thud':
        this.tone('sine', 110, 40, t, 0.24, 0.3);
        this.burst(t, 0.18, 0.2, 'lowpass', 600);
        break;
      case 'creak':
        this.tone('sawtooth', 140, 95, t, 0.3, 0.035, undefined, 0.05);
        break;
      case 'snap':
        this.burst(t, 0.04, 0.25, 'highpass', 2000);
        break;
      case 'honk':
        // the classic bulb horn: "paa-pom"
        for (const [dt, f] of [
          [0, 390],
          [0.13, 330],
        ] as const) {
          const o = c.createOscillator();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f, t + dt);
          o.frequency.exponentialRampToValueAtTime(f * 0.94, t + dt + 0.1);
          const lp = c.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 1500;
          const g = c.createGain();
          this.env(g, t + dt, 0.01, 0.09, 0.1);
          o.connect(lp).connect(g).connect(this.sfxBus);
          o.start(t + dt);
          o.stop(t + dt + 0.16);
        }
        break;
      case 'signalGo':
        this.tone('sine', 880, 880, t, 0.08, 0.08);
        this.tone('sine', 1175, 1175, t + 0.09, 0.1, 0.08);
        break;
      case 'signalStop':
        this.tone('sine', 660, 660, t, 0.1, 0.07);
        break;
      case 'beep':
        this.tone('sine', 990, 990, t, 0.05, 0.05);
        break;
      case 'click':
        this.tone('square', 1500, 1200, t, 0.025, 0.05);
        break;
      case 'ui':
        this.tone('sine', 880, 1320, t, 0.05, 0.05);
        break;
      case 'uiBack':
        this.tone('sine', 700, 500, t, 0.05, 0.04);
        break;
      case 'laugh':
        [330, 312, 296, 282].forEach((p, i) => this.formant(t + i * 0.12, p, 0.09, 0.12, 820, 1650));
        break;
      case 'monkey':
        [900, 1200, 950, 1250].forEach((p, i) => this.tone('sine', p, p * 1.25, t + i * 0.09, 0.07, 0.06));
        break;
      case 'gasp':
        this.burst(t, 0.28, 0.12, 'bandpass', 1800, 1.5, undefined, 2600);
        this.formant(t + 0.05, 420, 0.18, 0.07, 700, 1200);
        break;
      case 'shove':
        this.burst(t, 0.12, 0.25, 'bandpass', 600, 0.8);
        [240, 300, 200].forEach((p, i) => this.formant(t + i * 0.05, p, 0.1, 0.06, 650, 1100));
        break;
      case 'train':
        for (const f of [311, 392]) {
          const o = c.createOscillator();
          o.type = 'sawtooth';
          o.frequency.value = f;
          const lp = c.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 1100;
          const g = c.createGain();
          this.env(g, t, 0.06, 0.05, 0.7);
          o.connect(lp).connect(g).connect(this.sfxBus);
          o.start(t);
          o.stop(t + 0.85);
        }
        break;
      case 'splash':
        this.burst(t, 0.3, 0.2, 'bandpass', 900, 0.6, undefined, 300);
        break;
      case 'remote':
        this.tone('square', 1800, 2400, t, 0.04, 0.03);
        break;
      case 'wind':
        this.burst(t, 0.9, 0.12, 'bandpass', 500, 0.8, undefined, 1400);
        break;
      case 'boing':
        this.tone('sine', 180, 720, t, 0.22, 0.12);
        this.tone('triangle', 360, 1100, t + 0.02, 0.18, 0.05);
        break;
      case 'blink':
        this.tone('triangle', 900, 500, t, 0.07, 0.04);
        break;
      case 'collect':
        this.tone('triangle', 988, 988, t, 0.07, 0.06);
        this.tone('triangle', 1319, 1319, t + 0.06, 0.07, 0.06);
        this.tone('triangle', 1976, 1976, t + 0.12, 0.12, 0.05);
        break;
      case 'ulta':
        this.tone('sawtooth', 520, 260, t, 0.25, 0.05);
        this.tone('sawtooth', 390, 195, t + 0.05, 0.25, 0.04);
        break;
      case 'seven': {
        // sad trombone: wah, wah, wah, waaah
        const notes = [
          [0, 311, 0.24],
          [0.3, 294, 0.24],
          [0.6, 277, 0.24],
          [0.9, 262, 0.95],
        ] as const;
        for (const [dt, f, dur] of notes) {
          const o = c.createOscillator();
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(f * 1.03, t + dt);
          o.frequency.exponentialRampToValueAtTime(f, t + dt + 0.07);
          const lp = c.createBiquadFilter();
          lp.type = 'lowpass';
          lp.frequency.value = 1200;
          lp.Q.value = 2.5;
          const g = c.createGain();
          this.env(g, t + dt, 0.035, 0.13, dur);
          if (dur > 0.5) {
            const lfo = c.createOscillator();
            lfo.frequency.value = 6.2;
            const lg = c.createGain();
            lg.gain.value = 8;
            lfo.connect(lg).connect(o.frequency);
            lfo.start(t + dt + 0.12);
            lfo.stop(t + dt + dur + 0.1);
          }
          o.connect(lp).connect(g).connect(this.sfxBus);
          o.start(t + dt);
          o.stop(t + dt + dur + 0.1);
        }
        break;
      }
      case 'near':
        this.tone('sine', 660, 640, t, 0.12, 0.06);
        this.tone('sine', 494, 470, t + 0.12, 0.22, 0.06);
        break;
      case 'caw':
        this.tone('sawtooth', 820, 560, t, 0.11, 0.05);
        this.tone('sawtooth', 780, 520, t + 0.16, 0.12, 0.04);
        break;
      case 'whistle':
        this.tone('sine', 2600, 2900, t, 0.08, 0.05);
        this.tone('sine', 2600, 2800, t + 0.1, 0.22, 0.05);
        break;
      case 'sneeze':
        this.burst(t, 0.06, 0.08, 'highpass', 2000);
        this.burst(t + 0.18, 0.22, 0.22, 'bandpass', 1500, 0.7, undefined, 600);
        this.tone('square', 500, 200, t + 0.18, 0.12, 0.04);
        break;
      case 'ding':
        // one pull of a bus bell cord
        this.tone('sine', 2093, 2093, t, 0.3, 0.055);
        this.tone('sine', 2637, 2637, t, 0.22, 0.03);
        break;
      case 'bell':
        this.tone('sine', 2093, 2093, t, 0.25, 0.05);
        this.tone('sine', 2637, 2637, t, 0.2, 0.03);
        this.tone('sine', 2093, 2093, t + 0.12, 0.25, 0.04);
        break;
      case 'pour':
        this.burst(t, 0.45, 0.08, 'bandpass', 1200, 2, undefined, 1800);
        break;
      case 'clap':
        // a sharp clap that rings back off the fort walls
        this.burst(t, 0.03, 0.32, 'bandpass', 1400, 1.2);
        this.burst(t + 0.16, 0.03, 0.12, 'bandpass', 1300, 1.2);
        this.burst(t + 0.3, 0.03, 0.05, 'bandpass', 1200, 1.2);
        break;
      case 'crack':
        this.burst(t, 0.05, 0.2, 'highpass', 1800);
        this.tone('square', 240, 90, t, 0.08, 0.06);
        break;
      case 'boom':
        // a fort cannon: a thump and a long rumble
        this.tone('sine', 120, 38, t, 0.45, 0.32);
        this.burst(t, 0.6, 0.28, 'lowpass', 900, 0.8, undefined, 160);
        break;
      case 'dong':
        // a church bell: a low strike with a beating overtone
        this.tone('sine', 196, 194, t, 1.1, 0.16, undefined, 0.003);
        this.tone('sine', 392.5, 390, t, 0.8, 0.07, undefined, 0.003);
        this.tone('sine', 588, 586, t, 0.5, 0.035, undefined, 0.003);
        break;
      case 'siren':
        for (let i = 0; i < 3; i++) this.tone('square', 640, 980, t + i * 0.24, 0.12, 0.05);
        for (let i = 0; i < 3; i++) this.tone('square', 980, 640, t + 0.12 + i * 0.24, 0.12, 0.05);
        break;
      case 'snort':
        this.burst(t, 0.22, 0.2, 'bandpass', 380, 2.5, undefined, 220);
        this.burst(t + 0.25, 0.3, 0.24, 'bandpass', 330, 2.5, undefined, 180);
        break;
      case 'growl':
        // a dog growling in its sleep: a low buzzing rumble that rises a little and fades
        this.tone('sawtooth', 82, 96, t, 0.55, 0.06);
        this.burst(t, 0.5, 0.12, 'lowpass', 260, 0.8, undefined, 160);
        break;
      case 'pop':
        // a line of subtitles comes up: a soft blip, enough to make you glance down
        this.tone('sine', 620, 980, t, 0.06, 0.035);
        break;
      case 'rewind':
        this.tone('sawtooth', 900, 180, t, 0.5, 0.05);
        this.burst(t, 0.5, 0.05, 'bandpass', 2400, 3, undefined, 600);
        break;
      case 'chant':
        this.formant(t, 190, 0.16, 0.09, 700, 1150);
        this.formant(t + 0.17, 205, 0.16, 0.09, 330, 2300);
        break;
    }
  }

  // ---------------------------------------------------------------- music
  setMusic(city: CityId | null) {
    if (this.musicCity === city) return;
    this.musicCity = city;
    if (!this.ctx) return;
    if (city && this.timer === null) {
      this.nextNote = this.ctx.currentTime + 0.1;
      this.step = 0;
      this.timer = window.setInterval(() => this.schedule(), 40);
    } else if (!city && this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  duckMusic(on: boolean) {
    this.duck = on ? 0.35 : 1;
    this.applyVolumes();
  }

  private schedule() {
    const c = this.ctx;
    if (!c || !this.musicCity) return;
    if (c.state !== 'running') {
      this.nextNote = c.currentTime + 0.1;
      return;
    }
    const cfg = MUSIC[this.musicCity];
    const sixteenth = 60 / cfg.bpm / 4;
    while (this.nextNote < c.currentTime + 0.18) {
      this.musicStep(this.step, this.nextNote, cfg);
      this.nextNote += sixteenth;
      this.step = (this.step + 1) % (16 * 8);
    }
  }

  private pluck(f: number, t: number, vol: number) {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    const o2 = c.createOscillator();
    o2.type = 'sawtooth';
    o2.frequency.value = f * 1.003;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(2400, t);
    lp.frequency.exponentialRampToValueAtTime(500, t + 0.9);
    const g = c.createGain();
    this.env(g, t, 0.01, vol, 1.4);
    o.connect(lp);
    o2.connect(lp);
    lp.connect(g).connect(this.musicBus);
    o.start(t);
    o2.start(t);
    o.stop(t + 1.5);
    o2.stop(t + 1.5);
  }

  private flute(f: number, t: number, dur: number, vol: number) {
    const c = this.ctx!;
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f * 0.985, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.06);
    const lfo = c.createOscillator();
    lfo.frequency.value = 5.2;
    const lg = c.createGain();
    lg.gain.value = f * 0.008;
    lfo.connect(lg).connect(o.frequency);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.05);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.musicBus);
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
    this.burst(t, Math.min(0.08, dur), vol * 0.25, 'bandpass', f * 2, 2, this.musicBus);
  }

  private tabla(kind: 'dha' | 'na' | 'ge' | 'ti', t: number, vol: number) {
    if (kind === 'ge' || kind === 'dha') {
      const c = this.ctx!;
      const o = c.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(95, t);
      o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.35);
      const g = c.createGain();
      this.env(g, t, 0.004, vol * 0.9, 0.35);
      o.connect(g).connect(this.musicBus);
      o.start(t);
      o.stop(t + 0.42);
    }
    if (kind === 'na' || kind === 'dha') {
      this.tone('sine', 560, 545, t, 0.16, vol * 0.45, this.musicBus, 0.002);
      this.tone('sine', 1120, 1100, t, 0.08, vol * 0.18, this.musicBus, 0.002);
      this.burst(t, 0.03, vol * 0.3, 'bandpass', 3000, 1.5, this.musicBus);
    }
    if (kind === 'ti') this.burst(t, 0.04, vol * 0.35, 'highpass', 2800, 1, this.musicBus);
  }

  private musicStep(step: number, t: number, cfg: MusicCfg) {
    const s16 = step % 16;
    const bar = Math.floor(step / 16);
    const sa = cfg.sa;
    // tanpura cycle: Pa  Sa'  Sa'  Sa (one note per beat)
    if (s16 % 4 === 0) {
      const beat = (s16 / 4) | 0;
      const f = beat === 0 ? sa * 0.75 : beat === 3 ? sa * 0.5 : sa;
      this.pluck(f, t, 0.035);
    }
    // keherwa-ish theka over 8 eighth-notes: dha ge na ti | na ka dhi na
    if (s16 % 2 === 0) {
      const pat = cfg.theka[(s16 / 2) % 8];
      if (pat) this.tabla(pat, t, 0.11);
    }
    // motif every other 2 bars
    const phrase = cfg.phrases[Math.floor(bar / 2) % cfg.phrases.length];
    if (bar % 4 >= 2) {
      const idx = (bar % 2) * 16 + s16;
      const n = phrase[idx];
      if (n !== undefined && n !== null) {
        const f = sa * 2 * Math.pow(2, cfg.scale[((n % cfg.scale.length) + cfg.scale.length) % cfg.scale.length] / 12 + Math.floor(n / cfg.scale.length));
        this.flute(f, t, 60 / cfg.bpm / 2, 0.05);
      }
    }
  }
}

export type Bol = 'dha' | 'na' | 'ge' | 'ti' | null;
export interface MusicCfg {
  bpm: number;
  sa: number;
  scale: number[];
  theka: Bol[];
  phrases: (number | null)[][];
}

const _ = null;
export const MUSIC = {
  // Kalyani colours with a jathi-like pulse
  AMR: {
    bpm: 108,
    sa: 155.56,
    scale: [0, 2, 4, 6, 7, 9, 11],
    theka: ['dha', 'ti', 'dha', 'ge', 'na', 'ti', 'dha', 'na'],
    phrases: [
      [0, _, 2, _, 4, _, 3, _, 4, _, 5, _, 6, _, _, _, 5, _, 4, _, 3, _, 2, _, 4, _, _, _, _, _, _, _],
      [7, _, 6, _, 5, _, 4, _, 5, _, 3, _, 4, _, _, _, 2, _, 3, _, 1, _, 2, _, 0, _, _, _, _, _, _, _],
    ],
  },
  // Bhupali (major pentatonic): bright and sunny for Hyderabad
  HYD: {
    bpm: 96,
    sa: 146.83,
    scale: [0, 2, 4, 7, 9],
    theka: ['dha', 'ge', 'na', 'ti', 'na', _, 'dha', 'na'],
    phrases: [
      [0, _, 1, _, 2, _, _, _, 3, _, 2, _, 1, _, _, _, 2, _, 1, _, 0, _, _, _, 1, _, 0, _, -1, _, _, _],
      [3, _, 4, _, 5, _, _, _, 4, _, 3, _, 2, _, _, _, 3, _, 2, _, 1, _, 2, _, 0, _, _, _, _, _, _, _],
    ],
  },
  // a quick dulpod feel (3+3+2) on a bright Mixolydian: a Goan band at a village feast
  PNJ: {
    bpm: 126,
    sa: 164.81,
    scale: [0, 2, 4, 5, 7, 9, 10],
    theka: ['dha', 'na', 'ti', 'dha', 'na', 'ti', 'dha', 'ge'],
    phrases: [
      [4, _, 5, 6, _, 5, 4, _, 2, _, 3, 4, _, 3, 2, _, 1, _, 0, 1, _, 2, 4, _, 5, _, 4, 2, _, _, _, _],
      [7, _, 6, 5, _, 6, 4, _, 5, _, 3, 4, _, 2, 3, _, 1, _, 2, 0, _, 1, -1, _, 0, _, _, _, _, _, _, _],
    ],
  },
  // a garba-ish lilt on Khamaj (major with a flat seventh), for the Gujarati coast
  DMN: {
    bpm: 116,
    sa: 155.56,
    scale: [0, 2, 4, 5, 7, 9, 10],
    theka: ['dha', null, 'ti', 'dha', 'na', null, 'dha', 'ti'],
    phrases: [
      [2, _, 4, _, 5, 4, 2, _, 4, _, 2, 1, 0, _, _, _, 1, _, 2, _, 4, 2, 1, _, 0, _, _, _, _, _, _, _],
      [5, _, 6, _, 7, 6, 5, _, 4, _, 5, 4, 2, _, _, _, 4, _, 2, _, 1, 2, 0, _, -1, _, 0, _, _, _, _, _],
    ],
  },
  // a quick garba taali on Kafi colours, for Navratri nights and Uttarayan rooftops
  GNR: {
    bpm: 132,
    sa: 146.83,
    scale: [0, 2, 3, 5, 7, 9, 10],
    theka: ['dha', 'ti', 'na', 'dha', 'ti', 'na', 'dha', 'na'],
    phrases: [
      [4, _, 4, 5, 4, _, 2, _, 3, _, 3, 4, 3, _, 1, _, 2, _, 2, 3, 2, _, 0, _, 1, _, 2, _, 0, _, _, _],
      [7, _, 6, _, 5, 4, 5, _, 4, _, 3, _, 2, 3, 4, _, 2, _, 1, _, 0, 1, 2, _, 0, _, _, _, _, _, _, _],
    ],
  },
  JAI: {
    bpm: 120,
    sa: 138.59,
    scale: [0, 2, 4, 5, 7, 9, 10],
    theka: ['dha', 'ge', 'na', 'ti', 'na', 'ti', 'dha', 'na'],
    phrases: [
      [4, _, 5, 4, 2, _, 4, _, 5, _, 6, 5, 4, _, 2, _, 1, _, 2, 4, 2, _, 1, _, 0, _, 1, _, 2, _, _, _],
      [7, _, 6, 5, 6, _, 4, _, 5, 4, 2, _, 4, _, _, _, 2, _, 1, 0, 1, _, 2, _, 4, _, 2, _, 0, _, _, _],
    ],
  },
  // a bright pentatonic for Chhattisgarhi folk (mandar and bansuri)
  RPR: {
    bpm: 112,
    sa: 164.81,
    scale: [0, 2, 4, 7, 9, 12, 14],
    theka: ['dha', 'ti', 'na', 'dha', 'ge', 'ti', 'na', 'na'],
    phrases: [
      [2, _, 3, 4, 3, _, 2, _, 1, _, 2, 3, 2, _, 0, _, 0, _, 1, 2, 3, _, 4, _, 5, _, 4, _, 3, _, _, _],
      [5, _, 4, 3, 4, _, 2, _, 3, 2, 1, _, 2, _, _, _, 0, _, 1, 2, 1, _, 0, _, 2, _, 1, _, 0, _, _, _],
    ],
  },
  // Yaman-ish for a lakeside evening in Bhopal
  BPL: {
    bpm: 104,
    sa: 146.83,
    scale: [0, 2, 4, 6, 7, 9, 11],
    theka: ['dha', 'na', 'ti', 'na', 'ge', 'na', 'dha', 'ti'],
    phrases: [
      [6, _, 0, 2, 3, _, 2, _, 4, _, 3, 2, 1, _, 0, _, 2, _, 3, 4, 6, _, 4, _, 3, _, 2, _, 0, _, _, _],
      [4, _, 6, 7, 6, _, 4, _, 3, 4, 2, _, 3, _, _, _, 1, _, 2, 3, 2, _, 0, _, 6, _, 0, _, 0, _, _, _],
    ],
  },
  // Bhairavi colours for a Mumbai dusk
  BOM: {
    bpm: 100,
    sa: 138.59,
    scale: [0, 1, 3, 5, 7, 8, 10],
    theka: ['dha', 'ge', 'na', 'ti', 'na', 'ge', 'dha', 'na'],
    phrases: [
      [4, _, 5, _, 4, _, 3, _, 2, _, 1, _, 0, _, _, _, 1, _, 2, _, 3, _, 2, _, 1, _, _, _, _, _, _, _],
      [7, _, _, _, 6, _, 5, _, 4, _, _, _, 3, _, 4, _, 2, _, 1, _, 0, _, _, _, _, _, _, _, _, _, _, _],
    ],
  },
} as Record<CityId, MusicCfg>;
