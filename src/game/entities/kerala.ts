// Thiruvananthapuram's own machinery.
import { Entity, type Hazard, type World } from '../world';
import { Solid } from '../body';
import { DT, TILE } from '../constants';
import { overlapXYWH } from '../constants';

/**
 * Thumba: a sounding rocket on its launch rail. When it goes, the exhaust floods the
 * road for a moment, and a little later the spent first stage drops back out of the
 * sky (where a careful dad waits for the fire to die down) and lies there, a log to hop.
 */
export class Launch extends Entity {
  /** the rocket's centre and the ground it stands on */
  readonly x: number;
  readonly ground: number;
  t0 = -1;
  readonly blastSec: number;
  /** the burning stretch of road, px */
  readonly blastX0: number;
  readonly blastX1: number;
  /** the spent stage: where it comes down, and when (seconds after launch) */
  readonly stageX: number;
  readonly sepAt: number;
  private stageY = -60;
  private stageV = 0;
  stage: 'up' | 'falling' | 'down' = 'up';
  private stageSolid: Solid;
  hazard: Hazard;
  private stageHazard: Hazard;

  constructor(o: { tx: number; groundTy: number; blast: [number, number]; blastSec?: number; stageTx: number; sepAt?: number }) {
    super();
    this.layer = -1;
    this.x = o.tx * TILE + 8;
    this.ground = o.groundTy * TILE;
    this.blastX0 = o.blast[0] * TILE;
    this.blastX1 = (o.blast[1] + 1) * TILE;
    this.blastSec = o.blastSec ?? 1.4;
    this.stageX = o.stageTx * TILE;
    this.sepAt = o.sepAt ?? 1.5;
    this.stageSolid = new Solid(this.stageX, this.ground - 12, 40, 12);
    this.stageSolid.collidable = false;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'burnt',
      hits(x, y, w, h) {
        return self.burning && overlapXYWH(x, y, w, h, { x: self.blastX0, y: self.ground - 22, w: self.blastX1 - self.blastX0, h: 22 });
      },
    };
    this.stageHazard = {
      active: true,
      cause: 'crushed',
      hits(x, y, w, h) {
        return self.stage === 'falling' && overlapXYWH(x, y, w, h, { x: self.stageX + 2, y: self.stageY + 2, w: 36, h: 10 });
      },
    };
  }

  /** add it to the world (it brings a second hazard and a solid for the fallen stage) */
  static place(w: World, o: ConstructorParameters<typeof Launch>[0]): Launch {
    const l = w.add(new Launch(o));
    w.hazards.push(l.stageHazard);
    w.solids.push(l.stageSolid);
    return l;
  }

  get since() {
    return this.t0 < 0 ? -1 : 0;
  }

  get burning() {
    return this.t0 >= 0 && this.elapsed < this.blastSec;
  }

  private elapsedTicks = 0;
  get elapsed() {
    return this.elapsedTicks * DT;
  }

  fire(w: World) {
    if (this.t0 >= 0) return;
    this.t0 = w.tick;
    this.elapsedTicks = 0;
    w.sfx('boom', this.x, this.ground);
    w.sfx('rumble', this.x, this.ground);
    w.emit('shake', this.x, this.ground, { amount: 5 });
    w.flags.launch = 'fire';
  }

  update(w: World) {
    if (this.t0 < 0) return;
    this.elapsedTicks = w.tick - this.t0;
    const t = this.elapsed;
    if (t >= this.blastSec && w.flags.launch === 'fire') w.flags.launch = 'calm';
    if (this.stage === 'up' && t >= this.sepAt) {
      this.stage = 'falling';
      this.stageY = -60;
      this.stageV = 60;
      w.sfx('whistle', this.stageX + 20, 40);
      w.flags.launch = 'stage';
    }
    if (this.stage === 'falling') {
      this.stageV = Math.min(520, this.stageV + 1400 * DT);
      this.stageY += this.stageV * DT;
      if (this.stageY >= this.ground - 12) {
        this.stageY = this.ground - 12;
        this.stage = 'down';
        this.stageSolid.collidable = true;
        w.sfx('thud', this.stageX + 20, this.ground);
        w.emit('shake', this.stageX + 20, this.ground, { amount: 4 });
        w.emit('fx', this.stageX + 20, this.ground, { kind: 'dust', w: 40 });
        w.flags.launch = 'down';
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = this.t0 < 0 ? 0 : this.elapsed;
    const g = this.ground;
    const x = this.x;
    // the launch rail and its tower
    ctx.strokeStyle = '#5A6470';
    ctx.lineWidth = 1;
    const tx = x + 9;
    ctx.beginPath();
    ctx.moveTo(tx, g);
    ctx.lineTo(tx, g - 62);
    ctx.moveTo(tx + 8, g);
    ctx.lineTo(tx + 8, g - 62);
    for (let y = g; y > g - 62; y -= 8) {
      ctx.moveTo(tx, y);
      ctx.lineTo(tx + 8, y - 8);
      ctx.moveTo(tx + 8, y);
      ctx.lineTo(tx, y - 8);
    }
    ctx.stroke();
    ctx.fillStyle = '#3E4650';
    ctx.fillRect(x - 10, g - 4, 30, 4);
    ctx.fillStyle = '#C62828';
    ctx.fillRect(tx - 1, g - 64, 10, 2);
    // the rocket: white, slim, an orange band and fins
    const rise = t <= 0 ? 0 : 0.5 * 300 * t * t;
    const ry = g - 4 - rise;
    if (ry > -80) {
      ctx.save();
      ctx.translate(x, ry);
      ctx.fillStyle = '#F4F1EA';
      ctx.strokeStyle = '#2B2B2B';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-3.5, 0);
      ctx.lineTo(-3.5, -38);
      ctx.quadraticCurveTo(0, -48, 3.5, -38);
      ctx.lineTo(3.5, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F57C00';
      ctx.fillRect(-3.5, -30, 7, 3);
      ctx.fillStyle = '#1565C0';
      ctx.fillRect(-3.5, -14, 7, 1.6);
      ctx.fillStyle = '#B0BEC5';
      ctx.beginPath();
      ctx.moveTo(-3.5, -8);
      ctx.lineTo(-7, 0);
      ctx.lineTo(-3.5, 0);
      ctx.moveTo(3.5, -8);
      ctx.lineTo(7, 0);
      ctx.lineTo(3.5, 0);
      ctx.fill();
      if (this.t0 >= 0) {
        // the flame under it
        const f = 10 + Math.sin(w.tick * 1.3) * 3 + Math.min(20, t * 30);
        const grad = ctx.createLinearGradient(0, 0, 0, f);
        grad.addColorStop(0, 'rgba(255,250,210,1)');
        grad.addColorStop(0.4, 'rgba(255,170,40,0.95)');
        grad.addColorStop(1, 'rgba(220,60,20,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-3, 0);
        ctx.quadraticCurveTo(0, f * 1.2, 3, 0);
        ctx.fill();
      }
      ctx.restore();
      // a smoke trail behind it
      if (this.t0 >= 0) {
        for (let i = 0; i < 10; i++) {
          const yy = ry + 8 + i * Math.max(6, rise / 10);
          if (yy > g) break;
          ctx.fillStyle = `rgba(235,232,226,${0.5 - i * 0.04})`;
          ctx.beginPath();
          ctx.arc(x + Math.sin(i * 1.7 + w.tick * 0.05) * 2, yy, 4 + i * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    // the blast flooding the road
    if (this.burning) {
      const k = Math.min(1, t / 0.12) * (t > this.blastSec - 0.25 ? (this.blastSec - t) / 0.25 : 1);
      for (let xx = this.blastX0; xx < this.blastX1; xx += 5) {
        const h = (14 + Math.sin(xx * 0.31 + w.tick * 0.7) * 5 + Math.sin(xx * 0.07 - w.tick * 0.4) * 4) * k;
        ctx.fillStyle = `rgba(255,${130 + Math.sin(xx + w.tick) * 40},40,${0.85 * k})`;
        ctx.beginPath();
        ctx.ellipse(xx + 2.5, g - h / 2, 4, h / 2 + 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,240,180,${0.8 * k})`;
        ctx.beginPath();
        ctx.ellipse(xx + 2.5, g - h / 4, 2.4, h / 4 + 1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = `rgba(90,86,80,${0.35 * k})`;
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(this.blastX0 + ((i + 0.5) / 6) * (this.blastX1 - this.blastX0), g - 26 - Math.sin(i + w.tick * 0.05) * 4, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.t0 >= 0 && t < this.blastSec + 2.5) {
      // smoke drifting off the scorched road
      const k = 1 - (t - this.blastSec) / 2.5;
      ctx.fillStyle = `rgba(120,116,110,${0.3 * k})`;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(this.blastX0 + ((i + 0.5) / 5) * (this.blastX1 - this.blastX0), g - 10 - (t - this.blastSec) * 14 - i * 2, 8 + (t - this.blastSec) * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // the spent stage
    if (this.stage !== 'up') {
      const sx = this.stageX,
        sy = this.stageY;
      if (this.stage === 'falling') {
        for (let i = 1; i < 6; i++) {
          ctx.fillStyle = `rgba(230,226,220,${0.45 - i * 0.07})`;
          ctx.beginPath();
          ctx.arc(sx + 20, sy - i * 9, 5 + i, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.fillStyle = '#ECE8E0';
      ctx.strokeStyle = '#2B2B2B';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.rect(sx, sy, 40, 12);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F57C00';
      ctx.fillRect(sx + 26, sy, 3, 12);
      ctx.fillStyle = '#5A5A5A';
      ctx.fillRect(sx - 2, sy + 2, 3, 8);
      if (this.stage === 'down') {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(sx + 1, sy + 12, 38, 1);
      }
    }
  }
}
