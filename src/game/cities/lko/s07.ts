// LKO-07 Hazratganj (the evening stroll), the marathon. Lucknow goes "ganjing" in the evening: an unhurried
// walk under the arcades. Rush, and the strollers close ranks to tut at you; stroll (pause now and then) and
// they part. But dusk brings down the awnings, and the lamplighter's ladder has to go somewhere.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { lock, tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act, ActCtx } from '../../levels/acts';
import { Art, Block, FLOOR, Zone, gent, on, px, type Ctx } from './kit';
import { tara } from './s02';

/** is Dad strolling (he has paused, even for a moment, in the last half second) or rushing? */
export function pace(w: World): () => boolean {
  const k = '__lkoPace';
  if (!w.flags[k]) {
    const st = { last: -999 };
    w.flags[k] = st;
    w.onTick((w2) => {
      if (Math.abs(w2.player.vx) < 20 && w2.player.onGround) st.last = w2.tick;
    });
  }
  const st = w.flags[k] as { last: number };
  return () => w.tick - st.last < 60;
}

const KURTA = ['#F2EEE4', '#C9A27E', '#5A8F7B', '#7A4E6E', '#E7D9C3'];

/** A knot of strollers on the pavement at column c (4 wide). Reach them rushing and they close ranks and
 *  shove you back, into the nala you just hopped; reach them strolling and they part. */
export function strollers(w: World, c: number, key: string, cause = 'lko-ganj', shove = -170) {
  const still = pace(w);
  const x0 = px(c);
  const S = { s: 'idle' as 'idle' | 'closed' | 'parted', t: 0, dy: 0 };
  w.flags[key] = S;
  const wall = w.add(new Block(x0, FLOOR - 30, px(4), 30, () => {}, 0));
  wall.set(false);
  w.add(
    new Art((ctx, w2) => {
      for (let i = 0; i < 4; i++) {
        const close = S.s === 'closed';
        const xx = x0 + 8 + i * 16 + (close ? (1.5 - i) * 3 : 0);
        const lift = S.s === 'parted' ? Math.min(1, (w2.tick - S.t) / 30) * (i % 2 ? -1 : 1) * 10 : 0;
        // parted: they step back into the arcade (drawn smaller, behind) or out to the kerb
        ctx.save();
        if (S.s === 'parted') ctx.globalAlpha = 0.55;
        gent(ctx, xx + lift * 0.6, FLOOR - (S.s === 'parted' && i % 2 ? 8 : 0), 25, KURTA[(i + c) % KURTA.length], { face: close ? -1 : ((i % 2) * 2 - 1) as 1 | -1, topi: i % 2 ? '#F5F0E6' : undefined, dupatta: i === 2 ? '#C2485B' : undefined });
        ctx.restore();
      }
    }, 3),
  );
  w.onTick((w2) => {
    const p = w2.player;
    if (S.s === 'closed' && w2.tick - S.t > 120) {
      S.s = 'idle';
      wall.set(false);
    }
    if (S.s !== 'idle') return;
    if (p.x + p.w > x0 - px(2.5) && p.x < x0) {
      S.t = w2.tick;
      if (still()) {
        S.s = 'parted';
        w2.say('Shukriya, aage chaliye. | Thank you, go ahead.', x0 + 32, FLOOR - 36, 2, 'npc');
      } else {
        S.s = 'closed';
        wall.set(true);
        w2.flags.shoveCause = cause;
        p.vx = shove;
        p.vy = -170;
        p.onGround = false;
        p.coyoteT = 0;
        p.launched = true;
        p.stun = 40;
        w2.say('Zehmat na kijiye. | Please don’t trouble yourself.', x0 + 32, FLOOR - 36, 2, 'npc');
        w2.sfx('thud', x0, FLOOR - 10);
      }
    }
  });
  return S;
}

/** an open nala (drain) across the pavement, columns [c0, c1]: fall in and that's the evening over */
export function nala(w: World, c0: number, c1: number, cause = 'lko-ganj') {
  const x0 = px(c0),
    x1 = px(c1 + 1);
  w.add(
    new Art((ctx) => {
      ctx.fillStyle = '#3B3A36';
      ctx.fillRect(x0, FLOOR, x1 - x0, 48);
      ctx.fillStyle = '#5B6B4E';
      ctx.fillRect(x0, FLOOR + 30, x1 - x0, 18);
    }, -4),
  );
  const z = w.add(new Zone(x0 + 1, FLOOR + 16, x1 - x0 - 2, 30, cause));
  w.onTick((w2) => {
    if (w2.flags.shoveCause) z.hazard.cause = w2.flags.shoveCause;
  });
  return z;
}

/** the cream colonnade of Hazratganj behind the pavement, columns [c0, c1] */
export function arcade(w: World, c0: number, c1: number) {
  w.add(
    new Art((ctx) => {
      const x0 = px(c0),
        x1 = px(c1 + 1);
      ctx.fillStyle = '#EFE3CC';
      ctx.fillRect(x0, FLOOR - 88, x1 - x0, 88);
      ctx.fillStyle = '#E0CFAE';
      for (let x = x0; x < x1; x += 48) {
        ctx.fillStyle = 'rgba(70,50,35,0.55)';
        ctx.beginPath();
        ctx.moveTo(x + 6, FLOOR);
        ctx.lineTo(x + 6, FLOOR - 50);
        ctx.quadraticCurveTo(x + 24, FLOOR - 72, x + 42, FLOOR - 50);
        ctx.lineTo(x + 42, FLOOR);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,214,140,0.25)';
        ctx.fillRect(x + 10, FLOOR - 40, 28, 36);
        ctx.fillStyle = '#D8C6A2';
        ctx.fillRect(x + 1, FLOOR - 88, 5, 88);
      }
      ctx.fillStyle = '#C9B48E';
      ctx.fillRect(x0, FLOOR - 92, x1 - x0, 5);
    }, -6),
  );
}

// ================================================================ the room
function ganjRoom(): LevelDef {
  return {
    id: 'LKO-07',
    city: 'LKO',
    index: 7,
    name: 'Hazratganj',
    nameEn: 'The evening stroll',
    tagline: 'Evening in Hazratganj: everyone is out ganjing, an unhurried walk under the arcades. Nobody here has ever been in a hurry.',
    hint: 'Hop the open nala, then mind your pace: reach the strollers rushing (no pause for half a second) and they close ranks and shove you back into the nala. Pause a moment before you reach them, and they part for you.',
    par: 14,
    map: Grid.ground(15).pit(9, 10).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      arcade(w, 0, 31);
      nala(w, 9, 10);
      strollers(w, 17, 'ganj1', 'lko-ganj', -210);
      sign(w, 2.2, 10.4, 4.2, 'HAZRATGANJ', 'shop', null, 'ganjing');
      rival(w, 3, 15, 1, tara(5));
      onPass(w, px(4), (w2) => w2.guide('Intezaar kis baat ka? | Waiting for what?', () => false));
      collectible(w, 'lko-kulfi', 9.5, 11.6);
    },
  };
}

// ================================================================ act 1: dusk, and the awnings come down
/** At dusk the shops let their awnings down. Most come down behind you once you are past. Two come down
 *  ahead of you, and each shivers on its rope first: the shivering one is next. Stop short of it until it is
 *  down, then walk over it. Running the row at full tilt takes you under it. */
const SHAAM = { early: [3, 7], warn: 6, shiver: 66, down: 40 };
export const shaam: Act = {
  id: 'lko07-shaam',
  cp0: false,
  cps: [-2],
  w: 54,
  advice: 'Dusk: the shops let their awnings down. Most come down behind you, but the one that shivers on its rope is next, and it may be ahead of you: stop short of it until it is down, then walk over it. Past the last awning the strollers are out under the lamps: once the awnings are behind you, don’t rush them.',
  paint: (g, c) => {
    g.pit(c.x + 42, c.x + 43);
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 45);
    const st = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(() => ({ t: -1, sh: -1 }));
    const shops = st.map((S, k) => {
      const x0 = c.X(2 + 4 * k);
      const z = w.add(
        new Zone(x0, FLOOR - 40, px(4), 40, 'lko-shamiyana', (ctx, zz, w2) => {
          const k2 = S.t < 0 ? 0 : Math.min(1, (w2.tick - S.t) / 12);
          // a shivering awning: it jerks on its rope and the rope shows slack
          const jig = S.sh >= 0 && S.t < 0 ? Math.sin(w2.tick * 1.4) * 1.6 : 0;
          ctx.fillStyle = k % 2 ? '#5A8F7B' : '#C2485B';
          ctx.fillRect(x0 + jig, FLOOR - 64 + k2 * 58 + Math.abs(jig), px(4), 6);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          for (let i = 0; i < 4; i++) ctx.fillRect(x0 + jig + 4 + i * 16, FLOOR - 58 + k2 * 58 + Math.abs(jig), 8, 2);
          if (jig) {
            // the shop boy at the crank, letting this one down next
            gent(ctx, x0 + 10, FLOOR, 17, '#E7D9C3', { face: 1, arms: 0.5 + 0.5 * Math.sin(w2.tick * 0.5), skin: '#9C6B48' });
            ctx.fillStyle = '#3E2F25';
            ctx.fillRect(x0 + 14, FLOOR - 22, 6, 2);
            ctx.strokeStyle = '#3E2F25';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x0 + 6, FLOOR - 88);
            ctx.quadraticCurveTo(x0 + 2 + jig * 2, FLOOR - 76, x0 + 6 + jig, FLOOR - 64);
            ctx.stroke();
          }
        }, 4),
      );
      z.on = false;
      return z;
    });
    w.flags[c.f('st')] = st;
    const drop = (w2: World, k: number) => {
      st[k].t = w2.tick;
      shops[k].on = true;
      w2.sfx('thud', shops[k].x + 32, FLOOR - 20);
    };
    w.onTick((w2) => {
      const p = w2.player;
      shops.forEach((z, k) => {
        const S = st[k];
        const x0 = c.X(2 + 4 * k);
        if (SHAAM.early.includes(k)) {
          if (S.sh < 0 && p.cx > x0 - px(SHAAM.warn)) S.sh = w2.tick;
          if (S.t < 0 && S.sh >= 0 && w2.tick - S.sh >= SHAAM.shiver) drop(w2, k);
        } else if (S.t < 0 && p.cx > x0 + px(5)) drop(w2, k);
        if (S.t >= 0 && w2.tick - S.t > (SHAAM.early.includes(k) ? SHAAM.down : 12)) z.on = false;
      });
    });
    // past the awnings: the evening strollers, and the drain they tut you back into if you rush them
    nala(w, x + 42, x + 43);
    strollers(w, x + 49, c.f('ganj'), 'lko-ganj', -210);
    sign(w, x + 0.2, 10.4, 3.2, 'SHAAM', 'shop', null, 'dusk');
  },
};

// ================================================================ act 2: the lamplighter
/** The lamplighter walks ahead carrying his ladder level, and at each lamp swings it up against the post:
 *  the swing sweeps the pavement just behind him. Hang back at the last lamp while it swings, then go
 *  under the leaning ladder while he's up, before he brings it down. */
class Lamplighter {
  x: number;
  s: 'walk' | 'swing' | 'up' | 'down' = 'walk';
  t = 0;
  i = 0;
  body: Block;
  sweep: Zone;
  constructor(
    w: World,
    x: number,
    readonly lamps: number[],
    readonly key: string,
  ) {
    this.x = x;
    this.body = w.add(new Block(x - 6, FLOOR - 28, 12, 28, () => {}, 0));
    this.body.set(lamps.length > 0);
    this.sweep = w.add(new Zone(x - 48, FLOOR - 30, 44, 30, 'lko-seedhi'));
    this.sweep.on = false;
    w.flags[key] = this;
    w.add(new Art((ctx, w2) => this.draw(ctx, w2), 3));
    w.onTick((w2) => this.tick(w2));
  }
  tick(w: World) {
    const age = w.tick - this.t;
    const set = (s: Lamplighter['s']) => {
      this.s = s;
      this.t = w.tick;
    };
    if (this.s === 'walk') {
      const L = this.lamps[this.i];
      if (L === undefined) {
        this.body.set(false);
      } else if (this.x < L - 6) this.x += 0.42;
      else set('swing');
    } else if (this.s === 'swing') {
      this.sweep.on = age > 10 && age < 50;
      this.sweep.hazard.cause = 'lko-seedhi';
      if (age >= 50) {
        this.sweep.on = false;
        this.body.set(false);
        set('up');
      }
    } else if (this.s === 'up') {
      if (age > 170) set('down');
    } else if (this.s === 'down') {
      this.sweep.on = age > 10 && age < 50;
      // bringing it down is its own mistake: you went under, then stayed there
      this.sweep.hazard.cause = 'lko-seedhi-utar';
      if (age >= 50) {
        this.sweep.on = false;
        this.body.set(true);
        this.i++;
        set('walk');
      }
    }
    this.body.solid.x = Math.round(this.x - 6);
    this.sweep.x = this.x - 48;
  }
  get done() {
    return this.i >= this.lamps.length && this.lamps.length > 0;
  }
  lit(i: number) {
    return this.i > i || (this.i === i && (this.s === 'up' || this.s === 'down'));
  }
  draw(ctx: Ctx, w: World) {
    const age = w.tick - this.t;
    // the ladder: carried level, swung up, leaning on the post, or coming down
    let ang = 0;
    if (this.s === 'swing') ang = Math.min(1, age / 40);
    else if (this.s === 'up') ang = 1;
    else if (this.s === 'down') ang = 1 - Math.min(1, age / 40);
    const a = (-Math.PI / 2.6) * ang;
    ctx.save();
    ctx.translate(this.x + 4, FLOOR - 18 + ang * 18);
    ctx.rotate(Math.PI + a * -1);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, -2, 52, 2);
    ctx.fillRect(0, 3, 52, 2);
    for (let k = 4; k < 52; k += 7) ctx.fillRect(k, -2, 1.5, 7);
    ctx.restore();
    const up = this.s === 'up';
    gent(ctx, this.x, up ? FLOOR - 34 : FLOOR, 25, '#6D5A48', { face: 1, arms: up ? 1 : 0.4, skin: '#9C6B48' });
  }
}
function lamp(w: World, x: number, ll: () => Lamplighter, i: number) {
  w.add(
    new Art((ctx, w2) => {
      ctx.fillStyle = '#2E2A26';
      ctx.fillRect(x - 1.5, FLOOR - 70, 3, 70);
      ctx.fillRect(x - 5, FLOOR - 74, 10, 4);
      const on = ll().lit(i);
      ctx.fillStyle = on ? '#FFD54F' : '#6B6357';
      ctx.fillRect(x - 3.5, FLOOR - 84, 7, 10);
      if (on) {
        const g = ctx.createRadialGradient(x, FLOOR - 79, 2, x, FLOOR - 79, 40);
        g.addColorStop(0, 'rgba(255,213,79,0.5)');
        g.addColorStop(1, 'rgba(255,213,79,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 40, FLOOR - 120, 80, 80);
      }
      void w2;
    }, -3),
  );
}
export const batti: Act = {
  id: 'lko07-batti',
  w: 58,
  advice: 'The lamplighter walks ahead with his ladder, and at each lamp swings it up: the swing sweeps the pavement behind him. Hang back while it swings; while he’s up the ladder, go under it and past; never be under it when he brings it down.',
  cps: [21.5, 40.5],
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 57);
    const l1 = new Lamplighter(w, c.X(4), [], c.f('ll1'));
    w.when(
      (w2) => w2.player.cx > c.X(0.5),
      () => {
        (l1 as { lamps: number[] }).lamps.push(c.X(9));
        l1.body.set(true);
      },
    );
    lamp(w, c.X(9) + 4, () => l1, 0);
    // the second one waits at the corner till you come along
    const l2 = new Lamplighter(w, c.X(22), [], c.f('ll2'));
    lamp(w, c.X(30) + 4, () => l2, 0);
    w.when(
      (w2) => w2.player.cx > c.X(14),
      () => {
        (l2 as { lamps: number[] }).lamps.push(c.X(30));
        l2.body.set(true);
      },
    );
    const l3 = new Lamplighter(w, c.X(44), [], c.f('ll3'));
    lamp(w, c.X(51) + 4, () => l3, 0);
    w.when(
      (w2) => w2.player.cx > c.X(36),
      () => {
        (l3 as { lamps: number[] }).lamps.push(c.X(51));
        l3.body.set(true);
      },
    );
    sign(w, x + 0.2, 10.4, 3.4, 'BATTI', 'shop', null, 'ganj');
  },
};

// ================================================================ act 3: the crowd under the awnings

// ================================================================ the door: the café's darban


// ================================================================ act 4: the julus, the slow procession
/** A slow group of strollers going your way, the whole length of the arcade, stepping over the open nalas.
 *  Walk behind them at their pace. Rush up and bump them, or hop a nala straight on to their heels, and the
 *  last one steps back and tuts you into the nala you just crossed. */
export const julus: Act = {
  id: 'lko07-julus',
  w: 58,
  advice: 'A slow group of strollers going your way, all down the arcade, stepping over the open nalas. Walk behind them at their pace, pausing as they do. Rush up and bump them, or hop a nala straight on to their heels, and the last one steps back and tuts you into the nala you just crossed. Wait at each nala till they’re well clear of it.',
  cps: [18, 28, 42],
  paint: (g, c) => {
    for (const n of JULUS_NALAS) g.pit(c.x + n, c.x + n + 1);
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 57);
    const strolling = pace(w);
    for (const n of JULUS_NALAS) nala(w, x + n, x + n + 1, n === JULUS_NALAS[JULUS_NALAS.length - 1] ? 'lko-julus-nala' : 'lko-julus');
    const G = { x: c.X(6), go: false, hop: 0, shoved: -999 };
    w.flags[c.f('g')] = G;
    const body = w.add(new Block(G.x, FLOOR - 28, 52, 28, () => {}, 0));
    w.add(
      new Art((ctx) => {
        if (G.x > c.X(52)) return;
        for (let i = 0; i < 4; i++) {
          const xx = G.x + 6 + i * 13;
          const over = JULUS_NALAS.some((n) => xx > c.X(n) - 4 && xx < c.X(n + 2) + 4);
          gent(ctx, xx, FLOOR - (over ? 6 : 0), 25, KURTA[i % KURTA.length], { face: 1, topi: i % 2 ? '#F5F0E6' : undefined, dupatta: i === 1 ? '#C2485B' : undefined });
        }
      }, 3),
    );
    w.onTick((w2) => {
      const p = w2.player;
      if (!G.go && p.cx > c.X(2)) G.go = true;
      // they stroll at a steady 45 px/s; across a nala they don't hurry
      if (G.go && G.x < c.X(64)) G.x += 0.375;
      body.solid.x = Math.round(G.x);
      // at the end of the arcade they turn off into a lane
      const gone = G.x > c.X(52);
      body.set(!gone);
      if (gone) return;
      // rush into them, or come down on their heels from a hop: the last one steps back and tuts
      const touch = p.x + p.w >= G.x - 1 && p.x < G.x + 4 && p.y + p.h > FLOOR - 30;
      if (touch && w2.tick - G.shoved > 60 && (!strolling() || !p.onGround)) {
        G.shoved = w2.tick;
        const back = [...JULUS_NALAS].reverse().map((n) => c.X(n) + 16).find((nx) => nx < p.x) ?? p.x - 40;
        w2.flags.shoveCause = 'lko-julus';
        p.vx = -Math.max(60, (p.x + 5 - back) / 0.27);
        p.vy = -170;
        p.onGround = false;
        p.coyoteT = 0;
        p.launched = true;
        p.stun = 40;
        w2.say('Zehmat na kijiye. | Please don’t trouble yourself.', G.x, FLOOR - 36, 2, 'npc');
      }
    });
    sign(w, x + 0.4, 10.4, 3.4, 'JULUS', 'shop', null, 'ganj');
  },
};
// four nalas, and the last one isn't where the rhythm says: it comes two steps early
const JULUS_NALAS = [12, 24, 36, 46];

export type PhotoPlan = { nala: number; wall: number; cam: number; period: number; flashes: [number, number][] };
/** a posing group (4 tiles at act column P.wall) and its photographer: solid, and shoving you back into the
 *  nala before it, except while his flash dazzles them */
export function photoGroup(w: World, c: ActCtx, P: PhotoPlan, k: number, key: string, still: () => boolean) {
  nala(w, c.x + P.nala, c.x + P.nala + 1, 'lko-nala');
  const S = { t0: -1, blind: 0, test: false };
  w.flags[key] = S;
  const ph = (w2: World) => (S.t0 < 0 ? -1 : (w2.tick - S.t0) % P.period);
  const wall = w.add(new Block(c.X(P.wall), FLOOR - 30, px(4), 30, () => {}, 0));
  const cam = c.X(P.cam) + 8;
  w.add(
    new Art((ctx, w2) => {
      const p = ph(w2);
      const fl = P.flashes.find(([a, d]) => p >= a && p < a + d);
      const up = p >= P.flashes[0][0] - 60;
      for (let i = 0; i < 4; i++) {
        gent(ctx, c.X(P.wall) + 8 + i * 16, FLOOR, 25, KURTA[(i + k + 1) % KURTA.length], { face: 1, arms: fl ? 1 : 0.3, topi: i % 2 ? '#F5F0E6' : undefined, dupatta: i === 1 ? '#C2485B' : undefined });
      }
      // the photographer under his black cloth, the box camera on its tripod
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(cam - 10, FLOOR - 22, 2, 22);
      ctx.fillRect(cam - 2, FLOOR - 22, 2, 22);
      ctx.fillStyle = '#212121';
      ctx.fillRect(cam - 14, FLOOR - (up ? 34 : 28), 14, 10);
      ctx.fillStyle = '#1B1B1B';
      ctx.fillRect(cam - 1, FLOOR - 32, 10, 18);
      gent(ctx, cam + 6, FLOOR, 25, '#3E3A36', { face: -1, arms: up ? 1 : 0 });
      if (fl) {
        ctx.fillStyle = `rgba(255,255,240,${p - fl[0] < 8 ? 0.75 : 0.18})`;
        ctx.fillRect(c.X(P.wall) - 40, FLOOR - 70, cam - c.X(P.wall) + 50, 70);
      }
    }, 3),
  );
  w.onTick((w2) => {
    const pl = w2.player;
    if (S.t0 < 0 && pl.cx > c.X(P.nala - 4)) S.t0 = w2.tick;
    const p = ph(w2);
    const fl = P.flashes.find(([a, d]) => p >= a && p < a + d);
    S.blind = fl ? fl[0] + fl[1] - p : 0;
    S.test = !!fl && fl[1] < 30;
    const inside = pl.x + pl.w > wall.x && pl.x < wall.x + px(4);
    // dazzled, they don't see you slip between them; they close up again behind you
    if (fl) wall.set(false);
    else if (!inside) wall.set(true);
    // caught among them when they can see again: shoved back out, the way you came
    const caught = !fl && inside && pl.y + pl.h > FLOOR - 30;
    const touch = caught || (wall.on && pl.x + pl.w >= wall.x - 1 && pl.x < wall.x && pl.y + pl.h > FLOOR - 30);
    if (touch && !pl.stun) {
      w2.flags.shoveCause = S.test || (P.flashes.length > 1 && p >= P.flashes[0][0] && p < P.flashes[1][0]) ? 'lko-photo-test' : still() ? 'lko-photo' : 'lko-photo-jaldi';
      if (caught) pl.x = wall.x - pl.w - 2;
      pl.vx = -180;
      pl.vy = -170;
      pl.onGround = false;
      pl.coyoteT = 0;
      pl.launched = true;
      pl.stun = 40;
      w2.sfx('thud', wall.x, FLOOR - 10);
    }
  });
  return S;
}

// ================================================================ act 5: photo, the group photograph
/** Outside the old studio a photographer takes the evening crowd's picture. A posing group doesn't part
 *  for a stroller (they won't spoil the photo) and closes ranks on a rusher, as everywhere on the Ganj.
 *  But when his flash goes they are dazzled for a moment: that is the moment to run through them. The
 *  second photographer fires a short test flash first: wait for the real one. */
const PHOTO: PhotoPlan[] = [
  { nala: 6, wall: 12, cam: 19, period: 420, flashes: [[230, 130]] },
  { nala: 20, wall: 25, cam: 31, period: 460, flashes: [[200, 14], [262, 130]] },
];
export const photo: Act = {
  id: 'lko07-photo',
  w: 34,
  advice: 'Outside the studio a photographer is taking the crowd’s picture, and a posing group won’t part for a stroller, or for a rusher. When his flash goes they are dazzled for a moment: run through them then. The second photographer fires a short test flash first: wait for the real one.',
  cps: [16.5],
  paint: (g, c) => {
    for (const p of PHOTO) g.pit(c.x + p.nala, c.x + p.nala + 1);
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 33);
    const still = pace(w);
    PHOTO.forEach((P, k) => photoGroup(w, c, P, k, c.f('g' + k), still));
    w.when((w2) => w2.player.cx > c.X(1), (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2));
    sign(w, x + 0.4, 10.4, 3.4, 'PHOTO', 'shop', null, 'studio');
  },
};

// ================================================================ act: dukaan, the window-shopper
/** A window-shopper gazes up at a shop window, and every so often steps back from the glass without looking.
 *  Pass on the window side, along the sill above him where he is looking, never on the open pavement behind
 *  him where he steps. And don't wait for him to finish: he won't, and the awning over the step will. */
export const dukaan: Act = {
  id: 'lko07-dukaan',
  w: 24,
  cp0: false,
  cps: [-4.5, 16.5],
  advice: 'A window-shopper gazes up at the shop window and steps back from the glass without looking. Pass on the window side: up on to the sill, along it over his head, and down past him. Never walk the pavement behind him, and don’t wait for him to finish.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 2, x + 3);
    g.fill(x + 5, x + 13, 13, 13, '=');
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 23);
    nala(w, x + 2, x + 3);
    const sx = c.X(9) + 8;
    let back = -99;
    w.add(
      new Art((ctx, w2) => {
        // the shop window over the sill, lit, with saris on show
        ctx.fillStyle = '#4A3A2C';
        ctx.fillRect(c.X(4), px(9), px(9), px(4));
        ctx.fillStyle = 'rgba(255,226,160,0.85)';
        ctx.fillRect(c.X(4) + 3, px(9) + 3, px(9) - 6, px(4) - 6);
        for (let k = 0; k < 4; k++) {
          ctx.fillStyle = ['#C2485B', '#5A8F7B', '#E8C547', '#7A4E6E'][k];
          ctx.fillRect(c.X(5) + k * 30, px(9) + 8, 10, px(4) - 14);
        }
        // him, gazing up at it; stepping back he leans out, arms behind
        const out = w2.tick - back < 24;
        gent(ctx, sx - (out ? 6 : 0), FLOOR, 25, '#C9A27E', { face: 1, arms: out ? 0.2 : 0.9, skin: '#A06B45' });
      }, 3),
    );
    w.onTick((w2) => {
      const p = w2.player;
      // on the pavement behind him he steps back into you, and you go back into the nala
      const behind = p.onGround && p.y + p.h >= FLOOR - 1 && p.cx > c.X(4) && p.cx < sx;
      if (behind && w2.tick - back > 60) {
        back = w2.tick;
        w2.flags.shoveCause = 'lko-dukaan';
        p.vx = -210;
        p.vy = -170;
        p.onGround = false;
        p.coyoteT = 0;
        p.launched = true;
        p.stun = 40;
        w2.say('Arre! | Oh!', sx, FLOOR - 36, 1.5, 'npc');
        w2.sfx('thud', sx, FLOOR - 10);
      }
    });
    // waiting on the shop step for him to finish: the awning over it shivers, and comes down
    const aw = { t: -1, sh: -1, still: 0 };
    const z = w.add(
      new Zone(c.X(0), FLOOR - 40, px(2), 40, 'lko-shamiyana', (ctx, _z, w2) => {
        const k2 = aw.t < 0 ? 0 : Math.min(1, (w2.tick - aw.t) / 12);
        const jig = aw.sh >= 0 && aw.t < 0 ? Math.sin(w2.tick * 1.4) * 1.6 : 0;
        ctx.fillStyle = '#5A8F7B';
        ctx.fillRect(c.X(0) + jig, FLOOR - 64 + k2 * 58 + Math.abs(jig), px(2), 6);
      }, 4),
    );
    z.on = false;
    w.onTick((w2) => {
      const p = w2.player;
      const onStep = p.onGround && p.cx > c.X(0) && p.cx < c.X(2) && Math.abs(p.vx) < 5;
      aw.still = onStep ? aw.still + 1 : 0;
      if (aw.sh < 0 && aw.still > 60) aw.sh = w2.tick;
      if (aw.sh >= 0 && aw.t < 0 && w2.tick - aw.sh >= 66) {
        aw.t = w2.tick;
        z.on = true;
      }
      if (aw.t >= 0 && w2.tick - aw.t > 24) z.on = false;
    });
    sign(w, x + 13.4, 10.4, 3.2, 'DUKAAN', 'shop', null, 'ganj');
  },
};

export const s07 = { room: ganjRoom, acts: [shaam, batti, julus, photo, dukaan] };
export const meta07 = { family: 'pace-sets-crowd-shape', betrayals: ['pace-crowd', 'ladder-block'], ending: 'lko-darban' } as StageMeta;
