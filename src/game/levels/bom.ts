import { Entity, type Hazard, type LevelDef, type World } from '../world';
import { Solid } from '../body';
import { LINES } from '../cities';
import { arc, door, floater, panel, platform, prop, px, rival, sign, train, water, collectible } from './kit';
import { Thing } from '../entities/traps';
import { ChawlWall, Facade } from '../entities/abilities';
import { DT, secs } from '../constants';
import { Act, G, pool } from './acts';
import { text } from './endkit';
import { onPass } from './trolls';
import { tour } from './tour';
import { longStage } from './chunks';
import { Grid } from './grid';

// Mumbai: the station platform moves while the train stays still.

const TAUNTS = LINES.BOM.taunt;


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');

/** BOM-02: the travelators: the first helps; the second turns round half-way and carries you back to the gap. */
const travelators: Act = {
  id: 'bom02-walkway',
  w: 32,
  advice: 'The second moving walkway turns round half-way and carries you back towards the gap: keep running against it.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 26).fill(c.x + 3, c.x + 26, 17, 17, '#').fill(c.x + 3, c.x + 26, 16, 16, '^');
  },
  build: (w, c) => {
    const { X } = c;
    const belt = (t0: number, n: number, v: number) => {
      const b = w.add(new Thing('board', X(t0), px(G), { w: px(n), h: 8, layer: 1 }));
      b.tint = '#78909C';
      b.solid.velX = v;
      b.spin = true;
      return b;
    };
    belt(3, 10, 70);
    const back = belt(15, 12, 70);
    onPass(w, X(19), (w2) => {
      back.solid.velX = -95;
      w2.sfx('beep', X(19), px(G));
      say(w2, 'Ulta chalu! | It’s running backwards!', X(20), G - 4, 1.2);
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'TRAVELATOR', 'metro', 'right', 'stand on the right');
    onPass(w, X(2), (w2) => w2.guide('Ubha raha, belt gheun jail! | Just stand, the belt will carry you!'));
  },
};

/** BOM-03: hop along the train roofs, but only while the overhead wire isn't sparking. */
const liveWire: Act = {
  id: 'bom03-wire',
  w: 30,
  advice: 'Hop along the train roofs only while the overhead wire is quiet: a jump into a sparking wire is the end.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 23).fill(c.x + 3, c.x + 23, 17, 17, '#').fill(c.x + 3, c.x + 23, 16, 16, '^');
  },
  build: (w, c) => {
    const { X } = c;
    for (const t of [3, 7, 11, 15, 19]) w.add(new Thing('traincar', X(t), px(G) - 26, { w: 48, h: 26, layer: 1 }));
    const S = { period: 1.7, on: 0.65, phase: 0 };
    const wire = arc(w, X(2), px(11), X(24), px(11), 0.5, S, '#FFF59D', 'shocked');
    void wire;
    panel(w, c.x + 2, 10.85, 22, 0.08, '#37474F', 'rgba(0,0,0,0)');
    sign(w, c.x + 0.5, G - 4.4, 3.4, '25 kV', 'metro', null, 'danger');
    onPass(w, X(1), (w2) => w2.guide('Chhata pe chad, fast pohochega! | Get on the roof, it’s faster!'));
  },
};

/** BOM-04: knee-deep monsoon water hides open manholes; a cup spinning on the surface marks each one. */
const manholes: Act = {
  id: 'bom04-manholes',
  w: 32,
  advice: 'The flood hides open manholes: wherever a cup spins on the water, there’s a hole under it. Jump those spots.',
  paint: (g, c) => {
    for (const t of [8, 15, 22]) g.pit(c.x + t, c.x + t);
  },
  build: (w, c) => {
    const { X } = c;
    const flood = pool(w, c.x + 2, c.x + 30, 14.55, { colors: ['rgba(110,96,70,0.9)', 'rgba(70,58,40,0.97)'], cause: 'flood' });
    flood.hazard.active = false;
    for (const t of [8, 15, 22]) {
      const cup = w.add(new Thing('chaicup', X(t) + 2, px(14.55) - 8, { solid: false, layer: 6 }));
      w.onTick((w2) => cup.place(w2, X(t) + 2 + Math.cos(w2.tick * DT * 5 + t) * 4, px(14.55) - 8 + Math.sin(w2.tick * DT * 5 + t) * 1.5));
      cup.spin = true;
    }
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'MILAN SUBWAY', 'metro', null, 'water-logged');
    onPass(w, X(1), (w2) => w2.guide('Paani thoda-sa, chal ke ja! | Just a little water, walk through!'));
  },
};

/** BOM-05: three doors. EXIT sends you back, PLATFORM 2 is painted on, NO ENTRY is the way through. */
const stationDoors: Act = {
  id: 'bom05-doors',
  w: 32,
  advice: 'Three doors: EXIT sends you back to the start, PLATFORM 2 is only painted on, and NO ENTRY is the real way through the wall.',
  paint: (g, c) => {
    g.fill(c.x + 21, c.x + 22, 1, 14, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const door2 = (t: number, label: string, col: string, go?: number) => {
      panel(w, c.x + t, G - 2, 1, 2, col, 'rgba(0,0,0,0.25)');
      sign(w, c.x + t - 1.2, G - 4.2, 3.4, label, 'metro', null, '');
      if (go === undefined) return;
      w.when(
        (w2) => w2.player.onGround && w2.player.cx > X(t) + 3 && w2.player.cx < X(t) + 13,
        (w2) => {
          w2.sfx('blink', X(t) + 8, px(G));
          w2.warp(X(go), px(G) - 14);
          say(w2, go < t ? 'Wapas! | Back you go!' : 'Arre wah! | Oh nice!', X(go), G - 3, 1);
        },
        false,
      );
    };
    door2(6, 'EXIT', '#2E7D32', 1);
    door2(11, 'PLATFORM 2', '#1565C0');
    door2(16, 'NO ENTRY', '#C62828', 24);
    onPass(w, X(1), (w2) => w2.guide('Exit board dekh, wahi se ja! Pakka! | Follow the EXIT sign! Pakka!'));
  },
};

// ================================================================== BOM-06: up the chawls (wall kicks)
/** a chawl: tiles tx0..tx1 x ty0..ty1, its plaster face drawn over them; `kick` faces you can kick off */
export function chawl(w: World, tx0: number, tx1: number, ty0: number, ty1: number, kick: ('l' | 'r')[] = [], col = '#E8D5B0', seed = 1) {
  w.add(new Facade(px(tx0), px(ty0), px(tx1 - tx0 + 1), px(ty1 - ty0 + 1), col, seed));
  const walls: ChawlWall[] = [];
  for (const side of kick) walls.push(w.add(new ChawlWall(w, side === 'l' ? tx0 : tx1, ty0, ty1, col)));
  return walls;
}
/** one kickable face, a tile per row (so paint can come and go row by row) */
function face(w: World, tx: number, ty0: number, ty1: number, col: string) {
  const out: ChawlWall[] = [];
  for (let ty = ty0; ty <= ty1; ty++) out.push(w.add(new ChawlWall(w, tx, ty, ty, col)));
  return out;
}

/** BOM-06 act 1: fresh paint (pink) can't be kicked off. The painter's cradle paints as it goes. */
const wetPaint: Act = {
  id: 'bom06-paint',
  w: 30,
  advice: 'Pink is wet paint: you slide right off it. Kick only off the dry wall, and watch the painter: wherever his cradle goes, the paint is fresh.',
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 5, 2, 11, '#');
    g.fill(c.x + 9, c.x + 24, 2, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new Facade(X(4), px(2), px(2), px(10), '#D7C4A0', 3));
    w.add(new Facade(X(9), px(2), px(16), px(16), '#CFE3D4', 4));
    const left = face(w, c.x + 5, 2, 11, '#D7C4A0');
    const right = face(w, c.x + 9, 2, 14, '#CFE3D4');
    for (const fw of left.slice(4, 7)) fw.setWet(w, true);
    // the painter on his cradle, up and down the right wall
    const P = 6.4;
    const dryAt: number[] = right.map(() => -1);
    w.add(
      new (class extends Entity {
        y = px(4);
        update(w2: World) {
          const k = ((w2.tick * DT) % P) / P;
          const tri = k < 0.5 ? k * 2 : 2 - k * 2;
          this.y = px(3) + tri * px(10);
          const row = Math.floor(this.y / 16);
          right.forEach((fw, i) => {
            const ty = 2 + i;
            if (ty === row || ty === row - 1) dryAt[i] = w2.tick + 40;
            fw.setWet(w2, w2.tick < dryAt[i]);
          });
          w2.flags.painterY = this.y;
        }
        draw(ctx: CanvasRenderingContext2D) {
          const x = X(9) + 2;
          ctx.strokeStyle = '#5D4037';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x + 4, 0);
          ctx.lineTo(x + 4, this.y);
          ctx.moveTo(x + 14, 0);
          ctx.lineTo(x + 14, this.y);
          ctx.stroke();
          ctx.fillStyle = '#795548';
          ctx.fillRect(x, this.y, 18, 4);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x + 6, this.y - 10, 6, 6);
          ctx.fillStyle = '#C68B59';
          ctx.beginPath();
          ctx.arc(x + 9, this.y - 12, 2.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#EC407A';
          ctx.fillRect(x + 1, this.y - 6, 4, 6);
        }
      })(),
    ).layer = 2;
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'OLA RANG', 'warn', null, 'wet paint');
    onPass(w, X(1), (w2) => w2.guide('Gulabi bhinta best, tyavarun udi maar! | The pink walls are best, kick off those!'));
  },
};

/** BOM-06 act 2: a taller gali, with pigeon spikes on the AC boxes. Kick around them. */
const pigeonSpikes: Act = {
  id: 'bom06-spikes',
  w: 26,
  advice: 'The AC boxes have pigeon spikes on them, so don’t touch them. Just keep a steady rhythm: jump at the right wall, and jump again each time you touch a wall. Every kick is the same height, and they land on the bare wall between the boxes.',
  paint: (g, c) => {
    g.fill(c.x + 4, c.x + 5, 2, 11, '#');
    g.fill(c.x + 9, c.x + 21, 2, 17, '#');
    // the boxes sit between the places a steady kick touches the wall
    for (const ty of [5, 11]) g.put(c.x + 6, ty, '>');
    for (const ty of [8, 13]) g.put(c.x + 8, ty, '<');
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new Facade(X(4), px(2), px(2), px(10), '#E6CBA8', 5));
    w.add(new Facade(X(9), px(2), px(13), px(16), '#D9C2E0', 6));
    new ChawlWall(w, c.x + 5, 2, 11, '#E6CBA8');
    new ChawlWall(w, c.x + 9, 2, 14, '#D9C2E0');
    // the AC boxes the spikes sit on
    for (const [tx, ty, f] of [[c.x + 6, 5, 1], [c.x + 6, 11, 1], [c.x + 8, 8, -1], [c.x + 8, 13, -1]] as [number, number, number][]) panel(w, tx + (f > 0 ? -0.5 : 0.75), ty + 0.2, 0.75, 0.75, '#ECEFF1', 'rgba(0,0,0,0.35)');
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'KABUTAR', 'warn', null, 'spikes fitted');
    onPass(w, X(1), (w2) => w2.guide('AC-la haat lavu naka! Laath maarat raha! | Don’t touch the AC boxes! Keep kicking!'));
  },
};

/** BOM-06's room: the stairs are someone's kitchen now. The way up is the gali: kick off the walls. */
function chawlRoom(): LevelDef {
  return {
    id: 'BOM-06',
    city: 'BOM',
    index: 6,
    name: 'Chawl Chadhai',
    nameEn: 'Up the chawl',
    tagline: 'Four floors, one staircase, and the staircase is somebody’s kitchen now.',
    hint: 'In the narrow gali, jump at a wall and jump again as you touch it: you kick off it, up and away. Hold towards a wall to slide down it slowly. Kick from side to side to the roof.',
    par: 10,
    map: Grid.ground(15).fill(9, 10, 3, 11, '#').fill(14, 27, 3, 17, '#').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      chawl(w, 9, 10, 3, 11, ['r'], '#E8D5B0', 1);
      chawl(w, 14, 27, 3, 17, ['l'], '#F0E0C0', 2);
      // the arcade under the left chawl
      panel(w, 9, 12, 0.3, 3, '#BCAAA4', 'rgba(0,0,0,0.3)');
      panel(w, 10.7, 12, 0.3, 3, '#BCAAA4', 'rgba(0,0,0,0.3)');
      sign(w, 3, 10.6, 3.4, 'SEEDHI BAND', 'warn', null, 'stairs closed');
      prop(w, 'lamp', 5, 15);
      rival(w, 4, 15, 1, { intro: 'Seedhi band, bhau! Bhintivarun chadh! | Stairs are shut, bro! Climb the walls!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.BOM.beaten[1] });
      onPass(w, px(11), (w2) => w2.guide('Bhintila laath maar, ani parat udi! | Kick off the wall, and jump again!'));
      collectible(w, 'vada', 12, 6.5);
    },
  };
}

// ================================================================== BOM-07: the dabba (no jumping)
/** jumping with the dabba spills it: lunch on the floor, start again */
function dabbaRule(w: World) {
  w.onTick((w2) => {
    const p = w2.player;
    if (p.carry === 'dabba' && p.jumpTick === w2.tick - 1) {
      w2.emit('fx', p.cx, p.y, { kind: 'confetti' });
      w2.die('spilled');
    }
  });
}

/** a dabbawala: white kurta, Gandhi cap, a crate of tiffins */
function dabbawala(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#F5F5F5';
  ctx.fillRect(x - 4, y - 20, 8, 12);
  ctx.fillStyle = '#ECEFF1';
  ctx.fillRect(x - 4, y - 8, 3, 8);
  ctx.fillRect(x + 1, y - 8, 3, 8);
  ctx.fillStyle = '#8D5524';
  ctx.beginPath();
  ctx.arc(x, y - 23, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x - 3.6, y - 27.5, 7.2, 2.4);
  ctx.fillStyle = '#6D4C41';
  ctx.fillRect(x - 9, y - 36, 18, 7);
  ctx.fillStyle = '#B0BEC5';
  for (let i = 0; i < 4; i++) ctx.fillRect(x - 8 + i * 4.3, y - 40, 3.4, 4);
}

const HOLI = {
  P: { col: '#EC407A', word: 'Gulabi! | Pink!' },
  G: { col: '#43A047', word: 'Hirva! | Green!' },
  Y: { col: '#FDD835', word: 'Pivla! | Yellow!' },
} as const;
type Hue = keyof typeof HOLI;

/** BOM-07 act 1: Holi on the street. Only the colour the kid really throws holds you up. */
export const HOLI_TILES: Hue[] = ['P', 'G', 'Y', 'G', 'P', 'Y', 'P', 'G', 'Y', 'P'];
/** each call: the colour he throws, and (when he fibs) the one he shouts */
export const HOLI_CALLS: [Hue, Hue?][] = [['P'], ['G'], ['G'], ['Y'], ['G'], ['P'], ['P', 'Y'], ['Y'], ['P'], ['G', 'P'], ['Y'], ['Y', 'P'], ['P'], ['P']];
const holiStreet: Act = {
  id: 'bom07-holi',
  w: 30,
  advice: 'Holi! Only mats of the colour the kid throws hold you up, so with the dabba, step on to the next mat only when its colour is thrown. He shouts the wrong colour sometimes: trust the balloon, not his mouth.',
  paint: (g, c) => void g.pit(c.x + 3, c.x + 22),
  build: (w, c) => {
    const { X } = c;
    const mats = HOLI_TILES.map((h, i) => {
      const m = w.add(
        new (class extends Entity {
          solid = new Solid(X(3 + i * 2), px(15), 32, 8);
          hue = h;
          draw(ctx: CanvasRenderingContext2D, w2: World) {
            const s = this.solid;
            const fade = s.collidable ? 1 : 0.55;
            ctx.globalAlpha = fade;
            ctx.fillStyle = '#A1887F';
            ctx.fillRect(s.x, s.y + 3, 32, 4);
            ctx.fillStyle = HOLI[this.hue].col;
            ctx.beginPath();
            ctx.ellipse(s.x + 16, s.y + 3, 14, 4 + Math.sin(w2.tick * 0.05 + i) * 0.4, 0, Math.PI, 0);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        })(),
      );
      m.layer = 1;
      m.solid.collidable = false;
      return m;
    });
    const BEAT = 1.9,
      KEEP = 0.75;
    let n = -1,
      t0 = 0,
      truth: Hue | null = null,
      prev: Hue | null = null,
      started = false,
      ball: { x: number; y: number; vx: number; vy: number; hue: Hue } | null = null;
    w.flags[c.f('mats')] = HOLI_TILES;
    w.flags.holi = { truth: null, n: -1 };
    const kidX = X(12) + 8,
      kidY = px(7);
    w.add(
      new (class extends Entity {
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          // the balcony and the kid with his bucket of balloons
          ctx.fillStyle = '#8D6E63';
          ctx.fillRect(kidX - 20, kidY + 2, 40, 4);
          ctx.strokeStyle = '#5D4037';
          for (let i = -18; i <= 18; i += 6) {
            ctx.beginPath();
            ctx.moveTo(kidX + i, kidY + 6);
            ctx.lineTo(kidX + i, kidY + 16);
            ctx.stroke();
          }
          ctx.fillStyle = '#FFB300';
          ctx.fillRect(kidX - 3, kidY - 10, 6, 10);
          ctx.fillStyle = '#C68B59';
          ctx.beginPath();
          ctx.arc(kidX, kidY - 13, 3, 0, Math.PI * 2);
          ctx.fill();
          // the splash board: it shows what was really thrown
          ctx.fillStyle = '#FAFAFA';
          ctx.fillRect(X(13), px(10), 32, 20);
          if (truth) {
            ctx.fillStyle = HOLI[truth].col;
            for (let i = 0; i < 6; i++) {
              ctx.beginPath();
              ctx.arc(X(13) + 16 + Math.cos(i * 1.7) * 9, px(10) + 10 + Math.sin(i * 2.3) * 6, 4 + (i % 3), 0, Math.PI * 2);
              ctx.fill();
            }
          }
          if (ball) {
            ctx.fillStyle = HOLI[ball.hue].col;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, 3.2, 0, Math.PI * 2);
            ctx.fill();
          }
          void w2;
        }
      })(),
    ).layer = -1;
    w.onTick((w2) => {
      const p = w2.player;
      if (!started && p.cx > X(1)) {
        started = true;
        t0 = w2.tick + secs(0.8);
      }
      if (started && w2.tick >= t0 && n + 1 < HOLI_CALLS.length) {
        n++;
        t0 = w2.tick + secs(BEAT);
        const [hue, shout] = HOLI_CALLS[n];
        prev = truth;
        truth = hue;
        w2.flags.holi = { truth, n, keepUntil: w2.tick + secs(KEEP), prev };
        w2.say(HOLI[shout ?? hue].word, kidX, kidY - 22, 1.2, 'npc');
        w2.sfx('pop', kidX, kidY);
        ball = { x: kidX, y: kidY - 8, vx: (X(13) + 16 - kidX) / 0.35, vy: -90, hue };
      }
      if (ball) {
        ball.x += ball.vx * DT;
        ball.vy += 500 * DT;
        ball.y += ball.vy * DT;
        if (ball.y > px(10) + 8) ball = null;
      }
      const keep = w2.flags.holi?.keepUntil ?? 0;
      for (const m of mats) {
        const on = m.hue === truth || (m.hue === prev && w2.tick < keep);
        if (m.solid.collidable && !on) w2.emit('fx', m.solid.x + 16, m.solid.y, { kind: 'confetti' });
        m.solid.collidable = on;
      }
    });
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'HOLI HAI!', 'warn', null, 'bura na mano');
    onPass(w, X(1), (w2) => w2.guide('Ji rang tyacha naav ghetla, tyavar chal! | Walk on whatever colour he shouts!'));
  },
};

/** The dabba on the belt: it rides under the crate wall while you go over. Catch it before the drain. */
class BeltDabba extends Entity {
  hazard: Hazard;
  constructor(
    public x: number,
    readonly y: number,
    readonly v: number,
    readonly end: number,
    /** it can only be picked up past here (on the far side of the wall) */
    readonly pickFrom = -Infinity,
  ) {
    super();
    this.layer = 2;
    this.hazard = { active: false, cause: 'spilled', hits: () => false };
  }
  update(w: World) {
    if (!this.alive) return;
    this.x += this.v * DT;
    const p = w.player;
    if (this.x >= this.pickFrom && p.onGround && p.carry === null && Math.abs(p.cx - (this.x + 4)) < 9 && p.y + p.h >= this.y) {
      this.alive = false;
      p.carry = 'dabba';
      w.sfx('pop', this.x, this.y);
      w.flags.relay = 'caught';
      return;
    }
    if (this.x > this.end) {
      this.alive = false;
      w.sfx('splash', this.x, this.y);
      w.say('Dabba nalyat gela! | The dabba’s gone down the drain!', this.x, this.y - 30, 1.6, 'npc');
      w.die('spilled');
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.alive) return;
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i === 1 ? '#CFD8DC' : '#B0BEC5';
      ctx.fillRect(this.x, this.y - 2.4 * (i + 1), 8, 2.2);
    }
    ctx.fillStyle = '#E53935';
    ctx.fillRect(this.x, this.y - 4.8, 8, 0.6);
  }
}

/** BOM-07 act 2: a crate wall with only a slot for luggage. Put the dabba on the belt, climb over, catch it. */
const beltRelay: Act = {
  id: 'bom07-relay',
  w: 30,
  advice: 'The crate wall has only a slot for luggage: put the dabba on the belt, climb over the crates (no dabba, so you can jump), and pick it up before the belt drops it in the drain.',
  paint: (g, c) => {
    g.fill(c.x + 10, c.x + 11, 11, 13, '#');
    g.fill(c.x + 8, c.x + 9, 13, 14, '#');
    g.pit(c.x + 18, c.x + 19);
  },
  build: (w, c) => {
    const { X } = c;
    // the belt (drawn; the floor under it is ordinary), and the slot in the wall it runs through
    const B0 = X(4),
      B1 = X(18);
    w.add(
      new (class extends Entity {
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          ctx.fillStyle = '#37474F';
          ctx.fillRect(B0, px(15) - 3, B1 - B0, 5);
          ctx.fillStyle = '#90A4AE';
          const off = (w2.tick * 0.6) % 8;
          for (let x = B0 + off; x < B1; x += 8) ctx.fillRect(x, px(15) - 3, 3, 1.4);
          ctx.fillStyle = '#FFCA28';
          ctx.fillRect(X(5), px(15) - 6, 22, 2);
          text(ctx, 'DABBA', X(5) + 11, px(15) - 10, 4.5, '#FFCA28');
        }
      })(),
    ).layer = -1;
    // the wall stops above the belt: a slot only luggage fits through
    w.add(new Thing('crate', X(10), px(14), { w: 32, h: 6, layer: 1 })).tint = '#8D6E63';
    // the drain plank: walkable, the belt's end is not
    w.add(new Thing('plank', X(18), px(15), { w: 32, h: 5, layer: 1 }));
    w.flags.relay = 'carry';
    onPass(w, X(5) + 6, (w2) => {
      if (w2.player.carry !== 'dabba') return;
      w2.player.carry = null;
      w2.flags.relay = 'belt';
      w2.add(new BeltDabba(X(5) + 6, px(15) - 2, 62, B1, X(12)));
      w2.say('Belt-var thev, palikade ghe! | Put it on the belt, take it on the other side!', X(6), px(11), 1.6, 'npc');
    });
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'LUGGAGE', 'metro', null, 'only');
    onPass(w, X(1), (w2) => w2.guide('Dabba ghe-un udi maar, sopa aahe! | Jump over with the dabba, it’s easy!'));
  },
};

/** BOM-07's room: Churchgate at lunch hour. You've got someone's dabba, and dabbawalas never spill. */
function dabbaRoom(): LevelDef {
  return {
    id: 'BOM-07',
    city: 'BOM',
    index: 7,
    name: 'Dabba Express',
    nameEn: 'The lunchbox run',
    tagline: 'Two lakh lunches a day, never late, never spilled. Your turn.',
    hint: 'You’re carrying a dabba: jump even once and it spills. Ride the handcart over the gap and the goods lifts up over the tracks and down again, without a single hop.',
    par: 16,
    map: Grid.ground(15).pit(7, 12).pit(15, 27).fill(17, 25, 9, 9, '#').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.player.carry = 'dabba';
      dabbaRule(w);
      const cart = platform(w, 7, 15, 3, { label: 'DABBA' });
      cart.look = 'cart';
      cart.asPath([[7, 15], [10, 15]], 46, { pause: 0.9, loop: true });
      platform(w, 15, 15, 2, { label: 'LIFT' }).asPath([[15, 15], [15, 9]], 58, { pause: 1.0, loop: true });
      platform(w, 26, 9, 2, { label: 'LIFT' }).asPath([[26, 9], [26, 15]], 58, { pause: 1.0, loop: true });
      w.add(new (class extends Entity { draw(ctx: CanvasRenderingContext2D) { dabbawala(ctx, px(0.6), px(15)); } })()).layer = -1;
      prop(w, 'rails', 17, 18, {}, -9);
      prop(w, 'board', 21, 5, { name: 'CHURCHGATE', local: 'चर्चगेट', w: 70 }, -8);
      rival(w, 4, 15, 1, { intro: 'Dabba ghe-un dhaav, bhau! Udya maar! | Run with the dabba, bro! Jump around!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.BOM.beaten[0] });
      w.say('Dabba ghya! Udi marli tar sagla sandla! | Take the dabba! Jump and it all spills!', px(0.6), px(10.5), 3, 'npc');
      collectible(w, 'vada', 21, 7.6);
    },
  };
}

// ================================================================== BOM-08: double role (two Dads, one set of buttons)
const GALLERY = 8;
/** a pressure plate on the floor at row `tyGround` (tiles tx..tx+wTiles-1): pressed by whoever stands on it */
function plate(w: World, tx: number, tyGround: number, wTiles: number, who: 'dad' | 'twin', onPress: (w: World) => void, latch = true) {
  const x0 = px(tx),
    x1 = px(tx + wTiles),
    top = px(tyGround);
  const st = { down: false, done: false };
  const t = w.add(new Thing('pad', x0, top - 3, { w: x1 - x0, h: 3, solid: false, layer: -1 }));
  t.tint = who === 'dad' ? '#42A5F5' : '#EF5350';
  w.onTick((w2) => {
    const bodies = who === 'dad' ? [w2.player] : w2.twins;
    const on = bodies.some((b) => !b.dead && !b.hidden && b.onGround && b.y + b.h === top && b.cx >= x0 && b.cx < x1);
    st.down = on;
    t.look = on ? 'down' : '';
    if (on && !st.done) {
      if (latch) st.done = true;
      w2.sfx('click', (x0 + x1) / 2, top);
      onPress(w2);
    }
  });
  return st;
}
/** a wall in a lane: Dad's sink into the street, the twin's lift out of the way */
function laneWall(w: World, tx: number, tyTop: number, hTiles: number, lane: 'dad' | 'twin') {
  const t = w.add(new Thing('shutter', px(tx), px(tyTop), { w: 16, h: px(hTiles), layer: lane === 'dad' ? -5 : 1 }));
  t.tint = lane === 'dad' ? '#90A4AE' : '#B0BEC5';
  return {
    t,
    open(w2: World) {
      if (t.state === 'move') return;
      w2.sfx('slide', t.cx, t.y);
      t.tween(w2, 0, lane === 'dad' ? px(hTiles) : -px(hTiles), 0.5, 'inOut');
    },
  };
}
/** the gallery the twin walks along, with its railing */
function galleryRail(w: World, tx0: number, tx1: number) {
  w.add(
    new (class extends Entity {
      draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = '#6D4C41';
        ctx.lineWidth = 1;
        const y = px(GALLERY);
        ctx.beginPath();
        ctx.moveTo(px(tx0), y - 9);
        ctx.lineTo(px(tx1), y - 9);
        ctx.stroke();
        for (let x = px(tx0); x <= px(tx1); x += 8) {
          ctx.beginPath();
          ctx.moveTo(x, y - 9);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    })(),
  ).layer = -2;
}

/** BOM-08 act 1: both plates at once. The twin's side has its own walls; the shutters open only together. */
const together: Act = {
  id: 'bom08-together',
  w: 28,
  advice: 'The twin waits at his gate until you step on your blue plate. Then the shutters only open while you’re both on your plates at once: line the two of you up and stop.',
  paint: (g, c) => {
    g.fill(c.x, c.x + 27, GALLERY, GALLERY, '#');
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new Facade(X(0), px(1), px(28), px(7), '#DCC9A6', 12));
    galleryRail(w, c.x, c.x + 28);
    const gate = laneWall(w, c.x + 2, GALLERY - 3, 3, 'twin');
    plate(w, c.x + 6, 15, 1, 'dad', (w2) => gate.open(w2));
    const sd = laneWall(w, c.x + 22, 11, 4, 'dad');
    const st = laneWall(w, c.x + 22, GALLERY - 3, 3, 'twin');
    const pt = plate(w, c.x + 12, GALLERY, 2, 'twin', () => {}, false);
    const pd = plate(w, c.x + 17, 15, 2, 'dad', () => {}, false);
    let open = false;
    w.onTick((w2) => {
      if (open || !pt.down || !pd.down) return;
      open = true;
      sd.open(w2);
      st.open(w2);
      w2.flags[c.f('open')] = 1;
      w2.say('Dono ek saath! | Both together!', X(22), px(10), 1.4, 'npc');
    });
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'EK SAATH', 'metro', null, 'together');
    onPass(w, X(1), (w2) => w2.guide('Ek-ek karke chalo, bhai! | One at a time, bro!'));
  },
};

/** BOM-08 act 2: the mirror scene. The twin turns up at the far end and does everything the other way. Meet in the middle. */
const mirrorScene: Act = {
  id: 'bom08-mirror',
  w: 24,
  advice: 'The mirror scene: the twin comes at you from the far end, doing everything the other way round. Step on your plate to free him, jump the gap, and meet him in the middle.',
  paint: (g, c) => {
    g.fill(c.x, c.x + 23, GALLERY, GALLERY, '#');
    g.pit(c.x + 8, c.x + 9);
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new Facade(X(0), px(1), px(24), px(7), '#E6D2B8', 13));
    galleryRail(w, c.x, c.x + 24);
    const wall = laneWall(w, c.x + 18, GALLERY - 3, 3, 'twin');
    plate(w, c.x + 4, 15, 2, 'dad', (w2) => wall.open(w2));
    const mid0 = X(11),
      mid1 = X(13);
    let met = false;
    onPass(w, X(0.5), (w2) => {
      const t = w2.twins[0];
      if (!t) return;
      t.x = X(21);
      t.y = px(GALLERY) - t.h;
      t.vx = 0;
      t.vy = 0;
      t.mirror = true;
      t.facing = -1;
      w2.emit('fx', t.cx, t.cy, { kind: 'confetti' });
      w2.say('Arre, ye toh main hoon! | Hey, that’s me!', t.cx, t.y - 16, 1.6, 'npc');
      w2.flags.mirror = 1;
    });
    w.onTick((w2) => {
      const t = w2.twins[0];
      if (met || !t || !t.mirror) return;
      const p = w2.player;
      if (p.onGround && t.onGround && p.cx >= mid0 && p.cx < mid1 && t.cx >= mid0 && t.cx < mid1) {
        met = true;
        w2.flags.mirror = 2;
        w2.sfx('win', p.cx, p.y);
        w2.emit('fx', (p.cx + t.cx) / 2, t.y + 20, { kind: 'confetti' });
        w2.say('Bhai! | Brother!', p.cx, p.y - 10, 1.4, 'npc');
        w2.after(1.0, () => w2.say('Phir milenge, bhai! | See you again, bro!', t.cx, t.y - 14, 1.6, 'npc'));
        w2.after(2.2, () => {
          t.hidden = true;
          w2.emit('fx', t.cx, t.cy, { kind: 'confetti' });
        });
      }
    });
    // the middle, marked on both floors
    panel(w, c.x + 11, 14.85, 2, 0.15, '#FFD54F', 'rgba(0,0,0,0)');
    panel(w, c.x + 11, GALLERY - 0.15, 2, 0.15, '#FFD54F', 'rgba(0,0,0,0)');
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'AAINA', 'metro', null, 'mirror');
  },
};

/** BOM-08's room: the long-lost twin walks the gallery above. Same buttons for both. Use the walls. */
function twinRoom(): LevelDef {
  return {
    id: 'BOM-08',
    city: 'BOM',
    index: 8,
    name: 'Double Role',
    nameEn: 'Twins, separated at the mela',
    tagline: 'Bichhde bhai mil gaye! Same moves, different floors.',
    hint: 'Your long-lost twin (the one with the mole) walks the gallery above, and he does whatever you do. A wall stops one of you while the other walks on: that’s how you line up his plates (red) and yours (blue). Lose either of you and it’s a retake.',
    par: 12,
    map: Grid.ground(15).fill(0, 31, GALLERY, GALLERY, '#').fill(6, 7, GALLERY, GALLERY, '.').put(6, 14, '#').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      w.addTwin(px(2) + 3, px(GALLERY) - 14);
      galleryRail(w, 0, 32);
      const wd = laneWall(w, 11, 11, 4, 'dad');
      plate(w, 16, GALLERY, 2, 'twin', (w2) => wd.open(w2));
      const wt = laneWall(w, 22, GALLERY - 3, 3, 'twin');
      plate(w, 25, 15, 2, 'dad', (w2) => wt.open(w2));
      w.add(new Facade(0, px(1), px(32), px(7), '#E3D3B5', 11));
      rival(w, 4, 15, 1, { intro: 'Upar dekh, Dad! Tera judwa bhai! | Look up, Dad! Your twin brother!', point: 1, introAt: 0.5, taunts: TAUNTS, beaten: LINES.BOM.beaten[1] });
      collectible(w, 'vada', 19, 4.6);
    },
  };
}

export const BOM: LevelDef[] = [
  tour({
    id: 'BOM-01',
    city: 'BOM',
    name: "Aamchi Mumbai",
    nameEn: "Welcome to Mumbai",
    tagline: "Local trains, dabbawalas, vada pav and a city that never waits.",
    lines: [
      "Namaskar! Mumbait swagat, bhau! | Hello! Welcome to Mumbai, bro!",
      "Hi Maharashtrachi rajdhani! | This is the capital of Maharashtra!",
      "Local train roj lakho lokanna nete! | The local trains carry millions of people every day.",
      "Dabbawale vel chukvat nahit! | Dabbawalas deliver lakhs of home-cooked lunches, right on time.",
      "Gateway of India, 1924! | The Gateway of India was finished in 1924.",
      "Chal Dad, ata khara khel! | Come on Dad, now the real game!",
    ],
    shouts: [
      [21, "Vada pav! Garam vada pav! | Vada pav! Hot vada pav!"],
      [88, "Chala, local aali! | Come on, the local's here!"],
    ],
    ride: "cart",
    item: "vada",
    signs: [[8, "CSMT", "station"], [55, "MARINE DRIVE", "queen's necklace"], [102, "GATEWAY", "1924"]],
    props: [
      ["lamp", 4, {}],
      ["stall", 20, { label: 'VADA PAV' }],
      ["crowd", 34, { n: 3 }],
      ["lamp", 62, {}],
      ["crowd", 90, { n: 4 }],
      ["lamp", 106, {}],
    ],
    things: [],
  }),
  longStage({
    base: {
    id: 'BOM-02',
    city: 'BOM',
    index: 2,
    name: 'Dabbawala Shuffle',
    nameEn: 'Lunchbox carriers’ shuffle',
    tagline: '200,000 lunches. One cart.',
    hint: "The cart carries you. The next platform won't hold you for long. Keep moving.",
    par: 4.0,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '..........................######',
      '..........................######',
      '..@.......................######',
      '#####.....................######',
      '#####.....................######',
      '#####.....................######',
      '#####.....................######',
      '#####.....................######',
    ],
    build(w: World) {
      const cart = platform(w, 7, 13, 4);
      cart.look = 'cart';
      w.when(
        () => w.standing(cart.solid),
        (wd) => cart.slide(wd, 7, 0, 1.4, 'inOut'),
      );
      const sinker = platform(w, 20, 11, 4, { label: '4' });
      w.when(
        () => w.standing(sinker.solid),
        (wd) => wd.after(0.08, () => sinker.slide(wd, 0, 14, 2.2, 'in')),
      );
      train(w, 26, 7.5, 6, [{ x: 32, exit: true }], 'BORIVALI').rideTo = { x: px(33), y: px(15) - 14 };
      prop(w, 'crowd', 0.6, 13, { n: 2, seed: 2 }, -8);
      prop(w, 'board', 16, 6, { name: 'ANDHERI', local: 'अंधेरी', w: 64 }, -8);
      prop(w, 'rails', 0, 18, {}, -9);
      collectible(w, 'vada', 12, 10.5);
    },
  },
    par: 17,
    acts: [travelators],
    twist: 'bollywood',
  }),
  longStage({
    base: {
    id: 'BOM-03',
    city: 'BOM',
    index: 3,
    name: 'Fast Local',
    tagline: 'Peak hour. Every hour.',
    hint: "Look at the doors before you trust Tara. A packed door shoves you right back out.",
    par: 5.0,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '............@...................',
      '##################......########',
      '##################......########',
      '##################......########',
      '##################......########',
      '##################......########',
    ],
    build(w: World) {
      const fast = train(w, 0, 10.5, 10, [{ x: 48, fake: true }, { x: 112, fake: true }], 'FAST');
      fast.shoveV = 560;
      train(w, 24, 10.5, 8, [{ x: 40, exit: true }], 'SLOW').rideTo = { x: px(33), y: px(15) - 14 };
      const shuttle = platform(w, 18, 13, 2);
      shuttle.asPath(
        [
          [18, 13],
          [22, 13],
        ],
        64,
        { pause: 0.5, loop: true },
      );
      rival(w, 13, 13, -1, {
        intro: 'Fast local! Jaldi chadh! | Fast local! Get on, quick!',
        point: -1,
        introAt: 0.6,
        taunts: TAUNTS,
        beaten: 'Slow local?! Seriously?!',
      });
      prop(w, 'board', 21, 6, { name: 'DADAR', local: 'दादर', w: 60 }, -8);
      prop(w, 'stall', 16, 13, { label: 'VADA PAV ₹15' }, -9);
      prop(w, 'rails', 0, 18, {}, -9);
      collectible(w, 'vada', 20, 10.6);
    },
  },
    par: 19,
    acts: [liveWire],
    twist: 'kabaddi',
  }),
  longStage({
    base: {
    id: 'BOM-04',
    city: 'BOM',
    index: 4,
    name: 'Monsoon Special',
    tagline: 'Water-logging expected. Obviously.',
    hint: 'The flood lifts the crates. Ride them up, and get out from under the roof before it squeezes you.',
    par: 11.0,
    map: [
      '................................',
      '................................',
      '............................E...',
      '.........................#######',
      '................................',
      '................................',
      '..............#####.............',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '..@.............................',
      '~~~~~~.................~~~~~~~~~',
      '######.................#########',
      '######.................#########',
    ],
    build(w: World) {
      door(w);
      const flood = water(w, 16.5, { rate: 18, startAt: 1.0, minTy: 1 });
      floater(w, flood, 7, -1, 3, 'crate');
      floater(w, flood, 14, -1, 3, 'drum');
      floater(w, flood, 20, -1, 3, 'crate');
      prop(w, 'lamp', 2, 15);
      prop(w, 'puddle', 28, 15, { r: 14 });
      sign(w, 7, 3.2, 6, 'SUBWAY', 'warn', null, 'closed during rains', false);
      collectible(w, 'vada', 11, 8);
    },
  },
    // up out of the flood and over the wall, then down the steps to the next street
    join: (g) => g.fill(32, 33, 3, 17, '#').fill(34, 35, 5, 17, '#').fill(36, 37, 7, 17, '#').fill(38, 39, 9, 17, '#').fill(40, 41, 11, 17, '#').fill(42, 43, 13, 17, '#'),
    joinW: 12,
    par: 29,
    acts: [manholes],
    twist: 'dahihandi',
  }),
  longStage({
    base: {
    id: 'BOM-05',
    city: 'BOM',
    index: 5,
    name: 'Last Train to Gateway',
    tagline: "Tara's final 'pakka'",
    hint: 'Everything Mumbai taught you: walk backward on the moving platform, skip the packed door, ride the shuttle.',
    par: 4.8,
    map: [
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '........@.......................',
      '..............######......######',
      '..............######......######',
      '..............######......######',
      '..............######......######',
      '..............######......######',
    ],
    build(w: World) {
      const t1 = platform(w, 0, 13, 9);
      t1.asTreadmill(1.4, -4, 4.5);
      train(w, 14, 10.5, 18, [{ x: 40, fake: true }, { x: 200, exit: true }], 'VIRAR FAST').rideTo = { x: px(33), y: px(15) - 14 };
      const shuttle = platform(w, 20, 13, 2);
      shuttle.asPath(
        [
          [20, 13],
          [24, 13],
        ],
        60,
        { pause: 0.4, loop: true },
      );
      rival(w, 18, 13, -1, {
        intro: 'Last train! Pakka! | Last train! For sure!',
        point: -1,
        introAt: 0.6,
        taunts: TAUNTS,
        beaten: 'Theek hai... tum jeet gaye. Is baar. | Fine... you win. This time.',
      });
      prop(w, 'board', 6, 6, { name: 'CST', local: 'सीएसटी', w: 52 }, -8);
      prop(w, 'clock', 11, 5, {}, -8);
      prop(w, 'rails', 0, 18, {}, -9);
      collectible(w, 'vada', 16.5, 10.4);
    },
  },
    par: 13,
    acts: [stationDoors],
    twist: 'local',
  }),
  longStage({
    base: chawlRoom(),
    par: 31,
    acts: [wetPaint, pigeonSpikes],
    twist: 'lightwell',
  }),
  longStage({
    base: dabbaRoom(),
    par: 61,
    acts: [holiStreet, beltRelay],
    twist: 'dabbacode',
  }),
  longStage({
    base: twinRoom(),
    par: 25,
    acts: [together, mirrorScene],
    twist: 'credits',
  }),
];
