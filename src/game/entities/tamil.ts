// Chennai's own life.
import { Entity, type Hazard, type World } from '../world';
import { DT, TILE, overlapXYWH } from '../constants';

/**
 * Pongal on the street: a new clay pot of milk and rice on a three-brick stove, a turmeric plant tied round
 * its neck, a kolam drawn round it. Come close and it starts to bubble, and a moment later it boils over
 * ("Pongalo Pongal!"): a spout of foam over the pot and a hot spill across the road, both ways, a little
 * further than where it started bubbling. Back off when it bubbles; when the spill stops steaming, go.
 */
export class PongalPot extends Entity {
  /** the pot's centre and the ground (px) */
  readonly x: number;
  readonly ground: number;
  /** it starts to bubble when Dad's front reaches here (px) */
  readonly triggerX: number;
  /** how far the spill runs each way (px) */
  readonly reach: number;
  state: 'idle' | 'bubble' | 'spill' | 'cool' = 'idle';
  private t = 0;
  static readonly BUBBLE = 0.3;
  static readonly SPREAD = 0.25;
  static readonly SPOUT = 0.5;
  static readonly HOT = 1.4;
  hazard: Hazard;

  constructor(o: { tx: number; groundTy: number; triggerTx: number; reach: number }) {
    super();
    this.layer = 2;
    this.x = o.tx * TILE + 8;
    this.ground = o.groundTy * TILE;
    this.triggerX = o.triggerTx * TILE;
    this.reach = o.reach * TILE;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'burnt',
      hits(x, y, w, h) {
        if (self.state !== 'spill') return false;
        const k = self.spread;
        const r = self.reach * k;
        if (overlapXYWH(x, y, w, h, { x: self.x - r, y: self.ground - 7, w: 2 * r, h: 7 })) return true;
        const sp = self.spout;
        return sp > 0 && overlapXYWH(x, y, w, h, { x: self.x - 7, y: self.ground - 30 - 44 * sp, w: 14, h: 30 + 44 * sp });
      },
    };
  }

  static place(w: World, o: ConstructorParameters<typeof PongalPot>[0]): PongalPot {
    return w.add(new PongalPot(o));
  }

  private get secs() {
    return this.t * DT;
  }
  /** how far the spill has run (0 to 1) */
  get spread() {
    return this.state === 'spill' ? Math.min(1, this.secs / PongalPot.SPREAD) : this.state === 'cool' ? 1 : 0;
  }
  /** the spout of foam over the pot (0 to 1) */
  get spout() {
    if (this.state !== 'spill' || this.secs > PongalPot.SPOUT) return 0;
    return Math.sin((this.secs / PongalPot.SPOUT) * Math.PI);
  }

  update(w: World) {
    this.t++;
    w.flags.pongal = this.state;
    if (this.state === 'idle') {
      if (w.state === 'play' && w.player.x + w.player.w >= this.triggerX) {
        this.state = 'bubble';
        this.t = 0;
        w.sfx('pour', this.x, this.ground - 20);
      }
    } else if (this.state === 'bubble') {
      if (this.secs >= PongalPot.BUBBLE) {
        this.state = 'spill';
        this.t = 0;
        w.sfx('splash', this.x, this.ground - 20);
        w.say('Pongalo Pongal! | It’s boiling over!', this.x, this.ground - 70, 1.8, 'npc');
      }
    } else if (this.state === 'spill') {
      if (this.secs >= PongalPot.HOT) {
        this.state = 'cool';
        this.t = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    const g = this.ground;
    const x = this.x;
    // the kolam round it: a ring of white dots and a loop
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = -3; i <= 3; i++) {
      ctx.fillRect(x + i * 5 - 0.6, g - 1.4, 1.2, 1.2);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(x, g - 0.8, 19, 1.6, 0, 0, Math.PI * 2);
    ctx.stroke();
    // the spill on the road
    const k = this.spread;
    if (k > 0) {
      const r = this.reach * k;
      const hot = this.state === 'spill';
      ctx.fillStyle = hot ? 'rgba(255,253,240,0.95)' : 'rgba(238,224,180,0.75)';
      ctx.beginPath();
      ctx.moveTo(x - r, g);
      for (let i = 0; i <= 12; i++) {
        const px = x - r + (2 * r * i) / 12;
        const bump = hot ? 2.5 + Math.sin(i * 1.7 + w.tick * 0.3) * 1.2 : 1.2;
        ctx.lineTo(px, g - bump - (1 - Math.abs(i - 6) / 6) * 3);
      }
      ctx.lineTo(x + r, g);
      ctx.closePath();
      ctx.fill();
      if (hot) {
        // steam
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
          const sx = x - r + ((i + 0.5) * 2 * r) / 5;
          const ph = (w.tick * 0.05 + i * 0.37) % 1;
          ctx.beginPath();
          ctx.moveTo(sx, g - 5 - ph * 14);
          ctx.quadraticCurveTo(sx + 3, g - 9 - ph * 14, sx, g - 13 - ph * 14);
          ctx.stroke();
        }
      }
    }
    // the stove: three bricks and the fire
    ctx.fillStyle = '#9C4A32';
    ctx.fillRect(x - 11, g - 7, 5, 7);
    ctx.fillRect(x + 6, g - 7, 5, 7);
    ctx.fillRect(x - 2.5, g - 4, 5, 4);
    const fl = 3 + Math.sin(w.tick * 0.7) * 1.2;
    ctx.fillStyle = '#F29A2E';
    ctx.beginPath();
    ctx.moveTo(x - 6, g - 3);
    ctx.quadraticCurveTo(x - 3, g - 6 - fl, x, g - 4);
    ctx.quadraticCurveTo(x + 3, g - 7 - fl, x + 6, g - 3);
    ctx.fill();
    // the pot
    const py = g - 7;
    ctx.fillStyle = '#B8572E';
    ctx.beginPath();
    ctx.ellipse(x, py - 9, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#9E4626';
    ctx.fillRect(x - 6, py - 21, 12, 4);
    // painted stripes (white and red) round its belly
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, py - 9, 9.5, 2, 0, 0, Math.PI);
    ctx.stroke();
    // the turmeric plant tied round its neck: long leaves standing up from the rim
    ctx.fillStyle = '#4E9A3C';
    for (const [dx, tilt, len] of [[-5, -0.35, 11], [0, 0.05, 13], [5, 0.4, 11]] as const) {
      ctx.save();
      ctx.translate(x + dx, py - 21);
      ctx.rotate(tilt);
      ctx.beginPath();
      ctx.ellipse(0, -len / 2, 1.6, len / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#E3B23C';
    ctx.fillRect(x - 6, py - 20, 12, 1.5);
    // a stick of sugarcane leaning by the stove
    ctx.strokeStyle = '#6B3A5A';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(x + 16, g);
    ctx.lineTo(x + 21, g - 40);
    ctx.stroke();
    ctx.fillStyle = '#5E9A3A';
    ctx.beginPath();
    ctx.ellipse(x + 22, g - 43, 2, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
    // the foam: peeking, rising, pouring
    const foam = '#FFFDF2';
    if (this.state === 'bubble') {
      const b = this.secs / PongalPot.BUBBLE;
      ctx.fillStyle = foam;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.arc(x + i * 2.6, py - 21 - b * 3 - Math.abs(Math.sin(w.tick * 0.6 + i)) * 1.5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.state === 'spill' || this.state === 'cool') {
      const hot = this.state === 'spill';
      ctx.fillStyle = hot ? foam : 'rgba(238,224,180,0.9)';
      // over the rim and down the sides
      ctx.fillRect(x - 7, py - 23, 14, 3);
      ctx.fillRect(x - 10, py - 20, 3, hot ? 18 : 10);
      ctx.fillRect(x + 7, py - 20, 3, hot ? 18 : 10);
      const sp = this.spout;
      if (sp > 0) {
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(x + Math.sin(i * 2.1 + w.tick * 0.4) * 3, py - 24 - i * 7 * sp, 4.5 - i * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
}

/**
 * Puducherry: a sea breeze takes a traffic policeman's red kepi off his head and bowls it down the street,
 * a little above a dad's head, and he comes running after it, eyes on the cap and one arm up. Get in his
 * way and he bowls you over; hop him and he leaps for the cap at the same moment. Catch the cap (jump into
 * it as it goes by) and he stops, salutes and takes it back. Running away doesn't help: he runs on after it.
 */
export class Kepi extends Entity {
  /** where the cap sets off, where the policeman starts, and where he runs off the street (px) */
  readonly hatX0: number;
  readonly copX0: number;
  readonly giveUpX: number;
  readonly ground: number;
  state: 'idle' | 'chase' | 'caught' | 'done' = 'idle';
  private t = 0;
  hatX = 0;
  hatY = 0;
  copX = 0;
  copY = 0;
  private copVy = 0;
  copOn = false;
  private saluteT = -1;
  hazard: Hazard;
  static readonly HAT_V = 100;
  static readonly COP_V = 100;
  /** he runs this far behind his cap (px) */
  static readonly GAP = 100;
  private readonly copDelay: number;

  constructor(o: { hatTx: number; copTx: number; giveUpTx: number; groundTy: number }) {
    super();
    this.layer = 3;
    this.hatX0 = o.hatTx * TILE;
    this.copX0 = o.copTx * TILE;
    this.giveUpX = o.giveUpTx * TILE;
    this.ground = o.groundTy * TILE;
    this.hatX = this.hatX0;
    this.hatY = this.ground - 30;
    this.copX = this.copX0;
    this.copY = this.ground;
    // he comes in running when the cap is GAP ahead of where he starts
    this.copDelay = Math.max(0, (this.hatX0 - this.copX0 + Kepi.GAP) / Kepi.HAT_V);
    const self = this;
    this.hazard = {
      active: true,
      cause: 'hit',
      hits(x, y, w, h) {
        return self.copOn && self.state === 'chase' && overlapXYWH(x, y, w, h, { x: self.copX - 5, y: self.copY - 46, w: 11, h: 46 });
      },
    };
  }

  static place(w: World, o: ConstructorParameters<typeof Kepi>[0]): Kepi {
    return w.add(new Kepi(o));
  }

  start(w: World) {
    if (this.state !== 'idle') return;
    this.state = 'chase';
    this.t = 0;
    w.sfx('wind', this.hatX, this.hatY);
  }

  update(w: World) {
    w.flags.kepi = this.state;
    if (this.state === 'idle' || this.state === 'done') return;
    this.t++;
    const s = this.t * DT;
    const p = w.player;
    if (this.state === 'chase') {
      // the cap bowls along on the breeze, bobbing
      this.hatX -= Kepi.HAT_V * DT;
      this.hatY = this.ground - 30 + Math.sin(s * 7) * 5;
      if (w.state === 'play' && overlapXYWH(p.x - 2, p.y - 2, p.w + 4, p.h + 4, { x: this.hatX - 6, y: this.hatY - 4, w: 12, h: 7 })) {
        this.state = 'caught';
        this.saluteT = 0;
        w.sfx('collect', this.hatX, this.hatY);
        return;
      }
      if (s >= this.copDelay) {
        if (!this.copOn) {
          this.copOn = true;
          w.say('Mon képi! En thoppi! | My cap! My cap!', this.copX, this.ground - 60, 1.6, 'npc');
        }
        // he leaps for the cap whenever someone in front of him leaves the ground
        const ahead = this.copX - 5 - (p.x + p.w);
        if (this.copY >= this.ground && !p.onGround && ahead > -6 && ahead < 46) this.copVy = -330;
        this.copVy += 1500 * DT;
        this.copY = Math.min(this.ground, this.copY + this.copVy * DT);
        if (this.copY >= this.ground) this.copVy = 0;
        if (this.copX > this.giveUpX) this.copX = Math.max(this.giveUpX, this.copX - Kepi.COP_V * DT);
        else {
          // he's run off after it, down the street
          this.state = 'done';
          this.copOn = false;
        }
      }
    } else if (this.state === 'caught') {
      // Dad has it: the policeman stops dead, salutes, and takes his cap back
      this.copVy += 1500 * DT;
      this.copY = Math.min(this.ground, this.copY + this.copVy * DT);
      this.saluteT++;
      if (this.saluteT === 1) w.say('Merci beaucoup! | Thank you very much!', this.copOn ? this.copX : p.cx, this.ground - 60, 1.8, 'npc');
      if (this.saluteT * DT > 1.2) this.state = 'done';
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    if (this.state === 'idle') return;
    const p = w.player;
    // the cap: on the breeze, on Dad's head, or back on its owner
    let hx = this.hatX,
      hy = this.hatY,
      spin = Math.sin(this.t * 0.25) * 0.6;
    if (this.state === 'caught' || (this.state === 'done' && this.saluteT >= 0)) {
      const k = Math.min(1, Math.max(0, (this.saluteT * DT - 0.5) / 0.4));
      const ox = p.cx,
        oy = p.y - 2;
      const tx = this.copOn ? this.copX : p.cx + 40,
        ty = this.copY - 46;
      hx = ox + (tx - ox) * k;
      hy = oy + (ty - oy) * k - Math.sin(k * Math.PI) * 10;
      spin = 0;
    }
    if (this.state !== 'done' || this.saluteT >= 0) {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(spin);
      ctx.fillStyle = '#C62828';
      ctx.fillRect(-4, -4, 8, 5);
      ctx.fillStyle = '#1B2A4A';
      ctx.fillRect(-5.5, 1, 11, 1.6);
      ctx.fillStyle = '#F2C94C';
      ctx.fillRect(-4, -1, 8, 0.8);
      ctx.restore();
    }
    if (!this.copOn) return;
    // the policeman: white uniform, running, one arm up after his cap (saluting once he has it back)
    const x = this.copX,
      y = this.copY;
    const run = this.state === 'chase' && this.copX > this.giveUpX;
    const leg = run ? Math.sin(this.t * 0.45) * 3 : 0;
    ctx.fillStyle = '#2B2B2B';
    ctx.fillRect(x - 3 + leg * 0.5, y - 3, 3, 3);
    ctx.fillRect(x + 1 - leg * 0.5, y - 3, 3, 3);
    ctx.fillStyle = '#ECEFF1';
    ctx.fillRect(x - 3.5, y - 16, 3, 13);
    ctx.fillRect(x + 0.5, y - 16, 3, 13);
    ctx.fillRect(x - 5, y - 30, 10, 15);
    ctx.fillStyle = '#C9A27A';
    ctx.beginPath();
    ctx.arc(x, y - 34, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ECEFF1';
    if (this.state === 'chase') {
      // the arm reaching up for the cap
      ctx.fillRect(x - 6, y - 46, 2.6, 17);
    } else {
      // a salute
      ctx.fillRect(x + 2, y - 38, 6, 2.4);
    }
    ctx.fillStyle = '#C62828';
    ctx.fillRect(x - 4.5, y - 41, 9, 2.2);
    if (this.state !== 'chase') {
      // cap back on
      ctx.fillRect(x - 4, y - 44, 8, 5);
    }
  }
}
