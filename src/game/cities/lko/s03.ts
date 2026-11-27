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
export const kunda: Act = {
  id: 'lko03-kunda',
  cp0: false,
  w: 40,
  advice: 'Three more vats, and here the print is the only way across: each washer whistles a moment after you step on his print. Run each one without stopping, on to the white flower at the far end. The jali in the middle of the second goes with the print: don’t stop on it.',
  cps: [-2, 10.3, 23.3],
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

// ================================================================ the door: balti, the dhobi's bucket
/** The door is real, and right there. Its threshold is cloth over the rinse vat, print and stitched flowers,
 *  and this dhobi whistles the moment you touch it: the print goes at once. The room taught you to wait on
 *  the white for both washes; here the second thing that comes is his bucket, thrown across the whole cloth. */
export const balti: Ending = {
  space: 12,
  advice: 'The door is real; its threshold is cloth over the rinse vat. The print goes the moment you step on it, so hop on to the white flowers. But don’t wait on them for a second wash: this dhobi’s second move is his bucket of rinse water, across the whole cloth. Flower, flower, door, at once.',
  paint: (g, D) => {
    g.pit(D - 6, D - 1);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    w.flags.twist = 'cloth';
    const L = washLine(w, D - 6, 'ppspps', 'balti', { dhobiAt: D + 2 });
    const S = { t0: -1, wave: -1 };
    w.flags.balti = S;
    w.onTick((w2) => {
      const p = w2.player;
      if (S.t0 < 0 && L.cloth.some((cl) => on(w2, cl.solid))) S.t0 = w2.tick;
      if (S.t0 < 0) return;
      const t = w2.tick - S.t0;
      if (t === 8) w2.flags['balti:blow'] = w2.tick;
      if (t === 12) {
        L.dh.wash(w2, ['p'], 'lko-chhapa');
        w2.flags.twist = 'washed';
      }
      if (t === 150) {
        // the bucket: a sheet of rinse water across the whole cloth
        S.wave = w2.tick;
        w2.sfx('splash', px(D - 3), FLOOR);
        if (p.x + p.w > px(D - 6) && p.x < px(D) && p.y + p.h >= FLOOR - 2) w2.die('lko-balti');
        L.dh.wash(w2, ['s'], 'lko-balti');
        w2.flags.twist = 'bucket';
      }
      // a fresh cloth laid back over the vat, and the whole thing again
      if (t === 330) {
        for (const cl of L.cloth) cl.set(true);
        S.t0 = -1;
        w2.flags.twist = 'cloth';
      }
    });
    w.add(
      new Art((ctx, w2) => {
        // the dhobi's bucket, raised when he is about to throw, and the sheet of water
        const bx = px(D + 2) - 2;
        const raised = S.t0 >= 0 && w2.tick - S.t0 > 100;
        ctx.fillStyle = '#7E8C96';
        ctx.fillRect(bx - 12, FLOOR - (raised ? 34 : 12), 9, 10);
        if (S.wave >= 0 && w2.tick - S.wave < 30) {
          ctx.fillStyle = `rgba(140,190,230,${0.7 - (w2.tick - S.wave) / 45})`;
          ctx.fillRect(px(D - 6), FLOOR - 14, px(6), 14);
        }
      }, 4),
    );
    w.when(
      (w2) => w2.player.cx > px(D - 10),
      (w2) => taraNow(w2, 'Tashreef laaiye, Dad! | Please do come, Dad!', 2.4),
    );
  },
};

// ================================================================ act 2: the adda, the embroidery frame
/** The karigar's wooden hoop clamps the muslin taut over the rinse vat: inside the hoop it holds you. Each
 *  time he finishes a flower he lifts the hoop and clamps it down on the next one. Ride inside the hoop;
 *  standing on the next flower (the safe white of the room) is standing where the hoop comes down. */
const ADDA = [3, 9, 15, 21, 27];
export const adda: Act = {
  id: 'lko03-adda',
  w: 36,
  advice: 'The karigar’s wooden hoop holds the muslin taut over the rinse vat: stand inside the hoop. Each time he finishes a flower he lifts it and clamps it down on the next one, with you in it. Don’t wait on the next flower ahead: that is where the hoop comes down.',
  cps: [1],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 31);
  },
  build: (w, c) => {
    const x = c.x;
    const vat = w.add(new Zone(c.X(3) + 1, FLOOR + 10, px(29) - 2, 40, 'lko-kunda'));
    let moved = -999;
    w.add(
      new Art((ctx, w2) => {
        const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 48);
        g.addColorStop(0, '#6E97C9');
        g.addColorStop(1, '#22406E');
        ctx.fillStyle = g;
        ctx.fillRect(c.X(3), FLOOR + 6, px(29), 42);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let xx = c.X(3) + ((w2.tick * 0.25) % 10); xx < c.X(32) - 3; xx += 10) ctx.fillRect(xx, FLOOR + 7, 4, 1);
      }, -4),
    );
    // the next flowers: solid white work, the safe place in the room
    ADDA.slice(1).forEach((s) => w.add(new Cloth(c.X(s), 's')));
    const H = { k: 0, t: -1, go: false, moving: 0, dx: 0 };
    w.flags[c.f('hoop')] = H;
    const hoop = w.add(
      new Block(c.X(ADDA[0]), FLOOR, 48, 6, (ctx, b) => {
        // the round wooden hoop seen side on, with the taut muslin across it
        ctx.fillStyle = '#F5F1E8';
        ctx.fillRect(b.x, b.y, 48, 4);
        ctx.strokeStyle = '#8D5A3B';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(b.x + 24, b.y + 2, 25, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }, 2),
    );
    const sx = (k: number) => c.X(ADDA[k]);
    w.onTick((w2) => {
      const p = w2.player;
      if (!H.go && p.onGround && p.isRiding(hoop.solid)) {
        H.go = true;
        H.t = w2.tick;
      }
      if (!H.go || H.k >= ADDA.length - 1) return;
      const age = w2.tick - H.t;
      // knocked off the next flower by the hoop coming over: the hoop's doing, not the vat's
      vat.hazard.cause = w2.tick - moved < 90 && !p.isRiding(hoop.solid) ? 'lko-adda' : 'lko-kunda';
      if (age === 155) {
        H.moving = 1;
        moved = w2.tick;
        w2.sfx('whoosh', hoop.x + 24, FLOOR - 10);
      }
      if (age > 155 && age <= 167) hoop.move(w2, 0, -1.5);
      else if (age > 167 && age <= 185) hoop.move(w2, (sx(H.k + 1) - sx(H.k)) / 18, 0);
      else if (age === 186) {
        // the clamp: whoever is standing where it comes down, and not in it, is caught
        const zx = sx(H.k + 1);
        if (!p.isRiding(hoop.solid) && p.x + p.w > zx && p.x < zx + 48 && p.y + p.h > FLOOR - 20 && p.y + p.h <= FLOOR + 1) w2.die('lko-adda');
      } else if (age > 186 && age <= 191) hoop.move(w2, 0, 18 / 5);
      else if (age > 191) {
        hoop.solid.x = sx(H.k + 1);
        hoop.solid.y = FLOOR;
        H.k++;
        H.t = w2.tick;
        H.moving = 0;
      }
    });
    w.add(new Art((ctx) => gent(ctx, c.X(33) + 8, FLOOR, 24, '#D9D2C2', { face: -1, arms: H.moving, skin: '#9C6B48' }), 3));
    sign(w, x + 0.2, 10.4, 3.2, 'ADDA', 'shop', null, 'chikan');
  },
};

// ================================================================ act 3: rang, the dyer's vat
/** The rangrez's vat of neel. The far half of the muslin is on his rope: every few seconds he dips it, white
 *  stitched flowers and all, into the dye. Stitched work holds, as learned, but not under the dye: wait on
 *  the near half, and cross the far half in one go as soon as it comes up. */
const RANG = { near: [4, 7, 10], far: [13, 16], period: 430, dip: 90 };
export const rang: Act = {
  id: 'lko03-rang',
  w: 24,
  advice: 'The far half of this muslin is on the rangrez’s rope: every few seconds he dips it, stitched flowers and all, into his vat of neel. Stitch holds, but not under the dye. Wait on the near flowers, and cross the far ones in one go the moment they come up.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 18);
  },
  build: (w, c) => {
    const x = c.x;
    const S = { t0: -1, lastRide: -999 };
    const ph = (w2: World) => (S.t0 < 0 ? 0 : (w2.tick - S.t0) % RANG.period);
    w.flags[c.f('ph')] = ph;
    const vat = w.add(new Zone(c.X(3) + 1, FLOOR + 10, px(16) - 2, 40, 'lko-kunda'));
    w.add(
      new Art((ctx, w2) => {
        const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 48);
        g.addColorStop(0, '#3949AB');
        g.addColorStop(1, '#1A237E');
        ctx.fillStyle = g;
        ctx.fillRect(c.X(3), FLOOR + 6, px(16), 42);
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for (let xx = c.X(3) + ((w2.tick * 0.25) % 10); xx < c.X(19) - 3; xx += 10) ctx.fillRect(xx, FLOOR + 7, 4, 1);
        // the rangrez on the far kerb with his rope, and the rope's line over the far half
        const p = ph(w2);
        const pulling = S.t0 >= 0 && p >= RANG.period - RANG.dip - 30;
        gent(ctx, c.X(20) + 8, FLOOR, 24, '#5C6BC0', { face: -1, arms: pulling ? 1 : 0.3, skin: '#9C6B48' });
        ctx.strokeStyle = '#8D6E63';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(c.X(20), FLOOR - 14);
        ctx.lineTo(c.X(12), far[0].y);
        ctx.stroke();
      }, -4),
    );
    RANG.near.forEach((s) => w.add(new Cloth(c.X(s), 's')));
    const far = RANG.far.map((s) => w.add(new Cloth(c.X(s), 's')));
    w.onTick((w2) => {
      const p = w2.player;
      if (S.t0 < 0 && p.cx > c.X(1)) S.t0 = w2.tick;
      const k = ph(w2) - (RANG.period - RANG.dip);
      const want = S.t0 >= 0 && k >= 0 ? FLOOR + Math.sin((Math.PI * k) / RANG.dip) * 34 : FLOOR;
      for (const b of far) {
        if (far.some((f) => on(w2, f.solid))) S.lastRide = w2.tick;
        b.move(w2, 0, want - b.y);
      }
      // carried down on the stitched flowers, or jumped into the dye
      vat.hazard.cause = p.cx < c.X(12) ? 'lko-kunda' : w2.tick - S.lastRide < 60 ? 'lko-rang' : 'lko-rang-kood';
    });
    sign(w, x + 0.2, 10.4, 3, 'RANG', 'shop', null, 'neel');
  },
};

export const s03 = { room: chhapaRoom, acts: [kunda, adda, rang] };
export const meta03 = { family: 'print-washed-stitch-remains', betrayals: ['wash-remains'], ending: 'lko-balti' } as StageMeta;
