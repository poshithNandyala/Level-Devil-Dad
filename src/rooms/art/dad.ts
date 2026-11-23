// Dad, drawn in vectors at world scale (his box is 10x14; feet at the origin).
// Chunky shapes and a dark outline so he reads at 30 px on any backdrop:
// side-parted hair going grey, round glasses, a proper moustache, a coral shirt
// with a pen in the pocket, navy trousers. Squash and stretch, a run cycle,
// a teeter at the edge, a glance at his watch while he waits.

export type Ctx = CanvasRenderingContext2D;

export interface DadPose {
  /** feet centre, world px */
  x: number;
  y: number;
  facing: 1 | -1;
  /** seconds (for blinks and idles) */
  t: number;
  /** distance run (px), drives the legs */
  run: number;
  moving: boolean;
  air: boolean;
  vy: number;
  /** squash: >0 flattened (landing), <0 stretched (take-off) */
  squash: number;
  /** seconds standing still */
  idle: number;
  /** a hole right in front of his toes */
  edge: boolean;
  /** something nasty close by */
  worried: boolean;
  /** drawn see-through, in one colour (the ghosts of earlier tries) */
  ghost?: { alpha: number; tint: string };
}

export const DAD = {
  shirt: '#FF5B4A',
  shirtDark: '#D9402F',
  shirtLight: '#FF8A72',
  pants: '#2D3A5C',
  pantsDark: '#1F2944',
  skin: '#C98B62',
  skinDark: '#A86E4B',
  hair: '#1D1714',
  grey: '#A9ADB3',
  shoe: '#2A1D18',
  pen: '#2F6BFF',
  line: '#1A1220',
  glass: '#1A1220',
};

function ell(ctx: Ctx, x: number, y: number, rx: number, ry: number, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}

/** a limb: a thick rounded line */
function limb(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

export function drawDad(ctx: Ctx, p: DadPose) {
  ctx.save();
  ctx.translate(p.x, p.y);
  const ghost = p.ghost;
  if (ghost) ctx.globalAlpha *= ghost.alpha;
  // squash and stretch about the feet (and drawn to fit his 10x14 box: what you see is what gets hit)
  const sq = Math.max(-0.3, Math.min(0.35, p.squash));
  ctx.scale(0.86 * (1 + sq * 0.7) * p.facing, 0.86 * (1 - sq));
  // lean into the run; teeter at an edge
  let lean = p.moving && !p.air ? 0.1 : 0;
  if (p.air) lean = Math.max(-0.12, Math.min(0.12, p.vy / 2400));
  const teeter = p.edge && !p.moving && !p.air ? Math.sin(p.t * 11) : 0;
  if (teeter) lean += teeter * 0.07;
  ctx.rotate(lean);

  const C = ghost
    ? Object.fromEntries(Object.keys(DAD).map((k) => [k, ghost.tint])) as typeof DAD
    : DAD;
  const ph = p.run * 0.32;
  const stride = p.moving && !p.air ? Math.sin(ph) : 0;
  const bob = p.moving && !p.air ? Math.abs(Math.cos(ph)) * 0.55 : 0;
  const breathe = !p.moving && !p.air ? Math.sin(p.t * 2.6) * 0.18 : 0;
  ctx.translate(0, -bob);

  // ---- the outline pass: everything drawn fat in the line colour first
  const parts = (outline: boolean) => {
    const o = outline ? 1.1 : 0;
    const col = (c: string) => (outline ? C.line : c);
    // legs
    const legY = -5.6;
    let lA: [number, number], lB: [number, number];
    if (p.air) {
      lA = p.vy < 0 ? [1.8, -1.8] : [1.4, -0.4];
      lB = p.vy < 0 ? [-1.6, -0.9] : [-1.4, -0.1];
    } else {
      lA = [stride * 2.6, -0.2 - Math.max(0, -stride) * 0.9];
      lB = [-stride * 2.6, -0.2 - Math.max(0, stride) * 0.9];
    }
    limb(ctx, -1.2, legY, lB[0] - 0.6, lB[1] - 0.9, 2.7 + o, col(C.pantsDark));
    limb(ctx, 1.0, legY, lA[0] + 0.4, lA[1] - 0.9, 2.7 + o, col(C.pants));
    // shoes
    ctx.fillStyle = col(C.shoe);
    ell(ctx, lB[0] - 0.1, lB[1] - 0.55, 1.9 + o * 0.5, 0.95 + o * 0.5);
    ctx.fill();
    ell(ctx, lA[0] + 0.9, lA[1] - 0.55, 1.9 + o * 0.5, 0.95 + o * 0.5);
    ctx.fill();
    // back arm
    const sw = p.air ? (p.vy < 0 ? -1 : 1) : stride;
    const watch = !p.moving && !p.air && p.idle > 1.4 && (p.idle % 4) < 2.2;
    const flail = (p.air && p.vy > 260) || teeter !== 0;
    const backHand: [number, number] = flail ? [-3.6, -13.6 + Math.sin(p.t * 20) * 1.2] : [-1.6 - sw * 1.6, -6.6];
    limb(ctx, -1.6, -10.2, backHand[0], backHand[1], 2.3 + o, col(C.shirtDark));
    ctx.fillStyle = col(C.skinDark);
    ell(ctx, backHand[0], backHand[1] + (flail ? -0.4 : 0.4), 1.05 + o * 0.5, 1.05 + o * 0.5);
    ctx.fill();
    // torso: a shirt with a dad's belly
    ctx.fillStyle = col(C.shirt);
    ctx.beginPath();
    ctx.moveTo(-3.3 - o, -11.0 - o + breathe);
    ctx.quadraticCurveTo(0, -12.0 - o + breathe, 3.2 + o, -10.9 - o + breathe);
    ctx.quadraticCurveTo(4.9 + o, -7.6, 3.5 + o, -5.0 + o);
    ctx.lineTo(-3.4 - o, -5.0 + o);
    ctx.quadraticCurveTo(-4.1 - o, -8.0, -3.3 - o, -11.0 - o + breathe);
    ctx.fill();
    if (!outline) {
      // shade, belt, pocket and pen
      ctx.fillStyle = C.shirtDark;
      ctx.beginPath();
      ctx.moveTo(-3.4, -5.0);
      ctx.lineTo(3.5, -5.0);
      ctx.quadraticCurveTo(4.6, -6.2, 4.4, -7.2);
      ctx.quadraticCurveTo(1, -6.0, -3.6, -7.0);
      ctx.fill();
      ctx.fillStyle = C.pantsDark;
      ctx.fillRect(-3.4, -5.6, 6.9, 0.9);
      ctx.fillStyle = C.shirtLight;
      ctx.fillRect(0.8, -9.6, 2.0, 0.45);
      ctx.fillStyle = C.pen;
      ctx.fillRect(1.9, -10.5, 0.55, 1.4);
      // collar
      ctx.fillStyle = C.shirtLight;
      ctx.beginPath();
      ctx.moveTo(-0.6, -11.3 + breathe);
      ctx.lineTo(1.6, -11.5 + breathe);
      ctx.lineTo(0.7, -10.2 + breathe);
      ctx.fill();
    }
    // front arm
    const frontHand: [number, number] = watch ? [2.6, -9.4] : flail ? [3.4, -14.2 + Math.cos(p.t * 20) * 1.2] : [1.4 + sw * 1.8, -6.5];
    limb(ctx, 0.9, -10.3, frontHand[0], frontHand[1], 2.4 + o, col(C.shirt));
    ctx.fillStyle = col(C.skin);
    ell(ctx, frontHand[0], frontHand[1] + (flail ? -0.4 : 0.4), 1.1 + o * 0.5, 1.1 + o * 0.5);
    ctx.fill();
    if (watch && !outline) {
      ctx.fillStyle = '#E8E4DA';
      ctx.fillRect(frontHand[0] - 1.1, frontHand[1] - 0.2, 1.4, 0.9);
    }
    // head
    const hx = 0.5,
      hy = -13.3 + breathe;
    ctx.fillStyle = col(C.skin);
    ell(ctx, hx, hy, 3.25 + o, 3.35 + o);
    ctx.fill();
    // hair: a black cap with a side part, greying at the temple
    ctx.fillStyle = col(C.hair);
    ctx.beginPath();
    ctx.moveTo(hx - 3.5 - o, hy + 0.6);
    ctx.quadraticCurveTo(hx - 3.9 - o, hy - 3.9 - o, hx + 0.2, hy - 4.0 - o);
    ctx.quadraticCurveTo(hx + 3.6 + o, hy - 4.1 - o, hx + 3.7 + o, hy - 1.3);
    ctx.quadraticCurveTo(hx + 1.6, hy - 2.7, hx - 0.6, hy - 2.2);
    ctx.quadraticCurveTo(hx - 1.6, hy - 1.0, hx - 2.4, hy + 0.9);
    ctx.closePath();
    ctx.fill();
    if (!outline) {
      ctx.fillStyle = C.grey;
      ctx.beginPath();
      ctx.moveTo(hx - 2.9, hy + 0.2);
      ctx.quadraticCurveTo(hx - 3.3, hy - 1.4, hx - 2.6, hy - 2.0);
      ctx.lineTo(hx - 2.2, hy - 0.6);
      ctx.fill();
      // ear
      ctx.fillStyle = C.skinDark;
      ell(ctx, hx - 1.6, hy + 0.3, 0.75, 1.05);
      ctx.fill();
    }
  };
  parts(true);
  parts(false);

  // ---- the face (on the side he faces)
  const hx = 0.5,
    hy = -13.3 + breathe;
  const shocked = p.air && p.vy > 300;
  const blink = !shocked && p.t % 3.7 < 0.11;
  // eyes behind the glasses
  ctx.fillStyle = C.line;
  const ey = hy - 0.15;
  if (shocked) {
    ctx.fillStyle = '#FFFFFF';
    ell(ctx, hx + 1.5, ey, 0.75, 0.85);
    ctx.fill();
    ell(ctx, hx + 3.2, ey, 0.65, 0.8);
    ctx.fill();
    ctx.fillStyle = C.line;
    ell(ctx, hx + 1.6, ey, 0.32, 0.36);
    ctx.fill();
    ell(ctx, hx + 3.25, ey, 0.3, 0.34);
    ctx.fill();
  } else if (blink) {
    ctx.fillRect(hx + 1.0, ey, 1.0, 0.3);
    ctx.fillRect(hx + 2.8, ey, 0.8, 0.3);
  } else {
    ell(ctx, hx + 1.55, ey, 0.38, 0.45);
    ctx.fill();
    ell(ctx, hx + 3.2, ey, 0.34, 0.42);
    ctx.fill();
  }
  // eyebrows: up when worried
  const bro = p.worried || teeter || shocked ? -0.8 : 0;
  ctx.strokeStyle = C.hair;
  ctx.lineWidth = 0.55;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(hx + 0.8, ey - 1.5 + bro);
  ctx.lineTo(hx + 2.1, ey - 1.7 + bro * 1.2);
  ctx.moveTo(hx + 2.7, ey - 1.6 + bro * 1.2);
  ctx.lineTo(hx + 3.7, ey - 1.4 + bro);
  ctx.stroke();
  // round glasses
  ctx.strokeStyle = C.glass;
  ctx.lineWidth = 0.42;
  ctx.fillStyle = 'rgba(210,235,255,0.28)';
  ell(ctx, hx + 1.5, ey, 1.12, 1.05);
  ctx.fill();
  ctx.stroke();
  ell(ctx, hx + 3.35, ey, 0.92, 1.0);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hx + 2.6, ey - 0.15);
  ctx.lineTo(hx + 2.45, ey - 0.15);
  ctx.moveTo(hx + 0.38, ey - 0.2);
  ctx.lineTo(hx - 1.2, ey - 0.4);
  ctx.stroke();
  if (!ghost) {
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(hx + 0.95, ey - 0.75, 0.45, 0.3);
  }
  // nose
  ctx.fillStyle = C.skinDark;
  ell(ctx, hx + 3.75, hy + 1.05, 0.7, 0.6);
  ctx.fill();
  // the moustache
  ctx.fillStyle = C.hair;
  ctx.beginPath();
  ctx.moveTo(hx + 1.0, hy + 2.05);
  ctx.quadraticCurveTo(hx + 2.6, hy + 1.2, hx + 4.0, hy + 1.75);
  ctx.quadraticCurveTo(hx + 4.2, hy + 2.6, hx + 3.3, hy + 2.55);
  ctx.quadraticCurveTo(hx + 2.4, hy + 2.3, hx + 1.0, hy + 2.05);
  ctx.fill();
  if (shocked) {
    ctx.fillStyle = '#5A1E1E';
    ell(ctx, hx + 2.7, hy + 3.05, 0.6, 0.55);
    ctx.fill();
  }
  ctx.restore();
}

/** his glasses alone (they fly off when he pops) */
export function drawGlasses(ctx: Ctx, x: number, y: number, rot: number, alpha = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = DAD.glass;
  ctx.lineWidth = 0.5;
  ctx.fillStyle = 'rgba(210,235,255,0.45)';
  ell(ctx, -1.05, 0, 1.12, 1.05);
  ctx.fill();
  ctx.stroke();
  ell(ctx, 1.05, 0, 1.0, 1.0);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-0.0, -0.1);
  ctx.lineTo(0.05, -0.1);
  ctx.stroke();
  ctx.restore();
}
