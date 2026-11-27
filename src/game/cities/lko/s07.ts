// LKO-07 Hazratganj (the evening stroll), the marathon. Lucknow goes "ganjing" in the evening: an unhurried
// walk under the arcades. Rush, and the strollers close ranks to tut at you; stroll (pause now and then) and
// they part. But dusk brings down the awnings, and the lamplighter's ladder has to go somewhere.
import type { LevelDef, StageMeta, World } from '../../world';
import type { Ending } from '../../levels/endkit';
import { lock, tara as taraNow } from '../../levels/endkit';
import { collectible, door, rival, sign } from '../../levels/kit';
import { onPass } from '../../levels/trolls';
import { Grid } from '../../levels/grid';
import type { Act } from '../../levels/acts';
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
/** At dusk the shops let their awnings down one after another, from behind you: keep moving and you stay ahead. */
export const shaam: Act = {
  id: 'lko07-shaam',
  w: 46,
  advice: 'Dusk: the shops let their awnings down one after another, starting behind you, and a falling awning flattens a stroller. Here, don’t pause: run the row without stopping.',
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 45);
    const shops = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => {
      const x0 = c.X(2 + 4 * k);
      const z = w.add(
        new Zone(x0, FLOOR - 40, px(4), 40, 'lko-shamiyana', (ctx, zz, w2) => {
          const S = st[k];
          const k2 = S.t < 0 ? 0 : Math.min(1, (w2.tick - S.t) / 12);
          ctx.fillStyle = k % 2 ? '#5A8F7B' : '#C2485B';
          ctx.fillRect(x0, FLOOR - 64 + k2 * 58, px(4), 6);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          for (let i = 0; i < 4; i++) ctx.fillRect(x0 + 4 + i * 16, FLOOR - 58 + k2 * 58, 8, 2);
        }, 4),
      );
      z.on = false;
      return z;
    });
    const st = shops.map(() => ({ t: -1 }));
    let t0 = -1;
    w.flags[c.f('t0')] = () => t0;
    w.onTick((w2) => {
      if (t0 < 0 && w2.player.cx > c.X(1)) t0 = w2.tick;
      if (t0 < 0) return;
      shops.forEach((z, k) => {
        const at = t0 + Math.round((0.75 + 0.457 * k) * 120);
        if (w2.tick === at) {
          st[k].t = w2.tick;
          z.on = true;
          w2.sfx('thud', z.x + 32, FLOOR - 20);
        }
        if (st[k].t >= 0 && w2.tick - st[k].t > 12) z.on = false;
      });
    });
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
      if (age >= 50) {
        this.sweep.on = false;
        this.body.set(false);
        set('up');
      }
    } else if (this.s === 'up') {
      if (age > 170) set('down');
    } else if (this.s === 'down') {
      this.sweep.on = age > 10 && age < 50;
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
/** The strollers again, gathered under the awnings, and dusk again: stroll up so they part, then run, because
 *  the awnings over them come down as soon as they've stepped aside. */
export const chowk: Act = {
  id: 'lko07-chauraha',
  w: 32,
  advice: 'Strollers again, under the awnings: pause before you reach them so they part, then run through at once, because now the awnings over them come down behind them, one by one from where you came in.',
  cps: [29.5],
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 6);
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 31);
    nala(w, x + 5, x + 6);
    const S = strollers(w, x + 13, c.f('crowd'), 'lko-ganj', -210);
    const shops = [0, 1, 2, 3].map((k) => {
      const x0 = c.X(11 + 4 * k);
      const z = w.add(
        new Zone(x0, FLOOR - 40, px(4), 40, 'lko-shamiyana', (ctx, _z, w2) => {
          const t = st[k];
          const k2 = t < 0 ? 0 : Math.min(1, (w2.tick - t) / 12);
          ctx.fillStyle = k % 2 ? '#C2485B' : '#5A8F7B';
          ctx.fillRect(x0, FLOOR - 64 + k2 * 58, px(4), 6);
        }, 4),
      );
      z.on = false;
      return z;
    });
    const st = shops.map(() => -1);
    w.onTick((w2) => {
      if (S.s !== 'parted') return;
      shops.forEach((z, k) => {
        const at = S.t + Math.round((0.9 + 0.457 * k) * 120);
        if (w2.tick === at) {
          st[k] = w2.tick;
          z.on = true;
          w2.sfx('thud', z.x + 32, FLOOR - 20);
        }
        if (st[k] >= 0 && w2.tick - st[k] > 12) z.on = false;
      });
    });
    sign(w, x + 0.2, 10.4, 3.4, 'CHAURAHA', 'shop', null, 'ganj');
  },
};

// ================================================================ the door: the café's darban
/** The café door, with its darban. There's a nala in front of it: hop it, and land rushing, and he shuts
 *  the door in your face and shoves you back into it. Hop it early, pause, and stroll up: he holds it open. */
export const darban: Ending = {
  space: 14,
  advice: 'The café’s darban only holds the door for strollers. Hop the nala well before the door, pause a moment, then walk up: he opens it. Arrive straight off the hop, rushing, and he shoves you back into the nala.',
  paint: (g, D) => {
    g.pit(D - 8, D - 7);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    const strolling = pace(w);
    const L = lock(w, d, 'Zehmat na kijiye. | Please don’t trouble yourself.');
    nala(w, D - 8, D - 7);
    arcade(w, D - 14, D + 4);
    const S = { s: 'wait', t: 0 };
    w.flags.darban = S;
    w.flags.twist = 'shut';
    w.add(new Art((ctx) => gent(ctx, d.x - 6, FLOOR, 27, '#3E2723', { face: -1, topi: '#C2485B', arms: S.s === 'open' ? 1 : 0 }), 3));
    w.onTick((w2) => {
      const p = w2.player;
      if (S.s !== 'wait') return;
      if (p.onGround && p.x + p.w > px(D - 2.5) && p.x < px(D)) {
        if (strolling()) {
          S.s = 'open';
          L.unlock();
        } else {
          S.s = 'shoved';
          w2.flags.shoveCause = 'lko-darban';
          S.t = w2.tick;
          w2.after(1, () => {
            S.s = 'wait';
          });
          p.vx = -230;
          p.vy = -170;
          p.onGround = false;
          p.coyoteT = 0;
          p.launched = true;
          p.stun = 40;
          w2.flags.twist = 'shoved';
        }
      }
    });
    w.when(
      (w2) => w2.player.cx > px(D - 12),
      (w2) => taraNow(w2, 'Intezaar kis baat ka? | Waiting for what?', 2.2),
    );
  },
};


// ================================================================ act 4: the julus, the slow procession
/** A slow group of strollers going your way, the whole length of the arcade, stepping over the open nalas.
 *  Walk behind them at their pace. Rush up and bump them, or hop a nala straight on to their heels, and the
 *  last one steps back and tuts you into the nala you just crossed. */
export const julus: Act = {
  id: 'lko07-julus',
  w: 58,
  advice: 'A slow group of strollers going your way, all down the arcade, stepping over the open nalas. Walk behind them at their pace, pausing as they do. Rush up and bump them, or hop a nala straight on to their heels, and the last one steps back and tuts you into the nala you just crossed. Wait at each nala till they’re well clear of it.',
  cps: [18, 30.5, 42],
  paint: (g, c) => {
    for (const n of JULUS_NALAS) g.pit(c.x + n, c.x + n + 1);
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 57);
    const strolling = pace(w);
    for (const n of JULUS_NALAS) nala(w, x + n, x + n + 1, 'lko-julus');
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

// ================================================================ act 5: saamne, the procession coming the other way
/** Groups of strollers coming towards you down the arcade, a banner on a pole held high over them. They
 *  don't part for anyone coming the other way: they walk you back into the nala you crossed. Hopping over
 *  them puts you into the banner. Step up into the alcove in the arcade wall and let them pass under you. The last alcove's sill is
 *  cracked: wait in the one before while the last group passes too. */
const SAAMNE = [10, 26, 42];
export const saamne: Act = {
  id: 'lko07-saamne',
  w: 52,
  advice: 'Now the strollers come the other way, a banner on a pole held high over them, and they don’t part: they walk you back into the nala behind you. Hopping over them puts you in the banner. After each nala, step up into the alcove in the arcade wall and let them pass under you. The last alcove’s sill is cracked: the last group comes on straight after the one before, so wait in the second alcove till both have passed.',
  cps: [17.5, 26.2, 34],
  paint: (g, c) => {
    SAAMNE.forEach((a, k) => {
      g.pit(c.x + a - 6, c.x + a - 5);
      // the last alcove's sill is cracked: it's a block of its own (see build)
      if (k < SAAMNE.length - 1) g.fill(c.x + a, c.x + a + 1, 13, 13, '=');
    });
  },
  build: (w, c) => {
    const x = c.x;
    arcade(w, x, x + 51);
    SAAMNE.forEach((a, k) => {
      nala(w, x + a - 6, x + a - 5, 'lko-saamne');
      w.add(
        new Art((ctx) => {
          // the alcove: a niche in the colonnade with a stone sill
          ctx.fillStyle = 'rgba(70,50,35,0.55)';
          ctx.fillRect(c.X(a) - 2, px(13) - 34, 36, 34);
          ctx.fillStyle = '#D8C6A2';
          ctx.fillRect(c.X(a) - 3, px(13), 38, 4);
        }, -1),
      );
      const G = { x: c.X(a + 14), on: false, done: false };
      w.flags[c.f('g' + k)] = G;
      const body = w.add(new Block(G.x, FLOOR - 25, 44, 25, () => {}, 0));
      body.set(false);
      const banner = w.add(new Zone(G.x, px(11) + 2, 44, 10, 'lko-jhanda'));
      banner.on = false;
      w.add(
        new Art((ctx) => {
          if (!G.on) return;
          for (let i = 0; i < 3; i++) gent(ctx, G.x + 8 + i * 14, FLOOR, 25, KURTA[(i + k) % KURTA.length], { face: -1, topi: i % 2 ? '#F5F0E6' : undefined, arms: i === 1 ? 1 : 0 });
          ctx.fillStyle = '#C8A96B';
          ctx.fillRect(G.x + 21, px(11) + 2, 2, FLOOR - 25 - px(11));
          ctx.fillStyle = k % 2 ? '#5A8F7B' : '#C2485B';
          ctx.fillRect(G.x + 2, px(11) + 2, 40, 10);
          ctx.fillStyle = '#F5F1E8';
          ctx.fillRect(G.x + 6, px(11) + 6, 32, 2);
        }, 3),
      );
      w.onTick((w2) => {
        if (G.done) return;
        // the last group follows straight on after the one before: it's on its way while you shelter
        const prev = k > 0 ? (w2.flags[c.f('g' + (k - 1))] as { done: boolean }) : null;
        const due = k === SAAMNE.length - 1 ? !!prev?.done || w2.player.cx > c.X(a - 4) : w2.player.cx > c.X(a - 4);
        if (!G.on && due) {
          G.on = true;
          body.set(true);
          banner.on = true;
        }
        if (!G.on) return;
        body.move(w2, -0.42, 0);
        G.x = body.solid.x + body.solid.xr;
        banner.x = G.x;
        // they turn off into the lane before the nala
        if (G.x < c.X(a - 9)) {
          G.done = true;
          G.on = false;
          body.set(false);
          banner.on = false;
        }
      });
    });
    // the cracked sill of the last alcove: it gives way under you
    const la = SAAMNE[SAAMNE.length - 1];
    let stood = 0;
    const sill = w.add(
      new Block(c.X(la), px(13), 32, 4, (ctx, b) => {
        if (!b.on) return;
        ctx.fillStyle = '#D8C6A2';
        ctx.fillRect(b.x - 3, b.y, 38, 4);
        ctx.fillStyle = '#5A4632';
        ctx.fillRect(b.x + 12, b.y, 1.5, 4);
        ctx.fillRect(b.x + 20, b.y + 1, 1.2, 3);
      }, 1),
    );
    sill.solid.oneWay = true;
    w.flags[c.f('sill')] = sill;
    w.onTick((w2) => {
      if (!sill.on) return;
      stood = on(w2, sill.solid) ? stood + 1 : 0;
      if (stood > 20) {
        sill.set(false);
        w2.sfx('collapse', sill.x + 16, px(13));
      }
    });
    sign(w, x + 0.4, 10.4, 3.4, 'SAAMNE', 'shop', null, 'ganj');
  },
};

export const s07 = { room: ganjRoom, acts: [shaam, batti, julus, saamne, chowk] };
export const meta07 = { family: 'pace-sets-crowd-shape', betrayals: ['pace-crowd', 'ladder-block'], ending: 'lko-darban' } as StageMeta;
