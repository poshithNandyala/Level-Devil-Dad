// LKO-03 Chhapa (the block print). Chikankari starts as blue lines block-printed on muslin; the stitching
// follows the print; then the piece is washed and every trace of the print goes. Only the stitches stay.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { tara as taraNow } from '../../levels/endkit';
import { Art, Block, FLOOR, Zone, gent, on, px, type Ctx } from './kit';
import { tara } from './s02';

export type Weave = 'p' | 's' | 'j';
/** one tile of muslin: printed (blue line), stitched (white, solid work) or jali (white open-work) */
export class Cloth extends Block {
  constructor(
    x: number,
    readonly kind: Weave,
    readonly y0 = FLOOR,
  ) {
    super(x, y0, 16, 6, (ctx, b, w) => drawCloth(ctx, b as Cloth, w), 2);
  }
  wet = 0;
}
function drawCloth(ctx: Ctx, c: Cloth, w: World) {
  if (!c.on) {
    // a ripple where the print was
    if (c.wet > 0 && w.tick - c.wet < 40) {
      ctx.fillStyle = `rgba(120,170,220,${0.5 - (w.tick - c.wet) / 80})`;
      ctx.fillRect(c.x, c.y + 2, 16, 3);
    }
    return;
  }
  const { x, y } = c;
  ctx.fillStyle = '#F5F1E8';
  ctx.fillRect(x, y, 16, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(x, y + 5, 16, 1);
  if (c.kind === 'p') {
    // the blue chhapa: a printed vine, nothing else
    ctx.strokeStyle = '#3F6FB5';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.quadraticCurveTo(x + 4, y + 0.5, x + 8, y + 3);
    ctx.quadraticCurveTo(x + 12, y + 5.5, x + 16, y + 3);
    ctx.stroke();
    ctx.fillStyle = 'rgba(63,111,181,0.55)';
    ctx.fillRect(x + 7, y + 1, 2, 1);
    ctx.fillStyle = 'rgba(220,228,240,0.9)';
    ctx.fillRect(x, y, 16, 6);
    ctx.strokeStyle = '#3F6FB5';
    ctx.beginPath();
    ctx.moveTo(x, y + 3);
    ctx.quadraticCurveTo(x + 4, y + 0.5, x + 8, y + 3);
    ctx.quadraticCurveTo(x + 12, y + 5.5, x + 16, y + 3);
    ctx.stroke();
  } else if (c.kind === 's') {
    // thick white satin stitches: a flower, worked solid
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 1, y, 14, 6);
    ctx.fillStyle = '#D8D0C0';
    for (let k = 0; k < 7; k++) ctx.fillRect(x + 2 + k * 2, y + 1, 1, 4);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x + 8, y + 3, 2.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // jali: threads pulled apart, a net of little holes (white, but open)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x + 1, y, 14, 6);
    ctx.fillStyle = '#9DB7CF';
    for (let k = 0; k < 4; k++) for (let r = 0; r < 2; r++) ctx.fillRect(x + 2.5 + k * 3.3, y + 1.2 + r * 2.4, 1.6, 1.4);
  }
}

/** the wash: a dhobi at the vat's end, a whistle, and a pale-blue wave that takes what it should */
export class Dhobi {
  washes = 0;
  constructor(
    readonly cloth: Cloth[],
    readonly vat: Zone,
    readonly x: number,
    readonly key: string,
  ) {}
  wash(w: World, kinds: Weave[], cause: string) {
    this.washes++;
    w.sfx('whistle', this.x, FLOOR - 30);
    w.sfx('splash', this.x, FLOOR);
    this.vat.hazard.cause = cause;
    for (const c of this.cloth)
      if (c.on && kinds.includes(c.kind)) {
        c.set(false);
        c.wet = w.tick;
      }
    w.flags[this.key] = this.washes;
  }
}

/** a vat of blue rinse water from column c0 to c1 with a cloth laid over it (pattern: one letter a tile) */
export function washLine(w: World, c0: number, pattern: string, key: string, o: { dhobiAt?: number; face?: 1 | -1 } = {}) {
  const c1 = c0 + pattern.length - 1;
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx, w2) => {
      const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 48);
      g.addColorStop(0, '#6E97C9');
      g.addColorStop(1, '#22406E');
      ctx.fillStyle = g;
      ctx.fillRect(x0, FLOOR + 6, x1 - x0, 42);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let x = x0 + ((w2.tick * 0.25) % 10); x < x1 - 3; x += 10) ctx.fillRect(x, FLOOR + 7, 4, 1);
      // the stone kerb of the ghat
      ctx.fillStyle = '#BFAF95';
      ctx.fillRect(x0 - 3, FLOOR - 1, 3, 30);
      ctx.fillRect(x1, FLOOR - 1, 3, 30);
    }, -4),
  );
  const vat = w.add(new Zone(x0 + 1, FLOOR + 10, x1 - x0 - 2, 40, 'lko-chhapa'));
  const cloth = [...pattern].map((k, i) => w.add(new Cloth(px(c0 + i), k as Weave)));
  const dx = px(o.dhobiAt ?? c1 + 2) + 8;
  const dh = new Dhobi(cloth, vat, dx, key);
  const face = o.face ?? -1;
  w.add(
    new Art((ctx, w2) => {
      const blow = w2.flags[key + ':blow'] && w2.tick - w2.flags[key + ':blow'] < 50;
      gent(ctx, dx, FLOOR, 24, '#D9D2C2', { face, arms: blow ? 1 : 0, skin: '#9C6B48' });
      if (blow) {
        ctx.fillStyle = '#C0392B';
        ctx.fillRect(dx + face * 5, FLOOR - 21, 3, 2);
      }
    }, 3),
  );
  return { cloth, vat, dh, x0, x1 };
}

// ================================================================ the room
function chhapaRoom(): LevelDef {
  return {
    id: 'LKO-03',
    city: 'LKO',
    index: 3,
    name: 'Chhapa',
    nameEn: 'The block print',
    tagline: 'In a Chowk workshop the muslin is printed in blue, stitched in white, and then washed. The washerman is very good at his job.',
    hint: 'The blue printed lines wash off at the first whistle, the moment you’re on the cloth, and whatever stood on them goes in the vat. The white work stays, but the open white jali, the little net of holes, goes at the second whistle. Stand only on the solid white flowers, and hop over the jali.',
    par: 14,
    map: Grid.ground(15).pit(6, 25).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      // s = solid stitched flower, j = jali, p = print: the solid flowers are three apart, some gaps start with a jali
      const L = washLine(w, 6, 'sjpsppsjpspjsppsjpsp', 'chhapa', { dhobiAt: 27 });
      let start = -1;
      w.onTick((w2) => {
        if (start < 0 && L.cloth.some((c) => on(w2, c.solid))) start = w2.tick;
        if (start < 0) return;
        const t = w2.tick - start;
        if (t === 40) w2.flags['chhapa:blow'] = w2.tick;
        if (t === 66) L.dh.wash(w2, ['p'], 'lko-chhapa');
        if (t === 200) w2.flags['chhapa:blow'] = w2.tick;
        if (t === 220) L.dh.wash(w2, ['j'], 'lko-jali');
      });
      sign(w, 2.2, 10.4, 3.4, 'CHOWK', 'shop', null, 'chikan');
      rival(w, 3, 15, 1, tara(1));
      onPass(w, px(4), (w2) => w2.guide('Bas zara sa! | Just a little!', (w3) => w3.player.cx < px(6)));
      collectible(w, 'lko-chikan', 17.5, 11.2);
    },
  };
}

// ================================================================ the act: the rinsing line
/** Three more cloths, each with its own dhobi. On these the print is the only way across, and each dhobi
 *  whistles a beat after you step on his print: cross it without stopping. */
const kunda: Act = {
  id: 'lko03-kunda',
  w: 40,
  advice: 'Three more vats, and here the print is the only way across: each washer whistles a moment after you step on his print. Run each one without stopping, on to the white flower at the far end. The jali in the middle of the second goes with the print: don’t stop on it.',
  cps: [12.5, 25.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 9).pit(c.x + 15, c.x + 22).pit(c.x + 28, c.x + 35);
  },
  build: (w, c) => {
    const x = c.x;
    const lines = [
      washLine(w, x + 3, 'pppppps', c.f('v1'), { dhobiAt: x + 11, face: -1 }),
      washLine(w, x + 15, 'pppjppps', c.f('v2'), { dhobiAt: x + 24, face: -1 }),
      washLine(w, x + 28, 'ppppppps', c.f('v3'), { dhobiAt: x + 37, face: -1 }),
    ];
    lines.forEach((L, i) => {
      let start = -1;
      const key = c.f('v' + (i + 1));
      w.onTick((w2) => {
        if (start < 0 && L.cloth.some((cl) => cl.kind === 'p' && on(w2, cl.solid))) start = w2.tick;
        if (start < 0 || L.dh.washes) return;
        const t = w2.tick - start;
        if (t === 80) w2.flags[key + ':blow'] = w2.tick;
        // the middle one's jali goes with its print: it only looks like a flower to stop on
        if (t === 110) L.dh.wash(w2, i === 1 ? ['p', 'j'] : ['p'], i === 1 ? 'lko-jali' : 'lko-chhapa');
      });
    });
    sign(w, x + 0.4, 10.4, 3.4, 'DHOBI GHAT', 'shop', null, 'gomti');
  },
};

// ================================================================ the door: bakhiya, the shadow work
/** Bakhiya is stitched on the back of the muslin and shows on the front only as a shadow. The bright blue
 *  door ahead is print, on cloth over a vat; the real door stands on the dhobi's slab behind a hanging
 *  muslin, and all you see of it is its shadow. */
export const bakhiya: Ending = {
  space: 12,
  advice: 'The bright blue door is printed on the cloth, and the cloth is over a vat: it washes away at the whistle. The real door is the faint shadow on the hanging muslin, up on the drying rack’s ledge. Hop up into the shadow.',
  paint: (g, D) => {
    g.put(D, 14, '.');
    g.fill(D - 6, D - 3, 13, 13, '=');
    g.put(D - 4, 12, 'E');
    g.pit(D - 1, D + 1);
  },
  build(w, d) {
    const D = Math.round(d.x / 16) + 4;
    w.flags.twist = 'print';
    const L = washLine(w, D - 1, 'ppp', 'bakhiya', { dhobiAt: D + 3 });
    let fired = false;
    w.onTick((w2) => {
      if (!fired && w2.player.cx > px(D - 3.5) && w2.player.y + w2.player.h >= FLOOR - 1) {
        fired = true;
        w2.flags['bakhiya:blow'] = w2.tick;
        w2.after(0.3, () => {
          L.dh.wash(w2, ['p'], 'lko-chhapa');
          w2.flags.twist = 'washed';
        });
      }
    });
    w.add(
      new Art((ctx, w2) => {
        // the printed door on a cloth panel hung over the vat
        if (w2.flags.twist === 'washed') return;
        const x = px(D) + 8;
        ctx.fillStyle = 'rgba(245,241,232,0.95)';
        ctx.fillRect(x - 16, FLOOR - 44, 32, 44);
        ctx.strokeStyle = '#3F6FB5';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 8, FLOOR - 34, 16, 32);
        ctx.beginPath();
        ctx.arc(x, FLOOR - 34, 8, Math.PI, 0);
        ctx.stroke();
        ctx.fillStyle = '#3F6FB5';
        ctx.fillRect(x + 4, FLOOR - 18, 2, 2);
      }, 1),
    );
    w.add(
      new Art((ctx) => {
        // the muslin hung in front of the real door: you see it only as a shadow
        const x = d.x + 8;
        ctx.fillStyle = '#6D5A48';
        ctx.fillRect(x - 22, px(13) - 62, 2, 62);
        ctx.fillRect(x + 20, px(13) - 62, 2, 62);
        ctx.fillStyle = 'rgba(247,244,236,0.86)';
        ctx.fillRect(x - 20, px(13) - 58, 40, 56);
        ctx.fillStyle = 'rgba(120,110,95,0.18)';
        for (let k = 0; k < 5; k++) ctx.fillRect(x - 18 + k * 8, px(13) - 58, 1, 56);
      }, 4),
    );
    w.when(
      (w2) => w2.player.cx > px(D - 10),
      (w2) => taraNow(w2, 'Tashreef laaiye, Dad! | Please do come, Dad!', 2.4),
    );
  },
};

export const s03 = { room: chhapaRoom, acts: [kunda] };
export const meta03 = { family: 'print-washed-stitch-remains', betrayals: ['wash-remains'], ending: 'door-seen-only-as-shadow-through-muslin' } as StageMeta;
