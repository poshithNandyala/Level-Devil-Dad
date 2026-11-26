import { Entity, type Hazard, type LevelDef, type World } from '../../world';
import { lines as L } from './lines';
import { Door } from '../../entities/basics';
import { Blinker, Thing } from '../../entities/traps';
import { Palm, Sea, Skim, Vent, type PalmOpts } from '../../entities/abilities';
import { Solid } from '../../body';
import { collectible, door, gust, panel, prop, px, rider, rival, roller, shot, sign, thing, water } from '../../levels/kit';
import { Act, G, deco, hiddenGroup, pool } from '../../levels/acts';
import { crumble, onPass } from '../../levels/trolls';
import { DT, ease } from '../../constants';
import { tour } from '../../levels/tour';
import { longStage } from '../../levels/chunks';
import { Grid } from '../../levels/grid';
import { exitTwist } from '../../levels/twists';
import { Nest } from './entities';
import { kvt09, kvt10 } from './encores';
import { CoralStep } from './tide';
import { tara as taraSays } from '../../levels/endkit';

// Kavaratti (bonus): the lagoon, the tide and the boat all keep their own
// timetable. Jeseri words (billam = lagoon, phar = reef, odam = boat,
// supari = lighthouse) in Malayalam/English sentences.

const tara = (n: number, point: 1 | -1 = 1) => ({ intro: L.intro[n % L.intro.length], point, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
const LAGOON: [string, string] = ['rgba(38,190,210,0.78)', 'rgba(13,95,140,0.95)'];

function lagoon(w: World) {
  return water(w, 14.75, { rate: 0, minTy: 14.75, colors: LAGOON, cause: 'splash' });
}


/** A runway light that is really a spike: pops out of the floor as you run up to it. */
function runwayLight(w: World, tx: number) {
  const sp = w.add(new Thing('spikerow', px(tx), px(15) + 1, { solid: false, deadly: 'spikes', layer: -4 }));
  let up = false;
  w.onTick((w2) => {
    if (up || w2.player.x + w2.player.w < px(tx) - 8) return;
    up = true;
    w2.sfx('spikes', px(tx) + 8, px(15));
    sp.moveTo(w2, px(tx), px(15) - 10, 0.06, 'out');
  });
}


// ------------------------------------------------------------------ acts (one per stage, never repeated)
const say = (w: World, line: string, x: number, ty: number, t = 1.3) => w.say(line, x, px(ty), t, 'npc');

/** KVT-02: the gap in the jetty is glass (walk it); the plank after it drops if you land on it; that shell bites. */
const glassJetty: Act = {
  id: 'kvt02-glass',
  w: 34,
  advice: 'The gap in the next jetty is glass: walk across it, because the plank after it drops if you land on it from a jump. Jump the real gap. That shell is a hermit crab.',
  paint: (g, c) => {
    g.pit(c.x + 4, c.x + 25);
    g.fill(c.x + 10, c.x + 11, G, G, '%');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 4, c.x + 26, 15.3, { colors: LAGOON });
    thing(w, 'jetty', c.x + 4, G, { w: px(6) });
    panel(w, c.x + 10, G, 2, 0.35, 'rgba(205,245,255,0.42)', 'rgba(255,255,255,0.75)');
    const b = thing(w, 'jetty', c.x + 12, G, { w: px(4) });
    w.when(
      (w2) => w2.player.landTick === w2.tick && w2.player.isRiding(b.solid),
      (w2) => {
        w2.sfx('crack', b.cx, b.y);
        b.fall(w2, { land: false });
        say(w2, 'Plank poyi! | The plank went!', b.cx, G - 3);
      },
    );
    thing(w, 'jetty', c.x + 18, G, { w: px(8) });
    onPass(w, X(2), (w2) => w2.guide('Gap! Chaadu, Dad! | A gap! Jump, Dad!'));
    // the shell that isn't
    const shell = deco(w, 'shell', X(23) + 2, G, { layer: 2 });
    onPass(w, X(19.5), (w2) => {
      shell.hide();
      roller(w2, 'crab', X(23), px(G) - 10, -95, { cause: 'kvt-pinched' });
      say(w2, 'Njandu! | Crab!', X(23), G - 2.5, 1);
    });
  },
};

/** KVT-03: walk off the jetty: the reef rises under your feet, only if you walk. The last gap is real. */
const faithStones: Act = {
  id: 'kvt03-faith',
  w: 32,
  advice: 'Walk off the end of the jetty: the reef rises under your feet, but only while you walk. The last gap is real water: jump that one.',
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 19);
    g.fill(c.x + 6, c.x + 9, G, G, c.L[0]).fill(c.x + 10, c.x + 13, G, G, c.L[1]).fill(c.x + 14, c.x + 17, G, G, c.L[2]);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 6, c.x + 20, 15.3, { colors: ['rgba(20,110,150,0.92)', 'rgba(8,50,90,0.98)'] });
    // the reef shows as a faint shadow under the water, for those who look
    for (const t of [6, 10, 14]) panel(w, c.x + t, G + 0.3, 4, 0.5, 'rgba(240,220,170,0.16)', 'rgba(0,0,0,0)');
    const stones = [0, 1, 2].map((i) => hiddenGroup(w, c.L[i]));
    for (const st of stones) {
      w.when(
        (w2) => w2.player.onGround && w2.player.x + w2.player.w >= st.solid.x - 1 && w2.player.x < st.solid.x,
        (w2) => {
          st.appear(w2);
          w2.sfx('splash', st.solid.x + 32, st.solid.y);
        },
      );
    }
    thing(w, 'jetty', c.x + 20, G, { w: px(4) });
    sign(w, c.x + 1, G - 4.4, 3.4, 'NO BOATS', 'wood', 'right', 'after sunset');
    onPass(w, X(3), (w2) => w2.guide('Odam illa. Chaadi po! | No boat. Jump across!'));
    thing(w, 'coral', c.x + 21, G - 0.5, { solid: false, layer: -2 });
  },
};

/** KVT-04: the tailwind throws your jumps long: hop to the little island while it's calm, and off it before the next gust. */
const tailwind: Act = {
  id: 'kvt04-tailwind',
  w: 34,
  advice: 'The tailwind throws your jumps long and shoves you along the ground: jump to the little island while it is calm, and leave it before the next gust.',
  paint: (g, c) => {
    g.pit(c.x + 6, c.x + 8).pit(c.x + 14, c.x + 16);
    g.fill(c.x + 19, c.x + 20, G - 1, G - 1, '^');
  },
  build: (w, c) => {
    // a steady tailwind over the first pit (a helping hand), then gusts over the island (not so helpful)
    gust(w, c.x + 4, 9, 5, 7, 95).on = true;
    gust(w, c.x + 13.5, 9, 9, 7, 95, { period: 2.6, on: 1.2, phase: 0.2 });
    sign(w, c.x + 1, G - 4.4, 3.4, 'WIND', 'green', 'right', 'tail, mostly');
    onPass(w, c.X(4), (w2) => w2.guide('Kaattu sahaayikkum, Dad! | The wind will help, Dad!'));
  },
};

/** KVT-05: ride the fish basket up, but get off at the pier before the pulley gets you. */
const fishLift: Act = {
  id: 'kvt05-lift',
  w: 32,
  advice: 'Ride the fish basket up to the pier, and jump off at the top: it keeps hauling up into the pulley.',
  paint: (g, c) => {
    g.pit(c.x + 5, c.x + 7);
    g.fill(c.x + 8, c.x + 22, 7, 17, '#');
    g.fill(c.x + 4, c.x + 8, 1, 1, 'v');
    for (let i = 0; i < 4; i++) g.fill(c.x + 23 + i * 2, c.x + 24 + i * 2, 8 + i * 2, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    const basket = thing(w, 'crate', c.x + 5, G, { w: px(3), h: 12 });
    basket.tint = '#B07A3A';
    let up = false;
    let by = basket.solid.y;
    w.onTick((w2) => {
      if (!up && w2.standing(basket.solid)) {
        up = true;
        w2.sfx('creak', basket.cx, basket.y);
        say(w2, 'Meen kayattunnu! | Hauling the fish up!', basket.cx, G - 3);
      }
      if (up && by > px(2) + 4) {
        by -= 58 * DT;
        basket.place(w2, basket.solid.x, by);
      }
    });
    thing(w, 'beam', c.x + 3.5, 0, { solid: false, layer: -3, w: px(5) });
    sign(w, c.x + 12, 2.6, 3.6, 'FISH PIER', 'wood', 'right', 'Minicoy co-op');
    onPass(w, X(2), (w2) => w2.guide('Basket-il keri, mukalil vare po! | Get in the basket, go all the way up!'));
  },
};

// ================================================================== KVT-06: under the reef (swimming)
/** the sea you can swim in, between two tile columns, its surface at row `ty` */
function sea(w: World, tx0: number, tx1: number, ty: number) {
  return w.add(new Sea(w, px(tx0), px(tx1), px(ty)));
}

/** A jellyfish: pulses up, drifts down, on its own clock. Touch it and you're stung. */
export class Jelly extends Entity {
  y: number;
  hazard: Hazard;
  constructor(
    readonly x: number,
    readonly top: number,
    readonly bottom: number,
    readonly period = 2.6,
    readonly phase = 0,
  ) {
    super();
    this.layer = 4;
    this.y = bottom;
    const self = this;
    this.hazard = { active: true, cause: 'kvt-stung', hits: (x, y, w, h) => x < self.x + 6 && x + w > self.x - 6 && y < self.y + 12 && y + h > self.y - 4 };
  }
  update(w: World) {
    const k = (((w.tick * DT + this.phase) % this.period) + this.period) % this.period / this.period;
    this.y = k < 0.28 ? this.bottom + (this.top - this.bottom) * ease.out(k / 0.28) : this.top + (this.bottom - this.top) * ((k - 0.28) / 0.72);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const t = w.tick * DT;
    const squeeze = 1 + Math.sin(t * 6 + this.phase) * 0.12;
    ctx.fillStyle = 'rgba(240,170,230,0.75)';
    ctx.strokeStyle = 'rgba(160,70,160,0.9)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 6.5 / squeeze, 5 * squeeze, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(220,120,220,0.8)';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(this.x + i * 2.4, this.y);
      ctx.quadraticCurveTo(this.x + i * 2.4 + Math.sin(t * 5 + i) * 2, this.y + 6, this.x + i * 2 + Math.sin(t * 4 + i * 2) * 2.5, this.y + 11);
      ctx.stroke();
    }
  }
}

/** A moray eel in a hole in the reef: it lunges out when you swim close, then slides back in. */
export class Eel extends Entity {
  out = 0;
  state: 'in' | 'lunge' | 'out' | 'back' | 'rest' = 'in';
  private t0 = 0;
  hazard: Hazard;
  constructor(
    readonly x: number,
    readonly base: number,
    /** -1: up out of the sea floor, 1: down out of the reef roof */
    readonly dir: -1 | 1,
    readonly len: number,
  ) {
    super();
    this.layer = 3;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'kvt-bitten',
      hits(x, y, w, h) {
        if (self.out < 0.15) return false;
        const tip = self.base + self.dir * self.len * self.out;
        const y0 = Math.min(self.base, tip),
          y1 = Math.max(self.base, tip);
        return x < self.x + 5 && x + w > self.x - 5 && y < y1 && y + h > y0;
      },
    };
  }
  update(w: World) {
    const p = w.player;
    const dt = w.tick - this.t0;
    switch (this.state) {
      case 'in':
        if (Math.abs(p.cx - this.x) < 30 && Math.abs(p.cy - this.base) < 90) {
          this.state = 'lunge';
          this.t0 = w.tick;
          w.sfx('snap', this.x, this.base);
        }
        break;
      case 'lunge':
        this.out = Math.min(1, dt / 12);
        if (dt >= 12) {
          this.state = 'out';
          this.t0 = w.tick;
        }
        break;
      case 'out':
        this.out = 1;
        if (dt >= 84) {
          this.state = 'back';
          this.t0 = w.tick;
        }
        break;
      case 'back':
        this.out = Math.max(0, 1 - dt / 30);
        if (dt >= 30) {
          this.state = 'rest';
          this.t0 = w.tick;
        }
        break;
      case 'rest':
        this.out = 0;
        if (dt >= 72) this.state = 'in';
        break;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    // the hole
    ctx.fillStyle = '#1E1410';
    ctx.beginPath();
    ctx.ellipse(this.x, this.base, 6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (this.out < 0.05) {
      // two eyes in the dark, if you look
      ctx.fillStyle = 'rgba(255,240,120,0.8)';
      ctx.fillRect(this.x - 2, this.base - this.dir * -0.5 - 0.5, 1, 1);
      ctx.fillRect(this.x + 1, this.base - this.dir * -0.5 - 0.5, 1, 1);
      return;
    }
    const tip = this.base + this.dir * this.len * this.out;
    const t = w.tick * DT;
    ctx.strokeStyle = '#4E5B1F';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.x, this.base);
    ctx.quadraticCurveTo(this.x + Math.sin(t * 9) * 3, (this.base + tip) / 2, this.x, tip);
    ctx.stroke();
    ctx.strokeStyle = '#8C9A3A';
    ctx.lineWidth = 4;
    ctx.stroke();
    // head: open jaws
    ctx.fillStyle = '#6B7A2A';
    ctx.beginPath();
    ctx.ellipse(this.x, tip, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2A0E0E';
    ctx.beginPath();
    ctx.ellipse(this.x, tip + this.dir * 2.5, 3, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFF59D';
    ctx.fillRect(this.x + 1.5, tip - this.dir * 1.5, 1.2, 1.2);
  }
}

/** A green turtle cruising the tunnel the other way: solid, slow, and not moving over for you. */
class Turtle extends Entity {
  solid: Solid;
  constructor(
    x: number,
    y: number,
    readonly vx: number,
    readonly stopAt: number,
  ) {
    super();
    this.layer = 2;
    this.solid = new Solid(x, y, 26, 16);
  }
  update(w: World) {
    if ((this.vx < 0 && this.solid.x <= this.stopAt) || (this.vx > 0 && this.solid.x >= this.stopAt)) return;
    this.solid.moveBy(w, this.vx * DT, 0);
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const s = this.solid;
    const t = w.tick * DT;
    const f = this.vx < 0 ? -1 : 1;
    const cx = s.x + s.w / 2,
      cy = s.y + s.h / 2;
    // flippers
    ctx.fillStyle = '#5E8C4A';
    const fl = Math.sin(t * 4) * 3;
    ctx.beginPath();
    ctx.ellipse(cx + f * 6, cy - 5 + fl, 6, 2.2, f * -0.5, 0, Math.PI * 2);
    ctx.ellipse(cx - f * 7, cy + 5 - fl, 4, 1.8, f * 0.5, 0, Math.PI * 2);
    ctx.fill();
    // shell
    ctx.fillStyle = '#6D4C2F';
    ctx.strokeStyle = '#3E2A18';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 11, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,210,150,0.55)';
    for (const dx of [-5, 0, 5]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy, 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    // head
    ctx.fillStyle = '#7FA65F';
    ctx.beginPath();
    ctx.ellipse(cx + f * 13, cy - 1, 4, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(cx + f * 14.5 - 0.5, cy - 2.2, 1.2, 1.2);
  }
}

/** sea urchins on top of the spike tiles in these columns of row `ty` (they're the spikes, drawn round) */
function urchins(w: World, tx0: number, tx1: number, ty: number) {
  w.add(
    new (class extends Entity {
      draw(ctx: CanvasRenderingContext2D, w2: World) {
        const t = w2.tick * DT;
        for (let tx = tx0; tx <= tx1; tx++) {
          const cx = px(tx) + 8,
            cy = px(ty) + 12;
          ctx.strokeStyle = '#1B1030';
          ctx.lineWidth = 0.9;
          for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2 + Math.sin(t + tx) * 0.05;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 6);
            ctx.stroke();
          }
          ctx.fillStyle = '#3B1F5C';
          ctx.beginPath();
          ctx.arc(cx, cy, 3.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    })(),
  ).layer = -1;
}

/** rock climbing up from row 15 to a rim at row 11: a step at (x..x+1, 13), then the rim (x+2..x+4) */
function rimUp(g: Grid, x: number) {
  g.fill(x, x + 1, 13, 17, '#').fill(x + 2, x + 4, 11, 17, '#');
}
/** and down again: a rim (x..x+2) then a step (x+3..x+4, 13) */
function rimDown(g: Grid, x: number) {
  g.fill(x, x + 2, 11, 17, '#').fill(x + 3, x + 4, 13, 17, '#');
}

/** KVT-06 act 1: the reef roof closes over you. One air pocket, one bubbling crack, and a turtle in the way. */
const reefTunnel: Act = {
  id: 'kvt06-air',
  w: 44,
  advice: 'Under the reef roof there is no surface: swim up into the air pocket, wait for the crack to bubble, go over the turtle, and come up at the far end.',
  paint: (g, c) => {
    const x = c.x;
    rimUp(g, x + 3);
    // the pool, and the reef roof over most of it (right up to the sky: no walking over it)
    g.fill(x + 8, x + 36, 11, 16, '.');
    g.fill(x + 12, x + 33, 0, 12, '#');
    // the air pocket: a hollow in the roof, above the waterline
    g.fill(x + 19, x + 20, 10, 12, '.');
    rimDown(g, x + 37);
    g.fill(x + 42, x + 43, 15, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    sea(w, c.x + 8, c.x + 37, 11.5);
    w.add(new Vent(X(28) + 8, px(13), px(17), { period: 2.4, on: 1.1, phase: 0.3 }));
    // the turtle sets off when you go under the roof
    onPass(w, X(12), (w2) => {
      w2.add(new Turtle(X(33) - 30, px(15) - 6, -26, X(12)));
    });
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'NO AIR', 'warn', null, 'under the reef');
    onPass(w, X(5), (w2) => w2.guide('Shwasam pidichu mungu! | Hold your breath and dive!'));
    onPass(w, X(18), (w2) => say(w2, 'Mukalil kaattu undu! | There’s air up there!', X(19.5), 9, 1.4));
  },
  cps: [],
};

/** KVT-06 act 2: moray eels in the floor and the roof: pass the floor ones high, the roof ones low, the pair dead centre. */
const eelAlley: Act = {
  id: 'kvt06-eels',
  w: 42,
  advice: 'Morays lunge out of the holes as you pass: go over the ones in the floor, under the ones in the roof, and right through the middle where there’s one in each.',
  paint: (g, c) => {
    const x = c.x;
    rimUp(g, x + 3);
    g.fill(x + 8, x + 35, 11, 16, '.');
    g.fill(x + 11, x + 30, 0, 12, '#');
    // the air pocket in the roof (three tiles wide: you can find it in a hurry)
    g.fill(x + 19, x + 21, 10, 12, '.');
    rimDown(g, x + 36);
    g.fill(x + 41, x + 41, 15, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    sea(w, c.x + 8, c.x + 36, 11.5);
    const floor = px(17),
      roof = px(13);
    w.add(new Eel(X(14) + 8, floor, -1, 40));
    w.add(new Eel(X(17) + 8, roof, 1, 40));
    w.add(new Eel(X(24) + 8, floor, -1, 40));
    w.add(new Eel(X(27) + 8, floor, -1, 20));
    w.add(new Eel(X(27) + 8, roof, 1, 20));
    sign(w, c.x + 0.5, G - 4.4, 3.4, 'MORAY', 'warn', null, 'do not feed');
    onPass(w, X(5), (w2) => w2.guide('Eel onnum cheyyilla, Dad! | The eels won’t do a thing, Dad!'));
  },
};

/** KVT-06's room: off the jetty, under the reef wall, past the jellyfish, up the far pier. */
function reefRoom(): LevelDef {
  return {
    id: 'KVT-06',
    city: 'KVT',
    index: 6,
    name: 'Phar Mungal',
    nameEn: 'Diving the reef',
    tagline: 'India’s scuba school. The fish are friendly. The reef is not.',
    hint: 'Jump in: tap to swim up, hold to float, let go to sink. The bubbles over your head are your air. Dive under the reef wall, keep off the urchins, slip past the jellyfish and leap out at the far pier.',
    par: 14,
    scene: { kind: 'water', place: 'Kavaratti lagoon', with: ['lighthouse', 'palms'] },
    map: Grid.ground(15)
      .fill(0, 5, 8, 17, '#')
      .fill(6, 27, 0, 16, '.')
      .fill(13, 14, 0, 12, '#')
      .fill(12, 16, 16, 16, '^')
      .fill(28, 31, 8, 17, '#')
      .put(2, 7, '@')
      .put(30, 7, 'E')
      .rows(),
    build(w: World) {
      door(w);
      sea(w, 6, 28, 9);
      urchins(w, 12, 16, 16);
      w.add(new Jelly(px(19) + 8, px(10), px(16) + 2, 2.6, 0));
      w.add(new Jelly(px(23) + 8, px(10), px(16) + 2, 2.6, 1.3));
      thing(w, 'coral', 8, 16, { solid: false, layer: -3 });
      thing(w, 'coral', 25, 16, { solid: false, layer: -3 });
      sign(w, 1, 4.6, 3.4, 'DIVE', 'wood', 'right', 'Kavaratti');
      rival(w, 3, 8, 1, { intro: L.intro[4], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      onPass(w, px(13), (w2) => say(w2, 'Thazhe kode neenthu! | Swim under it!', px(13.5), 6.5, 1.3));
      onPass(w, px(17), (w2) => say(w2, 'Jelly meen! Thodalle! | Jellyfish! Don’t touch!', px(21), 8.5, 1.3));
      collectible(w, 'shell', 15.5, 13.6);
    },
  };
}

// ================================================================== KVT-07: up the palms (climbing)
/** a palm you can climb, standing at tile column tx (its trunk up the middle), base at y px */
export function palm(w: World, tx: number, baseY: number, height: number, o: PalmOpts = {}): Palm {
  const p = w.add(new Palm(px(tx) + 8, baseY, height, o));
  w.climbables.push(p);
  return p;
}

/** A coconut crab going up and down its palm all day. Meet it on the trunk and you're pinched. */
export class PalmCrab extends Entity {
  s: number;
  dir: 1 | -1;
  hazard: Hazard;
  constructor(
    readonly palm: Palm,
    readonly s0: number,
    readonly s1: number,
    readonly speed: number,
    start: number,
    dir: 1 | -1 = 1,
  ) {
    super();
    this.layer = 2;
    this.s = start;
    this.dir = dir;
    const self = this;
    this.hazard = {
      active: true,
      cause: 'kvt-pinched',
      hits(x, y, w, h) {
        const p = self.palm.point(self.s);
        return x < p.x + 6 && x + w > p.x - 6 && y < p.y + 5 && y + h > p.y - 5;
      },
    };
  }
  update() {
    this.s += (this.dir * this.speed * DT) / this.palm.len;
    if (this.s >= this.s1) {
      this.s = this.s1;
      this.dir = -1;
    } else if (this.s <= this.s0) {
      this.s = this.s0;
      this.dir = 1;
    }
  }
  draw(ctx: CanvasRenderingContext2D, w: World) {
    const p = this.palm.point(this.s);
    const t = w.tick * DT;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(this.dir > 0 ? 0 : Math.PI);
    // legs gripping the trunk
    ctx.strokeStyle = '#B23A2A';
    ctx.lineWidth = 1.4;
    for (let i = -1; i <= 1; i++) {
      const k = Math.sin(t * 14 + i) * 1.2;
      ctx.beginPath();
      ctx.moveTo(-3, i * 2.5);
      ctx.lineTo(-7, i * 3.4 + k);
      ctx.moveTo(3, i * 2.5);
      ctx.lineTo(7, i * 3.4 - k);
      ctx.stroke();
    }
    ctx.fillStyle = '#3949AB';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.4, 5.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // big claws, up the trunk
    ctx.fillStyle = '#E65100';
    ctx.beginPath();
    ctx.ellipse(-3.5, -6.5, 2.4, 1.8, 0.4, 0, Math.PI * 2);
    ctx.ellipse(3.5, -6.5, 2.4, 1.8, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(-1.6, -3.4, 1.2, 1.2);
    ctx.fillRect(0.6, -3.4, 1.2, 1.2);
    ctx.restore();
  }
}

/** KVT-07 act 1: coconut crabs climb up and down the palms. Crowns are safe; trunks are theirs. */
const crabPalms: Act = {
  id: 'kvt07-crabs',
  w: 36,
  advice: 'Coconut crabs go up and down the bare palms. Jump for a bare trunk when its crab is low and heading down, climb high, and leap on to the next crown.',
  paint: (g, c) => {
    g.pit(c.x + 2, c.x + 32);
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 2, c.x + 33, 15.3, { colors: LAGOON });
    // crowned palms to rest on, bare ones in between with a crab each
    palm(w, c.x + 4, px(16), 130, { crownW: 30 });
    const a = palm(w, c.x + 10, px(16), 170, { crown: false });
    palm(w, c.x + 16, px(16), 130, { crownW: 30 });
    const b = palm(w, c.x + 22, px(16), 175, { crown: false });
    palm(w, c.x + 28, px(16), 130, { crownW: 30 });
    w.add(new PalmCrab(a, 0.1, 0.92, 40, 0.6, 1));
    w.add(new PalmCrab(b, 0.1, 0.92, 52, 0.2, 1));
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'CRABS', 'wood', null, 'they climb too');
    onPass(w, X(1), (w2) => w2.guide('Njandu onnum cheyyilla! Kayari po! | The crabs won’t do a thing! Climb on!'));
    onPass(w, X(5), (w2) => say(w2, 'Thenga njandu! Sookshikku! | Coconut crab! Careful!', X(10) + 8, 5, 1.3));
  },
};

/** KVT-07 act 2: young palms bend under you. The first lays you on the island; the second tips you into the sea. */
const bendPalms: Act = {
  id: 'kvt07-bend',
  w: 30,
  advice: 'Young palms bend under your weight. Climb the first all the way and it lays you on the island. The second bends too far: leap off for the bank before its top dips into the sea.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 22);
    g.fill(c.x + 11, c.x + 13, 11, 17, '#');
    g.fill(c.x + 23, c.x + 26, 12, 17, '#');
    g.fill(c.x + 27, c.x + 28, 14, 17, '#');
  },
  build: (w, c) => {
    const { X } = c;
    pool(w, c.x + 3, c.x + 23, 15.3, { colors: LAGOON });
    const y1 = palm(w, c.x + 2, px(15), 140, { bend: 60 });
    const y2 = palm(w, c.x + 13, px(11), 150, { bend: 115, creep: 10 });
    w.flags[c.f('young')] = [y1, y2];
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'YOUNG PALMS', 'green', null, 'please don’t climb');
    onPass(w, X(1), (w2) => w2.guide('Ithu valanju tharum! Mukalil vare kayaru! | It bends for you! Climb right to the top!'));
    w.when(
      (w2) => w2.player.grip === y2 && w2.player.gripS > 0.5,
      (w2) => say(w2, 'Ayyo, valayunnu! | Uh oh, it’s bending!', X(16), 6, 1.2),
    );
  },
};

/** KVT-07's room: a seawall too high to jump. A palm grows beside it. Then palms standing in the inlet. */
function palmRoom(): LevelDef {
  return {
    id: 'KVT-07',
    city: 'KVT',
    index: 7,
    name: 'Thengu Kayaru',
    nameEn: 'Up the palm',
    tagline: 'Coconut country: every islander can climb a palm. Can Dad?',
    hint: 'Jump at a palm to grab it, hold left or right to climb, and keep holding at the top to stand on its crown. Jump to leap off, the way you hold.',
    par: 12,
    map: Grid.ground(15)
      .fill(9, 11, 8, 17, '#')
      .pit(12, 25)
      .put(2, 14, '@')
      .put(29, 14, 'E')
      .rows(),
    build(w: World) {
      door(w);
      pool(w, 12, 26, 15.3, { colors: LAGOON });
      palm(w, 7, px(15), 130);
      palm(w, 15, px(16), 175, { crown: false });
      palm(w, 20, px(16), 165);
      sign(w, 2.5, 10.6, 3.2, 'SEA WALL', 'wood', 'right', 'no ladder');
      rival(w, 4, 15, 1, { intro: L.intro[5], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'shell', 17.5, 4.6);
    },
  };
}

// ================================================================== KVT-08: on the lagoon (running on water)
/** a stretch of lagoon Dad can run on (flat out), with the deadly water under it */
export function skim(w: World, tx0: number, tx1: number, weed: [number, number][] = []): Skim {
  const s = w.add(new Skim(px(tx0), px(tx1), px(15)));
  s.weed = weed.map(([a, b]) => [px(a), px(b)]);
  return s;
}

/** A dolphin leaping in arcs: its back is something to stand on, for a moment. */
export class Dolphin extends Entity {
  solid: Solid;
  /** 0..1 through the leap, or -1 under water */
  k = -1;
  private t0 = 0;
  constructor(
    readonly x0: number,
    readonly x1: number,
    readonly base: number,
    readonly height: number,
    readonly air: number,
    readonly period: number,
    readonly phase = 0,
  ) {
    super();
    this.layer = 2;
    // (a broad back to land on: catching a leaping dolphin is the trick, not landing on a coin)
    this.solid = new Solid(x0, base + 30, 44, 8);
    this.solid.oneWay = true;
    this.solid.collidable = false;
  }
  posAt(k: number) {
    const x = this.x0 + (this.x1 - this.x0) * k;
    const y = this.base - this.height * 4 * k * (1 - k);
    return { x, y };
  }
  update(w: World) {
    const t = ((((w.tick * DT + this.phase) % this.period) + this.period) % this.period);
    const k = t < this.air ? t / this.air : -1;
    this.k = k;
    const s = this.solid;
    if (k < 0) {
      if (s.collidable) {
        s.collidable = false;
        w.emit('fx', s.x + 22, this.base, { kind: 'splash' });
      }
      return;
    }
    const p = this.posAt(k);
    if (!s.collidable) {
      s.place(p.x - 22, p.y - 4);
      s.collidable = true;
      w.sfx('splash', p.x, this.base);
      w.emit('fx', p.x, this.base, { kind: 'splash' });
      return;
    }
    s.velX = (this.x1 - this.x0) / this.air;
    s.moveBy(w, p.x - 22 - s.x - s.xr, p.y - 4 - s.y - s.yr);
  }
  draw(ctx: CanvasRenderingContext2D) {
    if (this.k < 0) return;
    const p = this.posAt(this.k);
    const q = this.posAt(Math.min(1, this.k + 0.02));
    const a = Math.atan2(q.y - p.y, q.x - p.x);
    ctx.save();
    ctx.translate(p.x, p.y + 2);
    ctx.rotate(a);
    ctx.fillStyle = '#607D8B';
    ctx.strokeStyle = '#37474F';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#CFD8DC';
    ctx.beginPath();
    ctx.ellipse(1, 2.5, 13, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // fin, beak, tail
    ctx.fillStyle = '#546E7A';
    ctx.beginPath();
    ctx.moveTo(-2, -5);
    ctx.lineTo(-7, -11);
    ctx.lineTo(-8, -4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-25, -5);
    ctx.lineTo(-24, 5);
    ctx.fill();
    ctx.fillStyle = '#90A4AE';
    ctx.beginPath();
    ctx.ellipse(20, 1, 4, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(13, -2, 1.4, 1.4);
    ctx.restore();
  }
}

/** KVT-08 act 1: seaweed beds slow you to a crawl (and down you go): jump them. The last one drifts at you. */
const weedBeds: Act = {
  id: 'kvt08-weed',
  w: 34,
  advice: 'Dark patches are seaweed: they slow you down, and slow means sunk. Jump every one. The last bed drifts towards you.',
  paint: (g, c) => {
    g.pit(c.x + 3, c.x + 19).pit(c.x + 22, c.x + 30);
  },
  build: (w, c) => {
    const { X } = c;
    skim(w, c.x + 3, c.x + 20, [
      [c.x + 8, c.x + 10],
      [c.x + 14, c.x + 16.5],
    ]);
    const s2 = skim(w, c.x + 22, c.x + 31, [[c.x + 28, c.x + 30]]);
    // the last bed drifts towards you once you're running at it
    onPass(w, X(22), (w2) => {
      w2.onTick(() => {
        const wd = s2.weed[0];
        if (wd[0] <= X(25.5)) return;
        wd[0] -= 32 * DT;
        wd[1] -= 32 * DT;
      });
    });
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'SEAWEED', 'green', null, 'protected');
    onPass(w, X(1), (w2) => w2.guide('Pachcha vellam, onnum illa! Odu! | Green water, nothing to it! Run!'));
  },
};

/** KVT-08 act 2: a seaweed bed too wide to jump. The dolphins leap right across it: ride one. */
const dolphinRide: Act = {
  id: 'kvt08-dolphins',
  w: 38,
  advice: 'The seaweed bed is too wide to jump. Wait on the sand for a dolphin to leap, run out and jump on its back as it rises, and jump off at the top. Then the next one.',
  paint: (g, c) => {
    // (the sandbar between the two weed beds is five tiles: room to come down off a dolphin you left late)
    g.pit(c.x + 3, c.x + 15).pit(c.x + 21, c.x + 33);
  },
  build: (w, c) => {
    const { X } = c;
    skim(w, c.x + 3, c.x + 16, [[c.x + 5, c.x + 16]]);
    skim(w, c.x + 21, c.x + 34, [[c.x + 21, c.x + 32.5]]);
    const d1 = w.add(new Dolphin(X(4), X(14.5), px(15) + 4, 70, 1.45, 3.4, 0));
    const d2 = w.add(new Dolphin(X(21.5), X(32.5), px(15) + 4, 76, 1.5, 3.4, 1.7));
    w.flags[c.f('dolphins')] = [d1, d2];
    sign(w, c.x + 0.2, G - 4.4, 3.4, 'DOLPHINS', 'wood', null, 'do not ride');
    onPass(w, X(1), (w2) => w2.guide('Dolphin-inte purathu kayaru! | Ride the dolphin!'));
  },
};

/** KVT-08's room: the lagoon holds you up while you run flat out. Stop on the sandbar; hop the rock. */
function lagoonRoom(): LevelDef {
  return {
    id: 'KVT-08',
    city: 'KVT',
    index: 8,
    name: 'Billam Ottam',
    nameEn: 'Running on the lagoon',
    tagline: 'Run fast enough and the lagoon holds you up. Stop, and it doesn’t.',
    hint: 'Hold the way you’re going and never let go: flat out, the lagoon holds you up. Slow down, stop or turn on the water and you sink. Don’t stop on the sandbar either: it goes under the moment you stand on it. Hop the rock.',
    par: 9,
    scene: { kind: 'water', place: 'Bangaram lagoon', with: ['palms'] },
    map: Grid.ground(15).pit(6, 14).pit(17, 27).fill(22, 22, 14, 17, '#').fill(15, 16, 15, 17, 's').put(2, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      door(w);
      skim(w, 6, 15);
      skim(w, 17, 28);
      // the sandbar is only there at low tide: stand still on it and it goes under, and the lagoon closes over it
      const bar = crumble(w, 's', 0.45);
      w.when(() => !bar.solid.collidable, (w2) => void skim(w2, 15, 17));
      thing(w, 'coral', 22, 13.5, { solid: false, layer: 2, dx: -8 });
      sign(w, 3.5, 10.6, 3.2, 'ODU!', 'wood', 'right', 'run, don’t stop');
      prop(w, 'palm', 1, 15, { h: 70, lean: 6 });
      rival(w, 4, 15, 1, { intro: L.intro[6], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'shell', 19.5, 11.6);
    },
  };
}

export const levels = (): LevelDef[] => [
  tour({
    id: 'KVT-01',
    city: 'KVT',
    name: "Swagatham, Billam",
    nameEn: "Welcome to Kavaratti",
    tagline: "Coral sand, a glass-clear lagoon and boats that run on a timetable.",
    lines: [
      "Kavaratti-ilekku swagatham, Dad! | Welcome to Kavaratti, Dad!",
      "Ithu Lakshadweep-nte thalasthaanam! | This is the capital of Lakshadweep!",
      "Lakshadweep ennaal oru laksham dweepu! | Lakshadweep means 'a lakh islands'... there are only 36!",
      "Ithu India-yile ettavum cheriya UT! | It's India's smallest union territory!",
      "Ivide tuna pidikkunnathu choondayil! | Tuna here is caught by pole and line, one fish at a time.",
      "Sheri Dad, ini kali sharikkum! | Okay Dad, now the real game!",
    ],
    shouts: [
      [21, "Meen! Fresh tuna! | Fish! Fresh tuna!"],
      [88, "Odam ippo pokum! | The boat leaves now!"],
    ],
    ride: "odam",
    item: "shell",
    signs: [[8, "KAVARATTI", "jetty"], [55, "LAGOON", "glass bottom boats"], [102, "AGATTI", "by boat"]],
    props: [
      ["palm", 2, { h: 78, lean: 7 }],
      ["palm", 22, { h: 86, lean: -4 }],
      ["boat", 36, {}],
      ["palm", 64, { h: 80, lean: 5 }],
      ["palm", 104, { h: 90, lean: -6 }],
    ],
    things: [["crab", 33], ["coral", 61], ["crab", 91]],
    hint: 'Coming along the jetty, a turtle nest on the beach below hatches. Never step on a baby turtle, and they spread wider than any jump: stop on the jetty and let every one of them reach the water. Then the coral step out to the boat: the tide is dropping, and it shrinks from three tiles to its one-tile top as you come. Wait at the water’s edge till it has, then hop on to the top and off to the beach.',
    // the lagoon inlet at the end of the beach is real water now, with the coral step in the middle of it
    paint: (g) => void g.pit(82, 87),
    cps: [32.5, 38.5, 51.5, 75.5, 89.5],
    extra: (w) => {
      pool(w, 82, 88, 15.3, { colors: LAGOON });
      const step = w.add(new CoralStep(84, 15));
      // the tide turns as you come down the beach to it
      onPass(w, px(78.5), (w2) => step.turn(w2));
      w.onTick((w2) => {
        w2.flags.coral = step.t < 0 ? 'wide' : step.settled ? 'top' : 'shrinking';
      });
      onPass(w, px(77.5), (w2) => taraSays(w2, 'Padi valuthaanu! Odi chaadu! | The step’s big! Run and jump!', 2.4));
      // the nest below the jetty steps hatches as you cross the jetty
      const nest = Nest.place(w, { tx: 77, groundTy: 15, waterTx: 82 });
      onPass(w, px(64), (w2) => nest.hatch(w2));
      w.flags.nest = 0;
      w.onTick((w2) => {
        if (nest.done) w2.flags.nest = 1;
      });
    },
  }),
  longStage({
    base: {
    id: 'KVT-02',
    city: 'KVT',
    index: 2,
    name: 'Odam Gone',
    nameEn: 'The boat’s gone',
    tagline: 'The boat waits for the tide, never for your jump.',
    hint: 'One jetty plank is rotten: jump it. The boat leaves when it sees you coming; it always comes back, and stays a moment. Wait for it, but not on the last two planks: stand there and they go too.',
    par: 6,
    map: Grid.ground().pit(5, 31).put(2, 14, '@').put(20, 12, 'E').rows(),
    build(w: World) {
      lagoon(w);
      const d = door(w);
      thing(w, 'jetty', 5, 13, { w: px(6) });
      const rotten = thing(w, 'jetty', 11, 13, { w: px(2) });
      thing(w, 'jetty', 13, 13, { w: px(3) });
      // the last two planks, by the boat, are as old as the rotten one: stand there waiting and they go
      const end = thing(w, 'jetty', 16, 13, { w: px(2) });
      let stood = 0,
        gone = false;
      w.onTick((w2) => {
        if (gone) return;
        stood = w2.standing(end.solid) ? stood + 1 : 0;
        if (stood === 72) w2.sfx('creak', end.cx, end.y);
        if (stood >= 96) {
          gone = true;
          w2.sfx('crack', end.cx, end.y);
          end.fall(w2, { delay: 0, land: false });
        }
      });
      let broke = false;
      w.when(
        (w2) => !broke && w2.standing(rotten.solid),
        () => {
          broke = true;
          w.sfx('crack', rotten.cx, rotten.y);
          rotten.fall(w, { delay: 0.06, land: false });
        },
      );
      const boat = thing(w, 'odam', 18, 13, { dx: 6, dy: 4, bob: 0 });
      const dockX = boat.x;
      void d;
      let mode: 'docked' | 'away' | 'ferry' = 'docked';
      // aboard at last: the boat takes you across the lagoon to the beach road
      w.when(
        (w2) => mode === 'docked' && w2.standing(boat.solid),
        (w2) => {
          mode = 'ferry';
          w2.say('Pokaam! | Off we go!', boat.cx, boat.y - 40, 1, 'npc');
          w2.after(0.35, () => boat.moveTo(w2, px(28), boat.y, 1.6, 'inOut', () => (w2.flags.ferried = 1)));
        },
      );
      const sail = () => {
        mode = 'away';
        w.sfx('splash', boat.cx, boat.y);
        boat.moveTo(w, px(28), boat.y, 1.2, 'inOut', () =>
          w.after(0.9, () =>
            boat.moveTo(w, dockX, boat.y, 1.4, 'inOut', () => {
              mode = 'docked';
              w.say('Odam ready! | Boat\'s ready!', boat.cx, boat.y - 40, 1, 'npc');
              w.after(1.3, () => {
                if (mode === 'docked' && !w.standing(boat.solid)) sail();
              });
            }),
          ),
        );
      };
      w.when(
        (w2) => mode === 'docked' && w2.player.x >= px(14) && !w2.standing(boat.solid) && !w.flags.sailed,
        () => {
          w.flags.sailed = true;
          w.say('Odam pokunnu! | The boat is leaving!', boat.cx, boat.y - 40, 1.2, 'npc');
          sail();
        },
      );
      prop(w, 'palm', 2, 15, { h: 64, lean: 8 });
      rival(w, 4, 15, 1, tara(0, 1));
      collectible(w, 'shell', 11.5, 10);
      void Door;
    },
  },
    par: 20,
    acts: [glassJetty],
    twist: 'kvt-loading',
  }),
  longStage({
    base: {
    id: 'KVT-03',
    city: 'KVT',
    index: 3,
    name: 'Supari Light',
    nameEn: 'Lighthouse on the island',
    tagline: 'The lighthouse beam builds your bridge. For a moment.',
    hint: 'Each step of light lasts as long as the beam is on it. Move with the sweep. On the island, the nearer door is a fake.',
    par: 5,
    map: Grid.ground().pit(7, 24).put(3, 14, '@').put(30, 14, 'E').rows(),
    build(w: World) {
      lagoon(w);
      door(w);
      const fake = w.add(new Door(30, 14));
      fake.fake = true;
      const steps: [number, number][] = [
        [8, 216],
        [12, 204],
        [16, 216],
        [20, 204],
      ];
      steps.forEach(([tx, y], i) => w.add(new Blinker('beam', px(tx), y, { period: 2.8, on: 1.5, phase: (2.8 - i * 0.55) % 2.8 }, { w: px(3) })));
      thing(w, 'lighthouse', 25, 9, { solid: false, layer: -3, dx: -4 });
      prop(w, 'palm', 2, 15, { h: 66, lean: 6 });
      sign(w, 4, 10.6, 3.2, 'SUPARI', 'wood', 'right', 'follow the light');
      rival(w, 26, 15, 1, tara(1, 1));
      collectible(w, 'shell', 14.5, 9.5);
    },
  },
    par: 19,
    twist: 'kvt-reflection',
    acts: [faithStones],
  }),
  longStage({
    base: {
    id: 'KVT-04',
    city: 'KVT',
    index: 4,
    name: 'Agatti Airstrip',
    tagline: 'One runway, one flight a day, and the whole island watching.',
    hint: 'The runway lights pop up as spikes the moment you reach them: jump each one. Hop the baggage tug. When the propellers start, the wind shoves you back towards the last light, so walk between the gusts.',
    par: 5,
    scene: { kind: 'water', place: 'Agatti', with: ['plane', 'palms'] },
    map: Grid.ground().put(2, 14, '@').put(29, 14, 'E').rows(),
    build(w: World) {
      door(w);
      for (const tx of [7, 12, 24]) runwayLight(w, tx);
      let tug = false;
      w.onTick((w2) => {
        if (tug || w2.player.x < px(4)) return;
        tug = true;
        rider(w2, 'jeep', px(33), 15, -140, 4);
        w2.say('Luggage varunnu! | Luggage coming through!', px(28), px(12), 1.1, 'npc');
      });
      // prop wash: the plane's propellers blow you back down the runway
      const wash = gust(w, 22, 10, 7, 5, -230, { period: 2.2, on: 0.8, phase: 0.3 });
      void wash;
      sign(w, 24, 10.4, 3.2, 'AGATTI', 'green', 'right', 'arrivals');
      rival(w, 27, 15, -1, { intro: L.intro[2], point: -1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'shell', 15, 10.8);
    },
  },
    par: 15,
    acts: [tailwind],
    twist: 'kvt-glider',
  }),
  longStage({
    base: {
    id: 'KVT-05',
    city: 'KVT',
    index: 5,
    name: 'Minicoy Tuna',
    tagline: 'Pole-and-line tuna fishing: the fish come out of the sea and fly over your head.',
    hint: 'Tuna fly low over the pier from the fishing boat: hop them. Ride the bobbing boat across the bay, then climb the lighthouse steps. Gulls sweep across the steps, so time each hop.',
    par: 13,
    scene: { kind: 'water', place: 'Minicoy', with: ['lighthouse'] },
    // the lighthouse steps zigzag up, each one overlapping the one below it by a tile
    map: Grid.ground(13).pit(10, 21, 13).fill(24, 26, 11, 11, '=').fill(26, 28, 9, 9, '=').fill(24, 26, 7, 7, '=').fill(26, 31, 5, 5, '=').put(2, 12, '@').put(30, 4, 'E').rows(),
    build(w: World) {
      door(w);
      lagoon(w);
      // tuna flung over the pier, every 1.3 s
      const fling = () => {
        if (w.state !== 'play') return;
        // (flat and at head height, the length of the pier: a fish to hop, not a guess)
        if (w.player.x < px(10)) shot(w, 'kvt-tuna', px(10), 197, -170, 0, 0, 'hit');
        w.after(1.3, fling);
      };
      w.when(
        (w2) => w2.player.x >= px(3.5),
        () => fling(),
      );
      // the ferry: a bobbing boat that goes back and forth across the bay
      const boat = thing(w, 'odam', 10, 0, { dy: 216 });
      const P = 4.6;
      w.onTick((w2) => {
        const t = w2.tick * DT;
        const m = (t % P) / P;
        const k = m < 0.5 ? m * 2 : 2 - m * 2;
        const e = k * k * (3 - 2 * k);
        boat.place(w2, px(10) + e * px(7.5), 216 + Math.sin(t * 3) * 2);
      });
      // gulls along the steps
      let gulls = 0;
      w.onTick((w2) => {
        const p = w2.player;
        if (gulls === 0 && p.x >= px(22) && p.y < px(12)) {
          gulls = 1;
          w2.after(0.2, () => shot(w2, 'crow', px(33), px(9) - 12, -150, 0, 0, 'hit'));
        } else if (gulls === 1 && p.y < px(8)) {
          gulls = 2;
          w2.after(0.1, () => shot(w2, 'crow', px(33), px(5) - 12, -150, 0, 0, 'hit'));
        }
      });
      rival(w, 25, 7, 1, { intro: L.intro[3], point: 1, introAt: 0.5, taunts: L.taunt, beaten: L.beaten[0] });
      collectible(w, 'shell', 6, 9.6);
    },
  },
    // the way on is over the top of the lighthouse: a wall, then steps down to the beach road
    join: (g) => g.fill(32, 33, 5, 17, '#').fill(34, 35, 7, 17, '#').fill(36, 37, 9, 17, '#').fill(38, 39, 11, 17, '#').fill(40, 41, 13, 17, '#'),
    joinW: 12,
    par: 24,
    acts: [fishLift],
    twist: 'kvt-trapdoor',
  }),
  longStage({
    base: reefRoom(),
    // off the far pier and down the rocks to the beach
    join: (g) => g.fill(32, 33, 10, 17, '#').fill(34, 35, 12, 17, '#').fill(36, 37, 14, 17, '#'),
    joinW: 8,
    par: 48,
    acts: [reefTunnel, eelAlley],
    twist: 'kvt-safetystop',
  }),
  longStage({
    base: palmRoom(),
    par: 38,
    acts: [crabPalms, bendPalms],
    twist: 'kvt-pushoff',
  }),
  longStage({
    base: lagoonRoom(),
    par: 24,
    acts: [weedBeds, dolphinRide],
    twist: 'kvt-footsteps',
  }),
  longStage({
    base: kvt09.room(),
    // down off the crest to the shore road
    join: (g) => g.fill(32, 33, 15, 17, '#'),
    joinW: 2,
    par: 32,
    acts: kvt09.acts,
    twist: 'kvt-buried-door',
    shape: 'long',
    lives: 'act',
    meta: { family: 'storm-bank-rubble-slides', betrayals: ['rubble-slide'], ending: 'kvt-buried-door' },
  }),
  longStage({
    base: kvt10.room(),
    par: 22,
    acts: kvt10.acts,
    twist: 'kvt-sand-arm',
    shape: 'long',
    lives: 'act',
    meta: { family: 'camouflage-twin-creature', betrayals: ['camouflage-twin'], ending: 'kvt-sand-arm' },
  }),
];
