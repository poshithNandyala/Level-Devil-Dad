// Kavaratti's encore stages (the shipped city's pass): KVT-09 Kalpeni Storm Bank and KVT-10 Octopus Hole,
// with their acts and door endings.
import { Entity, type Hazard, type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { collectible, door, px, rival, sign, prop } from '../../levels/kit';
import { type Act, G, pool } from '../../levels/acts';
import { onPass } from '../../levels/trolls';
import { DT } from '../../constants';
import { Grid } from '../../levels/grid';
import { Solid } from '../../body';
import { FLOOR, Paint, npc, tara as taraSays } from '../../levels/endkit';
import type { Ending } from '../../levels/endkit';
import { CoralStep } from './tide';
import { Eel } from './levels';

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
  private dust: { x: number; y: number; t: number }[] = [];
  constructor(
    readonly rects: RubbleRect[],
    /** which way the lagoon is: -1 left (climbing a face), 1 right (coming down the other side) */
    readonly dir: -1 | 1 = -1,
  ) {
    super();
    this.layer = 3;
  }
  on(w: World): RubbleRect | undefined {
    const p = w.player;
    const feet = Math.round(p.y + p.h);
    return this.rects.find((r) => feet === px(r.top) && p.x + p.w > px(r.c0) && p.x < px(r.c1 + 1));
  }
  update(w: World) {
    const p = w.player;
    if (this.slide > 0) {
      this.slide--;
      p.moveX(w, (this.avalanche ? 3 : 2) * this.dir);
      p.vx = 0;
      p.stun = Math.max(p.stun, 2);
      if (this.slide % 3 === 0) this.dust.push({ x: p.cx, y: p.y + p.h, t: w.tick });
      // carried over the edge of the step: the rubble you brought down comes with you, all the way down
      if (this.slide === 0 && !p.onGround) this.avalanche = true;
      if (this.slide === 0 && this.avalanche && p.onGround && this.on(w)) this.slide = 6;
    } else if (w.state === 'play' && p.onGround && !this.was && this.on(w)) {
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
      for (let i = 0; i < 3; i++) ctx.fillRect(d.x + this.dir * (6 + k * 22 + i * 3), d.y - 2 + k * 10 + i, 2, 2);
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
  w: 42,
  advice: 'The second face is taller, with a lip of cemented beach rock over it, jagged underneath: a full leap hits it. Take these steps with a middling jump, still landing deep.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 4, x + 5);
    bankUp(g, x + 6, 7, 3, 14);
    // the lip of beach rock over the near two tiles of steps 2-6, jagged underneath, four rows over each: a tap
    // from the step below clears it, a full leap doesn't
    for (let i = 1; i <= 5; i++) {
      const c0 = x + 6 + i * 3,
        top = 14 - i;
      g.fill(c0, c0 + 2, top - 6, top - 5, '#');
      g.fill(c0, c0 + 1, top - 4, top - 4, 'v');
    }
    g.fill(x + 27, x + 33, 8, 17, '#');
    g.fill(x + 34, x + 35, 10, 17, '#').fill(x + 36, x + 37, 12, 17, '#').fill(x + 38, x + 39, 14, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 6, 15.3, { colors: LAGOON });
    w.add(new RubbleBank(bankUpRects(c.x + 6, 7, 3, 14)));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'LOOSE', 'warn', null, 'coral rubble');
    onPass(w, X(1), (w2) => w2.guide('Randaamathe kunnu, Dad. | The second bank, Dad.', (w3) => w3.player.x < X(9)));
  },
};

/** KVT-09 act 2: the crest the storm breached: two cuts of lagoon water through it, and rubble beyond each. */
const breaches: Act = {
  id: 'kvt09-murivu',
  w: 30,
  advice: 'The storm cut the crest in two places. The rubble past each cut slides you back towards it when you land: jump well past the cut, never just over it.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 1, x + 27, 13, 17, '#').fill(x + 28, x + 29, 14, 17, '#');
    g.pit(x + 6, x + 7, 13).pit(x + 16, x + 17, 13);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 6, c.x + 8, 15.3, { colors: LAGOON });
    pool(w, c.x + 16, c.x + 18, 15.3, { colors: LAGOON });
    w.add(
      new RubbleBank([
        { c0: c.x + 8, c1: c.x + 11, top: 13 },
        { c0: c.x + 18, c1: c.x + 21, top: 13 },
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
const SUMMIT = [3, 3, 3, 3, 2, 2, 2, 2];
/** the far side of the summit: rubble steps going down to the right, three tiles each, from row 7 to row 14 */
const DOWN = (x: number): RubbleRect[] => Array.from({ length: 8 }, (_, i) => ({ c0: x + 31 + i * 3, c1: x + 33 + i * 3, top: 7 + i }));
/** KVT-09 act 3: the highest part of the bank, where the steps narrow to two tiles. The slide still takes a tile. */
const summit: Act = {
  id: 'kvt09-kodumudi',
  w: 60,
  advice: 'Near the top the steps narrow to two tiles, and the slide still takes one: land on the far tile of each. Over the top the lagoon is on the other side, so the slide goes the other way: walk off each step, never hop down.',
  paint: (g, c) => {
    const x = c.x;
    g.pit(x + 3, x + 4);
    for (const r of bankWidths(x + 5, SUMMIT, 14)) g.fill(r.c0, r.c1, r.top, 17, '#');
    g.fill(x + 25, x + 30, 6, 17, '#');
    for (const r of DOWN(x)) g.fill(r.c0, r.c1, r.top, 17, '#');
    g.pit(x + 55, x + 56);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 5, 15.3, { colors: LAGOON });
    pool(w, c.x + 55, c.x + 57, 15.3, { colors: LAGOON });
    w.add(new RubbleBank(bankWidths(c.x + 5, SUMMIT, 14)));
    w.add(new RubbleBank(DOWN(c.x), 1));
    onPass(w, X(29), (w2) => taraSays(w2, 'Chaadi irangu, Dad! Vegam! | Hop down, Dad! Quick!', 2.4));
    sign(w, c.x + 0.4, G - 4.4, 3.4, 'KODUMUDI', 'wood', null, 'the top');
    onPass(w, X(1), (w2) => w2.guide('Mukalil padikal cheruthaanu. | The steps are small at the top.', (w3) => w3.player.x < X(18)));
  },
};

/** KVT-09 act: the sea wall the islanders built along the bank, broken by the storm in two places. In the first
 *  break the rubble is a heap you land deep on, as on the bank; in the second it is a single block: land on it
 *  and the slide takes you straight off. Jump that break whole. */
const seaWall: Act = {
  id: 'kvt09-kadalbhitti',
  w: 50,
  advice: 'Up the rubble to the sea wall. The storm broke the wall twice: the first break is a heap of rubble, land deep on it; the second is one loose block, and the slide takes you straight off it, so jump that break in one.',
  paint: (g, c) => {
    const x = c.x;
    bankUp(g, x + 2, 6, 3, 14);
    g.fill(x + 20, x + 43, 8, 17, '#');
    g.pit(x + 25, x + 26, 8).fill(x + 27, x + 29, 9, 17, '#').fill(x + 27, x + 29, 8, 8, '.');
    g.pit(x + 33, x + 33, 8).fill(x + 34, x + 34, 9, 17, '#').fill(x + 34, x + 34, 8, 8, '.').pit(x + 35, x + 35, 8);
    g.fill(x + 44, x + 45, 10, 17, '#').fill(x + 46, x + 47, 12, 17, '#').fill(x + 48, x + 49, 14, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new RubbleBank([...bankUpRects(c.x + 2, 6, 3, 14), { c0: c.x + 27, c1: c.x + 29, top: 9 }, { c0: c.x + 34, c1: c.x + 34, top: 9 }]));
    pool(w, c.x + 25, c.x + 27, 15.3, { colors: LAGOON });
    pool(w, c.x + 33, c.x + 34, 15.3, { colors: LAGOON });
    pool(w, c.x + 35, c.x + 36, 15.3, { colors: LAGOON });
    sign(w, c.x + 21, 8 - 4.4, 3.6, 'SEA WALL', 'green', null, 'PWD Kalpeni');
    onPass(w, X(30.5), (w2) => taraSays(w2, 'Aa kallil chaadi nilkku! | Land on that rock!', 2.4));
  },
};

const DOWN2 = (x: number): RubbleRect[] => [
  { c0: x + 15, c1: x + 17, top: 10 },
  { c0: x + 18, c1: x + 18, top: 11 },
  { c0: x + 19, c1: x + 21, top: 12 },
  { c0: x + 22, c1: x + 22, top: 13 },
  { c0: x + 23, c1: x + 25, top: 14 },
];
/** KVT-09 act: down to the lagoon again, but every other step is one tile: walk off on to one of those and the
 *  slide carries you over its front edge. Hop over the narrow ones. (Up a plain rock stair first.) */
const downAgain: Act = {
  id: 'kvt09-irangal',
  w: 38,
  advice: 'Down to the lagoon side again, but every other step is a single tile: walk off on to one and the slide takes you straight over its edge. Hop over each narrow step to the wide one below it.',
  paint: (g, c) => {
    const x = c.x;
    g.fill(x + 2, x + 4, 13, 17, '#').fill(x + 5, x + 7, 11, 17, '#');
    g.fill(x + 8, x + 14, 9, 17, '#');
    for (const r of DOWN2(x)) g.fill(r.c0, r.c1, r.top, 17, '#');
    g.pit(x + 26, x + 27);
  },
  build: (w, c) => {
    const { X } = c;
    w.add(new RubbleBank(DOWN2(c.x), 1));
    pool(w, c.x + 26, c.x + 28, 15.3, { colors: LAGOON });
    sign(w, c.x + 12.2, 9 - 4.4, 3.4, 'IRAKKAM', 'wood', 'right', 'lagoon side');
    onPass(w, X(13), (w2) => taraSays(w2, 'Padi padiyaayi nadannu irangu! | Walk down step by step!', 2.4));
  },
};

export const kvt09 = { room: stormBankRoom, acts: [overhang, summit, seaWall, downAgain, breaches] };

// ================================================================== KVT-10: the octopus
const CORAL: Record<string, [string, string]> = {
  pink: ['#E98AA0', '#B85A73'],
  yellow: ['#E9C35A', '#B48E2A'],
  green: ['#7FB77A', '#4E8650'],
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

export const kvt10 = { room: octopusRoom, acts: [midden, tideHoles] };

/** KVT-10's door: the octopus lies across the threshold, the colour of the sand. Its arm is the patch of sand that moves. */
const sandArm: Ending = {
  space: 10,
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
