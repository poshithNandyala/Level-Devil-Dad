// The play layer: ground, slabs and spikes, in one clean style per door.
// A slab at rest is drawn exactly like the ground around it (that's the troll);
// once it moves it shows its own edges.
import { TILE } from '../../game/constants';
import type { Ctx } from './dad';

export interface GroundStyle {
  /** the walkable top surface */
  top: string;
  topHi: string;
  /** a painted line along the top (a platform's yellow edge, a kerb), and its y offset */
  band?: string;
  bandY?: number;
  /** the face: colour at the floor line and colour deep down */
  face: [string, string];
  /** how deep (px below the floor line) the face reaches its dark colour */
  faceDepth: number;
  edge: string;
  seam: string;
  /** px of top surface */
  capH: number;
  /** a darker band under the top surface (a platform's coping, a kerb's face) */
  lip?: string;
  lipH?: number;
  /** faint joints on the face: a block pattern (block width, block height) */
  joints?: { color: string; w: number; h: number };
  /** spikes */
  spike: [string, string];
  spikeEdge: string;
}

export interface Nb {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

/** a vertical gradient in world space for the faces (cache one per style and floor line) */
export function faceGradient(ctx: Ctx, st: GroundStyle, floorY: number): CanvasGradient {
  const g = ctx.createLinearGradient(0, floorY, 0, floorY + st.faceDepth);
  g.addColorStop(0, st.face[0]);
  g.addColorStop(1, st.face[1]);
  return g;
}

/** one solid tile with its exposed edges */
export function drawGroundTile(ctx: Ctx, st: GroundStyle, x: number, y: number, nb: Nb, face: CanvasGradient | string) {
  const r = 2.2;
  const tl = !nb.up && !nb.left,
    tr = !nb.up && !nb.right,
    bl = !nb.down && !nb.left,
    br = !nb.down && !nb.right;
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.moveTo(x + (tl ? r : 0), y);
  ctx.lineTo(x + TILE - (tr ? r : 0), y);
  if (tr) ctx.quadraticCurveTo(x + TILE, y, x + TILE, y + r);
  ctx.lineTo(x + TILE, y + TILE - (br ? r : 0));
  if (br) ctx.quadraticCurveTo(x + TILE, y + TILE, x + TILE - r, y + TILE);
  ctx.lineTo(x + (bl ? r : 0), y + TILE);
  if (bl) ctx.quadraticCurveTo(x, y + TILE, x, y + TILE - r);
  ctx.lineTo(x, y + (tl ? r : 0));
  if (tl) ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  // overdraw by a hair where tiles meet so no seam of background shows through
  ctx.fill();
  if (nb.right) ctx.fillRect(x + TILE - 0.5, y, 1, TILE);
  if (nb.down) ctx.fillRect(x, y + TILE - 0.5, TILE, 1);
  if (!nb.up) {
    // the top surface
    ctx.fillStyle = st.top;
    ctx.beginPath();
    ctx.moveTo(x + (tl ? r : 0), y);
    ctx.lineTo(x + TILE - (tr ? r : 0), y);
    if (tr) ctx.quadraticCurveTo(x + TILE, y, x + TILE, y + r);
    ctx.lineTo(x + TILE, y + st.capH);
    ctx.lineTo(x, y + st.capH);
    ctx.lineTo(x, y + (tl ? r : 0));
    if (tl) ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.fill();
    ctx.fillStyle = st.topHi;
    ctx.fillRect(x + (tl ? r : 0), y, TILE - (tl ? r : 0) - (tr ? r : 0), 0.9);
    if (st.band) {
      ctx.fillStyle = st.band;
      ctx.fillRect(x, y + (st.bandY ?? st.capH - 1.6), TILE, 1.6);
    }
    // a seam at every tile, so a trapped slab looks like every other
    ctx.fillStyle = st.seam;
    ctx.fillRect(x + TILE - 0.5, y + 1, 0.5, st.capH - 1);
    if (st.lip) {
      ctx.fillStyle = st.lip;
      ctx.fillRect(x, y + st.capH, TILE, st.lipH ?? 3);
    }
    // a soft shadow under the lip
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    ctx.fillRect(x, y + st.capH + (st.lip ? st.lipH ?? 3 : 0), TILE, 1.2);
  }
  if (st.joints) {
    // block joints in world space, so slabs line up with the ground around them
    const j = st.joints;
    ctx.fillStyle = j.color;
    const top = !nb.up ? st.capH + (st.lip ? st.lipH ?? 3 : 0) + 1.5 : 0;
    for (let yy = Math.ceil((y + top) / j.h) * j.h; yy < y + TILE; yy += j.h) {
      ctx.fillRect(x, yy, TILE, 0.6);
      const row = Math.round(yy / j.h);
      for (let xx = Math.ceil((x - (row % 2) * (j.w / 2)) / j.w) * j.w + (row % 2) * (j.w / 2); xx < x + TILE; xx += j.w) {
        if (xx >= x) ctx.fillRect(xx, yy, 0.6, Math.min(j.h, y + TILE - yy));
      }
    }
  }
  ctx.fillStyle = st.edge;
  if (!nb.left) ctx.fillRect(x, y + (tl ? r : 0), 0.9, TILE - (tl ? r : 0) - (bl ? r : 0));
  if (!nb.right) ctx.fillRect(x + TILE - 0.9, y + (tr ? r : 0), 0.9, TILE - (tr ? r : 0) - (br ? r : 0));
  if (!nb.down) ctx.fillRect(x + (bl ? r : 0), y + TILE - 0.9, TILE - (bl ? r : 0) - (br ? r : 0), 0.9);
}

/** a spike tile: two steel teeth pointing `dir` */
export function drawSpikes(ctx: Ctx, st: GroundStyle, x: number, y: number, dir: 'up' | 'down' | 'left' | 'right', k = 1) {
  ctx.save();
  ctx.translate(x + 8, y + 8);
  ctx.rotate(dir === 'up' ? 0 : dir === 'right' ? Math.PI / 2 : dir === 'down' ? Math.PI : -Math.PI / 2);
  // teeth grow from the base (y = +8) by k
  ctx.translate(0, 8);
  ctx.scale(1, k);
  ctx.translate(0, -8);
  for (const cx of [-4, 4]) {
    const g = ctx.createLinearGradient(cx - 4, 0, cx + 4, 0);
    g.addColorStop(0, st.spike[0]);
    g.addColorStop(0.55, st.spike[0]);
    g.addColorStop(0.56, st.spike[1]);
    g.addColorStop(1, st.spike[1]);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(cx - 3.8, 8);
    ctx.lineTo(cx, -3.2);
    ctx.lineTo(cx + 3.8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = st.spikeEdge;
    ctx.lineWidth = 0.8;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  ctx.fillStyle = st.spikeEdge;
  ctx.fillRect(-8, 7.2, 16, 0.9);
  ctx.restore();
}
