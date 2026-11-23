// Particles for the rooms: dust, debris, Dad popping (and his glasses flying off).
// Purely visual: they run on render time, never touch the simulation.
import { DAD, drawGlasses, type Ctx } from './dad';

interface Bit {
  kind: 'chunk' | 'dust' | 'ring' | 'glasses' | 'spark' | 'star';
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  life: number;
  max: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  drag: number;
}

export class Fx {
  bits: Bit[] = [];

  private add(b: Partial<Bit> & { x: number; y: number }) {
    if (this.bits.length > 600) this.bits.shift();
    this.bits.push({ kind: 'dust', vx: 0, vy: 0, g: 0, life: 0, max: 0.5, size: 2, color: '#fff', rot: 0, vr: 0, drag: 0, ...b });
  }

  clear() {
    this.bits.length = 0;
  }

  /** a puff of dust at the feet */
  dust(x: number, y: number, n: number, spread = 1, color = 'rgba(255,248,236,0.7)') {
    for (let i = 0; i < n; i++) {
      const a = Math.PI + (i / Math.max(1, n - 1)) * Math.PI;
      this.add({ kind: 'dust', x: x + (Math.random() - 0.5) * 6 * spread, y: y - 1, vx: Math.cos(a) * (14 + Math.random() * 18) * spread, vy: Math.sin(a) * 8 - 4, drag: 3.2, max: 0.35 + Math.random() * 0.2, size: 1.6 + Math.random() * 1.4, color });
    }
  }

  /** a slab breaking away: chunks fall with it, dust puffs off its top */
  crumble(x: number, y: number, w: number, colors: string[]) {
    for (let i = 0; i < Math.ceil(w / 3); i++) {
      this.add({ kind: 'chunk', x: x - w / 2 + Math.random() * w, y: y + Math.random() * 4, vx: (Math.random() - 0.5) * 40, vy: -20 - Math.random() * 50, g: 700, max: 0.7 + Math.random() * 0.4, size: 1 + Math.random() * 2, color: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 18 });
    }
    for (let i = 0; i < Math.ceil(w / 5); i++) {
      this.add({ kind: 'dust', x: x - w / 2 + Math.random() * w, y, vx: (Math.random() - 0.5) * 20, vy: -10 - Math.random() * 14, drag: 2.5, max: 0.5 + Math.random() * 0.3, size: 2 + Math.random() * 2.4, color: 'rgba(230,220,205,0.55)' });
    }
  }

  /** Dad pops: bits of shirt, trousers and skin, a ring, and his glasses spinning off */
  pop(x: number, y: number, vx: number, vy: number) {
    const cols = [DAD.shirt, DAD.shirt, DAD.shirtDark, DAD.pants, DAD.skin, DAD.hair];
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 50 + Math.random() * 110;
      this.add({ kind: 'chunk', x, y, vx: Math.cos(a) * sp + vx * 0.2, vy: Math.sin(a) * sp - 60 + vy * 0.1, g: 520, max: 0.7 + Math.random() * 0.5, size: 1.2 + Math.random() * 1.8, color: cols[i % cols.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 24, drag: 0.6 });
    }
    this.add({ kind: 'ring', x, y, max: 0.32, size: 3, color: 'rgba(255,255,255,0.9)' });
    this.add({ kind: 'glasses', x, y: y - 4, vx: (Math.random() < 0.5 ? -1 : 1) * (30 + Math.random() * 30), vy: -150, g: 520, max: 1.1, size: 1, color: '', rot: 0, vr: (Math.random() < 0.5 ? -1 : 1) * 9 });
  }

  /** a ghost of an earlier try meets its end (white, quieter) */
  ghostPop(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      this.add({ kind: 'chunk', x, y, vx: Math.cos(a) * 70, vy: Math.sin(a) * 70 - 40, g: 400, max: 0.6, size: 1.4, color: 'rgba(255,244,232,0.8)', rot: Math.random() * 6, vr: 10 });
    }
    this.add({ kind: 'ring', x, y, max: 0.3, size: 2, color: 'rgba(255,255,255,0.7)' });
  }

  /** little stars when he bonks his head */
  stars(x: number, y: number) {
    for (let i = 0; i < 4; i++) this.add({ kind: 'star', x, y, vx: (i - 1.5) * 22, vy: -30 - (i % 2) * 14, g: 140, max: 0.45, size: 1.6, color: '#FFE27A', vr: 8 });
  }

  /** a burst of light (boarding) */
  sparkle(x: number, y: number, color = '#FFE6A6') {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      this.add({ kind: 'spark', x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, drag: 3, max: 0.45, size: 2.4, color });
    }
  }

  update(dt: number) {
    const out: Bit[] = [];
    for (const b of this.bits) {
      b.life += dt;
      if (b.life >= b.max) continue;
      b.vy += b.g * dt;
      if (b.drag) {
        const k = Math.exp(-b.drag * dt);
        b.vx *= k;
        b.vy *= k;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt;
      out.push(b);
    }
    this.bits = out;
  }

  draw(ctx: Ctx) {
    for (const b of this.bits) {
      const k = b.life / b.max;
      switch (b.kind) {
        case 'dust':
          ctx.globalAlpha = (1 - k) * 0.9;
          ctx.fillStyle = b.color;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size * (1 + k * 1.2), 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'chunk':
          ctx.globalAlpha = k > 0.75 ? (1 - k) * 4 : 1;
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          ctx.fillStyle = b.color;
          ctx.fillRect(-b.size / 2, -b.size / 2, b.size, b.size);
          ctx.restore();
          break;
        case 'ring':
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 1.4 * (1 - k) + 0.3;
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.size + k * 16, 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'glasses':
          drawGlasses(ctx, b.x, b.y, b.rot, k > 0.7 ? (1 - k) / 0.3 : 1);
          break;
        case 'spark':
          ctx.globalAlpha = 1 - k;
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 0.05, b.y - b.vy * 0.05);
          ctx.stroke();
          break;
        case 'star': {
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = b.color;
          ctx.save();
          ctx.translate(b.x, b.y);
          ctx.rotate(b.rot);
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const r = i % 2 ? b.size * 0.45 : b.size;
            const a = (i / 10) * Math.PI * 2;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
          }
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  }
}
