import { Ctx, circle } from './art/common';

type Kind = 'dot' | 'rect' | 'star' | 'ring' | 'glasses' | 'confetti' | 'spark';

interface P {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  drag: number;
  life: number;
  max: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Purely cosmetic particles (never affect gameplay, so Math.random is fine). */
export class Particles {
  list: P[] = [];

  add(p: Partial<P> & { x: number; y: number }) {
    if (this.list.length > 400) this.list.shift();
    this.list.push({
      kind: 'dot',
      vx: 0,
      vy: 0,
      g: 0,
      drag: 0,
      life: 0,
      max: 0.5,
      size: 2,
      color: '#fff',
      rot: 0,
      vr: 0,
      ...p,
    });
  }

  clear() {
    this.list = [];
  }

  update(dt: number) {
    for (const p of this.list) {
      p.life += dt;
      p.vy += p.g * dt;
      if (p.drag) {
        const k = Math.max(0, 1 - p.drag * dt);
        p.vx *= k;
        p.vy *= k;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    this.list = this.list.filter((p) => p.life < p.max);
  }

  draw(ctx: Ctx) {
    for (const p of this.list) {
      const k = p.life / p.max;
      const a = p.kind === 'ring' ? 1 - k : Math.min(1, (1 - k) * 1.6);
      ctx.globalAlpha = Math.max(0, a);
      switch (p.kind) {
        case 'dot':
          circle(ctx, p.x, p.y, p.size * (p.drag ? 1 + k * 0.6 : 1), p.color);
          break;
        case 'rect':
        case 'confetti':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / (p.kind === 'confetti' ? 4 : 2), p.size, p.kind === 'confetti' ? p.size / 2 : p.size);
          ctx.restore();
          break;
        case 'star': {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const r = i % 2 ? p.size * 0.45 : p.size;
            const ang = (i * Math.PI) / 5;
            ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'ring':
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.4 * (1 - k) + 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.3 + k), 0, Math.PI * 2);
          ctx.stroke();
          break;
        case 'spark':
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
          ctx.stroke();
          break;
        case 'glasses':
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.strokeStyle = '#111';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.arc(-1.8, 0, 1.6, 0, Math.PI * 2);
          ctx.moveTo(3.4, 0);
          ctx.arc(1.8, 0, 1.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          break;
      }
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------- emitters
  dust(x: number, y: number, n: number, color = 'rgba(255,255,255,0.75)', spread = 1) {
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1;
      this.add({ kind: 'dot', x: x + rnd(-3, 3), y: y - 1, vx: dir * rnd(18, 50) * spread, vy: rnd(-26, -6), drag: 4, max: rnd(0.25, 0.45), size: rnd(1, 2.2), color });
    }
  }

  death(x: number, y: number, colors: string[], glasses: boolean) {
    this.add({ kind: 'ring', x, y, size: 20, max: 0.4, color: '#ffffff' });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rnd(-0.2, 0.2);
      const sp = rnd(70, 190);
      this.add({
        kind: i % 4 === 0 ? 'star' : 'rect',
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        g: 520,
        max: rnd(0.5, 0.9),
        size: i % 4 === 0 ? rnd(2, 3) : rnd(1.8, 3.4),
        color: i % 4 === 0 ? '#FFD166' : colors[i % colors.length],
        rot: rnd(0, 6),
        vr: rnd(-12, 12),
      });
    }
    if (glasses) this.add({ kind: 'glasses', x, y: y - 6, vx: rnd(-40, 40), vy: -170, g: 520, max: 1.1, rot: 0, vr: rnd(-14, 14) });
  }

  steamPuff(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      this.add({ kind: 'dot', x: x + rnd(-5, 5), y: y - rnd(0, 4), vx: rnd(-15, 15), vy: rnd(-90, -40), drag: 2, max: rnd(0.4, 0.8), size: rnd(2, 4), color: 'rgba(255,255,255,0.7)' });
    }
  }

  sparkle(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      this.add({ kind: 'star', x, y, vx: Math.cos(a) * rnd(40, 90), vy: Math.sin(a) * rnd(40, 90), drag: 3, max: rnd(0.4, 0.7), size: rnd(1.6, 2.6), color: i % 2 ? '#FFD166' : '#FFF6C2', rot: 0, vr: rnd(-8, 8) });
    }
    this.add({ kind: 'ring', x, y, size: 16, max: 0.35, color: '#FFF6C2' });
  }

  confetti(x: number, y: number, n = 36) {
    const cols = ['#FFD166', '#EF476F', '#06D6A0', '#118AB2', '#F77F00', '#8E6CCB'];
    for (let i = 0; i < n; i++) {
      const a = rnd(-Math.PI * 0.95, -Math.PI * 0.05);
      const sp = rnd(80, 230);
      this.add({ kind: 'confetti', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 260, drag: 1.2, max: rnd(0.9, 1.6), size: rnd(2.4, 3.6), color: cols[i % cols.length], rot: rnd(0, 6), vr: rnd(-16, 16) });
    }
    this.add({ kind: 'ring', x, y, size: 26, max: 0.5, color: '#FFF6C2' });
  }

  crumble(x: number, y: number, w: number, color: string) {
    for (let i = 0; i < Math.min(18, w / 3); i++) {
      this.add({ kind: 'rect', x: x + rnd(-w / 2, w / 2), y: y + rnd(0, 6), vx: rnd(-30, 30), vy: rnd(-60, 10), g: 600, max: rnd(0.5, 0.9), size: rnd(1.5, 3.5), color, rot: rnd(0, 6), vr: rnd(-8, 8) });
    }
  }

  poof(x: number, y: number, w: number, h: number) {
    for (let i = 0; i < 14; i++) {
      this.add({ kind: 'dot', x: x + rnd(-w / 2, w / 2), y: y + rnd(-h / 2, h / 2), vx: rnd(-20, 20), vy: rnd(-30, -5), drag: 3, max: rnd(0.35, 0.6), size: rnd(2, 4), color: 'rgba(255,255,255,0.8)' });
    }
  }

  rice(x: number, y: number) {
    for (let i = 0; i < 26; i++) {
      const a = rnd(-Math.PI, 0);
      const sp = rnd(50, 160);
      this.add({ kind: 'rect', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 420, max: rnd(0.6, 1), size: 1.4, color: i % 6 === 0 ? '#F28C28' : '#FFF8E7', rot: rnd(0, 6), vr: rnd(-10, 10) });
    }
  }

  sparks(x: number, y: number, color = '#FFE08A') {
    for (let i = 0; i < 8; i++) {
      const a = rnd(0, Math.PI * 2);
      this.add({ kind: 'spark', x, y, vx: Math.cos(a) * 140, vy: Math.sin(a) * 140, drag: 6, max: 0.3, color });
    }
  }

  stars(x: number, y: number) {
    for (let i = 0; i < 3; i++) this.add({ kind: 'star', x: x + rnd(-4, 4), y, vx: rnd(-30, 30), vy: rnd(-60, -30), g: 200, max: 0.5, size: 1.8, color: '#FFD166', vr: 6 });
  }
}
