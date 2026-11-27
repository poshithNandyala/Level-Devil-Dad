// LKO-05 Galouti (so soft it melts). Lucknow's galouti kebab is minced so fine it falls apart: on this tawa,
// a heap of them squashes flat under your weight and stays flat, and from a flat one your hop no longer
// reaches the seekh skewers hanging over the stall.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { Art, Block, FLOOR, Zone, gent, on, px, type Ctx } from './kit';
import { tara } from './s02';

const FULL = 20;
const FLAT = 4;

/** A heap of galouti on the tawa: FULL px tall; stand on it and it squashes to FLAT and stays. A flat one
 *  is thin: stand on it too long and the tawa's heat comes straight through. */
export class Galouti extends Block {
  stand = 0;
  flat = false;
  /** squashed by the piece behind it (the long slab) */
  force = false;
  hot = 0;
  constructor(
    x: number,
    readonly thin = false,
    readonly squash = 40,
    readonly burn = 120,
    wTiles = 1,
  ) {
    super(x, FLOOR - (thin ? FLAT : FULL), px(wTiles), thin ? FLAT : FULL, (ctx, b, w) => drawKebab(ctx, b as Galouti, w), 2);
    this.flat = thin;
  }
  update(w: World) {
    const here = on(w, this.solid);
    if (!this.flat) {
      this.stand = here ? this.stand + 1 : 0;
      if (this.stand > this.squash || this.force) {
        this.flat = true;
        // squash down: carries Dad with it
        const dy = this.solid.h - FLAT;
        this.solid.h = FLAT;
        this.move(w, 0, dy);
        w.sfx('thud', this.x + 8, this.y);
        w.emit('fx', this.x + 8, this.y, { kind: 'dust', w: this.solid.w });
      }
    } else {
      this.hot = here ? this.hot + 1 : Math.max(0, this.hot - 2);
      if (this.hot > this.burn) w.die('lko-tawa');
    }
  }
}
function drawKebab(ctx: Ctx, k: Galouti, w: World) {
  const { x, y } = k;
  const ww = k.solid.w,
    h = k.solid.h;
  if (!k.flat) {
    // a little heap of soft round kebabs, dark brown, glistening
    for (let i = 0; i < Math.max(1, ww / 16); i++) {
      const cx = x + 8 + i * 16;
      ctx.fillStyle = '#5D3420';
      ctx.beginPath();
      ctx.ellipse(cx, y + h - 5, 7.5, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6E3F25';
      ctx.beginPath();
      ctx.ellipse(cx - 1, y + h - 12, 6.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7B4A2C';
      ctx.beginPath();
      ctx.ellipse(cx, y + 5, 5.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,230,180,0.5)';
      ctx.fillRect(cx - 2, y + 2, 3, 1);
      if (k.stand > 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(cx - 5, y + h - 1, (10 * k.stand) / k.squash, 1);
      }
    }
  } else {
    // squashed flat: a thin dark patty, glowing as the heat comes through
    const g = Math.min(1, k.hot / k.burn);
    ctx.fillStyle = k.thin ? '#3E2116' : '#4E2A1A';
    ctx.fillRect(x, y, ww, h);
    ctx.fillStyle = `rgba(255,${120 - g * 60},40,${0.15 + g * 0.7})`;
    ctx.fillRect(x + 1, y + h - 2, ww - 2, 2);
    if (g > 0.3) {
      ctx.strokeStyle = `rgba(230,230,230,${g * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      const ph = (w.tick % 40) / 40;
      ctx.moveTo(x + ww / 2, y - 2 - ph * 6);
      ctx.quadraticCurveTo(x + ww / 2 + 3, y - 5 - ph * 6, x + ww / 2, y - 9 - ph * 6);
      ctx.stroke();
    }
  }
}

/** the hot iron tawa from column c0 to c1: touch it and you're cooked */
export function tawa(w: World, c0: number, c1: number) {
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx, w2) => {
      ctx.fillStyle = '#26211F';
      ctx.fillRect(x0, FLOOR - 2, x1 - x0, 8);
      ctx.fillStyle = 'rgba(255,120,40,0.35)';
      for (let x = x0 + ((w2.tick >> 2) % 7); x < x1 - 3; x += 7) ctx.fillRect(x, FLOOR + 6, 3, 2);
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(x0, FLOOR + 6, x1 - x0, 40);
      ctx.fillStyle = 'rgba(255,110,30,0.6)';
      for (let x = x0 + 4, k = 0; x < x1 - 4; x += 9, k++) ctx.fillRect(x, FLOOR + 10 + ((k * 5 + (w2.tick >> 3)) % 4), 4, 3);
    }, -2),
  );
  return w.add(new Zone(x0, FLOOR - 2, x1 - x0, 10, 'lko-tawa'));
}

/** the seekh rack hanging over the stall: skewers point down, their tips `low` px above the tawa */
export function seekhRack(w: World, c0: number, c1: number, low: number) {
  const x0 = px(c0),
    x1 = px(c1 + 1),
    tip = FLOOR - low;
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(x0 - 4, tip - 26, x1 - x0 + 8, 4);
      for (let x = x0 + 3; x < x1 - 2; x += 6) {
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(x, tip - 22, 1.4, 22);
        ctx.fillStyle = '#8D4A2B';
        ctx.fillRect(x - 1.5, tip - 18, 4.4, 9);
      }
      // the two posts holding it up
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(x0 - 6, tip - 26, 3, FLOOR - tip + 26);
      ctx.fillRect(x1 + 3, tip - 26, 3, FLOOR - tip + 26);
    }, 2),
  );
  return w.add(new Zone(x0, tip - 22, x1 - x0, 22, 'lko-seekh'));
}

// ================================================================ the room
function galoutiRoom(): LevelDef {
  return {
    id: 'LKO-05',
    city: 'LKO',
    index: 5,
    name: 'Galouti',
    nameEn: 'So soft it melts',
    tagline: 'Aminabad at lunchtime: galouti on the tawa, so soft it melts in your mouth, and the seekh rack hanging low over the stall.',
    hint: 'A hop off a full heap of galouti puts your head into the seekh skewers. Stand on a heap a moment and it squashes flat: from a flat one your hop passes under the skewers. Don’t stand on a flat one long, it’s thin and the tawa burns through. Squash, hop, squash, hop. Tap the jump, don’t hold it.',
    par: 22,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      tawa(w, 5, 25);
      seekhRack(w, 6, 22, 70);
      w.flags.kebabs = [6, 9, 12, 15, 18, 21, 24].map((c) => w.add(new Galouti(px(c))));
      w.add(new Art((ctx) => gent(ctx, px(28) + 8, FLOOR, 26, '#EDE6D8', { face: -1, topi: '#F5F0E6', skin: '#A06B45' }), 3));
      sign(w, 1.4, 10.4, 3.6, 'AMINABAD', 'shop', null, 'galouti');
      rival(w, 3, 15, 1, tara(3));
      onPass(w, px(28), (w2) => w2.say('Munh mein ghul jaayega! | It’ll melt in your mouth!', px(28) + 8, FLOOR - 34, 2.2, 'npc'));
      collectible(w, 'lko-galouti', 16.5, 12.2);
    },
  };
}

// ================================================================ act 1: thin ones and thick ones
/** Some heaps were squashed flat already by the last customer: they're thin from the start. Hop off a thin
 *  one at once; wait on a thick one till it squashes. */
const TAWA2 = 'FTFTTF';
export const tawa2: Act = {
  id: 'lko05-tawa',
  cp0: false,
  cps: [-2],
  w: 24,
  advice: 'Down the long tawa some kebabs are already flat, squashed by the last customer: they’re thin, and the heat comes through fast. Hop off a flat one at once; on a full heap, wait till it squashes, then hop.',
  build: (w, c) => {
    const x = c.x;
    tawa(w, x + 2, x + 19);
    seekhRack(w, x + 2, x + 19, 70);
    const plan: [number, boolean][] = [...TAWA2].map((k, i) => [x + 3 + 3 * i, k === 'T']);
    w.flags[c.f('kebabs')] = plan.map(([cc, thin]) => w.add(new Galouti(px(cc), thin, 40, thin ? 45 : 120)));
    sign(w, x + 0.2, 10.4, 3.2, 'TAWA', 'shop', null, 'aminabad');
  },
};

// ================================================================ act 2: the low lane
/** Under the lowest rack there's no hopping at all: one long slab of galouti mince. Stand at its start and
 *  it squashes flat from your feet forwards, a tile at a time: a lane low enough to walk under the skewers. */
export const lane: Act = {
  id: 'lko05-lane',
  cp0: false,
  w: 34,
  advice: 'Under the lowest rack there’s no room to hop: one long slab of galouti. Stand at its start and it squashes flat from your feet forwards, a tile at a time. Walk the flat lane right behind the squash, and don’t jump. Linger and the thin lane burns.',
  cps: [-2, 1.5],
  build: (w, c) => {
    const x = c.x;
    tawa(w, x + 3, x + 24);
    seekhRack(w, x + 5, x + 24, 30);
    // the slab: one tile per piece, the first one squashes when you stand on it, each squashes the next
    const pcs = Array.from({ length: 22 }, (_, i) => w.add(new Galouti(px(x + 3 + i), false, i === 0 ? 40 : 1e9, 150)));
    w.flags[c.f('slab')] = pcs;
    let wave = -1;
    w.onTick((w2) => {
      if (wave < 0 && pcs[0].flat) wave = w2.tick;
      if (wave < 0) return;
      const n = Math.floor((w2.tick - wave) / 14);
      for (let i = 1; i <= Math.min(n, pcs.length - 1); i++) if (!pcs[i].flat) pcs[i].force = true;
    });
    sign(w, x + 26, 10.4, 3.2, 'SEEKH', 'shop', null, 'jhuk ke');
  },
};

// ================================================================ act 3: ulta, the cook presses from his end
/** The same low rack over a long slab, but this time the cook presses it himself, from HIS end, with his
 *  big iron kafgir: the squash comes at you. Standing on the slab's end to squash it (as learned) puts you
 *  under his kafgir. Wait off the slab till he has pressed it all flat, then walk the lane. */
export const ulta: Act = {
  id: 'lko05-ulta',
  cp0: false,
  cps: [-2],
  w: 28,
  advice: 'Here the cook presses the slab himself, from his end, with his big iron kafgir: the squash comes at you. Don’t stand on the slab to squash it: wait on the ground before it till he has pressed it all flat and lifted his kafgir, then walk the lane.',
  build: (w, c) => {
    const x = c.x;
    tawa(w, x + 2, x + 23);
    seekhRack(w, x + 4, x + 23, 30);
    const pcs = Array.from({ length: 22 }, (_, i) => w.add(new Galouti(px(x + 2 + i), false, 1e9, 90)));
    const K = { t0: -1, i: pcs.length, done: false, kx: px(x + 24) + 8 };
    w.flags[c.f('slab')] = pcs;
    w.flags[c.f('k')] = K;
    // the kafgir: a broad iron blade riding the top of the slab at the squash front
    const blade = w.add(
      new Zone(K.kx - 4, FLOOR - 30, 8, 26, 'lko-kafgir', (ctx, z) => {
        if (!z.on) return;
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(z.x + 2, z.y - 30, 3, 32);
        ctx.fillStyle = '#90A4AE';
        ctx.fillRect(z.x - 2, z.y + 18, 12, 4);
        ctx.fillStyle = '#B0BEC5';
        ctx.fillRect(z.x - 2, z.y + 18, 12, 1);
      }, 3),
    );
    blade.on = false;
    w.add(new Art((ctx, w2) => gent(ctx, px(x + 25) + 8, FLOOR, 26, '#EDE6D8', { face: -1, topi: '#F5F0E6', skin: '#A06B45', arms: K.t0 >= 0 && !K.done ? 1 : 0 }), 3));
    w.onTick((w2) => {
      if (K.t0 < 0 && w2.player.cx > px(x + 1)) {
        K.t0 = w2.tick;
        blade.on = true;
      }
      if (K.t0 < 0 || K.done) return;
      const n = Math.floor((w2.tick - K.t0 - 40) / 14);
      while (K.i > 0 && pcs.length - K.i <= n) {
        K.i--;
        pcs[K.i].force = true;
      }
      blade.x = px(x + 2 + K.i) + 4;
      if (K.i === 0 && pcs[0].flat && w2.tick - K.t0 - 40 > 14 * (pcs.length + 2)) {
        K.done = true;
        blade.on = false;
      }
    });
    sign(w, x + 0.1, 10.4, 3.2, 'ULTA', 'shop', null, 'kafgir');
  },
};

// ================================================================ act 4: bhara, keep it full
/** Under a rack the cook keeps low (low enough to stand under on a full heap, too low to hop), the heaps
 *  stand in pairs. He hoists the rack now and then to turn the seekh: that's when you hop. Till then keep
 *  your heap full: step from one heap of the pair to the other, so neither squashes. A flat one drops you
 *  on to the thin patty, out of reach of the next. */
const BHARA = [3, 7];
export const bhara: Act = {
  id: 'lko05-bhara',
  cp0: false,
  cps: [-2],
  w: 14,
  advice: 'The cook keeps this rack low: you can stand under it on a full heap but not hop. Hop only when he hoists it to turn the seekh. Till then keep your heap full: step from one heap of the pair to the other so neither squashes. The last time he only half-hoists it: let that heap squash flat first, and hop from flat.',
  build: (w, c) => {
    const x = c.x;
    tawa(w, x + 2, x + 9);
    const R = { t0: -1, period: 230, up: 70, tip: 42 };
    w.flags[c.f('rack')] = R;
    const x0 = px(x + 1.5),
      x1 = px(x + 10.5);
    const z = w.add(new Zone(x0, FLOOR - R.tip - 22, x1 - x0, 22, 'lko-seekh'));
    const ph = (w2: World) => (R.t0 < 0 ? 0 : (w2.tick - R.t0) % R.period);
    w.flags[c.f('toLift')] = (w2: World) => (R.t0 < 0 ? 999 : R.period - R.up - ph(w2));
    w.flags[c.f('upNow')] = (w2: World) => {
      const p = ph(w2);
      return R.t0 >= 0 && p >= R.period - R.up ? R.period - p : 0;
    };
    w.add(
      new Art((ctx, w2) => {
        const tip = FLOOR - R.tip;
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(x0 - 6, FLOOR - 150, 3, 150);
        ctx.fillRect(x1 + 3, FLOOR - 150, 3, 150);
        ctx.strokeStyle = '#78909C';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0 - 4, FLOOR - 150);
        ctx.lineTo(x0 - 4, z.y - 4);
        ctx.stroke();
        // the shiver before he hoists it
        const p = ph(w2);
        const sh = R.t0 >= 0 && p > R.period - R.up - 30 && p < R.period - R.up ? ((w2.tick >> 1) % 2) * 2 - 1 : 0;
        const top = z.y - 4 + sh;
        ctx.fillStyle = '#4E342E';
        ctx.fillRect(x0 - 4, top, x1 - x0 + 8, 4);
        for (let xx = x0 + 3; xx < x1 - 2; xx += 6) {
          ctx.fillStyle = '#B0BEC5';
          ctx.fillRect(xx + sh, top + 4, 1.4, 22);
          ctx.fillStyle = '#8D4A2B';
          ctx.fillRect(xx - 1.5 + sh, top + 8, 4.4, 9);
        }
        void tip;
      }, 2),
    );
    const heaps = BHARA.flatMap((d) => [w.add(new Galouti(px(x + d), false, 75, 80)), w.add(new Galouti(px(x + d + 1), false, 75, 80))]);
    w.flags[c.f('kebabs')] = heaps;
    w.add(new Art((ctx, w2) => gent(ctx, px(x + 11) + 8, FLOOR, 26, '#EDE6D8', { face: -1, topi: '#F5F0E6', skin: '#A06B45', arms: (w2.flags[c.f('upNow')] as (w: World) => number)(w2) > 0 ? 1 : 0 }), 3));
    w.onTick((w2) => {
      if (R.t0 < 0 && w2.player.cx > px(x)) R.t0 = w2.tick;
      const up = (w2.flags[c.f('upNow')] as (w: World) => number)(w2) > 0;
      // the rack eases up and down (a few ticks), the deadly tips with it
      // the last time he only half-hoists it (his arm is tired): a hop off a full heap finds the skewers
      // again, and from a flat one it passes under, as at the start of the stall
      const half = w2.player.cx >= c.X(BHARA[BHARA.length - 1]);
      const want = FLOOR - (up ? (half ? 70 : 112) : R.tip) - 22;
      z.y += Math.sign(want - z.y) * Math.min(Math.abs(want - z.y), 9);
    });
    sign(w, x + 0.1, 10.4, 3.2, 'BHARA', 'shop', null, 'seekh');
  },
};

// ================================================================ the door: the sheermal in the tandoor
/** The door is beyond the baker's tandoor, too wide to jump. When you reach its edge he slaps a sheermal
 *  on to the tandoor's inside wall: a ledge, below the rim, for as long as the bread is raw. */
export const sheermal: Ending = {
  space: 12,
  advice: 'The tandoor is too wide to jump. When you stand at its rim the baker slaps a sheermal on to its inside wall: drop on to it, and hop out the far side before it bakes golden and peels off.',
  paint: (g, D) => {
    g.pit(D - 8, D - 3);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const S = { slapped: -1, peeled: false };
    w.flags.sheermal = S;
    w.flags.twist = 'tandoor';
    const x0 = px(D - 8),
      x1 = px(D - 2);
    w.add(new Zone(x0, FLOOR + 30, x1 - x0, 30, 'lko-tandoor'));
    const bread = w.add(
      new Block(px(D - 6), FLOOR + 14, 32, 5, (ctx, b, w2) => {
        if (!b.on) return;
        const age = S.slapped < 0 ? 0 : w2.tick - S.slapped;
        const k = Math.min(1, age / 300);
        ctx.fillStyle = `rgb(${240 - k * 40},${220 - k * 90},${170 - k * 120})`;
        ctx.beginPath();
        ctx.ellipse(b.x + 16, b.y + 2.5, 17, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(120,60,20,0.6)';
        for (let i = 0; i < 5; i++) ctx.fillRect(b.x + 4 + i * 6, b.y + 1, 1, 1);
      }, 2),
    );
    bread.set(false);
    w.add(
      new Art((ctx, w2) => {
        // the clay tandoor, sunk in the ground, glowing inside
        ctx.fillStyle = '#8D5524';
        ctx.fillRect(x0 - 4, FLOOR - 6, 6, 70);
        ctx.fillRect(x1 - 2, FLOOR - 6, 6, 70);
        const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR + 60);
        g.addColorStop(0, '#5D2E12');
        g.addColorStop(1, `rgba(255,${110 + ((w2.tick >> 3) % 3) * 20},30,1)`);
        ctx.fillStyle = g;
        ctx.fillRect(x0 + 2, FLOOR, x1 - x0 - 4, 60);
        gent(ctx, x1 + 14, FLOOR, 26, '#EDE6D8', { face: -1, arms: S.slapped >= 0 && w2.tick - S.slapped < 30 ? 1 : 0, skin: '#A06B45' });
      }, -3),
    );
    w.onTick((w2) => {
      const p = w2.player;
      if (S.slapped < 0 && p.onGround && p.cx > px(D - 10) && p.y + p.h >= FLOOR - 1) {
        S.slapped = w2.tick;
        bread.set(true);
        w2.sfx('thud', px(D - 5), FLOOR + 14);
        w2.flags.twist = 'slapped';
      }
      if (S.slapped >= 0 && !S.peeled && w2.tick - S.slapped > 300) {
        S.peeled = true;
        bread.set(false);
        w2.flags.twist = 'peeled';
      }
      if (S.peeled && w2.tick - S.slapped > 420) {
        // he slaps another
        S.peeled = false;
        S.slapped = w2.tick;
        bread.set(true);
        w2.flags.twist = 'slapped';
      }
    });
    w.when(
      (w2) => w2.player.cx > px(D - 12),
      (w2) => taraNow(w2, 'Shukriya, aage chaliye. | Thank you, go ahead.', 2.2),
    );
  },
};

// ================================================================ act 3: dum, the double heaps
/** At the end of the stall the heaps are piled two high. One squash takes the top kebab off: now it's a
 *  full heap, and a hop off it still finds the skewers. Wait for the second squash. */
export class DoubleGalouti extends Galouti {
  stage = 0;
  constructor(
    x: number,
    readonly extra = 1,
  ) {
    super(x, false, 40, 120, 2);
    this.lvl = extra > 1 ? 5 : 10;
    const dy = this.lvl * extra;
    this.solid.y -= dy;
    this.solid.h += dy;
  }
  lvl: number;
  draw(ctx: Ctx, w: World) {
    super.draw(ctx, w);
    // one little kebab on top for every squash still to come
    if (this.flat) return;
    for (let k = 0; k < this.extra - this.stage; k++) {
      ctx.fillStyle = k % 2 ? '#6E3F25' : '#5D3420';
      ctx.beginPath();
      ctx.ellipse(this.x + 10 + k * 12, this.y - 2, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  update(w: World) {
    if (this.stage < this.extra) {
      const here = on(w, this.solid);
      this.stand = here ? this.stand + 1 : 0;
      if (this.stand > this.squash) {
        // the top kebab squashes into the one below: a full heap (or still a double) again
        this.stage++;
        this.stand = 0;
        this.solid.h -= this.lvl;
        this.move(w, 0, this.lvl);
        w.sfx('thud', this.x + 8, this.y);
      }
      return;
    }
    super.update(w);
  }
}
const DUM = [3, 6, 9, 12, 15];
export const dum: Act = {
  id: 'lko05-dum',
  w: 22,
  advice: 'At the end of the stall the heaps are piled two high. One squash only takes the top kebab off, and a hop off a full heap still finds the skewers: wait for the second squash, then hop at once. The last heap is piled three high: count the squashes.',
  cp0: false,
  cps: [-2],
  build: (w, c) => {
    const x = c.x;
    tawa(w, x + 2, x + 17);
    const rack = seekhRack(w, x + 2, x + 17, 70);
    const ks: Galouti[] = DUM.map((d, i) => w.add(i === 0 ? new Galouti(px(x + d)) : new DoubleGalouti(px(x + d), i === DUM.length - 1 ? 2 : 1)));
    w.flags[c.f('kebabs')] = ks;
    // a hop off a piled heap that was squashed but not flat has its own line: one squash isn't enough here,
    // and on the last heap two aren't either
    let last: Galouti | null = null;
    w.onTick((w2) => {
      const k = ks.find((g) => on(w2, g.solid));
      if (k) last = k;
      const d = last instanceof DoubleGalouti ? last : null;
      rack.hazard.cause = d && d.stage > 0 && !d.flat ? (d.extra > 1 && d.stage >= d.extra ? 'lko-dum-teen' : 'lko-dum') : 'lko-seekh';
    });
    sign(w, x + 0.2, 10.4, 3.2, 'DUM', 'shop', null, 'galouti');
  },
};

export const s05 = { room: galoutiRoom, acts: [tawa2, lane, ulta, bhara, dum] };
export const meta05 = { family: 'flatten-platforms-build-low-lane', betrayals: ['flatten-lane'], ending: 'lko-sheermal' } as StageMeta;
