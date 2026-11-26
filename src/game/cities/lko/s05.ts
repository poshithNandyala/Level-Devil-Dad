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
const TAWA2 = 'FTFTTFTFFTFTTFFT';
const tawa2: Act = {
  id: 'lko05-tawa',
  w: 54,
  advice: 'Down the long tawa some kebabs are already flat, squashed by the last customer: they’re thin, and the heat comes through fast. Hop off a flat one at once; on a full heap, wait till it squashes, then hop.',
  build: (w, c) => {
    const x = c.x;
    tawa(w, x + 2, x + 49);
    seekhRack(w, x + 2, x + 49, 70);
    const plan: [number, boolean][] = [...TAWA2].map((k, i) => [x + 3 + 3 * i, k === 'T']);
    w.flags[c.f('kebabs')] = plan.map(([cc, thin]) => w.add(new Galouti(px(cc), thin, 40, thin ? 45 : 120)));
    sign(w, x + 0.2, 10.4, 3.2, 'TAWA', 'shop', null, 'aminabad');
  },
};

// ================================================================ act 2: the low lane
/** Under the lowest rack there's no hopping at all: one long slab of galouti mince. Stand at its start and
 *  it squashes flat from your feet forwards, a tile at a time: a lane low enough to walk under the skewers. */
const lane: Act = {
  id: 'lko05-lane',
  w: 34,
  advice: 'Under the lowest rack there’s no room to hop: one long slab of galouti. Stand at its start and it squashes flat from your feet forwards, a tile at a time. Walk the flat lane right behind the squash, and don’t jump. Linger and the thin lane burns.',
  cps: [1.5],
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

export const s05 = { room: galoutiRoom, acts: [tawa2, lane] };
export const meta05 = { family: 'flatten-platforms-build-low-lane', betrayals: ['flatten-lane'], ending: 'lko-sheermal' } as StageMeta;
