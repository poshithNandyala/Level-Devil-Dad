import { Ctx, circle, ellipse, rr } from './common';

export interface HeroPose {
  facing: 1 | -1;
  run: number; // run phase in radians
  moving: boolean;
  air: 'up' | 'down' | null;
  squash: number; // -0.3..0.3 (positive = squashed)
  blink: boolean;
  rim: string | null;
  /** seconds (drives breathing and the little idle moves) */
  t?: number;
  /** vertical speed, for the panic face when falling fast */
  vy?: number;
  /** seconds standing still */
  idle?: number;
  /** a foot is over the edge: -1 left, 1 right (arms windmill) */
  edge?: -1 | 0 | 1;
  /** something deadly is close (sweat, worried brows) */
  danger?: boolean;
  /** horizontal speed */
  vx?: number;
  /** the long-lost twin: other clothes, and the mole on his cheek */
  alt?: boolean;
  /** swimming: how far through a stroke (0..1), or -1 when just floating */
  swim?: number;
  /** hugging a palm trunk (climbing when true-ish and moving) */
  climb?: boolean;
  /** sliding down a wall on this side (-1, 1) */
  wall?: number;
  /** something in his hands (a dabba) */
  carry?: string | null;
}

const SKIN_PAPA = '#B97A4C';
const SKIN_PAPA_DK = '#94603A';
const SKIN_MUMMY = '#B07446';
const SKIN_MUMMY_DK = '#8E5A34';
const INK = '#16110E';
const LINE = 'rgba(22,17,14,0.78)';

function limb(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, w: number, color: string, outline = true) {
  ctx.lineCap = 'round';
  if (outline) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = w + 1.1;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** two-segment limb (hip/shoulder -> knee/elbow -> foot/hand) */
function limb2(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, w: number, color: string) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [c, lw] of [
    [LINE, w + 1.1],
    [color, w],
  ] as const) {
    ctx.strokeStyle = c;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  }
}

function outlined(ctx: Ctx, fill: string | CanvasGradient, lw = 0.7) {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = LINE;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** what the face and limbs should be doing this frame */
function moodOf(p: HeroPose) {
  const t = p.t ?? 0;
  const falling = p.air === 'down' && (p.vy ?? 0) > 330;
  const breathe = !p.moving && !p.air ? Math.sin(t * 2.3) : 0;
  // idle glances: look back, then ahead
  const idle = p.idle ?? 0;
  const glance = idle > 2.2 ? (Math.sin((idle - 2.2) * 1.3) > 0.55 ? -1 : 0) : 0;
  return { t, falling, breathe, glance, worried: !!p.danger || falling || (p.edge ?? 0) !== 0 };
}

/** Draws the hero with feet at (x, y). Local units: px, origin at feet center. */
export function drawHero(ctx: Ctx, who: 'papa' | 'mummy', x: number, y: number, p: HeroPose) {
  ctx.save();
  ctx.translate(x, y);
  const sx = 1 + p.squash * 0.6,
    sy = 1 - p.squash;
  // swimming: lie forward into the stroke (or tread water, nearly upright)
  if (p.swim !== undefined) {
    const k = Math.min(1, Math.abs(p.vx ?? 0) / 60);
    ctx.translate(0, -7);
    ctx.rotate(p.facing * (0.2 + k * 0.95));
    ctx.translate(0, 7);
  }
  ctx.scale(sx * p.facing, sy);
  // lean into the run, and wobble at a ledge
  const m = moodOf(p);
  let lean = p.moving ? Math.min(0.14, Math.abs(p.vx ?? 120) / 1000) : 0;
  if (p.edge && !p.moving && !p.air) lean += Math.sin(m.t * 9) * 0.09 * (p.edge * p.facing);
  if (lean) ctx.rotate(lean);
  if (p.rim) {
    ctx.shadowColor = p.rim;
    ctx.shadowBlur = 2.5;
  }
  if (who === 'papa') drawPapa(ctx, p, m);
  else drawMummy(ctx, p, m);
  ctx.shadowBlur = 0;
  // the twin's mole: that's how the audience tells them apart
  if (p.alt) circle(ctx, 3.3, -14.1, 0.62, '#1B120C');
  // a dabba held in front, both hands
  if (p.carry) {
    const bx = 4.6,
      by = -9.2;
    for (let i = 0; i < 3; i++) {
      rr(ctx, bx - 2.6, by - i * 2.3, 5.2, 2.2, 0.8);
      outlined(ctx, i === 1 ? '#CFD8DC' : '#B0BEC5', 0.45);
    }
    ctx.strokeStyle = '#78909C';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.arc(bx, by - 5.4, 1.8, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#E53935';
    ctx.fillRect(bx - 2.6, by - 2.3, 5.2, 0.5);
    circle(ctx, bx - 2.4, by - 1, 1.05, SKIN_PAPA);
  }
  // a bead of sweat when something nasty is close
  if (m.worried && !m.falling) {
    const k = (m.t * 1.6) % 1;
    ctx.globalAlpha = 1 - k * 0.6;
    ctx.fillStyle = '#BFE6FF';
    ctx.strokeStyle = 'rgba(30,60,90,0.6)';
    ctx.lineWidth = 0.4;
    ctx.beginPath();
    const dx = -3.4,
      dy = -19 + k * 3;
    ctx.moveTo(dx, dy - 1.6);
    ctx.quadraticCurveTo(dx + 1.1, dy, dx, dy + 0.6);
    ctx.quadraticCurveTo(dx - 1.1, dy, dx, dy - 1.6);
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

/** legs, feet and the far arm; returns where the near arm should swing */
function legsAndArms(ctx: Ctx, p: HeroPose, m: ReturnType<typeof moodOf>, pants: string, sleeve: string, skin: string, shoe: string, hideLegs = false) {
  const s = p.moving && !p.air ? Math.sin(p.run) : 0;
  const c = p.moving && !p.air ? Math.cos(p.run) : 0;
  // far arm (behind the body)
  const flail = m.falling ? Math.sin(m.t * 26) * 2 : 0;
  const wind = p.edge && !p.moving && !p.air ? Math.sin(m.t * 11) * 3.2 : 0;
  const armSwing = m.falling ? -5 + flail : p.air === 'up' ? -3.8 : p.air === 'down' ? -2 : s * 2.6 + wind;
  limb2(ctx, -1.4, -10.6, -2.2 - armSwing * 0.35, -8.4 + (p.air ? -2 : 0), -1.6 - armSwing * 0.75, -6.4 + (p.air ? -3.2 : 0) + (m.falling ? -3 : 0), 1.9, shadeLocal(sleeve));
  circle(ctx, -1.6 - armSwing * 0.75, -6.2 + (p.air ? -3.2 : 0) + (m.falling ? -3 : 0), 1.05, shadeLocal(skin));
  if (!hideLegs) {
    const footY = (k: number) => -1 - Math.max(0, k) * 1.6;
    if (p.air) {
      // tucked on the way up, dangling on the way down
      const up = p.air === 'up';
      limb2(ctx, -1.5, -5.2, -2.6, up ? -3.6 : -2.6, -3.2, up ? -2 : -0.8, 2.6, shadeLocal(pants));
      limb2(ctx, 1.5, -5.2, 3.2, up ? -4.4 : -3, 2.8, up ? -2.8 : -1.2, 2.6, pants);
      ctx.fillStyle = shoe;
      rr(ctx, -5, (up ? -2.6 : -1.4) - 0.2, 3.8, 1.7, 0.8);
      outlined(ctx, shoe, 0.5);
      rr(ctx, 1.4, (up ? -3.4 : -1.8) - 0.2, 3.8, 1.7, 0.8);
      outlined(ctx, shoe, 0.5);
    } else {
      const a = s * 2.4,
        b = -s * 2.4;
      const ka = footY(c),
        kb = footY(-c);
      limb2(ctx, -1.4, -5.2, -1.4 + a * 0.5 + 0.4, -2.8 + (p.moving ? ka * 0.4 : 0), -1.4 + a, ka, 2.6, shadeLocal(pants));
      limb2(ctx, 1.4, -5.2, 1.4 + b * 0.5 + 0.4, -2.8 + (p.moving ? kb * 0.4 : 0), 1.4 + b, kb, 2.6, pants);
      rr(ctx, -3.3 + a, ka - 0.6, 4, 1.7, 0.8);
      outlined(ctx, shoe, 0.5);
      rr(ctx, -0.4 + b, kb - 0.6, 4, 1.7, 0.8);
      outlined(ctx, shoe, 0.5);
    }
  }
  return { armSwing, skin };
}

function drawPapa(ctx: Ctx, p: HeroPose, m: ReturnType<typeof moodOf>) {
  const shirt = p.alt ? '#C0392B' : '#2F6FB5',
    shirtDk = p.alt ? '#8E2A20' : '#245A95',
    check = p.alt ? '#F5B7A8' : '#9CC3EE',
    pants = p.alt ? '#4A3A2E' : '#3A3E4A',
    sleeve = p.alt ? '#A93226' : '#2A63A3';
  const { armSwing } = legsAndArms(ctx, p, m, pants, sleeve, SKIN_PAPA, '#3B2618');
  const br = m.breathe * 0.28;
  ctx.save();
  ctx.translate(0, -br);
  // torso + belly, lit from the front
  rr(ctx, -4.7, -12.6, 9.4, 8.4, 2.7);
  const g = ctx.createLinearGradient(-4.7, 0, 4.7, 0);
  g.addColorStop(0, shirtDk);
  g.addColorStop(0.55, shirt);
  g.addColorStop(1, p.alt ? '#D9493A' : '#3A7FC6');
  outlined(ctx, g);
  ctx.beginPath();
  ctx.ellipse(1.5, -6.9, 4.4, 3.2 + br * 0.4, 0, 0, Math.PI * 2);
  outlined(ctx, g, 0.6);
  // checks
  ctx.save();
  rr(ctx, -4.6, -12.5, 9.2, 8.2, 2.6);
  ctx.clip();
  ctx.strokeStyle = check;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.5;
  for (let i = -4; i <= 6; i += 2.6) {
    ctx.beginPath();
    ctx.moveTo(i, -13);
    ctx.lineTo(i, -3);
    ctx.stroke();
  }
  for (let j = -11.6; j < -3; j += 2.6) {
    ctx.beginPath();
    ctx.moveTo(-6, j);
    ctx.lineTo(7, j);
    ctx.stroke();
  }
  ctx.restore();
  // shirt tail flapping when he moves
  if (p.moving || p.air) {
    const f = Math.sin((m.t + 0.2) * 18) * 0.6;
    ctx.fillStyle = shirtDk;
    ctx.beginPath();
    ctx.moveTo(-4.4, -5.6);
    ctx.lineTo(-6.2 + f, -4.6);
    ctx.lineTo(-4.4, -4.4);
    ctx.closePath();
    ctx.fill();
  }
  // collar
  ctx.fillStyle = '#E8F1FB';
  ctx.beginPath();
  ctx.moveTo(-0.8, -12.6);
  ctx.lineTo(1.4, -11.2);
  ctx.lineTo(3.4, -12.6);
  ctx.closePath();
  ctx.fill();
  // belt
  ctx.fillStyle = '#2A1C14';
  ctx.fillRect(-4.5, -5.3, 9.2, 1.15);
  ctx.fillStyle = '#E2B447';
  ctx.fillRect(1.6, -5.3, 1.5, 1.15);
  // pocket and pen
  ctx.strokeStyle = 'rgba(20,40,70,0.45)';
  ctx.lineWidth = 0.4;
  ctx.strokeRect(1.2, -11.2, 2.4, 2);
  ctx.fillStyle = '#E63946';
  ctx.fillRect(1.6, -11.9, 0.8, 2);
  // near arm (with the shirt sleeve)
  const hx = 1.6 + armSwing * 0.85,
    hy = -6.4 + (p.air ? -2.8 : 0) + (m.falling ? -3.4 : 0);
  limb2(ctx, 1.6, -10.8, 1.9 + armSwing * 0.4, -8.6 + (p.air ? -1.6 : 0), hx, hy, 2.1, sleeve);
  circle(ctx, hx, hy + 0.3, 1.2, SKIN_PAPA);
  ctx.translate(0, -br * 0.6);
  papaHead(ctx, p.blink, m);
  ctx.restore();
}

/** Papa's head, also used for the app icon. Local units, facing right. */
export function papaHead(ctx: Ctx, blink: boolean, m?: ReturnType<typeof moodOf>) {
  const t = m?.t ?? 0;
  const worried = m?.worried ?? false;
  const falling = m?.falling ?? false;
  const look = m?.glance ?? 0;
  // head with a little shading on the back
  ctx.beginPath();
  ctx.arc(0.4, -16.3, 4.45, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(2, -17.4, 0.6, 0.4, -16.3, 4.6);
  g.addColorStop(0, '#CE8C5A');
  g.addColorStop(0.7, SKIN_PAPA);
  g.addColorStop(1, SKIN_PAPA_DK);
  outlined(ctx, g, 0.65);
  // ear
  ctx.beginPath();
  ctx.ellipse(-2.6, -15.8, 1.05, 1.3, 0, 0, Math.PI * 2);
  outlined(ctx, '#A86B40', 0.5);
  // hair (side parted, grey at the temple), with a tuft that bounces
  const tuft = Math.sin(t * 7) * (falling ? 1.4 : 0.35);
  ctx.fillStyle = '#1E1A18';
  ctx.beginPath();
  ctx.arc(0.4, -16.7, 4.55, Math.PI * 1.02, Math.PI * 1.98);
  ctx.lineTo(4.5, -17.7);
  ctx.quadraticCurveTo(1.6, -19.7, -1.1, -18.6);
  ctx.lineTo(-3.5, -15.2);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-0.6, -20.6);
  ctx.quadraticCurveTo(0.4 + tuft, -22.6, 1.6 + tuft, -21.1);
  ctx.quadraticCurveTo(0.8, -20.8, -0.6, -20.6);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(1.6, -20.1, 1.6, 0.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#A3A3A3';
  ctx.beginPath();
  ctx.ellipse(-3.3, -15.7, 0.55, 1, 0.2, 0, Math.PI * 2);
  ctx.fill();
  // eyebrows: up when worried or falling
  const bu = falling ? -1.1 : worried ? -0.6 : 0;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.65;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0.6, -18 + bu + (worried ? 0.3 : 0));
  ctx.lineTo(2.4, -18.3 + bu);
  ctx.moveTo(3.2, -18.3 + bu);
  ctx.lineTo(4.8, -18 + bu + (worried ? 0.3 : 0));
  ctx.stroke();
  // eyes behind the glasses
  const ex = look * 0.45;
  if (blink) {
    ctx.beginPath();
    ctx.moveTo(1, -16.1);
    ctx.lineTo(2.3, -16.1);
    ctx.moveTo(3.4, -16.1);
    ctx.lineTo(4.5, -16.1);
    ctx.stroke();
  } else {
    const r = falling ? 0.75 : 0.58;
    circle(ctx, 1.75, -16.1, r + 0.35, '#F7F3EE');
    circle(ctx, 3.95, -16.1, r + 0.3, '#F7F3EE');
    circle(ctx, 1.85 + ex, -16.1, r, INK);
    circle(ctx, 4.0 + ex, -16.1, r - 0.04, INK);
  }
  // glasses with a glint
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.arc(1.65, -16.1, 1.55, 0, Math.PI * 2);
  ctx.moveTo(5.35, -16.1);
  ctx.arc(3.95, -16.1, 1.4, 0, Math.PI * 2);
  ctx.moveTo(3.1, -16.3);
  ctx.lineTo(2.5, -16.3);
  ctx.moveTo(0.1, -16.4);
  ctx.lineTo(-2, -16.8);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 0.35;
  ctx.beginPath();
  ctx.arc(1.65, -16.1, 1.1, -2.4, -1.7);
  ctx.stroke();
  // nose
  ctx.fillStyle = '#A86B40';
  ctx.beginPath();
  ctx.ellipse(4.4, -14.7, 0.95, 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  // mouth: a wide O when falling, a wobbly line when worried
  if (falling) {
    circle(ctx, 3.2, -12.7, 0.75, '#5A1E14');
  } else if (worried) {
    ctx.strokeStyle = '#5A1E14';
    ctx.lineWidth = 0.45;
    ctx.beginPath();
    ctx.moveTo(1.9, -12.6);
    ctx.quadraticCurveTo(2.7, -13, 3.4, -12.6);
    ctx.quadraticCurveTo(4, -12.3, 4.4, -12.7);
    ctx.stroke();
  }
  // mustache
  ctx.fillStyle = '#16110E';
  ctx.beginPath();
  ctx.moveTo(0.6, -13.5);
  ctx.quadraticCurveTo(2.6, -14.6, 4.4, -14);
  ctx.quadraticCurveTo(5.7, -14.3, 5.5, -13.2);
  ctx.quadraticCurveTo(3.2, -12.4, 0.6, -13.5);
  ctx.fill();
}

function drawMummy(ctx: Ctx, p: HeroPose, m: ReturnType<typeof moodOf>) {
  const saree = p.alt ? '#2E9E5B' : '#D63A6E',
    sareeDk = p.alt ? '#1E7042' : '#A92A55',
    border = '#F2C14E',
    blouse = '#7B2D8E';
  const s = p.moving && !p.air ? Math.sin(p.run) : 0;
  // far arm
  const flail = m.falling ? Math.sin(m.t * 26) * 2 : 0;
  const wind = p.edge && !p.moving && !p.air ? Math.sin(m.t * 11) * 3.2 : 0;
  const armSwing = m.falling ? -5 + flail : p.air === 'up' ? -3.4 : p.air === 'down' ? -1.6 : s * 2.4 + wind;
  limb2(ctx, -1.2, -11, -2 - armSwing * 0.3, -8.8, -1.4 - armSwing * 0.7, -7 + (p.air ? -2.4 : 0) + (m.falling ? -3 : 0), 1.8, SKIN_MUMMY_DK);
  // feet peeking out
  if (p.air) {
    rr(ctx, -3.8, -1.8, 3.4, 1.6, 0.7);
    outlined(ctx, '#3B2618', 0.5);
    rr(ctx, 1, -2.6, 3.4, 1.6, 0.7);
    outlined(ctx, '#3B2618', 0.5);
  } else {
    rr(ctx, -3.2 + s * 1.7, -1.5, 3.6, 1.6, 0.7);
    outlined(ctx, '#3B2618', 0.5);
    rr(ctx, -0.3 - s * 1.7, -1.5, 3.6, 1.6, 0.7);
    outlined(ctx, '#3B2618', 0.5);
  }
  // pallu flowing behind
  const flow = p.moving || p.air ? 1 : 0.35 + Math.sin(m.t * 1.7) * 0.1;
  ctx.beginPath();
  ctx.moveTo(-1, -12);
  ctx.quadraticCurveTo(-6 - flow * 2, -10 + Math.sin(p.run * 0.5 + m.t * 3) * flow, -7 - flow * 3.5, -5.5 + Math.sin(p.run + m.t * 4) * flow * 1.4);
  ctx.lineTo(-4.2, -5);
  ctx.closePath();
  outlined(ctx, sareeDk, 0.55);
  // skirt of the saree
  ctx.beginPath();
  ctx.moveTo(-3.6, -8);
  ctx.lineTo(3.8, -8);
  ctx.lineTo(4.9 + (p.air ? 1 : 0), -1.3);
  ctx.lineTo(-4.9 - (p.air ? 1 : 0), -1.3);
  ctx.closePath();
  const g = ctx.createLinearGradient(-5, 0, 5, 0);
  g.addColorStop(0, sareeDk);
  g.addColorStop(0.6, saree);
  g.addColorStop(1, '#E2557F');
  outlined(ctx, g);
  ctx.fillStyle = border;
  ctx.fillRect(-4.9 - (p.air ? 1 : 0), -2.5, 9.8 + (p.air ? 2 : 0), 1.2);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 0.5;
  for (let i = -2; i <= 2; i += 1.6) {
    ctx.beginPath();
    ctx.moveTo(i * 0.7, -7.5);
    ctx.lineTo(i, -2.5);
    ctx.stroke();
  }
  const br = m.breathe * 0.25;
  ctx.save();
  ctx.translate(0, -br);
  // torso
  rr(ctx, -3.6, -12.7, 7.4, 5.5, 2.2);
  outlined(ctx, blouse);
  // drape across the chest
  ctx.fillStyle = saree;
  ctx.beginPath();
  ctx.moveTo(-3.6, -12.5);
  ctx.lineTo(-1.6, -12.7);
  ctx.lineTo(3.8, -8);
  ctx.lineTo(1.2, -8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = border;
  ctx.beginPath();
  ctx.moveTo(-1.6, -12.7);
  ctx.lineTo(-0.9, -12.7);
  ctx.lineTo(3.8, -8.4);
  ctx.lineTo(3.8, -8);
  ctx.closePath();
  ctx.fill();
  // near arm and bangles
  const hx = 1.6 + armSwing * 0.8,
    hy = -7 + (p.air ? -2.6 : 0) + (m.falling ? -3.2 : 0);
  limb2(ctx, 1.6, -11.3, 1.9 + armSwing * 0.4, -9, hx, hy, 1.9, SKIN_MUMMY);
  circle(ctx, 1.6 + armSwing * 0.7, hy - 0.9, 0.75, border);
  ctx.translate(0, -br * 0.6);
  // head
  ctx.beginPath();
  ctx.arc(0.4, -16.2, 4.2, 0, Math.PI * 2);
  const hg = ctx.createRadialGradient(2, -17.3, 0.6, 0.4, -16.2, 4.4);
  hg.addColorStop(0, '#C98654');
  hg.addColorStop(0.7, SKIN_MUMMY);
  hg.addColorStop(1, SKIN_MUMMY_DK);
  outlined(ctx, hg, 0.65);
  // hair + bun + jasmine
  ctx.fillStyle = '#17110E';
  ctx.beginPath();
  ctx.arc(0.4, -16.6, 4.35, Math.PI * 1.0, Math.PI * 1.95);
  ctx.quadraticCurveTo(2.5, -19.6, -1, -19.1);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-3.2, -15.4, 2.9, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();
  const bob = Math.sin(m.t * 6) * (p.moving ? 0.4 : 0.1);
  circle(ctx, -4.6, -16.4 + bob, 2.2, '#17110E');
  for (let i = 0; i < 4; i++) circle(ctx, -6.2 + i * 0.6, -17.6 + bob + Math.abs(i - 1.5) * 0.4, 0.55, '#FBFBF2');
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.ellipse(1.4, -20, 1.6, 0.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // brows and eyes
  const bu = m.falling ? -1 : m.worried ? -0.55 : 0;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 0.55;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(1, -17.9 + bu);
  ctx.lineTo(2.4, -18.2 + bu);
  ctx.moveTo(3.3, -18.2 + bu);
  ctx.lineTo(4.6, -17.9 + bu);
  ctx.stroke();
  const ex = m.glance * 0.4;
  if (p.blink) {
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(1.2, -16.2);
    ctx.lineTo(2.4, -16.2);
    ctx.moveTo(3.4, -16.2);
    ctx.lineTo(4.4, -16.2);
    ctx.stroke();
  } else {
    circle(ctx, 1.8, -16.2, 0.95, '#F7F3EE');
    circle(ctx, 3.9, -16.2, 0.9, '#F7F3EE');
    circle(ctx, 1.9 + ex, -16.2, m.falling ? 0.72 : 0.6, INK);
    circle(ctx, 4.0 + ex, -16.2, m.falling ? 0.68 : 0.56, INK);
  }
  // bindi
  circle(ctx, 2.9, -18.9, 0.55, '#C1121F');
  // mouth
  ctx.strokeStyle = '#6B2B1E';
  ctx.lineWidth = 0.55;
  if (m.falling) circle(ctx, 3, -14.1, 0.7, '#5A1E14');
  else {
    ctx.beginPath();
    if (m.worried) {
      ctx.moveTo(2, -14.2);
      ctx.quadraticCurveTo(3, -14.6, 4, -14.2);
    } else ctx.arc(3, -14.5, 1.1, 0.2, Math.PI - 0.6);
    ctx.stroke();
  }
  // earring
  circle(ctx, -1.8, -14.6, 0.6, '#F2C14E');
  ctx.restore();
}

function shadeLocal(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) * 0.82,
    g = ((n >> 8) & 255) * 0.82,
    b = (n & 255) * 0.82;
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// --------------------------------------------------------------------- rival
export type Mood = 'smug' | 'point' | 'laugh' | 'shocked' | 'annoyed';

/** Tara: a confident adult trickster. Feet at (x, y). */
export function drawTara(ctx: Ctx, x: number, y: number, facing: 1 | -1, mood: Mood, t: number) {
  ctx.save();
  ctx.translate(x, y);
  const bounce = mood === 'laugh' ? Math.abs(Math.sin(t * 14)) * 1.2 : 0;
  ctx.translate(0, -bounce);
  ctx.scale(facing, 1);
  const skin = '#A86F45',
    jacket = '#6D3BC0',
    jeans = '#2D3142',
    hair = '#22130D';
  // legs
  limb(ctx, -1.5, -7, -2, -1.2, 2.6, jeans);
  limb(ctx, 1.5, -7, 2.2, -1.2, 2.6, jeans);
  ctx.fillStyle = '#F4F4F4';
  rr(ctx, -4.2, -1.8, 4, 1.8, 0.8);
  ctx.fill();
  rr(ctx, 0.6, -1.8, 4, 1.8, 0.8);
  ctx.fill();
  // ponytail
  const sway = Math.sin(t * 3) * 0.8;
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-3, -21.5);
  ctx.quadraticCurveTo(-8 + sway, -20, -6.5 + sway, -14.5);
  ctx.quadraticCurveTo(-5.4, -18, -2.4, -19);
  ctx.closePath();
  ctx.fill();
  // jacket torso
  ctx.fillStyle = '#F2C14E';
  rr(ctx, -3.2, -15.2, 6.4, 8.6, 2);
  ctx.fill();
  ctx.fillStyle = jacket;
  ctx.beginPath();
  ctx.moveTo(-4.4, -15.4);
  ctx.lineTo(-0.6, -15.4);
  ctx.lineTo(-0.4, -6.4);
  ctx.lineTo(-4.6, -6.4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4.4, -15.4);
  ctx.lineTo(1.4, -15.4);
  ctx.lineTo(1.6, -6.4);
  ctx.lineTo(4.6, -6.4);
  ctx.closePath();
  ctx.fill();
  // arms by mood
  const sleeve = jacket;
  if (mood === 'point') {
    limb(ctx, 2.6, -13.6, 9, -15.6, 2.3, sleeve);
    circle(ctx, 9.6, -15.8, 1.2, skin);
    limb(ctx, -2.6, -13.4, -4.6, -9.6, 2.3, sleeve);
    limb(ctx, -4.6, -9.6, -2.4, -8, 2.1, sleeve);
  } else if (mood === 'laugh') {
    limb(ctx, 2.6, -13.4, 3.6, -9, 2.3, sleeve);
    limb(ctx, 3.6, -9, 1, -8.4, 2.1, sleeve);
    limb(ctx, -2.6, -13.4, -5.6, -17.4, 2.3, sleeve);
    circle(ctx, -5.9, -18, 1.2, skin);
  } else if (mood === 'shocked') {
    limb(ctx, 2.6, -13.6, 6, -18.6, 2.3, sleeve);
    circle(ctx, 6.2, -19.4, 1.2, skin);
    limb(ctx, -2.6, -13.6, -6, -18.6, 2.3, sleeve);
    circle(ctx, -6.2, -19.4, 1.2, skin);
  } else if (mood === 'annoyed') {
    limb(ctx, -2.6, -13.2, 2.6, -10.6, 2.4, sleeve);
    limb(ctx, 2.6, -13.2, -2.4, -10, 2.4, sleeve);
  } else {
    limb(ctx, 2.6, -13.4, 4.6, -9.6, 2.3, sleeve);
    limb(ctx, 4.6, -9.6, 2.2, -7.8, 2.1, sleeve);
    limb(ctx, -2.6, -13.4, -3.2, -8.4, 2.3, sleeve);
    circle(ctx, -3.3, -7.9, 1.1, skin);
  }
  // head
  const tilt = mood === 'laugh' ? -0.25 : 0;
  ctx.save();
  ctx.translate(0.2, -19);
  ctx.rotate(tilt);
  circle(ctx, 0, 0, 4.2, skin);
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.arc(0, -0.5, 4.4, Math.PI * 0.95, Math.PI * 2.02);
  ctx.quadraticCurveTo(1, -2.4, -2.6, 1.4);
  ctx.closePath();
  ctx.fill();
  // face by mood
  if (mood === 'shocked') {
    // sunglasses slipped down to the nose, real eyes visible
    circle(ctx, 1.6, -0.6, 1.1, '#FFFFFF');
    circle(ctx, 3.7, -0.6, 1.0, '#FFFFFF');
    circle(ctx, 1.8, -0.5, 0.5, INK);
    circle(ctx, 3.8, -0.5, 0.45, INK);
    ctx.fillStyle = '#111';
    rr(ctx, 0.4, 1.0, 5, 1.5, 0.6);
    ctx.fill();
    ctx.fillStyle = '#5A1F1A';
    ctx.beginPath();
    ctx.ellipse(2.9, 3.0, 0.9, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#111';
    rr(ctx, 0.2, -1.6, 5.2, 1.9, 0.8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(1, -1.3, 1.2, 0.5);
    ctx.strokeStyle = '#5A1F1A';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    if (mood === 'laugh') {
      ctx.fillStyle = '#5A1F1A';
      ctx.moveTo(1.2, 1.4);
      ctx.quadraticCurveTo(3, 4.2, 4.6, 1.4);
      ctx.closePath();
      ctx.fill();
    } else if (mood === 'annoyed') {
      ctx.moveTo(1.6, 2.6);
      ctx.quadraticCurveTo(3, 1.8, 4.4, 2.6);
      ctx.stroke();
    } else {
      ctx.moveTo(1.4, 1.9);
      ctx.quadraticCurveTo(3, 2.9, 4.4, 1.2);
      ctx.stroke();
    }
  }
  circle(ctx, -1.4, 0.8, 0.6, '#F2C14E');
  ctx.restore();
  ctx.restore();
}

/** Bandar: the mascot alternative for A/B tests. */
export function drawBandar(ctx: Ctx, x: number, y: number, facing: 1 | -1, mood: Mood, t: number) {
  ctx.save();
  ctx.translate(x, y);
  const bounce = mood === 'laugh' ? Math.abs(Math.sin(t * 14)) * 1.6 : 0;
  ctx.translate(0, -bounce);
  ctx.scale(facing, 1);
  const fur = '#8B5A2B',
    face = '#E2B48A';
  // tail
  ctx.strokeStyle = fur;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -4);
  ctx.quadraticCurveTo(-9, -4 + Math.sin(t * 4), -8, -10);
  ctx.quadraticCurveTo(-7, -13, -5, -11.5);
  ctx.stroke();
  // legs & body
  limb(ctx, -1.8, -5, -2.6, -0.8, 2.6, fur);
  limb(ctx, 1.8, -5, 2.6, -0.8, 2.6, fur);
  ellipse(ctx, 0, -8, 4.6, 5, fur);
  ellipse(ctx, 0.8, -7.4, 2.8, 3.4, face);
  if (mood === 'point') {
    limb(ctx, 2.4, -10, 8.4, -12.6, 2.2, fur);
  } else if (mood === 'shocked') {
    limb(ctx, 2.4, -10, 5.4, -15.6, 2.2, fur);
    limb(ctx, -2.4, -10, -5.4, -15.6, 2.2, fur);
  } else if (mood === 'annoyed') {
    limb(ctx, -2.6, -10, 2.6, -8, 2.2, fur);
  } else if (mood === 'laugh') {
    limb(ctx, 2.4, -10, 3.8, -6.4, 2.2, fur);
    limb(ctx, -2.4, -10, -5.6, -14, 2.2, fur);
  } else {
    limb(ctx, 2.4, -10, 3.4, -5.8, 2.2, fur);
  }
  // head
  circle(ctx, 0.4, -15, 4.3, fur);
  circle(ctx, -3.6, -15.6, 1.6, fur);
  circle(ctx, -3.6, -15.6, 0.8, face);
  ellipse(ctx, 1.6, -14.4, 2.9, 2.6, face);
  if (mood === 'shocked') {
    circle(ctx, 1.2, -15.6, 0.9, '#fff');
    circle(ctx, 3.2, -15.6, 0.9, '#fff');
    circle(ctx, 1.3, -15.5, 0.45, INK);
    circle(ctx, 3.3, -15.5, 0.45, INK);
    circle(ctx, 2.4, -13, 0.8, '#5A1F1A');
  } else {
    circle(ctx, 1.2, -15.4, 0.55, INK);
    circle(ctx, 3.2, -15.4, 0.55, INK);
    ctx.strokeStyle = '#5A1F1A';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    if (mood === 'laugh') ctx.arc(2.4, -13.4, 1.2, 0, Math.PI);
    else if (mood === 'annoyed') {
      ctx.moveTo(1.4, -12.6);
      ctx.lineTo(3.4, -12.9);
    } else ctx.arc(2.4, -13.6, 1, 0.2, Math.PI - 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

/** The "no rival" variant: a plain wooden sign that says the same lines. */
export function drawSignpost(ctx: Ctx, x: number, y: number, facing: 1 | -1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#6B4A2E';
  ctx.fillRect(-0.9, -16, 1.8, 16);
  ctx.scale(facing, 1);
  ctx.fillStyle = '#C9A26B';
  ctx.beginPath();
  ctx.moveTo(-6, -19);
  ctx.lineTo(5, -19);
  ctx.lineTo(8, -16.2);
  ctx.lineTo(5, -13.4);
  ctx.lineTo(-6, -13.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6B4A2E';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.restore();
}


/**
 * Tara's portrait for the corner pop-in: head and shoulders inside a round badge of radius r,
 * centred at (cx, cy). Moods change her face; she bounces when she laughs.
 */
export function drawRivalBust(ctx: Ctx, cx: number, cy: number, r: number, mood: Mood, t: number, ring: string, kind: 'tara' | 'bandar') {
  ctx.save();
  // badge
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.arc(cx + 1.5, cy + 3, r, 0, Math.PI * 2);
  ctx.fill();
  const bg = ctx.createLinearGradient(cx, cy - r, cx, cy + r);
  bg.addColorStop(0, '#FFF3D6');
  bg.addColorStop(1, '#F6C98B');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.clip();
  const u = r / 26;
  const bounce = mood === 'laugh' ? Math.abs(Math.sin(t * 13)) * 2.4 * u : Math.sin(t * 2) * 0.6 * u;
  ctx.translate(cx, cy + 6 * u - bounce);
  ctx.scale(u, u);
  if (kind === 'bandar') bandarBust(ctx, mood, t);
  else taraBust(ctx, mood, t);
  ctx.restore();
  ctx.lineWidth = Math.max(2, r * 0.11);
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1.5, r * 0.06);
  ctx.strokeStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r + ctx.lineWidth * 0.9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function taraBust(ctx: Ctx, mood: Mood, t: number) {
  const skin = '#A86F45',
    skinDk = '#87552F',
    hair = '#22130D';
  // ponytail swinging behind
  const sway = Math.sin(t * 3.1) * 2.2;
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.moveTo(-6, -20);
  ctx.quadraticCurveTo(-22 + sway, -18, -18 + sway, 0);
  ctx.quadraticCurveTo(-14, -10, -4, -14);
  ctx.closePath();
  ctx.fill();
  // shoulders: purple jacket over a yellow top
  ctx.fillStyle = '#6D3BC0';
  ctx.beginPath();
  ctx.moveTo(-22, 26);
  ctx.quadraticCurveTo(-20, 8, -6, 6);
  ctx.lineTo(6, 6);
  ctx.quadraticCurveTo(20, 8, 22, 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#F2C14E';
  ctx.beginPath();
  ctx.moveTo(-5, 6);
  ctx.lineTo(0, 16);
  ctx.lineTo(5, 6);
  ctx.closePath();
  ctx.fill();
  // neck and head
  ctx.fillStyle = skinDk;
  ctx.fillRect(-3.2, 0, 6.4, 8);
  const g = ctx.createRadialGradient(3, -12, 2, 0, -9, 13);
  g.addColorStop(0, '#C08158');
  g.addColorStop(0.75, skin);
  g.addColorStop(1, skinDk);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -9, 10.5, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // hair cap with a side fringe
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(0, -14, 11.2, 9.5, 0, Math.PI, Math.PI * 2);
  ctx.quadraticCurveTo(9, -10, 4, -14);
  ctx.quadraticCurveTo(-2, -12, -9, -9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.ellipse(3, -20, 5, 1.6, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // earrings
  ctx.fillStyle = '#F2C14E';
  ctx.beginPath();
  ctx.arc(-10, -5, 1.6, 0, Math.PI * 2);
  ctx.arc(10, -5, 1.6, 0, Math.PI * 2);
  ctx.fill();
  // face by mood
  const blink = (t * 60) % 230 < 6;
  ctx.strokeStyle = '#1B120D';
  ctx.fillStyle = '#1B120D';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.3;
  const brow = (x: number, tilt: number, lift = 0) => {
    ctx.beginPath();
    ctx.moveTo(x - 2.6, -13.5 - lift + tilt);
    ctx.lineTo(x + 2.6, -13.5 - lift - tilt);
    ctx.stroke();
  };
  if (mood === 'laugh') {
    brow(-4.5, -0.6, 1);
    brow(4.5, 0.6, 1);
    for (const x of [-4.5, 4.5]) {
      ctx.beginPath();
      ctx.arc(x, -9, 2.2, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
    ctx.fillStyle = '#5A1E14';
    ctx.beginPath();
    ctx.ellipse(0, -2.4, 4.4, 3.2, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-3.4, -2.4, 6.8, 1.2);
    ctx.fillStyle = 'rgba(214,70,80,0.35)';
    ctx.beginPath();
    ctx.arc(-7, -4.5, 2.2, 0, Math.PI * 2);
    ctx.arc(7, -4.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (mood === 'shocked') {
    brow(-4.5, 0, 2.6);
    brow(4.5, 0, 2.6);
    for (const x of [-4.5, 4.5]) {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, -8.6, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1B120D';
      ctx.beginPath();
      ctx.arc(x, -8.4, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5A1E14';
    ctx.beginPath();
    ctx.ellipse(0, -2, 2.2, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // smug / point / annoyed
    const annoyed = mood === 'annoyed';
    brow(-4.5, annoyed ? -0.9 : 0.5, 0);
    brow(4.5, annoyed ? 0.9 : -0.9, mood === 'point' ? 1 : 0);
    for (const x of [-4.5, 4.5]) {
      if (blink || (mood === 'point' && x < 0)) {
        ctx.beginPath();
        ctx.moveTo(x - 2, -8.6);
        ctx.quadraticCurveTo(x, -7.6, x + 2, -8.6);
        ctx.stroke();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.ellipse(x, -8.8, 2.2, mood === 'smug' ? 1.5 : 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1B120D';
        ctx.beginPath();
        ctx.arc(x + 0.5, -8.7, 1.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x + 0.9, -9.3, 0.45, 0, Math.PI * 2);
        ctx.fill();
        if (mood === 'smug') {
          ctx.fillStyle = skin;
          ctx.fillRect(x - 2.6, -11.2, 5.2, 1.6);
        }
      }
    }
    ctx.strokeStyle = '#5A1E14';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (annoyed) {
      ctx.moveTo(-2.6, -2.6);
      ctx.quadraticCurveTo(0, -3.6, 2.6, -2.6);
    } else {
      ctx.moveTo(-3, -3.4);
      ctx.quadraticCurveTo(0.5, -1, 3.6, -4.2);
    }
    ctx.stroke();
  }
  // nose
  ctx.fillStyle = skinDk;
  ctx.beginPath();
  ctx.ellipse(0.4, -5.6, 1.2, 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  // pointing hand
  if (mood === 'point') {
    ctx.fillStyle = skin;
    ctx.beginPath();
    ctx.ellipse(13, 14, 4, 3.4, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = skin;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(15, 12);
    ctx.lineTo(21, 7);
    ctx.stroke();
  }
}

function bandarBust(ctx: Ctx, mood: Mood, t: number) {
  const fur = '#8A6A4A',
    face = '#E6B9A0';
  ctx.fillStyle = fur;
  ctx.beginPath();
  ctx.ellipse(0, 18, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(0, -8, 12.5, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-12, -9, 4, 0, Math.PI * 2);
  ctx.arc(12, -9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.ellipse(0, -6, 8.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  const laugh = mood === 'laugh';
  ctx.fillStyle = '#1B120D';
  for (const x of [-3.6, 3.6]) {
    ctx.beginPath();
    if (laugh) {
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#1B120D';
      ctx.arc(x, -8, 1.8, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      ctx.arc(x, -8, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = '#5A1E14';
  ctx.beginPath();
  if (laugh || mood === 'shocked') ctx.ellipse(0, -1.5, 3.6, 2.6 + Math.abs(Math.sin(t * 13)) * (laugh ? 1 : 0), 0, 0, Math.PI * 2);
  else ctx.ellipse(0, -2, 3, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
}
