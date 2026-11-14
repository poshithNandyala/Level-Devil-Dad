// Goa (Panaji): gossip you can stand on, a football, a siesta you mustn't break, the toddy tapper's
// ropes, the casino boat's roulette, parasailing off Miramar and King Momo's carnival.
import { Entity, type Hazard, type LevelDef, type World } from '../world';
import { Solid } from '../body';
import { LINES } from '../cities';
import { collectible, door, prop, px, rival, sign } from './kit';
import { DT } from '../constants';
import type { Act } from './acts';
import { aunty, bubbleArt } from './westkit';
import { text } from './endkit';
import { Football, Parade, Parasail, Rope, Roulette, Sleeper, Snag, footballer, goalArt, palmArt, type Bet } from '../entities/goa';
import { pool } from './acts';
import { RIVER } from './endkit';
import { group } from './kit';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';

const TAUNTS = LINES.PNJ.taunt;
const G = 15;

// ================================================================== PNJ-02: Fontainhas gossip
export interface GossipOpts {
  /** where each bubble starts (its top-left), and how it drifts (px/s) */
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  /** a new line every `every` s (from `phase`), each lasting `life` s */
  every: number;
  life: number;
  phase?: number;
  lines: string[];
  /** which lines are sharp remarks (thorny, deadly, not something to stand on) */
  sharp?: (i: number) => boolean;
  w?: number;
}

/** An aunty on her balcony. Everything she says floats off as a bubble you can stand on, for a while. */
export class Gossip extends Entity {
  solids: Solid[] = [];
  /** per slot: the bubble it shows (-1 none), and where (for the thorny ones, which aren't solid) */
  private shown: number[] = [];
  private pos: { x: number; y: number; on: boolean; sharp: boolean; i: number; age: number }[] = [];
  hazard: Hazard;
  readonly bw: number;
  constructor(
    readonly ax: number,
    readonly feet: number,
    readonly face: 1 | -1,
    readonly dress: string,
    readonly o: GossipOpts,
  ) {
    super();
    this.layer = 2;
    this.bw = o.w ?? 40;
    const n = Math.ceil(o.life / o.every) + 1;
    for (let i = 0; i < n; i++) {
      const s = new Solid(-999, -999, this.bw, 10);
      s.oneWay = true;
      s.collidable = false;
      this.solids.push(s);
      this.shown.push(-1);
      this.pos.push({ x: -999, y: -999, on: false, sharp: false, i: -1, age: 0 });
    }
    const self = this;
    this.hazard = {
      active: true,
      cause: 'gossip',
      hits: (x, y, w, h) => self.pos.some((q) => q.on && q.sharp && x < q.x + self.bw - 2 && x + w > q.x + 2 && y < q.y + 10 && y + h > q.y),
    };
  }
  /** bubbles alive now, for the tests: left x, top y, sharp? (and its age) */
  get live() {
    return this.pos.filter((q) => q.on);
  }
  update(w: World) {
    const o = this.o;
    const t = w.tick * DT - (o.phase ?? 0);
    const n = this.solids.length;
    const last = Math.floor(t / o.every);
    for (let s = 0; s < n; s++) {
      const i = last - ((((last - s) % n) + n) % n);
      const age = t - i * o.every;
      const sol = this.solids[s];
      const q = this.pos[s];
      const alive = i >= 0 && age >= 0 && age < o.life;
      if (!alive) {
        if (q.on && !q.sharp) w.sfx('pop', q.x + this.bw / 2, q.y);
        q.on = false;
        sol.collidable = false;
        sol.velX = 0;
        this.shown[s] = -1;
        continue;
      }
      const sharp = !!o.sharp?.(i);
      const tx = o.sx + o.vx * age,
        ty = o.sy + o.vy * age;
      if (this.shown[s] !== i) {
        this.shown[s] = i;
        sol.place(tx, ty);
        sol.collidable = !sharp;
        if (i === last && age < DT * 1.5) w.sfx(sharp ? 'gasp' : 'chant', this.ax, this.feet - 24);
      } else sol.moveBy(w, tx - (sol.x + sol.xr), ty - (sol.y + sol.yr));
      sol.velX = sharp ? 0 : o.vx;
      Object.assign(q, { x: tx, y: ty, on: true, sharp, i, age });
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const o = this.o;
    const t = w.tick * DT;
    const talking = this.pos.some((q) => q.on && q.age < 0.5);
    aunty(ctx, this.ax, this.feet, this.face, this.dress, talking && Math.floor(t * 10) % 2 === 0, t);
    for (const q of this.pos) if (q.on) bubbleArt(ctx, q.x, q.y, this.bw, 10, o.lines[q.i % o.lines.length], q.sharp, this.ax, q.age / o.life);
  }
}

/** a balcão: the little stoop with its built-in seats, the heart of every Goan house front */
function balcao(w: World, tx0: number, tx1: number, ty: number, wall: string) {
  w.add(
    new (class extends Entity {
      layer = -4;
      draw(ctx: CanvasRenderingContext2D) {
        const x0 = px(tx0),
          x1 = px(tx1 + 1),
          y = px(ty);
        ctx.fillStyle = wall;
        ctx.fillRect(x0, y - 40, x1 - x0, 40);
        ctx.fillStyle = '#FBF8F2';
        ctx.fillRect(x0, y - 40, x1 - x0, 3);
        ctx.fillRect(x0, y - 4, x1 - x0, 4);
        for (let x = x0 + 3; x < x1 - 3; x += 6) ctx.fillRect(x, y - 12, 1.4, 8);
        ctx.fillRect(x0, y - 13, x1 - x0, 1.6);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(x0 + 4, y - 34, 8, 18);
      }
    })(),
  );
}

const GOSSIP_A = ['Kitem?', 'Ani?', 'Khorench?', 'Bai bai!', 'Aikolem?', 'Hai deva!'];
const GOSSIP_B = ['Fott!', 'Ho?', 'Chhi!', 'Bai!', 'Uff!', 'Ai!'];

function gossipRoom(): LevelDef {
  return {
    id: 'PNJ-02',
    city: 'PNJ',
    index: 2,
    name: 'Fontainhas Gossip',
    nameEn: 'The Latin Quarter talks',
    tagline: 'Every house has a balcony. Every balcony has an aunty.',
    hint: 'Everything the aunty says floats up as a bubble you can stand on, for a few seconds. Climb her gossip over the house.',
    par: 9,
    map: Grid.ground(15).fill(3, 6, 13, 14, '#').fill(13, 18, 6, 14, '#').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      balcao(w, 3, 6, 13, '#F6C343');
      w.add(new Gossip(px(5) + 4, px(13), 1, '#7E57C2', { sx: px(7), sy: 200, vx: 10, vy: -22, every: 1.8, life: 5, lines: GOSSIP_A }));
      sign(w, 8, 10.4, 4.2, 'RUA 31 DE JANEIRO', 'azulejo', null, 'Fontainhas');
      prop(w, 'lamp', 21, 15);
      rival(w, 10, 15, -1, { intro: LINES.PNJ.intro[0], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[0] });
      onPass(w, px(6), (w2) => w2.guide('Aunty bolta, tum chodd! | Aunty talks, you climb!'));
      collectible(w, 'poi', 16, 4.4);
    },
  };
}

/** PNJ-02 act: across the lane, riding her bubble to the other balcony. The other aunty answers back,
 *  and some of her answers are sharp: hop those. The polite ones float through you. */
const gossipLane: Act = {
  id: 'pnj02-lane',
  w: 34,
  advice: 'Ride the near aunty’s bubble across the lane. The far aunty answers back: hop her sharp (red, thorny) replies; the plain ones float through you, but don’t land on them.',
  cps: [3],
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 0, x + 1, 13, 14, '#').fill(x + 2, x + 4, 11, 14, '#');
    g.pit(x + 5, x + 23);
    g.fill(x + 24, x + 26, 9, 14, '#').fill(x + 27, x + 28, 11, 14, '#').fill(x + 29, x + 30, 13, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    balcao(w, c.x + 2, c.x + 4, 11, '#3F8FD2');
    balcao(w, c.x + 24, c.x + 26, 9, '#5DAE5B');
    const a = w.add(new Gossip(X(3) + 6, px(11), 1, '#E57373', { sx: X(5) + 2, sy: 160, vx: 46, vy: -4, every: 2.6, life: 6, lines: GOSSIP_A }));
    const b = w.add(
      new Gossip(X(25) + 8, px(9), -1, '#4DB6AC', { sx: X(21) + 14, sy: 130, vx: -46, vy: 4, every: 2.6, life: 6, phase: 1.3, lines: GOSSIP_B, sharp: (i) => i % 2 === 0, w: 26 }),
    );
    w.flags.lane = { a, b };
    sign(w, c.x + 9, 4.2, 5, 'TRAVESSA', 'azulejo', null, 'gossip lane');
    onPass(w, X(1), (w2) => w2.guide('Aunty-chea bolar chodd, polle tea dusrea aunty-k! | Ride her words across, and watch the other aunty!'));
  },
};


// ================================================================== PNJ-03: football
/** a ball and a goal with a gate behind its net: score and the gate lifts */
function goalGate(w: World, ball: Football, x0: number, x1: number, gate: string, onGoal?: (w: World) => void) {
  const g = group(w, gate);
  // the back of the net, drawn as a net
  g.paint = { fill: 'rgba(240,244,248,0.55)', trim: '#FAFAFA', line: 'rgba(120,130,140,0.6)' };
  ball.goals.push({
    x: x0,
    y: px(11),
    w: x1 - x0,
    h: px(4),
    fn: (w2) => {
      w2.sfx('win', (x0 + x1) / 2, px(11));
      w2.emit('fx', (x0 + x1) / 2, px(12), { kind: 'confetti' });
      w2.say('GOAL! Viva! | GOAL! Hooray!', (x0 + x1) / 2, px(9), 1.6, 'npc');
      g.slide(w2, 0, -5, 0.6);
      w2.flags.goals = (w2.flags.goals ?? 0) + 1;
      onGoal?.(w2);
    },
  });
  w.add(
    new (class extends Entity {
      layer = -3;
      draw(ctx: CanvasRenderingContext2D) {
        goalArt(ctx, x0, x1, px(11), px(15));
      }
    })(),
  );
  return g;
}

/** three defenders shoulder to shoulder: a wall nobody gets a ball along the ground through */
class Defenders extends Entity {
  solid: Solid;
  constructor(x: number) {
    super();
    this.layer = 1;
    this.solid = new Solid(x, px(G) - 32, 28, 32);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    const b = Math.sin(w.tick * DT * 3) * 0.04;
    for (let i = 0; i < 3; i++) footballer(ctx, s.x + 5 + i * 9, s.y + 32, 31, i === 1 ? '#C62828' : '#D32F2F', { arms: 'cross', lean: b * (i - 1) });
  }
}

function goalRoom(): LevelDef {
  return {
    id: 'PNJ-03',
    city: 'PNJ',
    index: 3,
    name: 'Goal!',
    nameEn: 'Goa plays football',
    tagline: 'In Goa the football always gets there first.',
    hint: 'Run into the ball to kick it. Score and the net behind the goal lifts out of your way.',
    par: 6,
    map: Grid.ground(15).fill(22, 25, 10, 10, '#').fill(26, 26, 10, 14, 'a').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      const ball = w.add(new Football(px(8), px(G) - 10));
      w.flags.ball = ball;
      goalGate(w, ball, px(22), px(26), 'a');
      sign(w, 4, 10.4, 4, 'CAMPAL', 'azulejo', null, 'football ground');
      prop(w, 'lamp', 14, 15);
      rival(w, 12, 15, -1, { intro: 'Bol mar, Dad! Goal kor! | Kick the ball, Dad! Score!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[1] });
      collectible(w, 'poi', 24, 8.6);
    },
  };
}

/** PNJ-03 act: a wall of defenders between the ball and the goal. Along the ground it bounces back;
 *  meet it in the air (a volley) and it sails over them. */
const freeKick: Act = {
  id: 'pnj03-wall',
  w: 34,
  advice: 'A wall of defenders blocks the ground. Jump just as you reach the ball: kicked in the air it flies over them and into the goal.',
  paint: (g, c) => {
    g.fill(c.x + 20, c.x + 23, 10, 10, '#').fill(c.x + 24, c.x + 24, 10, 14, c.L[0]);
  },
  build: (w, c) => {
    const { X } = c;
    const ball = w.add(new Football(X(4), px(G) - 10));
    w.flags.kick = ball;
    w.add(new Defenders(X(10)));
    goalGate(w, ball, X(20), X(24), c.L[0]);
    sign(w, c.x + 1, 10.4, 4, 'FREE KICK', 'azulejo', null, 'over the wall');
    onPass(w, X(1), (w2) => w2.guide('Bhitt asa, Dad! Bol varsun mar! | There’s a wall, Dad! Kick it over!'));
  },
};


// ================================================================== PNJ-04: susegad (the siesta)
const sleeper = (w: World, x: number, feet: number, r: number, kind: Sleeper['kind']) => w.add(new Sleeper(x, feet, r, kind));

function siestaRoom(): LevelDef {
  return {
    id: 'PNJ-04',
    city: 'PNJ',
    index: 4,
    name: 'Susegad',
    nameEn: 'The afternoon siesta',
    tagline: 'From one to four, Goa sleeps. Including the dogs.',
    hint: 'It’s siesta time. Walk past the sleepers, but never land inside the dotted ring around one: the thud wakes them. A short hop lands short.',
    par: 5,
    map: Grid.ground(15).fill(18, 18, 14, 14, '#').pit(22, 23).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      sleeper(w, px(12) + 8, px(G), 40, 'dog');
      sleeper(w, px(27) + 8, px(G), 28, 'cat');
      sign(w, 4, 10.4, 4.6, 'SILENCIO', 'azulejo', null, '1 to 4 pm');
      prop(w, 'lamp', 20, 15);
      rival(w, 7, 15, -1, { intro: LINES.PNJ.intro[1], point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[0] });
      onPass(w, px(8), (w2) => w2.guide('Hoch, Dad! Uddi marun denvlo zalear sunno uttta! | Shh, Dad! Land with a thud and the dog wakes up!'));
      collectible(w, 'poi', 18, 11.6);
    },
  };
}

/** PNJ-04 act: the whole street asleep, and the church clock creeping towards four, when siesta ends
 *  and everyone wakes anyway. Long jumps over some rings, short hops in front of others. */
const siestaStreet: Act = {
  id: 'pnj04-street',
  w: 36,
  advice: 'The street sleeps until the clock strikes four. Clear the cat’s ring with a long jump, stop short of the others with a short hop, and be past the last pothole before four.',
  paint: (g, c) => {
    g.pit(c.x + 8, c.x + 9).fill(c.x + 14, c.x + 14, 14, 14, '#').pit(c.x + 26, c.x + 27);
  },
  build: (w, c) => {
    const { X } = c;
    const zs = [sleeper(w, X(4) + 8, px(G), 40, 'dog'), sleeper(w, X(14) + 8, px(14), 30, 'cat'), sleeper(w, X(22) + 8, px(G), 44, 'dog'), sleeper(w, X(31) + 8, px(G), 24, 'uncle')];
    let t0 = -1;
    const LIMIT = 9;
    w.flags.siesta = { left: LIMIT };
    onPass(w, X(1), (w2) => {
      t0 = w2.tick;
      w2.guide('Char vazta paslean sogllo vaddo uttta! | At four the whole street wakes up!');
    });
    w.onTick((w2) => {
      if (t0 < 0) return;
      const left = LIMIT - (w2.tick - t0) * DT;
      w2.flags.siesta.left = left;
      if (left <= 0 && !w2.flags.siesta.over) {
        w2.flags.siesta.over = true;
        w2.sfx('dong', X(18), px(4));
        w2.say('Dong! Dong! Dong! Dong!', X(18), px(4), 1.6, 'npc');
        for (const z of zs) z.wake(w2);
      }
    });
    // the church clock: a minute a second, from 3:51
    w.add(
      new (class extends Entity {
        layer = -5;
        draw(ctx: CanvasRenderingContext2D) {
          const cx = X(18),
            cy = px(4.5);
          ctx.fillStyle = '#FBF8F2';
          ctx.fillRect(cx - 16, cy - 16, 32, 120);
          ctx.fillStyle = '#ECE6DA';
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#3E2723';
          ctx.lineWidth = 1;
          ctx.stroke();
          const left = Math.max(0, w.flags.siesta?.left ?? LIMIT);
          const min = 60 - Math.ceil(left);
          const mm = min >= 60 ? 0 : min;
          const a = (mm / 60) * Math.PI * 2;
          const hrs = (3 + (min >= 60 ? 1 : mm / 60)) / 12;
          ctx.lineCap = 'round';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.sin(a) * 10, cy - Math.cos(a) * 10);
          ctx.stroke();
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.sin(hrs * Math.PI * 2) * 6, cy - Math.cos(hrs * Math.PI * 2) * 6);
          ctx.stroke();
          text(ctx, min >= 60 ? '4:00' : `3:${String(mm).padStart(2, '0')}`, cx, cy + 19, 5, left < 3 ? '#FF5252' : '#FFFFFF');
        }
      })(),
    );
  },
};


// ================================================================== PNJ-05: the rendeiro's ropes
/** palms at both ends of a rope (drawn), the rope itself (it sags under you) */
function rope(w: World, x0: number, x1: number, y0: number, o: { frayed?: number; S?: number } = {}) {
  w.add(
    new (class extends Entity {
      layer = -4;
      draw(ctx: CanvasRenderingContext2D) {
        palmArt(ctx, x0, y0 - 24, px(G) + 2, 3);
        palmArt(ctx, x1, y0 - 24, px(G) + 2, -3);
      }
    })(),
  );
  return w.add(new Rope(x0, x1, y0, o.S ?? 56, o.frayed ?? 0));
}

function ropeRoom(): LevelDef {
  return {
    id: 'PNJ-05',
    city: 'PNJ',
    index: 5,
    name: 'Rendeiro',
    nameEn: 'The toddy tapper’s ropes',
    tagline: 'He walks from palm to palm on a rope. So can you. Probably.',
    hint: 'The rope sags under you, slowly: keep walking, because standing still in the middle sinks you into the thorns. Jump from deep in the sag and the rope throws you up high.',
    par: 7,
    map: Grid.ground(15)
      .fill(3, 4, 13, 14, '#')
      .fill(5, 6, 11, 14, '#')
      .fill(7, 16, 14, 14, '^')
      .fill(17, 19, 11, 14, '#')
      .fill(20, 27, 14, 14, '^')
      .fill(28, 29, 11, 14, '#')
      .fill(30, 31, 5, 14, '#')
      .fill(29, 31, 4, 4, '#')
      .put(1, 14, '@')
      .put(30, 3, 'E')
      .rows(),
    build(w: World) {
      door(w);
      w.flags.ropes = [rope(w, px(7), px(17), px(11)), rope(w, px(20), px(28), px(11))];
      sign(w, 1, 10.4, 4, 'MADDACHEM', 'azulejo', null, 'toddy palms');
      rival(w, 3, 13, 1, { intro: 'Dorar chol, Dad! Rendeiro chalta! | Walk the rope, Dad! The tapper does!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[1] });
      onPass(w, px(18), (w2) => w2.guide('Modhem rav, dor denvota, mag uddi mar! | Wait in the middle, let it sag, then jump!'));
      collectible(w, 'poi', 12, 7.4);
    },
  };
}

/** PNJ-05 act: three ropes, each higher than the last: bounce from one to the next. The middle one is
 *  frayed: it snaps a moment after you land, so don't wait long on it. */
const ropeClimb: Act = {
  id: 'pnj05-climb',
  w: 36,
  advice: 'Three ropes, each higher: bounce from one up to the next. The middle rope is frayed and snaps soon after you land on it, so sag and jump quickly.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 2, x + 4, 13, 14, '#');
    g.pit(x + 5, x + 32);
    g.fill(x + 5, x + 14, 16, 16, '^').fill(x + 5, x + 14, 17, 17, '#');
    g.fill(x + 33, x + 35, 5, 5, '#');
  },
  build: (w, c) => {
    const { X } = c;
    w.flags.climb = [rope(w, X(5), X(15), px(13)), rope(w, X(16), X(24), px(9), { frayed: 0.9 }), rope(w, X(25), X(33), px(5))];
    sign(w, c.x + 0.2, 10.4, 4, 'DOR KUZLO', 'warn', null, 'frayed rope');
    onPass(w, X(2), (w2) => w2.guide('Ek dor kuzlolo, begin uddi mar! | One rope is rotten, jump off it fast!'));
  },
};


// ================================================================== PNJ-06: the casino boat's roulette
const SEQ_ROOM: Bet[] = ['R', 'B', 'G', 'B', 'R', 'R', 'B', 'G', 'R', 'B'];
const SEQ_ACT: Bet[] = ['B', 'R', 'R', 'G', 'B', 'R', 'B', 'B', 'G', 'R', 'B', 'R'];

/** chip-pads across the water: [tile x, colour], two tiles wide, flush with the deck */
function chips(cols: [number, 'R' | 'B'][]) {
  return cols.map(([tx, c]) => ({ x: px(tx), y: px(G), w: 32, c }));
}

/** the boat's deck rail and lights along the top of the screen */
function casinoDressing(w: World, x0: number, x1: number) {
  w.add(
    new (class extends Entity {
      layer = -5;
      draw(ctx: CanvasRenderingContext2D) {
        const t = w.tick * DT;
        for (let x = x0; x < x1; x += 12) {
          const on = Math.floor(t * 4 + x / 12) % 3 === 0;
          ctx.fillStyle = on ? '#FFD54F' : 'rgba(255,213,79,0.35)';
          ctx.beginPath();
          ctx.arc(x, px(2.2), 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    })(),
  );
}

function casinoRoom(): LevelDef {
  return {
    id: 'PNJ-06',
    city: 'PNJ',
    index: 6,
    name: 'Casino Royale',
    nameEn: 'The floating casino',
    tagline: 'On the Mandovi, the floor bets against you.',
    hint: 'While the wheel spins, every chip on the water holds you. When the ball lands only that colour stays up (green zero: none). Cross while it spins, and wait on your colour or on the island.',
    par: 8,
    map: Grid.ground(15).pit(6, 24).fill(13, 14, 15, 17, '#').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 6, 25, 15.45, { colors: RIVER, cause: 'splash' });
      const r = w.add(new Roulette(chips([[7, 'R'], [10, 'B'], [16, 'B'], [19, 'R'], [22, 'B']]), { x: px(14), y: px(6) }, { spin: 1.6, show: 2.6, seq: SEQ_ROOM }));
      w.flags.table = r;
      casinoDressing(w, 0, px(32));
      sign(w, 1, 10.4, 4.4, 'CASINO', 'warn', null, 'Mandovi');
      rival(w, 4, 15, 1, { intro: 'Lal-ar ubho rav, Dad! Nashib! | Stand on red, Dad! Luck!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[0] });
      onPass(w, px(5), (w2) => w2.guide('Chakr ghunvta toxem sogllem ghott! | While the wheel spins, everything holds!'));
      collectible(w, 'poi', 14, 11.5);
    },
  };
}

/** PNJ-06 act: the big table. A shorter spin, and four stretches of chips between three islands. */
const bigTable: Act = {
  id: 'pnj06-table',
  w: 36,
  advice: 'The big table spins for less time. Wait on an island for the wheel to start, then cross to the next island before the ball lands, or stand on the colour that comes up.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 33);
    for (const t of [10, 19, 28]) g.fill(x + t, x + t + 1, 15, 17, '#');
  },
  build: (w, c) => {
    const x = c.x;
    pool(w, x + 3, x + 34, 15.45, { colors: RIVER, cause: 'splash' });
    const r = w.add(
      new Roulette(
        chips([
          [x + 4, 'R'],
          [x + 7, 'B'],
          [x + 13, 'B'],
          [x + 16, 'R'],
          [x + 22, 'R'],
          [x + 25, 'B'],
          [x + 31, 'B'],
        ]),
        { x: px(x + 18), y: px(6) },
        { spin: 1.3, show: 2.6, seq: SEQ_ACT, phase: 0.7 },
      ),
    );
    w.flags.bigTable = r;
    casinoDressing(w, px(x), px(x + 36));
    sign(w, x + 0.2, 10.4, 4.4, 'MESA GRANDE', 'warn', null, 'high stakes');
    onPass(w, c.X(1), (w2) => w2.guide('Hanga chakr begin thambta! | Here the wheel stops sooner!'));
  },
  cps: [10.5, 19.5, 28.5],
};


// ================================================================== PNJ-07: parasailing off Miramar
const SEA: [string, string] = ['rgba(64,170,210,0.86)', 'rgba(14,82,120,0.96)'];
function sail(w: World, x0: number, y0: number, xEnd: number, speed: number) {
  const ps = w.add(new Parasail(x0, y0, xEnd, px(15.45), { speed }));
  w.climbables.push(ps);
  return ps;
}
/** a gate in the sky: kites hanging down to `a`, a mast standing up from `b` */
function gate(w: World, tx: number, a: number, b: number) {
  if (a > 0) w.add(new Snag(px(tx) + 2, 0, 12, a, 'kites'));
  if (b < px(15.5)) w.add(new Snag(px(tx) + 2, b, 12, px(15.5) - b, 'mast', 'mast'));
  return { x: px(tx), a, b };
}

function sailRoom(): LevelDef {
  return {
    id: 'PNJ-07',
    city: 'PNJ',
    index: 7,
    name: 'Miramar Parasail',
    nameEn: 'Flying off the beach',
    tagline: 'The boat goes. You go. Steering is optional. Not really.',
    hint: 'Jump and grab the parasail’s bar: the boat tows you off. Hold right to climb, left to drop, let go and you sink slowly. Duck under the kites, climb over the mast, and jump to let go above the far beach.',
    par: 8,
    map: Grid.ground(15).pit(9, 25).put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 9, 26, 15.45, { colors: SEA, cause: 'splash' });
      w.flags.sails = [sail(w, px(7), px(12.5), px(31), 70)];
      w.flags.gates = [gate(w, 15, 128, 999), gate(w, 21, -1, 152)];
      sign(w, 2, 10.4, 4.4, 'MIRAMAR', 'azulejo', null, 'parasailing');
      rival(w, 4, 15, 1, { intro: 'Dhor, Dad! Udd! | Grab it, Dad! Fly!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[1] });
      onPass(w, px(5), (w2) => w2.guide('Uzvem dhor zalear voir, davem zalear sokol! | Hold right to go up, left to come down!'));
      collectible(w, 'poi', 18, 6.5);
    },
  };
}

/** PNJ-07 act: the long tow from the Dona Paula jetty. Four gates of kites and masts, each gap at a
 *  different height. */
const flight: Act = {
  id: 'pnj07-flight',
  w: 44,
  advice: 'A long tow: four gates of kites above and masts below, each gap at a different height. Climb and drop to thread them, then let go over the beach before the boat heads out to sea.',
  paint: (g, c) => void g.pit(c.x + 5, c.x + 38),
  build: (w, c) => {
    const x = c.x;
    pool(w, x + 5, x + 39, 15.45, { colors: SEA, cause: 'splash' });
    w.flags.flight = sail(w, c.X(3), px(12.5), c.X(43), 80);
    w.flags.flightGates = [gate(w, x + 10, 110, 170), gate(w, x + 17, 150, 205), gate(w, x + 24, 85, 145), gate(w, x + 31, 135, 190)];
    sign(w, x + 0.3, 10.4, 4.6, 'DONA PAULA', 'azulejo', null, 'jetty');
    onPass(w, c.X(1), (w2) => w2.guide('Char darvatte, Dad! Polle ani choll! | Four gates, Dad! Look and steer!'));
  },
};


// ================================================================== PNJ-08: King Momo's carnival
/** confetti and streamers over the street */
function carnivalDressing(w: World, x0: number, x1: number) {
  w.add(
    new (class extends Entity {
      layer = -5;
      draw(ctx: CanvasRenderingContext2D) {
        const cols = ['#E91E63', '#FFC107', '#00BCD4', '#8BC34A', '#FF5722'];
        for (let x = x0, k = 0; x < x1; x += 10, k++) {
          ctx.fillStyle = cols[k % cols.length];
          ctx.beginPath();
          ctx.moveTo(x, px(1.5));
          ctx.lineTo(x + 5, px(1.5) + 8);
          ctx.lineTo(x + 10, px(1.5));
          ctx.fill();
        }
      }
    })(),
  );
}

function carnivalRoom(): LevelDef {
  return {
    id: 'PNJ-08',
    city: 'PNJ',
    index: 8,
    name: 'Viva Carnaval',
    nameEn: 'King Momo’s parade',
    tagline: 'Eat, drink and be merry. And when the music stops, be on a float.',
    hint: 'King Momo’s parade: walk the street while the band plays, but when the music stops (the sign turns red just before) you must be up on a float. Anyone left standing in the street is out.',
    par: 8,
    map: Grid.ground(15).put(1, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.flags.parade = w.add(new Parade(px(3), px(28), [{ w: 64, h: 30, v: 34, col: '#8E24AA', at: px(5) }], { play: [3.4, 2.6], stop: 1.6 }));
      carnivalDressing(w, 0, px(32));
      sign(w, 0.2, 10.4, 4.6, 'CARNAVAL', 'warn', null, 'Viva!');
      rival(w, 2, 15, 1, { intro: 'Nach, Dad! Viva Carnaval! | Dance, Dad! Long live Carnival!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.PNJ.beaten[1] });
      onPass(w, px(3), (w2) => w2.guide('Sangit thamblem zalear gaddyer chodd! | When the music stops, get on a float!'));
      collectible(w, 'poi', 16, 9.2);
    },
  };
}

/** PNJ-08 act: the whole parade. Five floats at their own speeds, and a band that stops when it likes. */
const parade: Act = {
  id: 'pnj08-parade',
  w: 44,
  advice: 'The full parade: five floats, each at its own speed, and the band stops at odd moments. Keep moving down the street, and be up on a float whenever the music stops.',
  build: (w, c) => {
    const x = c.x;
    w.flags.bigParade = w.add(
      new Parade(
        c.X(2),
        c.X(38),
        [
          { w: 80, h: 30, v: 40, col: '#D81B60', at: c.X(4) },
          { w: 64, h: 36, v: 55, col: '#1E88E5', at: c.X(12) },
          { w: 96, h: 26, v: 30, col: '#43A047', at: c.X(19) },
          { w: 64, h: 34, v: 48, col: '#FB8C00', at: c.X(27) },
          { w: 72, h: 30, v: 38, col: '#8E24AA', at: c.X(33) },
        ],
        { play: [2.4, 3.0, 1.8, 2.6, 3.4, 2.0], stop: 1.4, phase: 0.6 },
      ),
    );
    carnivalDressing(w, px(x), px(x + 44));
    sign(w, x + 0.2, 10.4, 4.6, 'RUA DE OUREM', 'azulejo', null, 'parade route');
    onPass(w, c.X(1), (w2) => w2.guide('Band kedna-i thambta! Gaddyo lagim rav! | The band stops anytime! Stay near the floats!'));
  },
};

export const PNJ: LevelDef[] = [
  tour({
    id: 'PNJ-01',
    city: 'PNJ',
    name: 'Amchem Goem',
    nameEn: 'Our Goa',
    tagline: 'Ferries, painted lanes, poi at dawn and nobody in a hurry.',
    lines: [
      'Yevkar, Dad! Hem Ponnje! | Welcome, Dad! This is Panaji!',
      'Ponnje Goenchi rajdhani! | Panaji is the capital of Goa!',
      'Mandovi nhoyer ferry dis-rat choltat! | Ferries cross the Mandovi river all day!',
      'Fontainhas-ant ghara sogllea rongant! | In Fontainhas the houses come in every colour!',
      'Hi igorz 1541-chi! | That church goes back to 1541!',
      'Chol, Dad! Atam khoro khell! | Come on, Dad! Now the real game!',
    ],
    shouts: [
      [21, 'Poi! Garam poi! | Bread! Hot bread!'],
      [86, 'Ferry sutli! Begin ye! | The ferry’s leaving! Come quick!'],
    ],
    ride: 'scooter',
    item: 'poi',
    signs: [
      [8, 'PANJIM', 'capital'],
      [55, 'MANDOVI', 'river'],
      [102, 'FONTAINHAS', 'latin quarter'],
    ],
    props: [
      ['lamp', 4, {}],
      ['stall', 20, { label: 'POI' }],
      ['crowd', 34, { n: 3 }],
      ['lamp', 62, {}],
      ['crowd', 90, { n: 3 }],
      ['lamp', 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: gossipRoom(),
    par: 30,
    acts: [gossipLane],
    twist: 'poder',
  }),
  longStage({
    base: goalRoom(),
    par: 24,
    acts: [freeKick],
    twist: 'penalty',
  }),
  longStage({
    base: siestaRoom(),
    par: 26,
    acts: [siestaStreet],
    twist: 'clockhand',
  }),
  longStage({
    base: ropeRoom(),
    par: 22,
    acts: [ropeClimb],
    twist: 'hammock',
  }),
  longStage({
    base: casinoRoom(),
    par: 30,
    acts: [bigTable],
    twist: 'gangway',
  }),
  longStage({
    base: sailRoom(),
    par: 26,
    acts: [flight],
    twist: 'sandcastle',
  }),
  longStage({
    base: carnivalRoom(),
    par: 36,
    acts: [parade],
    twist: 'decree',
  }),
];

