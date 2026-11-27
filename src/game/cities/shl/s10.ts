// SHL-10 Down Seven Hundred (finale): the steps down to Nongriat. Every beat is a rule this city taught, broken:
// the lone drop tells the truth; the knup is wrong for the light rain and right for the drips; a sister whose
// mark was painted too high; a root that must be guided from the far side; and the rest stalls of the market stand
// on a Dawki span: the day turns at the arch in the middle, and the deck swings to your step.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box, perTick } from './entities';
import { cloudArt, rainArt, cyc, taraScript, FL } from './common';
import { lines as L, npc } from './lines';
import { knupState, hook, lowBar, drips, branchArt } from './s04';
import { root, gorge } from './s06';
import { market, arch, row, TOP, type Pitch } from './s09';
import { tower, river } from './s03';
import { stal, cave, type Stal } from './s07';
import { SWAY } from './s03';

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
          if (r.hazard) r.hazard.cause = 'shl-lyoh';
        }
        if (r.hazard && r.hazard.cause === 'shl-lyoh' && st.still > 60) {
          // it empties on whoever it reaches
          if (p.x + p.w > r.x + 3 && p.x < r.x + r.w - 3) w2.die('shl-lyoh');
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
        if (r.hazard) r.hazard.cause = r.s.wentDry ? 'shl-wah' : ph.k === 'mark' ? 'shl-liar' : 'shl-um';
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

/** the deck of the last span is the market's rest stalls: it swings to your step like Dawki's deck */
export function swayOver(w: World, key: string, pitches: Pitch[], cause = 'shl-sway') {
  const st = { e: 0 };
  w.flags[key] = st;
  const on = (w2: World) => {
    const p = w2.player;
    return p.onGround && p.y + p.h <= TOP + 2 && pitches.some((q) => p.x + p.w > q.x && p.x < q.x + q.w);
  };
  w.add(
    new Rig(0, 0, 0, 0, {
      layer: 3,
      tick: (_r, w2) => {
        const p = w2.player;
        if (on(w2)) {
          // a lighter deck than Dawki's: it swings up in half the time
          if (Math.abs(p.vx) > 60) st.e += SWAY.gain * 2.5;
          else st.e = Math.max(0, st.e - SWAY.calm);
          if (st.e >= SWAY.throwAt) w2.die(cause);
        } else st.e = Math.max(0, st.e - SWAY.calm);
      },
      paint: (ctx, _r, w2) => {
        if (!pitches.length) return;
        const x0 = pitches[0].x,
          x1 = pitches[pitches.length - 1].x + pitches[pitches.length - 1].w;
        const sw = Math.sin((w2.tick / 120) * 2 * Math.PI * 0.9) * st.e * 7;
        ctx.strokeStyle = '#3E4D47';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0 - 16, FL - 90);
        ctx.quadraticCurveTo((x0 + x1) / 2, TOP - 30 + sw, x1 + 16, FL - 90);
        ctx.stroke();
        for (let x = x0 + 8; x < x1; x += 16) {
          ctx.beginPath();
          ctx.moveTo(x, TOP - 50);
          ctx.lineTo(x, TOP + sw);
          ctx.stroke();
        }
        box(ctx, x0, TOP + 14, x1 - x0, 3, st.e >= SWAY.creakAt ? '#D7262E' : '#8A6A3E');
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
      lowBar(w, ks, 21, 24, 'shl-lintel', branchArt);
      hook(w, ks, 24);
      drips(w, ks, 26.5, 28);
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

/** act 1: the liar's mark: a sister with an honest mark, then one whose mark was painted too high */
export const actMark: Act = {
  id: 'shl10-rong',
  w: 30,
  advice: 'Two sisters. The first keeps the rule: cross on the mark. The second has a fresh white mark painted far too high, and the paint pot still stands at her foot: when her sheet starts at that mark it is still full. Read the sheet, not the paint: cross her only when the sheet is narrow.',
  paint: () => {},
  build: (w, c) => {
    // the honest sister reuses the finale's liar schedule shape with a true mark: a plain SHL-05 fall is enough
    liarFall(w, 'shl10l', c.x + 17, 1.3);
    sign(w, c.x + 2, 10.4, 3, 'FRESH PAINT', 'shop', null, 'the pot is still there');
  },
};

/** act 2: the root from the far side: the hanging guide grows a root at head height; the pole from the far bank grows the floor */
export const actFar: Act = {
  id: 'shl10-jingkieng',
  w: 32,
  advice: 'A gorge with a guide hanging on your bank, as before, and a bamboo pole leaning across from the far bank, its tip over your head a few steps back from the edge. The hanging guide grows a root at head height, straight into your path. Jump at the pole’s tip: the root grows from the far side and lands at your feet.',
  cps: [1],
  paint: (g, c) => {
    g.fill(c.x + 12, c.x + 24, 15, 17, '.');
  },
  build: (w, c) => {
    const st = { near: -1, far: -1 };
    w.flags.shl10r = st;
    gorge(w, c.x + 12, c.x + 24);
    // the hanging guide on the near bank: touch it and a root grows at head height along the path and over the gorge
    w.add(
      new Rig(px(c.x + 10) - 2, FL - 56, 24, 20, {
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
    w.add(
      new Rig(px(c.x + 10), FL - 30, px(14), 18, {
        layer: 3,
        cause: 'shl-jri',
        inset: 2,
        live: (_r, w2) => st.near >= 0 && w2.tick - st.near >= 40,
        paint: (ctx, r, w2) => {
          if (st.near < 0) return;
          const k = Math.min(1, (w2.tick - st.near) / 240);
          box(ctx, r.x, r.y + 4, Math.round(r.w * k), 5, '#6B4A2B');
          box(ctx, r.x, r.y + 9, Math.round(r.w * k), 2, '#4E3520');
        },
      }),
    );
    // the pole from the far bank: its tip hangs over column c.x + 7; jump at it
    w.add(
      new Rig(px(c.x + 7) - 12, FL - 56, 26, 16, {
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

/** act 3: the rest stalls stand on a Dawki span: bursts for the deck, the plates for the day, and the arch in the middle */
export const actSpan: Act = {
  id: 'shl10-pung',
  w: 44,
  advice: 'The rest stalls of the market stand on a Dawki span. The deck swings to your step: bursts, as on the bridge. The stalls keep the market’s week: the arch at the start is a day and the arch in the middle is another, so the stall beyond it with tomorrow’s plate is a frame. Jump that one, in a burst.',
  cps: [12],
  paint: (g, c) => {
    g.fill(c.x + 6, c.x + 31, 15, 17, '.');
  },
  build: (w, c) => {
    const st = market(w, 'shl10m');
    st.day = 0;
    arch(w, st, c.x + 2);
    river(w, c.x + 6, c.x + 31);
    tower(w, c.x + 4);
    tower(w, c.x + 32);
    const pitches = row(w, st, c.x + 6, [3, 1, 4, 5, 6, 2, 4, 3], { causeFor: (plate, day) => (plate === 2 && day === 2 ? 'shl-shift' : 'shl-closed') });
    arch(w, st, c.x + 19);
    swayOver(w, 'shl10s', pitches);
    sign(w, c.x + 36, 10.4, 3, 'REST STALLS', 'shop', null, 'jadoh on the span');
  },
};

/** act 4 (07's break): a wet stalactite glistens; a bump sheds three drips at once instead of freezing it. Pass it on its own count. */
export const actWet: Act = {
  id: 'shl10-wet',
  w: 30,
  advice: 'A cave mouth with two stalactites. The first glistens: it is wet through, and a bump on it does not freeze it, it sheds three drips at once. Pass it on its own slow count without touching it, then wait for the quick second one to break.',
  cps: [1],
  paint: () => {},
  build: (w, c) => {
    const list: Stal[] = [];
    w.flags.shl10c = list;
    cave(w, c.x + 4, c.x + 27);
    stal(w, list, c.x + 12, { g0: 64, step: 8, period: 1.2, shut: 2.0, phase: 0, from: c.x + 1, startGap: 40, wet: true });
    stal(w, list, c.x + 20, { g0: 52, step: 10, period: 0.5, shut: 1.4, phase: 0, from: c.x + 1, startGap: 22 });
    sign(w, c.x + 2, 10.4, 3, 'IT GLISTENS', 'shop', null, 'wet through');
  },
};

/** ending: the gate at the bottom is tall today, and drips run off its roof: take the knup at the hook and walk in */
export const ending: Ending = {
  space: 14,
  advice: 'The gate at the bottom of the steps is tall, not a half-door, and the rain runs off its roof in a row of drips. Take the knup from the hook and walk in wearing it.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const ks = knupState(w, 'shl10e');
    w.flags.twist = 'tallgate';
    hook(w, ks, D - 8);
    drips(w, ks, D - 3, D);
    w.add(
      new Paint((ctx) => {
        box(ctx, px(D) - 10, FL - 70, 4, 70, '#6B4F2E');
        box(ctx, px(D) + 22, FL - 70, 4, 70, '#6B4F2E');
        box(ctx, px(D) - 14, FL - 76, 40, 6, '#6B4F2E');
      }, -4),
    );
    onPass(w, px(D - 12), (w2) => w2.say(npc.welcome, px(D) - 20, px(10.6), 2.4, 'npc'));
  },
};

export const meta10 = { family: 'finale-cadence-bridge-day-stalls', betrayals: ['stalls-on-swaying-span'], ending: 'shl-tallgate' };
