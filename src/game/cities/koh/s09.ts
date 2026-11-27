// KOH-09 Kisama Din (tough): festival day at the heritage village, five morungs along the yard, and every house has a
// floor rule that is the OPPOSITE of the one before. House 1 has a drum floor: a landing booms and a roof plank drops
// where you land, so walk, never jump. House 2 has a hearth across the floor: jump it. House 3's gate counts: be out in
// 1.4 s, so keep moving. House 4's floor is a long plank that tips under a steady walk: stop and let it settle, then go.
// House 5 is a drum floor before a hearth: both rules in one move, a long jump from the drum over the coals that lands on
// neither. The exit is the first house's back door; the front door is painted on. Architecture only: no rite, no dancer.
import type { LevelDef, World } from '../../world';
import type { Act } from '../../levels/acts';
import type { Ending } from '../../levels/endkit';
import { Paint, tara } from '../../levels/endkit';
import { Grid } from '../../levels/grid';
import { collectible, door, px, rival, sign } from '../../levels/kit';
import { Rig, box, folk } from './entities';
import { FL, since, taraScript } from './common';
import { lines as L, NPC } from './lines';

/** the morung's posts, gable and name over a house from column c0 to c1 */
function house(w: World, c0: number, c1: number, name: string, roofC = '#4E3B2A') {
  w.add(
    new Paint((ctx) => {
      const x0 = px(c0);
      const x1 = px(c1);
      box(ctx, x0, FL - 86, 5, 86, '#5D4037');
      box(ctx, x1 - 5, FL - 86, 5, 86, '#5D4037');
      ctx.fillStyle = roofC;
      ctx.beginPath();
      ctx.moveTo(x0 - 10, FL - 84);
      ctx.lineTo((x0 + x1) / 2, FL - 128);
      ctx.lineTo(x1 + 10, FL - 84);
      ctx.closePath();
      ctx.fill();
      // crossed gable ends (plain timber)
      box(ctx, (x0 + x1) / 2 - 1, FL - 134, 2, 10, '#5D4037');
      ctx.fillStyle = '#F2EFE4';
      ctx.font = '7px monospace';
      ctx.fillText(name, x0 + 8, FL - 90);
    }, -2),
  );
}

/** house 1: a drum floor over columns c0..c1: a LANDING on it booms, and a roof plank drops where you land */
export function drumFloor(w: World, c0: number, c1: number, key: string) {
  const x0 = px(c0);
  const x1 = px(c1);
  const st = { wasAir: false, boomT: -1 };
  w.flags[key] = st;
  w.onTick((w2) => {
    const p = w2.player;
    if (p.onGround && st.wasAir && p.cx > x0 && p.cx < x1) {
      st.boomT = w2.tick;
      w2.sfx('boom', p.cx, FL);
      w2.say('DHOOM! | DHOOM!', p.cx, FL - 30, 0.5, 'npc');
      // the plank: falls from the roof on to the spot, deadly on the way down
      // it comes down quick, a little ahead of the landing (a walker is under it too)
      const at = p.cx - 6 + Math.sign(p.vx) * 8;
      w2.add(
        new Rig(at, FL - 84, 28, 6, {
          layer: 3,
          cause: 'koh-takhta',
          inset: 0,
          live: (r) => r.y < FL - 8,
          tick: (r) => {
            if (r.y < FL - 6) r.y = Math.min(FL - 6, r.y + 640 / 120);
          },
          paint: (ctx, r) => {
            box(ctx, r.x, r.y, r.w, r.h, '#6D4C41');
            box(ctx, r.x, r.y, r.w, 1, '#A1887F');
          },
        }),
      );
    }
    st.wasAir = !p.onGround;
  });
  w.add(
    new Paint((ctx, w2) => {
      const shake = st.boomT >= 0 && since(w2, st.boomT) < 0.4 ? (w2.tick % 2 ? 1 : -1) : 0;
      box(ctx, x0, FL - 3 + shake, x1 - x0, 3, '#4E342E');
      for (let x = x0 + 6; x < x1 - 6; x += 12) box(ctx, x, FL - 2 + shake, 6, 1, '#8D6E63');
    }, -1),
  );
  return st;
}

/** house 2: a hearth of coals across the floor, columns c0..c1 (2 tiles): walk in and you burn */
export function hearth(w: World, c0: number, c1: number) {
  w.add(
    new Rig(px(c0) + 2, FL - 3, px(c1) - px(c0) - 4, 10, {
      layer: 1,
      cause: 'koh-aag',
      inset: 0,
      paint: (ctx, r, w2) => {
        box(ctx, r.x - 2, r.y, r.w + 4, 4, '#2B1A12');
        for (let x = r.x; x < r.x + r.w - 3; x += 5) {
          const hot = ((w2.tick >> 3) + x) % 3 === 0;
          box(ctx, x, r.y - 1, 3, 3, hot ? '#FF7043' : '#D84315');
        }
      },
    }),
  );
}

/** house 3: the gate counts: from your first step in (column c0) you have `limit` s before the exit bar at c1 drops */
export function gateHouse(w: World, c0: number, c1: number, key: string, limit = 1.4) {
  const st = { inT: -1, down: false };
  w.flags[key] = st;
  const gx = px(c1) - 10;
  w.add(
    new Rig(gx, FL - 80, 6, 44, {
      layer: 3,
      cause: 'koh-phatak',
      inset: 0,
      live: () => st.down,
      tick: (r, w2) => {
        const p = w2.player;
        if (st.inT < 0 && p.cx > px(c0) && p.cx < px(c1)) st.inT = w2.tick;
        if (st.inT >= 0 && !st.down && since(w2, st.inT) >= limit) {
          st.down = true;
          w2.sfx('thud', gx, FL);
        }
        if (st.down) r.y = Math.min(FL - 44, r.y + 500 / 120);
        r.s.left = st.inT < 0 ? limit : Math.max(0, limit - since(w2, st.inT));
      },
      paint: (ctx, r) => {
        box(ctx, r.x, r.y, r.w, r.h, '#C9B870');
        box(ctx, r.x, r.y, r.w, 2, '#E6D898');
        // the count: notches that go out as time runs
        const left = r.s.left ?? limit;
        for (let i = 0; i < 4; i++) box(ctx, r.x - 10 + i * 4, FL - 90, 3, 3, left > (i + 1) * (limit / 4) ? '#E0B04A' : '#5D4037');
      },
    }),
  );
  return st;
}

/** house 4: a long plank floor, columns c0..c1: a steady walk of `tip` s tips it into the pit; standing still lets it settle */
export function plankFloor(w: World, c0: number, c1: number, key: string, tip = 0.55) {
  const x0 = px(c0);
  const x1 = px(c1);
  const st = { walk: 0, still: 0, tilt: 0 };
  w.flags[key] = st;
  w.onTick((w2) => {
    const p = w2.player;
    const on = p.onGround && p.cx > x0 && p.cx < x1;
    if (on && Math.abs(p.vx) > 10) {
      st.walk += 1 / 120;
      st.still = 0;
      if (st.walk > tip * 0.55 && (w2.tick & 15) === 0) w2.sfx('creak', p.cx, FL - 10);
    } else if (on) {
      st.still += 1 / 120;
      if (st.still > 0.2) st.walk = Math.max(0, st.walk - 2 / 120);
    } else st.walk = Math.max(0, st.walk - 1 / 120);
    st.tilt = Math.min(1, st.walk / tip);
    if (on && st.walk >= tip) {
      w2.sfx('collapse', p.cx, FL);
      w2.die('koh-jhukav');
    }
  });
  w.add(
    new Paint((ctx) => {
      const t = st.tilt;
      ctx.fillStyle = '#A1887F';
      ctx.beginPath();
      ctx.moveTo(x0, FL - 3 + t * 2);
      ctx.lineTo(x1, FL - 3 - t * 6);
      ctx.lineTo(x1, FL - t * 6);
      ctx.lineTo(x0, FL + t * 2);
      ctx.closePath();
      ctx.fill();
      box(ctx, (x0 + x1) / 2 - 3, FL - 1, 6, 8, '#5D4037');
    }, -1),
  );
  return st;
}

export function room(): LevelDef {
  return {
    id: 'KOH-09',
    city: 'KOH',
    index: 9,
    name: 'Kisama Din',
    nameEn: 'Festival day',
    tagline: 'Five houses. Each one undoes the last.',
    hint: 'Every house has its own floor rule, and each is the opposite of the one before. The first has a drum floor: a landing booms and a roof plank drops where you land, so walk it, never jump. The second has a hearth across the floor: jump it, from the drum floor’s edge, and land beyond the coals.',
    par: 40,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      house(w, 6, 15, 'DHOL');
      drumFloor(w, 6, 15, 'koh9d');
      house(w, 15, 24, 'CHULHA', '#5A4332');
      hearth(w, 15.5, 17.5);
      w.add(
        new Rig(px(3), 0, 1, 1, {
          paint: () => {},
          tick: (_r, w2) => {
            if (w2.tick === 1) tara(w2, L.taunt[0], 2.4);
          },
        }),
      );
      w.when(
        (w2) => w2.player.cx > px(3),
        (w2) => w2.guide(NPC.kewhi),
      );
      sign(w, 2, 10.4, 3.4, 'KISAMA', 'shop', null, 'five houses');
      rival(w, 28, 15, -1, taraScript(9));
      collectible(w, 'koh-smoked-pork', 20, 11.6);
    },
  };
}

/** houses 3 and 4: the gate that counts (keep moving) and the plank that tips under a steady walk (stop and go) */
export const actTeen: Act = {
  id: 'koh09-teen',
  w: 30,
  advice: 'The third house’s gate counts: from your first step in you have a breath and a half before the exit bar drops, so keep moving. The fourth is the opposite: its floor is one long plank that tips under a steady walk. Walk a little, stand still until the creak stops, walk again.',
  cps: [],
  build: (w, c) => {
    house(w, c.x + 6, c.x + 15, 'PHATAK', '#4E3B2A');
    gateHouse(w, c.x + 6, c.x + 15, c.f('g'));
    house(w, c.x + 17, c.x + 27, 'TAKHTA', '#5A4332');
    plankFloor(w, c.x + 17, c.x + 27, c.f('p'));
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.thik),
    );
    sign(w, c.x + 2, 10.4, 3, 'TEEN CHAR', 'shop', null, 'houses 3, 4');
  },
};

/** house 5: a drum floor right up to a hearth: both rules in one move */
export const actPaanch: Act = {
  id: 'koh09-paanch',
  w: 24,
  advice: 'The fifth house uses both of the first two: a drum floor runs right up to a hearth. Walk the drum, and from its last plank make one long jump that lands past the coals: a landing on the drum drops a plank, a short one is the fire.',
  cps: [],
  build: (w, c) => {
    house(w, c.x + 6, c.x + 20, 'PAANCH', '#4E3B2A');
    drumFloor(w, c.x + 6, c.x + 13, c.f('d'));
    hearth(w, c.x + 13, c.x + 16);
    w.when(
      (w2) => w2.player.cx > px(c.x + 3),
      (w2) => w2.guide(NPC.loghat),
    );
    sign(w, c.x + 2, 10.4, 3, 'PAANCH', 'shop', null, 'house 5');
  },
};

export const ending: Ending = {
  space: 12,
  advice: 'The way out is the first house’s back door, round behind the yard. The grand front door is painted on the wall: walk past it to the plain one behind.',
  build(w, d) {
    w.flags.twist = 'back-door';
    w.add(
      new Paint((ctx) => {
        // the painted front door, 5 tiles before the real one
        const fx = d.x - 80;
        box(ctx, fx - 2, FL - 36, 20, 36, '#7A1F16');
        box(ctx, fx, FL - 34, 16, 34, '#C0392B');
        box(ctx, fx + 11, FL - 18, 2, 2, '#E0B04A');
        box(ctx, fx - 6, FL - 42, 28, 6, '#4E3B2A');
        folk(ctx, d.x + 30, FL - 26, 26, '#1B1B1B');
      }, -3),
    );
  },
};

export const meta09 = { family: 'five-houses-opposite-rules', betrayals: ['rule-flip-per-room'], ending: 'koh-back-door' };
