import { LEVEL_BY_ID } from '../game/levels';
import { World } from '../game/world';
import { Renderer } from '../render/renderer';
import { THEMES } from '../render/theme';
import { FONT, rr } from '../render/art/common';
import { GAME } from '../config';

export interface CardInfo {
  kind: 'stage' | 'city';
  code: string; // the stage to challenge with
  headline: string; // "Escaped Bengaluru"
  deaths: number;
  time: number | null;
  character: 'papa' | 'mummy';
  /** it was the player's home city: a small line above the headline */
  home?: boolean;
}

/** A 1080x1080 share card: the room (initial state, so no spoilers), the result and the challenge code. */
export function makeCard(info: CardInfo): HTMLCanvasElement {
  const def = LEVEL_BY_ID.get(info.code)!;
  const th = THEMES[def.city];
  const S = 1080;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#1C1830');
  g.addColorStop(1, '#2C2350');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);

  // room thumbnail (built fresh, so it shows the stage before any trap fires)
  const w = new World(def, { attempt: 1, deaths: 0, justDied: false, rival: 'tara', character: info.character });
  def.build?.(w);
  const thumb = Renderer.thumbnail(w, 960, 540, info.character);
  ctx.save();
  rr(ctx, 60, 60, 960, 540, 36);
  ctx.clip();
  ctx.drawImage(thumb, 60, 60);
  const shade = ctx.createLinearGradient(0, 420, 0, 600);
  shade.addColorStop(0, 'rgba(0,0,0,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = shade;
  ctx.fillRect(60, 420, 960, 180);
  ctx.restore();
  ctx.lineWidth = 6;
  ctx.strokeStyle = th.ui;
  rr(ctx, 60, 60, 960, 540, 36);
  ctx.stroke();
  ctx.font = `800 40px ${FONT}`;
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(`${def.id}  ·  ${def.name}`, 100, 572);

  // headline
  ctx.textAlign = 'center';
  if (info.home) {
    ctx.font = `800 40px ${FONT}`;
    ctx.fillStyle = '#FFD166';
    ctx.fillText('MY HOME CITY', S / 2, 652);
  }
  ctx.font = `800 92px ${FONT}`;
  ctx.fillStyle = th.ui;
  ctx.fillText(info.headline.toUpperCase(), S / 2, 720);

  // stats
  ctx.font = `700 54px ${FONT}`;
  ctx.fillStyle = '#F4EFFF';
  const deathsTxt = `${info.deaths} ${info.deaths === 1 ? 'death' : 'deaths'}`;
  const timeTxt = info.time !== null ? `${info.time.toFixed(1)}s best clear` : '';
  ctx.fillText(timeTxt ? `${deathsTxt}   ·   ${timeTxt}` : deathsTxt, S / 2, 805);

  // ticket stub with the challenge code
  const tx = 230,
    ty = 860,
    tw = 620,
    tH = 150;
  ctx.fillStyle = '#F7E7C1';
  rr(ctx, tx, ty, tw, tH, 22);
  ctx.fill();
  ctx.fillStyle = '#2B2250';
  for (const nx of [tx, tx + tw]) {
    ctx.beginPath();
    ctx.arc(nx, ty + tH / 2, 22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.setLineDash([10, 10]);
  ctx.strokeStyle = '#B9935A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tx + 190, ty + 18);
  ctx.lineTo(tx + 190, ty + tH - 18);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#7A5A2E';
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText('YOUR', tx + 95, ty + 64);
  ctx.fillText('TURN', tx + 95, ty + 104);
  ctx.fillStyle = '#2C2350';
  ctx.font = `800 74px ${FONT}`;
  ctx.fillText(`Try ${info.code}`, tx + 400, ty + 101);

  ctx.font = `700 30px ${FONT}`;
  ctx.fillStyle = 'rgba(244,239,255,0.7)';
  ctx.fillText(`${GAME.title} — enter the code under Challenge`, S / 2, 1052);
  return c;
}
