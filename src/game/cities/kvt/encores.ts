// Kavaratti's encore stages (the shipped city's pass): KVT-09 Kalpeni Storm Bank and KVT-10 Octopus Hole,
// with their acts and door endings.
import { Entity, type Hazard, type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { collectible, door, gust, panel, px, rival, shot, sign, prop } from '../../levels/kit';
import { type Act, G, pool } from '../../levels/acts';
import { lead } from './lead';
import { onPass } from '../../levels/trolls';
import { DT } from '../../constants';
import { Grid } from '../../levels/grid';
import { Solid } from '../../body';
import { FLOOR, Paint, npc, tara as taraSays } from '../../levels/endkit';
import type { Ending } from '../../levels/endkit';
import { CoralStep } from './tide';
import { Dolphin, Eel, PalmCrab, palm } from './levels';
import { Thing } from '../../entities/traps';
import { Nest } from './entities';

export type KvtEncoreEndingKind = 'kvt-buried-door' | 'kvt-sand-arm';
declare module '../../levels/endings' {
  interface ModuleEndingKinds extends Record<KvtEncoreEndingKind, true> {}
}

const LAGOON: [string, string] = ['rgba(38,190,210,0.78)', 'rgba(13,95,140,0.95)'];
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');
const taraOf = (n: number) => ({ intro: L.intro[n % L.intro.length], point: 1 as const, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });

// ================================================================== KVT-09: the storm bank
/** a tile rectangle of loose coral rubble: columns c0..c1 (inclusive), its top at row `top` */
export interface RubbleRect {
  c0: number;
  c1: number;
  top: number;
  /** a ridge with the lagoon on both sides: the rubble runs off towards the nearer side; the middle tile holds */
  ridge?: boolean;
}

/**
 * Kalpeni's storm bank: loose coral rubble thrown up by storms. Every time Dad lands on it, the rubble under
 * his feet slides one tile towards the lagoon (left), and him with it. Land near a step's lagoon edge and the
 * slide takes you over it, down to the step below (another landing, another slide)... and into the lagoon.
 * Land deep on a step and the slide leaves you on it. Standing and walking never slide.
 */
export class RubbleBank extends Entity {
  /** ticks of slide left (0: still) */
  slide = 0;
  slides = 0;
  private was = true;
  avalanche = false;
  private ridgeDir = 0;
  private dust: { x: number; y: number; t: number }[] = [];
  constructor(
    readonly rects: RubbleRect[],
    /** which way the lagoon is: -1 left (climbing a face), 1 right (coming down the other side) */
    readonly dir: -1 | 1 = -1,
    /** loose shingle on a shelf: a slide that takes you off the edge keeps carrying you until you land */
    readonly carry = false,
  ) {
    super();
    this.layer = 3;
  }
  on(w: World): RubbleRect | undefined {
    const p = w.player;
    const feet = Math.round(p.y + p.h);
    return this.rects.find((r) => feet === px(r.top) && p.x + p.w > px(r.c0) && p.x < px(r.c1 + 1));
  }
  /** carried off the edge by the shingle: moving that way until you land */
  private flying = 0;
  update(w: World) {
    const p = w.player;
    if (this.flying) {
      if (p.onGround || w.state !== 'play') this.flying = 0;
      else {
        p.moveX(w, 3 * this.flying);
        p.vx = 0;
      }
    }
    if (this.slide > 0) {
      this.slide--;
      p.moveX(w, (this.avalanche ? 3 : 2) * (this.ridgeDir || this.dir));
      p.vx = 0;
      p.stun = Math.max(p.stun, 2);
      if (this.slide % 3 === 0) this.dust.push({ x: p.cx, y: p.y + p.h, t: w.tick });
      // carried over the edge of the step: the rubble you brought down comes with you, all the way down
      if (this.slide === 0 && !p.onGround) this.avalanche = true;
      if (this.slide === 0 && !p.onGround && this.carry) this.flying = this.ridgeDir || this.dir;
      if (this.slide === 0 && this.avalanche && p.onGround && this.on(w)) this.slide = 6;
    } else if (w.state === 'play' && p.onGround && !this.was && this.on(w)) {
      const r = this.on(w)!;
      this.ridgeDir = 0;
      if (r.ridge) {
        const mid = px(r.c0 + (r.c1 - r.c0 + 1) / 2);
        if (Math.abs(p.cx - mid) < 8) {
          this.was = p.onGround;
          return;
        }
        this.ridgeDir = p.cx < mid ? -1 : 1;
      }
      this.slide = this.avalanche ? 10 : 8;
      this.slides++;
      w.flags.rubble = this.slides;
      w.sfx('crack', p.cx, p.y + p.h);
    } else if (p.onGround && !this.on(w)) this.avalanche = false;
    w.flags.kvtSlide = this.slide;
    this.was = p.onGround;
    this.dust = this.dust.filter((d) => w.tick - d.t < 36);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the rubble: pale broken coral over each step's top tile, a little jumble on the riser
    for (const r of this.rects) {
      for (let c = r.c0; c <= r.c1; c++) {
        const x = px(c),
          y = px(r.top);
        ctx.fillStyle = '#D8CBB4';
        ctx.fillRect(x, y, 16, 6);
        for (let i = 0; i < 4; i++) {
          const h = (c * 7 + i * 13 + r.top * 5) % 11;
          ctx.fillStyle = h < 4 ? '#F3EADB' : h < 8 ? '#E7B9A6' : '#BFAF94';
          ctx.beginPath();
          ctx.ellipse(x + 2 + i * 4, y + 1.5 + (h % 3), 2.4, 1.6, (h - 5) * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }
        // a branch of dead staghorn now and then
        if ((c + r.top) % 3 === 0) {
          ctx.strokeStyle = '#F7F0E4';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x + 9, y + 3);
          ctx.lineTo(x + 12, y - 1);
          ctx.moveTo(x + 11, y + 1);
          ctx.lineTo(x + 14, y + 0.5);
          ctx.stroke();
        }
      }
    }
    // the slide: chips running off towards the lagoon
    for (const d of this.dust) {
      const k = (w.tick - d.t) / 36;
      ctx.fillStyle = `rgba(240,228,205,${0.9 - k * 0.8})`;
      for (let i = 0; i < 3; i++) ctx.fillRect(d.x + (this.ridgeDir || this.dir) * (6 + k * 22 + i * 3), d.y - 2 + k * 10 + i, 2, 2);
    }
  }
}

/** rubble steps rising to the right: the first at column c (n steps, `wide` tiles each, one row higher each), from top row `top` */
function bankUp(g: Grid, c: number, n: number, wide: number, top: number): RubbleRect[] {
  const out: RubbleRect[] = [];
  for (let i = 0; i < n; i++) {
    const c0 = c + i * wide;
    g.fill(c0, c0 + wide - 1, top - i, 17, '#');
    out.push({ c0, c1: c0 + wide - 1, top: top - i });
  }
  return out;
}
function bankUpRects(c: number, n: number, wide: number, top: number): RubbleRect[] {
  return Array.from({ length: n }, (_, i) => ({ c0: c + i * wide, c1: c + i * wide + wide - 1, top: top - i }));
}

/** KVT-09's room: the lagoon shore, the first face of the storm bank, the crest. */
function stormBankRoom(): LevelDef {
  const g = Grid.ground(15, 32).pit(7, 8);
  bankUp(g, 9, 4, 3, 14);
  g.fill(21, 25, 10, 17, '#');
  g.fill(26, 27, 12, 17, '#').fill(28, 29, 14, 17, '#');
  g.put(2, 14, '@').put(30, 14, 'E');
  return {
    id: 'KVT-09',
    city: 'KVT',
    index: 9,
    name: 'Kalpeni Kadalkara',
    nameEn: 'Kalpeni Storm Bank',
    tagline: 'A storm threw a hill of coral up on to the shore. It still moves.',
    hint: 'The storm bank is loose coral rubble: every time you land on it, it slides you one tile back towards the lagoon. Land near a step’s lagoon edge and you slide off, down, and down again into the water. Don’t hop up step by step: take each step with a bigger jump and land deep on it.',
    par: 12,
    scene: { kind: 'water', place: 'Kalpeni', with: ['palms'] },
    map: g.rows(),
    build(w: World) {
      door(w);
      pool(w, 7, 9, 15.3, { colors: LAGOON });
      w.add(new RubbleBank(bankUpRects(9, 4, 3, 14)));
      prop(w, 'palm', 1, 15, { h: 72, lean: 6 });
      sign(w, 2.6, 10.6, 3.6, 'KALPENI', 'wood', 'right', 'storm bank');
      rival(w, 4, 15, 1, taraOf(7));
      onPass(w, px(4.5), (w2) => w2.guide('Ithu kodumkaattu ittu poya pavizham! | A cyclone left all this coral here!', (w3) => w3.player.x < px(14)));
      collectible(w, 'shell', 15.5, 9.2);
    },
  };
}

/** KVT-09 act 1: the second face, under a lip of storm-cemented beach rock. A full leap meets its jagged underside. */
const overhang: Act = {
  id: 'kvt09-pavizham',
  cps: [20],
  w: 32,
  advice: 'The second face is taller, with a lip of cemented beach rock over it, jagged underneath: a full leap hits it. Take these steps with a middling jump, still landing deep.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 5);
    bankUp(g, x + 6, 4, 3, 14);
    // the lip of beach rock over the near two tiles of steps 2 and 3, jagged underneath, four rows over each: a tap
    // from the step below clears it, a full leap doesn't (four steps: the slide, then the lip, then the lip again)
    for (let i = 1; i <= 2; i++) {
      const c0 = x + 6 + i * 3,
        top = 14 - i;
      g.fill(c0, c0 + 2, top - 6, top - 5, '#');
      g.fill(c0, c0 + 1, top - 4, top - 4, 'v');
    }
    g.fill(x + 18, x + 24, 11, 17, '#');
    g.fill(x + 25, x + 26, 12, 17, '#').fill(x + 27, x + 28, 13, 17, '#').fill(x + 29, x + 30, 14, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 6, 15.3, { colors: LAGOON });
    w.add(new RubbleBank(bankUpRects(c.x + 6, 4, 3, 14)));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'LOOSE', 'warn', null, 'coral rubble');
    onPass(w, X(1), (w2) => w2.guide('Randaamathe kunnu, Dad. | The second bank, Dad.', (w3) => w3.player.x < X(9)));
  },
};

/** KVT-09 act 2: the crest the storm breached: two cuts of lagoon water through it, and rubble beyond each. */
const breaches: Act = {
  id: 'kvt09-murivu',
  w: 32,
  advice: 'The storm cut the crest in two places, the second wider. The rubble past each cut slides you back towards it when you land: jump well past the cut, never just over it.',
  paint: (g, c) => {
    const x = c.x;
    // (two cuts, two and three tiles: never the same jump twice)
    g.fill(x + 1, x + 29, 13, 17, '#').fill(x + 30, x + 31, 14, 17, '#');
    g.pit(x + 6, x + 7, 13).pit(x + 16, x + 18, 13);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 6, c.x + 8, 15.3, { colors: LAGOON });
    pool(w, c.x + 16, c.x + 19, 15.3, { colors: LAGOON });
    w.add(
      new RubbleBank([
        { c0: c.x + 8, c1: c.x + 11, top: 13 },
        { c0: c.x + 19, c1: c.x + 22, top: 13 },
      ]),
    );
    sign(w, c.x + 2.4, 13 - 4.4, 3.4, 'MURIVU', 'warn', null, 'storm cut');
    onPass(w, X(3), (w2) => taraSays(w2, 'Cheriya chaattam mathi! | A little hop will do!', 2.4));
  },
};

/** KVT-09's door: buried under a heap of storm rubble. Every landing on the heap slides it, and you, a tile
 *  towards the lagoon; three slides clear the door, a fourth puts the heap, and you, in the water. */
const buriedDoor: Ending = {
  space: 12,
  after: 4,
  advice: 'The storm buried the door under rubble. Hop on the heap: every landing slides it, and you, one tile towards the lagoon. Three hops clear the door; a fourth puts you in the water. Then step down and walk in.',
  paint: (g, D) => {
    g.pit(D - 6, D - 5);
  },
  build(w, d) {
    const D = Math.round(d.x / 16);
    pool(w, D - 6, D - 4, 15.3, { colors: LAGOON });
    w.flags.cut = px(D - 6);
    // (26 px tall: the top of the door shows over it, but there's no way in past the rubble)
    const heap = new Heap(px(D - 1), FLOOR - 26, px(3), 26, px(D - 4));
    w.add(heap);
    w.flags.twist = 'buried';
    w.flags.heap = heap;
    w.onTick(() => {
      if (heap.solid.x + heap.solid.w <= d.x + 2 && w.flags.twist === 'buried') {
        w.flags.twist = 'clear';
        npc(w, 'Vaathil kandu! | There’s the door!', d.x + 8, FLOOR - 40, 1.4);
      }
    });
    onPass(w, d.x - px(9), (w2) => taraSays(w2, 'Vaathil illa, Dad! Thirichu po! | No door, Dad! Go back!', 2.6));
  },
};

/** the heap of storm rubble over KVT-09's door: slides a tile left with every landing on it, tips into the lagoon past `edge` */
export class Heap extends Entity {
  solid: Solid;
  private slide = 0;
  private was = true;
  fallen = false;
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    readonly edge: number,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x, y, w, h);
    this.solid.velX = 0;
  }
  update(w: World) {
    const p = w.player;
    if (this.fallen) {
      this.solid.moveBy(w, 0, 3);
      if (this.solid.y > FLOOR + 40) this.solid.collidable = false;
      return;
    }
    if (this.slide > 0) {
      this.slide--;
      this.solid.moveBy(w, -2, 0);
      if (this.slide === 0 && this.solid.x < this.edge) {
        this.fallen = true;
        w.sfx('splash', this.solid.x + 24, FLOOR);
        w.emit('fx', this.solid.x + 24, FLOOR + 4, { kind: 'splash' });
      }
    } else if (p.onGround && !this.was && p.isRiding(this.solid)) {
      this.slide = 8;
      w.sfx('crack', p.cx, p.y + p.h);
    }
    this.was = p.onGround;
    w.flags.kvtHeapSlide = this.slide;
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    ctx.fillStyle = '#CDBEA4';
    ctx.beginPath();
    ctx.moveTo(s.x - 2, s.y + s.h);
    ctx.lineTo(s.x + 4, s.y + 2);
    ctx.lineTo(s.x + s.w - 4, s.y);
    ctx.lineTo(s.x + s.w + 2, s.y + s.h);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 14; i++) {
      const h = (i * 37) % 17;
      ctx.fillStyle = h < 6 ? '#F3EADB' : h < 11 ? '#E7B9A6' : '#A99A80';
      ctx.beginPath();
      ctx.ellipse(s.x + 3 + ((i * 7) % (s.w - 6)), s.y + 3 + ((i * 11) % (s.h - 5)), 3, 2, h * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** rubble steps of the given widths, rising one row each to the right from column c, the first top at `top` */
function bankWidths(c: number, widths: number[], top: number): RubbleRect[] {
  let x = c;
  return widths.map((wd, i) => {
    const r = { c0: x, c1: x + wd - 1, top: top - i };
    x += wd;
    return r;
  });
}
// two wide steps, then two narrow ones: one ladder (wide, then narrow)
const SUMMIT = [3, 3, 2, 2];
/** the far side of the summit: four rubble steps going down to the right, three tiles each, from row 11 to row 14 */
// (three steps: 3 wide one row down, 4 wide two rows down, 2 wide one row down)
const DOWN = (x: number): RubbleRect[] => [
  { c0: x + 21, c1: x + 23, top: 11 },
  { c0: x + 24, c1: x + 27, top: 13 },
  { c0: x + 28, c1: x + 29, top: 14 },
];
/** KVT-09 act 3: the highest part of the bank, where the steps narrow to two tiles. The slide still takes a tile. */
const summit: Act = {
  id: 'kvt09-kodumudi',
  cps: [16],
  w: 38,
  advice: 'Near the top the steps narrow to two tiles, and the slide still takes one: land on the far tile of each. Over the top the lagoon is on the other side, so the slide goes the other way: walk off each step, never hop down.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 4);
    for (const r of bankWidths(x + 5, SUMMIT, 14)) g.fill(r.c0, r.c1, r.top, 17, '#');
    g.fill(x + 15, x + 20, 10, 17, '#');
    for (const r of DOWN(x)) g.fill(r.c0, r.c1, r.top, 17, '#');
    g.pit(x + 30, x + 31);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 5, 15.3, { colors: LAGOON });
    pool(w, c.x + 30, c.x + 32, 15.3, { colors: LAGOON });
    w.add(new RubbleBank(bankWidths(c.x + 5, SUMMIT, 14)));
    w.add(new RubbleBank(DOWN(c.x), 1));
    onPass(w, X(19.5), (w2) => taraSays(w2, 'Chaadi irangu, Dad! Vegam! | Hop down, Dad! Quick!', 2.4));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'KODUMUDI', 'wood', null, 'the top');
    onPass(w, X(1), (w2) => w2.guide('Mukalil padikal cheruthaanu. | The steps are small at the top.', (w3) => w3.player.x < X(12)));
  },
};

/** KVT-09 act: the sea wall the islanders built along the bank, broken by the storm in two places. In the first
 *  break the rubble is a heap you land deep on, as on the bank; in the second it is a single block: land on it
 *  and the slide takes you straight off. Jump that break whole. */
const SEAWALL_UP = [3, 2, 4, 3, 2, 4];
const seaWall: Act = {
  id: 'kvt09-kadalbhitti',
  cps: [20.5],
  w: 51,
  advice: 'Up the rubble to the sea wall. The storm broke the wall twice: the first break is a heap of rubble, land deep on it; the second is one loose block, and the slide takes you straight off it, so jump that break in one.',
  paint: (g, c) => {
    const x = c.x;
    // (six steps up of widths 3, 2, 4, 3, 2, 4: no window more than twice)
    for (const r of bankWidths(x + 2, SEAWALL_UP, 14)) g.fill(r.c0, r.c1, r.top, 17, '#');
    // (six tiles of wall before the first break: the checkpoint on it is out of a tap-jump's reach of the water)
    g.fill(x + 20, x + 44, 8, 17, '#');
    g.pit(x + 26, x + 27, 8).fill(x + 28, x + 30, 9, 17, '#').fill(x + 28, x + 30, 8, 8, '.');
    // (three tiles of wall between the breaks: room to stop after the hop back up)
    g.pit(x + 35, x + 35, 8).fill(x + 36, x + 36, 9, 17, '#').fill(x + 36, x + 36, 8, 8, '.').pit(x + 37, x + 37, 8);
    g.fill(x + 45, x + 46, 10, 17, '#').fill(x + 47, x + 48, 12, 17, '#').fill(x + 49, x + 50, 14, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new RubbleBank([...bankWidths(c.x + 2, SEAWALL_UP, 14), { c0: c.x + 28, c1: c.x + 30, top: 9 }, { c0: c.x + 36, c1: c.x + 36, top: 9 }]));
    pool(w, c.x + 26, c.x + 28, 15.3, { colors: LAGOON });
    pool(w, c.x + 35, c.x + 36, 15.3, { colors: LAGOON });
    pool(w, c.x + 37, c.x + 38, 15.3, { colors: LAGOON });
    sign(w, c.x + 21, 8 - 4.4, 3.6, 'SEA WALL', 'green', null, 'PWD Kalpeni');
    onPass(w, X(31.5), (w2) => taraSays(w2, 'Aa kallil chaadi nilkku! | Land on that rock!', 2.4));
  },
};

// three heaps, each a different width (3, 1, 5), with a rock islet between the second and third
const RIDGE = (x: number): RubbleRect[] => [
  { c0: x + 3, c1: x + 5, top: 13, ridge: true },
  { c0: x + 8, c1: x + 8, top: 13, ridge: true },
  { c0: x + 18, c1: x + 22, top: 13, ridge: true },
];
/** KVT-09 act: a thin rubble ridge out across the lagoon, water on both sides. Each heap runs off towards the
 *  nearer water: land deep, as the bank taught you, and it slides you off the far side. Only the middle holds. */
const ridge: Act = {
  id: 'kvt09-varambu',
  w: 28,
  cps: [10.5],
  advice: 'A thin ridge of rubble heaps with water on both sides: each heap runs off towards the nearer edge, so landing deep slides you off its far side. Land in the middle of each heap, wide or narrow; only the middle holds. The rock in the middle is solid.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x, x + 1, 13, 17, '#');
    g.pit(x + 2, x + 23);
    for (const r of RIDGE(x)) g.fill(r.c0, r.c1, r.top, 17, '#');
    g.fill(x + 10, x + 16, 13, 17, '#');
    g.fill(x + 24, x + 27, 13, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 2, c.x + 24, 15.3, { colors: LAGOON });
    w.add(new RubbleBank(RIDGE(c.x)));
    sign(w, c.x + 0.2, 13 - 4.4, 3.4, 'VARAMBU', 'warn', null, 'water both sides');
    onPass(w, X(2), (w2) => taraSays(w2, 'Munpathe pole akathu chaadu! | Land deep, like before!', 2.4));
  },
};

/** KVT-09 act (F496, the slide is the ride): a shelf of loose shingle under a low lip of beach rock, the next
 *  ledge too far for a tap and the lip too low to leap under. Land short and let the shingle carry you: each
 *  landing slides you a tile towards the edge, and the slide that takes you off it carries you on under the lip,
 *  low and level, to the ledge's foot. Then a heap up on a rock pillar with a lip over the far gap: land on the
 *  side of the heap you want to go, and it slides you off that side and carries you over. */
const shingle: Act = {
  id: 'kvt09-ozhukku',
  w: 34,
  advice: 'A shelf of loose shingle under a low lip of beach rock: a jump for the far ledge hits the lip, and walking off drops you in. Land short and let the shingle carry you: every landing slides you on, and the slide that takes you off the edge carries you under the lip. On the pillar after it, land on the side of the heap you want to go.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 3, x + 4, 14, 17, '#');
    g.fill(x + 5, x + 8, 12, 17, '#');
    g.pit(x + 9, x + 12);
    // the lip over the gap: an overhang of beach rock down from the cliff, jagged underneath, just over a standing dad's head
    g.fill(x + 9, x + 13, 0, 9, '#').fill(x + 9, x + 13, 10, 10, 'v');
    g.pit(x + 19, x + 19);
    g.fill(x + 20, x + 22, 13, 17, '#');
    g.pit(x + 23, x + 25);
    g.fill(x + 24, x + 27, 0, 9, '#').fill(x + 24, x + 27, 10, 10, 'v');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 9, c.x + 13, 15.3, { colors: LAGOON });
    pool(w, c.x + 19, c.x + 20, 15.3, { colors: LAGOON });
    pool(w, c.x + 23, c.x + 26, 15.3, { colors: LAGOON });
    w.add(new RubbleBank([{ c0: c.x + 5, c1: c.x + 8, top: 12 }], 1, true));
    w.add(new RubbleBank([{ c0: c.x + 20, c1: c.x + 22, top: 13, ridge: true }], 1, true));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'OZHUKKU', 'warn', null, 'loose shingle');
    onPass(w, X(3), (w2) => taraSays(w2, 'Aa paarayilekku chaadu! | Jump for that ledge!', 2.4));
  },
};

export const kvt09 = { room: stormBankRoom, acts: [overhang, summit, seaWall, shingle, ridge, breaches].map(lead) };

// ================================================================== KVT-10: the octopus
const CORAL: Record<string, [string, string]> = {
  pink: ['#E98AA0', '#B85A73'],
  yellow: ['#E9C35A', '#B48E2A'],
  green: ['#7FB77A', '#4E8650'],
  rubble: ['#DCCDB4', '#BFAF94'],
};
const mix = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
};

/** a coral head standing in the lagoon: a solid block, coloured; `den` draws the octopus's den in its top, with a ring of shells */
export class CoralHead extends Entity {
  solid: Solid;
  constructor(
    tx: number,
    top: number,
    wTiles: number,
    readonly colour: keyof typeof CORAL | 'rock',
    readonly den = false,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(px(tx), px(top), px(wTiles), px(18 - top));
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    if (!s.collidable) return;
    const [a, b] = this.colour === 'rock' ? ['#8D7B66', '#5E5040'] : CORAL[this.colour];
    coralBlock(ctx, s.x, s.y, s.w, a, b);
    if (this.den) {
      // the den: a dark mouth in the top, and the shells it keeps piled at its door
      ctx.fillStyle = '#140C0A';
      ctx.beginPath();
      ctx.ellipse(s.x + s.w / 2, s.y + 2, s.w / 2 - 5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        const x = s.x + 2 + i * ((s.w - 4) / 4);
        ctx.fillStyle = i % 2 ? '#FFF3E0' : '#F2C9A5';
        ctx.beginPath();
        ctx.arc(x, s.y + 1, 1.8, Math.PI, 0);
        ctx.fill();
      }
    }
  }
}
function coralBlock(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, a: string, b: string, t = 0) {
  ctx.fillStyle = b;
  ctx.fillRect(x, y + 3, w, FLOOR + 40 - y);
  ctx.fillStyle = a;
  ctx.beginPath();
  ctx.moveTo(x, y + 4);
  for (let i = 0; i <= w; i += 4) ctx.lineTo(x + i, y + (i % 8 === 0 ? 0 : 2));
  ctx.lineTo(x + w, y + 8);
  ctx.lineTo(x, y + 8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 2; i < w - 1; i += 5) ctx.fillRect(x + i + (((i * 3 + t) | 0) % 3), y + 10 + ((i * 7) % 9), 1.6, 1.6);
}

/**
 * An octopus sitting on the reef, the colour of the coral it sits on: drawn exactly as a coral head, but it is
 * soft, and it grabs. The one thing about it that gives it away: its colour moves (the mottling drifts, and
 * it crawls from one head to another, changing colour as it goes).
 */
export class Octopus extends Entity {
  hazard: Hazard;
  x: number;
  y: number;
  colour: string;
  private from: { x: number; y: number; c: string } | null = null;
  private t0 = 0;
  moving = false;
  constructor(
    tx: number,
    top: number,
    public wTiles: number,
    colour: keyof typeof CORAL,
  ) {
    super();
    this.layer = 2;
    this.x = px(tx);
    this.y = px(top);
    this.colour = colour;
    const self = this;
    this.hazard = { active: true, cause: 'kvt-octopus', hits: (x, y, w, h) => x < self.x + px(self.wTiles) - 1 && x + w > self.x + 1 && y < FLOOR + 30 && y + h > self.y - 1 };
  }
  /** crawl to another head (tile x, top row), turning its colour, over `sec` */
  crawl(w: World, tx: number, top: number, colour: keyof typeof CORAL, sec = 0.9, wTiles = this.wTiles) {
    this.wTiles = wTiles;
    this.from = { x: this.x, y: this.y, c: this.colour };
    this.t0 = w.tick;
    this.moving = true;
    const to = { x: px(tx), y: px(top) };
    const n = Math.round(sec / DT);
    w.onTick(() => {
      if (!this.moving || !this.from) return;
      const k = Math.min(1, (w.tick - this.t0) / n);
      this.x = this.from.x + (to.x - this.from.x) * k;
      this.y = this.from.y + (to.y - this.from.y) * k - Math.sin(k * Math.PI) * 18;
      this.colour = colour;
      this.mixK = k;
      if (k >= 1) {
        this.moving = false;
        this.y = to.y;
        this.mixK = 1;
      }
    });
  }
  mixK = 1;
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const [a, b] = CORAL[this.colour];
    const from = this.from ? CORAL[this.from.c] : CORAL[this.colour];
    const ca = this.mixK < 1 ? mix(from[0], a, this.mixK) : a;
    const cb = this.mixK < 1 ? mix(from[1], b, this.mixK) : b;
    const wpx = px(this.wTiles);
    if (this.moving) {
      // crawling: a soft body and trailing arms, in the colour it is turning
      ctx.fillStyle = ca;
      ctx.beginPath();
      ctx.ellipse(this.x + wpx / 2, this.y + 4, wpx / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = cb;
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + 4 + i * (wpx / 4), this.y + 8);
        ctx.quadraticCurveTo(this.x + i * (wpx / 4) + Math.sin(t * 8 + i) * 4, this.y + 14, this.x + 2 + i * (wpx / 4), this.y + 20);
        ctx.stroke();
      }
      return;
    }
    // sitting: a coral head, the same shape as its neighbours; only its speckles drift
    coralBlock(ctx, this.x, this.y, wpx, ca, cb, t * 4);
    // an eye that opens now and then
    if (Math.sin(t * 1.7) > 0.93) {
      ctx.fillStyle = '#FFF8E1';
      ctx.fillRect(this.x + wpx - 6, this.y + 5, 2.4, 1.6);
      ctx.fillStyle = '#111';
      ctx.fillRect(this.x + wpx - 5.4, this.y + 5.4, 1.2, 1);
    }
  }
}

/** KVT-10's room: coral heads across the lagoon. The dark hole is the octopus's den, and solid; the bright head past it is the octopus. */
function octopusRoom(): LevelDef {
  return {
    id: 'KVT-10',
    city: 'KVT',
    index: 10,
    name: 'Neerali Kuzhi',
    nameEn: 'Octopus Hole',
    tagline: 'The reef is full of colour. One of the colours is looking at you.',
    hint: 'One coral head is an octopus, the same colour as the coral: its colour moves, and it grabs. The dark hole with shells round it is its den, and the den is solid rock: stand on it. Jump over the octopus.',
    par: 10,
    scene: { kind: 'water', place: 'Kavaratti lagoon', with: ['palms'] },
    map: Grid.ground(15, 32).pit(6, 24).put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      pool(w, 6, 25, 15.3, { colors: LAGOON });
      w.add(new CoralHead(7, 14, 4, 'pink'));
      w.add(new CoralHead(11, 14, 4, 'rock', true));
      w.add(new Octopus(15, 14, 2, 'yellow'));
      w.add(new CoralHead(17, 14, 4, 'yellow'));
      w.add(new CoralHead(21, 14, 3, 'pink'));
      sign(w, 2.4, 10.6, 3.6, 'REEF', 'wood', 'right', 'look, don’t touch');
      rival(w, 4, 15, 1, taraOf(8));
      onPass(w, px(4.5), (w2) => w2.guide('Ee reef-il neerali undu. | There are octopuses on this reef.', (w3) => w3.player.x < px(11)));
      collectible(w, 'shell', 13, 11.4);
    },
  };
}

/** KVT-10 act 1: two dark holes. The one ringed with shells is a den (solid); the bare one is a real hole down to the lagoon. And an octopus that crawls to another head as you come. */
const midden: Act = {
  id: 'kvt10-midden',
  w: 34,
  advice: 'Two dark holes: the one ringed with shells is a den, solid rock; the bare one is a hole in the reef. And watch the colours: the octopus crawls to a new head as you come, and turns its colour.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 31);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 32, 15.3, { colors: LAGOON });
    w.add(new CoralHead(c.x + 4, 14, 4, 'green'));
    // a rock with a dark hole in its top and no shells: the hole goes right through, down to the lagoon
    w.add(new CoralHead(c.x + 9, 14, 1, 'rock'));
    w.add(new CoralHead(c.x + 12, 14, 3, 'rock'));
    w.add(
      new Paint((ctx) => {
        ctx.fillStyle = '#8D7B66';
        ctx.fillRect(X(10) - 2, px(14) + 3, 36, 3);
        ctx.fillStyle = '#140C0A';
        ctx.beginPath();
        ctx.ellipse(X(11), px(14) + 2, 16, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();
      }, 2),
    );
    w.add(new CoralHead(c.x + 16, 14, 4, 'rock', true));
    const oct = w.add(new Octopus(c.x + 21, 14, 4, 'yellow'));
    const old = w.add(new CoralHead(c.x + 21, 14, 4, 'yellow'));
    old.solid.collidable = false;
    const pink = w.add(new CoralHead(c.x + 25, 14, 2, 'pink'));
    w.add(new CoralHead(c.x + 28, 14, 4, 'yellow'));
    // as you reach the far side of the bare hole, it leaves its yellow head for the pink one, turning pink as it goes
    onPass(w, X(12), (w2) => {
      pink.solid.collidable = false;
      old.solid.collidable = true;
      oct.crawl(w2, c.x + 25, 14, 'pink', 0.9, 2);
      w2.flags[c.f('crawled')] = 1;
    });
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'DENS', 'wood', null, 'shells at the door');
    onPass(w, X(1), (w2) => w2.guide('Shankhu ulla kuzhi neeraliyude veedu. | A hole with shells is an octopus’s home.', (w3) => w3.player.x < X(13)));
  },
};

/** KVT-10 act 2, the city called back in a new order: the tour's coral steps shrinking with the tide, and between
 *  them a hole with two eyes in it (KVT-06's moray), not shells. */
const tideHoles: Act = {
  id: 'kvt10-irakkam',
  w: 24,
  advice: 'The tide is going out: each coral step shrinks to its one-tile top as you come. Wait at the edge till it has, then hop on and off. The hole between them has eyes, not shells: a moray. Let it lunge and slide back, then cross.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 8).pit(c.x + 14, c.x + 19);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 9, 15.3, { colors: LAGOON });
    pool(w, c.x + 14, c.x + 20, 15.3, { colors: LAGOON });
    const s1 = w.add(new CoralStep(c.x + 5, 15));
    const s2 = w.add(new CoralStep(c.x + 16, 15));
    w.add(new Eel(X(11) + 8, FLOOR, -1, 40));
    onPass(w, X(1), (w2) => s1.turn(w2));
    onPass(w, X(12.5), (w2) => s2.turn(w2));
    w.onTick((w2) => {
      w2.flags[c.f('tide')] = [s1.settled, s2.settled];
    });
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'EBB TIDE', 'wood', null, 'low water 4 pm');
    onPass(w, X(2), (w2) => taraSays(w2, 'Odi chaadu, Dad! Vellam pokunnu! | Run and jump, Dad! The water’s going!', 2.4));
  },
};

/** KVT-10 act, KVT-02 turned over: the jetty ends at the pier head, a wall. The rotten plank you learnt to jump
 *  is the way on: stand on it and it drops you to the boat catwalk underneath, which runs under the wall. */
const plank: Act = {
  id: 'kvt10-palaka',
  w: 34,
  advice: 'The jetty ends at a wall. The rotten plank is the way on this time: stand on it and it drops you on to the catwalk underneath, which goes under the wall.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 2, 13, 17, '#');
    g.pit(x + 3, x + 31);
    // the catwalk under the jetty: the stretch under the far planks hangs from them (built below, not painted)
    g.fill(x + 7, x + 10, 14, 14, '#').fill(x + 16, x + 31, 14, 14, '#');
    g.fill(x + 16, x + 17, 0, 10, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 32, 15.3, { colors: LAGOON });
    w.add(new Thing('jetty', X(3), px(11), { w: px(6) }));
    // the far planks, past the rotten one, are as rotten underneath: land on them and they go, and the catwalk
    // hung from them goes too. (Walk under them on the catwalk and they hold.)
    const far = w.add(new Thing('jetty', X(11), px(11), { w: px(5) }));
    const hung = w.add(new Thing('jetty', X(11), px(14), { w: px(5) }));
    let farGone = false;
    w.when(
      (w2) => !farGone && w2.standing(far.solid),
      (w2) => {
        farGone = true;
        w2.sfx('crack', far.cx, far.y);
        far.fall(w2, { delay: 0.1, land: false });
        hung.fall(w2, { delay: 0.1, land: false });
      },
    );
    const rotten = w.add(new Thing('jetty', X(9), px(11), { w: px(2) }));
    rotten.tint = '#5D4037';
    let gone = false;
    w.when(
      (w2) => !gone && w2.standing(rotten.solid),
      (w2) => {
        gone = true;
        w2.sfx('crack', rotten.cx, rotten.y);
        rotten.fall(w2, { delay: 0.06, land: false });
        w2.flags[c.f('dropped')] = 1;
      },
    );
    sign(w, c.x + 12, 11 - 4.4, 3.4, 'PIER HEAD', 'warn', null, 'no way through');
    onPass(w, X(5), (w2) => taraSays(w2, 'Aa palaka chaadi kadakku! | Jump that plank!', 2.4));
  },
};

/** a coral head in the incoming tide: stay on it a moment and the water comes over it (it comes back up later) */
export class SinkStep extends Entity {
  solid: Solid;
  private on = 0;
  private settle = 0;
  private under = 0;
  constructor(
    tx: number,
    readonly top: number,
    readonly wTiles = 3,
    /** 'stand': goes under if you stand on it (the tour's tide); 'move': goes under if you keep moving on it */
    readonly sinks: 'stand' | 'move' = 'stand',
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(px(tx), px(top), px(wTiles), px(18 - top));
  }
  private get limit() {
    return this.sinks === 'move' ? 40 : 84;
  }
  update(w: World) {
    if (this.under > 0) {
      this.under--;
      if (this.under === 0) {
        const p = w.player;
        if (this.solid.overlaps(p.x, p.y, p.w, p.h)) this.under = 1;
        else this.solid.collidable = true;
      }
      return;
    }
    // (a 'move' head counts the ticks you are moving on it; stand still on it a moment and it settles again)
    const stand = w.standing(this.solid);
    const moving = stand && Math.abs(w.player.vx) > 30;
    this.settle = stand && !moving ? this.settle + 1 : 0;
    if (this.sinks === 'move') this.on = moving ? this.on + 1 : this.settle >= 20 || !stand ? 0 : this.on;
    else this.on = stand ? this.on + 1 : 0;
    if (this.on >= this.limit) {
      this.solid.collidable = false;
      this.under = 240;
      this.on = 0;
      w.sfx('splash', this.solid.x + 24, this.solid.y);
      w.emit('fx', this.solid.x + 24, this.solid.y + 6, { kind: 'splash' });
    }
  }
  draw(ctx: CanvasRenderingContext2D) {
    const s = this.solid;
    const sunk = !s.collidable;
    coralBlock(ctx, s.x, s.y + (sunk ? 14 : 0), s.w, sunk ? '#7FA8B0' : '#E9A898', sunk ? '#4F7F88' : '#C98B7B');
    // (the strip shows only while it is going under: on a 'move' head, once you have moved on it a while)
    if (!sunk && this.on > (this.sinks === 'move' ? 12 : 30)) {
      ctx.fillStyle = 'rgba(200,240,255,0.7)';
      ctx.fillRect(s.x, s.y - 1 + (this.limit - this.on) / 20, s.w, 2);
    }
  }
}

/** KVT-10 act, the tour turned over: the tide is coming in now. The coral heads don't shrink; they go under if you
 *  stand on one. The tour taught you to wait on the top before the hop off: here you never stop. */
const risingTide: Act = {
  id: 'kvt10-veliyettam',
  cps: [20],
  w: 24,
  advice: 'The tide is coming in, and these coral heads go under while you move on them: run across one and it sinks under your feet. Stand still on each and it holds; hop to the next from a standstill.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 18);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 19, 15.3, { colors: LAGOON });
    // (three heads, four, three and four tiles, with gaps of one, two and one: not the same hop twice)
    for (const [tx, wd] of [[4, 4], [9, 3], [14, 4]] as const) w.add(new SinkStep(c.x + tx, 14, wd, 'move'));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'HIGH TIDE', 'wood', null, 'coming in');
    onPass(w, X(1), (w2) => taraSays(w2, 'Odu, Dad! Nilkkalle! | Run, Dad! Don’t stop!', 2.4));
  },
};

/** KVT-10 act, the storm bank and the octopus together: on the second step the far tile, where KVT-09 taught you
 *  to land, is an octopus the colour of the rubble. Land in the middle of that step instead, and go over it. */
const rubbleOctopus: Act = {
  id: 'kvt10-kallu',
  w: 30,
  advice: 'Kalpeni’s rubble again, but the far tile of the second step is an octopus the colour of the rubble: its speckles drift. Land in the middle of that step, and jump on over the octopus.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 4);
    bankUp(g, x + 5, 4, 3, 14);
    g.fill(x + 17, x + 23, 10, 17, '#').fill(x + 24, x + 25, 12, 17, '#').fill(x + 26, x + 27, 14, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 5, 15.3, { colors: LAGOON });
    const r = bankUpRects(c.x + 5, 4, 3, 14);
    r[1] = { ...r[1], c1: r[1].c1 - 1 };
    w.add(new RubbleBank(r));
    w.add(new Octopus(c.x + 10, 13, 1, 'rubble'));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'LOOSE', 'warn', null, 'coral rubble');
    onPass(w, X(3), (w2) => taraSays(w2, 'Kallumala pole thanne! Akathu chaadu! | Just like Kalpeni! Land deep!', 2.4));
  },
};

/** KVT-10 act, KVT-05 turned over: the tuna boat flings its catch along the pier again, but higher, over a
 *  standing dad's head. Hopping them, as in Minicoy, meets them. Walk under them; hop the gaps in the pier just
 *  after a fish has gone over. */
const highTuna: Act = {
  id: 'kvt10-choora',
  w: 40,
  advice: 'The tuna fly higher here, right over your head while you walk: don’t hop them, that is where they are. Hop the gaps in the pier (the second is wider) just after one has gone over. The second boat throws low again, as in Minicoy: hop those.',
  paint: (g, c) => {
    // (two gaps, the second a tile wider: never the same hop twice)
    g.pit(c.x + 10, c.x + 10).pit(c.x + 18, c.x + 19);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 10, c.x + 11, 15.3, { colors: LAGOON });
    pool(w, c.x + 18, c.x + 20, 15.3, { colors: LAGOON });
    let on = false,
      on2 = false;
    const fling = () => {
      if (w.state !== 'play') return;
      if (w.player.x < X(25)) shot(w, 'kvt-tuna', X(26), FLOOR - 50, -170, 0, 0, 'hit');
      w.after(1.3, fling);
    };
    // the second boat, past the gaps, throws at head height again
    const fling2 = () => {
      if (w.state !== 'play') return;
      if (w.player.x < X(38)) shot(w, 'kvt-tuna', X(40), FLOOR - 20, -170, 0, 0, 'hit');
      w.after(1.3, fling2);
    };
    onPass(w, X(1), () => {
      if (on) return;
      on = true;
      fling();
    });
    onPass(w, X(25), () => {
      if (on2) return;
      on2 = true;
      fling2();
    });
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'TUNA', 'wood', null, 'mind your head');
    onPass(w, X(2), (w2) => taraSays(w2, 'Meen varunnu, chaadu! | Fish coming, jump!', 2.4));
  },
};

/** KVT-10 act, the tour turned over: a turtle nest hatches behind you this time, and the babies scramble the
 *  way you are going, to the lagoon ahead. Stop and wait for them, as on the jetty at Kavaratti, and they run into
 *  you. Keep going, and over the water before they get there. */
const turtlesBehind: Act = {
  id: 'kvt10-aama',
  cps: [26.5],
  w: 42,
  advice: 'A nest hatches behind you and the babies run the way you are going, to the water ahead: don’t stop for them this time, run on and hop the water. The next nest is ahead of you: that one you wait for, till every baby is in.',
  paint: (g, c) => {
    g.pit(c.x + 20, c.x + 21).pit(c.x + 37, c.x + 38);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 20, c.x + 22, 15.3, { colors: LAGOON });
    pool(w, c.x + 37, c.x + 39, 15.3, { colors: LAGOON });
    const nest = Nest.place(w, { tx: c.x + 3, groundTy: 15, waterTx: c.x + 20, line: 'Aamakkunjungal! Kadalilekku! | Baby turtles! Off to the sea!' });
    onPass(w, X(5), (w2) => nest.hatch(w2));
    onPass(w, X(8), (w2) => taraSays(w2, 'Nilkku, Dad! Kunjungal pokatte! | Stop, Dad! Let the babies go first!', 2.4));
    // the second nest is ahead of you: its babies cross in front, and this time you do wait
    const ahead = Nest.place(w, { tx: c.x + 29, groundTy: 15, waterTx: c.x + 37 });
    onPass(w, X(24), (w2) => ahead.hatch(w2));
    w.onTick((w2) => {
      w2.flags[c.f('ahead')] = ahead.done ? 1 : 0;
    });
    onPass(w, X(25), (w2) => taraSays(w2, 'Odu, Dad! Ippozhum odu! | Run, Dad! Keep running!', 2.4));
  },
};

/** KVT-10 act, KVT-06 turned over: two moray holes in the reef flat. On the reef you crossed once the moray had
 *  lunged and slid back; these slide back and strike again at once. Cross after the second strike. */
const twiceEels: Act = {
  id: 'kvt10-irandu',
  cps: [12.5],
  w: 26,
  advice: 'Two moray holes, and these morays strike twice: after the first lunge one slides back and comes straight out again. Wait for the second strike to go back in, then cross.',
  build: (w, c) => {
    const { X } = c;
    const e1 = w.add(new Eel(X(8) + 8, FLOOR, -1, 40, true));
    w.add(new Eel(X(17) + 8, FLOOR, -1, 40, true));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'MORAY', 'warn', null, 'they bite twice');
    // Tara the moment the first strike has slid back in: the lie the second strike waits for
    w.when(
      () => e1.strikes >= 1,
      (w2) => taraSays(w2, 'Poyi! Ippo odu! | It’s gone in! Run now!', 2),
    );
  },
};

/** KVT-10 act, KVT-04 turned over: at Agatti you jumped while the wind was calm. This inlet is too wide for any
 *  jump in the calm: wait for the sea breeze to blow, and let it carry you over. */
const breeze: Act = {
  id: 'kvt10-kaattu',
  cps: [13],
  w: 36,
  advice: 'This inlet is too wide for a jump in the calm: wait at the edge for the breeze to blow (the sand streaks show it), and jump while it blows. The next inlet has the breeze in your face: that one you jump in the calm.',
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 9).pit(c.x + 21, c.x + 22);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 5, c.x + 10, 15.3, { colors: LAGOON });
    pool(w, c.x + 21, c.x + 23, 15.3, { colors: LAGOON });
    gust(w, c.x + 5.5, 9, 4.5, 7, 95, { period: 3.0, on: 1.4, phase: 0 });
    gust(w, c.x + 21, 9, 2, 7, -95, { period: 3.0, on: 1.4, phase: 1.5 });
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'BREEZE', 'green', 'right', 'from the sea');
    onPass(w, X(2), (w2) => taraSays(w2, 'Kaattu nilkkumbol chaadu! | Jump when the wind stops!', 2.4));
    onPass(w, X(17), (w2) => taraSays(w2, 'Kaattu varumbol chaadu! | Jump with the wind!', 2.4));
  },
};

/** KVT-10 act, KVT-07 turned over: up the palms the crowns were safe and the trunks were the crabs'. On this palm
 *  the coconut crab lives in the crown. Climb only part way up and leap from the trunk to the next palm. */
const crownCrab: Act = {
  id: 'kvt10-thengu',
  w: 30,
  advice: 'This palm’s coconut crab lives up in its crown: don’t climb on to it. Climb part way and leap from the trunk to the next palm; that one’s crown is clear.',
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 14);
  },
  build: (w, c) => {
    pool(w, c.x + 2, c.x + 15, 15.3, { colors: LAGOON });
    const a = palm(w, c.x + 4, px(16), 130, { crownW: 30 });
    palm(w, c.x + 8, px(16), 130, { crownW: 30 });
    w.add(new PalmCrab(a, 0.93, 1, 12, 0.97, 1));
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'CRAB', 'wood', null, 'in the crown');
    onPass(w, c.X(1), (w2) => taraSays(w2, 'Mukalil vare kayari nilkku! | Climb right up and stand on top!', 2.4));
  },
};

/** KVT-10 act, KVT-08 turned over: you rode the dolphins and jumped off at the top of the leap. This one leaps
 *  under a reef arch with a jagged underside: stay on its back until it is coming down, and step off at the end. */
const archDolphin: Act = {
  id: 'kvt10-kamaanam',
  w: 22,
  advice: 'The dolphin leaps under a reef arch, jagged underneath: jumping off at the top meets it. Ride it over the top and step off as it comes down to the far bank.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 15);
    g.fill(x + 8, x + 12, 6, 7, '#').fill(x + 8, x + 12, 8, 8, 'v');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 16, 15.3, { colors: LAGOON });
    const d = w.add(new Dolphin(X(4), X(14.5), px(15) + 4, 70, 1.7, 3.4, 0));
    w.flags[c.f('dolphins')] = [d];
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'ARCH', 'wood', null, 'mind your head');
    onPass(w, X(1), (w2) => taraSays(w2, 'Mukalil ethumbol chaadu! | Jump off at the top!', 2.4));
  },
};

/** a coral step out in the lagoon that the lighthouse beam sweeps over: solid in the dark, gone while the beam is
 *  on it (the light shows the water right through it) */
export class ShadowStep extends Entity {
  solid: Solid;
  constructor(
    tx: number,
    readonly top: number,
    readonly period: number,
    readonly lit: number,
    readonly phase: number,
  ) {
    super();
    this.layer = 1;
    this.solid = new Solid(px(tx), px(top), px(3), 10);
  }
  /** seconds into its cycle: 0..lit is the beam on it */
  at(w: World) {
    return ((((w.tick * DT - this.phase) % this.period) + this.period) % this.period);
  }
  isLit(w: World) {
    return this.at(w) < this.lit;
  }
  update(w: World) {
    const on = !this.isLit(w);
    if (on !== this.solid.collidable) {
      const p = w.player;
      // (it only comes back where Dad isn't standing in its place)
      if (on && this.solid.overlaps(p.x, p.y, p.w, p.h)) return;
      this.solid.collidable = on;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    if (this.isLit(w)) {
      // the beam on it: bright, and see-through
      ctx.fillStyle = 'rgba(255,244,170,0.55)';
      ctx.fillRect(s.x - 2, s.y - 40, s.w + 4, 40 + s.h);
      ctx.strokeStyle = 'rgba(150,110,60,0.9)';
      ctx.strokeRect(s.x + 0.5, s.y + 0.5, s.w - 1, s.h - 1);
      return;
    }
    ctx.fillStyle = '#6E5A4A';
    ctx.fillRect(s.x, s.y, s.w, s.h);
    ctx.fillStyle = '#8D7462';
    ctx.fillRect(s.x, s.y, s.w, 3);
  }
}

/** KVT-10 act, KVT-03 turned over: on Supari Light the beam built your bridge. Out here the coral steps are
 *  shadows: the beam passing over one shows the water right through it. Step on each one just after the light
 *  has gone by, and follow behind the sweep. */
const shadowSteps: Act = {
  id: 'kvt10-nizhal',
  w: 24,
  advice: 'The lighthouse beam sweeps over these steps the other way about: a step is gone while the light is on it. Step on each just after the beam has passed, and follow behind it.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 19);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 20, 15.3, { colors: LAGOON });
    const steps = [4, 8, 12, 16].map((t, i) => w.add(new ShadowStep(c.x + t, 14, 3.6, 0.8, i * 0.8)));
    w.flags[c.f('steps')] = steps;
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'SUPARI', 'wood', 'right', 'the beam, again');
    onPass(w, X(1), (w2) => taraSays(w2, 'Velicham ulla padiyil chaadu! | Jump on the lit step!', 2.4));
  },
};

/** KVT-10 act, KVT-02 turned over: at the jetty the boat left as you came and came back if you waited. This boat
 *  pulls out as you come and is not coming back: run down the jetty and jump aboard as it goes. (And the old
 *  planks at the end still go if you stand on them.) */
const leavingBoat: Act = {
  id: 'kvt10-thoni',
  cps: [26.5],
  w: 30,
  advice: 'This boat pulls out as you come and it is not coming back: run down the jetty and jump aboard while it is still close, ride it over, and step off at the far side.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 24);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 25, 15.3, { colors: LAGOON });
    const end = w.add(new Thing('jetty', X(4), px(15), { w: px(3) }));
    let stood = 0,
      gone = false;
    w.onTick((w2) => {
      if (gone) return;
      stood = w2.standing(end.solid) ? stood + 1 : 0;
      if (stood === 60) w2.sfx('creak', end.cx, end.y);
      if (stood >= 90) {
        gone = true;
        w2.sfx('crack', end.cx, end.y);
        end.fall(w2, { delay: 0, land: false });
      }
    });
    const boat = w.add(new Thing('odam', X(7.2), px(14) + 4, {}));
    w.flags[c.f('boat')] = boat;
    onPass(w, X(2), (w2) => {
      w2.say('Pokaam! | Off we go!', boat.cx, boat.y - 30, 1, 'npc');
      boat.moveTo(w2, X(20), boat.y, 5.5, 'inOut');
    });
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'BOAT', 'wood', 'right', 'last one today');
    onPass(w, X(3), (w2) => taraSays(w2, 'Nilkku, Dad! Odam thirichu varum! | Wait, Dad! The boat comes back!', 2.4));
  },
};

/** a stretch of reef just under the water, four tiles: it comes up to the surface when called */
class ReefStone extends Entity {
  solid: Solid;
  constructor(tx: number) {
    super();
    this.layer = 1;
    this.solid = new Solid(px(tx), px(G), px(4), px(3));
    this.solid.collidable = false;
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (!this.solid.collidable) return;
    const s = this.solid;
    coralBlock(ctx, s.x, s.y, s.w, '#D9C29A', '#A88F68');
  }
}

/** KVT-10 act, KVT-03's reef turned over: there the reef rose under your feet only if you walked off the jetty.
 *  This reef rises only for a jumper: walk off the edge and you go in; jump out over the water and it comes up to
 *  catch you, one stretch after another. */
const jumpReef: Act = {
  id: 'kvt10-paaru',
  w: 22,
  advice: 'This reef only comes up for a dad who jumps: walk off the edge and you go in. Jump out over the water and each stretch rises to catch you; jump again from it.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 17);
  },
  build: (w, c) => {
    pool(w, c.x + 4, c.x + 18, 15.3, { colors: ['rgba(20,110,150,0.92)', 'rgba(8,50,90,0.98)'] });
    for (const t of [5, 9, 13]) panel(w, c.x + t, G + 0.3, 4, 0.5, 'rgba(240,220,170,0.16)', 'rgba(0,0,0,0)');
    const stones = [5, 9, 13].map((t) => w.add(new ReefStone(c.x + t)));
    // (a jump, even one taken in the moment after stepping off the edge, counts; a walk off does not)
    let jumped = false;
    w.onTick((w2) => {
      const p = w2.player;
      if (p.onGround) jumped = false;
      else if (p.vy < -50) jumped = true;
      if (p.onGround || !jumped || p.vy <= 0) return;
      for (const st of stones) {
        if (st.solid.collidable) continue;
        if (p.cx > st.solid.x && p.cx < st.solid.x + st.solid.w) {
          st.solid.collidable = true;
          w2.sfx('splash', st.solid.x + 32, st.solid.y);
          w2.emit('fx', st.solid.x + 32, st.solid.y + 4, { kind: 'splash' });
        }
      }
    });
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'PHAR', 'wood', 'right', 'the reef');
    onPass(w, c.X(2), (w2) => taraSays(w2, 'Nadannu po, phar varum! | Walk on, the reef will come!', 2.4));
  },
};

/** KVT-10 act, KVT-05's fish basket turned over: in Minicoy it hauled you up and you got off at the top. This
 *  one lowers you from the high pier to the boats, and it doesn't stop at the bottom: it goes on into the water.
 *  Step off on to the landing as it passes. */
const lowerBasket: Act = {
  id: 'kvt10-kotta',
  w: 24,
  advice: 'Up the steps to the high pier. This fish basket lowers you, and it doesn’t stop at the bottom: it goes on into the water. Step off on to the landing as it goes past.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 2, 13, 17, '#').fill(x + 3, x + 6, 11, 17, '#');
    g.pit(x + 7, x + 9);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 7, c.x + 10, 15.3, { colors: LAGOON });
    const basket = w.add(new Thing('crate', X(7), px(11), { w: px(3), h: 12 }));
    basket.tint = '#B07A3A';
    let down = false;
    let by = basket.solid.y;
    w.onTick((w2) => {
      if (!down && w2.standing(basket.solid)) {
        down = true;
        w2.sfx('creak', basket.cx, basket.y);
        w2.say('Thazhekku! | Going down!', basket.cx, basket.y - 30, 1, 'npc');
      }
      if (down && by < px(17)) {
        by += 40 * DT;
        basket.place(w2, basket.solid.x, by);
      }
    });
    w.flags[c.f('basket')] = basket;
    sign(w, c.x + 3.2, 11 - 4.4, 3.4, 'FISH', 'wood', 'right', 'to the boats');
    onPass(w, X(4), (w2) => taraSays(w2, 'Avasaanam vare irunno! | Stay in till the end!', 2.4));
  },
};

/** KVT-10 act, KVT-02's glass jetty turned over: there the gap was glass you walked across. This glass is old
 *  and cracked: it holds a dad running flat out, and gives under one who slows down on it to look at the fish. */
const crackedGlass: Act = {
  id: 'kvt10-kannadi',
  w: 20,
  advice: 'The glass over the lagoon is cracked this time: it holds you while you run flat out, and gives way if you slow down or stop on it. Run straight across.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 13);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 14, 15.3, { colors: LAGOON });
    const glass = new Solid(X(4), px(G), px(10), 6);
    let slow = 0;
    w.add(
      new (class extends Entity {
        solid = glass;
        update(w2: World) {
          if (!glass.collidable) return;
          const p = w2.player;
          slow = w2.standing(glass) && Math.abs(p.vx) < 100 ? slow + 1 : 0;
          if (slow >= 24) {
            glass.collidable = false;
            w2.sfx('crack', p.cx, glass.y);
            w2.say('Kannadi poyi! | The glass went!', p.cx, glass.y - 30, 1, 'npc');
          }
        }
        draw(ctx: CanvasRenderingContext2D) {
          if (!glass.collidable) return;
          ctx.fillStyle = 'rgba(205,245,255,0.32)';
          ctx.fillRect(glass.x, glass.y, glass.w, glass.h);
          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          for (const t of [1.5, 4.2, 7.1, 8.6]) {
            ctx.moveTo(glass.x + px(t), glass.y);
            ctx.lineTo(glass.x + px(t) + 5, glass.y + 6);
            ctx.lineTo(glass.x + px(t) - 2, glass.y + 6);
          }
          ctx.stroke();
        }
      })(),
    );
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'GLASS', 'wood', null, 'cracked');
    onPass(w, X(3), (w2) => taraSays(w2, 'Pathukke nadakku, meene kaanam! | Walk slowly, see the fish!', 2.4));
  },
};

export const kvt10 = { room: octopusRoom, acts: [midden, plank, rubbleOctopus, turtlesBehind, highTuna, crownCrab, twiceEels, breeze, archDolphin, shadowSteps, risingTide, jumpReef, lowerBasket, crackedGlass, leavingBoat, tideHoles].map(lead) };

/** KVT-10's door: the octopus lies across the threshold, the colour of the sand. Its arm is the patch of sand that moves. */
const sandArm: Ending = {
  // (the checkpoint before the door sits far enough back that a jump over it still lands before the arm)
  space: 13,
  after: 4,
  advice: 'Last trick: in front of the door, a patch of the sand is the octopus’s arm, the colour of the sand. The sand that moves is the arm: jump over it, into the door.',
  build(w, d) {
    const D = Math.round(d.x / 16);
    const x0 = px(D - 3),
      x1 = px(D - 1);
    let up = 0;
    w.flags.twist = 'sand';
    w.flags.arm = [x0, x1];
    const arm = {
      active: true,
      cause: 'kvt-octopus',
      hits: (x: number, y: number, ww: number, h: number) => x < x1 && x + ww > x0 && y + h > FLOOR - 4 - up * 10,
    };
    w.add(
      new (class extends Entity {
        hazard = arm;
        update(w2: World) {
          const p = w2.player;
          const near = p.x + p.w > x0 - px(2) && p.x < x1 + 4 && p.y + p.h > FLOOR - 20;
          up = Math.max(0, Math.min(1, up + (near ? 0.12 : -0.05)));
        }
        draw(ctx: CanvasRenderingContext2D, w2: World) {
          const t = w2.tick * DT;
          // the arm lies flat as sand, ripples (the colour that moves), and curls up when you come close
          for (let x = x0; x < x1; x += 2) {
            const k = (x - x0) / (x1 - x0);
            const yy = FLOOR - 1 - up * Math.sin(k * Math.PI) * 12 + Math.sin(t * 3 + x * 0.3) * 0.6;
            ctx.fillStyle = (Math.floor(x / 2 + t * 6) % 5 === 0) ? '#E6D9BC' : '#F1E7CF';
            ctx.fillRect(x, yy - 2, 2, 3 + up * 3);
          }
          if (up > 0.5) {
            ctx.fillStyle = 'rgba(200,120,100,0.8)';
            for (let i = 0; i < 4; i++) ctx.fillRect(x0 + 4 + i * 7, FLOOR - 3 - up * 8, 2, 2);
          }
        }
      })(),
    );
    w.when(
      (w2) => w2.player.x > x0 - px(5),
      (w2) => taraSays(w2, 'Nadannu kayaru, Dad! Vaathil ivide! | Just walk in, Dad! The door’s here!', 2.4),
    );
    void D;
  },
};

export const encoreEndings: Record<KvtEncoreEndingKind, Ending> = {
  'kvt-buried-door': buriedDoor,
  'kvt-sand-arm': sandArm,
};
