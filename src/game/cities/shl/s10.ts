// SHL-10 Down Seven Hundred (finale): the steps down to Nongriat. Every beat is a rule this city taught, broken:
// the lone drop tells the truth; the knup is wrong for the drizzle and the low arch and right for the awning; a
// sister whose mark was painted too high; a guide on your own bank that grows a root through you while the pole from
// the far bank grows the floor; and the rest stalls of the market on a Dawki span, where the keepers move one stall
// along at every arch and it is their walk, not your step, that lurches the deck. Every place here has its own cause
// id and line (law 9): a callback never carries its home stage's line.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, folk, perTick } from './entities';
import { cloudArt, rainArt, cyc, taraScript, FL } from './common';
import { lines as L } from './lines';
import { knupState, hook, lowBar, drips, branchArt } from './s04';
import { root, gorge } from './s06';
import { market, arch, TOP, PITCH_W } from './s09';
import { tower } from './s03';

/** the drop by the pine at column c tells the truth here: rain comes down on cols c..c+4 a third of a second later */
export function honestDrop(w: World, key: string, trigger: number, c: number) {
  const st = { t0: -1, cloudAt: -1, cx: px(c + 2.5), still: 0 };
  w.flags[key] = st;
  const t = (w2: World) => (st.t0 < 0 ? -9 : (w2.tick - st.t0) / 120);
  onPass(w, px(trigger), (w2) => {
    st.t0 = w2.tick;
    w2.sfx('splash', px(c), FL - 10);
    tara(w2, L.taunt[1], 2.2);
  });
  // the rain: a burst a third of a second after the drop, then a cloud forms over the spot and drifts to whoever waits
  w.add(
    new Rig(px(c), 0, px(5), FL, {
      layer: 4,
      cause: 'shl-truedrop',
      inset: 3,
      live: (_r, w2) => {
        const s = t(w2);
        return s >= 0.35 && s < 1.1;
      },
      tick: (r, w2) => {
        const s = t(w2);
        if (s < 1.1) return;
        // the cloud that formed: it drifts to whoever stands near it, as every Shillong cloud does
        const p = w2.player;
        const standing = p.onGround && Math.abs(p.vx) < 5;
        st.still = standing ? st.still + 1 : 0;
        const nearBy = p.cx < r.x + r.w / 2 && p.cx > r.x - px(9);
        if (nearBy && st.still > 60 && r.x + r.w / 2 > p.cx) {
          r.x -= perTick(26);
          st.cx = r.x + r.w / 2;
          if (r.hazard) r.hazard.cause = 'shl-drop-cloud';
        }
        if (r.hazard && r.hazard.cause === 'shl-drop-cloud' && st.still > 60) {
          // it empties on whoever it reaches
          if (p.x + p.w > r.x + 3 && p.x < r.x + r.w - 3) w2.die('shl-drop-cloud');
        }
      },
      paint: (ctx, r, w2) => {
        const s = t(w2);
        const x = px(c) + 8;
        // the pine
        box(ctx, x - 2, FL - 70, 4, 70, '#4A3A2A');
        ctx.fillStyle = '#2F5D45';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x, FL - 96 + i * 12);
          ctx.lineTo(x + 18 + i * 5, FL - 72 + i * 12);
          ctx.lineTo(x - 18 - i * 5, FL - 72 + i * 12);
          ctx.closePath();
          ctx.fill();
        }
        if (s >= 0 && s < 0.35) box(ctx, x + 6, FL - 70 + s * 300, 2, 6, '#BFE0F0');
        if (s >= 0.35 && s < 1.1) rainArt(ctx, r.x + 2, r.x + r.w - 2, 40, w2.tick / 120, 1);
        if (s >= 0.9) cloudArt(ctx, r.x - 8, r.x + r.w + 8, 24, 30, 0.6);
      },
    }),
  );
  return st;
}

/** a sister whose white mark was painted too high: the sheet below it is still full; read the sheet's width */
export function liarFall(w: World, key: string, c0: number, phase: number) {
  // strong 2.0 (kills), fade 0.8 (kills), "mark" 1.0 (the sheet starts at the high mark but is full: kills),
  // thin 1.0 (the sheet is narrow: safe), dry 0.35 (the lure: the fall comes back with no warning)
  const S = { strong: 2.0, fade: 0.8, mark: 1.0, thin: 1.0, dry: 0.35 };
  const P = S.strong + S.fade + S.mark + S.thin + S.dry;
  const at = (w2: World) => {
    let t = cyc(w2, P, phase);
    for (const k of ['strong', 'fade', 'mark', 'thin', 'dry'] as const) {
      if (t < S[k]) return { k, left: S[k] - t, into: t };
      t -= S[k];
    }
    return { k: 'strong' as const, left: S.strong, into: 0 };
  };
  const st = { c0, at };
  w.flags[key] = st;
  w.add(
    new Rig(px(c0), 0, px(3), FL, {
      layer: 4,
      cause: 'shl-liar',
      inset: 3,
      live: (_r, w2) => {
        const k = at(w2).k;
        return k === 'strong' || k === 'fade' || k === 'mark';
      },
      tick: (r, w2) => {
        const ph = at(w2);
        const p = w2.player;
        const inside = p.x + p.w > r.x && p.x < r.x + r.w;
        if (inside && ph.k === 'dry') r.s.wentDry = true;
        if (!inside) r.s.wentDry = false;
        // her two lies, each its own line: the painted mark, and the dry moment that every sister keeps
        if (r.hazard) r.hazard.cause = r.s.wentDry ? 'shl-liar-dry' : 'shl-liar';
      },
      paint: (ctx, r, w2) => {
        const ph = at(w2);
        const full = ph.k === 'strong' ? 1 : ph.k === 'fade' ? 1 - (ph.into / S.fade) * 0.3 : ph.k === 'mark' ? 0.7 : ph.k === 'thin' ? 0.3 : 0;
        box(ctx, r.x - 10, 0, r.w + 20, FL, '#4A5A54');
        box(ctx, r.x - 10, 0, 3, FL, '#3A4842');
        box(ctx, r.x + r.w + 7, 0, 3, FL, '#3A4842');
        // the mark: painted high, fresh white, a paint pot by the foot
        const markY = FL - 150;
        box(ctx, r.x - 9, markY, 8, 2, '#F4F7F2');
        box(ctx, r.x + r.w + 1, markY, 8, 2, '#F4F7F2');
        box(ctx, r.x - 16, FL - 8, 6, 8, '#F4F7F2');
        if (full > 0) {
          const wd = 6 + (r.w - 12) * full;
          const x0 = r.x + (r.w - wd) / 2;
          const top = ph.k === 'mark' || ph.k === 'thin' ? markY : 0;
          ctx.fillStyle = `rgba(225,240,248,${0.55 + 0.4 * full})`;
          ctx.fillRect(x0, top, wd, FL - top);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          for (let y = top + ((w2.tick * 4) % 16); y < FL; y += 16) ctx.fillRect(x0 + 2, y, Math.max(1, wd - 4), 3);
          ctx.beginPath();
          ctx.ellipse(r.x + r.w / 2, FL - 1, wd / 2 + 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else box(ctx, r.x + r.w / 2, (w2.tick * 3) % FL, 1, 5, 'rgba(225,240,248,0.8)');
        box(ctx, r.x - 4, FL - 2, r.w + 8, 2, '#2A352F');
      },
    }),
  );
  return st;
}

export function room(): LevelDef {
  return {
    id: 'SHL-10',
    city: 'SHL',
    index: 10,
    name: 'Down Seven Hundred',
    nameEn: 'The steps to Nongriat',
    tagline: 'Everything this city taught you. Now the other way round.',
    hint: 'Down the steps to Nongriat, and every rule turns. The lone drop by the pine is not a lie this time: rain comes down just past it a moment later, so stop at the drop and go the moment it ends; stand there longer and the cloud that formed drifts to you. Then the lane: this rain is a drizzle, the knup only catches on the low arch, so leave it on its hook, and take the knup at the second hook for the awning’s drips.',
    par: 30,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      honestDrop(w, 'shl10d', 5, 9);
      const ks = knupState(w, 'shl10k');
      hook(w, ks, 17);
      lowBar(w, ks, 21, 24, 'shl-drizzle-hook', branchArt);
      hook(w, ks, 24);
      drips(w, ks, 26.5, 28, 'shl-awning-bare');
      // a drizzle over the lane, harmless
      w.add(
        new Paint((ctx, w2) => {
          rainArt(ctx, px(15), px(30), 20, w2.tick / 120, 0.3);
        }, -4),
      );
      onPass(w, px(2), (w2) => tara(w2, L.intro[8], 2.2));
      sign(w, 2.5, 10.2, 3.2, 'NONGRIAT', 'shop', null, 'seven hundred steps down');
      rival(w, 29, 15, -1, taraScript(10));
      collectible(w, 'shl-pumaloi', 13, 11.4);
    },
  };
}

/** act 1: the liar's mark: a sister whose mark was painted too high; read the sheet, not the paint */
export const actMark: Act = {
  id: 'shl10-rong',
  w: 30,
  advice: 'A sister with a fresh white mark painted far too high, and the paint pot still at her foot: when her sheet starts at that mark it is still full, and her dry moment is the lure it always was. Read the sheet, not the paint: cross her only when the sheet is a narrow thread.',
  paint: () => {},
  build: (w, c) => {
    liarFall(w, 'shl10l', c.x + 17, 1.3);
    sign(w, c.x + 2, 10.4, 3, 'FRESH PAINT', 'shop', null, 'the pot is still there');
  },
};

/** how long the hanging guide's root takes to be deadly (ticks) and how far back along the path it grows (tiles) */
export const FAR = { rootAfter: 6, back: 4 };

/** act 2: the root from the far side: the hanging guide on your bank grows a root along the path, through you; the pole from the far bank grows the floor */
export const actFar: Act = {
  id: 'shl10-jingkieng',
  w: 32,
  advice: 'A gorge, with a bamboo guide hanging on your bank as before, and a pole leaning across from the far bank, its tip over your head a few steps on. Touch the hanging guide and its root grows along the path at your height, straight through you. Walk under it, jump at the pole’s tip: the root grows from the far side and lands at your feet.',
  paint: (g, c) => {
    g.fill(c.x + 12, c.x + 24, 15, 17, '.');
  },
  build: (w, c) => {
    const st = { near: -1, far: -1 };
    w.flags.shl10r = st;
    gorge(w, c.x + 12, c.x + 24, 'shl-far-gorge');
    // the hanging guide on the near bank (column c.x + 7): touch it and a root grows along the path, at your height
    const gx = px(c.x + 7);
    w.add(
      new Rig(gx - 2, FL - 56, 24, 20, {
        layer: 3,
        tick: (rr, w2) => {
          const p = w2.player;
          const over = p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y < rr.y + rr.h && p.y + p.h > rr.y;
          if (over && st.near < 0) {
            st.near = w2.tick;
            w2.sfx('snap', rr.x, rr.y);
          }
        },
        paint: (ctx, rr) => {
          box(ctx, rr.x + 11, FL - 110, 2, 54, '#B9A25A');
          box(ctx, rr.x + 6, FL - 58, 12, 3, '#B9A25A');
          box(ctx, rr.x + 10, FL - 55, 4, 8, '#6B4A2B');
        },
      }),
    );
    const rx0 = px(c.x + 7 - FAR.back);
    w.add(
      new Rig(rx0, FL - 24, px(c.x + 24) - rx0, 16, {
        layer: 3,
        cause: 'shl-far-head',
        inset: 2,
        live: (_r, w2) => st.near >= 0 && w2.tick - st.near >= FAR.rootAfter,
        paint: (ctx, r, w2) => {
          if (st.near < 0) return;
          const k = Math.min(1, (w2.tick - st.near) / 90);
          // it grows both ways from the guide at once
          const half = Math.round((r.w / 2) * k);
          const mid = gx + 10;
          box(ctx, Math.max(r.x, mid - half), r.y + 4, Math.min(mid + half, r.x + r.w) - Math.max(r.x, mid - half), 5, '#6B4A2B');
          box(ctx, Math.max(r.x, mid - half), r.y + 9, Math.min(mid + half, r.x + r.w) - Math.max(r.x, mid - half), 2, '#4E3520');
        },
      }),
    );
    // the pole from the far bank: its tip hangs over column c.x + 10; jump at it
    w.add(
      new Rig(px(c.x + 10) - 12, FL - 56, 26, 16, {
        layer: 3,
        tick: (rr, w2) => {
          const p = w2.player;
          const over = p.x < rr.x + rr.w && p.x + p.w > rr.x && p.y < rr.y + rr.h && p.y + p.h > rr.y;
          if (over && st.far < 0) {
            st.far = w2.tick;
            w2.sfx('snap', rr.x, rr.y);
          }
        },
        paint: (ctx, rr) => {
          ctx.strokeStyle = st.far >= 0 ? '#C8D86B' : '#B9A25A';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(rr.x + 12, FL - 50);
          ctx.lineTo(px(c.x + 25), FL - 2);
          ctx.stroke();
          box(ctx, rr.x + 10, FL - 54, 4, 8, '#6B4A2B');
        },
      }),
    );
    root(w, px(c.x + 25), FL, px(13), 3.5, () => st.far, { left: true });
    sign(w, c.x + 2, 10.4, 3, 'FAR BANK', 'shop', null, 'the pole leans across');
  },
};

/** the keepers' walk: it starts `delay` ticks after the bell at the arch and lasts `lasts` ticks; the deck lurches all the while */
export const LURCH = { delay: 30, lasts: 84 };

export interface Keepers {
  /** on each deck, the index (0..2) of the counter nobody is behind: a cloth over a frame */
  frame: number[];
  /** the tick the bell rang, -1 when the keepers are behind their counters */
  bellAt: number;
  /** keepers walking right now (the deck lurches) */
  moving: (w: World) => boolean;
  /** the deck's swing (paint only; it is the keepers' walk that throws) */
  e: number;
  pitches: { x: number; w: number; deck: number; i: number; plate: number }[];
  decks: { x0: number; x1: number }[];
}

/** the rest stalls on the span: two decks of three counters between piers, two keepers and one frame on each deck */
export function keepersSpan(w: World, key: string, decks: { c0: number; plates: number[] }[], archCols: number[]): Keepers {
  const st: Keepers = { frame: decks.map(() => 2), bellAt: -1, moving: (w2) => st.bellAt >= 0 && w2.tick - st.bellAt >= LURCH.delay && w2.tick - st.bellAt < LURCH.delay + LURCH.lasts, e: 0, pitches: [], decks: [] };
  w.flags[key] = st;
  const TARPS = ['#D7262E', '#2F6BB0', '#E8B04B', '#4E8A3E', '#8A4A8F', '#C8D86B', '#5AA7C9', '#B9A25A'];
  const walkK = (w2: World) => (st.bellAt < 0 ? 0 : Math.max(0, Math.min(1, (w2.tick - st.bellAt - LURCH.delay) / LURCH.lasts)));
  decks.forEach((d, di) => {
    const x0 = px(d.c0);
    const x1 = px(d.c0 + 3 * PITCH_W);
    st.decks.push({ x0, x1 });
    d.plates.forEach((plate, i) => {
      const x = px(d.c0 + i * PITCH_W);
      st.pitches.push({ x, w: px(PITCH_W), deck: di, i, plate });
      const r = w.add(
        new Rig(x, TOP, px(PITCH_W), 16, {
          solid: true,
          layer: 2,
          tick: (rr) => rr.setSolid(st.frame[di] !== i),
          paint: (ctx, rr, w2) => {
            const open = st.frame[di] !== i;
            const sw = Math.sin((w2.tick / 120) * 2 * Math.PI * 1.1) * st.e * 6;
            // legs and the cloth front down to the deck
            box(ctx, rr.x + 2, TOP + sw, 3, 24, '#6B4F2E');
            box(ctx, rr.x + rr.w - 5, TOP + sw, 3, 24, '#6B4F2E');
            box(ctx, rr.x, TOP + 2 + sw, rr.w, 22, TARPS[(plate - 1) % 8]);
            if (open) {
              box(ctx, rr.x - 1, TOP + sw, rr.w + 2, 4, '#8A6A3E');
              box(ctx, rr.x - 1, TOP + sw, rr.w + 2, 1, '#C9A56B');
              for (let k = 0; k < 3; k++) box(ctx, rr.x + 4 + k * 9, TOP - 5 + sw, 6, 5, k % 2 ? '#E8B04B' : '#4E8A3E');
            } else box(ctx, rr.x - 1, TOP + sw, rr.w + 2, 2, '#4A3620');
            // the tarp on poles and the plate (it stays on the frame: the plate means nothing here)
            box(ctx, rr.x + 3, TOP - 44 + sw, 2, 40, '#6B4F2E');
            box(ctx, rr.x + rr.w - 5, TOP - 44 + sw, 2, 40, '#6B4F2E');
            box(ctx, rr.x - 3, TOP - 48 + sw, rr.w + 6, 6, TARPS[(plate - 1) % 8]);
            box(ctx, rr.x + rr.w / 2 - 7, TOP - 40 + sw, 14, 10, '#F4F7F2');
            ctx.fillStyle = '#22302B';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(String(plate), rr.x + rr.w / 2, TOP - 32 + sw);
            ctx.textAlign = 'left';
          },
        }),
      );
      if (r.solid) r.solid.velX = 0;
    });
    // the deck the counters stand on, hung from the piers, and the keepers walking between counters
    w.add(
      new Rig(x0, FL, x1 - x0, 6, {
        layer: 1,
        paint: (ctx, r, w2) => {
          const sw = Math.sin((w2.tick / 120) * 2 * Math.PI * 1.1) * st.e * 6;
          ctx.strokeStyle = '#3E4D47';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(r.x - 14, FL - 74);
          ctx.quadraticCurveTo((r.x + r.x + r.w) / 2, FL - 20 + sw, r.x + r.w + 14, FL - 74);
          ctx.stroke();
          for (let x = r.x + 8; x < r.x + r.w; x += 16) {
            const k = (x - r.x) / r.w;
            const cy = FL - 74 + (FL - 20 + sw - (FL - 74)) * (4 * k * (1 - k)) * 0.5;
            ctx.beginPath();
            ctx.moveTo(x, cy);
            ctx.lineTo(x, FL + sw);
            ctx.stroke();
          }
          box(ctx, r.x, FL + sw, r.w, 6, '#6B4F2E');
          for (let x = r.x; x < r.x + r.w; x += 8) box(ctx, x, FL + sw, 1, 6, '#4A3620');
          box(ctx, r.x, FL + sw - 2, r.w, 2, st.moving(w2) ? '#D7262E' : '#8A6A3E');
          // the keepers: behind every counter but the frame; while they walk, each is on his way one stall along
          // (the frame moves on when they arrive, so the one drawn at the next counter is then counted from there)
          const k = walkK(w2);
          for (let i = 0; i < 3; i++) {
            if (i === st.frame[di]) continue;
            const a = x0 + i * px(PITCH_W) + px(PITCH_W) / 2;
            const b = x0 + ((i + 1) % 3) * px(PITCH_W) + px(PITCH_W) / 2;
            folk(ctx, a + (b - a) * k, TOP - 26 + sw, 26, i % 2 ? '#2F6BB0' : '#8A4A8F');
          }
        },
      }),
    );
  });
  // the water under both decks: a counter nobody is behind is a cloth over a frame, and under it the river
  const rx0 = st.decks[0].x0;
  const rx1 = st.decks[st.decks.length - 1].x1;
  w.add(
    new Rig(rx0, FL + 22, rx1 - rx0, 30, {
      layer: 0,
      cause: 'shl-khlem',
      inset: 0,
      paint: (ctx, r, w2) => {
        ctx.fillStyle = 'rgba(120,200,210,0.35)';
        ctx.fillRect(r.x, FL + 18, r.w, 60);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let x = r.x + ((w2.tick / 3) % 14); x < r.x + r.w - 6; x += 14) ctx.fillRect(x, FL + 20, 6, 1);
        for (let x = r.x + 6; x < r.x + r.w; x += 11) box(ctx, x, FL + 62 + ((x * 7) % 5), 5, 3, '#9FB0A8');
      },
    }),
  );
  // the bell at each arch: the keepers move one stall along, and the deck lurches under their walk
  for (const a of archCols) {
    onPass(w, px(a), (w2) => {
      st.bellAt = w2.tick;
      w2.sfx('bell', px(a), FL - 70);
      w2.when(
        (w3) => w3.tick - st.bellAt >= LURCH.delay + LURCH.lasts,
        () => {
          for (let d = 0; d < st.frame.length; d++) st.frame[d] = (st.frame[d] + 1) % 3;
          st.bellAt = -1;
        },
      );
    });
  }
  // the lurch: whoever is moving on a deck while the keepers walk goes over; a step of your own only rocks it
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 3,
      tick: (_r, w2) => {
        const p = w2.player;
        const overDeck = st.decks.some((d) => p.x + p.w > d.x0 && p.x < d.x1) && p.y + p.h <= TOP + 4;
        if (st.moving(w2)) {
          st.e = Math.min(1, st.e + 1 / 20);
          if (overDeck && (Math.abs(p.vx) > 60 || !p.onGround)) w2.die('shl-lurch');
        } else if (overDeck && Math.abs(p.vx) > 60) st.e = Math.min(0.35, st.e + 1 / 150);
        else st.e = Math.max(0, st.e - 1 / 60);
      },
      paint: () => {},
    }),
  );
  return st;
}

/** act 3 (the slot's twist): the rest stalls on a Dawki span; the keepers move one stall along at every arch, and their walk lurches the deck */
export const actKeepers: Act = {
  id: 'shl10-keepers',
  w: 32,
  advice: 'The rest stalls of the market stand on a Dawki span, two decks between stone piers, an arch on each pier. The plates mean nothing here, and your step barely rocks the deck: at every arch a bell rings, the keepers each move one stall along, and their walk lurches the deck so hard that anyone moving on it goes over. Stand still at the arch until they are behind their counters, then read who is behind a counter: the one with nobody is a cloth over a frame. Jump it.',
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 14, 15, 17, '.');
    g.fill(c.x + 18, c.x + 26, 15, 17, '.');
  },
  build: (w, c) => {
    const mk = market(w, 'shl10m');
    arch(w, mk, c.x + 5);
    arch(w, mk, c.x + 16);
    tower(w, c.x + 4);
    tower(w, c.x + 15);
    tower(w, c.x + 17);
    tower(w, c.x + 27);
    keepersSpan(w, 'shl10k2', [{ c0: c.x + 6, plates: [3, 1, 2] }, { c0: c.x + 18, plates: [2, 3, 1] }], [c.x + 5, c.x + 16]);
    sign(w, c.x + 1, 10.4, 3, 'REST STALLS', 'shop', null, 'the bell at the arch: stand still');
  },
};

/** the door at the bottom of the steps is plain: the stage has said its piece */
export const ending: Ending | null = null;

export const meta10 = { family: 'finale-cadence-bridge-day-stalls', betrayals: ['stalls-on-swaying-span'], ending: 'shl-tallgate' };
