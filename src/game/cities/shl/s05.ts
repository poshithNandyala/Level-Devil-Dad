// SHL-05 Seven Sisters (HWIK): the falls near Sohra pour across the path in turn. Each fall runs on a schedule:
// full, thinning, down to a white mark painted on the rock, then for a moment nothing at all, then full again
// with no warning. The dry moment is the lure. Cross when the water sits on the mark, not after.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Rig, box } from './entities';
import { cyc, taraScript, FL } from './common';
import { lines as L } from './lines';

export type Phase = 'strong' | 'fade' | 'mark' | 'dry';
export interface Sched {
  strong: number;
  fade: number;
  mark: number;
  dry: number;
  phase: number;
}
export const SCHED: Sched = { strong: 2.2, fade: 1.0, mark: 1.2, dry: 0.35, phase: 0 };
export const period = (s: Sched) => s.strong + s.fade + s.mark + s.dry;
/** where in its schedule a fall is, and how long that phase has left */
export function phaseOf(w: World, s: Sched): { k: Phase; left: number; into: number } {
  let t = cyc(w, period(s), s.phase);
  for (const k of ['strong', 'fade', 'mark', 'dry'] as Phase[]) {
    if (t < s[k]) return { k, left: s[k] - t, into: t };
    t -= s[k];
  }
  return { k: 'strong', left: s.strong, into: 0 };
}

export interface Fall {
  c0: number;
  s: Sched;
  at: (w: World) => { k: Phase; left: number; into: number };
}

/** a fall pouring across the path at columns c0..c0+2, deadly while full or thinning; the white mark on the rock is its safe level */
export function fall(w: World, list: Fall[], c0: number, s: Sched, cause = 'shl-um', hidden = false) {
  const f: Fall = { c0, s, at: (w2) => phaseOf(w2, s) };
  list.push(f);
  w.add(
    new Rig(px(c0), 0, px(3), FL, {
      layer: 4,
      cause,
      inset: 3,
      live: (_r, w2) => {
        const k = phaseOf(w2, s).k;
        return k === 'strong' || k === 'fade';
      },
      tick: (r, w2) => {
        // the lure: the water that comes back on someone who went in during the dry moment
        const ph = phaseOf(w2, s);
        const p = w2.player;
        const inside = p.x + p.w > r.x && p.x < r.x + r.w;
        if (inside && ph.k === 'dry') r.s.wentDry = true;
        if (!inside) r.s.wentDry = false;
        if (r.hazard) r.hazard.cause = r.s.wentDry ? 'shl-wah' : cause;
      },
      paint: (ctx, r, w2) => {
        const ph = phaseOf(w2, s);
        const full = ph.k === 'strong' ? 1 : ph.k === 'fade' ? 1 - ph.into / s.fade * 0.6 : ph.k === 'mark' ? 0.4 : 0;
        // the cliff face behind, and the white mark: the level the water keeps while it is safe
        box(ctx, r.x - 10, 0, r.w + 20, FL, '#4A5A54');
        box(ctx, r.x - 10, 0, 3, FL, '#3A4842');
        box(ctx, r.x + r.w + 7, 0, 3, FL, '#3A4842');
        const markY = FL - 90;
        box(ctx, r.x - 9, markY, 8, 2, '#F4F7F2');
        box(ctx, r.x + r.w + 1, markY, 8, 2, '#F4F7F2');
        if (full > 0) {
          const wd = 6 + (r.w - 12) * full;
          const x0 = r.x + (r.w - wd) / 2;
          // the water: a sheet from the top; when it is at the mark the sheet only starts at the mark
          const top = ph.k === 'mark' ? markY : 0;
          ctx.fillStyle = `rgba(225,240,248,${0.55 + 0.4 * full})`;
          ctx.fillRect(x0, top, wd, FL - top);
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          for (let y = top + ((w2.tick * 4) % 16); y < FL; y += 16) ctx.fillRect(x0 + 2, y, Math.max(1, wd - 4), 3);
          // the splash at the foot
          ctx.beginPath();
          ctx.ellipse(r.x + r.w / 2, FL - 1, wd / 2 + 6, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // dry: a last drip
          box(ctx, r.x + r.w / 2, (w2.tick * 3) % FL, 1, 5, 'rgba(225,240,248,0.8)');
        }
        // the bed: wet dark stone
        box(ctx, r.x - 4, FL - 2, r.w + 8, 2, '#2A352F');
        // a sister behind an outcrop: only her foot shows; her roar is the read (the sfx below)
        if (hidden) {
          box(ctx, r.x - 12, 0, r.w + 24, FL - 30, '#4A5A54');
          box(ctx, r.x - 12, FL - 32, r.w + 24, 3, '#3A4842');
          const roar = ph.k === 'strong' ? 3 : ph.k === 'fade' ? 2 : ph.k === 'mark' ? 1 : 0;
          for (let i = 0; i < roar; i++) box(ctx, r.x + r.w + 14 + i * 5, FL - 60 - i * 6, 3, 10 + i * 6, 'rgba(255,255,255,0.6)');
        }
      },
    }),
  );
  if (hidden) {
    // the roar: a sound each beat whose strength follows the sheet (strong: loud, mark: quiet, dry: silent)
    w.add(
      new Rig(0, 0, 0, 0, {
        layer: 0,
        tick: (r, w2) => {
          const ph = phaseOf(w2, s);
          if (w2.tick % 30 !== 0 || ph.k === 'dry') return;
          if (Math.abs(w2.player.cx - px(c0)) < px(14)) w2.sfx(ph.k === 'strong' ? 'rumble' : 'splash', px(c0), FL - 40);
          void r;
        },
        paint: () => {},
      }),
    );
  }
  return f;
}

export function room(): LevelDef {
  return {
    id: 'SHL-05',
    city: 'SHL',
    index: 5,
    name: 'Seven Sisters',
    nameEn: 'The seven falls',
    tagline: 'Seven streams off one cliff. Each keeps its own time.',
    hint: 'A fall pours across the path on a schedule: full, then thinning, then it sits on the white mark painted on the rock, then for a moment nothing, then full again with no warning. Full and thinning kill. Cross the moment the water is on the mark. The dry moment is the trap: the water comes back before you are through.',
    par: 24,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const falls: Fall[] = [];
      w.flags.shl5 = falls;
      fall(w, falls, 14, { ...SCHED, phase: 4.2 });
      onPass(w, px(5), (w2) => tara(w2, L.intro[3], 2.2));
      sign(w, 4, 10.2, 3.6, 'NOHSNGITHIANG', 'shop', null, 'the seven sisters falls');
      rival(w, 29, 15, -1, taraScript(5));
      collectible(w, 'shl-pumaloi', 22, 11.4);
    },
  };
}

/** act: two more sisters; the second never goes dry (full, thin, mark, full): thinning is not the mark */
export const act: Act = {
  id: 'shl05-ar',
  w: 34,
  cps: [16],
  advice: 'Two more sisters. The first keeps the same time as the one before. The second never goes dry: full, thinning, the mark, and full again. Thinning is not the mark: wait for the sheet to start at the white line, then cross.',
  paint: () => {},
  build: (w, c) => {
    const falls = w.flags.shl5 as Fall[];
    fall(w, falls, c.x + 7, { ...SCHED, phase: 1.1 });
    fall(w, falls, c.x + 22, { strong: 2.4, fade: 1.4, mark: 1.3, dry: 0, phase: 2.0 });
    sign(w, c.x + 2, 10.4, 3, 'TWO MORE', 'shop', null, 'each in her own time');
  },
};

/** act 2: a basin between two sisters: it floods whenever either is full. Cross it when both sit on their marks */
export const actBasin: Act = {
  id: 'shl05-pung',
  w: 36,
  advice: 'Two sisters pour into one basin, and the basin floods whenever either of them is full or thinning. The basin is five tiles wide: cross it only when both sit on their marks at once, and go at once when they do.',
  cps: [20],
  paint: () => {},
  build: (w, c) => {
    const falls = w.flags.shl5 as Fall[];
    // the two sisters keep the same time, a little apart: both sit on their marks together for 1.3 s of every 4.6
    const a = fall(w, falls, c.x + 6, { strong: 1.6, fade: 0.8, mark: 1.9, dry: 0.3, phase: 0.4 });
    const b = fall(w, falls, c.x + 14, { strong: 1.6, fade: 0.8, mark: 1.9, dry: 0.3, phase: 1.0 });
    const flooded = (w2: World) => ['strong', 'fade'].includes(a.at(w2).k) || ['strong', 'fade'].includes(b.at(w2).k);
    w.flags.shl5p = { x0: px(c.x + 9), x1: px(c.x + 14), flooded };
    w.add(
      new Rig(px(c.x + 9), FL - 12, px(5), 12, {
        layer: 1,
        cause: 'shl-pung',
        inset: 1,
        live: (_r, w2) => flooded(w2),
        paint: (ctx, r, w2) => {
          const fl = flooded(w2);
          box(ctx, r.x, FL - 4, r.w, 4, '#2A352F');
          if (fl) {
            ctx.fillStyle = 'rgba(150,205,220,0.8)';
            ctx.fillRect(r.x - 2, FL - 12, r.w + 4, 12);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            for (let x = r.x + ((w2.tick / 4) % 10); x < r.x + r.w; x += 10) ctx.fillRect(x, FL - 11, 5, 1);
          } else {
            ctx.fillStyle = 'rgba(150,205,220,0.35)';
            ctx.fillRect(r.x, FL - 3, r.w, 3);
          }
        },
      }),
    );
    sign(w, c.x + 2, 10.4, 3, 'THE BASIN', 'shop', null, 'two sisters, one pool');
  },
};

/** act 3: a long ledge to a sister hidden behind an outcrop (the roar is the read), then the quick sister: the labelled momentum beat */
export const actRoar: Act = {
  id: 'shl05-roar',
  w: 40,
  advice: 'A long ledge, and a sister behind the rock: you see only her foot and hear her roar. Loud is full, softer is thinning, quiet is the mark, silence is the dry lure: cross on the quiet, never on the silence. Then the quick sister: her mark lasts half a second. Stand at the very edge and go the instant the sheet drops to the mark.',
  cps: [14],
  paint: () => {},
  build: (w, c) => {
    const falls = w.flags.shl5 as Fall[];
    fall(w, falls, c.x + 19, { strong: 2.4, fade: 1.0, mark: 1.3, dry: 0.4, phase: 0.6 }, 'shl-um', true);
    fall(w, falls, c.x + 30, { strong: 3.0, fade: 0.9, mark: 0.5, dry: 0.35, phase: 1.9 });
    sign(w, c.x + 4, 10.4, 3, 'LISTEN', 'shop', null, 'you hear her before you see her');
    sign(w, c.x + 25, 10.4, 3, 'QUICK', 'shop', null, 'half a second on the mark');
  },
};

/** ending: the seventh sister pours into the pool the door stands in: cross its bed on the mark */
export const ending: Ending = {
  space: 14,
  advice: 'The seventh sister pours into the pool before the door. Same rule: when the water sits on the mark, walk through the pool to the door.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const falls = w.flags.shl5 as Fall[];
    w.flags.twist = 'pool';
    fall(w, falls, D - 6, { strong: 2.0, fade: 1.0, mark: 1.4, dry: 0.35, phase: 1.3 });
    w.add(
      new Paint((ctx) => {
        box(ctx, px(D - 9), FL - 3, px(10), 3, 'rgba(150,205,220,0.5)');
      }, 1),
    );
  },
};

export const meta05 = { family: 'one-stream-schedule-mark', betrayals: ['hidden-schedule'], ending: 'shl-pool' };
