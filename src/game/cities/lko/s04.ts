// LKO-04 Makhan Malai (winter foam). In the old city, milk is whipped on winter nights and set out under the
// sky; by dawn it's a cloud of foam, sold before the sun climbs. Here every heap of malai is half in the low
// sun and half in its own long shadow: the side the light hits goes soft, and sinks under you.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
import { Art, Block, FLOOR, Zone, gent, on, px, type Ctx } from './kit';
import { tara } from './s02';

/** where the light comes from, seen by one heap: 'R' = from the right (its right tile is lit), 'L', or null (all in shade) */
export type Light = 'L' | 'R' | null;

/** A heap of malai on a tray on a post: two tiles. The tile facing the light goes soft: stand on that tile
 *  alone for a moment and it sinks. The other tile is in the heap's own shadow and holds. */
export class Heap {
  t: Block[];
  soft = [0, 0];
  constructor(
    w: World,
    readonly x: number,
    readonly y: number,
    readonly light: (w: World) => Light,
    readonly tiles = 2,
  ) {
    const mk = (i: number) => w.add(new Block(x + i * 16, y, 16, 8, (ctx, b, w2) => this.paint(ctx, b, i, w2), 2));
    const a = mk(0);
    this.t = [a, tiles > 1 ? mk(1) : a];
    // the post and the tray
    w.add(
      new Art((ctx) => {
        ctx.fillStyle = '#6D4C33';
        ctx.fillRect(x + tiles * 8 - 2, y + 8, 4, FLOOR + 48 - y);
        ctx.fillStyle = '#9E9E9E';
        ctx.fillRect(x - 1, y + 7, tiles * 16 + 2, 2);
      }, -3),
    );
    w.onTick((w2) => this.tick(w2));
  }
  /** which tile index is lit now (-1: none) */
  litIndex(w: World) {
    const l = this.light(w);
    if (!l) return -1;
    if (this.tiles === 1) return 0;
    return l === 'R' ? 1 : 0;
  }
  tick(w: World) {
    const li = this.litIndex(w);
    for (let i = 0; i < 2; i++) {
      const b = this.t[i];
      if (!b.on) continue;
      const other = this.t[1 - i];
      const alone = on(w, b.solid) && (other === b || !other.on || !on(w, other.solid));
      if (i === li && alone) this.soft[i]++;
      else this.soft[i] = Math.max(0, this.soft[i] - 1);
      if (this.soft[i] > 9) {
        b.set(false);
        w.sfx('splash', b.x + 8, b.y);
        w.emit('fx', b.x + 8, b.y, { kind: 'poof', w: 16, h: 8 });
      }
    }
  }
  paint(ctx: Ctx, b: Block, i: number, w: World) {
    if (!b.on) return;
    const lit = this.litIndex(w) === i;
    const { x, y } = b;
    // a soft cloud of foam: cold blue-white in shade, warm cream in the sun (steaming)
    ctx.fillStyle = lit ? '#FFE7B0' : '#EEF3FA';
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.quadraticCurveTo(x + 2, y - 1, x + 8, y);
    ctx.quadraticCurveTo(x + 14, y - 1, x + 16, y + 8);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = lit ? '#F3B94E' : 'rgba(150,170,205,0.55)';
    ctx.fillRect(x + (lit ? (this.light(w) === 'R' ? 13 : 0) : 6), y + 2, lit ? 3 : 4, 1);
    if (lit && this.soft[i] > 0) ctx.fillRect(x + 4, y + 6 - this.soft[i] * 0.3, 8, 1);
    if (lit) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 0.8;
      const ph = (w.tick % 60) / 60;
      ctx.beginPath();
      ctx.moveTo(x + 8, y - 2 - ph * 6);
      ctx.quadraticCurveTo(x + 10, y - 5 - ph * 6, x + 8, y - 8 - ph * 6);
      ctx.stroke();
    }
  }
}

/** long dawn shadows: each heap throws a long blue shadow away from the light, along the pit wall */
export function shadows(w: World, heaps: Heap[]) {
  w.add(
    new Art((ctx, w2) => {
      for (const h of heaps) {
        const l = h.light(w2);
        if (!l) continue;
        const x0 = h.x,
          x1 = h.x + h.tiles * 16;
        ctx.fillStyle = 'rgba(40,60,110,0.22)';
        ctx.beginPath();
        if (l === 'R') {
          ctx.moveTo(x1, h.y);
          ctx.lineTo(x0, h.y);
          ctx.lineTo(x0 - 70, h.y + 26);
          ctx.lineTo(x1 - 60, h.y + 26);
        } else {
          ctx.moveTo(x0, h.y);
          ctx.lineTo(x1, h.y);
          ctx.lineTo(x1 + 70, h.y + 26);
          ctx.lineTo(x0 + 60, h.y + 26);
        }
        ctx.fill();
      }
    }, -4),
  );
}

/** the pit under the heaps: a wide iron karahi of simmering milk */
export function karahi(w: World, c0: number, c1: number) {
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx, w2) => {
      ctx.fillStyle = '#2B2422';
      ctx.fillRect(x0, FLOOR + 14, x1 - x0, 40);
      ctx.fillStyle = '#F4EFE3';
      ctx.fillRect(x0 + 2, FLOOR + 16, x1 - x0 - 4, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      for (let k = 0; k < (x1 - x0) / 12; k++) {
        const ph = (w2.tick * 0.01 + k * 0.37) % 1;
        ctx.beginPath();
        ctx.arc(x0 + 6 + ((k * 37) % (x1 - x0 - 10)), FLOOR + 18 - ph * 3, 1 + ph, 0, Math.PI * 2);
        ctx.fill();
      }
    }, -5),
  );
  return w.add(new Zone(x0, FLOOR + 16, x1 - x0, 40, 'lko-malai'));
}

/** the low sun, a red-gold disc at the end of the lane, and its warm haze */
function sun(w: World, x: number, y: number) {
  w.add(
    new Art((ctx) => {
      const g = ctx.createRadialGradient(x, y, 2, x, y, 60);
      g.addColorStop(0, 'rgba(255,214,140,0.9)');
      g.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - 60, y - 60, 120, 120);
      ctx.fillStyle = '#FFB74D';
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
    }, -6),
  );
}

// ================================================================ the room
function malaiRoom(): LevelDef {
  return {
    id: 'LKO-04',
    city: 'LKO',
    index: 4,
    name: 'Makhan Malai',
    nameEn: 'Winter foam',
    tagline: 'Dawn in Chowk. Makhan malai, whipped all night under the sky, sold before the sun gets up. The sun is getting up.',
    hint: 'The low sun comes from one side. On every heap of malai the tile facing it is warm and soft: stand on that tile alone and it sinks. The tile in the heap’s own long shadow holds. When the halwai lifts his shiny lid, the light comes from the other side: move to the other tile.',
    par: 16,
    map: Grid.ground(15).pit(6, 26).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      sun(w, px(31), px(9));
      const S = { lid: 0, at: -1 };
      w.flags.malai = S;
      const light = () => (S.lid >= 1 ? 'L' : 'R') as Light;
      const kz = karahi(w, 6, 26);
      const heaps = [6, 9, 12, 15, 18, 21, 24].map((c, k) => new Heap(w, px(c), k % 2 ? px(14) : px(13), light));
      shadows(w, heaps);
      // the halwai with his big polished lid, at the far end: lifted, it throws the sun back the other way
      w.add(
        new Art((ctx, w2) => {
          const hx = px(28) + 8;
          gent(ctx, hx, FLOOR, 26, '#EDE6D8', { face: -1, arms: S.lid, skin: '#A06B45' });
          const ly = FLOOR - 18 - S.lid * 22;
          ctx.fillStyle = '#C8CDD2';
          ctx.beginPath();
          ctx.ellipse(hx - 7, ly, 3 + S.lid * 2, 11, 0, 0, Math.PI * 2);
          ctx.fill();
          if (S.lid >= 1 && (w2.tick >> 3) % 2) {
            ctx.fillStyle = 'rgba(255,240,200,0.8)';
            ctx.fillRect(hx - 9, ly - 4, 2, 8);
          }
        }, 3),
      );
      w.onTick((w2) => {
        const p = w2.player;
        if (S.at < 0 && on(w2, heaps[2].t[0].solid) || (S.at < 0 && on(w2, heaps[2].t[1].solid))) S.at = w2.tick;
        if (S.at >= 0 && w2.tick - S.at > 50 && S.lid < 1) {
          S.lid = Math.min(1, S.lid + 1 / 60);
          if (S.lid >= 1) {
            w2.sfx('blink', px(28), FLOOR - 40);
            w2.flags.twistRoom = 'flipped';
            kz.hazard.cause = 'lko-dhakkan';
          }
        }
        void p;
      });
      sign(w, 2.4, 10.4, 3.4, 'CHOWK', 'shop', null, 'makhan malai');
      rival(w, 3, 15, 1, tara(2));
      onPass(w, px(4), (w2) => w2.guide('Bas zara sa! | Just a little!', (w3) => w3.player.cx < px(6)));
      collectible(w, 'lko-malai', 19, 10.4);
    },
  };
}

// ================================================================ the act: long shadows in the lane
/** Single cups of malai (one tile, no shady side of their own) sit in the lane. The only shade a single
 *  cup has is the long shadow of a tall stack of kulhads to its right; the shadows grow shorter as the sun
 *  climbs, so the cups at the far end of each shadow go warm first. */
const kulhadStack = (w: World, c: number, rows: number) => {
  const x = px(c),
    top = FLOOR - rows * 16;
  w.add(
    new Block(x, top, 16, FLOOR - top, (ctx, b) => {
      for (let k = 0; k < rows * 2; k++) {
        ctx.fillStyle = k % 2 ? '#A0522D' : '#B5653A';
        ctx.fillRect(b.x + 1 + (k % 2), b.y + k * 8, 14 - 2 * (k % 2), 8);
      }
    }, 1),
  );
};
const gali: Act = {
  id: 'lko04-chowk',
  w: 36,
  advice: 'Single cups of malai have no shady side: the only shade they get is the long shadow of the tall stack of kulhads beyond them, and as the sun climbs those shadows get shorter. Hop only on cups inside a shadow, and don’t wait about: the cup at the far tip of a shadow goes warm first.',
  cps: [14.5],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 13).pit(c.x + 19, c.x + 30);
  },
  build: (w, c) => {
    const x = c.x;
    const t0 = [-1, -1];
    // shadow length in tiles, per stack: a tile shorter every 1.6 s once you reach its lane
    const len = (w2: World, s: number) => (t0[s] < 0 ? sets[s][1] : Math.max(1, sets[s][1] - Math.floor((w2.tick - t0[s]) / 192)));
    const sets: [number, number, number[], number][] = [
      [x + 14, 11, [x + 4, x + 6, x + 9, x + 12], x + 2],
      [x + 31, 12, [x + 20, x + 22, x + 25, x + 28], x + 18],
    ];
    w.onTick((w2) => {
      sets.forEach((st, s) => {
        if (t0[s] < 0 && w2.player.cx > px(st[3])) t0[s] = w2.tick;
      });
    });
    const all: Heap[] = [];
    sets.forEach(([sc, , cups], s) => {
      kulhadStack(w, sc, 2);
      for (const cc of cups) {
        const hp = new Heap(w, px(cc), px(13), (w2) => (sc - cc <= len(w2, s) ? null : 'R'), 1);
        all.push(hp);
      }
      w.add(
        new Art((ctx, w2) => {
          // the stack's long shadow on the lane
          const L = len(w2, s);
          ctx.fillStyle = 'rgba(40,60,110,0.2)';
          ctx.fillRect(px(sc) - px(L), px(13) - 6, px(L), FLOOR - px(13) + 40);
        }, -4),
      );
      karahi(w, sc - (s === 0 ? 11 : 12), sc - 1);
    });
    w.flags[c.f('len')] = len;
    sign(w, x + 0.2, 10.4, 3.2, 'KULHAD', 'shop', null, 'chowk');
  },
};

// ================================================================ the door: the bhatti behind you
/** Two foam steps up to the halwai's counter, where the door is. As you come up, the halwai stokes his
 *  bhatti behind you: now the light comes from the left, and the left tile of each step goes soft. */
export const kulhad: Ending = {
  space: 12,
  advice: 'Two steps of malai up to the counter. As you get close, the halwai stokes his bhatti behind you: the fire lights the steps from the left, so the left tile of each step goes soft. Land on the right-hand tiles and climb to the door.',
  paint: (g, D) => {
    g.put(D, 14, '.');
    g.pit(D - 7, D - 2);
    g.fill(D - 1, D + 3, 11, 14, '#');
    g.put(D, 10, 'E');
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const S = { fire: 0 };
    w.flags.twist = 'sun';
    const light = () => (S.fire ? 'L' : 'R') as Light;
    karahi(w, D - 7, D - 2);
    const steps = [new Heap(w, px(D - 6), px(13), light), new Heap(w, px(D - 3), px(12), light)];
    shadows(w, steps);
    w.flags.kulhad = { steps, S };
    w.add(
      new Art((ctx, w2) => {
        // the bhatti on the left, glowing when stoked
        const bx = px(D - 10);
        ctx.fillStyle = '#6D4C41';
        ctx.fillRect(bx, FLOOR - 20, 22, 20);
        ctx.fillStyle = S.fire ? `rgba(255,${120 + ((w2.tick >> 2) % 3) * 30},40,0.95)` : '#3E2723';
        ctx.fillRect(bx + 6, FLOOR - 14, 10, 8);
        if (S.fire) {
          const g = ctx.createRadialGradient(bx + 11, FLOOR - 10, 2, bx + 11, FLOOR - 10, 90);
          g.addColorStop(0, 'rgba(255,150,60,0.35)');
          g.addColorStop(1, 'rgba(255,150,60,0)');
          ctx.fillStyle = g;
          ctx.fillRect(bx - 80, FLOOR - 100, 180, 110);
        }
      }, -3),
    );
    w.onTick((w2) => {
      if (!S.fire && w2.player.cx > px(D - 8) && w2.player.onGround) {
        S.fire = 1;
        w2.flags.twist = 'fire';
        w2.sfx('whoosh', px(D - 10), FLOOR - 10);
      }
    });
    w.when(
      (w2) => w2.player.cx > px(D - 11),
      (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2),
    );
  },
};

// ================================================================ act 2: badal, a cloud over the sun
/** A winter cloud drifts across the low sun, and its shadow slides along the lane. Single cups have no
 *  shady side: inside the cloud's shadow every cup holds, outside it every cup is in the sun. Go with the
 *  shadow, cup to cup: not ahead of it, not behind it. */
const BADAL = [4, 6.5, 9, 11.5, 18.5, 21, 23.5, 26, 28.5];
export const badal: Act = {
  id: 'lko04-badal',
  w: 35,
  advice: 'A winter cloud drifts over the sun and its shadow slides along the lane. These single cups have no shady side: inside the cloud’s shadow every cup holds, outside it every cup is in the sun and sinks under you. Wait for the shadow to reach you, then go cup to cup with it, never ahead of it, never left behind. Halfway there is a stone chabutra: if the shadow leaves you, wait there for the next cloud.',
  cp0: false,
  cps: [-2, 13.6, 31.3],
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 12);
    g.fill(c.x + 13, c.x + 17, 13, 17, '#');
    g.pit(c.x + 18, c.x + 30);
  },
  build: (w, c) => {
    const x = c.x;
    const B = { x: c.X(1), go: false, w: 88 };
    w.flags[c.f('cloud')] = B;
    const inShade = (cx: number) => cx > B.x - B.w / 2 && cx < B.x + B.w / 2;
    const kz = karahi(w, x + 3, x + 12);
    const kz2 = karahi(w, x + 18, x + 30);
    BADAL.forEach((d) => new Heap(w, Math.round(c.X(d)), px(13), () => (inShade(c.X(d) + 8) ? null : 'R'), 1));
    w.onTick((w2) => {
      if (!B.go && w2.player.cx > c.X(1.5)) B.go = true;
      if (B.go && B.x < c.X(40)) B.x += 0.3;
      // left far behind (waiting on the chabutra): the next cloud drifts in from behind you
      if (B.go && B.x - B.w / 2 > w2.player.cx + 140) B.x = w2.player.cx - B.w / 2 - 50;
      // ahead of the shadow, or left behind by it: two ways to sink, two lessons
      kz.hazard.cause = kz2.hazard.cause = w2.player.cx > B.x ? 'lko-badal' : 'lko-badal-peeche';
    });
    w.add(
      new Art((ctx) => {
        // the cloud high up, and its soft blue shadow on the lane
        ctx.fillStyle = 'rgba(245,245,250,0.85)';
        for (const [dx, dy, r] of [
          [-24, 0, 14],
          [0, -6, 18],
          [24, 0, 14],
        ])
          ctx.beginPath(), ctx.arc(B.x + dx, px(5) + dy, r, 0, Math.PI * 2), ctx.fill();
        ctx.fillStyle = 'rgba(40,60,110,0.22)';
        ctx.fillRect(B.x - B.w / 2, px(12), B.w, FLOOR - px(12) + 30);
      }, -3),
    );
    sign(w, x + 0.2, 10.4, 3.2, 'BADAL', 'shop', null, 'chowk');
  },
};

export const s04 = { room: malaiRoom, acts: [gali, badal] };
export const meta04 = { family: 'sun-direction-sinks-foam', betrayals: ['light-sinks'], ending: 'lko-kulhad' } as StageMeta;
