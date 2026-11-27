// KOH-08 Axone Handi (how would I know): Dad carries a pot of axone, the fermented soybean with the famous smell. A jump
// knocks the lid off and the scent pours out (a green waft over the pot); stand still half a second and he lids it again.
// No sign says what the smell does; the animals show it: the lane dog and the crows on the wire keep off an open pot and
// go for a lidded one, and the cat loves it: she runs at an open pot and trips you. So: lid off for the dog and the
// crows, lid on for the cat, and when the crows hang over the cat's wall, beat them by standing still (a crow dives at
// where a walker will be) and keep the lid on.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

export interface Pot {
  lid: boolean;
  /** seconds standing still with the lid off */
  still: number;
  /** how far the scent has spread, 0..1 (drawn) */
  waft: number;
}

/** the pot on Dad's head: a jump knocks the lid off, standing still 0.5 s puts it back */
export function pot(w: World): Pot {
  const st: Pot = { lid: true, still: 0, waft: 0 };
  w.flags.koh8 = st;
  w.onTick((w2) => {
    const p = w2.player;
    if (!p.onGround && p.vy < -60 && st.lid) {
      st.lid = false;
      st.still = 0;
      w2.sfx('pop', p.cx, p.y - 10);
    }
    if (!st.lid) {
      if (p.onGround && Math.abs(p.vx) < 5) st.still += 1 / 120;
      else st.still = 0;
      if (st.still >= 0.5) {
        st.lid = true;
        w2.sfx('click', p.cx, p.y - 10);
      }
    }
    st.waft = st.lid ? Math.max(0, st.waft - 1 / 40) : Math.min(1, st.waft + 1 / 30);
  });
  w.add(
    new Paint((ctx, w2) => {
      const p = w2.player;
      if (w2.state !== 'play' && w2.state !== 'won') return;
      const x = p.cx;
      const y = p.y - 9;
      // the clay pot and its bamboo lid
      ctx.fillStyle = '#8D5524';
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (st.lid) box(ctx, x - 5, y - 1, 10, 2, '#C9A24B');
      else box(ctx, x + 4, y + 2, 7, 2, '#C9A24B');
      if (st.waft > 0) {
        ctx.fillStyle = `rgba(120,180,80,${0.18 + 0.3 * st.waft})`;
        for (let k = 0; k < 4; k++) {
          const yy = y - 6 - k * 7 * st.waft - ((w2.tick / 6 + k * 5) % 7);
          ctx.beginPath();
          ctx.arc(x + Math.sin((w2.tick + k * 40) / 14) * (3 + k * 2) * st.waft, yy, 3 + k * 1.5 * st.waft, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }, 5),
  );
  return st;
}

/** a lane dog at column c: it goes for a lidded pot within 4 tiles, and backs off an open one */
export function dog(w: World, c: number, key: string) {
  const x0 = px(c);
  const st = { x: x0, mode: 'sit' as 'sit' | 'charge' | 'back' };
  w.flags[key] = st;
  w.add(
    new Rig(x0, FL - 12, 16, 12, {
      layer: 2,
      cause: 'koh-kukur',
      inset: 1,
      live: () => st.mode === 'charge',
      tick: (r, w2) => {
        const p = w2.player;
        const lid = (w2.flags.koh8 as Pot).lid;
        const d = p.cx - (r.x + 8);
        const passed = p.cx > x0 + 24;
        if (st.mode !== 'back' && !passed && lid && Math.abs(d) < 64) {
          if (st.mode !== 'charge') w2.sfx('growl', r.x, r.y);
          st.mode = 'charge';
        } else if (!lid && Math.abs(d) < 84) st.mode = 'back';
        else if (st.mode === 'back' && (Math.abs(d) >= 110 || passed)) st.mode = 'sit';
        if (st.mode === 'charge') r.x += Math.sign(d) * (220 / 120);
        else if (st.mode === 'back') r.x += Math.sign(r.x + 8 - p.cx) * (130 / 120);
        else if (st.mode === 'sit' && Math.abs(r.x - x0) > 1 && passed) r.x += Math.sign(x0 - r.x) * (60 / 120);
        st.x = r.x;
        r.s.mode = st.mode;
      },
      paint: (ctx, r, w2) => {
        const back = r.s.mode === 'back';
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(r.x + 2, r.y + 3, 12, 6);
        ctx.fillRect(r.x + (back ? 0 : 11), r.y, 5, 6);
        ctx.fillStyle = '#3A2A1E';
        ctx.fillRect(r.x + 3, r.y + 9, 2, 3 + (w2.tick >> 3) % 2 * (r.s.mode === 'charge' ? 1 : 0));
        ctx.fillRect(r.x + 11, r.y + 9, 2, 3);
        if (r.s.mode === 'charge') {
          ctx.fillStyle = '#F2EFE4';
          ctx.fillRect(r.x + 14, r.y + 4, 2, 1);
        }
      },
    }),
  );
  return st;
}

/** a crow on a wire at column c: it dives at a lidded walker under it (landing 3.5 tiles on), and lifts off an open pot */
export function crow(w: World, c: number, key: string) {
  const x0 = px(c);
  const y0 = FL - 84;
  const st = { t0: -1, up: false, mode: 'perch' as 'perch' | 'dive' | 'up', aim: 0 };
  w.flags[key] = st;
  w.add(
    new Rig(x0, y0, 10, 8, {
      layer: 3,
      cause: 'koh-kag',
      inset: 1,
      live: () => st.mode === 'dive',
      tick: (r, w2) => {
        const p = w2.player;
        const lid = (w2.flags.koh8 as Pot).lid;
        const d = p.cx - x0;
        if (st.mode === 'perch') {
          if (!lid && Math.abs(d) < 56) st.mode = 'up';
          else if (lid && d > -26 && d < 6) {
            // it dives at where a walker will be in 0.4 s; a man who stops is missed
            st.mode = 'dive';
            st.t0 = w2.tick;
            st.aim = p.cx + 52;
            w2.sfx('caw', x0, y0);
          }
          r.x = x0;
          r.y = y0;
        } else if (st.mode === 'dive') {
          const k = Math.min(1, since(w2, st.t0) / 0.4);
          r.x = x0 + (st.aim - 5 - x0) * k;
          r.y = y0 + (FL - 12 - y0) * k;
          if (k >= 1) {
            st.mode = 'up';
            st.t0 = w2.tick;
          }
        } else {
          const k = Math.min(1, since(w2, st.t0) / 0.6);
          r.y = Math.min(r.y, y0 - 20 * k);
          r.x += (x0 - r.x) * 0.05;
          if (k >= 1 && (lid ? Math.abs(d) > 60 : Math.abs(d) > 70) && p.cx < x0) st.mode = 'perch';
        }
        r.s.mode = st.mode;
      },
      paint: (ctx, r, w2) => {
        ctx.fillStyle = '#1B1B1B';
        ctx.fillRect(r.x, r.y + 2, 10, 5);
        ctx.fillRect(r.x + 9, r.y, 3, 3);
        const flap = r.s.mode !== 'perch' ? ((w2.tick >> 2) % 2 ? -4 : 2) : 0;
        ctx.fillRect(r.x + 2, r.y + flap, 6, 2);
        ctx.fillStyle = '#E0B04A';
        ctx.fillRect(r.x + 12, r.y + 1, 2, 1);
      },
    }),
  );
  return st;
}

/** the wire the crows sit on, from column c0 to c1 */
export const wire = (w: World, c0: number, c1: number) =>
  w.add(
    new Paint((ctx) => {
      box(ctx, px(c0), FL - 80, px(c1) - px(c0), 1, '#2B1A12');
      box(ctx, px(c0) - 2, FL - 90, 3, 90, '#5D4037');
      box(ctx, px(c1) - 1, FL - 90, 3, 90, '#5D4037');
    }, -1),
  );

/** a cat on a low wall at column c: she loves axone: an open pot within 4.5 tiles and she runs at you and trips you */
export function cat(w: World, c: number, key: string) {
  const x0 = px(c);
  const st = { mode: 'sit' as 'sit' | 'run' | 'done' };
  w.flags[key] = st;
  // the low wall she sits on is behind the lane (drawn only: a hop would open the pot)
  w.add(new Rig(x0 - 2, FL - 6, 20, 6, { layer: -1, paint: (ctx, r) => box(ctx, r.x, r.y, r.w, r.h, '#8C5A3C') }));
  w.add(
    new Rig(x0, FL - 16, 14, 10, {
      layer: 3,
      cause: 'koh-billi',
      inset: 1,
      live: () => st.mode === 'run',
      tick: (r, w2) => {
        const p = w2.player;
        const lid = (w2.flags.koh8 as Pot).lid;
        const d = p.cx - (r.x + 7);
        if (st.mode === 'sit' && !lid && Math.abs(d) < 72) {
          st.mode = 'run';
          w2.sfx('snort', r.x, r.y);
        }
        if (st.mode === 'run') {
          r.y = Math.min(FL - 10, r.y + 2);
          r.x += Math.sign(d) * (200 / 120);
          if (Math.abs(d) > 140) st.mode = 'done';
        }
        r.s.mode = st.mode;
      },
      paint: (ctx, r, w2) => {
        ctx.fillStyle = '#9E9E9E';
        ctx.fillRect(r.x + 1, r.y + 3, 12, 6);
        ctx.fillRect(r.x + 10, r.y, 5, 5);
        ctx.fillStyle = '#616161';
        ctx.fillRect(r.x - 3 + ((w2.tick >> 4) % 2), r.y + 1, 5, 2);
        ctx.fillStyle = '#F2EFE4';
        ctx.fillRect(r.x + 11, r.y + 1, 1, 1);
        ctx.fillRect(r.x + 13, r.y + 1, 1, 1);
      },
    }),
  );
  return st;
}

export function room(): LevelDef {
  return {
    id: 'KOH-08',
    city: 'KOH',
    index: 8,
    name: 'Axone Handi',
    nameEn: 'The pot of axone',
    tagline: 'Carry the pot home. Mind the lid.',
    hint: 'You carry the axone pot. A jump knocks its lid off and the smell pours out; stand still half a second and the lid is back. No sign says who minds the smell: watch the animals. The lane dog and the crows keep off an open pot and go for a lidded one. The cat loves it, and runs at an open pot: lid it before her wall.',
    par: 40,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pot(w);
      dog(w, 12, 'koh8d');
      wire(w, 16, 21);
      crow(w, 17, 'koh8c1');
      crow(w, 20, 'koh8c2');
      cat(w, 26, 'koh8k');
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[2], 2.4);
          },
        }),
      );
      w.when(
        (w2) => w2.player.cx > px(3),
        (w2) => w2.guide(NPC.bhat),
      );
      sign(w, 2, 10.4, 3.4, 'AXONE', 'shop', null, 'the pot');
      rival(w, 29, 15, -1, taraScript(8));
      collectible(w, 'koh-axone', 23, 11.6);
      w.add(
        new Paint((ctx) => {
          folk(ctx, px(8), FL - 26, 26, '#E0B04A', { sack: '#8D5524' });
        }, -2),
      );
    },
  };
}

/** the lane: dog, cat, dog: open the pot, lid it, open it again */
export const actGalli: Act = {
  id: 'koh08-galli',
  w: 44,
  advice: 'A dog, then the cat on her wall, then another dog: the lid goes off for the first (a hop), on for the cat (stand still), and off again for the second. Give yourself the room to stand still before the wall.',
  cps: [26],
  build: (w, c) => {
    dog(w, c.x + 10, c.f('d1'));
    cat(w, c.x + 20, c.f('k'));
    dog(w, c.x + 36, c.f('d2'));
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.rasta),
    );
    sign(w, c.x + 2, 10.4, 3, 'GALLI', 'shop', null, 'the lane');
  },
};

/** the crows' wire runs over the cat's wall: the pot must stay lidded, so stop under each crow and let it miss */
export const actTaar: Act = {
  id: 'koh08-taar',
  w: 40,
  advice: 'The crows’ wire runs over the cat’s wall, so you cannot open the pot here. A crow dives at where a walker will be: stop under each one as it leaves the wire, let it land ahead of you, then walk on past the cat with the lid on.',
  cps: [],
  build: (w, c) => {
    wire(w, c.x + 10, c.x + 26);
    crow(w, c.x + 12, c.f('c1'));
    crow(w, c.x + 17, c.f('c2'));
    cat(w, c.x + 22, c.f('k'));
    crow(w, c.x + 25, c.f('c3'));
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.thik),
    );
    sign(w, c.x + 2, 10.4, 3, 'TAAR', 'shop', null, 'the wire');
  },
};

export const ending: Ending = {
  space: 12,
  advice: 'The kitchen door opens for the smell: it is shut to a lidded pot. Hop once before it, and walk in while the waft is up.',
  build(w, d) {
    w.flags.twist = 'kitchen-door';
    const shut = w.add(
      new Rig(d.x, FL - 32, 16, 32, {
        solid: true,
        layer: 3,
        tick: (r, w2) => {
          const st = w2.flags.koh8 as Pot;
          r.setSolid(st.lid);
          r.s.open = !st.lid;
        },
        paint: (ctx, r) => {
          if (r.s.open) return;
          box(ctx, r.x, r.y, r.w, r.h, '#5D4037');
          box(ctx, r.x + 11, r.y + 16, 2, 2, '#E0B04A');
        },
      }),
    );
    void shut;
    w.add(
      new Paint((ctx) => {
        folk(ctx, d.x + 30, FL - 26, 26, '#C0392B');
        box(ctx, d.x - 4, FL - 40, 24, 4, '#7A6A5A');
      }, -3),
    );
  },
};

export const meta08 = { family: 'carried-scent-repels', betrayals: ['scent-selective'], ending: 'koh-kitchen-door' };
